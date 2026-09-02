import Stripe from 'stripe';
import { verifyAuth, unauthorized } from '../_lib/auth.js';
import { getDb } from '../_lib/mongodb.js';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mockKeyWarrenWiseProSecretWebhook2026';
const stripe = new Stripe(STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = verifyAuth(req);
  if (!authUser) return unauthorized(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const isMockStripe = STRIPE_SECRET_KEY.startsWith('sk_test_mockKey');
    const host = req.headers.host || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const origin = `${protocol}://${host}`;

    if (isMockStripe) {
      return res.status(200).json({ url: `${origin}?mock_portal=1` });
    }

    const db = await getDb();
    const subsCol = db.collection('subscriptions');
    const sub = await subsCol.findOne({ _breederId: authUser.userId });

    if (!sub || !sub.stripeCustomerId) {
      return res.status(400).json({ error: 'No active Stripe billing profile found.' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${origin}/dashboard/billing`,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (err) {
    console.error("Error creating portal session:", err);
    return res.status(500).json({ error: 'Stripe integration error' });
  }
}
