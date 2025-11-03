import { Response } from 'express';
import { RecommendationService } from '../services/recommendationService';
import { AuthRequest } from '../types/auth';

/**
 * Controlador para recomendaciones basadas en contenido
 */
export const getContentBasedRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId } = req.params;
    const { limit = '10' } = req.query;

    if (!bookId) {
      res.status(400).json({
        success: false,
        message: 'ID de libro requerido'
      });
      return;
    }

    const response = await RecommendationService.getContentBasedRecommendations({
      bookId,
      limit: parseInt(String(limit), 10)
    });

    res.status(response.success ? 200 : 400).json(response);

  } catch (error) {
    console.error('Error en controlador de recomendaciones por contenido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Controlador para recomendaciones colaborativas
 */
export const getCollaborativeRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { limit = '10' } = req.query;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'ID de usuario requerido'
      });
      return;
    }

    const response = await RecommendationService.getCollaborativeRecommendations({
      userId,
      limit: parseInt(String(limit), 10)
    });

    res.status(response.success ? 200 : 400).json(response);

  } catch (error) {
    console.error('Error en controlador de recomendaciones colaborativas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Controlador para recomendaciones personalizadas del usuario actual
 */
export const getUserRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    const { limit = '10' } = req.query;

    const response = await RecommendationService.getRecommendationsForUser({
      userId: req.user._id.toString(),
      limit: parseInt(String(limit), 10)
    });

    res.status(response.success ? 200 : 400).json(response);

  } catch (error) {
    console.error('Error en controlador de recomendaciones de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Controlador para generar recomendaciones pre-calculadas (admin)
 */
export const generateRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // En un proyecto real, aquí verificaríamos si el usuario es admin
    // Por ahora, lo dejamos abierto para testing

    console.log('Solicitando generación de recomendaciones pre-calculadas...');
    
    const response = await RecommendationService.generateRecommendations();

    res.status(response.success ? 200 : 500).json(response);

  } catch (error) {
    console.error('Error en controlador de generación de recomendaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Controlador para obtener libros similares (alias de content-based)
 */
export const getSimilarBooks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId } = req.params;
    const { limit = '6' } = req.query;

    if (!bookId) {
      res.status(400).json({
        success: false,
        message: 'ID de libro requerido'
      });
      return;
    }

    const response = await RecommendationService.getContentBasedRecommendations({
      bookId,
      limit: parseInt(String(limit), 10)
    });

    res.status(response.success ? 200 : 400).json(response);

  } catch (error) {
    console.error('Error en controlador de libros similares:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Controlador para recomendaciones híbridas mejoradas
 */
export const getHybridRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    const { limit = '10' } = req.query;

    const response = await RecommendationService.getHybridRecommendations(
      req.user._id.toString(),
      parseInt(String(limit), 10)
    );

    res.status(response.success ? 200 : 400).json(response);

  } catch (error) {
    console.error('Error en controlador de recomendaciones híbridas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};