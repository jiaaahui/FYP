// test-pg.js
// Quick Postgres connection test using environment variable DATABASE_URL
// Usage: set $env:DATABASE_URL in PowerShell, then `node .\test-pg.js`

const { Client } = require('pg');

(async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('ERROR: DATABASE_URL not set in environment.');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query('SELECT NOW() AS now');
    console.log('Postgres connected - server time:', res.rows[0].now);
  } catch (err) {
    console.error('Postgres connection error:', err.message || err);
    process.exit(2);
  } finally {
    await client.end();
  }
})();