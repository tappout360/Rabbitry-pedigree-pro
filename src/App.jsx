import React, { useState, useEffect } from 'react';
import { 
  Rabbit, Calendar, DollarSign, RefreshCw, Plus, 
  Trash2, ShieldAlert, CheckCircle2, User, HelpCircle, 
  Camera, BarChart3, AlertCircle, ShoppingBag, Eye, EyeOff, Award,
  Settings, Grid, Trash, Download, Image as ImageIcon, Sparkles, X,
  LogOut, HeartPulse, ShieldCheck, Check, Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GeneticsEngine } from './genetics';

// Initial Breed Standards Data (Ounces: 16 oz = 1 lb)
const BREED_STANDARDS = {
  'Holland Lop': {
    name: 'Holland Lop',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 48, buckSrMin: 32, buckSrMax: 64, // max 4.0 lbs (64 oz), Senior min 2.0 lbs (32 oz)
    doeJrMin: 0, doeJrMax: 48, doeSrMin: 32, doeSrMax: 64
  },
  'Netherland Dwarf': {
    name: 'Netherland Dwarf',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 32, buckSrMin: 16, buckSrMax: 40, // max 2.5 lbs (40 oz), Senior min 1.0 lbs (16 oz)
    doeJrMin: 0, doeJrMax: 32, doeSrMin: 16, doeSrMax: 40
  },
  'Flemish Giant': {
    name: 'Flemish Giant',
    classType: '6-class',
    buckJrMin: 0, buckJrMax: 160, buckIntMin: 144, buckIntMax: 192, buckSrMin: 208, buckSrMax: 9999, // Sr Bucks min 13 lbs (208 oz)
    doeJrMin: 0, doeJrMax: 176, doeIntMin: 160, doeIntMax: 208, doeSrMin: 224, doeSrMax: 9999    // Sr Does min 14 lbs (224 oz)
  },
  'New Zealand': {
    name: 'New Zealand',
    classType: '6-class',
    buckJrMin: 0, buckJrMax: 128, buckIntMin: 112, buckIntMax: 144, buckSrMin: 144, buckSrMax: 176, // Sr Bucks 9-11 lbs (144-176 oz)
    doeJrMin: 0, doeJrMax: 144, doeIntMin: 128, doeIntMax: 160, doeSrMin: 160, doeSrMax: 192    // Sr Does 10-12 lbs (160-192 oz)
  },
  'Californian': {
    name: 'Californian',
    classType: '6-class',
    buckJrMin: 88, buckJrMax: 128, buckIntMin: 0, buckIntMax: 144, buckSrMin: 144, buckSrMax: 160, // Jr 5.5-8 lbs, Int max 9 lbs, Sr 9-10 lbs
    doeJrMin: 88, doeJrMax: 136, doeIntMin: 0, doeIntMax: 152, doeSrMin: 152, doeSrMax: 168     // Jr 5.5-8.5 lbs, Int max 9.5 lbs, Sr 9.5-10.5 lbs
  },
  'Mini Rex': {
    name: 'Mini Rex',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 52, buckSrMin: 48, buckSrMax: 68, // Jr max 3.25 lbs, Sr Bucks 3-4.25 lbs
    doeJrMin: 0, doeJrMax: 52, doeSrMin: 52, doeSrMax: 72  // Jr max 3.25 lbs, Sr Does 3.25-4.5 lbs
  },
  'Mini Lop': {
    name: 'Mini Lop',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 72, buckSrMin: 72, buckSrMax: 104, // Jr max 4.5 lbs, Sr 4.5-6.5 lbs
    doeJrMin: 0, doeJrMax: 72, doeSrMin: 72, doeSrMax: 104
  },
  'Dutch': {
    name: 'Dutch',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 56, buckSrMin: 56, buckSrMax: 88, // Jr max 3.5 lbs, Sr 3.5-5.5 lbs
    doeJrMin: 0, doeJrMax: 56, doeSrMin: 56, doeSrMax: 88
  },
  'Rex': {
    name: 'Rex',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 128, buckSrMin: 120, buckSrMax: 152, // Jr max 8 lbs, Sr Bucks 7.5-9.5 lbs
    doeJrMin: 0, doeJrMax: 128, doeSrMin: 128, doeSrMax: 168   // Jr max 8 lbs, Sr Does 8-10.5 lbs
  },
  'Lionhead': {
    name: 'Lionhead',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 52, buckSrMin: 40, buckSrMax: 60, // Jr max 3.25 lbs, Sr 2.5-3.75 lbs
    doeJrMin: 0, doeJrMax: 52, doeSrMin: 40, doeSrMax: 60
  },
  'Jersey Wooly': {
    name: 'Jersey Wooly',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 48, buckSrMin: 32, buckSrMax: 56, // Jr max 3 lbs, Sr 2-3.5 lbs (ideal 3 lbs)
    doeJrMin: 0, doeJrMax: 48, doeSrMin: 32, doeSrMax: 56
  },
  'French Lop': {
    name: 'French Lop',
    classType: '6-class',
    buckJrMin: 0, buckJrMax: 168, buckIntMin: 0, buckIntMax: 184, buckSrMin: 168, buckSrMax: 9999, // Sr Bucks min 10.5 lbs (168 oz)
    doeJrMin: 0, doeJrMax: 168, doeIntMin: 0, doeIntMax: 184, doeSrMin: 176, doeSrMax: 9999     // Sr Does min 11 lbs (176 oz)
  },
  'Champagne d\'Argent': {
    name: 'Champagne d\'Argent',
    classType: '6-class',
    buckJrMin: 0, buckJrMax: 144, buckIntMin: 0, buckIntMax: 160, buckSrMin: 144, buckSrMax: 176, // Jr max 9 lbs, Sr 9-11 lbs
    doeJrMin: 0, doeJrMax: 144, doeIntMin: 0, doeIntMax: 168, doeSrMin: 152, doeSrMax: 192     // Jr max 9 lbs, Sr 9.5-12 lbs
  },
  'English Angora': {
    name: 'English Angora',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 88, buckSrMin: 80, buckSrMax: 120, // Jr max 5.5 lbs, Sr 5-7.5 lbs
    doeJrMin: 0, doeJrMax: 88, doeSrMin: 80, doeSrMax: 120
  },
  'Satin': {
    name: 'Satin',
    classType: '6-class',
    buckJrMin: 0, buckJrMax: 128, buckIntMin: 0, buckIntMax: 144, buckSrMin: 136, buckSrMax: 168, // Jr max 8 lbs, Int max 9 lbs, Sr Bucks 8.5-10.5 lbs
    doeJrMin: 0, doeJrMax: 128, doeIntMin: 0, doeIntMax: 144, doeSrMin: 144, doeSrMax: 176     // Jr max 8 lbs, Int max 9 lbs, Sr Does 9-11 lbs
  },
  'Havana': {
    name: 'Havana',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 80, buckSrMin: 72, buckSrMax: 104, // Jr max 5 lbs, Sr 4.5-6.5 lbs
    doeJrMin: 0, doeJrMax: 80, doeSrMin: 72, doeSrMax: 104
  },
  'Himalayan': {
    name: 'Himalayan',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 40, buckSrMin: 40, buckSrMax: 72, // Jr max 2.5 lbs, Sr 2.5-4.5 lbs
    doeJrMin: 0, doeJrMax: 40, doeSrMin: 40, doeSrMax: 72
  },
  'Polish': {
    name: 'Polish',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 40, buckSrMin: 0, buckSrMax: 56,  // Jr max 2.5 lbs, Sr max 3.5 lbs
    doeJrMin: 0, doeJrMax: 40, doeSrMin: 0, doeSrMax: 56
  },
  'Thrianta': {
    name: 'Thrianta',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 80, buckSrMin: 64, buckSrMax: 96,  // Jr max 5 lbs, Sr 4-6 lbs
    doeJrMin: 0, doeJrMax: 80, doeSrMin: 64, doeSrMax: 96
  },
  'Silver Marten': {
    name: 'Silver Marten',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 104, buckSrMin: 104, buckSrMax: 136, // Jr max 6.5 lbs, Sr Bucks 6.5-8.5 lbs
    doeJrMin: 0, doeJrMax: 104, doeSrMin: 112, doeSrMax: 152   // Jr max 6.5 lbs, Sr Does 7-9.5 lbs
  }
};

const LOGO_OPTIONS = [
  { id: 'logo-meadow', label: 'Meadow Bunny 🐇', emoji: '🐇' },
  { id: 'logo-cyber', label: 'Cyber Rabbit ⚡', emoji: '⚡🐇' },
  { id: 'logo-crown', label: 'Royal Crown 👑', emoji: '👑🐇' },
  { id: 'logo-orchard', label: 'Orchard Apple 🍏', emoji: '🍏🐇' }
];

const ONBOARDING_RABBITS = [
  { id: 'o-nz', image: '/assets/new_zealand_blue.png', breed: 'New Zealand', text: 'Solid blue show rabbit' }
];


function BreederCard({ b, setAdminBreeders, triggerConfetti }) {
  const [showPass, setShowPass] = useState(false);
  const [editPassVal, setEditPassVal] = useState(b.password);
  const [resetLinkVal, setResetLinkVal] = useState(null);

  useEffect(() => {
    setEditPassVal(b.password);
  }, [b.password]);

  const handleSavePassword = () => {
    setAdminBreeders(prev => prev.map(item => 
      item.id === b.id ? { ...item, password: editPassVal } : item
    ));
    alert(`Password for ${b.name} successfully overridden!`);
  };

  const handleTriggerReset = () => {
    const mockToken = Math.random().toString(36).substring(2, 15);
    const mockUrl = `${window.location.origin}/reset-password?token=${mockToken}&email=${encodeURIComponent(b.email)}`;
    setResetLinkVal(mockUrl);
  };

  const handleStatusChange = (newStatus) => {
    setAdminBreeders(prev => prev.map(item => 
      item.id === b.id ? { ...item, status: newStatus } : item
    ));
    if (newStatus === 'active') {
      triggerConfetti();
    }
  };

  const handleRoleChange = (newRole) => {
    setAdminBreeders(prev => prev.map(item => 
      item.id === b.id ? { ...item, role: newRole } : item
    ));
  };

  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-4">
      {/* Breeder top info bar */}
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <h4 className="font-bold text-sm flex items-center gap-2">
            {b.name}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${b.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {b.status}
            </span>
          </h4>
          <p className="text-xs opacity-75">{b.email} | {b.phone || 'No phone'}</p>
          <p className="text-[11px] text-indigo-300 font-semibold mt-0.5">Rabbitry: {b.rabbitryName}</p>
        </div>

        {/* Approve/Reject Buttons */}
        <div className="flex gap-2">
          {b.status === 'pending' ? (
            <>
              <button
                onClick={() => handleStatusChange('active')}
                className="btn-interactive text-xs py-1 px-3 bg-green-600 border-none font-bold"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to reject and delete ${b.name}'s profile application?`)) {
                    setAdminBreeders(prev => prev.filter(item => item.id !== b.id));
                  }
                }}
                className="btn-interactive text-xs py-1 px-3 bg-red-700 border-none font-bold"
              >
                Reject
              </button>
            </>
          ) : (
            !b.isSuperAdmin && (
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete breeder ${b.name}?`)) {
                    setAdminBreeders(prev => prev.filter(item => item.id !== b.id));
                  }
                }}
                className="text-red-400 hover:text-red-300 text-xs py-1"
              >
                Purge Breeder
              </button>
            )
          )}
        </div>
      </div>

      {/* Credentials & Role Action Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-3">
        {/* Role Selection */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">Assign Breeder Role</label>
          {b.isSuperAdmin ? (
            <div className="text-xs font-bold text-indigo-300 py-1.5">App Owner / Super Admin 👑</div>
          ) : (
            <select
              value={b.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="text-xs py-1.5 px-3"
            >
              <option value="owner">Breeder / Owner 👑</option>
              <option value="assistant">Barn Assistant 🌾</option>
              <option value="registrar">ARBA Registrar 📜</option>
            </select>
          )}
        </div>

        {/* Password Recovery Helper */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">Password Security Override</label>
          {b.isSuperAdmin ? (
            <div className="text-xs text-slate-400 py-1.5 italic">Locked for Owner Account Security</div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPass ? "text" : "password"}
                  value={editPassVal}
                  onChange={(e) => setEditPassVal(e.target.value)}
                  className="w-full text-xs py-1.5 pl-3 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 animate-none"
                >
                  {showPass ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4 opacity-50" />}
                </button>
              </div>
              <button
                onClick={handleSavePassword}
                className="btn-interactive text-xs py-1.5 px-3 bg-indigo-600 border-none shrink-0"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Password Reset simulated link */}
      {!b.isSuperAdmin && (
        <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase opacity-70">Credentials Reset Helper</span>
            <button
              onClick={handleTriggerReset}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Generate & Simulate Password Reset Link
            </button>
          </div>

          {resetLinkVal && (
            <div className="p-3 bg-white/5 border border-cyan-500/20 rounded-xl flex flex-col gap-2">
              <span className="text-[10px] font-mono text-cyan-400">Mock Reset Email Generated!</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={resetLinkVal}
                  className="flex-1 text-[11px] font-mono py-1 px-2 bg-black/40 border-none rounded"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resetLinkVal);
                    alert("Reset Link copied to clipboard!");
                  }}
                  className="btn-interactive text-[10px] py-1 px-2.5 bg-indigo-600 border-none"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => setResetLinkVal(null)}
                  className="text-red-400 hover:text-red-300 text-xs p-1"
                >
                  Clear
                </button>
              </div>
              <p className="text-[9px] opacity-60">The user would receive this secure tokenized link to reset their credentials.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SignaturePad({ value, onChange, placeholder }) {
  const canvasRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#e8f5e9'; // primary text color
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Draw existing signature if present
    if (value && value.startsWith('data:image')) {
      const img = new Image();
      img.src = value;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [value]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    let x, y;
    if (e.touches && e.touches[0]) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    let x, y;
    if (e.touches && e.touches[0]) {
      if (e.cancelable) e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL());
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative border-2 border-dashed border-white/20 rounded-xl overflow-hidden bg-black/40 h-32">
        <canvas
          ref={canvasRef}
          width={400}
          height={128}
          className="w-full h-full cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!value && (
          <span className="absolute inset-0 flex items-center justify-center text-xs opacity-40 pointer-events-none">
            {placeholder || 'Draw your signature here...'}
          </span>
        )}
      </div>
      <button 
        type="button" 
        onClick={clear}
        className="btn-interactive text-[10px] py-1 px-3 self-end bg-slate-800 text-slate-350 border-none"
      >
        Clear Drawing
      </button>
    </div>
  );
}

const getPrimaryPhoto = (rabbit) => {
  if (rabbit && rabbit.photos && rabbit.photos.length > 0) {
    const photo = rabbit.photos[0];
    return typeof photo === 'string' ? photo : photo.url;
  }
  return 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300';
};

const getPrimaryPhotoStyles = (rabbit) => {
  if (rabbit && rabbit.photos && rabbit.photos.length > 0) {
    const photo = rabbit.photos[0];
    const pObj = typeof photo === 'string' ? { brightness: 100, rotation: 0 } : photo;
    return {
      filter: `brightness(${pObj.brightness || 100}%)`,
      transform: `rotate(${pObj.rotation || 0}deg)`
    };
  }
  return {};
};

const sanitizeTextInput = (text) => {
  if (!text) return '';
  const ssnRegex = /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/;
  if (ssnRegex.test(text)) {
    alert("SECURITY WARNING: Social Security Numbers (SSN) are strictly prohibited. You must only use Tattoo numbers and system-generated Breeder Account numbers.");
    throw new Error("SSN Prohibited");
  }
  let sanitized = text;
  // Strip patterns resembling ICD-10-CM codes (e.g. A00.0, M54.5, etc.)
  sanitized = sanitized.replace(/\b[A-Z]\d{2}(?:\.\d{1,4})?\b/gi, '[HEALTH CODE REDACTED]');
  // Strip human healthcare terms
  const humanHealthWords = [
    'medicare', 'medicaid', 'phi', 'hipaa', 'health insurance', 
    'social security number', 'human drug', 'patient record'
  ];
  humanHealthWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '[REDACTED]');
  });
  return sanitized;
};

const scanPedigree = (rabbit, allRabbits, depth = 0) => {
  if (!rabbit || depth > 3) return [];
  const missing = [];
  if (!rabbit.tattooNumber) missing.push({ id: rabbit.id, name: rabbit.name, field: 'tattooNumber', label: 'Tattoo Number' });
  if (!rabbit.variety) missing.push({ id: rabbit.id, name: rabbit.name, field: 'variety', label: 'Variety (Color)' });
  if (!rabbit.dob) missing.push({ id: rabbit.id, name: rabbit.name, field: 'dob', label: 'Date of Birth' });
  if (!rabbit.weightOz || rabbit.weightOz <= 0) missing.push({ id: rabbit.id, name: rabbit.name, field: 'weightOz', label: 'Weight (Ounces)' });
  if (!rabbit.sex) missing.push({ id: rabbit.id, name: rabbit.name, field: 'sex', label: 'Sex' });

  // Recurse parents
  if (rabbit.sireId) {
    const sire = allRabbits.find(r => r.id === rabbit.sireId);
    if (sire) missing.push(...scanPedigree(sire, allRabbits, depth + 1));
  }
  if (rabbit.damId) {
    const dam = allRabbits.find(r => r.id === rabbit.damId);
    if (dam) missing.push(...scanPedigree(dam, allRabbits, depth + 1));
  }
  return missing;
};

const parseEmailText = (text) => {
  const showNameMatch = text.match(/(?:Show|Show\s+Name)\s*:\s*([^\n\r]+)/i);
  const judgeMatch = text.match(/(?:Judge|Judge\s+Name)\s*:\s*([^\n\r]+)/i);
  const dateMatch = text.match(/(?:Date)\s*:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  const awardMatch = text.match(/(?:Award|Placement)\s*:\s*([^\n\r]+)/i);
  const sizeMatch = text.match(/(?:Class\s+Size|Size)\s*:\s*(\d+)/i);
  const tattooMatch = text.match(/(?:Rabbit|Tattoo|Tattoo\s+Number|Ear\s+Number)\s*:\s*([A-Za-z0-9-]+)/i);

  return {
    type: 'leg',
    showName: showNameMatch ? showNameMatch[1].trim() : '',
    judge: judgeMatch ? judgeMatch[1].trim() : '',
    date: dateMatch ? dateMatch[1].trim() : new Date().toISOString().split('T')[0],
    award: awardMatch ? awardMatch[1].trim() : '1st Class',
    classSize: sizeMatch ? Number(sizeMatch[1]) : 10,
    rabbitTattoo: tattooMatch ? tattooMatch[1].trim() : ''
  };
};

export default function App() {
  // adminBreeders list
  const [adminBreeders, setAdminBreeders] = useState(() => {
    const saved = localStorage.getItem('rp_admin_breeders');
    const defaultList = [
      { id: 'ab-admin', name: 'Jason Mounts', username: 'jmounts', email: 'jasonmounts77@yahoo.com', rabbitryName: '', phone: '', role: 'owner', isSuperAdmin: true, status: 'active', password: 'JakylieRabbitry4388$$' },
      { id: 'ab-1', name: 'Jason Miller', username: 'jmiller', email: 'jason@grandview.com', rabbitryName: 'Grandview Rabbitry', phone: '555-0101', role: 'owner', status: 'active', password: 'password123' },
      { id: 'ab-2', name: 'Sarah Connors', username: 'sconnors', email: 'sarah@arba.org', rabbitryName: 'Clover Barns', phone: '555-0102', role: 'owner', status: 'active', password: 'arba_pass_2026' },
      { id: 'ab-3', name: 'Tommy Pickles', username: 'tpickles', email: 'tommy@barn.com', rabbitryName: 'Grandview Rabbitry', phone: '555-0103', role: 'assistant', employerEmail: 'jason@grandview.com', employerStatus: 'active', status: 'active', password: 'feed_the_buns' },
      { id: 'ab-4', name: 'Emily Watson', username: 'ewatson', email: 'emily@rabbitry.net', rabbitryName: 'Blue Meadows', phone: '555-0104', role: 'owner', status: 'pending', password: 'passwordemily' },
      { id: 'ab-5', name: 'Arthur Pendragon', username: 'apendragon', email: 'arthur@camelot.com', rabbitryName: 'Excalibur Buns', phone: '555-0105', role: 'assistant', employerEmail: 'jason@grandview.com', employerStatus: 'pending', status: 'pending', password: 'merlinsrabbit' },
      { id: 'ab-6', name: 'Bruce Wayne', username: 'bwayne', email: 'bruce@batcave.org', rabbitryName: 'Wayne Manor Hutch', phone: '555-0106', role: 'owner', status: 'active', password: 'i_am_the_batman' },
      { id: 'ab-7', name: 'Sarah Jenkins', username: 'sjenkins', email: 'sarah.jenkins@farm.com', rabbitryName: 'Jenkins Giant Barn', phone: '555-0107', role: 'owner', status: 'active', password: 'password123' }
    ];
    let list = defaultList;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let filtered = parsed.filter(b => b.email.toLowerCase() !== 'admin@rabbitrypedigree.pro' && b.id !== 'ab-admin');
        
        // Merge missing default mock accounts
        defaultList.forEach(def => {
          if (def.id !== 'ab-admin' && !filtered.some(b => b.id === def.id)) {
            filtered.push(def);
          }
        });
        
        // Always prepend clean App Owner account
        filtered.unshift(defaultList[0]);
        list = filtered;
      } catch (e) {
        list = defaultList;
      }
    }
    // Strict Sanitization: Ensure ONLY ab-admin (jmounts) can ever have isSuperAdmin = true
    return list.map(b => {
      if (b.id === 'ab-admin') {
        return { 
          ...b, 
          name: b.name || 'Jason Mounts',
          username: 'jmounts',
          email: 'jasonmounts77@yahoo.com',
          role: 'owner',
          isSuperAdmin: true,
          status: 'active'
        };
      }
      const { isSuperAdmin, ...rest } = b;
      return { ...rest, isSuperAdmin: false };
    });
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState(() => {
    const email = localStorage.getItem('rp_logged_in_email');
    if (email) {
      const saved = localStorage.getItem('rp_admin_breeders');
      let list = [];
      const defaultList = [
        { id: 'ab-admin', name: 'Jason Mounts', username: 'jmounts', email: 'jasonmounts77@yahoo.com', rabbitryName: '', phone: '', role: 'owner', isSuperAdmin: true, status: 'active', password: 'JakylieRabbitry4388$$' },
        { id: 'ab-1', name: 'Jason Miller', username: 'jmiller', email: 'jason@grandview.com', rabbitryName: 'Grandview Rabbitry', phone: '555-0101', role: 'owner', status: 'active', password: 'password123' },
        { id: 'ab-2', name: 'Sarah Connors', username: 'sconnors', email: 'sarah@arba.org', rabbitryName: 'Clover Barns', phone: '555-0102', role: 'owner', status: 'active', password: 'arba_pass_2026' },
        { id: 'ab-3', name: 'Tommy Pickles', username: 'tpickles', email: 'tommy@barn.com', rabbitryName: 'Grandview Rabbitry', phone: '555-0103', role: 'assistant', employerEmail: 'jason@grandview.com', employerStatus: 'active', status: 'active', password: 'feed_the_buns' },
        { id: 'ab-4', name: 'Emily Watson', username: 'ewatson', email: 'emily@rabbitry.net', rabbitryName: 'Blue Meadows', phone: '555-0104', role: 'owner', status: 'pending', password: 'passwordemily' },
        { id: 'ab-5', name: 'Arthur Pendragon', username: 'apendragon', email: 'arthur@camelot.com', rabbitryName: 'Excalibur Buns', phone: '555-0105', role: 'assistant', employerEmail: 'jason@grandview.com', employerStatus: 'pending', status: 'pending', password: 'merlinsrabbit' },
        { id: 'ab-6', name: 'Bruce Wayne', username: 'bwayne', email: 'bruce@batcave.org', rabbitryName: 'Wayne Manor Hutch', phone: '555-0106', role: 'owner', status: 'active', password: 'i_am_the_batman' },
        { id: 'ab-7', name: 'Sarah Jenkins', username: 'sjenkins', email: 'sarah.jenkins@farm.com', rabbitryName: 'Jenkins Giant Barn', phone: '555-0107', role: 'owner', status: 'active', password: 'password123' }
      ];
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          let filtered = parsed.filter(b => b.email.toLowerCase() !== 'admin@rabbitrypedigree.pro' && b.id !== 'ab-admin');
          
          defaultList.forEach(def => {
            if (def.id !== 'ab-admin' && !filtered.some(b => b.id === def.id)) {
              filtered.push(def);
            }
          });
          
          filtered.unshift(defaultList[0]);
          list = filtered;
        } catch (e) {
          list = defaultList;
        }
      } else {
        list = defaultList;
      }
      // Strict Sanitization: Ensure ONLY ab-admin (jmounts) can ever have isSuperAdmin = true
      const cleaned = list.map(b => {
        if (b.id === 'ab-admin') {
          return { 
            ...b, 
            name: b.name || 'Jason Mounts',
            username: 'jmounts',
            email: 'jasonmounts77@yahoo.com',
            role: 'owner',
            isSuperAdmin: true,
            status: 'active'
          };
        }
        const { isSuperAdmin, ...rest } = b;
        return { ...rest, isSuperAdmin: false };
      });
      return cleaned.find(b => (b.email.toLowerCase() === email.toLowerCase() || (b.username && b.username.toLowerCase() === email.toLowerCase())) && b.status === 'active') || null;
    }
    return null;
  });

  // Selected Breeder Database Context for App Owner / Multi-Tenant visibility
  const [selectedBreederContext, setSelectedBreederContext] = useState(() => {
    const email = localStorage.getItem('rp_logged_in_email');
    if (email) {
      if (email.toLowerCase() === 'jasonmounts77@yahoo.com' || email.toLowerCase() === 'jmounts') {
        const savedCtx = localStorage.getItem('rp_selected_context');
        return (savedCtx && savedCtx !== 'all') ? savedCtx : 'ab-admin';
      }
      const saved = localStorage.getItem('rp_admin_breeders');
      let list = [];
      const defaultList = [
        { id: 'ab-admin', name: 'Jason Mounts', username: 'jmounts', email: 'jasonmounts77@yahoo.com', rabbitryName: '', phone: '', role: 'owner', isSuperAdmin: true, status: 'active', password: 'JakylieRabbitry4388$$' },
        { id: 'ab-1', name: 'Jason Miller', username: 'jmiller', email: 'jason@grandview.com', rabbitryName: 'Grandview Rabbitry', phone: '555-0101', role: 'owner', status: 'active', password: 'password123' },
        { id: 'ab-2', name: 'Sarah Connors', username: 'sconnors', email: 'sarah@arba.org', rabbitryName: 'Clover Barns', phone: '555-0102', role: 'owner', status: 'active', password: 'arba_pass_2026' }
      ];
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          let filtered = parsed.filter(b => b.email.toLowerCase() !== 'admin@rabbitrypedigree.pro' && b.id !== 'ab-admin');
          
          defaultList.forEach(def => {
            if (def.id !== 'ab-admin' && !filtered.some(b => b.id === def.id)) {
              filtered.push(def);
            }
          });
          
          filtered.unshift(defaultList[0]);
          list = filtered;
        } catch (e) {
          list = defaultList;
        }
      } else {
        list = defaultList;
      }
      // Strict Sanitization: Ensure ONLY ab-admin (jmounts) can ever have isSuperAdmin = true
      const cleaned = list.map(b => {
        if (b.id === 'ab-admin') {
          return { 
            ...b, 
            name: b.name || 'Jason Mounts',
            username: 'jmounts',
            email: 'jasonmounts77@yahoo.com',
            role: 'owner',
            isSuperAdmin: true,
            status: 'active'
          };
        }
        const { isSuperAdmin, ...rest } = b;
        return { ...rest, isSuperAdmin: false };
      });
      const u = cleaned.find(b => (b.email.toLowerCase() === email.toLowerCase() || (b.username && b.username.toLowerCase() === email.toLowerCase())) && b.status === 'active');
      return u ? u.id : 'ab-1';
    }
    return 'ab-1';
  });

  // Onboarding profile status derived from currentUser
  const hasProfile = currentUser !== null;

  // Authentication Views: 'login', 'signup', 'forgot-password', 'reset-password', 'pending-approval'
  const [authView, setAuthView] = useState('login');

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Forgot Password inputs
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLink, setForgotLink] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Reset Password inputs
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Show/Hide password states for credentials forms
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [showMyPassword, setShowMyPassword] = useState(false);
  const [myPasswordVal, setMyPasswordVal] = useState('');

  // Onboarding profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    rabbitryName: 'Grandview Rabbitry',
    role: 'owner', // 'owner' or 'assistant'
    logo: '🐇',
    theme: 'dark', // Defaults to Midnight Obsidian Dark Theme
    isYouth: false,
    parentName: '',
    parentEmail: '',
    agreeHipaa: false,
    employerAccountNumber: '',
    employerStatus: 'pending'
  });

  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('rp_theme') || 'dark');
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Customization settings
  const [rabbitryLogo, setRabbitryLogo] = useState(() => localStorage.getItem('rp_logo') || '🐇');
  const [rabbitryName, setRabbitryName] = useState(() => localStorage.getItem('rp_rabbitry_name') || 'Grandview Rabbitry');
  
  // Customizable Dashboard Widgets
  const [dashboardWidgets, setDashboardWidgets] = useState(() => {
    const saved = localStorage.getItem('rp_dash_widgets');
    return saved ? JSON.parse(saved) : { stats: true, alerts: true, actions: true, checklist: true };
  });

  // Mascot Reward Pop-up State
  const [successMascot, setSuccessMascot] = useState(null);

  // Pedigree Builder Modals & Interaction States
  const [pedigreeEditNode, setPedigreeEditNode] = useState(null); // { rabbitId, gender, label, currentId, isOffspring }
  const [showPrintPedigreeModal, setShowPrintPedigreeModal] = useState(null); // rabbit object
  const [showEmailImportModal, setShowEmailImportModal] = useState(false);
  const [emailImportText, setEmailImportText] = useState('');
  const [emailImportPreview, setEmailImportPreview] = useState(null); // parsed details to confirm
  const [controlCenterUnlocked, setControlCenterUnlocked] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [arbaMemberNumber, setArbaMemberNumber] = useState(() => currentUser?.arbaMemberNumber || '');

  const [nodeForm, setNodeForm] = useState({
    tattooNumber: '', name: '', breed: '', variety: '',
    weightOz: 40, dob: '', registrationNumber: '', gcNumber: '', notes: '', legs: []
  });
  const [nodeFormType, setNodeFormType] = useState('new');
  const [selectedExistingId, setSelectedExistingId] = useState('');
  const [newAncestorLeg, setNewAncestorLeg] = useState({
    showName: '', judge: '', date: new Date().toISOString().split('T')[0], award: '1st Class', classSize: ''
  });



  // Auto-dismiss Success Mascot popup after 4 seconds
  useEffect(() => {
    if (successMascot) {
      const timer = setTimeout(() => {
        setSuccessMascot(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMascot]);

  // Data State (Partitioned by breederId)
  const [allRabbits, setAllRabbits] = useState(() => {
    const saved = localStorage.getItem('rp_rabbits');
    const defaultList = [
      { 
        id: 'r-1', breederId: 'ab-1', tattooNumber: 'S01', name: 'Blue Thunder', breed: 'Holland Lop', variety: 'Blue', sex: 'buck', dob: '2025-01-10', weightOz: 60, status: 'active', sireId: 'r-4', damId: 'r-5', inbreedingCoeff: 0.0, registrationNumber: 'REG-12345', gcNumber: 'GC-5544', location: 'A-01', notes: 'Proven sire, extremely calm.',
        photos: ['/assets/holland_lop.png'],
        legs: [{ id: 'leg-1', date: '2025-09-15', showName: 'ARBA National Show', judge: 'Dr. John Miller', award: 'Best of Variety', classSize: 24 }]
      },
      { 
        id: 'r-2', breederId: 'ab-1', tattooNumber: 'D01', name: 'Clover Blossom', breed: 'Holland Lop', variety: 'Broken Blue', sex: 'doe', dob: '2025-02-15', weightOz: 62, status: 'active', sireId: 'r-4', damId: 'r-7', inbreedingCoeff: 0.0, registrationNumber: 'REG-12346', gcNumber: '', location: 'A-02', notes: 'Excellent mothering instincts.',
        photos: ['/assets/holland_lop.png'],
        legs: []
      },
      { 
        id: 'r-3', breederId: 'ab-1', tattooNumber: 'L43-1', name: 'Blue Pearl', breed: 'Holland Lop', variety: 'Blue', sex: 'doe', dob: '2026-03-01', weightOz: 38, status: 'active', sireId: 'r-1', damId: 'r-2', inbreedingCoeff: 0.125, registrationNumber: '', gcNumber: '', location: 'B-04', notes: 'Nice hutch variety with rich blue undercoat.',
        photos: ['/assets/holland_lop.png'],
        legs: []
      },
      {
        id: 'r-4', breederId: 'ab-1', tattooNumber: 'SR01', name: 'Storm Rider', breed: 'Holland Lop', variety: 'Blue', sex: 'buck', dob: '2024-03-10', weightOz: 61, status: 'active', sireId: 'r-8', damId: 'r-9', inbreedingCoeff: 0.0, registrationNumber: 'REG-11022', gcNumber: '', location: 'C-01', notes: 'Sired multiple champions.',
        photos: ['/assets/holland_lop.png'],
        legs: [{ id: 'leg-2', date: '2025-10-05', showName: 'West Coast Rabbit Classic', judge: 'Carla Sanchez', award: 'Best of Breed', classSize: 18 }]
      },
      {
        id: 'r-5', breederId: 'ab-1', tattooNumber: 'SD01', name: 'Sky Dancer', breed: 'Holland Lop', variety: 'Blue', sex: 'doe', dob: '2024-04-12', weightOz: 59, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'C-02', notes: 'Very gentle temperament.',
        photos: ['/assets/holland_lop.png'],
        legs: []
      },
      {
        id: 'r-6', breederId: 'ab-1', tattooNumber: 'FR01', name: 'Forest Ranger', breed: 'Holland Lop', variety: 'Broken Blue', sex: 'buck', dob: '2024-02-18', weightOz: 63, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-11023', gcNumber: '', location: 'C-03', notes: 'Broad shoulders, compact body.',
        photos: ['/assets/holland_lop.png'],
        legs: []
      },
      {
        id: 'r-7', breederId: 'ab-1', tattooNumber: 'MB01', name: 'Meadow Breeze', breed: 'Holland Lop', variety: 'Blue', sex: 'doe', dob: '2024-03-22', weightOz: 60, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'C-04', notes: 'Deep blue coat, great fur density.',
        photos: ['/assets/holland_lop.png'],
        legs: []
      },
      {
        id: 'r-8', breederId: 'ab-1', tattooNumber: 'ZB01', name: 'Zephyr Buck', breed: 'Holland Lop', variety: 'Blue', sex: 'buck', dob: '2023-01-05', weightOz: 62, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-9988', gcNumber: 'GC-2211', location: 'D-01', notes: 'Grand Champion line progenitor.',
        photos: ['/assets/holland_lop.png'],
        legs: [{ id: 'leg-3', date: '2024-11-20', showName: 'Cascade Winter Show', judge: 'Robert Devlin', award: 'Best In Show', classSize: 42 }]
      },
      {
        id: 'r-9', breederId: 'ab-1', tattooNumber: 'OD01', name: 'Orchard Doe', breed: 'Holland Lop', variety: 'Blue', sex: 'doe', dob: '2023-02-14', weightOz: 61, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-9989', gcNumber: '', location: 'D-02', notes: 'High fertility history.',
        photos: ['/assets/holland_lop.png'],
        legs: []
      },
      { 
        id: 'r-10', breederId: 'ab-7', tattooNumber: 'FG01', name: 'Titan Rex', breed: 'Flemish Giant', variety: 'Sandy', sex: 'buck', dob: '2025-03-01', weightOz: 240, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-FG991', gcNumber: 'GC-FG101', location: 'Cage-G1', notes: 'Massive sandy buck, ARBA show winner.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
        legs: [{ id: 'leg-fg1', date: '2025-11-10', showName: 'National Flemish Giant Show', judge: 'Reginald Vance', award: 'Best of Breed', classSize: 32 }]
      },
      { 
        id: 'r-11', breederId: 'ab-7', tattooNumber: 'FG02', name: 'Queen Freya', breed: 'Flemish Giant', variety: 'Steel', sex: 'doe', dob: '2025-04-12', weightOz: 256, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-FG992', gcNumber: '', location: 'Cage-G2', notes: 'Extremely fertile steel doe. Excellent size.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
        legs: []
      },
      { 
        id: 'r-12', breederId: 'ab-7', tattooNumber: 'FG-L1', name: 'Freya Junior', breed: 'Flemish Giant', variety: 'Sandy', sex: 'doe', dob: '2026-04-05', weightOz: 112, status: 'active', sireId: 'r-10', damId: 'r-11', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'Cage-G3', notes: 'Junior doe showing excellent bone development.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
        legs: []
      },
      { 
        id: 'r-20', breederId: 'ab-6', tattooNumber: 'BAT01', name: 'Midnight Knight', breed: 'Netherland Dwarf', variety: 'Black', sex: 'buck', dob: '2025-05-20', weightOz: 36, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-ND441', gcNumber: 'GC-BAT1', location: 'Cave-1', notes: 'Compact buck, very dark glossy coat.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
        legs: [{ id: 'leg-nd1', date: '2026-02-15', showName: 'Gotham Rabbit Classic', judge: 'Harvey Dent', award: 'Best In Show', classSize: 15 }]
      },
      { 
        id: 'r-21', breederId: 'ab-6', tattooNumber: 'CAT01', name: 'Selina Doe', breed: 'Netherland Dwarf', variety: 'Sable Point', sex: 'doe', dob: '2025-06-14', weightOz: 38, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-ND442', gcNumber: '', location: 'Cave-2', notes: 'Sleek, highly active sable point doe.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
        legs: []
      },
      { 
        id: 'r-22', breederId: 'ab-6', tattooNumber: 'BAT02', name: 'Bat-signalBEW', breed: 'Netherland Dwarf', variety: 'Blue Eyed White', sex: 'doe', dob: '2025-08-01', weightOz: 34, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-ND443', gcNumber: '', location: 'Cave-3', notes: 'Striking blue eyed white doe.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
        legs: []
      },
      { 
        id: 'r-23', breederId: 'ab-6', tattooNumber: 'BAT03', name: 'Robin BEW', breed: 'Netherland Dwarf', variety: 'Blue Eyed White', sex: 'buck', dob: '2026-02-10', weightOz: 32, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'Cave-4', notes: 'Vigorous junior BEW buck.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
        legs: []
      },
      { 
        id: 'r-24', breederId: 'ab-6', tattooNumber: 'BAT-L1', name: 'Bat-girl ND', breed: 'Netherland Dwarf', variety: 'Black', sex: 'doe', dob: '2026-05-01', weightOz: 16, status: 'active', sireId: 'r-20', damId: 'r-21', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'Cave-5', notes: 'Junior black doe. High potential.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
        legs: []
      },
      { 
        id: 'r-13', breederId: 'ab-7', tattooNumber: 'FG03', name: 'Thor Sandy', breed: 'Flemish Giant', variety: 'Sandy', sex: 'buck', dob: '2025-08-20', weightOz: 232, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-FG993', gcNumber: '', location: 'Cage-G4', notes: 'Strong sand variety buck.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
        legs: []
      },
      { 
        id: 'r-14', breederId: 'ab-7', tattooNumber: 'FG04', name: 'Loki Steel', breed: 'Flemish Giant', variety: 'Steel', sex: 'doe', dob: '2025-09-10', weightOz: 248, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-FG994', gcNumber: '', location: 'Cage-G5', notes: 'Sleek steel Flemish Giant doe.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
        legs: []
      },
      { 
        id: 'r-30', breederId: 'ab-2', tattooNumber: 'CL01', name: 'Clover Opal', breed: 'Mini Rex', variety: 'Opal', sex: 'doe', dob: '2025-05-10', weightOz: 58, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-MR101', gcNumber: '', location: 'C-10', notes: 'Very soft opal coat.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
        legs: []
      },
      { 
        id: 'r-31', breederId: 'ab-2', tattooNumber: 'CL02', name: 'Castor King', breed: 'Mini Rex', variety: 'Castor', sex: 'buck', dob: '2025-02-12', weightOz: 60, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: 'REG-MR102', gcNumber: 'GC-MR01', location: 'C-11', notes: 'Grand Champion lineage castor buck.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
        legs: [{ id: 'leg-mr1', date: '2025-11-20', showName: 'Midwest Mini Rex Specialty', judge: 'Adam West', award: 'Best of Variety', classSize: 15 }]
      },
      { 
        id: 'r-32', breederId: 'ab-2', tattooNumber: 'CL03', name: 'Clover Shadow', breed: 'Mini Rex', variety: 'Black', sex: 'doe', dob: '2025-06-01', weightOz: 56, status: 'active', sireId: '', damId: '', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'C-12', notes: 'Jet black plush coat.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
        legs: []
      },
      { 
        id: 'r-33', breederId: 'ab-2', tattooNumber: 'CL-L1', name: 'Clover Velvet', breed: 'Mini Rex', variety: 'Castor', sex: 'doe', dob: '2026-03-15', weightOz: 35, status: 'active', sireId: 'r-31', damId: 'r-30', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'C-13', notes: 'Promising castor junior doe.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
        legs: []
      },
      { 
        id: 'r-34', breederId: 'ab-2', tattooNumber: 'CL-L2', name: 'Clover Prince', breed: 'Mini Rex', variety: 'Castor', sex: 'buck', dob: '2026-03-15', weightOz: 36, status: 'active', sireId: 'r-31', damId: 'r-30', inbreedingCoeff: 0.0, registrationNumber: '', gcNumber: '', location: 'C-14', notes: 'Energetic castor junior buck.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
        legs: []
      }
    ];
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        // Clean/Migrate existing ab-admin records to ab-7 (Sarah Jenkins)
        parsed = parsed.map(r => r.breederId === 'ab-admin' ? { ...r, breederId: 'ab-7' } : r);
        // Merge missing default mock data
        defaultList.forEach(def => {
          if (!parsed.some(r => r.id === def.id)) {
            parsed.push(def);
          }
        });
        return parsed;
      } catch (e) {
        return defaultList;
      }
    }
    return defaultList;
  });
  const rabbits = allRabbits.filter(r => selectedBreederContext === 'all' || r.breederId === selectedBreederContext);

  const [allBreedings, setAllBreedings] = useState(() => {
    const saved = localStorage.getItem('rp_breedings');
    const defaultBreedings = [
      { id: 'b-1', breederId: 'ab-1', buckId: 'r-1', doeId: 'r-2', breedDate: '2026-05-01', palpateDate: '2026-05-13', palpateResult: true, nestBoxDate: '2026-05-28', kindleDate: '2026-06-01', status: 'kindled' },
      { id: 'b-2', breederId: 'ab-1', buckId: 'r-4', doeId: 'r-5', breedDate: '2026-06-01', palpateDate: '2026-06-13', palpateResult: null, nestBoxDate: '2026-06-29', kindleDate: '2026-07-02', status: 'bred' },
      { id: 'b-3', breederId: 'ab-1', buckId: 'r-6', doeId: 'r-7', breedDate: '2026-04-10', palpateDate: '2026-04-22', palpateResult: true, nestBoxDate: '2026-05-08', kindleDate: '2026-05-11', status: 'kindled' },
      { id: 'b-4', breederId: 'ab-1', buckId: 'r-8', doeId: 'r-9', breedDate: '2026-05-20', palpateDate: '2026-06-01', palpateResult: true, nestBoxDate: '2026-06-17', kindleDate: '2026-06-20', status: 'palpated_positive' },
      { id: 'b-fg1', breederId: 'ab-7', buckId: 'r-10', doeId: 'r-11', breedDate: '2026-03-01', palpateDate: '2026-03-13', palpateResult: true, nestBoxDate: '2026-03-28', kindleDate: '2026-04-05', status: 'kindled' },
      { id: 'b-nd1', breederId: 'ab-6', buckId: 'r-20', doeId: 'r-21', breedDate: '2026-05-10', palpateDate: '2026-05-22', palpateResult: true, nestBoxDate: '2026-06-07', kindleDate: null, status: 'palpated_positive' },
      { id: 'b-rc1', breederId: 'ab-2', buckId: 'r-31', doeId: 'r-30', breedDate: '2026-02-10', palpateDate: '2026-02-22', palpateResult: true, nestBoxDate: '2026-03-09', kindleDate: '2026-03-15', status: 'kindled' },
      { id: 'b-rc2', breederId: 'ab-2', buckId: 'r-31', doeId: 'r-32', breedDate: '2026-06-05', palpateDate: '2026-06-17', palpateResult: null, nestBoxDate: '2026-07-02', kindleDate: '2026-07-06', status: 'bred' },
      { id: 'b-nd2', breederId: 'ab-6', buckId: 'r-20', doeId: 'r-21', breedDate: '2026-04-01', palpateDate: '2026-04-13', palpateResult: true, nestBoxDate: '2026-04-28', kindleDate: '2026-05-01', status: 'kindled' },
      { id: 'b-fg2', breederId: 'ab-7', buckId: 'r-13', doeId: 'r-14', breedDate: '2026-05-12', palpateDate: '2026-05-24', palpateResult: true, nestBoxDate: '2026-06-08', kindleDate: '2026-06-11', status: 'kindled' }
    ];
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        parsed = parsed.map(b => b.breederId === 'ab-admin' ? { ...b, breederId: 'ab-7' } : b);
        defaultBreedings.forEach(def => {
          if (!parsed.some(b => b.id === def.id)) {
            parsed.push(def);
          }
        });
        return parsed;
      } catch (e) {
        return defaultBreedings;
      }
    }
    return defaultBreedings;
  });
  const breedings = allBreedings.filter(b => selectedBreederContext === 'all' || b.breederId === selectedBreederContext);

  const [allLitters, setAllLitters] = useState(() => {
    const saved = localStorage.getItem('rp_litters');
    const defaultLitters = [
      { id: 'l-1', breederId: 'ab-1', breedingId: 'b-1', kitsBornAlive: 6, kitsBornDead: 1, kitsWeaned: 5, notes: 'Thriving and active.' },
      { id: 'l-2', breederId: 'ab-1', breedingId: 'b-3', kitsBornAlive: 5, kitsBornDead: 0, kitsWeaned: 5, notes: 'Excellent weight gain, very healthy litter.' },
      { id: 'l-fg1', breederId: 'ab-7', breedingId: 'b-fg1', kitsBornAlive: 8, kitsBornDead: 1, kitsWeaned: 7, notes: 'Flemish Giant litter grew extremely fast. Freya junior is from this litter.' },
      { id: 'l-rc1', breederId: 'ab-2', breedingId: 'b-rc1', kitsBornAlive: 5, kitsBornDead: 0, kitsWeaned: 4, notes: 'Very sweet Mini Rex kits. Velvet and Prince are from this breeding.' },
      { id: 'l-nd2', breederId: 'ab-6', breedingId: 'b-nd2', kitsBornAlive: 3, kitsBornDead: 1, kitsWeaned: 2, notes: 'Bat-girl ND is from this litter.' },
      { id: 'l-fg2', breederId: 'ab-7', breedingId: 'b-fg2', kitsBornAlive: 7, kitsBornDead: 1, kitsWeaned: 6, notes: 'Flemish Giant sandy and steel kits growing fast.' }
    ];
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        parsed = parsed.map(l => l.breederId === 'ab-admin' ? { ...l, breederId: 'ab-7' } : l);
        defaultLitters.forEach(def => {
          if (!parsed.some(l => l.id === def.id)) {
            parsed.push(def);
          }
        });
        return parsed;
      } catch (e) {
        return defaultLitters;
      }
    }
    return defaultLitters;
  });
  const litters = allLitters.filter(l => selectedBreederContext === 'all' || l.breederId === selectedBreederContext);

  const [allLedger, setAllLedger] = useState(() => {
    const saved = localStorage.getItem('rp_ledger');
    const defaultLedger = [
      { id: 'lt-1', breederId: 'ab-1', date: '2026-06-01', type: 'income', amount: 150.00, category: 'sale', rabbitId: 'r-3', notes: 'Sold Blue Pearl.' },
      { id: 'lt-2', breederId: 'ab-1', date: '2026-06-05', type: 'expense', amount: 45.50, category: 'feed', rabbitId: '', notes: 'Purchased two bags of alfalfa feed pellets.' },
      { id: 'lt-3', breederId: 'ab-1', date: '2026-05-10', type: 'expense', amount: 20.00, category: 'show_fee', rabbitId: '', notes: 'ARBA Spring Show registration fee.' },
      { id: 'lt-4', breederId: 'ab-1', date: '2026-05-12', type: 'income', amount: 80.00, category: 'sale', rabbitId: '', notes: 'Sold junior pet buck.' },
      { id: 'lt-5', breederId: 'ab-1', date: '2026-05-15', type: 'expense', amount: 35.00, category: 'equipment', rabbitId: '', notes: 'New automatic water nozzle system.' },
      { id: 'lt-6', breederId: 'ab-1', date: '2026-05-25', type: 'expense', amount: 12.00, category: 'medical', rabbitId: '', notes: 'VetRx respiratory treatment oil.' },
      { id: 'lt-7', breederId: 'ab-1', date: '2026-06-08', type: 'income', amount: 200.00, category: 'sale', rabbitId: '', notes: 'Sold proven senior show doe.' },
      { id: 'lt-fg1', breederId: 'ab-7', date: '2026-05-15', type: 'income', amount: 150.00, category: 'sale', rabbitId: '', notes: 'Sold Flemish Giant junior buck.' },
      { id: 'lt-fg2', breederId: 'ab-7', date: '2026-06-02', type: 'expense', amount: 85.00, category: 'feed', rabbitId: '', notes: 'Bulk purchase of high-protein giant breed feed.' },
      { id: 'lt-fg3', breederId: 'ab-7', date: '2026-06-12', type: 'income', amount: 100.00, category: 'other', rabbitId: '', notes: 'ARBA Flemish Giant Best of Breed Cash Award.' },
      { id: 'lt-bat1', breederId: 'ab-6', date: '2026-05-28', type: 'expense', amount: 300.00, category: 'equipment', rabbitId: '', notes: 'Cave-optimized LED hutch lighting.' },
      { id: 'lt-bat2', breederId: 'ab-6', date: '2026-06-10', type: 'income', amount: 400.00, category: 'sale', rabbitId: '', notes: 'Sold champion lineage Netherland Dwarf buck.' },
      { id: 'lt-rc1', breederId: 'ab-2', date: '2026-05-20', type: 'income', amount: 120.00, category: 'sale', rabbitId: '', notes: 'Sold a castor junior buck.' },
      { id: 'lt-rc2', breederId: 'ab-2', date: '2026-05-22', type: 'expense', amount: 35.00, category: 'feed', notes: 'Mini Rex feed bags.' },
      { id: 'lt-rc3', breederId: 'ab-2', date: '2026-06-01', type: 'expense', amount: 15.00, category: 'show_fee', notes: 'Rex Specialty registration fee.' },
      { id: 'lt-bat3', breederId: 'ab-6', date: '2026-05-05', type: 'income', amount: 250.00, category: 'sale', notes: 'Sold BEW junior buck.' },
      { id: 'lt-bat4', breederId: 'ab-6', date: '2026-06-02', type: 'expense', amount: 65.00, category: 'feed', notes: 'Netherland Dwarf special pellets.' },
      { id: 'lt-fg4', breederId: 'ab-7', date: '2026-05-18', type: 'expense', amount: 45.00, category: 'medical', notes: 'Nail clippers & ear mite preventative drops.' },
      { id: 'lt-fg5', breederId: 'ab-7', date: '2026-06-10', type: 'income', amount: 180.00, category: 'sale', notes: 'Sold steel Flemish giant junior doe.' }
    ];
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        parsed = parsed.map(lt => lt.breederId === 'ab-admin' ? { ...lt, breederId: 'ab-7' } : lt);
        defaultLedger.forEach(def => {
          if (!parsed.some(lt => lt.id === def.id)) {
            parsed.push(def);
          }
        });
        return parsed;
      } catch (e) {
        return defaultLedger;
      }
    }
    return defaultLedger;
  });
  const ledger = allLedger.filter(lt => selectedBreederContext === 'all' || lt.breederId === selectedBreederContext);

  const [allShows, setAllShows] = useState(() => {
    const saved = localStorage.getItem('rp_shows');
    const defaultShows = [
      { id: 'show-1', breederId: 'ab-1', name: 'ARBA National Convention 2026', date: '2026-10-24', location: 'Indianapolis, IN', notes: 'Largest national event. Target all senior bucks.', status: 'interested', notifyDays: 14 },
      { id: 'show-2', breederId: 'ab-1', name: 'West Coast Rabbit Classic', date: '2026-07-20', location: 'Stockton, CA', notes: 'Local regional show. Register 4 Holland Lops.', status: 'attending', notifyDays: 7 },
      { id: 'show-3', breederId: 'ab-1', name: 'Mid-Summer Rabbit Show', date: '2026-08-15', location: 'Columbus, OH', notes: 'Hobbyist meet and show.', status: 'not_attending', notifyDays: 7 },
      { id: 'show-fg1', breederId: 'ab-7', name: 'ARBA National Flemish Giant Show', date: '2026-07-10', location: 'Indianapolis, IN', notes: 'Entering Titan Rex.', status: 'attending', notifyDays: 14 },
      { id: 'show-fg2', breederId: 'ab-7', name: 'Summer Giant Breeds Specialty', date: '2026-08-05', location: 'Lansing, MI', notes: 'Check weights for Freya Junior.', status: 'interested', notifyDays: 14 },
      { id: 'show-bat1', breederId: 'ab-6', name: 'Gotham Rabbit Classic', date: '2026-07-15', location: 'Gotham City', notes: 'Midnight Knight defending title.', status: 'attending', notifyDays: 7 },
      { id: 'show-rc1', breederId: 'ab-2', name: 'Midwest Mini Rex Specialty', date: '2026-07-12', location: 'Fort Wayne, IN', notes: 'Targeting Best Castor.', status: 'attending', notifyDays: 14 },
      { id: 'show-rc2', breederId: 'ab-2', name: 'Ohio State Rabbit Convention 2026', date: '2026-09-18', location: 'Columbus, OH', notes: 'Exhibiting Clover Shadow.', status: 'interested', notifyDays: 14 },
      { id: 'show-bat2', breederId: 'ab-6', name: 'Metropolis Dwarf Showdown', date: '2026-08-20', location: 'Metropolis Coliseum', notes: 'Entering Robin BEW in junior class.', status: 'interested', notifyDays: 14 },
      { id: 'show-fg3', breederId: 'ab-7', name: 'Great Lakes Giant Breeders Fair', date: '2026-09-02', location: 'Grand Rapids, MI', notes: 'Entering Thor Sandy.', status: 'attending', notifyDays: 14 }
    ];
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        parsed = parsed.map(s => s.breederId === 'ab-admin' ? { ...s, breederId: 'ab-7' } : s);
        defaultShows.forEach(def => {
          if (!parsed.some(s => s.id === def.id)) {
            parsed.push(def);
          }
        });
        return parsed;
      } catch (e) {
        return defaultShows;
      }
    }
    return defaultShows;
  });
  const shows = allShows.filter(s => selectedBreederContext === 'all' || s.breederId === selectedBreederContext);

  const [allChores, setAllChores] = useState(() => {
    const saved = localStorage.getItem('rp_chores');
    const defaultChores = [
      { id: 'ch-1', breederId: 'ab-1', taskName: 'Alfalfa Pellet Feeding', completed: false },
      { id: 'ch-2', breederId: 'ab-1', taskName: 'Water System Pressure Check', completed: false },
      { id: 'ch-3', breederId: 'ab-1', taskName: 'Sweep Hutch Aisles', completed: false },
      { id: 'ch-4', breederId: 'ab-2', taskName: 'Castor Variety Grooming', completed: false },
      { id: 'ch-5', breederId: 'ab-2', taskName: 'Refill Alfalfa Feed Hay', completed: false },
      { id: 'ch-6', breederId: 'ab-6', taskName: 'BEW Nestbox Inspections', completed: false },
      { id: 'ch-7', breederId: 'ab-6', taskName: 'Clean Dwarf Hutch Cage Trays', completed: false },
      { id: 'ch-8', breederId: 'ab-7', taskName: 'Flemish Giant Weight Logs', completed: false },
      { id: 'ch-9', breederId: 'ab-7', taskName: 'Clean Giant Breeding Enclosures', completed: false }
    ];
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        parsed = parsed.map(c => c.breederId === 'ab-admin' ? { ...c, breederId: 'ab-7' } : c);
        defaultChores.forEach(def => {
          if (!parsed.some(c => c.id === def.id)) {
            parsed.push(def);
          }
        });
        return parsed;
      } catch (e) {
        return defaultChores;
      }
    }
    return defaultChores;
  });
  const chores = allChores.filter(c => selectedBreederContext === 'all' || c.breederId === selectedBreederContext);

  // Assistant write-only scoping check
  const isAssistantWriteOnly = currentUser?.role === 'assistant' && selectedBreederContext !== currentUser?.id;

  // Sales/Transfers States
  const [allTransfers, setAllTransfers] = useState(() => {
    const saved = localStorage.getItem('rp_transfers');
    const defaultTransfers = [
      {
        id: 'tx-1',
        breederId: 'ab-1', // Jason Miller
        rabbitId: 'r-3',
        rabbitName: 'Blue Pearl',
        rabbitTattoo: 'L43-1',
        rabbitBreed: 'Holland Lop',
        buyerName: 'Alice Watson',
        buyerEmail: 'alice@watsonrabbitry.com',
        buyerPhone: '555-0199',
        price: 150.00,
        type: 'sale',
        date: '2026-06-05',
        certificateId: 'TX-8821-4902',
        hash: '8f7d9a10c9b5e3f412ad8e92f2c8d203a5b0eef2a95c4786d1a91e5c43d8f822'
      },
      {
        id: 'tx-2',
        breederId: 'ab-7', // Sarah Jenkins
        rabbitId: 'r-fg2',
        rabbitName: 'Titan Freya',
        rabbitTattoo: 'FG-02',
        rabbitBreed: 'Flemish Giant',
        buyerName: 'Bob Vance',
        buyerEmail: 'bob@vancerefrigeration.com',
        buyerPhone: '555-0144',
        price: 250.00,
        type: 'sale',
        date: '2026-06-12',
        certificateId: 'TX-1049-7721',
        hash: 'a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3'
      }
    ];
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        defaultTransfers.forEach(def => {
          if (!parsed.some(t => t.id === def.id)) {
            parsed.push(def);
          }
        });
        return parsed;
      } catch (e) {
        return defaultTransfers;
      }
    }
    return defaultTransfers;
  });
  const [allSignatures, setAllSignatures] = useState(() => {
    const saved = localStorage.getItem('rp_signatures');
    const defaultSignatures = [
      {
        id: 'sig-1',
        transferId: 'tx-1',
        sellerSignature: 'Jason Miller',
        buyerSignature: 'Alice Watson',
        signedAt: '2026-06-05T14:30:00Z',
        sellerSignatureType: 'typed',
        buyerSignatureType: 'typed'
      },
      {
        id: 'sig-2',
        transferId: 'tx-2',
        sellerSignature: 'Sarah Jenkins',
        buyerSignature: 'Bob Vance',
        signedAt: '2026-06-12T10:15:00Z',
        sellerSignatureType: 'typed',
        buyerSignatureType: 'typed'
      }
    ];
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        defaultSignatures.forEach(def => {
          if (!parsed.some(s => s.id === def.id)) {
            parsed.push(def);
          }
        });
        return parsed;
      } catch (e) {
        return defaultSignatures;
      }
    }
    return defaultSignatures;
  });
  const [showTransferWizard, setShowTransferWizard] = useState(null); // rabbit object
  const [transferWizardStep, setTransferWizardStep] = useState(1);
  const [buyerDetails, setBuyerDetails] = useState({ name: '', email: '', phone: '', price: '', type: 'sale', notes: '' });
  const [sellerSignature, setSellerSignature] = useState('');
  const [buyerSignature, setBuyerSignature] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Offline Sync State
  const [isOffline, setIsOffline] = useState(false);
  const [syncQueue, setSyncQueue] = useState(() => {
    const saved = localStorage.getItem('rp_sync_queue');
    return saved ? JSON.parse(saved) : [];
  });

  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Last Saved Chores Timestamp
  const [lastChoresSavedTime, setLastChoresSavedTime] = useState(() => {
    return localStorage.getItem('rp_last_chores_saved') || 'Never';
  });

  useEffect(() => {
    localStorage.setItem('rp_last_chores_saved', lastChoresSavedTime);
  }, [lastChoresSavedTime]);

  // Active inputs / Modals
  const [showAddRabbit, setShowAddRabbit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRabbit, setSelectedRabbit] = useState(null);

  // Customization Panels
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newLeg, setNewLeg] = useState({ showName: '', judge: '', date: new Date().toISOString().split('T')[0], award: '1st Class', classSize: '' });

  // WarrenWise Photo Gallery & Editor States
  const [lightboxPhoto, setLightboxPhoto] = useState(null); // { rabbitId, photoIndex }
  const [editorPhoto, setEditorPhoto] = useState(null); // { rabbitId, imageUrl, tag, notes, weightOz, photoIndex }
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [editorBrightness, setEditorBrightness] = useState(100);
  const [editorRotation, setEditorRotation] = useState(0);
  const [editorAnnotations, setEditorAnnotations] = useState([]);
  const [editorWatermark, setEditorWatermark] = useState(false);
  
  // Media Filters
  const [mediaRabbitFilter, setMediaRabbitFilter] = useState('all');
  const [mediaTagFilter, setMediaTagFilter] = useState('all');
  const [compareMode, setCompareMode] = useState(false);

  // Design Mode & Accent States
  const [designMode, setDesignMode] = useState(() => localStorage.getItem('rp_design_mode') || 'fun');
  const [customAccent, setCustomAccent] = useState(() => localStorage.getItem('rp_custom_accent') || '#6366f1');

  // Breeder Profile Editable States
  const [breederName, setBreederName] = useState(() => currentUser?.name || '');
  const [breederPhone, setBreederPhone] = useState(() => currentUser?.phone || '');

  useEffect(() => {
    if (pedigreeEditNode) {
      const editRabbit = allRabbits.find(r => r.id === pedigreeEditNode.rabbitId);
      if (editRabbit) {
        setNodeForm({
          tattooNumber: editRabbit.tattooNumber || '',
          name: editRabbit.name || '',
          breed: editRabbit.breed || (selectedRabbit ? selectedRabbit.breed : ''),
          variety: editRabbit.variety || '',
          weightOz: editRabbit.weightOz || 0,
          dob: editRabbit.dob || '',
          registrationNumber: editRabbit.registrationNumber || '',
          gcNumber: editRabbit.gcNumber || '',
          notes: editRabbit.notes || '',
          legs: editRabbit.legs || []
        });
        setNodeFormType('new');
        setSelectedExistingId('');
      } else {
        setNodeForm({
          tattooNumber: '',
          name: '',
          breed: (selectedRabbit ? selectedRabbit.breed : ''),
          variety: '',
          weightOz: 40,
          dob: new Date().toISOString().split('T')[0],
          registrationNumber: '',
          gcNumber: '',
          notes: '',
          legs: []
        });
        setNodeFormType('existing');
        setSelectedExistingId('');
      }
      setNewAncestorLeg({ showName: '', judge: '', date: new Date().toISOString().split('T')[0], award: '1st Class', classSize: '' });
    }
  }, [pedigreeEditNode, allRabbits, selectedRabbit]);

  // Sync profile fields from currentUser when currentUser (logged in user/context) changes
  useEffect(() => {
    if (currentUser) {
      setBreederName(currentUser.name || '');
      setBreederPhone(currentUser.phone || '');
      setRabbitryName(currentUser.rabbitryName || '');
      setRabbitryLogo(currentUser.logo || '🐇');
      setTheme(currentUser.theme || 'dark');
      setArbaMemberNumber(currentUser.arbaMemberNumber || '');
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser && currentUser.arbaMemberNumber !== arbaMemberNumber) {
      setCurrentUser(prev => prev ? { ...prev, arbaMemberNumber } : null);
    }
  }, [arbaMemberNumber]);

  useEffect(() => {
    // Prevent non-admin users from accessing ab-admin context or the admin tab
    if (currentUser) {
      if (currentUser.id !== 'ab-admin') {
        // Non-admin user logged in
        if (activeTab === 'admin') {
          setActiveTab('dashboard');
        }
        // Validate selectedBreederContext is allowed for this user
        const employer = adminBreeders.find(b => b.email.toLowerCase() === currentUser.employerEmail?.toLowerCase());
        const allowedContexts = [currentUser.id];
        if (employer && currentUser.role === 'assistant' && currentUser.employerStatus === 'active') {
          allowedContexts.push(employer.id);
        }
        if (!allowedContexts.includes(selectedBreederContext)) {
          setSelectedBreederContext(currentUser.id);
          localStorage.setItem('rp_selected_context', currentUser.id);
        }
        
        // Ensure non-admin users have controlCenterUnlocked always locked
        setControlCenterUnlocked(false);
        setAdminPasswordInput('');
        setAdminPasswordError('');
      } else {
        // Admin user logged in
        // If context switches away from ab-admin, make sure we lock and exit the admin tab
        if (selectedBreederContext !== 'ab-admin') {
          if (activeTab === 'admin') {
            setActiveTab('dashboard');
          }
          setControlCenterUnlocked(false);
          setAdminPasswordInput('');
          setAdminPasswordError('');
        }
      }
    } else {
      // Logged out
      if (activeTab === 'admin') {
        setActiveTab('dashboard');
      }
      setControlCenterUnlocked(false);
      setAdminPasswordInput('');
      setAdminPasswordError('');
    }
  }, [currentUser?.id, selectedBreederContext, activeTab, adminBreeders]);

  // Sync breeder profile edits back to currentUser and adminBreeders dynamically
  useEffect(() => {
    if (currentUser && currentUser.name !== breederName) {
      setCurrentUser(prev => prev ? { ...prev, name: breederName } : null);
    }
  }, [breederName]);

  useEffect(() => {
    if (currentUser && currentUser.phone !== breederPhone) {
      setCurrentUser(prev => prev ? { ...prev, phone: breederPhone } : null);
    }
  }, [breederPhone]);

  useEffect(() => {
    if (currentUser && currentUser.rabbitryName !== rabbitryName) {
      setCurrentUser(prev => prev ? { ...prev, rabbitryName } : null);
    }
  }, [rabbitryName]);

  useEffect(() => {
    if (currentUser && currentUser.logo !== rabbitryLogo) {
      setCurrentUser(prev => prev ? { ...prev, logo: rabbitryLogo } : null);
    }
  }, [rabbitryLogo]);

  useEffect(() => {
    if (currentUser && currentUser.theme !== theme) {
      setCurrentUser(prev => prev ? { ...prev, theme } : null);
    }
  }, [theme]);

  // Save changes from currentUser to the master adminBreeders state list
  useEffect(() => {
    if (currentUser) {
      setAdminBreeders(prev => prev.map(b => b.id === currentUser.id ? currentUser : b));
    }
  }, [currentUser]);

  // New Rabbit Form State
  const [newRabbit, setNewRabbit] = useState({
    tattooNumber: '', name: '', breed: 'Holland Lop', variety: 'Blue',
    sex: 'doe', dob: new Date().toISOString().split('T')[0], weightOz: 40,
    sireId: '', damId: '', location: '', notes: '', registrationNumber: '', gcNumber: ''
  });

  // New Breeding Form State
  const [newBreeding, setNewBreeding] = useState({
    buckId: '', doeId: '', breedDate: new Date().toISOString().split('T')[0]
  });

  // New Ledger Form State
  const [newTx, setNewTx] = useState({
    date: new Date().toISOString().split('T')[0], type: 'expense', amount: '', category: 'feed', notes: '', rabbitId: ''
  });

  // Handle URL parsing for simulated password reset links and assistant invites
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    if (token && email) {
      setResetEmail(email);
      setResetToken(token);
      setAuthView('reset-password');
    }
    const inviteCode = params.get('inviteCode');
    if (inviteCode) {
      setProfileForm(prev => ({
        ...prev,
        role: 'assistant',
        employerAccountNumber: inviteCode
      }));
      setAuthView('signup');
    }
  }, []);

  // Sync own password field when currentUser logs in/changes
  useEffect(() => {
    if (currentUser) {
      setMyPasswordVal(currentUser.password || '');
    }
  }, [currentUser]);

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('rp_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('rp_logo', rabbitryLogo);
  }, [rabbitryLogo]);

  useEffect(() => {
    localStorage.setItem('rp_rabbitry_name', rabbitryName);
  }, [rabbitryName]);

  useEffect(() => {
    localStorage.setItem('rp_dash_widgets', JSON.stringify(dashboardWidgets));
  }, [dashboardWidgets]);

  useEffect(() => {
    localStorage.setItem('rp_rabbits', JSON.stringify(allRabbits));
  }, [allRabbits]);

  useEffect(() => {
    localStorage.setItem('rp_breedings', JSON.stringify(allBreedings));
  }, [allBreedings]);

  useEffect(() => {
    localStorage.setItem('rp_litters', JSON.stringify(allLitters));
  }, [allLitters]);

  useEffect(() => {
    localStorage.setItem('rp_ledger', JSON.stringify(allLedger));
  }, [allLedger]);

  useEffect(() => {
    localStorage.setItem('rp_shows', JSON.stringify(allShows));
  }, [allShows]);

  useEffect(() => {
    localStorage.setItem('rp_chores', JSON.stringify(allChores));
  }, [allChores]);

  useEffect(() => {
    localStorage.setItem('rp_transfers', JSON.stringify(allTransfers));
  }, [allTransfers]);

  useEffect(() => {
    localStorage.setItem('rp_signatures', JSON.stringify(allSignatures));
  }, [allSignatures]);

  useEffect(() => {
    localStorage.setItem('rp_design_mode', designMode);
  }, [designMode]);

  useEffect(() => {
    localStorage.setItem('rp_custom_accent', customAccent);
  }, [customAccent]);

  useEffect(() => {
    localStorage.setItem('rp_admin_breeders', JSON.stringify(adminBreeders));
  }, [adminBreeders]);

  useEffect(() => {
    localStorage.setItem('rp_sync_queue', JSON.stringify(syncQueue));
  }, [syncQueue]);

  // Sync log helper
  const addSyncAction = (action, table, payload) => {
    const newAction = {
      id: `sync-${Date.now()}`,
      action,
      table,
      payload,
      timestamp: new Date().toLocaleTimeString()
    };
    setSyncQueue(prev => [...prev, newAction]);
  };

  const handleChoreToggle = (chore) => {
    const nextCompleted = !chore.completed;
    
    // 1. Update the chores state
    setAllChores(prev => prev.map(c => c.id === chore.id ? { ...c, completed: nextCompleted } : c));
    
    // 2. Format a sync operation payload
    const actionPayload = { 
      id: chore.id, 
      taskName: chore.taskName, 
      completed: nextCompleted,
      breederId: chore.breederId
    };
    
    // 3. Add to SQLite local sync log
    addSyncAction('UPDATE', 'chores', actionPayload);
    
    // 4. Update the last saved timestamp
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastChoresSavedTime(timeStr);
    
    // 5. Toast feedback
    if (isOffline) {
      showToast(`Chore '${chore.taskName}' cached offline!`, 'info');
    } else {
      showToast(`Chore '${chore.taskName}' autosaved & synced!`, 'success');
      setTimeout(() => {
        showToast(`PostgreSQL server updated!`, 'success');
      }, 700);
    }
    
    // 6. Confetti
    if (nextCompleted) {
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.8 }
      });
    }
  };

  // Trigger win confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Login Form Submit Handler
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both username/email and password.');
      return;
    }

    const user = adminBreeders.find(b => 
      b.email.toLowerCase() === loginEmail.toLowerCase() ||
      (b.username && b.username.toLowerCase() === loginEmail.toLowerCase())
    );
    if (!user) {
      setLoginError('Account not found. Please register.');
      return;
    }

    if (user.password !== loginPassword) {
      setLoginError('Incorrect password. Please try again.');
      return;
    }

    if (user.status === 'pending') {
      setLoginError('Your registration is pending approval by the App Owner (Jason Mounts).');
      return;
    }

    // Success login!
    setCurrentUser(user);
    if (user.id === 'ab-admin') {
      setSelectedBreederContext('ab-admin');
      localStorage.setItem('rp_selected_context', 'ab-admin');
    } else {
      setSelectedBreederContext(user.id);
      localStorage.setItem('rp_selected_context', user.id);
    }
    setRabbitryName(user.rabbitryName || 'Grandview Rabbitry');
    setRabbitryLogo(user.logo || '🐇');
    setTheme(user.theme || 'dark');
    localStorage.setItem('rp_logged_in_email', user.email);
    localStorage.setItem('rp_rabbitry_name', user.rabbitryName || 'Grandview Rabbitry');
    localStorage.setItem('rp_logo', user.logo || '🐇');
    localStorage.setItem('rp_theme', user.theme || 'dark');

    triggerConfetti();
  };

  // Logout Handler
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('rp_logged_in_email');
      localStorage.removeItem('rp_selected_context');
      setCurrentUser(null);
      setSelectedBreederContext('ab-1');
      setActiveTab('dashboard');
      setControlCenterUnlocked(false);
      setAdminPasswordInput('');
      setAdminPasswordError('');
      setAuthView('login');
      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
    }
  };

  const handleUpdateMyPassword = () => {
    if (!myPasswordVal || myPasswordVal.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    const updatedBreeders = adminBreeders.map(b => 
      b.id === currentUser.id ? { ...b, password: myPasswordVal } : b
    );
    setAdminBreeders(updatedBreeders);
    localStorage.setItem('rp_admin_breeders', JSON.stringify(updatedBreeders));
    setCurrentUser(prev => ({ ...prev, password: myPasswordVal }));
    alert("Your password has been successfully updated!");
  };

  // Onboarding Form Submit Handler (Sign Up)
  const handleCreateProfile = (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email || !profileForm.username || !profileForm.password) {
      alert("Name, Email, Username, and Password are required!");
      return;
    }
    if (!profileForm.agreeHipaa) {
      alert("You must agree to the HIPAA medical record guidelines to proceed.");
      return;
    }
    if (profileForm.isYouth && (!profileForm.parentName || !profileForm.parentEmail)) {
      alert("Youth accounts require verified parent contact details.");
      return;
    }

    let resolvedEmployerEmail = '';
    let resolvedEmployerAccountNumber = '';
    if (profileForm.role === 'assistant') {
      if (!profileForm.employerAccountNumber) {
        alert("Please specify the Account Number (e.g. RAB-1001) of the breeder you work for.");
        return;
      }
      const employer = adminBreeders.find(b => 
        b.accountNumber && b.accountNumber.trim().toUpperCase() === profileForm.employerAccountNumber.trim().toUpperCase()
      );
      if (!employer) {
        alert(`Employer account number "${profileForm.employerAccountNumber}" not found. Please verify.`);
        return;
      }
      resolvedEmployerEmail = employer.email;
      resolvedEmployerAccountNumber = employer.accountNumber;
    }

    // Check if email or username already exists
    const existsEmail = adminBreeders.some(b => b.email.toLowerCase() === profileForm.email.toLowerCase());
    const existsUsername = adminBreeders.some(b => b.username && b.username.toLowerCase() === profileForm.username.toLowerCase());
    if (existsEmail) {
      alert("An account with this email address already exists.");
      return;
    }
    if (existsUsername) {
      alert("An account with this username already exists.");
      return;
    }

    // Generate a unique account number
    let newAccNum = '';
    let isUnique = false;
    while (!isUnique) {
      newAccNum = 'RAB-' + Math.floor(1000 + Math.random() * 9000);
      if (!adminBreeders.some(b => b.accountNumber === newAccNum)) {
        isUnique = true;
      }
    }

    // Create a new pending breeder profile
    const newBreeder = {
      id: `ab-${Date.now()}`,
      name: profileForm.name,
      email: profileForm.email,
      username: profileForm.username,
      phone: profileForm.phone || '',
      rabbitryName: profileForm.rabbitryName,
      role: profileForm.role,
      status: 'pending', // Requires approval
      password: profileForm.password,
      logo: profileForm.logo,
      theme: profileForm.theme,
      isYouth: profileForm.isYouth,
      parentName: profileForm.parentName || '',
      parentEmail: profileForm.parentEmail || '',
      agreeHipaa: profileForm.agreeHipaa,
      accountNumber: newAccNum,
      employerEmail: resolvedEmployerEmail,
      employerAccountNumber: resolvedEmployerAccountNumber,
      employerStatus: 'pending'
    };

    const updatedBreeders = [...adminBreeders, newBreeder];
    setAdminBreeders(updatedBreeders);
    localStorage.setItem('rp_admin_breeders', JSON.stringify(updatedBreeders));

    // Show pending approval view
    setAuthView('pending-approval');
  };

  // Forgot Password Submit Handler
  const handleForgotPassword = (e) => {
    e.preventDefault();
    setForgotSuccess('');
    setForgotLink('');

    if (!forgotEmail) {
      alert("Please enter your email address.");
      return;
    }

    // Block App Owner password reset from public form
    if (forgotEmail.toLowerCase() === 'jasonmounts77@yahoo.com' || forgotEmail.toLowerCase() === 'jmounts') {
      alert("For security reasons, password recovery for the App Owner account cannot be initiated from this public form.");
      return;
    }

    const user = adminBreeders.find(b => b.email.toLowerCase() === forgotEmail.toLowerCase() || (b.username && b.username.toLowerCase() === forgotEmail.toLowerCase()));
    if (!user) {
      alert("Account not found with this email address.");
      return;
    }

    // Generate mock link
    const mockToken = Math.random().toString(36).substring(2, 15);
    const mockUrl = `${window.location.origin}/?token=${mockToken}&email=${encodeURIComponent(user.email)}`;
    
    setForgotLink(mockUrl);
    setForgotSuccess(`A secure reset link has been simulated for ${user.email}!`);
  };

  // Reset Password Save Handler
  const handleSaveResetPassword = (e) => {
    e.preventDefault();
    setResetSuccess('');

    if (!resetPassword || !resetConfirmPassword) {
      alert("Please enter and confirm your new password.");
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Block App Owner password reset save
    if (resetEmail.toLowerCase() === 'jasonmounts77@yahoo.com' || resetEmail.toLowerCase() === 'jmounts') {
      alert("For security reasons, resetting the App Owner account password via this method is restricted.");
      return;
    }

    // Update password
    const updatedBreeders = adminBreeders.map(b => {
      if (b.email.toLowerCase() === resetEmail.toLowerCase() || (b.username && b.username.toLowerCase() === resetEmail.toLowerCase())) {
        return { ...b, password: resetPassword };
      }
      return b;
    });

    setAdminBreeders(updatedBreeders);
    localStorage.setItem('rp_admin_breeders', JSON.stringify(updatedBreeders));

    setResetSuccess('Your password has been successfully reset! Redirecting to login...');
    
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);

    // Redirect to login after 2 seconds
    setTimeout(() => {
      setAuthView('login');
      setResetPassword('');
      setResetConfirmPassword('');
      setResetSuccess('');
      setLoginEmail(resetEmail);
    }, 2000);
  };

  // Add Rabbit Handler
  const handleAddRabbit = (e) => {
    e.preventDefault();
    if (!newRabbit.tattooNumber || !newRabbit.name) {
      alert("Tattoo and Name are required!");
      return;
    }

    // ARBA Validation checks
    const valResult = validateArbaStandard(newRabbit);
    if (!valResult.valid) {
      const confirmBypass = window.confirm(`ARBA WARNING: ${valResult.reason}\nWould you like to register this rabbit anyway?`);
      if (!confirmBypass) return;
    }

    const createdRabbit = {
      ...newRabbit,
      id: `r-${Date.now()}`,
      breederId: selectedBreederContext === 'all' ? (currentUser?.id || 'ab-1') : selectedBreederContext,
      weightOz: Number(newRabbit.weightOz),
      notes: sanitizeTextInput(newRabbit.notes),
      inbreedingCoeff: calculateF(newRabbit.sireId, newRabbit.damId),
      photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'], // default cute placeholder photo
      legs: []
    };

    setAllRabbits(prev => [...prev, createdRabbit]);
    if (isOffline) {
      addSyncAction('INSERT', 'rabbits', createdRabbit);
    }

    setNewRabbit({
      tattooNumber: '', name: '', breed: 'Holland Lop', variety: 'Blue',
      sex: 'doe', dob: new Date().toISOString().split('T')[0], weightOz: 40,
      sireId: '', damId: '', location: '', notes: '', registrationNumber: '', gcNumber: ''
    });
    setShowAddRabbit(false);
    triggerConfetti();
    showToast(`Rabbit "${createdRabbit.name}" registered and synced!`, "success");

    // Trigger Success Mascot Pop-up (Clean popup, not overlaying inputs!)
    setSuccessMascot({
      type: 'usagi',
      emoji: '🐇',
      title: 'Rabbit Registered!',
      message: `Your Registrar has verified that "${createdRabbit.name}" fits breed limits and is successfully saved to the local database!`
    });
  };

  // Delete Rabbit Handler
  const handleDeleteRabbit = (id) => {
    if (isAssistantWriteOnly) {
      alert("Permission denied. Barn Assistants cannot delete records.");
      return;
    }
    const targetRab = rabbits.find(r => r.id === id);
    const rabName = targetRab ? targetRab.name : 'Rabbit';
    if (window.confirm("Are you sure you want to delete this rabbit profile?")) {
      setAllRabbits(prev => prev.filter(r => r.id !== id));
      addSyncAction('DELETE', 'rabbits', { id });
      showToast(`Rabbit "${rabName}" deleted from registry.`, "error");
      if (selectedRabbit && selectedRabbit.id === id) {
        setSelectedRabbit(null);
      }
    }
  };

  // Add Breeding Handler
  const handleAddBreeding = (e) => {
    e.preventDefault();
    if (!newBreeding.buckId || !newBreeding.doeId) {
      alert("Select Sire and Dam!");
      return;
    }

    const breedDateObj = new Date(newBreeding.breedDate);
    const palpateDate = new Date(breedDateObj.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nestBoxDate = new Date(breedDateObj.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const kindleDate = new Date(breedDateObj.getTime() + 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const createdBreeding = {
      ...newBreeding,
      id: `b-${Date.now()}`,
      breederId: selectedBreederContext === 'all' ? (currentUser?.id || 'ab-1') : selectedBreederContext,
      palpateDate,
      nestBoxDate,
      kindleDate,
      palpateResult: null,
      status: 'bred'
    };

    setAllBreedings(prev => [createdBreeding, ...prev]);
    if (isOffline) {
      addSyncAction('INSERT', 'breedings', createdBreeding);
    }
    triggerConfetti();

    // Trigger Success Mascot Pop-up for breeding
    setSuccessMascot({
      type: 'kiba',
      emoji: '🥕',
      title: 'Breeding Mating Logged!',
      message: `Your Barn Assistant scheduled the gestation calendar! Palpation check set for ${palpateDate}. Let's hope for a successful kindling!`
    });
  };

  // Add Photo to Selected Rabbit Gallery
  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!newPhotoUrl) return;

    setAllRabbits(prev => prev.map(r => {
      if (r.id === selectedRabbit.id) {
        const newPhoto = {
          url: newPhotoUrl,
          tag: 'General',
          date: new Date().toISOString().split('T')[0],
          notes: 'Added via URL.',
          annotations: [],
          watermark: false
        };
        const updated = { ...r, photos: [...(r.photos || []), newPhoto] };
        setSelectedRabbit(updated);
        return updated;
      }
      return r;
    }));
    setNewPhotoUrl('');
  };

  // Upload Local Image File (Base64)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result;
      setAllRabbits(prev => prev.map(r => {
        if (r.id === selectedRabbit.id) {
          const newPhoto = {
            url: base64Url,
            tag: 'General',
            date: new Date().toISOString().split('T')[0],
            notes: 'Uploaded file.',
            annotations: [],
            watermark: false
          };
          const updated = { ...r, photos: [...(r.photos || []), newPhoto] };
          setSelectedRabbit(updated);
          return updated;
        }
        return r;
      }));
    };
    reader.readAsDataURL(file);
  };

  const getPhotoObj = (photo) => {
    if (typeof photo === 'string') {
      return {
        url: photo,
        tag: 'General',
        date: new Date().toISOString().split('T')[0],
        notes: 'Pre-seeded photo.',
        annotations: [],
        watermark: false
      };
    }
    return {
      url: photo?.url || 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300',
      tag: photo?.tag || 'General',
      date: photo?.date || new Date().toISOString().split('T')[0],
      notes: photo?.notes || '',
      weightOz: photo?.weightOz || '',
      annotations: photo?.annotations || [],
      watermark: photo?.watermark || false
    };
  };

  const handleSavePedigreeNode = (e) => {
    if (e) e.preventDefault();
    if (!pedigreeEditNode) return;

    let updatedRabbits = [...allRabbits];

    // Case 1: Editing offspring directly
    if (pedigreeEditNode.isOffspring) {
      updatedRabbits = updatedRabbits.map(r => {
        if (r.id === pedigreeEditNode.rabbitId) {
          const updated = {
            ...r,
            name: nodeForm.name,
            tattooNumber: nodeForm.tattooNumber,
            breed: nodeForm.breed,
            variety: nodeForm.variety,
            weightOz: Number(nodeForm.weightOz) || 0,
            dob: nodeForm.dob,
            registrationNumber: nodeForm.registrationNumber,
            gcNumber: nodeForm.gcNumber,
            notes: sanitizeTextInput(nodeForm.notes)
          };
          setSelectedRabbit(updated);
          return updated;
        }
        return r;
      });
      showToast("Offspring profile updated!", "success");
    } 
    // Case 2: Setting parent link to an existing rabbit
    else if (nodeFormType === 'existing') {
      if (!selectedExistingId) {
        alert("Please select an existing rabbit!");
        return;
      }
      updatedRabbits = updatedRabbits.map(r => {
        if (r.id === pedigreeEditNode.parentOfId) {
          const updated = {
            ...r,
            [pedigreeEditNode.field]: selectedExistingId
          };
          if (r.id === selectedRabbit.id) {
            setSelectedRabbit(updated);
          }
          return updated;
        }
        return r;
      });
      showToast("Ancestor link updated!", "success");
    } 
    // Case 3: Creating or editing pedigree-only ancestor
    else {
      if (!nodeForm.name || !nodeForm.tattooNumber) {
        alert("Name and Tattoo Number are required!");
        return;
      }

      let ancestorId = pedigreeEditNode.rabbitId;

      if (ancestorId) {
        // Editing existing pedigree-only ancestor
        updatedRabbits = updatedRabbits.map(r => {
          if (r.id === ancestorId) {
            return {
              ...r,
              name: nodeForm.name,
              tattooNumber: nodeForm.tattooNumber,
              breed: nodeForm.breed,
              variety: nodeForm.variety,
              weightOz: Number(nodeForm.weightOz) || 0,
              dob: nodeForm.dob,
              registrationNumber: nodeForm.registrationNumber,
              gcNumber: nodeForm.gcNumber,
              notes: sanitizeTextInput(nodeForm.notes)
            };
          }
          return r;
        });
        showToast("Ancestor details updated!", "success");
      } else {
        // Creating new pedigree-only ancestor
        ancestorId = `r-pedigree-${Date.now()}`;
        const newAncestor = {
          id: ancestorId,
          breederId: selectedBreederContext === 'all' ? (currentUser?.id || 'ab-1') : selectedBreederContext,
          tattooNumber: nodeForm.tattooNumber,
          name: nodeForm.name,
          breed: nodeForm.breed,
          variety: nodeForm.variety,
          sex: pedigreeEditNode.gender,
          dob: nodeForm.dob,
          weightOz: Number(nodeForm.weightOz) || 40,
          status: 'pedigree_only',
          registrationNumber: nodeForm.registrationNumber,
          gcNumber: nodeForm.gcNumber,
          notes: sanitizeTextInput(nodeForm.notes),
          legs: nodeForm.legs || [],
          sireId: '',
          damId: ''
        };
        updatedRabbits.push(newAncestor);

        // Update the parent's link to this new ancestor
        updatedRabbits = updatedRabbits.map(r => {
          if (r.id === pedigreeEditNode.parentOfId) {
            const updated = {
              ...r,
              [pedigreeEditNode.field]: ancestorId
            };
            if (r.id === selectedRabbit.id) {
              setSelectedRabbit(updated);
            }
            return updated;
          }
          return r;
        });
        showToast("New ancestor registered in pedigree!", "success");
      }
    }

    // Recalculate inbreeding coefficients for all rabbits
    const engine = new GeneticsEngine(updatedRabbits);
    const finalRabbits = updatedRabbits.map(r => ({
      ...r,
      inbreedingCoeff: engine.calculateInbreedingCoefficient(r.sireId, r.damId)
    }));

    setAllRabbits(finalRabbits);
    
    // Also sync if offline
    if (isOffline) {
      addSyncAction('UPDATE', 'rabbits', finalRabbits);
    }

    // Refresh selected rabbit details to ensure inbreeding coeff updates in view
    const freshSelected = finalRabbits.find(r => r.id === selectedRabbit.id);
    if (freshSelected) {
      setSelectedRabbit(freshSelected);
    }

    setPedigreeEditNode(null);
    triggerConfetti();
  };

  const handleRemovePedigreeNode = () => {
    if (!pedigreeEditNode || !pedigreeEditNode.parentOfId) return;

    let updatedRabbits = allRabbits.map(r => {
      if (r.id === pedigreeEditNode.parentOfId) {
        const updated = {
          ...r,
          [pedigreeEditNode.field]: ''
        };
        if (r.id === selectedRabbit.id) {
          setSelectedRabbit(updated);
        }
        return updated;
      }
      return r;
    });

    const engine = new GeneticsEngine(updatedRabbits);
    const finalRabbits = updatedRabbits.map(r => ({
      ...r,
      inbreedingCoeff: engine.calculateInbreedingCoefficient(r.sireId, r.damId)
    }));

    setAllRabbits(finalRabbits);

    const freshSelected = finalRabbits.find(r => r.id === selectedRabbit.id);
    if (freshSelected) {
      setSelectedRabbit(freshSelected);
    }

    setPedigreeEditNode(null);
    showToast("Ancestor link removed.", "info");
  };

  const handleAddAncestorLeg = (e) => {
    e.preventDefault();
    if (!newAncestorLeg.showName || !newAncestorLeg.judge) return;

    const createdLeg = {
      ...newAncestorLeg,
      id: `leg-${Date.now()}`,
      showName: sanitizeTextInput(newAncestorLeg.showName),
      judge: sanitizeTextInput(newAncestorLeg.judge),
      classSize: Number(newAncestorLeg.classSize) || 0
    };

    setNodeForm(prev => {
      const updatedLegs = [...(prev.legs || []), createdLeg];
      // Also update in allRabbits immediately so it persists if they save the node
      setAllRabbits(all => all.map(r => {
        if (r.id === pedigreeEditNode.rabbitId) {
          return { ...r, legs: updatedLegs };
        }
        return r;
      }));
      return { ...prev, legs: updatedLegs };
    });

    setNewAncestorLeg({ showName: '', judge: '', date: new Date().toISOString().split('T')[0], award: '1st Class', classSize: '' });
    showToast("Ancestor show leg logged!", "success");
  };

  const handleConfirmImport = (e) => {
    e.preventDefault();
    if (!emailImportPreview) return;

    if (emailImportPreview.type === 'leg') {
      const { showName, judge, date, award, classSize, rabbitTattoo } = emailImportPreview;
      
      // Find rabbit by tattoo
      const target = allRabbits.find(r => r.tattooNumber.toLowerCase() === rabbitTattoo.toLowerCase());
      if (!target) {
        alert(`Could not find a rabbit with tattoo "${rabbitTattoo}" in your inventory. Please check the tattoo number.`);
        return;
      }

      const createdLeg = {
        id: `leg-${Date.now()}`,
        showName: sanitizeTextInput(showName),
        judge: sanitizeTextInput(judge),
        date,
        award,
        classSize: Number(classSize) || 0
      };

      const updatedRabbits = allRabbits.map(r => {
        if (r.id === target.id) {
          const updated = { ...r, legs: [...(r.legs || []), createdLeg] };
          if (selectedRabbit && selectedRabbit.id === r.id) {
            setSelectedRabbit(updated);
          }
          return updated;
        }
        return r;
      });

      setAllRabbits(updatedRabbits);
      showToast(`Show leg successfully imported to "${target.name}"!`, "success");
    } else {
      // Import certificate
      const payload = emailImportPreview.payload;
      const activeBreederId = selectedBreederContext === 'all' ? (currentUser?.id || 'ab-1') : selectedBreederContext;

      // Recursive import of ancestors
      const importNode = (node, sex = 'buck') => {
        if (!node) return '';
        const id = `r-pedigree-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        
        const sireId = node.sire ? importNode(node.sire, 'buck') : '';
        const damId = node.dam ? importNode(node.dam, 'doe') : '';

        const rabbitRecord = {
          id,
          breederId: activeBreederId,
          tattooNumber: node.tattooNumber || node.tattoo || 'IMP',
          name: node.name || 'Imported Ancestor',
          breed: node.breed || 'Holland Lop',
          variety: node.variety || '',
          sex: node.sex || sex,
          dob: node.dob || '',
          weightOz: Number(node.weightOz || node.weight) || 40,
          status: 'pedigree_only',
          registrationNumber: node.registrationNumber || '',
          gcNumber: node.gcNumber || '',
          notes: sanitizeTextInput(node.notes || 'Imported via Verifiable Transfer Certificate.'),
          legs: node.legs || [],
          sireId,
          damId
        };

        setAllRabbits(prev => [...prev, rabbitRecord]);
        return id;
      };

      // Import offspring
      const offspringSireId = payload.sire ? importNode(payload.sire, 'buck') : '';
      const offspringDamId = payload.dam ? importNode(payload.dam, 'doe') : '';
      
      const newOffspring = {
        id: `r-imported-${Date.now()}`,
        breederId: activeBreederId,
        tattooNumber: payload.tattooNumber || payload.rabbitTattoo || 'IMP-OFF',
        name: payload.name || payload.rabbitName || 'Imported Rabbit',
        breed: payload.breed || payload.rabbitBreed || 'Holland Lop',
        variety: payload.variety || payload.rabbitVariety || '',
        sex: payload.sex || payload.rabbitSex || 'doe',
        dob: payload.dob || payload.rabbitDob || '',
        weightOz: Number(payload.weightOz || payload.rabbitWeightOz) || 40,
        status: 'active', // full active member of inventory!
        registrationNumber: payload.registrationNumber || payload.rabbitRegistration || '',
        gcNumber: payload.gcNumber || payload.rabbitGc || '',
        notes: sanitizeTextInput(payload.notes || 'Imported via Verifiable Transfer Certificate.'),
        legs: payload.legs || [],
        sireId: offspringSireId,
        damId: offspringDamId,
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300'],
      };

      setAllRabbits(prev => {
        const nextList = [...prev, newOffspring];
        // Recalculate F
        const engine = new GeneticsEngine(nextList);
        return nextList.map(r => ({
          ...r,
          inbreedingCoeff: engine.calculateInbreedingCoefficient(r.sireId, r.damId)
        }));
      });

      showToast(`Verifiable pedigree certificate imported for "${newOffspring.name}"!`, "success");
    }

    setEmailImportPreview(null);
    setEmailImportText('');
    setShowEmailImportModal(false);
    triggerConfetti();
  };

  const handleParseImportText = () => {
    if (!emailImportText) return;
    
    // Check if it looks like JSON
    const cleanText = emailImportText.trim();
    if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
      try {
        const data = JSON.parse(cleanText);
        setEmailImportPreview({
          type: 'certificate',
          name: data.rabbitName || data.name || 'Imported Rabbit',
          tattooNumber: data.rabbitTattoo || data.tattooNumber || 'IMP',
          breed: data.rabbitBreed || data.breed || '',
          variety: data.rabbitVariety || data.variety || '',
          sex: data.rabbitSex || data.sex || 'doe',
          weightOz: data.rabbitWeightOz || data.weightOz || 40,
          payload: data
        });
      } catch (e) {
        alert("Failed to parse JSON. Please make sure you copied the entire certificate code.");
      }
    } else {
      // Parse as plain text email report
      const parsed = parseEmailText(cleanText);
      setEmailImportPreview(parsed);
    }
  };

  const handleDownloadPhoto = (photoUrl, rabbitName = 'rabbit') => {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `${rabbitName.replace(/\s+/g, '_')}_photo_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerAiInspection = (photoUrl) => {
    setAiLoading(true);
    setAiReport(null);
    setTimeout(() => {
      setAiLoading(false);
      const varieties = ['Blue', 'Broken Blue', 'Black', 'Tortoise', 'Sable Point'];
      const randomVariety = varieties[Math.floor(Math.random() * varieties.length)];
      const bodyScore = (4.0 + Math.random() * 0.8).toFixed(1);
      
      setAiReport({
        variety: `${randomVariety} (94% confidence)`,
        bodyScore: `${bodyScore}/5.0 (Optimal bone structure & crown curvature)`,
        soreHocks: Math.random() > 0.85 ? "Slight redness on left rear hock. Recommend hock pad." : "Clear (Healthy dermis layer)",
        earMites: "Clear (No scaling or build-up detected)",
        malocclusion: "Clear (Normal incisor bite plane alignment)",
        sopCompliance: "100% compliant with ARBA Standard of Perfection standards for senior class."
      });
    }, 1500);
  };

  // Add Leg to Selected Rabbit
  const handleAddLeg = (e) => {
    e.preventDefault();
    if (!newLeg.showName || !newLeg.judge) return;

    const createdLeg = {
      ...newLeg,
      id: `leg-${Date.now()}`,
      showName: sanitizeTextInput(newLeg.showName),
      judge: sanitizeTextInput(newLeg.judge),
      classSize: Number(newLeg.classSize) || 0
    };

    setAllRabbits(prev => prev.map(r => {
      if (r.id === selectedRabbit.id) {
        const updated = { ...r, legs: [...(r.legs || []), createdLeg] };
        setSelectedRabbit(updated);
        return updated;
      }
      return r;
    }));

    setNewLeg({ showName: '', judge: '', date: new Date().toISOString().split('T')[0], award: '1st Class', classSize: '' });
    triggerConfetti();

    // Trigger Success Mascot Pop-up for Show Leg registration
    setSuccessMascot({
      type: 'gen',
      emoji: '🏆',
      title: 'Grand Champion Leg Logged!',
      message: `Your Genetics Sage registered the show leg certificate! This award moves ${selectedRabbit.name} closer to grand champion status!`
    });
  };

  // Handle Palpation Log
  const logPalpation = (id, result) => {
    setAllBreedings(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, palpateResult: result, status: result ? 'palpated_positive' : 'palpated_negative' };
      }
      return b;
    }));
  };

  // Handle Kindle Event
  const logKindle = (id, kitsAlive, kitsDead) => {
    setAllBreedings(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, status: 'kindled' };
      }
      return b;
    }));

    const newLitter = {
      id: `l-${Date.now()}`,
      breederId: selectedBreederContext === 'all' ? (currentUser?.id || 'ab-1') : selectedBreederContext,
      breedingId: id,
      kitsBornAlive: Number(kitsAlive),
      kitsBornDead: Number(kitsDead),
      kitsWeaned: 0,
      notes: ''
    };

    setAllLitters(prev => [newLitter, ...prev]);
    triggerConfetti();
  };

  // Add Transaction Handler
  const handleAddTx = (e) => {
    e.preventDefault();
    if (!newTx.amount) return;

    const activeBreederId = selectedBreederContext === 'all' ? (currentUser?.id || 'ab-1') : selectedBreederContext;
    const createdTx = {
      ...newTx,
      id: `tx-${Date.now()}`,
      breederId: activeBreederId,
      amount: Number(newTx.amount)
    };

    setAllLedger(prev => [createdTx, ...prev]);
    if (isOffline) {
      addSyncAction('INSERT', 'ledger', createdTx);
    }
    setNewTx({ date: new Date().toISOString().split('T')[0], type: 'expense', amount: '', category: 'feed', notes: '', rabbitId: '' });
  };

  // ARBA Standards Checker
  const validateArbaStandard = (rabbit) => {
    const ageMonths = getAgeMonths(rabbit.dob);
    const standard = BREED_STANDARDS[rabbit.breed];
    if (!standard) return { valid: true };

    const weight = Number(rabbit.weightOz);
    const sex = rabbit.sex;

    if (standard.classType === '4-class') {
      const isSenior = ageMonths >= 6;
      if (isSenior) {
        const min = sex === 'buck' ? standard.buckSrMin : standard.doeSrMin;
        const max = sex === 'buck' ? standard.buckSrMax : standard.doeSrMax;
        if (weight < min || weight > max) {
          return { valid: false, reason: `Senior ${rabbit.breed} ${sex} weight must be between ${min}oz and ${max}oz.` };
        }
      } else {
        const max = sex === 'buck' ? standard.buckJrMax : standard.doeJrMax;
        if (weight > max) {
          return { valid: false, reason: `Junior ${rabbit.breed} ${sex} weight must not exceed ${max}oz.` };
        }
      }
    } else {
      const isSenior = ageMonths >= 8;
      const isInt = ageMonths >= 6 && ageMonths < 8;
      if (isSenior) {
        const min = sex === 'buck' ? standard.buckSrMin : standard.doeSrMin;
        if (weight < min) {
          return { valid: false, reason: `Senior ${rabbit.breed} ${sex} weight must be at least ${min}oz.` };
        }
      } else if (isInt) {
        const min = sex === 'buck' ? standard.buckIntMin : standard.doeIntMin;
        const max = sex === 'buck' ? standard.buckIntMax : standard.doeIntMax;
        if (weight < min || weight > max) {
          return { valid: false, reason: `Intermediate ${rabbit.breed} ${sex} weight must be between ${min}oz and ${max}oz.` };
        }
      } else {
        const max = sex === 'buck' ? standard.buckJrMax : standard.doeJrMax;
        if (weight > max) {
          return { valid: false, reason: `Junior ${rabbit.breed} ${sex} weight must not exceed ${max}oz.` };
        }
      }
    }
    return { valid: true };
  };

  // Calculate Wright's Coefficient wrapper
  const calculateF = (sireId, damId) => {
    const engine = new GeneticsEngine(rabbits);
    return engine.calculateInbreedingCoefficient(sireId, damId);
  };

  // Sync handler (Simulated)
  const handleSyncNow = () => {
    if (isOffline) {
      alert("Cannot sync while Offline!");
      return;
    }
    if (syncQueue.length === 0) {
      alert("No changes in local sync queue!");
      return;
    }
    
    setTimeout(() => {
      setSyncQueue([]);
      triggerConfetti();
      alert("Sync Successful!");
    }, 1000);
  };

  const filteredRabbits = rabbits.filter(r => 
    r.status !== 'pedigree_only' && r.status !== 'sold' && (
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tattooNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.breed.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Helper: Compute Age in Months
  const getAgeMonths = (dobStr) => {
    const dob = new Date(dobStr);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970) * 12 + ageDate.getUTCMonth();
  };

  // ----------------------------------------------------
  // ONBOARDING LANDING HOME PAGE VIEW (DARK MODE DEFAULT)
  // ----------------------------------------------------
  if (!hasProfile) {
    return (
      <div className="theme-dark min-h-screen relative overflow-y-auto bg-slate-950">
        {/* Neon Cyber Glow Effects behind the card */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full min-h-screen p-8 md:p-12 relative z-10 bg-slate-950/40 backdrop-blur-md flex flex-col justify-between">
          
          {/* Header Title with Welcome Banner */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex items-center gap-3 justify-center mb-2">
              <span className="text-4xl animate-bounce">🐇👑</span>
              <h2 className="text-3xl font-black tracking-tight text-center bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                RabbitryPedigree Pro
              </h2>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-75 text-center text-indigo-300">
              ARBA Compliance & Pedigree Analytics
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-5xl glass-container p-6 md:p-8 flex flex-col lg:flex-row gap-8 bg-slate-900/60 border border-slate-700/50 shadow-2xl rounded-3xl">
              
              {/* Left Column: Mascot Welcome & Judge Photo */}
              <div className="lg:w-5/12 flex flex-col gap-6 justify-center">
                
                {/* Mascot Welcome Message Banner */}
                <div className="p-4 rounded-2xl bg-white/5 border border-indigo-500/20 flex gap-4 items-center">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-pink-400 font-mono">Genetics Sage Mascot 🧙‍♂️</span>
                    <p className="text-xs opacity-90 leading-relaxed text-indigo-100 mt-1">
                      {authView === 'login' && '"Welcome back! Sign in to verify your show-legs, manage gestational timelines, and run genetics analytics."'}
                      {authView === 'signup' && '"Creating a new account? Your credentials will be queued for the App Owner to approve. Fill in the details to start!"'}
                      {authView === 'forgot-password' && '"Forgot your password? Enter your email and I will simulate sending a tokenized reset link."'}
                      {authView === 'reset-password' && '"Security first! Enter a new password to restore your breeder profile credentials."'}
                      {authView === 'pending-approval' && '"Application sent! Your profile is currently queued. You will be able to login once approved."'}
                    </p>
                  </div>
                </div>

                {/* Show Judge Hero Banner */}
                <div className="p-2 bg-slate-950/80 border border-white/10 rounded-3xl shadow-lg overflow-hidden flex flex-col">
                  <img 
                    src="/assets/main_show_judge.png" 
                    alt="Rabbit Judge inspecting show rabbits" 
                    className="w-full h-auto object-cover rounded-2xl aspect-[4/3] bg-gradient-to-br from-indigo-500 to-pink-500 opacity-90" 
                  />
                  <div className="p-3 text-center bg-slate-900 rounded-b-2xl border-t border-white/5">
                    <span className="text-xs font-black text-indigo-200 block">ARBA Show Table Inspection</span>
                    <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Standard of Perfection Validation</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Dynamic Form Container */}
              <div className="lg:w-7/12 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8">
                
                {/* 1. LOGIN VIEW */}
                {authView === 'login' && (
                  <form onSubmit={handleLogin} className="flex flex-col gap-6">
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">Breeder Sign In</h3>
                      <p className="text-xs opacity-75 mt-1 text-slate-300">Access your offline-first rabbitry database</p>
                    </div>

                    {loginError && (
                      <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-indigo-300">Username or Email Address *</label>
                        <input 
                          type="text" required placeholder="Username or email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="bg-white/5 border-white/10 w-full"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-indigo-300">Password *</label>
                          <button 
                            type="button" 
                            onClick={() => setAuthView('forgot-password')}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative">
                          <input 
                            type={showLoginPassword ? "text" : "password"} required placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="bg-white/5 border-white/10 w-full pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-90 hover:opacity-100 z-10 p-1"
                          >
                            {showLoginPassword ? <Eye className="w-4 h-4 text-indigo-400" /> : <EyeOff className="w-4 h-4 text-indigo-300" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-interactive w-full py-3 bg-indigo-600 font-bold text-white text-sm"
                    >
                      Sign In
                    </button>

                    <div className="text-center text-xs opacity-75 border-t border-white/5 pt-4">
                      <span>Don't have an account? </span>
                      <button 
                        type="button" 
                        onClick={() => {
                          setAuthView('signup');
                          setLoginError('');
                        }}
                        className="text-pink-400 hover:text-pink-300 font-bold"
                      >
                        Register New Account
                      </button>
                    </div>

                    {/* Quick Demo Login Help */}
                    <div className="p-3 bg-indigo-950/20 border border-indigo-500/10 rounded-xl">
                      <span className="text-[10px] font-bold text-indigo-300 block mb-1">Demo Credentials:</span>
                      <span className="text-[9px] text-indigo-200 block">Breeder: <strong>jason@grandview.com</strong> / password123</span>
                      <span className="text-[9px] text-indigo-200 block">Registrar: <strong>sarah@arba.org</strong> / arba_pass_2026</span>
                    </div>
                  </form>
                )}

                {/* 2. SIGN UP VIEW */}
                {authView === 'signup' && (
                  <form onSubmit={handleCreateProfile} className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2">
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">Create Breeder Account</h3>
                      <p className="text-xs opacity-75 mt-0.5 text-slate-300">Register and request App Owner approval</p>
                    </div>

                    {/* Basic Info Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-indigo-300">Breeder Full Name *</label>
                        <input 
                          type="text" required placeholder="E.g. Jason Miller"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                          className="bg-white/5 border-white/10 text-xs py-2 px-3"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-indigo-300">Username *</label>
                        <input 
                          type="text" required placeholder="e.g. jmiller"
                          value={profileForm.username || ''}
                          onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                          className="bg-white/5 border-white/10 text-xs py-2 px-3"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-indigo-300">Email Address *</label>
                        <input 
                          type="email" required placeholder="name@domain.com"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                          className="bg-white/5 border-white/10 text-xs py-2 px-3"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-indigo-300">Password *</label>
                        <div className="relative">
                          <input 
                            type={showSignupPassword ? "text" : "password"} required placeholder="Create password"
                            value={profileForm.password}
                            onChange={(e) => setProfileForm({...profileForm, password: e.target.value})}
                            className="bg-white/5 border-white/10 text-xs py-2 pl-3 pr-10 w-full"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                          >
                            {showSignupPassword ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4 opacity-50" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-indigo-300">Rabbitry Prefix Name *</label>
                        <input 
                          type="text" required placeholder="E.g. Grandview's"
                          value={profileForm.rabbitryName}
                          onChange={(e) => setProfileForm({...profileForm, rabbitryName: e.target.value})}
                          className="bg-white/5 border-white/10 text-xs py-2 px-3"
                        />
                      </div>

                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-[11px] font-bold text-indigo-300">Contact Phone</label>
                        <input 
                          type="tel" placeholder="555-0123"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          className="bg-white/5 border-white/10 text-xs py-2 px-3"
                        />
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-indigo-300">Choose Your Breeder Role</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'owner', label: 'Breeder / Owner 👑', text: 'Own registry with ARBA abilities' },
                          { id: 'assistant', label: 'Barn Assistant 🌾', text: 'Document data for an employer' }
                        ].map(role => (
                          <button
                            type="button" key={role.id}
                            onClick={() => setProfileForm({...profileForm, role: role.id})}
                            className={`p-3 text-left rounded-xl border text-xs transition-all ${profileForm.role === role.id ? 'border-pink-500 bg-pink-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                          >
                            <div className="font-bold text-white">{role.label}</div>
                            <div className="text-[9px] opacity-60 mt-0.5 leading-snug">{role.text}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                     {/* Employer Association Field for Barn Assistant */}
                     {profileForm.role === 'assistant' && (
                       <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                         <label className="text-[11px] font-bold text-indigo-300">Employer Account Number *</label>
                         <input 
                           type="text" 
                           required 
                           placeholder="e.g. RAB-1001"
                           value={profileForm.employerAccountNumber || ''}
                           onChange={(e) => setProfileForm({...profileForm, employerAccountNumber: e.target.value})}
                           className="bg-slate-900 border border-white/10 text-xs py-2 px-3 text-white rounded-xl focus:outline-none focus:border-indigo-500"
                         />
                         <p className="text-[9px] opacity-60">Enter the employer's unique account number. You will gain access to document their registry once they approve you on their dashboard.</p>
                       </div>
                     )}

                    {/* Logo & Theme selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-white/5 pt-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-indigo-300">Select Emblem Logo</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {LOGO_OPTIONS.map(logo => (
                            <button 
                              type="button" key={logo.id}
                              onClick={() => setProfileForm({...profileForm, logo: logo.emoji})}
                              className={`p-1.5 rounded-lg text-left text-[10px] border transition-all flex items-center gap-1.5 ${profileForm.logo === logo.emoji ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                            >
                              <span>{logo.emoji}</span>
                              <span className="truncate">{logo.label.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-indigo-300">Theme</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'forest', name: 'Forest 🌿' },
                            { id: 'kawaii', name: 'Kawaii 🌸' },
                            { id: 'cyber', name: 'Cyber ⚡' },
                            { id: 'dark', name: 'Dark 🌙' }
                          ].map(t => (
                            <button
                              type="button" key={t.id}
                              onClick={() => setProfileForm({...profileForm, theme: t.id})}
                              className={`p-1.5 rounded-lg text-[10px] border text-left transition-all ${profileForm.theme === t.id ? 'border-pink-500 bg-white/10' : 'border-white/5 bg-white/5'}`}
                            >
                              {t.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* COPPA Youth Check */}
                    <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2">
                      <label className="flex items-center gap-2 text-xs cursor-pointer text-indigo-300 font-semibold">
                        <input 
                          type="checkbox"
                          checked={profileForm.isYouth}
                          onChange={(e) => setProfileForm({...profileForm, isYouth: e.target.checked})}
                          className="w-3.5 h-3.5"
                        />
                        Youth Account (Under 13 - COPPA Privacy)
                      </label>

                      {profileForm.isYouth && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-white/5 rounded-xl border border-white/5 mt-0.5">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-pink-400">Parent Name *</label>
                            <input 
                              type="text" placeholder="Guardian Name" required
                              value={profileForm.parentName}
                              onChange={(e) => setProfileForm({...profileForm, parentName: e.target.value})}
                              className="text-[11px] py-1 px-2.5 bg-white/5 border-white/10"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-pink-400">Parent Email *</label>
                            <input 
                              type="email" placeholder="guardian@domain.com" required
                              value={profileForm.parentEmail}
                              onChange={(e) => setProfileForm({...profileForm, parentEmail: e.target.value})}
                              className="text-[11px] py-1 px-2.5 bg-white/5 border-white/10"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* HIPAA Compliance Consent */}
                    <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10">
                      <div className="flex gap-2 items-start">
                        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] opacity-80 leading-normal text-indigo-200 font-sans">
                          HIPAA compliance: Do not store any human Protected Health Information (PHI) in this database. Storing breeder records is compliant, but no human medical records are allowed.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-cyan-300 mt-1">
                        <input 
                          type="checkbox"
                          checked={profileForm.agreeHipaa}
                          onChange={(e) => setProfileForm({...profileForm, agreeHipaa: e.target.checked})}
                          required
                          className="w-3.5 h-3.5"
                        />
                        I agree to HIPAA database regulations.
                      </label>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-interactive w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 font-bold text-white text-xs mt-2"
                    >
                      Submit Registration
                    </button>

                    <button 
                      type="button" 
                      onClick={() => setAuthView('login')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold mt-1 text-center"
                    >
                      Back to Sign In
                    </button>
                  </form>
                )}

                {/* 3. FORGOT PASSWORD VIEW */}
                {authView === 'forgot-password' && (
                  <form onSubmit={handleForgotPassword} className="flex flex-col gap-6">
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">Recover Credentials</h3>
                      <p className="text-xs opacity-75 mt-1 text-slate-300">Generate a simulated password recovery token</p>
                    </div>

                    {forgotSuccess && (
                      <div className="flex flex-col gap-3 p-4 bg-green-950/50 border border-green-500/30 text-green-300 text-xs rounded-xl">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                          <span className="font-bold">{forgotSuccess}</span>
                        </div>
                        {forgotLink && (
                          <div className="p-3 bg-slate-900 border border-green-500/20 rounded-lg flex flex-col gap-2">
                            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Email Inbox Link Simulation:</span>
                            <a 
                              href={forgotLink}
                              className="text-xs text-cyan-400 hover:text-cyan-300 underline font-mono break-all"
                            >
                              {forgotLink}
                            </a>
                            <span className="text-[9px] text-slate-500 leading-normal">
                              Clicking this simulated link loads the reset token parameters directly into the app view.
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-indigo-300">Email Address *</label>
                      <input 
                        type="email" required placeholder="name@domain.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="bg-white/5 border-white/10 w-full"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn-interactive w-full py-3 bg-indigo-600 font-bold text-white text-sm"
                    >
                      Simulate Reset Notification
                    </button>

                    <button 
                      type="button" 
                      onClick={() => {
                        setAuthView('login');
                        setForgotSuccess('');
                        setForgotLink('');
                        setForgotEmail('');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold mt-1 text-center"
                    >
                      Back to Sign In
                    </button>
                  </form>
                )}

                {/* 4. RESET PASSWORD VIEW */}
                {authView === 'reset-password' && (
                  <form onSubmit={handleSaveResetPassword} className="flex flex-col gap-6">
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">Reset Password</h3>
                      <p className="text-xs opacity-75 mt-1 text-slate-300">Setting new credentials for <strong>{resetEmail}</strong></p>
                    </div>

                    {resetSuccess && (
                      <div className="p-3 bg-green-950/50 border border-green-500/30 text-green-300 text-xs rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                        <span>{resetSuccess}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-indigo-300">New Password *</label>
                        <div className="relative">
                          <input 
                            type={showResetPassword ? "text" : "password"} required placeholder="New password"
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                            className="bg-white/5 border-white/10 w-full pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowResetPassword(!showResetPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                          >
                            {showResetPassword ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4 opacity-50" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-indigo-300">Confirm New Password *</label>
                        <div className="relative">
                          <input 
                            type={showResetConfirmPassword ? "text" : "password"} required placeholder="Confirm password"
                            value={resetConfirmPassword}
                            onChange={(e) => setResetConfirmPassword(e.target.value)}
                            className="bg-white/5 border-white/10 w-full pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                          >
                            {showResetConfirmPassword ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4 opacity-50" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-interactive w-full py-3 bg-indigo-600 font-bold text-white text-sm"
                    >
                      Save New Password
                    </button>

                    <button 
                      type="button" 
                      onClick={() => setAuthView('login')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold mt-1 text-center"
                    >
                      Cancel and Return to Sign In
                    </button>
                  </form>
                )}

                {/* 5. PENDING APPROVAL VIEW */}
                {authView === 'pending-approval' && (
                  <div className="flex flex-col gap-6 text-center py-6">
                    <div className="w-16 h-16 bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center rounded-2xl mx-auto animate-pulse">
                      <Settings className="w-8 h-8" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">Registration Submitted!</h3>
                      <p className="text-xs opacity-75 mt-2 text-slate-300 px-4">
                        Your account application is currently <strong>pending approval</strong>.
                      </p>
                    </div>

                    <div className="p-4 bg-white/5 border border-indigo-500/10 rounded-2xl text-left text-xs text-indigo-200 leading-relaxed mx-4 font-sans">
                      <span className="font-bold text-indigo-300 block mb-1">Approval Required:</span>
                      All accounts must be approved by the App Owner before they are activated. Please ask <strong>Jason Mounts</strong> (owner) to approve your account from his Control Center dashboard.
                    </div>

                    <button 
                      type="button" 
                      onClick={() => {
                        setAuthView('login');
                        // Reset form
                        setProfileForm({
                          name: '', email: '', phone: '', password: '', rabbitryName: 'Grandview Rabbitry',
                          role: 'owner', logo: '🐇', theme: 'dark', isYouth: false, parentName: '', parentEmail: '', agreeHipaa: false
                        });
                      }}
                      className="btn-interactive py-3 bg-indigo-600 font-bold text-white text-sm mx-4"
                    >
                      Back to Sign In
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Derive active context breeder details for header display
  const activeBreederContext = adminBreeders.find(b => b.id === selectedBreederContext) || currentUser;

  // ----------------------------------------------------
  // MAIN WORKSPACE DASHBOARD VIEW (ONLINE / PROFILE CREATED)
  // ----------------------------------------------------
  return (
    <div className={`theme-${theme} min-h-screen relative ${designMode === 'pro' ? 'pro-mode-active' : ''}`} style={{ '--custom-accent-color': customAccent }}>
      
      {/* Anime Reward Popups Overlay */}
      {successMascot && (
        <div className="success-overlay" onClick={() => setSuccessMascot(null)}>
          <div className="success-bubble-card" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSuccessMascot(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
            {successMascot.type === 'usagi' ? (
              <img src="/assets/mascot.png" alt="Barn Registrar" className="w-24 h-24 mx-auto object-contain p-2 bg-white border-2 border-indigo-400 rounded-2xl shadow-md mascot-avatar mb-4" />
            ) : successMascot.type === 'kiba' ? (
              <img src="/assets/holland_lop.png" alt="Barn Assistant" className="w-24 h-24 mx-auto object-contain p-2 bg-white border-2 border-indigo-400 rounded-2xl shadow-md mascot-avatar mb-4" />
            ) : (
              <img src="/assets/netherland_dwarf.png" alt="Genetics Sage" className="w-24 h-24 mx-auto object-contain p-2 bg-white border-2 border-indigo-400 rounded-2xl shadow-md mascot-avatar mb-4" />
            )}
            <h3 className="text-2xl font-black mb-2 tracking-tight text-white">{successMascot.title}</h3>
            <p className="text-sm opacity-90 leading-relaxed mb-6 px-4">{successMascot.message}</p>
            <button 
              onClick={() => setSuccessMascot(null)}
              className="btn-interactive w-full py-3"
            >
              Awesome, Back to Barn!
            </button>
          </div>
        </div>
      )}
 
      {/* Top Banner Navigation */}
      <header className="glass-container mx-6 mt-6 mb-4 p-4 flex flex-wrap items-center justify-between gap-4 z-10 relative">
        {currentUser?.isSuperAdmin && currentUser?.id === 'ab-admin' && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 text-white text-[10px] font-black tracking-widest uppercase px-4 py-1 rounded-full shadow-lg border border-indigo-400 flex items-center gap-1.5 shadow-indigo-500/35">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            App Owner Administrative Session
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="text-4xl">{activeBreederContext?.logo || '🐇'}</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">{activeBreederContext?.rabbitryName || 'Configure Rabbitry'}</h1>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded">Pro</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-white/10" id="header-breeder-id">ID: {activeBreederContext?.id}</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Rabbitry Registry & Pedigree Sync</p>
          </div>
        </div>

        {/* Global Connection Simulator Indicator & Settings */}
        <div className="flex flex-wrap items-center gap-2">
          {((currentUser?.isSuperAdmin && currentUser?.id === 'ab-admin') || (currentUser?.role === 'assistant' && currentUser?.employerStatus === 'active')) && (() => {
            const employer = adminBreeders.find(b => b.email.toLowerCase() === currentUser?.employerEmail?.toLowerCase());
            return (
              <div className="flex items-center gap-1.5 bg-indigo-950/65 border border-indigo-500/30 px-3 py-1.5 rounded-xl shadow-lg">
                <ShieldCheck className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span className="text-xs font-bold text-indigo-300">Context:</span>
                <select
                  value={selectedBreederContext}
                  onChange={(e) => {
                    setSelectedBreederContext(e.target.value);
                    localStorage.setItem('rp_selected_context', e.target.value);
                  }}
                  className="text-xs bg-slate-900 border border-indigo-500/20 text-indigo-200 rounded-lg p-1 cursor-pointer font-semibold focus:outline-none"
                >
                  {currentUser?.isSuperAdmin && currentUser?.id === 'ab-admin' ? (
                    adminBreeders
                      .filter(b => b.email !== 'admin@rabbitrypedigree.pro')
                      .map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.rabbitryName || 'No Rabbitry'})
                        </option>
                      ))
                  ) : (
                    <>
                      <option value={currentUser.id}>My Registry ({currentUser.name})</option>
                      {employer && (
                        <option value={employer.id}>{employer.rabbitryName || 'Employer'} ({employer.name})</option>
                      )}
                    </>
                  )}
                </select>
              </div>
            );
          })()}

          <button 
            onClick={() => setIsOffline(!isOffline)}
            className={`btn-interactive text-xs py-2 px-4 ${isOffline ? 'bg-orange-600' : 'bg-green-600'}`}
          >
            <RefreshCw className={`w-4 h-4 ${isOffline ? '' : 'animate-spin'}`} />
            {isOffline ? 'Offline Cache Active' : 'Cloud Sync Active'}
          </button>

          {syncQueue.length > 0 && (
            <button 
              onClick={handleSyncNow}
              disabled={isOffline}
              className={`btn-interactive text-xs py-2 px-4 bg-indigo-600 border border-indigo-400 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 animate-pulse ${isOffline ? 'opacity-50 cursor-not-allowed animate-none' : ''}`}
              title={isOffline ? "Cannot push changes while offline!" : "Push local modifications to PostgreSQL server"}
            >
              ☁️ Push Sync ({syncQueue.length})
            </button>
          )}

          {/* Design Mode Switcher */}
          <button
            onClick={() => setDesignMode(prev => prev === 'fun' ? 'pro' : 'fun')}
            className={`btn-interactive text-xs py-2 px-3 border-none flex items-center gap-1.5 font-bold ${designMode === 'fun' ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white shadow-md' : 'bg-slate-800 text-slate-300 border border-white/10 shadow-sm'}`}
            title="Toggle between Fun Mode (illustrations & guides) and Pro Mode (clean registrar view)"
          >
            {designMode === 'fun' ? '🐰 Fun Mode' : '📜 Pro Mode'}
          </button>

          {/* Theme Selector */}
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            className="text-xs font-semibold py-2 px-3 border rounded-xl"
          >
            <option value="forest">Forest Meadows 🌿</option>
            <option value="kawaii">Kawaii Garden 🌸</option>
            <option value="cyber">Neon Cyber-Barn ⚡</option>
            <option value="ghibli">Ghibli Orchard 🍎</option>
            <option value="dark">Midnight Obsidian 🌙</option>
            <option value="spring">Spring Meadow 🌷</option>
            <option value="rainbow">Rainbow Hutch 🌈</option>
            <option value="golden">Golden Lop 🌾</option>
            <option value="sparkle">Showtime Sparkle ✨</option>
          </select>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="w-full px-6 pb-6 grid grid-cols-1 lg:grid-cols-4 gap-6 z-10 relative">
        
        {/* Left Side Navigation & Customization Panel */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Navigation Card */}
          <div className="glass-container p-4 flex flex-col gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider px-3 mb-2 opacity-65">App Modules</h3>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 p-3 rounded-xl text-left font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white shadow-inner' : 'opacity-85 hover:bg-white/5'}`}
            >
              <BarChart3 className="w-5 h-5" /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('rabbits')}
              className={`flex items-center gap-3 p-3 rounded-xl text-left font-semibold transition-all ${activeTab === 'rabbits' ? 'bg-white/10 text-white shadow-inner' : 'opacity-85 hover:bg-white/5'}`}
            >
              <Rabbit className="w-5 h-5" /> Rabbits & Lineage
            </button>
            <button 
              onClick={() => setActiveTab('breeding')}
              className={`flex items-center gap-3 p-3 rounded-xl text-left font-semibold transition-all ${activeTab === 'breeding' ? 'bg-white/10 text-white shadow-inner' : 'opacity-85 hover:bg-white/5'}`}
            >
              <Calendar className="w-5 h-5" /> Breeding Scheduler
            </button>
            <button 
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-3 p-3 rounded-xl text-left font-semibold transition-all ${activeTab === 'ledger' ? 'bg-white/10 text-white shadow-inner' : 'opacity-85 hover:bg-white/5'}`}
            >
              <DollarSign className="w-5 h-5" /> financial Ledger
            </button>
            <button 
              onClick={() => setActiveTab('shows')}
              className={`flex items-center gap-3 p-3 rounded-xl text-left font-semibold transition-all ${activeTab === 'shows' ? 'bg-white/10 text-white shadow-inner' : 'opacity-85 hover:bg-white/5'}`}
            >
              <Award className="w-5 h-5 text-yellow-400" /> Show Planner
            </button>
            <button 
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-3 p-3 rounded-xl text-left font-semibold transition-all ${activeTab === 'media' ? 'bg-white/10 text-white shadow-inner' : 'opacity-85 hover:bg-white/5'}`}
            >
              <ImageIcon className="w-5 h-5 text-sky-400" /> Media Gallery
            </button>
            <button 
              onClick={() => setActiveTab('sales')}
              className={`flex items-center gap-3 p-3 rounded-xl text-left font-semibold transition-all ${activeTab === 'sales' ? 'bg-white/10 text-white shadow-inner' : 'opacity-85 hover:bg-white/5'}`}
            >
              <ShoppingBag className="w-5 h-5 text-emerald-400" /> Sales & Transfers
            </button>
            <button 
              onClick={() => setActiveTab('sync')}
              className={`flex items-center gap-3 p-3 rounded-xl text-left font-semibold transition-all ${activeTab === 'sync' ? 'bg-white/10 text-white shadow-inner' : 'opacity-85 hover:bg-white/5'}`}
            >
              <RefreshCw className="w-5 h-5" /> SQLite Sync ({syncQueue.length})
            </button>
            {currentUser?.id === 'ab-admin' && selectedBreederContext === 'ab-admin' && (
              <button 
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-3 p-3 rounded-xl text-left font-semibold transition-all ${activeTab === 'admin' ? 'bg-white/10 text-white shadow-inner' : 'opacity-85 hover:bg-white/5'}`}
              >
                <ShieldCheck className="w-5 h-5" /> Control Center
              </button>
            )}
          </div>

          {/* Self-Customization Panel */}
          <div className="glass-container p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-65 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Personalize Barn
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold">Breeder Name</label>
              <input 
                type="text" 
                value={breederName}
                onChange={(e) => setBreederName(e.target.value)}
                className="text-sm py-1.5 px-3"
                placeholder="Enter Breeder Name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold">Rabbitry Prefix Name</label>
              <input 
                type="text" 
                value={rabbitryName}
                onChange={(e) => setRabbitryName(e.target.value)}
                className="text-sm py-1.5 px-3"
                placeholder="Enter Rabbitry Name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold">Phone Number</label>
              <input 
                type="text" 
                value={breederPhone}
                onChange={(e) => setBreederPhone(e.target.value)}
                className="text-sm py-1.5 px-3"
                placeholder="Enter Phone Number"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold">ARBA Account Number</label>
              <input 
                type="text" 
                value={arbaMemberNumber}
                onChange={(e) => setArbaMemberNumber(e.target.value)}
                className="text-sm py-1.5 px-3 font-mono"
                placeholder="Enter ARBA Account Number"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold">Select Emblem Logo</label>
              <div className="grid grid-cols-4 gap-2">
                {LOGO_OPTIONS.map(logo => (
                  <button 
                    key={logo.id}
                    onClick={() => setRabbitryLogo(logo.emoji)}
                    className={`p-2 rounded-xl text-center text-lg border transition-all ${rabbitryLogo === logo.emoji ? 'border-indigo-500 bg-white/10' : 'border-white/5'}`}
                    title={logo.label}
                  >
                    {logo.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Accent Color Picker */}
            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
              <label className="text-xs font-bold flex items-center gap-1.5 text-indigo-300">
                🎨 Custom Accent Color Picker
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={customAccent} 
                  onChange={(e) => setCustomAccent(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" 
                  title="Pick a custom hutch highlight color"
                />
                <span className="text-xs font-mono opacity-80 uppercase">{customAccent}</span>
                <button 
                  type="button" 
                  onClick={() => setCustomAccent('#6366f1')} 
                  className="text-[10px] opacity-60 hover:opacity-100 underline ml-auto font-semibold"
                >
                  Reset Accent
                </button>
              </div>
            </div>

            {/* Dashboard Widget Selector */}
            <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
              <span className="text-xs font-bold">Configure Dashboard Widgets</span>
              <div className="flex flex-col gap-1.5 mt-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={dashboardWidgets.stats}
                    onChange={(e) => setDashboardWidgets({...dashboardWidgets, stats: e.target.checked})}
                    className="w-4 h-4"
                  />
                  Quick Barn Stats
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={dashboardWidgets.alerts}
                    onChange={(e) => setDashboardWidgets({...dashboardWidgets, alerts: e.target.checked})}
                    className="w-4 h-4"
                  />
                  Calendar Task Alerts
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={dashboardWidgets.actions}
                    onChange={(e) => setDashboardWidgets({...dashboardWidgets, actions: e.target.checked})}
                    className="w-4 h-4"
                  />
                  Quick Action Wheel
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={dashboardWidgets.checklist}
                    onChange={(e) => setDashboardWidgets({...dashboardWidgets, checklist: e.target.checked})}
                    className="w-4 h-4"
                  />
                  Show Prep Checklist
                </label>
              </div>
            </div>

            {/* My Credentials Viewer / Editor */}
            <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
              <span className="text-xs font-bold flex items-center gap-1.5 text-indigo-300">
                🔑 My Security Credentials
              </span>
              <div className="flex flex-col gap-1 mt-1">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">Email Address</label>
                <input 
                  type="text" 
                  readOnly 
                  value={currentUser?.email || ''} 
                  className="bg-black/30 text-xs py-1 px-2.5 rounded border border-white/5 opacity-80 cursor-not-allowed w-full" 
                />
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">My Password</label>
                <div className="relative">
                  <input
                    type={showMyPassword ? "text" : "password"}
                    value={myPasswordVal}
                    onChange={(e) => setMyPasswordVal(e.target.value)}
                    className="w-full text-xs py-1.5 pl-3 pr-10 bg-slate-900 border border-white/10 text-white rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMyPassword(!showMyPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                  >
                    {showMyPassword ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4 opacity-50" />}
                  </button>
                </div>
                {myPasswordVal !== currentUser?.password && (
                  <button
                    onClick={handleUpdateMyPassword}
                    className="btn-interactive text-[10px] py-1 px-2 bg-indigo-650 hover:bg-indigo-600 border-none font-bold mt-1.5 text-center w-full"
                  >
                    Update My Password
                  </button>
                )}
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="btn-interactive text-xs py-2 px-3 bg-red-700/80 mt-2 flex items-center justify-center gap-2 font-bold"
            >
              <LogOut className="w-4 h-4" /> Log Out ({currentUser?.name})
            </button>
          </div>
        </div>

        {/* Center Panel */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              
              {/* Customizable Widget 1: Quick Stats */}
              {dashboardWidgets.stats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-container p-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70">Total Animals</span>
                      <h3 className="text-3xl font-extrabold mt-1">{rabbits.length}</h3>
                    </div>
                    <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                      <Rabbit className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="glass-container p-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70">Active Breedings</span>
                      <h3 className="text-3xl font-extrabold mt-1">
                        {breedings.filter(b => b.status === 'bred' || b.status === 'palpated_positive').length}
                      </h3>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                      <Calendar className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="glass-container p-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70">Ledger Balance</span>
                      <h3 className="text-3xl font-extrabold mt-1">
                        ${ledger.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0).toFixed(2)}
                      </h3>
                    </div>
                    <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
                      <DollarSign className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              )}

              {/* Customizable Widget 2: Calendar Tasks */}
              {dashboardWidgets.alerts && (
                <div className="glass-container p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Upcoming Barn Tasks & Reminders</h3>
                    <Award className="w-6 h-6 text-yellow-500" />
                  </div>

                  <div className="flex flex-col gap-3">
                    {breedings.filter(b => b.status !== 'kindled' && b.status !== 'failed').map(b => {
                      const doe = rabbits.find(r => r.id === b.doeId);
                      return (
                        <div key={b.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-bold px-2 py-1 rounded">Gestation Chain</span>
                            <h4 className="font-bold mt-2">Doe: {doe ? doe.name : 'Unknown'} ({doe ? doe.tattooNumber : ''})</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-xs opacity-80">
                              <span>Palpate: <strong>{b.palpateDate}</strong></span>
                              <span>Nest Box: <strong>{b.nestBoxDate}</strong></span>
                              <span>Expected Kindle: <strong>{b.kindleDate}</strong></span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {b.status === 'bred' && (
                              <>
                                <button onClick={() => logPalpation(b.id, true)} className="btn-interactive text-xs py-1 px-3 bg-green-600">Palpate Positive</button>
                                <button onClick={() => logPalpation(b.id, false)} className="btn-interactive text-xs py-1 px-3 bg-red-600">Negative</button>
                              </>
                            )}
                            {b.status === 'palpated_positive' && (
                              <button 
                                onClick={() => {
                                  const alive = prompt("Kits born alive:", "6");
                                  const dead = prompt("Kits born dead:", "0");
                                  if (alive !== null) logKindle(b.id, alive, dead || 0);
                                }} 
                                className="btn-interactive text-xs py-1 px-3 bg-amber-600"
                              >
                                Log Birth (Kindle)
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {breedings.filter(b => b.status !== 'kindled' && b.status !== 'failed').length === 0 && (
                      <p className="text-sm opacity-60 text-center py-4">No active breeding chains. Head to the Breeding tab to schedule one!</p>
                    )}

                    {/* Shows Notifications & Countdown Alerts */}
                    {shows.filter(s => s.status === 'attending' || s.status === 'interested').map(s => {
                      const dateObj = new Date(s.date);
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      const diffTime = dateObj - today;
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                      if (diffDays < 0 || diffDays > 14) return null;

                      return (
                        <div key={s.id} className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/25 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <span className="text-xs bg-yellow-500/20 text-yellow-300 font-bold px-2 py-1 rounded">Upcoming Show Alert</span>
                            <h4 className="font-bold mt-2 text-white">{s.name}</h4>
                            <p className="text-xs opacity-85 mt-1">Location: {s.location || 'TBD'} | Date: {s.date}</p>
                            <p className="text-xs text-yellow-400 font-bold mt-1">
                              ⚠️ {diffDays === 0 ? "TODAY IS SHOW DAY!" : `${diffDays} days remaining.`} 
                              {s.status === 'attending' && " Prepare pedigrees, weigh rabbits, and check tattoos!"}
                            </p>
                          </div>
                          <button 
                            onClick={() => setActiveTab('shows')} 
                            className="btn-interactive text-xs py-1.5 px-3 bg-amber-600/80 border-none"
                          >
                            Exhibitor Details
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Customizable Widget 3: Quick Action Wheel */}
              {dashboardWidgets.actions && (
                <div className="glass-container p-6 flex flex-col gap-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider opacity-60">Quick Barn Commands</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button onClick={() => { setActiveTab('rabbits'); setShowAddRabbit(true); }} className="btn-interactive py-3 bg-indigo-600 flex flex-col gap-2">
                      <Plus className="w-5 h-5" /> Register Rabbit
                    </button>
                    <button onClick={() => setActiveTab('breeding')} className="btn-interactive py-3 bg-pink-600 flex flex-col gap-2">
                      <Calendar className="w-5 h-5" /> Log Mating
                    </button>
                    <button onClick={() => setActiveTab('ledger')} className="btn-interactive py-3 bg-green-600 flex flex-col gap-2">
                      <DollarSign className="w-5 h-5" /> Record Sale
                    </button>
                    <button 
                      onClick={() => {
                        triggerConfetti();
                        setSuccessMascot({
                          type: 'usagi',
                          emoji: '🧼',
                          title: 'Barn Cleaned!',
                          message: 'Your Registrar partner reports that all cages have been recorded as cleaned and sanitized. 10XP points awarded!'
                        });
                      }} 
                      className="btn-interactive py-3 bg-amber-600 flex flex-col gap-2"
                    >
                      <Sparkles className="w-5 h-5" /> Sweep Cages
                    </button>
                  </div>
                </div>
              )}

              {/* Customizable Widget 4: Show Prep Checklist & Chores */}
              {dashboardWidgets.checklist && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Daily Hutch Chores */}
                  <div className="glass-container p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h3 className="text-base font-bold flex items-center gap-1.5 text-indigo-300">
                        📋 Daily Hutch Chores
                      </h3>
                      <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded font-bold font-mono">
                        {chores.filter(c => c.completed).length} / {chores.length} Done
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-1">
                      {chores.map(chore => (
                        <label 
                          key={chore.id} 
                          className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${chore.completed ? 'bg-green-500/10 border-green-500/30 text-green-300 line-through opacity-75' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                          <input 
                            type="checkbox"
                            checked={chore.completed}
                            onChange={() => handleChoreToggle(chore)}
                            className="w-4 h-4 rounded cursor-pointer accent-green-500"
                          />
                          <span className="font-semibold">{chore.taskName}</span>
                        </label>
                      ))}
                      {chores.length === 0 && (
                        <p className="text-xs opacity-60 text-center py-4">No daily chores set for this hutch.</p>
                      )}
                      
                      {chores.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            setLastChoresSavedTime(timeStr);
                            
                            // Log offline-first/online sync action
                            addSyncAction('UPDATE', 'chores', { chores });
                            
                            setSuccessMascot({
                              title: "Hutch Chores Synced!",
                              message: `Daily chores log (${chores.filter(c => c.completed).length} of ${chores.length} completed) successfully committed to local SQLite storage at ${timeStr}. ${isOffline ? 'Queued in change-log for PostgreSQL sync!' : 'PostgreSQL Cloud database is fully updated!'}`,
                              type: 'usagi'
                            });
                            triggerConfetti();
                            showToast("Daily hutch chores saved & synced!", "success");
                          }}
                          className="btn-interactive text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-650 mt-3 border-none font-bold text-white shadow flex items-center justify-center gap-1.5 w-full"
                        >
                          Save & Sync Hutch Chores
                        </button>
                      )}

                      {/* Live Sync Status Panel */}
                      <div className="flex justify-between items-center text-[10px] opacity-75 border-t border-white/5 pt-2.5 mt-2">
                        <div className="flex items-center gap-1">
                          {isOffline ? (
                            <span className="flex items-center gap-1 text-orange-400 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
                              Offline Cache (Sync Pending)
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Cloud Sync Active (Auto-save)
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-white/60">
                          Saved: <strong className="text-indigo-200">{lastChoresSavedTime}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Show Prep */}
                  <div className="glass-container p-6 flex flex-col gap-4">
                    <h3 className="text-base font-bold text-indigo-300">Show Prep Checklist</h3>
                    <ul className="text-sm space-y-2 opacity-90">
                      <li className="flex items-center gap-2">🟢 Check senior weights fit breed thresholds</li>
                      <li className="flex items-center gap-2">🟢 Print ARBA-compliant 3-generation pedigrees</li>
                      <li className="flex items-center gap-2">🟢 Verify tattoo matches registration paper</li>
                      <li className="flex items-center gap-2">🟢 Scan cage cards to audit hutch list</li>
                    </ul>
                  </div>

                  {/* Column 3: Security & Privacy */}
                  <div className="glass-container p-6 flex flex-col gap-4 bg-gradient-to-br from-indigo-900/20 to-pink-900/20">
                    <h3 className="text-base font-bold text-indigo-300">Youth 4-H Security & Privacy</h3>
                    <p className="text-xs leading-relaxed opacity-85">
                      The app isolates data for youth profiles. When sharing pedigree QR codes or transfers, contact numbers and locations are programmatically masked. HIPAA filters block human medical logs in veterinary description files.
                    </p>
                  </div>
                </div>
              )}

              {/* Achievements and Gamification Widget */}
              {designMode === 'fun' && (() => {
                const hasPedigree = rabbits.some(r => r.sireId && r.damId);
                const ledgerCount = ledger.filter(t => ['feed', 'medical', 'equipment'].includes(t.category)).length;
                const hutchHero = ledgerCount >= 3;
                const litterLegend = litters.length >= 1;
                const showChamp = rabbits.some(r => r.legs && r.legs.length > 0);
                return (
                  <div className="glass-container p-6 flex flex-col gap-4 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-pink-950/40 border border-purple-500/25 relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-28 h-28 bg-pink-500/10 rounded-full blur-xl pointer-events-none"></div>
                    
<div className="flex justify-between items-center">
                      <h3 className="text-base font-bold flex items-center gap-1.5 text-pink-300">
                        <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: '6s' }} /> Hutch Achievements & Show Ribbons
                      </h3>
                      <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded font-mono text-indigo-300">Streaks Active</span>
                    </div>

                    <p className="text-xs opacity-75">Complete breeding logs, registrations, and ledger sheets to unlock digital show ribbon awards!</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
                      
                      {/* Badge 1: Pedigree Builder */}
                      <div className={`relative group p-3 rounded-2xl flex flex-col items-center text-center gap-1.5 border transition-all ${hasPedigree ? 'bg-white/5 border-pink-500/35 shadow-lg shadow-pink-500/5 animate-bounce-subtle' : 'bg-black/30 border-white/5 opacity-50'}`}>
                        <span className="text-2xl">🏆</span>
                        <span className="text-[10px] font-bold text-white leading-tight">Pedigree Builder</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${hasPedigree ? 'bg-pink-500/20 text-pink-300 font-bold' : 'bg-slate-500/20 text-slate-400'}`}>
                          {hasPedigree ? 'UNLOCKED' : 'LOCKED'}
                        </span>
                        
                        {/* Premium Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-52 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none z-30 bg-slate-950/95 border border-pink-500/40 rounded-xl p-3 shadow-2xl text-[10px] text-pink-100 leading-normal font-sans text-center">
                          <div className="font-extrabold text-white mb-1 flex items-center justify-center gap-1">
                            {hasPedigree ? '✨ Badge Unlocked! ✨' : '🔒 Unlock Requirement'}
                          </div>
                          <p className="opacity-90">
                            {hasPedigree 
                              ? 'You built a multi-generation lineage for your rabbits!' 
                              : 'Register a Sire (father) and a Dam (mother) for any rabbit to build a pedigree tree.'}
                          </p>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-950"></div>
                        </div>
                      </div>

                      {/* Badge 2: Hutch Hero */}
                      <div className={`relative group p-3 rounded-2xl flex flex-col items-center text-center gap-1.5 border transition-all ${hutchHero ? 'bg-white/5 border-yellow-500/35 shadow-lg shadow-yellow-500/5 animate-bounce-subtle' : 'bg-black/30 border-white/5 opacity-50'}`}>
                        <span className="text-2xl">🥕</span>
                        <span className="text-[10px] font-bold text-white leading-tight">Hutch Hero</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${hutchHero ? 'bg-yellow-500/20 text-yellow-300 font-bold' : 'bg-slate-500/20 text-slate-400'}`}>
                          {hutchHero ? 'UNLOCKED' : 'LOCKED'}
                        </span>

                        {/* Premium Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-52 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none z-30 bg-slate-950/95 border border-yellow-500/40 rounded-xl p-3 shadow-2xl text-[10px] text-yellow-100 leading-normal font-sans text-center">
                          <div className="font-extrabold text-white mb-1 flex items-center justify-center gap-1">
                            {hutchHero ? '✨ Badge Unlocked! ✨' : '🔒 Unlock Requirement'}
                          </div>
                          <p className="opacity-90">
                            {hutchHero 
                              ? 'Logged 3+ active hutch expense transactions!' 
                              : 'Record at least 3 transactions in the Ledger under Feed, Medical, or Equipment expenses.'}
                          </p>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-950"></div>
                        </div>
                      </div>

                      {/* Badge 3: Litter Legend */}
                      <div className={`relative group p-3 rounded-2xl flex flex-col items-center text-center gap-1.5 border transition-all ${litterLegend ? 'bg-white/5 border-emerald-500/35 shadow-lg shadow-emerald-500/5 animate-bounce-subtle' : 'bg-black/30 border-white/5 opacity-50'}`}>
                        <span className="text-2xl">🐰</span>
                        <span className="text-[10px] font-bold text-white leading-tight">Litter Legend</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${litterLegend ? 'bg-green-500/20 text-green-300 font-bold' : 'bg-slate-500/20 text-slate-400'}`}>
                          {litterLegend ? 'UNLOCKED' : 'LOCKED'}
                        </span>

                        {/* Premium Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-52 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none z-30 bg-slate-950/95 border border-emerald-500/40 rounded-xl p-3 shadow-2xl text-[10px] text-emerald-100 leading-normal font-sans text-center">
                          <div className="font-extrabold text-white mb-1 flex items-center justify-center gap-1">
                            {litterLegend ? '✨ Badge Unlocked! ✨' : '🔒 Unlock Requirement'}
                          </div>
                          <p className="opacity-90">
                            {litterLegend 
                              ? 'Logged birth records successfully!' 
                              : 'Log at least 1 litter birth (Kindle event) from the Gestation Chain reminders on the dashboard.'}
                          </p>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-950"></div>
                        </div>
                      </div>

                      {/* Badge 4: Show Champion */}
                      <div className={`relative group p-3 rounded-2xl flex flex-col items-center text-center gap-1.5 border transition-all ${showChamp ? 'bg-white/5 border-sky-500/35 shadow-lg shadow-sky-500/5 animate-bounce-subtle' : 'bg-black/30 border-white/5 opacity-50'}`}>
                        <span className="text-2xl">🏅</span>
                        <span className="text-[10px] font-bold text-white leading-tight">Show Champion</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${showChamp ? 'bg-sky-500/20 text-sky-300 font-bold' : 'bg-slate-500/20 text-slate-400'}`}>
                          {showChamp ? 'UNLOCKED' : 'LOCKED'}
                        </span>

                        {/* Premium Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-52 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none z-30 bg-slate-950/95 border border-sky-500/40 rounded-xl p-3 shadow-2xl text-[10px] text-sky-100 leading-normal font-sans text-center">
                          <div className="font-extrabold text-white mb-1 flex items-center justify-center gap-1">
                            {showChamp ? '✨ Badge Unlocked! ✨' : '🔒 Unlock Requirement'}
                          </div>
                          <p className="opacity-90">
                            {showChamp 
                              ? 'Registered a Show Leg award certificate!' 
                              : 'Register a Show Leg award ribbon for any rabbit under the Rabbits management tab.'}
                          </p>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-950"></div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* Breeder Assistant Panel (Only visible to Breeder/Owners, since assistants don't manage workers) */}
              {currentUser?.role === 'owner' && !currentUser?.isSuperAdmin && (
                <div className="glass-container p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold flex items-center gap-1.5 text-indigo-300">
                      🌾 Barn Assistants & Workers
                    </h3>
                    <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded font-mono text-indigo-300">
                      My ID: {currentUser?.accountNumber || 'Pending'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col gap-2">
                    <span className="text-xs font-bold text-indigo-300">Invite Barn Assistants</span>
                    <p className="text-[11px] opacity-75">
                      Send assistants this registration link. It automatically links their account application to your hutch registry using your account number:
                    </p>
                    <div className="flex gap-2 mt-1">
                      <input 
                        type="text" 
                        readOnly 
                        value={`${window.location.origin}${window.location.pathname}?inviteCode=${currentUser?.accountNumber || ''}`}
                        className="text-[10px] py-1 px-2.5 bg-slate-900 border border-white/10 rounded-lg flex-1 text-indigo-200 select-all"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?inviteCode=${currentUser?.accountNumber || ''}`);
                          alert("Assistant invite link copied to clipboard!");
                        }}
                        className="text-[10px] py-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-1">
                    {adminBreeders
                      .filter(b => b.role === 'assistant' && b.employerAccountNumber === currentUser?.accountNumber)
                      .map(assistant => (
                        <div key={assistant.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-sm">{assistant.name} ({assistant.username})</h4>
                            <p className="text-xs opacity-70">{assistant.email} | Phone: {assistant.phone || 'N/A'}</p>
                            <p className="text-xs font-semibold mt-1">
                              Status: <span className={assistant.employerStatus === 'active' ? 'text-green-400 font-bold' : 'text-amber-400 font-bold'}>{assistant.employerStatus === 'active' ? 'Active Worker' : 'Pending Approval'}</span>
                            </p>
                          </div>

                          <div className="flex gap-2">
                            {assistant.employerStatus === 'pending' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdminBreeders(prev => {
                                      const next = prev.map(b => b.id === assistant.id ? { ...b, employerStatus: 'active' } : b);
                                      localStorage.setItem('rp_admin_breeders', JSON.stringify(next));
                                      return next;
                                    });
                                    alert(`${assistant.name} has been added to your barn crew as an active assistant!`);
                                    triggerConfetti();
                                  }}
                                  className="btn-interactive text-xs py-1.5 px-3 bg-green-600 border-none font-bold"
                                >
                                  Add to Barn
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Permanently delete worker application from ${assistant.name}?`)) {
                                      setAdminBreeders(prev => {
                                        const next = prev.filter(b => b.id !== assistant.id);
                                        localStorage.setItem('rp_admin_breeders', JSON.stringify(next));
                                        return next;
                                      });
                                      alert("Assistant registration request deleted.");
                                    }
                                  }}
                                  className="btn-interactive text-xs py-1.5 px-3 bg-red-750 border-none font-bold"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to permanently delete assistant account ${assistant.name}? This will immediately revoke all access to your hutch.`)) {
                                    setAdminBreeders(prev => {
                                      const next = prev.filter(b => b.id !== assistant.id);
                                      localStorage.setItem('rp_admin_breeders', JSON.stringify(next));
                                      return next;
                                    });
                                    alert(`Assistant account ${assistant.name} has been permanently deleted.`);
                                  }
                                }}
                                className="text-red-400 hover:text-red-350 text-xs font-bold border border-red-500/25 bg-red-500/10 py-1.5 px-3 rounded-lg hover:bg-red-500/20 transition-all"
                              >
                                Delete Account
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    {adminBreeders.filter(b => b.role === 'assistant' && b.employerAccountNumber === currentUser?.accountNumber).length === 0 && (
                      <p className="text-center text-xs opacity-60 py-4">No assistants are currently associated with your hutch.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Assistant Workspace Panel */}
              {currentUser?.role === 'assistant' && (
                <div className="glass-container p-6 flex flex-col gap-4">
                  <h3 className="text-base font-bold flex items-center gap-1.5 text-indigo-300">
                    🌾 Assistant Workspace
                  </h3>
                  <p className="text-xs opacity-85">
                    You are registered as a Barn Assistant. You have your own private hutch registry by default. 
                  </p>
                  {currentUser.employerEmail ? (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-xs font-semibold">
                        Employer Association: <strong className="text-indigo-200">{currentUser.employerEmail}</strong>
                      </p>
                      <p className="text-xs mt-1 text-slate-300">
                        Status: <span className={currentUser.employerStatus === 'active' ? 'text-green-400 font-bold' : 'text-amber-400 font-bold'}>
                          {currentUser.employerStatus === 'active' ? 'Active Worker (Registry Switcher Unlocked)' : 'Pending Employer Approval'}
                        </span>
                      </p>
                      {currentUser.employerStatus === 'active' ? (
                        <p className="text-[11px] opacity-70 mt-2">
                          💡 <strong>Use the Context Switcher</strong> in the top header to toggle between your own hutch and your employer's hutch registry to document their data.
                        </p>
                      ) : (
                        <p className="text-[11px] opacity-70 mt-2">
                          ⏳ Please ask your employer to log in and approve your worker association request from their dashboard to grant you documenting abilities.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-xs text-amber-400 font-bold">No Employer Associated</p>
                      <p className="text-xs opacity-70 mt-1">
                        You can update your security credentials or profile options to link your account to an employer.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: RABBITS REGISTRY & PEDIGREES */}
          {activeTab === 'rabbits' && (
            <div className="flex flex-col gap-6">
              
              {/* Search and Add Header */}
              <div className="glass-container p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <input 
                  type="text" 
                  placeholder="Search rabbits by name, tattoo, breed..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-80"
                />

                <button 
                  onClick={() => setShowAddRabbit(true)}
                  className="btn-interactive w-full sm:w-auto"
                >
                  <Plus className="w-5 h-5" /> Add New Rabbit
                </button>
              </div>

              {/* Add Rabbit Form overlay */}
              {showAddRabbit && (
                <div className="glass-container p-6 border border-pink-500/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">New Rabbit Registration</h3>
                    <button onClick={() => setShowAddRabbit(false)} className="opacity-70 hover:opacity-100"><X className="w-6 h-6" /></button>
                  </div>

                  <form onSubmit={handleAddRabbit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold">Tattoo Number *</label>
                      <input 
                        type="text" required placeholder="E.g., B12" 
                        value={newRabbit.tattooNumber}
                        onChange={(e) => setNewRabbit({...newRabbit, tattooNumber: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold">Name *</label>
                      <input 
                        type="text" required placeholder="Blue Shadow" 
                        value={newRabbit.name}
                        onChange={(e) => setNewRabbit({...newRabbit, name: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold">Breed</label>
                      <select 
                        value={newRabbit.breed}
                        onChange={(e) => setNewRabbit({...newRabbit, breed: e.target.value})}
                      >
                        {Object.keys(BREED_STANDARDS).map(breedName => (
                          <option key={breedName} value={breedName}>
                            {breedName} ({BREED_STANDARDS[breedName].classType})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold">Variety (Color)</label>
                      <input 
                        type="text" placeholder="E.g. Broken Blue" 
                        value={newRabbit.variety}
                        onChange={(e) => setNewRabbit({...newRabbit, variety: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold">Sex</label>
                      <select 
                        value={newRabbit.sex}
                        onChange={(e) => setNewRabbit({...newRabbit, sex: e.target.value})}
                      >
                        <option value="doe">Doe (Female)</option>
                        <option value="buck">Buck (Male)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold">Date of Birth</label>
                      <input 
                        type="date" 
                        value={newRabbit.dob}
                        onChange={(e) => setNewRabbit({...newRabbit, dob: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold">Current Weight (ounces)</label>
                      <input 
                        type="number" 
                        value={newRabbit.weightOz}
                        onChange={(e) => setNewRabbit({...newRabbit, weightOz: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold">Sire (Sire Tattoo)</label>
                      <select 
                        value={newRabbit.sireId}
                        onChange={(e) => setNewRabbit({...newRabbit, sireId: e.target.value})}
                      >
                        <option value="">None (Unknown)</option>
                        {rabbits.filter(r => r.sex === 'buck').map(r => (
                          <option key={r.id} value={r.id}>{r.name} ({r.tattooNumber})</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold">Dam (Dam Tattoo)</label>
                      <select 
                        value={newRabbit.damId}
                        onChange={(e) => setNewRabbit({...newRabbit, damId: e.target.value})}
                      >
                        <option value="">None (Unknown)</option>
                        {rabbits.filter(r => r.sex === 'doe').map(r => (
                          <option key={r.id} value={r.id}>{r.name} ({r.tattooNumber})</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold">Cage / Hutch Location</label>
                      <input 
                        type="text" placeholder="E.g. A-12" 
                        value={newRabbit.location}
                        onChange={(e) => setNewRabbit({...newRabbit, location: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold">ARBA Registration # (optional)</label>
                      <input 
                        type="text" 
                        value={newRabbit.registrationNumber}
                        onChange={(e) => setNewRabbit({...newRabbit, registrationNumber: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold">Grand Champion # (optional)</label>
                      <input 
                        type="text" 
                        value={newRabbit.gcNumber}
                        onChange={(e) => setNewRabbit({...newRabbit, gcNumber: e.target.value})}
                      />
                    </div>
                    
                    <div className="md:col-span-3 mt-2">
                      <button type="submit" className="btn-interactive w-full">Save Profile to SQLite</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Rabbits Table/List */}
              <div className="glass-container p-6 flex flex-col gap-4">
                <h3 className="text-lg font-bold">Active Rabbitry Inventory</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider opacity-70">
                        <th className="pb-3">Tattoo</th>
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Breed / Variety</th>
                        <th className="pb-3">Sex</th>
                        <th className="pb-3">Weight (lbs)</th>
                        <th className="pb-3">Inbreeding (F)</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {filteredRabbits.map(r => (
                        <tr key={r.id} className="hover:bg-white/5 transition-all">
                          <td className="py-3 font-semibold text-indigo-400">{r.tattooNumber}</td>
                          <td className="py-3 font-bold">
                             {r.name}
                             {r.status === 'sold' && (
                               <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-400 border border-white/5">
                                 Sold
                               </span>
                             )}
                           </td>
                          <td className="py-3">{r.breed} - {r.variety}</td>
                          <td className="py-3 capitalize">{r.sex}</td>
                          <td className="py-3">{(r.weightOz / 16).toFixed(2)} lbs</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.inbreedingCoeff > 0.1 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                              {(r.inbreedingCoeff * 100).toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-3">
                             <div className="flex gap-2 items-center">
                               <button 
                                 onClick={() => setSelectedRabbit(r)} 
                                 className="btn-interactive text-xs py-1 px-3 bg-indigo-600 font-bold text-white border-none"
                               >
                                 View Profile
                               </button>
                               {!isAssistantWriteOnly && r.status !== 'sold' && (
                                 <button 
                                   onClick={() => {
                                     setBuyerDetails({ name: '', email: '', phone: '', price: '', type: 'sale', notes: '' });
                                     setSellerSignature('');
                                     setBuyerSignature('');
                                     setTransferWizardStep(1);
                                     setShowTransferWizard(r);
                                   }} 
                                   className="btn-interactive text-xs py-1 px-3 bg-emerald-600 hover:bg-emerald-650 border-none font-bold text-white"
                                 >
                                   Transfer
                                 </button>
                               )}
                               {!isAssistantWriteOnly && (
                                 <button 
                                   onClick={() => handleDeleteRabbit(r.id)} 
                                   className="text-red-400 hover:text-red-300 p-1"
                                 >
                                   <Trash2 className="w-5 h-5" />
                                 </button>
                               )}
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredRabbits.length === 0 && (
                    <p className="text-center py-6 opacity-60">No rabbits match search parameters.</p>
                  )}
                </div>
              </div>

              {/* Individual Rabbit Detail View */}
              {selectedRabbit && (
                <div className="flex flex-col gap-6">
                  
                  {/* Gallery & Show Legs Dual Panels */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* 1. Photo Gallery Section */}
                    <div className="glass-container p-6 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-bold flex items-center gap-2">
                          <ImageIcon className="w-5 h-5" /> Photo Gallery ({selectedRabbit.photos?.length || 0})
                        </h3>
                        <span className="text-xs opacity-75">All Angles</span>
                      </div>

                      {/* Photo grid display */}
                      <div className="grid grid-cols-3 gap-2">
                        {selectedRabbit.photos?.map((photo, idx) => {
                          const p = getPhotoObj(photo);
                          return (
                            <div 
                              key={idx} 
                              className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer"
                              onClick={() => setLightboxPhoto({ rabbitId: selectedRabbit.id, photoIndex: idx })}
                            >
                              <img 
                                src={p.url} 
                                alt="Rabbit angle" 
                                className="w-full h-full object-cover"
                                style={{
                                  filter: `brightness(${p.brightness || 100}%)`,
                                  transform: `rotate(${p.rotation || 0}deg)`
                                }}
                              />
                              <span className="absolute bottom-1 left-1 bg-black/60 px-1 py-0.5 rounded text-[8px] font-bold text-indigo-300">
                                {p.tag}
                              </span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAllRabbits(prev => prev.map(r => {
                                    if (r.id === selectedRabbit.id) {
                                      const updated = { ...r, photos: r.photos.filter((_, pIdx) => pIdx !== idx) };
                                      setSelectedRabbit(updated);
                                      return updated;
                                    }
                                    return r;
                                  }));
                                }}
                                className="absolute top-1 right-1 p-1 bg-red-600/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-col gap-2 mt-2">
                        <form onSubmit={handleAddPhoto} className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Paste image URL..."
                            value={newPhotoUrl}
                            onChange={(e) => setNewPhotoUrl(e.target.value)}
                            className="flex-1 text-xs"
                          />
                          <button type="submit" className="btn-interactive text-xs py-2 px-4 border-none">Add URL</button>
                        </form>
                        <div className="flex items-center gap-2">
                          <span className="text-xs opacity-60">or</span>
                          <label className="btn-interactive text-xs py-1.5 px-3 cursor-pointer flex items-center gap-1.5 bg-indigo-600/80 hover:bg-indigo-600 border-none">
                            <Camera className="w-3.5 h-3.5" />
                            Upload Image File
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileUpload} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* 2. Show Legs & Certificates Safe Spot */}
                    <div className="glass-container p-6 flex flex-col gap-4">
                      <h3 className="text-base font-bold flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" /> Show Legs & Certificates ({selectedRabbit.legs?.length || 0})
                      </h3>

                      <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-2">
                        {selectedRabbit.legs?.map((leg) => (
                          <div key={leg.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-yellow-400">{leg.award}</span>
                              <p className="opacity-80">{leg.showName} ({leg.date})</p>
                              <p className="opacity-60">Judge: {leg.judge} | Class size: {leg.classSize}</p>
                            </div>
                            <button 
                              onClick={() => {
                                triggerConfetti();
                                alert(`Downloading certified Leg file: "${leg.showName}_${selectedRabbit.tattooNumber}.pdf"`);
                              }}
                              className="p-2 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-lg text-indigo-300"
                              title="Download Leg Certificate"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {(!selectedRabbit.legs || selectedRabbit.legs.length === 0) && (
                          <p className="text-xs opacity-60 text-center py-6">No leg awards logged. Add one below!</p>
                        )}
                      </div>

                      <form onSubmit={handleAddLeg} className="grid grid-cols-2 gap-2 mt-2 border-t border-white/5 pt-3">
                        <input 
                          type="text" placeholder="Show Name" required
                          value={newLeg.showName}
                          onChange={(e) => setNewLeg({...newLeg, showName: e.target.value})}
                          className="text-xs py-1.5 px-3"
                        />
                        <input 
                          type="text" placeholder="Judge Name" required
                          value={newLeg.judge}
                          onChange={(e) => setNewLeg({...newLeg, judge: e.target.value})}
                          className="text-xs py-1.5 px-3"
                        />
                        <select 
                          value={newLeg.award}
                          onChange={(e) => setNewLeg({...newLeg, award: e.target.value})}
                          className="text-xs py-1.5 px-3"
                        >
                          <option value="1st Class">1st Class Ribbon 🥇</option>
                          <option value="Best of Variety">Best of Variety (BOV) 🏆</option>
                          <option value="Best of Breed">Best of Breed (BOB) 🌟</option>
                          <option value="Best In Show">Best In Show (BIS) 👑</option>
                        </select>
                        <input 
                          type="number" placeholder="Class Size" required
                          value={newLeg.classSize}
                          onChange={(e) => setNewLeg({...newLeg, classSize: e.target.value})}
                          className="text-xs py-1.5 px-3"
                        />
                        <button type="submit" className="btn-interactive text-xs py-2 px-4 col-span-2">
                          Register Leg Certificate
                        </button>
                      </form>
                    </div>

                  </div>

                  {/* 3. Interactive Pedigree Tree View */}
                  <div className="glass-container p-6 flex flex-col gap-6 relative border border-indigo-500/30 overflow-x-auto">
                    {(() => {
                      const sire = selectedRabbit.sireId ? rabbits.find(r => r.id === selectedRabbit.sireId) : null;
                      const dam = selectedRabbit.damId ? rabbits.find(r => r.id === selectedRabbit.damId) : null;
                      
                      const patSire = sire && sire.sireId ? rabbits.find(r => r.id === sire.sireId) : null;
                      const patDam = sire && sire.damId ? rabbits.find(r => r.id === sire.damId) : null;
                      const matSire = dam && dam.sireId ? rabbits.find(r => r.id === dam.sireId) : null;
                      const matDam = dam && dam.damId ? rabbits.find(r => r.id === dam.damId) : null;

                      const patPatSire = patSire && patSire.sireId ? rabbits.find(r => r.id === patSire.sireId) : null;
                      const patPatDam = patSire && patSire.damId ? rabbits.find(r => r.id === patSire.damId) : null;
                      const patMatSire = patDam && patDam.sireId ? rabbits.find(r => r.id === patDam.sireId) : null;
                      const patMatDam = patDam && patDam.damId ? rabbits.find(r => r.id === patDam.damId) : null;

                      const matPatSire = matSire && matSire.sireId ? rabbits.find(r => r.id === matSire.sireId) : null;
                      const matPatDam = matSire && matSire.damId ? rabbits.find(r => r.id === matSire.damId) : null;
                      const matMatSire = matDam && matDam.sireId ? rabbits.find(r => r.id === matDam.sireId) : null;
                      const matMatDam = matDam && matDam.damId ? rabbits.find(r => r.id === matDam.damId) : null;

                      const renderNodeCard = (rabbit, roleLabel, gender, onClick) => {
                        const isUnknown = !rabbit;
                        let bgClass = '';
                        let borderClass = '';
                        let textClass = '';
                        
                        if (isUnknown) {
                          bgClass = 'bg-black/35 hover:bg-black/45 border-dashed border-white/10 hover:border-white/20';
                          borderClass = 'border';
                          textClass = 'text-slate-400';
                        } else {
                          textClass = 'text-white';
                          if (gender === 'buck') {
                            bgClass = 'bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/20 hover:border-blue-500/35';
                          } else {
                            bgClass = 'bg-pink-500/10 hover:bg-pink-500/15 border-pink-500/20 hover:border-pink-500/35';
                          }
                          borderClass = rabbit.gcNumber ? 'champion-gold-border' : 'border border-white/10';
                        }
                        
                        return (
                          <div 
                            onClick={onClick}
                            className={`p-3 rounded-xl flex gap-2.5 items-center cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${bgClass} ${borderClass}`}
                            style={{ minHeight: '64px' }}
                          >
                            {!isUnknown && getPrimaryPhoto(rabbit) ? (
                              <img 
                                src={getPrimaryPhoto(rabbit)} 
                                alt={roleLabel} 
                                className={`w-9 h-9 rounded object-cover shrink-0 ${gender === 'buck' ? 'border-blue-500/35' : 'border-pink-500/35'} border`}
                                style={getPrimaryPhotoStyles(rabbit)}
                              />
                            ) : (
                              <div className="w-9 h-9 rounded bg-white/5 border border-white/15 flex items-center justify-center text-sm shrink-0">
                                {gender === 'buck' ? '♂' : '♀'}
                              </div>
                            )}
                            <div className="leading-tight overflow-hidden text-left">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[8px] font-bold block uppercase tracking-wider ${gender === 'buck' ? 'text-blue-400' : 'text-pink-400'}`}>
                                  {roleLabel}
                                </span>
                                {!isUnknown && rabbit.gcNumber && (
                                  <span className="text-[7px] bg-yellow-500/20 text-yellow-300 font-bold px-1 rounded">🏆 GC</span>
                                )}
                              </div>
                              {isUnknown ? (
                                <p className="text-[10px] italic mt-0.5 text-slate-400 flex items-center gap-1">➕ Set Ancestor</p>
                              ) : (
                                <>
                                  <p className="font-bold text-xs truncate max-w-[120px] text-white">{rabbit.name}</p>
                                  <p className="text-[9px] opacity-75 mt-0.5 text-white/80">Tattoo: {rabbit.tattooNumber}</p>
                                  {rabbit.registrationNumber && <p className="text-[8px] opacity-60 text-white/60 truncate max-w-[120px]">Reg: {rabbit.registrationNumber}</p>}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      };

                      return (
                        <>
                          <div className="flex justify-between items-center gap-4 flex-wrap">
                            <div>
                              <h3 className="text-lg font-bold">Interactive Pedigree Tree</h3>
                              <p className="text-xs opacity-75">3-Generation Ancestor Lineage for: <strong>{selectedRabbit.name} ({selectedRabbit.tattooNumber})</strong></p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {!isAssistantWriteOnly && selectedRabbit.status !== 'sold' && (
                                <button 
                                  onClick={() => {
                                    setBuyerDetails({ name: '', email: '', phone: '', price: '', type: 'sale', notes: '' });
                                    setSellerSignature('');
                                    setBuyerSignature('');
                                    setTransferWizardStep(1);
                                    setShowTransferWizard(selectedRabbit);
                                  }}
                                  className="btn-interactive text-xs bg-emerald-600 border-none font-bold text-white hover:bg-emerald-650"
                                >
                                  Sell/Transfer Rabbit
                                </button>
                              )}
                              <button 
                                onClick={() => setShowEmailImportModal(true)}
                                className="btn-interactive text-xs bg-indigo-650 border-none font-bold text-white hover:bg-indigo-700 flex items-center gap-1"
                              >
                                ✉️ Import from Email
                              </button>
                              <button 
                                onClick={() => {
                                  triggerConfetti();
                                  setShowPrintPedigreeModal(selectedRabbit);
                                }}
                                className="btn-interactive text-xs bg-green-600 border-none font-bold text-white"
                              >
                                Export ARBA Certificate
                              </button>
                            </div>
                          </div>

                          {/* Horizontal Visual Tree (Flexible columns with fixed height for vertical distribution) */}
                          <div className="overflow-x-auto w-full p-2 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex justify-between gap-6 h-[640px] min-w-[960px] p-4 items-stretch relative">
                              
                              {/* Gen 1: Self */}
                              <div className="flex flex-col justify-around w-60 shrink-0">
                                {renderNodeCard(
                                  selectedRabbit, 
                                  'Offspring (Self)', 
                                  selectedRabbit.sex, 
                                  () => setPedigreeEditNode({ rabbitId: selectedRabbit.id, isOffspring: true, label: 'Offspring (Self)' })
                                )}
                              </div>

                              {/* Gen 2: Parents */}
                              <div className="flex flex-col justify-around w-60 shrink-0">
                                {renderNodeCard(
                                  sire, 
                                  'Sire (Father)', 
                                  'buck', 
                                  () => setPedigreeEditNode({ rabbitId: selectedRabbit.sireId, parentOfId: selectedRabbit.id, field: 'sireId', gender: 'buck', label: 'Sire (Father)' })
                                )}
                                {renderNodeCard(
                                  dam, 
                                  'Dam (Mother)', 
                                  'doe', 
                                  () => setPedigreeEditNode({ rabbitId: selectedRabbit.damId, parentOfId: selectedRabbit.id, field: 'damId', gender: 'doe', label: 'Dam (Mother)' })
                                )}
                              </div>

                              {/* Gen 3: Grandparents */}
                              <div className="flex flex-col justify-around w-60 shrink-0">
                                {renderNodeCard(
                                  patSire, 
                                  'Paternal Grand-Sire', 
                                  'buck', 
                                  () => sire ? setPedigreeEditNode({ rabbitId: sire.sireId, parentOfId: sire.id, field: 'sireId', gender: 'buck', label: 'Paternal Grand-Sire' }) : alert('Please set Sire first!')
                                )}
                                {renderNodeCard(
                                  patDam, 
                                  'Paternal Grand-Dam', 
                                  'doe', 
                                  () => sire ? setPedigreeEditNode({ rabbitId: sire.damId, parentOfId: sire.id, field: 'damId', gender: 'doe', label: 'Paternal Grand-Dam' }) : alert('Please set Sire first!')
                                )}
                                {renderNodeCard(
                                  matSire, 
                                  'Maternal Grand-Sire', 
                                  'buck', 
                                  () => dam ? setPedigreeEditNode({ rabbitId: dam.sireId, parentOfId: dam.id, field: 'sireId', gender: 'buck', label: 'Maternal Grand-Sire' }) : alert('Please set Dam first!')
                                )}
                                {renderNodeCard(
                                  matDam, 
                                  'Maternal Grand-Dam', 
                                  'doe', 
                                  () => dam ? setPedigreeEditNode({ rabbitId: dam.damId, parentOfId: dam.id, field: 'damId', gender: 'doe', label: 'Maternal Grand-Dam' }) : alert('Please set Dam first!')
                                )}
                              </div>

                              {/* Gen 4: Great-Grandparents */}
                              <div className="flex flex-col justify-around w-60 shrink-0">
                                {renderNodeCard(
                                  patPatSire, 
                                  'Paternal P. Grand-Sire', 
                                  'buck', 
                                  () => patSire ? setPedigreeEditNode({ rabbitId: patSire.sireId, parentOfId: patSire.id, field: 'sireId', gender: 'buck', label: 'Paternal Paternal Great-Grand-Sire' }) : alert('Please set Paternal Grand-Sire first!')
                                )}
                                {renderNodeCard(
                                  patPatDam, 
                                  'Paternal P. Grand-Dam', 
                                  'doe', 
                                  () => patSire ? setPedigreeEditNode({ rabbitId: patSire.damId, parentOfId: patSire.id, field: 'damId', gender: 'doe', label: 'Paternal Paternal Great-Grand-Dam' }) : alert('Please set Paternal Grand-Sire first!')
                                )}
                                {renderNodeCard(
                                  patMatSire, 
                                  'Paternal M. Grand-Sire', 
                                  'buck', 
                                  () => patDam ? setPedigreeEditNode({ rabbitId: patDam.sireId, parentOfId: patDam.id, field: 'sireId', gender: 'buck', label: 'Paternal Maternal Great-Grand-Sire' }) : alert('Please set Paternal Grand-Dam first!')
                                )}
                                {renderNodeCard(
                                  patMatDam, 
                                  'Paternal M. Grand-Dam', 
                                  'doe', 
                                  () => patDam ? setPedigreeEditNode({ rabbitId: patDam.damId, parentOfId: patDam.id, field: 'damId', gender: 'doe', label: 'Paternal Maternal Great-Grand-Dam' }) : alert('Please set Paternal Grand-Dam first!')
                                )}
                                {renderNodeCard(
                                  matPatSire, 
                                  'Maternal P. Grand-Sire', 
                                  'buck', 
                                  () => matSire ? setPedigreeEditNode({ rabbitId: matSire.sireId, parentOfId: matSire.id, field: 'sireId', gender: 'buck', label: 'Maternal Paternal Great-Grand-Sire' }) : alert('Please set Maternal Grand-Sire first!')
                                )}
                                {renderNodeCard(
                                  matPatDam, 
                                  'Maternal P. Grand-Dam', 
                                  'doe', 
                                  () => matSire ? setPedigreeEditNode({ rabbitId: matSire.damId, parentOfId: matSire.id, field: 'damId', gender: 'doe', label: 'Maternal Paternal Great-Grand-Dam' }) : alert('Please set Maternal Grand-Sire first!')
                                )}
                                {renderNodeCard(
                                  matMatSire, 
                                  'Maternal M. Grand-Sire', 
                                  'buck', 
                                  () => matDam ? setPedigreeEditNode({ rabbitId: matDam.sireId, parentOfId: matDam.id, field: 'sireId', gender: 'buck', label: 'Maternal Maternal Great-Grand-Sire' }) : alert('Please set Maternal Grand-Dam first!')
                                )}
                                {renderNodeCard(
                                  matMatDam, 
                                  'Maternal M. Grand-Dam', 
                                  'doe', 
                                  () => matDam ? setPedigreeEditNode({ rabbitId: matDam.damId, parentOfId: matDam.id, field: 'damId', gender: 'doe', label: 'Maternal Maternal Great-Grand-Dam' }) : alert('Please set Maternal Grand-Dam first!')
                                )}
                              </div>

                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 3: BREEDING & REPRODUCTION */}
          {activeTab === 'breeding' && (
            <div className="flex flex-col gap-6">
              
              {/* Breeding Scheduler Form */}
              <div className="glass-container p-6">
                <h3 className="text-lg font-bold mb-4">Schedule a Breeding Pair</h3>
                <form onSubmit={handleAddBreeding} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-blue-400">Sire (Buck)</label>
                    <select 
                      value={newBreeding.buckId}
                      onChange={(e) => setNewBreeding({...newBreeding, buckId: e.target.value})}
                      required
                    >
                      <option value="">Select Buck</option>
                      {rabbits.filter(r => r.sex === 'buck').map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.tattooNumber})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-pink-400">Dam (Doe)</label>
                    <select 
                      value={newBreeding.doeId}
                      onChange={(e) => setNewBreeding({...newBreeding, doeId: e.target.value})}
                      required
                    >
                      <option value="">Select Doe</option>
                      {rabbits.filter(r => r.sex === 'doe').map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.tattooNumber})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold">Breeding Date</label>
                    <input 
                      type="date"
                      value={newBreeding.breedDate}
                      onChange={(e) => setNewBreeding({...newBreeding, breedDate: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <button type="submit" className="btn-interactive w-full">Log Breeding Chain to Local Queue</button>
                  </div>
                </form>
              </div>

              {/* Litters Logs */}
              <div className="glass-container p-6">
                <h3 className="text-lg font-bold mb-4">Litter Production Logs</h3>
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
                        <p className="text-sm font-semibold">Doe: {doe ? doe.name : 'Unknown'} x Buck: {buck ? buck.name : 'Unknown'}</p>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs bg-white/5 p-2 rounded-lg mt-1">
                          <div>
                            <span className="opacity-70 block">Born Alive</span>
                            <span className="font-bold text-green-400 text-sm">{l.kitsBornAlive}</span>
                          </div>
                          <div>
                            <span className="opacity-70 block">Born Dead</span>
                            <span className="font-bold text-red-400 text-sm">{l.kitsBornDead}</span>
                          </div>
                          <div>
                            <span className="opacity-70 block">Weaned</span>
                            <span className="font-bold text-indigo-400 text-sm">{l.kitsBornAlive - l.kitsBornDead}</span>
                          </div>
                        </div>
                        <p className="text-xs opacity-75 mt-1">Notes: {l.notes || 'None recorded.'}</p>
                      </div>
                    );
                  })}
                  {litters.length === 0 && (
                    <p className="text-sm opacity-60 text-center py-6 md:col-span-2">No litter entries yet.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: LEDGER LEDGER */}
          {activeTab === 'ledger' && (
            <div className="flex flex-col gap-6">
              
              {/* Add Transaction Form */}
              <div className="glass-container p-6">
                <h3 className="text-lg font-bold mb-4">Log Transaction</h3>
                <form onSubmit={handleAddTx} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold">Type</label>
                    <select 
                      value={newTx.type}
                      onChange={(e) => setNewTx({...newTx, type: e.target.value})}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold">Category</label>
                    <select 
                      value={newTx.category}
                      onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                    >
                      <option value="feed">Feed</option>
                      <option value="medical">Medical</option>
                      <option value="equipment">Equipment</option>
                      <option value="sale">Sale of Rabbit</option>
                      <option value="show_fee">Show Entry Fee</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold">Amount ($)</label>
                    <input 
                      type="number" step="0.01" required placeholder="0.00"
                      value={newTx.amount}
                      onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold">Notes</label>
                    <input 
                      type="text" placeholder="Description"
                      value={newTx.notes}
                      onChange={(e) => setNewTx({...newTx, notes: e.target.value})}
                    />
                  </div>
                  
                  <div className="md:col-span-4">
                    <button type="submit" className="btn-interactive w-full">Record Ledger Event</button>
                  </div>
                </form>
              </div>

              {/* Transactions List */}
              <div className="glass-container p-6">
                <h3 className="text-lg font-bold mb-4">Financial Log History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider opacity-70">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Description</th>
                        <th className="pb-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {ledger.map(t => (
                        <tr key={t.id} className="hover:bg-white/5 transition-all">
                          <td className="py-3">{t.date}</td>
                          <td className="py-3 capitalize">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="py-3 capitalize">{t.category}</td>
                          <td className="py-3">{t.notes}</td>
                          <td className={`py-3 text-right font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                            {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {ledger.length === 0 && (
                    <p className="text-center py-6 opacity-60">No financial records cataloged.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB: SHOW PLANNER */}
          {activeTab === 'shows' && (
            <div className="flex flex-col gap-6">
              
              {/* Show Header */}
              <div className="glass-container p-6 flex flex-col gap-2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-400 font-bold" /> Rabbitry Show Planner & Calendar
                </h3>
                <p className="text-sm opacity-75">
                  Coordinate upcoming ARBA events, manage entries, track preparation requirements, and set notifications for barn days.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form column */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  {/* Add Custom Show Form */}
                  <div className="glass-container p-6">
                    <h3 className="text-base font-bold mb-4">Add Custom Show</h3>
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
                        <input name="showName" type="text" placeholder="e.g. ARBA Spring Classic" required />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-300">Date</label>
                        <input name="showDate" type="date" required />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-300">Location</label>
                        <input name="showLoc" type="text" placeholder="City, State" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-300">Initial Status</label>
                        <select name="showStatus" defaultValue="interested">
                          <option value="attending">Attending</option>
                          <option value="interested">Interested</option>
                          <option value="not_attending">Not Attending</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-300">Notes</label>
                        <textarea name="showNotes" placeholder="Preparation details..." rows="3" className="text-xs p-2 rounded-xl bg-white/5 border border-white/10 text-white" />
                      </div>
                      <button type="submit" className="btn-interactive w-full mt-2">Add Show to Calendar</button>
                    </form>
                  </div>

                  {/* Quick-Add Templates */}
                  <div className="glass-container p-6 flex flex-col gap-3">
                    <h3 className="text-base font-bold">Easy Import Local Shows</h3>
                    <p className="text-xs opacity-70">Single-click import for regional ARBA-registered exhibitions.</p>
                    <div className="flex flex-col gap-2">
                      {[
                        { name: "Washington County Fair Rabbit Show", date: "2026-07-28", loc: "Hillsboro, OR", notes: "Annual county exhibition. Double show." },
                        { name: "ARBA State Breeders Championship", date: "2026-08-22", loc: "Sacramento, CA", notes: "Triple-sanctioned ARBA show." },
                        { name: "Golden State Autumn Classic", date: "2026-09-15", loc: "Fresno, CA", notes: "Pre-national warm-up. Standard cages supplied." }
                      ].map((t, idx) => (
                        <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col gap-1 text-xs">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-indigo-300">{t.name}</span>
                            <span className="text-[10px] opacity-70 bg-indigo-500/20 px-1.5 py-0.5 rounded font-mono shrink-0">{t.date}</span>
                          </div>
                          <span className="opacity-60">{t.loc}</span>
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
                                notes: t.notes,
                                notifyDays: 14
                              };
                              setAllShows(prev => [newShow, ...prev]);
                              setSuccessMascot({
                                title: "Show Imported!",
                                message: `"${t.name}" added as 'Interested'. You can change your status anytime.`,
                                type: 'kiba'
                              });
                            }}
                            className="btn-interactive text-[11px] py-1 px-3 mt-1 bg-emerald-600/85 hover:bg-emerald-650 border-none self-start"
                          >
                            Import Show
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Shows list column */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="glass-container p-6">
                    <h3 className="text-lg font-bold mb-4">Your Exhibition Schedule</h3>
                    <div className="flex flex-col gap-4">
                      {shows.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).map(s => {
                        const dateObj = new Date(s.date);
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        const diffTime = dateObj - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        let badgeColor = 'bg-slate-500/20 text-slate-300';
                        if (s.status === 'attending') badgeColor = 'bg-green-500/20 text-green-300 border border-green-500/30 shadow-lg shadow-green-500/5';
                        else if (s.status === 'interested') badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';

                        return (
                          <div key={s.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-white/10">
                            <div className="flex-1 flex flex-col gap-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-base font-bold text-white">{s.name}</h4>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${badgeColor}`}>{s.status.replace('_', ' ')}</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs opacity-75">
                                <span>📅 Date: <strong>{s.date}</strong></span>
                                <span>📍 Location: <strong>{s.location || 'Not Specified'}</strong></span>
                              </div>
                              <p className="text-xs opacity-70 mt-1 italic">Notes: {s.notes || 'No notes added.'}</p>
                              {diffDays > 0 ? (
                                <span className="text-xs font-bold text-indigo-400">⏱️ {diffDays} days remaining</span>
                              ) : diffDays === 0 ? (
                                <span className="text-xs font-black text-rose-500 animate-pulse">📅 TODAY IS SHOW DAY! Best of luck! 🏆</span>
                              ) : (
                                <span className="text-xs opacity-50">Expired / Passed ({Math.abs(diffDays)} days ago)</span>
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
                                      }}
                                      className="btn-interactive py-1 px-3 bg-red-800/80 text-xs border-none"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                            </div>
                          </div>
                        );
                      })}
                      {shows.length === 0 && (
                        <p className="text-sm opacity-60 text-center py-8">No shows in your schedule. Use the forms to create or import some shows!</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB: MEDIA GALLERY */}
          {activeTab === 'media' && (
            <div className="flex flex-col gap-6">
              
              <div className="glass-container p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-sky-400 font-bold" /> WarrenWise AI Photo Gallery
                  </h3>
                  <p className="text-sm opacity-75">Timeline, tags, poses, annotations, and AI diagnostics for all rabbits.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 bg-white/5 p-1.5 rounded-xl border border-white/10">
                  <label className="text-xs font-bold px-2 cursor-pointer flex items-center gap-1.5">
                    <input 
                      type="checkbox" 
                      checked={compareMode}
                      onChange={(e) => setCompareMode(e.target.checked)}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    Side-by-Side Comparison
                  </label>
                </div>
              </div>

              {/* Side-by-side mode */}
              {compareMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  {/* Panel A */}
                  <div className="glass-container p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <h4 className="font-bold text-indigo-300 text-sm">Comparison Image A</h4>
                      {compareA && <button onClick={() => setCompareA(null)} className="text-xs opacity-60 hover:opacity-100">Clear</button>}
                    </div>
                    {compareA ? (
                      <div className="flex flex-col gap-2 items-center">
                        <div className="relative aspect-square w-full max-w-sm rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
                          <img src={compareA.url} alt="Comparison A" className="w-full h-full object-contain" />
                          <div className="absolute bottom-2 left-2 bg-slate-900/85 px-2 py-1 rounded text-[10px] font-bold text-white">
                            Tag: {compareA.tag} | Date: {compareA.date}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center opacity-60 text-xs border-2 border-dashed border-white/10 rounded-2xl">
                        Click "Select A" on any photo in the gallery below to choose Image A
                      </div>
                    )}
                  </div>

                  {/* Panel B */}
                  <div className="glass-container p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <h4 className="font-bold text-sky-300 text-sm">Comparison Image B</h4>
                      {compareB && <button onClick={() => setCompareB(null)} className="text-xs opacity-60 hover:opacity-100">Clear</button>}
                    </div>
                    {compareB ? (
                      <div className="flex flex-col gap-2 items-center">
                        <div className="relative aspect-square w-full max-w-sm rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
                          <img src={compareB.url} alt="Comparison B" className="w-full h-full object-contain" />
                          <div className="absolute bottom-2 left-2 bg-slate-900/85 px-2 py-1 rounded text-[10px] font-bold text-white">
                            Tag: {compareB.tag} | Date: {compareB.date}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center opacity-60 text-xs border-2 border-dashed border-white/10 rounded-2xl">
                        Click "Select B" on any photo in the gallery below to choose Image B
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upload & Filters Row */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Left column: Upload & Filters */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  
                  {/* Upload Wizard */}
                  {!compareMode && (
                    <div className="glass-container p-5 flex flex-col gap-4">
                      <h3 className="text-base font-bold flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-indigo-400" /> Photo Upload Wizard
                      </h3>
                      
                      <div className="flex flex-col gap-3 text-xs">
                        <div className="flex flex-col gap-1">
                          <label className="font-bold">Select Rabbit *</label>
                          <select id="mediaUploadRabbit" className="w-full py-1 px-2">
                            {rabbits.map(r => (
                              <option key={r.id} value={r.id}>{r.name} ({r.tattooNumber})</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <label className="font-bold">Photo Category / Pose</label>
                          <select id="mediaUploadTag" defaultValue="General" className="w-full py-1 px-2">
                            <option value="General">General Barn Photo</option>
                            <option value="Profile">Profile (Side View)</option>
                            <option value="Tattoo">Tattoo Verification</option>
                            <option value="Show Pose">Show/Exhibition Pose</option>
                            <option value="Health Check">Health Close-up</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="font-bold">Weight at Capture (Optional oz)</label>
                          <input id="mediaUploadWeight" type="number" placeholder="Weight in oz" className="w-full py-1 px-2 bg-slate-900 border border-white/10 rounded-lg text-white" />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="font-bold">Description / Notes</label>
                          <input id="mediaUploadNotes" type="text" placeholder="e.g. Broad shoulder proof" className="w-full py-1 px-2 bg-slate-900 border border-white/10 rounded-lg text-white" />
                        </div>

                        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                          <span className="font-bold text-[10px] uppercase opacity-75">Upload Image File</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;

                              const rabbitId = document.getElementById("mediaUploadRabbit").value;
                              const tag = document.getElementById("mediaUploadTag").value;
                              const weight = document.getElementById("mediaUploadWeight").value;
                              const notes = document.getElementById("mediaUploadNotes").value;

                              if (!rabbitId) {
                                alert("Please select a rabbit first!");
                                return;
                              }

                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64Url = reader.result;
                                setAllRabbits(prev => prev.map(r => {
                                  if (r.id === rabbitId) {
                                    const newPhoto = {
                                      url: base64Url,
                                      tag: tag || 'General',
                                      date: new Date().toISOString().split('T')[0],
                                      notes: notes || '',
                                      weightOz: weight ? Number(weight) : '',
                                      annotations: [],
                                      watermark: false
                                    };
                                    return { ...r, photos: [...(r.photos || []), newPhoto] };
                                  }
                                  return r;
                                }));
                                setSuccessMascot({
                                  title: "Photo Added!",
                                  message: "Successfully added new photo to rabbit gallery.",
                                  type: 'usagi'
                                });
                                e.target.value = '';
                                document.getElementById("mediaUploadWeight").value = '';
                                document.getElementById("mediaUploadNotes").value = '';
                              };
                              reader.readAsDataURL(file);
                            }} 
                            className="text-xs file:bg-white/10 file:text-white file:border-none file:px-2 file:py-1 file:rounded-xl file:cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gallery Filters */}
                  <div className="glass-container p-5 flex flex-col gap-4">
                    <h3 className="text-base font-bold">Filters</h3>
                    
                    <div className="flex flex-col gap-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="font-bold opacity-75">Filter by Rabbit</label>
                        <select 
                          value={mediaRabbitFilter} 
                          onChange={(e) => setMediaRabbitFilter(e.target.value)}
                          className="w-full py-1 px-2"
                        >
                          <option value="all">All Rabbits</option>
                          {rabbits.map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.tattooNumber})</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold opacity-75">Filter by Category</label>
                        <select 
                          value={mediaTagFilter} 
                          onChange={(e) => setMediaTagFilter(e.target.value)}
                          className="w-full py-1 px-2"
                        >
                          <option value="all">All Categories</option>
                          <option value="General">General</option>
                          <option value="Profile">Profile (Side View)</option>
                          <option value="Tattoo">Tattoo Verification</option>
                          <option value="Show Pose">Show/Exhibition Pose</option>
                          <option value="Health Check">Health Close-up</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right column: Gallery Grid */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                  <div className="glass-container p-6">
                    <h3 className="text-lg font-bold mb-4">Media Hub Photos</h3>

                    {/* Photos Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {rabbits
                        .filter(r => mediaRabbitFilter === 'all' || r.id === mediaRabbitFilter)
                        .flatMap(rabbit => (rabbit.photos || []).map((photo, photoIdx) => {
                          const pObj = getPhotoObj(photo);
                          return { rabbit, photo: pObj, index: photoIdx };
                        }))
                        .filter(item => mediaTagFilter === 'all' || item.photo.tag === mediaTagFilter)
                        .map((item, keyIdx) => {
                          const p = item.photo;
                          const r = item.rabbit;
                          const idx = item.index;

                          return (
                            <div key={keyIdx} className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex flex-col transition-all hover:border-indigo-500/50 hover:shadow-lg shadow-indigo-500/10">
                              
                              {/* Photo Area */}
                              <div className="relative aspect-square w-full overflow-hidden bg-black flex items-center justify-center">
                                <img 
                                  src={p.url} 
                                  alt="Rabbitry asset" 
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  style={{
                                    filter: `brightness(${p.brightness || 100}%)`,
                                    transform: `rotate(${p.rotation || 0}deg)`
                                  }}
                                />
                                
                                {/* Photo tag badge */}
                                <span className="absolute top-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                                  {p.tag}
                                </span>

                                {/* Watermark overlay simulation */}
                                {p.watermark && (
                                  <span className="absolute bottom-2 right-2 text-[8px] text-white/50 bg-black/40 px-1 py-0.5 rounded pointer-events-none">
                                    © {activeBreederContext?.rabbitryName || 'My Rabbitry'}
                                  </span>
                                )}

                                {/* Overlay action buttons */}
                                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                  <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-white drop-shadow-md">{r.name}</span>
                                    {!isAssistantWriteOnly && (
                                      <button 
                                        onClick={() => {
                                          setAllRabbits(prev => prev.map(rabbitItem => {
                                            if (rabbitItem.id === r.id) {
                                              const updatedPhotos = rabbitItem.photos.filter((_, pIdx) => pIdx !== idx);
                                              return { ...rabbitItem, photos: updatedPhotos };
                                            }
                                            return rabbitItem;
                                          }));
                                        }}
                                        className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-500"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-1.5">
                                    <button 
                                      onClick={() => setLightboxPhoto({ rabbitId: r.id, photoIndex: idx })}
                                      className="btn-interactive text-[11px] py-1 px-2 border-none bg-indigo-600/90 text-white font-bold flex items-center justify-center gap-1"
                                    >
                                      🔍 Zoom
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setEditorPhoto({
                                          rabbitId: r.id,
                                          imageUrl: p.url,
                                          tag: p.tag,
                                          notes: p.notes,
                                          weightOz: p.weightOz || '',
                                          photoIndex: idx
                                        });
                                        setEditorBrightness(p.brightness || 100);
                                        setEditorRotation(p.rotation || 0);
                                        setEditorAnnotations(p.annotations || []);
                                        setEditorWatermark(p.watermark || false);
                                      }}
                                      className="btn-interactive text-[11px] py-1 px-2 border-none bg-sky-600/90 text-white font-bold flex items-center justify-center gap-1"
                                    >
                                      ✏️ Edit
                                    </button>

                                    {compareMode ? (
                                      <>
                                        <button 
                                          onClick={() => setCompareA({ url: p.url, tag: p.tag, date: p.date })}
                                          className="col-span-1 btn-interactive text-[10px] py-1 px-1 bg-amber-600 border-none"
                                        >
                                          Select A
                                        </button>
                                        <button 
                                          onClick={() => setCompareB({ url: p.url, tag: p.tag, date: p.date })}
                                          className="col-span-1 btn-interactive text-[10px] py-1 px-1 bg-amber-650 border-none"
                                        >
                                          Select B
                                        </button>
                                      </>
                                    ) : (
                                      <button 
                                        onClick={() => handleDownloadPhoto(p.url, r.name)}
                                        className="col-span-2 btn-interactive text-[11px] py-1 px-2 bg-emerald-600 border-none flex items-center justify-center gap-1"
                                      >
                                        <Download className="w-3 h-3" /> Save File
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Details below photo */}
                              <div className="p-3 flex flex-col gap-1 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold opacity-80">{r.name}</span>
                                  <span className="text-[10px] opacity-60 font-mono">{p.date}</span>
                                </div>
                                {p.weightOz && <span className="text-[10px] text-green-400 font-semibold">⚖️ Weight: {p.weightOz} oz</span>}
                                {p.notes && <p className="opacity-70 mt-1 truncate">{p.notes}</p>}
                              </div>

                            </div>
                          );
                        })}
                      {rabbits
                        .filter(r => mediaRabbitFilter === 'all' || r.id === mediaRabbitFilter)
                        .flatMap(rabbit => (rabbit.photos || []).map((photo, photoIdx) => {
                          const pObj = getPhotoObj(photo);
                          return { rabbit, photo: pObj, index: photoIdx };
                        }))
                        .filter(item => mediaTagFilter === 'all' || item.photo.tag === mediaTagFilter).length === 0 && (
                          <div className="col-span-full py-12 text-center opacity-60 text-sm">
                            No photos found matching your filters.
                          </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB: SALES & TRANSFERS PANEL */}
          {activeTab === 'sales' && (
            <div className="flex flex-col gap-6">
              
              {/* Header card with summary & stats */}
              <div className="glass-container p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                    <ShoppingBag className="w-6 h-6 text-emerald-400" /> Sales, Transfers & Pedigree Exchange
                  </h3>
                  <p className="text-xs opacity-75 text-emerald-200">
                    Manage rabbit registry ownership transfers, track financial ledger sales, and view digital certificates of authenticity.
                  </p>
                </div>
                
                {/* Stats row */}
                <div className="flex gap-4 flex-wrap">
                  <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Total Sales Revenue</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      ${allTransfers
                        .filter(t => selectedBreederContext === 'all' || t.breederId === selectedBreederContext)
                        .reduce((sum, t) => sum + (t.price || 0), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Completed Transfers</span>
                    <span className="text-lg font-black text-indigo-400">
                      {allTransfers.filter(t => selectedBreederContext === 'all' || t.breederId === selectedBreederContext).length}
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Active Listings</span>
                    <span className="text-lg font-black text-purple-400">
                      {rabbits.filter(r => r.status === 'active' || r.status === 'active_listing').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Transfer History / Registry Logs */}
                <div className="glass-container p-6 xl:col-span-7 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
                      📜 Verifiable Transfer Log
                    </h4>
                    <span className="text-xs opacity-60 font-medium">ARBA-Compliant Records</span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider opacity-70">
                          <th className="pb-3">Certificate ID</th>
                          <th className="pb-3">Rabbit</th>
                          <th className="pb-3">Buyer</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Price</th>
                          <th className="pb-3 text-right">Certificate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs">
                        {allTransfers
                          .filter(t => selectedBreederContext === 'all' || t.breederId === selectedBreederContext)
                          .map(t => (
                            <tr key={t.id} className="hover:bg-white/5 transition-all">
                              <td className="py-3 font-mono font-bold text-indigo-300">{t.certificateId}</td>
                              <td className="py-3">
                                <span className="font-bold block text-white">{t.rabbitName}</span>
                                <span className="text-[10px] opacity-60">Tat: {t.rabbitTattoo}</span>
                              </td>
                              <td className="py-3">
                                <span className="font-semibold block text-white">{t.buyerName}</span>
                                <span className="text-[10px] opacity-60">{t.buyerEmail}</span>
                              </td>
                              <td className="py-3 opacity-85">{t.date}</td>
                              <td className="py-3 font-mono font-semibold text-emerald-450">
                                {t.price > 0 ? `$${t.price.toFixed(2)}` : 'Lease/Gift'}
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => setSelectedCertificate(t)}
                                  className="btn-interactive text-[10px] py-1.5 px-3 bg-indigo-600/80 hover:bg-indigo-650 text-white font-bold flex items-center gap-1.5 ml-auto border-none"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View Cert
                                </button>
                              </td>
                            </tr>
                          ))}
                        {allTransfers.filter(t => selectedBreederContext === 'all' || t.breederId === selectedBreederContext).length === 0 && (
                          <tr>
                            <td colSpan="6" className="text-center py-10 opacity-60">
                              No completed rabbitry transfers logged in this database context.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Side: Active Inventory (Initiate transfers) */}
                <div className="glass-container p-6 xl:col-span-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-purple-300">
                      🐇 Eligible Hutch Inventory
                    </h4>
                    <span className="text-xs opacity-60">Click to Transfer</span>
                  </div>

                  <p className="text-xs opacity-75 leading-relaxed">
                    Select an active rabbit from your hutch to begin the guided Sell/Transfer wizard.
                  </p>

                  <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                    {rabbits
                      .filter(r => r.status !== 'sold')
                      .map(r => (
                        <div key={r.id} className="p-3 bg-white/5 border border-white/5 hover:border-purple-500/30 rounded-xl flex items-center justify-between transition-all group">
                          <div>
                            <span className="text-indigo-400 font-mono text-xs font-bold block">{r.tattooNumber}</span>
                            <span className="font-bold text-sm text-white block">{r.name}</span>
                            <span className="text-[10px] opacity-65">{r.breed} - {r.variety} | {r.sex}</span>
                          </div>
                          {!isAssistantWriteOnly ? (
                            <button
                              onClick={() => {
                                setBuyerDetails({ name: '', email: '', phone: '', price: '', type: 'sale', notes: '' });
                                setSellerSignature('');
                                setBuyerSignature('');
                                setTransferWizardStep(1);
                                setShowTransferWizard(r);
                              }}
                              className="btn-interactive text-[11px] py-1.5 px-3 bg-emerald-600 hover:bg-emerald-650 opacity-90 group-hover:opacity-100 border-none flex items-center gap-1 font-bold text-white shadow"
                            >
                              Transfer <Plus className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] opacity-50 italic">Read-Only</span>
                          )}
                        </div>
                      ))}
                    {rabbits.filter(r => r.status !== 'sold').length === 0 && (
                      <p className="text-center py-10 opacity-60 text-xs">No active rabbits available in this hutch.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: SYNC QUEUE PANEL */}
          {activeTab === 'sync' && (
            <div className="glass-container p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-bold">SQLCipher & SQLite Sync Queue</h3>
                  <p className="text-xs opacity-75">Simulates local on-device transaction caches ready to resolve with PostgreSQL backend.</p>
                </div>

                <button 
                  onClick={handleSyncNow}
                  className="btn-interactive bg-pink-600"
                  disabled={syncQueue.length === 0}
                >
                  <RefreshCw className="w-4 h-4 animate-pulse" /> Force Background Sync
                </button>
              </div>

              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />
                <p className="leading-relaxed text-orange-200">
                  When the device goes offline (e.g. out in rural barns or show tables), all writes are tracked inside a SQL change-log table. Once a network ping is validated, the queue reconciles using conflict-free timestamp ordering.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-bold uppercase tracking-wider opacity-70">Queued SQLite Operations</h4>
                {syncQueue.map(item => (
                  <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded uppercase">{item.action}</span>
                      <span className="ml-3 font-semibold">Table: {item.table}</span>
                      <p className="opacity-60 mt-1">Payload Cache: {JSON.stringify(item.payload)}</p>
                    </div>
                    <span className="opacity-50">{item.timestamp}</span>
                  </div>
                ))}
                {syncQueue.length === 0 && (
                  <p className="text-center py-10 opacity-60">No pending SQLite logs. Local state is fully synced with the PostgreSQL server!</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ADMIN CONTROL CENTER */}
          {activeTab === 'admin' && currentUser?.id === 'ab-admin' && (
            !controlCenterUnlocked ? (
              <div className="glass-container p-8 flex flex-col items-center justify-center text-center gap-6 max-w-md mx-auto my-12 border-2 border-red-500/20 shadow-xl shadow-red-950/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-indigo-600"></div>
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/35 flex items-center justify-center text-red-400">
                  <Lock className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white mb-2">Secondary Authentication Required</h3>
                  <p className="text-xs opacity-75 leading-relaxed text-slate-300">
                    Access to the App Owner Control Center requires the secondary administrative password. This is required for secure tenant management and data protection.
                  </p>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (adminPasswordInput === 'TechJakylie9699$$') {
                      setControlCenterUnlocked(true);
                      setAdminPasswordError('');
                      setAdminPasswordInput('');
                      triggerConfetti();
                      showToast("Control Center unlocked successfully!", "success");
                    } else {
                      setAdminPasswordError('Invalid administrative password.');
                      showToast("Access Denied: Invalid credentials.", "error");
                    }
                  }}
                  className="w-full flex flex-col gap-4 text-xs mt-2"
                >
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="font-bold text-slate-400">Administrative Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••••••"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      className="py-2.5 px-4 bg-slate-950/50 border border-white/10 text-white rounded-xl text-center text-sm tracking-widest font-mono focus:border-red-500"
                    />
                    {adminPasswordError && (
                      <span className="text-red-400 font-semibold mt-1 text-[10px] block text-center">
                        ⚠️ {adminPasswordError}
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn-interactive w-full py-3 bg-red-650 hover:bg-red-700 text-white font-bold rounded-xl border-none shadow-md"
                  >
                    Unlock Control Center
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* Header card with summary & stats */}
                <div className="glass-container p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-indigo-400" /> App Owner Control Center
                      <button
                        type="button"
                        onClick={() => {
                          setControlCenterUnlocked(false);
                          showToast("Control Center locked.", "info");
                        }}
                        className="p-1 px-2.5 bg-slate-855 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-slate-200 border border-white/10 rounded-lg font-mono ml-4"
                        title="Lock access"
                      >
                        🔒 Lock Tab
                      </button>
                    </h3>
                  <p className="text-xs opacity-75">
                    Manage breeder registries, membership approvals, role assignments, and breeder credential recovery.
                  </p>
                </div>
                
                {/* CSV download button */}
                <button
                  onClick={() => {
                    const csvRows = [
                      ["ID", "Name", "Email", "Rabbitry", "Phone", "Role", "Status", "Password"],
                      ...adminBreeders.map(b => [
                        b.id,
                        b.name,
                        b.email,
                        b.rabbitryName,
                        b.phone,
                        b.role,
                        b.status,
                        b.password
                      ])
                    ];
                    const csvContent = "data:text/csv;charset=utf-8," 
                      + csvRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `breeder_directory_${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    triggerConfetti();
                  }}
                  className="btn-interactive text-xs bg-indigo-600 w-full sm:w-auto"
                >
                  <Download className="w-4 h-4" /> Export Directory (CSV)
                </button>
              </div>

              {/* Stats overview row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col">
                  <span className="text-xs opacity-70">Total Breeders</span>
                  <span className="text-2xl font-bold">{adminBreeders.length}</span>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col">
                  <span className="text-xs opacity-70">Pending Approval</span>
                  <span className="text-2xl font-bold text-amber-400">
                    {adminBreeders.filter(b => b.status === 'pending').length}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col">
                  <span className="text-xs opacity-70">Active Registry Roles</span>
                  <span className="text-2xl font-bold text-green-400">
                    {adminBreeders.filter(b => b.status === 'active').length}
                  </span>
                </div>
              </div>

              {/* Core layout: Search/List & Add Breeder form */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* List and Actions (Left side) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  
                  {/* Breeder Search Bar */}
                  <div className="glass-container p-4 flex items-center justify-between gap-4">
                    <input
                      type="text"
                      placeholder="Search breeder profiles by name, email, or prefix..."
                      className="w-full text-xs"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* List Container */}
                  <div className="glass-container p-6 flex flex-col gap-4">
                    <h3 className="text-lg font-bold">Registered Breeder Accounts</h3>
                    
                    <div className="flex flex-col gap-4">
                      {adminBreeders
                        .filter(b => 
                          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.rabbitryName.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(b => (
                          <BreederCard 
                            key={b.id} 
                            b={b} 
                            setAdminBreeders={setAdminBreeders} 
                            triggerConfetti={triggerConfetti} 
                          />
                        ))}
                      {adminBreeders.length === 0 && (
                        <p className="text-center text-xs opacity-60 py-6">No breeder accounts recorded.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Add Breeder Form (Right side) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  <div className="glass-container p-6 flex flex-col gap-4">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <Plus className="w-5 h-5 text-indigo-400" /> Register Breeder
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target;
                        const breederName = form.elements.breederName.value;
                        const breederEmail = form.elements.breederEmail.value;
                        const breederPrefix = form.elements.breederPrefix.value;
                        const breederPhone = form.elements.breederPhone.value;
                        const breederRole = form.elements.breederRole.value;
                        const breederPassword = form.elements.breederPassword.value;
                        const breederStatus = form.elements.breederStatus.value;

                        if (!breederName || !breederEmail || !breederPassword) {
                          alert("Name, Email, and Password are required!");
                          return;
                        }

                        const newBreederObj = {
                          id: `ab-${Date.now()}`,
                          name: breederName,
                          email: breederEmail,
                          rabbitryName: breederPrefix || "Independent",
                          phone: breederPhone || "",
                          role: breederRole,
                          status: breederStatus,
                          password: breederPassword
                        };

                        setAdminBreeders(prev => [...prev, newBreederObj]);
                        form.reset();
                        triggerConfetti();
                        alert(`Breeder profile for ${breederName} registered successfully!`);
                      }}
                      className="flex flex-col gap-4 text-xs"
                    >
                      <div className="flex flex-col gap-1">
                        <label className="font-bold">Full Name *</label>
                        <input name="breederName" type="text" required placeholder="E.g. David Banner" className="py-1.5 px-3" />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold">Email Address *</label>
                        <input name="breederEmail" type="email" required placeholder="david@hulk.com" className="py-1.5 px-3" />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold">Rabbitry Prefix Name</label>
                        <input name="breederPrefix" type="text" placeholder="E.g. Emerald Acres" className="py-1.5 px-3" />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold">Contact Phone</label>
                        <input name="breederPhone" type="text" placeholder="555-0199" className="py-1.5 px-3" />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold">Assign Role</label>
                        <select name="breederRole" className="py-1.5 px-3">
                          <option value="owner">Breeder / Owner 👑</option>
                          <option value="assistant">Barn Assistant 🌾</option>
                          <option value="registrar">ARBA Registrar 📜</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold">Account Registration Status</label>
                        <select name="breederStatus" className="py-1.5 px-3">
                          <option value="active">Active (Instant Access)</option>
                          <option value="pending">Pending Review</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold">Initial Password *</label>
                        <input name="breederPassword" type="text" required placeholder="Min 6 characters" className="py-1.5 px-3" />
                      </div>

                      <button type="submit" className="btn-interactive w-full py-2.5 mt-2 bg-gradient-to-r from-indigo-500 to-pink-500 font-bold text-white border-none">
                        Register Breeder Profile
                      </button>
                    </form>
                  </div>

                </div>

              </div>

            </div>
          ))}

        </div>

      </main>

      {/* MODALS */}
      {/* 1. Canvas Editor Modal */}
      {editorPhoto && (() => {
        const rabbit = rabbits.find(r => r.id === editorPhoto.rabbitId);
        const pObj = editorPhoto;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-950/40">
                <div>
                  <h3 className="font-bold text-lg text-white">In-App Photo Editor & Annotator</h3>
                  <span className="text-xs opacity-70">Editing photo for {rabbit ? rabbit.name : 'Unknown Rabbit'}</span>
                </div>
                <button 
                  onClick={() => setEditorPhoto(null)} 
                  className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/5"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Canvas Preview */}
                  <div className="flex flex-col items-center justify-center bg-black/60 rounded-2xl p-4 border border-white/5 min-h-[300px] relative overflow-hidden select-none">
                    <div 
                      className="relative max-w-full max-h-[250px] transition-all flex items-center justify-center cursor-crosshair"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                        const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                        const txt = prompt("Enter annotation label (e.g. 'Tattoo Verified' or 'Hock Redness'):", "Label");
                        if (txt) {
                          setEditorAnnotations(prev => [...prev, { x, y, text: txt }]);
                        }
                      }}
                    >
                      <img 
                        src={pObj.imageUrl} 
                        alt="Editing preview" 
                        className="max-w-full max-h-[250px] object-contain rounded-lg"
                        style={{ filter: `brightness(${editorBrightness}%)`, transform: `rotate(${editorRotation}deg)` }}
                      />
                      
                      {/* Render annotations */}
                      {editorAnnotations.map((ann, aIdx) => (
                        <div 
                          key={aIdx} 
                          className="absolute bg-red-650 border border-white text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow-lg pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-help"
                          style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                          title={ann.text}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete annotation "${ann.text}"?`)) {
                              setEditorAnnotations(prev => prev.filter((_, idx) => idx !== aIdx));
                            }
                          }}
                        >
                          📍 {ann.text}
                        </div>
                      ))}

                      {/* Watermark Overlay Preview */}
                      {editorWatermark && (
                        <span className="absolute bottom-2 right-2 text-[8px] text-white/50 bg-black/40 px-1 py-0.5 rounded pointer-events-none uppercase font-mono tracking-widest">
                          © {activeBreederContext?.rabbitryName || 'My Rabbitry'}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] opacity-50 mt-3 text-center">Click on the image to place annotation pin labels. Click pin to delete it.</span>
                  </div>

                  {/* Right Column: Controls */}
                  <div className="flex flex-col gap-4 text-xs">
                    
                    {/* Category Selector */}
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-indigo-300">Category Tag</label>
                      <select 
                        value={editorPhoto.tag} 
                        onChange={(e) => setEditorPhoto({...editorPhoto, tag: e.target.value})}
                        className="w-full py-1.5 px-3 rounded-lg"
                      >
                        <option value="General">General</option>
                        <option value="Profile">Profile (Side View)</option>
                        <option value="Tattoo">Tattoo Verification</option>
                        <option value="Show Pose">Show/Exhibition Pose</option>
                        <option value="Health Check">Health Close-up</option>
                      </select>
                    </div>

                    {/* Weight Field */}
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-indigo-300">Weight at Capture (Optional oz)</label>
                      <input 
                        type="number" 
                        value={editorPhoto.weightOz || ''} 
                        onChange={(e) => setEditorPhoto({...editorPhoto, weightOz: e.target.value})}
                        className="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-white/10 text-white"
                        placeholder="e.g. 48"
                      />
                    </div>

                    {/* Description Notes */}
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-indigo-300">Description / Notes</label>
                      <input 
                        type="text" 
                        value={editorPhoto.notes || ''} 
                        onChange={(e) => setEditorPhoto({...editorPhoto, notes: e.target.value})}
                        className="w-full py-1.5 px-3 rounded-lg bg-slate-950 border border-white/10 text-white"
                        placeholder="e.g. Tattoo verified before show entry"
                      />
                    </div>

                    {/* Editing Sliders */}
                    <div className="flex flex-col gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="font-bold opacity-80 block mb-1">Image Adjustments</span>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between font-mono text-[10px]">
                          <span>Brightness</span>
                          <span>{editorBrightness}%</span>
                        </div>
                        <input 
                          type="range" min="50" max="150" 
                          value={editorBrightness} 
                          onChange={(e) => setEditorBrightness(Number(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold">Rotation Angle:</span>
                        <button 
                          type="button"
                          onClick={() => setEditorRotation(prev => (prev + 90) % 360)}
                          className="btn-interactive py-1 px-3 bg-indigo-600 text-xs border-none font-bold"
                        >
                          🔄 Rotate 90°
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                        <span className="font-bold">Add Watermark:</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editorWatermark}
                            onChange={(e) => setEditorWatermark(e.target.checked)}
                            className="w-4 h-4 rounded cursor-pointer"
                          />
                          Show Copyright Logo
                        </label>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-white/5 bg-slate-950/40 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditorPhoto(null)} 
                  className="btn-interactive text-xs py-2 px-4 bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setAllRabbits(prev => prev.map(r => {
                      if (r.id === editorPhoto.rabbitId) {
                        const updatedPhotos = [...r.photos];
                        const editedObj = {
                          url: pObj.imageUrl,
                          tag: editorPhoto.tag,
                          notes: editorPhoto.notes,
                          weightOz: editorPhoto.weightOz ? Number(editorPhoto.weightOz) : '',
                          date: new Date().toISOString().split('T')[0],
                          brightness: editorBrightness,
                          rotation: editorRotation,
                          annotations: editorAnnotations,
                          watermark: editorWatermark
                        };
                        updatedPhotos[editorPhoto.photoIndex] = editedObj;
                        return { ...r, photos: updatedPhotos };
                      }
                      return r;
                    }));
                    setEditorPhoto(null);
                    setSuccessMascot({
                      title: "Changes Saved!",
                      message: "Photo edits, tags, and annotations are successfully baked into local cache storage.",
                      type: 'usagi'
                    });
                  }}
                  className="btn-interactive text-xs py-2 px-4 bg-indigo-600 border-none animate-pulse-subtle"
                >
                  Save Photo Info
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 2. Lightbox Carousel Modal */}
      {lightboxPhoto && (() => {
        const rabbit = rabbits.find(r => r.id === lightboxPhoto.rabbitId);
        if (!rabbit || !rabbit.photos || rabbit.photos.length === 0) return null;
        
        const photosList = rabbit.photos;
        const currentIdx = lightboxPhoto.photoIndex;
        const pObj = getPhotoObj(photosList[currentIdx]);

        const nextPhoto = () => {
          const nextIdx = (currentIdx + 1) % photosList.length;
          setLightboxPhoto({ ...lightboxPhoto, photoIndex: nextIdx });
          setAiReport(null);
        };

        const prevPhoto = () => {
          const prevIdx = (currentIdx - 1 + photosList.length) % photosList.length;
          setLightboxPhoto({ ...lightboxPhoto, photoIndex: prevIdx });
          setAiReport(null);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[85vh]">
              
              {/* Left Column: Huge Interactive Photo Carousel */}
              <div className="flex-1 bg-black flex flex-col justify-between p-4 relative overflow-hidden group select-none">
                <button 
                  onClick={() => setLightboxPhoto(null)} 
                  className="absolute top-4 right-4 z-20 p-2 text-white/70 hover:text-white rounded-full bg-slate-900/60 hover:bg-slate-900"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Left/Right chevrons */}
                {photosList.length > 1 && (
                  <>
                    <button 
                      onClick={prevPhoto}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 text-white/80 bg-slate-900/50 hover:bg-slate-900 hover:text-white rounded-full transition-all"
                    >
                      ◀
                    </button>
                    <button 
                      onClick={nextPhoto}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 text-white/80 bg-slate-900/50 hover:bg-slate-900 hover:text-white rounded-full transition-all"
                    >
                      ▶
                    </button>
                  </>
                )}

                {/* Photo Viewer */}
                <div className="flex-1 flex items-center justify-center relative">
                  <img 
                    src={pObj.url} 
                    alt="Lightbox Original" 
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                    style={{ 
                      filter: `brightness(${pObj.brightness || 100}%)`, 
                      transform: `rotate(${pObj.rotation || 0}deg)` 
                    }}
                  />
                      {/* Render annotations overlay */}
                  {(pObj.annotations || []).map((ann, aIdx) => (
                    <div 
                      key={aIdx} 
                      className="absolute bg-red-600 border border-white text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow-lg pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-help"
                      style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                      title={ann.text}
                    >
                      📍 {ann.text}
                    </div>
                  ))}

                  {/* Watermark overlay */}
                  {pObj.watermark && (
                    <span className="absolute bottom-2 right-2 text-xs text-white/40 bg-black/40 px-2 py-1 rounded pointer-events-none uppercase tracking-widest font-mono">
                      © {activeBreederContext?.rabbitryName || 'My Rabbitry'}
                    </span>
                  )}
                </div>

                {/* Carousel position indicators */}
                <div className="flex justify-center gap-1.5 mt-2">
                  {photosList.map((_, dotIdx) => (
                    <span 
                      key={dotIdx}
                      className={`w-2 h-2 rounded-full ${dotIdx === currentIdx ? 'bg-indigo-500 scale-125' : 'bg-white/20'}`}
                    ></span>
                  ))}
                </div>

              </div>

              {/* Right Column: Metadata & AI Engine */}
              <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col h-full max-h-[85vh] overflow-y-auto">
                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      Category: {pObj.tag}
                    </span>
                    <h3 className="font-black text-xl text-white mt-1.5">{rabbit.name}</h3>
                    <p className="text-xs opacity-65">{rabbit.breed} | Tattoo: {rabbit.tattooNumber}</p>
                  </div>

                  <div className="flex flex-col gap-2 text-xs border-t border-b border-white/5 py-3">
                    <div className="flex justify-between">
                      <span className="opacity-60">Date Captured:</span>
                      <span className="font-semibold text-white">{pObj.date}</span>
                    </div>
                    {pObj.weightOz && (
                      <div className="flex justify-between">
                        <span className="opacity-60">Weight at Capture:</span>
                        <span className="font-semibold text-green-400 font-mono">{pObj.weightOz} oz</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="opacity-60">Photo Notes:</span>
                      <p className="bg-white/5 p-2 rounded-lg italic text-slate-300">{pObj.notes || 'No notes added.'}</p>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-2 pt-1">
                    <button 
                      onClick={() => handleDownloadPhoto(pObj.url, rabbit.name)}
                      className="btn-interactive w-full py-2 bg-emerald-600 hover:bg-emerald-650 text-white font-bold flex items-center justify-center gap-1 text-xs border-none"
                    >
                      <Download className="w-4 h-4" /> Download Photo File
                    </button>

                    <button 
                      onClick={() => {
                        setAllRabbits(prev => prev.map(item => {
                          if (item.id === rabbit.id) {
                            const updatedPhotos = [...item.photos];
                            const targetPhoto = updatedPhotos.splice(currentIdx, 1)[0];
                            updatedPhotos.unshift(targetPhoto);
                            return { ...item, photos: updatedPhotos };
                          }
                          return item;
                        }));
                        setLightboxPhoto({ rabbitId: rabbit.id, photoIndex: 0 });
                        setSuccessMascot({
                          title: "Primary Photo Set!",
                          message: `"${rabbit.name}" primary profile image updated successfully in local storage.`,
                          type: 'usagi'
                        });
                      }}
                      className="btn-interactive w-full py-2 bg-indigo-600 hover:bg-indigo-650 text-white font-bold text-xs border-none"
                    >
                      ⭐ Set as Primary Profile
                    </button>

                    <button 
                      onClick={() => triggerAiInspection(pObj.url)}
                      disabled={aiLoading}
                      className="btn-interactive w-full py-2 bg-pink-600 hover:bg-pink-650 text-white font-bold text-xs border-none flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-white shrink-0" />
                      {aiLoading ? 'WarrenWise AI Scanning...' : 'Run WarrenWise AI Inspector'}
                    </button>
                  </div>

                  {/* WarrenWise AI Analysis Panel */}
                  {aiLoading && (
                    <div className="flex flex-col gap-2 items-center justify-center py-6 border border-pink-500/20 bg-pink-500/5 rounded-2xl">
                      <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Scanning SOP Features...</span>
                    </div>
                  )}

                  {aiReport && (
                    <div className="flex flex-col gap-2.5 bg-gradient-to-br from-indigo-950/40 to-pink-950/40 border border-pink-500/20 p-4 rounded-2xl text-[11px]">
                      <div className="flex items-center gap-1.5 text-pink-400 font-bold border-b border-pink-500/10 pb-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5" /> WarrenWise AI Diagnostics
                      </div>
                      <div>
                        <span className="opacity-60 block">Breed Variety ID:</span>
                        <strong className="text-white text-xs">{aiReport.variety}</strong>
                      </div>
                      <div>
                        <span className="opacity-60 block">Body Condition Scoring (BCS):</span>
                        <strong className="text-white">{aiReport.bodyScore}</strong>
                      </div>
                      <div>
                        <span className="opacity-60 block">Sore Hocks Scan:</span>
                        <strong className={aiReport.soreHocks.includes("Clear") ? "text-green-400" : "text-rose-400 font-bold"}>
                          {aiReport.soreHocks}
                        </strong>
                      </div>
                      <div>
                        <span className="opacity-60 block">Ear Mites Audit:</span>
                        <strong className="text-green-400">{aiReport.earMites}</strong>
                      </div>
                      <div>
                        <span className="opacity-60 block">SOP Weight Standards:</span>
                        <strong className="text-green-400">{aiReport.sopCompliance}</strong>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 3. Guided Transfer & Sales Wizard Modal */}
      {showTransferWizard && (() => {
        const rabbit = showTransferWizard;
        
        // Scan pedigree for missing fields
        const missingFields = scanPedigree(rabbit, rabbits);

        const handleCompleteWizardTransfer = () => {
          // Automated post-signing updates:
          const transferId = 'tx-' + Date.now();
          const certId = 'TX-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000);
          const docHash = Math.floor(Math.random()*100000000).toString(16).padStart(8, '0') + 
                          Math.floor(Math.random()*100000000).toString(16).padStart(8, '0') + 
                          Math.floor(Math.random()*100000000).toString(16).padStart(8, '0') + 
                          Math.floor(Math.random()*100000000).toString(16).padStart(8, '0');

          // 1. Update Rabbit status to 'sold'
          setAllRabbits(prev => prev.map(r => r.id === rabbit.id ? { ...r, status: 'sold' } : r));
          
          // 2. Add ledger transaction
          const newLedgerEntry = {
            id: 'lt-tx-' + Date.now(),
            breederId: selectedBreederContext === 'all' ? currentUser.id : selectedBreederContext,
            date: new Date().toISOString().split('T')[0],
            type: 'income',
            amount: parseFloat(buyerDetails.price) || 0,
            category: 'sale',
            rabbitId: rabbit.id,
            notes: `Rabbit ownership transfer of ${rabbit.name} (${rabbit.tattooNumber}) to ${buyerDetails.name} (Cert: ${certId})`
          };
          setAllLedger(prev => [newLedgerEntry, ...prev]);

          // 3. Create Transfer record
          const transferRecord = {
            id: transferId,
            breederId: selectedBreederContext === 'all' ? currentUser.id : selectedBreederContext,
            rabbitId: rabbit.id,
            rabbitName: rabbit.name,
            rabbitTattoo: rabbit.tattooNumber,
            rabbitBreed: rabbit.breed,
            buyerName: buyerDetails.name,
            buyerEmail: buyerDetails.email,
            buyerPhone: buyerDetails.phone,
            price: parseFloat(buyerDetails.price) || 0,
            type: buyerDetails.type,
            date: new Date().toISOString().split('T')[0],
            certificateId: certId,
            hash: docHash
          };
          setAllTransfers(prev => [transferRecord, ...prev]);

          // 4. Create Signature audit logs
          const signatureRecord = {
            id: 'sig-' + Date.now(),
            transferId: transferId,
            sellerSignature: sellerSignature || currentUser?.name || 'Seller',
            buyerSignature: buyerSignature || buyerDetails.name || 'Buyer',
            signedAt: new Date().toISOString(),
            sellerSignatureType: sellerSignature.startsWith('data:image') ? 'drawn' : 'typed',
            buyerSignatureType: buyerSignature.startsWith('data:image') ? 'drawn' : 'typed'
          };
          setAllSignatures(prev => [signatureRecord, ...prev]);

          // Trigger Confetti!
          triggerConfetti();
          setTransferWizardStep(4);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-slate-900 border-3 border-emerald-500/35 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              {/* Wizard Header */}
              <div className="p-6 bg-slate-950/40 border-b border-white/5 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-400" /> Rabbit Transfer Wizard
                  </h3>
                  <p className="text-xs opacity-75 text-emerald-300">
                    Step {transferWizardStep} of 4: {
                      transferWizardStep === 1 ? 'Buyer & Ledger Setup' :
                      transferWizardStep === 2 ? 'ARBA Pedigree Checker' :
                      transferWizardStep === 3 ? 'Digital Contract Signatures' :
                      'Completion & Share Packet'
                    }
                  </p>
                </div>
                {transferWizardStep < 4 && (
                  <button 
                    onClick={() => setShowTransferWizard(null)}
                    className="p-1.5 text-white/70 hover:text-white rounded-full bg-white/5 hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Wizard Content Body */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-sm">
                
                {/* STEP 1: Buyer details & Ledger price */}
                {transferWizardStep === 1 && (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200">
                      Specify the buyer's details, final sale price, and hutch ledger category. The transaction logs will record to SQLite instantly.
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold">Buyer Full Name *</label>
                        <input 
                          type="text" required placeholder="E.g., Alice Jenkins"
                          value={buyerDetails.name}
                          onChange={(e) => setBuyerDetails({ ...buyerDetails, name: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold">Buyer Email Address *</label>
                        <input 
                          type="email" required placeholder="buyer@gmail.com"
                          value={buyerDetails.email}
                          onChange={(e) => setBuyerDetails({ ...buyerDetails, email: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold">Buyer Phone Number</label>
                        <input 
                          type="text" placeholder="555-0123"
                          value={buyerDetails.phone}
                          onChange={(e) => setBuyerDetails({ ...buyerDetails, phone: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold">Sale Price ($) *</label>
                        <input 
                          type="number" required placeholder="0.00" min="0" step="any"
                          value={buyerDetails.price}
                          onChange={(e) => setBuyerDetails({ ...buyerDetails, price: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-xs font-bold">Transfer Type</label>
                        <select
                          value={buyerDetails.type}
                          onChange={(e) => setBuyerDetails({ ...buyerDetails, type: e.target.value })}
                        >
                          <option value="sale">Permanent Ownership Transfer (Sale) 👑</option>
                          <option value="lease">Temporary Lease Agreement ⏱️</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-xs font-bold">Special Notes / Health Guarantee Terms</label>
                        <textarea
                          placeholder="E.g. Sells with show potential. Health guaranteed for 48 hours..."
                          value={buyerDetails.notes}
                          onChange={(e) => setBuyerDetails({ ...buyerDetails, notes: e.target.value })}
                          className="h-20 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setShowTransferWizard(null)}
                        className="btn-interactive bg-slate-800 text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!buyerDetails.name || !buyerDetails.email || buyerDetails.price === ''}
                        onClick={() => setTransferWizardStep(2)}
                        className="btn-interactive bg-emerald-650 disabled:opacity-50"
                      >
                        Next: Pedigree Checker
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: ARBA Pedigree Checker */}
                {transferWizardStep === 2 && (() => {
                  if (missingFields.length === 0) {
                    return (
                      <div className="flex flex-col gap-5 items-center justify-center py-10 text-center">
                        <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce-subtle" />
                        <h4 className="font-extrabold text-white text-base">ARBA Pedigree Audit Passed!</h4>
                        <p className="text-xs opacity-75 max-w-sm">
                          WarrenWise AI scanned 3 generations of lineage for <strong>{rabbit.name}</strong> and verified all essential registry fields (tattoo numbers, varieties, weights, and DOBs) are 100% complete.
                        </p>
                        <button
                          type="button"
                          onClick={() => setTransferWizardStep(3)}
                          className="btn-interactive mt-4 bg-emerald-650 px-8"
                        >
                          Proceed to Signatures
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-4">
                      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-200">
                        ⚠️ <strong>Pedigree Integrity Alert:</strong> ARBA registry standards require complete records for all ancestors. Please resolve the missing fields below before signing:
                      </div>

                      <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
                        {missingFields.map((fieldItem, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
                            <span className="text-xs font-bold text-white uppercase block">
                              👤 {fieldItem.name} ({fieldItem.id === rabbit.id ? 'Self' : 'Ancestor'})
                            </span>
                            <div className="flex flex-col gap-1">
                              <label className="text-[11px] opacity-75">Missing Field: <strong>{fieldItem.label}</strong></label>
                              {fieldItem.field === 'sex' ? (
                                <select
                                  onChange={(e) => {
                                    setAllRabbits(prev => prev.map(r => r.id === fieldItem.id ? { ...r, sex: e.target.value } : r));
                                  }}
                                  className="text-xs py-1 px-2 bg-slate-900 border border-white/10"
                                >
                                  <option value="">Select Sex</option>
                                  <option value="buck">Buck (Male)</option>
                                  <option value="doe">Doe (Female)</option>
                                </select>
                              ) : fieldItem.field === 'weightOz' ? (
                                <div className="flex gap-2">
                                  <input 
                                    type="number" placeholder="Weight in Ounces"
                                    onChange={(e) => {
                                      const w = parseInt(e.target.value);
                                      if (w >= 0) {
                                        setAllRabbits(prev => prev.map(r => r.id === fieldItem.id ? { ...r, weightOz: w } : r));
                                      }
                                    }}
                                    className="text-xs py-1 px-2 flex-1"
                                  />
                                  <span className="text-xs opacity-60 self-center">oz ({(rabbit.weightOz/16).toFixed(2)} lbs)</span>
                                </div>
                              ) : fieldItem.field === 'dob' ? (
                                <input 
                                  type="date"
                                  onChange={(e) => {
                                    setAllRabbits(prev => prev.map(r => r.id === fieldItem.id ? { ...r, dob: e.target.value } : r));
                                  }}
                                  className="text-xs py-1 px-2 bg-slate-900 border border-white/10"
                                />
                              ) : (
                                <input 
                                  type="text" placeholder={`Enter ${fieldItem.label}`}
                                  onChange={(e) => {
                                    setAllRabbits(prev => prev.map(r => r.id === fieldItem.id ? { ...r, [fieldItem.field]: e.target.value } : r));
                                  }}
                                  className="text-xs py-1 px-2 bg-slate-900 border border-white/10"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between gap-2 mt-4 pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setTransferWizardStep(1)}
                          className="btn-interactive bg-slate-800 text-slate-200"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setTransferWizardStep(3)}
                          className="btn-interactive bg-emerald-650"
                        >
                          I'll fix later, proceed to Signatures
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* STEP 3: Digital signatures canvas & Type */}
                {transferWizardStep === 3 && (() => {
                  const [sellerSigType, setSellerSigType] = useState('draw'); // 'draw' or 'type'
                  const [buyerSigType, setBuyerSigType] = useState('draw'); // 'draw' or 'type'
                  const [typedSellerName, setTypedSellerName] = useState(currentUser?.name || '');
                  const [typedBuyerName, setTypedBuyerName] = useState(buyerDetails.name || '');

                  return (
                    <div className="flex flex-col gap-6">
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200">
                        ✍️ Both parties must authorize the ownership transfer. You can draw using your cursor/touchscreen or type a legally binding electronic signature.
                      </div>

                      {/* 1. Seller Section */}
                      <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white block">Seller Signature (You)</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSellerSigType('draw');
                                setSellerSignature('');
                              }}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${sellerSigType === 'draw' ? 'bg-indigo-600 text-white' : 'opacity-60'}`}
                            >
                              Draw
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSellerSigType('type');
                                setSellerSignature(typedSellerName);
                              }}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${sellerSigType === 'type' ? 'bg-indigo-600 text-white' : 'opacity-60'}`}
                            >
                              Type
                            </button>
                          </div>
                        </div>

                        {sellerSigType === 'draw' ? (
                          <SignaturePad 
                            value={sellerSignature} 
                            onChange={setSellerSignature} 
                            placeholder="Seller sign here..."
                          />
                        ) : (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={typedSellerName}
                              onChange={(e) => {
                                setTypedSellerName(e.target.value);
                                setSellerSignature(e.target.value);
                              }}
                              className="text-xs"
                              placeholder="Type your full name"
                            />
                            {typedSellerName && (
                              <div className="p-2 border border-dashed border-white/10 rounded bg-black/40 text-center font-serif italic text-lg tracking-wider text-indigo-300">
                                {typedSellerName}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 2. Buyer Section */}
                      <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white block">Buyer Signature ({buyerDetails.name})</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setBuyerSigType('draw');
                                setBuyerSignature('');
                              }}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${buyerSigType === 'draw' ? 'bg-indigo-600 text-white' : 'opacity-60'}`}
                            >
                              Draw
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setBuyerSigType('type');
                                setBuyerSignature(typedBuyerName);
                              }}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${buyerSigType === 'type' ? 'bg-indigo-600 text-white' : 'opacity-60'}`}
                            >
                              Type
                            </button>
                          </div>
                        </div>

                        {buyerSigType === 'draw' ? (
                          <div className="flex flex-col gap-2">
                            <SignaturePad 
                              value={buyerSignature} 
                              onChange={setBuyerSignature} 
                              placeholder="Buyer sign here (or sign on screen)..."
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setBuyerSigType('type');
                                setBuyerSignature(typedBuyerName);
                              }}
                              className="text-[11px] text-cyan-400 hover:underline text-left self-start mt-1 animate-pulse"
                            >
                              Simulate Remote Buyer Signature
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={typedBuyerName}
                              onChange={(e) => {
                                setTypedBuyerName(e.target.value);
                                setBuyerSignature(e.target.value);
                              }}
                              className="text-xs"
                              placeholder="Type buyer's full name"
                            />
                            {typedBuyerName && (
                              <div className="p-2 border border-dashed border-white/10 rounded bg-black/40 text-center font-serif italic text-lg tracking-wider text-emerald-300">
                                {typedBuyerName}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between gap-2 mt-4 pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setTransferWizardStep(2)}
                          className="btn-interactive bg-slate-800 text-slate-200"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          disabled={!sellerSignature || !buyerSignature}
                          onClick={handleCompleteWizardTransfer}
                          className="btn-interactive bg-emerald-650 disabled:opacity-50 flex-1 font-bold text-white border-none py-2.5 rounded-xl shadow"
                        >
                          Complete Ownership Transfer
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* STEP 4: Transfer completed success */}
                {transferWizardStep === 4 && (
                  <div className="flex flex-col gap-5 items-center justify-center py-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-450 border border-emerald-500 flex items-center justify-center text-4xl animate-bounce-subtle">
                      🎉
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-base">Ownership Transfer Complete!</h4>
                      <p className="text-xs opacity-75 mt-1 max-w-sm">
                        "{rabbit.name}" is now marked as "Sold" in your local hutch records. An income entry has been posted to the ledger, and the verifiable certificate is saved.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full max-w-xs mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowTransferWizard(null);
                          alert(`Printing pedigree packet for ${rabbit.name}...`);
                        }}
                        className="btn-interactive py-2 text-xs bg-indigo-600 text-white font-bold"
                      >
                        Print Complete Pedigree Packet
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const mockUrl = `${window.location.origin}/transfer-verification/${rabbit.id}?cert=TX-SIMULATED`;
                          navigator.clipboard.writeText(mockUrl);
                          alert("Shareable digital verification link copied to clipboard!");
                        }}
                        className="btn-interactive py-2 text-xs bg-slate-800 text-slate-200"
                      >
                        Copy Shareable Certificate Link
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowTransferWizard(null);
                          setActiveTab('sales');
                        }}
                        className="btn-interactive py-2 text-xs bg-emerald-650 text-white font-bold border-none"
                      >
                        Go to Sales Logs
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        );
      })()}

      {/* 4. Verifiable Transfer Certificate Viewer Modal */}
      {selectedCertificate && (() => {
        const cert = selectedCertificate;
        const sig = allSignatures.find(s => s.transferId === cert.id) || {
          sellerSignature: 'Jason Miller',
          buyerSignature: cert.buyerName,
          signedAt: cert.date + 'T12:00:00Z',
          sellerSignatureType: 'typed',
          buyerSignatureType: 'typed'
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] p-8 border-[6px] border-double border-indigo-905 relative">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedCertificate(null)}
                className="absolute top-4 right-4 z-10 p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Certificate content scrollable */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-2">
                
                {/* Header Stamp */}
                <div className="text-center flex flex-col items-center gap-1 pb-4 border-b border-indigo-100">
                  <div className="text-4xl text-indigo-900">👑</div>
                  <h2 className="font-serif font-black text-2xl uppercase tracking-widest text-indigo-950">
                    Verifiable Transfer Certificate
                  </h2>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Official Rabbitry Registry & Lineage Authentication Document
                  </p>
                </div>

                {/* Cryptographic verification representation */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-600">
                  <div>
                    <span className="opacity-60 block uppercase font-bold text-[8px]">Certificate ID</span>
                    <strong className="text-indigo-900 text-xs block mt-0.5">{cert.certificateId}</strong>
                  </div>
                  <div>
                    <span className="opacity-60 block uppercase font-bold text-[8px]">Registry Date</span>
                    <strong className="text-slate-900 text-xs block mt-0.5">{cert.date}</strong>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/50 pt-2">
                    <span className="opacity-60 block uppercase font-bold text-[8px]">Tamper-Proof Block Hash</span>
                    <span className="break-all font-semibold block mt-0.5 text-slate-500">{cert.hash}</span>
                  </div>
                </div>

                {/* Transaction Summary */}
                <div className="flex flex-col gap-3">
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-indigo-950 border-b pb-1">
                    Transfer Transaction Details
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div>
                      <span className="opacity-60">Seller Context:</span>
                      <p className="font-bold text-slate-800">
                        {adminBreeders.find(b => b.id === cert.breederId)?.name || 'Breeder'} 
                        ({adminBreeders.find(b => b.id === cert.breederId)?.rabbitryName || 'Grandview Rabbitry'})
                      </p>
                    </div>
                    <div>
                      <span className="opacity-60">Buyer / Recipient:</span>
                      <p className="font-bold text-slate-800">{cert.buyerName} ({cert.buyerEmail})</p>
                    </div>
                    <div>
                      <span className="opacity-60">Transfer Type:</span>
                      <p className="font-bold capitalize text-slate-800">{cert.type}</p>
                    </div>
                    <div>
                      <span className="opacity-60">Final Ledger Value:</span>
                      <p className="font-bold text-emerald-700 font-mono">
                        {cert.price > 0 ? `$${cert.price.toFixed(2)}` : 'Lease/Gift'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rabbit Details */}
                <div className="flex flex-col gap-3 bg-indigo-50/35 p-4 rounded-xl border border-indigo-100/50">
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-indigo-950 border-b border-indigo-100 pb-1">
                    Transferred Subject Profile
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 text-xs">
                    <div>
                      <span className="opacity-60 text-[10px]">Name:</span>
                      <p className="font-bold text-slate-800">{cert.rabbitName}</p>
                    </div>
                    <div>
                      <span className="opacity-60 text-[10px]">Tattoo Number:</span>
                      <p className="font-bold text-indigo-900 font-mono">{cert.rabbitTattoo}</p>
                    </div>
                    <div>
                      <span className="opacity-60 text-[10px]">Breed:</span>
                      <p className="font-bold text-slate-800">{cert.rabbitBreed}</p>
                    </div>
                    <div>
                      <span className="opacity-60 text-[10px]">Registry Status:</span>
                      <p className="font-bold text-slate-800">SOLD/TRANSFERRED</p>
                    </div>
                  </div>
                </div>

                {/* Signature Displays */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Seller signature view */}
                  <div className="flex flex-col gap-2 p-4 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] font-bold uppercase opacity-65 text-slate-500 block">Seller Authorization</span>
                    <div className="h-20 bg-slate-50 rounded-lg flex items-center justify-center p-2 border border-slate-200/50">
                      {sig.sellerSignature.startsWith('data:image') ? (
                        <img src={sig.sellerSignature} alt="Seller signature" className="max-h-full object-contain" />
                      ) : (
                        <span className="font-serif italic text-xl tracking-wider text-indigo-900">{sig.sellerSignature}</span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">Signed: {sig.signedAt.split('T')[0]}</span>
                  </div>

                  {/* Buyer signature view */}
                  <div className="flex flex-col gap-2 p-4 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] font-bold uppercase opacity-65 text-slate-500 block">Buyer Receipt</span>
                    <div className="h-20 bg-slate-50 rounded-lg flex items-center justify-center p-2 border border-slate-200/50">
                      {sig.buyerSignature.startsWith('data:image') ? (
                        <img src={sig.buyerSignature} alt="Buyer signature" className="max-h-full object-contain" />
                      ) : (
                        <span className="font-serif italic text-xl tracking-wider text-indigo-900">{sig.buyerSignature}</span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">Signed: {sig.signedAt.split('T')[0]}</span>
                  </div>
                </div>

                {/* Seal stamp footer */}
                <div className="text-center border-t border-slate-100 pt-6 mt-4 flex items-center justify-between text-[10px] opacity-75">
                  <span>Authorized Registrar: <strong>Sarah Jenkins</strong></span>
                  <span className="text-indigo-905 font-bold tracking-widest uppercase">Verified ARBA Compliant</span>
                  <button
                    onClick={() => window.print()}
                    className="p-1 px-3 rounded bg-indigo-900 text-white font-bold"
                  >
                    Print Cert
                  </button>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* Pedigree Node Editor Modal */}
      {pedigreeEditNode && (() => {
        const editRabbit = allRabbits.find(r => r.id === pedigreeEditNode.rabbitId);
        
        // Find existing rabbits of the same gender to populate the dropdown
        const genderMatchedRabbits = rabbits.filter(r => 
          r.sex === pedigreeEditNode.gender && 
          r.id !== selectedRabbit.id && 
          r.status !== 'pedigree_only'
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-100">
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-extrabold text-lg text-indigo-400">
                    {pedigreeEditNode.label}
                  </h3>
                  <p className="text-xs opacity-70">
                    {pedigreeEditNode.isOffspring 
                      ? `Editing offspring profile details.` 
                      : `Set or edit the ${pedigreeEditNode.gender === 'buck' ? 'male' : 'female'} ancestor for ${selectedRabbit.name}.`
                    }
                  </p>
                </div>
                <button 
                  onClick={() => setPedigreeEditNode(null)} 
                  className="opacity-70 hover:opacity-100 text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form type toggle (Only if NOT offspring) */}
              {!pedigreeEditNode.isOffspring && !pedigreeEditNode.rabbitId && (
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setNodeFormType('existing')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${nodeFormType === 'existing' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Select Existing Barn Rabbit
                  </button>
                  <button
                    type="button"
                    onClick={() => setNodeFormType('new')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${nodeFormType === 'new' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Create Pedigree-Only Ancestor
                  </button>
                </div>
              )}

              <form onSubmit={handleSavePedigreeNode} className="flex flex-col gap-6">
                
                {/* EXISTING SELECTION */}
                {nodeFormType === 'existing' && !pedigreeEditNode.isOffspring && !pedigreeEditNode.rabbitId && (
                  <div className="flex flex-col gap-2 bg-black/25 p-4 rounded-2xl border border-white/5">
                    <label className="text-xs font-bold text-indigo-300">Choose {pedigreeEditNode.gender === 'buck' ? 'Buck' : 'Doe'} from Barn</label>
                    <select
                      value={selectedExistingId}
                      onChange={(e) => setSelectedExistingId(e.target.value)}
                      className="w-full bg-slate-800 border-white/10"
                      required
                    >
                      <option value="">-- Select Rabbit --</option>
                      {genderMatchedRabbits.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.tattooNumber}) - {r.breed} {r.variety}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] opacity-60">This links the pedigree slot to a rabbit already in your database registry.</p>
                  </div>
                )}

                {/* NEW/EDIT ANCESTOR DETAILS */}
                {(nodeFormType === 'new' || pedigreeEditNode.isOffspring || pedigreeEditNode.rabbitId) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">Tattoo / Ear Number *</label>
                      <input
                        type="text"
                        required
                        value={nodeForm.tattooNumber}
                        onChange={(e) => setNodeForm({...nodeForm, tattooNumber: e.target.value})}
                        placeholder="E.g. S1"
                        className="bg-slate-800 border-white/10 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">Name *</label>
                      <input
                        type="text"
                        required
                        value={nodeForm.name}
                        onChange={(e) => setNodeForm({...nodeForm, name: e.target.value})}
                        placeholder="E.g. Grandview's Blue Pearl"
                        className="bg-slate-800 border-white/10 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">Breed</label>
                      <select
                        value={nodeForm.breed}
                        onChange={(e) => setNodeForm({...nodeForm, breed: e.target.value})}
                        className="bg-slate-800 border-white/10 text-sm py-2 px-3 rounded-lg text-white"
                      >
                        <option value="">-- Select Breed --</option>
                        {Object.keys(BREED_STANDARDS).map(breedName => (
                          <option key={breedName} value={breedName}>
                            {breedName} ({BREED_STANDARDS[breedName].classType})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">Variety (Color)</label>
                      <input
                        type="text"
                        value={nodeForm.variety}
                        onChange={(e) => setNodeForm({...nodeForm, variety: e.target.value})}
                        placeholder="E.g. Broken Blue"
                        className="bg-slate-800 border-white/10 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">Weight (in Ounces) *</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={nodeForm.weightOz}
                          onChange={(e) => setNodeForm({...nodeForm, weightOz: e.target.value})}
                          placeholder="Oz"
                          className="bg-slate-800 border-white/10 text-sm flex-1"
                        />
                        <span className="text-xs opacity-75">
                          ({(Number(nodeForm.weightOz) / 16).toFixed(2)} lbs)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">Date of Birth</label>
                      <input
                        type="date"
                        value={nodeForm.dob}
                        onChange={(e) => setNodeForm({...nodeForm, dob: e.target.value})}
                        className="bg-slate-800 border-white/10 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">ARBA Registration Number</label>
                      <input
                        type="text"
                        value={nodeForm.registrationNumber}
                        onChange={(e) => setNodeForm({...nodeForm, registrationNumber: e.target.value})}
                        placeholder="E.g. REG-12345"
                        className="bg-slate-800 border-white/10 text-sm font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-300">Grand Champion Number</label>
                      <input
                        type="text"
                        value={nodeForm.gcNumber}
                        onChange={(e) => setNodeForm({...nodeForm, gcNumber: e.target.value})}
                        placeholder="E.g. GC-5544"
                        className="bg-slate-800 border-white/10 text-sm font-mono border-yellow-500/35"
                      />
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-300">Notes (Vet / Breeder Records)</label>
                      <textarea
                        value={nodeForm.notes}
                        onChange={(e) => setNodeForm({...nodeForm, notes: e.target.value})}
                        placeholder="Notes about quality, background, or veterinary care..."
                        rows={2}
                        className="bg-slate-800 border-white/10 text-sm rounded-xl"
                      />
                    </div>

                  </div>
                )}

                {/* SHOW LEGS SUB-PANEL FOR ANCESTOR (ONLY IF ALREADY EXISTS OR NEW WITH INFO) */}
                {(pedigreeEditNode.rabbitId || pedigreeEditNode.isOffspring) && (
                  <div className="flex flex-col gap-4 border-t border-white/5 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                      🏆 Post & Record Show Leg Certificates
                    </h4>
                    
                    {/* List of current legs */}
                    <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {(nodeForm.legs || []).map((leg, lIdx) => (
                        <div key={leg.id || lIdx} className="p-2.5 bg-black/30 border border-white/5 rounded-lg flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-yellow-300">{leg.award}</span>
                            <p className="opacity-80">{leg.showName} ({leg.date})</p>
                            <p className="opacity-60 text-[10px]">Judge: {leg.judge} | Class size: {leg.classSize}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setNodeForm(prev => {
                                const nextLegs = prev.legs.filter((_, idx) => idx !== lIdx);
                                // update in allRabbits
                                setAllRabbits(all => all.map(r => {
                                  if (r.id === pedigreeEditNode.rabbitId) {
                                    return { ...r, legs: nextLegs };
                                  }
                                  return r;
                                }));
                                return { ...prev, legs: nextLegs };
                              });
                            }}
                            className="text-red-400 hover:text-red-300 font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {(!nodeForm.legs || nodeForm.legs.length === 0) && (
                        <p className="text-[11px] italic opacity-50 text-center py-2">No legs posted for this rabbit yet.</p>
                      )}
                    </div>

                    {/* Add leg form */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                      <input
                        type="text" placeholder="Show Name"
                        value={newAncestorLeg.showName}
                        onChange={(e) => setNewAncestorLeg({...newAncestorLeg, showName: e.target.value})}
                        className="text-[11px] py-1 px-2.5 bg-slate-800 border-white/5"
                      />
                      <input
                        type="text" placeholder="Judge Name"
                        value={newAncestorLeg.judge}
                        onChange={(e) => setNewAncestorLeg({...newAncestorLeg, judge: e.target.value})}
                        className="text-[11px] py-1 px-2.5 bg-slate-800 border-white/5"
                      />
                      <select
                        value={newAncestorLeg.award}
                        onChange={(e) => setNewAncestorLeg({...newAncestorLeg, award: e.target.value})}
                        className="text-[11px] py-1 px-2.5 bg-slate-800 border-white/5"
                      >
                        <option value="1st Class">1st Class 🥇</option>
                        <option value="Best of Variety">BOV 🏆</option>
                        <option value="Best of Breed">BOB 🌟</option>
                        <option value="Best In Show">BIS 👑</option>
                      </select>
                      <input
                        type="number" placeholder="Class Size"
                        value={newAncestorLeg.classSize}
                        onChange={(e) => setNewAncestorLeg({...newAncestorLeg, classSize: e.target.value})}
                        className="text-[11px] py-1 px-2.5 bg-slate-800 border-white/5"
                      />
                      <button
                        type="button"
                        onClick={handleAddAncestorLeg}
                        className="col-span-2 md:col-span-4 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-bold rounded-lg border border-yellow-500/35 transition-all text-xs"
                      >
                        ➕ Post Show Leg Certificate
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between gap-2 border-t border-white/10 pt-4 flex-wrap">
                  <div>
                    {!pedigreeEditNode.isOffspring && pedigreeEditNode.rabbitId && (
                      <button
                        type="button"
                        onClick={handleRemovePedigreeNode}
                        className="btn-interactive text-xs bg-red-650 hover:bg-red-700 font-bold py-2 px-4 border-none text-white"
                      >
                        Remove Link (Make Unknown)
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPedigreeEditNode(null)}
                      className="btn-interactive text-xs bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 py-2 px-4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-interactive text-xs bg-indigo-600 hover:bg-indigo-650 font-bold py-2 px-4 border-none text-white"
                    >
                      Save Ancestor & Link
                    </button>
                  </div>
                </div>

              </form>

            </div>
          </div>
        );
      })()}

      {/* Printable Pedigree Certificate Modal */}
      {showPrintPedigreeModal && (() => {
        const rabbit = showPrintPedigreeModal;
        const sire = rabbit.sireId ? rabbits.find(r => r.id === rabbit.sireId) : null;
        const dam = rabbit.damId ? rabbits.find(r => r.id === rabbit.damId) : null;
        
        const patSire = sire && sire.sireId ? rabbits.find(r => r.id === sire.sireId) : null;
        const patDam = sire && sire.damId ? rabbits.find(r => r.id === sire.damId) : null;
        const matSire = dam && dam.sireId ? rabbits.find(r => r.id === dam.sireId) : null;
        const matDam = dam && dam.damId ? rabbits.find(r => r.id === dam.damId) : null;

        const patPatSire = patSire && patSire.sireId ? rabbits.find(r => r.id === patSire.sireId) : null;
        const patPatDam = patSire && patSire.damId ? rabbits.find(r => r.id === patSire.damId) : null;
        const patMatSire = patDam && patDam.sireId ? rabbits.find(r => r.id === patDam.sireId) : null;
        const patMatDam = patDam && patDam.damId ? rabbits.find(r => r.id === patDam.damId) : null;

        const matPatSire = matSire && matSire.sireId ? rabbits.find(r => r.id === matSire.sireId) : null;
        const matPatDam = matSire && matSire.damId ? rabbits.find(r => r.id === matSire.damId) : null;
        const matMatSire = matDam && matDam.sireId ? rabbits.find(r => r.id === matDam.sireId) : null;
        const matMatDam = matDam && matDam.damId ? rabbits.find(r => r.id === matDam.damId) : null;

        const renderPrintBox = (ancestor, roleLabel, gender) => {
          if (!ancestor) {
            return (
              <div className="p-2 border border-slate-300 bg-slate-50/50 rounded-lg flex flex-col justify-center text-center h-full min-h-[50px]">
                <span className="text-[7px] uppercase font-bold text-slate-400 block leading-none">{roleLabel}</span>
                <span className="text-[9px] italic text-slate-400 font-semibold mt-1">Unknown Ancestor</span>
              </div>
            );
          }
          
          const namePrefix = ancestor.gcNumber ? `GC ` : '';
          const weightLbs = (ancestor.weightOz / 16).toFixed(2);
          const legsCount = ancestor.legs?.length || 0;

          return (
            <div className={`p-2 border border-black rounded-lg flex flex-col justify-between text-left h-full min-h-[50px] ${gender === 'buck' ? 'bg-blue-50/10' : 'bg-pink-50/10'}`}>
              <div>
                <div className="flex justify-between items-start gap-1 leading-none">
                  <span className="text-[7px] uppercase font-bold text-slate-500">{roleLabel}</span>
                  {legsCount > 0 && <span className="text-[7px] bg-indigo-100 text-indigo-800 font-bold px-1 rounded">Legs: {legsCount}</span>}
                </div>
                <h5 className="font-serif font-bold text-[10px] leading-tight text-slate-900 uppercase mt-1 truncate max-w-[170px]">
                  {namePrefix}{ancestor.name}
                </h5>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1 text-[8px] border-t border-slate-200 pt-1 text-slate-700 font-mono">
                <div>Tat: <strong>{ancestor.tattooNumber}</strong></div>
                <div>Wt: <strong>{weightLbs} lbs</strong></div>
                <div className="col-span-2">Breed/Var: <strong>{ancestor.breed} - {ancestor.variety}</strong></div>
                {ancestor.registrationNumber && <div className="col-span-2">Reg #: <strong>{ancestor.registrationNumber}</strong></div>}
                {ancestor.gcNumber && <div className="col-span-2 text-[7px] text-yellow-700 font-bold">GC #: {ancestor.gcNumber}</div>}
              </div>
            </div>
          );
        };

        const activeBreeder = adminBreeders.find(b => b.id === (selectedBreederContext === 'all' ? (currentUser?.id || 'ab-2') : selectedBreederContext)) || adminBreeders[0];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <div className="printable-modal w-full max-w-5xl bg-white text-slate-900 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 relative max-h-[95vh] overflow-y-auto border-4 border-indigo-650">
              
              {/* Close & Print buttons (Hidden on Print) */}
              <div className="no-print absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-interactive text-xs bg-indigo-600 font-bold py-2 px-4 border-none text-white flex items-center gap-1.5"
                >
                  🖨️ Print Certificate
                </button>
                <button 
                  onClick={() => setShowPrintPedigreeModal(null)}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Certificate layout */}
              <div className="flex flex-col gap-6 w-full mt-2">
                
                {/* Header section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b-2 border-black pb-4 items-center">
                  
                  {/* Left Side: Breeder Info */}
                  <div className="flex flex-col text-left text-xs gap-0.5 text-slate-700">
                    <span className="text-[8px] font-bold text-slate-400 block uppercase">Generated by</span>
                    <strong className="text-sm font-bold text-slate-900">{activeBreeder.rabbitryName || 'Grandview Rabbitry'}</strong>
                    <p>Owner: {activeBreeder.name}</p>
                    {activeBreeder.phone && <p>Phone: {activeBreeder.phone}</p>}
                    <p>Email: {activeBreeder.email}</p>
                    {activeBreeder.arbaMemberNumber && <p>ARBA Account #: {activeBreeder.arbaMemberNumber}</p>}
                  </div>

                  {/* Center: Title */}
                  <div className="text-center flex flex-col items-center gap-1">
                    <span className="text-3xl">🐇</span>
                    <h2 className="font-serif font-black text-xl uppercase tracking-widest text-indigo-950 leading-none">
                      Pedigree Certificate
                    </h2>
                    <span className="text-[8px] font-mono uppercase tracking-wider text-slate-500">
                      Official 3-Generation Ancestor Lineage
                    </span>
                  </div>

                  {/* Right Side: Offspring Details */}
                  <div className="bg-slate-55 p-3 rounded-xl border border-slate-200 text-xs text-left grid grid-cols-2 gap-1 gap-x-3 text-slate-700">
                    <div className="col-span-2 border-b border-slate-200 pb-1 mb-1 flex justify-between items-center">
                      <strong className="font-serif font-bold text-sm text-slate-900">{rabbit.name}</strong>
                      {rabbit.gcNumber && <span className="text-[8px] bg-yellow-100 text-yellow-800 font-bold px-1.5 py-0.5 rounded">🏆 CHAMP</span>}
                    </div>
                    <div>Tattoo: <strong>{rabbit.tattooNumber}</strong></div>
                    <div>Sex: <strong className="capitalize">{rabbit.sex}</strong></div>
                    <div>Breed: <strong>{rabbit.breed}</strong></div>
                    <div>Variety: <strong>{rabbit.variety}</strong></div>
                    <div>DOB: <strong>{rabbit.dob}</strong></div>
                    <div>Weight: <strong>{(rabbit.weightOz / 16).toFixed(2)} lbs</strong></div>
                    <div>Inbreeding (F): <strong>{(rabbit.inbreedingCoeff * 100).toFixed(2)}%</strong></div>
                    {rabbit.registrationNumber && <div className="col-span-2">Reg #: <strong>{rabbit.registrationNumber}</strong></div>}
                  </div>

                </div>

                {/* Pedigree tree display */}
                <div className="flex gap-4 items-stretch h-[480px]">
                  
                  {/* Generation 1: Parents */}
                  <div className="flex flex-col justify-around gap-4 flex-1">
                    {renderPrintBox(sire, 'Sire (Father)', 'buck')}
                    {renderPrintBox(dam, 'Dam (Mother)', 'doe')}
                  </div>

                  {/* Generation 2: Grandparents */}
                  <div className="flex flex-col justify-around gap-2 flex-1">
                    {renderPrintBox(patSire, 'Paternal Grand-Sire', 'buck')}
                    {renderPrintBox(patDam, 'Paternal Grand-Dam', 'doe')}
                    {renderPrintBox(matSire, 'Maternal Grand-Sire', 'buck')}
                    {renderPrintBox(matDam, 'Maternal Grand-Dam', 'doe')}
                  </div>

                  {/* Generation 3: Great-Grandparents */}
                  <div className="flex flex-col justify-around gap-1 flex-1">
                    {renderPrintBox(patPatSire, 'Paternal P. Grand-Sire', 'buck')}
                    {renderPrintBox(patPatDam, 'Paternal P. Grand-Dam', 'doe')}
                    {renderPrintBox(patMatSire, 'Paternal M. Grand-Sire', 'buck')}
                    {renderPrintBox(patMatDam, 'Paternal M. Grand-Dam', 'doe')}
                    {renderPrintBox(matPatSire, 'Maternal P. Grand-Sire', 'buck')}
                    {renderPrintBox(matPatDam, 'Maternal P. Grand-Dam', 'doe')}
                    {renderPrintBox(matMatSire, 'Maternal M. Grand-Sire', 'buck')}
                    {renderPrintBox(matMatDam, 'Maternal M. Grand-Dam', 'doe')}
                  </div>

                </div>

                {/* Footer certifications / signatures */}
                <div className="grid grid-cols-2 gap-8 border-t border-slate-300 pt-4 text-xs text-slate-700">
                  <div className="flex flex-col gap-1 text-left">
                    <p>I hereby certify that this pedigree is true and correct to the best of my knowledge and belief.</p>
                    <div className="flex gap-2 items-end mt-4">
                      <span>Signed:</span>
                      <div className="border-b border-black w-48 h-5 font-serif italic text-center text-sm">{activeBreeder.name}</div>
                      <span>Date:</span>
                      <div className="border-b border-black w-24 h-5 text-center">{new Date().toISOString().split('T')[0]}</div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end items-end text-right">
                    <span className="text-[10px] font-bold tracking-widest text-indigo-905 uppercase">Rabbitry Registry Sync Certified</span>
                    <p className="text-[8px] font-mono opacity-50 mt-1">Hash verification token: rp-block-{rabbit.id.slice(-6)}-{Date.now().toString().slice(-4)}</p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* Email / Text Import Wizard Modal */}
      {showEmailImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-100">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-indigo-400">
                  ✉️ Email / Text Import Wizard
                </h3>
                <p className="text-xs opacity-70">
                  Paste the show leg email report or Verifiable Transfer Certificate JSON below.
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowEmailImportModal(false);
                  setEmailImportPreview(null);
                  setEmailImportText('');
                }} 
                className="opacity-70 hover:opacity-100 text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!emailImportPreview ? (
              // Paste Text Box
              <div className="flex flex-col gap-4">
                <textarea
                  value={emailImportText}
                  onChange={(e) => setEmailImportText(e.target.value)}
                  placeholder="Paste email content here... (e.g. Show: Midwest Specialty, Judge: Adam West, Award: Best of Breed, Size: 10, Tattoo: CL-L1) OR paste the JSON certificate block."
                  rows={8}
                  className="w-full bg-slate-800 border-white/10 text-sm rounded-xl font-mono text-white/90 p-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailImportModal(false)}
                    className="btn-interactive text-xs bg-slate-800 border border-white/10 text-slate-300 py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleParseImportText}
                    className="btn-interactive text-xs bg-indigo-600 font-bold py-2 px-4 text-white border-none"
                  >
                    Parse Paste Content
                  </button>
                </div>
              </div>
            ) : (
              // Preview parsed result
              <form onSubmit={handleConfirmImport} className="flex flex-col gap-4">
                <h4 className="text-sm font-bold text-yellow-400">Extracted Import Preview</h4>
                
                {emailImportPreview.type === 'leg' ? (
                  <div className="grid grid-cols-2 gap-3 bg-black/25 p-4 rounded-xl border border-white/5 text-xs text-slate-300">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400">Show Name</label>
                      <input
                        type="text"
                        value={emailImportPreview.showName}
                        onChange={(e) => setEmailImportPreview({...emailImportPreview, showName: e.target.value})}
                        className="bg-slate-850 border border-white/10 text-xs p-2 text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400">Judge</label>
                      <input
                        type="text"
                        value={emailImportPreview.judge}
                        onChange={(e) => setEmailImportPreview({...emailImportPreview, judge: e.target.value})}
                        className="bg-slate-850 border border-white/10 text-xs p-2 text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400">Award Date</label>
                      <input
                        type="date"
                        value={emailImportPreview.date}
                        onChange={(e) => setEmailImportPreview({...emailImportPreview, date: e.target.value})}
                        className="bg-slate-850 border border-white/10 text-xs p-2 text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400">Award Type</label>
                      <select
                        value={emailImportPreview.award}
                        onChange={(e) => setEmailImportPreview({...emailImportPreview, award: e.target.value})}
                        className="bg-slate-850 border border-white/10 text-xs p-2 text-white"
                      >
                        <option value="1st Class">1st Class Ribbon 🥇</option>
                        <option value="Best of Variety">Best of Variety (BOV) 🏆</option>
                        <option value="Best of Breed">Best of Breed (BOB) 🌟</option>
                        <option value="Best In Show">Best In Show (BIS) 👑</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400">Class Size</label>
                      <input
                        type="number"
                        value={emailImportPreview.classSize}
                        onChange={(e) => setEmailImportPreview({...emailImportPreview, classSize: e.target.value})}
                        className="bg-slate-850 border border-white/10 text-xs p-2 text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400">Rabbit Tattoo Number</label>
                      <select
                        value={emailImportPreview.rabbitTattoo}
                        onChange={(e) => setEmailImportPreview({...emailImportPreview, rabbitTattoo: e.target.value})}
                        className="bg-slate-850 border border-white/10 text-xs p-2 text-white"
                      >
                        <option value="">-- Choose Target Rabbit --</option>
                        {rabbits.filter(r => r.status !== 'pedigree_only').map(r => (
                          <option key={r.id} value={r.tattooNumber}>{r.name} ({r.tattooNumber})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 bg-black/25 p-4 rounded-xl border border-white/5 text-xs text-slate-300">
                    <p className="text-[11px] text-green-400 font-bold mb-2">✓ Valid Verifiable Transfer Certificate Detected!</p>
                    <div>Rabbit Name: <strong>{emailImportPreview.name}</strong></div>
                    <div>Tattoo Number: <strong>{emailImportPreview.tattooNumber}</strong></div>
                    <div>Breed / Variety: <strong>{emailImportPreview.breed} - {emailImportPreview.variety}</strong></div>
                    <div>Sex: <strong className="capitalize">{emailImportPreview.sex}</strong></div>
                    <div>Weight: <strong>{(emailImportPreview.weightOz / 16).toFixed(2)} lbs</strong></div>
                    <p className="text-[10px] text-slate-400 mt-2">Clicking confirm will import this rabbit into your active inventory and recursively recreate its 3-generation pedigree tree from the certificate data.</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t border-white/10 pt-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEmailImportPreview(null)}
                    className="btn-interactive text-xs bg-slate-850 border border-white/10 text-slate-300 py-2 px-4"
                  >
                    Back / Clear
                  </button>
                  <button
                    type="submit"
                    className="btn-interactive text-xs bg-indigo-650 hover:bg-indigo-700 font-bold py-2 px-4 text-white border-none"
                  >
                    Confirm Import
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Toast Notifications Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`glass-container p-4 rounded-xl shadow-lg flex items-center gap-3 border pointer-events-auto transition-all duration-300 transform translate-y-0 scale-100 ${
              toast.type === 'error' ? 'border-red-500/35 bg-red-950/80 text-red-200' :
              toast.type === 'info' ? 'border-orange-500/35 bg-orange-950/80 text-orange-200 font-semibold' :
              'border-emerald-500/35 bg-emerald-950/80 text-emerald-200'
            }`}
          >
            <span className="text-base">
              {toast.type === 'error' ? '❌' : toast.type === 'info' ? '⚡' : '✅'}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">{toast.message}</span>
              <span className="text-[9px] opacity-75 text-indigo-200">SQLite Storage Synced</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
