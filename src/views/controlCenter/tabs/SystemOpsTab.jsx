import React, { useState, useEffect } from 'react';
import { 
  Wrench, AlertTriangle, Database, Activity, HardDrive, RefreshCw, 
  Clock, ShieldAlert, CheckCircle, Smartphone, ExternalLink, Sliders
} from 'lucide-react';
import { DiagnosticService } from '../../../services/DiagnosticService';
import { StaffRoleService } from '../../../services/StaffRoleService';

export default function SystemOpsTab({
  currentUser,
  showToast
}) {
  const [globalMaintenance, setGlobalMaintenance] = useState(() => localStorage.getItem('rp_maintenance_mode') === 'true');
  const [maintenanceMessage, setMaintenanceMessage] = useState(() => localStorage.getItem('rp_maintenance_msg') || 'Scheduled system maintenance in progress.');
  const [moduleMaintenance, setModuleMaintenance] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rp_module_maintenance')) || {
        marketplace: false,
        evansImport: false,
        aiAssistant: false,
        readOnlyBarn: false
      };
    } catch {
      return { marketplace: false, evansImport: false, aiAssistant: false, readOnlyBarn: false };
    }
  });

  const [diagnosticsData, setDiagnosticsData] = useState(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  useEffect(() => {
    runQuickDiagnostics();
  }, []);

  const runQuickDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const data = await DiagnosticService.runFullDiagnostics();
      setDiagnosticsData(data);
    } catch (err) {
      console.warn('Diagnostics error:', err);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const handleToggleGlobalMaintenance = async () => {
    const next = !globalMaintenance;
    setGlobalMaintenance(next);
    localStorage.setItem('rp_maintenance_mode', next ? 'true' : 'false');
    localStorage.setItem('rp_maintenance_msg', maintenanceMessage);
    window.dispatchEvent(new Event('rp_maintenance_change'));

    await StaffRoleService.logStaffAction({
      staffId: currentUser?.id,
      staffName: currentUser?.name,
      action: next ? 'MAINTENANCE_MODE_ENABLED' : 'MAINTENANCE_MODE_DISABLED',
      targetUserId: 'global',
      details: `Global maintenance mode toggled ${next ? 'ON' : 'OFF'}: "${maintenanceMessage}"`
    });

    showToast(next ? 'Global maintenance mode activated!' : 'Maintenance mode deactivated.', next ? 'warning' : 'success');
  };

  const handleToggleModule = (moduleKey) => {
    const updated = { ...moduleMaintenance, [moduleKey]: !moduleMaintenance[moduleKey] };
    setModuleMaintenance(updated);
    localStorage.setItem('rp_module_maintenance', JSON.stringify(updated));
    showToast(`Module "${moduleKey}" maintenance set to ${updated[moduleKey] ? 'OFFLINE' : 'ONLINE'}.`, 'info');
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Global & Module Maintenance Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Global Maintenance Mode (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-container p-6 border border-amber-500/30 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              <div>
                <h4 className="font-bold text-white text-base">Global Maintenance Mode</h4>
                <p className="text-xs text-amber-300/80">Blocks non-admin sessions with customizable banner</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Banner Message</label>
                <input
                  type="text"
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400">Current Status: <strong className={globalMaintenance ? 'text-amber-400' : 'text-emerald-400'}>{globalMaintenance ? 'ACTIVE' : 'INACTIVE'}</strong></span>
                <button
                  type="button"
                  onClick={handleToggleGlobalMaintenance}
                  className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    globalMaintenance
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40'
                      : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-md shadow-amber-600/30'
                  }`}
                >
                  {globalMaintenance ? 'Disable Maintenance' : 'Activate Maintenance'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Module-Level Maintenance (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-container p-6 border border-white/10 rounded-3xl space-y-4">
            <div>
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                Granular Module-Level Maintenance
              </h4>
              <p className="text-xs text-slate-400">
                Disable individual high-load modules during database index migrations without stopping the whole app.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { key: 'marketplace', label: 'Marketplace Feed', desc: 'Listing sales & trades' },
                { key: 'evansImport', label: 'Evans DBF Import', desc: 'Bulk file migrator' },
                { key: 'aiAssistant', label: 'Barn AI Engine', desc: 'Voice & text assistant' },
                { key: 'readOnlyBarn', label: 'Read-Only Barn', desc: 'Temporarily freeze new logs' }
              ].map(m => (
                <div
                  key={m.key}
                  onClick={() => handleToggleModule(m.key)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    moduleMaintenance[m.key]
                      ? 'bg-rose-950/50 border-rose-500/50 text-rose-200'
                      : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{m.label}</span>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      moduleMaintenance[m.key] ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {moduleMaintenance[m.key] ? 'OFFLINE' : 'ONLINE'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Real-Time Storage & Hardware Health Diagnostics */}
      <div className="glass-container p-6 border border-white/10 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Real-Time Storage Quotas & Service Worker Health
            </h4>
            <p className="text-xs text-slate-400">Inspected directly via Web Storage & ServiceWorker APIs.</p>
          </div>

          <button
            type="button"
            onClick={runQuickDiagnostics}
            disabled={isRunningDiagnostics}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiagnostics ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>

        {diagnosticsData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Storage Usage</span>
              <div className="text-lg font-black text-white">
                {diagnosticsData.checks.storage?.estimate?.usageMb || '0'} MB
              </div>
              <p className="text-[11px] text-slate-400">
                {diagnosticsData.checks.storage?.persisted ? '✅ Persisted (Protected from OS eviction)' : 'Standard temporary storage'}
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Service Worker Cache</span>
              <div className="text-lg font-black text-emerald-400">
                {diagnosticsData.checks.serviceWorker?.registered ? 'ACTIVE (v7.1)' : 'Dev Mode Active'}
              </div>
              <p className="text-[11px] text-slate-400">
                {(diagnosticsData.checks.serviceWorker?.caches || []).length} active static caches
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Hardware Capabilities</span>
              <div className="text-lg font-black text-purple-400">Ready</div>
              <p className="text-[11px] text-slate-400">
                Camera: {diagnosticsData.checks.capabilities?.camera ? '✅' : '❌'} &bull; Voice: {diagnosticsData.checks.capabilities?.voiceRecognition ? '✅' : '❌'}
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
