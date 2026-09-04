import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { AutomationRule, AutomationTriggerType } from '../../types';
import {
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Settings,
  MessageSquare,
  Send,
  Plus,
  Play,
  Calendar,
  Sparkles
} from 'lucide-react';
import { formatDate } from './crmUtils';

export const AutomationRulesView: React.FC = () => {
  const {
    automationRules = [],
    toggleAutomationRule,
    templates = [],
    triggerAutomationsCheck,
    showToast
  } = useErp();

  const [filterType, setFilterType] = useState<string>('ALL');

  const triggerIcons: Record<string, string> = {
    SPECTACLE_READY: '👓',
    SPECTACLE_DELIVERED: '📦',
    PAYMENT_DUE_7DAYS: '💰',
    CHECKUP_6MONTHS: '🩺',
    ANNUAL_RECALL_1YEAR: '🔄',
    APPOINTMENT_REMINDER_1DAY: '📅',
    BIRTHDAY_TODAY: '🎂',
    INACTIVE_6MONTHS: '💤'
  };

  const handleTestTrigger = (rule: AutomationRule) => {
    showToast(`Testing automation trigger "${rule.name}"... evaluating eligible patients.`);
    triggerAutomationsCheck();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            Automated WhatsApp Workflows & Recall Rules
          </h2>
          <p className="text-xs text-slate-500">
            Lifecycle triggers that run automatically in the background for spectacle deliveries, due recoveries, and 1-year annual vision recalls
          </p>
        </div>

        <button
          onClick={() => {
            triggerAutomationsCheck();
            showToast('Ran automated triggers check across all optical orders and patients!');
          }}
          className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Play className="w-4 h-4" />
          <span>Execute Daily Auto-Check Now</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {automationRules.map(rule => {
          const associatedTemplate = templates.find(t => t.id === rule.templateId);
          const icon = triggerIcons[rule.triggerType] || '⚡';

          return (
            <div
              key={rule.id}
              className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between space-y-4 shadow-sm ${
                rule.enabled ? 'border-slate-200/90 hover:border-teal-300' : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-xl shrink-0">
                    {icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => toggleAutomationRule(rule.id)}
                  className="text-slate-400 hover:text-teal-600 transition-colors"
                  title={rule.enabled ? 'Click to Disable' : 'Click to Enable'}
                >
                  {rule.enabled ? (
                    <ToggleRight className="w-8 h-8 text-teal-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-300" />
                  )}
                </button>
              </div>

              {/* Trigger details */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">Event Trigger:</span>
                  <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                    {rule.triggerType}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">Condition:</span>
                  <span className="text-slate-700">{rule.conditionText}</span>
                </div>
                {associatedTemplate && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold">Linked Template:</span>
                    <span className="text-teal-700 font-medium truncate max-w-[180px]">{associatedTemplate.name}</span>
                  </div>
                )}
              </div>

              {/* Stats & Trigger count */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-500 text-[11px]">
                  Fired <span className="font-bold text-slate-800">{rule.triggerCount || 0} times</span>
                  {rule.lastTriggered ? ` • Last: ${formatDate(rule.lastTriggered)}` : ''}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestTrigger(rule)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-all"
                  >
                    <Play className="w-3 h-3 text-teal-600" />
                    <span>Test Rule</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
