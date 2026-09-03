import React, { useState } from 'react';
import { X, Printer, ShieldCheck, Heart, FileText, CheckCircle2, AlertTriangle, Sparkles, Award } from 'lucide-react';

export default function PrintableBillOfSaleModal({ 
  transfer = null, 
  rabbit = null, 
  breeder = {}, 
  onClose 
}) {
  const [warrantyDays, setWarrantyDays] = useState(7);
  const [includeCareGuide, setIncludeCareGuide] = useState(true);
  const [activeTab, setActiveTab] = useState('certificate'); // 'certificate' | 'warranty' | 'care'

  const targetRabbit = rabbit || (transfer ? {
    id: transfer.rabbitId,
    name: transfer.rabbitName,
    tattooNumber: transfer.rabbitTattoo,
    breed: transfer.rabbitBreed,
    variety: transfer.rabbitVariety || 'Standard Purebred',
    sex: transfer.rabbitSex || 'Not Specified',
    dob: transfer.rabbitDob || 'Unknown',
    weightOz: transfer.rabbitWeightOz || 64,
    registrationNumber: transfer.rabbitReg || '',
    gcNumber: transfer.rabbitGc || ''
  } : {
    id: 'sample',
    name: 'Grandview\'s Blue Lightning',
    tattooNumber: 'HL-F1-01',
    breed: 'Holland Lop',
    variety: 'Solid Blue',
    sex: 'buck',
    dob: '2024-03-15',
    weightOz: 60,
    registrationNumber: 'REG-HL-1001',
    gcNumber: 'GC-10088'
  });

  const targetBreeder = {
    rabbitryName: breeder.rabbitryName || 'Grandview Pedigree Barn',
    name: breeder.name || 'Jason Mounts',
    phone: breeder.phone || '555-0100',
    email: breeder.email || 'jasonmounts77@yahoo.com',
    arbaMemberNumber: breeder.arbaMemberNumber || 'ARBA-554123',
    city: breeder.city || 'Delaware',
    state: breeder.state || 'OH',
    zip: breeder.zip || '43015',
    address: breeder.address || 'Grandview Barn Way'
  };

  const buyerInfo = {
    name: transfer?.buyerName || 'Buyer Full Name',
    email: transfer?.buyerEmail || 'buyer@example.com',
    phone: transfer?.buyerPhone || '555-0199',
    price: transfer?.price !== undefined ? transfer.price : 125.00,
    date: transfer?.date || new Date().toISOString().split('T')[0],
    certId: transfer?.certificateId || ('TX-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000))
  };

  const weightLbs = ((targetRabbit.weightOz || 64) / 16).toFixed(2);

  return (
    <div className="printable-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="printable-modal w-full max-w-5xl bg-white text-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 relative max-h-[95vh] overflow-y-auto border-8 border-double border-slate-800 print:border-4 print:border-double print:border-slate-800 print:p-4 print:gap-4 font-serif">
        
        {/* Top Floating Control Bar (Hidden when printed) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-3 rounded-2xl border border-white/10 shadow-lg sticky top-0 z-30 font-sans">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
              📜 Purebred Bill of Sale & Care Packet
            </span>
            <div className="flex gap-1 bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('certificate')}
                className={'px-3 py-1 rounded-lg border-none cursor-pointer transition-all ' + (activeTab === 'certificate' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white bg-transparent')}
              >
                1. Bill of Sale
              </button>
              <button
                onClick={() => setActiveTab('warranty')}
                className={'px-3 py-1 rounded-lg border-none cursor-pointer transition-all ' + (activeTab === 'warranty' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white bg-transparent')}
              >
                2. Health Warranty
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={'px-3 py-1 rounded-lg border-none cursor-pointer transition-all ' + (activeTab === 'care' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white bg-transparent')}
              >
                3. Care Guide
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCareGuide}
                onChange={(e) => setIncludeCareGuide(e.target.checked)}
                className="rounded text-indigo-600"
              />
              Print Full Care Packet
            </label>
            <button
              onClick={() => {
                const savedUser = localStorage.getItem('rp_current_user');
                let isDemo = false;
                try {
                  const u = JSON.parse(savedUser);
                  if (u?.isDemo || u?.id === 'ab-demo-1' || u?.id === 'ab-youth-1') isDemo = true;
                } catch(e) {}
                if (isDemo) {
                  alert("Demo Mode: Printing Bill of Sale transfer documents requires an active subscription. Please upgrade in the Billing tab.");
                  return;
                }
                window.print();
              }}
              className="btn-interactive py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border-none shadow-md shadow-emerald-950/40"
            >
              <Printer className="w-4 h-4" /> Print Document
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-600 text-white font-bold flex items-center justify-center cursor-pointer border-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* DOCUMENT SECTION 1: OFFICIAL BILL OF SALE & OWNERSHIP TRANSFER CERTIFICATE */}
        <div className="flex flex-col gap-4 text-left border-b-2 border-slate-300 pb-6 print:pb-4">
          
          {/* Header Banner with Rabbitry Info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-slate-900 pb-3">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-indigo-900 uppercase font-black block leading-tight">
                OFFICIAL ARBA COMPLIANT DOCUMENTATION
              </span>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-slate-950 font-serif leading-none">
                Purebred Rabbit Bill of Sale & Transfer
              </h1>
              <span className="text-xs text-slate-600 font-bold block mt-1">
                Certificate ID: <strong className="font-mono text-slate-900">{buyerInfo.certId}</strong> • Date: <strong className="font-mono text-slate-900">{buyerInfo.date}</strong>
              </span>
            </div>

            {/* Breeder Rabbitry Card */}
            <div className="text-right text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 font-sans leading-tight">
              <strong className="text-sm font-black text-indigo-950 block uppercase font-serif">{targetBreeder.rabbitryName}</strong>
              <span className="text-slate-700 block">Breeder: {targetBreeder.name}</span>
              <span className="text-slate-700 block">Phone: {targetBreeder.phone}</span>
              <span className="text-slate-700 block">Email: {targetBreeder.email}</span>
              {targetBreeder.arbaMemberNumber && (
                <span className="text-indigo-900 font-bold block mt-0.5">ARBA Account: {targetBreeder.arbaMemberNumber}</span>
              )}
            </div>
          </div>

          {/* 2-Column Specs Grid: Rabbit Info & Buyer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
            
            {/* Left: Purchased Rabbit Details */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1.5">
              <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                <span className="font-black uppercase text-indigo-950 tracking-wider text-[11px]">🐇 Animal Identification</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded font-mono">Tattoo: {targetRabbit.tattooNumber || 'No Tattoo'}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-slate-800">
                <div>Name: <strong className="text-slate-950 font-bold font-serif">{targetRabbit.name}</strong></div>
                <div>Sex: <strong className="capitalize text-slate-950 font-bold">{targetRabbit.sex}</strong></div>
                <div>Breed: <strong className="text-slate-950 font-bold">{targetRabbit.breed}</strong></div>
                <div>Variety / Color: <strong className="text-slate-950 font-bold">{targetRabbit.variety}</strong></div>
                <div>Date of Birth: <strong className="text-slate-950 font-mono">{targetRabbit.dob}</strong></div>
                <div>Weight at Sale: <strong className="text-slate-950 font-mono">{weightLbs} lbs ({targetRabbit.weightOz} oz)</strong></div>
                {targetRabbit.registrationNumber && <div>Reg #: <strong className="font-mono text-slate-950">{targetRabbit.registrationNumber}</strong></div>}
                {targetRabbit.gcNumber && <div>GC #: <strong className="font-mono text-yellow-800 font-bold">🏆 {targetRabbit.gcNumber}</strong></div>}
              </div>
            </div>

            {/* Right: Buyer Details & Transaction Terms */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1.5">
              <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                <span className="font-black uppercase text-indigo-950 tracking-wider text-[11px]">👤 Buyer & Sale Terms</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-mono">Price: {'$' + buyerInfo.price.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-slate-800">
                <div className="col-span-2">Buyer Name: <strong className="text-slate-950 font-bold">{buyerInfo.name}</strong></div>
                <div>Email: <strong className="text-slate-950">{buyerInfo.email}</strong></div>
                <div>Phone: <strong className="text-slate-950 font-mono">{buyerInfo.phone}</strong></div>
                <div>Transfer Type: <strong className="text-slate-950 capitalize">{transfer?.type || 'Permanent Sale'}</strong></div>
                <div>Payment: <strong className="text-slate-950">Paid in Full</strong></div>
              </div>
            </div>

          </div>

        </div>

        {/* DOCUMENT SECTION 2: HEALTH GUARANTEE & LIMITED WARRANTY CLAUSE */}
        <div className="flex flex-col gap-3 text-left font-sans text-xs border-b-2 border-slate-300 pb-6 print:pb-4">
          
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="text-sm font-black text-slate-950 uppercase tracking-wide font-serif">
              Rabbitry Health Guarantee & Limited Warranty Terms
            </h2>
          </div>

          <p className="text-slate-800 leading-relaxed">
            The breeder guarantees that <strong>{targetRabbit.name}</strong> (Tattoo: <strong>{targetRabbit.tattooNumber}</strong>) is sound, clear-eyed, vigorous, and free from infectious disease, internal or external parasites (ear mites, fur mites), snuffles (Pasteurella), malocclusion, and vent disease at the time of pickup/delivery.
          </p>

          {/* Core Warranty Terms & Exclusions Box */}
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-300/80 text-[11px] text-amber-950 flex flex-col gap-2">
            <div>
              <strong className="font-bold block text-amber-900 mb-0.5">🛡️ Scope of Limited {warrantyDays}-Day Health Warranty:</strong>
              <p className="leading-snug">
                If within <strong>{warrantyDays} days</strong> of purchase, the rabbit is diagnosed by a licensed veterinarian with a genetic defect or pre-existing illness that existed prior to transfer, the breeder will provide a replacement rabbit of equal value or credit toward a future litter upon receipt of the veterinary report.
              </p>
            </div>

            <div className="border-t border-amber-200/80 pt-1.5">
              <strong className="font-bold block text-red-900 mb-0.5">⚠️ Mandatory Care Conditions & Neglect Exclusion:</strong>
              <p className="leading-snug text-slate-800">
                <strong>This warranty is strictly conditioned on the buyer providing proper animal husbandry.</strong> The warranty is immediately rendered <strong>NULL AND VOID</strong> if the illness, injury, or demise of the animal is determined to be the result of:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-800">
                <li><strong>Neglect or Dehydration</strong>: Failure to provide continuous, clean, potable drinking water at all times.</li>
                <li><strong>Improper or Abrupt Diet Changes</strong>: Failure to follow the transition diet or feeding improper foods (greens/fruits to young kits, moldy hay, non-rabbit feeds).</li>
                <li><strong>Heat Stroke / Cold Exposure</strong>: Exposure to ambient temperatures above <strong>85°F (29°C)</strong> without active cooling fans, ice bottles, or air conditioning, or damp unshielded drafts.</li>
                <li><strong>Trauma & Domestic Hazards</strong>: Dropping, mishandling, spinal kicks from unsupported handling, dog/cat encounters, or predator attacks.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* DOCUMENT SECTION 3: ESSENTIAL 7-DAY CARE & TRANSITION GUIDE */}
        {includeCareGuide && (
          <div className="flex flex-col gap-3 text-left font-sans text-xs border-b-2 border-slate-300 pb-6 print:pb-4">
            
            <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
              <Heart className="w-5 h-5 text-rose-600" />
              <h2 className="text-sm font-black text-slate-950 uppercase tracking-wide font-serif">
                New Bunny 7-Day Care & Feeding Transition Guide
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* 1. Feeding & Hay */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1 text-[11px]">
                <strong className="font-bold text-indigo-950 uppercase text-[10px] flex items-center gap-1">
                  🌾 1. Feeding & Transition
                </strong>
                <p className="text-slate-700 leading-snug">
                  Mix the starter feed provided by the breeder with your new feed over 7 days (Day 1-2: 75% old / 25% new; Day 3-4: 50/50; Day 5-7: 25% old / 75% new).
                </p>
                <p className="text-slate-700 leading-snug mt-1">
                  Provide <strong>unlimited clean Timothy or Orchard Grass hay</strong> 24/7. Avoid fresh leafy greens for kits under 12 weeks of age.
                </p>
              </div>

              {/* 2. Housing & Climate */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1 text-[11px]">
                <strong className="font-bold text-indigo-950 uppercase text-[10px] flex items-center gap-1">
                  🏠 2. Housing & Temperature
                </strong>
                <p className="text-slate-700 leading-snug">
                  Provide a secure, predator-proof enclosure. If using wire-floor cages, provide a solid plastic/wooden rest board to protect delicate foot hocks.
                </p>
                <p className="text-slate-700 leading-snug mt-1">
                  <strong>Heat Warning</strong>: Rabbits cannot sweat and overheat easily above 85°F. Provide frozen water bottles or indoor cooling during summer.
                </p>
              </div>

              {/* 3. Handling & GI Stasis Alert */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1 text-[11px]">
                <strong className="font-bold text-indigo-950 uppercase text-[10px] flex items-center gap-1">
                  🩺 3. Handling & Health Watch
                </strong>
                <p className="text-slate-700 leading-snug">
                  <strong>Never lift a rabbit by its ears or scruff.</strong> Always cradle the front body while securely supporting the hindquarters to avoid spinal kicks.
                </p>
                <p className="text-slate-700 leading-snug mt-1 text-red-900 font-medium">
                  <strong>GI Stasis Emergency</strong>: If your rabbit stops eating or producing fecal pellets for 12 hours, contact an exotic veterinarian immediately.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* DOCUMENT SECTION 4: OFFICIAL SIGNATURES & VERIFICATION QR CODE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-2 text-xs font-sans">
          
          {/* Left: Breeder / Seller Signature */}
          <div className="flex flex-col gap-1 text-left">
            <span className="font-bold text-slate-800 text-[11px]">Seller / Breeder Certification:</span>
            <p className="text-[10px] text-slate-600 leading-tight">
              I certify that this rabbit is purebred, healthy at transfer, and meets our rabbitry standard.
            </p>
            <div className="border-b-2 border-slate-900 mt-4 pb-1 flex justify-between items-end">
              <span className="font-serif italic text-base text-indigo-950 font-bold">{targetBreeder.name}</span>
              <span className="text-[10px] text-slate-600 font-mono">{buyerInfo.date}</span>
            </div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Authorized Breeder Signature & Date</span>
          </div>

          {/* Center: Buyer Signature & Acknowledgement */}
          <div className="flex flex-col gap-1 text-left">
            <span className="font-bold text-slate-800 text-[11px]">Buyer Receipt & Warranty Acceptance:</span>
            <p className="text-[10px] text-slate-600 leading-tight">
              Buyer acknowledges receipt of healthy rabbit, full care instructions, and agrees to the warranty terms.
            </p>
            <div className="border-b-2 border-slate-900 mt-4 pb-1 flex justify-between items-end">
              <span className="font-serif italic text-base text-slate-900 font-bold">{buyerInfo.name}</span>
              <span className="text-[10px] text-slate-600 font-mono">{buyerInfo.date}</span>
            </div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Buyer Signature & Date</span>
          </div>

          {/* Right: Security Seal & QR Code */}
          <div className="flex items-center justify-end gap-3 text-right">
            <div className="flex flex-col items-end leading-tight">
              <span className="font-black text-indigo-950 uppercase font-serif text-[11px]">Rabbitry Certified</span>
              <span className="text-[10px] text-slate-600 font-mono">{'Token: rp-sale-' + targetRabbit.id.slice(-6)}</span>
              <span className="text-[9px] text-slate-500 mt-0.5">Scan QR to view pedigree tree</span>
            </div>
            <img 
              src={'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=' + encodeURIComponent('https://rabbitrypedigree.pro/pedigree/' + targetRabbit.id + '?tat=' + targetRabbit.tattooNumber + '&name=' + targetRabbit.name)} 
              alt="Verification QR"
              className="w-14 h-14 rounded border border-slate-400 p-0.5 bg-white shrink-0 shadow-sm"
            />
          </div>

        </div>

      </div>
    </div>
  );
}
