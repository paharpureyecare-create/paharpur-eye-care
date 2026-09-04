import React, { useState, useMemo } from 'react';
import { useErp } from '../context/ErpContext';
import { MasterRecord, MasterCategoryKey } from '../types';
import { MASTER_CATEGORIES_CONFIG, MasterCategoryDefinition } from '../data/masterSeedData';
import {
  Disc,
  Tag,
  Building2,
  Layers,
  Sparkles,
  Glasses,
  Box,
  Truck,
  Pill,
  Stethoscope,
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Power,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Check,
  X,
  Info,
  SlidersHorizontal,
  RefreshCw,
  Clock,
  User,
  Database
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Disc,
  Tag,
  Building2,
  Layers,
  Sparkles,
  Glasses,
  Box,
  Truck,
  Pill,
  Stethoscope,
  CreditCard
};

export const MasterManagementView: React.FC = () => {
  const {
    role,
    masters,
    saveMasterItem,
    deleteMasterItem,
    toggleMasterItemStatus,
    showToast
  } = useErp();

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<MasterCategoryKey>('lens-type');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MasterRecord | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formIsDefault, setFormIsDefault] = useState(false);

  // Delete confirmation modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isAdmin = role === 'Admin';

  const currentCategoryConfig: MasterCategoryDefinition = useMemo(() => {
    return (
      MASTER_CATEGORIES_CONFIG.find(c => c.key === selectedCategoryKey) ||
      MASTER_CATEGORIES_CONFIG[0]
    );
  }, [selectedCategoryKey]);

  // Current category records
  const categoryRecords = useMemo(() => {
    return masters.filter(m => m.categoryKey === selectedCategoryKey);
  }, [masters, selectedCategoryKey]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return categoryRecords.filter(item => {
      const matchSearch =
        searchTerm.trim() === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.subCategory && item.subCategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.active) ||
        (statusFilter === 'inactive' && !item.active);

      return matchSearch && matchStatus;
    });
  }, [categoryRecords, searchTerm, statusFilter]);

  // Stats for current category
  const totalCount = categoryRecords.length;
  const activeCount = categoryRecords.filter(r => r.active).length;
  const inactiveCount = categoryRecords.filter(r => !r.active).length;

  const handleOpenAdd = () => {
    if (!isAdmin) {
      showToast('Master modifications require Admin role permissions', 'warning');
      return;
    }
    setEditingRecord(null);
    setFormName('');
    setFormCode('');
    setFormSubCategory('');
    setFormDescription('');
    setFormActive(true);
    setFormIsDefault(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: MasterRecord) => {
    if (!isAdmin) {
      showToast('Master modifications require Admin role permissions', 'warning');
      return;
    }
    setEditingRecord(record);
    setFormName(record.name);
    setFormCode(record.code || '');
    setFormSubCategory(record.subCategory || '');
    setFormDescription(record.description || '');
    setFormActive(record.active);
    setFormIsDefault(record.isDefault || false);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Master Name is required', 'error');
      return;
    }

    // Check for duplicate names within same category (excluding self)
    const duplicate = categoryRecords.find(
      r =>
        r.name.trim().toLowerCase() === formName.trim().toLowerCase() &&
        (!editingRecord || r.id !== editingRecord.id)
    );

    if (duplicate) {
      showToast(`A master item with name "${formName.trim()}" already exists in ${currentCategoryConfig.name}`, 'warning');
    }

    saveMasterItem({
      id: editingRecord ? editingRecord.id : undefined,
      categoryKey: selectedCategoryKey,
      name: formName.trim(),
      code: formCode.trim() || undefined,
      subCategory: formSubCategory.trim() || undefined,
      description: formDescription.trim() || undefined,
      active: formActive,
      isDefault: formIsDefault
    });

    setIsModalOpen(false);
  };

  const handleToggleStatus = (record: MasterRecord) => {
    if (!isAdmin) {
      showToast('Admin privileges required to change master status', 'warning');
      return;
    }
    toggleMasterItemStatus(record.id);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) {
      showToast('Admin privileges required to delete master items', 'warning');
      return;
    }
    deleteMasterItem(id);
    setDeleteConfirmId(null);
  };

  const CurrentIcon = ICON_MAP[currentCategoryConfig.iconName] || Database;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-600 text-white rounded-xl shadow-sm">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-800">
                  Central Master Management System
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-semibold border border-teal-200">
                  ERP Core
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                সেন্ট্রাল মাস্টার ম্যানেজমেন্ট: লেন্স টাইপ, ব্র্যান্ড, কোটিং, ইনডেক্স ও ফ্রেম মাস্টার কন্ট্রোল
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin Access Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Read-Only (Login as Admin to Edit)</span>
            </div>
          )}

          <button
            id="btn-add-master-top"
            onClick={handleOpenAdd}
            disabled={!isAdmin}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white shadow-sm transition-all ${
              isAdmin
                ? 'bg-teal-600 hover:bg-teal-700 active:scale-95 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed text-slate-500'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Add {currentCategoryConfig.name.replace(' Master', '')}</span>
          </button>
        </div>
      </div>

      {/* 2. Master Category Navigation Pills */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
        <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Select Master Category (11 Dynamic Modules)
          </span>
          <span className="text-xs text-slate-400">
            Total Masters: {masters.length} records
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {MASTER_CATEGORIES_CONFIG.map(cat => {
            const isSelected = selectedCategoryKey === cat.key;
            const CatIcon = ICON_MAP[cat.iconName] || Database;
            const count = masters.filter(m => m.categoryKey === cat.key).length;
            const activeSubCount = masters.filter(m => m.categoryKey === cat.key && m.active).length;

            return (
              <button
                key={cat.key}
                id={`cat-btn-${cat.key}`}
                onClick={() => {
                  setSelectedCategoryKey(cat.key);
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className={`flex flex-col p-2.5 rounded-lg border text-left transition-all relative ${
                  isSelected
                    ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                    : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div
                    className={`p-1.5 rounded-md ${
                      isSelected ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <CatIcon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-teal-200 text-teal-900'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {activeSubCount}/{count}
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-800 truncate">
                  {cat.name.replace(' Master', '')}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {cat.nameBn}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Category Description & Safety Guarantee Banner */}
      <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 rounded-xl border border-teal-200/80 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-teal-600 text-white rounded-lg mt-0.5 shrink-0">
            <CurrentIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-800">
                {currentCategoryConfig.name}
              </h2>
              <span className="text-xs font-medium text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-300">
                {currentCategoryConfig.nameBn}
              </span>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                Prefix: {currentCategoryConfig.idPrefix}-
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {currentCategoryConfig.shortDesc}
            </p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-lg border border-teal-200 text-xs text-slate-700 shrink-0 shadow-2xs">
          <div className="flex items-center gap-1.5 font-semibold text-teal-800 mb-0.5">
            <Info className="w-3.5 h-3.5 text-teal-600" />
            <span>Dropdown Sync Rule</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Active items appear in live forms; Inactive items remain safe in past records.
          </p>
        </div>
      </div>

      {/* 4. Statistics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Records ({currentCategoryConfig.name.replace(' Master', '')})
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All registered entries</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
              Active (Live in Dropdowns)
            </p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{activeCount}</p>
            <p className="text-[11px] text-emerald-600/80 mt-0.5">Available for new entries</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">
              Deactivated / Inactive
            </p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{inactiveCount}</p>
            <p className="text-[11px] text-amber-600/80 mt-0.5">Preserved for historical data</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Power className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 5. Toolbar & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-master"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={`Search ${currentCategoryConfig.name} by name, code, description...`}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              id="filter-status-all"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              id="filter-status-active"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active ({activeCount})
            </button>
            <button
              id="filter-status-inactive"
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                statusFilter === 'inactive'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              Inactive ({inactiveCount})
            </button>
          </div>

          {/* Add New Master Button */}
          <button
            id="btn-add-master-toolbar"
            onClick={handleOpenAdd}
            disabled={!isAdmin}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white shadow-sm transition-all shrink-0 ${
              isAdmin
                ? 'bg-teal-600 hover:bg-teal-700 active:scale-95 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed text-slate-500'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New {currentCategoryConfig.name.replace(' Master', '')}</span>
          </button>
        </div>
      </div>

      {/* 6. Master Table List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Master Item Name</th>
                <th className="py-3 px-4">Code / Short ID</th>
                <th className="py-3 px-4">Category / Group</th>
                <th className="py-3 px-4">Description / Notes</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Audit Trail</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="p-3 bg-slate-100 rounded-full mb-3 text-slate-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-600 text-base">No Master Records Found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {searchTerm
                          ? `No items match "${searchTerm}" in ${currentCategoryConfig.name}.`
                          : `No ${statusFilter !== 'all' ? statusFilter : ''} records available in this master category.`}
                      </p>
                      {isAdmin && (
                        <button
                          onClick={handleOpenAdd}
                          className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                        >
                          + Add First {currentCategoryConfig.name.replace(' Master', '')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      !item.active ? 'bg-slate-50/40 text-slate-500' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center text-xs font-mono text-slate-400">
                      {index + 1}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${item.active ? 'text-slate-800' : 'text-slate-500 line-through'}`}>
                          {item.name}
                        </span>
                        {item.isDefault && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded border border-blue-200">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">ID: {item.id}</span>
                    </td>

                    {/* Code */}
                    <td className="py-3 px-4">
                      {item.code ? (
                        <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-xs text-slate-700 font-semibold">
                          {item.code}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs italic">—</span>
                      )}
                    </td>

                    {/* Sub Category */}
                    <td className="py-3 px-4">
                      {item.subCategory ? (
                        <span className="inline-block px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded text-xs font-medium">
                          {item.subCategory}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs italic">—</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description || <span className="text-slate-300 italic">No description provided</span>}
                      </p>
                    </td>

                    {/* Status Toggle & Badge */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          id={`btn-toggle-status-${item.id}`}
                          onClick={() => handleToggleStatus(item)}
                          disabled={!isAdmin}
                          title={
                            item.active
                              ? 'Click to Deactivate (Hide from dropdowns)'
                              : 'Click to Activate (Make available in dropdowns)'
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                            item.active
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                          } ${!isAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                        >
                          {item.active ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <Power className="w-3.5 h-3.5 text-slate-400" />
                              <span>Deactivated</span>
                            </>
                          )}
                        </button>
                        <span className="text-[10px] text-slate-400">
                          {item.active ? 'In dropdowns' : 'Hidden from new'}
                        </span>
                      </div>
                    </td>

                    {/* Audit Trail */}
                    <td className="py-3 px-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1 text-[11px]">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{item.createdBy || 'Admin'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })
                            : '2026-01-01'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`btn-edit-master-${item.id}`}
                          onClick={() => handleOpenEdit(item)}
                          disabled={!isAdmin}
                          title="Edit Master Record"
                          className={`p-1.5 rounded-lg border transition-all ${
                            isAdmin
                              ? 'bg-white border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-300 cursor-pointer shadow-2xs'
                              : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          id={`btn-toggle-action-${item.id}`}
                          onClick={() => handleToggleStatus(item)}
                          disabled={!isAdmin}
                          title={item.active ? 'Deactivate' : 'Reactivate'}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isAdmin
                              ? item.active
                                ? 'bg-white border-amber-200 text-amber-600 hover:bg-amber-50 cursor-pointer shadow-2xs'
                                : 'bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50 cursor-pointer shadow-2xs'
                              : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        <button
                          id={`btn-delete-master-${item.id}`}
                          onClick={() => setDeleteConfirmId(item.id)}
                          disabled={!isAdmin}
                          title="Delete Record (Admin)"
                          className={`p-1.5 rounded-lg border transition-all ${
                            isAdmin
                              ? 'bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 cursor-pointer shadow-2xs'
                              : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Detailed Explanation Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Paharpur Eye Care ERP — Central Master Protection Policy</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-700 mb-1">
              ✅ Real-Time Dynamic Dropdown Synchronization
            </p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              When you add or activate a Lens Type (e.g. "Anti Fatigue Lens", "Myopia Control Aspheric"), it is instantly populated in all Lens Inventory, Frame & Lens stock generation, Spectacle Order entry, and Prescription forms across the entire ERP without page refresh.
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-700 mb-1">
              🛡️ Non-Destructive Safe Deactivation (Soft Delete)
            </p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Deactivating a Master item prevents staff from selecting it in future entries, but all previously created patient prescriptions, lens stock records, customer orders, and wholesale invoices retain their exact original values without any data loss.
            </p>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* Add / Edit Master Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-teal-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <CurrentIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingRecord ? 'Edit Master Record' : `Add New ${currentCategoryConfig.name.replace(' Master', '')}`}
                  </h3>
                  <p className="text-xs text-teal-100">
                    Category: {currentCategoryConfig.name} ({currentCategoryConfig.nameBn})
                  </p>
                </div>
              </div>
              <button
                id="btn-close-modal"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {currentCategoryConfig.name.replace(' Master', '')} Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="modal-input-name"
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder={`e.g. ${
                    selectedCategoryKey === 'lens-type'
                      ? 'Anti Fatigue Lens'
                      : selectedCategoryKey === 'brand'
                      ? 'Crizal Sapphire'
                      : selectedCategoryKey === 'coating'
                      ? 'Blue UV420 Clean Coat'
                      : selectedCategoryKey === 'refractive-index'
                      ? '1.60 MR-8 Aspheric'
                      : 'New Master Item'
                  }`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This name will appear in dropdowns across inventory, clinical, and sales entry screens.
                </p>
              </div>

              {/* Code & SubCategory Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Short Code / Abbreviation <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="modal-input-code"
                    type="text"
                    value={formCode}
                    onChange={e => setFormCode(e.target.value)}
                    placeholder="e.g. AFL, BC-GRN, 1.67"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 uppercase focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    SubCategory / Classification <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="modal-input-subcategory"
                    type="text"
                    value={formSubCategory}
                    onChange={e => setFormSubCategory(e.target.value)}
                    placeholder="e.g. Single Vision, Progressive"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description / Optical & Usage Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="modal-input-description"
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="e.g. Recommended for digital device users with +0.60D accommodative booster..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* Status and Default Switches */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Active Status (Show in Dropdowns)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      When enabled, this master item is selectable in live ERP forms.
                    </p>
                  </div>
                  <input
                    id="modal-checkbox-active"
                    type="checkbox"
                    checked={formActive}
                    onChange={e => setFormActive(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Mark as Default Selection
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Pre-select this item as the primary recommendation in dropdowns.
                    </p>
                  </div>
                  <input
                    id="modal-checkbox-default"
                    type="checkbox"
                    checked={formIsDefault}
                    onChange={e => setFormIsDefault(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  id="modal-btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="modal-btn-save"
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingRecord ? 'Update Master' : 'Save Master Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Delete Master Record?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to delete this master record? If this master was used in past invoices or stock batches, we strongly recommend choosing <strong>Deactivate</strong> instead to preserve historical audit logs.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = masters.find(m => m.id === deleteConfirmId);
                  if (target) {
                    toggleMasterItemStatus(target.id);
                    setDeleteConfirmId(null);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg"
              >
                Deactivate Instead (Safer)
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
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
