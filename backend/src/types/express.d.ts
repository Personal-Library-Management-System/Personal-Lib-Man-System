import { Request } from 'express';
import { JwtUserPayload } from '../types/auth.types';
import { UserDoc } from '../models/user.model';

export interface AuthenticatedRequest extends Request {
    user: JwtUserPayload;
    userDoc: UserDoc;
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: JwtUserPayload;
        userDoc?: UserDoc;
    }
}
