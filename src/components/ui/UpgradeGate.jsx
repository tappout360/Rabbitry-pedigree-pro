import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { Sparkles, Lock } from 'lucide-react';

export default function UpgradeGate({ featureName, children, fallbackMessage, onRedirect }) {
  const { isFeatureAllowed } = useSubscription();
  const allowed = isFeatureAllowed(featureName);

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <div className="glass-container p-6 border-2 border-indigo-500/35 relative overflow-hidden bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/95 flex flex-col items-center justify-center text-center gap-3.5 my-2 min-h-[160px] animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-0"></div>
      
      <div className="w-11 h-11 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 z-10 shadow-lg shadow-indigo-500/5">
        <Lock className="w-5 h-5 animate-pulse" />
      </div>

      <div className="flex flex-col gap-1 text-center max-w-sm z-10">
        <h4 className="text-sm font-black text-white tracking-wide uppercase flex items-center justify-center gap-1.5">
          Premium Feature Locked
        </h4>
        <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
          {fallbackMessage || `This tool is restricted to higher subscription tiers. Activate a Family or Pro subscription to unlock this feature.`}
        </p>
      </div>

      <button
        onClick={() => {
          if (onRedirect) {
            onRedirect();
          } else {
            // Default fallback
            window.dispatchEvent(new CustomEvent('change-tab', { detail: 'billing' }));
          }
        }}
        className="btn-interactive text-[10px] py-2 px-4.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl border-none shadow-md shadow-indigo-500/15 cursor-pointer z-10"
      >
        <Sparkles className="w-3.5 h-3.5" /> View Upgrade Options
      </button>
    </div>
  );
}
