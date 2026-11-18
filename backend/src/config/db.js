// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargo mis variables de entorno desde el archivo .env
dotenv.config();





// ==========================================
// CONEXION A MONGO ATLAS CON MONGOOSE
// ==========================================
export const conectarDB = async () => {
  try {
    // Tomo la URI guardada en el archivo .env
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.warn('⚠️ [MongoDB Atlas] No se encontró MONGO_URI en el archivo .env.');
      console.warn('ℹ️ El servidor va a arrancar en modo local con respaldo en memoria.');
      return;
    }

    // Escucho cuando la conexión se establece correctamente
    mongoose.connection.on('connected', () => {
      console.log('✅ [MongoDB Atlas] Conexión establecida con éxito al clúster.');
    });

    // Escucho posibles errores de la base de datos
    mongoose.connection.on('error', (err) => {
      console.warn(`⚠️ [MongoDB Atlas] Error en la conexión: ${err.message}`);
    });

    // Escucho si se llega a desconectar
    mongoose.connection.on('disconnected', () => {
      console.warn('ℹ️ [MongoDB Atlas] Desconectado de la base de datos.');
    });

    // Me conecto a MongoDB Atlas con un límite de tiempo para no trabar el servidor
    const conexion = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3500,
      connectTimeoutMS: 3500
    });

    console.log(`🚀 [Base de Datos] Conectado a MongoDB Atlas en: ${conexion.connection.host}`);
  } catch (error) {
    // Si no hay internet o las credenciales no son válidas, sigo adelante sin voltear la app
    console.warn(`⚠️ [Base de Datos] No se pudo conectar a Atlas (${error.message}).`);
    console.warn('ℹ️ El servidor Express sigue funcionando en modo seguro local.');
  }
};





// ==========================================
// EXPORTACION DEL MODULO
// ==========================================
export default conectarDB;
