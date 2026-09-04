import React, { useState, useEffect } from 'react';
import { useErp } from '../context/ErpContext';
import { Appointment, Gender, VisitType, PaymentMethod, AppointmentStatus, PaymentStatus } from '../types';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Stethoscope,
  DollarSign,
  Save,
  AlertCircle,
  FileText,
  Activity,
  CheckCircle2,
  Tag,
  CreditCard,
  Building,
  UserCheck
} from 'lucide-react';

interface EditAppointmentModalProps {
  appointment: Appointment | null;
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

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '04:00 PM', '04:30 PM', '05:00 PM',
  '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'
];

export const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose
}) => {
  const { settings, updateAppointment, patients } = useErp();

  if (!isOpen || !appointment) return null;

  const linkedPatient = patients.find(p => p.mrd === appointment.mrd);

  // Form states
  const [patientName, setPatientName] = useState(appointment.patientName || '');
  const [age, setAge] = useState<number | ''>(appointment.age !== undefined ? appointment.age : (linkedPatient?.age || 35));
  const [dob, setDob] = useState(appointment.dob || linkedPatient?.dob || '');
  const [gender, setGender] = useState<Gender>(appointment.gender || linkedPatient?.gender || 'Male');
  const [mobile, setMobile] = useState(appointment.mobile || linkedPatient?.mobile || '');
  const [whatsapp, setWhatsapp] = useState(appointment.whatsapp || linkedPatient?.whatsapp || appointment.mobile || '');

  // Address
  const [village, setVillage] = useState(appointment.village || linkedPatient?.village || '');
  const [address, setAddress] = useState(appointment.address || linkedPatient?.address || '');
  const [postOffice, setPostOffice] = useState(appointment.postOffice || linkedPatient?.postOffice || '');
  const [policeStation, setPoliceStation] = useState(appointment.policeStation || linkedPatient?.policeStation || '');
  const [district, setDistrict] = useState(appointment.district || linkedPatient?.district || 'South 24 Parganas');
  const [occupation, setOccupation] = useState(appointment.occupation || linkedPatient?.occupation || '');
  const [referredBy, setReferredBy] = useState(appointment.referredBy || linkedPatient?.referredBy || 'Self');

  // Scheduling
  const [aptDate, setAptDate] = useState(appointment.date || '');
  const [aptTime, setAptTime] = useState(appointment.time || '11:00 AM');
  const [doctor, setDoctor] = useState(appointment.doctor || settings.doctorName || 'Dr. S. K. Banerjee');
  const [optometrist, setOptometrist] = useState(appointment.optometrist || settings.optometristName || 'Dr. R. N. Mukherjee');
  const [visitType, setVisitType] = useState<VisitType | string>(appointment.visitType || 'New Eye Consultation');
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status || 'Confirmed');

  // Fees calculation
  const [doctorFee, setDoctorFee] = useState<number>(
    appointment.doctorFee !== undefined ? appointment.doctorFee : (settings.doctorFee || 100)
  );
  const [optometristFee, setOptometristFee] = useState<number>(
    appointment.optometristFee !== undefined ? appointment.optometristFee : (settings.optometristFee || 50)
  );
  const [discount, setDiscount] = useState<number>(appointment.discount || 0);
  const [paid, setPaid] = useState<number>(
    appointment.paid !== undefined ? appointment.paid : (appointment.paidAmount !== undefined ? appointment.paidAmount : 0)
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(appointment.paymentMethod || 'Cash');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(appointment.paymentStatus || 'Paid');

  // Auto calculate total and due
  const totalFee = (Number(doctorFee) || 0) + (Number(optometristFee) || 0);
  const netFee = Math.max(0, totalFee - (Number(discount) || 0));
  const due = Math.max(0, netFee - (Number(paid) || 0));

  // Auto-adjust paymentStatus when paid or netFee changes
  useEffect(() => {
    if (paid >= netFee && netFee > 0) {
      setPaymentStatus('Paid');
    } else if (paid > 0 && due > 0) {
      setPaymentStatus('Partial');
    } else if (paid === 0 && netFee > 0) {
      setPaymentStatus('Pending');
    }
  }, [paid, netFee, due]);

  // Symptoms & Medical History
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(() => {
    if (appointment.chiefComplaints) return [appointment.chiefComplaints];
    if (linkedPatient?.chiefComplaints) return [linkedPatient.chiefComplaints];
    return [];
  });
  const [customComplaint, setCustomComplaint] = useState('');
  const [medicalHistory, setMedicalHistory] = useState<string[]>(appointment.medicalHistory || linkedPatient?.medicalHistory || []);
  const [receptionNote, setReceptionNote] = useState(appointment.receptionNote || appointment.notes || '');

  // Handle DOB change
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

  // Doctors & Optometrists lists
  const availableDoctors = settings.doctorsList && settings.doctorsList.length > 0
    ? settings.doctorsList
    : [{ id: 'DOC-1', name: settings.doctorName || 'Dr. S. K. Banerjee', status: 'Active', consultationFee: settings.doctorFee || 100 }];

  const availableOptometrists = settings.optometristsList && settings.optometristsList.length > 0
    ? settings.optometristsList
    : [{ id: 'OPT-1', name: settings.optometristName || 'Dr. R. N. Mukherjee', status: 'Active', examinationFee: settings.optometristFee || 50 }];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const complaintsList = [...selectedSymptoms];
    if (customComplaint.trim() && !complaintsList.includes(customComplaint.trim())) {
      complaintsList.push(customComplaint.trim());
    }

    const updatedApt: Appointment = {
      ...appointment,
      patientName: patientName.trim(),
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
      date: aptDate,
      time: aptTime,
      doctor,
      optometrist,
      visitType,
      status,
      doctorFee: Number(doctorFee) || 0,
      optometristFee: Number(optometristFee) || 0,
      fee: totalFee,
      totalFee,
      discount: Number(discount) || 0,
      netFee,
      paid: Number(paid) || 0,
      paidAmount: Number(paid) || 0,
      due,
      paymentMethod,
      paymentStatus,
      chiefComplaints: complaintsList.join(', '),
      medicalHistory,
      receptionNote: receptionNote.trim(),
      notes: receptionNote.trim(),
      updatedAt: new Date().toISOString()
    };

    updateAppointment(updatedApt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-xl border border-teal-500/40">
              <Calendar className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">
                  Edit Appointment: {appointment.id}
                </h3>
                <span className="bg-teal-500/20 text-teal-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-teal-500/30">
                  MRD: {appointment.mrd}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Update patient demographics, fee breakdown, consultation schedule, and clinical complaints
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

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Section 1: Patient Demographics & Contact */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold pb-2 border-b border-slate-200">
              <User className="w-4 h-4 text-teal-600" />
              <span>1. PATIENT DEMOGRAPHICS & CONTACT (রোগীর ব্যক্তিগত তথ্য)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Patient Full Name (রোগীর নাম) *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="e.g. Rahim Ali Mondal"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mobile Number (মোবাইল নম্বর) *
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="e.g. 9830123456"
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
                  placeholder="e.g. 9830123456"
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
                    onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))}
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
                <label className="block font-bold text-slate-700 mb-1">Village / Para (গ্রাম / এলাকা)</label>
                <input
                  type="text"
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  placeholder="e.g. Paharpur, Durgapur"
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
                  placeholder="e.g. Maheshtala / Diamond Harbour"
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
                  placeholder="e.g. Farmer, Teacher, Tailor"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Referred By (রেফারেন্স)</label>
                <input
                  type="text"
                  value={referredBy}
                  onChange={e => setReferredBy(e.target.value)}
                  placeholder="e.g. Dr. Roy / Local Camp / Self"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Scheduling & Practitioners */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold pb-2 border-b border-slate-200">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>2. APPOINTMENT SCHEDULING & PRACTITIONERS (শিডিউল ও ডাক্তার নির্বাচন)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Appointment Date (তারিখ) *</label>
                <input
                  type="date"
                  required
                  value={aptDate}
                  onChange={e => setAptDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Appointment Time Slot (সময়) *</label>
                <select
                  value={aptTime}
                  onChange={e => setAptTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {TIME_SLOTS.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor (চক্ষু বিশেষজ্ঞ ডাক্তার)</label>
                <select
                  value={doctor}
                  onChange={e => {
                    const sel = e.target.value;
                    setDoctor(sel);
                    const docObj = availableDoctors.find(d => d.name === sel);
                    if (docObj && docObj.consultationFee !== undefined) {
                      setDoctorFee(docObj.consultationFee);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {availableDoctors.map(d => (
                    <option key={d.id} value={d.name}>
                      {d.name} {d.consultationFee ? `(₹${d.consultationFee})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Optometrist (অপ্টোমেট্রিস্ট)</label>
                <select
                  value={optometrist}
                  onChange={e => {
                    const sel = e.target.value;
                    setOptometrist(sel);
                    const optObj = availableOptometrists.find(o => o.name === sel);
                    if (optObj && optObj.examinationFee !== undefined) {
                      setOptometristFee(optObj.examinationFee);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="">None / Not Applicable</option>
                  {availableOptometrists.map(o => (
                    <option key={o.id} value={o.name}>
                      {o.name} {o.examinationFee ? `(₹${o.examinationFee})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Visit Type (ভিজিটের ধরন)</label>
                <select
                  value={visitType}
                  onChange={e => setVisitType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="New Eye Consultation">New Eye Consultation (নতুন পরীক্ষা)</option>
                  <option value="Follow-up Visit">Follow-up Visit (ফলো-আপ)</option>
                  <option value="Refraction / Power Check">Refraction / Power Check (পাওয়ার চেক)</option>
                  <option value="Post-Op Checkup">Post-Op Checkup (অপারেশন পরবর্তী)</option>
                  <option value="Contact Lens Fitting">Contact Lens Fitting</option>
                  <option value="Emergency Eye Care">Emergency Eye Care (জরুরি)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status (অ্যাপয়েন্টমেন্ট স্ট্যাটাস)</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as AppointmentStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Waiting">Waiting</option>
                  <option value="In Consultation">In Consultation</option>
                  <option value="Completed">Completed</option>
                  <option value="Booked">Booked</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="No Show">No Show</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Fee Management & Payment (Editable Doctor + Optometrist fees) */}
          <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-teal-200/60">
              <div className="flex items-center gap-2 text-teal-950 font-extrabold">
                <DollarSign className="w-4 h-4 text-teal-700" />
                <span>3. FEE MANAGEMENT & BREAKDOWN (ফি হিসাব ও পেমেন্ট)</span>
              </div>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                Auto-calculated
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={doctorFee}
                  onChange={e => setDoctorFee(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Optometrist Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={optometristFee}
                  onChange={e => setOptometristFee(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Fee (মোট ফি)</label>
                <div className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-black text-slate-900 text-sm">
                  ₹{totalFee}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Discount (ছাড় - ₹)</label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Net Payable (দেয়)</label>
                <div className="px-3 py-2 bg-teal-100/80 border border-teal-300 rounded-xl font-black text-teal-900 text-sm">
                  ₹{netFee}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Paid Amount (জমা)</label>
                <input
                  type="number"
                  min="0"
                  value={paid}
                  onChange={e => setPaid(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl font-bold text-emerald-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Due Balance (বাকি)</label>
                <div className={`px-3 py-2 rounded-xl font-black text-sm border ${
                  due > 0 ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                }`}>
                  ₹{due} {due === 0 ? '(Nil)' : ''}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method (পেমেন্ট মোড)</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Cash">Cash (নগদ)</option>
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer / Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Paid">Paid (পরিশোধিত)</option>
                  <option value="Partial">Partial (আংশিক জমা)</option>
                  <option value="Pending">Pending / Due (বাকি)</option>
                  <option value="Complimentary">Complimentary / Free (ফ্রি)</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Complaints, Medical History & Remarks */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold pb-2 border-b border-slate-200">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>4. CHIEF COMPLAINTS & CLINICAL NOTES (সমস্যা ও পূর্ব ইতিহাস)</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Quick Select Common Complaints (সাধারণ সমস্যাগুলি নির্বাচন করুন):
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
                Custom Complaint / Note (অন্যান্য সমস্যা)
              </label>
              <input
                type="text"
                value={customComplaint}
                onChange={e => setCustomComplaint(e.target.value)}
                placeholder="Specific complaints e.g. Left eye watering for 3 days"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Medical History / Systemic Conditions (পূর্বের শারীরিক ইতিহাস):
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
                Reception Notes / Remarks (রিসেপশন নোট)
              </label>
              <textarea
                rows={2}
                value={receptionNote}
                onChange={e => setReceptionNote(e.target.value)}
                placeholder="Special notes or priority instructions..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              id="btn-save-edit-appointment"
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              Save & Update Appointment (আপডেট করুন)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
