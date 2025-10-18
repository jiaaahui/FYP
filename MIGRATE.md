# Migration guide — Firestore to PostgreSQL

This guide explains how to run the provided migration script that copies Firestore documents into PostgreSQL JSONB tables.

Prerequisites
- Node.js installed (v16+ recommended)
- PostgreSQL database available and accessible
- Firebase service account JSON (download from Firebase Console)
- Project root contains `server/migrate_firestore_to_postgres.js` and `server/schema.sql`

Steps

1. Install dependencies
```bash
cd server
npm install firebase-admin pg dotenv axios
```

2. Prepare environment
- Place your Firebase service account JSON somewhere safe, e.g. `~/keys/serviceAccountKey.json`
- Set environment variables:
```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/keys/serviceAccountKey.json
export DATABASE_URL="postgres://user:pass@host:5432/FYP-Logistics"
```
On Windows (PowerShell):
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceAccountKey.json"
$env:DATABASE_URL = "postgres://user:pass@host:5432/FYP-Logistics"
```

3. (Optional) Initialize schema in Postgres
```bash
psql $DATABASE_URL -f server/schema.sql
```
The migrate script will also create tables if they do not exist.

4. Run the migration (all default collections)
```bash
node server/migrate_firestore_to_postgres.js
```

5. Run the migration for specific collections only:
```bash
node server/migrate_firestore_to_postgres.js Building Order Product
```

6. Verify
- Connect to your Postgres instance and run:
```sql
SELECT COUNT(*) FROM building;
SELECT data FROM "order" LIMIT 5;
```

7. Next steps
- Normalize data: create relational tables for Orders, OrderProducts, Products with proper columns and indexes.
- Update server API to use Postgres queries instead of Firestore.
- Update client services (informationService.js) to call the new API (if not already done).
- Add indexes on frequently queried fields (e.g., Date in timeslot, OrderStatus).

Troubleshooting
- Service account auth errors: ensure `GOOGLE_APPLICATION_CREDENTIALS` points to a valid JSON and has Firestore read permissions.
- Connection refused: confirm `DATABASE_URL` is correct and Postgres accepts connections from your IP.
- Large collections: lower batch size in the script or split migration by document ID ranges.

Security
- Never commit service account JSON or DATABASE_URL with credentials into Git.
- Use least privilege service accounts when possible.

If you want, I can:
- Produce a one-shot migration run that also normalizes `Order` and `OrderProduct` into relational tables and populates indexed columns (date, status, scheduled times).
- Create a small verification script that compares document counts between Firestore and Postgres for each collection.