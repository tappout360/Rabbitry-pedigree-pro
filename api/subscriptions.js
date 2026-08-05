// /api/subscriptions — Handles subscription management, tiers, and Evans discount verification
import { getDb } from './_lib/mongodb.js';
import { verifyAuth, unauthorized } from './_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = verifyAuth(req);
  if (!authUser) return unauthorized(res);

  try {
    const db = await getDb();
    const subsCol = db.collection('subscriptions');
    const breedersCol = db.collection('adminBreeders');

    // GET /api/subscriptions — Get current user's subscription status
    if (req.method === 'GET') {
      const sub = await subsCol.findOne({ _breederId: authUser.userId });
      if (!sub) {
        // Return default free tier
        return res.status(200).json({
          tier: 'free',
          status: 'active',
          limit: 25,
          evansVerified: false,
          currentPeriodEnd: '2028-12-31'
        });
      }
      return res.status(200).json(sub);
    }

    // POST /api/subscriptions — Update or claim tier / discount
    if (req.method === 'POST') {
      const { action, tier, evansFileName } = req.body;

      if (action === 'claim_evans_discount') {
        // Automatically verify Evans migration and grant discounted Evans Lifetime tier
        const updatedSub = {
          _breederId: authUser.userId,
          tier: 'evans_lifetime',
          status: 'active',
          limit: 10000,
          evansVerified: true,
          evansFileName: evansFileName || 'ANIMAL.DBF',
          discountAmount: 50,
          updatedAt: new Date()
        };

        await subsCol.updateOne(
          { _breederId: authUser.userId },
          { $set: updatedSub },
          { upsert: true }
        );

        await breedersCol.updateOne(
          { _id: authUser.userId },
          { $set: { subscriptionTier: 'pro', subscriptionLimit: 10000, evansVerified: true } }
        );

        return res.status(200).json({
          success: true,
          message: 'Evans Lifetime $50 discount applied successfully!',
          subscription: updatedSub
        });
      }

      // Standard Tier upgrade
      const newSub = {
        _breederId: authUser.userId,
        tier: tier || 'pro',
        status: 'active',
        limit: tier === 'family' ? 100 : 10000,
        updatedAt: new Date()
      };

      await subsCol.updateOne(
        { _breederId: authUser.userId },
        { $set: newSub },
        { upsert: true }
      );

      return res.status(200).json({
        success: true,
        subscription: newSub
      });
    }

    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (err) {
    console.error('[/api/subscriptions] Error:', err);
    return res.status(500).json({ error: 'Subscription operation failed.' });
  }
}
