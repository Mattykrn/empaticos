import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Acá me aseguro de cargar las variables de entorno definidas en mi archivo .env
dotenv.config();

// En este módulo configuro mi función asíncrona para conectarme a mi cluster en MongoDB Atlas.
// Utilizo try/catch para capturar cualquier falla de red, formato de URI o autenticación.
export const conectarDB = async () => {
  try {
    // Reviso si la variable de entorno MONGO_URI está disponible en mi entorno
    if (!process.env.MONGO_URI) {
      throw new Error('La variable de entorno MONGO_URI no está definida en mi archivo .env');
    }

    // Acá realizo la conexión con mi base de datos de MongoDB Atlas mediante mongoose
    const conexion = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 4000
    });

    // Logueo un mensaje amigable confirmando el host al cual me he conectado
    console.log(`Conexión exitosa a mi base de datos MongoDB Atlas (${conexion.connection.host})`);
  } catch (error) {
    // Si sucede un error al intentar conectarme, muestro la advertencia y permito que el servidor continúe operativo
    console.warn(`Aviso de Base de Datos: No se pudo establecer la conexión directa con MongoDB Atlas (${error.message}).`);
    console.warn(`El servidor Express seguirá operativo para servir el frontend y los endpoints.`);
  }
};





