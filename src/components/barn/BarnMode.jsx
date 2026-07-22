import React, { useState, useMemo } from 'react';
import { Scale, HeartPulse, UserPlus, X, Search, ChevronRight, Award, Plus, Calendar, ShieldCheck, Flame, GraduationCap } from 'lucide-react';
import { db } from '../../db/registryDb';

export default function BarnMode({ 
  rabbits, 
  allRabbits,
  setAllRabbits,
  onClose,
  currentUser,
  triggerConfetti,
  onOpenCoach,
  isYouthAccount
}) {
  const [activeSubTab, setActiveSubTab] = useState('weights'); // weights, palpations, matings
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRabbit, setSelectedRabbit] = useState(null);

  // States for actions
  const [weightLbs, setWeightLbs] = useState(3);
  const [weightOz, setWeightOz] = useState(8);
  const [palpationResult, setPalpationResult] = useState('pregnant'); // pregnant, open
  const [palpationNotes, setPalpationNotes] = useState('');
  const [selectedSireId, setSelectedSireId] = useState('');
  const [matingNotes, setMatingNotes] = useState('');

  // Filter & sort rabbits by cage location
  const filteredRabbits = useMemo(() => {
    return rabbits
      .filter(r => 
        r.status !== 'pedigree_only' && r.status !== 'sold' && r.status !== 'dead' &&
        (r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         r.tattooNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (r.location || '').toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => (a.location || '').localeCompare(b.location || ''));
  }, [rabbits, searchQuery]);

  // List of bucks for breeding selections
  const bucks = useMemo(() => {
    return rabbits.filter(r => r.sex === 'buck' && r.status !== 'pedigree_only' && r.status !== 'sold' && r.status !== 'dead');
  }, [rabbits]);

  // Save actions locally
  const handleLogWeight = async () => {
    if (!selectedRabbit) return;
    try {
      const weightDate = new Date().toISOString().split('T')[0];
      const weightOzTotal = (Number(weightLbs) * 16) + Number(weightOz);
      
      const newWeightRecord = {
        id: `wt-${Date.now()}`,
        rabbitId: selectedRabbit.id,
        weightOz: weightOzTotal,
        logDate: weightDate,
        breederId: currentUser?.id || 'ab-1'
      };

      // Add to Dexie weights table
      await db.weights.add(newWeightRecord);

      // Update rabbit's active weight in state & Dexie
      const updatedRabbits = allRabbits.map(r => {
        if (r.id === selectedRabbit.id) {
          return { ...r, weightOz: weightOzTotal };
        }
        return r;
      });

      // Update Dexie rabbit record
      await db.rabbits.update(selectedRabbit.id, { weightOz: weightOzTotal });
      setAllRabbits(updatedRabbits);

      // Add offline sync queue action
      const action = {
        id: `sync-${Date.now()}`,
        actionType: 'INSERT',
        tableName: 'weights',
        payload: newWeightRecord,
        timestamp: Date.now()
      };
      await db.syncQueue.add(action);

      triggerConfetti();
      setSelectedRabbit(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogPalpation = async () => {
    if (!selectedRabbit) return;
    try {
      const checkDate = new Date().toISOString().split('T')[0];
      const note = `Palpation: ${palpationResult.toUpperCase()}. ${palpationNotes}`;

      const newMedicalRecord = {
        id: `med-${Date.now()}`,
        rabbitId: selectedRabbit.id,
        treatmentName: 'Pregnancy Palpation Check',
        notes: note,
        treatmentDate: checkDate,
        cost: 0,
        breederId: currentUser?.id || 'ab-1'
      };

      await db.medical.add(newMedicalRecord);

      // Save sync queue action
      const action = {
        id: `sync-${Date.now()}`,
        actionType: 'INSERT',
        tableName: 'medical',
        payload: newMedicalRecord,
        timestamp: Date.now()
      };
      await db.syncQueue.add(action);

      triggerConfetti();
      setSelectedRabbit(null);
      setPalpationNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogBreeding = async () => {
    if (!selectedRabbit || !selectedSireId) return;
    try {
      const breedingDate = new Date().toISOString().split('T')[0];
      const dueDate = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const newBreedingRecord = {
        id: `br-${Date.now()}`,
        doeId: selectedRabbit.id,
        sireId: selectedSireId,
        matingDate: breedingDate,
        dueDate: dueDate,
        nestBoxDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Active',
        notes: matingNotes,
        breederId: currentUser?.id || 'ab-1'
      };

      await db.breedings.add(newBreedingRecord);

      // Save sync queue action
      const action = {
        id: `sync-${Date.now()}`,
        actionType: 'INSERT',
        tableName: 'breedings',
        payload: newBreedingRecord,
        timestamp: Date.now()
      };
      await db.syncQueue.add(action);

      triggerConfetti();
      setSelectedRabbit(null);
      setSelectedSireId('');
      setMatingNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 animate-fade-in no-print">
      
      {/* Mobile-Friendly Header */}
      <header className="flex justify-between items-center p-4 bg-slate-900 border-b border-orange-500/30">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚜</span>
          <div>
            <h2 className="font-extrabold text-sm text-orange-400 tracking-wider uppercase font-cinzel leading-none">Hutch Barn Mode</h2>
            <span className="text-[10px] text-slate-400">Offline-first mobile logging</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-slate-800 rounded-full border-none text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Quick Status Sub-Tab Switcher */}
      <div className="flex bg-slate-900/60 border-b border-white/5">
        <button
          onClick={() => { setActiveSubTab('weights'); setSelectedRabbit(null); }}
          className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeSubTab === 'weights' ? 'border-orange-500 text-orange-400 bg-white/5' : 'border-transparent text-slate-400 bg-transparent'
          }`}
        >
          <Scale className="w-4 h-4" /> Log Weights
        </button>
        <button
          onClick={() => { setActiveSubTab('palpations'); setSelectedRabbit(null); }}
          className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeSubTab === 'palpations' ? 'border-orange-500 text-orange-400 bg-white/5' : 'border-transparent text-slate-400 bg-transparent'
          }`}
        >
          <HeartPulse className="w-4 h-4" /> Palpations
        </button>
        <button
          onClick={() => { setActiveSubTab('matings'); setSelectedRabbit(null); }}
          className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeSubTab === 'matings' ? 'border-orange-500 text-orange-400 bg-white/5' : 'border-transparent text-slate-400 bg-transparent'
          }`}
        >
          <UserPlus className="w-4 h-4" /> Record Mating
        </button>
        {isYouthAccount && (
          <button
            onClick={() => { if (onOpenCoach) onOpenCoach(); }}
            className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all border-transparent text-yellow-400 bg-transparent hover:bg-yellow-400/10 hover:border-yellow-400/50`}
          >
            <GraduationCap className="w-4 h-4" /> 4-H Coach
          </button>
        )}
      </div>

      {/* Main Workspace: Left Side = Search/Selector, Right Side = Touch Dialog Form */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left pane: Rabbit Search & List */}
        <div className={`flex-1 flex flex-col border-r border-white/5 ${selectedRabbit ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3 bg-slate-950 flex items-center gap-2 border-b border-white/5">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search cage location, tattoo, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm bg-transparent border-none focus:outline-none text-slate-100"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-slate-400 bg-transparent border-none cursor-pointer text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
            {filteredRabbits.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No matching rabbits found.</div>
            ) : (
              filteredRabbits
                .filter(r => activeSubTab === 'matings' || activeSubTab === 'palpations' ? r.sex === 'doe' : true)
                .map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRabbit(r);
                      if (activeSubTab === 'weights') {
                        setWeightLbs(Math.floor(r.weightOz / 16));
                        setWeightOz(r.weightOz % 16);
                      }
                    }}
                    className="flex justify-between items-center p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-left border border-white/5 transition-all text-slate-100 cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        📍 Cage: {r.location || 'Unassigned'}
                      </span>
                      <strong className="text-sm text-white font-bold">{r.name}</strong>
                      <span className="text-xs text-indigo-400 font-semibold">Tattoo: {r.tattooNumber}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs block">{(r.weightOz / 16).toFixed(2)} lbs</span>
                        <span className="text-[10px] text-slate-400 capitalize">{r.sex}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    </div>
                  </button>
                ))
            )}
          </div>
        </div>

        {/* Right pane: Touch Action Logging Panel */}
        {selectedRabbit && (
          <div className="flex-1 flex flex-col p-6 bg-slate-900/60 overflow-y-auto gap-5">
            
            {/* Target Rabbit Detail Card */}
            <div className="flex justify-between items-start bg-slate-950 p-4 border border-white/10 rounded-2xl relative">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-orange-400 tracking-wider">Active Target Doe</span>
                <h3 className="font-extrabold text-lg text-white mt-1 leading-none">{selectedRabbit.name}</h3>
                <p className="text-xs text-indigo-400 mt-1 font-semibold">Tattoo: {selectedRabbit.tattooNumber} | Cage: {selectedRabbit.location || 'None'}</p>
              </div>
              <button 
                onClick={() => setSelectedRabbit(null)}
                className="btn-interactive py-1 px-3 bg-slate-800 text-xs border-none text-slate-300 font-bold"
              >
                Close
              </button>
            </div>

            {/* Sub-Tab 1: Log Weights (Enlarged Touch keypad) */}
            {activeSubTab === 'weights' && (
              <div className="flex flex-col gap-5">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Total Weight Selected</span>
                  <div className="text-4xl font-extrabold text-orange-400 tracking-wider font-mono">
                    {weightLbs} lbs {weightOz} oz
                  </div>
                  <span className="text-xs text-slate-500 font-mono">({((Number(weightLbs) * 16 + Number(weightOz)) / 16).toFixed(2)} lbs total)</span>
                </div>

                {/* Weight Lbs Keypad/Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300">Pounds (Lbs)</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(val => (
                      <button
                        key={val}
                        onClick={() => setWeightLbs(val)}
                        className={`py-3 text-center text-sm font-black rounded-xl border transition-all ${
                          weightLbs === val ? 'bg-orange-500 border-orange-400 text-white' : 'bg-slate-900 border-white/5 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight Oz Keypad/Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300">Ounces (Oz)</label>
                  <div className="grid grid-cols-8 gap-1.5">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(val => (
                      <button
                        key={val}
                        onClick={() => setWeightOz(val)}
                        className={`py-2.5 text-center text-xs font-black rounded-xl border transition-all ${
                          weightOz === val ? 'bg-orange-500 border-orange-400 text-white' : 'bg-slate-900 border-white/5 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleLogWeight}
                  className="btn-interactive py-4 bg-orange-600 hover:bg-orange-650 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 border-none mt-4 shadow-lg"
                >
                  ⚖️ Confirm Weight Log
                </button>
              </div>
            )}

            {/* Sub-Tab 2: Record Palpation */}
            {activeSubTab === 'palpations' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Palpation Result</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPalpationResult('pregnant')}
                      className={`py-4 rounded-2xl border text-sm font-black transition-all flex flex-col items-center justify-center gap-1 ${
                        palpationResult === 'pregnant' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-white/5 text-slate-400'
                      }`}
                    >
                      <span>🤰 PREGNANT</span>
                      <span className="text-[10px] opacity-70 font-semibold">Doe has developed kit embryos</span>
                    </button>
                    <button
                      onClick={() => setPalpationResult('open')}
                      className={`py-4 rounded-2xl border text-sm font-black transition-all flex flex-col items-center justify-center gap-1 ${
                        palpationResult === 'open' ? 'bg-red-600/20 border-red-500 text-red-300' : 'bg-slate-900 border-white/5 text-slate-400'
                      }`}
                    >
                      <span>💨 OPEN (FAILED)</span>
                      <span className="text-[10px] opacity-70 font-semibold">Doe is not pregnant</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Notes / Treatment Log Comments</label>
                  <textarea
                    rows="3"
                    value={palpationNotes}
                    onChange={(e) => setPalpationNotes(e.target.value)}
                    placeholder="Enter observations (e.g. nest building, appetite)..."
                    className="w-full rounded-xl bg-slate-950 border border-white/10 p-3 text-xs focus:outline-none text-slate-100"
                  />
                </div>

                <button
                  onClick={handleLogPalpation}
                  className="btn-interactive py-4 bg-emerald-600 hover:bg-emerald-650 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 border-none mt-4 shadow-lg"
                >
                  <ShieldCheck className="w-5 h-5" /> Confirm Palpation Record
                </button>
              </div>
            )}

            {/* Sub-Tab 3: Breed Matings */}
            {activeSubTab === 'matings' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Select Sire (Father)</label>
                  <select
                    value={selectedSireId}
                    onChange={(e) => setSelectedSireId(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 p-3 text-xs focus:outline-none text-slate-100"
                  >
                    <option value="">-- Choose Sire --</option>
                    {bucks.map(b => (
                      <option key={b.id} value={b.id}>
                        Tattoo: {b.tattooNumber} ({b.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Mating Notes</label>
                  <input
                    type="text"
                    value={matingNotes}
                    onChange={(e) => setMatingNotes(e.target.value)}
                    placeholder="E.g., 3 fall-offs observed, prime breeding."
                    className="w-full rounded-xl bg-slate-950 border border-white/10 p-3 text-xs focus:outline-none text-slate-100"
                  />
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-white/5 rounded-2xl flex items-start gap-2.5 text-[11px] leading-relaxed text-slate-300">
                  <Calendar className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-orange-400 block">Milestone Prediction Schedule:</span>
                    <p className="mt-0.5">• Palpate Doe check-up: <strong>{new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}</strong></p>
                    <p>• Insert nesting box date: <strong>{new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}</strong></p>
                    <p>• Predicted kindling date: <strong>{new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}</strong></p>
                  </div>
                </div>

                <button
                  onClick={handleLogBreeding}
                  disabled={!selectedSireId}
                  className={`btn-interactive py-4 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 border-none mt-4 shadow-lg ${
                    selectedSireId ? 'bg-indigo-600 hover:bg-indigo-650' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Flame className="w-5 h-5" /> Record Mating & Schedule Gestation
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
