import Book from '../models/Book';
import { 
  BookFilters, 
  PaginationOptions, 
  BooksResponse, 
  BookResponse, 
  SearchResponse, 
  UpdateMetricsRequest 
} from '../types/book';

export class BookService {
  /**
   * Obtener todos los libros con paginación y filtros
   */
  static async getAllBooks(
    filters: BookFilters = {}, 
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<BooksResponse> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      // Construir query de filtros
      const query: any = {};

      if (filters.genres && filters.genres.length > 0) {
        query.genres = { $in: filters.genres };
      }

      if (filters.authors && filters.authors.length > 0) {
        query.author = { $in: filters.authors };
      }

      if (filters.minRating !== undefined) {
        query.averageRating = { ...query.averageRating, $gte: filters.minRating };
      }

      if (filters.maxRating !== undefined) {
        query.averageRating = { ...query.averageRating, $lte: filters.maxRating };
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      // Ejecutar consultas en paralelo
      const [books, total] = await Promise.all([
        Book.find(query)
          .sort({ averageRating: -1, viewCount: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Book.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Libros obtenidos exitosamente',
        data: {
          books,
          pagination: {
            page,
            limit,
            total,
            totalPages
          }
        }
      };

    } catch (error: any) {
      console.error('Error en servicio de libros:', error);

      return {
        success: false,
        message: 'Error al obtener libros',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Obtener libro por ID
   */
  static async getBookById(bookId: string): Promise<BookResponse> {
    try {
      const book = await Book.findById(bookId).lean();

      if (!book) {
        return {
          success: false,
          message: 'Libro no encontrado'
        };
      }

      return {
        success: true,
        message: 'Libro obtenido exitosamente',
        data: { book }
      };

    } catch (error: any) {
      console.error('Error en servicio de libro por ID:', error);

      // Si el ID no es válido
      if (error.name === 'CastError') {
        return {
          success: false,
          message: 'ID de libro no válido'
        };
      }

      return {
        success: false,
        message: 'Error al obtener libro',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Buscar libros por término
   */
  static async searchBooks(searchTerm: string, limit: number = 20): Promise<SearchResponse> {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return {
          success: false,
          message: 'Término de búsqueda requerido'
        };
      }

      const books = await Book.find(
        { $text: { $search: searchTerm } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' }, averageRating: -1 })
        .limit(limit)
        .lean();

      return {
        success: true,
        message: 'Búsqueda completada exitosamente',
        data: {
          books,
          total: books.length
        }
      };

    } catch (error: any) {
      console.error('Error en servicio de búsqueda:', error);

      return {
        success: false,
        message: 'Error en la búsqueda de libros',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Actualizar métricas de un libro
   */
  static async updateBookMetrics(bookId: string, metrics: UpdateMetricsRequest): Promise<BookResponse> {
    try {
      const updateData: any = {};

      if (metrics.viewCount !== undefined) {
        updateData.$inc = { ...updateData.$inc, viewCount: metrics.viewCount };
      }

      if (metrics.ratingCount !== undefined || metrics.averageRating !== undefined) {
        updateData.ratingCount = metrics.ratingCount;
        updateData.averageRating = metrics.averageRating;
      }

      const book = await Book.findByIdAndUpdate(
        bookId,
        updateData,
        { new: true }
      ).lean();

      if (!book) {
        return {
          success: false,
          message: 'Libro no encontrado'
        };
      }

      return {
        success: true,
        message: 'Métricas actualizadas exitosamente',
        data: { book }
      };

    } catch (error: any) {
      console.error('Error en servicio de actualización de métricas:', error);

      if (error.name === 'CastError') {
        return {
          success: false,
          message: 'ID de libro no válido'
        };
      }

      return {
        success: false,
        message: 'Error al actualizar métricas del libro',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Obtener géneros únicos para filtros
   */
  static async getUniqueGenres(): Promise<{ success: boolean; data?: string[]; message?: string }> {
    try {
      const genres = await Book.distinct('genres');
      
      return {
        success: true,
        data: genres.flat().filter(genre => genre && genre.trim().length > 0)
      };

    } catch (error: any) {
      console.error('Error obteniendo géneros:', error);

      return {
        success: false,
        message: 'Error al obtener géneros'
      };
    }
  }

  /**
   * Obtener autores únicos para filtros
   */
  static async getUniqueAuthors(): Promise<{ success: boolean; data?: string[]; message?: string }> {
    try {
      const authors = await Book.distinct('author');
      
      return {
        success: true,
        data: authors.filter(author => author && author.trim().length > 0)
      };

    } catch (error: any) {
      console.error('Error obteniendo autores:', error);

      return {
        success: false,
        message: 'Error al obtener autores'
      };
    }
  }
}