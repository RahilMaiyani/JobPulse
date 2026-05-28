require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const migrate = async () => {
  try {
    await pool.query(`
      ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
    `);
    console.log("Migration successful");
  } catch (err) {
    console.error("Error migrating", err);
  } finally {
    pool.end();
  }
};

migrate();
