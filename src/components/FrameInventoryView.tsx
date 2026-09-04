import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { FrameMaster } from '../types';
import {
  Frame,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  Tag,
  Glasses
} from 'lucide-react';

export const FrameInventoryView: React.FC = () => {
  const { frames, saveFrame, deleteFrame, setQuickModal } = useErp();
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('All');
  const [editingFrame, setEditingFrame] = useState<FrameMaster | null>(null);

  const brands = ['All', ...Array.from(new Set((frames || []).map(f => f.brand || 'Unbranded')))];

  const filtered = (frames || []).filter(f => {
    const q = (search || '').trim().toLowerCase();
    const sku = (f.sku || '').toLowerCase();
    const br = (f.brand || '').toLowerCase();
    const mdl = (f.model || '').toLowerCase();
    const clr = (f.colour || '').toLowerCase();
    const mat = (f.material || '').toLowerCase();

    const matchesSearch =
      !q ||
      sku.includes(q) ||
      br.includes(q) ||
      mdl.includes(q) ||
      clr.includes(q) ||
      mat.includes(q);

    const matchesBrand = filterBrand === 'All' || f.brand === filterBrand;
    return matchesSearch && matchesBrand;
  });

  const totalFrames = (frames || []).reduce((acc, f) => acc + (f.currentStock || 0), 0);
  const totalValuation = (frames || []).reduce((acc, f) => acc + (f.currentStock || 0) * (f.retailRate || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Frame className="w-5 h-5 text-amber-600" />
              Frame Master & Inventory (ফ্রেম ক্যাটালগ ও স্টক)
            </h1>
            <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
              {frames.length} Models
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage frame stock across Titanium, Acetate, TR90, Rimless, and Metal designer brands
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickModal('new-purchase')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
          >
            + Purchase Stock
          </button>
          <button
            id="btn-add-frame-sku"
            onClick={() => {
              setEditingFrame({
                sku: `FRM-${Date.now().toString().slice(-4)}`,
                brand: 'New Brand',
                model: 'Model Series 2026',
                colour: 'Black Matte',
                material: 'TR90',
                shape: 'Rectangle',
                gender: 'Unisex',
                size: '52-18-140',
                purchaseRate: 400,
                wholesaleRate: 650,
                retailRate: 1200,
                mrp: 1599,
                currentStock: 12,
                reorderLevel: 5,
                status: 'Available'
              });
            }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            + Add New Frame SKU
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Frames in Stock</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalFrames} Units</p>
          <span className="text-[11px] text-teal-700 font-semibold">{frames.length} Frame SKUs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Stock Valuation (Retail)</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹{totalValuation.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-500 font-semibold">Total Retail Worth</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Low Stock Alerts</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {frames.filter(f => f.status === 'Low Stock' || f.status === 'Out of Stock').length} Items
          </p>
          <span className="text-[11px] text-amber-700 font-semibold">Immediate reorder suggested</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Frame SKU, Brand, Model, Color..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {brands.map(b => (
            <button
              key={b}
              onClick={() => setFilterBrand(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filterBrand === b
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Frame Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Frame SKU</th>
                <th className="py-3 px-4">Brand & Model</th>
                <th className="py-3 px-4">Colour & Material</th>
                <th className="py-3 px-4">Shape & Size</th>
                <th className="py-3 px-4">Rates (Buy / Retail / MRP)</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(frame => (
                <tr key={frame.sku} className="hover:bg-slate-50 transition-colors">
                  
                  {/* SKU */}
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded text-[11px]">
                      {frame.sku}
                    </span>
                  </td>

                  {/* Brand & Model */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-sm">{frame.brand}</div>
                    <div className="text-[11px] text-slate-500">{frame.model}</div>
                  </td>

                  {/* Colour & Material */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{frame.colour}</span>
                    <span className="block text-[10px] text-slate-400 font-medium">{frame.material}</span>
                  </td>

                  {/* Shape & Size */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800">{frame.shape}</span>
                    <span className="block text-[10px] text-slate-500">{frame.size} • {frame.gender}</span>
                  </td>

                  {/* Rates */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">Retail: ₹{frame.retailRate}</div>
                    <div className="text-[10px] text-slate-400">
                      Buy: ₹{frame.purchaseRate} • MRP: ₹{frame.mrp}
                    </div>
                  </td>

                  {/* Current Stock */}
                  <td className="py-3 px-4">
                    <div className="font-black text-sm text-slate-900">{frame.currentStock} units</div>
                    <div className="text-[10px] text-slate-400">Reorder at: {frame.reorderLevel}</div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        frame.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : frame.status === 'Low Stock'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {frame.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => setEditingFrame(frame)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit Frame"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteFrame(frame.sku)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete Frame"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {editingFrame && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Frame className="w-5 h-5 text-amber-600" />
              {editingFrame.sku.includes('FRM-') && !frames.find(f => f.sku === editingFrame.sku)
                ? 'Add New Frame'
                : `Edit Frame SKU: ${editingFrame.sku}`}
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Frame SKU</label>
                <input
                  type="text"
                  value={editingFrame.sku}
                  onChange={e => setEditingFrame({ ...editingFrame, sku: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Brand Name</label>
                <input
                  type="text"
                  value={editingFrame.brand}
                  onChange={e => setEditingFrame({ ...editingFrame, brand: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Model Name / Number</label>
                <input
                  type="text"
                  value={editingFrame.model}
                  onChange={e => setEditingFrame({ ...editingFrame, model: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Colour</label>
                <input
                  type="text"
                  value={editingFrame.colour}
                  onChange={e => setEditingFrame({ ...editingFrame, colour: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Material</label>
                <select
                  value={editingFrame.material}
                  onChange={e => setEditingFrame({ ...editingFrame, material: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                >
                  <option value="Acetate">Acetate</option>
                  <option value="Metal">Metal</option>
                  <option value="Titanium">Titanium</option>
                  <option value="TR90">TR90</option>
                  <option value="Rimless">Rimless</option>
                  <option value="Half-Rim">Half-Rim</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Shape</label>
                <select
                  value={editingFrame.shape}
                  onChange={e => setEditingFrame({ ...editingFrame, shape: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                >
                  <option value="Rectangle">Rectangle</option>
                  <option value="Round">Round</option>
                  <option value="Cat Eye">Cat Eye</option>
                  <option value="Aviator">Aviator</option>
                  <option value="Square">Square</option>
                  <option value="Geometric">Geometric</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Purchase Rate (₹)</label>
                <input
                  type="number"
                  value={editingFrame.purchaseRate}
                  onChange={e => setEditingFrame({ ...editingFrame, purchaseRate: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Retail Rate (₹)</label>
                <input
                  type="number"
                  value={editingFrame.retailRate}
                  onChange={e => setEditingFrame({ ...editingFrame, retailRate: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Stock</label>
                <input
                  type="number"
                  value={editingFrame.currentStock}
                  onChange={e => setEditingFrame({ ...editingFrame, currentStock: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reorder Level</label>
                <input
                  type="number"
                  value={editingFrame.reorderLevel}
                  onChange={e => setEditingFrame({ ...editingFrame, reorderLevel: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setEditingFrame(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  saveFrame(editingFrame);
                  setEditingFrame(null);
                }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold shadow-xs"
              >
                Save Frame
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
