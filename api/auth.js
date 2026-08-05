// POST /api/auth/register — Create a new breeder account
// POST /api/auth/login — Sign in an existing breeder
// GET  /api/auth/me — Get current user profile
import bcrypt from 'bcryptjs';
import { getDb } from '../_lib/mongodb.js';
import { generateToken, verifyAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = await getDb();
    const breeders = db.collection('breeders');

    // ============================================================
    // POST /api/auth — handles both register and login via "action"
    // ============================================================
    if (req.method === 'POST') {
      const { action, email, password, name, rabbitryName, phone, zip, state, isYouth } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      // ---- REGISTER ----
      if (action === 'register') {
        if (!name) {
          return res.status(400).json({ error: 'Name is required for registration.' });
        }
        if (password.length < 6) {
          return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        // Check if email already exists
        const existing = await breeders.findOne({ email: email.toLowerCase() });
        if (existing) {
          return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        // Hash password with bcrypt (10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        const newBreeder = {
          email: email.toLowerCase(),
          name,
          password: hashedPassword,
          rabbitryName: rabbitryName || '',
          phone: phone || '',
          zip: zip || '',
          state: state || '',
          role: 'owner',
          status: 'active',
          isYouth: isYouth || false,
          subscriptionTier: 'free',
          subscriptionLimit: 25,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await breeders.insertOne(newBreeder);
        const userId = result.insertedId.toString();

        const userProfile = { ...newBreeder, id: userId, _id: undefined, password: undefined };
        const token = generateToken({ _id: userId, email: newBreeder.email, role: newBreeder.role });

        return res.status(201).json({
          message: 'Account created successfully!',
          token,
          user: userProfile
        });
      }

      // ---- LOGIN ----
      const user = await breeders.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: 'Account not found. Please register.' });
      }

      // Compare password with bcrypt hash
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Incorrect password.' });
      }

      if (user.status === 'banned') {
        return res.status(403).json({ error: 'This account has been suspended.' });
      }

      // Update last login
      await breeders.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });

      const token = generateToken(user);
      const userProfile = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        rabbitryName: user.rabbitryName,
        phone: user.phone,
        zip: user.zip,
        state: user.state,
        role: user.role,
        status: user.status,
        isYouth: user.isYouth,
        isSuperAdmin: user.isSuperAdmin || false,
        subscriptionTier: user.subscriptionTier || 'free',
        subscriptionLimit: user.subscriptionLimit || 25,
        logo: user.logo,
        theme: user.theme
      };

      return res.status(200).json({ token, user: userProfile });
    }

    // ============================================================
    // GET /api/auth — Get current user profile
    // ============================================================
    if (req.method === 'GET') {
      const authUser = verifyAuth(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Not authenticated.' });
      }

      const { ObjectId } = await import('mongodb');
      let user;
      try {
        user = await breeders.findOne({ _id: new ObjectId(authUser.userId) });
      } catch {
        user = await breeders.findOne({ email: authUser.email });
      }

      if (!user) {
        return res.status(404).json({ error: 'User profile not found.' });
      }

      const userProfile = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        rabbitryName: user.rabbitryName,
        phone: user.phone,
        zip: user.zip,
        state: user.state,
        role: user.role,
        status: user.status,
        isYouth: user.isYouth,
        isSuperAdmin: user.isSuperAdmin || false,
        subscriptionTier: user.subscriptionTier || 'free',
        logo: user.logo,
        theme: user.theme
      };

      return res.status(200).json({ user: userProfile });
    }

    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (err) {
    console.error('[/api/auth] Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
