import React, { useState } from 'react';
import { 
  Plus, Scale, Stethoscope, Camera, Mic, X, ChevronUp, Sparkles 
} from 'lucide-react';

export default function MobileQuickActionDock({
  onAddRabbit,
  onOpenQuickWeight,
  onOpenHealthNote,
  onOpenQuickCamera,
  onToggleVoiceAssistant,
  isVoiceListening = false
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (cb) => {
    setIsOpen(false);
    if (cb) cb();
  };

  return (
    <div className="md:hidden fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2.5 select-none">
      
      {/* Expanded Speed-Dial Menu */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2 mb-1 animate-slide-up">
          
          {/* Action 1: Add Rabbit / Cavy */}
          <button
            type="button"
            onClick={() => handleAction(onAddRabbit)}
            className="flex items-center gap-2.5 py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-indigo-600/40 border border-indigo-400/30 cursor-pointer touch-target-large"
          >
            <span>Add Rabbit / Cavy</span>
            <div className="p-1.5 bg-white/20 rounded-xl">
              <Plus className="w-4 h-4 text-white" />
            </div>
          </button>

          {/* Action 2: Rapid Weight Logger */}
          <button
            type="button"
            onClick={() => handleAction(onOpenQuickWeight)}
            className="flex items-center gap-2.5 py-2 px-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-orange-600/40 border border-orange-400/30 cursor-pointer touch-target-large"
          >
            <span>Log Weight (Sequential)</span>
            <div className="p-1.5 bg-white/20 rounded-xl">
              <Scale className="w-4 h-4 text-white" />
            </div>
          </button>

          {/* Action 3: Quick Health Check */}
          <button
            type="button"
            onClick={() => handleAction(onOpenHealthNote)}
            className="flex items-center gap-2.5 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-emerald-600/40 border border-emerald-400/30 cursor-pointer touch-target-large"
          >
            <span>Add Health / Medical</span>
            <div className="p-1.5 bg-white/20 rounded-xl">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
          </button>

          {/* Action 4: Quick Camera Snap */}
          <button
            type="button"
            onClick={() => handleAction(onOpenQuickCamera)}
            className="flex items-center gap-2.5 py-2 px-3.5 bg-pink-600 hover:bg-pink-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-pink-600/40 border border-pink-400/30 cursor-pointer touch-target-large"
          >
            <span>Snap Hutch Photo</span>
            <div className="p-1.5 bg-white/20 rounded-xl">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </button>

          {/* Action 5: Barn Voice Assistant */}
          <button
            type="button"
            onClick={() => handleAction(onToggleVoiceAssistant)}
            className={`flex items-center gap-2.5 py-2 px-3.5 font-black text-xs rounded-2xl shadow-xl border cursor-pointer touch-target-large transition-all ${
              isVoiceListening
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400/30'
            }`}
          >
            <span>{isVoiceListening ? 'Listening...' : 'Barn Voice Assistant'}</span>
            <div className="p-1.5 bg-white/20 rounded-xl">
              <Mic className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      )}

      {/* Floating Speed-Dial Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick Barn Actions"
        className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-transform cursor-pointer border-none ${
          isOpen
            ? 'bg-slate-800 text-white rotate-45 scale-105'
            : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white shadow-indigo-600/40 hover:scale-105 active:scale-95'
        }`}
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
}
