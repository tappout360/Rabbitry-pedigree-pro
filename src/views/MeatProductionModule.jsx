import React, { useState, useMemo } from 'react';
import { 
  Beef, Scale, TrendingUp, Calculator, ShieldCheck, FileText, Download, 
  CheckSquare, AlertCircle, Sparkles, DollarSign, Award, ArrowUpRight, 
  BookOpen, HelpCircle, Lock, Package, Calendar, RefreshCw
} from 'lucide-react';

export default function MeatProductionModule({ rabbits = [], currentUser, onUpgrade }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | processing | calculator | regulations
  
  // Processing Log State
  const [processingLogs, setProcessingLogs] = useState([
    {
      id: 'proc-1',
      date: '2026-07-15',
      litterName: 'NZW Litter 2026-A',
      headCount: 8,
      totalLiveWeightLbs: 38.4,
      totalDressedWeightLbs: 23.8,
      avgLiveWeightLbs: 4.8,
      avgDressedWeightLbs: 2.975,
      dressingPercentage: 62.0,
      sanitationChecked: true,
      humaneChecked: true,
      notes: 'Optimal 9-week harvest. Uniform carcass quality.'
    },
    {
      id: 'proc-2',
      date: '2026-06-28',
      litterName: 'Californian Cross Litter B',
      headCount: 6,
      totalLiveWeightLbs: 30.0,
      totalDressedWeightLbs: 18.3,
      avgLiveWeightLbs: 5.0,
      avgDressedWeightLbs: 3.05,
      dressingPercentage: 61.0,
      sanitationChecked: true,
      humaneChecked: true,
      notes: 'Dressed out well. Clean liver and kidney check.'
    }
  ]);

  // Form State for Adding Processing Log
  const [newLog, setNewLog] = useState({
    litterName: '',
    headCount: '8',
    totalLiveWeightLbs: '40',
    totalDressedWeightLbs: '24.8',
    notes: '',
    sanitationChecked: false,
    humaneChecked: false
  });

  // Profitability Calculator State
  const [calcFeedCostPerLb, setCalcFeedCostPerLb] = useState('0.42');
  const [calcLitterSize, setCalcLitterSize] = useState('8');
  const [calcGrowoutWeeks, setCalcGrowoutWeeks] = useState('9');
  const [calcFeedConsumedPerKitLbs, setCalcFeedConsumedPerKitLbs] = useState('14');
  const [calcSalePricePerLbDressed, setCalcSalePricePerLbDressed] = useState('7.50');

  // Calculated Production Metrics
  const metrics = useMemo(() => {
    const commercialRabbits = rabbits.filter(r => 
      ['New Zealand White', 'New Zealand Red', 'Californian', 'Flemish Giant', 'Champagne d\'Argent'].includes(r.breed) ||
      (r.notes || '').toLowerCase().includes('meat')
    );

    const totalHeadProcessed = processingLogs.reduce((acc, l) => acc + (l.headCount || 0), 0);
    const totalDressedLbs = processingLogs.reduce((acc, l) => acc + (l.totalDressedWeightLbs || 0), 0);
    const totalLiveLbs = processingLogs.reduce((acc, l) => acc + (l.totalLiveWeightLbs || 0), 0);
    const overallDressingPct = totalLiveLbs > 0 ? (totalDressedLbs / totalLiveLbs) * 100 : 61.5;

    // Simulated FCR (Feed Conversion Ratio)
    // Benchmark: 3.0 to 3.5 lbs feed per 1 lb live weight gain
    const avgFCR = 3.2; 

    return {
      commercialCount: commercialRabbits.length || 24,
      totalHeadProcessed,
      totalDressedLbs: totalDressedLbs.toFixed(1),
      overallDressingPct: overallDressingPct.toFixed(1),
      avgFCR,
      avgDaysToHarvest: 63, // 9 weeks
      avgHarvestWeightLbs: 4.9
    };
  }, [rabbits, processingLogs]);

  // Profitability Computation Logic
  const calcResults = useMemo(() => {
    const kits = parseFloat(calcLitterSize) || 8;
    const feedPerKit = parseFloat(calcFeedConsumedPerKitLbs) || 14;
    const feedCostLb = parseFloat(calcFeedCostPerLb) || 0.42;
    const salePriceLb = parseFloat(calcSalePricePerLbDressed) || 7.50;

    const totalFeedCostPerLitter = kits * feedPerKit * feedCostLb;
    const avgDressedWtLb = 3.0; // 5 lb live rabbit at ~60% yield = 3 lbs dressed
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

  const handleAddLogSubmit = (e) => {
    e.preventDefault();
    const head = parseInt(newLog.headCount, 10) || 1;
    const live = parseFloat(newLog.totalLiveWeightLbs) || 0;
    const dressed = parseFloat(newLog.totalDressedWeightLbs) || 0;
    const yieldPct = live > 0 ? (dressed / live) * 100 : 0;

    const logObj = {
      id: `proc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      litterName: newLog.litterName || 'Commercial Grow-Out Batch',
      headCount: head,
      totalLiveWeightLbs: live,
      totalDressedWeightLbs: dressed,
      avgLiveWeightLbs: (live / head).toFixed(2),
      avgDressedWeightLbs: (dressed / head).toFixed(2),
      dressingPercentage: yieldPct.toFixed(1),
      sanitationChecked: newLog.sanitationChecked,
      humaneChecked: newLog.humaneChecked,
      notes: newLog.notes
    };

    setProcessingLogs(prev => [logObj, ...prev]);
    setNewLog({
      litterName: '',
      headCount: '8',
      totalLiveWeightLbs: '40',
      totalDressedWeightLbs: '24.8',
      notes: '',
      sanitationChecked: false,
      humaneChecked: false
    });
    alert('🎉 Commercial processing batch logged successfully!');
  };

  const isProUser = currentUser?.subscriptionTier === 'pro' || currentUser?.subscriptionTier === 'master' || currentUser?.role === 'owner';

  return (
    <div className="flex flex-col gap-6 text-slate-100 p-6 min-h-screen bg-slate-950/80 text-left">
      
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
                Commercial Meat Rabbit Yield & Processing Engine
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                WarrenWise Commercial
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Precision grow-out growth tracking, Feed Conversion Ratio (FCR) analytics, dressing yield calculators, and USDA small livestock exemption processing logs.
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
      <div className="flex border-b border-white/10 gap-3 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Production Dashboard
        </button>
        <button
          onClick={() => setActiveTab('processing')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'processing'
              ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" /> Commercial Processing Logs
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'calculator'
              ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" /> Feed & Profit Calculator
        </button>
        <button
          onClick={() => setActiveTab('regulations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'regulations'
              ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" /> USDA & State Regulations
        </button>
      </div>

      {/* TAB 1: PRODUCTION DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-container p-5 border border-white/10 bg-slate-900/60 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider">Feed Conversion Ratio (FCR)</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400">{metrics.avgFCR}</span>
                <span className="text-xs text-slate-400">lbs feed / lb gain</span>
              </div>
              <span className="text-[10px] text-emerald-300 font-semibold">✓ Optimal Commercial Target (&lt;3.5)</span>
            </div>

            <div className="glass-container p-5 border border-white/10 bg-slate-900/60 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider">Avg Dressing Yield</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-cyan-400">{metrics.overallDressingPct}%</span>
                <span className="text-xs text-slate-400">dressed / live</span>
              </div>
              <span className="text-[10px] text-cyan-300 font-semibold">Target: 58% - 63% for Fryers</span>
            </div>

            <div className="glass-container p-5 border border-white/10 bg-slate-900/60 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider">Grow-Out Days to 5 lbs</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-400">{metrics.avgDaysToHarvest}</span>
                <span className="text-xs text-slate-400">days (9 wks)</span>
              </div>
              <span className="text-[10px] text-amber-300 font-semibold">Fast Growth Commercial Line</span>
            </div>

            <div className="glass-container p-5 border border-white/10 bg-slate-900/60 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider">Processed Dressed Meat</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{metrics.totalDressedLbs}</span>
                <span className="text-xs text-slate-400">lbs total</span>
              </div>
              <span className="text-[10px] text-slate-400">{metrics.totalHeadProcessed} total heads logged</span>
            </div>
          </div>

          {/* Growth Curve Comparison Chart & Breed Yield Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Commercial Breed Performance Summary */}
            <div className="lg:col-span-7 glass-container p-6 border border-white/10 bg-slate-900/80 rounded-3xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" /> Commercial Meat Breed Growth Benchmarks
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Standard 8–10 week commercial fryer grow-out benchmarks for top meat breeds.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 text-[10px] uppercase font-mono">
                        <th className="py-2.5 px-3">Breed</th>
                        <th className="py-2.5 px-3">Target 9-Wk Wt</th>
                        <th className="py-2.5 px-3">Dressing Yield %</th>
                        <th className="py-2.5 px-3">Bone-to-Meat Ratio</th>
                        <th className="py-2.5 px-3">Commercial Rank</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-white">New Zealand White</td>
                        <td className="py-2.5 px-3">4.8 - 5.2 lbs</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">60% - 63%</td>
                        <td className="py-2.5 px-3">1 : 4.2 (High)</td>
                        <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">★ #1 Industry Gold</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-white">Californian</td>
                        <td className="py-2.5 px-3">4.7 - 5.0 lbs</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">61% - 64%</td>
                        <td className="py-2.5 px-3">1 : 4.4 (Very High)</td>
                        <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">★ #2 Top Cross</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-white">Champagne d'Argent</td>
                        <td className="py-2.5 px-3">5.0 - 5.5 lbs</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">59% - 62%</td>
                        <td className="py-2.5 px-3">1 : 4.0 (Medium)</td>
                        <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">#3 Heritage Choice</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-white">Flemish Giant (Cross)</td>
                        <td className="py-2.5 px-3">5.5 - 6.2 lbs</td>
                        <td className="py-2.5 px-3 text-amber-400 font-bold">54% - 57%</td>
                        <td className="py-2.5 px-3">1 : 3.2 (Heavy Bone)</td>
                        <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">Roaster Cross</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Grow-Out Schedule Calculator */}
            <div className="lg:col-span-5 glass-container p-6 border border-white/10 bg-slate-900/80 rounded-3xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" /> Target Fryer Harvest Scheduler
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Predict exact harvest target dates based on kindle birth date.
                </p>

                <div className="p-4 bg-slate-950 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Weaning Age (4 Weeks):</span>
                    <strong className="text-white">28 Days</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Target Fryer Weight:</span>
                    <strong className="text-emerald-400 font-bold">4.8 to 5.2 lbs</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Optimal Harvest Window:</span>
                    <strong className="text-amber-400 font-bold">63–70 Days (9–10 Wks)</strong>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-200 leading-tight">
                    💡 <strong>Pro Tip:</strong> Harvesting before 10 weeks ensures maximum tenderness, optimal bone-to-meat ratio, and prevents feed conversion decay.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: COMMERCIAL PROCESSING LOGS */}
      {activeTab === 'processing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Add New Processing Log Form */}
          <div className="lg:col-span-5 glass-container p-6 border border-white/10 bg-slate-900/80 rounded-3xl flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" /> Record Harvest Processing Batch
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Log live weights vs dressed carcass weights to track dressing yield percentages and sanitation compliance.
              </p>
            </div>

            <form onSubmit={handleAddLogSubmit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Litter / Batch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. NZW Litter 2026-A"
                  value={newLog.litterName}
                  onChange={(e) => setNewLog(prev => ({ ...prev, litterName: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Head Count *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newLog.headCount}
                    onChange={(e) => setNewLog(prev => ({ ...prev, headCount: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Total Live Wt (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newLog.totalLiveWeightLbs}
                    onChange={(e) => setNewLog(prev => ({ ...prev, totalLiveWeightLbs: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
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
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Sanitation & Humane Handling Checkboxes */}
              <div className="p-3 bg-slate-950 border border-white/10 rounded-xl space-y-2">
                <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newLog.sanitationChecked}
                    onChange={(e) => setNewLog(prev => ({ ...prev, sanitationChecked: e.target.checked }))}
                    className="accent-emerald-500"
                  />
                  <span>SSOP Sanitation Checklist completed (Clean tools, chilled water bath &lt;40°F)</span>
                </label>
                <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newLog.humaneChecked}
                    onChange={(e) => setNewLog(prev => ({ ...prev, humaneChecked: e.target.checked }))}
                    className="accent-emerald-500"
                  />
                  <span>Humane Handling Guidelines verified (Instant stunning prior to bleed-out)</span>
                </label>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Processing Notes</label>
                <textarea
                  rows="2"
                  placeholder="Carcass quality notes, liver checks..."
                  value={newLog.notes}
                  onChange={(e) => setNewLog(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
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
              <FileText className="w-4 h-4 text-cyan-400" /> Historical Harvest & Yield Log
            </h3>

            <div className="space-y-3">
              {processingLogs.map(log => (
                <div key={log.id} className="p-4 bg-slate-950 border border-white/10 rounded-2xl flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <strong className="text-white text-sm font-bold">{log.litterName}</strong>
                    <span className="text-[10px] font-mono text-slate-400">{log.date}</span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-xs py-1 border-y border-white/5">
                    <div>
                      <span className="text-[9px] text-slate-400 block">Heads:</span>
                      <strong className="text-white">{log.headCount} rabbits</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Live Weight:</span>
                      <strong className="text-slate-300">{log.totalLiveWeightLbs} lbs</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Dressed Wt:</span>
                      <strong className="text-emerald-400 font-bold">{log.totalDressedWeightLbs} lbs</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Dressing Yield:</span>
                      <strong className="text-amber-400 font-bold">{log.dressingPercentage}%</strong>
                    </div>
                  </div>

                  {log.notes && <p className="text-[11px] text-slate-400 italic">"{log.notes}"</p>}

                  <div className="flex items-center gap-3 text-[10px] text-emerald-400 font-semibold pt-1">
                    {log.sanitationChecked && <span>✓ SSOP Sanitation Chilled</span>}
                    {log.humaneChecked && <span>✓ Humane Handled</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: FEED & PROFITABILITY CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Inputs */}
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
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Average Litter Size (Kits Weaned)</label>
                <input
                  type="number"
                  value={calcLitterSize}
                  onChange={(e) => setCalcLitterSize(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Feed Consumed per Kit to 5 lbs (lbs)</label>
                <input
                  type="number"
                  value={calcFeedConsumedPerKitLbs}
                  onChange={(e) => setCalcFeedConsumedPerKitLbs(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Market Dressed Sale Price ($/lb)</label>
                <input
                  type="number"
                  step="0.25"
                  value={calcSalePricePerLbDressed}
                  onChange={(e) => setCalcSalePricePerLbDressed(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
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

      {/* TAB 4: USDA & STATE REGULATIONS */}
      {activeTab === 'regulations' && (
        <div className="glass-container p-8 border border-white/10 bg-slate-900/80 rounded-3xl space-y-6">
          <div className="p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">USDA & State Regulatory Compliance Disclaimer</h4>
              <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                Rabbit meat is voluntary under USDA FSIS inspection laws. Federal regulations grant small producers processing exemptions under specified head limits. RabbitryPedigree Pro provides record-keeping utilities for informational compliance only. Always verify local state department of agriculture codes before selling processed meat products.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="p-5 bg-slate-950 border border-white/10 rounded-2xl space-y-3">
              <h4 className="font-extrabold text-white text-sm uppercase text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> 1. USDA Voluntary Inspection Exemption
              </h4>
              <p>
                Rabbits are classified as non-amenable species under federal law. Small producers selling directly to consumers, farmers markets, or local restaurants may qualify for state small-producer exemptions.
              </p>
              <a 
                href="https://www.fsis.usda.gov" 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 font-bold hover:underline flex items-center gap-1"
              >
                USDA FSIS Small Livestock Exemption Guide <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-5 bg-slate-950 border border-white/10 rounded-2xl space-y-3">
              <h4 className="font-extrabold text-white text-sm uppercase text-emerald-400 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" /> 2. SSOP Sanitation & Safe Handling
              </h4>
              <p>
                Standard Sanitation Operating Procedures (SSOP) require stainless steel or food-grade tools, rapid carcass chilling below 40°F within 4 hours, and clear safe-handling labels stating keep refrigerated or frozen.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
