import { Db, MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'mmb_workshop';

declare global {
  // eslint-disable-next-line no-var
  var __mmbMongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global.__mmbMongoClientPromise) {
    const client = new MongoClient(uri);
    global.__mmbMongoClientPromise = client.connect();
  }
  clientPromise = global.__mmbMongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

let indexesReady: Promise<void> | null = null;

async function ensureIndexes(db: Db): Promise<void> {
  if (indexesReady) return indexesReady;
  indexesReady = (async () => {
    await Promise.all([
      db.collection('jobs').createIndex({ jobNumber: 1 }, { unique: true }),
      db.collection('customers').createIndex({ phone: 1 }),
      db.collection('vehicles').createIndex({ licensePlate: 1 }),
      db.collection('staff').createIndex({ username: 1 }, { unique: true, sparse: true }),
      db.collection('parts_requisitions').createIndex({ requisitionNumber: 1 }, { unique: true }),
      db.collection('parts_requisitions').createIndex({ jobNumber: 1 }),
      db.collection('activity_logs').createIndex({ timestamp: -1 }),
      db.collection('app_settings').createIndex({ key: 1 }, { unique: true }),
    ]);
  })();
  return indexesReady;
}

export async function getMongoDb(): Promise<Db> {
  const client = await clientPromise;
  const db = client.db(dbName);
  await ensureIndexes(db);
  return db;
}
