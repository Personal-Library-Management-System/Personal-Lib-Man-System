import { Request, Response, NextFunction } from 'express';
import tokenService from '../services/token.service';
import { StatusCodes } from 'http-status-codes';
import { generateTokens, setAuthCookies } from '../utils/auth.utils';
import User from '../models/user.model';

const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (
        !req.cookies ||
        (typeof req.cookies.accessToken !== 'string' &&
            typeof req.cookies.refreshToken !== 'string')
    ) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            error: 'Unauthorized: No valid tokens provided',
        });
    }
    const { accessToken, refreshToken } = req.cookies;

    let user = tokenService.verifyJwtToken(accessToken);
    if (!user && refreshToken) {
        user = tokenService.verifyJwtToken(refreshToken);
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Unauthorized: Both access and refresh tokens are invalid or expired',
            });
        }
        const jwtTokens = generateTokens(user);
        setAuthCookies(res, jwtTokens);
    }

    const userDoc = await User.findOne({ googleId: user!.id });
    if (!userDoc) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ error: 'User not found for given token' });
    }

    req.user = user!;
    req.userDoc = userDoc;
    return next();
};

export default authMiddleware;
