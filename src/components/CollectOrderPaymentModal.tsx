import React, { useState } from 'react';
import { SpectacleOrder, PaymentMethod } from '../types';
import { useErp } from '../context/ErpContext';
import {
  X,
  CreditCard,
  DollarSign,
  User,
  CheckCircle2,
  Calendar,
  Phone,
  FileText
} from 'lucide-react';

interface CollectOrderPaymentModalProps {
  order: SpectacleOrder;
  onClose: () => void;
}

export const CollectOrderPaymentModal: React.FC<CollectOrderPaymentModalProps> = ({
  order,
  onClose
}) => {
  const { collectSpectacleOrderPayment, showToast } = useErp();

  const currentPaid = order.advance || order.paid || 0;
  const currentDue = order.due;

  const [paymentAmount, setPaymentAmount] = useState<number | ''>(currentDue);
  const [paymentMode, setPaymentMode] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState(`Installment payment for ${order.orderId}`);

  const handleCollect = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(paymentAmount);
    if (!amountNum || amountNum <= 0) {
      showToast('Please enter a valid payment amount greater than 0', 'error');
      return;
    }

    collectSpectacleOrderPayment(order.orderId, amountNum, paymentMode, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Collect Order Payment / টাকা জমা
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Order: {order.orderId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCollect} className="p-6 space-y-4">
          {/* Customer & Due Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Customer:</span>
              <span className="font-bold text-slate-900">{order.customerName} ({order.mobile})</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Net Order Total:</span>
              <span className="font-bold text-slate-900">₹{order.total}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Already Paid:</span>
              <span className="font-bold text-emerald-600">₹{currentPaid}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 font-bold">
              <span className="text-slate-700">Remaining Balance:</span>
              <span className="text-rose-600 font-extrabold text-sm">₹{currentDue}</span>
            </div>
          </div>

          {/* Payment Input */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Payment Amount (জমা দেওয়ার পরিমাণ) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                min={1}
                max={currentDue}
                required
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2.5 text-sm font-extrabold text-slate-900 border border-emerald-400 bg-emerald-50/30 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => setPaymentAmount(currentDue)}
                className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded cursor-pointer"
              >
                Pay Full Due (₹{currentDue})
              </button>
              {currentDue > 500 && (
                <button
                  type="button"
                  onClick={() => setPaymentAmount(Math.round(currentDue / 2))}
                  className="text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded cursor-pointer"
                >
                  Pay Half (₹{Math.round(currentDue / 2)})
                </button>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Payment Mode (পেমেন্ট মাধ্যম)
            </label>
            <select
              value={paymentMode}
              onChange={e => setPaymentMode(e.target.value as PaymentMethod)}
              className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Cash">Cash (নগদ)</option>
              <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
              <option value="Card">Debit / Credit Card</option>
              <option value="NetBanking">Net Banking</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Payment Note / Ref No
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Final balance received at counter delivery"
              className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Payment (রশিদ তৈরি করুন)
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
