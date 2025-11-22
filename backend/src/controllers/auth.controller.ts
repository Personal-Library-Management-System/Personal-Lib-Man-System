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

    res.cookie('accessToken', accessToken, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 15 * 60 * 1000, 
        sameSite: 'strict', 
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        sameSite: 'strict',
        path: '/api/auth/refresh',
    });

    return res.status(200).json({ message: 'Authentication successful' });
};

const refreshTokenController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const refreshToken = req.cookies.refreshToken; 

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh Token not found' });
    }

    try {
        const decoded = tokenService.verifyJwtToken(refreshToken) as JwtUserPayload;

        const user = await userService.getUserByEmail(decoded.email); 
        if (!user) {
            return res.status(401).json({ error: 'User not found or invalid token' });
        }

        const jwtPayload: JwtUserPayload = {
            email: user.email,
            name: user.name,
            picture: user.picture,
        };

        const newAccessToken = tokenService.generateJwtToken(jwtPayload, '15Minutes');
        const newRefreshToken = tokenService.generateJwtToken(jwtPayload, '7Days'); // Genellikle yeni bir Refresh Token da verilir

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000,
            sameSite: 'strict',
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'strict',
            path: '/api/auth/refresh',
        });

        return res.status(200).json({ message: 'Tokens refreshed successfully' });

    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired Refresh Token' });
    }
};

export { googleLoginController, refreshTokenController };




