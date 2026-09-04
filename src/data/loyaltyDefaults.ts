import { LoyaltySettings, ReferralRecord, LoyaltyTransaction } from '../types';

export const DEFAULT_LOYALTY_SETTINGS: LoyaltySettings = {
  version: 1,
  enabled: true, // Loyalty System is active by default

  // Spend Rule: ₹100 = 1 Point
  spendAmount: 100,
  pointsEarned: 1,
  calculationBasis: 'Net Amount (After Discount)',
  roundingRule: 'Round Down',

  // Redemption Value: 100 Points = ₹50 (i.e. ₹0.50 per point)
  pointsForValue: 100,
  valueInRupees: 50,

  // Redemption Limits
  minRedemptionPoints: 100, // Minimum 100 points required to redeem
  maxRedemptionType: 'Percentage of Invoice',
  maxRedemptionValue: 20, // Max 20% of bill amount can be paid via points
  allowRedemptionOnDiscountedItems: true,

  // Product Category Eligibility & Multipliers
  categories: {
    frames: { eligible: true, multiplier: 1.0 },
    lenses: { eligible: true, multiplier: 1.5 }, // 1.5x points on lenses as requested
    spectacles: { eligible: true, multiplier: 1.0 },
    accessories: { eligible: true, multiplier: 1.0 },
    medicines: { eligible: true, multiplier: 0.5 },
    otherProducts: { eligible: true, multiplier: 1.0 },
    doctorFee: { eligible: false, multiplier: 0.0 }, // Not eligible for points
    optometristFee: { eligible: false, multiplier: 0.0 }
  },

  // Point Expiry Policy
  expiryEnabled: true,
  expiryDays: 365, // 365 Days validity
  notifyBeforeDays: 15, // Notify 15 days before expiry
  warningTemplateBengali: 'প্রিয় {{customerName}}, পাহাড়পুর আই কেয়ারের আপনার {{expiringPoints}} লয়্যালটি পয়েন্ট (মূল্য ₹{{expiringRupees}}) আগামী {{expiryDate}}-এ এক্সপায়ার হতে চলেছে! আজই আপনার পছন্দের চশমায় রিডিম করে ডিসকাউন্ট উপভোগ করুন। যোগাযোগ: +91 98301 23456',
  warningTemplateEnglish: 'Dear {{customerName}}, Your {{expiringPoints}} Paharpur Eye Care loyalty points (Value: ₹{{expiringRupees}}) will expire on {{expiryDate}}! Redeem now on frames/lenses to enjoy instant savings. Call +91 98301 23456.',

  // Birthday & Anniversary Rules
  birthdayBonusEnabled: true,
  birthdayBonusPoints: 50,
  birthdayBonusValidityDays: 30,

  anniversaryBonusEnabled: true,
  anniversaryBonusPoints: 50,
  anniversaryBonusValidityDays: 30,

  // Referral Rewards
  referralBonusEnabled: true,
  referrerBonusPoints: 100,
  newCustomerBonusPoints: 50,
  minPurchaseForReferralBonus: 500,

  // First Purchase / Welcome Bonus
  welcomeBonusEnabled: true,
  welcomeBonusPoints: 50,

  // Customer Loyalty Tiers
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
      benefits: ['Standard 1x Points earning on optical purchases', 'Standard warranty coverage', 'Free frame adjustment & cleaning'],
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
      benefits: ['1.25x Points multiplier on every purchase', 'Extra 5% discount on premium frames', 'Complimentary vision check-up every 6 months', 'Priority optical lab fitting'],
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
      benefits: ['1.5x Points multiplier on all optical purchases', 'Extra 10% discount on branded eyewear', 'Free annual doctor consultation for family member', 'Express same-day spectacle delivery priority'],
      icon: 'Crown'
    },
    {
      id: 'TIER-PLATINUM',
      name: 'Platinum Elite',
      minPoints: 1200,
      minSpend: 30000,
      multiplier: 2.0,
      specialDiscountPercent: 15,
      badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-400',
      accentColor: '#06b6d4',
      benefits: ['2.0x Double Points earning on all products', 'Extra 15% discount on designer frames & progressives', 'Complimentary lens anti-scratch coating upgrade', 'VIP home delivery & dedicated optometry desk'],
      icon: 'Sparkles'
    }
  ],

  // Bonus Triggers
  bonusRules: [
    {
      id: 'BONUS-FIRST-PURCHASE',
      name: 'New Customer Welcome Bonus',
      trigger: 'First Purchase',
      bonusPoints: 50,
      minPurchaseAmount: 1000,
      validityDays: 180,
      active: true,
      messageTemplateBengali: 'পাহাড়পুর আই কেয়ারে স্বাগতম! আপনার প্রথম কেনাকাটায় 50 ওয়েলকাম লয়্যালটি পয়েন্ট যুক্ত হয়েছে।',
      messageTemplateEnglish: 'Welcome to Paharpur Eye Care! You received 50 Welcome Loyalty Points on your first purchase.'
    },
    {
      id: 'BONUS-BIRTHDAY',
      name: 'Happy Birthday Surprise Gift',
      trigger: 'Birthday',
      bonusPoints: 50,
      validityDays: 30,
      active: true,
      messageTemplateBengali: 'শুভ জন্মদিন! পাহাড়পুর আই কেয়ারের পক্ষ থেকে আপনার ওয়ালেটে 50 স্পেশাল বার্থডে লয়্যালটি পয়েন্ট উপহার দেওয়া হল।',
      messageTemplateEnglish: 'Happy Birthday! Enjoy 50 Birthday Loyalty Points as a gift from Paharpur Eye Care.'
    },
    {
      id: 'BONUS-ANNIVERSARY',
      name: 'Marriage Anniversary Celebration',
      trigger: 'Anniversary',
      bonusPoints: 50,
      validityDays: 30,
      active: true,
      messageTemplateBengali: 'বিবাহবার্ষিকীর আন্তরিক শুভেচ্ছা! আপনার একাউন্টে 50 অ্যানিভার্সারি লয়্যালটি পয়েন্ট যুক্ত হয়েছে।',
      messageTemplateEnglish: 'Happy Wedding Anniversary! You received 50 Anniversary Loyalty Points from Paharpur Eye Care.'
    },
    {
      id: 'BONUS-REFERRAL',
      name: 'Customer Referral Reward',
      trigger: 'Referral',
      bonusPoints: 100,
      minPurchaseAmount: 500,
      validityDays: 365,
      active: true,
      messageTemplateBengali: 'আপনার রেফারেন্সে নতুন কাস্টমার কেনাকাটা করায় আপনাকে 100 লয়্যালটি পয়েন্ট প্রদান করা হল!',
      messageTemplateEnglish: 'Thank you for referring a friend! 100 Referral Points added to your account.'
    },
    {
      id: 'BONUS-HIGH-VALUE',
      name: 'High Value Premium Shopper Bonus',
      trigger: 'High Value Purchase',
      bonusPoints: 100,
      minPurchaseAmount: 5000,
      validityDays: 365,
      active: true,
      messageTemplateBengali: '₹5,000+ কেনাকাটার জন্য বিশেষ 100 বোনাস লয়্যালটি পয়েন্ট যুক্ত হয়েছে।',
      messageTemplateEnglish: 'Earned 100 Premium Bonus Points for your purchase above ₹5,000.'
    }
  ],

  // Milestone Bonuses
  milestones: [
    {
      id: 'ML-01',
      name: 'Single Bill ₹3,000+ Booster',
      minAmount: 3000,
      bonusPoints: 25,
      active: true
    },
    {
      id: 'ML-02',
      name: 'Single Bill ₹6,000+ Booster',
      minAmount: 6000,
      bonusPoints: 75,
      active: true
    },
    {
      id: 'ML-03',
      name: 'Single Bill ₹10,000+ VIP Booster',
      minAmount: 10000,
      bonusPoints: 150,
      active: true
    }
  ],

  // Promotional Multiplier Campaigns
  campaignRules: [
    {
      id: 'CMP-DOUBLE-POINTS',
      name: 'Festive Double Points Week (2x Points)',
      multiplier: 2.0,
      bonusPoints: 20,
      startDate: '2026-09-01',
      endDate: '2026-10-31',
      eligibleCategories: ['Frames', 'Lenses', 'Spectacles'],
      bannerText: '🎉 Durga Puja Special: Earn 2X DOUBLE Loyalty Points on all Spectacles & Lenses!',
      active: true,
      status: 'Active'
    }
  ],

  // Initial Audit Trail
  auditHistory: [
    {
      id: 'AUD-LOY-INIT',
      date: '2026-08-20',
      time: '10:00 AM',
      changedBy: 'Admin (System Initialization)',
      oldRuleSummary: 'Legacy Flat 1 pt / ₹100',
      newRuleSummary: 'Enterprise Dynamic Rule: ₹100 = 1 Pt, 100 Pts = ₹50 (₹0.50/pt), 20% Max Invoice Cap, 365-Day Expiry, 4 Tiers, 1.5x Lens Multiplier',
      changeNotes: 'Initialized Paharpur Eye Care Advanced Editable Loyalty & Rewards Engine.'
    }
  ]
};

export const INITIAL_REFERRALS: ReferralRecord[] = [
  {
    id: 'REF-2026-01',
    referrerCustomerId: 'CUST-5001',
    referrerName: 'Subhash Chandra Roy',
    referrerMobile: '9831122334',
    referredCustomerId: 'CUST-5002',
    referredCustomerName: 'Ananya Mukherjee',
    referredCustomerMobile: '9874561230',
    date: '2026-08-21',
    referrerPointsAwarded: 100,
    newCustomerPointsAwarded: 50,
    firstInvoiceId: 'INV-2026-8001',
    purchaseAmount: 2550,
    status: 'Completed',
    notes: 'Referred colleague for computer Blue-Cut glasses'
  }
];
