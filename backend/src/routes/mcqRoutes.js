const express = require('express');
const router = express.Router();
const mcqController = require('../controllers/mcqController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get Quiz by Job ID (Admin/HR can manage, Candidate can fetch if authorized)
// Admin/HR Routes
router.get('/job/:jobId', protect, authorize('admin', 'hr'), mcqController.getQuizByJobId);
router.post('/job/:jobId', protect, authorize('admin', 'hr'), mcqController.createOrUpdateQuiz);
router.post('/job/:jobId/publish', protect, authorize('admin', 'hr'), mcqController.publishResults);
router.delete('/:quizId', protect, authorize('admin', 'hr'), mcqController.deleteQuiz);

// Candidate Routes
router.get('/application/:applicationId/test-info', protect, authorize('candidate'), mcqController.getCandidateTestInfo);
router.post('/application/:applicationId/start', protect, authorize('candidate'), mcqController.startCandidateTest);
router.post('/application/:applicationId/submit', protect, authorize('candidate'), mcqController.submitCandidateTest);

module.exports = router;