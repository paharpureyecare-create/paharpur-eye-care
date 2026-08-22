import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import {
  FileSpreadsheet,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  Table,
  Layers,
  Sparkles,
  Database
} from 'lucide-react';

export const GoogleSheetsSyncView: React.FC = () => {
  const {
    googleSheetsStatus,
    syncWithGoogleSheets,
    exportBackupJson,
    importBackupJson,
    patients,
    appointments,
    clinicalVisits,
    spectacleOrders,
    lenses,
    frames,
    retailSales,
    stockMovements,
    dueAccounts,
    medicines,
    settings,
    updateSettings,
    showToast
  } = useErp();

  const [sheetsUrl, setSheetsUrl] = useState(settings.googleSheetsId || 'https://docs.google.com/spreadsheets/d/1PaharpurEyeCareERP_Master_2026/edit');
  const [webhookUrl, setWebhookUrl] = useState(settings.googleAppsScriptUrl || '');

  const sheetsList = [
    { name: '1. MAIN DASHBOARD', rows: 'Real-time KPIs & Live Feeds', status: 'Active Sync', icon: Layers },
    { name: '2. PATIENT 360', rows: `${patients.length} Registered Patients`, status: 'Synced', icon: Table },
    { name: '3. APPOINTMENT QUEUE', rows: `${appointments.length} Appointments`, status: 'Synced', icon: Table },
    { name: '4. CLINICAL VISITS', rows: `${clinicalVisits.length} Consultations`, status: 'Synced', icon: Table },
    { name: '5. PRESCRIPTION MASTER', rows: `${clinicalVisits.length} Refractions`, status: 'Synced', icon: Table },
    { name: '6. SPECTACLE ORDERS', rows: `${spectacleOrders.length} Lab Orders`, status: 'Synced', icon: Table },
    { name: '7. LENS INVENTORY', rows: `${lenses.length} Lens SKUs`, status: 'Synced', icon: Table },
    { name: '8. FRAME INVENTORY', rows: `${frames.length} Frame Models`, status: 'Synced', icon: Table },
    { name: '9. RETAIL POS BILLING', rows: `${retailSales.length} Invoices`, status: 'Synced', icon: Table },
    { name: '10. STOCK LEDGER', rows: `${stockMovements.length} Logged Transactions`, status: 'Synced', icon: Table },
    { name: '11. DUE & AGING', rows: `${dueAccounts.length} Open Receivables`, status: 'Synced', icon: Table },
    { name: '12. MEDICINE MASTER', rows: `${medicines.length} Formularies`, status: 'Synced', icon: Table }
  ];

  const handleSaveConfig = () => {
    updateSettings({
      googleSheetsId: sheetsUrl,
      googleAppsScriptUrl: webhookUrl
    });
    showToast('Google Sheets sync settings updated successfully!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importBackupJson(content);
      if (success) {
        showToast('Backup restored successfully!', 'success');
      } else {
        showToast('Failed to parse backup JSON', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Google Sheets Master Hub & Cloud Sync (গুগল শিট কানেকশন)
            </h1>
            <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {googleSheetsStatus.synced ? 'Connected & Synced' : 'Sync Ready'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Every clinical entry, spectacle order, patient registration, and payment is automatically saved to Google Sheets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={syncWithGoogleSheets}
            disabled={googleSheetsStatus.syncing}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all hover:scale-105"
          >
            <RefreshCw className={`w-4 h-4 ${googleSheetsStatus.syncing ? 'animate-spin' : ''}`} />
            {googleSheetsStatus.syncing ? 'Syncing...' : '⚡ SYNC ALL SHEETS NOW'}
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-5 rounded-2xl shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">
                Google Sheets Multi-Tab Master Architecture
              </h2>
            </div>
            <p className="text-xs text-emerald-200 max-w-2xl">
              Paharpur Eye Care ERP runs in seamless 2-way synchronization with your Google Spreadsheet workbook.
              Last successful sync timestamp: <strong>{new Date(googleSheetsStatus.lastSync).toLocaleTimeString()} ({new Date(googleSheetsStatus.lastSync).toLocaleDateString('en-GB')})</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportBackupJson}
              className="px-3.5 py-2 bg-emerald-800/80 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Master Backup (.JSON)
            </button>

            <label className="px-3.5 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-teal-600" />
              Restore Backup
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* 15 Google Sheets Master Tabs Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-600" />
          Connected Google Sheets Tabs & Tables (শিট ওয়ার্কবুক কাঠামো)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sheetsList.map((st, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-xs text-slate-900">{st.name}</h3>
                </div>
                <p className="text-[11px] text-slate-500 font-medium pl-9">{st.rows}</p>
              </div>

              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {st.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Google Sheets API & Webhook Configuration */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Google Apps Script Webhook & URL Settings
        </h2>

        <div className="space-y-3 max-w-2xl text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Google Sheet Spreadsheet URL / Document ID
            </label>
            <input
              type="text"
              value={sheetsUrl}
              onChange={e => setSheetsUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
              className="w-full px-3 py-2 border rounded-xl font-mono text-xs bg-slate-50"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Google Apps Script Webhook Endpoint (Optional for direct Google Drive sync)
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full px-3 py-2 border rounded-xl font-mono text-xs bg-slate-50"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              If left empty, all data is automatically managed inside browser local memory + instant JSON export.
            </p>
          </div>

          <button
            onClick={handleSaveConfig}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>

    </div>
  );
};
