import React from 'react';
import { useErp } from '../context/ErpContext';
import { GoogleSheetsConnectionCard } from './GoogleSheetsConnectionCard';
import {
  FileSpreadsheet,
  RefreshCw,
  Download,
  Upload,
  ShieldCheck,
  Table,
  Layers,
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
    showToast
  } = useErp();

  const sheetsList = [
    { name: '1. MAIN DASHBOARD', rows: 'Real-time KPIs & Live Feeds', status: 'Active Sync', icon: Layers },
    { name: '2. PATIENT 360', rows: `${patients?.length || 0} Registered Patients`, status: 'Synced', icon: Table },
    { name: '3. APPOINTMENT QUEUE', rows: `${appointments?.length || 0} Appointments`, status: 'Synced', icon: Table },
    { name: '4. CLINICAL VISITS', rows: `${clinicalVisits?.length || 0} Consultations`, status: 'Synced', icon: Table },
    { name: '5. PRESCRIPTION MASTER', rows: `${clinicalVisits?.length || 0} Refractions`, status: 'Synced', icon: Table },
    { name: '6. SPECTACLE ORDERS', rows: `${spectacleOrders?.length || 0} Lab Orders`, status: 'Synced', icon: Table },
    { name: '7. LENS INVENTORY', rows: `${lenses?.length || 0} Lens SKUs`, status: 'Synced', icon: Table },
    { name: '8. FRAME INVENTORY', rows: `${frames?.length || 0} Frame Models`, status: 'Synced', icon: Table },
    { name: '9. RETAIL POS BILLING', rows: `${retailSales?.length || 0} Invoices`, status: 'Synced', icon: Table },
    { name: '10. STOCK LEDGER', rows: `${stockMovements?.length || 0} Logged Transactions`, status: 'Synced', icon: Table },
    { name: '11. DUE & AGING', rows: `${dueAccounts?.length || 0} Open Receivables`, status: 'Synced', icon: Table },
    { name: '12. MEDICINE MASTER', rows: `${medicines?.length || 0} Formularies`, status: 'Synced', icon: Table }
  ];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Google Sheets Master Hub & Cloud Sync (গুগল শিট হাব)
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Connect any Google Account, select or create your ERP spreadsheet, and synchronize all 12 operational modules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={syncWithGoogleSheets}
            disabled={googleSheetsStatus?.syncing}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${googleSheetsStatus?.syncing ? 'animate-spin' : ''}`} />
            {googleSheetsStatus?.syncing ? 'Syncing...' : '⚡ SYNC ALL SHEETS NOW'}
          </button>
        </div>
      </div>

      {/* Dynamic Google Sheets Connection Card */}
      <GoogleSheetsConnectionCard />

      {/* Sync Status Banner & Backup utilities */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-5 rounded-3xl shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">
                Google Sheets Multi-Tab Architecture & Local Backup
              </h2>
            </div>
            <p className="text-xs text-emerald-200 max-w-2xl">
              Paharpur Eye Care ERP runs in seamless synchronization with your Google Spreadsheet.
              Last successful sync: <strong>{settings.lastGoogleSheetSync ? new Date(settings.lastGoogleSheetSync).toLocaleString() : 'Ready'}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportBackupJson}
              className="px-3.5 py-2 bg-emerald-800/80 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Local Backup (.JSON)
            </button>

            <label className="px-3.5 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-teal-600" />
              Restore Backup
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* 12 Google Sheets Master Tabs Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-600" />
          Synchronized ERP Tables in Spreadsheet (শিট ওয়ার্কবুক কাঠামো)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sheetsList.map((st, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
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

    </div>
  );
};
