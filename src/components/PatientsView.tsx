import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { Patient } from '../types';
import {
  Users,
  Search,
  Plus,
  Eye,
  Calendar,
  Glasses,
  MessageCircle,
  Edit2,
  FileText,
  Phone,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

export const PatientsView: React.FC = () => {
  const {
    patients,
    setSelectedPatientFor360,
    setQuickModal,
    startVisitFromAppointment,
    loadPatientIntoClinical,
    setActiveTab,
    createAppointment
  } = useErp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const filtered = patients.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.mrd.toLowerCase().includes(search.toLowerCase()) ||
      p.mobile.includes(search) ||
      (p.village && p.village.toLowerCase().includes(search.toLowerCase())) ||
      p.district.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStartConsultation = (patient: Patient) => {
    loadPatientIntoClinical(patient.mrd);
  };

  const handleWhatsApp = (mobile: string, name: string) => {
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    const fullNumber = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const msg = encodeURIComponent(`Hello ${name}, greetings from Paharpur Eye Care! Please let us know if you need any assistance regarding your eye consultation or spectacles.`);
    window.open(`https://wa.me/${fullNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Patient 360° Management (রোগী তালিকা ও রেকর্ড)
            </h1>
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              {patients.length} Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Central Patient Registry linked with Clinical Visits, Prescriptions, Spectacles, and Google Sheets
          </p>
        </div>

        <button
          id="btn-register-patient"
          onClick={() => setQuickModal('new-patient')}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + New Patient Registration (MRD)
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Name, MRD, Mobile, Village..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'Regular', 'New Patient', 'Follow-up Patient', 'Active'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase">
              <tr>
                <th className="py-3 px-4">MRD #</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">Mobile & WhatsApp</th>
                <th className="py-3 px-4">Address / Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">1-Click Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No patients match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(patient => (
                  <tr key={patient.mrd} className="hover:bg-teal-50/40 transition-colors">
                    
                    {/* MRD */}
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-teal-900 bg-teal-50 border border-teal-200 px-2 py-1 rounded-md text-[11px]">
                        {patient.mrd}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1">
                        Reg: {patient.registrationDate}
                      </span>
                    </td>

                    {/* Patient Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {patient.name}
                      </div>
                      {patient.referredBy && (
                        <span className="text-[10px] text-slate-500">
                          Ref: {patient.referredBy}
                        </span>
                      )}
                    </td>

                    {/* Age / Gender */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {patient.age} Yrs • {patient.gender}
                    </td>

                    {/* Mobile & WhatsApp */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{patient.mobile}</div>
                      <button
                        onClick={() => handleWhatsApp(patient.mobile, patient.name)}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-0.5"
                      >
                        <MessageCircle className="w-3 h-3" />
                        WhatsApp Chat
                      </button>
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="line-clamp-1">{patient.address}</div>
                      <span className="text-[10px] text-slate-400">
                        {patient.policeStation ? `${patient.policeStation}, ` : ''}{patient.district}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          patient.status === 'Regular'
                            ? 'bg-blue-100 text-blue-800'
                            : patient.status === 'Follow-up Patient'
                            ? 'bg-amber-100 text-amber-800'
                            : patient.status === 'New Patient'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* 360 Profile Button */}
                        <button
                          id={`patient-360-${patient.mrd}`}
                          onClick={() => setSelectedPatientFor360(patient)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                          title="Open 360° Comprehensive Profile with Power Comparison"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600" />
                          360° Profile
                        </button>

                        {/* Start Clinical Consultation */}
                        <button
                          id={`patient-consult-${patient.mrd}`}
                          onClick={() => handleStartConsultation(patient)}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                          title="Start Clinical Examination"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Consult
                        </button>

                        {/* Book Spectacle */}
                        <button
                          id={`patient-order-${patient.mrd}`}
                          onClick={() => {
                            loadPatientIntoClinical(patient.mrd);
                            setQuickModal('new-order');
                          }}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                          title="Book Spectacle Order"
                        >
                          <Glasses className="w-3.5 h-3.5" />
                          Spectacle
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
  );
};
