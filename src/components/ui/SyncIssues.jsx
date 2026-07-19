import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, RefreshCw, Sparkles, HelpCircle, ArrowRight, Zap } from 'lucide-react';
import { db } from '../../db/registryDb';

const API_ROOT = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

export default function SyncIssues({ onClose, currentUser, onResolve }) {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchConflicts();
  }, []);

  const fetchConflicts = async () => {
    setLoading(true);
    setErrorMessage('');
    
    // Attempt to load from local Dexie db first
    try {
      const localConflicts = await db.conflicts.toArray();
      setConflicts(localConflicts);
    } catch (e) {
      console.warn("Dexie read failed, falling back to server:", e);
    }

    // Pull live from server if token exists
    const token = localStorage.getItem('rp_auth_token');
    if (token && currentUser) {
      try {
        const response = await fetch(`${API_ROOT}/conflicts/${currentUser.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const cloudConflicts = await response.json();
          setConflicts(cloudConflicts);
          // Sync Dexie with server conflicts
          await db.conflicts.clear();
          if (cloudConflicts.length > 0) {
            await db.conflicts.bulkAdd(cloudConflicts);
          }
        }
      } catch (e) {
        console.error("Cloud conflicts retrieval error:", e);
      }
    }
    setLoading(false);
  };

  const resolveConflict = async (conflictId, resolutionChoice) => {
    setResolvingId(conflictId);
    setErrorMessage('');

    const token = localStorage.getItem('rp_auth_token');
    
    // 1. Update server if online
    if (token) {
      try {
        const res = await fetch(`${API_ROOT}/conflicts/resolve/${conflictId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ resolution: resolutionChoice })
        });
        if (!res.ok) {
          throw new Error("Conflict resolve rejected by server.");
        }
      } catch (e) {
        console.error("Failed online resolve:", e);
        setErrorMessage("Resolution failed. Verify connection.");
        setResolvingId(null);
        return;
      }
    }

    // 2. Apply resolution locally in Dexie database
    try {
      const conflict = conflicts.find(c => c.id === conflictId);
      if (conflict) {
        if (resolutionChoice === 'client') {
          // Local wins: apply conflict's clientValue to target Dexie record
          const targetTable = db[conflict.tbl];
          if (targetTable) {
            const record = await targetTable.get(conflict.recordId);
            if (record) {
              record[conflict.fieldName] = conflict.clientValue;
              // Advance local logical clock counter
              if (!record.vectorClock) record.vectorClock = {};
              const myDevice = localStorage.getItem('rp_device_id') || 'Device-Local';
              record.vectorClock[myDevice] = (record.vectorClock[myDevice] || 0) + 1;
              
              await targetTable.put(record);
            }
          }
        }
        // Remove from local conflicts table
        await db.conflicts.delete(conflictId);
        
        // Remove resolving operations from sync queue in Dexie to avoid re-upload loops
        try {
          await db.syncQueue.where('payload.id').equals(conflict.recordId).delete();
        } catch (queueErr) {
          console.warn("Queue item delete warning:", queueErr);
        }

        if (onResolve) {
          onResolve(conflict.recordId);
        }
      }
      
      // Update UI list
      setConflicts(prev => prev.filter(c => c.id !== conflictId));
    } catch (e) {
      console.error("Dexie resolution write error:", e);
    }
    setResolvingId(null);
  };

  const handleAutoResolveSimple = async () => {
    const nonCritical = conflicts.filter(c => !['rabbits', 'cavies', 'litters'].includes(c.tbl));
    if (nonCritical.length === 0) {
      alert("All remaining conflicts are critical pedigree parameters and require manual breeder review.");
      return;
    }
    setLoading(true);
    for (const c of nonCritical) {
      await resolveConflict(c.id, 'server');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="glass-container p-8 text-center max-w-xl mx-auto flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="text-xs font-semibold opacity-75">Analyzing data sync collisions...</span>
      </div>
    );
  }

  return (
    <div className="glass-container p-6 border border-emerald-500/20 max-w-2xl mx-auto w-full flex flex-col gap-6 text-left relative">
      
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            ⚡ WarrenWise Sync Resolution Panel
          </h3>
          <p className="text-xs opacity-75 mt-1">
            Resolve concurrent offline edits from multiple devices to protect your pedigree databases.
          </p>
        </div>
        <button onClick={onClose} className="text-xs opacity-70 hover:opacity-100 font-bold border-none bg-transparent text-white cursor-pointer">
          ✕ Close
        </button>
      </div>

      {/* Mascot Speech Bubble */}
      <div className="flex gap-4 items-start bg-indigo-950/20 p-4 border border-indigo-500/10 rounded-2xl">
        <div className="text-3xl shrink-0">🐰</div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-white">WarrenWise says:</span>
          <p className="text-[11px] text-indigo-200 leading-relaxed">
            "Oh, whiskers! Multiple devices updated these critical pedigree fields concurrently. Let's review them side-by-side to make sure we don't lose any show records!"
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-semibold rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-4.5 h-4.5 text-red-400 shrink-0" />
          {errorMessage}
        </div>
      )}

      {conflicts.length === 0 ? (
        <div className="p-8 text-center text-xs opacity-70 border border-white/5 bg-slate-900/40 rounded-2xl flex flex-col items-center gap-2">
          <CheckCircle className="w-8 h-8 text-emerald-400 opacity-80" />
          <p className="font-bold text-white">All Clear! No Sync Conflicts</p>
          <p className="text-[10px] opacity-75">Your local hutch records are perfectly synchronized with the cloud.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center bg-indigo-950/10 p-3 rounded-xl border border-white/5">
            <span className="text-xs font-bold text-indigo-200">
              {conflicts.length} unresolved collision(s) detected.
            </span>
            {conflicts.some(c => !['rabbits', 'cavies', 'litters'].includes(c.tbl)) && (
              <button 
                onClick={handleAutoResolveSimple}
                className="py-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold border-none flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3" /> Auto-Resolve Non-Critical
              </button>
            )}
          </div>

          {conflicts.map(c => (
            <div key={c.id} className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col gap-3">
              <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2">
                <span className="font-black text-indigo-300 uppercase tracking-wider">
                  Table: {c.tbl} | Record ID: {c.recordId}
                </span>
                <span className="opacity-60 font-mono">Field: <strong className="text-white">{c.fieldName}</strong></span>
              </div>

              {/* Causality Analysis Timeline */}
              {c.causalityExplanation && (
                <div className="p-3 bg-slate-950/80 border border-indigo-500/10 rounded-xl text-[10px] text-indigo-300 leading-relaxed font-sans">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-indigo-200 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Causality Analysis
                  </div>
                  <p>{c.causalityExplanation}</p>
                </div>
              )}

              {/* Diffs Side-by-Side Comparison */}
              <div className="grid grid-cols-2 gap-4 mt-1">
                {/* Server Column */}
                <div className="p-3.5 bg-slate-950/60 border border-indigo-500/10 rounded-xl text-left flex flex-col gap-2 relative">
                  <span className="absolute top-2 right-2 text-[8px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">Cloud Server</span>
                  <span className="text-[10px] opacity-60">Value:</span>
                  <div className="text-sm font-black text-white py-1">
                    {c.serverValue || <em className="opacity-40">None</em>}
                  </div>
                  <span className="text-[9px] opacity-50 mt-1">Causality Check: Verified Cloud Update</span>
                </div>

                {/* Local Column */}
                <div className="p-3.5 bg-indigo-950/20 border border-pink-500/10 rounded-xl text-left flex flex-col gap-2 relative">
                  <span className="absolute top-2 right-2 text-[8px] uppercase font-bold text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded">Offline Device</span>
                  <span className="text-[10px] opacity-60">Value:</span>
                  <div className="text-sm font-black text-pink-300 py-1">
                    {c.clientValue || <em className="opacity-40">None</em>}
                  </div>
                  <span className="text-[9px] opacity-50 mt-1">Device: {c.clientDevice}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => resolveConflict(c.id, 'server')}
                  disabled={resolvingId === c.id}
                  className="btn-interactive py-1.5 px-3 bg-slate-800 text-white hover:bg-slate-700 text-[11px] font-bold border-none rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  Keep Cloud Version
                </button>
                <button
                  onClick={() => resolveConflict(c.id, 'client')}
                  disabled={resolvingId === c.id}
                  className="btn-interactive py-1.5 px-3 bg-indigo-650 text-white hover:bg-indigo-700 text-[11px] font-bold border-none rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  Keep Offline Version
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
