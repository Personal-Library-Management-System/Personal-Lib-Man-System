import { Request, Response } from 'express';
import authService from '../services/auth.service';
import userService from '../services/user.service';
import tokenService from '../services/token.service';
import { JwtUserPayload } from '../types/auth.types';

const googleLoginController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ error: 'ID Token is required' });
    }

    const googleUserPayload = await authService.verifyGoogleIdToken(idToken);
    if (!googleUserPayload) {
        return res.status(400).json({ error: 'Invalid ID token' });
    }

    const user = await userService.getOrCreateUser(googleUserPayload);
    const jwtPayload: JwtUserPayload = {
        email: user.email,
        name: user.name,
        picture: user.picture,
    };
    const accessToken = tokenService.generateJwtToken(jwtPayload, '15Minutes');
    const refreshToken = tokenService.generateJwtToken(jwtPayload, '7Days');

    return res.status(200).json({
        accessToken,
        refreshToken,
    });
};

export { googleLoginController };




