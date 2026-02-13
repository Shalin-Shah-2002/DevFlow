import { AuthUser } from '../models';

declare namespace Express {
  export interface Request {
    user?: AuthUser;
  }
  
  export interface User extends AuthUser {}
}

export {};
