import { Request, Response, NextFunction } from 'express';
import tokenService from '../services/token.service';
import { StatusCodes } from 'http-status-codes';
import { generateTokens, setAuthCookies } from '../utils/auth.utils';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { accessToken, refreshToken } = req.cookies;

    const user = accessToken ? tokenService.verifyJwtToken(accessToken) : null;
    if (user) {
        req.user = user;
        return next();
    }

    const refreshUser = refreshToken
        ? tokenService.verifyJwtToken(refreshToken)
        : null;

    if (!refreshUser) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            error: 'Unauthorized: Both access and refresh tokens are invalid or expired',
        });
    }

    const jwtTokens = generateTokens(refreshUser);
    setAuthCookies(res, jwtTokens);
    req.user = refreshUser;
    return next();
};

export default authMiddleware;
