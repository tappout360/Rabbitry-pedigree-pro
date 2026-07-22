import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { globalVoiceEngine } from '../../services/VoiceEngine';

/**
 * Inline microphone button that sits next to any text input.
 * - Fills the adjacent input via onTranscript when dictation completes.
 * - Optionally forwards detected voice commands via onExecuteCommand.
 */
export default function VoiceInputButton({ onTranscript, onExecuteCommand, size = 'md' }) {
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
          // If a structured command is detected, forward it
          if (command.action === 'DICTATION' && onTranscript) {
            onTranscript(command.text);
          } else if (onExecuteCommand) {
            onExecuteCommand(command);
          }
          setIsListening(false);
        },
        (listeningState) => {
          setIsListening(listeningState);
        }
      );
    }
  };

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const btnPad = size === 'sm' ? 'p-1.5' : 'p-2';

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={isListening ? "Listening... Click to stop" : "Voice input (click to dictate)"}
      className={`${btnPad} rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
        isListening
          ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/30'
          : 'bg-slate-900/80 hover:bg-slate-800 text-cyan-400 border-white/10 hover:border-cyan-400/40'
      }`}
    >
      {isListening ? <MicOff className={iconSize} /> : <Mic className={iconSize} />}
    </button>
  );
}
