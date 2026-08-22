import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { LensMaster } from '../types';
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
  Layers
} from 'lucide-react';

export const LensInventoryView: React.FC = () => {
  const { lenses, saveLens, deleteLens, setQuickModal, stockMovements } = useErp();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [editingLens, setEditingLens] = useState<LensMaster | null>(null);

  const categories = ['All', 'Single Vision', 'Blue Cut', 'Progressive', 'Photochromic', 'Bifocal', 'Hi-Index'];

  const filtered = lenses.filter(l => {
    const matchesSearch =
      l.lensCode.toLowerCase().includes(search.toLowerCase()) ||
      l.brand.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.coating.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = filterCategory === 'All' || l.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPairs = lenses.reduce((acc, l) => acc + l.currentStock, 0);
  const totalValuation = lenses.reduce((acc, l) => acc + l.currentStock * l.retailRate, 0);
  const lowStockCount = lenses.filter(l => l.status === 'Low Stock' || l.status === 'Out of Stock').length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Disc className="w-5 h-5 text-teal-600" />
              Lens Master & Central Stock (লেন্স ইনভেন্টরি)
            </h1>
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              Single Source of Truth
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time stock deduction on Spectacle Orders and Retail Sales. Power range, index & coating catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickModal('new-purchase')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
          >
            + Purchase Stock In
          </button>
          <button
            id="btn-add-lens-sku"
            onClick={() => {
              setEditingLens({
                lensCode: `LNS-NEW-${Date.now().toString().slice(-4)}`,
                company: 'Prime Vision',
                brand: 'New Lens Series',
                category: 'Single Vision',
                design: 'Aspheric',
                coating: 'ARC (Anti-Reflective)',
                index: '1.56',
                diameter: '70mm',
                purchaseRate: 200,
                wholesaleRate: 350,
                retailRate: 800,
                mrp: 1100,
                currentStock: 20,
                reorderLevel: 8,
                status: 'Available'
              });
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            + Add New Lens SKU
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Lens Stock</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalPairs} Pairs</p>
          <span className="text-[11px] text-teal-700 font-semibold">{lenses.length} Active Catalog SKUs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Retail Valuation</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹{totalValuation.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-500 font-semibold">Based on current stock MRP/Retail</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Stock Health</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{lowStockCount} Items</p>
          <span className="text-[11px] text-amber-700 font-semibold">Low stock or out of stock alert</span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Lens Code, Brand, Company, Coating..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filterCategory === cat
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lens Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Lens Code</th>
                <th className="py-3 px-4">Brand & Company</th>
                <th className="py-3 px-4">Category & Design</th>
                <th className="py-3 px-4">Index & Coating</th>
                <th className="py-3 px-4">Rates (Purchase / Retail / MRP)</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No lenses found.
                  </td>
                </tr>
              ) : (
                filtered.map(lens => (
                  <tr key={lens.lensCode} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Lens Code */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span className="bg-teal-50 text-teal-900 border border-teal-200 px-2 py-1 rounded text-[11px]">
                        {lens.lensCode}
                      </span>
                    </td>

                    {/* Brand & Company */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{lens.brand}</div>
                      <div className="text-[11px] text-slate-500">{lens.company}</div>
                    </td>

                    {/* Category & Design */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{lens.category}</span>
                      <span className="block text-[10px] text-slate-400 font-medium">{lens.design}</span>
                    </td>

                    {/* Index & Coating */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-teal-800">{lens.index} Index</div>
                      <div className="text-[10px] text-slate-500">{lens.coating}</div>
                    </td>

                    {/* Rates */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">Retail: ₹{lens.retailRate}</div>
                      <div className="text-[10px] text-slate-400">
                        Buy: ₹{lens.purchaseRate} • MRP: ₹{lens.mrp}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4">
                      <div className="font-black text-sm text-slate-900">
                        {lens.currentStock} pairs
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Reorder at: {lens.reorderLevel}
                      </div>
                    </td>

                    {/* Status */}
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

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => setEditingLens(lens)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Lens"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteLens(lens.lensCode)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete Lens"
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

      {/* Edit / Add Lens Modal */}
      {editingLens && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Disc className="w-5 h-5 text-teal-600" />
              {editingLens.lensCode.includes('NEW') ? 'Add New Lens SKU' : `Edit Lens: ${editingLens.lensCode}`}
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Lens Code / SKU</label>
                <input
                  type="text"
                  value={editingLens.lensCode}
                  onChange={e => setEditingLens({ ...editingLens, lensCode: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company / Manufacturer</label>
                <input
                  type="text"
                  value={editingLens.company}
                  onChange={e => setEditingLens({ ...editingLens, company: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Brand Name</label>
                <input
                  type="text"
                  value={editingLens.brand}
                  onChange={e => setEditingLens({ ...editingLens, brand: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={editingLens.category}
                  onChange={e => setEditingLens({ ...editingLens, category: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
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
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Coating</label>
                <input
                  type="text"
                  value={editingLens.coating}
                  onChange={e => setEditingLens({ ...editingLens, coating: e.target.value })}
                  placeholder="Blue Cut ARC / UV420"
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Purchase Rate (₹)</label>
                <input
                  type="number"
                  value={editingLens.purchaseRate}
                  onChange={e => setEditingLens({ ...editingLens, purchaseRate: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Retail Selling Rate (₹)</label>
                <input
                  type="number"
                  value={editingLens.retailRate}
                  onChange={e => setEditingLens({ ...editingLens, retailRate: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Stock (Pairs)</label>
                <input
                  type="number"
                  value={editingLens.currentStock}
                  onChange={e => setEditingLens({ ...editingLens, currentStock: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reorder Level</label>
                <input
                  type="number"
                  value={editingLens.reorderLevel}
                  onChange={e => setEditingLens({ ...editingLens, reorderLevel: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setEditingLens(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  saveLens(editingLens);
                  setEditingLens(null);
                }}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Save Lens
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
