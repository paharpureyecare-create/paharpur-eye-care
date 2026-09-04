import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { ClinicalExamination, PrescribedMedicine, MedicineMaster } from '../../types';
import {
  COMMON_DIAGNOSES_MASTER,
  INVESTIGATION_OPTIONS,
  SURGERY_ADVICE_OPTIONS,
  REFERRAL_OPTIONS,
  SPECTACLE_TYPE_OPTIONS,
  FOLLOW_UP_INTERVALS,
  MEDICINE_CATEGORIES,
  MEDICINE_FORMS,
  MEDICINE_ROUTES
} from '../../data/clinicalMasterData';
import { ClinicalSectionId } from '../../types/clinicalSections';
import { ClinicalSectionCard } from './ClinicalSectionCard';
import {
  Stethoscope,
  Plus,
  Trash2,
  Calendar,
  FileText,
  Pill,
  Glasses,
  Activity,
  UserCheck,
  Tag,
  Search,
  Star,
  ExternalLink,
  ChevronDown,
  Copy,
  ShieldCheck
} from 'lucide-react';

interface Props {
  examination: ClinicalExamination;
  diagnoses: string[];
  chiefComplaints: string;
  prescribedMedicines: PrescribedMedicine[];
  selectedSections: Record<ClinicalSectionId, boolean>;
  onToggleSection: (id: ClinicalSectionId) => void;
  onExamChange: (updater: (prev: ClinicalExamination) => ClinicalExamination) => void;
  onDiagnosesChange: (diagnoses: string[]) => void;
  onMedicinesChange: (medicines: PrescribedMedicine[]) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const DiagnosisTreatmentPlanSection: React.FC<Props> = ({
  examination,
  diagnoses,
  chiefComplaints,
  prescribedMedicines,
  selectedSections,
  onToggleSection,
  onExamChange,
  onDiagnosesChange,
  onMedicinesChange,
  showToast
}) => {
  const { medicines, setActiveTab } = useErp();

  const [customDiagInput, setCustomDiagInput] = useState('');
  const [selectedDiagEye, setSelectedDiagEye] = useState<'OU' | 'OD' | 'OS'>('OU');
  const [diagSearch, setDiagSearch] = useState('');

  // Medicine Search & Dynamic Selection State
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [selectedMedCategoryFilter, setSelectedMedCategoryFilter] = useState<string>('All');
  const [isMedDropdownOpen, setIsMedDropdownOpen] = useState(false);

  const treatment = examination?.treatmentPlan || {
    prescriptionAdvised: true,
    spectacleAdvised: true,
    spectacleTypeRecommended: 'Progressive (PAL) Blue-Cut ARC',
    medicineAdvised: false,
    investigationAdvised: '',
    followUpInterval: '6 Months',
    followUpDate: '',
    followUpReason: 'Routine Refraction Review',
    referralAdvised: '',
    surgeryAdvice: '',
    otherAdvice: 'Wear prescribed spectacles continuously for reading and screen usage. Follow 20-20-20 rule.',
    notes: ''
  };

  const updateTreatment = (field: keyof typeof treatment, val: any) => {
    onExamChange(prev => {
      const cur = prev.treatmentPlan || treatment;
      const updated = { ...cur, [field]: val };
      return {
        ...prev,
        treatmentPlan: updated
      };
    });
  };

  const handleFollowUpInterval = (intervalLabel: string, days: number) => {
    let targetDateStr = '';
    if (days > 0) {
      const d = new Date();
      d.setDate(d.getDate() + days);
      targetDateStr = d.toISOString().split('T')[0];
    }
    updateTreatment('followUpInterval', intervalLabel);
    if (targetDateStr) {
      updateTreatment('followUpDate', targetDateStr);
    }
    showToast(`Follow-up set to ${intervalLabel} (${targetDateStr || 'As needed'})`);
  };

  const addDiagnosis = (name: string, eye?: 'OD' | 'OS' | 'OU') => {
    const eyeTag = eye || selectedDiagEye;
    const formatted = `${name} (${eyeTag})`;
    if (!diagnoses.includes(formatted) && !diagnoses.includes(name)) {
      onDiagnosesChange([...diagnoses, formatted]);
      showToast(`Added Diagnosis: ${formatted}`);
    }
  };

  const removeDiagnosis = (index: number) => {
    const updated = [...diagnoses];
    updated.splice(index, 1);
    onDiagnosesChange(updated);
  };

  const addCustomDiagnosis = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customDiagInput.trim()) return;
    addDiagnosis(customDiagInput.trim());
    setCustomDiagInput('');
  };

  // Medicine helpers
  const addEmptyMedicine = () => {
    const newMed: PrescribedMedicine = {
      name: '',
      form: 'Eye Drop',
      dose: '1 drop',
      eye: 'OU',
      frequency: '3 times daily (TDS)',
      duration: '14 Days',
      instruction: 'Instill into eye(s) with clean hands'
    };
    onMedicinesChange([...prescribedMedicines, newMed]);
    updateTreatment('medicineAdvised', true);
  };

  const updateMedicine = (index: number, field: keyof PrescribedMedicine, val: string) => {
    const updated = [...prescribedMedicines];
    updated[index] = { ...updated[index], [field]: val };
    onMedicinesChange(updated);
  };

  const removeMedicine = (index: number) => {
    const updated = [...prescribedMedicines];
    updated.splice(index, 1);
    onMedicinesChange(updated);
    if (updated.length === 0) {
      updateTreatment('medicineAdvised', false);
    }
  };

  const duplicateMedicine = (index: number) => {
    const item = prescribedMedicines[index];
    if (!item) return;
    const duplicated = { ...item, eye: item.eye === 'OD' ? 'OS' : item.eye };
    onMedicinesChange([...prescribedMedicines, duplicated]);
    showToast(`Duplicated ${item.name || 'Medicine'}!`, 'info');
  };

  // Add from Master Medicine
  const addMedicineFromMaster = (m: MedicineMaster) => {
    const displayName = m.strength ? `${m.name} (${m.strength})` : m.name;
    const newMed: PrescribedMedicine = {
      name: displayName,
      form: (m.form as any) || 'Eye Drop',
      dose: m.defaultDose || '1 drop',
      eye: (m.defaultEye as any) || 'OU',
      frequency: m.frequency || '3 times daily',
      duration: m.defaultDuration || '14 Days',
      instruction: m.defaultInstruction || m.foodInstruction || 'Instill into eye(s) with clean hands.'
    };
    onMedicinesChange([...prescribedMedicines, newMed]);
    updateTreatment('medicineAdvised', true);
    setMedSearchQuery('');
    setIsMedDropdownOpen(false);
    showToast(`Added ${m.name} to Prescription!`, 'success');
  };

  // Dynamic Favorites from Medicine Master
  const favoriteMedicines = useMemo(() => {
    return (medicines || []).filter(
      m => m.active !== false && (m.isFavorite || m.quickAccess)
    );
  }, [medicines]);

  // Filtered Master Medicines for the Search Dropdown
  const searchResultsFromMaster = useMemo(() => {
    const q = (medSearchQuery || '').trim().toLowerCase();
    return (medicines || []).filter(m => {
      if (m.active === false) return false;
      const matchesCategory =
        selectedMedCategoryFilter === 'All' || m.category === selectedMedCategoryFilter;
      if (!matchesCategory) return false;

      if (!q) return true;
      const brand = (m.name || '').toLowerCase();
      const gen = (m.genericName || '').toLowerCase();
      const comp = (m.company || '').toLowerCase();
      const cat = (m.category || '').toLowerCase();
      return brand.includes(q) || gen.includes(q) || comp.includes(q) || cat.includes(q);
    });
  }, [medicines, medSearchQuery, selectedMedCategoryFilter]);

  // Filter diagnoses master list
  const filteredMasterDiagnoses = COMMON_DIAGNOSES_MASTER.filter(item =>
    item.name.toLowerCase().includes(diagSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(diagSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">

      {/* 17. CLINICAL DIAGNOSIS & ICD-10 */}
      <ClinicalSectionCard
        id="diagnosis"
        orderNumber={17}
        title="Clinical Diagnosis & Affected Eye (রোগ নির্ণয় ও ICD-10)"
        bnTitle="Refractive error, Cataract, Glaucoma, Dry eye, Conjunctivitis (OD / OS / OU)"
        category="Diagnosis & Treatment"
        icon={<Stethoscope className="w-4 h-4" />}
        isSelected={selectedSections.diagnosis}
        status={selectedSections.diagnosis ? (diagnoses.length > 0 ? 'COMPLETED' : 'SELECTED') : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={diagnoses.length > 0 ? diagnoses.join(', ') : 'No diagnosis tagged'}
        rightHeaderAction={
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <span className="text-[10px] font-bold text-slate-500 px-1">Eye:</span>
            {(['OU', 'OD', 'OS'] as const).map(eye => (
              <button
                key={eye}
                type="button"
                onClick={() => setSelectedDiagEye(eye)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                  selectedDiagEye === eye
                    ? 'bg-violet-600 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                {eye}
              </button>
            ))}
          </div>
        }
      >
        <div className="space-y-4">
          {/* Selected Diagnoses List */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Selected Clinical Diagnoses ({diagnoses.length})
            </label>

            {diagnoses.length === 0 ? (
              <div className="p-3.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                No diagnosis selected yet. Click any quick preset tag below or type a custom diagnosis.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {diagnoses.map((diag, idx) => (
                  <span
                    key={`sel-diag-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-50 text-violet-900 border border-violet-200 shadow-2xs"
                  >
                    <Tag className="w-3 h-3 text-violet-600" />
                    {diag}
                    <button
                      type="button"
                      onClick={() => removeDiagnosis(idx)}
                      className="w-4 h-4 rounded-full hover:bg-violet-200 text-violet-700 flex items-center justify-center ml-1 text-xs font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Custom Diagnosis Input */}
          <form onSubmit={addCustomDiagnosis} className="flex gap-2">
            <input
              type="text"
              value={customDiagInput}
              onChange={e => setCustomDiagInput(e.target.value)}
              placeholder="Type custom diagnosis or ICD-10 code (e.g. Chronic Allergic Blepharoconjunctivitis H10.1)..."
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!customDiagInput.trim()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add ({selectedDiagEye})
            </button>
          </form>

          {/* Quick Common Diagnosis Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Quick Pick Master Diagnoses ({selectedDiagEye})
              </span>
              <input
                type="text"
                value={diagSearch}
                onChange={e => setDiagSearch(e.target.value)}
                placeholder="Search diagnosis..."
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 w-40"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-2 bg-slate-50/50 rounded-xl border border-slate-100">
              {filteredMasterDiagnoses.map((item, idx) => (
                <button
                  key={`qdiag-${idx}`}
                  type="button"
                  onClick={() => addDiagnosis(item.name)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white hover:bg-violet-50 text-slate-800 hover:text-violet-900 border border-slate-200 hover:border-violet-300 transition-colors flex items-center gap-1"
                >
                  <span>+</span>
                  <span>{item.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono">[{item.icd10}]</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ClinicalSectionCard>

      {/* 18. TREATMENT & MANAGEMENT PLAN */}
      <ClinicalSectionCard
        id="treatmentPlan"
        orderNumber={18}
        title="Treatment & Management Plan (চিকিৎসা, চশমার পরামর্শ ও ফলো-আপ)"
        bnTitle="Spectacle advice, surgical counseling, diagnostic investigations & follow-up"
        category="Diagnosis & Treatment"
        icon={<FileText className="w-4 h-4" />}
        isSelected={selectedSections.treatmentPlan}
        status={selectedSections.treatmentPlan ? 'COMPLETED' : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={`Spectacles: ${treatment.spectacleAdvised ? (treatment.spectacleTypeRecommended || 'Yes') : 'No'} • Follow-up: ${treatment.followUpInterval || '6 Months'}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Spectacle Advice */}
            <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Glasses className="w-3.5 h-3.5" />
                  Spectacle Advice (চশমার পরামর্শ)
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={treatment.spectacleAdvised}
                    onChange={e => updateTreatment('spectacleAdvised', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-blue-900">Advised</span>
                </label>
              </div>

              {treatment.spectacleAdvised && (
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Recommended Lens Type</label>
                  <select
                    value={treatment.spectacleTypeRecommended || 'Progressive (PAL) Blue-Cut ARC'}
                    onChange={e => updateTreatment('spectacleTypeRecommended', e.target.value)}
                    className="w-full bg-white border border-slate-300 text-xs font-semibold rounded p-1.5"
                  >
                    {SPECTACLE_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Surgery Advice */}
            <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Surgical / Procedure Advice (অপারেশন পরামর্শ)
              </span>
              <select
                value={treatment.surgeryAdvice || ''}
                onChange={e => updateTreatment('surgeryAdvice', e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs font-semibold rounded p-1.5"
              >
                <option value="">No Surgery Advised (Medical / Refractive Only)</option>
                {SURGERY_ADVICE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Investigation Advised */}
            <div className="p-3.5 bg-purple-50/40 rounded-xl border border-purple-200 space-y-2">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                Investigation / Lab Tests (ডায়াগনস্টিক পরীক্ষা)
              </span>
              <select
                value={treatment.investigationAdvised || ''}
                onChange={e => updateTreatment('investigationAdvised', e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs font-semibold rounded p-1.5"
              >
                <option value="">No Special Investigation Required</option>
                {INVESTIGATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Referral Advised */}
            <div className="p-3.5 bg-teal-50/40 rounded-xl border border-teal-200 space-y-2">
              <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                Specialist Referral (বিশেষজ্ঞ রেফারেল)
              </span>
              <select
                value={treatment.referralAdvised || ''}
                onChange={e => updateTreatment('referralAdvised', e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs font-semibold rounded p-1.5"
              >
                <option value="">No Referral Required</option>
                {REFERRAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

          </div>

          {/* General Clinical Advice & Follow-Up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            {/* General Advice */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Doctor Instructions & Lifestyle Advice
              </label>
              <textarea
                rows={3}
                value={treatment.otherAdvice || ''}
                onChange={e => updateTreatment('otherAdvice', e.target.value)}
                placeholder="e.g. Wear sunglasses outdoors, follow 20-20-20 screen rule, clean spectacles with microfiber..."
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Follow-up / Review Scheduling */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Next Review / Revisit Timeline</span>
                <span className="text-teal-700 font-black">
                  {treatment.followUpDate ? `Target: ${treatment.followUpDate}` : 'As needed (SOS)'}
                </span>
              </label>

              {/* Quick Intervals */}
              <div className="flex flex-wrap gap-1.5">
                {FOLLOW_UP_INTERVALS.map(int => (
                  <button
                    key={int.label}
                    type="button"
                    onClick={() => handleFollowUpInterval(int.label, int.days)}
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-all ${
                      treatment.followUpInterval === int.label
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {int.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Exact Review Date</span>
                  <input
                    type="date"
                    value={treatment.followUpDate || ''}
                    onChange={e => updateTreatment('followUpDate', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Follow-Up Reason</span>
                  <input
                    type="text"
                    value={treatment.followUpReason || ''}
                    onChange={e => updateTreatment('followUpReason', e.target.value)}
                    placeholder="Routine / IOP Check / Post-op"
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ClinicalSectionCard>

      {/* 19. PRESCRIBED OPHTHALMIC MEDICINES (RX) */}
      <ClinicalSectionCard
        id="medicines"
        orderNumber={19}
        title="Prescribed Ophthalmic Medicines (চোখের ওষুধ ও ড্রপ প্রেসক্রিপশন)"
        bnTitle="Medicine Master linked eye drops, ointments, doses, frequencies & durations"
        category="Diagnosis & Treatment"
        icon={<Pill className="w-4 h-4 text-teal-600" />}
        isSelected={selectedSections.medicines}
        status={selectedSections.medicines ? (prescribedMedicines.length > 0 ? 'COMPLETED' : 'SELECTED') : 'NOT_SELECTED'}
        onToggle={onToggleSection}
        summaryPreview={prescribedMedicines.length > 0 ? `${prescribedMedicines.length} Medicine(s) Prescribed` : 'No medicines prescribed'}
        rightHeaderAction={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('medicines')}
              className="text-[11px] font-bold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-teal-700 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Master DB
            </button>
            <button
              type="button"
              onClick={addEmptyMedicine}
              className="text-[11px] font-bold px-2 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              + Custom
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          
          {/* DYNAMIC QUICK-ACCESS CHIPS (Admin-Configured Favorites from Master) */}
          <div className="p-3 bg-teal-50/40 rounded-xl border border-teal-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                Quick-Access Medicine Presets (দ্রুত প্রেসক্রিপশন শর্টকাট)
              </span>
              <span className="text-[10px] font-semibold text-teal-700">
                1-Click to Prescribe ({favoriteMedicines.length} Available)
              </span>
            </div>

            {favoriteMedicines.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">
                No favorite medicines marked yet. You can mark any medicine with ⭐ in the Medicine Master for 1-click prescribing here.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {favoriteMedicines.map(fav => (
                  <button
                    key={`fav-med-${fav.id}`}
                    type="button"
                    onClick={() => addMedicineFromMaster(fav)}
                    title={`Add ${fav.name} (${fav.genericName}) to prescription`}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-white hover:bg-teal-600 hover:text-white text-slate-800 border border-teal-200 hover:border-teal-600 shadow-2xs transition-all flex items-center gap-1.5 group"
                  >
                    <Plus className="w-3 h-3 text-teal-600 group-hover:text-white" />
                    <span>{fav.name}</span>
                    {fav.strength && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 group-hover:bg-teal-700 group-hover:text-white font-medium">
                        {fav.strength}
                      </span>
                    )}
                    <span className="text-[9px] text-teal-700 group-hover:text-teal-100 font-normal">
                      [{fav.category.split('/')[0].trim()}]
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DYNAMIC MEDICINE MASTER AUTOCOMPLETE SEARCH & PICKER */}
          <div className="relative">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={medSearchQuery}
                  onFocus={() => setIsMedDropdownOpen(true)}
                  onChange={e => {
                    setMedSearchQuery(e.target.value);
                    setIsMedDropdownOpen(true);
                  }}
                  placeholder="🔍 Search Medicine Master (Type Brand Name, Generic Composition, Category e.g. Vigamox, Refresh, Alcon)..."
                  className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder:text-slate-400"
                />
                {medSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setMedSearchQuery('');
                      setIsMedDropdownOpen(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              <select
                value={selectedMedCategoryFilter}
                onChange={e => {
                  setSelectedMedCategoryFilter(e.target.value);
                  setIsMedDropdownOpen(true);
                }}
                className="bg-white border border-slate-300 text-xs font-semibold text-slate-800 rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none sm:w-56"
              >
                <option value="All">All Categories ({medicines.length})</option>
                {MEDICINE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setIsMedDropdownOpen(!isMedDropdownOpen)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-slate-200"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMedDropdownOpen ? 'rotate-180' : ''}`} />
                <span>Browse Directory</span>
              </button>
            </div>

            {/* Autocomplete Dropdown List */}
            {isMedDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-300 rounded-2xl shadow-xl max-h-72 overflow-y-auto p-2 divide-y divide-slate-100">
                <div className="p-2 flex items-center justify-between text-[11px] font-bold text-slate-500 bg-slate-50 rounded-xl mb-1">
                  <span>Found {searchResultsFromMaster.length} Formulations in Master</span>
                  <button
                    type="button"
                    onClick={() => setIsMedDropdownOpen(false)}
                    className="text-teal-700 hover:underline font-bold"
                  >
                    Close Dropdown
                  </button>
                </div>

                {searchResultsFromMaster.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No medicine matches "{medSearchQuery}". You can click "+ Custom Medicine" to add an unlisted drug.
                  </div>
                ) : (
                  searchResultsFromMaster.map(med => (
                    <div
                      key={`search-med-${med.id}`}
                      onClick={() => addMedicineFromMaster(med)}
                      className="p-2.5 hover:bg-teal-50 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs group-hover:text-teal-900">
                            {med.name}
                          </span>
                          {med.strength && (
                            <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-1.5 py-0.2 rounded">
                              {med.strength}
                            </span>
                          )}
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {med.form}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium mt-0.5 flex items-center gap-2">
                          <span><strong>Gen:</strong> {med.genericName || '—'}</span>
                          {med.company && <span>• <strong>Co:</strong> {med.company}</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Default: [{med.defaultEye || 'OU'}] {med.defaultDose || '1 drop'} • {med.frequency || '3 times daily'} • {med.defaultDuration || '14 days'}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                          + Select & Add
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* PRESCRIBED MEDICINES TABLE */}
          {prescribedMedicines.length === 0 ? (
            <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
              <Pill className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                No medicines prescribed for this visit yet.
              </p>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                Click any quick preset above, search from the Medicine Master directory, or click "+ Custom Medicine" to prescribe eye drops, gels, or tablets.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-8 text-center">#</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Medicine / Eye Drop Brand</th>
                      <th className="py-2.5 px-2 w-28">Dosage Form</th>
                      <th className="py-2.5 px-2 w-28">Eye / Route</th>
                      <th className="py-2.5 px-2 min-w-[140px]">Dose & Frequency</th>
                      <th className="py-2.5 px-2 w-28">Duration</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Instructions / Directions</th>
                      <th className="py-2.5 px-2 w-16 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {prescribedMedicines.map((med, idx) => (
                      <tr key={`prescribed-med-${idx}`} className="hover:bg-slate-50/90 transition-colors">
                        {/* Index */}
                        <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Medicine Name */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={med.name}
                            onChange={e => updateMedicine(idx, 'name', e.target.value)}
                            placeholder="e.g. Refresh Tears 0.5% Drop"
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                        </td>

                        {/* Form */}
                        <td className="py-2 px-2">
                          <select
                            value={med.form || 'Eye Drop'}
                            onChange={e => updateMedicine(idx, 'form', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                          >
                            {MEDICINE_FORMS.map(f => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </td>

                        {/* Eye / Route */}
                        <td className="py-2 px-2">
                          <select
                            value={med.eye || 'OU'}
                            onChange={e => updateMedicine(idx, 'eye', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-indigo-700 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                          >
                            {MEDICINE_ROUTES.map(r => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                        </td>

                        {/* Frequency */}
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={med.frequency || '3 times daily (TDS)'}
                            onChange={e => updateMedicine(idx, 'frequency', e.target.value)}
                            placeholder="3 times daily / Once at night"
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                          />
                        </td>

                        {/* Duration */}
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={med.duration || '14 Days'}
                            onChange={e => updateMedicine(idx, 'duration', e.target.value)}
                            placeholder="14 Days"
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                          />
                        </td>

                        {/* Instruction */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={med.instruction || ''}
                            onChange={e => updateMedicine(idx, 'instruction', e.target.value)}
                            placeholder="Instill into eye(s) with clean hands..."
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                          />
                        </td>

                        {/* Actions (Duplicate & Delete) */}
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => duplicateMedicine(idx)}
                              title="Duplicate row (e.g. for other eye)"
                              className="p-1 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeMedicine(idx)}
                              title="Remove Medicine"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Data Integrity / Stock Separation Note */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 px-4">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <strong>Clinical & Inventory Data Separation:</strong> Prescriptions are stored in the patient's medical history without automatically altering master stock inventory.
                </span>
                <span className="font-bold text-slate-700">
                  Total Items: {prescribedMedicines.length}
                </span>
              </div>
            </div>
          )}

        </div>
      </ClinicalSectionCard>

    </div>
  );
};
