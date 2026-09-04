import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { ClinicalVisit } from '../types';
import {
  FileCheck,
  Search,
  Printer,
  Glasses,
  Eye,
  Calendar,
  Stethoscope,
  Pill
} from 'lucide-react';

export const PrescriptionsLogView: React.FC = () => {
  const {
    clinicalVisits,
    setPrintModalData,
    loadPatientIntoClinical,
    setQuickModal,
    setSelectedPatientFor360,
    patients
  } = useErp();

  const [search, setSearch] = useState('');

  const filtered = (clinicalVisits || []).filter(v => {
    const q = (search || '').trim().toLowerCase();
    const pName = (v.patientName || '').toLowerCase();
    const pMrd = (v.mrd || '').toLowerCase();
    const pMob = v.mobile || '';
    const vId = (v.rxId || v.visitId || (v as any).id || '').toLowerCase();
    const vDoc = (v.doctor || '').toLowerCase();

    return (
      !q ||
      pName.includes(q) ||
      pMrd.includes(q) ||
      pMob.includes(search) ||
      vId.includes(q) ||
      vDoc.includes(q)
    );
  });

  const handlePrintRx = (visit: ClinicalVisit) => {
    setPrintModalData({
      type: 'prescription',
      data: visit
    });
  };

  const handleBookSpectacleFromRx = (visit: ClinicalVisit) => {
    loadPatientIntoClinical(visit.mrd);
    setQuickModal('new-order');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-teal-600" />
              Prescriptions Archive & Rx History (প্রেসক্রিপশন লগ)
            </h1>
            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              {(clinicalVisits || []).length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Audit-safe medical record archive of all patient consultations, refraction powers, diagnoses, and medical advice
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Patient Name, MRD, Mobile, Rx ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Rx ID & Date</th>
                <th className="py-3 px-4">Patient / MRD</th>
                <th className="py-3 px-4">Doctor & Visit</th>
                <th className="py-3 px-4">Refraction Power (OD / OS)</th>
                <th className="py-3 px-4">Diagnosis & Medicines</th>
                <th className="py-3 px-4 text-right">1-Click Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((visit, idx) => {
                const patObj = patients.find(p => p.mrd === visit.mrd);
                const rxDisplay = visit.rxId || visit.visitId || (visit as any).id || `RX-PEC-${idx + 1}`;
                const dateDisplay = visit.visitDate || (visit as any).date || (visit.timestamp ? visit.timestamp.split('T')[0] : '2026-08-23');
                const rowKey = `rx-item-${visit.visitId || visit.rxId || (visit as any).id || visit.mrd}-${idx}`;

                return (
                  <tr key={rowKey} className="hover:bg-teal-50/30 transition-colors">
                    
                    {/* Rx ID */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className="bg-teal-50 text-teal-900 border border-teal-200 px-2 py-0.5 rounded text-[11px] font-extrabold block w-fit font-mono">
                        {rxDisplay}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1">
                        {dateDisplay}
                      </span>
                    </td>

                    {/* Patient */}
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => {
                          if (patObj) setSelectedPatientFor360(patObj);
                        }}
                        className="font-bold text-slate-900 text-sm hover:text-teal-700 cursor-pointer"
                      >
                        {visit.patientName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {visit.mrd} • {visit.age} Yrs / {visit.gender}
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{visit.doctor}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded">
                        {visit.visitType}
                      </span>
                    </td>

                    {/* Refraction */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        <strong className="text-teal-700">OD:</strong> SPH {visit.odPower?.sph || '0.00'} | CYL {visit.odPower?.cyl || '0.00'} | AX {visit.odPower?.axis || '-'} | ADD {visit.odPower?.add || '-'}
                      </div>
                      <div className="font-semibold text-slate-900 mt-0.5">
                        <strong className="text-blue-700">OS:</strong> SPH {visit.osPower?.sph || '0.00'} | CYL {visit.osPower?.cyl || '0.00'} | AX {visit.osPower?.axis || '-'} | ADD {visit.osPower?.add || '-'}
                      </div>
                    </td>

                    {/* Diagnosis & Meds */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-teal-900">
                        {Array.isArray(visit.diagnosis) ? visit.diagnosis.join(', ') : visit.customDiagnosis || 'Refractive Error'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {(Array.isArray(visit.medicines) ? visit.medicines : []).length} Medicines Prescribed
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Book Spectacle */}
                        <button
                          onClick={() => handleBookSpectacleFromRx(visit)}
                          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                          title="Book Spectacle Order from this Prescription"
                        >
                          <Glasses className="w-3.5 h-3.5" />
                          Order Glasses
                        </button>

                        {/* Print Prescription */}
                        <button
                          onClick={() => handlePrintRx(visit)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                          title="Print Doctor's Prescription Slip"
                        >
                          <Printer className="w-3.5 h-3.5 text-teal-600" />
                          Print Rx
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
