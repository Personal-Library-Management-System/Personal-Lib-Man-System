import { Request } from 'express';
import { JwtUserPayload } from '../types/auth.types';

export interface AuthenticatedRequest extends Request {
    user: JwtUserPayload;
}

declare global {
  namespace Express {
    interface User extends JwtUserPayload {}
  }
}
