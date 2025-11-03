import { Router } from 'express';
import authRoutes from './authRoutes';
import bookRoutes from './bookRoutes';
import recommendationRoutes from './recommendationRoutes';
import interactionRoutes from './interactionRoutes';
import utilityRoutes from './utilityRoutes';

const router = Router();

// Configurar rutas
router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/interactions', interactionRoutes);
router.use('/utility', utilityRoutes);

// Ruta de bienvenida
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '📚 Bienvenido a BookHub API - Sistema de Recomendación de Libros',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      books: '/api/books',
      recommendations: '/api/recommendations',
      interactions: '/api/interactions',
      utility: '/api/utility'
    },
    documentation: 'Consulta la documentación para más detalles'
  });
});

// Manejar rutas no encontradas
// Manejar rutas no encontradas - FORMA MÁS SEGURA
router.use((req, res) => {
  // Esta función solo se ejecuta si ninguna ruta anterior coincidió
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /api',
      'GET /api/utility/health',
      'GET /api/utility/stats',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'PUT /api/auth/preferences',
      'GET /api/books',
      'GET /api/books/search',
      'GET /api/books/genres',
      'GET /api/books/authors',
      'GET /api/books/:id',
      'GET /api/books/:id/similar',
      'GET /api/recommendations/content/:bookId',
      'GET /api/recommendations/collaborative/:userId',
      'GET /api/recommendations/user',
      'POST /api/recommendations/generate'
    ]
  });
});



export default router;