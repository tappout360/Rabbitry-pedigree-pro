import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { globalVoiceEngine } from '../../services/VoiceEngine';

/**
 * Global Floating Action Button for Barn Mode
 * Persistent microphone button for hands-free voice operations.
 */
export default function MicrophoneFab({ isListening, onToggle, transcript, isBarnMode }) {
  const [speechSupported, setSpeechSupported] = React.useState(true);

  React.useEffect(() => {
    setSpeechSupported(globalVoiceEngine.isSupported());
  }, []);

  if (!isBarnMode) return null;

  const isOffline = !navigator.onLine;
  const statusText = isOffline ? 'Listening (On-device / Offline)' : 'Listening (Online)';
  const offlineWarning = isOffline ? ' (Language pack required for offline STT)' : '';

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
      
      {!speechSupported && (
        <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl p-4 shadow-2xl max-w-sm w-[90vw] text-left pointer-events-auto">
          <p className="text-sm font-bold text-amber-400">Voice unavailable – use quick entry.</p>
        </div>
      )}

      {/* Real-time transcript popover */}
      {isListening && (
        <div className="bg-slate-900/95 border-2 border-indigo-500 rounded-2xl p-4 shadow-2xl max-w-sm w-[90vw] text-left animate-fade-in pointer-events-auto backdrop-blur-sm">
          <p className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-widest flex flex-col gap-1">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              {statusText}
            </span>
            {isOffline && <span className="text-[9px] text-slate-400 lowercase normal-case">{offlineWarning}</span>}
          </p>
          <p className="text-sm font-medium text-white italic">
            {transcript ? `"${transcript}"` : 'Listening for commands...'}
          </p>
        </div>
      )}

      {/* Main FAB Button */}
      <button
        type="button"
        onClick={onToggle}
        className={`pointer-events-auto flex items-center justify-center w-20 h-20 rounded-full border-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all cursor-pointer ${
          isListening
            ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-rose-600/50 scale-110'
            : 'bg-indigo-600 border-indigo-400 text-white hover:bg-indigo-500 hover:scale-105'
        }`}
        title={isListening ? "Stop Listening" : "Start Barn Assistant"}
      >
        {isListening ? (
          <MicOff className="w-10 h-10" />
        ) : (
          <Mic className="w-10 h-10" />
        )}
      </button>
    </div>
  );
}
