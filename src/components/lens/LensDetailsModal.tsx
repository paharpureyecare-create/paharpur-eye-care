import React from 'react';
import { LensMaster } from '../../types';
import {
  X,
  Disc,
  Tag,
  Layers,
  Sparkles,
  MapPin,
  Building,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  ShoppingCart,
  Sliders,
  History,
  Glasses
} from 'lucide-react';

interface Props {
  lens: LensMaster | null;
  onClose: () => void;
  onSell?: (lens: LensMaster) => void;
  onAddToOrder?: (lens: LensMaster) => void;
  onAdjustStock?: (lens: LensMaster) => void;
  onViewHistory?: (lens: LensMaster) => void;
  showToast?: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const LensDetailsModal: React.FC<Props> = ({
  lens,
  onClose,
  onSell,
  onAddToOrder,
  onAdjustStock,
  onViewHistory,
  showToast
}) => {
  if (!lens) return null;

  const isLowStock = lens.status === 'Low Stock' || (lens.currentStock > 0 && lens.currentStock <= (lens.reorderLevel || 8));
  const isOutOfStock = lens.currentStock <= 0 || lens.status === 'Out of Stock';

  const handleCopySku = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(lens.lensCode);
      showToast?.(`Copied SKU ${lens.lensCode} to clipboard!`, 'success');
    }
  };

  const profitMargin = lens.retailRate > 0 && lens.purchaseRate > 0
    ? Math.round(((lens.retailRate - lens.purchaseRate) / lens.retailRate) * 100)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Disc className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {lens.productName || `${lens.brand} ${lens.lensType || lens.category}`}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isOutOfStock
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : isLowStock
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isOutOfStock ? (
                    <>
                      <XCircle className="w-3 h-3 text-rose-400" />
                      Out of Stock
                    </>
                  ) : isLowStock ? (
                    <>
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      Low Stock
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      In Stock
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5 flex items-center gap-2">
                <span>SKU: {lens.lensCode}</span>
                <button
                  onClick={handleCopySku}
                  className="hover:text-teal-300 flex items-center gap-0.5 text-[11px]"
                  title="Copy SKU"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Power Matrix Highlight Grid */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-inner border border-slate-800">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-2">
              Optical Power Specifications
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">SPH (Sphere)</span>
                <span className="text-lg font-black text-amber-300 font-mono">
                  {lens.sph || '0.00'}
                </span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">CYL (Cylinder)</span>
                <span className="text-lg font-black text-teal-300 font-mono">
                  {lens.cyl || '0.00'}
                </span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">AXIS (Angle)</span>
                <span className="text-lg font-black text-sky-300 font-mono">
                  {lens.axis ? `${lens.axis}°` : '—'}
                </span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">ADD (Reading)</span>
                <span className="text-lg font-black text-purple-300 font-mono">
                  {lens.add ? (lens.add.startsWith('+') ? lens.add : `+${lens.add}`) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Stock & Inventory Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block">Current Stock</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-900">{lens.currentStock}</span>
                <span className="text-xs font-bold text-slate-500">pairs</span>
              </div>
              <span className="text-[11px] text-slate-400">Physical pieces: {lens.currentStock * 2}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block">Reorder / Min Stock</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-900">{lens.reorderLevel || 8}</span>
                <span className="text-xs font-bold text-slate-500">pairs</span>
              </div>
              <span className="text-[11px] text-amber-600 font-semibold">
                {lens.currentStock <= (lens.reorderLevel || 8) ? 'Reorder needed' : 'Healthy buffer'}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block">Storage Location</span>
              <div className="flex items-center gap-1.5 mt-1 text-slate-900 font-bold">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="truncate">{lens.rackLocation || 'Not Assigned'}</span>
              </div>
              <span className="text-[11px] text-slate-400">Rack / Drawer / Bin</span>
            </div>
          </div>

          {/* Commercial Pricing & Margins */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Commercial & Pricing Matrix
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Purchase Cost</span>
                <span className="font-bold text-slate-800">₹{lens.purchaseRate.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Retail Sale Rate</span>
                <span className="font-bold text-emerald-700 text-base">₹{lens.retailRate.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Wholesale Rate</span>
                <span className="font-bold text-blue-700">₹{(lens.wholesaleRate || lens.retailRate * 0.75).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Gross Margin</span>
                <span className="font-black text-teal-700">
                  {profitMargin !== null ? `${profitMargin}%` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Lens Attributes & Manufacturing Details */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" />
              Material, Index & Coating Details
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 block">Lens Type</span>
                <span className="font-bold text-slate-900">{lens.lensType || lens.category || 'Single Vision'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 block">Brand</span>
                <span className="font-bold text-slate-900">{lens.brand || 'Standard'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 block">Manufacturer Company</span>
                <span className="font-bold text-slate-900">{lens.company || 'Paharpur Central'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 block">Refractive Index</span>
                <span className="font-bold text-slate-900">{lens.index || '1.56'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 block">Material</span>
                <span className="font-bold text-slate-900">{lens.material || 'CR-39'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 block">Coating / Treatment</span>
                <span className="font-bold text-slate-900">{lens.coating || 'Hard Coat + HMC'}</span>
              </div>
              {lens.diameter && (
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 block">Diameter</span>
                  <span className="font-bold text-slate-900">{lens.diameter} mm</span>
                </div>
              )}
              {lens.baseCurve && (
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 block">Base Curve</span>
                  <span className="font-bold text-slate-900">{lens.baseCurve}</span>
                </div>
              )}
              {lens.supplierName && (
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 block">Preferred Supplier</span>
                  <span className="font-bold text-slate-900">{lens.supplierName}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onViewHistory && (
              <button
                type="button"
                onClick={() => onViewHistory(lens)}
                className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <History className="w-3.5 h-3.5 text-slate-600" />
                <span>Purchase History</span>
              </button>
            )}
            {onAdjustStock && (
              <button
                type="button"
                onClick={() => onAdjustStock(lens)}
                className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-600" />
                <span>Adjust Stock</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onAddToOrder && (
              <button
                type="button"
                onClick={() => onAddToOrder(lens)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition shadow-xs"
              >
                <Glasses className="w-4 h-4" />
                <span>Spectacle Order</span>
              </button>
            )}
            {onSell && (
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => onSell(lens)}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-xs ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-500 text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Sell (Retail POS)</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
