import Stripe from 'stripe';
import { getDb } from '../_lib/mongodb.js';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mockKeyWarrenWiseProSecretWebhook2026';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mockSecretWarrenWisePro2026';
const stripe = new Stripe(STRIPE_SECRET_KEY);

// Important for Vercel: We need to consume the raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = await buffer(req);
    // Robust Webhook Signature Verification
    event = stripe.webhooks.constructEvent(rawBody.toString('utf8'), sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    // Fallback parser for offline simulated testing
    if (process.env.NODE_ENV !== 'production' && req.headers['x-mock-webhook-bypass'] === 'WarrenWiseWebhookBypass2026') {
      try {
        const rawBody = await buffer(req);
        event = JSON.parse(rawBody.toString('utf8'));
      } catch (parseErr) {
        console.error("Mock webhook payload parse failure:", parseErr.message);
        return res.status(400).send(`Webhook Error: ${parseErr.message}`);
      }
    } else {
      console.error(`Suspicious webhook call. Signature check failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  // Webhook Timestamp Replay Protection
  const eventTimestamp = event.created;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTimestamp - eventTimestamp) > 300) { // Limit window to 5 minutes
    console.error(`Replay attack detected. Skew: ${currentTimestamp - eventTimestamp}s`);
    return res.status(400).send('Webhook Error: Replay check failed.');
  }

  try {
    const db = await getDb();
    const webhooksCol = db.collection('processed_webhook_events');
    const subsCol = db.collection('subscriptions');
    const invoicesCol = db.collection('invoices');

    // Idempotency: Reject already processed event IDs
    const existingEvent = await webhooksCol.findOne({ id: event.id });
    if (existingEvent) {
      return res.json({ received: true, status: 'duplicate' });
    }

    await webhooksCol.insertOne({ id: event.id, timestamp: new Date() });

    const data = event.data.object;
    const type = event.type;

    if (type === 'checkout.session.completed') {
      const breederId = data.client_reference_id;
      const stripeCustomerId = data.customer;
      const stripeSubscriptionId = data.subscription || '';
      const tier = data.metadata?.tier || 'basic';
      
      let subStatus = 'active';
      let trialEnd = null;
      let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      if (stripeSubscriptionId && !stripeSubscriptionId.startsWith('mock_')) {
        try {
          const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          subStatus = stripeSub.status;
          if (stripeSub.trial_end) {
            trialEnd = new Date(stripeSub.trial_end * 1000).toISOString();
          }
          if (stripeSub.current_period_end) {
            periodEnd = new Date(stripeSub.current_period_end * 1000).toISOString();
          }
        } catch (err) {
          console.error("Stripe retrieve sub error:", err);
        }
      } else if (stripeSubscriptionId && stripeSubscriptionId.startsWith('mock_')) {
        subStatus = data.metadata?.mode === 'trial' ? 'trialing' : 'active';
        if (subStatus === 'trialing') {
          trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        }
      }

      const updateData = {
        _breederId: breederId,
        tier,
        status: subStatus,
        stripeCustomerId,
        stripeSubscriptionId,
        currentPeriodEnd: periodEnd,
        trialEnd,
        updatedAt: new Date()
      };

      await subsCol.updateOne(
        { _breederId: breederId },
        { $set: updateData },
        { upsert: true }
      );
    } else if (type === 'customer.subscription.updated') {
      const stripeSubscriptionId = data.id;
      const updatedStatus = data.status;
      const updatedTier = data.metadata?.tier || 'basic';
      const updatedPeriodEnd = new Date(data.current_period_end * 1000).toISOString();
      const updatedTrialEnd = data.trial_end ? new Date(data.trial_end * 1000).toISOString() : null;

      await subsCol.updateOne(
        { stripeSubscriptionId },
        { 
          $set: {
            status: updatedStatus,
            tier: updatedTier,
            currentPeriodEnd: updatedPeriodEnd,
            trialEnd: updatedTrialEnd,
            updatedAt: new Date()
          }
        }
      );
    } else if (type === 'invoice.paid') {
      const stripeInvoiceId = data.id;
      const stripeCustomerId = data.customer;
      const amount = (data.amount_paid || 0) / 100;
      const currency = data.currency || 'usd';
      const receiptUrl = data.hosted_invoice_url || '';

      const sub = await subsCol.findOne({ stripeCustomerId });
      if (sub) {
        await invoicesCol.updateOne(
          { stripeInvoiceId },
          {
            $set: {
              _breederId: sub._breederId,
              stripeInvoiceId,
              amount,
              currency,
              status: 'paid',
              paidAt: new Date().toISOString(),
              receiptUrl,
              createdAt: new Date().toISOString()
            }
          },
          { upsert: true }
        );
      }
    } else if (type === 'invoice.payment_failed') {
      const stripeCustomerId = data.customer;
      await subsCol.updateOne(
        { stripeCustomerId },
        { $set: { status: 'past_due', updatedAt: new Date() } }
      );
    } else if (type === 'customer.subscription.deleted') {
      const stripeSubscriptionId = data.id;
      await subsCol.updateOne(
        { stripeSubscriptionId },
        { 
          $set: { 
            tier: 'basic', 
            status: 'cancelled', 
            stripeSubscriptionId: null,
            updatedAt: new Date() 
          } 
        }
      );
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
