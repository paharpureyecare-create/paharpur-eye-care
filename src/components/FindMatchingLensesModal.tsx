import React, { useState, useMemo } from 'react';
import { EyePower, LensMaster } from '../types';
import { useErp } from '../context/ErpContext';
import {
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Glasses,
  ShoppingCart,
  Layers,
  ArrowRight,
  Eye,
  Info
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  odPower: EyePower;
  osPower: EyePower;
  patientName?: string;
  mrd?: string;
}

// Utility to parse numeric power
function parsePower(str?: string): number | null {
  if (!str || str.trim() === '' || str === '—' || str.toLowerCase() === 'plano' || str.toUpperCase() === 'DS') {
    return 0;
  }
  const clean = str.replace('+', '').trim();
  const val = parseFloat(clean);
  return isNaN(val) ? null : val;
}

export const FindMatchingLensesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  odPower,
  osPower,
  patientName,
  mrd
}) => {
  const { lenses = [], setQuickModal, setActiveTab, showToast } = useErp();
  const [selectedEyeTab, setSelectedEyeTab] = useState<'od' | 'os'>('od');
  const [selectedOdLens, setSelectedOdLens] = useState<LensMaster | null>(null);
  const [selectedOsLens, setSelectedOsLens] = useState<LensMaster | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Active eye power
  const activePower = selectedEyeTab === 'od' ? odPower : osPower;
  const targetSph = parsePower(activePower.sph);
  const targetCyl = parsePower(activePower.cyl);
  const targetAdd = parsePower(activePower.add);
  const targetAxis = activePower.axis ? parseInt(activePower.axis.replace(/[^0-9]/g, ''), 10) : null;

  // Match analysis for active eye
  const { exactMatches, similarMatches, outOfStockExact } = useMemo(() => {
    if (targetSph === null) {
      return { exactMatches: [], similarMatches: [], outOfStockExact: [] };
    }

    const exact: LensMaster[] = [];
    const outOfStock: LensMaster[] = [];
    const similar: { lens: LensMaster; diffReason: string }[] = [];

    lenses.forEach(lens => {
      const lSph = parsePower(lens.sph);
      const lCyl = parsePower(lens.cyl);
      const lAdd = parsePower(lens.add);
      const lAxis = lens.axis ? parseInt(lens.axis.replace(/[^0-9]/g, ''), 10) : null;

      if (lSph === null) return;

      const sphMatch = lSph === targetSph;
      const cylMatch = targetCyl === null || targetCyl === 0 ? (lCyl === 0 || lCyl === null) : lCyl === targetCyl;
      const addMatch = targetAdd === null || targetAdd === 0 ? true : (lAdd === targetAdd);
      const axisMatch = targetAxis === null || isNaN(targetAxis) || lAxis === null || isNaN(lAxis) ? true : (lAxis === targetAxis);

      if (sphMatch && cylMatch && addMatch && axisMatch) {
        if (lens.currentStock > 0) {
          exact.push(lens);
        } else {
          outOfStock.push(lens);
        }
      } else {
        // Check for similar power (within +/- 0.50 D sphere or +/- 0.25 D cylinder or ADD variance)
        const sphDiff = Math.abs(lSph - targetSph);
        const cylDiff = Math.abs((lCyl || 0) - (targetCyl || 0));
        
        if (sphDiff <= 0.50 && cylDiff <= 0.50 && lens.currentStock > 0) {
          const reasons: string[] = [];
          if (sphDiff > 0) {
            reasons.push(`SPH diff: ${lSph > targetSph ? '+' : ''}${(lSph - targetSph).toFixed(2)} D`);
          }
          if (cylDiff > 0) {
            reasons.push(`CYL diff: ${((lCyl || 0) > (targetCyl || 0) ? '+' : '')}${((lCyl || 0) - (targetCyl || 0)).toFixed(2)} D`);
          }
          if (targetAdd !== null && lAdd !== null && lAdd !== targetAdd) {
            reasons.push(`ADD diff: ${(lAdd > targetAdd ? '+' : '')}${(lAdd - targetAdd).toFixed(2)} D`);
          }

          similar.push({
            lens,
            diffReason: reasons.join(' • ') || `SPH ${lens.sph || '0.00'} / CYL ${lens.cyl || '0.00'}`
          });
        }
      }
    });

    return {
      exactMatches: exact,
      outOfStockExact: outOfStock,
      similarMatches: similar
    };
  }, [lenses, targetSph, targetCyl, targetAdd, targetAxis]);

  if (!isOpen) return null;

  const currentSelection = selectedEyeTab === 'od' ? selectedOdLens : selectedOsLens;

  const handleSelectLens = (lens: LensMaster) => {
    if (selectedEyeTab === 'od') {
      setSelectedOdLens(lens);
      showToast(`Selected ${lens.productName || lens.brand} for OD (Right Eye)`, 'success');
    } else {
      setSelectedOsLens(lens);
      showToast(`Selected ${lens.productName || lens.brand} for OS (Left Eye)`, 'success');
    }
  };

  const handleProceedToSpectacleOrder = () => {
    onClose();
    setQuickModal('new-order');
    showToast('Redirected to Spectacle Order Booking with matching lens specifications', 'info');
  };

  const handleProceedToRetailSale = () => {
    onClose();
    setActiveTab('retail-sales');
    showToast('Redirected to Retail POS. Selected lenses can be added directly to invoice', 'info');
  };

  const handleViewCentralStock = () => {
    onClose();
    setActiveTab('lens-inventory');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
                <Search className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  Find Matching Lenses in Central Stock
                </h2>
                <p className="text-xs text-slate-300 font-medium">
                  Prescription Power Matcher • Central LensMaster Inventory
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Patient & Prescription Power Summary Banner */}
        <div className="bg-slate-50 p-4 border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                Rx
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  {patientName || 'Clinical Prescription Match'}
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-bold">
                  {mrd ? `MRD: ${mrd}` : 'Live Prescription Evaluation'}
                </span>
              </div>
            </div>

            {/* Quick Powers Comparison Pills */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <div className="bg-blue-100 text-blue-900 px-3 py-1.5 rounded-xl border border-blue-200 font-black">
                OD: SPH {odPower.sph || '0.00'} | CYL {odPower.cyl || '0.00'} | AX {odPower.axis || '0°'} | ADD {odPower.add || '0.00'}
              </div>
              <div className="bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-200 font-black">
                OS: SPH {osPower.sph || '0.00'} | CYL {osPower.cyl || '0.00'} | AX {osPower.axis || '0°'} | ADD {osPower.add || '0.00'}
              </div>
            </div>
          </div>
        </div>

        {/* Eye Tab Selector (OD vs OS) */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedEyeTab('od')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition ${
                selectedEyeTab === 'od'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              OD — Right Eye (SPH {odPower.sph || '0.00'} / CYL {odPower.cyl || '0.00'})
              {selectedOdLens && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
            </button>

            <button
              onClick={() => setSelectedEyeTab('os')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition ${
                selectedEyeTab === 'os'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              OS — Left Eye (SPH {osPower.sph || '0.00'} / CYL {osPower.cyl || '0.00'})
              {selectedOsLens && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-semibold hidden md:block">
            Targeting Central LensMaster Stock
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">

          {/* Match Status Banner */}
          <div className="flex flex-wrap items-center gap-3">
            {exactMatches.length > 0 ? (
              <div className="flex-1 p-3.5 bg-emerald-50 rounded-2xl border-2 border-emerald-200 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                    🟢 Exact Match Available ({exactMatches.length} SKU{exactMatches.length > 1 ? 's' : ''})
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Ready in stock with exact requested SPH and Cylinder powers.
                  </p>
                </div>
              </div>
            ) : outOfStockExact.length > 0 ? (
              <div className="flex-1 p-3.5 bg-rose-50 rounded-2xl border-2 border-rose-200 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-rose-950">
                    🔴 Exact Match Currently Out of Stock ({outOfStockExact.length} SKU)
                  </h4>
                  <p className="text-xs text-rose-800">
                    SKU exists in master catalog but current stock is 0. Reorder or purchase in.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 p-3.5 bg-slate-100 rounded-2xl border-2 border-slate-200 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-slate-500 shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-800">
                    🔴 No Exact Power Match in Stock
                  </h4>
                  <p className="text-xs text-slate-600">
                    No lens found matching SPH {activePower.sph || '0.00'} & CYL {activePower.cyl || '0.00'}.
                  </p>
                </div>
              </div>
            )}

            {similarMatches.length > 0 && (
              <div className="p-3.5 bg-amber-50 rounded-2xl border-2 border-amber-200 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-amber-950">
                    🟡 Similar Options ({similarMatches.length})
                  </h4>
                  <p className="text-xs text-amber-800">
                    Close powers (±0.50D) available for optometrist review.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 1. EXACT MATCHES LIST */}
          {exactMatches.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Exact Power Matches in Stock (সরাসরি পাওয়ার মিল)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exactMatches.map(lens => {
                  const isSelected = currentSelection?.lensCode === lens.lensCode;
                  return (
                    <div
                      key={lens.lensCode}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {lens.lensCode}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 mt-1">
                            {lens.productName || `${lens.brand} ${lens.lensType}`}
                          </h4>
                          <span className="text-xs text-slate-500 font-semibold">
                            {lens.company} • {lens.brand}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                          {lens.currentStock} In Stock
                        </span>
                      </div>

                      {/* Specs Row */}
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Power</span>
                          <span className="font-black text-slate-800">
                            SPH {lens.sph || '0.00'} / CYL {lens.cyl || '0.00'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Type & Coating</span>
                          <span className="font-bold text-slate-700 truncate block">
                            {lens.coating || lens.lensType}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Retail Price</span>
                          <span className="font-black text-emerald-700">
                            ₹{lens.retailRate || 0}
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-3 pt-2 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {lens.rackLocation ? `Rack: ${lens.rackLocation}` : 'Central Optical Rack'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSelectLens(lens)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Selected for {selectedEyeTab.toUpperCase()}
                            </>
                          ) : (
                            <>
                              Select for {selectedEyeTab.toUpperCase()}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. SIMILAR OPTIONS */}
          {similarMatches.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Similar Power Options (বিকল্প অপশন — ম্যানুয়াল যাচাই করুন)
              </h3>
              <p className="text-[11px] text-slate-500">
                ⚠️ System will never automatically substitute. User must evaluate and manually select if acceptable.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {similarMatches.map(({ lens, diffReason }) => {
                  const isSelected = currentSelection?.lensCode === lens.lensCode;
                  return (
                    <div
                      key={lens.lensCode}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'bg-amber-50/70 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                          : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              {lens.lensCode}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              {diffReason}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 mt-1">
                            {lens.productName || `${lens.brand} ${lens.lensType}`}
                          </h4>
                          <span className="text-xs text-slate-500 font-semibold">
                            {lens.company} • {lens.brand}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                          {lens.currentStock} In Stock
                        </span>
                      </div>

                      {/* Specs Row */}
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Power</span>
                          <span className="font-black text-slate-800">
                            SPH {lens.sph || '0.00'} / CYL {lens.cyl || '0.00'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Type & Coating</span>
                          <span className="font-bold text-slate-700 truncate block">
                            {lens.coating || lens.lensType}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Retail Price</span>
                          <span className="font-black text-emerald-700">
                            ₹{lens.retailRate || 0}
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-3 pt-2 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {lens.rackLocation ? `Rack: ${lens.rackLocation}` : 'Central Optical Rack'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSelectLens(lens)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-amber-600 hover:text-white text-slate-800'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Selected for {selectedEyeTab.toUpperCase()}
                            </>
                          ) : (
                            <>
                              Select for {selectedEyeTab.toUpperCase()}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. OUT OF STOCK EXACT MATCHES */}
          {outOfStockExact.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Exact Power Items currently Out of Stock (স্টক শেষ)
              </h3>
              <div className="divide-y divide-slate-100 bg-rose-50/50 rounded-2xl border border-rose-200 p-3">
                {outOfStockExact.map(l => (
                  <div key={l.lensCode} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-800">{l.lensCode}</span> — {l.productName || l.brand} ({l.lensType})
                    </div>
                    <span className="font-bold text-rose-600">0 Stock (Reorder required)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer / Direct Workflow Flow */}
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <div className="text-xs text-slate-300">
            Selected Lenses:
            <span className="ml-2 font-mono font-bold text-teal-300">
              OD: {selectedOdLens?.lensCode || 'None'}
            </span>
            <span className="mx-2 text-slate-500">•</span>
            <span className="font-mono font-bold text-teal-300">
              OS: {selectedOsLens?.lensCode || 'None'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleViewCentralStock}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              View Central Lens Stock
            </button>

            <button
              onClick={handleProceedToRetailSale}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Direct Retail Sale
            </button>

            <button
              onClick={handleProceedToSpectacleOrder}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md"
            >
              <Glasses className="w-4 h-4" />
              Book Spectacle Order with this Lens
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
