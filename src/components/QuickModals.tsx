import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import {
  Patient,
  Appointment,
  SpectacleOrder,
  RetailSale,
  PaymentMethod,
  VisitType,
  Gender
} from '../types';

export const QuickModals: React.FC = () => {
  const {
    quickModal,
    setQuickModal,
    createPatient,
    createAppointment,
    createSpectacleOrder,
    createRetailSale,
    addStockMovement,
    patients = [],
    lenses = [],
    frames = [],
    suppliers = [],
    settings,
    clinicalDraft,
    showToast
  } = useErp();

  const doctorsList = settings?.examiners && settings.examiners.length > 0
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
    district: 'Paharpur',
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

  // 3. Spectacle Order Form State
  const [orderForm, setOrderForm] = useState({
    mrd: clinicalDraft?.mrd || (patients?.[0]?.mrd ?? ''),
    customerName: clinicalDraft?.patientName || (patients?.[0]?.name ?? ''),
    mobile: clinicalDraft?.mobile || (patients?.[0]?.mobile ?? ''),
    frameSku: frames?.[0]?.sku || '',
    lensCode: lenses?.[0]?.lensCode || '',
    frameRate: frames?.[0]?.retailRate || 1200,
    lensRate: lenses?.[0]?.retailRate || 1000,
    fittingCharges: 100,
    discount: 0,
    advance: 1000,
    paymentMethod: 'Cash' as PaymentMethod,
    deliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    assignedTechnician: 'Master Optical Lab',
    notes: 'Standard optical fitting'
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

  // Spectacle Order submit
  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const selFrame = frames.find(f => f.sku === orderForm.frameSku);
    const selLens = lenses.find(l => l.lensCode === orderForm.lensCode);
    const selPatient = patients.find(p => p.mrd === orderForm.mrd);

    const subTotal = orderForm.frameRate + orderForm.lensRate + orderForm.fittingCharges;
    const total = Math.max(0, subTotal - orderForm.discount);
    const due = Math.max(0, total - orderForm.advance);

    createSpectacleOrder({
      mrd: orderForm.mrd || (selPatient?.mrd ?? 'MRD-WALKIN'),
      customerName: selPatient?.name || orderForm.customerName,
      mobile: selPatient?.mobile || orderForm.mobile,
      frameSku: orderForm.frameSku,
      frameBrand: selFrame ? `${selFrame.brand} (${selFrame.model})` : 'Custom Frame',
      lensCode: orderForm.lensCode,
      lensBrand: selLens ? `${selLens.brand} (${selLens.category})` : 'Custom Lens',
      frameRate: orderForm.frameRate,
      lensRate: orderForm.lensRate,
      fittingCharges: orderForm.fittingCharges,
      discount: orderForm.discount,
      total,
      advance: orderForm.advance,
      due,
      paymentMethod: orderForm.paymentMethod,
      deliveryDate: orderForm.deliveryDate,
      status: 'New',
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
              MODAL 3: NEW SPECTACLE ORDER
             ========================================================================= */}
          {quickModal === 'new-order' && (
            <form onSubmit={handleSaveOrder} className="space-y-4">
              <div className="space-y-3">
                
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Patient / Customer</label>
                  <select
                    value={orderForm.mrd}
                    onChange={e => {
                      const found = patients.find(p => p.mrd === e.target.value);
                      if (found) {
                        setOrderForm({
                          ...orderForm,
                          mrd: found.mrd,
                          customerName: found.name,
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
                    <label className="font-bold text-slate-700 block mb-1">Select Frame SKU</label>
                    <select
                      value={orderForm.frameSku}
                      onChange={e => {
                        const frm = frames.find(f => f.sku === e.target.value);
                        setOrderForm({
                          ...orderForm,
                          frameSku: e.target.value,
                          frameRate: frm?.retailRate || orderForm.frameRate
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-bold"
                    >
                      {frames.map(f => (
                        <option key={f.sku} value={f.sku}>
                          {f.brand} ({f.model}) — ₹{f.retailRate} (Stock: {f.currentStock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Select Lens Pair</label>
                    <select
                      value={orderForm.lensCode}
                      onChange={e => {
                        const lns = lenses.find(l => l.lensCode === e.target.value);
                        setOrderForm({
                          ...orderForm,
                          lensCode: e.target.value,
                          lensRate: lns?.retailRate || orderForm.lensRate
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-bold"
                    >
                      {lenses.map(l => (
                        <option key={l.lensCode} value={l.lensCode}>
                          {l.brand} ({l.coating}) — ₹{l.retailRate} (Stock: {l.currentStock})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block">Frame (₹)</label>
                    <input
                      type="number"
                      value={orderForm.frameRate}
                      onChange={e => setOrderForm({ ...orderForm, frameRate: Number(e.target.value) })}
                      className="w-full px-2 py-1 bg-white border rounded font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block">Lens Pair (₹)</label>
                    <input
                      type="number"
                      value={orderForm.lensRate}
                      onChange={e => setOrderForm({ ...orderForm, lensRate: Number(e.target.value) })}
                      className="w-full px-2 py-1 bg-white border rounded font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block">Discount (₹)</label>
                    <input
                      type="number"
                      value={orderForm.discount}
                      onChange={e => setOrderForm({ ...orderForm, discount: Number(e.target.value) })}
                      className="w-full px-2 py-1 bg-white border rounded text-emerald-700 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Advance Received (₹)</label>
                    <input
                      type="number"
                      value={orderForm.advance}
                      onChange={e => setOrderForm({ ...orderForm, advance: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-xl font-black text-emerald-700 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Estimated Delivery Date</label>
                    <input
                      type="date"
                      value={orderForm.deliveryDate}
                      onChange={e => setOrderForm({ ...orderForm, deliveryDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50"
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
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black shadow-xs"
                >
                  Book Order & Deduct Stock
                </button>
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
