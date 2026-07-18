import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Share2, FileText, Check, RotateCcw, ShieldCheck, User, Plus, Search, AlertTriangle, X, Wand2 } from 'lucide-react';
import { uuidv7 } from '../../db/uuid';
import { BREED_STANDARDS, CAVY_BREED_STANDARDS } from '../../db/breedStandards';
import { BREED_COLORS } from '../../db/breedColors';
import { useSubscription } from '../../hooks/useSubscription';

const parsePedigreeText = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const result = {}; // key: role key -> values

  const roles = [
    { key: 'proband', patterns: [/^(?:name|proband|current rabbit):\s*(.+)$/i] },
    { key: 'patPatSire', patterns: [/^(?:sire['’]s sire['’]s sire|sire\s+sire\s+sire)\b/i] },
    { key: 'patPatDam', patterns: [/^(?:sire['’]s sire['’]s dam|sire\s+sire\s+dam)\b/i] },
    { key: 'patMatSire', patterns: [/^(?:sire['’]s dam['’]s sire|sire\s+dam\s+sire)\b/i] },
    { key: 'patMatDam', patterns: [/^(?:sire['’]s dam['’]s dam|sire\s+dam\s+dam)\b/i] },
    { key: 'matPatSire', patterns: [/^(?:dam['’]s sire['’]s sire|dam\s+sire\s+sire)\b/i] },
    { key: 'matPatDam', patterns: [/^(?:dam['’]s sire['’]s dam|dam\s+sire\s+dam)\b/i] },
    { key: 'matMatSire', patterns: [/^(?:dam['’]s dam['’]s sire|dam\s+dam\s+sire)\b/i] },
    { key: 'matMatDam', patterns: [/^(?:dam['’]s dam['’]s dam|dam\s+dam\s+dam)\b/i] },
    { key: 'patSire', patterns: [/^(?:sire['’]s sire|father['’]s father|paternal grand-sire)\b/i, /^sire\s+sire\b/i] },
    { key: 'patDam', patterns: [/^(?:sire['’]s dam|father['’]s mother|paternal grand-dam)\b/i, /^sire\s+dam\b/i] },
    { key: 'matSire', patterns: [/^(?:dam['’]s sire|mother['’]s father|maternal grand-sire)\b/i, /^dam\s+sire\b/i] },
    { key: 'matDam', patterns: [/^(?:dam['’]s dam|mother['’]s mother|maternal grand-dam)\b/i, /^dam\s+dam\b/i] },
    { key: 'sire', patterns: [/^(?:sire|father)\b/i] },
    { key: 'dam', patterns: [/^(?:dam|mother)\b/i] }
  ];

  let currentRole = null;
  
  lines.forEach(line => {
    let foundRole = null;
    for (const r of roles) {
      if (r.key === 'proband') continue;
      for (const p of r.patterns) {
        if (p.test(line)) {
          foundRole = r.key;
          break;
        }
      }
      if (foundRole) break;
    }

    if (foundRole) {
      currentRole = foundRole;
      result[currentRole] = { name: '', tattooNumber: '', weightOz: 160, variety: '', dob: '', registrationNumber: '', gcNumber: '', legsCount: 0 };
      
      let cleanedLine = line;
      const matchingRole = roles.find(r => r.key === foundRole);
      if (matchingRole) {
        matchingRole.patterns.forEach(p => {
          cleanedLine = cleanedLine.replace(p, '');
        });
      }
      cleanedLine = cleanedLine.replace(/^[:\s-]+/, '').trim();
      if (cleanedLine) {
        result[currentRole].name = cleanedLine;
      }
      return;
    }

    if (!currentRole) {
      currentRole = 'proband';
      result[currentRole] = { name: '', tattooNumber: '', weightOz: 160, variety: '', dob: '', registrationNumber: '', gcNumber: '', legsCount: 0 };
    }

    const parseAttr = (pattern) => {
      const match = line.match(pattern);
      return match ? match[1].trim() : null;
    };

    const name = parseAttr(/^(?:name|proband|current rabbit)[\s.:-]+(.+)$/i);
    if (name) result[currentRole].name = name;

    const tat = parseAttr(/^(?:ear\s*no|ear|tattoo|tat)[\s.:-]+(.+)$/i);
    if (tat) result[currentRole].tattooNumber = tat;

    const wt = parseAttr(/^(?:wt|weight)[\s.:-]+([0-9.]+)\s*(?:lbs|lb|oz)?/i);
    if (wt) {
      const numericWt = parseFloat(wt);
      result[currentRole].weightOz = Math.round(numericWt * 16);
    }

    const col = parseAttr(/^(?:color|var|variety|colour)[\s.:-]+(.+)$/i);
    if (col) result[currentRole].variety = col;

    const dob = parseAttr(/^(?:dob|birth|birthdate|date of birth)[\s.:-]+(.+)$/i);
    if (dob) result[currentRole].dob = dob;

    const reg = parseAttr(/^(?:reg\s*#|reg\s*no|reg|registration)[\s.:-]+(.+)$/i);
    if (reg) result[currentRole].registrationNumber = reg;

    const gc = parseAttr(/^(?:gc\s*#|gc\s*no|gc|grand champion)[\s.:-]+(.+)$/i);
    if (gc) result[currentRole].gcNumber = gc;

    const legs = parseAttr(/^(?:legs|winnings)[\s.:-]+(.+)$/i);
    if (legs) {
      const numMatch = legs.match(/^(\d+)/);
      if (numMatch) {
        result[currentRole].legsCount = parseInt(numMatch[1], 10);
      } else {
        const awards = legs.split(',').map(a => a.trim()).filter(a => a.length > 0);
        result[currentRole].legsCount = awards.length;
      }
    }
  });

  return result;
};

const renderWinningsBadge = (node, sizeClass = "text-[8px] px-1 py-0.2 rounded") => {
  if (!node) return null;
  const bob = node.winningsBOB || 0;
  const bov = node.winningsBOV || 0;
  const bos = node.winningsBOS || 0;
  const bosv = node.winningsBOSV || 0;
  const bis = node.winningsBIS || 0;
  const other = node.winningsOther || 0;
  const totalWins = bob + bov + bos + bosv + bis + other;
  const displayCount = totalWins > 0 ? totalWins : (node.legs?.length || 0);
  
  if (displayCount === 0) return null;
  
  const parts = [];
  if (bob > 0) parts.push(`${bob} BOB`);
  if (bov > 0) parts.push(`${bov} BOV`);
  if (bis > 0) parts.push(`${bis} BIS`);
  const winStr = parts.length > 0 ? parts.join('/') : `${displayCount} Legs`;

  return (
    <span className={`bg-amber-500/20 text-amber-350 border border-amber-500/30 font-black mt-0.5 inline-block ${sizeClass}`} title={`${displayCount} Legs total`}>
      🏆 {winStr}
    </span>
  );
};

export default function PedigreeBuilder({ rabbits = [], onUpdateRabbit, onPrintPedigree, onEditNode, weightUnit = 'oz', onOpenRegistrarPrep, selectedRabbitId: propSelectedRabbitId }) {
  const formatWeight = (oz) => {
    if (!oz) return 'N/A';
    return weightUnit === 'lbs' 
      ? `${(oz / 16).toFixed(2)} lbs` 
      : `${oz} oz`;
  };

  const { isFeatureAllowed } = useSubscription();
  const [selectedRabbitId, setSelectedRabbitId] = useState(propSelectedRabbitId || rabbits[0]?.id || '');
  
  React.useEffect(() => {
    if (propSelectedRabbitId) {
      setSelectedRabbitId(propSelectedRabbitId);
    }
  }, [propSelectedRabbitId]);
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
    breederPrefix: '',
    legsCount: '',
    colorCarrier: '',
    winningsBOB: 0,
    winningsBOV: 0,
    winningsBOS: 0,
    winningsBOSV: 0,
    winningsBIS: 0,
    winningsOther: 0,
    showClass: 'Auto'
  });

  const [showImportWizard, setShowImportWizard] = useState(false);
  const [importText, setImportText] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);

  // Canvas Signature Pad references
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [generations, setGenerations] = useState(3);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [dragOverNodeId, setDragOverNodeId] = useState(null);

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
    const isTouch = e.touches && e.touches[0];
    const x = (isTouch ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (isTouch ? e.touches[0].clientY : e.clientY) - rect.top;

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
    const isTouch = e.touches && e.touches[0];
    const x = (isTouch ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (isTouch ? e.touches[0].clientY : e.clientY) - rect.top;

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

  // 3-Generation Ancestor Pedigree Node Resolver (1 Proband + 14 Ancestors)
  const pedigreeNodes = useMemo(() => {
    if (!activeRabbit) return {};

    const findRabbit = (id) => rabbits.find(r => r.id === id) || null;

    // Parents (Gen 1 Ancestors)
    const sire = activeRabbit.sireId ? findRabbit(activeRabbit.sireId) : null;
    const dam = activeRabbit.damId ? findRabbit(activeRabbit.damId) : null;

    // Grandparents (Gen 2 Ancestors)
    const sireSire = sire?.sireId ? findRabbit(sire.sireId) : null;
    const sireDam = sire?.damId ? findRabbit(sire.damId) : null;
    const damSire = dam?.sireId ? findRabbit(dam.sireId) : null;
    const damDam = dam?.damId ? findRabbit(dam.damId) : null;

    // Great-Grandparents (Gen 3 Ancestors)
    const sireSireSire = sireSire?.sireId ? findRabbit(sireSire.sireId) : null;
    const sireSireDam = sireSire?.damId ? findRabbit(sireSire.damId) : null;
    const sireDamSire = sireDam?.sireId ? findRabbit(sireDam.sireId) : null;
    const sireDamDam = sireDam?.damId ? findRabbit(sireDam.damId) : null;
    const damSireSire = damSire?.sireId ? findRabbit(damSire.sireId) : null;
    const damSireDam = damSire?.damId ? findRabbit(damSire.damId) : null;
    const damDamSire = damDam?.sireId ? findRabbit(damDam.sireId) : null;
    const damDamDam = damDam?.damId ? findRabbit(damDam.damId) : null;

    return {
      self: activeRabbit,
      sire,
      dam,
      sireSire,
      sireDam,
      damSire,
      damDam,
      sireSireSire,
      sireSireDam,
      sireDamSire,
      sireDamDam,
      damSireSire,
      damSireDam,
      damDamSire,
      damDamDam
    };
  }, [activeRabbit, rabbits]);

  // Validation Engine against ARBA and logical rules
  const validateAssignment = (nodeKey, rabbitToAssign) => {
    if (!activeRabbit || !rabbitToAssign) return { isValid: true };

    // 1. Sex Validation (ends with 'sire' is male, else ends with 'dam' is female)
    const isMaleNode = nodeKey.toLowerCase().endsWith('sire');
    const isFemaleNode = nodeKey.toLowerCase().endsWith('dam');

    if (isMaleNode && rabbitToAssign.sex !== 'buck') {
      return { isValid: false, message: `Cannot assign ${rabbitToAssign.name}: This pedigree node requires a male (buck).` };
    }
    if (isFemaleNode && rabbitToAssign.sex !== 'doe') {
      return { isValid: false, message: `Cannot assign ${rabbitToAssign.name}: This pedigree node requires a female (doe).` };
    }

    // 2. Age/DOB Logic Validation
    let childNode = activeRabbit;
    if (nodeKey !== 'sire' && nodeKey !== 'dam') {
      const parentNodeKey = nodeKey.endsWith('Sire') ? nodeKey.slice(0, -4) : nodeKey.slice(0, -3);
      childNode = pedigreeNodes[parentNodeKey];
    }

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
  const handleAssignRabbitToNode = (nodeId, nodeLabel, rabbit) => {
    if (!activeRabbit || !rabbit) return;

    const validation = validateAssignment(nodeId, rabbit);
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
    if (nodeId === 'sire') {
      updatedRabbit.sireId = rabbit.id;
    } else if (nodeId === 'dam') {
      updatedRabbit.damId = rabbit.id;
    } else {
      // Indirect ancestors (slice nodeKey to find immediate child node)
      const parentNodeKey = nodeId.endsWith('Sire') ? nodeId.slice(0, -4) : nodeId.slice(0, -3);
      const parentRabbit = pedigreeNodes[parentNodeKey];

      if (parentRabbit) {
        const updatedParent = { ...parentRabbit };
        if (nodeId.endsWith('Sire')) {
          updatedParent.sireId = rabbit.id;
        } else {
          updatedParent.damId = rabbit.id;
        }
        onUpdateRabbit(updatedParent);
      } else {
        const friendlyParent = nodeLabel.replace(/'s\s+(Sire|Dam)$/, '').replace(/s\s+P\.\s+Grand-Sire/g, "s Sire");
        alert(`Please assign the direct parent (${friendlyParent}) first before assigning this ancestor.`);
        return;
      }
    }

    onUpdateRabbit(updatedRabbit);
  };

  const handleAssignRabbit = (rabbit) => {
    if (!activeAssignNode) return;
    handleAssignRabbitToNode(activeAssignNode.id, activeAssignNode.label, rabbit);
    setActiveAssignNode(null);
    setSearchQuery('');
  };  const handleCreatePedigreeOnly = (e) => {
    e.preventDefault();
    if (!activeRabbit || !activeAssignNode) return;
    
    const newRabbitId = uuidv7();

    const generatedLegs = [];
    const addLegs = (count, awardName) => {
      for (let i = 0; i < count; i++) {
        generatedLegs.push({
          id: `leg-${awardName}-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          award: awardName,
          date: new Date().toISOString().split('T')[0],
          showName: 'Show Record',
          judge: 'Audited',
          classSize: 5
        });
      }
    };
    addLegs(parseInt(customForm.winningsBOB || '0', 10), 'Best of Breed');
    addLegs(parseInt(customForm.winningsBOV || '0', 10), 'Best of Variety');
    addLegs(parseInt(customForm.winningsBOS || '0', 10), 'Best Opposite Sex');
    addLegs(parseInt(customForm.winningsBOSV || '0', 10), 'Best Opposite Sex of Variety');
    addLegs(parseInt(customForm.winningsBIS || '0', 10), 'Best In Show');
    addLegs(parseInt(customForm.winningsOther || '0', 10), 'Grand Champion Leg');

    if (generatedLegs.length === 0 && customForm.legsCount) {
      addLegs(parseInt(customForm.legsCount || '0', 10), 'Grand Champion Leg');
    }

    const newRabbit = {
      id: newRabbitId,
      breederId: activeRabbit.breederId,
      name: customForm.name || 'Unnamed Ancestor',
      tattooNumber: customForm.tattooNumber || '',
      breed: customForm.breed || activeRabbit.breed,
      variety: customForm.variety || '',
      sex: activeAssignNode.id.toLowerCase().endsWith('sire') ? 'buck' : 'doe',
      dob: customForm.dob || '',
      weightOz: customForm.weightOz ? (weightUnit === 'lbs' ? Math.round(parseFloat(customForm.weightOz) * 16) : parseFloat(customForm.weightOz)) : '',
      registrationNumber: customForm.registrationNumber || '',
      gcNumber: customForm.gcNumber || '',
      breederName: customForm.breederName || '',
      breederPrefix: customForm.breederPrefix || '',
      status: 'pedigree_only',
      photos: [],
      legs: generatedLegs,
      colorCarrier: customForm.colorCarrier || '',
      winningsBOB: Number(customForm.winningsBOB) || 0,
      winningsBOV: Number(customForm.winningsBOV) || 0,
      winningsBOS: Number(customForm.winningsBOS) || 0,
      winningsBOSV: Number(customForm.winningsBOSV) || 0,
      winningsBIS: Number(customForm.winningsBIS) || 0,
      winningsOther: Number(customForm.winningsOther) || 0,
      showClass: customForm.showClass || 'Auto'
    };

    onUpdateRabbit(newRabbit);

    const updatedRabbit = { ...activeRabbit };
    if (activeAssignNode.id === 'sire') {
      updatedRabbit.sireId = newRabbitId;
    } else if (activeAssignNode.id === 'dam') {
      updatedRabbit.damId = newRabbitId;
    } else {
      const parentNodeKey = activeAssignNode.id.endsWith('Sire') ? activeAssignNode.id.slice(0, -4) : activeAssignNode.id.slice(0, -3);
      const parentRabbit = pedigreeNodes[parentNodeKey];

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
      breederPrefix: '',
      legsCount: '',
      colorCarrier: '',
      winningsBOB: 0,
      winningsBOV: 0,
      winningsBOS: 0,
      winningsBOSV: 0,
      winningsBIS: 0,
      winningsOther: 0,
      showClass: 'Auto'
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
      const parentNodeKey = nodeId.endsWith('Sire') ? nodeId.slice(0, -4) : nodeId.slice(0, -3);
      const parentRabbit = pedigreeNodes[parentNodeKey];

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

  const getRoleLabel = (roleId) => {
    switch(roleId) {
      case 'proband': return 'Current Rabbit';
      case 'sire': return 'Sire (Father)';
      case 'dam': return 'Dam (Mother)';
      case 'patSire': return "Sire's Sire";
      case 'patDam': return "Sire's Dam";
      case 'matSire': return "Dam's Sire";
      case 'matDam': return "Dam's Dam";
      case 'patPatSire': return "Sire's Sire's Sire";
      case 'patPatDam': return "Sire's Sire's Dam";
      case 'patMatSire': return "Sire's Dam's Sire";
      case 'patMatDam': return "Sire's Dam's Dam";
      case 'matPatSire': return "Dam's Sire's Sire";
      case 'matPatDam': return "Dam's Sire's Dam";
      case 'matMatSire': return "Dam's Dam's Sire";
      case 'matMatDam': return "Dam's Dam's Dam";
      default: return roleId;
    }
  };

  const handleParsePedigree = () => {
    if (!importText.trim()) {
      alert("Please paste pedigree details text first.");
      return;
    }
    const parsed = parsePedigreeText(importText);
    setParsedPreview(parsed);
  };

  const handleApplyParsedPedigree = () => {
    if (!parsedPreview || !activeRabbit) return;

    const roleKeys = [
      'sire', 'dam',
      'patSire', 'patDam', 'matSire', 'matDam',
      'patPatSire', 'patPatDam', 'patMatSire', 'patMatDam',
      'matPatSire', 'matPatDam', 'matMatSire', 'matMatDam'
    ];

    const ids = {};
    roleKeys.forEach(k => {
      if (parsedPreview[k]) {
        ids[k] = uuidv7();
      }
    });

    const createdAncestors = [];

    const buildAncestor = (key, gender, sireId = '', damId = '') => {
      const data = parsedPreview[key];
      if (!data) return null;

      return {
        id: ids[key],
        breederId: activeRabbit.breederId,
        name: data.name || `${getRoleLabel(key)}`,
        tattooNumber: data.tattooNumber || '',
        breed: activeRabbit.breed,
        variety: data.variety || 'Utility',
        sex: gender,
        dob: data.dob || '',
        weightOz: data.weightOz || 160,
        registrationNumber: data.registrationNumber || '',
        gcNumber: data.gcNumber || '',
        status: 'pedigree_only',
        sireId: sireId,
        damId: damId,
        photos: [],
        legs: data.legsCount ? Array.from({ length: data.legsCount }, (_, idx) => ({
          id: `leg-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          award: 'Best of Variety',
          showName: 'Imported Show',
          date: '',
          judge: 'Parsed Import',
          classSize: 0
        })) : []
      };
    };

    const patPatSire = buildAncestor('patPatSire', 'buck');
    const patPatDam = buildAncestor('patPatDam', 'doe');
    const patMatSire = buildAncestor('patMatSire', 'buck');
    const patMatDam = buildAncestor('patMatDam', 'doe');
    const matPatSire = buildAncestor('matPatSire', 'buck');
    const matPatDam = buildAncestor('matPatDam', 'doe');
    const matMatSire = buildAncestor('matMatSire', 'buck');
    const matMatDam = buildAncestor('matMatDam', 'doe');

    [patPatSire, patPatDam, patMatSire, patMatDam, matPatSire, matPatDam, matMatSire, matMatDam].forEach(obj => {
      if (obj) createdAncestors.push(obj);
    });

    const patSire = buildAncestor('patSire', 'buck', ids.patPatSire || '', ids.patPatDam || '');
    const patDam = buildAncestor('patDam', 'doe', ids.patMatSire || '', ids.patMatDam || '');
    const matSire = buildAncestor('matSire', 'buck', ids.matPatSire || '', ids.matPatDam || '');
    const matDam = buildAncestor('matDam', 'doe', ids.matMatSire || '', ids.matMatDam || '');

    [patSire, patDam, matSire, matDam].forEach(obj => {
      if (obj) createdAncestors.push(obj);
    });

    const sire = buildAncestor('sire', 'buck', ids.patSire || '', ids.patDam || '');
    const dam = buildAncestor('dam', 'doe', ids.matSire || '', ids.matDam || '');

    [sire, dam].forEach(obj => {
      if (obj) createdAncestors.push(obj);
    });

    const allUpdates = [...createdAncestors];

    const updatedProband = { ...activeRabbit };
    if (ids.sire) updatedProband.sireId = ids.sire;
    if (ids.dam) updatedProband.damId = ids.dam;

    const probandData = parsedPreview['proband'];
    if (probandData) {
      if (probandData.name) updatedProband.name = probandData.name;
      if (probandData.tattooNumber) updatedProband.tattooNumber = probandData.tattooNumber;
      if (probandData.weightOz) updatedProband.weightOz = probandData.weightOz;
      if (probandData.variety) updatedProband.variety = probandData.variety;
      if (probandData.dob) updatedProband.dob = probandData.dob;
    }

    allUpdates.push(updatedProband);
    onUpdateRabbit(allUpdates);

    setShowImportWizard(false);
    setImportText('');
    setParsedPreview(null);
  };

  const draggableRabbits = useMemo(() => {
    // Exclude the active rabbit itself
    const filtered = rabbits.filter(r => r.id !== selectedRabbitId && r.status !== 'pedigree_only');
    if (!sidebarSearch) return filtered.slice(0, 15);
    const q = sidebarSearch.toLowerCase();
    return filtered.filter(r => 
      r.name.toLowerCase().includes(q) || 
      (r.tattooNumber && r.tattooNumber.toLowerCase().includes(q)) ||
      r.breed.toLowerCase().includes(q)
    );
  }, [rabbits, selectedRabbitId, sidebarSearch]);

  const handleDropOnNode = (e, nodeId, nodeLabel) => {
    e.preventDefault();
    setDragOverNodeId(null);
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (dataStr) {
        const rabbit = JSON.parse(dataStr);
        if (rabbit && rabbit.id) {
          handleAssignRabbitToNode(nodeId, nodeLabel, rabbit);
        }
      }
    } catch (err) {
      console.error("Drop event error:", err);
    }
  };

  // Search results for assigning nodes
  const availableOptions = useMemo(() => {
    if (!activeAssignNode) return [];
    
    const isMale = activeAssignNode.id.toLowerCase().endsWith('sire');
    
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
    const rabbitSpecies = activeRabbit?.species || 'rabbit';
    const std = rabbitSpecies === 'cavy' ? CAVY_BREED_STANDARDS[activeRabbit.breed] : BREED_STANDARDS[activeRabbit.breed];
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

    const formatAuditVal = (oz) => {
      return weightUnit === 'lbs' 
        ? `${(oz / 16).toFixed(2)} lbs` 
        : `${oz} oz`;
    };

    return {
      breed: activeRabbit.breed,
      minWeightDisplay: formatAuditVal(minWeight),
      maxWeightDisplay: formatAuditVal(maxWeight),
      currentWeightDisplay: formatAuditVal(currentWeight),
      isCompliant: !isOver && !isUnder,
      issue: isOver ? 'Overweight' : isUnder ? 'Underweight' : 'Compliant'
    };
  }, [activeRabbit, weightUnit]);
  const nameSuggestions = useMemo(() => {
    if (!customForm.name || customForm.name.trim().length < 1) return [];
    const query = customForm.name.toLowerCase();
    return rabbits.filter(r => 
      r.name.toLowerCase().includes(query) && r.id !== selectedRabbitId
    ).slice(0, 5);
  }, [customForm.name, rabbits, selectedRabbitId]);

  const tattooSuggestions = useMemo(() => {
    if (!customForm.tattooNumber || customForm.tattooNumber.trim().length < 1) return [];
    const query = customForm.tattooNumber.toLowerCase();
    return rabbits.filter(r => 
      r.tattooNumber && r.tattooNumber.toLowerCase().includes(query) && r.id !== selectedRabbitId
    ).slice(0, 5);
  }, [customForm.tattooNumber, rabbits, selectedRabbitId]);

  const fillCustomFormFromRabbit = (r) => {
    setCustomForm({
      name: r.name || '',
      tattooNumber: r.tattooNumber || '',
      breed: r.breed || '',
      variety: r.variety || '',
      dob: r.dob || '',
      weightOz: weightUnit === 'lbs' && r.weightOz ? (r.weightOz / 16).toFixed(2) : (r.weightOz || ''),
      registrationNumber: r.registrationNumber || '',
      gcNumber: r.gcNumber || '',
      breederName: r.breederName || '',
      breederPrefix: r.breederPrefix || '',
      legsCount: r.legs?.length || '',
      colorCarrier: r.colorCarrier || '',
      winningsBOB: r.winningsBOB || 0,
      winningsBOV: r.winningsBOV || 0,
      winningsBOS: r.winningsBOS || 0,
      winningsBOSV: r.winningsBOSV || 0,
      winningsBIS: r.winningsBIS || 0,
      winningsOther: r.winningsOther || 0,
      showClass: r.showClass || 'Auto'
    });
  };

  const renderGreatGrandparentCard = (nodeId, label, gender, genderColorClass) => {
    const node = pedigreeNodes[nodeId];
    const parentNodeKey = nodeId.endsWith('Sire') ? nodeId.slice(0, -4) : nodeId.slice(0, -3);
    const parentRabbit = pedigreeNodes[parentNodeKey];
    const field = nodeId.endsWith('Sire') ? 'sireId' : 'damId';

    return (
      <div 
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverNodeId(nodeId);
        }}
        onDragLeave={() => setDragOverNodeId(null)}
        onDrop={(e) => handleDropOnNode(e, nodeId, label)}
        className={`w-full max-w-[140px] p-1.5 bg-slate-900/60 border rounded-lg shadow-sm transition-all ${
          dragOverNodeId === nodeId 
            ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-indigo-500/10' 
            : 'border-white/5'
        }`}
      >
        <p className={`text-[7px] font-extrabold uppercase ${genderColorClass}`}>{label}</p>
        {node ? (
          <div>
            <h5 className="font-bold text-white text-[10px] truncate">{node.name}</h5>
            {renderWinningsBadge(node, "text-[7px] px-1.5 py-0.2 rounded mt-0.5")}
            <p className="text-[8px] text-slate-400 mt-0.5">Tat: {node.tattooNumber || 'N/A'}</p>
            <div className="flex gap-2.5 mt-0.5">
              {onEditNode && (
                <button
                  onClick={() => onEditNode({
                    rabbitId: node.id,
                    gender: gender,
                    label: label,
                    parentOfId: parentRabbit?.id || '',
                    field: field
                  })}
                  className="text-[7px] text-indigo-400 hover:underline font-bold border-none bg-transparent cursor-pointer"
                >
                  Edit
                </button>
              )}
              <button 
                type="button"
                onClick={() => handleRemoveNode(nodeId)} 
                className="text-[7px] text-red-400 hover:underline font-bold border-none bg-transparent cursor-pointer"
              >
                Unassign
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setActiveAssignNode({ id: nodeId, label })}
            className="w-full py-1 border border-dashed border-white/10 text-slate-400 text-[9px] font-bold rounded mt-0.5 hover:bg-white/5 border-none bg-transparent cursor-pointer"
          >
            + Assign
          </button>
        )}
      </div>
    );
  };
  return (
    <div className="flex flex-col gap-6">
      {/* Header and selector */}
      <div className="glass-container p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">📜 {generations}-Generation Interactive Pedigree</h2>
          <p className="text-xs text-slate-300">Design lineages, verify ARBA weight limits, and append authorization signatures.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-950/80 p-0.5 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setGenerations(3)}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${generations === 3 ? 'bg-indigo-650 text-white shadow' : 'text-slate-400 bg-transparent'}`}
            >
              3 Gen
            </button>
            <button
              onClick={() => setGenerations(4)}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${generations === 4 ? 'bg-indigo-650 text-white shadow' : 'text-slate-400 bg-transparent'}`}
            >
              4 Gen
            </button>
          </div>

          <button
            onClick={() => setShowImportWizard(true)}
            className="py-2 px-3 bg-indigo-650/40 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Wand2 className="w-4 h-4 text-indigo-400" /> Auto-Digest Written Pedigree
          </button>
          
          <label className="text-xs font-bold text-slate-400">Select:</label>
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
        <div className="flex flex-col gap-6">
          <div className="w-full flex flex-col gap-6">
            {/* Split Lineage Designer View */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start w-full">
            {/* Draggable Registry Sidebar */}
            <div className="glass-container p-4 flex flex-col gap-3 xl:col-span-1 xl:max-h-[650px] overflow-y-auto">
              <div className="flex flex-col">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400">Draggable Registry</h4>
                <p className="text-[9px] opacity-75 mt-0.5">Drag any rabbit from this list and drop it directly onto any slot in the pedigree tree.</p>
              </div>
              <input
                type="text"
                placeholder="Search registry to drag..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full text-xs py-1.5 px-3 bg-slate-950 border-white/10 rounded-lg text-white"
              />
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[450px] pr-1">
                {draggableRabbits.length === 0 ? (
                  <span className="text-[10px] text-slate-500 text-center py-6">No matching rabbits.</span>
                ) : (
                  draggableRabbits.map(r => (
                    <div
                      key={r.id}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', JSON.stringify(r));
                      }}
                      className="p-2 bg-slate-950 border border-white/5 hover:border-indigo-500/40 rounded-xl cursor-grab active:cursor-grabbing flex items-center justify-between transition-all hover:bg-slate-900"
                    >
                      <div>
                        <h6 className="text-[10px] font-bold text-white truncate max-w-[120px]">{r.name}</h6>
                        <span className="text-[8px] text-slate-400 font-mono">Tattoo: {r.tattooNumber || 'None'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs">{r.sex === 'buck' ? '♂️' : '♀️'}</span>
                        <span className="text-[8px] text-indigo-300 font-black tracking-wide bg-indigo-500/10 py-0.5 px-1 rounded uppercase font-mono">{r.variety.slice(0, 5)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Visual Lineage Tree Canvas */}
            <div className="glass-container p-6 overflow-x-auto xl:col-span-3">
              {/* Tree Grid */}
              <div className={generations === 4 ? "min-w-[650px] lg:min-w-0 grid grid-cols-4 gap-2 relative" : "min-w-[500px] lg:min-w-0 grid grid-cols-3 gap-2 relative"}>
                {/* Generation 1: Self */}
                <div className="flex flex-col justify-center items-center">
                  <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-2">Gen 1 (Selected)</h4>
                  <div className="w-full max-w-[165px] p-3 bg-slate-950/70 border-2 border-indigo-500/30 rounded-2xl relative shadow-md shadow-slate-950">
                    <div className="absolute top-2 right-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] px-2 py-0.5 rounded-full font-bold">
                      PROBAND
                    </div>
                    <h5 className="font-bold text-white text-sm truncate">{pedigreeNodes.self.name}</h5>
                    {renderWinningsBadge(pedigreeNodes.self, "text-[9px] px-1.5 py-0.5 rounded-full mt-1")}
                    <p className="text-[10px] text-slate-400 mt-0.5">Tattoo: {pedigreeNodes.self.tattooNumber || 'None'}</p>
                    <p className="text-[10px] text-indigo-300 font-semibold mt-1">{pedigreeNodes.self.breed}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">Weight: {formatWeight(pedigreeNodes.self.weightOz)}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Inbreeding (F):</span>
                      {isFeatureAllowed('genetics_calc') ? (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                          (pedigreeNodes.self.inbreedingCoeff || 0) > 0.1 ? 'bg-red-500/20 text-red-400 border border-red-500/10' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10'
                        }`}>
                          {((pedigreeNodes.self.inbreedingCoeff || 0) * 100).toFixed(2)}%
                        </span>
                      ) : (
                        <span 
                          onClick={() => window.dispatchEvent(new CustomEvent('change-tab', { detail: 'billing' }))}
                          className="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/10 cursor-pointer flex items-center gap-1"
                          title="Upgrade to Family/Pro plan to unlock inbreeding calculation"
                        >
                          🔒 Unlock
                        </span>
                      )}
                    </div>
                    {onEditNode && (
                      <button
                        type="button"
                        onClick={() => onEditNode({
                          rabbitId: pedigreeNodes.self.id,
                          gender: pedigreeNodes.self.sex,
                          label: 'Proband (Active Rabbit)',
                          isOffspring: true
                        })}
                        className="mt-1 text-[9px] font-bold text-indigo-400 hover:underline border-none bg-transparent cursor-pointer block"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                {/* Generation 2: Parents */}
                <div className="flex flex-col justify-around gap-8">
                  <div className="flex flex-col items-center">
                    <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-2">Gen 2 (Parents)</h4>
                    {/* Sire */}
                    <div 
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverNodeId('sire');
                      }}
                      onDragLeave={() => setDragOverNodeId(null)}
                      onDrop={(e) => handleDropOnNode(e, 'sire', 'Sire (Father)')}
                      className={`w-full max-w-[165px] p-2.5 bg-slate-900 border rounded-2xl relative shadow-md transition-all ${
                        dragOverNodeId === 'sire' 
                          ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-indigo-500/10' 
                          : 'border-blue-500/20'
                      }`}
                    >
                      <div className="absolute top-2 right-2 bg-blue-500/15 text-blue-400 text-[9px] px-2 py-0.5 rounded-full font-bold">SIRE</div>
                      {pedigreeNodes.sire ? (
                        <div>
                          <h5 className="font-bold text-white text-xs truncate">{pedigreeNodes.sire.name}</h5>
                          {renderWinningsBadge(pedigreeNodes.sire, "text-[8px] px-1.5 py-0.5 rounded mt-0.5")}
                          <p className="text-[10px] text-slate-400 mt-0.5">Tat: {pedigreeNodes.sire.tattooNumber || 'None'}</p>
                          <p className="text-[10px] text-slate-300 mt-1">Weight: {formatWeight(pedigreeNodes.sire.weightOz)}</p>
                          <div className="flex gap-2.5 mt-2">
                            {onEditNode && (
                              <button
                                type="button"
                                onClick={() => onEditNode({
                                  rabbitId: pedigreeNodes.sire.id,
                                  gender: 'buck',
                                  label: 'Sire (Father)',
                                  parentOfId: activeRabbit.id,
                                  field: 'sireId'
                                })}
                                className="text-[9px] font-bold text-indigo-400 hover:underline border-none bg-transparent cursor-pointer"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveNode('sire')}
                              className="text-[9px] font-bold text-red-400 hover:underline border-none bg-transparent cursor-pointer"
                            >
                              Unassign
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveAssignNode({ id: 'sire', label: 'Sire (Father)' })}
                          className="w-full py-3 border border-dashed border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/5 transition-all text-[10px] font-bold flex items-center justify-center gap-1 border-none bg-transparent cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Assign Sire
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dam */}
                  <div className="flex flex-col items-center">
                    <div 
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverNodeId('dam');
                      }}
                      onDragLeave={() => setDragOverNodeId(null)}
                      onDrop={(e) => handleDropOnNode(e, 'dam', 'Dam (Mother)')}
                      className={`w-full max-w-[165px] p-2.5 bg-slate-900 border rounded-2xl relative shadow-md transition-all ${
                        dragOverNodeId === 'dam' 
                          ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-indigo-500/10' 
                          : 'border-pink-500/20'
                      }`}
                    >
                      <div className="absolute top-2 right-2 bg-pink-500/15 text-pink-400 text-[9px] px-2 py-0.5 rounded-full font-bold">DAM</div>
                      {pedigreeNodes.dam ? (
                        <div>
                          <h5 className="font-bold text-white text-xs truncate">{pedigreeNodes.dam.name}</h5>
                          {renderWinningsBadge(pedigreeNodes.dam, "text-[8px] px-1.5 py-0.5 rounded mt-0.5")}
                          <p className="text-[10px] text-slate-400 mt-0.5">Tat: {pedigreeNodes.dam.tattooNumber || 'None'}</p>
                          <p className="text-[10px] text-slate-300 mt-1">Weight: {formatWeight(pedigreeNodes.dam.weightOz)}</p>
                          <div className="flex gap-2.5 mt-2">
                            {onEditNode && (
                              <button
                                type="button"
                                onClick={() => onEditNode({
                                  rabbitId: pedigreeNodes.dam.id,
                                  gender: 'doe',
                                  label: 'Dam (Mother)',
                                  parentOfId: activeRabbit.id,
                                  field: 'damId'
                                })}
                                className="text-[9px] font-bold text-indigo-400 hover:underline border-none bg-transparent cursor-pointer"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveNode('dam')}
                              className="text-[9px] font-bold text-red-400 hover:underline border-none bg-transparent cursor-pointer"
                            >
                              Unassign
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveAssignNode({ id: 'dam', label: 'Dam (Mother)' })}
                          className="w-full py-3 border border-dashed border-pink-500/20 text-pink-400 rounded-xl hover:bg-pink-500/5 transition-all text-[10px] font-bold flex items-center justify-center gap-1 border-none bg-transparent cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Assign Dam
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Generation 3: Grandparents */}
                <div className="flex flex-col justify-between gap-3 py-1">
                  <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 text-center mb-1">Gen 3 (Grandparents)</h4>
                  
                  {/* Sire's Sire */}
                  <div 
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverNodeId('sireSire');
                    }}
                    onDragLeave={() => setDragOverNodeId(null)}
                    onDrop={(e) => handleDropOnNode(e, 'sireSire', "Sire's Sire")}
                    className={`w-full max-w-[150px] p-1.5 bg-slate-900/60 border rounded-xl shadow-md transition-all ${
                      dragOverNodeId === 'sireSire' 
                        ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-indigo-500/10' 
                        : 'border-white/5'
                    }`}
                  >
                    <p className="text-[8px] font-extrabold uppercase text-blue-400">Sire's Sire</p>
                    {pedigreeNodes.sireSire ? (
                      <div>
                        <h5 className="font-bold text-white text-xs truncate">{pedigreeNodes.sireSire.name}</h5>
                        {renderWinningsBadge(pedigreeNodes.sireSire, "text-[8px] px-1 py-0.2 rounded mt-0.5")}
                        <p className="text-[9px] text-slate-400 mt-0.5">Tat: {pedigreeNodes.sireSire.tattooNumber || 'N/A'}</p>
                        <div className="flex gap-2 mt-1">
                          {onEditNode && (
                            <button
                              type="button"
                              onClick={() => onEditNode({
                                rabbitId: pedigreeNodes.sireSire.id,
                                gender: 'buck',
                                label: "Sire's Sire",
                                parentOfId: pedigreeNodes.sire?.id || '',
                                field: 'sireId'
                              })}
                              className="text-[8px] text-indigo-400 hover:underline font-bold border-none bg-transparent cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                          <button type="button" onClick={() => handleRemoveNode('sireSire')} className="text-[8px] text-red-400 hover:underline font-bold border-none bg-transparent cursor-pointer">Unassign</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveAssignNode({ id: 'sireSire', label: "Sire's Sire" })}
                        className="w-full py-1.5 border border-dashed border-white/10 text-slate-400 text-[9px] font-bold rounded mt-1 hover:bg-white/5 border-none bg-transparent cursor-pointer"
                      >
                        + Assign
                      </button>
                    )}
                  </div>

                  {/* Sire's Dam */}
                  <div 
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverNodeId('sireDam');
                    }}
                    onDragLeave={() => setDragOverNodeId(null)}
                    onDrop={(e) => handleDropOnNode(e, 'sireDam', "Sire's Dam")}
                    className={`w-full max-w-[150px] p-1.5 bg-slate-900/60 border rounded-xl shadow-md transition-all ${
                      dragOverNodeId === 'sireDam' 
                        ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-indigo-500/10' 
                        : 'border-white/5'
                    }`}
                  >
                    <p className="text-[8px] font-extrabold uppercase text-pink-400">Sire's Dam</p>
                    {pedigreeNodes.sireDam ? (
                      <div>
                        <h5 className="font-bold text-white text-xs truncate">{pedigreeNodes.sireDam.name}</h5>
                        {renderWinningsBadge(pedigreeNodes.sireDam, "text-[8px] px-1 py-0.2 rounded mt-0.5")}
                        <p className="text-[9px] text-slate-400 mt-0.5">Tat: {pedigreeNodes.sireDam.tattooNumber || 'N/A'}</p>
                        <div className="flex gap-2 mt-1">
                          {onEditNode && (
                            <button
                              type="button"
                              onClick={() => onEditNode({
                                rabbitId: pedigreeNodes.sireDam.id,
                                gender: 'doe',
                                label: "Sire's Dam",
                                parentOfId: pedigreeNodes.sire?.id || '',
                                field: 'damId'
                              })}
                              className="text-[8px] text-indigo-400 hover:underline font-bold border-none bg-transparent cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                          <button type="button" onClick={() => handleRemoveNode('sireDam')} className="text-[8px] text-red-400 hover:underline font-bold border-none bg-transparent cursor-pointer">Unassign</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveAssignNode({ id: 'sireDam', label: "Sire's Dam" })}
                        className="w-full py-1.5 border border-dashed border-white/10 text-slate-400 text-[9px] font-bold rounded mt-1 hover:bg-white/5 border-none bg-transparent cursor-pointer"
                      >
                        + Assign
                      </button>
                    )}
                  </div>

                  {/* Dam's Sire */}
                  <div 
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverNodeId('damSire');
                    }}
                    onDragLeave={() => setDragOverNodeId(null)}
                    onDrop={(e) => handleDropOnNode(e, 'damSire', "Dam's Sire")}
                    className={`w-full max-w-[150px] p-1.5 bg-slate-900/60 border rounded-xl shadow-md transition-all ${
                      dragOverNodeId === 'damSire' 
                        ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-indigo-500/10' 
                        : 'border-white/5'
                    }`}
                  >
                    <p className="text-[8px] font-extrabold uppercase text-blue-400">Dam's Sire</p>
                    {pedigreeNodes.damSire ? (
                      <div>
                        <h5 className="font-bold text-white text-xs truncate">{pedigreeNodes.damSire.name}</h5>
                        {renderWinningsBadge(pedigreeNodes.damSire, "text-[8px] px-1 py-0.2 rounded mt-0.5")}
                        <p className="text-[9px] text-slate-400 mt-0.5">Tat: {pedigreeNodes.damSire.tattooNumber || 'N/A'}</p>
                        <div className="flex gap-2 mt-1">
                          {onEditNode && (
                            <button
                              type="button"
                              onClick={() => onEditNode({
                                rabbitId: pedigreeNodes.damSire.id,
                                gender: 'buck',
                                label: "Dam's Sire",
                                parentOfId: pedigreeNodes.dam?.id || '',
                                field: 'sireId'
                              })}
                              className="text-[8px] text-indigo-400 hover:underline font-bold border-none bg-transparent cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                          <button type="button" onClick={() => handleRemoveNode('damSire')} className="text-[8px] text-red-400 hover:underline font-bold border-none bg-transparent cursor-pointer">Unassign</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveAssignNode({ id: 'damSire', label: "Dam's Sire" })}
                        className="w-full py-1.5 border border-dashed border-white/10 text-slate-400 text-[9px] font-bold rounded mt-1 hover:bg-white/5 border-none bg-transparent cursor-pointer"
                      >
                        + Assign
                      </button>
                    )}
                  </div>

                  {/* Dam's Dam */}
                  <div 
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverNodeId('damDam');
                    }}
                    onDragLeave={() => setDragOverNodeId(null)}
                    onDrop={(e) => handleDropOnNode(e, 'damDam', "Dam's Dam")}
                    className={`w-full max-w-[150px] p-1.5 bg-slate-900/60 border rounded-xl shadow-md transition-all ${
                      dragOverNodeId === 'damDam' 
                        ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-indigo-500/10' 
                        : 'border-white/5'
                    }`}
                  >
                    <p className="text-[8px] font-extrabold uppercase text-pink-400">Dam's Dam</p>
                    {pedigreeNodes.damDam ? (
                      <div>
                        <h5 className="font-bold text-white text-xs truncate">{pedigreeNodes.damDam.name}</h5>
                        {renderWinningsBadge(pedigreeNodes.damDam, "text-[8px] px-1 py-0.2 rounded mt-0.5")}
                        <p className="text-[9px] text-slate-400 mt-0.5">Tat: {pedigreeNodes.damDam.tattooNumber || 'N/A'}</p>
                        <div className="flex gap-2 mt-1">
                          {onEditNode && (
                            <button
                              type="button"
                              onClick={() => onEditNode({
                                rabbitId: pedigreeNodes.damDam.id,
                                gender: 'doe',
                                label: "Dam's Dam",
                                parentOfId: pedigreeNodes.dam?.id || '',
                                field: 'damId'
                              })}
                              className="text-[8px] text-indigo-400 hover:underline font-bold border-none bg-transparent cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                          <button type="button" onClick={() => handleRemoveNode('damDam')} className="text-[8px] text-red-400 hover:underline font-bold border-none bg-transparent cursor-pointer">Unassign</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveAssignNode({ id: 'damDam', label: "Dam's Dam" })}
                        className="w-full py-1.5 border border-dashed border-white/10 text-slate-400 text-[9px] font-bold rounded mt-1 hover:bg-white/5 border-none bg-transparent cursor-pointer"
                      >
                        + Assign
                      </button>
                    )}
                  </div>

                </div>

                {generations === 4 && (
                  /* Generation 4: Great-Grandparents */
                  <div className="flex flex-col justify-between gap-2 py-1">
                    <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 text-center mb-1">Gen 4 (Great-Grandparents)</h4>
                    {renderGreatGrandparentCard('sireSireSire', "Sire's Sire's Sire", 'buck', 'text-blue-400')}
                    {renderGreatGrandparentCard('sireSireDam', "Sire's Sire's Dam", 'doe', 'text-pink-400')}
                    {renderGreatGrandparentCard('sireDamSire', "Sire's Dam's Sire", 'buck', 'text-blue-400')}
                    {renderGreatGrandparentCard('sireDamDam', "Sire's Dam's Dam", 'doe', 'text-pink-400')}
                    {renderGreatGrandparentCard('damSireSire', "Dam's Sire's Sire", 'buck', 'text-blue-400')}
                    {renderGreatGrandparentCard('damSireDam', "Dam's Sire's Dam", 'doe', 'text-pink-400')}
                    {renderGreatGrandparentCard('damDamSire', "Dam's Dam's Sire", 'buck', 'text-blue-400')}
                    {renderGreatGrandparentCard('damDamDam', "Dam's Dam's Dam", 'doe', 'text-pink-400')}
                  </div>
                )}
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
                      {arbaAudit.breed} standards mandate: <strong className="text-white">{arbaAudit.minWeightDisplay} - {arbaAudit.maxWeightDisplay}</strong>.
                    </p>
                  </div>
                </div>

                <div className="text-right sm:text-right flex flex-col items-center sm:items-end">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${arbaAudit.isCompliant ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    Current: {arbaAudit.currentWeightDisplay} ({arbaAudit.issue})
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1">Checked against official ARBA class metrics</span>
                </div>
              </div>
            )}
          </div>

        {/* Action Controls & Signature Pad Grid (Rendered below tree) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-4">
          {/* Left Columns: Assignment Search & Custom Forms */}
          <div className="lg:col-span-2 flex flex-col gap-6">
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
                      <div className="flex flex-col gap-1 relative">
                        <label className="text-slate-400 font-bold">Name *</label>
                        <input
                          type="text"
                          required
                          value={customForm.name}
                          onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500"
                        />
                        {nameSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 z-30 w-full bg-slate-950 border border-indigo-500/40 rounded-lg shadow-xl max-h-32 overflow-y-auto text-[9px] mt-0.5">
                            {nameSuggestions.map(s => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => fillCustomFormFromRabbit(s)}
                                className="w-full text-left p-1.5 hover:bg-indigo-600/30 text-white border-b border-white/5 last:border-b-0 cursor-pointer block"
                              >
                                {s.name} <span className="opacity-60 font-mono">({s.tattooNumber || 'No Tat'})</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 relative">
                        <label className="text-slate-400 font-bold">Tattoo</label>
                        <input
                          type="text"
                          value={customForm.tattooNumber}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomForm(prev => ({ ...prev, tattooNumber: val }));
                            
                            if (val && val.trim().length > 0) {
                              const exactMatch = rabbits.find(r => 
                                r.tattooNumber && r.tattooNumber.toLowerCase() === val.trim().toLowerCase() && r.id !== selectedRabbitId
                              );
                              if (exactMatch) {
                                // Auto populate registered rabbit metadata
                                setCustomForm({
                                  name: exactMatch.name || '',
                                  tattooNumber: exactMatch.tattooNumber || '',
                                  breed: exactMatch.breed || '',
                                  variety: exactMatch.variety || '',
                                  dob: exactMatch.dob || '',
                                  weightOz: weightUnit === 'lbs' && exactMatch.weightOz ? (exactMatch.weightOz / 16).toFixed(2) : (exactMatch.weightOz || ''),
                                  registrationNumber: exactMatch.registrationNumber || '',
                                  gcNumber: exactMatch.gcNumber || '',
                                  breederName: exactMatch.breederName || '',
                                  breederPrefix: exactMatch.breederPrefix || '',
                                  legsCount: exactMatch.legs?.length || '',
                                  colorCarrier: exactMatch.colorCarrier || '',
                                  winningsBOB: exactMatch.winningsBOB || 0,
                                  winningsBOV: exactMatch.winningsBOV || 0,
                                  winningsBOS: exactMatch.winningsBOS || 0,
                                  winningsBOSV: exactMatch.winningsBOSV || 0,
                                  winningsBIS: exactMatch.winningsBIS || 0,
                                  winningsOther: exactMatch.winningsOther || 0,
                                  showClass: exactMatch.showClass || 'Auto'
                                });
                              }
                            }
                          }}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500"
                        />
                        {tattooSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 z-30 w-full bg-slate-950 border border-indigo-500/40 rounded-lg shadow-xl max-h-32 overflow-y-auto text-[9px] mt-0.5">
                            {tattooSuggestions.map(s => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => fillCustomFormFromRabbit(s)}
                                className="w-full text-left p-1.5 hover:bg-indigo-600/30 text-white border-b border-white/5 last:border-b-0 cursor-pointer block"
                              >
                                <span className="font-bold">{s.tattooNumber}</span> - {s.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-bold">Breed</label>
                        <select
                          value={customForm.breed}
                          onChange={(e) => setCustomForm({ ...customForm, breed: e.target.value })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="">-- Select Breed --</option>
                          {Object.keys(activeRabbit?.species === 'cavy' ? CAVY_BREED_STANDARDS : BREED_STANDARDS).sort().map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-bold">Variety</label>
                        <input
                          type="text"
                          value={customForm.variety}
                          onChange={(e) => setCustomForm({ ...customForm, variety: e.target.value })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500"
                        />
                        {/* Variety color swatches quick picker */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(BREED_COLORS[customForm.breed] || BREED_COLORS['Default']).slice(0, 8).map(c => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => setCustomForm({ ...customForm, variety: c.name })}
                              title={c.name}
                              className={`w-4 h-4 rounded-full border transition-all hover:scale-110 flex items-center justify-center ${customForm.variety === c.name ? 'border-indigo-400 ring-1 ring-indigo-300' : 'border-slate-600'}`}
                              style={{
                                background: c.hex,
                                boxShadow: c.border ? `inset 0 0 0 1px ${c.border}` : 'none'
                              }}
                            />
                          ))}
                        </div>
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
                        <label className="text-slate-400 font-bold">Weight ({weightUnit})</label>
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

                    <div className="flex flex-col gap-1 text-[10px]">
                      <label className="text-slate-400 font-bold">Show Class Override</label>
                      <select
                        value={customForm.showClass || 'Auto'}
                        onChange={(e) => setCustomForm({ ...customForm, showClass: e.target.value })}
                        className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500 cursor-pointer w-full"
                      >
                        <option value="Auto">Auto (Calculate from DOB)</option>
                        <option value="Junior">Junior</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Senior">Senior</option>
                      </select>
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

                    <div className="grid grid-cols-1 gap-2 text-[10px]">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-bold">Color Carrier / Genotype Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Carries dilute, chocolate"
                          value={customForm.colorCarrier || ''}
                          onChange={(e) => setCustomForm({ ...customForm, colorCarrier: e.target.value })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-[10px] border-t border-white/5 pt-2 mt-1">
                      <div className="col-span-3 md:col-span-6">
                        <label className="text-slate-400 font-bold">Show Winnings counts</label>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-slate-500 text-center font-bold">BOB</label>
                        <input
                          type="number" min="0" placeholder="0"
                          value={customForm.winningsBOB || ''}
                          onChange={(e) => setCustomForm({ ...customForm, winningsBOB: parseInt(e.target.value, 10) || 0 })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500 text-center"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-slate-500 text-center font-bold">BOV</label>
                        <input
                          type="number" min="0" placeholder="0"
                          value={customForm.winningsBOV || ''}
                          onChange={(e) => setCustomForm({ ...customForm, winningsBOV: parseInt(e.target.value, 10) || 0 })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500 text-center"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-slate-500 text-center font-bold">BOS</label>
                        <input
                          type="number" min="0" placeholder="0"
                          value={customForm.winningsBOS || ''}
                          onChange={(e) => setCustomForm({ ...customForm, winningsBOS: parseInt(e.target.value, 10) || 0 })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500 text-center"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-slate-500 text-center font-bold">BOSV</label>
                        <input
                          type="number" min="0" placeholder="0"
                          value={customForm.winningsBOSV || ''}
                          onChange={(e) => setCustomForm({ ...customForm, winningsBOSV: parseInt(e.target.value, 10) || 0 })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500 text-center"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-slate-500 text-center font-bold">BIS</label>
                        <input
                          type="number" min="0" placeholder="0"
                          value={customForm.winningsBIS || ''}
                          onChange={(e) => setCustomForm({ ...customForm, winningsBIS: parseInt(e.target.value, 10) || 0 })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500 text-center"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-slate-500 text-center font-bold">Other</label>
                        <input
                          type="number" min="0" placeholder="0"
                          value={customForm.winningsOther || ''}
                          onChange={(e) => setCustomForm({ ...customForm, winningsOther: parseInt(e.target.value, 10) || 0 })}
                          className="bg-slate-950/70 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:border-indigo-500 text-center"
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
            ) : (
              <div className="glass-container p-6 text-center text-slate-400 text-xs border border-white/5 bg-slate-950/20">
                💡 Click <strong className="text-indigo-400 font-bold">+ Assign</strong> on any pedigree node above to search your herd or create a custom ancestor record.
              </div>
            )}
          </div>

          {/* Right Column: Signature Pad & Print Button */}
          <div className="lg:col-span-1 flex flex-col gap-6">
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

            {/* Print Official Pedigree button */}
            <button
              onClick={() => onPrintPedigree && onPrintPedigree(activeRabbit)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 hover-glow cursor-pointer border-none"
            >
              📜 Print Official ARBA Pedigree
            </button>

            {/* Get Registrar Prep Packet button */}
            {onOpenRegistrarPrep && (
              <button
                type="button"
                onClick={() => onOpenRegistrarPrep(activeRabbit)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border border-white/10 mt-2"
              >
                📜 Get Registrar Prep Packet
              </button>
            )}
          </div>
        </div>
      </div>
      ) : (
        <div className="glass-container p-12 text-center text-slate-400">
          No rabbits available. Please add a rabbit inside the Lineage tab first!
        </div>
      )}

      {showImportWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-indigo-500/30 text-white rounded-3xl p-6 shadow-2xl flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  🪄 Written Pedigree Digest Wizard
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Paste freeform pedigree text details. We'll automatically identify ancestors and parse attributes.</p>
              </div>
              <button
                onClick={() => {
                  setShowImportWizard(false);
                  setImportText('');
                  setParsedPreview(null);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/5 cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300">Pasted Written Pedigree Details:</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const template = `Name: ${activeRabbit?.name || ''}
Ear No: ${activeRabbit?.tattooNumber || ''}
Wt: ${activeRabbit?.weightOz ? (weightUnit === 'lbs' ? (activeRabbit.weightOz / 16).toFixed(2) : activeRabbit.weightOz) : ''}
Breed: ${activeRabbit?.breed || ''}
Variety: ${activeRabbit?.variety || ''}

Sire: 
Ear No: 
Wt: 
Variety: 

Dam: 
Ear No: 
Wt: 
Variety: 

Sire's Sire: 
Ear No: 
Wt: 
Variety: 

Sire's Dam: 
Ear No: 
Wt: 
Variety: 

Dam's Sire: 
Ear No: 
Wt: 
Variety: 

Dam's Dam: 
Ear No: 
Wt: 
Variety: 

Sire's Sire's Sire: 
Sire's Sire's Dam: 
Sire's Dam's Sire: 
Sire's Dam's Dam: 
Dam's Sire's Sire: 
Dam's Sire's Dam: 
Dam's Dam's Sire: 
Dam's Dam's Dam: `;
                        setImportText(template);
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold border-none bg-transparent cursor-pointer"
                    >
                      📄 Load Blank Template
                    </button>
                    <span className="text-[10px] opacity-40">|</span>
                    <label className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer">
                      📁 Upload Text File
                      <input
                        type="file"
                        accept=".txt,.rtf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (evt) => setImportText(evt.target.result);
                          reader.readAsText(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Name: Beckey's Bunnies Daisy&#10;Ear No: BB49&#10;Wt: 10.4&#10;Breed: New Zealand&#10;&#10;Sire: Forrest Edge's RW5&#10;Ear No: RW5&#10;Wt: 10.28&#10;Color: Broken Black&#10;&#10;Dam: Vela&#10;Ear No: BB11..."
                  rows={10}
                  className="w-full bg-slate-950 border border-white/10 text-xs text-white rounded-xl p-3 focus:border-indigo-500 font-mono outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleParsePedigree}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl text-xs cursor-pointer border-none"
                >
                  🔍 Digest & Match Lineage
                </button>
                {parsedPreview && (
                  <button
                    type="button"
                    onClick={handleApplyParsedPedigree}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-550 text-white font-bold rounded-xl text-xs cursor-pointer border-none"
                  >
                    ✅ Apply Lineage to {activeRabbit?.name}
                  </button>
                )}
              </div>
            </div>

            {/* Preview Section */}
            {parsedPreview && (
              <div className="border-t border-white/10 pt-4 mt-2 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-200">Digested Ancestor Matches:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[250px] overflow-y-auto pr-1">
                  {Object.entries(parsedPreview).map(([nodeId, data]) => {
                    const roleLabel = getRoleLabel(nodeId);
                    return (
                      <div key={nodeId} className="p-2 bg-black/30 border border-white/5 rounded-lg flex flex-col gap-1 text-[9px] leading-tight">
                        <span className="font-mono text-[7px] text-indigo-400 font-bold uppercase">{roleLabel}</span>
                        <strong className="text-slate-200 truncate">{data.name || 'Unknown'}</strong>
                        {data.tattooNumber && <div className="text-slate-400">Ear: <span className="text-slate-350">{data.tattooNumber}</span></div>}
                        {data.weightOz ? <div className="text-slate-400">Wt: <span className="text-slate-350">{formatWeight(data.weightOz)}</span></div> : null}
                        {data.variety && <div className="text-slate-400">Var: <span className="text-slate-350 truncate block">{data.variety}</span></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
