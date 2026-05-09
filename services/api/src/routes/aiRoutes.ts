import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

// Generate AI agents
router.post('/candidate-agent', aiController.generateCandidateAgent);
router.post('/recruiter-agent', aiController.generateRecruiterAgent);

// Compatibility scoring
router.post('/compatibility-score', aiController.compatibilityScore);

// Generate summary
router.post('/generate-summary', aiController.generateSummary);

export default router;
