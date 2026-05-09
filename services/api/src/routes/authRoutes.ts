import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validateRequest } from '../middlewares/validation.js';
import { registerSchema, loginSchema } from '../utils/validators.js';

const router = Router();

router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register
);

router.post(
  '/login',
  validateRequest(loginSchema),
  authController.login
);

export default router;
