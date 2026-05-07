import { Router, Response } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Login
router.post('/login', authController.login);

// Register (student self-registration)
router.post('/register', authController.register);

// Get current user
router.get('/me', authenticateToken, authController.getCurrentUser);

// Change password
router.put('/password', authenticateToken, authController.changePassword);

export default router;

