import { Router } from 'express';
import { 
  getContentBasedRecommendations,
  getCollaborativeRecommendations,
  getUserRecommendations,
  generateRecommendations,
  getHybridRecommendations
} from '../controllers/recommendationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.get('/content/:bookId', getContentBasedRecommendations);
router.get('/collaborative/:userId', getCollaborativeRecommendations);

// Rutas protegidas
router.get('/user', authenticate, getUserRecommendations);
router.post('/generate', authenticate, generateRecommendations);
// Agregar esta ruta
router.get('/hybrid', authenticate, getHybridRecommendations);

export default router;