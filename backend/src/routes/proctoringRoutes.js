const express = require('express');
const router = express.Router();
const proctoringController = require('../controllers/proctoringController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Route to handle proctoring event uploads
router.post('/events/application/:applicationId', authenticateToken, proctoringController.uploadProctoringEvent);

// Admin Routes for reviewing and forgiving proctoring events
router.get('/events/application/:applicationId', authenticateToken, proctoringController.getProctoringEventsForApplication);
router.post('/forgive/:applicationId', authenticateToken, proctoringController.forgiveProctoringViolations);

module.exports = router;
