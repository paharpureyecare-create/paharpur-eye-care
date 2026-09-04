# PAHARPUR EYE CARE ERP — PRODUCTION SECURITY SPECIFICATION (TDD)
**Platform Target:** Firebase Firestore & Client RBAC Hybrid Architecture  
**Enforcement Level:** Zero-Trust Collection Level + Document Immutability

---

## 1. Core Data Invariants & Security Principles

1. **Authenticated Access Mandatory (Pillar 1)**
   - All ERP read and write operations require a valid Firebase Auth UID token (`request.auth != null`).
   - Anonymous/unauthenticated requests are unconditionally rejected with `PERMISSION_DENIED`.

2. **Strict Master Role Categorization (Pillar 2)**
   - Every staff user possesses exactly one canonical role:
     - `ADMIN` — Unrestricted clinical, optical, financial, inventory, settings, and user management privileges. Only ADMIN can delete records.
     - `RECEPTION` — Front-desk operations: appointments, patient intake, basic customer records. Denied access to financial master settings and record deletion.
     - `OPTOMETRIST` — Clinical examinations, refraction powers, prescription drafting. Denied deletion and accounting access.
     - `SALES` — Retail billing, spectacle job orders, lens dispensing, frame inventory view. Denied clinical prescription modification and user admin.
     - `ACCOUNTANT` — Due collection, ledger balances, retail/wholesale transaction audits. Denied clinical examination modifications.
     - `MARKETING` — CRM campaigns, WhatsApp communication logs, loyalty promotions. Denied clinical notes, inventory adjustments, and deletions.
     - `READ_ONLY` — Read-only observation across authorized public views. Any write/create/edit/delete mutation is rejected.

3. **Multi-Role & Sub-Granular Permissions (VIEW / CREATE / EDIT / DELETE)**
   - Permission to read does not imply permission to write.
   - Delete operations across all business collections (`patients`, `customers`, `prescriptions`, `spectacle_orders`, `medicines`, `frames`, `lenses`, etc.) are strictly reserved for `ADMIN`.

4. **Immutable Audit Trail Protection**
   - The `audit_logs` collection is strictly append-only (`allow create: if request.auth != null`).
   - `allow update, delete: if false;` guarantees that no user (including compromised staff or admins) can delete or alter audit history.
   - Every write operation logs User, Role, Action, Module, Record ID, Timestamp, Before Value, and After Value.

5. **Instant Session Invalidation on Disabled Accounts**
   - When an administrator flags a staff profile as `Disabled`, both server-side security rules check user status (`isActive()`) and client-side listeners immediately terminate the active session and revoke UI capabilities.

---

## 2. The "Dirty Dozen" (DD) Security Attack Payloads & Test Invariants

The following 12 adversarial / unauthorized payloads test the resilience of our production security architecture:

| ID | Attack Vector / Unauthorized Action | Actor Role | Target Collection / Action | Expected Result | Rule Enforcement Predicate |
|---|---|---|---|---|---|
| **DD-01** | Anonymous Unauthenticated Read | Unauthenticated (`auth=null`) | `patients` -> `get` / `list` | **403 DENIED** | `request.auth != null` |
| **DD-02** | Anonymous Privilege Escalation | Unauthenticated (`auth=null`) | `users/hacker_uid` -> `create` | **403 DENIED** | `request.auth != null` |
| **DD-03** | READ_ONLY User Clinical Prescription Creation | `READ_ONLY` | `prescriptions/new_rx` -> `create` | **403 DENIED** | `!isReadOnly()` |
| **DD-04** | Non-Admin Staff Deletion of Patient Record | `RECEPTION` | `patients/PEC-2026-1001` -> `delete` | **403 DENIED** | `allow delete: if isAdmin();` |
| **DD-05** | Unauthorized Clinical Visit Modification | `SALES` | `clinical_visits/VIS-99` -> `update` | **403 DENIED** | `isOptometrist() \|\| isAdmin()` |
| **DD-06** | Privilege Escalation: Non-Admin Changing Role | `SALES` | `users/self` -> update `role: 'ADMIN'` | **403 DENIED** | `allow write: if isAdmin();` |
| **DD-07** | Audit History Tampering (Log Deletion) | `ADMIN` / Staff | `audit_logs/AUD-12345` -> `delete` | **403 DENIED** | `allow delete: if false;` |
| **DD-08** | Audit History Tampering (Log Mutation) | Staff | `audit_logs/AUD-12345` -> `update` | **403 DENIED** | `allow update: if false;` |
| **DD-09** | System Config / Clinic Settings Overwrite | `ACCOUNTANT` | `clinic_settings/main` -> `write` | **403 DENIED** | `allow write: if isAdmin();` |
| **DD-10** | Optometrist Accessing Financial Due Write | `OPTOMETRIST` | `due_accounts/DUE-01` -> `delete` | **403 DENIED** | `allow delete: if isAdmin();` |
| **DD-11** | Disabled Staff Session Invalidation | `Disabled User` | Any Collection -> `read` / `write` | **403 DENIED** | `isActiveUser()` & proactive session kill |
| **DD-12** | Non-Admin Pharmacy Medicine Inventory Delete | `OPTOMETRIST` | `medicines/MED-01` -> `delete` | **403 DENIED** | `allow delete: if isAdmin();` |

---

## 3. Test Coverage Matrix

Every rule in `firestore.rules` directly maps to these invariants and satisfies the Eight Pillars of Hardened Security.
