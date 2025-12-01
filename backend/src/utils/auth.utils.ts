import { Response } from 'express';
import { JwtUserPayload } from '../types/auth.types';
import tokenService from '../services/token.service';

export const buildJwtPayload = (user: any): JwtUserPayload => ({
    id: user.googleId,
    email: user.email,
    name: user.name,
    picture: user.picture,
});

export const generateTokens = (payload: JwtUserPayload) => {
    const accessToken = tokenService.generateJwtToken(payload, '15Minutes');
    const refreshToken = tokenService.generateJwtToken(payload, '7Days');

    return { accessToken, refreshToken };
};

export const setAuthCookies = (
    res: Response,
    tokens: { accessToken: string; refreshToken: string }
) => {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: isProd,
        maxAge: 15 * 60 * 1000,
        sameSite: 'lax',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: isProd,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
        path: '/api/v1/auth/refresh',
    });
};
