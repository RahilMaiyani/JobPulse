const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Candidate self-management
router.put('/profile', protect, userController.updateProfile);
router.put('/reset-password', protect, userController.resetPassword);

// Admin & HR reading users
router.get('/', protect, authorize('admin', 'hr'), userController.getAllUsers);
router.get('/:id/profile', protect, userController.getUserProfile);

// Admin creating and toggling users
router.post('/', protect, authorize('admin', 'hr'), userController.adminCreateUser);
router.patch('/:id/toggle-status', protect, authorize('admin'), userController.toggleUserStatus);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router;
