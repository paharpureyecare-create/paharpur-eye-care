import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { GoogleDriveSpreadsheetItem } from '../types';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Lock,
  Plus,
  FolderOpen,
  UserCheck,
  Unlink,
  LogOut,
  Calendar,
  Clock,
  History,
  Info,
  Check,
  Search,
  Sparkles,
  Database,
  ArrowRightLeft,
  XCircle
} from 'lucide-react';

export const GoogleSheetsConnectionCard: React.FC = () => {
  const {
    settings,
    role,
    googleSheetsStatus,
    syncWithGoogleSheets,
    connectGoogleAccount,
    disconnectGoogleAccount,
    reconnectGoogleAccount,
    selectGoogleSpreadsheet,
    createNewGoogleSpreadsheet,
    fetchGoogleSpreadsheets,
    verifyCurrentSpreadsheet,
    showToast
  } = useErp();

  // State management
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isVerifyingOpen, setIsVerifyingOpen] = useState(false);

  // Modals & Confirmation dialogs
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showChangeAccountConfirm, setShowChangeAccountConfirm] = useState(false);

  // Open Sheet Alert State ('none' | 'no_sheet' | 'inaccessible')
  const [openSheetAlert, setOpenSheetAlert] = useState<'none' | 'no_sheet' | 'inaccessible'>('none');
  const [inaccessibleReason, setInaccessibleReason] = useState('');

  // Data for select modal
  const [availableSheets, setAvailableSheets] = useState<GoogleDriveSpreadsheetItem[]>([]);
  const [sheetSearch, setSheetSearch] = useState('');
  const [manualSheetInput, setManualSheetInput] = useState('');

  // Form for create modal
  const [newSheetTitle, setNewSheetTitle] = useState('PAHARPUR EYE CARE ERP DATABASE');

  const isAdmin = role === 'Admin';

  // Strict check for real spreadsheet ID (rejects any placeholder)
  const hasRealSheetId = Boolean(
    settings.googleSheetId &&
    settings.googleSheetId.trim() !== '' &&
    !settings.googleSheetId.includes('1PEC_Master') &&
    !settings.googleSheetId.includes('placeholder')
  );

  // Status is ONLY "Connected" if both the Google Account is authenticated AND a verified real spreadsheet is configured
  const isConnected = Boolean(
    settings.googleSheetConnected &&
    settings.googleConnectedEmail &&
    hasRealSheetId &&
    settings.googleConnectionStatus === 'connected'
  );

  const isExpired = settings.googleConnectionStatus === 'expired';

  // Authenticated with Google, but spreadsheet not yet selected or created
  const isAccountConnectedWithoutSheet = Boolean(
    settings.googleConnectedEmail &&
    !hasRealSheetId &&
    !isExpired
  );

  // 1. Trigger OAuth Connect
  const handleConnect = async (preferGSI = false) => {
    if (!isAdmin) {
      showToast('Admin Security: Only Super Admin can connect Google Accounts.', 'error');
      return;
    }
    setIsConnecting(true);
    setOpenSheetAlert('none');
    try {
      const res = await connectGoogleAccount(false, preferGSI);
      if (res.success) {
        // If connected and no sheet selected, prompt admin to select or create
        if (!settings.googleSheetId) {
          setShowSelectModal(true);
          loadSheets();
        }
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // 2. Trigger OAuth Change Account
  const handleChangeAccount = async (preferGSI = false) => {
    setShowChangeAccountConfirm(false);
    setIsConnecting(true);
    setOpenSheetAlert('none');
    try {
      const res = await connectGoogleAccount(true, preferGSI);
      if (res.success) {
        // After account change: do not keep using previous account's sheet. Show spreadsheet picker immediately.
        setShowSelectModal(true);
        loadSheets();
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // 3. Load Drive Spreadsheets
  const loadSheets = async () => {
    setIsLoadingSheets(true);
    try {
      let list = await fetchGoogleSpreadsheets();
      if (list.length === 0 && settings.googleConnectedEmail) {
        // Attempt to load if account was connected
        const success = await reconnectGoogleAccount();
        if (success) {
          list = await fetchGoogleSpreadsheets();
        }
      }
      setAvailableSheets(list);
    } catch (err: any) {
      console.warn('Could not fetch sheets automatically:', err);
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const handleOpenSelectModal = () => {
    setOpenSheetAlert('none');
    setShowSelectModal(true);
    loadSheets();
  };

  // 4. Select a spreadsheet
  const handleSelectSheetItem = async (sheet: GoogleDriveSpreadsheetItem) => {
    const success = await selectGoogleSpreadsheet(sheet);
    if (success) {
      setShowSelectModal(false);
      setOpenSheetAlert('none');
    }
  };

  const handleManualSheetSelect = async () => {
    if (!manualSheetInput.trim()) return;
    let cleanId = manualSheetInput.trim();
    if (cleanId.includes('/d/')) {
      cleanId = cleanId.split('/d/')[1]?.split('/')[0] || cleanId;
    }
    const success = await selectGoogleSpreadsheet({
      id: cleanId,
      name: `Google Spreadsheet (${cleanId.slice(0, 8)}...)`,
      webViewLink: `https://docs.google.com/spreadsheets/d/${cleanId}/edit`
    });
    if (success) {
      setManualSheetInput('');
      setShowSelectModal(false);
      setOpenSheetAlert('none');
    }
  };

  // 5. Create new spreadsheet
  const handleCreateSheet = async () => {
    if (!newSheetTitle.trim()) return;
    setIsCreatingSheet(true);
    try {
      const res = await createNewGoogleSpreadsheet(newSheetTitle.trim());
      if (res.success) {
        setShowCreateModal(false);
        setNewSheetTitle('PAHARPUR EYE CARE ERP DATABASE');
        setOpenSheetAlert('none');
      }
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // 6. Disconnect Google Account
  const handleDisconnect = async () => {
    await disconnectGoogleAccount();
    setShowDisconnectConfirm(false);
    setOpenSheetAlert('none');
  };

  // 7. Manual Live Sync
  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await syncWithGoogleSheets();
    } finally {
      setIsSyncing(false);
    }
  };

  // 8. Open Google Sheet with dynamic real URL (Synchronous to prevent browser popup blocking)
  const handleOpenGoogleSheet = () => {
    if (!hasRealSheetId || !settings.googleSheetId) {
      setOpenSheetAlert('no_sheet');
      return;
    }

    setOpenSheetAlert('none');
    // Dynamically construct URL strictly using the actual connected spreadsheet ID
    const realSpreadsheetUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(settings.googleSheetId)}/edit`;
    window.open(realSpreadsheetUrl, '_blank', 'noopener,noreferrer');
  };

  // Filtered sheet list for selection modal
  const filteredSheets = availableSheets.filter(s =>
    s.name.toLowerCase().includes(sheetSearch.toLowerCase()) ||
    s.id.toLowerCase().includes(sheetSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Admin Security Banner (if non-admin) */}
      {!isAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Admin Security Enforced (প্রশাসনিক নিরাপত্তা)</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Only <strong>Super Admin</strong> can connect, change, or disconnect Google Accounts and Spreadsheets.
              Your current role: <span className="font-bold underline">{role}</span> (View Only Mode).
            </p>
          </div>
        </div>
      )}

      {/* ALERT MODAL / CALLOUT: No Spreadsheet Connected */}
      {openSheetAlert === 'no_sheet' && (
        <div className="p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl space-y-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-black text-rose-900">No Google Spreadsheet is connected.</h3>
              <p className="text-xs text-rose-700">
                Please connect your Google Account and select or create an active spreadsheet before opening.
              </p>
            </div>
            <button
              onClick={() => setOpenSheetAlert('none')}
              className="text-rose-400 hover:text-rose-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {!settings.googleConnectedEmail ? (
              <button
                onClick={() => handleConnect(false)}
                disabled={isConnecting || !isAdmin}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                [ Connect Google Account ]
              </button>
            ) : (
              <>
                <button
                  onClick={handleOpenSelectModal}
                  disabled={!isAdmin}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                  [ Select Google Spreadsheet ]
                </button>
                <button
                  onClick={() => { setOpenSheetAlert('none'); setShowCreateModal(true); }}
                  disabled={!isAdmin}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  [ + Create New Spreadsheet ]
                </button>
              </>
            )}
            <button
              onClick={() => setOpenSheetAlert('none')}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ALERT MODAL / CALLOUT: Connected Spreadsheet Inaccessible */}
      {openSheetAlert === 'inaccessible' && (
        <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-black text-amber-900">
                Connected spreadsheet is unavailable or access has been revoked.
              </h3>
              <p className="text-xs text-amber-800">
                {inaccessibleReason || 'The spreadsheet ID could not be opened or permissions were modified in Google Drive.'}
              </p>
            </div>
            <button
              onClick={() => setOpenSheetAlert('none')}
              className="text-amber-400 hover:text-amber-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={async () => {
                setOpenSheetAlert('none');
                await reconnectGoogleAccount();
              }}
              disabled={!isAdmin}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              [ Reconnect ]
            </button>
            <button
              onClick={handleOpenSelectModal}
              disabled={!isAdmin}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              [ Select Another Spreadsheet ]
            </button>
            <button
              onClick={() => setOpenSheetAlert('none')}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Master Card: GOOGLE SHEETS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Card Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">GOOGLE SHEETS</h2>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    ● Connected
                  </span>
                ) : isExpired ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    ● Connection Expired
                  </span>
                ) : isAccountConnectedWithoutSheet ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Account Connected (Spreadsheet Required)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Seamless real-time synchronization with Google Drive & Google Sheets
              </p>
            </div>
          </div>

          {/* Top Quick Actions (Open Google Sheet + Sync) */}
          <div className="flex items-center gap-2">
            <button
              id="open-google-sheet-btn-header"
              onClick={handleOpenGoogleSheet}
              disabled={isVerifyingOpen}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
            >
              {isVerifyingOpen ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>[ Open Google Sheet ]</span>
            </button>

            {isConnected && (
              <button
                onClick={handleSyncNow}
                disabled={isSyncing || googleSheetsStatus?.syncing}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing || googleSheetsStatus?.syncing ? 'animate-spin' : ''}`} />
                {isSyncing || googleSheetsStatus?.syncing ? 'Syncing...' : '⚡ Sync Now'}
              </button>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          
          {/* STATE 1: NOT CONNECTED (No Google Account Authenticated) */}
          {!settings.googleConnectedEmail && !isExpired && (
            <div className="py-8 px-4 flex flex-col items-center text-center max-w-xl mx-auto space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                <Unlink className="w-8 h-8 text-slate-400" />
              </div>

              <div className="space-y-1.5">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Status</div>
                <div className="text-2xl font-black text-slate-800">Not Connected</div>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed pt-1">
                  Connect your preferred Google Account to automatically sync all 12 operational ERP tables (Patients, Appointments, Clinical Prescriptions, Spectacle Orders, Lens & Frame Stock, Retail Billing, and Loyalty Points).
                </p>
              </div>

              {/* Big Connect Button */}
              <div className="w-full pt-2 flex flex-col items-center gap-2.5">
                <button
                  id="connect-google-account-btn"
                  onClick={() => handleConnect(false)}
                  disabled={isConnecting || !isAdmin}
                  className="w-full sm:w-auto min-w-[280px] px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isConnecting ? 'Opening Google Sign-In...' : '+ Connect Google Account'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConnect(true)}
                  disabled={isConnecting || !isAdmin}
                  className="text-[11px] text-teal-700 hover:text-teal-900 underline font-semibold transition-colors cursor-pointer"
                >
                  Popup blocked or iframe issues? Connect via Google Identity (Direct)
                </button>
              </div>

              <div className="flex items-center gap-6 text-[11px] text-slate-500 pt-2">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Any Gmail / Workspace Account
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Account Chooser Screen
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> 100% Zero Hardcoding
                </span>
              </div>
            </div>
          )}

          {/* STATE 2: CONNECTION EXPIRED */}
          {isExpired && (
            <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-900">● Connection Expired</h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Your Google OAuth authorization session has expired. Reconnect to refresh credentials.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => reconnectGoogleAccount(false)}
                  disabled={!isAdmin}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  [ Reconnect Google Account ]
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: ACCOUNT CONNECTED BUT SPREADSHEET NEEDED */}
          {isAccountConnectedWithoutSheet && (
            <div className="space-y-6">
              <div className="p-6 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-blue-900">Google Account Connected</h3>
                      <p className="text-xs text-blue-800 mt-0.5 font-medium">
                        Connected: <strong>{settings.googleConnectedEmail}</strong>
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        To complete the integration, please select an existing Google Spreadsheet from your Drive or create a new one.
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                    Spreadsheet Needed
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleOpenSelectModal}
                    disabled={!isAdmin}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4 text-emerald-400" />
                    [ Select Google Spreadsheet ]
                  </button>

                  <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={!isAdmin}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    [ + Create New Spreadsheet ]
                  </button>

                  <button
                    onClick={() => setShowChangeAccountConfirm(true)}
                    disabled={!isAdmin}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                    [ Change Google Account ]
                  </button>

                  <button
                    onClick={() => setShowDisconnectConfirm(true)}
                    disabled={!isAdmin}
                    className="ml-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    [ Disconnect ]
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 4: FULLY CONNECTED (ACCOUNT + REAL SPREADSHEET) */}
          {isConnected && (
            <div className="space-y-6">
              
              {/* SECTION 5: CONNECTION STATUS REQUIRED 5 CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* 1. CONNECTED ACCOUNT */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    CONNECTED ACCOUNT
                  </div>
                  <div className="font-extrabold text-xs text-slate-900 truncate" title={settings.googleConnectedEmail}>
                    {settings.googleConnectedEmail || 'Not Connected'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate">
                    {settings.googleConnectedName || 'Authenticated User'}
                  </div>
                </div>

                {/* 2. SPREADSHEET */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                    SPREADSHEET
                  </div>
                  <div className="font-extrabold text-xs text-slate-900 truncate" title={settings.googleSpreadsheetName || 'Not Selected'}>
                    {settings.googleSpreadsheetName || 'Not Selected'}
                  </div>
                  <button
                    onClick={handleOpenGoogleSheet}
                    disabled={isVerifyingOpen}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Open in Google Sheets <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* 3. SPREADSHEET ID */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-indigo-600" />
                    SPREADSHEET ID
                  </div>
                  <div className="font-mono text-xs text-slate-800 truncate font-semibold" title={settings.googleSheetId}>
                    {settings.googleSheetId || 'None'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Google Drive Unique File ID
                  </div>
                </div>

                {/* 4. STATUS */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    STATUS
                  </div>
                  <div className="font-black text-xs text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    ● Connected
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Verified & Live Ready
                  </div>
                </div>

                {/* 5. LAST SYNC */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    LAST SYNC
                  </div>
                  <div className="font-bold text-xs text-slate-800 truncate">
                    {settings.lastGoogleSheetSync ? new Date(settings.lastGoogleSheetSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate">
                    {settings.lastGoogleSheetSync ? new Date(settings.lastGoogleSheetSync).toLocaleDateString() : 'Awaiting first sync'}
                  </div>
                </div>

              </div>

              {/* Action Buttons Toolbar */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-wrap items-center gap-3">
                
                {/* Open Google Sheet Button */}
                <button
                  id="open-google-sheet-btn-toolbar"
                  onClick={handleOpenGoogleSheet}
                  disabled={isVerifyingOpen}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {isVerifyingOpen ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ExternalLink className="w-3.5 h-3.5" />
                  )}
                  [ Open Google Sheet ]
                </button>

                {/* Select Google Spreadsheet */}
                <button
                  onClick={handleOpenSelectModal}
                  disabled={!isAdmin}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 text-emerald-600" />
                  [ Select Google Spreadsheet ]
                </button>

                {/* Create New Spreadsheet */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  disabled={!isAdmin}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-teal-600" />
                  [ + Create New Spreadsheet ]
                </button>

                {/* Change Spreadsheet */}
                <button
                  onClick={handleOpenSelectModal}
                  disabled={!isAdmin}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                  [ Change Spreadsheet ]
                </button>

                {/* Change Google Account */}
                <button
                  onClick={() => setShowChangeAccountConfirm(true)}
                  disabled={!isAdmin}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  [ Change Google Account ]
                </button>

                {/* Reconnect */}
                <button
                  onClick={() => reconnectGoogleAccount(false)}
                  disabled={!isAdmin}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  [ Reconnect ]
                </button>

                {/* Disconnect Google Account */}
                <button
                  onClick={() => setShowDisconnectConfirm(true)}
                  disabled={!isAdmin}
                  className="ml-auto px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  [ Disconnect Google Account ]
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Data Safety Assurance Banner */}
      <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-emerald-950">Data Safety & Local Persistence Guarantee (ডাটা নিরাপত্তা নিশ্চয়তা)</h4>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Changing or disconnecting Google Accounts will <strong>NEVER delete, modify, or overwrite</strong> any local ERP data.
            All Patients, Clinical Consultations, Spectacle Orders, Invoices, Frame & Lens Inventories, Customer 360 Profiles, and Loyalty Points remain completely safe inside your local database. Google Sheets synchronization is an independent live cloud mirror.
          </p>
        </div>
      </div>

      {/* Audit Log Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Google Connection Audit Trail (গুগল কানেকশন অডিট লগ)</h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {settings.googleConnectionAuditLogs?.length || 0} Recorded Operations
          </span>
        </div>

        {(!settings.googleConnectionAuditLogs || settings.googleConnectionAuditLogs.length === 0) ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium border border-dashed rounded-2xl bg-slate-50">
            No connection changes recorded yet. Future account links, sheet selections, and disconnections will be permanently audited here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Previous Gmail</th>
                  <th className="py-2.5 px-3">New Gmail</th>
                  <th className="py-2.5 px-3">Spreadsheet</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settings.googleConnectionAuditLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.date} {log.time}
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.action === 'CONNECT_ACCOUNT' ? 'bg-emerald-100 text-emerald-800' :
                        log.action === 'CHANGE_ACCOUNT' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'SELECT_SPREADSHEET' ? 'bg-purple-100 text-purple-800' :
                        log.action === 'CREATE_SPREADSHEET' ? 'bg-teal-100 text-teal-800' :
                        log.action === 'DISCONNECT' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 truncate max-w-[150px]" title={log.previousGmail}>
                      {log.previousGmail || 'None'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 truncate max-w-[150px]" title={log.newGmail}>
                      {log.newGmail || 'None'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[160px]" title={log.newSpreadsheet}>
                      {log.newSpreadsheet || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-medium">
                      {log.user}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL 1: SELECT GOOGLE SPREADSHEET
         ========================================================================= */}
      {showSelectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">Select Google Spreadsheet</h3>
              </div>
              <button
                onClick={() => setShowSelectModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Choose an existing spreadsheet from your connected Google Account (<strong>{settings.googleConnectedEmail}</strong>) or paste a custom Sheet ID.
            </p>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={sheetSearch}
                onChange={e => setSheetSearch(e.target.value)}
                placeholder="Search accessible spreadsheets in Drive by name or ID..."
                className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-teal-500"
              />
            </div>

            {/* Accessible Sheets List */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-[160px] max-h-[260px] border rounded-2xl p-2 bg-slate-50/50">
              {isLoadingSheets ? (
                <div className="py-12 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
                  <span>Loading spreadsheets from Google Drive...</span>
                </div>
              ) : filteredSheets.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                  <div>No spreadsheets matching "{sheetSearch}" found in Drive.</div>
                  <button
                    onClick={() => { setShowSelectModal(false); setShowCreateModal(true); }}
                    className="text-teal-600 hover:underline font-bold cursor-pointer"
                  >
                    + Create a new spreadsheet instead
                  </button>
                </div>
              ) : (
                filteredSheets.map(sheet => (
                  <div
                    key={sheet.id}
                    onClick={() => handleSelectSheetItem(sheet)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      settings.googleSheetId === sheet.id
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate space-y-0.5">
                        <div className="text-xs font-bold truncate">{sheet.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">ID: {sheet.id}</div>
                        {sheet.modifiedTime && (
                          <div className="text-[10px] text-slate-400">
                            Modified: {new Date(sheet.modifiedTime).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shrink-0 cursor-pointer">
                      {settings.googleSheetId === sheet.id ? 'Selected' : 'Connect'}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Manual ID / URL Fallback */}
            <div className="pt-2 border-t space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Or enter custom Google Sheet URL or ID:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={manualSheetInput}
                  onChange={e => setManualSheetInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                  className="flex-1 px-3 py-2 border rounded-xl text-xs bg-slate-50 font-mono"
                />
                <button
                  onClick={handleManualSheetSelect}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer"
                >
                  Use Sheet
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={loadSheets}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload List
              </button>
              <button
                onClick={() => setShowSelectModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: CREATE NEW SPREADSHEET
         ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-base text-slate-900">Create New Spreadsheet</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              This will create a new Google Spreadsheet directly inside your connected Google Drive (<strong>{settings.googleConnectedEmail}</strong>) with all 12 operational ERP tables configured.
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Spreadsheet Name</label>
              <input
                type="text"
                value={newSheetTitle}
                onChange={e => setNewSheetTitle(e.target.value)}
                placeholder="e.g. PAHARPUR EYE CARE ERP DATABASE"
                className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-bold bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl space-y-1 text-[11px] text-teal-900">
              <div className="font-bold">Pre-configured Operational Tabs:</div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-teal-800">
                <span>• Patients (UHID)</span>
                <span>• Spectacle Orders</span>
                <span>• Clinical Refractions</span>
                <span>• Retail Sales Invoices</span>
                <span>• Lens Inventory SKUs</span>
                <span>• Frame Inventory Models</span>
                <span>• Appointments Queue</span>
                <span>• Loyalty Points Ledger</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSheet}
                disabled={isCreatingSheet || !newSheetTitle.trim()}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {isCreatingSheet ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {isCreatingSheet ? 'Creating in Google Drive...' : 'Create & Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: CONFIRM DISCONNECT
         ========================================================================= */}
      {showDisconnectConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-black text-base text-slate-900">Disconnect Google Account?</h3>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 text-slate-700">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                DATA SAFETY GUARANTEE:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                <li>Your local ERP database, patients, sales, and stock data will <strong>NOT</strong> be deleted.</li>
                <li>Your existing Google Spreadsheet in Google Drive will <strong>NOT</strong> be deleted.</li>
                <li>Only the active integration connection between this ERP and Google will be disconnected.</li>
              </ul>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Currently connected account: <strong>{settings.googleConnectedEmail}</strong>
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Confirm Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: CONFIRM CHANGE ACCOUNT
         ========================================================================= */}
      {showChangeAccountConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-slate-900">Change Google Account?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Do you want to connect a different Google Account?
              You will be presented with Google's account selection screen to choose any Gmail on your phone or PC.
            </p>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800">
              ✓ All local ERP data remains completely preserved and untouched.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowChangeAccountConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeAccount}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                Continue to Google Account Selection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
