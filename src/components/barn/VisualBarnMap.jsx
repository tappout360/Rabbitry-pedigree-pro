import React, { useState } from 'react';
import { Plus, Trash2, Move, HelpCircle } from 'lucide-react';

/**
 * 2D Drag-and-Drop Barn Map Canvas Planner
 */
export default function VisualBarnMap({ rabbits, breedings, onUpdateRabbitLocation }) {
  const [rows, setRows] = useState(() => {
    // Default sample barn layout if none saved
    const saved = localStorage.getItem('wp_barn_layout_rows');
    return saved ? JSON.parse(saved) : [
      { id: 'row-a', name: 'Row A (Holland Lops)', cages: ['A-1', 'A-2', 'A-3', 'A-4'] },
      { id: 'row-b', name: 'Row B (New Zealands)', cages: ['B-1', 'B-2', 'B-3', 'B-4'] }
    ];
  });

  const [newRowName, setNewRowName] = useState('');
  const [newCageName, setNewCageName] = useState('');
  const [selectedRowId, setSelectedRowId] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Save layout
  const saveLayout = (updated) => {
    setRows(updated);
    localStorage.setItem('wp_barn_layout_rows', JSON.stringify(updated));
  };

  const handleAddRow = (e) => {
    e.preventDefault();
    if (!newRowName.trim()) return;
    const updated = [...rows, { id: `row-${Date.now()}`, name: newRowName, cages: [] }];
    saveLayout(updated);
    setNewRowName('');
  };

  const handleAddCage = (e) => {
    e.preventDefault();
    if (!newCageName.trim() || !selectedRowId) return;
    const updated = rows.map(r => {
      if (r.id === selectedRowId) {
        return { ...r, cages: [...r.cages, newCageName.trim()] };
      }
      return r;
    });
    saveLayout(updated);
    setNewCageName('');
  };

  const handleDeleteCage = (rowId, cageName) => {
    const updated = rows.map(r => {
      if (r.id === rowId) {
        return { ...r, cages: r.cages.filter(c => c !== cageName) };
      }
      return r;
    });
    saveLayout(updated);
  };

  const handleDeleteRow = (rowId) => {
    if (!confirm("Are you sure you want to delete this row and all its cage references?")) return;
    const updated = rows.filter(r => r.id !== rowId);
    saveLayout(updated);
  };

  // Drag and Drop handlers
  const handleDragStart = (e, rabbitId) => {
    e.dataTransfer.setData('text/plain', rabbitId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetLocation) => {
    e.preventDefault();
    const rabbitId = e.dataTransfer.getData('text/plain');
    if (rabbitId && onUpdateRabbitLocation) {
      onUpdateRabbitLocation(rabbitId, targetLocation);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Configuration Header Panel */}
      <div className="glass-container p-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-3 flex-wrap gap-4">
          <div className="text-left">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              🗺️ 2D Drag-and-Drop Barn Map
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Visualize your physical hutch rows and move rabbits by dragging cards between cages.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="btn-interactive py-1.5 px-3 bg-slate-800 text-xs border border-white/10 text-slate-300 font-bold flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Guide
            </button>
          </div>
        </div>

        {showHelp && (
          <div className="p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl text-left text-xs mt-4 leading-relaxed text-slate-350">
            <h4 className="font-bold text-indigo-300 mb-1.5">How to use the Barn Planner:</h4>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Create <strong>Hutch Rows</strong> representing physical aisles or sections in your barn.</li>
              <li>Add <strong>Cage Names</strong> (e.g. A-1, A-2-Top) matching your setup tags.</li>
              <li>To assign a rabbit, edit their profile and set their Location matching a cage name, or drag them directly!</li>
              <li>A <strong className="text-amber-400">Pulsing Gold Glow</strong> indicates an active pregnant doe.</li>
            </ul>
          </div>
        )}

        {/* Layout Editors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5 text-xs text-left">
          {/* Add Row */}
          <form onSubmit={handleAddRow} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
            <h4 className="font-bold text-indigo-400">Add New Hutch Row</h4>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. Row C (Breeders)" 
                value={newRowName}
                onChange={(e) => setNewRowName(e.target.value)}
                className="bg-slate-950 text-white border border-white/10 rounded-xl p-2 flex-grow"
              />
              <button type="submit" className="btn-interactive py-2 px-4 bg-indigo-600 hover:bg-indigo-655 text-white flex items-center gap-1 font-bold">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </form>

          {/* Add Cage */}
          <form onSubmit={handleAddCage} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
            <h4 className="font-bold text-indigo-400">Add Cage Slot to Row</h4>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedRowId}
                onChange={(e) => setSelectedRowId(e.target.value)}
                className="bg-slate-950 text-white border border-white/10 rounded-xl p-2"
                required
              >
                <option value="">Select Row</option>
                {rows.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="e.g. C-1-Top" 
                value={newCageName}
                onChange={(e) => setNewCageName(e.target.value)}
                className="bg-slate-950 text-white border border-white/10 rounded-xl p-2"
                required
              />
            </div>
            <button type="submit" className="btn-interactive py-2 w-full bg-indigo-600 hover:bg-indigo-655 text-white flex items-center justify-center gap-1 font-bold">
              <Plus className="w-4 h-4" /> Add Cage Slot
            </button>
          </form>
        </div>
      </div>

      {/* Rows Canvas Grid */}
      <div className="flex flex-col gap-6 text-left">
        {rows.map(row => (
          <div key={row.id} className="glass-container p-6 border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h4 className="font-bold text-white text-sm">{row.name}</h4>
              <button 
                onClick={() => handleDeleteRow(row.id)}
                className="text-red-400 hover:text-red-300 bg-transparent border-none cursor-pointer p-1"
                title="Delete Row"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Cages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {row.cages.map(cage => {
                // Find rabbits located in this cage
                const occupant = rabbits.find(r => r.location === cage && r.status !== 'sold' && r.status !== 'dead');

                // Check active breeding pregnancy status
                let isPregnant = false;
                if (occupant && occupant.sex === 'doe') {
                  const activeBreeding = breedings.find(b => b.doeId === occupant.id && (b.status === 'bred' || b.status === 'palpated_positive'));
                  if (activeBreeding) {
                    isPregnant = true;
                  }
                }

                // Determine border color-coding
                let borderClass = 'border-white/5 bg-slate-950/40';
                if (occupant) {
                  if (isPregnant) {
                    borderClass = 'border-amber-500/40 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.15)] animate-pulse';
                  } else if (occupant.sex === 'buck') {
                    borderClass = 'border-blue-500/30 bg-blue-500/5';
                  } else {
                    borderClass = 'border-pink-500/30 bg-pink-500/5';
                  }
                }

                return (
                  <div
                    key={cage}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, cage)}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 min-h-[140px] text-xs ${borderClass}`}
                  >
                    {/* Cage Header */}
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-indigo-400 uppercase tracking-wide text-[10px]">{cage}</span>
                      <button 
                        onClick={() => handleDeleteCage(row.id, cage)}
                        className="text-slate-500 hover:text-red-400 bg-transparent border-none cursor-pointer"
                        title="Delete Cage Slot"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Occupant Card */}
                    {occupant ? (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, occupant.id)}
                        className="bg-black/40 border border-white/5 p-2.5 rounded-xl flex flex-col gap-1 cursor-grab active:cursor-grabbing hover:border-white/10"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-white truncate max-w-[70%]">{occupant.name}</span>
                          <Move className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>{occupant.tattooNumber}</span>
                          <span className="capitalize">{occupant.sex}</span>
                        </div>
                        <div className="text-[9px] text-indigo-300 truncate text-left mt-0.5">{occupant.variety}</div>
                        {isPregnant && (
                          <span className="text-[8px] bg-amber-500/20 text-amber-300 font-bold py-0.5 px-1 rounded block mt-1 text-center animate-pulse">
                            🤰 Pregnant
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="border border-dashed border-white/10 rounded-xl py-5 text-center text-slate-500 text-[10px] italic">
                        Empty Cage
                      </div>
                    )}
                  </div>
                );
              })}

              {row.cages.length === 0 && (
                <div className="col-span-4 text-center py-6 text-xs text-slate-500 italic">No cage slots in this row. Add a cage slot above.</div>
              )}
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="glass-container p-12 text-center text-slate-500 text-xs italic">
            Your Barn Layout is empty. Create a Hutch Row above to begin planning!
          </div>
        )}
      </div>

    </div>
  );
}
