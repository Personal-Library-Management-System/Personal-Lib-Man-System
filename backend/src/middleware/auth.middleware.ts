// backend/src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import tokenService from '../services/token.service';
import { JwtUserPayload } from '../types/auth.types'; 
interface AuthenticatedRequest extends Request {
    user?: JwtUserPayload; 
}

const authMiddleware = (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized: Access Token missing' });
    }

    try {
        const decoded = tokenService.verifyJwtToken(accessToken) as JwtUserPayload;
        req.user = decoded; 
        next(); 

    } catch (error) {
        // Token süresi dolduysa (ExpiredSignatureError) veya hatalıysa
        // Burada token yenileme mekanizması devreye girmelidir.
        // Şimdilik sadece yetkisiz yanıtı dönelim.
        return res.status(403).json({ error: 'Forbidden: Invalid or expired Access Token' });
    }
};

export default authMiddleware;