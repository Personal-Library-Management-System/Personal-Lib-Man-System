import { Request, Response } from 'express';
import authService from '../services/auth.service';
import userService from '../services/user.service';
import tokenService from '../services/token.service';
import { StatusCodes } from 'http-status-codes';
import {
    buildJwtPayload,
    generateTokens,
    setAuthCookies,
} from '../utils/auth.utils';

const googleLoginController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { idToken } = req.body;
    if (!idToken) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: 'ID Token is required' });
    }

    const googleUserPayload = await authService.verifyGoogleIdToken(idToken);
    if (!googleUserPayload) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: 'Invalid ID token' });
    }

    const user = await userService.getOrCreateUser(googleUserPayload);
    const jwtPayload = buildJwtPayload(user);
    const jwtTokens = generateTokens(jwtPayload);
    setAuthCookies(res, jwtTokens);

    return res
        .status(StatusCodes.OK)
        .json({ message: 'Authentication successful' });
};

const refreshTokenController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ error: 'Refresh token not provided' });
    }

    const decoded = tokenService.verifyJwtToken(refreshToken);
    if (!decoded) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ error: 'Invalid or expired refresh token' });
    }

    const user = await userService.getUserByEmail(decoded.email);
    if (!user) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .json({ error: 'User not found' });
    }

    const jwtPayload = buildJwtPayload(user);

    const jwtTokens = generateTokens(jwtPayload);
    setAuthCookies(res, jwtTokens);

    return res
        .status(StatusCodes.OK)
        .json({ message: 'Tokens refreshed successfully' });
};

const getUserProfileController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        // User is already attached to req by authMiddleware
        if (!req.user) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json({ error: 'User not authenticated' });
        }

        const user = await userService.getUserByEmail(req.user.email);
        if (!user) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ error: 'User not found' });
        }

        return res.status(StatusCodes.OK).json({
            user: {
                id: user._id,
                googleId: user.googleId,
                name: user.name,
                email: user.email,
                picture: user.picture,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: 'Failed to fetch user profile' });
    }
};

export { googleLoginController, refreshTokenController, getUserProfileController };
