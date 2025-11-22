// backend/src/controllers/health.controller.ts

import { Request, Response } from 'express';
import healthService from '../services/health.service';

const healthCheckController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    let databaseStatus = 'error';

    try {
        const isDbConnected = await healthService.checkDatabaseConnection();
        databaseStatus = isDbConnected ? 'ok' : 'error';
    } catch (e) {
        databaseStatus = 'error';
    }

    const isOverallHealthy = databaseStatus === 'ok';

    const responsePayload = {
        status: isOverallHealthy ? 'ok' : 'degraded',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        database: databaseStatus, 
    };

    if (isOverallHealthy) {
        return res.status(200).json(responsePayload);
    } else {
        return res.status(503).json(responsePayload); 
    }
};

export default { healthCheckController };