import React, { useState } from 'react';
import { LensMaster, PaymentMethod } from '../../types';
import { useErp } from '../../context/ErpContext';
import {
  X,
  ShoppingCart,
  Disc,
  DollarSign,
  User,
  Phone,
  CreditCard,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface Props {
  lens: LensMaster | null;
  onClose: () => void;
  onSuccess?: (invoiceNum: string) => void;
}

export const QuickSellLensModal: React.FC<Props> = ({
  lens,
  onClose,
  onSuccess
}) => {
  const { createRetailSale, showToast, role } = useErp();

  const [customerName, setCustomerName] = useState('Counter Customer');
  const [mobile, setMobile] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sellingRate, setSellingRate] = useState<number>(lens?.retailRate || 0);
  const [paymentMode, setPaymentMode] = useState<PaymentMethod>('Cash');
  const [isDue, setIsDue] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!lens) return null;

  const maxAvailable = lens.currentStock || 0;
  const grandTotal = Math.max(0, quantity * sellingRate);
  const paidAmount = isDue ? 0 : grandTotal;
  const dueAmount = isDue ? grandTotal : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity <= 0) {
      showToast('Please enter a valid quantity of at least 1 pair', 'warning');
      return;
    }

    if (quantity > maxAvailable) {
      showToast(`Cannot sell ${quantity} pairs. Only ${maxAvailable} available in stock!`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const sale = createRetailSale({
        customerName: customerName.trim() || 'Counter Customer',
        mobile: mobile.trim(),
        items: [
          {
            itemType: 'Lens',
            code: lens.lensCode,
            name: lens.productName || `${lens.brand} ${lens.category || lens.lensType || 'Lens'} (SPH ${lens.sph || '0.00'})`,
            quantity,
            rate: sellingRate,
            discount: 0,
            total: grandTotal
          }
        ],
        subTotal: grandTotal,
        discount: 0,
        tax: 0,
        grandTotal,
        paid: paidAmount,
        due: dueAmount,
        paymentMode: isDue ? 'Credit' : paymentMode,
        deliveryStatus: 'Delivered',
        paymentStatus: isDue ? 'Pending' : 'Paid',
        soldBy: `${role} Desk`,
        notes: notes.trim() || `Direct counter lens sale: ${lens.lensCode} (SPH ${lens.sph}, CYL ${lens.cyl})`
      });

      showToast(`Sale completed! Invoice ${sale.invoiceNumber} created. Stock updated.`, 'success');
      onSuccess?.(sale.invoiceNumber);
      onClose();
    } catch (err: any) {
      showToast(`Error processing sale: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex items-center justify-between border-b border-teal-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/15 text-white">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Quick Sell Optical Lens
              </h2>
              <p className="text-xs text-teal-200 font-medium">
                Direct Counter Sale • Instant Central Stock Deduction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Selected Lens Info Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Selected Lens Variant</span>
                <h4 className="text-sm font-black text-slate-900">
                  {lens.productName || `${lens.brand} ${lens.category || lens.lensType}`}
                </h4>
                <p className="text-xs text-slate-600 font-mono font-bold">
                  SKU: {lens.lensCode}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 block">Available</span>
                <span className={`text-sm font-black ${maxAvailable <= (lens.reorderLevel || 8) ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {maxAvailable} pairs
                </span>
              </div>
            </div>

            {/* Powers Chips */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                SPH: {lens.sph || '0.00'}
              </span>
              <span className="bg-teal-100 text-teal-900 font-bold px-2 py-0.5 rounded-md">
                CYL: {lens.cyl || '0.00'}
              </span>
              {lens.axis && lens.axis !== '—' && (
                <span className="bg-sky-100 text-sky-900 font-bold px-2 py-0.5 rounded-md">
                  AX: {lens.axis}°
                </span>
              )}
              {lens.add && lens.add !== '—' && (
                <span className="bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-md">
                  ADD: {lens.add}
                </span>
              )}
              <span className="text-slate-500 text-[11px] ml-auto font-sans font-medium">
                {lens.coating}
              </span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Customer / Patient Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g. Rahul Sen / Walk-in"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mobile (for SMS/WhatsApp)
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>
          </div>

          {/* Quantity and Selling Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Quantity (Pairs)
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-l-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center border border-r-0 border-slate-300"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={maxAvailable}
                  value={quantity}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setQuantity(Math.min(maxAvailable, Math.max(1, val)));
                  }}
                  className="w-full text-center py-1.5 border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.min(maxAvailable, prev + 1))}
                  className="w-8 h-8 rounded-r-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center border border-l-0 border-slate-300"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Rate per Pair (₹)
              </label>
              <input
                type="number"
                min="0"
                value={sellingRate}
                onChange={e => setSellingRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {(['Cash', 'UPI', 'Card', 'Credit'] as PaymentMethod[]).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setPaymentMode(mode);
                    setIsDue(mode === 'Credit');
                  }}
                  className={`py-2 px-2 rounded-xl font-bold border transition text-center ${
                    (isDue && mode === 'Credit') || (!isDue && paymentMode === mode)
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {mode === 'Credit' ? 'Due / Credit' : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Total & Due Summary Box */}
          <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-teal-800 font-medium">Grand Total Payable:</span>
              <p className="text-lg font-black text-teal-950">₹{grandTotal.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-600 block">Status:</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                isDue ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isDue ? `Due: ₹${grandTotal}` : 'Full Paid'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || maxAvailable <= 0}
              className={`px-5 py-2 rounded-xl font-bold text-xs text-white shadow-sm flex items-center gap-1.5 transition ${
                isSubmitting || maxAvailable <= 0
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Processing...' : 'Complete Sale & Deduct Stock'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
