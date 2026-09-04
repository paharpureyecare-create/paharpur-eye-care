import React, { useState, useMemo } from 'react';
import { Customer, CustomerPowerRecord, EyePower, LoyaltyTransaction } from '../types';
import { useErp } from '../context/ErpContext';
import {
  calculateMonetaryValue,
  calculatePointsForRupees,
  getCustomerTier,
  DEFAULT_LOYALTY_SETTINGS
} from '../utils/loyaltyCalculator';
import {
  X,
  User,
  Phone,
  Calendar,
  Eye,
  ShoppingBag,
  Award,
  Clock,
  Send,
  Plus,
  Edit2,
  FileText,
  CreditCard,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Printer,
  Sparkles,
  Link as LinkIcon,
  Gift,
  Shield,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronRight,
  Check,
  History,
  Zap,
  Tag,
  MessageCircle,
  Percent,
  Star,
  ArrowRight
} from 'lucide-react';

interface Customer360ModalProps {
  customer: Customer;
  onClose: () => void;
}

export const Customer360Modal: React.FC<Customer360ModalProps> = ({ customer, onClose }) => {
  const {
    customers,
    patients,
    spectacleOrders,
    retailSales,
    customerPowers,
    loyaltyLogs,
    appointments,
    settings,
    saveCustomer,
    addCustomerPowerRecord,
    adjustLoyaltyPoints,
    linkPatientAndCustomer,
    setPrintModalData,
    showToast,
    addAuditLog,
    role
  } = useErp();

  // Reactive live customer: auto-updates whenever customer state updates in ErpContext
  const liveCustomer = useMemo(() => {
    return customers.find(c => c.customerId === customer.customerId) || customer;
  }, [customers, customer]);

  const [activeTab, setActiveTab] = useState<'overview' | 'powers' | 'purchases' | 'loyalty' | 'followup' | 'edit'>('overview');
  
  // New Power Form State
  const [showAddPowerModal, setShowAddPowerModal] = useState(false);
  const [powerSource, setPowerSource] = useState<CustomerPowerRecord['source']>('Doctor Prescription');
  const [powerDoctor, setPowerDoctor] = useState('Dr. S. K. Banerjee');
  const [powerNotes, setPowerNotes] = useState('');
  const [odSph, setOdSph] = useState('');
  const [odCyl, setOdCyl] = useState('');
  const [odAxis, setOdAxis] = useState('');
  const [odAdd, setOdAdd] = useState('');
  const [odDistVa, setOdDistVa] = useState('6/6');
  const [odNearVa, setOdNearVa] = useState('N6');
  const [osSph, setOsSph] = useState('');
  const [osCyl, setOsCyl] = useState('');
  const [osAxis, setOsAxis] = useState('');
  const [osAdd, setOsAdd] = useState('');
  const [osDistVa, setOsDistVa] = useState('6/6');
  const [osNearVa, setOsNearVa] = useState('N6');
  const [pd, setPd] = useState('62');

  // Loyalty Adjustment Modal State
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
  const [loyaltyAmount, setLoyaltyAmount] = useState<number>(50);
  const [loyaltyType, setLoyaltyType] = useState<'MANUAL_ADD' | 'MANUAL_DEDUCT' | 'RESET'>('MANUAL_ADD');
  const [loyaltyReason, setLoyaltyReason] = useState('Promotional / Courtesy bonus');

  // Loyalty Redemption Modal State
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState<number>(100);
  const [redeemNote, setRedeemNote] = useState('Optical in-store walk-in counter redemption');
  const [redeemConfirmStep, setRedeemConfirmStep] = useState(false);

  // Loyalty History Filter
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'EARNED' | 'REDEEMED' | 'BONUS' | 'ADJUSTMENT'>('ALL');

  // Link Patient State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedMrdToLink, setSelectedMrdToLink] = useState('');

  // Customer Edit Form State
  const [editFormData, setEditFormData] = useState<Customer>({ ...liveCustomer });

  // Linked Patient Record
  const linkedPatient = patients.find(p => (liveCustomer.mrd && p.mrd === liveCustomer.mrd) || p.mobile === liveCustomer.mobile);

  // Customer's Purchases
  const customerOrders = spectacleOrders.filter(
    o => o.mobile === liveCustomer.mobile || (liveCustomer.mrd && o.mrd === liveCustomer.mrd) || o.customerName.toLowerCase() === liveCustomer.name.toLowerCase()
  );
  const customerInvoices = retailSales.filter(
    s => s.mobile === liveCustomer.mobile || s.mrdOrCustomerId === liveCustomer.customerId || (liveCustomer.mrd && s.mrdOrCustomerId === liveCustomer.mrd)
  );

  // Customer's Power Records
  const powers = customerPowers.filter(p => p.customerId === liveCustomer.customerId || (liveCustomer.mrd && p.mrd === liveCustomer.mrd));

  // Linked Patient's Appointments
  const customerAppointments = useMemo(() => {
    return appointments.filter(
      a =>
        (liveCustomer.mrd && a.patientMrd === liveCustomer.mrd) ||
        (liveCustomer.mobile && a.patientMobile === liveCustomer.mobile) ||
        a.patientName.toLowerCase() === liveCustomer.name.toLowerCase()
    );
  }, [appointments, liveCustomer]);

  // Primary Loyalty Wallet & Calculations
  const loyaltyConfig = settings?.loyaltySettings || DEFAULT_LOYALTY_SETTINGS;
  const currentPoints = liveCustomer.loyaltyPoints || 0;
  const availableRewardValue = calculateMonetaryValue(currentPoints, loyaltyConfig);

  // Total sales spend & due
  const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0) + customerInvoices.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalDue = customerOrders.reduce((sum, o) => sum + o.due, 0) + customerInvoices.reduce((sum, s) => sum + s.due, 0);

  // Tier calculation
  const tierCalculation = useMemo(() => {
    return getCustomerTier(currentPoints, liveCustomer.lifetimeValue || totalSpent, loyaltyConfig);
  }, [currentPoints, liveCustomer.lifetimeValue, totalSpent, loyaltyConfig]);

  const currentTier = tierCalculation.currentTier;
  const nextTier = tierCalculation.nextTier;
  const pointsToNextTier = tierCalculation.pointsToNextTier;
  const spendToNextTier = tierCalculation.spendToNextTier;
  const tierProgressPercent = tierCalculation.progressPercent;

  // Unified Customer Loyalty Transaction History (Primary Loyalty Wallet)
  const loyaltyHistory = useMemo(() => {
    return loyaltyLogs.filter(
      l =>
        l.customerId === liveCustomer.customerId ||
        (liveCustomer.mobile && (l as any).customerMobile === liveCustomer.mobile) ||
        l.customerId === `CUST-${liveCustomer.mobile}` ||
        (liveCustomer.mrd && l.customerId === liveCustomer.mrd) ||
        l.customerName.toLowerCase() === liveCustomer.name.toLowerCase()
    );
  }, [loyaltyLogs, liveCustomer]);

  // Calculate Lifetime Loyalty Metrics
  const lifetimeEarned = useMemo(() => {
    return loyaltyHistory
      .filter(
        l =>
          l.type === 'EARNED' ||
          l.type === 'BONUS' ||
          l.type === 'WELCOME_BONUS' ||
          l.type === 'BIRTHDAY_BONUS' ||
          l.type === 'ANNIVERSARY_BONUS' ||
          l.type === 'REFERRAL_BONUS' ||
          (l.type === 'MANUAL_ADD' && l.points > 0) ||
          l.type === 'REFUND'
      )
      .reduce((sum, l) => sum + (l.points || 0), 0);
  }, [loyaltyHistory]);

  const lifetimeRedeemed = useMemo(() => {
    return loyaltyHistory
      .filter(l => l.type === 'REDEEMED' || (l.type === 'MANUAL_DEDUCT' && l.points > 0))
      .reduce((sum, l) => sum + (l.points || 0), 0);
  }, [loyaltyHistory]);

  const expiredPoints = useMemo(() => {
    return loyaltyHistory
      .filter(l => l.type === 'EXPIRED')
      .reduce((sum, l) => sum + (l.points || 0), 0);
  }, [loyaltyHistory]);

  const pendingPoints = 0; // Immediate real-time settlement

  // Ensure displayed lifetime earned is at least currentPoints + redeemed
  const displayLifetimeEarned = Math.max(lifetimeEarned, currentPoints + lifetimeRedeemed + expiredPoints);

  // Points Expiring Soon Check (within 30 days)
  const pointsExpiringSoon = useMemo(() => {
    const now = new Date();
    const soonThreshold = 30 * 24 * 60 * 60 * 1000;
    let expiring = 0;
    loyaltyHistory.forEach(l => {
      if (l.expiryDate && (l.type === 'EARNED' || l.type === 'BONUS')) {
        const exp = new Date(l.expiryDate).getTime();
        const diff = exp - now.getTime();
        if (diff > 0 && diff <= soonThreshold) {
          expiring += l.points;
        }
      }
    });
    return expiring;
  }, [loyaltyHistory]);

  // Loyalty Status
  const loyaltyStatus: 'Active' | 'Inactive' | 'No Points' | 'Expiring Soon' = useMemo(() => {
    if (currentPoints <= 0) return 'No Points';
    if (pointsExpiringSoon > 0) return 'Expiring Soon';
    if (liveCustomer.status === 'Inactive') return 'Inactive';
    return 'Active';
  }, [currentPoints, pointsExpiringSoon, liveCustomer.status]);

  // Filtered Loyalty Transaction Ledger
  const filteredLoyaltyHistory = useMemo(() => {
    if (historyFilter === 'ALL') return loyaltyHistory;
    if (historyFilter === 'EARNED') return loyaltyHistory.filter(l => l.type === 'EARNED');
    if (historyFilter === 'REDEEMED') return loyaltyHistory.filter(l => l.type === 'REDEEMED');
    if (historyFilter === 'BONUS') return loyaltyHistory.filter(l => l.type === 'BONUS');
    if (historyFilter === 'ADJUSTMENT') {
      return loyaltyHistory.filter(l =>
        l.type.startsWith('MANUAL') ||
        l.type === 'RESET' ||
        l.type === 'REFUND_REVERSAL' ||
        l.type === 'EXPIRED'
      );
    }
    return loyaltyHistory;
  }, [loyaltyHistory, historyFilter]);

  const handleSavePower = (e: React.FormEvent) => {
    e.preventDefault();
    const od: EyePower = {
      sph: odSph,
      cyl: odCyl,
      axis: odAxis,
      add: odAdd,
      distanceVa: odDistVa,
      nearVa: odNearVa,
      pd
    };
    const os: EyePower = {
      sph: osSph,
      cyl: osCyl,
      axis: osAxis,
      add: osAdd,
      distanceVa: osDistVa,
      nearVa: osNearVa,
      pd
    };

    addCustomerPowerRecord({
      customerId: liveCustomer.customerId,
      mrd: liveCustomer.mrd || linkedPatient?.mrd,
      date: new Date().toISOString().split('T')[0],
      odPower: od,
      osPower: os,
      source: powerSource,
      doctor: powerDoctor,
      notes: powerNotes
    });

    setShowAddPowerModal(false);
    // Reset form
    setOdSph('');
    setOdCyl('');
    setOdAxis('');
    setOdAdd('');
    setOsSph('');
    setOsCyl('');
    setOsAxis('');
    setOsAdd('');
    setPowerNotes('');
  };

  const handleSaveLoyalty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loyaltyAmount || loyaltyAmount <= 0) {
      showToast('Please enter valid points amount', 'error');
      return;
    }

    if (role !== 'Admin' && (loyaltyType === 'MANUAL_DEDUCT' || loyaltyType === 'RESET')) {
      showToast('Admin authorization required to deduct or reset points', 'error');
      return;
    }

    const oldPoints = currentPoints;
    let newPoints = oldPoints;
    if (loyaltyType === 'MANUAL_ADD') newPoints = oldPoints + loyaltyAmount;
    if (loyaltyType === 'MANUAL_DEDUCT') newPoints = Math.max(0, oldPoints - loyaltyAmount);
    if (loyaltyType === 'RESET') newPoints = loyaltyAmount;

    adjustLoyaltyPoints(liveCustomer.customerId, Number(loyaltyAmount), loyaltyType, loyaltyReason);

    addAuditLog(
      'ADJUST_LOYALTY',
      'Billing',
      liveCustomer.customerId,
      `Loyalty ${loyaltyType}: ${loyaltyAmount} pts. Old: ${oldPoints} pts, New: ${newPoints} pts. Reason: ${loyaltyReason}`
    );

    setShowLoyaltyModal(false);
  };

  const handleOpenRedeemModal = () => {
    const minRedeem = loyaltyConfig.minRedemptionPoints || 100;
    if (currentPoints < minRedeem) {
      showToast(`Minimum ${minRedeem} points required to redeem rewards (Current: ${currentPoints} pts)`, 'warning');
      return;
    }
    setRedeemPoints(Math.min(currentPoints, Math.max(minRedeem, Math.floor(currentPoints / 100) * 100 || minRedeem)));
    setRedeemConfirmStep(false);
    setShowRedeemModal(true);
  };

  const handleProcessRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    const minRedeem = loyaltyConfig.minRedemptionPoints || 100;

    if (redeemPoints < minRedeem) {
      showToast(`Minimum redemption is ${minRedeem} points`, 'error');
      return;
    }
    if (redeemPoints > currentPoints) {
      showToast(`Cannot redeem ${redeemPoints} points. Available balance is only ${currentPoints} points.`, 'error');
      return;
    }

    if (!redeemConfirmStep) {
      setRedeemConfirmStep(true);
      return;
    }

    // Process redemption
    const rewardVal = calculateMonetaryValue(redeemPoints, loyaltyConfig);
    const oldBal = currentPoints;
    const newBal = currentPoints - redeemPoints;

    adjustLoyaltyPoints(
      liveCustomer.customerId,
      Number(redeemPoints),
      'REDEEMED',
      `Customer 360 Redeemed ${redeemPoints} pts for ₹${rewardVal} reward value. Note: ${redeemNote}`
    );

    addAuditLog(
      'REDEEM_LOYALTY',
      'Billing',
      liveCustomer.customerId,
      `Customer 360 Redemption: ${redeemPoints} pts (₹${rewardVal} value). Old Bal: ${oldBal} pts, New Bal: ${newBal} pts. Customer: ${liveCustomer.name}. Reason: ${redeemNote}`
    );

    showToast(`Successfully redeemed ${redeemPoints} points (₹${rewardVal} reward value)!`, 'success');
    setShowRedeemModal(false);
    setRedeemConfirmStep(false);
  };

  const handleSendLoyaltyWhatsApp = (actionType: 'offer' | 'expiry' | 'reward') => {
    const isOptedOut = liveCustomer.optOutPromotions || liveCustomer.whatsappMarketingStatus === 'Opted Out';
    if (isOptedOut) {
      showToast(
        `Promotional WhatsApp messages are blocked because ${liveCustomer.name} has opted out of marketing promotions.`,
        'warning'
      );
      return;
    }

    let msg = '';
    if (actionType === 'offer') {
      msg = `প্রিয় ${liveCustomer.name}, পাহাড়পুর আই কেয়ারের পক্ষ থেকে শুভেচ্ছা! আপনার লয়্যালটি অ্যাকাউন্টে ${currentPoints} পয়েন্ট (মূল্য ₹${availableRewardValue}) প্রস্তুত রয়েছে। আমাদের নতুন ডিজাইনার ফ্রেম ও লেন্স কালেকশনে এই পয়েন্ট রিডিম করে বিশেষ ছাড় উপভোগ করুন। ভিজিট করুন: পাহাড়পুর আই কেয়ার। যোগাযোগ: +91 98301 23456।`;
    } else if (actionType === 'expiry') {
      msg = `প্রিয় ${liveCustomer.name}, পাহাড়পুর আই কেয়ারের আপনার ${currentPoints} লয়্যালটি পয়েন্ট (মূল্য ₹${availableRewardValue}) শীঘ্রই মেয়াদ শেষ হতে চলেছে! মেয়াদ শেষ হওয়ার পূর্বেই আপনার পছন্দের চশমায় রিডিম করে ইনস্ট্যান্ট ডিসকাউন্ট উপভোগ করুন। যোগাযোগ: +91 98301 23456।`;
    } else {
      msg = `Dear ${liveCustomer.name}, You have ₹${availableRewardValue} (${currentPoints} Points) available reward balance at Paharpur Eye Care! Visit our optical showroom to redeem on frames, lenses, and sunglasses. Contact: +91 98301 23456.`;
    }

    const phone = liveCustomer.whatsapp || liveCustomer.mobile;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    addAuditLog('LOYALTY_MARKETING_WA', 'Billing', liveCustomer.customerId, `Sent Loyalty WhatsApp ${actionType} to ${liveCustomer.name} (${finalPhone})`);
    showToast(`WhatsApp ${actionType} opened successfully!`, 'success');
  };

  const handleLinkPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMrdToLink) return;
    linkPatientAndCustomer(selectedMrdToLink, liveCustomer.customerId);
    setShowLinkModal(false);
  };

  const handleUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomer(editFormData);
    setActiveTab('overview');
  };

  const handleSendWhatsApp = (customMsg?: string) => {
    const defaultMsg = `Dear ${liveCustomer.name}, Greetings from Paharpur Eye Care! Thank you for choosing us for your vision care. For assistance, reach us at +91 98320 12345.`;
    const msg = customMsg || defaultMsg;
    const phone = liveCustomer.whatsapp || liveCustomer.mobile;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePrintCard = () => {
    setPrintModalData({
      type: 'receipt',
      data: {
        customer: liveCustomer,
        linkedPatient,
        powers,
        loyaltyPoints: currentPoints,
        rewardValue: availableRewardValue,
        tier: currentTier.name,
        totalSpent,
        totalDue
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-900 via-teal-900 to-slate-900 text-white">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white text-xl font-bold backdrop-blur-xs shadow-inner">
              {liveCustomer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">{liveCustomer.name}</h2>
                {liveCustomer.nickName && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md text-cyan-100">
                    "{liveCustomer.nickName}"
                  </span>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border bg-amber-400/20 text-amber-200 border-amber-400/40 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-300" /> {currentTier.name}
                </span>
                {liveCustomer.segment && (
                  <span className="text-xs bg-teal-600/60 border border-teal-400/40 text-teal-100 px-2 py-0.5 rounded-full">
                    {liveCustomer.segment}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1 text-xs text-cyan-100 flex-wrap">
                <span className="font-mono bg-black/30 px-2 py-0.5 rounded border border-white/10">
                  ID: {liveCustomer.customerId}
                </span>
                <span className="font-mono bg-amber-950/50 text-amber-200 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                  <Gift className="w-3 h-3 text-amber-300" /> WALLET-{liveCustomer.customerId}
                </span>
                {liveCustomer.mrd ? (
                  <span className="font-mono bg-emerald-950/40 text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Linked MRD: {liveCustomer.mrd}
                  </span>
                ) : linkedPatient ? (
                  <span className="font-mono bg-amber-950/40 text-amber-200 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-amber-400" /> Auto-Matched MRD: {linkedPatient.mrd}
                  </span>
                ) : (
                  <button
                    onClick={() => setShowLinkModal(true)}
                    className="text-cyan-200 hover:text-white underline flex items-center gap-1 cursor-pointer"
                  >
                    <LinkIcon className="w-3 h-3" /> Link with Patient MRD
                  </button>
                )}
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {liveCustomer.mobile}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSendWhatsApp()}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors text-xs flex items-center gap-1.5 font-medium cursor-pointer shadow-xs"
              title="Open WhatsApp Chat"
            >
              <Send className="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button
              onClick={handlePrintCard}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-xs flex items-center gap-1.5 font-medium cursor-pointer"
              title="Print Customer Profile & Rx Card"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-red-500 text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-cyan-600 text-cyan-800 bg-white shadow-xs font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" /> Personal & CRM 360
          </button>
          <button
            onClick={() => setActiveTab('powers')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'powers'
                ? 'border-cyan-600 text-cyan-800 bg-white shadow-xs font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-4 h-4" /> Eye Power History ({powers.length})
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'purchases'
                ? 'border-cyan-600 text-cyan-800 bg-white shadow-xs font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Purchases & Orders ({customerOrders.length + customerInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'loyalty'
                ? 'border-amber-600 text-amber-900 bg-amber-50/50 shadow-xs font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" /> Loyalty & Rewards ({currentPoints} pts / ₹{availableRewardValue})
          </button>
          <button
            onClick={() => setActiveTab('followup')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'followup'
                ? 'border-cyan-600 text-cyan-800 bg-white shadow-xs font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" /> CRM Follow-up & Messages
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ml-auto ${
              activeTab === 'edit'
                ? 'border-cyan-600 text-cyan-800 bg-white shadow-xs font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit2 className="w-4 h-4 text-cyan-600" /> Edit Profile
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-slate-500 font-medium">Total Lifetime Spend</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">₹{totalSpent.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{customerOrders.length + customerInvoices.length} Orders / Bills</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-slate-500 font-medium">Outstanding Balance</p>
                  <p className={`text-xl font-bold mt-1 ${totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ₹{totalDue.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{totalDue > 0 ? 'Pending collection' : 'All cleared'}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs bg-gradient-to-br from-amber-50/40 to-white">
                  <p className="text-xs text-amber-800 font-semibold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" /> Loyalty Reward Balance
                  </p>
                  <p className="text-xl font-bold text-amber-900 mt-1">
                    {currentPoints} <span className="text-xs font-medium text-amber-700">pts (₹{availableRewardValue})</span>
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium mt-0.5">{currentTier.name} Member</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-slate-500 font-medium">Next Eye Checkup Due</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">
                    {liveCustomer.nextEyeTestDate || liveCustomer.nextFollowUp || '6 Months (Recommended)'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Annual Vision Review</p>
                </div>
              </div>

              {/* LOYALTY & REWARDS SUMMARY CARD (CUSTOMER 360 CORE REQUIREMENT) */}
              <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-md overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white backdrop-blur-xs shadow-inner">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-white tracking-tight">Loyalty & Rewards Summary</h3>
                        <span className="font-mono text-[11px] bg-black/25 text-amber-200 px-2 py-0.5 rounded border border-white/20">
                          WALLET-{liveCustomer.customerId}
                        </span>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold shadow-xs ${
                          loyaltyStatus === 'Active'
                            ? 'bg-emerald-500 text-white'
                            : loyaltyStatus === 'Expiring Soon'
                            ? 'bg-rose-500 text-white animate-pulse'
                            : loyaltyStatus === 'No Points'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-amber-200 text-amber-900'
                        }`}>
                          {loyaltyStatus === 'Expiring Soon' ? '⚠️ Expiring Soon' : loyaltyStatus}
                        </span>
                      </div>
                      <p className="text-xs text-amber-100 mt-0.5">
                        Tier: <span className="font-semibold text-white">{currentTier.name}</span> • Rate: {loyaltyConfig.pointsForValue} Points = ₹{loyaltyConfig.valueInRupees} ({currentTier.pointsMultiplier}x Earning Multiplier)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setShowLoyaltyModal(true)}
                      className="px-3 py-1.5 bg-white text-amber-900 hover:bg-amber-50 rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Add or manually adjust loyalty points"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Add Points
                    </button>
                    <button
                      onClick={handleOpenRedeemModal}
                      className="px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Redeem points for instant invoice discount"
                    >
                      <Tag className="w-3.5 h-3.5" /> Redeem Points
                    </button>
                    <button
                      onClick={() => setActiveTab('loyalty')}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="View complete transaction history"
                    >
                      <History className="w-3.5 h-3.5" /> Full History
                    </button>
                    <button
                      onClick={() => handleSendLoyaltyWhatsApp('offer')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Send loyalty offer via WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Offer
                    </button>
                  </div>
                </div>

                {/* Warning Banner if points are expiring soon */}
                {pointsExpiringSoon > 0 && (
                  <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 flex items-center justify-between text-xs text-rose-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        <strong>⚠️ Points Expiring Soon:</strong> {pointsExpiringSoon} points are set to expire within 30 days! Advise customer to redeem on spectacle purchase.
                      </span>
                    </div>
                    <button
                      onClick={() => handleSendLoyaltyWhatsApp('expiry')}
                      className="text-rose-700 hover:text-rose-900 font-bold underline flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Send Expiry Reminder
                    </button>
                  </div>
                )}

                <div className="p-5 space-y-4">
                  {/* Dynamic Rule Note Banner */}
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-900">
                      <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Current Point Value (Admin Settings):</strong> {loyaltyConfig.pointsForValue} Points = ₹{loyaltyConfig.valueInRupees} (1 pt = ₹{(loyaltyConfig.valueInRupees / loyaltyConfig.pointsForValue).toFixed(2)}) • Min. Redemption: {loyaltyConfig.minRedemptionPoints} pts
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-800 font-semibold bg-amber-200/60 px-2.5 py-1 rounded-md">
                      Auto-Calculated in Real-Time
                    </div>
                  </div>

                  {/* 8-Grid Metric Display */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-500 font-medium">Current Loyalty Points</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">{currentPoints} <span className="text-xs text-slate-500 font-normal">pts</span></p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Live Wallet Balance</p>
                    </div>
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                      <p className="text-[11px] text-emerald-700 font-medium">Available Reward Value</p>
                      <p className="text-xl font-bold text-emerald-900 mt-1">₹{availableRewardValue}</p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Instant Discount Available</p>
                    </div>
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                      <p className="text-[11px] text-amber-800 font-medium">Loyalty Tier</p>
                      <p className="text-base font-bold text-amber-900 mt-1 flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {currentTier.name}
                      </p>
                      <p className="text-[10px] text-amber-700 mt-0.5">{currentTier.pointsMultiplier}x Points Earning</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-500 font-medium">Lifetime Points Earned</p>
                      <p className="text-lg font-bold text-slate-800 mt-1">{displayLifetimeEarned} <span className="text-xs text-slate-500 font-normal">pts</span></p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Cumulative Earned</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-500 font-medium">Lifetime Points Redeemed</p>
                      <p className="text-lg font-bold text-slate-800 mt-1">{lifetimeRedeemed} <span className="text-xs text-slate-500 font-normal">pts</span></p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Discounts Claimed</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-500 font-medium">Expired Points</p>
                      <p className="text-lg font-bold text-slate-800 mt-1">{expiredPoints} <span className="text-xs text-slate-500 font-normal">pts</span></p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Unused Points Expired</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-500 font-medium">Pending Points</p>
                      <p className="text-lg font-bold text-slate-800 mt-1">{pendingPoints} <span className="text-xs text-slate-500 font-normal">pts</span></p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Settlement (Immediate)</p>
                    </div>
                    <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200">
                      <p className="text-[11px] text-rose-700 font-medium">Points Expiring Soon</p>
                      <p className="text-lg font-bold text-rose-900 mt-1">{pointsExpiringSoon} <span className="text-xs text-rose-600 font-normal">pts</span></p>
                      <p className="text-[10px] text-rose-600 mt-0.5">Next 30 Days</p>
                    </div>
                  </div>

                  {/* Tier Progress Bar */}
                  {nextTier && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-500" /> Tier Upgrade Progress: <strong>{currentTier.name}</strong> → <strong>{nextTier.name}</strong>
                        </span>
                        <span className="text-slate-500 font-mono">
                          {pointsToNextTier > 0 ? `${pointsToNextTier} pts needed` : 'Upgrade eligible'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${tierProgressPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Current points: {currentPoints} pts</span>
                        <span>Next Tier: {nextTier.name} ({nextTier.minPoints} pts or ₹{nextTier.minSpend.toLocaleString()} spend)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD: COMPLETE PERSONAL & CONTACT IDENTITY */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-600" /> Complete Personal & Contact Identity
                  </h3>
                  <button
                    onClick={() => setActiveTab('edit')}
                    className="text-xs text-cyan-700 hover:text-cyan-800 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Details
                  </button>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-slate-400 block">Full Name & Nick Name</span>
                      <span className="font-medium text-slate-800">{liveCustomer.name} {liveCustomer.nickName ? `(${liveCustomer.nickName})` : ''}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Age & Gender</span>
                      <span className="font-medium text-slate-800">{liveCustomer.age || 'N/A'} Yrs / {liveCustomer.gender || 'Not Specified'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Date of Birth</span>
                      <span className="font-medium text-slate-800">{liveCustomer.dob || 'Not recorded'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Blood Group</span>
                      <span className="font-medium text-slate-800">{liveCustomer.bloodGroup || 'Not specified'}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-slate-400 block">Mobile & WhatsApp</span>
                      <span className="font-medium text-slate-800">{liveCustomer.mobile} {liveCustomer.whatsapp ? ` / WA: ${liveCustomer.whatsapp}` : ''}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Alternative Mobile</span>
                      <span className="font-medium text-slate-800">{liveCustomer.altMobile || 'None'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Email Address</span>
                      <span className="font-medium text-slate-800">{liveCustomer.email || 'None'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Profession & Workplace</span>
                      <span className="font-medium text-slate-800">{liveCustomer.profession || 'N/A'} {liveCustomer.company ? `(${liveCustomer.company})` : ''}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-slate-400 block">Father / Mother / Spouse</span>
                      <span className="font-medium text-slate-800">
                        {liveCustomer.spouseName ? `Spouse: ${liveCustomer.spouseName}` : liveCustomer.fatherName ? `Father: ${liveCustomer.fatherName}` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Marriage Anniversary</span>
                      <span className="font-medium text-slate-800">{liveCustomer.marriageAnniversary || 'Not recorded'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Education Qualification</span>
                      <span className="font-medium text-slate-800">{liveCustomer.education || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Address</span>
                      <span className="font-medium text-slate-800">
                        {liveCustomer.village ? `${liveCustomer.village}, ` : ''}
                        {liveCustomer.postOffice ? `PO: ${liveCustomer.postOffice}, ` : ''}
                        {liveCustomer.policeStation ? `PS: ${liveCustomer.policeStation}, ` : ''}
                        {liveCustomer.district ? `${liveCustomer.district}, ` : ''}
                        {liveCustomer.pinCode || ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD: PURCHASE SUMMARY */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-cyan-600" /> Purchase & Order Summary
                  </h3>
                  <button
                    onClick={() => setActiveTab('purchases')}
                    className="text-xs text-cyan-700 hover:text-cyan-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    View All Orders & Invoices <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Total Purchases Amount</span>
                    <span className="text-base font-bold text-slate-900 mt-0.5 block">₹{totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Custom Spectacle Orders</span>
                    <span className="text-base font-bold text-slate-900 mt-0.5 block">{customerOrders.length} Orders</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Retail Counter Invoices</span>
                    <span className="text-base font-bold text-slate-900 mt-0.5 block">{customerInvoices.length} Invoices</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Last Purchase Date</span>
                    <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                      {customerOrders[0]?.orderDate || customerInvoices[0]?.date || 'No purchases yet'}
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD: LATEST VISION PRESCRIPTION */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-600" /> Vision Prescription Summary
                  </h3>
                  <button
                    onClick={() => setShowAddPowerModal(true)}
                    className="text-xs bg-cyan-700 hover:bg-cyan-800 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Record New Power
                  </button>
                </div>

                {powers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Eye</th>
                          <th className="p-2.5">SPH</th>
                          <th className="p-2.5">CYL</th>
                          <th className="p-2.5">AXIS</th>
                          <th className="p-2.5">ADD</th>
                          <th className="p-2.5">Distance VA</th>
                          <th className="p-2.5">Near VA</th>
                          <th className="p-2.5">PD</th>
                          <th className="p-2.5">Date & Source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y border-slate-200">
                        <tr className="bg-white">
                          <td className="p-2.5 font-bold text-cyan-800">Right Eye (OD)</td>
                          <td className="p-2.5 font-mono">{powers[0].odPower.sph || '0.00'}</td>
                          <td className="p-2.5 font-mono">{powers[0].odPower.cyl || '0.00'}</td>
                          <td className="p-2.5 font-mono">{powers[0].odPower.axis || '-'}</td>
                          <td className="p-2.5 font-mono">{powers[0].odPower.add || '-'}</td>
                          <td className="p-2.5">{powers[0].odPower.distanceVa || '6/6'}</td>
                          <td className="p-2.5">{powers[0].odPower.nearVa || 'N6'}</td>
                          <td className="p-2.5">{powers[0].odPower.pd || '62'}mm</td>
                          <td className="p-2.5 text-slate-500" rowSpan={2}>
                            <div className="font-medium text-slate-700">{powers[0].date}</div>
                            <div className="text-[11px] text-slate-400">{powers[0].source}</div>
                            <div className="text-[11px] text-cyan-700">{powers[0].doctor || 'Dr. S. K. Banerjee'}</div>
                          </td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="p-2.5 font-bold text-teal-800">Left Eye (OS)</td>
                          <td className="p-2.5 font-mono">{powers[0].osPower.sph || '0.00'}</td>
                          <td className="p-2.5 font-mono">{powers[0].osPower.cyl || '0.00'}</td>
                          <td className="p-2.5 font-mono">{powers[0].osPower.axis || '-'}</td>
                          <td className="p-2.5 font-mono">{powers[0].osPower.add || '-'}</td>
                          <td className="p-2.5">{powers[0].osPower.distanceVa || '6/6'}</td>
                          <td className="p-2.5">{powers[0].osPower.nearVa || 'N6'}</td>
                          <td className="p-2.5">{powers[0].osPower.pd || '62'}mm</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <Eye className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 font-medium">No power prescription history logged yet.</p>
                    <button
                      onClick={() => setShowAddPowerModal(true)}
                      className="mt-2 text-xs text-cyan-700 font-semibold hover:underline"
                    >
                      + Add first prescription power record
                    </button>
                  </div>
                )}
              </div>

              {/* CARD: APPOINTMENT SUMMARY (LINKED CLINICAL VISITS) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-600" /> Eye Clinic Appointments & Consultations
                  </h3>
                  {liveCustomer.mrd && (
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-medium">
                      MRD: {liveCustomer.mrd}
                    </span>
                  )}
                </div>

                {customerAppointments.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {customerAppointments.map((apt, i) => (
                      <div key={apt.id || i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-cyan-900 bg-cyan-100 px-2 py-0.5 rounded">{apt.date}</span>
                          <span className="text-slate-600">• {apt.doctorName || 'Eye Specialist'}</span>
                          <span className="text-slate-500">({apt.type || 'Consultation'})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            apt.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {apt.status}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">Token: #{apt.queueNumber || '1'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                    <span>No OPD doctor appointments recorded for this profile.</span>
                    {!liveCustomer.mrd && (
                      <button
                        onClick={() => setShowLinkModal(true)}
                        className="text-cyan-700 font-semibold hover:underline"
                      >
                        + Link with patient MRD to view clinical records
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* CARD: PAYMENT & DUE SUMMARY */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-600" /> Payment & Due Balance Summary
                  </h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    totalDue > 0 ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {totalDue > 0 ? '⚠️ Outstanding Due Balance' : '✓ All Payments Cleared'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Total Billed Amount</span>
                    <span className="text-lg font-bold text-slate-900 mt-1 block">₹{totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                    <span className="text-emerald-700 block text-[11px]">Total Payments Received</span>
                    <span className="text-lg font-bold text-emerald-900 mt-1 block">₹{(totalSpent - totalDue).toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-red-50/60 rounded-lg border border-red-200">
                    <span className="text-red-700 block text-[11px]">Net Outstanding Due</span>
                    <span className="text-lg font-bold text-red-800 mt-1 block">₹{totalDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* CARD: WHATSAPP ACTIVITY & COMMUNICATION TIMELINE */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Activity & CRM Follow-up
                  </h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    liveCustomer.optOutPromotions || liveCustomer.whatsappMarketingStatus === 'Opted Out'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {liveCustomer.optOutPromotions || liveCustomer.whatsappMarketingStatus === 'Opted Out'
                      ? '🚫 Marketing Opted Out'
                      : '✓ Active WhatsApp Marketing Opt-In'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <p className="text-slate-500 text-[11px] font-medium">Next Scheduled Follow-up</p>
                    <p className="font-bold text-slate-800">{liveCustomer.nextFollowUp || '6 Months Vision Review'}</p>
                    <p className="text-[11px] text-slate-400">{liveCustomer.followUpNote || 'Annual comprehensive vision and spectacle fitting review.'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <p className="text-slate-500 text-[11px] font-medium">Quick WhatsApp Message</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleSendWhatsApp()}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" /> General Greeting
                      </button>
                      <button
                        onClick={() => handleSendLoyaltyWhatsApp('offer')}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Award className="w-3 h-3" /> Loyalty Promo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POWER PRESCRIPTIONS HISTORY */}
          {activeTab === 'powers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-sm">Vision & Power Records History</h3>
                <button
                  onClick={() => setShowAddPowerModal(true)}
                  className="text-xs bg-cyan-700 hover:bg-cyan-800 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Record Power
                </button>
              </div>

              {powers.length > 0 ? (
                <div className="space-y-3">
                  {powers.map((p, idx) => (
                    <div key={p.powerId || idx} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded">
                            {p.date}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            Source: {p.source}
                          </span>
                          {p.doctor && (
                            <span className="text-xs text-slate-600 font-medium">
                              • Prescribed By: {p.doctor}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">ID: {p.powerId}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-cyan-50/60 rounded-lg border border-cyan-100">
                          <p className="font-bold text-cyan-900 mb-1.5">Right Eye (OD)</p>
                          <div className="grid grid-cols-4 gap-2 font-mono">
                            <div><span className="text-slate-400 block text-[10px]">SPH</span> {p.odPower.sph || '0.00'}</div>
                            <div><span className="text-slate-400 block text-[10px]">CYL</span> {p.odPower.cyl || '0.00'}</div>
                            <div><span className="text-slate-400 block text-[10px]">AXIS</span> {p.odPower.axis || '-'}</div>
                            <div><span className="text-slate-400 block text-[10px]">ADD</span> {p.odPower.add || '-'}</div>
                          </div>
                          <div className="mt-2 text-[11px] text-slate-600">
                            Dist VA: {p.odPower.distanceVa || '6/6'} | Near: {p.odPower.nearVa || 'N6'}
                          </div>
                        </div>

                        <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-100">
                          <p className="font-bold text-teal-900 mb-1.5">Left Eye (OS)</p>
                          <div className="grid grid-cols-4 gap-2 font-mono">
                            <div><span className="text-slate-400 block text-[10px]">SPH</span> {p.osPower.sph || '0.00'}</div>
                            <div><span className="text-slate-400 block text-[10px]">CYL</span> {p.osPower.cyl || '0.00'}</div>
                            <div><span className="text-slate-400 block text-[10px]">AXIS</span> {p.osPower.axis || '-'}</div>
                            <div><span className="text-slate-400 block text-[10px]">ADD</span> {p.osPower.add || '-'}</div>
                          </div>
                          <div className="mt-2 text-[11px] text-slate-600">
                            Dist VA: {p.osPower.distanceVa || '6/6'} | Near: {p.osPower.nearVa || 'N6'}
                          </div>
                        </div>
                      </div>

                      {p.notes && (
                        <p className="mt-2.5 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                          <span className="font-medium">Advice / Notes:</span> {p.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                  <p className="text-slate-500 text-sm">No historical vision records logged for this customer.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PURCHASES & ORDERS */}
          {activeTab === 'purchases' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-sm">Spectacle Orders & Retail Invoices</h3>
                <span className="text-xs bg-cyan-50 text-cyan-800 px-2.5 py-1 rounded-full border border-cyan-200 font-medium">
                  {customerOrders.length + customerInvoices.length} Total Transactions
                </span>
              </div>

              {/* Spectacle Orders */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700 flex items-center justify-between">
                  <span>Custom Spectacle Orders ({customerOrders.length})</span>
                  <span className="text-[11px] text-slate-500 font-normal">Eligible for loyalty points on settlement</span>
                </div>
                {customerOrders.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {customerOrders.map(o => {
                      // Check for linked loyalty transactions
                      const linkedEarned = loyaltyHistory.find(
                        l => (l.orderId === o.orderId || l.referenceId === o.orderId) && (l.type === 'EARNED' || l.type === 'BONUS')
                      );
                      const linkedRedeemed = loyaltyHistory.find(
                        l => (l.orderId === o.orderId || l.referenceId === o.orderId) && l.type === 'REDEEMED'
                      );

                      return (
                        <div key={o.orderId} className="p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-cyan-800">{o.orderId}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600">{o.orderDate}</span>
                              <span className="px-2 py-0.5 rounded-full font-medium text-[10px] bg-blue-100 text-blue-800">
                                {o.status}
                              </span>
                              {linkedEarned && (
                                <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                                  <Award className="w-3 h-3 text-emerald-600" /> +{linkedEarned.points} pts Earned
                                </span>
                              )}
                              {linkedRedeemed && (
                                <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                                  <Tag className="w-3 h-3 text-amber-600" /> -{linkedRedeemed.points} pts Redeemed (₹{linkedRedeemed.monetaryValue || (linkedRedeemed.points * loyaltyConfig.valueInRupees / loyaltyConfig.pointsForValue)})
                                </span>
                              )}
                            </div>
                            <div className="text-slate-700">
                              Frame: <span className="font-medium">{o.frameBrand} ({o.frameSku})</span> | Lens: <span className="font-medium">{o.lensBrand || o.lensCode}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold text-slate-900 text-sm">₹{o.total}</div>
                            <div className="text-[11px] text-slate-500">
                              Advance: ₹{o.advance} | <span className={o.due > 0 ? 'text-red-600 font-semibold' : 'text-emerald-600'}>Due: ₹{o.due}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">No spectacle orders placed yet.</div>
                )}
              </div>

              {/* Retail Sales Invoices */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700 flex items-center justify-between">
                  <span>Retail Counter Sales ({customerInvoices.length})</span>
                  <span className="text-[11px] text-slate-500 font-normal">Direct optical retail counter billing</span>
                </div>
                {customerInvoices.length > 0 ? (
                  <div className="divide-y divide-slate-200">
                    {customerInvoices.map(s => {
                      const linkedEarned = loyaltyHistory.find(
                        l => (l.invoiceId === s.invoiceNumber || l.referenceId === s.invoiceNumber) && (l.type === 'EARNED' || l.type === 'BONUS')
                      );
                      const linkedRedeemed = loyaltyHistory.find(
                        l => (l.invoiceId === s.invoiceNumber || l.referenceId === s.invoiceNumber) && l.type === 'REDEEMED'
                      );

                      return (
                        <div key={s.invoiceNumber} className="p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-teal-800">{s.invoiceNumber}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600">{s.date}</span>
                              <span className="px-2 py-0.5 rounded-full font-medium text-[10px] bg-emerald-100 text-emerald-800">
                                {s.status}
                              </span>
                              {linkedEarned && (
                                <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                                  <Award className="w-3 h-3 text-emerald-600" /> +{linkedEarned.points} pts Earned
                                </span>
                              )}
                              {linkedRedeemed && (
                                <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                                  <Tag className="w-3 h-3 text-amber-600" /> -{linkedRedeemed.points} pts Redeemed (₹{linkedRedeemed.monetaryValue || (linkedRedeemed.points * loyaltyConfig.valueInRupees / loyaltyConfig.pointsForValue)})
                                </span>
                              )}
                            </div>
                            <div className="text-slate-700">
                              {s.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold text-slate-900 text-sm">₹{s.grandTotal}</div>
                            <div className="text-[11px] text-slate-500">
                              Paid: ₹{s.paid} | Mode: {s.paymentMode}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">No retail counter invoices found.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LOYALTY & REWARDS FULL MANAGEMENT */}
          {activeTab === 'loyalty' && (
            <div className="space-y-6">
              {/* Main Wallet Banner */}
              <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white rounded-2xl p-6 shadow-lg border border-amber-400/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs uppercase tracking-wider text-amber-200 font-bold bg-black/20 px-2.5 py-0.5 rounded border border-white/15">
                        PAHARPUR EYE CARE LOYALTY WALLET
                      </span>
                      <span className="font-mono text-xs text-amber-300 bg-black/30 px-2 py-0.5 rounded">
                        WALLET-{liveCustomer.customerId}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white text-amber-900 shadow-xs">
                        {currentTier.name} Member ({currentTier.pointsMultiplier}x)
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3 pt-1">
                      <h3 className="text-4xl font-black tracking-tight">{currentPoints}</h3>
                      <span className="text-base font-semibold text-amber-200">Loyalty Points Balance</span>
                      <span className="text-sm font-bold bg-emerald-500/80 text-white px-2.5 py-0.5 rounded-full shadow-inner">
                        = ₹{availableRewardValue} Instant Value
                      </span>
                    </div>

                    <p className="text-xs text-amber-100/90 pt-1">
                      Dynamic Exchange Rate: <strong>{loyaltyConfig.pointsForValue} Points = ₹{loyaltyConfig.valueInRupees}</strong> (1 pt = ₹{(loyaltyConfig.valueInRupees / loyaltyConfig.pointsForValue).toFixed(2)}) • Minimum to redeem: <strong>{loyaltyConfig.minRedemptionPoints} pts</strong> • Max discount: <strong>{loyaltyConfig.maxDiscountPercentage}%</strong>
                    </p>
                  </div>

                  {/* Quick Action Buttons on Wallet Header */}
                  <div className="flex flex-wrap gap-2 md:self-center">
                    <button
                      onClick={() => setShowLoyaltyModal(true)}
                      className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> + Add Points
                    </button>
                    <button
                      onClick={handleOpenRedeemModal}
                      className="px-4 py-2 bg-amber-950 hover:bg-black text-amber-100 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-amber-500/40"
                    >
                      <Tag className="w-4 h-4 text-amber-400" /> Redeem Points
                    </button>
                    <button
                      onClick={() => setShowLoyaltyModal(true)}
                      className="px-3 py-2 bg-amber-800/80 hover:bg-amber-800 text-white rounded-xl font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Adjust Balance
                    </button>
                  </div>
                </div>
              </div>

              {/* 6 Metric Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-slate-500 font-medium">Current Points</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{currentPoints} <span className="text-xs text-slate-500 font-normal">pts</span></p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Live Wallet</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
                  <p className="text-[11px] text-emerald-700 font-medium">Available Value</p>
                  <p className="text-xl font-bold text-emerald-900 mt-1">₹{availableRewardValue}</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Instant Discount</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-slate-500 font-medium">Lifetime Earned</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{displayLifetimeEarned} <span className="text-xs text-slate-500 font-normal">pts</span></p>
                  <p className="text-[10px] text-slate-400 mt-0.5">All purchases</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-slate-500 font-medium">Lifetime Redeemed</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{lifetimeRedeemed} <span className="text-xs text-slate-500 font-normal">pts</span></p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Used in bills</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] text-slate-500 font-medium">Expired Points</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{expiredPoints} <span className="text-xs text-slate-500 font-normal">pts</span></p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Unredeemed</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 shadow-xs">
                  <p className="text-[11px] text-rose-700 font-medium">Expiring Soon</p>
                  <p className="text-lg font-bold text-rose-900 mt-1">{pointsExpiringSoon} <span className="text-xs text-rose-600 font-normal">pts</span></p>
                  <p className="text-[10px] text-rose-600 font-medium mt-0.5">Next 30 Days</p>
                </div>
              </div>

              {/* Marketing & Messaging Quick Triggers */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Loyalty Marketing & Alerts
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Send personalized WhatsApp messages with current reward point balance and promo offers.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleSendLoyaltyWhatsApp('offer')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Promo Offer
                  </button>
                  <button
                    onClick={() => handleSendLoyaltyWhatsApp('reward')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Gift className="w-3.5 h-3.5" /> Send Reward Available
                  </button>
                  {pointsExpiringSoon > 0 && (
                    <button
                      onClick={() => handleSendLoyaltyWhatsApp('expiry')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Expiry Alert
                    </button>
                  )}
                </div>
              </div>

              {/* Detailed Transaction History Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-600" /> Loyalty Points Ledger & Audit Trail
                    </h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Showing {filteredLoyaltyHistory.length} of {loyaltyHistory.length} transactions
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs overflow-x-auto text-xs">
                    {(['ALL', 'EARNED', 'REDEEMED', 'BONUS', 'ADJUSTMENT'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setHistoryFilter(f)}
                        className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer whitespace-nowrap ${
                          historyFilter === f
                            ? 'bg-amber-600 text-white font-bold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {f === 'ALL' ? 'All Logs' : f.charAt(0) + f.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredLoyaltyHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Date & Time</th>
                          <th className="p-3">Action Type</th>
                          <th className="p-3">Reference / Bill</th>
                          <th className="p-3 text-right">Points Change</th>
                          <th className="p-3 text-right">Wallet Balance</th>
                          <th className="p-3">Reason / Applied Rule Snapshot</th>
                          <th className="p-3">User / Operator</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredLoyaltyHistory.map(l => {
                          const isNegative =
                            l.type.includes('DEDUCT') ||
                            l.type === 'REDEEMED' ||
                            l.type === 'EXPIRED' ||
                            l.type === 'REFUND_REVERSAL';

                          return (
                            <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="p-3 text-slate-600 whitespace-nowrap">
                                <div className="font-medium text-slate-800">{l.date}</div>
                                {l.expiryDate && (
                                  <div className="text-[10px] text-slate-400">Exp: {l.expiryDate}</div>
                                )}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-block ${
                                  l.type === 'EARNED'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : l.type === 'REDEEMED'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : l.type === 'BONUS'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : l.type === 'EXPIRED'
                                    ? 'bg-slate-200 text-slate-700'
                                    : l.type === 'REFUND_REVERSAL'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}>
                                  {l.type.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-slate-700">
                                {l.invoiceId || l.orderId || l.referenceId || '-'}
                                {l.monetaryValue ? (
                                  <div className="text-[10px] text-emerald-700 font-sans font-medium">₹{l.monetaryValue} Value</div>
                                ) : null}
                              </td>
                              <td className="p-3 text-right">
                                <span className={`font-bold text-sm ${isNegative ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {isNegative ? '-' : '+'}{l.points} pts
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-slate-800">
                                {l.newPoints} pts
                              </td>
                              <td className="p-3 max-w-xs">
                                <div className="text-slate-800 font-medium">{l.reason}</div>
                                {l.appliedRuleSnapshot && (
                                  <div className="text-[10px] text-slate-400 mt-0.5 truncate" title={l.appliedRuleSnapshot}>
                                    Snapshot: {l.appliedRuleSnapshot}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-slate-500 whitespace-nowrap">
                                <div className="font-medium text-slate-700">{l.user || 'Admin'}</div>
                                <div className="text-[10px] text-slate-400">Paharpur POS</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No loyalty transactions match the selected filter.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: FOLLOW-UP & MESSAGES */}
          {activeTab === 'followup' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Quick CRM Communication Triggers</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> Annual Eye Checkup Reminder
                  </h4>
                  <p className="text-xs text-slate-500">
                    Remind customer that 1 year has elapsed since their last eye checkup.
                  </p>
                  <button
                    onClick={() =>
                      handleSendWhatsApp(
                        `Dear ${customer.name}, It has been over 12 months since your last eye examination at Paharpur Eye Care. Regular eye checkups ensure healthy vision. Book your consultation today: +91 98320 12345.`
                      )
                    }
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Eye Test Due Reminder
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" /> Birthday / Anniversary Greeting
                  </h4>
                  <p className="text-xs text-slate-500">
                    Send special greetings with an exclusive 10% discount on frames.
                  </p>
                  <button
                    onClick={() =>
                      handleSendWhatsApp(
                        `Happy Greetings to ${customer.name} from Paharpur Eye Care! On your special occasion, enjoy an exclusive 10% discount and double loyalty points on your next spectacle purchase! Visit us soon.`
                      )
                    }
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Special Occasion Greeting
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-600" /> Spectacle Ready for Delivery
                  </h4>
                  <p className="text-xs text-slate-500">
                    Notify that their spectacle has arrived from the lab fitting bench.
                  </p>
                  <button
                    onClick={() =>
                      handleSendWhatsApp(
                        `Dear ${customer.name}, Your ordered spectacles are ready for collection at Paharpur Eye Care! Please visit with your order receipt to collect and get the final fitting check.`
                      )
                    }
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Delivery Ready Alert
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-red-600" /> Outstanding Due Payment Reminder
                  </h4>
                  <p className="text-xs text-slate-500">
                    Kindly remind regarding remaining balance of ₹{totalDue}.
                  </p>
                  <button
                    onClick={() =>
                      handleSendWhatsApp(
                        `Dear ${customer.name}, This is a friendly reminder from Paharpur Eye Care regarding your pending balance of ₹${totalDue}. Kindly clear the balance at your earliest convenience. UPI / Cash accepted.`
                      )
                    }
                    className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Due Reminder (₹{totalDue})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: EDIT PROFILE */}
          {activeTab === 'edit' && (
            <form onSubmit={handleUpdateCustomer} className="space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-800 text-base border-b border-slate-200 pb-3">Edit Customer 360 Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nick Name</label>
                  <input
                    type="text"
                    value={editFormData.nickName || ''}
                    onChange={e => setEditFormData({ ...editFormData, nickName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Primary Mobile *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.mobile}
                    onChange={e => setEditFormData({ ...editFormData, mobile: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={editFormData.whatsapp || ''}
                    onChange={e => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Alternative Mobile</label>
                  <input
                    type="text"
                    value={editFormData.altMobile || ''}
                    onChange={e => setEditFormData({ ...editFormData, altMobile: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Age</label>
                  <input
                    type="number"
                    value={editFormData.age || ''}
                    onChange={e => setEditFormData({ ...editFormData, age: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Gender</label>
                  <select
                    value={editFormData.gender || 'Male'}
                    onChange={e => setEditFormData({ ...editFormData, gender: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={editFormData.bloodGroup || ''}
                    onChange={e => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                    placeholder="e.g. O+, B+, A+"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editFormData.dob || ''}
                    onChange={e => setEditFormData({ ...editFormData, dob: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Father's Name</label>
                  <input
                    type="text"
                    value={editFormData.fatherName || ''}
                    onChange={e => setEditFormData({ ...editFormData, fatherName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Spouse Name</label>
                  <input
                    type="text"
                    value={editFormData.spouseName || ''}
                    onChange={e => setEditFormData({ ...editFormData, spouseName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Marriage Anniversary</label>
                  <input
                    type="date"
                    value={editFormData.marriageAnniversary || ''}
                    onChange={e => setEditFormData({ ...editFormData, marriageAnniversary: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Profession</label>
                  <input
                    type="text"
                    value={editFormData.profession || ''}
                    onChange={e => setEditFormData({ ...editFormData, profession: e.target.value })}
                    placeholder="e.g. Teacher, Advocate, Business"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Workplace / Company</label>
                  <input
                    type="text"
                    value={editFormData.company || ''}
                    onChange={e => setEditFormData({ ...editFormData, company: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Village / Town</label>
                  <input
                    type="text"
                    value={editFormData.village || ''}
                    onChange={e => setEditFormData({ ...editFormData, village: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Post Office (PO)</label>
                  <input
                    type="text"
                    value={editFormData.postOffice || ''}
                    onChange={e => setEditFormData({ ...editFormData, postOffice: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Police Station (PS)</label>
                  <input
                    type="text"
                    value={editFormData.policeStation || ''}
                    onChange={e => setEditFormData({ ...editFormData, policeStation: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={editFormData.district || 'South 24 Parganas'}
                    onChange={e => setEditFormData({ ...editFormData, district: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={editFormData.pinCode || ''}
                    onChange={e => setEditFormData({ ...editFormData, pinCode: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">CRM Segment</label>
                  <select
                    value={editFormData.segment || 'Regular Customer'}
                    onChange={e => setEditFormData({ ...editFormData, segment: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="New Customer">New Customer</option>
                    <option value="Existing Patient">Existing Patient</option>
                    <option value="Spectacle Buyer">Spectacle Buyer</option>
                    <option value="Repeat Customer">Repeat Customer</option>
                    <option value="High Value Customer">High Value Customer</option>
                    <option value="VIP Customer">VIP Customer</option>
                    <option value="Due Customer">Due Customer</option>
                    <option value="Follow-up Due">Follow-up Due</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold shadow-xs cursor-pointer text-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* MODAL: ADD POWER PRESCRIPTION */}
      {showAddPowerModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-700" /> Record Vision Power History
              </h3>
              <button onClick={() => setShowAddPowerModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePower} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Prescription Source</label>
                  <select
                    value={powerSource}
                    onChange={e => setPowerSource(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Doctor Prescription">Doctor Prescription (In-Clinic)</option>
                    <option value="Customer Supplied Prescription">Customer Supplied Rx</option>
                    <option value="Existing Power">Existing Power Lens Read</option>
                    <option value="Manual Entry">Manual Optometrist Entry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Doctor / Optometrist</label>
                  <input
                    type="text"
                    value={powerDoctor}
                    onChange={e => setPowerDoctor(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Right Eye */}
              <div className="p-3 bg-cyan-50/70 rounded-xl border border-cyan-200">
                <h4 className="font-bold text-cyan-900 mb-2">Right Eye (OD / RE)</h4>
                <div className="grid grid-cols-6 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">SPH</label>
                    <input
                      type="text"
                      value={odSph}
                      onChange={e => setOdSph(e.target.value)}
                      placeholder="-1.25"
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">CYL</label>
                    <input
                      type="text"
                      value={odCyl}
                      onChange={e => setOdCyl(e.target.value)}
                      placeholder="-0.50"
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">AXIS</label>
                    <input
                      type="text"
                      value={odAxis}
                      onChange={e => setOdAxis(e.target.value)}
                      placeholder="90°"
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">ADD</label>
                    <input
                      type="text"
                      value={odAdd}
                      onChange={e => setOdAdd(e.target.value)}
                      placeholder="+2.00"
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Dist VA</label>
                    <input
                      type="text"
                      value={odDistVa}
                      onChange={e => setOdDistVa(e.target.value)}
                      placeholder="6/6"
                      className="w-full p-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Near VA</label>
                    <input
                      type="text"
                      value={odNearVa}
                      onChange={e => setOdNearVa(e.target.value)}
                      placeholder="N6"
                      className="w-full p-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Left Eye */}
              <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200">
                <h4 className="font-bold text-teal-900 mb-2">Left Eye (OS / LE)</h4>
                <div className="grid grid-cols-6 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">SPH</label>
                    <input
                      type="text"
                      value={osSph}
                      onChange={e => setOsSph(e.target.value)}
                      placeholder="-1.00"
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">CYL</label>
                    <input
                      type="text"
                      value={osCyl}
                      onChange={e => setOsCyl(e.target.value)}
                      placeholder="-0.50"
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">AXIS</label>
                    <input
                      type="text"
                      value={osAxis}
                      onChange={e => setOsAxis(e.target.value)}
                      placeholder="180°"
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">ADD</label>
                    <input
                      type="text"
                      value={osAdd}
                      onChange={e => setOsAdd(e.target.value)}
                      placeholder="+2.00"
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Dist VA</label>
                    <input
                      type="text"
                      value={osDistVa}
                      onChange={e => setOsDistVa(e.target.value)}
                      placeholder="6/6"
                      className="w-full p-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Near VA</label>
                    <input
                      type="text"
                      value={osNearVa}
                      onChange={e => setOsNearVa(e.target.value)}
                      placeholder="N6"
                      className="w-full p-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Pupillary Distance (PD mm)</label>
                  <input
                    type="text"
                    value={pd}
                    onChange={e => setPd(e.target.value)}
                    placeholder="e.g. 62"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Notes / Lens Type Recommended</label>
                  <input
                    type="text"
                    value={powerNotes}
                    onChange={e => setPowerNotes(e.target.value)}
                    placeholder="e.g. Blue Cut ARC Progressive recommended"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddPowerModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold shadow-xs"
                >
                  Save Power Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST LOYALTY */}
      {showLoyaltyModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" /> Adjust Loyalty Points
              </h3>
              <button onClick={() => setShowLoyaltyModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLoyalty} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Adjustment Action</label>
                <select
                  value={loyaltyType}
                  onChange={e => setLoyaltyType(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="MANUAL_ADD">+ Add Points (Promotional / Bonus)</option>
                  <option value="MANUAL_DEDUCT">- Deduct Points (Correction / Expiry)</option>
                  <option value="RESET">= Set Exact Point Balance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Points Amount</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={loyaltyAmount}
                  onChange={e => setLoyaltyAmount(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg text-base font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Reason / Note</label>
                <input
                  type="text"
                  required
                  value={loyaltyReason}
                  onChange={e => setLoyaltyReason(e.target.value)}
                  placeholder="e.g. Festival bonus, Referral reward"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowLoyaltyModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REDEEM LOYALTY REWARDS */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-600" /> Instant Loyalty Redemption
              </h3>
              <button
                onClick={() => {
                  setShowRedeemModal(false);
                  setRedeemConfirmStep(false);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessRedeem} className="space-y-4 text-xs">
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">Wallet Balance</span>
                  <span className="text-xl font-black text-amber-950">{currentPoints} pts</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">Available Value</span>
                  <span className="text-xl font-black text-emerald-700">₹{availableRewardValue}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-semibold">Points to Redeem</label>
                  <span className="text-[11px] font-bold text-emerald-700">
                    Instant Value: ₹{calculateMonetaryValue(redeemPoints, loyaltyConfig)}
                  </span>
                </div>
                <input
                  type="number"
                  min={loyaltyConfig.minRedemptionPoints || 100}
                  max={currentPoints}
                  step="10"
                  required
                  value={redeemPoints}
                  onChange={e => {
                    setRedeemPoints(Math.min(currentPoints, Math.max(0, Number(e.target.value))));
                    setRedeemConfirmStep(false);
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-lg font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />

                {/* Quick Selection Shortcuts */}
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRedeemPoints(Math.min(currentPoints, loyaltyConfig.minRedemptionPoints || 100));
                      setRedeemConfirmStep(false);
                    }}
                    className="py-1 px-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 text-center cursor-pointer"
                  >
                    Min ({loyaltyConfig.minRedemptionPoints || 100})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const half = Math.floor(currentPoints / 2);
                      setRedeemPoints(Math.max(loyaltyConfig.minRedemptionPoints || 100, half));
                      setRedeemConfirmStep(false);
                    }}
                    className="py-1 px-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 text-center cursor-pointer"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const threeQuarter = Math.floor((currentPoints * 3) / 4);
                      setRedeemPoints(Math.max(loyaltyConfig.minRedemptionPoints || 100, threeQuarter));
                      setRedeemConfirmStep(false);
                    }}
                    className="py-1 px-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 text-center cursor-pointer"
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRedeemPoints(currentPoints);
                      setRedeemConfirmStep(false);
                    }}
                    className="py-1 px-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[11px] font-bold text-center cursor-pointer"
                  >
                    Max ({currentPoints})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Redemption Notes / Counter Bill Ref</label>
                <input
                  type="text"
                  required
                  value={redeemNote}
                  onChange={e => setRedeemNote(e.target.value)}
                  placeholder="e.g. Bill #ORD-1234 discount applied"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Balance after redemption:</span>
                  <span className="font-bold text-slate-900">{Math.max(0, currentPoints - redeemPoints)} pts</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Rule:</span>
                  <span className="text-slate-500">
                    {loyaltyConfig.pointsForValue} pts = ₹{loyaltyConfig.valueInRupees}
                  </span>
                </div>
              </div>

              {redeemConfirmStep && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    Please Confirm Redemption
                  </div>
                  <p className="text-[11px]">
                    Deduct <strong>{redeemPoints} points</strong> for an instant reward value of <strong>₹{calculateMonetaryValue(redeemPoints, loyaltyConfig)}</strong> for {liveCustomer.name}? This action cannot be reversed without an admin audit log.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowRedeemModal(false);
                    setRedeemConfirmStep(false);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-lg font-bold shadow-xs cursor-pointer text-white ${
                    redeemConfirmStep
                      ? 'bg-rose-600 hover:bg-rose-700 animate-pulse'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {redeemConfirmStep ? 'Yes, Confirm & Deduct Points' : 'Proceed to Redeem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LINK PATIENT */}
      {showLinkModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-cyan-600" /> Link With Patient MRD
              </h3>
              <button onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLinkPatient} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Linking connects this Customer ID with the medical clinical patient record so you can view both optical purchases and eye clinical history seamlessly.
              </p>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Patient</label>
                <select
                  value={selectedMrdToLink}
                  onChange={e => setSelectedMrdToLink(e.target.value)}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="">-- Choose Existing Patient --</option>
                  {patients.map(p => (
                    <option key={p.mrd} value={p.mrd}>
                      {p.mrd} - {p.name} ({p.mobile})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedMrdToLink}
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold shadow-xs disabled:opacity-50"
                >
                  Link Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
