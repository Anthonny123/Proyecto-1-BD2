import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

// Interfaz para el payload del JWT
interface JwtPayload {
  userId: string;
}

// Generar JWT
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET no está definido en las variables de entorno");
  }

  return jwt.sign({ userId } as JwtPayload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  } as jwt.SignOptions);
};

// Registrar usuario
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos: name, email, password",
      });
      return;
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "El usuario ya existe con este email",
      });
      return;
    }

    // Crear nuevo usuario
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Generar token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error("Error en registro:", error);

    // Manejar errores de validación de Mongoose
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: "Error de validación",
        errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al registrar usuario",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Error interno del servidor",
    });
  }
};

// Login de usuario
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email y password son requeridos",
      });
      return;
    }

    // Buscar usuario y incluir password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
      return;
    }

    // Verificar password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
      return;
    }

    // Generar token
    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: "Login exitoso",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error en el login",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Error interno del servidor",
    });
  }
};

// Obtener perfil de usuario
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error: any) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener perfil",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Error interno del servidor",
    });
  }
};
