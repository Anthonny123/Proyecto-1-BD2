import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

interface JwtPayload {
  userId: string;
}

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }

  return jwt.sign(
    { userId } as object, // Type assertion para el payload
    secret,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '30d' 
    } as jwt.SignOptions // Type assertion para las opciones
  );
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET no está definido');
  }

  return jwt.verify(token, secret) as JwtPayload;
};