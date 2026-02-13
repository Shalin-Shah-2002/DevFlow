import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🚀 DevFlow API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    database: 'connected', // TODO: Add actual DB health check
    timestamp: new Date().toISOString(),
  });
});

// TODO: Import and use routes
// import authRoutes from './routes/auth.routes';
// import repoRoutes from './routes/repository.routes';
// import issueRoutes from './routes/issue.routes';
//
// app.use('/api/auth', authRoutes);
// app.use('/api/repositories', repoRoutes);
// app.use('/api/issues', issueRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║     🚀 DevFlow API Server Started    ║
╚═══════════════════════════════════════╝
  
  🌐 Server: http://localhost:${PORT}
  📝 Env: ${process.env.NODE_ENV || 'development'}
  ⏰ Time: ${new Date().toLocaleString()}
  
`);
});

export default app;
