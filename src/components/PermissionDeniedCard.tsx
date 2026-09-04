import React from 'react';
import { useErp } from '../context/ErpContext';
import { PermissionModule } from '../types';
import { ShieldAlert, Lock, ArrowRight, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { ALL_PERMISSION_MODULES, getModuleForTab } from '../services/permissionService';

interface Props {
  module: PermissionModule;
  onNavigateHome?: () => void;
}

export const PermissionDeniedCard: React.FC<Props> = ({ module, onNavigateHome }) => {
  const { role, currentUser, hasPermission, setActiveTab } = useErp();
  const activeRoleName = currentUser?.role || role;

  // Find modules this user is actually allowed to view
  const allowedTabs: { id: string; label: string; module: PermissionModule }[] = ([
    { id: 'dashboard', label: 'Dashboard', module: 'Dashboard' as PermissionModule },
    { id: 'patients', label: 'Patients', module: 'Patients' as PermissionModule },
    { id: 'customers', label: 'Customers', module: 'Customers' as PermissionModule },
    { id: 'appointments', label: 'Appointments', module: 'Appointments' as PermissionModule },
    { id: 'entry-center', label: 'Clinical Entry', module: 'Clinical Entry' as PermissionModule },
    { id: 'prescriptions', label: 'Prescriptions', module: 'Prescriptions' as PermissionModule },
    { id: 'spectacles', label: 'Spectacle Orders', module: 'Spectacle Orders' as PermissionModule },
    { id: 'retail-sales', label: 'Retail POS', module: 'Retail POS' as PermissionModule },
    { id: 'medicines', label: 'Medicines', module: 'Medicines' as PermissionModule },
    { id: 'dues', label: 'Due Accounts', module: 'Due Management' as PermissionModule }
  ]).filter(t => hasPermission(t.module, 'view'));

  return (
    <div id="permission-denied-container" className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden text-center p-8 sm:p-12 relative">
        {/* Decorative background accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-50 rounded-full blur-2xl pointer-events-none" />

        {/* Shield / Lock Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-inner mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Bilingual Header */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-700 mb-3">
          <Lock className="w-3.5 h-3.5" />
          Access Restricted / অ্যাক্সেস সীমাবদ্ধ
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          You don't have permission to perform this action.
        </h2>
        <p className="text-lg font-bold text-rose-600 mt-1 mb-4">
          এই কাজটি করার অনুমতি আপনার নেই।
        </p>

        {/* Detail Box */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 max-w-xl mx-auto text-left space-y-3 mb-8">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-semibold">Requested Module:</span>
            <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              {module}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-semibold">Current Account:</span>
            <span className="font-semibold text-slate-800">
              {currentUser?.displayName || currentUser?.email || 'Active Staff User'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">Assigned Role:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
              {activeRoleName}
            </span>
          </div>
        </div>

        {/* Quick Access to Allowed Modules */}
        {allowedTabs.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Available Sections for your role ({activeRoleName}):
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
              {allowedTabs.slice(0, 5).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 hover:border-teal-300 border border-slate-200 transition-all shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions & Help */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            id="btn-return-dashboard"
            onClick={() => {
              if (onNavigateHome) {
                onNavigateHome();
              } else if (hasPermission('Dashboard', 'view')) {
                setActiveTab('dashboard');
              } else if (allowedTabs.length > 0) {
                setActiveTab(allowedTabs[0].id as any);
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md transition-all"
          >
            Return to Allowed Section
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <Mail className="w-3.5 h-3.5" />
          Need access? Contact Paharpur Eye Care Administrator at <span className="font-semibold text-slate-600">paharpureyecare@gmail.com</span>
        </p>
      </div>
    </div>
  );
};
