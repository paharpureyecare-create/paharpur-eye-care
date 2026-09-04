import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// In-Memory Token Cache (Never stored in localStorage/sessionStorage as per security mandates)
let inMemoryAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file'
];

export interface GoogleAuthResult {
  email: string;
  name: string;
  photoUrl?: string;
  accessToken: string;
  expiresIn: number;
}

/**
 * Stores the OAuth access token in volatile memory only.
 */
export const setCachedToken = (token: string, expiresInSeconds = 3600) => {
  inMemoryAccessToken = token;
  tokenExpiresAt = Date.now() + (expiresInSeconds - 60) * 1000;
};

export const getCachedToken = (): string | null => {
  if (!inMemoryAccessToken) return null;
  if (Date.now() > tokenExpiresAt) {
    inMemoryAccessToken = null;
    return null;
  }
  return inMemoryAccessToken;
};

export const clearCachedToken = () => {
  inMemoryAccessToken = null;
  tokenExpiresAt = 0;
};

export const isTokenExpired = (): boolean => {
  if (!inMemoryAccessToken) return true;
  return Date.now() > tokenExpiresAt;
};

/**
 * Initiates the Google OAuth authorization flow.
 * Forces the Google Account Chooser screen (`prompt: 'select_account'`)
 * so the user can dynamically choose ANY Google Account / Gmail on their device.
 * No hardcoded emails or predefined accounts are used.
 */
export const initiateGoogleOAuth = async (preferGSI = false): Promise<GoogleAuthResult> => {
  // If user explicitly requests Google Identity Services client or in environments where GSI is ready
  if (preferGSI && typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
    return await requestTokenViaGSI();
  }

  try {
    const provider = new GoogleAuthProvider();
    GOOGLE_SCOPES.forEach(scope => provider.addScope(scope));

    // CRITICAL: prompt 'select_account' forces Google to show all accounts on PC/phone
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    const userCredential = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(userCredential);
    const accessToken = credential?.accessToken;

    if (!accessToken) {
      throw new Error('Google OAuth succeeded but no access token was returned.');
    }

    const email = userCredential.user.email;
    if (!email) {
      throw new Error('Could not retrieve authenticated Gmail address from Google account.');
    }

    const displayName = userCredential.user.displayName || email.split('@')[0];
    const photoUrl = userCredential.user.photoURL || undefined;

    // Cache token in memory
    setCachedToken(accessToken, 3600);

    return {
      email,
      name: displayName,
      photoUrl,
      accessToken,
      expiresIn: 3600
    };
  } catch (err: any) {
    // Gracefully handle user cancellation (closing popup window)
    if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
      const cancelError: any = new Error('Google sign-in popup was closed.');
      cancelError.isCancelled = true;
      throw cancelError;
    }

    // Gracefully handle browser popup blocker
    if (err?.code === 'auth/popup-blocked') {
      const blockedError: any = new Error('Google sign-in popup was blocked by your browser. Please allow popups for this site.');
      blockedError.isBlocked = true;
      throw blockedError;
    }

    // Do NOT automatically call requestTokenViaGSI() in the catch block here,
    // because the user gesture activation is already expired, which causes the browser
    // to block the secondary popup with [GSI_LOGGER] Failed to open popup window.
    console.warn('Firebase signInWithPopup notice:', err?.message || err);
    throw new Error(err?.message || 'Google OAuth Authorization failed.');
  }
};

/**
 * Direct authorization via Google Identity Services Token Client.
 * When called directly from a click handler, the browser popup blocker will not intercept it.
 */
export const requestTokenViaGSI = (): Promise<GoogleAuthResult> => {
  return new Promise((resolve, reject) => {
    try {
      const google = (window as any).google;
      if (!google?.accounts?.oauth2) {
        return reject(new Error('Google Identity Services client is not loaded yet. Please wait a moment or refresh.'));
      }

      let hasSettled = false;

      const client = google.accounts.oauth2.initTokenClient({
        client_id: firebaseConfig.oAuthClientId,
        scope: GOOGLE_SCOPES.join(' ') + ' email profile',
        prompt: 'select_account',
        error_callback: (error: any) => {
          if (!hasSettled) {
            hasSettled = true;
            const message = error?.message || error?.type || 'Popup closed or blocked by browser.';
            const isBlocked = typeof message === 'string' && (message.includes('popup') || message.includes('block'));
            const cancelError: any = new Error(isBlocked ? 'Google sign-in popup was blocked or closed.' : message);
            cancelError.isCancelled = true;
            reject(cancelError);
          }
        },
        callback: async (response: any) => {
          if (hasSettled) return;
          if (response.error) {
            hasSettled = true;
            if (response.error === 'access_denied') {
              const cancelError: any = new Error('Google sign-in was cancelled.');
              cancelError.isCancelled = true;
              return reject(cancelError);
            }
            return reject(new Error(`Google OAuth error: ${response.error_description || response.error}`));
          }
          if (!response.access_token) {
            hasSettled = true;
            return reject(new Error('No access token returned from Google Identity Services.'));
          }

          hasSettled = true;
          const accessToken = response.access_token;
          setCachedToken(accessToken, response.expires_in || 3600);

          // Fetch authenticated user profile dynamically from Google
          try {
            const userProfileRes = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            const profileData = await userProfileRes.json();
            const email = profileData?.user?.emailAddress;
            const name = profileData?.user?.displayName || email?.split('@')[0] || 'Google User';

            if (email) {
              return resolve({
                email,
                name,
                photoUrl: profileData?.user?.photoLink,
                accessToken,
                expiresIn: response.expires_in || 3600
              });
            }
          } catch (_) {}

          try {
            const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            const infoData = await infoRes.json();
            if (infoData?.email) {
              return resolve({
                email: infoData.email,
                name: infoData.name || infoData.email.split('@')[0],
                photoUrl: infoData.picture,
                accessToken,
                expiresIn: response.expires_in || 3600
              });
            }
          } catch (_) {}

          resolve({
            email: 'Google Account',
            name: 'Google User',
            accessToken,
            expiresIn: response.expires_in || 3600
          });
        }
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (e: any) {
      reject(e);
    }
  });
};

/**
 * Disconnects the current Google Account.
 * Clears Firebase auth session and in-memory cache.
 * Note: Never deletes ERP data or Google Sheets content.
 */
export const disconnectGoogleOAuth = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out warning:', e);
  } finally {
    clearCachedToken();
  }
};
