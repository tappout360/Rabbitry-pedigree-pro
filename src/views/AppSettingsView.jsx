import React, { useState, useEffect } from 'react';
import { 
  User, Sliders, Monitor, Bell, Shield, LifeBuoy, Check, Save, 
  Palette, Sun, Moon, Volume2, HardDrive, Smartphone, Award, Lock, ExternalLink
} from 'lucide-react';

export default function AppSettingsView({
  currentUser,
  onUpdateUser,
  weightUnit,
  onToggleWeightUnit,
  onOpenSecurityModal,
  onOpenHelpSupport,
  showToast
}) {
  const [activeSection, setActiveSection] = useState('profile'); // 'profile', 'preferences', 'behavior'

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

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-white/10 bg-slate-950/30 rounded-2xl p-1 gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveSection('profile')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'profile' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          <User className="w-4 h-4" /> Breeder & Rabbitry Profile
        </button>
        <button
          onClick={() => setActiveSection('preferences')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'preferences' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          <Palette className="w-4 h-4" /> Preferences & Notifications
        </button>
        <button
          onClick={() => setActiveSection('behavior')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'behavior' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          <HardDrive className="w-4 h-4" /> App Behavior & Offline Sync
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

    </div>
  );
}
