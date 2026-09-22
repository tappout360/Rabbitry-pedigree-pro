import React, { useState } from 'react';
import { 
  Scale, X, ChevronRight, Check, ArrowRight, Sparkles, Mic 
} from 'lucide-react';
import { uuidv7 } from '../../db/uuid';

export default function MobileRapidWeightModal({
  rabbits = [],
  weightUnit = 'oz',
  onSaveWeight,
  onClose,
  showToast
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [weightValue, setWeightValue] = useState('');
  const [stage, setStage] = useState('Routine');

  // Filtered compatible rabbits
  const filteredRabbits = rabbits.filter(r => {
    if (!r || r.status === 'pedigree_only' || r.status === 'sold') return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (r.name || '').toLowerCase().includes(q) || (r.tattooNumber || '').toLowerCase().includes(q);
  });

  const activeRabbit = filteredRabbits[selectedIndex] || filteredRabbits[0] || null;

  const handleSave = (advanceToNext = false) => {
    if (!activeRabbit) {
      alert("Please select a rabbit.");
      return;
    }
    const num = parseFloat(weightValue);
    if (isNaN(num) || num <= 0) {
      alert("Please enter a valid weight.");
      return;
    }

    const finalWeightOz = weightUnit === 'lbs' ? Math.round(num * 16) : Math.round(num);

    const weightRecord = {
      id: uuidv7(),
      rabbitId: activeRabbit.id,
      date: new Date().toISOString().split('T')[0],
      weightOz: finalWeightOz,
      stage
    };

    if (onSaveWeight) {
      onSaveWeight(weightRecord, activeRabbit.id, finalWeightOz);
    }

    if (showToast) {
      showToast(`Logged ${activeRabbit.tattooNumber || activeRabbit.name}: ${weightValue} ${weightUnit}`, "success");
    }

    setWeightValue('');

    if (advanceToNext) {
      // Advance to next rabbit in list
      if (selectedIndex < filteredRabbits.length - 1) {
        setSelectedIndex(prev => prev + 1);
      } else {
        setSelectedIndex(0);
        if (showToast) showToast("Completed full herd sequence!", "info");
      }
    } else {
      onClose();
    }
  };

  const quickIncrements = weightUnit === 'lbs' ? [0.25, 0.5, 1.0, 2.0] : [2, 4, 8, 16];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in text-left">
      <div className="w-full max-w-lg bg-slate-900 border-t-2 sm:border-2 border-orange-500/40 rounded-t-3xl sm:rounded-3xl p-6 flex flex-col gap-4 shadow-2xl safe-area-bottom max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Rapid Barn Weight Logger</h3>
              <p className="text-[10px] text-slate-400">Sequential one-thumb barn scale workflow</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 border-none bg-transparent cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search / Filter Rabbit */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Fast Find Cage / Ear Tag #</label>
          <input
            type="text"
            placeholder="Search ear tag, cage, or name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white"
          />
        </div>

        {/* Selected Rabbit Spotlight Card */}
        {activeRabbit ? (
          <div className="p-4 bg-slate-950 border border-orange-500/30 rounded-2xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-orange-400">[{activeRabbit.tattooNumber || 'NO-TAG'}]</span>
                <strong className="text-white text-sm font-bold">{activeRabbit.name}</strong>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeRabbit.breed} &bull; {activeRabbit.sex} &bull; Prev: {((activeRabbit.weightOz || 0) / (weightUnit === 'lbs' ? 16 : 1)).toFixed(1)} {weightUnit}
              </p>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-mono">
              {selectedIndex + 1} / {filteredRabbits.length}
            </span>
          </div>
        ) : (
          <div className="p-4 bg-slate-950 rounded-2xl text-center text-xs text-slate-400">
            No rabbits found matching search.
          </div>
        )}

        {/* Weight Input Display */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-300">Scale Weight ({weightUnit})</label>
            <div className="flex gap-1 text-[10px]">
              {['Routine', 'Junior', 'Senior', 'Meat Fryer'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStage(st)}
                  className={`px-2 py-1 rounded-lg border-none cursor-pointer ${
                    stage === st ? 'bg-orange-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <input
              type="number"
              step="0.01"
              autoFocus
              placeholder="0.0"
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              className="w-full bg-slate-950 border-2 border-orange-500/40 rounded-2xl py-3 px-4 text-2xl font-black text-white text-center font-mono focus:border-orange-400"
            />
            <span className="absolute right-4 top-4 text-xs font-bold text-slate-400 font-mono">
              {weightUnit}
            </span>
          </div>

          {/* Quick Increment Chips */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {quickIncrements.map(inc => (
              <button
                key={inc}
                type="button"
                onClick={() => {
                  const current = parseFloat(weightValue) || 0;
                  setWeightValue((current + inc).toFixed(weightUnit === 'lbs' ? 2 : 0));
                }}
                className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-white/5 cursor-pointer touch-target-large"
              >
                +{inc} {weightUnit}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Actions: Save & Close vs Save & Next */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="btn-interactive flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl border-none shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer touch-target-large"
          >
            <span>Save & Next Rabbit</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            className="btn-interactive py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer touch-target-large"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Save & Done</span>
          </button>
        </div>

      </div>
    </div>
  );
}
