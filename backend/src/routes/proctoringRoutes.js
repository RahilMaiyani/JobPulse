const express = require('express');
const router = express.Router();
const proctoringController = require('../controllers/proctoringController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Route to handle proctoring event uploads
router.post('/events/application/:applicationId', authenticateToken, proctoringController.uploadProctoringEvent);

module.exports = router;
