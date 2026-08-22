import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import {
  MessageSquare,
  Send,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  Phone,
  Glasses,
  Calendar,
  CreditCard,
  Heart
} from 'lucide-react';

export const CrmAndWhatsAppView: React.FC = () => {
  const {
    patients,
    spectacleOrders,
    dueAccounts,
    appointments,
    settings,
    showToast
  } = useErp();

  const [activeSegment, setActiveSegment] = useState<'ready-orders' | 'follow-up' | 'due-recovery' | 'annual' | 'custom'>('ready-orders');
  const [language, setLanguage] = useState<'Bengali' | 'English'>('Bengali');
  const [customMsg, setCustomMsg] = useState('');
  const [customMobile, setCustomMobile] = useState('');

  // 1. Ready Spectacle Orders
  const readyOrders = spectacleOrders.filter(o => o.status === 'Ready');

  // 2. Follow-up Due (Patients whose follow-up was 7-30 days ago or upcoming)
  const followUpPatients = appointments.filter(a => a.visitType.includes('Follow') || a.status === 'Confirmed');

  // 3. Due Accounts
  const dueRecipients = dueAccounts.filter(d => d.dueAmount > 0);

  const handleSendWhatsApp = (mobile: string, message: string) => {
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    const fullNumber = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${fullNumber}?text=${encoded}`, '_blank');
    showToast(`WhatsApp message opened for +${fullNumber}`);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              CRM & WhatsApp Automation (হোয়াটসঅ্যাপ ও রোগী যোগাযোগ)
            </h1>
            <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              1-Click Smart Messaging
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Automated notifications for Spectacle Delivery Ready, Due Collections, Follow-up alerts & Annual recalls
          </p>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setLanguage('Bengali')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              language === 'Bengali' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            বাংলা (Bengali)
          </button>
          <button
            onClick={() => setLanguage('English')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              language === 'English' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Segments Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        
        {/* Spectacle Ready */}
        <button
          onClick={() => setActiveSegment('ready-orders')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeSegment === 'ready-orders'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Glasses className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">
              {readyOrders.length}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-900 mt-2">Spectacle Ready</p>
          <span className="text-[10px] text-slate-500">Pickup ready alerts</span>
        </button>

        {/* Due Balance Recovery */}
        <button
          onClick={() => setActiveSegment('due-recovery')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeSegment === 'due-recovery'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <CreditCard className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-black bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded">
              {dueRecipients.length}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-900 mt-2">Due Reminders</p>
          <span className="text-[10px] text-slate-500">Unpaid balance recall</span>
        </button>

        {/* Follow-up Due */}
        <button
          onClick={() => setActiveSegment('follow-up')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeSegment === 'follow-up'
              ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-300 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-black bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded">
              {followUpPatients.length}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-900 mt-2">Follow-up Checkup</p>
          <span className="text-[10px] text-slate-500">Clinical review recall</span>
        </button>

        {/* Annual Recall */}
        <button
          onClick={() => setActiveSegment('annual')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeSegment === 'annual'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Heart className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-black bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
              {patients.length}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-900 mt-2">Annual Eye Care</p>
          <span className="text-[10px] text-slate-500">Yearly vision checkup</span>
        </button>

        {/* Custom Blast */}
        <button
          onClick={() => setActiveSegment('custom')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeSegment === 'custom'
              ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Send className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded">
              New
            </span>
          </div>
          <p className="text-xs font-bold text-slate-900 mt-2">Direct Message</p>
          <span className="text-[10px] text-slate-500">Custom WhatsApp text</span>
        </button>

      </div>

      {/* Segment Content View */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        
        {/* 1. SPECTACLE READY LIST */}
        {activeSegment === 'ready-orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-bold text-slate-900">
                Spectacle Orders Ready for Collection ({readyOrders.length})
              </h2>
              <span className="text-xs text-slate-500">
                Clicking WhatsApp generates the personalized ready slip message
              </span>
            </div>

            {readyOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No orders are currently in 'Ready' status.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {readyOrders.map(ord => {
                  const msg =
                    language === 'Bengali'
                      ? `নমস্কার ${ord.customerName} মহাশয়, পাহাড়পুর আই কেয়ার থেকে জানানো হচ্ছে যে আপনার চশমার অর্ডার (${ord.orderId}) তৈরি হয়ে গেছে। ফ্রেম: ${ord.frameBrand}। বকেয়া টাকা: ₹${ord.due}। অনুগ্রহ করে সেন্টারে এসে আপনার চশমা সংগ্রহ করুন। হেল্পলাইন: +91 98301 23456।`
                      : `Dear ${ord.customerName}, your spectacle order (${ord.orderId}) is READY for pickup at Paharpur Eye Care! Frame: ${ord.frameBrand}. Balance Due: ₹${ord.due}. Please visit our clinic counter to collect your glasses. Thank you!`;

                  return (
                    <div
                      key={ord.orderId}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{ord.customerName}</span>
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded">
                            {ord.orderId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                          {ord.mobile} • Due: <strong className="text-rose-600">₹{ord.due}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 italic">"{msg}"</p>
                      </div>

                      <button
                        onClick={() => handleSendWhatsApp(ord.mobile, msg)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0 transition-all hover:scale-105"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send Alert
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. DUE RECOVERY LIST */}
        {activeSegment === 'due-recovery' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-bold text-slate-900">
                Outstanding Due Balance Reminders ({dueRecipients.length})
              </h2>
              <span className="text-xs text-slate-500">
                Personalized friendly payment link & amount reminder
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dueRecipients.map(due => {
                const msg =
                  language === 'Bengali'
                    ? `শ্রদ্ধেয় ${due.customerName}, পাহাড়পুর আই কেয়ারের পক্ষ থেকে একটি বিনীত নিবেদন। আপনার বিল/অর্ডারের (${due.referenceId}) বকেয়া ₹${due.dueAmount} বাকি রয়েছে। আপনি সরাসরি ক্লিনিকে এসে বা ইউপিআই এর মাধ্যমে পরিশোধ করতে পারেন। ধন্যবাদ!`
                    : `Dear ${due.customerName}, polite reminder from Paharpur Eye Care: you have an outstanding due balance of ₹${due.dueAmount} for ${due.referenceId}. You may pay via UPI or at our counter. Thank you!`;

                return (
                  <div
                    key={due.id}
                    className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{due.customerName}</span>
                        <span className="text-[10px] font-extrabold bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded">
                          ₹{due.dueAmount} Due
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {due.mobile} • {due.referenceId} ({due.agingBucket})
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic">"{msg}"</p>
                    </div>

                    <button
                      onClick={() => handleSendWhatsApp(due.mobile, msg)}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0 transition-all hover:scale-105"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Due Msg
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. FOLLOW-UP CHECKUP */}
        {activeSegment === 'follow-up' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-bold text-slate-900">
                Follow-up Consultation Alerts ({followUpPatients.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {followUpPatients.map(apt => {
                const msg =
                  language === 'Bengali'
                    ? `নমস্কার ${apt.patientName} মহাশয়, পাহাড়পুর আই কেয়ারে আপনার ডাক্তারের পরামর্শ অনুযায়ী পরবর্তী চোখ পরীক্ষার সময় হয়েছে। আপনার অ্যাপয়েন্টমেন্ট শিডিউল করতে ফোন করুন: +91 98301 23456। সুস্থ থাকুন!`
                    : `Dear ${apt.patientName}, this is a reminder from Paharpur Eye Care regarding your scheduled follow-up eye examination with ${apt.doctor}. Please confirm your visit or call +91 98301 23456.`;

                return (
                  <div
                    key={apt.id}
                    className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
                        <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-1.5 py-0.2 rounded">
                          {apt.mrd}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {apt.mobile} • Doctor: {apt.doctor}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSendWhatsApp(apt.mobile, msg)}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. ANNUAL RECALL */}
        {activeSegment === 'annual' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-bold text-slate-900">
                Annual Preventive Eye Health Recall ({patients.length} Patients)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {patients.slice(0, 8).map(pat => {
                const msg =
                  language === 'Bengali'
                    ? `শ্রদ্ধেয় ${pat.name}, আপনার বার্ষিক দৃষ্টিশক্তি পরীক্ষা (Annual Vision Checkup) করার সময় হয়েছে। নিয়মিত চোখ পরীক্ষা চোখের সুস্থতা নিশ্চিত করে। পাহাড়পুর আই কেয়ারে যোগাযোগ করুন: +91 98301 23456।`
                    : `Dear ${pat.name}, it has been a year since your routine eye checkup at Paharpur Eye Care. Regular eye exams protect your vision! Book your annual appointment today: +91 98301 23456.`;

                return (
                  <div
                    key={pat.mrd}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{pat.name}</span>
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded">
                          {pat.mrd}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{pat.mobile} • {pat.village || pat.district}</p>
                    </div>

                    <button
                      onClick={() => handleSendWhatsApp(pat.mobile, msg)}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Annual Msg
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. CUSTOM DIRECT MESSAGE */}
        {activeSegment === 'custom' && (
          <div className="max-w-xl mx-auto space-y-4 py-4">
            <h2 className="text-base font-bold text-slate-900 text-center">
              Direct WhatsApp Messenger
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Recipient Mobile Number (10 digits)
                </label>
                <input
                  type="text"
                  value={customMobile}
                  onChange={e => setCustomMobile(e.target.value)}
                  placeholder="e.g. 9830123456"
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Message Body
                </label>
                <textarea
                  rows={4}
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  placeholder="Type message in Bengali or English..."
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <button
                onClick={() => {
                  if (!customMobile || !customMsg) {
                    showToast('Please enter mobile number and message', 'warning');
                    return;
                  }
                  handleSendWhatsApp(customMobile, customMsg);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                Launch WhatsApp Chat
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
