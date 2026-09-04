import { ClinicalDraft, ClinicalExamination, EyePower, PrescribedMedicine } from '../types';

export type ClinicalSectionId =
  | 'chiefComplaints'       // 1. Chief Complaints & Symptoms
  | 'distanceVa'            // 2. Visual Acuity (Distance)
  | 'pinholeExam'           // 3. Pinhole Vision Test
  | 'nearVision'            // 4. Near Vision & Add
  | 'autoRefraction'        // 5. Objective Refraction (AR / Retinoscopy)
  | 'subjectiveRefraction'  // 6. Subjective Refraction & Final Rx
  | 'tonometry'             // 7. Intraocular Pressure (IOP) & Tonometry
  | 'pupilExam'             // 8. Pupillary Examination & Reflexes
  | 'motility'              // 9. Ocular Motility & EOM
  | 'colourVision'          // 10. Colour Vision
  | 'visualField'           // 11. Visual Field
  | 'externalExam'          // 12. External Eye & Adnexa
  | 'slitLamp'              // 13. Slit Lamp Examination (Anterior Segment)
  | 'lensCataract'          // 14. Lens & Cataract Staging (LOCS III)
  | 'fundus'                // 15. Fundus & Posterior Segment (CDR, Macula, Retina)
  | 'keratometry'           // 16. Keratometry (K1, K2, Axis, Avg K)
  | 'diagnosis'             // 17. Clinical Diagnosis (ICD-10 & OD/OS/OU)
  | 'treatmentPlan'         // 18. Treatment Plan & Advice
  | 'medicines';            // 19. Prescribed Ophthalmic Medicines (Rx)

export type ClinicalSectionStatus = 'NOT_SELECTED' | 'SELECTED' | 'COMPLETED';

export interface ClinicalSectionMeta {
  id: ClinicalSectionId;
  order: number;
  label: string;
  bnLabel: string;
  category: 'History' | 'Refraction' | 'Tonometry & Pupils' | 'Anterior Segment' | 'Posterior Segment' | 'Diagnostics' | 'Treatment';
  description: string;
  iconName?: string;
}

export const CLINICAL_SECTIONS_REGISTRY: ClinicalSectionMeta[] = [
  {
    id: 'chiefComplaints',
    order: 1,
    label: '1. Chief Complaints & Symptoms',
    bnLabel: 'রোগীর উপসর্গ ও প্রধান সমস্যা',
    category: 'History',
    description: 'Patient presented visual symptoms, duration, and severity'
  },
  {
    id: 'distanceVa',
    order: 2,
    label: '2. Visual Acuity (Distance - Unaided & CC)',
    bnLabel: 'দূরের দৃষ্টিশক্তি (VA)',
    category: 'Refraction',
    description: 'Snellen Distance Acuity (6m / 20ft) for OD, OS, and OU'
  },
  {
    id: 'pinholeExam',
    order: 3,
    label: '3. Pinhole Vision Improvement Test',
    bnLabel: 'পিনহোল পরীক্ষা',
    category: 'Refraction',
    description: 'Optical refractive potential vs organic media opacity check'
  },
  {
    id: 'nearVision',
    order: 4,
    label: '4. Near Vision & Presbyopic Add',
    bnLabel: 'নিকট দৃষ্টি ও রিডিং পাওয়ার',
    category: 'Refraction',
    description: 'N5–N36 Jaeger reading vision at 33–40 cm distance'
  },
  {
    id: 'autoRefraction',
    order: 5,
    label: '5. Objective Refraction (AR & Retinoscopy)',
    bnLabel: 'অটোরিফ্র্যাকশন ও রেটিনোস্কোপি',
    category: 'Refraction',
    description: 'Auto-Refractor (AR), Retinoscopy streaks, and previous glasses power'
  },
  {
    id: 'subjectiveRefraction',
    order: 6,
    label: '6. Subjective Refraction & Final Prescription Power',
    bnLabel: 'চূড়ান্ত চশমার পাওয়ার (Final Rx)',
    category: 'Refraction',
    description: 'Duochrome, Fogging, Cross-Cyl balance and final prescribed eye power'
  },
  {
    id: 'tonometry',
    order: 7,
    label: '7. Intraocular Pressure (IOP) & Tonometry',
    bnLabel: 'চক্ষু চাপ ও টোনোমেট্রি',
    category: 'Tonometry & Pupils',
    description: 'NCT / Goldmann Applanation tonometry IOP measurements in mmHg'
  },
  {
    id: 'pupilExam',
    order: 8,
    label: '8. Pupillary Examination & RAPD',
    bnLabel: 'পিউপিল প্রতিক্রিয়া ও আরএপিডি',
    category: 'Tonometry & Pupils',
    description: 'Pupil size, shape, direct/consensual reflexes, Marcus Gunn RAPD'
  },
  {
    id: 'motility',
    order: 9,
    label: '9. Ocular Motility & EOM Alignment',
    bnLabel: 'অকুলার মোটিলিটি ও মাসল মুভমেন্ট',
    category: 'Tonometry & Pupils',
    description: 'Extraocular muscle movements (9 gaze positions), diplopia, nystagmus'
  },
  {
    id: 'colourVision',
    order: 10,
    label: '10. Colour Vision & Contrast',
    bnLabel: 'কালার ভিশন পরীক্ষা',
    category: 'Diagnostics',
    description: 'Ishihara pseudoisochromatic plates (Red-Green defect detection)'
  },
  {
    id: 'visualField',
    order: 11,
    label: '11. Visual Field & Confrontation',
    bnLabel: 'ভিজুয়াল ফিল্ড ও পেরিমেট্রি',
    category: 'Diagnostics',
    description: 'Confrontation test, Humphrey HFA 24-2 / 30-2 visual field'
  },
  {
    id: 'externalExam',
    order: 12,
    label: '12. External Eye & Adnexa',
    bnLabel: 'বাহ্যিক চোখ, পাতা ও ল্যাক্রিমাল সিস্টেম',
    category: 'Anterior Segment',
    description: 'Eyelids, lashes, puncta, periorbital area, and lacrimal patency'
  },
  {
    id: 'slitLamp',
    order: 13,
    label: '13. Slit Lamp Examination (Anterior Segment)',
    bnLabel: 'স্লিট ল্যাম্প ও সম্মুখ অংশ',
    category: 'Anterior Segment',
    description: 'Cornea, anterior chamber depth, cells & flare, iris pattern'
  },
  {
    id: 'lensCataract',
    order: 14,
    label: '14. Lens & Cataract Staging (LOCS III)',
    bnLabel: 'লেন্স ও ক্যাটারাক্ট গ্রেডিং',
    category: 'Anterior Segment',
    description: 'Cataract status (NS, CC, PSC), maturity grade, or pseudophakia IOL'
  },
  {
    id: 'fundus',
    order: 15,
    label: '15. Fundus & Posterior Segment',
    bnLabel: 'ফান্ডাস, অপটিক ডিস্ক (CDR) ও রেটিনা',
    category: 'Posterior Segment',
    description: 'Optic disc cup-to-disc ratio (CDR), macula foveal reflex, vessels, retina'
  },
  {
    id: 'keratometry',
    order: 16,
    label: '16. Keratometry (Corneal Curvature)',
    bnLabel: 'কেরাটোমেট্রি (K1, K2, Axis)',
    category: 'Diagnostics',
    description: 'Corneal astigmatism, K1, K2 curvature, and axis'
  },
  {
    id: 'diagnosis',
    order: 17,
    label: '17. Clinical Diagnosis & ICD-10 Coding',
    bnLabel: 'ক্লিনিক্যাল ডায়াগনোসিস ও চোখের নির্ধারণ',
    category: 'Treatment',
    description: 'Ophthalmic conditions with affected eye tags (OD, OS, OU)'
  },
  {
    id: 'treatmentPlan',
    order: 18,
    label: '18. Treatment Plan, Spectacles & Surgery Advice',
    bnLabel: 'ট্রিটমেন্ট প্ল্যান ও ফলো-আপ পরামর্শ',
    category: 'Treatment',
    description: 'Spectacle lens recommendation, investigations, referral, surgical advice'
  },
  {
    id: 'medicines',
    order: 19,
    label: '19. Prescribed Ophthalmic Medicines (Rx)',
    bnLabel: 'প্রেসক্রাইব করা চোখের ওষুধ',
    category: 'Treatment',
    description: 'Targeted eye drops, ointments, oral medications with dose & instructions'
  }
];

// Initial default state: ALL SECTIONS UNSELECTED (NOT_SELECTED)
export const INITIAL_SECTION_SELECTIONS: Record<ClinicalSectionId, boolean> = {
  chiefComplaints: false,
  distanceVa: false,
  pinholeExam: false,
  nearVision: false,
  autoRefraction: false,
  subjectiveRefraction: false,
  tonometry: false,
  pupilExam: false,
  motility: false,
  colourVision: false,
  visualField: false,
  externalExam: false,
  slitLamp: false,
  lensCataract: false,
  fundus: false,
  keratometry: false,
  diagnosis: false,
  treatmentPlan: false,
  medicines: false
};

// Common Presets for 1-Click Fast Configuration
export const CLINICAL_PRESETS = {
  STANDARD_REFRACTION: {
    label: '👓 Standard Refraction Workup',
    description: 'VA, Pinhole, Near Vision, AR, Final Power & Spectacles Advice',
    sections: ['chiefComplaints', 'distanceVa', 'pinholeExam', 'nearVision', 'autoRefraction', 'subjectiveRefraction', 'treatmentPlan'] as ClinicalSectionId[]
  },
  CATARACT_WORKUP: {
    label: '🔬 Cataract Pre-Op Workup',
    description: 'VA, Slit Lamp, Cataract Staging, Keratometry, IOP, Fundus & Surgery Plan',
    sections: ['chiefComplaints', 'distanceVa', 'slitLamp', 'lensCataract', 'keratometry', 'tonometry', 'fundus', 'diagnosis', 'treatmentPlan'] as ClinicalSectionId[]
  },
  GLAUCOMA_SCREENING: {
    label: '👁️ Glaucoma & IOP Workup',
    description: 'VA, Tonometry, Pupil RAPD, Slit Lamp, Fundus CDR & Visual Field',
    sections: ['chiefComplaints', 'distanceVa', 'tonometry', 'pupilExam', 'slitLamp', 'fundus', 'visualField', 'diagnosis', 'treatmentPlan'] as ClinicalSectionId[]
  },
  RED_EYE_INFECTION: {
    label: '🔴 Red Eye / Infection Exam',
    description: 'Symptoms, Slit Lamp, External Eye, Diagnosis & Medicine Rx',
    sections: ['chiefComplaints', 'externalExam', 'slitLamp', 'diagnosis', 'treatmentPlan', 'medicines'] as ClinicalSectionId[]
  },
  COMPREHENSIVE_EXAM: {
    label: '🌟 Complete Comprehensive Exam',
    description: 'All 19 clinical examination & treatment sections',
    sections: CLINICAL_SECTIONS_REGISTRY.map(s => s.id)
  }
};

/**
 * Determine internal status for a section: NOT_SELECTED | SELECTED | COMPLETED
 */
export function getSectionStatus(
  sectionId: ClinicalSectionId,
  selectedSections: Record<ClinicalSectionId, boolean>,
  draft: ClinicalDraft
): ClinicalSectionStatus {
  if (!selectedSections[sectionId]) {
    return 'NOT_SELECTED';
  }

  // Check if user has entered data for this section
  const exam = draft.examination || {};

  switch (sectionId) {
    case 'chiefComplaints':
      return (Array.isArray(draft.symptoms) && draft.symptoms.length > 0) ? 'COMPLETED' : 'SELECTED';

    case 'distanceVa':
      return (exam.distanceVa?.od?.unaided || exam.distanceVa?.os?.unaided || exam.distanceVa?.od?.withCorrection || exam.distanceVa?.os?.withCorrection)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'pinholeExam':
      return (exam.pinholeExam?.odAfter || exam.pinholeExam?.osAfter || exam.pinholeExam?.odImprovement)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'nearVision':
      return (exam.nearVisionExam?.odWithCorrection || exam.nearVisionExam?.osWithCorrection || exam.nearVisionExam?.ouWithCorrection)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'autoRefraction':
      return (exam.refractionStages?.autoRefraction?.od?.sph || exam.refractionStages?.retinoscopy?.od?.sph)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'subjectiveRefraction':
      return (draft.odPower?.sph || draft.odPower?.cyl || draft.osPower?.sph || draft.osPower?.cyl)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'tonometry':
      return (exam.tonometry?.odIop || exam.tonometry?.osIop)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'pupilExam':
      return (exam.pupilExam?.od?.sizeMm || exam.pupilExam?.os?.sizeMm || exam.pupilExam?.od?.rapd)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'motility':
      return (exam.motility?.status || exam.motility?.diplopia || exam.motility?.nystagmus)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'colourVision':
      return (exam.colourVision?.odResult || exam.colourVision?.score)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'visualField':
      return (exam.visualField?.odResult || exam.visualField?.defectDescription)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'externalExam':
      return (exam.externalExam?.od?.lids?.status || exam.externalExam?.os?.lids?.status)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'slitLamp':
      return (exam.slitLamp?.od?.cornea?.status || exam.slitLamp?.os?.cornea?.status)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'lensCataract':
      return (exam.lensCataract?.od?.status || exam.lensCataract?.os?.status)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'fundus':
      return (exam.fundus?.od?.cdRatio || exam.fundus?.os?.cdRatio || exam.fundus?.od?.opticDisc?.status)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'keratometry':
      return (exam.keratometry?.od?.k1 || exam.keratometry?.os?.k1)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'diagnosis':
      return (Array.isArray(draft.diagnosis) && draft.diagnosis.length > 0) || (draft.customDiagnosis && draft.customDiagnosis.trim().length > 0)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'treatmentPlan':
      return (exam.treatmentPlan?.spectacleAdvised || exam.treatmentPlan?.surgeryAdvice || exam.treatmentPlan?.investigationAdvised || draft.advice)
        ? 'COMPLETED'
        : 'SELECTED';

    case 'medicines':
      return (Array.isArray(draft.medicines) && draft.medicines.length > 0)
        ? 'COMPLETED'
        : 'SELECTED';

    default:
      return 'SELECTED';
  }
}

/**
 * Strictly sanitizes the clinical draft prior to saving:
 * Any UNSELECTED section has all its default/sample/demo values removed so they are NOT stored in the database!
 */
export function sanitizeClinicalDraftForSave(
  draft: ClinicalDraft,
  selectedSections: Record<ClinicalSectionId, boolean>
): ClinicalDraft {
  const sanitizedExam: ClinicalExamination = {};
  const origExam = draft.examination || {};

  // 1. Symptoms & Chief Complaints
  const sanitizedSymptoms = selectedSections.chiefComplaints && Array.isArray(draft.symptoms)
    ? draft.symptoms
    : [];

  // 2. Distance Visual Acuity
  if (selectedSections.distanceVa && origExam.distanceVa) {
    sanitizedExam.distanceVa = origExam.distanceVa;
    sanitizedExam.vaOdWithout = origExam.distanceVa.od?.unaided;
    sanitizedExam.vaOdWith = origExam.distanceVa.od?.withCorrection;
    sanitizedExam.vaOsWithout = origExam.distanceVa.os?.unaided;
    sanitizedExam.vaOsWith = origExam.distanceVa.os?.withCorrection;
  }

  // 3. Pinhole Vision
  if (selectedSections.pinholeExam && origExam.pinholeExam) {
    sanitizedExam.pinholeExam = origExam.pinholeExam;
    sanitizedExam.phOd = origExam.pinholeExam.odAfter;
    sanitizedExam.phOs = origExam.pinholeExam.osAfter;
  }

  // 4. Near Vision
  if (selectedSections.nearVision && origExam.nearVisionExam) {
    sanitizedExam.nearVisionExam = origExam.nearVisionExam;
    sanitizedExam.nearVision = origExam.nearVisionExam.ouWithCorrection;
  }

  // 5. Auto-Refraction & Retinoscopy
  if (selectedSections.autoRefraction && origExam.refractionStages) {
    sanitizedExam.refractionStages = {
      currentGlasses: origExam.refractionStages.currentGlasses,
      autoRefraction: origExam.refractionStages.autoRefraction,
      retinoscopy: origExam.refractionStages.retinoscopy
    };
  }

  // 6. Subjective Refraction & Final Eye Power
  let sanitizedOdPower: EyePower = { sph: '', cyl: '', axis: '', add: '', distanceVa: '', nearVa: '', pd: '' };
  let sanitizedOsPower: EyePower = { sph: '', cyl: '', axis: '', add: '', distanceVa: '', nearVa: '', pd: '' };

  if (selectedSections.subjectiveRefraction) {
    sanitizedOdPower = { ...draft.odPower };
    sanitizedOsPower = { ...draft.osPower };
    if (origExam.refractionStages?.subjectiveRefraction) {
      if (!sanitizedExam.refractionStages) sanitizedExam.refractionStages = {};
      sanitizedExam.refractionStages.subjectiveRefraction = origExam.refractionStages.subjectiveRefraction;
      sanitizedExam.refractionStages.finalPrescription = origExam.refractionStages.finalPrescription;
    }
  }

  // 7. Tonometry / IOP
  if (selectedSections.tonometry && origExam.tonometry) {
    sanitizedExam.tonometry = origExam.tonometry;
    sanitizedExam.iopOd = origExam.tonometry.odIop;
    sanitizedExam.iopOs = origExam.tonometry.osIop;
  }

  // 8. Pupil Examination
  if (selectedSections.pupilExam && origExam.pupilExam) {
    sanitizedExam.pupilExam = origExam.pupilExam;
    sanitizedExam.pupilStatus = origExam.pupilExam.od?.status === 'Abnormal' || origExam.pupilExam.os?.status === 'Abnormal' ? 'Abnormal' : 'Normal';
  }

  // 9. Ocular Motility
  if (selectedSections.motility && origExam.motility) {
    sanitizedExam.motility = origExam.motility;
    sanitizedExam.eomStatus = origExam.motility.status;
  }

  // 10. Colour Vision
  if (selectedSections.colourVision && origExam.colourVision) {
    sanitizedExam.colourVision = origExam.colourVision;
  }

  // 11. Visual Field
  if (selectedSections.visualField && origExam.visualField) {
    sanitizedExam.visualField = origExam.visualField;
  }

  // 12. External Eye
  if (selectedSections.externalExam && origExam.externalExam) {
    sanitizedExam.externalExam = origExam.externalExam;
    sanitizedExam.adnexaStatus = origExam.adnexaStatus;
  }

  // 13. Slit Lamp
  if (selectedSections.slitLamp && origExam.slitLamp) {
    sanitizedExam.slitLamp = origExam.slitLamp;
    sanitizedExam.anteriorSegmentStatus = origExam.anteriorSegmentStatus;
  }

  // 14. Lens & Cataract
  if (selectedSections.lensCataract && origExam.lensCataract) {
    sanitizedExam.lensCataract = origExam.lensCataract;
  }

  // 15. Fundus
  if (selectedSections.fundus && origExam.fundus) {
    sanitizedExam.fundus = origExam.fundus;
    sanitizedExam.fundusStatus = origExam.fundusStatus;
  }

  // 16. Keratometry
  if (selectedSections.keratometry && origExam.keratometry) {
    sanitizedExam.keratometry = origExam.keratometry;
  }

  // 17. Diagnosis
  const sanitizedDiagnosis = selectedSections.diagnosis && Array.isArray(draft.diagnosis)
    ? draft.diagnosis
    : [];
  const sanitizedCustomDiagnosis = selectedSections.diagnosis
    ? (draft.customDiagnosis || '')
    : '';

  // 18. Treatment Plan
  if (selectedSections.treatmentPlan && origExam.treatmentPlan) {
    sanitizedExam.treatmentPlan = origExam.treatmentPlan;
  }
  const sanitizedAdvice = selectedSections.treatmentPlan ? (draft.advice || '') : '';
  const sanitizedSpectacleAdvice = selectedSections.treatmentPlan ? (draft.spectacleAdvice || '') : '';
  const sanitizedSurgeryAdvice = selectedSections.treatmentPlan ? (draft.surgeryAdvice || '') : '';
  const sanitizedInvestigation = selectedSections.treatmentPlan ? (draft.investigation || '') : '';
  const sanitizedReferral = selectedSections.treatmentPlan ? (draft.referral || '') : '';

  // 19. Prescribed Medicines
  const sanitizedMedicines: PrescribedMedicine[] = selectedSections.medicines && Array.isArray(draft.medicines)
    ? draft.medicines.filter(m => m.name && m.name.trim().length > 0)
    : [];

  return {
    ...draft,
    symptoms: sanitizedSymptoms,
    examination: sanitizedExam,
    odPower: sanitizedOdPower,
    osPower: sanitizedOsPower,
    diagnosis: sanitizedDiagnosis,
    customDiagnosis: sanitizedCustomDiagnosis,
    medicines: sanitizedMedicines,
    advice: sanitizedAdvice,
    spectacleAdvice: sanitizedSpectacleAdvice,
    surgeryAdvice: sanitizedSurgeryAdvice,
    investigation: sanitizedInvestigation,
    referral: sanitizedReferral
  };
}
