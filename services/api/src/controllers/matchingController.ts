import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { matchingService } from '../services/matchingService.js';
import { profileService } from '../services/profileService.js';
import { aiService } from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { HttpError } from '../types/index.js';

export const matchingController = {
  async runMatching(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      // Get the user's startup profile
      const startup = await profileService.getStartupProfileByUserId(
        req.user.id
      );

      // Run matching process
      const matches = await matchingService.runMatchingProcess(startup.id);

      sendSuccess(res, {
        startup_id: startup.id,
        matches_count: matches.length,
        matches,
      }, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  async getMatches(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      // Determine if user is candidate or founder
      const { userId } = req.params;
      const profileId = userId || req.user.id;

      let matches;
      try {
        // Try to get candidate profile
        const candidate = await profileService.getCandidateProfile(profileId);
        matches = await matchingService.getMatchesForCandidate(candidate.id);
      } catch {
        // If not candidate, try founder
        const startup = await profileService.getStartupProfileByUserId(profileId);
        matches = await matchingService.getMatchesForStartup(startup.id);
      }

      sendSuccess(res, { matches }, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },

  async getCompatibilityScore(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { candidateId, startupId } = req.body;

      if (!candidateId || !startupId) {
        sendError(res, 'candidateId and startupId required', 400);
        return;
      }

      // Get profiles
      const candidate = await profileService.getCandidateProfile(candidateId);
      const startup = await profileService.getStartupProfile(startupId);

      // Calculate compatibility
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

  async updateMatchStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { matchId, status } = req.body;

      if (!matchId || !status) {
        sendError(res, 'matchId and status required', 400);
        return;
      }

      const match = await matchingService.updateMatchStatus(matchId, status);

      sendSuccess(res, match, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },
};
