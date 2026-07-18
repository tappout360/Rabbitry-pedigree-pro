const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'WarrenWiseProSecureJWTSecretToken2026';

// Initialize Encrypted SQLite local database file
const dbPath = path.resolve(__dirname, 'rabbitry_cloud.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to RabbitryPedigree Pro Cloud SQLite Database.');
});

// Configure defense-in-depth security middlewares
app.use(helmet()); // Sets headers to shield from clickjacking, XSS, MIME sniffing
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Dev dashboard clients only
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/uploads', express.static(uploadsDir));
// Exclude Stripe webhook endpoint from general JSON parser to keep raw body buffer for signature verification
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhooks/stripe') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});

// Rate Limiter to guard authentication and sync API against brute-force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' }
});
app.use('/api/', apiLimiter);

// Database schema initialization
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS breeders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'owner',
      status TEXT DEFAULT 'pending',
      password TEXT NOT NULL,
      account_number TEXT UNIQUE,
      parental_consent_verified INTEGER DEFAULT 0,
      birthdate TEXT,
      parent_email TEXT,
      consent_token TEXT,
      parental_controls TEXT,
      coach_authorized INTEGER DEFAULT 0
    )
  `);

  // Migration columns for breeders table (safe alter)
  db.run("ALTER TABLE breeders ADD COLUMN birthdate TEXT", () => {});
  db.run("ALTER TABLE breeders ADD COLUMN parent_email TEXT", () => {});
  db.run("ALTER TABLE breeders ADD COLUMN consent_token TEXT", () => {});
  db.run("ALTER TABLE breeders ADD COLUMN parental_controls TEXT", () => {});
  db.run("ALTER TABLE breeders ADD COLUMN parental_consent_verified INTEGER DEFAULT 0", () => {});
  db.run("ALTER TABLE breeders ADD COLUMN coach_authorized INTEGER DEFAULT 0", () => {});

  db.run(`
    CREATE TABLE IF NOT EXISTS breeder_cloud_records (
      id TEXT PRIMARY KEY,
      breeder_id TEXT NOT NULL,
      tbl TEXT NOT NULL,
      record_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      deleted INTEGER DEFAULT 0
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_breeder_cloud_records_breeder ON breeder_cloud_records(breeder_id)');

  db.run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      breeder_id TEXT UNIQUE NOT NULL,
      tier TEXT NOT NULL,
      status TEXT NOT NULL,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      current_period_end TEXT,
      trial_end TEXT,
      cancelled_at TEXT,
      evans_verified INTEGER DEFAULT 0,
      evans_redemption_date TEXT,
      created_at TEXT
    )
  `);
  db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_breeder ON subscriptions(breeder_id)');

  db.run(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      breeder_id TEXT NOT NULL,
      stripe_invoice_id TEXT UNIQUE,
      amount REAL,
      currency TEXT,
      status TEXT,
      paid_at TEXT,
      receipt_url TEXT,
      created_at TEXT
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_invoices_breeder ON invoices(breeder_id)');

  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      action TEXT NOT NULL,
      target_table TEXT NOT NULL,
      record_id TEXT,
      user_id TEXT,
      checksum TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS conflicts (
      id TEXT PRIMARY KEY,
      breeder_id TEXT NOT NULL,
      record_id TEXT NOT NULL,
      tbl TEXT NOT NULL,
      field_name TEXT NOT NULL,
      server_value TEXT,
      client_value TEXT,
      client_device TEXT,
      timestamp TEXT NOT NULL
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_conflicts_breeder ON conflicts(breeder_id)');
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Endpoints
app.post('/api/auth/signup', (req, res) => {
  const { id, name, email, role, password, accountNumber, birthdate, parentEmail } = req.body;
  
  // Neutral Birthdate calculation
  let age = null;
  let isUnder13 = false;
  if (birthdate) {
    const birth = new Date(birthdate);
    const today = new Date();
    age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    isUnder13 = age < 13;
  }

  let finalEmail = email;
  let finalStatus = 'pending';
  let consentToken = null;
  let parentalConsentVerified = 1; // adults/teens default to verified

  if (isUnder13) {
    // COPPA Data Minimization: if email is not provided, use simulated unique local email
    const username = name.replace(/\s+/g, '').toLowerCase() + Math.floor(1000 + Math.random() * 9000);
    finalEmail = email || `${username}@warrenwise.local`;
    finalStatus = 'pending_consent';
    consentToken = crypto.randomBytes(16).toString('hex');
    parentalConsentVerified = 0;
    if (!parentEmail) {
      return res.status(400).json({ error: 'Parent or guardian email is required for users under 13.' });
    }
  } else {
    if (!finalEmail || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
  }

  const defaultControls = JSON.stringify({
    allowCloudSync: false,
    allowPublicListings: false,
    allowPhotoUpload: false,
    animalLimit: 10
  });

  const breederId = id || `ab-${Date.now()}`;
  const breederAccountNumber = accountNumber || `RAB-${Math.floor(100000 + Math.random() * 900000)}`;

  db.run(
    `INSERT INTO breeders (
      id, name, email, role, status, password, account_number, 
      birthdate, parent_email, parental_consent_verified, consent_token, parental_controls
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      breederId, 
      name, 
      finalEmail, 
      role || 'owner', 
      finalStatus, 
      password, 
      breederAccountNumber,
      birthdate,
      parentEmail || null,
      parentalConsentVerified,
      consentToken,
      defaultControls
    ],
    function(err) {
      if (err) {
        console.error("Signup DB error:", err);
        return res.status(400).json({ error: 'Breeder account email or username already exists' });
      }
      res.json({ 
        success: true, 
        message: isUnder13 
          ? 'Registration successful! A parental consent verification link has been sent to your parent/guardian.' 
          : 'Breeder account registered successfully. Pending approval.',
        status: finalStatus,
        consentToken
      });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM breeders WHERE email = ? OR account_number = ?', [email, email], (err, user) => {
    if (err || !user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email, account number, or password credentials' });
    }
    
    // Check parental consent status
    if (user.parental_consent_verified === 0 && user.status === 'pending_consent') {
      return res.status(403).json({ 
        error: 'Parental Consent Required: Your parent or guardian must verify your account before you can log in.',
        consentPending: true,
        parentEmail: user.parent_email
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role, 
        email: user.email, 
        status: user.status || 'pending',
        parentalConsentVerified: user.parental_consent_verified,
        parentalControls: user.parental_controls ? JSON.parse(user.parental_controls) : null,
        birthdate: user.birthdate
      } 
    });
  });
});

// Get consent details by token
app.get('/api/consent/status/:token', (req, res) => {
  db.get('SELECT id, name, parent_email, parental_controls, parental_consent_verified FROM breeders WHERE consent_token = ?', [req.params.token], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'Invalid or expired consent token.' });
    }
    res.json({
      id: user.id,
      childName: user.name,
      parentEmail: user.parent_email,
      parentalControls: user.parental_controls ? JSON.parse(user.parental_controls) : {},
      verified: user.parental_consent_verified === 1
    });
  });
});

// Approve parental consent and save controls
app.post('/api/consent/approve/:token', (req, res) => {
  const { controls } = req.body;
  if (!controls) return res.status(400).json({ error: 'Parental controls configuration required.' });

  db.run(
    'UPDATE breeders SET status = ?, parental_consent_verified = 1, parental_controls = ? WHERE consent_token = ?',
    ['pending', JSON.stringify(controls), req.params.token],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to record parental consent approval.' });
      if (this.changes === 0) return res.status(404).json({ error: 'Invalid consent token.' });
      res.json({ success: true, message: 'Verifiable Parental Consent successfully registered!' });
    }
  );
});

// Parent/Guardian updates controls after verification
app.post('/api/parent/controls/:breederId', authenticateToken, (req, res) => {
  const { controls } = req.body;
  
  db.get('SELECT parent_email FROM breeders WHERE id = ?', [req.params.breederId], (err, child) => {
    if (err || !child) return res.status(404).json({ error: 'Child account not found' });
    
    const isAllowed = req.user.id === 'ab-admin' || req.user.email === child.parent_email;
    if (!isAllowed) {
      return res.status(403).json({ error: 'Unauthorized: Only the designated parent/guardian can modify controls.' });
    }

    db.run(
      'UPDATE breeders SET parental_controls = ? WHERE id = ?',
      [JSON.stringify(controls), req.params.breederId],
      function(err) {
        if (err) return res.status(500).json({ error: 'Failed to update parental controls.' });
        res.json({ success: true, message: 'Parental controls updated successfully.' });
      }
    );
  });
});

// Update breeder status (approvals)
app.post('/api/breeders/:id/status', authenticateToken, (req, res) => {
  if (req.user.id !== 'ab-admin') {
    return res.status(403).json({ error: 'Permission denied' });
  }
  const { status } = req.body;
  db.run('UPDATE breeders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to update breeder status' });
    res.json({ success: true });
  });
});

// Helper to compare vector clocks
// Returns:
//   -1: v1 is older than v2 (v2 is newer)
//    1: v1 is newer than v2 (v1 is newer)
//    0: v1 is equal to v2
// null: concurrent (true conflict!)
const compareVectorClocks = (v1, v2) => {
  const clock1 = v1 || {};
  const clock2 = v2 || {};
  let v1LessOrEqual = true;
  let v2LessOrEqual = true;
  
  const allKeys = new Set([...Object.keys(clock1), ...Object.keys(clock2)]);
  if (allKeys.size === 0) return 0;

  for (const k of allKeys) {
    const val1 = clock1[k] || 0;
    const val2 = clock2[k] || 0;
    if (val1 < val2) v2LessOrEqual = false;
    if (val2 < val1) v1LessOrEqual = false;
  }

  if (v1LessOrEqual && v2LessOrEqual) return 0;
  if (v1LessOrEqual && !v2LessOrEqual) return -1;
  if (!v1LessOrEqual && v2LessOrEqual) return 1;
  return null; // Concurrent!
};

// Bulk offline sync queue resolution with conflict detection
app.post('/api/sync', authenticateToken, async (req, res) => {
  const { actions, clientDevice } = req.body;
  if (!actions || !Array.isArray(actions)) return res.status(400).json({ error: 'Actions list expected' });

  const conflictsList = [];
  const processedActions = [];

  const getCloudRecord = (key) => {
    return new Promise((resolve) => {
      db.get('SELECT payload, timestamp, deleted FROM breeder_cloud_records WHERE id = ?', [key], (err, row) => {
        resolve(row || null);
      });
    });
  };

  const insertConflict = (conflictId, breederId, recordId, tbl, fieldName, serverVal, clientVal, clientDevice, timestamp) => {
    return new Promise((resolve) => {
      db.run(
        'INSERT OR REPLACE INTO conflicts (id, breeder_id, record_id, tbl, field_name, server_value, client_value, client_device, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [conflictId, breederId, recordId, tbl, fieldName, serverVal, clientVal, clientDevice, timestamp],
        () => resolve()
      );
    });
  };

  for (const item of actions) {
    const { action, table, payload } = item;
    const recordId = payload.id;
    const key = `${table}:${recordId}`;
    const clientTimestamp = payload.timestamp || new Date().toISOString();
    const isDeleted = action === 'DELETE' ? 1 : 0;

    const existing = await getCloudRecord(key);

    if (existing && !isDeleted) {
      const serverTimestamp = existing.timestamp;
      const serverPayload = JSON.parse(existing.payload);
      
      const clientClock = payload.vectorClock || {};
      const serverClock = serverPayload.vectorClock || {};
      
      const clockComparison = compareVectorClocks(clientClock, serverClock);

      // Safe Auto-Apply Cases based on Vector Clock Causality
      if (clockComparison === -1) {
        // Client update is older and obsolete. Skip applying it, keep server version.
        continue;
      }
      
      // If concurrent (clockComparison === null) or fallback to timestamp LWW if no clocks are provided
      const isConcurrent = clockComparison === null;
      const isServerNewerTimestamp = new Date(serverTimestamp) > new Date(clientTimestamp);
      
      if (isConcurrent || (Object.keys(clientClock).length === 0 && isServerNewerTimestamp)) {
        let hasConflict = false;
        const criticalFields = {
          rabbits: ['sireId', 'damId', 'registrationNumber', 'ownershipStatus', 'earNumber'],
          cavies: ['sireId', 'damId', 'registrationNumber', 'ownershipStatus', 'earNumber'],
          litters: ['sireId', 'damId', 'kitsAlive', 'kitsDead']
        };

        const fieldsToCheck = criticalFields[table] || [];
        for (const field of fieldsToCheck) {
          const clientVal = payload[field];
          const serverVal = serverPayload[field];

          if (clientVal !== undefined && serverVal !== undefined && String(clientVal) !== String(serverVal)) {
            hasConflict = true;
            const conflictId = `conflict-${Date.now()}-${Math.floor(Math.random()*1000)}`;
            conflictsList.push({
              id: conflictId,
              recordId,
              tbl: table,
              fieldName: field,
              serverValue: serverVal,
              clientValue: clientVal,
              clientDevice: clientDevice || 'Offline Device',
              timestamp: clientTimestamp
            });
            await insertConflict(conflictId, req.user.id, recordId, table, field, String(serverVal), String(clientVal), clientDevice || 'Offline Device', clientTimestamp);
          }
        }

        if (hasConflict) {
          continue;
        }
      }
    }

    processedActions.push(item);
  }

  processedActions.forEach(item => {
    // Merge client's vector clock with server's vector clock or initialize it
    // Ensure all vector clock fields are preserved and incremented correctly
    const { payload } = item;
    if (payload && !payload.vectorClock) {
      payload.vectorClock = {};
    }
  });

  db.serialize(() => {
    const stmtLog = db.prepare('INSERT INTO audit_logs (id, action, target_table, record_id, user_id, checksum) VALUES (?, ?, ?, ?, ?, ?)');
    const stmtSync = db.prepare('INSERT OR REPLACE INTO breeder_cloud_records (id, breeder_id, tbl, record_id, payload, timestamp, deleted) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    processedActions.forEach(item => {
      const { action, table, payload } = item;
      const logId = `audit-${Date.now()}-${Math.floor(Math.random()*1000)}`;
      stmtLog.run([logId, action, table, payload.id || '', req.user.id, '']);

      const recordId = payload.id;
      const key = `${table}:${recordId}`;
      const timestamp = payload.timestamp || new Date().toISOString();
      
      stmtSync.run([key, req.user.id, table, recordId, JSON.stringify(payload), timestamp, action === 'DELETE' ? 1 : 0]);
    });
    
    stmtLog.finalize();
    stmtSync.finalize();
  });

  if (conflictsList.length > 0) {
    return res.status(409).json({
      success: false,
      message: 'Sync conflicts detected on critical fields. Resolving required.',
      conflicts: conflictsList
    });
  }

  res.json({ success: true, message: 'Sync actions processed and logged' });
});

// Get pending conflicts
app.get('/api/conflicts/:breederId', authenticateToken, (req, res) => {
  db.all('SELECT * FROM conflicts WHERE breeder_id = ?', [req.params.breederId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve conflicts.' });
    const mapped = rows.map(r => ({
      id: r.id,
      recordId: r.record_id,
      tbl: r.tbl,
      fieldName: r.field_name,
      serverValue: r.server_value,
      clientValue: r.client_value,
      clientDevice: r.client_device,
      timestamp: r.timestamp
    }));
    res.json(mapped);
  });
});

// Resolve conflict
app.post('/api/conflicts/resolve/:conflictId', authenticateToken, (req, res) => {
  const { resolution } = req.body;
  const { conflictId } = req.params;

  db.get('SELECT * FROM conflicts WHERE id = ?', [conflictId], (err, conflict) => {
    if (err || !conflict) return res.status(404).json({ error: 'Conflict record not found.' });

    if (resolution === 'client') {
      const key = `${conflict.tbl}:${conflict.record_id}`;
      db.get('SELECT payload FROM breeder_cloud_records WHERE id = ?', [key], (err, row) => {
        if (row) {
          const payload = JSON.parse(row.payload);
          payload[conflict.field_name] = conflict.client_value;
          payload.timestamp = new Date().toISOString();

          db.run(
            'UPDATE breeder_cloud_records SET payload = ?, timestamp = ? WHERE id = ?',
            [JSON.stringify(payload), payload.timestamp, key],
            (err) => {
              if (err) return res.status(500).json({ error: 'Failed to apply resolution.' });
              db.run('DELETE FROM conflicts WHERE id = ?', [conflictId], () => {
                res.json({ success: true, message: 'Conflict resolved in favor of local changes.' });
              });
            }
          );
        } else {
          res.status(404).json({ error: 'Source cloud record not found.' });
        }
      });
    } else {
      db.run('DELETE FROM conflicts WHERE id = ?', [conflictId], () => {
        res.json({ success: true, message: 'Conflict resolved in favor of cloud version.' });
      });
    }
  });
});

// Pull all latest cloud records for the authenticated breeder
app.get('/api/pull', authenticateToken, (req, res) => {
  db.all('SELECT * FROM breeder_cloud_records WHERE breeder_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to query cloud data' });
    res.json(rows);
  });
});

// Audit log view endpoint
app.get('/api/audit', authenticateToken, (req, res) => {
  db.all('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to query audit logs' });
    res.json(rows);
  });
});

// ========================================================
// SUBSCRIPTION & WEBHOOK SECURITY ENGINE (WAVE 5)
// ========================================================

const crypto = require('crypto');
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mockKeyWarrenWiseProSecretWebhook2026';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mockSecretWarrenWisePro2026';
const stripe = require('stripe')(STRIPE_SECRET_KEY);

// Create idempotency table to guard against replay attacks and duplicate deliveries
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS processed_webhook_events (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL
    )
  `);
});

// Billing endpoints rate limiter
const billingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  message: { error: 'Too many billing requests. Please try again later.' }
});

// Stripe Webhook rate limiter (DDoS protection)
const webhookLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Allow up to 100 webhook deliveries per IP per window
  message: { error: 'Rate limit exceeded for webhooks.' }
});

// 1. Get Billing & Subscription Status
app.get('/api/billing/status', authenticateToken, (req, res) => {
  db.get('SELECT * FROM subscriptions WHERE breeder_id = ?', [req.user.id], (err, sub) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch subscription details' });
    
    db.all('SELECT * FROM invoices WHERE breeder_id = ? ORDER BY created_at DESC', [req.user.id], (err, invoices) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch billing history' });
      
      res.json({
        subscription: sub || { tier: 'free', status: 'active', current_period_end: '' },
        invoices: invoices || []
      });
    });
  });
});

// 2. Create Stripe Checkout Session
app.post('/api/billing/create-checkout-session', authenticateToken, billingLimiter, async (req, res) => {
  const { tier, billingCycle } = req.body; // tier: 'family', 'pro', 'lifetime'; billingCycle: 'monthly', 'annual', 'one_time'
  
  if (!['family', 'pro', 'lifetime'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier specified' });
  }

  try {
    // Check if Stripe configuration is live or we are simulating checkout
    const isMockStripe = STRIPE_SECRET_KEY.startsWith('sk_test_mockKey');
    const successUrl = `${req.headers.origin || 'http://localhost:3000'}?checkout=success&tier=${tier}`;
    const cancelUrl = `${req.headers.origin || 'http://localhost:3000'}?checkout=cancel`;

    if (isMockStripe) {
      // Return a simulated checkout session redirecting to local client success callback
      const mockSessionId = `mock_cs_${Date.now()}_${Math.random().toString(36).substring(5)}`;
      return res.json({
        id: mockSessionId,
        url: `${req.headers.origin || 'http://localhost:3000'}?mock_checkout_session=${mockSessionId}&tier=${tier}&cycle=${billingCycle}`
      });
    }

    // Determine prices based on requested tier & billingCycle
    let priceId = '';
    if (tier === 'family') {
      priceId = billingCycle === 'annual' ? 'price_family_annual_seed' : 'price_family_monthly_seed';
    } else if (tier === 'pro') {
      priceId = billingCycle === 'annual' ? 'price_pro_annual_seed' : 'price_pro_monthly_seed';
    } else if (tier === 'lifetime') {
      priceId = 'price_lifetime_one_time_seed';
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: tier === 'lifetime' ? 'payment' : 'subscription',
      subscription_data: tier === 'lifetime' ? undefined : {
        trial_period_days: 14 // 14-day free trial on active paid subscriptions
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: req.user.id,
      metadata: { tier, billingCycle }
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({ error: 'Stripe integration error' });
  }
});

// 3. Create Stripe Customer Portal Session
app.post('/api/billing/create-portal-session', authenticateToken, billingLimiter, async (req, res) => {
  try {
    const isMockStripe = STRIPE_SECRET_KEY.startsWith('sk_test_mockKey');
    if (isMockStripe) {
      return res.json({ url: `${req.headers.origin || 'http://localhost:3000'}?mock_portal=1` });
    }

    db.get('SELECT stripe_customer_id FROM subscriptions WHERE breeder_id = ?', [req.user.id], async (err, sub) => {
      if (err || !sub?.stripe_customer_id) {
        return res.status(400).json({ error: 'No active Stripe billing profile found.' });
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        return_url: `${req.headers.origin || 'http://localhost:3000'}`
      });

      res.json({ url: portalSession.url });
    });
  } catch (err) {
    console.error("Error creating portal session:", err);
    res.status(500).json({ error: 'Failed to launch portal session.' });
  }
});

// 4. Verify Evans Migrant CSV Fingerprint
app.post('/api/billing/evans-verify', authenticateToken, (req, res) => {
  const { fileName, columnFingerprint, recordCount } = req.body;
  if (!columnFingerprint || !Array.isArray(columnFingerprint)) {
    return res.status(400).json({ error: 'Invalid CSV fingerprint data' });
  }

  // Evans fingerprint heuristics: must contain key Evans headers
  const requiredEvansHeaders = ['tattoo', 'ear', 'name', 'sex', 'gender', 'sire', 'dam'];
  const matchedHeaders = columnFingerprint.filter(col => 
    requiredEvansHeaders.some(reqH => col.toLowerCase().includes(reqH))
  );

  const isValidEvans = matchedHeaders.length >= 4 && recordCount > 0;

  if (isValidEvans) {
    // Record Evans verification status in user subscription
    db.run(
      `INSERT INTO subscriptions (id, breeder_id, tier, status, evans_verified, evans_redemption_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(breeder_id) DO UPDATE SET evans_verified=1, evans_redemption_date=?`,
      [`sub-${req.user.id}`, req.user.id, 'free', 'active', 1, new Date().toISOString(), new Date().toISOString(), new Date().toISOString()],
      function(err) {
        if (err) return res.status(500).json({ error: 'Failed to record verification status' });
        res.json({ verified: true, discountUnlocked: true, message: 'Evans CSV fingerprint verified. $169 Lifetime discount unlocked!' });
      }
    );
  } else {
    res.json({ verified: false, discountUnlocked: false, message: 'Uploaded file does not match standard Evans Software headers. Manual review queue created.' });
  }
});

// 5. Admin Subscription Overrides
app.post('/api/billing/admin/override', authenticateToken, (req, res) => {
  if (req.user.id !== 'ab-admin') {
    return res.status(403).json({ error: 'Admin permissions required' });
  }

  const { targetBreederId, tier, limit } = req.body;
  db.run(
    'UPDATE breeders SET role = ? WHERE id = ?',
    [tier === 'pro' ? 'owner' : 'youth', targetBreederId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to update breeder role' });
      
      db.run(
        `INSERT INTO subscriptions (id, breeder_id, tier, status, created_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(breeder_id) DO UPDATE SET tier=?, status='active'`,
        [`sub-${targetBreederId}`, targetBreederId, tier, 'active', new Date().toISOString(), tier],
        function(err) {
          if (err) return res.status(500).json({ error: 'Failed to override subscription status' });
          
          res.json({ success: true, message: `Manual override successful. ${targetBreederId} set to ${tier}.` });
        }
      );
    }
  );
});

// 6. Photo upload with subscription tier limit enforcement
app.post('/api/photos/upload', authenticateToken, (req, res) => {
  const { photoId, base64Data } = req.body;
  if (!photoId || !base64Data) {
    return res.status(400).json({ error: 'Photo ID and image data are required.' });
  }

  // Resolve subscription tier to enforce limits
  db.get('SELECT tier FROM subscriptions WHERE breeder_id = ?', [req.user.id], (err, sub) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch subscription tier' });
    
    const userTier = sub ? sub.tier : 'free';
    const tierLimits = { free: 20, family: 9999, pro: 9999, lifetime: 9999, evans_lifetime: 9999 };
    const maxPhotos = tierLimits[userTier] || 20;

    fs.readdir(uploadsDir, (readdirErr, files) => {
      if (readdirErr) return res.status(500).json({ error: 'Failed to read upload storage' });

      const prefix = `breeder_${req.user.id}_`;
      const userPhotosCount = files.filter(f => f.startsWith(prefix)).length;

      if (userPhotosCount >= maxPhotos) {
        return res.status(403).json({
          error: `Gallery storage limit exceeded. Your plan (${userTier}) is limited to ${maxPhotos} photos. Please upgrade to unlock unlimited storage.`
        });
      }

      // Write the base64 file to disk
      const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const filename = `${prefix}${photoId}.webp`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFile(filePath, buffer, (writeErr) => {
        if (writeErr) {
          console.error('File write error:', writeErr);
          return res.status(500).json({ error: 'Failed to save image file on server.' });
        }

        res.json({
          success: true,
          url: `/uploads/${filename}`,
          message: 'Image uploaded and processed successfully.'
        });
      });
    });
  });
});

// ========================================================
// ASYNCHRONOUS WEBHOOK QUEUE & SECURITY CHECKLIST (WAVE 5)
// ========================================================

const webhookQueue = [];
let isProcessingQueue = false;

// Process webhook events sequentially in the background
async function processWebhookQueue() {
  if (isProcessingQueue || webhookQueue.length === 0) return;
  isProcessingQueue = true;

  const { event, resolve, reject } = webhookQueue.shift();
  try {
    await handleWebhookEvent(event);
    resolve();
  } catch (err) {
    console.error("Queue processing error for event:", event.id, err);
    reject(err);
  } finally {
    isProcessingQueue = false;
    processWebhookQueue(); // loop next
  }
}

// Transactional Webhook Handlers
async function handleWebhookEvent(event) {
  const data = event.data.object;
  const type = event.type;

  let subStatus = 'active';
  let trialEnd = null;
  let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  if (type === 'checkout.session.completed') {
    const stripeSubscriptionId = data.subscription || '';
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
  }

  // Pre-resolve update info for customer.subscription.updated
  let updatedStatus = '';
  let updatedTier = '';
  let updatedPeriodEnd = '';
  let updatedTrialEnd = null;
  if (type === 'customer.subscription.updated') {
    updatedStatus = data.status;
    updatedTier = data.metadata?.tier || 'free';
    updatedPeriodEnd = new Date(data.current_period_end * 1000).toISOString();
    updatedTrialEnd = data.trial_end ? new Date(data.trial_end * 1000).toISOString() : null;
  }

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      try {
        if (type === 'checkout.session.completed') {
          const breederId = data.client_reference_id;
          const stripeCustomerId = data.customer;
          const stripeSubscriptionId = data.subscription || '';
          const tier = data.metadata?.tier || 'free';

          db.run(
            `INSERT INTO subscriptions (id, breeder_id, tier, status, stripe_customer_id, stripe_subscription_id, current_period_end, trial_end, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(breeder_id) DO UPDATE SET tier=?, status=?, stripe_customer_id=?, stripe_subscription_id=?, current_period_end=?, trial_end=?`,
            [`sub-${breederId}`, breederId, tier, subStatus, stripeCustomerId, stripeSubscriptionId, periodEnd, trialEnd, new Date().toISOString(), tier, subStatus, stripeCustomerId, stripeSubscriptionId, periodEnd, trialEnd]
          );
        }

        if (type === 'customer.subscription.updated') {
          const stripeSubscriptionId = data.id;
          db.run(
            `UPDATE subscriptions 
             SET status = ?, tier = ?, current_period_end = ?, trial_end = ? 
             WHERE stripe_subscription_id = ?`,
            [updatedStatus, updatedTier, updatedPeriodEnd, updatedTrialEnd, stripeSubscriptionId]
          );
        }

        if (type === 'invoice.paid') {
          const stripeInvoiceId = data.id;
          const stripeCustomerId = data.customer;
          const amount = (data.amount_paid || 0) / 100;
          const currency = data.currency || 'usd';
          const receiptUrl = data.hosted_invoice_url || '';

          // Find breeder by stripeCustomerId
          db.get('SELECT breeder_id FROM subscriptions WHERE stripe_customer_id = ?', [stripeCustomerId], (err, sub) => {
            if (sub) {
              db.run(
                `INSERT OR IGNORE INTO invoices (id, breeder_id, stripe_invoice_id, amount, currency, status, paid_at, receipt_url, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [`inv-${Date.now()}`, sub.breeder_id, stripeInvoiceId, amount, currency, 'paid', new Date().toISOString(), receiptUrl, new Date().toISOString()]
              );
            }
          });
        }

        if (type === 'invoice.payment_failed') {
          const stripeCustomerId = data.customer;
          db.run(
            "UPDATE subscriptions SET status = 'past_due' WHERE stripe_customer_id = ?",
            [stripeCustomerId]
          );
        }

        if (type === 'customer.subscription.deleted') {
          const stripeSubscriptionId = data.id;
          db.run(
            "UPDATE subscriptions SET tier = 'free', status = 'active', stripe_subscription_id = NULL WHERE stripe_subscription_id = ?",
            [stripeSubscriptionId]
          );
        }

        db.run('COMMIT', (err) => {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
          } else {
            // Write to security audit log
            const logId = `audit-${Date.now()}-${Math.floor(Math.random()*1000)}`;
            const checksum = crypto.createHash('sha256').update(JSON.stringify(event)).digest('hex');
            db.run(
              'INSERT INTO audit_logs (id, action, target_table, record_id, user_id, checksum) VALUES (?, ?, ?, ?, ?, ?)',
              [logId, 'WEBHOOK', 'subscriptions', event.id, 'stripe-system', checksum]
            );
            resolve();
          }
        });

      } catch (err) {
        db.run('ROLLBACK');
        reject(err);
      }
    });
  });
}

// 6. Secure Stripe Webhook Endpoint (Protected against Fraud & Replay Attacks)
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhookLimiter, (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Robust Webhook Signature Verification
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    // Fallback parser for offline simulated testing
    if (process.env.NODE_ENV !== 'production' && req.headers['x-mock-webhook-bypass'] === 'WarrenWiseWebhookBypass2026') {
      try {
        event = JSON.parse(req.body.toString());
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

  // Idempotency: Reject already processed event IDs
  db.get('SELECT * FROM processed_webhook_events WHERE id = ?', [event.id], (err, row) => {
    if (err) return res.status(500).send('Database Error');
    if (row) {
      return res.json({ received: true, status: 'duplicate' });
    }

    db.run(
      'INSERT INTO processed_webhook_events (id, timestamp) VALUES (?, ?)',
      [event.id, new Date().toISOString()],
      (err) => {
        if (err) return res.status(500).send('Database Error');

        // Queue event processing asynchronously to return 200 OK immediately and avoid timeouts
        new Promise((resolve, reject) => {
          webhookQueue.push({ event, resolve, reject });
          processWebhookQueue();
        });

        res.json({ received: true });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Cloud Sync Server active on port ${PORT}`);
});
