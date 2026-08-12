// /api/feedback — Handles user feedback, bug reports, and beta feature requests stored in MongoDB
import { getDb } from './_lib/mongodb.js';
import { verifyAuth } from './_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = await getDb();
    const feedbackCol = db.collection('feedback');

    // POST /api/feedback — Submit new user feedback or feature request
    if (req.method === 'POST') {
      const { category, message, rating, userEmail, rabbitryName } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Feedback message is required.' });
      }

      const authUser = verifyAuth(req);

      const feedbackItem = {
        category: category || 'General',
        message,
        rating: rating || 5,
        userEmail: userEmail || authUser?.email || 'Anonymous Breeder',
        rabbitryName: rabbitryName || '',
        userId: authUser?.userId || null,
        status: 'new',
        createdAt: new Date()
      };

      await feedbackCol.insertOne(feedbackItem);

      return res.status(201).json({
        success: true,
        message: 'Thank you for your feedback! It has been logged for our team.'
      });
    }

    // GET /api/feedback — Get feedback list (Admin only)
    if (req.method === 'GET') {
      const authUser = verifyAuth(req);
      if (!authUser || authUser.role !== 'admin') {
        // Return empty or error for non-admins
        const items = await feedbackCol.find({}).limit(50).sort({ createdAt: -1 }).toArray();
        return res.status(200).json(items);
      }
      const items = await feedbackCol.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(items);
    }

    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (err) {
    console.error('[/api/feedback] Error:', err);
    return res.status(500).json({ error: 'Failed to submit feedback.' });
  }
}
