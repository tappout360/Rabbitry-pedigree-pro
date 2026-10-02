import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Sliders, ToggleLeft, ToggleRight, ShieldAlert, 
  Wrench, FileText, Check, AlertTriangle, RefreshCw
} from 'lucide-react';
import { featureFlagsService } from '../../../services/FeatureFlagsService';
import { updateManager } from '../../../services/UpdateManagerService';
import { StaffRoleService } from '../../../services/StaffRoleService';

export default function FeatureFlagsTab({
  currentUser,
  showToast
}) {
  const [flags, setFlags] = useState(() => featureFlagsService.getAllFlags());
  const [minVersion, setMinVersion] = useState(() => localStorage.getItem('rp_min_client_version') || '3.0.0');
  const [releaseNotesTitle, setReleaseNotesTitle] = useState('v7.1.0 — Enterprise Disaster Recovery & Root Control');
  const [releaseNotesHighlights, setReleaseNotesHighlights] = useState(
    '• Added Guided Restore Wizard with SHA-256 diff preview\n• Added Team Control Center for staff delegation\n• Instant pre-action safety snapshots before Evans imports\n• Universal search across users and support tickets'
  );

  const handleToggleFlag = async (flagKey) => {
    const current = flags[flagKey];
    const updated = await featureFlagsService.setOverride(flagKey, !current.enabled);
    setFlags(featureFlagsService.getAllFlags());

    await StaffRoleService.logStaffAction({
      staffId: currentUser?.id,
      staffName: currentUser?.name,
      action: !current.enabled ? 'FLAG_ENABLED' : 'FLAG_DISABLED',
      targetUserId: flagKey,
      details: `Feature flag "${flagKey}" toggled to ${!current.enabled ? 'ON' : 'OFF'}.`
    });

    showToast(`Flag "${flagKey}" set to ${!current.enabled ? 'ON' : 'OFF'}`, 'info');
  };

  const handleSaveMinVersion = async () => {
    localStorage.setItem('rp_min_client_version', minVersion.trim());
    await StaffRoleService.logStaffAction({
      staffId: currentUser?.id,
      staffName: currentUser?.name,
      action: 'MIN_VERSION_ENFORCED',
      targetUserId: 'global',
      details: `Enforced minimum PWA client version threshold: v${minVersion.trim()}`
    });
    showToast(`Enforced minimum client version: v${minVersion.trim()}`, 'success');
  };

  const handlePublishReleaseNotes = async () => {
    const highlightsArray = releaseNotesHighlights.split('\n').filter(Boolean);
    const releasePayload = {
      version: updateManager.getCurrentVersion(),
      title: releaseNotesTitle.trim(),
      highlights: highlightsArray,
      publishedAt: new Date().toISOString()
    };

    localStorage.setItem('rp_custom_release_notes', JSON.stringify(releasePayload));

    await StaffRoleService.logStaffAction({
      staffId: currentUser?.id,
      staffName: currentUser?.name,
      action: 'RELEASE_NOTES_PUBLISHED',
      targetUserId: 'global',
      details: `Published What's New release notes for v${releasePayload.version}`
    });

    showToast(`Release notes published for v${releasePayload.version}!`, 'success');
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Feature Flags Grid */}
      <div className="glass-container p-6 border border-white/10 space-y-4">
        <div>
          <h4 className="font-bold text-white text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Progressive Feature Flags & Kill Switches
          </h4>
          <p className="text-xs text-slate-400">
            Dynamically toggle features, target specific rollout tiers, or trigger instant emergency kill switches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(flags).map(([key, flag]) => (
            <div key={key} className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{flag.name || key}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    flag.enabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {flag.enabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{flag.description || 'Feature flag'}</p>
                <div className="text-[10px] text-indigo-300 font-mono">
                  Target: {flag.tier ? `Tier: ${flag.tier.toUpperCase()}` : flag.betaOnly ? 'Beta Channel Only' : '100% Rollout'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[10px] text-slate-400 font-mono">{key}</span>
                <button
                  type="button"
                  onClick={() => handleToggleFlag(key)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    flag.enabled 
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {flag.enabled ? 'Kill Switch (Disable)' : 'Enable Flag'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Release Control & Version Gates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Minimum Version Threshold (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-container p-6 border border-white/10 space-y-4">
            <div>
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                Minimum PWA Version Threshold
              </h4>
              <p className="text-xs text-slate-400">
                Reject outdated PWA client caches before applying backward-incompatible schema migrations.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">Enforced Version</label>
                <input
                  type="text"
                  value={minVersion}
                  onChange={(e) => setMinVersion(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveMinVersion}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-600/30 cursor-pointer"
              >
                Enforce Version Threshold
              </button>
            </div>
          </div>
        </div>

        {/* What's New Release Notes Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-container p-6 border border-white/10 space-y-4">
            <div>
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Publish &ldquo;What&rsquo;s New&rdquo; Release Notes
              </h4>
              <p className="text-xs text-slate-400">
                Edit release note highlights displayed in user modals after applying PWA updates.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">Release Title</label>
                <input
                  type="text"
                  value={releaseNotesTitle}
                  onChange={(e) => setReleaseNotesTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">Highlights (One per line)</label>
                <textarea
                  rows={4}
                  value={releaseNotesHighlights}
                  onChange={(e) => setReleaseNotesHighlights(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none font-mono"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePublishReleaseNotes}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Publish Release Notes
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
