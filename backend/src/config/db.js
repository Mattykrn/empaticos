import mongoose from 'mongoose';

/**
 * Módulo de conexión a la base de datos MongoDB Atlas utilizando Mongoose.
 * Incluye manejo de errores seguro para que el servidor Express permanezca activo.
 */
export const conectarDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      console.warn('[MongoDB Atlas] MONGO_URI no configurada. Servidor funcionando en modo local.');
      return;
    }

    mongoose.connection.on('connected', () => {
      console.log('[MongoDB Atlas] Evento: Conexión establecida con éxito');
    });

    mongoose.connection.on('error', (err) => {
      console.warn(`[MongoDB Atlas] Evento Aviso: ${err.message}`);
    });

    // Realizamos la conexión inicial a MongoDB Atlas con timeout de 3s
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Base de Datos] MongoDB Atlas conectado exitosamente en: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Base de Datos] No se pudo conectar a MongoDB Atlas (${error.message}).`);
    console.warn(`[Base de Datos] El servidor Express seguirá activo respondiendo solicitudes.`);
  }
};

export default conectarDB;
