const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public or logged-in candidate routes
router.get('/', authenticateToken, jobController.getAllJobs);
router.get('/:id', authenticateToken, jobController.getJobById);

// Protected routes for HR/Admin
router.post('/', authenticateToken, authorizeRoles('admin', 'hr'), jobController.createJob);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'hr'), jobController.updateJob);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'hr'), jobController.deleteJob);

module.exports = router;
