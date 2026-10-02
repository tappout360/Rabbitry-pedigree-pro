// api/backups.js — Cloud Backup Storage Endpoint (Vercel Serverless + MongoDB Atlas)
import { getDb } from './_lib/mongodb.js';
import { verifyAuth, unauthorized } from './_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 1. Verify Authentication
  const authUser = verifyAuth(req);
  if (!authUser) {
    // If running in development without JWT token, permit authorized demo header or fallback
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev && !req.headers.authorization) {
      return unauthorized(res);
    }
  }

  const userId = authUser?.userId || 'primary_breeder';

  // 2. Connect to MongoDB Atlas (with graceful local fallback)
  let db;
  try {
    db = await getDb();
  } catch (err) {
    console.warn('[api/backups] MongoDB not configured or unavailable:', err.message);
    // Graceful offline/local simulation
    if (req.method === 'GET') {
      return res.status(200).json({ simulated: true, backups: [] });
    }
    return res.status(200).json({ simulated: true, message: 'Cloud backup storage in offline simulation mode.' });
  }

  const collection = db.collection('backups');

  try {
    // GET: List backups or download specific backup by id
    if (req.method === 'GET') {
      const { id } = req.query;

      if (id) {
        const backupDoc = await collection.findOne({
          $or: [{ id }, { _id: id }],
          _breederId: userId
        });

        if (!backupDoc) {
          return res.status(404).json({ error: 'Backup snapshot not found or access denied.' });
        }
        return res.status(200).json(backupDoc);
      }

      // Return list of metadata (without heavy payload)
      const list = await collection
        .find({ _breederId: userId })
        .project({
          id: 1,
          type: 1,
          label: 1,
          createdAt: 1,
          sizeBytes: 1,
          checksum: 1,
          encrypted: 1,
          recordCounts: 1,
          isPinned: 1
        })
        .sort({ createdAt: -1 })
        .limit(25)
        .toArray();

      return res.status(200).json({ backups: list });
    }

    // POST: Upload a new backup snapshot
    if (req.method === 'POST') {
      const { id, type, label, createdAt, sizeBytes, checksum, recordCounts, encrypted, payload } = req.body;

      if (!id || !payload) {
        return res.status(400).json({ error: 'Missing required backup id or payload.' });
      }

      // Enforce 10MB payload size limit per cloud backup
      if (sizeBytes > 10 * 1024 * 1024) {
        return res.status(413).json({ error: 'Backup exceeds maximum allowed cloud storage limit (10MB).' });
      }

      const backupDoc = {
        id,
        _breederId: userId,
        type: type || 'manual',
        label: label || 'Cloud Snapshot',
        createdAt: createdAt || new Date().toISOString(),
        sizeBytes: sizeBytes || 0,
        checksum: checksum || '',
        recordCounts: recordCounts || {},
        encrypted: Boolean(encrypted),
        isPinned: false,
        payload,
        updatedAt: new Date()
      };

      await collection.updateOne(
        { id, _breederId: userId },
        { $set: backupDoc },
        { upsert: true }
      );

      // Cloud Retention: Prune oldest unpinned auto backups beyond 10
      const autoBackups = await collection
        .find({ _breederId: userId, type: 'automatic', isPinned: { $ne: true } })
        .sort({ createdAt: -1 })
        .toArray();

      if (autoBackups.length > 10) {
        const toDeleteIds = autoBackups.slice(10).map(b => b._id);
        await collection.deleteMany({ _id: { $in: toDeleteIds } });
      }

      return res.status(200).json({ success: true, backupId: id, message: 'Backup snapshot saved to cloud vault.' });
    }

    // DELETE: Delete a backup snapshot
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Backup id is required.' });

      const result = await collection.deleteOne({
        $or: [{ id }, { _id: id }],
        _breederId: userId
      });

      return res.status(200).json({ success: true, deletedCount: result.deletedCount });
    }

    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (apiErr) {
    console.error('[api/backups] Error:', apiErr);
    return res.status(500).json({ error: 'Internal server error processing cloud backup.' });
  }
}
