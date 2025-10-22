import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth';

export class AuthService {
  /**
   * Registrar un nuevo usuario
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const { username, email, password, preferences } = userData;

      // Validaciones básicas
      if (!username || !email || !password) {
        return {
          success: false,
          message: 'Todos los campos son requeridos: username, email, password'
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        };
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return {
          success: false,
          message: existingUser.email === email 
            ? 'Ya existe un usuario con este email' 
            : 'El nombre de usuario ya está en uso'
        };
      }

      // Crear nuevo usuario
      const user = new User({
        username,
        email,
        password,
        preferences: preferences || {
          favoriteGenres: [],
          favoriteAuthors: [],
          excludedGenres: []
        }
      });

      await user.save();

      // Generar token JWT
      const token = generateToken(user._id.toString());

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            preferences: user.preferences
          },
          token
        }
      };

    } catch (error: any) {
      console.error('Error en servicio de registro:', error);

      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((err: any) => err.message);
        return {
          success: false,
          message: 'Error de validación',
          error: errors.join(', ')
        };
      }

      if (error.code === 11000) {
        return {
          success: false,
          message: 'El email o nombre de usuario ya existe'
        };
      }

      return {
        success: false,
        message: 'Error interno del servidor al registrar usuario',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Login de usuario
   */
  static async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      const { email, password } = loginData;

      if (!email || !password) {
        return {
          success: false,
          message: 'Email y contraseña son requeridos'
        };
      }

      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      const token = generateToken(user._id.toString());

      return {
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            preferences: user.preferences
          },
          token
        }
      };

    } catch (error: any) {
      console.error('Error en servicio de login:', error);

      return {
        success: false,
        message: 'Error interno del servidor al iniciar sesión',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Obtener perfil de usuario
   */
  static async getProfile(userId: string): Promise<AuthResponse> {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      return {
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: {
          user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            preferences: user.preferences
          }
        }
      };

    } catch (error: any) {
      console.error('Error en servicio de perfil:', error);

      return {
        success: false,
        message: 'Error al obtener perfil de usuario',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Actualizar preferencias del usuario
   */
  static async updatePreferences(
    userId: string, 
    preferences: { favoriteGenres?: string[]; favoriteAuthors?: string[]; excludedGenres?: string[] }
  ): Promise<AuthResponse> {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          preferences: {
            favoriteGenres: preferences.favoriteGenres,
            favoriteAuthors: preferences.favoriteAuthors,
            excludedGenres: preferences.excludedGenres
          }
        },
        { new: true }
      );

      if (!updatedUser) {
        return {
          success: false,
          message: 'Error al actualizar preferencias'
        };
      }

      return {
        success: true,
        message: 'Preferencias actualizadas exitosamente',
        data: {
          user: {
            id: updatedUser._id.toString(),
            username: updatedUser.username,
            email: updatedUser.email,
            preferences: updatedUser.preferences
          }
        }
      };

    } catch (error: any) {
      console.error('Error en servicio de actualización de preferencias:', error);

      return {
        success: false,
        message: 'Error al actualizar preferencias',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }
}