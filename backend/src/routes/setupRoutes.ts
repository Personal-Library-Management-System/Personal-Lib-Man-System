import express from 'express';
import authRouter from './auth.routes';
import healthRouter from './health.routes';
import mediaItemRouter from './mediaItem.routes';
import statsRouter from './stats.routes';
import authMiddleware from '../middleware/auth.middleware';
import mediaListRouter from './mediaList.routes';
import tagRouter from './tag.routes';
import libraryRouter from './library.routes';
import recommendationRouter from './recommendation.routes';

export const API_BASE = "/api/v1";

const setupRoutes = (app: express.Application) => {
    app.use(`${API_BASE}/auth`, authRouter);
    app.use(`${API_BASE}/health`, healthRouter);
    app.use(`${API_BASE}/mediaItems`, authMiddleware, mediaItemRouter);
    app.use(`${API_BASE}/mediaLists`, authMiddleware, mediaListRouter);
    app.use(`${API_BASE}/tags`, authMiddleware, tagRouter);
    app.use(`${API_BASE}/stats`, authMiddleware, statsRouter);
    app.use(`${API_BASE}/library`, authMiddleware, libraryRouter);
    app.use(`${API_BASE}/recommendations`, authMiddleware, recommendationRouter);
};

export default setupRoutes;
