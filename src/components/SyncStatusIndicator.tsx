import React, { useState, useEffect, useRef } from 'react';
import { useErp } from '../context/ErpContext';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Activity,
  Zap,
  Layers,
  X,
  Clock,
  Wifi,
  WifiOff,
  Server
} from 'lucide-react';

export const SyncStatusIndicator: React.FC = () => {
  const {
    firestoreConnectionState,
    cloudSyncStatus,
    cloudLastSyncTime,
    pendingWritesCount,
    isReconciling,
    reconcileWithServer,
    pingServerLatency,
    setActiveTab
  } = useErp();

  const [isOpen, setIsOpen] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Esc
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handlePing = async () => {
    setIsPinging(true);
    try {
      const res = await pingServerLatency();
      setLatency(res.latencyMs);
    } finally {
      setIsPinging(false);
    }
  };

  const handleReconcile = async () => {
    await reconcileWithServer();
    handlePing();
  };

  // Determine effective visual state
  const isPending =
    isReconciling ||
    firestoreConnectionState === 'sync-pending' ||
    pendingWritesCount > 0 ||
    cloudSyncStatus === 'syncing';

  const isDisconnected =
    firestoreConnectionState === 'disconnected' ||
    cloudSyncStatus === 'offline' ||
    (typeof navigator !== 'undefined' && !navigator.onLine);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Desktop & Tablet Persistent Button */}
      <button
        id="header-sync-status-indicator-btn"
        onClick={() => {
          setIsOpen(prev => !prev);
          if (!isOpen && latency === null) {
            handlePing();
          }
        }}
        title={`Firestore Connection: ${
          isDisconnected ? 'Disconnected (Offline)' : isPending ? 'Reconciling Data' : 'Connected (Live)'
        } • Click for Real-Time Sync Details`}
        className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs border active:scale-95 ${
          isDisconnected
            ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200 ring-1 ring-rose-300/30'
            : isPending
            ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/30 animate-pulse'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
        }`}
      >
        {/* Status Dot / Spinner */}
        {isPending ? (
          <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
        ) : isDisconnected ? (
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        ) : (
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}

        {/* Status Icon */}
        {isDisconnected ? (
          <CloudOff className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        ) : (
          <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0 hidden xs:inline" />
        )}

        {/* Text Labels - Responsive */}
        <span className="hidden sm:inline font-bold">
          {isDisconnected
            ? 'Offline'
            : isPending
            ? isReconciling
              ? 'Reconciling...'
              : pendingWritesCount > 0
              ? `Syncing (${pendingWritesCount})`
              : 'Reconciling...'
            : 'Connected'}
        </span>

        {/* Visual feedback sub-badge when pending */}
        {isPending && (
          <span className="hidden lg:inline text-[10px] bg-amber-200/80 text-amber-950 font-mono px-1.5 py-0.5 rounded-full">
            syncing
          </span>
        )}
      </button>

      {/* Popover / Synchronization Hub Dropdown */}
      {isOpen && (
        <div
          id="sync-status-popover"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isDisconnected
                    ? 'bg-rose-500/20 text-rose-400'
                    : isPending
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {isDisconnected ? (
                  <WifiOff className="w-4 h-4" />
                ) : isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Wifi className="w-4 h-4" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-tight text-white leading-tight">
                  Firestore Cloud Sync Hub
                </h4>
                <p className="text-[10px] text-slate-400">
                  Real-time Multi-Device State Engine
                </p>
              </div>
            </div>
            <button
              id="sync-popover-close-btn"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Reconciliation Feedback Banner */}
          {isPending && (
            <div
              id="sync-reconciling-feedback-banner"
              className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2.5"
            >
              <RefreshCw className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-amber-900 leading-tight">
                  Reconciling Data with Server...
                </p>
                <p className="text-[11px] text-amber-700 truncate">
                  {pendingWritesCount > 0
                    ? `${pendingWritesCount} mutation${pendingWritesCount === 1 ? '' : 's'} committing to Firestore`
                    : 'Hydrating snapshot updates and stream deltas'}
                </p>
              </div>
            </div>
          )}

          {/* Connection Status Card */}
          <div className="p-4 space-y-3">
            <div
              className={`p-3 rounded-xl border flex items-start gap-3 ${
                isDisconnected
                  ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                  : isPending
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDisconnected ? (
                  <CloudOff className="w-4 h-4 text-rose-600" />
                ) : isPending ? (
                  <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[10px]">
                    Connection State
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isDisconnected
                        ? 'bg-rose-200 text-rose-900'
                        : isPending
                        ? 'bg-amber-200 text-amber-950'
                        : 'bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    {isDisconnected
                      ? 'DISCONNECTED'
                      : isPending
                      ? 'SYNC-PENDING'
                      : 'CONNECTED'}
                  </span>
                </div>
                <p className="text-[11px] mt-1 text-slate-700 leading-relaxed">
                  {isDisconnected
                    ? 'No internet connection detected. Offline multi-tab persistence is active in IndexedDB. Transactions made now will auto-reconcile with the server upon reconnection.'
                    : isPending
                    ? 'Active data reconciliation in progress. Local mutations are synchronizing with the central Firestore cloud cluster.'
                    : 'Real-time bidirectional synchronization is active. Changes made on any clinic terminal propagate here in under a second.'}
                </p>
              </div>
            </div>

            {/* Diagnostic Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                  <Layers className="w-3 h-3 text-teal-600" />
                  <span>Monitored Modules</span>
                </div>
                <div className="mt-1 font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>33 Collections</span>
                  <span className="text-[10px] text-teal-600 font-mono">Live</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                  <Activity className="w-3 h-3 text-teal-600" />
                  <span>Pending Writes</span>
                </div>
                <div className="mt-1 font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span className={pendingWritesCount > 0 ? 'text-amber-600 font-mono' : 'text-slate-700 font-mono'}>
                    {pendingWritesCount} in queue
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {pendingWritesCount > 0 ? 'Draining' : 'Empty'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                  <Database className="w-3 h-3 text-teal-600" />
                  <span>Offline Cache</span>
                </div>
                <div className="mt-1 font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>Multi-Tab Cache</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                  <Clock className="w-3 h-3 text-teal-600" />
                  <span>Last Reconciled</span>
                </div>
                <div className="mt-1 font-bold text-slate-800 text-xs truncate">
                  {cloudLastSyncTime || 'Just now'}
                </div>
              </div>
            </div>

            {/* Server Latency & Cloud Specs */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-600 text-[11px] font-medium">Firestore Roundtrip:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isPinging ? (
                  <span className="text-[11px] text-slate-400 font-mono">Pinging...</span>
                ) : latency !== null ? (
                  <span
                    className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      latency < 150
                        ? 'bg-emerald-100 text-emerald-800'
                        : latency < 400
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {latency} ms
                  </span>
                ) : (
                  <button
                    onClick={handlePing}
                    className="text-[10px] text-teal-600 hover:text-teal-800 font-bold underline"
                  >
                    Test Ping
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                id="sync-reconcile-now-btn"
                onClick={handleReconcile}
                disabled={isReconciling || isDisconnected}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
                <span>{isReconciling ? 'Reconciling...' : 'Reconcile Now'}</span>
              </button>

              <button
                id="sync-open-settings-btn"
                onClick={() => {
                  setIsOpen(false);
                  setActiveTab('settings');
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cloud Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
