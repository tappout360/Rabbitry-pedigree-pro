import React, { useState, useEffect } from 'react';
import { WifiOff, ShieldCheck, RefreshCw, CheckCircle2, HardDrive } from 'lucide-react';
import { globalSyncAdapter } from '../../adapters/sync/OfflineSyncAdapter';

export default function NetworkStatusBanner() {
  const [syncState, setSyncState] = useState(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: globalSyncAdapter.getQueue().length,
    isSyncing: false,
    isPersisted: false
  }));
  const [showStatusChanged, setShowStatusChanged] = useState(false);

  useEffect(() => {
    // Initial storage check
    globalSyncAdapter.checkStorageEstimate().then(est => {
      if (est) {
        setSyncState(prev => ({ ...prev, isPersisted: est.persisted }));
      }
    });

    const unsub = globalSyncAdapter.subscribe((state) => {
      setSyncState(prev => {
        if (!prev.isOnline && state.isOnline) {
          setShowStatusChanged(true);
          setTimeout(() => setShowStatusChanged(false), 3500);
        }
        return { ...prev, ...state };
      });
    });

    const handleOnline = () => {
      setShowStatusChanged(true);
      setTimeout(() => setShowStatusChanged(false), 3500);
    };

    window.addEventListener('online', handleOnline);

    return () => {
      unsub();
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleManualSync = (e) => {
    e.stopPropagation();
    globalSyncAdapter.processQueue();
  };

  const { isOnline, pendingCount, isSyncing, isPersisted } = syncState;

  // OFFLINE STATE
  if (!isOnline) {
    return (
      <div className="w-full bg-amber-600/95 text-white text-xs font-bold py-2.5 px-4 flex flex-wrap items-center justify-center gap-3 shadow-md sticky top-0 z-50 backdrop-blur-sm border-b border-amber-500/30 transition-all no-print text-center">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
          <span>Working Offline | Barn Mode Active 🌾</span>
        </div>

        {pendingCount > 0 ? (
          <span className="bg-amber-800/80 px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-amber-400/40">
            Saved on device — {pendingCount} change{pendingCount === 1 ? '' : 's'} queued
          </span>
        ) : (
          <span className="text-[11px] opacity-90">All changes saved safely to device storage</span>
        )}

        {isPersisted && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-200 opacity-80" title="Device storage is persisted against OS eviction">
            <HardDrive className="w-3 h-3" /> Storage Locked
          </span>
        )}
      </div>
    );
  }

  // SYNCING IN PROGRESS STATE
  if (isSyncing) {
    return (
      <div className="w-full bg-indigo-600/95 text-white text-xs font-bold py-2 px-4 flex items-center justify-center gap-2 shadow-md sticky top-0 z-50 backdrop-blur-sm border-b border-indigo-400/30 transition-all animate-fade-in no-print">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span>Draining offline queue: syncing {pendingCount} change{pendingCount === 1 ? '' : 's'} to cloud...</span>
      </div>
    );
  }

  // ONLINE WITH PENDING ITEMS STATE
  if (pendingCount > 0) {
    return (
      <div className="w-full bg-slate-900/95 border-b border-indigo-500/40 text-white text-xs font-bold py-2 px-4 flex flex-wrap items-center justify-center gap-3 shadow-md sticky top-0 z-50 backdrop-blur-sm no-print">
        <span className="text-indigo-300">
          Online | {pendingCount} offline update{pendingCount === 1 ? '' : 's'} ready to sync
        </span>
        <button
          type="button"
          onClick={handleManualSync}
          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all border border-indigo-400/40"
        >
          <RefreshCw className="w-3 h-3" /> Sync Now
        </button>
      </div>
    );
  }

  // STATUS RESTORED BANNER
  if (showStatusChanged) {
    return (
      <div className="w-full bg-emerald-600/95 text-white text-xs font-bold py-2 px-4 flex items-center justify-center gap-2 shadow-md sticky top-0 z-50 backdrop-blur-sm border-b border-emerald-500/30 transition-all animate-fade-in no-print">
        <ShieldCheck className="w-4 h-4" />
        <span>Connected Online | Barn Database In Sync 📡</span>
      </div>
    );
  }

  return null;
}
