import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'product_reviews';

// Use globalThis to persist the client across Next.js hot reloads in dev
const globalForMongo = globalThis as unknown as {
  _mongoClient: MongoClient | undefined;
  _mongoDb: Db | undefined;
};

export async function getMongoDb(): Promise<Db> {
  if (globalForMongo._mongoDb) {
    return globalForMongo._mongoDb;
  }

  const client = globalForMongo._mongoClient ?? new MongoClient(uri);

  if (!globalForMongo._mongoClient) {
    await client.connect();
    globalForMongo._mongoClient = client;
  }

  const db = client.db(dbName);
  globalForMongo._mongoDb = db;

  return db;
}
