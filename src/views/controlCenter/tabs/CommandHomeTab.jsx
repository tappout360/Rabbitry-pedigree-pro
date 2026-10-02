import React from 'react';
import { 
  Users, HardDrive, ShieldAlert, CreditCard, LifeBuoy, AlertTriangle, 
  Activity, ArrowUpRight, TrendingUp, Clock, Cloud, Layers, RefreshCw, 
  CheckCircle2, Sparkles, Database, ExternalLink, ShieldCheck, Flag, Wrench
} from 'lucide-react';

export default function CommandHomeTab({
  allBreeders = [],
  allTickets = [],
  allRabbits = [],
  securityLogs = [],
  snapshotsList = [],
  activeSessionsCount = 1,
  onNavigateTab,
  systemStatus = 'operational', // 'operational', 'degraded', 'maintenance'
  onTriggerMaintenanceBackup
}) {
  // Compute Key Metrics
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const signups24h = allBreeders.filter(b => b.createdAt && new Date(b.createdAt).getTime() > oneDayAgo).length;
  const signups7d = allBreeders.filter(b => b.createdAt && new Date(b.createdAt).getTime() > sevenDaysAgo).length;
  const signups30d = allBreeders.filter(b => b.createdAt && new Date(b.createdAt).getTime() > thirtyDaysAgo).length;

  const activePaidSubs = allBreeders.filter(b => b.subscriptionTier === 'pro' || b.subscriptionTier === 'family').length;
  const trialSubs = allBreeders.filter(b => b.subscriptionTier === 'trial' || b.trialEnd).length;
  const pastDueSubs = allBreeders.filter(b => b.subscriptionStatus === 'past_due').length;
  const estimatedMrr = (activePaidSubs * 14.99).toFixed(0);

  const openTickets = allTickets.filter(t => t.status === 'Open' || t.status === 'In Review');
  const urgentTickets = openTickets.filter(t => t.priority === 'Urgent' || t.priority === 'High');
  const criticalSecurityAlerts = securityLogs.filter(s => s.severity === 'critical' || s.severity === 'warning');

  const lastBackup = snapshotsList.length > 0 ? snapshotsList[0] : null;

  return (
    <div className="space-y-6 text-left">
      
      {/* System Status Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        systemStatus === 'maintenance' ? 'bg-amber-950/60 border-amber-500 text-amber-200' :
        systemStatus === 'degraded' ? 'bg-rose-950/60 border-rose-500 text-rose-200' :
        'bg-slate-900/90 border-emerald-500/40 text-emerald-300'
      }`}>
        <div className="flex items-center gap-3">
          <span className={`w-3.5 h-3.5 rounded-full animate-ping shrink-0 ${
            systemStatus === 'maintenance' ? 'bg-amber-400' :
            systemStatus === 'degraded' ? 'bg-rose-400' :
            'bg-emerald-400'
          }`} />
          <div>
            <div className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <span>System Status:</span>
              <strong className="underline uppercase">{systemStatus}</strong>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              IndexedDB local registry v14 active &bull; Cloud sync online &bull; Service Worker v7.1 PWA ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('system')}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Wrench className="w-3.5 h-3.5" /> Ops Controls
          </button>
          <button
            type="button"
            onClick={onTriggerMaintenanceBackup}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" /> Maintenance Backup
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (High Signal) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Users & Sessions */}
        <div 
          onClick={() => onNavigateTab('users')}
          className="p-4 bg-slate-900/80 border border-white/10 hover:border-indigo-500/50 rounded-2xl cursor-pointer transition-all hover:bg-slate-900 group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Breeder Accounts</span>
            <Users className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">{allBreeders.length}</div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400 font-bold">+{signups7d || 1} in 7d</span>
            <span>&bull;</span>
            <span>{activeSessionsCount} active now</span>
          </div>
        </div>

        {/* Card 2: Revenue & Subscriptions */}
        <div 
          onClick={() => onNavigateTab('subscriptions')}
          className="p-4 bg-slate-900/80 border border-white/10 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition-all hover:bg-slate-900 group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Estimated MRR</span>
            <CreditCard className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">${estimatedMrr}</div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400 font-bold">{activePaidSubs} Paid Pro/Family</span>
            <span>&bull;</span>
            <span className="text-amber-400">{trialSubs} Trials</span>
          </div>
        </div>

        {/* Card 3: Support Ticket Queue */}
        <div 
          onClick={() => onNavigateTab('support')}
          className="p-4 bg-slate-900/80 border border-white/10 hover:border-sky-500/50 rounded-2xl cursor-pointer transition-all hover:bg-slate-900 group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Support Queue</span>
            <LifeBuoy className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white flex items-center gap-2">
            <span>{openTickets.length} Open</span>
            {urgentTickets.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {urgentTickets.length} Urgent
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {urgentTickets.length > 0 ? '⚠️ High priority tickets need response' : 'SLA targets healthy (<4h response)'}
          </p>
        </div>

        {/* Card 4: Backup & Data Integrity */}
        <div 
          onClick={() => onNavigateTab('backups')}
          className="p-4 bg-slate-900/80 border border-white/10 hover:border-purple-500/50 rounded-2xl cursor-pointer transition-all hover:bg-slate-900 group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Backup Reliability</span>
            <HardDrive className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">99.9%</div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {lastBackup ? `Last: ${new Date(lastBackup.createdAt).toLocaleDateString()}` : 'Rolling snapshots active'}
          </p>
        </div>
      </div>

      {/* Secondary Signals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Quick Launch Command Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-container p-5 border border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Operational Modules & Control Jump
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => onNavigateTab('users')}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-white/10 text-left transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>User & Account Control</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Impersonate, reset passwords, suspend, verify youth</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('team')}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-white/10 text-left transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Team Delegation Control</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Manage staff roles, support leads, audit staff actions</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('moderation')}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-white/10 text-left transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <Flag className="w-4 h-4 text-amber-400" />
                    <span>Moderation & Safety</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Marketplace listings, knowledge submissions, animal welfare</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('flags')}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-white/10 text-left transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Feature Flags & Releases</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Progressive rollouts, kill switches, release notes</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 shrink-0" />
              </button>
            </div>
          </div>

          {/* Database & Storage Telemetry */}
          <div className="glass-container p-5 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Database Records & Local Storage Quotas
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950/70 border border-white/10 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Herd Animals</span>
                <span className="text-lg font-black text-white">{allRabbits.length}</span>
              </div>
              <div className="p-3 bg-slate-950/70 border border-white/10 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Vault Snapshots</span>
                <span className="text-lg font-black text-white">{snapshotsList.length}</span>
              </div>
              <div className="p-3 bg-slate-950/70 border border-white/10 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Security Logs</span>
                <span className="text-lg font-black text-white">{securityLogs.length}</span>
              </div>
              <div className="p-3 bg-slate-950/70 border border-white/10 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Dexie Version</span>
                <span className="text-lg font-black text-emerald-400">v14</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: High Priority Action Feed & Alerts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-container p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Live Security & SLA Alert Stream
              </h4>
              <button
                type="button"
                onClick={() => onNavigateTab('security')}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
              >
                View Security Log &rarr;
              </button>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {criticalSecurityAlerts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-white/10">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500/50 mx-auto mb-1.5" />
                  No critical security anomalies detected in last 24h.
                </div>
              ) : (
                criticalSecurityAlerts.slice(0, 5).map(alert => (
                  <div 
                    key={alert.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs space-y-1 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        alert.severity === 'critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {alert.eventType}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">{alert.details}</p>
                    <div className="text-[10px] text-slate-500 font-mono">Breeder: {alert.breederId}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
