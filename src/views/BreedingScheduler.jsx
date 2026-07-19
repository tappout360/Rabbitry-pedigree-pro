import React, { useState } from 'react';
import { Calendar, ShieldAlert, Sparkles } from 'lucide-react';
import { inferGenotypeFromVariety, crossRabbitsGenetics } from '../utils/LocusEngine';

export default function BreedingScheduler({
  rabbits,
  breedings,
  allBreedings,
  litters,
  allRabbits,
  handleAddBreeding,
  logPalpation,
  logKindle,
  showToast
}) {
  const [newBreeding, setNewBreeding] = useState({
    buckId: '',
    doeId: '',
    breedDate: new Date().toISOString().split('T')[0]
  });

  const [kindlingBreedingId, setKindlingBreedingId] = useState(null);
  const [kitsAliveInput, setKitsAliveInput] = useState(6);
  const [kitsDeadInput, setKitsDeadInput] = useState(0);

  // Sandbox states
  const [sandboxBuckId, setSandboxBuckId] = useState('');
  const [sandboxDoeId, setSandboxDoeId] = useState('');

  const submitForm = (e) => {
    e.preventDefault();
    handleAddBreeding(e, newBreeding);
    // Reset form buck/doe selections
    setNewBreeding({
      buckId: '',
      doeId: '',
      breedDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Breeding Scheduler Form */}
      <div className="glass-container p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Schedule a Breeding Pair</h3>
        <form onSubmit={submitForm} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-blue-400">Sire (Buck)</label>
            <select 
              value={newBreeding.buckId}
              onChange={(e) => setNewBreeding({...newBreeding, buckId: e.target.value})}
              className="bg-slate-950 text-white border border-white/10 rounded-xl p-2.5"
              required
            >
              <option value="">Select Buck</option>
              {rabbits.filter(r => r.sex === 'buck' && r.status !== 'pedigree_only' && r.status !== 'sold' && r.status !== 'dead').map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.tattooNumber})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-pink-400">Dam (Doe)</label>
            <select 
              value={newBreeding.doeId}
              onChange={(e) => setNewBreeding({...newBreeding, doeId: e.target.value})}
              className="bg-slate-950 text-white border border-white/10 rounded-xl p-2.5"
              required
            >
              <option value="">Select Doe</option>
              {rabbits.filter(r => r.sex === 'doe' && r.status !== 'pedigree_only' && r.status !== 'sold' && r.status !== 'dead').map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.tattooNumber})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-300">Breeding Date</label>
            <input 
              type="date"
              value={newBreeding.breedDate}
              onChange={(e) => setNewBreeding({...newBreeding, breedDate: e.target.value})}
              className="bg-slate-950 text-white border border-white/10 rounded-xl p-2.5"
            />
          </div>

          <div className="md:col-span-3">
            <button type="submit" className="btn-interactive w-full">Log Breeding Chain to Local Queue</button>
          </div>
        </form>
      </div>

      {/* Active Gestation Timeline Tracker */}
      <div className="glass-container p-6 flex flex-col gap-5 border border-orange-500/25">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" /> Active Pregnancy Gestation Timelines
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">Palpation checks, nest box placements, and kit kindling due dates.</p>
          </div>
          <button
            onClick={() => {
              if ('Notification' in window) {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    showToast("Local push alerts registered successfully!", "success");
                  } else {
                    showToast("Notification permission was denied.", "error");
                  }
                });
              } else {
                showToast("Notifications not supported in this browser.", "error");
              }
            }}
            className="btn-interactive py-1.5 px-3 bg-slate-800 text-xs border border-white/10 text-slate-200 font-bold"
          >
            🔔 Enable Push Alerts
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {allBreedings.filter(b => b.status === 'bred' || b.status === 'palpated_positive' || b.status === 'Active').length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">No active breeding chains. Schedule a breeding pair above to track pregnancy.</div>
          ) : (
            allBreedings
              .filter(b => b.status === 'bred' || b.status === 'palpated_positive' || b.status === 'Active')
              .map(b => {
                const doe = rabbits.find(r => r.id === b.doeId);
                const buck = rabbits.find(r => r.id === b.buckId);
                
                const matingTime = new Date(b.breedDate).getTime();
                const timeDiff = Date.now() - matingTime;
                const daysElapsed = Math.max(0, Math.floor(timeDiff / (24 * 60 * 60 * 1000)));
                const progressPct = Math.min(100, Math.round((daysElapsed / 31) * 100));

                return (
                  <div key={b.id} className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-4 flex-wrap text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-orange-400">Gestation Tracker</span>
                        <h4 className="font-extrabold text-sm text-white mt-0.5">
                          Doe: {doe ? doe.name : 'Unknown'} x Buck: {buck ? buck.name : 'Unknown'}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1">Mated: <strong>{b.breedDate}</strong> | Pregnancy Stage: <strong>{daysElapsed} / 31 days</strong></p>
                      </div>
                      <div className="flex gap-2">
                        {b.status === 'bred' && (
                          <>
                            <button
                              onClick={() => logPalpation(b.id, true)}
                              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-650 text-white font-bold rounded-lg border-none text-[10px] transition-all"
                            >
                              🤰 Palpate Positive
                            </button>
                            <button
                              onClick={() => logPalpation(b.id, false)}
                              className="py-1.5 px-3 bg-red-650 hover:bg-red-700 text-white font-bold rounded-lg border-none text-[10px] transition-all"
                            >
                              💨 Palpate Failed
                            </button>
                          </>
                        )}
                        {b.status === 'palpated_positive' && (
                          <button
                            onClick={() => setKindlingBreedingId(b.id)}
                            className="py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-650 text-white font-bold rounded-lg border-none text-[10px] transition-all"
                          >
                            🐇 Record Kindled
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Gestation timeline bar */}
                    <div className="relative pt-6 pb-2 px-1">
                      {/* Horizontal track line */}
                      <div className="absolute top-[28px] left-0 right-0 h-1.5 bg-slate-800 rounded-full">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {/* Milestone nodes */}
                      <div className="relative flex justify-between text-[10px]">
                        {/* Milestone 0: Mating */}
                        <div className="flex flex-col items-center text-center -translate-x-2">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center z-10 transition-all ${daysElapsed >= 0 ? 'bg-orange-500 border-orange-400' : 'bg-slate-900 border-slate-700'}`} />
                          <span className="font-bold text-slate-300 mt-1">Day 0</span>
                          <span className="text-[8.5px] opacity-60">Mating</span>
                        </div>

                        {/* Milestone 12: Palpation */}
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center z-10 transition-all ${daysElapsed >= 12 ? 'bg-orange-500 border-orange-400' : 'bg-slate-900 border-slate-700'}`} />
                          <span className="font-bold text-slate-300 mt-1">Day 12</span>
                          <span className="text-[8.5px] opacity-60">Palpate Check</span>
                        </div>

                        {/* Milestone 28: Nest Box */}
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center z-10 transition-all ${daysElapsed >= 28 ? 'bg-orange-500 border-orange-400' : 'bg-slate-900 border-slate-700'}`} />
                          <span className="font-bold text-slate-300 mt-1">Day 28</span>
                          <span className="text-[8.5px] opacity-60">Nest Box In</span>
                        </div>

                        {/* Milestone 31: Kindle */}
                        <div className="flex flex-col items-center text-center translate-x-2">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center z-10 transition-all ${daysElapsed >= 31 ? 'bg-orange-500 border-orange-400' : 'bg-slate-900 border-slate-700'}`} />
                          <span className="font-bold text-slate-300 mt-1">Day 31</span>
                          <span className="text-[8.5px] opacity-60">Kindle Due</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Record Mating Kindled Dialog Popover */}
      {kindlingBreedingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl text-slate-100">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="font-extrabold text-base text-indigo-400">
                🐇 Record Litter Kindled
              </h3>
              <button 
                onClick={() => setKindlingBreedingId(null)}
                className="text-slate-400 hover:text-white border-none bg-transparent cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs text-left">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">Kits Born Alive</label>
                <input
                  type="number"
                  value={kitsAliveInput}
                  onChange={(e) => setKitsAliveInput(Number(e.target.value))}
                  className="bg-slate-950 text-white border border-white/10 rounded-xl p-2.5"
                  min="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-300">Kits Born Dead</label>
                <input
                  type="number"
                  value={kitsDeadInput}
                  onChange={(e) => setKitsDeadInput(Number(e.target.value))}
                  className="bg-slate-950 text-white border border-white/10 rounded-xl p-2.5"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
              <button
                onClick={() => setKindlingBreedingId(null)}
                className="btn-interactive text-xs py-2 px-4 bg-slate-800 text-slate-300 border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logKindle(kindlingBreedingId, kitsAliveInput, kitsDeadInput);
                  setKindlingBreedingId(null);
                }}
                className="btn-interactive text-xs py-2 px-5 bg-emerald-600 hover:bg-emerald-655 text-white font-bold"
              >
                Confirm Kindling
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Litters Logs */}
      <div className="glass-container p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Litter Production Logs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {litters.map(l => {
            const breeding = breedings.find(b => b.id === l.breedingId);
            const doe = breeding ? rabbits.find(r => r.id === breeding.doeId) : null;
            const buck = breeding ? rabbits.find(r => r.id === breeding.buckId) : null;

            return (
              <div key={l.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Litter ID: {l.id.slice(-6)}</span>
                  <span className="text-xs bg-green-500/20 text-green-300 font-bold px-2 py-0.5 rounded">Active Weaned</span>
                </div>
                <p className="text-sm font-semibold text-white">Doe: {doe ? doe.name : 'Unknown'} x Buck: {buck ? buck.name : 'Unknown'}</p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-white/5 p-2 rounded-lg mt-1 text-slate-200">
                  <div>
                    <span className="opacity-70 block text-[10px]">Born Alive</span>
                    <span className="font-bold text-green-400 text-sm">{l.kitsBornAlive}</span>
                  </div>
                  <div>
                    <span className="opacity-70 block text-[10px]">Born Dead</span>
                    <span className="font-bold text-red-400 text-sm">{l.kitsBornDead}</span>
                  </div>
                  <div>
                    <span className="opacity-70 block text-[10px]">Weaned</span>
                    <span className="font-bold text-indigo-400 text-sm">{l.kitsBornAlive - l.kitsBornDead}</span>
                  </div>
                </div>
                <p className="text-xs opacity-75 mt-1 text-slate-350">Notes: {l.notes || 'None recorded.'}</p>
              </div>
            );
          })}
          {litters.length === 0 && (
            <p className="text-sm opacity-60 text-center py-6 md:col-span-2 text-slate-400">No litter entries yet.</p>
          )}
        </div>
      </div>

      {/* Missed Breeding & Fertility Analysis */}
      <div className="glass-container p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h3 className="text-lg font-bold text-white">Missed Breeding & Fertility Analysis</h3>
        </div>
        <p className="text-xs opacity-75 mb-5 text-slate-300">
          Logs failed breeding attempts (negative palpations) to identify potential buck/doe fertility issues.
        </p>
        {(() => {
          const failedBreedings = breedings.filter(b => b.status === 'palpated_negative');
          
          const buckFailures = {};
          const doeFailures = {};
          
          failedBreedings.forEach(b => {
            if (b.buckId) buckFailures[b.buckId] = (buckFailures[b.buckId] || 0) + 1;
            if (b.doeId) doeFailures[b.doeId] = (doeFailures[b.doeId] || 0) + 1;
          });
          
          const buckStats = Object.entries(buckFailures).map(([id, count]) => {
            const r = allRabbits.find(rab => rab.id === id);
            return { id, name: r ? r.name : 'Unknown Buck', tattooNumber: r ? r.tattooNumber : '', count };
          }).sort((a, b) => b.count - a.count);
          
          const doeStats = Object.entries(doeFailures).map(([id, count]) => {
            const r = allRabbits.find(rab => rab.id === id);
            return { id, name: r ? r.name : 'Unknown Doe', tattooNumber: r ? r.tattooNumber : '', count };
          }).sort((a, b) => b.count - a.count);
          
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-bold text-sky-400 border-b border-white/5 pb-2">
                  ♂️ Buck Fertility Warnings
                </h4>
                {buckStats.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {buckStats.map(s => (
                      <div key={s.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-white">{s.name}</span>
                          {s.tattooNumber && <span className="opacity-50 ml-1.5 font-mono">({s.tattooNumber})</span>}
                        </div>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                          {s.count} Failed {s.count === 1 ? 'Attempt' : 'Attempts'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs opacity-60 italic py-2 text-slate-400">No failed breeding attempts recorded for bucks.</p>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-bold text-pink-400 border-b border-white/5 pb-2">
                  ♀️ Doe Fertility Warnings
                </h4>
                {doeStats.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {doeStats.map(s => (
                      <div key={s.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-white">{s.name}</span>
                          {s.tattooNumber && <span className="opacity-50 ml-1.5 font-mono">({s.tattooNumber})</span>}
                        </div>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                          {s.count} Failed {s.count === 1 ? 'Attempt' : 'Attempts'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs opacity-60 italic py-2 text-slate-400">No failed breeding attempts recorded for does.</p>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* ARBA Genetic Loci Sandbox & Punnett Simulator */}
      <div className="glass-container p-6 border border-indigo-500/20 bg-slate-900/40">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> ARBA Genetic Loci Sandbox
            </h3>
            <p className="text-xs text-slate-350 mt-0.5 font-medium">Predict kit variety percentages and explore genotype crosses using standard Punnett calculations.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1 text-left">
                <label className="font-bold text-blue-400">Select Sire (Buck)</label>
                <select 
                  value={sandboxBuckId}
                  onChange={(e) => setSandboxBuckId(e.target.value)}
                  className="bg-slate-950 text-white border border-white/10 rounded-xl p-2.5"
                >
                  <option value="">Select Buck</option>
                  {rabbits.filter(r => r.sex === 'buck' && r.status !== 'pedigree_only' && r.status !== 'sold').map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.tattooNumber} - {r.variety})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="font-bold text-pink-400">Select Dam (Doe)</label>
                <select 
                  value={sandboxDoeId}
                  onChange={(e) => setSandboxDoeId(e.target.value)}
                  className="bg-slate-950 text-white border border-white/10 rounded-xl p-2.5"
                >
                  <option value="">Select Doe</option>
                  {rabbits.filter(r => r.sex === 'doe' && r.status !== 'pedigree_only' && r.status !== 'sold').map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.tattooNumber} - {r.variety})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl text-left text-xs">
              <span className="text-[11px] font-bold text-indigo-300 block mb-1">WarrenWise Genetics Coach says:</span>
              <p className="opacity-80 leading-normal text-[11px] text-slate-350">
                "Every standard rabbit variety contains gene pairings at 5 key loci (A, B, C, D, E). Self colors like Black (aa) are recessive to Agouti (A). If both parents carry a hidden recessive gene, it can pop up in their offspring!"
              </p>
            </div>
          </div>

          <div className="text-left">
            {!sandboxBuckId || !sandboxDoeId ? (
              <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-2xl py-12 text-slate-500 text-xs italic">
                Select a Sire and Dam to analyze genetic crossing probabilities.
              </div>
            ) : (() => {
              const buck = rabbits.find(r => r.id === sandboxBuckId);
              const doe = rabbits.find(r => r.id === sandboxDoeId);
              if (!buck || !doe) return null;

              const buckGen = inferGenotypeFromVariety(buck.variety, buck.breed);
              const doeGen = inferGenotypeFromVariety(doe.variety, doe.breed);

              const showGen = (g) => {
                return `${g.A.join('')} ${g.B.join('')} ${g.C.join('')} ${g.D.join('')} ${g.E.join('')}`;
              };

              const results = crossRabbitsGenetics(buckGen, doeGen);

              return (
                <div className="flex flex-col gap-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <span className="text-[10px] font-bold text-blue-300 block">Sire Genotype</span>
                      <span className="font-mono text-sm font-black text-white">{showGen(buckGen)}</span>
                    </div>
                    <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl">
                      <span className="text-[10px] font-bold text-pink-300 block">Dam Genotype</span>
                      <span className="font-mono text-sm font-black text-white">{showGen(doeGen)}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-450 block mb-2">Predicted Kit Color Variety Probabilities</span>
                    <div className="flex flex-col gap-2">
                      {results.varieties.map(v => (
                        <div key={v.name} className="flex flex-col gap-1 bg-white/5 p-2 rounded-lg border border-white/5">
                          <div className="flex justify-between items-center text-[11px] font-bold text-white">
                            <span>{v.name}</span>
                            <span className="text-indigo-300">{v.percent}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                              style={{ width: `${v.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 text-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-450 block mb-1.5">Punnett Cross Grid Samples</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      {results.grid.slice(0, 8).map((entry, idx) => (
                        <div key={idx} className="bg-white/5 p-1.5 rounded flex justify-between border border-white/5">
                          <span className="text-slate-450">{entry.childGenotype}</span>
                          <span className="font-bold text-indigo-200 truncate max-w-[55%]">{entry.varietyName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

    </div>
  );
}
