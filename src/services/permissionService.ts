import {
  CanonicalRole,
  UserRole,
  PermissionModule,
  PermissionAction,
  ModulePermissions,
  RolePermissionsMap
} from '../types';

export const ALL_PERMISSION_MODULES: PermissionModule[] = [
  'Dashboard',
  'Patients',
  'Customers',
  'Doctors',
  'Appointments',
  'Clinical Entry',
  'Clinical Visits',
  'Prescriptions',
  'Medicines',
  'Spectacle Orders',
  'Retail POS',
  'Wholesale',
  'Lens Stock',
  'Lens Inventory',
  'Frame Stock',
  'Frame Inventory',
  'Central Stock',
  'Purchases',
  'Suppliers',
  'Suppliers & Purchases',
  'Payments',
  'Due Management',
  'Finance & Due',
  'Loyalty',
  'Loyalty & Rewards',
  'WhatsApp CRM',
  'CRM & WhatsApp',
  'Marketing',
  'Reports',
  'CEO Analytics & Profit',
  'Google Sheets',
  'Audit Logs',
  'Settings',
  'Master Management',
  'User Management'
];

export const ALL_PERMISSION_ACTIONS: { id: PermissionAction; label: string }[] = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
  { id: 'export', label: 'Export' },
  { id: 'print', label: 'Print' }
];

export const CANONICAL_ROLES: CanonicalRole[] = [
  'ADMIN',
  'RECEPTION',
  'OPTOMETRIST',
  'SALES',
  'ACCOUNTANT',
  'MARKETING',
  'READ_ONLY'
];

export const normalizeRole = (role: UserRole | string | undefined | null): CanonicalRole => {
  if (!role) return 'READ_ONLY';
  const clean = String(role).trim().toUpperCase();
  if (clean === 'ADMIN' || clean.includes('ADMIN') || clean === 'ERP MASTER') return 'ADMIN';
  if (clean === 'RECEPTION' || clean === 'RECEPTIONIST') return 'RECEPTION';
  if (clean === 'OPTOMETRIST' || clean === 'DOCTOR' || clean.includes('DOCTOR') || clean.includes('CLINICAL')) return 'OPTOMETRIST';
  if (clean === 'SALES' || clean === 'INVENTORY' || clean.includes('OPTICAL')) return 'SALES';
  if (clean === 'ACCOUNTANT' || clean === 'ACCOUNTS' || clean.includes('FINANCE')) return 'ACCOUNTANT';
  if (clean === 'MARKETING' || clean === 'MARKETING STAFF' || clean.includes('CRM')) return 'MARKETING';
  if (clean === 'READ_ONLY' || clean === 'READ ONLY' || clean.includes('AUDIT')) return 'READ_ONLY';
  return 'RECEPTION';
};

export const normalizeModule = (module: PermissionModule | string): PermissionModule => {
  const m = String(module).trim();
  if (m === 'Clinical Visits') return 'Clinical Entry';
  if (m === 'Lens Inventory') return 'Lens Stock';
  if (m === 'Frame Inventory') return 'Frame Stock';
  if (m === 'Central Stock') return 'Purchases';
  if (m === 'Suppliers & Purchases') return 'Purchases';
  if (m === 'Finance & Due') return 'Due Management';
  if (m === 'Loyalty & Rewards') return 'Loyalty';
  if (m === 'CRM & WhatsApp') return 'WhatsApp CRM';
  if (m === 'CEO Analytics & Profit') return 'Reports';
  return m as PermissionModule;
};

export const getModuleForTab = (tab: string): PermissionModule => {
  switch (tab) {
    case 'dashboard':
      return 'Dashboard';
    case 'patients':
      return 'Patients';
    case 'customers':
      return 'Customers';
    case 'appointments':
      return 'Appointments';
    case 'entry-center':
      return 'Clinical Entry';
    case 'prescriptions':
      return 'Prescriptions';
    case 'medicines':
      return 'Medicines';
    case 'spectacles':
      return 'Spectacle Orders';
    case 'retail-sales':
      return 'Retail POS';
    case 'wholesale':
      return 'Wholesale';
    case 'lens-inventory':
    case 'lenses':
      return 'Lens Stock';
    case 'frame-inventory':
    case 'frames':
      return 'Frame Stock';
    case 'stock-ledger':
    case 'purchases':
    case 'suppliers':
      return 'Purchases';
    case 'dues':
    case 'due-management':
      return 'Due Management';
    case 'crm':
    case 'crm-whatsapp':
      return 'WhatsApp CRM';
    case 'loyalty':
    case 'loyalty-rewards':
      return 'Loyalty';
    case 'reports':
      return 'Reports';
    case 'masters':
    case 'master-management':
      return 'Master Management';
    case 'sheets-sync':
    case 'google-sheets':
      return 'Google Sheets';
    case 'audit-log':
      return 'Audit Logs';
    case 'settings':
    case 'clinic-settings':
      return 'Settings';
    case 'users':
      return 'User Management';
    default:
      return 'Dashboard';
  }
};

export const createEmptyPermissions = (allTrue = false): ModulePermissions => ({
  view: allTrue,
  create: allTrue,
  edit: allTrue,
  delete: allTrue,
  export: allTrue,
  print: allTrue
});

export const getDefaultRolePermissions = (): RolePermissionsMap => {
  const allModules = ALL_PERMISSION_MODULES;

  // 1. ADMIN - 100% full access
  const adminMap: Record<PermissionModule, ModulePermissions> = {} as any;
  allModules.forEach(m => {
    adminMap[m] = createEmptyPermissions(true);
  });
  // Forensic Immutability (Pillar 6): Audit Logs cannot be modified or deleted by anyone
  adminMap['Audit Logs'] = { view: true, create: true, edit: false, delete: false, export: true, print: true };

  // 2. RECEPTION - Patient reg, tokens, appointments, spectacles booking, payment entry
  const receptionMap: Record<PermissionModule, ModulePermissions> = {} as any;
  allModules.forEach(m => {
    receptionMap[m] = createEmptyPermissions(false);
  });
  receptionMap['Dashboard'] = { view: true, create: false, edit: false, delete: false, export: false, print: true };
  receptionMap['Patients'] = { view: true, create: true, edit: true, delete: false, export: true, print: true };
  receptionMap['Customers'] = { view: true, create: true, edit: true, delete: false, export: false, print: true };
  receptionMap['Doctors'] = { view: true, create: false, edit: false, delete: false, export: false, print: false };
  receptionMap['Appointments'] = { view: true, create: true, edit: true, delete: false, export: true, print: true };
  receptionMap['Prescriptions'] = { view: true, create: false, edit: false, delete: false, export: false, print: true };
  receptionMap['Medicines'] = { view: true, create: false, edit: false, delete: false, export: false, print: false };
  receptionMap['Spectacle Orders'] = { view: true, create: true, edit: true, delete: false, export: false, print: true };
  receptionMap['Retail POS'] = { view: true, create: true, edit: false, delete: false, export: false, print: true };
  receptionMap['Lens Stock'] = { view: true, create: false, edit: false, delete: false, export: false, print: false };
  receptionMap['Frame Stock'] = { view: true, create: false, edit: false, delete: false, export: false, print: false };
  receptionMap['Payments'] = { view: true, create: true, edit: false, delete: false, export: false, print: true };
  receptionMap['Due Management'] = { view: true, create: true, edit: false, delete: false, export: false, print: true };
  receptionMap['Loyalty'] = { view: true, create: true, edit: false, delete: false, export: false, print: false };
  receptionMap['WhatsApp CRM'] = { view: true, create: true, edit: false, delete: false, export: false, print: false };

  // 3. OPTOMETRIST - Clinical examination, refraction, prescription, medicine reference
  const optomMap: Record<PermissionModule, ModulePermissions> = {} as any;
  allModules.forEach(m => {
    optomMap[m] = createEmptyPermissions(false);
  });
  optomMap['Dashboard'] = { view: true, create: false, edit: false, delete: false, export: false, print: true };
  optomMap['Patients'] = { view: true, create: false, edit: true, delete: false, export: false, print: true };
  optomMap['Customers'] = { view: true, create: false, edit: false, delete: false, export: false, print: false };
  optomMap['Doctors'] = { view: true, create: false, edit: false, delete: false, export: false, print: false };
  optomMap['Appointments'] = { view: true, create: false, edit: true, delete: false, export: false, print: true };
  optomMap['Clinical Entry'] = { view: true, create: true, edit: true, delete: false, export: true, print: true };
  optomMap['Prescriptions'] = { view: true, create: true, edit: true, delete: false, export: true, print: true };
  optomMap['Medicines'] = { view: true, create: false, edit: false, delete: false, export: false, print: true };
  optomMap['Spectacle Orders'] = { view: true, create: false, edit: false, delete: false, export: false, print: true };
  optomMap['Lens Stock'] = { view: true, create: false, edit: false, delete: false, export: false, print: false };
  optomMap['Frame Stock'] = { view: true, create: false, edit: false, delete: false, export: false, print: false };

  // 4. SALES - Spectacle orders, retail POS, wholesale, frames & lens stock, payments
  const salesMap: Record<PermissionModule, ModulePermissions> = {} as any;
  allModules.forEach(m => {
    salesMap[m] = createEmptyPermissions(false);
  });
  salesMap['Dashboard'] = { view: true, create: false, edit: false, delete: false, export: false, print: false };
  salesMap['Patients'] = { view: true, create: false, edit: false, delete: false, export: false, print: false };
  salesMap['Customers'] = { view: true, create: true, edit: true, delete: false, export: false, print: true };
  salesMap['Appointments'] = { view: true, create: false, edit: false, delete: false, export: false, print: false };
  salesMap['Prescriptions'] = { view: true, create: false, edit: false, delete: false, export: false, print: true };
  salesMap['Spectacle Orders'] = { view: true, create: true, edit: true, delete: false, export: true, print: true };
  salesMap['Retail POS'] = { view: true, create: true, edit: true, delete: false, export: true, print: true };
  salesMap['Wholesale'] = { view: true, create: true, edit: true, delete: false, export: true, print: true };
  salesMap['Lens Stock'] = { view: true, create: true, edit: true, delete: false, export: false, print: true };
  salesMap['Frame Stock'] = { view: true, create: true, edit: true, delete: false, export: false, print: true };
  salesMap['Payments'] = { view: true, create: true, edit: false, delete: false, export: false, print: true };
  salesMap['Due Management'] = { view: true, create: true, edit: false, delete: false, export: false, print: true };
  salesMap['Loyalty'] = { view: true, create: true, edit: false, delete: false, export: false, print: false };

  // 5. ACCOUNTANT - Payments, Dues, Purchases, Suppliers, Financial Reports, POS audits
  const accountantMap: Record<PermissionModule, ModulePermissions> = {} as any;
  allModules.forEach(m => {
    accountantMap[m] = createEmptyPermissions(false);
  });
  accountantMap['Dashboard'] = { view: true, create: false, edit: false, delete: false, export: true, print: true };
  accountantMap['Customers'] = { view: true, create: false, edit: false, delete: false, export: true, print: true };
  accountantMap['Spectacle Orders'] = { view: true, create: false, edit: false, delete: false, export: true, print: true };
  accountantMap['Retail POS'] = { view: true, create: false, edit: false, delete: false, export: true, print: true };
  accountantMap['Wholesale'] = { view: true, create: false, edit: false, delete: false, export: true, print: true };
  accountantMap['Purchases'] = { view: true, create: true, edit: true, delete: false, export: true, print: true };
  accountantMap['Suppliers'] = { view: true, create: true, edit: true, delete: false, export: true, print: true };
  accountantMap['Payments'] = { view: true, create: true, edit: true, delete: false, export: true, print: true };
  accountantMap['Due Management'] = { view: true, create: true, edit: true, delete: false, export: true, print: true };
  accountantMap['Reports'] = { view: true, create: false, edit: false, delete: false, export: true, print: true };

  // 6. MARKETING - CRM WhatsApp, Campaigns, Offers, Customer Segmentation, Loyalty
  const marketingMap: Record<PermissionModule, ModulePermissions> = {} as any;
  allModules.forEach(m => {
    marketingMap[m] = createEmptyPermissions(false);
  });
  marketingMap['Dashboard'] = { view: true, create: false, edit: false, delete: false, export: false, print: false };
  marketingMap['Customers'] = { view: true, create: true, edit: true, delete: false, export: true, print: false };
  marketingMap['Loyalty'] = { view: true, create: true, edit: true, delete: false, export: true, print: true };
  marketingMap['WhatsApp CRM'] = { view: true, create: true, edit: true, delete: false, export: true, print: true };
  marketingMap['Marketing'] = { view: true, create: true, edit: true, delete: false, export: true, print: true };
  marketingMap['Reports'] = { view: true, create: false, edit: false, delete: false, export: false, print: false };

  // 7. READ_ONLY - Read only across business modules, no modifications, no settings
  const readOnlyMap: Record<PermissionModule, ModulePermissions> = {} as any;
  allModules.forEach(m => {
    readOnlyMap[m] = { view: true, create: false, edit: false, delete: false, export: false, print: false };
  });
  // Restricted from administrative modules
  readOnlyMap['Audit Logs'] = { view: false, create: false, edit: false, delete: false, export: false, print: false };
  readOnlyMap['Settings'] = { view: false, create: false, edit: false, delete: false, export: false, print: false };
  readOnlyMap['User Management'] = { view: false, create: false, edit: false, delete: false, export: false, print: false };
  readOnlyMap['Google Sheets'] = { view: false, create: false, edit: false, delete: false, export: false, print: false };

  return {
    ADMIN: adminMap,
    RECEPTION: receptionMap,
    OPTOMETRIST: optomMap,
    SALES: salesMap,
    ACCOUNTANT: accountantMap,
    MARKETING: marketingMap,
    READ_ONLY: readOnlyMap
  };
};

export const checkPermission = (
  rolePermissions: RolePermissionsMap | null | undefined,
  role: UserRole | string,
  module: PermissionModule,
  action: PermissionAction,
  customOverrides?: Partial<Record<PermissionModule, Partial<ModulePermissions>>>
): boolean => {
  const targetModule = normalizeModule(module);

  // Forensic Immutability (Pillar 6): Audit Logs are append-only. Mutation or deletion is unconditionally blocked for all roles, including ADMIN.
  if (targetModule === 'Audit Logs' && (action === 'delete' || action === 'edit')) {
    return false;
  }

  const canon = normalizeRole(role);
  // ADMIN has full access across all operational modules
  if (canon === 'ADMIN') return true;

  // Check specific user-level custom overrides if present
  if (customOverrides) {
    if (customOverrides[targetModule] && customOverrides[targetModule]![action] !== undefined) {
      return Boolean(customOverrides[targetModule]![action]);
    }
    if (customOverrides[module] && customOverrides[module]![action] !== undefined) {
      return Boolean(customOverrides[module]![action]);
    }
  }

  // Check role-based permission map
  const activeMap = rolePermissions || getDefaultRolePermissions();
  const roleConfig = activeMap[canon];
  if (!roleConfig) return false;

  const moduleConfig = roleConfig[targetModule] || roleConfig[module];
  if (!moduleConfig) return false;

  return Boolean(moduleConfig[action]);
};

export const getPermissionReason = (
  rolePermissions: RolePermissionsMap | null | undefined,
  role: UserRole | string,
  module: PermissionModule,
  action: PermissionAction,
  customOverrides?: Partial<Record<PermissionModule, Partial<ModulePermissions>>>
): { allowed: boolean; reason: string; rulePath: string } => {
  const canon = normalizeRole(role);
  const normModule = normalizeModule(module);
  const allowed = checkPermission(rolePermissions, role, module, action, customOverrides);

  let rulePath = `match /${normModule.toLowerCase().replace(/\s+/g, '_')}/{docId}`;
  if (normModule === 'Prescriptions' || normModule === 'Clinical Entry') {
    rulePath = 'match /prescriptions/{docId} or /clinical_visits/{docId}';
  } else if (normModule === 'Patients' || normModule === 'Customers') {
    rulePath = 'match /patients/{docId} or /customers/{docId}';
  } else if (normModule === 'Audit Logs') {
    rulePath = 'match /audit_logs/{logId}';
  } else if (normModule === 'Settings' || normModule === 'User Management') {
    rulePath = 'match /clinic_settings or /users/{userId}';
  }

  if (canon === 'ADMIN') {
    return {
      allowed: true,
      reason: 'ADMIN possesses unrestricted authorization across all modules, cloud collections, and configuration controls.',
      rulePath
    };
  }

  if (action === 'delete') {
    return {
      allowed: false,
      reason: `DELETE is restricted exclusively to ADMIN in Firestore Security Rules to prevent accidental or unauthorized data loss. (${canon} denied)`,
      rulePath
    };
  }

  if (allowed) {
    return {
      allowed: true,
      reason: `Granted under Canonical Role ${canon} policy for ${normModule} [${action.toUpperCase()}]. Matches Firestore Security Rules helper.`,
      rulePath
    };
  } else {
    return {
      allowed: false,
      reason: `Denied: ${canon} does not have [${action.toUpperCase()}] privilege on ${normModule}. Blocked by RBAC Matrix & Firestore Security Rules.`,
      rulePath
    };
  }
};
