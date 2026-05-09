import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { matchingService } from '../services/matchingService.js';
import { profileService } from '../services/profileService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { HttpError } from '../types/index.js';

export const matchingController = {
  async runMatching(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      // Get startup profile for this user
      const { data: startup, error: startupError } = await profileService.getStartupProfile(req.user.id);

      if (startupError || !startup) {
        sendError(res, 'Startup profile not found', 404);
        return;
      }

      // Get all candidates
      const { data: candidates, error: candidatesError } = await profileService.getAllCandidates();

      if (candidatesError || !candidates || candidates.length === 0) {
        sendSuccess(res, {
          startup_id: startup.id,
          matches_count: 0,
          matches: [],
        }, 200);
        return;
      }

      // Calculate matches
      const matches = candidates.map(candidate => {
        const matchScore = matchingService.calculateMatchScore(startup, candidate);
        return {
          id: `${candidate.id}-${startup.id}`,
          candidate_id: candidate.id,
          startup_id: startup.id,
          match_score: matchScore,
          summary: matchingService.generateSummary(candidate, startup, matchScore),
          reasons: matchingService.generateReasons(candidate, startup),
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }).sort((a, b) => b.match_score - a.match_score);

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

      // Get startup profile
      const { data: startup } = await profileService.getStartupProfile(req.user.id);

      if (!startup) {
        sendError(res, 'Startup profile not found', 404);
        return;
      }

      // Get all candidates for matching
      const { data: candidates } = await profileService.getAllCandidates();

      if (!candidates || candidates.length === 0) {
        sendSuccess(res, { matches: [] }, 200);
        return;
      }

      const matches = candidates.map(candidate => ({
        id: `${candidate.id}-${startup.id}`,
        candidate_id: candidate.id,
        startup_id: startup.id,
        match_score: matchingService.calculateMatchScore(startup, candidate),
        summary: matchingService.generateSummary(candidate, startup, matchingService.calculateMatchScore(startup, candidate)),
        reasons: matchingService.generateReasons(candidate, startup),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })).sort((a, b) => b.match_score - a.match_score);

      sendSuccess(res, { matches }, 200);
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

      // For now, just return success since we're not storing matches in DB
      sendSuccess(res, {
        id: matchId,
        status,
        updated_at: new Date().toISOString(),
      }, 200);
    } catch (error) {
      if (error instanceof HttpError) {
        sendError(res, error.message, error.statusCode);
      } else {
        sendError(res, 'Internal server error', 500);
      }
    }
  },
};
