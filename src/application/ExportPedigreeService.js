/**
 * ExportPedigreeService.js
 * Application Use-Case Service: Export Official 4-Generation Pedigree Certificate
 * Coordinates Lineage Assembly, Subscription Gate Enforcement, and Output Formatting.
 */

import { isFeatureEntitled, explainEntitlementGap, FEATURES } from '../domain/subscriptionRules';
import { calculateWrightsCoefficient } from '../domain/pedigreeRules';
import { evaluateInbreedingRisk } from '../domain/animalSafety';

export class ExportPedigreeService {
  /**
   * Compiles the 15-node 4-generation tree with ARBA metrics
   */
  compilePedigreeTree(rabbit, allRabbits = []) {
    if (!rabbit) return null;

    const findRabbit = (id) => id ? allRabbits.find(r => r.id === id) || null : null;

    // Gen 1: Self
    const self = rabbit;

    // Gen 2: Parents
    const sire = findRabbit(self.sireId);
    const dam = findRabbit(self.damId);

    // Gen 3: Grandparents
    const patSire = sire ? findRabbit(sire.sireId) : null;
    const patDam = sire ? findRabbit(sire.damId) : null;
    const matSire = dam ? findRabbit(dam.sireId) : null;
    const matDam = dam ? findRabbit(dam.damId) : null;

    // Gen 4: Great-Grandparents
    const patPatSire = patSire ? findRabbit(patSire.sireId) : null;
    const patPatDam = patSire ? findRabbit(patSire.damId) : null;
    const patMatSire = patDam ? findRabbit(patDam.sireId) : null;
    const patMatDam = patDam ? findRabbit(patDam.damId) : null;

    const matPatSire = matSire ? findRabbit(matSire.sireId) : null;
    const matPatDam = matSire ? findRabbit(matSire.damId) : null;
    const matMatSire = matDam ? findRabbit(matDam.sireId) : null;
    const matMatDam = matDam ? findRabbit(matDam.damId) : null;

    // Map for inbreeding calculation
    const rabbitMap = {};
    allRabbits.forEach(r => { rabbitMap[r.id] = r; });
    rabbitMap[self.id] = self;

    const inbreedingCoeff = calculateWrightsCoefficient(self.id, rabbitMap);
    const inbreedingRisk = evaluateInbreedingRisk(inbreedingCoeff);

    // Official Verification Token
    const shortId = (self.id || 'VAL').slice(-6);
    const verificationToken = `rp-${shortId}-${self.tattooNumber || 'TAG'}`;
    const verificationUrl = `https://rabbitrypedigreepro.com/pedigree/${self.id}?tat=${encodeURIComponent(self.tattooNumber || '')}&name=${encodeURIComponent(self.name || '')}`;

    return {
      proband: self,
      verificationToken,
      verificationUrl,
      inbreedingCoeff,
      inbreedingRisk,
      tree: {
        gen1: { self },
        gen2: { sire, dam },
        gen3: { patSire, patDam, matSire, matDam },
        gen4: {
          patPatSire, patPatDam, patMatSire, patMatDam,
          matPatSire, matPatDam, matMatSire, matMatDam
        }
      }
    };
  }

  /**
   * Execute pedigree export verification and data compilation
   */
  execute({ currentUser, rabbit, allRabbits = [], isDemoMode = false }) {
    if (!isFeatureEntitled(currentUser?.tier, FEATURES.EXPORT_PDF, isDemoMode)) {
      throw new Error(explainEntitlementGap(FEATURES.EXPORT_PDF));
    }

    const compiled = this.compilePedigreeTree(rabbit, allRabbits);
    return compiled;
  }
}
