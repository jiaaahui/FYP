/**
 * server/migrate_firestore_to_postgres.js
 *
 * Firestore -> PostgreSQL migration script (single-purpose, idempotent).
 * - Creates JSONB tables and upserts Firestore documents into Postgres.
 * - Uses a collection -> table mapping; maps Firestore "Order" -> Postgres "orders".
 * - Safe table-name sanitizer: lowercases and replaces non-alphanum with underscores.
 *
 * Usage:
 *  - npm install firebase-admin pg dotenv
 *  - Set environment variables (PowerShell example below):
 *      $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceAccountKey.json"
 *      $env:DATABASE_URL = "postgres://username:password@host:5432/dbname"
 *  - Run (all default collections):
 *      node server/migrate_firestore_to_postgres.js
 *  - Or migrate only specific collections:
 *      node server/migrate_firestore_to_postgres.js Order Product Building
 *
 * Notes:
 *  - The script stores the full Firestore document JSON in the `data` JSONB column.
 *  - It is safe to re-run (INSERT ... ON CONFLICT DO UPDATE).
 *  - If your password contains special characters (e.g. backslash), URL-encode them in DATABASE_URL.
 */

const admin = require('firebase-admin');
const { Pool } = require('pg');
require('dotenv').config();
const path = require('path');

const SERVICE_ACCOUNT = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '..', 'serviceAccountKey.json');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set. Example: postgres://user:pass@host:5432/dbname');
  process.exit(1);
}

// Initialize Firebase admin (fail fast if service account not found)
try {
  admin.initializeApp({
    credential: admin.credential.cert(require(SERVICE_ACCOUNT))
  });
} catch (err) {
  console.error('Failed to initialize firebase-admin. Make sure GOOGLE_APPLICATION_CREDENTIALS points to a valid service account JSON.');
  console.error(err);
  process.exit(1);
}

const firestore = admin.firestore();
const pool = new Pool({ connectionString: DATABASE_URL });

// Default collections to migrate
const DEFAULT_COLLECTIONS = [
  'Building',
  'Customer',
  'Employee',
  'EmployeeTeamAssignment',
  'LorryTrip',
  'Order',
  'OrderProduct',
  'Product',
  'Team',
  'TimeSlot',
  'Truck',
  'TruckZone',
  'Zone',
  'chats',
  'users',
  'RoutingCache'
];

// Map Firestore collection names to safe Postgres table names
const COLLECTION_TABLE_MAP = {
  // As requested: Firestore "Order" => Postgres "orders"
  'Order': 'orders',
  // add other custom mappings here if needed:
  // 'OrderProduct': 'order_product_json'
};

// Sanitize / compute safe table name for SQL identifiers
function safeTableNameForCollection(collectionName) {
  if (!collectionName) return collectionName;
  if (COLLECTION_TABLE_MAP[collectionName]) return COLLECTION_TABLE_MAP[collectionName];
  return collectionName.toLowerCase().replace(/[^a-z0-9_]/gi, '_');
}

// Convert Firestore Timestamp objects (and nested timestamps) to ISO strings recursively
function convertFirestoreTimestamps(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(convertFirestoreTimestamps);
  if (typeof obj === 'object') {
    // Firestore Timestamp detection (has toDate)
    if (typeof obj.toDate === 'function') {
      try {
        return obj.toDate().toISOString();
      } catch (e) {
        return obj;
      }
    }
    const out = {};
    for (const k of Object.keys(obj)) {
      out[k] = convertFirestoreTimestamps(obj[k]);
    }
    return out;
  }
  return obj;
}

// Create JSONB table if not exists. tableName must be a safe identifier (sanitized earlier).
async function createTableIfNotExists(client, tableName) {
  const safeName = tableName;
  const idxName = `idx_${safeName}_created_at`.replace(/[^a-z0-9_]/gi, '_');
  const sql = `
    CREATE TABLE IF NOT EXISTS ${safeName} (
      id TEXT PRIMARY KEY,
      data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS ${idxName} ON ${safeName} (created_at);
  `;
  await client.query(sql);
}

// Upsert documents in batches into a single safe table name
async function upsertDocuments(client, tableName, docs) {
  if (!docs || docs.length === 0) return;
  const safeName = tableName;

  try {
    await client.query('BEGIN');
    for (const doc of docs) {
      const id = doc.id;
      const data = convertFirestoreTimestamps(doc.data);
      const sql = `INSERT INTO ${safeName} (id, data) VALUES ($1, $2::jsonb)
                   ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, created_at = CURRENT_TIMESTAMP`;
      await client.query(sql, [id, data]);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

async function migrateCollection(collectionName, batchSize = 500) {
  console.log(`\nMigrating collection: ${collectionName}`);
  const client = await pool.connect();
  try {
    const sqlTableName = safeTableNameForCollection(collectionName);
    await createTableIfNotExists(client, sqlTableName);

    const colRef = firestore.collection(collectionName);
    let lastDoc = null;
    let total = 0;
    while (true) {
      let q = colRef.orderBy(admin.firestore.FieldPath.documentId()).limit(batchSize);
      if (lastDoc) q = q.startAfter(lastDoc);
      const snap = await q.get();
      if (snap.empty) break;
      const docs = [];
      snap.forEach(d => docs.push({ id: d.id, data: d.data() }));
      await upsertDocuments(client, sqlTableName, docs);
      total += docs.length;
      lastDoc = snap.docs[snap.docs.length - 1];
      console.log(`  Upserted ${total} documents into ${sqlTableName}...`);
      if (snap.size < batchSize) break;
    }
    console.log(`Completed collection ${collectionName}. Total documents migrated: ${total}`);
  } finally {
    client.release();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const collectionsToMigrate = args.length ? args : DEFAULT_COLLECTIONS;
  console.log('Collections to migrate:', collectionsToMigrate.join(', '));
  const start = Date.now();
  try {
    for (const col of collectionsToMigrate) {
      try {
        await migrateCollection(col, 500);
      } catch (err) {
        console.error(`Error migrating collection ${col}:`, err);
      }
    }
    const elapsed = (Date.now() - start) / 1000;
    console.log(`\nMigration finished in ${elapsed}s`);
  } catch (err) {
    console.error('Migration error', err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error', err);
  process.exit(1);
});