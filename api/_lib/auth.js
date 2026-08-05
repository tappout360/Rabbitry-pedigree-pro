// Auth middleware for Vercel serverless functions
// Verifies JWT tokens and attaches user info to the request.
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rp-dev-secret-change-in-production';

/**
 * Verify a JWT token from the Authorization header.
 * Returns the decoded user payload or null.
 */
export function verifyAuth(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Generate a JWT token for a user.
 */
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id || user.id,
      email: user.email,
      role: user.role || 'owner'
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * Helper to send a 401 Unauthorized response.
 */
export function unauthorized(res) {
  return res.status(401).json({ error: 'Authentication required. Please log in.' });
}
