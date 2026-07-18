import React, { useState, useMemo } from 'react';
import { ShieldAlert, Printer, CheckCircle, XCircle, Search, ExternalLink, Calendar, Info } from 'lucide-react';
import { scanPedigree } from '../db/helpers';
import { CAVY_BREED_STANDARDS } from '../db/breedStandards';

export default function RegistrarPrep({ rabbits, allRabbits, selectedRabbitId: propSelectedRabbitId, setSelectedRabbitId: propSetSelectedRabbitId }) {
  const [localSelectedRabbitId, setLocalSelectedRabbitId] = useState('');

  const selectedRabbitId = propSelectedRabbitId !== undefined ? propSelectedRabbitId : localSelectedRabbitId;
  const setSelectedRabbitId = propSetSelectedRabbitId !== undefined ? propSetSelectedRabbitId : setLocalSelectedRabbitId;

  const activeRabbit = useMemo(() => {
    return rabbits.find(r => r.id === selectedRabbitId) || null;
  }, [selectedRabbitId, rabbits]);

  // Calculate age helper
  const getAgeMonths = (dobStr) => {
    if (!dobStr) return 0;
    const dob = new Date(dobStr);
    const today = new Date();
    const diffTime = today - dob;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays / 30.4375;
  };

  // Readiness evaluation details
  const readiness = useMemo(() => {
    if (!activeRabbit) return null;

    const isCavy = activeRabbit.species === 'cavy' || !!CAVY_BREED_STANDARDS[activeRabbit.breed];
    const ageMonths = getAgeMonths(activeRabbit.dob);
    const hasTattoo = !!activeRabbit.tattooNumber && activeRabbit.tattooNumber.trim().length > 0;
    const hasWeight = Number(activeRabbit.weightOz) > 0;
    const hasVariety = !!activeRabbit.variety && activeRabbit.variety.trim().length > 0;

    // Scan pedigree completeness
    const missingAncestors = scanPedigree(activeRabbit, allRabbits);
    const pedigreeComplete = missingAncestors.length === 0;

    const items = [
      isCavy ? {
        key: 'age',
        label: 'Cavy Minimum Weight Class (12+ Ounces)',
        passed: Number(activeRabbit.weightOz) >= 12,
        description: `Your cavy sow/boar weighs ${activeRabbit.weightOz || 0} oz. ARBA registration requires cavies to weigh at least 12 oz (be in Junior, Intermediate, or Senior weight classes).`
      } : {
        key: 'age',
        label: 'Adult Age Limit (6+ Months)',
        passed: ageMonths >= 6,
        description: `Your animal is ${ageMonths.toFixed(1)} months old. ARBA registration requires rabbits to be at least 6 months of age.`
      },
      {
        key: 'pedigree',
        label: '3-Generation Pedigree Completeness',
        passed: pedigreeComplete,
        description: pedigreeComplete 
          ? 'All 3 generations (sire, dam, grandparents, great-grandparents) are fully recorded.' 
          : `Missing ${missingAncestors.length} ancestral records in pedigree lineage (e.g. ${missingAncestors.slice(0, 2).map(m => m.name || m.field).join(', ')}). A complete 3-generation pedigree is required.`
      },
      isCavy ? {
        key: 'tattoo',
        label: 'Legible Left Ear Identification Tag',
        passed: hasTattoo,
        description: hasTattoo 
          ? `Ear Tag "${activeRabbit.tattooNumber}" recorded. Cavies must have a metal ear tag clamped in the left ear at inspection.` 
          : 'No ear tag number recorded. Cavy must have a legible ID ear tag in the left ear.'
      } : {
        key: 'tattoo',
        label: 'Legible Left Ear Identification Tattoo',
        passed: hasTattoo,
        description: hasTattoo 
          ? `Tattoo/Ear Tag "${activeRabbit.tattooNumber}" recorded. Must be legibly tattooed in the left ear at inspection.` 
          : 'No tattoo number/ear tag recorded. Animal must have a legible ID tattoo in the left ear.'
      },
      {
        key: 'weight',
        label: 'Recorded Standard Weight',
        passed: hasWeight,
        description: hasWeight 
          ? `Registered weight of ${(activeRabbit.weightOz / 16).toFixed(2)} lbs (${activeRabbit.weightOz} oz).` 
          : 'No weight recorded. Animal must be weighed and match standard weight bounds for the breed.'
      },
      {
        key: 'variety',
        label: 'SOP Variety/Color Verification',
        passed: hasVariety,
        description: hasVariety 
          ? `Variety "${activeRabbit.variety}" recorded. Must match general ARBA show groups.` 
          : 'No color variety selected. Registrars verify variety compatibility at inspection.'
      }
    ];

    const allPassed = items.every(item => item.passed);

    return { items, allPassed, missingCount: missingAncestors.length };
  }, [activeRabbit, allRabbits]);

  const handlePrintPacket = () => {
    if (!activeRabbit) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print the packet!");
      return;
    }

    const isCavy = activeRabbit.species === 'cavy' || !!CAVY_BREED_STANDARDS[activeRabbit.breed];
    const sexLabel = isCavy ? (activeRabbit.sex === 'buck' ? 'Boar' : 'Sow') : (activeRabbit.sex === 'buck' ? 'Buck' : 'Doe');
    const idLabel = isCavy ? 'Left Ear Tag' : 'Left Ear Tattoo';

    const ageMonths = getAgeMonths(activeRabbit.dob);
    const missing = scanPedigree(activeRabbit, allRabbits);

    printWindow.document.write(`
      <html>
        <head>
          <title>ARBA Registrar Pre-Inspection Packet - ${activeRabbit.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; text-transform: uppercase; color: #0f172a; }
            .subtitle { font-size: 14px; opacity: 0.8; margin-top: 5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; color: #475569; text-transform: uppercase; }
            .value { font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            th { background-color: #f8fafc; font-weight: bold; }
            .checklist-item { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 13px; }
            .box { width: 16px; height: 16px; border: 2px solid #475569; border-radius: 3px; display: inline-block; }
            .box.checked { background-color: #0f172a; border-color: #0f172a; position: relative; }
            .box.checked::after { content: "✓"; color: white; font-size: 12px; position: absolute; top: -2px; left: 2px; }
            .disclaimer { font-size: 11px; color: #64748b; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">ARBA Registrar Inspection Prep Packet</div>
            <div class="subtitle">WarrenWise Pro Registration Prep Summary</div>
          </div>

          <div class="grid">
            <div>
              <div class="section-title">Animal Information Summary</div>
              <div><strong>Name:</strong> <span class="value">${activeRabbit.name}</span></div>
              <div><strong>Breed:</strong> <span class="value">${activeRabbit.breed}</span></div>
              <div><strong>Variety:</strong> <span class="value">${activeRabbit.variety || 'Unassigned'}</span></div>
              <div><strong>Sex:</strong> <span class="value">${sexLabel}</span></div>
              <div><strong>${idLabel}:</strong> <span class="value">${activeRabbit.tattooNumber || 'Missing'}</span></div>
              <div><strong>Date of Birth:</strong> <span class="value">${activeRabbit.dob || 'Unknown'} (${ageMonths.toFixed(1)} months)</span></div>
              <div><strong>Registered Weight:</strong> <span class="value">${(activeRabbit.weightOz / 16).toFixed(2)} lbs (${activeRabbit.weightOz} oz)</span></div>
            </div>
            
            <div>
              <div class="section-title">Pre-Inspection Verification Checklist</div>
              <div class="checklist-item">
                <div class="box ${isCavy ? (Number(activeRabbit.weightOz) >= 12 ? 'checked' : '') : (ageMonths >= 6 ? 'checked' : '')}"></div>
                <span>${isCavy ? 'Cavy weighs at least 12 ounces (Minimum Registration Limit)' : 'Exhibitor rabbit is at least 6 months of age'}</span>
              </div>
              <div class="checklist-item">
                <div class="box ${missing.length === 0 ? 'checked' : ''}"></div>
                <span>Full 3-generation pedigree recorded (${14 - missing.length}/14 ancestors)</span>
              </div>
              <div class="checklist-item">
                <div class="box ${activeRabbit.tattooNumber ? 'checked' : ''}"></div>
                <span>${isCavy ? 'Metal identification tag clamped in left ear' : 'Legible tattoo in left ear'}</span>
              </div>
              <div class="checklist-item">
                <div class="box ${activeRabbit.weightOz > 0 ? 'checked' : ''}"></div>
                <span>Current weight matches standard range of breed</span>
              </div>
            </div>
          </div>

          <div class="section-title">Pedigree Lineage Status</div>
          <p style="font-size: 13px;">Pedigree is <strong>${missing.length === 0 ? 'COMPLETED' : 'INCOMPLETE'}</strong>. Missing ancestors: ${missing.length > 0 ? missing.map(m => m.name || m.field).join(', ') : 'None'}.</p>

          <div class="disclaimer">
            <strong>⚠️ IMPORTANT REGISTRATION NOTICE:</strong><br/>
            This preparation summary package is for organization and checklist purposes only. In accordance with the American Rabbit Breeders Association (ARBA) rules, official registration requires an in-person physical inspection of the animal by a licensed ARBA Registrar. The animal must match its pedigree details, be free of all show disqualifications, and be at least 6 months old (or meet class weight standards for cavies). For official registration application procedures, fee tables, and local show lookups, visit the official ARBA website at <strong>arba.net</strong>.
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Banner */}
      <div className="glass-container p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-500/20">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0">
            📜
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide">ARBA Registrar Inspection Prep</h2>
            <p className="text-xs opacity-75 mt-0.5">Prepare checklist summaries and print pre-inspection packets for registration</p>
          </div>
        </div>
        
        <a 
          href="https://arba.net" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-interactive text-xs py-2 px-4 bg-slate-800 border border-white/10 hover:border-indigo-400/30 text-indigo-300 font-bold flex items-center gap-1 shrink-0"
        >
          🌐 Search Registrars at arba.net <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Selector and Checklist */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="glass-container p-6 flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Search className="w-4 h-4 text-indigo-400" /> Select Animal to Evaluate:
              </label>
              <select
                value={selectedRabbitId}
                onChange={(e) => setSelectedRabbitId(e.target.value)}
                className="bg-slate-950 text-sm border-white/10"
              >
                <option value="">-- Choose Stock --</option>
                {rabbits.filter(r => r.status !== 'pedigree_only' && r.status !== 'sold' && r.status !== 'dead').map(r => (
                  <option key={r.id} value={r.id}>
                    {r.tattooNumber ? `[${r.tattooNumber}] ` : ''}{r.name} - {r.breed}
                  </option>
                ))}
              </select>
            </div>

            {activeRabbit && readiness ? (
              <div className="flex flex-col gap-5 mt-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <span className="text-xs font-bold text-slate-400">Ready Status:</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    readiness.allPassed 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {readiness.allPassed ? '✅ Ready for Inspection' : '⚠️ Pending Requirements'}
                  </span>
                </div>

                {/* Checklist Cards */}
                <div className="flex flex-col gap-3">
                  {readiness.items.map(item => (
                    <div 
                      key={item.key} 
                      className={`p-3.5 rounded-2xl border flex gap-3 items-start transition-all ${
                        item.passed 
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-slate-200' 
                          : 'bg-amber-950/25 border-amber-500/20 text-slate-200'
                      }`}
                    >
                      {item.passed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white">{item.label}</span>
                        <p className="text-[11px] opacity-75 mt-0.5 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Print action */}
                <button
                  onClick={handlePrintPacket}
                  className="btn-interactive mt-2 py-3 bg-indigo-600 hover:bg-indigo-650 text-white font-bold text-xs flex items-center justify-center gap-1.5 border-none"
                >
                  <Printer className="w-4 h-4" /> Generate Pre-Inspection Packet (PDF / Print)
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-xs opacity-60 flex flex-col items-center gap-2">
                <Info className="w-8 h-8 text-indigo-400" />
                Select an animal from your hutch to audit pedigree completeness, tattoo requirements, and minimum age.
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Educational Guidelines & Resources */}
        <div className="flex flex-col gap-6">
          
          {/* Official Inspector Steps */}
          <div className="glass-container p-6 flex flex-col gap-4 border border-white/10">
            <h3 className="font-extrabold text-sm text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" /> Official Inspection Steps
            </h3>
            
            <div className="flex flex-col gap-3.5 text-xs text-slate-300 leading-relaxed">
              <p>
                A licensed ARBA Registrar will physically inspect your animal to certify it is purebred and meets breed weight limits.
              </p>
              
              <div className="flex gap-2">
                <span className="font-bold text-indigo-400">1.</span>
                <p><strong>Ear Tattoo Matching:</strong> The registrar checks that the animal has a clean, readable tattoo in its left ear matching the pedigree.</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-indigo-400">2.</span>
                <p><strong>Conformation Audit:</strong> The registrar checks for teeth alignment, eye color, tail straightness, and health issues.</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-indigo-400">3.</span>
                <p><strong>Pedigree Verification:</strong> You must present a complete 3-generation pedigree showing breeds, varieties, and weights.</p>
              </div>
            </div>
          </div>

          {/* Directory Reminders */}
          <div className="glass-container p-6 flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-yellow-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-4 h-4" /> Find Local Registrars
            </h3>
            
            <p className="text-xs text-slate-350 leading-relaxed">
              Registrar inspections are usually done in person at local ARBA-sanctioned shows or by arranging an appointment.
            </p>
            
            <div className="flex flex-col gap-2 mt-1">
              <a 
                href="https://arba.net/show-search/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-bold"
              >
                📅 Look up upcoming shows <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://arba.net/registrar-search/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-bold"
              >
                👤 Find an ARBA registrar near you <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Legal Compliance Disclaimer */}
          <div className="glass-container p-4 bg-slate-950/40 border border-white/5 rounded-2xl flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase text-amber-500">Legal Compliance Disclaimer</span>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              This registry preparation module provides organization checklists only. Official registration requires in-person physical inspection of the animal by a licensed ARBA Registrar. This app does not issue official certificates or replace inspection processes. Refer to the ARBA website (arba.net) for official rules.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
