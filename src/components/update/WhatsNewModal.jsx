import React from 'react';
import { X, Sparkles, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { CLIENT_APP_VERSION } from '../../services/DynamicBackupService';

export default function WhatsNewModal({
  isOpen,
  onClose,
  releaseNotes,
  onApplyUpdate,
  isUpdating = false
}) {
  if (!isOpen) return null;

  const notes = releaseNotes || {
    version: CLIENT_APP_VERSION,
    date: '2026-10-02',
    title: 'Dynamic Backup, Restore & Update Hardening Release',
    highlights: [
      'Complete Data Vault Schema v3.0 with SHA-256 integrity verification.',
      'Zero Trust re-authentication guard on all restore actions.',
      'Pre-destructive-action safety snapshots before Evans imports and bulk updates.',
      'Guided restore with visual diff preview and category filtering (Rabbits, Ledger, Medical).',
      'Staged PWA update delivery with offline data migration safety checks.'
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-left">
      <div className="glass-container max-w-lg w-full p-6 border border-indigo-500/40 bg-slate-900 shadow-2xl relative text-slate-100">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">What's New in WarrenWise Pro</h3>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                v{notes.version}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{notes.title}</p>
          </div>
        </div>

        <div className="space-y-3 my-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Key Improvements for Your Rabbitry
          </h4>
          <div className="space-y-2">
            {notes.highlights?.map((hl, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{hl}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold cursor-pointer"
          >
            Close
          </button>
          {onApplyUpdate && (
            <button
              type="button"
              onClick={onApplyUpdate}
              disabled={isUpdating}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Apply & Reload</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
