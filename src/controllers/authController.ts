import { Response } from 'express';
import { AuthService } from '../services/authService';
import { 
  RegisterRequest, 
  LoginRequest, 
  AuthRequest
} from '../types/auth';

/**
 * Controlador para registrar nuevos usuarios
 */
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const userData: RegisterRequest = req.body;
  const response = await AuthService.register(userData);
  res.status(response.success ? 201 : 400).json(response);
};

/**
 * Controlador para login de usuarios
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const loginData: LoginRequest = req.body;
  const response = await AuthService.login(loginData);
  res.status(response.success ? 200 : 401).json(response);
};

/**
 * Controlador para obtener perfil del usuario actual
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
    return;
  }

  const response = await AuthService.getProfile(req.user._id.toString());
  
  // Agregar el token actual si no viene en la response
  if (response.success && response.data && !response.data.token) {
    response.data.token = req.header('Authorization')?.replace('Bearer ', '') || '';
  }

  res.status(response.success ? 200 : 500).json(response);
};

/**
 * Controlador para actualizar preferencias del usuario
 */
export const updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
    return;
  }

  const { favoriteGenres, favoriteAuthors, excludedGenres } = req.body;
  const response = await AuthService.updatePreferences(req.user._id.toString(), {
    favoriteGenres,
    favoriteAuthors,
    excludedGenres
  });

  res.status(response.success ? 200 : 500).json(response);
};