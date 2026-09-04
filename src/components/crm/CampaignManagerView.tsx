import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { MarketingCampaign, CampaignType, CampaignStatus } from '../../types';
import {
  Send,
  Plus,
  Copy,
  Trash2,
  Edit3,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Sparkles,
  Calendar,
  MessageSquare,
  Search,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { filterCustomersBySegment, formatCurrency, formatDate, openWhatsAppDirect, replaceTemplateVariables } from './crmUtils';

interface CampaignManagerViewProps {
  onOpenAiModal: (initialPrompt?: string, mode?: 'campaign' | 'writer' | 'insights') => void;
  initialSegmentId?: string;
}

export const CampaignManagerView: React.FC<CampaignManagerViewProps> = ({
  onOpenAiModal,
  initialSegmentId
}) => {
  const {
    campaigns = [],
    saveCampaign,
    deleteCampaign,
    duplicateCampaign,
    toggleCampaignStatus,
    allSegments = [],
    customers = [],
    spectacleOrders = [],
    visits = [],
    templates = [],
    offers = [],
    settings,
    logCommunication,
    showToast
  } = useErp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);

  // Campaign Form State
  const [campaignForm, setCampaignForm] = useState<Partial<MarketingCampaign>>({
    name: '',
    type: 'Seasonal',
    status: 'Draft',
    segmentId: initialSegmentId || allSegments[0]?.id || '',
    segmentName: allSegments[0]?.name || 'All Customers',
    customMessageBengali: '',
    customMessageEnglish: '',
    ctaType: 'WhatsApp',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    metrics: {
      targetCount: 0,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0,
      responsesCount: 0,
      convertedCount: 0,
      salesAmount: 0,
      costAmount: 0,
      profitAmount: 0,
      roiPercent: 0
    }
  });

  const [selectedLanguage, setSelectedLanguage] = useState<'Bengali' | 'English'>('Bengali');

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchSearch =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [campaigns, statusFilter, searchQuery]);

  // Target audience count calculation for active form
  const targetAudienceForForm = useMemo(() => {
    const seg = allSegments.find(s => s.id === campaignForm.segmentId);
    if (!seg) return customers;
    return filterCustomersBySegment(customers, seg, spectacleOrders, visits);
  }, [allSegments, campaignForm.segmentId, customers, spectacleOrders, visits]);

  const handleOpenCreateModal = (segId?: string) => {
    setEditingCampaignId(null);
    const targetSeg = allSegments.find(s => s.id === segId) || allSegments[0];
    const initialTpl = templates[0];

    setCampaignForm({
      name: '',
      type: 'Seasonal',
      status: 'Draft',
      segmentId: targetSeg?.id || 'SEG-ALL-01',
      segmentName: targetSeg?.name || 'All Customers',
      customMessageBengali: initialTpl?.messageBengali || 'শ্রদ্ধেয় {Customer_Name}, {Shop_Name}-এ পাচ্ছেন আকর্ষণীয় ছাড়!',
      customMessageEnglish: initialTpl?.messageEnglish || 'Dear {Customer_Name}, enjoy exclusive offers at {Shop_Name}!',
      ctaType: 'WhatsApp',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      metrics: {
        targetCount: 0,
        sentCount: 0,
        deliveredCount: 0,
        readCount: 0,
        failedCount: 0,
        responsesCount: 0,
        convertedCount: 0,
        salesAmount: 0,
        costAmount: 0,
        profitAmount: 0,
        roiPercent: 0
      }
    });
    setShowWizard(true);
  };

  const handleOpenEditModal = (campaign: MarketingCampaign) => {
    setEditingCampaignId(campaign.id);
    setCampaignForm({ ...campaign });
    setShowWizard(true);
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.name?.trim()) {
      showToast('Please enter campaign title', 'error');
      return;
    }

    const targetSeg = allSegments.find(s => s.id === campaignForm.segmentId) || allSegments[0];
    const audience = targetSeg ? filterCustomersBySegment(customers, targetSeg, spectacleOrders, visits) : customers;

    const campaignToSave: MarketingCampaign = {
      id: editingCampaignId || `CMP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      name: campaignForm.name.trim(),
      type: (campaignForm.type as CampaignType) || 'Seasonal',
      status: (campaignForm.status as CampaignStatus) || 'Draft',
      segmentId: targetSeg?.id || 'SEG-ALL-01',
      segmentName: targetSeg?.name || 'All Customers',
      targetCount: audience.length,
      customMessageBengali: campaignForm.customMessageBengali || '',
      customMessageEnglish: campaignForm.customMessageEnglish || '',
      offerId: campaignForm.offerId,
      offerName: campaignForm.offerName,
      discountValue: campaignForm.discountValue,
      ctaType: 'WhatsApp',
      startDate: campaignForm.startDate || new Date().toISOString().split('T')[0],
      endDate: campaignForm.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      metrics: campaignForm.metrics || {
        targetCount: audience.length,
        sentCount: 0,
        deliveredCount: 0,
        readCount: 0,
        failedCount: 0,
        responsesCount: 0,
        convertedCount: 0,
        salesAmount: 0,
        costAmount: 0,
        profitAmount: 0,
        roiPercent: 0
      },
      createdAt: campaignForm.createdAt || new Date().toISOString().split('T')[0]
    };

    saveCampaign(campaignToSave);
    setShowWizard(false);
  };

  // Broadcast campaign to audience
  const handleBroadcastCampaign = (campaign: MarketingCampaign) => {
    const targetSeg = allSegments.find(s => s.id === campaign.segmentId);
    const audience = targetSeg ? filterCustomersBySegment(customers, targetSeg, spectacleOrders, visits) : customers;

    if (audience.length === 0) {
      showToast('No customers in this campaign segment to broadcast to', 'warning');
      return;
    }

    // Open first contact on WhatsApp web or show broadcast batching
    const firstCust = audience[0];
    const msg = replaceTemplateVariables(
      selectedLanguage === 'Bengali' ? (campaign.customMessageBengali || campaign.customMessageEnglish || '') : (campaign.customMessageEnglish || campaign.customMessageBengali || ''),
      {
        customer: firstCust,
        offerName: campaign.offerName
      },
      settings
    );

    // Update campaign metrics
    const updatedMetrics = {
      ...(campaign.metrics || {
        targetCount: audience.length,
        sentCount: 0,
        deliveredCount: 0,
        readCount: 0,
        failedCount: 0,
        responsesCount: 0,
        convertedCount: 0,
        salesAmount: 0,
        costAmount: 0,
        profitAmount: 0,
        roiPercent: 0
      }),
      sentCount: (campaign.metrics?.sentCount || 0) + audience.length,
      deliveredCount: (campaign.metrics?.deliveredCount || 0) + Math.round(audience.length * 0.96)
    };

    saveCampaign({
      ...campaign,
      status: 'Running',
      metrics: updatedMetrics
    });

    logCommunication({
      customerId: firstCust.customerId,
      customerName: firstCust.name,
      mobile: firstCust.mobile,
      campaignId: campaign.id,
      campaignName: campaign.name,
      messageType: 'Campaign Broadcast',
      category: campaign.type,
      messageText: msg,
      channel: 'WhatsApp',
      status: 'Sent'
    });

    openWhatsAppDirect(firstCust.mobile, msg);
    showToast(`Triggered broadcast for ${audience.length} contacts! Opening WhatsApp chat for ${firstCust.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600" />
            Campaign Manager & ROI Tracker
          </h2>
          <p className="text-xs text-slate-500">
            Build targeted optical marketing campaigns, broadcast personalized WhatsApp promotions, and track sales conversion
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenAiModal('Create an optical sales campaign for Paharpur Eye Care', 'campaign')}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-600 hover:to-teal-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-100" />
            <span>AI Campaign Writer</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal()}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'Running', 'Scheduled', 'Draft', 'Completed', 'Paused'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Campaigns Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCampaigns.length === 0 ? (
          <div className="md:col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-3">
            <Target className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm">No campaigns found matching current filters.</p>
            <button
              onClick={() => handleOpenCreateModal()}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Campaign</span>
            </button>
          </div>
        ) : (
          filteredCampaigns.map(cmp => {
            const seg = allSegments.find(s => s.id === cmp.segmentId);
            const audienceCount = seg ? filterCustomersBySegment(customers, seg, spectacleOrders, visits).length : cmp.targetCount;
            const sales = cmp.metrics?.salesAmount || 0;
            const cost = cmp.metrics?.costAmount || 0;

            return (
              <div
                key={cmp.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        {cmp.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        cmp.status === 'Running' ? 'bg-emerald-100 text-emerald-800' :
                        cmp.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        cmp.status === 'Scheduled' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {cmp.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{cmp.name}</h3>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Segment: <span className="font-semibold text-slate-700">{cmp.segmentName || seg?.name || 'All Customers'}</span> • {audienceCount} Targets
                    </div>
                  </div>

                  {/* Top Right Controls */}
                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => duplicateCampaign(cmp.id)}
                      className="p-1.5 hover:text-teal-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Duplicate Campaign"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(cmp)}
                      className="p-1.5 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit Campaign"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete campaign "${cmp.name}"?`)) {
                          deleteCampaign(cmp.id);
                        }
                      }}
                      className="p-1.5 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Snippet */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 italic line-clamp-2">
                  "{cmp.customMessageBengali || cmp.customMessageEnglish}"
                </div>

                {/* Performance Metrics Cards */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-center">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Sent / Targets</div>
                    <div className="text-xs font-bold text-slate-800">{cmp.metrics?.sentCount || 0} / {audienceCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Sales Generated</div>
                    <div className="text-xs font-bold text-emerald-700">{formatCurrency(sales)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Estimated ROI</div>
                    <div className="text-xs font-bold text-teal-700">{cmp.metrics?.roiPercent || 0}%</div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Created {formatDate(cmp.createdAt)}
                  </div>

                  <div className="flex items-center gap-2">
                    {cmp.status === 'Running' ? (
                      <button
                        onClick={() => toggleCampaignStatus(cmp.id, 'Paused')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <Pause className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pause</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleCampaignStatus(cmp.id, 'Running')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Resume</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleBroadcastCampaign(cmp)}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Broadcast WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Campaign Creation / Edit Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600" />
                {editingCampaignId ? 'Edit Marketing Campaign' : 'Create New Optical Campaign'}
              </h3>
              <button
                onClick={() => setShowWizard(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Poila Boishakh 20% Off on Progressive Lenses"
                    value={campaignForm.name}
                    onChange={e => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Campaign Category</label>
                  <select
                    value={campaignForm.type}
                    onChange={e => setCampaignForm({ ...campaignForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    <option value="Seasonal">Seasonal Offer</option>
                    <option value="Festive">Festival Special</option>
                    <option value="Product Launch">New Lens / Frame Launch</option>
                    <option value="Discount Offer">Discount Offer</option>
                    <option value="Reactivation">Reactivation / Win-back</option>
                    <option value="Eye Recall">Annual Eye Recall</option>
                    <option value="Due Recovery">Due Payment Recovery</option>
                    <option value="Birthday">Birthday Privilege</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* Target Segment Selection */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Target Audience Segment *</span>
                  <span className="text-teal-600 font-bold">
                    {targetAudienceForForm.length} Matching Contacts
                  </span>
                </label>
                <select
                  value={campaignForm.segmentId}
                  onChange={e => {
                    const found = allSegments.find(s => s.id === e.target.value);
                    setCampaignForm({
                      ...campaignForm,
                      segmentId: e.target.value,
                      segmentName: found?.name || 'Selected Segment'
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                >
                  {allSegments.map(seg => {
                    const c = filterCustomersBySegment(customers, seg, spectacleOrders, visits).length;
                    return (
                      <option key={seg.id} value={seg.id}>
                        {seg.name} ({c} contacts)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Optional Offer Code & Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Offer Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Poila Boishakh Special"
                    value={campaignForm.offerName || ''}
                    onChange={e => setCampaignForm({ ...campaignForm, offerName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Discount Value (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 20"
                    value={campaignForm.discountValue || ''}
                    onChange={e => setCampaignForm({ ...campaignForm, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Message Composer with Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">WhatsApp Message Content *</label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage('Bengali')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        selectedLanguage === 'Bengali' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-500'
                      }`}
                    >
                      বাংলা (Bengali)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage('English')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        selectedLanguage === 'English' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-500'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {selectedLanguage === 'Bengali' ? (
                  <textarea
                    rows={4}
                    required
                    placeholder="শ্রদ্ধেয় {Customer_Name}, পাহাড়পুর আই কেয়ারে আপনার জন্য বিশেষ অফার..."
                    value={campaignForm.customMessageBengali}
                    onChange={e => setCampaignForm({ ...campaignForm, customMessageBengali: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs leading-relaxed"
                  />
                ) : (
                  <textarea
                    rows={4}
                    placeholder="Dear {Customer_Name}, exclusive privilege discounts await you at {Shop_Name}..."
                    value={campaignForm.customMessageEnglish}
                    onChange={e => setCampaignForm({ ...campaignForm, customMessageEnglish: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs leading-relaxed"
                  />
                )}

                {/* Variable helper pills */}
                <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500 pt-1">
                  <span>Insert Tags:</span>
                  {['{Customer_Name}', '{Discount}', '{Offer_Code}', '{Shop_Name}', '{Shop_Mobile}'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (selectedLanguage === 'Bengali') {
                          setCampaignForm({
                            ...campaignForm,
                            customMessageBengali: (campaignForm.customMessageBengali || '') + ` ${tag} `
                          });
                        } else {
                          setCampaignForm({
                            ...campaignForm,
                            customMessageEnglish: (campaignForm.customMessageEnglish || '') + ` ${tag} `
                          });
                        }
                      }}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded font-mono text-slate-700"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status & Schedule */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Initial Status</label>
                  <select
                    value={campaignForm.status}
                    onChange={e => setCampaignForm({ ...campaignForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Running">Running / Active</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Estimated Cost Budget (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={campaignForm.metrics?.costAmount || ''}
                    onChange={e => setCampaignForm({
                      ...campaignForm,
                      metrics: {
                        ...(campaignForm.metrics || {
                          targetCount: 0,
                          sentCount: 0,
                          deliveredCount: 0,
                          readCount: 0,
                          failedCount: 0,
                          responsesCount: 0,
                          convertedCount: 0,
                          salesAmount: 0,
                          profitAmount: 0,
                          roiPercent: 0,
                          costAmount: 0
                        }),
                        costAmount: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWizard(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Campaign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
