export type UserRole = 'Admin' | 'Doctor' | 'Optometrist' | 'Receptionist' | 'Sales' | 'Inventory';

export type Gender = 'Male' | 'Female' | 'Other';
export type VisitType = 'New Consultation' | 'New Eye Consultation' | 'Follow-up' | 'Refraction / Vision Check' | 'Emergency' | 'Post-Op Review';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Credit' | 'Mixed';

export interface Patient {
  mrd: string; // e.g. PEC-2026-1001
  name: string;
  dob?: string;
  age: number;
  gender: Gender;
  mobile: string;
  whatsapp?: string;
  address: string;
  village?: string;
  postOffice?: string;
  policeStation?: string;
  district: string;
  referredBy?: string;
  registrationDate: string;
  status: 'Active' | 'Inactive' | 'Regular' | 'New Patient' | 'Follow-up Patient';
  notes?: string;
}

export type AppointmentStatus = 'Booked' | 'Confirmed' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled' | 'No Show';

export interface Appointment {
  id: string; // e.g. APT-2026-0501
  mrd: string;
  patientName: string;
  mobile: string;
  doctor: string;
  date: string;
  time: string;
  visitType: 'New Consultation' | 'Follow-up' | 'Refraction / Vision Check' | 'Emergency' | 'Post-Op Review';
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface EyePower {
  sph: string; // -1.25, +0.50, Plano, DS, etc
  cyl: string;
  axis: string; // 90°, 180°, etc
  add: string; // +1.50, +2.00, etc
  distanceVa: string; // 6/6, 6/9, 6/12, etc
  nearVa: string; // N6, N8, N10, etc
  pd?: string; // e.g. 31, 62
}

export interface PrescribedMedicine {
  id: string;
  medicineId?: string;
  name: string;
  genericName?: string;
  strength: string;
  form: 'Eye Drop' | 'Eye Ointment' | 'Tablet' | 'Capsule' | 'Syrup' | 'Gel';
  dose: string; // e.g. 1 drop, 1 tab
  frequency: string; // e.g. 3 times daily, 4 times daily, Once at bedtime
  duration: string; // e.g. 7 days, 15 days, 1 month
  food: string; // e.g. After meal, Before meal, As directed
  route: string; // e.g. Ophthalmic (Both Eyes), Right Eye (OD), Left Eye (OS), Oral
  instruction: string; // e.g. Shake well before use, Gap 5 mins between drops
}

export interface ClinicalExamination {
  vaOdWithout: string;
  vaOdWith: string;
  vaOdBest: string;
  vaOsWithout: string;
  vaOsWith: string;
  vaOsBest: string;
  phOd: string;
  phOs: string;
  nearVision: string;
  iopOd: string; // mmHg
  iopOs: string;
  pupilStatus: 'Normal' | 'Abnormal';
  pupilNotes?: string;
  eomStatus: 'Normal' | 'Abnormal';
  eomNotes?: string;
  adnexaStatus: 'Normal' | 'Abnormal';
  adnexaNotes?: string;
  anteriorSegmentStatus: 'Normal' | 'Abnormal';
  anteriorSegmentNotes?: string;
  fundusStatus: 'Normal' | 'Abnormal';
  fundusNotes?: string;
  clinicalFindings: string;
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

export interface MedicineMaster {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  form: 'Eye Drop' | 'Eye Ointment' | 'Tablet' | 'Capsule' | 'Syrup' | 'Gel';
  defaultDose: string;
  frequency: string;
  defaultDuration: string;
  foodInstruction: string;
  route: string;
  active: boolean;
  notes?: string;
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

export interface LensMaster {
  lensCode: string; // e.g. LNS-CR39-ARC-01
  company: string; // Essilor, Hoya, Zeiss, Prime, etc
  brand: string; // Crizal, BlueProtect, DriveSafe, Anti-Glare
  category: 'Single Vision' | 'Bifocal' | 'Progressive' | 'Photochromic' | 'Blue Cut' | 'Hi-Index';
  design: 'Spherical' | 'Aspheric' | 'Digital Freeform';
  coating: 'Hard Coat' | 'ARC (Anti-Reflective)' | 'Blue Cut ARC' | 'Hydrophobic UV420' | 'Tinted';
  index: string; // 1.50, 1.56, 1.60, 1.67, 1.74
  diameter: string; // 65mm, 70mm, 75mm
  sphRange?: string; // Plano to -6.00
  cylRange?: string; // 0.00 to -2.00
  purchaseRate: number;
  wholesaleRate: number;
  retailRate: number;
  mrp: number;
  currentStock: number;
  reorderLevel: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock' | 'Dead Stock';
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
  customerName: string;
  mobile: string;
  rxId?: string;
  frameSku: string;
  frameBrand?: string;
  frameModel?: string;
  lensCode: string;
  lensBrand?: string;
  quantity: number;
  frameRate: number;
  lensRate: number;
  fittingsCharge: number;
  discount: number;
  total: number;
  advance: number;
  due: number;
  deliveryDate: string;
  orderDate: string;
  status: SpectacleOrderStatus;
  assignedTechnician?: string;
  notes?: string;
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
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Credit' | 'Mixed';
  paymentReference?: string;
  notes?: string;
  status: 'Paid' | 'Partial' | 'Due' | 'Cancelled';
  cashier: string;
}

export interface WholesaleSale {
  invoiceNumber: string;
  date: string;
  wholesaleCustomer: string;
  stockistName?: string;
  gstin?: string;
  mobile: string;
  items: SaleItem[];
  subTotal: number;
  discount: number;
  taxTotal: number;
  grandTotal: number;
  paid: number;
  due: number;
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
  customerId: string; // e.g. CUST-5001
  name: string;
  mobile: string;
  whatsapp?: string;
  address: string;
  lastPurchaseDate?: string;
  totalPurchases: number;
  lifetimeValue: number;
  outstandingDue: number;
  lastContact?: string;
  nextAction?: string;
  segment: 'New Patient' | 'Existing Patient' | 'Spectacle Buyer' | 'No Purchase' | 'Due Customer' | 'Follow-up Due' | 'VIP Customer';
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

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string; // e.g. 'CREATE_VISIT', 'UPDATE_STOCK', 'COLLECT_PAYMENT'
  module: 'Patients' | 'Appointments' | 'Clinical' | 'Prescription' | 'Spectacles' | 'Inventory' | 'Billing' | 'Settings';
  recordId: string;
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
  examiners?: ClinicExaminer[];
  defaultExaminer?: string;
  defaultLensFittingCharge?: number;
  defaultFollowUpDays: number;
  rxHeader: string;
  rxFooter: string;
  orderFooterNote?: string;
  billFooterNote?: string;
  termsAndConditions?: string;
  currencySymbol?: string;
  rxAdvicePresets: string[];
  googleSheetConnected: boolean;
  googleSheetId?: string;
  lastGoogleSheetSync?: string;
}
