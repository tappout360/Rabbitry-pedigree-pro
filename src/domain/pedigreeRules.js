/**
 * pedigreeRules.js
 * Domain Core: ARBA Lineage Standards, Ear Tag Format Validation, and Wright's Inbreeding Algorithm
 * Pure Business Logic - No UI, No DB, No Network Dependencies.
 */

export const PEDIGREE_ROLES = [
  'self',
  'sire', 'dam',
  'sireSire', 'sireDam', 'damSire', 'damDam',
  'sireSireSire', 'sireSireDam', 'sireDamSire', 'sireDamDam',
  'damSireSire', 'damSireDam', 'damDamSire', 'damDamDam'
];

/**
 * Validates left ear tattoo according to ARBA registration rules:
 * Max 8 characters, alphanumeric, uppercase, no symbols.
 */
export function validateArbaEarTattoo(tattoo) {
  if (!tattoo || typeof tattoo !== 'string') {
    return { isValid: false, message: 'Ear tattoo / tag is required for purebred registry.' };
  }
  const clean = tattoo.trim().toUpperCase();
  if (clean.length === 0) {
    return { isValid: false, message: 'Ear tattoo cannot be blank.' };
  }
  if (clean.length > 8) {
    return { isValid: false, message: 'ARBA standard specifies ear tattoos must be 8 characters or fewer.' };
  }
  const regex = /^[A-Z0-9\-_]+$/;
  if (!regex.test(clean)) {
    return { isValid: false, message: 'Ear tattoo contains invalid characters. Use letters, numbers, hyphens, or underscores only.' };
  }
  return { isValid: true, cleanTattoo: clean };
}

/**
 * Validates birthdates between parent and offspring.
 * A parent must be born strictly before the offspring, with a realistic minimum age (>= 120 days).
 */
export function validateParentOffspringDates(parentDobStr, offspringDobStr, parentLabel = 'Parent') {
  if (!parentDobStr || !offspringDobStr) return { isValid: true };

  const parentDate = new Date(parentDobStr).getTime();
  const offspringDate = new Date(offspringDobStr).getTime();

  if (isNaN(parentDate) || isNaN(offspringDate)) return { isValid: true };

  if (parentDate >= offspringDate) {
    return {
      isValid: false,
      message: `Invalid Timeline: ${parentLabel} birthdate (${parentDobStr}) cannot be the same as or after offspring birthdate (${offspringDobStr}).`
    };
  }

  const ageDays = (offspringDate - parentDate) / (24 * 60 * 60 * 1000);
  if (ageDays < 120) {
    return {
      isValid: true,
      warning: `Breeding Caution: ${parentLabel} was approximately ${Math.round(ageDays)} days old when this litter was born (under typical 120–150 day sexual maturity).`
    };
  }

  return { isValid: true };
}

/**
 * Calculates Wright's Coefficient of Inbreeding (F) by recursive ancestor ancestry path analysis.
 * Pure in-memory computation given rabbit map { id: { sireId, damId } }.
 */
export function calculateWrightsCoefficient(rabbitId, rabbitMap, maxDepth = 4) {
  if (!rabbitId || !rabbitMap || !rabbitMap[rabbitId]) return 0;

  const target = rabbitMap[rabbitId];
  if (!target.sireId || !target.damId) return 0;

  // Gather ancestors for sire and dam
  const getAncestors = (currId, currentDepth) => {
    if (!currId || currentDepth > maxDepth || !rabbitMap[currId]) return [];
    const node = rabbitMap[currId];
    const res = [{ id: currId, depth: currentDepth }];
    if (node.sireId) res.push(...getAncestors(node.sireId, currentDepth + 1));
    if (node.damId) res.push(...getAncestors(node.damId, currentDepth + 1));
    return res;
  };

  const sireAncestors = getAncestors(target.sireId, 1);
  const damAncestors = getAncestors(target.damId, 1);

  let inbreedingCoeff = 0;
  const commonIds = new Set();

  sireAncestors.forEach(sa => {
    damAncestors.forEach(da => {
      if (sa.id === da.id && !commonIds.has(sa.id)) {
        commonIds.add(sa.id);
        const pathLength = sa.depth + da.depth;
        inbreedingCoeff += Math.pow(0.5, pathLength);
      }
    });
  });

  return Math.min(1, Math.round(inbreedingCoeff * 10000) / 10000);
}
