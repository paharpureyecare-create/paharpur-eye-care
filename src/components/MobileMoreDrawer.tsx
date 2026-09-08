import React from 'react';
import { useErp, NavTab } from '../context/ErpContext';
import { getModuleForTab } from '../services/permissionService';
import { PWAInstallButton } from './PWAInstallButton';
import {
  X,
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  FileText,
  Glasses,
  ShoppingBag,
  Building2,
  Disc,
  Frame,
  Boxes,
  Truck,
  CreditCard,
  Pill,
  MessageSquare,
  BarChart3,
  FileSpreadsheet,
  History,
  Settings,
  Database,
  Award,
  Sparkles,
  Bot,
  Camera,
  Mic,
  PlusCircle,
  Shield,
  UserCheck,
  LogOut,
  RefreshCw,
  CloudCheck
} from 'lucide-react';

interface MobileMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMoreDrawer: React.FC<MobileMoreDrawerProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    role,
    currentUser,
    firebaseUser,
    logoutAccount,
    setIsAuthModalOpen,
    cloudSyncStatus,
    syncWithGoogleSheets,
    setQuickModal,
    hasPermission,
    appointments,
    spectacleOrders,
    frames,
    lenses,
    retailSales
  } = useErp();

  const [isSyncing, setIsSyncing] = React.useState(false);

  if (!isOpen) return null;

  const waitingAppointments = appointments.filter(a => a.status === 'Waiting' || a.status === 'Booked').length;
  const activeOrders = spectacleOrders.filter(o => o.status === 'In Production' || o.status === 'Ready' || o.status === 'Lens Ordered').length;
  const lowStockCount =
    frames.filter(f => f.status === 'Low Stock' || f.status === 'Out of Stock').length +
    lenses.filter(l => l.status === 'Low Stock' || l.status === 'Out of Stock').length;
  const totalDuesCount = retailSales.filter(s => s.due > 0).length;

  interface NavItem {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'CEO Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: '🩺 CLINICAL HUB',
      items: [
        { id: 'patients', label: 'Patient 360° Registry', icon: Users },
        { id: 'customers', label: 'Customer 360 & CRM', icon: Users },
        {
          id: 'appointments',
          label: 'Appointments',
          icon: Calendar,
          badge: waitingAppointments > 0 ? waitingAppointments : undefined,
          badgeColor: 'bg-blue-100 text-blue-700'
        },
        { id: 'entry-center', label: 'Clinical Entry Center', icon: Stethoscope },
        { id: 'prescriptions', label: 'Prescriptions Slip Log', icon: FileText },
        { id: 'medicines', label: 'Medicine Master', icon: Pill }
      ]
    },
    {
      title: '👓 OPTICAL & SALES',
      items: [
        {
          id: 'spectacles',
          label: 'Spectacle Orders',
          icon: Glasses,
          badge: activeOrders > 0 ? activeOrders : undefined,
          badgeColor: 'bg-amber-100 text-amber-800'
        },
        { id: 'retail-sales', label: 'Retail Point of Sale', icon: ShoppingBag },
        { id: 'wholesale', label: 'Lens Stockist & Wholesale', icon: Building2 }
      ]
    },
    {
      title: '📦 CENTRAL INVENTORY',
      items: [
        {
          id: 'lens-inventory',
          label: 'Lens Master & Stock',
          icon: Disc,
          badge: lowStockCount > 0 ? lowStockCount : undefined,
          badgeColor: 'bg-rose-100 text-rose-700'
        },
        { id: 'frame-inventory', label: 'Frame Master & Stock', icon: Frame },
        { id: 'stock-ledger', label: 'Central Stock Ledger', icon: Boxes },
        { id: 'suppliers', label: 'Suppliers & Purchases', icon: Truck }
      ]
    },
    {
      title: '🗄️ MASTER MANAGEMENT',
      items: [
        {
          id: 'masters',
          label: 'Master Management (11)',
          icon: Database,
          badge: 'Live',
          badgeColor: 'bg-teal-500/20 text-teal-700'
        }
      ]
    },
    {
      title: '💰 FINANCE & CRM',
      items: [
        {
          id: 'dues',
          label: 'Due Management & Aging',
          icon: CreditCard,
          badge: totalDuesCount > 0 ? `₹${totalDuesCount}` : undefined,
          badgeColor: 'bg-purple-100 text-purple-700'
        },
        { id: 'crm', label: 'CRM & WhatsApp Engine', icon: MessageSquare },
        {
          id: 'loyalty',
          label: 'Loyalty Points & Rewards',
          icon: Award,
          badge: 'VIP',
          badgeColor: 'bg-amber-100 text-amber-800'
        },
        { id: 'reports', label: 'CEO Analytics & Profit', icon: BarChart3 },
        { id: 'sheets-sync', label: 'Google Sheets Live Sync', icon: FileSpreadsheet }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'audit-log', label: 'Audit Trail & Logs', icon: History },
        { id: 'settings', label: 'Clinic Settings & Print', icon: Settings }
      ]
    }
  ];

  const permittedNavGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => hasPermission(getModuleForTab(item.id), 'view'))
    }))
    .filter(group => group.items.length > 0);

  const handleNavigate = (tab: NavTab) => {
    setActiveTab(tab);
    onClose();
  };

  const handleTriggerModal = (modal: any) => {
    setQuickModal(modal);
    onClose();
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncWithGoogleSheets();
    setIsSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      {/* Backdrop click to dismiss */}
      <div className="flex-1" onClick={onClose} />

      {/* Sheet Container */}
      <div className="bg-white rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl border-t border-slate-200 overscroll-contain animate-in slide-in-from-bottom duration-200">
        
        {/* Handle Bar & Top Header */}
        <div className="p-4 pb-2 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-3xl">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                PEC
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">All ERP Modules</h2>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${cloudSyncStatus === 'synced' || cloudSyncStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span>Firestore Cloud Active • {role}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
          
          {/* Quick Actions & AI Copilot Grid */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              ⚡ QUICK ACTIONS & AI
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTriggerModal('ai-assistant')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-slate-900 text-white text-xs font-bold text-left shadow-xs active:scale-95 transition"
              >
                <span className="text-base">🤖</span>
                <div>
                  <div className="leading-tight">AI Assistant</div>
                  <span className="text-[10px] text-teal-300 font-normal">বাংলা / English</span>
                </div>
              </button>

              <button
                onClick={() => handleTriggerModal('ai-ocr')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold text-left active:scale-95 transition"
              >
                <Camera className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <div className="leading-tight">AI OCR Scan</div>
                  <span className="text-[10px] text-teal-600 font-normal">Prescription</span>
                </div>
              </button>

              <button
                onClick={() => handleTriggerModal('new-patient')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold text-left active:scale-95 transition"
              >
                <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>+ New Patient</span>
              </button>

              <button
                onClick={() => handleTriggerModal('new-appointment')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold text-left active:scale-95 transition"
              >
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <span>+ Book Appt</span>
              </button>
            </div>
          </div>

          {/* Sync & PWA Install Section */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Google Sheets Sync</span>
              </div>
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold active:scale-95 transition"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>

            {/* Install PWA Button */}
            <PWAInstallButton />
          </div>

          {/* Module Groups */}
          {permittedNavGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                {group.title}
              </div>
              <div className="grid grid-cols-1 gap-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold active:scale-98 transition ${
                        isActive
                          ? 'bg-teal-600 text-white font-bold shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-teal-600'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* User Account & Logout */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setIsAuthModalOpen(true);
                onClose();
              }}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-800"
            >
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                {(currentUser?.displayName || firebaseUser?.email || role)[0].toUpperCase()}
              </div>
              <span>Profile ({currentUser?.role || role})</span>
            </button>

            <button
              onClick={() => {
                logoutAccount();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 active:scale-95 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
