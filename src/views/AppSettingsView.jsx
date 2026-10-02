import React, { useState, useEffect } from 'react';
import { 
  User, Sliders, Monitor, Bell, Shield, LifeBuoy, Check, Save, 
  Palette, Sun, Moon, Volume2, HardDrive, Smartphone, Award, Lock, ExternalLink, ShieldCheck,
  Activity, Download, Upload, FileText, CheckCircle2, AlertTriangle, Database, RefreshCw, Copy,
  Pin, Trash2, Sparkles, Clock, Cloud, Layers
} from 'lucide-react';
import { getUserRole } from '../services/RbacService';
import { DiagnosticService } from '../services/DiagnosticService';
import { VaultBackupService } from '../services/VaultBackupService';
import { DynamicBackupService } from '../services/DynamicBackupService';
import { updateManager } from '../services/UpdateManagerService';
import GuidedRestoreModal from '../components/backup/GuidedRestoreModal';
import WhatsNewModal from '../components/update/WhatsNewModal';

export default function AppSettingsView({
  currentUser,
  onUpdateUser,
  weightUnit,
  onToggleWeightUnit,
  onOpenSecurityModal,
  onOpenHelpSupport,
  onOpenVaultBackup,
  rabbits = [],
  showToast
}) {
  const [activeSection, setActiveSection] = useState('profile'); // 'profile', 'preferences', 'behavior', 'vault'
  const [diagnosticsData, setDiagnosticsData] = useState(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  // Dynamic Backups State
  const [snapshotsList, setSnapshotsList] = useState([]);
  const [snapshotFilter, setSnapshotFilter] = useState('all'); // 'all', 'manual', 'automatic', 'pre_action', 'pre_update'
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupNote, setBackupNote] = useState('');
  const [autoSchedule, setAutoSchedule] = useState(() => localStorage.getItem('rp_auto_backup_schedule') || 'daily');
  const [selectedRestoreSnapshot, setSelectedRestoreSnapshot] = useState(null);
  const [showGuidedRestore, setShowGuidedRestore] = useState(false);

  // Dynamic Updates State
  const [updateState, setUpdateState] = useState(updateManager.state);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  // Profile Form
  const [name, setName] = useState(currentUser?.name || '');
  const [rabbitryName, setRabbitryName] = useState(currentUser?.rabbitryName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [arbaNumber, setArbaNumber] = useState(currentUser?.arbaMemberNumber || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  // Preferences Form
  const [theme, setTheme] = useState(() => localStorage.getItem('rp_theme') || 'dark');
  const [defaultBarnMode, setDefaultBarnMode] = useState(() => localStorage.getItem('rp_default_barn_mode') === 'true');
  const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('rp_date_format') || 'YYYY-MM-DD');
  const [notifyNestBox, setNotifyNestBox] = useState(true);
  const [notifyKindle, setNotifyKindle] = useState(true);
  const [notifyFdaWithdrawal, setNotifyFdaWithdrawal] = useState(true);
  const [notifyShowDeadlines, setNotifyShowDeadlines] = useState(true);

  // Behavior Form
  const [syncMode, setSyncMode] = useState(() => localStorage.getItem('rp_sync_mode') || 'auto');
  const [photoCompression, setPhotoCompression] = useState(() => localStorage.getItem('rp_photo_compression') || 'medium');
  const [voiceSpeed, setVoiceSpeed] = useState(() => localStorage.getItem('rp_voice_speed') || '1.0');
  const [voiceAutoListen, setVoiceAutoListen] = useState(() => localStorage.getItem('rp_voice_autolisten') === 'true');
  const [youthParentalLock, setYouthParentalLock] = useState(Boolean(currentUser?.parentalConsentVerified));

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setRabbitryName(currentUser.rabbitryName || '');
      setPhone(currentUser.phone || '');
      setArbaNumber(currentUser.arbaMemberNumber || '');
      setBio(currentUser.bio || '');
    }
  }, [currentUser]);

  // Save Profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      name: name.trim(),
      rabbitryName: rabbitryName.trim(),
      phone: phone.trim(),
      arbaMemberNumber: arbaNumber.trim(),
      bio: bio.trim()
    };
    onUpdateUser(updated);
    showToast("Rabbitry profile settings saved!", "success");
  };

  // Save Preferences
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('rp_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    showToast(`Theme updated to ${newTheme}!`, "info");
  };

  const handleToggleBarnModeDefault = (val) => {
    setDefaultBarnMode(val);
    localStorage.setItem('rp_default_barn_mode', val ? 'true' : 'false');
    showToast(`Default Barn Mode on startup: ${val ? 'Enabled' : 'Disabled'}`, "info");
  };

  useEffect(() => {
    loadSnapshots();
    const unsub = updateManager.subscribe(st => setUpdateState(st));
    return unsub;
  }, [currentUser]);

  const loadSnapshots = async () => {
    try {
      const list = await DynamicBackupService.listSnapshots(currentUser?.id);
      setSnapshotsList(list);
    } catch {}
  };

  const handleCreateManualBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const res = await DynamicBackupService.createBackup({
        type: 'manual',
        label: backupNote.trim() || `Manual Vault Backup - ${new Date().toLocaleDateString()}`,
        breederId: currentUser?.id,
        breederName: currentUser?.rabbitryName || currentUser?.name || 'Rabbitry'
      });
      showToast(`Backup created successfully (${res.recordCounts.rabbits} rabbits saved)!`, 'success');
      setBackupNote('');
      await loadSnapshots();
    } catch (err) {
      showToast(`Backup error: ${err.message}`, 'error');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleTogglePin = async (snapshotId, currentPinned) => {
    try {
      await DynamicBackupService.togglePinSnapshot(snapshotId, !currentPinned);
      await loadSnapshots();
      showToast(!currentPinned ? 'Snapshot pinned! It will not be auto-pruned.' : 'Snapshot unpinned.', 'info');
    } catch (e) {
      showToast(`Error: ${e.message}`, 'error');
    }
  };

  const handleDeleteSnapshot = async (snapshotId) => {
    if (!window.confirm('Delete this backup snapshot? This cannot be undone.')) return;
    try {
      await DynamicBackupService.deleteSnapshot(snapshotId, currentUser?.id);
      await loadSnapshots();
      showToast('Backup snapshot deleted.', 'info');
    } catch (e) {
      showToast(`Error: ${e.message}`, 'error');
    }
  };

  const handleScheduleChange = (newSched) => {
    setAutoSchedule(newSched);
    localStorage.setItem('rp_auto_backup_schedule', newSched);
    showToast(`Automatic backup schedule set to ${newSched}.`, 'info');
  };

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    try {
      await updateManager.checkForUpdates();
      showToast('Update check complete.', 'info');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto text-left">
      
      {/* Header Banner */}
      <div className="glass-container p-6 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
            <Sliders className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">App & Rabbitry Settings</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Customize your breeding barn profile, app preferences, offline sync, and security.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSecurityModal}
            className="btn-interactive text-xs py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl border-none flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <Shield className="w-4 h-4" /> Account & Security
          </button>
          <button
            type="button"
            onClick={onOpenHelpSupport}
            className="btn-interactive text-xs py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-white/10 flex items-center gap-1.5 cursor-pointer"
          >
            <LifeBuoy className="w-4 h-4" /> Help & Support
          </button>
        </div>
      </div>

      {/* Zero Trust Security Status Banner */}
      <div className="p-4 bg-slate-950/70 border border-indigo-500/25 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Zero Trust Security Architecture</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full uppercase">
                {getUserRole(currentUser)} Account
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              12-Hour Session Lifetime &bull; Explicit Re-Auth on Sensitive Actions &bull; {currentUser?.twoFactorEnabled ? '2FA Active' : '2FA Recommended'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSecurityModal}
          className="text-indigo-400 hover:text-indigo-300 font-bold text-xs flex items-center gap-1 border-none bg-transparent cursor-pointer self-start md:self-auto"
        >
          Manage Security Credentials &rarr;
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/10 bg-slate-950/30 rounded-2xl p-1 gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveSection('profile')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'profile' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          <User className="w-4 h-4" /> Profile
        </button>
        <button
          onClick={() => setActiveSection('preferences')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'preferences' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          <Palette className="w-4 h-4" /> Preferences
        </button>
        <button
          onClick={() => setActiveSection('behavior')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'behavior' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          <HardDrive className="w-4 h-4" /> Offline & Voice
        </button>
        <button
          onClick={() => setActiveSection('vault')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'vault' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          <Activity className="w-4 h-4" /> Data Vault & Diagnostics
        </button>
      </div>

      {/* SECTION 1: PROFILE SETTINGS */}
      {activeSection === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-container p-6 border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-bold text-white text-base">Rabbitry Identity</h3>
              <p className="text-xs text-slate-400">These details appear on official 4-generation pedigree certificates and bills of sale.</p>
            </div>
            <button
              type="submit"
              className="btn-interactive py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border-none cursor-pointer shadow-md shadow-indigo-600/30"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Breeder Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jason & Emily Mounts"
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Rabbitry / Caviary Name *</label>
              <input
                type="text"
                required
                value={rabbitryName}
                onChange={(e) => setRabbitryName(e.target.value)}
                placeholder="e.g. Grandview Pedigree Barn"
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. (555) 234-5678"
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">ARBA Account / Youth Member #</label>
              <input
                type="text"
                value={arbaNumber}
                onChange={(e) => setArbaNumber(e.target.value)}
                placeholder="e.g. A-88492"
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">About Your Rabbitry / Breeding Goals</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Dedicated to purebred Holland Lops with dense flyback coats and strong crown width..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none"
            />
          </div>

          <div className="p-4 bg-slate-950/60 border border-white/10 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Account Email & Credentials</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Current email: <strong className="text-indigo-300">{currentUser?.email}</strong>. Manage your password, 2FA, and sessions in the Security panel.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenSecurityModal}
              className="btn-interactive py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-white/10 cursor-pointer"
            >
              Manage Credentials
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: PREFERENCES & NOTIFICATIONS */}
      {activeSection === 'preferences' && (
        <div className="glass-container p-6 border border-white/10 space-y-6">
          <div>
            <h3 className="font-bold text-white text-base">App Appearance & Units</h3>
            <p className="text-xs text-slate-400">Configure visual themes, default viewing modes, and measurement standards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              theme === 'dark' ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-900/60 border-white/10'
            }`} onClick={() => handleThemeChange('dark')}>
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-5 h-5 text-indigo-400" />
                <strong className="text-xs text-white">Dark Modern</strong>
              </div>
              <p className="text-[11px] text-slate-400">Default deep slate dark theme designed for barn tablet use and battery saving.</p>
            </div>

            <div className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              theme === 'contrast' ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-900/60 border-white/10'
            }`} onClick={() => handleThemeChange('contrast')}>
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-5 h-5 text-amber-400" />
                <strong className="text-xs text-white">Barn Sunlight Contrast</strong>
              </div>
              <p className="text-[11px] text-slate-400">High-contrast bold typography optimized for outdoor rabbit runs and direct sun.</p>
            </div>

            <div className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              theme === 'light' ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-900/60 border-white/10'
            }`} onClick={() => handleThemeChange('light')}>
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-5 h-5 text-emerald-400" />
                <strong className="text-xs text-white">Clean Light</strong>
              </div>
              <p className="text-[11px] text-slate-400">Crisp white and navy styling ideal for printing prep and desktop office duties.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Default Startup View</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Open directly into touch-friendly Barn Mode on mobile launch.</p>
              </div>
              <input
                type="checkbox"
                checked={defaultBarnMode}
                onChange={(e) => handleToggleBarnModeDefault(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded bg-slate-800 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Primary Weight Standard</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Currently displaying in <strong>{weightUnit.toUpperCase()}</strong>.</p>
              </div>
              <button
                type="button"
                onClick={onToggleWeightUnit}
                className="btn-interactive py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-white/10 cursor-pointer"
              >
                Switch to {weightUnit === 'oz' ? 'Pounds (lbs)' : 'Ounces (oz)'}
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" /> Breeding & Health Notifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="p-3 bg-slate-900/60 border border-white/10 rounded-xl flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Day 28 Nest Box Reminders</span>
                  <span className="text-[10px] text-slate-400">Alerts when gestation reaches day 28 for nest box prep.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyNestBox}
                  onChange={(e) => setNotifyNestBox(e.target.checked)}
                  className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="p-3 bg-slate-900/60 border border-white/10 rounded-xl flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Day 31 Kindling Due Date</span>
                  <span className="text-[10px] text-slate-400">High-priority alert when kits are expected to kindle.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyKindle}
                  onChange={(e) => setNotifyKindle(e.target.checked)}
                  className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="p-3 bg-slate-900/60 border border-white/10 rounded-xl flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">FDA Medication Withdrawal</span>
                  <span className="text-[10px] text-slate-400">Flag animal cards before meat harvest or ARBA show exhibition.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyFdaWithdrawal}
                  onChange={(e) => setNotifyFdaWithdrawal(e.target.checked)}
                  className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="p-3 bg-slate-900/60 border border-white/10 rounded-xl flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Show Entry Deadlines</span>
                  <span className="text-[10px] text-slate-400">Countdowns for ARBA sanctioned pre-entry cutoffs.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyShowDeadlines}
                  onChange={(e) => setNotifyShowDeadlines(e.target.checked)}
                  className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: APP BEHAVIOR & OFFLINE SYNC */}
      {activeSection === 'behavior' && (
        <div className="glass-container p-6 border border-white/10 space-y-6">
          <div>
            <h3 className="font-bold text-white text-base">Offline Sync & Hardware Integration</h3>
            <p className="text-xs text-slate-400">Control how WarrenWise Pro handles offline hutch logs, photos, and voice interaction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl space-y-2">
              <label className="text-xs font-bold text-white block">Offline Cloud Sync Policy</label>
              <select
                value={syncMode}
                onChange={(e) => {
                  setSyncMode(e.target.value);
                  localStorage.setItem('rp_sync_mode', e.target.value);
                  showToast(`Sync policy set to ${e.target.value}!`, "info");
                }}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-white"
              >
                <option value="auto">Automatic (Syncs immediately when connected)</option>
                <option value="wifi_only">WiFi Only (Saves cellular mobile data)</option>
                <option value="manual">Manual Batch (Sync on demand)</option>
              </select>
              <p className="text-[10px] text-slate-400">IndexedDB maintains 100% of all lineages and logs locally with zero latency.</p>
            </div>

            <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl space-y-2">
              <label className="text-xs font-bold text-white block">Photo Caching & Compression</label>
              <select
                value={photoCompression}
                onChange={(e) => {
                  setPhotoCompression(e.target.value);
                  localStorage.setItem('rp_photo_compression', e.target.value);
                  showToast(`Photo compression set to ${e.target.value}!`, "info");
                }}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-white"
              >
                <option value="medium">Optimized WebP (Fast load, crystal-clear 1080p)</option>
                <option value="high">Full Resolution (Uncompressed archival originals)</option>
                <option value="low">Data Saver (Compressed thumbnails for slow connections)</option>
              </select>
              <p className="text-[10px] text-slate-400">Applied to ear tattoo close-ups and breeding buck/doe profile photos.</p>
            </div>
          </div>

          {/* Root AI Voice Preferences */}
          <div className="p-5 bg-slate-950/60 border border-indigo-500/20 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold text-white text-xs">WarrenWise & Root AI Voice Engine</h4>
              </div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-full">
                Hands-Free Barn Assistant
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Control voice speed and auto-wake behavior when recording weights and kindling dates in the barn.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Speech Rate: {voiceSpeed}x</label>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.25"
                  value={voiceSpeed}
                  onChange={(e) => {
                    setVoiceSpeed(e.target.value);
                    localStorage.setItem('rp_voice_speed', e.target.value);
                  }}
                  className="w-full"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-3">
                <input
                  type="checkbox"
                  checked={voiceAutoListen}
                  onChange={(e) => {
                    setVoiceAutoListen(e.target.checked);
                    localStorage.setItem('rp_voice_autolisten', e.target.checked ? 'true' : 'false');
                  }}
                  className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                />
                <span>Auto-activate microphone when opening Barn Mode</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: DATA VAULT, BACKUPS & UPDATES */}
      {activeSection === 'vault' && (
        <div className="glass-container p-6 border border-white/10 space-y-6">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              Dynamic Backup, Restore & Release Control
            </h3>
            <p className="text-xs text-slate-400">
              Enterprise-grade disaster recovery, versioned snapshots with SHA-256 integrity, safe diff restore, and PWA updates.
            </p>
          </div>

          {/* Top Status & Schedule Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Backup Snapshots</span>
                <HardDrive className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {snapshotsList.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {snapshotsList.filter(s => s.pinned).length} pinned snapshots protected
              </p>
            </div>

            <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Last Snapshot</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-sm font-bold text-white truncate">
                {snapshotsList.length > 0
                  ? new Date(snapshotsList[0].createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'No backups yet'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {snapshotsList.length > 0 ? `${snapshotsList[0].type.toUpperCase()} • ${snapshotsList[0].recordCounts?.rabbits || 0} rabbits` : 'Create your first snapshot below'}
              </p>
            </div>

            <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Auto-Backup Schedule</span>
                <Cloud className="w-4 h-4 text-purple-400" />
              </div>
              <select
                value={autoSchedule}
                onChange={(e) => handleScheduleChange(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="daily">Daily Automatic (Rolling 5)</option>
                <option value="weekly">Weekly Automatic</option>
                <option value="off">Manual Only (No Auto)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Rolling auto-backups prune unpinned snapshots
              </p>
            </div>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Create Backup */}
            <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Download className="w-5 h-5" />
                  <h4 className="font-bold text-white text-xs">Create Instant Snapshot</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Extracts complete schema v3.0 snapshot across all 15+ tables with SHA-256 integrity check and cloud sync.
                </p>
                <input
                  type="text"
                  placeholder="Optional snapshot note (e.g. Pre-Show)"
                  value={backupNote}
                  onChange={(e) => setBackupNote(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateManualBackup}
                disabled={isCreatingBackup}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30 transition-all"
              >
                {isCreatingBackup ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Backing Up...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Backup Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Card 2: Guided Restore */}
            <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Upload className="w-5 h-5" />
                  <h4 className="font-bold text-white text-xs">Guided Restore Wizard</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Restore from local snapshot or uploaded backup file with visual diff previews, selective table merging, and Zero Trust re-authentication.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRestoreSnapshot(null);
                  setShowGuidedRestore(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Layers className="w-4 h-4" />
                <span>Launch Restore Wizard</span>
              </button>
            </div>

            {/* Card 3: CSV Stock Export */}
            <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-purple-400">
                  <FileText className="w-5 h-5" />
                  <h4 className="font-bold text-white text-xs">Spreadsheet CSV Export</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Export Evans-compatible and Excel-friendly CSV spreadsheet of your herd stock, weights, and cage locations for offline inspection.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  VaultBackupService.exportStockCsv(rabbits);
                  showToast(`Exported ${rabbits.length} rabbits to CSV!`, 'success');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-600/30 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Stock CSV</span>
              </button>
            </div>
          </div>

          {/* Local Snapshot History Table */}
          <div className="p-5 bg-slate-950/70 border border-white/10 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="font-bold text-white text-xs">Snapshot History & Portable Recovery</h4>
                  <p className="text-[10px] text-slate-400">Pin snapshots to prevent auto-pruning, export portable JSON archives, or restore state.</p>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['all', 'manual', 'automatic', 'pre_action', 'pre_update'].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setSnapshotFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      snapshotFilter === f
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            {snapshotsList.filter(s => snapshotFilter === 'all' || s.type === snapshotFilter).length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-dashed border-white/10 space-y-2">
                <Database className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">No snapshots found matching filter.</p>
                <button
                  type="button"
                  onClick={handleCreateManualBackup}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold"
                >
                  Create Backup Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase font-bold text-slate-400">
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Snapshot / Label</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Records</th>
                      <th className="py-2.5 px-3">Checksum</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {snapshotsList
                      .filter(s => snapshotFilter === 'all' || s.type === snapshotFilter)
                      .map((snap) => {
                        const typeColors = {
                          manual: 'bg-indigo-900/60 text-indigo-300 border-indigo-500/30',
                          automatic: 'bg-amber-900/60 text-amber-300 border-amber-500/30',
                          pre_action: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/30',
                          pre_update: 'bg-purple-900/60 text-purple-300 border-purple-500/30'
                        };

                        return (
                          <tr key={snap.snapshotId} className="hover:bg-white/5 transition-colors">
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeColors[snap.type] || 'bg-slate-800 text-slate-300'}`}>
                                {snap.type}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-medium text-white max-w-[200px] truncate" title={snap.label}>
                              {snap.label}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                              {new Date(snap.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap text-[11px]">
                              {snap.recordCounts?.rabbits || 0} rabbits • {snap.recordCounts?.breedings || 0} breedings
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                              {snap.checksum ? snap.checksum.slice(0, 10) + '...' : 'n/a'}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1.5">
                              {/* Pin Button */}
                              <button
                                type="button"
                                onClick={() => handleTogglePin(snap.snapshotId, snap.pinned)}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  snap.pinned
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                    : 'bg-slate-800 text-slate-400 border-white/10 hover:text-white'
                                }`}
                                title={snap.pinned ? 'Pinned (Protected)' : 'Pin to prevent auto-deletion'}
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>

                              {/* Restore Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRestoreSnapshot(snap);
                                  setShowGuidedRestore(true);
                                }}
                                className="px-2 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-bold"
                              >
                                Restore
                              </button>

                              {/* Download File */}
                              <button
                                type="button"
                                onClick={() => DynamicBackupService.downloadSnapshotFile(snap.snapshotId, currentUser?.id)}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-white/10"
                                title="Download portable JSON backup file"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteSnapshot(snap.snapshotId)}
                                disabled={snap.pinned}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed border border-rose-500/20"
                                title={snap.pinned ? 'Unpin before deleting' : 'Delete snapshot'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Dynamic App Updates & Release Channels */}
          <div className="p-5 bg-slate-950/70 border border-purple-500/30 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="font-bold text-white text-xs">PWA Release Channel & Update Manager</h4>
                  <p className="text-[10px] text-slate-400">Manage release channel, staged feature rollouts, and view release notes.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCheckUpdate}
                  disabled={isCheckingUpdate}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                  <span>Check for Updates</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowWhatsNew(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Release Notes</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-900 border border-white/10 rounded-xl space-y-2">
                <div className="text-slate-400 font-bold text-[10px] uppercase">Installed App Version</div>
                <div className="text-lg font-black text-white flex items-center gap-2">
                  <span>v{updateManager.getCurrentVersion()}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 uppercase">
                    {updateState.channel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {updateState.hasUpdate ? '⚠️ New update downloaded and ready to apply.' : 'Application is up-to-date and offline cached.'}
                </p>
                {updateState.hasUpdate && (
                  <button
                    type="button"
                    onClick={() => updateManager.applyUpdate()}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Apply Update & Reload
                  </button>
                )}
              </div>

              <div className="p-3 bg-slate-900 border border-white/10 rounded-xl space-y-2">
                <div className="text-slate-400 font-bold text-[10px] uppercase">Release Channel Selection</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateManager.setChannel('stable')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      updateState.channel === 'stable'
                        ? 'bg-purple-950/60 border-purple-500 text-white shadow-sm'
                        : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs">Stable</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Recommended for production barns</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateManager.setChannel('beta')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      updateState.channel === 'beta'
                        ? 'bg-purple-950/60 border-purple-500 text-white shadow-sm'
                        : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs">Beta</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Early preview of AI & sync tools</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Barn Diagnostics Panel */}
          <div className="p-5 bg-slate-950/70 border border-indigo-500/30 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="font-bold text-white text-xs">Barn Self-Diagnostics & System Integrity</h4>
                  <p className="text-[10px] text-slate-400">Verify IndexedDB persistence, Service Worker offline cache, and hardware APIs.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setIsRunningDiagnostics(true);
                    try {
                      const data = await DiagnosticService.runFullDiagnostics();
                      setDiagnosticsData(data);
                      showToast('Barn self-diagnostics completed!', 'success');
                    } catch (err) {
                      showToast(`Diagnostics failed: ${err.message}`, 'error');
                    } finally {
                      setIsRunningDiagnostics(false);
                    }
                  }}
                  disabled={isRunningDiagnostics}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  {isRunningDiagnostics ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                  <span>Run Diagnostics</span>
                </button>

                {diagnosticsData && (
                  <button
                    type="button"
                    onClick={() => {
                      const md = DiagnosticService.formatReportMarkdown(diagnosticsData);
                      navigator.clipboard.writeText(md);
                      showToast('Diagnostic report copied to clipboard!', 'success');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Report
                  </button>
                )}
              </div>
            </div>

            {/* Diagnostic Results Grid */}
            {diagnosticsData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* 1. Database */}
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">Database</span>
                    {diagnosticsData.checks.database?.status === 'pass' ? (
                      <span className="text-emerald-400 text-[10px] font-bold">HEALTHY</span>
                    ) : (
                      <span className="text-rose-400 text-[10px] font-bold">ERROR</span>
                    )}
                  </div>
                  <div className="font-mono text-white text-[11px]">
                    Rabbits: {diagnosticsData.checks.database?.counts?.rabbits || 0}
                  </div>
                  <div className="font-mono text-slate-400 text-[10px]">
                    Breedings: {diagnosticsData.checks.database?.counts?.breedings || 0} | Litters: {diagnosticsData.checks.database?.counts?.litters || 0}
                  </div>
                </div>

                {/* 2. Storage */}
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">Persistent Storage</span>
                    {diagnosticsData.checks.storage?.persisted ? (
                      <span className="text-emerald-400 text-[10px] font-bold">PERSISTED</span>
                    ) : (
                      <span className="text-amber-400 text-[10px] font-bold">STANDARD</span>
                    )}
                  </div>
                  <div className="font-mono text-white text-[11px]">
                    {diagnosticsData.checks.storage?.estimate ? `${diagnosticsData.checks.storage.estimate.usageMb} MB used (${diagnosticsData.checks.storage.estimate.percentUsed}%)` : 'Unknown'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {diagnosticsData.checks.storage?.persisted ? 'Protected from OS eviction' : 'Requesting persistence'}
                  </div>
                </div>

                {/* 3. Service Worker */}
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">Service Worker</span>
                    {diagnosticsData.checks.serviceWorker?.registered ? (
                      <span className="text-emerald-400 text-[10px] font-bold">ACTIVE v7.0</span>
                    ) : (
                      <span className="text-amber-400 text-[10px] font-bold">INACTIVE</span>
                    )}
                  </div>
                  <div className="font-mono text-white text-[11px]">
                    {diagnosticsData.checks.serviceWorker?.registered ? 'Offline Barn Mode Ready' : 'Dev Mode Active'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Caches: {(diagnosticsData.checks.serviceWorker?.caches || []).length} active
                  </div>
                </div>

                {/* 4. Hardware APIs */}
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">Hardware APIs</span>
                    <span className="text-indigo-400 text-[10px] font-bold">CAPABLE</span>
                  </div>
                  <div className="text-[10px] text-slate-300 space-y-0.5">
                    <div>Camera: {diagnosticsData.checks.capabilities?.camera ? '✅ Available' : '❌ None'}</div>
                    <div>Native Share: {diagnosticsData.checks.capabilities?.webShare ? '✅ Available' : 'ℹ️ PDF Fallback'}</div>
                    <div>Voice Engine: {diagnosticsData.checks.capabilities?.voiceRecognition ? '✅ Ready' : '❌ Unavailable'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-white/10 text-center text-xs text-slate-400">
                Click "Run Diagnostics" to inspect your local storage quotas, offline cache status, and hardware APIs.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Guided Restore Modal */}
      {showGuidedRestore && (
        <GuidedRestoreModal
          isOpen={showGuidedRestore}
          onClose={() => {
            setShowGuidedRestore(false);
            setSelectedRestoreSnapshot(null);
          }}
          initialSnapshot={selectedRestoreSnapshot}
          currentUser={currentUser}
          onRestoreComplete={() => {
            loadSnapshots();
            window.location.reload();
          }}
        />
      )}

      {/* What's New Release Notes Modal */}
      {showWhatsNew && (
        <WhatsNewModal
          isOpen={showWhatsNew}
          onClose={() => setShowWhatsNew(false)}
          releaseInfo={updateState.releaseNotes || updateState.updateInfo}
          onApplyUpdate={() => updateManager.applyUpdate()}
        />
      )}

    </div>
  );
}
