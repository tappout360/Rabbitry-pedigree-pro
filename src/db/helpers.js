import { BREED_STANDARDS } from './breedStandards';

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
  sanitized = sanitized.replace(/\b[A-Z]\d{2}(?:\.\d{1,4})?\b/gi, '[HEALTH CODE REDACTED]');
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
    classSize: classSizeMatch ? Number(classSizeMatch[1]) : ''
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
  const sexLabel = sex === 'buck' ? 'Buck' : 'Doe';
  if (manualOverrideClass && manualOverrideClass !== 'Auto') {
    return manualOverrideClass + ' ' + sexLabel;
  }
  if (!dobStr) return 'Senior ' + sexLabel;
  
  const dobDate = new Date(dobStr);
  if (isNaN(dobDate.getTime())) return 'Senior ' + sexLabel;
  
  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
  const diffTime = targetDate - dobDate;
  if (diffTime < 0) return 'Junior ' + (sex === 'buck' ? 'Buck' : 'Doe');
  
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const diffMonths = diffDays / 30.4375;
  
  const breedInfo = BREED_STANDARDS[breedName] || { classType: '4-class' };
  
  if (breedInfo.classType === '6-class') {
    if (diffMonths < 6) {
      return 'Junior ' + sexLabel;
    } else if (diffMonths >= 6 && diffMonths < 8) {
      return 'Intermediate ' + sexLabel;
    } else {
      return 'Senior ' + sexLabel;
    }
  } else {
    // 4-class breed
    if (diffMonths < 6) {
      return 'Junior ' + sexLabel;
    } else {
      return 'Senior ' + sexLabel;
    }
  }
};


