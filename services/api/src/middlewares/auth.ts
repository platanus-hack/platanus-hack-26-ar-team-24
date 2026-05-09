import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { JWTPayload } from '../types/index.js';
import { sendError } from '../utils/response.js';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    sendError(res, 'No token provided', 401);
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    sendError(res, 'Invalid or expired token', 401);
    return;
  }

  req.user = decoded;
  next();
};

export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};
