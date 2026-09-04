import React, { useState, useEffect } from 'react';
import { useErp } from '../context/ErpContext';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Stethoscope,
  HeartPulse,
  DollarSign,
  CheckCircle2,
  Printer,
  MessageSquare,
  Search,
  Plus,
  UserPlus,
  AlertCircle,
  FileText,
  Activity,
  Check
} from 'lucide-react';
import { Gender, VisitType, PaymentMethod, Appointment, Patient } from '../types';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillPatient?: Patient | null;
}

const COMMON_SYMPTOMS = [
  'চোখে ঝাপসা দেখা (Blurry Vision)',
  'চশমার পাওয়ার চেক (Spectacle Power Check)',
  'চোখ লাল ও জ্বালা (Redness & Burning)',
  'চোখ দিয়ে জল পড়া (Watering Eyes)',
  'চোখে চুলকানি ও এলার্জি (Itching & Allergy)',
  'মাথা ব্যাথা ও চোখের টান (Headache & Eye Strain)',
  'দূরের বা কাছের জিনিস দেখতে সমস্যা (Distance/Near blur)',
  'চোখে ছানি / মেঘ জমা (Cataract Symptoms)',
  'রাতে দেখতে সমস্যা (Night Vision Problem)',
  'চোখে আঘাত বা ময়লা পড়া (Injury / Foreign Body)',
  'রুটিন চক্ষু পরীক্ষা (Routine Eye Checkup)'
];

const MEDICAL_HISTORY_OPTIONS = [
  'ডায়াবেটিস (Diabetes)',
  'হাই ব্লাড প্রেশার (Hypertension)',
  'পূর্বে চশমা ব্যবহার করেন (Glasses User)',
  'চোখের অপারেশন / ছানি সার্জারি (Past Cataract/Eye Surgery)',
  'গ্লুকোমা / প্রেসার (Glaucoma)',
  'ঔষধ / ড্রপ এলার্জি (Drug Allergy)',
  'থাইরয়েড (Thyroid)'
];

const TIME_SLOTS = [
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM'
];

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  prefillPatient
}) => {
  const {
    patients = [],
    settings,
    createAppointment,
    startVisitFromAppointment,
    setPrintModalData,
    showToast
  } = useErp();

  // Mode: 'new' patient or 'existing' patient
  const [patientMode, setPatientMode] = useState<'new' | 'existing'>('new');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedMrd, setSelectedMrd] = useState('');

  // Doctor list
  const doctorsList = Array.isArray(settings?.examiners) && settings.examiners.length > 0
    ? settings.examiners.filter(ex => ex.active).map(ex => `${ex.name} (${ex.role})`)
    : [
        settings?.doctorName ? `${settings.doctorName} (Ophthalmologist)` : 'Dr. S. K. Banerjee (Ophthalmologist)',
        settings?.optometristName ? `${settings.optometristName} (Optometrist)` : 'Dr. R. N. Mukherjee (Optometrist)',
        'Aniket Roy (Refractionist)'
      ];

  // Form state
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [age, setAge] = useState<number | ''>(35);
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  
  // Location / Address
  const [village, setVillage] = useState('');
  const [address, setAddress] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [district, setDistrict] = useState('South 24 Parganas');
  const [occupation, setOccupation] = useState('');
  const [referredBy, setReferredBy] = useState('Self Walk-in');

  // Clinical & Symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customComplaint, setCustomComplaint] = useState('');
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Appointment Scheduling
  const todayStr = new Date().toISOString().split('T')[0];
  const [aptDate, setAptDate] = useState(todayStr);
  const [aptTime, setAptTime] = useState('11:00 AM');
  const [doctor, setDoctor] = useState(doctorsList[0] || 'Dr. S. K. Banerjee (Ophthalmologist)');
  const [visitType, setVisitType] = useState<VisitType | string>('New Eye Consultation');
  const [fee, setFee] = useState<number>(settings?.consultationFee || 200);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Due' | 'Complimentary'>('Paid');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');

  // Post booking success screen state
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  // Initialize or prefill
  useEffect(() => {
    if (prefillPatient) {
      setPatientMode('existing');
      setSelectedMrd(prefillPatient.mrd);
      setName(prefillPatient.name);
      setMobile(prefillPatient.mobile);
      setWhatsapp(prefillPatient.whatsapp || prefillPatient.mobile);
      setAge(prefillPatient.age || 35);
      setDob(prefillPatient.dob || '');
      setGender(prefillPatient.gender || 'Male');
      setVillage(prefillPatient.village || '');
      setAddress(prefillPatient.address || '');
      setPostOffice(prefillPatient.postOffice || '');
      setPoliceStation(prefillPatient.policeStation || '');
      setDistrict(prefillPatient.district || 'South 24 Parganas');
      setOccupation(prefillPatient.occupation || '');
      setReferredBy(prefillPatient.referredBy || 'Self');
      if (prefillPatient.medicalHistory) setMedicalHistory(prefillPatient.medicalHistory);
      if (prefillPatient.chiefComplaints) setSelectedSymptoms([prefillPatient.chiefComplaints]);
    }
  }, [prefillPatient, isOpen]);

  // Handle DOB change -> auto compute Age
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val) {
      const birthYear = new Date(val).getFullYear();
      const currentYear = new Date().getFullYear();
      if (birthYear > 1900 && birthYear <= currentYear) {
        setAge(currentYear - birthYear);
      }
    }
  };

  // Handle Age change -> update DOB estimate
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    setAge(val);
    if (typeof val === 'number' && val > 0 && val <= 120 && !dob) {
      const estimatedYear = new Date().getFullYear() - val;
      setDob(`${estimatedYear}-01-01`);
    }
  };

  // Toggle symptom chip
  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  // Toggle medical history checkbox
  const toggleMedicalHistory = (med: string) => {
    setMedicalHistory(prev =>
      prev.includes(med) ? prev.filter(m => m !== med) : [...prev, med]
    );
  };

  // Select existing patient from search list
  const handleSelectPatient = (p: Patient) => {
    setSelectedMrd(p.mrd);
    setName(p.name);
    setMobile(p.mobile);
    setWhatsapp(p.whatsapp || p.mobile);
    setAge(p.age || 35);
    setDob(p.dob || '');
    setGender(p.gender || 'Male');
    setVillage(p.village || '');
    setAddress(p.address || '');
    setPostOffice(p.postOffice || '');
    setPoliceStation(p.policeStation || '');
    setDistrict(p.district || 'South 24 Parganas');
    setOccupation(p.occupation || '');
    setReferredBy(p.referredBy || 'Self');
    if (p.medicalHistory) setMedicalHistory(p.medicalHistory);
    if (p.chiefComplaints) setSelectedSymptoms([p.chiefComplaints]);
    setVisitType('Follow-up Review');
    setPatientSearch('');
  };

  // Filter existing patients
  const filteredPatients = patientSearch.trim()
    ? patients.filter(
        p =>
          p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
          p.mrd.toLowerCase().includes(patientSearch.toLowerCase()) ||
          p.mobile.includes(patientSearch) ||
          (p.village && p.village.toLowerCase().includes(patientSearch.toLowerCase()))
      )
    : patients.slice(0, 5);

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('রোগীর নাম আবশ্যক (Patient name is required)', 'warning');
      return;
    }
    if (!mobile.trim() || mobile.replace(/[^0-9]/g, '').length < 8) {
      showToast('সঠিক মোবাইল নম্বর দিন (Valid mobile number is required)', 'warning');
      return;
    }

    const compiledComplaints = [
      ...selectedSymptoms,
      ...(customComplaint.trim() ? [customComplaint.trim()] : [])
    ].join(' • ');

    const fullAddress = address.trim() || (village.trim() ? `${village.trim()}, ${district}` : `${district}`);

    // Create the appointment (this also registers or updates the Patient and Customer in ErpContext)
    const newApt = createAppointment({
      mrd: patientMode === 'existing' && selectedMrd ? selectedMrd : '',
      patientName: name.trim(),
      mobile: mobile.trim(),
      age: typeof age === 'number' ? age : 35,
      dob: dob || undefined,
      gender,
      village: village.trim(),
      address: fullAddress,
      postOffice: postOffice.trim(),
      policeStation: policeStation.trim(),
      district: district.trim(),
      occupation: occupation.trim(),
      referredBy: referredBy.trim(),
      doctor,
      date: aptDate,
      time: aptTime,
      visitType,
      status: 'Confirmed',
      chiefComplaints: compiledComplaints,
      medicalHistory,
      fee: Number(fee) || 0,
      paidAmount: paymentStatus === 'Paid' ? Number(fee) || 0 : 0,
      paymentMethod: paymentStatus === 'Paid' ? paymentMethod : undefined,
      notes: notes.trim() || `Booked via counter / appointment desk`
    });

    setBookedAppointment(newApt);
  };

  // WhatsApp reminder message
  const handleWhatsAppSend = (apt: Appointment) => {
    const cleanMobile = (apt.mobile || '').replace(/[^0-9]/g, '');
    const fullNumber = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const msg = encodeURIComponent(
      `নমস্কার ${apt.patientName},\n` +
      `Paharpur Eye Care এ আপনার চক্ষু পরীক্ষার অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে।\n` +
      `📅 তারিখ: ${apt.date}\n` +
      `⏰ সময়: ${apt.time}\n` +
      `👨‍⚕️ কনসালট্যান্ট: ${apt.doctor}\n` +
      `🏥 স্থান: পাহাডপুর আই কেয়ার, পাহাডপুর মেইন রোড।\n` +
      `📞 হেল্পলাইন: +91 98301 23456\n` +
      `ধন্যবাদ!`
    );
    window.open(`https://wa.me/${fullNumber}?text=${msg}`, '_blank');
  };

  // Print Appointment Slip
  const handlePrintSlip = (apt: Appointment) => {
    setPrintModalData({
      type: 'appointment',
      data: {
        ...apt,
        age: typeof age === 'number' ? age : apt.age || 35,
        gender,
        village: village || apt.village,
        address: address || apt.address,
        symptoms: selectedSymptoms.join(', ') || customComplaint || apt.chiefComplaints
      }
    });
  };

  // Start Clinical Visit immediately
  const handleStartVisitNow = (apt: Appointment) => {
    startVisitFromAppointment(apt.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95">
        
        {/* =========================================================================
            MODAL HEADER
           ========================================================================= */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white px-5 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Book Eye Consultation Appointment (বুক অ্যাপয়েন্টমেন্ট)
                </h2>
                <span className="bg-teal-500/30 text-teal-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-teal-400/30 uppercase tracking-wider">
                  Full Details Entry
                </span>
              </div>
              <p className="text-xs text-teal-200/80 font-medium">
                বাড়ি, গ্রাম, বয়স, জন্ম তারিখ, মোবাইল ও রোগের সম্পূর্ণ তথ্য সংগ্রহ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================================
            IF APPOINTMENT JUST BOOKED -> SUCCESS SCREEN
           ========================================================================= */}
        {bookedAppointment ? (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-slate-900">
            
            {/* Success Banner */}
            <div className="bg-emerald-50 border-2 border-emerald-300 p-5 rounded-2xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-black text-emerald-950">
                  🎉 অ্যাপয়েন্টমেন্ট সফলভাবে বুকিং ও রেজিস্টার হয়েছে!
                </h3>
                <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                  Appointment #{bookedAppointment.id} confirmed for <strong>{bookedAppointment.patientName}</strong> (MRD: <span className="font-mono">{bookedAppointment.mrd}</span>)
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-emerald-900 font-bold">
                  <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                    📅 {bookedAppointment.date} at {bookedAppointment.time}
                  </span>
                  <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                    👨‍⚕️ {bookedAppointment.doctor}
                  </span>
                  {bookedAppointment.village && (
                    <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                      📍 গ্রাম: {bookedAppointment.village}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              
              {/* 1. Start Clinical Visit Now */}
              <button
                id="btn-start-visit-now"
                onClick={() => handleStartVisitNow(bookedAppointment)}
                className="p-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs flex flex-col items-center text-center gap-2 shadow-md hover:scale-[1.02] transition-all"
              >
                <Stethoscope className="w-6 h-6 text-teal-200" />
                <div>
                  <span className="block text-sm font-black">⚡ START VISIT NOW</span>
                  <span className="text-[10px] text-teal-100 font-medium">ডাক্তারের চেম্বারে পাঠান</span>
                </div>
              </button>

              {/* 2. Print Token Slip */}
              <button
                id="btn-print-apt-slip"
                onClick={() => handlePrintSlip(bookedAppointment)}
                className="p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex flex-col items-center text-center gap-2 shadow-md hover:scale-[1.02] transition-all"
              >
                <Printer className="w-6 h-6 text-amber-400" />
                <div>
                  <span className="block text-sm font-black">🖨️ PRINT APPOINTMENT SLIP</span>
                  <span className="text-[10px] text-slate-300 font-medium">রোগীকে রসিদ / টোকেন দিন</span>
                </div>
              </button>

              {/* 3. Send WhatsApp Confirmation */}
              <button
                id="btn-send-wa-confirm"
                onClick={() => handleWhatsAppSend(bookedAppointment)}
                className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex flex-col items-center text-center gap-2 shadow-md hover:scale-[1.02] transition-all"
              >
                <MessageSquare className="w-6 h-6 text-emerald-200" />
                <div>
                  <span className="block text-sm font-black">💬 WHATSAPP CONFIRM</span>
                  <span className="text-[10px] text-emerald-100 font-medium">হোয়াটসঅ্যাপ কনফার্মেশন পাঠান</span>
                </div>
              </button>

            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs"
              >
                Done / Close (সম্পন্ন)
              </button>
            </div>

          </div>
        ) : (
          /* =========================================================================
              MAIN APPOINTMENT BOOKING FORM
             ========================================================================= */
          <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-800">
            
            {/* Top Toggle: New Patient vs Existing Registered Patient */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-2 border border-slate-200">
              <button
                type="button"
                onClick={() => setPatientMode('new')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  patientMode === 'new'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                + New Patient Registration (নতুন রোগী বুকিং)
              </button>

              <button
                type="button"
                onClick={() => setPatientMode('existing')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  patientMode === 'existing'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Search className="w-4 h-4" />
                🔍 Search Existing Patient (পূর্বে রেজিস্টার্ড রোগী)
              </button>
            </div>

            {/* If Existing Patient Mode -> Search Bar and Patient Picker */}
            {patientMode === 'existing' && (
              <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200 space-y-3 animate-in fade-in">
                <label className="font-bold text-teal-900 block">
                  Search Registered Patient by Name, Mobile, MRD, or Village:
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-teal-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                    placeholder="Type name, phone number, village..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-teal-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Patient Search Results dropdown */}
                {patientSearch && (
                  <div className="max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
                    {filteredPatients.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 font-medium">
                        No matching registered patient found. You can switch to New Patient mode.
                      </div>
                    ) : (
                      filteredPatients.map(p => (
                        <div
                          key={p.mrd}
                          onClick={() => handleSelectPatient(p)}
                          className="p-3 hover:bg-teal-50 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {p.name} <span className="text-teal-700 font-mono">({p.mrd})</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              📞 {p.mobile} • {p.age}Y/{p.gender} • 📍 {p.village || p.address}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                            Select Patient
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {selectedMrd && (
                  <div className="bg-white p-3 rounded-xl border border-teal-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="font-extrabold text-slate-900">
                        Selected: {name} (<span className="font-mono text-teal-700">{selectedMrd}</span>)
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Mobile: <strong>{mobile}</strong> • Village: <strong>{village || 'N/A'}</strong>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* =========================================================================
                SECTION 1: PATIENT PERSONAL & CONTACT DETAILS
               ========================================================================= */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                <User className="w-4 h-4 text-teal-600" />
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                  ১. রোগীর ব্যক্তিগত ও যোগাযোগের বিবরণ (Patient & Contact Information)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                
                {/* 1. Full Name */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    রোগীর পুরো নাম (Patient Full Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. সুব্রত চ্যাটার্জী / Subrata Chatterjee"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-extrabold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* 2. Gender */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    লিঙ্গ (Gender) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50 focus:bg-white text-slate-900"
                  >
                    <option value="Male">পুরুষ (Male)</option>
                    <option value="Female">মহিলা (Female)</option>
                    <option value="Other">অন্যান্য (Other)</option>
                  </select>
                </div>

                {/* 3. Mobile Number */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    মোবাইল নম্বর (Mobile Number) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={e => {
                        setMobile(e.target.value);
                        if (!whatsapp) setWhatsapp(e.target.value);
                      }}
                      placeholder="10-digit Mobile"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* 4. Age */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    বয়স কত (Age in Years) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      required
                      min={1}
                      max={125}
                      value={age}
                      onChange={handleAgeChange}
                      placeholder="Age"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 bg-slate-50 focus:bg-white text-center focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-xs font-bold text-slate-500 px-1">Years</span>
                  </div>
                </div>

                {/* 5. Date of Birth (DOB) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    জন্ম তারিখ (Date of Birth / DOB) <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={handleDobChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* 6. Occupation */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    পেশা (Occupation)
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={e => setOccupation(e.target.value)}
                    placeholder="Teacher, Farmer, Student, Homemaker..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* 7. Referred By */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    রেফারেন্স (Referred By / কার মাধ্যমে এসেছেন)
                  </label>
                  <input
                    type="text"
                    value={referredBy}
                    onChange={e => setReferredBy(e.target.value)}
                    placeholder="Self / Dr. Name / Optical Camp / Neighbor..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 bg-slate-50 focus:bg-white"
                  />
                </div>

              </div>
            </div>

            {/* =========================================================================
                SECTION 2: ADDRESS & LOCATION (বাড়ি কোথায় ও গ্রাম কোথায়)
               ========================================================================= */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                <MapPin className="w-4 h-4 text-rose-600" />
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                  ২. রোগীর ঠিকানা ও গ্রাম (Location & Address Details)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                
                {/* 1. Village / Gram */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    গ্রাম / পাড়া (Village / Gram / Para) <span className="text-teal-700 font-extrabold">*</span>
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={e => setVillage(e.target.value)}
                    placeholder="e.g. পাহাডপুর বাজার / Rasulpur"
                    className="w-full px-3 py-2 border border-teal-300 bg-white rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* 2. Bari Kothay / Street Address */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    বাড়ি কোথায় / রাস্তার ঠিকানা (House / Road / Landmark)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g.Near Primary School, Main Road"
                    className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* 3. Post Office */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ডাকঘর (Post Office)
                  </label>
                  <input
                    type="text"
                    value={postOffice}
                    onChange={e => setPostOffice(e.target.value)}
                    placeholder="e.g. Paharpur P.O."
                    className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl font-medium text-slate-900"
                  />
                </div>

                {/* 4. Police Station */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    থানা (Police Station)
                  </label>
                  <input
                    type="text"
                    value={policeStation}
                    onChange={e => setPoliceStation(e.target.value)}
                    placeholder="e.g. Digha / Paharpur PS"
                    className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl font-medium text-slate-900"
                  />
                </div>

                {/* 5. District */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    জেলা (District)
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder="South 24 Parganas / Purba Medinipur"
                    className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl font-bold text-slate-900"
                  />
                </div>

              </div>
            </div>

            {/* =========================================================================
                SECTION 3: EYE COMPLAINTS & MEDICAL HISTORY (চোখের সমস্যা ও পুরো হিস্ট্রি)
               ========================================================================= */}
            <div className="space-y-3 bg-teal-50/30 p-4 rounded-2xl border border-teal-200">
              <div className="flex items-center gap-2 pb-1 border-b border-teal-200">
                <HeartPulse className="w-4 h-4 text-teal-700" />
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                  ৩. চোখের লক্ষণ, সমস্যা ও শারীরিক হিস্ট্রি (Eye Symptoms & Full Medical History)
                </h3>
              </div>

              {/* Quick Select Symptoms */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  চোখের প্রধান সমস্যা (Chief Eye Symptoms - দ্রুত নির্বাচন করুন):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SYMPTOMS.map(sym => {
                    const isSelected = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => toggleSymptom(sym)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-teal-700 text-white shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-teal-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-teal-200" />}
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Complaint Input */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  অন্য কোনো চোখের লক্ষণ বা সমস্যা থাকলে লিখুন (Custom Complaint):
                </label>
                <input
                  type="text"
                  value={customComplaint}
                  onChange={e => setCustomComplaint(e.target.value)}
                  placeholder="যেমন: ৩ দিন ধরে ডান চোখে জল পড়ছে ও আলো দেখলে ব্যাথা করছে..."
                  className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl text-slate-900 font-medium"
                />
              </div>

              {/* Medical History Checkboxes */}
              <div className="pt-2 border-t border-teal-100">
                <label className="font-bold text-slate-800 block mb-1.5">
                  পূর্বের শারীরিক ও চোখের হিস্ট্রি (General Medical & Ocular History):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MEDICAL_HISTORY_OPTIONS.map(med => {
                    const checked = medicalHistory.includes(med);
                    return (
                      <label
                        key={med}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition-colors ${
                          checked
                            ? 'bg-teal-100/70 border-teal-400 text-teal-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMedicalHistory(med)}
                          className="w-3.5 h-3.5 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className="text-[11px]">{med}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* =========================================================================
                SECTION 4: APPOINTMENT DATE, DOCTOR & PAYMENT
               ========================================================================= */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                  ৪. অ্যাপয়েন্টমেন্ট শিডিউল ও ডাক্তার (Schedule, Doctor & Fee)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                
                {/* 1. Appointment Date */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    তারিখ (Appointment Date) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={aptDate}
                    onChange={e => setAptDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="flex gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setAptDate(todayStr)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        aptDate === todayStr ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      আজ (Today)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tm = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                        setAptDate(tm);
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        aptDate !== todayStr ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      আগামীকাল (Tomorrow)
                    </button>
                  </div>
                </div>

                {/* 2. Time Slot */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    সময় ও স্লট (Time Slot) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={aptTime}
                    onChange={e => setAptTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white text-slate-900"
                  >
                    {TIME_SLOTS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Consultant Doctor */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    কনসালট্যান্ট ডাক্তার (Consultant) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={doctor}
                    onChange={e => setDoctor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white text-slate-900"
                  >
                    {doctorsList.map(doc => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Visit Type */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ভিজিট টাইপ (Visit Type)
                  </label>
                  <select
                    value={visitType}
                    onChange={e => setVisitType(e.target.value as VisitType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white text-slate-900"
                  >
                    <option value="New Eye Consultation">নতুন চক্ষু পরীক্ষা (New Eye Consultation)</option>
                    <option value="Spectacle Refraction Only">শুধুমাত্র চশমার পাওয়ার চেক (Refraction)</option>
                    <option value="Follow-up Review">ফলো-আপ রিভিউ (Follow-up Review)</option>
                    <option value="Post-Op Checkup">অপারেশন পরবর্তী চেকআপ (Post-Op)</option>
                    <option value="Emergency Eye Care">জরুরি চক্ষু চিকিৎসা (Emergency)</option>
                  </select>
                </div>

                {/* 5. Consultation Fee */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    কনসালটেশন ফি (Consultation Fee ₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={fee}
                    onChange={e => setFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-black text-emerald-800 bg-white"
                  />
                </div>

                {/* 6. Payment Status */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ফি আদায় স্ট্যাটাস (Payment Status)
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white text-slate-900"
                  >
                    <option value="Paid">Paid / আদায় হয়েছে</option>
                    <option value="Due">Due / পরবর্তীতে প্রদান করবে</option>
                    <option value="Complimentary">Free / বিনামূল্যে</option>
                  </select>
                </div>

              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  রিসেপশন বা বিশেষ নোট (Reception Instructions / Notes)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. ড্রপ দিয়ে চোখ ডাইলেট করতে হতে পারে / বয়স্ক রোগী অগ্রাধিকার"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900"
                />
              </div>

            </div>

            {/* =========================================================================
                FOOTER ACTION BUTTONS
               ========================================================================= */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                বাতিল (Cancel)
              </button>

              <button
                id="btn-confirm-appointment-submit"
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black shadow-md flex items-center gap-2 hover:scale-[1.02] transition-all"
              >
                <CheckCircle2 className="w-5 h-5 text-teal-200" />
                ✓ কনফার্ম বুকিং ও রেজিস্টার (Confirm Appointment)
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
