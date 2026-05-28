const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Candidate routes
router.post('/', contactController.sendMessage);

// Admin / HR routes
router.get('/', authorizeRoles('admin', 'hr'), contactController.getMessages);
router.get('/unread-count', authorizeRoles('admin', 'hr'), contactController.getUnreadCount);
router.put('/:id/read', authorizeRoles('admin', 'hr'), contactController.markAsRead);
router.put('/:id/archive', authorizeRoles('admin', 'hr'), contactController.archiveMessage);

module.exports = router;
