import express from 'express';
import authRouter from './auth.routes';

const setupRoutes = (app: express.Application) => {
    app.use('/api/v1/auth', authRouter);
};

export default setupRoutes;
