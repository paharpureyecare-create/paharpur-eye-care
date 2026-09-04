import React, { useState, useMemo } from 'react';
import { useErp } from '../context/ErpContext';
import { LensMaster, StockAdjustmentRecord, LensReturnRecord, LensPurchaseRecord, LensStockType } from '../types';
import {
  Disc,
  Plus,
  Search,
  AlertTriangle,
  Boxes,
  Edit2,
  Trash2,
  TrendingUp,
  Tag,
  Layers,
  Grid,
  CheckCircle2,
  RotateCcw,
  SlidersHorizontal,
  PackageCheck,
  Percent,
  Warehouse,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Filter,
  Sparkles,
  ArrowDownUp,
  Eye,
  Check,
  RefreshCw,
  ShoppingBag,
  Database
} from 'lucide-react';

const LENS_STOCK_TYPES: LensStockType[] = [
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

export const LensInventoryView: React.FC = () => {
  const {
    lenses,
    saveLens,
    deleteLens,
    stockAdjustments,
    lensReturns,
    lensPurchases = [],
    adjustLensStock,
    createLensReturn,
    purchaseLensStockIn,
    batchGenerateLenses,
    suppliers = [],
    showToast,
    activeLensTypes = [],
    activeBrands = [],
    activeCompanies = [],
    activeCoatings = [],
    activeRefractiveIndices = [],
    setActiveTab: setGlobalActiveTab
  } = useErp();

  const availableLensTypeOptions = useMemo(() => {
    return activeLensTypes.length > 0 ? activeLensTypes : LENS_STOCK_TYPES;
  }, [activeLensTypes]);

  const [activeTab, setActiveTab] = useState<'catalog' | 'products' | 'power-matrix' | 'purchases' | 'adjustments' | 'returns'>('catalog');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterSph, setFilterSph] = useState<string>('All');
  const [filterCyl, setFilterCyl] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCoating, setFilterCoating] = useState<string>('All');

  const [editingLens, setEditingLens] = useState<LensMaster | null>(null);

  // Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedLensCodeForAdjust, setSelectedLensCodeForAdjust] = useState('');
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<StockAdjustmentRecord['type']>('Physical Audit');
  const [adjustReason, setAdjustReason] = useState('');

  // Lens Return Modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnLensCode, setReturnLensCode] = useState('');
  const [returnParty, setReturnParty] = useState('');
  const [returnQty, setReturnQty] = useState<number>(1);
  const [returnReason, setReturnReason] = useState<LensReturnRecord['reason']>('Power Mismatch');
  const [returnRestock, setReturnRestock] = useState(true);
  const [returnNotes, setReturnNotes] = useState('');

  // Purchase / Stock-IN Modal
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [stockInForm, setStockInForm] = useState({
    lensCode: lenses[0]?.lensCode || '',
    productName: lenses[0]?.productName || lenses[0]?.brand || 'Blue Cut Green 1.56',
    company: lenses[0]?.company || 'Vision Care Optics',
    brand: lenses[0]?.brand || 'ClearBlue Protect',
    category: lenses[0]?.category || 'Blue Cut',
    lensType: (lenses[0]?.lensType || 'BLUE CUT GREEN') as LensStockType,
    sph: lenses[0]?.sph || '+0.25',
    cyl: lenses[0]?.cyl || '+0.25',
    axis: lenses[0]?.axis || '180',
    add: lenses[0]?.add || '—',
    supplier: suppliers[0]?.company || 'Essilor Optical India Pvt Ltd',
    invoiceNumber: `INV-PUR-${Date.now().toString().slice(-4)}`,
    purchaseDate: new Date().toISOString().split('T')[0],
    quantity: 20,
    purchaseRate: lenses[0]?.purchaseRate || 220,
    rack: lenses[0]?.rackLocation || 'Rack A - Shelf 01'
  });

  // Batch Power Matrix Generator Modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchForm, setBatchForm] = useState({
    productName: 'Blue Cut Green 1.56',
    company: 'Prime Vision Optics',
    brand: 'Super Shield Green',
    category: 'Blue Cut',
    lensType: 'BLUE CUT GREEN' as LensStockType,
    coating: 'Green HMC (Anti-Glare UV420)',
    index: '1.56',
    material: 'High Index 1.56 Resin',
    diameter: '70mm',
    design: 'Spherical',
    sphMin: -6.00,
    sphMax: 4.00,
    sphStep: 0.50,
    includeCyl: true,
    cylMin: -2.00,
    cylMax: 0.00,
    cylStep: 0.50,
    defaultAxis: '180',
    purchaseRate: 210,
    wholesaleRate: 360,
    retailRate: 850,
    mrp: 1200,
    initialStockPerSku: 20,
    reorderLevel: 8,
    rackBase: 'Rack A'
  });

  // Matrix Power View Selection
  const [matrixProduct, setMatrixProduct] = useState<string>(
    lenses[0]?.productName || lenses[0]?.brand || 'Blue Cut Green 1.56'
  );

  // Distinct power lists for dropdown filters
  const uniqueSphValues = useMemo(() => {
    const set = new Set<string>();
    lenses.forEach(l => { if (l.sph) set.add(l.sph); });
    return Array.from(set).sort((a, b) => parseFloat(a) - parseFloat(b));
  }, [lenses]);

  const uniqueCylValues = useMemo(() => {
    const set = new Set<string>();
    lenses.forEach(l => { if (l.cyl) set.add(l.cyl); });
    return Array.from(set).sort((a, b) => parseFloat(a) - parseFloat(b));
  }, [lenses]);

  const uniqueCoatings = useMemo(() => {
    const set = new Set<string>();
    lenses.forEach(l => { if (l.coating) set.add(l.coating); });
    return Array.from(set);
  }, [lenses]);

  // Distinct products
  const productGroups = useMemo(() => {
    const map = new Map<string, LensMaster[]>();
    lenses.forEach(l => {
      const key = l.productName || `${l.company} ${l.brand}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(l);
    });
    return Array.from(map.entries()).map(([name, variants]) => {
      const totalPairs = variants.reduce((acc, v) => acc + (v.currentStock || 0), 0);
      const lowStockCount = variants.filter(v => v.status === 'Low Stock' || v.status === 'Out of Stock').length;
      const first = variants[0];
      return {
        productName: name,
        company: first.company,
        brand: first.brand,
        lensType: first.lensType,
        coating: first.coating,
        index: first.index,
        variantsCount: variants.length,
        totalPairs,
        lowStockCount,
        purchaseRate: first.purchaseRate,
        wholesaleRate: first.wholesaleRate,
        retailRate: first.retailRate,
        variants
      };
    });
  }, [lenses]);

  // Filtered Lenses for Catalog
  const filtered = useMemo(() => {
    return lenses.filter(l => {
      const q = search.trim().toLowerCase();
      const code = (l.lensCode || '').toLowerCase();
      const br = (l.brand || '').toLowerCase();
      const comp = (l.company || '').toLowerCase();
      const prod = (l.productName || '').toLowerCase();
      const coat = (l.coating || '').toLowerCase();
      const type = (l.lensType || '').toLowerCase();
      const rack = (l.rackLocation || '').toLowerCase();

      const matchesSearch =
        !q ||
        code.includes(q) ||
        br.includes(q) ||
        comp.includes(q) ||
        prod.includes(q) ||
        coat.includes(q) ||
        type.includes(q) ||
        rack.includes(q) ||
        (l.sph && l.sph.includes(q)) ||
        (l.cyl && l.cyl.includes(q));

      const matchesType = filterType === 'All' || l.lensType === filterType || l.category === filterType;
      const matchesSph = filterSph === 'All' || l.sph === filterSph;
      const matchesCyl = filterCyl === 'All' || l.cyl === filterCyl;
      const matchesStatus = filterStatus === 'All' || l.status === filterStatus;
      const matchesCoating = filterCoating === 'All' || l.coating === filterCoating;

      return matchesSearch && matchesType && matchesSph && matchesCyl && matchesStatus && matchesCoating;
    });
  }, [lenses, search, filterType, filterSph, filterCyl, filterStatus, filterCoating]);

  // Calculations
  const totalPairs = useMemo(() => lenses.reduce((acc, l) => acc + (l.currentStock || 0), 0), [lenses]);
  const totalValuation = useMemo(() => lenses.reduce((acc, l) => acc + (l.currentStock || 0) * (l.retailRate || 0), 0), [lenses]);
  const totalWholesaleValuation = useMemo(() => lenses.reduce((acc, l) => acc + (l.currentStock || 0) * (l.wholesaleRate || 0), 0), [lenses]);
  const totalPurchaseValuation = useMemo(() => lenses.reduce((acc, l) => acc + (l.currentStock || 0) * (l.purchaseRate || 0), 0), [lenses]);
  const lowStockCount = useMemo(() => lenses.filter(l => l.status === 'Low Stock' || l.status === 'Out of Stock').length, [lenses]);

  // Handlers
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLensCodeForAdjust) {
      showToast('Select a lens power variant to adjust', 'error');
      return;
    }
    if (adjustQty === 0) {
      showToast('Adjustment quantity cannot be 0', 'error');
      return;
    }
    adjustLensStock(selectedLensCodeForAdjust, adjustQty, adjustType, adjustReason);
    setShowAdjustModal(false);
    setSelectedLensCodeForAdjust('');
    setAdjustQty(0);
    setAdjustReason('');
  };

  const handleSaveReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnLensCode || !returnParty.trim()) {
      showToast('Select lens and enter party name', 'error');
      return;
    }
    createLensReturn({
      lensCode: returnLensCode,
      returnSource: 'Customer',
      partyName: returnParty.trim(),
      quantity: returnQty,
      reason: returnReason,
      condition: 'Intact',
      actionTaken: returnRestock ? 'Restocked to Active Inventory' : 'Kept in Defective Hold',
      restockedToInventory: returnRestock,
      notes: returnNotes
    });
    setShowReturnModal(false);
    setReturnLensCode('');
    setReturnParty('');
    setReturnQty(1);
    setReturnNotes('');
  };

  const handleStockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInForm.lensCode || stockInForm.quantity <= 0) {
      showToast('Please specify valid lens SKU and quantity', 'error');
      return;
    }
    purchaseLensStockIn({
      lensCode: stockInForm.lensCode,
      productName: stockInForm.productName,
      company: stockInForm.company,
      brand: stockInForm.brand,
      category: stockInForm.category,
      lensType: stockInForm.lensType,
      sph: stockInForm.sph,
      cyl: stockInForm.cyl,
      axis: stockInForm.axis,
      add: stockInForm.add,
      supplier: stockInForm.supplier,
      invoiceNumber: stockInForm.invoiceNumber,
      purchaseDate: stockInForm.purchaseDate,
      quantity: stockInForm.quantity,
      purchaseRate: stockInForm.purchaseRate,
      rack: stockInForm.rack
    });
    setShowStockInModal(false);
  };

  const handleBatchGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const generated: LensMaster[] = [];
    const prefix = batchForm.productName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4);

    const formatNum = (n: number) => (n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2));
    const formatCodeNum = (n: number) => {
      const sign = n >= 0 ? 'P' : 'M';
      const absVal = Math.abs(n).toFixed(2).replace('.', '');
      return `${sign}${absVal.padStart(3, '0')}`;
    };

    const cylValues: number[] = [];
    if (batchForm.includeCyl) {
      for (let c = batchForm.cylMin; c <= batchForm.cylMax + 0.001; c += batchForm.cylStep) {
        cylValues.push(parseFloat(c.toFixed(2)));
      }
    } else {
      cylValues.push(0.00);
    }

    for (let s = batchForm.sphMin; s <= batchForm.sphMax + 0.001; s += batchForm.sphStep) {
      const sphVal = parseFloat(s.toFixed(2));
      for (const cylVal of cylValues) {
        const sphStr = formatNum(sphVal);
        const cylStr = formatNum(cylVal);
        const axisStr = cylVal !== 0 ? batchForm.defaultAxis : '—';
        const code = `${prefix}-${batchForm.index.replace('.', '')}-${formatCodeNum(sphVal)}-${formatCodeNum(cylVal)}${cylVal !== 0 ? `-${batchForm.defaultAxis}` : ''}`;

        const item: LensMaster = {
          lensCode: code,
          sku: code,
          productName: batchForm.productName,
          company: batchForm.company,
          brand: batchForm.brand,
          category: batchForm.category,
          lensType: batchForm.lensType,
          coating: batchForm.coating,
          index: batchForm.index,
          material: batchForm.material,
          design: batchForm.design,
          diameter: batchForm.diameter,
          sph: sphStr,
          cyl: cylStr,
          axis: axisStr,
          add: '—',
          purchaseRate: batchForm.purchaseRate,
          wholesaleRate: batchForm.wholesaleRate,
          retailRate: batchForm.retailRate,
          mrp: batchForm.mrp,
          currentStock: batchForm.initialStockPerSku,
          reorderLevel: batchForm.reorderLevel,
          rackLocation: `${batchForm.rackBase} - ${sphVal >= 0 ? 'Plus Box' : 'Minus Box'}`,
          status: 'Available'
        };
        generated.push(item);
      }
    }

    batchGenerateLenses(generated);
    setShowBatchModal(false);
  };

  // Matrix Power Rows & Cols for Visual Tray
  const matrixSphRows = ['+4.00', '+3.00', '+2.00', '+1.00', '+0.25', '0.00', '-0.25', '-0.50', '-1.00', '-2.00', '-3.00', '-4.00', '-5.00', '-6.00'];
  const matrixCylCols = ['0.00', '+0.25', '-0.25', '-0.50', '-0.75', '-1.00', '-1.50', '-2.00'];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-teal-600" />
              Optical Lens Stockist & Exact Power Inventory
            </h1>
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              Wholesale Power-Wise Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Exact prescription power tracking (SPH, CYL, AXIS, ADD) per SKU, multi-tier pricing, 1-click batch matrix generation & live tray lookup.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowBatchModal(true)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" /> 1-Click Power Matrix Generator
          </button>
          <button
            onClick={() => setShowStockInModal(true)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Purchase / Stock IN
          </button>
          <button
            onClick={() => setShowAdjustModal(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Stock Audit / Adjust
          </button>
          <button
            onClick={() => setShowReturnModal(true)}
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Log Return
          </button>
          <button
            id="btn-nav-lens-master"
            onClick={() => setGlobalActiveTab('masters')}
            className="bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="Configure dynamic lens types, brands, coatings, indices in Master Management"
          >
            <Database className="w-3.5 h-3.5 text-teal-600" /> Lens Master ({availableLensTypeOptions.length})
          </button>
          <button
            id="btn-add-lens-sku"
            onClick={() => {
              setEditingLens({
                lensCode: `BCG-156-P025-P025-180-${Date.now().toString().slice(-3)}`,
                productName: 'Blue Cut Green 1.56',
                company: 'Prime Vision Optics',
                brand: 'ClearBlue Green HMC',
                category: 'Blue Cut',
                lensType: 'BLUE CUT GREEN',
                design: 'Spherical',
                coating: 'Green HMC (Anti-Glare UV420)',
                index: '1.56',
                diameter: '70mm',
                material: 'High Index 1.56 Resin',
                sph: '+0.25',
                cyl: '+0.25',
                axis: '180',
                add: '—',
                purchaseRate: 210,
                wholesaleRate: 360,
                retailRate: 850,
                mrp: 1200,
                currentStock: 25,
                reorderLevel: 8,
                status: 'Available',
                rackLocation: 'Rack A - Shelf 01',
                supplier: 'Essilor Optical India Pvt Ltd'
              });
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Add Power SKU
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Inventory</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalPairs.toLocaleString()} Pairs</p>
          <span className="text-[11px] text-teal-700 font-semibold">{lenses.length} Exact Power SKUs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Purchase Cost Value</span>
          <p className="text-2xl font-black text-slate-700 mt-1">₹{totalPurchaseValuation.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-500 font-semibold">Net Capital Invested</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">B2B Wholesale Valuation</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">₹{totalWholesaleValuation.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-indigo-600 font-semibold">Dealer dispatch value</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Retail MRP Valuation</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹{totalValuation.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-700 font-semibold">Clinic retail value</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Reorder Alerts</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{lowStockCount} Powers</p>
          <span className="text-[11px] text-amber-700 font-semibold">Under reorder threshold</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'border-teal-600 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Power-wise Lens Catalog ({filtered.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`py-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-teal-600 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" /> Lens Products & Series ({productGroups.length})
        </button>
        <button
          onClick={() => setActiveTab('power-matrix')}
          className={`py-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'power-matrix'
              ? 'border-teal-600 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Grid className="w-4 h-4" /> SPH × CYL Matrix Tray
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`py-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'purchases'
              ? 'border-teal-600 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Purchase & Stock-IN Logs ({lensPurchases.length})
        </button>
        <button
          onClick={() => setActiveTab('adjustments')}
          className={`py-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'adjustments'
              ? 'border-teal-600 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" /> Stock Audits ({stockAdjustments.length})
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`py-3 px-4 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'returns'
              ? 'border-teal-600 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" /> Returns & Restock ({lensReturns.length})
        </button>
      </div>

      {/* TAB 1: EXACT POWER LENS MASTER CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Advanced Power Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 text-xs">
              <div className="lg:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search SKU, Product, Brand, Rack, SPH, CYL..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:bg-white"
                >
                  <option value="All">All Lens Stock Types</option>
                  {availableLensTypeOptions.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterSph}
                  onChange={e => setFilterSph(e.target.value)}
                  className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:bg-white"
                >
                  <option value="All">All SPH Powers</option>
                  {uniqueSphValues.map(s => (
                    <option key={s} value={s}>SPH: {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterCyl}
                  onChange={e => setFilterCyl(e.target.value)}
                  className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:bg-white"
                >
                  <option value="All">All CYL Powers</option>
                  {uniqueCylValues.map(c => (
                    <option key={c} value={c}>CYL: {c}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:bg-white"
                >
                  <option value="All">All Stock Status</option>
                  <option value="Available">Available Only</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500">Lens Type:</span>
                {['All', 'BLUE CUT GREEN', 'BLUE CUT BLUE', 'SINGLE VISION SPHERICAL', 'SINGLE VISION CYLINDRICAL / TORIC', 'PROGRESSIVE BLUE CUT'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      filterType === t
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {(filterType !== 'All' || filterSph !== 'All' || filterCyl !== 'All' || filterStatus !== 'All' || search) && (
                <button
                  onClick={() => {
                    setFilterType('All');
                    setFilterSph('All');
                    setFilterCyl('All');
                    setFilterStatus('All');
                    setSearch('');
                  }}
                  className="text-teal-700 hover:underline font-bold text-[11px] cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Lens Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-white font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4">Lens SKU & Product</th>
                    <th className="py-3 px-4">Stock Type & Coating</th>
                    <th className="py-3 px-4 bg-slate-800 text-teal-200">Exact Prescription Power</th>
                    <th className="py-3 px-4">Rates (Cost / B2B / Retail)</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Disc className="w-8 h-8 text-slate-300 animate-spin" />
                          <p className="font-semibold">No exact power lens SKU matches your filter criteria.</p>
                          <button
                            onClick={() => setShowBatchModal(true)}
                            className="text-teal-600 underline font-bold mt-1"
                          >
                            Generate power variants using 1-Click Generator
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map(lens => (
                      <tr key={lens.lensCode} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-slate-900 text-xs bg-slate-100 inline-block px-1.5 py-0.5 rounded border border-slate-200">
                            {lens.lensCode}
                          </div>
                          <div className="font-bold text-slate-800 text-sm mt-0.5">
                            {lens.productName || lens.brand}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {lens.company} • {lens.brand}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-teal-900 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-[11px] block w-max">
                            {lens.lensType || lens.category}
                          </span>
                          <span className="text-[11px] text-slate-600 block mt-0.5 font-medium">
                            {lens.coating} • {lens.index} Index
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {lens.diameter} • {lens.material || 'CR-39'}
                          </span>
                        </td>

                        {/* EXACT PRESCRIPTION POWER */}
                        <td className="py-3 px-4 bg-teal-50/40 border-l border-r border-teal-100">
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-xs">
                            <div className="bg-white px-2 py-1 rounded border border-teal-200 shadow-2xs">
                              <span className="text-[10px] text-slate-500 font-bold block">SPH</span>
                              <span className="font-black text-slate-900 text-sm">{lens.sph || '0.00'}</span>
                            </div>
                            <div className="bg-white px-2 py-1 rounded border border-teal-200 shadow-2xs">
                              <span className="text-[10px] text-slate-500 font-bold block">CYL</span>
                              <span className="font-black text-indigo-900 text-sm">{lens.cyl || '0.00'}</span>
                            </div>
                            <div className="bg-white px-2 py-1 rounded border border-slate-200">
                              <span className="text-[10px] text-slate-400 font-bold block">AXIS</span>
                              <span className="font-bold text-slate-700">{lens.axis || '—'}</span>
                            </div>
                            <div className="bg-white px-2 py-1 rounded border border-slate-200">
                              <span className="text-[10px] text-slate-400 font-bold block">ADD</span>
                              <span className="font-bold text-slate-700">{lens.add || '—'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-emerald-700 text-xs">
                            Retail: ₹{lens.retailRate}
                          </div>
                          <div className="text-[11px] text-indigo-700 font-semibold">
                            Wholesale: ₹{lens.wholesaleRate}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Cost: ₹{lens.purchaseRate} • MRP: ₹{lens.mrp}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-black text-base text-slate-900">
                            {lens.currentStock} <span className="text-xs font-semibold text-slate-500">pairs</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            Reorder: {lens.reorderLevel} pairs
                          </div>
                        </td>

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

                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              lens.status === 'Available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : lens.status === 'Low Stock'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {lens.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedLensCodeForAdjust(lens.lensCode);
                              setShowAdjustModal(true);
                            }}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                            title="Audit / Adjust Stock"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setStockInForm({
                                lensCode: lens.lensCode,
                                productName: lens.productName || lens.brand,
                                company: lens.company,
                                brand: lens.brand,
                                category: lens.category,
                                lensType: lens.lensType || 'BLUE CUT GREEN',
                                sph: lens.sph || '+0.25',
                                cyl: lens.cyl || '+0.25',
                                axis: lens.axis || '180',
                                add: lens.add || '—',
                                supplier: lens.supplier || suppliers[0]?.company || 'Essilor Optical India Pvt Ltd',
                                invoiceNumber: `INV-PUR-${Date.now().toString().slice(-4)}`,
                                purchaseDate: new Date().toISOString().split('T')[0],
                                quantity: 20,
                                purchaseRate: lens.purchaseRate,
                                rack: lens.rackLocation || 'Rack A - Shelf 01'
                              });
                              setShowStockInModal(true);
                            }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                            title="Quick Stock IN"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingLens(lens)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                            title="Edit Lens SKU & Power"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete power SKU ${lens.lensCode}?`)) {
                                deleteLens(lens.lensCode);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                            title="Delete Lens SKU"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LENS PRODUCTS & POWER SERIES GROUPING */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Boxes className="w-4 h-4 text-teal-600" /> Lens Product Series & Power Variant Sets
              </h3>
              <p className="text-xs text-slate-500">
                Manage lens product families. Each product contains multiple exact power variant SKUs.
              </p>
            </div>
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Bulk Generate Power Series
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productGroups.map(prod => (
              <div key={prod.productName} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                        {prod.lensType}
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-1">{prod.productName}</h4>
                      <p className="text-xs text-slate-500 font-medium">{prod.company} • {prod.brand}</p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                      {prod.index} Index
                    </span>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Coating:</span>
                      <span className="font-semibold text-slate-800">{prod.coating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Active Power Variants:</span>
                      <span className="font-bold text-teal-800">{prod.variantsCount} SKUs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Total Physical Stock:</span>
                      <span className="font-black text-slate-900">{prod.totalPairs} Pairs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Reorder Alerts:</span>
                      <span className={`font-bold ${prod.lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {prod.lowStockCount} Variants
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs font-mono">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold block">Cost</span>
                      <span className="font-bold text-slate-800">₹{prod.purchaseRate}</span>
                    </div>
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <span className="text-[10px] text-indigo-600 font-bold block">Wholesale</span>
                      <span className="font-bold text-indigo-900">₹{prod.wholesaleRate}</span>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <span className="text-[10px] text-emerald-600 font-bold block">Retail</span>
                      <span className="font-bold text-emerald-900">₹{prod.retailRate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSearch(prod.productName);
                      setActiveTab('catalog');
                    }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    View Power SKUs ({prod.variantsCount})
                  </button>
                  <button
                    onClick={() => {
                      setMatrixProduct(prod.productName);
                      setActiveTab('power-matrix');
                    }}
                    className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    title="View in Power Matrix Tray"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE SPH × CYL POWER MATRIX GRID */}
      {activeTab === 'power-matrix' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-teal-600" /> Optical Workshop Stock Box Power Matrix (SPH vs CYL Tray)
              </h3>
              <p className="text-xs text-slate-500">
                Visual tray matrix: Real-time stock counts mapped to exact power combinations. Click any cell to inspect or adjust stock.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-600">Select Product Series:</span>
              <select
                value={matrixProduct}
                onChange={e => setMatrixProduct(e.target.value)}
                className="text-xs border border-slate-300 rounded-xl p-2 font-bold bg-slate-50 text-slate-800"
              >
                {productGroups.map(p => (
                  <option key={p.productName} value={p.productName}>
                    {p.productName} ({p.variantsCount} SKUs, {p.totalPairs} pairs)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-3 bg-slate-900 text-white font-bold border border-slate-800 w-28">SPH \ CYL</th>
                  {matrixCylCols.map(cyl => (
                    <th key={cyl} className="p-2.5 bg-slate-800 text-teal-200 font-bold border border-slate-700 min-w-[70px]">
                      CYL {cyl}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixSphRows.map(sph => (
                  <tr key={sph}>
                    <td className="p-2 bg-slate-100 font-black text-slate-900 border border-slate-200 font-mono">
                      SPH {sph}
                    </td>
                    {matrixCylCols.map(cyl => {
                      const match = lenses.find(l => {
                        const isProd = l.productName === matrixProduct || l.brand.includes(matrixProduct);
                        return isProd && l.sph === sph && l.cyl === cyl;
                      });

                      const qty = match ? match.currentStock : 0;
                      const hasRecord = Boolean(match);

                      const bgClass = !hasRecord
                        ? 'bg-slate-50/50 text-slate-300 border-slate-200'
                        : qty >= (match?.reorderLevel || 8)
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                        : qty > 0
                        ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 font-bold'
                        : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 font-bold';

                      return (
                        <td
                          key={cyl}
                          onClick={() => {
                            if (match) {
                              setSelectedLensCodeForAdjust(match.lensCode);
                              setShowAdjustModal(true);
                            } else {
                              // Prep new SKU
                              setEditingLens({
                                lensCode: `${matrixProduct.slice(0, 3).toUpperCase()}-156-${sph.replace('+', 'P').replace('-', 'M').replace('.', '')}-${cyl.replace('+', 'P').replace('-', 'M').replace('.', '')}`,
                                productName: matrixProduct,
                                company: 'Prime Vision Optics',
                                brand: matrixProduct,
                                category: 'Blue Cut',
                                lensType: 'BLUE CUT GREEN',
                                design: 'Spherical',
                                coating: 'Green HMC',
                                index: '1.56',
                                diameter: '70mm',
                                material: 'High Index 1.56 Resin',
                                sph,
                                cyl,
                                axis: cyl !== '0.00' ? '180' : '—',
                                add: '—',
                                purchaseRate: 210,
                                wholesaleRate: 360,
                                retailRate: 850,
                                mrp: 1200,
                                currentStock: 20,
                                reorderLevel: 8,
                                status: 'Available',
                                rackLocation: 'Rack A - Shelf 01'
                              });
                            }
                          }}
                          className={`p-2.5 border transition-all cursor-pointer ${bgClass}`}
                          title={match ? `${match.lensCode}: ${qty} pairs in stock (Rack: ${match.rackLocation})` : `No SKU for SPH ${sph} CYL ${cyl}. Click to create!`}
                        >
                          {hasRecord ? (
                            <>
                              <span className="font-black text-sm block font-mono">{qty}</span>
                              <span className="text-[10px] opacity-75 font-semibold">
                                {qty === 1 ? '1 pair' : `${qty} prs`}
                              </span>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-300 block font-mono">+ add</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 pt-3 border-t border-slate-200 text-xs flex-wrap">
              <span className="font-bold text-slate-700">Stock Legend:</span>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-emerald-500 rounded-sm"></div>
                <span className="text-slate-600 font-medium">Sufficient Stock (8+ pairs)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-amber-500 rounded-sm"></div>
                <span className="text-slate-600 font-medium">Low Stock Warning (1-7 pairs)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-rose-500 rounded-sm"></div>
                <span className="text-slate-600 font-medium">Out of Stock (0 pairs)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-slate-100 border border-slate-300 rounded-sm"></div>
                <span className="text-slate-400 font-medium">Uncataloged Power (Click to create)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PURCHASES & STOCK-IN */}
      {activeTab === 'purchases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" /> Supplier Purchases & Incoming Stock Receipts
              </h3>
              <p className="text-xs text-slate-500">
                Log and audit all incoming power-wise lens shipments from optical lens manufacturers and importers.
              </p>
            </div>
            <button
              onClick={() => setShowStockInModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> + Log Purchase / Stock-IN
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Purchase ID & Date</th>
                    <th className="p-3">Supplier & Invoice</th>
                    <th className="p-3">Lens Power SKU</th>
                    <th className="p-3">Prescription Power</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Rate & Total</th>
                    <th className="p-3">Storage Rack</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lensPurchases.length > 0 ? (
                    lensPurchases.map(pur => (
                      <tr key={pur.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{pur.purchaseDate}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{pur.id}</span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{pur.supplier}</div>
                          <span className="text-[11px] text-indigo-700 font-mono font-semibold">
                            Inv: {pur.invoiceNumber}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-mono font-bold text-slate-900">{pur.lensCode}</div>
                          <div className="text-[11px] text-slate-500">{pur.productName}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-teal-900">
                          SPH: {pur.sph || '0.00'} | CYL: {pur.cyl || '0.00'}
                          {pur.axis && pur.axis !== '—' && ` × ${pur.axis}°`}
                        </td>
                        <td className="p-3 font-black text-slate-900 text-sm">
                          {pur.quantity} pairs
                        </td>
                        <td className="p-3 font-mono">
                          <div className="font-bold text-emerald-700">₹{pur.purchaseRate * pur.quantity}</div>
                          <div className="text-[10px] text-slate-400">@ ₹{pur.purchaseRate} / pair</div>
                        </td>
                        <td className="p-3 text-slate-700 font-medium">
                          📍 {pur.rack}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400 text-xs">
                        No purchase records logged yet. Click "+ Log Purchase / Stock-IN" to add.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ADJUSTMENTS */}
      {activeTab === 'adjustments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-600" /> Physical Stock Audit & Power-Wise Reconciliation
              </h3>
              <p className="text-xs text-slate-500">
                Log physical count corrections, lab breakage, and tray audit reconciliations.
              </p>
            </div>
            <button
              onClick={() => setShowAdjustModal(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Log Physical Audit Count
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Date & Adjustment ID</th>
                    <th className="p-3">Lens Power SKU</th>
                    <th className="p-3">Type / Reason</th>
                    <th className="p-3">Previous Stock</th>
                    <th className="p-3">Adjustment</th>
                    <th className="p-3">New Stock</th>
                    <th className="p-3">Auditor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockAdjustments.length > 0 ? (
                    stockAdjustments.map(adj => (
                      <tr key={adj.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-medium text-slate-800">{adj.date}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{adj.id}</span>
                        </td>
                        <td className="p-3 font-semibold text-slate-900 font-mono">{adj.lensCode}</td>
                        <td className="p-3">
                          <div className="font-medium text-slate-800">{adj.type}</div>
                          <div className="text-[11px] text-slate-500">{adj.reason}</div>
                        </td>
                        <td className="p-3 font-mono">{adj.previousStock} pairs</td>
                        <td className="p-3 font-mono font-bold">
                          <span className={adj.adjustmentQty >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                            {adj.adjustmentQty >= 0 ? `+${adj.adjustmentQty}` : adj.adjustmentQty} pairs
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-900">{adj.newStock} pairs</td>
                        <td className="p-3 text-slate-600">{adj.adjustedBy}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No manual stock adjustments logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RETURNS */}
      {activeTab === 'returns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600" /> Lens Returns & Defect Restocking History
              </h3>
              <p className="text-xs text-slate-500">
                Log customer power mismatch returns and dealer replacements.
              </p>
            </div>
            <button
              onClick={() => setShowReturnModal(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Record Lens Return
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Return ID & Date</th>
                    <th className="p-3">Lens Power SKU</th>
                    <th className="p-3">Returned By (Party)</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Action & Restock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lensReturns.length > 0 ? (
                    lensReturns.map(ret => (
                      <tr key={ret.returnId} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-medium text-slate-800">{ret.date}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{ret.returnId}</span>
                        </td>
                        <td className="p-3 font-semibold text-slate-900 font-mono">{ret.lensCode}</td>
                        <td className="p-3">
                          <div className="font-medium text-slate-800">{ret.partyName}</div>
                          <span className="text-[10px] text-slate-400">{ret.returnSource}</span>
                        </td>
                        <td className="p-3 font-bold">{ret.quantity} pairs</td>
                        <td className="p-3 text-slate-700">{ret.reason}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ret.restockedToInventory ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {ret.restockedToInventory ? 'Restocked to Active Stock' : 'Defective Hold'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No lens return records logged.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT / ADD SINGLE EXACT POWER LENS SKU */}
      {editingLens && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Disc className="w-5 h-5 text-teal-600" />
                {editingLens.lensCode.includes('NEW') ? 'Add New Exact Power Lens SKU' : `Edit Power SKU: ${editingLens.lensCode}`}
              </h2>
              <button onClick={() => setEditingLens(null)} className="text-slate-400 hover:text-slate-700 text-base">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Product Identity */}
              <div className="bg-slate-50 p-3 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">Product & Classification</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Product / Series Name *</label>
                    <input
                      type="text"
                      required
                      value={editingLens.productName || ''}
                      onChange={e => setEditingLens({ ...editingLens, productName: e.target.value })}
                      placeholder="e.g. Blue Cut Green 1.56"
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company / Manufacturer *</label>
                    <input
                      type="text"
                      required
                      value={editingLens.company}
                      onChange={e => setEditingLens({ ...editingLens, company: e.target.value })}
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Brand Name *</label>
                    <input
                      type="text"
                      required
                      value={editingLens.brand}
                      onChange={e => setEditingLens({ ...editingLens, brand: e.target.value })}
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Lens Stock Type *</label>
                    <select
                      value={editingLens.lensType || availableLensTypeOptions[0] || 'BLUE CUT GREEN'}
                      onChange={e => setEditingLens({ ...editingLens, lensType: e.target.value as LensStockType })}
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-semibold"
                    >
                      {/* If the current lens has a deactivated or custom type, preserve it at top */}
                      {editingLens.lensType && !availableLensTypeOptions.includes(editingLens.lensType) && (
                        <option value={editingLens.lensType}>{editingLens.lensType} (Legacy / Deactivated)</option>
                      )}
                      {availableLensTypeOptions.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Refractive Index</label>
                    <input
                      type="text"
                      value={editingLens.index}
                      onChange={e => setEditingLens({ ...editingLens, index: e.target.value })}
                      placeholder="1.56 / 1.60 / 1.67"
                      className="w-full px-2.5 py-1.5 border rounded-lg font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Coating Variant</label>
                    <input
                      type="text"
                      value={editingLens.coating}
                      onChange={e => setEditingLens({ ...editingLens, coating: e.target.value })}
                      placeholder="Green HMC / Blue HMC / Crizal"
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* EXACT PRESCRIPTION POWER */}
              <div className="bg-teal-50/70 p-4 rounded-xl border border-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-teal-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-teal-700" /> Exact Prescription Power Coordinates
                  </h4>
                  <span className="text-[11px] text-teal-700 font-semibold">Stock SKU is unique per Power</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">SPH (Sphere) *</label>
                    <input
                      type="text"
                      required
                      value={editingLens.sph || '+0.00'}
                      onChange={e => setEditingLens({ ...editingLens, sph: e.target.value })}
                      placeholder="+0.25 / -1.50"
                      className="w-full px-2.5 py-1.5 border border-teal-300 rounded-lg bg-white font-black text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">CYL (Cylinder) *</label>
                    <input
                      type="text"
                      required
                      value={editingLens.cyl || '0.00'}
                      onChange={e => setEditingLens({ ...editingLens, cyl: e.target.value })}
                      placeholder="+0.25 / -0.75 / 0.00"
                      className="w-full px-2.5 py-1.5 border border-teal-300 rounded-lg bg-white font-black text-sm text-indigo-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">AXIS (0° - 180°)</label>
                    <input
                      type="text"
                      value={editingLens.axis || '—'}
                      onChange={e => setEditingLens({ ...editingLens, axis: e.target.value })}
                      placeholder="180 / 90 / —"
                      className="w-full px-2.5 py-1.5 border border-teal-300 rounded-lg bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">ADD (Progressive)</label>
                    <input
                      type="text"
                      value={editingLens.add || '—'}
                      onChange={e => setEditingLens({ ...editingLens, add: e.target.value })}
                      placeholder="+1.75 / —"
                      className="w-full px-2.5 py-1.5 border border-teal-300 rounded-lg bg-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Rates and Stocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Purchase Rate (Cost ₹)</label>
                  <input
                    type="number"
                    value={editingLens.purchaseRate}
                    onChange={e => setEditingLens({ ...editingLens, purchaseRate: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Wholesale Rate (B2B ₹)</label>
                  <input
                    type="number"
                    value={editingLens.wholesaleRate}
                    onChange={e => setEditingLens({ ...editingLens, wholesaleRate: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border rounded-lg font-bold text-indigo-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Retail Selling Rate (₹)</label>
                  <input
                    type="number"
                    value={editingLens.retailRate}
                    onChange={e => setEditingLens({ ...editingLens, retailRate: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border rounded-lg font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={editingLens.mrp}
                    onChange={e => setEditingLens({ ...editingLens, mrp: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Stock (Pairs)</label>
                  <input
                    type="number"
                    value={editingLens.currentStock}
                    onChange={e => setEditingLens({ ...editingLens, currentStock: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border rounded-lg font-black text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reorder Level (Pairs)</label>
                  <input
                    type="number"
                    value={editingLens.reorderLevel}
                    onChange={e => setEditingLens({ ...editingLens, reorderLevel: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rack / Shelf Location</label>
                  <input
                    type="text"
                    value={editingLens.rackLocation || ''}
                    onChange={e => setEditingLens({ ...editingLens, rackLocation: e.target.value })}
                    placeholder="e.g. Rack A - Shelf 01"
                    className="w-full px-2.5 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Supplier / Distributor</label>
                  <input
                    type="text"
                    value={editingLens.supplier || ''}
                    onChange={e => setEditingLens({ ...editingLens, supplier: e.target.value })}
                    placeholder="e.g. Essilor Optical India"
                    className="w-full px-2.5 py-1.5 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setEditingLens(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  saveLens(editingLens);
                  setEditingLens(null);
                }}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Exact Power Lens SKU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: 1-CLICK POWER VARIANT MATRIX GENERATOR */}
      {showBatchModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                1-Click Bulk Power Variant Matrix Generator (পাওয়ার ভেরিয়েন্ট জেনারেটর)
              </h3>
              <button onClick={() => setShowBatchModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleBatchGenerate} className="space-y-4 text-xs">
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 space-y-1">
                <p className="font-bold text-indigo-900">
                  Optical Stockist Power Grid Generator
                </p>
                <p className="text-indigo-700 text-[11px]">
                  Automatically generates 20–50+ individual exact power SKUs for a product family with standardized codes, pricing, and initial tray stock.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product / Series Name *</label>
                  <input
                    type="text"
                    required
                    value={batchForm.productName}
                    onChange={e => setBatchForm({ ...batchForm, productName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={batchForm.brand}
                    onChange={e => setBatchForm({ ...batchForm, brand: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lens Stock Type *</label>
                  <select
                    value={batchForm.lensType}
                    onChange={e => setBatchForm({ ...batchForm, lensType: e.target.value as LensStockType })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                  >
                    {availableLensTypeOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Coating Variant</label>
                  <input
                    type="text"
                    value={batchForm.coating}
                    onChange={e => setBatchForm({ ...batchForm, coating: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Refractive Index</label>
                  <input
                    type="text"
                    value={batchForm.index}
                    onChange={e => setBatchForm({ ...batchForm, index: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Storage Rack Base</label>
                  <input
                    type="text"
                    value={batchForm.rackBase}
                    onChange={e => setBatchForm({ ...batchForm, rackBase: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Power Range Selection */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase text-[11px]">Prescription Power Matrix Ranges</h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">SPH Min</label>
                    <input
                      type="number"
                      step="0.25"
                      value={batchForm.sphMin}
                      onChange={e => setBatchForm({ ...batchForm, sphMin: Number(e.target.value) })}
                      className="w-full p-2 border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">SPH Max</label>
                    <input
                      type="number"
                      step="0.25"
                      value={batchForm.sphMax}
                      onChange={e => setBatchForm({ ...batchForm, sphMax: Number(e.target.value) })}
                      className="w-full p-2 border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">SPH Step Increment</label>
                    <select
                      value={batchForm.sphStep}
                      onChange={e => setBatchForm({ ...batchForm, sphStep: Number(e.target.value) })}
                      className="w-full p-2 border rounded-lg font-mono"
                    >
                      <option value="0.25">0.25 D (Standard)</option>
                      <option value="0.50">0.50 D</option>
                      <option value="1.00">1.00 D</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="chk-cyl"
                      checked={batchForm.includeCyl}
                      onChange={e => setBatchForm({ ...batchForm, includeCyl: e.target.checked })}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                    <label htmlFor="chk-cyl" className="font-bold text-slate-800 cursor-pointer">
                      Include Cylindrical / Toric Power Variants
                    </label>
                  </div>

                  {batchForm.includeCyl && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">CYL Min</label>
                        <input
                          type="number"
                          step="0.25"
                          value={batchForm.cylMin}
                          onChange={e => setBatchForm({ ...batchForm, cylMin: Number(e.target.value) })}
                          className="w-full p-2 border rounded-lg font-mono font-bold text-indigo-900"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">CYL Max</label>
                        <input
                          type="number"
                          step="0.25"
                          value={batchForm.cylMax}
                          onChange={e => setBatchForm({ ...batchForm, cylMax: Number(e.target.value) })}
                          className="w-full p-2 border rounded-lg font-mono font-bold text-indigo-900"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">CYL Step</label>
                        <select
                          value={batchForm.cylStep}
                          onChange={e => setBatchForm({ ...batchForm, cylStep: Number(e.target.value) })}
                          className="w-full p-2 border rounded-lg font-mono"
                        >
                          <option value="0.25">0.25 D</option>
                          <option value="0.50">0.50 D</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rates & Initial Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Purchase Rate (₹)</label>
                  <input
                    type="number"
                    value={batchForm.purchaseRate}
                    onChange={e => setBatchForm({ ...batchForm, purchaseRate: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Wholesale Rate (₹)</label>
                  <input
                    type="number"
                    value={batchForm.wholesaleRate}
                    onChange={e => setBatchForm({ ...batchForm, wholesaleRate: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg font-bold text-indigo-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Retail Rate (₹)</label>
                  <input
                    type="number"
                    value={batchForm.retailRate}
                    onChange={e => setBatchForm({ ...batchForm, retailRate: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial Stock per SKU</label>
                  <input
                    type="number"
                    value={batchForm.initialStockPerSku}
                    onChange={e => setBatchForm({ ...batchForm, initialStockPerSku: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg font-black"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Generate & Save All Variants
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PURCHASE / STOCK-IN */}
      {showStockInModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                Log Lens Purchase & Stock-IN Receipt
              </h3>
              <button onClick={() => setShowStockInModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleStockInSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Exact Power SKU</label>
                <select
                  value={stockInForm.lensCode}
                  onChange={e => {
                    const match = lenses.find(l => l.lensCode === e.target.value);
                    if (match) {
                      setStockInForm({
                        ...stockInForm,
                        lensCode: match.lensCode,
                        productName: match.productName || match.brand,
                        company: match.company,
                        brand: match.brand,
                        category: match.category,
                        lensType: match.lensType || 'BLUE CUT GREEN',
                        sph: match.sph || '+0.25',
                        cyl: match.cyl || '+0.25',
                        axis: match.axis || '180',
                        add: match.add || '—',
                        purchaseRate: match.purchaseRate,
                        rack: match.rackLocation || 'Rack A - Shelf 01'
                      });
                    }
                  }}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                >
                  {lenses.map(l => (
                    <option key={l.lensCode} value={l.lensCode}>
                      {l.lensCode} — {l.productName || l.brand} (SPH: {l.sph || '0.00'}, CYL: {l.cyl || '0.00'}) [Current: {l.currentStock} pairs]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Supplier / Importer *</label>
                  <select
                    value={stockInForm.supplier}
                    onChange={e => setStockInForm({ ...stockInForm, supplier: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                  >
                    {suppliers.map(s => (
                      <option key={s.supplierId} value={s.company}>{s.company}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Supplier Invoice No *</label>
                  <input
                    type="text"
                    required
                    value={stockInForm.invoiceNumber}
                    onChange={e => setStockInForm({ ...stockInForm, invoiceNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Quantity (Pairs) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stockInForm.quantity}
                    onChange={e => setStockInForm({ ...stockInForm, quantity: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Purchase Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    value={stockInForm.purchaseRate}
                    onChange={e => setStockInForm({ ...stockInForm, purchaseRate: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Storage Rack</label>
                  <input
                    type="text"
                    value={stockInForm.rack}
                    onChange={e => setStockInForm({ ...stockInForm, rack: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-900">Total Purchase Invoice Amount:</span>
                <span className="font-black text-base text-emerald-900 font-mono">
                  ₹{(stockInForm.quantity * stockInForm.purchaseRate).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowStockInModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Confirm Stock IN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: STOCK ADJUSTMENT / AUDIT */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-teal-600" /> Physical Stock Audit / Correction
              </h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Lens Power SKU</label>
                <select
                  value={selectedLensCodeForAdjust}
                  onChange={e => setSelectedLensCodeForAdjust(e.target.value)}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                >
                  <option value="">-- Choose Power SKU --</option>
                  {lenses.map(l => (
                    <option key={l.lensCode} value={l.lensCode}>
                      {l.lensCode} (SPH: {l.sph || '0.00'}, CYL: {l.cyl || '0.00'}) — Stock: {l.currentStock} pairs
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Adjustment Reason Type</label>
                <select
                  value={adjustType}
                  onChange={e => setAdjustType(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="Physical Audit">Physical Audit Correction</option>
                  <option value="Damage / Breakage">Damage / Breakage</option>
                  <option value="Lab Fitting Wastage">Lab Fitting Wastage</option>
                  <option value="Received Excess">Received Excess Stock</option>
                  <option value="Manual Correction">Manual Correction</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Adjustment Quantity (+ to add, - to deduct)</label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={e => setAdjustQty(Number(e.target.value))}
                  placeholder="e.g. -2 or +5"
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Audit Notes / Remark</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="e.g. Physical tray count reconciliation"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Confirm Audit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: LENS RETURN */}
      {showReturnModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600" /> Record Lens Return / Replacement
              </h3>
              <button onClick={() => setShowReturnModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveReturn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Lens SKU</label>
                <select
                  value={returnLensCode}
                  onChange={e => setReturnLensCode(e.target.value)}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                >
                  <option value="">-- Choose Lens --</option>
                  {lenses.map(l => (
                    <option key={l.lensCode} value={l.lensCode}>
                      {l.lensCode} (SPH: {l.sph || '0.00'}, CYL: {l.cyl || '0.00'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Returned By (Customer / Dealer Name)</label>
                <input
                  type="text"
                  required
                  value={returnParty}
                  onChange={e => setReturnParty(e.target.value)}
                  placeholder="e.g. Kakdwip Eye Opticals or Subir Mondal"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Quantity Returned (Pairs)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={returnQty}
                    onChange={e => setReturnQty(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Return Reason</label>
                  <select
                    value={returnReason}
                    onChange={e => setReturnReason(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Power Mismatch">Power Mismatch</option>
                    <option value="Coating Defect / Scratched">Coating Defect / Scratched</option>
                    <option value="Customer Prescription Changed">Customer Rx Changed</option>
                    <option value="Dealer Overstock">Dealer Overstock</option>
                    <option value="Wrong Axis">Wrong Axis</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <input
                  type="checkbox"
                  id="chk-restock"
                  checked={returnRestock}
                  onChange={e => setReturnRestock(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <label htmlFor="chk-restock" className="font-semibold text-amber-900 cursor-pointer">
                  Auto-restock returned pairs to active inventory
                </label>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Notes / Action Details</label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  placeholder="e.g. Replaced with -1.50 Blue Cut ARC"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Save Return Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
