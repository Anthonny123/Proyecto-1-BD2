import { Request } from 'express';
import { IUser } from '../models/User';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  preferences?: {
    favoriteGenres?: string[];
    favoriteAuthors?: string[];
    excludedGenres?: string[];
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      email: string;
      preferences: any;
    };
    token?: string;
  };
  error?: string;
}

export interface AuthRequest extends Request {
  user?: IUser;
}