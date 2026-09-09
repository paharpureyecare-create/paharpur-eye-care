import React from 'react';
import { LensMaster } from '../../types';
import { useErp } from '../../context/ErpContext';
import {
  X,
  History,
  Truck,
  Calendar,
  FileText,
  DollarSign,
  Layers,
  ArrowDownLeft,
  PlusCircle
} from 'lucide-react';

interface Props {
  lens: LensMaster | null;
  onClose: () => void;
  onNewPurchase?: () => void;
}

export const LensPurchaseHistoryModal: React.FC<Props> = ({
  lens,
  onClose,
  onNewPurchase
}) => {
  const { lensPurchases = [], stockMovements = [] } = useErp();

  if (!lens) return null;

  // Filter purchases for this lens
  const relatedPurchases = lensPurchases.filter(
    p => p.lensCode === lens.lensCode || p.lensId === lens.lensCode
  );

  // Filter stock movements (IN/Purchase) for this lens
  const relatedMovements = stockMovements.filter(
    m => m.itemCode === lens.lensCode && (m.qtyIn > 0 || m.movementType === 'Purchase' || m.movementType === 'Stock IN')
  );

  const totalPurchasedPairs = relatedPurchases.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const totalPurchaseSpend = relatedPurchases.reduce((acc, p) => acc + (p.totalCost || (p.quantity * p.purchaseRate) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Lens Stock In & Purchase History
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Procurement Invoices & Supplier Delivery Ledger
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
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Lens Overview */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Lens SKU</span>
              <h4 className="text-sm font-black text-slate-900">
                {lens.productName || `${lens.brand} ${lens.category || lens.lensType}`}
              </h4>
              <p className="text-xs text-slate-600 font-mono font-bold">
                {lens.lensCode} • SPH {lens.sph || '0.00'} | CYL {lens.cyl || '0.00'}
              </p>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">Total Received</span>
                <span className="text-sm font-black text-blue-900">{totalPurchasedPairs} pairs</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">Current In Hand</span>
                <span className="text-sm font-black text-emerald-700">{lens.currentStock} pairs</span>
              </div>
            </div>
          </div>

          {/* Records Table */}
          {relatedPurchases.length === 0 && relatedMovements.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No prior purchase logs recorded for this SKU</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Opening stock was initialized with {lens.currentStock} pairs in database.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3 text-right">Qty In</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {relatedPurchases.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {p.purchaseDate || (p.timestamp ? p.timestamp.split('T')[0] : '—')}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-teal-700">
                        {p.invoiceNumber || 'INV-DIRECT'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">
                        {p.supplierName || 'Paharpur Central Lab'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-blue-700">
                        +{p.quantity} pairs
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                        ₹{p.purchaseRate.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">
                        ₹{(p.totalCost || (p.quantity * p.purchaseRate)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}

                  {/* Supplemental from stock movements if any */}
                  {relatedMovements
                    .filter(m => !relatedPurchases.some(p => p.invoiceNumber === m.reference))
                    .map(m => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {m.date}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-teal-700">
                          {m.reference || m.id}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 font-medium">
                          {m.movementType} ({m.user || 'Store Manager'})
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-blue-700">
                          +{m.qtyIn} pairs
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                          ₹{lens.purchaseRate.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900">
                          ₹{(m.qtyIn * lens.purchaseRate).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Active central stock: <strong className="text-slate-900 font-bold">{lens.currentStock} pairs</strong>
          </span>
          <div className="flex items-center gap-2">
            {onNewPurchase && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewPurchase();
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Stock In (Purchase)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
