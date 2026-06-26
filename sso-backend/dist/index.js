"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const applications_1 = __importDefault(require("./routes/applications"));
const logs_1 = __importDefault(require("./routes/logs"));
const ba_logs_1 = __importDefault(require("./routes/ba-logs"));
const identity_sources_1 = __importDefault(require("./routes/identity-sources"));
const sso_1 = __importDefault(require("./routes/sso"));
const datax_routes_1 = __importDefault(require("./routes/datax.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Enable trust proxy if the system is behind a reverse proxy (e.g., Nginx)
app.set('trust proxy', true);
const port = process.env.PORT || 3000;
const corsOrigins = process.env.CORS_ORIGIN
    ? (process.env.CORS_ORIGIN.includes(',') ? process.env.CORS_ORIGIN.split(',') : process.env.CORS_ORIGIN)
    : '*';
app.use((0, cors_1.default)({
    origin: corsOrigins,
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Routes
app.use((req, res, next) => {
    console.log(`[DEBUG] Incoming Request: ${req.method} ${req.originalUrl} (url: ${req.url}, baseUrl: ${req.baseUrl})`);
    next();
});
app.use('/auth/saml', auth_1.default);
app.use('/admin/idp/saml', admin_1.default);
app.use('/api/applications', applications_1.default);
app.use('/admin/logs', logs_1.default);
app.use('/api/sso-logs', ba_logs_1.default);
app.use('/api/identity-sources', identity_sources_1.default);
app.use('/api', sso_1.default);
app.use('/api', datax_routes_1.default); // DataX API endpoints
// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', protocol: 'SAML SP Foundation' });
});
const server = app.listen(port, () => {
    console.log(`[Backend] SSO Portal Backend listening at http://localhost:${port}`);
});
// Explicitly keep the event loop alive
server.ref();
setInterval(() => { }, 1 << 30);
server.on('error', (err) => {
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
