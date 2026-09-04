import React from 'react';
import { useErp } from '../../context/ErpContext';
import {
  Users,
  Send,
  Sparkles,
  TrendingUp,
  DollarSign,
  Glasses,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  Layers,
  MessageSquare,
  Flame,
  Target,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { formatCurrency, formatDate } from './crmUtils';

interface CrmDashboardProps {
  onNavigateTab: (tab: 'dashboard' | 'campaigns' | 'segments' | 'automation' | 'leads' | 'templates' | 'logs') => void;
  onOpenAiModal: (initialPrompt?: string, mode?: 'campaign' | 'writer' | 'insights') => void;
  onOpenDirectMsgModal: () => void;
  onOpenNewCampaignModal: (preselectedSegment?: string) => void;
}

export const CrmDashboard: React.FC<CrmDashboardProps> = ({
  onNavigateTab,
  onOpenAiModal,
  onOpenDirectMsgModal,
  onOpenNewCampaignModal
}) => {
  const {
    customers = [],
    campaigns = [],
    leads = [],
    automationRules = [],
    spectacleOrders = [],
    communicationLogs = [],
    settings
  } = useErp();

  // Computations for KPI metrics
  const totalCustomers = customers.length;
  const optedInCount = customers.filter(c => !c.whatsappMarketingStatus || c.whatsappMarketingStatus === 'Opted In').length;
  const optInPercentage = totalCustomers > 0 ? Math.round((optedInCount / totalCustomers) * 100) : 100;

  const activeCampaigns = campaigns.filter(c => c.status === 'Running' || c.status === 'Scheduled');
  
  const totalSalesFromCampaigns = campaigns.reduce((acc, c) => acc + (c.metrics?.salesAmount || 0), 0);
  const totalCampaignCost = campaigns.reduce((acc, c) => acc + (c.metrics?.costAmount || 0), 0);
  const netProfit = totalSalesFromCampaigns - totalCampaignCost;
  const overallRoi = totalCampaignCost > 0 ? Math.round((netProfit / totalCampaignCost) * 100) : (totalSalesFromCampaigns > 0 ? 350 : 0);

  const totalConvertedLeads = leads.filter(l => l.stage === 'Purchased').length;
  const leadConversionRate = leads.length > 0 ? Math.round((totalConvertedLeads / leads.length) * 100) : 0;

  const totalMessagesSent = communicationLogs.length + campaigns.reduce((acc, c) => acc + (c.metrics?.sentCount || 0), 0);

  // Ready orders waiting for delivery message
  const readyOrders = spectacleOrders.filter(o => o.status === 'Ready');
  // Customers with outstanding dues
  const customersWithDue = customers.filter(c => (c.outstandingDue || 0) > 0);
  const totalOutstandingDue = customersWithDue.reduce((acc, c) => acc + (c.outstandingDue || 0), 0);

  // Active automations count
  const activeAutomationsCount = automationRules.filter(r => r.enabled).length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Optical Business Theme */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-teal-800/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Optical Business Growth Engine
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100">
              WhatsApp CRM & Marketing Automation
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Target high-value optical patients, automate spectacle pickup alerts & annual vision recalls, and maximize optical practice revenue with Gemini AI intelligence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenAiModal('', 'campaign')}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-600 hover:to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-teal-950/40 flex items-center gap-2 text-sm transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
              <span>AI Marketing Assistant</span>
            </button>

            <button
              onClick={() => onOpenNewCampaignModal()}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium shadow-md flex items-center gap-2 text-sm transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>

            <button
              onClick={onOpenDirectMsgModal}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-medium text-sm flex items-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Direct WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Customers & Opt-in */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Audience Base</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalCustomers}</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{optInPercentage}% Opted-in</span>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Campaigns</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeCampaigns.length}</div>
          <div className="mt-1 text-xs text-slate-500">
            {campaigns.length} Total Registered
          </div>
        </div>

        {/* Marketing Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Sales Generated</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{formatCurrency(totalSalesFromCampaigns)}</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>{overallRoi}% Estimated ROI</span>
          </div>
        </div>

        {/* Converted Leads */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Leads Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{leads.length}</div>
          <div className="mt-1 text-xs text-amber-700 font-medium">
            {totalConvertedLeads} Converted ({leadConversionRate}%)
          </div>
        </div>

        {/* Ready Deliveries */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Spectacle Ready</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Glasses className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-700">{readyOrders.length}</div>
          <div className="mt-1 text-xs text-blue-600 font-medium">
            Awaiting Pickup Alert
          </div>
        </div>

        {/* Active Automations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Automations</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-700">{activeAutomationsCount}</div>
          <div className="mt-1 text-xs text-slate-500">
            {automationRules.length} Rules Setup
          </div>
        </div>
      </div>

      {/* Immediate Optical Action Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Trigger 1: Spectacle Delivery Pickup Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Glasses className="w-3.5 h-3.5" />
                Optical Delivery
              </span>
              <span className="text-xs font-bold text-slate-400">{readyOrders.length} Ready</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Spectacle Pickup Notifications</h3>
            <p className="text-xs text-slate-600">
              Notify patients whose glasses and lenses have arrived and are fitted. Sends balance due amount and clinic pickup hours.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('segments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View {readyOrders.length} Patients</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenNewCampaignModal('SEG-READY-01')}
              disabled={readyOrders.length === 0}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Broadcast Ready Alert</span>
            </button>
          </div>
        </div>

        {/* Trigger 2: Due Payment Recovery */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <DollarSign className="w-3.5 h-3.5" />
                Cashflow Recovery
              </span>
              <span className="text-xs font-bold text-amber-700">{formatCurrency(totalOutstandingDue)}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Outstanding Due Recovery</h3>
            <p className="text-xs text-slate-600">
              Send polite, personalized WhatsApp payment reminders with invoice details to {customersWithDue.length} customers with pending balance.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('segments')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>{customersWithDue.length} Due Customers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenNewCampaignModal('SEG-DUE-01')}
              disabled={customersWithDue.length === 0}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Send Due Reminders</span>
            </button>
          </div>
        </div>

        {/* Trigger 3: Annual Vision Recall & Checkup */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Calendar className="w-3.5 h-3.5" />
                Vision Health Recall
              </span>
              <span className="text-xs font-bold text-emerald-700">Annual Checkup</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Annual Eye Checkup Recall</h3>
            <p className="text-xs text-slate-600">
              Recall patients whose prescriptions are 10-12 months old for eye health evaluations and new lens upgrades (Anti-Glare / Progressive).
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('segments')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Inspect Recall Audience</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenNewCampaignModal('SEG-RECALL-01')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Trigger Recall Blast</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Campaigns Overview + AI Growth Insights & Lead Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active & Recent Campaigns Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Campaign Performance & ROI</h2>
              <p className="text-xs text-slate-500">Real-time status of promotional, recall, and retention broadcasts</p>
            </div>
            <button
              onClick={() => onNavigateTab('campaigns')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View All ({campaigns.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Campaign Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Sales / ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.slice(0, 5).map(cmp => (
                  <tr key={cmp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{cmp.name}</div>
                      <div className="text-[11px] text-slate-400">Created {formatDate(cmp.createdAt)}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {cmp.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {cmp.targetCount || 0} Contacts
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        cmp.status === 'Running' ? 'bg-emerald-100 text-emerald-800' :
                        cmp.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        cmp.status === 'Scheduled' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {cmp.status === 'Running' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                        {cmp.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-bold text-slate-900">{formatCurrency(cmp.metrics?.salesAmount || 0)}</div>
                      <div className="text-[11px] text-emerald-600 font-medium">ROI: {cmp.metrics?.roiPercent || 0}%</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: AI Growth Insights & Quick Lead Pipeline */}
        <div className="space-y-6">
          {/* AI Growth Opportunities Card */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 text-white p-5 rounded-2xl border border-indigo-800/40 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                AI Optical Growth Insights
              </div>
              <button
                onClick={() => onOpenAiModal('', 'insights')}
                className="text-[11px] text-teal-300 hover:underline"
              >
                Analyze Base
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-200">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => onOpenAiModal('How to win back inactive spectacle wearers with Progressive lens offers?', 'campaign')}
              >
                <div className="font-bold text-teal-300">💡 Progressive Lens Upsell</div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Over 40+ age group single-vision customers can be educated on seamless progressive optics.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => onOpenAiModal('Blue-cut computer glasses promotion for students and IT professionals', 'campaign')}
              >
                <div className="font-bold text-amber-300">💻 Screen-Time Protection Campaign</div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Promote Blue-Guard UV420 lenses for students & professionals experiencing eye strain.
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenAiModal('Generate full optical marketing plan for Paharpur Eye Care', 'insights')}
              className="w-full py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask Gemini AI Marketing Strategy</span>
            </button>
          </div>

          {/* Quick Lead Flow Summary */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Optical Leads & Inquiries
              </h3>
              <button
                onClick={() => onNavigateTab('leads')}
                className="text-xs text-teal-600 font-semibold hover:underline"
              >
                Pipeline ({leads.length})
              </button>
            </div>

            <div className="space-y-2">
              {leads.slice(0, 3).map(lead => (
                <div key={lead.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{lead.name}</div>
                    <div className="text-[11px] text-slate-500">{lead.interest} • {lead.source}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    lead.stage === 'Purchased' ? 'bg-emerald-100 text-emerald-800' :
                    lead.stage === 'Follow-up' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {lead.stage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
