import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import applicationRoutes from './routes/applications';
import logRoutes from './routes/logs';
import baLogsRoutes from './routes/ba-logs';
import identitySourceRoutes from './routes/identity-sources';
import ssoRoutes from './routes/sso';
import dataxRoutes from './routes/datax.routes';

dotenv.config();

const app = express();
// Enable trust proxy if the system is behind a reverse proxy (e.g., Nginx)
app.set('trust proxy', true);
const port = process.env.PORT || 3000;

const corsOrigins = process.env.CORS_ORIGIN
  ? (process.env.CORS_ORIGIN.includes(',') ? process.env.CORS_ORIGIN.split(',') : process.env.CORS_ORIGIN)
  : '*';

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use((req, res, next) => {
  console.log(`[DEBUG] Incoming Request: ${req.method} ${req.originalUrl} (url: ${req.url}, baseUrl: ${req.baseUrl})`);
  next();
});
app.use('/auth/saml', authRoutes);
app.use('/admin/idp/saml', adminRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/admin/logs', logRoutes);
app.use('/api/sso-logs', baLogsRoutes);
app.use('/api/identity-sources', identitySourceRoutes);
app.use('/api', ssoRoutes);
app.use('/api', dataxRoutes); // DataX API endpoints

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', protocol: 'SAML SP Foundation' });
});

const server = app.listen(port, () => {
  console.log(`[Backend] SSO Portal Backend listening at http://localhost:${port}`);
});

// Explicitly keep the event loop alive
server.ref();
setInterval(() => {}, 1 << 30);

server.on('error', (err: Error) => {
  console.error('[Backend] Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('[Backend] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Backend] Unhandled Rejection:', reason);
});

process.on('SIGTERM', () => {
  console.log('[Backend] SIGTERM received, shutting down gracefully...');
  server.close(() => process.exit(0));
});
