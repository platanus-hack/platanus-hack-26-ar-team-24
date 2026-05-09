import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { profileService } from '../services/profileService.js';
import { aiService } from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { HttpError } from '../types/index.js';
import {
  CandidateProfileInput,
  StartupProfileInput,
  GitHubAnalysisInput,
  LinkedInAnalysisInput,
} from '../utils/validators.js';

export const profileController = {
  // CANDIDATE PROFILES
  async createCandidateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const input = req.body as CandidateProfileInput;
      const profile = await profileService.createCandidateProfile(
        req.user.id,
        input
      );
      sendSuccess(res, profile, 201);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  async getCandidateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const profile = await profileService.getCandidateProfile(req.user.id);
      sendSuccess(res, profile, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  async updateCandidateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const input = req.body as Partial<CandidateProfileInput>;
      const profile = await profileService.updateCandidateProfile(
        req.user.id,
        input
      );
      sendSuccess(res, profile, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  // STARTUP PROFILES
  async createStartupProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const input = req.body as StartupProfileInput;
      const profile = await profileService.createStartupProfile(
        req.user.id,
        input
      );
      sendSuccess(res, profile, 201);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  async getStartupProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const profile = await profileService.getStartupProfileByUserId(
        req.user.id
      );
      sendSuccess(res, profile, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  async updateStartupProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const input = req.body as Partial<StartupProfileInput>;
      const profile = await profileService.updateStartupProfile(
        req.user.id,
        input
      );
      sendSuccess(res, profile, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  // GITHUB ANALYSIS
  async analyzeGitHub(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const { github_username } = req.body as GitHubAnalysisInput;
      const profile = await profileService.analyzeGitHub(
        req.user.id,
        github_username
      );
      sendSuccess(res, profile, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  // LINKEDIN ANALYSIS
  async analyzeLinkedIn(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const { linkedin_url } = req.body as LinkedInAnalysisInput;
      const profile = await profileService.analyzeLinkedIn(
        req.user.id,
        linkedin_url
      );
      sendSuccess(res, profile, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  // GENERATE AI AGENT
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

      sendSuccess(res, { agent, message: 'AI Agent generated' }, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },
};
