import { Router } from 'express';
import { googleLoginController } from '../controllers/auth.controller';

const authRouter = Router();

authRouter.post('/google', googleLoginController);

export default authRouter;
