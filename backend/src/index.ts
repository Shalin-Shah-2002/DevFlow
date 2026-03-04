// ─── Entry Point ───────────────────────────────────────────────────────────
// logger MUST be the first import so the console override applies project-wide
import './config/logger';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, swaggerUiOptions } from './config/swagger';
import authRoutes from './routes/auth.routes';
import repositoryRoutes from './routes/repository.routes';
import issueRoutes from './routes/issue.routes';
import labelRoutes from './routes/label.routes';
import categoryRoutes from './routes/category.routes';
import viewsRoutes from './routes/views.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationRoutes from './routes/notification.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import additionalRoutes from './routes/additional.routes';


// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 3001;

// Swagger must be mounted BEFORE helmet to avoid CSP blocking its assets
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        upgradeInsecureRequests: null, // disable — server runs on plain HTTP
      },
    },
  })
);

// CORS Configuration - Allow all origins in development
if (process.env.NODE_ENV === 'production') {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    })
  );
} else {
  app.use(cors());
}

// Rate Limiting - Only in production
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);
}

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Basic Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🚀 DevFlow API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// /api/health is handled by additionalRoutes (with real DB connectivity check)

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/views', viewsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Additional Features: milestones, settings, activity-log, search, export, bulk-actions, teams, webhooks, health
app.use('/api', additionalRoutes);

// 404 Handler
app.use(notFoundHandler);

// Error Handler (must be last)
app.use(errorHandler);

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

export default app;
