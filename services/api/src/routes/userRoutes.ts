import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// Public endpoints
router.get('/candidates', userController.getCandidates);
router.get('/founders', userController.getFounders);

// Protected endpoints
router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

export default router;
