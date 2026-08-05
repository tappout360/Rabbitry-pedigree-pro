// MongoDB Atlas Connection Pool (singleton)
// Vercel serverless functions reuse connections across warm invocations.
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'rabbitrypedigree';

if (!MONGODB_URI) {
  console.warn('[MongoDB] MONGODB_URI not set — database features will be unavailable.');
}

let cachedClient = null;
let cachedDb = null;

/**
 * Get a connected MongoDB client and database instance.
 * Reuses the connection across serverless invocations for performance.
 */
export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set. Configure it in Vercel dashboard.');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

/**
 * Get just the database instance (convenience shorthand).
 */
export async function getDb() {
  const { db } = await connectToDatabase();
  return db;
}
