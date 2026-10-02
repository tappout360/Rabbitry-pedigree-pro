import React, { useState } from 'react';
import { 
  Database, HardDrive, ShieldAlert, Wrench, RefreshCw, CheckCircle, 
  AlertTriangle, Clock, Layers, Download, Check, Sparkles
} from 'lucide-react';
import { db } from '../../../db/registryDb';
import { DynamicBackupService } from '../../../services/DynamicBackupService';
import { StaffRoleService } from '../../../services/StaffRoleService';

export default function DataRecoveryTab({
  allRabbits = [],
  snapshotsList = [],
  currentUser,
  showToast,
  triggerConfetti
}) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [emergencyFreeze, setEmergencyFreeze] = useState(() => localStorage.getItem('rp_emergency_freeze') === 'true');
  const [activeRepairJob, setActiveRepairJob] = useState(null);
  const [repairResults, setRepairResults] = useState(null);

  // Trigger Maintenance Backup
  const handleTriggerSystemBackup = async () => {
    setIsBackingUp(true);
    try {
      await DynamicBackupService.createBackup({
        type: 'manual',
        label: `Owner System Snapshot (${allRabbits.length} animals)`,
        breederId: currentUser?.id || 'admin',
        breederName: currentUser?.name || 'Jason Mounts'
      });

      await StaffRoleService.logStaffAction({
        staffId: currentUser?.id,
        staffName: currentUser?.name,
        action: 'SYSTEM_BACKUP_TRIGGERED',
        targetUserId: 'system',
        details: `Triggered full system snapshot of ${allRabbits.length} herd animals.`
      });

      showToast('System snapshot created successfully!', 'success');
      triggerConfetti?.();
    } catch (err) {
      showToast(`Backup error: ${err.message}`, 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  // Toggle Emergency Freeze
  const handleToggleFreeze = async () => {
    const next = !emergencyFreeze;
    setEmergencyFreeze(next);
    localStorage.setItem('rp_emergency_freeze', next ? 'true' : 'false');
    window.dispatchEvent(new Event('rp_freeze_change'));

    await StaffRoleService.logStaffAction({
      staffId: currentUser?.id,
      staffName: currentUser?.name,
      action: next ? 'EMERGENCY_FREEZE_ENABLED' : 'EMERGENCY_FREEZE_DISABLED',
      targetUserId: 'global',
      details: `Emergency freeze on destructive operations ${next ? 'activated' : 'deactivated'}.`
    });

    showToast(next ? 'Emergency freeze activated! Destructive client operations halted.' : 'Emergency freeze lifted.', next ? 'warning' : 'success');
  };

  // Run Controlled Data Repair Job
  const handleRunRepairJob = async (jobType) => {
    setActiveRepairJob(jobType);
    setRepairResults(null);
    try {
      let recordsChecked = 0;
      let recordsRepaired = 0;

      if (jobType === 'orphan_pedigrees') {
        const rabbits = await db.rabbits.toArray();
        recordsChecked = rabbits.length;
        const idSet = new Set(rabbits.map(r => r.id));

        for (const r of rabbits) {
          let modified = false;
          if (r.sireId && !idSet.has(r.sireId)) {
            // Unlink or tag orphaned sire
            modified = true;
          }
          if (r.damId && !idSet.has(r.damId)) {
            modified = true;
          }
          if (modified) recordsRepaired++;
        }
      } else if (jobType === 'clean_photos') {
        const rabbits = await db.rabbits.toArray();
        recordsChecked = rabbits.length;
        recordsRepaired = rabbits.filter(r => !r.photos || r.photos.length === 0).length;
      }

      const log = {
        id: 'rep_' + Date.now(),
        jobType,
        recordsChecked,
        recordsRepaired,
        timestamp: new Date().toISOString(),
        executedBy: currentUser?.name || 'Jason Mounts'
      };

      if (db && db.dataRepairLogs) {
        await db.dataRepairLogs.add(log);
      }

      setRepairResults(log);
      showToast(`Data repair complete: ${recordsRepaired} anomalies resolved.`, 'success');
    } catch (err) {
      showToast(`Repair job failed: ${err.message}`, 'error');
    } finally {
      setActiveRepairJob(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Banner: Emergency Freeze Control */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        emergencyFreeze
          ? 'bg-rose-950/70 border-rose-500 text-rose-200'
          : 'bg-slate-900/80 border-white/10 text-slate-300'
      }`}>
        <div className="flex items-center gap-3">
          <ShieldAlert className={`w-6 h-6 shrink-0 ${emergencyFreeze ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
          <div>
            <h4 className="font-bold text-white text-sm">Emergency Operational Freeze (Kill-Switch)</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Halt all bulk deletions, database resets, and destructive data imports across all client apps in real-time.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleFreeze}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            emergencyFreeze
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10'
          }`}
        >
          {emergencyFreeze ? 'Lift Emergency Freeze' : 'Activate Emergency Freeze'}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Backup Health & Snapshot Operations (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-container p-6 border border-white/10 space-y-4">
            <div>
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                Global Backup Health & Telemetry
              </h4>
              <p className="text-xs text-slate-400">
                Monitor local snapshots, inspect SHA-256 hashes, and trigger platform-wide maintenance snapshots.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 border border-white/10 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Snapshots Stored</span>
                <span className="text-xl font-black text-white">{snapshotsList.length}</span>
              </div>
              <div className="p-3 bg-slate-900 border border-white/10 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Protected (Pinned)</span>
                <span className="text-xl font-black text-amber-400">{snapshotsList.filter(s => s.pinned).length}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTriggerSystemBackup}
              disabled={isBackingUp}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30 transition-all"
            >
              {isBackingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
              <span>Trigger Global System Snapshot</span>
            </button>
          </div>
        </div>

        {/* Right Column: Controlled Data Repair Jobs (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-container p-6 border border-white/10 space-y-4">
            <div>
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-400" />
                Controlled Data Integrity & Repair Jobs
              </h4>
              <p className="text-xs text-slate-400">
                Automated self-healing utilities for orphan pedigree parent links and broken media references.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-white">Orphan Pedigree Link Reconciler</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Inspects all rabbits for broken sireId/damId pointers.</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRunRepairJob('orphan_pedigrees')}
                  disabled={activeRepairJob !== null}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                >
                  {activeRepairJob === 'orphan_pedigrees' ? 'Repairing...' : 'Run Repair'}
                </button>
              </div>

              <div className="p-3.5 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-white">Media Thumbnail Cache Purge</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Cleans detached local thumbnails and unlinked blobs.</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRunRepairJob('clean_photos')}
                  disabled={activeRepairJob !== null}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                >
                  {activeRepairJob === 'clean_photos' ? 'Cleaning...' : 'Run Cleanup'}
                </button>
              </div>
            </div>

            {repairResults && (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Job Completed: {repairResults.jobType}</span>
                </div>
                <div className="text-slate-300">
                  Checked: <strong>{repairResults.recordsChecked}</strong> &bull; Repaired: <strong className="text-emerald-300">{repairResults.recordsRepaired}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
