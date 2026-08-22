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
  Play
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    patients,
    appointments,
    visits,
    spectacleOrders,
    retailSales,
    frames,
    lenses,
    payments,
    customers,
    setActiveTab,
    startVisitFromAppointment,
    setQuickModal,
    setSelectedPatientFor360
  } = useErp();

  const today = new Date().toISOString().split('T')[0];

  // Today metrics
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
  
  // Frame & Lens inventory values
  const totalFrameStock = frames.reduce((acc, f) => acc + f.currentStock, 0);
  const totalLensStock = lenses.reduce((acc, l) => acc + l.currentStock, 0);
  const frameValuation = frames.reduce((acc, f) => acc + f.currentStock * f.retailRate, 0);
  const lensValuation = lenses.reduce((acc, l) => acc + l.currentStock * l.retailRate, 0);
  const totalStockValuation = frameValuation + lensValuation;

  // Approximate cost & gross profit
  const estimatedCost = totalRevenue * 0.42; // ~42% COGS
  const grossProfit = totalRevenue - estimatedCost;
  const netProfit = grossProfit * 0.82; // deducting operational expenses

  // Stock alerts
  const lowStockFrames = frames.filter(f => f.status === 'Low Stock');
  const outOfStockFrames = frames.filter(f => f.status === 'Out of Stock');
  const lowStockLenses = lenses.filter(l => l.status === 'Low Stock');
  const outOfStockLenses = lenses.filter(l => l.status === 'Out of Stock');

  // Follow-up due & CRM
  const followUpDueCustomers = customers.filter(c => c.segment === 'Follow-up Due');
  const pendingConsultations = appointments.filter(a => a.status === 'Waiting' || a.status === 'Booked');

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / Welcome with 1-Click Fast Actions */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/30 text-teal-200 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-400/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                CEO Control Room & Command Station
              </span>
              <span className="text-xs text-teal-200 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white tracking-tight">
              Paharpur Eye Care & Optical ERP
            </h1>
            <p className="text-sm text-teal-100/80 mt-0.5 max-w-xl">
              1-Click seamless integrated flow linking Patients, Clinical Examinations, Prescription slips, Lens & Frame Stock Ledgers, Spectacle Orders, and Google Sheets.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('entry-center')}
              className="bg-white hover:bg-teal-50 text-teal-900 font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Stethoscope className="w-4 h-4 text-teal-700" />
              ⚡ Open Entry Center
            </button>
            <button
              onClick={() => setQuickModal('new-order')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Glasses className="w-4 h-4" />
              + Spectacle Order
            </button>
            <button
              onClick={() => setQuickModal('new-sale')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4" />
              + Retail Sale
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: TODAY'S LIVE NUMBERS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            Today's Live Activity (আজকের হিসাব)
          </h2>
          <span className="text-xs text-slate-500 font-medium">Real-time sync</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div
            onClick={() => setActiveTab('appointments')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition-all hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Appointments</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{todayAppointments.length}</p>
            <span className="text-[11px] text-blue-600 font-medium">
              {todayAppointments.filter(a => a.status === 'Waiting').length} waiting in queue
            </span>
          </div>

          <div
            onClick={() => setActiveTab('patients')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition-all hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">New Patients</span>
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{todayPatients.length}</p>
            <span className="text-[11px] text-teal-600 font-medium">Total: {patients.length} active</span>
          </div>

          <div
            onClick={() => setActiveTab('entry-center')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition-all hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Consultations</span>
              <Stethoscope className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{todayVisits.length}</p>
            <span className="text-[11px] text-indigo-600 font-medium">Prescriptions done</span>
          </div>

          <div
            onClick={() => setActiveTab('spectacles')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition-all hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Spectacle Orders</span>
              <Glasses className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{todayOrders.length}</p>
            <span className="text-[11px] text-amber-600 font-medium">Job cards active</span>
          </div>

          <div
            onClick={() => setActiveTab('retail-sales')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition-all hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Today's Sales</span>
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">₹{todaySalesTotal.toLocaleString('en-IN')}</p>
            <span className="text-[11px] text-emerald-600 font-medium">{todaySales.length} Invoices</span>
          </div>

          <div
            onClick={() => setActiveTab('dues')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition-all hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Collections</span>
              <CreditCard className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">₹{todayCollection.toLocaleString('en-IN')}</p>
            <span className="text-[11px] text-purple-600 font-medium">Cash/UPI/Card</span>
          </div>

          <div
            onClick={() => setActiveTab('dues')}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-500 cursor-pointer transition-all hover:shadow-sm"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Today's Due</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">₹{todayDue.toLocaleString('en-IN')}</p>
            <span className="text-[11px] text-rose-600 font-medium">To be collected</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: BUSINESS & INVENTORY MASTER KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Business KPI Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              Business & Financial KPIs
            </h3>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
              Healthy Margin
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Total Billed Revenue</span>
              <span className="font-bold text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Total Cash/UPI Collected</span>
              <span className="font-bold text-emerald-600">₹{totalCollected.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Total Outstanding Due</span>
              <span className="font-bold text-rose-600">₹{totalOutstandingDue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Estimated Gross Profit</span>
              <span className="font-bold text-slate-900">₹{Math.round(grossProfit).toLocaleString('en-IN')} (~58%)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 text-sm font-semibold">
              <span className="text-teal-900">Net Estimated Profit</span>
              <span className="font-bold text-teal-700 text-base">₹{Math.round(netProfit).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Inventory KPI Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Disc className="w-4 h-4 text-blue-600" />
              Central Inventory & Stock
            </h3>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Valuation: ₹{(totalStockValuation / 1000).toFixed(1)}k
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-sm">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Disc className="w-3.5 h-3.5 text-slate-400" />
                Lens Stock (Single Source)
              </span>
              <span className="font-bold text-slate-900">{totalLensStock} pairs ({lenses.length} SKUs)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-sm">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Frame className="w-3.5 h-3.5 text-slate-400" />
                Frame Stock (All Brands)
              </span>
              <span className="font-bold text-slate-900">{totalFrameStock} units ({frames.length} Models)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Low Stock Alert</span>
              <span className="font-bold text-amber-600">{lowStockFrames.length + lowStockLenses.length} items</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Out of Stock Alert</span>
              <span className="font-bold text-rose-600">{outOfStockFrames.length + outOfStockLenses.length} items</span>
            </div>
            <div className="flex justify-between items-center py-1.5 text-sm">
              <span className="text-slate-600">Reorder Priority Items</span>
              <button
                onClick={() => setActiveTab('lens-inventory')}
                className="text-xs text-teal-600 font-bold hover:underline"
              >
                View Reorder List &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Clinical & CRM KPI Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Clinical & CRM Insights
            </h3>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              {patients.length} Total Patients
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Total Clinical Visits Recorded</span>
              <span className="font-bold text-slate-900">{visits.length} records</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Spectacle Conversion Rate</span>
              <span className="font-bold text-emerald-600">
                {visits.length ? Math.round((spectacleOrders.length / visits.length) * 100) : 75}%
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Follow-up Due Patients</span>
              <span className="font-bold text-amber-600">{followUpDueCustomers.length} patients</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Waiting in Consultation Queue</span>
              <span className="font-bold text-blue-600">{pendingConsultations.length} appointments</span>
            </div>
            <div className="flex justify-between items-center py-1.5 text-sm">
              <span className="text-slate-600">WhatsApp Notification Hub</span>
              <button
                onClick={() => setActiveTab('crm')}
                className="text-xs text-teal-600 font-bold hover:underline"
              >
                Send Reminders &rarr;
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: STOCK ALERTS & WAITING PATIENTS QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Waiting Appointments Queue (1-Click START VISIT!) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
              <h3 className="font-bold text-slate-900 text-sm">
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

        {/* Automatic Stock Alert Center */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Central Inventory Stock Alert Center
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('lens-inventory')}
              className="text-xs text-teal-600 font-semibold hover:underline"
            >
              Manage Stock &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Out of stock items */}
            {outOfStockFrames.map(f => (
              <div
                key={f.sku}
                className="flex items-center justify-between p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <div>
                    <span className="font-bold text-rose-900">OUT OF STOCK: {f.brand}</span>
                    <p className="text-[11px] text-rose-700">{f.sku} — {f.model}</p>
                  </div>
                </div>
                <button
                  onClick={() => setQuickModal('new-purchase')}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px]"
                >
                  + Reorder
                </button>
              </div>
            ))}

            {outOfStockLenses.map(l => (
              <div
                key={l.lensCode}
                className="flex items-center justify-between p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <div>
                    <span className="font-bold text-rose-900">OUT OF STOCK: {l.brand}</span>
                    <p className="text-[11px] text-rose-700">{l.lensCode} — {l.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setQuickModal('new-purchase')}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px]"
                >
                  + Reorder
                </button>
              </div>
            ))}

            {/* Low stock items */}
            {lowStockFrames.slice(0, 2).map(f => (
              <div
                key={f.sku}
                className="flex items-center justify-between p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <div>
                    <span className="font-bold text-amber-900">LOW STOCK ({f.currentStock} left): {f.brand}</span>
                    <p className="text-[11px] text-amber-700">{f.sku} — Reorder level: {f.reorderLevel}</p>
                  </div>
                </div>
                <button
                  onClick={() => setQuickModal('new-purchase')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px]"
                >
                  Order
                </button>
              </div>
            ))}

            {lowStockLenses.slice(0, 2).map(l => (
              <div
                key={l.lensCode}
                className="flex items-center justify-between p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <div>
                    <span className="font-bold text-amber-900">LOW STOCK ({l.currentStock} pairs): {l.brand}</span>
                    <p className="text-[11px] text-amber-700">{l.lensCode} — {l.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setQuickModal('new-purchase')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px]"
                >
                  Order
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION 4: RECENT SPECTACLE ORDERS & READY FOR PICKUP */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Glasses className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Live Spectacle Orders Optical Workflow
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('spectacles')}
            className="text-xs text-teal-600 font-semibold hover:underline"
          >
            All Orders &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Patient / Customer</th>
                <th className="py-2.5 px-3">Frame & Lens Specification</th>
                <th className="py-2.5 px-3">Delivery Date</th>
                <th className="py-2.5 px-3">Amount & Due</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {spectacleOrders.slice(0, 4).map(ord => (
                <tr key={ord.orderId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{ord.orderId}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{ord.customerName}</div>
                    <div className="text-[11px] text-slate-500">{ord.mrd} • {ord.mobile}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-800">{ord.frameBrand}</div>
                    <div className="text-[11px] text-teal-700">{ord.lensBrand}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">{ord.deliveryDate}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">₹{ord.total}</div>
                    <div className={`text-[11px] font-semibold ${ord.due > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {ord.due > 0 ? `Due: ₹${ord.due}` : 'Fully Paid'}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'Ready'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'In Production'
                          ? 'bg-amber-100 text-amber-800'
                          : ord.status === 'Lens Ordered'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'Delivered'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setActiveTab('spectacles')}
                      className="text-teal-600 hover:text-teal-800 font-bold hover:underline"
                    >
                      Manage &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
