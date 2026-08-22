import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { MedicineMaster } from '../types';
import {
  Pill,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Tag
} from 'lucide-react';

export const MedicinesView: React.FC = () => {
  const { medicines, saveMedicine, deleteMedicine } = useErp();
  const [search, setSearch] = useState('');
  const [filterForm, setFilterForm] = useState<string>('All');
  const [editingMed, setEditingMed] = useState<MedicineMaster | null>(null);

  const forms = ['All', 'Eye Drop', 'Eye Ointment', 'Tablet', 'Capsule', 'Gel'];

  const filtered = medicines.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.genericName.toLowerCase().includes(search.toLowerCase()) ||
      m.company.toLowerCase().includes(search.toLowerCase());

    const matchesForm = filterForm === 'All' || m.form === filterForm;
    return matchesSearch && matchesForm;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              Medicine Master & Rx Directory (ওষুধের ক্যাটালগ)
            </h1>
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              {medicines.length} Formularies
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Auto-fills default dosage, frequency, food directions, and ocular routes inside the Clinical Entry Center
          </p>
        </div>

        <button
          onClick={() => {
            setEditingMed({
              id: `MED-NEW-${Date.now().toString().slice(-4)}`,
              name: 'New Eye Formulation',
              genericName: 'Active Ingredient',
              company: 'Pharma Healthcare',
              form: 'Eye Drop',
              strength: '0.1%',
              defaultDose: '1 drop',
              frequency: '3 times daily',
              defaultDuration: '15 days',
              foodInstruction: 'As directed',
              route: 'Ophthalmic (Both Eyes)',
              purchaseRate: 85,
              mrp: 140,
              currentStock: 30,
              notes: 'Instill into lower conjunctival sac.'
            });
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + Add New Medicine
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Medicine Brand, Generic Name, Company..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {forms.map(f => (
            <button
              key={f}
              onClick={() => setFilterForm(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filterForm === f
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Medicine Name</th>
                <th className="py-3 px-4">Generic & Company</th>
                <th className="py-3 px-4">Form & Strength</th>
                <th className="py-3 px-4">Default Rx (Dose / Freq / Dur)</th>
                <th className="py-3 px-4">Route & Food</th>
                <th className="py-3 px-4">Stock & MRP</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(med => (
                <tr key={med.id} className="hover:bg-teal-50/30 transition-colors">
                  
                  {/* Name */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                    {med.name}
                  </td>

                  {/* Generic */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{med.genericName}</div>
                    <div className="text-[10px] text-slate-400">{med.company}</div>
                  </td>

                  {/* Form & Strength */}
                  <td className="py-3.5 px-4">
                    <span className="bg-teal-50 text-teal-900 border border-teal-200 px-2 py-0.5 rounded text-[11px] font-bold">
                      {med.form}
                    </span>
                    <span className="block text-[11px] font-semibold text-slate-700 mt-1">
                      {med.strength}
                    </span>
                  </td>

                  {/* Default Rx */}
                  <td className="py-3.5 px-4 text-slate-800">
                    <div className="font-bold">{med.defaultDose} • {med.frequency}</div>
                    <span className="text-[10px] text-slate-500">Duration: {med.defaultDuration}</span>
                  </td>

                  {/* Route & Food */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="font-semibold text-slate-800">{med.route}</div>
                    <span className="text-[10px] text-slate-400">{med.foodInstruction}</span>
                  </td>

                  {/* Stock & MRP */}
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900">MRP: ₹{med.mrp}</div>
                    <span className="text-[10px] text-teal-700 font-semibold">
                      Stock: {med.currentStock} units
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button
                      onClick={() => setEditingMed(med)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit Medicine"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMedicine(med.id)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                      title="Delete Medicine"
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
      {editingMed && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              {editingMed.id.includes('NEW') ? 'Add Medicine to Formulary' : `Edit: ${editingMed.name}`}
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Brand Name</label>
                <input
                  type="text"
                  value={editingMed.name}
                  onChange={e => setEditingMed({ ...editingMed, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Generic Composition</label>
                <input
                  type="text"
                  value={editingMed.genericName}
                  onChange={e => setEditingMed({ ...editingMed, genericName: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dosage Form</label>
                <select
                  value={editingMed.form}
                  onChange={e => setEditingMed({ ...editingMed, form: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                >
                  <option value="Eye Drop">Eye Drop</option>
                  <option value="Eye Ointment">Eye Ointment</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Gel">Gel</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Strength</label>
                <input
                  type="text"
                  value={editingMed.strength}
                  onChange={e => setEditingMed({ ...editingMed, strength: e.target.value })}
                  placeholder="0.5% / 500mg"
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Default Dose</label>
                <input
                  type="text"
                  value={editingMed.defaultDose}
                  onChange={e => setEditingMed({ ...editingMed, defaultDose: e.target.value })}
                  placeholder="1 drop"
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Frequency</label>
                <input
                  type="text"
                  value={editingMed.frequency}
                  onChange={e => setEditingMed({ ...editingMed, frequency: e.target.value })}
                  placeholder="3 times daily"
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Default Duration</label>
                <input
                  type="text"
                  value={editingMed.defaultDuration}
                  onChange={e => setEditingMed({ ...editingMed, defaultDuration: e.target.value })}
                  placeholder="15 days"
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Route</label>
                <input
                  type="text"
                  value={editingMed.route}
                  onChange={e => setEditingMed({ ...editingMed, route: e.target.value })}
                  placeholder="Ophthalmic (Both Eyes)"
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">MRP (₹)</label>
                <input
                  type="number"
                  value={editingMed.mrp}
                  onChange={e => setEditingMed({ ...editingMed, mrp: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Stock</label>
                <input
                  type="number"
                  value={editingMed.currentStock}
                  onChange={e => setEditingMed({ ...editingMed, currentStock: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setEditingMed(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  saveMedicine(editingMed);
                  setEditingMed(null);
                }}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Save Formulary
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
