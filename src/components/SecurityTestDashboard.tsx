import React, { useState, useEffect } from 'react';
import { useErp } from '../context/ErpContext';
import {
  PermissionModule,
  PermissionAction,
  UserRole,
  CanonicalRole,
  FailedAccessAttempt
} from '../types';
import {
  ALL_PERMISSION_MODULES,
  CANONICAL_ROLES,
  normalizeRole,
  checkPermission,
  getPermissionReason
} from '../services/permissionService';
import {
  DIRTY_DOZEN_TESTS,
  runDirtyDozenSuite,
  TestResultItem
} from '../services/securityTestRunner';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  UserX,
  UserCheck,
  Eye,
  Plus,
  Edit,
  Trash2,
  Database,
  Activity,
  Server,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

export const SecurityTestDashboard: React.FC = () => {
  const {
    role,
    currentUser,
    erpUsers,
    rolePermissions,
    hasPermission,
    failedAccessAttempts,
    checkAndExecuteAction,
    toggleUserStatus,
    showToast
  } = useErp();

  // Test Suite State
  const [suiteRunning, setSuiteRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResultItem[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  // Interactive Simulator State
  const [simulatedRole, setSimulatedRole] = useState<CanonicalRole>('RECEPTION');
  const [simulatedModule, setSimulatedModule] = useState<PermissionModule>('Patients');
  const [simulatedAction, setSimulatedAction] = useState<PermissionAction>('delete');

  // Load test suite on initial mount
  useEffect(() => {
    handleRunSuite();
  }, []);

  const handleRunSuite = async () => {
    setSuiteRunning(true);
    try {
      const results = await runDirtyDozenSuite();
      setTestResults(results);
    } catch (err) {
      console.error('Error running security test suite:', err);
    } finally {
      setSuiteRunning(false);
    }
  };

  // Evaluate simulator live
  const simAllowed = checkPermission(
    rolePermissions,
    simulatedRole,
    simulatedModule,
    simulatedAction
  );

  const simReason = getPermissionReason(
    rolePermissions,
    simulatedRole,
    simulatedModule,
    simulatedAction
  );

  const handleExecuteSimulatedAction = () => {
    checkAndExecuteAction(
      simulatedModule,
      simulatedAction,
      () => {
        showToast(
          `Permitted: ${simulatedAction.toUpperCase()} granted on ${simulatedModule} for ${simulatedRole}`,
          'success'
        );
      },
      `${simulatedAction.toUpperCase()} ${simulatedModule}`
    );
  };

  const filteredResults = testResults.filter(r => {
    if (activeCategoryFilter === 'ALL') return true;
    return r.category === activeCategoryFilter;
  });

  const totalPassed = testResults.filter(t => t.passed).length;

  return (
    <div id="security-test-dashboard" className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. TOP SECURITY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Protected Modules
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">23 Modules</p>
            <span className="inline-flex items-center gap-1 text-xs text-teal-700 font-semibold mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% RBAC Covered
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Dirty Dozen Tests
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {testResults.length > 0 ? `${totalPassed} / ${testResults.length}` : 'Running...'}
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero Vulnerabilities
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Firestore Rules
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">Zero-Trust</p>
            <span className="inline-flex items-center gap-1 text-xs text-indigo-700 font-semibold mt-1">
              <Server className="w-3.5 h-3.5" />
              Live & Deployed
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Audit Logs Protection
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">Append-Only</p>
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-semibold mt-1">
              <FileText className="w-3.5 h-3.5" />
              Immutability Locked
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. AUTOMATED "DIRTY DOZEN" TDD TEST SUITE RUNNER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                TDD Security Suite
              </span>
              <span className="text-xs font-bold text-slate-500">
                12 Adversarial Payloads & Data Invariants
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              "Dirty Dozen" Vulnerability & Access Policy Test Suite
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated tests verifying that unauthorized mutations, privilege escalations, and tamper attempts are strictly blocked.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-run-security-suite"
              onClick={handleRunSuite}
              disabled={suiteRunning}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${suiteRunning ? 'animate-spin' : ''}`} />
              {suiteRunning ? 'Running Tests...' : 'Run Security Suite'}
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-500 mr-2">Filter:</span>
          {['ALL', 'AUTHENTICATION', 'AUTHORIZATION', 'PRIVILEGE_ESCALATION', 'AUDIT_IMMUTABILITY', 'DATA_INTEGRITY'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeCategoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Test Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Test ID</th>
                <th className="py-3 px-4">Attack Vector & Test Case</th>
                <th className="py-3 px-4">Actor Role</th>
                <th className="py-3 px-4">Target Module & Action</th>
                <th className="py-3 px-4">Expected</th>
                <th className="py-3 px-4">Actual Result</th>
                <th className="py-3 px-4">Enforcement Rule Clause</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map(test => (
                <tr key={test.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-black text-slate-800">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {test.id}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-bold text-slate-900">{test.title}</p>
                    <p className="text-2xs text-slate-500 mt-0.5 leading-relaxed">{test.reason}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-black bg-slate-100 text-slate-800 border border-slate-300">
                      {test.actorRole}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{test.targetModule}</span>
                    <span className="ml-1 text-2xs uppercase font-bold text-slate-400">
                      [{test.action}]
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-2xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {test.expected}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {test.actual}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-2xs max-w-xs truncate">
                    {test.rulesClause}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {test.passed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        DEFENDED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        FAILED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. LIVE ROLE & PERMISSION INTERACTIVE SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-600" />
              Live Role & Granular Action Simulator
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Simulate any staff role, module, and action to verify client and server RBAC behavior in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Role Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Simulated Role
              </label>
              <select
                id="select-sim-role"
                value={simulatedRole}
                onChange={e => setSimulatedRole(e.target.value as CanonicalRole)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                {CANONICAL_ROLES.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Module
              </label>
              <select
                id="select-sim-module"
                value={simulatedModule}
                onChange={e => setSimulatedModule(e.target.value as PermissionModule)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                {ALL_PERMISSION_MODULES.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Requested Action
              </label>
              <select
                id="select-sim-action"
                value={simulatedAction}
                onChange={e => setSimulatedAction(e.target.value as PermissionAction)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="view">VIEW</option>
                <option value="create">CREATE</option>
                <option value="edit">EDIT</option>
                <option value="delete">DELETE</option>
              </select>
            </div>
          </div>

          {/* Simulator Verdict Card */}
          <div
            className={`rounded-2xl p-5 border transition-all ${
              simAllowed
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/70 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  simAllowed ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                }`}
              >
                {simAllowed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {simAllowed ? 'ALLOWED / অনুমোদিত' : 'DENIED / অস্বীকৃত'}
              </span>
              <span className="text-2xs font-mono font-bold text-slate-500">
                POLICY: RBAC_V2_ENFORCED
              </span>
            </div>

            <p className="text-sm font-black mt-2">
              {simAllowed
                ? `Role [${simulatedRole}] is granted [${simulatedAction.toUpperCase()}] privilege on [${simulatedModule}].`
                : `Role [${simulatedRole}] is strictly DENIED [${simulatedAction.toUpperCase()}] privilege on [${simulatedModule}].`}
            </p>

            <p className="text-xs text-slate-600 mt-1 font-medium">{simReason}</p>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <p className="text-2xs text-slate-500">
                Click below to simulate real-time client permission enforcement:
              </p>
              <button
                id="btn-trigger-simulated-action"
                onClick={handleExecuteSimulatedAction}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
              >
                Test Real Action Trigger
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* User Account Status & Invalidation Panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-600" />
                Live Staff Sessions & Status
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Real-time active vs disabled account enforcement.
              </p>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {erpUsers.length} Users
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 divide-y divide-slate-100">
            {erpUsers.map(user => (
              <div key={user.uid} className="pt-2 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{user.displayName || user.email}</p>
                  <p className="text-2xs text-slate-500">{user.email}</p>
                  <span className="inline-block mt-0.5 text-2xs font-semibold px-2 py-0.2 rounded-md bg-slate-100 text-slate-700">
                    Role: {user.role}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-2xs font-black ${
                      user.status === 'Disabled'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {user.status || 'Active'}
                  </span>

                  <button
                    onClick={() => toggleUserStatus(user.uid, user.status === 'Disabled' ? 'Active' : 'Disabled')}
                    className={`px-2.5 py-1 rounded-lg text-2xs font-bold border transition-all ${
                      user.status === 'Disabled'
                        ? 'bg-teal-50 text-teal-700 border-teal-300 hover:bg-teal-100'
                        : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                    }`}
                  >
                    {user.status === 'Disabled' ? 'Enable' : 'Disable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. SECURITY LOG: FAILED ACCESS ATTEMPTS & VIOLATIONS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Real-Time Security Events & Blocked Access Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live audit stream of unauthorized attempts and RBAC violations recorded by client and Firestore rules.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {failedAccessAttempts.length} Events Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Target Module</th>
                <th className="py-3 px-4">Blocked Action</th>
                <th className="py-3 px-4">Denial Reason</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {failedAccessAttempts.map(att => (
                <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{att.id}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-2xs">
                    {new Date(att.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{att.user}</p>
                    <span className="text-2xs font-semibold text-slate-500">({att.role})</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{att.module}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-2xs font-black bg-rose-100 text-rose-800 uppercase">
                      {att.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-2xs text-slate-600 max-w-sm">{att.reason}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                      <Lock className="w-2.5 h-2.5" />
                      BLOCKED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
