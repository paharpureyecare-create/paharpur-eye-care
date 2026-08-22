import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { RetailSale, PaymentMethod } from '../types';
import {
  ShoppingBag,
  Plus,
  Search,
  Printer,
  CreditCard,
  QrCode,
  Banknote,
  DollarSign,
  Trash2,
  CheckCircle,
  Tag
} from 'lucide-react';

export const RetailSalesView: React.FC = () => {
  const { retailSales, setQuickModal, setPrintModalData } = useErp();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('All');

  const filtered = retailSales.filter(s => {
    const matchesSearch =
      s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (s.mrd && s.mrd.toLowerCase().includes(search.toLowerCase())) ||
      (s.mobile && s.mobile.includes(search));

    const matchesMethod = methodFilter === 'All' || s.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalSalesRevenue = retailSales.reduce((acc, s) => acc + s.netTotal, 0);
  const totalDueAmount = retailSales.reduce((acc, s) => acc + s.due, 0);

  const handlePrint = (sale: RetailSale) => {
    setPrintModalData({
      type: 'invoice',
      data: sale
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-teal-600" />
              Retail Optical POS & Invoicing (কাউন্টার সেলস ও বিলিং)
            </h1>
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              Instant Bill Generator
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Quick billing for frames, lenses, solutions, reading glasses, sunglasses & accessories with GST receipts
          </p>
        </div>

        <button
          id="btn-new-retail-pos"
          onClick={() => setQuickModal('new-sale')}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + New Counter Sale (POS)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Retail Revenue</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹{totalSalesRevenue.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-500">{retailSales.length} Total Completed Invoices</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Outstanding Due</span>
          <p className="text-2xl font-black text-rose-600 mt-1">₹{totalDueAmount.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-rose-700 font-semibold">Uncollected retail credit</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Average Bill Size</span>
          <p className="text-2xl font-black text-teal-700 mt-1">
            ₹{retailSales.length > 0 ? Math.round(totalSalesRevenue / retailSales.length).toLocaleString('en-IN') : 0}
          </p>
          <span className="text-[11px] text-slate-500">Per patient ticket average</span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Invoice #, Customer, MRD..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'Cash', 'UPI', 'Card', 'Due'].map(pm => (
            <button
              key={pm}
              onClick={() => setMethodFilter(pm)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                methodFilter === pm
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {pm}
            </button>
          ))}
        </div>
      </div>

      {/* Retail Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Invoice # & Date</th>
                <th className="py-3 px-4">Customer Name & Mobile</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Total & Discount</th>
                <th className="py-3 px-4">Paid / Due</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(sale => (
                <tr key={sale.invoiceNo} className="hover:bg-teal-50/30 transition-colors">
                  
                  {/* Invoice */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-teal-950 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-[11px] block w-fit">
                      {sale.invoiceNo}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">
                      {sale.date}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">{sale.customerName}</div>
                    <div className="text-[11px] text-slate-500">
                      {sale.mrd ? `MRD: ${sale.mrd} • ` : ''}{sale.mobile || 'Walk-in customer'}
                    </div>
                  </td>

                  {/* Items */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      {sale.items.map((it, idx) => (
                        <div key={idx} className="text-slate-800 font-medium">
                          {it.name} <span className="text-slate-400 font-normal">({it.qty}x @ ₹{it.rate})</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Pricing */}
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900 text-sm">₹{sale.netTotal}</div>
                    {sale.discount > 0 && (
                      <span className="text-[10px] text-emerald-600 font-bold">
                        (Discount: ₹{sale.discount})
                      </span>
                    )}
                  </td>

                  {/* Paid / Due */}
                  <td className="py-3.5 px-4">
                    <div className="text-emerald-700 font-bold">Paid: ₹{sale.paid}</div>
                    {sale.due > 0 ? (
                      <div className="text-rose-600 font-bold text-[11px]">Due: ₹{sale.due}</div>
                    ) : (
                      <div className="text-slate-400 text-[10px]">No due balance</div>
                    )}
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {sale.paymentMethod === 'UPI' && <QrCode className="w-3 h-3 text-indigo-600" />}
                      {sale.paymentMethod === 'Cash' && <Banknote className="w-3 h-3 text-emerald-600" />}
                      {sale.paymentMethod === 'Card' && <CreditCard className="w-3 h-3 text-blue-600" />}
                      {sale.paymentMethod}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handlePrint(sale)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto transition-colors"
                      title="Print Invoice"
                    >
                      <Printer className="w-3.5 h-3.5 text-teal-600" />
                      Print Bill
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
