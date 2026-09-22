/**
 * animalSafety.js
 * Domain Core: Animal Safety, Welfare Standards, and FDA Drug Withdrawal Policies
 * Pure Business Logic - No UI, No DB, No Network Dependencies.
 */

// FDA & ARBA-Recognized Medication Withdrawal Periods for Rabbits & Cavies
export const FDA_WITHDRAWAL_PERIODS = {
  ivermectin: {
    name: 'Ivermectin (Ear Mites / Fur Mites)',
    withdrawalDays: 14,
    notes: 'Meat withdrawal: 14 days minimum. Consult a veterinarian for lactating does.'
  },
  fenbendazole: {
    name: 'Fenbendazole / Panacur (E. cuniculi / Pinworms)',
    withdrawalDays: 14,
    notes: 'Administer only under veterinary guidance for positive titer.'
  },
  toltrazuril: {
    name: 'Toltrazuril / Baycox (Coccidiosis)',
    withdrawalDays: 28,
    notes: '28-day meat withdrawal period. Maintain clean sanitization.'
  },
  penicillin_g: {
    name: 'Penicillin G Procaine (Sub-Q only - NEVER ORAL)',
    withdrawalDays: 30,
    notes: 'CRITICAL: Oral administration causes fatal enterotoxemia in rabbits. Subcutaneous injection only under vet supervision.'
  },
  oxytetracycline: {
    name: 'Oxytetracycline (Respiratory / Pasteurella)',
    withdrawalDays: 28,
    notes: '28-day withdrawal for exhibition or meat production.'
  },
  enrofloxacin: {
    name: 'Enrofloxacin / Baytril (Broad Spectrum)',
    withdrawalDays: 30,
    notes: 'Extra-label prescription antibiotic. Do not administer to growing kits under 4 months.'
  }
};

/**
 * Calculate FDA withdrawal end date and remaining active days
 */
export function calculateWithdrawalStatus(medicationKey, administrationDateStr) {
  if (!medicationKey || !administrationDateStr) {
    return { isUnderWithdrawal: false, daysRemaining: 0, clearDate: null };
  }

  const medInfo = FDA_WITHDRAWAL_PERIODS[medicationKey.toLowerCase().trim()];
  if (!medInfo) {
    return { isUnderWithdrawal: false, daysRemaining: 0, clearDate: null };
  }

  const adminTime = new Date(administrationDateStr).getTime();
  if (isNaN(adminTime)) {
    return { isUnderWithdrawal: false, daysRemaining: 0, clearDate: null };
  }

  const withdrawalMs = medInfo.withdrawalDays * 24 * 60 * 60 * 1000;
  const clearTime = adminTime + withdrawalMs;
  const now = Date.now();

  const isUnderWithdrawal = clearTime > now;
  const daysRemaining = isUnderWithdrawal ? Math.ceil((clearTime - now) / (24 * 60 * 60 * 1000)) : 0;

  return {
    medicationName: medInfo.name,
    withdrawalDays: medInfo.withdrawalDays,
    isUnderWithdrawal,
    daysRemaining,
    clearDate: new Date(clearTime).toISOString().split('T')[0],
    notes: medInfo.notes
  };
}

/**
 * Barn Climate & Weather Distress Warning Thresholds
 */
export function evaluateBarnTemperature(tempFahrenheit) {
  if (typeof tempFahrenheit !== 'number' || isNaN(tempFahrenheit)) return null;

  if (tempFahrenheit > 90) {
    return {
      severity: 'critical',
      message: 'CRITICAL HEAT WARNING: Temperatures above 90°F cause fatal heat stroke in rabbits. Immediately deploy frozen 2-liter water bottles, ice tiles, mist fans, and fresh cold water.'
    };
  }
  if (tempFahrenheit > 85) {
    return {
      severity: 'warning',
      message: 'HEAT DISTRESS ADVISORY: Temperatures above 85°F cause elevated respiratory distress. Ensure active airflow and frozen ice blocks.'
    };
  }
  if (tempFahrenheit < 32) {
    return {
      severity: 'warning',
      message: 'FREEZING WEATHER ADVISORY: Temperatures below 32°F freeze water bottles and threaten newborn litters. Check water twice daily and pack deep straw in nest boxes.'
    };
  }
  return {
    severity: 'optimal',
    message: 'Barn climate is within the optimal comfort zone (50°F–75°F).'
  };
}

/**
 * Inbreeding Coefficient (F) Risk Assessment
 */
export function evaluateInbreedingRisk(inbreedingCoeff) {
  const f = Number(inbreedingCoeff) || 0;
  if (f >= 0.25) {
    return {
      riskLevel: 'critical',
      isWarning: true,
      message: `Severe inbreeding coefficient (${(f * 100).toFixed(1)}%). Corresponds to Parent-Offspring or Full-Sibling pairing. High risk of congenital flaws (malocclusion, split penis, reduced viability).`
    };
  }
  if (f >= 0.125) {
    return {
      riskLevel: 'moderate',
      isWarning: true,
      message: `Close linebreeding (${(f * 100).toFixed(1)}%). Corresponds to Grandparent-Grandoffspring or Half-Sibling mating. Monitor kit development carefully.`
    };
  }
  return {
    riskLevel: 'low',
    isWarning: false,
    message: `Safe genetic distance (${(f * 100).toFixed(1)}%). Outcross or broad lineage combination.`
  };
}

export const VETERINARY_DISCLAIMER = 
  "WarrenWise Pro and its automated AI algorithms do NOT provide certified veterinary diagnoses. All dosages, FDA withdrawal periods, and medical protocols must be confirmed with a licensed livestock or exotic veterinarian.";
