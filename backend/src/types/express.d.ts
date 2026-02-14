import { AuthUser } from '../models';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
    
    interface User extends AuthUser {}
  }
}

export {};
