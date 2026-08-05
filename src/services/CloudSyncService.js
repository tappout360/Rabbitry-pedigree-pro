// CloudSyncService — Syncs local Dexie IndexedDB data to Firebase Firestore
// Uses the existing syncQueue table to track pending changes and push them to the cloud.
import {
  collection, doc, setDoc, getDoc, getDocs,
  query, where, writeBatch, serverTimestamp, deleteDoc
} from 'firebase/firestore';
import { firestore, isFirebaseConfigured } from './firebase';
import { db } from '../db/registryDb';

// Tables that sync to Firestore (maps Dexie table name → Firestore collection name)
const SYNCABLE_TABLES = {
  rabbits: 'rabbits',
  breedings: 'breedings',
  litters: 'litters',
  weights: 'weights',
  medical: 'medical',
  ledger: 'ledger',
  shows: 'shows',
  showEntries: 'showEntries',
  transfers: 'transfers',
  chores: 'chores',
  marketplaceListings: 'marketplaceListings',
  socialPosts: 'socialPosts'
};

/**
 * Push all pending sync queue items to Firestore.
 * Each syncQueue entry has: { id, recordId, tbl, timestamp, action, payload }
 */
export async function pushPendingChanges(breederId) {
  if (!isFirebaseConfigured || !firestore) {
    console.log('[CloudSync] Firebase not configured — skipping push.');
    return { pushed: 0, errors: [] };
  }

  const pendingItems = await db.syncQueue.toArray();
  if (pendingItems.length === 0) return { pushed: 0, errors: [] };

  let pushed = 0;
  const errors = [];

  // Use Firestore batch writes for efficiency (max 500 per batch)
  const batchSize = 450;
  for (let i = 0; i < pendingItems.length; i += batchSize) {
    const chunk = pendingItems.slice(i, i + batchSize);
    const batch = writeBatch(firestore);

    for (const item of chunk) {
      try {
        const collectionName = SYNCABLE_TABLES[item.tbl] || item.tbl;
        // Nest under breeder's subcollection: breeders/{breederId}/{table}/{recordId}
        const docRef = doc(firestore, 'breeders', breederId, collectionName, item.recordId || item.id);

        if (item.action === 'DELETE') {
          batch.delete(docRef);
        } else {
          // INSERT or UPDATE
          const payload = item.payload || {};
          batch.set(docRef, {
            ...payload,
            _lastModified: serverTimestamp(),
            _breederId: breederId
          }, { merge: true });
        }
        pushed++;
      } catch (err) {
        errors.push({ item: item.id, error: err.message });
      }
    }

    try {
      await batch.commit();
      // Clear successfully pushed items from sync queue
      const ids = chunk.map(c => c.id);
      await db.syncQueue.bulkDelete(ids);
    } catch (err) {
      errors.push({ batch: i, error: err.message });
    }
  }

  return { pushed, errors };
}

/**
 * Pull all records from Firestore for a breeder and merge into local Dexie.
 * Uses last-write-wins for non-critical fields.
 */
export async function pullRemoteChanges(breederId) {
  if (!isFirebaseConfigured || !firestore) {
    console.log('[CloudSync] Firebase not configured — skipping pull.');
    return { pulled: 0, errors: [] };
  }

  let pulled = 0;
  const errors = [];

  for (const [dexieTable, firestoreCollection] of Object.entries(SYNCABLE_TABLES)) {
    try {
      const colRef = collection(firestore, 'breeders', breederId, firestoreCollection);
      const snapshot = await getDocs(colRef);

      if (snapshot.empty) continue;

      const remoteRecords = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        remoteRecords.push({ ...data, id: docSnap.id });
      });

      // Merge into local Dexie: remote wins for now (LWW)
      const table = db[dexieTable];
      if (table) {
        for (const record of remoteRecords) {
          const localRecord = await table.get(record.id);
          if (!localRecord || (record._lastModified && (!localRecord._lastModified || record._lastModified > localRecord._lastModified))) {
            await table.put(record);
            pulled++;
          }
        }
      }
    } catch (err) {
      errors.push({ table: dexieTable, error: err.message });
    }
  }

  return { pulled, errors };
}

/**
 * Full bidirectional sync: push local changes, then pull remote changes.
 */
export async function fullSync(breederId) {
  const pushResult = await pushPendingChanges(breederId);
  const pullResult = await pullRemoteChanges(breederId);

  return {
    pushed: pushResult.pushed,
    pulled: pullResult.pulled,
    errors: [...pushResult.errors, ...pullResult.errors]
  };
}

/**
 * Check if the user has cloud data (used for first-time sync check).
 */
export async function hasCloudData(breederId) {
  if (!isFirebaseConfigured || !firestore) return false;

  try {
    const rabbitsCol = collection(firestore, 'breeders', breederId, 'rabbits');
    const snapshot = await getDocs(query(rabbitsCol));
    return !snapshot.empty;
  } catch {
    return false;
  }
}
