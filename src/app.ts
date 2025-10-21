import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import mongoose from 'mongoose';

// Configurar variables de entorno
dotenv.config();

// Validar variables críticas
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI no está definida en .env');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET no está definida en .env');
  process.exit(1);
}

// Conectar a la base de datos
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Servidor de autenticación funcionando con MongoDB Atlas',
    database: 'MongoDB Atlas',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'OK',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});


app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Base de datos: MongoDB Atlas`);
});