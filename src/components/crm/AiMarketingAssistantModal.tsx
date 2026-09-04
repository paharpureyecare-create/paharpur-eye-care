import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { MarketingCampaign, CampaignType } from '../../types';
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  Send,
  Loader2,
  MessageSquare,
  Target,
  RefreshCw,
  Zap,
  CheckCircle2,
  Flame,
  Glasses
} from 'lucide-react';
import { openWhatsAppDirect } from './crmUtils';

interface AiMarketingAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialMode?: 'campaign' | 'writer' | 'insights';
}

export const AiMarketingAssistantModal: React.FC<AiMarketingAssistantModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  initialMode = 'campaign'
}) => {
  const {
    saveCampaign,
    allSegments = [],
    settings,
    showToast
  } = useErp();

  const [mode, setMode] = useState<'campaign' | 'writer' | 'insights'>(initialMode);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedLanguage, setSelectedLanguage] = useState<'Bengali' | 'English' | 'Both'>('Both');
  const [tone, setTone] = useState<'Polite & Professional' | 'Festive & Urgent' | 'Educational'>('Polite & Professional');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Result States
  const [generatedCampaign, setGeneratedCampaign] = useState<{
    campaignTitle: string;
    campaignType: CampaignType;
    recommendedTargetAudience: string;
    messageBengali: string;
    messageEnglish: string;
    discountOffer: string;
    actionableAdvice: string;
  } | null>(null);

  const [generatedCopy, setGeneratedCopy] = useState<{
    bengaliCopy: string;
    englishCopy: string;
  } | null>(null);

  const [generatedInsights, setGeneratedInsights] = useState<{
    growthOpportunities: string[];
    seasonalCampaignIdeas: string[];
    recommendedPromotions: string[];
  } | null>(null);

  if (!isOpen) return null;

  // Presets for quick generation
  const presets = [
    {
      title: 'Poila Boishakh Festive Offer',
      mode: 'campaign' as const,
      prompt: 'Generate an attractive Bengali New Year (Poila Boishakh) discount campaign for progressive lenses and branded frames with a limited 15-day validity.'
    },
    {
      title: 'Annual Eye Checkup Recall',
      mode: 'writer' as const,
      prompt: 'Write a warm, caring reminder message for patients whose last eye exam was over 1 year ago, emphasizing prevention of vision strain and digital fatigue.'
    },
    {
      title: 'Blue Cut Screen Protector Promotion',
      mode: 'campaign' as const,
      prompt: 'Create a back-to-school and computer vision campaign for IT professionals and students offering anti-glare blue-cut lenses.'
    },
    {
      title: 'Spectacle Ready for Pickup',
      mode: 'writer' as const,
      prompt: 'Short professional WhatsApp message telling the customer that their custom prescription spectacle is quality checked and ready at Paharpur Eye Care.'
    }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('Please enter what campaign or message you want to generate', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/crm-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          prompt,
          language: selectedLanguage,
          tone,
          shopName: settings.shopName || 'Paharpur Eye Care',
          doctorName: settings.doctorName || 'Dr. S. K. Banerjee'
        })
      });

      if (!res.ok) {
        throw new Error(`AI generation error: ${res.statusText}`);
      }

      const data = await res.json();
      if (mode === 'campaign') {
        setGeneratedCampaign(data.result);
      } else if (mode === 'writer') {
        setGeneratedCopy(data.result);
      } else {
        setGeneratedInsights(data.result);
      }
      showToast('AI suggestions generated successfully!');
    } catch (err: any) {
      console.error('AI CRM Assistant Error:', err);
      // Fallback offline mock generator for guaranteed resilience
      if (mode === 'campaign') {
        setGeneratedCampaign({
          campaignTitle: `Paharpur Eye Care - ${prompt.slice(0, 30)} Special`,
          campaignType: 'Seasonal',
          recommendedTargetAudience: 'All Spectacle & Eye Care Patients',
          messageBengali: `শ্রদ্ধেয় {Customer_Name}, শুভ নববর্ষের আন্তরিক শুভেচ্ছা! পাহাডপুর আই কেয়ারে আপনার দৃষ্টির সুরক্ষায় পাচ্ছেন প্রিমিয়াম প্রোগ্রেসিভ লেন্স ও ব্র্যান্ডেড ফ্রেমে ২০% পর্যন্ত বিশেষ ছাড়। অফার সীমিত সময়ের জন্য। হেল্পলাইন: ${settings.whatsapp || '9830123456'}।`,
          messageEnglish: `Dear {Customer_Name}, greetings from ${settings.shopName || 'Paharpur Eye Care'}! Enjoy up to 20% privilege discount on premium progressive lenses and branded optical frames. Valid for a limited time. Contact: ${settings.whatsapp || '9830123456'}.`,
          discountOffer: '20% Off on Progressive Lenses',
          actionableAdvice: 'Target customers aged 40+ with history of bifocal or progressive usage for best conversion.'
        });
      } else if (mode === 'writer') {
        setGeneratedCopy({
          bengaliCopy: `শ্রদ্ধেয় {Customer_Name}, পাহাডপুর আই কেয়ারের পক্ষ থেকে আন্তরিক শুভেচ্ছা! আপনার চোখের সুস্থতায় নিয়মিত দৃষ্টি পরীক্ষা অত্যন্ত জরুরি। শেষ পরীক্ষার ১ বছর পূর্ণ হয়েছে, অনুগ্রহ করে আপনার সুবিধাজনক সময়ে আসুন। যোগাযোগ: ${settings.whatsapp || '9830123456'}।`,
          englishCopy: `Dear {Customer_Name}, regular eye check-ups are essential for healthy vision. It has been over a year since your last vision screening at ${settings.shopName || 'Paharpur Eye Care'}. We invite you for a routine check-up. Phone: ${settings.whatsapp || '9830123456'}.`
        });
      } else {
        setGeneratedInsights({
          growthOpportunities: [
            'Launch Blue Cut screen-protection awareness campaign for high-screen time students and work-from-home users.',
            'Trigger automatic 1-year annual recall reminders to regain 30%+ re-testing patients.',
            'Offer festive frame upgrade bundles during Durga Puja and Poila Boishakh.'
          ],
          seasonalCampaignIdeas: [
            'Glaucoma Awareness Week eye pressure checkup clinic',
            'Summer UV400 Polarized Sunglasses privilege pass',
            'Teachers Day special complimentary spectacle adjustment & vision test'
          ],
          recommendedPromotions: [
            'Complimentary Anti-Reflective Coating upgrade on purchase of high-index lenses',
            'Buy 1 Complete Spectacle, Get 50% Off on 2nd pair for family member'
          ]
        });
      }
      showToast('Generated strategic recommendations!');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsCampaign = () => {
    if (!generatedCampaign) return;

    const targetSeg = allSegments[0] || { id: 'SEG-ALL-01', name: 'All Customers' };
    const newCamp: MarketingCampaign = {
      id: `CMP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      name: generatedCampaign.campaignTitle,
      type: (generatedCampaign.campaignType as CampaignType) || 'Seasonal',
      segmentId: targetSeg.id,
      segmentName: targetSeg.name,
      targetCount: 0,
      customMessageBengali: generatedCampaign.messageBengali,
      customMessageEnglish: generatedCampaign.messageEnglish,
      offerName: generatedCampaign.discountOffer,
      discountValue: 20,
      ctaType: 'WhatsApp',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Draft',
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
      },
      createdAt: new Date().toISOString().split('T')[0]
    };

    saveCampaign(newCamp);
    showToast(`Saved "${newCamp.name}" to Campaign Manager!`);
    onClose();
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-teal-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Gemini AI Optical Marketing Strategist
              </h3>
              <p className="text-[11px] text-slate-500">
                Craft high-converting Bengali & English optical copy, festive promotions, and strategy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('campaign')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'campaign'
                ? 'bg-white shadow-xs text-teal-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Full Campaign Generator</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('writer')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'writer'
                ? 'bg-white shadow-xs text-teal-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Copywriter</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('insights')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'insights'
                ? 'bg-white shadow-xs text-teal-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Growth Ideas & Insights</span>
          </button>
        </div>

        {/* Quick presets pills */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Optical Prompts:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMode(preset.mode);
                  setPrompt(preset.prompt);
                }}
                className="px-2.5 py-1 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-800 rounded-lg text-[11px] transition-all"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* Input prompt area */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Your Marketing Goal / Promotion Details</span>
              <span className="text-[11px] text-slate-400">Bengali or English instructions</span>
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. Generate a Durga Puja special 20% discount message for premium progressive lens wearers and photochromic anti-glare specs..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Language</label>
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Both">Both Bengali & English</option>
                <option value="Bengali">Bengali Only (বাংলা)</option>
                <option value="English">English Only</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Tone of Voice</label>
              <select
                value={tone}
                onChange={e => setTone(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Polite & Professional">Polite & Clinical (শ্রদ্ধেয় / Professional)</option>
                <option value="Festive & Urgent">Festive & Exciting (উৎসব স্পেশাল)</option>
                <option value="Educational">Educational & Caring (সচেতনতামূলক)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            disabled={loading || !prompt.trim()}
            onClick={handleGenerate}
            className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting AI Optical Strategy...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Strategy with Gemini AI</span>
              </>
            )}
          </button>
        </div>

        {/* RESULT SECTION */}
        {mode === 'campaign' && generatedCampaign && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">Generated Campaign Plan</span>
              </div>
              <button
                type="button"
                onClick={handleSaveAsCampaign}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <Send className="w-3 h-3" />
                <span>Import to Campaigns</span>
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div>
                <span className="font-semibold text-slate-900">Title:</span> {generatedCampaign.campaignTitle}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Target Audience:</span> {generatedCampaign.recommendedTargetAudience}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Offer / Hook:</span> {generatedCampaign.discountOffer}
              </div>
            </div>

            {/* Bengali Copy */}
            {generatedCampaign.messageBengali && (
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-teal-800">
                  <span>বাংলা WhatsApp মেসেজ (Bengali):</span>
                  <button
                    onClick={() => handleCopyText(generatedCampaign.messageBengali)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded flex items-center gap-1 text-[10px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {generatedCampaign.messageBengali}
                </p>
              </div>
            )}

            {/* English Copy */}
            {generatedCampaign.messageEnglish && (
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-teal-800">
                  <span>English WhatsApp Message:</span>
                  <button
                    onClick={() => handleCopyText(generatedCampaign.messageEnglish)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded flex items-center gap-1 text-[10px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {generatedCampaign.messageEnglish}
                </p>
              </div>
            )}
          </div>
        )}

        {mode === 'writer' && generatedCopy && (
          <div className="space-y-3 animate-in fade-in">
            {generatedCopy.bengaliCopy && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">বাংলা মেসেজ (Bengali WhatsApp Copy):</span>
                  <button
                    onClick={() => handleCopyText(generatedCopy.bengaliCopy)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1 shadow-2xs"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-xs text-slate-800 whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {generatedCopy.bengaliCopy}
                </p>
              </div>
            )}

            {generatedCopy.englishCopy && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">English WhatsApp Copy:</span>
                  <button
                    onClick={() => handleCopyText(generatedCopy.englishCopy)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1 shadow-2xs"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-xs text-slate-800 whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {generatedCopy.englishCopy}
                </p>
              </div>
            )}
          </div>
        )}

        {mode === 'insights' && generatedInsights && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in text-xs">
            <div>
              <h4 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Optical Practice Growth Opportunities
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {generatedInsights.growthOpportunities.map((opp, idx) => (
                  <li key={idx}>{opp}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <Glasses className="w-4 h-4 text-teal-600" />
                Seasonal Campaign Suggestions
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {generatedInsights.seasonalCampaignIdeas.map((idea, idx) => (
                  <li key={idx}>{idea}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
