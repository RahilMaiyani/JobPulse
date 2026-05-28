require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(255) NOT NULL CHECK (char_length(trim(subject)) >= 5),
        message TEXT NOT NULL CHECK (char_length(trim(message)) >= 10 AND char_length(trim(message)) <= 1000),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table contact_messages created successfully");
  } catch (err) {
    console.error("Error creating table", err);
  } finally {
    pool.end();
  }
};

createTable();
