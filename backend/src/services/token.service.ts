import jwt from 'jsonwebtoken';
import ms from 'ms';
import { JwtUserPayload } from '../types/auth.types';

type ExpiresIn = ms.StringValue | number;

const generateJwtToken = (user: JwtUserPayload, expiresIn: ExpiresIn) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        console.error('Missing JWT secret');
        process.exit(1);
    }
    return jwt.sign(user, JWT_SECRET, { expiresIn });
};

const tokenService = {
    generateJwtToken,
};

export default tokenService;
