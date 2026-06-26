/// <reference types="jest" />
import request from 'supertest';
import express from 'express';
import baLogsRoutes from '../../src/routes/ba-logs';

const app = express();
app.use(express.json());
app.use('/api/sso-logs', baLogsRoutes);

describe('BA Logs Export API Integration', () => {
  const apiKey = 'IEAT-BA-LOG-ANALYTICS-2026';

  test('GET /api/sso-logs without API key should return 401', async () => {
    const response = await request(app).get('/api/sso-logs');
    expect(response.status).toBe(401);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('Unauthorized');
  });

  test('GET /api/sso-logs with invalid API key should return 401', async () => {
    const response = await request(app)
      .get('/api/sso-logs')
      .query({ apiKey: 'wrong-key-value' });
    expect(response.status).toBe(401);
  });

  test('GET /api/sso-logs with valid API key should return 200 and logs JSON', async () => {
    const response = await request(app)
      .get('/api/sso-logs')
      .set('x-api-key', apiKey);
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body).toHaveProperty('count');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('GET /api/sso-logs?format=csv should return CSV file', async () => {
    const response = await request(app)
      .get('/api/sso-logs')
      .query({ apiKey, format: 'csv' });
    
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toContain('text/csv');
    expect(response.header['content-disposition']).toContain('attachment');
    expect(response.header['content-disposition']).toContain('sso_logs_');
    expect(response.text).toContain('ID,Timestamp,Event,User ID,Username,IP Address,Details');
  });

  test('GET /api/sso-logs with username filter should return 200', async () => {
    const response = await request(app)
      .get('/api/sso-logs')
      .query({ apiKey, username: 'admin' });
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('GET /api/sso-logs with date filters should return 200', async () => {
    const response = await request(app)
      .get('/api/sso-logs')
      .query({ apiKey, startDate: '2026-05-01', endDate: '2026-06-30' });
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
