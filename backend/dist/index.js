"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ─── Entry Point ───────────────────────────────────────────────────────────
// logger MUST be the first import so the console override applies project-wide
require("./config/logger");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const repository_routes_1 = __importDefault(require("./routes/repository.routes"));
const issue_routes_1 = __importDefault(require("./routes/issue.routes"));
const label_routes_1 = __importDefault(require("./routes/label.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const views_routes_1 = __importDefault(require("./routes/views.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const additional_routes_1 = __importDefault(require("./routes/additional.routes"));
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Swagger must be mounted BEFORE helmet to avoid CSP blocking its assets
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, swagger_1.swaggerUiOptions));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.swaggerSpec);
});
// Security Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            upgradeInsecureRequests: null, // disable — server runs on plain HTTP
        },
    },
}));
// CORS Configuration - Allow all origins in development
if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim());
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error(`CORS: origin ${origin} not allowed`));
            }
        },
        credentials: true,
    }));
}
else {
    app.use((0, cors_1.default)());
}
// Rate Limiting - Only in production
if (process.env.NODE_ENV === 'production') {
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 500, // Limit each IP to 500 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
    });
    app.use('/api/', limiter);
}
// Body Parser Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
// Basic Routes
app.get('/', (req, res) => {
    res.json({
        message: '🚀 DevFlow API Server',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
    });
});
// /api/health is handled by additionalRoutes (with real DB connectivity check)
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/repositories', repository_routes_1.default);
app.use('/api/issues', issue_routes_1.default);
app.use('/api/labels', label_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/views', views_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
// Additional Features: milestones, settings, activity-log, search, export, bulk-actions, teams, webhooks, health
app.use('/api', additional_routes_1.default);
// 404 Handler
app.use(error_middleware_1.notFoundHandler);
// Error Handler (must be last)
app.use(error_middleware_1.errorHandler);
// Start Server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║    n🚀 DevFlow API Server Started    ║
╚═══════════════════════════════════════╝
  
  🌐 Server:      http://localhost:${PORT}
  📚 API Docs:    http://localhost:${PORT}/api-docs
  📋 Swagger JSON: http://localhost:${PORT}/api-docs.json
  🏥 Health:      http://localhost:${PORT}/api/health
  📝 Environment: ${process.env.NODE_ENV || 'development'}
  ⏰ Started at:  ${new Date().toLocaleString()}
  
  ✅ Authentication endpoints ready!
  ✅ Repository endpoints ready!
  ✅ Issues endpoints ready! (12 endpoints)
  ✅ Labels endpoints ready! (6 endpoints)
  ✅ Categories endpoints ready! (6 endpoints)
  ✅ Views/Filters endpoints ready! (5 endpoints)
  ✅ Analytics endpoints ready! (6 endpoints)
  ✅ Notifications endpoints ready! (7 endpoints)
  ✅ Additional Features endpoints ready! (12 endpoints)
  
`);
});
exports.default = app;
