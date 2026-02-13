declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email: string;
      githubId: number;
    };
  }
  
  export interface User {
    id: string;
    email: string;
    githubId: number;
  }
}

export {};
