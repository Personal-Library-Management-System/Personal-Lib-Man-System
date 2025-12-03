import express from 'express';
import authRouter from './auth.routes';
import healthRouter from './health.routes';
import mediaItemRouter from './mediaItem.routes';
import authMiddleware from '../middleware/auth.middleware';

const setupRoutes = (app: express.Application) => {
    app.use('/api/v1/auth', authRouter);
    app.use('/api/v1/health', healthRouter);
    app.use('/api/v1/mediaItems', authMiddleware, mediaItemRouter);
};

export default setupRoutes;
