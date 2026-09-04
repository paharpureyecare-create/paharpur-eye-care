import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import {
  X,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  UserCheck,
  Building
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    firebaseUser,
    loginWithEmailAccount,
    logoutAccount,
    sendPasswordReset,
    loginWithGoogleAccount,
    role
  } = useErp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'login' | 'forgot' | 'profile'>(
    firebaseUser ? 'profile' : 'login'
  );
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setStatusMessage({ text: 'Please enter both email and password.', type: 'error' });
      return;
    }
    setLoading(true);
    setStatusMessage(null);

    const result = await loginWithEmailAccount(email.trim(), password);
    setLoading(false);

    if (result.success) {
      setStatusMessage({ text: 'Authentication successful! Welcome to PAHARPUR EYE CARE ERP.', type: 'success' });
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setStatusMessage(null);
      }, 1200);
    } else {
      setStatusMessage({ text: result.error || 'Invalid credentials. Access denied.', type: 'error' });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatusMessage({ text: 'Please enter your registered staff email address.', type: 'error' });
      return;
    }
    setLoading(true);
    setStatusMessage(null);

    const res = await sendPasswordReset(email.trim());
    setLoading(false);

    if (res.success) {
      setStatusMessage({ text: res.message, type: 'success' });
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await logoutAccount();
    setLoading(false);
    setViewMode('login');
    setStatusMessage({ text: 'You have been signed out successfully.', type: 'info' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Paharpur Eye Care Branding */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-5 text-white relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-600/30 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-wide text-white">PAHARPUR EYE CARE</h3>
                <span className="text-[10px] bg-teal-500/30 text-teal-300 border border-teal-400/40 px-2 py-0.5 rounded-full font-mono uppercase">
                  Cloud Auth
                </span>
              </div>
              <p className="text-xs text-slate-300">Staff Authentication & Role Access</p>
            </div>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
          </div>
        )}

        <div className="p-6">
          {/* PROFILE VIEW IF ALREADY LOGGED IN */}
          {firebaseUser && viewMode === 'profile' ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center text-lg font-bold shadow-xs">
                    {(currentUser?.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {currentUser?.displayName || 'Authenticated Staff'}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{firebaseUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                        {currentUser?.role || role}
                      </span>
                      <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Session
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Firebase UID:</span>
                    <span className="font-mono text-slate-700 truncate max-w-[180px]">{firebaseUser.uid}</span>
                  </div>
                  {currentUser?.lastLogin && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Session Login:</span>
                      <span className="font-medium text-slate-700">
                        {new Date(currentUser.lastLogin).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setEmail('');
                    setPassword('');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  Switch User Account
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  Sign Out
                </button>
              </div>
            </div>
          ) : viewMode === 'forgot' ? (
            /* FORGOT PASSWORD VIEW */
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center space-y-1 mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Reset Staff Password</h4>
                <p className="text-xs text-slate-500">
                  Enter your staff email to receive a secure Firebase Authentication password reset link.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="staff@paharpureyecare.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                Send Password Reset Email
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setStatusMessage(null);
                  }}
                  className="text-xs text-teal-700 hover:underline font-semibold"
                >
                  Back to Staff Login
                </button>
              </div>
            </form>
          ) : (
            /* EMAIL + PASSWORD LOGIN VIEW */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center space-y-1 mb-2">
                <h4 className="font-bold text-slate-800 text-sm">Staff Account Login</h4>
                <p className="text-xs text-slate-500">Sign in with your verified staff credentials</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@paharpureyecare.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot');
                      setStatusMessage(null);
                    }}
                    className="text-[11px] text-teal-700 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Sign In to ERP
              </button>

              <div className="relative flex items-center justify-center py-2">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Or
                </span>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  const ok = await loginWithGoogleAccount();
                  setLoading(false);
                  if (ok) {
                    setIsAuthModalOpen(false);
                  }
                }}
                disabled={loading}
                className="w-full py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Sign In with Google SSO
              </button>
            </form>
          )}

          {/* Security Banner footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Role-Based Access Control
            </span>
            <span className="font-mono text-[10px] text-slate-400">TLS 256-Bit Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
