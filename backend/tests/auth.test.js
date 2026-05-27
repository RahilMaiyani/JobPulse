const request = require('supertest');
const app = require('../src/server');
const userModel = require('../src/models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../src/models/userModel');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      userModel.getUserByEmail.mockResolvedValue(null);
      userModel.createUser.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'candidate'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User'
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.token).toBeDefined();
    });

    it('should fail if email is already registered', async () => {
      userModel.getUserByEmail.mockResolvedValue({ id: '1', email: 'test@example.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);
      
      userModel.getUserByEmail.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password_hash: passwordHash,
        is_active: true,
        role: 'candidate'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.token).toBeDefined();
    });

    it('should fail if user is inactive', async () => {
      userModel.getUserByEmail.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password_hash: 'hash',
        is_active: false,
        role: 'candidate'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('account is deactivated');
    });
  });
});
