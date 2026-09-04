import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { ClinicExaminer, DoctorMaster, OptometristMaster, LoyaltySettings } from '../types';
import { DEFAULT_LOYALTY_SETTINGS } from '../data/loyaltyDefaults';
import { calculateMonetaryValue } from '../utils/loyaltyCalculator';
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
  ShieldAlert,
  DollarSign,
  MessageSquare,
  Printer,
  Check,
  Archive,
  Award,
  Sparkles,
  Percent,
  Sliders,
  Shield,
  ChevronRight,
  Gift,
  Clock,
  Cloud
} from 'lucide-react';
import { FirebaseMigrationDashboard } from './FirebaseMigrationDashboard';
import { UserManagementPage } from './UserManagementPage';
import { SecurityTestDashboard } from './SecurityTestDashboard';

export const ClinicSettingsPage: React.FC = () => {
  const {
    role,
    settings,
    updateSettings,
    updateLoyaltySettings,
    setActiveTab: setGlobalNavTab,
    exportFullDatabase,
    importDatabaseBackup,
    resetToSeedData,
    saveDoctor,
    deleteDoctor,
    archiveDoctor,
    restoreDoctor,
    toggleDoctorStatus,
    saveOptometrist,
    deleteOptometrist,
    toggleOptometristStatus,
    showToast
  } = useErp();

  const [activeTab, setActiveTab] = useState<'profile' | 'doctors' | 'fees' | 'print' | 'whatsapp' | 'loyalty' | 'backup' | 'firebase' | 'users' | 'security-dashboard'>('profile');

  // Form State for Loyalty & Rewards Settings
  const [loyaltyForm, setLoyaltyForm] = useState<LoyaltySettings>(
    settings.loyaltySettings || DEFAULT_LOYALTY_SETTINGS
  );
  const [isLoyaltyDirty, setIsLoyaltyDirty] = useState(false);

  // Form State for Clinic Profile
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
    doctorQualification: settings.doctorQualification || 'MBBS, MS (Ophthalmology), FICO (UK)',
    doctorRegNo: settings.doctorRegNo || 'WBMC/58421',
    doctorFee: settings.doctorFee ?? 100,
    optometristName: settings.optometristName || 'Dr. R. N. Mukherjee',
    optometristQualification: settings.optometristQualification || 'B.Optom, M.Optom, DOS, FIACLE',
    optometristRegNo: settings.optometristRegNo || 'OPT-WB/2018/89',
    optometristFee: settings.optometristFee ?? 50,
    defaultExaminer: settings.defaultExaminer || 'Dr. S. K. Banerjee',
    defaultLensFittingCharge: settings.defaultLensFittingCharge || 100,
    defaultFollowUpDays: settings.defaultFollowUpDays || 15,
    rxHeader: settings.rxHeader || 'PAHARPUR EYE CARE CLINIC & ADVANCED OPTICAL VISION CENTER',
    rxFooter: settings.rxFooter || 'Always bring this prescription slip during follow-up visits. Eye refraction check recommended every 12 months.',
    orderFooterNote: settings.orderFooterNote || 'Please collect your spectacles with this original slip. Lens warranty covers manufacturing defects for 1 year.',
    billFooterNote: settings.billFooterNote || 'Thank you for visiting Paharpur Eye Care. Goods once sold can be adjusted as per store optical warranty terms.',
    termsAndConditions: settings.termsAndConditions || '1. Advance is non-refundable once lens edging is initiated.\n2. Power verification valid for 30 days.\n3. Frame alignment and ultrasonic cleaning are complimentary.',
    currencySymbol: settings.currencySymbol || '₹',
    googleSheetId: settings.googleSheetId || ''
  });

  // Doctor Master Modal
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorMaster | null>(null);
  const [doctorForm, setDoctorForm] = useState<DoctorMaster>({
    id: '',
    name: '',
    designation: 'Senior Eye Surgeon',
    qualification: 'MBBS, MS (Ophthalmology)',
    registrationNo: '',
    consultationFee: 100,
    phone: '',
    whatsapp: '',
    address: '',
    joiningDate: '',
    notes: '',
    status: 'Active'
  });

  // Optometrist Master Modal
  const [showOptometristModal, setShowOptometristModal] = useState(false);
  const [editingOptometrist, setEditingOptometrist] = useState<OptometristMaster | null>(null);
  const [optometristForm, setOptometristForm] = useState<OptometristMaster>({
    id: '',
    name: '',
    designation: 'Consultant Optometrist',
    qualification: 'B.Optom, M.Optom',
    registrationNo: '',
    examinationFee: 50,
    phone: '',
    status: 'Active'
  });

  // Save Clinic Profile & Print format
  const handleSaveSettings = () => {
    updateSettings(formData);
    showToast('Clinic settings & print preferences saved successfully!');
  };

  // Doctor CRUD
  const handleOpenAddDoctor = () => {
    setEditingDoctor(null);
    setDoctorForm({
      id: `DOC-${Date.now().toString().slice(-4)}`,
      name: '',
      designation: 'Senior Eye Surgeon',
      qualification: 'MBBS, MS (Ophthalmology)',
      registrationNo: '',
      consultationFee: 100,
      phone: '',
      status: 'Active'
    });
    setShowDoctorModal(true);
  };

  const handleOpenEditDoctor = (doc: DoctorMaster) => {
    setEditingDoctor(doc);
    setDoctorForm({ ...doc });
    setShowDoctorModal(true);
  };

  const handleSaveDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorForm.name.trim()) {
      showToast('Please enter doctor name', 'error');
      return;
    }
    saveDoctor(doctorForm);
    setShowDoctorModal(false);
  };

  // Optometrist CRUD
  const handleOpenAddOptometrist = () => {
    setEditingOptometrist(null);
    setOptometristForm({
      id: `OPT-${Date.now().toString().slice(-4)}`,
      name: '',
      designation: 'Consultant Optometrist',
      qualification: 'B.Optom, M.Optom',
      registrationNo: '',
      examinationFee: 50,
      phone: '',
      status: 'Active'
    });
    setShowOptometristModal(true);
  };

  const handleOpenEditOptometrist = (opt: OptometristMaster) => {
    setEditingOptometrist(opt);
    setOptometristForm({ ...opt });
    setShowOptometristModal(true);
  };

  const handleSaveOptometristSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optometristForm.name.trim()) {
      showToast('Please enter optometrist name', 'error');
      return;
    }
    saveOptometrist(optometristForm);
    setShowOptometristModal(false);
  };

  const handleArchiveDoctor = (doc: DoctorMaster) => {
    const reason = prompt(`Reason for archiving Doctor ${doc.name} (${doc.id}):`, 'Inactive / Relocated');
    if (reason !== null) {
      archiveDoctor(doc.id, reason || 'Archived by Admin');
    }
  };

  const handleRestoreDoctor = (doc: DoctorMaster) => {
    if (window.confirm(`Restore Doctor ${doc.name} to Active list?`)) {
      restoreDoctor(doc.id);
    }
  };

  const handleDeleteDoctor = (doc: DoctorMaster) => {
    if (role !== 'Admin') {
      showToast('Admin permission required to delete Doctor Master', 'error');
      return;
    }
    const confirmText = prompt(
      `⚠️ ADMIN PERMANENT DELETE\nThis will permanently remove Doctor ${doc.name} (${doc.id}) from the system.\nType "DELETE" to confirm:`
    );
    if (confirmText === 'DELETE') {
      deleteDoctor(doc.id);
    } else if (confirmText !== null) {
      showToast('Deletion cancelled: text did not match DELETE', 'warning');
    }
  };

  const handleDeleteOptometrist = (opt: OptometristMaster) => {
    if (role !== 'Admin') {
      showToast('Admin permission required to delete Optometrist Master', 'error');
      return;
    }
    const confirmText = prompt(
      `⚠️ ADMIN PERMANENT DELETE\nThis will permanently remove Optometrist ${opt.name} (${opt.id}) from the system.\nType "DELETE" to confirm:`
    );
    if (confirmText === 'DELETE') {
      deleteOptometrist(opt.id);
    } else if (confirmText !== null) {
      showToast('Deletion cancelled: text did not match DELETE', 'warning');
    }
  };

  const doctorsList: DoctorMaster[] = settings.doctorsList || [];
  const optometristsList: OptometristMaster[] = settings.optometristsList || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 text-white rounded-xl">
            <Settings className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Clinic Settings & System Masters
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                (ক্লিনিক সেটিংস ও মাস্টার্স)
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Doctor Master, Optometrist Master, Fee Breakdown Rules, Print Slips & Backup Configurations
            </p>
          </div>
        </div>

        <button
          id="btn-save-clinic-settings-top"
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md transition-all hover:scale-105"
        >
          <Save className="w-4 h-4" />
          Save All Settings (সংরক্ষণ করুন)
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 bg-slate-200/70 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
        <button
          id="tab-clinic-profile"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-white text-teal-900 shadow-2xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          1. Clinic Profile & Header
        </button>

        <button
          id="tab-clinic-doctors"
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'doctors'
              ? 'bg-white text-teal-900 shadow-2xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          2. Doctor & Optometrist Masters
        </button>

        <button
          id="tab-clinic-fees"
          onClick={() => setActiveTab('fees')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'fees'
              ? 'bg-white text-teal-900 shadow-2xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          3. Fee Structure & Defaults
        </button>

        <button
          id="tab-clinic-print"
          onClick={() => setActiveTab('print')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'print'
              ? 'bg-white text-teal-900 shadow-2xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Printer className="w-4 h-4" />
          4. Print Layouts & Slips
        </button>

        <button
          id="tab-clinic-whatsapp"
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'whatsapp'
              ? 'bg-white text-teal-900 shadow-2xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          5. WhatsApp Templates
        </button>

        <button
          id="tab-clinic-loyalty"
          onClick={() => setActiveTab('loyalty')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'loyalty'
              ? 'bg-amber-500 text-white shadow-md font-black'
              : 'text-amber-800 hover:text-amber-950 bg-amber-50/70 hover:bg-amber-100/70 font-semibold'
          }`}
        >
          <Award className="w-4 h-4" />
          6. Loyalty & Rewards Settings
        </button>

        <button
          id="tab-clinic-backup"
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'backup'
              ? 'bg-white text-teal-900 shadow-2xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Database className="w-4 h-4" />
          7. Backup & Offline
        </button>

        <button
          id="tab-clinic-firebase"
          onClick={() => setActiveTab('firebase')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'firebase'
              ? 'bg-teal-700 text-white shadow-md font-black'
              : 'text-teal-800 hover:text-teal-950 bg-teal-50/80 hover:bg-teal-100 font-semibold'
          }`}
        >
          <Cloud className="w-4 h-4" />
          8. Firebase Cloud Database
        </button>

        <button
          id="tab-clinic-users"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-md font-black'
              : 'text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 font-semibold'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-teal-500" />
          9. User Roles & Permissions
        </button>

        <button
          id="tab-clinic-security-dashboard"
          onClick={() => setActiveTab('security-dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'security-dashboard'
              ? 'bg-rose-900 text-white shadow-md font-black'
              : 'text-rose-800 hover:text-rose-950 bg-rose-50/80 hover:bg-rose-100 font-semibold'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          10. Security & RBAC Test Dashboard
        </button>
      </div>

      {/* TAB 1: CLINIC PROFILE & HEADER */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              Clinic Organization Profile & Legal Identifiers
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              These details appear on printed Prescriptions, Spectacle Invoices, and Appointment Slips.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Clinic Name (প্রতিষ্ঠান / দোকানের নাম) *</label>
              <input
                type="text"
                value={formData.shopName}
                onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={e => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">Tagline / Subtitle</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">Full Clinic Address (ঠিকানা)</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Mobile / Helpline</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Helpline</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">GSTIN (জিএসটি নম্বর)</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Trade License / Reg No</label>
              <input
                type="text"
                value={formData.tradeLicenseNo}
                onChange={e => setFormData({ ...formData, tradeLicenseNo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">MRD Prefix</label>
              <input
                type="text"
                value={formData.mrdPrefix}
                onChange={e => setFormData({ ...formData, mrdPrefix: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR & OPTOMETRIST MASTERS */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          {/* Doctors Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Doctor Master (চক্ষু বিশেষজ্ঞ ডাক্তার তালিকা)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Manage Ophthalmologists, consultation fee schedules, qualifications and registration numbers
                </p>
              </div>
              <button
                id="btn-add-doctor"
                onClick={handleOpenAddDoctor}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                + Add Doctor
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Doctor Name</th>
                    <th className="py-2.5 px-3">Designation & Degree</th>
                    <th className="py-2.5 px-3">Reg No</th>
                    <th className="py-2.5 px-3">Consultation Fee</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctorsList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        No doctors added. Click "+ Add Doctor" above.
                      </td>
                    </tr>
                  ) : (
                    doctorsList.map(doc => (
                      <tr key={doc.id} className={`hover:bg-slate-50 ${doc.status === 'Archived' ? 'bg-slate-50/60 opacity-75' : ''}`}>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-600">{doc.id}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {doc.name}
                          {doc.status === 'Archived' && (
                            <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">Archived</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{doc.qualification || doc.designation}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{doc.registrationNo || '-'}</td>
                        <td className="py-2.5 px-3 font-black text-teal-800">₹{doc.consultationFee}</td>
                        <td className="py-2.5 px-3 text-slate-700">{doc.phone || '-'}</td>
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => toggleDoctorStatus(doc.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              doc.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : doc.status === 'Archived'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                            title="Click to toggle Active/Inactive"
                          >
                            {doc.status}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditDoctor(doc)}
                              className="p-1 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded transition-colors"
                              title="Edit Doctor"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {doc.status === 'Archived' ? (
                              <button
                                onClick={() => handleRestoreDoctor(doc)}
                                className="p-1 bg-slate-100 hover:bg-teal-50 text-teal-700 rounded transition-colors"
                                title="Restore Doctor"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleArchiveDoctor(doc)}
                                className="p-1 bg-slate-100 hover:bg-amber-50 text-amber-700 rounded transition-colors"
                                title="Archive Doctor"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteDoctor(doc)}
                              className="p-1 bg-slate-100 hover:bg-rose-50 text-rose-700 rounded transition-colors"
                              title="Delete Doctor (Admin Only)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Optometrists Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Glasses className="w-4 h-4 text-teal-600" />
                  Optometrist Master (অপ্টোমেট্রিস্ট ও রিফ্র্যাকশনিস্ট তালিকা)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Manage Optometrists, refractionists, examination fees, qualifications and registration details
                </p>
              </div>
              <button
                id="btn-add-optometrist"
                onClick={handleOpenAddOptometrist}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                + Add Optometrist
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Optometrist Name</th>
                    <th className="py-2.5 px-3">Designation & Degree</th>
                    <th className="py-2.5 px-3">Reg No</th>
                    <th className="py-2.5 px-3">Examination Fee</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {optometristsList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        No optometrists added. Click "+ Add Optometrist" above.
                      </td>
                    </tr>
                  ) : (
                    optometristsList.map(opt => (
                      <tr key={opt.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-600">{opt.id}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{opt.name}</td>
                        <td className="py-2.5 px-3 text-slate-700">{opt.qualification || opt.designation}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{opt.registrationNo || '-'}</td>
                        <td className="py-2.5 px-3 font-black text-teal-800">₹{opt.examinationFee}</td>
                        <td className="py-2.5 px-3 text-slate-700">{opt.phone || '-'}</td>
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => toggleOptometristStatus(opt.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              opt.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                            title="Click to toggle Active/Inactive"
                          >
                            {opt.status}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditOptometrist(opt)}
                              className="p-1 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded transition-colors"
                              title="Edit Optometrist"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteOptometrist(opt)}
                              className="p-1 bg-slate-100 hover:bg-rose-50 text-rose-700 rounded transition-colors"
                              title="Delete Optometrist (Admin Only)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEE STRUCTURE & DEFAULTS */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-600" />
              Default Clinical Fee Structure & Rules
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Configure default Doctor Fee, Optometrist Fee, and auto-total professional calculation rules
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200 space-y-2">
              <label className="block font-bold text-slate-800">
                Default Doctor Consultation Fee (ডাক্তার ফি - ₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.doctorFee}
                onChange={e => setFormData({ ...formData, doctorFee: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl font-black text-slate-900 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500">
                Standard charge for Senior Eye Surgeon / Consultant (e.g. ₹100 or ₹0).
              </p>
            </div>

            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200 space-y-2">
              <label className="block font-bold text-slate-800">
                Default Optometrist Fee (অপ্টোমেট্রিস্ট ফি - ₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.optometristFee}
                onChange={e => setFormData({ ...formData, optometristFee: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl font-black text-slate-900 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500">
                Standard charge for Refraction / Vision exam (e.g. ₹50 or ₹0).
              </p>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2">
              <label className="block font-bold text-emerald-950">
                Total Combined Professional Fee (মোট ফি - ₹)
              </label>
              <div className="px-3 py-2 bg-white border border-emerald-300 rounded-xl font-black text-emerald-900 text-lg">
                ₹{(Number(formData.doctorFee) || 0) + (Number(formData.optometristFee) || 0)}
              </div>
              <p className="text-[11px] text-emerald-800 font-semibold">
                Auto-calculated: Doctor Fee (₹{formData.doctorFee}) + Optometrist Fee (₹{formData.optometristFee})
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Default Lens Fitting / Edging Charge (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.defaultLensFittingCharge}
                onChange={e => setFormData({ ...formData, defaultLensFittingCharge: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Standard Follow-Up Validity (দিন)
              </label>
              <input
                type="number"
                min="1"
                value={formData.defaultFollowUpDays}
                onChange={e => setFormData({ ...formData, defaultFollowUpDays: Number(e.target.value) || 15 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRINT LAYOUTS & SLIPS */}
      {activeTab === 'print' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Printer className="w-4 h-4 text-teal-600" />
              Print Formats, Rx Header/Footer & Terms
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Customize headers, footers, optical terms, and warranty disclaimers on all printed slips
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Prescription Slip Header Title</label>
              <input
                type="text"
                value={formData.rxHeader}
                onChange={e => setFormData({ ...formData, rxHeader: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Prescription Slip Footer Note / Follow-up Advice</label>
              <textarea
                rows={2}
                value={formData.rxFooter}
                onChange={e => setFormData({ ...formData, rxFooter: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Spectacle Order Job Slip Footer Note</label>
              <textarea
                rows={2}
                value={formData.orderFooterNote}
                onChange={e => setFormData({ ...formData, orderFooterNote: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Retail Money Receipt & Bill Footer</label>
              <textarea
                rows={2}
                value={formData.billFooterNote}
                onChange={e => setFormData({ ...formData, billFooterNote: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Warranty Terms & Conditions (শর্তাবলী)</label>
              <textarea
                rows={3}
                value={formData.termsAndConditions}
                onChange={e => setFormData({ ...formData, termsAndConditions: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WHATSAPP TEMPLATES */}
      {activeTab === 'whatsapp' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Automated WhatsApp Notification Templates
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Pre-configured Bengali & English message formats for Appointment booking, Spectacle readiness, and Follow-ups
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
              <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                <span>📅 1. Appointment Confirmation Template</span>
              </h4>
              <div className="p-3 bg-white rounded-lg border border-emerald-100 text-slate-700 font-mono text-[11px] whitespace-pre-wrap">
{`নমস্কার {Patient_Name},
Paharpur Eye Care এ আপনার চক্ষু পরীক্ষার অ্যাপয়েন্টমেন্ট বুকিং নিশ্চিত হয়েছে।
📅 তারিখ: {Date}
⏰ সময়: {Time}
👨‍⚕️ ডাক্তার: {Doctor_Name}
💰 ফি: ₹{Total_Fee}
🏥 পাহাডপুর মেইন রোড।`}
              </div>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
              <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                <span>👓 2. Spectacle Order Ready Template</span>
              </h4>
              <div className="p-3 bg-white rounded-lg border border-emerald-100 text-slate-700 font-mono text-[11px] whitespace-pre-wrap">
{`নমস্কার {Customer_Name},
আপনার চশমা রেডি হয়ে গেছে (Order: {Order_ID})।
দয়া করে অরিজিনাল স্লিপ এনে চশমাটি সংগ্রহ করুন।
বাকি টাকা: ₹{Due_Amount}
Paharpur Eye Care`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: BACKUP & GOOGLE SHEETS SYNC */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-600" />
              Full Database Backup, JSON Restore & Factory Reset
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Export comprehensive snapshot of patients, prescriptions, orders, inventory, and ledger
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Download className="w-4 h-4 text-teal-600" />
                Export Offline Backup (JSON)
              </h4>
              <p className="text-xs text-slate-500">
                Download full ERP dataset in JSON format for offline record keeping or transfer to another PC.
              </p>
              <button
                onClick={exportFullDatabase}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Full ERP Backup (.json)
              </button>
            </div>

            {/* Import */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                Restore from Backup (JSON)
              </h4>
              <p className="text-xs text-slate-500">
                Restore previously saved JSON file to overwrite local state safely.
              </p>
              <label className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Select & Restore Backup File
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = evt => {
                        try {
                          const json = JSON.parse(evt.target?.result as string);
                          importDatabaseBackup(json);
                        } catch (err) {
                          alert('Invalid JSON file format.');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Factory Reset */}
          <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h4 className="font-bold text-rose-950 text-sm">Emergency System Reset (ফ্যাক্টরি রিসেট)</h4>
                <p className="text-xs text-rose-800">
                  Revert ERP state to clean verified seed data with default doctor, optometrist, and stock.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset the system to initial seed defaults? Custom entries will be overwritten.')) {
                  resetToSeedData();
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 8: FIREBASE CLOUD DATABASE & LIVE REALTIME PERSISTENCE
         ========================================================================= */}
      {activeTab === 'firebase' && (
        <FirebaseMigrationDashboard />
      )}

      {/* =========================================================================
          TAB 9: USER MANAGEMENT & ROLE-BASED PERMISSIONS
         ========================================================================= */}
      {activeTab === 'users' && (
        <UserManagementPage />
      )}

      {/* =========================================================================
          TAB 10: SECURITY & RBAC TEST DASHBOARD (TDD VULNERABILITY VALIDATION)
         ========================================================================= */}
      {activeTab === 'security-dashboard' && (
        <SecurityTestDashboard />
      )}

      {/* =========================================================================
          TAB 6: LOYALTY & REWARDS SETTINGS (সম্পূর্ণ কাস্টমাইজযোগ্য লয়্যালটি রুলস)
         ========================================================================= */}
      {activeTab === 'loyalty' && (
        <div className="space-y-6">
          {/* Header Banner & Save Action */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                  <Award className="w-6 h-6 text-amber-200" />
                </span>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    Loyalty & Rewards Master Settings (লয়্যালটি ও রিওয়ার্ডস রুলস)
                  </h3>
                  <p className="text-xs text-amber-100 font-medium">
                    Fully editable business rules. Future changes take effect immediately without altering historical transaction ledgers.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                type="button"
                onClick={() => setGlobalNavTab('loyalty')}
                className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
              >
                <span>View Full Loyalty Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  updateLoyaltySettings(loyaltyForm);
                  setIsLoyaltyDirty(false);
                }}
                className="px-5 py-2.5 bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-700" />
                Save Loyalty Rules
              </button>
            </div>
          </div>

          {/* Master Program Toggle & Earning Basis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Program Status */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  1. Program Status
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  loyaltyForm.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {loyaltyForm.enabled ? 'Active (ON)' : 'Disabled (OFF)'}
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                When active, eligible optical purchases calculate and accumulate customer points.
              </p>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={loyaltyForm.enabled}
                    onChange={e => {
                      setLoyaltyForm(prev => ({ ...prev, enabled: e.target.checked }));
                      setIsLoyaltyDirty(true);
                    }}
                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                  />
                  <span className="font-extrabold text-sm text-slate-800">
                    Enable Loyalty & Rewards Program
                  </span>
                </label>
              </div>
            </div>

            {/* 2. Earning Ratio */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <span className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Percent className="w-4 h-4 text-teal-600" />
                2. Points Earning Ratio
              </span>
              <p className="text-xs text-slate-500">
                Configure how many rupees spent yields points.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Spend Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min={1}
                      value={loyaltyForm.spendAmount}
                      onChange={e => {
                        setLoyaltyForm(prev => ({ ...prev, spendAmount: Math.max(1, Number(e.target.value)) }));
                        setIsLoyaltyDirty(true);
                      }}
                      className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Points Earned</label>
                  <input
                    type="number"
                    min={0.1}
                    step="0.1"
                    value={loyaltyForm.pointsEarned}
                    onChange={e => {
                      setLoyaltyForm(prev => ({ ...prev, pointsEarned: Math.max(0.1, Number(e.target.value)) }));
                      setIsLoyaltyDirty(true);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="text-[11px] bg-amber-50 text-amber-900 p-2 rounded-xl border border-amber-200 font-medium">
                Rule: <strong>₹{loyaltyForm.spendAmount} spend = {loyaltyForm.pointsEarned} pt</strong> ({((loyaltyForm.pointsEarned / loyaltyForm.spendAmount) * 100).toFixed(1)}% rate)
              </div>
            </div>

            {/* 3. Point Monetary Value */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <span className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                3. Point Monetary Value
              </span>
              <p className="text-xs text-slate-500">
                Monetary discount value when customer redeems points.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Points Count</label>
                  <input
                    type="number"
                    min={1}
                    value={loyaltyForm.pointsForValue}
                    onChange={e => {
                      setLoyaltyForm(prev => ({ ...prev, pointsForValue: Math.max(1, Number(e.target.value)) }));
                      setIsLoyaltyDirty(true);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Rupees Worth (₹)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min={1}
                      value={loyaltyForm.valueInRupees}
                      onChange={e => {
                        setLoyaltyForm(prev => ({ ...prev, valueInRupees: Math.max(1, Number(e.target.value)) }));
                        setIsLoyaltyDirty(true);
                      }}
                      className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="text-[11px] bg-emerald-50 text-emerald-900 p-2 rounded-xl border border-emerald-200 font-medium">
                Value: <strong>{loyaltyForm.pointsForValue} pts = ₹{loyaltyForm.valueInRupees}</strong> (1 pt = ₹{(loyaltyForm.valueInRupees / loyaltyForm.pointsForValue).toFixed(2)})
              </div>
            </div>
          </div>

          {/* Calculation Basis & Rounding Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Calculation Basis */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <span className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                4. Point Calculation Basis
              </span>
              <p className="text-xs text-slate-500">
                Choose which amount from the invoice is used to calculate loyalty points earned.
              </p>

              <div className="space-y-2 pt-1">
                {[
                  { id: 'Net Amount (After Discount)', label: 'Net Amount (After Discount)', desc: 'Recommended: Subtotal minus discounts given' },
                  { id: 'Net Paid Amount', label: 'Paid Amount (Advance / Collection)', desc: 'Only awards points on actual money collected' },
                  { id: 'Gross Amount', label: 'Gross / Subtotal Amount', desc: 'Awards points on pre-discount product prices' }
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      loyaltyForm.calculationBasis === opt.id
                        ? 'bg-amber-50/60 border-amber-300 text-amber-950 font-bold'
                        : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="calculationBasis"
                      checked={loyaltyForm.calculationBasis === opt.id}
                      onChange={() => {
                        setLoyaltyForm(prev => ({ ...prev, calculationBasis: opt.id as any }));
                        setIsLoyaltyDirty(true);
                      }}
                      className="mt-0.5 accent-amber-600 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Decimal / Rounding Rule */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <span className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                5. Decimal & Rounding Rule
              </span>
              <p className="text-xs text-slate-500">
                Control how fractional point calculations are resolved.
              </p>

              <div className="space-y-2 pt-1">
                {[
                  { id: 'Round Down', label: 'Round Down (Floor)', desc: 'Default: e.g. ₹250 at ₹100=1pt gives 2 points' },
                  { id: 'Round Up', label: 'Round Up (Ceil)', desc: 'Generous: e.g. ₹250 at ₹100=1pt gives 3 points' },
                  { id: 'Nearest Integer', label: 'Nearest Integer (Math.round)', desc: 'e.g. 2.4 becomes 2, 2.5 becomes 3' },
                  { id: 'Allow Decimal Points', label: 'Allow Decimal Points', desc: 'Exact: preserves fractional points like 2.50 pts' }
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      loyaltyForm.roundingRule === opt.id
                        ? 'bg-amber-50/60 border-amber-300 text-amber-950 font-bold'
                        : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="roundingRule"
                      checked={loyaltyForm.roundingRule === opt.id}
                      onChange={() => {
                        setLoyaltyForm(prev => ({ ...prev, roundingRule: opt.id as any }));
                        setIsLoyaltyDirty(true);
                      }}
                      className="mt-0.5 accent-amber-600 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Redemption Limits & Safety Caps */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <span className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              6. Minimum & Maximum Redemption Limits
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Minimum Points Required to Redeem
                </label>
                <input
                  type="number"
                  min={0}
                  value={loyaltyForm.minRedemptionPoints}
                  onChange={e => {
                    setLoyaltyForm(prev => ({ ...prev, minRedemptionPoints: Math.max(0, Number(e.target.value)) }));
                    setIsLoyaltyDirty(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Customer must accumulate at least this balance before redeeming.
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Maximum Redemption Cap Type
                </label>
                <select
                  value={loyaltyForm.maxRedemptionType}
                  onChange={e => {
                    setLoyaltyForm(prev => ({ ...prev, maxRedemptionType: e.target.value as any }));
                    setIsLoyaltyDirty(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs"
                >
                  <option value="Percentage of Invoice">Percentage of Invoice Total (%)</option>
                  <option value="Fixed Amount">Fixed Max Amount (₹)</option>
                  <option value="Fixed Points">Fixed Max Points</option>
                  <option value="No Limit">No Limit (Full Bill Allowed)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Prevents 100% free bills while ensuring customer satisfaction.
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Cap Value ({loyaltyForm.maxRedemptionType === 'Percentage of Invoice' ? '%' : loyaltyForm.maxRedemptionType === 'Fixed Amount' ? '₹' : 'pts'})
                </label>
                <input
                  type="number"
                  min={0}
                  disabled={loyaltyForm.maxRedemptionType === 'No Limit'}
                  value={loyaltyForm.maxRedemptionValue}
                  onChange={e => {
                    setLoyaltyForm(prev => ({ ...prev, maxRedemptionValue: Math.max(0, Number(e.target.value)) }));
                    setIsLoyaltyDirty(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-xs disabled:opacity-50"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  e.g. 20% on ₹1,000 order allows max ₹200 loyalty reward discount.
                </span>
              </div>
            </div>
          </div>

          {/* Product Category Multipliers & Eligibility */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <span className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Glasses className="w-4 h-4 text-purple-600" />
              7. Category-Wise Point Earning & Custom Multipliers
            </span>
            <p className="text-xs text-slate-500">
              Customize which product categories earn loyalty points, and specify bonus multipliers (e.g. 1.5x on high-margin lenses).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {[
                { key: 'frames', label: 'Frames (ফ্রেম)' },
                { key: 'lenses', label: 'Lenses (লেন্স)' },
                { key: 'spectacles', label: 'Complete Spectacles (চশমা)' },
                { key: 'accessories', label: 'Optical Accessories' },
                { key: 'medicines', label: 'Medicines & Drops' },
                { key: 'otherProducts', label: 'Other Products' },
                { key: 'doctorFee', label: 'Doctor Fee (পরামর্শ ফি)' },
                { key: 'optometristFee', label: 'Optometrist Fee' }
              ].map(cat => {
                const catConfig = loyaltyForm.categories?.[cat.key as keyof typeof loyaltyForm.categories] || { eligible: true, multiplier: 1.0 };
                return (
                  <div
                    key={cat.key}
                    className={`p-3.5 rounded-xl border transition-all ${
                      catConfig.eligible ? 'bg-slate-50 border-slate-200' : 'bg-rose-50/40 border-rose-200 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold text-xs text-slate-800 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={catConfig.eligible}
                          onChange={e => {
                            setLoyaltyForm(prev => ({
                              ...prev,
                              categories: {
                                ...prev.categories,
                                [cat.key]: { ...catConfig, eligible: e.target.checked }
                              }
                            }));
                            setIsLoyaltyDirty(true);
                          }}
                          className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                        />
                        {cat.label}
                      </label>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className="text-slate-500 font-medium">Multiplier:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.25"
                          min={0}
                          disabled={!catConfig.eligible}
                          value={catConfig.multiplier}
                          onChange={e => {
                            setLoyaltyForm(prev => ({
                              ...prev,
                              categories: {
                                ...prev.categories,
                                [cat.key]: { ...catConfig, multiplier: Number(e.target.value) }
                              }
                            }));
                            setIsLoyaltyDirty(true);
                          }}
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-center text-xs disabled:opacity-50"
                        />
                        <span className="font-bold text-slate-500">x</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bonus Points Config */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <span className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Gift className="w-4 h-4 text-pink-600" />
              8. Bonus Points & Triggers (Birthday, Anniversary, Referral)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Birthday */}
              <div className="p-4 bg-pink-50/50 rounded-xl border border-pink-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-pink-950 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loyaltyForm.birthdayBonusEnabled}
                      onChange={e => {
                        setLoyaltyForm(prev => ({ ...prev, birthdayBonusEnabled: e.target.checked }));
                        setIsLoyaltyDirty(true);
                      }}
                      className="accent-pink-600"
                    />
                    Birthday Bonus Points
                  </label>
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 block mb-0.5">Bonus Points to Award</label>
                  <input
                    type="number"
                    min={0}
                    value={loyaltyForm.birthdayBonusPoints}
                    onChange={e => {
                      setLoyaltyForm(prev => ({ ...prev, birthdayBonusPoints: Math.max(0, Number(e.target.value)) }));
                      setIsLoyaltyDirty(true);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-pink-200 rounded-lg font-mono font-bold text-xs"
                  />
                </div>
              </div>

              {/* Anniversary */}
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-purple-950 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loyaltyForm.anniversaryBonusEnabled}
                      onChange={e => {
                        setLoyaltyForm(prev => ({ ...prev, anniversaryBonusEnabled: e.target.checked }));
                        setIsLoyaltyDirty(true);
                      }}
                      className="accent-purple-600"
                    />
                    Anniversary Bonus Points
                  </label>
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 block mb-0.5">Bonus Points to Award</label>
                  <input
                    type="number"
                    min={0}
                    value={loyaltyForm.anniversaryBonusPoints}
                    onChange={e => {
                      setLoyaltyForm(prev => ({ ...prev, anniversaryBonusPoints: Math.max(0, Number(e.target.value)) }));
                      setIsLoyaltyDirty(true);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg font-mono font-bold text-xs"
                  />
                </div>
              </div>

              {/* Referral */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-emerald-950 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loyaltyForm.referralBonusEnabled}
                      onChange={e => {
                        setLoyaltyForm(prev => ({ ...prev, referralBonusEnabled: e.target.checked }));
                        setIsLoyaltyDirty(true);
                      }}
                      className="accent-emerald-600"
                    />
                    Referral Program Bonus
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">Referrer (pts)</label>
                    <input
                      type="number"
                      min={0}
                      value={loyaltyForm.referrerBonusPoints}
                      onChange={e => {
                        setLoyaltyForm(prev => ({ ...prev, referrerBonusPoints: Math.max(0, Number(e.target.value)) }));
                        setIsLoyaltyDirty(true);
                      }}
                      className="w-full px-2 py-1 bg-white border border-emerald-200 rounded-lg font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">New Customer</label>
                    <input
                      type="number"
                      min={0}
                      value={loyaltyForm.newCustomerBonusPoints}
                      onChange={e => {
                        setLoyaltyForm(prev => ({ ...prev, newCustomerBonusPoints: Math.max(0, Number(e.target.value)) }));
                        setIsLoyaltyDirty(true);
                      }}
                      className="w-full px-2 py-1 bg-white border border-emerald-200 rounded-lg font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expiry & WhatsApp Notification Rules */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <span className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              9. Point Expiry & Expiry Warning WhatsApp Notification
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 font-bold text-xs text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loyaltyForm.expiryEnabled}
                    onChange={e => {
                      setLoyaltyForm(prev => ({ ...prev, expiryEnabled: e.target.checked }));
                      setIsLoyaltyDirty(true);
                    }}
                    className="w-4 h-4 accent-amber-600"
                  />
                  Enable Point Expiry
                </label>
                <p className="text-[11px] text-slate-500">
                  When enabled, unredeemed points expire after configured validity period.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Point Validity Duration (Days)
                </label>
                <select
                  value={loyaltyForm.expiryDays}
                  onChange={e => {
                    setLoyaltyForm(prev => ({ ...prev, expiryDays: Number(e.target.value) }));
                    setIsLoyaltyDirty(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs"
                >
                  <option value={30}>30 Days (1 Month)</option>
                  <option value={90}>90 Days (3 Months)</option>
                  <option value={180}>180 Days (6 Months)</option>
                  <option value={365}>365 Days (1 Year - Default)</option>
                  <option value={730}>730 Days (2 Years)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Send Warning Alert (Days Before Expiry)
                </label>
                <select
                  value={loyaltyForm.notifyBeforeDays}
                  onChange={e => {
                    setLoyaltyForm(prev => ({ ...prev, notifyBeforeDays: Number(e.target.value) }));
                    setIsLoyaltyDirty(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs"
                >
                  <option value={7}>7 Days Before</option>
                  <option value={15}>15 Days Before (Recommended)</option>
                  <option value={30}>30 Days Before</option>
                </select>
              </div>
            </div>

            {/* Template Bengali */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Bengali WhatsApp Expiry Alert Template (বাংলা নোটিফিকেশন টেমপ্লেট)
              </label>
              <textarea
                rows={2}
                value={loyaltyForm.warningTemplateBengali}
                onChange={e => {
                  setLoyaltyForm(prev => ({ ...prev, warningTemplateBengali: e.target.value }));
                  setIsLoyaltyDirty(true);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
              />
              <span className="text-[10px] text-slate-400">
                Variables supported: {'{{customerName}}'}, {'{{expiringPoints}}'}, {'{{expiringRupees}}'}, {'{{expiryDate}}'}
              </span>
            </div>
          </div>

          {/* Bottom Save & Action Bar */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Safety Rule Verified: Changes strictly govern future sales. Historical transaction ledger remains protected.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all Loyalty System rules back to default configuration (₹100 = 1 pt, 100 pts = ₹50, 20% max cap)?')) {
                    setLoyaltyForm(DEFAULT_LOYALTY_SETTINGS);
                    setIsLoyaltyDirty(true);
                    showToast('Rules reset to initial defaults. Click Save Rules to apply.', 'info');
                  }
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Reset to Defaults
              </button>

              <button
                type="button"
                onClick={() => {
                  updateLoyaltySettings(loyaltyForm);
                  setIsLoyaltyDirty(false);
                }}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save & Apply Loyalty Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT DOCTOR
         ========================================================================= */}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-400" />
                <h3 className="font-extrabold text-sm">
                  {editingDoctor ? 'Edit Doctor Profile' : 'Add New Doctor (চক্ষু বিশেষজ্ঞ ডাক্তার)'}
                </h3>
              </div>
              <button onClick={() => setShowDoctorModal(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDoctorSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Doctor Full Name (পুরো নাম) *</label>
                <input
                  type="text"
                  required
                  value={doctorForm.name}
                  onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  placeholder="e.g. Dr. S. K. Banerjee"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Designation</label>
                  <input
                    type="text"
                    value={doctorForm.designation}
                    onChange={e => setDoctorForm({ ...doctorForm, designation: e.target.value })}
                    placeholder="e.g. Senior Eye Surgeon"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Consultation Fee (ফি - ₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={doctorForm.consultationFee}
                    onChange={e => setDoctorForm({ ...doctorForm, consultationFee: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Degrees & Qualifications</label>
                <input
                  type="text"
                  value={doctorForm.qualification}
                  onChange={e => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                  placeholder="e.g. MBBS, MS (Ophthalmology), FICO (UK)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Registration No (রেজি নং)</label>
                  <input
                    type="text"
                    value={doctorForm.registrationNo}
                    onChange={e => setDoctorForm({ ...doctorForm, registrationNo: e.target.value })}
                    placeholder="e.g. WBMC/58421"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Phone / Mobile</label>
                  <input
                    type="text"
                    value={doctorForm.phone}
                    onChange={e => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                    placeholder="+91 98301 23456"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={doctorForm.whatsapp || ''}
                    onChange={e => setDoctorForm({ ...doctorForm, whatsapp: e.target.value })}
                    placeholder="+91 98301 23456"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Status</label>
                  <select
                    value={doctorForm.status}
                    onChange={e => setDoctorForm({ ...doctorForm, status: e.target.value as 'Active' | 'Inactive' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Active">Active (সক্রিয়)</option>
                    <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Clinic / Chamber Address</label>
                <input
                  type="text"
                  value={doctorForm.address || ''}
                  onChange={e => setDoctorForm({ ...doctorForm, address: e.target.value })}
                  placeholder="Chamber or residential address"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Clinical Notes / Specialization</label>
                <textarea
                  rows={2}
                  value={doctorForm.notes || ''}
                  onChange={e => setDoctorForm({ ...doctorForm, notes: e.target.value })}
                  placeholder="Specialization, visiting hours, or extra instructions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md"
                >
                  {editingDoctor ? 'Update Doctor' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT OPTOMETRIST
         ========================================================================= */}
      {showOptometristModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Glasses className="w-5 h-5 text-teal-400" />
                <h3 className="font-extrabold text-sm">
                  {editingOptometrist ? 'Edit Optometrist Profile' : 'Add New Optometrist (অপ্টোমেট্রিস্ট)'}
                </h3>
              </div>
              <button onClick={() => setShowOptometristModal(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOptometristSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Optometrist Full Name (পুরো নাম) *</label>
                <input
                  type="text"
                  required
                  value={optometristForm.name}
                  onChange={e => setOptometristForm({ ...optometristForm, name: e.target.value })}
                  placeholder="e.g. Dr. R. N. Mukherjee"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Designation</label>
                  <input
                    type="text"
                    value={optometristForm.designation}
                    onChange={e => setOptometristForm({ ...optometristForm, designation: e.target.value })}
                    placeholder="e.g. Consultant Optometrist"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Examination Fee (ফি - ₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={optometristForm.examinationFee}
                    onChange={e => setOptometristForm({ ...optometristForm, examinationFee: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Degrees & Qualifications</label>
                <input
                  type="text"
                  value={optometristForm.qualification}
                  onChange={e => setOptometristForm({ ...optometristForm, qualification: e.target.value })}
                  placeholder="e.g. B.Optom, M.Optom, DOS, FIACLE"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Registration No (রেজি নং)</label>
                  <input
                    type="text"
                    value={optometristForm.registrationNo}
                    onChange={e => setOptometristForm({ ...optometristForm, registrationNo: e.target.value })}
                    placeholder="e.g. OPT-WB/2018/89"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Phone / Mobile</label>
                  <input
                    type="text"
                    value={optometristForm.phone}
                    onChange={e => setOptometristForm({ ...optometristForm, phone: e.target.value })}
                    placeholder="+91 98302 98765"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOptometristModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md"
                >
                  {editingOptometrist ? 'Update Optometrist' : 'Save Optometrist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
