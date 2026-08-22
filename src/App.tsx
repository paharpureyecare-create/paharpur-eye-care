import React from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { SidebarNav } from './components/SidebarNav';
import { HeaderNav } from './components/HeaderNav';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { AppointmentsView } from './components/AppointmentsView';
import { EntryCenterView } from './components/EntryCenterView';
import { PrescriptionsLogView } from './components/PrescriptionsLogView';
import { SpectacleOrdersView } from './components/SpectacleOrdersView';
import { LensInventoryView } from './components/LensInventoryView';
import { FrameInventoryView } from './components/FrameInventoryView';
import { RetailSalesView } from './components/RetailSalesView';
import { PurchasesAndLedgerView } from './components/PurchasesAndLedgerView';
import { DueManagementView } from './components/DueManagementView';
import { MedicinesView } from './components/MedicinesView';
import { CrmAndWhatsAppView } from './components/CrmAndWhatsAppView';
import { ReportsView } from './components/ReportsView';
import { GoogleSheetsSyncView } from './components/GoogleSheetsSyncView';
import { SettingsView } from './components/SettingsView';
import { Patient360Modal } from './components/Patient360Modal';
import { PrintModal } from './components/PrintModal';
import { QuickModals } from './components/QuickModals';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, toast } = useErp();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-900 selection:bg-teal-500 selection:text-white">
      
      {/* Sidebar Navigation */}
      <SidebarNav />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top App Header */}
        <HeaderNav />

        {/* Dynamic Content Views */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'patients' && <PatientsView />}
            {activeTab === 'appointments' && <AppointmentsView />}
            {activeTab === 'entry-center' && <EntryCenterView />}
            {activeTab === 'prescriptions' && <PrescriptionsLogView />}
            {activeTab === 'spectacles' && <SpectacleOrdersView />}
            {(activeTab === 'lenses' || activeTab === 'lens-inventory') && <LensInventoryView />}
            {(activeTab === 'frames' || activeTab === 'frame-inventory') && <FrameInventoryView />}
            {(activeTab === 'retail-sales' || activeTab === 'wholesale') && <RetailSalesView />}
            {(activeTab === 'stock-ledger' || activeTab === 'purchases' || activeTab === 'suppliers') && <PurchasesAndLedgerView />}
            {(activeTab === 'due-management' || activeTab === 'dues') && <DueManagementView />}
            {activeTab === 'medicines' && <MedicinesView />}
            {(activeTab === 'crm-whatsapp' || activeTab === 'crm') && <CrmAndWhatsAppView />}
            {activeTab === 'reports' && <ReportsView />}
            {(activeTab === 'google-sheets' || activeTab === 'sheets-sync') && <GoogleSheetsSyncView />}
            {(activeTab === 'settings' || activeTab === 'audit-log') && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <Patient360Modal />
      <PrintModal />
      <QuickModals />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-emerald-500/40 shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-500/40'
                : toast.type === 'warning'
                ? 'bg-amber-900 text-white border-amber-500/40'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <ErpProvider>
      <MainLayout />
    </ErpProvider>
  );
}
