require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    await pool.query(`ALTER TABLE applications DROP CONSTRAINT IF EXISTS valid_status;`);
    await pool.query(`ALTER TABLE applications ADD CONSTRAINT valid_status CHECK (status IN ('applied', 'screening_passed', 'screening_failed', 'shortlisted', 'interview', 'selected', 'rejected', 'offer_sent'));`);
    await pool.query(`ALTER TABLE mcq_quizzes ADD COLUMN IF NOT EXISTS results_published BOOLEAN DEFAULT FALSE;`);
    console.log('Migration successful');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

migrate();
