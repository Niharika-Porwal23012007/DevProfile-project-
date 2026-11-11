import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/authRoutes';
import { syncRouter } from './routes/syncRoutes';
import { sessionRouter } from './routes/sessionRoutes';
import { dashboardRouter } from './routes/dashboardRoutes';
import { reviewRouter } from './routes/reviewRoutes';
import { plannerRouter } from './routes/plannerRoutes';
import { draftRouter } from './routes/draftRoutes';
import { portfolioRouter } from './routes/portfolioRoutes';
import { userRouter } from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';
import path from 'path';
import fs from 'fs';

export const app = express();

app.use(cors({
  origin: '*', // Allow frontend development origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-user']
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'DevProfile Backend API', timestamp: new Date().toISOString() });
});

// API Routes (matching Section 4 Specification)
app.use('/api', authRouter);
app.use('/api', syncRouter);
app.use('/api', sessionRouter);
app.use('/api', dashboardRouter);
app.use('/api', reviewRouter);
app.use('/api', plannerRouter);
app.use('/api', draftRouter);
app.use('/api', portfolioRouter);
app.use('/api', userRouter);

// Serve Frontend Static Build
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Standard Error Handler
app.use(errorHandler);
