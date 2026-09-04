import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { CustomerSegmentRule, Customer } from '../../types';
import {
  Users,
  Filter,
  Plus,
  Trash2,
  Send,
  Download,
  Search,
  CheckCircle2,
  Tag,
  DollarSign,
  Calendar,
  Glasses,
  UserCheck,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { filterCustomersBySegment, formatCurrency, formatDate, openWhatsAppDirect, replaceTemplateVariables } from './crmUtils';

interface CustomerSegmentationViewProps {
  onOpenNewCampaignModal: (segmentId?: string) => void;
  onOpenDirectMsgToCustomer: (customer: Customer) => void;
}

export const CustomerSegmentationView: React.FC<CustomerSegmentationViewProps> = ({
  onOpenNewCampaignModal,
  onOpenDirectMsgToCustomer
}) => {
  const {
    customers = [],
    spectacleOrders = [],
    visits = [],
    allSegments = [],
    saveCustomSegment,
    deleteCustomSegment,
    templates = [],
    settings,
    updateCustomerMarketingProfile,
    showToast
  } = useErp();

  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(allSegments[0]?.id || 'SEG-ALL-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form for custom segment creation
  const [customSegmentForm, setCustomSegmentForm] = useState({
    name: '',
    nameBn: '',
    description: '',
    minTotalPurchase: 0,
    minDue: 0,
    inactiveDays: 0,
    whatsappOptInOnly: false
  });

  const selectedSegment = useMemo(() => {
    return allSegments.find(s => s.id === selectedSegmentId) || allSegments[0];
  }, [allSegments, selectedSegmentId]);

  // Compute matching customers for currently selected segment
  const matchingCustomers = useMemo(() => {
    if (!selectedSegment) return customers;
    return filterCustomersBySegment(customers, selectedSegment, spectacleOrders, visits);
  }, [customers, selectedSegment, spectacleOrders, visits]);

  // Search filtered within segment
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return matchingCustomers;
    const q = searchQuery.toLowerCase();
    return matchingCustomers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      (c.customerId && c.customerId.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  }, [matchingCustomers, searchQuery]);

  // Handle saving new custom segment
  const handleSaveSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSegmentForm.name?.trim()) {
      showToast('Please enter a segment name', 'error');
      return;
    }

    const newSeg: CustomerSegmentRule = {
      id: `SEG-CUSTOM-${Date.now().toString().slice(-4)}`,
      name: customSegmentForm.name.trim(),
      nameBn: customSegmentForm.nameBn.trim() || customSegmentForm.name.trim(),
      description: customSegmentForm.description?.trim() || 'Custom targeted optical audience',
      isPredefined: false,
      tag: 'Custom',
      criteria: {
        minTotalPurchase: customSegmentForm.minTotalPurchase > 0 ? customSegmentForm.minTotalPurchase : undefined,
        minDue: customSegmentForm.minDue > 0 ? customSegmentForm.minDue : undefined,
        inactiveDays: customSegmentForm.inactiveDays > 0 ? customSegmentForm.inactiveDays : undefined,
        whatsappOptInOnly: customSegmentForm.whatsappOptInOnly
      }
    };

    saveCustomSegment(newSeg);
    setSelectedSegmentId(newSeg.id);
    setShowCreateModal(false);
    setCustomSegmentForm({ name: '', nameBn: '', description: '', minTotalPurchase: 0, minDue: 0, inactiveDays: 0, whatsappOptInOnly: false });
  };

  // Export CSV
  const handleExportCsv = () => {
    const rows = [
      ['Customer ID', 'Name', 'Mobile', 'WhatsApp', 'LTV (INR)', 'Outstanding Due (INR)', 'Last Contact', 'Segment', 'Opt-In Status'],
      ...filteredCustomers.map(c => [
        c.customerId || '',
        c.name,
        c.mobile,
        c.whatsapp || c.mobile,
        String(c.lifetimeValue || c.totalPurchases || 0),
        String(c.outstandingDue || 0),
        c.lastContact || '',
        c.segment || '',
        c.whatsappMarketingStatus || 'Opted In'
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Optical_Audience_${selectedSegment?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredCustomers.length} customer contacts to CSV`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Filter className="w-5 h-5 text-teal-600" />
            Smart Customer Segmentation
          </h2>
          <p className="text-xs text-slate-500">
            Automatically group optical patients by purchase history, prescription recall dates, dues, and lens choices
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Segment</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Segments Selector Sidebar + Audience Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Segments List */}
        <div className="space-y-2 lg:col-span-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Audience Segments ({allSegments.length})
          </div>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {allSegments.map(seg => {
              const count = filterCustomersBySegment(customers, seg, spectacleOrders, visits).length;
              const isSelected = seg.id === selectedSegmentId;
              return (
                <div
                  key={seg.id}
                  onClick={() => setSelectedSegmentId(seg.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-50/90 border-teal-500 text-teal-950 font-bold shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="truncate flex items-center gap-1.5">
                      {seg.name}
                      {seg.isPredefined && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-normal">Auto</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate font-normal">{seg.description}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3 Cols: Active Segment Audience Details */}
        <div className="lg:col-span-3 space-y-4">
          {/* Segment Details & Fast Launch Card */}
          <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Target Segment
                </span>
                <h3 className="text-lg font-bold text-white">{selectedSegment?.name}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedSegment?.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onOpenNewCampaignModal(selectedSegment?.id)}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Launch Campaign ({matchingCustomers.length})</span>
              </button>

              {!selectedSegment?.isPredefined && (
                <button
                  onClick={() => {
                    if (confirm(`Delete custom segment "${selectedSegment?.name}"?`)) {
                      deleteCustomSegment(selectedSegment?.id);
                      setSelectedSegmentId(allSegments[0]?.id || '');
                    }
                  }}
                  className="p-2 bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 text-red-200 rounded-xl transition-all"
                  title="Delete Custom Segment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search bar inside audience */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search customer name, mobile, address..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="text-xs font-medium text-slate-500">
                Showing {filteredCustomers.length} of {matchingCustomers.length} customers
              </div>
            </div>

            {/* Customers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Patient / Customer</th>
                    <th className="py-2.5 px-3">Mobile & WhatsApp</th>
                    <th className="py-2.5 px-3">Lifetime Value</th>
                    <th className="py-2.5 px-3">Due Balance</th>
                    <th className="py-2.5 px-3">Marketing Status</th>
                    <th className="py-2.5 px-3 text-right">Direct Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No customers found matching this segment criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(c => (
                      <tr key={c.customerId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <div className="text-[10px] text-slate-400">{c.customerId} {c.address ? `• ${c.address}` : ''}</div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {c.mobile}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">
                          {formatCurrency(c.lifetimeValue || c.totalPurchases || 0)}
                        </td>
                        <td className="py-3 px-3">
                          {c.outstandingDue && c.outstandingDue > 0 ? (
                            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              {formatCurrency(c.outstandingDue)}
                            </span>
                          ) : (
                            <span className="text-slate-400">Nil</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => {
                              const next = c.whatsappMarketingStatus === 'Opted Out' ? 'Opted In' : 'Opted Out';
                              updateCustomerMarketingProfile(c.customerId, { whatsappMarketingStatus: next });
                            }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                              c.whatsappMarketingStatus === 'Opted Out'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {c.whatsappMarketingStatus || 'Opted In'}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onOpenDirectMsgToCustomer(c)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1 shadow-sm transition-all"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
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
      </div>

      {/* Create Custom Segment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-teal-600" />
                Build Custom Customer Segment
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSegment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Segment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Progressive Lens High Spenders"
                  value={customSegmentForm.name}
                  onChange={e => setCustomSegmentForm({ ...customSegmentForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description / Goal</label>
                <input
                  type="text"
                  placeholder="Targeting premium progressive optics patients for new coating upgrades"
                  value={customSegmentForm.description}
                  onChange={e => setCustomSegmentForm({ ...customSegmentForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Min Purchase Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5000"
                    value={customSegmentForm.minTotalPurchase || ''}
                    onChange={e => setCustomSegmentForm({ ...customSegmentForm, minTotalPurchase: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Inactive Since (Days)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 180"
                    value={customSegmentForm.inactiveDays || ''}
                    onChange={e => setCustomSegmentForm({ ...customSegmentForm, inactiveDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customSegmentForm.minDue > 0}
                    onChange={e => setCustomSegmentForm({ ...customSegmentForm, minDue: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="font-medium text-slate-700">Only Customers with Due Balance</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-md"
                >
                  Save Segment Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
