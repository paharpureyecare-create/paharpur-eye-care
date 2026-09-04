import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { CrmLead, LeadStage, LeadSource } from '../../types';
import {
  Flame,
  Plus,
  Search,
  Filter,
  Phone,
  MessageSquare,
  DollarSign,
  UserCheck,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit3,
  Clock,
  Sparkles,
  Glasses
} from 'lucide-react';
import { formatCurrency, formatDate, openWhatsAppDirect } from './crmUtils';

export const LeadManagerView: React.FC = () => {
  const {
    leads = [],
    saveLead,
    deleteLead,
    updateLeadStage,
    settings,
    logCommunication,
    showToast
  } = useErp();

  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  // Form
  const [leadForm, setLeadForm] = useState<Partial<CrmLead>>({
    name: '',
    mobile: '',
    email: '',
    source: 'Walk-in',
    stage: 'New Lead',
    interest: 'Progressive Spectacle & Eye Exam',
    estimatedValue: 3500,
    notes: ''
  });

  const stages: LeadStage[] = [
    'New Lead',
    'Contacted',
    'Interested',
    'Appointment Booked',
    'Visited',
    'Order Created',
    'Purchased',
    'Follow-up',
    'Lost'
  ];

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchStage = selectedStage === 'ALL' || l.stage === selectedStage;
      const matchSearch =
        !searchQuery.trim() ||
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.mobile.includes(searchQuery) ||
        (l.interest && l.interest.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchStage && matchSearch;
    });
  }, [leads, selectedStage, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingLeadId(null);
    setLeadForm({
      name: '',
      mobile: '',
      email: '',
      source: 'Walk-in',
      stage: 'New Lead',
      interest: 'Progressive Lens & Branded Frame',
      estimatedValue: 3500,
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (lead: CrmLead) => {
    setEditingLeadId(lead.id);
    setLeadForm({ ...lead });
    setShowModal(true);
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name?.trim() || !leadForm.mobile?.trim()) {
      showToast('Please enter lead name and mobile number', 'error');
      return;
    }

    const leadToSave: CrmLead = {
      id: editingLeadId || `LEAD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      name: leadForm.name.trim(),
      mobile: leadForm.mobile.trim(),
      email: leadForm.email?.trim(),
      source: (leadForm.source as LeadSource) || 'Walk-in',
      stage: (leadForm.stage as LeadStage) || 'New Lead',
      interest: leadForm.interest || 'Spectacle Inquiries',
      estimatedValue: Number(leadForm.estimatedValue) || 0,
      notes: leadForm.notes,
      createdAt: leadForm.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    saveLead(leadToSave);
    setShowModal(false);
  };

  const handleWhatsAppLead = (lead: CrmLead) => {
    const text = `শ্রদ্ধেয় ${lead.name}, পাহাড়পুর আই কেয়ারের পক্ষ থেকে আন্তরিক শুভেচ্ছা! আপনার চাহিত (${lead.interest || 'চশমা ও আই টেস্ট'}) সংক্রান্ত পরামর্শ বা অ্যাপয়েন্টমেন্টের জন্য আমরা উপস্থিত। হেল্পলাইন: ${settings.whatsapp || settings.mobile || '+91 98301 23456'}।`;

    logCommunication({
      customerId: lead.id,
      customerName: lead.name,
      mobile: lead.mobile,
      messageType: 'Lead Follow-up',
      category: 'Inquiry',
      messageText: text,
      channel: 'WhatsApp',
      status: 'Sent'
    });

    openWhatsAppDirect(lead.mobile, text);
    showToast(`Opening WhatsApp chat for inquiry follow-up with ${lead.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Optical Lead & Inquiry Pipeline
          </h2>
          <p className="text-xs text-slate-500">
            Track walk-in inquiries, WhatsApp queries, frame trials, and convert interested prospects into spectacle customers
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Lead / Walk-in Inquiry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Stages pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', ...stages].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStage(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedStage === st
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search lead or mobile..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Leads Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Lead / Prospect</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Interest / Requirement</th>
                <th className="py-2.5 px-3">Est. Value</th>
                <th className="py-2.5 px-3">Stage Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No inquiries or leads recorded in this stage.
                  </td>
                </tr>
              ) : (
                filteredLeads.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{l.name}</div>
                      <div className="text-[10px] text-slate-400">{l.mobile}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {l.source}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 max-w-xs truncate">
                      {l.interest}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-700">
                      {formatCurrency(l.estimatedValue)}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={l.stage}
                        onChange={e => updateLeadStage(l.id, e.target.value as LeadStage)}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        {stages.map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleWhatsAppLead(l)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1 shadow-sm transition-all"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(l)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete lead "${l.name}"?`)) {
                              deleteLead(l.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                {editingLeadId ? 'Edit Optical Lead' : 'Create New Optical Lead'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Customer / Lead Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anirban Roy"
                  value={leadForm.name}
                  onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9830123456"
                    value={leadForm.mobile}
                    onChange={e => setLeadForm({ ...leadForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Source</label>
                  <select
                    value={leadForm.source}
                    onChange={e => setLeadForm({ ...leadForm, source: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    <option value="Walk-in">Walk-in Inquiry</option>
                    <option value="WhatsApp">WhatsApp Message</option>
                    <option value="Facebook">Facebook / Social</option>
                    <option value="Referral">Patient Referral</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Interest / Looking For</label>
                <input
                  type="text"
                  placeholder="e.g. Progressive Blue Cut + Rimless Titanium Frame"
                  value={leadForm.interest}
                  onChange={e => setLeadForm({ ...leadForm, interest: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Estimated Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="3500"
                    value={leadForm.estimatedValue || ''}
                    onChange={e => setLeadForm({ ...leadForm, estimatedValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Initial Pipeline Stage</label>
                  <select
                    value={leadForm.stage}
                    onChange={e => setLeadForm({ ...leadForm, stage: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    {stages.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-md"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
