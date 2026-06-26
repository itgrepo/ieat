/// <reference types="jest" />
import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';

const app = express();
app.use(express.json());
app.use('/auth/saml', authRoutes);

describe('SAML Auth Integration', () => {
  test('GET /auth/saml/:provider/metadata should return XML', async () => {
    const response = await request(app).get('/auth/saml/google-sso/metadata');
    
    expect(response.status).toBe(200);
    expect(response.type).toBe('application/xml');
    expect(response.text).toContain('EntityDescriptor');
  });

  test('GET /auth/saml/:provider/login should redirect to IdP', async () => {
    const response = await request(app).get('/auth/saml/google-sso/login');
    
    expect(response.status).toBe(302);
    expect(response.header.location).toContain('accounts.google.com');
  });
  
  test('POST /auth/saml/:provider/callback with invalid data should redirect with error', async () => {
    const response = await request(app)
      .post('/auth/saml/google-sso/callback')
      .send({ SAMLResponse: 'invalid-base64' });
    
    expect(response.status).toBe(302);
    expect(response.header.location).toContain('error=saml_failed');
  });
});
