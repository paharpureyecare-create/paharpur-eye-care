import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  History,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  Sparkles,
  Send,
  Glasses
} from 'lucide-react';
import { formatDate, openWhatsAppDirect } from './crmUtils';

export const CommunicationLogsAndCalendarView: React.FC = () => {
  const {
    communicationLogs = [],
    campaigns = [],
    customers = [],
    showToast
  } = useErp();

  const [activeTab, setActiveTab] = useState<'logs' | 'calendar'>('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Optometry & Cultural Calendar Events
  const opticalCalendarEvents = [
    {
      month: 'March',
      day: '12-18',
      title: 'World Glaucoma Awareness Week',
      description: 'Promote IOP pressure checks and comprehensive eye screenings for 40+ age group',
      recommendedCategory: 'Eye Checkup Reminder',
      theme: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      month: 'April',
      day: '15',
      title: 'Poila Boishakh (Bengali New Year)',
      description: 'Major retail festive shopping! Launch 20% discount on progressive & designer frames',
      recommendedCategory: 'Festival Special',
      theme: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      month: 'June',
      day: '01-15',
      title: 'Back-to-School & College Eye Test',
      description: 'Screen-time protection & blue-cut UV420 lenses for students before new academic term',
      recommendedCategory: 'Product Launch',
      theme: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    {
      month: 'October',
      day: '08',
      title: 'World Sight Day',
      description: 'Global vision awareness! Offer free routine visual acuity screening to all walk-in patients',
      recommendedCategory: 'Annual Vision Recall',
      theme: 'bg-purple-50 text-purple-800 border-purple-200'
    },
    {
      month: 'October',
      day: '20-25',
      title: 'Durga Puja Grand Festive Sale',
      description: 'Highest eyewear purchase season in Bengal. Premium frame and lens festival bundle',
      recommendedCategory: 'Festival Special',
      theme: 'bg-rose-50 text-rose-800 border-rose-200'
    },
    {
      month: 'November',
      day: '14',
      title: 'World Diabetes Day (Diabetic Retinopathy)',
      description: 'Encourage diabetic patients to undergo dilated fundus/retina evaluations',
      recommendedCategory: 'Follow-up Reminder',
      theme: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    }
  ];

  const filteredLogs = useMemo(() => {
    return communicationLogs.filter(log => {
      const matchCat = categoryFilter === 'ALL' || log.category === categoryFilter;
      const matchSearch =
        !searchQuery.trim() ||
        log.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.mobile.includes(searchQuery) ||
        (log.messageText && log.messageText.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [communicationLogs, categoryFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {activeTab === 'logs' ? (
              <History className="w-5 h-5 text-teal-600" />
            ) : (
              <Calendar className="w-5 h-5 text-indigo-600" />
            )}
            {activeTab === 'logs' ? 'Communication Logs & Audit Trail' : 'Optical Marketing Calendar'}
          </h2>
          <p className="text-xs text-slate-500">
            {activeTab === 'logs'
              ? 'Real-time timeline of all automated and manual WhatsApp messages dispatched from Paharpur Eye Care'
              : 'Optometry healthcare dates and festive shopping milestones for optical practice growth'}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'logs' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-600'
            }`}
          >
            Audit Logs ({communicationLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'calendar' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-600'
            }`}
          >
            Optical Calendar ({opticalCalendarEvents.length})
          </button>
        </div>
      </div>

      {/* TAB 1: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {['ALL', 'Spectacle Ready', 'Due Payment Reminder', 'Campaign Broadcast', 'Automation Trigger', 'Appointment Confirmation'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    categoryFilter === cat
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search recipient or content..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Message Snippet</th>
                    <th className="py-2.5 px-3">Channel / Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No communication logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {formatDate(log.sentAt || log.timestamp)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{log.customerName}</div>
                          <div className="text-[10px] text-slate-400">{log.mobile}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                            {log.category || log.messageType}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-xs truncate text-slate-700">
                          {log.messageText}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp Sent</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              openWhatsAppDirect(log.mobile, log.messageText);
                              showToast(`Resending message to ${log.customerName}`);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3 text-teal-600" />
                            <span>Resend</span>
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
      )}

      {/* TAB 2: OPTICAL MARKETING CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {opticalCalendarEvents.map((evt, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {evt.month} ({evt.day})
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${evt.theme}`}>
                      {evt.recommendedCategory}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{evt.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-teal-700 font-medium">Recommended Promotion</span>
                  <button
                    onClick={() => {
                      showToast(`Planning campaign for ${evt.title}`);
                    }}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Plan Strategy</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
