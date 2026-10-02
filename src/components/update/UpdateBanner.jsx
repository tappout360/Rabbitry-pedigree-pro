import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { updateManager } from '../../services/UpdateManagerService';
import WhatsNewModal from './WhatsNewModal';

export default function UpdateBanner({ showToast }) {
  const [updateState, setUpdateState] = useState(updateManager.state);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatusText, setUpdateStatusText] = useState('');

  useEffect(() => {
    const unsub = updateManager.subscribe(state => {
      setUpdateState(state);
    });
    return unsub;
  }, []);

  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateManager.applyUpdate((status) => {
        setUpdateStatusText(status);
      });
    } catch (err) {
      setIsUpdating(false);
      if (showToast) showToast(err.message, 'error');
    }
  };

  // 1. Emergency Maintenance Mode (blocking)
  if (updateState.maintenanceMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md text-left text-slate-100">
        <div className="glass-container max-w-md w-full p-6 border border-amber-500/40 bg-slate-900 space-y-3">
          <div className="flex items-center gap-3 text-amber-400">
            <ShieldAlert className="w-8 h-8" />
            <h3 className="text-base font-bold text-white">Scheduled Maintenance Mode</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {updateState.maintenanceMessage || 'RabbitryPedigree Pro is undergoing scheduled database maintenance. Please check back shortly.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Check Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Hard Required Update (blocking modal)
  if (updateState.isHardRequired) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md text-left text-slate-100">
        <div className="glass-container max-w-md w-full p-6 border border-rose-500/50 bg-slate-900 space-y-4">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertTriangle className="w-8 h-8" />
            <div>
              <h3 className="text-base font-black text-white">Crucial Update Required</h3>
              <span className="text-[10px] font-mono text-rose-300">Target Release: v{updateState.latestVersion}</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A mandatory update is required to preserve hutch database schema integrity. An automatic safety snapshot will be taken before activating.
          </p>
          {updateStatusText && (
            <p className="text-[11px] font-mono text-indigo-300 animate-pulse">{updateStatusText}</p>
          )}
          <button
            onClick={handleApplyUpdate}
            disabled={isUpdating}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30"
          >
            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Safely Update & Reload</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Optional Non-Blocking Update Banner
  if (!updateState.updateAvailable || isDismissed) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 border-b border-indigo-500/40 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md relative z-40 text-left">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-lg bg-indigo-500/30 text-indigo-300">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div className="leading-tight">
            <span className="font-bold">Update Ready: </span>
            <span className="text-slate-300">
              RabbitryPedigree Pro v{updateState.latestVersion} is available.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setShowWhatsNew(true)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-[11px] cursor-pointer"
          >
            What's New
          </button>
          <button
            onClick={handleApplyUpdate}
            disabled={isUpdating}
            className="px-3 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-black text-[11px] flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {isUpdating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            <span>{isUpdating ? 'Updating...' : 'Update & Reload'}</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showWhatsNew && (
        <WhatsNewModal
          isOpen={showWhatsNew}
          onClose={() => setShowWhatsNew(false)}
          releaseNotes={updateState.releaseNotes}
          onApplyUpdate={handleApplyUpdate}
          isUpdating={isUpdating}
        />
      )}
    </>
  );
}
