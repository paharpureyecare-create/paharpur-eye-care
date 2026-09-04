import React from 'react';
import { ClinicalExamination } from '../../types';
import {
  CATARACT_GRADES,
  CATARACT_TYPES,
  OPTIC_DISC_STATUSES,
  CD_RATIO_OPTIONS,
  MACULA_STATUSES,
  VESSEL_RATIOS,
  RETINA_STATUSES
} from '../../data/clinicalMasterData';
import { ClinicalSectionId } from '../../types/clinicalSections';
import { ClinicalSectionCard } from './ClinicalSectionCard';
import { Disc, Sun, Check, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  examination: ClinicalExamination;
  selectedSections: Record<ClinicalSectionId, boolean>;
  onToggleSection: (id: ClinicalSectionId) => void;
  onExamChange: (updater: (prev: ClinicalExamination) => ClinicalExamination) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const LensCataractFundusSection: React.FC<Props> = ({
  examination,
  selectedSections,
  onToggleSection,
  onExamChange,
  showToast
}) => {
  const lens = examination?.lensCataract || {
    od: { status: 'Clear', cataractGrade: 'N/A', cataractType: 'Nuclear Sclerotic (NS)', notes: '' },
    os: { status: 'Clear', cataractGrade: 'N/A', cataractType: 'Nuclear Sclerotic (NS)', notes: '' },
    notes: ''
  };

  const fundus = examination?.fundus || {
    od: {
      opticDisc: { status: 'Normal', discAppearance: 'Well defined pink margins', notes: '' },
      cdRatio: '0.3',
      macula: { status: 'Normal', fovealReflex: 'Positive & Bright', notes: '' },
      vessels: { status: 'Normal', avRatio: '2:3', notes: '' },
      retina: { status: 'Normal', periphery: 'Flat & intact', notes: '' },
      vitreous: { status: 'Normal', clarity: 'Optically clear', notes: '' }
    },
    os: {
      opticDisc: { status: 'Normal', discAppearance: 'Well defined pink margins', notes: '' },
      cdRatio: '0.3',
      macula: { status: 'Normal', fovealReflex: 'Positive & Bright', notes: '' },
      vessels: { status: 'Normal', avRatio: '2:3', notes: '' },
      retina: { status: 'Normal', periphery: 'Flat & intact', notes: '' },
      vitreous: { status: 'Normal', clarity: 'Optically clear', notes: '' }
    },
    notes: ''
  };

  const keratometry = examination?.keratometry || {
    od: { k1: '43.50 D @ 180°', k2: '44.00 D @ 90°', axis: '90°', avgK: '43.75 D', cylAstig: '-0.50 D' },
    os: { k1: '43.50 D @ 180°', k2: '44.00 D @ 90°', axis: '90°', avgK: '43.75 D', cylAstig: '-0.50 D' },
    notes: ''
  };

  const updateLens = (eye: 'od' | 'os', field: string, val: string) => {
    onExamChange(prev => {
      const cur = prev.lensCataract || lens;
      const eyeData = cur[eye] || { status: 'Clear', cataractGrade: 'N/A', cataractType: 'Nuclear Sclerotic (NS)', notes: '' };
      const updatedEye = { ...eyeData, [field]: val };
      return {
        ...prev,
        lensCataract: { ...cur, [eye]: updatedEye }
      };
    });
  };

  const updateFundusPart = (eye: 'od' | 'os', part: string, field: string, val: string) => {
    onExamChange(prev => {
      const cur = prev.fundus || fundus;
      const eyeData = cur[eye] as any;
      
      let updatedEye;
      if (part === 'cdRatio') {
        updatedEye = { ...eyeData, cdRatio: val };
      } else {
        const partData = eyeData[part] || { status: 'Normal', notes: '' };
        updatedEye = { ...eyeData, [part]: { ...partData, [field]: val } };
      }

      return {
        ...prev,
        fundusStatus: val !== 'Normal' && field === 'status' ? 'Abnormal' : prev.fundusStatus,
        fundus: { ...cur, [eye]: updatedEye }
      };
    });
  };

  const updateKeratometry = (eye: 'od' | 'os', field: string, val: string) => {
    onExamChange(prev => {
      const cur = prev.keratometry || keratometry;
      const eyeData = cur[eye] || { k1: '', k2: '', axis: '', avgK: '', cylAstig: '' };
      const updatedEye = { ...eyeData, [field]: val };
      return {
        ...prev,
        keratometry: { ...cur, [eye]: updatedEye }
      };
    });
  };

  const setClearLensBilateral = () => {
    onExamChange(prev => ({
      ...prev,
      lensCataract: {
        od: { status: 'Clear', cataractGrade: 'N/A', cataractType: 'None', notes: 'Clear crystalline lens' },
        os: { status: 'Clear', cataractGrade: 'N/A', cataractType: 'None', notes: 'Clear crystalline lens' },
        notes: 'Crystalline lenses clear bilaterally.'
      }
    }));
    showToast('Set Lens to Clear Bilateral');
  };

  const setPseudophakicBilateral = () => {
    onExamChange(prev => ({
      ...prev,
      lensCataract: {
        od: { status: 'Pseudophakic (PCIOL)', cataractGrade: 'N/A', cataractType: 'In-the-bag PCIOL', notes: 'Well-centered PCIOL, clear capsule' },
        os: { status: 'Pseudophakic (PCIOL)', cataractGrade: 'N/A', cataractType: 'In-the-bag PCIOL', notes: 'Well-centered PCIOL, clear capsule' },
        notes: 'Pseudophakic bilaterally with well-centered in-the-bag PCIOL.'
      }
    }));
    showToast('Set Lens to Pseudophakic (PCIOL) Bilateral');
  };

  const setNormalFundusBilateral = () => {
    onExamChange(prev => ({
      ...prev,
      fundusStatus: 'Normal',
      fundusNotes: 'Disc margins well defined, CDR 0.3, macula healthy, normal vessel caliber, retina flat',
      fundus: {
        od: {
          opticDisc: { status: 'Normal', discAppearance: 'Pink, sharp margins, healthy neuroretinal rim', notes: '' },
          cdRatio: '0.3',
          macula: { status: 'Normal', fovealReflex: 'Positive & Bright', notes: '' },
          vessels: { status: 'Normal', avRatio: '2:3', notes: '' },
          retina: { status: 'Normal', periphery: 'Flat & intact, no tears/detachments', notes: '' },
          vitreous: { status: 'Normal', clarity: 'Optically clear', notes: '' }
        },
        os: {
          opticDisc: { status: 'Normal', discAppearance: 'Pink, sharp margins, healthy neuroretinal rim', notes: '' },
          cdRatio: '0.3',
          macula: { status: 'Normal', fovealReflex: 'Positive & Bright', notes: '' },
          vessels: { status: 'Normal', avRatio: '2:3', notes: '' },
          retina: { status: 'Normal', periphery: 'Flat & intact, no tears/detachments', notes: '' },
          vitreous: { status: 'Normal', clarity: 'Optically clear', notes: '' }
        },
        notes: 'Fundus examination within normal limits bilaterally.'
      }
    }));
    showToast('Set Fundus to Normal Bilateral (CDR 0.3, Healthy Macula)');
  };

  return (
    <div className="space-y-4">

      {/* 14. CRYSTALLINE LENS & CATARACT STAGING */}
      <ClinicalSectionCard
        id="lensCataract"
        orderNumber={14}
        title="Lens & Cataract Staging (লেন্স ও ছানি গ্রেডিং - LOCS III)"
        bnTitle="Nuclear Sclerosis, Cortical, Posterior Subcapsular (PSC), Pseudophakic (IOL)"
        category="Lens & Fundus"
        icon={<Disc className="w-4 h-4" />}
        isSelected={selectedSections.lensCataract}
        status={selectedSections.lensCataract ? 'COMPLETED' : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={`OD: ${lens.od?.status || 'Clear'} (${lens.od?.cataractGrade || 'N/A'}) • OS: ${lens.os?.status || 'Clear'} (${lens.os?.cataractGrade || 'N/A'})`}
        rightHeaderAction={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={setClearLensBilateral}
              className="text-[11px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              ✓ Clear Lens
            </button>
            <button
              type="button"
              onClick={setPseudophakicBilateral}
              className="text-[11px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              👁️ Pseudophakic
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* OD Lens Column */}
          <div className="bg-blue-50/40 rounded-xl p-3.5 border border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-blue-200">
              <span className="text-xs font-black text-blue-900 uppercase">OD (Right Lens)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">OD</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Lens Condition / Status</label>
              <select
                value={lens.od?.status || 'Clear'}
                onChange={e => updateLens('od', 'status', e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs font-bold rounded p-1.5"
              >
                <option value="Clear">Clear Crystalline Lens</option>
                <option value="Early Cataract (Immature)">Early Cataract (Immature / IMSC)</option>
                <option value="Mature Cataract (MSC)">Mature Cataract (MSC)</option>
                <option value="Hypermature Cataract (HMSC)">Hypermature Cataract (HMSC / Morgagnian)</option>
                <option value="Pseudophakic (PCIOL)">Pseudophakic (PCIOL / In-the-bag)</option>
                <option value="Pseudophakic (ACIOL)">Pseudophakic (ACIOL)</option>
                <option value="Posterior Capsular Opacification (PCO)">After Cataract / PCO (Posterior Capsular)</option>
                <option value="Aphakic">Aphakic (No Lens)</option>
                <option value="Subluxated Lens">Subluxated Lens / Ectopia Lentis</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Cataract Type</label>
                <select
                  value={lens.od?.cataractType || 'Nuclear Sclerotic (NS)'}
                  onChange={e => updateLens('od', 'cataractType', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
                >
                  {CATARACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">LOCS III Grade</label>
                <select
                  value={lens.od?.cataractGrade || 'N/A'}
                  onChange={e => updateLens('od', 'cataractGrade', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-semibold rounded p-1.5"
                >
                  {CATARACT_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Lens Notes / Surgical Advice</label>
              <input
                type="text"
                value={lens.od?.notes || ''}
                onChange={e => updateLens('od', 'notes', e.target.value)}
                placeholder="e.g. NS Grade 2, planned for Phaco + Foldable Monofocal IOL..."
                className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
              />
            </div>
          </div>

          {/* OS Lens Column */}
          <div className="bg-emerald-50/40 rounded-xl p-3.5 border border-emerald-200 space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
              <span className="text-xs font-black text-emerald-900 uppercase">OS (Left Lens)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">OS</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Lens Condition / Status</label>
              <select
                value={lens.os?.status || 'Clear'}
                onChange={e => updateLens('os', 'status', e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs font-bold rounded p-1.5"
              >
                <option value="Clear">Clear Crystalline Lens</option>
                <option value="Early Cataract (Immature)">Early Cataract (Immature / IMSC)</option>
                <option value="Mature Cataract (MSC)">Mature Cataract (MSC)</option>
                <option value="Hypermature Cataract (HMSC)">Hypermature Cataract (HMSC / Morgagnian)</option>
                <option value="Pseudophakic (PCIOL)">Pseudophakic (PCIOL / In-the-bag)</option>
                <option value="Pseudophakic (ACIOL)">Pseudophakic (ACIOL)</option>
                <option value="Posterior Capsular Opacification (PCO)">After Cataract / PCO (Posterior Capsular)</option>
                <option value="Aphakic">Aphakic (No Lens)</option>
                <option value="Subluxated Lens">Subluxated Lens / Ectopia Lentis</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Cataract Type</label>
                <select
                  value={lens.os?.cataractType || 'Nuclear Sclerotic (NS)'}
                  onChange={e => updateLens('os', 'cataractType', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
                >
                  {CATARACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">LOCS III Grade</label>
                <select
                  value={lens.os?.cataractGrade || 'N/A'}
                  onChange={e => updateLens('os', 'cataractGrade', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-semibold rounded p-1.5"
                >
                  {CATARACT_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Lens Notes / Surgical Advice</label>
              <input
                type="text"
                value={lens.os?.notes || ''}
                onChange={e => updateLens('os', 'notes', e.target.value)}
                placeholder="e.g. NS Grade 2, planned for Phaco + Foldable Monofocal IOL..."
                className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
              />
            </div>
          </div>

        </div>
      </ClinicalSectionCard>

      {/* 15. FUNDUS & POSTERIOR SEGMENT BIOMICROSCOPY */}
      <ClinicalSectionCard
        id="fundus"
        orderNumber={15}
        title="Fundus & Posterior Segment Biomicroscopy (ফান্ডাস / রেটিনা পরীক্ষা)"
        bnTitle="Optic Disc CDR, Glaucomatous cupping, Diabetic Retinopathy, Macula (ARMD) & Vessels"
        category="Lens & Fundus"
        icon={<Sun className="w-4 h-4 text-amber-600" />}
        isSelected={selectedSections.fundus}
        status={selectedSections.fundus ? 'COMPLETED' : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={`OD CDR: ${fundus.od?.cdRatio || '0.3'} (Macula: ${fundus.od?.macula?.status || 'Normal'}) • OS CDR: ${fundus.os?.cdRatio || '0.3'} (Macula: ${fundus.os?.macula?.status || 'Normal'})`}
        rightHeaderAction={
          <button
            type="button"
            onClick={setNormalFundusBilateral}
            className="text-[11px] font-bold px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 transition-all flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            ✓ Normal CDR 0.3 Both
          </button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* OD Fundus Column */}
          <div className="bg-blue-50/30 rounded-xl p-4 border border-blue-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200">
              <span className="text-xs font-black text-blue-900 uppercase">
                OD (Right Eye Fundus / রেটিনা)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">OD</span>
            </div>

            {/* Optic Disc & CDR */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Optic Disc Status</label>
                <select
                  value={fundus.od?.opticDisc?.status || 'Normal'}
                  onChange={e => updateFundusPart('od', 'opticDisc', 'status', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
                >
                  {OPTIC_DISC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Cup-to-Disc (CD Ratio)</label>
                <select
                  value={fundus.od?.cdRatio || '0.3'}
                  onChange={e => updateFundusPart('od', 'cdRatio', '', e.target.value)}
                  className={`w-full bg-white border text-xs font-bold rounded p-1.5 ${
                    parseFloat(fundus.od?.cdRatio || '0') >= 0.7 ? 'border-rose-400 text-rose-900' : 'border-slate-300 text-slate-900'
                  }`}
                >
                  {CD_RATIO_OPTIONS.map(cdr => <option key={cdr} value={cdr}>{cdr}</option>)}
                </select>
              </div>
            </div>

            {/* Macula & Foveal Reflex */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Macula & Fovea</label>
                <select
                  value={fundus.od?.macula?.status || 'Normal'}
                  onChange={e => updateFundusPart('od', 'macula', 'status', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
                >
                  {MACULA_STATUSES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Retinal Vessels & AV Ratio</label>
                <select
                  value={fundus.od?.vessels?.avRatio || '2:3'}
                  onChange={e => updateFundusPart('od', 'vessels', 'avRatio', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
                >
                  {VESSEL_RATIOS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            {/* Retina Periphery */}
            <div>
              <label className="text-[10px] font-bold text-slate-700 block mb-1">Retinal Background & Periphery</label>
              <select
                value={fundus.od?.retina?.status || 'Normal'}
                onChange={e => updateFundusPart('od', 'retina', 'status', e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs rounded p-2"
              >
                {RETINA_STATUSES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">OD Fundus Specific Notes</label>
              <input
                type="text"
                value={fundus.od?.opticDisc?.notes || ''}
                onChange={e => updateFundusPart('od', 'opticDisc', 'notes', e.target.value)}
                placeholder="e.g. Mild hard exudates at superior arcade, no NVD/NVE..."
                className="w-full bg-white border border-slate-300 text-xs rounded p-2"
              />
            </div>
          </div>

          {/* OS Fundus Column */}
          <div className="bg-emerald-50/30 rounded-xl p-4 border border-emerald-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <span className="text-xs font-black text-emerald-900 uppercase">
                OS (Left Eye Fundus / রেটিনা)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">OS</span>
            </div>

            {/* Optic Disc & CDR */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Optic Disc Status</label>
                <select
                  value={fundus.os?.opticDisc?.status || 'Normal'}
                  onChange={e => updateFundusPart('os', 'opticDisc', 'status', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
                >
                  {OPTIC_DISC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Cup-to-Disc (CD Ratio)</label>
                <select
                  value={fundus.os?.cdRatio || '0.3'}
                  onChange={e => updateFundusPart('os', 'cdRatio', '', e.target.value)}
                  className={`w-full bg-white border text-xs font-bold rounded p-1.5 ${
                    parseFloat(fundus.os?.cdRatio || '0') >= 0.7 ? 'border-rose-400 text-rose-900' : 'border-slate-300 text-slate-900'
                  }`}
                >
                  {CD_RATIO_OPTIONS.map(cdr => <option key={cdr} value={cdr}>{cdr}</option>)}
                </select>
              </div>
            </div>

            {/* Macula & Foveal Reflex */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Macula & Fovea</label>
                <select
                  value={fundus.os?.macula?.status || 'Normal'}
                  onChange={e => updateFundusPart('os', 'macula', 'status', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
                >
                  {MACULA_STATUSES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Retinal Vessels & AV Ratio</label>
                <select
                  value={fundus.os?.vessels?.avRatio || '2:3'}
                  onChange={e => updateFundusPart('os', 'vessels', 'avRatio', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
                >
                  {VESSEL_RATIOS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            {/* Retina Periphery */}
            <div>
              <label className="text-[10px] font-bold text-slate-700 block mb-1">Retinal Background & Periphery</label>
              <select
                value={fundus.os?.retina?.status || 'Normal'}
                onChange={e => updateFundusPart('os', 'retina', 'status', e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs rounded p-2"
              >
                {RETINA_STATUSES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">OS Fundus Specific Notes</label>
              <input
                type="text"
                value={fundus.os?.opticDisc?.notes || ''}
                onChange={e => updateFundusPart('os', 'opticDisc', 'notes', e.target.value)}
                placeholder="e.g. Sharp disc margins, healthy foveal reflex..."
                className="w-full bg-white border border-slate-300 text-xs rounded p-2"
              />
            </div>
          </div>

        </div>
      </ClinicalSectionCard>

      {/* 16. KERATOMETRY (CORNEAL CURVATURE K1/K2) */}
      <ClinicalSectionCard
        id="keratometry"
        orderNumber={16}
        title="Keratometry (Corneal Curvature K1/K2 & Corneal Astigmatism)"
        bnTitle="কর্নিয়াল কার্ভেচার K1 ও K2 পরিমাপ (IOL পাওয়ার ক্যালকুলেশন ও কন্টাক্ট লেন্স ফিটিং)"
        category="Lens & Fundus"
        icon={<Disc className="w-4 h-4" />}
        isSelected={selectedSections.keratometry}
        status={selectedSections.keratometry ? 'COMPLETED' : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={`OD: ${keratometry.od?.k1 || '-'} / ${keratometry.od?.k2 || '-'} • OS: ${keratometry.os?.k1 || '-'} / ${keratometry.os?.k2 || '-'}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OD Keratometry */}
          <div className="bg-blue-50/40 rounded-xl p-3.5 border border-blue-200 space-y-2">
            <span className="text-xs font-black text-blue-900 uppercase block pb-1 border-b border-blue-200">
              OD (Right Eye Keratometry)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">K1 (Flat)</label>
                <input
                  type="text"
                  value={keratometry.od?.k1 || ''}
                  onChange={e => updateKeratometry('od', 'k1', e.target.value)}
                  placeholder="43.50 D @ 180°"
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">K2 (Steep)</label>
                <input
                  type="text"
                  value={keratometry.od?.k2 || ''}
                  onChange={e => updateKeratometry('od', 'k2', e.target.value)}
                  placeholder="44.00 D @ 90°"
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Corneal Cyl</label>
                <input
                  type="text"
                  value={keratometry.od?.cylAstig || ''}
                  onChange={e => updateKeratometry('od', 'cylAstig', e.target.value)}
                  placeholder="-0.50 D"
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5 font-bold text-blue-900"
                />
              </div>
            </div>
          </div>

          {/* OS Keratometry */}
          <div className="bg-emerald-50/40 rounded-xl p-3.5 border border-emerald-200 space-y-2">
            <span className="text-xs font-black text-emerald-900 uppercase block pb-1 border-b border-emerald-200">
              OS (Left Eye Keratometry)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">K1 (Flat)</label>
                <input
                  type="text"
                  value={keratometry.os?.k1 || ''}
                  onChange={e => updateKeratometry('os', 'k1', e.target.value)}
                  placeholder="43.50 D @ 180°"
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">K2 (Steep)</label>
                <input
                  type="text"
                  value={keratometry.os?.k2 || ''}
                  onChange={e => updateKeratometry('os', 'k2', e.target.value)}
                  placeholder="44.00 D @ 90°"
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Corneal Cyl</label>
                <input
                  type="text"
                  value={keratometry.os?.cylAstig || ''}
                  onChange={e => updateKeratometry('os', 'cylAstig', e.target.value)}
                  placeholder="-0.50 D"
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5 font-bold text-emerald-900"
                />
              </div>
            </div>
          </div>
        </div>
      </ClinicalSectionCard>

    </div>
  );
};
