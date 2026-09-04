import React, { useState, useMemo } from 'react';
import { Customer } from '../types';
import { useErp } from '../context/ErpContext';
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Eye,
  Award,
  ShoppingBag,
  ExternalLink,
  Send,
  Link as LinkIcon,
  CheckCircle2,
  Calendar,
  Sparkles,
  Printer,
  ChevronRight,
  TrendingUp,
  Archive,
  RotateCcw,
  Trash2,
  Edit3
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const {
    role,
    customers,
    patients,
    spectacleOrders,
    retailSales,
    setSelectedCustomerFor360,
    saveCustomer,
    archiveCustomer,
    restoreCustomer,
    deleteCustomer,
    showToast
  } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('ALL');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newNickName, setNewNickName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newAge, setNewAge] = useState<number | ''>('');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newProfession, setNewProfession] = useState('');
  const [newVillage, setNewVillage] = useState('');
  const [newDistrict, setNewDistrict] = useState('South 24 Parganas');
  const [newPinCode, setNewPinCode] = useState('');
  const [linkedMrd, setLinkedMrd] = useState('');

  // Edit Customer Form State
  const [editFormData, setEditFormData] = useState<Customer | null>(null);

  // Segment counts
  const totalCustomers = customers.length;
  const totalLifetimeSpent = customers.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0);
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstandingDue || 0), 0);
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);

  // Filter logic
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.customerId.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        (c.mrd && c.mrd.toLowerCase().includes(q)) ||
        (c.village && c.village.toLowerCase().includes(q)) ||
        (c.profession && c.profession.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (segmentFilter === 'ALL') return c.status !== 'Archived';
      if (segmentFilter === 'ARCHIVED') return c.status === 'Archived';
      if (segmentFilter === 'LINKED_PATIENT') return Boolean(c.mrd) && c.status !== 'Archived';
      if (segmentFilter === 'DUE_CUSTOMERS') return (c.outstandingDue || 0) > 0 && c.status !== 'Archived';
      if (segmentFilter === 'HIGH_VALUE') return (c.lifetimeValue || 0) >= 3000 && c.status !== 'Archived';
      if (segmentFilter === 'LOYALTY_ACTIVE') return (c.loyaltyPoints || 0) > 0 && c.status !== 'Archived';
      return c.segment === segmentFilter && c.status !== 'Archived';
    });
  }, [customers, searchQuery, segmentFilter]);

  const handleArchiveCustomer = (customerId: string, name: string) => {
    const reason = prompt(`Reason for archiving customer ${name} (${customerId}):`, 'Duplicate / Inactive');
    if (reason !== null) {
      archiveCustomer(customerId, reason || 'Archived by Admin');
    }
  };

  const handleRestoreCustomer = (customerId: string, name: string) => {
    if (window.confirm(`Restore customer ${name} (${customerId}) to Active status?`)) {
      restoreCustomer(customerId);
    }
  };

  const handleOpenEditCustomer = (cust: Customer) => {
    setEditingCustomer(cust);
    setEditFormData({ ...cust });
  };

  const handleUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !editFormData.name.trim() || !editFormData.mobile.trim()) {
      showToast('Name and mobile number are required', 'error');
      return;
    }
    saveCustomer(editFormData);
    setEditingCustomer(null);
    setEditFormData(null);
  };

  const handleDeleteCustomer = (customerId: string, name: string) => {
    if (role !== 'Admin') {
      showToast('Admin permission required to delete Customer profile', 'error');
      return;
    }
    const confirmText = prompt(
      `⚠️ ADMIN PERMANENT DELETE\nThis will permanently delete optical customer ${name} (${customerId}).\nType "DELETE" to confirm:`
    );
    if (confirmText === 'DELETE') {
      deleteCustomer(customerId);
    } else if (confirmText !== null) {
      showToast('Deletion cancelled: text did not match DELETE', 'warning');
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newMobile.trim()) {
      showToast('Name and mobile number are required', 'error');
      return;
    }

    const nextSeq = 5000 + customers.length + 1;
    const newCust: Customer = {
      customerId: `CUST-${nextSeq}`,
      mrd: linkedMrd || undefined,
      name: newName.trim(),
      nickName: newNickName.trim() || undefined,
      mobile: newMobile.trim(),
      whatsapp: newWhatsapp.trim() || newMobile.trim(),
      age: newAge ? Number(newAge) : undefined,
      gender: newGender,
      profession: newProfession.trim() || undefined,
      address: `${newVillage ? newVillage + ', ' : ''}${newDistrict} ${newPinCode}`.trim(),
      village: newVillage.trim() || undefined,
      district: newDistrict,
      pinCode: newPinCode.trim() || undefined,
      totalPurchases: 0,
      lifetimeValue: 0,
      outstandingDue: 0,
      loyaltyPoints: 50, // Welcome bonus
      segment: 'New Customer',
      status: 'Active'
    };

    saveCustomer(newCust);
    setShowAddCustomerModal(false);
    // Reset form
    setNewName('');
    setNewNickName('');
    setNewMobile('');
    setNewWhatsapp('');
    setNewAge('');
    setNewProfession('');
    setNewVillage('');
    setNewPinCode('');
    setLinkedMrd('');
    setSelectedCustomerFor360(newCust);
  };

  const handleOpenWhatsApp = (c: Customer) => {
    const msg = `Dear ${c.name}, Greetings from Paharpur Eye Care! We are pleased to assist you with your eyewear and clinical vision care needs.`;
    const phone = c.whatsapp || c.mobile;
    const clean = phone.replace(/[^0-9]/g, '');
    const finalPhone = clean.length === 10 ? `91${clean}` : clean;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Highlights */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-cyan-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white">Customer 360 & Optical CRM</h1>
            </div>
            <p className="text-xs text-cyan-200/80 mt-1 max-w-2xl">
              Dedicated Customer profiles with dual Patient MRD linkage, date-wise eye power history, spectacle orders, retail invoices, and loyalty reward tiers.
            </p>
          </div>

          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Register New Customer
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-cyan-200">Total Optical Customers</p>
            <p className="text-xl font-extrabold text-white mt-0.5">{totalCustomers}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-cyan-200">Lifetime Revenue</p>
            <p className="text-xl font-extrabold text-white mt-0.5">₹{totalLifetimeSpent.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-cyan-200">Outstanding Balance</p>
            <p className="text-xl font-extrabold text-amber-300 mt-0.5">₹{totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
            <p className="text-[11px] text-cyan-200">Active Loyalty Points</p>
            <p className="text-xl font-extrabold text-emerald-300 mt-0.5">{totalLoyaltyPoints.toLocaleString()} pts</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Name, Mobile, Customer ID, MRD, Village..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5" /> Segment:
          </span>
          <select
            value={segmentFilter}
            onChange={e => setSegmentFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 bg-white focus:ring-2 focus:ring-cyan-500"
          >
            <option value="ALL">Active Customers ({customers.filter(c => c.status !== 'Archived').length})</option>
            <option value="ARCHIVED">Archived Customers ({customers.filter(c => c.status === 'Archived').length})</option>
            <option value="LINKED_PATIENT">Linked With Patient MRD ({customers.filter(c => c.mrd && c.status !== 'Archived').length})</option>
            <option value="DUE_CUSTOMERS">Outstanding Due ({customers.filter(c => (c.outstandingDue || 0) > 0 && c.status !== 'Archived').length})</option>
            <option value="HIGH_VALUE">High Value / VIP ({customers.filter(c => (c.lifetimeValue || 0) >= 3000 && c.status !== 'Archived').length})</option>
            <option value="LOYALTY_ACTIVE">With Loyalty Points ({customers.filter(c => (c.loyaltyPoints || 0) > 0 && c.status !== 'Archived').length})</option>
            <option value="Spectacle Buyer">Spectacle Buyers</option>
            <option value="New Customer">New Customers</option>
            <option value="Follow-up Due">Follow-up Due</option>
          </select>
        </div>
      </div>

      {/* Customers Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Customer & ID</th>
                <th className="p-3.5">Linked Patient MRD</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Location & Profession</th>
                <th className="p-3.5">Total Purchases</th>
                <th className="p-3.5">Due Balance</th>
                <th className="p-3.5">Loyalty Tier</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(c => {
                  const linkedP = patients.find(p => (c.mrd && p.mrd === c.mrd) || p.mobile === c.mobile);
                  return (
                    <tr key={c.customerId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center text-sm shadow-2xs">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <button
                              onClick={() => setSelectedCustomerFor360(c)}
                              className="font-bold text-slate-800 hover:text-cyan-700 text-left transition-colors cursor-pointer block"
                            >
                              {c.name} {c.nickName ? `(${c.nickName})` : ''}
                            </button>
                            <span className="font-mono text-[11px] text-slate-400">ID: {c.customerId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        {c.mrd ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {c.mrd}
                          </span>
                        ) : linkedP ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-medium" title="Mobile matched patient">
                            <LinkIcon className="w-3 h-3 text-amber-500" /> {linkedP.mrd}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standalone Customer</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-slate-700">{c.mobile}</div>
                        {c.whatsapp && c.whatsapp !== c.mobile && (
                          <div className="text-[11px] text-emerald-600">WA: {c.whatsapp}</div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="text-slate-700">{c.village || c.district || 'Paharpur'}</div>
                        {c.profession && <div className="text-[11px] text-slate-400">{c.profession}</div>}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">₹{(c.lifetimeValue || 0).toLocaleString()}</div>
                        <div className="text-[11px] text-slate-400">{c.totalPurchases || 0} visits/orders</div>
                      </td>

                      <td className="p-3.5">
                        <span className={`font-bold ${(c.outstandingDue || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          ₹{(c.outstandingDue || 0).toLocaleString()}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Award className="w-3 h-3 text-amber-600" /> {c.loyaltyPoints || 0} pts
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenWhatsApp(c)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="WhatsApp Chat"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedCustomerFor360(c)}
                            className="px-2.5 py-1 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            Profile 360 <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Customer */}
                          <button
                            onClick={() => handleOpenEditCustomer(c)}
                            className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                            title="Edit Customer Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Archive or Restore */}
                          {c.status === 'Archived' ? (
                            <button
                              onClick={() => handleRestoreCustomer(c.customerId, c.name)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                              title="Restore Customer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleArchiveCustomer(c.customerId, c.name)}
                              className="p-1.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-lg transition-colors cursor-pointer"
                              title="Archive Customer"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Permanent Delete */}
                          <button
                            onClick={() => handleDeleteCustomer(c.customerId, c.name)}
                            className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                            title="Permanent Delete (Admin Only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No customers found matching the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REGISTER NEW CUSTOMER */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-700" /> Register New Optical Customer
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              {/* Optional Link with Existing Patient */}
              <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-xl space-y-1.5">
                <label className="block text-cyan-950 font-bold">
                  🔗 Link to Existing Clinical Patient (Optional)
                </label>
                <select
                  value={linkedMrd}
                  onChange={e => {
                    const mrd = e.target.value;
                    setLinkedMrd(mrd);
                    const found = patients.find(p => p.mrd === mrd);
                    if (found) {
                      setNewName(found.name);
                      setNewMobile(found.mobile);
                      setNewAge(found.age);
                      setNewGender(found.gender);
                      setNewVillage(found.village || '');
                      setNewDistrict(found.district || 'South 24 Parganas');
                    }
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Standalone Customer (No Linked Patient) --</option>
                  {patients.map(p => (
                    <option key={p.mrd} value={p.mrd}>
                      {p.mrd} - {p.name} ({p.mobile})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-cyan-800">
                  Select an existing patient to auto-fill details and establish dual identity!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Subir Karmakar"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nick Name</label>
                  <input
                    type="text"
                    value={newNickName}
                    onChange={e => setNewNickName(e.target.value)}
                    placeholder="e.g. Bapi"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Primary Mobile *</label>
                  <input
                    type="text"
                    required
                    value={newMobile}
                    onChange={e => setNewMobile(e.target.value)}
                    placeholder="e.g. 9832011223"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={newWhatsapp}
                    onChange={e => setNewWhatsapp(e.target.value)}
                    placeholder="e.g. 9832011223"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Age</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={e => setNewAge(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 38"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={e => setNewGender(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Profession</label>
                  <input
                    type="text"
                    value={newProfession}
                    onChange={e => setNewProfession(e.target.value)}
                    placeholder="e.g. Teacher, Business"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Village / Town</label>
                  <input
                    type="text"
                    value={newVillage}
                    onChange={e => setNewVillage(e.target.value)}
                    placeholder="e.g. Paharpur"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={e => setNewDistrict(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={newPinCode}
                    onChange={e => setNewPinCode(e.target.value)}
                    placeholder="e.g. 743372"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold shadow-xs"
                >
                  Save & Open Profile 360
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CUSTOMER DETAILS */}
      {editingCustomer && editFormData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    Edit Customer Profile: {editingCustomer.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {editingCustomer.customerId}</p>
                </div>
              </div>
              <button onClick={() => setEditingCustomer(null)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nick Name / Alias</label>
                  <input
                    type="text"
                    value={editFormData.nickName || ''}
                    onChange={e => setEditFormData({ ...editFormData, nickName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mobile Number (Primary) *</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.mobile}
                    onChange={e => setEditFormData({ ...editFormData, mobile: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={editFormData.whatsapp || ''}
                    onChange={e => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Age</label>
                  <input
                    type="number"
                    value={editFormData.age || ''}
                    onChange={e => setEditFormData({ ...editFormData, age: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Gender</label>
                  <select
                    value={editFormData.gender || 'Male'}
                    onChange={e => setEditFormData({ ...editFormData, gender: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Profession</label>
                  <input
                    type="text"
                    value={editFormData.profession || ''}
                    onChange={e => setEditFormData({ ...editFormData, profession: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Village / Town</label>
                  <input
                    type="text"
                    value={editFormData.village || ''}
                    onChange={e => setEditFormData({ ...editFormData, village: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={editFormData.district || 'South 24 Parganas'}
                    onChange={e => setEditFormData({ ...editFormData, district: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={editFormData.pinCode || ''}
                    onChange={e => setEditFormData({ ...editFormData, pinCode: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Customer Segment</label>
                  <select
                    value={editFormData.segment || 'Regular'}
                    onChange={e => setEditFormData({ ...editFormData, segment: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="New Customer">New Customer</option>
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="High-Value">High-Value</option>
                    <option value="At-Risk">At-Risk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Status</label>
                  <select
                    value={editFormData.status || 'Active'}
                    onChange={e => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
