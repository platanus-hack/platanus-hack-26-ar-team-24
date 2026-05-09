import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null,
    timestamp: new Date().toISOString(),
  } as ApiResponse<T>);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 400
): Response => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error,
    timestamp: new Date().toISOString(),
  } as ApiResponse<null>);
};

export const sendValidationError = (
  res: Response,
  errors: Record<string, unknown>
): Response => {
  return res.status(422).json({
    success: false,
    data: null,
    error: 'Validation failed',
    details: errors,
    timestamp: new Date().toISOString(),
  });
};
