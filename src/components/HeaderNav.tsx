import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { UserRole } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  UserCheck,
  Calendar,
  Glasses,
  ShoppingBag,
  CreditCard,
  FileSpreadsheet,
  AlertCircle,
  X,
  Shield,
  User,
  LogIn,
  LogOut
} from 'lucide-react';

export const HeaderNav: React.FC = () => {
  const {
    role,
    setRole,
    settings,
    syncWithGoogleSheets,
    setQuickModal,
    searchQuery,
    setSearchQuery,
    patients,
    spectacleOrders,
    retailSales,
    lenses,
    frames,
    setSelectedPatientFor360,
    setActiveTab,
    startVisitFromAppointment,
    appointments,
    cloudSyncStatus,
    currentUser,
    firebaseUser,
    setIsAuthModalOpen,
    logoutAccount,
    hasPermission,
    checkAndExecuteAction
  } = useErp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncWithGoogleSheets();
    setIsSyncing(false);
  };

  // Search Results
  const query = (searchQuery || '').trim().toLowerCase();
  const matchedPatients = query
    ? (patients || []).filter(
        p =>
          (p.name || '').toLowerCase().includes(query) ||
          (p.mrd || '').toLowerCase().includes(query) ||
          (p.mobile || '').includes(query) ||
          (p.village && p.village.toLowerCase().includes(query))
      )
    : [];

  const matchedOrders = query
    ? (spectacleOrders || []).filter(
        o =>
          (o.orderId || '').toLowerCase().includes(query) ||
          (o.customerName || '').toLowerCase().includes(query) ||
          (o.mobile || '').includes(query) ||
          (o.mrd || '').toLowerCase().includes(query)
      )
    : [];

  const matchedInvoices = query
    ? (retailSales || []).filter(
        s =>
          (s.invoiceNumber || (s as any).invoiceNo || '').toLowerCase().includes(query) ||
          (s.customerName || '').toLowerCase().includes(query) ||
          (s.mobile || '').includes(query)
      )
    : [];

  const matchedInventory = query
    ? [
        ...(frames || []).filter(f => (f.sku || '').toLowerCase().includes(query) || (f.brand || '').toLowerCase().includes(query)),
        ...(lenses || []).filter(l => (l.lensCode || '').toLowerCase().includes(query) || (l.brand || '').toLowerCase().includes(query))
      ]
    : [];

  const hasSearchResults =
    matchedPatients.length > 0 ||
    matchedOrders.length > 0 ||
    matchedInvoices.length > 0 ||
    matchedInventory.length > 0;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {isMobileSearchOpen ? (
          <div className="flex items-center gap-2 h-16 w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="mobile-search-input"
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                placeholder="Search MRD, Mobile, Patient, Order, Invoice..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-teal-400 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setShowSearchDropdown(false);
              }}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 shrink-0"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
            
            {/* Logo & Clinic Branding */}
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('dashboard')}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-600/20">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm sm:text-lg tracking-tight text-slate-900 leading-none truncate">
                    {settings.shopName}
                  </span>
                  <span className="hidden xs:inline-block bg-teal-50 text-teal-700 text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full border border-teal-200 shrink-0">
                    ERP
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium hidden md:block mt-0.5">
                  Clinical Vision Center & Central Optical ERP
                </p>
              </div>
            </div>

            {/* Center Global Search Bar (Desktop) */}
            <div className="relative flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="global-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="Search MRD, Mobile, Patient, Order ID, Invoice, Lens Code..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Action Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Mobile Search Button */}
              <button
                id="header-mobile-search-btn"
                onClick={() => setIsMobileSearchOpen(true)}
                title="Search Database"
                className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* PWA In-App Install Compact Button */}
              <PWAInstallButton compact={true} />

              {/* AI Assistant Quick Pill Button */}
              <button
                id="header-ai-assistant-btn"
                onClick={() => setQuickModal('ai-assistant')}
                title="Open PAHARPUR ERP AI Assistant"
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-teal-700 to-slate-900 hover:from-teal-600 hover:to-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-teal-300 animate-ping"></span>
                <span className="hidden sm:inline">AI Assistant</span>
                <span className="sm:hidden font-mono text-[11px]">AI</span>
                <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded-full font-mono">বাংলা</span>
              </button>

              {/* Cloud Firestore Primary Database Pill */}
              <button
                id="header-cloud-database-btn"
                onClick={() => setActiveTab('settings')}
                title={`Cloud Firestore: ${cloudSyncStatus.toUpperCase()} • Click to open Cloud Hub`}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-2xs border ${
                  cloudSyncStatus === 'synced' || cloudSyncStatus === 'online'
                    ? 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200'
                    : cloudSyncStatus === 'syncing'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    cloudSyncStatus === 'synced' || cloudSyncStatus === 'online'
                      ? 'bg-teal-600'
                      : cloudSyncStatus === 'syncing'
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="hidden md:inline">
                  {cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Cloud Synced'}
                </span>
              </button>

              {/* Google Sheets Sync Pill */}
              <button
                id="header-sheets-sync-btn"
                onClick={handleSync}
                disabled={isSyncing}
                title="Google Sheets Live Synchronization"
                className="hidden sm:flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden lg:inline">Sheets</span>
                <RefreshCw className={`w-3 h-3 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>

              {/* Quick Action Button Dropdown */}
              <div className="relative group">
                <button
                  id="header-quick-action-btn"
                  className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">1-Click</span>
                </button>

                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1">
                  <button
                    id="action-ai-assistant"
                    onClick={() => setQuickModal('ai-assistant')}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-teal-900 bg-teal-50/70 hover:bg-teal-100 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4 text-teal-600" />
                    🤖 Open ERP AI Assistant (বাংলা/EN)
                  </button>
                  <button
                    id="action-ai-ocr"
                    onClick={() => setQuickModal('ai-ocr')}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4 text-teal-600" />
                    📷 AI Scan Prescription (OCR)
                  </button>
                  <button
                    id="action-ai-voice"
                    onClick={() => setQuickModal('ai-voice')}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4 text-teal-600" />
                    🎙️ AI Voice Data Entry
                  </button>
                  <button
                    id="action-new-patient"
                    onClick={() => checkAndExecuteAction('Patients', 'create', () => setQuickModal('new-patient'), 'New Patient Registration')}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2 border-t border-slate-100"
                  >
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    + New Patient Registration
                  </button>
                  <button
                    id="action-new-apt"
                    onClick={() => checkAndExecuteAction('Appointments', 'create', () => setQuickModal('new-appointment'), 'Book Appointment')}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-blue-600" />
                    + Book Appointment
                  </button>
                  <button
                    id="action-new-spectacle"
                    onClick={() => checkAndExecuteAction('Spectacle Orders', 'create', () => setQuickModal('new-order'), 'Spectacle Order Booking')}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2"
                  >
                    <Glasses className="w-4 h-4 text-amber-600" />
                    + Spectacle Order Booking
                  </button>
                  <button
                    id="action-new-sale"
                    onClick={() => checkAndExecuteAction('Retail POS', 'create', () => setQuickModal('new-sale'), 'Retail Walk-in Sale')}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    + Retail / Walk-in Sale
                  </button>
                  <button
                    id="action-collect-due"
                    onClick={() => checkAndExecuteAction('Due Management', 'edit', () => setQuickModal('collect-due'), 'Collect Due Payment')}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2 border-t border-slate-100"
                  >
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    + Collect Due Payment
                  </button>
                </div>
              </div>

              {/* Role Switcher (Desktop) */}
              {(currentUser?.role === 'Admin' || role === 'Admin') ? (
                <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-500 px-1.5 uppercase">
                    Role:
                  </span>
                  <select
                    id="role-select"
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer py-0.5 pr-2"
                  >
                    <option value="Admin">ADMIN</option>
                    <option value="Receptionist">RECEPTION</option>
                    <option value="Optometrist">OPTOMETRIST</option>
                    <option value="Doctor">DOCTOR</option>
                    <option value="Sales">SALES</option>
                    <option value="Accountant">ACCOUNTANT</option>
                    <option value="Marketing">MARKETING</option>
                    <option value="Read Only">READ ONLY</option>
                  </select>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5">
                  <div className="flex items-center px-2 py-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-teal-500 mr-1.5"></span>
                    <span>{currentUser?.role || role}</span>
                  </div>
                </div>
              )}

              {/* Staff User Profile & Firebase Auth Modal Trigger */}
              <button
                id="header-user-auth-btn"
                onClick={() => setIsAuthModalOpen(true)}
                title={
                  firebaseUser
                    ? `Signed In: ${currentUser?.displayName || firebaseUser.email} (${currentUser?.role || role})`
                    : 'Click to Sign In with Staff Account'
                }
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-white text-slate-800 transition-all shadow-2xs group"
              >
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    {(currentUser?.displayName || firebaseUser?.email || role)[0].toUpperCase()}
                  </div>
                  {firebaseUser && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="text-left hidden xl:block">
                  <div className="text-xs font-bold text-slate-900 leading-none truncate max-w-[100px]">
                    {currentUser?.displayName || (firebaseUser ? 'Staff' : `${role}`)}
                  </div>
                  <div className="text-[9px] text-teal-700 font-semibold leading-tight">
                    {currentUser?.role || role}
                  </div>
                </div>
              </button>

              {/* Sign Out Button (Desktop) */}
              <button
                id="header-logout-btn"
                onClick={logoutAccount}
                title="Sign Out / Log Out from ERP"
                className="hidden sm:flex p-2 rounded-xl border border-slate-200 hover:border-rose-300 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>

            </div>
          </div>
        )}

        {/* Live Search Auto-complete Dropdown (both desktop and mobile) */}
        {showSearchDropdown && query && (
          <div
            className="absolute left-2 right-2 md:left-64 md:right-auto md:w-96 top-full mt-1 bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-96 overflow-y-auto z-50 p-2.5 text-left animate-in fade-in slide-in-from-top-1"
          >
            {!hasSearchResults ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching records found for "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-3">
                {/* Patients */}
                {matchedPatients.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                      Patients ({matchedPatients.length})
                    </div>
                    {matchedPatients.slice(0, 4).map(p => (
                      <div
                        key={p.mrd}
                        onClick={() => {
                          setSelectedPatientFor360(p);
                          setShowSearchDropdown(false);
                          setIsMobileSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-2 hover:bg-teal-50/70 rounded-xl cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                            {p.name?.[0] || 'P'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{p.name}</p>
                            <p className="text-[10px] text-slate-500">
                              {p.mrd} • {p.mobile}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-teal-600 font-bold">360° &rarr;</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Spectacle Orders */}
                {matchedOrders.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                      Orders ({matchedOrders.length})
                    </div>
                    {matchedOrders.slice(0, 3).map(o => (
                      <div
                        key={o.orderId}
                        onClick={() => {
                          setActiveTab('spectacles');
                          setShowSearchDropdown(false);
                          setIsMobileSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-2 hover:bg-blue-50/70 rounded-xl cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {o.orderId} — {o.customerName}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Frame: {o.frameBrand} • Due: ₹{o.due} • {o.status}
                          </p>
                        </div>
                        <span className="text-[10px] text-blue-600 font-bold">View &rarr;</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Invoices */}
                {matchedInvoices.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                      Invoices ({matchedInvoices.length})
                    </div>
                    {matchedInvoices.slice(0, 3).map(i => (
                      <div
                        key={i.invoiceNumber}
                        onClick={() => {
                          setActiveTab('retail-sales');
                          setShowSearchDropdown(false);
                          setIsMobileSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {i.invoiceNumber} — {i.customerName}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Total: ₹{i.grandTotal} • Paid: ₹{i.paid} • Due: ₹{i.due}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-600 font-bold">View &rarr;</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
