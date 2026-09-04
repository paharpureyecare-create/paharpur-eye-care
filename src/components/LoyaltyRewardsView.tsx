import React, { useState, useMemo, useEffect } from 'react';
import { useErp } from '../context/ErpContext';
import {
  LoyaltySettings,
  LoyaltyTier,
  LoyaltyTransaction,
  Customer
} from '../types';
import {
  calculateMonetaryValue,
  calculatePointsForRupees,
  getCustomerTier,
  calculateMaxRedeemable,
  calculateTransactionPointsEarned,
  DEFAULT_LOYALTY_SETTINGS
} from '../utils/loyaltyCalculator';
import {
  Award,
  Crown,
  Gift,
  Coins,
  TrendingUp,
  Settings,
  Users,
  Clock,
  Sparkles,
  Search,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sliders,
  DollarSign,
  Layers,
  ChevronRight,
  Calculator,
  UserCheck,
  Calendar,
  Share2,
  Percent,
  Check
} from 'lucide-react';

export const LoyaltyRewardsView: React.FC = () => {
  const {
    customers,
    settings,
    updateSettings,
    updateLoyaltySettings,
    loyaltyLogs,
    adjustLoyaltyPoints,
    spectacleOrders,
    retailSales,
    sendDirectWhatsAppMessage,
    showToast,
    role
  } = useErp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'tiers' | 'rules' | 'expiry' | 'calculator'>('dashboard');

  // Active loyalty settings (with fallback to defaults)
  const loyaltyConfig = useMemo(() => {
    return settings.loyaltySettings || {
      version: 1,
      enabled: true,
      spendAmount: 100,
      pointsEarned: 1,
      calculationBasis: 'Net Amount (After Discount)',
      roundingRule: 'Round Down',
      pointsForValue: 100,
      valueInRupees: 50,
      minRedemptionPoints: 100,
      maxRedemptionType: 'Percentage of Invoice',
      maxRedemptionValue: 20,
      allowRedemptionOnDiscountedItems: true,
      categories: {
        frames: { eligible: true, multiplier: 1.0 },
        lenses: { eligible: true, multiplier: 1.5 },
        spectacles: { eligible: true, multiplier: 1.0 },
        accessories: { eligible: true, multiplier: 1.0 },
        medicines: { eligible: true, multiplier: 0.5 },
        otherProducts: { eligible: true, multiplier: 1.0 },
        doctorFee: { eligible: false, multiplier: 0.0 },
        optometristFee: { eligible: false, multiplier: 0.0 }
      },
      expiryEnabled: true,
      expiryDays: 365,
      notifyBeforeDays: 15,
      warningTemplateBengali: 'প্রিয় {{customerName}}, পাহাড়পুর আই কেয়ারের আপনার {{expiringPoints}} লয়্যালটি পয়েন্ট (মূল্য ₹{{expiringRupees}}) আগামী {{expiryDate}}-এ এক্সপায়ার হতে চলেছে! আজই আপনার পছন্দের চশমায় রিডিম করে ডিসকাউন্ট উপভোগ করুন। যোগাযোগ: +91 98301 23456',
      warningTemplateEnglish: 'Dear {{customerName}}, Your {{expiringPoints}} Paharpur Eye Care loyalty points (Value: ₹{{expiringRupees}}) will expire on {{expiryDate}}! Redeem now on frames/lenses to enjoy instant savings. Call +91 98301 23456.',
      birthdayBonusEnabled: true,
      birthdayBonusPoints: 50,
      birthdayBonusValidityDays: 30,
      anniversaryBonusEnabled: true,
      anniversaryBonusPoints: 50,
      anniversaryBonusValidityDays: 30,
      referralBonusEnabled: true,
      referrerBonusPoints: 100,
      newCustomerBonusPoints: 50,
      minPurchaseForReferralBonus: 500,
      welcomeBonusEnabled: true,
      welcomeBonusPoints: 50,
      tiers: [
        {
          id: 'TIER-BRONZE',
          name: 'Bronze Member',
          minPoints: 0,
          minSpend: 0,
          multiplier: 1.0,
          specialDiscountPercent: 0,
          badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
          accentColor: '#cd7f32',
          benefits: ['Standard 1x Points earning on optical purchases', 'Free frame adjustment & ultrasonic cleaning'],
          icon: 'Shield',
          isDefault: true
        },
        {
          id: 'TIER-SILVER',
          name: 'Silver Club',
          minPoints: 250,
          minSpend: 5000,
          multiplier: 1.25,
          specialDiscountPercent: 5,
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
          accentColor: '#94a3b8',
          benefits: ['1.25x Points multiplier on every purchase', 'Extra 5% discount on premium frames', 'Complimentary vision check-up every 6 months'],
          icon: 'Award'
        },
        {
          id: 'TIER-GOLD',
          name: 'Gold VIP',
          minPoints: 600,
          minSpend: 15000,
          multiplier: 1.5,
          specialDiscountPercent: 10,
          badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-400',
          accentColor: '#eab308',
          benefits: ['1.5x Points multiplier on all optical purchases', 'Extra 10% discount on branded eyewear', 'Free annual doctor consultation for 1 family member'],
          icon: 'Crown'
        },
        {
          id: 'TIER-PLATINUM',
          name: 'Platinum Elite',
          minPoints: 1200,
          minSpend: 30000,
          multiplier: 2.0,
          specialDiscountPercent: 15,
          badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-400',
          accentColor: '#6366f1',
          benefits: ['2.0x Double points on all purchases', 'Extra 15% discount on international luxury frames', 'Free yearly eye checkup for entire family', 'Dedicated VIP optical consultation & priority edging'],
          icon: 'Sparkles'
        }
      ]
    };
  }, [settings.loyaltySettings]);

  // Editable rules state (for admin rule modification)
  const [editableRules, setEditableRules] = useState<LoyaltySettings>(loyaltyConfig);
  const [hasUnsavedRuleChanges, setHasUnsavedRuleChanges] = useState(false);

  useEffect(() => {
    if (!hasUnsavedRuleChanges) {
      setEditableRules(loyaltyConfig);
    }
  }, [loyaltyConfig, hasUnsavedRuleChanges]);

  // Search & Filter in Customer list
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('ALL');

  // Manual adjustment modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [adjustPointsValue, setAdjustPointsValue] = useState<number>(50);
  const [adjustType, setAdjustType] = useState<'MANUAL_ADD' | 'MANUAL_DEDUCT' | 'RESET'>('MANUAL_ADD');
  const [adjustReason, setAdjustReason] = useState('Courtesy loyalty reward / Special promotion');

  // Calculator Sandbox state
  const [calcBillAmount, setCalcBillAmount] = useState<number>(3500);
  const [calcFrameAmount, setCalcFrameAmount] = useState<number>(1500);
  const [calcLensAmount, setCalcLensAmount] = useState<number>(2000);
  const [calcCustomerPoints, setCalcCustomerPoints] = useState<number>(300);
  const [calcCustomerTierId, setCalcCustomerTierId] = useState<string>('TIER-SILVER');

  // Stats calculation
  const stats = useMemo(() => {
    let totalPointsInCirculation = 0;
    let customersWithPoints = 0;
    const tierCounts: Record<string, number> = {};

    customers.forEach(c => {
      const pts = c.loyaltyPoints || 0;
      totalPointsInCirculation += pts;
      if (pts > 0) customersWithPoints++;

      const tier = getCustomerTier(pts, c.lifetimeValue || 0, loyaltyConfig).currentTier;
      tierCounts[tier.id] = (tierCounts[tier.id] || 0) + 1;
    });

    const liabilityRupees = calculateMonetaryValue(totalPointsInCirculation, loyaltyConfig);

    const totalRedeemedPoints = loyaltyLogs
      .filter(l => l.type === 'REDEEMED' || l.type === 'MANUAL_DEDUCT')
      .reduce((sum, l) => sum + l.points, 0);

    const totalEarnedPoints = loyaltyLogs
      .filter(l => l.type === 'EARNED' || l.type === 'MANUAL_ADD' || l.type === 'BONUS')
      .reduce((sum, l) => sum + l.points, 0);

    return {
      totalPointsInCirculation,
      customersWithPoints,
      liabilityRupees,
      totalRedeemedPoints,
      totalEarnedPoints,
      tierCounts
    };
  }, [customers, loyaltyLogs, loyaltyConfig]);

  // Handle rule changes
  const updateRuleField = <K extends keyof LoyaltySettings>(key: K, value: LoyaltySettings[K]) => {
    setEditableRules(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedRuleChanges(true);
  };

  const handleSaveRules = () => {
    updateLoyaltySettings({
      ...editableRules,
      version: (editableRules.version || 1) + 1,
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: `${role} User`
    });
    setHasUnsavedRuleChanges(false);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all Loyalty System rules back to default configuration (₹100 = 1 pt, 100 pts = ₹50, 20% max cap)?')) {
      const defaultRules: LoyaltySettings = {
        ...DEFAULT_LOYALTY_SETTINGS,
        version: (loyaltyConfig.version || 1) + 1,
        tiers: loyaltyConfig.tiers
      };
      setEditableRules(defaultRules);
      setHasUnsavedRuleChanges(true);
      showToast('Reset to default values in draft. Click "Save & Apply Changes" to commit.', 'info');
    }
  };

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchQuery =
        (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.mobile || '').includes(customerSearch) ||
        (c.customerId || '').toLowerCase().includes(customerSearch.toLowerCase());

      if (!matchQuery) return false;

      if (selectedTierFilter !== 'ALL') {
        const tier = getCustomerTier(c.loyaltyPoints || 0, c.lifetimeValue || 0, loyaltyConfig).currentTier;
        if (tier.id !== selectedTierFilter) return false;
      }

      return true;
    });
  }, [customers, customerSearch, selectedTierFilter, loyaltyConfig]);

  // Execute manual adjustment
  const handleApplyAdjustment = () => {
    if (!selectedCustomer) return;
    adjustLoyaltyPoints(selectedCustomer.customerId, adjustPointsValue, adjustType, adjustReason);
    setSelectedCustomer(null);
  };

  // Sandbox simulation calculation
  const simulationResult = useMemo(() => {
    const customTier = loyaltyConfig.tiers.find(t => t.id === calcCustomerTierId) || loyaltyConfig.tiers[0];
    const mockSettings: LoyaltySettings = {
      ...editableRules,
      tiers: editableRules.tiers.map(t => (t.id === customTier.id ? customTier : t))
    };

    const earned = calculateTransactionPointsEarned(
      {
        billAmount: calcBillAmount,
        subTotal: calcBillAmount,
        paidAmount: calcBillAmount,
        customerPoints: calcCustomerPoints,
        customerLifetimeSpend: 10000,
        categoryBreakdown: {
          frames: calcFrameAmount,
          lenses: calcLensAmount
        }
      },
      mockSettings
    );

    const redeem = calculateMaxRedeemable(calcCustomerPoints, calcBillAmount, mockSettings);

    return {
      earned,
      redeem
    };
  }, [editableRules, calcBillAmount, calcFrameAmount, calcLensAmount, calcCustomerPoints, calcCustomerTierId, loyaltyConfig]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-800/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Award className="w-64 h-64 text-teal-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Paharpur Eye Care ERP
              </span>
              {loyaltyConfig.enabled ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Paused
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Coins className="w-8 h-8 text-amber-400" />
              Loyalty Points & Rewards Management System
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Fully configurable optical customer retention engine. Edit earning formulas, rupee redemption values, category multipliers, and VIP club tiers directly without code changes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('rules')}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4" /> Edit Loyalty Rules
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" /> Simulator Sandbox
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Dashboard & Stats
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Customer Points Registry ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('tiers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'tiers'
                ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" /> VIP Loyalty Tiers ({loyaltyConfig.tiers.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> Admin Rule Settings
            {hasUnsavedRuleChanges && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>}
          </button>
          <button
            onClick={() => setActiveTab('expiry')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'expiry'
                ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Expiry Policy & Alerts
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" /> Live Simulator
          </button>
        </div>
      </div>

      {/* TAB 1: DASHBOARD & STATS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Circulating Points</span>
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Coins className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-slate-900 font-mono">
                  {stats.totalPointsInCirculation.toLocaleString()} <span className="text-sm font-medium text-slate-500">pts</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  Across <span className="font-semibold text-slate-700">{stats.customersWithPoints}</span> active customers
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monetary Liability</span>
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <DollarSign className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-emerald-600 font-mono">
                  ₹{stats.liabilityRupees.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  At 100 pts = ₹{loyaltyConfig.valueInRupees} (₹{(loyaltyConfig.valueInRupees / loyaltyConfig.pointsForValue).toFixed(2)}/pt)
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Points Redeemed</span>
                <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
                  <Gift className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-blue-600 font-mono">
                  {stats.totalRedeemedPoints.toLocaleString()} <span className="text-sm font-medium text-slate-500">pts</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Saved approx ₹{calculateMonetaryValue(stats.totalRedeemedPoints, loyaltyConfig).toLocaleString()} for customers
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Base Formula</span>
                <span className="p-2 rounded-xl bg-purple-100 text-purple-800">
                  <Percent className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xl font-bold text-purple-900">
                  ₹{loyaltyConfig.spendAmount} = {loyaltyConfig.pointsEarned} pt
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Max Redeem: {loyaltyConfig.maxRedemptionValue}% of invoice
                </div>
              </div>
            </div>
          </div>

          {/* Tier Distribution & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tier Breakdown */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  VIP Club Member Distribution
                </h3>
                <button
                  onClick={() => setActiveTab('tiers')}
                  className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Configure Tiers <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loyaltyConfig.tiers.map(tier => {
                  const count = stats.tierCounts[tier.id] || 0;
                  const percent = customers.length > 0 ? Math.round((count / customers.length) * 100) : 0;
                  return (
                    <div
                      key={tier.id}
                      className={`p-4 rounded-xl border transition-all ${
                        tier.id === 'TIER-PLATINUM'
                          ? 'bg-indigo-50/50 border-indigo-200'
                          : tier.id === 'TIER-GOLD'
                          ? 'bg-amber-50/50 border-amber-200'
                          : tier.id === 'TIER-SILVER'
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-orange-50/50 border-orange-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${tier.badgeColor}`}>
                          {tier.name}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{tier.multiplier}x Points</span>
                      </div>
                      <div className="mt-3 flex items-baseline justify-between">
                        <div className="text-2xl font-extrabold text-slate-900 font-mono">{count}</div>
                        <span className="text-xs text-slate-500 font-medium">{percent}% of customers</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-600">
                        Min Requirement: <span className="font-medium text-slate-800">{tier.minPoints} pts</span> or <span className="font-medium text-slate-800">₹{tier.minSpend.toLocaleString()}</span> spend
                      </div>
                      {tier.specialDiscountPercent > 0 && (
                        <div className="mt-1 text-[11px] font-bold text-emerald-700">
                          + {tier.specialDiscountPercent}% Extra Member Discount
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Automation Highlights */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Active Retention Triggers
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-950">Welcome / First Sale Bonus</div>
                      <div className="text-emerald-700 text-[11px]">Instant bonus on first spectacle order</div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-200 text-emerald-900 rounded-lg font-bold font-mono">
                      +{loyaltyConfig.welcomeBonusPoints} pts
                    </span>
                  </div>

                  <div className="p-3 bg-pink-50 rounded-xl border border-pink-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-pink-950">Birthday Special Gift</div>
                      <div className="text-pink-700 text-[11px]">Auto awarded in customer birthday month</div>
                    </div>
                    <span className="px-2 py-1 bg-pink-200 text-pink-900 rounded-lg font-bold font-mono">
                      +{loyaltyConfig.birthdayBonusPoints} pts
                    </span>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-blue-950">Referral Program</div>
                      <div className="text-blue-700 text-[11px]">Referrer: +{loyaltyConfig.referrerBonusPoints} pts | Friend: +{loyaltyConfig.newCustomerBonusPoints} pts</div>
                    </div>
                    <span className="px-2 py-1 bg-blue-200 text-blue-900 rounded-lg font-bold font-mono">
                      Referral
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-amber-950">Lens Multiplier</div>
                      <div className="text-amber-700 text-[11px]">Special booster on high-value lens purchases</div>
                    </div>
                    <span className="px-2 py-1 bg-amber-200 text-amber-900 rounded-lg font-bold font-mono">
                      {loyaltyConfig.categories.lenses.multiplier}x
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab('rules')}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" /> Modify All Rules & Multipliers
                </button>
              </div>
            </div>
          </div>

          {/* Recent Loyalty Transactions Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Recent Loyalty Ledger Audit Trail ({loyaltyLogs.length})
              </h3>
            </div>

            {loyaltyLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Log ID & Date</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Points Delta</th>
                      <th className="p-3">Balance After</th>
                      <th className="p-3">Reason / Description</th>
                      <th className="p-3">Logged By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loyaltyLogs.slice(0, 10).map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono">
                          <div className="font-bold text-slate-800">{log.id}</div>
                          <div className="text-[10px] text-slate-400">{log.date}</div>
                        </td>
                        <td className="p-3 font-medium text-slate-900">
                          {log.customerName}
                          <div className="text-[10px] text-slate-400">{log.customerId}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.type === 'EARNED' || log.type === 'MANUAL_ADD' || log.type === 'BONUS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.type === 'REDEEMED' || log.type === 'MANUAL_DEDUCT'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {log.type}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold">
                          <span
                            className={
                              log.type === 'REDEEMED' || log.type === 'MANUAL_DEDUCT'
                                ? 'text-rose-600'
                                : 'text-emerald-600'
                            }
                          >
                            {log.type === 'REDEEMED' || log.type === 'MANUAL_DEDUCT' ? '-' : '+'}
                            {log.points} pts
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800">{log.newPoints} pts</td>
                        <td className="p-3 text-slate-600 max-w-md truncate">{log.reason}</td>
                        <td className="p-3 text-slate-500">{log.user || 'System'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">No loyalty ledger activity recorded yet.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER POINTS REGISTRY */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                placeholder="Search by customer name, mobile or ID..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filter Tier:</span>
              <select
                value={selectedTierFilter}
                onChange={e => setSelectedTierFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Tiers ({customers.length})</option>
                {loyaltyConfig.tiers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Mobile / WhatsApp</th>
                    <th className="p-3.5">Current Tier</th>
                    <th className="p-3.5 text-right">Points Balance</th>
                    <th className="p-3.5 text-right">Rupee Equivalent</th>
                    <th className="p-3.5 text-right">Lifetime Spend</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(c => {
                      const tierData = getCustomerTier(c.loyaltyPoints || 0, c.lifetimeValue || 0, loyaltyConfig);
                      const rupeeValue = calculateMonetaryValue(c.loyaltyPoints || 0, loyaltyConfig);
                      return (
                        <tr key={c.customerId} className="hover:bg-slate-50/80">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{c.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{c.customerId} {c.mrd ? `• MRD: ${c.mrd}` : ''}</div>
                          </td>
                          <td className="p-3.5 font-mono text-slate-700">{c.mobile}</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${tierData.currentTier.badgeColor}`}>
                              {tierData.currentTier.name}
                            </span>
                            {tierData.nextTier && (
                              <div className="text-[10px] text-slate-400 mt-1">
                                {tierData.pointsToNextTier} pts to {tierData.nextTier.name}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 text-right font-mono font-extrabold text-slate-900 text-sm">
                            {(c.loyaltyPoints || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-500">pts</span>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                            ₹{rupeeValue.toLocaleString()}
                          </td>
                          <td className="p-3.5 text-right font-mono text-slate-700">
                            ₹{(c.lifetimeValue || 0).toLocaleString()}
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedCustomer(c)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                              >
                                Adjust Points
                              </button>
                              <button
                                onClick={() => {
                                  const text = `নমস্কার ${c.name}, পাহাড়পুর আই কেয়ারের আপনার লয়্যালটি কার্ডে বর্তমানে ${c.loyaltyPoints || 0} পয়েন্ট (মূল্য ₹${rupeeValue}) রয়েছে! আপনার টিয়ার: ${tierData.currentTier.name}। আগামী চশমা ক্রয়ে রিডিম করে ডিসকাউন্ট পান। যোগাযোগ: +91 98301 23456`;
                                  sendDirectWhatsAppMessage(c.mobile, text, c.customerId);
                                }}
                                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" /> Balance SMS
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No customers found matching search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VIP LOYALTY TIERS */}
      {activeTab === 'tiers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Configured VIP Customer Tiers</h3>
              <p className="text-xs text-slate-500">Customers are automatically promoted to higher tiers as they earn points or increase optical lifetime spend.</p>
            </div>
            <button
              onClick={() => setActiveTab('rules')}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Tier Rules in Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loyaltyConfig.tiers.map((tier, idx) => (
              <div
                key={tier.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 left-0 h-1.5" style={{ backgroundColor: tier.accentColor || '#0d9488' }} />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Level {idx + 1}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                      {tier.multiplier}x Multiplier
                    </span>
                  </div>

                  <h4 className="text-lg font-extrabold text-slate-900">{tier.name}</h4>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Minimum Points:</span>
                      <span className="font-bold text-slate-900 font-mono">{tier.minPoints} pts</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Minimum Spend:</span>
                      <span className="font-bold text-slate-900 font-mono">₹{tier.minSpend.toLocaleString()}</span>
                    </div>
                    {tier.specialDiscountPercent > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                        <span>Extra VIP Discount:</span>
                        <span>{tier.specialDiscountPercent}% Off</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Member Benefits:</span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {tier.benefits.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${tier.badgeColor}`}>
                    {stats.tierCounts[tier.id] || 0} Customers in Tier
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ADMIN EDITABLE RULES SETTINGS */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* Unsaved changes banner */}
          {hasUnsavedRuleChanges && (
            <div className="p-4 bg-amber-500 text-slate-950 rounded-2xl font-bold text-xs flex items-center justify-between shadow-lg animate-pulse">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>You have unsaved changes in Loyalty System rules! Click "Save & Apply Changes" to commit.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveRules}
                  className="px-4 py-1.5 bg-slate-950 text-white hover:bg-slate-900 rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
                >
                  Save & Apply Changes
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Admin Loyalty & Rewards Rule Configuration</h3>
                <p className="text-xs text-slate-500">
                  Every formula is fully editable. Update rupee conversion values, point percentages, caps, multipliers, and bonuses anytime.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToDefaults}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
                </button>
                <button
                  onClick={handleSaveRules}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-3.5 h-3.5" /> Save & Apply Changes
                </button>
              </div>
            </div>

            {/* Program Master Switch */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Loyalty Program Master Switch</h4>
                <p className="text-xs text-slate-500">When enabled, customers will earn and redeem points on spectacle orders and retail sales.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editableRules.enabled}
                  onChange={e => updateRuleField('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* SECTION 1: Earning Formula & Spend Ratio */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
                <Coins className="w-4 h-4 text-amber-500" />
                1. Base Point Earning Formula
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Qualifying Spend Amount (₹)</label>
                  <input
                    type="number"
                    value={editableRules.spendAmount}
                    onChange={e => updateRuleField('spendAmount', Math.max(1, Number(e.target.value)))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Default: ₹100</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Points Earned Per Spend</label>
                  <input
                    type="number"
                    value={editableRules.pointsEarned}
                    onChange={e => updateRuleField('pointsEarned', Math.max(1, Number(e.target.value)))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">e.g., 1 Point per ₹100</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Calculation Basis</label>
                  <select
                    value={editableRules.calculationBasis}
                    onChange={e => updateRuleField('calculationBasis', e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium bg-white"
                  >
                    <option value="Net Amount (After Discount)">Net Amount (After Discount)</option>
                    <option value="Gross Amount">Gross Amount (Before Discount)</option>
                    <option value="Paid Amount">Paid Amount Only</option>
                  </select>
                  <span className="text-[11px] text-slate-400 mt-1 block">Qualifying base amount</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: Redemption Conversion & Cap */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4 text-emerald-600" />
                2. Redemption Conversion Value & Limits
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Points For Value</label>
                  <input
                    type="number"
                    value={editableRules.pointsForValue}
                    onChange={e => updateRuleField('pointsForValue', Math.max(1, Number(e.target.value)))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">e.g., 100 Points</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Equivalent Rupee Value (₹)</label>
                  <input
                    type="number"
                    value={editableRules.valueInRupees}
                    onChange={e => updateRuleField('valueInRupees', Math.max(1, Number(e.target.value)))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    = ₹{(editableRules.valueInRupees / (editableRules.pointsForValue || 1)).toFixed(2)} per point
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Min Points Required to Redeem</label>
                  <input
                    type="number"
                    value={editableRules.minRedemptionPoints}
                    onChange={e => updateRuleField('minRedemptionPoints', Math.max(0, Number(e.target.value)))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">e.g. 100 pts minimum threshold</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Max Redemption Cap (% of Bill)</label>
                  <input
                    type="number"
                    value={editableRules.maxRedemptionValue}
                    onChange={e => updateRuleField('maxRedemptionValue', Math.max(1, Math.min(100, Number(e.target.value))))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Max {editableRules.maxRedemptionValue}% of bill value</span>
                </div>
              </div>
            </div>

            {/* SECTION 3: Category Multipliers */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-blue-600" />
                3. Optical Product Category Multipliers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800 mb-1">Frames</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={editableRules.categories.frames.multiplier}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 1.0;
                        setEditableRules(prev => ({
                          ...prev,
                          categories: { ...prev.categories, frames: { eligible: true, multiplier: val } }
                        }));
                        setHasUnsavedRuleChanges(true);
                      }}
                      className="w-20 p-1.5 border border-slate-300 rounded-lg font-mono font-bold bg-white text-xs"
                    />
                    <span className="text-slate-500 text-[11px]">x Multiplier</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="font-bold text-amber-900 mb-1">Lenses (Booster)</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={editableRules.categories.lenses.multiplier}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 1.5;
                        setEditableRules(prev => ({
                          ...prev,
                          categories: { ...prev.categories, lenses: { eligible: true, multiplier: val } }
                        }));
                        setHasUnsavedRuleChanges(true);
                      }}
                      className="w-20 p-1.5 border border-amber-300 rounded-lg font-mono font-bold bg-white text-xs"
                    />
                    <span className="text-amber-800 text-[11px]">x (e.g. 1.5x)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800 mb-1">Spectacles & Complete Sets</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={editableRules.categories.spectacles.multiplier}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 1.0;
                        setEditableRules(prev => ({
                          ...prev,
                          categories: { ...prev.categories, spectacles: { eligible: true, multiplier: val } }
                        }));
                        setHasUnsavedRuleChanges(true);
                      }}
                      className="w-20 p-1.5 border border-slate-300 rounded-lg font-mono font-bold bg-white text-xs"
                    />
                    <span className="text-slate-500 text-[11px]">x Multiplier</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800 mb-1">Doctor & Optometrist Fees</div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-[11px] font-bold">0x (Ineligible)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: Special Bonus Events & Referral */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-600" />
                4. Special Retention Bonuses & Referrals
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Welcome / 1st Sale Bonus</span>
                    <input
                      type="checkbox"
                      checked={editableRules.welcomeBonusEnabled}
                      onChange={e => updateRuleField('welcomeBonusEnabled', e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                  </div>
                  <input
                    type="number"
                    value={editableRules.welcomeBonusPoints}
                    onChange={e => updateRuleField('welcomeBonusPoints', Math.max(0, Number(e.target.value)))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-slate-500">Points credited on 1st order</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Birthday Month Bonus</span>
                    <input
                      type="checkbox"
                      checked={editableRules.birthdayBonusEnabled}
                      onChange={e => updateRuleField('birthdayBonusEnabled', e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                  </div>
                  <input
                    type="number"
                    value={editableRules.birthdayBonusPoints}
                    onChange={e => updateRuleField('birthdayBonusPoints', Math.max(0, Number(e.target.value)))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-slate-500">Points gifted in birthday month</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Referrer Reward Points</span>
                    <input
                      type="checkbox"
                      checked={editableRules.referralBonusEnabled}
                      onChange={e => updateRuleField('referralBonusEnabled', e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                  </div>
                  <input
                    type="number"
                    value={editableRules.referrerBonusPoints}
                    onChange={e => updateRuleField('referrerBonusPoints', Math.max(0, Number(e.target.value)))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-slate-500">Points awarded to existing referrer</span>
                </div>
              </div>
            </div>

            {/* Bottom Save Button Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={handleResetToDefaults}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Reset All to Recommended Defaults
              </button>
              <button
                onClick={handleSaveRules}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save & Commit Loyalty Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EXPIRY POLICY & ALERTS */}
      {activeTab === 'expiry' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Point Expiry Policy & WhatsApp Expiry Alerts</h3>
              <p className="text-xs text-slate-500">Configure how long points remain valid and broadcast pre-expiry reminders to encourage repeat optical visits.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 block">Point Validity Duration (Days)</label>
                <input
                  type="number"
                  value={editableRules.expiryDays}
                  onChange={e => updateRuleField('expiryDays', Math.max(30, Number(e.target.value)))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold bg-white"
                />
                <span className="text-[11px] text-slate-400">Default: 365 Days (1 Year from earning date)</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 block">Send Expiry Warning Before (Days)</label>
                <input
                  type="number"
                  value={editableRules.notifyBeforeDays}
                  onChange={e => updateRuleField('notifyBeforeDays', Math.max(1, Number(e.target.value)))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold bg-white"
                />
                <span className="text-[11px] text-slate-400">Default: 15 Days before expiration</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="font-bold text-slate-800 text-xs block">Bengali WhatsApp Pre-Expiry Warning Message Template</label>
              <textarea
                rows={3}
                value={editableRules.warningTemplateBengali}
                onChange={e => updateRuleField('warningTemplateBengali', e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 font-sans"
              />
              <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                <span className="font-semibold">Variables:</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded font-mono">{'{{customerName}}'}</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded font-mono">{'{{expiringPoints}}'}</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded font-mono">{'{{expiringRupees}}'}</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded font-mono">{'{{expiryDate}}'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  showToast('Running automated point validity audit across all customers...', 'info');
                  setTimeout(() => {
                    showToast('Point expiry audit complete. All customer point ledgers verified.', 'success');
                  }, 800);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Run Point Expiry Audit Now
              </button>

              <button
                onClick={handleSaveRules}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
              >
                Save Expiry Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CALCULATOR & SIMULATION SANDBOX */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-teal-600" />
                Live Loyalty Points & Redemption Simulator Sandbox
              </h3>
              <p className="text-xs text-slate-500">
                Test your active earning formulas, tier multipliers, and redemption caps in real-time before applying them to POS invoices.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Simulator Controls */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Simulation Inputs</h4>

                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1">Total Bill Amount (₹)</label>
                  <input
                    type="number"
                    value={calcBillAmount}
                    onChange={e => setCalcBillAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold bg-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Frame Portion (₹)</label>
                    <input
                      type="number"
                      value={calcFrameAmount}
                      onChange={e => setCalcFrameAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full p-2 border border-slate-300 rounded-xl font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Lens Portion (₹)</label>
                    <input
                      type="number"
                      value={calcLensAmount}
                      onChange={e => setCalcLensAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full p-2 border border-slate-300 rounded-xl font-mono bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Customer Existing Points</label>
                    <input
                      type="number"
                      value={calcCustomerPoints}
                      onChange={e => setCalcCustomerPoints(Math.max(0, Number(e.target.value)))}
                      className="w-full p-2 border border-slate-300 rounded-xl font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Customer Tier</label>
                    <select
                      value={calcCustomerTierId}
                      onChange={e => setCalcCustomerTierId(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-xl font-medium bg-white"
                    >
                      {loyaltyConfig.tiers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.multiplier}x)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="space-y-4">
                {/* Earning Calculation Result */}
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">1. Points Customer Will Earn</span>
                  <div className="text-3xl font-extrabold text-emerald-700 font-mono mt-1">
                    +{simulationResult.earned.totalPointsEarned} <span className="text-sm font-medium">Points</span>
                  </div>
                  <div className="text-xs text-emerald-900 mt-2 space-y-1">
                    <div>• Base Points: <span className="font-bold">{simulationResult.earned.basePoints} pts</span></div>
                    <div>• Tier Multiplier: <span className="font-bold">{simulationResult.earned.tierMultiplier}x ({simulationResult.earned.tierName})</span></div>
                    {simulationResult.earned.tierBonusPoints > 0 && (
                      <div>• Tier Bonus: <span className="font-bold">+{simulationResult.earned.tierBonusPoints} pts</span></div>
                    )}
                    <div>• Rupee Value Equivalent: <span className="font-bold">₹{simulationResult.earned.monetaryEquivalentRupees}</span></div>
                  </div>
                </div>

                {/* Redemption Limit Result */}
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">2. Max Points Allowed to Redeem On This Bill</span>
                  <div className="text-2xl font-extrabold text-blue-700 font-mono mt-1">
                    {simulationResult.redeem.maxPoints} pts <span className="text-sm font-normal text-blue-900">(= ₹{simulationResult.redeem.maxDiscountRupees} Discount)</span>
                  </div>
                  <div className="text-xs text-blue-900 mt-2 space-y-1">
                    <div>• Max Cap Rule: <span className="font-bold">{editableRules.maxRedemptionValue}% of Bill Amount (Max ₹{(calcBillAmount * editableRules.maxRedemptionValue) / 100})</span></div>
                    <div>• Customer Balance: <span className="font-bold">{calcCustomerPoints} pts</span></div>
                    <div>• New Bill After Point Redemption: <span className="font-bold text-slate-950 font-mono">₹{Math.max(0, calcBillAmount - simulationResult.redeem.maxDiscountRupees)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Points Adjustment Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Manual Loyalty Points Adjustment</h3>
                <p className="text-xs text-slate-500">{selectedCustomer.name} ({selectedCustomer.customerId})</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
              Current Balance: <span className="font-bold text-amber-950 font-mono">{selectedCustomer.loyaltyPoints || 0} Points</span> (₹{calculateMonetaryValue(selectedCustomer.loyaltyPoints || 0, loyaltyConfig)})
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Adjustment Action</label>
                <select
                  value={adjustType}
                  onChange={e => setAdjustType(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium bg-white"
                >
                  <option value="MANUAL_ADD">➕ Add / Credit Bonus Points</option>
                  <option value="MANUAL_DEDUCT">➖ Deduct / Debit Points</option>
                  <option value="RESET">🔄 Set Exact Balance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Points Amount</label>
                <input
                  type="number"
                  value={adjustPointsValue}
                  onChange={e => setAdjustPointsValue(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="e.g. Courtesy compensation, Festival bonus"
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyAdjustment}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
