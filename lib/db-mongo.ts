import { MongoClient, Db } from 'mongodb';

// Update this URI with your actual MongoDB connection string
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'product_reviews';

let client: MongoClient;
let db: Db;

export async function getMongoDb() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
  }
  return db;
}
