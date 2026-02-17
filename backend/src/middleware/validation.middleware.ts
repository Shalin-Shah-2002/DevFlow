import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Validation middleware to check express-validator results
 * Use this after validation rules in routes
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((error) => ({
        field: error.type === 'field' ? (error as any).path : undefined,
        message: error.msg,
      })),
    });
  }
  
  next();
};
