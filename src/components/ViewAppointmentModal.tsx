import React from 'react';
import { useErp } from '../context/ErpContext';
import { Appointment } from '../types';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Stethoscope,
  DollarSign,
  Printer,
  MessageSquare,
  Edit3,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building,
  UserCheck,
  FileText,
  Activity,
  XCircle,
  ShieldCheck
} from 'lucide-react';

interface ViewAppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (apt: Appointment) => void;
  onCollectPayment: (apt: Appointment) => void;
}

export const ViewAppointmentModal: React.FC<ViewAppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onEdit,
  onCollectPayment
}) => {
  const {
    patients,
    startVisitFromAppointment,
    setPrintModalData,
    cancelAppointment,
    settings
  } = useErp();

  if (!isOpen || !appointment) return null;

  const linkedPatient = patients.find(p => p.mrd === appointment.mrd);

  const handlePrint = () => {
    setPrintModalData({
      type: 'appointment',
      data: {
        ...appointment,
        age: appointment.age || linkedPatient?.age || 35,
        gender: appointment.gender || linkedPatient?.gender || 'Male',
        village: appointment.village || linkedPatient?.village || 'Paharpur',
        address: appointment.address || linkedPatient?.address || 'South 24 Parganas'
      }
    });
  };

  const handleWhatsApp = () => {
    const cleanMobile = (appointment.mobile || '').replace(/[^0-9]/g, '');
    const fullNumber = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const msg = encodeURIComponent(
      `নমস্কার ${appointment.patientName},\n` +
      `Paharpur Eye Care এ আপনার চক্ষু পরীক্ষার অ্যাপয়েন্টমেন্ট শিডিউল করা হয়েছে।\n` +
      `📅 তারিখ: ${appointment.date}\n` +
      `⏰ সময়: ${appointment.time}\n` +
      `👨‍⚕️ কনসালট্যান্ট: ${appointment.doctor}\n` +
      (appointment.optometrist ? `🔬 অপ্টোমেট্রিস্ট: ${appointment.optometrist}\n` : '') +
      `💰 মোট ফি: ₹${appointment.totalFee || appointment.fee || 150} (জমা: ₹${appointment.paid || appointment.paidAmount || 0})\n` +
      `🏥 স্থান: পাহাডপুর আই কেয়ার, মেইন রোড।\n` +
      `📞 হেল্পলাইন: ${settings.mobile || '+91 98301 23456'}`
    );
    window.open(`https://wa.me/${fullNumber}?text=${msg}`, '_blank');
  };

  const handleCancel = () => {
    const reason = window.prompt('Please enter the reason for cancelling this appointment (optional):', 'Patient requested cancellation');
    if (reason !== null) {
      cancelAppointment(appointment.id, reason);
      onClose();
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'In Consultation':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Waiting':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Cancelled':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-xl border border-teal-500/40">
              <Calendar className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg tracking-tight">
                  Appointment Details
                </h3>
                <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {appointment.id}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadgeClass(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Full profile, scheduling, fee breakdown, and action triggers
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Patient Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                <User className="w-4 h-4 text-teal-600" />
                <span>{appointment.patientName}</span>
                <span className="text-slate-500 font-normal text-xs">
                  ({appointment.age || linkedPatient?.age || 35}Y / {appointment.gender || linkedPatient?.gender || 'Male'})
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                MRD: {appointment.mrd}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Primary Mobile:</span>
                <span className="font-bold text-slate-800">📞 {appointment.mobile}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">WhatsApp:</span>
                <span className="font-bold text-emerald-700">💬 {appointment.whatsapp || appointment.mobile}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Village / Area:</span>
                <span className="font-bold text-slate-800">🏡 {appointment.village || linkedPatient?.village || 'Paharpur'}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Post Office & PS:</span>
                <span className="font-semibold text-slate-700">
                  {appointment.postOffice || linkedPatient?.postOffice || '-'} / {appointment.policeStation || linkedPatient?.policeStation || '-'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">District:</span>
                <span className="font-semibold text-slate-700">{appointment.district || linkedPatient?.district || 'South 24 Parganas'}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Occupation & Reference:</span>
                <span className="font-semibold text-slate-700">
                  {appointment.occupation || linkedPatient?.occupation || 'General'} (Ref: {appointment.referredBy || linkedPatient?.referredBy || 'Self'})
                </span>
              </div>
            </div>
          </div>

          {/* Scheduling & Doctor info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 pb-1.5 border-b border-slate-200">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Appointment Schedule</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <strong className="text-slate-900">{appointment.date}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Slot:</span>
                  <strong className="text-teal-800">{appointment.time}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Visit Type:</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{appointment.visitType}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 pb-1.5 border-b border-slate-200">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Medical Consultants</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor (Ophthalmologist):</span>
                  <strong className="text-slate-900">{appointment.doctor}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Optometrist:</span>
                  <strong className="text-slate-800">{appointment.optometrist || 'None'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Status:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${getStatusBadgeClass(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Breakdown & Payment Card */}
          <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-teal-200/60">
              <div className="flex items-center gap-2 font-black text-teal-950 text-sm">
                <DollarSign className="w-4 h-4 text-teal-700" />
                <span>Professional Fee Breakdown & Payment Ledger</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                (appointment.due || 0) === 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {appointment.paymentStatus || ((appointment.due || 0) === 0 ? 'Paid' : 'Due')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-teal-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Doctor Fee:</span>
                <span className="font-black text-slate-900 text-sm">₹{appointment.doctorFee ?? 100}</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-teal-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Optometrist Fee:</span>
                <span className="font-black text-slate-900 text-sm">₹{appointment.optometristFee ?? 50}</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-teal-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Professional:</span>
                <span className="font-black text-teal-900 text-sm">₹{appointment.totalFee || appointment.fee || 150}</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-teal-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Discount / Concession:</span>
                <span className="font-black text-rose-700 text-sm">₹{appointment.discount || 0}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="bg-teal-100/60 p-3 rounded-xl border border-teal-300 flex items-center justify-between">
                <span className="text-slate-700 font-bold">Net Payable:</span>
                <span className="font-black text-base text-teal-950">₹{appointment.netFee ?? (appointment.totalFee || appointment.fee || 150)}</span>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-300 flex items-center justify-between">
                <span className="text-emerald-800 font-bold">Paid (Collected):</span>
                <span className="font-black text-base text-emerald-800">₹{appointment.paid || appointment.paidAmount || 0}</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                (appointment.due || 0) > 0 ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="font-bold text-slate-700">Due Balance:</span>
                <span className={`font-black text-base ${(appointment.due || 0) > 0 ? 'text-rose-700' : 'text-slate-600'}`}>
                  ₹{appointment.due || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
              <span>Payment Mode: <strong>{appointment.paymentMethod || 'Cash'}</strong></span>
              <span>Created on: {new Date(appointment.createdAt || Date.now()).toLocaleString()}</span>
            </div>
          </div>

          {/* Clinical Complaints & Remarks */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 pb-1.5 border-b border-slate-200">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Chief Complaints & Medical Notes</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Reported Symptoms:</span>
              <p className="font-bold text-slate-800 text-xs mt-0.5">
                {appointment.chiefComplaints || linkedPatient?.chiefComplaints || 'Routine eye exam / refraction check'}
              </p>
            </div>

            {((appointment.medicalHistory && appointment.medicalHistory.length > 0) || (linkedPatient?.medicalHistory && linkedPatient.medicalHistory.length > 0)) && (
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Medical History:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(appointment.medicalHistory || linkedPatient?.medicalHistory || []).map(h => (
                    <span key={h} className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 font-bold text-[10px]">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(appointment.receptionNote || appointment.notes) && (
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Reception Remarks:</span>
                <p className="text-slate-700 font-medium text-xs mt-0.5 italic">
                  "{appointment.receptionNote || appointment.notes}"
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {/* Cancel Appointment Button */}
            {appointment.status !== 'Cancelled' && (
              <button
                onClick={handleCancel}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 text-xs"
              >
                <XCircle className="w-4 h-4" />
                Cancel Appointment
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 text-xs"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </button>

            {/* Print Slip */}
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 text-xs"
            >
              <Printer className="w-4 h-4" />
              Print Slip
            </button>

            {/* Collect Due Payment */}
            {(appointment.due || 0) > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onCollectPayment(appointment);
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-xs transition-colors flex items-center gap-1.5 text-xs"
              >
                <CreditCard className="w-4 h-4" />
                Collect ₹{appointment.due} Due
              </button>
            )}

            {/* Edit Appointment */}
            <button
              onClick={() => {
                onClose();
                onEdit(appointment);
              }}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 text-xs"
            >
              <Edit3 className="w-4 h-4" />
              Edit Details
            </button>

            {/* 1-Click Start Visit */}
            <button
              onClick={() => {
                onClose();
                startVisitFromAppointment(appointment.id);
              }}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md transition-all hover:scale-105 flex items-center gap-1.5 text-xs"
            >
              <Stethoscope className="w-4 h-4" />
              ⚡ Start Visit
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
