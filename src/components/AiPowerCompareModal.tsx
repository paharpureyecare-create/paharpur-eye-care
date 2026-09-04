import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { ErpAiTools } from '../services/aiService';
import {
  Sparkles,
  Eye,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  X,
  FileText,
  Calendar,
  User,
  History
} from 'lucide-react';

interface AiPowerCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientMrd?: string;
}

export const AiPowerCompareModal: React.FC<AiPowerCompareModalProps> = ({
  isOpen,
  onClose,
  patientMrd
}) => {
  const { patients, visits } = useErp();

  const [selectedMRD, setSelectedMRD] = useState<string>(patientMrd || patients[0]?.mrd || '');

  if (!isOpen) return null;

  const currentPatient = patients.find(p => p.mrd === selectedMRD);
  const patientVisits = visits.filter(v => v.mrd === selectedMRD);

  const prevVisit = patientVisits.length > 1 ? patientVisits[patientVisits.length - 2] : null;
  const currVisit = patientVisits.length > 0 ? patientVisits[patientVisits.length - 1] : null;

  const comparison = ErpAiTools.comparePrescriptions(prevVisit, currVisit);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-center justify-between border-b border-teal-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/30 flex items-center justify-center border border-teal-400/30 text-teal-200">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">Prescription Power Evolution & Comparison</h3>
                <span className="text-[10px] bg-teal-400/20 text-teal-200 border border-teal-400/30 px-2 py-0.5 rounded-full font-semibold">
                  Ocular Power Shift
                </span>
              </div>
              <p className="text-xs text-teal-100/70">
                Side-by-side comparative analysis of historical OD/OS Refraction powers
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 flex-1 overflow-y-auto">
          
          {/* Patient Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold text-slate-700">Select Patient:</span>
            </div>
            <select
              value={selectedMRD}
              onChange={(e) => setSelectedMRD(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500"
            >
              {patients.map(p => (
                <option key={p.mrd} value={p.mrd}>
                  {p.name} ({p.mrd}) - {p.mobile}
                </option>
              ))}
            </select>
          </div>

          {currentPatient && (
            <div className="text-xs text-slate-600 flex items-center gap-4 px-1">
              <span><strong>Name:</strong> {currentPatient.name}</span>
              <span><strong>Age/Gender:</strong> {currentPatient.age}y / {currentPatient.gender}</span>
              <span><strong>Total Visits:</strong> {patientVisits.length} recorded</span>
            </div>
          )}

          {/* Comparison Cards */}
          {currVisit && prevVisit && comparison ? (
            <div className="space-y-4">
              
              {/* Right Eye (OD) Comparison */}
              <div className="bg-teal-50/40 p-4 rounded-2xl border border-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-teal-700" />
                    <span className="font-bold text-sm text-teal-900">Right Eye (OD - ডান চোখ)</span>
                  </div>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
                    OD Power Shift
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Previous ({prevVisit.visitDate})</span>
                    <p className="text-base font-bold text-slate-700 mt-1">
                      SPH {prevVisit.odPower?.sph || '0.00'}
                    </p>
                    <p className="text-xs text-slate-500">
                      CYL {prevVisit.odPower?.cyl || '0.00'} | Axis {prevVisit.odPower?.axis || '—'}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-teal-300">
                    <span className="text-[10px] font-bold text-teal-600 uppercase">Current ({currVisit.visitDate})</span>
                    <p className="text-base font-bold text-teal-900 mt-1">
                      SPH {currVisit.odPower?.sph || '0.00'}
                    </p>
                    <p className="text-xs text-teal-700">
                      CYL {currVisit.odPower?.cyl || '0.00'} | Axis {currVisit.odPower?.axis || '—'}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-center items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">SPH Net Change</span>
                    <p className={`text-base font-bold mt-1 ${comparison.od.sphChange.startsWith('+') ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {comparison.od.sphChange} D
                    </p>
                    <span className="text-[10px] text-slate-400">CYL Change: {comparison.od.cylChange} D</span>
                  </div>
                </div>
              </div>

              {/* Left Eye (OS) Comparison */}
              <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-700" />
                    <span className="font-bold text-sm text-blue-900">Left Eye (OS - বাম চোখ)</span>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                    OS Power Shift
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Previous ({prevVisit.visitDate})</span>
                    <p className="text-base font-bold text-slate-700 mt-1">
                      SPH {prevVisit.osPower?.sph || '0.00'}
                    </p>
                    <p className="text-xs text-slate-500">
                      CYL {prevVisit.osPower?.cyl || '0.00'} | Axis {prevVisit.osPower?.axis || '—'}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-blue-300">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Current ({currVisit.visitDate})</span>
                    <p className="text-base font-bold text-blue-900 mt-1">
                      SPH {currVisit.osPower?.sph || '0.00'}
                    </p>
                    <p className="text-xs text-blue-700">
                      CYL {currVisit.osPower?.cyl || '0.00'} | Axis {currVisit.osPower?.axis || '—'}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-center items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">SPH Net Change</span>
                    <p className={`text-base font-bold mt-1 ${comparison.os.sphChange.startsWith('+') ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {comparison.os.sphChange} D
                    </p>
                    <span className="text-[10px] text-slate-400">CYL Change: {comparison.os.cylChange} D</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  <strong>AI Refraction Insight:</strong> Power change is within standard annual drift. Progressive or Anti-fatigue blue cut lenses recommended for sustained near tasks.
                </span>
              </div>

            </div>
          ) : currVisit ? (
            <div className="bg-slate-50 p-6 rounded-2xl text-center space-y-2 border border-slate-200">
              <FileText className="w-8 h-8 text-teal-600 mx-auto" />
              <p className="text-sm font-bold text-slate-800">Only 1 Prescription recorded for this patient.</p>
              <p className="text-xs text-slate-500">
                Current Power: OD SPH {currVisit.odPower?.sph || '0.00'} / OS SPH {currVisit.osPower?.sph || '0.00'} ({currVisit.visitDate})
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-2xl text-center space-y-2 border border-slate-200">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No clinical prescription records found for this patient.</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
