import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { LensMaster } from '../../types';
import {
  Search,
  Disc,
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  ShoppingCart,
  Glasses,
  History,
  Copy,
  ChevronDown,
  ChevronUp,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  Plus,
  Minus
} from 'lucide-react';
import { LensDetailsModal } from './LensDetailsModal';
import { QuickSellLensModal } from './QuickSellLensModal';
import { QuickAdjustLensModal } from './QuickAdjustLensModal';
import { LensPurchaseHistoryModal } from './LensPurchaseHistoryModal';

// Programmatically generate complete power ranges with 0.25 increments
export const SPH_OPTIONS: string[] = (() => {
  const list: string[] = [];
  // -15.00 to +15.00 in 0.25 increments
  for (let val = -15.0; val <= 15.001; val += 0.25) {
    const rounded = Math.round(val * 100) / 100;
    if (rounded > 0) list.push(`+${rounded.toFixed(2)}`);
    else if (rounded === 0) list.push('0.00');
    else list.push(rounded.toFixed(2));
  }
  return list;
})();

export const CYL_OPTIONS: string[] = (() => {
  const list: string[] = [];
  // -6.00 to +6.00 in 0.25 increments
  for (let val = -6.0; val <= 6.001; val += 0.25) {
    const rounded = Math.round(val * 100) / 100;
    if (rounded > 0) list.push(`+${rounded.toFixed(2)}`);
    else if (rounded === 0) list.push('0.00');
    else list.push(rounded.toFixed(2));
  }
  return list;
})();

export const AXIS_OPTIONS: number[] = (() => {
  const list: number[] = [];
  for (let deg = 0; deg <= 180; deg += 1) {
    list.push(deg);
  }
  return list;
})();

export const COMMON_AXIS_VALUES = [0, 30, 45, 60, 90, 120, 135, 150, 180];

export const ADD_OPTIONS: string[] = (() => {
  const list: string[] = [];
  // +0.75 to +4.00 in 0.25 increments
  for (let val = 0.75; val <= 4.001; val += 0.25) {
    const rounded = Math.round(val * 100) / 100;
    list.push(`+${rounded.toFixed(2)}`);
  }
  return list;
})();

function normalizePowerString(p?: string): string | null {
  if (!p || p.trim() === '' || p === '—' || p.toLowerCase() === 'plano' || p.toUpperCase() === 'DS') {
    return null;
  }
  const clean = p.replace('+', '').trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return p.trim().toLowerCase();
  return (num >= 0 ? '+' : '') + num.toFixed(2);
}

export const QuickLensSearchSection: React.FC = () => {
  const { lenses = [], setQuickModal, setActiveTab, showToast } = useErp();

  // Primary Power Search State (empty string = not filtered; placeholders only show in input)
  const [sph, setSph] = useState('');
  const [cyl, setCyl] = useState('');
  const [axis, setAxis] = useState('');
  const [add, setAdd] = useState('');

  // Text & Advanced Attribute Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedCoating, setSelectedCoating] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState('All');
  const [availability, setAvailability] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [quickFilter, setQuickFilter] = useState<string>('all');

  // UI state
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [activePowerTab, setActivePowerTab] = useState<'sph' | 'cyl' | 'axis' | 'add'>('sph');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Action Modals
  const [viewingLens, setViewingLens] = useState<LensMaster | null>(null);
  const [sellingLens, setSellingLens] = useState<LensMaster | null>(null);
  const [adjustingLens, setAdjustingLens] = useState<LensMaster | null>(null);
  const [historyLens, setHistoryLens] = useState<LensMaster | null>(null);

  // Extract unique filter dropdown values from existing lenses
  const uniqueBrands = useMemo(() => {
    const set = new Set<string>();
    lenses.forEach(l => { if (l.brand) set.add(l.brand.trim()); });
    return Array.from(set).sort();
  }, [lenses]);

  const uniqueCompanies = useMemo(() => {
    const set = new Set<string>();
    lenses.forEach(l => { if (l.company) set.add(l.company.trim()); });
    return Array.from(set).sort();
  }, [lenses]);

  const uniqueTypes = useMemo(() => {
    const set = new Set<string>();
    lenses.forEach(l => {
      if (l.lensType) set.add(l.lensType.trim());
      else if (l.category) set.add(l.category.trim());
    });
    return Array.from(set).sort();
  }, [lenses]);

  const uniqueCoatings = useMemo(() => {
    const set = new Set<string>();
    lenses.forEach(l => { if (l.coating) set.add(l.coating.trim()); });
    return Array.from(set).sort();
  }, [lenses]);

  const uniqueMaterials = useMemo(() => {
    const set = new Set<string>();
    lenses.forEach(l => { if (l.material) set.add(l.material.trim()); });
    return Array.from(set).sort();
  }, [lenses]);

  const uniqueIndices = useMemo(() => {
    const set = new Set<string>();
    lenses.forEach(l => { if (l.index) set.add(l.index.trim()); });
    return Array.from(set).sort();
  }, [lenses]);

  // Stepper functions with min/max safety limits
  const handleStepSph = (delta: number) => {
    let cur = sph.trim() === '' ? 0 : parseFloat(sph.replace('+', ''));
    if (isNaN(cur)) cur = 0;
    let next = Math.round((cur + delta) * 100) / 100;
    if (next < -15.00) next = -15.00;
    if (next > 15.00) next = 15.00;
    const formatted = next > 0 ? `+${next.toFixed(2)}` : next < 0 ? next.toFixed(2) : '0.00';
    setSph(formatted);
  };

  const handleStepCyl = (delta: number) => {
    let cur = cyl.trim() === '' ? 0 : parseFloat(cyl.replace('+', ''));
    if (isNaN(cur)) cur = 0;
    let next = Math.round((cur + delta) * 100) / 100;
    if (next < -6.00) next = -6.00;
    if (next > 6.00) next = 6.00;
    const formatted = next > 0 ? `+${next.toFixed(2)}` : next < 0 ? next.toFixed(2) : '0.00';
    setCyl(formatted);
  };

  const handleStepAdd = (delta: number) => {
    let cur = add.trim() === '' ? 0.75 : parseFloat(add.replace('+', ''));
    if (isNaN(cur)) cur = 0.75;
    let next = Math.round((cur + delta) * 100) / 100;
    if (next < 0.75) next = 0.75;
    if (next > 4.00) next = 4.00;
    const formatted = `+${next.toFixed(2)}`;
    setAdd(formatted);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSph('');
    setCyl('');
    setAxis('');
    setAdd('');
    setSearchQuery('');
    setSelectedType('All');
    setSelectedBrand('All');
    setSelectedCompany('All');
    setSelectedCoating('All');
    setSelectedMaterial('All');
    setSelectedIndex('All');
    setAvailability('all');
    setQuickFilter('all');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (sph.trim() !== '') count++;
    if (cyl.trim() !== '') count++;
    if (axis.trim() !== '') count++;
    if (add.trim() !== '') count++;
    if (searchQuery.trim() !== '') count++;
    if (selectedType !== 'All') count++;
    if (selectedBrand !== 'All') count++;
    if (selectedCompany !== 'All') count++;
    if (selectedCoating !== 'All') count++;
    if (selectedMaterial !== 'All') count++;
    if (selectedIndex !== 'All') count++;
    if (availability !== 'all') count++;
    if (quickFilter !== 'all') count++;
    return count;
  }, [sph, cyl, axis, add, searchQuery, selectedType, selectedBrand, selectedCompany, selectedCoating, selectedMaterial, selectedIndex, availability, quickFilter]);

  // Filtering Logic
  const filteredLenses = useMemo(() => {
    const targetSphNorm = sph.trim() !== '' ? normalizePowerString(sph) : null;
    const targetCylNorm = cyl.trim() !== '' ? normalizePowerString(cyl) : null;
    const targetAxisNum = axis.trim() !== '' ? parseInt(axis, 10) : null;
    const targetAddNorm = add.trim() !== '' ? normalizePowerString(add) : null;
    const query = searchQuery.trim().toLowerCase();

    return lenses.filter(lens => {
      // SPH power filter (partial search supported: only matches if SPH is specified)
      if (targetSphNorm !== null) {
        const lSph = normalizePowerString(lens.sph);
        if (lSph !== targetSphNorm) return false;
      }

      // CYL power filter
      if (targetCylNorm !== null) {
        const lCyl = normalizePowerString(lens.cyl);
        if (lCyl !== targetCylNorm) return false;
      }

      // AXIS filter (if specified, exact or tolerance check)
      if (targetAxisNum !== null && !isNaN(targetAxisNum)) {
        if (!lens.axis || lens.axis === '—') return false;
        const lAxis = parseInt(lens.axis, 10);
        if (isNaN(lAxis) || lAxis !== targetAxisNum) return false;
      }

      // ADD filter
      if (targetAddNorm !== null) {
        const lAdd = normalizePowerString(lens.add);
        if (lAdd !== targetAddNorm) return false;
      }

      // Free text / SKU search
      if (query) {
        const sku = (lens.lensCode || '').toLowerCase();
        const prod = (lens.productName || '').toLowerCase();
        const brand = (lens.brand || '').toLowerCase();
        const comp = (lens.company || '').toLowerCase();
        const type = (lens.lensType || lens.category || '').toLowerCase();
        const coat = (lens.coating || '').toLowerCase();
        const rack = (lens.rackLocation || '').toLowerCase();

        const matches =
          sku.includes(query) ||
          prod.includes(query) ||
          brand.includes(query) ||
          comp.includes(query) ||
          type.includes(query) ||
          coat.includes(query) ||
          rack.includes(query);

        if (!matches) return false;
      }

      // Dropdown filters
      if (selectedType !== 'All') {
        const lType = (lens.lensType || lens.category || '').toLowerCase();
        if (!lType.includes(selectedType.toLowerCase())) return false;
      }

      if (selectedBrand !== 'All' && lens.brand !== selectedBrand) return false;
      if (selectedCompany !== 'All' && lens.company !== selectedCompany) return false;
      if (selectedCoating !== 'All' && lens.coating !== selectedCoating) return false;
      if (selectedMaterial !== 'All' && lens.material !== selectedMaterial) return false;
      if (selectedIndex !== 'All' && lens.index !== selectedIndex) return false;

      // Availability status
      if (availability === 'in-stock' && (lens.currentStock || 0) <= 0) return false;
      if (availability === 'low-stock') {
        const isLow = lens.status === 'Low Stock' || ((lens.currentStock || 0) > 0 && (lens.currentStock || 0) <= (lens.reorderLevel || 8));
        if (!isLow) return false;
      }
      if (availability === 'out-of-stock' && (lens.currentStock || 0) > 0) return false;

      // Quick Filter chips
      if (quickFilter === 'in-stock' && (lens.currentStock || 0) <= 0) return false;
      if (quickFilter === 'low-stock') {
        const isLow = lens.status === 'Low Stock' || ((lens.currentStock || 0) > 0 && (lens.currentStock || 0) <= (lens.reorderLevel || 8));
        if (!isLow) return false;
      }
      if (quickFilter === 'out-of-stock' && (lens.currentStock || 0) > 0) return false;
      if (quickFilter === 'single-vision') {
        const t = `${lens.lensType || ''} ${lens.category || ''}`.toUpperCase();
        if (!t.includes('SINGLE VISION') && !t.includes('SV')) return false;
      }
      if (quickFilter === 'bifocal') {
        const t = `${lens.lensType || ''} ${lens.category || ''}`.toUpperCase();
        if (!t.includes('BIFOCAL') && !t.includes('D-SEG') && !t.includes('KRYPTOK')) return false;
      }
      if (quickFilter === 'progressive') {
        const t = `${lens.lensType || ''} ${lens.category || ''}`.toUpperCase();
        if (!t.includes('PROGRESSIVE') && !t.includes('PAL')) return false;
      }
      if (quickFilter === 'blue-cut') {
        const t = `${lens.lensType || ''} ${lens.productName || ''} ${lens.coating || ''}`.toUpperCase();
        if (!t.includes('BLUE CUT') && !t.includes('BLUE SHIELD') && !t.includes('UV420')) return false;
      }
      if (quickFilter === 'photochromic') {
        const t = `${lens.lensType || ''} ${lens.productName || ''} ${lens.category || ''}`.toUpperCase();
        if (!t.includes('PHOTO') && !t.includes('SUN') && !t.includes('TRANSITION')) return false;
      }
      if (quickFilter === 'hi-index') {
        const idx = parseFloat(lens.index || '0');
        if (idx < 1.60) return false;
      }
      if (quickFilter === 'plano') {
        const s = parseFloat(lens.sph || '0');
        if (s !== 0) return false;
      }

      return true;
    });
  }, [
    lenses,
    sph,
    cyl,
    axis,
    add,
    searchQuery,
    selectedType,
    selectedBrand,
    selectedCompany,
    selectedCoating,
    selectedMaterial,
    selectedIndex,
    availability,
    quickFilter
  ]);

  const handleCopySku = (sku: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sku);
      showToast(`Copied SKU ${sku} to clipboard!`, 'success');
    }
  };

  const handleAddToOrder = (lens: LensMaster) => {
    setQuickModal('new-order');
    showToast(`Redirected to Spectacle Order. Selected ${lens.brand} (SKU: ${lens.lensCode})`, 'info');
  };

  return (
    <div id="quick-lens-search-section" className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      
      {/* 1. Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                QUICK LENS SEARCH
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/30 text-teal-300 border border-teal-400/30">
                Core Optical Stock
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Instant Power Matcher (-15.00 to +15.00 SPH • -6.00 to +6.00 CYL • 0°-180° AXIS • +0.75 to +4.00 ADD)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear ({activeFilterCount})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('lens-inventory')}
            className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-xs"
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Full Catalog &rarr;</span>
          </button>
        </div>
      </div>

      {/* 2. THE CORE POWER SEARCH CONTROLS (SPH + CYL + AXIS + ADD) */}
      <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          
          {/* SPH POWER FIELD */}
          <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-xs focus-within:border-teal-500 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                SPH (Sphere)
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                -15.00 to +15.00
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleStepSph(-0.25)}
                className="w-8 h-9 rounded-xl bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 font-black text-sm flex items-center justify-center transition active:scale-90"
                title="Decrease 0.25 D"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={sph}
                  placeholder="0.00"
                  onChange={e => setSph(e.target.value)}
                  className="w-full text-center py-1 font-mono text-sm sm:text-base font-black text-slate-900 bg-transparent border-0 focus:ring-0 placeholder:text-slate-300"
                />
              </div>

              <button
                type="button"
                onClick={() => handleStepSph(0.25)}
                className="w-8 h-9 rounded-xl bg-slate-100 hover:bg-teal-100 hover:text-teal-900 text-slate-700 font-black text-sm flex items-center justify-center transition active:scale-90"
                title="Increase 0.25 D"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* SPH Quick Power Dropdown */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
              <select
                value={sph}
                onChange={e => setSph(e.target.value)}
                className="w-full text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg py-1 px-1.5 border border-slate-200 focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="">Select SPH Power...</option>
                {SPH_OPTIONS.map(val => (
                  <option key={`sph-${val}`} value={val}>
                    SPH {val} D
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CYL POWER FIELD */}
          <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-xs focus-within:border-teal-500 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                CYL (Cylinder)
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                -6.00 to +6.00
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleStepCyl(-0.25)}
                className="w-8 h-9 rounded-xl bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 font-black text-sm flex items-center justify-center transition active:scale-90"
                title="Decrease 0.25 D"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={cyl}
                  placeholder="0.00"
                  onChange={e => setCyl(e.target.value)}
                  className="w-full text-center py-1 font-mono text-sm sm:text-base font-black text-slate-900 bg-transparent border-0 focus:ring-0 placeholder:text-slate-300"
                />
              </div>

              <button
                type="button"
                onClick={() => handleStepCyl(0.25)}
                className="w-8 h-9 rounded-xl bg-slate-100 hover:bg-teal-100 hover:text-teal-900 text-slate-700 font-black text-sm flex items-center justify-center transition active:scale-90"
                title="Increase 0.25 D"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CYL Quick Power Dropdown */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
              <select
                value={cyl}
                onChange={e => setCyl(e.target.value)}
                className="w-full text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg py-1 px-1.5 border border-slate-200 focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="">Select CYL Power...</option>
                {CYL_OPTIONS.map(val => (
                  <option key={`cyl-${val}`} value={val}>
                    CYL {val} D
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AXIS FIELD */}
          <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-xs focus-within:border-teal-500 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                AXIS (Degrees)
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                0° to 180°
              </span>
            </div>

            <div className="flex items-center gap-1">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={axis}
                  placeholder="000°"
                  onChange={e => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    const num = parseInt(clean, 10);
                    if (clean === '') setAxis('');
                    else if (!isNaN(num)) setAxis(String(Math.min(180, Math.max(0, num))));
                  }}
                  className="w-full text-center py-1 font-mono text-sm sm:text-base font-black text-slate-900 bg-transparent border-0 focus:ring-0 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Quick Axis Buttons & Dropdown */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1">
              <select
                value={axis}
                onChange={e => setAxis(e.target.value)}
                className="w-full text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg py-1 px-1.5 border border-slate-200 focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="">Select Axis (0°-180°)...</option>
                {AXIS_OPTIONS.map(deg => (
                  <option key={`axis-${deg}`} value={String(deg)}>
                    {deg}° Axis
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ADD POWER FIELD */}
          <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-xs focus-within:border-teal-500 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                ADD (Reading)
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                +0.75 to +4.00
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleStepAdd(-0.25)}
                className="w-8 h-9 rounded-xl bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 font-black text-sm flex items-center justify-center transition active:scale-90"
                title="Decrease 0.25 D"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={add}
                  placeholder="0.00"
                  onChange={e => setAdd(e.target.value)}
                  className="w-full text-center py-1 font-mono text-sm sm:text-base font-black text-slate-900 bg-transparent border-0 focus:ring-0 placeholder:text-slate-300"
                />
              </div>

              <button
                type="button"
                onClick={() => handleStepAdd(0.25)}
                className="w-8 h-9 rounded-xl bg-slate-100 hover:bg-teal-100 hover:text-teal-900 text-slate-700 font-black text-sm flex items-center justify-center transition active:scale-90"
                title="Increase 0.25 D"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ADD Quick Power Dropdown */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
              <select
                value={add}
                onChange={e => setAdd(e.target.value)}
                className="w-full text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg py-1 px-1.5 border border-slate-200 focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="">Select ADD Power...</option>
                {ADD_OPTIONS.map(val => (
                  <option key={`add-${val}`} value={val}>
                    ADD {val} D
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Quick Common Axis Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Quick Axis:</span>
          {COMMON_AXIS_VALUES.map(deg => (
            <button
              key={`axis-btn-${deg}`}
              type="button"
              onClick={() => setAxis(axis === String(deg) ? '' : String(deg))}
              className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition ${
                axis === String(deg)
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {deg}°
            </button>
          ))}
          {axis && (
            <button
              type="button"
              onClick={() => setAxis('')}
              className="text-[11px] text-rose-600 font-bold ml-1 hover:underline"
            >
              Clear Axis
            </button>
          )}
        </div>

        {/* Search Input and Advanced Filters Toggle */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by SKU, Brand, Coating, Material, Rack Location..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isAdvancedOpen
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Advanced Lens Filters</span>
              {isAdvancedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 3. ADVANCED SEARCH ACCORDION */}
        {isAdvancedOpen && (
          <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-inner space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-teal-600" />
                Advanced Multi-Attribute Criteria
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Combine with power values above for ultra-precise inventory retrieval
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {/* Lens Type */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Lens Type</label>
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 font-bold focus:ring-1 focus:ring-teal-500"
                >
                  <option value="All">All Types</option>
                  {uniqueTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={e => setSelectedBrand(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 font-bold focus:ring-1 focus:ring-teal-500"
                >
                  <option value="All">All Brands</option>
                  {uniqueBrands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Company */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company</label>
                <select
                  value={selectedCompany}
                  onChange={e => setSelectedCompany(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 font-bold focus:ring-1 focus:ring-teal-500"
                >
                  <option value="All">All Companies</option>
                  {uniqueCompanies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Coating */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Coating</label>
                <select
                  value={selectedCoating}
                  onChange={e => setSelectedCoating(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 font-bold focus:ring-1 focus:ring-teal-500"
                >
                  <option value="All">All Coatings</option>
                  {uniqueCoatings.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Material */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Material</label>
                <select
                  value={selectedMaterial}
                  onChange={e => setSelectedMaterial(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 font-bold focus:ring-1 focus:ring-teal-500"
                >
                  <option value="All">All Materials</option>
                  {uniqueMaterials.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Refractive Index */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Index</label>
                <select
                  value={selectedIndex}
                  onChange={e => setSelectedIndex(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 font-bold focus:ring-1 focus:ring-teal-500"
                >
                  <option value="All">All Indices</option>
                  {uniqueIndices.map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Availability Filter */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Stock Availability:</span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'all', label: 'All Items' },
                    { id: 'in-stock', label: '🟢 In Stock Only' },
                    { id: 'low-stock', label: '🟡 Low Stock Only' },
                    { id: 'out-of-stock', label: '🔴 Out of Stock Only' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAvailability(tab.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        availability === tab.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Reset Advanced Filters
              </button>
            </div>
          </div>
        )}

        {/* 4. FAST QUICK-FILTER CHIPS */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase shrink-0">Quick Filter:</span>
          {[
            { id: 'all', label: 'All Lenses' },
            { id: 'in-stock', label: 'In Stock' },
            { id: 'low-stock', label: 'Low Stock' },
            { id: 'out-of-stock', label: 'Out of Stock' },
            { id: 'blue-cut', label: 'Blue Cut' },
            { id: 'single-vision', label: 'Single Vision' },
            { id: 'progressive', label: 'Progressive' },
            { id: 'bifocal', label: 'Bifocal' },
            { id: 'photochromic', label: 'Photochromic' },
            { id: 'hi-index', label: 'Hi-Index' },
            { id: 'plano', label: 'Plano (0.00)' }
          ].map(chip => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setQuickFilter(chip.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-bold transition ${
                quickFilter === chip.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

      </div>

      {/* 5. SEARCH RESULTS HEADER */}
      <div className="p-3 sm:px-5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Matching Lenses: <span className="text-teal-700">{filteredLenses.length}</span> / {lenses.length} total SKUs
          </span>

          {(sph || cyl || axis || add) && (
            <span className="text-[11px] font-mono font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-md border border-teal-200">
              Target: {sph ? `SPH ${sph}` : ''} {cyl ? `CYL ${cyl}` : ''} {axis ? `AX ${axis}°` : ''} {add ? `ADD ${add}` : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* 6. SEARCH RESULTS LIST */}
      <div className="p-4 sm:p-5">
        {filteredLenses.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Disc className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-black text-slate-800">
              No matching lenses found in central stock
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No optical lens matches the selected powers ({sph || 'any'} SPH / {cyl || 'any'} CYL / {axis ? `${axis}°` : 'any'} AXIS) or filters.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Clear Search & View All
              </button>
              <button
                type="button"
                onClick={() => setQuickModal('new-purchase')}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition"
              >
                + Stock In / Purchase This Power
              </button>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          /* Cards Grid (Mobile-Optimized) */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredLenses.slice(0, 30).map(lens => {
              const isLow = lens.status === 'Low Stock' || (lens.currentStock > 0 && lens.currentStock <= (lens.reorderLevel || 8));
              const isOut = lens.currentStock <= 0 || lens.status === 'Out of Stock';

              return (
                <div
                  key={lens.lensCode}
                  className={`p-4 rounded-2xl border-2 transition-all hover:shadow-md bg-white ${
                    isOut
                      ? 'border-rose-200 hover:border-rose-300'
                      : isLow
                      ? 'border-amber-200 hover:border-amber-300'
                      : 'border-slate-200 hover:border-teal-400'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        ></span>
                        <h4 className="text-sm font-black text-slate-900 line-clamp-1">
                          {lens.productName || `${lens.brand} ${lens.category || lens.lensType}`}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{lens.brand}</span>
                        <span>•</span>
                        <span>{lens.lensType || lens.category || 'Single Vision'}</span>
                        {lens.company && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[90px]">{lens.company}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                        isOut
                          ? 'bg-rose-100 text-rose-800'
                          : isLow
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>

                  {/* Power Specifications Chips */}
                  <div className="mt-3 grid grid-cols-4 gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-center font-mono">
                    <div className="bg-white p-1 rounded-lg border border-slate-100">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">SPH</span>
                      <span className="text-xs font-black text-amber-700">{lens.sph || '0.00'}</span>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-slate-100">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">CYL</span>
                      <span className="text-xs font-black text-teal-700">{lens.cyl || '0.00'}</span>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-slate-100">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">AXIS</span>
                      <span className="text-xs font-black text-sky-700">{lens.axis ? `${lens.axis}°` : '—'}</span>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-slate-100">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">ADD</span>
                      <span className="text-xs font-black text-purple-700">{lens.add || '—'}</span>
                    </div>
                  </div>

                  {/* Attributes Details */}
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-700">
                        {lens.coating || 'HMC'}
                      </span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-700">
                        idx {lens.index || '1.56'}
                      </span>
                      {lens.material && (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 hidden sm:inline">
                          {lens.material}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 font-mono text-[10px]">
                      Rack: <strong className="text-slate-700">{lens.rackLocation || 'Shelf'}</strong>
                    </div>
                  </div>

                  {/* Stock & Commercials Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Current Stock</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black text-slate-900">{lens.currentStock}</span>
                        <span className="text-[11px] text-slate-500">pairs</span>
                        <span className="text-[10px] text-slate-400">({lens.currentStock * 2} pcs)</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Retail Price</span>
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-base font-black text-teal-700">₹{lens.retailRate}</span>
                        <span className="text-[10px] text-slate-400">(Cost: ₹{lens.purchaseRate})</span>
                      </div>
                    </div>
                  </div>

                  {/* SKU & Actions Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopySku(lens.lensCode)}
                      className="text-[11px] font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold"
                      title="Click to copy SKU"
                    >
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>{lens.lensCode}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewingLens(lens)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="View Full Specifications"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdjustingLens(lens)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="Adjust Physical Stock Count"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddToOrder(lens)}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition"
                        title="Add to Spectacle Order"
                      >
                        <Glasses className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={isOut}
                        onClick={() => setSellingLens(lens)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition ${
                          isOut
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-teal-600 hover:bg-teal-500 text-white shadow-2xs'
                        }`}
                        title="Sell directly via Retail POS"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Sell</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Table View (Desktop & Tablet Optimized) */
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Lens Name & Type</th>
                  <th className="py-2.5 px-3">Brand & Co.</th>
                  <th className="py-2.5 px-3 text-center">SPH</th>
                  <th className="py-2.5 px-3 text-center">CYL</th>
                  <th className="py-2.5 px-3 text-center">AXIS</th>
                  <th className="py-2.5 px-3 text-center">ADD</th>
                  <th className="py-2.5 px-3">Coating / Idx</th>
                  <th className="py-2.5 px-3 text-right">Current Stock</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLenses.slice(0, 50).map(lens => {
                  const isLow = lens.status === 'Low Stock' || (lens.currentStock > 0 && lens.currentStock <= (lens.reorderLevel || 8));
                  const isOut = lens.currentStock <= 0 || lens.status === 'Out of Stock';

                  return (
                    <tr key={lens.lensCode} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                        <button
                          onClick={() => handleCopySku(lens.lensCode)}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{lens.lensCode}</span>
                          <Copy className="w-2.5 h-2.5 text-slate-400" />
                        </button>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{lens.productName || lens.brand}</div>
                        <div className="text-[10px] text-slate-500">{lens.lensType || lens.category}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        <span className="font-semibold">{lens.brand}</span>
                        <div className="text-[10px] text-slate-400">{lens.company}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-800">
                        {lens.sph || '0.00'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-teal-800">
                        {lens.cyl || '0.00'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-sky-800">
                        {lens.axis ? `${lens.axis}°` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-purple-800">
                        {lens.add || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        <div>{lens.coating || 'HMC'}</div>
                        <div className="text-[10px] text-slate-400">1.{lens.index || '56'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-black text-sm ${isOut ? 'text-rose-700' : isLow ? 'text-amber-700' : 'text-slate-900'}`}>
                          {lens.currentStock}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">pairs</span>
                        <div className="text-[10px] text-slate-400">Min: {lens.reorderLevel || 8}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="font-black text-teal-700">₹{lens.retailRate}</div>
                        <div className="text-[10px] text-slate-400">Cost: ₹{lens.purchaseRate}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOut ? 'Out' : isLow ? 'Low' : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingLens(lens)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdjustingLens(lens)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Adjust"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isOut}
                            onClick={() => setSellingLens(lens)}
                            className={`px-2 py-1 rounded-lg text-xs font-black transition ${
                              isOut
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-teal-600 hover:bg-teal-500 text-white'
                            }`}
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredLenses.length > 30 && viewMode === 'cards' && (
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('lens-inventory')}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Showing first 30 of {filteredLenses.length} matching lenses. View all in Central Lens Stock Catalog &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Action Modals */}
      {viewingLens && (
        <LensDetailsModal
          lens={viewingLens}
          onClose={() => setViewingLens(null)}
          onSell={lens => {
            setViewingLens(null);
            setSellingLens(lens);
          }}
          onAddToOrder={lens => {
            setViewingLens(null);
            handleAddToOrder(lens);
          }}
          onAdjustStock={lens => {
            setViewingLens(null);
            setAdjustingLens(lens);
          }}
          onViewHistory={lens => {
            setViewingLens(null);
            setHistoryLens(lens);
          }}
          showToast={showToast}
        />
      )}

      {sellingLens && (
        <QuickSellLensModal
          lens={sellingLens}
          onClose={() => setSellingLens(null)}
          onSuccess={inv => {
            // Success callback
          }}
        />
      )}

      {adjustingLens && (
        <QuickAdjustLensModal
          lens={adjustingLens}
          onClose={() => setAdjustingLens(null)}
        />
      )}

      {historyLens && (
        <LensPurchaseHistoryModal
          lens={historyLens}
          onClose={() => setHistoryLens(null)}
          onNewPurchase={() => setQuickModal('new-purchase')}
        />
      )}

    </div>
  );
};
