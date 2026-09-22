import React, { useState } from 'react';
import { CheckCircle2, Circle, ArrowRight, Sparkles, ChevronDown, ChevronUp, ShieldCheck, Download } from 'lucide-react';

export default function BarnLaunchpadChecklist({
  currentUser,
  rabbits = [],
  breedings = [],
  onNavigateTab,
  onOpenAddRabbit,
  onOpenVaultBackup,
  onOpenSettings
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('rp_launchpad_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem('rp_launchpad_collapsed', next ? 'true' : 'false');
    } catch {}
  };

  // Step 1: Profile configured
  const hasProfile = Boolean(currentUser?.rabbitryName && currentUser?.name);

  // Step 2: Stock added (at least 1 active rabbit/cavy)
  const activeStock = rabbits.filter(r => r && r.status !== 'pedigree_only' && r.status !== 'sold' && r.status !== 'dead');
  const hasStock = activeStock.length > 0;

  // Step 3: Weight or health record logged
  const hasWeightOrHealth = rabbits.some(r => 
    (r.weightHistory && r.weightHistory.length > 0) || 
    (r.healthLogs && r.healthLogs.length > 0)
  );

  // Step 4: Breeding scheduled
  const hasBreeding = breedings.length > 0;

  // Step 5: Vault backup downloaded
  const hasBackup = Boolean(localStorage.getItem('rp_last_vault_backup_date'));

  const steps = [
    {
      id: 'profile',
      title: 'Configure Rabbitry Profile & ARBA Prefix',
      description: 'Set your official rabbitry name, breeder credentials, and tattoo prefix.',
      completed: hasProfile,
      actionLabel: 'Open Settings',
      onAction: onOpenSettings
    },
    {
      id: 'stock',
      title: 'Register or Import Your Breeding Stock',
      description: `Add your foundation bucks and does or import from Evans/CSV (${activeStock.length} added).`,
      completed: hasStock,
      actionLabel: 'Add Stock',
      onAction: onOpenAddRabbit
    },
    {
      id: 'records',
      title: 'Log First Barn Weight or Health Check',
      description: 'Record nest box kits weight or check ear mite/claw health.',
      completed: hasWeightOrHealth,
      actionLabel: 'Go to Herd',
      onAction: () => onNavigateTab('rabbits')
    },
    {
      id: 'breeding',
      title: 'Schedule a Breeding Pair',
      description: 'Calculate gestation, palpation date (day 12-14), and nest box placement (day 28).',
      completed: hasBreeding,
      actionLabel: 'Breeding Calendar',
      onAction: () => onNavigateTab('scheduler')
    },
    {
      id: 'backup',
      title: 'Download Initial Safety Vault Backup',
      description: 'Export an encrypted offline snapshot of your pedigrees and herd records.',
      completed: hasBackup,
      actionLabel: 'Export Vault',
      onAction: onOpenVaultBackup
    }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // If user completed 100% and previously collapsed, keep minimized
  if (completedCount === steps.length && isCollapsed) {
    return (
      <div className="glass-container p-3 px-4 flex items-center justify-between border border-emerald-500/30 bg-emerald-950/20 text-xs">
        <div className="flex items-center gap-2 text-emerald-300 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Barn Launchpad: 100% Complete & Operational!</span>
        </div>
        <button 
          onClick={toggleCollapse}
          className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
        >
          View Checklist <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="glass-container p-5 border-2 border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/30 relative overflow-hidden text-left">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400"></div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600/30 border border-indigo-400/40 rounded-xl text-indigo-300">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              Barn Launchpad — First 30 Days
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {completedCount}/{steps.length} Complete ({progressPercent}%)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Essential milestones to ensure your rabbitry records are secure, compliant, and thriving.
            </p>
          </div>
        </div>

        <button 
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          title={isCollapsed ? "Expand Checklist" : "Collapse Checklist"}
        >
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-2 mb-4 overflow-hidden border border-white/10">
        <div 
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Steps List */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {steps.map((step, idx) => (
            <div 
              key={step.id} 
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                step.completed 
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300' 
                  : 'bg-white/5 border-white/10 text-white hover:border-indigo-500/40'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <span className={`text-xs font-bold leading-tight ${step.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {idx + 1}. {step.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {step.description}
                </p>
              </div>

              {!step.completed ? (
                <button
                  type="button"
                  onClick={step.onAction}
                  className="w-full mt-auto py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-md shadow-indigo-600/20"
                >
                  <span>{step.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-auto pt-1">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
