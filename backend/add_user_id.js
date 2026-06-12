const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => {
  return client.query(`
    ALTER TABLE proctoring_events
    ADD COLUMN user_id INT REFERENCES users(id) ON DELETE CASCADE;
  `);
}).then(() => {
  console.log('Added user_id to proctoring_events');
  process.exit(0);
}).catch(console.error);
