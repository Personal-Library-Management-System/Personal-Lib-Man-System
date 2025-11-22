// backend/src/routes/health.routes.ts

import express from 'express';
import healthController from '../controllers/health.controller';

const router = express.Router();

router.get('/health', healthController.healthCheckController); 

export default router;