import React, { useState, useMemo } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import { BREED_VARIETY_GROUPS } from '../db/breedColors';

export default function ColorSelector({ breed, onClose, onSelect }) {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedVariety, setSelectedVariety] = useState('');

  const groups = useMemo(() => {
    return BREED_VARIETY_GROUPS[breed] || BREED_VARIETY_GROUPS['Default'];
  }, [breed]);

  const varieties = useMemo(() => {
    if (!selectedGroup) return [];
    return groups[selectedGroup] || [];
  }, [selectedGroup, groups]);

  const activeVarietyInfo = useMemo(() => {
    if (!selectedVariety) return null;
    return varieties.find(v => v.name === selectedVariety);
  }, [selectedVariety, varieties]);

  // Determine show status flags
  const showStatus = useMemo(() => {
    if (!activeVarietyInfo) return null;
    
    // Simulate SOP checks (faults/disqualifications)
    const name = activeVarietyInfo.name.toLowerCase();
    if (name.includes('charlie') || name.includes('excessive white')) {
      return {
        level: 'disqualified',
        badge: 'Red Flag (Disqualified)',
        message: 'Dutch markings or Charlie patterns showing under 10% or over 50% color are disqualified from ARBA shows.',
        color: 'text-red-400 bg-red-950/40 border-red-500/30',
        icon: <XCircle className="w-5 h-5 text-red-400 shrink-0" />
      };
    }
    if (name.includes('broken') || name.includes('spotted')) {
      return {
        level: 'warning',
        badge: 'Yellow Warning (Fault Risk)',
        message: 'Broken pattern must show balanced head markings and a blanket or spotted body pattern (between 10% and 50% color). Unmarked noses are faulted.',
        color: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
        icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
      };
    }
    return {
      level: 'compliant',
      badge: 'SOP Compliant Variety',
      message: 'This is a standard show-quality variety compliant with official ARBA standards of perfection.',
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
    };
  }, [activeVarietyInfo]);

  const handleApply = () => {
    if (!selectedVariety) return;
    onSelect(selectedVariety);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 flex flex-col gap-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-indigo-400" /> ARBA Color & Variety Wizard
            </h3>
            <p className="text-xs opacity-70">Interactive selector for {breed} show standards</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-white border-none bg-transparent cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Step 1: Select Group */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-300">Step 1: Choose Color Group</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(groups).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => { setSelectedGroup(g); setSelectedVariety(''); }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-left transition-all ${
                  selectedGroup === g 
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200' 
                    : 'bg-slate-800/40 border-white/5 text-slate-300 hover:bg-slate-800'
                }`}
              >
                📁 {g} Group
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Variety (Visual Grid) */}
        {selectedGroup && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">Step 2: Select Show Variety</label>
            <div className="grid grid-cols-3 gap-2 max-h-[180px] overflow-y-auto pr-1">
              {varieties.map(v => (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => setSelectedVariety(v.name)}
                  className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-2 transition-all ${
                    selectedVariety === v.name 
                      ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200' 
                      : 'bg-slate-800/40 border-white/5 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div 
                    className="w-10 h-10 rounded-full border border-white/10 shadow-inner"
                    style={{ background: v.hex }}
                  />
                  <span className="text-center truncate w-full">{v.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: SOP Details & Real-Time Validation */}
        {activeVarietyInfo && (
          <div className="flex flex-col gap-3 p-4 bg-slate-950/60 border border-white/5 rounded-2xl">
            <h4 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider">
              Variety: {activeVarietyInfo.name}
            </h4>

            {/* Standard description */}
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-bold block text-slate-400 mb-0.5">Description Summary:</span>
              <span>{activeVarietyInfo.sop || 'No specific description recorded.'}</span>
              <p className="text-[10px] text-slate-400 mt-2.5 bg-slate-950/40 p-2 rounded-lg border border-white/5">
                💡 <em>This variety is commonly accepted for {breed} — consult the official ARBA Standard of Perfection for complete SOP details and current show standards.</em>
              </p>
            </div>

            {/* Status Alert Banner */}
            {showStatus && (
              <div className={`p-3 rounded-xl border flex gap-2 items-start text-[11px] ${showStatus.color}`}>
                {showStatus.icon}
                <div>
                  <span className="font-bold block">{showStatus.badge}</span>
                  <p className="opacity-90 mt-0.5 leading-relaxed">{showStatus.message}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* App Role Disclaimer */}
        <div className="p-3 bg-slate-950/40 border border-white/5 rounded-2xl text-[10px] text-slate-400 leading-relaxed">
          <strong>⚠️ Disclaimer:</strong> This app provides preparation guidance only. Official registration requires an in-person inspection by a licensed ARBA Registrar using the current Standard of Perfection. Visit the <a href="https://arba.net" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline font-bold">Official ARBA Website (arba.net)</a> for official rules and their registrar locator.
        </div>

        {/* Form Controls */}
        <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-interactive text-xs py-2 px-4 bg-slate-800 text-slate-300 border border-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedVariety}
            onClick={handleApply}
            className={`btn-interactive text-xs py-2 px-5 font-bold text-white border-none ${
              selectedVariety ? 'bg-indigo-600 hover:bg-indigo-650' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Apply Variety Selection
          </button>
        </div>

      </div>
    </div>
  );
}
