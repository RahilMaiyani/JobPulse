const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/analyze', protect, authorize('candidate'), applicationController.analyzeApplication);
router.post('/submit', protect, authorize('candidate'), applicationController.submitApplication);
router.get('/my-applications', protect, authorize('candidate'), applicationController.getMyApplications);
router.get('/job/:jobId', protect, authorize('admin', 'hr'), applicationController.getJobApplications);
router.get('/user/:userId', protect, authorize('admin', 'hr'), applicationController.getUserApplicationsAdmin);
router.delete('/:id/revoke', protect, authorize('candidate'), applicationController.revokeApplication);
router.put('/:id/status', protect, authorize('admin', 'hr'), applicationController.updateApplicationStatus);
router.put('/job/:jobId/bulk-status', protect, authorize('admin', 'hr'), applicationController.bulkUpdateJobApplications);

module.exports = router;
