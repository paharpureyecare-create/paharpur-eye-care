import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  User
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  writeBatch,
  runTransaction,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Firestore,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ERPUser, UserRole } from '../types';

// 1. Initialize Firebase App singleton
export const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Auth
export const auth = getAuth(app);

// 3. Initialize Firestore with specified firestoreDatabaseId and multi-tab offline persistence
let dbInstance: Firestore;
try {
  const dbId = (firebaseConfig as any).firestoreDatabaseId;
  if (dbId) {
    dbInstance = initializeFirestore(
      app,
      {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      },
      dbId
    );
  } else {
    dbInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  }
} catch (err: any) {
  // If already initialized, fetch the existing instance
  const dbId = (firebaseConfig as any).firestoreDatabaseId;
  dbInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
}

export const db: Firestore = dbInstance;

export type CloudSyncStatus = 'online' | 'offline' | 'syncing' | 'synced' | 'error';

export interface FirebaseConnectionInfo {
  isConfigured: boolean;
  projectId: string;
  databaseId: string;
  status: CloudSyncStatus;
  lastSyncTime: string | null;
  errorMessage: string | null;
}

export const getFirebaseConnectionInfo = (): FirebaseConnectionInfo => {
  const cfg = firebaseConfig as any;
  return {
    isConfigured: Boolean(cfg?.projectId && cfg?.apiKey),
    projectId: cfg?.projectId || '',
    databaseId: cfg?.firestoreDatabaseId || '(default)',
    status: navigator.onLine ? 'online' : 'offline',
    lastSyncTime: null,
    errorMessage: null
  };
};

// ==========================================
// AUTHENTICATION HELPERS
// ==========================================

export const loginWithEmail = async (email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const registerWithEmail = async (email: string, pass: string) => {
  return await createUserWithEmailAndPassword(auth, email, pass);
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return await signInWithPopup(auth, provider);
};

export const logoutUser = async () => {
  return await firebaseSignOut(auth);
};

/**
 * Ensures there is an active Firebase Auth user session.
 * If not signed in, attempts anonymous sign-in or returns null.
 */
export const ensureFirebaseAuth = async (): Promise<User | null> => {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    return null;
  }
};

export const sendStaffPasswordResetEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true, message: `Password reset instructions sent to ${email.trim()}. Please check inbox or spam.` };
  } catch (err: any) {
    console.error('Password reset email error:', err);
    let msg = err.message || 'Failed to send password reset email.';
    if (err.code === 'auth/user-not-found') {
      msg = 'No user registered with this email address.';
    } else if (err.code === 'auth/invalid-email') {
      msg = 'Invalid email address format.';
    }
    return { success: false, message: msg };
  }
};

export const createStaffAuthAccount = async (email: string, pass: string): Promise<{ success: boolean; uid?: string; error?: string }> => {
  try {
    const secondaryAppName = 'SecondaryAuthApp_' + Date.now();
    const secApp = initializeApp(firebaseConfig, secondaryAppName);
    const secAuth = getAuth(secApp);
    const cred = await createUserWithEmailAndPassword(secAuth, email.trim(), pass);
    const uid = cred.user.uid;
    await firebaseSignOut(secAuth);
    return { success: true, uid };
  } catch (err: any) {
    console.error('Create staff auth account error:', err);
    return { success: false, error: err.message || 'Failed to create Firebase Auth account' };
  }
};

// ==========================================
// FIRESTORE GENERIC DOCUMENT HELPERS
// ==========================================

export const sanitizeForFirestore = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      clean[k] = sanitizeForFirestore(v);
    }
  }
  return clean;
};

/**
 * Saves a single document to Firestore with updatedAt timestamp
 */
export const saveCloudDocument = async <T extends { id?: string; [key: string]: any }>(
  collectionName: string,
  docId: string,
  data: T,
  userEmail = 'system'
): Promise<boolean> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const payload = sanitizeForFirestore({
      ...data,
      id: docId,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail
    });
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err: any) {
    console.warn(`Firestore save error [${collectionName}/${docId}]:`, err?.message || err);
    return false;
  }
};

/**
 * Loads a single document from Firestore
 */
export const loadCloudDocument = async <T>(collectionName: string, docId: string): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as T;
    }
    return null;
  } catch (err: any) {
    console.warn(`Firestore getDoc error [${collectionName}/${docId}]:`, err);
    return null;
  }
};

/**
 * Loads all documents from a Firestore collection
 */
export const loadCloudCollection = async <T>(collectionName: string): Promise<T[]> => {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    const items: T[] = [];
    snap.forEach(d => {
      items.push(d.data() as T);
    });
    return items;
  } catch (err: any) {
    console.warn(`Firestore load error [${collectionName}]:`, err?.message || err);
    return [];
  }
};

/**
 * Subscribes in real-time to a Firestore collection
 */
export const subscribeCloudCollection = <T>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    snapshot => {
      const items: T[] = [];
      snapshot.forEach(d => {
        items.push(d.data() as T);
      });
      onData(items);
    },
    error => {
      console.warn(`Firestore snapshot error on ${collectionName}:`, error);
      if (onError) onError(error);
    }
  );
};

/**
 * Deletes a single document from Firestore
 */
export const deleteCloudDocument = async (collectionName: string, docId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (err: any) {
    console.warn(`Firestore delete error [${collectionName}/${docId}]:`, err);
    return false;
  }
};

// ==========================================
// BATCH MIGRATION & EXPORT ENGINE
// ==========================================

export interface MigrationEntityPreview {
  collection: string;
  sourceCount: number;
  existingCloudCount: number;
  toImportCount: number;
  status: 'pending' | 'migrated' | 'skipped' | 'error';
}

export interface MigrationReport {
  totalEntities: number;
  totalRecordsProcessed: number;
  imported: number;
  skipped: number;
  duplicatesFound: number;
  failed: number;
  timestamp: string;
  details: Record<string, { count: number; status: string; error?: string }>;
}

/**
 * Safely migrates an array of records in chunks of 200 (well within Firestore 500 limit)
 */
export const migrateCollectionChunked = async <T extends { [key: string]: any }>(
  collectionName: string,
  records: T[],
  idField: keyof T,
  onProgress?: (progressPercent: number) => void
): Promise<{ success: boolean; imported: number; failed: number; error?: string }> => {
  if (!records || records.length === 0) {
    return { success: true, imported: 0, failed: 0 };
  }

  // Pre-validate that we have an active authenticated user session
  let user = auth.currentUser;
  if (!user) {
    user = await ensureFirebaseAuth();
  }

  if (!user) {
    const errorMsg = 'Authentication required before synchronizing to Cloud Firestore. Please log in.';
    console.warn(`Migration deferred on ${collectionName}: ${errorMsg}`);
    return { success: false, imported: 0, failed: records.length, error: errorMsg };
  }

  const CHUNK_SIZE = 150;
  let imported = 0;
  let failed = 0;

  try {
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      for (const item of chunk) {
        const rawId = item[idField] || (item as any).id || (item as any).mrd || (item as any).orderId || (item as any).invoiceNumber;
        if (!rawId) continue;
        const docId = String(rawId).replace(/[\/\s#\?]/g, '_');
        const docRef = doc(db, collectionName, docId);
        const payload = sanitizeForFirestore({
          ...item,
          id: docId,
          migratedAt: new Date().toISOString()
        });
        batch.set(docRef, payload, { merge: true });
        imported++;
      }

      await batch.commit();

      if (onProgress) {
        const pct = Math.min(100, Math.round(((i + chunk.length) / records.length) * 100));
        onProgress(pct);
      }
    }

    return { success: true, imported, failed };
  } catch (err: any) {
    console.error(`Migration error on ${collectionName}:`, err?.message || err);
    return { success: false, imported, failed: records.length - imported, error: err?.message || 'Batch commit failed' };
  }
};

// ==========================================
// USER MANAGEMENT & ROLE-BASED ACCESS
// ==========================================

export const loadERPUsers = async (): Promise<ERPUser[]> => {
  try {
    const colRef = collection(db, 'users');
    const snap = await getDocs(colRef);
    const users: ERPUser[] = [];
    snap.forEach(d => {
      users.push(d.data() as ERPUser);
    });
    return users;
  } catch (err) {
    console.warn('Error loading ERP users:', err);
    return [];
  }
};

export const saveERPUser = async (user: ERPUser): Promise<boolean> => {
  try {
    const docRef = doc(db, 'users', user.uid);
    const payload = sanitizeForFirestore({
      ...user,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving ERP user:', err);
    return false;
  }
};

export const deleteERPUser = async (uid: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'users', uid);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting ERP user:', err);
    return false;
  }
};

export const toggleERPUserStatus = async (uid: string, status: 'Active' | 'Disabled'): Promise<boolean> => {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, { status, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error updating ERP user status:', err);
    return false;
  }
};
