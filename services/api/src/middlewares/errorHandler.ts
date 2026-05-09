import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import { HttpError } from '../types/index.js';

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  if (error instanceof Error) {
    const httpError = error as HttpError;

    if (httpError.statusCode) {
      sendError(res, httpError.message, httpError.statusCode);
      return;
    }

    sendError(res, error.message, 500);
    return;
  }

  sendError(res, 'Internal server error', 500);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.path} not found`, 404);
};
