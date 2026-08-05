import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, X, Check, Volume2 } from 'lucide-react';
import { globalVoiceEngine } from '../../services/VoiceEngine';
import { rootAiEngine } from '../../services/RootAiEngine';

/**
 * Root Voice Assistant Modal 🥕
 * Hands-free AI voice assistant optimized for Mobile & Desktop.
 */
export default function RootVoiceAssistantModal({ onClose, onAutoFillForm, onExecuteCommand }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Tap the mic & speak to Root 🥕');

  const startListening = () => {
    setTranscript('');
    setParsedResult(null);
    setStatusMessage('Root 🥕 is listening... Speak naturally now!');

    globalVoiceEngine.start(
      (text, isFinal) => {
        setTranscript(text);
        if (text) {
          const res = rootAiEngine.parseNaturalInput(text);
          setParsedResult(res);
        }
        if (isFinal) {
          setIsListening(false);
          setStatusMessage('Processing complete! Review parsed data below.');
          globalVoiceEngine.speak("Root parsed your input!");
        }
      },
      (command) => {
        if (command && onExecuteCommand) {
          onExecuteCommand(command);
        }
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

  const handleApplyToForm = () => {
    if (parsedResult && onAutoFillForm) {
      onAutoFillForm(parsedResult);
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in touch-manipulation">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-cyan-500/40 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto relative">
        
        {/* Mobile-Friendly Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl shrink-0">🥕</span>
            <div className="text-left">
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                Root AI Barn Assistant
              </h3>
              <p className="text-[11px] sm:text-xs text-cyan-400 font-medium">Hands-free voice recognition & auto-fill</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white border-none bg-transparent cursor-pointer touch-manipulation"
            aria-label="Close Root AI Assistant"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status indicator */}
        <div className="text-center py-1 text-xs font-bold text-slate-300">
          {statusMessage}
        </div>

        {/* Main Touch-Friendly Mic Button */}
        <div className="flex justify-center my-1 shrink-0">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xl border-4 touch-manipulation ${
              isListening
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-rose-600/50 scale-105'
                : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white border-cyan-300/40 shadow-cyan-600/30 active:scale-95'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8 sm:w-10 sm:h-10" /> : <Mic className="w-8 h-8 sm:w-10 sm:h-10" />}
            <span className="text-[10px] font-black uppercase tracking-wider">
              {isListening ? "Listening..." : "Tap to Speak"}
            </span>
          </button>
        </div>

        {/* Live Transcript Box */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-white/10 text-left min-h-[65px] shrink-0">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Speech Transcript
          </div>
          <p className="text-xs sm:text-sm font-mono text-slate-200 leading-relaxed">
            {transcript || 'Say something like: "Add a Holland Lop buck named Blue Thunder, tattoo RG12, weight 4 pounds 2 ounces, color Opal..."'}
          </p>
        </div>

        {/* Parsed Output Preview */}
        {parsedResult && (
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-cyan-500/40 text-left text-xs flex flex-col gap-2 shrink-0">
            <div className="text-xs font-black text-cyan-300 flex items-center justify-between">
              <span>🥕 Root Detected Info:</span>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">
                Confidence: {Math.round(parsedResult.confidence * 100)}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-slate-200 mt-1">
              {parsedResult.name && <div><strong>Name:</strong> {parsedResult.name}</div>}
              {parsedResult.tattooNumber && <div><strong>Tattoo:</strong> {parsedResult.tattooNumber}</div>}
              {parsedResult.breed && <div><strong>Breed:</strong> {parsedResult.breed}</div>}
              {parsedResult.sex && <div><strong>Sex:</strong> {parsedResult.sex}</div>}
              {parsedResult.variety && <div><strong>Color:</strong> {parsedResult.variety}</div>}
              {parsedResult.weightOz && <div><strong>Weight:</strong> {parsedResult.weightOz} oz</div>}
            </div>

            {onAutoFillForm && (
              <button
                type="button"
                onClick={handleApplyToForm}
                className="mt-2 btn-interactive py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl border-none flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 touch-manipulation"
              >
                <Check className="w-4 h-4" /> Auto-Fill Form Fields
              </button>
            )}
          </div>
        )}

        {/* Mobile Prompt Tips */}
        <div className="text-[11px] text-slate-400 text-left bg-white/5 p-3 rounded-xl shrink-0">
          <strong className="text-slate-200">Tips for Root 🥕 on Mobile:</strong>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-[10px]">
            <li>"Add a Mini Rex doe named Velvet, tattoo V1"</li>
            <li>"Log weight 5.4 pounds"</li>
            <li>"Breed doe Barnaby with buck Samson"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
