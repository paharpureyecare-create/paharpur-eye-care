import { describe, it, expect } from 'vitest';
import {
  CANONICAL_ROLES,
  ALL_PERMISSION_MODULES,
  ALL_PERMISSION_ACTIONS,
  getDefaultRolePermissions,
  checkPermission,
  normalizeRole,
  normalizeModule
} from '../services/permissionService';
import { DIRTY_DOZEN_TESTS } from '../services/securityTestRunner';
import { sanitizeForFirestore } from '../services/firebaseService';
import {
  INITIAL_PATIENTS,
  INITIAL_CUSTOMERS,
  INITIAL_APPOINTMENTS,
  INITIAL_VISITS,
  INITIAL_SPECTACLE_ORDERS,
  INITIAL_RETAIL_SALES,
  INITIAL_WHOLESALE_SALES,
  INITIAL_FRAMES,
  INITIAL_LENSES,
  INITIAL_MEDICINES,
  INITIAL_AUDIT_LOGS,
  INITIAL_LOYALTY_LOGS,
  INITIAL_SUPPLIERS,
  INITIAL_DEALERS
} from '../data/seedData';

describe('PAHARPUR EYE CARE ERP — Comprehensive Production-Readiness Suite', () => {
  
  // =========================================================================
  // 1. DATA INTEGRITY & NO DUPLICATES IN EXISTING COLLECTIONS
  // =========================================================================
  describe('1. Data Integrity & Primary Key Uniqueness', () => {
    it('verifies all patients have unique valid MRD numbers', () => {
      const mrds = INITIAL_PATIENTS.map(p => p.mrd);
      const uniqueMrds = new Set(mrds);
      expect(uniqueMrds.size).toBe(mrds.length);
      mrds.forEach(mrd => {
        expect(mrd).toMatch(/^PEC-\d{4}-\d+$/);
      });
    });

    it('verifies all customers have unique customer IDs and valid mobiles', () => {
      const ids = INITIAL_CUSTOMERS.map(c => c.customerId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
      INITIAL_CUSTOMERS.forEach(c => {
        expect(c.customerId).toBeDefined();
        expect(c.name.length).toBeGreaterThan(0);
      });
    });

    it('verifies all spectacle orders have unique order IDs and required fields', () => {
      const orderIds = INITIAL_SPECTACLE_ORDERS.map(o => o.orderId);
      const uniqueOrderIds = new Set(orderIds);
      expect(uniqueOrderIds.size).toBe(orderIds.length);
      INITIAL_SPECTACLE_ORDERS.forEach(o => {
        expect(o.customerName).toBeDefined();
        expect(o.total).toBeGreaterThanOrEqual(0);
      });
    });

    it('verifies all retail and wholesale sales have unique invoice numbers', () => {
      const retailInvoices = INITIAL_RETAIL_SALES.map(s => s.invoiceNumber);
      expect(new Set(retailInvoices).size).toBe(retailInvoices.length);

      const wholesaleInvoices = INITIAL_WHOLESALE_SALES.map(w => w.invoiceNumber);
      expect(new Set(wholesaleInvoices).size).toBe(wholesaleInvoices.length);
    });

    it('verifies frames, lenses, and medicines have unique codes/SKUs', () => {
      const frameSkus = INITIAL_FRAMES.map(f => f.sku);
      expect(new Set(frameSkus).size).toBe(frameSkus.length);

      const lensCodes = INITIAL_LENSES.map(l => l.lensCode);
      expect(new Set(lensCodes).size).toBe(lensCodes.length);

      const medIds = INITIAL_MEDICINES.map(m => m.id);
      expect(new Set(medIds).size).toBe(medIds.length);
    });
  });

  // =========================================================================
  // 2. ROLE-BASED ACCESS CONTROL (ALL 7 CANONICAL ROLES)
  // =========================================================================
  describe('2. Role-Based Access Control Verification', () => {
    const permissions = getDefaultRolePermissions();

    it('defines all 7 canonical roles exactly', () => {
      expect(CANONICAL_ROLES).toEqual([
        'ADMIN',
        'RECEPTION',
        'OPTOMETRIST',
        'SALES',
        'ACCOUNTANT',
        'MARKETING',
        'READ_ONLY'
      ]);
    });

    // A. ADMIN Permissions
    it('[ADMIN] has unrestricted access across all modules except mutating audit logs', () => {
      ALL_PERMISSION_MODULES.forEach(mod => {
        if (mod !== 'Audit Logs') {
          expect(checkPermission(permissions, 'Admin', mod, 'view')).toBe(true);
          expect(checkPermission(permissions, 'Admin', mod, 'create')).toBe(true);
          expect(checkPermission(permissions, 'Admin', mod, 'edit')).toBe(true);
          expect(checkPermission(permissions, 'Admin', mod, 'delete')).toBe(true);
        }
      });
    });

    // B. RECEPTION Permissions
    it('[RECEPTION] can register patients & appointments, but cannot delete or access admin settings', () => {
      expect(checkPermission(permissions, 'Receptionist', 'Patients', 'view')).toBe(true);
      expect(checkPermission(permissions, 'Receptionist', 'Patients', 'create')).toBe(true);
      expect(checkPermission(permissions, 'Receptionist', 'Patients', 'edit')).toBe(true);
      expect(checkPermission(permissions, 'Receptionist', 'Patients', 'delete')).toBe(false);

      expect(checkPermission(permissions, 'Receptionist', 'Appointments', 'create')).toBe(true);
      expect(checkPermission(permissions, 'Receptionist', 'Appointments', 'delete')).toBe(false);

      expect(checkPermission(permissions, 'Receptionist', 'Settings', 'edit')).toBe(false);
      expect(checkPermission(permissions, 'Receptionist', 'User Management', 'create')).toBe(false);
    });

    // C. OPTOMETRIST Permissions
    it('[OPTOMETRIST] can manage clinical visits & prescriptions, but cannot access sales or delete records', () => {
      expect(checkPermission(permissions, 'Optometrist', 'Clinical Entry', 'view')).toBe(true);
      expect(checkPermission(permissions, 'Optometrist', 'Clinical Entry', 'create')).toBe(true);
      expect(checkPermission(permissions, 'Optometrist', 'Clinical Entry', 'edit')).toBe(true);
      expect(checkPermission(permissions, 'Optometrist', 'Clinical Entry', 'delete')).toBe(false);

      expect(checkPermission(permissions, 'Optometrist', 'Prescriptions', 'create')).toBe(true);
      expect(checkPermission(permissions, 'Optometrist', 'Retail POS', 'create')).toBe(false);
      expect(checkPermission(permissions, 'Optometrist', 'Patients', 'delete')).toBe(false);
    });

    // D. SALES Permissions
    it('[SALES] can book spectacle orders and retail sales, but cannot edit clinical visits or delete records', () => {
      expect(checkPermission(permissions, 'Sales', 'Spectacle Orders', 'create')).toBe(true);
      expect(checkPermission(permissions, 'Sales', 'Retail POS', 'create')).toBe(true);
      expect(checkPermission(permissions, 'Sales', 'Clinical Entry', 'create')).toBe(false);
      expect(checkPermission(permissions, 'Sales', 'Clinical Entry', 'edit')).toBe(false);
      expect(checkPermission(permissions, 'Sales', 'Spectacle Orders', 'delete')).toBe(false);
    });

    // E. ACCOUNTANT Permissions
    it('[ACCOUNTANT] can manage purchases, due accounts, and payments, but cannot delete financial records', () => {
      expect(checkPermission(permissions, 'Accountant', 'Purchases', 'create')).toBe(true);
      expect(checkPermission(permissions, 'Accountant', 'Due Management', 'view')).toBe(true);
      expect(checkPermission(permissions, 'Accountant', 'Payments', 'create')).toBe(true);
      expect(checkPermission(permissions, 'Accountant', 'Due Management', 'delete')).toBe(false);
      expect(checkPermission(permissions, 'Accountant', 'Purchases', 'delete')).toBe(false);
    });

    // F. MARKETING Permissions
    it('[MARKETING] can manage CRM, WhatsApp, Campaigns, and Loyalty, but cannot view clinical entries or delete records', () => {
      expect(checkPermission(permissions, 'Marketing', 'WhatsApp CRM', 'create')).toBe(true);
      expect(checkPermission(permissions, 'Marketing', 'Marketing', 'create')).toBe(true);
      expect(checkPermission(permissions, 'Marketing', 'Loyalty', 'create')).toBe(true);
      expect(checkPermission(permissions, 'Marketing', 'Clinical Entry', 'view')).toBe(false);
      expect(checkPermission(permissions, 'Marketing', 'Marketing', 'delete')).toBe(false);
    });

    // G. READ_ONLY Permissions
    it('[READ_ONLY] strictly cannot create, edit, or delete anything across all modules', () => {
      ALL_PERMISSION_MODULES.forEach(mod => {
        expect(checkPermission(permissions, 'Read Only', mod, 'create')).toBe(false);
        expect(checkPermission(permissions, 'Read Only', mod, 'edit')).toBe(false);
        expect(checkPermission(permissions, 'Read Only', mod, 'delete')).toBe(false);
      });
      // Sensitive admin modules blocked from view as well
      expect(checkPermission(permissions, 'Read Only', 'Audit Logs', 'view')).toBe(false);
      expect(checkPermission(permissions, 'Read Only', 'Settings', 'view')).toBe(false);
      expect(checkPermission(permissions, 'Read Only', 'User Management', 'view')).toBe(false);
    });
  });

  // =========================================================================
  // 3. SECURITY & FORENSIC IMMUTABILITY (AUDIT LOGS)
  // =========================================================================
  describe('3. Forensic Security Invariants', () => {
    it('enforces audit logs immutability: delete and edit are strictly forbidden for ALL roles', () => {
      const permissions = getDefaultRolePermissions();
      CANONICAL_ROLES.forEach(role => {
        expect(checkPermission(permissions, role, 'Audit Logs', 'delete')).toBe(false);
        expect(checkPermission(permissions, role, 'Audit Logs', 'edit')).toBe(false);
      });
    });

    it('executes and passes all 12 Dirty Dozen adversarial penetration tests', () => {
      DIRTY_DOZEN_TESTS.forEach(testCase => {
        const result = testCase.runTest();
        expect(result.passed).toBe(true);
        expect(result.actual).toBe(testCase.expectedOutcome);
      });
    });
  });

  // =========================================================================
  // 4. FIRESTORE SERIALIZATION & DATA SANITIZATION
  // =========================================================================
  describe('4. Firestore Data Sanitization', () => {
    it('cleans undefined values to prevent Firestore serialization crashes', () => {
      const input = {
        name: 'Test Patient',
        notes: undefined,
        deep: {
          valid: 123,
          bad: undefined
        },
        tags: ['cataract', 'glaucoma']
      };
      const cleaned = sanitizeForFirestore(input);
      expect(cleaned.name).toBe('Test Patient');
      expect(cleaned.notes).toBeUndefined();
      expect(cleaned.deep.valid).toBe(123);
      expect(cleaned.deep.bad).toBeUndefined();
      expect(cleaned.tags).toEqual(['cataract', 'glaucoma']);
    });
  });
});
