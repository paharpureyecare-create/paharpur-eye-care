import React, { useState } from 'react';
import { useErp, NavTab } from '../context/ErpContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ShoppingBag,
  Boxes,
  Menu,
  Grid
} from 'lucide-react';
import { MobileMoreDrawer } from './MobileMoreDrawer';

export const MobileBottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    appointments,
    spectacleOrders,
    frames,
    lenses
  } = useErp();

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const waitingCount = appointments.filter(a => a.status === 'Waiting' || a.status === 'Booked').length;
  const activeOrdersCount = spectacleOrders.filter(o => o.status === 'In Production' || o.status === 'Ready').length;
  const lowStockCount =
    frames.filter(f => f.status === 'Low Stock' || f.status === 'Out of Stock').length +
    lenses.filter(l => l.status === 'Low Stock' || l.status === 'Out of Stock').length;

  const handleTabClick = (tab: NavTab) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    setActiveTab(tab);
    setIsMoreOpen(false);
    // Smoothly scroll content window to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isTabActive = (tab: NavTab) => {
    if (tab === 'dashboard') return activeTab === 'dashboard';
    if (tab === 'patients') return activeTab === 'patients' || activeTab === 'customers';
    if (tab === 'appointments') return activeTab === 'appointments';
    if (tab === 'retail-sales') return activeTab === 'retail-sales' || activeTab === 'spectacles' || activeTab === 'wholesale';
    if (tab === 'frame-inventory') return activeTab === 'frame-inventory' || activeTab === 'lens-inventory' || activeTab === 'stock-ledger' || activeTab === 'suppliers';
    return false;
  };

  const isMoreActive =
    !isTabActive('dashboard') &&
    !isTabActive('patients') &&
    !isTabActive('appointments') &&
    !isTabActive('retail-sales') &&
    !isTabActive('frame-inventory');

  return (
    <>
      <nav
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden safe-area-bottom select-none"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-6 h-16 items-center px-1 max-w-lg mx-auto">
          
          {/* 1. Dashboard */}
          <button
            id="mob-nav-dashboard"
            onClick={() => handleTabClick('dashboard')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-95 ${
              isTabActive('dashboard')
                ? 'text-teal-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-lg ${isTabActive('dashboard') ? 'bg-teal-50' : ''}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">Dashboard</span>
          </button>

          {/* 2. Patients */}
          <button
            id="mob-nav-patients"
            onClick={() => handleTabClick('patients')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-95 ${
              isTabActive('patients')
                ? 'text-teal-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-lg ${isTabActive('patients') ? 'bg-teal-50' : ''}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">Patients</span>
          </button>

          {/* 3. Appointments */}
          <button
            id="mob-nav-appointments"
            onClick={() => handleTabClick('appointments')}
            className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-95 ${
              isTabActive('appointments')
                ? 'text-teal-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`relative p-1 rounded-lg ${isTabActive('appointments') ? 'bg-teal-50' : ''}`}>
              <Calendar className="w-5 h-5" />
              {waitingCount > 0 && (
                <span className="absolute -top-0.5 -right-1 bg-blue-600 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center shadow-xs">
                  {waitingCount > 9 ? '9+' : waitingCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">Appts</span>
          </button>

          {/* 4. Sales */}
          <button
            id="mob-nav-sales"
            onClick={() => handleTabClick('retail-sales')}
            className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-95 ${
              isTabActive('retail-sales')
                ? 'text-teal-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`relative p-1 rounded-lg ${isTabActive('retail-sales') ? 'bg-teal-50' : ''}`}>
              <ShoppingBag className="w-5 h-5" />
              {activeOrdersCount > 0 && (
                <span className="absolute -top-0.5 -right-1 bg-amber-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center shadow-xs">
                  {activeOrdersCount > 9 ? '9+' : activeOrdersCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">Sales</span>
          </button>

          {/* 5. Inventory */}
          <button
            id="mob-nav-inventory"
            onClick={() => handleTabClick('frame-inventory')}
            className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-95 ${
              isTabActive('frame-inventory')
                ? 'text-teal-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`relative p-1 rounded-lg ${isTabActive('frame-inventory') ? 'bg-teal-50' : ''}`}>
              <Boxes className="w-5 h-5" />
              {lowStockCount > 0 && (
                <span className="absolute -top-0.5 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center shadow-xs">
                  {lowStockCount > 9 ? '!' : lowStockCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">Stock</span>
          </button>

          {/* 6. More */}
          <button
            id="mob-nav-more"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(10);
              }
              setIsMoreOpen(true);
            }}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-95 ${
              isMoreOpen || isMoreActive
                ? 'text-teal-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-lg ${isMoreOpen || isMoreActive ? 'bg-teal-50' : ''}`}>
              <Grid className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">More</span>
          </button>

        </div>
      </nav>

      {/* Full Sheet More Drawer */}
      <MobileMoreDrawer
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
      />
    </>
  );
};
