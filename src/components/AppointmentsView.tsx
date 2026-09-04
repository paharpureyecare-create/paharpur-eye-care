import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { AppointmentStatus, Appointment } from '../types';
import {
  Calendar,
  Plus,
  Play,
  Search,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
  Stethoscope,
  Printer,
  MapPin,
  HeartPulse,
  User,
  Eye,
  Edit3,
  CreditCard,
  DollarSign,
  Filter,
  Layers,
  Archive,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { BookAppointmentModal } from './BookAppointmentModal';
import { EditAppointmentModal } from './EditAppointmentModal';
import { ViewAppointmentModal } from './ViewAppointmentModal';
import { CollectAppointmentPaymentModal } from './CollectAppointmentPaymentModal';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    updateAppointmentStatus,
    startVisitFromAppointment,
    setPrintModalData,
    setSelectedPatientFor360,
    patients,
    settings,
    archiveAppointment,
    restoreAppointment,
    deleteAppointment,
    showToast
  } = useErp();

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [collectingPaymentAppointment, setCollectingPaymentAppointment] = useState<Appointment | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Active');
  const [dateFilter, setDateFilter] = useState<string>('all'); // 'today' | 'upcoming' | 'all'
  const [doctorFilter, setDoctorFilter] = useState<string>('All');

  const today = new Date().toISOString().split('T')[0];

  const filtered = appointments.filter(apt => {
    const q = (search || '').trim().toLowerCase();
    const pName = (apt.patientName || '').toLowerCase();
    const pMrd = (apt.mrd || '').toLowerCase();
    const pMob = apt.mobile || '';
    const aptId = (apt.id || '').toLowerCase();
    const pVillage = (apt.village || '').toLowerCase();

    const matchesSearch =
      !q ||
      pName.includes(q) ||
      pMrd.includes(q) ||
      pMob.includes(search) ||
      aptId.includes(q) ||
      pVillage.includes(q);

    let matchesStatus = true;
    if (filterStatus === 'Active') matchesStatus = apt.status !== 'Archived';
    else if (filterStatus === 'Archived') matchesStatus = apt.status === 'Archived';
    else if (filterStatus !== 'All') matchesStatus = apt.status === filterStatus;

    const matchesDoctor = doctorFilter === 'All' || apt.doctor === doctorFilter;

    let matchesDate = true;
    if (dateFilter === 'today') matchesDate = apt.date === today;
    if (dateFilter === 'upcoming') matchesDate = apt.date >= today;

    return matchesSearch && matchesStatus && matchesDoctor && matchesDate;
  });

  const handleArchiveAppointment = (aptId: string, name: string) => {
    const reason = prompt(`Reason for archiving appointment #${aptId} (${name}):`, 'Cancelled / Rescheduled');
    if (reason !== null) {
      archiveAppointment(aptId, reason || 'Archived by Admin');
    }
  };

  const handleRestoreAppointment = (aptId: string, name: string) => {
    if (window.confirm(`Restore appointment #${aptId} (${name}) to Scheduled status?`)) {
      restoreAppointment(aptId);
    }
  };

  const handleDeleteAppointment = (aptId: string, name: string) => {
    const confirmText = prompt(
      `⚠️ ADMIN PERMANENT DELETE\nThis will permanently delete appointment #${aptId} (${name}).\nType "DELETE" to confirm:`
    );
    if (confirmText === 'DELETE') {
      deleteAppointment(aptId);
    } else if (confirmText !== null) {
      showToast('Deletion cancelled: text did not match DELETE', 'warning');
    }
  };

  const handleWhatsAppReminder = (apt: Appointment) => {
    const cleanMobile = (apt.mobile || '').replace(/[^0-9]/g, '');
    const fullNumber = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const msg = encodeURIComponent(
      `নমস্কার ${apt.patientName},\n` +
      `Paharpur Eye Care এ আপনার চক্ষু পরীক্ষার অ্যাপয়েন্টমেন্ট শিডিউল করা হয়েছে।\n` +
      `📅 তারিখ: ${apt.date}\n` +
      `⏰ সময়: ${apt.time}\n` +
      `👨‍⚕️ কনসালট্যান্ট: ${apt.doctor}\n` +
      (apt.optometrist ? `🔬 অপ্টোমেট্রিস্ট: ${apt.optometrist}\n` : '') +
      `💰 মোট ফি: ₹${apt.totalFee || apt.fee || 150} (জমা: ₹${apt.paid || apt.paidAmount || 0})\n` +
      `🏥 স্থান: পাহাডপুর আই কেয়ার, মেইন রোড।\n` +
      `📞 হেল্পলাইন: ${settings.mobile || '+91 98301 23456'}`
    );
    window.open(`https://wa.me/${fullNumber}?text=${msg}`, '_blank');
  };

  const handlePrintSlip = (apt: Appointment) => {
    const pObj = patients.find(p => p.mrd === apt.mrd);
    setPrintModalData({
      type: 'appointment',
      data: {
        ...apt,
        age: apt.age || pObj?.age || 35,
        gender: apt.gender || pObj?.gender || 'Male',
        village: apt.village || pObj?.village || 'Paharpur',
        address: apt.address || pObj?.address || 'South 24 Parganas'
      }
    });
  };

  const statusOptions: AppointmentStatus[] = [
    'Booked',
    'Confirmed',
    'Waiting',
    'In Consultation',
    'Completed',
    'Cancelled',
    'No Show'
  ];

  // Unique doctors for filter dropdown
  const doctorsInList = Array.from(new Set(appointments.map(a => a.doctor).filter(Boolean)));

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Appointment Registry & Clinical Queue
            </h1>
            <span className="bg-teal-50 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              {appointments.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Full In-Place Editing, Fee Ledger (Doctor + Optometrist fees), 1-Click Print, WhatsApp confirmation, and Audit logging
          </p>
        </div>

        <button
          id="btn-book-appointment-view"
          onClick={() => setIsBookModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + Book New Appointment (বুক অ্যাপয়েন্টমেন্ট)
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-appointment-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patient, MRD, mobile, village, ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        {/* Date, Doctor & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                dateFilter === 'today' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('upcoming')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                dateFilter === 'upcoming' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                dateFilter === 'all' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All Dates
            </button>
          </div>

          <select
            id="select-appointment-doctor"
            value={doctorFilter}
            onChange={e => setDoctorFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="All">All Doctors</option>
            {doctorsInList.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            id="select-appointment-status"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            {statusOptions.map(st => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

        </div>

      </div>

      {/* Appointments List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Apt ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Patient Profile (রোগীর বিবরণ)</th>
                <th className="py-3 px-4">Consultant & Visit Type</th>
                <th className="py-3 px-4">Fee & Payment</th>
                <th className="py-3 px-4">Queue Status</th>
                <th className="py-3 px-4 text-right">⚡ 1-Click Action Hub</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No appointments found matching your search. Click "+ Book New Appointment" to create one.
                  </td>
                </tr>
              ) : (
                filtered.map(apt => {
                  const patientObj = patients.find(p => p.mrd === apt.mrd);
                  const displayVillage = apt.village || patientObj?.village;
                  const displayAge = apt.age || patientObj?.age;
                  const displayGender = apt.gender || patientObj?.gender;
                  const totalFee = apt.totalFee || apt.fee || 150;
                  const paid = apt.paid !== undefined ? apt.paid : (apt.paidAmount !== undefined ? apt.paidAmount : 0);
                  const due = apt.due !== undefined ? apt.due : Math.max(0, (apt.netFee || totalFee) - paid);

                  return (
                    <tr key={apt.id} className="hover:bg-teal-50/30 transition-colors">
                      
                      {/* Apt ID */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-900 text-[11px] font-mono border border-slate-200">
                          {apt.id}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          {apt.time}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {apt.date === today ? (
                            <strong className="text-teal-700">Today ({apt.date})</strong>
                          ) : (
                            apt.date
                          )}
                        </span>
                      </td>

                      {/* Patient & Location */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => {
                            if (patientObj) setSelectedPatientFor360(patientObj);
                            else setViewingAppointment(apt);
                          }}
                          className="font-bold text-slate-900 text-sm hover:text-teal-700 cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{apt.patientName}</span>
                          {displayAge && (
                            <span className="text-slate-500 font-normal text-xs">
                              ({displayAge}Y / {displayGender || 'Male'})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-teal-800 font-bold">{apt.mrd}</span>
                          <span>•</span>
                          <span>📞 {apt.mobile}</span>
                        </div>
                        {displayVillage && (
                          <div className="text-[10px] font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            <span>গ্রাম: {displayVillage}</span>
                            {apt.district && <span className="text-slate-400">({apt.district})</span>}
                          </div>
                        )}
                      </td>

                      {/* Doctor & Optometrist */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{apt.doctor}</div>
                        {apt.optometrist && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            Optom: {apt.optometrist}
                          </div>
                        )}
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {apt.visitType}
                        </span>
                      </td>

                      {/* Fee Breakdown & Payment Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-black text-slate-900 flex items-center gap-1.5">
                          <span>₹{totalFee}</span>
                          {paid > 0 && <span className="text-[10px] font-bold text-emerald-700">(Paid: ₹{paid})</span>}
                        </div>
                        <div className="mt-1">
                          {due > 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                              Due: ₹{due}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Paid
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="py-3.5 px-4">
                        <select
                          value={apt.status}
                          onChange={e => updateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border cursor-pointer ${
                            apt.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : apt.status === 'In Consultation'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : apt.status === 'Waiting'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : apt.status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          {statusOptions.map(st => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* 1-Click Action Hub */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* 1. View Appointment */}
                          <button
                            id={`view-apt-btn-${apt.id}`}
                            onClick={() => setViewingAppointment(apt)}
                            className="p-1.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded-lg text-xs font-bold transition-colors border border-slate-200"
                            title="View Full Appointment Breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Edit Appointment */}
                          <button
                            id={`edit-apt-btn-${apt.id}`}
                            onClick={() => setEditingAppointment(apt)}
                            className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold transition-colors border border-slate-200"
                            title="Edit & Update Appointment In-Place"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. Collect Payment (if due > 0) */}
                          {due > 0 && (
                            <button
                              id={`pay-apt-btn-${apt.id}`}
                              onClick={() => setCollectingPaymentAppointment(apt)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-colors border border-amber-200"
                              title={`Collect ₹${due} Fee Due`}
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 4. Print Token Slip */}
                          <button
                            id={`print-apt-btn-${apt.id}`}
                            onClick={() => handlePrintSlip(apt)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors border border-slate-200"
                            title="Print Appointment Slip / Token"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* 5. WhatsApp Reminder */}
                          <button
                            id={`wa-apt-btn-${apt.id}`}
                            onClick={() => handleWhatsAppReminder(apt)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors border border-emerald-200"
                            title="Send WhatsApp Confirmation / Reminder"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* 6. 1-Click START VISIT */}
                          <button
                            id={`start-visit-btn-${apt.id}`}
                            onClick={() => startVisitFromAppointment(apt.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-all shadow-2xs ${
                              apt.status === 'Completed'
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-teal-600 hover:bg-teal-700 text-white hover:scale-105'
                            }`}
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            {apt.status === 'Completed' ? 'Re-open' : '⚡ Start'}
                          </button>

                          {/* 7. Archive / Restore */}
                          {apt.status === 'Archived' ? (
                            <button
                              id={`restore-apt-btn-${apt.id}`}
                              onClick={() => handleRestoreAppointment(apt.id, apt.patientName)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors border border-emerald-200"
                              title="Restore Appointment"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              id={`archive-apt-btn-${apt.id}`}
                              onClick={() => handleArchiveAppointment(apt.id, apt.patientName)}
                              className="p-1.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-lg text-xs font-bold transition-colors border border-slate-200"
                              title="Archive Appointment"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 8. Permanent Delete */}
                          <button
                            id={`delete-apt-btn-${apt.id}`}
                            onClick={() => handleDeleteAppointment(apt.id, apt.patientName)}
                            className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg text-xs font-bold transition-colors border border-slate-200"
                            title="Permanent Delete (Admin Only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        prefillPatient={null}
      />

      {/* View Appointment Modal */}
      {viewingAppointment && (
        <ViewAppointmentModal
          appointment={viewingAppointment}
          isOpen={!!viewingAppointment}
          onClose={() => setViewingAppointment(null)}
          onEdit={(apt) => {
            setViewingAppointment(null);
            setEditingAppointment(apt);
          }}
          onCollectPayment={(apt) => {
            setViewingAppointment(null);
            setCollectingPaymentAppointment(apt);
          }}
        />
      )}

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          isOpen={!!editingAppointment}
          onClose={() => setEditingAppointment(null)}
        />
      )}

      {/* Collect Appointment Payment Modal */}
      {collectingPaymentAppointment && (
        <CollectAppointmentPaymentModal
          appointment={collectingPaymentAppointment}
          isOpen={!!collectingPaymentAppointment}
          onClose={() => setCollectingPaymentAppointment(null)}
        />
      )}

    </div>
  );
};
