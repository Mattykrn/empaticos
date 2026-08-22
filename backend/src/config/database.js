import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// En esta función asíncrona establezco y administro mi conexión hacia MongoDB Atlas
export const conectarBaseDeDatos = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('[BD Aviso] MONGO_URI no definida. El servidor funcionará en modo offline.');
      return;
    }

    // Intento conectar a MongoDB Atlas con timeout de 3 segundos
    const conexion = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[BD] Conectado exitosamente a MongoDB Atlas: ${conexion.connection.host}`);
  } catch (error) {
    // Si la conexión a la base de datos falla o no hay conexión a internet, mantengo el servidor Express activo
    console.warn(`[BD Aviso] No se pudo conectar a MongoDB Atlas (${error.message}).`);
    console.warn(`[BD Aviso] El servidor Express seguirá ejecutándose normalmente.`);
  }
};
