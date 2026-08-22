import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Glasses,
  ShoppingBag,
  FileText,
  MessageCircle,
  Stethoscope,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckCircle2,
  FileCheck,
  ArrowLeftRight,
  Sparkles,
  AlertCircle,
  History,
  Scale
} from 'lucide-react';
import { ClinicalVisit, EyePower } from '../types';

// Helper to safely parse diopters from string values (e.g. "-1.25", "+2.00", "Plano", "DS")
const parseDiopter = (val?: string): number | null => {
  if (!val) return null;
  const trimmed = val.trim().toLowerCase();
  if (trimmed === 'plano' || trimmed === 'ds' || trimmed === '0' || trimmed === '0.00' || trimmed === 'nil') return 0;
  const num = parseFloat(trimmed.replace(/[^\d.-]/g, ''));
  return isNaN(num) ? null : num;
};

// Helper to parse axis
const parseAxis = (val?: string): number | null => {
  if (!val) return null;
  const num = parseInt(val.replace(/[^\d]/g, ''), 10);
  return isNaN(num) ? null : num;
};

// Helper for SPH / CYL / ADD delta calculation and classification
interface DeltaResult {
  hasChange: boolean;
  deltaNum: number;
  text: string;
  badgeClass: string;
  indicator: 'increased' | 'decreased' | 'stable' | 'unknown';
}

const calculateDiopterDelta = (currentVal?: string, prevVal?: string, type: 'sph' | 'cyl' | 'add' = 'sph'): DeltaResult => {
  const curr = parseDiopter(currentVal);
  const prev = parseDiopter(prevVal);

  if (curr === null || prev === null) {
    return {
      hasChange: false,
      deltaNum: 0,
      text: 'No prior data',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
      indicator: 'unknown'
    };
  }

  const diff = Number((curr - prev).toFixed(2));

  if (Math.abs(diff) < 0.01) {
    return {
      hasChange: false,
      deltaNum: 0,
      text: '0.00 D (Stable)',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
      indicator: 'stable'
    };
  }

  const formatted = diff > 0 ? `+${diff.toFixed(2)} D` : `${diff.toFixed(2)} D`;

  if (type === 'sph') {
    if (diff < 0) {
      return {
        hasChange: true,
        deltaNum: diff,
        text: `${formatted} (Myopic Shift)`,
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
        indicator: 'decreased'
      };
    } else {
      return {
        hasChange: true,
        deltaNum: diff,
        text: `${formatted} (Hyperopic Shift)`,
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-300 font-bold',
        indicator: 'increased'
      };
    }
  } else if (type === 'cyl') {
    return {
      hasChange: true,
      deltaNum: diff,
      text: `${formatted} (Cyl Var)`,
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-300 font-bold',
      indicator: diff > 0 ? 'increased' : 'decreased'
    };
  } else {
    // ADD
    return {
      hasChange: true,
      deltaNum: diff,
      text: `${formatted} (Add Shift)`,
      badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300 font-bold',
      indicator: diff > 0 ? 'increased' : 'decreased'
    };
  }
};

const calculateAxisDelta = (currentVal?: string, prevVal?: string): { text: string; badgeClass: string } => {
  const curr = parseAxis(currentVal);
  const prev = parseAxis(prevVal);

  if (curr === null || prev === null) {
    return { text: '-', badgeClass: 'bg-slate-100 text-slate-500' };
  }

  const diff = curr - prev;
  if (diff === 0) {
    return { text: '0° (No Rotation)', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }

  const formatted = diff > 0 ? `+${diff}°` : `${diff}°`;
  return {
    text: `${formatted} Rotation`,
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold'
  };
};

export const Patient360Modal: React.FC = () => {
  const {
    selectedPatientFor360,
    setSelectedPatientFor360,
    clinicalVisits,
    spectacleOrders,
    retailSales,
    loadPatientIntoClinical,
    setQuickModal,
    setPrintModalData
  } = useErp();

  // State for comparison view
  const [selectedPrevIndex, setSelectedPrevIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'comparison' | 'timeline'>('comparison');

  if (!selectedPatientFor360) return null;

  const patient = selectedPatientFor360;

  // Filter patient's historical records, sorted chronologically (latest first)
  const patientVisits: ClinicalVisit[] = clinicalVisits
    .filter(v => v.mrd === patient.mrd)
    .sort((a, b) => new Date(b.visitDate || b.timestamp).getTime() - new Date(a.visitDate || a.timestamp).getTime());

  const patientOrders = spectacleOrders.filter(o => o.mrd === patient.mrd);
  const patientSales = retailSales.filter(s => s.mrd === patient.mrd);

  const defaultEyePower: EyePower = {
    sph: '0.00',
    cyl: '0.00',
    axis: '-',
    add: '-',
    distanceVa: '6/6',
    nearVa: 'N6',
    pd: '-'
  };

  const currentVisit = patientVisits[0];
  const previousVisits = patientVisits.slice(1);
  const comparedPrevVisit = previousVisits[selectedPrevIndex] || previousVisits[0];

  const currentOd = currentVisit?.odPower || defaultEyePower;
  const currentOs = currentVisit?.osPower || defaultEyePower;
  const prevOd = comparedPrevVisit?.odPower || defaultEyePower;
  const prevOs = comparedPrevVisit?.osPower || defaultEyePower;

  const handleWhatsApp = () => {
    const cleanMobile = patient.mobile?.replace(/[^0-9]/g, '') || '';
    const fullNumber = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const msg = encodeURIComponent(
      `Hello ${patient.name}, greetings from Paharpur Eye Care! Please let us know if you need any assistance regarding your eye health, prescription, or spectacle order.`
    );
    window.open(`https://wa.me/${fullNumber}?text=${msg}`, '_blank');
  };

  const handleStartConsult = () => {
    loadPatientIntoClinical(patient.mrd);
    setSelectedPatientFor360(null);
  };

  const handleBookSpectacle = () => {
    loadPatientIntoClinical(patient.mrd);
    setQuickModal('new-order');
    setSelectedPatientFor360(null);
  };

  // Helper for computing summary notes
  const getRefractionInsight = () => {
    if (!currentVisit || !comparedPrevVisit) return null;

    const odSphDelta = calculateDiopterDelta(currentOd.sph, prevOd.sph, 'sph');
    const osSphDelta = calculateDiopterDelta(currentOs.sph, prevOs.sph, 'sph');
    const odAddDelta = calculateDiopterDelta(currentOd.add, prevOd.add, 'add');

    const currDate = new Date(currentVisit.visitDate || currentVisit.timestamp || Date.now()).getTime();
    const prevDate = new Date(comparedPrevVisit.visitDate || comparedPrevVisit.timestamp || Date.now()).getTime();
    const daysElapsed = Math.max(0, Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24)));
    const monthsElapsed = Math.round(daysElapsed / 30.4);

    return {
      odSphDelta,
      osSphDelta,
      odAddDelta,
      daysElapsed,
      monthsElapsed
    };
  };

  const insight = getRefractionInsight();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/30 border border-teal-400/40 text-teal-200 flex items-center justify-center font-black text-xl shadow-inner">
              {patient.name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{patient.name}</h2>
                <span className="bg-teal-400 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                  {patient.mrd}
                </span>
                <span className="bg-white/10 text-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                  {patient.status}
                </span>
              </div>
              <p className="text-xs text-teal-200 mt-0.5">
                {patient.age} Years • {patient.gender} • Registered on {patient.registrationDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={() => setSelectedPatientFor360(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Demographics & Contact Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</span>
              <p className="text-xs font-extrabold text-slate-900 mt-0.5">{patient.mobile}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Location / Village</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                {patient.village || '-'}, {patient.district}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Occupation</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{patient.occupation || 'General'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Referred By</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{patient.referredBy || 'Self / Direct'}</p>
            </div>
          </div>

          {/* 1. HISTORICAL REFRACTION POWER SIDE-BY-SIDE COMPARISON MODULE */}
          <div className="bg-white rounded-2xl border-2 border-teal-100 shadow-xs overflow-hidden space-y-4 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
                    <Scale className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                    Refraction Power Historical Comparison
                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      চোখের পাওয়ারের তুলনামূলক বিশ্লেষণ
                    </span>
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Side-by-side progression analysis (OD / OS Sphere, Cylinder, Axis, Add & VA) over time.
                </p>
              </div>

              {/* Toggle Subtabs & Baseline Selector */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => setActiveTab('comparison')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      activeTab === 'comparison'
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Side-by-Side Comparison
                  </button>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      activeTab === 'timeline'
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Visits Log ({patientVisits.length})
                  </button>
                </div>
              </div>
            </div>

            {/* If No Clinical Visits Exist */}
            {patientVisits.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                <Eye className="w-10 h-10 text-slate-400 mx-auto" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">No Recorded Refractions Yet</h4>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-md mx-auto">
                    This patient does not have any recorded prescription or refractive examination on file yet.
                  </p>
                </div>
                <button
                  onClick={handleStartConsult}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Perform Initial Refraction & Eye Test
                </button>
              </div>
            ) : patientVisits.length === 1 ? (
              /* If Only 1 Visit Exists (Initial Baseline) */
              <div className="space-y-4">
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-amber-900 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Initial Baseline Examination on Record:</strong> Only one clinical refraction visit has been logged ({currentVisit.visitDate} by {currentVisit.doctor}). A comparative side-by-side progression delta will automatically calculate when the patient completes their next follow-up examination.
                  </div>
                </div>

                {/* Single Visit Power Card */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-white font-bold text-[11px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Eye</th>
                        <th className="py-2.5 px-3">SPH (Sphere)</th>
                        <th className="py-2.5 px-3">CYL (Cylinder)</th>
                        <th className="py-2.5 px-3">AXIS</th>
                        <th className="py-2.5 px-3">ADD (Near)</th>
                        <th className="py-2.5 px-3">Distance VA</th>
                        <th className="py-2.5 px-3">Near VA</th>
                        <th className="py-2.5 px-3">PD</th>
                        <th className="py-2.5 px-3">IOP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="bg-teal-50/40">
                        <td className="py-2.5 px-3 font-black text-teal-900">OD (Right Eye)</td>
                        <td className="py-2.5 px-3 font-black text-slate-900">{currentOd.sph || '0.00'}</td>
                        <td className="py-2.5 px-3 font-black text-slate-900">{currentOd.cyl || '0.00'}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{currentOd.axis || '-'}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{currentOd.add || '-'}</td>
                        <td className="py-2.5 px-3 font-semibold text-teal-800">{currentOd.distanceVa || '6/6'}</td>
                        <td className="py-2.5 px-3 text-slate-700">{currentOd.nearVa || 'N6'}</td>
                        <td className="py-2.5 px-3 text-slate-700">{currentOd.pd || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-700">{currentVisit?.examination?.iopOd || '-'}</td>
                      </tr>
                      <tr className="bg-blue-50/40">
                        <td className="py-2.5 px-3 font-black text-blue-900">OS (Left Eye)</td>
                        <td className="py-2.5 px-3 font-black text-slate-900">{currentOs.sph || '0.00'}</td>
                        <td className="py-2.5 px-3 font-black text-slate-900">{currentOs.cyl || '0.00'}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{currentOs.axis || '-'}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{currentOs.add || '-'}</td>
                        <td className="py-2.5 px-3 font-semibold text-blue-800">{currentOs.distanceVa || '6/6'}</td>
                        <td className="py-2.5 px-3 text-slate-700">{currentOs.nearVa || 'N6'}</td>
                        <td className="py-2.5 px-3 text-slate-700">{currentOs.pd || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-700">{currentVisit?.examination?.iopOs || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'comparison' ? (
              /* Multiple Visits: Rich Side-by-Side Comparison Matrix */
              <div className="space-y-4">
                {/* Comparison Control Toolbar */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Compare Current Rx With:
                    </span>
                    <select
                      value={selectedPrevIndex}
                      onChange={e => setSelectedPrevIndex(Number(e.target.value))}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 shadow-2xs"
                    >
                      {previousVisits.map((v, idx) => (
                        <option key={v.visitId} value={idx}>
                          {v.visitDate} • {v.doctor} ({v.visitType})
                        </option>
                      ))}
                    </select>
                  </div>

                  {insight && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>
                        Interval: <strong className="text-slate-900">{insight.monthsElapsed} months</strong> ({insight.daysElapsed} days elapsed)
                      </span>
                    </div>
                  )}
                </div>

                {/* SIDE-BY-SIDE COMPARISON TABLES FOR OD & OS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* OD (Right Eye) Comparison Card */}
                  <div className="border border-teal-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                    <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white px-3.5 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-teal-500/30 text-teal-100 flex items-center justify-center font-black text-xs border border-teal-400/40">
                          OD
                        </span>
                        <div>
                          <h4 className="font-extrabold text-xs text-white">Right Eye (OD / ডান চোখ)</h4>
                          <span className="text-[10px] text-teal-200">Refractive Power Evolution</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-teal-900/60 px-2 py-0.5 rounded text-teal-200 font-semibold border border-teal-600/50">
                        PD: {currentOd.pd || '-'} mm
                      </span>
                    </div>

                    <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3">Parameter</th>
                            <th className="py-2 px-3 bg-slate-200/60 text-slate-800">
                              Previous ({comparedPrevVisit?.visitDate || '-'})
                            </th>
                            <th className="py-2 px-3 bg-teal-50 text-teal-900">
                              Current ({currentVisit?.visitDate || '-'})
                            </th>
                            <th className="py-2 px-3 text-right">Variance / Delta (Δ)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {/* SPH */}
                          {(() => {
                            const delta = calculateDiopterDelta(currentOd.sph, prevOd.sph, 'sph');
                            return (
                              <tr className="hover:bg-slate-50/80">
                                <td className="py-2 px-3 font-bold text-slate-700">SPH (Sphere)</td>
                                <td className="py-2 px-3 bg-slate-50 font-medium text-slate-700">
                                  {prevOd.sph || '0.00'}
                                </td>
                                <td className="py-2 px-3 bg-teal-50/40 font-black text-slate-900">
                                  {currentOd.sph || '0.00'}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] border ${delta.badgeClass}`}>
                                    {delta.text}
                                  </span>
                                </td>
                              </tr>
                            );
                          })()}

                          {/* CYL */}
                          {(() => {
                            const delta = calculateDiopterDelta(currentOd.cyl, prevOd.cyl, 'cyl');
                            return (
                              <tr className="hover:bg-slate-50/80">
                                <td className="py-2 px-3 font-bold text-slate-700">CYL (Cylinder)</td>
                                <td className="py-2 px-3 bg-slate-50 font-medium text-slate-700">
                                  {prevOd.cyl || '0.00'}
                                </td>
                                <td className="py-2 px-3 bg-teal-50/40 font-black text-slate-900">
                                  {currentOd.cyl || '0.00'}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] border ${delta.badgeClass}`}>
                                    {delta.text}
                                  </span>
                                </td>
                              </tr>
                            );
                          })()}

                          {/* AXIS */}
                          {(() => {
                            const delta = calculateAxisDelta(currentOd.axis, prevOd.axis);
                            return (
                              <tr className="hover:bg-slate-50/80">
                                <td className="py-2 px-3 font-bold text-slate-700">AXIS (Degree)</td>
                                <td className="py-2 px-3 bg-slate-50 font-medium text-slate-700">
                                  {prevOd.axis || '-'}
                                </td>
                                <td className="py-2 px-3 bg-teal-50/40 font-black text-slate-900">
                                  {currentOd.axis || '-'}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] border ${delta.badgeClass}`}>
                                    {delta.text}
                                  </span>
                                </td>
                              </tr>
                            );
                          })()}

                          {/* ADD */}
                          {(() => {
                            const delta = calculateDiopterDelta(currentOd.add, prevOd.add, 'add');
                            return (
                              <tr className="hover:bg-slate-50/80">
                                <td className="py-2 px-3 font-bold text-slate-700">ADD (Near)</td>
                                <td className="py-2 px-3 bg-slate-50 font-medium text-slate-700">
                                  {prevOd.add || '-'}
                                </td>
                                <td className="py-2 px-3 bg-teal-50/40 font-black text-slate-900">
                                  {currentOd.add || '-'}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] border ${delta.badgeClass}`}>
                                    {delta.text}
                                  </span>
                                </td>
                              </tr>
                            );
                          })()}

                          {/* VA & IOP */}
                          <tr className="hover:bg-slate-50/80 bg-slate-50/30">
                            <td className="py-2 px-3 font-bold text-slate-700">Distance & Near VA</td>
                            <td className="py-2 px-3 bg-slate-50 text-slate-600 font-medium">
                              {prevOd.distanceVa || '6/6'} / {prevOd.nearVa || 'N6'}
                            </td>
                            <td className="py-2 px-3 bg-teal-50/40 font-bold text-teal-800">
                              {currentOd.distanceVa || '6/6'} / {currentOd.nearVa || 'N6'}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span className="text-[10px] text-slate-600 font-semibold">
                                {currentOd.distanceVa === prevOd.distanceVa ? 'Maintained 6/6' : 'Acuity Shift'}
                              </span>
                            </td>
                          </tr>

                          <tr className="hover:bg-slate-50/80">
                            <td className="py-2 px-3 font-bold text-slate-700">IOP (Intraocular Pressure)</td>
                            <td className="py-2 px-3 bg-slate-50 text-slate-600">
                              {comparedPrevVisit?.examination?.iopOd || '-'}
                            </td>
                            <td className="py-2 px-3 bg-teal-50/40 font-semibold text-slate-800">
                              {currentVisit?.examination?.iopOd || '-'}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span className="text-[10px] text-slate-500">Normal Range</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* OS (Left Eye) Comparison Card */}
                  <div className="border border-blue-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white px-3.5 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-500/30 text-blue-100 flex items-center justify-center font-black text-xs border border-blue-400/40">
                          OS
                        </span>
                        <div>
                          <h4 className="font-extrabold text-xs text-white">Left Eye (OS / বাম চোখ)</h4>
                          <span className="text-[10px] text-blue-200">Refractive Power Evolution</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-blue-950/60 px-2 py-0.5 rounded text-blue-200 font-semibold border border-blue-600/50">
                        PD: {currentOs.pd || '-'} mm
                      </span>
                    </div>

                    <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3">Parameter</th>
                            <th className="py-2 px-3 bg-slate-200/60 text-slate-800">
                              Previous ({comparedPrevVisit?.visitDate || '-'})
                            </th>
                            <th className="py-2 px-3 bg-blue-50 text-blue-900">
                              Current ({currentVisit?.visitDate || '-'})
                            </th>
                            <th className="py-2 px-3 text-right">Variance / Delta (Δ)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {/* SPH */}
                          {(() => {
                            const delta = calculateDiopterDelta(currentOs.sph, prevOs.sph, 'sph');
                            return (
                              <tr className="hover:bg-slate-50/80">
                                <td className="py-2 px-3 font-bold text-slate-700">SPH (Sphere)</td>
                                <td className="py-2 px-3 bg-slate-50 font-medium text-slate-700">
                                  {prevOs.sph || '0.00'}
                                </td>
                                <td className="py-2 px-3 bg-blue-50/40 font-black text-slate-900">
                                  {currentOs.sph || '0.00'}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] border ${delta.badgeClass}`}>
                                    {delta.text}
                                  </span>
                                </td>
                              </tr>
                            );
                          })()}

                          {/* CYL */}
                          {(() => {
                            const delta = calculateDiopterDelta(currentOs.cyl, prevOs.cyl, 'cyl');
                            return (
                              <tr className="hover:bg-slate-50/80">
                                <td className="py-2 px-3 font-bold text-slate-700">CYL (Cylinder)</td>
                                <td className="py-2 px-3 bg-slate-50 font-medium text-slate-700">
                                  {prevOs.cyl || '0.00'}
                                </td>
                                <td className="py-2 px-3 bg-blue-50/40 font-black text-slate-900">
                                  {currentOs.cyl || '0.00'}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] border ${delta.badgeClass}`}>
                                    {delta.text}
                                  </span>
                                </td>
                              </tr>
                            );
                          })()}

                          {/* AXIS */}
                          {(() => {
                            const delta = calculateAxisDelta(currentOs.axis, prevOs.axis);
                            return (
                              <tr className="hover:bg-slate-50/80">
                                <td className="py-2 px-3 font-bold text-slate-700">AXIS (Degree)</td>
                                <td className="py-2 px-3 bg-slate-50 font-medium text-slate-700">
                                  {prevOs.axis || '-'}
                                </td>
                                <td className="py-2 px-3 bg-blue-50/40 font-black text-slate-900">
                                  {currentOs.axis || '-'}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] border ${delta.badgeClass}`}>
                                    {delta.text}
                                  </span>
                                </td>
                              </tr>
                            );
                          })()}

                          {/* ADD */}
                          {(() => {
                            const delta = calculateDiopterDelta(currentOs.add, prevOs.add, 'add');
                            return (
                              <tr className="hover:bg-slate-50/80">
                                <td className="py-2 px-3 font-bold text-slate-700">ADD (Near)</td>
                                <td className="py-2 px-3 bg-slate-50 font-medium text-slate-700">
                                  {prevOs.add || '-'}
                                </td>
                                <td className="py-2 px-3 bg-blue-50/40 font-black text-slate-900">
                                  {currentOs.add || '-'}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] border ${delta.badgeClass}`}>
                                    {delta.text}
                                  </span>
                                </td>
                              </tr>
                            );
                          })()}

                          {/* VA & IOP */}
                          <tr className="hover:bg-slate-50/80 bg-slate-50/30">
                            <td className="py-2 px-3 font-bold text-slate-700">Distance & Near VA</td>
                            <td className="py-2 px-3 bg-slate-50 text-slate-600 font-medium">
                              {prevOs.distanceVa || '6/6'} / {prevOs.nearVa || 'N6'}
                            </td>
                            <td className="py-2 px-3 bg-blue-50/40 font-bold text-blue-800">
                              {currentOs.distanceVa || '6/6'} / {currentOs.nearVa || 'N6'}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span className="text-[10px] text-slate-600 font-semibold">
                                {currentOs.distanceVa === prevOs.distanceVa ? 'Maintained 6/6' : 'Acuity Shift'}
                              </span>
                            </td>
                          </tr>

                          <tr className="hover:bg-slate-50/80">
                            <td className="py-2 px-3 font-bold text-slate-700">IOP (Intraocular Pressure)</td>
                            <td className="py-2 px-3 bg-slate-50 text-slate-600">
                              {comparedPrevVisit?.examination?.iopOs || '-'}
                            </td>
                            <td className="py-2 px-3 bg-blue-50/40 font-semibold text-slate-800">
                              {currentVisit?.examination?.iopOs || '-'}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span className="text-[10px] text-slate-500">Normal Range</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* DOCTOR CLINICAL PROGRESSION SUMMARY BAR */}
                <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-800">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-xs text-white">Clinical Vision Progression Summary</h5>
                      <p className="text-[11px] text-teal-200 mt-0.5">
                        {currentVisit?.diagnosis?.join(', ') || currentVisit?.customDiagnosis || 'Refractive Evaluation'} • Last exam by {currentVisit?.doctor || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => currentVisit && setPrintModalData({ type: 'prescription', data: currentVisit })}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      Print Current Rx
                    </button>
                    <button
                      onClick={handleStartConsult}
                      className="px-3 py-1.5 bg-white text-slate-950 hover:bg-teal-100 text-[11px] font-extrabold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                      Load Power into Consult
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* All Visits Chronological Timeline View */
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold text-[11px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Date & ID</th>
                      <th className="py-2.5 px-3">Doctor & Type</th>
                      <th className="py-2.5 px-3">Eye</th>
                      <th className="py-2.5 px-3">SPH</th>
                      <th className="py-2.5 px-3">CYL</th>
                      <th className="py-2.5 px-3">AXIS</th>
                      <th className="py-2.5 px-3">ADD</th>
                      <th className="py-2.5 px-3">VA</th>
                      <th className="py-2.5 px-3">Diagnosis</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {patientVisits.map((visit, vIdx) => (
                      <React.Fragment key={visit.visitId}>
                        {/* OD Row */}
                        <tr className={vIdx === 0 ? 'bg-teal-50/50' : 'bg-slate-50/30'}>
                          <td rowSpan={2} className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200 bg-white">
                            <div className="flex items-center gap-1">
                              {visit.visitDate}
                              {vIdx === 0 && (
                                <span className="bg-teal-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                                  LATEST
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500">{visit.visitId}</span>
                          </td>
                          <td rowSpan={2} className="py-2.5 px-3 text-slate-700 border-r border-slate-200 bg-white">
                            <div className="font-semibold text-slate-900">{visit.doctor}</div>
                            <span className="text-[10px] text-teal-700">{visit.visitType}</span>
                          </td>
                          <td className="py-1.5 px-3 font-black text-teal-900 text-[11px]">OD (Right)</td>
                          <td className="py-1.5 px-3 font-bold text-slate-800">{visit.odPower?.sph || '0.00'}</td>
                          <td className="py-1.5 px-3 font-bold text-slate-800">{visit.odPower?.cyl || '0.00'}</td>
                          <td className="py-1.5 px-3 font-bold text-slate-800">{visit.odPower?.axis || '-'}</td>
                          <td className="py-1.5 px-3 font-bold text-slate-800">{visit.odPower?.add || '-'}</td>
                          <td className="py-1.5 px-3 text-teal-800 font-semibold">{visit.odPower?.distanceVa || '6/6'}</td>
                          <td rowSpan={2} className="py-2.5 px-3 text-slate-700 border-l border-slate-200 bg-white max-w-xs">
                            <div className="font-semibold text-slate-900 line-clamp-2">
                              {visit.diagnosis?.join(', ') || visit.customDiagnosis || 'Refractive Correction'}
                            </div>
                          </td>
                          <td rowSpan={2} className="py-2.5 px-3 text-right border-l border-slate-200 bg-white">
                            <div className="flex flex-col items-end gap-1">
                              <button
                                onClick={() => {
                                  if (vIdx > 0) {
                                    setSelectedPrevIndex(vIdx - 1);
                                    setActiveTab('comparison');
                                  }
                                }}
                                disabled={vIdx === 0}
                                className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                                  vIdx === 0
                                    ? 'text-slate-400 bg-slate-100 cursor-default'
                                    : 'text-teal-700 hover:bg-teal-50 border border-teal-200'
                                }`}
                              >
                                {vIdx === 0 ? 'Current Baseline' : 'Compare with Current'}
                              </button>
                              <button
                                onClick={() => setPrintModalData({ type: 'prescription', data: visit })}
                                className="text-[10px] font-bold text-slate-600 hover:text-teal-700 underline"
                              >
                                Print Slip
                              </button>
                            </div>
                          </td>
                        </tr>
                        {/* OS Row */}
                        <tr className={`${vIdx === 0 ? 'bg-blue-50/50' : 'bg-slate-50/30'} border-b-2 border-slate-200`}>
                          <td className="py-1.5 px-3 font-black text-blue-900 text-[11px]">OS (Left)</td>
                          <td className="py-1.5 px-3 font-bold text-slate-800">{visit.osPower?.sph || '0.00'}</td>
                          <td className="py-1.5 px-3 font-bold text-slate-800">{visit.osPower?.cyl || '0.00'}</td>
                          <td className="py-1.5 px-3 font-bold text-slate-800">{visit.osPower?.axis || '-'}</td>
                          <td className="py-1.5 px-3 font-bold text-slate-800">{visit.osPower?.add || '-'}</td>
                          <td className="py-1.5 px-3 text-blue-800 font-semibold">{visit.osPower?.distanceVa || '6/6'}</td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 2. CLINICAL CONSULTATION HISTORY & MEDICINES */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              Clinical Consultation & Diagnosis History ({patientVisits.length})
            </h3>

            {patientVisits.length === 0 ? (
              <p className="text-slate-400 text-center py-4 bg-slate-50 rounded-xl">
                No clinical consultations recorded yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {patientVisits.map(visit => (
                  <div key={visit.visitId} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{visit.visitId}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-medium text-slate-600">{visit.visitDate} ({visit.doctor})</span>
                        <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                          {visit.visitType}
                        </span>
                      </div>
                      <button
                        onClick={() => setPrintModalData({ type: 'prescription', data: visit })}
                        className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Print Rx Slip
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-700">
                      <strong>Diagnosis:</strong> {visit.diagnosis?.join(', ') || visit.customDiagnosis || 'Refractive Error'}
                    </div>

                    {visit.medicines && visit.medicines.length > 0 && (
                      <div className="text-[11px] text-slate-600">
                        <strong>Prescribed Meds:</strong> {visit.medicines.map(m => `${m.name} (${m.frequency})`).join(' • ')}
                      </div>
                    )}

                    {visit.advice && (
                      <div className="text-[11px] text-slate-500 italic">
                        <strong>Advice:</strong> {visit.advice}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. SPECTACLE ORDERS HISTORY */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
              <Glasses className="w-4 h-4 text-amber-600" />
              Spectacle Orders & Optical Purchases ({patientOrders.length})
            </h3>

            {patientOrders.length === 0 ? (
              <p className="text-slate-400 text-center py-4 bg-slate-50 rounded-xl">
                No spectacle orders placed yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {patientOrders.map(ord => (
                  <div key={ord.orderId} className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">{ord.orderId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-slate-700 font-semibold">
                      Frame: {ord.frameBrand} • Lens: {ord.lensBrand}
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-amber-100">
                      <span>Total: <strong>₹{ord.total}</strong></span>
                      <span>Paid: <strong className="text-emerald-700">₹{ord.advance}</strong></span>
                      {ord.due > 0 && <span className="text-rose-600 font-bold">Due: ₹{ord.due}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">
            MRD: <strong className="text-slate-900">{patient.mrd}</strong> • {patientVisits.length} Refraction(s) on file
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookSpectacle}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Glasses className="w-4 h-4" />
              + Book Spectacle Order
            </button>

            <button
              onClick={handleStartConsult}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Stethoscope className="w-4 h-4" />
              ⚡ Start Clinical Consultation
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
