/// <reference types="jest" />
import express from 'express';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import ssoRouter from '../../src/routes/sso';

// Mock AuditLogger to avoid database writes or console logs during tests
jest.mock('../../src/audit-logs/audit-logger', () => ({
  AuditLogger: {
    log: jest.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/api', ssoRouter);

const JWT_SECRET = process.env.JWT_SECRET || 'sso-portal-secret-key-12345';

describe('ValidateToken API Unit Tests', () => {
  let validToken: string;
  let expiredToken: string;

  beforeAll(() => {
    // Generate a valid JWT token
    validToken = jwt.sign(
      {
        userId: 'test_user_001',
        username: 'testuser',
        email: 'test@ieat.go.th',
        fullName: 'Test User',
        role: 'User',
        department: 'IT',
        applicationId: 'PMIS'
      },
      JWT_SECRET,
      { expiresIn: '5m' }
    );

    // Generate an expired JWT token
    expiredToken = jwt.sign(
      {
        userId: 'test_user_001',
        username: 'testuser',
        email: 'test@ieat.go.th',
        fullName: 'Test User',
        role: 'User',
        department: 'IT',
        applicationId: 'PMIS'
      },
      JWT_SECRET,
      { expiresIn: '-1s' } // Expired 1 second ago
    );
  });

  describe('Success Cases', () => {
    test('should validate token from Authorization header (Bearer)', async () => {
      const response = await supertest(app)
        .post('/api/validatetoken')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        valid: true,
        user: {
          id: 'test_user_001',
          username: 'testuser',
          email: 'test@ieat.go.th',
          fullName: 'Test User',
          role: 'User',
          department: 'IT'
        }
      });
    });

    test('should validate token from JSON body parameter', async () => {
      const response = await supertest(app)
        .post('/api/validatetoken')
        .send({ token: validToken });

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
      expect(response.body.user.username).toBe('testuser');
    });

    test('should validate token from Query parameters via GET', async () => {
      const response = await supertest(app)
        .get(`/api/validatetoken?token=${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
      expect(response.body.user.id).toBe('test_user_001');
    });

    test('should work on /api/sso/validatetoken route', async () => {
      const response = await supertest(app)
        .post('/api/sso/validatetoken')
        .send({ token: validToken });

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
    });
  });

  describe('Error Cases', () => {
    test('should return 400 Bad Request if token is missing', async () => {
      const response = await supertest(app)
        .post('/api/validatetoken')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        valid: false,
        error: 'Missing token parameter'
      });
    });

    test('should return 401 Unauthorized if token is expired', async () => {
      const response = await supertest(app)
        .post('/api/validatetoken')
        .send({ token: expiredToken });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        valid: false,
        error: 'Token expired, invalid or used'
      });
    });

    test('should return 401 Unauthorized if token is malformed/invalid', async () => {
      const response = await supertest(app)
        .post('/api/validatetoken')
        .send({ token: 'invalid.jwt.token' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        valid: false,
        error: 'Token expired, invalid or used'
      });
    });
  });
});
