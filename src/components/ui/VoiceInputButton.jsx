import React, { useState } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { globalVoiceEngine } from '../../services/VoiceEngine';

export default function VoiceInputButton({ onTranscript, placeholder = 'Dictate notes...' }) {
  const [isListening, setIsListening] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');

  const toggleListening = () => {
    if (isListening) {
      globalVoiceEngine.stop();
      setIsListening(false);
    } else {
      setTranscriptText('');
      globalVoiceEngine.start(
        (text, isFinal) => {
          setTranscriptText(text);
          if (isFinal && onTranscript) {
            onTranscript(text);
            setIsListening(false);
          }
        },
        (command) => {
          if (command.action === 'DICTATION' && onTranscript) {
            onTranscript(command.text);
          }
        },
        (listeningState) => {
          setIsListening(listeningState);
        }
      );
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? "Listening... Click to stop" : "Click for Barn Voice Input"}
        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 ${
          isListening 
            ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/30' 
            : 'bg-slate-900/80 hover:bg-slate-800 text-cyan-400 border-white/10'
        }`}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>

      {isListening && (
        <div className="absolute right-0 top-11 z-50 p-3 bg-slate-950 border-2 border-cyan-500/50 rounded-2xl shadow-2xl min-w-[220px] text-xs text-left">
          <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>WarrenWise Voice Listening...</span>
          </div>
          <p className="text-[11px] text-slate-300 italic font-mono bg-slate-900 p-2 rounded-lg border border-white/5">
            {transcriptText || "Speak clearly into your microphone..."}
          </p>
        </div>
      )}
    </div>
  );
}
