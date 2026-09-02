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

    // 1. ADD RABBIT: "Add new junior doe, Netherland Dwarf, black self, weight 1.8 pounds, born May 12"
    const addRabbitMatch = text.match(/(?:add|create)\s+(?:new\s+)?(junior|senior|intermediate|6\/8)?\s*(doe|buck)\s*,?\s*([^,]+)?\s*,?\s*([^,]+)?/i);
    if (addRabbitMatch && (text.includes('add') || text.includes('create')) && (text.includes('doe') || text.includes('buck'))) {
      if (this.onCommandCallback) {
        this.onCommandCallback({
          action: 'ADD_RABBIT_INTENT',
          ageClass: addRabbitMatch[1] || 'senior',
          sex: addRabbitMatch[2] === 'buck' ? 'Buck' : 'Doe',
          breed: addRabbitMatch[3] ? addRabbitMatch[3].trim() : '',
          color: addRabbitMatch[4] ? addRabbitMatch[4].trim() : '',
          originalText: transcript
        });
      }
      return;
    }

    // 2. HEALTH NOTE: "Add health note for Bella: clear eyes, good condition, no sneezing"
    const healthNoteMatch = text.match(/add health note for\s+(.*?)(?:\s+is|:)\s+(.*)/i) || text.match(/add health note for\s+(.*)/i);
    if (healthNoteMatch) {
      if (this.onCommandCallback) {
        this.onCommandCallback({
          action: 'ADD_HEALTH_NOTE',
          subject: healthNoteMatch[1].trim(),
          note: healthNoteMatch[2] ? healthNoteMatch[2].trim() : '',
          originalText: transcript
        });
      }
      return;
    }

    // 3. BREEDING: "Breed Daisy to Thunder on September 1"
    const breedMatch = text.match(/breed\s+(.*?)\s+to\s+(.*?)(?:\s+on\s+(.*))?$/i);
    if (breedMatch && !text.includes('open')) {
      if (this.onCommandCallback) {
        this.onCommandCallback({
          action: 'RECORD_BREEDING',
          doe: breedMatch[1].trim(),
          buck: breedMatch[2].trim(),
          date: breedMatch[3] ? breedMatch[3].trim() : new Date().toLocaleDateString(),
          originalText: transcript
        });
      }
      return;
    }

    // 4. KINDLING: "Record litter of 7 for Daisy, 6 alive"
    const kindlingMatch = text.match(/(?:record|log) litter of (\d+) for (.*?)(?:,?\s*(\d+)\s+alive)?/i);
    if (kindlingMatch) {
      if (this.onCommandCallback) {
        this.onCommandCallback({
          action: 'RECORD_KINDLING',
          totalKits: parseInt(kindlingMatch[1], 10),
          doe: kindlingMatch[2].trim(),
          aliveKits: kindlingMatch[3] ? parseInt(kindlingMatch[3], 10) : parseInt(kindlingMatch[1], 10),
          originalText: transcript
        });
      }
      return;
    }

    // 5. STATUS CHANGE: "Mark Snow Monarch as sold"
    const statusMatch = text.match(/mark\s+(.*?)\s+as\s+(sold|breeding stock|culled|meat|show)/i);
    if (statusMatch) {
      if (this.onCommandCallback) {
        this.onCommandCallback({
          action: 'UPDATE_STATUS',
          subject: statusMatch[1].trim(),
          newStatus: statusMatch[2].trim(),
          originalText: transcript
        });
      }
      return;
    }

    // 6. SHOW RESULT: "Add show result: Best of Breed, New Zealand..."
    const showResultMatch = text.match(/(?:add|log)\s+show result:?\s*(.*)/i);
    if (showResultMatch) {
      if (this.onCommandCallback) {
        this.onCommandCallback({
          action: 'ADD_SHOW_RESULT',
          resultText: showResultMatch[1].trim(),
          originalText: transcript
        });
      }
      return;
    }

    // 7. QUERY: "Show pedigree for Snow Monarch"
    const queryPedigreeMatch = text.match(/show pedigree for\s+(.*)/i);
    if (queryPedigreeMatch) {
      if (this.onCommandCallback) {
        this.onCommandCallback({
          action: 'QUERY_PEDIGREE',
          subject: queryPedigreeMatch[1].trim(),
          originalText: transcript
        });
      }
      return;
    }

    // 8. QUERY KNOWLEDGE: "What's the gestation period for a Mini Rex?"
    const queryKnowledgeMatch = text.match(/(what is|what's|how long|which|tell me about)\s+(.*)/i);
    if (queryKnowledgeMatch && !text.includes('log') && !text.includes('add')) {
      if (this.onCommandCallback) {
        this.onCommandCallback({
          action: 'QUERY_KNOWLEDGE',
          question: transcript,
          originalText: transcript
        });
      }
      return;
    }

    // 9. LOG WEIGHT: "log weight 5.2 pounds for Snow Monarch"
    const weightMatch = text.match(/(?:log\s+weight|weight)\s+([0-9.]+)\s*(pounds|lbs|ounces|oz)?(?: for\s+(.*))?/);
    if (weightMatch) {
      const val = parseFloat(weightMatch[1]);
      const unit = weightMatch[2] || 'oz';
      const weightOz = (unit === 'pounds' || unit === 'lbs') ? val * 16 : val;
      if (this.onCommandCallback) {
        this.onCommandCallback({
          action: 'LOG_WEIGHT',
          value: weightOz,
          subject: weightMatch[3] ? weightMatch[3].trim() : null,
          originalText: transcript
        });
      }
      return;
    }

    // Legacy basic fallbacks
    if (text.includes('marketplace') || text.includes('market')) {
      if (this.onCommandCallback) this.onCommandCallback({ action: 'NAVIGATE', tab: 'marketplace', originalText: transcript });
      return;
    }
    if (text.includes('pedigree') || text.includes('lineage')) {
      if (this.onCommandCallback) this.onCommandCallback({ action: 'NAVIGATE', tab: 'pedigree', originalText: transcript });
      return;
    }

    // Default dictation fallback
    if (this.onCommandCallback) {
      this.onCommandCallback({ action: 'DICTATION', text: transcript });
    }
  }
}

export const globalVoiceEngine = new VoiceEngine();
