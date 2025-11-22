import express from 'express';
import authRouter from './auth.routes';
import healthRouter from './health.routes';

const setupRoutes = (app: express.Application) => {
    app.use('/api/v1/auth', authRouter);
    app.use('/api/v1/health', healthRouter);
};

export default setupRoutes;
