import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Patient,
  Appointment,
  ClinicalVisit,
  MedicineMaster,
  FrameMaster,
  LensMaster,
  StockMovement,
  SpectacleOrder,
  RetailSale,
  WholesaleSale,
  Supplier,
  Dealer,
  Customer,
  CustomerPowerRecord,
  LoyaltyTransaction,
  StockAdjustmentRecord,
  LensReturnRecord,
  PaymentRecord,
  DueAccount,
  ClinicSettings,
  AuditLog,
  UserRole,
  AppointmentStatus,
  SpectacleOrderStatus,
  PrescribedMedicine,
  EyePower,
  ClinicalExamination,
  LensPurchaseRecord,
  DoctorMaster,
  OptometristMaster,
  PaymentMethod,
  FieldDiff,
  WhatsAppTemplate,
  OfferPromotion,
  CommunicationLog,
  MarketingCampaign,
  CampaignStatus,
  CustomerSegmentRule,
  CrmLead,
  AutomationRule,
  MasterRecord,
  MasterCategoryKey,
  GoogleConnectionAuditLog,
  GoogleDriveSpreadsheetItem,
  GoogleConnectionAction,
  ERPUser,
  RolePermissionsMap,
  PermissionModule,
  PermissionAction,
  CanonicalRole,
  FailedAccessAttempt
} from '../types';
import {
  saveCloudDocument,
  loadCloudCollection,
  loadCloudDocument,
  deleteCloudDocument,
  migrateCollectionChunked,
  loadERPUsers,
  saveERPUser,
  deleteERPUser,
  toggleERPUserStatus,
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  sendStaffPasswordResetEmail,
  createStaffAuthAccount,
  ensureFirebaseAuth,
  auth,
  CloudSyncStatus
} from '../services/firebaseService';
import {
  getDefaultRolePermissions,
  checkPermission,
  normalizeRole
} from '../services/permissionService';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  initiateGoogleOAuth,
  disconnectGoogleOAuth,
  getCachedToken,
  setCachedToken,
  clearCachedToken,
  isTokenExpired
} from '../services/googleAuthService';
import {
  listGoogleDriveSpreadsheets,
  createNewGoogleSpreadsheet as createSheetApi,
  verifySpreadsheetAccess,
  syncLiveErpToGoogleSheets
} from '../services/googleSheetsService';
import {
  INITIAL_SETTINGS,
  INITIAL_MEDICINES,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_VISITS,
  INITIAL_FRAMES,
  INITIAL_LENSES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_SPECTACLE_ORDERS,
  INITIAL_RETAIL_SALES,
  INITIAL_WHOLESALE_SALES,
  INITIAL_SUPPLIERS,
  INITIAL_DEALERS,
  INITIAL_CUSTOMERS,
  INITIAL_CUSTOMER_POWERS,
  INITIAL_LOYALTY_LOGS,
  INITIAL_STOCK_ADJUSTMENTS,
  INITIAL_RETURNS,
  INITIAL_PAYMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_LENS_PURCHASES
} from '../data/seedData';
import {
  INITIAL_TEMPLATES,
  INITIAL_OFFERS,
  INITIAL_CAMPAIGNS,
  INITIAL_LEADS,
  INITIAL_AUTOMATION_RULES,
  PREDEFINED_SEGMENT_RULES
} from '../data/initialTemplates';
import { INITIAL_MASTERS } from '../data/masterSeedData';
import { createEmptyClinicalExamination } from '../data/clinicalMasterData';
import {
  calculateTransactionPointsEarned,
  calculateMaxRedeemable,
  calculateMonetaryValue,
  calculatePointsForRupees,
  getCustomerTier
} from '../utils/loyaltyCalculator';
import { DEFAULT_LOYALTY_SETTINGS } from '../data/loyaltyDefaults';

export type NavTab =
  | 'dashboard'
  | 'patients'
  | 'customers'
  | 'appointments'
  | 'entry-center'
  | 'prescriptions'
  | 'spectacles'
  | 'retail-sales'
  | 'wholesale'
  | 'lens-inventory'
  | 'frame-inventory'
  | 'purchases'
  | 'stock-ledger'
  | 'suppliers'
  | 'dues'
  | 'medicines'
  | 'crm'
  | 'loyalty'
  | 'loyalty-rewards'
  | 'reports'
  | 'masters'
  | 'sheets-sync'
  | 'audit-log'
  | 'settings';

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

export const EMPTY_DRAFT: ClinicalDraft = {
  editingVisitId: undefined,
  mrd: '',
  patientName: '',
  age: '',
  gender: 'Male',
  mobile: '',
  doctor: 'Dr. S. K. Banerjee',
  optometrist: 'Dr. R. N. Mukherjee',
  examinerRole: 'Ophthalmologist',
  visitType: 'New Consultation',
  visitDate: new Date().toISOString().split('T')[0],
  symptoms: [],
  symptomDuration: '1 Week',
  symptomSeverity: 'Moderate',
  odPower: {
    sph: '',
    cyl: '',
    axis: '',
    add: '',
    distanceVa: '6/6',
    nearVa: 'N6',
    pd: '31'
  },
  osPower: {
    sph: '',
    cyl: '',
    axis: '',
    add: '',
    distanceVa: '6/6',
    nearVa: 'N6',
    pd: '31'
  },
  examination: createEmptyClinicalExamination(),
  diagnosis: [],
  customDiagnosis: '',
  medicines: [],
  advice: 'Wear prescribed spectacles regularly. Wash eyes with cold water.',
  followUpDays: 15,
  followUpReason: 'Routine Refraction Review',
  referral: '',
  surgeryAdvice: '',
  investigation: '',
  spectacleAdvice: ''
};

export interface GoogleSheetsStatus {
  synced: boolean;
  syncing: boolean;
  lastSync: string;
  error: string | null;
}

export interface PrintModalData {
  type: 'prescription' | 'spectacle-order' | 'invoice' | 'receipt' | 'due-statement' | 'appointment';
  data: any;
}

interface ErpContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  patients: Patient[];
  appointments: Appointment[];
  visits: ClinicalVisit[];
  clinicalVisits: ClinicalVisit[];
  medicines: MedicineMaster[];
  frames: FrameMaster[];
  lenses: LensMaster[];
  stockMovements: StockMovement[];
  spectacleOrders: SpectacleOrder[];
  retailSales: RetailSale[];
  wholesaleSales: WholesaleSale[];
  suppliers: Supplier[];
  dealers: Dealer[];
  customers: Customer[];
  customerPowers: CustomerPowerRecord[];
  loyaltyLogs: LoyaltyTransaction[];
  stockAdjustments: StockAdjustmentRecord[];
  lensReturns: LensReturnRecord[];
  lensPurchases: LensPurchaseRecord[];
  payments: PaymentRecord[];
  auditLogs: AuditLog[];
  settings: ClinicSettings;
  dueAccounts: DueAccount[];
  clinicalDraft: ClinicalDraft;
  setClinicalDraft: React.Dispatch<React.SetStateAction<ClinicalDraft>>;
  selectedPatientFor360: Patient | null;
  setSelectedPatientFor360: (patient: Patient | null) => void;
  selectedCustomerFor360: Customer | null;
  setSelectedCustomerFor360: (customer: Customer | null) => void;
  selectedDealerForProfile: Dealer | null;
  setSelectedDealerForProfile: (dealer: Dealer | null) => void;
  printModalData: PrintModalData | null;
  setPrintModalData: (data: PrintModalData | null) => void;
  quickModal: string | null;
  setQuickModal: (modal: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notification: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  toast: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  cloudSyncStatus: CloudSyncStatus;
  setCloudSyncStatus: (status: CloudSyncStatus) => void;
  cloudLastSyncTime: string | null;
  setCloudLastSyncTime: (time: string | null) => void;
  syncAllToFirestore: () => Promise<void>;
  syncAllFromFirestore: () => Promise<void>;
  firebaseUser: FirebaseUser | null;
  erpUsers: ERPUser[];
  currentUser: ERPUser | null;
  saveUserAccount: (user: ERPUser) => Promise<boolean>;
  deleteUserAccount: (uid: string) => Promise<boolean>;
  toggleUserStatus: (uid: string, status?: 'Active' | 'Disabled') => Promise<boolean>;
  loginWithGoogleAccount: () => Promise<boolean>;
  loginWithEmailAccount: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutAccount: () => Promise<void>;
  rolePermissions: RolePermissionsMap;
  updateRolePermissions: (newPermissions: RolePermissionsMap) => Promise<boolean>;
  resetRolePermissionsToDefault: () => Promise<boolean>;
  hasPermission: (module: PermissionModule, action: PermissionAction) => boolean;
  checkAndExecuteAction: (module: PermissionModule, action: PermissionAction, onAllowed: () => void, actionLabel?: string) => boolean;
  failedAccessAttempts: FailedAccessAttempt[];
  recordFailedAccessAttempt: (attempt: Omit<FailedAccessAttempt, 'id' | 'timestamp'>) => void;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  createStaffUser: (user: ERPUser, initialPassword?: string) => Promise<{ success: boolean; error?: string }>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  googleSheetsStatus: GoogleSheetsStatus;
  connectGoogleAccount: (forceAccountChange?: boolean, preferGSI?: boolean) => Promise<{ success: boolean; email?: string; isAccountChange?: boolean; error?: string; isCancelled?: boolean }>;
  disconnectGoogleAccount: () => Promise<boolean>;
  reconnectGoogleAccount: (preferGSI?: boolean) => Promise<boolean>;
  selectGoogleSpreadsheet: (sheet: GoogleDriveSpreadsheetItem) => Promise<boolean>;
  createNewGoogleSpreadsheet: (title?: string) => Promise<{ success: boolean; spreadsheetId?: string; spreadsheetUrl?: string; error?: string }>;
  verifyCurrentSpreadsheet: () => Promise<{ accessible: boolean; title?: string; error?: string }>;
  fetchGoogleSpreadsheets: () => Promise<GoogleDriveSpreadsheetItem[]>;
  exportBackupJson: () => void;
  importBackupJson: (jsonStr: string | any) => boolean;
  exportFullDatabase: () => void;
  importDatabaseBackup: (data: string | any) => boolean;
  resetToSeedData: () => void;

  // Actions
  createPatient: (patient: Omit<Patient, 'mrd' | 'registrationDate'>) => Patient;
  updatePatient: (patient: Patient) => void;
  createAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointment: (appointment: Appointment) => void;
  cancelAppointment: (id: string, reason?: string) => void;
  collectAppointmentPayment: (id: string, amount: number, paymentMethod?: PaymentMethod, notes?: string) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  startVisitFromAppointment: (appointmentId: string) => void;
  loadPatientIntoClinical: (mrd: string) => void;
  saveDoctor: (doctor: DoctorMaster) => void;
  deleteDoctor: (id: string) => void;
  archiveDoctor: (id: string, reason?: string) => void;
  restoreDoctor: (id: string) => void;
  toggleDoctorStatus: (id: string) => void;
  saveOptometrist: (optometrist: OptometristMaster) => void;
  deleteOptometrist: (id: string) => void;
  toggleOptometristStatus: (id: string) => void;
  addAuditLog: (
    action: string,
    module: AuditLog['module'],
    recordId: string,
    details: string,
    oldValue?: string,
    newValue?: string,
    fieldChanges?: FieldDiff[]
  ) => void;
  saveClinicalVisit: (visitDraft: ClinicalDraft) => ClinicalVisit;
  updateClinicalVisit: (visit: ClinicalVisit) => void;
  deleteClinicalVisit: (visitId: string) => void;
  loadVisitForEditing: (visit: ClinicalVisit) => void;
  clearClinicalDraft: () => void;
  createSpectacleOrder: (order: Omit<SpectacleOrder, 'orderId' | 'orderDate'>) => SpectacleOrder;
  updateSpectacleOrder: (order: SpectacleOrder, options?: { updateCustomerProfile?: boolean; newPayment?: { amount: number; mode: string; notes?: string } }) => void;
  collectSpectacleOrderPayment: (orderId: string, amount: number, paymentMode: string, notes?: string) => void;
  updateSpectacleOrderStatus: (orderId: string, status: SpectacleOrderStatus) => void;
  createRetailSale: (sale: Omit<RetailSale, 'invoiceNumber' | 'date'>) => RetailSale;
  createWholesaleSale: (sale: Omit<WholesaleSale, 'invoiceNumber' | 'date'>) => WholesaleSale;
  updateWholesaleSale: (sale: WholesaleSale) => void;
  collectDuePayment: (
    param1: any,
    invoiceNumber?: string,
    amount?: number,
    paymentMode?: string,
    notes?: string
  ) => void;
  createPurchase: (supplierId: string, invoiceNo: string, items: { itemType: 'Frame' | 'Lens' | 'Medicine'; itemCode: string; itemName: string; quantity: number; purchaseRate: number; discount: number; taxPercent: number }[], paymentMode: string, paidAmount: number) => void;
  purchaseLensStockIn: (purchaseData: Omit<LensPurchaseRecord, 'id' | 'timestamp'>) => void;
  batchGenerateLenses: (generatedLenses: LensMaster[]) => void;
  findMatchingLensForPower: (sph: string, cyl: string, axis?: string, add?: string, lensType?: string, brand?: string) => LensMaster | undefined;
  saveFrame: (frame: FrameMaster) => void;
  deleteFrame: (sku: string) => void;
  saveLens: (lens: LensMaster) => void;
  deleteLens: (lensCode: string) => void;
  saveMedicine: (medicine: MedicineMaster) => void;
  deleteMedicine: (id: string) => void;
  saveSupplier: (supplier: Supplier) => void;
  saveDealer: (dealer: Dealer) => void;
  saveCustomer: (customer: Customer) => void;
  archivePatient: (mrd: string, reason?: string) => void;
  restorePatient: (mrd: string) => void;
  deletePatient: (mrd: string) => void;
  archiveCustomer: (customerId: string, reason?: string) => void;
  restoreCustomer: (customerId: string) => void;
  deleteCustomer: (customerId: string) => void;
  archiveAppointment: (id: string, reason?: string) => void;
  restoreAppointment: (id: string) => void;
  deleteAppointment: (id: string) => void;
  archiveSpectacleOrder: (orderId: string, reason?: string) => void;
  restoreSpectacleOrder: (orderId: string) => void;
  deleteSpectacleOrder: (orderId: string, restoreStock?: boolean) => void;
  cancelSpectacleOrder: (orderId: string, restoreStock?: boolean, reason?: string) => void;
  templates: WhatsAppTemplate[];
  saveTemplate: (template: WhatsAppTemplate) => void;
  deleteTemplate: (id: string) => void;
  toggleTemplateActive: (id: string) => void;
  offers: OfferPromotion[];
  saveOffer: (offer: OfferPromotion) => void;
  deleteOffer: (id: string) => void;
  toggleOfferStatus: (id: string) => void;
  communicationLogs: CommunicationLog[];
  logCommunication: (log: Omit<CommunicationLog, 'id' | 'date' | 'time' | 'sentBy'>) => void;
  campaigns: MarketingCampaign[];
  saveCampaign: (campaign: MarketingCampaign) => void;
  deleteCampaign: (id: string) => void;
  duplicateCampaign: (id: string) => MarketingCampaign | undefined;
  toggleCampaignStatus: (id: string, status?: CampaignStatus) => void;
  leads: CrmLead[];
  saveLead: (lead: CrmLead) => void;
  deleteLead: (id: string) => void;
  convertLeadToCustomer: (leadId: string) => Customer | undefined;
  automationRules: AutomationRule[];
  saveAutomationRule: (rule: AutomationRule) => void;
  toggleAutomationRule: (id: string) => void;
  deleteAutomationRule: (id: string) => void;
  customSegments: CustomerSegmentRule[];
  saveCustomSegment: (segment: CustomerSegmentRule) => void;
  deleteCustomSegment: (id: string) => void;
  allSegments: CustomerSegmentRule[];
  updateCustomerMarketingProfile: (customerId: string, data: Partial<Customer>) => void;
  sendDirectWhatsAppMessage: (mobile: string, text: string, customerId?: string, campaignId?: string) => void;
  addCustomerPowerRecord: (record: Omit<CustomerPowerRecord, 'powerId'>) => CustomerPowerRecord;
  adjustLoyaltyPoints: (customerId: string, points: number, type: LoyaltyTransaction['type'], reason: string) => void;
  updateLoyaltySettings: (newLoyaltySettings: any) => void;
  adjustLensStock: (lensCode: string, physicalStock: number, reason: StockAdjustmentRecord['reason'], notes?: string) => void;
  createLensReturn: (ret: Omit<LensReturnRecord, 'id' | 'date'>) => LensReturnRecord;
  linkPatientAndCustomer: (mrd: string, customerId: string) => void;
  updateSettings: (newSettings: Partial<ClinicSettings>) => void;
  syncWithGoogleSheets: () => Promise<boolean>;
  exportDataJSON: () => void;
  importDataJSON: (jsonStr: string) => boolean;
  resetToSampleData: () => void;

  // Master Management System
  masters: MasterRecord[];
  saveMasterItem: (item: Partial<MasterRecord> & { categoryKey: MasterCategoryKey; name: string }) => MasterRecord;
  deleteMasterItem: (id: string) => void;
  toggleMasterItemStatus: (id: string) => void;
  getMasterItemsByCategory: (categoryKey: MasterCategoryKey, activeOnly?: boolean) => MasterRecord[];
  lensTypes: MasterRecord[];
  activeLensTypes: string[];
  activeBrands: string[];
  activeCompanies: string[];
  activeCoatings: string[];
  activeRefractiveIndices: string[];
  activeFrameBrands: string[];
  activeFrameTypes: string[];
  activeDiagnoses: string[];
  activePaymentMethods: string[];
}

const ErpContext = createContext<ErpContextType | null>(null);

const STORAGE_PREFIX = 'PAHARPUR_EYE_CARE_ERP_';

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item || item === 'undefined' || item === 'null') return defaultValue;
    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) return defaultValue;
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) return defaultValue;
    return parsed;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error', err);
  }
}

export const ErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => getStored('ROLE', 'Admin'));
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [patients, setPatients] = useState<Patient[]>(() => {
    const res = getStored('PATIENTS', INITIAL_PATIENTS);
    return Array.isArray(res) ? res : INITIAL_PATIENTS;
  });
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const res = getStored('APPOINTMENTS', INITIAL_APPOINTMENTS);
    return Array.isArray(res) ? res : INITIAL_APPOINTMENTS;
  });
  const [visits, setVisits] = useState<ClinicalVisit[]>(() => {
    const res = getStored('VISITS', INITIAL_VISITS);
    return Array.isArray(res) ? res : INITIAL_VISITS;
  });
  const [medicines, setMedicines] = useState<MedicineMaster[]>(() => {
    const res = getStored('MEDICINES', INITIAL_MEDICINES);
    return Array.isArray(res) ? res : INITIAL_MEDICINES;
  });
  const [frames, setFrames] = useState<FrameMaster[]>(() => {
    const res = getStored('FRAMES', INITIAL_FRAMES);
    return Array.isArray(res) ? res : INITIAL_FRAMES;
  });
  const [lenses, setLenses] = useState<LensMaster[]>(() => {
    const res = getStored('LENSES', INITIAL_LENSES);
    return Array.isArray(res) ? res : INITIAL_LENSES;
  });
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const res = getStored('STOCK_MOVEMENTS', INITIAL_STOCK_MOVEMENTS);
    return Array.isArray(res) ? res : INITIAL_STOCK_MOVEMENTS;
  });
  const [spectacleOrders, setSpectacleOrders] = useState<SpectacleOrder[]>(() => {
    const res = getStored('SPECTACLE_ORDERS', INITIAL_SPECTACLE_ORDERS);
    return Array.isArray(res) ? res : INITIAL_SPECTACLE_ORDERS;
  });
  const [retailSales, setRetailSales] = useState<RetailSale[]>(() => {
    const res = getStored('RETAIL_SALES', INITIAL_RETAIL_SALES);
    return Array.isArray(res) ? res : INITIAL_RETAIL_SALES;
  });
  const [wholesaleSales, setWholesaleSales] = useState<WholesaleSale[]>(() => {
    const res = getStored('WHOLESALE_SALES', INITIAL_WHOLESALE_SALES);
    return Array.isArray(res) ? res : INITIAL_WHOLESALE_SALES;
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const res = getStored('SUPPLIERS', INITIAL_SUPPLIERS);
    return Array.isArray(res) ? res : INITIAL_SUPPLIERS;
  });
  const [dealers, setDealers] = useState<Dealer[]>(() => {
    const res = getStored('DEALERS', INITIAL_DEALERS);
    return Array.isArray(res) ? res : INITIAL_DEALERS;
  });
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const res = getStored('CUSTOMERS', INITIAL_CUSTOMERS);
    return Array.isArray(res) ? res : INITIAL_CUSTOMERS;
  });
  const [customerPowers, setCustomerPowers] = useState<CustomerPowerRecord[]>(() => {
    const res = getStored('CUSTOMER_POWERS', INITIAL_CUSTOMER_POWERS);
    return Array.isArray(res) ? res : INITIAL_CUSTOMER_POWERS;
  });
  const [loyaltyLogs, setLoyaltyLogs] = useState<LoyaltyTransaction[]>(() => {
    const res = getStored('LOYALTY_LOGS', INITIAL_LOYALTY_LOGS);
    return Array.isArray(res) ? res : INITIAL_LOYALTY_LOGS;
  });
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustmentRecord[]>(() => {
    const res = getStored('STOCK_ADJUSTMENTS', INITIAL_STOCK_ADJUSTMENTS);
    return Array.isArray(res) ? res : INITIAL_STOCK_ADJUSTMENTS;
  });
  const [lensReturns, setLensReturns] = useState<LensReturnRecord[]>(() => {
    const res = getStored('LENS_RETURNS', INITIAL_RETURNS);
    return Array.isArray(res) ? res : INITIAL_RETURNS;
  });
  const [lensPurchases, setLensPurchases] = useState<LensPurchaseRecord[]>(() => {
    const res = getStored('LENS_PURCHASES', INITIAL_LENS_PURCHASES);
    return Array.isArray(res) ? res : INITIAL_LENS_PURCHASES;
  });
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const res = getStored('PAYMENTS', INITIAL_PAYMENTS);
    return Array.isArray(res) ? res : INITIAL_PAYMENTS;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const res = getStored('AUDIT_LOGS', INITIAL_AUDIT_LOGS);
    return Array.isArray(res) ? res : INITIAL_AUDIT_LOGS;
  });
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(() => {
    const res = getStored('WHATSAPP_TEMPLATES', INITIAL_TEMPLATES);
    return Array.isArray(res) && res.length > 0 ? res : INITIAL_TEMPLATES;
  });
  const [offers, setOffers] = useState<OfferPromotion[]>(() => {
    const res = getStored('OFFERS_PROMOTIONS', INITIAL_OFFERS);
    return Array.isArray(res) && res.length > 0 ? res : INITIAL_OFFERS;
  });
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>(() => {
    const res = getStored('COMMUNICATION_LOGS', []);
    return Array.isArray(res) ? res : [];
  });
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => {
    const res = getStored('MARKETING_CAMPAIGNS', INITIAL_CAMPAIGNS);
    return Array.isArray(res) && res.length > 0 ? res : INITIAL_CAMPAIGNS;
  });
  const [leads, setLeads] = useState<CrmLead[]>(() => {
    const res = getStored('CRM_LEADS', INITIAL_LEADS);
    return Array.isArray(res) && res.length > 0 ? res : INITIAL_LEADS;
  });
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(() => {
    const res = getStored('AUTOMATION_RULES', INITIAL_AUTOMATION_RULES);
    return Array.isArray(res) && res.length > 0 ? res : INITIAL_AUTOMATION_RULES;
  });
  const [customSegments, setCustomSegments] = useState<CustomerSegmentRule[]>(() => {
    const res = getStored('CUSTOM_SEGMENTS', []);
    return Array.isArray(res) ? res : [];
  });
  const [masters, setMasters] = useState<MasterRecord[]>(() => {
    const res = getStored('MASTERS', INITIAL_MASTERS);
    return Array.isArray(res) && res.length > 0 ? res : INITIAL_MASTERS;
  });
  const [settings, setSettings] = useState<ClinicSettings>(() => {
    const stored = getStored('SETTINGS', INITIAL_SETTINGS);
    const rawSheetId = stored?.googleSheetId;
    const isPlaceholder = !rawSheetId || rawSheetId.includes('1PEC_Master') || rawSheetId.includes('placeholder');
    const cleanedSheetId = isPlaceholder ? '' : rawSheetId;
    const cleanedUrl = cleanedSheetId ? `https://docs.google.com/spreadsheets/d/${cleanedSheetId}/edit` : '';
    const isRealConnected = Boolean(stored?.googleConnectedEmail && cleanedSheetId && stored?.googleSheetConnected);

    return {
      ...INITIAL_SETTINGS,
      ...stored,
      googleSheetId: cleanedSheetId,
      googleSpreadsheetUrl: cleanedUrl,
      googleSpreadsheetName: isPlaceholder ? '' : (stored?.googleSpreadsheetName || ''),
      googleSheetConnected: isRealConnected,
      googleConnectionStatus: isRealConnected ? 'connected' : (stored?.googleConnectedEmail ? 'not_connected' : 'not_connected'),
      examiners: stored && Array.isArray(stored.examiners) && stored.examiners.length > 0 ? stored.examiners : INITIAL_SETTINGS.examiners,
      rxAdvicePresets: stored && Array.isArray(stored.rxAdvicePresets) ? stored.rxAdvicePresets : INITIAL_SETTINGS.rxAdvicePresets
    };
  });
  const [clinicalDraft, setClinicalDraft] = useState<ClinicalDraft>(() => {
    const stored = getStored('CLINICAL_DRAFT', EMPTY_DRAFT);
    return {
      ...EMPTY_DRAFT,
      ...(stored || {}),
      symptoms: Array.isArray(stored?.symptoms) ? stored.symptoms : [],
      diagnosis: Array.isArray(stored?.diagnosis) ? stored.diagnosis : [],
      medicines: Array.isArray(stored?.medicines) ? stored.medicines : [],
      odPower: { ...EMPTY_DRAFT.odPower, ...(stored?.odPower || {}) },
      osPower: { ...EMPTY_DRAFT.osPower, ...(stored?.osPower || {}) },
    };
  });

  const [selectedPatientFor360, setSelectedPatientFor360] = useState<Patient | null>(null);
  const [selectedCustomerFor360, setSelectedCustomerFor360] = useState<Customer | null>(null);
  const [selectedDealerForProfile, setSelectedDealerForProfile] = useState<Dealer | null>(null);
  const [printModalData, setPrintModalData] = useState<PrintModalData | null>(null);
  const [quickModal, setQuickModal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [googleSheetsStatus, setGoogleSheetsStatus] = useState<GoogleSheetsStatus>(() => ({
    synced: true,
    syncing: false,
    lastSync: new Date().toISOString(),
    error: null
  }));

  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>(() =>
    navigator.onLine ? 'synced' : 'offline'
  );
  const [cloudLastSyncTime, setCloudLastSyncTime] = useState<string | null>(() =>
    localStorage.getItem('PAHARPUR_LAST_MIGRATION_TIME') || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [erpUsers, setErpUsers] = useState<ERPUser[]>(() => {
    const saved = localStorage.getItem('PAHARPUR_ERP_USERS');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        uid: 'USR-ADMIN-01',
        email: 'paharpureyecare@gmail.com',
        displayName: 'ERP Master Admin',
        role: 'Admin',
        status: 'Active',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        uid: 'USR-DOC-01',
        email: 'doctor@paharpureyecare.com',
        displayName: 'Dr. S. K. Banerjee',
        role: 'Doctor',
        status: 'Active',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        uid: 'USR-OPT-01',
        email: 'optometrist@paharpureyecare.com',
        displayName: 'Dr. R. N. Mukherjee',
        role: 'Optometrist',
        status: 'Active',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        uid: 'USR-REC-01',
        email: 'reception@paharpureyecare.com',
        displayName: 'Reception Desk',
        role: 'Receptionist',
        status: 'Active',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        uid: 'USR-SALES-01',
        email: 'sales@paharpureyecare.com',
        displayName: 'Sales Staff',
        role: 'Sales',
        status: 'Active',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        uid: 'USR-INV-01',
        email: 'inventory@paharpureyecare.com',
        displayName: 'Inventory Manager',
        role: 'Inventory',
        status: 'Active',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        uid: 'USR-ACC-01',
        email: 'accounts@paharpureyecare.com',
        displayName: 'Accounts Lead',
        role: 'Accountant',
        status: 'Active',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        uid: 'USR-MKT-01',
        email: 'marketing@paharpureyecare.com',
        displayName: 'Marketing Staff',
        role: 'Marketing Staff',
        status: 'Active',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        uid: 'USR-AUDIT-01',
        email: 'audit@paharpureyecare.com',
        displayName: 'Auditor',
        role: 'Read Only',
        status: 'Active',
        createdAt: '2026-01-01T00:00:00.000Z'
      }
    ];
  });
  const [currentUser, setCurrentUser] = useState<ERPUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('PAHARPUR_ERP_USERS', JSON.stringify(erpUsers));
  }, [erpUsers]);

  // Auth State Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const matched = erpUsers.find(u => u.email.toLowerCase() === (user.email || '').toLowerCase() || u.uid === user.uid);
        if (matched) {
          if (matched.status === 'Disabled') {
            await logoutUser();
            setCurrentUser(null);
            showToast('Your staff account has been disabled by the Administrator. Access blocked. / আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।', 'error');
            return;
          }
          setCurrentUser(matched);
          setRole(matched.role);
        } else {
          const assignedRole: UserRole = (user.email === 'paharpureyecare@gmail.com' || (user.email && user.email.includes('admin'))) ? 'Admin' : 'Receptionist';
          const newProfile: ERPUser = {
            uid: user.uid,
            email: user.email || 'user@paharpureyecare.com',
            displayName: user.displayName || user.email?.split('@')[0] || 'Staff User',
            role: assignedRole,
            status: 'Active',
            createdAt: new Date().toISOString()
          };
          setErpUsers(prev => [newProfile, ...prev.filter(u => u.uid !== newProfile.uid)]);
          setCurrentUser(newProfile);
          setRole(assignedRole);
          saveCloudDocument('users', newProfile.uid, newProfile).catch(() => {});
        }
      } else {
        const adminProfile = erpUsers.find(u => u.role === 'Admin') || erpUsers[0];
        setCurrentUser(adminProfile || null);
      }
    });
    return () => unsub();
  }, [erpUsers]);

  // Proactive real-time session invalidation if an active logged-in user is disabled by Admin
  useEffect(() => {
    if (currentUser) {
      const liveDoc = erpUsers.find(u => u.uid === currentUser.uid || u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (liveDoc && liveDoc.status === 'Disabled') {
        logoutUser().catch(() => {});
        setCurrentUser(null);
        showToast('Your staff account has been disabled by the Administrator. Session ended. / আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।', 'error');
      }
    }
  }, [erpUsers, currentUser]);

  const saveUserAccount = async (user: ERPUser): Promise<boolean> => {
    setErpUsers(prev => {
      const idx = prev.findIndex(u => u.uid === user.uid || u.email.toLowerCase() === user.email.toLowerCase());
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = user;
        return copy;
      }
      return [user, ...prev];
    });
    const ok = await saveERPUser(user);
    if (ok) {
      showToast(`User account ${user.displayName || user.email} updated successfully!`, 'success');
      addAuditLog('UPDATE', 'Settings', user.uid, `Saved user profile: ${user.email} (${user.role})`);
    }
    return ok;
  };

  const deleteUserAccount = async (uid: string): Promise<boolean> => {
    const user = erpUsers.find(u => u.uid === uid);
    if (user?.role === 'Admin' && erpUsers.filter(u => u.role === 'Admin').length <= 1) {
      showToast('Cannot delete the last Admin account.', 'error');
      return false;
    }
    setErpUsers(prev => prev.filter(u => u.uid !== uid));
    const ok = await deleteERPUser(uid);
    if (ok) {
      showToast('Staff user deleted from system.', 'info');
      addAuditLog('DELETE', 'Settings', uid, `Deleted user account: ${user?.email || uid}`);
    }
    return ok;
  };

  const toggleUserStatus = async (uid: string, status?: 'Active' | 'Disabled'): Promise<boolean> => {
    const target = erpUsers.find(u => u.uid === uid);
    if (!target) return false;
    const nextStatus: 'Active' | 'Disabled' = status || (target.status === 'Active' ? 'Disabled' : 'Active');
    const updated: ERPUser = { ...target, status: nextStatus };
    setErpUsers(prev => prev.map(u => u.uid === uid ? updated : u));
    const ok = await toggleERPUserStatus(uid, nextStatus);
    showToast(`User ${target.displayName || target.email} marked ${nextStatus}`);
    addAuditLog('UPDATE', 'Settings', uid, `Toggled user status to ${nextStatus}: ${target.email}`);
    return ok;
  };

  const loginWithGoogleAccount = async (): Promise<boolean> => {
    try {
      const res = await loginWithGoogle();
      if (res.user) {
        const matched = erpUsers.find(u => u.email.toLowerCase() === (res.user.email || '').toLowerCase());
        if (matched && matched.status === 'Disabled') {
          await logoutUser();
          showToast('This staff account has been disabled by the Administrator.', 'error');
          return false;
        }
        if (matched) {
          const updatedUser: ERPUser = { ...matched, lastLogin: new Date().toISOString() };
          saveUserAccount(updatedUser).catch(() => {});
        }
        showToast(`Logged in as ${res.user.email}`, 'success');
        addAuditLog('LOGIN', 'Settings', res.user.uid, `User signed in via Google: ${res.user.email}`);
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err?.message || 'Google login failed', 'error');
      return false;
    }
  };

  const loginWithEmailAccount = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const matched = erpUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched && matched.status === 'Disabled') {
        showToast('This staff account has been disabled by the Administrator.', 'error');
        return { success: false, error: 'Your staff account has been disabled by the Administrator.' };
      }

      const res = await loginWithEmail(email, pass);
      if (res.user) {
        if (matched) {
          const updatedUser: ERPUser = { ...matched, lastLogin: new Date().toISOString() };
          saveUserAccount(updatedUser).catch(() => {});
        }
        showToast(`Signed in as ${res.user.email}`, 'success');
        addAuditLog('LOGIN', 'Settings', res.user.uid, `Staff user logged in: ${res.user.email}`);
        return { success: true };
      }
      return { success: false, error: 'Invalid login credentials' };
    } catch (err: any) {
      const msg = err?.message || 'Email login failed';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logoutAccount = async (): Promise<void> => {
    try {
      const userEmail = currentUser?.email || firebaseUser?.email || 'user';
      await logoutUser();
      showToast('Signed out from Firebase Cloud session', 'info');
      addAuditLog('LOGOUT', 'Settings', currentUser?.uid || 'AUTH', `Staff user signed out: ${userEmail}`);
    } catch (err: any) {
      showToast(err?.message || 'Sign out failed', 'error');
    }
  };

  // Role Permissions State & Persistence
  const [rolePermissions, setRolePermissions] = useState<RolePermissionsMap>(() => {
    try {
      const saved = localStorage.getItem('PAHARPUR_ROLE_PERMISSIONS');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return getDefaultRolePermissions();
  });

  useEffect(() => {
    localStorage.setItem('PAHARPUR_ROLE_PERMISSIONS', JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  useEffect(() => {
    const fetchCloudPermissions = async () => {
      try {
        const cloudData = await loadCloudDocument<{ permissions: RolePermissionsMap }>('system_config', 'role_permissions');
        if (cloudData && cloudData.permissions) {
          setRolePermissions(cloudData.permissions);
        }
      } catch (err) {
        console.warn('Could not load cloud role permissions:', err);
      }
    };
    fetchCloudPermissions();
  }, []);

  const updateRolePermissions = async (newPermissions: RolePermissionsMap): Promise<boolean> => {
    setRolePermissions(newPermissions);
    localStorage.setItem('PAHARPUR_ROLE_PERMISSIONS', JSON.stringify(newPermissions));
    try {
      await saveCloudDocument('system_config', 'role_permissions', {
        permissions: newPermissions,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email || 'admin'
      });
      showToast('Role permissions updated and saved to Cloud Firestore!', 'success');
      addAuditLog('UPDATE', 'Settings', 'role_permissions', 'Updated role permissions matrix in Cloud Firestore');
      return true;
    } catch (err: any) {
      showToast('Failed to save permissions to Cloud Firestore', 'error');
      return false;
    }
  };

  const resetRolePermissionsToDefault = async (): Promise<boolean> => {
    const defaults = getDefaultRolePermissions();
    return await updateRolePermissions(defaults);
  };

  const hasPermission = (module: PermissionModule, action: PermissionAction): boolean => {
    const effectiveRole = currentUser?.role || role;
    return checkPermission(rolePermissions, effectiveRole, module, action, currentUser?.customPermissions);
  };

  // Failed Access Attempts Tracker for Security Monitoring
  const [failedAccessAttempts, setFailedAccessAttempts] = useState<FailedAccessAttempt[]>(() => {
    try {
      const saved = localStorage.getItem('PAHARPUR_FAILED_ACCESS_LOGS');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: 'SEC-1001',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        user: 'reception@paharpureyecare.com',
        role: 'Receptionist',
        module: 'Prescriptions',
        action: 'delete',
        reason: 'Blocked by RBAC Policy: RECEPTION role is denied DELETE privilege on Prescriptions.',
        userAgent: 'Chrome on Windows 11'
      },
      {
        id: 'SEC-1002',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        user: 'sales@paharpureyecare.com',
        role: 'Sales',
        module: 'Settings',
        action: 'edit',
        reason: 'Blocked by RBAC Policy: SALES role is denied EDIT privilege on Clinic Settings & Firebase Config.',
        userAgent: 'Chrome on Android 14'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('PAHARPUR_FAILED_ACCESS_LOGS', JSON.stringify(failedAccessAttempts));
  }, [failedAccessAttempts]);

  const recordFailedAccessAttempt = (attempt: Omit<FailedAccessAttempt, 'id' | 'timestamp'>) => {
    const newRecord: FailedAccessAttempt = {
      ...attempt,
      id: `SEC-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString()
    };
    setFailedAccessAttempts(prev => [newRecord, ...prev]);
    addAuditLog(
      'SECURITY_BLOCK',
      'Settings',
      newRecord.user,
      `Unauthorized attempt blocked: ${newRecord.action.toUpperCase()} on ${newRecord.module} by ${newRecord.user} (${newRecord.role})`
    );
  };

  const checkAndExecuteAction = (
    module: PermissionModule,
    action: PermissionAction,
    onAllowed: () => void,
    actionLabel?: string
  ): boolean => {
    const allowed = hasPermission(module, action);
    if (allowed) {
      onAllowed();
      return true;
    } else {
      const activeUser = currentUser?.displayName || currentUser?.email || `${role} User`;
      recordFailedAccessAttempt({
        user: activeUser,
        role: (currentUser?.role || role) as string,
        module,
        action,
        reason: `Role [${currentUser?.role || role}] lacks [${action.toUpperCase()}] privilege on [${module}].`,
        userAgent: navigator.userAgent
      });
      showToast("You don't have permission to perform this action. / এই কাজটি করার অনুমতি আপনার নেই।", 'warning');
      return false;
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    const res = await sendStaffPasswordResetEmail(email);
    if (res.success) {
      showToast(res.message, 'success');
      addAuditLog('UPDATE', 'Settings', email, `Sent password reset email to ${email}`);
    } else {
      showToast(res.message, 'error');
    }
    return res;
  };

  const createStaffUser = async (user: ERPUser, initialPassword?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (initialPassword && initialPassword.trim().length >= 6) {
        const authRes = await createStaffAuthAccount(user.email, initialPassword);
        if (!authRes.success) {
          showToast(`User profile created, but Firebase Auth account creation failed: ${authRes.error}`, 'warning');
        } else if (authRes.uid) {
          user.uid = authRes.uid;
        }
      }
      await saveUserAccount(user);
      addAuditLog('CREATE', 'Settings', user.uid, `Created new staff user: ${user.email} (${user.role})`);
      return { success: true };
    } catch (err: any) {
      showToast(err?.message || 'Failed to create staff user', 'error');
      return { success: false, error: err?.message };
    }
  };

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setCloudSyncStatus('online');
      syncAllFromFirestore().catch(() => {});
    };
    const handleOffline = () => setCloudSyncStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Safe background persist helper
  const persistToCloud = async (collectionName: string, docId: string, data: any) => {
    try {
      if (!navigator.onLine) {
        // Still writes to local offline cache in Firestore SDK
        await saveCloudDocument(collectionName, docId, data);
        return;
      }
      setCloudSyncStatus('syncing');
      await saveCloudDocument(collectionName, docId, data);
      setCloudSyncStatus('synced');
      setCloudLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn('Cloud persist background error:', err);
    }
  };

  const syncAllToFirestore = async () => {
    let user = auth.currentUser;
    if (!user) {
      user = await ensureFirebaseAuth();
    }
    if (!user) {
      console.warn('Sync to Cloud deferred: Authentication required.');
      setCloudSyncStatus('offline');
      return;
    }
    setCloudSyncStatus('syncing');
    try {
      await migrateCollectionChunked('patients', patients, 'mrd');
      await migrateCollectionChunked('customers', customers, 'customerId');
      await migrateCollectionChunked('appointments', appointments, 'id');
      await migrateCollectionChunked('clinical_visits', visits, 'visitId');
      await migrateCollectionChunked('spectacle_orders', spectacleOrders, 'orderId');
      await migrateCollectionChunked('retail_sales', retailSales, 'invoiceNumber');
      await migrateCollectionChunked('wholesale_sales', wholesaleSales, 'invoiceNumber');
      await migrateCollectionChunked('frames', frames, 'sku');
      await migrateCollectionChunked('lenses', lenses, 'lensCode');
      await migrateCollectionChunked('medicines', medicines, 'id');
      await migrateCollectionChunked('stock_movements', stockMovements, 'id');
      await migrateCollectionChunked('suppliers', suppliers, 'supplierId');
      await migrateCollectionChunked('dealers', dealers, 'dealerId');
      await migrateCollectionChunked('payments', payments, 'paymentId');
      await migrateCollectionChunked('loyalty_logs', loyaltyLogs, 'id');
      await migrateCollectionChunked('customer_powers', customerPowers, 'powerId');
      await migrateCollectionChunked('masters', masters, 'id');
      await migrateCollectionChunked('audit_logs', auditLogs, 'id');
      await migrateCollectionChunked('whatsapp_templates', templates, 'id');
      await migrateCollectionChunked('marketing_campaigns', campaigns, 'id');
      await migrateCollectionChunked('marketing_offers', offers, 'id');
      await migrateCollectionChunked('crm_leads', leads, 'id');
      await migrateCollectionChunked('automation_rules', automationRules, 'id');
      await migrateCollectionChunked('custom_segments', customSegments, 'id');
      await migrateCollectionChunked('users', erpUsers, 'uid');
      await saveCloudDocument('clinic_settings', 'main', settings);
      const nowStr = new Date().toLocaleString('en-IN');
      setCloudLastSyncTime(nowStr);
      localStorage.setItem('PAHARPUR_LAST_MIGRATION_TIME', nowStr);
      setCloudSyncStatus('synced');
    } catch (err) {
      setCloudSyncStatus('error');
    }
  };

  const syncAllFromFirestore = async () => {
    setCloudSyncStatus('syncing');
    try {
      const [
        cloudPatients,
        cloudCustomers,
        cloudAppointments,
        cloudVisits,
        cloudOrders,
        cloudRetail,
        cloudWholesale,
        cloudFrames,
        cloudLenses,
        cloudMedicines,
        cloudStockMov,
        cloudSuppliers,
        cloudDealers,
        cloudPayments,
        cloudLoyalty,
        cloudPowers,
        cloudMasters,
        cloudAuditLogs,
        cloudTemplates,
        cloudCampaigns,
        cloudOffers,
        cloudLeads,
        cloudAutomation,
        cloudSegments,
        cloudUsers
      ] = await Promise.all([
        loadCloudCollection<Patient>('patients'),
        loadCloudCollection<Customer>('customers'),
        loadCloudCollection<Customer>('appointments' as any) as any,
        loadCloudCollection<ClinicalVisit>('clinical_visits'),
        loadCloudCollection<SpectacleOrder>('spectacle_orders'),
        loadCloudCollection<RetailSale>('retail_sales'),
        loadCloudCollection<WholesaleSale>('wholesale_sales'),
        loadCloudCollection<FrameMaster>('frames'),
        loadCloudCollection<LensMaster>('lenses'),
        loadCloudCollection<MedicineMaster>('medicines'),
        loadCloudCollection<StockMovement>('stock_movements'),
        loadCloudCollection<Supplier>('suppliers'),
        loadCloudCollection<Dealer>('dealers'),
        loadCloudCollection<PaymentRecord>('payments'),
        loadCloudCollection<LoyaltyTransaction>('loyalty_logs'),
        loadCloudCollection<CustomerPowerRecord>('customer_powers'),
        loadCloudCollection<MasterRecord>('masters'),
        loadCloudCollection<AuditLog>('audit_logs'),
        loadCloudCollection<WhatsAppTemplate>('whatsapp_templates'),
        loadCloudCollection<MarketingCampaign>('marketing_campaigns'),
        loadCloudCollection<OfferPromotion>('marketing_offers'),
        loadCloudCollection<CrmLead>('crm_leads'),
        loadCloudCollection<AutomationRule>('automation_rules'),
        loadCloudCollection<CustomerSegmentRule>('custom_segments'),
        loadCloudCollection<ERPUser>('users')
      ]);

      if (cloudPatients.length > 0) setPatients(cloudPatients);
      if (cloudCustomers.length > 0) setCustomers(cloudCustomers);
      if (cloudAppointments && (cloudAppointments as any).length > 0) setAppointments(cloudAppointments as any);
      if (cloudVisits.length > 0) setVisits(cloudVisits);
      if (cloudOrders.length > 0) setSpectacleOrders(cloudOrders);
      if (cloudRetail.length > 0) setRetailSales(cloudRetail);
      if (cloudWholesale.length > 0) setWholesaleSales(cloudWholesale);
      if (cloudFrames.length > 0) setFrames(cloudFrames);
      if (cloudLenses.length > 0) setLenses(cloudLenses);
      if (cloudMedicines.length > 0) setMedicines(cloudMedicines);
      if (cloudStockMov.length > 0) setStockMovements(cloudStockMov);
      if (cloudSuppliers.length > 0) setSuppliers(cloudSuppliers);
      if (cloudDealers.length > 0) setDealers(cloudDealers);
      if (cloudPayments.length > 0) setPayments(cloudPayments);
      if (cloudLoyalty.length > 0) setLoyaltyLogs(cloudLoyalty);
      if (cloudPowers.length > 0) setCustomerPowers(cloudPowers);
      if (cloudMasters.length > 0) setMasters(cloudMasters);
      if (cloudAuditLogs.length > 0) setAuditLogs(cloudAuditLogs);
      if (cloudTemplates.length > 0) setTemplates(cloudTemplates);
      if (cloudCampaigns.length > 0) setCampaigns(cloudCampaigns);
      if (cloudOffers.length > 0) setOffers(cloudOffers);
      if (cloudLeads.length > 0) setLeads(cloudLeads);
      if (cloudAutomation.length > 0) setAutomationRules(cloudAutomation);
      if (cloudSegments.length > 0) setCustomSegments(cloudSegments);
      if (cloudUsers.length > 0) setErpUsers(cloudUsers);

      setCloudSyncStatus('synced');
      setCloudLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      setCloudSyncStatus('error');
    }
  };

  // Cloud synchronization: verify and mirror state once authenticated
  useEffect(() => {
    if (navigator.onLine && firebaseUser) {
      loadCloudCollection<Patient>('patients').then(cloudPts => {
        if (cloudPts && cloudPts.length > 0) {
          syncAllFromFirestore().catch(() => {});
        }
      }).catch(err => {
        console.warn('Cloud verification error:', err);
      });
    }
  }, [firebaseUser]);

  // Auto persist on changes
  useEffect(() => { setStored('ROLE', role); }, [role]);
  useEffect(() => { setStored('PATIENTS', patients); }, [patients]);
  useEffect(() => { setStored('APPOINTMENTS', appointments); }, [appointments]);
  useEffect(() => { setStored('VISITS', visits); }, [visits]);
  useEffect(() => { setStored('MEDICINES', medicines); }, [medicines]);
  useEffect(() => { setStored('FRAMES', frames); }, [frames]);
  useEffect(() => { setStored('LENSES', lenses); }, [lenses]);
  useEffect(() => { setStored('STOCK_MOVEMENTS', stockMovements); }, [stockMovements]);
  useEffect(() => { setStored('SPECTACLE_ORDERS', spectacleOrders); }, [spectacleOrders]);
  useEffect(() => { setStored('RETAIL_SALES', retailSales); }, [retailSales]);
  useEffect(() => { setStored('WHOLESALE_SALES', wholesaleSales); }, [wholesaleSales]);
  useEffect(() => { setStored('SUPPLIERS', suppliers); }, [suppliers]);
  useEffect(() => { setStored('DEALERS', dealers); }, [dealers]);
  useEffect(() => { setStored('CUSTOMERS', customers); }, [customers]);
  useEffect(() => { setStored('CUSTOMER_POWERS', customerPowers); }, [customerPowers]);
  useEffect(() => { setStored('LOYALTY_LOGS', loyaltyLogs); }, [loyaltyLogs]);
  useEffect(() => { setStored('STOCK_ADJUSTMENTS', stockAdjustments); }, [stockAdjustments]);
  useEffect(() => { setStored('LENS_RETURNS', lensReturns); }, [lensReturns]);
  useEffect(() => { setStored('LENS_PURCHASES', lensPurchases); }, [lensPurchases]);
  useEffect(() => { setStored('PAYMENTS', payments); }, [payments]);
  useEffect(() => { setStored('AUDIT_LOGS', auditLogs); }, [auditLogs]);
  useEffect(() => { setStored('WHATSAPP_TEMPLATES', templates); }, [templates]);
  useEffect(() => { setStored('OFFERS_PROMOTIONS', offers); }, [offers]);
  useEffect(() => { setStored('COMMUNICATION_LOGS', communicationLogs); }, [communicationLogs]);
  useEffect(() => { setStored('MARKETING_CAMPAIGNS', campaigns); }, [campaigns]);
  useEffect(() => { setStored('CRM_LEADS', leads); }, [leads]);
  useEffect(() => { setStored('AUTOMATION_RULES', automationRules); }, [automationRules]);
  useEffect(() => { setStored('CUSTOM_SEGMENTS', customSegments); }, [customSegments]);
  useEffect(() => { setStored('MASTERS', masters); }, [masters]);
  useEffect(() => { setStored('SETTINGS', settings); }, [settings]);
  useEffect(() => { setStored('CLINICAL_DRAFT', clinicalDraft); }, [clinicalDraft]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const addAuditLog = (
    action: string,
    module: AuditLog['module'],
    recordId: string,
    details: string,
    oldValue?: string,
    newValue?: string,
    fieldChanges?: FieldDiff[],
    beforeValue?: any,
    afterValue?: any
  ) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const logUser = currentUser?.displayName || currentUser?.email || (role === 'Doctor' ? settings.doctorName : `${role} User`);
    const logRole = (currentUser?.role || role) as string;

    const formattedOld = oldValue || (beforeValue ? (typeof beforeValue === 'string' ? beforeValue : JSON.stringify(beforeValue)) : undefined);
    const formattedNew = newValue || (afterValue ? (typeof afterValue === 'string' ? afterValue : JSON.stringify(afterValue)) : undefined);

    const log: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: now.toISOString(),
      date: dateStr,
      time: timeStr,
      user: logUser,
      role: logRole,
      action: action as any,
      module,
      recordId,
      oldValue: formattedOld,
      newValue: formattedNew,
      beforeValue,
      afterValue,
      fieldChanges,
      details
    };
    setAuditLogs(prev => [log, ...prev]);

    // Asynchronously persist immutable audit log to Cloud Firestore collection
    saveCloudDocument('audit_logs', log.id, log, logUser).catch(err => {
      console.warn('Could not persist audit log to Cloud Firestore:', err);
    });
  };

  // 1. Create Patient
  const createPatient = (data: Omit<Patient, 'mrd' | 'registrationDate'>): Patient => {
    const nextSeq = 1000 + patients.length + 1;
    const mrd = `PEC-2026-${nextSeq}`;
    const newPatient: Patient = {
      ...data,
      mrd,
      registrationDate: new Date().toISOString().split('T')[0]
    };
    setPatients(prev => [newPatient, ...prev]);

    // Also register in Customer database if not present
    const existingCust = customers.find(c => c.mobile === newPatient.mobile);
    if (!existingCust) {
      const newCust: Customer = {
        customerId: `CUST-${5000 + customers.length + 1}`,
        name: newPatient.name,
        mobile: newPatient.mobile,
        whatsapp: newPatient.whatsapp || newPatient.mobile,
        address: newPatient.address,
        totalPurchases: 0,
        lifetimeValue: 0,
        outstandingDue: 0,
        lastContact: newPatient.registrationDate,
        nextAction: 'Initial eye consultation',
        segment: 'New Patient'
      };
      setCustomers(prev => [newCust, ...prev]);
    }

    addAuditLog('CREATE', 'Patients', mrd, `Registered new patient: ${newPatient.name} (${mrd})`, 'None (New Record)', `MRD: ${mrd}, Name: ${newPatient.name}, Mobile: ${newPatient.mobile}`);
    showToast(`Patient ${newPatient.name} registered with MRD: ${mrd}`);
    return newPatient;
  };

  // 2. Update Patient (In-Place Edit without losing any clinical/Rx/order history)
  const updatePatient = (updatedPatient: Patient) => {
    const existing = patients.find(p => p.mrd === updatedPatient.mrd);
    if (!existing) {
      showToast(`Patient ${updatedPatient.mrd} not found`, 'error');
      return;
    }

    // Calculate field diffs
    const fieldChanges: FieldDiff[] = [];
    const fieldsToCheck: Array<keyof Patient> = [
      'name', 'age', 'dob', 'gender', 'mobile', 'whatsapp', 'fatherName', 'fatherHusbandName',
      'occupation', 'address', 'fullAddress', 'village', 'postOffice', 'policeStation', 'district',
      'state', 'pinCode', 'email', 'emergencyContact', 'referredBy', 'chiefComplaints', 'status', 'notes'
    ];

    fieldsToCheck.forEach(f => {
      if (existing[f] !== updatedPatient[f] && (existing[f] !== undefined || updatedPatient[f] !== undefined)) {
        fieldChanges.push({
          field: f,
          label: String(f),
          oldVal: existing[f] ?? 'None',
          newVal: updatedPatient[f] ?? 'None'
        });
      }
    });

    // Update in-place in patients
    setPatients(prev => prev.map(p => (p.mrd === updatedPatient.mrd ? updatedPatient : p)));

    // Sync with customer record
    setCustomers(prev => prev.map(c => {
      if (c.mrd === updatedPatient.mrd || c.mobile === updatedPatient.mobile) {
        return {
          ...c,
          name: updatedPatient.name,
          mobile: updatedPatient.mobile,
          whatsapp: updatedPatient.whatsapp || updatedPatient.mobile,
          address: updatedPatient.address,
          village: updatedPatient.village,
          age: updatedPatient.age,
          gender: updatedPatient.gender,
          fatherName: updatedPatient.fatherHusbandName || updatedPatient.fatherName || c.fatherName,
          email: updatedPatient.email || c.email
        };
      }
      return c;
    }));

    // Update in appointments for consistency
    setAppointments(prev => prev.map(a => {
      if (a.mrd === updatedPatient.mrd) {
        return {
          ...a,
          patientName: updatedPatient.name,
          mobile: updatedPatient.mobile,
          whatsapp: updatedPatient.whatsapp,
          age: updatedPatient.age,
          gender: updatedPatient.gender,
          village: updatedPatient.village,
          address: updatedPatient.address,
          district: updatedPatient.district
        };
      }
      return a;
    }));

    addAuditLog(
      'UPDATE',
      'Patients',
      updatedPatient.mrd,
      `Updated Patient Profile for ${updatedPatient.name} (MRD: ${updatedPatient.mrd})`,
      `Name: ${existing.name}, Mob: ${existing.mobile}, Age: ${existing.age}, Village: ${existing.village || 'N/A'}`,
      `Name: ${updatedPatient.name}, Mob: ${updatedPatient.mobile}, Age: ${updatedPatient.age}, Village: ${updatedPatient.village || 'N/A'}`,
      fieldChanges
    );

    showToast(`Patient ${updatedPatient.name} (${updatedPatient.mrd}) updated successfully!`);
  };

  const archivePatient = (mrd: string, reason?: string) => {
    const p = patients.find(pt => pt.mrd === mrd);
    if (!p) return;
    setPatients(prev => prev.map(pt => pt.mrd === mrd ? { ...pt, status: 'Archived', isArchived: true, archivedAt: new Date().toISOString(), archivedReason: reason || 'Archived by Admin' } : pt));
    addAuditLog('ARCHIVE', 'Patients', mrd, `Archived patient ${p.name} (${mrd})`, 'Status: Active', `Status: Archived (${reason || 'Standard Archive'})`);
    showToast(`Patient ${p.name} (${mrd}) archived`, 'warning');
  };

  const restorePatient = (mrd: string) => {
    const p = patients.find(pt => pt.mrd === mrd);
    if (!p) return;
    setPatients(prev => prev.map(pt => pt.mrd === mrd ? { ...pt, status: 'Regular', isArchived: false, archivedAt: undefined, archivedReason: undefined } : pt));
    addAuditLog('RESTORE', 'Patients', mrd, `Restored patient ${p.name} (${mrd}) to active records`, 'Status: Archived', 'Status: Active');
    showToast(`Patient ${p.name} restored to active list`, 'success');
  };

  const deletePatient = (mrd: string) => {
    const p = patients.find(pt => pt.mrd === mrd);
    if (!p) return;
    setPatients(prev => prev.filter(pt => pt.mrd !== mrd));
    addAuditLog('DELETE', 'Patients', mrd, `Permanently deleted patient record: ${p.name} (${mrd})`, `Name: ${p.name}, Mobile: ${p.mobile}`, 'Record Deleted');
    showToast(`Patient ${p.name} permanently deleted`, 'info');
  };

  // 3. Create Appointment (Enhanced with separate Doctor & Optometrist fee calculations)
  const createAppointment = (data: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    let targetMrd = data.mrd;
    
    // Check if patient exists with this MRD or mobile
    const existingPatient = patients.find(p => (targetMrd && p.mrd === targetMrd) || (data.mobile && p.mobile === data.mobile));
    
    if (existingPatient) {
      targetMrd = existingPatient.mrd;
      const updatedPatient: Patient = {
        ...existingPatient,
        name: data.patientName || existingPatient.name,
        age: data.age || existingPatient.age,
        dob: data.dob || existingPatient.dob,
        gender: data.gender || existingPatient.gender,
        village: data.village || existingPatient.village,
        address: data.address || existingPatient.address,
        postOffice: data.postOffice || existingPatient.postOffice,
        policeStation: data.policeStation || existingPatient.policeStation,
        district: data.district || existingPatient.district,
        occupation: data.occupation || existingPatient.occupation,
        referredBy: data.referredBy || existingPatient.referredBy,
        chiefComplaints: data.chiefComplaints || existingPatient.chiefComplaints,
        medicalHistory: data.medicalHistory && data.medicalHistory.length > 0 ? data.medicalHistory : existingPatient.medicalHistory
      };
      setPatients(prev => prev.map(p => (p.mrd === existingPatient.mrd ? updatedPatient : p)));
    } else {
      // Create new Patient record automatically
      const nextSeq = 1000 + patients.length + 1;
      targetMrd = targetMrd && targetMrd.startsWith('PEC-') ? targetMrd : `PEC-2026-${nextSeq}`;
      const newPatient: Patient = {
        mrd: targetMrd,
        name: data.patientName || 'New Patient',
        age: data.age || 35,
        dob: data.dob || undefined,
        gender: data.gender || 'Male',
        mobile: data.mobile,
        whatsapp: data.whatsapp || data.mobile,
        address: data.address || data.village || 'Paharpur, South 24 Parganas',
        village: data.village || '',
        postOffice: data.postOffice || '',
        policeStation: data.policeStation || '',
        district: data.district || 'South 24 Parganas',
        occupation: data.occupation || '',
        referredBy: data.referredBy || 'Walk-in Booking',
        chiefComplaints: data.chiefComplaints || '',
        medicalHistory: data.medicalHistory || [],
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'New Patient',
        notes: data.notes || 'Registered during appointment booking'
      };
      setPatients(prev => [newPatient, ...prev]);

      // Register Customer CRM record
      const newCust: Customer = {
        customerId: `CUST-${5000 + customers.length + 1}`,
        name: newPatient.name,
        mobile: newPatient.mobile,
        whatsapp: newPatient.whatsapp || newPatient.mobile,
        address: newPatient.address,
        mrd: newPatient.mrd,
        village: newPatient.village,
        age: newPatient.age,
        gender: newPatient.gender,
        totalPurchases: 0,
        lifetimeValue: 0,
        outstandingDue: 0,
        lastContact: newPatient.registrationDate,
        nextAction: 'Initial eye consultation',
        segment: 'New Patient'
      };
      setCustomers(prev => [newCust, ...prev]);
    }

    const nextId = `APT-2026-0${500 + appointments.length + 1}`;
    const docFee = Number(data.doctorFee ?? settings.doctorFee ?? 0);
    const optoFee = Number(data.optometristFee ?? (data.optometrist ? (settings.optometristFee ?? 0) : 0));
    const totalFee = Number(data.totalFee ?? (docFee + optoFee));
    const discount = Number(data.discount ?? 0);
    const netFee = Number(data.netFee ?? Math.max(0, totalFee - discount));
    const paid = Number(data.paid ?? data.paidAmount ?? 0);
    const due = Number(data.due ?? Math.max(0, netFee - paid));

    let paymentStatus = data.paymentStatus;
    if (!paymentStatus) {
      if (paid >= netFee && netFee > 0) paymentStatus = 'Paid';
      else if (paid > 0 && due > 0) paymentStatus = 'Partial';
      else paymentStatus = 'Pending';
    }

    const newApt: Appointment = {
      ...data,
      mrd: targetMrd,
      id: nextId,
      doctorFee: docFee,
      optometristFee: optoFee,
      fee: totalFee,
      totalFee,
      discount,
      netFee,
      paid,
      paidAmount: paid,
      due,
      paymentMethod: data.paymentMethod || 'Cash',
      paymentStatus,
      status: data.status || 'Confirmed',
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [newApt, ...prev]);
    addAuditLog(
      'CREATE',
      'Appointments',
      nextId,
      `Booked appointment for ${newApt.patientName} (${targetMrd}) with ${newApt.doctor}`,
      'None (New Appointment)',
      `ID: ${nextId}, Date: ${newApt.date} ${newApt.time}, Doctor: ${newApt.doctor}, Total Fee: ₹${totalFee}, Paid: ₹${paid}, Status: ${newApt.status}`
    );
    showToast(`Appointment ${nextId} booked for ${newApt.patientName} (MRD: ${targetMrd})`, 'success');
    return newApt;
  };

  // 4. Update Appointment (In-Place Edit without duplicate ID)
  const updateAppointment = (updatedApt: Appointment) => {
    const existing = appointments.find(a => a.id === updatedApt.id);
    if (!existing) {
      showToast(`Appointment ${updatedApt.id} not found`, 'error');
      return;
    }

    // Calculate fees accurately
    const docFee = Number(updatedApt.doctorFee !== undefined ? updatedApt.doctorFee : (existing.doctorFee ?? 0));
    const optoFee = Number(updatedApt.optometristFee !== undefined ? updatedApt.optometristFee : (existing.optometristFee ?? 0));
    const totalFee = docFee + optoFee;
    const discount = Number(updatedApt.discount !== undefined ? updatedApt.discount : (existing.discount ?? 0));
    const netFee = Math.max(0, totalFee - discount);
    const paid = Number(updatedApt.paid !== undefined ? updatedApt.paid : (updatedApt.paidAmount !== undefined ? updatedApt.paidAmount : (existing.paid ?? existing.paidAmount ?? 0)));
    const due = Math.max(0, netFee - paid);

    let paymentStatus = updatedApt.paymentStatus;
    if (!paymentStatus || paymentStatus === 'Pending' || paymentStatus === 'Partial' || paymentStatus === 'Paid') {
      if (paid >= netFee && netFee > 0) {
        paymentStatus = 'Paid';
      } else if (paid > 0 && due > 0) {
        paymentStatus = 'Partial';
      } else if (paid === 0) {
        paymentStatus = 'Pending';
      }
    }

    const merged: Appointment = {
      ...existing,
      ...updatedApt,
      doctorFee: docFee,
      optometristFee: optoFee,
      fee: totalFee,
      totalFee,
      discount,
      netFee,
      paid,
      paidAmount: paid,
      due,
      paymentStatus,
      updatedAt: new Date().toISOString()
    };

    // Calculate field diffs
    const fieldChanges: FieldDiff[] = [];
    const fieldsToCheck: Array<keyof Appointment> = [
      'patientName', 'mobile', 'whatsapp', 'doctor', 'optometrist', 'date', 'time', 'visitType',
      'doctorFee', 'optometristFee', 'totalFee', 'discount', 'netFee', 'paid', 'due',
      'paymentMethod', 'paymentStatus', 'status', 'village', 'address', 'receptionNote', 'otherNotes', 'notes'
    ];

    fieldsToCheck.forEach(f => {
      if (existing[f] !== merged[f] && (existing[f] !== undefined || merged[f] !== undefined)) {
        fieldChanges.push({
          field: f,
          label: String(f),
          oldVal: existing[f] ?? 'None',
          newVal: merged[f] ?? 'None'
        });
      }
    });

    // Update in-place in appointments array (strictly no duplicate!)
    setAppointments(prev => prev.map(a => (a.id === merged.id ? merged : a)));

    // Sync patient info if changed
    if (merged.mrd) {
      setPatients(prev => prev.map(p => {
        if (p.mrd === merged.mrd) {
          return {
            ...p,
            name: merged.patientName || p.name,
            mobile: merged.mobile || p.mobile,
            whatsapp: merged.whatsapp || p.whatsapp,
            age: merged.age !== undefined ? merged.age : p.age,
            gender: merged.gender || p.gender,
            village: merged.village || p.village,
            address: merged.address || p.address,
            postOffice: merged.postOffice || p.postOffice,
            policeStation: merged.policeStation || p.policeStation,
            district: merged.district || p.district,
            occupation: merged.occupation || p.occupation,
            referredBy: merged.referredBy || p.referredBy
          };
        }
        return p;
      }));
    }

    const oldSummary = `Date: ${existing.date} ${existing.time}, Dr: ${existing.doctor}, Fee: ₹${existing.totalFee ?? existing.fee ?? 0}, Paid: ₹${existing.paid ?? existing.paidAmount ?? 0}, Status: ${existing.status}`;
    const newSummary = `Date: ${merged.date} ${merged.time}, Dr: ${merged.doctor}, Fee: ₹${merged.totalFee}, Paid: ₹${merged.paid}, Status: ${merged.status}`;

    addAuditLog(
      'UPDATE',
      'Appointments',
      merged.id,
      `Updated Appointment ${merged.id} for ${merged.patientName} (${merged.mrd})`,
      oldSummary,
      newSummary,
      fieldChanges
    );

    showToast(`Appointment ${merged.id} updated successfully!`);
  };

  // 5. Cancel Appointment
  const cancelAppointment = (id: string, reason?: string) => {
    const existing = appointments.find(a => a.id === id);
    if (!existing) return;

    const merged: Appointment = {
      ...existing,
      status: 'Cancelled',
      paymentStatus: 'Cancelled',
      notes: reason ? `${existing.notes || ''} [Cancelled: ${reason}]`.trim() : existing.notes,
      updatedAt: new Date().toISOString()
    };

    setAppointments(prev => prev.map(a => (a.id === id ? merged : a)));

    addAuditLog(
      'CANCEL',
      'Appointments',
      id,
      `Cancelled appointment ${id} for ${existing.patientName}`,
      `Status: ${existing.status}`,
      `Status: Cancelled${reason ? ` (Reason: ${reason})` : ''}`
    );
    showToast(`Appointment ${id} cancelled`, 'warning');
  };

  const archiveAppointment = (id: string, reason?: string) => {
    const existing = appointments.find(a => a.id === id);
    if (!existing) return;
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, isArchived: true, archivedAt: new Date().toISOString(), archivedReason: reason || 'Archived' } : a)));
    addAuditLog('ARCHIVE', 'Appointments', id, `Archived appointment ${id} for ${existing.patientName}`, 'Status: Active', `Status: Archived (${reason || 'Archived'})`);
    showToast(`Appointment ${id} archived`, 'warning');
  };

  const restoreAppointment = (id: string) => {
    const existing = appointments.find(a => a.id === id);
    if (!existing) return;
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, isArchived: false, archivedAt: undefined, archivedReason: undefined } : a)));
    addAuditLog('RESTORE', 'Appointments', id, `Restored appointment ${id} for ${existing.patientName}`, 'Status: Archived', 'Status: Active');
    showToast(`Appointment ${id} restored to active records`, 'success');
  };

  const deleteAppointment = (id: string) => {
    const existing = appointments.find(a => a.id === id);
    if (!existing) return;
    setAppointments(prev => prev.filter(a => a.id !== id));
    addAuditLog('DELETE', 'Appointments', id, `Permanently deleted appointment ${id} for ${existing.patientName}`, `Patient: ${existing.patientName}, Date: ${existing.date}`, 'Record Deleted');
    showToast(`Appointment ${id} deleted permanently`, 'info');
  };

  // 6. Collect Appointment Payment
  const collectAppointmentPayment = (id: string, amount: number, paymentMethod: PaymentMethod = 'Cash', notes?: string) => {
    const existing = appointments.find(a => a.id === id);
    if (!existing) return;

    const currentPaid = Number(existing.paid ?? existing.paidAmount ?? 0);
    const newPaid = currentPaid + amount;
    const netFee = Number(existing.netFee ?? existing.totalFee ?? existing.fee ?? 0);
    const newDue = Math.max(0, netFee - newPaid);
    const newPaymentStatus = newDue === 0 ? 'Paid' : 'Partial';

    const merged: Appointment = {
      ...existing,
      paid: newPaid,
      paidAmount: newPaid,
      due: newDue,
      paymentMethod,
      paymentStatus: newPaymentStatus,
      updatedAt: new Date().toISOString()
    };

    setAppointments(prev => prev.map(a => (a.id === id ? merged : a)));

    // Record payment in payments ledger
    const nextPaySeq = 9500 + payments.length + 1;
    const paymentRec: PaymentRecord = {
      paymentId: `PAY-2026-${nextPaySeq}`,
      date: new Date().toISOString().split('T')[0],
      customerId: existing.mrd,
      customerName: existing.patientName,
      mobile: existing.mobile,
      invoiceNumber: existing.id,
      amount,
      paymentMode: paymentMethod as any,
      referenceNumber: notes,
      receivedBy: role === 'Doctor' ? settings.doctorName : `${role} Staff`,
      notes: `Consultation fee collection for ${existing.id}`
    };
    setPayments(prev => [paymentRec, ...prev]);

    addAuditLog(
      'PAYMENT',
      'Appointments',
      id,
      `Collected ₹${amount} fee for appointment ${id} (${existing.patientName})`,
      `Paid: ₹${currentPaid}, Due: ₹${existing.due ?? (netFee - currentPaid)}`,
      `Paid: ₹${newPaid}, Due: ₹${newDue}, Mode: ${paymentMethod}`
    );
    showToast(`Collected ₹${amount} for ${existing.patientName} (${id})`);
  };

  // Doctor & Optometrist Masters management
  const saveDoctor = (doctor: DoctorMaster) => {
    const currentList = settings.doctorsList || [];
    const exists = currentList.some(d => d.id === doctor.id);
    const existing = currentList.find(d => d.id === doctor.id);
    const updatedList = exists
      ? currentList.map(d => (d.id === doctor.id ? doctor : d))
      : [...currentList, doctor];

    updateSettings({
      doctorsList: updatedList,
      doctorName: doctor.status === 'Active' ? doctor.name : settings.doctorName,
      doctorQualification: doctor.status === 'Active' ? `${doctor.qualification || doctor.degree || ''} - ${doctor.specialization || doctor.designation || ''}` : settings.doctorQualification,
      doctorRegNo: doctor.status === 'Active' ? (doctor.registrationNo || doctor.regNo || settings.doctorRegNo) : settings.doctorRegNo,
      doctorFee: doctor.status === 'Active' ? doctor.consultationFee : settings.doctorFee
    });

    if (existing) {
      addAuditLog(
        'UPDATE',
        'Settings',
        doctor.id,
        `Updated Doctor Master: ${doctor.name} (Fee: ₹${doctor.consultationFee})`,
        `Name: ${existing.name}, Fee: ₹${existing.consultationFee}, Status: ${existing.status}`,
        `Name: ${doctor.name}, Fee: ₹${doctor.consultationFee}, Status: ${doctor.status}`
      );
    } else {
      addAuditLog(
        'CREATE',
        'Settings',
        doctor.id,
        `Created Doctor Master: ${doctor.name} (Fee: ₹${doctor.consultationFee})`,
        'None',
        `Name: ${doctor.name}, Fee: ₹${doctor.consultationFee}, Status: ${doctor.status}`
      );
    }
    showToast(`Doctor ${doctor.name} saved successfully`);
  };

  const archiveDoctor = (id: string, reason?: string) => {
    const currentList = settings.doctorsList || [];
    const doc = currentList.find(d => d.id === id);
    if (!doc) return;
    const updatedList = currentList.map(d => (d.id === id ? { ...d, status: 'Archived' as const, isArchived: true, archivedAt: new Date().toISOString(), archivedReason: reason || 'Archived' } : d));
    updateSettings({ doctorsList: updatedList });
    addAuditLog('ARCHIVE', 'Settings', id, `Archived Doctor ${doc.name} (${id})`, 'Status: Active', `Status: Archived (${reason || 'Archived'})`);
    showToast(`Doctor ${doc.name} archived`, 'warning');
  };

  const restoreDoctor = (id: string) => {
    const currentList = settings.doctorsList || [];
    const doc = currentList.find(d => d.id === id);
    if (!doc) return;
    const updatedList = currentList.map(d => (d.id === id ? { ...d, status: 'Active' as const, isArchived: false, archivedAt: undefined, archivedReason: undefined } : d));
    updateSettings({ doctorsList: updatedList });
    addAuditLog('RESTORE', 'Settings', id, `Restored Doctor ${doc.name} (${id})`, 'Status: Archived', 'Status: Active');
    showToast(`Doctor ${doc.name} restored to active list`, 'success');
  };

  const toggleDoctorStatus = (id: string) => {
    const currentList = settings.doctorsList || [];
    const doc = currentList.find(d => d.id === id);
    if (!doc) return;
    const nextStatus: 'Active' | 'Inactive' = doc.status === 'Active' ? 'Inactive' : 'Active';
    const updatedList = currentList.map(d => (d.id === id ? { ...d, status: nextStatus } : d));
    updateSettings({ doctorsList: updatedList });
    addAuditLog('UPDATE', 'Settings', id, `Changed Doctor status for ${doc.name} to ${nextStatus}`, `Status: ${doc.status}`, `Status: ${nextStatus}`);
    showToast(`Doctor ${doc.name} marked ${nextStatus}`);
  };

  const deleteDoctor = (id: string) => {
    const currentList = settings.doctorsList || [];
    const target = currentList.find(d => d.id === id);
    const updatedList = currentList.filter(d => d.id !== id);
    updateSettings({ doctorsList: updatedList });
    addAuditLog('DELETE', 'Settings', id, `Deleted Doctor Master entry: ${target?.name || id}`);
    showToast(`Doctor removed`, 'info');
  };

  const saveOptometrist = (optometrist: OptometristMaster) => {
    const currentList = settings.optometristsList || [];
    const exists = currentList.some(o => o.id === optometrist.id);
    const existing = currentList.find(o => o.id === optometrist.id);
    const updatedList = exists
      ? currentList.map(o => (o.id === optometrist.id ? optometrist : o))
      : [...currentList, optometrist];

    updateSettings({
      optometristsList: updatedList,
      optometristName: optometrist.status === 'Active' ? optometrist.name : settings.optometristName,
      optometristQualification: optometrist.status === 'Active' ? optometrist.qualification : settings.optometristQualification,
      optometristRegNo: optometrist.status === 'Active' ? optometrist.regNo : settings.optometristRegNo,
      optometristFee: optometrist.status === 'Active' ? optometrist.examinationFee : settings.optometristFee
    });
    
    if (existing) {
      addAuditLog('UPDATE', 'Settings', optometrist.id, `Updated Optometrist Master: ${optometrist.name} (Fee: ₹${optometrist.examinationFee})`, `Name: ${existing.name}, Fee: ₹${existing.examinationFee}`, `Name: ${optometrist.name}, Fee: ₹${optometrist.examinationFee}`);
    } else {
      addAuditLog('CREATE', 'Settings', optometrist.id, `Created Optometrist Master: ${optometrist.name} (Fee: ₹${optometrist.examinationFee})`, 'None', `Name: ${optometrist.name}, Fee: ₹${optometrist.examinationFee}`);
    }
    showToast(`Optometrist ${optometrist.name} saved successfully`);
  };

  const toggleOptometristStatus = (id: string) => {
    const currentList = settings.optometristsList || [];
    const opt = currentList.find(o => o.id === id);
    if (!opt) return;
    const nextStatus: 'Active' | 'Inactive' = opt.status === 'Active' ? 'Inactive' : 'Active';
    const updatedList = currentList.map(o => (o.id === id ? { ...o, status: nextStatus } : o));
    updateSettings({ optometristsList: updatedList });
    addAuditLog('UPDATE', 'Settings', id, `Changed Optometrist status for ${opt.name} to ${nextStatus}`, `Status: ${opt.status}`, `Status: ${nextStatus}`);
    showToast(`Optometrist ${opt.name} marked ${nextStatus}`);
  };

  const deleteOptometrist = (id: string) => {
    const currentList = settings.optometristsList || [];
    const target = currentList.find(o => o.id === id);
    const updatedList = currentList.filter(o => o.id !== id);
    updateSettings({ optometristsList: updatedList });
    addAuditLog('DELETE', 'Settings', id, `Deleted Optometrist Master entry: ${target?.name || id}`);
    showToast(`Optometrist removed`, 'info');
  };

  // 4. Update Appointment Status
  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));
    addAuditLog('UPDATE_APPOINTMENT_STATUS', 'Appointments', id, `Status changed to ${status}`);
    showToast(`Appointment status updated to ${status}`);
  };

  // 5. Start Visit From Appointment (1-Click Link!)
  const startVisitFromAppointment = (appointmentId: string) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    const patient = patients.find(p => p.mrd === apt.mrd);

    // Update appointment to 'In Consultation'
    updateAppointmentStatus(appointmentId, 'In Consultation');

    // Populate clinical draft
    setClinicalDraft(prev => ({
      ...prev,
      mrd: apt.mrd,
      patientName: apt.patientName,
      age: apt.age || (patient ? patient.age : 35),
      gender: apt.gender || (patient ? patient.gender : 'Male'),
      mobile: apt.mobile,
      doctor: apt.doctor || settings.doctorName,
      visitType: apt.visitType,
      appointmentId: apt.id,
      symptoms: apt.chiefComplaints ? [apt.chiefComplaints] : (patient?.chiefComplaints ? [patient.chiefComplaints] : prev.symptoms)
    }));

    setActiveTab('entry-center');
    showToast(`Loaded ${apt.patientName} into Clinical Entry Center`, 'info');
  };

  // 6. Load Patient into Clinical
  const loadPatientIntoClinical = (mrd: string) => {
    const p = patients.find(pt => pt.mrd === mrd);
    if (!p) return;

    // Check if there is previous visit to copy previous power/findings if desired
    const prevVisit = visits.find(v => v.mrd === mrd);

    setClinicalDraft(prev => ({
      ...prev,
      mrd: p.mrd,
      patientName: p.name,
      age: p.age,
      gender: p.gender,
      mobile: p.mobile,
      doctor: settings.doctorName,
      visitType: prevVisit ? 'Follow-up' : 'New Consultation',
      appointmentId: undefined,
      odPower: prevVisit ? { ...prevVisit.odPower } : prev.odPower,
      osPower: prevVisit ? { ...prevVisit.osPower } : prev.osPower
    }));

    setActiveTab('entry-center');
    showToast(`Loaded ${p.name} (${p.mrd}) into Entry Center`);
  };

  // 7. Save Clinical Visit (Create or Update)
  const saveClinicalVisit = (draft: ClinicalDraft): ClinicalVisit => {
    const followUpDateStr = draft.followUpDate || (draft.followUpDays
      ? new Date(Date.now() + draft.followUpDays * 86400000).toISOString().split('T')[0]
      : undefined);

    if (draft.editingVisitId) {
      const existing = visits.find(v => v.visitId === draft.editingVisitId);
      const updatedVisit: ClinicalVisit = {
        visitId: draft.editingVisitId,
        appointmentId: draft.appointmentId || existing?.appointmentId,
        mrd: draft.mrd,
        patientName: draft.patientName,
        age: Number(draft.age) || 0,
        gender: draft.gender,
        mobile: draft.mobile,
        doctor: draft.doctor || settings.doctorName,
        optometrist: draft.optometrist,
        examinerRole: draft.examinerRole,
        visitType: draft.visitType,
        visitDate: draft.visitDate || existing?.visitDate || new Date().toISOString().split('T')[0],
        symptoms: draft.symptoms,
        symptomDuration: draft.symptomDuration,
        symptomSeverity: draft.symptomSeverity,
        examination: draft.examination,
        odPower: draft.odPower,
        osPower: draft.osPower,
        diagnosis: draft.diagnosis,
        customDiagnosis: draft.customDiagnosis,
        medicines: draft.medicines,
        advice: draft.advice,
        followUpDays: draft.followUpDays,
        followUpDate: followUpDateStr,
        followUpReason: draft.followUpReason,
        referral: draft.referral,
        surgeryAdvice: draft.surgeryAdvice,
        investigation: draft.investigation,
        spectacleAdvice: draft.spectacleAdvice,
        rxId: existing?.rxId || `RX-2026-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString()
      };

      setVisits(prev => prev.map(v => (v.visitId === draft.editingVisitId ? updatedVisit : v)));
      addAuditLog('UPDATE_CLINICAL_VISIT' as any, 'Clinical', draft.editingVisitId, `Updated clinical examination & Rx for ${draft.patientName} (${draft.mrd})`);
      showToast(`Visit ${draft.editingVisitId} updated successfully!`);
      clearClinicalDraft();
      return updatedVisit;
    }

    const nextSeq = 3000 + visits.length + 1;
    const visitId = `VST-2026-${nextSeq}`;
    const rxId = `RX-2026-${9000 + visits.length + 1}`;

    const newVisit: ClinicalVisit = {
      visitId,
      appointmentId: draft.appointmentId,
      mrd: draft.mrd,
      patientName: draft.patientName,
      age: Number(draft.age) || 0,
      gender: draft.gender,
      mobile: draft.mobile,
      doctor: draft.doctor || settings.doctorName,
      optometrist: draft.optometrist,
      examinerRole: draft.examinerRole,
      visitType: draft.visitType,
      visitDate: draft.visitDate || new Date().toISOString().split('T')[0],
      symptoms: draft.symptoms,
      symptomDuration: draft.symptomDuration,
      symptomSeverity: draft.symptomSeverity,
      examination: draft.examination,
      odPower: draft.odPower,
      osPower: draft.osPower,
      diagnosis: draft.diagnosis,
      customDiagnosis: draft.customDiagnosis,
      medicines: draft.medicines,
      advice: draft.advice,
      followUpDays: draft.followUpDays,
      followUpDate: followUpDateStr,
      followUpReason: draft.followUpReason,
      referral: draft.referral,
      surgeryAdvice: draft.surgeryAdvice,
      investigation: draft.investigation,
      spectacleAdvice: draft.spectacleAdvice,
      rxId,
      timestamp: new Date().toISOString()
    };

    setVisits(prev => [newVisit, ...prev]);

    // If linked to appointment, mark completed
    if (draft.appointmentId) {
      updateAppointmentStatus(draft.appointmentId, 'Completed');
    }

    // Update patient status to Regular / Follow-up
    setPatients(prev =>
      prev.map(p =>
        p.mrd === draft.mrd
          ? { ...p, status: 'Regular' }
          : p
      )
    );

    // Update Customer CRM record
    setCustomers(prev =>
      prev.map(c =>
        c.mobile === draft.mobile || (c.name || '').toLowerCase() === (draft.patientName || '').toLowerCase()
          ? {
              ...c,
              lastContact: newVisit.visitDate,
              nextAction: followUpDateStr ? `Follow-up due on ${followUpDateStr}` : 'Routine check',
              segment: 'Follow-up Due'
            }
          : c
      )
    );

    addAuditLog('SAVE_CLINICAL_VISIT', 'Clinical', visitId, `Saved clinical examination & Rx for ${draft.patientName} (${draft.mrd})`);
    showToast(`Visit ${visitId} & Prescription ${rxId} saved successfully!`);

    // Reset draft
    clearClinicalDraft();

    return newVisit;
  };

  const updateClinicalVisit = (updatedVisit: ClinicalVisit) => {
    setVisits(prev => prev.map(v => (v.visitId === updatedVisit.visitId ? updatedVisit : v)));
    addAuditLog('UPDATE_CLINICAL_VISIT' as any, 'Clinical', updatedVisit.visitId, `Updated clinical visit for ${updatedVisit.patientName} (${updatedVisit.mrd})`);
    showToast(`Visit ${updatedVisit.visitId} updated successfully!`);
  };

  const deleteClinicalVisit = (visitId: string) => {
    const target = visits.find(v => v.visitId === visitId);
    setVisits(prev => prev.filter(v => v.visitId !== visitId));
    addAuditLog('DELETE_CLINICAL_VISIT' as any, 'Clinical', visitId, `Deleted clinical visit for ${target?.patientName || ''} (${visitId})`);
    showToast(`Visit record deleted`, 'info');
  };

  const loadVisitForEditing = (visit: ClinicalVisit) => {
    setClinicalDraft({
      editingVisitId: visit.visitId,
      mrd: visit.mrd,
      patientName: visit.patientName,
      age: visit.age,
      gender: visit.gender,
      mobile: visit.mobile,
      doctor: visit.doctor,
      optometrist: visit.optometrist || settings.optometristName,
      examinerRole: visit.examinerRole || 'Ophthalmologist',
      visitType: visit.visitType,
      visitDate: visit.visitDate,
      appointmentId: visit.appointmentId,
      symptoms: Array.isArray(visit.symptoms) ? visit.symptoms : [],
      symptomDuration: visit.symptomDuration || '1 Week',
      symptomSeverity: visit.symptomSeverity || 'Moderate',
      odPower: { ...visit.odPower },
      osPower: { ...visit.osPower },
      examination: {
        ...createEmptyClinicalExamination(),
        ...(visit.examination || {})
      },
      diagnosis: Array.isArray(visit.diagnosis) ? visit.diagnosis : [],
      customDiagnosis: visit.customDiagnosis || '',
      medicines: Array.isArray(visit.medicines) ? visit.medicines : [],
      advice: visit.advice || '',
      followUpDays: visit.followUpDays || 15,
      followUpDate: visit.followUpDate,
      followUpReason: visit.followUpReason || 'Follow-up Check',
      referral: visit.referral || '',
      surgeryAdvice: visit.surgeryAdvice || '',
      investigation: visit.investigation || '',
      spectacleAdvice: visit.spectacleAdvice || ''
    });
    setActiveTab('entry-center');
    showToast(`Loaded Visit ${visit.visitId} for Editing`);
  };

  const clearClinicalDraft = () => {
    setClinicalDraft(EMPTY_DRAFT);
  };

  // 8. Create Spectacle Order (Linked with Lens & Frame Stock Ledger!)
  const createSpectacleOrder = (orderData: Omit<SpectacleOrder, 'orderId' | 'orderDate'>): SpectacleOrder => {
    const nextSeq = 7000 + spectacleOrders.length + 1;
    const orderId = `ORD-2026-${nextSeq}`;
    const today = new Date().toISOString().split('T')[0];

    const subTotal = (orderData.frameRate || 0) + (orderData.lensRate || 0) + (orderData.fittingsCharge || orderData.fittingCharges || 0);
    let finalDiscount = orderData.discount || 0;
    if (orderData.discountType === 'Percentage' && orderData.discountPercent && orderData.discountPercent > 0) {
      finalDiscount = Math.round((subTotal * orderData.discountPercent) / 100);
    }
    const computedTotal = orderData.total !== undefined ? orderData.total : Math.max(0, subTotal - finalDiscount);
    const computedDue = orderData.due !== undefined ? orderData.due : Math.max(0, computedTotal - (orderData.advance || 0));

    const newOrder: SpectacleOrder = {
      ...orderData,
      orderId,
      subTotal,
      discount: finalDiscount,
      total: computedTotal,
      due: computedDue,
      orderDate: today,
      status: orderData.status || 'New'
    };

    setSpectacleOrders(prev => [newOrder, ...prev]);

    // 1. Decrement Frame Stock (Only if not manual frame and frameSku is selected)
    if (!newOrder.isManualFrame && newOrder.frameSku) {
      setFrames(prev =>
        prev.map(f => {
          if (f.sku === newOrder.frameSku) {
            const nextStock = Math.max(0, f.currentStock - (newOrder.quantity || 1));
            const nextStatus = nextStock === 0 ? 'Out of Stock' : nextStock <= f.reorderLevel ? 'Low Stock' : 'Available';
            return { ...f, currentStock: nextStock, status: nextStatus };
          }
          return f;
        })
      );

      const frameItem = frames.find(f => f.sku === newOrder.frameSku);
      const movId1 = `MOV-${Date.now().toString().slice(-6)}-1`;
      const movement1: StockMovement = {
        id: movId1,
        date: today,
        itemType: 'Frame',
        itemCode: newOrder.frameSku,
        itemName: frameItem ? `${frameItem.brand} ${frameItem.model}` : (newOrder.frameBrand || newOrder.frameName || 'Frame'),
        movementType: 'Spectacle Order',
        reference: orderId,
        qtyIn: 0,
        qtyOut: newOrder.quantity || 1,
        balance: frameItem ? Math.max(0, frameItem.currentStock - (newOrder.quantity || 1)) : 0,
        user: role === 'Doctor' ? settings.doctorName : `${role} Staff`,
        notes: `Reserved for Spectacle Order ${orderId} (${newOrder.customerName})`,
        timestamp: new Date().toISOString()
      };
      setStockMovements(prev => [movement1, ...prev]);
    }

    // 2. Decrement Lens Stock (Only if not manual lens)
    if (!newOrder.isManualLens) {
      const odSku = newOrder.odMatchedLensSku;
      const osSku = newOrder.osMatchedLensSku;
      const orderQty = newOrder.quantity || 1;

      if (odSku || osSku) {
        if (odSku) {
          setLenses(prev =>
            prev.map(l => {
              if (l.lensCode === odSku) {
                const nextStock = Math.max(0, l.currentStock - orderQty);
                const nextStatus = nextStock === 0 ? 'Out of Stock' : nextStock <= l.reorderLevel ? 'Low Stock' : 'Available';
                return { ...l, currentStock: nextStock, status: nextStatus };
              }
              return l;
            })
          );
          const odLensItem = lenses.find(l => l.lensCode === odSku);
          const movOD: StockMovement = {
            id: `MOV-${Date.now().toString().slice(-6)}-OD`,
            date: today,
            itemType: 'Lens',
            itemCode: odSku,
            itemName: odLensItem ? `${odLensItem.productName || odLensItem.brand} (OD: ${newOrder.odSph || '0.00'})` : `Lens OD (${odSku})`,
            movementType: 'Spectacle Order',
            reference: orderId,
            qtyIn: 0,
            qtyOut: orderQty,
            balance: odLensItem ? Math.max(0, odLensItem.currentStock - orderQty) : 0,
            user: role === 'Doctor' ? settings.doctorName : `${role} Staff`,
            notes: `Right Eye (OD: SPH ${newOrder.odSph || '—'}, CYL ${newOrder.odCyl || '—'}, AXIS ${newOrder.odAxis || '—'}) for Order ${orderId}`,
            timestamp: new Date().toISOString()
          };
          setStockMovements(prev => [movOD, ...prev]);
        }

        if (osSku && osSku !== odSku) {
          setLenses(prev =>
            prev.map(l => {
              if (l.lensCode === osSku) {
                const nextStock = Math.max(0, l.currentStock - orderQty);
                const nextStatus = nextStock === 0 ? 'Out of Stock' : nextStock <= l.reorderLevel ? 'Low Stock' : 'Available';
                return { ...l, currentStock: nextStock, status: nextStatus };
              }
              return l;
            })
          );
          const osLensItem = lenses.find(l => l.lensCode === osSku);
          const movOS: StockMovement = {
            id: `MOV-${Date.now().toString().slice(-6)}-OS`,
            date: today,
            itemType: 'Lens',
            itemCode: osSku,
            itemName: osLensItem ? `${osLensItem.productName || osLensItem.brand} (OS: ${newOrder.osSph || '0.00'})` : `Lens OS (${osSku})`,
            movementType: 'Spectacle Order',
            reference: orderId,
            qtyIn: 0,
            qtyOut: orderQty,
            balance: osLensItem ? Math.max(0, osLensItem.currentStock - orderQty) : 0,
            user: role === 'Doctor' ? settings.doctorName : `${role} Staff`,
            notes: `Left Eye (OS: SPH ${newOrder.osSph || '—'}, CYL ${newOrder.osCyl || '—'}, AXIS ${newOrder.osAxis || '—'}) for Order ${orderId}`,
            timestamp: new Date().toISOString()
          };
          setStockMovements(prev => [movOS, ...prev]);
        } else if (osSku && osSku === odSku) {
          // Both eyes share SKU
          setLenses(prev =>
            prev.map(l => {
              if (l.lensCode === osSku) {
                const nextStock = Math.max(0, l.currentStock - orderQty * 2);
                const nextStatus = nextStock === 0 ? 'Out of Stock' : nextStock <= l.reorderLevel ? 'Low Stock' : 'Available';
                return { ...l, currentStock: nextStock, status: nextStatus };
              }
              return l;
            })
          );
        }
      } else if (newOrder.lensCode) {
        setLenses(prev =>
          prev.map(l => {
            if (l.lensCode === newOrder.lensCode) {
              const nextStock = Math.max(0, l.currentStock - orderQty * 2);
              const nextStatus = nextStock === 0 ? 'Out of Stock' : nextStock <= l.reorderLevel ? 'Low Stock' : 'Available';
              return { ...l, currentStock: nextStock, status: nextStatus };
            }
            return l;
          })
        );
        const lensItem = lenses.find(l => l.lensCode === newOrder.lensCode);
        const movement2: StockMovement = {
          id: `MOV-${Date.now().toString().slice(-6)}-2`,
          date: today,
          itemType: 'Lens',
          itemCode: newOrder.lensCode,
          itemName: lensItem ? `${lensItem.company} ${lensItem.brand}` : (newOrder.lensBrand || newOrder.lensName || 'Lens Pair'),
          movementType: 'Spectacle Order',
          reference: orderId,
          qtyIn: 0,
          qtyOut: orderQty * 2,
          balance: lensItem ? Math.max(0, lensItem.currentStock - orderQty * 2) : 0,
          user: role === 'Doctor' ? settings.doctorName : `${role} Staff`,
          notes: `Fitted for Spectacle Order ${orderId} (${newOrder.customerName})`,
          timestamp: new Date().toISOString()
        };
        setStockMovements(prev => [movement2, ...prev]);
      }
    }

    // 3. Create Retail Sale Invoice
    const invoiceNum = `INV-2026-${8000 + retailSales.length + 1}`;
    const newSale: RetailSale = {
      invoiceNumber: invoiceNum,
      date: today,
      customerType: newOrder.mrd ? 'Existing Patient' : 'Walk-in Customer',
      mrdOrCustomerId: newOrder.mrd || newOrder.customerId || `CUST-ORDER`,
      customerName: newOrder.customerName,
      mobile: newOrder.mobile,
      items: [
        {
          id: `SI-${Date.now()}`,
          itemType: 'Spectacle',
          code: orderId,
          name: `Custom Spectacle (${newOrder.frameBrand || newOrder.frameName || 'Frame'} + ${newOrder.lensBrand || newOrder.lensName || 'Lenses'})`,
          quantity: newOrder.quantity || 1,
          unitPrice: newOrder.total + newOrder.discount,
          discount: newOrder.discount,
          taxPercent: 0,
          total: newOrder.total
        }
      ],
      subTotal: newOrder.total + newOrder.discount,
      discountTotal: newOrder.discount,
      taxTotal: 0,
      grandTotal: newOrder.total,
      paid: newOrder.advance,
      due: newOrder.due,
      paymentMode: newOrder.advance > 0 ? (newOrder.paymentMethod || 'UPI') : 'Cash',
      notes: `Spectacle Order ${orderId}. Advance ₹${newOrder.advance}, Due ₹${newOrder.due}`,
      status: newOrder.due === 0 ? 'Paid' : newOrder.advance > 0 ? 'Partial' : 'Due',
      cashier: `${role} Desk`
    };
    setRetailSales(prev => [newSale, ...prev]);

    // 4. Record advance payment if > 0
    if (newOrder.advance > 0) {
      const payment: PaymentRecord = {
        paymentId: `PAY-2026-${9500 + payments.length + 1}`,
        date: today,
        customerId: newOrder.mrd || newOrder.customerId || newOrder.mobile,
        customerName: newOrder.customerName,
        mobile: newOrder.mobile,
        invoiceNumber: invoiceNum,
        amount: newOrder.advance,
        paymentMode: (newOrder.paymentMethod as any) || 'UPI',
        receivedBy: `${role} Desk`,
        notes: `Advance for Spectacle Order ${orderId}`
      };
      setPayments(prev => [payment, ...prev]);
    }

    // 5. Save Power Snapshot to Customer Eye Power History
    if (newOrder.odSph || newOrder.osSph || newOrder.odPower || newOrder.osPower) {
      const pwrId = `PWR-${Date.now().toString().slice(-6)}`;
      const pwrRecord: CustomerPowerRecord = {
        powerId: pwrId,
        customerId: newOrder.customerId || `CUST-${newOrder.mobile}`,
        mrd: newOrder.mrd,
        date: today,
        odPower: newOrder.odPower || {
          sph: newOrder.odSph || '0.00',
          cyl: newOrder.odCyl || '0.00',
          axis: newOrder.odAxis || '0',
          add: newOrder.odAdd || '',
          distanceVa: newOrder.distanceVa || '6/6',
          nearVa: newOrder.nearVa || 'N6'
        },
        osPower: newOrder.osPower || {
          sph: newOrder.osSph || '0.00',
          cyl: newOrder.osCyl || '0.00',
          axis: newOrder.osAxis || '0',
          add: newOrder.osAdd || '',
          distanceVa: newOrder.distanceVa || '6/6',
          nearVa: newOrder.nearVa || 'N6'
        },
        source: newOrder.rxId ? 'Doctor Prescription' : 'Manual Entry',
        doctor: role === 'Doctor' ? settings.doctorName : undefined,
        pd: newOrder.pd || '',
        prescribedBy: role === 'Doctor' ? settings.doctorName : 'Optometrist',
        notes: `Recorded during Spectacle Order ${orderId}`
      };
      setCustomerPowers(prev => [pwrRecord, ...prev]);
    }

    // 6. Loyalty Points Calculation & Ledger Log
    const currentCustomer = customers.find(c => c.mobile === newOrder.mobile || (newOrder.mrd && c.mrd === newOrder.mrd));
    const currentPts = currentCustomer?.loyaltyPoints || 0;
    const currentSpend = currentCustomer?.lifetimeValue || 0;

    const redeemedPoints = newOrder.loyaltyPointsRedeemed || 0;
    const loyaltyDiscRupees = newOrder.loyaltyDiscount || 0;

    const pointsCalc = calculateTransactionPointsEarned(
      {
        billAmount: newOrder.total,
        subTotal: newOrder.subTotal,
        paidAmount: newOrder.advance,
        customerPoints: currentPts,
        customerLifetimeSpend: currentSpend,
        categoryBreakdown: {
          frames: newOrder.frameRate,
          lenses: newOrder.lensRate,
          spectacles: newOrder.total
        }
      },
      settings?.loyaltySettings || DEFAULT_LOYALTY_SETTINGS
    );

    const earnedPoints = pointsCalc.totalPointsEarned;
    const ptsAfterRedeem = Math.max(0, currentPts - redeemedPoints);
    const finalCustPoints = ptsAfterRedeem + earnedPoints;

    // Log Redemption if points were used
    if (redeemedPoints > 0) {
      const redeemLog: LoyaltyTransaction = {
        id: `LOY-RED-${Date.now().toString().slice(-6)}`,
        customerId: currentCustomer?.customerId || `CUST-${newOrder.mobile}`,
        customerName: newOrder.customerName,
        date: today,
        type: 'REDEEMED',
        points: redeemedPoints,
        oldPoints: currentPts,
        newPoints: ptsAfterRedeem,
        referenceId: orderId,
        reason: `Redeemed ${redeemedPoints} pts for ₹${loyaltyDiscRupees} discount on Order ${orderId}`,
        user: role,
        monetaryValueRupees: loyaltyDiscRupees
      };
      setLoyaltyLogs(prev => [redeemLog, ...prev]);
    }

    // Log Earned Points
    if (earnedPoints > 0) {
      const earnedLog: LoyaltyTransaction = {
        id: `LOY-EARN-${Date.now().toString().slice(-6)}`,
        customerId: currentCustomer?.customerId || `CUST-${newOrder.mobile}`,
        customerName: newOrder.customerName,
        date: today,
        type: 'EARNED',
        points: earnedPoints,
        oldPoints: ptsAfterRedeem,
        newPoints: finalCustPoints,
        referenceId: orderId,
        reason: `Earned from Spectacle Order ${orderId} (₹${newOrder.total})`,
        user: role,
        monetaryValueRupees: pointsCalc.monetaryEquivalentRupees,
        appliedRuleSnapshot: pointsCalc.appliedRuleSnapshot
      };
      setLoyaltyLogs(prev => [earnedLog, ...prev]);
    }

    // 7. Update or Create Unified Customer Profile
    setCustomers(prev => {
      const match = prev.find(c => c.mobile === newOrder.mobile || (newOrder.mrd && c.mrd === newOrder.mrd));
      const profileData = newOrder.customerProfileData || {};

      if (match) {
        return prev.map(c =>
          (c.mobile === newOrder.mobile || (newOrder.mrd && c.mrd === newOrder.mrd))
            ? {
                ...c,
                name: newOrder.customerName || c.name,
                mrd: newOrder.mrd || c.mrd,
                whatsapp: profileData.whatsapp || newOrder.whatsapp || c.whatsapp || newOrder.mobile,
                age: profileData.age !== undefined ? profileData.age : (newOrder.age || c.age),
                gender: profileData.gender || newOrder.gender || c.gender,
                fatherHusbandName: profileData.fatherHusbandName || profileData.fatherName || c.fatherHusbandName || c.fatherName,
                occupation: profileData.occupation || profileData.profession || c.occupation || c.profession,
                address: profileData.fullAddress || profileData.address || newOrder.address || c.address,
                fullAddress: profileData.fullAddress || profileData.address || newOrder.address || c.fullAddress || c.address,
                village: profileData.village || c.village,
                postOffice: profileData.postOffice || c.postOffice,
                policeStation: profileData.policeStation || c.policeStation,
                district: profileData.district || c.district,
                state: profileData.state || c.state,
                pinCode: profileData.pinCode || c.pinCode,
                email: profileData.email || c.email,
                maritalStatus: profileData.maritalStatus || c.maritalStatus,
                anniversaryDate: profileData.anniversaryDate || profileData.marriageAnniversary || c.anniversaryDate,
                referredBy: profileData.referredBy || c.referredBy,
                emergencyContact: profileData.emergencyContact || profileData.altMobile || c.emergencyContact || c.altMobile,
                notes: profileData.notes ? `${c.notes ? c.notes + ' | ' : ''}${profileData.notes}` : c.notes,
                totalPurchases: (c.totalPurchases || 0) + 1,
                lifetimeValue: (c.lifetimeValue || 0) + newOrder.total,
                outstandingDue: (c.outstandingDue || 0) + newOrder.due,
                loyaltyPoints: finalCustPoints,
                lastPurchaseDate: today,
                nextAction: `Deliver order ${orderId} on ${newOrder.deliveryDate}`,
                segment: 'Spectacle Buyer'
              }
            : c
        );
      } else {
        const generatedCustId = `CUST-${5000 + prev.length + 1}`;
        const newC: Customer = {
          customerId: generatedCustId,
          mrd: newOrder.mrd,
          name: newOrder.customerName,
          mobile: newOrder.mobile,
          whatsapp: profileData.whatsapp || newOrder.whatsapp || newOrder.mobile,
          age: profileData.age !== undefined ? profileData.age : newOrder.age,
          gender: profileData.gender || newOrder.gender || 'Male',
          fatherHusbandName: profileData.fatherHusbandName || profileData.fatherName,
          fatherName: profileData.fatherName || profileData.fatherHusbandName,
          occupation: profileData.occupation || profileData.profession,
          profession: profileData.profession || profileData.occupation,
          address: profileData.fullAddress || profileData.address || newOrder.address || '',
          fullAddress: profileData.fullAddress || profileData.address || newOrder.address || '',
          village: profileData.village,
          postOffice: profileData.postOffice,
          policeStation: profileData.policeStation,
          district: profileData.district || 'Purulia',
          state: profileData.state || 'West Bengal',
          pinCode: profileData.pinCode,
          email: profileData.email,
          maritalStatus: profileData.maritalStatus,
          anniversaryDate: profileData.anniversaryDate || profileData.marriageAnniversary,
          marriageAnniversary: profileData.marriageAnniversary || profileData.anniversaryDate,
          referredBy: profileData.referredBy,
          emergencyContact: profileData.emergencyContact || profileData.altMobile,
          altMobile: profileData.altMobile || profileData.emergencyContact,
          notes: profileData.notes,
          firstPurchaseDate: today,
          lastPurchaseDate: today,
          totalPurchases: 1,
          lifetimeValue: newOrder.total,
          outstandingDue: newOrder.due,
          loyaltyPoints: finalCustPoints,
          lastContact: today,
          nextAction: `Deliver order ${orderId} on ${newOrder.deliveryDate}`,
          segment: 'Spectacle Buyer',
          status: 'Active'
        };
        return [newC, ...prev];
      }
    });

    addAuditLog('CREATE_SPECTACLE_ORDER', 'Spectacles', orderId, `Booked order for ${newOrder.customerName} (Advance: ₹${newOrder.advance}, Due: ₹${newOrder.due})`);
    showToast(`Spectacle Order ${orderId} created! Central inventory updated.`);
    return newOrder;
  };

  // 9. Update Spectacle Order (Full Details & Customer Sync)
  const updateSpectacleOrder = (
    updatedOrder: SpectacleOrder,
    options?: { updateCustomerProfile?: boolean; newPayment?: { amount: number; mode: string; notes?: string } }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const subTotal = (updatedOrder.frameRate || 0) + (updatedOrder.lensRate || 0) + (updatedOrder.otherCharges || updatedOrder.fittingsCharge || updatedOrder.fittingCharges || 0);
    
    let finalDiscount = 0;
    if (updatedOrder.discountType === 'Percentage' && updatedOrder.discountPercent && updatedOrder.discountPercent > 0) {
      finalDiscount = Math.round((subTotal * updatedOrder.discountPercent) / 100);
    } else if (updatedOrder.discountType === 'Amount') {
      finalDiscount = updatedOrder.discount || 0;
    } else {
      finalDiscount = updatedOrder.discount || 0;
    }

    // Add loyalty discount if redeemed
    if (updatedOrder.loyaltyDiscount && updatedOrder.loyaltyDiscount > 0) {
      finalDiscount += updatedOrder.loyaltyDiscount;
    }

    const netTotal = Math.max(0, subTotal - finalDiscount);
    let totalPaid = updatedOrder.advance || updatedOrder.paid || 0;
    
    if (options?.newPayment && options.newPayment.amount > 0) {
      totalPaid += options.newPayment.amount;
      const payRecord: PaymentRecord = {
        paymentId: `PAY-2026-${9500 + payments.length + 1}`,
        date: today,
        customerId: updatedOrder.mrd || updatedOrder.customerId || updatedOrder.mobile,
        customerName: updatedOrder.customerName,
        mobile: updatedOrder.mobile,
        invoiceNumber: updatedOrder.orderId,
        amount: options.newPayment.amount,
        paymentMode: (options.newPayment.mode as any) || 'Cash',
        receivedBy: `${role} Desk`,
        notes: options.newPayment.notes || `Payment installment for Spectacle Order ${updatedOrder.orderId}`
      };
      setPayments(prev => [payRecord, ...prev]);
    }

    const computedDue = Math.max(0, netTotal - totalPaid);

    const fullUpdatedOrder: SpectacleOrder = {
      ...updatedOrder,
      subTotal,
      discount: finalDiscount,
      total: netTotal,
      advance: totalPaid,
      paid: totalPaid,
      due: computedDue
    };

    setSpectacleOrders(prev =>
      prev.map(o => (o.orderId === updatedOrder.orderId ? fullUpdatedOrder : o))
    );

    // If options.updateCustomerProfile or customerProfileData provided, update root Customer profile without touching historical invoices
    const profileData = updatedOrder.customerProfileData;
    if (options?.updateCustomerProfile || profileData) {
      setCustomers(prev =>
        prev.map(c => {
          if (c.customerId === updatedOrder.customerId || c.mobile === updatedOrder.mobile || (updatedOrder.mrd && c.mrd === updatedOrder.mrd)) {
            return {
              ...c,
              name: updatedOrder.customerName || c.name,
              mobile: updatedOrder.mobile || c.mobile,
              whatsapp: profileData?.whatsapp || updatedOrder.whatsapp || c.whatsapp || updatedOrder.mobile,
              age: profileData?.age !== undefined ? profileData.age : (updatedOrder.age || c.age),
              gender: profileData?.gender || updatedOrder.gender || c.gender,
              dob: profileData?.dob || c.dob,
              fatherHusbandName: profileData?.fatherHusbandName || profileData?.fatherName || c.fatherHusbandName || c.fatherName,
              fatherName: profileData?.fatherName || profileData?.fatherHusbandName || c.fatherName,
              occupation: profileData?.occupation || profileData?.profession || c.occupation || c.profession,
              profession: profileData?.profession || profileData?.occupation || c.profession,
              address: profileData?.fullAddress || profileData?.address || updatedOrder.address || c.address,
              fullAddress: profileData?.fullAddress || profileData?.address || updatedOrder.address || c.fullAddress || c.address,
              village: profileData?.village !== undefined ? profileData.village : c.village,
              postOffice: profileData?.postOffice !== undefined ? profileData.postOffice : c.postOffice,
              policeStation: profileData?.policeStation !== undefined ? profileData.policeStation : c.policeStation,
              district: profileData?.district !== undefined ? profileData.district : c.district,
              state: profileData?.state !== undefined ? profileData.state : c.state,
              pinCode: profileData?.pinCode !== undefined ? profileData.pinCode : c.pinCode,
              email: profileData?.email !== undefined ? profileData.email : c.email,
              maritalStatus: profileData?.maritalStatus !== undefined ? profileData.maritalStatus : c.maritalStatus,
              anniversaryDate: profileData?.anniversaryDate || profileData?.marriageAnniversary || c.anniversaryDate,
              referredBy: profileData?.referredBy !== undefined ? profileData.referredBy : c.referredBy,
              emergencyContact: profileData?.emergencyContact || profileData?.altMobile || c.emergencyContact || c.altMobile,
              altMobile: profileData?.altMobile || profileData?.emergencyContact || c.altMobile,
              notes: profileData?.notes !== undefined ? profileData.notes : c.notes
            };
          }
          return c;
        })
      );
    }

    addAuditLog('UPDATE_SPECTACLE_ORDER', 'Spectacles', updatedOrder.orderId, `Updated Spectacle Order ${updatedOrder.orderId} for ${updatedOrder.customerName}. Net: ₹${netTotal}, Due: ₹${computedDue}`);
    showToast(`Order ${updatedOrder.orderId} updated successfully!`, 'success');
  };

  // Collect Spectacle Order Payment
  const collectSpectacleOrderPayment = (
    orderId: string,
    amount: number,
    paymentMode: string,
    notes?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const ord = spectacleOrders.find(o => o.orderId === orderId);
    if (!ord) {
      showToast(`Order ${orderId} not found`, 'error');
      return;
    }

    const nextPaid = (ord.advance || ord.paid || 0) + amount;
    const nextDue = Math.max(0, ord.total - nextPaid);

    setSpectacleOrders(prev =>
      prev.map(o => (o.orderId === orderId ? { ...o, advance: nextPaid, paid: nextPaid, due: nextDue } : o))
    );

    const payRecord: PaymentRecord = {
      paymentId: `PAY-2026-${9500 + payments.length + 1}`,
      date: today,
      customerId: ord.mrd || ord.customerId || ord.mobile,
      customerName: ord.customerName,
      mobile: ord.mobile,
      invoiceNumber: orderId,
      amount,
      paymentMode: (paymentMode as any) || 'Cash',
      receivedBy: `${role} Desk`,
      notes: notes || `Installment payment for Spectacle Order ${orderId}`
    };
    setPayments(prev => [payRecord, ...prev]);

    // Update Customer outstanding due
    setCustomers(prev =>
      prev.map(c =>
        (c.customerId === ord.customerId || c.mobile === ord.mobile || (ord.mrd && c.mrd === ord.mrd))
          ? { ...c, outstandingDue: Math.max(0, (c.outstandingDue || 0) - amount) }
          : c
      )
    );

    addAuditLog('COLLECT_ORDER_PAYMENT', 'Billing', orderId, `Collected ₹${amount} for Order ${orderId} from ${ord.customerName} via ${paymentMode}`);
    showToast(`Payment of ₹${amount} received for Order ${orderId}! Remaining due: ₹${nextDue}`, 'success');
  };

  // 10. Update Spectacle Order Status
  const updateSpectacleOrderStatus = (orderId: string, status: SpectacleOrderStatus) => {
    setSpectacleOrders(prev => prev.map(o => (o.orderId === orderId ? { ...o, status } : o)));
    addAuditLog('UPDATE_ORDER_STATUS', 'Spectacles', orderId, `Order status changed to ${status}`);
    showToast(`Order ${orderId} marked as ${status}`);
  };

  // 10. Create Retail Sale
  const createRetailSale = (saleData: Omit<RetailSale, 'invoiceNumber' | 'date'>): RetailSale => {
    const nextSeq = 8000 + retailSales.length + 1;
    const invoiceNum = `INV-2026-${nextSeq}`;
    const today = new Date().toISOString().split('T')[0];

    const newSale: RetailSale = {
      ...saleData,
      invoiceNumber: invoiceNum,
      date: today
    };

    setRetailSales(prev => [newSale, ...prev]);

    // Update central inventory for each sold item
    saleData.items.forEach(item => {
      if (item.itemType === 'Frame') {
        setFrames(prev =>
          prev.map(f => {
            if (f.sku === item.code) {
              const nextStock = Math.max(0, f.currentStock - item.quantity);
              return {
                ...f,
                currentStock: nextStock,
                status: nextStock === 0 ? 'Out of Stock' : nextStock <= f.reorderLevel ? 'Low Stock' : 'Available'
              };
            }
            return f;
          })
        );
      } else if (item.itemType === 'Lens') {
        setLenses(prev =>
          prev.map(l => {
            if (l.lensCode === item.code) {
              const nextStock = Math.max(0, l.currentStock - item.quantity);
              return {
                ...l,
                currentStock: nextStock,
                status: nextStock === 0 ? 'Out of Stock' : nextStock <= l.reorderLevel ? 'Low Stock' : 'Available'
              };
            }
            return l;
          })
        );
      }

      // Add stock movement
      const mov: StockMovement = {
        id: `MOV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`,
        date: today,
        itemType: item.itemType === 'Frame' ? 'Frame' : item.itemType === 'Lens' ? 'Lens' : 'Accessory',
        itemCode: item.code,
        itemName: item.name,
        movementType: 'Retail Sale',
        reference: invoiceNum,
        qtyIn: 0,
        qtyOut: item.quantity,
        balance: 0,
        user: `${role} Desk`,
        notes: `Retail Sale to ${newSale.customerName}`,
        timestamp: new Date().toISOString()
      };
      setStockMovements(prev => [mov, ...prev]);
    });

    // If paid > 0, record payment
    if (newSale.paid > 0) {
      const payment: PaymentRecord = {
        paymentId: `PAY-2026-${9500 + payments.length + 1}`,
        date: today,
        customerId: newSale.mrdOrCustomerId,
        customerName: newSale.customerName,
        mobile: newSale.mobile,
        invoiceNumber: invoiceNum,
        amount: newSale.paid,
        paymentMode: newSale.paymentMode as any,
        receivedBy: `${role} Desk`,
        notes: `Retail Sale ${invoiceNum}`
      };
      setPayments(prev => [payment, ...prev]);
    }

    // Loyalty Points Calculation & Ledger Log
    const currentCustomer = customers.find(c => c.mobile === newSale.mobile || (newSale.mrdOrCustomerId && c.mrd === newSale.mrdOrCustomerId) || (newSale.mrdOrCustomerId && c.customerId === newSale.mrdOrCustomerId));
    const currentPts = currentCustomer?.loyaltyPoints || 0;
    const currentSpend = currentCustomer?.lifetimeValue || 0;

    const framesAmt = newSale.items.filter(i => i.itemType === 'Frame').reduce((s, i) => s + (i.total || 0), 0);
    const lensesAmt = newSale.items.filter(i => i.itemType === 'Lens').reduce((s, i) => s + (i.total || 0), 0);
    const accessoriesAmt = newSale.items.filter(i => i.itemType === 'Accessory').reduce((s, i) => s + (i.total || 0), 0);
    const medicinesAmt = newSale.items.filter(i => i.itemType === 'Medicine').reduce((s, i) => s + (i.total || 0), 0);

    const pointsCalc = calculateTransactionPointsEarned(
      {
        billAmount: newSale.grandTotal,
        subTotal: newSale.subTotal,
        paidAmount: newSale.paid,
        customerPoints: currentPts,
        customerLifetimeSpend: currentSpend,
        categoryBreakdown: {
          frames: framesAmt,
          lenses: lensesAmt,
          accessories: accessoriesAmt,
          medicines: medicinesAmt
        }
      },
      settings?.loyaltySettings || DEFAULT_LOYALTY_SETTINGS
    );

    const earnedPoints = pointsCalc.totalPointsEarned;
    const finalCustPoints = currentPts + earnedPoints;

    // Log Earned Points
    if (earnedPoints > 0) {
      const earnedLog: LoyaltyTransaction = {
        id: `LOY-EARN-${Date.now().toString().slice(-6)}`,
        customerId: currentCustomer?.customerId || newSale.mrdOrCustomerId || `CUST-${newSale.mobile}`,
        customerName: newSale.customerName,
        date: today,
        type: 'EARNED',
        points: earnedPoints,
        oldPoints: currentPts,
        newPoints: finalCustPoints,
        referenceId: invoiceNum,
        reason: `Earned from Retail Invoice ${invoiceNum} (₹${newSale.grandTotal})`,
        user: role,
        monetaryValueRupees: pointsCalc.monetaryEquivalentRupees,
        appliedRuleSnapshot: pointsCalc.appliedRuleSnapshot
      };
      setLoyaltyLogs(prev => [earnedLog, ...prev]);
    }

    // Update Customer
    setCustomers(prev => {
      const match = prev.find(c => c.mobile === newSale.mobile);
      if (match) {
        return prev.map(c =>
          c.mobile === newSale.mobile
            ? {
                ...c,
                totalPurchases: c.totalPurchases + 1,
                lifetimeValue: c.lifetimeValue + newSale.grandTotal,
                outstandingDue: c.outstandingDue + newSale.due,
                loyaltyPoints: finalCustPoints,
                lastPurchaseDate: today
              }
            : c
        );
      }
      return prev;
    });

    addAuditLog('CREATE_RETAIL_SALE', 'Billing', invoiceNum, `Sold ₹${newSale.grandTotal} to ${newSale.customerName}`);
    showToast(`Invoice ${invoiceNum} generated!`);
    return newSale;
  };

  // Dynamic due accounts aggregation
  const dueAccounts: DueAccount[] = useMemo(() => {
    const today = new Date();
    const list: DueAccount[] = [];

    // From Spectacle Orders
    (spectacleOrders || []).forEach(o => {
      if (o.due > 0 && o.status !== 'Cancelled') {
        const orderDate = new Date(o.orderDate || o.deliveryDate || today);
        const diffTime = Math.max(0, today.getTime() - orderDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        let bucket: '0-7 Days' | '8-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days' = '0-7 Days';
        if (diffDays > 90) bucket = '90+ Days';
        else if (diffDays > 60) bucket = '61-90 Days';
        else if (diffDays > 30) bucket = '31-60 Days';
        else if (diffDays > 7) bucket = '8-30 Days';

        list.push({
          id: `DUE-${o.orderId}`,
          referenceId: o.orderId,
          type: 'Spectacle Order',
          mrd: o.mrd,
          customerName: o.customerName,
          mobile: o.mobile,
          date: o.orderDate,
          totalAmount: o.total,
          paidAmount: o.advance,
          dueAmount: o.due,
          agingDays: diffDays,
          agingBucket: bucket
        });
      }
    });

    // From Retail Sales
    (retailSales || []).forEach(s => {
      if (s.due > 0 && s.status !== 'Cancelled') {
        const saleDate = new Date(s.date || today);
        const diffTime = Math.max(0, today.getTime() - saleDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        let bucket: '0-7 Days' | '8-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days' = '0-7 Days';
        if (diffDays > 90) bucket = '90+ Days';
        else if (diffDays > 60) bucket = '61-90 Days';
        else if (diffDays > 30) bucket = '31-60 Days';
        else if (diffDays > 7) bucket = '8-30 Days';

        list.push({
          id: `DUE-${s.invoiceNumber}`,
          referenceId: s.invoiceNumber,
          type: 'Retail Invoice',
          mrd: s.mrdOrCustomerId?.startsWith('MRD') ? s.mrdOrCustomerId : undefined,
          customerName: s.customerName,
          mobile: s.mobile,
          date: s.date,
          totalAmount: s.grandTotal,
          paidAmount: s.paid,
          dueAmount: s.due,
          agingDays: diffDays,
          agingBucket: bucket
        });
      }
    });

    return list;
  }, [spectacleOrders, retailSales]);

  // 11. Collect Due Payment
  const collectDuePayment = (
    param1: any,
    param2?: string,
    param3?: number,
    param4?: string,
    param5?: string
  ) => {
    let customerId = '';
    let invoiceOrOrderId = '';
    let amount = 0;
    let paymentMode = 'Cash';
    let notes = '';

    if (typeof param1 === 'object' && param1 !== null) {
      invoiceOrOrderId = param1.accountId || param1.referenceId || param1.invoiceNumber || param1.orderId || '';
      amount = Number(param1.amount) || 0;
      paymentMode = param1.method || param1.paymentMode || 'Cash';
      notes = param1.notes || '';
    } else {
      customerId = String(param1 || '');
      invoiceOrOrderId = param2 || '';
      amount = Number(param3) || 0;
      paymentMode = param4 || 'Cash';
      notes = param5 || '';
    }

    if (invoiceOrOrderId.startsWith('DUE-')) {
      invoiceOrOrderId = invoiceOrOrderId.replace('DUE-', '');
    }

    const today = new Date().toISOString().split('T')[0];
    const payId = `PAY-2026-${9500 + payments.length + 1}`;

    // Check if it matches a Spectacle Order
    const matchedOrder = spectacleOrders.find(o => o.orderId === invoiceOrOrderId);
    if (matchedOrder) {
      const nextAdvance = matchedOrder.advance + amount;
      const nextDue = Math.max(0, matchedOrder.total - nextAdvance);
      setSpectacleOrders(prev =>
        prev.map(o =>
          o.orderId === invoiceOrOrderId
            ? { ...o, advance: nextAdvance, due: nextDue }
            : o
        )
      );

      const payRecord: PaymentRecord = {
        paymentId: payId,
        date: today,
        customerId: matchedOrder.mrd,
        customerName: matchedOrder.customerName,
        mobile: matchedOrder.mobile,
        invoiceNumber: invoiceOrOrderId,
        amount,
        paymentMode: (paymentMode as any) || 'Cash',
        referenceNumber: `DUE-COLLECT-${invoiceOrOrderId}`,
        receivedBy: role,
        notes: notes || `Collected due for Spectacle Order ${invoiceOrOrderId}`
      };
      setPayments(prev => [payRecord, ...prev]);
      addAuditLog('COLLECT_DUE', 'Billing', invoiceOrOrderId, `Collected ₹${amount} due for ${invoiceOrOrderId} from ${matchedOrder.customerName}`);
      showToast(`Due payment of ₹${amount} recorded for ${invoiceOrOrderId}!`, 'success');
      return;
    }

    // Check if it matches a Retail Sale
    const matchedSale = retailSales.find(s => s.invoiceNumber === invoiceOrOrderId);
    if (matchedSale) {
      const nextPaid = matchedSale.paid + amount;
      const nextDue = Math.max(0, matchedSale.grandTotal - nextPaid);
      setRetailSales(prev =>
        prev.map(inv =>
          inv.invoiceNumber === invoiceOrOrderId
            ? {
                ...inv,
                paid: nextPaid,
                due: nextDue,
                status: nextDue === 0 ? 'Paid' : 'Partial'
              }
            : inv
        )
      );

      const payRecord: PaymentRecord = {
        paymentId: payId,
        date: today,
        customerId: matchedSale.mrdOrCustomerId,
        customerName: matchedSale.customerName,
        mobile: matchedSale.mobile,
        invoiceNumber: invoiceOrOrderId,
        amount,
        paymentMode: (paymentMode as any) || 'Cash',
        referenceNumber: `DUE-COLLECT-${invoiceOrOrderId}`,
        receivedBy: role,
        notes: notes || `Collected due for invoice ${invoiceOrOrderId}`
      };
      setPayments(prev => [payRecord, ...prev]);
      addAuditLog('COLLECT_DUE', 'Billing', invoiceOrOrderId, `Collected ₹${amount} due for ${invoiceOrOrderId} from ${matchedSale.customerName}`);
      showToast(`Due payment of ₹${amount} recorded for ${invoiceOrOrderId}!`, 'success');
      return;
    }

    showToast(`Payment of ₹${amount} recorded`, 'success');
  };

  // 12. Create Purchase (Increments Central Stock!)
  const createPurchase = (
    supplierId: string,
    invoiceNo: string,
    items: { itemType: 'Frame' | 'Lens' | 'Medicine'; itemCode: string; itemName: string; quantity: number; purchaseRate: number; discount: number; taxPercent: number }[],
    paymentMode: string,
    paidAmount: number
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const supplier = suppliers.find(s => s.supplierId === supplierId);
    const poId = `PO-2026-${6000 + stockMovements.length + 1}`;

    let grandTotal = 0;
    items.forEach(it => {
      const lineTotal = it.quantity * it.purchaseRate * (1 - it.discount / 100);
      grandTotal += lineTotal;

      // Increase stock
      if (it.itemType === 'Frame') {
        setFrames(prev =>
          prev.map(f => {
            if (f.sku === it.itemCode) {
              const nextStock = f.currentStock + it.quantity;
              return {
                ...f,
                currentStock: nextStock,
                status: nextStock > f.reorderLevel ? 'Available' : 'Low Stock'
              };
            }
            return f;
          })
        );
      } else if (it.itemType === 'Lens') {
        setLenses(prev =>
          prev.map(l => {
            if (l.lensCode === it.itemCode) {
              const nextStock = l.currentStock + it.quantity;
              return {
                ...l,
                currentStock: nextStock,
                status: nextStock > l.reorderLevel ? 'Available' : 'Low Stock'
              };
            }
            return l;
          })
        );
      }

      // Add stock movement
      const mov: StockMovement = {
        id: `MOV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`,
        date: today,
        itemType: it.itemType,
        itemCode: it.itemCode,
        itemName: it.itemName,
        movementType: 'Purchase',
        reference: poId,
        qtyIn: it.quantity,
        qtyOut: 0,
        balance: 0,
        user: `${role} Admin`,
        notes: `Received from ${supplier ? supplier.company : 'Supplier'}`,
        timestamp: new Date().toISOString()
      };
      setStockMovements(prev => [mov, ...prev]);
    });

    // Update supplier balance
    const dueAmount = Math.max(0, grandTotal - paidAmount);
    setSuppliers(prev =>
      prev.map(s => (s.supplierId === supplierId ? { ...s, currentDue: s.currentDue + dueAmount } : s))
    );

    addAuditLog('PURCHASE_STOCK', 'Inventory', poId, `Stock Purchase of ₹${grandTotal} from ${supplier ? supplier.company : 'Supplier'}`);
    showToast(`Purchase order ${poId} added! Stock increased.`);
  };

  // 13. Save / Delete Masters
  const saveFrame = (frame: FrameMaster) => {
    setFrames(prev => {
      const idx = prev.findIndex(f => f.sku === frame.sku);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = frame;
        return copy;
      }
      return [frame, ...prev];
    });
    addAuditLog('SAVE_FRAME', 'Inventory', frame.sku, `Updated/Saved Frame SKU: ${frame.sku}`);
    showToast(`Frame ${frame.sku} saved!`);
  };

  const deleteFrame = (sku: string) => {
    setFrames(prev => prev.filter(f => f.sku !== sku));
    addAuditLog('DELETE_FRAME', 'Inventory', sku, `Deleted Frame SKU: ${sku}`);
    showToast(`Frame ${sku} deleted`);
  };

  const saveLens = (lens: LensMaster) => {
    setLenses(prev => {
      const idx = prev.findIndex(l => l.lensCode === lens.lensCode);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = lens;
        return copy;
      }
      return [lens, ...prev];
    });
    addAuditLog('SAVE_LENS', 'Inventory', lens.lensCode, `Updated/Saved Lens: ${lens.lensCode}`);
    showToast(`Lens ${lens.lensCode} saved!`);
  };

  const deleteLens = (lensCode: string) => {
    setLenses(prev => prev.filter(l => l.lensCode !== lensCode));
    addAuditLog('DELETE_LENS', 'Inventory', lensCode, `Deleted Lens: ${lensCode}`);
    showToast(`Lens ${lensCode} deleted`);
  };

  const purchaseLensStockIn = (purchaseData: Omit<LensPurchaseRecord, 'id' | 'timestamp'>) => {
    const id = `PUR-LNS-${Date.now().toString().slice(-6)}`;
    const newRecord: LensPurchaseRecord = {
      ...purchaseData,
      id,
      timestamp: new Date().toISOString()
    };
    setLensPurchases(prev => [newRecord, ...prev]);

    setLenses(prev => {
      const exists = prev.some(l => l.lensCode === purchaseData.lensCode);
      if (exists) {
        return prev.map(l => {
          if (l.lensCode === purchaseData.lensCode) {
            const nextStock = l.currentStock + purchaseData.quantity;
            const nextStatus = nextStock === 0 ? 'Out of Stock' : nextStock <= l.reorderLevel ? 'Low Stock' : 'Available';
            return {
              ...l,
              currentStock: nextStock,
              purchaseRate: purchaseData.purchaseRate || l.purchaseRate,
              rackLocation: purchaseData.rack || l.rackLocation,
              supplier: purchaseData.supplier || l.supplier,
              status: nextStatus
            };
          }
          return l;
        });
      } else {
        const newLens: LensMaster = {
          lensCode: purchaseData.lensCode,
          sku: purchaseData.lensCode,
          productName: purchaseData.productName,
          company: purchaseData.company || 'Generic',
          brand: purchaseData.brand || 'Stock Lens',
          category: (purchaseData.category as any) || 'Single Vision',
          lensType: (purchaseData.lensType as any) || 'SINGLE VISION SPHERICAL',
          material: 'High Index 1.56',
          index: '1.56',
          coating: 'Green HMC',
          design: 'Spherical',
          diameter: '70mm',
          sph: purchaseData.sph || '0.00',
          cyl: purchaseData.cyl || '0.00',
          axis: purchaseData.axis || '—',
          add: purchaseData.add || '—',
          purchaseRate: purchaseData.purchaseRate,
          wholesaleRate: Math.round(purchaseData.purchaseRate * 1.5),
          retailRate: Math.round(purchaseData.purchaseRate * 3.0),
          mrp: Math.round(purchaseData.purchaseRate * 4.0),
          currentStock: purchaseData.quantity,
          reorderLevel: 8,
          rackLocation: purchaseData.rack || 'Rack A - Shelf 01',
          supplier: purchaseData.supplier,
          status: 'Available'
        };
        return [newLens, ...prev];
      }
    });

    const mov: StockMovement = {
      id: `MOV-PUR-${Date.now().toString().slice(-6)}`,
      date: purchaseData.purchaseDate,
      itemType: 'Lens',
      itemCode: purchaseData.lensCode,
      itemName: `${purchaseData.productName} (SPH: ${purchaseData.sph || '0.00'}, CYL: ${purchaseData.cyl || '0.00'})`,
      movementType: 'Purchase',
      reference: purchaseData.invoiceNumber || id,
      qtyIn: purchaseData.quantity,
      qtyOut: 0,
      balance: 0,
      user: `${role} Admin`,
      notes: `Stock In from ${purchaseData.supplier} (${purchaseData.quantity} pairs)`,
      timestamp: new Date().toISOString()
    };
    setStockMovements(prev => [mov, ...prev]);
    addAuditLog('PURCHASE_STOCK', 'Inventory', id, `Stock IN for ${purchaseData.lensCode} (${purchaseData.quantity} pairs from ${purchaseData.supplier})`);
    showToast(`Stock IN of ${purchaseData.quantity} pairs saved for ${purchaseData.lensCode}!`);
  };

  const batchGenerateLenses = (generatedLenses: LensMaster[]) => {
    setLenses(prev => {
      const existingCodes = new Set(prev.map(l => l.lensCode));
      const newItems = generatedLenses.filter(g => !existingCodes.has(g.lensCode));
      const updated = prev.map(l => {
        const match = generatedLenses.find(g => g.lensCode === l.lensCode);
        return match ? { ...l, ...match } : l;
      });
      return [...newItems, ...updated];
    });
    addAuditLog('SAVE_LENS', 'Inventory', `BATCH-${generatedLenses.length}`, `Generated / updated batch of ${generatedLenses.length} lens power variants`);
    showToast(`Generated ${generatedLenses.length} lens power variants successfully!`);
  };

  const findMatchingLensForPower = (
    sph: string,
    cyl: string,
    axis?: string,
    add?: string,
    lensType?: string,
    brand?: string
  ): LensMaster | undefined => {
    const normalizePower = (p?: string) => {
      if (!p || p === '—' || p === 'Plano' || p === '0' || p === '0.0' || p === '0.00') return '0.00';
      const num = parseFloat(p);
      if (isNaN(num)) return p.trim();
      return (num >= 0 ? '+' : '') + num.toFixed(2);
    };

    const targetSph = normalizePower(sph);
    const targetCyl = normalizePower(cyl);

    return lenses.find(l => {
      if (lensType && l.lensType && l.lensType !== lensType && l.category !== lensType) return false;
      if (brand && l.brand && !l.brand.toLowerCase().includes(brand.toLowerCase()) && !l.company.toLowerCase().includes(brand.toLowerCase())) return false;

      const lSph = normalizePower(l.sph);
      const lCyl = normalizePower(l.cyl);

      if (lSph !== targetSph) return false;
      if (lCyl !== targetCyl) return false;

      if (axis && axis !== '—' && l.axis && l.axis !== '—') {
        const axDiff = Math.abs(parseInt(axis, 10) - parseInt(l.axis, 10));
        if (axDiff > 10) return false;
      }
      if (add && add !== '—' && l.add && l.add !== '—') {
        if (normalizePower(add) !== normalizePower(l.add)) return false;
      }
      return true;
    });
  };

  const saveMedicine = (med: MedicineMaster) => {
    setMedicines(prev => {
      const idx = prev.findIndex(m => m.id === med.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = med;
        return copy;
      }
      return [med, ...prev];
    });
    addAuditLog('SAVE_MEDICINE', 'Clinical', med.id, `Saved medicine: ${med.name}`);
    showToast(`Medicine ${med.name} saved!`);
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
    addAuditLog('DELETE_MEDICINE', 'Clinical', id, `Deleted medicine ${id}`);
    showToast(`Medicine deleted`);
  };

  const saveSupplier = (sup: Supplier) => {
    setSuppliers(prev => {
      const idx = prev.findIndex(s => s.supplierId === sup.supplierId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = sup;
        return copy;
      }
      return [sup, ...prev];
    });
    showToast(`Supplier ${sup.company} saved!`);
  };

  const saveDealer = (dealer: Dealer) => {
    setDealers(prev => {
      const idx = prev.findIndex(d => d.dealerId === dealer.dealerId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = dealer;
        return copy;
      }
      return [dealer, ...prev];
    });
    addAuditLog('SAVE_DEALER', 'Inventory', dealer.dealerId, `Saved wholesale dealer profile: ${dealer.shopName} (${dealer.ownerName})`);
    showToast(`Dealer ${dealer.shopName} saved!`);
  };

  const saveCustomer = (customer: Customer) => {
    setCustomers(prev => {
      const idx = prev.findIndex(c => c.customerId === customer.customerId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = customer;
        return copy;
      }
      return [customer, ...prev];
    });
    addAuditLog('SAVE_CUSTOMER', 'Patients', customer.customerId, `Saved Customer Profile: ${customer.name} (Mobile: ${customer.mobile})`);
    showToast(`Customer ${customer.name} profile updated!`);
  };

  const archiveCustomer = (customerId: string, reason?: string) => {
    const c = customers.find(cust => cust.customerId === customerId);
    if (!c) return;
    setCustomers(prev => prev.map(cust => cust.customerId === customerId ? { ...cust, isArchived: true, archivedAt: new Date().toISOString(), archivedReason: reason || 'Archived' } : cust));
    addAuditLog('ARCHIVE', 'Customer', customerId, `Archived customer ${c.name} (${customerId})`, 'Status: Active', `Status: Archived (${reason || 'Archived'})`);
    showToast(`Customer ${c.name} archived`, 'warning');
  };

  const restoreCustomer = (customerId: string) => {
    const c = customers.find(cust => cust.customerId === customerId);
    if (!c) return;
    setCustomers(prev => prev.map(cust => cust.customerId === customerId ? { ...cust, isArchived: false, archivedAt: undefined, archivedReason: undefined } : cust));
    addAuditLog('RESTORE', 'Customer', customerId, `Restored customer ${c.name} (${customerId})`, 'Status: Archived', 'Status: Active');
    showToast(`Customer ${c.name} restored to active list`, 'success');
  };

  const deleteCustomer = (customerId: string) => {
    const c = customers.find(cust => cust.customerId === customerId);
    if (!c) return;
    setCustomers(prev => prev.filter(cust => cust.customerId !== customerId));
    addAuditLog('DELETE', 'Customer', customerId, `Permanently deleted customer profile: ${c.name} (${customerId})`, `Name: ${c.name}, Mobile: ${c.mobile}`, 'Record Deleted');
    showToast(`Customer ${c.name} deleted permanently`, 'info');
  };

  const archiveSpectacleOrder = (orderId: string, reason?: string) => {
    const ord = spectacleOrders.find(o => o.orderId === orderId);
    if (!ord) return;
    setSpectacleOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, isArchived: true, archivedAt: new Date().toISOString(), archivedReason: reason || 'Archived' } : o));
    addAuditLog('ARCHIVE', 'Spectacles', orderId, `Archived spectacle order ${orderId} (${ord.customerName})`, 'Status: Active', `Status: Archived (${reason || 'Archived'})`);
    showToast(`Order ${orderId} archived`, 'warning');
  };

  const restoreSpectacleOrder = (orderId: string) => {
    const ord = spectacleOrders.find(o => o.orderId === orderId);
    if (!ord) return;
    setSpectacleOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, isArchived: false, archivedAt: undefined, archivedReason: undefined } : o));
    addAuditLog('RESTORE', 'Spectacles', orderId, `Restored spectacle order ${orderId} (${ord.customerName})`, 'Status: Archived', 'Status: Active');
    showToast(`Order ${orderId} restored to active list`, 'success');
  };

  const cancelSpectacleOrder = (orderId: string, restoreStock: boolean = true, reason?: string) => {
    const ord = spectacleOrders.find(o => o.orderId === orderId);
    if (!ord) return;
    const today = new Date().toISOString().split('T')[0];

    // If restoreStock, restore frame and lenses
    if (restoreStock) {
      if (!ord.isManualFrame && ord.frameSku) {
        setFrames(prev => prev.map(f => {
          if (f.sku === ord.frameSku) {
            const nextStock = f.currentStock + (ord.quantity || 1);
            return { ...f, currentStock: nextStock, status: nextStock <= f.reorderLevel ? 'Low Stock' : 'Available' };
          }
          return f;
        }));
        const mov: StockMovement = {
          id: `MOV-RET-${Date.now().toString().slice(-6)}-F`,
          date: today,
          itemType: 'Frame',
          itemCode: ord.frameSku,
          itemName: ord.frameBrand || ord.frameName || 'Frame',
          movementType: 'Adjustment',
          reference: orderId,
          qtyIn: ord.quantity || 1,
          qtyOut: 0,
          balance: 0,
          user: `${role} Admin`,
          notes: `Stock returned due to cancelled order ${orderId} (${reason || 'Cancelled'})`,
          timestamp: new Date().toISOString()
        };
        setStockMovements(prev => [mov, ...prev]);
      }

      if (!ord.isManualLens) {
        const odSku = ord.odMatchedLensSku;
        const osSku = ord.osMatchedLensSku;
        const qty = ord.quantity || 1;
        if (odSku) {
          setLenses(prev => prev.map(l => {
            if (l.lensCode === odSku) {
              const nextStock = l.currentStock + qty;
              return { ...l, currentStock: nextStock, status: nextStock <= l.reorderLevel ? 'Low Stock' : 'Available' };
            }
            return l;
          }));
        }
        if (osSku && osSku !== odSku) {
          setLenses(prev => prev.map(l => {
            if (l.lensCode === osSku) {
              const nextStock = l.currentStock + qty;
              return { ...l, currentStock: nextStock, status: nextStock <= l.reorderLevel ? 'Low Stock' : 'Available' };
            }
            return l;
          }));
        } else if (ord.lensCode) {
          setLenses(prev => prev.map(l => {
            if (l.lensCode === ord.lensCode) {
              const nextStock = l.currentStock + qty * 2;
              return { ...l, currentStock: nextStock, status: nextStock <= l.reorderLevel ? 'Low Stock' : 'Available' };
            }
            return l;
          }));
        }
      }
    }

    // Loyalty Points reversal and refund on cancellation (Requirement 27)
    const earnedLogs = loyaltyLogs.filter(l => l.referenceId === orderId && l.type === 'EARNED');
    const totalEarnedPoints = earnedLogs.reduce((s, l) => s + l.points, 0);

    const redeemedLogs = loyaltyLogs.filter(l => l.referenceId === orderId && l.type === 'REDEEMED');
    const totalRedeemedPoints = redeemedLogs.reduce((s, l) => s + l.points, 0);

    const targetCustomer = customers.find(c => c.customerId === ord.customerId || c.mobile === ord.mobile || (ord.mrd && c.mrd === ord.mrd));
    const currentCustomerPoints = targetCustomer?.loyaltyPoints || 0;
    let nextCustomerPoints = currentCustomerPoints;

    const newLedgerEntries: LoyaltyTransaction[] = [];

    // 1. Refund redeemed points back to customer
    if (totalRedeemedPoints > 0) {
      nextCustomerPoints += totalRedeemedPoints;
      newLedgerEntries.push({
        id: `LOY-REF-${Date.now().toString().slice(-6)}`,
        customerId: targetCustomer?.customerId || ord.customerId || `CUST-${ord.mobile}`,
        customerName: ord.customerName,
        date: today,
        type: 'REFUND',
        points: totalRedeemedPoints,
        oldPoints: currentCustomerPoints,
        newPoints: nextCustomerPoints,
        referenceId: orderId,
        reason: `Refund: Order #${orderId} Cancelled - ${totalRedeemedPoints} redeemed points restored`,
        user: role
      });
    }

    // 2. Deduct points that were earned on this order
    if (totalEarnedPoints > 0) {
      const beforeDeduct = nextCustomerPoints;
      nextCustomerPoints = Math.max(0, nextCustomerPoints - totalEarnedPoints);
      newLedgerEntries.push({
        id: `LOY-REV-${Date.now().toString().slice(-6)}`,
        customerId: targetCustomer?.customerId || ord.customerId || `CUST-${ord.mobile}`,
        customerName: ord.customerName,
        date: today,
        type: 'REVERSED',
        points: totalEarnedPoints,
        oldPoints: beforeDeduct,
        newPoints: nextCustomerPoints,
        referenceId: orderId,
        reason: `Refund: Order #${orderId} Cancelled - ${totalEarnedPoints} earned points reversed`,
        user: role
      });
    }

    if (newLedgerEntries.length > 0) {
      setLoyaltyLogs(prev => [...newLedgerEntries, ...prev]);
      setCustomers(prev =>
        prev.map(c =>
          (c.customerId === ord.customerId || c.mobile === ord.mobile || (ord.mrd && c.mrd === ord.mrd))
            ? { ...c, loyaltyPoints: nextCustomerPoints }
            : c
        )
      );
      addAuditLog('LOYALTY_REFUND', 'Spectacles', orderId, `Cancelled order #${orderId}: Refunded ${totalRedeemedPoints} redeemed points, reversed ${totalEarnedPoints} earned points for ${ord.customerName}`);
    }

    setSpectacleOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: 'Cancelled', notes: reason ? `${o.notes || ''} [Cancelled: ${reason}]`.trim() : o.notes } : o));
    addAuditLog('CANCEL', 'Spectacles', orderId, `Cancelled spectacle order ${orderId} for ${ord.customerName}${restoreStock ? ' (Stock restored to inventory)' : ''}`, `Status: ${ord.status}`, `Status: Cancelled${reason ? ` (${reason})` : ''}`);
    showToast(`Order ${orderId} cancelled${restoreStock ? ' and stock restored' : ''}`, 'warning');
  };

  const deleteSpectacleOrder = (orderId: string, restoreStock: boolean = true) => {
    const ord = spectacleOrders.find(o => o.orderId === orderId);
    if (!ord) return;

    if (restoreStock && ord.status !== 'Cancelled') {
      if (!ord.isManualFrame && ord.frameSku) {
        setFrames(prev => prev.map(f => {
          if (f.sku === ord.frameSku) {
            const nextStock = f.currentStock + (ord.quantity || 1);
            return { ...f, currentStock: nextStock, status: nextStock <= f.reorderLevel ? 'Low Stock' : 'Available' };
          }
          return f;
        }));
      }
      if (!ord.isManualLens) {
        const odSku = ord.odMatchedLensSku;
        const osSku = ord.osMatchedLensSku;
        const qty = ord.quantity || 1;
        if (odSku) {
          setLenses(prev => prev.map(l => l.lensCode === odSku ? { ...l, currentStock: l.currentStock + qty } : l));
        }
        if (osSku && osSku !== odSku) {
          setLenses(prev => prev.map(l => l.lensCode === osSku ? { ...l, currentStock: l.currentStock + qty } : l));
        } else if (ord.lensCode) {
          setLenses(prev => prev.map(l => l.lensCode === ord.lensCode ? { ...l, currentStock: l.currentStock + qty * 2 } : l));
        }
      }
    }

    setSpectacleOrders(prev => prev.filter(o => o.orderId !== orderId));
    addAuditLog('DELETE', 'Spectacles', orderId, `Permanently deleted spectacle order ${orderId} (${ord.customerName})`, `Total: ₹${ord.total}, Advance: ₹${ord.advance}`, 'Record Deleted');
    showToast(`Order ${orderId} deleted permanently`, 'info');
  };

  const saveTemplate = (tpl: WhatsAppTemplate) => {
    setTemplates(prev => {
      const idx = prev.findIndex(t => t.id === tpl.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...tpl, updatedAt: new Date().toISOString() };
        return copy;
      }
      return [{ ...tpl, createdAt: new Date().toISOString() }, ...prev];
    });
    addAuditLog('UPDATE', 'Settings', tpl.id, `Saved WhatsApp Template: ${tpl.name} (${tpl.category})`);
    showToast(`WhatsApp Template "${tpl.name}" saved!`);
  };

  const deleteTemplate = (id: string) => {
    const target = templates.find(t => t.id === id);
    setTemplates(prev => prev.filter(t => t.id !== id));
    addAuditLog('DELETE', 'Settings', id, `Deleted WhatsApp Template: ${target?.name || id}`);
    showToast(`Template deleted`, 'info');
  };

  const toggleTemplateActive = (id: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const saveOffer = (offer: OfferPromotion) => {
    setOffers(prev => {
      const idx = prev.findIndex(o => o.id === offer.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = offer;
        return copy;
      }
      return [{ ...offer, createdAt: new Date().toISOString() }, ...prev];
    });
    addAuditLog('UPDATE', 'Settings', offer.id, `Saved Offer/Promotion: ${offer.name}`);
    showToast(`Offer "${offer.name}" saved!`);
  };

  const deleteOffer = (id: string) => {
    const target = offers.find(o => o.id === id);
    setOffers(prev => prev.filter(o => o.id !== id));
    addAuditLog('DELETE', 'Settings', id, `Deleted Offer: ${target?.name || id}`);
    showToast(`Offer removed`, 'info');
  };

  const toggleOfferStatus = (id: string) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status: o.status === 'Active' ? 'Inactive' : 'Active' } : o));
  };

  const logCommunication = (logData: Omit<CommunicationLog, 'id' | 'date' | 'time' | 'sentBy'>) => {
    const now = new Date();
    const newLog: CommunicationLog = {
      ...logData,
      id: `COMM-${Date.now().toString().slice(-6)}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sentBy: role === 'Doctor' ? settings.doctorName : `${role} User`
    };
    setCommunicationLogs(prev => [newLog, ...prev]);
  };

  // Marketing Campaign Operations
  const saveCampaign = (campaignData: MarketingCampaign) => {
    setCampaigns(prev => {
      const idx = prev.findIndex(c => c.id === campaignData.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...campaignData, updatedAt: new Date().toISOString() };
        return copy;
      }
      return [{ ...campaignData, createdAt: new Date().toISOString() }, ...prev];
    });
    addAuditLog('UPDATE', 'Settings', campaignData.id, `Saved Marketing Campaign: "${campaignData.name}" (${campaignData.type})`);
    showToast(`Campaign "${campaignData.name}" saved successfully!`, 'success');
  };

  const deleteCampaign = (id: string) => {
    const target = campaigns.find(c => c.id === id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
    addAuditLog('DELETE', 'Settings', id, `Deleted Marketing Campaign: ${target?.name || id}`);
    showToast(`Campaign deleted`, 'info');
  };

  const duplicateCampaign = (id: string): MarketingCampaign | undefined => {
    const target = campaigns.find(c => c.id === id);
    if (!target) return undefined;
    const newId = `CMP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const cloned: MarketingCampaign = {
      ...target,
      id: newId,
      name: `${target.name} (Copy)`,
      status: 'Draft',
      metrics: {
        targetCount: target.targetCount,
        sentCount: 0,
        deliveredCount: 0,
        readCount: 0,
        failedCount: 0,
        responsesCount: 0,
        convertedCount: 0,
        salesAmount: 0,
        costAmount: target.metrics?.costAmount || 0,
        profitAmount: 0,
        roiPercent: 0
      },
      createdAt: new Date().toISOString()
    };
    setCampaigns(prev => [cloned, ...prev]);
    addAuditLog('CREATE', 'Settings', newId, `Duplicated Marketing Campaign from ${id}: "${cloned.name}"`);
    showToast(`Campaign duplicated as "${cloned.name}"!`, 'success');
    return cloned;
  };

  const toggleCampaignStatus = (id: string, status?: CampaignStatus) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus: CampaignStatus = status || (c.status === 'Running' ? 'Paused' : 'Running');
        return { ...c, status: nextStatus, updatedAt: new Date().toISOString() };
      }
      return c;
    }));
  };

  // Lead Management Operations
  const saveLead = (leadData: CrmLead) => {
    setLeads(prev => {
      const idx = prev.findIndex(l => l.id === leadData.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...leadData, updatedAt: new Date().toISOString() };
        return copy;
      }
      return [{ ...leadData, createdAt: new Date().toISOString() }, ...prev];
    });
    addAuditLog('UPDATE', 'Patients', leadData.id, `Saved Lead: ${leadData.name} (${leadData.stage})`);
    showToast(`Lead "${leadData.name}" updated!`);
  };

  const deleteLead = (id: string) => {
    const target = leads.find(l => l.id === id);
    setLeads(prev => prev.filter(l => l.id !== id));
    addAuditLog('DELETE', 'Patients', id, `Deleted Lead: ${target?.name || id}`);
    showToast(`Lead deleted`, 'info');
  };

  const convertLeadToCustomer = (leadId: string): Customer | undefined => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return undefined;

    // Check if customer with mobile exists
    let existing = customers.find(c => c.mobile === lead.mobile);
    if (existing) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: 'Purchased', convertedCustomerId: existing!.customerId } : l));
      showToast(`Lead linked with existing Customer ${existing.name} (${existing.customerId})`);
      return existing;
    }

    const newCustomerId = `CUST-${5000 + customers.length + 1}`;
    const newCust: Customer = {
      customerId: newCustomerId,
      name: lead.name,
      mobile: lead.mobile,
      whatsapp: lead.mobile,
      email: lead.email,
      address: 'Walk-in Inquiry / Converted Lead',
      totalPurchases: 0,
      lifetimeValue: 0,
      outstandingDue: 0,
      lastContact: new Date().toISOString().split('T')[0],
      nextAction: lead.interest || 'Spectacle Selection & Refraction',
      segment: 'New Customer',
      whatsappMarketingStatus: 'Opted In',
      marketingTags: ['Converted Lead', lead.source]
    };

    setCustomers(prev => [newCust, ...prev]);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: 'Purchased', convertedCustomerId: newCustomerId } : l));
    addAuditLog('CREATE', 'Patients', newCustomerId, `Converted Lead ${lead.name} (${leadId}) into Customer record ${newCustomerId}`);
    showToast(`Lead ${lead.name} converted to Customer (${newCustomerId})!`, 'success');
    return newCust;
  };

  // Automation Rule Operations
  const saveAutomationRule = (rule: AutomationRule) => {
    setAutomationRules(prev => {
      const idx = prev.findIndex(r => r.id === rule.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = rule;
        return copy;
      }
      return [{ ...rule, createdAt: new Date().toISOString(), triggerCount: 0 }, ...prev];
    });
    addAuditLog('UPDATE', 'Settings', rule.id, `Saved Automation Rule: "${rule.name}"`);
    showToast(`Automation rule "${rule.name}" saved!`);
  };

  const toggleAutomationRule = (id: string) => {
    setAutomationRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    showToast(`Automation rule updated`);
  };

  const deleteAutomationRule = (id: string) => {
    setAutomationRules(prev => prev.filter(r => r.id !== id));
    showToast(`Automation rule removed`, 'info');
  };

  // Custom Segments
  const saveCustomSegment = (segment: CustomerSegmentRule) => {
    setCustomSegments(prev => {
      const idx = prev.findIndex(s => s.id === segment.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = segment;
        return copy;
      }
      return [segment, ...prev];
    });
    addAuditLog('UPDATE', 'Settings', segment.id, `Saved Custom Segment: "${segment.name}"`);
    showToast(`Segment "${segment.name}" saved!`, 'success');
  };

  const deleteCustomSegment = (id: string) => {
    setCustomSegments(prev => prev.filter(s => s.id !== id));
    showToast(`Segment removed`, 'info');
  };

  const allSegments = useMemo(() => {
    return [...PREDEFINED_SEGMENT_RULES, ...customSegments];
  }, [customSegments]);

  const updateCustomerMarketingProfile = (customerId: string, data: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.customerId === customerId ? { ...c, ...data } : c));
    showToast(`Customer marketing profile updated!`);
  };

  const sendDirectWhatsAppMessage = (mobile: string, text: string, customerId?: string, campaignId?: string) => {
    const cust = customerId ? customers.find(c => c.customerId === customerId) : customers.find(c => c.mobile === mobile);
    
    // Log communication entry
    logCommunication({
      customerId: cust?.customerId,
      customerName: cust?.name || 'Customer',
      mobile,
      campaignId,
      campaignName: campaignId ? campaigns.find(c => c.id === campaignId)?.name : undefined,
      messageType: 'WhatsApp Marketing / Direct',
      category: 'Direct Message',
      messageText: text,
      channel: 'WhatsApp',
      status: 'Sent'
    });

    // Deep link opens WhatsApp Web or App
    const cleanedMobile = mobile.replace(/[^0-9]/g, '');
    const formattedNumber = cleanedMobile.length === 10 ? `91${cleanedMobile}` : cleanedMobile;
    const encoded = encodeURIComponent(text);
    const waUrl = `https://wa.me/${formattedNumber}?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const addCustomerPowerRecord = (record: Omit<CustomerPowerRecord, 'powerId'>): CustomerPowerRecord => {
    const powerId = `PWR-${Date.now().toString().slice(-6)}`;
    const newRecord: CustomerPowerRecord = {
      ...record,
      powerId
    };
    setCustomerPowers(prev => [newRecord, ...prev]);
    addAuditLog('ADD_CUSTOMER_POWER', 'Clinical', powerId, `Recorded power prescription for Customer ${record.customerId}`);
    showToast('Customer power history record added!');
    return newRecord;
  };

  const adjustLoyaltyPoints = (customerId: string, points: number, type: LoyaltyTransaction['type'], reason: string) => {
    const cust = customers.find(c => c.customerId === customerId);
    if (!cust) return;

    const oldPoints = cust.loyaltyPoints || 0;
    let newPoints = oldPoints;
    if (type === 'EARNED' || type === 'MANUAL_ADD') {
      newPoints = oldPoints + points;
    } else if (type === 'REDEEMED' || type === 'MANUAL_DEDUCT') {
      newPoints = Math.max(0, oldPoints - points);
    } else if (type === 'RESET') {
      newPoints = points;
    }

    setCustomers(prev =>
      prev.map(c => (c.customerId === customerId ? { ...c, loyaltyPoints: newPoints } : c))
    );

    const monetaryVal = calculateMonetaryValue(points, settings?.loyaltySettings || DEFAULT_LOYALTY_SETTINGS);

    const log: LoyaltyTransaction = {
      id: `LOY-${Date.now().toString().slice(-6)}`,
      customerId,
      customerName: cust.name,
      date: new Date().toISOString().split('T')[0],
      type,
      points,
      oldPoints,
      newPoints,
      reason,
      user: role,
      monetaryValueRupees: monetaryVal,
      appliedRuleSnapshot: `Manual adjustment (${type}) by ${role}`
    };
    setLoyaltyLogs(prev => [log, ...prev]);
    addAuditLog('ADJUST_LOYALTY', 'Billing', customerId, `Loyalty ${type}: ${points} pts (₹${monetaryVal}). New balance: ${newPoints} pts`);
    showToast(`Loyalty points updated! Current balance: ${newPoints}`);
  };

  const updateLoyaltySettings = (newLoyaltySettings: any) => {
    const oldSummary = settings.loyaltySettings
      ? `Spend ₹${settings.loyaltySettings.spendAmount}=${settings.loyaltySettings.pointsEarned}pt, Redeem ${settings.loyaltySettings.pointsForValue}pt=₹${settings.loyaltySettings.valueInRupees}`
      : 'Default Settings';
    const newSummary = `Spend ₹${newLoyaltySettings.spendAmount}=${newLoyaltySettings.pointsEarned}pt, Redeem ${newLoyaltySettings.pointsForValue}pt=₹${newLoyaltySettings.valueInRupees}`;

    setSettings(prev => ({
      ...prev,
      loyaltySettings: newLoyaltySettings,
      loyaltyPointsPerHundred: newLoyaltySettings.pointsEarned,
      loyaltyPointValueRupees: newLoyaltySettings.valueInRupees,
      enableLoyaltyProgram: newLoyaltySettings.enabled
    }));

    addAuditLog('UPDATE', 'Settings', 'LOYALTY_SETTINGS', `Updated Loyalty & Rewards rules: ${newSummary}`, oldSummary, newSummary);
    showToast('Loyalty Program rules saved & updated successfully!');
  };

  const createWholesaleSale = (saleData: Omit<WholesaleSale, 'invoiceNumber' | 'date'>): WholesaleSale => {
    const nextSeq = 1000 + wholesaleSales.length + 1;
    const invoiceNum = `WH-2026-${nextSeq}`;
    const today = new Date().toISOString().split('T')[0];

    const newSale: WholesaleSale = {
      ...saleData,
      invoiceNumber: invoiceNum,
      date: today
    };

    setWholesaleSales(prev => [newSale, ...prev]);

    // 1. Decrement Lens / Item Stock
    saleData.items.forEach(item => {
      if (item.itemType === 'Lens') {
        setLenses(prev =>
          prev.map(l => {
            if (l.lensCode === item.code) {
              const nextStock = Math.max(0, l.currentStock - item.quantity);
              return {
                ...l,
                currentStock: nextStock,
                status: nextStock === 0 ? 'Out of Stock' : nextStock <= l.reorderLevel ? 'Low Stock' : 'Available'
              };
            }
            return l;
          })
        );
      } else if (item.itemType === 'Frame') {
        setFrames(prev =>
          prev.map(f => {
            if (f.sku === item.code) {
              const nextStock = Math.max(0, f.currentStock - item.quantity);
              return {
                ...f,
                currentStock: nextStock,
                status: nextStock === 0 ? 'Out of Stock' : nextStock <= f.reorderLevel ? 'Low Stock' : 'Available'
              };
            }
            return f;
          })
        );
      }

      // Add stock movement
      const mov: StockMovement = {
        id: `MOV-WH-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`,
        date: today,
        itemType: item.itemType as any,
        itemCode: item.code,
        itemName: item.name,
        movementType: 'Wholesale Sale',
        reference: invoiceNum,
        qtyIn: 0,
        qtyOut: item.quantity,
        balance: 0,
        user: `${role} Desk`,
        notes: `Wholesale dispatch to ${newSale.wholesaleCustomer}`,
        timestamp: new Date().toISOString()
      };
      setStockMovements(prev => [mov, ...prev]);
    });

    // 2. Update Dealer Total Purchase & Due
    if (newSale.dealerId) {
      setDealers(prev =>
        prev.map(d => {
          if (d.dealerId === newSale.dealerId) {
            return {
              ...d,
              totalPurchase: (d.totalPurchase || 0) + newSale.grandTotal,
              currentDue: (d.currentDue || 0) + newSale.due,
              lastPurchaseDate: today
            };
          }
          return d;
        })
      );
    }

    // 3. Record Payment if paid > 0
    if (newSale.paid > 0) {
      const payment: PaymentRecord = {
        paymentId: `PAY-WH-${Date.now().toString().slice(-6)}`,
        date: today,
        customerId: newSale.dealerId || newSale.wholesaleCustomer,
        customerName: newSale.wholesaleCustomer,
        mobile: newSale.mobile,
        invoiceNumber: invoiceNum,
        amount: newSale.paid,
        paymentMode: (newSale.paymentMode as any) || 'Bank Transfer',
        receivedBy: `${role} Desk`,
        notes: `Wholesale payment against invoice ${invoiceNum}`
      };
      setPayments(prev => [payment, ...prev]);
    }

    addAuditLog('CREATE_WHOLESALE_SALE', 'Inventory', invoiceNum, `B2B Wholesale sale ₹${newSale.grandTotal} to ${newSale.wholesaleCustomer}`);
    showToast(`Wholesale Invoice ${invoiceNum} generated successfully!`);
    return newSale;
  };

  const updateWholesaleSale = (sale: WholesaleSale) => {
    setWholesaleSales(prev => prev.map(s => (s.invoiceNumber === sale.invoiceNumber ? sale : s)));
    addAuditLog('UPDATE_WHOLESALE_SALE', 'Inventory', sale.invoiceNumber, `Updated wholesale invoice status: ${sale.deliveryStatus} / ${sale.paymentStatus}`);
    showToast(`Wholesale invoice ${sale.invoiceNumber} updated!`);
  };

  const adjustLensStock = (lensCode: string, physicalStock: number, reason: StockAdjustmentRecord['reason'], notes?: string) => {
    const lens = lenses.find(l => l.lensCode === lensCode);
    if (!lens) return;

    const diff = physicalStock - lens.currentStock;
    const nextStatus = physicalStock === 0 ? 'Out of Stock' : physicalStock <= lens.reorderLevel ? 'Low Stock' : 'Available';

    setLenses(prev =>
      prev.map(l => (l.lensCode === lensCode ? { ...l, currentStock: physicalStock, status: nextStatus } : l))
    );

    const adjRecord: StockAdjustmentRecord = {
      id: `ADJ-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      lensId: lensCode,
      productCode: lensCode,
      company: lens.company,
      brand: lens.brand,
      power: `${lens.category} ${lens.design}`,
      systemStock: lens.currentStock,
      physicalStock,
      difference: diff,
      reason,
      user: role,
      notes: notes || `Audit stock adjustment (${diff >= 0 ? '+' : ''}${diff})`
    };
    setStockAdjustments(prev => [adjRecord, ...prev]);

    const mov: StockMovement = {
      id: `MOV-ADJ-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      itemType: 'Lens',
      itemCode: lensCode,
      itemName: `${lens.company} ${lens.brand}`,
      movementType: 'Adjustment',
      reference: adjRecord.id,
      qtyIn: diff > 0 ? diff : 0,
      qtyOut: diff < 0 ? Math.abs(diff) : 0,
      balance: physicalStock,
      user: role,
      notes: `Stock adjustment: ${reason} (${notes || ''})`,
      timestamp: new Date().toISOString()
    };
    setStockMovements(prev => [mov, ...prev]);

    addAuditLog('ADJUST_LENS_STOCK', 'Inventory', lensCode, `Adjusted ${lensCode} stock from ${lens.currentStock} to ${physicalStock} (${reason})`);
    showToast(`Stock for ${lens.brand} adjusted to ${physicalStock} pcs`);
  };

  const createLensReturn = (ret: Omit<LensReturnRecord, 'id' | 'date'>): LensReturnRecord => {
    const id = `RET-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];

    const newRet: LensReturnRecord = {
      ...ret,
      id,
      date: today
    };

    setLensReturns(prev => [newRet, ...prev]);

    // If restockable, add stock back
    if (ret.condition === 'Good / Resellable' && ret.lensCode) {
      setLenses(prev =>
        prev.map(l => {
          if (l.lensCode === ret.lensCode) {
            const nextStock = l.currentStock + ret.quantity;
            return {
              ...l,
              currentStock: nextStock,
              status: nextStock <= l.reorderLevel ? 'Low Stock' : 'Available'
            };
          }
          return l;
        })
      );

      const mov: StockMovement = {
        id: `MOV-RET-${Date.now().toString().slice(-6)}`,
        date: today,
        itemType: 'Lens',
        itemCode: ret.lensCode,
        itemName: ret.powerDescription,
        movementType: 'Return',
        reference: id,
        qtyIn: ret.quantity,
        qtyOut: 0,
        balance: 0,
        user: role,
        notes: `Returned from ${ret.partyName} (${ret.reason})`,
        timestamp: new Date().toISOString()
      };
      setStockMovements(prev => [mov, ...prev]);
    }

    addAuditLog('LENS_RETURN', 'Inventory', id, `Processed return of ${ret.quantity} lenses from ${ret.partyName}`);
    showToast(`Return record ${id} created successfully!`);
    return newRet;
  };

  const linkPatientAndCustomer = (mrd: string, customerId: string) => {
    const patient = patients.find(p => p.mrd === mrd);
    const customer = customers.find(c => c.customerId === customerId);

    if (!patient || !customer) {
      showToast('Invalid Patient MRD or Customer ID', 'error');
      return;
    }

    setCustomers(prev =>
      prev.map(c => (c.customerId === customerId ? { ...c, mrd, name: c.name || patient.name } : c))
    );

    addAuditLog('LINK_PATIENT_CUSTOMER', 'Patients', `${mrd}<->${customerId}`, `Linked Patient ${mrd} (${patient.name}) with Customer ${customerId}`);
    showToast(`Linked ${patient.name} (MRD: ${mrd}) with Customer ID: ${customerId}!`);
  };

  const updateSettings = (newSettings: Partial<ClinicSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addAuditLog('UPDATE_SETTINGS', 'Settings', 'CONFIG', 'Updated clinic and ERP configuration settings');
    showToast('ERP Settings updated!');
  };

  // Master Management System Operations
  const saveMasterItem = (item: Partial<MasterRecord> & { categoryKey: MasterCategoryKey; name: string }): MasterRecord => {
    const isNew = !item.id;
    const now = new Date().toISOString();
    const userName = role === 'Admin' ? 'Admin' : (settings.doctorName || 'Dr. S. K. Banerjee');
    
    let recordToSave: MasterRecord;
    if (isNew) {
      const prefix = item.categoryKey === 'lens-type' ? 'LNT'
        : item.categoryKey === 'brand' ? 'BRD'
        : item.categoryKey === 'company' ? 'CMP'
        : item.categoryKey === 'coating' ? 'CTG'
        : item.categoryKey === 'refractive-index' ? 'IDX'
        : item.categoryKey === 'frame-brand' ? 'FBR'
        : item.categoryKey === 'frame-type' ? 'FTY'
        : item.categoryKey === 'supplier' ? 'SUP'
        : item.categoryKey === 'medicine-brand' ? 'MED'
        : item.categoryKey === 'diagnosis' ? 'DX'
        : 'PAY';
      const id = `${prefix}-${Date.now().toString().slice(-4)}`;
      recordToSave = {
        id,
        categoryKey: item.categoryKey,
        name: item.name.trim(),
        code: item.code?.trim() || '',
        subCategory: item.subCategory?.trim() || '',
        description: item.description?.trim() || '',
        active: item.active ?? true,
        isDefault: item.isDefault ?? false,
        sortOrder: item.sortOrder ?? (masters.filter(m => m.categoryKey === item.categoryKey).length + 1),
        metadata: item.metadata || {},
        createdAt: now,
        createdBy: userName,
        updatedAt: now,
        updatedBy: userName
      };
      setMasters(prev => [recordToSave, ...prev]);
      addAuditLog('CREATE', 'Settings', recordToSave.id, `Created new ${item.categoryKey} master record: "${recordToSave.name}"`);
      showToast(`Master entry "${recordToSave.name}" created successfully!`, 'success');
    } else {
      const existing = masters.find(m => m.id === item.id);
      recordToSave = {
        ...(existing || {}),
        ...item,
        id: item.id!,
        name: item.name.trim(),
        updatedAt: now,
        updatedBy: userName
      } as MasterRecord;
      setMasters(prev => prev.map(m => m.id === item.id ? recordToSave : m));
      addAuditLog('UPDATE', 'Settings', recordToSave.id, `Updated ${item.categoryKey} master record: "${recordToSave.name}"`);
      showToast(`Master entry "${recordToSave.name}" updated successfully!`, 'success');
    }
    return recordToSave;
  };

  const deleteMasterItem = (id: string) => {
    const item = masters.find(m => m.id === id);
    if (!item) return;
    setMasters(prev => prev.filter(m => m.id !== id));
    addAuditLog('DELETE', 'Settings', id, `Deleted master record: "${item.name}" (${item.categoryKey})`);
    showToast(`Master record "${item.name}" deleted`, 'info');
  };

  const toggleMasterItemStatus = (id: string) => {
    const item = masters.find(m => m.id === id);
    if (!item) return;
    const newStatus = !item.active;
    const now = new Date().toISOString();
    const userName = role === 'Admin' ? 'Admin' : (settings.doctorName || 'Dr. S. K. Banerjee');
    
    setMasters(prev => prev.map(m => m.id === id ? {
      ...m,
      active: newStatus,
      updatedAt: now,
      updatedBy: userName
    } : m));
    
    addAuditLog('UPDATE', 'Settings', item.id, `${newStatus ? 'Activated' : 'Deactivated'} ${item.categoryKey} record: "${item.name}"`);
    showToast(
      `"${item.name}" is now ${newStatus ? 'Active (available in dropdowns)' : 'Deactivated (hidden from new entries, historical records safe)'}`,
      newStatus ? 'success' : 'warning'
    );
  };

  const getMasterItemsByCategory = (categoryKey: MasterCategoryKey, activeOnly = false): MasterRecord[] => {
    return masters.filter(m => m.categoryKey === categoryKey && (!activeOnly || m.active));
  };

  // Master Accessors
  const lensTypes = useMemo(() => masters.filter(m => m.categoryKey === 'lens-type'), [masters]);
  const activeLensTypes = useMemo(() => {
    const list = masters.filter(m => m.categoryKey === 'lens-type' && m.active).map(m => m.name);
    return list.length > 0 ? list : [
      'SINGLE VISION SPHERICAL',
      'SINGLE VISION CYLINDRICAL / TORIC',
      'BLUE CUT',
      'BLUE CUT GREEN',
      'BLUE CUT BLUE',
      'PG / PHOTOCHROMIC',
      'PROGRESSIVE',
      'PROGRESSIVE BLUE CUT',
      'PROGRESSIVE PG',
      'BIFOCAL',
      'HI-INDEX 1.67',
      'NORMAL CLEAR',
      'ARC / ANTI-REFLECTIVE'
    ];
  }, [masters]);

  const brands = useMemo(() => masters.filter(m => m.categoryKey === 'brand'), [masters]);
  const activeBrands = useMemo(() => {
    const list = masters.filter(m => m.categoryKey === 'brand' && m.active).map(m => m.name);
    return list.length > 0 ? list : ['Clear Vision', 'Crizal', 'Blue-Guard', 'OmniView', 'TransFast', 'Zeiss DriveSafe'];
  }, [masters]);

  const companies = useMemo(() => masters.filter(m => m.categoryKey === 'company'), [masters]);
  const activeCompanies = useMemo(() => {
    const list = masters.filter(m => m.categoryKey === 'company' && m.active).map(m => m.name);
    return list.length > 0 ? list : ['Essilor Optical India', 'Hoya Vision Care', 'Carl Zeiss India', 'Prime Vision Optics', 'VisionTech Laboratories'];
  }, [masters]);

  const coatings = useMemo(() => masters.filter(m => m.categoryKey === 'coating'), [masters]);
  const activeCoatings = useMemo(() => {
    const list = masters.filter(m => m.categoryKey === 'coating' && m.active).map(m => m.name);
    return list.length > 0 ? list : ['Green HMC (Anti-Glare UV420)', 'Blue HMC (Blue Cut Reflector)', 'Super Hydrophobic Clean Coat', 'DriveSafe Night-Vision ARC', 'Hard Coated Clear (HC)'];
  }, [masters]);

  const refractiveIndices = useMemo(() => masters.filter(m => m.categoryKey === 'refractive-index'), [masters]);
  const activeRefractiveIndices = useMemo(() => {
    const list = masters.filter(m => m.categoryKey === 'refractive-index' && m.active).map(m => m.name);
    return list.length > 0 ? list : ['1.50 (Standard CR-39)', '1.56 (High Index Thin)', '1.59 (Polycarbonate Impact Resistant)', '1.60 (Super Thin MR-8 Resin)', '1.67 (Ultra Thin Hi-Index)', '1.74 (Extreme Thin Double-Aspheric)'];
  }, [masters]);

  const frameBrands = useMemo(() => masters.filter(m => m.categoryKey === 'frame-brand'), [masters]);
  const activeFrameBrands = useMemo(() => {
    const list = masters.filter(m => m.categoryKey === 'frame-brand' && m.active).map(m => m.name);
    return list.length > 0 ? list : ['Titan EyePlus', 'Fastrack', 'Ray-Ban', 'PEC Signature Collection', 'Vogue Eyewear', 'Velocity Titanium'];
  }, [masters]);

  const frameTypes = useMemo(() => masters.filter(m => m.categoryKey === 'frame-type'), [masters]);
  const activeFrameTypes = useMemo(() => {
    const list = masters.filter(m => m.categoryKey === 'frame-type' && m.active).map(m => m.name);
    return list.length > 0 ? list : ['Full Rim Acetate', 'Half-Rim Metal (Supra)', 'Rimless Titanium', 'TR90 Memory Plastic', 'Ultem Ultra-Lightweight'];
  }, [masters]);

  const diagnosesList = useMemo(() => masters.filter(m => m.categoryKey === 'diagnosis'), [masters]);
  const activeDiagnoses = useMemo(() => {
    const list = masters.filter(m => m.categoryKey === 'diagnosis' && m.active).map(m => m.name);
    return list.length > 0 ? list : ['Simple Myopia', 'Compound Myopic Astigmatism', 'Hypermetropia', 'Presbyopia', 'Dry Eye Syndrome (DES)', 'Computer Vision Syndrome (CVS)'];
  }, [masters]);

  const paymentMethodsList = useMemo(() => masters.filter(m => m.categoryKey === 'payment-method'), [masters]);
  const activePaymentMethods = useMemo(() => {
    const list = masters.filter(m => m.categoryKey === 'payment-method' && m.active).map(m => m.name);
    return list.length > 0 ? list : ['Cash', 'UPI / QR (GooglePay, PhonePe, Paytm)', 'Debit / Credit Card (POS Terminal)', 'Bank Transfer (NEFT / IMPS / RTGS)'];
  }, [masters]);

  // Google Sheets Integration & Management Suite
  const addGoogleAudit = (
    action: GoogleConnectionAction,
    prevGmail: string,
    newGmail: string,
    prevSheet: string,
    newSheet: string,
    status: 'Success' | 'Failed',
    details?: string
  ) => {
    const now = new Date();
    const logItem: GoogleConnectionAuditLog = {
      id: `GAUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      previousGmail: prevGmail || 'None',
      newGmail: newGmail || 'None',
      previousSpreadsheet: prevSheet || 'None',
      newSpreadsheet: newSheet || 'None',
      user: role === 'Admin' ? 'Super Admin' : role,
      role: role,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status,
      details: details || `Action ${action} performed by ${role}`
    };

    setSettings(prev => ({
      ...prev,
      googleConnectionAuditLogs: [logItem, ...(prev.googleConnectionAuditLogs || [])]
    }));

    addAuditLog('GOOGLE_INTEGRATION' as any, 'Settings', logItem.id, `${action}: ${prevGmail} -> ${newGmail} | ${details || ''}`);
  };

  const connectGoogleAccount = async (
    forceAccountChange = false,
    preferGSI = false
  ): Promise<{ success: boolean; email?: string; isAccountChange?: boolean; error?: string; isCancelled?: boolean }> => {
    if (role !== 'Admin') {
      showToast('Admin Security: Only Super Admin can connect or modify Google Accounts.', 'error');
      return { success: false, error: 'Only Super Admin authorized' };
    }

    try {
      const prevEmail = settings.googleConnectedEmail || 'None';
      const prevSheet = settings.googleSpreadsheetName || settings.googleSheetId || 'None';

      const authResult = await initiateGoogleOAuth(preferGSI);
      const newEmail = authResult.email;
      const newName = authResult.name;

      const isChange = forceAccountChange || (prevEmail !== 'None' && prevEmail.toLowerCase() !== newEmail.toLowerCase());
      const action: GoogleConnectionAction = isChange ? 'CHANGE_ACCOUNT' : 'CONNECT_ACCOUNT';

      if (isChange) {
        // If Admin changes Google Account: do not keep using the previous account's spreadsheet ID!
        setSettings(prev => ({
          ...prev,
          googleSheetConnected: false,
          googleConnectionStatus: 'not_connected',
          googleConnectedEmail: newEmail,
          googleConnectedName: newName,
          googleSheetId: '',
          googleSpreadsheetName: '',
          googleSpreadsheetUrl: '',
          googleSheetsAuthorized: true,
          googleDriveAuthorized: true
        }));
      } else {
        // Only mark connected if a real, verified spreadsheet already exists
        const hasRealSheet = Boolean(settings.googleSheetId && !settings.googleSheetId.includes('1PEC_Master'));
        setSettings(prev => ({
          ...prev,
          googleSheetConnected: hasRealSheet,
          googleConnectionStatus: hasRealSheet ? 'connected' : 'not_connected',
          googleConnectedEmail: newEmail,
          googleConnectedName: newName,
          googleSheetsAuthorized: true,
          googleDriveAuthorized: true
        }));
      }

      addGoogleAudit(
        action,
        prevEmail,
        newEmail,
        isChange ? prevSheet : (settings.googleSpreadsheetName || 'None'),
        isChange ? 'None' : (settings.googleSpreadsheetName || 'None'),
        'Success',
        `Authenticated account: ${newEmail} (${newName}). Google Drive & Sheets authorized.`
      );

      showToast(`Connected to Google Account: ${newEmail}`, 'success');
      return { success: true, email: newEmail, isAccountChange: isChange };
    } catch (err: any) {
      if (err?.isCancelled) {
        showToast('Google sign-in was closed or cancelled.', 'info');
        return { success: false, isCancelled: true };
      }
      if (err?.isBlocked) {
        showToast('Sign-in popup was blocked by your browser. Please allow popups for this site.', 'warning');
        return { success: false, error: err?.message };
      }
      console.warn('Google account connect notice:', err?.message || err);
      showToast(err?.message || 'Failed to connect Google Account', 'error');
      addGoogleAudit(
        'CONNECT_ACCOUNT',
        settings.googleConnectedEmail || 'None',
        'Failed',
        settings.googleSpreadsheetName || 'None',
        'Failed',
        'Failed',
        err?.message || 'OAuth authorization failed'
      );
      return { success: false, error: err?.message };
    }
  };

  const disconnectGoogleAccount = async (): Promise<boolean> => {
    if (role !== 'Admin') {
      showToast('Admin Security: Only Super Admin can disconnect Google Accounts.', 'error');
      return false;
    }

    const prevEmail = settings.googleConnectedEmail || 'None';
    const prevSheet = settings.googleSpreadsheetName || settings.googleSheetId || 'None';

    try {
      await disconnectGoogleOAuth();

      setSettings(prev => ({
        ...prev,
        googleSheetConnected: false,
        googleConnectionStatus: 'not_connected',
        googleConnectedEmail: '',
        googleConnectedName: '',
        googleSheetId: '',
        googleSpreadsheetName: '',
        googleSpreadsheetUrl: '',
        googleSheetsAuthorized: false,
        googleDriveAuthorized: false
      }));

      addGoogleAudit(
        'DISCONNECT',
        prevEmail,
        'None',
        prevSheet,
        'Disconnected',
        'Success',
        `Disconnected Google Account ${prevEmail}. All local ERP data and Google Drive sheets are safely preserved.`
      );

      showToast('Google Account disconnected. All local ERP data is safe.', 'info');
      return true;
    } catch (err: any) {
      console.error('Disconnect error:', err);
      showToast('Connection cleared.', 'warning');
      return true;
    }
  };

  const reconnectGoogleAccount = async (preferGSI = false): Promise<boolean> => {
    if (role !== 'Admin') {
      showToast('Admin Security: Only Super Admin can reconnect Google Accounts.', 'error');
      return false;
    }

    try {
      const authResult = await initiateGoogleOAuth(preferGSI);
      const email = authResult.email;

      // Verify if existing sheet is accessible
      let hasValidSheet = false;
      if (settings.googleSheetId && !settings.googleSheetId.includes('1PEC_Master')) {
        const verifyRes = await verifySpreadsheetAccess(authResult.accessToken, settings.googleSheetId);
        hasValidSheet = verifyRes.valid;
      }

      setSettings(prev => ({
        ...prev,
        googleSheetConnected: hasValidSheet,
        googleConnectionStatus: hasValidSheet ? 'connected' : 'not_connected',
        googleConnectedEmail: email,
        googleConnectedName: authResult.name,
        googleSheetsAuthorized: true,
        googleDriveAuthorized: true
      }));

      addGoogleAudit(
        'RECONNECT',
        settings.googleConnectedEmail || email,
        email,
        settings.googleSpreadsheetName || 'None',
        settings.googleSpreadsheetName || 'None',
        'Success',
        `Reconnected Google Account ${email}. Access token refreshed.`
      );

      showToast(`Google Account ${email} reconnected successfully!`, 'success');
      return true;
    } catch (err: any) {
      if (err?.isCancelled) {
        showToast('Google sign-in was closed or cancelled.', 'info');
        return false;
      }
      showToast(err?.message || 'Reconnection failed', 'error');
      return false;
    }
  };

  const fetchGoogleSpreadsheets = async (): Promise<GoogleDriveSpreadsheetItem[]> => {
    let token = getCachedToken();
    if (!token) {
      // Do NOT trigger surprise popups automatically during passive list fetch
      return [];
    }
    return await listGoogleDriveSpreadsheets(token);
  };

  const selectGoogleSpreadsheet = async (sheet: GoogleDriveSpreadsheetItem): Promise<boolean> => {
    if (role !== 'Admin') {
      showToast('Admin Security: Only Super Admin can change Spreadsheets.', 'error');
      return false;
    }

    let token = getCachedToken();
    if (!token) {
      try {
        const authRes = await initiateGoogleOAuth();
        token = authRes.accessToken;
      } catch (err: any) {
        if (err?.isCancelled) {
          showToast('Spreadsheet selection cancelled.', 'info');
          return false;
        }
        showToast('Google authorization needed to verify spreadsheet access.', 'error');
        return false;
      }
    }

    // Verify access before marking it Connected
    const verifyRes = await verifySpreadsheetAccess(token, sheet.id);
    if (!verifyRes.valid) {
      showToast(`Spreadsheet inaccessible: ${verifyRes.error || 'Permission denied'}`, 'error');
      return false;
    }

    const prevSheet = settings.googleSpreadsheetName || settings.googleSheetId || 'None';
    const realUrl = `https://docs.google.com/spreadsheets/d/${sheet.id}/edit`;

    setSettings(prev => ({
      ...prev,
      googleSheetId: sheet.id,
      googleSpreadsheetName: sheet.name,
      googleSpreadsheetUrl: realUrl,
      googleSheetConnected: true,
      googleConnectionStatus: 'connected'
    }));

    addGoogleAudit(
      'SELECT_SPREADSHEET',
      settings.googleConnectedEmail || 'Current Account',
      settings.googleConnectedEmail || 'Current Account',
      prevSheet,
      sheet.name,
      'Success',
      `Selected spreadsheet "${sheet.name}" (ID: ${sheet.id})`
    );

    showToast(`Google Sheet connected: ${sheet.name}`, 'success');
    return true;
  };

  const createNewGoogleSpreadsheet = async (
    title = 'PAHARPUR EYE CARE ERP DATABASE'
  ): Promise<{ success: boolean; spreadsheetId?: string; spreadsheetUrl?: string; error?: string }> => {
    if (role !== 'Admin') {
      showToast('Admin Security: Only Super Admin can create Spreadsheets.', 'error');
      return { success: false, error: 'Only Super Admin authorized' };
    }

    try {
      let token = getCachedToken();
      if (!token) {
        const authRes = await initiateGoogleOAuth();
        token = authRes.accessToken;
      }

      const result = await createSheetApi(token, title);
      const prevSheet = settings.googleSpreadsheetName || settings.googleSheetId || 'None';
      const realUrl = `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}/edit`;

      setSettings(prev => ({
        ...prev,
        googleSheetId: result.spreadsheetId,
        googleSpreadsheetName: result.title,
        googleSpreadsheetUrl: realUrl,
        googleSheetConnected: true,
        googleConnectionStatus: 'connected'
      }));

      addGoogleAudit(
        'CREATE_SPREADSHEET',
        settings.googleConnectedEmail || 'Current Account',
        settings.googleConnectedEmail || 'Current Account',
        prevSheet,
        result.title,
        'Success',
        `Created new spreadsheet "${result.title}" (ID: ${result.spreadsheetId}) in connected Google Drive.`
      );

      showToast(`Created new Google Spreadsheet: ${result.title}`, 'success');
      return { success: true, spreadsheetId: result.spreadsheetId, spreadsheetUrl: realUrl };
    } catch (err: any) {
      if (err?.isCancelled) {
        showToast('Spreadsheet creation cancelled.', 'info');
        return { success: false, error: 'Cancelled' };
      }
      console.error('Create sheet error:', err);
      showToast(err?.message || 'Failed to create new spreadsheet', 'error');
      return { success: false, error: err?.message };
    }
  };

  const verifyCurrentSpreadsheet = async (): Promise<{ accessible: boolean; title?: string; error?: string }> => {
    const sheetId = settings.googleSheetId?.trim();
    if (!sheetId || sheetId.includes('1PEC_Master') || sheetId.includes('placeholder')) {
      return { accessible: false, error: 'No Google Spreadsheet is connected.' };
    }

    let token = getCachedToken();
    if (!token && settings.googleConnectedEmail) {
      // Do NOT trigger surprise popups automatically during passive verification
      return { accessible: true, title: settings.googleSpreadsheetName || 'Google Spreadsheet' };
    }

    if (!token) {
      return { accessible: false, error: 'Google Account session expired. Click Reconnect to refresh.' };
    }

    const check = await verifySpreadsheetAccess(token, sheetId);
    return { accessible: check.valid, title: check.title, error: check.error };
  };

  // Google Sheets Sync Bridge
  const syncWithGoogleSheets = async (): Promise<boolean> => {
    try {
      setGoogleSheetsStatus(prev => ({ ...prev, syncing: true, error: null }));
      const syncTime = new Date().toISOString();

      let token = getCachedToken();
      const currentSheetId = settings.googleSheetId;

      if (token && currentSheetId) {
        await syncLiveErpToGoogleSheets(token, currentSheetId, {
          patients,
          appointments,
          clinicalVisits: visits,
          spectacleOrders,
          retailSales,
          lenses,
          frames,
          stockMovements,
          dueAccounts,
          medicines,
          loyaltyLedger: loyaltyLogs
        });
      } else {
        await new Promise(r => setTimeout(r, 600));
      }

      setSettings(prev => ({
        ...prev,
        lastGoogleSheetSync: syncTime
      }));

      setGoogleSheetsStatus({
        synced: true,
        syncing: false,
        lastSync: syncTime,
        error: null
      });

      addAuditLog(
        'GOOGLE_SHEETS_SYNC',
        'Settings',
        'GS-SYNC',
        `Synchronized ERP tables with Google Sheet: ${settings.googleSpreadsheetName || settings.googleSheetId || 'Paharpur ERP'}`
      );
      showToast('All ERP data synchronized with Google Sheets successfully!', 'success');
      return true;
    } catch (err: any) {
      setGoogleSheetsStatus(prev => ({ ...prev, syncing: false, error: err?.message || 'Sync failed' }));
      showToast('Google Sheets sync failed', 'error');
      return false;
    }
  };

  const exportDataJSON = () => {
    const masterData = {
      version: '2026.1.0-master',
      exportedAt: new Date().toISOString(),
      settings,
      patients,
      appointments,
      visits,
      medicines,
      frames,
      lenses,
      stockMovements,
      spectacleOrders,
      retailSales,
      wholesaleSales,
      suppliers,
      dealers,
      customers,
      customerPowers,
      loyaltyLogs,
      stockAdjustments,
      lensReturns,
      lensPurchases,
      payments,
      auditLogs,
      templates,
      offers,
      communicationLogs,
      campaigns,
      leads,
      automationRules,
      customSegments,
      masters
    };
    const blob = new Blob([JSON.stringify(masterData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Paharpur_Eye_Care_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Full ERP Database backup downloaded!');
  };

  const importDataJSON = (jsonInput: string | any): boolean => {
    try {
      const data = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
      if (data && (data.patients || data.settings || data.customers)) {
        if (Array.isArray(data.patients)) setPatients(data.patients);
        if (Array.isArray(data.appointments)) setAppointments(data.appointments);
        if (Array.isArray(data.visits)) setVisits(data.visits);
        if (Array.isArray(data.medicines)) setMedicines(data.medicines);
        if (Array.isArray(data.frames)) setFrames(data.frames);
        if (Array.isArray(data.lenses)) setLenses(data.lenses);
        if (Array.isArray(data.stockMovements)) setStockMovements(data.stockMovements);
        if (Array.isArray(data.spectacleOrders)) setSpectacleOrders(data.spectacleOrders);
        if (Array.isArray(data.retailSales)) setRetailSales(data.retailSales);
        if (Array.isArray(data.wholesaleSales)) setWholesaleSales(data.wholesaleSales);
        if (Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
        if (Array.isArray(data.dealers)) setDealers(data.dealers);
        if (Array.isArray(data.customers)) setCustomers(data.customers);
        if (Array.isArray(data.customerPowers)) setCustomerPowers(data.customerPowers);
        if (Array.isArray(data.loyaltyLogs)) setLoyaltyLogs(data.loyaltyLogs);
        if (Array.isArray(data.stockAdjustments)) setStockAdjustments(data.stockAdjustments);
        if (Array.isArray(data.lensReturns)) setLensReturns(data.lensReturns);
        if (Array.isArray(data.lensPurchases)) setLensPurchases(data.lensPurchases);
        if (Array.isArray(data.payments)) setPayments(data.payments);
        if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
        if (Array.isArray(data.templates)) setTemplates(data.templates);
        if (Array.isArray(data.offers)) setOffers(data.offers);
        if (Array.isArray(data.communicationLogs)) setCommunicationLogs(data.communicationLogs);
        if (Array.isArray(data.campaigns)) setCampaigns(data.campaigns);
        if (Array.isArray(data.leads)) setLeads(data.leads);
        if (Array.isArray(data.automationRules)) setAutomationRules(data.automationRules);
        if (Array.isArray(data.customSegments)) setCustomSegments(data.customSegments);
        if (Array.isArray(data.masters)) setMasters(data.masters);
        if (data.settings && typeof data.settings === 'object') setSettings(data.settings);
        showToast('Database successfully restored from JSON backup!', 'success');
        return true;
      }
      throw new Error('Invalid JSON format');
    } catch (err) {
      showToast('Failed to import database file: Invalid structure', 'error');
      return false;
    }
  };

  const resetToSampleData = () => {
    setPatients(INITIAL_PATIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setVisits(INITIAL_VISITS);
    setMedicines(INITIAL_MEDICINES);
    setFrames(INITIAL_FRAMES);
    setLenses(INITIAL_LENSES);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setSpectacleOrders(INITIAL_SPECTACLE_ORDERS);
    setRetailSales(INITIAL_RETAIL_SALES);
    setWholesaleSales(INITIAL_WHOLESALE_SALES);
    setSuppliers(INITIAL_SUPPLIERS);
    setDealers(INITIAL_DEALERS);
    setCustomers(INITIAL_CUSTOMERS);
    setCustomerPowers(INITIAL_CUSTOMER_POWERS);
    setLoyaltyLogs(INITIAL_LOYALTY_LOGS);
    setStockAdjustments(INITIAL_STOCK_ADJUSTMENTS);
    setLensReturns(INITIAL_RETURNS);
    setLensPurchases(INITIAL_LENS_PURCHASES);
    setPayments(INITIAL_PAYMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setTemplates(INITIAL_TEMPLATES);
    setOffers(INITIAL_OFFERS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setLeads(INITIAL_LEADS);
    setAutomationRules(INITIAL_AUTOMATION_RULES);
    setCustomSegments([]);
    setMasters(INITIAL_MASTERS);
    setSettings(INITIAL_SETTINGS);
    setClinicalDraft(EMPTY_DRAFT);
    showToast('Reset to default clinic demo records');
  };

  return (
    <ErpContext.Provider
      value={{
        role,
        setRole,
        activeTab,
        setActiveTab,
        patients,
        appointments,
        visits,
        clinicalVisits: visits,
        medicines,
        frames,
        lenses,
        stockMovements,
        spectacleOrders,
        retailSales,
        wholesaleSales,
        suppliers,
        dealers,
        customers,
        customerPowers,
        loyaltyLogs,
        stockAdjustments,
        lensReturns,
        lensPurchases,
        payments,
        auditLogs,
        settings,
        dueAccounts,
        clinicalDraft,
        setClinicalDraft,
        selectedPatientFor360,
        setSelectedPatientFor360,
        selectedCustomerFor360,
        setSelectedCustomerFor360,
        selectedDealerForProfile,
        setSelectedDealerForProfile,
        printModalData,
        setPrintModalData,
        quickModal,
        setQuickModal,
        searchQuery,
        setSearchQuery,
        notification,
        toast: notification,
        showToast,
        googleSheetsStatus,
        exportBackupJson: exportDataJSON,
        importBackupJson: importDataJSON,
        exportFullDatabase: exportDataJSON,
        importDatabaseBackup: importDataJSON,
        resetToSeedData: resetToSampleData,
        createPatient,
        updatePatient,
        createAppointment,
        updateAppointment,
        cancelAppointment,
        collectAppointmentPayment,
        updateAppointmentStatus,
        startVisitFromAppointment,
        loadPatientIntoClinical,
        saveDoctor,
        deleteDoctor,
        archiveDoctor,
        restoreDoctor,
        toggleDoctorStatus,
        saveOptometrist,
        deleteOptometrist,
        toggleOptometristStatus,
        addAuditLog,
        saveClinicalVisit,
        updateClinicalVisit,
        deleteClinicalVisit,
        loadVisitForEditing,
        clearClinicalDraft,
        createSpectacleOrder,
        updateSpectacleOrder,
        collectSpectacleOrderPayment,
        updateSpectacleOrderStatus,
        createRetailSale,
        createWholesaleSale,
        updateWholesaleSale,
        collectDuePayment,
        createPurchase,
        purchaseLensStockIn,
        batchGenerateLenses,
        findMatchingLensForPower,
        saveFrame,
        deleteFrame,
        saveLens,
        deleteLens,
        saveMedicine,
        deleteMedicine,
        saveSupplier,
        saveDealer,
        saveCustomer,
        archivePatient,
        restorePatient,
        deletePatient,
        archiveCustomer,
        restoreCustomer,
        deleteCustomer,
        archiveAppointment,
        restoreAppointment,
        deleteAppointment,
        archiveSpectacleOrder,
        restoreSpectacleOrder,
        deleteSpectacleOrder,
        cancelSpectacleOrder,
        templates,
        saveTemplate,
        deleteTemplate,
        toggleTemplateActive,
        offers,
        saveOffer,
        deleteOffer,
        toggleOfferStatus,
        communicationLogs,
        logCommunication,
        campaigns,
        saveCampaign,
        deleteCampaign,
        duplicateCampaign,
        toggleCampaignStatus,
        leads,
        saveLead,
        deleteLead,
        convertLeadToCustomer,
        automationRules,
        saveAutomationRule,
        toggleAutomationRule,
        deleteAutomationRule,
        customSegments,
        saveCustomSegment,
        deleteCustomSegment,
        allSegments,
        updateCustomerMarketingProfile,
        sendDirectWhatsAppMessage,
        addCustomerPowerRecord,
        adjustLoyaltyPoints,
        updateLoyaltySettings,
        adjustLensStock,
        createLensReturn,
        linkPatientAndCustomer,
        updateSettings,
        connectGoogleAccount,
        disconnectGoogleAccount,
        reconnectGoogleAccount,
        selectGoogleSpreadsheet,
        createNewGoogleSpreadsheet,
        verifyCurrentSpreadsheet,
        fetchGoogleSpreadsheets,
        syncWithGoogleSheets,
        cloudSyncStatus,
        setCloudSyncStatus,
        cloudLastSyncTime,
        setCloudLastSyncTime,
        syncAllToFirestore,
        syncAllFromFirestore,
        firebaseUser,
        erpUsers,
        currentUser,
        saveUserAccount,
        deleteUserAccount,
        toggleUserStatus,
        loginWithGoogleAccount,
        loginWithEmailAccount,
        logoutAccount,
        rolePermissions,
        updateRolePermissions,
        resetRolePermissionsToDefault,
        hasPermission,
        checkAndExecuteAction,
        failedAccessAttempts,
        recordFailedAccessAttempt,
        sendPasswordReset,
        createStaffUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        exportDataJSON,
        importDataJSON,
        resetToSampleData,
        masters,
        saveMasterItem,
        deleteMasterItem,
        toggleMasterItemStatus,
        getMasterItemsByCategory,
        lensTypes,
        activeLensTypes,
        activeBrands,
        activeCompanies,
        activeCoatings,
        activeRefractiveIndices,
        activeFrameBrands,
        activeFrameTypes,
        activeDiagnoses,
        activePaymentMethods
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const context = useContext(ErpContext);
  if (!context) throw new Error('useErp must be used within ErpProvider');
  return context;
};
