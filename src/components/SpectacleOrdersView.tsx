import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { SpectacleOrder, SpectacleOrderStatus } from '../types';
import {
  Glasses,
  Plus,
  Search,
  Printer,
  MessageCircle,
  CheckCircle,
  Truck,
  Clock,
  Check,
  Disc,
  Frame,
  AlertTriangle,
  Eye,
  Edit3,
  CreditCard,
  Send,
  User,
  Filter,
  DollarSign,
  Archive,
  RotateCcw,
  Trash2,
  XCircle
} from 'lucide-react';
import { EditSpectacleOrderModal } from './EditSpectacleOrderModal';
import { ViewSpectacleOrderModal } from './ViewSpectacleOrderModal';
import { CollectOrderPaymentModal } from './CollectOrderPaymentModal';

export const SpectacleOrdersView: React.FC = () => {
  const {
    spectacleOrders,
    customers,
    updateSpectacleOrderStatus,
    setSelectedCustomerFor360,
    setQuickModal,
    setPrintModalData,
    archiveSpectacleOrder,
    restoreSpectacleOrder,
    deleteSpectacleOrder,
    cancelSpectacleOrder,
    showToast
  } = useErp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Active');

  // Modals state
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<SpectacleOrder | null>(null);
  const [selectedOrderForView, setSelectedOrderForView] = useState<SpectacleOrder | null>(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<SpectacleOrder | null>(null);

  const statusList: SpectacleOrderStatus[] = [
    'New',
    'Confirmed',
    'Lens Ordered',
    'In Production',
    'Ready',
    'Delivered',
    'Cancelled'
  ];

  // Metric counts
  const totalOrders = spectacleOrders.length;
  const inProductionCount = spectacleOrders.filter(o => o.status === 'In Production' || o.status === 'Lens Ordered').length;
  const readyCount = spectacleOrders.filter(o => o.status === 'Ready').length;
  const deliveredCount = spectacleOrders.filter(o => o.status === 'Delivered').length;
  const totalDueAmount = spectacleOrders.reduce((sum, o) => sum + (o.due || 0), 0);

  const filtered = spectacleOrders.filter(o => {
    const q = (search || '').trim().toLowerCase();
    const oId = (o.orderId || '').toLowerCase();
    const cName = (o.customerName || '').toLowerCase();
    const mrd = (o.mrd || '').toLowerCase();
    const mob = o.mobile || '';
    const fBrand = (o.frameBrand || '').toLowerCase();
    const lBrand = (o.lensBrand || '').toLowerCase();

    const matchesSearch =
      !q ||
      oId.includes(q) ||
      cName.includes(q) ||
      mrd.includes(q) ||
      mob.includes(search) ||
      fBrand.includes(q) ||
      lBrand.includes(q);

    let matchesStatus = true;
    if (filterStatus === 'Active') matchesStatus = o.status !== 'Archived';
    else if (filterStatus === 'Archived') matchesStatus = o.status === 'Archived';
    else if (filterStatus !== 'All') matchesStatus = o.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleArchiveOrder = (orderId: string, name: string) => {
    const reason = prompt(`Reason for archiving order #${orderId} (${name}):`, 'Cancelled / Old Order');
    if (reason !== null) {
      archiveSpectacleOrder(orderId, reason || 'Archived by Admin');
    }
  };

  const handleRestoreOrder = (orderId: string, name: string) => {
    if (window.confirm(`Restore order #${orderId} (${name}) to New / Active status?`)) {
      restoreSpectacleOrder(orderId);
    }
  };

  const handleDeleteOrder = (orderId: string, name: string) => {
    const confirmText = prompt(
      `⚠️ ADMIN PERMANENT DELETE\nThis will permanently remove spectacle order #${orderId} (${name}).\nType "DELETE" to confirm:`
    );
    if (confirmText === 'DELETE') {
      deleteSpectacleOrder(orderId);
    } else if (confirmText !== null) {
      showToast('Deletion cancelled: text did not match DELETE', 'warning');
    }
  };

  const handleWhatsAppReady = (order: SpectacleOrder) => {
    const phone = order.whatsapp || order.mobile;
    const cleanMobile = phone.replace(/[^0-9]/g, '');
    const fullNumber = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    
    let msg = `Dear ${order.customerName},\nGreetings from Paharpur Eye Care! Your Spectacle Order (${order.orderId}) update: Status: ${order.status}, Net Total: ₹${order.total}, Due: ₹${order.due}.`;
    if (order.status === 'Ready') {
      msg = `Dear ${order.customerName},\nGreetings from Paharpur Eye Care! 👓 Your custom Spectacle Order (${order.orderId}) is READY for collection. Frame: ${order.frameBrand || 'Selected Frame'}. Balance Due: ₹${order.due}. Please visit our optical store to collect your glasses. Thank you!`;
    }
    window.open(`https://wa.me/${fullNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePrintSlip = (order: SpectacleOrder) => {
    setPrintModalData({
      type: 'spectacle-order',
      data: order
    });
  };

  const handleDeliver = (order: SpectacleOrder) => {
    updateSpectacleOrderStatus(order.orderId, 'Delivered');
    if (order.due > 0) {
      showToast(`Order marked Delivered. Outstanding due balance is ₹${order.due}.`, 'info');
    } else {
      showToast(`Order ${order.orderId} delivered successfully!`, 'success');
    }
  };

  const handleOpenCustomer360 = (order: SpectacleOrder) => {
    const matchedCust = customers.find(
      c => (order.customerId && c.customerId === order.customerId) ||
           (order.mrd && c.mrd === order.mrd) ||
           c.mobile === order.mobile
    );

    if (matchedCust) {
      setSelectedCustomerFor360(matchedCust);
    } else {
      // Create a temporary viewable customer object
      setSelectedCustomerFor360({
        customerId: order.customerId || `CUST-${order.mobile}`,
        mrd: order.mrd,
        name: order.customerName,
        mobile: order.mobile,
        whatsapp: order.whatsapp || order.mobile,
        age: order.age,
        gender: order.gender,
        address: order.address,
        totalPurchases: 1,
        lifetimeValue: order.total,
        outstandingDue: order.due,
        loyaltyPoints: 0,
        segment: 'Spectacle Buyer',
        status: 'Active'
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner & Highlights */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-amber-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Glasses className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Spectacle Orders & Optical Lab (চশমা অর্ডার ও ল্যাব)
              </h1>
            </div>
            <p className="text-xs text-amber-200/80 mt-1 max-w-2xl">
              Comprehensive optical order tracking: 1-Click View, Edit, Custom Pricing Override, Due Collection, WhatsApp Alerts, and Instant Job Card Slips.
            </p>
          </div>

          <button
            id="btn-new-spectacle-order"
            onClick={() => setQuickModal('new-order')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer self-start md:self-auto hover:scale-102"
          >
            <Plus className="w-4 h-4" /> + Book New Spectacle Order
          </button>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-amber-200">Total Orders</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{totalOrders}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-amber-200">Fitting / In Lab</p>
            <p className="text-xl font-extrabold text-amber-300 mt-0.5">{inProductionCount}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-amber-200">Ready for Pickup</p>
            <p className="text-xl font-extrabold text-cyan-300 mt-0.5">{readyCount}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-amber-200">Delivered</p>
            <p className="text-xl font-extrabold text-emerald-300 mt-0.5">{deliveredCount}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs col-span-2 sm:col-span-1">
            <p className="text-[11px] text-amber-200">Pending Order Dues</p>
            <p className="text-xl font-extrabold text-rose-300 mt-0.5">₹{totalDueAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Order ID, Customer, Mobile, Frame..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 whitespace-nowrap mr-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['All', 'In Production', 'Ready', 'Lens Ordered', 'Delivered', 'New'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer & Profile</th>
                <th className="py-3.5 px-4">Frame & Lens Specification</th>
                <th className="py-3.5 px-4">Bill, Paid & Due</th>
                <th className="py-3.5 px-4">Delivery Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">1-Click Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    No spectacle orders found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(order => (
                  <tr key={order.orderId} className="hover:bg-amber-50/40 transition-colors">
                    
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <button
                        onClick={() => setSelectedOrderForView(order)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2 py-1 rounded-md text-[11px] font-extrabold cursor-pointer transition-colors block text-left"
                      >
                        {order.orderId}
                      </button>
                      <span className="block text-[10px] text-slate-400 mt-1 font-medium">
                        Booked: {order.orderDate || 'Today'}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleOpenCustomer360(order)}
                        className="font-bold text-slate-900 hover:text-amber-700 text-sm flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                        title="Click to view Customer 360 profile"
                      >
                        {order.customerName}
                        <User className="w-3 h-3 text-slate-400" />
                      </button>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {order.mrd ? <span className="font-mono text-emerald-700 font-semibold mr-1">[{order.mrd}]</span> : null}
                        {order.mobile}
                      </div>
                      {order.rxId && (
                        <span className="text-[10px] text-teal-700 font-semibold block mt-0.5">
                          Linked Rx: {order.rxId}
                        </span>
                      )}
                    </td>

                    {/* Frame & Lens */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                        <Frame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate max-w-[180px]" title={order.frameBrand || order.frameSku}>
                          {order.frameBrand || order.frameSku || 'Custom Frame'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">₹{order.frameRate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-teal-800 text-[11px] font-semibold mt-0.5">
                        <Disc className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate max-w-[180px]" title={order.lensBrand || order.lensCode}>
                          {order.lensBrand || order.lensCode || 'Custom Lens'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">₹{order.lensRate}</span>
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 text-sm">₹{order.total}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Paid: <span className="text-emerald-700 font-bold">₹{order.advance || order.paid || 0}</span>
                        {order.due > 0 ? (
                          <span className="ml-1 text-rose-600 font-bold">• Due: ₹{order.due}</span>
                        ) : (
                          <span className="ml-1 text-emerald-600 font-bold">• Full Paid</span>
                        )}
                      </div>
                    </td>

                    {/* Delivery Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {order.deliveryDate}
                      </div>
                      {order.assignedTechnician && (
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Lab: {order.assignedTechnician}
                        </span>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={e => updateSpectacleOrderStatus(order.orderId, e.target.value as SpectacleOrderStatus)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border cursor-pointer ${
                          order.status === 'Ready'
                            ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                            : order.status === 'In Production'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : order.status === 'Lens Ordered'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        {statusList.map(st => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* 1-Click Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* 1. View Button */}
                        <button
                          onClick={() => setSelectedOrderForView(order)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title="View Complete Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* 2. Edit Button */}
                        <button
                          onClick={() => setSelectedOrderForEdit(order)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title="Edit Order, Pricing, Power & Customer Info"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* 3. Collect Payment Button (If Due > 0) */}
                        {order.due > 0 && (
                          <button
                            onClick={() => setSelectedOrderForPayment(order)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title={`Collect Payment (Due: ₹${order.due})`}
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}

                        {/* 4. WhatsApp Ready Alert */}
                        <button
                          onClick={() => handleWhatsAppReady(order)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title="Send WhatsApp Ready / Status Alert"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* 5. Print Invoice / Slip */}
                        <button
                          onClick={() => handlePrintSlip(order)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title="Print Spectacle Job Slip & Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* 6. Deliver 1-Click Button */}
                        {order.status !== 'Delivered' && (
                          <button
                            onClick={() => handleDeliver(order)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Mark as Delivered"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Deliver
                          </button>
                        )}

                        {/* 7. Archive / Restore */}
                        {order.status === 'Archived' ? (
                          <button
                            onClick={() => handleRestoreOrder(order.orderId, order.customerName)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Restore Order"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchiveOrder(order.orderId, order.customerName)}
                            className="p-1.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Archive Order"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        {/* 8. Permanent Delete */}
                        <button
                          onClick={() => handleDeleteOrder(order.orderId, order.customerName)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title="Permanent Delete (Admin Only)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Order Modal */}
      {selectedOrderForView && (
        <ViewSpectacleOrderModal
          order={selectedOrderForView}
          onClose={() => setSelectedOrderForView(null)}
          onEdit={() => {
            const ord = selectedOrderForView;
            setSelectedOrderForView(null);
            setSelectedOrderForEdit(ord);
          }}
          onCollectPayment={() => {
            const ord = selectedOrderForView;
            setSelectedOrderForView(null);
            setSelectedOrderForPayment(ord);
          }}
          onPrint={() => handlePrintSlip(selectedOrderForView)}
        />
      )}

      {/* Edit Order Modal */}
      {selectedOrderForEdit && (
        <EditSpectacleOrderModal
          order={selectedOrderForEdit}
          onClose={() => setSelectedOrderForEdit(null)}
        />
      )}

      {/* Collect Payment Modal */}
      {selectedOrderForPayment && (
        <CollectOrderPaymentModal
          order={selectedOrderForPayment}
          onClose={() => setSelectedOrderForPayment(null)}
        />
      )}

    </div>
  );
};

