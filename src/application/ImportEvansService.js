/**
 * ImportEvansService.js
 * Application Use-Case Service: Evans Software Pedigree Data Migration
 * Coordinates File Parsing, Field Normalization, Lineage Reconstruction, and Persistence.
 */

import { uuidv7 } from '../db/uuid';
import { validateArbaEarTattoo } from '../domain/pedigreeRules';
import { logSecurityEvent } from '../services/AccountSecurityService';

export class ImportEvansService {
  /**
   * Helper to normalize weight representations from Evans exports
   */
  parseWeightOz(rawWeight) {
    if (!rawWeight) return 0;
    const str = rawWeight.toString().trim().toLowerCase();
    
    // Match "4 lbs 12 oz" or "4 lb 12"
    const lbsOzMatch = str.match(/(\d+)\s*(?:lbs|lb|#)?\s*(\d+)\s*(?:oz|ounces)?/);
    if (lbsOzMatch) {
      const lbs = parseInt(lbsOzMatch[1], 10) || 0;
      const oz = parseInt(lbsOzMatch[2], 10) || 0;
      return (lbs * 16) + oz;
    }
    
    // Match numeric pounds "4.5"
    const num = parseFloat(str);
    if (!isNaN(num)) {
      return Math.round(num * 16);
    }
    return 0;
  }

  /**
   * Execute Evans Migration from structured records
   */
  async execute({ currentUser, rawRecords = [], breederId }) {
    if (!rawRecords || rawRecords.length === 0) {
      throw new Error("No records provided for Evans migration.");
    }

    const effectiveBreederId = breederId || currentUser?.id || 'ab-admin';
    const tattooToIdMap = new Map();
    const parsedRabbits = [];
    const warnings = [];

    // PASS 1: Create base records and map tattoos
    rawRecords.forEach((row, index) => {
      const rawName = row.NAME || row.RabbitName || row.name || `Evans Rabbit #${index + 1}`;
      const rawTat = row.TATTOO || row.EarTag || row.tattooNumber || row.tattoo || '';
      
      const tatCheck = validateArbaEarTattoo(rawTat);
      const cleanTattoo = tatCheck.isValid ? tatCheck.cleanTattoo : (rawTat.trim().toUpperCase() || `EV-${index + 1}`);

      const id = uuidv7();
      tattooToIdMap.set(cleanTattoo, id);

      const rawSex = (row.SEX || row.Sex || row.sex || '').toLowerCase();
      const sex = (rawSex.startsWith('b') || rawSex.startsWith('m') || rawSex === '1') ? 'buck' : 'doe';

      const weightOz = this.parseWeightOz(row.WEIGHT || row.Weight || row.weight);
      const breed = row.BREED || row.Breed || row.breed || 'Standard Purebred';
      const variety = row.COLOR || row.Variety || row.variety || 'Standard';
      const dob = row.DOB || row.BirthDate || row.birthDate || row.dob || '';
      const regNo = row.REGNO || row.RegNumber || row.registrationNumber || '';
      const gcNo = row.GCNO || row.GrandChamp || row.gcNumber || '';

      // Preserve raw parent tattoos for pass 2
      const sireTat = (row.SIRE_TAT || row.SireTattoo || row.Sire || row.sire || '').trim().toUpperCase();
      const damTat = (row.DAM_TAT || row.DamTattoo || row.Dam || row.dam || '').trim().toUpperCase();

      parsedRabbits.push({
        id,
        breederId: effectiveBreederId,
        name: rawName.trim(),
        tattooNumber: cleanTattoo,
        sex,
        breed: breed.trim(),
        variety: variety.trim(),
        dob: dob.trim(),
        weightOz,
        registrationNumber: regNo.trim(),
        gcNumber: gcNo.trim(),
        status: 'active',
        sireId: '',
        damId: '',
        rawSireTat: sireTat,
        rawDamTat: damTat,
        photos: [],
        legs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    // PASS 2: Link lineage relationships
    let linkedLineages = 0;
    parsedRabbits.forEach(rabbit => {
      if (rabbit.rawSireTat && tattooToIdMap.has(rabbit.rawSireTat)) {
        rabbit.sireId = tattooToIdMap.get(rabbit.rawSireTat);
        linkedLineages++;
      }
      if (rabbit.rawDamTat && tattooToIdMap.has(rabbit.rawDamTat)) {
        rabbit.damId = tattooToIdMap.get(rabbit.rawDamTat);
        linkedLineages++;
      }
      delete rabbit.rawSireTat;
      delete rabbit.rawDamTat;
    });

    await logSecurityEvent(
      currentUser?.id,
      'EVANS_IMPORT_COMPLETED',
      { recordCount: parsedRabbits.length, linkedLineages },
      'info'
    );

    return {
      success: true,
      rabbits: parsedRabbits,
      totalCount: parsedRabbits.length,
      linkedLineages,
      warnings
    };
  }
}
