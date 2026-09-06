import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Users,
  Glasses,
  Calendar,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    loginWithEmailAccount,
    loginWithGoogleAccount,
    loginWithQuickRole,
    sendPasswordReset,
    cloudSyncStatus
  } = useErp();

  const [activeMode, setActiveMode] = useState<'credentials' | 'roles'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
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
      setStatusMessage({ text: 'Access granted. Loading role-based workstation...', type: 'success' });
    } else {
      setStatusMessage({ text: result.error || 'Authentication failed. Please check your credentials.', type: 'error' });
    }
  };

  const handleRoleQuickLogin = async (roleName: 'Owner/Admin' | 'Doctor' | 'Staff' | 'Receptionist') => {
    setLoading(true);
    setStatusMessage(null);
    const success = await loginWithQuickRole(roleName);
    setLoading(false);
    if (!success) {
      setStatusMessage({ text: `Could not sign in as ${roleName}. Please try manual login.`, type: 'error' });
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setStatusMessage(null);
    const success = await loginWithGoogleAccount();
    setLoading(false);
    if (!success) {
      setStatusMessage({ text: 'Google authentication was cancelled or failed.', type: 'error' });
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setStatusMessage({ text: 'Please enter your registered staff email address.', type: 'error' });
      return;
    }
    setLoading(true);
    const res = await sendPasswordReset(forgotEmail.trim());
    setLoading(false);
    if (res.success) {
      setStatusMessage({ text: res.message, type: 'success' });
      setIsForgotOpen(false);
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col justify-between text-slate-100 font-sans antialiased selection:bg-teal-500 selection:text-white">
      {/* Background Decorative Gradient Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.18),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(30,58,138,0.22),transparent_50%)] pointer-events-none" />

      {/* Top Header / Brand Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 border border-teal-400/40">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-teal-400">Clinical & Optical ERP</span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
              PAHARPUR EYE CARE
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">পাহাড়পুর আই কেয়ার — Enterprise Practice Management</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300">
          <Database className="w-3.5 h-3.5 text-teal-400" />
          <span>Firestore Cloud Database Active</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>
      </header>

      {/* Main Authentication Center */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Clinic Introduction & Role Matrix */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-4">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Protected Medical System</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Secure Staff Portal & Clinical Access
              </h2>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                Welcome to Paharpur Eye Care ERP. All medical records, optical orders, and transactions are synchronized in real-time with Google Cloud Firestore.
              </p>
            </div>

            {/* Role Scopes Checklist */}
            <div className="space-y-3 my-6 pt-4 border-t border-slate-800/80">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Supported Clinic Roles:
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-200">Owner / Admin:</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Full unrestricted access across all clinical, financial, inventory & configuration modules.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-200">Doctor / Optometrist:</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Patients, refraction, OD/OS examination, digital prescriptions & diagnostic reports.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Glasses className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-200">Staff / Optical Sales:</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">POS billing, spectacle orders, frame & lens inventory management & customer CRM.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-200">Receptionist:</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Patient registration (MRD), appointment scheduling, token queue & basic inquiries.</p>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              <span>Encrypted Firebase Authentication Session</span>
            </div>
          </div>

          {/* Right Column: Interactive Login Box */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-lg flex flex-col justify-between">
            
            <div>
              {/* Tab Switcher: Credentials vs Quick Role Workstations */}
              <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
                <button
                  type="button"
                  id="tab-credentials"
                  onClick={() => { setActiveMode('credentials'); setStatusMessage(null); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activeMode === 'credentials'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Email & Password</span>
                </button>

                <button
                  type="button"
                  id="tab-quick-roles"
                  onClick={() => { setActiveMode('roles'); setStatusMessage(null); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activeMode === 'roles'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Role Workstations (Quick Access)</span>
                </button>
              </div>

              {/* Status Alert Banner */}
              {statusMessage && (
                <div
                  className={`mb-6 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-3 border ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : statusMessage.type === 'error'
                      ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                      : 'bg-sky-950/60 text-sky-300 border-sky-500/40'
                  }`}
                >
                  {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
                  {statusMessage.type === 'info' && <ShieldCheck className="w-4 h-4 shrink-0" />}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Mode 1: Standard Email & Password Form */}
              {activeMode === 'credentials' && (
                <form onSubmit={handleCredentialsLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                      Staff Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        id="login-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. doctor@paharpureyecare.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgotOpen(true)}
                        className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        id="login-password-input"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-11 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="submit-login-btn"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 transition-all cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Verifying Session...
                      </span>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to ERP Dashboard</span>
                      </>
                    )}
                  </button>

                  {/* Google Authentication Alternative */}
                  <div className="pt-3">
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-slate-800"></div>
                      <span className="flex-shrink mx-3 text-slate-400 text-xs font-semibold uppercase">Or Sign In With</span>
                      <div className="flex-grow border-t border-slate-800"></div>
                    </div>

                    <button
                      type="button"
                      id="google-signin-btn"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google Account</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Mode 2: Quick Role Workstation Cards */}
              {activeMode === 'roles' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 mb-3">
                    Select your clinical or administrative workstation to launch the corresponding role-based ERP dashboard:
                  </p>

                  {/* 1. Owner / Admin */}
                  <button
                    type="button"
                    id="quick-login-admin"
                    disabled={loading}
                    onClick={() => handleRoleQuickLogin('Owner/Admin')}
                    className="w-full text-left p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                        👑
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                            Owner / Administrator
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                            Full Access
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Account: paharpureyecare@gmail.com
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
                  </button>

                  {/* 2. Doctor */}
                  <button
                    type="button"
                    id="quick-login-doctor"
                    disabled={loading}
                    onClick={() => handleRoleQuickLogin('Doctor')}
                    className="w-full text-left p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        🩺
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                            Doctor / Optometrist
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                            Clinical Suite
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Patients, Eye Examination, Prescriptions, History & Reports
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </button>

                  {/* 3. Staff */}
                  <button
                    type="button"
                    id="quick-login-staff"
                    disabled={loading}
                    onClick={() => handleRoleQuickLogin('Staff')}
                    className="w-full text-left p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                        👓
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                            Staff / Optical Sales & Stock
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                            Retail POS
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Patients, Sales, Frames, Lenses, Products & Customer CRM
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  </button>

                  {/* 4. Receptionist */}
                  <button
                    type="button"
                    id="quick-login-reception"
                    disabled={loading}
                    onClick={() => handleRoleQuickLogin('Receptionist')}
                    className="w-full text-left p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                        📋
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                            Receptionist / Front Desk
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                            Front Desk
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Patient Registration (MRD), Appointments & Basic Records
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Security Note */}
            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                Firebase Auth & Security Rules Enforced
              </span>
              <span>Paharpur Eye Care, West Bengal</span>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <KeyRound className="w-5 h-5 text-teal-400" />
              Reset Staff Password
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your registered staff email address to receive secure password reset instructions directly from Firebase.
            </p>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="staff@paharpureyecare.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 font-mono"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white shadow-sm"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-400">
        PAHARPUR EYE CARE ERP • Powered by Google Cloud Firestore & Firebase Auth • Spark Starter Tier Ready
      </footer>
    </div>
  );
};
