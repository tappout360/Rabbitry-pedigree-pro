import React, { useState } from 'react';
import { 
  Sparkles, Award, ShieldCheck, HeartPulse, CheckCircle2, 
  HelpCircle, BookOpen, AlertTriangle, X, ChevronRight, ChevronLeft, Search
} from 'lucide-react';
import { 
  AGE_DIVISIONS, 
  ARBA_SHOWMANSHIP_ROUTINE, 
  ARBA_BREED_BODY_TYPES,
  getWarrenWiseCoachAdvice 
} from '../../services/WarrenWiseCoachEngine';

export default function WarrenWiseCoachModal({ onClose, defaultDivision = 'junior' }) {
  const [selectedDivision, setSelectedDivision] = useState(defaultDivision);
  const [activeTab, setActiveTab] = useState('showmanship');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userQuery, setUserQuery] = useState('');
  const [coachResponse, setCoachResponse] = useState(null);

  const currentStep = ARBA_SHOWMANSHIP_ROUTINE[currentStepIndex];

  const handleSearchAdvice = (e) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    const advice = getWarrenWiseCoachAdvice(userQuery, selectedDivision);
    setCoachResponse(advice);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-container max-w-4xl w-full max-h-[90vh] flex flex-col border-2 border-yellow-500/40 rounded-3xl overflow-hidden shadow-2xl bg-slate-900/95 text-left">
        
        {/* MODAL HEADER WITH MASCOT */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-yellow-950/40 via-slate-900 to-amber-950/40">
          <div className="flex items-center gap-3">
            <img src="/assets/mascot.png" alt="WarrenWise Mascot" className="w-12 h-12 object-contain p-1 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/20 animate-bounce" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">WarrenWise 4-H Ultimate Coach</h3>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-yellow-400/20 text-yellow-300 rounded-full border border-yellow-400/30">
                  Show Standard Guide
                </span>
              </div>
              <p className="text-xs text-slate-350 font-medium mt-0.5">Your intelligent, accurate, & encouraging 4-H show guide</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-all text-sm font-bold border-none bg-transparent cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* AGE DIVISION SELECTOR BAR */}
        <div className="p-4 bg-slate-950/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-yellow-400 font-mono">Select 4-H Age Division:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.values(AGE_DIVISIONS).map(div => (
              <button
                key={div.id}
                onClick={() => setSelectedDivision(div.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  selectedDivision === div.id
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 border-yellow-300 shadow-md scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                }`}
              >
                {div.name}
              </button>
            ))}
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-white/10 bg-slate-900 px-6 py-2 gap-2 overflow-x-auto">
          {[
            { id: 'showmanship', icon: '🏆', label: '12-Step Showmanship Routine' },
            { id: 'bodytypes', icon: '📜', label: 'Body Types & Breed Standards' },
            { id: 'health', icon: '🩺', label: 'Faults & Disqualifications' },
            { id: 'ask', icon: '💬', label: 'Ask Coach WarrenWise' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-yellow-300 border-amber-500/40 font-black'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* MODAL MAIN BODY CONTENT */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-300">
          
          {/* TAB 1: 12-STEP SHOWMANSHIP ROUTINE */}
          {activeTab === 'showmanship' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl">
                <div>
                  <h4 className="text-sm font-black text-white">Step {currentStep.step} of 12: {currentStep.title}</h4>
                  <p className="text-xs text-yellow-200 mt-1 leading-relaxed">{currentStep.action}</p>
                </div>
                <span className="text-2xl font-black text-yellow-400 px-3 py-1 bg-yellow-400/20 rounded-xl font-mono">
                  {currentStep.step}/12
                </span>
              </div>

              {/* Tips comparison based on Division */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-white/10 rounded-2xl text-left">
                  <span className="text-[10px] font-black uppercase text-amber-400 font-mono tracking-wider block mb-1">
                    🌟 Junior & Cloverbud Tip
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">"{currentStep.juniorTip}"</p>
                </div>

                <div className="p-4 bg-slate-950 border border-indigo-500/30 rounded-2xl text-left">
                  <span className="text-[10px] font-black uppercase text-indigo-400 font-mono tracking-wider block mb-1">
                    🎓 Senior & Registrar-Level Tip
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">"{currentStep.seniorTip}"</p>
                </div>
              </div>

              {/* Key Checkpoints */}
              <div className="p-4 bg-slate-950/60 border border-white/10 rounded-2xl">
                <span className="text-xs font-bold text-white block mb-2">Checkpoints for Judge Presentation:</span>
                <div className="flex flex-wrap gap-2">
                  {currentStep.checkPoints.map((cp, idx) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {cp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center pt-2">
                <button
                  disabled={currentStepIndex === 0}
                  onClick={() => setCurrentStepIndex(prev => prev - 1)}
                  className="btn-interactive px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center gap-1 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous Step
                </button>

                <div className="flex gap-1.5">
                  {ARBA_SHOWMANSHIP_ROUTINE.map((_, idx) => (
                    <span 
                      key={idx}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${idx === currentStepIndex ? 'bg-yellow-400 scale-125' : 'bg-slate-700 hover:bg-slate-500'}`}
                    />
                  ))}
                </div>

                <button
                  disabled={currentStepIndex === ARBA_SHOWMANSHIP_ROUTINE.length - 1}
                  onClick={() => setCurrentStepIndex(prev => prev + 1)}
                  className="btn-interactive px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs rounded-xl border-none flex items-center gap-1 disabled:opacity-30 cursor-pointer"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ARBA BODY TYPES & BREEDS */}
          {activeTab === 'bodytypes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(ARBA_BREED_BODY_TYPES).map(([key, bt]) => (
                <div key={key} className="p-5 bg-slate-950 border border-white/10 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-black text-white text-sm">{bt.name}</h4>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono">
                        {bt.classType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-350 mb-3 leading-relaxed">{bt.description}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Registered Breeds:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {bt.examples.map((ex, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[11px] text-slate-300 font-semibold">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: FAULTS & DISQUALIFICATIONS */}
          {activeTab === 'health' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black text-red-300">Permanent Disqualifications (DQs)</h4>
                  <p className="text-xs text-red-200 mt-1 leading-relaxed">
                    Any rabbit exhibiting the following condition faults must be eliminated from show placement:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { fault: 'Malocclusion / Wolf Teeth', desc: 'Top & bottom front teeth fail to overlap properly.' },
                  { fault: 'Ear Mites / Crust', desc: 'Inflammatory crust inside ears (contagious condition).' },
                  { fault: 'Snuffles / Nasal Discharge', desc: 'White thick pus discharge from nostrils.' },
                  { fault: 'Wry Tail / Screw Tail', desc: 'Tail permanently twisted, kinked, or turned.' },
                  { fault: 'Wall Eye / Cataracts', desc: 'Discolored, milky, or mismatched eye pupils.' },
                  { fault: 'Missing Toenails / Off-color', desc: 'Toenails missing or non-matching toenail color.' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950 border border-white/10 rounded-xl">
                    <h5 className="font-bold text-red-400 text-xs">{item.fault}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ASK COACH WARRENWISE */}
          {activeTab === 'ask' && (
            <div className="flex flex-col gap-6">
              <form onSubmit={handleSearchAdvice} className="flex gap-2">
                <input
                  type="text"
                  value={userQuery}
                  onChange={e => setUserQuery(e.target.value)}
                  placeholder="Ask Coach WarrenWise (e.g., 'How do I check teeth?' or 'What is a 6-class breed?')..."
                  className="flex-1 bg-slate-950 border border-white/10 text-xs py-3 px-4 text-white rounded-xl focus:outline-none focus:border-yellow-400"
                />
                <button
                  type="submit"
                  className="btn-interactive px-5 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs rounded-xl border-none cursor-pointer flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" /> Ask Coach
                </button>
              </form>

              {coachResponse && (
                <div className="p-5 bg-slate-950 border border-yellow-500/30 rounded-2xl flex flex-col gap-3 text-left">
                  <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" /> {coachResponse.topic}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">{coachResponse.summary}</p>
                  
                  {coachResponse.tips && (
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                      {coachResponse.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  )}

                  <p className="text-[10px] text-slate-500 font-mono italic mt-2">
                    {coachResponse.disclaimer}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER DISCLAIMER */}
        <div className="p-4 bg-slate-950 border-t border-white/10 text-center text-[10px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>🛡️ Disclaimer: For official competition rules, consult your local registry's Standard of Perfection.</span>
          <span className="text-yellow-400 font-bold">4-H Family Safe • Neutral COPPA Gate Verified</span>
        </div>

      </div>
    </div>
  );
}
