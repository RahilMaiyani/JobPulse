require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;`);
    console.log('Soft delete migration successful');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

migrate();
