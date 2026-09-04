import React from 'react';
import { ClinicalExamination } from '../../types';
import { ClinicalSectionId } from '../../types/clinicalSections';
import { ClinicalSectionCard } from './ClinicalSectionCard';
import { Microscope, Check, Layers, Eye } from 'lucide-react';

interface Props {
  examination: ClinicalExamination;
  selectedSections: Record<ClinicalSectionId, boolean>;
  onToggleSection: (id: ClinicalSectionId) => void;
  onExamChange: (updater: (prev: ClinicalExamination) => ClinicalExamination) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const SlitLampAnteriorSection: React.FC<Props> = ({
  examination,
  selectedSections,
  onToggleSection,
  onExamChange,
  showToast
}) => {
  const slitLamp = examination?.slitLamp || {
    od: {
      conjunctiva: { status: 'Normal', notes: '' },
      sclera: { status: 'Normal', notes: '' },
      cornea: { status: 'Normal', notes: '' },
      anteriorChamber: { status: 'Normal', depth: 'Deep & Quiet', cellsFlare: 'Nil', notes: '' },
      iris: { status: 'Normal', notes: '' },
      pupil: { status: 'Normal', notes: '' },
      lens: { status: 'Normal', notes: '' },
      other: { status: 'Normal', notes: '' }
    },
    os: {
      conjunctiva: { status: 'Normal', notes: '' },
      sclera: { status: 'Normal', notes: '' },
      cornea: { status: 'Normal', notes: '' },
      anteriorChamber: { status: 'Normal', depth: 'Deep & Quiet', cellsFlare: 'Nil', notes: '' },
      iris: { status: 'Normal', notes: '' },
      pupil: { status: 'Normal', notes: '' },
      lens: { status: 'Normal', notes: '' },
      other: { status: 'Normal', notes: '' }
    },
    notes: ''
  };

  const external = examination?.externalExam || {
    od: {
      lids: { status: 'Normal', notes: '' },
      lashes: { status: 'Normal', notes: '' },
      lacrimalSystem: { status: 'Normal', notes: '' },
      periorbitalArea: { status: 'Normal', notes: '' },
      conjunctiva: { status: 'Normal', notes: '' },
      sclera: { status: 'Normal', notes: '' }
    },
    os: {
      lids: { status: 'Normal', notes: '' },
      lashes: { status: 'Normal', notes: '' },
      lacrimalSystem: { status: 'Normal', notes: '' },
      periorbitalArea: { status: 'Normal', notes: '' },
      conjunctiva: { status: 'Normal', notes: '' },
      sclera: { status: 'Normal', notes: '' }
    },
    notes: ''
  };

  const updateSlitLampPart = (eye: 'od' | 'os', part: string, status: string, notes?: string) => {
    onExamChange(prev => {
      const current = prev.slitLamp || slitLamp;
      const eyeData = current[eye] as any;
      const partData = eyeData[part] || { status: 'Normal', notes: '' };
      const updatedPart = { ...partData, status, notes: notes !== undefined ? notes : partData.notes };
      const updatedEye = { ...eyeData, [part]: updatedPart };
      const updatedSlitLamp = { ...current, [eye]: updatedEye };
      return {
        ...prev,
        anteriorSegmentStatus: status !== 'Normal' ? 'Abnormal' : prev.anteriorSegmentStatus,
        slitLamp: updatedSlitLamp
      };
    });
  };

  const updateExternalPart = (eye: 'od' | 'os', part: string, status: string, notes?: string) => {
    onExamChange(prev => {
      const current = prev.externalExam || external;
      const eyeData = current[eye] as any;
      const partData = eyeData[part] || { status: 'Normal', notes: '' };
      const updatedPart = { ...partData, status, notes: notes !== undefined ? notes : partData.notes };
      const updatedEye = { ...eyeData, [part]: updatedPart };
      const updatedExternal = { ...current, [eye]: updatedEye };
      return {
        ...prev,
        adnexaStatus: status !== 'Normal' ? 'Abnormal' : prev.adnexaStatus,
        externalExam: updatedExternal
      };
    });
  };

  const setAllNormalSlitLamp = () => {
    onExamChange(prev => ({
      ...prev,
      adnexaStatus: 'Normal',
      adnexaNotes: 'Lids & adnexa healthy, puncta patent',
      anteriorSegmentStatus: 'Normal',
      anteriorSegmentNotes: 'Cornea clear, AC quiet & deep, iris pattern normal',
      externalExam: {
        od: { lids: { status: 'Normal', notes: '' }, lashes: { status: 'Normal', notes: '' }, lacrimalSystem: { status: 'Normal / Patent', notes: '' }, periorbitalArea: { status: 'Normal', notes: '' }, conjunctiva: { status: 'Normal', notes: '' }, sclera: { status: 'Normal', notes: '' } },
        os: { lids: { status: 'Normal', notes: '' }, lashes: { status: 'Normal', notes: '' }, lacrimalSystem: { status: 'Normal / Patent', notes: '' }, periorbitalArea: { status: 'Normal', notes: '' }, conjunctiva: { status: 'Normal', notes: '' }, sclera: { status: 'Normal', notes: '' } },
        notes: 'External adnexa normal bilaterally.'
      },
      slitLamp: {
        od: {
          conjunctiva: { status: 'Normal', notes: 'Clear, no congestion' },
          sclera: { status: 'Normal', notes: 'White, quiet' },
          cornea: { status: 'Normal / Clear', notes: 'Clear, compact, smooth' },
          anteriorChamber: { status: 'Normal / Deep & Quiet', depth: 'Deep & Quiet', cellsFlare: 'Nil', notes: '' },
          iris: { status: 'Normal', notes: 'Pattern clear, no rubeosis' },
          pupil: { status: 'Normal', notes: 'Round, regular' },
          lens: { status: 'Normal / Clear', notes: 'Clear' },
          other: { status: 'Normal', notes: '' }
        },
        os: {
          conjunctiva: { status: 'Normal', notes: 'Clear, no congestion' },
          sclera: { status: 'Normal', notes: 'White, quiet' },
          cornea: { status: 'Normal / Clear', notes: 'Clear, compact, smooth' },
          anteriorChamber: { status: 'Normal / Deep & Quiet', depth: 'Deep & Quiet', cellsFlare: 'Nil', notes: '' },
          iris: { status: 'Normal', notes: 'Pattern clear, no rubeosis' },
          pupil: { status: 'Normal', notes: 'Round, regular' },
          lens: { status: 'Normal / Clear', notes: 'Clear' },
          other: { status: 'Normal', notes: '' }
        },
        notes: 'Slit lamp biomicroscopy normal bilaterally. AC deep and quiet.'
      }
    }));
    showToast('Set Anterior Segment & Slit Lamp to Bilateral Normal');
  };

  return (
    <div className="space-y-4">

      {/* 12. EXTERNAL EYE & ADNEXA */}
      <ClinicalSectionCard
        id="externalExam"
        orderNumber={12}
        title="External Eye & Adnexa (বাহ্যিক চোখ, চোখের পাতা ও ল্যাক্রিমাল)"
        bnTitle="Lids, lashes, blepharitis, ptosis & lacrimal duct syringing"
        category="Slit Lamp"
        icon={<Layers className="w-4 h-4" />}
        isSelected={selectedSections.externalExam}
        status={selectedSections.externalExam ? 'COMPLETED' : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={`OD: ${external.od?.lids?.status || 'Normal'} (${external.od?.lacrimalSystem?.status || 'Patent'}) • OS: ${external.os?.lids?.status || 'Normal'}`}
        rightHeaderAction={
          <button
            type="button"
            onClick={() => {
              updateExternalPart('od', 'lids', 'Normal');
              updateExternalPart('od', 'lacrimalSystem', 'Normal / Patent');
              updateExternalPart('os', 'lids', 'Normal');
              updateExternalPart('os', 'lacrimalSystem', 'Normal / Patent');
              showToast('Set External Adnexa to Normal');
            }}
            className="text-[11px] font-bold px-2 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors"
          >
            ✓ Normal Lids
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OD Adnexa */}
          <div className="bg-blue-50/40 rounded-xl p-3.5 border border-blue-200 space-y-2.5">
            <span className="text-xs font-black text-blue-900 uppercase block pb-1 border-b border-blue-200">
              OD (Right Eye Adnexa)
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Lids & Lashes</label>
                <select
                  value={external.od?.lids?.status || 'Normal'}
                  onChange={e => updateExternalPart('od', 'lids', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5 font-semibold"
                >
                  <option value="Normal">Normal</option>
                  <option value="Blepharitis">Blepharitis</option>
                  <option value="Meibomianitis / MGD">MGD / Meibomianitis</option>
                  <option value="Chalazion">Chalazion</option>
                  <option value="Stye / Hordeolum">Stye / Hordeolum</option>
                  <option value="Trichiasis">Trichiasis</option>
                  <option value="Entropion">Entropion</option>
                  <option value="Ectropion">Ectropion</option>
                  <option value="Ptosis">Ptosis</option>
                  <option value="Lagophthalmos">Lagophthalmos</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Lacrimal / Syringing</label>
                <select
                  value={external.od?.lacrimalSystem?.status || 'Normal'}
                  onChange={e => updateExternalPart('od', 'lacrimalSystem', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5 font-semibold"
                >
                  <option value="Normal / Patent">Patent / Clear</option>
                  <option value="Regurgitation / Blocked">Regurgitation / Blocked</option>
                  <option value="Epiphora (Watering)">Epiphora (Watering)</option>
                  <option value="Chronic Dacryocystitis">Chronic Dacryocystitis</option>
                  <option value="Acute Dacryocystitis">Acute Dacryocystitis</option>
                </select>
              </div>
            </div>
          </div>

          {/* OS Adnexa */}
          <div className="bg-emerald-50/40 rounded-xl p-3.5 border border-emerald-200 space-y-2.5">
            <span className="text-xs font-black text-emerald-900 uppercase block pb-1 border-b border-emerald-200">
              OS (Left Eye Adnexa)
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Lids & Lashes</label>
                <select
                  value={external.os?.lids?.status || 'Normal'}
                  onChange={e => updateExternalPart('os', 'lids', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5 font-semibold"
                >
                  <option value="Normal">Normal</option>
                  <option value="Blepharitis">Blepharitis</option>
                  <option value="Meibomianitis / MGD">MGD / Meibomianitis</option>
                  <option value="Chalazion">Chalazion</option>
                  <option value="Stye / Hordeolum">Stye / Hordeolum</option>
                  <option value="Trichiasis">Trichiasis</option>
                  <option value="Entropion">Entropion</option>
                  <option value="Ectropion">Ectropion</option>
                  <option value="Ptosis">Ptosis</option>
                  <option value="Lagophthalmos">Lagophthalmos</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Lacrimal / Syringing</label>
                <select
                  value={external.os?.lacrimalSystem?.status || 'Normal'}
                  onChange={e => updateExternalPart('os', 'lacrimalSystem', e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5 font-semibold"
                >
                  <option value="Normal / Patent">Patent / Clear</option>
                  <option value="Regurgitation / Blocked">Regurgitation / Blocked</option>
                  <option value="Epiphora (Watering)">Epiphora (Watering)</option>
                  <option value="Chronic Dacryocystitis">Chronic Dacryocystitis</option>
                  <option value="Acute Dacryocystitis">Acute Dacryocystitis</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </ClinicalSectionCard>

      {/* 13. SLIT LAMP EXAMINATION (ANTERIOR SEGMENT) */}
      <ClinicalSectionCard
        id="slitLamp"
        orderNumber={13}
        title="Slit Lamp Biomicroscopy (Anterior Segment / কর্নিয়া, এন্টেরিয়ার চেম্বার ও আইরিস)"
        bnTitle="কর্নিয়া আলসার, ইনফিল্ট্রেট, কেরাটাইটিস, চেম্বার ডেপথ ও ইউভিয়াইটিস পরীক্ষা"
        category="Slit Lamp"
        icon={<Microscope className="w-4 h-4" />}
        isSelected={selectedSections.slitLamp}
        status={selectedSections.slitLamp ? 'COMPLETED' : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={`OD: ${slitLamp.od?.cornea?.status || 'Normal'} (AC: ${slitLamp.od?.anteriorChamber?.depth || 'Deep'}) • OS: ${slitLamp.os?.cornea?.status || 'Normal'}`}
        rightHeaderAction={
          <button
            type="button"
            onClick={setAllNormalSlitLamp}
            className="text-[11px] font-bold px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-all flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            ✓ Clear Normal Both
          </button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* OD Slit Lamp Column */}
          <div className="bg-blue-50/30 rounded-xl p-4 border border-blue-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200">
              <span className="text-xs font-black text-blue-900 uppercase tracking-wide">
                OD (Right Eye - Anterior Segment)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">OD</span>
            </div>

            {/* Conjunctiva */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Conjunctiva & Sclera</label>
              <select
                value={slitLamp.od?.conjunctiva?.status || 'Normal'}
                onChange={e => updateSlitLampPart('od', 'conjunctiva', e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs rounded p-2 font-medium"
              >
                <option value="Normal">Normal / Clear</option>
                <option value="Ciliary Congestion">Ciliary Congestion (Deep)</option>
                <option value="Conjunctival Congestion">Conjunctival Congestion (Superficial)</option>
                <option value="Mixed Congestion">Mixed Congestion</option>
                <option value="Subconjunctival Hemorrhage">Subconjunctival Hemorrhage (SCH)</option>
                <option value="Pterygium Grade 1-2">Pterygium (Grade 1-2)</option>
                <option value="Pterygium Grade 3-4">Pterygium (Grade 3-4)</option>
                <option value="Pinguecula / Pingueculitis">Pinguecula / Pingueculitis</option>
                <option value="Allergic Papillae">Allergic Papillae / Follicles</option>
                <option value="Chemosis">Chemosis (Edema)</option>
              </select>
            </div>

            {/* Cornea */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Cornea</label>
              <select
                value={slitLamp.od?.cornea?.status || 'Normal'}
                onChange={e => updateSlitLampPart('od', 'cornea', e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs rounded p-2 font-medium"
              >
                <option value="Normal / Clear">Clear & Compact (Normal)</option>
                <option value="Epithelial Defect (Fluorescein +)">Epithelial Defect (Stain +)</option>
                <option value="Corneal Ulcer (Infiltrate)">Corneal Ulcer (Infiltrate)</option>
                <option value="Dendritic Ulcer (HSV)">Dendritic Ulcer (Herpetic)</option>
                <option value="Corneal Opacity (Nebula/Macula)">Corneal Opacity (Nebula / Macula)</option>
                <option value="Leucoma Corneal Opacity">Dense Leucoma Opacity</option>
                <option value="Keratic Precipitates (KPs)">Keratic Precipitates (KPs / Uveitis)</option>
                <option value="Corneal Edema (Hazy)">Corneal Edema (Hazy / Microcystic)</option>
                <option value="Foreign Body (Corneal)">Corneal Foreign Body / Rust Ring</option>
                <option value="Dry Eye (Low TBUT < 5s)">Dry Eye Syndrome (TBUT &lt; 5s)</option>
              </select>
            </div>

            {/* Anterior Chamber (AC) & Cells/Flare */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">AC Depth (Van Herick)</label>
                <select
                  value={slitLamp.od?.anteriorChamber?.depth || 'Deep & Quiet'}
                  onChange={e => updateSlitLampPart('od', 'anteriorChamber', e.target.value, slitLamp.od?.anteriorChamber?.notes)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5 font-medium"
                >
                  <option value="Deep & Quiet">Deep & Quiet (Grade IV)</option>
                  <option value="Normal Depth">Normal Depth (Grade III)</option>
                  <option value="Shallow AC">Shallow AC (Grade II)</option>
                  <option value="Very Shallow / Slit">Very Shallow / Slit (Grade I)</option>
                  <option value="Flat Anterior Chamber">Flat AC (Grade 0 - Closed)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Cells / Flare / Hypopyon</label>
                <select
                  value={slitLamp.od?.anteriorChamber?.cellsFlare || 'Nil'}
                  onChange={e => {
                    const val = e.target.value;
                    onExamChange(prev => {
                      const cur = prev.slitLamp || slitLamp;
                      return {
                        ...prev,
                        slitLamp: {
                          ...cur,
                          od: { ...cur.od, anteriorChamber: { ...cur.od.anteriorChamber, cellsFlare: val } }
                        }
                      };
                    });
                  }}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5 font-medium"
                >
                  <option value="Nil">Nil (Quiet)</option>
                  <option value="Cells 1+ / Flare 1+">Cells 1+ / Flare 1+ (Mild Uveitis)</option>
                  <option value="Cells 2+ / Flare 2+">Cells 2+ / Flare 2+ (Moderate)</option>
                  <option value="Cells 3+ to 4+">Cells 3+ to 4+ (Severe)</option>
                  <option value="Hypopyon Present">Hypopyon Present (Pus in AC)</option>
                  <option value="Hyphema Present">Hyphema Present (Blood in AC)</option>
                </select>
              </div>
            </div>

            {/* Iris */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Iris Pattern & Synechiae</label>
              <select
                value={slitLamp.od?.iris?.status || 'Normal'}
                onChange={e => updateSlitLampPart('od', 'iris', e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs rounded p-2 font-medium"
              >
                <option value="Normal">Normal Pattern & Color</option>
                <option value="Posterior Synechiae">Posterior Synechiae (Iris-Lens adhesion)</option>
                <option value="Anterior Synechiae (PAS)">Peripheral Anterior Synechiae (PAS)</option>
                <option value="Rubeosis Iridis (NVI)">Rubeosis Iridis / NVI (Neovascularization)</option>
                <option value="Iris Coloboma">Iris Coloboma</option>
                <option value="Iris Atrophy">Iris Atrophy</option>
                <option value="Iridodonesis (Tremulous)">Iridodonesis (Tremulous / Subluxated)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">OD Slit Lamp Specific Notes</label>
              <input
                type="text"
                value={slitLamp.od?.other?.notes || ''}
                onChange={e => updateSlitLampPart('od', 'other', slitLamp.od?.other?.status || 'Normal', e.target.value)}
                placeholder="e.g. Fine KPs at Arlt triangle, quiet AC..."
                className="w-full bg-white border border-slate-300 text-xs rounded p-2"
              />
            </div>

          </div>

          {/* OS Slit Lamp Column */}
          <div className="bg-emerald-50/30 rounded-xl p-4 border border-emerald-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <span className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                OS (Left Eye - Anterior Segment)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">OS</span>
            </div>

            {/* Conjunctiva */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Conjunctiva & Sclera</label>
              <select
                value={slitLamp.os?.conjunctiva?.status || 'Normal'}
                onChange={e => updateSlitLampPart('os', 'conjunctiva', e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs rounded p-2 font-medium"
              >
                <option value="Normal">Normal / Clear</option>
                <option value="Ciliary Congestion">Ciliary Congestion (Deep)</option>
                <option value="Conjunctival Congestion">Conjunctival Congestion (Superficial)</option>
                <option value="Mixed Congestion">Mixed Congestion</option>
                <option value="Subconjunctival Hemorrhage">Subconjunctival Hemorrhage (SCH)</option>
                <option value="Pterygium Grade 1-2">Pterygium (Grade 1-2)</option>
                <option value="Pterygium Grade 3-4">Pterygium (Grade 3-4)</option>
                <option value="Pinguecula / Pingueculitis">Pinguecula / Pingueculitis</option>
                <option value="Allergic Papillae">Allergic Papillae / Follicles</option>
                <option value="Chemosis">Chemosis (Edema)</option>
              </select>
            </div>

            {/* Cornea */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Cornea</label>
              <select
                value={slitLamp.os?.cornea?.status || 'Normal'}
                onChange={e => updateSlitLampPart('os', 'cornea', e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs rounded p-2 font-medium"
              >
                <option value="Normal / Clear">Clear & Compact (Normal)</option>
                <option value="Epithelial Defect (Fluorescein +)">Epithelial Defect (Stain +)</option>
                <option value="Corneal Ulcer (Infiltrate)">Corneal Ulcer (Infiltrate)</option>
                <option value="Dendritic Ulcer (HSV)">Dendritic Ulcer (Herpetic)</option>
                <option value="Corneal Opacity (Nebula/Macula)">Corneal Opacity (Nebula / Macula)</option>
                <option value="Leucoma Corneal Opacity">Dense Leucoma Opacity</option>
                <option value="Keratic Precipitates (KPs)">Keratic Precipitates (KPs / Uveitis)</option>
                <option value="Corneal Edema (Hazy)">Corneal Edema (Hazy / Microcystic)</option>
                <option value="Foreign Body (Corneal)">Corneal Foreign Body / Rust Ring</option>
                <option value="Dry Eye (Low TBUT < 5s)">Dry Eye Syndrome (TBUT &lt; 5s)</option>
              </select>
            </div>

            {/* Anterior Chamber (AC) & Cells/Flare */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">AC Depth (Van Herick)</label>
                <select
                  value={slitLamp.os?.anteriorChamber?.depth || 'Deep & Quiet'}
                  onChange={e => updateSlitLampPart('os', 'anteriorChamber', e.target.value, slitLamp.os?.anteriorChamber?.notes)}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5 font-medium"
                >
                  <option value="Deep & Quiet">Deep & Quiet (Grade IV)</option>
                  <option value="Normal Depth">Normal Depth (Grade III)</option>
                  <option value="Shallow AC">Shallow AC (Grade II)</option>
                  <option value="Very Shallow / Slit">Very Shallow / Slit (Grade I)</option>
                  <option value="Flat Anterior Chamber">Flat AC (Grade 0 - Closed)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Cells / Flare / Hypopyon</label>
                <select
                  value={slitLamp.os?.anteriorChamber?.cellsFlare || 'Nil'}
                  onChange={e => {
                    const val = e.target.value;
                    onExamChange(prev => {
                      const cur = prev.slitLamp || slitLamp;
                      return {
                        ...prev,
                        slitLamp: {
                          ...cur,
                          os: { ...cur.os, anteriorChamber: { ...cur.os.anteriorChamber, cellsFlare: val } }
                        }
                      };
                    });
                  }}
                  className="w-full bg-white border border-slate-300 text-xs rounded p-1.5 font-medium"
                >
                  <option value="Nil">Nil (Quiet)</option>
                  <option value="Cells 1+ / Flare 1+">Cells 1+ / Flare 1+ (Mild Uveitis)</option>
                  <option value="Cells 2+ / Flare 2+">Cells 2+ / Flare 2+ (Moderate)</option>
                  <option value="Cells 3+ to 4+">Cells 3+ to 4+ (Severe)</option>
                  <option value="Hypopyon Present">Hypopyon Present (Pus in AC)</option>
                  <option value="Hyphema Present">Hyphema Present (Blood in AC)</option>
                </select>
              </div>
            </div>

            {/* Iris */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Iris Pattern & Synechiae</label>
              <select
                value={slitLamp.os?.iris?.status || 'Normal'}
                onChange={e => updateSlitLampPart('os', 'iris', e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs rounded p-2 font-medium"
              >
                <option value="Normal">Normal Pattern & Color</option>
                <option value="Posterior Synechiae">Posterior Synechiae (Iris-Lens adhesion)</option>
                <option value="Anterior Synechiae (PAS)">Peripheral Anterior Synechiae (PAS)</option>
                <option value="Rubeosis Iridis (NVI)">Rubeosis Iridis / NVI (Neovascularization)</option>
                <option value="Iris Coloboma">Iris Coloboma</option>
                <option value="Iris Atrophy">Iris Atrophy</option>
                <option value="Iridodonesis (Tremulous)">Iridodonesis (Tremulous / Subluxated)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">OS Slit Lamp Specific Notes</label>
              <input
                type="text"
                value={slitLamp.os?.other?.notes || ''}
                onChange={e => updateSlitLampPart('os', 'other', slitLamp.os?.other?.status || 'Normal', e.target.value)}
                placeholder="e.g. Cornea clear, AC quiet and deep..."
                className="w-full bg-white border border-slate-300 text-xs rounded p-2"
              />
            </div>

          </div>

        </div>
      </ClinicalSectionCard>

    </div>
  );
};
