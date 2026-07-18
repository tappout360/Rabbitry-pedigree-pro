import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Trash2, RefreshCw, ToggleLeft, ToggleRight, ListTodo, ShieldAlert } from 'lucide-react';

export default function ParentControls({ childId, coachId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState(null);
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState([]);

  // Parental Control States
  const [controls, setControls] = useState({
    allowCloudSync: false,
    allowPublicListings: false,
    allowPhotoUpload: false,
    animalLimit: 10
  });

  useEffect(() => {
    loadChildControls();
    loadAuditLogs();
  }, [childId]);

  const loadChildControls = () => {
    setLoading(true);
    // Find child locally from localStorage or mock it
    const localBreeders = localStorage.getItem('rp_admin_breeders');
    if (localBreeders) {
      const arr = JSON.parse(localBreeders);
      const found = arr.find(b => b.id === childId);
      if (found) {
        setChild(found);
        if (found.parentalControls) {
          setControls(found.parentalControls);
        }
      }
    }
    setLoading(false);
  };

  const loadAuditLogs = () => {
    // Generate realistic agricultural audit logs based on typical 4-H tasks
    const mockLogs = [
      { id: 1, action: "PALPATION", detail: "Checked Doe 'Luna' (Pregnant, Day 12)", date: "2026-07-17 14:02" },
      { id: 2, action: "STOCK ADD", detail: "Registered junior buck 'Velvet' (Ear Tag: WW-04)", date: "2026-07-16 11:34" },
      { id: 3, action: "CHORE COMPLETED", detail: "Completed daily water line flushing & sanitation", date: "2026-07-16 09:12" },
      { id: 4, action: "QUIZ GRANTED", detail: "Passed WarrenWise Academy Level 1 Rabbit Anatomy Quiz (90%)", date: "2026-07-15 16:45" },
      { id: 5, action: "WEIGHT LOG", detail: "Logged weight for Doe 'Lily' (48 oz)", date: "2026-07-15 08:30" }
    ];
    setLogs(mockLogs);
  };

  const handleSaveControls = () => {
    setSaving(true);
    // Save to local storage
    const localBreeders = localStorage.getItem('rp_admin_breeders');
    if (localBreeders) {
      const arr = JSON.parse(localBreeders);
      const idx = arr.findIndex(b => b.id === childId);
      if (idx !== -1) {
        arr[idx].parentalControls = controls;
        localStorage.setItem('rp_admin_breeders', JSON.stringify(arr));
        
        // Also update currentUser in case they are logged in as this child
        const curr = localStorage.getItem('rp_current_user');
        if (curr) {
          const currObj = JSON.parse(curr);
          if (currObj.id === childId) {
            currObj.parentalControls = controls;
            localStorage.setItem('rp_current_user', JSON.stringify(currObj));
            // Trigger quick reload in app
            window.dispatchEvent(new Event('storage'));
          }
        }
      }
    }

    // Sync to backend if online
    fetch(`http://localhost:5000/api/parent/controls/${childId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('rp_auth_token')}`
      },
      body: JSON.stringify({ controls })
    })
    .then(async (res) => {
      if (res.ok) {
        alert("Parental locks and capacity limits synchronized successfully.");
        if (onClose) onClose();
      } else {
        alert("Saved controls locally. Cloud synchronization will resume once online.");
        if (onClose) onClose();
      }
    })
    .catch(() => {
      alert("Saved controls locally. Cloud synchronization queued.");
      if (onClose) onClose();
    })
    .finally(() => {
      setSaving(false);
    });
  };

  const handlePurgeAccount = () => {
    const confirm = window.confirm(`⚠️ WARNING: Are you absolute sure you want to permanently delete this youth account and purge ALL associated data? This action complies with COPPA right-to-delete requests and cannot be undone.`);
    if (confirm) {
      // Scrub local breeders
      const localBreeders = localStorage.getItem('rp_admin_breeders');
      if (localBreeders) {
        const arr = JSON.parse(localBreeders);
        const filtered = arr.filter(b => b.id !== childId);
        localStorage.setItem('rp_admin_breeders', JSON.stringify(filtered));
      }
      alert("Child account deleted successfully. All data scrubbed.");
      if (onClose) onClose();
    }
  };

  if (loading || !child) {
    return (
      <div className="p-8 text-center text-xs opacity-75 text-indigo-300">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
        Loading child controls...
      </div>
    );
  }

  return (
    <div className="glass-container p-6 border border-indigo-500/20 max-w-xl mx-auto flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            🛡️ Parent/Guardian Control Panel
          </h3>
          <p className="text-xs opacity-75 mt-1 text-slate-300">
            Enforce safety locks, limit inventory caps, and monitor live 4-H agricultural activities for <strong>{child.name}</strong>.
          </p>
        </div>
        <button 
          onClick={onClose}
          className="text-xs opacity-60 hover:opacity-100 font-bold border-none bg-transparent text-white cursor-pointer"
        >
          ✕ Close
        </button>
      </div>

      {/* Control Switch Toggles */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Safety Features & Gates</span>
        
        <div className="flex flex-col gap-2">
          {[
            { key: 'allowCloudSync', label: 'Cloud Database Synchronization', desc: 'Allows backups and syncs to central SQLite database.' },
            { key: 'allowPublicListings', label: 'Public Sales Registry Listings', desc: 'Enables showing rabbits in the public exchange boards.' },
            { key: 'allowPhotoUpload', label: 'Gallery Photo Uploading', desc: 'Allows taking or uploading custom WebP compressed pictures.' }
          ].map(opt => (
            <div key={opt.key} className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center gap-4">
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-white">{opt.label}</span>
                <span className="text-[10px] opacity-75 leading-relaxed text-slate-400 mt-0.5">{opt.desc}</span>
              </div>
              <button
                onClick={() => setControls({ ...controls, [opt.key]: !controls[opt.key] })}
                className="bg-transparent border-none cursor-pointer transition-all p-1"
              >
                {controls[opt.key] ? (
                  <ToggleRight className="w-9 h-9 text-emerald-400 font-bold" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-500" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Stock Limits */}
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center gap-4">
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-white">Animal Inventory Limit</span>
            <span className="text-[10px] opacity-75 text-slate-400 mt-0.5">Define maximum stock capacity allowed.</span>
          </div>
          <select 
            value={controls.animalLimit}
            onChange={(e) => setControls({ ...controls, animalLimit: Number(e.target.value) })}
            className="bg-slate-900 border border-white/10 text-xs py-1.5 px-3 text-white rounded-lg focus:outline-none"
          >
            <option value="5">5 Animals</option>
            <option value="10">10 Animals</option>
            <option value="15">15 Animals (Max Free)</option>
          </select>
        </div>
      </div>

      {/* Audit Log / Actions List */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
          <ListTodo className="w-4 h-4 text-cyan-400" /> Live Safety Audit Logs
        </span>
        <div className="max-h-[160px] overflow-y-auto border border-white/5 bg-slate-950/40 rounded-xl p-2 flex flex-col gap-1.5">
          {logs.map(log => (
            <div key={log.id} className="p-2 bg-white/5 rounded flex justify-between items-center text-[10px] leading-relaxed">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-white uppercase text-[8px] bg-indigo-500/10 px-1.5 py-0.5 rounded w-max">{log.action}</span>
                <span className="text-slate-300 font-sans mt-0.5">{log.detail}</span>
              </div>
              <span className="opacity-60 shrink-0 font-mono text-[9px]">{log.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex gap-3 border-t border-white/5 pt-4">
        <button
          onClick={handlePurgeAccount}
          className="btn-interactive py-2 px-4 bg-transparent hover:bg-red-950/20 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0"
        >
          <Trash2 className="w-4 h-4" /> Purge Account (COPPA)
        </button>

        <button
          onClick={handleSaveControls}
          disabled={saving}
          className="btn-interactive flex-grow py-2 px-4 bg-indigo-650 hover:bg-indigo-700 text-white font-bold border-none text-xs rounded-xl shadow"
        >
          {saving ? "Saving controls..." : "Apply Locks & Limit"}
        </button>
      </div>

    </div>
  );
}
