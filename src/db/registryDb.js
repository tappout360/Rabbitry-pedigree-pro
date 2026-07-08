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

export async function performMigrationAndLoad() {
  const isMigrated = localStorage.getItem('rp_migrated_to_dexie_v3');
  
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
  const signatures = await migrateOrLoadTable('rp_signatures', db.signatures, DEFAULT_SIGNATURES);
  const medical = await migrateOrLoadTable('rp_medical', db.medical, DEFAULT_MEDICAL);
  const weights = await migrateOrLoadTable('rp_weights', db.weights, DEFAULT_WEIGHTS);
  const syncQueue = await migrateOrLoadTable('rp_sync_queue', db.syncQueue, []);
  const approvals = await migrateOrLoadTable('rp_approvals', db.approvals, []);

  // Mark migration as done
  if (!isMigrated) {
    localStorage.setItem('rp_migrated_to_dexie_v3', 'true');
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
    approvals
  };
}
