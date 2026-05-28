const pool = require('../config/db');

const createMessage = async (userId, subject, message) => {
  const result = await pool.query(
    'INSERT INTO contact_messages (user_id, subject, message) VALUES ($1, $2, $3) RETURNING *',
    [userId, subject, message]
  );
  return result.rows[0];
};

const getAllMessages = async () => {
  const result = await pool.query(`
    SELECT cm.*, u.full_name as sender_name, u.email as sender_email, u.role as sender_role 
    FROM contact_messages cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.is_archived = FALSE
    ORDER BY cm.created_at DESC
  `);
  return result.rows;
};

const archiveMessage = async (id) => {
  const result = await pool.query(
    'UPDATE contact_messages SET is_archived = TRUE WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};

const markAsRead = async (id) => {
  const result = await pool.query(
    'UPDATE contact_messages SET is_read = TRUE WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};

const getUnreadCount = async () => {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM contact_messages WHERE is_read = FALSE AND is_archived = FALSE'
  );
  return parseInt(result.rows[0].count, 10);
};

module.exports = {
  createMessage,
  getAllMessages,
  archiveMessage,
  markAsRead,
  getUnreadCount
};
