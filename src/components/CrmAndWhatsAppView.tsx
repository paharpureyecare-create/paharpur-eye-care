import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { Customer, OfferPromotion } from '../types';
import {
  LayoutDashboard,
  Users,
  Target,
  Clock,
  Flame,
  MessageSquare,
  History,
  Sparkles,
  Send,
  Calendar,
  X
} from 'lucide-react';

import { CrmDashboard } from './crm/CrmDashboard';
import { CustomerSegmentationView } from './crm/CustomerSegmentationView';
import { CampaignManagerView } from './crm/CampaignManagerView';
import { AutomationRulesView } from './crm/AutomationRulesView';
import { LeadManagerView } from './crm/LeadManagerView';
import { TemplateAndOfferManagerView } from './crm/TemplateAndOfferManagerView';
import { CommunicationLogsAndCalendarView } from './crm/CommunicationLogsAndCalendarView';
import { AiMarketingAssistantModal } from './crm/AiMarketingAssistantModal';
import { openWhatsAppDirect, replaceTemplateVariables } from './crm/crmUtils';

export const CrmAndWhatsAppView: React.FC = () => {
  const {
    customers = [],
    settings,
    logCommunication,
    showToast
  } = useErp();

  // Active CRM Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'segments' | 'campaigns' | 'automation' | 'leads' | 'templates' | 'logs'
  >('dashboard');

  // AI Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMode, setAiMode] = useState<'campaign' | 'writer' | 'insights'>('campaign');

  // Direct Custom WhatsApp Modal State
  const [showDirectMsgModal, setShowDirectMsgModal] = useState(false);
  const [directMobile, setDirectMobile] = useState('');
  const [directName, setDirectName] = useState('');
  const [directText, setDirectText] = useState('');

  // Target Segment for Campaign Modal
  const [preselectedSegmentId, setPreselectedSegmentId] = useState<string | undefined>(undefined);

  // Handlers
  const handleOpenAiModal = (initialPrompt?: string, mode?: 'campaign' | 'writer' | 'insights') => {
    setAiPrompt(initialPrompt || '');
    setAiMode(mode || 'campaign');
    setShowAiModal(true);
  };

  const handleOpenDirectMsgToCustomer = (customer: Customer) => {
    setDirectName(customer.name);
    setDirectMobile(customer.mobile);
    setDirectText(
      `শ্রদ্ধেয় ${customer.name}, পাহাড়পুর আই কেয়ারের পক্ষ থেকে আন্তরিক শুভেচ্ছা! আপনার চোখের সুস্থতা ও চশমা সংক্রান্ত যেকোনো প্রয়োজনে আমরা সর্বদা প্রস্তুত। হেল্পলাইন: ${settings.whatsapp || settings.mobile || '+91 98301 23456'}।`
    );
    setShowDirectMsgModal(true);
  };

  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMobile.trim() || !directText.trim()) {
      showToast('Please provide mobile number and message content', 'error');
      return;
    }

    logCommunication({
      customerId: 'DIRECT',
      customerName: directName || 'Customer',
      mobile: directMobile,
      messageType: 'Direct WhatsApp',
      category: 'Custom Message',
      messageText: directText,
      channel: 'WhatsApp',
      status: 'Sent'
    });

    openWhatsAppDirect(directMobile, directText);
    setShowDirectMsgModal(false);
    showToast(`Opening WhatsApp chat for ${directName || directMobile}`);
  };

  const handleOpenNewCampaign = (segmentId?: string) => {
    setPreselectedSegmentId(segmentId);
    setActiveTab('campaigns');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Main Navigation Bar for Marketing CRM */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-2 sticky top-0 z-20 backdrop-blur-md bg-white/95">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'dashboard'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('segments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'segments'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Smart Segments</span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'campaigns'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Campaigns & ROI</span>
          </button>

          <button
            onClick={() => setActiveTab('automation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'automation'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Automations & Recall</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'leads'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Leads & Inquiries</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'templates'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Templates & Offers</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'logs'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit & Calendar</span>
          </button>
        </div>

        {/* Global Top-Right Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAiModal('', 'campaign')}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-600 hover:to-teal-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-100" />
            <span className="hidden sm:inline">AI Marketing Assistant</span>
          </button>

          <button
            onClick={() => {
              setDirectName('');
              setDirectMobile('');
              setDirectText('');
              setShowDirectMsgModal(true);
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Quick Message</span>
          </button>
        </div>
      </div>

      {/* Main View Router */}
      {activeTab === 'dashboard' && (
        <CrmDashboard
          onNavigateTab={tab => setActiveTab(tab as any)}
          onOpenAiModal={handleOpenAiModal}
          onOpenDirectMsgModal={() => setShowDirectMsgModal(true)}
          onOpenNewCampaignModal={handleOpenNewCampaign}
        />
      )}

      {activeTab === 'segments' && (
        <CustomerSegmentationView
          onOpenNewCampaignModal={handleOpenNewCampaign}
          onOpenDirectMsgToCustomer={handleOpenDirectMsgToCustomer}
        />
      )}

      {activeTab === 'campaigns' && (
        <CampaignManagerView
          onOpenAiModal={handleOpenAiModal}
          initialSegmentId={preselectedSegmentId}
        />
      )}

      {activeTab === 'automation' && <AutomationRulesView />}

      {activeTab === 'leads' && <LeadManagerView />}

      {activeTab === 'templates' && (
        <TemplateAndOfferManagerView
          onLaunchCampaignFromOffer={offer => {
            setActiveTab('campaigns');
            handleOpenNewCampaign();
          }}
        />
      )}

      {activeTab === 'logs' && <CommunicationLogsAndCalendarView />}

      {/* AI Marketing Assistant Modal */}
      <AiMarketingAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        initialPrompt={aiPrompt}
        initialMode={aiMode}
      />

      {/* Direct Custom WhatsApp Message Modal */}
      {showDirectMsgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                Direct WhatsApp Message
              </h3>
              <button
                onClick={() => setShowDirectMsgModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendDirectMessage} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Subir Karmakar"
                  value={directName}
                  onChange={e => setDirectName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Mobile / WhatsApp Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9830123456"
                  value={directMobile}
                  onChange={e => setDirectMobile(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Message Text *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write message in Bengali or English..."
                  value={directText}
                  onChange={e => setDirectText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDirectMsgModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
