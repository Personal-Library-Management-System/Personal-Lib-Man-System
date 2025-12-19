import express from 'express';
import authRouter from './auth.routes';
import healthRouter from './health.routes';
import mediaItemRouter from './mediaItem.routes';
import statsRouter from './stats.routes';
import authMiddleware from '../middleware/auth.middleware';
import mediaListRouter from './mediaList.routes';
import tagRouter from './tag.routes';
import libraryRouter from './library.routes';

const setupRoutes = (app: express.Application) => {
    app.use('/api/v1/auth', authRouter);
    app.use('/api/v1/health', healthRouter);
    app.use('/api/v1/mediaItems', authMiddleware, mediaItemRouter);
    app.use('/api/v1/mediaLists', authMiddleware, mediaListRouter);
    app.use('/api/v1/tags', authMiddleware, tagRouter);
    app.use('/api/v1/stats', authMiddleware, statsRouter);
    app.use('/api/v1/library', authMiddleware, libraryRouter);
};

export default setupRoutes;
