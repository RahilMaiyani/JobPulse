const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => {
  return client.query(`
    CREATE TABLE IF NOT EXISTS proctoring_events (
        id SERIAL PRIMARY KEY,
        application_id INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        quiz_id INT NOT NULL REFERENCES mcq_quizzes(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}).then(() => {
  console.log('Table created');
  process.exit(0);
}).catch(console.error);
