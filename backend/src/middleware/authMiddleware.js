const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    try {
      const db = require('../config/db');
      const result = await db.query('SELECT id, email, role, is_active FROM users WHERE id = $1', [decodedUser.id]);
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User no longer exists' });
      }
      
      const user = result.rows[0];
      if (!user.is_active) {
        return res.status(401).json({ error: 'Your account is deactivated. Please contact an administrator.' });
      }
      
      req.user = user;
      next();
    } catch (dbErr) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  protect: authenticateToken,
  authorize: authorizeRoles
};

