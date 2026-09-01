// POST /api/seed — Seeds rich, realistic production & demo sample data into MongoDB Atlas
import { getDb } from './_lib/mongodb.js';
import {
  DEFAULT_BREEDERS,
  DEFAULT_RABBITS,
  DEFAULT_BREEDINGS,
  DEFAULT_LITTERS,
  DEFAULT_LEDGER,
  DEFAULT_SHOWS,
  DEFAULT_SHOW_ENTRIES,
  DEFAULT_CHORES,
  DEFAULT_TRANSFERS,
  DEFAULT_SIGNATURES,
  DEFAULT_MEDICAL,
  DEFAULT_WEIGHTS,
  DEFAULT_YOUTH_PROGRESS
} from '../src/db/defaults.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = await getDb();
    const targetBreederId = req.body?.breederId || 'ab-demo-1';

    // Helper to batch upsert
    const upsertCollection = async (colName, records) => {
      const col = db.collection(colName);
      for (const r of records) {
        const localId = r.id || r._localId;
        const breederId = r.breederId || r._breederId || targetBreederId;
        const payload = {
          ...r,
          _localId: localId,
          _breederId: breederId,
          _lastModified: new Date()
        };
        await col.updateOne(
          { _localId: localId },
          { $set: payload },
          { upsert: true }
        );
      }
    };

    // 1. Breeders (Adult Owner + 2 4-H Youth Profiles)
    await upsertCollection('adminBreeders', DEFAULT_BREEDERS.map(b => ({
      ...b,
      isDemo: b.id === 'ab-demo-1'
    })));

    // 2. Rabbits (25 Foundation & Active Rabbits with full photos and 4-gen pedigrees)
    await upsertCollection('rabbits', DEFAULT_RABBITS);

    // 3. Breedings
    await upsertCollection('breedings', DEFAULT_BREEDINGS);

    // 4. Litters
    await upsertCollection('litters', DEFAULT_LITTERS);

    // 5. Ledger
    await upsertCollection('ledger', DEFAULT_LEDGER);

    // 6. Shows & Entries
    await upsertCollection('shows', DEFAULT_SHOWS);
    await upsertCollection('showEntries', DEFAULT_SHOW_ENTRIES);

    // 7. Chores
    await upsertCollection('chores', DEFAULT_CHORES);

    // 8. Transfers & Signatures
    await upsertCollection('transfers', DEFAULT_TRANSFERS);
    await upsertCollection('signatures', DEFAULT_SIGNATURES);

    // 9. Veterinary Medical Logs
    await upsertCollection('medical', DEFAULT_MEDICAL);

    // 10. Multi-Point Growth Weights
    await upsertCollection('weights', DEFAULT_WEIGHTS);

    // 11. Youth 4-H Progress & Milestones
    await upsertCollection('youthProgress', DEFAULT_YOUTH_PROGRESS);

    return res.status(200).json({
      success: true,
      message: 'MongoDB successfully seeded with rich 4-generation herd data and youth profiles!',
      counts: {
        breeders: DEFAULT_BREEDERS.length,
        rabbits: DEFAULT_RABBITS.length,
        breedings: DEFAULT_BREEDINGS.length,
        litters: DEFAULT_LITTERS.length,
        ledger: DEFAULT_LEDGER.length,
        shows: DEFAULT_SHOWS.length,
        showEntries: DEFAULT_SHOW_ENTRIES.length,
        chores: DEFAULT_CHORES.length,
        transfers: DEFAULT_TRANSFERS.length,
        medical: DEFAULT_MEDICAL.length,
        weights: DEFAULT_WEIGHTS.length,
        youthProgress: DEFAULT_YOUTH_PROGRESS.length
      }
    });

  } catch (err) {
    console.error('[/api/seed] Error:', err);
    return res.status(500).json({ error: 'Failed to seed MongoDB data: ' + err.message });
  }
}
