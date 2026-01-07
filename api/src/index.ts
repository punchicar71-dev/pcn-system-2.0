import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Import routes
import vehicleRoutes from './routes/vehicle.routes';
import salesRoutes from './routes/sales.routes';
import userRoutes from './routes/user.routes';
import analyticsRoutes from './routes/analytics.routes';
import uploadRoutes from './routes/upload.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 4000;

// Middleware
// Configure helmet to allow cross-origin requests
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'PCN API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'PCN API Server',
    version: '2.0',
    status: 'running',
    endpoints: {
      health: '/health',
      documentation: '/api-docs',
      api: {
        vehicles: '/api/vehicles',
        sales: '/api/sales',
        users: '/api/users',
        analytics: '/api/analytics',
        upload: '/api/upload'
      }
    }
  });
});

// API Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'PCN API is running' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server - bind to 0.0.0.0 for Railway/Docker compatibility
const HOST = process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 PCN API Server running on ${HOST}:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server-level errors (e.g., port already in use)
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Free it or set PORT to a different value.`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

// Global process error handlers for better diagnostics in dev
process.on('unhandledRejection', (reason) => {
  console.error('🔴 Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🔴 Uncaught Exception:', err);
});

export default app;
