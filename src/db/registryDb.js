import Dexie from 'dexie';
import {
  DEFAULT_BREEDERS, DEFAULT_RABBITS, DEFAULT_BREEDINGS, DEFAULT_LITTERS,
  DEFAULT_LEDGER, DEFAULT_SHOWS, DEFAULT_CHORES, DEFAULT_TRANSFERS,
  DEFAULT_SIGNATURES, DEFAULT_MEDICAL, DEFAULT_WEIGHTS
} from './defaults';

export const db = new Dexie('RabbitryPedigreeProDB');

db.version(1).stores({
  adminBreeders: 'id, email, username',
  rabbits: 'id, breederId, breed, sireId, damId',
  breedings: 'id, breederId, buckId, doeId',
  litters: 'id, breederId, breedingId',
  ledger: 'id, breederId, rabbitId',
  shows: 'id, breederId',
  showEntries: 'id, breederId, showId, rabbitId',
  chores: 'id, breederId',
  transfers: 'id, breederId, rabbitId',
  signatures: 'id, breederId',
  medical: 'id, breederId, rabbitId',
  weights: 'id, breederId, rabbitId',
  syncQueue: 'id, breederId',
  approvals: 'id, breederId'
});

// Version 2: Advanced Indexing for query optimization & scaling (200-1000+ records)
db.version(2).stores({
  adminBreeders: 'id, email, username, role',
  rabbits: 'id, breederId, breed, variety, status, sex, dob, tattooNumber, sireId, damId, [breederId+status], [breederId+sex], [breederId+status+sex]',
  breedings: 'id, breederId, buckId, doeId, breedDate, status',
  litters: 'id, breederId, breedingId, kindleDate',
  ledger: 'id, breederId, rabbitId, date',
  shows: 'id, breederId, date',
  showEntries: 'id, breederId, showId, rabbitId',
  chores: 'id, breederId, dueDate',
  transfers: 'id, breederId, rabbitId, date',
  signatures: 'id, breederId',
  medical: 'id, breederId, rabbitId, date',
  weights: 'id, breederId, rabbitId, date, [rabbitId+date]',
  syncQueue: 'id, breederId, timestamp',
  approvals: 'id, breederId, timestamp'
});

// Version 3: Multi-species cavy field and youth progress/quiz tables
db.version(3).stores({
  adminBreeders: 'id, email, username, role',
  rabbits: 'id, breederId, breed, variety, status, sex, dob, tattooNumber, sireId, damId, species, [breederId+status], [breederId+sex], [breederId+status+sex]',
  breedings: 'id, breederId, buckId, doeId, breedDate, status',
  litters: 'id, breederId, breedingId, kindleDate',
  ledger: 'id, breederId, rabbitId, date',
  shows: 'id, breederId, date',
  showEntries: 'id, breederId, showId, rabbitId',
  chores: 'id, breederId, dueDate',
  transfers: 'id, breederId, rabbitId, date',
  signatures: 'id, breederId',
  medical: 'id, breederId, rabbitId, date',
  weights: 'id, breederId, rabbitId, date, [rabbitId+date]',
  syncQueue: 'id, breederId, timestamp',
  approvals: 'id, breederId, timestamp',
  youthProgress: 'id, memberName, ageGroup, currentLevel, xp, streak, lastActiveDate, coachId',
  youthQuizLogs: 'id, progressId, quizType, score, passed, date, coachFeedback'
});

let migrationPromise = null;

export async function performMigrationAndLoad() {
  if (migrationPromise) {
    return migrationPromise;
  }

  migrationPromise = (async () => {
    const isMigrated = localStorage.getItem('rp_migrated_to_dexie_v4');
    
    const migrateOrLoadTable = async (localStorageKey, dexieTable, defaultList = []) => {
      // If not migrated yet, we check localStorage first. If migrated, we check IndexedDB count.
      if (isMigrated) {
        const count = await dexieTable.count();
        if (count > 0) {
          return await dexieTable.toArray();
        }
      }
      
      // Check localStorage
      const saved = localStorage.getItem(localStorageKey);
      let list = defaultList;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
          }
        } catch (e) {
          console.error(`Error parsing localStorage key ${localStorageKey}:`, e);
        }
      }
      
      // Clear and populate Dexie
      await dexieTable.clear();
      if (list.length > 0) {
        await dexieTable.bulkAdd(list);
      }
      return list;
    };

    // Run all migrations/loaders
    const adminBreeders = await migrateOrLoadTable('rp_admin_breeders', db.adminBreeders, DEFAULT_BREEDERS);
    const rabbits = await migrateOrLoadTable('rp_rabbits', db.rabbits, DEFAULT_RABBITS);
    const breedings = await migrateOrLoadTable('rp_breedings', db.breedings, DEFAULT_BREEDINGS);
    const litters = await migrateOrLoadTable('rp_litters', db.litters, DEFAULT_LITTERS);
    const ledger = await migrateOrLoadTable('rp_ledger', db.ledger, DEFAULT_LEDGER);
    const shows = await migrateOrLoadTable('rp_shows', db.shows, DEFAULT_SHOWS);
    const showEntries = await migrateOrLoadTable('rp_show_entries', db.showEntries, []);
    const chores = await migrateOrLoadTable('rp_chores', db.chores, DEFAULT_CHORES);
    const transfers = await migrateOrLoadTable('rp_transfers', db.transfers, DEFAULT_TRANSFERS);
    // Map missing breederId fields on seed records dynamically to ensure strict schema index compliance
    const medicalSeed = DEFAULT_MEDICAL.map(m => {
      const r = DEFAULT_RABBITS.find(rx => rx.id === m.rabbitId);
      return { ...m, breederId: r ? r.breederId : 'ab-1' };
    });
    const weightsSeed = DEFAULT_WEIGHTS.map(w => {
      const r = DEFAULT_RABBITS.find(rx => rx.id === w.rabbitId);
      return { ...w, breederId: r ? r.breederId : 'ab-1' };
    });
    const signaturesSeed = DEFAULT_SIGNATURES.map(s => {
      const t = DEFAULT_TRANSFERS.find(tx => tx.id === s.transferId);
      return { ...s, breederId: t ? t.breederId : 'ab-1' };
    });

    const signatures = await migrateOrLoadTable('rp_signatures', db.signatures, signaturesSeed);
    const medical = await migrateOrLoadTable('rp_medical', db.medical, medicalSeed);
    const weights = await migrateOrLoadTable('rp_weights', db.weights, weightsSeed);
    const syncQueue = await migrateOrLoadTable('rp_sync_queue', db.syncQueue, []);
    const approvals = await migrateOrLoadTable('rp_approvals', db.approvals, []);
    const youthProgress = await migrateOrLoadTable('rp_youth_progress', db.youthProgress, []);
    const youthQuizLogs = await migrateOrLoadTable('rp_youth_quiz_logs', db.youthQuizLogs, []);

    // Mark migration as done
    if (!isMigrated) {
      localStorage.setItem('rp_migrated_to_dexie_v4', 'true');
    }

    return {
      adminBreeders,
      rabbits,
      breedings,
      litters,
      ledger,
      shows,
      showEntries,
      chores,
      transfers,
      signatures,
      medical,
      weights,
      syncQueue,
      approvals,
      youthProgress,
      youthQuizLogs
    };
  })().catch(err => {
    migrationPromise = null; // Clear lock on error to allow retry
    throw err;
  });

  return migrationPromise;
}
