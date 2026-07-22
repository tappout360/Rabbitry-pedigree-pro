// VoiceEngine.js — Web Speech Recognition & Voice Command Parser for WarrenWise Pro
// Designed for hands-free, barn-friendly dictation and instant app navigation.

export class VoiceEngine {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    this.synth = window.speechSynthesis || null;
    this.isListening = false;
    this.onResultCallback = null;
    this.onCommandCallback = null;
    this.onStateChangeCallback = null;

    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStateChangeCallback) this.onStateChangeCallback(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        this.isListening = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        
        if (this.onResultCallback) {
          this.onResultCallback(text, !!finalTranscript);
        }

        if (finalTranscript) {
          this.parseCommand(finalTranscript);
        }
      };
    }
  }

  isSupported() {
    return !!this.recognition;
  }

  start(onResult, onCommand, onStateChange) {
    this.onResultCallback = onResult;
    this.onCommandCallback = onCommand;
    this.onStateChangeCallback = onStateChange;

    if (!this.recognition) {
      if (this.onResultCallback) {
        this.onResultCallback("Speech recognition is not supported in this browser.", true);
      }
      return;
    }

    try {
      this.recognition.start();
    } catch (err) {
      console.warn("Speech recognition start failed:", err);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  speak(text) {
    if (!this.synth) return;
    try {
      this.synth.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1; // Friendly mascot pitch
      this.synth.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis error:", err);
    }
  }

  // Local Offline Barn Command Parser
  parseCommand(transcript) {
    const text = transcript.toLowerCase().trim();

    // 1. Log weight command (e.g. "log weight 5.2 pounds" or "weight 65 ounces")
    const weightMatch = text.match(/(?:log\s+weight|weight)\s+([0-[#0-9.]+)\s*(pounds|lbs|ounces|oz)?/);
    if (weightMatch) {
      const val = parseFloat(weightMatch[1]);
      const unit = weightMatch[2] || 'oz';
      const weightOz = (unit === 'pounds' || unit === 'lbs') ? val * 16 : val;
      if (this.onCommandCallback) {
        this.onCommandCallback({
          action: 'LOG_WEIGHT',
          value: weightOz,
          originalText: transcript
        });
      }
      return;
    }

    // 2. Kindling / Litter logging command (e.g. "log kindling 6 kits" or "litter size 7")
    const kindlingMatch = text.match(/(?:log\s+kindling|kindle|litter\s+size)\s*([0-9]+)?/);
    if (kindlingMatch) {
      const count = parseInt(kindlingMatch[1] || '6', 10);
      if (this.onCommandCallback) {
        this.onCommandCallback({
          action: 'LOG_KINDLING',
          kitCount: count,
          originalText: transcript
        });
      }
      return;
    }

    // 3. Add rabbit command
    if (text.includes('add new rabbit') || text.includes('add rabbit') || text.includes('create rabbit')) {
      if (this.onCommandCallback) {
        this.onCommandCallback({ action: 'ADD_RABBIT', originalText: transcript });
      }
      return;
    }

    // 4. Breed command
    if (text.includes('breed') || text.includes('schedule breeding') || text.includes('kindle date')) {
      if (this.onCommandCallback) {
        this.onCommandCallback({ action: 'OPEN_BREEDING', originalText: transcript });
      }
      return;
    }

    // 5. Start 4-H Quiz or Open 4-H Coach
    if (text.includes('4-h coach') || text.includes('quiz') || text.includes('showmanship') || text.includes('coach')) {
      if (this.onCommandCallback) {
        this.onCommandCallback({ action: 'OPEN_COACH', originalText: transcript });
      }
      return;
    }

    // 6. Navigation Commands
    if (text.includes('marketplace') || text.includes('browse sales') || text.includes('market')) {
      if (this.onCommandCallback) {
        this.onCommandCallback({ action: 'NAVIGATE', tab: 'marketplace', originalText: transcript });
      }
      return;
    }

    if (text.includes('terms') || text.includes('rules') || text.includes('policies')) {
      if (this.onCommandCallback) {
        this.onCommandCallback({ action: 'OPEN_TERMS', originalText: transcript });
      }
      return;
    }

    if (text.includes('sync') || text.includes('conflict') || text.includes('resolve')) {
      if (this.onCommandCallback) {
        this.onCommandCallback({ action: 'OPEN_SYNC', originalText: transcript });
      }
      return;
    }

    if (text.includes('pedigree') || text.includes('lineage')) {
      if (this.onCommandCallback) {
        this.onCommandCallback({ action: 'NAVIGATE', tab: 'pedigree', originalText: transcript });
      }
      return;
    }

    if (text.includes('gallery') || text.includes('photos')) {
      if (this.onCommandCallback) {
        this.onCommandCallback({ action: 'NAVIGATE', tab: 'media', originalText: transcript });
      }
      return;
    }

    if (text.includes('ledger') || text.includes('financial') || text.includes('finances')) {
      if (this.onCommandCallback) {
        this.onCommandCallback({ action: 'NAVIGATE', tab: 'ledger', originalText: transcript });
      }
      return;
    }

    // Default dictation fallback
    if (this.onCommandCallback) {
      this.onCommandCallback({ action: 'DICTATION', text: transcript });
    }
  }
}

export const globalVoiceEngine = new VoiceEngine();
