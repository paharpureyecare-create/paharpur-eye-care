import { ClinicalExamination, DistanceVisualAcuity, NearVisionRecord, PinholeVisionRecord, RefractionStages, PupilExamRecord, TonometryRecord, ColourVisionRecord, VisualFieldRecord, OcularMotilityRecord, ExternalEyeExamRecord, SlitLampExamRecord, LensCataractExamRecord, FundusExamRecord, KeratometryRecord, TreatmentPlan } from '../types';

export const DISTANCE_VA_OPTIONS = [
  '6/6',
  '6/9',
  '6/12',
  '6/18',
  '6/24',
  '6/36',
  '6/60',
  '20/20',
  '20/25',
  '20/30',
  '20/40',
  '20/60',
  '20/80',
  '20/100',
  '20/200'
];

export const LOW_VISION_OPTIONS = [
  'CF 0.5m',
  'CF 1m',
  'CF 2m',
  'CF 3m',
  'CF Close to face',
  'HM (Hand Movements)',
  'PL / LP (Perception of Light)',
  'PL Positive, PR Accurate',
  'NLP (No Light Perception)',
  'Fixing & Following Light'
];

export const NEAR_VA_OPTIONS = [
  'N6',
  'N8',
  'N10',
  'N12',
  'N18',
  'N24',
  'N36',
  'J1',
  'J2',
  'J3',
  'J4',
  'J5',
  'J6'
];

export const NEAR_TEST_DISTANCES = ['33 cm', '35 cm', '40 cm', '45 cm'];

export const PUPIL_SIZES = ['2.0 mm', '2.5 mm', '3.0 mm', '3.5 mm', '4.0 mm', '4.5 mm', '5.0 mm', '6.0 mm', 'Dilated (8.0 mm)'];

export const PUPIL_SHAPES = ['Round & Regular', 'Oval', 'Irregular', 'Keyhole / Coloboma', 'Sluggish / Distorted'];

export const TONOMETRY_METHODS = [
  'NCT (Non-Contact)',
  'Goldmann Applanation',
  'Schiotz',
  'Palpation',
  'Other'
];

export const COLOUR_VISION_TESTS = [
  'Ishihara 38 Plates',
  'Ishihara 24 Plates',
  'Ishihara 14 Plates',
  'Farnsworth D-15',
  'Other'
];

export const VISUAL_FIELD_TESTS = [
  'Confrontation',
  'Humphrey (HFA 24-2 / 30-2)',
  'Octopus 900',
  'Amsler Grid',
  'Other'
];

export const LENS_STATUS_OPTIONS = [
  'Clear',
  'Cataract',
  'Pseudophakia (PCIOL)',
  'Pseudophakia (ACIOL)',
  'Aphakia',
  'IOL in-the-bag',
  'Posterior Capsule Opacification (PCO)',
  'Other'
];

export const CATARACT_GRADES = [
  'Grade I (Mild / Early)',
  'Grade II (Moderate)',
  'Grade III (Nuclear Sclerotic / Mature)',
  'Grade IV (Hypermature / Morgagnian)',
  'Early / Immature',
  'N/A'
];

export const CATARACT_TYPES = [
  'Nuclear Sclerotic (NS)',
  'Cortical Cataract (CC)',
  'Posterior Subcapsular (PSC)',
  'Mixed (NS + CC + PSC)',
  'Congenital',
  'Traumatic',
  'Complicated Cataract',
  'Other'
];

export const OPTIC_DISC_STATUSES = [
  'Pink & Well-Defined Margins',
  'Pale Disc / Optic Atrophy',
  'Hyperemic / Papilledema',
  'Glaucomatous Cupping',
  'Tilted Disc',
  'Peripapillary Atrophy (PPA)',
  'Disc Drusen',
  'Other'
];

export const CD_RATIO_OPTIONS = [
  '0.2:1 (Normal)',
  '0.3:1 (Normal)',
  '0.4:1 (Normal)',
  '0.5:1 (Borderline)',
  '0.6:1 (Glaucoma Suspect)',
  '0.7:1 (Glaucomatous)',
  '0.8:1 (Advanced Cupping)',
  '0.9:1 (Severe / Near Total)',
  'Other / Asymmetric'
];

export const MACULA_STATUSES = [
  'Normal Foveal Reflex',
  'Dull Foveal Reflex',
  'Macular Edema / Thickening (DME)',
  'Drusen / Dry ARMD',
  'Choroidal Neovascularization (Wet ARMD)',
  'Macular Hole',
  'Epiretinal Membrane (ERM)',
  'Macular Scar',
  'Other'
];

export const VESSEL_RATIOS = [
  '2:3 (Normal)',
  '1:2 (Mild Attenuation)',
  '1:3 (Moderate Attenuation)',
  '1:4 (Severe Narrowing)',
  'Tortuous & Dilated',
  'Other'
];

export const RETINA_STATUSES = [
  'Normal / Clear',
  'Flat & Attached 360°',
  'Lattice Degeneration',
  'Retinal Tear / Hole',
  'Retinal Detachment',
  'Diabetic Retinopathy (NPDR)',
  'Proliferative Diabetic Retinopathy (PDR)',
  'Hypertensive Retinopathy',
  'Branch Retinal Vein Occlusion (BRVO)',
  'Central Retinal Vein Occlusion (CRVO)',
  'Retinitis Pigmentosa',
  'Other'
];

export const RETINAL_VESSEL_STATUSES = [
  'Normal Calibre & Course (A:V 2:3)',
  'Arteriolar Attenuation / Narrowing',
  'AV Crossing Changes / Nicking (Grade 2 HTN)',
  'Copper / Silver Wiring (Grade 3/4 HTN)',
  'Microaneurysms & Dot-Blot Hemorrhages',
  'Hard Exudates',
  'Cotton Wool Spots (Soft Exudates)',
  'Neovascularization at Disc/Elsewhere (NVD/NVE)',
  'Vitreous Hemorrhage',
  'Other'
];

export const PERIPHERAL_RETINA_STATUSES = [
  'Flat & Attached 360°',
  'Lattice Degeneration',
  'Retinal Tear / Hole with Operculum',
  'Retinal Detachment (RD)',
  'Pavingstone Degeneration',
  'Laser Scars (PRP)',
  'Other'
];

export const KERATOMETRY_UNITS = [
  'Diopters (D)',
  'Millimeters (mm)'
];

export const MEDICINE_CATEGORIES = [
  'Lubricant / Artificial Tear',
  'Antibiotic',
  'Anti-Allergic',
  'Anti-Inflammatory',
  'Steroid',
  'Antibiotic + Steroid Combination',
  'Glaucoma',
  'Mydriatic / Cycloplegic',
  'Anti-Glaucoma Combination',
  'Lubricant Gel',
  'Eye Ointment',
  'Nutritional / Antioxidant',
  'Other'
];

export const MEDICINE_FORMS = [
  'Eye Drop',
  'Eye Gel',
  'Eye Ointment',
  'Tablet',
  'Capsule',
  'Syrup',
  'Suspension',
  'Other'
];

export const MEDICINE_ROUTES = [
  { value: 'OU', label: 'OU (Both Eyes)' },
  { value: 'OD', label: 'OD (Right Eye)' },
  { value: 'OS', label: 'OS (Left Eye)' },
  { value: 'Oral', label: 'Oral (By Mouth)' },
  { value: 'Topical', label: 'Topical (Skin/Lids)' }
];

export const COMMON_FREQUENCIES = [
  'Once daily (OD / Morning)',
  'Once at bedtime (HS / Night)',
  'Twice daily (BD / 12 hr gap)',
  '3 times daily (TDS / 8 hr gap)',
  '4 times daily (QID / 6 hr gap)',
  'Every 2 hours (Intensive)',
  'Every 1 hour (Severe)',
  'SOS / When needed'
];

export const COMMON_DURATIONS = [
  '3 Days',
  '5 Days',
  '7 Days',
  '10 Days',
  '14 Days',
  '15 Days',
  '1 Month (30 Days)',
  '2 Months (60 Days)',
  'Continuous / Regular'
];

export interface DiagnosisMasterItem {
  name: string;
  icd10: string;
  category: string;
}

export const COMMON_DIAGNOSES_MASTER: DiagnosisMasterItem[] = [
  { name: 'Simple Myopia', icd10: 'H52.1', category: 'Refractive' },
  { name: 'High Myopia', icd10: 'H52.13', category: 'Refractive' },
  { name: 'Hypermetropia', icd10: 'H52.0', category: 'Refractive' },
  { name: 'Myopic Astigmatism', icd10: 'H52.2', category: 'Refractive' },
  { name: 'Presbyopia', icd10: 'H52.4', category: 'Refractive' },
  { name: 'Dry Eye Syndrome (DES)', icd10: 'H04.12', category: 'Surface' },
  { name: 'Computer Vision Syndrome', icd10: 'H53.1', category: 'Surface' },
  { name: 'Allergic Conjunctivitis', icd10: 'H10.1', category: 'Surface' },
  { name: 'Bacterial Conjunctivitis', icd10: 'H10.0', category: 'Surface' },
  { name: 'Blepharitis & MGD', icd10: 'H01.0', category: 'Adnexa' },
  { name: 'Immature Senile Cataract', icd10: 'H25.0', category: 'Lens' },
  { name: 'Nuclear Cataract (NS2)', icd10: 'H25.1', category: 'Lens' },
  { name: 'Cortical Cataract', icd10: 'H25.01', category: 'Lens' },
  { name: 'Posterior Subcapsular Cataract', icd10: 'H25.04', category: 'Lens' },
  { name: 'Pseudophakia (PCIOL)', icd10: 'Z96.1', category: 'Lens' },
  { name: 'Posterior Capsule Opacification (PCO)', icd10: 'H26.4', category: 'Lens' },
  { name: 'Primary Open Angle Glaucoma', icd10: 'H40.11', category: 'Glaucoma' },
  { name: 'Primary Angle Closure Glaucoma', icd10: 'H40.22', category: 'Glaucoma' },
  { name: 'Glaucoma Suspect / OHT', icd10: 'H40.01', category: 'Glaucoma' },
  { name: 'Non-Proliferative Diabetic Retinopathy', icd10: 'E11.319', category: 'Retina' },
  { name: 'Diabetic Macular Edema (DME)', icd10: 'E11.35', category: 'Retina' },
  { name: 'Hypertensive Retinopathy', icd10: 'H35.03', category: 'Retina' },
  { name: 'Age-Related Macular Degeneration', icd10: 'H35.31', category: 'Retina' },
  { name: 'Pterygium', icd10: 'H11.0', category: 'Surface' },
  { name: 'Chalazion', icd10: 'H00.1', category: 'Adnexa' },
  { name: 'Corneal Abrasion / Foreign Body', icd10: 'T15.0', category: 'Cornea' }
];

export const COMMON_DIAGNOSES = [
  'Simple Myopia',
  'High Myopia',
  'Hypermetropia',
  'Simple Myopic Astigmatism',
  'Compound Myopic Astigmatism',
  'Mixed Astigmatism',
  'Presbyopia',
  'Dry Eye Syndrome (DES)',
  'Computer Vision Syndrome (CVS)',
  'Allergic Conjunctivitis',
  'Bacterial Conjunctivitis',
  'Viral Conjunctivitis',
  'Blepharitis',
  'Meibomian Gland Dysfunction (MGD)',
  'Immature Senile Cataract (NS1/NS2)',
  'Mature Cataract',
  'Pseudophakia (PCIOL)',
  'Posterior Capsule Opacification (PCO)',
  'Glaucoma Suspect',
  'Primary Open Angle Glaucoma (POAG)',
  'Primary Angle Closure Glaucoma (PACG)',
  'Diabetic Retinopathy (NPDR)',
  'Diabetic Retinopathy (PDR)',
  'Diabetic Macular Edema (DME)',
  'Hypertensive Retinopathy',
  'Age-Related Macular Degeneration (Dry ARMD)',
  'Age-Related Macular Degeneration (Wet ARMD)',
  'Pterygium',
  'Pinguecula',
  'Corneal Abrasion / Foreign Body',
  'Corneal Ulcer / Keratitis',
  'Amblyopia',
  'Strabismus / Squint',
  'Chalazion',
  'Hordeolum Internum / Stye',
  'Epiphora / Dacryocystitis',
  'Accommodative Asthenopia'
];

export const INVESTIGATION_OPTIONS = [
  'OCT Macula & RNFL',
  'Visual Field Analysis (HFA 24-2)',
  'Pachymetry (Central Corneal Thickness)',
  'B-Scan Ultrasonography',
  'Corneal Topography / Keratometry',
  'Fasting Blood Sugar (FBS) & PPBS',
  'HbA1c Glycated Hemoglobin',
  'Schirmer Test & TBUT',
  'Specular Microscopy (Endothelial Count)',
  'Fundus Fluorescein Angiography (FFA)'
];

export const SURGERY_ADVICE_OPTIONS = [
  'Phacoemulsification with Foldable Monofocal IOL',
  'Phacoemulsification with Toric Premium IOL',
  'Phacoemulsification with Multifocal / EDOF IOL',
  'Small Incision Cataract Surgery (SICS) + Rigid IOL',
  'Pterygium Excision with Conjunctival Autograft (CAG)',
  'Nd:YAG Laser Posterior Capsulotomy',
  'Nd:YAG Laser Peripheral Iridotomy (LPI)',
  'Dacryocystorhinostomy (DCR)',
  'Dacryocystectomy (DCT)',
  'Chalazion Incision & Curettage',
  'Foreign Body Removal under Slit Lamp',
  'Intravitreal Anti-VEGF Injection'
];

export const REFERRAL_OPTIONS = [
  'Vitreo-Retina Specialist & Clinic',
  'Glaucoma Specialty Clinic',
  'Cornea & Anterior Segment Specialist',
  'Pediatric Ophthalmology & Strabismus Clinic',
  'Neuro-Ophthalmology Department',
  'Oculoplasty, Orbit & Lacrimal Clinic',
  'Low Vision & Vision Rehabilitation Clinic',
  'General Physician / Diabetologist'
];

export const SPECTACLE_TYPE_OPTIONS = [
  'Single Vision Distance',
  'Single Vision Reading / Near',
  'Progressive (PAL) Blue-Cut ARC',
  'Bifocal (Kryptok / D-Segment) Anti-Glare',
  'Blue-Cut ARC Computer Glasses',
  'DriveSafe Anti-Glare Night Lenses',
  'Photochromic UV400 All-Day',
  'High Index Polycarbonate 1.67'
];

export const FOLLOW_UP_INTERVALS = [
  { label: '3 Days', days: 3 },
  { label: '7 Days', days: 7 },
  { label: '15 Days', days: 15 },
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year (Annual)', days: 365 },
  { label: 'SOS / As Needed', days: 0 }
];

export const calculatePinholeImprovement = (before: string, after: string): 'Improved' | 'No Improvement' | 'N/A' => {
  if (!before || !after) return 'N/A';
  if (before.trim() === after.trim()) return 'No Improvement';
  
  const rankMap: Record<string, number> = {
    '6/60': 1, '6/36': 2, '6/24': 3, '6/18': 4, '6/12': 5, '6/9': 6, '6/6': 7,
    '20/200': 1, '20/100': 2, '20/80': 3, '20/60': 4, '20/40': 5, '20/25': 6, '20/20': 7
  };

  const bRank = rankMap[before.trim()] || 0;
  const aRank = rankMap[after.trim()] || 0;

  if (bRank > 0 && aRank > 0) {
    return aRank > bRank ? 'Improved' : 'No Improvement';
  }

  // Fallback string comparison for low vision
  if (before.includes('CF') || before.includes('HM') || before.includes('PL')) {
    if (after.includes('6/') || after.includes('20/')) return 'Improved';
  }

  return 'Improved';
};

export const createEmptyClinicalExamination = (): ClinicalExamination => {
  return {
    vaOdWithout: '6/18',
    vaOdWith: '6/6',
    vaOdBest: '6/6',
    vaOsWithout: '6/18',
    vaOsWith: '6/6',
    vaOsBest: '6/6',
    phOd: '6/6',
    phOs: '6/6',
    nearVision: 'N6',
    iopOd: '14 mmHg',
    iopOs: '14 mmHg',
    pupilStatus: 'Normal',
    pupilNotes: 'Round, regular, reactive to light (RRRTL)',
    eomStatus: 'Normal',
    eomNotes: 'Full extraocular movements in all 9 gazes',
    adnexaStatus: 'Normal',
    adnexaNotes: 'Lids & adnexa healthy, puncta patent',
    anteriorSegmentStatus: 'Normal',
    anteriorSegmentNotes: 'Cornea clear, AC quiet & deep, iris pattern normal',
    fundusStatus: 'Normal',
    fundusNotes: 'Disc margins well defined, CDR 0.3, macula healthy, normal vessel caliber',
    clinicalFindings: '',

    distanceVa: {
      od: { unaided: '6/18', withCorrection: '6/6', pinhole: '6/6' },
      os: { unaided: '6/18', withCorrection: '6/6', pinhole: '6/6' },
      ou: { unaided: '6/12', withCorrection: '6/6' },
      notes: ''
    },

    pinholeExam: {
      odBefore: '6/18',
      odAfter: '6/6',
      osBefore: '6/18',
      osAfter: '6/6',
      odImprovement: 'Improved',
      osImprovement: 'Improved',
      notes: ''
    },

    nearVisionExam: {
      odUnaided: 'N10',
      odWithCorrection: 'N6',
      osUnaided: 'N10',
      osWithCorrection: 'N6',
      ouUnaided: 'N8',
      ouWithCorrection: 'N6',
      testingDistance: '35 cm',
      notes: ''
    },

    refractionStages: {
      currentGlasses: {
        od: { sph: '-1.00', cyl: '0.00', axis: '-', add: '+1.50', va: '6/9' },
        os: { sph: '-1.00', cyl: '0.00', axis: '-', add: '+1.50', va: '6/9' },
        notes: ''
      },
      autoRefraction: {
        od: { sph: '-1.50', cyl: '-0.50', axis: '90°' },
        os: { sph: '-1.50', cyl: '-0.50', axis: '90°' },
        notes: ''
      },
      retinoscopy: {
        od: { sph: '-1.50', cyl: '-0.50', axis: '90°', workingDist: '66 cm (-1.50D)' },
        os: { sph: '-1.50', cyl: '-0.50', axis: '90°', workingDist: '66 cm (-1.50D)' },
        notes: ''
      },
      subjectiveRefraction: {
        od: { sph: '-1.50', cyl: '-0.50', axis: '90°', add: '+1.75', va: '6/6' },
        os: { sph: '-1.50', cyl: '-0.50', axis: '90°', add: '+1.75', va: '6/6' },
        notes: ''
      },
      finalPrescription: {
        od: { sph: '-1.50', cyl: '-0.50', axis: '90°', add: '+1.75', distanceVa: '6/6', nearVa: 'N6', pd: '31' },
        os: { sph: '-1.50', cyl: '-0.50', axis: '90°', add: '+1.75', distanceVa: '6/6', nearVa: 'N6', pd: '31' },
        pdTotal: '62',
        pdOd: '31',
        pdOs: '31',
        prescriptionDate: new Date().toISOString().split('T')[0],
        examinerName: 'Dr. S. K. Banerjee',
        examinerRole: 'Ophthalmologist'
      }
    },

    pupilExam: {
      od: { sizeMm: '3.0 mm', shape: 'Round & Regular', directReaction: 'Brisk', consensualReaction: 'Present', rapd: 'Absent', status: 'Normal', notes: '' },
      os: { sizeMm: '3.0 mm', shape: 'Round & Regular', directReaction: 'Brisk', consensualReaction: 'Present', rapd: 'Absent', status: 'Normal', notes: '' },
      notes: ''
    },

    tonometry: {
      odIop: '14',
      osIop: '14',
      unit: 'mmHg',
      method: 'NCT (Non-Contact)',
      measurementTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: ''
    },

    colourVision: {
      testType: 'Ishihara 38 Plates',
      odResult: 'Normal',
      osResult: 'Normal',
      ouResult: 'Normal',
      score: '38/38',
      defectType: 'None',
      notes: ''
    },

    visualField: {
      testType: 'Confrontation',
      odResult: 'Normal',
      osResult: 'Normal',
      defectDescription: 'Full visual field bilaterally',
      notes: ''
    },

    motility: {
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
    },

    externalExam: {
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
    },

    slitLamp: {
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
    },

    lensCataract: {
      od: { status: 'Clear', cataractGrade: 'N/A', cataractType: 'Nuclear Sclerotic (NS)', notes: '' },
      os: { status: 'Clear', cataractGrade: 'N/A', cataractType: 'Nuclear Sclerotic (NS)', notes: '' },
      notes: ''
    },

    fundus: {
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
    },

    keratometry: {
      od: { k1: '43.50 D @ 180°', k2: '44.00 D @ 90°', axis: '90°', avgK: '43.75 D', cylAstig: '-0.50 D' },
      os: { k1: '43.50 D @ 180°', k2: '44.00 D @ 90°', axis: '90°', avgK: '43.75 D', cylAstig: '-0.50 D' },
      notes: ''
    },

    treatmentPlan: {
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
    }
  };
};
