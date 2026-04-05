import express from 'express';
import { z } from 'zod';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { pool } from './config/db';
import { bootstrapDatabase } from './db/bootstrap';
import { sendError } from './utils/response';
import { AppError, ConflictError } from './utils/errors';

// Import Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import recordsRoutes from './routes/records.routes';
import dashboardRoutes from './routes/dashboard.routes';
import notificationRoutes from './routes/notification.routes';

dotenv.config({ quiet: true } as any);

const app = express();



const port = process.env.PORT || 4000;

// Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, 
  message: { status: 'error', message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5000, 
  message: { status: 'error', message: 'Too many login attempts, please try again later.' },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(globalLimiter);



// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', pool: pool.totalCount });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[CRITICAL CRASH]:', err);
  if (err.stack) console.error(err.stack);

  // Handle Zod Validation Errors
  if (err instanceof z.ZodError) {
    return sendError(res, 400, 'VALIDATION_ERROR', err.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '));
  }

  // Handle Postgres Unique Constraint Violation (23505)
  if (err.code === '23505') {
    return sendError(res, 409, 'CONFLICT_ERROR', 'A record with this information already exists');
  }

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message);
  }

  // Handle generic errors
  return sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
});

async function startServer() {
  try {
    // Initializing DB
    await bootstrapDatabase();
    
    app.listen(port, () => {
      console.log('----------------------------------------------------');
      console.log(`🚀 API: http://localhost:${port}/api`);
      console.log('----------------------------------------------------');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}


if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  startServer();
}

export default app;

