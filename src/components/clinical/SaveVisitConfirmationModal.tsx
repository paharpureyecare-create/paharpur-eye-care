import React from 'react';
import { ClinicalDraft } from '../../types';
import {
  ClinicalSectionId,
  CLINICAL_SECTIONS_REGISTRY,
  getSectionStatus,
  sanitizeClinicalDraftForSave
} from '../../types/clinicalSections';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Check,
  X,
  FileCheck,
  Printer,
  Sparkles,
  ShieldCheck,
  User,
  Activity,
  Pill,
  Glasses
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSave: (andPrint: boolean) => void;
  draft: ClinicalDraft;
  selectedSections: Record<ClinicalSectionId, boolean>;
}

export const SaveVisitConfirmationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirmSave,
  draft,
  selectedSections
}) => {
  if (!isOpen) return null;

  const selectedList = CLINICAL_SECTIONS_REGISTRY.filter(s => selectedSections[s.id]);
  const unselectedList = CLINICAL_SECTIONS_REGISTRY.filter(s => !selectedSections[s.id]);

  // Validation Warnings Check
  const warnings: string[] = [];

  if (selectedSections.subjectiveRefraction) {
    if (!draft.odPower?.sph && !draft.odPower?.cyl && !draft.osPower?.sph && !draft.osPower?.cyl) {
      warnings.push('Final Prescription Power is selected, but OD and OS sphere/cylinder values are empty.');
    }
  }

  if (selectedSections.diagnosis) {
    const hasDiag = (Array.isArray(draft.diagnosis) && draft.diagnosis.length > 0) || (draft.customDiagnosis && draft.customDiagnosis.trim().length > 0);
    if (!hasDiag) {
      warnings.push('Clinical Diagnosis is selected, but no diagnosis or condition was added.');
    }
  }

  if (selectedSections.medicines) {
    const validMeds = Array.isArray(draft.medicines) ? draft.medicines.filter(m => m.name && m.name.trim().length > 0) : [];
    if (validMeds.length === 0) {
      warnings.push('Prescribed Medicines section is selected, but 0 medicines were added.');
    }
  }

  if (selectedSections.tonometry) {
    if (!draft.examination?.tonometry?.odIop && !draft.examination?.tonometry?.osIop) {
      warnings.push('Tonometry / IOP is selected, but IOP readings are blank.');
    }
  }

  if (selectedSections.keratometry) {
    if (!draft.examination?.keratometry?.od?.k1 && !draft.examination?.keratometry?.os?.k1) {
      warnings.push('Keratometry is selected, but K1/K2 corneal values are blank.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                Review & Confirm Clinical Visit
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Data Safety Guard
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Only selected clinical points will be permanently saved. Unexamined points will not store dummy data.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          
          {/* Patient Overview */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
              <p className="font-extrabold text-slate-900 text-sm">{draft.patientName || 'Walk-in Patient'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">MRD Number</span>
              <p className="font-bold text-slate-800 font-mono">{draft.mrd || 'N/A'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Age / Sex</span>
              <p className="font-bold text-slate-800">{draft.age || '-'}Y / {draft.gender || 'Other'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Consultant Doctor</span>
              <p className="font-bold text-slate-800">{draft.doctor || 'Doctor'}</p>
            </div>
          </div>

          {/* Validation Warnings (if any) */}
          {warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Attention Required: Selected Points Missing Data
              </div>
              <ul className="list-disc list-inside text-[11px] text-amber-700 space-y-1">
                {warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-600 font-medium">
                * You can still proceed to save, or go back to either fill values or uncheck the empty section.
              </p>
            </div>
          )}

          {/* Selected Clinical Sections */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Examined & Selected Sections ({selectedList.length} of {CLINICAL_SECTIONS_REGISTRY.length})
              </h4>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Will be Saved to Record
              </span>
            </div>

            {selectedList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedList.map(s => {
                  const status = getSectionStatus(s.id, selectedSections, draft);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2.5 bg-emerald-50/40 rounded-xl border border-emerald-200"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-slate-900 text-xs truncate">
                          {s.label}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {s.bnLabel}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {status === 'COMPLETED' ? '✓ Recorded' : '● Enabled'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                ⚠️ No clinical sections are selected. Please select at least one clinical point before saving.
              </div>
            )}
          </div>

          {/* Skipped / Unexamined Sections */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-slate-400" />
                Skipped / Unexamined Sections ({unselectedList.length})
              </h4>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Excluded from Database
              </span>
            </div>

            {unselectedList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {unselectedList.map(s => (
                  <span
                    key={s.id}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1"
                  >
                    <span className="text-slate-400">—</span> {s.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                All 19 clinical examination sections were selected for this visit.
              </p>
            )}
          </div>

        </div>

        {/* Action Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors text-xs"
          >
            ← Back to Edit Sections
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onConfirmSave(false)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Visit Only
            </button>
            <button
              type="button"
              onClick={() => onConfirmSave(true)}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Save & Print Rx (A4)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
