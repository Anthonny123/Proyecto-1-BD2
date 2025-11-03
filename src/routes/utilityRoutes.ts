import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    data: {
      status: 'OK',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// Stats del sistema
router.get('/stats', async (req, res) => {
  try {
    const Book = (await import('../models/Book')).default;
    const User = (await import('../models/User')).default;
    const UserInteraction = (await import('../models/UserInteraction')).default;

    const [bookCount, userCount, interactionCount] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments(),
      UserInteraction.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        books: bookCount,
        users: userCount,
        interactions: interactionCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error obteniendo stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

export default router;