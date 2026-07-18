import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';

/**
 * Animated slide-up toast component that allows users to undo a delete action
 * within a given countdown time.
 */
export default function UndoToast({ message, onUndo, onDismiss, duration = 10000 }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  return (
    <div className="fixed bottom-20 right-6 z-50 animate-slide-up max-w-sm w-full bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex flex-col gap-2.5">
      {/* Toast Content */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold text-white leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between gap-4 mt-1">
        <button
          onClick={onUndo}
          className="flex items-center gap-1.5 text-[11px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition-colors border-none bg-transparent cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Undo Action
        </button>
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
          Auto-clearing...
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1.5">
        <div
          className="h-full bg-indigo-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
