import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import {
  CreditCard,
  Search,
  MessageCircle,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Phone,
  Banknote,
  Send
} from 'lucide-react';

export const DueManagementView: React.FC = () => {
  const {
    dueAccounts,
    collectDuePayment,
    setQuickModal,
    setSelectedPatientFor360,
    patients,
    showToast
  } = useErp();

  const [search, setSearch] = useState('');
  const [filterAging, setFilterAging] = useState<string>('All');
  const [collectingAccount, setCollectingAccount] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer'>('Cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  const list = Array.isArray(dueAccounts) ? dueAccounts : [];

  const filtered = list.filter(acc => {
    const q = (search || '').trim().toLowerCase();
    const cName = (acc.customerName || '').toLowerCase();
    const mrd = (acc.mrd || '').toLowerCase();
    const mob = acc.mobile || '';
    const refId = (acc.referenceId || '').toLowerCase();

    const matchesSearch =
      !q ||
      cName.includes(q) ||
      mrd.includes(q) ||
      mob.includes(search) ||
      refId.includes(q);

    const matchesAging = filterAging === 'All' || acc.agingBucket === filterAging;
    return matchesSearch && matchesAging;
  });

  const totalOutstanding = list.reduce((acc, d) => acc + d.dueAmount, 0);

  const handleOpenCollectModal = (acc: any) => {
    setCollectingAccount(acc);
    setPaymentAmount(acc.dueAmount);
    setPaymentNotes(`Payment for ${acc.referenceId}`);
  };

  const handleConfirmCollection = () => {
    if (!collectingAccount || paymentAmount <= 0) {
      showToast('Please enter a valid payment amount', 'error');
      return;
    }

    collectDuePayment({
      accountId: collectingAccount.id,
      amount: paymentAmount,
      method: paymentMethod,
      notes: paymentNotes
    });

    setCollectingAccount(null);
  };

  const handleWhatsAppDueReminder = (acc: any) => {
    const cleanMobile = acc.mobile.replace(/[^0-9]/g, '');
    const fullNumber = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const msg = encodeURIComponent(
      `Dear ${acc.customerName}, gentle reminder from Paharpur Eye Care: you have an outstanding balance of ₹${acc.dueAmount} against your order/bill (${acc.referenceId}). Please pay via UPI or at our clinic counter at your earliest convenience. Thank you!`
    );
    window.open(`https://wa.me/${fullNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-rose-600" />
              Due Accounts & Aging Recovery (বকেয়া ও রিকভারি ম্যানেজমেন্ট)
            </h1>
            <span className="bg-rose-50 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
              ₹{totalOutstanding.toLocaleString('en-IN')} Outstanding
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track receivables across 0-7, 8-30, 31-60, 61-90, and 90+ day aging buckets with 1-click collection & WhatsApp alerts
          </p>
        </div>
      </div>

      {/* Aging Buckets Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {['0-7 Days', '8-30 Days', '31-60 Days', '61-90 Days', '90+ Days'].map(bucket => {
          const count = dueAccounts.filter(d => d.agingBucket === bucket).length;
          const sum = dueAccounts
            .filter(d => d.agingBucket === bucket)
            .reduce((acc, d) => acc + d.dueAmount, 0);

          return (
            <div
              key={bucket}
              onClick={() => setFilterAging(filterAging === bucket ? 'All' : bucket)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                filterAging === bucket
                  ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600">{bucket}</span>
                <span className="text-[10px] font-extrabold bg-slate-100 px-1.5 py-0.2 rounded text-slate-700">
                  {count}
                </span>
              </div>
              <p className="text-lg font-black text-rose-600 mt-1">₹{sum.toLocaleString('en-IN')}</p>
            </div>
          );
        })}
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Customer, Mobile, MRD, Order #..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', '0-7 Days', '8-30 Days', '31-60 Days', '61-90 Days', '90+ Days'].map(ag => (
            <button
              key={ag}
              onClick={() => setFilterAging(ag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filterAging === ag
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {ag}
            </button>
          ))}
        </div>
      </div>

      {/* Due Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Ref # & Date</th>
                <th className="py-3 px-4">Customer / MRD</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Bill Total / Paid</th>
                <th className="py-3 px-4">Outstanding Due</th>
                <th className="py-3 px-4">Aging Bucket</th>
                <th className="py-3 px-4 text-right">⚡ 1-Click Collection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    🎉 Excellent! No due accounts found for this criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(acc => {
                  const patientObj = patients.find(p => p.mrd === acc.mrd);
                  return (
                    <tr key={acc.id} className="hover:bg-rose-50/30 transition-colors">
                      
                      {/* Ref */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 block">{acc.referenceId}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{acc.date}</span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => {
                            if (patientObj) setSelectedPatientFor360(patientObj);
                          }}
                          className="font-bold text-slate-900 text-sm hover:text-teal-700 cursor-pointer"
                        >
                          {acc.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {acc.mrd ? `MRD: ${acc.mrd} • ` : ''}{acc.mobile}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {acc.type}
                        </span>
                      </td>

                      {/* Total / Paid */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>Total: ₹{acc.totalAmount}</div>
                        <div className="text-emerald-700 font-semibold text-[11px]">
                          Paid: ₹{acc.paidAmount}
                        </div>
                      </td>

                      {/* Due */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-rose-600 text-base">
                          ₹{acc.dueAmount.toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* Aging */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            acc.agingBucket === '0-7 Days'
                              ? 'bg-blue-100 text-blue-800'
                              : acc.agingBucket === '8-30 Days'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {acc.agingBucket}
                        </span>
                      </td>

                      {/* 1-Click Collection Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* WhatsApp Due Reminder */}
                          <button
                            onClick={() => handleWhatsAppDueReminder(acc)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors"
                            title="Send WhatsApp Due Balance Reminder"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* Collect Cash / UPI Button */}
                          <button
                            id={`btn-collect-due-${acc.id}`}
                            onClick={() => handleOpenCollectModal(acc)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs transition-all hover:scale-105"
                          >
                            <Banknote className="w-3.5 h-3.5" />
                            Collect ₹{acc.dueAmount}
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {collectingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-600" />
                Collect Due Payment
              </h2>
              <span className="text-xs font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded">
                Due: ₹{collectingAccount.dueAmount}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900 text-sm">{collectingAccount.customerName}</p>
              <p className="text-slate-600">Reference: {collectingAccount.referenceId} ({collectingAccount.type})</p>
              <p className="text-slate-600">Mobile: {collectingAccount.mobile}</p>
            </div>

            <div className="space-y-3 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">Collection Amount (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl text-base font-black text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Cash', 'UPI', 'Card', 'Bank Transfer'] as const).map(pm => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        paymentMethod === pm
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Transaction Ref / Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  placeholder="e.g. GPay UPI ref #82939103 or Cash counter"
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setCollectingAccount(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-due-collection"
                onClick={handleConfirmCollection}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Confirm & Record Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
