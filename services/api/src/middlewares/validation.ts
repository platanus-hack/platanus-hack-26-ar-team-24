import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendValidationError } from '../utils/response.js';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error: unknown) {
      const zodError = error as any;
      const errors: Record<string, unknown> = {};

      if (zodError.errors) {
        zodError.errors.forEach((err: any) => {
          const field = err.path[0] || 'unknown';
          errors[field] = err.message;
        });
      }

      sendValidationError(res, errors);
    }
  };
};
