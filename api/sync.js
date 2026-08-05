// POST /api/sync — Bidirectional sync endpoint
// Receives local changes from the client and returns remote changes.
// This connects the existing Dexie syncQueue to MongoDB.
import { getDb } from './_lib/mongodb.js';
import { verifyAuth, unauthorized } from './_lib/auth.js';

// Tables that can be synced
const ALLOWED_TABLES = [
  'rabbits', 'breedings', 'litters', 'weights', 'medical',
  'ledger', 'shows', 'showEntries', 'transfers', 'chores',
  'marketplaceListings', 'socialPosts', 'socialComments',
  'youthProgress', 'youthQuizLogs', 'subscriptions'
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const authUser = verifyAuth(req);
  if (!authUser) return unauthorized(res);

  try {
    const db = await getDb();
    const { changes, lastSyncTimestamp } = req.body;

    const userId = authUser.userId;
    const results = { pushed: 0, pulled: {}, errors: [] };

    // ---- PUSH: Apply local changes to MongoDB ----
    if (changes && Array.isArray(changes) && changes.length > 0) {
      for (const change of changes) {
        try {
          const { tbl, action, recordId, payload } = change;

          if (!ALLOWED_TABLES.includes(tbl)) {
            results.errors.push({ recordId, error: `Table '${tbl}' is not syncable.` });
            continue;
          }

          const collection = db.collection(tbl);

          if (action === 'DELETE') {
            await collection.deleteOne({ _localId: recordId, _breederId: userId });
          } else {
            // INSERT or UPDATE — upsert by local ID + breeder
            await collection.updateOne(
              { _localId: recordId, _breederId: userId },
              {
                $set: {
                  ...payload,
                  _localId: recordId,
                  _breederId: userId,
                  _lastModified: new Date()
                }
              },
              { upsert: true }
            );
          }
          results.pushed++;
        } catch (err) {
          results.errors.push({ recordId: change.recordId, error: err.message });
        }
      }
    }

    // ---- PULL: Get remote changes since last sync ----
    const sinceDate = lastSyncTimestamp ? new Date(lastSyncTimestamp) : new Date(0);

    for (const tableName of ALLOWED_TABLES) {
      try {
        const collection = db.collection(tableName);
        const remoteDocs = await collection
          .find({
            _breederId: userId,
            _lastModified: { $gt: sinceDate }
          })
          .toArray();

        if (remoteDocs.length > 0) {
          results.pulled[tableName] = remoteDocs.map(doc => ({
            ...doc,
            id: doc._localId || doc._id.toString(),
            _id: undefined
          }));
        }
      } catch (err) {
        results.errors.push({ table: tableName, error: err.message });
      }
    }

    return res.status(200).json({
      success: true,
      pushed: results.pushed,
      pulled: results.pulled,
      errors: results.errors,
      syncTimestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[/api/sync] Error:', err);
    return res.status(500).json({ error: 'Sync failed.' });
  }
}
