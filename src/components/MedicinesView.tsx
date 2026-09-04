import React, { useState, useMemo } from 'react';
import { useErp } from '../context/ErpContext';
import { MedicineMaster, MedicineCategory } from '../types';
import {
  MEDICINE_CATEGORIES,
  MEDICINE_FORMS,
  MEDICINE_ROUTES,
  COMMON_FREQUENCIES,
  COMMON_DURATIONS
} from '../data/clinicalMasterData';
import {
  Pill,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Building2,
  Tag,
  Clock,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  Package,
  Layers
} from 'lucide-react';

export const MedicinesView: React.FC = () => {
  const { medicines, saveMedicine, deleteMedicine, showToast } = useErp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedForm, setSelectedForm] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Active' | 'Inactive' | 'Favorites'>('All');
  const [editingMed, setEditingMed] = useState<MedicineMaster | null>(null);
  const [deleteConfirmMed, setDeleteConfirmMed] = useState<MedicineMaster | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = medicines.length;
    const active = medicines.filter(m => m.active !== false).length;
    const favorites = medicines.filter(m => m.isFavorite || m.quickAccess).length;
    const lowStock = medicines.filter(m => (m.stockQuantity ?? m.currentStock ?? 0) <= (m.reorderLevel ?? 5)).length;
    return { total, active, favorites, lowStock };
  }, [medicines]);

  // Unique Companies for quick filter
  const companies = useMemo(() => {
    const set = new Set<string>();
    medicines.forEach(m => {
      if (m.company && m.company.trim()) set.add(m.company.trim());
    });
    return Array.from(set).sort();
  }, [medicines]);

  const [selectedCompany, setSelectedCompany] = useState<string>('All');

  // Filtered medicines
  const filtered = useMemo(() => {
    return (medicines || []).filter(m => {
      const q = (search || '').trim().toLowerCase();
      const name = (m.name || '').toLowerCase();
      const gen = (m.genericName || '').toLowerCase();
      const comp = (m.company || '').toLowerCase();
      const cat = (m.category || '').toLowerCase();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        gen.includes(q) ||
        comp.includes(q) ||
        cat.includes(q);

      const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
      const matchesForm = selectedForm === 'All' || m.form === selectedForm;
      const matchesComp = selectedCompany === 'All' || m.company === selectedCompany;

      let matchesStatus = true;
      if (selectedStatus === 'Active') matchesStatus = m.active !== false;
      if (selectedStatus === 'Inactive') matchesStatus = m.active === false;
      if (selectedStatus === 'Favorites') matchesStatus = !!(m.isFavorite || m.quickAccess);

      return matchesSearch && matchesCat && matchesForm && matchesComp && matchesStatus;
    });
  }, [medicines, search, selectedCategory, selectedForm, selectedCompany, selectedStatus]);

  // Toggle Favorite
  const handleToggleFavorite = (med: MedicineMaster, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: MedicineMaster = {
      ...med,
      isFavorite: !(med.isFavorite || med.quickAccess),
      quickAccess: !(med.isFavorite || med.quickAccess)
    };
    saveMedicine(updated);
    showToast(
      updated.isFavorite
        ? `⭐ ${med.name} added to Clinical Quick-Access!`
        : `Removed ${med.name} from Quick-Access.`,
      'info'
    );
  };

  // Toggle Active Status
  const handleToggleActive = (med: MedicineMaster, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextActive = med.active === false;
    const updated: MedicineMaster = {
      ...med,
      active: nextActive
    };
    saveMedicine(updated);
    showToast(
      nextActive
        ? `✅ ${med.name} activated for clinical prescriptions.`
        : `⏸️ ${med.name} set to inactive.`,
      nextActive ? 'success' : 'warning'
    );
  };

  // Open New Medicine Modal
  const handleAddNew = () => {
    setEditingMed({
      id: `MED-${Date.now().toString().slice(-6)}`,
      name: '',
      genericName: '',
      category: 'Lubricant / Artificial Tear',
      strength: '0.5%',
      form: 'Eye Drop',
      company: '',
      bottleSize: '10 ml',
      packSize: '10 ml',
      stockQuantity: 20,
      currentStock: 20,
      purchasePrice: 0,
      purchaseRate: 0,
      sellingPrice: 0,
      mrp: 0,
      reorderLevel: 5,
      active: true,
      isFavorite: false,
      quickAccess: false,
      defaultEye: 'OU',
      defaultDose: '1 drop',
      frequency: '3 times daily',
      defaultDuration: '14 days',
      foodInstruction: 'As directed',
      defaultInstruction: 'Instill into eye(s) with clean hands.',
      route: 'Ophthalmic (Both Eyes)',
      notes: ''
    });
  };

  // Save Modal Form
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMed) return;

    if (!editingMed.name.trim()) {
      showToast('Brand Name is required!', 'error');
      return;
    }

    const payload: MedicineMaster = {
      ...editingMed,
      name: editingMed.name.trim(),
      genericName: (editingMed.genericName || '').trim(),
      company: (editingMed.company || '').trim(),
      currentStock: Number(editingMed.stockQuantity ?? editingMed.currentStock ?? 0),
      stockQuantity: Number(editingMed.stockQuantity ?? editingMed.currentStock ?? 0),
      purchaseRate: Number(editingMed.purchasePrice ?? editingMed.purchaseRate ?? 0),
      purchasePrice: Number(editingMed.purchasePrice ?? editingMed.purchaseRate ?? 0),
      mrp: Number(editingMed.sellingPrice ?? editingMed.mrp ?? 0),
      sellingPrice: Number(editingMed.sellingPrice ?? editingMed.mrp ?? 0),
      reorderLevel: Number(editingMed.reorderLevel ?? 5),
      active: editingMed.active !== false
    };

    saveMedicine(payload);
    setEditingMed(null);
    showToast(`Medicine "${payload.name}" saved to master!`, 'success');
  };

  // Confirm Delete
  const handleDeleteConfirm = () => {
    if (!deleteConfirmMed) return;
    deleteMedicine(deleteConfirmMed.id);
    setDeleteConfirmMed(null);
    showToast(`Medicine removed from master. Past patient prescriptions remain intact.`, 'info');
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header & KPI Summary */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-xs">
                <Pill className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  Ophthalmic Medicine Master & Formulary
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    ওষুধের ডাটাবেস
                  </span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Add, edit, organize eye drops, gels, ointments & tablets. Medicines saved here auto-populate in the Clinical Entry Center.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-add-medicine-master"
              onClick={handleAddNew}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              + Add New Medicine (নতুন ওষুধ যোগ)
            </button>
          </div>
        </div>

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Brands</span>
            <div className="text-lg font-black text-slate-900 mt-0.5 flex items-baseline gap-1.5">
              {stats.total}
              <span className="text-[10px] font-normal text-slate-500">formulations</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Active in Rx</span>
            <div className="text-lg font-black text-emerald-900 mt-0.5">
              {stats.active}
            </div>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              Quick Access
            </span>
            <div className="text-lg font-black text-amber-900 mt-0.5">
              {stats.favorites}
            </div>
          </div>
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">Low Stock Alert</span>
            <div className="text-lg font-black text-rose-900 mt-0.5">
              {stats.lowStock}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-medicine"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Brand Name, Generic Composition, Manufacturer Company..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Segmented Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start lg:self-auto overflow-x-auto max-w-full">
            {(['All', 'Favorites', 'Active', 'Inactive'] as const).map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedStatus === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'Favorites' && <Star className="w-3 h-3 fill-amber-500 text-amber-500" />}
                {st === 'All' ? 'All Medicines' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters (Category, Form, Company) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="font-bold text-slate-600 text-[11px] block mb-1">Medicine Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-1 focus:ring-teal-500 focus:bg-white"
            >
              <option value="All">All Categories ({medicines.length})</option>
              {MEDICINE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-600 text-[11px] block mb-1">Dosage Form</label>
            <select
              value={selectedForm}
              onChange={e => setSelectedForm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-1 focus:ring-teal-500 focus:bg-white"
            >
              <option value="All">All Forms</option>
              {MEDICINE_FORMS.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-600 text-[11px] block mb-1">Company / Manufacturer</label>
            <select
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-1 focus:ring-teal-500 focus:bg-white"
            >
              <option value="All">All Companies ({companies.length})</option>
              {companies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Master Medicines List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Formulary Registry
            </span>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {filtered.length} of {medicines.length} found
            </span>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> = Favorite (Quick Chip)
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> = Active in Clinical Rx
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Pill className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No medicines match your filter criteria.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, clearing the category filter, or click the button below to add a new brand.
            </p>
            <button
              onClick={handleAddNew}
              className="mt-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + Add Medicine Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">Fav</th>
                  <th className="py-3 px-4">Brand & Generic Name</th>
                  <th className="py-3 px-4">Category & Form</th>
                  <th className="py-3 px-4">Company & Pack Size</th>
                  <th className="py-3 px-4">Default Clinical Rx Prescription</th>
                  <th className="py-3 px-3">Stock & MRP</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(med => {
                  const isFav = med.isFavorite || med.quickAccess;
                  const isActive = med.active !== false;
                  const stock = med.stockQuantity ?? med.currentStock ?? 0;
                  const reorder = med.reorderLevel ?? 5;
                  const isLowStock = stock <= reorder;

                  return (
                    <tr
                      key={med.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !isActive ? 'opacity-60 bg-slate-50/50' : ''
                      }`}
                    >
                      {/* Favorite Toggle Star */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={e => handleToggleFavorite(med, e)}
                          title={isFav ? 'Remove from Quick Access' : 'Add to Quick Access in Clinical Entry Center'}
                          className="p-1 rounded-lg hover:bg-amber-50 text-slate-300 hover:text-amber-500 transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 transition-all ${
                              isFav ? 'fill-amber-400 text-amber-500 scale-110' : 'text-slate-300 hover:text-amber-400'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Brand Name & Generic */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 text-sm">{med.name}</span>
                          {med.strength && (
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                              {med.strength}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-medium text-slate-600 mt-0.5 flex items-center gap-1">
                          <span className="text-slate-400">Gen:</span> {med.genericName || '—'}
                        </div>
                      </td>

                      {/* Category & Form */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {med.category || 'Other'}
                        </span>
                        <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {med.form}
                        </div>
                      </td>

                      {/* Company & Pack Size */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {med.company || '—'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Pack: {med.bottleSize || med.packSize || 'Standard'}
                        </div>
                      </td>

                      {/* Default Prescription Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">
                          <span className="text-indigo-700 font-extrabold mr-1">
                            [{med.defaultEye || 'OU'}]:
                          </span>
                          {med.defaultDose || '1 drop'} • {med.frequency || '3 times daily'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Dur: {med.defaultDuration || '14 days'}</span>
                          {med.defaultInstruction && (
                            <span className="truncate max-w-xs text-slate-400 italic">
                              • {med.defaultInstruction}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock & MRP */}
                      <td className="py-3.5 px-3">
                        <div className="font-black text-slate-900">
                          ₹{med.sellingPrice ?? med.mrp ?? 0}
                        </div>
                        <div className="text-[10px] font-semibold mt-0.5">
                          <span
                            className={
                              isLowStock
                                ? 'text-rose-600 font-bold bg-rose-50 px-1 py-0.2 rounded'
                                : 'text-slate-600'
                            }
                          >
                            Stock: {stock} units
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={e => handleToggleActive(med, e)}
                          title={isActive ? 'Click to deactivate' : 'Click to activate'}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`btn-edit-med-${med.id}`}
                            onClick={() => setEditingMed({ ...med })}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 transition-all"
                            title="Edit Medicine Formulation"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-del-med-${med.id}`}
                            onClick={() => setDeleteConfirmMed(med)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-all"
                            title="Delete Medicine from Formulary"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* ADD / EDIT MEDICINE FORM MODAL */}
      {editingMed && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-700 to-teal-800 p-4 sm:p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <Pill className="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold">
                    {editingMed.id.includes('NEW') || !medicines.some(m => m.id === editingMed.id)
                      ? 'Add New Ophthalmic Medicine'
                      : `Edit Medicine: ${editingMed.name}`}
                  </h2>
                  <p className="text-[11px] text-teal-100">
                    Define formulation specs, category, company, and default clinical dosage
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingMed(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              
              {/* Basic Brand & Generic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-med-brand-name"
                    type="text"
                    required
                    value={editingMed.name}
                    onChange={e => setEditingMed({ ...editingMed, name: e.target.value })}
                    placeholder="e.g. Refresh Tears / Vigamox / Pataday"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Generic Composition / Active Ingredient
                  </label>
                  <input
                    type="text"
                    value={editingMed.genericName}
                    onChange={e => setEditingMed({ ...editingMed, genericName: e.target.value })}
                    placeholder="e.g. Carboxymethylcellulose / Moxifloxacin HCl"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category, Form & Strength */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Medicine Category</label>
                  <select
                    value={editingMed.category || 'Lubricant / Artificial Tear'}
                    onChange={e => setEditingMed({ ...editingMed, category: e.target.value as MedicineCategory })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {MEDICINE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dosage Form</label>
                  <select
                    value={editingMed.form}
                    onChange={e => setEditingMed({ ...editingMed, form: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {MEDICINE_FORMS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Strength / Concentration</label>
                  <input
                    type="text"
                    value={editingMed.strength}
                    onChange={e => setEditingMed({ ...editingMed, strength: e.target.value })}
                    placeholder="e.g. 0.5% w/v, 0.1%, 5mg/ml"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Company & Pack Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Manufacturer / Company</label>
                  <input
                    type="text"
                    value={editingMed.company}
                    onChange={e => setEditingMed({ ...editingMed, company: e.target.value })}
                    placeholder="e.g. Alcon, Allergan, Sun Pharma, Cipla"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bottle / Pack Size</label>
                  <input
                    type="text"
                    value={editingMed.bottleSize || editingMed.packSize || ''}
                    onChange={e =>
                      setEditingMed({
                        ...editingMed,
                        bottleSize: e.target.value,
                        packSize: e.target.value
                      })
                    }
                    placeholder="e.g. 5 ml, 10 ml, 10g Tube, 30 Tablets"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Commercials & Inventory (Stock, Prices) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-teal-600" />
                  Inventory & Pricing Commercials
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-600 text-[11px] block mb-1">Current Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={editingMed.stockQuantity ?? editingMed.currentStock ?? 0}
                      onChange={e =>
                        setEditingMed({
                          ...editingMed,
                          stockQuantity: Number(e.target.value),
                          currentStock: Number(e.target.value)
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 text-[11px] block mb-1">Reorder Alert Level</label>
                    <input
                      type="number"
                      min="1"
                      value={editingMed.reorderLevel ?? 5}
                      onChange={e =>
                        setEditingMed({
                          ...editingMed,
                          reorderLevel: Number(e.target.value)
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 text-[11px] block mb-1">Purchase Cost (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editingMed.purchasePrice ?? editingMed.purchaseRate ?? 0}
                      onChange={e =>
                        setEditingMed({
                          ...editingMed,
                          purchasePrice: Number(e.target.value),
                          purchaseRate: Number(e.target.value)
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 text-[11px] block mb-1">Selling Rate / MRP (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editingMed.sellingPrice ?? editingMed.mrp ?? 0}
                      onChange={e =>
                        setEditingMed({
                          ...editingMed,
                          sellingPrice: Number(e.target.value),
                          mrp: Number(e.target.value)
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-black text-slate-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Default Prescribing Presets (Auto-fills in Clinical Entry Center) */}
              <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-200/70 space-y-2.5">
                <div className="text-[11px] font-extrabold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Clinical Prescription Default Presets (স্বয়ংক্রিয় প্রেসক্রিপশন সেটিংস)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="font-bold text-teal-900 text-[11px] block mb-1">Default Eye / Route</label>
                    <select
                      value={editingMed.defaultEye || 'OU'}
                      onChange={e => setEditingMed({ ...editingMed, defaultEye: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-teal-300 rounded-lg font-bold text-slate-800 bg-white"
                    >
                      {MEDICINE_ROUTES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-teal-900 text-[11px] block mb-1">Default Dose</label>
                    <input
                      type="text"
                      value={editingMed.defaultDose || ''}
                      onChange={e => setEditingMed({ ...editingMed, defaultDose: e.target.value })}
                      placeholder="1 drop / 1 tablet"
                      className="w-full px-2.5 py-1.5 border border-teal-300 rounded-lg font-semibold text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-teal-900 text-[11px] block mb-1">Frequency</label>
                    <input
                      type="text"
                      value={editingMed.frequency || ''}
                      onChange={e => setEditingMed({ ...editingMed, frequency: e.target.value })}
                      placeholder="3 times daily / Once at night"
                      className="w-full px-2.5 py-1.5 border border-teal-300 rounded-lg font-semibold text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-teal-900 text-[11px] block mb-1">Duration</label>
                    <input
                      type="text"
                      value={editingMed.defaultDuration || ''}
                      onChange={e => setEditingMed({ ...editingMed, defaultDuration: e.target.value })}
                      placeholder="14 days / 30 days"
                      className="w-full px-2.5 py-1.5 border border-teal-300 rounded-lg font-semibold text-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-teal-900 text-[11px] block mb-1">Clinical Instructions & Directions</label>
                  <input
                    type="text"
                    value={editingMed.defaultInstruction || editingMed.foodInstruction || ''}
                    onChange={e =>
                      setEditingMed({
                        ...editingMed,
                        defaultInstruction: e.target.value,
                        foodInstruction: e.target.value
                      })
                    }
                    placeholder="e.g. Instill into eye(s) with clean hands. Maintain 5 min gap between other drops."
                    className="w-full px-2.5 py-1.5 border border-teal-300 rounded-lg text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* Status & Favorite Checkboxes */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingMed.isFavorite || editingMed.quickAccess || false}
                    onChange={e =>
                      setEditingMed({
                        ...editingMed,
                        isFavorite: e.target.checked,
                        quickAccess: e.target.checked
                      })
                    }
                    className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
                  />
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    Mark as Favourite / Quick Access (দ্রুত প্রেসক্রিপশন চিপ)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingMed.active !== false}
                    onChange={e => setEditingMed({ ...editingMed, active: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Active Formulary (Available in Rx)
                  </span>
                </label>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical / Inventory Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={editingMed.notes || ''}
                  onChange={e => setEditingMed({ ...editingMed, notes: e.target.value })}
                  placeholder="Special instructions, shelf storage, supplier source, etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingMed(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-medicine-modal"
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Medicine Formulation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmMed && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Remove Medicine?</h3>
                <p className="text-xs text-slate-500">
                  {deleteConfirmMed.name} ({deleteConfirmMed.genericName})
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Historical Data Preservation:
              </p>
              <p>
                Deleting this medicine from the master directory will only stop it from appearing in future new prescriptions. <strong>All past patient visits and historical prescriptions will remain 100% intact.</strong>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmMed(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-med"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
