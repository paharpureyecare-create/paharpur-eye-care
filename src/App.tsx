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
import { AuditLogPage } from './components/AuditLogPage';
import { ClinicSettingsPage } from './components/ClinicSettingsPage';
import { CustomersView } from './components/CustomersView';
import { WholesaleDealersView } from './components/WholesaleDealersView';
import { MasterManagementView } from './components/MasterManagementView';
import { LoyaltyRewardsView } from './components/LoyaltyRewardsView';
import { Customer360Modal } from './components/Customer360Modal';
import { Patient360Modal } from './components/Patient360Modal';
import { PrintModal } from './components/PrintModal';
import { QuickModals } from './components/QuickModals';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { AiPrescriptionOcrModal } from './components/AiPrescriptionOcrModal';
import { AiVoiceEntryModal } from './components/AiVoiceEntryModal';
import { AiPowerCompareModal } from './components/AiPowerCompareModal';
import { AiCeoReportModal } from './components/AiCeoReportModal';
import { AuthModal } from './components/AuthModal';
import { PermissionDeniedCard } from './components/PermissionDeniedCard';
import { getModuleForTab } from './services/permissionService';
import { LoginPage } from './components/LoginPage';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    toast,
    selectedCustomerFor360,
    setSelectedCustomerFor360,
    quickModal,
    setQuickModal,
    hasPermission
  } = useErp();

  const currentModule = getModuleForTab(activeTab);
  const isViewPermitted = hasPermission(currentModule, 'view');

  // Automatic redirect if current tab is not permitted for the user's role
  React.useEffect(() => {
    if (!isViewPermitted) {
      if (hasPermission('Dashboard', 'view')) {
        setActiveTab('dashboard');
      } else if (hasPermission('Patients', 'view')) {
        setActiveTab('patients');
      } else if (hasPermission('Clinical Entry', 'view')) {
        setActiveTab('entry-center');
      } else if (hasPermission('Retail POS', 'view')) {
        setActiveTab('retail-sales');
      } else if (hasPermission('Appointments', 'view')) {
        setActiveTab('appointments');
      }
    }
  }, [isViewPermitted, activeTab, hasPermission, setActiveTab]);

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
            {!isViewPermitted ? (
              <PermissionDeniedCard module={currentModule} />
            ) : (
              <>
                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'patients' && <PatientsView />}
                {activeTab === 'customers' && <CustomersView />}
                {activeTab === 'appointments' && <AppointmentsView />}
                {activeTab === 'entry-center' && <EntryCenterView />}
                {activeTab === 'prescriptions' && <PrescriptionsLogView />}
                {activeTab === 'spectacles' && <SpectacleOrdersView />}
                {(activeTab === 'lenses' || activeTab === 'lens-inventory') && <LensInventoryView />}
                {(activeTab === 'frames' || activeTab === 'frame-inventory') && <FrameInventoryView />}
                {activeTab === 'retail-sales' && <RetailSalesView />}
                {activeTab === 'wholesale' && <WholesaleDealersView />}
                {(activeTab === 'stock-ledger' || activeTab === 'purchases' || activeTab === 'suppliers') && <PurchasesAndLedgerView />}
                {(activeTab === 'due-management' || activeTab === 'dues') && <DueManagementView />}
                {activeTab === 'medicines' && <MedicinesView />}
                {(activeTab === 'crm-whatsapp' || activeTab === 'crm') && <CrmAndWhatsAppView />}
                {(activeTab === 'loyalty' || activeTab === 'loyalty-rewards') && <LoyaltyRewardsView />}
                {activeTab === 'reports' && <ReportsView />}
                {(activeTab === 'masters' || activeTab === 'master-management') && <MasterManagementView />}
                {(activeTab === 'google-sheets' || activeTab === 'sheets-sync') && <GoogleSheetsSyncView />}
                {activeTab === 'audit-log' && <AuditLogPage />}
                {(activeTab === 'settings' || activeTab === 'clinic-settings') && <ClinicSettingsPage />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <Patient360Modal />
      {selectedCustomerFor360 && (
        <Customer360Modal
          customer={selectedCustomerFor360}
          onClose={() => setSelectedCustomerFor360(null)}
        />
      )}
      <PrintModal />
      <QuickModals />

      {/* AI Assistant & Copilot Modals */}
      <AiAssistantDrawer
        isOpen={quickModal === 'ai-assistant'}
        onClose={() => setQuickModal(null)}
      />
      <AiPrescriptionOcrModal
        isOpen={quickModal === 'ai-ocr'}
        onClose={() => setQuickModal(null)}
      />
      <AiVoiceEntryModal
        isOpen={quickModal === 'ai-voice'}
        onClose={() => setQuickModal(null)}
      />
      <AiPowerCompareModal
        isOpen={quickModal === 'ai-power-compare'}
        onClose={() => setQuickModal(null)}
      />
      <AiCeoReportModal
        isOpen={quickModal === 'ai-ceo-report'}
        onClose={() => setQuickModal(null)}
      />

      {/* Staff Authentication & Role Profile Modal */}
      <AuthModal />

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

const AppRoot: React.FC = () => {
  const { authLoading, currentUser } = useErp();

  if (authLoading) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-2xl shadow-teal-500/30 animate-pulse border border-teal-400/40">
            <span className="text-xl font-black tracking-tighter">PEC</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></span>
            <span className="text-xs font-semibold text-slate-300">Verifying Secure Clinic Session...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <ErpProvider>
      <AppRoot />
    </ErpProvider>
  );
}
