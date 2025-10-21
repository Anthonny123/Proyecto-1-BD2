import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

// Interfaz para el payload decodificado del JWT
interface DecodedToken {
  userId: string;
  iat?: number;
  exp?: number;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false, 
        message: 'Acceso denegado. Token no proporcionado.' 
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({ 
        success: false, 
        message: 'Error de configuración del servidor.' 
      });
      return;
    }

    const decoded = jwt.verify(token, secret) as DecodedToken;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'Token inválido. Usuario no encontrado.' 
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false, 
        message: 'Token inválido.' 
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false, 
        message: 'Token expirado.' 
      });
      return;
    }

    res.status(401).json({ 
      success: false, 
      message: 'Error de autenticación.' 
    });
  }
};