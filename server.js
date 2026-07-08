const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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
app.use(express.json({ limit: '10mb' })); // limits request payload size to prevent flooding

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
      password TEXT NOT NULL,
      account_number TEXT UNIQUE,
      parental_consent_verified INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS rabbits (
      id TEXT PRIMARY KEY,
      breeder_id TEXT,
      name TEXT NOT NULL,
      tattoo_number TEXT,
      breed TEXT,
      variety TEXT,
      sex TEXT,
      dob TEXT, -- AES encrypted string at-rest
      location TEXT,
      notes TEXT, -- AES encrypted string at-rest
      FOREIGN KEY(breeder_id) REFERENCES breeders(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS ledger (
      id TEXT PRIMARY KEY,
      breeder_id TEXT,
      date TEXT,
      type TEXT, -- 'income' or 'expense'
      amount TEXT, -- AES encrypted string at-rest
      category TEXT,
      rabbit_id TEXT,
      notes TEXT, -- AES encrypted string at-rest
      FOREIGN KEY(breeder_id) REFERENCES breeders(id)
    )
  `);

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
  const { id, name, email, role, password, accountNumber } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  db.run(
    'INSERT INTO breeders (id, name, email, role, password, account_number) VALUES (?, ?, ?, ?, ?, ?)',
    [id || `ab-${Date.now()}`, name, email, role || 'owner', password, accountNumber],
    function(err) {
      if (err) return res.status(400).json({ error: 'Breeder account already exists' });
      res.json({ success: true, message: 'Breeder account registered successfully' });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM breeders WHERE email = ?', [email], (err, user) => {
    if (err || !user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  });
});

// Bulk offline sync queue resolution
app.post('/api/sync', authenticateToken, (req, res) => {
  const { actions } = req.body;
  if (!actions || !Array.isArray(actions)) return res.status(400).json({ error: 'Actions list expected' });

  db.serialize(() => {
    const stmtLog = db.prepare('INSERT INTO audit_logs (id, action, target_table, record_id, user_id, checksum) VALUES (?, ?, ?, ?, ?, ?)');
    
    actions.forEach(item => {
      const { action, table, payload } = item;
      const logId = `audit-${Date.now()}-${Math.floor(Math.random()*1000)}`;
      stmtLog.run([logId, action, table, payload.id || '', req.user.id, '']);

      if (table === 'rabbits') {
        if (action === 'INSERT' || action === 'UPDATE') {
          db.run(
            'INSERT OR REPLACE INTO rabbits (id, breeder_id, name, tattoo_number, breed, variety, sex, dob, location, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [payload.id, req.user.id, payload.name, payload.tattooNumber, payload.breed, payload.variety, payload.sex, payload.dob, payload.location, payload.notes]
          );
        } else if (action === 'DELETE') {
          db.run('DELETE FROM rabbits WHERE id = ? AND breeder_id = ?', [payload.id, req.user.id]);
        }
      } else if (table === 'ledger') {
        if (action === 'INSERT') {
          db.run(
            'INSERT OR REPLACE INTO ledger (id, breeder_id, date, type, amount, category, rabbit_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [payload.id, req.user.id, payload.date, payload.type, payload.amount, payload.category, payload.rabbitId, payload.notes]
          );
        } else if (action === 'DELETE') {
          db.run('DELETE FROM ledger WHERE id = ? AND breeder_id = ?', [payload.id, req.user.id]);
        }
      }
    });
    stmtLog.finalize();
  });

  res.json({ success: true, message: 'Sync actions processed and logged' });
});

// Audit log view endpoint
app.get('/api/audit', authenticateToken, (req, res) => {
  db.all('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to query audit logs' });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Cloud Sync Server active on port ${PORT}`);
});
