/**
 * AddRabbitService.js
 * Application Use-Case Service: Add or Update Rabbit Record
 * Coordinates Domain Core validation, Lineage Integrity, and Storage Adapter.
 */

import { isActionPermitted, explainActionDenial, ACTIONS } from '../domain/roles';
import { validateArbaEarTattoo, validateParentOffspringDates, calculateWrightsCoefficient } from '../domain/pedigreeRules';
import { evaluateInbreedingRisk } from '../domain/animalSafety';
import { logSecurityEvent } from '../services/AccountSecurityService';
import { uuidv7 } from '../db/uuid';

export class AddRabbitService {
  constructor(rabbitRepository) {
    this.rabbitRepository = rabbitRepository;
  }

  async execute({ currentUser, rabbitData, allRabbits = [] }) {
    // 1. Enforce RBAC Permission
    const action = rabbitData.id ? ACTIONS.EDIT_RABBIT : ACTIONS.ADD_RABBIT;
    if (!isActionPermitted(currentUser, action)) {
      throw new Error(explainActionDenial(currentUser, action));
    }

    // 2. Validate Ear Tag according to ARBA rules
    const tattooValidation = validateArbaEarTattoo(rabbitData.tattooNumber);
    if (!tattooValidation.isValid) {
      throw new Error(tattooValidation.message);
    }

    // 3. Validate Lineage Birthdates if parents exist
    if (rabbitData.sireId) {
      const sire = allRabbits.find(r => r.id === rabbitData.sireId);
      if (sire && sire.dob) {
        const dateCheck = validateParentOffspringDates(sire.dob, rabbitData.dob, 'Sire');
        if (!dateCheck.isValid) throw new Error(dateCheck.message);
      }
    }

    if (rabbitData.damId) {
      const dam = allRabbits.find(r => r.id === rabbitData.damId);
      if (dam && dam.dob) {
        const dateCheck = validateParentOffspringDates(dam.dob, rabbitData.dob, 'Dam');
        if (!dateCheck.isValid) throw new Error(dateCheck.message);
      }
    }

    // 4. Calculate Inbreeding Coefficient (Wright's F)
    const rabbitMap = {};
    allRabbits.forEach(r => { rabbitMap[r.id] = r; });
    const tempId = rabbitData.id || uuidv7();
    rabbitMap[tempId] = { ...rabbitData, id: tempId };

    const inbreedingCoeff = calculateWrightsCoefficient(tempId, rabbitMap);
    const inbreedingAssessment = evaluateInbreedingRisk(inbreedingCoeff);

    // 5. Assemble Entity
    const entity = {
      ...rabbitData,
      id: tempId,
      tattooNumber: tattooValidation.cleanTattoo,
      breederId: currentUser?.id || 'ab-admin',
      inbreedingCoeff,
      inbreedingWarning: inbreedingAssessment.isWarning ? inbreedingAssessment.message : null,
      updatedAt: new Date().toISOString(),
      createdAt: rabbitData.createdAt || new Date().toISOString()
    };

    // 6. Persist via repository adapter if provided
    if (this.rabbitRepository && this.rabbitRepository.save) {
      await this.rabbitRepository.save(entity);
    }

    // 7. Security & Audit Logging
    await logSecurityEvent(
      currentUser?.id,
      action,
      { rabbitId: entity.id, tattoo: entity.tattooNumber, name: entity.name },
      'info'
    );

    return {
      success: true,
      rabbit: entity,
      inbreedingAssessment
    };
  }
}
