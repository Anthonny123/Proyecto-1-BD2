import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas
router.get('/profile', authenticate, getProfile);

export default router;