import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Share2, FileText, Check, RotateCcw, ShieldCheck, User, Plus, Search, AlertTriangle } from 'lucide-react';
import { uuidv7 } from '../../db/uuid';
import { BREED_STANDARDS } from '../../db/breedStandards';

export default function PedigreeBuilder({ rabbits = [], onUpdateRabbit }) {
  const [selectedRabbitId, setSelectedRabbitId] = useState(rabbits[0]?.id || '');
  const [activeAssignNode, setActiveAssignNode] = useState(null); // { id: 'sire' | 'dam' | 'sireSire' etc, label: string }
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: '',
    tattooNumber: '',
    breed: '',
    variety: '',
    dob: '',
    weightOz: '',
    registrationNumber: '',
    gcNumber: '',
    breederName: '',
    breederPrefix: ''
  });

  // Canvas Signature Pad references
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');

  // Active rabbit instance
  const activeRabbit = useMemo(() => {
    return rabbits.find(r => r.id === selectedRabbitId) || null;
  }, [rabbits, selectedRabbitId]);

  useEffect(() => {
    if (activeRabbit) {
      setCustomForm(prev => ({ ...prev, breed: activeRabbit.breed || '' }));
    }
  }, [activeRabbit]);

  // Load signature if already exists
  useEffect(() => {
    if (activeRabbit?.breederSignature) {
      setSignatureDataUrl(activeRabbit.breederSignature);
      setHasSignature(true);
    } else {
      setSignatureDataUrl('');
      setHasSignature(false);
      clearSignature();
    }
  }, [selectedRabbitId, activeRabbit]);

  // Clear signature canvas
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      
      if (activeRabbit && activeRabbit.breederSignature) {
        const updatedRabbit = { ...activeRabbit, breederSignature: '' };
        onUpdateRabbit(updatedRabbit);
      }
    }
  };

  // Start drawing on canvas
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#ea580c'; // orange accent
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  // Drawing on canvas
  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  // End drawing on canvas
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setSignatureDataUrl(dataUrl);
      
      // Save signature to active rabbit
      if (activeRabbit) {
        const updatedRabbit = { ...activeRabbit, breederSignature: dataUrl };
        onUpdateRabbit(updatedRabbit);
      }
    }
  };

  // 3-Generation Pedigree Node Resolver
  const pedigreeNodes = useMemo(() => {
    if (!activeRabbit) return {};

    const findRabbit = (id) => rabbits.find(r => r.id === id) || null;

    // Parents
    const sire = activeRabbit.sireId ? findRabbit(activeRabbit.sireId) : null;
    const dam = activeRabbit.damId ? findRabbit(activeRabbit.damId) : null;

    // Grandparents
    const sireSire = sire?.sireId ? findRabbit(sire.sireId) : null;
    const sireDam = sire?.damId ? findRabbit(sire.damId) : null;
    const damSire = dam?.sireId ? findRabbit(dam.sireId) : null;
    const damDam = dam?.damId ? findRabbit(dam.damId) : null;

    return {
      self: activeRabbit,
      sire,
      dam,
      sireSire,
      sireDam,
      damSire,
      damDam
    };
  }, [activeRabbit, rabbits]);

  // Validation Engine against ARBA and logical rules
  const validateAssignment = (nodeKey, rabbitToAssign) => {
    if (!activeRabbit || !rabbitToAssign) return { isValid: true };

    // 1. Sex Validation
    const isMaleNode = ['sire', 'sireSire', 'damSire'].includes(nodeKey);
    const isFemaleNode = ['dam', 'sireDam', 'damDam'].includes(nodeKey);

    if (isMaleNode && rabbitToAssign.sex !== 'buck') {
      return { isValid: false, message: `Cannot assign ${rabbitToAssign.name}: This pedigree node requires a male (buck).` };
    }
    if (isFemaleNode && rabbitToAssign.sex !== 'doe') {
      return { isValid: false, message: `Cannot assign ${rabbitToAssign.name}: This pedigree node requires a female (doe).` };
    }

    // 2. Age/DOB Logic Validation
    let childNode = activeRabbit;
    if (['sireSire', 'sireDam'].includes(nodeKey)) childNode = pedigreeNodes.sire;
    if (['damSire', 'damDam'].includes(nodeKey)) childNode = pedigreeNodes.dam;

    if (childNode && rabbitToAssign.dob && childNode.dob) {
      if (new Date(rabbitToAssign.dob) >= new Date(childNode.dob)) {
        return { isValid: false, message: `Invalid Birthdate: Parent (${rabbitToAssign.name}) cannot be younger/same age as their child (${childNode.name}).` };
      }
    }

    // 3. Cross-Breed Warnings
    if (activeRabbit.breed !== rabbitToAssign.breed) {
      return { 
        isValid: true, 
        warning: `Cross-breeding warning: Selected parent breed (${rabbitToAssign.breed}) differs from active rabbit breed (${activeRabbit.breed}).` 
      };
    }

    return { isValid: true };
  };

  // Perform Node Assignment
  const handleAssignRabbit = (rabbit) => {
    if (!activeRabbit || !activeAssignNode) return;

    const validation = validateAssignment(activeAssignNode.id, rabbit);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    if (validation.warning) {
      if (!window.confirm(validation.warning + " Do you still want to proceed?")) {
        return;
      }
    }

    let updatedRabbit = { ...activeRabbit };

    // Direct parents
    if (activeAssignNode.id === 'sire') {
      updatedRabbit.sireId = rabbit.id;
    } else if (activeAssignNode.id === 'dam') {
      updatedRabbit.damId = rabbit.id;
    } else {
      // Indirect grandparents (need to update the parent rabbit)
      let parentRabbit = null;
      if (activeAssignNode.id.startsWith('sire')) {
        parentRabbit = pedigreeNodes.sire;
      } else {
        parentRabbit = pedigreeNodes.dam;
      }

      if (parentRabbit) {
        const updatedParent = { ...parentRabbit };
        if (activeAssignNode.id.endsWith('Sire')) {
          updatedParent.sireId = rabbit.id;
        } else {
          updatedParent.damId = rabbit.id;
        }
        onUpdateRabbit(updatedParent);
      } else {
        alert("Please assign the direct parent (Sire/Dam) first before assigning grandparents.");
        return;
      }
    }

    onUpdateRabbit(updatedRabbit);
    setActiveAssignNode(null);
    setSearchQuery('');
  };

  const handleCreatePedigreeOnly = (e) => {
    e.preventDefault();
    if (!activeRabbit || !activeAssignNode) return;
    
    const newRabbitId = uuidv7();
    const newRabbit = {
      id: newRabbitId,
      breederId: activeRabbit.breederId,
      name: customForm.name || 'Unnamed Ancestor',
      tattooNumber: customForm.tattooNumber || '',
      breed: customForm.breed || activeRabbit.breed,
      variety: customForm.variety || '',
      sex: ['sire', 'sireSire', 'damSire'].includes(activeAssignNode.id) ? 'buck' : 'doe',
      dob: customForm.dob || '',
      weightOz: customForm.weightOz ? parseFloat(customForm.weightOz) : '',
      registrationNumber: customForm.registrationNumber || '',
      gcNumber: customForm.gcNumber || '',
      breederName: customForm.breederName || '',
      breederPrefix: customForm.breederPrefix || '',
      status: 'pedigree_only',
      photos: [],
      legs: []
    };

    onUpdateRabbit(newRabbit);

    const updatedRabbit = { ...activeRabbit };
    if (activeAssignNode.id === 'sire') {
      updatedRabbit.sireId = newRabbitId;
    } else if (activeAssignNode.id === 'dam') {
      updatedRabbit.damId = newRabbitId;
    } else {
      let parentRabbit = null;
      if (activeAssignNode.id.startsWith('sire')) {
        parentRabbit = pedigreeNodes.sire;
      } else {
        parentRabbit = pedigreeNodes.dam;
      }

      if (parentRabbit) {
        const updatedParent = { ...parentRabbit };
        if (activeAssignNode.id.endsWith('Sire')) {
          updatedParent.sireId = newRabbitId;
        } else {
          updatedParent.damId = newRabbitId;
        }
        onUpdateRabbit(updatedParent);
      }
    }

    onUpdateRabbit(updatedRabbit);

    // Reset state
    setActiveAssignNode(null);
    setShowCustomForm(false);
    setCustomForm({
      name: '',
      tattooNumber: '',
      breed: activeRabbit.breed || '',
      variety: '',
      dob: '',
      weightOz: '',
      registrationNumber: '',
      gcNumber: '',
      breederName: '',
      breederPrefix: ''
    });
  };

  const handleRemoveNode = (nodeId) => {
    if (!activeRabbit) return;

    let updatedRabbit = { ...activeRabbit };
    if (nodeId === 'sire') {
      updatedRabbit.sireId = '';
    } else if (nodeId === 'dam') {
      updatedRabbit.damId = '';
    } else {
      let parentRabbit = null;
      if (nodeId.startsWith('sire')) {
        parentRabbit = pedigreeNodes.sire;
      } else {
        parentRabbit = pedigreeNodes.dam;
      }

      if (parentRabbit) {
        const updatedParent = { ...parentRabbit };
        if (nodeId.endsWith('Sire')) {
          updatedParent.sireId = '';
        } else {
          updatedParent.damId = '';
        }
        onUpdateRabbit(updatedParent);
      }
    }
    onUpdateRabbit(updatedRabbit);
  };

  // Search results for assigning nodes
  const availableOptions = useMemo(() => {
    if (!activeAssignNode) return [];
    
    const isMale = ['sire', 'sireSire', 'damSire'].includes(activeAssignNode.id);
    
    return rabbits.filter(r => {
      // Don't list the active rabbit itself to prevent loops
      if (r.id === selectedRabbitId) return false;
      // Filter by sex
      if (isMale && r.sex !== 'buck') return false;
      if (!isMale && r.sex !== 'doe') return false;
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return r.name.toLowerCase().includes(query) || 
               (r.tattooNumber && r.tattooNumber.toLowerCase().includes(query)) ||
               r.breed.toLowerCase().includes(query);
      }
      return true;
    });
  }, [activeAssignNode, rabbits, selectedRabbitId, searchQuery]);

  // ARBA Standards audit checking
  const arbaAudit = useMemo(() => {
    if (!activeRabbit) return null;
    const std = BREED_STANDARDS[activeRabbit.breed];
    if (!std) return null;

    const isSenior = activeRabbit.dob ? (new Date() - new Date(activeRabbit.dob)) / (1000 * 60 * 60 * 24 * 30.4) >= 6 : true;
    let maxWeight = 0;
    let minWeight = 0;

    if (isSenior) {
      maxWeight = activeRabbit.sex === 'buck' ? std.buckSrMax : std.doeSrMax;
      minWeight = activeRabbit.sex === 'buck' ? std.buckSrMin : std.doeSrMin;
    } else {
      maxWeight = activeRabbit.sex === 'buck' ? std.buckJrMax : std.doeJrMax;
      minWeight = activeRabbit.sex === 'buck' ? std.buckJrMin : std.doeJrMin;
    }
    
    const currentWeight = activeRabbit.weightOz || 0;
    const isOver = currentWeight > maxWeight;
    const isUnder = currentWeight < minWeight;

    return {
      breed: activeRabbit.breed,
      minWeightLbs: (minWeight / 16).toFixed(2),
      maxWeightLbs: (maxWeight / 16).toFixed(2),
      currentWeightLbs: (currentWeight / 16).toFixed(2),
      isCompliant: !isOver && !isUnder,
      issue: isOver ? 'Overweight' : isUnder ? 'Underweight' : 'Compliant'
    };
  }, [activeRabbit]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header and selector */}
      <div className="glass-container p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">📜 3-Generation Interactive Pedigree</h2>
          <p className="text-xs text-slate-300">Design lineages, verify ARBA weight limits, and append authorization signatures.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400">Select Rabbit:</label>
          <select
            value={selectedRabbitId}
            onChange={(e) => setSelectedRabbitId(e.target.value)}
            className="bg-slate-900/80 border border-white/10 text-white text-sm rounded-xl py-2 px-4 focus:border-indigo-500 font-semibold"
          >
            {rabbits.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.tattooNumber || 'No Tattoo'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeRabbit ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          {/* Visual 3-Gen Tree Layout (3 Cols) */}
          <div className="xl:col-span-3 flex flex-col gap-6">
            <div className="glass-container p-6 overflow-x-auto">
              {/* Tree Grid */}
              <div className="min-w-[800px] grid grid-cols-3 gap-6 relative">
                {/* Generation 1: Self */}
                <div className="flex flex-col justify-center items-center">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">Generation 1 (Selected)</h4>
                  <div className="w-full max-w-[240px] p-4 bg-slate-950/60 border-2 border-indigo-500/30 rounded-2xl relative shadow-md shadow-slate-950">
                    <div className="absolute top-2 right-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] px-2 py-0.5 rounded-full font-bold">
                      PROBAND
                    </div>
                    <h5 className="font-bold text-white text-sm truncate">{pedigreeNodes.self.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tattoo: {pedigreeNodes.self.tattooNumber || 'None'}</p>
                    <p className="text-[10px] text-indigo-300 font-semibold mt-1">{pedigreeNodes.self.breed}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">Weight: {pedigreeNodes.self.weightOz ? `${(pedigreeNodes.self.weightOz / 16).toFixed(2)} lbs` : 'N/A'}</p>
                  </div>
                </div>

                {/* Generation 2: Parents */}
                <div className="flex flex-col justify-around gap-12">
                  <div className="flex flex-col items-center">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2">Generation 2 (Parents)</h4>
                    {/* Sire */}
                    <div className="w-full max-w-[240px] p-4 bg-slate-900 border border-blue-500/20 rounded-2xl relative shadow-md">
                      <div className="absolute top-2 right-2 bg-blue-500/15 text-blue-400 text-[9px] px-2 py-0.5 rounded-full font-bold">SIRE (M)</div>
                      {pedigreeNodes.sire ? (
                        <div>
                          <h5 className="font-bold text-white text-sm truncate">{pedigreeNodes.sire.name}</h5>
                          <p className="text-[10px] text-slate-400">Tattoo: {pedigreeNodes.sire.tattooNumber || 'None'}</p>
                          <p className="text-[10px] text-slate-300 mt-1">Weight: {pedigreeNodes.sire.weightOz ? `${(pedigreeNodes.sire.weightOz / 16).toFixed(2)} lbs` : 'N/A'}</p>
                          <button
                            onClick={() => handleRemoveNode('sire')}
                            className="mt-3 text-[9px] font-bold text-red-400 hover:underline"
                          >
                            Unassign Parent
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveAssignNode({ id: 'sire', label: 'Sire (Father)' })}
                          className="w-full py-4 border border-dashed border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/5 transition-all text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Assign Sire
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dam */}
                  <div className="flex flex-col items-center">
                    <div className="w-full max-w-[240px] p-4 bg-slate-900 border border-pink-500/20 rounded-2xl relative shadow-md">
                      <div className="absolute top-2 right-2 bg-pink-500/15 text-pink-400 text-[9px] px-2 py-0.5 rounded-full font-bold">DAM (F)</div>
                      {pedigreeNodes.dam ? (
                        <div>
                          <h5 className="font-bold text-white text-sm truncate">{pedigreeNodes.dam.name}</h5>
                          <p className="text-[10px] text-slate-400">Tattoo: {pedigreeNodes.dam.tattooNumber || 'None'}</p>
                          <p className="text-[10px] text-slate-300 mt-1">Weight: {pedigreeNodes.dam.weightOz ? `${(pedigreeNodes.dam.weightOz / 16).toFixed(2)} lbs` : 'N/A'}</p>
                          <button
                            onClick={() => handleRemoveNode('dam')}
                            className="mt-3 text-[9px] font-bold text-red-400 hover:underline"
                          >
                            Unassign Parent
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveAssignNode({ id: 'dam', label: 'Dam (Mother)' })}
                          className="w-full py-4 border border-dashed border-pink-500/20 text-pink-400 rounded-xl hover:bg-pink-500/5 transition-all text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Assign Dam
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Generation 3: Grandparents */}
                <div className="flex flex-col justify-between gap-6 py-2">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 text-center col-span-3">Generation 3 (Grandparents)</h4>
                  
                  {/* Sire's Sire */}
                  <div className="w-full max-w-[240px] p-3 bg-slate-900/60 border border-white/5 rounded-xl shadow-md">
                    <p className="text-[8px] font-extrabold uppercase text-blue-400">Sire's Sire</p>
                    {pedigreeNodes.sireSire ? (
                      <div>
                        <h5 className="font-bold text-white text-xs truncate">{pedigreeNodes.sireSire.name}</h5>
                        <p className="text-[9px] text-slate-400">Tattoo: {pedigreeNodes.sireSire.tattooNumber || 'N/A'}</p>
                        <button onClick={() => handleRemoveNode('sireSire')} className="text-[8px] text-red-400 hover:underline mt-1 font-bold">Unassign</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveAssignNode({ id: 'sireSire', label: "Sire's Sire" })}
                        className="w-full py-2 border border-dashed border-white/10 text-slate-400 text-[10px] font-bold rounded-lg mt-1 hover:bg-white/5"
                      >
                        + Assign
                      </button>
                    )}
                  </div>

                  {/* Sire's Dam */}
                  <div className="w-full max-w-[240px] p-3 bg-slate-900/60 border border-white/5 rounded-xl shadow-md">
                    <p className="text-[8px] font-extrabold uppercase text-pink-400">Sire's Dam</p>
                    {pedigreeNodes.sireDam ? (
                      <div>
                        <h5 className="font-bold text-white text-xs truncate">{pedigreeNodes.sireDam.name}</h5>
                        <p className="text-[9px] text-slate-400">Tattoo: {pedigreeNodes.sireDam.tattooNumber || 'N/A'}</p>
                        <button onClick={() => handleRemoveNode('sireDam')} className="text-[8px] text-red-400 hover:underline mt-1 font-bold">Unassign</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveAssignNode({ id: 'sireDam', label: "Sire's Dam" })}
                        className="w-full py-2 border border-dashed border-white/10 text-slate-400 text-[10px] font-bold rounded-lg mt-1 hover:bg-white/5"
                      >
                        + Assign
                      </button>
                    )}
                  </div>

                  {/* Dam's Sire */}
                  <div className="w-full max-w-[240px] p-3 bg-slate-900/60 border border-white/5 rounded-xl shadow-md">
                    <p className="text-[8px] font-extrabold uppercase text-blue-400">Dam's Sire</p>
                    {pedigreeNodes.damSire ? (
                      <div>
                        <h5 className="font-bold text-white text-xs truncate">{pedigreeNodes.damSire.name}</h5>
                        <p className="text-[9px] text-slate-400">Tattoo: {pedigreeNodes.damSire.tattooNumber || 'N/A'}</p>
                        <button onClick={() => handleRemoveNode('damSire')} className="text-[8px] text-red-400 hover:underline mt-1 font-bold">Unassign</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveAssignNode({ id: 'damSire', label: "Dam's Sire" })}
                        className="w-full py-2 border border-dashed border-white/10 text-slate-400 text-[10px] font-bold rounded-lg mt-1 hover:bg-white/5"
                      >
                        + Assign
                      </button>
                    )}
                  </div>

                  {/* Dam's Dam */}
                  <div className="w-full max-w-[240px] p-3 bg-slate-900/60 border border-white/5 rounded-xl shadow-md">
                    <p className="text-[8px] font-extrabold uppercase text-pink-400">Dam's Dam</p>
                    {pedigreeNodes.damDam ? (
                      <div>
                        <h5 className="font-bold text-white text-xs truncate">{pedigreeNodes.damDam.name}</h5>
                        <p className="text-[9px] text-slate-400">Tattoo: {pedigreeNodes.damDam.tattooNumber || 'N/A'}</p>
                        <button onClick={() => handleRemoveNode('damDam')} className="text-[8px] text-red-400 hover:underline mt-1 font-bold">Unassign</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveAssignNode({ id: 'damDam', label: "Dam's Dam" })}
                        className="w-full py-2 border border-dashed border-white/10 text-slate-400 text-[10px] font-bold rounded-lg mt-1 hover:bg-white/5"
                      >
                        + Assign
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* Audit panel */}
            {arbaAudit && (
              <div className={`glass-container p-5 border flex flex-col sm:flex-row justify-between items-center gap-4 ${arbaAudit.isCompliant ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-amber-500/20 bg-amber-950/10'}`}>
                <div className="flex items-center gap-3">
                  {arbaAudit.isCompliant ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                      <AlertTriangle className="w-5 h-5 animate-bounce" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">ARBA Show Weight Standard Audit</h4>
                    <p className="text-[11px] text-slate-300">
                      {arbaAudit.breed} standards mandate: <strong className="text-white">{arbaAudit.minWeightLbs} - {arbaAudit.maxWeightLbs} lbs</strong>.
                    </p>
                  </div>
                </div>

                <div className="text-right sm:text-right flex flex-col items-center sm:items-end">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${arbaAudit.isCompliant ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    Current: {arbaAudit.currentWeightLbs} lbs ({arbaAudit.issue})
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1">Checked against official ARBA class metrics</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Control Panel & Signature Pad (1 Col) */}
          <div className="flex flex-col gap-6">
            {/* Context Assignment Drawer */}
            {activeAssignNode ? (
              <div className="glass-container p-5 border border-indigo-500/30 flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-400" /> Assign {activeAssignNode.label}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Select a compatible rabbit from your herd.</p>
                </div>

{!showCustomForm ? (
                  <>
                    <input
                      type="text"
                      placeholder="Search name, tattoo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-xl py-2 px-3 focus:border-indigo-500"
                    />

                    <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                      {availableOptions.length === 0 ? (
                        <span className="text-[10px] text-slate-500 text-center py-4">No matching rabbits found.</span>
                      ) : (
                        availableOptions.map(r => (
                          <button
                            key={r.id}
                            onClick={() => handleAssignRabbit(r)}
                            className="w-full text-left p-2.5 rounded-xl bg-slate-900 border border-white/5 hover:border-indigo-500 hover:bg-slate-800 transition-all flex items-center justify-between text-[11px]"
                          >
                            <div>
                              <p className="font-bold text-white">{r.name}</p>
                              <p className="text-[9px] text-slate-400">Tattoo: {r.tattooNumber || 'N/A'} • {r.breed}</p>
                            </div>
                            <span className="text-[9px] font-bold text-indigo-400 uppercase">{r.sex}</span>
                          </button>
                        ))
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => { setShowCustomForm(true); }}
                      className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 font-bold rounded-xl text-[10px] cursor-pointer"
                    >
                      ➕ Add Custom Pedigree Info (Not in Barn)
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleCreatePedigreeOnly} className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-bold">Name *</label>
                        <input
                          type="text"
                          required
                          value={customForm.name}
                          onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-bold">Tattoo</label>
                        <input
                          type="text"
                          value={customForm.tattooNumber}
                          onChange={(e) => setCustomForm({ ...customForm, tattooNumber: e.target.value })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-bold">Breed</label>
                        <input
                          type="text"
                          value={customForm.breed}
                          onChange={(e) => setCustomForm({ ...customForm, breed: e.target.value })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-bold">Variety</label>
                        <input
                          type="text"
                          value={customForm.variety}
                          onChange={(e) => setCustomForm({ ...customForm, variety: e.target.value })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-bold">Birthdate</label>
                        <input
                          type="date"
                          value={customForm.dob}
                          onChange={(e) => setCustomForm({ ...customForm, dob: e.target.value })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-bold">Weight (oz)</label>
                        <input
                          type="number"
                          value={customForm.weightOz}
                          onChange={(e) => setCustomForm({ ...customForm, weightOz: e.target.value })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-bold">Registration #</label>
                        <input
                          type="text"
                          value={customForm.registrationNumber}
                          onChange={(e) => setCustomForm({ ...customForm, registrationNumber: e.target.value })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-bold">GC Certificate #</label>
                        <input
                          type="text"
                          value={customForm.gcNumber}
                          onChange={(e) => setCustomForm({ ...customForm, gcNumber: e.target.value })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-bold">Breeder Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Jane Doe"
                          value={customForm.breederName}
                          onChange={(e) => setCustomForm({ ...customForm, breederName: e.target.value })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-bold">Breeder Prefix</label>
                        <input
                          type="text"
                          placeholder="e.g. CLB"
                          value={customForm.breederPrefix}
                          onChange={(e) => setCustomForm({ ...customForm, breederPrefix: e.target.value })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowCustomForm(false)}
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-[9px] cursor-pointer"
                      >
                        Back to Search
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[9px] cursor-pointer"
                      >
                        Save Ancestor
                      </button>
                    </div>
                  </form>
                )}

                <button
                  onClick={() => { setActiveAssignNode(null); setSearchQuery(''); }}
                  className="w-full py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-[10px]"
                >
                  Cancel Selection
                </button>
              </div>
            ) : null}

            {/* Breeder Signature Certificate Pad */}
            <div className="glass-container p-5 flex flex-col gap-4 border border-indigo-500/20">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" /> Registrar Signature
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Draw signature to authorize generated pedigrees.</p>
              </div>

              <div className="relative border border-white/15 bg-white rounded-2xl overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={240}
                  height={120}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full block bg-white cursor-crosshair"
                />
                
                {signatureDataUrl && !isDrawing && (
                  <div className="absolute top-2 right-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[8px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" /> SAVED
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 text-[10px]">
                <button
                  onClick={clearSignature}
                  className="flex-1 py-2 bg-slate-900 border border-white/10 hover:border-red-500/30 text-red-400 hover:bg-red-500/5 font-bold rounded-xl flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Pad
                </button>
              </div>
            </div>

            {/* Info badge */}
            <div className="glass-container p-4 text-[10px] text-slate-400 leading-relaxed border border-white/5 flex gap-2">
              <User className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>
                To print or export the PDF pedigree card, make sure both parents (Generation 2) are filled. The authorized signature is embedded automatically.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-container p-12 text-center text-slate-400">
          No rabbits available. Please add a rabbit inside the Lineage tab first!
        </div>
      )}
    </div>
  );
}
