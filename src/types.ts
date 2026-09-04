export type CanonicalRole =
  | 'ADMIN'
  | 'RECEPTION'
  | 'OPTOMETRIST'
  | 'SALES'
  | 'ACCOUNTANT'
  | 'MARKETING'
  | 'READ_ONLY';

export type UserRole =
  | CanonicalRole
  | 'Admin'
  | 'Doctor'
  | 'Optometrist'
  | 'Receptionist'
  | 'Sales'
  | 'Inventory'
  | 'Accountant'
  | 'Marketing Staff'
  | 'Read Only';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'print';

export type PermissionModule =
  | 'Dashboard'
  | 'Patients'
  | 'Customers'
  | 'Doctors'
  | 'Appointments'
  | 'Clinical Entry'
  | 'Clinical Visits'
  | 'Prescriptions'
  | 'Medicines'
  | 'Spectacle Orders'
  | 'Retail POS'
  | 'Wholesale'
  | 'Lens Stock'
  | 'Lens Inventory'
  | 'Frame Stock'
  | 'Frame Inventory'
  | 'Central Stock'
  | 'Purchases'
  | 'Suppliers'
  | 'Suppliers & Purchases'
  | 'Payments'
  | 'Due Management'
  | 'Finance & Due'
  | 'Loyalty'
  | 'Loyalty & Rewards'
  | 'WhatsApp CRM'
  | 'CRM & WhatsApp'
  | 'Marketing'
  | 'Reports'
  | 'CEO Analytics & Profit'
  | 'Google Sheets'
  | 'Audit Logs'
  | 'Settings'
  | 'Master Management'
  | 'User Management';

export interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  print: boolean;
}

export type RolePermissionsMap = Record<CanonicalRole, Record<PermissionModule, ModulePermissions>>;

export interface FailedAccessAttempt {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  module: string;
  action: string;
  reason: string;
  userAgent?: string;
  isSimulated?: boolean;
}

export interface ERPUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: 'Active' | 'Disabled';
  phone?: string;
  lastLogin?: string;
  createdAt?: string;
  permissions?: string[];
  customPermissions?: Partial<Record<PermissionModule, Partial<ModulePermissions>>>;
}


export type Gender = 'Male' | 'Female' | 'Other';
export type VisitType = 'New Consultation' | 'New Eye Consultation' | 'Follow-up' | 'Refraction / Vision Check' | 'Emergency' | 'Post-Op Review' | 'Spectacle Prescription Review' | 'Contact Lens Fitting';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Credit' | 'Mixed' | 'Other';
export type PaymentStatus = 'Pending' | 'Partial' | 'Paid' | 'Cancelled';

export type AuditAction = 'CREATE' | 'EDIT' | 'UPDATE' | 'DELETE' | 'CANCEL' | 'PAYMENT' | 'STATUS_CHANGE' | 'DISCOUNT' | 'RETURN' | string;
export type AuditModule = 'Patients' | 'Appointments' | 'Clinical' | 'Prescription' | 'Spectacles' | 'Inventory' | 'Billing' | 'Settings' | 'Customer' | 'Retail' | 'Finance' | 'System' | string;

export interface DoctorMaster {
  id: string; // e.g. DOC-01
  name: string;
  degree?: string;
  qualification?: string;
  designation?: string;
  specialization?: string;
  regNo?: string;
  registrationNo?: string;
  mobile?: string;
  whatsapp?: string;
  phone?: string;
  address?: string;
  consultationFee: number;
  status: 'Active' | 'Inactive' | 'Archived';
  isArchived?: boolean;
  archivedAt?: string;
  archivedReason?: string;
  joiningDate?: string;
  notes?: string;
}

export interface OptometristMaster {
  id: string; // e.g. OPT-01
  name: string;
  qualification?: string;
  designation?: string;
  degree?: string;
  regNo?: string;
  registrationNo?: string;
  mobile?: string;
  phone?: string;
  examinationFee: number;
  status: 'Active' | 'Inactive';
}

export interface Patient {
  mrd: string; // e.g. PEC-2026-1001 (Permanent System-Generated ID)
  name: string;
  dob?: string;
  age: number;
  gender: Gender;
  mobile: string;
  whatsapp?: string;
  fatherName?: string;
  fatherHusbandName?: string;
  occupation?: string;
  address: string;
  fullAddress?: string;
  village?: string;
  postOffice?: string;
  policeStation?: string;
  district: string;
  state?: string;
  pinCode?: string;
  email?: string;
  emergencyContact?: string;
  referredBy?: string;
  chiefComplaints?: string;
  medicalHistory?: string[];
  registrationDate: string;
  status: 'Active' | 'Inactive' | 'Regular' | 'New Patient' | 'Follow-up Patient';
  notes?: string;
  isArchived?: boolean;
  archivedAt?: string;
  archivedReason?: string;
  optOutPromotions?: boolean;
}

export type AppointmentStatus = 'Booked' | 'Confirmed' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled' | 'No Show' | 'Pending';

export interface Appointment {
  id: string; // e.g. APT-2026-0501
  mrd: string; // Patient / MRD ID
  patientName: string;
  mobile: string;
  whatsapp?: string;
  age?: number;
  dob?: string;
  gender?: Gender;
  address?: string;
  fullAddress?: string;
  village?: string;
  postOffice?: string;
  policeStation?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  occupation?: string;
  referredBy?: string;
  doctor: string;
  optometrist?: string;
  date: string;
  time: string;
  visitType: VisitType | string;
  doctorFee?: number;
  optometristFee?: number;
  fee?: number; // Total / Gross Fee
  totalFee?: number;
  discount?: number;
  netFee?: number;
  paidAmount?: number;
  paid?: number;
  due?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: 'Pending' | 'Partial' | 'Paid' | 'Cancelled';
  status: AppointmentStatus;
  chiefComplaints?: string;
  medicalHistory?: string[];
  receptionNote?: string;
  otherNotes?: string;
  notes?: string;
  isArchived?: boolean;
  archivedAt?: string;
  archivedReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EyePower {
  sph: string; // -1.25, +0.50, Plano, DS, etc
  cyl: string;
  axis: string; // 90°, 180°, etc
  add: string; // +1.50, +2.00, etc
  prism?: string; // e.g. 1.5 BD, 2.0 BO
  distanceVa: string; // 6/6, 6/9, 6/12, etc
  nearVa: string; // N6, N8, N10, etc
  pd?: string; // e.g. 31, 62
}

export interface PrescribedMedicine {
  id?: string;
  medicineId?: string;
  name: string;
  genericName?: string;
  strength?: string;
  form?: 'Eye Drop' | 'Eye Ointment' | 'Tablet' | 'Capsule' | 'Syrup' | 'Gel' | 'Drop' | 'Ointment' | string;
  dose?: string; // e.g. 1 drop, 1 tab
  frequency?: string; // e.g. 3 times daily, 4 times daily, Once at bedtime
  duration?: string; // e.g. 7 days, 15 days, 1 month
  food?: string; // e.g. After meal, Before meal, As directed
  route?: string; // e.g. Ophthalmic (Both Eyes), Right Eye (OD), Left Eye (OS), Oral
  eye?: 'OD' | 'OS' | 'OU' | 'Oral' | string;
  instruction?: string; // e.g. Shake well before use, Gap 5 mins between drops
  quantity?: number | string; // Qty / Pack count
}

// 1. Granular Visual Acuity (Distance)
export interface VisualAcuityEye {
  unaided: string; // SC (e.g. 6/6, 6/9, 6/12, 6/18, 6/24, 6/36, 6/60, CF, HM, PL, NLP)
  withCorrection: string; // CC
  pinhole: string; // PH
}

export interface DistanceVisualAcuity {
  od: VisualAcuityEye;
  os: VisualAcuityEye;
  ou: {
    unaided: string;
    withCorrection: string;
  };
  notes?: string;
}

// 2. Pinhole Vision Record
export interface PinholeVisionRecord {
  odBefore: string;
  odAfter: string;
  osBefore: string;
  osAfter: string;
  odImprovement?: 'Improved' | 'No Improvement' | 'N/A';
  osImprovement?: 'Improved' | 'No Improvement' | 'N/A';
  notes?: string;
}

// 3. Near Vision Record
export interface NearVisionRecord {
  odUnaided: string;
  odWithCorrection: string;
  osUnaided: string;
  osWithCorrection: string;
  ouUnaided: string;
  ouWithCorrection: string;
  testingDistance?: string; // e.g. "33 cm", "35 cm", "40 cm"
  notes?: string;
}

// 4. Refraction Stages
export interface RefractionPowerSet {
  sph: string;
  cyl: string;
  axis: string;
  add?: string;
  va?: string;
  notes?: string;
}

export interface RetinoscopySide {
  sph: string;
  cyl: string;
  axis: string;
  workingDist?: string; // e.g. "66 cm (-1.50 D)"
  notes?: string;
}

export interface RefractionStages {
  currentGlasses?: {
    od: RefractionPowerSet;
    os: RefractionPowerSet;
    notes?: string;
  };
  autoRefraction?: {
    od: { sph: string; cyl: string; axis: string; notes?: string };
    os: { sph: string; cyl: string; axis: string; notes?: string };
    notes?: string;
  };
  retinoscopy?: {
    od: RetinoscopySide;
    os: RetinoscopySide;
    notes?: string;
  };
  subjectiveRefraction?: {
    od: RefractionPowerSet;
    os: RefractionPowerSet;
    notes?: string;
  };
  finalPrescription?: {
    od: EyePower;
    os: EyePower;
    pdTotal?: string;
    pdOd?: string;
    pdOs?: string;
    prescriptionDate: string;
    examinerName: string;
    examinerRole?: string;
    notes?: string;
  };
}

// 5. Pupil Examination
export interface PupilSideExam {
  sizeMm: string; // e.g. "3 mm", "4 mm"
  shape: string; // "Round & Regular", "Irregular", "Oval", "Coloboma", "Other"
  directReaction: 'Brisk' | 'Sluggish' | 'Non-reactive' | string;
  consensualReaction: 'Present' | 'Sluggish' | 'Absent' | string;
  rapd: 'Absent' | 'Present' | 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4' | string;
  status: 'Normal' | 'Abnormal';
  notes?: string;
}

export interface PupilExamRecord {
  od: PupilSideExam;
  os: PupilSideExam;
  notes?: string;
}

// 6. IOP / Tonometry
export interface TonometryRecord {
  odIop: string; // Value e.g. "14"
  osIop: string; // Value e.g. "15"
  unit: 'mmHg' | string;
  method: 'NCT (Non-Contact)' | 'Goldmann Applanation' | 'Schiotz' | 'Palpation' | 'Other';
  measurementTime: string; // e.g. "10:30 AM"
  notes?: string;
}

// 7. Colour Vision
export interface ColourVisionRecord {
  testType: 'Ishihara 38 Plates' | 'Ishihara 24 Plates' | 'Ishihara 14 Plates' | 'Farnsworth D-15' | 'Other';
  odResult: 'Normal' | 'Abnormal';
  osResult: 'Normal' | 'Abnormal';
  ouResult: 'Normal' | 'Abnormal';
  score?: string; // e.g. "14/14"
  defectType?: string; // e.g. "Red-Green Defect", "Protan", "Deutan", "Tritan"
  notes?: string;
}

// 8. Visual Field
export interface VisualFieldRecord {
  testType: 'Confrontation' | 'Humphrey (HFA 24-2 / 30-2)' | 'Octopus' | 'Amsler Grid' | 'Other';
  odResult: 'Normal' | 'Abnormal';
  osResult: 'Normal' | 'Abnormal';
  defectDescription?: string;
  notes?: string;
}

// 9. Ocular Motility / EOM
export interface OcularMotilityRecord {
  status: 'Normal' | 'Abnormal';
  odStatus: 'Normal' | 'Abnormal';
  osStatus: 'Normal' | 'Abnormal';
  ouStatus: 'Normal' | 'Abnormal';
  diplopia: 'None' | 'Present' | 'Horizontal' | 'Vertical' | 'Torsional' | string;
  nystagmus: 'None' | 'Present' | 'Jerk' | 'Pendular' | 'Latent' | string;
  restriction: 'None' | 'Mild' | 'Moderate' | 'Severe' | string;
  movementLimitation?: string;
  otherFindings?: string;
  notes?: string;
}

// 10. External Eye Examination
export interface ClinicalStructureStatus {
  status: 'Normal' | 'Abnormal';
  notes?: string;
}

export interface ExternalEyeSideExam {
  lids: ClinicalStructureStatus;
  lashes: ClinicalStructureStatus;
  lacrimalSystem: ClinicalStructureStatus;
  periorbitalArea: ClinicalStructureStatus;
  conjunctiva: ClinicalStructureStatus;
  sclera: ClinicalStructureStatus;
  notes?: string;
}

export interface ExternalEyeExamRecord {
  od: ExternalEyeSideExam;
  os: ExternalEyeSideExam;
  notes?: string;
}

// 11. Slit Lamp / Anterior Segment
export interface AnteriorSegmentSideExam {
  conjunctiva: ClinicalStructureStatus;
  sclera: ClinicalStructureStatus;
  cornea: ClinicalStructureStatus;
  anteriorChamber: ClinicalStructureStatus & { depth?: string; cellsFlare?: string };
  iris: ClinicalStructureStatus;
  pupil: ClinicalStructureStatus;
  lens: ClinicalStructureStatus;
  other?: ClinicalStructureStatus;
  notes?: string;
}

export interface SlitLampExamRecord {
  od: AnteriorSegmentSideExam;
  os: AnteriorSegmentSideExam;
  notes?: string;
}

// 12. Lens / Cataract Details
export interface LensCataractSideExam {
  status: 'Clear' | 'Cataract' | 'Pseudophakia (PCIOL)' | 'Pseudophakia (ACIOL)' | 'Aphakia' | 'IOL' | 'Other';
  cataractGrade?: 'Grade I (Mild)' | 'Grade II (Moderate)' | 'Grade III (Mature)' | 'Grade IV (Hypermature)' | 'Early / Immature' | 'N/A' | string;
  cataractType?: 'Nuclear Sclerotic (NS)' | 'Cortical (CC)' | 'Posterior Subcapsular (PSC)' | 'Mixed (NS+CC+PSC)' | 'Congenital' | 'Traumatic' | 'Other' | string;
  notes?: string;
}

export interface LensCataractExamRecord {
  od: LensCataractSideExam;
  os: LensCataractSideExam;
  notes?: string;
}

// 13. Fundus Examination
export interface FundusSideExam {
  opticDisc: ClinicalStructureStatus & { discAppearance?: string };
  cdRatio: string; // e.g. "0.3", "0.4", "0.6"
  macula: ClinicalStructureStatus & { fovealReflex?: string };
  vessels: ClinicalStructureStatus & { avRatio?: string };
  retina: ClinicalStructureStatus & { periphery?: string };
  vitreous: ClinicalStructureStatus & { clarity?: string };
  otherFindings?: string;
  notes?: string;
}

export interface FundusExamRecord {
  od: FundusSideExam;
  os: FundusSideExam;
  notes?: string;
}

// 14. Keratometry
export interface KeratometrySide {
  k1: string; // e.g. "43.50 D @ 180°"
  k2: string; // e.g. "44.25 D @ 90°"
  axis: string; // e.g. "90°"
  avgK?: string;
  cylAstig?: string;
  notes?: string;
}

export interface KeratometryRecord {
  od: KeratometrySide;
  os: KeratometrySide;
  notes?: string;
}

// 16. Treatment / Plan
export interface TreatmentPlan {
  prescriptionAdvised: boolean;
  spectacleAdvised: boolean;
  spectacleTypeRecommended?: string; // e.g. Single Vision, Progressive, Bifocal, Blue-Cut ARC
  medicineAdvised: boolean;
  investigationAdvised?: string; // e.g. OCT RNFL/Macula, Visual Field HFA 24-2, Pachymetry, B-Scan, Blood Sugar HbA1c
  followUpInterval?: string; // e.g. 7 Days, 15 Days, 1 Month, 3 Months, 6 Months, 1 Year
  followUpDate?: string;
  followUpReason?: string;
  referralAdvised?: string; // e.g. Vitreo-Retina, Glaucoma Clinic, Cornea, Pediatric Ophthal
  surgeryAdvice?: string; // e.g. Cataract Phaco + Foldable Monofocal IOL, Pterygium Excision + CAG
  otherAdvice?: string;
  notes?: string;
}

export interface ClinicalExamination {
  // Legacy flat fields preserved for full backward compatibility
  vaOdWithout?: string;
  vaOdWith?: string;
  vaOdBest?: string;
  vaOsWithout?: string;
  vaOsWith?: string;
  vaOsBest?: string;
  phOd?: string;
  phOs?: string;
  nearVision?: string;
  iopOd?: string; // mmHg
  iopOs?: string;
  pupilStatus?: 'Normal' | 'Abnormal';
  pupilNotes?: string;
  eomStatus?: 'Normal' | 'Abnormal';
  eomNotes?: string;
  adnexaStatus?: 'Normal' | 'Abnormal';
  adnexaNotes?: string;
  anteriorSegmentStatus?: 'Normal' | 'Abnormal';
  anteriorSegmentNotes?: string;
  fundusStatus?: 'Normal' | 'Abnormal';
  fundusNotes?: string;
  clinicalFindings?: string;

  // New structured clinical sections
  distanceVa?: DistanceVisualAcuity;
  pinholeExam?: PinholeVisionRecord;
  nearVisionExam?: NearVisionRecord;
  refractionStages?: RefractionStages;
  pupilExam?: PupilExamRecord;
  tonometry?: TonometryRecord;
  colourVision?: ColourVisionRecord;
  visualField?: VisualFieldRecord;
  motility?: OcularMotilityRecord;
  externalExam?: ExternalEyeExamRecord;
  slitLamp?: SlitLampExamRecord;
  lensCataract?: LensCataractExamRecord;
  fundus?: FundusExamRecord;
  keratometry?: KeratometryRecord;
  treatmentPlan?: TreatmentPlan;
}

export interface ClinicalDraft {
  editingVisitId?: string;
  mrd: string;
  patientName: string;
  age: number | string;
  gender: string;
  mobile: string;
  doctor: string;
  optometrist?: string;
  examinerRole?: string;
  visitType: string;
  visitDate?: string;
  appointmentId?: string;
  symptoms: string[];
  symptomDuration: string;
  symptomSeverity: 'Mild' | 'Moderate' | 'Severe';
  odPower: EyePower;
  osPower: EyePower;
  examination: ClinicalExamination;
  diagnosis: string[];
  customDiagnosis: string;
  medicines: PrescribedMedicine[];
  advice: string;
  followUpDays: number;
  followUpDate?: string;
  followUpReason?: string;
  referral?: string;
  surgeryAdvice?: string;
  investigation?: string;
  spectacleAdvice?: string;
}

export interface ClinicalVisit {
  visitId: string; // e.g. VST-2026-3001
  appointmentId?: string;
  mrd: string;
  patientName: string;
  age: number;
  gender: string;
  mobile: string;
  doctor: string;
  optometrist?: string;
  examinerRole?: string;
  visitType: string;
  visitDate: string;
  symptoms: string[];
  symptomDuration: string;
  symptomSeverity: 'Mild' | 'Moderate' | 'Severe';
  examination: ClinicalExamination;
  odPower: EyePower;
  osPower: EyePower;
  diagnosis: string[];
  customDiagnosis?: string;
  medicines: PrescribedMedicine[];
  advice: string;
  followUpDays?: number;
  followUpDate?: string;
  followUpReason?: string;
  referral?: string;
  surgeryAdvice?: string;
  investigation?: string;
  spectacleAdvice?: string;
  rxId: string;
  timestamp: string;
}

export interface PrescriptionRecord {
  rxId: string; // e.g. RX-2026-9001
  visitId: string;
  mrd: string;
  patientName: string;
  age: number;
  gender: string;
  date: string;
  doctor: string;
  doctorQualification?: string;
  odPower: EyePower;
  osPower: EyePower;
  medicines: PrescribedMedicine[];
  diagnosis: string[];
  advice: string;
  followUpDate?: string;
}

export type MedicineCategory =
  | 'Lubricant / Artificial Tear'
  | 'Antibiotic'
  | 'Anti-Allergic'
  | 'Anti-Inflammatory'
  | 'Steroid'
  | 'Antibiotic + Steroid Combination'
  | 'Glaucoma'
  | 'Mydriatic / Cycloplegic'
  | 'Anti-Glaucoma Combination'
  | 'Lubricant Gel'
  | 'Eye Ointment'
  | 'Nutritional / Antioxidant'
  | 'Other';

export interface MedicineMaster {
  id: string;
  name: string; // Brand Name (e.g., Refresh Tears, Vigamox, Pataday)
  genericName: string; // Generic composition (e.g., Carboxymethylcellulose, Moxifloxacin)
  category: MedicineCategory | string;
  strength: string; // e.g. 0.5%, 0.3%, 0.1%, 1%, 5mg/ml
  form: 'Eye Drop' | 'Eye Gel' | 'Eye Ointment' | 'Tablet' | 'Capsule' | 'Syrup' | 'Gel' | 'Other' | string;
  company: string; // Manufacturer / Company (e.g. Alcon, Sun Pharma, Cipla, Allergan)
  bottleSize?: string; // Pack size e.g. 5ml, 10ml, 15ml, 10 Tabs
  packSize?: string;
  stockQuantity?: number; // My Stock Quantity
  currentStock?: number;
  purchasePrice?: number; // Purchase Rate (₹)
  purchaseRate?: number;
  sellingPrice?: number; // Selling Rate / MRP (₹)
  mrp?: number;
  reorderLevel?: number; // Alert threshold
  active: boolean; // Active / Inactive status
  isFavorite?: boolean; // Favourite / Quick Access in Clinical Entry Center
  quickAccess?: boolean;
  notes?: string; // Optional Notes
  
  // Default Prescribing Parameters
  defaultEye?: 'OD' | 'OS' | 'OU' | 'Oral' | string;
  defaultDose?: string; // e.g. 1 Drop, 1 Tablet
  frequency?: string; // e.g. TDS (3 times daily), QID (4 times daily), BD, HS
  defaultDuration?: string; // e.g. 14 Days, 7 Days, 1 Month
  foodInstruction?: string; // e.g. After meal, Clean hands
  defaultInstruction?: string;
  route?: string; // e.g. Ophthalmic (Both Eyes), Oral
}

export interface FrameMaster {
  sku: string; // e.g. FRM-TITAN-001
  brand: string;
  model: string;
  colour: string;
  material: 'Acetate' | 'Metal' | 'Titanium' | 'TR90' | 'Ultem' | 'Rimless' | 'Half-Rim';
  shape: 'Rectangle' | 'Round' | 'Cat Eye' | 'Aviator' | 'Square' | 'Geometric' | 'Browline';
  gender: 'Unisex' | 'Men' | 'Women' | 'Kids';
  size: string; // e.g. 52-18-140
  purchaseRate: number;
  wholesaleRate: number;
  retailRate: number;
  mrp: number;
  currentStock: number;
  reorderLevel: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock' | 'Dead Stock';
}

export type LensStockType =
  | 'SINGLE VISION SPHERICAL'
  | 'SINGLE VISION CYLINDRICAL / TORIC'
  | 'BLUE CUT'
  | 'BLUE CUT GREEN'
  | 'BLUE CUT BLUE'
  | 'PG / PHOTOCHROMIC'
  | 'PROGRESSIVE'
  | 'PROGRESSIVE BLUE CUT'
  | 'PROGRESSIVE PG'
  | 'BIFOCAL'
  | 'HI-INDEX 1.67'
  | 'NORMAL CLEAR'
  | 'ARC / ANTI-REFLECTIVE'
  | 'OTHER CUSTOM LENS'
  | (string & {});

export type MasterCategoryKey =
  | 'lens-type'
  | 'brand'
  | 'company'
  | 'coating'
  | 'refractive-index'
  | 'frame-brand'
  | 'frame-type'
  | 'supplier'
  | 'medicine-brand'
  | 'diagnosis'
  | 'payment-method';

export interface MasterRecord {
  id: string; // e.g. LNT-001, BRD-001, CMP-001
  categoryKey: MasterCategoryKey;
  name: string; // Master Name e.g. "Anti Fatigue Lens", "Single Vision Spherical"
  code?: string; // Optional short code / abbreviation e.g. "AFL"
  subCategory?: string; // Optional parent classification (e.g. "Single Vision", "Progressive", "Opthalmic")
  description?: string; // Optional note / explanation
  active: boolean; // Active (available in dropdowns) / Inactive (deactivated, preserved for historical data)
  isDefault?: boolean;
  sortOrder?: number;
  metadata?: Record<string, any>;
  createdAt: string; // ISO date string
  createdBy: string; // e.g. "Admin (Dr. S. K. Banerjee)"
  updatedAt?: string;
  updatedBy?: string;
}

export interface LensMaster {
  lensCode: string; // e.g. LNS-BCG-0025 or LNS-SV-000125
  sku?: string; // Lens SKU alias
  productName: string; // Product name e.g. "Blue Cut Green 1.56", "SV Clear 1.56"
  company: string; // Essilor, Hoya, Zeiss, Prime Vision, VisionTech, SunMagic, etc
  brand: string; // Clear Vision, Crizal, Blue-Guard, OmniView, TransFast, Kryptok, etc
  category: 'Single Vision' | 'Bifocal' | 'Progressive' | 'Photochromic' | 'Blue Cut' | 'Hi-Index' | 'Executive Bifocal' | 'Other';
  lensType: LensStockType; // Exact stock type classification
  material: string; // 'CR-39' | 'Polycarbonate' | 'High Index 1.56' | 'High Index 1.60' | 'High Index 1.67' | 'High Index 1.74' | 'Mineral Glass' | 'Trivex' | 'Other';
  index: string; // '1.50' | '1.56' | '1.59' | '1.60' | '1.61' | '1.67' | '1.74'
  coating: string; // 'Blue Cut + AR' | 'Green HMC' | 'Blue HMC' | 'Super Hydrophobic' | 'Satin Anti-Dust' | 'Hard Coat' | 'Other'
  coatingVariant?: string; // 'Green Reflex' | 'Blue Reflex' | 'UV420 Night-Drive' | 'DriveSafe ARC'
  design: string; // 'Spherical' | 'Aspheric' | 'Digital Freeform' | 'Double Aspheric' | 'Bi-Focal D-Seg' | 'Kryptok' | 'Other'
  diameter: string; // '65mm' | '70mm' | '72mm' | '75mm' | '80mm'
  
  // Exact Power Information (Wholesaler & Retailer Stock Precision)
  sph: string; // e.g. '+0.25', '-1.50', '+2.00', '0.00' (Plano)
  cyl: string; // e.g. '+0.25', '-0.50', '0.00'
  axis: string; // e.g. '180', '90', '—'
  add: string; // e.g. '+1.50', '+2.00', '—'
  kt?: string; // KT / Series (e.g. 'KT-01', 'Series-A')
  series?: string; // Series or Model line
  model?: string;

  // Power range when defining a parent product or master series
  sphRange?: string; // e.g. 'Plano to -6.00'
  cylRange?: string; // e.g. '0.00 to -2.00'
  
  // Pricing & Commercials
  purchaseRate: number; // Purchase Rate (Cost ₹)
  wholesaleRate: number; // Wholesale Rate (B2B ₹)
  retailRate: number; // Retail Rate (₹)
  mrp: number; // MRP (₹)
  dealerRate?: number;
  minWholesaleRate?: number;

  // Stock, Inventory & Warehouse Tracking
  openingStock?: number;
  currentStock: number; // Exact stock in Pairs (or individual count)
  reorderLevel: number; // Alert threshold for this exact power
  maxStock?: number;
  rackLocation?: string; // Formatted location e.g. "Rack A - Shelf 02"
  rack?: string;
  shelf?: string;
  box?: string;
  location?: string;
  supplier?: string; // Primary Supplier name / vendor
  status: 'Available' | 'Low Stock' | 'Out of Stock' | 'Dead Stock';
  lastSaleDate?: string;
  notes?: string;
}

export interface LensPurchaseRecord {
  id: string; // e.g. PUR-LNS-2026-001
  purchaseDate: string;
  invoiceNumber: string;
  supplier: string;
  lensCode: string;
  productName: string;
  company: string;
  brand: string;
  category?: string;
  lensType?: LensStockType;
  sph: string;
  cyl: string;
  axis: string;
  add: string;
  quantity: number; // pairs
  purchaseRate: number;
  totalAmount: number;
  rack?: string;
  notes?: string;
  timestamp: string;
}

export interface StockAdjustmentRecord {
  id: string; // e.g. ADJ-2026-001
  date: string;
  lensId?: string;
  lensCode?: string;
  productCode?: string;
  company?: string;
  brand?: string;
  power?: string;
  systemStock?: number;
  physicalStock?: number;
  previousStock?: number;
  adjustmentQty?: number;
  newStock?: number;
  difference?: number;
  type?: 'Physical Audit' | 'Damage / Breakage' | 'Lab Fitting Wastage' | 'Received Excess' | 'Manual Correction' | 'Physical Count Difference' | 'Damage' | 'Missing' | 'Data Entry Error' | 'Other';
  reason: string;
  user?: string;
  adjustedBy?: string;
  notes?: string;
}

export interface LensReturnRecord {
  id?: string;
  returnId?: string;
  date: string;
  returnType?: 'Customer Return' | 'Supplier Return' | 'Dealer Return';
  returnSource?: string;
  referenceInvoiceId?: string;
  partyName: string;
  partyId?: string;
  lensCode: string;
  powerDescription?: string;
  quantity: number;
  reason: 'Power Mismatch' | 'Coating Defect / Scratched' | 'Customer Prescription Changed' | 'Dealer Overstock' | 'Wrong Axis' | 'Wrong Power' | 'Wrong Product' | 'Manufacturing Defect' | 'Damage' | 'Customer Return' | 'Other';
  condition?: string;
  actionTaken?: string;
  restockedToInventory?: boolean;
  refundOrAdjustmentAmount?: number;
  status?: 'Approved' | 'Pending' | 'Rejected';
  notes?: string;
}

export type MovementType = 'Purchase' | 'Retail Sale' | 'Wholesale Sale' | 'Spectacle Order' | 'Return' | 'Adjustment' | 'Damage' | 'Transfer';

export interface StockMovement {
  id: string; // e.g. MOV-2026-4001
  date: string;
  itemType: 'Lens' | 'Frame' | 'Medicine' | 'Accessory';
  itemCode: string;
  itemName: string;
  movementType: MovementType;
  reference: string; // Invoice / Order / PO ID
  qtyIn: number;
  qtyOut: number;
  balance: number;
  user: string;
  notes?: string;
  timestamp: string;
}

export type SpectacleOrderStatus = 'New' | 'Confirmed' | 'Lens Ordered' | 'In Production' | 'Ready' | 'Delivered' | 'Cancelled';

export interface SpectacleOrder {
  orderId: string; // e.g. ORD-2026-7001
  mrd: string;
  customerId?: string;
  customerName: string;
  mobile: string;
  whatsapp?: string;
  address?: string;
  age?: number;
  gender?: Gender;
  rxId?: string;
  frameSku?: string;
  frameBrand?: string;
  frameModel?: string;
  frameName?: string;
  isManualFrame?: boolean;
  lensCode?: string;
  lensBrand?: string;
  lensName?: string;
  lensProductName?: string;
  lensType?: string;
  lensIndex?: string;
  lensCoating?: string;
  isManualLens?: boolean;
  
  // Power Prescription Link
  odPower?: EyePower;
  osPower?: EyePower;
  odSph?: string;
  odCyl?: string;
  odAxis?: string;
  odAdd?: string;
  odMatchedLensSku?: string;
  osSph?: string;
  osCyl?: string;
  osAxis?: string;
  osAdd?: string;
  osMatchedLensSku?: string;
  odStockStatus?: 'IN STOCK' | 'OUT OF STOCK' | 'ORDERED';
  osStockStatus?: 'IN STOCK' | 'OUT OF STOCK' | 'ORDERED';
  pd?: string;
  distanceVa?: string;
  nearVa?: string;

  quantity: number;
  frameRate: number;
  lensRate: number;
  otherCharges?: number;
  fittingsCharge?: number;
  fittingCharges?: number;
  subTotal?: number;
  discountType?: 'Percentage' | 'Amount' | 'None';
  discountPercent?: number;
  discountAmount?: number;
  discount: number;
  loyaltyPointsRedeemed?: number;
  loyaltyDiscount?: number;
  loyaltyPointsEarned?: number;
  total: number;
  advance: number;
  paid?: number;
  due: number;
  deliveryDate: string;
  orderDate?: string;
  paymentMethod?: PaymentMethod;
  status: SpectacleOrderStatus;
  assignedTechnician?: string;
  labNotes?: string;
  customerNotes?: string;
  notes?: string;
  isArchived?: boolean;
  archivedAt?: string;
  archivedReason?: string;
  customerProfileData?: Partial<Customer>;
}

export interface SaleItem {
  id: string;
  itemType: 'Frame' | 'Lens' | 'Spectacle' | 'Accessory' | 'Medicine' | 'Consultation';
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxPercent: number;
  total: number;
}

export interface RetailSale {
  invoiceNumber: string; // e.g. INV-2026-8001
  date: string;
  customerType: 'Existing Patient' | 'Existing Customer' | 'Walk-in Customer';
  mrdOrCustomerId: string;
  customerName: string;
  mobile: string;
  items: SaleItem[];
  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paid: number;
  due: number;
  paymentMode: PaymentMethod | string;
  paymentReference?: string;
  notes?: string;
  status: 'Paid' | 'Partial' | 'Due' | 'Cancelled';
  cashier: string;
}

export interface WholesaleSale {
  invoiceNumber: string; // e.g. WH-2026-1001
  date: string;
  dealerId?: string;
  dealerName?: string;
  wholesaleCustomer: string; // Shop or Party name
  stockistName?: string;
  gstin?: string;
  mobile: string;
  items: SaleItem[];
  subTotal: number;
  discount: number;
  discountType?: 'Percentage' | 'Amount';
  taxTotal: number;
  grandTotal: number;
  paid: number;
  due: number;
  paymentMode?: string;
  salesperson?: string;
  deliveryStatus: 'Pending' | 'Dispatched' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Paid' | 'Partial' | 'Due';
  notes?: string;
}

export interface PurchaseItem {
  itemType: 'Lens' | 'Frame' | 'Medicine' | 'Accessory';
  itemCode: string;
  itemName: string;
  quantity: number;
  purchaseRate: number;
  discount: number;
  taxPercent: number;
  total: number;
}

export interface PurchaseRecord {
  purchaseId: string; // e.g. PO-2026-6001
  supplierId: string;
  supplierName: string;
  invoiceNo: string;
  date: string;
  items: PurchaseItem[];
  subTotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  due: number;
  paymentMode: string;
  notes?: string;
}

export interface Supplier {
  supplierId: string; // e.g. SUP-101
  company: string;
  contactPerson: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  address: string;
  gstin?: string;
  paymentTerms: string;
  openingDue: number;
  currentDue: number;
}

export interface Customer {
  customerId: string; // e.g. C000125 / CUST-5001
  mrd?: string; // Linked Patient MRD if same individual e.g. P000087 / PEC-MRD-1001
  name: string;
  nickName?: string;
  mobile: string;
  whatsapp?: string;
  altMobile?: string;
  emergencyContact?: string;
  dob?: string;
  age?: number;
  gender?: Gender;
  bloodGroup?: string;
  photo?: string;
  fatherName?: string;
  fatherHusbandName?: string;
  motherName?: string;
  spouseName?: string;
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other' | string;
  anniversaryDate?: string;
  marriageAnniversary?: string;
  profession?: string;
  occupation?: string;
  company?: string;
  education?: string;
  email?: string;
  address: string;
  village?: string;
  postOffice?: string;
  policeStation?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  fullAddress?: string;
  referredBy?: string;
  firstPurchaseDate?: string;
  lastPurchaseDate?: string;
  totalPurchases: number;
  lifetimeValue: number;
  outstandingDue: number;
  loyaltyPoints?: number;
  lastContact?: string;
  nextAction?: string;
  nextFollowUp?: string;
  nextEyeTestDate?: string;
  lastEyeCheckupDate?: string;
  status?: 'Active' | 'VIP' | 'Regular' | 'Inactive';
  segment: 'New Patient' | 'Existing Patient' | 'Spectacle Buyer' | 'No Purchase' | 'Due Customer' | 'Follow-up Due' | 'VIP Customer' | 'New Customer' | 'Repeat Customer' | 'High Value Customer' | 'Inactive Customer' | 'Birthday This Month' | 'Anniversary This Month' | 'Eye Test Due' | 'Spectacle Renewal Due' | string;
  notes?: string;
  isArchived?: boolean;
  archivedAt?: string;
  archivedReason?: string;
  optOutPromotions?: boolean;
  whatsappMarketingStatus?: 'Opted In' | 'Opted Out' | 'Unknown';
  marketingTags?: string[];
  preferredLanguage?: 'Bengali' | 'English';
}

export type WhatsAppTemplateCategory = 
  | 'Appointment Confirmation'
  | 'Appointment Reminder'
  | 'Spectacle Order Received'
  | 'Spectacle Order Confirmation'
  | 'Spectacle Ready'
  | 'Spectacle Delivered'
  | 'Delivery Reminder'
  | 'Due Payment Reminder'
  | 'Payment Due'
  | 'Follow-up Reminder'
  | 'Follow-up'
  | 'Eye Checkup Reminder'
  | 'Annual Vision Recall'
  | 'Birthday'
  | 'Anniversary'
  | 'New Customer'
  | 'Festival'
  | 'New Product'
  | 'New Frame Collection'
  | 'Blue Cut Offer'
  | 'Progressive Lens Offer'
  | 'General Offer'
  | 'Offer/Promotion'
  | 'Customer Reactivation'
  | 'Thank You'
  | 'Custom Message'
  | 'General Customer Message'
  | string;

export interface WhatsAppTemplate {
  id: string; // e.g. TPL-001
  name: string;
  category: WhatsAppTemplateCategory;
  messageBengali: string;
  messageEnglish: string;
  tags?: string[];
  active: boolean;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfferPromotion {
  id: string; // e.g. OFF-2026-01
  name: string;
  description: string;
  discountType: 'Percentage' | 'Amount';
  discountPercent?: number;
  discountAmount?: number;
  minPurchase?: number;
  maxDiscount?: number;
  applicableProduct?: string;
  applicableCategory?: string;
  applicableCustomerSegment?: string;
  termsAndConditions?: string;
  startDate: string;
  endDate: string;
  messageBengali: string;
  messageEnglish: string;
  posterImageUrl?: string;
  status: 'Active' | 'Inactive' | 'Expired';
  createdAt?: string;
}

export type CampaignType =
  | 'Festive'
  | 'Seasonal'
  | 'Product Launch'
  | 'Discount Offer'
  | 'Reactivation'
  | 'Follow-up'
  | 'Birthday'
  | 'Eye Recall'
  | 'Due Recovery'
  | 'Custom';

export type CampaignStatus = 'Draft' | 'Scheduled' | 'Running' | 'Completed' | 'Paused' | 'Cancelled';

export type CtaType = 'Call Now' | 'WhatsApp' | 'Book Appointment' | 'Get Direction' | 'View Offer' | 'Contact Shop' | 'None';

export interface CampaignMetrics {
  targetCount: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  responsesCount: number;
  convertedCount: number;
  salesAmount: number;
  costAmount: number;
  profitAmount: number;
  roiPercent: number;
}

export interface MarketingCampaign {
  id: string; // e.g. CMP-2026-001
  name: string;
  type: CampaignType;
  segmentId: string;
  segmentName: string;
  targetCustomerIds?: string[];
  targetCount: number;
  templateId?: string;
  templateName?: string;
  customMessageBengali?: string;
  customMessageEnglish?: string;
  offerId?: string;
  offerName?: string;
  discountType?: 'Percentage' | 'Amount';
  discountValue?: number;
  posterImageUrl?: string;
  ctaType: CtaType;
  ctaValue?: string;
  startDate: string;
  endDate: string;
  scheduleDate?: string;
  scheduleTime?: string;
  status: CampaignStatus;
  metrics: CampaignMetrics;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  notes?: string;
}

export interface CustomerSegmentRule {
  id: string; // e.g. SEG-01
  name: string;
  nameBn: string;
  description: string;
  isPredefined: boolean;
  iconName?: string;
  tag?: string;
  criteria: {
    minTotalPurchase?: number;
    maxTotalPurchase?: number;
    minDue?: number;
    inactiveDays?: number;
    productType?: 'All' | 'Progressive' | 'Blue Cut' | 'Frame' | 'Single Vision' | 'Bifocal' | string;
    ageMin?: number;
    ageMax?: number;
    eyeCheckupDueDays?: number;
    annualRecallDue?: boolean;
    hasAppointment?: boolean;
    hasPrescription?: boolean;
    whatsappOptInOnly?: boolean;
    hasBirthdayThisMonth?: boolean;
  };
}

export type LeadSource = 'WhatsApp' | 'Facebook' | 'Instagram' | 'Referral' | 'Walk-in' | 'Google' | 'Other';
export type LeadStage = 'New Lead' | 'Contacted' | 'Interested' | 'Appointment Booked' | 'Visited' | 'Prescription Given' | 'Order Created' | 'Purchased' | 'Follow-up' | 'Lost';

export interface CrmLead {
  id: string; // e.g. LEAD-2026-001
  name: string;
  mobile: string;
  email?: string;
  source: LeadSource;
  stage: LeadStage;
  interest: string;
  estimatedValue?: number;
  assignedTo?: string;
  lastFollowUp?: string;
  nextFollowUp?: string;
  notes?: string;
  convertedCustomerId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type AutomationTriggerType =
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_REMINDER_1DAY'
  | 'SPECTACLE_READY'
  | 'SPECTACLE_DELIVERED'
  | 'PAYMENT_DUE_7DAYS'
  | 'CHECKUP_6MONTHS'
  | 'ANNUAL_RECALL_1YEAR'
  | 'BIRTHDAY_TODAY'
  | 'INACTIVE_6MONTHS'
  | 'CUSTOM_RULE';

export type AutomationActionType =
  | 'QUEUE_WHATSAPP_MESSAGE'
  | 'ADD_SEGMENT'
  | 'CREATE_FOLLOWUP_TASK'
  | 'APPLY_OFFER';

export interface AutomationRule {
  id: string; // e.g. AUTO-01
  name: string;
  triggerType: AutomationTriggerType;
  conditionText: string;
  actionType: AutomationActionType;
  templateId?: string;
  targetSegment?: string;
  offerId?: string;
  delayHours?: number;
  enabled: boolean;
  description: string;
  lastTriggered?: string;
  triggerCount: number;
  createdAt?: string;
}

export interface CommunicationLog {
  id: string; // e.g. MSG-001
  customerId?: string;
  customerName: string;
  mobile: string;
  campaignId?: string;
  campaignName?: string;
  templateId?: string;
  templateName?: string;
  messageType: string;
  category: string;
  messageText: string;
  channel: 'WhatsApp' | 'SMS';
  date: string;
  time: string;
  status: 'Sent' | 'Delivered' | 'Read' | 'Failed' | 'Draft';
  hasResponse?: boolean;
  responseNotes?: string;
  sentBy: string;
}

export type CustomerGroupTarget =
  | 'All Customers'
  | 'Spectacle Customers'
  | 'Eye Check-up Patients'
  | 'New Customers'
  | 'Old Customers'
  | 'Regular Customers'
  | 'Due Customers'
  | 'Birthday Customers'
  | 'Anniversary Customers';

export interface CustomerPowerRecord {
  powerId: string; // e.g. PWR-2026-001
  customerId: string;
  mrd?: string;
  date: string;
  odPower: EyePower;
  osPower: EyePower;
  pd?: string;
  prescribedBy?: string;
  source: 'Doctor Prescription' | 'Customer Supplied Prescription' | 'Existing Power' | 'Manual Entry';
  doctor?: string;
  notes?: string;
}

export type LoyaltyTransactionType =
  | 'EARNED'
  | 'REDEEMED'
  | 'MANUAL_ADD'
  | 'MANUAL_DEDUCT'
  | 'RESET'
  | 'WELCOME_BONUS'
  | 'BIRTHDAY_BONUS'
  | 'ANNIVERSARY_BONUS'
  | 'REFERRAL_BONUS'
  | 'MILESTONE_BONUS'
  | 'CAMPAIGN_BONUS'
  | 'REFUND_REVERSAL'
  | 'ORDER_CANCELLED_REVERSAL'
  | 'EXPIRED';

export interface LoyaltyTransaction {
  id: string; // e.g. LOY-2026-01
  customerId: string;
  customerName: string;
  date: string;
  time?: string;
  type: LoyaltyTransactionType | string;
  points: number;
  oldPoints: number;
  newPoints: number;
  monetaryValueRupees?: number;
  reason: string;
  user: string;
  referenceId?: string; // Invoice / Order number / Manual ID
  orderAmount?: number;
  tierAtTime?: string;
  ruleAppliedSnapshot?: string; // Preserves historical rule applied so future edits don't distort history
  appliedRuleSnapshot?: string;
  expiryDate?: string;
  notes?: string;
}

export interface LoyaltyTier {
  id: string;
  name: string; // e.g. 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'
  minPoints: number; // e.g. 0, 250, 600, 1200
  minSpend: number; // e.g. 0, 5000, 15000, 30000
  multiplier: number; // e.g. 1.0, 1.25, 1.5, 2.0
  specialDiscountPercent: number; // e.g. 0%, 5%, 10%, 15%
  badgeColor: string; // e.g. 'bg-amber-100 text-amber-800 border-amber-300'
  accentColor?: string;
  benefits: string[];
  icon?: string;
  isDefault?: boolean;
}

export type LoyaltyBonusTrigger =
  | 'First Purchase'
  | 'Birthday'
  | 'Anniversary'
  | 'Referral'
  | 'High Value Purchase'
  | 'Festival'
  | 'Special Campaign'
  | 'Customer Reactivation'
  | 'Manual Bonus';

export interface LoyaltyBonusRule {
  id: string;
  name: string;
  trigger: LoyaltyBonusTrigger;
  bonusPoints: number;
  minPurchaseAmount?: number;
  validityDays?: number;
  startDate?: string;
  endDate?: string;
  customerSegment?: string;
  active: boolean;
  messageTemplateBengali?: string;
  messageTemplateEnglish?: string;
}

export interface LoyaltyMilestoneRule {
  id: string;
  name: string;
  minAmount: number; // e.g. 3000, 6000, 10000
  bonusPoints: number; // e.g. 25, 75, 150
  active: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CategoryLoyaltyConfig {
  eligible: boolean;
  multiplier: number; // e.g. 1.0, 1.5, 2.0
}

export interface LoyaltyCategorySettings {
  frames: CategoryLoyaltyConfig;
  lenses: CategoryLoyaltyConfig;
  spectacles: CategoryLoyaltyConfig;
  accessories: CategoryLoyaltyConfig;
  medicines: CategoryLoyaltyConfig;
  otherProducts: CategoryLoyaltyConfig;
  doctorFee: CategoryLoyaltyConfig;
  optometristFee: CategoryLoyaltyConfig;
}

export interface LoyaltyCampaignRule {
  id: string;
  name: string;
  multiplier: number; // e.g. 2x, 3x
  bonusPoints?: number;
  startDate: string;
  endDate: string;
  eligibleCategories?: string[];
  eligibleSegments?: string[];
  bannerText?: string;
  active: boolean;
  status: 'Active' | 'Scheduled' | 'Completed' | 'Paused';
}

export interface LoyaltySettingsAudit {
  id: string;
  date: string;
  time: string;
  changedBy: string;
  oldRuleSummary: string;
  newRuleSummary: string;
  changeNotes: string;
}

export interface ReferralRecord {
  id: string;
  referrerCustomerId: string;
  referrerName: string;
  referrerMobile: string;
  referredCustomerId: string;
  referredCustomerName: string;
  referredCustomerMobile: string;
  date: string;
  referrerPointsAwarded: number;
  newCustomerPointsAwarded: number;
  firstInvoiceId?: string;
  purchaseAmount?: number;
  status: 'Completed' | 'Pending First Purchase';
  notes?: string;
}

export interface LoyaltySettings {
  version: number;
  enabled: boolean; // Master Program Switch
  
  // Spend to points rule
  spendAmount: number; // Default: 100 (₹100)
  pointsEarned: number; // Default: 1 (1 pt)
  calculationBasis: 'Net Amount (After Discount)' | 'Gross Amount' | 'Paid Amount';
  roundingRule: 'Round Down' | 'Round Up' | 'Nearest Integer' | 'Allow Decimal';
  
  // Monetary redemption value
  pointsForValue: number; // Default: 100
  valueInRupees: number; // Default: 50 (1 pt = ₹0.50)
  
  // Redemption rules
  minRedemptionPoints: number; // Default: 100
  maxRedemptionType: 'No Limit' | 'Percentage of Invoice' | 'Fixed Amount' | 'Fixed Points';
  maxRedemptionValue: number; // Default: 20 (20% of invoice total)
  allowRedemptionOnDiscountedItems: boolean;
  
  // Category eligibility & multipliers
  categories: LoyaltyCategorySettings;
  
  // Expiry
  expiryEnabled: boolean;
  expiryDays: number; // Default: 365 days
  notifyBeforeDays: number; // Default: 15 days
  warningTemplateBengali?: string;
  warningTemplateEnglish?: string;
  
  // Bonus triggers
  birthdayBonusEnabled: boolean;
  birthdayBonusPoints: number; // Default: 50
  birthdayBonusValidityDays: number; // Default: 30
  
  anniversaryBonusEnabled: boolean;
  anniversaryBonusPoints: number; // Default: 50
  anniversaryBonusValidityDays: number; // Default: 30
  
  referralBonusEnabled: boolean;
  referrerBonusPoints: number; // Default: 100
  newCustomerBonusPoints: number; // Default: 50
  minPurchaseForReferralBonus: number; // Default: 500
  
  welcomeBonusEnabled: boolean;
  welcomeBonusPoints: number; // Default: 50
  
  // Tiers & Milestones & Campaigns
  tiers: LoyaltyTier[];
  bonusRules: LoyaltyBonusRule[];
  milestones: LoyaltyMilestoneRule[];
  campaignRules: LoyaltyCampaignRule[];
  
  // Audit log of rule modifications
  auditHistory: LoyaltySettingsAudit[];
}

export interface Dealer {
  dealerId: string; // e.g. DLR-101
  shopName: string;
  ownerName: string;
  mobile: string;
  whatsapp?: string;
  altMobile?: string;
  address: string;
  village?: string;
  postOffice?: string;
  policeStation?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  gstin?: string;
  creditLimit: number;
  paymentTerms: string;
  openingDue: number;
  currentDue: number;
  totalPurchase: number;
  lastPurchaseDate?: string;
  status: 'Active' | 'Inactive' | 'Blocked';
  notes?: string;
}

export interface DueAccount {
  id: string;
  referenceId: string;
  type: 'Spectacle Order' | 'Retail Invoice' | 'Wholesale';
  mrd?: string;
  customerName: string;
  mobile: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  agingDays: number;
  agingBucket: '0-7 Days' | '8-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days';
}

export interface PaymentRecord {
  paymentId: string; // e.g. PAY-2026-9501
  date: string;
  customerId: string;
  customerName: string;
  mobile: string;
  invoiceNumber: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Credit' | 'Other';
  referenceNumber?: string;
  receivedBy: string;
  notes?: string;
}

export interface FieldDiff {
  field: string;
  label?: string;
  oldVal: any;
  newVal: any;
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO string
  date: string; // e.g. 24-08-2026
  time: string; // e.g. 17:20
  user: string;
  role: string;
  action: 'CREATE' | 'EDIT' | 'UPDATE' | 'DELETE' | 'CANCEL' | 'PAYMENT' | 'STATUS_CHANGE' | string;
  module: 'Patients' | 'Appointments' | 'Clinical' | 'Prescription' | 'Spectacles' | 'Inventory' | 'Billing' | 'Settings' | 'Customer';
  recordId: string;
  oldValue?: string;
  newValue?: string;
  beforeValue?: any;
  afterValue?: any;
  fieldChanges?: FieldDiff[];
  details: string;
}

export interface ClinicExaminer {
  id: string;
  name: string;
  role: 'Ophthalmologist' | 'Optometrist' | 'Refractionist';
  qualification: string;
  regNo: string;
  consultationFee: number;
  phone?: string;
  active: boolean;
}

export interface PrintSettings {
  paperSize: 'A4' | 'A5' | 'Thermal 80mm' | 'Letter';
  printLayout: 'Standard' | 'Compact' | 'Detailed' | 'Letterhead Mode';
  showLogo: boolean;
  showWatermark: boolean;
  showDoctorSignature: boolean;
  showQrCode: boolean;
  headerTitle?: string;
  footerNotes?: string;
}

export interface ClinicSettings {
  shopName: string;
  tagline: string;
  address: string;
  mobile: string;
  whatsapp: string;
  email: string;
  gstin: string;
  tradeLicenseNo?: string;
  invoicePrefix: string;
  orderPrefix?: string;
  mrdPrefix?: string;
  doctorName: string;
  doctorQualification: string;
  doctorRegNo: string;
  doctorFee: number;
  optometristName?: string;
  optometristQualification?: string;
  optometristRegNo?: string;
  optometristFee?: number;
  doctorsList?: DoctorMaster[];
  optometristsList?: OptometristMaster[];
  examiners?: ClinicExaminer[];
  defaultExaminer?: string;
  defaultLensFittingCharge?: number;
  defaultFollowUpDays: number;
  rxHeader: string;
  rxFooter: string;
  invoiceHeader?: string;
  invoiceFooter?: string;
  receiptHeader?: string;
  receiptFooter?: string;
  labOrderHeader?: string;
  labOrderFooter?: string;
  orderFooterNote?: string;
  billFooterNote?: string;
  termsAndConditions?: string;
  currencySymbol?: string;
  paperSize?: 'A4' | 'A5' | 'Thermal 80mm' | 'Letter';
  printLayout?: 'Standard' | 'Compact' | 'Detailed' | 'Letterhead Mode';
  showLogo?: boolean;
  showWatermark?: boolean;
  prescriptionPrintSettings?: PrintSettings;
  invoicePrintSettings?: PrintSettings;
  receiptPrintSettings?: PrintSettings;
  labOrderPrintSettings?: PrintSettings;
  loyaltyPointsPerHundred?: number; // e.g. 1 point for every 100 spent
  loyaltyPointValueRupees?: number; // e.g. 1 point = ₹1
  enableLoyaltyProgram?: boolean;
  welcomeBonusPoints?: number;
  loyaltySettings?: LoyaltySettings;
  wholesaleInvoicePrefix?: string;
  rxAdvicePresets: string[];
  googleSheetConnected: boolean;
  googleSheetId?: string;
  lastGoogleSheetSync?: string;
  googleConnectedEmail?: string;
  googleConnectedName?: string;
  googleSpreadsheetName?: string;
  googleSpreadsheetUrl?: string;
  googleConnectionStatus?: 'not_connected' | 'connected' | 'expired';
  googleSheetsAuthorized?: boolean;
  googleDriveAuthorized?: boolean;
  googleConnectionAuditLogs?: GoogleConnectionAuditLog[];
}

export type GoogleConnectionAction =
  | 'CONNECT_ACCOUNT'
  | 'CHANGE_ACCOUNT'
  | 'SELECT_SPREADSHEET'
  | 'CREATE_SPREADSHEET'
  | 'RECONNECT'
  | 'DISCONNECT';

export interface GoogleConnectionAuditLog {
  id: string;
  action: GoogleConnectionAction;
  previousGmail: string;
  newGmail: string;
  previousSpreadsheet: string;
  newSpreadsheet: string;
  user: string;
  role: string;
  date: string;
  time: string;
  status: 'Success' | 'Failed' | 'Pending';
  details?: string;
}

export interface GoogleDriveSpreadsheetItem {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

