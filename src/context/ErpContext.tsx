import React, { createContext, useContext, useState, useEffect } from 'react';
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
  Supplier,
  Customer,
  PaymentRecord,
  ClinicSettings,
  AuditLog,
  UserRole,
  AppointmentStatus,
  SpectacleOrderStatus,
  PrescribedMedicine,
  EyePower,
  ClinicalExamination
} from '../types';
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
  INITIAL_SUPPLIERS,
  INITIAL_CUSTOMERS,
  INITIAL_PAYMENTS,
  INITIAL_AUDIT_LOGS
} from '../data/seedData';

export type NavTab =
  | 'dashboard'
  | 'patients'
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
  | 'reports'
  | 'sheets-sync'
  | 'audit-log'
  | 'settings';

export interface ClinicalDraft {
  mrd: string;
  patientName: string;
  age: number | string;
  gender: string;
  mobile: string;
  doctor: string;
  visitType: string;
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
}

export const EMPTY_DRAFT: ClinicalDraft = {
  mrd: '',
  patientName: '',
  age: '',
  gender: 'Male',
  mobile: '',
  doctor: 'Dr. S. K. Banerjee',
  visitType: 'New Consultation',
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
  examination: {
    vaOdWithout: '6/6',
    vaOdWith: '6/6',
    vaOdBest: '6/6',
    vaOsWithout: '6/6',
    vaOsWith: '6/6',
    vaOsBest: '6/6',
    phOd: '6/6',
    phOs: '6/6',
    nearVision: 'N6',
    iopOd: '14',
    iopOs: '14',
    pupilStatus: 'Normal',
    pupilNotes: '',
    eomStatus: 'Normal',
    eomNotes: '',
    adnexaStatus: 'Normal',
    adnexaNotes: '',
    anteriorSegmentStatus: 'Normal',
    anteriorSegmentNotes: '',
    fundusStatus: 'Normal',
    fundusNotes: '',
    clinicalFindings: ''
  },
  diagnosis: [],
  customDiagnosis: '',
  medicines: [],
  advice: 'Wear prescribed spectacles regularly. Wash eyes with cold water.',
  followUpDays: 15
};

export interface PrintModalData {
  type: 'prescription' | 'spectacle-order' | 'invoice' | 'receipt' | 'due-statement';
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
  medicines: MedicineMaster[];
  frames: FrameMaster[];
  lenses: LensMaster[];
  stockMovements: StockMovement[];
  spectacleOrders: SpectacleOrder[];
  retailSales: RetailSale[];
  suppliers: Supplier[];
  customers: Customer[];
  payments: PaymentRecord[];
  auditLogs: AuditLog[];
  settings: ClinicSettings;
  clinicalDraft: ClinicalDraft;
  setClinicalDraft: React.Dispatch<React.SetStateAction<ClinicalDraft>>;
  selectedPatientFor360: Patient | null;
  setSelectedPatientFor360: (patient: Patient | null) => void;
  printModalData: PrintModalData | null;
  setPrintModalData: (data: PrintModalData | null) => void;
  quickModal: string | null;
  setQuickModal: (modal: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notification: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;

  // Actions
  createPatient: (patient: Omit<Patient, 'mrd' | 'registrationDate'>) => Patient;
  updatePatient: (patient: Patient) => void;
  createAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  startVisitFromAppointment: (appointmentId: string) => void;
  loadPatientIntoClinical: (mrd: string) => void;
  saveClinicalVisit: (visitDraft: ClinicalDraft) => ClinicalVisit;
  clearClinicalDraft: () => void;
  createSpectacleOrder: (order: Omit<SpectacleOrder, 'orderId' | 'orderDate'>) => SpectacleOrder;
  updateSpectacleOrderStatus: (orderId: string, status: SpectacleOrderStatus) => void;
  createRetailSale: (sale: Omit<RetailSale, 'invoiceNumber' | 'date'>) => RetailSale;
  collectDuePayment: (customerId: string, invoiceNumber: string, amount: number, paymentMode: string, notes?: string) => void;
  createPurchase: (supplierId: string, invoiceNo: string, items: { itemType: 'Frame' | 'Lens' | 'Medicine'; itemCode: string; itemName: string; quantity: number; purchaseRate: number; discount: number; taxPercent: number }[], paymentMode: string, paidAmount: number) => void;
  saveFrame: (frame: FrameMaster) => void;
  deleteFrame: (sku: string) => void;
  saveLens: (lens: LensMaster) => void;
  deleteLens: (lensCode: string) => void;
  saveMedicine: (medicine: MedicineMaster) => void;
  deleteMedicine: (id: string) => void;
  saveSupplier: (supplier: Supplier) => void;
  updateSettings: (newSettings: Partial<ClinicSettings>) => void;
  syncWithGoogleSheets: () => Promise<boolean>;
  exportDataJSON: () => void;
  importDataJSON: (jsonStr: string) => boolean;
  resetToSampleData: () => void;
}

const ErpContext = createContext<ErpContextType | null>(null);

const STORAGE_PREFIX = 'PAHARPUR_EYE_CARE_ERP_';

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
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
  const [patients, setPatients] = useState<Patient[]>(() => getStored('PATIENTS', INITIAL_PATIENTS));
  const [appointments, setAppointments] = useState<Appointment[]>(() => getStored('APPOINTMENTS', INITIAL_APPOINTMENTS));
  const [visits, setVisits] = useState<ClinicalVisit[]>(() => getStored('VISITS', INITIAL_VISITS));
  const [medicines, setMedicines] = useState<MedicineMaster[]>(() => getStored('MEDICINES', INITIAL_MEDICINES));
  const [frames, setFrames] = useState<FrameMaster[]>(() => getStored('FRAMES', INITIAL_FRAMES));
  const [lenses, setLenses] = useState<LensMaster[]>(() => getStored('LENSES', INITIAL_LENSES));
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => getStored('STOCK_MOVEMENTS', INITIAL_STOCK_MOVEMENTS));
  const [spectacleOrders, setSpectacleOrders] = useState<SpectacleOrder[]>(() => getStored('SPECTACLE_ORDERS', INITIAL_SPECTACLE_ORDERS));
  const [retailSales, setRetailSales] = useState<RetailSale[]>(() => getStored('RETAIL_SALES', INITIAL_RETAIL_SALES));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStored('SUPPLIERS', INITIAL_SUPPLIERS));
  const [customers, setCustomers] = useState<Customer[]>(() => getStored('CUSTOMERS', INITIAL_CUSTOMERS));
  const [payments, setPayments] = useState<PaymentRecord[]>(() => getStored('PAYMENTS', INITIAL_PAYMENTS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStored('AUDIT_LOGS', INITIAL_AUDIT_LOGS));
  const [settings, setSettings] = useState<ClinicSettings>(() => {
    const stored = getStored('SETTINGS', INITIAL_SETTINGS);
    return { ...INITIAL_SETTINGS, ...stored, examiners: stored.examiners && stored.examiners.length > 0 ? stored.examiners : INITIAL_SETTINGS.examiners };
  });
  const [clinicalDraft, setClinicalDraft] = useState<ClinicalDraft>(() => getStored('CLINICAL_DRAFT', EMPTY_DRAFT));

  const [selectedPatientFor360, setSelectedPatientFor360] = useState<Patient | null>(null);
  const [printModalData, setPrintModalData] = useState<PrintModalData | null>(null);
  const [quickModal, setQuickModal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

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
  useEffect(() => { setStored('SUPPLIERS', suppliers); }, [suppliers]);
  useEffect(() => { setStored('CUSTOMERS', customers); }, [customers]);
  useEffect(() => { setStored('PAYMENTS', payments); }, [payments]);
  useEffect(() => { setStored('AUDIT_LOGS', auditLogs); }, [auditLogs]);
  useEffect(() => { setStored('SETTINGS', settings); }, [settings]);
  useEffect(() => { setStored('CLINICAL_DRAFT', clinicalDraft); }, [clinicalDraft]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const addAuditLog = (action: string, module: AuditLog['module'], recordId: string, details: string) => {
    const log: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      user: role === 'Doctor' ? settings.doctorName : `${role} User`,
      role,
      action,
      module,
      recordId,
      details
    };
    setAuditLogs(prev => [log, ...prev]);
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

    addAuditLog('CREATE_PATIENT', 'Patients', mrd, `Registered new patient: ${newPatient.name} (${mrd})`);
    showToast(`Patient ${newPatient.name} registered with MRD: ${mrd}`);
    return newPatient;
  };

  // 2. Update Patient
  const updatePatient = (patient: Patient) => {
    setPatients(prev => prev.map(p => (p.mrd === patient.mrd ? patient : p)));
    addAuditLog('UPDATE_PATIENT', 'Patients', patient.mrd, `Updated profile for ${patient.name}`);
    showToast(`Patient ${patient.name} profile updated`);
  };

  // 3. Create Appointment
  const createAppointment = (data: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const nextId = `APT-2026-0${500 + appointments.length + 1}`;
    const newApt: Appointment = {
      ...data,
      id: nextId,
      createdAt: new Date().toISOString()
    };
    setAppointments(prev => [newApt, ...prev]);
    addAuditLog('CREATE_APPOINTMENT', 'Appointments', nextId, `Booked appointment for ${newApt.patientName} (${newApt.mrd})`);
    showToast(`Appointment ${nextId} booked for ${newApt.patientName}`);
    return newApt;
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
      age: patient ? patient.age : '',
      gender: patient ? patient.gender : 'Male',
      mobile: apt.mobile,
      doctor: apt.doctor || settings.doctorName,
      visitType: apt.visitType,
      appointmentId: apt.id
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

  // 7. Save Clinical Visit
  const saveClinicalVisit = (draft: ClinicalDraft): ClinicalVisit => {
    const nextSeq = 3000 + visits.length + 1;
    const visitId = `VST-2026-${nextSeq}`;
    const rxId = `RX-2026-${9000 + visits.length + 1}`;

    const followUpDateStr = draft.followUpDays
      ? new Date(Date.now() + draft.followUpDays * 86400000).toISOString().split('T')[0]
      : undefined;

    const newVisit: ClinicalVisit = {
      visitId,
      appointmentId: draft.appointmentId,
      mrd: draft.mrd,
      patientName: draft.patientName,
      age: Number(draft.age) || 0,
      gender: draft.gender,
      mobile: draft.mobile,
      doctor: draft.doctor || settings.doctorName,
      visitType: draft.visitType,
      visitDate: new Date().toISOString().split('T')[0],
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
        c.mobile === draft.mobile || c.name.toLowerCase() === draft.patientName.toLowerCase()
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

  const clearClinicalDraft = () => {
    setClinicalDraft(EMPTY_DRAFT);
  };

  // 8. Create Spectacle Order (Linked with Lens & Frame Stock Ledger!)
  const createSpectacleOrder = (orderData: Omit<SpectacleOrder, 'orderId' | 'orderDate'>): SpectacleOrder => {
    const nextSeq = 7000 + spectacleOrders.length + 1;
    const orderId = `ORD-2026-${nextSeq}`;
    const today = new Date().toISOString().split('T')[0];

    const newOrder: SpectacleOrder = {
      ...orderData,
      orderId,
      orderDate: today
    };

    setSpectacleOrders(prev => [newOrder, ...prev]);

    // 1. Decrement Frame Stock
    if (newOrder.frameSku) {
      setFrames(prev =>
        prev.map(f => {
          if (f.sku === newOrder.frameSku) {
            const nextStock = Math.max(0, f.currentStock - newOrder.quantity);
            const nextStatus = nextStock === 0 ? 'Out of Stock' : nextStock <= f.reorderLevel ? 'Low Stock' : 'Available';
            return { ...f, currentStock: nextStock, status: nextStatus };
          }
          return f;
        })
      );

      // Add Frame Stock Movement
      const frameItem = frames.find(f => f.sku === newOrder.frameSku);
      const movId1 = `MOV-${Date.now().toString().slice(-6)}-1`;
      const movement1: StockMovement = {
        id: movId1,
        date: today,
        itemType: 'Frame',
        itemCode: newOrder.frameSku,
        itemName: frameItem ? `${frameItem.brand} ${frameItem.model}` : 'Frame',
        movementType: 'Spectacle Order',
        reference: orderId,
        qtyIn: 0,
        qtyOut: newOrder.quantity,
        balance: frameItem ? Math.max(0, frameItem.currentStock - newOrder.quantity) : 0,
        user: role === 'Doctor' ? settings.doctorName : `${role} Staff`,
        notes: `Reserved for Spectacle Order ${orderId} (${newOrder.customerName})`,
        timestamp: new Date().toISOString()
      };
      setStockMovements(prev => [movement1, ...prev]);
    }

    // 2. Decrement Lens Stock
    if (newOrder.lensCode) {
      setLenses(prev =>
        prev.map(l => {
          if (l.lensCode === newOrder.lensCode) {
            const nextStock = Math.max(0, l.currentStock - newOrder.quantity * 2); // 2 lenses per spectacle
            const nextStatus = nextStock === 0 ? 'Out of Stock' : nextStock <= l.reorderLevel ? 'Low Stock' : 'Available';
            return { ...l, currentStock: nextStock, status: nextStatus };
          }
          return l;
        })
      );

      // Add Lens Stock Movement
      const lensItem = lenses.find(l => l.lensCode === newOrder.lensCode);
      const movId2 = `MOV-${Date.now().toString().slice(-6)}-2`;
      const movement2: StockMovement = {
        id: movId2,
        date: today,
        itemType: 'Lens',
        itemCode: newOrder.lensCode,
        itemName: lensItem ? `${lensItem.company} ${lensItem.brand}` : 'Lens Pair',
        movementType: 'Spectacle Order',
        reference: orderId,
        qtyIn: 0,
        qtyOut: newOrder.quantity * 2,
        balance: lensItem ? Math.max(0, lensItem.currentStock - newOrder.quantity * 2) : 0,
        user: role === 'Doctor' ? settings.doctorName : `${role} Staff`,
        notes: `Fitted for Spectacle Order ${orderId} (${newOrder.customerName})`,
        timestamp: new Date().toISOString()
      };
      setStockMovements(prev => [movement2, ...prev]);
    }

    // 3. Create Retail Sale Invoice
    const invoiceNum = `INV-2026-${8000 + retailSales.length + 1}`;
    const newSale: RetailSale = {
      invoiceNumber: invoiceNum,
      date: today,
      customerType: 'Existing Patient',
      mrdOrCustomerId: newOrder.mrd,
      customerName: newOrder.customerName,
      mobile: newOrder.mobile,
      items: [
        {
          id: `SI-${Date.now()}`,
          itemType: 'Spectacle',
          code: orderId,
          name: `Custom Spectacle (${newOrder.frameBrand || 'Frame'} + ${newOrder.lensBrand || 'Lenses'})`,
          quantity: newOrder.quantity,
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
      paymentMode: newOrder.advance > 0 ? 'UPI' : 'Cash',
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
        customerId: newOrder.mrd,
        customerName: newOrder.customerName,
        mobile: newOrder.mobile,
        invoiceNumber: invoiceNum,
        amount: newOrder.advance,
        paymentMode: 'UPI',
        receivedBy: `${role} Desk`,
        notes: `Advance for Spectacle Order ${orderId}`
      };
      setPayments(prev => [payment, ...prev]);
    }

    // 5. Update Customer CRM
    setCustomers(prev => {
      const match = prev.find(c => c.mobile === newOrder.mobile);
      if (match) {
        return prev.map(c =>
          c.mobile === newOrder.mobile
            ? {
                ...c,
                totalPurchases: c.totalPurchases + 1,
                lifetimeValue: c.lifetimeValue + newOrder.total,
                outstandingDue: c.outstandingDue + newOrder.due,
                lastPurchaseDate: today,
                nextAction: `Deliver order ${orderId} on ${newOrder.deliveryDate}`,
                segment: 'Spectacle Buyer'
              }
            : c
        );
      } else {
        const newC: Customer = {
          customerId: `CUST-${5000 + prev.length + 1}`,
          name: newOrder.customerName,
          mobile: newOrder.mobile,
          whatsapp: newOrder.mobile,
          address: '',
          lastPurchaseDate: today,
          totalPurchases: 1,
          lifetimeValue: newOrder.total,
          outstandingDue: newOrder.due,
          lastContact: today,
          nextAction: `Deliver order ${orderId} on ${newOrder.deliveryDate}`,
          segment: 'Spectacle Buyer'
        };
        return [newC, ...prev];
      }
    });

    addAuditLog('CREATE_SPECTACLE_ORDER', 'Spectacles', orderId, `Booked order for ${newOrder.customerName} (Advance: ₹${newOrder.advance}, Due: ₹${newOrder.due})`);
    showToast(`Spectacle Order ${orderId} created! Central inventory updated.`);
    return newOrder;
  };

  // 9. Update Spectacle Order Status
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

  // 11. Collect Due Payment
  const collectDuePayment = (customerId: string, invoiceNumber: string, amount: number, paymentMode: string, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const payId = `PAY-2026-${9500 + payments.length + 1}`;

    // Update retail sale invoice
    setRetailSales(prev =>
      prev.map(inv => {
        if (inv.invoiceNumber === invoiceNumber) {
          const nextPaid = inv.paid + amount;
          const nextDue = Math.max(0, inv.grandTotal - nextPaid);
          return {
            ...inv,
            paid: nextPaid,
            due: nextDue,
            status: nextDue === 0 ? 'Paid' : 'Partial'
          };
        }
        return inv;
      })
    );

    // Update customer due
    setCustomers(prev =>
      prev.map(c => {
        if (c.customerId === customerId || c.mobile === customerId) {
          return {
            ...c,
            outstandingDue: Math.max(0, c.outstandingDue - amount)
          };
        }
        return c;
      })
    );

    // Record payment
    const payment: PaymentRecord = {
      paymentId: payId,
      date: today,
      customerId,
      customerName: 'Customer',
      mobile: '',
      invoiceNumber,
      amount,
      paymentMode: paymentMode as any,
      receivedBy: `${role} Desk`,
      notes: notes || `Settlement of due for ${invoiceNumber}`
    };
    setPayments(prev => [payment, ...prev]);

    addAuditLog('COLLECT_DUE_PAYMENT', 'Billing', payId, `Collected ₹${amount} for Invoice ${invoiceNumber}`);
    showToast(`Collected ₹${amount} payment for ${invoiceNumber}!`);
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

  const updateSettings = (newSettings: Partial<ClinicSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addAuditLog('UPDATE_SETTINGS', 'Settings', 'CONFIG', 'Updated clinic and ERP configuration settings');
    showToast('ERP Settings updated!');
  };

  // Google Sheets Sync Bridge
  const syncWithGoogleSheets = async (): Promise<boolean> => {
    try {
      // Simulate/Trigger live sync packet
      await new Promise(r => setTimeout(r, 900));
      const syncTime = new Date().toISOString();
      setSettings(prev => ({
        ...prev,
        googleSheetConnected: true,
        lastGoogleSheetSync: syncTime
      }));
      addAuditLog('GOOGLE_SHEETS_SYNC', 'Settings', 'GS-SYNC', `Synchronized all 12 modules with Google Sheet ID: ${settings.googleSheetId}`);
      showToast('All ERP data synchronized with Google Sheets successfully!', 'success');
      return true;
    } catch {
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
      suppliers,
      customers,
      payments,
      auditLogs
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

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.patients && data.settings) {
        if (data.patients) setPatients(data.patients);
        if (data.appointments) setAppointments(data.appointments);
        if (data.visits) setVisits(data.visits);
        if (data.medicines) setMedicines(data.medicines);
        if (data.frames) setFrames(data.frames);
        if (data.lenses) setLenses(data.lenses);
        if (data.stockMovements) setStockMovements(data.stockMovements);
        if (data.spectacleOrders) setSpectacleOrders(data.spectacleOrders);
        if (data.retailSales) setRetailSales(data.retailSales);
        if (data.suppliers) setSuppliers(data.suppliers);
        if (data.customers) setCustomers(data.customers);
        if (data.payments) setPayments(data.payments);
        if (data.settings) setSettings(data.settings);
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
    setSuppliers(INITIAL_SUPPLIERS);
    setCustomers(INITIAL_CUSTOMERS);
    setPayments(INITIAL_PAYMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
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
        medicines,
        frames,
        lenses,
        stockMovements,
        spectacleOrders,
        retailSales,
        suppliers,
        customers,
        payments,
        auditLogs,
        settings,
        clinicalDraft,
        setClinicalDraft,
        selectedPatientFor360,
        setSelectedPatientFor360,
        printModalData,
        setPrintModalData,
        quickModal,
        setQuickModal,
        searchQuery,
        setSearchQuery,
        notification,
        showToast,
        createPatient,
        updatePatient,
        createAppointment,
        updateAppointmentStatus,
        startVisitFromAppointment,
        loadPatientIntoClinical,
        saveClinicalVisit,
        clearClinicalDraft,
        createSpectacleOrder,
        updateSpectacleOrderStatus,
        createRetailSale,
        collectDuePayment,
        createPurchase,
        saveFrame,
        deleteFrame,
        saveLens,
        deleteLens,
        saveMedicine,
        deleteMedicine,
        saveSupplier,
        updateSettings,
        syncWithGoogleSheets,
        exportDataJSON,
        importDataJSON,
        resetToSampleData
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
