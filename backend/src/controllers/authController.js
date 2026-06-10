const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const userModel = require('../models/userModel');
const jobModel = require('../models/jobModel');
const emailService = require('../services/emailService');

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().required(),
  // Role is explicitly removed here to prevent privilege escalation
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  force: Joi.boolean().optional()
});

const register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password, fullName } = req.body;

    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await userModel.createUser({ email, passwordHash, fullName, role: 'candidate' });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    try {
      const allJobs = await jobModel.getAllJobs();
      const activeJobs = allJobs.filter(j => j.status === 'active').slice(0, 3);
      await emailService.sendWelcomeEmail(newUser.email, newUser.full_name, activeJobs);
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
    }

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password, force } = req.body;

    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account is deactivated. Please contact an administrator.' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Concurrent Session Check
    if (user.session_token && user.session_expires_at) {
      const expiresAt = new Date(user.session_expires_at);
      if (expiresAt > new Date() && !force) {
        return res.status(409).json({
          warning: 'You are already logged in on another device. Logging in here will log you out of the other device.',
          hasActiveSession: true
        });
      }
    }

    const crypto = require('crypto');
    const newSessionToken = crypto.randomUUID();

    const db = require('../config/db');
    await db.query(
      `UPDATE users SET session_token = $1, session_expires_at = CURRENT_TIMESTAMP + interval '10 hours' WHERE id = $2`,
      [newSessionToken, user.id]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, sessionToken: newSessionToken },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    delete user.password_hash;

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await userModel.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('GetMe error:', error);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const db = require('../config/db');
    await db.query(
      `UPDATE users SET session_token = NULL, session_expires_at = NULL WHERE id = $1`,
      [req.user.id]
    );
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
