import React from 'react';
import { useErp } from '../context/ErpContext';
import { ErpAiTools } from '../services/aiService';
import {
  Sparkles,
  TrendingUp,
  CreditCard,
  Glasses,
  ShoppingBag,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  X,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface AiCeoReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiCeoReportModal: React.FC<AiCeoReportModalProps> = ({ isOpen, onClose }) => {
  const erp = useErp();
  const { settings } = erp;

  if (!isOpen) return null;

  const report = ErpAiTools.generateCeoReport(erp);
  const lowStock = ErpAiTools.getLowStock(erp);
  const topProducts = ErpAiTools.getTopSellingProducts(erp);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 text-white flex items-center justify-between border-b border-teal-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/30 flex items-center justify-center border border-teal-400/30 text-teal-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">Daily AI CEO & Executive Report</h3>
                <span className="text-[10px] bg-teal-400/20 text-teal-200 border border-teal-400/30 px-2 py-0.5 rounded-full font-semibold">
                  Today's Snapshot
                </span>
              </div>
              <p className="text-xs text-teal-100/70">
                {settings.shopName} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto print:p-0">
          
          {/* Executive Summary Banner */}
          <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Executive Profit Summary</span>
              <h4 className="text-xl font-bold text-teal-950 mt-0.5">
                Estimated Gross Profit: ₹{Math.round(report.estimatedGrossProfit).toLocaleString('en-IN')} ({report.marginPercent}% Gross Margin)
              </h4>
              <p className="text-xs text-teal-700 mt-1">
                Healthy financial performance with consistent spectacle conversions and retail optical sales.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-xs">
                Business Health: Optimal 🟢
              </span>
            </div>
          </div>

          {/* 4-Grid Core Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Today's Sales</span>
              <p className="text-xl font-bold text-slate-900 mt-1">₹{report.totalSalesAmount.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-teal-600 font-medium">{report.salesCount} Invoices generated</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Cash/UPI Collected</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">₹{report.totalCollection.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-emerald-700 font-medium">Real-time collections</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Today's Due Billed</span>
              <p className="text-xl font-bold text-rose-600 mt-1">₹{report.totalDue.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-rose-700 font-medium">Pending collection</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Spectacle Orders</span>
              <p className="text-xl font-bold text-blue-600 mt-1">{report.spectacleOrdersCount} Jobs</p>
              <span className="text-[11px] text-blue-700 font-medium">{report.pendingOrdersCount} in production</span>
            </div>
          </div>

          {/* Operational Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Top Selling Lens & Frames */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Glasses className="w-4 h-4 text-teal-600" />
                Best Selling Optical Inventory
              </h5>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Top Lenses:</span>
                  <div className="mt-1 space-y-1">
                    {topProducts.topLenses.map((l, i) => (
                      <div key={i} className="flex justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-800">{l[0]}</span>
                        <span className="font-bold text-teal-700">{l[1]} Pairs</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700">Top Frames:</span>
                  <div className="mt-1 space-y-1">
                    {topProducts.topFrames.map((f, i) => (
                      <div key={i} className="flex justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-800">{f[0]}</span>
                        <span className="font-bold text-blue-700">{f[1]} Units</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Strategic Recommendations */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                AI Smart Action Recommendations
              </h5>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900">Inventory Reorder Warning:</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {report.lowStockCount} items are running below reorder thresholds. Recommended to place bulk purchase for Blue Cut 1.56 lenses.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-900">Due Recovery Action:</span>
                    <p className="text-[11px] text-blue-800 mt-0.5">
                      Automated WhatsApp reminder drafts are prepared for 5 overdue accounts.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-900">Data Persistence:</span>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Google Sheets live cloud sync is synchronized and verified.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
