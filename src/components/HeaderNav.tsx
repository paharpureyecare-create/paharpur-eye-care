import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { UserRole } from '../types';
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
  LogIn
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
    setIsAuthModalOpen
  } = useErp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Clinic Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-600/20">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">
                  {settings.shopName}
                </span>
                <span className="bg-teal-50 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                  ERP Master
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Clinical Vision Center & Central Optical ERP
              </p>
            </div>
          </div>

          {/* Center Global Search Bar */}
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

            {/* Live Search Auto-complete Dropdown */}
            {showSearchDropdown && query && (
              <div
                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-96 overflow-y-auto z-50 p-2 text-left"
                onMouseLeave={() => setShowSearchDropdown(false)}
              >
                {!hasSearchResults ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No matching records found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Patients */}
                    {matchedPatients.length > 0 && (
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                          Patients ({matchedPatients.length})
                        </div>
                        {matchedPatients.slice(0, 4).map(p => (
                          <div
                            key={p.mrd}
                            onClick={() => {
                              setSelectedPatientFor360(p);
                              setShowSearchDropdown(false);
                            }}
                            className="flex items-center justify-between p-2 hover:bg-teal-50/70 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                                {p.name?.[0] || 'P'}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                                <p className="text-xs text-slate-500">
                                  {p.mrd} • {p.mobile} • {p.age}y/{p.gender?.[0] || 'M'}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-teal-600 font-medium">360° Profile &rarr;</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Spectacle Orders */}
                    {matchedOrders.length > 0 && (
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                          Spectacle Orders ({matchedOrders.length})
                        </div>
                        {matchedOrders.slice(0, 3).map(o => (
                          <div
                            key={o.orderId}
                            onClick={() => {
                              setActiveTab('spectacles');
                              setShowSearchDropdown(false);
                            }}
                            className="flex items-center justify-between p-2 hover:bg-blue-50/70 rounded-lg cursor-pointer transition-colors"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {o.orderId} — {o.customerName}
                              </p>
                              <p className="text-xs text-slate-500">
                                Frame: {o.frameBrand} • Due: ₹{o.due} • {o.status}
                              </p>
                            </div>
                            <span className="text-xs text-blue-600 font-medium">View Order &rarr;</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Invoices */}
                    {matchedInvoices.length > 0 && (
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                          Invoices ({matchedInvoices.length})
                        </div>
                        {matchedInvoices.slice(0, 3).map(i => (
                          <div
                            key={i.invoiceNumber}
                            onClick={() => {
                              setActiveTab('retail-sales');
                              setShowSearchDropdown(false);
                            }}
                            className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {i.invoiceNumber} — {i.customerName}
                              </p>
                              <p className="text-xs text-slate-500">
                                Total: ₹{i.grandTotal} • Paid: ₹{i.paid} • Due: ₹{i.due}
                              </p>
                            </div>
                            <span className="text-xs text-slate-600 font-medium">View &rarr;</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* AI Assistant Quick Pill Button */}
            <button
              id="header-ai-assistant-btn"
              onClick={() => setQuickModal('ai-assistant')}
              title="Open PAHARPUR ERP AI Assistant"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-700 to-slate-900 hover:from-teal-600 hover:to-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all hover:scale-105"
            >
              <span className="w-2 h-2 rounded-full bg-teal-300 animate-ping"></span>
              <span className="hidden sm:inline">AI Assistant</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">বাংলা</span>
            </button>

            {/* Cloud Firestore Primary Database Pill */}
            <button
              id="header-cloud-database-btn"
              onClick={() => setActiveTab('settings')}
              title={`Cloud Firestore: ${cloudSyncStatus.toUpperCase()} • Click to open Cloud Hub`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-2xs border ${
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
              <span className="hidden sm:inline">
                {cloudSyncStatus === 'syncing' ? 'Cloud Syncing...' : 'Cloud Synced'}
              </span>
            </button>

            {/* Google Sheets Sync Pill */}
            <button
              id="header-sheets-sync-btn"
              onClick={handleSync}
              disabled={isSyncing}
              title="Google Sheets Live Synchronization"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Google Sheets</span>
              <RefreshCw className={`w-3 h-3 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            {/* Quick Action Button Dropdown / Direct */}
            <div className="relative group">
              <button
                id="header-quick-action-btn"
                className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">1-Click Action</span>
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
                  onClick={() => setQuickModal('new-patient')}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2 border-t border-slate-100"
                >
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  + New Patient Registration
                </button>
                <button
                  id="action-new-apt"
                  onClick={() => setQuickModal('new-appointment')}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-blue-600" />
                  + Book Appointment
                </button>
                <button
                  id="action-new-spectacle"
                  onClick={() => setQuickModal('new-order')}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2"
                >
                  <Glasses className="w-4 h-4 text-amber-600" />
                  + Spectacle Order Booking
                </button>
                <button
                  id="action-new-sale"
                  onClick={() => setQuickModal('new-sale')}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  + Retail / Walk-in Sale
                </button>
                <button
                  id="action-collect-due"
                  onClick={() => setQuickModal('collect-due')}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2 border-t border-slate-100"
                >
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  + Collect Due Payment
                </button>
              </div>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-500 px-1.5 uppercase hidden lg:inline">
                Role:
              </span>
              <select
                id="role-select"
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer py-0.5 pr-2"
              >
                <option value="Admin">ADMIN (Full Access)</option>
                <option value="Receptionist">RECEPTION (Front Desk)</option>
                <option value="Optometrist">OPTOMETRIST (Vision & Clinical)</option>
                <option value="Doctor">DOCTOR (Senior Clinical)</option>
                <option value="Sales">SALES (Optical POS & Orders)</option>
                <option value="Accountant">ACCOUNTANT (Ledgers & Dues)</option>
                <option value="Marketing">MARKETING (CRM & Campaigns)</option>
                <option value="Read Only">READ ONLY (Auditor)</option>
              </select>
            </div>

            {/* Staff User Profile & Firebase Auth Modal Trigger */}
            <button
              id="header-user-auth-btn"
              onClick={() => setIsAuthModalOpen(true)}
              title={
                firebaseUser
                  ? `Signed In: ${currentUser?.displayName || firebaseUser.email} (${currentUser?.role || role})`
                  : 'Click to Sign In with Staff Account'
              }
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-white text-slate-800 transition-all shadow-2xs group"
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {(currentUser?.displayName || firebaseUser?.email || role)[0].toUpperCase()}
                </div>
                {firebaseUser && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="text-left hidden xl:block">
                <div className="text-xs font-bold text-slate-900 leading-none truncate max-w-[110px]">
                  {currentUser?.displayName || (firebaseUser ? 'Staff User' : `${role} Staff`)}
                </div>
                <div className="text-[10px] text-teal-700 font-semibold leading-tight">
                  {currentUser?.role || role}
                </div>
              </div>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
