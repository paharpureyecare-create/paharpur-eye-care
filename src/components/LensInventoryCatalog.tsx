import React, { useState, useMemo } from 'react';
import { useErp } from '../context/ErpContext';
import { LensMaster, LensStockType } from '../types';

const DEFAULT_LENS_STOCK_TYPES: LensStockType[] = [
  'SINGLE VISION SPHERICAL',
  'SINGLE VISION CYLINDRICAL / TORIC',
  'BLUE CUT',
  'BLUE CUT GREEN',
  'BLUE CUT BLUE',
  'PG / PHOTOCHROMIC',
  'PROGRESSIVE',
  'PROGRESSIVE BLUE CUT',
  'BIFOCAL',
  'HI-INDEX 1.67'
];
import {
  Search,
  Filter,
  X,
  Plus,
  Minus,
  SlidersHorizontal,
  ShoppingBag,
  Edit2,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Boxes,
  Eye,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  RotateCcw,
  Sparkles,
  Users,
  Warehouse,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
  Disc
} from 'lucide-react';

interface LensInventoryCatalogProps {
  onEditLens: (lens: LensMaster) => void;
  onAdjustStock: (lensCode: string) => void;
  onStockIn: (lens: LensMaster) => void;
  onDeleteLens: (lensCode: string) => void;
  onOpenBatchModal: () => void;
  onOpenReturnModal: (lensCode?: string) => void;
}

export const LensInventoryCatalog: React.FC<LensInventoryCatalogProps> = ({
  onEditLens,
  onAdjustStock,
  onStockIn,
  onDeleteLens,
  onOpenBatchModal,
  onOpenReturnModal
}) => {
  const {
    lenses,
    activeLensTypes = [],
    adjustLensStock,
    showToast,
    hasPermission,
    checkAndExecuteAction,
    prescriptions = [],
    spectacleOrders = []
  } = useErp();

  const availableLensTypes = useMemo(() => {
    return activeLensTypes.length > 0 ? activeLensTypes : DEFAULT_LENS_STOCK_TYPES;
  }, [activeLensTypes]);

  // View & display modes
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<string>('all');
  const [filterSph, setFilterSph] = useState<string>('All');
  const [filterCyl, setFilterCyl] = useState<string>('All');
  const [filterAdd, setFilterAdd] = useState<string>('All');
  const [filterIndex, setFilterIndex] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterBrand, setFilterBrand] = useState<string>('All');
  const [filterCoating, setFilterCoating] = useState<string>('All');
  const [filterMaterial, setFilterMaterial] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterRack, setFilterRack] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'sph-asc' | 'sph-desc' | 'stock-asc' | 'stock-desc' | 'retail-asc' | 'retail-desc' | 'name-asc'>('sph-desc');

  // Matching Rx Modal
  const [matchingRxLens, setMatchingRxLens] = useState<LensMaster | null>(null);

  // Extract unique filter dropdown values
  const uniqueSphValues = useMemo(() => {
    const set = new Set<string>();
    lenses.forEach(l => { if (l.sph) set.add(l.sph.trim()); });
    return Array.from(set).sort((a, b) => {
      const numA = parseFloat(a) || 0;
      const numB = parseFloat(b) || 0;
      return numB - numA;
    });
  }, [lenses]);

  const uniqueCylValues = useMemo(() => {
    const set = new Set<string>();
    lenses.forEach(l => { if (l.cyl) set.add(l.cyl.trim()); });
    return Array.from(set).sort((a, b) => {
      const numA = parseFloat(a) || 0;
      const numB = parseFloat(b) || 0;
      return numB - numA;
    });
  }, [lenses]);

  const uniqueAddValues = useMemo(() => {
    const set = new Set<string>();
    lenses.forEach(l => {
      if (l.add && l.add !== '—' && l.add !== '-') set.add(l.add.trim());
    });
    return Array.from(set).sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));
  }, [lenses]);

  const uniqueIndices = useMemo(() => {
    const set = new Set<string>();
    lenses.forEach(l => { if (l.index) set.add(l.index.trim()); });
    return Array.from(set).sort();
  }, [lenses]);

  const uniqueBrands = useMemo(() => {
    const set = new Set<string>();
    lenses.forEach(l => { if (l.brand) set.add(l.brand.trim()); });
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

  const uniqueRacks = useMemo(() => {
    const set = new Set<string>();
    lenses.forEach(l => { if (l.rackLocation) set.add(l.rackLocation.trim()); });
    return Array.from(set).sort();
  }, [lenses]);

  // Active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterSph !== 'All') count++;
    if (filterCyl !== 'All') count++;
    if (filterAdd !== 'All') count++;
    if (filterIndex !== 'All') count++;
    if (filterType !== 'All') count++;
    if (filterBrand !== 'All') count++;
    if (filterCoating !== 'All') count++;
    if (filterMaterial !== 'All') count++;
    if (filterStatus !== 'All') count++;
    if (filterRack !== 'All') count++;
    if (quickFilter !== 'all') count++;
    if (search.trim() !== '') count++;
    return count;
  }, [
    filterSph, filterCyl, filterAdd, filterIndex, filterType,
    filterBrand, filterCoating, filterMaterial, filterStatus,
    filterRack, quickFilter, search
  ]);

  const resetAllFilters = () => {
    setSearch('');
    setQuickFilter('all');
    setFilterSph('All');
    setFilterCyl('All');
    setFilterAdd('All');
    setFilterIndex('All');
    setFilterType('All');
    setFilterBrand('All');
    setFilterCoating('All');
    setFilterMaterial('All');
    setFilterStatus('All');
    setFilterRack('All');
  };

  // Main filtering logic
  const filteredLenses = useMemo(() => {
    return lenses.filter(l => {
      // 1. Text Search query (intelligent parsing)
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const code = (l.lensCode || '').toLowerCase();
        const prod = (l.productName || '').toLowerCase();
        const brand = (l.brand || '').toLowerCase();
        const company = (l.company || '').toLowerCase();
        const type = (l.lensType || '').toLowerCase();
        const coating = (l.coating || '').toLowerCase();
        const material = (l.material || '').toLowerCase();
        const rack = (l.rackLocation || '').toLowerCase();
        const index = (l.index || '').toLowerCase();
        const sph = (l.sph || '').toLowerCase();
        const cyl = (l.cyl || '').toLowerCase();
        const axis = (l.axis || '').toLowerCase();
        const add = (l.add || '').toLowerCase();

        const matchesQuery =
          code.includes(q) ||
          prod.includes(q) ||
          brand.includes(q) ||
          company.includes(q) ||
          type.includes(q) ||
          coating.includes(q) ||
          material.includes(q) ||
          rack.includes(q) ||
          index.includes(q) ||
          sph.includes(q) ||
          cyl.includes(q) ||
          axis.includes(q) ||
          add.includes(q);

        if (!matchesQuery) return false;
      }

      // 2. Quick Filter Chips
      if (quickFilter === 'single-vision') {
        const t = (l.lensType || l.category || '').toUpperCase();
        if (!t.includes('SINGLE VISION') && !t.includes('SV')) return false;
      } else if (quickFilter === 'bifocal') {
        const t = (l.lensType || l.category || '').toUpperCase();
        if (!t.includes('BIFOCAL') && !t.includes('D-SEG') && !t.includes('KRYPTOK')) return false;
      } else if (quickFilter === 'progressive') {
        const t = (l.lensType || l.category || '').toUpperCase();
        if (!t.includes('PROGRESSIVE') && !t.includes('PAL')) return false;
      } else if (quickFilter === 'blue-cut') {
        const t = `${l.lensType || ''} ${l.productName || ''} ${l.coating || ''}`.toUpperCase();
        if (!t.includes('BLUE CUT') && !t.includes('BLUE SHIELD') && !t.includes('UV420')) return false;
      } else if (quickFilter === 'photochromic') {
        const t = `${l.lensType || ''} ${l.productName || ''} ${l.category || ''}`.toUpperCase();
        if (!t.includes('PHOTO') && !t.includes('SUN') && !t.includes('TRANSITION')) return false;
      } else if (quickFilter === 'hi-index') {
        const idx = parseFloat(l.index || '0');
        if (idx < 1.60) return false;
      } else if (quickFilter === 'in-stock') {
        if ((l.currentStock || 0) <= 0) return false;
      } else if (quickFilter === 'low-stock') {
        const isLow = l.status === 'Low Stock' || ((l.currentStock || 0) > 0 && (l.currentStock || 0) <= (l.reorderLevel || 8));
        if (!isLow) return false;
      } else if (quickFilter === 'out-of-stock') {
        if ((l.currentStock || 0) > 0) return false;
      } else if (quickFilter === 'plano') {
        const sphNum = parseFloat(l.sph || '0');
        if (sphNum !== 0) return false;
      } else if (quickFilter === 'plus') {
        const sphNum = parseFloat(l.sph || '0');
        if (sphNum <= 0) return false;
      } else if (quickFilter === 'minus') {
        const sphNum = parseFloat(l.sph || '0');
        if (sphNum >= 0) return false;
      } else if (quickFilter === 'cyl') {
        const cylNum = parseFloat(l.cyl || '0');
        if (cylNum === 0 || !l.cyl || l.cyl === '0.00') return false;
      } else if (quickFilter === 'add') {
        if (!l.add || l.add === '—' || l.add === '-' || l.add === '0.00') return false;
      }

      // 3. Dropdown Attribute Filters
      if (filterSph !== 'All' && l.sph !== filterSph) return false;
      if (filterCyl !== 'All' && l.cyl !== filterCyl) return false;
      if (filterAdd !== 'All' && l.add !== filterAdd) return false;
      if (filterIndex !== 'All' && l.index !== filterIndex) return false;
      if (filterType !== 'All' && l.lensType !== filterType && l.category !== filterType) return false;
      if (filterBrand !== 'All' && l.brand !== filterBrand) return false;
      if (filterCoating !== 'All' && l.coating !== filterCoating) return false;
      if (filterMaterial !== 'All' && l.material !== filterMaterial) return false;
      if (filterRack !== 'All' && l.rackLocation !== filterRack) return false;

      // Status
      if (filterStatus !== 'All') {
        if (filterStatus === 'Available' && (l.currentStock || 0) <= (l.reorderLevel || 8)) return false;
        if (filterStatus === 'Low Stock' && ((l.currentStock || 0) <= 0 || (l.currentStock || 0) > (l.reorderLevel || 8))) return false;
        if (filterStatus === 'Out of Stock' && (l.currentStock || 0) > 0) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'sph-asc') {
        return (parseFloat(a.sph || '0') || 0) - (parseFloat(b.sph || '0') || 0);
      }
      if (sortBy === 'sph-desc') {
        return (parseFloat(b.sph || '0') || 0) - (parseFloat(a.sph || '0') || 0);
      }
      if (sortBy === 'stock-asc') {
        return (a.currentStock || 0) - (b.currentStock || 0);
      }
      if (sortBy === 'stock-desc') {
        return (b.currentStock || 0) - (a.currentStock || 0);
      }
      if (sortBy === 'retail-asc') {
        return (a.retailRate || 0) - (b.retailRate || 0);
      }
      if (sortBy === 'retail-desc') {
        return (b.retailRate || 0) - (a.retailRate || 0);
      }
      if (sortBy === 'name-asc') {
        return (a.productName || a.brand).localeCompare(b.productName || b.brand);
      }
      return 0;
    });
  }, [
    lenses, search, quickFilter, filterSph, filterCyl, filterAdd,
    filterIndex, filterType, filterBrand, filterCoating, filterMaterial,
    filterStatus, filterRack, sortBy
  ]);

  // Aggregate stats for filtered result
  const stats = useMemo(() => {
    const totalCount = filteredLenses.length;
    const totalStock = filteredLenses.reduce((sum, l) => sum + (l.currentStock || 0), 0);
    const lowStockCount = filteredLenses.filter(l => (l.currentStock || 0) <= (l.reorderLevel || 8)).length;
    const totalRetailValuation = filteredLenses.reduce((sum, l) => sum + (l.currentStock || 0) * (l.retailRate || 0), 0);
    const totalWholesaleValuation = filteredLenses.reduce((sum, l) => sum + (l.currentStock || 0) * (l.wholesaleRate || 0), 0);
    return { totalCount, totalStock, lowStockCount, totalRetailValuation, totalWholesaleValuation };
  }, [filteredLenses]);

  // Quick inline stock adjustment
  const handleQuickStockStep = (lens: LensMaster, delta: number) => {
    checkAndExecuteAction('Lenses', 'edit', () => {
      const newQty = (lens.currentStock || 0) + delta;
      if (newQty < 0) {
        showToast('Stock cannot fall below 0 pairs', 'error');
        return;
      }
      adjustLensStock(
        lens.lensCode,
        delta,
        delta > 0 ? 'Received Excess' : 'Lab Fitting Wastage',
        `Quick 1-click counter adjustment (${delta > 0 ? '+1' : '-1'} pair)`
      );
      showToast(`${lens.lensCode} stock updated to ${newQty} pairs`, 'success');
    }, 'Quick Stock Step');
  };

  const handleCopySku = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedSku(code);
    showToast(`SKU ${code} copied to clipboard`, 'info');
    setTimeout(() => setCopiedSku(null), 2000);
  };

  // Find matching patient prescriptions
  const findMatchingPrescriptions = (lens: LensMaster) => {
    const sph = lens.sph?.trim();
    const cyl = lens.cyl?.trim();

    return prescriptions.filter(rx => {
      const odSph = rx.distanceOdSph?.trim() || rx.odSph?.trim();
      const odCyl = rx.distanceOdCyl?.trim() || rx.odCyl?.trim();
      const osSph = rx.distanceOsSph?.trim() || rx.osSph?.trim();
      const osCyl = rx.distanceOsCyl?.trim() || rx.osCyl?.trim();

      const matchesOd = (odSph === sph && (!cyl || cyl === '0.00' || odCyl === cyl));
      const matchesOs = (osSph === sph && (!cyl || cyl === '0.00' || osCyl === cyl));

      return matchesOd || matchesOs;
    });
  };

  // Quick Filter Pills definitions
  const filterChips = [
    { id: 'all', label: 'All Lenses' },
    { id: 'in-stock', label: 'In Stock (>0)' },
    { id: 'low-stock', label: 'Low Stock Alert' },
    { id: 'out-of-stock', label: 'Out of Stock (0)' },
    { id: 'single-vision', label: 'Single Vision' },
    { id: 'blue-cut', label: 'Blue Cut' },
    { id: 'bifocal', label: 'Bifocal' },
    { id: 'progressive', label: 'Progressive' },
    { id: 'photochromic', label: 'Photochromic' },
    { id: 'hi-index', label: 'Hi-Index (≥1.60)' },
    { id: 'plano', label: 'Plano (0.00)' },
    { id: 'plus', label: 'Plus SPH (+)' },
    { id: 'minus', label: 'Minus SPH (-)' },
    { id: 'cyl', label: 'With CYL' },
    { id: 'add', label: 'With Reading ADD' }
  ];

  return (
    <div className="space-y-4">
      {/* 1. COMPREHENSIVE SEARCH & ACTION CONTROL BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box with Real-time Power Parsing */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="lens-comprehensive-search-input"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Power (+2.00, -1.50, cyl), SKU, Brand, Series, Coating, Rack..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Controls: Filter Drawer Toggle, View Switcher & Sorter */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Advanced Filter Toggle Button */}
            <button
              id="btn-toggle-advanced-filters"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                showAdvancedFilters || activeFilterCount > 0
                  ? 'bg-teal-50 border-teal-300 text-teal-800 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-teal-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {activeFilterCount}
                </span>
              )}
              {showAdvancedFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                id="lens-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="sph-desc">SPH: Highest to Lowest (+ to -)</option>
                <option value="sph-asc">SPH: Lowest to Highest (- to +)</option>
                <option value="stock-asc">Stock: Low to High (Restock First)</option>
                <option value="stock-desc">Stock: High to Low</option>
                <option value="retail-desc">Retail Price: High to Low</option>
                <option value="retail-asc">Retail Price: Low to High</option>
                <option value="name-asc">Product Name: A to Z</option>
              </select>
            </div>

            {/* View Mode Toggle: Grid vs Table */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                id="btn-view-grid"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-teal-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid / Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                id="btn-view-table"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-teal-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Horizontal Scrollable Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Quick:
          </span>
          {filterChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setQuickFilter(chip.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                quickFilter === chip.id
                  ? 'bg-teal-600 text-white border-teal-700 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
          {activeFilterCount > 0 && (
            <button
              onClick={resetAllFilters}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 shrink-0 cursor-pointer ml-auto flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        {/* 2. EXPANDABLE ADVANCED ATTRIBUTES FILTER PANEL */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
            {/* SPH Filter */}
            <div>
              <label className="font-bold text-slate-600 block mb-1 text-[11px]">SPH (Sphere)</label>
              <select
                id="filter-sph-select"
                value={filterSph}
                onChange={e => setFilterSph(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              >
                <option value="All">All SPH Powers</option>
                {uniqueSphValues.map(s => (
                  <option key={s} value={s}>SPH: {s}</option>
                ))}
              </select>
            </div>

            {/* CYL Filter */}
            <div>
              <label className="font-bold text-slate-600 block mb-1 text-[11px]">CYL (Cylinder)</label>
              <select
                id="filter-cyl-select"
                value={filterCyl}
                onChange={e => setFilterCyl(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              >
                <option value="All">All CYL Powers</option>
                {uniqueCylValues.map(c => (
                  <option key={c} value={c}>CYL: {c}</option>
                ))}
              </select>
            </div>

            {/* ADD Filter */}
            <div>
              <label className="font-bold text-slate-600 block mb-1 text-[11px]">Reading ADD</label>
              <select
                id="filter-add-select"
                value={filterAdd}
                onChange={e => setFilterAdd(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              >
                <option value="All">All ADD Values</option>
                {uniqueAddValues.map(a => (
                  <option key={a} value={a}>ADD: {a}</option>
                ))}
              </select>
            </div>

            {/* Index Filter */}
            <div>
              <label className="font-bold text-slate-600 block mb-1 text-[11px]">Refractive Index</label>
              <select
                id="filter-index-select"
                value={filterIndex}
                onChange={e => setFilterIndex(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 font-mono"
              >
                <option value="All">All Indices</option>
                {uniqueIndices.map(idx => (
                  <option key={idx} value={idx}>{idx} Index</option>
                ))}
              </select>
            </div>

            {/* Lens Stock Type */}
            <div>
              <label className="font-bold text-slate-600 block mb-1 text-[11px]">Lens Stock Type</label>
              <select
                id="filter-type-select"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              >
                <option value="All">All Stock Types</option>
                {availableLensTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="font-bold text-slate-600 block mb-1 text-[11px]">Brand Series</label>
              <select
                id="filter-brand-select"
                value={filterBrand}
                onChange={e => setFilterBrand(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              >
                <option value="All">All Brands</option>
                {uniqueBrands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Coating */}
            <div>
              <label className="font-bold text-slate-600 block mb-1 text-[11px]">Coating Variant</label>
              <select
                id="filter-coating-select"
                value={filterCoating}
                onChange={e => setFilterCoating(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              >
                <option value="All">All Coatings</option>
                {uniqueCoatings.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Material */}
            <div>
              <label className="font-bold text-slate-600 block mb-1 text-[11px]">Substrate Material</label>
              <select
                id="filter-material-select"
                value={filterMaterial}
                onChange={e => setFilterMaterial(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              >
                <option value="All">All Materials</option>
                {uniqueMaterials.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Stock Status */}
            <div>
              <label className="font-bold text-slate-600 block mb-1 text-[11px]">Stock Status</label>
              <select
                id="filter-status-select"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              >
                <option value="All">All Stock Levels</option>
                <option value="Available">Available (In Stock)</option>
                <option value="Low Stock">Low Stock Alert (≤ Reorder)</option>
                <option value="Out of Stock">Out of Stock (0 pairs)</option>
              </select>
            </div>

            {/* Warehouse Rack Location */}
            <div>
              <label className="font-bold text-slate-600 block mb-1 text-[11px]">Storage Rack / Tray</label>
              <select
                id="filter-rack-select"
                value={filterRack}
                onChange={e => setFilterRack(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              >
                <option value="All">All Locations</option>
                {uniqueRacks.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Live Filter Metric Summary */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 flex-wrap gap-2 text-slate-600">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900">
              Showing <span className="text-teal-700 font-black">{filteredLenses.length}</span> of {lenses.length} Lens SKUs
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Total Physical Stock: <strong className="text-slate-900">{stats.totalStock.toLocaleString()}</strong> Pairs
            </span>
            {stats.lowStockCount > 0 && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  {stats.lowStockCount} Reorder Alerts
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">
              Retail Valuation: <strong className="text-emerald-700 font-mono">₹{stats.totalRetailValuation.toLocaleString('en-IN')}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. RESULT DISPLAY: GRID OR TABLE VIEW */}
      {filteredLenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs space-y-3">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Disc className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Lens Power SKUs Match Your Search Criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your SPH, CYL, Index, or Stock filters, or use the 1-Click Power Variant Matrix Generator to bulk-create all power combinations for this lens series.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Reset All Filters
            </button>
            <button
              onClick={onOpenBatchModal}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> 1-Click Matrix Generator
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLenses.map(lens => {
            const isOutOfStock = (lens.currentStock || 0) <= 0;
            const isLowStock = !isOutOfStock && (lens.currentStock || 0) <= (lens.reorderLevel || 8);
            const matchingRxCount = findMatchingPrescriptions(lens).length;

            return (
              <div
                key={lens.lensCode}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-4.5 flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                {/* Top: SKU & Stock Level Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopySku(lens.lensCode)}
                        className="font-mono text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Click to copy SKU Code"
                      >
                        {lens.lensCode}
                        {copiedSku === lens.lensCode ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </div>

                    {/* Stock Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        isOutOfStock
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>

                  {/* Product Title, Brand & Classification */}
                  <div className="mt-2">
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">
                      {lens.productName || lens.brand}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {lens.company} • {lens.brand}
                    </p>
                  </div>

                  {/* Attributes Badges: Index, Type, Coating */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      {lens.lensType || lens.category}
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                      {lens.index} Index
                    </span>
                    {lens.coating && (
                      <span className="bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] truncate max-w-[140px]">
                        {lens.coating}
                      </span>
                    )}
                  </div>

                  {/* EXACT PRESCRIPTION POWER BOX (High Contrast & Optical Precision) */}
                  <div className="mt-3 p-2.5 bg-teal-50/70 border border-teal-200 rounded-xl">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-900 block mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-teal-700" /> Exact Power Coordinates
                      </span>
                      {matchingRxCount > 0 && (
                        <button
                          onClick={() => setMatchingRxLens(lens)}
                          className="text-teal-700 hover:text-teal-900 underline text-[10px] font-bold cursor-pointer"
                        >
                          {matchingRxCount} Matching Rx
                        </button>
                      )}
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-center font-mono">
                      <div className="bg-white p-1 rounded border border-teal-200">
                        <span className="text-[9px] font-bold text-slate-400 block">SPH</span>
                        <span className="font-black text-slate-900 text-xs">{lens.sph || '0.00'}</span>
                      </div>
                      <div className="bg-white p-1 rounded border border-teal-200">
                        <span className="text-[9px] font-bold text-slate-400 block">CYL</span>
                        <span className="font-black text-indigo-900 text-xs">{lens.cyl || '0.00'}</span>
                      </div>
                      <div className="bg-white p-1 rounded border border-teal-200">
                        <span className="text-[9px] font-bold text-slate-400 block">AXIS</span>
                        <span className="font-bold text-slate-700 text-xs">{lens.axis || '—'}</span>
                      </div>
                      <div className="bg-white p-1 rounded border border-teal-200">
                        <span className="text-[9px] font-bold text-slate-400 block">ADD</span>
                        <span className="font-bold text-slate-700 text-xs">{lens.add || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Physical Stock & Quick Step Stepper */}
                  <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Physical Stock
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-900 font-mono">
                          {lens.currentStock}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">pairs</span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          (Reorder: {lens.reorderLevel})
                        </span>
                      </div>
                    </div>

                    {/* Inline Quick +/- 1 Stock Stepper */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                      <button
                        onClick={() => handleQuickStockStep(lens, -1)}
                        disabled={isOutOfStock}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs cursor-pointer disabled:opacity-40 transition-colors"
                        title="Deduct 1 pair (Lab fitting / sale)"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleQuickStockStep(lens, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-teal-50 hover:bg-teal-100 text-teal-800 font-black text-xs cursor-pointer transition-colors"
                        title="Add 1 pair (Stock arrival / restock)"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="grid grid-cols-3 gap-1.5 mt-2.5 text-center font-mono text-[11px]">
                    <div className="bg-slate-100 p-1 rounded-lg">
                      <span className="text-[9px] text-slate-400 font-bold block">Cost</span>
                      <span className="font-bold text-slate-700">₹{lens.purchaseRate}</span>
                    </div>
                    <div className="bg-indigo-50 p-1 rounded-lg">
                      <span className="text-[9px] text-indigo-500 font-bold block">Wholesale</span>
                      <span className="font-bold text-indigo-900">₹{lens.wholesaleRate}</span>
                    </div>
                    <div className="bg-emerald-50 p-1 rounded-lg">
                      <span className="text-[9px] text-emerald-600 font-bold block">Retail</span>
                      <span className="font-bold text-emerald-800">₹{lens.retailRate}</span>
                    </div>
                  </div>

                  {/* Location & Supplier */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
                    <span className="truncate">
                      📍 {lens.rackLocation || 'Rack A - Shelf 01'}
                    </span>
                    {lens.supplier && (
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        🏢 {lens.supplier}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Quick-Action Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAdjustStock(lens.lensCode)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Physical Stock Audit & Reason Adjustment"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Audit</span>
                    </button>
                    <button
                      onClick={() => onStockIn(lens)}
                      className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Inward / Purchase Stock-IN"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Inward</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditLens(lens)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                      title="Edit Power SKU Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {hasPermission('Lenses', 'delete') && (
                      <button
                        onClick={() => onDeleteLens(lens.lensCode)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                        title="Delete Lens SKU"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DENSE TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">SKU & Product</th>
                  <th className="py-3 px-4">Stock Type & Index</th>
                  <th className="py-3 px-4 bg-slate-800 text-teal-200">Exact Power (SPH / CYL / AXIS / ADD)</th>
                  <th className="py-3 px-4">Stock Levels</th>
                  <th className="py-3 px-4">Pricing (Cost / B2B / Retail)</th>
                  <th className="py-3 px-4">Rack Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLenses.map(lens => {
                  const isOutOfStock = (lens.currentStock || 0) <= 0;
                  const isLowStock = !isOutOfStock && (lens.currentStock || 0) <= (lens.reorderLevel || 8);

                  return (
                    <tr key={lens.lensCode} className="hover:bg-slate-50/80 transition-colors">
                      {/* SKU & Product */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {lens.lensCode}
                          </span>
                          <button
                            onClick={() => handleCopySku(lens.lensCode)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            title="Copy SKU"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="font-bold text-slate-800 text-sm mt-0.5">
                          {lens.productName || lens.brand}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {lens.company} • {lens.brand}
                        </div>
                      </td>

                      {/* Stock Type & Index */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-teal-900 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-[11px] block w-max">
                          {lens.lensType || lens.category}
                        </span>
                        <span className="text-[11px] text-slate-600 block mt-0.5 font-medium">
                          {lens.coating} • <strong className="font-mono">{lens.index}</strong> Index
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {lens.diameter} • {lens.material || 'CR-39'}
                        </span>
                      </td>

                      {/* Exact Power */}
                      <td className="py-3 px-4 bg-teal-50/40 border-l border-r border-teal-100">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-xs">
                          <div className="bg-white px-2 py-1 rounded border border-teal-200 shadow-2xs">
                            <span className="text-[9px] text-slate-400 font-bold block">SPH</span>
                            <span className="font-black text-slate-900 text-sm">{lens.sph || '0.00'}</span>
                          </div>
                          <div className="bg-white px-2 py-1 rounded border border-teal-200 shadow-2xs">
                            <span className="text-[9px] text-slate-400 font-bold block">CYL</span>
                            <span className="font-black text-indigo-900 text-sm">{lens.cyl || '0.00'}</span>
                          </div>
                          <div className="bg-white px-2 py-1 rounded border border-slate-200">
                            <span className="text-[9px] text-slate-400 font-bold block">AXIS</span>
                            <span className="font-bold text-slate-700">{lens.axis || '—'}</span>
                          </div>
                          <div className="bg-white px-2 py-1 rounded border border-slate-200">
                            <span className="text-[9px] text-slate-400 font-bold block">ADD</span>
                            <span className="font-bold text-slate-700">{lens.add || '—'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Stock Level & Stepper */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-black text-base text-slate-900 font-mono block">
                              {lens.currentStock} <span className="text-xs font-semibold text-slate-500">pairs</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Reorder: {lens.reorderLevel}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => handleQuickStockStep(lens, 1)}
                              className="p-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 cursor-pointer"
                              title="+1 Pair"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleQuickStockStep(lens, -1)}
                              disabled={isOutOfStock}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer disabled:opacity-30"
                              title="-1 Pair"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-emerald-700 text-xs">
                          Retail: ₹{lens.retailRate}
                        </div>
                        <div className="text-[11px] text-indigo-700 font-semibold">
                          B2B: ₹{lens.wholesaleRate}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Cost: ₹{lens.purchaseRate}
                        </div>
                      </td>

                      {/* Rack Location */}
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium text-slate-700 block">
                          📍 {lens.rackLocation || 'Rack A - Shelf 01'}
                        </span>
                        {lens.supplier && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                            {lens.supplier}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-800'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {lens.status || (isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Available')}
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => onAdjustStock(lens.lensCode)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                          title="Stock Audit & Adjustment"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onStockIn(lens)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                          title="Stock-IN Purchase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditLens(lens)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                          title="Edit Lens SKU"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {hasPermission('Lenses', 'delete') && (
                          <button
                            onClick={() => onDeleteLens(lens.lensCode)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                            title="Delete SKU"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODAL: MATCHING PATIENT PRESCRIPTIONS DRAWER */}
      {matchingRxLens && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  Prescriptions Matching Lens Power
                </h3>
                <p className="text-xs text-slate-500">
                  Lens SKU: <strong className="font-mono">{matchingRxLens.lensCode}</strong> (SPH: {matchingRxLens.sph}, CYL: {matchingRxLens.cyl})
                </p>
              </div>
              <button onClick={() => setMatchingRxLens(null)} className="text-slate-400 hover:text-slate-700 text-lg">
                ✕
              </button>
            </div>

            {(() => {
              const matches = findMatchingPrescriptions(matchingRxLens);
              if (matches.length === 0) {
                return (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No logged patient prescriptions currently match SPH {matchingRxLens.sph} and CYL {matchingRxLens.cyl}.
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-teal-800 bg-teal-50 p-2.5 rounded-xl border border-teal-200">
                    Found {matches.length} patient prescriptions requiring this exact lens power.
                  </p>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {matches.map(rx => (
                      <div key={rx.prescriptionId || rx.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{rx.patientName}</div>
                          <div className="text-[11px] text-slate-500">
                            MRD: {rx.mrd} • Date: {rx.date}
                          </div>
                          <div className="text-[11px] text-teal-700 font-mono font-bold mt-0.5">
                            OD: SPH {rx.distanceOdSph || rx.odSph || '0.00'} CYL {rx.distanceOdCyl || rx.odCyl || '0.00'} | OS: SPH {rx.distanceOsSph || rx.osSph || '0.00'} CYL {rx.distanceOsCyl || rx.osCyl || '0.00'}
                          </div>
                        </div>
                        <span className="bg-slate-100 text-slate-700 font-mono text-[10px] px-2 py-1 rounded">
                          {rx.doctor || 'Optometrist'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setMatchingRxLens(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
