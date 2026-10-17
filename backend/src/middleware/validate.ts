import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const validate = (schema: z.ZodSchema, source: 'body' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = (error.issues || []).map((err) => ({
          field: err.path?.join('.') || 'unknown',
          message: err.message || 'Validation error',
        }));
        res.status(400).json({ errors });
        return;
      }
      next(error);
    }
  };
};

export default validate;
