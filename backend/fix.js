require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fix() {
  try {
    const res = await pool.query(`UPDATE mcq_results SET completed_at = NULL WHERE score = 0 AND passed = false AND started_at = completed_at;`);
    console.log('Fixed', res.rowCount, 'rows');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

fix();
