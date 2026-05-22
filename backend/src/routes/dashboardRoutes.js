const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/admin', protect, authorize('admin', 'hr'), dashboardController.getAdminStats);
router.get('/candidate', protect, authorize('candidate'), dashboardController.getCandidateStats);

module.exports = router;
