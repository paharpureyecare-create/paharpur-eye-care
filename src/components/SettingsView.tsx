import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { ClinicExaminer } from '../types';
import {
  Settings,
  Building2,
  UserCheck,
  FileText,
  FileSpreadsheet,
  Database,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Save,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  Stethoscope,
  Glasses,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    auditLogs,
    exportFullDatabase,
    importDatabaseBackup,
    resetToSeedData,
    syncWithGoogleSheets,
    showToast
  } = useErp();

  const [activeSubTab, setActiveSubTab] = useState<'shop' | 'examiners' | 'rx-format' | 'sync' | 'backup'>('shop');
  
  // Local form state cloned from settings
  const [formData, setFormData] = useState({
    shopName: settings.shopName || 'PAHARPUR EYE CARE',
    tagline: settings.tagline || 'Advanced Optical Center & Comprehensive Eye Care Clinic',
    address: settings.address || 'Paharpur Main Road, Near Bus Stand, South 24 Parganas, West Bengal - 700141',
    mobile: settings.mobile || '+91 98301 23456',
    whatsapp: settings.whatsapp || '+91 98301 23456',
    email: settings.email || 'paharpureyecare@gmail.com',
    gstin: settings.gstin || '19ABCDE1234F1Z5',
    tradeLicenseNo: settings.tradeLicenseNo || 'TRAD/PEC/2024-27/0889',
    invoicePrefix: settings.invoicePrefix || 'PEC/2026/',
    orderPrefix: settings.orderPrefix || 'ORD-',
    mrdPrefix: settings.mrdPrefix || 'PEC-MRD-',
    doctorName: settings.doctorName || 'Dr. S. K. Banerjee',
    doctorQualification: settings.doctorQualification || 'MBBS, MS (Ophthalmology), FICO (UK) - Senior Eye Surgeon',
    doctorRegNo: settings.doctorRegNo || 'WBMC/58421',
    doctorFee: settings.doctorFee || 300,
    optometristName: settings.optometristName || 'Dr. R. N. Mukherjee',
    optometristQualification: settings.optometristQualification || 'B.Optom, M.Optom, DOS, FIACLE - Consultant Optometrist',
    optometristRegNo: settings.optometristRegNo || 'OPT-WB/2018/89',
    optometristFee: settings.optometristFee || 150,
    defaultExaminer: settings.defaultExaminer || 'Dr. S. K. Banerjee',
    defaultLensFittingCharge: settings.defaultLensFittingCharge || 100,
    defaultFollowUpDays: settings.defaultFollowUpDays || 15,
    rxHeader: settings.rxHeader || 'PAHARPUR EYE CARE CLINIC & ADVANCED OPTICAL VISION CENTER',
    rxFooter: settings.rxFooter || 'Always bring this prescription slip during follow-up visits. Eye refraction check recommended every 12 months.',
    orderFooterNote: settings.orderFooterNote || 'Please collect your spectacles with this original slip. Lens warranty covers manufacturing defects for 1 year.',
    billFooterNote: settings.billFooterNote || 'Thank you for visiting Paharpur Eye Care. Goods once sold can be adjusted as per store optical warranty terms.',
    termsAndConditions: settings.termsAndConditions || '1. Advance is non-refundable once lens edging is initiated.\n2. Power verification valid for 30 days.\n3. Frame alignment and ultrasonic cleaning are complimentary.',
    currencySymbol: settings.currencySymbol || '₹',
    googleSheetId: settings.googleSheetId || '1PEC_Master_ERP_Sheet_2026_LiveSync'
  });

  // Examiners list state
  const [examinersList, setExaminersList] = useState<ClinicExaminer[]>(
    settings.examiners && settings.examiners.length > 0
      ? settings.examiners
      : [
          {
            id: 'EXAM-01',
            name: 'Dr. S. K. Banerjee',
            role: 'Ophthalmologist',
            qualification: 'MBBS, MS (Ophthalmology), FICO (UK)',
            regNo: 'WBMC/58421',
            consultationFee: 300,
            phone: '+91 98301 23456',
            active: true
          },
          {
            id: 'EXAM-02',
            name: 'Dr. R. N. Mukherjee',
            role: 'Optometrist',
            qualification: 'B.Optom, M.Optom, DOS, FIACLE',
            regNo: 'OPT-WB/2018/89',
            consultationFee: 150,
            phone: '+91 98302 98765',
            active: true
          },
          {
            id: 'EXAM-03',
            name: 'Aniket Roy',
            role: 'Refractionist',
            qualification: 'D.Opt, Contact Lens Specialist',
            regNo: 'REF-WB/7712',
            consultationFee: 100,
            phone: '+91 98303 55443',
            active: true
          }
        ]
  );

  // New practitioner dialog state
  const [showAddExaminerModal, setShowAddExaminerModal] = useState(false);
  const [editingExaminerId, setEditingExaminerId] = useState<string | null>(null);
  const [newExaminer, setNewExaminer] = useState<Omit<ClinicExaminer, 'id'>>({
    name: '',
    role: 'Optometrist',
    qualification: '',
    regNo: '',
    consultationFee: 150,
    phone: '',
    active: true
  });

  // Advice presets state
  const [advicePresets, setAdvicePresets] = useState<string[]>(
    settings.rxAdvicePresets || [
      'Wear prescribed spectacles continuously for distance & near work.',
      'Do 20-20-20 eye rest rule during computer and mobile screen use.',
      'Wash eyes with clean cold water twice daily. Avoid rubbing eyes.',
      'Instill eye drops 5 minutes apart if using multiple drops.',
      'Maintain safe reading distance of at least 30-40 cm.',
      'Wear anti-reflective or UV protective lenses outdoors and for night driving.'
    ]
  );
  const [newAdviceText, setNewAdviceText] = useState('');

  // Save changes handler
  const handleSaveAll = () => {
    updateSettings({
      ...formData,
      examiners: examinersList,
      rxAdvicePresets: advicePresets
    });
    showToast('Shop and Clinic configuration saved successfully!');
  };

  // Add / Edit Examiner
  const handleSaveExaminer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExaminer.name.trim()) {
      showToast('Please enter practitioner name', 'error');
      return;
    }

    if (editingExaminerId) {
      setExaminersList(prev =>
        prev.map(ex => (ex.id === editingExaminerId ? { ...newExaminer, id: editingExaminerId } : ex))
      );
      showToast(`Updated ${newExaminer.name}`);
    } else {
      const created: ClinicExaminer = {
        ...newExaminer,
        id: `EXAM-${Date.now().toString().slice(-4)}`
      };
      setExaminersList(prev => [...prev, created]);
      showToast(`Added ${newExaminer.name} (${newExaminer.role})`);
    }

    setShowAddExaminerModal(false);
    setEditingExaminerId(null);
    setNewExaminer({
      name: '',
      role: 'Optometrist',
      qualification: '',
      regNo: '',
      consultationFee: 150,
      phone: '',
      active: true
    });
  };

  const handleEditExaminer = (ex: ClinicExaminer) => {
    setEditingExaminerId(ex.id);
    setNewExaminer({
      name: ex.name,
      role: ex.role,
      qualification: ex.qualification,
      regNo: ex.regNo,
      consultationFee: ex.consultationFee,
      phone: ex.phone || '',
      active: ex.active
    });
    setShowAddExaminerModal(true);
  };

  const handleDeleteExaminer = (id: string) => {
    if (examinersList.length <= 1) {
      showToast('You must keep at least one registered examiner', 'error');
      return;
    }
    setExaminersList(prev => prev.filter(ex => ex.id !== id));
    showToast('Examiner removed');
  };

  const handleToggleExaminerStatus = (id: string) => {
    setExaminersList(prev =>
      prev.map(ex => (ex.id === id ? { ...ex, active: !ex.active } : ex))
    );
  };

  // Add Advice Preset
  const handleAddAdvice = () => {
    if (!newAdviceText.trim()) return;
    setAdvicePresets(prev => [...prev, newAdviceText.trim()]);
    setNewAdviceText('');
    showToast('New Rx advice preset added!');
  };

  const handleDeleteAdvice = (idx: number) => {
    setAdvicePresets(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-teal-400 flex items-center justify-center shadow-md">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-950 tracking-tight">
                  Shop & Clinic Settings (দোকান ও ক্লিনিক কনফিগারেশন)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-50 text-teal-800 border border-teal-200">
                  Master Control
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Customize your store branding, Doctor & Optometrist refractionist team, print slips, and billing policies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md hover:scale-102 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save All Settings (সব সেভ করুন)
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-5 border-t border-slate-100">
          <button
            onClick={() => setActiveSubTab('shop')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'shop'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4 text-teal-400" />
            1. Shop & Branding (দোকানের তথ্য)
          </button>

          <button
            onClick={() => setActiveSubTab('examiners')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'examiners'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4 text-teal-400" />
            2. Doctors & Optometrists ({examinersList.length}) (ডাক্তার ও অপ্টোমেট্রিস্ট)
          </button>

          <button
            onClick={() => setActiveSubTab('rx-format')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'rx-format'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-400" />
            3. Prescription & Print Slips (প্রেসক্রিপশন স্লিপ)
          </button>

          <button
            onClick={() => setActiveSubTab('sync')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'sync'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-400" />
            4. Google Sheets Sync (ক্লাউড সিঙ্ক)
          </button>

          <button
            onClick={() => setActiveSubTab('backup')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'backup'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4 text-teal-400" />
            5. Backup & Audit Trail (ডাটা ব্যাকআপ ও লগ)
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: SHOP & BRANDING (দোকানের তথ্য ও পরিচিতি)
         ========================================================================= */}
      {activeSubTab === 'shop' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" />
              Optical Shop & Eye Clinic Profile (দোকান ও ক্লিনিকে ব্যবহৃত নাম ও বিবরণ)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These details will appear on top of all Prescriptions (Rx), Spectacle Job Cards, Cash Bills, and WhatsApp messages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Shop Name */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Shop / Clinic Name (দোকান বা ক্লিনিকের নাম) *
              </label>
              <input
                type="text"
                value={formData.shopName}
                onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="e.g. PAHARPUR EYE CARE"
              />
            </div>

            {/* Tagline / Subtitle */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Tagline / Specialty Slogan (স্লোগান / ট্যাগলাইন)
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="e.g. Advanced Optical Center & Comprehensive Eye Care Clinic"
              />
            </div>

            {/* Full Address */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Store Address (দোকানের সম্পূর্ণ ঠিকানা - প্রিন্ট ও চালানে আসবে) *
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="Paharpur Main Road, Near Bus Stand, South 24 Parganas, West Bengal - 700141"
              />
            </div>

            {/* Phone & Helpline */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                Primary Helpline Phone (হেল্পলাইন ফোন নম্বর) *
              </label>
              <input
                type="text"
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="+91 98301 23456"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp Business Number (রোগীদের মেসেজ পাঠাতে) *
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="+91 98301 23456"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-600" />
                Store Email (অফিসিয়াল ইমেইল)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="paharpureyecare@gmail.com"
              />
            </div>

            {/* GSTIN */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                GSTIN Number (জিএসটি নম্বর)
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none uppercase"
                placeholder="19ABCDE1234F1Z5"
              />
            </div>

            {/* Trade License */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Trade License / Drug License No (ট্রেড লাইসেন্স নম্বর)
              </label>
              <input
                type="text"
                value={formData.tradeLicenseNo}
                onChange={e => setFormData({ ...formData, tradeLicenseNo: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="TRAD/PEC/2024-27/0889"
              />
            </div>

            {/* Invoice Prefix */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Invoice Serial Prefix (বিল প্রিফিক্স)
              </label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={e => setFormData({ ...formData, invoicePrefix: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="PEC/2026/"
              />
            </div>

            {/* Spectacle Order Prefix */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Spectacle Order Prefix (চশমার অর্ডার প্রিফিক্স)
              </label>
              <input
                type="text"
                value={formData.orderPrefix}
                onChange={e => setFormData({ ...formData, orderPrefix: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="ORD-"
              />
            </div>

            {/* MRD Prefix */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Patient MRD Prefix (রোগী আইডি প্রিফিক্স)
              </label>
              <input
                type="text"
                value={formData.mrdPrefix}
                onChange={e => setFormData({ ...formData, mrdPrefix: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="PEC-MRD-"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Shop Profile
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DOCTORS & OPTOMETRISTS (ডাক্তার ও অপ্টোমেট্রিস্ট মাস্টার)
         ========================================================================= */}
      {activeSubTab === 'examiners' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                Eye Examiners Team (ডাক্তার, অপ্টোমেট্রিস্ট ও রিফ্র্যাকশনিস্ট তালিকা)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add and manage all Ophthalmologists (চক্ষু বিশেষজ্ঞ) and Optometrists (অপ্টোমেট্রিস্ট). You can pick who conducts each refraction examination.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingExaminerId(null);
                setNewExaminer({
                  name: '',
                  role: 'Optometrist',
                  qualification: '',
                  regNo: '',
                  consultationFee: 150,
                  phone: '',
                  active: true
                });
                setShowAddExaminerModal(true);
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              + Add Doctor / Optometrist
            </button>
          </div>

          {/* Quick Notice Banner */}
          <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-950">
              <span className="font-bold">Multi-Practitioner Vision Refraction System: </span>
              In this clinic, examinations can be done either by Ophthalmologist Doctors or Certified Optometrists. When printing prescription slips or scheduling visits, their official designation and degrees will automatically render on the slip.
            </div>
          </div>

          {/* Practitioners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examinersList.map(ex => {
              const isDoctor = ex.role === 'Ophthalmologist';
              const isOptom = ex.role === 'Optometrist';
              const isDefault = formData.defaultExaminer === ex.name;

              return (
                <div
                  key={ex.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    ex.active
                      ? isDoctor
                        ? 'bg-teal-50/30 border-teal-200 shadow-2xs'
                        : 'bg-blue-50/30 border-blue-200 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            isDoctor
                              ? 'bg-teal-100 text-teal-900 border border-teal-300'
                              : isOptom
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {ex.role}
                        </span>
                        {isDefault && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-slate-900 text-white">
                            Default
                          </span>
                        )}
                        {!ex.active && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-600">
                            Inactive
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-sm text-slate-950 mt-1.5">
                        {ex.name}
                      </h3>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-0.5">
                        {ex.qualification || 'Certified Vision Refractionist'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditExaminer(ex)}
                        className="p-1 text-slate-500 hover:text-teal-700 rounded-lg hover:bg-white"
                        title="Edit Practitioner"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExaminer(ex.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Reg Number:</span>
                      <strong className="text-slate-900 font-mono text-[11px]">{ex.regNo || 'N/A'}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Exam / Consult Fee:</span>
                      <strong className="text-emerald-700 font-bold">₹{ex.consultationFee}</strong>
                    </div>
                    {ex.phone && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Phone:</span>
                        <span className="text-slate-800 text-[11px]">{ex.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/40 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleExaminerStatus(ex.id)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${
                        ex.active
                          ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                      }`}
                    >
                      {ex.active ? 'Disable' : 'Enable'}
                    </button>

                    {!isDefault && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, defaultExaminer: ex.name });
                          showToast(`Set ${ex.name} as primary default examiner`);
                        }}
                        className="text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Examiners Directory
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PRESCRIPTION & PRINT SLIPS (প্রেসক্রিপশন ও স্লিপ সেটিংস)
         ========================================================================= */}
      {activeSubTab === 'rx-format' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Prescription (Rx) & Document Print Settings (প্রেসক্রিপশন ও স্লিপের লেখা)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize printed letterheads, optical warranty disclaimers, follow-up advice, and fast advice preset buttons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Rx Letterhead Top Header */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Prescription Top Letterhead Title (প্রেসক্রিপশনের ওপরের হেডার)
              </label>
              <input
                type="text"
                value={formData.rxHeader}
                onChange={e => setFormData({ ...formData, rxHeader: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="PAHARPUR EYE CARE CLINIC & ADVANCED OPTICAL VISION CENTER"
              />
            </div>

            {/* Rx Bottom Footer Note */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Prescription Footer Advice (প্রেসক্রিপশন ফুটার নোট ও নির্দেশিকা)
              </label>
              <textarea
                rows={3}
                value={formData.rxFooter}
                onChange={e => setFormData({ ...formData, rxFooter: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="Always bring this prescription slip during follow-up visits..."
              />
            </div>

            {/* Spectacle Order Footer Note */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Spectacle Order Job Card Note (চশমা অর্ডারের স্লিপের শর্তাবলী ও ওয়ারেন্টি)
              </label>
              <textarea
                rows={3}
                value={formData.orderFooterNote}
                onChange={e => setFormData({ ...formData, orderFooterNote: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="Please collect your spectacles with this original slip. Lens warranty covers..."
              />
            </div>

            {/* Cash Bill / Tax Invoice Footer */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Cash Bill & Tax Invoice Footer (ক্যাশ রসিদ ও ট্যাক্স ইনভয়েস ফুটার নোট)
              </label>
              <input
                type="text"
                value={formData.billFooterNote}
                onChange={e => setFormData({ ...formData, billFooterNote: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="Thank you for visiting Paharpur Eye Care. Goods once sold can be adjusted..."
              />
            </div>

            {/* Default Follow-up Days */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Default Follow-up Period (ডিফল্ট ফলো-আপ দিন)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.defaultFollowUpDays}
                  onChange={e => setFormData({ ...formData, defaultFollowUpDays: Number(e.target.value) || 15 })}
                  className="w-32 px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <span className="text-xs text-slate-600 font-semibold">Days (দিন পর)</span>
              </div>
            </div>

            {/* Default Lens Fitting Charges */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Default Lens Fitting Charge (চশমা ফিটিং চার্জ)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700">₹</span>
                <input
                  type="number"
                  value={formData.defaultLensFittingCharge}
                  onChange={e => setFormData({ ...formData, defaultLensFittingCharge: Number(e.target.value) || 0 })}
                  className="w-32 px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Rx Fast Advice Presets Manager */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  ⚡ 1-Click Fast Advice Presets (দ্রুত পরামর্শ বোতাম)
                </h3>
                <p className="text-xs text-slate-500">
                  These advice lines can be clicked in the Clinical Chamber to automatically add them to the patient prescription.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newAdviceText}
                onChange={e => setNewAdviceText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddAdvice()}
                placeholder="Type new advice snippet (e.g. Always wear sunglasses during sunny daylight)..."
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddAdvice}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                + Add Preset
              </button>
            </div>

            <div className="space-y-2">
              {advicePresets.map((advice, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <span className="text-slate-800 font-medium flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-900 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    {advice}
                  </span>
                  <button
                    onClick={() => handleDeleteAdvice(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Delete Preset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Prescription Format
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: GOOGLE SHEETS SYNC (গুগল শিট লাইভ সিঙ্ক)
         ========================================================================= */}
      {activeSubTab === 'sync' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Google Sheets Live Synchronization (গুগল শিট অটোমেটিক ব্যাকআপ)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sync all 12 operational ERP modules (Patients, Refraction Prescriptions, Spectacle Orders, Lens Stock, Frame Stock, Cash Bills, Ledger) automatically into your Google Spreadsheet.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-emerald-950 text-sm">
                    Status: {settings.googleSheetConnected ? 'Connected & Live Synchronized' : 'Ready to Connect'}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                    Live 2-Way Sync
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Last Synchronized: {settings.lastGoogleSheetSync ? new Date(settings.lastGoogleSheetSync).toLocaleString() : 'Just now'}
                </p>
              </div>
            </div>

            <button
              onClick={() => syncWithGoogleSheets()}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Sync Now (এখন সিঙ্ক করুন)
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Google Spreadsheet ID (গুগল শিট আইডি)
              </label>
              <input
                type="text"
                value={formData.googleSheetId}
                onChange={e => setFormData({ ...formData, googleSheetId: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="1PEC_Master_ERP_Sheet_2026_LiveSync"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Google Sheet Settings
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: BACKUP & AUDIT TRAIL (ডাটা ব্যাকআপ ও অডিট লগ)
         ========================================================================= */}
      {activeSubTab === 'backup' && (
        <div className="space-y-6">
          {/* Backup & Restore Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Export JSON Backup */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Export Full ERP Database Backup (সম্পূর্ণ ব্যাকআপ ডাউনলোড)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Save all patients, prescriptions, spectacle orders, frames, lenses, and cash books safely as a single JSON file.
                  </p>
                </div>
              </div>

              <button
                onClick={exportFullDatabase}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-teal-400" />
                Download JSON Backup File (.json)
              </button>
            </div>

            {/* Import JSON Restore */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Restore ERP Database from Backup (ব্যাকআপ রিস্টোর)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload a previously downloaded JSON backup file to restore all clinic records.
                  </p>
                </div>
              </div>

              <label className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-blue-200 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-blue-700" />
                Upload JSON Backup File
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = event => {
                        const content = event.target?.result as string;
                        if (content) {
                          importDatabaseBackup(content);
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Reset System to Factory Seed Data */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-sm text-rose-950">
                    Emergency Factory Reset (সিস্টেম রিসেট)
                  </h3>
                  <p className="text-xs text-rose-800">
                    Reverts database back to clean verified sample seed data with demo patients, refraction records, and inventory.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset the system to initial seed data? All custom records will be overwritten.')) {
                    resetToSeedData();
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
              >
                Reset to Seed Defaults
              </button>
            </div>
          </div>

          {/* Real-time Audit Trail Log Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  🔒 System Audit Trail & Event Logs (সকল কাজের হিসাব ও অডিট লগ)
                </h3>
                <p className="text-xs text-slate-500">
                  Track every appointment, refraction examination, order creation, payment receipt, and settings change.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {auditLogs.length} events logged
              </span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Time</th>
                    <th className="py-2 px-3">User & Role</th>
                    <th className="py-2 px-3">Module</th>
                    <th className="py-2 px-3">Action</th>
                    <th className="py-2 px-3">Record ID</th>
                    <th className="py-2 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.slice(0, 50).map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {log.user} ({log.role})
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {log.module}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-teal-800 text-[11px]">
                        {log.action}
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                        {log.recordId || '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-700 font-medium">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT EXAMINER (DOCTOR / OPTOMETRIST)
         ========================================================================= */}
      {showAddExaminerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Stethoscope className="w-5 h-5 text-teal-400" />
                <h3 className="font-extrabold text-sm">
                  {editingExaminerId ? 'Edit Examiner Profile' : 'Register New Eye Practitioner (ডাক্তার / অপ্টোমেট্রিস্ট যুক্ত করুন)'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddExaminerModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExaminer} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Practitioner Full Name (পুরো নাম) *
                </label>
                <input
                  type="text"
                  required
                  value={newExaminer.name}
                  onChange={e => setNewExaminer({ ...newExaminer, name: e.target.value })}
                  placeholder="e.g. Dr. R. N. Mukherjee"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-bold focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Role / Designation (পদবী) *
                  </label>
                  <select
                    value={newExaminer.role}
                    onChange={e => setNewExaminer({ ...newExaminer, role: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-bold focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Optometrist">Optometrist (অপ্টোমেট্রিস্ট)</option>
                    <option value="Ophthalmologist">Ophthalmologist (চক্ষু বিশেষজ্ঞ ডাক্তার)</option>
                    <option value="Refractionist">Refractionist (দৃষ্টি পরীক্ষক)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Consultation Fee (ফি - ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newExaminer.consultationFee}
                    onChange={e => setNewExaminer({ ...newExaminer, consultationFee: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-bold focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Degrees & Qualifications (ডিগ্রি ও যোগ্যতা)
                </label>
                <input
                  type="text"
                  value={newExaminer.qualification}
                  onChange={e => setNewExaminer({ ...newExaminer, qualification: e.target.value })}
                  placeholder="e.g. B.Optom, M.Optom, DOS, FIACLE / MBBS, MS"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Medical / Optom Reg No (রেজিস্ট্রেশন নং)
                  </label>
                  <input
                    type="text"
                    value={newExaminer.regNo}
                    onChange={e => setNewExaminer({ ...newExaminer, regNo: e.target.value })}
                    placeholder="e.g. OPT-WB/2018/89"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Phone / Contact Number
                  </label>
                  <input
                    type="text"
                    value={newExaminer.phone}
                    onChange={e => setNewExaminer({ ...newExaminer, phone: e.target.value })}
                    placeholder="+91 98302 98765"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExaminerModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md"
                >
                  {editingExaminerId ? 'Update Practitioner' : 'Save Practitioner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
