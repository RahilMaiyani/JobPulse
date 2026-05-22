require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect().then(async () => {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        parsed_text TEXT,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS resume_id INT REFERENCES resumes(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS is_suspicious BOOLEAN DEFAULT FALSE;
    `);
    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    client.end();
  }
});
