import jwt from 'jsonwebtoken';
import ms from 'ms';
import { JwtUserPayload } from '../types/auth.types';

type ExpiresIn = ms.StringValue | number;

const getJwtSecret = (): string => {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        console.error('Missing JWT secret. Exiting process.');
        process.exit(1);
    }
    return JWT_SECRET;
};

const generateJwtToken = (user: JwtUserPayload, expiresIn: ExpiresIn): string => {
    const JWT_SECRET = getJwtSecret();
    return jwt.sign(user, JWT_SECRET, { expiresIn });
};

const verifyJwtToken = (token: string): JwtUserPayload | null => {
    const JWT_SECRET = getJwtSecret();
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload;
        return decoded;
    } catch (error) {
        return null;
    }
};

const tokenService = {
    generateJwtToken,
    verifyJwtToken,
};

export default tokenService;
