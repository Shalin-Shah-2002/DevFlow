"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
}));
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);
// CORS Configuration
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
// Body Parser Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Basic Routes
app.get('/', (req, res) => {
    res.json({
        message: '🚀 DevFlow API Server',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
    });
});
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        database: 'connected', // TODO: Add actual DB health check
        timestamp: new Date().toISOString(),
    });
});
// Swagger API Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, swagger_1.swaggerUiOptions));
// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.swaggerSpec);
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
// TODO: Import and use additional routes as they are implemented
// import repoRoutes from './routes/repository.routes';
// import issueRoutes from './routes/issue.routes';
// app.use('/api/repositories', repoRoutes);
// app.use('/api/issues', issueRoutes);
// 404 Handler
app.use(error_middleware_1.notFoundHandler);
// Error Handler (must be last)
app.use(error_middleware_1.errorHandler);
// Start Server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║     🚀 DevFlow API Server Started    ║
╚═══════════════════════════════════════╝
  
  🌐 Server:      http://localhost:${PORT}
  📚 API Docs:    http://localhost:${PORT}/api-docs
  📋 Swagger JSON: http://localhost:${PORT}/api-docs.json
  🏥 Health:      http://localhost:${PORT}/api/health
  📝 Environment: ${process.env.NODE_ENV || 'development'}
  ⏰ Started at:  ${new Date().toLocaleString()}
  
  ✅ Authentication endpoints ready!
  
`);
});
exports.default = app;
