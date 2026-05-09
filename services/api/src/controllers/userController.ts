import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { userService } from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { HttpError } from '../types/index.js';

export const userController = {
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const user = await userService.getUserProfile(req.user.id);
      sendSuccess(res, user, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const updates = req.body;
      const user = await userService.updateUserProfile(req.user.id, updates);
      sendSuccess(res, user, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  async getCandidates(req: AuthRequest, res: Response): Promise<void> {
    try {
      const candidates = await userService.getAllCandidates();
      sendSuccess(res, { candidates }, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  async getFounders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const founders = await userService.getAllFounders();
      sendSuccess(res, { founders }, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },
};
