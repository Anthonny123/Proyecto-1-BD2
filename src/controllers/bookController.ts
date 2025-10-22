import { Response } from 'express';
import { BookService } from '../services/bookService';
import { AuthRequest } from '../types/auth';

/**
 * Función helper para convertir query params a tipos correctos
 */
const parseQueryParams = (query: any) => {
  const filters: any = {};

  // Convertir arrays de strings
  if (query.genres) {
    filters.genres = Array.isArray(query.genres) 
      ? query.genres.map((g: any) => String(g))
      : [String(query.genres)];
  }

  if (query.authors) {
    filters.authors = Array.isArray(query.authors)
      ? query.authors.map((a: any) => String(a))
      : [String(query.authors)];
  }

  // Convertir números
  if (query.minRating) {
    filters.minRating = parseFloat(String(query.minRating));
  }

  if (query.maxRating) {
    filters.maxRating = parseFloat(String(query.maxRating));
  }

  // Convertir string
  if (query.search) {
    filters.search = String(query.search);
  }

  return filters;
};

/**
 * Controlador para obtener todos los libros
 */
export const getAllBooks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = '1', 
      limit = '10'
    } = req.query;

    // Convertir query params a tipos correctos
    const filters = parseQueryParams(req.query);

    const pagination = {
      page: parseInt(String(page), 10),
      limit: parseInt(String(limit), 10)
    };

    const response = await BookService.getAllBooks(filters, pagination);
    res.status(response.success ? 200 : 400).json(response);

  } catch (error) {
    console.error('Error en controlador de libros:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Los demás controladores se mantienen igual...
export const getBookById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const response = await BookService.getBookById(id);
    res.status(response.success ? 200 : 404).json(response);

  } catch (error) {
    console.error('Error en controlador de libro por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const searchBooks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q, limit } = req.query;
    
    if (!q) {
      res.status(400).json({
        success: false,
        message: 'Parámetro de búsqueda (q) requerido'
      });
      return;
    }

    const searchLimit = limit ? parseInt(String(limit), 10) : 20;
    const response = await BookService.searchBooks(String(q), searchLimit);
    res.status(response.success ? 200 : 400).json(response);

  } catch (error) {
    console.error('Error en controlador de búsqueda:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const updateBookMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const metrics = req.body;

    const response = await BookService.updateBookMetrics(id, metrics);
    res.status(response.success ? 200 : 400).json(response);

  } catch (error) {
    console.error('Error en controlador de actualización de métricas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getGenres = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await BookService.getUniqueGenres();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }

  } catch (error) {
    console.error('Error en controlador de géneros:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getAuthors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await BookService.getUniqueAuthors();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }

  } catch (error) {
    console.error('Error en controlador de autores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};