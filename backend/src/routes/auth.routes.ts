import { Router } from 'express';
import { googleLoginController } from '../controllers/auth.controller';
import { refreshTokenController } from '../controllers/auth.controller';

const authRouter = Router();

authRouter.post('/google', googleLoginController);
authRouter.post('/refresh', refreshTokenController);

export default authRouter;
