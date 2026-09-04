import React from 'react';
import { ClinicalExamination } from '../../types';
import {
  PUPIL_SIZES,
  PUPIL_SHAPES,
  TONOMETRY_METHODS,
  COLOUR_VISION_TESTS,
  VISUAL_FIELD_TESTS
} from '../../data/clinicalMasterData';
import { ClinicalSectionId } from '../../types/clinicalSections';
import { ClinicalSectionCard } from './ClinicalSectionCard';
import { Gauge, AlertTriangle, Eye, Compass, Palette, LayoutGrid } from 'lucide-react';

interface Props {
  examination: ClinicalExamination;
  selectedSections: Record<ClinicalSectionId, boolean>;
  onToggleSection: (id: ClinicalSectionId) => void;
  onExamChange: (updater: (prev: ClinicalExamination) => ClinicalExamination) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const IopPupilMotilitySection: React.FC<Props> = ({
  examination,
  selectedSections,
  onToggleSection,
  onExamChange,
  showToast
}) => {
  const tonometry = examination?.tonometry || {
    odIop: '14',
    osIop: '14',
    unit: 'mmHg',
    method: 'NCT (Non-Contact)',
    measurementTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    notes: ''
  };

  const pupil = examination?.pupilExam || {
    od: { sizeMm: '3.0 mm', shape: 'Round & Regular', directReaction: 'Brisk', consensualReaction: 'Present', rapd: 'Absent', status: 'Normal', notes: '' },
    os: { sizeMm: '3.0 mm', shape: 'Round & Regular', directReaction: 'Brisk', consensualReaction: 'Present', rapd: 'Absent', status: 'Normal', notes: '' },
    notes: ''
  };

  const motility = examination?.motility || {
    status: 'Normal',
    odStatus: 'Normal',
    osStatus: 'Normal',
    ouStatus: 'Normal',
    diplopia: 'None',
    nystagmus: 'None',
    restriction: 'None',
    movementLimitation: '',
    otherFindings: '',
    notes: ''
  };

  const colourVision = examination?.colourVision || {
    testType: 'Ishihara 38 Plates',
    score: '38/38',
    odResult: 'Normal',
    osResult: 'Normal',
    notes: ''
  };

  const visualField = examination?.visualField || {
    testType: 'Confrontation',
    odResult: 'Normal',
    osResult: 'Normal',
    defectDescription: 'Full visual fields bilaterally by confrontation',
    notes: ''
  };

  const isOdHigh = parseFloat(tonometry.odIop || '0') > 21;
  const isOsHigh = parseFloat(tonometry.osIop || '0') > 21;

  const updateTonometry = (field: keyof typeof tonometry, val: string) => {
    onExamChange(prev => {
      const current = prev.tonometry || tonometry;
      const updated = { ...current, [field]: val };
      return {
        ...prev,
        iopOd: field === 'odIop' ? val : prev.iopOd,
        iopOs: field === 'osIop' ? val : prev.iopOs,
        tonometry: updated
      };
    });
  };

  const updatePupil = (eye: 'od' | 'os', field: string, val: string) => {
    onExamChange(prev => {
      const current = prev.pupilExam || pupil;
      const eyeData = { ...(current[eye] || {}), [field]: val };
      const updated = { ...current, [eye]: eyeData };
      return {
        ...prev,
        pupilExam: updated
      };
    });
  };

  const updateMotility = (field: keyof typeof motility, val: string) => {
    onExamChange(prev => {
      const current = prev.motility || motility;
      const updated = { ...current, [field]: val };
      return {
        ...prev,
        eomStatus: field === 'status' ? val : prev.eomStatus,
        eomNotes: field === 'notes' ? val : prev.eomNotes,
        motility: updated
      };
    });
  };

  const updateColourVision = (field: keyof typeof colourVision, val: string) => {
    onExamChange(prev => ({
      ...prev,
      colourVision: { ...(prev.colourVision || colourVision), [field]: val }
    }));
  };

  const updateVisualField = (field: keyof typeof visualField, val: string) => {
    onExamChange(prev => ({
      ...prev,
      visualField: { ...(prev.visualField || visualField), [field]: val }
    }));
  };

  return (
    <div className="space-y-4">

      {/* 7. INTRAOCULAR PRESSURE (IOP / TONOMETRY) */}
      <ClinicalSectionCard
        id="tonometry"
        orderNumber={7}
        title="Intraocular Pressure (IOP & Tonometry)"
        bnTitle="চোখের প্রেসার / ইন্ট্রাওকুলার প্রেশার টোনোমেট্রি (স্বাভাবিক সীমা: ১০-২১ mmHg)"
        category="IOP & Motility"
        icon={<Gauge className="w-4 h-4" />}
        isSelected={selectedSections.tonometry}
        status={selectedSections.tonometry ? 'COMPLETED' : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={`OD: ${tonometry.odIop || '-'} mmHg • OS: ${tonometry.osIop || '-'} mmHg (${tonometry.method || 'NCT'})`}
        rightHeaderAction={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                updateTonometry('odIop', '14');
                updateTonometry('osIop', '14');
                showToast('Set Bilateral Normal IOP (14 mmHg)');
              }}
              className="text-[11px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              ✓ 14 mmHg Normal
            </button>
            <button
              type="button"
              onClick={() => {
                updateTonometry('odIop', '24');
                updateTonometry('osIop', '22');
                showToast('Set Elevated IOP sample (24 / 22 mmHg)');
              }}
              className="text-[11px] font-bold px-2 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              ⚠️ High IOP Preset
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* OD IOP */}
          <div className={`p-3.5 rounded-xl border ${isOdHigh ? 'bg-rose-50/60 border-rose-300' : 'bg-blue-50/40 border-blue-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-blue-900 uppercase">OD IOP (Right Eye)</span>
              {isOdHigh && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">Elevated</span>}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="60"
                step="1"
                value={tonometry.odIop || '14'}
                onChange={e => updateTonometry('odIop', e.target.value)}
                className={`w-full bg-white border text-base font-extrabold rounded-lg p-2 text-center focus:ring-2 ${
                  isOdHigh ? 'border-rose-400 text-rose-900 focus:ring-rose-500' : 'border-blue-300 text-blue-900 focus:ring-blue-500'
                }`}
              />
              <span className="text-xs font-bold text-slate-600">mmHg</span>
            </div>
          </div>

          {/* OS IOP */}
          <div className={`p-3.5 rounded-xl border ${isOsHigh ? 'bg-rose-50/60 border-rose-300' : 'bg-emerald-50/40 border-emerald-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-emerald-900 uppercase">OS IOP (Left Eye)</span>
              {isOsHigh && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">Elevated</span>}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="60"
                step="1"
                value={tonometry.osIop || '14'}
                onChange={e => updateTonometry('osIop', e.target.value)}
                className={`w-full bg-white border text-base font-extrabold rounded-lg p-2 text-center focus:ring-2 ${
                  isOsHigh ? 'border-rose-400 text-rose-900 focus:ring-rose-500' : 'border-emerald-300 text-emerald-900 focus:ring-emerald-500'
                }`}
              />
              <span className="text-xs font-bold text-slate-600">mmHg</span>
            </div>
          </div>

          {/* Tonometry Method */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Measurement Method</label>
            <select
              value={tonometry.method || 'NCT (Non-Contact)'}
              onChange={e => updateTonometry('method', e.target.value)}
              className="w-full bg-white border border-slate-300 text-xs font-bold rounded-lg p-2 focus:ring-1 focus:ring-slate-500"
            >
              {TONOMETRY_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Time & CCT Notes */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Time / CCT Microns</label>
            <input
              type="text"
              value={tonometry.notes || ''}
              onChange={e => updateTonometry('notes', e.target.value)}
              placeholder="e.g. 11:30 AM (CCT: OD 540µ, OS 542µ)"
              className="w-full bg-white border border-slate-300 text-xs rounded-lg p-2"
            />
          </div>

        </div>
      </ClinicalSectionCard>

      {/* 8. PUPIL EXAMINATION */}
      <ClinicalSectionCard
        id="pupilExam"
        orderNumber={8}
        title="Pupillary Examination & RAPD (পিউপিল পরীক্ষা)"
        bnTitle="পিউপিল সাইজ, ডিরেক্ট/কনসেনসুয়াল লাইট রিফ্লেক্স ও মারকাস গান RAPD"
        category="IOP & Motility"
        icon={<Eye className="w-4 h-4" />}
        isSelected={selectedSections.pupilExam}
        status={selectedSections.pupilExam ? 'COMPLETED' : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={`OD: ${pupil.od?.sizeMm || '3mm'} ${pupil.od?.shape || 'Round'} (RAPD: ${pupil.od?.rapd || 'Absent'}) • OS: ${pupil.os?.sizeMm || '3mm'} (RAPD: ${pupil.os?.rapd || 'Absent'})`}
        rightHeaderAction={
          <button
            type="button"
            onClick={() => {
              updatePupil('od', 'sizeMm', '3.0 mm');
              updatePupil('od', 'shape', 'Round & Regular');
              updatePupil('od', 'directReaction', 'Brisk');
              updatePupil('od', 'consensualReaction', 'Present');
              updatePupil('od', 'rapd', 'Absent');
              updatePupil('os', 'sizeMm', '3.0 mm');
              updatePupil('os', 'shape', 'Round & Regular');
              updatePupil('os', 'directReaction', 'Brisk');
              updatePupil('os', 'consensualReaction', 'Present');
              updatePupil('os', 'rapd', 'Absent');
              showToast('Set Pupils to Normal Bilateral (RRRTL, No RAPD)');
            }}
            className="text-[11px] font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            ✓ Normal RRRTL Both
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* OD Pupil */}
          <div className="bg-blue-50/40 rounded-xl p-3.5 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200">
              <span className="text-xs font-black text-blue-900 uppercase">OD (Right Pupil)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">OD</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Pupil Size</label>
                <select
                  value={pupil.od?.sizeMm || '3.0 mm'}
                  onChange={e => updatePupil('od', 'sizeMm', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-semibold rounded p-1.5"
                >
                  {PUPIL_SIZES.map(s => <option key={`od-sz-${s}`} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Shape</label>
                <select
                  value={pupil.od?.shape || 'Round & Regular'}
                  onChange={e => updatePupil('od', 'shape', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-semibold rounded p-1.5"
                >
                  {PUPIL_SHAPES.map(s => <option key={`od-sh-${s}`} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Direct Light Reflex</label>
                <select
                  value={pupil.od?.directReaction || 'Brisk'}
                  onChange={e => updatePupil('od', 'directReaction', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-semibold rounded p-1.5"
                >
                  <option value="Brisk">Brisk / Normal</option>
                  <option value="Sluggish">Sluggish</option>
                  <option value="Absent / Fixed">Absent / Fixed</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Consensual Reflex</label>
                <select
                  value={pupil.od?.consensualReaction || 'Present'}
                  onChange={e => updatePupil('od', 'consensualReaction', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-semibold rounded p-1.5"
                >
                  <option value="Present">Present / Normal</option>
                  <option value="Sluggish">Sluggish</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-600 block mb-1">RAPD (Marcus Gunn)</label>
                <select
                  value={pupil.od?.rapd || 'Absent'}
                  onChange={e => updatePupil('od', 'rapd', e.target.value)}
                  className={`w-full bg-white border text-xs font-bold rounded p-1.5 ${
                    pupil.od?.rapd && pupil.od?.rapd !== 'Absent' && pupil.od?.rapd !== 'Negative' ? 'border-rose-400 text-rose-900' : 'border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="Absent">Absent / Negative (Normal)</option>
                  <option value="Trace">Trace RAPD</option>
                  <option value="Grade 1">Grade 1 (Mild RAPD)</option>
                  <option value="Grade 2">Grade 2 (Moderate RAPD)</option>
                  <option value="Grade 3">Grade 3 (Marked RAPD)</option>
                  <option value="Grade 4">Grade 4 (Severe RAPD / Amaurotic)</option>
                </select>
              </div>
            </div>
          </div>

          {/* OS Pupil */}
          <div className="bg-emerald-50/40 rounded-xl p-3.5 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <span className="text-xs font-black text-emerald-900 uppercase">OS (Left Pupil)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">OS</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Pupil Size</label>
                <select
                  value={pupil.os?.sizeMm || '3.0 mm'}
                  onChange={e => updatePupil('os', 'sizeMm', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-semibold rounded p-1.5"
                >
                  {PUPIL_SIZES.map(s => <option key={`os-sz-${s}`} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Shape</label>
                <select
                  value={pupil.os?.shape || 'Round & Regular'}
                  onChange={e => updatePupil('os', 'shape', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-semibold rounded p-1.5"
                >
                  {PUPIL_SHAPES.map(s => <option key={`os-sh-${s}`} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Direct Light Reflex</label>
                <select
                  value={pupil.os?.directReaction || 'Brisk'}
                  onChange={e => updatePupil('os', 'directReaction', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-semibold rounded p-1.5"
                >
                  <option value="Brisk">Brisk / Normal</option>
                  <option value="Sluggish">Sluggish</option>
                  <option value="Absent / Fixed">Absent / Fixed</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Consensual Reflex</label>
                <select
                  value={pupil.os?.consensualReaction || 'Present'}
                  onChange={e => updatePupil('os', 'consensualReaction', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-semibold rounded p-1.5"
                >
                  <option value="Present">Present / Normal</option>
                  <option value="Sluggish">Sluggish</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-600 block mb-1">RAPD (Marcus Gunn)</label>
                <select
                  value={pupil.os?.rapd || 'Absent'}
                  onChange={e => updatePupil('os', 'rapd', e.target.value)}
                  className={`w-full bg-white border text-xs font-bold rounded p-1.5 ${
                    pupil.os?.rapd && pupil.os?.rapd !== 'Absent' && pupil.os?.rapd !== 'Negative' ? 'border-rose-400 text-rose-900' : 'border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="Absent">Absent / Negative (Normal)</option>
                  <option value="Trace">Trace RAPD</option>
                  <option value="Grade 1">Grade 1 (Mild RAPD)</option>
                  <option value="Grade 2">Grade 2 (Moderate RAPD)</option>
                  <option value="Grade 3">Grade 3 (Marked RAPD)</option>
                  <option value="Grade 4">Grade 4 (Severe RAPD / Amaurotic)</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </ClinicalSectionCard>

      {/* 9. EXTRAOCULAR MOTILITY & ALIGNMENT */}
      <ClinicalSectionCard
        id="motility"
        orderNumber={9}
        title="Ocular Motility & EOM Alignment (চোখের নড়াচড়া ও স্কুইন্ট)"
        bnTitle="৯টি দিকনির্দেশক দৃষ্টি (9 Cardinal Gazes), স্কুইন্ট ও ডিলোপিয়া পরীক্ষা"
        category="IOP & Motility"
        icon={<Compass className="w-4 h-4" />}
        isSelected={selectedSections.motility}
        status={selectedSections.motility ? 'COMPLETED' : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={`Status: ${motility.status || 'Orthophoric'} • Diplopia: ${motility.diplopia || 'None'} • Limitation: ${motility.restriction || 'None'}`}
        rightHeaderAction={
          <button
            type="button"
            onClick={() => {
              updateMotility('status', 'Normal');
              updateMotility('odStatus', 'Normal');
              updateMotility('osStatus', 'Normal');
              updateMotility('diplopia', 'None');
              updateMotility('nystagmus', 'None');
              updateMotility('restriction', 'None');
              updateMotility('notes', 'Full & free ocular movements in all 9 cardinal gazes. Orthophoric.');
              showToast('Set Motility to Normal Full & Free');
            }}
            className="text-[11px] font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            ✓ Full & Free (9 Gazes)
          </button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Ocular Alignment / Squint</label>
            <select
              value={motility.status || 'Normal'}
              onChange={e => updateMotility('status', e.target.value)}
              className="w-full bg-white border border-slate-300 text-xs font-bold rounded-lg p-2"
            >
              <option value="Normal">Orthophoric / Normal Alignment</option>
              <option value="Esotropia">Esotropia (Convergent Squint)</option>
              <option value="Exotropia">Exotropia (Divergent Squint)</option>
              <option value="Hypertropia">Hypertropia</option>
              <option value="Hypotropia">Hypotropia</option>
              <option value="Esophoria">Esophoria (Latent)</option>
              <option value="Exophoria">Exophoria (Latent)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Motility / Action</label>
            <select
              value={motility.restriction || 'None'}
              onChange={e => updateMotility('restriction', e.target.value)}
              className="w-full bg-white border border-slate-300 text-xs font-bold rounded-lg p-2"
            >
              <option value="None">Full & Free in all directions</option>
              <option value="Restricted Abduction OD">Restricted Abduction OD (6th Nerve)</option>
              <option value="Restricted Abduction OS">Restricted Abduction OS (6th Nerve)</option>
              <option value="Restricted Elevation">Restricted Elevation</option>
              <option value="Restricted Depression">Restricted Depression</option>
              <option value="Painful Movements">Painful on Movements</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nystagmus</label>
            <select
              value={motility.nystagmus || 'None'}
              onChange={e => updateMotility('nystagmus', e.target.value)}
              className="w-full bg-white border border-slate-300 text-xs font-bold rounded-lg p-2"
            >
              <option value="None">None / Absent</option>
              <option value="Horizontal Jerk">Horizontal Jerk Nystagmus</option>
              <option value="Vertical Nystagmus">Vertical Nystagmus</option>
              <option value="Rotatory">Rotatory Nystagmus</option>
              <option value="Pendular">Pendular Nystagmus</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Diplopia (ডাবল ভিশন)</label>
            <select
              value={motility.diplopia || 'None'}
              onChange={e => updateMotility('diplopia', e.target.value)}
              className="w-full bg-white border border-slate-300 text-xs font-bold rounded-lg p-2"
            >
              <option value="None">None / No Double Vision</option>
              <option value="Horizontal Diplopia">Horizontal Diplopia</option>
              <option value="Vertical Diplopia">Vertical Diplopia</option>
              <option value="Torsional Diplopia">Torsional Diplopia</option>
            </select>
          </div>

          <div className="col-span-full">
            <label className="text-xs font-bold text-slate-700 block mb-1">Motility & Squint Clinical Notes</label>
            <input
              type="text"
              value={motility.notes || ''}
              onChange={e => updateMotility('notes', e.target.value)}
              placeholder="Hirschberg corneal reflex centered, cover-uncover test negative..."
              className="w-full bg-white border border-slate-300 text-xs rounded-lg p-2"
            />
          </div>
        </div>
      </ClinicalSectionCard>

      {/* 10 & 11: COLOUR VISION & VISUAL FIELD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 10. Colour Vision */}
        <ClinicalSectionCard
          id="colourVision"
          orderNumber={10}
          title="Colour Vision & Contrast (কালার ভিশন)"
          bnTitle="Ishihara Plates বর্ণান্ধতা পরীক্ষা"
          category="IOP & Motility"
          icon={<Palette className="w-4 h-4" />}
          isSelected={selectedSections.colourVision}
          status={selectedSections.colourVision ? 'COMPLETED' : 'NOT_SELECTED'}
          onToggle={onToggleSection}
          summaryPreview={`OD: ${colourVision.odResult || 'Normal'} (${colourVision.score || '38/38'}) • OS: ${colourVision.osResult || 'Normal'}`}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Test Method</label>
                <select
                  value={colourVision.testType || 'Ishihara 38 Plates'}
                  onChange={e => updateColourVision('testType', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
                >
                  {COLOUR_VISION_TESTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Score / Plates</label>
                <input
                  type="text"
                  value={colourVision.score || '38/38'}
                  onChange={e => updateColourVision('score', e.target.value)}
                  placeholder="38/38"
                  className="w-full bg-white border border-slate-300 text-xs font-bold rounded p-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-blue-800 block mb-1">OD Result</label>
                <select
                  value={colourVision.odResult || 'Normal'}
                  onChange={e => updateColourVision('odResult', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-bold rounded p-1.5"
                >
                  <option value="Normal">Normal (No Defect)</option>
                  <option value="Red-Green Defect">Red-Green Defect (Deutan)</option>
                  <option value="Protanopia">Protan Defect</option>
                  <option value="Total Color Blind">Total Color Blindness</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-emerald-800 block mb-1">OS Result</label>
                <select
                  value={colourVision.osResult || 'Normal'}
                  onChange={e => updateColourVision('osResult', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-bold rounded p-1.5"
                >
                  <option value="Normal">Normal (No Defect)</option>
                  <option value="Red-Green Defect">Red-Green Defect (Deutan)</option>
                  <option value="Protanopia">Protan Defect</option>
                  <option value="Total Color Blind">Total Color Blindness</option>
                </select>
              </div>
            </div>
          </div>
        </ClinicalSectionCard>

        {/* 11. Visual Field */}
        <ClinicalSectionCard
          id="visualField"
          orderNumber={11}
          title="Visual Field & Confrontation (ভিজুয়াল ফিল্ড)"
          bnTitle="পেরিমেট্রি ও ফিল্ড ডিফেক্ট স্ক্রিনিং"
          category="IOP & Motility"
          icon={<LayoutGrid className="w-4 h-4" />}
          isSelected={selectedSections.visualField}
          status={selectedSections.visualField ? 'COMPLETED' : 'NOT_SELECTED'}
          onToggle={onToggleSection}
          summaryPreview={`OD: ${visualField.odResult || 'Normal'} • OS: ${visualField.osResult || 'Normal'} (${visualField.testType || 'Confrontation'})`}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Field Test Type</label>
                <select
                  value={visualField.testType || 'Confrontation'}
                  onChange={e => updateVisualField('testType', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
                >
                  {VISUAL_FIELD_TESTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Field Status</label>
                <select
                  value={visualField.odResult || 'Normal'}
                  onChange={e => {
                    updateVisualField('odResult', e.target.value);
                    updateVisualField('osResult', e.target.value);
                  }}
                  className="w-full bg-white border border-slate-300 text-xs font-bold rounded p-1.5"
                >
                  <option value="Normal">Full / Normal Bilaterally</option>
                  <option value="Constricted">Constricted Field (Glaucoma / RP)</option>
                  <option value="Bitemporal Hemianopia">Bitemporal Hemianopia</option>
                  <option value="Homonymous Hemianopia">Homonymous Hemianopia</option>
                  <option value="Central Scotoma">Central Scotoma</option>
                  <option value="Arcuate Scotoma">Arcuate Scotoma</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Field Notes / Findings</label>
              <input
                type="text"
                value={visualField.defectDescription || ''}
                onChange={e => updateVisualField('defectDescription', e.target.value)}
                placeholder="Full visual field by confrontation bilaterally..."
                className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
              />
            </div>
          </div>
        </ClinicalSectionCard>

      </div>

    </div>
  );
};
