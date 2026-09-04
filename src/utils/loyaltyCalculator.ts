import { LoyaltySettings, LoyaltyTier, LoyaltyTransaction, Customer } from '../types';
import { DEFAULT_LOYALTY_SETTINGS } from '../data/loyaltyDefaults';

export { DEFAULT_LOYALTY_SETTINGS };

export interface PointsCalculationResult {
  basePoints: number;
  tierMultiplier: number;
  tierBonusPoints: number;
  categoryMultipliersApplied: { category: string; amount: number; multiplier: number; points: number }[];
  milestoneBonusPoints: number;
  campaignMultiplier: number;
  campaignBonusPoints: number;
  totalPointsEarned: number;
  monetaryEquivalentRupees: number;
  tierName: string;
  appliedRuleSnapshot: string;
}

/**
 * Calculates monetary rupee value for given points based on active settings
 * e.g., 100 points = ₹50 (1 pt = ₹0.50)
 */
export function calculateMonetaryValue(points: number, settings?: LoyaltySettings): number {
  if (!settings || !settings.pointsForValue || settings.pointsForValue <= 0) {
    return Math.round((points * 50) / 100);
  }
  const rawValue = (points * (settings.valueInRupees || 50)) / (settings.pointsForValue || 100);
  return Math.round(rawValue * 100) / 100;
}

/**
 * Converts monetary rupee discount to required loyalty points
 */
export function calculatePointsForRupees(rupees: number, settings?: LoyaltySettings): number {
  if (!settings || !settings.valueInRupees || settings.valueInRupees <= 0) {
    return Math.ceil((rupees * 100) / 50);
  }
  return Math.ceil((rupees * (settings.pointsForValue || 100)) / (settings.valueInRupees || 50));
}

/**
 * Determines a customer's active Tier based on their total points or total lifetime spend
 */
export function getCustomerTier(
  customerPoints: number,
  lifetimeSpend: number,
  settings?: LoyaltySettings
): {
  currentTier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  pointsToNextTier: number;
  spendToNextTier: number;
  progressPercent: number;
} {
  const tiers = settings?.tiers && settings.tiers.length > 0
    ? [...settings.tiers].sort((a, b) => (b.minPoints || 0) - (a.minPoints || 0))
    : [];

  if (tiers.length === 0) {
    const fallbackTier: LoyaltyTier = {
      id: 'TIER-DEFAULT',
      name: 'Standard Member',
      minPoints: 0,
      minSpend: 0,
      multiplier: 1.0,
      specialDiscountPercent: 0,
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      benefits: ['Standard 1x Points earning']
    };
    return {
      currentTier: fallbackTier,
      nextTier: null,
      pointsToNextTier: 0,
      spendToNextTier: 0,
      progressPercent: 100
    };
  }

  // Find highest qualifying tier
  let qualifyingTier = tiers[tiers.length - 1]; // Lowest tier default
  for (const tier of tiers) {
    if (customerPoints >= (tier.minPoints || 0) || lifetimeSpend >= (tier.minSpend || 0)) {
      qualifyingTier = tier;
      break;
    }
  }

  // Find next tier in ascending order
  const ascendingTiers = [...tiers].sort((a, b) => (a.minPoints || 0) - (b.minPoints || 0));
  const currentIndex = ascendingTiers.findIndex(t => t.id === qualifyingTier.id);
  const nextTier = currentIndex < ascendingTiers.length - 1 ? ascendingTiers[currentIndex + 1] : null;

  let pointsToNextTier = 0;
  let spendToNextTier = 0;
  let progressPercent = 100;

  if (nextTier) {
    pointsToNextTier = Math.max(0, (nextTier.minPoints || 0) - customerPoints);
    spendToNextTier = Math.max(0, (nextTier.minSpend || 0) - lifetimeSpend);
    const range = (nextTier.minPoints || 0) - (qualifyingTier.minPoints || 0);
    if (range > 0) {
      const currentProgress = customerPoints - (qualifyingTier.minPoints || 0);
      progressPercent = Math.min(100, Math.max(0, Math.round((currentProgress / range) * 100)));
    }
  }

  return {
    currentTier: qualifyingTier,
    nextTier,
    pointsToNextTier,
    spendToNextTier,
    progressPercent
  };
}

/**
 * Calculates max points allowed to be redeemed on a specific invoice/order
 */
export function calculateMaxRedeemable(
  customerPoints: number,
  invoiceAmount: number,
  settings?: LoyaltySettings
): {
  maxPoints: number;
  maxDiscountRupees: number;
  isEligible: boolean;
  reason?: string;
} {
  if (!settings || !settings.enabled) {
    return { maxPoints: 0, maxDiscountRupees: 0, isEligible: false, reason: 'Loyalty program is disabled in settings' };
  }

  if (customerPoints <= 0 || invoiceAmount <= 0) {
    return { maxPoints: 0, maxDiscountRupees: 0, isEligible: false, reason: 'Zero points or bill amount' };
  }

  const minRequired = settings.minRedemptionPoints || 0;
  if (customerPoints < minRequired) {
    return {
      maxPoints: 0,
      maxDiscountRupees: 0,
      isEligible: false,
      reason: `Minimum ${minRequired} points required to redeem (Current balance: ${customerPoints} pts)`
    };
  }

  // Calculate monetary cap on invoice
  let maxAllowedRupees = invoiceAmount;
  if (settings.maxRedemptionType === 'Percentage of Invoice') {
    const pct = settings.maxRedemptionValue || 20;
    maxAllowedRupees = (invoiceAmount * pct) / 100;
  } else if (settings.maxRedemptionType === 'Fixed Amount') {
    maxAllowedRupees = Math.min(invoiceAmount, settings.maxRedemptionValue || 500);
  } else if (settings.maxRedemptionType === 'Fixed Points') {
    const fixedPts = settings.maxRedemptionValue || 200;
    maxAllowedRupees = calculateMonetaryValue(fixedPts, settings);
  }

  // Convert customer's total points to rupee equivalent
  const customerMaxRupees = calculateMonetaryValue(customerPoints, settings);
  const effectiveDiscountRupees = Math.min(invoiceAmount, maxAllowedRupees, customerMaxRupees);

  // Convert effective rupees back to points
  const pointsNeeded = calculatePointsForRupees(effectiveDiscountRupees, settings);
  const actualPointsToDeduct = Math.min(customerPoints, pointsNeeded);

  return {
    maxPoints: actualPointsToDeduct,
    maxDiscountRupees: Math.round(effectiveDiscountRupees),
    isEligible: actualPointsToDeduct > 0
  };
}

/**
 * Detailed Calculation Engine for Earning Points on a Transaction
 */
export function calculateTransactionPointsEarned(
  params: {
    billAmount: number;
    subTotal?: number;
    paidAmount?: number;
    customerPoints?: number;
    customerLifetimeSpend?: number;
    categoryBreakdown?: {
      frames?: number;
      lenses?: number;
      spectacles?: number;
      accessories?: number;
      medicines?: number;
      otherProducts?: number;
      doctorFee?: number;
      optometristFee?: number;
    };
    isFirstPurchase?: boolean;
    isBirthdayMonth?: boolean;
    isAnniversaryMonth?: boolean;
  },
  settings?: LoyaltySettings
): PointsCalculationResult {
  const defaultRes: PointsCalculationResult = {
    basePoints: 0,
    tierMultiplier: 1.0,
    tierBonusPoints: 0,
    categoryMultipliersApplied: [],
    milestoneBonusPoints: 0,
    campaignMultiplier: 1.0,
    campaignBonusPoints: 0,
    totalPointsEarned: 0,
    monetaryEquivalentRupees: 0,
    tierName: 'Standard',
    appliedRuleSnapshot: '₹100 = 1 pt'
  };

  if (!settings || !settings.enabled) return defaultRes;

  // 1. Determine calculation base amount
  let qualifyingAmount = params.billAmount || 0;
  if (settings.calculationBasis === 'Gross Amount' && params.subTotal) {
    qualifyingAmount = params.subTotal;
  } else if (settings.calculationBasis === 'Paid Amount' && typeof params.paidAmount === 'number') {
    qualifyingAmount = params.paidAmount;
  }

  if (qualifyingAmount <= 0) return defaultRes;

  // 2. Base spend to point conversion
  const spendPerPt = settings.spendAmount || 100;
  const ptsPerSpend = settings.pointsEarned || 1;
  const rawBasePoints = (qualifyingAmount / spendPerPt) * ptsPerSpend;

  let basePoints = rawBasePoints;
  if (settings.roundingRule === 'Round Down') {
    basePoints = Math.floor(rawBasePoints);
  } else if (settings.roundingRule === 'Round Up') {
    basePoints = Math.ceil(rawBasePoints);
  } else if (settings.roundingRule === 'Nearest Integer') {
    basePoints = Math.round(rawBasePoints);
  }

  // 3. Customer Tier Multiplier
  const tierInfo = getCustomerTier(
    params.customerPoints || 0,
    params.customerLifetimeSpend || 0,
    settings
  );
  const tierMultiplier = tierInfo.currentTier?.multiplier || 1.0;
  const pointsWithTier = basePoints * tierMultiplier;
  const tierBonusPoints = Math.max(0, pointsWithTier - basePoints);

  // 4. Category-Specific Multipliers (e.g. 1.5x on Lenses)
  const categoryMultipliersApplied: PointsCalculationResult['categoryMultipliersApplied'] = [];
  let categoryExtraPoints = 0;

  if (params.categoryBreakdown && settings.categories) {
    const cats = settings.categories;
    const items = [
      { key: 'frames', amount: params.categoryBreakdown.frames || 0, config: cats.frames },
      { key: 'lenses', amount: params.categoryBreakdown.lenses || 0, config: cats.lenses },
      { key: 'spectacles', amount: params.categoryBreakdown.spectacles || 0, config: cats.spectacles },
      { key: 'accessories', amount: params.categoryBreakdown.accessories || 0, config: cats.accessories },
      { key: 'medicines', amount: params.categoryBreakdown.medicines || 0, config: cats.medicines },
      { key: 'otherProducts', amount: params.categoryBreakdown.otherProducts || 0, config: cats.otherProducts }
    ];

    for (const item of items) {
      if (item.amount > 0 && item.config) {
        if (!item.config.eligible) {
          // Ineligible category - deduct its proportionate contribution
          const ineligiblePts = (item.amount / spendPerPt) * ptsPerSpend;
          categoryExtraPoints -= ineligiblePts;
        } else if (item.config.multiplier > 1.0) {
          const catBasePts = (item.amount / spendPerPt) * ptsPerSpend;
          const extraPts = catBasePts * (item.config.multiplier - 1.0);
          categoryExtraPoints += extraPts;
          categoryMultipliersApplied.push({
            category: item.key,
            amount: item.amount,
            multiplier: item.config.multiplier,
            points: Math.round(extraPts)
          });
        }
      }
    }
  }

  // 5. Milestone Bonuses (e.g., Single bill > ₹3,000 gives +25 pts)
  let milestoneBonusPoints = 0;
  if (settings.milestones && settings.milestones.length > 0) {
    const qualifiedMilestones = settings.milestones
      .filter(m => m.active && qualifyingAmount >= (m.minAmount || 0))
      .sort((a, b) => b.minAmount - a.minAmount);
    if (qualifiedMilestones.length > 0) {
      milestoneBonusPoints = qualifiedMilestones[0].bonusPoints || 0;
    }
  }

  // 6. Active Promotional Campaigns (e.g., 2X Durga Puja Multiplier)
  let campaignMultiplier = 1.0;
  let campaignBonusPoints = 0;
  const today = new Date().toISOString().split('T')[0];

  if (settings.campaignRules && settings.campaignRules.length > 0) {
    const activeCampaigns = settings.campaignRules.filter(
      c => c.active && (!c.startDate || c.startDate <= today) && (!c.endDate || c.endDate >= today)
    );
    for (const camp of activeCampaigns) {
      if (camp.multiplier && camp.multiplier > campaignMultiplier) {
        campaignMultiplier = camp.multiplier;
      }
      if (camp.bonusPoints) {
        campaignBonusPoints += camp.bonusPoints;
      }
    }
  }

  // 7. Calculate Grand Total Points
  const preCampaignPoints = pointsWithTier + categoryExtraPoints + milestoneBonusPoints;
  const totalWithCampaignMultiplier = preCampaignPoints * campaignMultiplier;
  const totalEarnedRaw = totalWithCampaignMultiplier + campaignBonusPoints;

  const totalPointsEarned = Math.max(0, Math.round(totalEarnedRaw));
  const monetaryEquivalentRupees = calculateMonetaryValue(totalPointsEarned, settings);

  const appliedRuleSnapshot = `₹${spendPerPt}=${ptsPerSpend}pt (${tierInfo.currentTier?.name} ${tierMultiplier}x) | Basis: ${settings.calculationBasis}`;

  return {
    basePoints: Math.round(basePoints),
    tierMultiplier,
    tierBonusPoints: Math.round(tierBonusPoints),
    categoryMultipliersApplied,
    milestoneBonusPoints,
    campaignMultiplier,
    campaignBonusPoints,
    totalPointsEarned,
    monetaryEquivalentRupees,
    tierName: tierInfo.currentTier?.name || 'Standard Member',
    appliedRuleSnapshot
  };
}

/**
 * WhatsApp & SMS message template builder with dynamic tag replacement
 */
export function formatLoyaltyMessage(
  template: string,
  params: {
    customerName: string;
    points: number;
    rupeesValue: number;
    tierName: string;
    expiryDate?: string;
    orderId?: string;
    shopName?: string;
    mobile?: string;
  }
): string {
  let msg = template || '';
  msg = msg.replace(/{{customerName}}/g, params.customerName || 'Valued Customer');
  msg = msg.replace(/{{points}}/g, String(params.points || 0));
  msg = msg.replace(/{{expiringPoints}}/g, String(params.points || 0));
  msg = msg.replace(/{{rupeesValue}}/g, String(params.rupeesValue || 0));
  msg = msg.replace(/{{expiringRupees}}/g, String(params.rupeesValue || 0));
  msg = msg.replace(/{{tierName}}/g, params.tierName || 'Member');
  msg = msg.replace(/{{expiryDate}}/g, params.expiryDate || 'in 30 days');
  msg = msg.replace(/{{orderId}}/g, params.orderId || '');
  msg = msg.replace(/{{shopName}}/g, params.shopName || 'Paharpur Eye Care');
  msg = msg.replace(/{{mobile}}/g, params.mobile || '+91 98301 23456');
  return msg;
}

/**
 * Helper to calculate expected points earned on a purchase amount
 */
export function calculatePointsForPurchase(
  amount: number,
  category: 'spectacles' | 'frames' | 'lenses' | 'accessories' | 'medicines' | 'general' = 'spectacles',
  customerTierNameOrPoints: string | number = 'Bronze',
  settings?: LoyaltySettings
): number {
  const cfg = settings || DEFAULT_LOYALTY_SETTINGS;
  if (!cfg.enabled) return 0;
  const result = calculateTransactionPointsEarned(
    {
      billAmount: amount,
      subTotal: amount,
      paidAmount: amount,
      customerPoints: typeof customerTierNameOrPoints === 'number' ? customerTierNameOrPoints : 0,
      customerLifetimeSpend: 0,
      categoryBreakdown: {
        frames: category === 'frames' ? amount : 0,
        lenses: category === 'lenses' ? amount : 0,
        spectacles: category === 'spectacles' ? amount : 0,
        accessories: category === 'accessories' ? amount : 0,
        medicines: category === 'medicines' ? amount : 0
      }
    },
    cfg
  );
  return result.totalPointsEarned;
}
