import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { WhatsAppTemplate, OfferPromotion } from '../../types';
import {
  MessageSquare,
  Tag,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Smartphone,
  Send,
  Eye,
  CheckCircle2,
  Percent,
  Calendar,
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import { formatCurrency, formatDate, openWhatsAppDirect, replaceTemplateVariables } from './crmUtils';

interface TemplateAndOfferManagerViewProps {
  onLaunchCampaignFromOffer?: (offer: OfferPromotion) => void;
}

export const TemplateAndOfferManagerView: React.FC<TemplateAndOfferManagerViewProps> = ({
  onLaunchCampaignFromOffer
}) => {
  const {
    templates = [],
    offers = [],
    saveTemplate,
    deleteTemplate,
    saveOffer,
    deleteOffer,
    settings,
    showToast
  } = useErp();

  const [activeTab, setActiveTab] = useState<'templates' | 'offers'>('templates');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [selectedOfferId, setSelectedOfferId] = useState<string>(offers[0]?.id || '');
  const [previewLanguage, setPreviewLanguage] = useState<'Bengali' | 'English'>('Bengali');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState<Partial<WhatsAppTemplate>>({
    name: '',
    category: 'Spectacle Ready',
    messageBengali: '',
    messageEnglish: '',
    tags: ['{Customer_Name}', '{Order_ID}', '{Shop_Name}', '{Shop_Mobile}'],
    active: true
  });

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState<Partial<OfferPromotion>>({
    name: '',
    description: '',
    discountType: 'Percentage',
    discountPercent: 20,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    messageBengali: '',
    messageEnglish: '',
    status: 'Active'
  });

  // Selected Template & Offer for Live Phone Simulator
  const activeTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  const activeOffer = useMemo(() => {
    return offers.find(o => o.id === selectedOfferId) || offers[0];
  }, [offers, selectedOfferId]);

  // Live Simulated Preview Content
  const livePreviewMessage = useMemo(() => {
    if (activeTab === 'templates' && activeTemplate) {
      const raw = previewLanguage === 'Bengali' ? (activeTemplate.messageBengali || activeTemplate.messageEnglish) : (activeTemplate.messageEnglish || activeTemplate.messageBengali);
      return replaceTemplateVariables(
        raw,
        {
          patientName: 'Subir Karmakar',
          orderId: 'ORD-2026-7089',
          totalAmount: 4200,
          paidAmount: 2500,
          dueAmount: 1700,
          lensType: 'Blue Cut 1.56 Anti-Glare',
          frameModel: 'Titan Titanium Matte Black'
        },
        settings
      );
    } else if (activeTab === 'offers' && activeOffer) {
      const raw = previewLanguage === 'Bengali' ? (activeOffer.messageBengali || activeOffer.messageEnglish) : (activeOffer.messageEnglish || activeOffer.messageBengali);
      return replaceTemplateVariables(
        raw,
        {
          patientName: 'Subir Karmakar',
          offerName: activeOffer.name,
          discount: `${activeOffer.discountPercent || 20}%`
        },
        settings
      );
    }
    return 'Select a template or offer to preview live WhatsApp rendering.';
  }, [activeTab, activeTemplate, activeOffer, previewLanguage, settings]);

  // Handle Save Template
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name?.trim() || !templateForm.messageBengali?.trim()) {
      showToast('Please provide template name and message text', 'error');
      return;
    }

    const tpl: WhatsAppTemplate = {
      id: editingTemplateId || `TPL-${Date.now().toString().slice(-4)}`,
      name: templateForm.name.trim(),
      category: (templateForm.category as any) || 'General Notice',
      messageBengali: templateForm.messageBengali.trim(),
      messageEnglish: templateForm.messageEnglish?.trim() || templateForm.messageBengali.trim(),
      tags: templateForm.tags || ['{Customer_Name}', '{Shop_Name}'],
      active: true,
      isCustom: true
    };

    saveTemplate(tpl);
    setSelectedTemplateId(tpl.id);
    setShowTemplateModal(false);
  };

  // Handle Save Offer
  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.name?.trim()) {
      showToast('Please provide offer name', 'error');
      return;
    }

    const off: OfferPromotion = {
      id: editingOfferId || `OFF-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      name: offerForm.name.trim(),
      description: offerForm.description || '',
      discountType: offerForm.discountType || 'Percentage',
      discountPercent: offerForm.discountPercent || 15,
      startDate: offerForm.startDate || new Date().toISOString().split('T')[0],
      endDate: offerForm.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      messageBengali: offerForm.messageBengali || `শ্রদ্ধেয় {Customer_Name}, {Shop_Name}-এ ${offerForm.name}-এ পাচ্ছেন বিশেষ ছাড়!`,
      messageEnglish: offerForm.messageEnglish || `Dear {Customer_Name}, enjoy exclusive discount with ${offerForm.name} at {Shop_Name}!`,
      status: (offerForm.status as any) || 'Active',
      createdAt: offerForm.createdAt || new Date().toISOString().split('T')[0]
    };

    saveOffer(off);
    setSelectedOfferId(off.id);
    setShowOfferModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-600" />
            WhatsApp Templates & Festive Offer Engine
          </h2>
          <p className="text-xs text-slate-500">
            Standardized optical communication messages with dynamic tags and live WhatsApp phone simulator
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'templates' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-600'
              }`}
            >
              Templates ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'offers' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-600'
              }`}
            >
              Offers & Promos ({offers.length})
            </button>
          </div>

          {activeTab === 'templates' ? (
            <button
              onClick={() => {
                setEditingTemplateId(null);
                setTemplateForm({
                  name: '',
                  category: 'Spectacle Ready',
                  messageBengali: '',
                  messageEnglish: '',
                  variables: ['{Customer_Name}', '{Order_ID}', '{Shop_Name}']
                });
                setShowTemplateModal(true);
              }}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Template</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingOfferId(null);
                setOfferForm({
                  name: '',
                  description: '',
                  discountType: 'Percentage',
                  discountPercent: 20,
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  messageBengali: '',
                  messageEnglish: '',
                  status: 'Active'
                });
                setShowOfferModal(true);
              }}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Offer</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split: Left Cards + Right Live Smartphone Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Items List */}
        <div className="lg:col-span-7 space-y-4">
          {activeTab === 'templates' ? (
            <div className="space-y-3">
              {templates.map(tpl => {
                const isSelected = tpl.id === selectedTemplateId;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white space-y-2.5 ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {tpl.category}
                          </span>
                          {tpl.isSystem && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200">
                              System Preset
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">{tpl.name}</h3>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setEditingTemplateId(tpl.id);
                            setTemplateForm({ ...tpl });
                            setShowTemplateModal(true);
                          }}
                          className="p-1 hover:text-teal-600 rounded"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {!tpl.isSystem && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (confirm(`Delete template "${tpl.name}"?`)) {
                                deleteTemplate(tpl.id);
                              }
                            }}
                            className="p-1 hover:text-red-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{tpl.messageBengali || tpl.messageEnglish}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Tags: {(tpl.tags || []).slice(0, 3).join(', ')}</span>
                      <span className="font-semibold text-teal-700">Click to Preview 📱</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map(off => {
                const isSelected = off.id === selectedOfferId;
                return (
                  <div
                    key={off.id}
                    onClick={() => setSelectedOfferId(off.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white space-y-2.5 ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {off.discountPercent ? `${off.discountPercent}% Off` : 'Promo'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Valid: {formatDate(off.startDate)} - {formatDate(off.endDate)}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">{off.name}</h3>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setEditingOfferId(off.id);
                            setOfferForm({ ...off });
                            setShowOfferModal(true);
                          }}
                          className="p-1 hover:text-teal-600 rounded"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`Delete offer "${off.name}"?`)) {
                              deleteOffer(off.id);
                            }
                          }}
                          className="p-1 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{off.messageBengali || off.messageEnglish}"
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">{off.description}</span>
                      {onLaunchCampaignFromOffer && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onLaunchCampaignFromOffer(off);
                          }}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold"
                        >
                          Launch Campaign →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 5 Columns: Live WhatsApp Smartphone Simulator */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800 max-w-sm mx-auto">
            {/* Phone Screen Container */}
            <div className="bg-[#EFEAE2] rounded-[30px] overflow-hidden flex flex-col h-[520px]">
              {/* WhatsApp Header Bar */}
              <div className="bg-[#075E54] text-white p-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                    👓
                  </div>
                  <div>
                    <div className="font-bold text-xs truncate max-w-[140px]">
                      {settings.shopName || 'Paharpur Eye Care'}
                    </div>
                    <div className="text-[9px] text-emerald-200">Official Optical Business</div>
                  </div>
                </div>

                {/* Language Switch inside Phone */}
                <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg text-[10px]">
                  <button
                    onClick={() => setPreviewLanguage('Bengali')}
                    className={`px-1.5 py-0.5 rounded ${previewLanguage === 'Bengali' ? 'bg-white text-[#075E54] font-bold' : 'text-white'}`}
                  >
                    বাংলা
                  </button>
                  <button
                    onClick={() => setPreviewLanguage('English')}
                    className={`px-1.5 py-0.5 rounded ${previewLanguage === 'English' ? 'bg-white text-[#075E54] font-bold' : 'text-white'}`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* Chat Canvas */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col justify-end">
                {/* Date bubble */}
                <div className="text-center">
                  <span className="bg-white/80 px-2 py-0.5 rounded-md text-[9px] text-slate-600 shadow-2xs">
                    TODAY
                  </span>
                </div>

                {/* WhatsApp Chat Message Bubble */}
                <div className="bg-white p-3 rounded-2xl rounded-tl-xs shadow-sm max-w-[92%] space-y-2 border border-slate-200/50">
                  <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {livePreviewMessage}
                  </p>
                  <div className="text-[9px] text-slate-400 text-right flex items-center justify-end gap-1">
                    <span>11:45 AM</span>
                    <span className="text-teal-600 font-bold">✓✓</span>
                  </div>
                </div>
              </div>

              {/* Simulated WhatsApp Input Bar */}
              <div className="bg-[#F0F2F5] p-2 flex items-center gap-2 border-t border-slate-200">
                <div className="flex-1 bg-white px-3 py-1.5 rounded-full text-xs text-slate-400">
                  Type a reply...
                </div>
                <button
                  onClick={() => openWhatsAppDirect('+919830123456', livePreviewMessage)}
                  className="w-8 h-8 rounded-full bg-[#075E54] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                  title="Test in WhatsApp Web"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                {editingTemplateId ? 'Edit WhatsApp Template' : 'Create New WhatsApp Template'}
              </h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Template Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spectacle Ready Notification"
                  value={templateForm.name}
                  onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Category</label>
                <select
                  value={templateForm.category}
                  onChange={e => setTemplateForm({ ...templateForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                >
                  <option value="Spectacle Ready">Spectacle Ready</option>
                  <option value="Appointment Confirmation">Appointment Confirmation</option>
                  <option value="Due Payment Reminder">Due Payment Reminder</option>
                  <option value="Eye Checkup Reminder">Eye Checkup Reminder</option>
                  <option value="Follow-up Reminder">Follow-up Reminder</option>
                  <option value="Festival Special">Festival Special</option>
                  <option value="General Notice">General Notice</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">বাংলা মেসেজ (Bengali Message) *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="শ্রদ্ধেয় {Customer_Name}, আপনার চশমা (অর্ডার #{Order_ID}) প্রস্তুত..."
                  value={templateForm.messageBengali}
                  onChange={e => setTemplateForm({ ...templateForm, messageBengali: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">English Message</label>
                <textarea
                  rows={4}
                  placeholder="Dear {Customer_Name}, your spectacle order #{Order_ID} is ready for collection..."
                  value={templateForm.messageEnglish}
                  onChange={e => setTemplateForm({ ...templateForm, messageEnglish: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-md"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-teal-600" />
                {editingOfferId ? 'Edit Festive Offer' : 'Create New Promotional Offer'}
              </h3>
              <button
                onClick={() => setShowOfferModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Offer Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Poila Boishakh 20% Privilege Discount"
                  value={offerForm.name}
                  onChange={e => setOfferForm({ ...offerForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Discount Percent (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="20"
                    value={offerForm.discountPercent || ''}
                    onChange={e => setOfferForm({ ...offerForm, discountPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Status</label>
                  <select
                    value={offerForm.status}
                    onChange={e => setOfferForm({ ...offerForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={offerForm.startDate}
                    onChange={e => setOfferForm({ ...offerForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">End Date</label>
                  <input
                    type="date"
                    value={offerForm.endDate}
                    onChange={e => setOfferForm({ ...offerForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">WhatsApp Offer Message (Bengali)</label>
                <textarea
                  rows={3}
                  placeholder="শ্রদ্ধেয় {Customer_Name}, {Shop_Name}-এ আমাদের বিশেষ অফার..."
                  value={offerForm.messageBengali}
                  onChange={e => setOfferForm({ ...offerForm, messageBengali: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-md"
                >
                  Save Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
