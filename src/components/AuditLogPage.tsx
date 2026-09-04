import React, { useState, useMemo } from 'react';
import { useErp } from '../context/ErpContext';
import { AuditLog, AuditModule, AuditAction } from '../types';
import {
  History,
  Search,
  Filter,
  Calendar,
  User,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  ArrowRight,
  Clock,
  Tag,
  AlertCircle,
  FileText
} from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { auditLogs, role } = useErp();

  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [selectedAction, setSelectedAction] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const modulesList: AuditModule[] = [
    'Appointments',
    'Patients',
    'Customer',
    'Clinical',
    'Spectacles',
    'Retail',
    'Inventory',
    'Billing',
    'Finance',
    'Settings',
    'System'
  ];

  const actionsList: AuditAction[] = [
    'CREATE',
    'UPDATE',
    'ARCHIVE',
    'RESTORE',
    'DELETE',
    'CANCEL',
    'PAYMENT',
    'STATUS_CHANGE',
    'DISCOUNT',
    'RETURN'
  ];

  // Filter logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        log.details.toLowerCase().includes(q) ||
        (log.recordId && log.recordId.toLowerCase().includes(q)) ||
        log.user.toLowerCase().includes(q) ||
        (log.oldValue && log.oldValue.toLowerCase().includes(q)) ||
        (log.newValue && log.newValue.toLowerCase().includes(q));

      const matchModule = selectedModule === 'All' || log.module === selectedModule;
      const matchAction = selectedAction === 'All' || log.action === selectedAction;
      const matchDate = !selectedDate || (log.date ? log.date === selectedDate : log.timestamp.startsWith(selectedDate));

      return matchSearch && matchModule && matchAction && matchDate;
    });
  }, [auditLogs, search, selectedModule, selectedAction, selectedDate]);

  // Statistics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogsCount = auditLogs.filter(l => (l.date ? l.date === todayStr : l.timestamp.startsWith(todayStr))).length;
  const aptLogsCount = auditLogs.filter(l => l.module === 'Appointments').length;
  const patientLogsCount = auditLogs.filter(l => l.module === 'Patients').length;
  const updateLogsCount = auditLogs.filter(l => l.action === 'UPDATE').length;

  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Date', 'Time', 'User', 'Role', 'Module', 'Action', 'Record ID', 'Details', 'Old Value', 'New Value'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      l.date || l.timestamp.split('T')[0],
      l.time || new Date(l.timestamp).toLocaleTimeString(),
      `"${l.user}"`,
      l.role,
      l.module,
      l.action,
      `"${l.recordId || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${(l.oldValue || '').replace(/"/g, '""')}"`,
      `"${(l.newValue || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Paharpur_Eye_Care_Audit_Trail_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'UPDATE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ARCHIVE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'RESTORE':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'DELETE':
      case 'CANCEL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'PAYMENT':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'STATUS_CHANGE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getModuleBadgeColor = (module: string) => {
    switch (module) {
      case 'Appointments':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Patients':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Customer':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Clinical':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Spectacles':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Billing':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Finance':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'Inventory':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Settings':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-xl">
              <History className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                System Audit Trail & History Logs
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  (সম্পূর্ণ অডিট ও পরিবর্তনের ইতিহাস)
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Tamper-proof chronological record of every Appointment, Patient edit, Optical order, and Financial transaction
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Admin Protected View</span>
          </div>

          <button
            id="btn-export-audit-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Total Event Records</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{auditLogs.length}</div>
          <div className="text-[10px] text-teal-800 font-semibold mt-0.5">Full audit history preserved</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Today's Activities</div>
          <div className="text-2xl font-black text-teal-700 mt-1">{todayLogsCount}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Logged on {todayStr}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Appointment Events</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{aptLogsCount}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Bookings & in-place updates</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Record Modifications</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{updateLogsCount}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Detailed field diffs stored</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-audit-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search details, ID, user, old/new values..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Module Filter */}
          <div>
            <select
              id="select-audit-module"
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="All">All Modules (সব বিভাগ)</option>
              {modulesList.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <select
              id="select-audit-action"
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="All">All Actions (সব ধরনের কাজ)</option>
              {actionsList.map(a => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <input
              id="input-audit-date"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded"
                title="Clear date"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Indicators */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-800">{filteredLogs.length}</strong> of{' '}
            <strong className="text-slate-800">{auditLogs.length}</strong> recorded logs
          </div>
          {(selectedModule !== 'All' || selectedAction !== 'All' || selectedDate || search) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedModule('All');
                setSelectedAction('All');
                setSelectedDate('');
              }}
              className="text-teal-700 hover:underline font-bold"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Description / Details</th>
                <th className="py-3 px-4 text-right">Field Changes & Diffs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No audit records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  const isExpanded = expandedLogId === log.id;
                  const hasChanges = (log.fieldChanges && log.fieldChanges.length > 0) || log.oldValue || log.newValue;
                  const displayDate = log.date || log.timestamp.split('T')[0];
                  const displayTime = log.time || new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <React.Fragment key={log.id}>
                      <tr className={`hover:bg-teal-50/20 transition-colors ${isExpanded ? 'bg-teal-50/30' : ''}`}>
                        {/* Index */}
                        <td className="py-3 px-4 text-center font-mono text-slate-400 font-semibold text-[11px]">
                          {index + 1}
                        </td>

                        {/* Date & Time */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            <span>{displayTime}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">{displayDate}</span>
                        </td>

                        {/* User & Role */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{log.user}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Role: {log.role}
                          </span>
                        </td>

                        {/* Module */}
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getModuleBadgeColor(log.module)}`}>
                            {log.module}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>

                        {/* Record ID */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {log.recordId ? (
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                              {log.recordId}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">-</span>
                          )}
                        </td>

                        {/* Details */}
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-semibold text-slate-800 text-xs line-clamp-2">
                            {log.details}
                          </p>
                        </td>

                        {/* View Diffs / Expand */}
                        <td className="py-3 px-4 text-right">
                          {hasChanges ? (
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-teal-800 font-bold rounded-lg border border-slate-200 transition-colors inline-flex items-center gap-1 text-[11px]"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              <span>{isExpanded ? 'Hide Diffs' : 'View Changes'}</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">No diffs</span>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Diffs Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          <td colSpan={8} className="p-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <div className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-teal-600" />
                                  <span>Field-by-Field Changes & Value Audit: {log.recordId}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">ID: {log.id}</span>
                              </div>

                              {/* Structured Field Changes List if available */}
                              {log.fieldChanges && log.fieldChanges.length > 0 ? (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-3 gap-2 font-bold text-[10px] text-slate-400 uppercase tracking-wider px-2">
                                    <span>Field Name</span>
                                    <span>Previous Value (পুরোনো মান)</span>
                                    <span>Updated Value (নতুন মান)</span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {log.fieldChanges.map((change, idx) => (
                                      <div
                                        key={idx}
                                        className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-lg text-xs border border-slate-100 items-center"
                                      >
                                        <span className="font-bold text-slate-800 capitalize">
                                          {change.label || change.field}
                                        </span>
                                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 line-through">
                                          {String(change.oldVal ?? 'None')}
                                        </span>
                                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold flex items-center gap-1">
                                          <ArrowRight className="w-3 h-3 shrink-0 text-emerald-500" />
                                          {String(change.newVal ?? 'None')}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                /* Fallback to Old / New summary diffs */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {log.oldValue && (
                                    <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
                                      <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider mb-1">
                                        Previous State / Old Value:
                                      </div>
                                      <div className="text-xs text-rose-950 font-mono font-medium whitespace-pre-wrap">
                                        {log.oldValue}
                                      </div>
                                    </div>
                                  )}

                                  {log.newValue && (
                                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                                      <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                                        Updated State / New Value:
                                      </div>
                                      <div className="text-xs text-emerald-950 font-mono font-bold whitespace-pre-wrap">
                                        {log.newValue}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
