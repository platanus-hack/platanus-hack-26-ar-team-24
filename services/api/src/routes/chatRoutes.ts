import { Router } from 'express';
import { profileController } from '../controllers/profileController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validation.js';
import {
  candidateProfileSchema,
  startupProfileSchema,
  githubAnalysisSchema,
  linkedinAnalysisSchema,
} from '../utils/validators.js';

const router = Router();

router.use(authMiddleware);

// Candidate Profile Routes
router.post(
  '/candidate',
  validateRequest(candidateProfileSchema),
  profileController.createCandidateProfile
);

router.get('/candidate', profileController.getCandidateProfile);

router.put(
  '/candidate',
  validateRequest(candidateProfileSchema),
  profileController.updateCandidateProfile
);

// Startup Profile Routes
router.post(
  '/startup',
  validateRequest(startupProfileSchema),
  profileController.createStartupProfile
);

router.get('/startup', profileController.getStartupProfile);

router.put(
  '/startup',
  validateRequest(startupProfileSchema),
  profileController.updateStartupProfile
);

// Analysis Routes
router.post(
  '/github/analyze',
  validateRequest(githubAnalysisSchema),
  profileController.analyzeGitHub
);

router.post(
  '/linkedin/analyze',
  validateRequest(linkedinAnalysisSchema),
  profileController.analyzeLinkedIn
);

// AI Agent Generation
router.post('/generate-agent', profileController.generateCandidateAgent);

export default router;
