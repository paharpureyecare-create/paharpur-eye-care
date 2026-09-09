import React from 'react';
import { useErp } from '../context/ErpContext';
import {
  Users,
  Calendar,
  Stethoscope,
  Glasses,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  CreditCard,
  Truck,
  Disc,
  Frame,
  FileSpreadsheet,
  Plus,
  Play,
  ArrowDownLeft,
  ArrowUpRight as ArrowUpRightIcon,
  Search,
  History,
  Layers,
  Sliders,
  XCircle,
  Eye
} from 'lucide-react';
import { QuickLensSearchSection } from './lens/QuickLensSearchSection';

export const DashboardView: React.FC = () => {
  const {
    patients = [],
    appointments = [],
    visits = [],
    spectacleOrders = [],
    retailSales = [],
    wholesaleSales = [],
    frames = [],
    lenses = [],
    lensPurchases = [],
    stockMovements = [],
    payments = [],
    customers = [],
    setActiveTab,
    startVisitFromAppointment,
    setQuickModal,
    setSelectedPatientFor360
  } = useErp();

  const today = new Date().toISOString().split('T')[0];

  // Today live activity metrics
  const todayAppointments = appointments.filter(a => a.date === today);
  const todayPatients = patients.filter(p => p.registrationDate === today);
  const todayVisits = visits.filter(v => v.visitDate === today);
  const todayOrders = spectacleOrders.filter(o => o.orderDate === today);
  const todaySales = retailSales.filter(s => s.date === today);
  const todaySalesTotal = todaySales.reduce((acc, s) => acc + s.grandTotal, 0);
  const todayCollection = payments.filter(p => p.date === today).reduce((acc, p) => acc + p.amount, 0);
  const todayDue = todaySales.reduce((acc, s) => acc + s.due, 0);

  // Business KPIs
  const totalRevenue = retailSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalOutstandingDue = retailSales.reduce((acc, s) => acc + s.due, 0);

  // LENS INVENTORY CALCULATIONS (Primary Core Business)
  const totalLensPairs = lenses.reduce((acc, l) => acc + (l.currentStock || 0), 0);
  const totalLensPieces = totalLensPairs * 2;
  const availableLensVariants = lenses.filter(l => (l.currentStock || 0) > 0).length;
  const totalLensVariants = lenses.length;
  const lowStockLenses = lenses.filter(
    l => l.status === 'Low Stock' || ((l.currentStock || 0) > 0 && (l.currentStock || 0) <= (l.reorderLevel || 8))
  );
  const outOfStockLenses = lenses.filter(
    l => (l.currentStock || 0) <= 0 || l.status === 'Out of Stock'
  );

  // Today's Lens Stock In
  const todayLensPurchasesQty = lensPurchases
    .filter(p => p.purchaseDate === today || (p.timestamp && p.timestamp.startsWith(today)))
    .reduce((sum, p) => sum + (p.quantity || 0), 0);
  const todayMovLensIn = stockMovements
    .filter(
      m =>
        (m.date === today || m.timestamp?.startsWith(today)) &&
        (m.itemType === 'Lens' || m.itemCode?.startsWith('LNS-')) &&
        (m.qtyIn > 0 || m.movementType === 'Purchase' || m.movementType === 'Stock IN')
    )
    .reduce((sum, m) => sum + (m.qtyIn || 0), 0);
  const todayLensStockIn = Math.max(todayLensPurchasesQty, todayMovLensIn);

  // Today's Lens Stock Out
  const todayRetailLensSold = todaySales.reduce(
    (acc, s) =>
      acc +
      (s.items || [])
        .filter(i => i.itemType === 'Lens' || i.code?.startsWith('LNS-'))
        .reduce((isum, i) => isum + (i.quantity || 0), 0),
    0
  );
  const todayWholesaleLensSold = wholesaleSales
    .filter(w => w.date === today)
    .reduce(
      (acc, w) =>
        acc +
        (w.items || [])
          .filter(i => i.itemType === 'Lens' || i.code?.startsWith('LNS-'))
          .reduce((isum, i) => isum + (i.quantity || 0), 0),
      0
    );
  const todaySpectacleLenses = spectacleOrders
    .filter(o => o.orderDate === today && (o.odMatchedLensSku || o.osMatchedLensSku))
    .reduce(
      (acc, o) => acc + (o.quantity || 1) * ((o.odMatchedLensSku ? 1 : 0) + (o.osMatchedLensSku ? 1 : 0)),
      0
    );
  const todayMovLensOut = stockMovements
    .filter(
      m =>
        (m.date === today || m.timestamp?.startsWith(today)) &&
        (m.itemType === 'Lens' || m.itemCode?.startsWith('LNS-')) &&
        m.qtyOut > 0
    )
    .reduce((sum, m) => sum + (m.qtyOut || 0), 0);
  const todayLensStockOut = Math.max(
    todayMovLensOut,
    todayRetailLensSold + todayWholesaleLensSold + todaySpectacleLenses
  );

  // Frame Inventory (Secondary)
  const totalFrameStock = frames.reduce((acc, f) => acc + f.currentStock, 0);
  const lowStockFrames = frames.filter(f => f.status === 'Low Stock');
  const outOfStockFrames = frames.filter(f => f.status === 'Out of Stock');

  // Valuation
  const lensValuation = lenses.reduce((acc, l) => acc + (l.currentStock || 0) * (l.retailRate || 0), 0);
  const frameValuation = frames.reduce((acc, f) => acc + (f.currentStock || 0) * (f.retailRate || 0), 0);
  const totalStockValuation = lensValuation + frameValuation;

  // Approximate financials
  const estimatedCost = totalRevenue * 0.42;
  const grossProfit = totalRevenue - estimatedCost;
  const netProfit = grossProfit * 0.82;

  // Recent Lens Stock Movements
  const recentLensMovements = stockMovements
    .filter(m => m.itemType === 'Lens' || m.itemCode?.startsWith('LNS-'))
    .slice(0, 6);

  // Follow-up due & CRM
  const followUpDueCustomers = customers.filter(c => c.segment === 'Follow-up Due');
  const pendingConsultations = appointments.filter(a => a.status === 'Waiting' || a.status === 'Booked');

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / Welcome with Fast Actions */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/30 text-teal-200 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-400/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                Optical Lens Command Hub & ERP
              </span>
              <span className="text-xs text-teal-200 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1 text-white tracking-tight">
              PAHARPUR EYE CARE & OPTICALS
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/80 mt-0.5 max-w-xl">
              Lens Stock Priority • Complete SPH/CYL/AXIS/ADD Matrix • POS Counter Sales • Direct Prescription Stock Matching
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setQuickModal('new-purchase')}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <Truck className="w-3.5 h-3.5" />
              + Stock In (Purchase)
            </button>
            <button
              onClick={() => setQuickModal('new-sale')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              + Retail Sale
            </button>
            <button
              onClick={() => setQuickModal('new-order')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <Glasses className="w-3.5 h-3.5" />
              + Spectacle Order
            </button>
            <button
              onClick={() => setActiveTab('entry-center')}
              className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-white/20 shadow-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-300" />
              Prescription Entry
            </button>
          </div>
        </div>
      </div>

      {/* 1. TODAY'S LIVE ACTIVITY METRICS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            Today's Live Activity (আজকের হিসাব)
          </h2>
          <span className="text-xs text-slate-500 font-medium">Real-time Firebase Sync</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 sm:gap-3">
          <div
            onClick={() => setActiveTab('appointments')}
            className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-semibold">Appointments</span>
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-lg font-black text-slate-900 mt-1">{todayAppointments.length}</p>
            <span className="text-[10px] text-blue-600 font-medium">
              {todayAppointments.filter(a => a.status === 'Waiting').length} in queue
            </span>
          </div>

          <div
            onClick={() => setActiveTab('patients')}
            className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-semibold">New Patients</span>
              <Users className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <p className="text-lg font-black text-slate-900 mt-1">{todayPatients.length}</p>
            <span className="text-[10px] text-teal-600 font-medium">{patients.length} total</span>
          </div>

          <div
            onClick={() => setActiveTab('entry-center')}
            className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-semibold">Consultations</span>
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <p className="text-lg font-black text-slate-900 mt-1">{todayVisits.length}</p>
            <span className="text-[10px] text-indigo-600 font-medium">Rx Completed</span>
          </div>

          <div
            onClick={() => setActiveTab('spectacles')}
            className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-semibold">Spectacle Orders</span>
              <Glasses className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-lg font-black text-slate-900 mt-1">{todayOrders.length}</p>
            <span className="text-[10px] text-amber-600 font-medium">Job cards</span>
          </div>

          <div
            onClick={() => setActiveTab('retail-sales')}
            className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-semibold">Today's Sales</span>
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-lg font-black text-slate-900 mt-1">₹{todaySalesTotal.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-emerald-600 font-medium">{todaySales.length} Invoices</span>
          </div>

          <div
            onClick={() => setActiveTab('dues')}
            className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-semibold">Collections</span>
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <p className="text-lg font-black text-slate-900 mt-1">₹{todayCollection.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-purple-600 font-medium">Cash/UPI/Card</span>
          </div>

          <div
            onClick={() => setActiveTab('dues')}
            className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition-all hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-semibold">Today's Due</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <p className="text-lg font-black text-slate-900 mt-1">₹{todayDue.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-rose-600 font-medium">To be collected</span>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY LENS STOCK HERO CARD (FRONT & CENTER) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* THE MAIN LENS STOCK HERO CARD */}
        <div
          id="primary-lens-stock-card"
          onClick={() => setActiveTab('lens-inventory')}
          className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-teal-500/40 shadow-lg cursor-pointer hover:border-teal-400 hover:shadow-xl transition-all group relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-500/20 transition-all duration-300"></div>

          {/* Card Top Title Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-800/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-400/30 group-hover:scale-105 transition-transform">
                <Disc className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                    🔍 LENS STOCK
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500 text-slate-950">
                    PRIMARY CORE INVENTORY
                  </span>
                </div>
                <p className="text-xs text-teal-200/80 font-medium">
                  Single Source Optical Power Matrix • Click to open Lens Stock Management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300 group-hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <span>Open Lens Catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* 6 Core Metrics Grid requested by user */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-5">
            
            {/* Metric 1: Total Lens Pieces */}
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] font-semibold text-teal-200 block">Total Lens Pieces</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white">{totalLensPieces}</span>
                <span className="text-xs text-teal-300 font-bold">pcs</span>
              </div>
              <span className="text-[11px] text-teal-300/70 font-mono mt-0.5 block">
                {totalLensPairs} pairs in hand
              </span>
            </div>

            {/* Metric 2: Available Lens Variants */}
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] font-semibold text-teal-200 block">Available Variants</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-300">{availableLensVariants}</span>
                <span className="text-xs text-teal-300 font-bold">/ {totalLensVariants}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono mt-0.5 block">
                Ready in stock
              </span>
            </div>

            {/* Metric 3: Low Stock Items */}
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] font-semibold text-amber-200 block">Low Stock Items</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-300">{lowStockLenses.length}</span>
                <span className="text-xs text-amber-200 font-bold">SKUs</span>
              </div>
              <span className="text-[11px] text-amber-300/80 font-medium mt-0.5 block">
                Below reorder limit
              </span>
            </div>

            {/* Metric 4: Out of Stock Items */}
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <span className="text-[11px] font-semibold text-rose-200 block">Out of Stock Items</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-rose-400">{outOfStockLenses.length}</span>
                <span className="text-xs text-rose-300 font-bold">SKUs</span>
              </div>
              <span className="text-[11px] text-rose-300/80 font-medium mt-0.5 block">
                0 stock remaining
              </span>
            </div>

            {/* Metric 5: Today's Lens Stock In */}
            <div className="bg-teal-500/20 backdrop-blur-xs p-3.5 rounded-2xl border border-teal-400/30">
              <span className="text-[11px] font-semibold text-teal-200 block flex items-center gap-1">
                <ArrowDownLeft className="w-3 h-3 text-teal-300" />
                Today's Lens Stock IN
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-teal-300">+{todayLensStockIn}</span>
                <span className="text-xs text-teal-200 font-bold">pairs</span>
              </div>
              <span className="text-[11px] text-teal-300/80 font-mono mt-0.5 block">
                Purchases & Receipts
              </span>
            </div>

            {/* Metric 6: Today's Lens Stock Out */}
            <div className="bg-rose-500/20 backdrop-blur-xs p-3.5 rounded-2xl border border-rose-400/30">
              <span className="text-[11px] font-semibold text-rose-200 block flex items-center gap-1">
                <ArrowUpRightIcon className="w-3 h-3 text-rose-300" />
                Today's Lens Stock OUT
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-rose-300">-{todayLensStockOut}</span>
                <span className="text-xs text-rose-200 font-bold">pairs</span>
              </div>
              <span className="text-[11px] text-rose-300/80 font-mono mt-0.5 block">
                Counter Sales & Orders
              </span>
            </div>

          </div>

          {/* Quick status footer note */}
          <div className="mt-4 pt-3 border-t border-teal-800/40 flex flex-wrap items-center justify-between text-xs text-teal-200/80">
            <span>Lens Valuation: <strong className="text-white font-bold">₹{lensValuation.toLocaleString('en-IN')}</strong></span>
            <span className="hover:underline flex items-center gap-1 text-teal-300 font-bold">
              Tap anywhere on this card to manage all lenses &rarr;
            </span>
          </div>
        </div>

        {/* SECONDARY OVERVIEWS (Financials & Frame Stock Secondary) */}
        <div className="space-y-4">
          
          {/* Business Financials Card */}
          <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                Financial Performance
              </h3>
              <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Healthy
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-600">Total Billed Revenue</span>
                <span className="font-black text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-600">Total Collected</span>
                <span className="font-black text-emerald-600">₹{totalCollected.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-600">Outstanding Due</span>
                <span className="font-black text-rose-600">₹{totalOutstandingDue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-teal-900 font-semibold">Net Estimated Margin</span>
                <span className="font-black text-teal-700 text-sm">₹{Math.round(netProfit).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Frame Stock Secondary Card (Accessible, but does NOT dominate) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Frame className="w-3.5 h-3.5 text-slate-500" />
                Frame Stock (Secondary)
              </span>
              <button
                onClick={() => setActiveTab('frame-inventory')}
                className="text-[11px] text-teal-700 font-bold hover:underline"
              >
                View Frames &rarr;
              </button>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-xl font-black text-slate-800">{totalFrameStock}</span>
                <span className="text-xs text-slate-500 font-semibold ml-1">units ({frames.length} models)</span>
              </div>
              <div className="text-right text-[11px]">
                <span className="text-amber-600 font-bold">{lowStockFrames.length} low</span>
                <span className="text-slate-400 mx-1">•</span>
                <span className="text-rose-600 font-bold">{outOfStockFrames.length} out</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Main business focus is lens stock; frame inventory accessible via Stock tab.
            </p>
          </div>

        </div>

      </div>

      {/* 3. QUICK LENS SEARCH — EMBEDDED DIRECTLY BELOW KPI CARDS */}
      <QuickLensSearchSection />

      {/* 4. LOW STOCK ALERTS (LENS INVENTORY PRIORITY) */}
      <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Optical Lens Stock Alerts & Reorder Priorities
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              {outOfStockLenses.length + lowStockLenses.length} Lens SKUs
            </span>
          </div>
          <button
            onClick={() => setActiveTab('lens-inventory')}
            className="text-xs text-teal-600 font-bold hover:underline"
          >
            Manage All Lenses &rarr;
          </button>
        </div>

        {outOfStockLenses.length === 0 && lowStockLenses.length === 0 ? (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-emerald-950">All Lens Stock Variants are Healthy</p>
            <p className="text-[11px] text-emerald-700">No lenses currently below safety reorder threshold.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Out of Stock Lenses first */}
            {outOfStockLenses.slice(0, 4).map(l => (
              <div
                key={l.lensCode}
                className="flex items-center justify-between p-3 rounded-2xl border-2 border-rose-200 bg-rose-50/60 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-rose-200 text-rose-800 font-bold">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-rose-950">OUT OF STOCK</span>
                      <span className="font-mono text-[11px] text-rose-700">({l.lensCode})</span>
                    </div>
                    <p className="text-[11px] text-rose-900 font-medium mt-0.5">
                      {l.brand} • SPH {l.sph || '0.00'} / CYL {l.cyl || '0.00'} • {l.coating}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setQuickModal('new-purchase')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-2xs transition active:scale-95 shrink-0"
                >
                  + Reorder
                </button>
              </div>
            ))}

            {/* Low Stock Lenses */}
            {lowStockLenses.slice(0, 4).map(l => (
              <div
                key={l.lensCode}
                className="flex items-center justify-between p-3 rounded-2xl border-2 border-amber-200 bg-amber-50/60 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-amber-200 text-amber-900 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-amber-950">LOW STOCK ({l.currentStock} pairs)</span>
                      <span className="font-mono text-[11px] text-amber-800">({l.lensCode})</span>
                    </div>
                    <p className="text-[11px] text-amber-900 font-medium mt-0.5">
                      {l.brand} • SPH {l.sph || '0.00'} / CYL {l.cyl || '0.00'} • Reorder: {l.reorderLevel || 8}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setQuickModal('new-purchase')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-2xs transition active:scale-95 shrink-0"
                >
                  + Reorder
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. RECENT LENS STOCK MOVEMENT (Live Ledger Activity) */}
      <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Recent Lens Stock Movements (স্টক লেজার মুভমেন্ট)
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('stock-ledger')}
            className="text-xs text-teal-600 font-bold hover:underline"
          >
            Full Stock Ledger &rarr;
          </button>
        </div>

        {recentLensMovements.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-1" />
            No recent lens movements logged today. Sales and purchases automatically update this live feed.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Lens SKU</th>
                  <th className="py-2.5 px-3">Item Details</th>
                  <th className="py-2.5 px-3">Movement Type</th>
                  <th className="py-2.5 px-3">Ref #</th>
                  <th className="py-2.5 px-3 text-right">In / Out</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                  <th className="py-2.5 px-3">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLensMovements.map((m, idx) => (
                  <tr key={m.id || `mov-${idx}`} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-600">
                      {m.date} {m.time ? `• ${m.time}` : ''}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-700">
                      {m.itemCode}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {m.itemName}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold">
                        {m.movementType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                      {m.reference || 'DIRECT'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black">
                      {m.qtyIn > 0 ? (
                        <span className="text-emerald-700">+{m.qtyIn} pairs</span>
                      ) : (
                        <span className="text-rose-700">-{m.qtyOut} pairs</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                      {m.stockAfter !== undefined ? `${m.stockAfter} pairs` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {m.user || 'Store Desk'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. TODAY'S PATIENT QUEUE & SPECTACLE ORDERS WORKFLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Waiting Appointments Queue */}
        <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Today's Patient Queue ({appointments.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs text-teal-600 font-semibold hover:underline"
            >
              View All &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {appointments.slice(0, 4).map(apt => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 bg-slate-50/60 hover:bg-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    {apt.patientName?.[0] || 'P'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">{apt.patientName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {apt.mrd}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {apt.time} • {apt.visitType} • {apt.doctor}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      apt.status === 'In Consultation'
                        ? 'bg-amber-100 text-amber-800'
                        : apt.status === 'Waiting'
                        ? 'bg-blue-100 text-blue-800'
                        : apt.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {apt.status}
                  </span>

                  {apt.status !== 'Completed' && (
                    <button
                      id={`start-visit-${apt.id}`}
                      onClick={() => startVisitFromAppointment(apt.id)}
                      className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-transform hover:scale-105 shadow-2xs"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      Start Visit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Spectacle Orders */}
        <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Glasses className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Live Spectacle Orders ({spectacleOrders.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('spectacles')}
              className="text-xs text-teal-600 font-semibold hover:underline"
            >
              All Orders &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {spectacleOrders.slice(0, 4).map(ord => (
              <div
                key={ord.orderId}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 bg-slate-50/60 hover:bg-white transition-all text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{ord.customerName}</span>
                    <span className="text-[10px] font-mono text-teal-700 font-bold">{ord.orderId}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Frame: {ord.frameBrand || 'Customer Frame'} • Lens: <strong className="text-teal-900">{ord.lensBrand || 'Central Lens'}</strong>
                  </p>
                </div>

                <div className="text-right flex items-center gap-2">
                  <div>
                    <span className="font-bold text-slate-900 block">₹{ord.total}</span>
                    <span className={`text-[10px] font-semibold ${ord.due > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {ord.due > 0 ? `Due: ₹${ord.due}` : 'Paid'}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ord.status === 'Ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'In Production'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
