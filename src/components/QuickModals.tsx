import React, { useState, useEffect } from 'react';
import { useErp } from '../context/ErpContext';
import {
  X,
  UserPlus,
  Calendar,
  Glasses,
  ShoppingBag,
  Truck,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Search,
  UserCheck,
  Sparkles,
  Building,
  Phone,
  MapPin,
  Hash,
  ShieldCheck,
  Heart,
  Users,
  FileText,
  Check,
  ArrowRight,
  RefreshCw,
  Layers,
  Edit3,
  Eye,
  CreditCard,
  Receipt,
  Clock,
  Award
} from 'lucide-react';
import {
  calculateMaxRedeemable,
  calculatePointsForPurchase,
  calculateMonetaryValue
} from '../utils/loyaltyCalculator';
import {
  Patient,
  Appointment,
  SpectacleOrder,
  RetailSale,
  PaymentMethod,
  VisitType,
  Gender,
  SpectacleOrderStatus,
  Customer
} from '../types';
import { BookAppointmentModal } from './BookAppointmentModal';

export const QuickModals: React.FC = () => {
  const {
    quickModal,
    setQuickModal,
    createPatient,
    createAppointment,
    createSpectacleOrder,
    createRetailSale,
    addStockMovement,
    findMatchingLensForPower,
    patients = [],
    customers = [],
    customerPowers = [],
    prescriptions = [],
    lenses = [],
    frames = [],
    suppliers = [],
    settings,
    clinicalDraft,
    showToast
  } = useErp();

  const doctorsList = Array.isArray(settings?.examiners) && settings.examiners.length > 0
    ? settings.examiners.filter(ex => ex.active).map(ex => `${ex.name} (${ex.role})`)
    : [
        settings?.doctorName ? `${settings.doctorName} (Ophthalmologist)` : 'Dr. S. K. Banerjee (Ophthalmologist)',
        settings?.optometristName ? `${settings.optometristName} (Optometrist)` : 'Dr. R. N. Mukherjee (Optometrist)',
        'Aniket Roy (Refractionist)'
      ];

  // 1. Patient Form State
  const [patientForm, setPatientForm] = useState({
    name: '',
    age: 35,
    gender: 'Male' as Gender,
    mobile: '',
    village: '',
    policeStation: '',
    district: 'Purulia',
    occupation: '',
    referredBy: '',
    notes: ''
  });

  // 2. Appointment Form State
  const [aptForm, setAptForm] = useState({
    mrd: clinicalDraft?.mrd || (patients?.[0]?.mrd ?? ''),
    patientName: clinicalDraft?.patientName || (patients?.[0]?.name ?? ''),
    mobile: clinicalDraft?.mobile || (patients?.[0]?.mobile ?? ''),
    doctor: doctorsList[0] || 'Dr. S. K. Banerjee (MBBS, MS - Ophthalmology)',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    visitType: 'New Eye Consultation' as VisitType,
    notes: 'Walk-in / Telephonic booking'
  });

  // 3. Unified Spectacle Order Form State
  const [orderCustomerMode, setOrderCustomerMode] = useState<'existing' | 'new'>('existing');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [frameInputMode, setFrameInputMode] = useState<'inventory' | 'manual'>('inventory');
  const [lensInputMode, setLensInputMode] = useState<'inventory' | 'manual'>('inventory');
  const [discountTypeMode, setDiscountTypeMode] = useState<'None' | 'Percentage' | 'Amount'>('None');

  const [orderForm, setOrderForm] = useState({
    // Identification
    customerId: '',
    mrd: clinicalDraft?.mrd || (patients?.[0]?.mrd ?? ''),
    customerName: clinicalDraft?.patientName || (patients?.[0]?.name ?? ''),
    mobile: clinicalDraft?.mobile || (patients?.[0]?.mobile ?? ''),
    whatsapp: clinicalDraft?.mobile || (patients?.[0]?.mobile ?? ''),
    age: 35,
    gender: 'Male' as Gender,
    fatherHusbandName: '',
    occupation: '',
    fullAddress: '',
    village: '',
    postOffice: '',
    policeStation: '',
    district: 'Purulia',
    state: 'West Bengal',
    pinCode: '',
    email: '',
    maritalStatus: 'Married',
    anniversaryDate: '',
    referredBy: '',
    emergencyContact: '',
    notes: '',
    createLinkedPatient: true,

    // Frame fields
    frameSku: frames?.[0]?.sku || '',
    manualFrameBrand: '',
    manualFrameModel: '',
    frameRate: frames?.[0]?.retailRate || 1200,

    // Lens fields
    lensCode: lenses?.[0]?.lensCode || '',
    manualLensBrand: '',
    manualLensType: 'Anti-Glare (ARC)',
    manualLensCoating: 'Blue-Cut UV420',
    lensRate: lenses?.[0]?.retailRate || 1000,

    // Power fields
    odSph: '+0.25',
    odCyl: '0.00',
    odAxis: '180',
    odAdd: '—',
    odMatchedLensSku: lenses?.[0]?.lensCode || '',
    osSph: '+0.25',
    osCyl: '0.00',
    osAxis: '180',
    osAdd: '—',
    osMatchedLensSku: lenses?.[0]?.lensCode || '',
    pd: '63mm',
    distanceVa: '6/6',
    nearVa: 'N6',

    // Financials
    fittingCharges: 100,
    discountPercent: 0,
    discount: 0,
    useLoyalty: false,
    loyaltyPointsToRedeem: 0,
    advance: 1000,
    paymentMethod: 'UPI' as PaymentMethod,
    deliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    assignedTechnician: 'Master Optical Lab',
    orderStatus: 'New' as SpectacleOrderStatus
  });

  // 4. POS Sale Form State
  const [saleForm, setSaleForm] = useState({
    mrd: clinicalDraft?.mrd || '',
    customerName: clinicalDraft?.patientName || 'Counter Walk-in',
    mobile: clinicalDraft?.mobile || '9830000000',
    items: [
      { id: '1', name: 'Lens Cleaning Spray 100ml', qty: 1, rate: 150, total: 150 }
    ],
    discount: 0,
    paid: 150,
    paymentMethod: 'Cash' as PaymentMethod
  });

  // 5. Purchase Order Form State
  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: suppliers?.[0]?.id || 'SUP-01',
    supplierName: suppliers?.[0]?.name || 'Essilor Optical India Ltd',
    invoiceNumber: `INV-SUP-${Date.now().toString().slice(-4)}`,
    itemType: 'Lens' as 'Lens' | 'Frame',
    itemCode: lenses?.[0]?.lensCode || '',
    itemName: lenses?.[0]?.brand || '',
    quantity: 20,
    purchaseRate: lenses?.[0]?.purchaseRate || 200,
    notes: 'Supplier stock replenishment'
  });

  if (!quickModal) return null;

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  // Patient submit
  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientForm.name.trim() || !patientForm.mobile.trim()) {
      showToast('Name and Mobile number are required', 'warning');
      return;
    }
    createPatient(patientForm);
    setQuickModal(null);
  };

  // Appointment submit
  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const selPatient = patients.find(p => p.mrd === aptForm.mrd);
    createAppointment({
      mrd: aptForm.mrd,
      patientName: selPatient?.name || aptForm.patientName,
      mobile: selPatient?.mobile || aptForm.mobile,
      doctor: aptForm.doctor,
      date: aptForm.date,
      time: aptForm.time,
      visitType: aptForm.visitType,
      status: 'Confirmed',
      notes: aptForm.notes
    });
    setQuickModal(null);
  };

  // Select Existing Customer or Patient Helper
  const handleSelectCustomerOrPatient = (item: { mrd?: string; customerId?: string; name: string; mobile: string; whatsapp?: string; age?: number; gender?: Gender; address?: string; fullAddress?: string; village?: string; postOffice?: string; policeStation?: string; district?: string; state?: string; pinCode?: string; fatherHusbandName?: string; occupation?: string; email?: string; maritalStatus?: string; anniversaryDate?: string; referredBy?: string; emergencyContact?: string; notes?: string }) => {
    // Check for previous power records
    const custPower = customerPowers.find(p => (item.customerId && p.customerId === item.customerId) || (item.mrd && p.mrd === item.mrd) || (p.customerId === `CUST-${item.mobile}`));
    const rx = prescriptions.find(r => (item.mrd && r.mrd === item.mrd) || r.patientName.toLowerCase() === item.name.toLowerCase());

    const prevOD = custPower?.odPower || rx?.refractionOD;
    const prevOS = custPower?.osPower || rx?.refractionOS;

    const odSphVal = prevOD?.sph || orderForm.odSph;
    const odCylVal = prevOD?.cyl || orderForm.odCyl;
    const odAxisVal = prevOD?.axis || orderForm.odAxis;
    const odAddVal = prevOD?.add || orderForm.odAdd;

    const osSphVal = prevOS?.sph || orderForm.osSph;
    const osCylVal = prevOS?.cyl || orderForm.osCyl;
    const osAxisVal = prevOS?.axis || orderForm.osAxis;
    const osAddVal = prevOS?.add || orderForm.osAdd;

    const matchedOD = findMatchingLensForPower(odSphVal, odCylVal, odAxisVal);
    const matchedOS = findMatchingLensForPower(osSphVal, osCylVal, osAxisVal);

    setOrderForm(prev => ({
      ...prev,
      customerId: item.customerId || prev.customerId,
      mrd: item.mrd || prev.mrd,
      customerName: item.name,
      mobile: item.mobile,
      whatsapp: item.whatsapp || item.mobile,
      age: item.age !== undefined ? item.age : prev.age,
      gender: (item.gender as Gender) || prev.gender,
      fatherHusbandName: item.fatherHusbandName || prev.fatherHusbandName,
      occupation: item.occupation || prev.occupation,
      fullAddress: item.fullAddress || item.address || prev.fullAddress,
      village: item.village || prev.village,
      postOffice: item.postOffice || prev.postOffice,
      policeStation: item.policeStation || prev.policeStation,
      district: item.district || prev.district,
      state: item.state || prev.state,
      pinCode: item.pinCode || prev.pinCode,
      email: item.email || prev.email,
      maritalStatus: item.maritalStatus || prev.maritalStatus,
      anniversaryDate: item.anniversaryDate || prev.anniversaryDate,
      referredBy: item.referredBy || prev.referredBy,
      emergencyContact: item.emergencyContact || prev.emergencyContact,
      notes: item.notes || prev.notes,
      odSph: odSphVal,
      odCyl: odCylVal,
      odAxis: odAxisVal,
      odAdd: odAddVal,
      odMatchedLensSku: matchedOD?.lensCode || prev.odMatchedLensSku,
      osSph: osSphVal,
      osCyl: osCylVal,
      osAxis: osAxisVal,
      osAdd: osAddVal,
      osMatchedLensSku: matchedOS?.lensCode || prev.osMatchedLensSku,
      pd: custPower?.pd || rx?.pd || prev.pd,
      distanceVa: prevOD?.va || prev.distanceVa
    }));

    if (custPower || rx) {
      showToast(`Loaded ${item.name} with previous prescription power!`, 'info');
    } else {
      showToast(`Selected ${item.name}`, 'info');
    }
  };

  // Spectacle Order submit
  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.customerName.trim() || !orderForm.mobile.trim()) {
      showToast('Customer Name and Mobile Number are required!', 'warning');
      return;
    }

    const isManualFrame = frameInputMode === 'manual';
    const isManualLens = lensInputMode === 'manual';

    const selFrame = !isManualFrame ? frames.find(f => f.sku === orderForm.frameSku) : null;
    const selLens = !isManualLens ? lenses.find(l => l.lensCode === orderForm.lensCode) : null;

    const frameBrandName = isManualFrame
      ? (orderForm.manualFrameBrand ? `${orderForm.manualFrameBrand} ${orderForm.manualFrameModel || ''}`.trim() : 'Custom Manual Frame')
      : (selFrame ? `${selFrame.brand} (${selFrame.model})` : orderForm.frameSku);

    const lensBrandName = isManualLens
      ? (orderForm.manualLensBrand ? `${orderForm.manualLensBrand} - ${orderForm.manualLensType} (${orderForm.manualLensCoating})` : 'Custom Manual Lens')
      : (selLens ? `${selLens.company} ${selLens.brand} (${selLens.coating})` : orderForm.lensCode);

    const subTotal = (orderForm.frameRate || 0) + (orderForm.lensRate || 0) + (orderForm.fittingCharges || 0);
    let finalDiscount = 0;
    if (discountTypeMode === 'Percentage' && orderForm.discountPercent > 0) {
      finalDiscount = Math.round((subTotal * orderForm.discountPercent) / 100);
    } else if (discountTypeMode === 'Amount') {
      finalDiscount = orderForm.discount || 0;
    }

    // Loyalty points redemption
    const matchedCustomer = customers.find(
      c => (orderForm.customerId && c.customerId === orderForm.customerId) || (orderForm.mobile && c.mobile === orderForm.mobile)
    );
    const availableCustomerPoints = matchedCustomer?.loyaltyPoints || 0;
    const maxRedeem = calculateMaxRedeemable(Math.max(0, subTotal - finalDiscount), availableCustomerPoints, settings?.loyaltySettings);
    const pointsToRedeem = orderForm.useLoyalty ? Math.min(orderForm.loyaltyPointsToRedeem, maxRedeem.maxPoints) : 0;
    const loyaltyDiscountRupees = calculateMonetaryValue(pointsToRedeem, settings?.loyaltySettings);

    const total = Math.max(0, subTotal - finalDiscount - loyaltyDiscountRupees);
    const due = Math.max(0, total - (orderForm.advance || 0));

    let finalMrd = orderForm.mrd;
    if (orderCustomerMode === 'new' && orderForm.createLinkedPatient && !finalMrd) {
      const newPt = createPatient({
        name: orderForm.customerName,
        age: orderForm.age,
        gender: orderForm.gender,
        mobile: orderForm.mobile,
        village: orderForm.village || orderForm.fullAddress,
        postOffice: orderForm.postOffice,
        policeStation: orderForm.policeStation,
        district: orderForm.district,
        state: orderForm.state,
        pinCode: orderForm.pinCode,
        occupation: orderForm.occupation,
        referredBy: orderForm.referredBy,
        fatherName: orderForm.fatherHusbandName,
        notes: `Registered via Spectacle Order Sale (${orderForm.notes})`
      });
      if (newPt) finalMrd = newPt.mrd;
    }

    createSpectacleOrder({
      customerId: orderForm.customerId || undefined,
      mrd: finalMrd || undefined,
      customerName: orderForm.customerName,
      mobile: orderForm.mobile,
      whatsapp: orderForm.whatsapp || orderForm.mobile,
      age: orderForm.age,
      gender: orderForm.gender,
      address: orderForm.fullAddress || orderForm.village,
      customerProfileData: {
        whatsapp: orderForm.whatsapp || orderForm.mobile,
        age: orderForm.age,
        gender: orderForm.gender,
        fatherHusbandName: orderForm.fatherHusbandName,
        occupation: orderForm.occupation,
        fullAddress: orderForm.fullAddress,
        village: orderForm.village,
        postOffice: orderForm.postOffice,
        policeStation: orderForm.policeStation,
        district: orderForm.district,
        state: orderForm.state,
        pinCode: orderForm.pinCode,
        email: orderForm.email,
        maritalStatus: orderForm.maritalStatus,
        anniversaryDate: orderForm.anniversaryDate,
        referredBy: orderForm.referredBy,
        emergencyContact: orderForm.emergencyContact,
        notes: orderForm.notes
      },
      isManualFrame,
      frameSku: isManualFrame ? undefined : orderForm.frameSku,
      frameBrand: frameBrandName,
      frameName: frameBrandName,
      frameRate: orderForm.frameRate,

      isManualLens,
      lensCode: isManualLens ? undefined : orderForm.lensCode,
      lensBrand: lensBrandName,
      lensName: lensBrandName,
      lensRate: orderForm.lensRate,

      odSph: orderForm.odSph,
      odCyl: orderForm.odCyl,
      odAxis: orderForm.odAxis,
      odAdd: orderForm.odAdd,
      odMatchedLensSku: isManualLens ? undefined : (orderForm.odMatchedLensSku || orderForm.lensCode),
      osSph: orderForm.osSph,
      osCyl: orderForm.osCyl,
      osAxis: orderForm.osAxis,
      osAdd: orderForm.osAdd,
      osMatchedLensSku: isManualLens ? undefined : (orderForm.osMatchedLensSku || orderForm.lensCode),
      pd: orderForm.pd,
      distanceVa: orderForm.distanceVa,
      nearVa: orderForm.nearVa,

      fittingCharges: orderForm.fittingCharges,
      fittingsCharge: orderForm.fittingCharges,
      discountType: discountTypeMode,
      discountPercent: orderForm.discountPercent,
      discount: finalDiscount,
      loyaltyPointsRedeemed: pointsToRedeem,
      loyaltyDiscount: loyaltyDiscountRupees,
      subTotal,
      total,
      advance: orderForm.advance,
      due,
      paymentMethod: orderForm.paymentMethod,
      deliveryDate: orderForm.deliveryDate,
      status: orderForm.orderStatus,
      assignedTechnician: orderForm.assignedTechnician,
      notes: orderForm.notes
    });

    setQuickModal(null);
  };

  // POS Sale submit
  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    const subTotal = saleForm.items.reduce((acc, it) => acc + it.total, 0);
    const netTotal = Math.max(0, subTotal - saleForm.discount);
    const due = Math.max(0, netTotal - saleForm.paid);

    createRetailSale({
      customerName: saleForm.customerName,
      mrd: saleForm.mrd || undefined,
      mobile: saleForm.mobile,
      items: saleForm.items,
      subTotal,
      discount: saleForm.discount,
      netTotal,
      paid: saleForm.paid,
      due,
      paymentMethod: saleForm.paymentMethod
    });
    setQuickModal(null);
  };

  // Stock Purchase submit
  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    addStockMovement({
      itemType: purchaseForm.itemType,
      itemCode: purchaseForm.itemCode,
      itemName: purchaseForm.itemName,
      movementType: 'Purchase',
      reference: purchaseForm.invoiceNumber,
      qtyIn: Number(purchaseForm.quantity),
      qtyOut: 0,
      notes: `Supplier: ${purchaseForm.supplierName}`
    });
    showToast(`Stock added: +${purchaseForm.quantity} to ${purchaseForm.itemCode}`, 'success');
    setQuickModal(null);
  };

  if (quickModal === 'new-appointment') {
    return (
      <BookAppointmentModal
        isOpen={true}
        onClose={() => setQuickModal(null)}
        prefillPatient={null}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {quickModal === 'new-patient' && <UserPlus className="w-5 h-5 text-teal-400" />}
            {quickModal === 'new-appointment' && <Calendar className="w-5 h-5 text-teal-400" />}
            {quickModal === 'new-order' && <Glasses className="w-5 h-5 text-amber-400" />}
            {quickModal === 'new-sale' && <ShoppingBag className="w-5 h-5 text-teal-400" />}
            {quickModal === 'new-purchase' && <Truck className="w-5 h-5 text-emerald-400" />}

            <h2 className="text-sm font-bold text-white">
              {quickModal === 'new-patient' && 'New Patient Registration (MRD)'}
              {quickModal === 'new-appointment' && 'Book New Eye Appointment'}
              {quickModal === 'new-order' && 'Book Spectacle Lab Order'}
              {quickModal === 'new-sale' && 'New Counter Sale (POS Invoice)'}
              {quickModal === 'new-purchase' && 'Receive Supplier Stock (Inward)'}
            </h2>
          </div>

          <button
            onClick={() => setQuickModal(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto text-xs text-slate-800">
          
          {/* =========================================================================
              MODAL 1: NEW PATIENT
             ========================================================================= */}
          {quickModal === 'new-patient' && (
            <form onSubmit={handleSavePatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={patientForm.name}
                    onChange={e => setPatientForm({ ...patientForm, name: e.target.value })}
                    placeholder="e.g. Subrata Mukherjee"
                    className="w-full px-3 py-2 border rounded-xl font-bold text-slate-900 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={patientForm.age}
                    onChange={e => setPatientForm({ ...patientForm, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender *</label>
                  <select
                    value={patientForm.gender}
                    onChange={e => setPatientForm({ ...patientForm, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white font-bold"
                  >
                    <option value="Male">Male (পুরুষ)</option>
                    <option value="Female">Female (মহিলা)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Mobile / WhatsApp Number *</label>
                  <input
                    type="text"
                    required
                    value={patientForm.mobile}
                    onChange={e => setPatientForm({ ...patientForm, mobile: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Village / Para</label>
                  <input
                    type="text"
                    value={patientForm.village}
                    onChange={e => setPatientForm({ ...patientForm, village: e.target.value })}
                    placeholder="e.g. Paharpur Bazar"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Police Station & District</label>
                  <input
                    type="text"
                    value={patientForm.district}
                    onChange={e => setPatientForm({ ...patientForm, district: e.target.value })}
                    placeholder="Paharpur, Purba Medinipur"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Occupation</label>
                  <input
                    type="text"
                    value={patientForm.occupation}
                    onChange={e => setPatientForm({ ...patientForm, occupation: e.target.value })}
                    placeholder="Teacher, Farmer, Student..."
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Referred By</label>
                  <input
                    type="text"
                    value={patientForm.referredBy}
                    onChange={e => setPatientForm({ ...patientForm, referredBy: e.target.value })}
                    placeholder="Self / Dr. Bose"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setQuickModal(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save & Generate MRD
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              MODAL 2: NEW APPOINTMENT
             ========================================================================= */}
          {quickModal === 'new-appointment' && (
            <form onSubmit={handleSaveAppointment} className="space-y-4">
              <div className="space-y-3">
                
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Registered Patient</label>
                  <select
                    value={aptForm.mrd}
                    onChange={e => {
                      const found = patients.find(p => p.mrd === e.target.value);
                      if (found) {
                        setAptForm({
                          ...aptForm,
                          mrd: found.mrd,
                          patientName: found.name,
                          mobile: found.mobile
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50"
                  >
                    {patients.map(p => (
                      <option key={p.mrd} value={p.mrd}>
                        {p.name} ({p.mrd}) — {p.mobile}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Appointment Date</label>
                    <input
                      type="date"
                      required
                      value={aptForm.date}
                      onChange={e => setAptForm({ ...aptForm, date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Time Slot</label>
                    <input
                      type="text"
                      value={aptForm.time}
                      onChange={e => setAptForm({ ...aptForm, time: e.target.value })}
                      placeholder="11:30 AM"
                      className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Consultant Doctor</label>
                  <select
                    value={aptForm.doctor}
                    onChange={e => setAptForm({ ...aptForm, doctor: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-bold"
                  >
                    {doctorsList.map(doc => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Visit Type</label>
                  <select
                    value={aptForm.visitType}
                    onChange={e => setAptForm({ ...aptForm, visitType: e.target.value as VisitType })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                  >
                    <option value="New Eye Consultation">New Eye Consultation</option>
                    <option value="Spectacle Refraction Only">Spectacle Refraction Only</option>
                    <option value="Follow-up Review">Follow-up Review</option>
                    <option value="Post-Op Checkup">Post-Op Checkup</option>
                    <option value="Emergency Eye Care">Emergency Eye Care</option>
                  </select>
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setQuickModal(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              MODAL 3: NEW SPECTACLE ORDER & UNIFIED CUSTOMER INVOICE
             ========================================================================= */}
          {quickModal === 'new-order' && (
            <form onSubmit={handleSaveOrder} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
              
              {/* CUSTOMER MODE SWITCHER (Existing vs New) */}
              <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setOrderCustomerMode('existing')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    orderCustomerMode === 'existing'
                      ? 'bg-white text-teal-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  Existing Patient / Customer (Auto-Search & Fill)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrderCustomerMode('new');
                    setOrderForm(prev => ({
                      ...prev,
                      customerId: '',
                      mrd: '',
                      customerName: '',
                      mobile: '',
                      whatsapp: '',
                      fatherHusbandName: '',
                      occupation: '',
                      fullAddress: '',
                      village: '',
                      postOffice: '',
                      policeStation: '',
                      pinCode: '',
                      email: '',
                      anniversaryDate: '',
                      referredBy: '',
                      emergencyContact: '',
                      notes: ''
                    }));
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    orderCustomerMode === 'new'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  + New Customer (Register & Create Profile)
                </button>
              </div>

              {/* 1. CUSTOMER PROFILE SECTION */}
              {orderCustomerMode === 'existing' ? (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-teal-600" />
                      Search & Select Customer / Patient
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">Search by Name, Mobile, MRD, or Customer ID</span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={customerSearchTerm}
                      onChange={e => setCustomerSearchTerm(e.target.value)}
                      placeholder="Type name, phone (e.g. 98300...), MRD (e.g. MRD-1001), or CUST ID..."
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  {/* Filtered Search Results Dropdown / Quick Picker */}
                  {customerSearchTerm.trim().length > 0 && (
                    <div className="max-h-44 overflow-y-auto bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
                      {/* Search in Customers */}
                      {customers
                        .filter(c =>
                          c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                          c.mobile.includes(customerSearchTerm) ||
                          (c.mrd && c.mrd.toLowerCase().includes(customerSearchTerm.toLowerCase())) ||
                          (c.customerId && c.customerId.toLowerCase().includes(customerSearchTerm.toLowerCase()))
                        )
                        .slice(0, 5)
                        .map(c => (
                          <div
                            key={c.customerId}
                            onClick={() => {
                              handleSelectCustomerOrPatient(c);
                              setCustomerSearchTerm('');
                            }}
                            className="p-2.5 hover:bg-teal-50 cursor-pointer flex items-center justify-between transition"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs">{c.name}</span>
                                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                                  {c.customerId}
                                </span>
                                {c.mrd && (
                                  <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-mono font-bold">
                                    {c.mrd}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>📞 {c.mobile}</span>
                                {c.address && <span>📍 {c.address}</span>}
                              </div>
                            </div>
                            <span className="text-xs text-teal-600 font-bold flex items-center gap-1">
                              Select <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        ))}

                      {/* Search in Patients not yet in filtered customers */}
                      {patients
                        .filter(p =>
                          (p.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                           p.mobile.includes(customerSearchTerm) ||
                           p.mrd.toLowerCase().includes(customerSearchTerm.toLowerCase())) &&
                          !customers.some(c => c.mrd === p.mrd)
                        )
                        .slice(0, 5)
                        .map(p => (
                          <div
                            key={p.mrd}
                            onClick={() => {
                              handleSelectCustomerOrPatient(p);
                              setCustomerSearchTerm('');
                            }}
                            className="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs">{p.name}</span>
                                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">
                                  {p.mrd} (Patient)
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                📞 {p.mobile} | Age: {p.age} {p.gender} | 📍 {p.village || p.district}
                              </div>
                            </div>
                            <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
                              Select <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Selected Customer Card Preview */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{orderForm.customerName || 'No customer selected'}</span>
                          {orderForm.customerId && (
                            <span className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-mono font-bold border">
                              {orderForm.customerId}
                            </span>
                          )}
                          {orderForm.mrd ? (
                            <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-mono font-bold border border-teal-200">
                              MRD: {orderForm.mrd}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold border border-amber-200">
                              Optical Customer Only
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-3">
                          <span>📞 <strong>{orderForm.mobile || '—'}</strong></span>
                          {orderForm.whatsapp && <span>💬 WA: <strong>{orderForm.whatsapp}</strong></span>}
                          <span>Age: <strong>{orderForm.age}</strong> ({orderForm.gender})</span>
                          {(orderForm.fullAddress || orderForm.village) && (
                            <span>📍 {orderForm.fullAddress || orderForm.village}</span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const cust = customers.find(c => (orderForm.customerId && c.customerId === orderForm.customerId) || (orderForm.mrd && c.mrd === orderForm.mrd) || c.mobile === orderForm.mobile);
                          const pat = patients.find(p => p.mrd === orderForm.mrd || p.mobile === orderForm.mobile);
                          if (cust) handleSelectCustomerOrPatient(cust);
                          else if (pat) handleSelectCustomerOrPatient(pat);
                          else showToast('No previous prescription record found for this profile', 'info');
                        }}
                        className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold border border-teal-200 flex items-center gap-1.5 transition"
                        title="Reload previous prescription refraction power"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reload Previous Rx
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* 2. NEW CUSTOMER FULL PROFILE ENTRY FORM */
                <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-teal-200 pb-2">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-teal-700" />
                      <span className="text-xs font-black text-teal-950 uppercase tracking-wide">
                        New Customer Registration Profile
                      </span>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-bold text-teal-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={orderForm.createLinkedPatient}
                        onChange={e => setOrderForm({ ...orderForm, createLinkedPatient: e.target.checked })}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Also Create Linked Clinical MRD ID (Patient Profile)</span>
                    </label>
                  </div>

                  {/* Primary Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Customer Full Name *</label>
                      <input
                        type="text"
                        required
                        value={orderForm.customerName}
                        onChange={e => setOrderForm({ ...orderForm, customerName: e.target.value })}
                        placeholder="e.g. Subir Karmakar"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile Number *</label>
                      <input
                        type="text"
                        required
                        value={orderForm.mobile}
                        onChange={e => {
                          const val = e.target.value;
                          setOrderForm({
                            ...orderForm,
                            mobile: val,
                            whatsapp: orderForm.whatsapp === orderForm.mobile || !orderForm.whatsapp ? val : orderForm.whatsapp
                          });
                        }}
                        placeholder="10-digit mobile"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono text-slate-900 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">WhatsApp Number</label>
                      <input
                        type="text"
                        value={orderForm.whatsapp}
                        onChange={e => setOrderForm({ ...orderForm, whatsapp: e.target.value })}
                        placeholder="WhatsApp contact"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono text-slate-900 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Demographics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Age</label>
                      <input
                        type="number"
                        value={orderForm.age}
                        onChange={e => setOrderForm({ ...orderForm, age: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Gender</label>
                      <select
                        value={orderForm.gender}
                        onChange={e => setOrderForm({ ...orderForm, gender: e.target.value as Gender })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Father / Husband</label>
                      <input
                        type="text"
                        value={orderForm.fatherHusbandName}
                        onChange={e => setOrderForm({ ...orderForm, fatherHusbandName: e.target.value })}
                        placeholder="Guardian name"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Occupation</label>
                      <input
                        type="text"
                        value={orderForm.occupation}
                        onChange={e => setOrderForm({ ...orderForm, occupation: e.target.value })}
                        placeholder="e.g. Teacher, Business"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Address Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Village / Town / Street Address</label>
                      <input
                        type="text"
                        value={orderForm.fullAddress}
                        onChange={e => setOrderForm({ ...orderForm, fullAddress: e.target.value, village: e.target.value })}
                        placeholder="e.g. Vill- Paharpur, P.O.- Paharpur"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Post Office (P.O.)</label>
                      <input
                        type="text"
                        value={orderForm.postOffice}
                        onChange={e => setOrderForm({ ...orderForm, postOffice: e.target.value })}
                        placeholder="Post Office"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Police Station (P.S.)</label>
                      <input
                        type="text"
                        value={orderForm.policeStation}
                        onChange={e => setOrderForm({ ...orderForm, policeStation: e.target.value })}
                        placeholder="Police Station"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">District</label>
                      <input
                        type="text"
                        value={orderForm.district}
                        onChange={e => setOrderForm({ ...orderForm, district: e.target.value })}
                        placeholder="Purulia"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">State & PIN Code</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={orderForm.state}
                          onChange={e => setOrderForm({ ...orderForm, state: e.target.value })}
                          placeholder="WB"
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                        <input
                          type="text"
                          value={orderForm.pinCode}
                          onChange={e => setOrderForm({ ...orderForm, pinCode: e.target.value })}
                          placeholder="723101"
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Referred By</label>
                      <input
                        type="text"
                        value={orderForm.referredBy}
                        onChange={e => setOrderForm({ ...orderForm, referredBy: e.target.value })}
                        placeholder="Dr. / Friend / Self"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Emergency / Alt Contact</label>
                      <input
                        type="text"
                        value={orderForm.emergencyContact}
                        onChange={e => setOrderForm({ ...orderForm, emergencyContact: e.target.value })}
                        placeholder="Alternate phone"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. PRESCRIPTION POWER & STOCK LENS MATCHING MATRIX */}
              <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Glasses className="w-4 h-4 text-teal-700" />
                    <label className="font-black text-teal-950 text-xs uppercase tracking-wide">
                      Prescription Optical Power Matrix (Fully Editable)
                    </label>
                  </div>
                  <span className="text-[11px] text-teal-800 font-semibold bg-teal-100 px-2 py-0.5 rounded-md">
                    OD & OS Power Recorded for CRM History
                  </span>
                </div>

                {/* RIGHT EYE (OD) */}
                <div className="bg-white p-3 rounded-xl border border-teal-100 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-xs font-black text-teal-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                      Right Eye (OD / Oculus Dexter)
                    </span>
                    {lensInputMode === 'inventory' && (
                      <span className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border">
                        Deduct SKU: <strong>{orderForm.odMatchedLensSku || 'None'}</strong>
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2 font-mono text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">SPH</label>
                      <input
                        type="text"
                        value={orderForm.odSph}
                        onChange={e => {
                          const val = e.target.value;
                          const matched = findMatchingLensForPower(val, orderForm.odCyl, orderForm.odAxis);
                          setOrderForm({
                            ...orderForm,
                            odSph: val,
                            odMatchedLensSku: matched?.lensCode || orderForm.odMatchedLensSku
                          });
                        }}
                        placeholder="+0.00"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">CYL</label>
                      <input
                        type="text"
                        value={orderForm.odCyl}
                        onChange={e => {
                          const val = e.target.value;
                          const matched = findMatchingLensForPower(orderForm.odSph, val, orderForm.odAxis);
                          setOrderForm({
                            ...orderForm,
                            odCyl: val,
                            odMatchedLensSku: matched?.lensCode || orderForm.odMatchedLensSku
                          });
                        }}
                        placeholder="0.00"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-indigo-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">AXIS</label>
                      <input
                        type="text"
                        value={orderForm.odAxis}
                        onChange={e => setOrderForm({ ...orderForm, odAxis: e.target.value })}
                        placeholder="180"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">ADD</label>
                      <input
                        type="text"
                        value={orderForm.odAdd}
                        onChange={e => setOrderForm({ ...orderForm, odAdd: e.target.value })}
                        placeholder="+2.00"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-emerald-800 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">VA (Dist)</label>
                      <input
                        type="text"
                        value={orderForm.distanceVa}
                        onChange={e => setOrderForm({ ...orderForm, distanceVa: e.target.value })}
                        placeholder="6/6"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white"
                      />
                    </div>
                  </div>

                  {lensInputMode === 'inventory' && (
                    <div className="pt-1">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Stock Lens Variant to Deduct for OD:</label>
                      <select
                        value={orderForm.odMatchedLensSku}
                        onChange={e => setOrderForm({ ...orderForm, odMatchedLensSku: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                      >
                        {lenses.map(l => (
                          <option key={l.lensCode} value={l.lensCode}>
                            {l.lensCode} — {l.company} {l.brand} (SPH: {l.sph || '0.00'}, CYL: {l.cyl || '0.00'}) [Stock: {l.currentStock} pairs]
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* LEFT EYE (OS) */}
                <div className="bg-white p-3 rounded-xl border border-teal-100 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-xs font-black text-teal-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      Left Eye (OS / Oculus Sinister)
                    </span>
                    {lensInputMode === 'inventory' && (
                      <span className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border">
                        Deduct SKU: <strong>{orderForm.osMatchedLensSku || 'None'}</strong>
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2 font-mono text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">SPH</label>
                      <input
                        type="text"
                        value={orderForm.osSph}
                        onChange={e => {
                          const val = e.target.value;
                          const matched = findMatchingLensForPower(val, orderForm.osCyl, orderForm.osAxis);
                          setOrderForm({
                            ...orderForm,
                            osSph: val,
                            osMatchedLensSku: matched?.lensCode || orderForm.osMatchedLensSku
                          });
                        }}
                        placeholder="+0.00"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">CYL</label>
                      <input
                        type="text"
                        value={orderForm.osCyl}
                        onChange={e => {
                          const val = e.target.value;
                          const matched = findMatchingLensForPower(orderForm.osSph, val, orderForm.osAxis);
                          setOrderForm({
                            ...orderForm,
                            osCyl: val,
                            osMatchedLensSku: matched?.lensCode || orderForm.osMatchedLensSku
                          });
                        }}
                        placeholder="0.00"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-indigo-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">AXIS</label>
                      <input
                        type="text"
                        value={orderForm.osAxis}
                        onChange={e => setOrderForm({ ...orderForm, osAxis: e.target.value })}
                        placeholder="180"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">ADD</label>
                      <input
                        type="text"
                        value={orderForm.osAdd}
                        onChange={e => setOrderForm({ ...orderForm, osAdd: e.target.value })}
                        placeholder="+2.00"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-emerald-800 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">PD (mm)</label>
                      <input
                        type="text"
                        value={orderForm.pd}
                        onChange={e => setOrderForm({ ...orderForm, pd: e.target.value })}
                        placeholder="63mm"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white"
                      />
                    </div>
                  </div>

                  {lensInputMode === 'inventory' && (
                    <div className="pt-1">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Stock Lens Variant to Deduct for OS:</label>
                      <select
                        value={orderForm.osMatchedLensSku}
                        onChange={e => setOrderForm({ ...orderForm, osMatchedLensSku: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                      >
                        {lenses.map(l => (
                          <option key={l.lensCode} value={l.lensCode}>
                            {l.lensCode} — {l.company} {l.brand} (SPH: {l.sph || '0.00'}, CYL: {l.cyl || '0.00'}) [Stock: {l.currentStock} pairs]
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. FRAME SELECTION & MANUAL ENTRY */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Glasses className="w-4 h-4 text-slate-700" />
                    Frame Selection & Rate
                  </span>
                  <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setFrameInputMode('inventory')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        frameInputMode === 'inventory' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      From Stock Inventory
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrameInputMode('manual')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        frameInputMode === 'manual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Manual / Custom Frame
                    </button>
                  </div>
                </div>

                {frameInputMode === 'inventory' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Select Frame SKU from Inventory</label>
                      <select
                        value={orderForm.frameSku}
                        onChange={e => {
                          const frm = frames.find(f => f.sku === e.target.value);
                          setOrderForm({
                            ...orderForm,
                            frameSku: e.target.value,
                            frameRate: frm?.retailRate !== undefined ? frm.retailRate : orderForm.frameRate
                          });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                      >
                        {frames.map(f => (
                          <option key={f.sku} value={f.sku}>
                            {f.brand} ({f.model}) — {f.color || ''} | Rate: ₹{f.retailRate} [Stock: {f.currentStock}]
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Frame Rate (₹) [Editable]</label>
                      <input
                        type="number"
                        value={orderForm.frameRate}
                        onChange={e => setOrderForm({ ...orderForm, frameRate: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-sm text-slate-900"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Manual Frame Brand</label>
                      <input
                        type="text"
                        value={orderForm.manualFrameBrand}
                        onChange={e => setOrderForm({ ...orderForm, manualFrameBrand: e.target.value })}
                        placeholder="e.g. Titan, Ray-Ban, Fastrack"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Frame Model / Style</label>
                      <input
                        type="text"
                        value={orderForm.manualFrameModel}
                        onChange={e => setOrderForm({ ...orderForm, manualFrameModel: e.target.value })}
                        placeholder="e.g. Rimless Titanium Gold"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Frame Rate (₹)</label>
                      <input
                        type="number"
                        value={orderForm.frameRate}
                        onChange={e => setOrderForm({ ...orderForm, frameRate: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-sm text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. LENS SELECTION & MANUAL ENTRY */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    Lens Product & Rate
                  </span>
                  <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setLensInputMode('inventory')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        lensInputMode === 'inventory' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      From Stock Inventory
                    </button>
                    <button
                      type="button"
                      onClick={() => setLensInputMode('manual')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        lensInputMode === 'manual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Manual / Custom Lens
                    </button>
                  </div>
                </div>

                {lensInputMode === 'inventory' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Select Lens Product from Inventory</label>
                      <select
                        value={orderForm.lensCode}
                        onChange={e => {
                          const lns = lenses.find(l => l.lensCode === e.target.value);
                          setOrderForm({
                            ...orderForm,
                            lensCode: e.target.value,
                            lensRate: lns?.retailRate !== undefined ? lns.retailRate : orderForm.lensRate
                          });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                      >
                        {lenses.map(l => (
                          <option key={l.lensCode} value={l.lensCode}>
                            {l.brand} ({l.coating || l.category}) — Rate: ₹{l.retailRate} [Stock: {l.currentStock} pairs]
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Lens Pair Rate (₹) [Editable]</label>
                      <input
                        type="number"
                        value={orderForm.lensRate}
                        onChange={e => setOrderForm({ ...orderForm, lensRate: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-sm text-slate-900"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Manual Lens Brand</label>
                      <input
                        type="text"
                        value={orderForm.manualLensBrand}
                        onChange={e => setOrderForm({ ...orderForm, manualLensBrand: e.target.value })}
                        placeholder="e.g. Crizal / Essilor / Nova"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Lens Type</label>
                      <input
                        type="text"
                        value={orderForm.manualLensType}
                        onChange={e => setOrderForm({ ...orderForm, manualLensType: e.target.value })}
                        placeholder="e.g. Progressive / Single Vision"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Coating / Index</label>
                      <input
                        type="text"
                        value={orderForm.manualLensCoating}
                        onChange={e => setOrderForm({ ...orderForm, manualLensCoating: e.target.value })}
                        placeholder="e.g. Blue-Cut UV420 1.67"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Lens Rate (₹)</label>
                      <input
                        type="number"
                        value={orderForm.lensRate}
                        onChange={e => setOrderForm({ ...orderForm, lensRate: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-sm text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 5. PRICING, DISCOUNT, ADVANCE & DUE SUMMARY */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-700" />
                    Billing & Payment Calculation
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    Subtotal: ₹{((orderForm.frameRate || 0) + (orderForm.lensRate || 0) + (orderForm.fittingCharges || 0)).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Fitting Charges (₹)</label>
                    <input
                      type="number"
                      value={orderForm.fittingCharges}
                      onChange={e => setOrderForm({ ...orderForm, fittingCharges: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Discount Mode</label>
                    <select
                      value={discountTypeMode}
                      onChange={e => setDiscountTypeMode(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="None">No Discount (₹0)</option>
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Amount">Flat Amount (₹)</option>
                    </select>
                  </div>

                  {discountTypeMode === 'Percentage' ? (
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Discount (%)</label>
                      <input
                        type="number"
                        value={orderForm.discountPercent}
                        onChange={e => setOrderForm({ ...orderForm, discountPercent: Number(e.target.value) })}
                        placeholder="e.g. 10%"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-emerald-700"
                      />
                    </div>
                  ) : discountTypeMode === 'Amount' ? (
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Discount (₹)</label>
                      <input
                        type="number"
                        value={orderForm.discount}
                        onChange={e => setOrderForm({ ...orderForm, discount: Number(e.target.value) })}
                        placeholder="₹"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-emerald-700"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Discount</label>
                      <input
                        type="text"
                        disabled
                        value="₹0 (None)"
                        className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-bold"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Net Grand Total (₹)</label>
                    <div className="w-full px-3 py-1.5 bg-emerald-100/70 border border-emerald-300 rounded-xl font-black text-sm text-emerald-950">
                      ₹{(() => {
                        const sub = (orderForm.frameRate || 0) + (orderForm.lensRate || 0) + (orderForm.fittingCharges || 0);
                        const disc = discountTypeMode === 'Percentage' ? Math.round((sub * orderForm.discountPercent) / 100) : (discountTypeMode === 'Amount' ? orderForm.discount : 0);
                        const afterDisc = Math.max(0, sub - disc);
                        const mCust = customers.find(c => (orderForm.customerId && c.customerId === orderForm.customerId) || (orderForm.mobile && c.mobile === orderForm.mobile));
                        const pts = mCust?.loyaltyPoints || 0;
                        const maxR = calculateMaxRedeemable(afterDisc, pts, settings?.loyaltySettings);
                        const ptsUsed = orderForm.useLoyalty ? Math.min(orderForm.loyaltyPointsToRedeem, maxR.maxPoints) : 0;
                        const loyDisc = calculateMonetaryValue(ptsUsed, settings?.loyaltySettings);
                        return Math.max(0, afterDisc - loyDisc).toLocaleString();
                      })()}
                    </div>
                  </div>
                </div>

                {/* LOYALTY REWARDS REDEMPTION & ESTIMATION PANEL */}
                {settings?.loyaltySettings?.enabled !== false && (() => {
                  const sub = (orderForm.frameRate || 0) + (orderForm.lensRate || 0) + (orderForm.fittingCharges || 0);
                  const disc = discountTypeMode === 'Percentage' ? Math.round((sub * orderForm.discountPercent) / 100) : (discountTypeMode === 'Amount' ? orderForm.discount : 0);
                  const afterDisc = Math.max(0, sub - disc);
                  const mCust = customers.find(c => (orderForm.customerId && c.customerId === orderForm.customerId) || (orderForm.mobile && c.mobile === orderForm.mobile));
                  const pts = mCust?.loyaltyPoints || 0;
                  const minRedeemReq = settings?.loyaltySettings?.minRedemptionPoints || 100;
                  const maxR = calculateMaxRedeemable(afterDisc, pts, settings?.loyaltySettings);
                  const ptsUsed = orderForm.useLoyalty ? Math.min(orderForm.loyaltyPointsToRedeem, maxR.maxPoints) : 0;
                  const loyDisc = calculateMonetaryValue(ptsUsed, settings?.loyaltySettings);
                  const netOrderTotal = Math.max(0, afterDisc - loyDisc);
                  const estimatedPoints = calculatePointsForPurchase(netOrderTotal, 'spectacles', mCust?.loyaltyTier || 'Bronze', settings?.loyaltySettings);

                  return (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={orderForm.useLoyalty}
                            disabled={pts < minRedeemReq}
                            onChange={e => {
                              const willUse = e.target.checked;
                              setOrderForm({
                                ...orderForm,
                                useLoyalty: willUse,
                                loyaltyPointsToRedeem: willUse ? Math.min(pts, maxR.maxPoints) : 0
                              });
                            }}
                            className="w-4 h-4 accent-amber-600 rounded cursor-pointer disabled:opacity-50"
                          />
                          <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-amber-600" />
                            Use Loyalty Points
                          </span>
                        </label>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-amber-900 font-bold bg-amber-100/80 px-2 py-0.5 rounded-md">
                            Available: {pts} pts
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            Earn on this order: +{estimatedPoints} pts
                          </span>
                        </div>
                      </div>

                      {pts < minRedeemReq ? (
                        <div className="text-[11px] text-amber-800 font-medium bg-white/70 p-2 rounded-lg border border-amber-200">
                          Customer has <strong>{pts} points</strong>. Minimum <strong>{minRedeemReq} points</strong> required to redeem rewards.
                        </div>
                      ) : orderForm.useLoyalty ? (
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-white p-2.5 rounded-lg border border-amber-200 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Point Value</span>
                            <div className="font-bold text-slate-800">
                              {settings?.loyaltySettings?.pointsForValue || 100} pts = ₹{settings?.loyaltySettings?.valueInRupees || 50}
                            </div>
                            <span className="text-[9px] text-slate-500 block">1 pt = ₹{((settings?.loyaltySettings?.valueInRupees || 50) / (settings?.loyaltySettings?.pointsForValue || 100)).toFixed(2)}</span>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-amber-900 block mb-0.5">Points to Redeem</label>
                            <input
                              type="number"
                              min={0}
                              max={maxR.maxPoints}
                              value={orderForm.loyaltyPointsToRedeem}
                              onChange={e => setOrderForm({ ...orderForm, loyaltyPointsToRedeem: Math.min(maxR.maxPoints, Math.max(0, Number(e.target.value))) })}
                              className="w-full px-2 py-1 bg-amber-50 border border-amber-300 rounded font-bold text-xs text-amber-900"
                            />
                            <span className="text-[9px] text-slate-500 block mt-0.5">Max: {maxR.maxPoints} pts</span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-emerald-800 block mb-0.5">Reward Discount Value</span>
                            <div className="font-black text-emerald-700 text-sm">
                              -₹{loyDisc}
                            </div>
                            <span className="text-[9px] text-slate-500 block">Deducted from final total</span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-600 block mb-0.5">Remaining Balance</span>
                            <div className="font-bold text-slate-800 text-sm">
                              {Math.max(0, pts - ptsUsed)} pts
                            </div>
                            <span className="text-[9px] text-slate-500 block">Kept in customer account</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Advance Paid (₹)</label>
                    <input
                      type="number"
                      value={orderForm.advance}
                      onChange={e => setOrderForm({ ...orderForm, advance: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-sm text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Balance Due (₹)</label>
                    <div className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl font-black text-sm text-rose-700">
                      ₹{(() => {
                        const sub = (orderForm.frameRate || 0) + (orderForm.lensRate || 0) + (orderForm.fittingCharges || 0);
                        const disc = discountTypeMode === 'Percentage' ? Math.round((sub * orderForm.discountPercent) / 100) : (discountTypeMode === 'Amount' ? orderForm.discount : 0);
                        const afterDisc = Math.max(0, sub - disc);
                        const mCust = customers.find(c => (orderForm.customerId && c.customerId === orderForm.customerId) || (orderForm.mobile && c.mobile === orderForm.mobile));
                        const pts = mCust?.loyaltyPoints || 0;
                        const maxR = calculateMaxRedeemable(afterDisc, pts, settings?.loyaltySettings);
                        const ptsUsed = orderForm.useLoyalty ? Math.min(orderForm.loyaltyPointsToRedeem, maxR.maxPoints) : 0;
                        const loyDisc = calculateMonetaryValue(ptsUsed, settings?.loyaltySettings);
                        const net = Math.max(0, afterDisc - loyDisc);
                        return Math.max(0, net - (orderForm.advance || 0)).toLocaleString();
                      })()}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Payment Method</label>
                    <select
                      value={orderForm.paymentMethod}
                      onChange={e => setOrderForm({ ...orderForm, paymentMethod: e.target.value as PaymentMethod })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Estimated Delivery Date</label>
                    <input
                      type="date"
                      value={orderForm.deliveryDate}
                      onChange={e => setOrderForm({ ...orderForm, deliveryDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 6. LAB & TECHNICIAN NOTES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Optical Lab / Technician</label>
                  <input
                    type="text"
                    value={orderForm.assignedTechnician}
                    onChange={e => setOrderForm({ ...orderForm, assignedTechnician: e.target.value })}
                    placeholder="Master Optical Lab"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Special Fitting / Lab Notes</label>
                  <input
                    type="text"
                    value={orderForm.notes}
                    onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })}
                    placeholder="e.g. High index bevel fitting, urgent delivery, anti-scratch coating"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* MODAL ACTION BUTTONS */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Auto-generates Invoice & Syncs CRM + Eye Power History</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-xs shadow-md transition flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm & Book Spectacle Order
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* =========================================================================
              MODAL 4: NEW POS SALE
             ========================================================================= */}
          {quickModal === 'new-sale' && (
            <form onSubmit={handleSaveSale} className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={saleForm.customerName}
                      onChange={e => setSaleForm({ ...saleForm, customerName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mobile</label>
                    <input
                      type="text"
                      value={saleForm.mobile}
                      onChange={e => setSaleForm({ ...saleForm, mobile: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={saleForm.paymentMethod}
                    onChange={e => setSaleForm({ ...saleForm, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Due">Due / Credit</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setQuickModal(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Complete Sale & Print Bill
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              MODAL 5: NEW STOCK PURCHASE
             ========================================================================= */}
          {quickModal === 'new-purchase' && (
            <form onSubmit={handleSavePurchase} className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Supplier</label>
                    <select
                      value={purchaseForm.supplierName}
                      onChange={e => setPurchaseForm({ ...purchaseForm, supplierName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50"
                    >
                      {suppliers.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Supplier Invoice #</label>
                    <input
                      type="text"
                      value={purchaseForm.invoiceNumber}
                      onChange={e => setPurchaseForm({ ...purchaseForm, invoiceNumber: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Item Category</label>
                    <select
                      value={purchaseForm.itemType}
                      onChange={e => setPurchaseForm({ ...purchaseForm, itemType: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50"
                    >
                      <option value="Lens">Lens SKU</option>
                      <option value="Frame">Frame SKU</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Item SKU / Code</label>
                    <input
                      type="text"
                      value={purchaseForm.itemCode}
                      onChange={e => setPurchaseForm({ ...purchaseForm, itemCode: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Quantity Received</label>
                    <input
                      type="number"
                      value={purchaseForm.quantity}
                      onChange={e => setPurchaseForm({ ...purchaseForm, quantity: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-xl font-black text-emerald-700 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Purchase Cost (₹)</label>
                    <input
                      type="number"
                      value={purchaseForm.purchaseRate}
                      onChange={e => setPurchaseForm({ ...purchaseForm, purchaseRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setQuickModal(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Record Stock Inward (+)
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
