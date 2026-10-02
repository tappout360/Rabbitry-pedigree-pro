import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, AlertTriangle, Eye, Download, Filter, 
  Search, ShieldAlert, Key, CheckCircle, RefreshCw
} from 'lucide-react';

export default function SecurityCenterTab({
  securityLogs = [],
  allBreeders = [],
  showToast
}) {
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [searchLogQuery, setSearchLogQuery] = useState('');

  // 2FA adoption calculation
  const totalUsers = allBreeders.length;
  const usersWith2FA = allBreeders.filter(b => b.is2FAEnabled || b.totpSecret).length;
  const adoptionRate = totalUsers > 0 ? Math.round((usersWith2FA / totalUsers) * 100) : 0;

  // Filter logs
  const filteredLogs = securityLogs.filter(log => {
    const matchSeverity = filterSeverity === 'All' || log.severity === filterSeverity.toLowerCase();
    const q = searchLogQuery.toLowerCase().trim();
    const matchQuery = !q ||
      (log.eventType && log.eventType.toLowerCase().includes(q)) ||
      (log.breederId && log.breederId.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q));

    return matchSeverity && matchQuery;
  });

  const handleExportAuditCsv = () => {
    const rows = [
      ['Timestamp', 'Event Type', 'Severity', 'Breeder ID', 'Details', 'Device'],
      ...filteredLogs.map(l => [
        l.timestamp,
        l.eventType,
        l.severity,
        l.breederId,
        `"${String(l.details || '').replace(/"/g, '""')}"`,
        `"${String(l.device || '').replace(/"/g, '""')}"`
      ])
    ];

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security_audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Security audit log exported to CSV!', 'success');
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Security Health Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>2FA TOTP Adoption</span>
            <Key className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{adoptionRate}%</div>
          <p className="text-[11px] text-slate-400 mt-1">{usersWith2FA} of {totalUsers} breeders protected</p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Security Audit Logs</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{securityLogs.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Immutable zero-trust records</p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Critical Incident Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            {securityLogs.filter(l => l.severity === 'critical').length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">High priority security anomalies</p>
        </div>
      </div>

      {/* Audit Log Explorer */}
      <div className="glass-container p-6 border border-white/10 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              Central Security & Audit Trail Explorer
            </h4>
            <p className="text-xs text-slate-400">
              Complete append-only audit trail for authentication, impersonation, permissions, and credential changes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportAuditCsv}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Logs (CSV)
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchLogQuery}
              onChange={(e) => setSearchLogQuery(e.target.value)}
              placeholder="Search by event type, breeder ID, or action details..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {['All', 'Critical', 'Warning', 'Info'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterSeverity(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  filterSeverity === s
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-dashed border-white/10">
              No security log entries match current filters.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  log.severity === 'critical' ? 'bg-rose-950/40 border-rose-500/40' :
                  log.severity === 'warning' ? 'bg-amber-950/40 border-amber-500/40' :
                  'bg-slate-900/80 border-white/10'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-white">{log.eventType}</span>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      log.severity === 'critical' ? 'bg-rose-500/20 text-rose-300' :
                      log.severity === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {log.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Target: <strong className="text-white">{log.breederId}</strong> &bull; {log.details}
                  </p>
                </div>

                <div className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
