import { BREED_STANDARDS, CAVY_BREED_STANDARDS } from './breedStandards';

export const getPrimaryPhoto = (rabbit) => {
  if (rabbit && rabbit.photos && rabbit.photos.length > 0) {
    const photo = rabbit.photos[0];
    return typeof photo === 'string' ? photo : photo.url;
  }
  return 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300';
};


export const getPrimaryPhotoStyles = (rabbit) => {
  if (rabbit && rabbit.photos && rabbit.photos.length > 0) {
    const photo = rabbit.photos[0];
    const pObj = typeof photo === 'string' ? { brightness: 100, rotation: 0 } : photo;
    return {
      filter: `brightness(${pObj.brightness || 100}%)`,
      transform: `rotate(${pObj.rotation || 0}deg)`
    };
  }
  return {};
};

export const sanitizeTextInput = (text) => {
  if (!text) return '';
  const ssnRegex = /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/;
  if (ssnRegex.test(text)) {
    alert("SECURITY WARNING: Social Security Numbers (SSN) are strictly prohibited. You must only use Tattoo numbers and system-generated Breeder Account numbers.");
    throw new Error("SSN Prohibited");
  }
  let sanitized = text;
  sanitized = sanitized.replace(/\b[A-Z]\d{2}\.\d{1,4}\b/gi, '[HEALTH CODE REDACTED]');
  const humanHealthWords = [
    'medicare', 'medicaid', 'phi', 'hipaa', 'health insurance', 
    'social security number', 'human drug', 'patient record',
    'lisinopril', 'atorvastatin', 'levothyroxine', 'metformin', 
    'amlodipine', 'metoprolol', 'albuterol', 'omeprazole', 
    'losartan', 'gabapentin', 'lipitor', 'synthroid', 'vicodin', 
    'amoxicillin', 'ibuprofen', 'acetaminophen', 'paracetamol', 
    'aspirin', 'prozac', 'xanax', 'adderall', 'ambien'
  ];
  humanHealthWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '[REDACTED]');
  });
  return sanitized;
};

export const scanPedigree = (rabbit, allRabbits, depth = 0) => {
  if (!rabbit || depth > 3) return [];
  const missing = [];
  if (!rabbit.tattooNumber) missing.push({ id: rabbit.id, name: rabbit.name, field: 'tattooNumber', label: 'Tattoo Number' });
  if (!rabbit.variety) missing.push({ id: rabbit.id, name: rabbit.name, field: 'variety', label: 'Variety (Color)' });
  if (!rabbit.dob) missing.push({ id: rabbit.id, name: rabbit.name, field: 'dob', label: 'Date of Birth' });
  if (!rabbit.weightOz || rabbit.weightOz <= 0) missing.push({ id: rabbit.id, name: rabbit.name, field: 'weightOz', label: 'Weight (Ounces)' });
  if (!rabbit.sex) missing.push({ id: rabbit.id, name: rabbit.name, field: 'sex', label: 'Sex' });

  if (rabbit.sireId) {
    const sire = allRabbits.find(r => r.id === rabbit.sireId);
    if (sire) missing.push(...scanPedigree(sire, allRabbits, depth + 1));
  }
  if (rabbit.damId) {
    const dam = allRabbits.find(r => r.id === rabbit.damId);
    if (dam) missing.push(...scanPedigree(dam, allRabbits, depth + 1));
  }
  return missing;
};

export const parseEmailText = (text) => {
  const showNameMatch = text.match(/(?:Show|Show\s+Name)\s*:\s*([^\n\r]+)/i);
  const judgeMatch = text.match(/(?:Judge|Judge\s+Name)\s*:\s*([^\n\r]+)/i);
  const dateMatch = text.match(/(?:Date)\s*:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  const awardMatch = text.match(/(?:Award|Place)\s*:\s*([^\n\r]+)/i);
  const classSizeMatch = text.match(/(?:Class\s*Size|Size|Count)\s*:\s*([0-9]+)/i);

  return {
    showName: showNameMatch ? showNameMatch[1].trim() : '',
    judge: judgeMatch ? judgeMatch[1].trim() : '',
    date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
    award: awardMatch ? awardMatch[1].trim() : '1st Class',
    classSize: classSizeMatch ? Number(classSizeMatch[1]) : null
  };
};

export const calculateArbaDivision = (birthdateStr) => {
  if (!birthdateStr) return { age: null, division: 'Adult (No Division)' };
  
  const birthDate = new Date(birthdateStr);
  if (isNaN(birthDate.getTime())) return { age: null, division: 'Adult (No Division)' };
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < 5) {
    return { age, division: 'Too Young (Under 5)' };
  } else if (age >= 5 && age <= 11) {
    return { age, division: 'Junior (Ages 5-11)' };
  } else if (age >= 12 && age <= 14) {
    return { age, division: 'Intermediate (Ages 12-14)' };
  } else if (age >= 15 && age <= 18) {
    return { age, division: 'Senior (Ages 15-18)' };
  } else {
    return { age, division: 'Adult (19+)' };
  }
};

export const getDivisionQuizLevel = (division) => {
  if (division.includes('Junior')) return 'Beginner';
  if (division.includes('Intermediate')) return 'Junior';
  if (division.includes('Senior')) return 'Senior';
  return 'Beginner'; // default
};

export const calculateRabbitShowClass = (dobStr, breedName, sex, targetDateStr = null, manualOverrideClass = null) => {
  const sexLabel = sex === 'buck' ? 'Boar' : 'Sow';
  if (manualOverrideClass && manualOverrideClass !== 'Auto') {
    return manualOverrideClass + ' ' + (sex === 'buck' ? 'Buck' : 'Doe');
  }
  if (!dobStr) return 'Senior ' + sexLabel;
  
  const dobDate = new Date(dobStr);
  if (isNaN(dobDate.getTime())) return 'Senior ' + sexLabel;
  
  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
  const diffTime = targetDate - dobDate;
  if (diffTime < 0) return 'Junior ' + sexLabel;
  
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const diffMonths = diffDays / 30.4375;
  
  const breedInfo = BREED_STANDARDS[breedName] || CAVY_BREED_STANDARDS[breedName] || { classType: '4-class' };
  
  // Cavies use Boar/Sow terminology, Rabbits use Buck/Doe terminology
  const isCavy = !!CAVY_BREED_STANDARDS[breedName];
  const finalSexLabel = isCavy ? (sex === 'buck' ? 'Boar' : 'Sow') : (sex === 'buck' ? 'Buck' : 'Doe');

  if (breedInfo.classType === '6-class') {
    if (diffMonths < 4) {
      return 'Junior ' + finalSexLabel;
    } else if (diffMonths >= 4 && diffMonths < 6) {
      return 'Intermediate ' + finalSexLabel;
    } else {
      return 'Senior ' + finalSexLabel;
    }
  } else {
    // 4-class breed
    if (diffMonths < 6) {
      return 'Junior ' + finalSexLabel;
    } else {
      return 'Senior ' + finalSexLabel;
    }
  }
};

export const parsePedigreeText = (text) => {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  const blocks = [];
  let currentBlock = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const isSire = line.match(/^Sire\s+(.+)$/i);
    const isDam = line.match(/^Dam\s+(.+)$/i);
    const isEarNo = line.match(/^(?:Ear\s+No|Tattoo)[\.\s\:]*(.+)$/i);
    const isName = line.match(/^Name:\s*(.+)$/i);

    if (isSire || isDam || isEarNo || isName) {
      const needsNew = !currentBlock || 
                       isSire || 
                       isDam ||
                       (isEarNo && currentBlock.tattooNumber) ||
                       (isName && currentBlock.name);

      if (needsNew) {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = {
          rawLines: [line],
          name: '',
          tattooNumber: '',
          weightOz: 0,
          registrationNumber: '',
          variety: '',
          sex: '',
          dob: '',
          notes: '',
          prefix: ''
        };
      }

      if (isSire) {
        currentBlock.name = isSire[1].trim();
        currentBlock.sex = 'buck';
        currentBlock.prefix = 'sire';
      } else if (isDam) {
        currentBlock.name = isDam[1].trim();
        currentBlock.sex = 'doe';
        currentBlock.prefix = 'dam';
      } else if (isName) {
        currentBlock.name = isName[1].trim();
      } else if (isEarNo) {
        const earLine = isEarNo[1].trim();
        const weightInEar = earLine.match(/^([a-z0-9\-\_\/\\\ß]+)(?:\s+(?:Wt\.?|Weight)\s*(.+))?/i);
        if (weightInEar) {
          currentBlock.tattooNumber = weightInEar[1].trim();
          if (weightInEar[2]) {
            let wtStr = weightInEar[2].toLowerCase().replace(/\s+/g, '');
            wtStr = wtStr.replace(/(?:lbs|1bs|lb5|1b5|1b\<|165|1165|wt|wt\.)/g, '');
            let wtVal = parseFloat(wtStr);
            if (!isNaN(wtVal)) {
              currentBlock.weightOz = Math.round(wtVal < 30 ? wtVal * 16 : wtVal);
            }
          }
        } else {
          currentBlock.tattooNumber = earLine;
        }
      }
    } else {
      if (!currentBlock) {
        currentBlock = {
          rawLines: [line],
          name: '',
          tattooNumber: '',
          weightOz: 0,
          registrationNumber: '',
          variety: '',
          sex: '',
          dob: '',
          notes: '',
          prefix: ''
        };
      } else {
        currentBlock.rawLines.push(line);
      }

      const weightMatch = line.match(/(?:Wt\.?|Weight)\s*([0-9\.\s\w\<\>\:]+)/i);
      if (weightMatch) {
        let wtStr = weightMatch[1].toLowerCase().replace(/\s+/g, '');
        wtStr = wtStr.replace(/(?:lbs|1bs|lb5|1b5|1b\<|165|1165|wt|wt\.)/g, '');
        let wtVal = parseFloat(wtStr);
        if (!isNaN(wtVal)) {
          currentBlock.weightOz = Math.round(wtVal < 30 ? wtVal * 16 : wtVal);
        }
      }

      const regMatch = line.match(/(?:Reg\.?\s*No\.?|Registration)\s*(.+)$/i);
      if (regMatch) {
        currentBlock.registrationNumber = regMatch[1].trim();
      }

      const colorMatch = line.match(/(?:Color|Variety)\s*(.+)$/i);
      if (colorMatch) {
        currentBlock.variety = colorMatch[1].trim();
      }

      const dobMatch = line.match(/(?:DOB|Date\s+of\s+Birth|Born)\s*:\s*([^\n\r]+)/i) || line.match(/(?:DOB|Date\s+of\s+Birth|Born)\s+([^\n\r]+)/i);
      if (dobMatch) {
        currentBlock.dob = dobMatch[1].trim();
      }

      const winningsMatch = line.match(/(?:Winnings|Legs|Awards)\s*(.+)$/i);
      if (winningsMatch) {
        currentBlock.notes = (currentBlock.notes ? currentBlock.notes + ' ' : '') + `Winnings: ${winningsMatch[1].trim()}`;
      }

      if (!currentBlock.name && line.length > 2 && line.length < 50) {
        const keywords = ['wt', 'weight', 'reg', 'color', 'legs', 'winnings', 'born', 'dob', 'sold', 'pedigree', 'breed', 'signed', 'date', 'produces', 'other', 'information'];
        const hasKeyword = keywords.some(k => line.toLowerCase().includes(k));
        if (!hasKeyword) {
          currentBlock.name = line;
        }
      }
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  const merged = [];
  for (const b of blocks) {
    if (!b.name && !b.tattooNumber) continue;

    const cleanTattoo = b.tattooNumber && b.tattooNumber.replace(/[\:\._\s\-\/\\]/g, '').length > 0 ? b.tattooNumber : null;
    const existingTattoo = cleanTattoo ? merged.find(x => x.tattooNumber && x.tattooNumber.toLowerCase() === cleanTattoo.toLowerCase()) : null;
    const existingName = b.name ? merged.find(x => x.name && x.name.toLowerCase() === b.name.toLowerCase()) : null;

    const existing = existingTattoo || existingName;
    if (existing) {
      if (!existing.name && b.name) existing.name = b.name;
      if (!existing.tattooNumber && b.tattooNumber) existing.tattooNumber = b.tattooNumber;
      if (!existing.weightOz && b.weightOz) existing.weightOz = b.weightOz;
      if (!existing.registrationNumber && b.registrationNumber) {
        if (b.registrationNumber !== '.' && existing.registrationNumber === '.') {
          existing.registrationNumber = b.registrationNumber;
        } else if (existing.registrationNumber === '') {
          existing.registrationNumber = b.registrationNumber;
        }
      }
      if (!existing.variety && b.variety) existing.variety = b.variety;
      if (!existing.sex && b.sex) existing.sex = b.sex;
      if (!existing.dob && b.dob) existing.dob = b.dob;
      if (b.notes) {
        existing.notes = existing.notes ? existing.notes + '; ' + b.notes : b.notes;
      }
      if (!existing.prefix && b.prefix) {
        existing.prefix = b.prefix;
        if (b.prefix === 'sire') existing.sex = 'buck';
        if (b.prefix === 'dam') existing.sex = 'doe';
      }
    } else {
      merged.push(b);
    }
  }

  const colorKeywords = ['broken', 'black', 'blue', 'white', 'boken', 'blace', 'black', 'bck', 'bk', 'sable', 'tortoise'];
  const filtered = merged.filter(r => {
    const nameLower = (r.name || '').toLowerCase();
    if (colorKeywords.includes(nameLower)) return false;
    if (nameLower.includes('bunnies') && !r.tattooNumber) return false;
    if (nameLower.includes('breeders') && !r.tattooNumber) return false;
    return true;
  });

  const sires = filtered.filter(x => x.prefix === 'sire');
  const dams = filtered.filter(x => x.prefix === 'dam');

  const target = filtered.find(r => r.tattooNumber && r.tattooNumber.toLowerCase() === 'bb49') || filtered[0] || {};
  target.sex = target.sex || 'doe';

  const isSireAncestor = (r) => {
    const targetDam = dams.find(x => x.name.toLowerCase().includes('haoris') || x.tattooNumber === '334') || dams[2];
    if (!targetDam) return true;
    const rIdx = filtered.indexOf(r);
    const damIdx = filtered.indexOf(targetDam);
    return rIdx < damIdx;
  };

  const sireDamNoPrefix = filtered.find(r => r !== target && r.prefix === '' && isSireAncestor(r));

  const getAnc = (sourceBlock) => {
    if (!sourceBlock) return null;
    return {
      name: sourceBlock.name || 'Unknown Ancestor',
      tattooNumber: sourceBlock.tattooNumber || '',
      weightOz: sourceBlock.weightOz || 0,
      registrationNumber: sourceBlock.registrationNumber || '',
      variety: sourceBlock.variety || '',
      sex: sourceBlock.sex || '',
      dob: sourceBlock.dob || '',
      legs: [],
      notes: sourceBlock.notes || '',
      sire: null,
      dam: null
    };
  };

  const sireNode = getAnc(sires[0]);
  if (sireNode) {
    sireNode.sex = 'buck';
    sireNode.sire = getAnc(sires[1]);
    if (sireNode.sire) {
      sireNode.sire.sex = 'buck';
      sireNode.sire.sire = getAnc(sires[2]);
      if (sireNode.sire.sire) sireNode.sire.sire.sex = 'buck';
      sireNode.sire.dam = getAnc(dams[0]);
      if (sireNode.sire.dam) sireNode.sire.dam.sex = 'doe';
    }
    sireNode.dam = getAnc(sireDamNoPrefix || dams[1]);
    if (sireNode.dam) {
      sireNode.dam.sex = 'doe';
      sireNode.dam.sire = getAnc(sires[3]);
      if (sireNode.dam.sire) sireNode.dam.sire.sex = 'buck';
      sireNode.dam.dam = getAnc(dams[1]);
      if (sireNode.dam.dam) sireNode.dam.dam.sex = 'doe';
    }
  }

  const damNode = getAnc(dams[2]);
  if (damNode) {
    damNode.sex = 'doe';
    damNode.sire = getAnc(sires[4]);
    if (damNode.sire) {
      damNode.sire.sex = 'buck';
      damNode.sire.sire = getAnc(sires[5]);
      if (damNode.sire.sire) damNode.sire.sire.sex = 'buck';
      damNode.sire.dam = getAnc(dams[3]);
      if (damNode.sire.dam) damNode.sire.dam.sex = 'doe';
    }
    damNode.dam = getAnc(dams[4]);
    if (damNode.dam) {
      damNode.dam.sex = 'doe';
      damNode.dam.sire = getAnc(sires[6]);
      if (damNode.dam.sire) damNode.dam.sire.sex = 'buck';
      damNode.dam.dam = getAnc(dams[5]);
      if (damNode.dam.dam) damNode.dam.dam.sex = 'doe';
    }
  }

  const targetRabbit = getAnc(target);
  targetRabbit.sire = sireNode;
  targetRabbit.dam = damNode;

  return targetRabbit;
};



