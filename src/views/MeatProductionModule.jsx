import React, { useState, useMemo } from 'react';
import { 
  Beef, Scale, TrendingUp, Calculator, ShieldCheck, FileText, Download, 
  CheckSquare, AlertCircle, Sparkles, DollarSign, Award, ArrowUpRight, 
  BookOpen, HelpCircle, Lock, Package, Calendar, RefreshCw, Printer,
  Tag, AlertTriangle, ExternalLink, Search, CheckCircle2, ChevronRight, Copy
} from 'lucide-react';
import { 
  PROCESSING_METHODS, 
  SALES_CHANNELS, 
  STANDARD_COMPLIANCE_DISCLAIMER, 
  EXTENDED_LEGAL_DISCLAIMER, 
  OFFICIAL_REGULATORY_REFERENCES, 
  SANITATION_CHECKLIST_ITEMS, 
  LABEL_EXEMPTION_STATEMENTS, 
  SAFE_HANDLING_INSTRUCTIONS,
  validateMeatLotRecord,
  evaluateInterstateCompliance 
} from '../domain/meatComplianceRules';

export default function MeatProductionModule({ rabbits = [], currentUser, onUpgrade, showToast }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | processing | labels | checklist | calculator | regulations
  
  // Persistent processing batch logs
  const [processingLogs, setProcessingLogs] = useState(() => {
    const saved = localStorage.getItem('rp_meat_processing_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'proc-1',
        lotNumber: 'LOT-2026-0715-NZW',
        date: '2026-07-15',
        litterName: 'NZW Litter 2026-A',
        processingMethod: 'on_farm_exempt',
        salesChannel: 'on_farm_direct',
        purchaserName: 'Direct Farm-Gate Customers',
        headCount: 8,
        totalLiveWeightLbs: 38.4,
        totalDressedWeightLbs: 23.8,
        avgLiveWeightLbs: 4.8,
        avgDressedWeightLbs: 2.98,
        dressingPercentage: 62.0,
        sanitationChecked: true,
        humaneChecked: true,
        checklistCompleted: ['potable_water', 'sanitized_surfaces', 'rapid_chill', 'viscera_check', 'food_grade_pack', 'temperature_log'],
        notes: 'Optimal 9-week harvest. Carcasses chilled to 36°F within 2 hours. Clean liver and kidney inspection.'
      },
      {
        id: 'proc-2',
        lotNumber: 'LOT-2026-0628-CAL',
        date: '2026-06-28',
        litterName: 'Californian Cross Litter B',
        processingMethod: 'on_farm_exempt',
        salesChannel: 'farmers_market',
        purchaserName: 'County Farmers Market Stand',
        headCount: 6,
        totalLiveWeightLbs: 30.0,
        totalDressedWeightLbs: 18.3,
        avgLiveWeightLbs: 5.0,
        avgDressedWeightLbs: 3.05,
        dressingPercentage: 61.0,
        sanitationChecked: true,
        humaneChecked: true,
        checklistCompleted: ['potable_water', 'sanitized_surfaces', 'rapid_chill', 'viscera_check', 'food_grade_pack'],
        notes: 'Vacuum packaged in 4-mil barrier pouches. Kept at 34°F in cooler transport.'
      }
    ];
  });

  // Save logs to localStorage
  const saveLogs = (newLogs) => {
    setProcessingLogs(newLogs);
    localStorage.setItem('rp_meat_processing_logs', JSON.stringify(newLogs));
  };

  // Form State for Adding Processing Log
  const [newLog, setNewLog] = useState({
    lotNumber: `LOT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-01`,
    litterName: '',
    processingMethod: 'on_farm_exempt',
    salesChannel: 'on_farm_direct',
    purchaserName: '',
    headCount: '8',
    totalLiveWeightLbs: '40',
    totalDressedWeightLbs: '24.8',
    notes: '',
    checklist: ['potable_water', 'sanitized_surfaces', 'rapid_chill', 'viscera_check', 'food_grade_pack']
  });

  // Label Designer State
  const [labelProducerName, setLabelProducerName] = useState(currentUser?.rabbitryName || 'Grandview Rabbitry & Meat Farm');
  const [labelAddress, setLabelAddress] = useState('123 Meadow Creek Road, Springfield, USA');
  const [labelProductTitle, setLabelProductTitle] = useState('Whole Dressed Fryer Rabbit');
  const [labelNetWeight, setLabelNetWeight] = useState('2 lbs 14 oz');
  const [labelLotNumber, setLabelLotNumber] = useState('LOT-2026-0715-NZW');
  const [labelPackDate, setLabelPackDate] = useState(new Date().toISOString().split('T')[0]);
  const [labelExemptionKey, setLabelExemptionKey] = useState('ON_FARM_EXEMPT');
  const [labelCustomExemption, setLabelCustomExemption] = useState('');

  // Traceability search state
  const [traceQuery, setTraceQuery] = useState('');

  // Pre-Sale Checklist Interactive State
  const [preSaleChecks, setPreSaleChecks] = useState({
    sanitation: true,
    chilled: true,
    scale: true,
    labeled: true,
    stateLimit: true,
    interstateVerified: false
  });

  // Profitability Calculator State
  const [calcFeedCostPerLb, setCalcFeedCostPerLb] = useState('0.42');
  const [calcLitterSize, setCalcLitterSize] = useState('8');
  const [calcGrowoutWeeks, setCalcGrowoutWeeks] = useState('9');
  const [calcFeedConsumedPerKitLbs, setCalcFeedConsumedPerKitLbs] = useState('14');
  const [calcSalePricePerLbDressed, setCalcSalePricePerLbDressed] = useState('7.50');

  // Production Metrics
  const metrics = useMemo(() => {
    const commercialRabbits = rabbits.filter(r => 
      ['New Zealand White', 'New Zealand Red', 'Californian', 'Flemish Giant', 'Champagne d\'Argent', 'Rex'].includes(r.breed) ||
      (r.notes || '').toLowerCase().includes('meat')
    );

    const totalHeadProcessed = processingLogs.reduce((acc, l) => acc + (Number(l.headCount) || 0), 0);
    const totalDressedLbs = processingLogs.reduce((acc, l) => acc + (Number(l.totalDressedWeightLbs) || 0), 0);
    const totalLiveLbs = processingLogs.reduce((acc, l) => acc + (Number(l.totalLiveWeightLbs) || 0), 0);
    const overallDressingPct = totalLiveLbs > 0 ? (totalDressedLbs / totalLiveLbs) * 100 : 61.5;

    // Sales channel distribution
    const channelCounts = {};
    processingLogs.forEach(l => {
      const ch = l.salesChannel || 'on_farm_direct';
      channelCounts[ch] = (channelCounts[ch] || 0) + (Number(l.totalDressedWeightLbs) || 0);
    });

    return {
      commercialCount: commercialRabbits.length || 24,
      totalHeadProcessed,
      totalDressedLbs: totalDressedLbs.toFixed(1),
      totalLiveLbs: totalLiveLbs.toFixed(1),
      overallDressingPct: overallDressingPct.toFixed(1),
      avgFCR: 3.2,
      channelCounts
    };
  }, [rabbits, processingLogs]);

  // Profitability Calculation
  const calcResults = useMemo(() => {
    const kits = parseFloat(calcLitterSize) || 8;
    const feedPerKit = parseFloat(calcFeedConsumedPerKitLbs) || 14;
    const feedCostLb = parseFloat(calcFeedCostPerLb) || 0.42;
    const salePriceLb = parseFloat(calcSalePricePerLbDressed) || 7.50;

    const totalFeedCostPerLitter = kits * feedPerKit * feedCostLb;
    const avgDressedWtLb = 3.0;
    const totalDressedLbsPerLitter = kits * avgDressedWtLb;
    const grossRevenuePerLitter = totalDressedLbsPerLitter * salePriceLb;
    const netProfitPerLitter = grossRevenuePerLitter - totalFeedCostPerLitter;
    const profitMarginPct = grossRevenuePerLitter > 0 ? (netProfitPerLitter / grossRevenuePerLitter) * 100 : 0;

    return {
      totalFeedCostPerLitter: totalFeedCostPerLitter.toFixed(2),
      totalDressedLbsPerLitter: totalDressedLbsPerLitter.toFixed(1),
      grossRevenuePerLitter: grossRevenuePerLitter.toFixed(2),
      netProfitPerLitter: netProfitPerLitter.toFixed(2),
      profitMarginPct: profitMarginPct.toFixed(1)
    };
  }, [calcFeedCostPerLb, calcLitterSize, calcGrowoutWeeks, calcFeedConsumedPerKitLbs, calcSalePricePerLbDressed]);

  // Handle Log Submit
  const handleAddLogSubmit = (e) => {
    e.preventDefault();
    const head = parseInt(newLog.headCount, 10) || 1;
    const live = parseFloat(newLog.totalLiveWeightLbs) || 0;
    const dressed = parseFloat(newLog.totalDressedWeightLbs) || 0;
    const yieldPct = live > 0 ? (dressed / live) * 100 : 0;

    const validation = validateMeatLotRecord({
      lotNumber: newLog.lotNumber,
      headCount: head,
      totalDressedWeightLbs: dressed
    });

    if (!validation.isValid) {
      alert("Validation Error: " + validation.errors.join("\n"));
      return;
    }

    const logObj = {
      id: `proc-${Date.now()}`,
      lotNumber: newLog.lotNumber.trim().toUpperCase(),
      date: new Date().toISOString().split('T')[0],
      litterName: newLog.litterName.trim() || 'Commercial Harvest Batch',
      processingMethod: newLog.processingMethod,
      salesChannel: newLog.salesChannel,
      purchaserName: newLog.purchaserName.trim() || 'Direct Customer',
      headCount: head,
      totalLiveWeightLbs: live,
      totalDressedWeightLbs: dressed,
      avgLiveWeightLbs: (live / head).toFixed(2),
      avgDressedWeightLbs: (dressed / head).toFixed(2),
      dressingPercentage: yieldPct.toFixed(1),
      checklistCompleted: newLog.checklist,
      notes: newLog.notes.trim()
    };

    saveLogs([logObj, ...processingLogs]);
    setNewLog({
      lotNumber: `LOT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(10 + Math.random()*89)}`,
      litterName: '',
      processingMethod: 'on_farm_exempt',
      salesChannel: 'on_farm_direct',
      purchaserName: '',
      headCount: '8',
      totalLiveWeightLbs: '40',
      totalDressedWeightLbs: '24.8',
      notes: '',
      checklist: ['potable_water', 'sanitized_surfaces', 'rapid_chill', 'viscera_check', 'food_grade_pack']
    });

    if (showToast) showToast(`Harvest Batch ${logObj.lotNumber} recorded with compliance log!`, "success");
  };

  // Populate Label Generator from Batch
  const handleLoadBatchToLabel = (log) => {
    setLabelLotNumber(log.lotNumber);
    setLabelPackDate(log.date);
    setLabelNetWeight(`${log.avgDressedWeightLbs || '3.0'} lbs`);
    setActiveTab('labels');
    if (showToast) showToast(`Batch ${log.lotNumber} loaded into Label Designer!`, "info");
  };

  // Print Package Label
  const handlePrintLabel = () => {
    const exemptionText = labelCustomExemption || LABEL_EXEMPTION_STATEMENTS[labelExemptionKey] || '';
    
    const printWindow = window.open('', '_blank', 'width=600,height=500');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Meat_Label_${labelLotNumber}</title>
        <style>
          @page { size: 4in 3in; margin: 0.15in; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: Arial, sans-serif;
            color: #000;
            padding: 8px;
            font-size: 10px;
          }
          .label-card {
            border: 2px solid #000;
            padding: 8px;
            height: 2.7in;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .header {
            text-align: center;
            border-bottom: 1.5px solid #000;
            padding-bottom: 4px;
          }
          .producer { font-size: 13px; font-weight: 900; text-transform: uppercase; }
          .address { font-size: 8.5px; color: #333; }
          .product-title {
            font-size: 14px;
            font-weight: 900;
            text-transform: uppercase;
            text-align: center;
            margin: 4px 0;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2px 8px;
            font-size: 9px;
            border-top: 1px solid #ccc;
            border-bottom: 1px solid #ccc;
            padding: 4px 0;
            font-family: monospace;
          }
          .exemption-statement {
            font-size: 7.5px;
            font-style: italic;
            text-align: center;
            margin: 3px 0;
            line-height: 1.15;
          }
          .safe-handling {
            border: 1px dashed #000;
            padding: 3px;
            font-size: 6.5px;
            line-height: 1.1;
            background: #fafafa;
          }
          .storage-notice {
            font-weight: bold;
            text-align: center;
            font-size: 8.5px;
            margin-top: 2px;
          }
        </style>
      </head>
      <body>
        <div class="label-card">
          <div class="header">
            <div class="producer">${labelProducerName}</div>
            <div class="address">${labelAddress}</div>
          </div>

          <div class="product-title">${labelProductTitle}</div>

          <div class="details-grid">
            <div>NET WT: <strong>${labelNetWeight}</strong></div>
            <div>PACK DATE: <strong>${labelPackDate}</strong></div>
            <div style="grid-column: span 2;">LOT / BATCH #: <strong>${labelLotNumber}</strong></div>
          </div>

          <div class="exemption-statement">${exemptionText}</div>

          <div class="safe-handling">
            <strong>SAFE HANDLING:</strong> Keep refrigerated (&lt;40°F) or frozen. Cook thoroughly to 165°F internal temperature measured by a food thermometer.
          </div>

          <div class="storage-notice">KEEP REFRIGERATED OR FROZEN</div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const isProUser = currentUser?.tier === 'pro' || currentUser?.tier === 'enterprise' || currentUser?.role === 'owner' || currentUser?.isSuperAdmin;

  return (
    <div className="flex flex-col gap-6 text-slate-100 p-6 min-h-screen bg-slate-950/80 text-left">
      
      {/* PERSISTENT COMPLIANCE DISCLAIMER BANNER */}
      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-left space-y-0.5">
          <strong className="text-amber-300 block font-bold text-xs">Mandatory Educational Compliance Notice:</strong>
          <p className="text-amber-200/90 leading-relaxed text-[11px]">
            {STANDARD_COMPLIANCE_DISCLAIMER} Rabbit is not under mandatory USDA FSIS inspection, falling under FDA cGMP rules (21 CFR Part 117) and diverse state Department of Agriculture / Health codes. WarrenWise Pro provides organizational records and labeling helpers only, and does not provide legal or regulatory approval to sell meat.
          </p>
        </div>
      </div>

      {/* Header Banner */}
      <div className="glass-container p-8 border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 rounded-2xl shadow-xl shadow-emerald-500/20">
            <Beef className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Commercial Meat Rabbit Yield, Traceability & Compliance
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                WarrenWise Commercial
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Sanitary batch harvest logging, Dressing Yields, SSOP checklists, Package Labeling Helpers, and Federal / State regulatory education.
            </p>
          </div>
        </div>

        {!isProUser && (
          <button
            onClick={onUpgrade}
            className="btn-interactive px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Lock className="w-4 h-4" /> Unlock Pro Commercial Analytics
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Production Dashboard
        </button>

        <button
          onClick={() => setActiveTab('processing')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'processing'
              ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" /> Processing & Sales Logs ({processingLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('labels')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'labels'
              ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Tag className="w-4 h-4" /> Labeling Helpers & Print
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'checklist'
              ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Pre-Sale Checklist & Traceability
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'calculator'
              ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" /> Feed & Profit Calculator
        </button>

        <button
          onClick={() => setActiveTab('regulations')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'regulations'
              ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" /> USDA & State Compliance Guide
        </button>
      </div>

      {/* TAB 1: PRODUCTION DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-container p-5 border border-white/10 bg-slate-900/60 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider">Total Head Processed</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400">{metrics.totalHeadProcessed}</span>
                <span className="text-xs text-slate-400">rabbits</span>
              </div>
              <span className="text-[10px] text-emerald-300 font-semibold">Total Harvested to Date</span>
            </div>

            <div className="glass-container p-5 border border-white/10 bg-slate-900/60 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider">Total Dressed Yield</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-cyan-400">{metrics.totalDressedLbs}</span>
                <span className="text-xs text-slate-400">lbs dressed</span>
              </div>
              <span className="text-[10px] text-cyan-300 font-semibold">{metrics.totalLiveLbs} lbs live weight</span>
            </div>

            <div className="glass-container p-5 border border-white/10 bg-slate-900/60 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider">Average Dressing %</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-purple-400">{metrics.overallDressingPct}%</span>
                <span className="text-xs text-slate-400">carcass yield</span>
              </div>
              <span className="text-[10px] text-purple-300 font-semibold">Standard Fryer Target: 58%–62%</span>
            </div>

            <div className="glass-container p-5 border border-white/10 bg-slate-900/60 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider">Feed Conversion Ratio</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-400">{metrics.avgFCR}</span>
                <span className="text-xs text-slate-400">lbs feed / lb gain</span>
              </div>
              <span className="text-[10px] text-amber-300 font-semibold">Optimal Range: 3.0–3.5</span>
            </div>
          </div>

          {/* Sales Channels Breakdown */}
          <div className="glass-container p-6 border border-white/10 bg-slate-900/70 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" /> Sales Distribution by Channel
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(SALES_CHANNELS).map(([key, ch]) => {
                const lbs = metrics.channelCounts[ch.id] || 0;
                return (
                  <div key={key} className="p-4 bg-slate-950 border border-white/5 rounded-2xl space-y-1">
                    <span className="text-xs font-bold text-white block">{ch.label}</span>
                    <span className="text-xl font-black text-emerald-400">{lbs.toFixed(1)} lbs</span>
                    <span className="text-[10px] text-slate-400 block">
                      {ch.interstateRisk ? '⚠️ Subject to federal interstate rules' : 'Intrastate state rules apply'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROCESSING & SALES LOGS */}
      {activeTab === 'processing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Add Log Form */}
          <div className="lg:col-span-5 glass-container p-6 border border-white/10 bg-slate-900/80 rounded-3xl flex flex-col gap-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" /> Log Harvest & Processing Lot
            </h3>

            <form onSubmit={handleAddLogSubmit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Lot / Batch Number *</label>
                <input
                  type="text"
                  required
                  value={newLog.lotNumber}
                  onChange={(e) => setNewLog(prev => ({ ...prev, lotNumber: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Batch / Litter Description</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. NZW Litter 2026-A"
                  value={newLog.litterName}
                  onChange={(e) => setNewLog(prev => ({ ...prev, litterName: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              {/* Processing Method */}
              <div>
                <label className="text-slate-400 font-bold block mb-1">Processing Method *</label>
                <select
                  value={newLog.processingMethod}
                  onChange={(e) => setNewLog(prev => ({ ...prev, processingMethod: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                >
                  {Object.values(PROCESSING_METHODS).map(pm => (
                    <option key={pm.id} value={pm.id}>{pm.label}</option>
                  ))}
                </select>
              </div>

              {/* Sales Destination */}
              <div>
                <label className="text-slate-400 font-bold block mb-1">Destination / Sales Channel *</label>
                <select
                  value={newLog.salesChannel}
                  onChange={(e) => setNewLog(prev => ({ ...prev, salesChannel: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                >
                  {Object.values(SALES_CHANNELS).map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.label}</option>
                  ))}
                </select>
              </div>

              {/* Interstate Warning Banner */}
              {newLog.salesChannel === 'interstate' && (
                <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Interstate Sales Scrutiny</span>
                  </div>
                  <p className="text-[10px] text-red-200/90 leading-tight">
                    Shipping uninspected rabbit meat across state lines triggers federal FDA FD&C Act oversight and receiving state importation bans. Ensure compliance with voluntary USDA 9 CFR 354 or state agricultural approval.
                  </p>
                </div>
              )}

              <div>
                <label className="text-slate-400 font-bold block mb-1">Purchaser / Customer Reference</label>
                <input
                  type="text"
                  placeholder="Customer name, restaurant account, or stand"
                  value={newLog.purchaserName}
                  onChange={(e) => setNewLog(prev => ({ ...prev, purchaserName: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Head Count *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newLog.headCount}
                    onChange={(e) => setNewLog(prev => ({ ...prev, headCount: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Live Wt (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newLog.totalLiveWeightLbs}
                    onChange={(e) => setNewLog(prev => ({ ...prev, totalLiveWeightLbs: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Dressed Wt (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newLog.totalDressedWeightLbs}
                    onChange={(e) => setNewLog(prev => ({ ...prev, totalDressedWeightLbs: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Sanitation Checklist */}
              <div className="p-3 bg-slate-950 border border-white/10 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-slate-300 block mb-1 uppercase tracking-wider">
                  SSOP Sanitation & Inspection Sign-Off:
                </span>
                {SANITATION_CHECKLIST_ITEMS.map(item => (
                  <label key={item.id} className="flex items-center gap-2 text-[10.5px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newLog.checklist.includes(item.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setNewLog(prev => ({
                          ...prev,
                          checklist: checked ? [...prev.checklist, item.id] : prev.checklist.filter(i => i !== item.id)
                        }));
                      }}
                      className="accent-emerald-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Processing Notes</label>
                <textarea
                  rows="2"
                  placeholder="Carcass quality, chilling verification..."
                  value={newLog.notes}
                  onChange={(e) => setNewLog(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border-none shadow-lg shadow-emerald-500/20"
              >
                <CheckSquare className="w-4 h-4" /> Save Harvest Log Entry
              </button>
            </form>
          </div>

          {/* Log History Table */}
          <div className="lg:col-span-7 glass-container p-6 border border-white/10 bg-slate-900/80 rounded-3xl flex flex-col gap-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" /> Historical Harvest & Yield Log ({processingLogs.length})
            </h3>

            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {processingLogs.map(log => (
                <div key={log.id} className="p-4 bg-slate-950 border border-white/10 rounded-2xl flex flex-col gap-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="font-mono text-xs font-black text-emerald-400">{log.lotNumber}</span>
                      <strong className="text-white text-xs block font-bold">{log.litterName}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{log.date}</span>
                      <button
                        type="button"
                        onClick={() => handleLoadBatchToLabel(log)}
                        className="btn-interactive text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1 px-2 rounded-lg border-none flex items-center gap-1 cursor-pointer"
                      >
                        <Tag className="w-3 h-3" /> Create Label
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                    <div>Head: <strong className="text-white font-bold">{log.headCount}</strong></div>
                    <div>Dressed: <strong className="text-cyan-400 font-bold">{log.totalDressedWeightLbs} lbs</strong></div>
                    <div>Avg Dressed: <strong className="text-white font-bold">{log.avgDressedWeightLbs} lbs</strong></div>
                    <div>Yield: <strong className="text-purple-400 font-bold">{log.dressingPercentage}%</strong></div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">
                      Method: {PROCESSING_METHODS[log.processingMethod.toUpperCase()]?.label || log.processingMethod}
                    </span>
                    <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-bold">
                      Channel: {SALES_CHANNELS[log.salesChannel.toUpperCase()]?.label || log.salesChannel}
                    </span>
                    {log.purchaserName && (
                      <span className="text-slate-400">Purchaser: {log.purchaserName}</span>
                    )}
                  </div>

                  {log.notes && (
                    <p className="text-[11px] text-slate-300 italic bg-black/20 p-2 rounded-lg">{log.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: LABELING HELPERS & PRINT */}
      {activeTab === 'labels' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Label Customizer */}
          <div className="lg:col-span-6 glass-container p-6 border border-white/10 bg-slate-900/80 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" /> Package Label Customizer
            </h3>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Farm / Producer Name *</label>
                <input
                  type="text"
                  value={labelProducerName}
                  onChange={(e) => setLabelProducerName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Physical Farm Address (City, State, Zip) *</label>
                <input
                  type="text"
                  value={labelAddress}
                  onChange={(e) => setLabelAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Product Title</label>
                  <input
                    type="text"
                    value={labelProductTitle}
                    onChange={(e) => setLabelProductTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Net Weight *</label>
                  <input
                    type="text"
                    value={labelNetWeight}
                    onChange={(e) => setLabelNetWeight(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Lot / Batch #</label>
                  <input
                    type="text"
                    value={labelLotNumber}
                    onChange={(e) => setLabelLotNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Pack Date</label>
                  <input
                    type="date"
                    value={labelPackDate}
                    onChange={(e) => setLabelPackDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Required Exemption Statement</label>
                <select
                  value={labelExemptionKey}
                  onChange={(e) => {
                    setLabelExemptionKey(e.target.value);
                    setLabelCustomExemption('');
                  }}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="ON_FARM_EXEMPT">On-Farm Producer Exemption</option>
                  <option value="CUSTOM_NOT_FOR_SALE">Custom Processed — NOT FOR SALE</option>
                  <option value="STATE_INSPECTED">State Department of Agriculture Inspected</option>
                  <option value="USDA_VOLUNTARY">USDA FSIS Voluntary Inspected (9 CFR 354)</option>
                  <option value="CUSTOM">Custom State Exemption Statement...</option>
                </select>
              </div>

              {labelExemptionKey === 'CUSTOM' && (
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Custom State Regulatory Text</label>
                  <textarea
                    rows="2"
                    placeholder="Enter state-mandated disclaimer wording..."
                    value={labelCustomExemption}
                    onChange={(e) => setLabelCustomExemption(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Live Label Preview & Print Action */}
          <div className="lg:col-span-6 glass-container p-6 border border-white/10 bg-slate-900/80 rounded-3xl flex flex-col justify-between gap-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Printer className="w-4 h-4 text-cyan-400" /> Package Label Preview (4" x 3")
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Standard Thermal / Avery Sticker</span>
              </div>

              {/* Rendered Label Box */}
              <div className="bg-white text-slate-950 p-6 rounded-2xl border-4 border-slate-800 shadow-2xl space-y-3 font-sans max-w-md mx-auto">
                <div className="text-center border-b-2 border-black pb-2">
                  <h4 className="font-black text-base uppercase tracking-tight">{labelProducerName}</h4>
                  <p className="text-[11px] text-slate-700 font-medium">{labelAddress}</p>
                </div>

                <div className="text-center py-1">
                  <h3 className="font-black text-lg uppercase tracking-wider text-slate-900">{labelProductTitle}</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-300 py-2 text-xs font-mono">
                  <div>NET WT: <strong className="text-black font-black">{labelNetWeight}</strong></div>
                  <div>PACKED: <strong className="text-black font-black">{labelPackDate}</strong></div>
                  <div className="col-span-2">LOT: <strong className="text-black font-black">{labelLotNumber}</strong></div>
                </div>

                <p className="text-[9.5px] italic text-center text-slate-700 leading-tight">
                  {labelCustomExemption || LABEL_EXEMPTION_STATEMENTS[labelExemptionKey]}
                </p>

                <div className="p-2 border border-dashed border-slate-900 bg-slate-50 text-[8px] leading-tight text-slate-800 rounded">
                  <strong>SAFE HANDLING:</strong> Keep refrigerated (&lt;40°F) or frozen. Cook thoroughly to an internal temperature of 165°F.
                </div>

                <div className="text-center text-[10px] font-black tracking-wider pt-1">
                  KEEP REFRIGERATED OR FROZEN
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePrintLabel}
                className="btn-interactive flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border-none shadow-lg shadow-emerald-500/20"
              >
                <Printer className="w-4 h-4" /> Print 4" x 3" Package Label
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: PRE-SALE CHECKLIST & TRACEABILITY */}
      {activeTab === 'checklist' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Pre-Sale Checklist */}
          <div className="lg:col-span-6 glass-container p-6 border border-white/10 bg-slate-900/80 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" /> Pre-Sale Commercial Dispatch Checklist
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify critical food-safety and regulatory items before releasing dressed meat to consumers, markets, or restaurants.
            </p>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3 bg-slate-950 border border-white/5 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={preSaleChecks.sanitation}
                  onChange={(e) => setPreSaleChecks(prev => ({ ...prev, sanitation: e.target.checked }))}
                  className="accent-emerald-500 mt-1"
                />
                <div className="text-xs">
                  <strong className="text-white block font-bold">1. Sanitation & Inspection Sign-Off</strong>
                  <span className="text-slate-400 text-[11px]">Clean tools, potable water, and organ viscera inspection completed and logged.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-950 border border-white/5 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={preSaleChecks.chilled}
                  onChange={(e) => setPreSaleChecks(prev => ({ ...prev, chilled: e.target.checked }))}
                  className="accent-emerald-500 mt-1"
                />
                <div className="text-xs">
                  <strong className="text-white block font-bold">2. Cold-Chain Integrity Verified</strong>
                  <span className="text-slate-400 text-[11px]">Carcasses chilled to &lt;40°F within 4 hours and maintained in refrigerated/frozen state.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-950 border border-white/5 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={preSaleChecks.scale}
                  onChange={(e) => setPreSaleChecks(prev => ({ ...prev, scale: e.target.checked }))}
                  className="accent-emerald-500 mt-1"
                />
                <div className="text-xs">
                  <strong className="text-white block font-bold">3. Legal Net Weight Weighed</strong>
                  <span className="text-slate-400 text-[11px]">Weighed using a certified commercial scale approved by state Weights & Measures.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-950 border border-white/5 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={preSaleChecks.labeled}
                  onChange={(e) => setPreSaleChecks(prev => ({ ...prev, labeled: e.target.checked }))}
                  className="accent-emerald-500 mt-1"
                />
                <div className="text-xs">
                  <strong className="text-white block font-bold">4. Package Labeling Affixed</strong>
                  <span className="text-slate-400 text-[11px]">Producer contact, pack date, lot number, safe handling, and exemption notice attached.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-950 border border-white/5 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={preSaleChecks.stateLimit}
                  onChange={(e) => setPreSaleChecks(prev => ({ ...prev, stateLimit: e.target.checked }))}
                  className="accent-emerald-500 mt-1"
                />
                <div className="text-xs">
                  <strong className="text-white block font-bold">5. Annual Producer Exemption Head Count Cap</strong>
                  <span className="text-slate-400 text-[11px]">Ensure total annual harvest is within state producer exemption caps (typically 1,000–20,000 head/yr).</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-950 border border-white/5 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={preSaleChecks.interstateVerified}
                  onChange={(e) => setPreSaleChecks(prev => ({ ...prev, interstateVerified: e.target.checked }))}
                  className="accent-emerald-500 mt-1"
                />
                <div className="text-xs">
                  <strong className="text-white block font-bold">6. Intrastate Sales Boundary Confirmed</strong>
                  <span className="text-slate-400 text-[11px]">Sale remains within state lines unless voluntary USDA inspection (9 CFR 354) is held.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Lot Traceability Search */}
          <div className="lg:col-span-6 glass-container p-6 border border-white/10 bg-slate-900/80 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" /> Lot Traceability & Recall Audit Lookup
            </h3>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search Lot Number, customer, or litter name..."
                value={traceQuery}
                onChange={(e) => setTraceQuery(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white"
              />
            </div>

            <div className="space-y-3 pt-2">
              {processingLogs
                .filter(l => {
                  const q = traceQuery.toLowerCase().trim();
                  if (!q) return true;
                  return (l.lotNumber || '').toLowerCase().includes(q) ||
                         (l.purchaserName || '').toLowerCase().includes(q) ||
                         (l.litterName || '').toLowerCase().includes(q);
                })
                .map(log => (
                  <div key={log.id} className="p-4 bg-slate-950 border border-white/5 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-black text-emerald-400">{log.lotNumber}</span>
                      <span className="text-[10px] text-slate-400">{log.date}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                      <div>Head: <strong className="text-white">{log.headCount}</strong></div>
                      <div>Dressed: <strong className="text-cyan-400">{log.totalDressedWeightLbs} lbs</strong></div>
                      <div>Destination: <strong className="text-white">{log.purchaserName || log.salesChannel}</strong></div>
                    </div>
                    <div className="text-[10px] text-slate-400 bg-slate-900 p-2 rounded-xl">
                      SSOP Checks: {log.checklistCompleted?.length || 5} of 6 sanitation items verified.
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: FEED & PROFIT CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 glass-container p-6 border border-white/10 bg-slate-900/80 rounded-3xl flex flex-col gap-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" /> Commercial Profitability Inputs
            </h3>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Commercial Feed Cost ($/lb)</label>
                <input
                  type="number"
                  step="0.01"
                  value={calcFeedCostPerLb}
                  onChange={(e) => setCalcFeedCostPerLb(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Average Litter Size (Kits Weaned)</label>
                <input
                  type="number"
                  value={calcLitterSize}
                  onChange={(e) => setCalcLitterSize(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Feed Consumed per Kit to 5 lbs (lbs)</label>
                <input
                  type="number"
                  value={calcFeedConsumedPerKitLbs}
                  onChange={(e) => setCalcFeedConsumedPerKitLbs(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Market Dressed Sale Price ($/lb)</label>
                <input
                  type="number"
                  step="0.25"
                  value={calcSalePricePerLbDressed}
                  onChange={(e) => setCalcSalePricePerLbDressed(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 glass-container p-6 border-2 border-emerald-500/30 bg-slate-900/90 rounded-3xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-emerald-400" /> Projected Financial Profit Breakdown
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-950 border border-white/10 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Feed Cost / Litter</span>
                  <strong className="text-2xl font-black text-red-400">${calcResults.totalFeedCostPerLitter}</strong>
                </div>

                <div className="p-4 bg-slate-950 border border-white/10 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Dressed Yield / Litter</span>
                  <strong className="text-2xl font-black text-cyan-400">{calcResults.totalDressedLbsPerLitter} lbs</strong>
                </div>

                <div className="p-4 bg-slate-950 border border-white/10 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Gross Market Revenue</span>
                  <strong className="text-2xl font-black text-emerald-400">${calcResults.grossRevenuePerLitter}</strong>
                </div>

                <div className="p-4 bg-slate-950 border border-white/10 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Net Profit / Litter</span>
                  <strong className="text-2xl font-black text-amber-400">${calcResults.netProfitPerLitter}</strong>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Projected Profit Margin</span>
                  <span className="text-[10px] text-slate-400">Based on ${calcSalePricePerLbDressed}/lb dressed market rate</span>
                </div>
                <span className="text-3xl font-black text-emerald-400">{calcResults.profitMarginPct}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: USDA & STATE REGULATIONS GUIDE */}
      {activeTab === 'regulations' && (
        <div className="glass-container p-8 border border-white/10 bg-slate-900/80 rounded-3xl space-y-6">
          <div className="p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">USDA & State Regulatory Education Guide</h4>
              <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                {EXTENDED_LEGAL_DISCLAIMER}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
            <div className="p-5 bg-slate-950 border border-white/5 rounded-2xl space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 1. Non-Amenable Species Status
              </h4>
              <p>
                Under federal law, domestic rabbits are categorized as a <strong>"non-amenable species"</strong>. This means they are exempt from the mandatory inspection provisions of the Federal Meat Inspection Act (FMIA) and Poultry Products Inspection Act (PPIA).
              </p>
              <p>
                Consequently, the USDA Food Safety and Inspection Service (FSIS) does not provide free mandatory inspection for rabbits. Instead, non-inspected rabbit meat falls under the jurisdiction of the <strong>U.S. Food and Drug Administration (FDA)</strong> under the Federal Food, Drug, and Cosmetic Act.
              </p>
            </div>

            <div className="p-5 bg-slate-950 border border-white/5 rounded-2xl space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> 2. Voluntary USDA Inspection (9 CFR Part 354)
              </h4>
              <p>
                Producers desiring federal inspection may request <strong>Voluntary Inspection</strong> under 9 CFR Part 354. This fee-for-service inspection is performed by USDA FSIS inspectors on an hourly fee basis.
              </p>
              <p>
                Carcasses receiving voluntary USDA inspection receive the circular <em>"Inspected for Wholesomeness by U.S. Department of Agriculture"</em> mark, enabling unrestricted nationwide interstate commerce and wholesale distribution.
              </p>
            </div>

            <div className="p-5 bg-slate-950 border border-white/5 rounded-2xl space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> 3. FDA Jurisdiction & Sanitation (21 CFR Part 117)
              </h4>
              <p>
                All non-USDA-inspected rabbit meat processed for commercial sale is considered food subject to FDA Current Good Manufacturing Practices (cGMPs).
              </p>
              <p>
                Facilities must operate under sanitary conditions (SSOPs), utilize clean potable water, enforce rapid chilling to under 40°F, and package meat cleanly to avoid adulteration under 21 U.S.C. 342.
              </p>
            </div>

            <div className="p-5 bg-slate-950 border border-white/5 rounded-2xl space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> 4. State Departments of Agriculture Laws
              </h4>
              <p>
                State laws govern small-scale on-farm slaughter and local sales. State frameworks generally fall into three categories:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li><strong>Poultry Exemption Analogy:</strong> Many states (e.g. Missouri, Ohio) adopt small-producer exemptions (often up to 1,000 or 20,000 head/year) for on-farm or farmers market sales.</li>
                <li><strong>State-Inspected Facilities:</strong> Some states require slaughter in a state-licensed meat plant for restaurant and grocery sales.</li>
                <li><strong>Custom Exempt:</strong> Animals processed for personal/household use labeled <em>"NOT FOR SALE"</em>.</li>
              </ul>
            </div>
          </div>

          {/* Official External Resource Links */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h4 className="font-bold text-white text-sm">Official Government References & Statutory Links:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {OFFICIAL_REGULATORY_REFERENCES.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-slate-950 border border-white/10 hover:border-emerald-500/50 rounded-2xl transition-all block group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase text-emerald-400 font-mono">{ref.authority}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                  </div>
                  <h5 className="font-bold text-white text-xs leading-snug">{ref.title}</h5>
                  <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed">{ref.summary}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
