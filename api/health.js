// GET /api/health — Health check endpoint
// Returns server status and database connectivity.
import { connectToDatabase } from './_lib/mongodb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });

    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (err) {
    return res.status(200).json({
      status: 'degraded',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
}
