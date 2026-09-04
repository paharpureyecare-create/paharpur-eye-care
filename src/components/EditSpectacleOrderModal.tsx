import React, { useState, useEffect } from 'react';
import { SpectacleOrder, Customer, Gender, PaymentMethod, SpectacleOrderStatus } from '../types';
import { useErp } from '../context/ErpContext';
import {
  X,
  Edit3,
  User,
  Phone,
  Glasses,
  Eye,
  CreditCard,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Layers,
  MapPin,
  FileText,
  DollarSign,
  Percent,
  CheckSquare,
  Square,
  ShieldCheck,
  RefreshCw,
  Plus
} from 'lucide-react';

interface EditSpectacleOrderModalProps {
  order: SpectacleOrder;
  onClose: () => void;
}

export const EditSpectacleOrderModal: React.FC<EditSpectacleOrderModalProps> = ({
  order,
  onClose
}) => {
  const {
    frames = [],
    lenses = [],
    customers = [],
    settings,
    updateSpectacleOrder,
    showToast
  } = useErp();

  // Find linked customer profile if available
  const linkedCustomer = customers.find(
    c => (order.customerId && c.customerId === order.customerId) ||
         (order.mrd && c.mrd === order.mrd) ||
         c.mobile === order.mobile
  );

  // 1. Customer profile fields state
  const [customerName, setCustomerName] = useState(order.customerName || '');
  const [mobile, setMobile] = useState(order.mobile || '');
  const [whatsapp, setWhatsapp] = useState(order.whatsapp || linkedCustomer?.whatsapp || order.mobile || '');
  const [age, setAge] = useState<number | string>(order.age || linkedCustomer?.age || 35);
  const [gender, setGender] = useState<Gender>(order.gender || linkedCustomer?.gender || 'Male');
  const [fatherHusbandName, setFatherHusbandName] = useState(
    order.customerProfileData?.fatherHusbandName ||
    order.customerProfileData?.fatherName ||
    linkedCustomer?.fatherHusbandName ||
    linkedCustomer?.fatherName ||
    ''
  );
  const [occupation, setOccupation] = useState(
    order.customerProfileData?.occupation ||
    order.customerProfileData?.profession ||
    linkedCustomer?.profession ||
    linkedCustomer?.occupation ||
    ''
  );
  const [fullAddress, setFullAddress] = useState(
    order.customerProfileData?.fullAddress ||
    order.address ||
    linkedCustomer?.address ||
    linkedCustomer?.fullAddress ||
    ''
  );
  const [village, setVillage] = useState(
    order.customerProfileData?.village ||
    linkedCustomer?.village ||
    ''
  );
  const [postOffice, setPostOffice] = useState(
    order.customerProfileData?.postOffice ||
    linkedCustomer?.postOffice ||
    ''
  );
  const [policeStation, setPoliceStation] = useState(
    order.customerProfileData?.policeStation ||
    linkedCustomer?.policeStation ||
    ''
  );
  const [district, setDistrict] = useState(
    order.customerProfileData?.district ||
    linkedCustomer?.district ||
    'South 24 Parganas'
  );
  const [state, setState] = useState(
    order.customerProfileData?.state ||
    linkedCustomer?.state ||
    'West Bengal'
  );
  const [pinCode, setPinCode] = useState(
    order.customerProfileData?.pinCode ||
    linkedCustomer?.pinCode ||
    ''
  );
  const [email, setEmail] = useState(
    order.customerProfileData?.email ||
    linkedCustomer?.email ||
    ''
  );
  const [maritalStatus, setMaritalStatus] = useState(
    order.customerProfileData?.maritalStatus ||
    linkedCustomer?.maritalStatus ||
    'Married'
  );
  const [anniversaryDate, setAnniversaryDate] = useState(
    order.customerProfileData?.anniversaryDate ||
    linkedCustomer?.anniversaryDate ||
    linkedCustomer?.marriageAnniversary ||
    ''
  );
  const [referredBy, setReferredBy] = useState(
    order.customerProfileData?.referredBy ||
    linkedCustomer?.referredBy ||
    ''
  );
  const [emergencyContact, setEmergencyContact] = useState(
    order.customerProfileData?.emergencyContact ||
    order.customerProfileData?.altMobile ||
    linkedCustomer?.altMobile ||
    linkedCustomer?.emergencyContact ||
    ''
  );
  const [customerNotes, setCustomerNotes] = useState(
    order.customerProfileData?.notes ||
    linkedCustomer?.notes ||
    ''
  );
  const [syncToCustomerProfile, setSyncToCustomerProfile] = useState(true);

  // 2. Frame state
  const [isManualFrame, setIsManualFrame] = useState(Boolean(order.isManualFrame));
  const [frameSku, setFrameSku] = useState(order.frameSku || frames[0]?.sku || '');
  const [manualFrameBrand, setManualFrameBrand] = useState(order.frameBrand || order.frameName || '');
  const [manualFrameModel, setManualFrameModel] = useState(order.frameModel || '');
  const [frameRate, setFrameRate] = useState<number>(order.frameRate ?? 1200);

  // 3. Lens state
  const [isManualLens, setIsManualLens] = useState(Boolean(order.isManualLens));
  const [lensCode, setLensCode] = useState(order.lensCode || lenses[0]?.lensCode || '');
  const [manualLensBrand, setManualLensBrand] = useState(order.lensBrand || order.lensName || '');
  const [manualLensType, setManualLensType] = useState(order.lensType || 'Anti-Glare (ARC)');
  const [manualLensCoating, setManualLensCoating] = useState(order.lensCoating || 'Blue-Cut UV420');
  const [lensRate, setLensRate] = useState<number>(order.lensRate ?? 1000);

  // 4. Power state
  const [odSph, setOdSph] = useState(order.odSph || order.odPower?.sph || '+0.00');
  const [odCyl, setOdCyl] = useState(order.odCyl || order.odPower?.cyl || '0.00');
  const [odAxis, setOdAxis] = useState(order.odAxis || order.odPower?.axis || '180');
  const [odAdd, setOdAdd] = useState(order.odAdd || order.odPower?.add || '—');
  const [osSph, setOsSph] = useState(order.osSph || order.osPower?.sph || '+0.00');
  const [osCyl, setOsCyl] = useState(order.osCyl || order.osPower?.cyl || '0.00');
  const [osAxis, setOsAxis] = useState(order.osAxis || order.osPower?.axis || '180');
  const [osAdd, setOsAdd] = useState(order.osAdd || order.osPower?.add || '—');
  const [pd, setPd] = useState(order.pd || '63mm');
  const [distanceVa, setDistanceVa] = useState(order.distanceVa || '6/6');
  const [nearVa, setNearVa] = useState(order.nearVa || 'N6');

  // 5. Charges and discounts
  const [otherCharges, setOtherCharges] = useState<number>(
    order.otherCharges ?? (order.fittingsCharge || order.fittingCharges || 0)
  );
  const [discountType, setDiscountType] = useState<'None' | 'Percentage' | 'Amount'>(
    order.discountType || (order.discountPercent && order.discountPercent > 0 ? 'Percentage' : order.discount > 0 ? 'Amount' : 'None')
  );
  const [discountPercent, setDiscountPercent] = useState<number>(order.discountPercent || 0);
  const [discountAmount, setDiscountAmount] = useState<number>(order.discount || 0);

  // Loyalty point redemption in order edit
  const availableLoyaltyPoints = linkedCustomer?.loyaltyPoints || 0;
  const pointRupeeRate = settings?.loyaltyPointValueRupees ?? 1; // 1 pt = ₹1
  const [redeemPoints, setRedeemPoints] = useState<number>(order.loyaltyPointsRedeemed || 0);

  // 6. Payments and delivery
  const [advance, setAdvance] = useState<number>(order.advance || order.paid || 0);
  const [newPaymentAmount, setNewPaymentAmount] = useState<number | ''>('');
  const [newPaymentMode, setNewPaymentMode] = useState<PaymentMethod>('Cash');
  const [newPaymentNotes, setNewPaymentNotes] = useState('');

  const [deliveryDate, setDeliveryDate] = useState(order.deliveryDate || new Date().toISOString().split('T')[0]);
  const [orderStatus, setOrderStatus] = useState<SpectacleOrderStatus>(order.status || 'In Production');
  const [assignedTechnician, setAssignedTechnician] = useState(order.assignedTechnician || 'Master Optical Lab');
  const [labNotes, setLabNotes] = useState(order.labNotes || '');
  const [orderNotes, setOrderNotes] = useState(order.notes || '');

  // UI active tab in modal
  const [activeSection, setActiveSection] = useState<'customer' | 'items' | 'power' | 'financials'>('items');

  // Handle inventory item selection changes
  const handleSelectFrameInventory = (sku: string) => {
    setFrameSku(sku);
    const sel = frames.find(f => f.sku === sku);
    if (sel) {
      setFrameRate(sel.retailRate);
      setManualFrameBrand(`${sel.brand} (${sel.model})`);
    }
  };

  const handleSelectLensInventory = (code: string) => {
    setLensCode(code);
    const sel = lenses.find(l => l.lensCode === code);
    if (sel) {
      setLensRate(sel.retailRate);
      setManualLensBrand(`${sel.company} ${sel.brand}`);
    }
  };

  // Real-time calculations
  const subTotal = (frameRate || 0) + (lensRate || 0) + (otherCharges || 0);
  
  let calculatedStandardDiscount = 0;
  if (discountType === 'Percentage' && discountPercent > 0) {
    calculatedStandardDiscount = Math.round((subTotal * discountPercent) / 100);
  } else if (discountType === 'Amount' && discountAmount > 0) {
    calculatedStandardDiscount = discountAmount;
  }

  const calculatedLoyaltyDiscount = Math.min(
    Math.max(0, subTotal - calculatedStandardDiscount),
    (redeemPoints || 0) * pointRupeeRate
  );

  const totalDiscount = calculatedStandardDiscount + calculatedLoyaltyDiscount;
  const netTotal = Math.max(0, subTotal - totalDiscount);

  const existingPaid = advance || 0;
  const additionalPay = typeof newPaymentAmount === 'number' ? newPaymentAmount : 0;
  const totalPaid = existingPaid + additionalPay;
  const remainingDue = Math.max(0, netTotal - totalPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !mobile.trim()) {
      showToast('Customer name and mobile number are required', 'error');
      return;
    }

    const frameBrandName = isManualFrame
      ? (manualFrameBrand ? `${manualFrameBrand} ${manualFrameModel || ''}`.trim() : 'Custom Manual Frame')
      : (frames.find(f => f.sku === frameSku)?.brand ? `${frames.find(f => f.sku === frameSku)?.brand} (${frames.find(f => f.sku === frameSku)?.model})` : frameSku);

    const lensBrandName = isManualLens
      ? (manualLensBrand ? `${manualLensBrand} - ${manualLensType} (${manualLensCoating})` : 'Custom Manual Lens')
      : (lenses.find(l => l.lensCode === lensCode)?.company ? `${lenses.find(l => l.lensCode === lensCode)?.company} ${lenses.find(l => l.lensCode === lensCode)?.brand} (${lenses.find(l => l.lensCode === lensCode)?.coating})` : lensCode);

    const updatedOrderData: SpectacleOrder = {
      ...order,
      customerName: customerName.trim(),
      mobile: mobile.trim(),
      whatsapp: whatsapp.trim() || mobile.trim(),
      age: Number(age) || 35,
      gender,
      address: fullAddress.trim() || village.trim(),
      customerProfileData: {
        whatsapp: whatsapp.trim() || mobile.trim(),
        age: Number(age) || 35,
        gender,
        fatherHusbandName: fatherHusbandName.trim(),
        fatherName: fatherHusbandName.trim(),
        occupation: occupation.trim(),
        profession: occupation.trim(),
        fullAddress: fullAddress.trim(),
        village: village.trim(),
        postOffice: postOffice.trim(),
        policeStation: policeStation.trim(),
        district: district.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
        email: email.trim(),
        maritalStatus,
        anniversaryDate,
        referredBy: referredBy.trim(),
        emergencyContact: emergencyContact.trim(),
        altMobile: emergencyContact.trim(),
        notes: customerNotes.trim()
      },

      // Frame
      isManualFrame,
      frameSku: isManualFrame ? undefined : frameSku,
      frameBrand: frameBrandName,
      frameModel: manualFrameModel,
      frameName: frameBrandName,
      frameRate: Number(frameRate) || 0,

      // Lens
      isManualLens,
      lensCode: isManualLens ? undefined : lensCode,
      lensBrand: lensBrandName,
      lensName: lensBrandName,
      lensType: manualLensType,
      lensCoating: manualLensCoating,
      lensRate: Number(lensRate) || 0,

      // Power
      odSph,
      odCyl,
      odAxis,
      odAdd,
      osSph,
      osCyl,
      osAxis,
      osAdd,
      pd,
      distanceVa,
      nearVa,

      // Charges & Discounts
      otherCharges: Number(otherCharges) || 0,
      fittingsCharge: Number(otherCharges) || 0,
      subTotal,
      discountType,
      discountPercent: discountType === 'Percentage' ? Number(discountPercent) : 0,
      discount: calculatedStandardDiscount,
      loyaltyPointsRedeemed: Number(redeemPoints) || 0,
      loyaltyDiscount: calculatedLoyaltyDiscount,
      total: netTotal,
      advance: totalPaid,
      paid: totalPaid,
      due: remainingDue,

      // Lifecycle
      status: orderStatus,
      deliveryDate,
      assignedTechnician,
      labNotes,
      notes: orderNotes
    };

    updateSpectacleOrder(updatedOrderData, {
      updateCustomerProfile: syncToCustomerProfile,
      newPayment: additionalPay > 0 ? {
        amount: additionalPay,
        mode: newPaymentMode,
        notes: newPaymentNotes || `Installment payment upon order edit for ${order.orderId}`
      } : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Edit Spectacle Order / চশমা অর্ডার এডিট
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 font-bold border border-cyan-700/50">
                  {order.orderId}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  orderStatus === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  orderStatus === 'Ready' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {orderStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Customer: <span className="text-slate-200 font-medium">{customerName}</span> ({mobile}) | Order Date: {order.orderDate || 'Today'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 bg-slate-50 border-b border-slate-200 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveSection('items')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === 'items'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Glasses className="w-3.5 h-3.5 text-cyan-400" />
            1. Frame & Lens Pricing
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('power')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === 'power'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            2. Eye Power Rx (পাওয়ার)
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('financials')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === 'financials'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
            3. Price, Discount & Payments
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('customer')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === 'customer'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5 text-cyan-400" />
            4. Customer Profile Details
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* =========================================================================
              SECTION 1: FRAME & LENS WITH CUSTOM PRICING OVERRIDE
             ========================================================================= */}
          {activeSection === 'items' && (
            <div className="space-y-6">
              {/* Frame Card */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4.5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-cyan-100 text-cyan-800">
                      <Glasses className="w-4 h-4" />
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Frame Selection & Actual Customer Price (ফ্রেম ও বিক্রয়মূল্য)
                    </h3>
                  </div>

                  {/* Toggle Inventory vs Custom Frame */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setIsManualFrame(false)}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        !isManualFrame ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Stock Catalog
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsManualFrame(true)}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        isManualFrame ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Custom / Manual Frame
                    </button>
                  </div>
                </div>

                {!isManualFrame ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Select Frame From Stock
                      </label>
                      <select
                        value={frameSku}
                        onChange={e => handleSelectFrameInventory(e.target.value)}
                        className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-cyan-500"
                      >
                        {frames.map(f => (
                          <option key={f.sku} value={f.sku}>
                            {f.brand} ({f.model}) - Stock: {f.currentStock} | MRP: ₹{f.retailRate}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center justify-between">
                        <span>Actual Frame Price (₹) *</span>
                        <span className="text-[10px] text-cyan-700 font-normal">Editable override</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min={0}
                          value={frameRate}
                          onChange={e => setFrameRate(Number(e.target.value))}
                          className="w-full pl-6 pr-2 py-2 text-xs font-bold border border-cyan-400 bg-cyan-50/40 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Frame Brand / Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ray-Ban Aviator / Velocity"
                        value={manualFrameBrand}
                        onChange={e => setManualFrameBrand(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Model / Color
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Matte Black / RB-3025"
                        value={manualFrameModel}
                        onChange={e => setManualFrameModel(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center justify-between">
                        <span>Frame Sale Price (₹) *</span>
                        <span className="text-[10px] text-cyan-700 font-normal">Customer Price</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min={0}
                          value={frameRate}
                          onChange={e => setFrameRate(Number(e.target.value))}
                          className="w-full pl-6 pr-2 py-2 text-xs font-bold border border-cyan-400 bg-cyan-50/40 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Lens Card */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4.5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800">
                      <Layers className="w-4 h-4" />
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Lens Selection & Actual Customer Price (লেন্স ও বিক্রয়মূল্য)
                    </h3>
                  </div>

                  {/* Toggle Inventory vs Custom Lens */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setIsManualLens(false)}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        !isManualLens ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Stock Catalog
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsManualLens(true)}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        isManualLens ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Custom / Manual Lens
                    </button>
                  </div>
                </div>

                {!isManualLens ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Select Lens From Stock
                      </label>
                      <select
                        value={lensCode}
                        onChange={e => handleSelectLensInventory(e.target.value)}
                        className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-cyan-500"
                      >
                        {lenses.map(l => (
                          <option key={l.lensCode} value={l.lensCode}>
                            {l.company} {l.brand} ({l.coating}) - Stock: {l.currentStock} | MRP: ₹{l.retailRate}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center justify-between">
                        <span>Actual Lens Price (₹) *</span>
                        <span className="text-[10px] text-indigo-700 font-normal">Editable override</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min={0}
                          value={lensRate}
                          onChange={e => setLensRate(Number(e.target.value))}
                          className="w-full pl-6 pr-2 py-2 text-xs font-bold border border-indigo-400 bg-indigo-50/40 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Lens Company / Brand
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Crizal / Essilor / Hoya"
                        value={manualLensBrand}
                        onChange={e => setManualLensBrand(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Lens Type
                      </label>
                      <select
                        value={manualLensType}
                        onChange={e => setManualLensType(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="Single Vision (SV)">Single Vision (SV)</option>
                        <option value="Bifocal (Kryptok)">Bifocal (Kryptok)</option>
                        <option value="Bifocal (D-Segment)">Bifocal (D-Segment)</option>
                        <option value="Progressive (PAL)">Progressive (PAL)</option>
                        <option value="Anti-Glare (ARC)">Anti-Glare (ARC)</option>
                        <option value="Blue Cut UV420">Blue Cut UV420</option>
                        <option value="Photochromic / Transition">Photochromic / Transition</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Coating / Index
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Blue-Cut UV420 1.61"
                        value={manualLensCoating}
                        onChange={e => setManualLensCoating(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center justify-between">
                        <span>Lens Sale Price (₹) *</span>
                        <span className="text-[10px] text-indigo-700 font-normal">Customer Price</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min={0}
                          value={lensRate}
                          onChange={e => setLensRate(Number(e.target.value))}
                          className="w-full pl-6 pr-2 py-2 text-xs font-bold border border-indigo-400 bg-indigo-50/40 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Status & Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white border border-slate-200 rounded-xl p-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Order Status (অর্ডার স্ট্যাটাস)
                  </label>
                  <select
                    value={orderStatus}
                    onChange={e => setOrderStatus(e.target.value as SpectacleOrderStatus)}
                    className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="New">New (নতুন অর্ডার)</option>
                    <option value="Confirmed">Confirmed (কনফার্মড)</option>
                    <option value="Lens Ordered">Lens Ordered (লেন্স অর্ডার দেওয়া হয়েছে)</option>
                    <option value="In Production">In Production / Fitting (ফিটিং চলছে)</option>
                    <option value="Ready">Ready for Delivery (তৈরি - ডেলিভারির জন্য প্রস্তুত)</option>
                    <option value="Delivered">Delivered (গ্রাহককে ডেলিভারি দেওয়া হয়েছে)</option>
                    <option value="Cancelled">Cancelled (বাতিল)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-600" /> Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Assigned Technician / Lab
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Master Optical Lab / In-house Lab"
                    value={assignedTechnician}
                    onChange={e => setAssignedTechnician(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 2: EYE POWER RX
             ========================================================================= */}
          {activeSection === 'power' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Eye className="w-4 h-4 text-cyan-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Refraction Power Verification (চোখের পাওয়ার বিবরণ)
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-center border-collapse">
                    <thead>
                      <tr className="bg-slate-200/80 text-slate-700 font-bold">
                        <th className="p-2 border border-slate-300 text-left w-24">Eye</th>
                        <th className="p-2 border border-slate-300">SPH (গোলক)</th>
                        <th className="p-2 border border-slate-300">CYL (সিলিন্ডার)</th>
                        <th className="p-2 border border-slate-300">AXIS (অক্ষ)</th>
                        <th className="p-2 border border-slate-300">ADD (কাছের পাওয়ার)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* OD (Right Eye) */}
                      <tr>
                        <td className="p-2 border border-slate-300 font-bold bg-cyan-50 text-cyan-900 text-left">
                          OD (Right / ডান)
                        </td>
                        <td className="p-1 border border-slate-300">
                          <input
                            type="text"
                            value={odSph}
                            onChange={e => setOdSph(e.target.value)}
                            className="w-full text-center py-1 font-mono font-bold bg-white border border-slate-200 rounded"
                            placeholder="+0.00"
                          />
                        </td>
                        <td className="p-1 border border-slate-300">
                          <input
                            type="text"
                            value={odCyl}
                            onChange={e => setOdCyl(e.target.value)}
                            className="w-full text-center py-1 font-mono font-bold bg-white border border-slate-200 rounded"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="p-1 border border-slate-300">
                          <input
                            type="text"
                            value={odAxis}
                            onChange={e => setOdAxis(e.target.value)}
                            className="w-full text-center py-1 font-mono font-bold bg-white border border-slate-200 rounded"
                            placeholder="180"
                          />
                        </td>
                        <td className="p-1 border border-slate-300">
                          <input
                            type="text"
                            value={odAdd}
                            onChange={e => setOdAdd(e.target.value)}
                            className="w-full text-center py-1 font-mono font-bold bg-white border border-slate-200 rounded"
                            placeholder="+2.00"
                          />
                        </td>
                      </tr>

                      {/* OS (Left Eye) */}
                      <tr>
                        <td className="p-2 border border-slate-300 font-bold bg-indigo-50 text-indigo-900 text-left">
                          OS (Left / বাম)
                        </td>
                        <td className="p-1 border border-slate-300">
                          <input
                            type="text"
                            value={osSph}
                            onChange={e => setOsSph(e.target.value)}
                            className="w-full text-center py-1 font-mono font-bold bg-white border border-slate-200 rounded"
                            placeholder="+0.00"
                          />
                        </td>
                        <td className="p-1 border border-slate-300">
                          <input
                            type="text"
                            value={osCyl}
                            onChange={e => setOsCyl(e.target.value)}
                            className="w-full text-center py-1 font-mono font-bold bg-white border border-slate-200 rounded"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="p-1 border border-slate-300">
                          <input
                            type="text"
                            value={osAxis}
                            onChange={e => setOsAxis(e.target.value)}
                            className="w-full text-center py-1 font-mono font-bold bg-white border border-slate-200 rounded"
                            placeholder="180"
                          />
                        </td>
                        <td className="p-1 border border-slate-300">
                          <input
                            type="text"
                            value={osAdd}
                            onChange={e => setOsAdd(e.target.value)}
                            className="w-full text-center py-1 font-mono font-bold bg-white border border-slate-200 rounded"
                            placeholder="+2.00"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Pupillary Distance (PD)</label>
                    <input
                      type="text"
                      value={pd}
                      onChange={e => setPd(e.target.value)}
                      placeholder="e.g. 63mm"
                      className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Distance Visual Acuity</label>
                    <input
                      type="text"
                      value={distanceVa}
                      onChange={e => setDistanceVa(e.target.value)}
                      placeholder="e.g. 6/6"
                      className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Near Visual Acuity</label>
                    <input
                      type="text"
                      value={nearVa}
                      onChange={e => setNearVa(e.target.value)}
                      placeholder="e.g. N6"
                      className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Lab / Edging Instructions</label>
                  <textarea
                    rows={2}
                    value={labNotes}
                    onChange={e => setLabNotes(e.target.value)}
                    placeholder="Specific edging requests, rimless groove, bevel alignment, or urgent priority notes..."
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 3: FINANCIALS, DISCOUNTS, LOYALTY POINTS & PAYMENTS
             ========================================================================= */}
          {activeSection === 'financials' && (
            <div className="space-y-5">
              
              {/* Financial Calculation Breakdown Card */}
              <div className="bg-slate-900 text-white rounded-xl p-4.5 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <DollarSign className="w-4 h-4" /> Live Pricing & Due Calculation
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Subtotal: ₹{subTotal}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-400 uppercase">Frame Price</p>
                    <p className="text-sm font-bold text-white mt-0.5">₹{frameRate || 0}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-400 uppercase">Lens Price</p>
                    <p className="text-sm font-bold text-white mt-0.5">₹{lensRate || 0}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-400 uppercase">Total Discount</p>
                    <p className="text-sm font-bold text-emerald-400 mt-0.5">-₹{totalDiscount}</p>
                  </div>
                  <div className="bg-cyan-500/20 border border-cyan-500/40 rounded-lg p-2.5">
                    <p className="text-[10px] text-cyan-300 uppercase font-bold">Net Total</p>
                    <p className="text-base font-extrabold text-white mt-0.5">₹{netTotal}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                  <div>
                    <span className="text-[11px] text-slate-400">Total Paid (Advance + Installment):</span>
                    <p className="text-lg font-bold text-emerald-400">₹{totalPaid}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Remaining Balance / Due:</span>
                    <p className={`text-lg font-extrabold ${remainingDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      ₹{remainingDue}
                    </p>
                  </div>
                </div>
              </div>

              {/* Discounts & Optional Charges Controls */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">
                  Discounts, Loyalty Points & Additional Charges
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Optional Other Charge */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Optional Other Charge (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={otherCharges}
                      onChange={e => setOtherCharges(Number(e.target.value))}
                      placeholder="0 (Optional extra charge)"
                      className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">No mandatory seating/fitting charges</span>
                  </div>

                  {/* Discount Type */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={e => setDiscountType(e.target.value as any)}
                      className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-white"
                    >
                      <option value="None">No Standard Discount</option>
                      <option value="Percentage">Percentage Discount (%)</option>
                      <option value="Amount">Fixed Amount Discount (₹)</option>
                    </select>
                  </div>

                  {/* Discount Input */}
                  <div>
                    {discountType === 'Percentage' ? (
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Discount (%)</label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={discountPercent}
                            onChange={e => setDiscountPercent(Number(e.target.value))}
                            className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 bg-white"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                        </div>
                      </div>
                    ) : discountType === 'Amount' ? (
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Discount (₹)</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            min={0}
                            value={discountAmount}
                            onChange={e => setDiscountAmount(Number(e.target.value))}
                            className="w-full pl-6 pr-2 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="opacity-50">
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Discount</label>
                        <input
                          disabled
                          type="text"
                          value="None applied"
                          className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-100"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Loyalty Points Redemption Option */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-lg bg-amber-100 text-amber-800">
                      <Award className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-amber-900">
                        Redeem Customer Loyalty Points (পয়েন্ট রিডিম)
                      </p>
                      <p className="text-[11px] text-amber-700">
                        Available Balance: <strong className="font-mono font-bold">{availableLoyaltyPoints} points</strong> ({settings?.currencySymbol || '₹'}{availableLoyaltyPoints * pointRupeeRate} value)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-amber-900 whitespace-nowrap">Points to Redeem:</label>
                    <input
                      type="number"
                      min={0}
                      max={availableLoyaltyPoints}
                      value={redeemPoints}
                      onChange={e => setRedeemPoints(Math.min(availableLoyaltyPoints, Math.max(0, Number(e.target.value))))}
                      className="w-24 text-xs font-bold border border-amber-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-amber-500"
                    />
                    {redeemPoints > 0 && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-1 rounded-md">
                        -₹{calculatedLoyaltyDiscount}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Record Installment / Payment Update */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    Record New Payment / Installment (কিস্তি বা বাকি টাকা জমা)
                  </span>
                  <span className="text-[11px] text-emerald-800 font-semibold">
                    Current Paid: ₹{existingPaid}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      New Amount Received (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min={0}
                        max={remainingDue + (typeof newPaymentAmount === 'number' ? newPaymentAmount : 0)}
                        placeholder="e.g. 500"
                        value={newPaymentAmount}
                        onChange={e => setNewPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-2 text-xs font-bold border border-emerald-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={newPaymentMode}
                      onChange={e => setNewPaymentMode(e.target.value as PaymentMethod)}
                      className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-white"
                    >
                      <option value="Cash">Cash (নগদ)</option>
                      <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="Card">Debit / Credit Card</option>
                      <option value="NetBanking">Net Banking</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Payment Note / Ref No
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Final delivery balance paid via UPI"
                      value={newPaymentNotes}
                      onChange={e => setNewPaymentNotes(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 4: FULL CUSTOMER PROFILE DETAILS
             ========================================================================= */}
          {activeSection === 'customer' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Customer Profile Information (গ্রাহকের তথ্য)
                    </h3>
                  </div>

                  {/* Sync checkbox */}
                  <label className="flex items-center gap-2 text-xs font-bold text-cyan-900 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncToCustomerProfile}
                      onChange={e => setSyncToCustomerProfile(e.target.checked)}
                      className="rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                    <span>Synchronize to Main Customer CRM Profile</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                      className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value as Gender)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Father / Husband Name</label>
                    <input
                      type="text"
                      value={fatherHusbandName}
                      onChange={e => setFatherHusbandName(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Occupation / Profession</label>
                    <input
                      type="text"
                      value={occupation}
                      onChange={e => setOccupation(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Village / Town / Area</label>
                    <input
                      type="text"
                      value={village}
                      onChange={e => setVillage(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Post Office (P.O.)</label>
                    <input
                      type="text"
                      value={postOffice}
                      onChange={e => setPostOffice(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Police Station (P.S.)</label>
                    <input
                      type="text"
                      value={policeStation}
                      onChange={e => setPoliceStation(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={pinCode}
                      onChange={e => setPinCode(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Marital Status</label>
                    <select
                      value={maritalStatus}
                      onChange={e => setMaritalStatus(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Anniversary Date</label>
                    <input
                      type="date"
                      value={anniversaryDate}
                      onChange={e => setAnniversaryDate(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Referred By</label>
                    <input
                      type="text"
                      value={referredBy}
                      onChange={e => setReferredBy(e.target.value)}
                      placeholder="e.g. Dr. Banerjee / Relative"
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Emergency / Alt Contact</label>
                    <input
                      type="text"
                      value={emergencyContact}
                      onChange={e => setEmergencyContact(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Customer Notes / History</label>
                    <input
                      type="text"
                      value={customerNotes}
                      onChange={e => setCustomerNotes(e.target.value)}
                      placeholder="Special preferences, bifocal user, high power history..."
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-500">
              Order ID: <strong className="text-slate-800 font-mono">{order.orderId}</strong> | Net Total: <strong className="text-slate-900">₹{netTotal}</strong> | Due: <strong className={remainingDue > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>₹{remainingDue}</strong>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-1/2 sm:w-auto px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                Update Spectacle Order (সেভ করুন)
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
