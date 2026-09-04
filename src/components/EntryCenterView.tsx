import React, { useState, useEffect } from 'react';
import { useErp, EMPTY_DRAFT } from '../context/ErpContext';
import { SYMPTOM_OPTIONS } from '../data/seedData';
import { PrescribedMedicine, EyePower, ClinicalExamination } from '../types';
import {
  ClinicalSectionId,
  INITIAL_SECTION_SELECTIONS,
  CLINICAL_PRESETS,
  CLINICAL_SECTIONS_REGISTRY,
  sanitizeClinicalDraftForSave,
  getSectionStatus
} from '../types/clinicalSections';
import { ClinicalSectionCard } from './clinical/ClinicalSectionCard';
import { SaveVisitConfirmationModal } from './clinical/SaveVisitConfirmationModal';
import {
  Stethoscope,
  Save,
  Printer,
  Glasses,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  CheckSquare,
  Square,
  UserCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Calendar,
  Pill,
  ChevronDown,
  CheckCircle,
  FileCheck,
  Eye,
  Activity,
  Microscope,
  Sun,
  Layers,
  FileText,
  Bookmark,
  Check,
  X,
  ListChecks,
  SlidersHorizontal,
  Info
} from 'lucide-react';

import { VisualAcuityRefractionSection } from './clinical/VisualAcuityRefractionSection';
import { IopPupilMotilitySection } from './clinical/IopPupilMotilitySection';
import { SlitLampAnteriorSection } from './clinical/SlitLampAnteriorSection';
import { LensCataractFundusSection } from './clinical/LensCataractFundusSection';
import { DiagnosisTreatmentPlanSection } from './clinical/DiagnosisTreatmentPlanSection';

export const EntryCenterView: React.FC = () => {
  const {
    patients,
    medicines,
    settings,
    clinicalDraft,
    setClinicalDraft,
    saveClinicalVisit,
    clearClinicalDraft,
    setPrintModalData,
    setQuickModal,
    setActiveTab,
    showToast,
    loadPatientIntoClinical
  } = useErp();

  const [selectedPatientMRD, setSelectedPatientMRD] = useState<string>(clinicalDraft.mrd || '');
  const [activeClinicalTab, setActiveClinicalTab] = useState<'all' | 'va' | 'iop' | 'slitlamp' | 'fundus' | 'diagnosis'>('all');

  // "ENABLE / SELECT BEFORE ENTRY" STATE
  // Default: ALL false (not selected) so no unexamined data is ever saved
  const [selectedSections, setSelectedSections] = useState<Record<ClinicalSectionId, boolean>>(INITIAL_SECTION_SELECTIONS);
  const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false);

  const durationList = ['1 Day', '1 Week', '1 Month', '3 Months', '6 Months', '1 Year', 'More than 1 Year'];

  // Auto select patient if clinicalDraft has MRD
  useEffect(() => {
    if (clinicalDraft.mrd) {
      setSelectedPatientMRD(clinicalDraft.mrd);
    }
  }, [clinicalDraft.mrd]);

  // When a previous visit is loaded for editing or symptoms exist, auto-enable non-empty sections
  useEffect(() => {
    if (clinicalDraft.editingVisitId || (Array.isArray(clinicalDraft.symptoms) && clinicalDraft.symptoms.length > 0)) {
      setSelectedSections(prev => {
        const next = { ...prev };
        if (Array.isArray(clinicalDraft.symptoms) && clinicalDraft.symptoms.length > 0) next.chiefComplaints = true;
        if (clinicalDraft.examination?.distanceVa) next.distanceVa = true;
        if (clinicalDraft.examination?.pinholeExam) next.pinholeExam = true;
        if (clinicalDraft.examination?.nearVisionExam) next.nearVision = true;
        if (clinicalDraft.examination?.refractionStages?.autoRefraction) next.autoRefraction = true;
        if (clinicalDraft.odPower?.sph || clinicalDraft.osPower?.sph) next.subjectiveRefraction = true;
        if (clinicalDraft.examination?.tonometry?.odIop || clinicalDraft.examination?.tonometry?.osIop) next.tonometry = true;
        if (clinicalDraft.examination?.pupilExam) next.pupilExam = true;
        if (clinicalDraft.examination?.motility) next.motility = true;
        if (clinicalDraft.examination?.colourVision) next.colourVision = true;
        if (clinicalDraft.examination?.visualField) next.visualField = true;
        if (clinicalDraft.examination?.externalExam) next.externalExam = true;
        if (clinicalDraft.examination?.slitLamp) next.slitLamp = true;
        if (clinicalDraft.examination?.lensCataract) next.lensCataract = true;
        if (clinicalDraft.examination?.fundus) next.fundus = true;
        if (clinicalDraft.examination?.keratometry) next.keratometry = true;
        if (Array.isArray(clinicalDraft.diagnosis) && clinicalDraft.diagnosis.length > 0) next.diagnosis = true;
        if (clinicalDraft.examination?.treatmentPlan || clinicalDraft.advice) next.treatmentPlan = true;
        if (Array.isArray(clinicalDraft.medicines) && clinicalDraft.medicines.length > 0) next.medicines = true;
        return next;
      });
    }
  }, [clinicalDraft.editingVisitId]);

  // When patient selection dropdown changes
  const handleSelectPatient = (mrd: string) => {
    setSelectedPatientMRD(mrd);
    if (mrd) {
      loadPatientIntoClinical(mrd);
    }
  };

  // Section toggle handler
  const handleToggleSection = (sectionId: ClinicalSectionId) => {
    setSelectedSections(prev => {
      const newState = !prev[sectionId];
      if (newState) {
        showToast(`Enabled Section: ${CLINICAL_SECTIONS_REGISTRY.find(s => s.id === sectionId)?.label || sectionId}`, 'info');
      }
      return {
        ...prev,
        [sectionId]: newState
      };
    });
  };

  // Apply Quick Preset
  const applyPreset = (presetKey: keyof typeof CLINICAL_PRESETS) => {
    const preset = CLINICAL_PRESETS[presetKey];
    if (!preset) return;
    const newSelections: Record<ClinicalSectionId, boolean> = { ...INITIAL_SECTION_SELECTIONS };
    preset.sections.forEach(secId => {
      newSelections[secId] = true;
    });
    setSelectedSections(newSelections);
    showToast(`Applied preset: ${preset.label} (${preset.sections.length} sections enabled)`, 'success');
  };

  // Select all / Deselect all
  const selectAllSections = () => {
    const allSelected: Record<ClinicalSectionId, boolean> = { ...INITIAL_SECTION_SELECTIONS };
    CLINICAL_SECTIONS_REGISTRY.forEach(s => {
      allSelected[s.id] = true;
    });
    setSelectedSections(allSelected);
    showToast('All 19 Clinical Examination points enabled');
  };

  const deselectAllSections = () => {
    setSelectedSections(INITIAL_SECTION_SELECTIONS);
    showToast('All sections unselected. Only checked points will be saved.', 'warning');
  };

  // Toggle symptom checkbox (automatically enables chief complaints section if selected)
  const toggleSymptom = (symptom: string) => {
    setClinicalDraft(prev => {
      const symList = Array.isArray(prev?.symptoms) ? prev.symptoms : [];
      const exists = symList.includes(symptom);
      const nextSymptoms = exists ? symList.filter(s => s !== symptom) : [...symList, symptom];
      if (nextSymptoms.length > 0 && !selectedSections.chiefComplaints) {
        setSelectedSections(s => ({ ...s, chiefComplaints: true }));
      }
      return {
        ...prev,
        symptoms: nextSymptoms
      };
    });
  };

  // Handle OD/OS Power updates
  const updateOdPower = (field: keyof EyePower, val: string) => {
    setClinicalDraft(prev => ({
      ...prev,
      odPower: { ...prev.odPower, [field]: val }
    }));
  };

  const updateOsPower = (field: keyof EyePower, val: string) => {
    setClinicalDraft(prev => ({
      ...prev,
      osPower: { ...prev.osPower, [field]: val }
    }));
  };

  const handlePowerChange = (eye: 'od' | 'os', field: keyof EyePower, val: string) => {
    if (!selectedSections.subjectiveRefraction) {
      setSelectedSections(s => ({ ...s, subjectiveRefraction: true }));
    }
    if (eye === 'od') updateOdPower(field, val);
    else updateOsPower(field, val);
  };

  const handleExamChange = (updater: (prev: ClinicalExamination) => ClinicalExamination) => {
    setClinicalDraft(prev => ({
      ...prev,
      examination: updater(prev.examination)
    }));
  };

  const handleDiagnosesChange = (diagnoses: string[]) => {
    if (diagnoses.length > 0 && !selectedSections.diagnosis) {
      setSelectedSections(s => ({ ...s, diagnosis: true }));
    }
    setClinicalDraft(prev => ({
      ...prev,
      diagnosis: diagnoses
    }));
  };

  const handleMedicinesChange = (meds: PrescribedMedicine[]) => {
    if (meds.length > 0 && !selectedSections.medicines) {
      setSelectedSections(s => ({ ...s, medicines: true }));
    }
    setClinicalDraft(prev => ({
      ...prev,
      medicines: meds
    }));
  };

  // 1-Click SAVE VISIT & RECORD RX (Triggers validation & confirmation modal)
  const handleInitiateSaveVisit = () => {
    if (!clinicalDraft.mrd) {
      showToast('Please select or register a patient first!', 'error');
      return;
    }
    setIsConfirmSaveModalOpen(true);
  };

  const handleConfirmSaveFromModal = (andPrint: boolean) => {
    setIsConfirmSaveModalOpen(false);

    // Sanitize data: unselected sections have their default/demo/unexamined values stripped!
    const sanitizedDraft = sanitizeClinicalDraftForSave(clinicalDraft, selectedSections);

    const savedVisit = saveClinicalVisit(sanitizedDraft);

    if (andPrint) {
      setPrintModalData({
        type: 'prescription',
        data: savedVisit
      });
    }

    // Reset sections selection back to default clean state
    setSelectedSections(INITIAL_SECTION_SELECTIONS);
  };

  const selectedCount = Object.values(selectedSections).filter(Boolean).length;

  return (
    <div className="space-y-6 pb-24">
      
      {/* 1. Header Command Ribbon & Compact Patient Auto-Load Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Clinical Examination & Treatment Center
                </h1>
                <span className="bg-teal-50 text-teal-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-teal-200">
                  Select Before Entry Guard Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Visual Acuity, Refraction, IOP, Slit Lamp, Cataract, Fundus CDR, Diagnosis & Medicine Rx
              </p>
            </div>
          </div>

          {/* Quick AI Tools & Patient Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setQuickModal('ai-ocr')}
              title="Scan Handwritten / Printed Prescription with AI OCR"
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-indigo-200 transition-all flex items-center gap-1 hover:scale-102"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">AI Scan</span> Rx
            </button>

            <button
              onClick={() => setQuickModal('ai-power-compare')}
              title="Compare Previous vs Current Eye Power"
              className="bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-teal-200 transition-all flex items-center gap-1 hover:scale-102"
            >
              <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Power Shift</span>
            </button>

            <select
              id="clinical-patient-select"
              value={selectedPatientMRD}
              onChange={e => handleSelectPatient(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-none max-w-[200px] sm:max-w-xs truncate"
            >
              <option value="">-- Select Patient / MRD --</option>
              {patients.map(p => (
                <option key={p.mrd} value={p.mrd}>
                  {p.name} ({p.mrd})
                </option>
              ))}
            </select>

            <button
              onClick={() => setQuickModal('new-patient')}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-teal-600 transition-all flex items-center gap-1 shadow-2xs hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">+ New</span> Patient
            </button>
          </div>

        </div>

        {/* Dynamic & Compact Patient Details Banner */}
        {clinicalDraft.mrd ? (
          <div className="bg-gradient-to-r from-teal-50/90 via-slate-50 to-teal-50/50 p-3 sm:p-3.5 rounded-xl border border-teal-200/90 shadow-2xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 text-xs">
              
              <div className="bg-white/80 p-2 rounded-lg border border-teal-100">
                <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider block">Patient ID / MRD</span>
                <p className="font-black text-slate-900 text-xs mt-0.5">{clinicalDraft.mrd}</p>
              </div>

              <div className="bg-white/80 p-2 rounded-lg border border-teal-100">
                <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider block">Patient Name</span>
                <p className="font-extrabold text-slate-900 text-xs mt-0.5 truncate">{clinicalDraft.patientName || '—'}</p>
              </div>

              <div className="bg-white/80 p-2 rounded-lg border border-teal-100">
                <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider block">Age / Gender / Ph</span>
                <p className="font-bold text-slate-800 text-xs mt-0.5 truncate">
                  {clinicalDraft.age}Y • {clinicalDraft.gender} • {clinicalDraft.mobile || '—'}
                </p>
              </div>

              <div className="bg-white/80 p-2 rounded-lg border border-teal-100">
                <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider block">Examiner Doctor</span>
                <select
                  value={clinicalDraft.doctor}
                  onChange={e => setClinicalDraft(prev => ({ ...prev, doctor: e.target.value }))}
                  className="w-full mt-0.5 text-xs font-bold text-teal-950 bg-white border border-teal-200 rounded p-1 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  {Array.isArray(settings?.examiners) && settings.examiners.length > 0 ? (
                    settings.examiners.filter(ex => ex.active).map(ex => (
                      <option key={ex.id} value={ex.name}>
                        {ex.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Dr. S. K. Banerjee">Dr. S. K. Banerjee</option>
                      <option value="Dr. R. N. Mukherjee">Dr. R. N. Mukherjee</option>
                      <option value="Aniket Roy">Aniket Roy</option>
                    </>
                  )}
                </select>
              </div>

              <div className="bg-white/80 p-2 rounded-lg border border-teal-100">
                <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider block">Visit Type</span>
                <select
                  value={clinicalDraft.visitType}
                  onChange={e => setClinicalDraft(prev => ({ ...prev, visitType: e.target.value }))}
                  className="w-full mt-0.5 text-xs font-bold text-slate-800 bg-white border border-teal-200 rounded p-1 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="New Consultation">New Consultation</option>
                  <option value="Vision Refraction & Power Check">Vision Refraction & Power</option>
                  <option value="Glaucoma Workup & IOP">Glaucoma Workup</option>
                  <option value="Cataract Pre-Op Evaluation">Cataract Pre-Op</option>
                  <option value="Post-Op Cataract Checkup">Post-Op Cataract</option>
                  <option value="Retina & Diabetic Screening">Retina Screening</option>
                  <option value="Follow-up Checkup">Follow-up</option>
                </select>
              </div>

              <div className="bg-white/80 p-2 rounded-lg border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider block">Sections Enabled</span>
                  <span className={`inline-flex items-center gap-1 font-bold text-xs mt-0.5 ${
                    selectedCount > 0 ? 'text-teal-700 font-extrabold' : 'text-slate-500'
                  }`}>
                    <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                    {selectedCount} of 19 Active
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearClinicalDraft}
                  title="Clear loaded patient draft"
                  className="text-[10px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-1.5 py-1 rounded transition-colors"
                >
                  ✕ Unload
                </button>
              </div>

            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/90 text-xs text-amber-900 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-medium">
                <strong>No Patient Loaded:</strong> Select an existing patient from the dropdown above or click <strong>+ New Patient</strong> to start a clinical examination session.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('patients')}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline shrink-0"
            >
              Browse Patient Directory →
            </button>
          </div>
        )}
      </div>

      {/* QUICK PRESETS & 1-CLICK WORKUP SELECTOR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-4 shadow-sm border border-slate-700/60 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-black uppercase tracking-wider text-teal-300">
              Examination Workflow Presets (1-Click Fast Configuration)
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-slate-300 font-bold">
              {selectedCount} of 19 Sections Selected
            </span>
            <div className="h-3 w-px bg-slate-700"></div>
            <button
              type="button"
              onClick={selectAllSections}
              className="text-[11px] font-bold text-teal-300 hover:text-white transition-colors"
            >
              Select All
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={deselectAllSections}
              className="text-[11px] font-bold text-rose-300 hover:text-white transition-colors"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => applyPreset('STANDARD_REFRACTION')}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5 shadow-2xs hover:scale-102"
          >
            <span>👓</span>
            <span>Standard Refraction Workup</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('CATARACT_WORKUP')}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-all flex items-center gap-1.5 shadow-2xs hover:scale-102"
          >
            <span>🔬</span>
            <span>Cataract Pre-Op Workup</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('GLAUCOMA_SCREENING')}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 transition-all flex items-center gap-1.5 shadow-2xs hover:scale-102"
          >
            <span>👁️</span>
            <span>Glaucoma & IOP Workup</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('RED_EYE_INFECTION')}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 transition-all flex items-center gap-1.5 shadow-2xs hover:scale-102"
          >
            <span>🔴</span>
            <span>Red Eye / Infection Workup</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('COMPREHENSIVE_EXAM')}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-500/30 hover:bg-teal-500/40 text-teal-200 border border-teal-500/40 transition-all flex items-center gap-1.5 shadow-2xs hover:scale-102"
          >
            <span>🌟</span>
            <span>All 19 Clinical Points</span>
          </button>
        </div>
      </div>

      {/* Clinical Workspace Tab Filter */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveClinicalTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeClinicalTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Complete Examination ({selectedCount}/19 active)
            </button>

            <button
              type="button"
              onClick={() => setActiveClinicalTab('va')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeClinicalTab === 'va'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              1. Visual Acuity & Refraction
            </button>

            <button
              type="button"
              onClick={() => setActiveClinicalTab('iop')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeClinicalTab === 'iop'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-600" />
              2. IOP, Pupil & Motility
            </button>

            <button
              type="button"
              onClick={() => setActiveClinicalTab('slitlamp')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeClinicalTab === 'slitlamp'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
              }`}
            >
              <Microscope className="w-3.5 h-3.5 text-teal-600" />
              3. Slit Lamp & Anterior
            </button>

            <button
              type="button"
              onClick={() => setActiveClinicalTab('fundus')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeClinicalTab === 'fundus'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              4. Lens, Cataract & Fundus
            </button>

            <button
              type="button"
              onClick={() => setActiveClinicalTab('diagnosis')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeClinicalTab === 'diagnosis'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-violet-600" />
              5. Diagnosis, Rx & Plan
            </button>
          </div>

          <div className="text-[11px] font-bold text-slate-500 hidden sm:block">
            OD = Right Eye | OS = Left Eye | OU = Both Eyes
          </div>
        </div>
      </div>

      {/* 2. CHIEF COMPLAINTS & DURATION (POINT 1) */}
      {(activeClinicalTab === 'all' || activeClinicalTab === 'va') && (
        <ClinicalSectionCard
          id="chiefComplaints"
          orderNumber={1}
          title="Chief Complaints & Symptoms (রোগীর উপসর্গ ও প্রধান সমস্যা)"
          bnTitle="Primary visual complaints, duration, onset and severity"
          category="Refraction"
          icon={<CheckSquare className="w-4 h-4 text-teal-600" />}
          isSelected={selectedSections.chiefComplaints}
          status={selectedSections.chiefComplaints ? ((clinicalDraft?.symptoms || []).length > 0 ? 'COMPLETED' : 'SELECTED') : 'NOT_SELECTED'}
          onToggle={handleToggleSection}
          summaryPreview={
            (clinicalDraft?.symptoms || []).length > 0
              ? `${(clinicalDraft.symptoms || []).join(', ')} (${clinicalDraft.symptomDuration || '1 Week'})`
              : 'No symptoms recorded'
          }
        >
          <div className="space-y-4">
            {/* Symptom Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {SYMPTOM_OPTIONS.map(symptom => {
                const isChecked = (Array.isArray(clinicalDraft?.symptoms) ? clinicalDraft.symptoms : []).includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border ${
                      isChecked
                        ? 'bg-teal-50 text-teal-950 border-teal-400 shadow-2xs font-bold'
                        : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-teal-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className="leading-tight">{symptom}</span>
                  </button>
                );
              })}
            </div>

            {/* Duration & Severity Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Duration of Symptoms (কতোদিন ধরে)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {durationList.map(dur => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setClinicalDraft(p => ({ ...p, symptomDuration: dur }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        clinicalDraft.symptomDuration === dur
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Severity (তীব্রতা)
                </label>
                <div className="flex gap-2">
                  {(['Mild', 'Moderate', 'Severe'] as const).map(sev => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setClinicalDraft(p => ({ ...p, symptomSeverity: sev }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                        clinicalDraft.symptomSeverity === sev
                          ? sev === 'Mild'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : sev === 'Moderate'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ClinicalSectionCard>
      )}

      {/* 3. SECTION 1: VISUAL ACUITY & REFRACTION (POINTS 2-6) */}
      {(activeClinicalTab === 'all' || activeClinicalTab === 'va') && (
        <VisualAcuityRefractionSection
          examination={clinicalDraft.examination}
          odPower={clinicalDraft.odPower}
          osPower={clinicalDraft.osPower}
          selectedSections={selectedSections}
          onToggleSection={handleToggleSection}
          onExamChange={handleExamChange}
          onPowerChange={handlePowerChange}
          showToast={showToast}
        />
      )}

      {/* 4. SECTION 2: IOP, PUPIL, MOTILITY, COLOUR & FIELD (POINTS 7-11) */}
      {(activeClinicalTab === 'all' || activeClinicalTab === 'iop') && (
        <IopPupilMotilitySection
          examination={clinicalDraft.examination}
          selectedSections={selectedSections}
          onToggleSection={handleToggleSection}
          onExamChange={handleExamChange}
          showToast={showToast}
        />
      )}

      {/* 5. SECTION 3: SLIT LAMP & ANTERIOR SEGMENT (POINTS 12-13) */}
      {(activeClinicalTab === 'all' || activeClinicalTab === 'slitlamp') && (
        <SlitLampAnteriorSection
          examination={clinicalDraft.examination}
          selectedSections={selectedSections}
          onToggleSection={handleToggleSection}
          onExamChange={handleExamChange}
          showToast={showToast}
        />
      )}

      {/* 6. SECTION 4: LENS, CATARACT, FUNDUS & KERATOMETRY (POINTS 14-16) */}
      {(activeClinicalTab === 'all' || activeClinicalTab === 'fundus') && (
        <LensCataractFundusSection
          examination={clinicalDraft.examination}
          selectedSections={selectedSections}
          onToggleSection={handleToggleSection}
          onExamChange={handleExamChange}
          showToast={showToast}
        />
      )}

      {/* 7. SECTION 5: DIAGNOSIS, TREATMENT PLAN & PRESCRIBED MEDICINES (POINTS 17-19) */}
      {(activeClinicalTab === 'all' || activeClinicalTab === 'diagnosis') && (
        <DiagnosisTreatmentPlanSection
          examination={clinicalDraft.examination}
          diagnoses={Array.isArray(clinicalDraft.diagnosis) ? clinicalDraft.diagnosis : []}
          chiefComplaints={clinicalDraft.chiefComplaints}
          prescribedMedicines={Array.isArray(clinicalDraft.medicines) ? clinicalDraft.medicines : []}
          selectedSections={selectedSections}
          onToggleSection={handleToggleSection}
          onExamChange={handleExamChange}
          onDiagnosesChange={handleDiagnosesChange}
          onMedicinesChange={handleMedicinesChange}
          showToast={showToast}
        />
      )}

      {/* 8. MASTER ACTION RIBBON (1-CLICK EXECUTE) */}
      <div className="sticky bottom-4 z-20 bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-2">
              <span>{clinicalDraft.patientName ? `Active Patient: ${clinicalDraft.patientName} (${clinicalDraft.mrd})` : 'No Patient Loaded'}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {selectedCount} / 19 points enabled
              </span>
            </p>
            <p className="text-[10px] text-slate-400">
              Data safety guard active • Unexamined sections will not write default/demo values to database
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={clearClinicalDraft}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>

          <button
            id="book-spectacle-from-rx-btn"
            onClick={() => {
              if (!clinicalDraft.mrd) {
                showToast('Please select or register a patient first', 'warning');
                return;
              }
              setQuickModal('new-order');
            }}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
          >
            <Glasses className="w-4 h-4" />
            + Book Spectacle Order
          </button>

          <button
            id="save-visit-btn"
            onClick={handleInitiateSaveVisit}
            className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            ⚡ SAVE VISIT & PRINT PRESCRIPTION
          </button>
        </div>
      </div>

      {/* CONFIRMATION & SANITIZATION MODAL */}
      <SaveVisitConfirmationModal
        isOpen={isConfirmSaveModalOpen}
        onClose={() => setIsConfirmSaveModalOpen(false)}
        onConfirmSave={handleConfirmSaveFromModal}
        draft={clinicalDraft}
        selectedSections={selectedSections}
      />

    </div>
  );
};
