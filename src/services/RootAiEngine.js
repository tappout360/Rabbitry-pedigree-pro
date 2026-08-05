// RootAiEngine.js — AI Voice Assistant & Smart Form Parser for RabbitryPedigree Pro
// Named "Root" 🥕 - your intelligent hands-free barn assistant.

export class RootAiEngine {
  constructor() {
    this.name = "Root";
    this.tagline = "Your 🥕 AI Barn Assistant";
  }

  /**
   * Parse a natural speech phrase into structured rabbitry data.
   * Example input: "Add a Holland Lop buck named Blue Thunder, tattoo RG12, born March 15 2025, weight 4 pounds 2 ounces, color Opal"
   * Returns structured object for forms or direct execution.
   */
  parseNaturalInput(text) {
    const raw = text || '';
    const lower = raw.toLowerCase().trim();

    const parsed = {
      action: 'UNKNOWN',
      name: '',
      tattooNumber: '',
      breed: '',
      variety: '',
      sex: '',
      dob: '',
      weightOz: null,
      notes: '',
      healthTreatment: '',
      cost: null,
      confidence: 0,
      originalText: raw
    };

    // 1. Detect Action Type
    if (lower.includes('add') || lower.includes('create') || lower.includes('new rabbit') || lower.includes('register')) {
      parsed.action = 'ADD_RABBIT';
    } else if (lower.includes('weight') || lower.includes('weigh') || lower.includes('lbs') || lower.includes('oz')) {
      parsed.action = 'LOG_WEIGHT';
    } else if (lower.includes('sick') || lower.includes('treatment') || lower.includes('medication') || lower.includes('vaccine') || lower.includes('deworm') || lower.includes('vet')) {
      parsed.action = 'LOG_HEALTH';
    } else if (lower.includes('breed') || lower.includes('mating') || lower.includes('kindle') || lower.includes('palpate')) {
      parsed.action = 'LOG_BREEDING';
    } else {
      parsed.action = 'GENERAL_DICTATION';
    }

    // 2. Extract Sex (buck / doe)
    if (/\b(buck|male|sire|boy)\b/i.test(raw)) {
      parsed.sex = 'buck';
    } else if (/\b(doe|female|dam|girl)\b/i.test(raw)) {
      parsed.sex = 'doe';
    }

    // 3. Extract Breed
    const commonBreeds = [
      'Holland Lop', 'Mini Rex', 'Netherland Dwarf', 'New Zealand', 'Californian', 
      'Flemish Giant', 'Rex', 'French Lop', 'Mini Lop', 'Lionhead', 'English Angora',
      'Champagne d\'Argent', 'Satin', 'Dutch', 'Polish', 'Harlequin', 'Havana'
    ];
    for (const b of commonBreeds) {
      if (new RegExp(`\\b${b}\\b`, 'i').test(raw)) {
        parsed.breed = b;
        break;
      }
    }

    // 4. Extract Name ("named Blue Thunder" or "name is Barnaby")
    const nameMatch = raw.match(/named\s+([A-Za-z0-9\s]+?)(?:,|tattoo|born|weight|color|breed|with|is|$)/i) ||
                      raw.match(/name\s+(?:is\s+)?([A-Za-z0-9\s]+?)(?:,|tattoo|born|weight|color|breed|with|is|$)/i);
    if (nameMatch) {
      parsed.name = nameMatch[1].trim();
    }

    // 5. Extract Tattoo Number ("tattoo RG12" or "tattoo number A-10")
    const tattooMatch = raw.match(/(?:tattoo|tat|tag)(?:\s+number)?\s+([A-Za-z0-9-]+)/i);
    if (tattooMatch) {
      parsed.tattooNumber = tattooMatch[1].toUpperCase();
    }

    // 6. Extract Weight ("4 pounds 2 ounces", "4.5 lbs", "64 oz")
    let totalOz = 0;
    const lbsOzMatch = raw.match(/([0-9.]+)\s*(?:pounds|lbs|lb)\s*(?:and\s*)?([0-9.]+)?\s*(?:ounces|oz)?/i);
    if (lbsOzMatch) {
      const lbs = parseFloat(lbsOzMatch[1]) || 0;
      const oz = parseFloat(lbsOzMatch[2]) || 0;
      totalOz = (lbs * 16) + oz;
    } else {
      const singleOzMatch = raw.match(/([0-9.]+)\s*(?:ounces|oz)/i);
      if (singleOzMatch) {
        totalOz = parseFloat(singleOzMatch[1]) || 0;
      }
    }
    if (totalOz > 0) {
      parsed.weightOz = Math.round(totalOz * 10) / 10;
    }

    // 7. Extract Variety / Color ("color Opal", "variety Broken Black")
    const colorMatch = raw.match(/(?:color|variety)\s+([A-Za-z\s]+?)(?:,|tattoo|born|weight|name|breed|$)/i);
    if (colorMatch) {
      parsed.variety = colorMatch[1].trim();
    }

    // Calculate confidence score
    let fieldsFound = 0;
    if (parsed.name) fieldsFound++;
    if (parsed.tattooNumber) fieldsFound++;
    if (parsed.breed) fieldsFound++;
    if (parsed.sex) fieldsFound++;
    if (parsed.weightOz) fieldsFound++;
    parsed.confidence = Math.min(1.0, fieldsFound / 3);

    return parsed;
  }

  /**
   * Root's friendly vocal response generator
   */
  generateResponse(actionResult) {
    if (actionResult.action === 'ADD_RABBIT') {
      const nameStr = actionResult.name ? `named ${actionResult.name}` : 'new rabbit';
      return `🥕 Got it! Form filled for ${nameStr}. Click Save when ready!`;
    }
    if (actionResult.action === 'LOG_WEIGHT') {
      return `🥕 Logged weight of ${actionResult.weightOz} oz. Nice growth!`;
    }
    if (actionResult.action === 'LOG_HEALTH') {
      return `🥕 Health record logged. Keep up the great care!`;
    }
    return `🥕 Root here! Dictation received cleanly.`;
  }
}

export const rootAiEngine = new RootAiEngine();
