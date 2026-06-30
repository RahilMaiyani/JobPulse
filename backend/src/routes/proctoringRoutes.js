const express = require('express');
const router = express.Router();
const proctoringController = require('../controllers/proctoringController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Route to handle proctoring event uploads
router.post('/events/application/:applicationId', authenticateToken, proctoringController.uploadProctoringEvent);

// Admin/HR Routes for reviewing and forgiving proctoring events
router.get('/events/application/:applicationId', authenticateToken, authorizeRoles('admin', 'hr'), proctoringController.getProctoringEventsForApplication);
router.post('/forgive/:applicationId', authenticateToken, authorizeRoles('admin', 'hr'), proctoringController.forgiveProctoringViolations);

module.exports = router;
