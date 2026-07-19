import React, { useState } from 'react';
import { Award } from 'lucide-react';
import { calculateRabbitShowClass } from '../db/helpers';

export default function ShowPlanner({
  shows,
  allShows,
  setAllShows,
  showEntries,
  allShowEntries,
  setAllShowEntries,
  rabbits,
  currentUser,
  activeBreederContext,
  selectedBreederContext,
  breederState,
  isUnderFdaWithdrawal,
  isAssistantWriteOnly,
  setSuccessMascot,
  showToast
}) {
  // Local filter states
  const [showZipFilter, setShowZipFilter] = useState('');
  const [showRadiusFilter, setShowRadiusFilter] = useState('100');

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Show Header */}
      <div className="glass-container p-6 flex flex-col gap-2">
        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
          <Award className="w-6 h-6 text-yellow-400 font-bold" /> Rabbitry Show Planner & Calendar
        </h3>
        <p className="text-sm opacity-75 text-slate-200">
          Coordinate upcoming ARBA events, manage entries, track preparation requirements, and set notifications for barn days.
        </p>
        {activeBreederContext?.isYouth && (
          <div className="mt-2.5 p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-start gap-2.5 text-xs text-pink-300">
            <span className="text-base shrink-0 mt-0.5">⚠️</span>
            <p className="leading-relaxed font-sans text-slate-200">
              <strong>ARBA Youth Rules Notice:</strong> As a registered youth exhibitor, please remember that youth must carry, handle, and present their own animals on the show table without adult assistance in youth breed and showmanship classes. Refer to the official ARBA rules at <a href="https://arba.net" target="_blank" rel="noopener noreferrer" className="underline font-bold text-pink-400 hover:text-pink-300">arba.net</a> for complete guidelines.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Add Custom Show Form */}
          <div className="glass-container p-6">
            <h3 className="text-base font-bold mb-4 text-white">Add Custom Show</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const name = e.target.showName.value;
              const date = e.target.showDate.value;
              const location = e.target.showLoc.value;
              const status = e.target.showStatus.value;
              const notes = e.target.showNotes.value;
              if (!name || !date) return;

              const activeBreederId = selectedBreederContext === 'all' ? (currentUser?.id || 'ab-1') : selectedBreederContext;
              const newShow = {
                id: `show-${Date.now()}`,
                breederId: activeBreederId,
                name,
                date,
                location,
                status,
                notes,
                notifyDays: 14
              };
              setAllShows(prev => [newShow, ...prev]);
              e.target.reset();
              setSuccessMascot({
                title: "Show Added!",
                message: `"${name}" has been successfully added to your exhibition calendar. Get those pedigree forms ready!`,
                type: 'usagi'
              });
            }} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">Show Name</label>
                <input name="showName" type="text" placeholder="e.g. ARBA Spring Classic" required className="bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">Date</label>
                <input name="showDate" type="date" required className="bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">Location</label>
                <input name="showLoc" type="text" placeholder="City, State" className="bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">Initial Status</label>
                <select name="showStatus" defaultValue="interested" className="bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs focus:outline-none">
                  <option value="attending">Attending</option>
                  <option value="interested">Interested</option>
                  <option value="not_attending">Not Attending</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">Notes</label>
                <textarea name="showNotes" placeholder="Preparation details..." rows="3" className="text-xs p-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none" />
              </div>
              <button type="submit" className="btn-interactive w-full mt-2">Add Show to Calendar</button>
            </form>
          </div>

          {/* Quick-Add Templates */}
          <div className="glass-container p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Find Local ARBA Shows</h3>
              <p className="text-[10px] opacity-75 mt-0.5 text-slate-300">Search sanctioned exhibitions near your rabbitry registry zip code.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-bold text-slate-400">Zip Code</label>
                <input 
                  type="text" 
                  maxLength="5" 
                  placeholder="e.g. 97201" 
                  value={showZipFilter} 
                  onChange={(e) => setShowZipFilter(e.target.value.replace(/\D/g, ''))}
                  className="bg-slate-950 border border-white/10 text-xs p-2 text-white rounded-lg text-center font-mono focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-bold text-slate-400">Radius</label>
                <select 
                  value={showRadiusFilter}
                  onChange={(e) => setShowRadiusFilter(e.target.value)}
                  className="bg-slate-950 border border-white/10 text-xs p-2.5 text-white rounded-lg focus:outline-none"
                >
                  <option value="25">25 Miles</option>
                  <option value="50">50 Miles</option>
                  <option value="100">100 Miles</option>
                  <option value="250">250 Miles</option>
                  <option value="500">500 Miles</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
              {(() => {
                const REGIONAL_SHOW_TEMPLATES = [
                  { 
                    name: "Portland Breeders Winter Show", 
                    date: "2026-11-15", 
                    loc: "Portland, OR", 
                    zip: "97201", 
                    notes: "Double youth/open show.",
                    showsList: ["Show A (Open/Youth)", "Show B (Open/Youth)", "Mini Rex Specialty"]
                  },
                  { 
                    name: "Washington County Fair Show", 
                    date: "2026-07-28", 
                    loc: "Hillsboro, OR", 
                    zip: "97124", 
                    notes: "Annual county exhibition. Double show.",
                    showsList: ["Show A (Open/Youth)", "Show B (Open/Youth)", "Holland Lop Specialty"]
                  },
                  { 
                    name: "ARBA California Championship", 
                    date: "2026-08-22", 
                    loc: "Sacramento, CA", 
                    zip: "95814", 
                    notes: "Triple-sanctioned ARBA show.",
                    showsList: ["Show A (Open)", "Show B (Open)", "Show C (Open)", "Youth Show A/B"]
                  },
                  { 
                    name: "San Joaquin Valley Classic", 
                    date: "2026-07-20", 
                    loc: "Stockton, CA", 
                    zip: "95202", 
                    notes: "Sanctioned open/youth rabbit & cavy show.",
                    showsList: ["Show A (Open/Youth)", "Show B (Open/Youth)", "Cavy Specialty"]
                  },
                  { 
                    name: "Golden State Autumn Classic", 
                    date: "2026-09-15", 
                    loc: "Fresno, CA", 
                    zip: "93721", 
                    notes: "Pre-national warm-up.",
                    showsList: ["Show A (Open/Youth)", "Show B (Open/Youth)", "Flemish Giant Specialty"]
                  },
                  { 
                    name: "Indiana State Fair Exhibition", 
                    date: "2026-08-10", 
                    loc: "Indianapolis, IN", 
                    zip: "46205", 
                    notes: "Large state exhibition with youth categories.",
                    showsList: ["Show A (Open)", "Show B (Open)", "4-H Youth Derby"]
                  },
                  { 
                    name: "Midwest Mini Rex Specialty", 
                    date: "2026-07-12", 
                    loc: "Fort Wayne, IN", 
                    zip: "46802", 
                    notes: "Rex specialty double show.",
                    showsList: ["Show A (Specialty Only)", "Show B (Specialty Only)"]
                  },
                  { 
                    name: "Ohio State Rabbit Convention", 
                    date: "2026-09-18", 
                    loc: "Columbus, OH", 
                    zip: "43215", 
                    notes: "Annual state convention.",
                    showsList: ["Show A (Open/Youth)", "Show B (Open/Youth)", "Show C (Open/Youth)", "Netherland Dwarf Specialty"]
                  },
                  { 
                    name: "Great Lakes Giant Fair", 
                    date: "2026-09-02", 
                    loc: "Grand Rapids, MI", 
                    zip: "49503", 
                    notes: "All breeds welcome, specialty in Flemish Giants.",
                    showsList: ["Show A (Open/Youth)", "Show B (Open/Youth)", "Flemish Giant Specialty"]
                  }
                ];

                const radiusVal = parseInt(showRadiusFilter || '100', 10);
                const userZip = showZipFilter || '97201'; 
                
                const calculatedShows = REGIONAL_SHOW_TEMPLATES.map(t => {
                  const diff = Math.abs(parseInt(userZip, 10) - parseInt(t.zip, 10)) || 1;
                  const distance = (diff % 480) + 12; 
                  return { ...t, distance };
                });

                let filtered = showZipFilter
                  ? calculatedShows.filter(t => t.distance <= radiusVal)
                  : calculatedShows.filter(t => t.loc.toUpperCase().includes(breederState.toUpperCase()));

                if (filtered.length === 0 && !showZipFilter) {
                  filtered = calculatedShows;
                }

                if (filtered.length === 0) {
                  return <div className="text-[10px] text-center text-slate-500 py-4">No ARBA shows found within {radiusVal} miles of "{showZipFilter}". Try broadening your radius.</div>;
                }

                return filtered.map((t, idx) => (
                  <div key={idx} className="p-2.5 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs text-left relative hover:bg-white/10 transition-all">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <span className="font-bold text-indigo-350 truncate">{t.name}</span>
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="font-mono text-cyan-300 font-semibold">{t.date}</span>
                        <span>•</span>
                        <span>{t.loc}</span>
                        <span>•</span>
                        <span className="text-emerald-405 font-bold font-mono">{t.distance} mi</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {t.showsList?.map((sName, sIdx) => (
                          <span key={sIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-350 border border-white/5 font-semibold">
                            {sName}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        const activeBreederId = selectedBreederContext === 'all' ? (currentUser?.id || 'ab-1') : selectedBreederContext;
                        const newShow = {
                          id: `show-template-${Date.now()}-${idx}`,
                          breederId: activeBreederId,
                          name: t.name,
                          date: t.date,
                          location: t.loc,
                          status: 'interested',
                          notes: `${t.notes} | Shows: ${t.showsList?.join(', ')} (Distance: ${t.distance} mi)`,
                          notifyDays: 14
                        };
                        setAllShows(prev => [newShow, ...prev]);
                        setSuccessMascot({
                          title: "Show Imported!",
                          message: `"${t.name}" added to calendar. Travel route is approx {t.distance} miles.`,
                          type: 'kiba'
                        });
                      }}
                      className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-650 border-none rounded-lg text-white font-bold text-[10px] cursor-pointer shrink-0 transition-all shadow self-center"
                    >
                      Import
                    </button>
                  </div>
                ));
              })()}
            </div>
          </div>

        </div>

        {/* Shows list column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass-container p-6">
            <h3 className="text-lg font-bold mb-4 text-white">Your Exhibition Schedule</h3>
            <div className="flex flex-col gap-4">
              {shows.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).map(s => {
                const dateObj = new Date(s.date);
                const today = new Date();
                today.setHours(0,0,0,0);
                const diffTime = dateObj - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let badgeColor = 'bg-slate-500/20 text-slate-300';
                if (s.status === 'attending') badgeColor = 'bg-green-500/20 text-green-300 border border-green-500/30';
                else if (s.status === 'interested') badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';

                return (
                  <div key={s.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-4 transition-all hover:bg-white/10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-white">
                          <h4 className="text-base font-bold">{s.name}</h4>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${badgeColor}`}>{s.status.replace('_', ' ')}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
                          <span>📅 Date: <strong>{s.date}</strong></span>
                          <span>📍 Location: <strong>{s.location || 'Not Specified'}</strong></span>
                        </div>
                        <p className="opacity-70 mt-1 italic text-slate-400">Notes: {s.notes || 'No notes added.'}</p>
                        {diffDays > 0 ? (
                          <span className="text-xs font-bold text-indigo-400">⏱️ {diffDays} days remaining</span>
                        ) : diffDays === 0 ? (
                          <span className="text-xs font-black text-rose-500 animate-pulse">📅 TODAY IS SHOW DAY! Best of luck! 🏆</span>
                        ) : (
                          <span className="text-xs opacity-50 text-slate-400">Expired / Passed ({Math.abs(diffDays)} days ago)</span>
                        )}
                      </div>

                      <div className="flex flex-col sm:items-end gap-2 shrink-0 w-full sm:w-auto">
                        <select 
                          value={s.status} 
                          onChange={(e) => {
                            setAllShows(prev => prev.map(item => item.id === s.id ? { ...item, status: e.target.value } : item));
                          }}
                          className="text-xs font-bold py-1.5 px-3 rounded-xl bg-slate-900 border border-white/10 text-white cursor-pointer w-full sm:w-40"
                        >
                          <option value="attending">Attending</option>
                          <option value="interested">Interested</option>
                          <option value="not_attending">Not Attending</option>
                        </select>
                        {!isAssistantWriteOnly && (
                          <div className="flex gap-2 w-full justify-end">
                            <button 
                              onClick={() => {
                                setAllShows(prev => prev.filter(item => item.id !== s.id));
                                setAllShowEntries(prev => prev.filter(se => se.showId !== s.id));
                              }}
                              className="btn-interactive py-1 px-3 bg-red-800 text-xs border-none"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* COLLAPSIBLE SHOW ENTRIES SECTION */}
                    {s.status !== 'not_attending' && (
                      <div className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                            📋 Registered Show Entries ({allShowEntries.filter(se => se.showId === s.id).length})
                          </span>
                        </div>

                        {(() => {
                          const registeredEntries = allShowEntries.filter(se => se.showId === s.id);
                          const availableRabbitsForShow = rabbits.filter(r => r.status !== 'pedigree_only' && r.status !== 'sold' && !allShowEntries.some(se => se.showId === s.id && se.rabbitId === r.id));

                          return (
                            <>
                              {registeredEntries.length > 0 && (
                                <div className="overflow-x-auto w-full">
                                  <table className="w-full text-[11px] text-left border-collapse text-slate-205">
                                    <thead>
                                      <tr className="text-slate-400 border-b border-white/5 font-bold">
                                        <th className="pb-1.5 pr-2">Tattoo</th>
                                        <th className="pb-1.5 pr-2">Name</th>
                                        <th className="pb-1.5 pr-2">Breed</th>
                                        <th className="pb-1.5 pr-2">Calculated Class</th>
                                        <th className="pb-1.5 pr-2">FDA Clearance</th>
                                        <th className="pb-1.5 text-right">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-slate-100">
                                      {registeredEntries.map(entry => {
                                        const r = rabbits.find(rab => rab.id === entry.rabbitId);
                                        if (!r) return null;
                                        const computedClass = calculateRabbitShowClass(r.dob, r.breed, r.sex, s.date, r.showClass);
                                        const fda = isUnderFdaWithdrawal(r.id);

                                        return (
                                          <tr key={entry.id} className="hover:bg-white/5">
                                            <td className="py-2 font-mono font-bold text-indigo-400">{r.tattooNumber}</td>
                                            <td className="py-2 text-white font-semibold">{r.name}</td>
                                            <td className="py-2">{r.breed}</td>
                                            <td className="py-2 font-bold text-yellow-400">{computedClass}</td>
                                            <td className="py-2">
                                              {fda.active ? (
                                                <span className="text-rose-455 font-extrabold">
                                                  ⚠️ FDA WITHDRAWAL ({fda.remainingDays}d left: {fda.drugName})
                                                </span>
                                              ) : (
                                                <span className="text-emerald-450 font-bold flex items-center gap-1">
                                                  🛡️ Clear / Safe
                                                </span>
                                              )}
                                            </td>
                                            <td className="py-2 text-right">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setAllShowEntries(prev => prev.filter(se => se.id !== entry.id));
                                                  showToast(`Removed ${r.name} from show.`, "info");
                                                }}
                                                className="bg-red-900/30 hover:bg-red-900/60 text-red-300 font-bold px-2 py-0.5 rounded border-none cursor-pointer text-[9px]"
                                              >
                                                Remove
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {availableRabbitsForShow.length > 0 ? (
                                <form 
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const rabbitId = e.target.entryRabbitId.value;
                                    if (!rabbitId) return;
                                    const entryItem = {
                                      id: `se-${Date.now()}`,
                                      showId: s.id,
                                      rabbitId
                                    };
                                    setAllShowEntries(prev => [...prev, entryItem]);
                                    const selectedRabName = rabbits.find(rab => rab.id === rabbitId)?.name || 'Rabbit';
                                    showToast(`Registered ${selectedRabName} for this show!`, "success");
                                  }}
                                  className="flex items-center gap-2 max-w-sm mt-1"
                                >
                                  <select 
                                    name="entryRabbitId" 
                                    className="text-[11px] py-1 px-2 rounded-lg bg-slate-900 border border-white/10 text-white cursor-pointer flex-1 focus:outline-none"
                                    required
                                  >
                                    <option value="">-- Enter Rabbit in Show --</option>
                                    {availableRabbitsForShow.map(rab => (
                                      <option key={rab.id} value={rab.id}>
                                        {rab.name} ({rab.tattooNumber})
                                      </option>
                                    ))}
                                  </select>
                                  <button 
                                    type="submit" 
                                    className="btn-interactive text-[10px] py-1 px-3 bg-indigo-600 hover:bg-indigo-650 border-none font-bold text-white whitespace-nowrap shrink-0"
                                  >
                                    Enter Rabbit
                                  </button>
                                </form>
                              ) : (
                                <p className="text-[10px] opacity-60 text-slate-400">All available rabbits are registered for this show.</p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
              {shows.length === 0 && (
                <p className="text-sm opacity-60 text-center py-8 text-slate-400">No shows in your schedule. Use the forms to create or import some shows!</p>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
