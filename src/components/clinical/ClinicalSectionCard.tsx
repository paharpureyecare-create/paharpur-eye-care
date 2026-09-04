import React from 'react';
import { ClinicalSectionId, ClinicalSectionStatus } from '../../types/clinicalSections';
import { Check, Plus, Minus, Eye, CheckCircle2 } from 'lucide-react';

interface Props {
  id: ClinicalSectionId;
  orderNumber: number;
  title: string;
  bnTitle?: string;
  category?: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  status: ClinicalSectionStatus;
  onToggle: (id: ClinicalSectionId) => void;
  children: React.ReactNode;
  rightHeaderAction?: React.ReactNode;
  summaryPreview?: string;
}

export const ClinicalSectionCard: React.FC<Props> = ({
  id,
  orderNumber,
  title,
  bnTitle,
  category,
  icon,
  isSelected,
  status,
  onToggle,
  children,
  rightHeaderAction,
  summaryPreview
}) => {
  return (
    <div
      id={`section-card-${id}`}
      className={`rounded-2xl transition-all duration-200 border ${
        isSelected
          ? 'bg-white border-slate-300/80 shadow-xs ring-1 ring-slate-900/5'
          : 'bg-slate-50/70 border-dashed border-slate-300 hover:border-teal-400/80 hover:bg-slate-50'
      }`}
    >
      {/* Section Header */}
      <div
        className={`px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isSelected ? 'border-b border-slate-100' : ''
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Compact Toggle Checkbox */}
          <button
            type="button"
            id={`toggle-${id}`}
            onClick={() => onToggle(id)}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-teal-600 text-white shadow-xs hover:bg-teal-700 ring-2 ring-teal-500/20'
                : 'bg-white border-2 border-slate-300 hover:border-teal-500 text-transparent hover:text-slate-300'
            }`}
            title={isSelected ? 'Click to unselect / skip this examination' : 'Click to enable / examine this section'}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          {/* Icon */}
          {icon && (
            <div
              onClick={() => onToggle(id)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-teal-50 text-teal-700'
                  : 'bg-slate-200/60 text-slate-500'
              }`}
            >
              {icon}
            </div>
          )}

          {/* Titles & Meta */}
          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onToggle(id)}>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-xs sm:text-sm font-bold tracking-tight ${
                isSelected ? 'text-slate-900' : 'text-slate-600'
              }`}>
                {orderNumber}. {title}
              </h3>

              {category && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {category}
                </span>
              )}

              {/* Status Badge */}
              {status === 'NOT_SELECTED' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-600">
                  Unselected (Skipped)
                </span>
              )}
              {status === 'SELECTED' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Active for Entry
                </span>
              )}
              {status === 'COMPLETED' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Examined & Recorded
                </span>
              )}
            </div>

            {bnTitle && (
              <p className={`text-[11px] mt-0.5 truncate ${
                isSelected ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {bnTitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Action / Enable Button */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {isSelected ? (
            <>
              {rightHeaderAction}
              <button
                type="button"
                onClick={() => onToggle(id)}
                className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition-colors flex items-center gap-1"
                title="Unselect this point (will not be saved)"
              >
                <Minus className="w-3 h-3" />
                Skip Section
              </button>
            </>
          ) : (
            <button
              type="button"
              id={`enable-btn-${id}`}
              onClick={() => onToggle(id)}
              className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-600 hover:text-white transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Use / Examine Section
            </button>
          )}
        </div>
      </div>

      {/* Body Content (Shown only when selected) */}
      {isSelected ? (
        <div className="p-4 sm:p-5">
          {children}
        </div>
      ) : (
        summaryPreview && (
          <div
            onClick={() => onToggle(id)}
            className="px-4 py-2 text-[11px] text-slate-400 border-t border-slate-200/60 bg-slate-100/40 cursor-pointer hover:text-slate-600 flex items-center justify-between"
          >
            <span>{summaryPreview}</span>
            <span className="text-teal-600 font-semibold flex items-center gap-1">
              Click to examine <Plus className="w-3 h-3" />
            </span>
          </div>
        )
      )}
    </div>
  );
};
