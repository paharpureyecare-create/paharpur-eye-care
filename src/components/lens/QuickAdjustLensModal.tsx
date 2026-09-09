import React, { useState } from 'react';
import { LensMaster, StockAdjustmentRecord } from '../../types';
import { useErp } from '../../context/ErpContext';
import {
  X,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Disc,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Props {
  lens: LensMaster | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickAdjustLensModal: React.FC<Props> = ({
  lens,
  onClose,
  onSuccess
}) => {
  const { adjustLensStock, showToast } = useErp();

  const [physicalStock, setPhysicalStock] = useState<number>(lens?.currentStock || 0);
  const [reason, setReason] = useState<StockAdjustmentRecord['reason']>('Audit Correction');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!lens) return null;

  const diff = physicalStock - lens.currentStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (physicalStock < 0) {
      showToast('Stock quantity cannot be negative', 'warning');
      return;
    }

    if (diff === 0 && !notes.trim()) {
      showToast('Physical count matches current system stock. No change needed.', 'info');
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      adjustLensStock(lens.lensCode, physicalStock, reason, notes.trim());
      showToast(`Stock for ${lens.lensCode} adjusted to ${physicalStock} pairs (${diff >= 0 ? '+' : ''}${diff})`, 'success');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      showToast(`Error adjusting stock: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Lens Stock Count Adjustment
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Physical Inventory Audit & Ledger Synchronization
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
          
          {/* Selected Lens Info */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Target Lens Variant</span>
                <h4 className="text-sm font-black text-slate-900">
                  {lens.productName || `${lens.brand} ${lens.category || lens.lensType}`}
                </h4>
                <p className="text-xs text-slate-600 font-mono font-bold">
                  SKU: {lens.lensCode}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 block">Rack Location</span>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {lens.rackLocation || 'Shelf'}
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
            </div>
          </div>

          {/* Counts Comparison */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">System Stock</span>
              <span className="text-xl font-black text-slate-800 mt-1 block">
                {lens.currentStock}
              </span>
              <span className="text-[10px] text-slate-400">pairs</span>
            </div>

            <div className="p-3 bg-teal-50/70 rounded-xl border-2 border-teal-300">
              <span className="text-[11px] font-bold text-teal-900 block">Physical Count</span>
              <input
                type="number"
                min="0"
                required
                value={physicalStock}
                onChange={e => setPhysicalStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full text-center text-xl font-black text-teal-950 bg-white border border-teal-300 rounded-lg py-1 mt-1 focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-[10px] text-teal-700 font-semibold">pairs verified</span>
            </div>

            <div className={`p-3 rounded-xl border ${
              diff > 0
                ? 'bg-emerald-50 border-emerald-300'
                : diff < 0
                ? 'bg-rose-50 border-rose-300'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[11px] font-semibold text-slate-500 block">Difference</span>
              <span className={`text-xl font-black mt-1 block ${
                diff > 0 ? 'text-emerald-700' : diff < 0 ? 'text-rose-700' : 'text-slate-600'
              }`}>
                {diff > 0 ? `+${diff}` : diff}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {diff > 0 ? 'Surplus' : diff < 0 ? 'Shortage' : 'Exact Match'}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Adjustment Reason
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value as StockAdjustmentRecord['reason'])}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="Audit Correction">Audit Correction (Physical Count Discrepancy)</option>
              <option value="Damaged/Scratched">Damaged / Scratched in Storage</option>
              <option value="Defective Lens">Defective Lens / Power Error from Lab</option>
              <option value="Vendor Replacement">Vendor Replacement / Return</option>
              <option value="Found/Surplus Stock">Found / Surplus Unrecorded Stock</option>
              <option value="Lab Wastage">Lab Wastage / Edging Breakage</option>
              <option value="Initial Opening Stock">Initial Opening Stock Balancing</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Audit Notes & Reference (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Verified by optical store manager during monthly audit..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white focus:ring-2 focus:ring-teal-500"
            />
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
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Updating...' : 'Save Stock Adjustment'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
