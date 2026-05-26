const express = require('express');
const router = express.Router();
const { scheduleInterview, getInterviewsByJob, getInterviewByApplication } = require('../controllers/interviewController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/schedule', authorizeRoles('admin', 'hr'), scheduleInterview);
router.get('/job/:jobId', authorizeRoles('admin', 'hr'), getInterviewsByJob);
router.get('/application/:applicationId', getInterviewByApplication);

module.exports = router;
