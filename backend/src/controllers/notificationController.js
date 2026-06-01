const db = require('../config/db');

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );
    res.json({ notifications: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    await db.query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
    res.json({ message: "Marked as read" });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await db.query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};
