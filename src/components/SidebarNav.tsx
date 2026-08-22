import React from 'react';
import { useErp, NavTab } from '../context/ErpContext';
import {
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
  AlertTriangle
} from 'lucide-react';

export const SidebarNav: React.FC = () => {
  const { activeTab, setActiveTab, appointments, spectacleOrders, frames, lenses, retailSales } = useErp();

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
        { id: 'wholesale', label: 'Wholesale Orders', icon: Building2 }
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

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      <div className="p-4 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {group.title}
            </div>
            <div className="space-y-0.5 mt-1.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-xs font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
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
      </div>

      {/* Footer Info Box */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 m-2 rounded-xl text-left">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Cloud Data Sync</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          Google Sheets Auto-Persistence Active
        </p>
      </div>
    </aside>
  );
};
