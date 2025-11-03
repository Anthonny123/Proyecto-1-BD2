import UserInteraction, { IUserInteraction, InteractionType } from '../models/UserInteraction';
import Book from '../models/Book';
import {
  RecordInteractionRequest,
  UserInteractionsRequest,
  BookInteractionsRequest,
  InteractionResponse,
  InteractionStats
} from '../types/interaction';

export class InteractionService {
  /**
   * Registrar una interacción de usuario
   */
  static async recordInteraction(request: RecordInteractionRequest): Promise<InteractionResponse> {
    try {
      const { userId, bookId, interactionType, ratingValue, timeOnPage, sessionId } = request;

      // Validaciones básicas
      if (!userId || !bookId || !interactionType || !sessionId) {
        return {
          success: false,
          message: 'userId, bookId, interactionType y sessionId son requeridos'
        };
      }

      // Validar rating si es una interacción de rating
      if (interactionType === 'rating' && (ratingValue === undefined || ratingValue < 1 || ratingValue > 5)) {
        return {
          success: false,
          message: 'ratingValue es requerido y debe ser entre 1-5 para interacciones de rating'
        };
      }

      // Validar timeOnPage si es una interacción de view
      if (interactionType === 'view' && (timeOnPage === undefined || timeOnPage < 0)) {
        return {
          success: false,
          message: 'timeOnPage es requerido para interacciones de view'
        };
      }

      // Verificar que el libro existe
      const book = await Book.findById(bookId);
      if (!book) {
        return {
          success: false,
          message: 'Libro no encontrado'
        };
      }

      // Crear la interacción
      const interaction = new UserInteraction({
        userId,
        bookId,
        interactionType,
        ratingValue,
        timeOnPage,
        sessionId,
        timestamp: new Date()
      });

      await interaction.save();

      // Actualizar métricas del libro si es necesario
      await this.updateBookMetrics(bookId, interactionType, ratingValue);

      return {
        success: true,
        message: 'Interacción registrada exitosamente',
        data: { interaction }
      };

    } catch (error: any) {
      console.error('Error en servicio de registro de interacción:', error);

      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((err: any) => err.message);
        return {
          success: false,
          message: 'Error de validación',
          error: errors.join(', ')
        };
      }

      if (error.name === 'CastError') {
        return {
          success: false,
          message: 'ID de usuario o libro no válido'
        };
      }

      return {
        success: false,
        message: 'Error interno del servidor al registrar interacción',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Actualizar métricas del libro basado en la interacción
   */
  private static async updateBookMetrics(bookId: string, interactionType: InteractionType, ratingValue?: number): Promise<void> {
    try {
      const updateData: any = {};

      if (interactionType === 'view') {
        updateData.$inc = { viewCount: 1 };
      } else if (interactionType === 'rating' && ratingValue) {
        // Calcular nuevo promedio de rating
        const book = await Book.findById(bookId);
        if (book) {
          const newTotalRating = (book.averageRating * book.ratingCount) + ratingValue;
          const newRatingCount = book.ratingCount + 1;
          const newAverageRating = newTotalRating / newRatingCount;

          updateData.averageRating = Math.round(newAverageRating * 10) / 10; // Redondear a 1 decimal
          updateData.ratingCount = newRatingCount;
        }
      } else if (interactionType === 'wishlist') {
        updateData.$inc = { wishlistCount: 1 };
      }

      if (Object.keys(updateData).length > 0) {
        await Book.findByIdAndUpdate(bookId, updateData);
      }

    } catch (error) {
      console.error('Error actualizando métricas del libro:', error);
    }
  }

  /**
   * Obtener historial de interacciones de un usuario
   */
  static async getUserInteractions(request: UserInteractionsRequest): Promise<InteractionResponse> {
    try {
      const { userId, limit = 20, page = 1 } = request;

      const skip = (page - 1) * limit;

      const [interactions, total] = await Promise.all([
        UserInteraction.find({ userId })
          .populate('bookId')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        UserInteraction.countDocuments({ userId })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Interacciones del usuario obtenidas exitosamente',
        data: {
          interactions,
          pagination: {
            page,
            limit,
            total,
            totalPages
          }
        }
      };

    } catch (error: any) {
      console.error('Error en servicio de interacciones de usuario:', error);

      if (error.name === 'CastError') {
        return {
          success: false,
          message: 'ID de usuario no válido'
        };
      }

      return {
        success: false,
        message: 'Error al obtener interacciones del usuario',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Obtener interacciones de un libro específico
   */
  static async getBookInteractions(request: BookInteractionsRequest): Promise<InteractionResponse> {
    try {
      const { bookId, limit = 20, page = 1 } = request;

      const skip = (page - 1) * limit;

      const [interactions, total] = await Promise.all([
        UserInteraction.find({ bookId })
          .populate('userId', 'username preferences.favoriteGenres')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        UserInteraction.countDocuments({ bookId })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Interacciones del libro obtenidas exitosamente',
        data: {
          interactions,
          pagination: {
            page,
            limit,
            total,
            totalPages
          }
        }
      };

    } catch (error: any) {
      console.error('Error en servicio de interacciones de libro:', error);

      if (error.name === 'CastError') {
        return {
          success: false,
          message: 'ID de libro no válido'
        };
      }

      return {
        success: false,
        message: 'Error al obtener interacciones del libro',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Obtener estadísticas de interacciones
   */
  static async getInteractionStats(userId?: string, bookId?: string): Promise<{ success: boolean; data?: InteractionStats; message?: string }> {
    try {
      const matchStage: any = {};
      
      if (userId) matchStage.userId = userId;
      if (bookId) matchStage.bookId = bookId;

      const stats = await UserInteraction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalViews: {
              $sum: { $cond: [{ $eq: ['$interactionType', 'view'] }, 1, 0] }
            },
            totalRatings: {
              $sum: { $cond: [{ $eq: ['$interactionType', 'rating'] }, 1, 0] }
            },
            totalWishlists: {
              $sum: { $cond: [{ $eq: ['$interactionType', 'wishlist'] }, 1, 0] }
            },
            averageRating: { $avg: '$ratingValue' },
            totalInteractions: { $sum: 1 }
          }
        }
      ]);

      const result = stats[0] || {
        totalViews: 0,
        totalRatings: 0,
        totalWishlists: 0,
        averageRating: 0,
        totalInteractions: 0
      };

      return {
        success: true,
        data: {
          totalViews: result.totalViews,
          totalRatings: result.totalRatings,
          totalWishlists: result.totalWishlists,
          averageRating: Math.round(result.averageRating * 10) / 10 || 0
        }
      };

    } catch (error: any) {
      console.error('Error obteniendo estadísticas de interacciones:', error);

      return {
        success: false,
        message: 'Error al obtener estadísticas de interacciones'
      };
    }
  }

  /**
   * Obtener usuarios más activos
   */
  static async getMostActiveUsers(limit: number = 10): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
      const activeUsers = await UserInteraction.aggregate([
        {
          $group: {
            _id: '$userId',
            interactionCount: { $sum: 1 },
            lastActivity: { $max: '$timestamp' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            'user.password': 0,
            'user.__v': 0
          }
        },
        {
          $sort: { interactionCount: -1, lastActivity: -1 }
        },
        {
          $limit: limit
        }
      ]);

      return {
        success: true,
        data: activeUsers
      };

    } catch (error: any) {
      console.error('Error obteniendo usuarios activos:', error);

      return {
        success: false,
        message: 'Error al obtener usuarios activos'
      };
    }
  }
}