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
  Stethoscope
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    updateAppointmentStatus,
    startVisitFromAppointment,
    setQuickModal,
    setSelectedPatientFor360,
    patients
  } = useErp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('all'); // 'today' | 'upcoming' | 'all'

  const today = new Date().toISOString().split('T')[0];

  const filtered = appointments.filter(apt => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
      apt.mrd.toLowerCase().includes(search.toLowerCase()) ||
      apt.mobile.includes(search) ||
      apt.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'All' || apt.status === filterStatus;

    let matchesDate = true;
    if (dateFilter === 'today') matchesDate = apt.date === today;
    if (dateFilter === 'upcoming') matchesDate = apt.date >= today;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleWhatsAppReminder = (apt: Appointment) => {
    const cleanMobile = apt.mobile.replace(/[^0-9]/g, '');
    const fullNumber = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const msg = encodeURIComponent(
      `Hello ${apt.patientName}, your Eye Consultation appointment at Paharpur Eye Care is scheduled on ${apt.date} at ${apt.time} with ${apt.doctor}. Please arrive 10 mins prior. Location: Paharpur Main Road. Helpline: +91 98301 23456.`
    );
    window.open(`https://wa.me/${fullNumber}?text=${msg}`, '_blank');
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

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Appointment Management & Queue (অ্যাপয়েন্টমেন্ট ও ভিজিট)
            </h1>
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              {appointments.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Click <strong className="text-teal-900">⚡ START VISIT</strong> on any appointment to instantly load patient into Clinical Entry Center
          </p>
        </div>

        <button
          id="btn-book-appointment"
          onClick={() => setQuickModal('new-appointment')}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + Book New Appointment
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patient, MRD, mobile, Apt ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        {/* Date & Status Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
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
              All
            </button>
          </div>

          <select
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

      {/* Appointments List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Apt ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Patient Details</th>
                <th className="py-3 px-4">Doctor & Type</th>
                <th className="py-3 px-4">Status Selector</th>
                <th className="py-3 px-4 text-right">⚡ 1-Click Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No appointments found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(apt => {
                  const patientObj = patients.find(p => p.mrd === apt.mrd);
                  return (
                    <tr key={apt.id} className="hover:bg-teal-50/30 transition-colors">
                      
                      {/* Apt ID */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-900 text-[11px]">
                          {apt.id}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
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

                      {/* Patient */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => {
                            if (patientObj) setSelectedPatientFor360(patientObj);
                          }}
                          className="font-bold text-slate-900 text-sm hover:text-teal-700 cursor-pointer"
                        >
                          {apt.patientName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {apt.mrd} • {apt.mobile}
                        </div>
                      </td>

                      {/* Doctor & Type */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{apt.doctor}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded">
                          {apt.visitType}
                        </span>
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

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* WhatsApp Reminder */}
                          <button
                            onClick={() => handleWhatsAppReminder(apt)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors"
                            title="Send WhatsApp Appointment Reminder"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* 1-Click START VISIT */}
                          <button
                            id={`start-visit-btn-${apt.id}`}
                            onClick={() => startVisitFromAppointment(apt.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs ${
                              apt.status === 'Completed'
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-teal-600 hover:bg-teal-700 text-white hover:scale-105'
                            }`}
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            {apt.status === 'Completed' ? 'Re-open Visit' : '⚡ Start Visit'}
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

    </div>
  );
};
