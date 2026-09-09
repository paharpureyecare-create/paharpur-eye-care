import React, { useState } from 'react';
import { ClinicalExamination, EyePower } from '../../types';
import {
  DISTANCE_VA_OPTIONS,
  LOW_VISION_OPTIONS,
  NEAR_VA_OPTIONS,
  NEAR_TEST_DISTANCES,
  calculatePinholeImprovement
} from '../../data/clinicalMasterData';
import { ClinicalSectionId } from '../../types/clinicalSections';
import { ClinicalSectionCard } from './ClinicalSectionCard';
import { Eye, Check, ArrowRight, Glasses, Activity, Zap, Copy, Search, Plus, Minus, Layers, CheckCircle2 } from 'lucide-react';
import { FindMatchingLensesModal } from '../FindMatchingLensesModal';

interface Props {
  examination: ClinicalExamination;
  odPower: EyePower;
  osPower: EyePower;
  selectedSections: Record<ClinicalSectionId, boolean>;
  onToggleSection: (id: ClinicalSectionId) => void;
  onExamChange: (updater: (prev: ClinicalExamination) => ClinicalExamination) => void;
  onPowerChange: (eye: 'od' | 'os', field: keyof EyePower, val: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const VisualAcuityRefractionSection: React.FC<Props> = ({
  examination,
  odPower,
  osPower,
  selectedSections,
  onToggleSection,
  onExamChange,
  onPowerChange,
  showToast
}) => {
  const [showFindLensesModal, setShowFindLensesModal] = useState(false);
  const [activeChipCategory, setActiveChipCategory] = useState<'sph' | 'cyl' | 'axis' | 'add'>('sph');

  const stepPower = (eye: 'od' | 'os', field: 'sph' | 'cyl' | 'add', delta: number) => {
    const currentVal = (eye === 'od' ? odPower[field] : osPower[field]) || '';
    let num = parseFloat(currentVal.replace('+', '').trim());
    if (isNaN(num)) num = 0;
    const nextVal = Math.round((num + delta) * 100) / 100;
    const formatted = nextVal > 0 ? `+${nextVal.toFixed(2)}` : nextVal < 0 ? nextVal.toFixed(2) : '0.00';
    onPowerChange(eye, field, formatted);
  };

  const handleCopyOdToOs = () => {
    onPowerChange('os', 'sph', odPower.sph || '');
    onPowerChange('os', 'cyl', odPower.cyl || '');
    onPowerChange('os', 'axis', odPower.axis || '');
    onPowerChange('os', 'add', odPower.add || '');
    if (odPower.distanceVa) onPowerChange('os', 'distanceVa', odPower.distanceVa);
    if (odPower.nearVa) onPowerChange('os', 'nearVa', odPower.nearVa);
    showToast('Copied OD (Right Eye) prescription values to OS (Left Eye)', 'success');
  };

  const distVa = examination?.distanceVa || {
    od: { unaided: '6/18', withCorrection: '6/6', pinhole: '6/6' },
    os: { unaided: '6/18', withCorrection: '6/6', pinhole: '6/6' },
    ou: { unaided: '6/12', withCorrection: '6/6' },
    notes: ''
  };

  const pinhole = examination?.pinholeExam || {
    odBefore: distVa.od?.unaided || '6/18',
    odAfter: distVa.od?.pinhole || '6/6',
    osBefore: distVa.os?.unaided || '6/18',
    osAfter: distVa.os?.pinhole || '6/6',
    odImprovement: 'Improved',
    osImprovement: 'Improved',
    notes: ''
  };

  const nearVision = examination?.nearVisionExam || {
    odUnaided: 'N10',
    odWithCorrection: 'N6',
    osUnaided: 'N10',
    osWithCorrection: 'N6',
    ouUnaided: 'N8',
    ouWithCorrection: 'N6',
    testingDistance: '35 cm',
    notes: ''
  };

  const refStages = examination?.refractionStages || {
    currentGlasses: {
      od: { sph: '', cyl: '', axis: '', add: '', va: '' },
      os: { sph: '', cyl: '', axis: '', add: '', va: '' },
      notes: ''
    },
    autoRefraction: {
      od: { sph: '', cyl: '', axis: '' },
      os: { sph: '', cyl: '', axis: '' },
      notes: ''
    },
    retinoscopy: {
      od: { sph: '', cyl: '', axis: '', workingDist: '' },
      os: { sph: '', cyl: '', axis: '', workingDist: '' },
      notes: ''
    },
    subjectiveRefraction: {
      od: { sph: '', cyl: '', axis: '', add: '', va: '' },
      os: { sph: '', cyl: '', axis: '', add: '', va: '' },
      notes: ''
    },
    finalPrescription: {
      od: { sph: odPower.sph || '', cyl: odPower.cyl || '', axis: odPower.axis || '', add: odPower.add || '', distanceVa: odPower.distanceVa || '6/6', nearVa: odPower.nearVa || 'N6', pd: odPower.pd || '31' },
      os: { sph: osPower.sph || '', cyl: osPower.cyl || '', axis: osPower.axis || '', add: osPower.add || '', distanceVa: osPower.distanceVa || '6/6', nearVa: osPower.nearVa || 'N6', pd: osPower.pd || '31' },
      pdTotal: '62',
      pdOd: '31',
      pdOs: '31',
      prescriptionDate: new Date().toISOString().split('T')[0],
      examinerName: 'Dr. S. K. Banerjee',
      examinerRole: 'Ophthalmologist'
    }
  };

  const allDistanceOptions = [...DISTANCE_VA_OPTIONS, ...LOW_VISION_OPTIONS];

  // Helper to update distance VA
  const updateDistanceVa = (eye: 'od' | 'os' | 'ou', key: 'unaided' | 'withCorrection' | 'pinhole', val: string) => {
    onExamChange(prev => {
      const current = prev.distanceVa || distVa;
      const updatedEye = { ...current[eye], [key]: val };
      const updatedDistanceVa = { ...current, [eye]: updatedEye };
      
      // Auto sync with top-level legacy fields for backward compatibility
      const legacyUpdates: Partial<ClinicalExamination> = {};
      if (eye === 'od') {
        if (key === 'unaided') legacyUpdates.vaOdWithout = val;
        if (key === 'withCorrection') legacyUpdates.vaOdWith = val;
        if (key === 'pinhole') legacyUpdates.phOd = val;
      } else if (eye === 'os') {
        if (key === 'unaided') legacyUpdates.vaOsWithout = val;
        if (key === 'withCorrection') legacyUpdates.vaOsWith = val;
        if (key === 'pinhole') legacyUpdates.phOs = val;
      }

      // Also recalculate pinhole improvement
      const pinCurrent = prev.pinholeExam || pinhole;
      const odBefore = eye === 'od' && key === 'unaided' ? val : (pinCurrent.odBefore || updatedDistanceVa.od?.unaided || '');
      const odAfter = eye === 'od' && key === 'pinhole' ? val : (pinCurrent.odAfter || updatedDistanceVa.od?.pinhole || '');
      const osBefore = eye === 'os' && key === 'unaided' ? val : (pinCurrent.osBefore || updatedDistanceVa.os?.unaided || '');
      const osAfter = eye === 'os' && key === 'pinhole' ? val : (pinCurrent.osAfter || updatedDistanceVa.os?.pinhole || '');

      const updatedPinhole = {
        ...pinCurrent,
        odBefore,
        odAfter,
        odImprovement: calculatePinholeImprovement(odBefore, odAfter),
        osBefore,
        osAfter,
        osImprovement: calculatePinholeImprovement(osBefore, osAfter)
      };

      return {
        ...prev,
        ...legacyUpdates,
        distanceVa: updatedDistanceVa,
        pinholeExam: updatedPinhole
      };
    });
  };

  // Helper to update Near Vision
  const updateNearVision = (field: keyof typeof nearVision, val: string) => {
    onExamChange(prev => {
      const current = prev.nearVisionExam || nearVision;
      const updated = { ...current, [field]: val };
      return {
        ...prev,
        nearVision: field === 'ouWithCorrection' ? val : prev.nearVision,
        nearVisionExam: updated
      };
    });
  };

  // Helper to copy values from Auto-Refraction or Subjective to Final Rx
  const copyToFinalRx = (source: 'autoRefraction' | 'subjectiveRefraction' | 'currentGlasses') => {
    const srcData = refStages[source];
    if (!srcData) return;

    if (srcData.od) {
      if (srcData.od.sph !== undefined) onPowerChange('od', 'sph', srcData.od.sph);
      if (srcData.od.cyl !== undefined) onPowerChange('od', 'cyl', srcData.od.cyl);
      if (srcData.od.axis !== undefined) onPowerChange('od', 'axis', srcData.od.axis);
      if (srcData.od.add !== undefined) onPowerChange('od', 'add', srcData.od.add);
      if (srcData.od.va !== undefined) onPowerChange('od', 'distanceVa', srcData.od.va);
    }
    if (srcData.os) {
      if (srcData.os.sph !== undefined) onPowerChange('os', 'sph', srcData.os.sph);
      if (srcData.os.cyl !== undefined) onPowerChange('os', 'cyl', srcData.os.cyl);
      if (srcData.os.axis !== undefined) onPowerChange('os', 'axis', srcData.os.axis);
      if (srcData.os.add !== undefined) onPowerChange('os', 'add', srcData.os.add);
      if (srcData.os.va !== undefined) onPowerChange('os', 'distanceVa', srcData.os.va);
    }

    showToast(`Copied ${source === 'autoRefraction' ? 'Auto-Refractor (AR)' : source === 'subjectiveRefraction' ? 'Subjective Acceptance' : 'Previous Glass'} to Final Prescription`, 'success');
  };

  // Transposition helper (Transpose Sph/Cyl/Axis)
  const transposePower = (eye: 'od' | 'os') => {
    const power = eye === 'od' ? odPower : osPower;
    const sphNum = parseFloat(power.sph || '0') || 0;
    const cylNum = parseFloat(power.cyl || '0') || 0;
    const axisNum = parseInt(power.axis || '0') || 0;

    if (cylNum === 0) {
      showToast('No cylinder power to transpose', 'info');
      return;
    }

    const newSph = (sphNum + cylNum).toFixed(2);
    const newCyl = (-cylNum).toFixed(2);
    let newAxis = (axisNum + 90) % 180;
    if (newAxis === 0) newAxis = 180;

    onPowerChange(eye, 'sph', (parseFloat(newSph) > 0 ? '+' : '') + newSph);
    onPowerChange(eye, 'cyl', (parseFloat(newCyl) > 0 ? '+' : '') + newCyl);
    onPowerChange(eye, 'axis', `${newAxis}°`);

    showToast(`Transposed ${eye.toUpperCase()} to Sph ${newSph}, Cyl ${newCyl}, Axis ${newAxis}°`);
  };

  return (
    <div className="space-y-4">
      
      {/* 2. VISUAL ACUITY - DISTANCE */}
      <ClinicalSectionCard
        id="distanceVa"
        orderNumber={2}
        title="Visual Acuity (Distance - Unaided & CC)"
        bnTitle="দূরের দৃষ্টিশক্তি (Snellen Chart 6m / 20ft)"
        category="Refraction"
        icon={<Eye className="w-4 h-4" />}
        isSelected={selectedSections.distanceVa}
        status={selectedSections.distanceVa ? 'COMPLETED' : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={`OD: ${distVa.od?.unaided || '-'} / CC: ${distVa.od?.withCorrection || '-'} • OS: ${distVa.os?.unaided || '-'} / CC: ${distVa.os?.withCorrection || '-'}`}
        rightHeaderAction={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                updateDistanceVa('od', 'unaided', '6/6');
                updateDistanceVa('od', 'withCorrection', '6/6');
                updateDistanceVa('os', 'unaided', '6/6');
                updateDistanceVa('os', 'withCorrection', '6/6');
                updateDistanceVa('ou', 'unaided', '6/6');
                updateDistanceVa('ou', 'withCorrection', '6/6');
                showToast('Set Visual Acuity to 6/6 Bilateral Normal');
              }}
              className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              ✓ 6/6 Both
            </button>
            <button
              type="button"
              onClick={() => {
                updateDistanceVa('od', 'unaided', '6/18');
                updateDistanceVa('od', 'withCorrection', '6/6');
                updateDistanceVa('os', 'unaided', '6/18');
                updateDistanceVa('os', 'withCorrection', '6/6');
                showToast('Set Common Refractive Blur 6/18');
              }}
              className="text-[11px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              🔍 6/18 Blur
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* OD (Right Eye) */}
          <div className="bg-blue-50/40 rounded-xl p-3.5 border border-blue-200">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-blue-200/80">
              <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                OD (Right Eye / ডান চোখ)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Oculus Dexter
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Unaided (SC / খালি চোখে)
                </label>
                <select
                  id="va-od-unaided"
                  value={distVa.od?.unaided || '6/18'}
                  onChange={e => updateDistanceVa('od', 'unaided', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {allDistanceOptions.map(opt => (
                    <option key={`od-un-${opt}`} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  With Correction (CC / চশমাসহ)
                </label>
                <select
                  id="va-od-cc"
                  value={distVa.od?.withCorrection || '6/6'}
                  onChange={e => updateDistanceVa('od', 'withCorrection', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {allDistanceOptions.map(opt => (
                    <option key={`od-cc-${opt}`} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* OS (Left Eye) */}
          <div className="bg-emerald-50/40 rounded-xl p-3.5 border border-emerald-200">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-emerald-200/80">
              <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                OS (Left Eye / বাম চোখ)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Oculus Sinister
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Unaided (SC / খালি চোখে)
                </label>
                <select
                  id="va-os-unaided"
                  value={distVa.os?.unaided || '6/18'}
                  onChange={e => updateDistanceVa('os', 'unaided', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {allDistanceOptions.map(opt => (
                    <option key={`os-un-${opt}`} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  With Correction (CC / চশমাসহ)
                </label>
                <select
                  id="va-os-cc"
                  value={distVa.os?.withCorrection || '6/6'}
                  onChange={e => updateDistanceVa('os', 'withCorrection', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {allDistanceOptions.map(opt => (
                    <option key={`os-cc-${opt}`} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* OU (Both Eyes Binocular) */}
          <div className="bg-purple-50/40 rounded-xl p-3.5 border border-purple-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-purple-200/80">
                <span className="text-xs font-extrabold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
                  OU (Both Eyes / দুই চোখে)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Binocular
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Binocular Unaided (SC)
                  </label>
                  <select
                    id="va-ou-unaided"
                    value={distVa.ou?.unaided || '6/12'}
                    onChange={e => updateDistanceVa('ou', 'unaided', e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {allDistanceOptions.map(opt => (
                      <option key={`ou-un-${opt}`} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Binocular With Correction (CC)
                  </label>
                  <select
                    id="va-ou-cc"
                    value={distVa.ou?.withCorrection || '6/6'}
                    onChange={e => updateDistanceVa('ou', 'withCorrection', e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {allDistanceOptions.map(opt => (
                      <option key={`ou-cc-${opt}`} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

        </div>
      </ClinicalSectionCard>

      {/* 3. PINHOLE VISION TEST */}
      <ClinicalSectionCard
        id="pinholeExam"
        orderNumber={3}
        title="Pinhole Vision Improvement Test"
        bnTitle="পিনহোল পরীক্ষা (অপটিক্যাল রিফ্র্যাক্টিভ পটেনশিয়াল চেক)"
        category="Refraction"
        icon={<Search className="w-4 h-4" />}
        isSelected={selectedSections.pinholeExam}
        status={selectedSections.pinholeExam ? 'COMPLETED' : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={`OD PH: ${distVa.od?.pinhole || '-'} • OS PH: ${distVa.os?.pinhole || '-'}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OD Pinhole */}
          <div className="bg-blue-50/30 rounded-xl p-3 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900">OD Pinhole Acuity</span>
              {pinhole.odImprovement && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  pinhole.odImprovement === 'Improved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {pinhole.odImprovement === 'Improved' ? '✓ Improved (Refractive Potential)' : pinhole.odImprovement}
                </span>
              )}
            </div>
            <select
              value={distVa.od?.pinhole || '6/6'}
              onChange={e => updateDistanceVa('od', 'pinhole', e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-bold rounded-lg p-2"
            >
              <option value="-">Not Tested (-)</option>
              {allDistanceOptions.map(opt => (
                <option key={`od-ph-s-${opt}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* OS Pinhole */}
          <div className="bg-emerald-50/30 rounded-xl p-3 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-900">OS Pinhole Acuity</span>
              {pinhole.osImprovement && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  pinhole.osImprovement === 'Improved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {pinhole.osImprovement === 'Improved' ? '✓ Improved (Refractive Potential)' : pinhole.osImprovement}
                </span>
              )}
            </div>
            <select
              value={distVa.os?.pinhole || '6/6'}
              onChange={e => updateDistanceVa('os', 'pinhole', e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-bold rounded-lg p-2"
            >
              <option value="-">Not Tested (-)</option>
              {allDistanceOptions.map(opt => (
                <option key={`os-ph-s-${opt}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 p-2 bg-slate-100 rounded-lg text-[11px] text-slate-600 font-medium">
          💡 <strong>Principle:</strong> If vision improves with Pinhole, refractive error is present; if no improvement, look for media opacity or macular/retinal defect.
        </div>
      </ClinicalSectionCard>

      {/* 4. NEAR VISION EXAMINATION */}
      <ClinicalSectionCard
        id="nearVision"
        orderNumber={4}
        title="Near Vision & Presbyopic Add (কাছের দৃষ্টিশক্তি)"
        bnTitle="N5 to N36 reading vision at 33–40 cm testing distance"
        category="Refraction"
        icon={<Glasses className="w-4 h-4" />}
        isSelected={selectedSections.nearVision}
        status={selectedSections.nearVision ? 'COMPLETED' : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={`OD: ${nearVision.odWithCorrection || '-'} • OS: ${nearVision.osWithCorrection || '-'} • OU: ${nearVision.ouWithCorrection || '-'}`}
        rightHeaderAction={
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Distance:</span>
            <select
              value={nearVision.testingDistance || '35 cm'}
              onChange={e => updateNearVision('testingDistance', e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2 py-1"
            >
              {NEAR_TEST_DISTANCES.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* OD Near */}
          <div className="bg-blue-50/30 rounded-xl p-3 border border-blue-100">
            <span className="text-xs font-extrabold text-blue-900 block mb-2">OD (Right Eye Near)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Unaided (SC)</label>
                <select
                  value={nearVision.odUnaided || 'N10'}
                  onChange={e => updateNearVision('odUnaided', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-bold rounded p-1.5"
                >
                  {NEAR_VA_OPTIONS.map(opt => <option key={`od-n-un-${opt}`} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">With Near Add</label>
                <select
                  value={nearVision.odWithCorrection || 'N6'}
                  onChange={e => updateNearVision('odWithCorrection', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-bold rounded p-1.5"
                >
                  {NEAR_VA_OPTIONS.map(opt => <option key={`od-n-cc-${opt}`} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* OS Near */}
          <div className="bg-emerald-50/30 rounded-xl p-3 border border-emerald-100">
            <span className="text-xs font-extrabold text-emerald-900 block mb-2">OS (Left Eye Near)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Unaided (SC)</label>
                <select
                  value={nearVision.osUnaided || 'N10'}
                  onChange={e => updateNearVision('osUnaided', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-bold rounded p-1.5"
                >
                  {NEAR_VA_OPTIONS.map(opt => <option key={`os-n-un-${opt}`} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">With Near Add</label>
                <select
                  value={nearVision.osWithCorrection || 'N6'}
                  onChange={e => updateNearVision('osWithCorrection', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-bold rounded p-1.5"
                >
                  {NEAR_VA_OPTIONS.map(opt => <option key={`os-n-cc-${opt}`} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* OU Near */}
          <div className="bg-purple-50/30 rounded-xl p-3 border border-purple-100">
            <span className="text-xs font-extrabold text-purple-900 block mb-2">OU (Both Eyes Near)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Binocular Unaided</label>
                <select
                  value={nearVision.ouUnaided || 'N8'}
                  onChange={e => updateNearVision('ouUnaided', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-bold rounded p-1.5"
                >
                  {NEAR_VA_OPTIONS.map(opt => <option key={`ou-n-un-${opt}`} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Binocular With Add</label>
                <select
                  value={nearVision.ouWithCorrection || 'N6'}
                  onChange={e => updateNearVision('ouWithCorrection', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-bold rounded p-1.5"
                >
                  {NEAR_VA_OPTIONS.map(opt => <option key={`ou-n-cc-${opt}`} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </ClinicalSectionCard>

      {/* 5. OBJECTIVE REFRACTION (AR / RETINOSCOPY) */}
      <ClinicalSectionCard
        id="autoRefraction"
        orderNumber={5}
        title="Objective Refraction (AR / Retinoscopy / PGP)"
        bnTitle="অটোরিফ্র্যাকশন, রেটিনোস্কোপি ও পূর্বের চশমা (PGP)"
        category="Refraction"
        icon={<Activity className="w-4 h-4" />}
        isSelected={selectedSections.autoRefraction}
        status={selectedSections.autoRefraction ? 'COMPLETED' : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={`AR OD: ${refStages.autoRefraction?.od?.sph || '-'} / OS: ${refStages.autoRefraction?.os?.sph || '-'}`}
        rightHeaderAction={
          <button
            type="button"
            onClick={() => copyToFinalRx('autoRefraction')}
            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            Copy AR → Final Rx
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-2.5 rounded-tl-lg">Method</th>
                <th className="p-2.5">Eye</th>
                <th className="p-2.5 w-20">Sph (D)</th>
                <th className="p-2.5 w-20">Cyl (D)</th>
                <th className="p-2.5 w-16">Axis</th>
                <th className="p-2.5 w-20">Add</th>
                <th className="p-2.5 w-20">VA</th>
                <th className="p-2.5 rounded-tr-lg">Notes / Distance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              
              {/* Previous Glasses (PGP) */}
              <tr className="bg-slate-50/50">
                <td rowSpan={2} className="p-2.5 font-bold text-slate-800 border-r border-slate-200">
                  Previous Glasses (PGP)
                </td>
                <td className="p-2 font-bold text-blue-700">OD</td>
                <td className="p-1.5"><input type="text" value={refStages.currentGlasses?.od?.sph || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, currentGlasses: { ...refStages.currentGlasses, od: { ...refStages.currentGlasses.od, sph: val } } } }));
                }} placeholder="—" className="w-full min-w-[70px] min-h-[38px] bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-black text-center text-slate-900" /></td>
                <td className="p-1.5"><input type="text" value={refStages.currentGlasses?.od?.cyl || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, currentGlasses: { ...refStages.currentGlasses, od: { ...refStages.currentGlasses.od, cyl: val } } } }));
                }} placeholder="—" className="w-full min-w-[70px] min-h-[38px] bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-black text-center text-indigo-900" /></td>
                <td className="p-1.5"><input type="text" value={refStages.currentGlasses?.od?.axis || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, currentGlasses: { ...refStages.currentGlasses, od: { ...refStages.currentGlasses.od, axis: val } } } }));
                }} placeholder="—" className="w-full min-w-[60px] min-h-[38px] bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-black text-center text-slate-900" /></td>
                <td className="p-1.5"><input type="text" value={refStages.currentGlasses?.od?.add || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, currentGlasses: { ...refStages.currentGlasses, od: { ...refStages.currentGlasses.od, add: val } } } }));
                }} placeholder="—" className="w-full min-w-[70px] min-h-[38px] bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-black text-center text-emerald-800" /></td>
                <td className="p-1.5"><input type="text" value={refStages.currentGlasses?.od?.va || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, currentGlasses: { ...refStages.currentGlasses, od: { ...refStages.currentGlasses.od, va: val } } } }));
                }} placeholder="6/6" className="w-full min-w-[65px] min-h-[38px] bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-bold text-center text-slate-800" /></td>
                <td rowSpan={2} className="p-1.5"><input type="text" value={refStages.currentGlasses?.notes || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, currentGlasses: { ...refStages.currentGlasses, notes: val } } }));
                }} placeholder="Wearing duration / comfort" className="w-full min-h-[38px] bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs" /></td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="p-2 font-bold text-emerald-700">OS</td>
                <td className="p-1.5"><input type="text" value={refStages.currentGlasses?.os?.sph || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, currentGlasses: { ...refStages.currentGlasses, os: { ...refStages.currentGlasses.os, sph: val } } } }));
                }} placeholder="—" className="w-full min-w-[70px] min-h-[38px] bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-black text-center text-slate-900" /></td>
                <td className="p-1.5"><input type="text" value={refStages.currentGlasses?.os?.cyl || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, currentGlasses: { ...refStages.currentGlasses, os: { ...refStages.currentGlasses.os, cyl: val } } } }));
                }} placeholder="—" className="w-full min-w-[70px] min-h-[38px] bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-black text-center text-indigo-900" /></td>
                <td className="p-1.5"><input type="text" value={refStages.currentGlasses?.os?.axis || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, currentGlasses: { ...refStages.currentGlasses, os: { ...refStages.currentGlasses.os, axis: val } } } }));
                }} placeholder="—" className="w-full min-w-[60px] min-h-[38px] bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-black text-center text-slate-900" /></td>
                <td className="p-1.5"><input type="text" value={refStages.currentGlasses?.os?.add || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, currentGlasses: { ...refStages.currentGlasses, os: { ...refStages.currentGlasses.os, add: val } } } }));
                }} placeholder="—" className="w-full min-w-[70px] min-h-[38px] bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-black text-center text-emerald-800" /></td>
                <td className="p-1.5"><input type="text" value={refStages.currentGlasses?.os?.va || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, currentGlasses: { ...refStages.currentGlasses, os: { ...refStages.currentGlasses.os, va: val } } } }));
                }} placeholder="6/6" className="w-full min-w-[65px] min-h-[38px] bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-bold text-center text-slate-800" /></td>
              </tr>

              {/* Auto-Refraction (AR) */}
              <tr className="bg-blue-50/20">
                <td rowSpan={2} className="p-2.5 font-bold text-blue-900 border-r border-slate-200">
                  Auto-Refraction (AR)
                </td>
                <td className="p-2 font-bold text-blue-700">OD</td>
                <td className="p-1.5"><input type="text" value={refStages.autoRefraction?.od?.sph || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, autoRefraction: { ...refStages.autoRefraction, od: { ...refStages.autoRefraction.od, sph: val } } } }));
                }} placeholder="—" className="w-full min-w-[70px] min-h-[38px] bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-black text-center text-slate-900" /></td>
                <td className="p-1.5"><input type="text" value={refStages.autoRefraction?.od?.cyl || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, autoRefraction: { ...refStages.autoRefraction, od: { ...refStages.autoRefraction.od, cyl: val } } } }));
                }} placeholder="—" className="w-full min-w-[70px] min-h-[38px] bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-black text-center text-indigo-900" /></td>
                <td className="p-1.5"><input type="text" value={refStages.autoRefraction?.od?.axis || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, autoRefraction: { ...refStages.autoRefraction, od: { ...refStages.autoRefraction.od, axis: val } } } }));
                }} placeholder="—" className="w-full min-w-[60px] min-h-[38px] bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-black text-center text-slate-900" /></td>
                <td className="p-1.5 text-center text-slate-400">—</td>
                <td className="p-1.5 text-center text-slate-400">—</td>
                <td rowSpan={2} className="p-1.5"><input type="text" value={refStages.autoRefraction?.notes || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, autoRefraction: { ...refStages.autoRefraction, notes: val } } }));
                }} placeholder="AR Reading (Vert. 12mm)" className="w-full min-h-[38px] bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs" /></td>
              </tr>
              <tr className="bg-blue-50/20">
                <td className="p-2 font-bold text-emerald-700">OS</td>
                <td className="p-1.5"><input type="text" value={refStages.autoRefraction?.os?.sph || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, autoRefraction: { ...refStages.autoRefraction, os: { ...refStages.autoRefraction.os, sph: val } } } }));
                }} placeholder="—" className="w-full min-w-[70px] min-h-[38px] bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-black text-center text-slate-900" /></td>
                <td className="p-1.5"><input type="text" value={refStages.autoRefraction?.os?.cyl || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, autoRefraction: { ...refStages.autoRefraction, os: { ...refStages.autoRefraction.os, cyl: val } } } }));
                }} placeholder="—" className="w-full min-w-[70px] min-h-[38px] bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-black text-center text-indigo-900" /></td>
                <td className="p-1.5"><input type="text" value={refStages.autoRefraction?.os?.axis || ''} onChange={e => {
                  const val = e.target.value;
                  onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, autoRefraction: { ...refStages.autoRefraction, os: { ...refStages.autoRefraction.os, axis: val } } } }));
                }} placeholder="—" className="w-full min-w-[60px] min-h-[38px] bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-xs sm:text-sm font-black text-center text-slate-900" /></td>
                <td className="p-1.5 text-center text-slate-400">—</td>
                <td className="p-1.5 text-center text-slate-400">—</td>
              </tr>

            </tbody>
          </table>
        </div>
      </ClinicalSectionCard>

      {/* 6. SUBJECTIVE REFRACTION & FINAL PRESCRIPTION */}
      <ClinicalSectionCard
        id="subjectiveRefraction"
        orderNumber={6}
        title="Subjective Refraction & Final Prescription Power (চূড়ান্ত পাওয়ার)"
        bnTitle="Duo-chrome, Fogging ও চশমার প্রেসক্রাইবড পাওয়ার"
        category="Refraction"
        icon={<Zap className="w-4 h-4 text-teal-600" />}
        isSelected={selectedSections.subjectiveRefraction}
        status={selectedSections.subjectiveRefraction ? 'COMPLETED' : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={`OD: ${odPower.sph || 'Plano'} Sph / ${odPower.cyl || 'DS'} Cyl • OS: ${osPower.sph || 'Plano'} Sph / ${osPower.cyl || 'DS'} Cyl`}
        rightHeaderAction={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => transposePower('od')}
              className="text-[11px] font-bold px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200"
            >
              ⇄ Transpose OD
            </button>
            <button
              type="button"
              onClick={() => transposePower('os')}
              className="text-[11px] font-bold px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200"
            >
              ⇄ Transpose OS
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          
          {/* Subjective Acceptance */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-teal-50/50 text-teal-900 font-bold border-b border-teal-200">
                  <th className="p-2.5">Subjective Testing</th>
                  <th className="p-2.5">Eye</th>
                  <th className="p-2.5 min-w-[85px]">Sph (D)</th>
                  <th className="p-2.5 min-w-[85px]">Cyl (D)</th>
                  <th className="p-2.5 min-w-[75px]">Axis</th>
                  <th className="p-2.5 min-w-[85px]">Add</th>
                  <th className="p-2.5 min-w-[80px]">VA</th>
                  <th className="p-2.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-100 font-medium">
                <tr className="bg-teal-50/20">
                  <td rowSpan={2} className="p-2.5 font-bold text-teal-900 border-r border-slate-200">
                    Subjective Acceptance
                  </td>
                  <td className="p-2 font-bold text-blue-700">OD</td>
                  <td className="p-1.5"><input type="text" value={refStages.subjectiveRefraction?.od?.sph || ''} onChange={e => {
                    const val = e.target.value;
                    onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, subjectiveRefraction: { ...refStages.subjectiveRefraction, od: { ...refStages.subjectiveRefraction.od, sph: val } } } }));
                  }} placeholder="—" className="w-full min-w-[75px] bg-white border border-teal-200 rounded-lg px-2 py-1.5 text-sm font-black text-center focus:ring-2 focus:ring-teal-500" /></td>
                  <td className="p-1.5"><input type="text" value={refStages.subjectiveRefraction?.od?.cyl || ''} onChange={e => {
                    const val = e.target.value;
                    onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, subjectiveRefraction: { ...refStages.subjectiveRefraction, od: { ...refStages.subjectiveRefraction.od, cyl: val } } } }));
                  }} placeholder="—" className="w-full min-w-[75px] bg-white border border-teal-200 rounded-lg px-2 py-1.5 text-sm font-black text-center focus:ring-2 focus:ring-teal-500" /></td>
                  <td className="p-1.5"><input type="text" value={refStages.subjectiveRefraction?.od?.axis || ''} onChange={e => {
                    const val = e.target.value;
                    onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, subjectiveRefraction: { ...refStages.subjectiveRefraction, od: { ...refStages.subjectiveRefraction.od, axis: val } } } }));
                  }} placeholder="—" className="w-full min-w-[65px] bg-white border border-teal-200 rounded-lg px-2 py-1.5 text-sm font-black text-center focus:ring-2 focus:ring-teal-500" /></td>
                  <td className="p-1.5"><input type="text" value={refStages.subjectiveRefraction?.od?.add || ''} onChange={e => {
                    const val = e.target.value;
                    onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, subjectiveRefraction: { ...refStages.subjectiveRefraction, od: { ...refStages.subjectiveRefraction.od, add: val } } } }));
                  }} placeholder="—" className="w-full min-w-[75px] bg-white border border-teal-200 rounded-lg px-2 py-1.5 text-sm font-black text-center focus:ring-2 focus:ring-teal-500" /></td>
                  <td className="p-1.5"><input type="text" value={refStages.subjectiveRefraction?.od?.va || ''} onChange={e => {
                    const val = e.target.value;
                    onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, subjectiveRefraction: { ...refStages.subjectiveRefraction, od: { ...refStages.subjectiveRefraction.od, va: val } } } }));
                  }} placeholder="6/6" className="w-full min-w-[70px] bg-white border border-teal-200 rounded-lg px-2 py-1.5 text-sm font-black text-center text-teal-800 focus:ring-2 focus:ring-teal-500" /></td>
                  <td rowSpan={2} className="p-1.5"><input type="text" value={refStages.subjectiveRefraction?.notes || ''} onChange={e => {
                    const val = e.target.value;
                    onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, subjectiveRefraction: { ...refStages.subjectiveRefraction, notes: val } } }));
                  }} placeholder="Binocular balance, comfortable with Duo-chrome" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs" /></td>
                </tr>
                <tr className="bg-teal-50/20">
                  <td className="p-2 font-bold text-emerald-700">OS</td>
                  <td className="p-1.5"><input type="text" value={refStages.subjectiveRefraction?.os?.sph || ''} onChange={e => {
                    const val = e.target.value;
                    onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, subjectiveRefraction: { ...refStages.subjectiveRefraction, os: { ...refStages.subjectiveRefraction.os, sph: val } } } }));
                  }} placeholder="—" className="w-full min-w-[75px] bg-white border border-teal-200 rounded-lg px-2 py-1.5 text-sm font-black text-center focus:ring-2 focus:ring-teal-500" /></td>
                  <td className="p-1.5"><input type="text" value={refStages.subjectiveRefraction?.os?.cyl || ''} onChange={e => {
                    const val = e.target.value;
                    onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, subjectiveRefraction: { ...refStages.subjectiveRefraction, os: { ...refStages.subjectiveRefraction.os, cyl: val } } } }));
                  }} placeholder="—" className="w-full min-w-[75px] bg-white border border-teal-200 rounded-lg px-2 py-1.5 text-sm font-black text-center focus:ring-2 focus:ring-teal-500" /></td>
                  <td className="p-1.5"><input type="text" value={refStages.subjectiveRefraction?.os?.axis || ''} onChange={e => {
                    const val = e.target.value;
                    onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, subjectiveRefraction: { ...refStages.subjectiveRefraction, os: { ...refStages.subjectiveRefraction.os, axis: val } } } }));
                  }} placeholder="—" className="w-full min-w-[65px] bg-white border border-teal-200 rounded-lg px-2 py-1.5 text-sm font-black text-center focus:ring-2 focus:ring-teal-500" /></td>
                  <td className="p-1.5"><input type="text" value={refStages.subjectiveRefraction?.os?.add || ''} onChange={e => {
                    const val = e.target.value;
                    onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, subjectiveRefraction: { ...refStages.subjectiveRefraction, os: { ...refStages.subjectiveRefraction.os, add: val } } } }));
                  }} placeholder="—" className="w-full min-w-[75px] bg-white border border-teal-200 rounded-lg px-2 py-1.5 text-sm font-black text-center focus:ring-2 focus:ring-teal-500" /></td>
                  <td className="p-1.5"><input type="text" value={refStages.subjectiveRefraction?.os?.va || ''} onChange={e => {
                    const val = e.target.value;
                    onExamChange(prev => ({ ...prev, refractionStages: { ...refStages, subjectiveRefraction: { ...refStages.subjectiveRefraction, os: { ...refStages.subjectiveRefraction.os, va: val } } } }));
                  }} placeholder="6/6" className="w-full min-w-[70px] bg-white border border-teal-200 rounded-lg px-2 py-1.5 text-sm font-black text-center text-teal-800 focus:ring-2 focus:ring-teal-500" /></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FINAL EYE POWER PRESCRIPTION (OD & OS) */}
          <div className="space-y-4 pt-2">

            {/* Quick Action Toolbar: Copy OD->OS & Find Matching Lenses */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-900 text-white shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
                <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  Prescription Power Station (চশমার পাওয়ার ইনপুট)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="copy-od-to-os-btn"
                  onClick={handleCopyOdToOs}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-400/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
                  title="Duplicate OD power values into OS (ডান চোখ থেকে বামে কপি)"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy OD → OS</span>
                </button>

                <button
                  type="button"
                  id="find-matching-lenses-btn"
                  onClick={() => setShowFindLensesModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  title="Search Central LensMaster Inventory for OD & OS"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>🔍 Find Matching Lenses</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* OD Final Power Box */}
              <div className="bg-blue-50/60 rounded-2xl p-4 sm:p-5 border-2 border-blue-300 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                    <span className="text-xs sm:text-sm font-black text-blue-950 uppercase tracking-wider">
                      OD — Right Eye Power (ডান চোখ)
                    </span>
                  </div>
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-blue-200 text-blue-950 border border-blue-300">
                    OD FINAL
                  </span>
                </div>
                
                {/* OD Power Inputs with Steppers */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
                  {/* SPH */}
                  <div className="flex flex-col">
                    <label className="text-xs font-black text-blue-950 uppercase tracking-wider mb-1">Sph (D)</label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => stepPower('od', 'sph', -0.25)}
                        className="w-7 h-10 rounded-lg bg-blue-200 hover:bg-blue-300 active:scale-95 text-blue-950 font-black flex items-center justify-center text-sm shadow-2xs"
                        title="Decrease -0.25 D"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={odPower.sph || ''}
                        onChange={e => onPowerChange('od', 'sph', e.target.value)}
                        placeholder="0.00"
                        className="w-full min-w-[62px] min-h-[42px] bg-white border-2 border-blue-200 hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 font-black text-sm sm:text-base rounded-xl px-1.5 py-1.5 text-center text-slate-900 shadow-xs transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => stepPower('od', 'sph', +0.25)}
                        className="w-7 h-10 rounded-lg bg-blue-200 hover:bg-blue-300 active:scale-95 text-blue-950 font-black flex items-center justify-center text-sm shadow-2xs"
                        title="Increase +0.25 D"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 text-center mt-1 font-medium">±0.25 step</span>
                  </div>

                  {/* CYL */}
                  <div className="flex flex-col">
                    <label className="text-xs font-black text-blue-950 uppercase tracking-wider mb-1">Cyl (D)</label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => stepPower('od', 'cyl', -0.25)}
                        className="w-7 h-10 rounded-lg bg-blue-200 hover:bg-blue-300 active:scale-95 text-blue-950 font-black flex items-center justify-center text-sm shadow-2xs"
                        title="Decrease -0.25 D"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={odPower.cyl || ''}
                        onChange={e => onPowerChange('od', 'cyl', e.target.value)}
                        placeholder="0.00"
                        className="w-full min-w-[62px] min-h-[42px] bg-white border-2 border-blue-200 hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 font-black text-sm sm:text-base rounded-xl px-1.5 py-1.5 text-center text-blue-950 shadow-xs transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => stepPower('od', 'cyl', +0.25)}
                        className="w-7 h-10 rounded-lg bg-blue-200 hover:bg-blue-300 active:scale-95 text-blue-950 font-black flex items-center justify-center text-sm shadow-2xs"
                        title="Increase +0.25 D"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 text-center mt-1 font-medium">±0.25 step</span>
                  </div>

                  {/* AXIS */}
                  <div className="flex flex-col">
                    <label className="text-xs font-black text-blue-950 uppercase tracking-wider mb-1">Axis</label>
                    <input
                      type="text"
                      value={odPower.axis || ''}
                      onChange={e => onPowerChange('od', 'axis', e.target.value)}
                      placeholder="000°"
                      className="w-full min-h-[42px] bg-white border-2 border-blue-200 hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 font-black text-sm sm:text-base rounded-xl px-2 py-1.5 text-center text-slate-900 shadow-xs transition-all"
                    />
                    <span className="text-[10px] text-slate-400 text-center mt-1 font-medium">0° - 180°</span>
                  </div>

                  {/* ADD */}
                  <div className="flex flex-col">
                    <label className="text-xs font-black text-blue-950 uppercase tracking-wider mb-1">Add</label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => stepPower('od', 'add', -0.25)}
                        className="w-7 h-10 rounded-lg bg-blue-200 hover:bg-blue-300 active:scale-95 text-blue-950 font-black flex items-center justify-center text-sm shadow-2xs"
                        title="Decrease -0.25 D"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={odPower.add || ''}
                        onChange={e => onPowerChange('od', 'add', e.target.value)}
                        placeholder="+0.00"
                        className="w-full min-w-[62px] min-h-[42px] bg-white border-2 border-blue-200 hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 font-black text-sm sm:text-base rounded-xl px-1.5 py-1.5 text-center text-emerald-800 shadow-xs transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => stepPower('od', 'add', +0.25)}
                        className="w-7 h-10 rounded-lg bg-blue-200 hover:bg-blue-300 active:scale-95 text-blue-950 font-black flex items-center justify-center text-sm shadow-2xs"
                        title="Increase +0.25 D"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 text-center mt-1 font-medium">Near Reading</span>
                  </div>

                  {/* DIST VA */}
                  <div className="flex flex-col">
                    <label className="text-xs font-black text-blue-950 uppercase tracking-wider mb-1">Dist VA</label>
                    <input
                      type="text"
                      value={odPower.distanceVa || ''}
                      onChange={e => onPowerChange('od', 'distanceVa', e.target.value)}
                      placeholder="6/6"
                      className="w-full min-h-[42px] bg-white border-2 border-blue-200 hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 font-black text-sm sm:text-base rounded-xl px-2 py-1.5 text-center text-slate-900 shadow-xs transition-all"
                    />
                    <span className="text-[10px] text-slate-400 text-center mt-1 font-medium">Snellen</span>
                  </div>

                  {/* NEAR VA */}
                  <div className="flex flex-col">
                    <label className="text-xs font-black text-blue-950 uppercase tracking-wider mb-1">Near VA</label>
                    <input
                      type="text"
                      value={odPower.nearVa || ''}
                      onChange={e => onPowerChange('od', 'nearVa', e.target.value)}
                      placeholder="N6"
                      className="w-full min-h-[42px] bg-white border-2 border-blue-200 hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 font-black text-sm sm:text-base rounded-xl px-2 py-1.5 text-center text-slate-900 shadow-xs transition-all"
                    />
                    <span className="text-[10px] text-slate-400 text-center mt-1 font-medium">Jaeger</span>
                  </div>
                </div>

                {/* OD Quick-Select Chips (Touch Friendly, Scrollable) */}
                <div className="bg-white/80 p-2.5 rounded-xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-950">
                    <span>⚡ Quick Power Select (OD)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Tap to insert value</span>
                  </div>

                  {/* SPH Quick Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                    <span className="text-[10px] font-black text-blue-900 uppercase shrink-0">SPH:</span>
                    {['-2.00', '-1.50', '-1.25', '-1.00', '-0.75', '-0.50', '-0.25', '0.00', '+0.25', '+0.50', '+0.75', '+1.00', '+1.25', '+1.50', '+2.00'].map(val => (
                      <button
                        key={`od-sph-${val}`}
                        type="button"
                        onClick={() => onPowerChange('od', 'sph', val === '0.00' ? '' : val)}
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold shrink-0 transition ${
                          odPower.sph === val
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-blue-100/70 hover:bg-blue-200 text-blue-900'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  {/* CYL Quick Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                    <span className="text-[10px] font-black text-blue-900 uppercase shrink-0">CYL:</span>
                    {['-2.00', '-1.75', '-1.50', '-1.25', '-1.00', '-0.75', '-0.50', '-0.25', '0.00', '+0.25', '+0.50', '+0.75', '+1.00', '+1.25', '+1.50', '+2.00'].map(val => (
                      <button
                        key={`od-cyl-${val}`}
                        type="button"
                        onClick={() => onPowerChange('od', 'cyl', val === '0.00' ? '' : val)}
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold shrink-0 transition ${
                          odPower.cyl === val
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-blue-100/70 hover:bg-blue-200 text-blue-900'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  {/* AXIS Quick Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                    <span className="text-[10px] font-black text-blue-900 uppercase shrink-0">AXIS:</span>
                    {['0°', '15°', '30°', '45°', '60°', '75°', '90°', '105°', '120°', '135°', '150°', '165°', '180°'].map(val => {
                      const cleanVal = val.replace('°', '');
                      return (
                        <button
                          key={`od-axis-${val}`}
                          type="button"
                          onClick={() => onPowerChange('od', 'axis', cleanVal)}
                          className={`px-2 py-1 rounded-lg text-xs font-mono font-bold shrink-0 transition ${
                            odPower.axis === cleanVal
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-blue-100/70 hover:bg-blue-200 text-blue-900'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>

                  {/* ADD Quick Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                    <span className="text-[10px] font-black text-blue-900 uppercase shrink-0">ADD:</span>
                    {['+0.75', '+1.00', '+1.25', '+1.50', '+1.75', '+2.00', '+2.25', '+2.50', '+2.75', '+3.00'].map(val => (
                      <button
                        key={`od-add-${val}`}
                        type="button"
                        onClick={() => onPowerChange('od', 'add', val)}
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold shrink-0 transition ${
                          odPower.add === val
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-blue-100/70 hover:bg-blue-200 text-blue-900'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* OS Final Power Box */}
              <div className="bg-emerald-50/60 rounded-2xl p-4 sm:p-5 border-2 border-emerald-300 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                    <span className="text-xs sm:text-sm font-black text-emerald-950 uppercase tracking-wider">
                      OS — Left Eye Power (বাম চোখ)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyOdToOs}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-200 hover:bg-emerald-300 text-emerald-950 border border-emerald-300 flex items-center gap-1 transition"
                      title="Copy from OD"
                    >
                      <Copy className="w-3 h-3" />
                      Copy OD
                    </button>
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-950 border border-emerald-300">
                      OS FINAL
                    </span>
                  </div>
                </div>
                
                {/* OS Power Inputs with Steppers */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
                  {/* SPH */}
                  <div className="flex flex-col">
                    <label className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-1">Sph (D)</label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => stepPower('os', 'sph', -0.25)}
                        className="w-7 h-10 rounded-lg bg-emerald-200 hover:bg-emerald-300 active:scale-95 text-emerald-950 font-black flex items-center justify-center text-sm shadow-2xs"
                        title="Decrease -0.25 D"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={osPower.sph || ''}
                        onChange={e => onPowerChange('os', 'sph', e.target.value)}
                        placeholder="0.00"
                        className="w-full min-w-[62px] min-h-[42px] bg-white border-2 border-emerald-200 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 font-black text-sm sm:text-base rounded-xl px-1.5 py-1.5 text-center text-slate-900 shadow-xs transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => stepPower('os', 'sph', +0.25)}
                        className="w-7 h-10 rounded-lg bg-emerald-200 hover:bg-emerald-300 active:scale-95 text-emerald-950 font-black flex items-center justify-center text-sm shadow-2xs"
                        title="Increase +0.25 D"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 text-center mt-1 font-medium">±0.25 step</span>
                  </div>

                  {/* CYL */}
                  <div className="flex flex-col">
                    <label className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-1">Cyl (D)</label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => stepPower('os', 'cyl', -0.25)}
                        className="w-7 h-10 rounded-lg bg-emerald-200 hover:bg-emerald-300 active:scale-95 text-emerald-950 font-black flex items-center justify-center text-sm shadow-2xs"
                        title="Decrease -0.25 D"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={osPower.cyl || ''}
                        onChange={e => onPowerChange('os', 'cyl', e.target.value)}
                        placeholder="0.00"
                        className="w-full min-w-[62px] min-h-[42px] bg-white border-2 border-emerald-200 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 font-black text-sm sm:text-base rounded-xl px-1.5 py-1.5 text-center text-emerald-950 shadow-xs transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => stepPower('os', 'cyl', +0.25)}
                        className="w-7 h-10 rounded-lg bg-emerald-200 hover:bg-emerald-300 active:scale-95 text-emerald-950 font-black flex items-center justify-center text-sm shadow-2xs"
                        title="Increase +0.25 D"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 text-center mt-1 font-medium">±0.25 step</span>
                  </div>

                  {/* AXIS */}
                  <div className="flex flex-col">
                    <label className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-1">Axis</label>
                    <input
                      type="text"
                      value={osPower.axis || ''}
                      onChange={e => onPowerChange('os', 'axis', e.target.value)}
                      placeholder="000°"
                      className="w-full min-h-[42px] bg-white border-2 border-emerald-200 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 font-black text-sm sm:text-base rounded-xl px-2 py-1.5 text-center text-slate-900 shadow-xs transition-all"
                    />
                    <span className="text-[10px] text-slate-400 text-center mt-1 font-medium">0° - 180°</span>
                  </div>

                  {/* ADD */}
                  <div className="flex flex-col">
                    <label className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-1">Add</label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => stepPower('os', 'add', -0.25)}
                        className="w-7 h-10 rounded-lg bg-emerald-200 hover:bg-emerald-300 active:scale-95 text-emerald-950 font-black flex items-center justify-center text-sm shadow-2xs"
                        title="Decrease -0.25 D"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={osPower.add || ''}
                        onChange={e => onPowerChange('os', 'add', e.target.value)}
                        placeholder="+0.00"
                        className="w-full min-w-[62px] min-h-[42px] bg-white border-2 border-emerald-200 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 font-black text-sm sm:text-base rounded-xl px-1.5 py-1.5 text-center text-emerald-800 shadow-xs transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => stepPower('os', 'add', +0.25)}
                        className="w-7 h-10 rounded-lg bg-emerald-200 hover:bg-emerald-300 active:scale-95 text-emerald-950 font-black flex items-center justify-center text-sm shadow-2xs"
                        title="Increase +0.25 D"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 text-center mt-1 font-medium">Near Reading</span>
                  </div>

                  {/* DIST VA */}
                  <div className="flex flex-col">
                    <label className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-1">Dist VA</label>
                    <input
                      type="text"
                      value={osPower.distanceVa || ''}
                      onChange={e => onPowerChange('os', 'distanceVa', e.target.value)}
                      placeholder="6/6"
                      className="w-full min-h-[42px] bg-white border-2 border-emerald-200 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 font-black text-sm sm:text-base rounded-xl px-2 py-1.5 text-center text-slate-900 shadow-xs transition-all"
                    />
                    <span className="text-[10px] text-slate-400 text-center mt-1 font-medium">Snellen</span>
                  </div>

                  {/* NEAR VA */}
                  <div className="flex flex-col">
                    <label className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-1">Near VA</label>
                    <input
                      type="text"
                      value={osPower.nearVa || ''}
                      onChange={e => onPowerChange('os', 'nearVa', e.target.value)}
                      placeholder="N6"
                      className="w-full min-h-[42px] bg-white border-2 border-emerald-200 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 font-black text-sm sm:text-base rounded-xl px-2 py-1.5 text-center text-slate-900 shadow-xs transition-all"
                    />
                    <span className="text-[10px] text-slate-400 text-center mt-1 font-medium">Jaeger</span>
                  </div>
                </div>

                {/* OS Quick-Select Chips (Touch Friendly, Scrollable) */}
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950">
                    <span>⚡ Quick Power Select (OS)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Tap to insert value</span>
                  </div>

                  {/* SPH Quick Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                    <span className="text-[10px] font-black text-emerald-900 uppercase shrink-0">SPH:</span>
                    {['-2.00', '-1.50', '-1.25', '-1.00', '-0.75', '-0.50', '-0.25', '0.00', '+0.25', '+0.50', '+0.75', '+1.00', '+1.25', '+1.50', '+2.00'].map(val => (
                      <button
                        key={`os-sph-${val}`}
                        type="button"
                        onClick={() => onPowerChange('os', 'sph', val === '0.00' ? '' : val)}
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold shrink-0 transition ${
                          osPower.sph === val
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-100/70 hover:bg-emerald-200 text-emerald-900'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  {/* CYL Quick Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                    <span className="text-[10px] font-black text-emerald-900 uppercase shrink-0">CYL:</span>
                    {['-2.00', '-1.75', '-1.50', '-1.25', '-1.00', '-0.75', '-0.50', '-0.25', '0.00', '+0.25', '+0.50', '+0.75', '+1.00', '+1.25', '+1.50', '+1.75', '+2.00'].map(val => (
                      <button
                        key={`os-cyl-${val}`}
                        type="button"
                        onClick={() => onPowerChange('os', 'cyl', val === '0.00' ? '' : val)}
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold shrink-0 transition ${
                          osPower.cyl === val
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-100/70 hover:bg-emerald-200 text-emerald-900'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  {/* AXIS Quick Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                    <span className="text-[10px] font-black text-emerald-900 uppercase shrink-0">AXIS:</span>
                    {['0°', '15°', '30°', '45°', '60°', '75°', '90°', '105°', '120°', '135°', '150°', '165°', '180°'].map(val => {
                      const cleanVal = val.replace('°', '');
                      return (
                        <button
                          key={`os-axis-${val}`}
                          type="button"
                          onClick={() => onPowerChange('os', 'axis', cleanVal)}
                          className={`px-2 py-1 rounded-lg text-xs font-mono font-bold shrink-0 transition ${
                            osPower.axis === cleanVal
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-emerald-100/70 hover:bg-emerald-200 text-emerald-900'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>

                  {/* ADD Quick Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                    <span className="text-[10px] font-black text-emerald-900 uppercase shrink-0">ADD:</span>
                    {['+0.75', '+1.00', '+1.25', '+1.50', '+1.75', '+2.00', '+2.25', '+2.50', '+2.75', '+3.00'].map(val => (
                      <button
                        key={`os-add-${val}`}
                        type="button"
                        onClick={() => onPowerChange('os', 'add', val)}
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold shrink-0 transition ${
                          osPower.add === val
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-100/70 hover:bg-emerald-200 text-emerald-900'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </ClinicalSectionCard>

      {/* Find Matching Lenses Modal */}
      <FindMatchingLensesModal
        isOpen={showFindLensesModal}
        onClose={() => setShowFindLensesModal(false)}
        odPower={odPower}
        osPower={osPower}
      />

    </div>
  );
};
