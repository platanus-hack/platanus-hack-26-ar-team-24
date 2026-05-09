import { Router } from 'express';
import { matchingController } from '../controllers/matchingController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

// Run matching process for a startup
router.post('/run', matchingController.runMatching);

// Get matches for user
router.get('/results/:userId?', matchingController.getMatches);

// Update match status
router.put('/status', matchingController.updateMatchStatus);

export default router;
