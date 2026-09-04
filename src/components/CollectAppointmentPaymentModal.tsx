import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { Appointment, PaymentMethod } from '../types';
import {
  X,
  CreditCard,
  DollarSign,
  User,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface CollectAppointmentPaymentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CollectAppointmentPaymentModal: React.FC<CollectAppointmentPaymentModalProps> = ({
  appointment,
  isOpen,
  onClose
}) => {
  const { collectAppointmentPayment } = useErp();

  if (!isOpen || !appointment) return null;

  const dueAmount = appointment.due || 0;
  const [amount, setAmount] = useState<number>(dueAmount > 0 ? dueAmount : (appointment.netFee || appointment.totalFee || 150));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    collectAppointmentPayment(appointment.id, amount, paymentMethod, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Collect Appointment Fee</h3>
              <p className="text-xs text-slate-400 font-mono">{appointment.id} • {appointment.patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Patient and Fee Summary */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Patient:</span>
              <strong className="text-slate-900">{appointment.patientName} ({appointment.mrd})</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Doctor & Optometrist:</span>
              <span className="font-semibold text-slate-800">{appointment.doctor} {appointment.optometrist ? `+ ${appointment.optometrist}` : ''}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
              <span className="text-slate-500">Total Net Fee:</span>
              <span className="font-black text-slate-900">₹{appointment.netFee ?? (appointment.totalFee || appointment.fee || 150)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Already Paid:</span>
              <span className="font-bold text-emerald-700">₹{appointment.paid || appointment.paidAmount || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-black pt-1 border-t border-slate-200">
              <span className="text-rose-700">Outstanding Due:</span>
              <span className="text-rose-700">₹{dueAmount}</span>
            </div>
          </div>

          {/* Amount to collect */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Collection Amount (জমার পরিমাণ - ₹) *
            </label>
            <input
              type="number"
              min="1"
              max={dueAmount > 0 ? dueAmount : 10000}
              required
              value={amount}
              onChange={e => setAmount(Number(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-black text-base text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Payment Method (পদ্ধতি) *</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Cash">Cash (নগদ)</option>
              <option value="UPI">UPI (Google Pay / PhonePe / QR)</option>
              <option value="Card">Debit / Credit Card</option>
              <option value="Bank Transfer">Bank Transfer / Cheque</option>
            </select>
          </div>

          {/* Notes / Reference */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Receipt Notes / Reference</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. UPI Ref: 1234567890"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <CheckCircle2 className="w-4 h-4" />
              Collect ₹{amount} & Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
