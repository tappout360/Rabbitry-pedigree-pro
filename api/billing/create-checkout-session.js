import Stripe from 'stripe';
import { verifyAuth, unauthorized } from '../_lib/auth.js';

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

  const { tier, billingCycle } = req.body;
  
  if (!['basic', 'pro', 'youth_academy', 'youth_student', 'master', 'enterprise', 'evans_lifetime'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier specified' });
  }

  try {
    const isMockStripe = STRIPE_SECRET_KEY.startsWith('sk_test_mockKey');
    const host = req.headers.host || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const origin = `${protocol}://${host}`;
    
    const successUrl = `${origin}?checkout=success&tier=${tier}`;
    const cancelUrl = `${origin}?checkout=cancel`;

    if (isMockStripe) {
      const mockSessionId = `mock_cs_${Date.now()}_${Math.random().toString(36).substring(5)}`;
      return res.status(200).json({
        id: mockSessionId,
        url: `${origin}?mock_checkout_session=${mockSessionId}&tier=${tier}&cycle=${billingCycle}`
      });
    }

    let priceId = '';
    if (tier === 'basic') {
      priceId = billingCycle === 'annual' ? 'price_basic_annual_seed' : 'price_basic_monthly_seed';
    } else if (tier === 'pro') {
      priceId = billingCycle === 'annual' ? 'price_pro_annual_seed' : 'price_pro_monthly_seed';
    } else if (tier === 'youth_academy' || tier === 'youth_student') {
      priceId = 'price_youth_academy_monthly_seed';
    } else if (tier === 'master') {
      priceId = billingCycle === 'annual' ? 'price_master_annual_seed' : 'price_master_monthly_seed';
    } else if (tier === 'enterprise') {
      priceId = billingCycle === 'annual' ? 'price_enterprise_annual_seed' : 'price_enterprise_monthly_seed';
    } else if (tier === 'evans_lifetime') {
      priceId = 'price_evans_lifetime_one_time_seed';
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: tier === 'evans_lifetime' ? 'payment' : 'subscription',
      subscription_data: tier === 'evans_lifetime' ? undefined : {
        trial_period_days: 14 
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: authUser.userId,
      metadata: { tier, billingCycle }
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    return res.status(500).json({ error: 'Stripe integration error' });
  }
}
