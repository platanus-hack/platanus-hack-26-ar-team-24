import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/chatRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

export const createApp = (): Express => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.cors.origin }));
  app.use(morgan(config.isDevelopment ? 'dev' : 'combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/auth', authRoutes);
  app.use('/user', userRoutes);
  app.use('/profile', profileRoutes);
  app.use('/ai', aiRoutes);
  app.use('/match', matchingRoutes);
  app.use('/', healthRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
