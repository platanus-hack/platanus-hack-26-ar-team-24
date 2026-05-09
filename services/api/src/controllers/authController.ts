import { Request, Response } from 'express';
import { authService } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { HttpError } from '../types/index.js';
import { RegisterInput, LoginInput } from '../utils/validators.js';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const input = req.body as RegisterInput;
      const result = await authService.register(input);
      sendSuccess(res, result, 201);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const input = req.body as LoginInput;
      const result = await authService.login(input);
      sendSuccess(res, result, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },
};
