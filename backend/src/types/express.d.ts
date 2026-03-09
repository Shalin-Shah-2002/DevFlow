import { AuthUser } from '../models';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      rawBody?: Buffer;
    }
    
    interface User extends AuthUser {}
  }
}

export {};
