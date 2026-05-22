const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.getAllUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Authorization check: Candidate can only view their own profile
    if (req.user.role === 'candidate' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Not authorized to view this profile' });
    }

    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // TODO: fetch application history if candidate
    // For now, just return user
    res.json({ user, applications: [] });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updatedUser = await userModel.updateUserProfile(userId, req.body);
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new passwords are required' });
    }

    // Verify old password
    // We need to fetch full user including password_hash to verify
    const db = require('../config/db');
    const userResult = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const userHash = userResult.rows[0].password_hash;
    
    const isMatch = await bcrypt.compare(oldPassword, userHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect old password' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    
    await userModel.updateUserPassword(userId, newPasswordHash);
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

const adminCreateUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;
    
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await userModel.createUser({
      email,
      passwordHash,
      fullName,
      role
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    next(err);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = require('../config/db');
    
    // Toggle is_active
    const result = await db.query('UPDATE users SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING is_active', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isActive = result.rows[0].is_active;
    res.json({ message: `User ${isActive ? 'reactivated' : 'deactivated'} successfully`, is_active: isActive });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserProfile,
  updateProfile,
  resetPassword,
  adminCreateUser,
  toggleUserStatus
};
