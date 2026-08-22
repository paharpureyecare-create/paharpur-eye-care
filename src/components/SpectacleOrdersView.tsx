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
  AlertTriangle
} from 'lucide-react';

export const SpectacleOrdersView: React.FC = () => {
  const {
    spectacleOrders,
    updateSpectacleOrderStatus,
    setQuickModal,
    setPrintModalData,
    collectDuePayment,
    showToast
  } = useErp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const statusList: SpectacleOrderStatus[] = [
    'New',
    'Confirmed',
    'Lens Ordered',
    'In Production',
    'Ready',
    'Delivered',
    'Cancelled'
  ];

  const filtered = spectacleOrders.filter(o => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.mrd.toLowerCase().includes(search.toLowerCase()) ||
      o.mobile.includes(search) ||
      (o.frameBrand && o.frameBrand.toLowerCase().includes(search.toLowerCase())) ||
      (o.lensBrand && o.lensBrand.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleWhatsAppReady = (order: SpectacleOrder) => {
    const cleanMobile = order.mobile.replace(/[^0-9]/g, '');
    const fullNumber = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const msg = encodeURIComponent(
      `Dear ${order.customerName}, your spectacle order (${order.orderId}) is READY for collection at Paharpur Eye Care! Frame: ${order.frameBrand}. Balance Due: ₹${order.due}. Please visit our clinic to collect your custom glasses. Thank you!`
    );
    window.open(`https://wa.me/${fullNumber}?text=${msg}`, '_blank');
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
      showToast(`Order marked Delivered. Due balance is ₹${order.due}. You can collect payment from Due Management.`, 'info');
    } else {
      showToast(`Order ${order.orderId} delivered successfully!`, 'success');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Glasses className="w-5 h-5 text-amber-600" />
              Spectacle Orders & Optical Lab (চশমা অর্ডার ও ল্যাব)
            </h1>
            <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
              {spectacleOrders.length} Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Complete optical workflow linking patient prescription, frame & lens inventory deduction, lab fittings, and delivery
          </p>
        </div>

        <button
          id="btn-new-spectacle-order"
          onClick={() => setQuickModal('new-order')}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + New Spectacle Order
        </button>
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
            placeholder="Search Order ID, Patient, Mobile, Frame..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'In Production', 'Ready', 'Lens Ordered', 'Delivered'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? 'bg-amber-600 text-white shadow-2xs'
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
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer / MRD</th>
                <th className="py-3 px-4">Frame & Lens Selection</th>
                <th className="py-3 px-4">Pricing & Advance</th>
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4">Production Status</th>
                <th className="py-3 px-4 text-right">1-Click Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No spectacle orders found matching your filter.
                  </td>
                </tr>
              ) : (
                filtered.map(order => (
                  <tr key={order.orderId} className="hover:bg-amber-50/30 transition-colors">
                    
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-md text-[11px] font-extrabold">
                        {order.orderId}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1 font-medium">
                        Booked: {order.orderDate}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500">
                        {order.mrd} • {order.mobile}
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
                        {order.frameBrand || order.frameSku}
                      </div>
                      <div className="flex items-center gap-1.5 text-teal-800 text-[11px] font-semibold mt-0.5">
                        <Disc className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        {order.lensBrand || order.lensCode}
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 text-sm">₹{order.total}</div>
                      <div className="text-[11px] text-slate-500">
                        Adv: <span className="text-emerald-700 font-bold">₹{order.advance}</span>
                        {order.due > 0 ? (
                          <span className="ml-1 text-rose-600 font-bold">• Due: ₹{order.due}</span>
                        ) : (
                          <span className="ml-1 text-emerald-600 font-bold">• Paid</span>
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
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : order.status === 'In Production'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : order.status === 'Lens Ordered'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : order.status === 'Delivered'
                            ? 'bg-slate-100 text-slate-800 border-slate-300'
                            : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                        }`}
                      >
                        {statusList.map(st => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* WhatsApp Ready Trigger */}
                        <button
                          onClick={() => handleWhatsAppReady(order)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors"
                          title="Send WhatsApp Ready for Pickup Alert"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* Print Job Card Slip */}
                        <button
                          onClick={() => handlePrintSlip(order)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                          title="Print Spectacle Job Card & Customer Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Deliver button */}
                        {order.status !== 'Delivered' && (
                          <button
                            onClick={() => handleDeliver(order)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Deliver
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
