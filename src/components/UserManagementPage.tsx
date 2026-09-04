import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import {
  CanonicalRole,
  UserRole,
  ERPUser,
  PermissionModule,
  PermissionAction,
  RolePermissionsMap
} from '../types';
import {
  ALL_PERMISSION_MODULES,
  ALL_PERMISSION_ACTIONS,
  normalizeRole,
  getDefaultRolePermissions
} from '../services/permissionService';
import {
  Users,
  Shield,
  KeyRound,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Save,
  Search,
  Check,
  X,
  History,
  Lock,
  Mail,
  Phone,
  Clock,
  Send,
  Sliders,
  CheckSquare,
  Square
} from 'lucide-react';

const CANONICAL_ROLES: { id: CanonicalRole; label: string; desc: string; color: string }[] = [
  { id: 'ADMIN', label: 'Administrator', desc: 'Full unrestricted system access, user administration & settings', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { id: 'RECEPTION', label: 'Receptionist', desc: 'Patient registration, appointment scheduling, queue management & billing entry', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'OPTOMETRIST', label: 'Optometrist / Doctor', desc: 'Vision assessment, refraction, clinical exams, prescriptions & eye diagnostics', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'SALES', label: 'Optical Sales', desc: 'Spectacle order processing, retail POS, frame/lens stock & optical delivery', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'ACCOUNTANT', label: 'Accountant', desc: 'Financial ledgers, due recovery, payments, supplier purchases & balance reports', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'MARKETING', label: 'Marketing & CRM', desc: 'WhatsApp campaigns, loyalty reward management, customer reach & lead conversion', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  { id: 'READ_ONLY', label: 'Read Only Auditor', desc: 'Audit inspection, reporting and dashboard view without permission to alter data', color: 'bg-slate-200 text-slate-700 border-slate-300' }
];

export const UserManagementPage: React.FC = () => {
  const {
    erpUsers,
    currentUser,
    role,
    saveUserAccount,
    deleteUserAccount,
    toggleUserStatus,
    sendPasswordReset,
    createStaffUser,
    rolePermissions,
    updateRolePermissions,
    resetRolePermissionsToDefault,
    auditLogs,
    showToast
  } = useErp();

  const [activeTab, setActiveTab] = useState<'users' | 'matrix' | 'audit'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Matrix tab state
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState<CanonicalRole>('RECEPTION');
  const [matrixDraft, setMatrixDraft] = useState<RolePermissionsMap>(rolePermissions || getDefaultRolePermissions());
  const [isSavingMatrix, setIsSavingMatrix] = useState(false);

  // User Add/Edit modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ERPUser | null>(null);
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<CanonicalRole>('RECEPTION');
  const [formPassword, setFormPassword] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Disabled'>('Active');
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Delete confirmation
  const [userToDelete, setUserToDelete] = useState<ERPUser | null>(null);

  const isAdminUser = normalizeRole(currentUser?.role || role) === 'ADMIN';

  // Filtered users
  const filteredUsers = erpUsers.filter(u => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
    const matchesRole = roleFilter === 'ALL' || normalizeRole(u.role) === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setFormDisplayName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('RECEPTION');
    setFormPassword('');
    setFormStatus('Active');
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: ERPUser) => {
    setEditingUser(user);
    setFormDisplayName(user.displayName);
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormRole(normalizeRole(user.role));
    setFormPassword('');
    setFormStatus(user.status || 'Active');
    setIsUserModalOpen(true);
  };

  const handleSaveUserForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formDisplayName.trim()) {
      showToast('Name and email are required.', 'error');
      return;
    }

    setIsSavingUser(true);
    if (editingUser) {
      // Edit existing user
      const updated: ERPUser = {
        ...editingUser,
        displayName: formDisplayName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        role: formRole,
        status: formStatus
      };
      await saveUserAccount(updated);
    } else {
      // Add new staff user
      const newUser: ERPUser = {
        uid: `USR-${Date.now().toString().slice(-6)}`,
        displayName: formDisplayName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        role: formRole,
        status: formStatus,
        createdAt: new Date().toISOString()
      };
      await createStaffUser(newUser, formPassword);
    }
    setIsSavingUser(false);
    setIsUserModalOpen(false);
  };

  const handleTriggerPasswordReset = async (user: ERPUser) => {
    if (window.confirm(`Send Firebase password reset email to ${user.email}?`)) {
      await sendPasswordReset(user.email);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    await deleteUserAccount(userToDelete.uid);
    setUserToDelete(null);
  };

  // Matrix operations
  const handleToggleCell = (module: PermissionModule, action: PermissionAction) => {
    if (selectedRoleForMatrix === 'ADMIN') {
      showToast('ADMIN role has permanent full access across all operations.', 'warning');
      return;
    }

    setMatrixDraft(prev => {
      const roleConfig = { ...(prev[selectedRoleForMatrix] || {}) };
      const moduleConfig = { ...(roleConfig[module] || { view: false, create: false, edit: false, delete: false, export: false, print: false }) };
      moduleConfig[action] = !moduleConfig[action];
      roleConfig[module] = moduleConfig;

      return {
        ...prev,
        [selectedRoleForMatrix]: roleConfig
      };
    });
  };

  const handleToggleAllForModule = (module: PermissionModule) => {
    if (selectedRoleForMatrix === 'ADMIN') return;
    setMatrixDraft(prev => {
      const roleConfig = { ...(prev[selectedRoleForMatrix] || {}) };
      const current = roleConfig[module] || { view: false, create: false, edit: false, delete: false, export: false, print: false };
      const allEnabled = ALL_PERMISSION_ACTIONS.every(a => current[a.id]);
      const targetVal = !allEnabled;

      const updated: any = {};
      ALL_PERMISSION_ACTIONS.forEach(a => {
        updated[a.id] = targetVal;
      });
      roleConfig[module] = updated;

      return {
        ...prev,
        [selectedRoleForMatrix]: roleConfig
      };
    });
  };

  const handleSaveMatrix = async () => {
    setIsSavingMatrix(true);
    await updateRolePermissions(matrixDraft);
    setIsSavingMatrix(false);
  };

  const handleResetMatrix = async () => {
    if (window.confirm('Reset all roles to recommended Paharpur Eye Care defaults?')) {
      setIsSavingMatrix(true);
      const defaults = getDefaultRolePermissions();
      setMatrixDraft(defaults);
      await resetRolePermissionsToDefault();
      setIsSavingMatrix(false);
    }
  };

  // User-related audit logs
  const userAuditLogs = auditLogs.filter(
    l => l.module === 'User Management' || l.module === 'Settings' || l.action === 'LOGIN' || l.action === 'LOGOUT'
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 text-white shadow-md border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Staff User Management & Role Permissions
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded-full font-mono">
                    RBAC Enforced
                  </span>
                </h2>
                <p className="text-xs text-slate-300">
                  Manage staff credentials, control granular permissions, and track security audit trails
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdminUser && (
              <button
                onClick={handleOpenAddUser}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add Staff Member
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-700/60">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-[11px] text-slate-400 font-medium">Total Staff Accounts</div>
            <div className="text-lg font-bold text-white mt-0.5">{erpUsers.length}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-[11px] text-slate-400 font-medium">Active Staff</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {erpUsers.filter(u => u.status !== 'Disabled').length}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-[11px] text-slate-400 font-medium">Disabled / Inactive</div>
            <div className="text-lg font-bold text-rose-400 mt-0.5">
              {erpUsers.filter(u => u.status === 'Disabled').length}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-[11px] text-slate-400 font-medium">Active Roles</div>
            <div className="text-lg font-bold text-teal-300 mt-0.5">{CANONICAL_ROLES.length} Defined</div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'users'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Staff Accounts ({erpUsers.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('matrix');
              setMatrixDraft(rolePermissions || getDefaultRolePermissions());
            }}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'matrix'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Granular Permissions Matrix (25 Modules)
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'audit'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            Security Audit Trail ({userAuditLogs.length})
          </button>
        </div>

        {/* TAB 1: STAFF ACCOUNTS */}
        {activeTab === 'users' && (
          <div className="p-6 space-y-4">
            {/* Search & Role Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search staff by name or email..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-500 whitespace-nowrap">Filter Role:</span>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="ALL">All Roles ({erpUsers.length})</option>
                  {CANONICAL_ROLES.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 italic">
                        No staff accounts found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const canon = normalizeRole(user.role);
                      const roleMeta = CANONICAL_ROLES.find(r => r.id === canon) || CANONICAL_ROLES[1];
                      const isCurrentUser = currentUser?.uid === user.uid || currentUser?.email === user.email;
                      const isTargetAdmin = canon === 'ADMIN';

                      return (
                        <tr key={user.uid} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200 shadow-2xs">
                                {(user.displayName || user.email)[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  {user.displayName}
                                  {isCurrentUser && (
                                    <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded-full font-bold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    {user.email}
                                  </span>
                                  {user.phone && (
                                    <span className="flex items-center gap-1 text-slate-400">
                                      • <Phone className="w-3 h-3" /> {user.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${roleMeta.color}`}
                            >
                              {roleMeta.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {user.status === 'Disabled' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Disabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-[11px] text-slate-500">
                            {user.lastLogin ? (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(user.lastLogin).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                            ) : (
                              <span className="text-slate-400">Never logged in</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isAdminUser && (
                                <>
                                  <button
                                    onClick={() => handleOpenEditUser(user)}
                                    title="Edit user profile & role"
                                    className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleTriggerPasswordReset(user)}
                                    title="Send password reset email"
                                    className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                  >
                                    <KeyRound className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => toggleUserStatus(user.uid)}
                                    title={user.status === 'Disabled' ? 'Activate user' : 'Disable user'}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      user.status === 'Disabled'
                                        ? 'text-emerald-700 hover:bg-emerald-50'
                                        : 'text-amber-700 hover:bg-amber-50'
                                    }`}
                                  >
                                    {user.status === 'Disabled' ? (
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    ) : (
                                      <XCircle className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  {!isTargetAdmin && (
                                    <button
                                      onClick={() => setUserToDelete(user)}
                                      title="Delete user account"
                                      className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: GRANULAR ROLE PERMISSIONS MATRIX */}
        {activeTab === 'matrix' && (
          <div className="p-6 space-y-5">
            {/* Role Switcher Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-1">Select Role:</span>
                {CANONICAL_ROLES.map(r => {
                  const isSelected = selectedRoleForMatrix === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRoleForMatrix(r.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-xs scale-102'
                          : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>

              {isAdminUser && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetMatrix}
                    disabled={isSavingMatrix}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset to Defaults
                  </button>
                  <button
                    onClick={handleSaveMatrix}
                    disabled={isSavingMatrix || selectedRoleForMatrix === 'ADMIN'}
                    className="px-4 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Role Permissions
                  </button>
                </div>
              )}
            </div>

            {/* Selected Role Meta Banner */}
            {(() => {
              const meta = CANONICAL_ROLES.find(r => r.id === selectedRoleForMatrix)!;
              return (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <span className="font-bold">{meta.label} Scope: </span>
                      <span>{meta.desc}</span>
                    </div>
                  </div>
                  {selectedRoleForMatrix === 'ADMIN' && (
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300">
                      Unrestricted Master
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                    <th className="py-2.5 px-4 w-64">ERP Module (25 Total)</th>
                    {ALL_PERMISSION_ACTIONS.map(action => (
                      <th key={action.id} className="py-2.5 px-3 text-center w-24">
                        {action.label}
                      </th>
                    ))}
                    {isAdminUser && selectedRoleForMatrix !== 'ADMIN' && (
                      <th className="py-2.5 px-3 text-right">Quick Toggle</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {ALL_PERMISSION_MODULES.map(module => {
                    const roleConfig = matrixDraft[selectedRoleForMatrix] || ({} as any);
                    const modulePerms = roleConfig[module] || {
                      view: false,
                      create: false,
                      edit: false,
                      delete: false,
                      export: false,
                      print: false
                    };
                    const isAllSelected = ALL_PERMISSION_ACTIONS.every(a => modulePerms[a.id]);

                    return (
                      <tr key={module} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-800">
                          {module}
                        </td>
                        {ALL_PERMISSION_ACTIONS.map(action => {
                          const isEnabled = selectedRoleForMatrix === 'ADMIN' ? true : Boolean(modulePerms[action.id]);
                          return (
                            <td key={action.id} className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                disabled={!isAdminUser || selectedRoleForMatrix === 'ADMIN'}
                                onClick={() => handleToggleCell(module, action.id)}
                                className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                                  isEnabled
                                    ? 'bg-teal-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                                } ${!isAdminUser || selectedRoleForMatrix === 'ADMIN' ? 'cursor-default' : 'cursor-pointer'}`}
                              >
                                {isEnabled ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
                                ) : (
                                  <X className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                        {isAdminUser && selectedRoleForMatrix !== 'ADMIN' && (
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleToggleAllForModule(module)}
                              className="text-[11px] font-semibold text-teal-700 hover:underline px-2 py-1"
                            >
                              {isAllSelected ? 'Clear All' : 'Select All'}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {isAdminUser && selectedRoleForMatrix !== 'ADMIN' && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveMatrix}
                  disabled={isSavingMatrix}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save Changes to Cloud Database
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Security & Access Audit Logs</h4>
                <p className="text-xs text-slate-500">
                  Immutable event records tracking staff sign-ins, privilege edits, and account provisioning
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                {userAuditLogs.length} Events Logged
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-4">Date & Time</th>
                    <th className="py-2.5 px-4">Staff Member</th>
                    <th className="py-2.5 px-4">Role</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {userAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                        No user security events logged yet.
                      </td>
                    </tr>
                  ) : (
                    userAuditLogs.slice(0, 30).map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                          {log.date} {log.time}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {log.user}
                          {log.email && <div className="text-[10px] text-slate-400 font-normal">{log.email}</div>}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {log.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.action === 'LOGIN'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.action === 'LOGOUT'
                                ? 'bg-slate-100 text-slate-700'
                                : log.action === 'CREATE'
                                ? 'bg-blue-100 text-blue-800'
                                : log.action === 'DELETE'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 text-[11px] max-w-md truncate">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">
                  {editingUser ? 'Edit Staff Account' : 'Provision New Staff User'}
                </h3>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUserForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={formDisplayName}
                  onChange={e => setFormDisplayName(e.target.value)}
                  placeholder="e.g. Dr. Subrata Roy or Priya Sharma"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="staff@paharpureyecare.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone (Optional)</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="+91 98300 00000"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as CanonicalRole)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    {CANONICAL_ROLES.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as 'Active' | 'Disabled')}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Password (Optional for Firebase Auth)
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder="Leave blank to invite via reset link"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Minimum 6 characters. If omitted, user can reset password using registered email.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 py-2 px-3 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-60"
                >
                  {isSavingUser ? 'Saving...' : editingUser ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 space-y-4">
            <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">Delete Staff Account?</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <span className="font-bold text-slate-800">{userToDelete.displayName}</span> ({userToDelete.email})? This action will revoke all system access.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2 px-3 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
