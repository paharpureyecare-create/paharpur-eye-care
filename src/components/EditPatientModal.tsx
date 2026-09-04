import React, { useState, useEffect } from 'react';
import { useErp } from '../context/ErpContext';
import { Patient, Gender } from '../types';
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  Save,
  AlertCircle,
  Activity,
  CheckCircle2,
  Lock,
  Tag,
  Briefcase
} from 'lucide-react';

interface EditPatientModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
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

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  patient,
  isOpen,
  onClose
}) => {
  const { updatePatient } = useErp();

  if (!isOpen || !patient) return null;

  const [name, setName] = useState(patient.name || '');
  const [age, setAge] = useState<number | ''>(patient.age || 35);
  const [dob, setDob] = useState(patient.dob || '');
  const [gender, setGender] = useState<Gender>(patient.gender || 'Male');
  const [mobile, setMobile] = useState(patient.mobile || '');
  const [whatsapp, setWhatsapp] = useState(patient.whatsapp || patient.mobile || '');
  
  const [village, setVillage] = useState(patient.village || '');
  const [address, setAddress] = useState(patient.address || '');
  const [postOffice, setPostOffice] = useState(patient.postOffice || '');
  const [policeStation, setPoliceStation] = useState(patient.policeStation || '');
  const [district, setDistrict] = useState(patient.district || 'South 24 Parganas');
  const [occupation, setOccupation] = useState(patient.occupation || '');
  const [referredBy, setReferredBy] = useState(patient.referredBy || 'Self Walk-in');
  const [status, setStatus] = useState(patient.status || 'Active');

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(() => {
    return patient.chiefComplaints ? [patient.chiefComplaints] : [];
  });
  const [customComplaint, setCustomComplaint] = useState('');
  const [medicalHistory, setMedicalHistory] = useState<string[]>(patient.medicalHistory || []);
  const [notes, setNotes] = useState(patient.notes || '');

  // DOB <-> Age calculations
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

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    setAge(val);
    if (typeof val === 'number' && val > 0 && val <= 120 && !dob) {
      const estimatedYear = new Date().getFullYear() - val;
      setDob(`${estimatedYear}-01-01`);
    }
  };

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const toggleMedicalHistory = (med: string) => {
    setMedicalHistory(prev =>
      prev.includes(med) ? prev.filter(m => m !== med) : [...prev, med]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const complaintsList = [...selectedSymptoms];
    if (customComplaint.trim() && !complaintsList.includes(customComplaint.trim())) {
      complaintsList.push(customComplaint.trim());
    }

    const updatedPatient: Patient = {
      ...patient,
      name: name.trim(),
      age: typeof age === 'number' ? age : (Number(age) || 35),
      dob: dob || undefined,
      gender,
      mobile: mobile.trim(),
      whatsapp: whatsapp.trim() || mobile.trim(),
      village: village.trim(),
      address: address.trim() || village.trim(),
      postOffice: postOffice.trim(),
      policeStation: policeStation.trim(),
      district: district.trim(),
      occupation: occupation.trim(),
      referredBy: referredBy.trim(),
      status: status as any,
      chiefComplaints: complaintsList.join(', '),
      medicalHistory,
      notes: notes.trim()
    };

    updatePatient(updatedPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-xl border border-teal-500/40">
              <User className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">
                  Edit Patient Profile: {patient.name}
                </h3>
                <span className="bg-teal-500/20 text-teal-300 text-xs px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1 border border-teal-500/30">
                  <Lock className="w-3 h-3" /> MRD: {patient.mrd} (Permanent)
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Update demographics, address, and medical background while preserving all clinical and purchase records
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Section 1: Demographics & Identity */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold">
                <User className="w-4 h-4 text-teal-600" />
                <span>1. PERSONAL IDENTITY & CONTACT (রোগীর ব্যক্তিগত তথ্য ও মোবাইল)</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Reg Date: {patient.registrationDate}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Patient Full Name (রোগীর পুরো নাম) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Primary Mobile Number (মোবাইল নম্বর) *
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  WhatsApp Number (হোয়াটসঅ্যাপ)
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age (বয়স)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={handleAgeChange}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender (লিঙ্গ)</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as Gender)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Male">Male (পুরুষ)</option>
                    <option value="Female">Female (মহিলা)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Birth (জন্মতারিখ)</label>
                <input
                  type="date"
                  value={dob}
                  onChange={handleDobChange}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Regular">Regular</option>
                  <option value="New Patient">New Patient</option>
                  <option value="Follow-up Patient">Follow-up Patient</option>
                  <option value="Active">Active</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Address & Geographic Location */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold pb-2 border-b border-slate-200">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>2. ADDRESS & RESIDENCE (ঠিকানা ও ভৌগলিক অবস্থান)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Village / Para (গ্রাম / এলাকা)</label>
                <input
                  type="text"
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  placeholder="e.g. Paharpur, Durgapur"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Full Street Address / Landmark</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Near Bus Stand, Paharpur Main Road"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Post Office (পোস্ট অফিস)</label>
                <input
                  type="text"
                  value={postOffice}
                  onChange={e => setPostOffice(e.target.value)}
                  placeholder="e.g. Paharpur PO"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Police Station (থানা)</label>
                <input
                  type="text"
                  value={policeStation}
                  onChange={e => setPoliceStation(e.target.value)}
                  placeholder="e.g. Maheshtala"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">District (জেলা)</label>
                <input
                  type="text"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="e.g. South 24 Parganas"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Occupation (পেশা)</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={e => setOccupation(e.target.value)}
                  placeholder="e.g. Teacher, Business, Farmer"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Referred By (রেফারেন্স)</label>
                <input
                  type="text"
                  value={referredBy}
                  onChange={e => setReferredBy(e.target.value)}
                  placeholder="e.g. Dr. Roy / Self"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Background & History */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold pb-2 border-b border-slate-200">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>3. CHIEF COMPLAINTS & MEDICAL HISTORY (সমস্যা ও শারীরিক ইতিহাস)</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Quick Select Common Complaints:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SYMPTOMS.map(sym => {
                  const isSelected = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors border ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Custom Complaint / Note
              </label>
              <input
                type="text"
                value={customComplaint}
                onChange={e => setCustomComplaint(e.target.value)}
                placeholder="Specific complaints e.g. Night vision issue for 2 weeks"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Medical History / Systemic Conditions:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MEDICAL_HISTORY_OPTIONS.map(med => {
                  const checked = medicalHistory.includes(med);
                  return (
                    <label
                      key={med}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                        checked ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMedicalHistory(med)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>{med}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Patient Notes & Remarks
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Special notes or clinical remarks..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              id="btn-save-edit-patient"
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              Save & Update Patient (রোগীর তথ্য আপডেট করুন)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
