import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { aiService } from '../services/aiService.js';
import { profileService } from '../services/profileService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { HttpError } from '../types/index.js';

export const aiController = {
  async generateCandidateAgent(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const profile = await profileService.getCandidateProfile(req.user.id);
      const agent = await aiService.generateCandidateAgent(profile);

      // Update profile with agent
      await profileService.updateCandidateProfile(req.user.id, {
        ai_agent: agent,
      });

      sendSuccess(res, { agent, message: 'Candidate AI Agent generated' }, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  async generateRecruiterAgent(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const profile = await profileService.getStartupProfileByUserId(
        req.user.id
      );
      const agent = await aiService.generateRecruiterAgent(profile);

      // Update profile with agent
      await profileService.updateStartupProfile(req.user.id, {
        recruiter_agent: agent,
      });

      sendSuccess(res, { agent, message: 'Recruiter AI Agent generated' }, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  async compatibilityScore(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { candidateId, startupId } = req.body;

      if (!candidateId || !startupId) {
        sendError(res, 'candidateId and startupId required', 400);
        return;
      }

      const candidate = await profileService.getCandidateProfile(candidateId);
      const startup = await profileService.getStartupProfile(startupId);

      const score = await aiService.scoreCompatibilityDeep(candidate, startup);

      sendSuccess(res, score, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  async generateSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { candidateId, startupId } = req.body;

      if (!candidateId || !startupId) {
        sendError(res, 'candidateId and startupId required', 400);
        return;
      }

      const summary = await aiService.generateSummary(candidateId, startupId);

      sendSuccess(res, { summary }, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },
};
