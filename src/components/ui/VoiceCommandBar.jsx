import React, { useState } from 'react';
import { Mic, MicOff, Check, X, Sparkles, Volume2, HelpCircle } from 'lucide-react';
import { globalVoiceEngine } from '../../services/VoiceEngine';

export default function VoiceCommandBar({ onExecuteCommand, onOpenCoach }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [pendingCommand, setPendingCommand] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const startListening = () => {
    setPendingCommand(null);
    setTranscript('');
    globalVoiceEngine.start(
      (text, isFinal) => {
        setTranscript(text);
      },
      (cmd) => {
        setPendingCommand(cmd);
        setIsListening(false);
        globalVoiceEngine.speak(`Command detected: ${cmd.action.replace('_', ' ')}. Confirm to execute.`);
      },
      (state) => {
        setIsListening(state);
      }
    );
  };

  const stopListening = () => {
    globalVoiceEngine.stop();
    setIsListening(false);
  };

  const confirmPendingCommand = () => {
    if (pendingCommand && onExecuteCommand) {
      onExecuteCommand(pendingCommand);
      globalVoiceEngine.speak("Action confirmed!");
    }
    setPendingCommand(null);
    setTranscript('');
  };

  return (
    <div className="fixed top-20 right-6 z-40 flex flex-col items-end gap-2">
      
      {/* Main Voice Command Floating Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`btn-interactive px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 border shadow-xl transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-rose-900/40'
              : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white border-cyan-400/40 shadow-cyan-900/30'
          }`}
        >
          <img src="/assets/mascot.png" alt="WarrenWise Mascot" className="w-6 h-6 object-contain" />
          <span>{isListening ? "Listening..." : "Barn Voice Assistant"}</span>
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 rounded-xl cursor-pointer"
          title="Voice Commands Guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Voice Help Dropdown */}
      {showHelp && (
        <div className="glass-container p-4 max-w-xs w-full bg-slate-900/95 border border-cyan-500/30 rounded-2xl text-left text-xs text-slate-300 shadow-2xl">
          <h4 className="font-black text-white text-xs mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Supported Barn Commands
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li className="p-1.5 bg-white/5 rounded border border-white/5 font-mono">"Log weight 5.5 lbs"</li>
            <li className="p-1.5 bg-white/5 rounded border border-white/5 font-mono">"Add new rabbit"</li>
            <li className="p-1.5 bg-white/5 rounded border border-white/5 font-mono">"Breed doe with buck"</li>
            <li className="p-1.5 bg-white/5 rounded border border-white/5 font-mono">"Start 4-H quiz"</li>
            <li className="p-1.5 bg-white/5 rounded border border-white/5 font-mono">"Show pedigree"</li>
          </ul>
        </div>
      )}

      {/* Listening Live Transcript Box */}
      {isListening && (
        <div className="glass-container p-3 max-w-sm w-full bg-slate-950 border-2 border-cyan-500/50 rounded-2xl shadow-2xl text-left text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>WarrenWise Voice Transcript...</span>
          </div>
          <p className="text-xs text-white font-mono bg-slate-900 p-2.5 rounded-xl border border-white/10">
            {transcript || "Speak your command now..."}
          </p>
        </div>
      )}

      {/* Command Confirmation Card */}
      {pendingCommand && (
        <div className="glass-container p-4 max-w-sm w-full bg-slate-900 border-2 border-emerald-500/50 rounded-2xl shadow-2xl text-left text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono block mb-1">
            Confirm Detected Action
          </span>
          <p className="text-xs font-bold text-white mb-2">
            Action: {pendingCommand.action.replace('_', ' ')}
            {pendingCommand.value && ` (${pendingCommand.value} oz)`}
          </p>
          <p className="text-[11px] text-slate-400 italic mb-3 font-mono">"{pendingCommand.originalText || pendingCommand.text}"</p>

          <div className="flex gap-2">
            <button
              onClick={confirmPendingCommand}
              className="flex-1 btn-interactive py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl border-none flex items-center justify-center gap-1 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Confirm & Execute
            </button>
            <button
              onClick={() => { setPendingCommand(null); setTranscript(''); }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
