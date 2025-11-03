import { Router } from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updatePreferences 
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas (requieren autenticación)
router.get('/me', authenticate, getProfile);
router.put('/preferences', authenticate, updatePreferences);

export default router;