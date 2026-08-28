import mongoose from 'mongoose';

// Asíncrona inicio la conexión con mi cluster de MongoDB Atlas
export const conectarDB = async () => {
  try {
    // Acá recupero la cadena de conexión desde mi variable de entorno MONGO_URI
    const uri = process.env.MONGO_URI;

    if (!uri) {
      console.warn('[MongoDB Atlas] MONGO_URI no configurada. Servidor funcionando en modo local.');
      return;
    }

    // Configuro el oyente para cuando la conexión con la base de datos se establece felizmente
    mongoose.connection.on('connected', () => {
      console.log('[MongoDB Atlas] Evento: Conexión establecida con éxito');
    });

    // Escucho posibles advertencias o interrupciones de conexión
    mongoose.connection.on('error', (err) => {
      console.warn(`[MongoDB Atlas] Evento Aviso: ${err.message}`);
    });

    // Acá disparo la conexión a MongoDB Atlas con un límite de espera de 3 segundos
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
