import { Router } from 'express';
import { 
  getAllBooks, 
  getBookById, 
  searchBooks, 
  updateBookMetrics,
  getGenres,
  getAuthors,
  getSimilarBooks
} from '../controllers/bookController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.get('/', getAllBooks);
router.get('/search', searchBooks);
router.get('/genres', getGenres);
router.get('/authors', getAuthors);
router.get('/:id', getBookById);
router.get('/:id/similar', getSimilarBooks);

// Ruta protegida para actualizar métricas
router.patch('/:id/metrics', authenticate, updateBookMetrics);

export default router;