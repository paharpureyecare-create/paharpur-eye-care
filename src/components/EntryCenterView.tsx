import React, { useState, useEffect } from 'react';
import { useErp, EMPTY_DRAFT } from '../context/ErpContext';
import { SYMPTOM_OPTIONS, DIAGNOSIS_MASTER } from '../data/seedData';
import { PrescribedMedicine, EyePower } from '../types';
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
  FileCheck
} from 'lucide-react';

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
  const [editingMedIndex, setEditingMedIndex] = useState<number | null>(null);

  // New Medicine input state
  const [currentMed, setCurrentMed] = useState<PrescribedMedicine>({
    id: '',
    name: '',
    strength: '',
    form: 'Eye Drop',
    dose: '1 drop',
    frequency: '3 times daily',
    duration: '15 days',
    food: 'As directed',
    route: 'Ophthalmic (Both Eyes)',
    instruction: 'Instill into lower conjunctival sac.'
  });

  const durationList = ['1 Day', '1 Week', '1 Month', '3 Months', '6 Months', '1 Year', 'More than 1 Year'];
  const followUpOptions = [
    { label: '7 Days', days: 7 },
    { label: '15 Days', days: 15 },
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 }
  ];

  // Auto select patient if clinicalDraft has MRD
  useEffect(() => {
    if (clinicalDraft.mrd) {
      setSelectedPatientMRD(clinicalDraft.mrd);
    }
  }, [clinicalDraft.mrd]);

  // When patient selection dropdown changes
  const handleSelectPatient = (mrd: string) => {
    setSelectedPatientMRD(mrd);
    if (mrd) {
      loadPatientIntoClinical(mrd);
    }
  };

  // Toggle symptom checkbox
  const toggleSymptom = (symptom: string) => {
    setClinicalDraft(prev => {
      const exists = prev.symptoms.includes(symptom);
      return {
        ...prev,
        symptoms: exists ? prev.symptoms.filter(s => s !== symptom) : [...prev.symptoms, symptom]
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

  // Medicine Master selection auto-fill
  const handlePickMedicineFromMaster = (medId: string) => {
    const found = medicines.find(m => m.id === medId);
    if (found) {
      setCurrentMed({
        id: `PMED-${Date.now()}`,
        medicineId: found.id,
        name: found.name,
        genericName: found.genericName,
        strength: found.strength,
        form: found.form,
        dose: found.defaultDose,
        frequency: found.frequency,
        duration: found.defaultDuration,
        food: found.foodInstruction,
        route: found.route,
        instruction: found.notes || 'As directed by ophthalmologist.'
      });
    }
  };

  // Add or Update Medicine in draft
  const handleSaveMedicineToDraft = () => {
    if (!currentMed.name.trim()) {
      showToast('Please select or type a medicine name', 'warning');
      return;
    }

    if (editingMedIndex !== null) {
      // update
      setClinicalDraft(prev => {
        const updated = [...prev.medicines];
        updated[editingMedIndex] = { ...currentMed };
        return { ...prev, medicines: updated };
      });
      setEditingMedIndex(null);
      showToast('Prescribed medicine updated');
    } else {
      // add
      setClinicalDraft(prev => ({
        ...prev,
        medicines: [...prev.medicines, { ...currentMed, id: `PMED-${Date.now()}` }]
      }));
      showToast('Medicine added to prescription');
    }

    // Reset current med
    setCurrentMed({
      id: '',
      name: '',
      strength: '',
      form: 'Eye Drop',
      dose: '1 drop',
      frequency: '3 times daily',
      duration: '15 days',
      food: 'As directed',
      route: 'Ophthalmic (Both Eyes)',
      instruction: 'Instill into lower conjunctival sac.'
    });
  };

  const handleEditMedLine = (idx: number) => {
    setEditingMedIndex(idx);
    setCurrentMed({ ...clinicalDraft.medicines[idx] });
  };

  const handleRemoveMedLine = (idx: number) => {
    setClinicalDraft(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== idx)
    }));
    if (editingMedIndex === idx) setEditingMedIndex(null);
    showToast('Medicine removed from prescription');
  };

  // 1-Click SAVE VISIT & RECORD RX
  const handleSaveVisit = () => {
    if (!clinicalDraft.mrd) {
      showToast('Please select or register a patient first!', 'error');
      return;
    }
    const savedVisit = saveClinicalVisit(clinicalDraft);
    // Open Print Preview automatically or give choice
    setPrintModalData({
      type: 'prescription',
      data: savedVisit
    });
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Header Command Ribbon & Patient Auto-Load Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Clinical Entry Center (ডাক্তার চেম্বার)
                </h1>
                <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
                  Live Doctor Workspace
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                One-place examination, OD/OS eye refraction, symptoms checklist, diagnosis, and Rx generator
              </p>
            </div>
          </div>

          {/* Patient Switcher / Register */}
          <div className="flex items-center gap-2">
            <select
              id="clinical-patient-select"
              value={selectedPatientMRD}
              onChange={e => handleSelectPatient(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 font-semibold text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">-- Choose Patient / MRD --</option>
              {patients.map(p => (
                <option key={p.mrd} value={p.mrd}>
                  {p.name} ({p.mrd}) — {p.mobile}
                </option>
              ))}
            </select>

            <button
              onClick={() => setQuickModal('new-patient')}
              className="bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold px-3 py-2 rounded-xl border border-teal-200 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              + New Patient
            </button>
          </div>

        </div>

        {/* Patient Details Banner (Auto-loaded) */}
        {clinicalDraft.mrd ? (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-teal-50/50 p-3 rounded-xl border border-teal-100">
            <div>
              <span className="text-[10px] font-bold text-teal-800 uppercase">MRD Number</span>
              <p className="text-xs font-extrabold text-teal-950">{clinicalDraft.mrd}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-800 uppercase">Patient Name</span>
              <p className="text-xs font-extrabold text-teal-950">{clinicalDraft.patientName}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-800 uppercase">Age / Gender</span>
              <p className="text-xs font-bold text-slate-800">
                {clinicalDraft.age} Years • {clinicalDraft.gender}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-800 uppercase">Mobile</span>
              <p className="text-xs font-bold text-slate-800">{clinicalDraft.mobile}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-800 uppercase flex items-center justify-between">
                <span>Examiner (ডাক্তার / অপ্টোমেট্রিস্ট)</span>
              </span>
              <select
                value={clinicalDraft.doctor}
                onChange={e => setClinicalDraft(prev => ({ ...prev, doctor: e.target.value }))}
                className="w-full mt-0.5 text-xs font-bold text-teal-950 bg-white border border-teal-300 rounded-lg p-1 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                {settings.examiners && settings.examiners.length > 0 ? (
                  settings.examiners.filter(ex => ex.active).map(ex => (
                    <option key={ex.id} value={ex.name}>
                      {ex.name} ({ex.role})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Dr. S. K. Banerjee">Dr. S. K. Banerjee (Ophthalmologist)</option>
                    <option value="Dr. R. N. Mukherjee">Dr. R. N. Mukherjee (Optometrist)</option>
                    <option value="Aniket Roy">Aniket Roy (Refractionist)</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-800 uppercase">Visit Type</span>
              <select
                value={clinicalDraft.visitType}
                onChange={e => setClinicalDraft(prev => ({ ...prev, visitType: e.target.value }))}
                className="w-full mt-0.5 text-xs font-bold text-slate-800 bg-white border border-teal-200 rounded-lg p-1 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value="New Consultation">New Consultation</option>
                <option value="Vision Refraction & Power Check">Vision Refraction & Power Check</option>
                <option value="Follow-up Checkup">Follow-up Checkup</option>
                <option value="Post-Op Cataract Checkup">Post-Op Cataract Checkup</option>
                <option value="Contact Lens Fitting">Contact Lens Fitting</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Select an existing patient above or click "Start Visit" from the Appointment Queue to begin clinical examination.</span>
          </div>
        )}
      </div>

      {/* 2. CHIEF COMPLAINTS & DURATION & SEVERITY */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-teal-600" />
            1. Chief Complaints & Symptoms (রোগীর উপসর্গ ও লক্ষণ)
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {clinicalDraft.symptoms.length} symptoms selected
          </span>
        </div>

        {/* 21 Symptom Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {SYMPTOM_OPTIONS.map(symptom => {
            const isChecked = clinicalDraft.symptoms.includes(symptom);
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

      {/* 3. PRESCRIPTION — EYE POWER MATRIX (OD / RIGHT & OS / LEFT) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Glasses className="w-4 h-4 text-teal-600" />
              2. Eye Refraction & Power Prescription (চোখের পাওয়ার)
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Direct text input for fast typing (e.g. -1.25, +0.50, Plano, DS, 90°, 6/6, N6)
            </p>
          </div>
          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            OD = Right Eye | OS = Left Eye
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Eye</th>
                <th className="py-2.5 px-3">SPH (Sphere)</th>
                <th className="py-2.5 px-3">CYL (Cylinder)</th>
                <th className="py-2.5 px-3">AXIS (Degrees)</th>
                <th className="py-2.5 px-3">ADD (Near)</th>
                <th className="py-2.5 px-3">Distance VA</th>
                <th className="py-2.5 px-3">Near VA</th>
                <th className="py-2.5 px-3 rounded-r-lg">PD (Pupil Dist)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              
              {/* OD / RIGHT */}
              <tr className="bg-teal-50/40">
                <td className="py-3 px-3 font-extrabold text-teal-900 text-sm">
                  OD <span className="text-[10px] text-teal-700 block font-normal">(Right Eye)</span>
                </td>
                <td className="p-2">
                  <input
                    id="od-sph"
                    type="text"
                    value={clinicalDraft.odPower.sph}
                    onChange={e => updateOdPower('sph', e.target.value)}
                    placeholder="-1.25 / Plano"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    id="od-cyl"
                    type="text"
                    value={clinicalDraft.odPower.cyl}
                    onChange={e => updateOdPower('cyl', e.target.value)}
                    placeholder="-0.50 / DS"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    id="od-axis"
                    type="text"
                    value={clinicalDraft.odPower.axis}
                    onChange={e => updateOdPower('axis', e.target.value)}
                    placeholder="90°"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    id="od-add"
                    type="text"
                    value={clinicalDraft.odPower.add}
                    onChange={e => updateOdPower('add', e.target.value)}
                    placeholder="+1.50"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    id="od-dist-va"
                    type="text"
                    value={clinicalDraft.odPower.distanceVa}
                    onChange={e => updateOdPower('distanceVa', e.target.value)}
                    placeholder="6/6"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    id="od-near-va"
                    type="text"
                    value={clinicalDraft.odPower.nearVa}
                    onChange={e => updateOdPower('nearVa', e.target.value)}
                    placeholder="N6"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    id="od-pd"
                    type="text"
                    value={clinicalDraft.odPower.pd || ''}
                    onChange={e => updateOdPower('pd', e.target.value)}
                    placeholder="31"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </td>
              </tr>

              {/* OS / LEFT */}
              <tr className="bg-blue-50/40">
                <td className="py-3 px-3 font-extrabold text-blue-900 text-sm">
                  OS <span className="text-[10px] text-blue-700 block font-normal">(Left Eye)</span>
                </td>
                <td className="p-2">
                  <input
                    id="os-sph"
                    type="text"
                    value={clinicalDraft.osPower.sph}
                    onChange={e => updateOsPower('sph', e.target.value)}
                    placeholder="-1.00 / Plano"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    id="os-cyl"
                    type="text"
                    value={clinicalDraft.osPower.cyl}
                    onChange={e => updateOsPower('cyl', e.target.value)}
                    placeholder="-0.25 / DS"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    id="os-axis"
                    type="text"
                    value={clinicalDraft.osPower.axis}
                    onChange={e => updateOsPower('axis', e.target.value)}
                    placeholder="80°"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    id="os-add"
                    type="text"
                    value={clinicalDraft.osPower.add}
                    onChange={e => updateOsPower('add', e.target.value)}
                    placeholder="+1.50"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    id="os-dist-va"
                    type="text"
                    value={clinicalDraft.osPower.distanceVa}
                    onChange={e => updateOsPower('distanceVa', e.target.value)}
                    placeholder="6/6"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    id="os-near-va"
                    type="text"
                    value={clinicalDraft.osPower.nearVa}
                    onChange={e => updateOsPower('nearVa', e.target.value)}
                    placeholder="N6"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    id="os-pd"
                    type="text"
                    value={clinicalDraft.osPower.pd || ''}
                    onChange={e => updateOsPower('pd', e.target.value)}
                    placeholder="31"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* 4. CLINICAL EXAMINATION & SLIT LAMP / FUNDUS FINDINGS */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            3. Clinical Examination (ক্লিনিক্যাল পরীক্ষা)
          </h2>
          <span className="text-xs text-slate-400 font-medium">IOP, Slit Lamp & Fundus</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* IOP / Eye Pressure */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              IOP (Eye Pressure mmHg)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 font-semibold">OD:</span>
                <input
                  type="text"
                  value={clinicalDraft.examination.iopOd}
                  onChange={e => setClinicalDraft(p => ({ ...p, examination: { ...p.examination, iopOd: e.target.value } }))}
                  placeholder="14 mmHg"
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                />
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 font-semibold">OS:</span>
                <input
                  type="text"
                  value={clinicalDraft.examination.iopOs}
                  onChange={e => setClinicalDraft(p => ({ ...p, examination: { ...p.examination, iopOs: e.target.value } }))}
                  placeholder="14 mmHg"
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Anterior Segment */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">
                Anterior Segment / Cornea
              </label>
              <button
                type="button"
                onClick={() => setClinicalDraft(p => ({
                  ...p,
                  examination: {
                    ...p.examination,
                    anteriorSegmentStatus: p.examination.anteriorSegmentStatus === 'Normal' ? 'Abnormal' : 'Normal'
                  }
                }))}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  clinicalDraft.examination.anteriorSegmentStatus === 'Normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {clinicalDraft.examination.anteriorSegmentStatus}
              </button>
            </div>
            <input
              type="text"
              value={clinicalDraft.examination.anteriorSegmentNotes || ''}
              onChange={e => setClinicalDraft(p => ({ ...p, examination: { ...p.examination, anteriorSegmentNotes: e.target.value } }))}
              placeholder="Cornea clear, AC deep & quiet"
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
            />
          </div>

          {/* Fundus / Retina */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">
                Fundus / Posterior Segment
              </label>
              <button
                type="button"
                onClick={() => setClinicalDraft(p => ({
                  ...p,
                  examination: {
                    ...p.examination,
                    fundusStatus: p.examination.fundusStatus === 'Normal' ? 'Abnormal' : 'Normal'
                  }
                }))}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  clinicalDraft.examination.fundusStatus === 'Normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {clinicalDraft.examination.fundusStatus}
              </button>
            </div>
            <input
              type="text"
              value={clinicalDraft.examination.fundusNotes || ''}
              onChange={e => setClinicalDraft(p => ({ ...p, examination: { ...p.examination, fundusNotes: e.target.value } }))}
              placeholder="Disc C:D 0.3, macula clear"
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
            />
          </div>

          {/* Pupil & EOM */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Pupil & Ocular Motility (EOM)
            </label>
            <input
              type="text"
              value={clinicalDraft.examination.pupilNotes || ''}
              onChange={e => setClinicalDraft(p => ({ ...p, examination: { ...p.examination, pupilNotes: e.target.value } }))}
              placeholder="RRRTL, Full extraocular movement"
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
            />
          </div>

        </div>

        {/* Free text clinical findings */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Clinical Findings & Slit Lamp Observations (বিস্তারিত পর্যবেক্ষণ)
          </label>
          <textarea
            rows={2}
            value={clinicalDraft.examination.clinicalFindings}
            onChange={e => setClinicalDraft(p => ({ ...p, examination: { ...p.examination, clinicalFindings: e.target.value } }))}
            placeholder="e.g. Mild bilateral dry eye with tear film instability, early cortical lens changes in left eye..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800"
          />
        </div>
      </div>

      {/* 5. DIAGNOSIS MASTER & SEARCH */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            4. Diagnosis (রোগ নির্ণয়)
          </h2>
          <span className="text-xs text-slate-400 font-medium">Quick pick presets</span>
        </div>

        {/* Common Diagnosis Pills */}
        <div className="flex flex-wrap gap-1.5">
          {DIAGNOSIS_MASTER.map(diag => {
            const isSelected = clinicalDraft.diagnosis.includes(diag);
            return (
              <button
                key={diag}
                type="button"
                onClick={() => {
                  setClinicalDraft(prev => {
                    const exists = prev.diagnosis.includes(diag);
                    return {
                      ...prev,
                      diagnosis: exists ? prev.diagnosis.filter(d => d !== diag) : [...prev.diagnosis, diag]
                    };
                  });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {diag}
              </button>
            );
          })}
        </div>

        {/* Custom Diagnosis */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Other / Specific Clinical Diagnosis
          </label>
          <input
            type="text"
            value={clinicalDraft.customDiagnosis}
            onChange={e => setClinicalDraft(p => ({ ...p, customDiagnosis: e.target.value }))}
            placeholder="Type custom or combined diagnosis..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
          />
        </div>
      </div>

      {/* 6. MEDICINE PRESCRIPTION MASTER & TABLE */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              5. Medicine Prescription (ওষুধের প্রেসক্রিপশন)
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Pick from Medicine Master to auto-fill dosage, frequency, and instructions
            </p>
          </div>

          <button
            onClick={() => setActiveTab('medicines')}
            className="text-xs font-bold text-teal-600 hover:underline"
          >
            Manage Medicine Master &rarr;
          </button>
        </div>

        {/* Fast Medicine Picker & Form */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            
            {/* Pick from Master */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Select from Master
              </label>
              <select
                id="med-master-picker"
                onChange={e => handlePickMedicineFromMaster(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
              >
                <option value="">-- Choose Medicine --</option>
                {medicines.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.strength}) — {m.form}
                  </option>
                ))}
              </select>
            </div>

            {/* Medicine Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Medicine Name
              </label>
              <input
                type="text"
                value={currentMed.name}
                onChange={e => setCurrentMed(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Tears Plus Eye Drop"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>

            {/* Strength */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Strength / Form
              </label>
              <input
                type="text"
                value={currentMed.strength}
                onChange={e => setCurrentMed(p => ({ ...p, strength: e.target.value }))}
                placeholder="0.5% / Eye Drop"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Dose */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Dose
              </label>
              <input
                type="text"
                value={currentMed.dose}
                onChange={e => setCurrentMed(p => ({ ...p, dose: e.target.value }))}
                placeholder="1 drop"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            
            {/* Frequency */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Frequency (কতবার)
              </label>
              <input
                type="text"
                value={currentMed.frequency}
                onChange={e => setCurrentMed(p => ({ ...p, frequency: e.target.value }))}
                placeholder="3 times daily"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Duration (কতোদিন)
              </label>
              <input
                type="text"
                value={currentMed.duration}
                onChange={e => setCurrentMed(p => ({ ...p, duration: e.target.value }))}
                placeholder="15 days / 1 month"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Route */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Route / Eye
              </label>
              <input
                type="text"
                value={currentMed.route}
                onChange={e => setCurrentMed(p => ({ ...p, route: e.target.value }))}
                placeholder="Ophthalmic (Both Eyes)"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Instruction */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Special Instruction
              </label>
              <input
                type="text"
                value={currentMed.instruction}
                onChange={e => setCurrentMed(p => ({ ...p, instruction: e.target.value }))}
                placeholder="5 min gap between drops"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-2">
            {editingMedIndex !== null && (
              <button
                type="button"
                onClick={() => setEditingMedIndex(null)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                Cancel Edit
              </button>
            )}
            <button
              id="add-medicine-btn"
              type="button"
              onClick={handleSaveMedicineToDraft}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              {editingMedIndex !== null ? 'Update Medicine' : 'Add to Prescription (Rx)'}
            </button>
          </div>

        </div>

        {/* Prescribed Medicines List Table */}
        {clinicalDraft.medicines.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            No medicines added yet. Choose from master above or click add.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Medicine & Strength</th>
                  <th className="py-2 px-3">Dose & Frequency</th>
                  <th className="py-2 px-3">Duration</th>
                  <th className="py-2 px-3">Route & Instruction</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clinicalDraft.medicines.map((med, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{med.name}</div>
                      <div className="text-[11px] text-teal-700">{med.strength} • {med.form}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {med.dose} • {med.frequency}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{med.duration}</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      <span className="font-bold text-slate-800">{med.route}</span>: {med.instruction}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1">
                      <button
                        onClick={() => handleEditMedLine(idx)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit medicine"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveMedLine(idx)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        title="Remove medicine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* 7. DOCTOR'S ADVICE & FOLLOW-UP TIMELINE */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-teal-600" />
            6. Advice & Follow-up Timeline (পরামর্শ ও পরবর্তী ভিজিট)
          </h2>
        </div>

        {/* Advice preset chips */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase">
            Quick Advice Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {settings.rxAdvicePresets.map((adv, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setClinicalDraft(p => ({
                    ...p,
                    advice: p.advice ? `${p.advice}\n• ${adv}` : `• ${adv}`
                  }));
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
              >
                + {adv}
              </button>
            ))}
          </div>

          <textarea
            rows={3}
            value={clinicalDraft.advice}
            onChange={e => setClinicalDraft(p => ({ ...p, advice: e.target.value }))}
            placeholder="Doctor's advice regarding spectacle use, screen time, precautions..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {/* Follow-up Timeline */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
            Follow-up Review After (পরবর্তী ভিজিটের দিন)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {followUpOptions.map(opt => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setClinicalDraft(p => ({ ...p, followUpDays: opt.days }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  clinicalDraft.followUpDays === opt.days
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <span className="text-xs text-slate-500 ml-2 font-medium">
              Scheduled Date:{' '}
              <strong className="text-teal-900">
                {clinicalDraft.followUpDays
                  ? new Date(Date.now() + clinicalDraft.followUpDays * 86400000).toLocaleDateString('en-GB')
                  : 'N/A'}
              </strong>
            </span>
          </div>
        </div>

      </div>

      {/* 8. MASTER ACTION RIBBON (1-CLICK EXECUTE) */}
      <div className="sticky bottom-4 z-20 bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <div>
            <p className="text-xs font-bold text-white">
              {clinicalDraft.patientName ? `Active Patient: ${clinicalDraft.patientName} (${clinicalDraft.mrd})` : 'No Patient Loaded'}
            </p>
            <p className="text-[10px] text-slate-400">
              Auto-save draft active • Ready to record clinical history & generate Rx
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
            onClick={handleSaveVisit}
            className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            ⚡ SAVE VISIT & PRINT PRESCRIPTION
          </button>
        </div>
      </div>

    </div>
  );
};
