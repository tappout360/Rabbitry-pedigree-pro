import React, { useState } from 'react';
import { HeartPulse, ShieldCheck, Plus, Trash, X } from 'lucide-react';
import { BREED_STANDARDS } from '../db/breedStandards';
import { maskYouthField } from '../db/security';
import { uuidv7 } from '../db/uuid';

export default function HealthLogger({
  rabbits,
  allWeights,
  allMedical,
  handleAddWeight,
  handleDeleteWeight,
  handleAddMedical,
  handleDeleteMedical,
  handleVoiceInput,
  formatWeightDisplay,
  formatWeightShort,
  getAgeMonths,
  validateArbaStandard,
  weightUnit,
  isAssistantWriteOnly,
  currentUser,
  searchQuery,
  setSearchQuery
}) {
  // Local UI state — internalized from App.jsx global scope
  const [healthSelectedRabbitId, setHealthSelectedRabbitId] = useState('');
  const [showMedicalFormModal, setShowMedicalFormModal] = useState(false);
  const [newWeightEntry, setNewWeightEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    weightOz: '',
    stage: 'Routine'
  });
  const [newMedicalEntry, setNewMedicalEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Vaccination',
    treatment: '',
    notes: '',
    cost: '',
    fdaWithdrawalDays: 0,
    fdaApprovalStatus: 'FDA Approved for Rabbits'
  });

  // Wrap parent weight handler to inject local state
  const onAddWeight = (e) => {
    e.preventDefault();
    if (!healthSelectedRabbitId || !newWeightEntry.weightOz) {
      alert("Please select a rabbit and enter a weight!");
      return;
    }
    handleAddWeight({
      rabbitId: healthSelectedRabbitId,
      ...newWeightEntry
    });
    setNewWeightEntry({
      date: new Date().toISOString().split('T')[0],
      weightOz: '',
      stage: 'Routine'
    });
  };

  // Wrap parent medical handler to inject local state
  const onAddMedical = (e) => {
    e.preventDefault();
    if (!healthSelectedRabbitId || !newMedicalEntry.treatment) {
      alert("Please select a rabbit and enter treatment details!");
      return;
    }
    const success = handleAddMedical({
      rabbitId: healthSelectedRabbitId,
      ...newMedicalEntry
    });
    if (success !== false) {
      setShowMedicalFormModal(false);
      setNewMedicalEntry({
        date: new Date().toISOString().split('T')[0],
        type: 'Vaccination',
        treatment: '',
        notes: '',
        cost: '',
        fdaWithdrawalDays: 0,
        fdaApprovalStatus: 'FDA Approved for Rabbits'
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
      {/* Left Column: Rabbit List Context Selector */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="glass-container p-4 flex flex-col gap-3">
          <h3 className="text-base font-bold text-white mb-1">Select Rabbit</h3>
          
          {/* Search inside Health */}
          <input 
            type="text" 
            placeholder="Filter rabbits..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs"
          />

          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
            {rabbits.filter(r => 
              r.status !== 'pedigree_only' && r.status !== 'sold' && r.status !== 'dead' && (
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                r.tattooNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                r.breed.toLowerCase().includes(searchQuery.toLowerCase())
              )
            ).map(r => {
              const isSelected = healthSelectedRabbitId === r.id;
              const lastWeight = allWeights
                .filter(w => w.rabbitId === r.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
              return (
                <button
                  key={r.id}
                  onClick={() => setHealthSelectedRabbitId(r.id)}
                  className={`p-3 rounded-xl text-left border transition-all flex justify-between items-center ${
                    isSelected 
                      ? 'bg-emerald-500/20 border-emerald-500/50 shadow-inner' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-bold ${
                        r.sex === 'buck' ? 'bg-sky-500/10 text-sky-400' : 'bg-pink-500/10 text-pink-400'
                      }`}>
                        {r.tattooNumber}
                      </span>
                      <span className="font-bold text-xs text-white line-clamp-1">{r.name}</span>
                    </div>
                    <span className="text-[10px] opacity-60 block mt-1">{r.breed} • {r.variety}</span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xs font-bold block text-emerald-400">
                      {formatWeightShort(lastWeight ? lastWeight.weightOz : r.weightOz || 0)}
                    </span>
                    <span className="text-[9px] opacity-50 block uppercase tracking-wider font-mono">Last Weight</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Selected Rabbit Workspace */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {!healthSelectedRabbitId ? (
          <div className="glass-container p-12 text-center flex flex-col items-center justify-center gap-4 border border-white/10 min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-emerald-50/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HeartPulse className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Health & Growth Workspace</h3>
              <p className="text-xs opacity-75 max-w-sm mx-auto">
                Please select a rabbit from the list on the left to view growth charts, manage medical/vaccine history, and check ARBA standards compliance.
              </p>
            </div>
          </div>
        ) : (() => {
          const rabbit = rabbits.find(r => r.id === healthSelectedRabbitId);
          if (!rabbit) return null;
          
          const standard = BREED_STANDARDS[rabbit.breed];
          const ageMonths = getAgeMonths(rabbit.dob);
          const sortedWeights = allWeights
            .filter(w => w.rabbitId === rabbit.id)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weightOz : rabbit.weightOz;
          const validation = validateArbaStandard(rabbit);

          // Medical calculations
          const rabbitMedical = allMedical
            .filter(m => m.rabbitId === rabbit.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

          return (
            <div className="flex flex-col gap-6">
              
              {/* 1. Rabbit Quick Info Stats Grid */}
              <div className="glass-container p-5 grid grid-cols-2 md:grid-cols-4 gap-4 border border-emerald-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase opacity-60 font-bold tracking-wider">Age & Sex</span>
                  <span className="text-sm font-bold text-white capitalize flex items-center gap-1">
                    {rabbit.sex === 'buck' ? '♂ Buck' : '♀ Doe'}
                    <span className="opacity-75 font-normal">({ageMonths} mos)</span>
                  </span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase opacity-60 font-bold tracking-wider">ARBA Class</span>
                  <span className="text-sm font-bold text-white">
                    {standard ? standard.classType : 'Unknown'}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase opacity-60 font-bold tracking-wider">Current Weight</span>
                  <span className={`text-sm font-bold ${validation.valid ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {formatWeightDisplay(currentWeight)}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase opacity-60 font-bold tracking-wider">Next Routine Check</span>
                  <span className="text-sm font-bold text-white">
                    {(() => {
                      const dewormings = rabbitMedical.filter(m => m.type === 'Prevention');
                      if (dewormings.length === 0) return 'Immediate';
                      // Predict 3 months from last deworming date
                      const lastDate = new Date(dewormings[0].date);
                      lastDate.setMonth(lastDate.getMonth() + 3);
                      return lastDate.toISOString().split('T')[0];
                    })()}
                  </span>
                </div>
              </div>

              {/* ARBA Standards Check Banner */}
              <div className={`p-4 rounded-xl border flex gap-3 items-start text-xs ${
                validation.valid 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
              }`}>
                <ShieldCheck className={`w-5 h-5 shrink-0 ${validation.valid ? 'text-emerald-400' : 'text-amber-400'}`} />
                <div>
                  <h4 className="font-bold">ARBA Standards of Perfection Validation</h4>
                  <p className="opacity-85 mt-0.5 leading-relaxed">
                    {validation.valid 
                      ? `Compliant. ${rabbit.name}'s weight matches ARBA specifications for ${rabbit.breed} ${rabbit.sex}s.` 
                      : `${validation.reason}`
                    }
                  </p>
                </div>
              </div>

              {/* 2. Weight Growth Curve & History Card */}
              <div className="glass-container p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Weight Growth Curve</h3>
                  <p className="text-xs opacity-75">Compare historical weight points against ARBA standard weight limits.</p>
                </div>

                {/* Developmental Weight Stages Summary Grid */}
                {(() => {
                  const getLatestWeightForStage = (stageName) => {
                    const match = [...sortedWeights].reverse().find(w => w.stage === stageName);
                    return match ? formatWeightDisplay(match.weightOz) : '—';
                  };
                  const is6Class = BREED_STANDARDS[rabbit.breed]?.classType === '6-class';
                  
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/40 rounded-xl border border-white/5 text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="opacity-60 text-[10px] uppercase font-bold tracking-wider">Pre-Wean (Baby)</span>
                        <span className="font-extrabold text-indigo-300 text-sm">{getLatestWeightForStage('Pre-Wean (Baby)')}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="opacity-60 text-[10px] uppercase font-bold tracking-wider">Junior</span>
                        <span className="font-extrabold text-indigo-300 text-sm">{getLatestWeightForStage('Junior')}</span>
                      </div>
                      {is6Class ? (
                        <div className="flex flex-col gap-1">
                          <span className="opacity-60 text-[10px] uppercase font-bold tracking-wider">Intermediate</span>
                          <span className="font-extrabold text-indigo-300 text-sm">{getLatestWeightForStage('Intermediate')}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 opacity-40">
                          <span className="opacity-60 text-[10px] uppercase font-bold tracking-wider">Intermediate</span>
                          <span className="font-semibold text-slate-400 text-xs italic">N/A (4-Class Breed)</span>
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <span className="opacity-60 text-[10px] uppercase font-bold tracking-wider">Senior</span>
                        <span className="font-extrabold text-indigo-300 text-sm">{getLatestWeightForStage('Senior')}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Responsive Interactive SVG Chart */}
                <div className="w-full bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col items-center">
                  {(() => {
                    const bounds = [];
                    if (standard) {
                      const sex = rabbit.sex;
                      const is4Class = standard.classType === '4-class';
                      
                      const jrMax = sex === 'buck' ? standard.buckJrMax : standard.doeJrMax;
                      const srMin = sex === 'buck' ? standard.buckSrMin : standard.doeSrMin;
                      const srMax = sex === 'buck' ? standard.buckSrMax : standard.doeSrMax;

                      if (is4Class) {
                        if (typeof jrMax === 'number' && jrMax > 0) bounds.push({ value: jrMax, label: `Jr Max`, color: 'stroke-amber-500/60' });
                        if (typeof srMin === 'number' && srMin > 0) bounds.push({ value: srMin, label: `Sr Min`, color: 'stroke-emerald-500/60' });
                        if (typeof srMax === 'number' && srMax < 9900) bounds.push({ value: srMax, label: `Sr Max`, color: 'stroke-rose-500/60' });
                      } else {
                        const intMin = sex === 'buck' ? standard.buckIntMin : standard.doeIntMin;
                        const intMax = sex === 'buck' ? standard.buckIntMax : standard.doeIntMax;
                        if (typeof jrMax === 'number' && jrMax > 0) bounds.push({ value: jrMax, label: `Jr Max`, color: 'stroke-amber-500/60' });
                        if (typeof intMin === 'number' && intMin > 0) bounds.push({ value: intMin, label: `Int Min`, color: 'stroke-cyan-500/60' });
                        if (typeof intMax === 'number' && intMax < 9900) bounds.push({ value: intMax, label: `Int Max`, color: 'stroke-sky-500/60' });
                        if (typeof srMin === 'number' && srMin > 0) bounds.push({ value: srMin, label: `Sr Min`, color: 'stroke-emerald-500/60' });
                        if (typeof srMax === 'number' && srMax < 9900) bounds.push({ value: srMax, label: `Sr Max`, color: 'stroke-rose-500/60' });
                      }
                    }

                    const weightVals = sortedWeights.map(w => w.weightOz);
                    const boundVals = bounds.map(b => b.value);
                    const allVals = [...weightVals, ...boundVals];
                    const maxVal = allVals.length > 0 ? Math.max(...allVals) : 100;
                    const minVal = allVals.length > 0 ? Math.max(0, Math.min(...allVals) - 10) : 0;
                    const chartMax = maxVal * 1.15;
                    const chartMin = Math.max(0, minVal * 0.85);

                    const svgW = 500;
                    const svgH = 260;
                    const padL = 50;
                    const padR = 120;
                    const padT = 30;
                    const padB = 40;
                    const gW = svgW - padL - padR;
                    const gH = svgH - padT - padB;

                    const getX = (idx) => padL + (idx * (gW / Math.max(1, sortedWeights.length - 1)));
                    const getY = (val) => (padT + gH) - ((val - chartMin) / (chartMax - chartMin || 1)) * gH;

                    // Create path
                    let dPath = '';
                    let dArea = '';
                    if (sortedWeights.length > 0) {
                      dPath = sortedWeights.map((w, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(w.weightOz)}`).join(' ');
                      dArea = `${dPath} L ${getX(sortedWeights.length - 1)} ${padT + gH} L ${getX(0)} ${padT + gH} Z`;
                    }

                    return (
                      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-lg h-auto select-none overflow-visible">
                        <defs>
                          <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                          const val = chartMin + p * (chartMax - chartMin);
                          const y = getY(val);
                          return (
                            <g key={i} className="opacity-20">
                              <line x1={padL} y1={y} x2={padL + gW} y2={y} stroke="white" strokeWidth="1" strokeDasharray="3 3" />
                              <text x={padL - 10} y={y + 4} fill="white" className="text-[10px] font-mono text-right" textAnchor="end">
                                {Math.round(val)}oz
                              </text>
                            </g>
                          );
                        })}

                        {/* ARBA Target Bounds Dotted Lines */}
                        {bounds.map((b, i) => {
                          const y = getY(b.value);
                          return (
                            <g key={i}>
                              <line 
                                x1={padL} 
                                y1={y} 
                                x2={padL + gW + 15} 
                                y2={y} 
                                strokeWidth="1.5" 
                                strokeDasharray="4 4" 
                                className={b.color} 
                              />
                              <text 
                                x={padL + gW + 20} 
                                y={y + 3} 
                                className="text-[9px] font-semibold fill-white/60 tracking-tight" 
                                textAnchor="start"
                              >
                                {b.label}
                              </text>
                            </g>
                          );
                        })}

                        {/* Area Under Curve */}
                        {sortedWeights.length > 1 && (
                          <path d={dArea} fill="url(#areaGlow)" />
                        )}

                        {/* Trendline */}
                        {sortedWeights.length > 1 && (
                          <path d={dPath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        )}

                        {/* Data Points */}
                        {sortedWeights.map((w, idx) => {
                          const cx = getX(idx);
                          const cy = getY(w.weightOz);
                          return (
                            <g key={w.id} className="group cursor-pointer">
                              <circle cx={cx} cy={cy} r="5" fill="#10b981" className="stroke-slate-950 stroke-2 hover:r-7 transition-all" />
                              <text x={cx} y={cy - 10} className="text-[10px] font-bold fill-white text-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 px-1 py-0.5 rounded" textAnchor="middle">
                                {formatWeightShort(w.weightOz)}
                              </text>
                              
                              {/* X-Axis labels */}
                              <text x={cx} y={padT + gH + 15} fill="white" className="text-[8px] opacity-65 font-mono" textAnchor="middle">
                                {w.date.substring(5)}
                              </text>
                              <text x={cx} y={padT + gH + 28} fill="white" className="text-[8px] opacity-45 font-bold" textAnchor="middle">
                                {w.stage}
                              </text>
                            </g>
                          );
                        })}

                        {sortedWeights.length === 0 && (
                          <text x={padL + gW/2} y={padT + gH/2} fill="white" className="text-xs opacity-50" textAnchor="middle">
                            No weight logs recorded yet
                          </text>
                        )}
                      </svg>
                    );
                  })()}
                </div>

                {/* Form: Add Weight Check */}
                <form onSubmit={onAddWeight} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/5 border border-white/5 items-end">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Record Weight Check</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] opacity-75 font-semibold">Date</label>
                        <input 
                          type="date" 
                          required 
                          value={newWeightEntry.date}
                          onChange={(e) => setNewWeightEntry({ ...newWeightEntry, date: e.target.value })}
                          className="text-xs py-1.5 bg-slate-900 border-white/10"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] opacity-75 font-semibold">Stage</label>
                        <select 
                          value={newWeightEntry.stage}
                          onChange={(e) => setNewWeightEntry({ ...newWeightEntry, stage: e.target.value })}
                          className="text-xs py-1.5 bg-slate-900 border-white/10 text-white"
                        >
                          <option value="Pre-Wean (Baby)">Pre-Wean (Baby)</option>
                          <option value="Junior">Junior</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Senior">Senior</option>
                          <option value="Routine">Routine</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 col-span-1">
                    <label className="text-[10px] opacity-75 font-semibold flex items-center justify-between">
                      <span>Weight (ounces)</span>
                      <button
                        type="button"
                        onClick={() => handleVoiceInput((val) => setNewWeightEntry(prev => ({ ...prev, weightOz: val })), true)}
                        className="p-1 text-indigo-400 hover:text-indigo-300 rounded hover:bg-white/5 border-none cursor-pointer flex items-center justify-center"
                        title="Use hands-free voice input to speak the weight"
                      >
                        🎙️ Speak
                      </button>
                    </label>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      placeholder="E.g. 48"
                      value={newWeightEntry.weightOz}
                      onChange={(e) => setNewWeightEntry({ ...newWeightEntry, weightOz: e.target.value })}
                      className="text-xs py-1.5 bg-slate-900 border-white/10 text-white"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-interactive text-xs py-2 bg-emerald-600 hover:bg-emerald-650 h-[38px] flex items-center justify-center font-bold text-white shadow border-none"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Log Weight
                  </button>
                </form>

                {/* Weight Log History List */}
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-65">Historical Weight Logs</span>
                  {sortedWeights.map(w => (
                    <div key={w.id} className="p-3 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-white">{formatWeightDisplay(w.weightOz)}</span>
                        <span className="ml-3 opacity-60 text-[10px]">{w.date} • Stage: {w.stage}</span>
                      </div>
                      {!isAssistantWriteOnly ? (
                        <button 
                          onClick={() => handleDeleteWeight(w.id)}
                          type="button"
                          className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer"
                          title="Delete record"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] opacity-40 italic">Read-Only</span>
                      )}
                    </div>
                  ))}
                  {sortedWeights.length === 0 && (
                    <p className="text-[11px] opacity-55 py-2 text-center">No weights logged yet.</p>
                  )}
                </div>
              </div>

              {/* 3. Medical, Deworming & Vaccination History Card */}
              <div className="glass-container p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Medical & Treatment Records</h3>
                    <p className="text-xs opacity-75">Deworming logs, RHDV2 vaccination tracking, and veterinary files.</p>
                  </div>
                  
                  <button
                    onClick={() => setShowMedicalFormModal(true)}
                    type="button"
                    className="btn-interactive text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-650 font-bold text-white flex items-center gap-1 shadow border-none"
                  >
                    <Plus className="w-4 h-4" /> Log Treatment
                  </button>
                </div>

                {/* Medical Treatment list */}
                <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                  {rabbitMedical.map(m => (
                    <div key={m.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            m.type === 'Vaccination' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                            m.type === 'Prevention' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            m.type === 'Treatment' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {m.type}
                          </span>
                          <span className="text-white font-bold text-xs">
                            {maskYouthField('treatment', m.treatment, currentUser?.ageGroup)}
                          </span>
                        </div>
                        
                        {m.notes && (
                          <p className="text-xs opacity-75 leading-relaxed">
                            {maskYouthField('notes', m.notes, currentUser?.ageGroup)}
                          </p>
                        )}
                        
                        <div className="flex gap-4 text-[10px] opacity-60">
                          <span>Date: {m.date}</span>
                          {m.cost > 0 && <span>Cost: ${m.cost.toFixed(2)}</span>}
                        </div>
                      </div>

                      {!isAssistantWriteOnly ? (
                        <button 
                          onClick={() => handleDeleteMedical(m.id)}
                          type="button"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 shrink-0 cursor-pointer"
                          title="Delete treatment log"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] opacity-40 italic shrink-0">Read-Only</span>
                      )}
                    </div>
                  ))}

                  {rabbitMedical.length === 0 && (
                    <p className="text-xs opacity-60 py-6 text-center">No medical logs registered for this rabbit.</p>
                  )}
                </div>

              </div>

            </div>
          );
        })()}
      </div>

      {/* Log Medical Record Modal Dialog */}
      {showMedicalFormModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-container p-6 max-w-lg w-full border border-emerald-500/20 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-400 animate-pulse" />
                Log Health Treatment
              </h3>
              <button 
                onClick={() => setShowMedicalFormModal(false)}
                type="button"
                className="opacity-70 hover:opacity-100 text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={onAddMedical} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-white">Date</label>
                  <input 
                    type="date" 
                    required 
                    value={newMedicalEntry.date}
                    onChange={(e) => setNewMedicalEntry({ ...newMedicalEntry, date: e.target.value })}
                    className="bg-slate-900 border-white/10 text-xs py-2 text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-white">Record Type</label>
                  <select 
                    value={newMedicalEntry.type}
                    onChange={(e) => setNewMedicalEntry({ ...newMedicalEntry, type: e.target.value })}
                    className="bg-slate-900 border-white/10 text-xs py-2 text-white"
                  >
                    <option value="Vaccination">Vaccination</option>
                    <option value="Treatment">Treatment</option>
                    <option value="Prevention">Prevention (e.g. Deworming)</option>
                    <option value="Illness">Illness</option>
                    <option value="Injury">Injury</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs font-bold text-white">Treatment / Vaccine Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="E.g. RHDV2 Vaccine, Safeguard Dewormer"
                    value={newMedicalEntry.treatment}
                    onChange={(e) => setNewMedicalEntry({ ...newMedicalEntry, treatment: e.target.value })}
                    className="bg-slate-900 border-white/10 text-xs py-2 text-white"
                  />
                </div>
                <div className="flex flex-col gap-1 col-span-1">
                  <label className="text-xs font-bold text-white">Cost ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={newMedicalEntry.cost}
                    onChange={(e) => setNewMedicalEntry({ ...newMedicalEntry, cost: e.target.value })}
                    className="bg-slate-900 border-white/10 text-xs py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-white flex items-center gap-1">
                    🛡️ FDA Approval Classification
                  </label>
                  <select 
                    value={newMedicalEntry.fdaApprovalStatus}
                    onChange={(e) => setNewMedicalEntry({ ...newMedicalEntry, fdaApprovalStatus: e.target.value })}
                    className="bg-slate-900 border-white/10 text-xs py-2 text-white"
                  >
                    <option value="FDA Approved for Rabbits">FDA Approved (Rabbits)</option>
                    <option value="FDA Approved (Extra-label use by Vet)">FDA Approved (Extra-label Vet)</option>
                    <option value="Unapproved / Homeopathic">Unapproved / Homeopathic</option>
                    <option value="Not Applicable (Vaccine/Surgical)">Not Applicable (Vaccine/Surgical)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-white flex items-center gap-1">
                    ⚠️ FDA Withdrawal Period (Days)
                  </label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newMedicalEntry.fdaWithdrawalDays}
                    onChange={(e) => setNewMedicalEntry({ ...newMedicalEntry, fdaWithdrawalDays: Number(e.target.value) })}
                    className="bg-slate-900 border-white/10 text-xs py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-white">Clinical Notes</label>
                <textarea 
                  rows="3"
                  placeholder="Log reactions, dose sizes (e.g., 0.1ml per lb), next deworming cycle check, etc."
                  value={newMedicalEntry.notes}
                  onChange={(e) => setNewMedicalEntry({ ...newMedicalEntry, notes: e.target.value })}
                  className="bg-slate-900 border-white/10 text-xs p-2.5 rounded-xl w-full text-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowMedicalFormModal(false)}
                  className="btn-interactive text-xs py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-interactive text-xs py-2 px-6 bg-emerald-600 hover:bg-emerald-650 text-white font-bold cursor-pointer border-none"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
