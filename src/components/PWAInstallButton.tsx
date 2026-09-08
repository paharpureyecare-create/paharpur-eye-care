import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

interface PWAInstallButtonProps {
  compact?: boolean;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false, className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as an installed PWA, hide or show installed indicator
  if (isInstalled) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>App Installed</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Browser doesn't have prompt yet, show instructional hint modal
      setShowIOSGuide(true);
    }
  };

  if (compact) {
    return (
      <>
        <button
          id="pwa-install-compact-btn"
          onClick={handleInstallClick}
          title="Install Paharpur Eye Care ERP App on this device"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 text-xs font-bold shadow-xs active:scale-95 transition-all ${className}`}
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span className="hidden xs:inline">Install App</span>
        </button>

        {showIOSGuide && (
          <InstallInstructionsModal onClose={() => setShowIOSGuide(false)} isIOS={isIOS} />
        )}
      </>
    );
  }

  return (
    <>
      <button
        id="pwa-install-btn"
        onClick={handleInstallClick}
        className={`flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white font-bold text-xs shadow-sm hover:from-teal-800 hover:to-emerald-700 active:scale-98 transition-all ${className}`}
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>Install Android / PWA App</span>
      </button>

      {showIOSGuide && (
        <InstallInstructionsModal onClose={() => setShowIOSGuide(false)} isIOS={isIOS} />
      )}
    </>
  );
};

interface ModalProps {
  onClose: () => void;
  isIOS: boolean;
}

const InstallInstructionsModal: React.FC<ModalProps> = ({ onClose, isIOS }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-xs">
              PEC
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Install Paharpur ERP</h3>
              <p className="text-[11px] text-slate-500">Standalone App Mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
          {isIOS ? (
            <>
              <p className="font-semibold text-slate-800">To install on iPhone / iPad:</p>
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200 text-[11px]">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-teal-600">1.</span>
                  <span>Tap the <strong>Share</strong> icon in the Safari toolbar at the bottom.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-teal-600">2.</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-teal-600">3.</span>
                  <span>Tap <strong>Add</strong> at top-right. The app icon will appear on your home screen!</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold text-slate-800">To install on Android Chrome:</p>
              <div className="p-3 bg-teal-50/70 rounded-xl space-y-2 border border-teal-200 text-[11px] text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-teal-700">1.</span>
                  <span>Tap the <strong>3 vertical dots (⋮)</strong> menu in Chrome at top-right.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-teal-700">2.</span>
                  <span>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-teal-700">3.</span>
                  <span>Confirm by tapping <strong>Install</strong>. The ERP will open without the browser bar like a native Android app!</span>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg text-emerald-800 text-[11px]">
            <Smartphone className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Opens directly in full-screen standalone mode with offline caching.</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
