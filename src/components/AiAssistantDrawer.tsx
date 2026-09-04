import React, { useState, useRef, useEffect } from 'react';
import { useErp } from '../context/ErpContext';
import { AiMessage, sendQueryToAiAssistant } from '../services/aiService';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Mic,
  MicOff,
  CornerDownLeft,
  Glasses,
  ShoppingBag,
  Users,
  CreditCard,
  Disc,
  FileText,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const erp = useErp();
  const {
    patients,
    customers,
    spectacleOrders,
    retailSales,
    lenses,
    frames,
    visits,
    appointments,
    payments,
    setActiveTab,
    setSelectedPatientFor360,
    setSelectedCustomerFor360
  } = erp;

  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'স্বাগতম! আমি **PAHARPUR ERP AI ASSISTANT**।\n\nআপনি বাংলা, English বা Banglish-এ যেকোনো প্রশ্ন করতে পারেন।\nযেমন: আজকের মোট বিক্রি, বকেয়া কাস্টমার তালিকা, লেন্স পাওয়ার স্টক, প্রেসক্রিপশন হিস্ট্রি ইত্যাদি।',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionButtons: [
        { label: '📊 আজকের হিসাব (Today Sales)', type: 'invoice', payload: null },
        { label: '💳 বকেয়া তালিকা (Dues)', type: 'customer', payload: null },
        { label: '👓 রেডি চশমার তালিকা', type: 'order', payload: null },
        { label: '📦 লেন্স স্টক চেক', type: 'lens', payload: null }
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: AiMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const aiReply = await sendQueryToAiAssistant(textToSend, {
        patients,
        customers,
        spectacleOrders,
        retailSales,
        lenses,
        frames,
        visits,
        appointments,
        payments
      }, messages);

      setMessages(prev => [...prev, aiReply]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'দুঃখিত, কোনো ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  const handleActionButton = (btn: any) => {
    if (btn.type === 'patient') {
      if (btn.payload) setSelectedPatientFor360(btn.payload);
      setActiveTab('patients');
      onClose();
    } else if (btn.type === 'customer') {
      if (btn.payload) setSelectedCustomerFor360(btn.payload);
      setActiveTab('customers');
      onClose();
    } else if (btn.type === 'order') {
      setActiveTab('spectacles');
      onClose();
    } else if (btn.type === 'invoice') {
      setActiveTab('retail-sales');
      onClose();
    } else if (btn.type === 'lens') {
      setActiveTab('lens-inventory');
      onClose();
    } else if (btn.type === 'whatsapp') {
      setActiveTab('crm');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-center justify-between border-b border-teal-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/30 flex items-center justify-center border border-teal-400/40 text-teal-200 shadow-inner">
              <Sparkles className="w-5 h-5 text-teal-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base tracking-tight text-white">PAHARPUR ERP AI</h2>
                <span className="text-[10px] bg-teal-400/20 text-teal-200 border border-teal-400/30 px-2 py-0.5 rounded-full font-semibold">
                  Bangla / English
                </span>
              </div>
              <p className="text-xs text-teal-100/70">Autonomous Optical & Clinical Copilot</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Quick:
          </span>
          <button
            onClick={() => handleSend('আজকে কত টাকার sale হয়েছে?')}
            className="px-2.5 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-semibold rounded-lg border border-slate-200 shrink-0 transition-colors"
          >
            📊 আজকের বিক্রি
          </button>
          <button
            onClick={() => handleSend('যাদের due আছে তাদের লিস্ট দেখাও')}
            className="px-2.5 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-semibold rounded-lg border border-slate-200 shrink-0 transition-colors"
          >
            💳 মোট বকেয়া
          </button>
          <button
            onClick={() => handleSend('টপ সেলিং লেন্স ও ফ্রেম কোনগুলো?')}
            className="px-2.5 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-semibold rounded-lg border border-slate-200 shrink-0 transition-colors"
          >
            🏆 বেস্ট সেলার
          </button>
          <button
            onClick={() => handleSend('রেডি চশমার অর্ডার স্ট্যাটাস দেখাও')}
            className="px-2.5 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-semibold rounded-lg border border-slate-200 shrink-0 transition-colors"
          >
            👓 চশমা স্ট্যাটাস
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 custom-scrollbar">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-teal-700 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans space-y-1">
                  {m.text}
                </div>

                {/* Contextual Action Buttons */}
                {m.actionButtons && m.actionButtons.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {m.actionButtons.map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionButton(btn)}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] border border-teal-200 flex items-center gap-1 transition-all hover:scale-105"
                      >
                        <span>{btn.label}</span>
                        <ArrowRight className="w-3 h-3 text-teal-600" />
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1 text-right font-medium ${
                    m.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1 text-slate-600">ERP ডাটাবেস যাচাই করা হচ্ছে...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleSpeechRecognition}
              title="Voice Input (বাংলা/English)"
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="যেকোনো প্রশ্ন লিখুন (e.g. সোনিয়া খাতুনের শেষ চশমার পাওয়ার...)"
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs transition-transform hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex justify-between items-center mt-2 px-1 text-[10px] text-slate-500">
            <span>🔒 Safe & controlled read-only ERP intelligence</span>
            <span>Natural language search active</span>
          </div>
        </div>

      </div>
    </div>
  );
};
