import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI no está definida en .env');
    }

    console.log('🔗 Conectando a MongoDB Atlas...');

    // Configuración MEJORADA para Atlas
    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 50000, // 50 segundos
      socketTimeoutMS: 55000, // 55 segundos  
      connectTimeoutMS: 50000, // 50 segundos
      retryWrites: true,
      w: 'majority',
      retryReads: true
    };

    await mongoose.connect(mongoUri, options);
    
    console.log('CONEXIÓN EXITOSA A MONGODB ATLAS');
    console.log(`Base de datos: ${mongoose.connection.db?.databaseName}`);
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Estado: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);
    
  } catch (error: any) {
    console.error('\nERROR CRÍTICO DE CONEXIÓN');
    console.error(`Tipo: ${error.name}`);
    console.error(`Mensaje: ${error.message}`);
    process.exit(1);
  }
};


mongoose.connection.on('connected', () => {
  console.log('Mongoose conectado exitosamente');
});

mongoose.connection.on('error', (err) => {
  console.error('Error de Mongoose:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose desconectado');
});

export default connectDB;