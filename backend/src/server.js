// Servidor principal de Node.js con Express para la plataforma Empáticos
// En este archivo configuro mi servidor web Express, integro middlewares globales, inicio la base de datos y defino el puerto de escucha.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { conectarDB } from './config/db.js';
import auditoriaMiddleware from './middlewares/auditoriaMiddleware.js';

// Importación de enrutadores del sistema
import historiaRoutes from './routes/historia.routes.js';
import noticiaRoutes from './routes/noticia.routes.js';
import externaRoutes from './routes/externa.routes.js';

// Cargo mis variables de entorno almacenadas en el archivo .env
dotenv.config();

// Inicializo mi aplicación Express
const app = express();

// Conecto mi aplicación con la base de datos MongoDB Atlas
conectarDB();

// En este bloque configuro mis middlewares globales principales
app.use(cors()); // Habilito CORS para peticiones desde clientes como Vite/React
app.use(express.json()); // Habilito el parseo automático de cuerpos en formato JSON
app.use(auditoriaMiddleware); // Aplico mi middleware propio de trazabilidad y registro de logs

// En estas líneas monto mis módulos de rutas con el prefijo /api
app.use('/api/historias', historiaRoutes);
app.use('/api/noticias', noticiaRoutes);
app.use('/api/externa', externaRoutes);

// Ruta base de bienvenida y chequeo de estado de la API
app.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: 'Servidor Backend de Empáticos funcionando correctamente',
    version: '1.0.0',
    documentacion: '/api/historias, /api/noticias, /api/externa/frase-apoyo'
  });
});

// En este middleware capturo cualquier ruta no encontrada (Error 404)
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: `La ruta requerida ${req.originalUrl} no fue encontrada en este servidor`
  });
});

// En este middleware global manejo cualquier error no controlado del servidor (Error 500)
app.use((err, req, res, next) => {
  console.error(`[Error de Servidor] Unhandled exception: ${err.message}`);
  res.status(500).json({
    ok: false,
    mensaje: 'Error interno inesperado en el servidor',
    error: err.message
  });
});

// En este bloque obtengo el puerto configurado o utilizo 5000 por defecto
const PORT = process.env.PORT || 5000;

// Aquí pongo a escuchar mi servidor Express en el puerto asignado
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Servidor Empáticos listo y corriendo en el puerto: ${PORT}`);
  console.log(`📍 Endpoint Base: http://localhost:${PORT}/`);
  console.log(`📍 API Historias: http://localhost:${PORT}/api/historias`);
  console.log(`📍 API Noticias: http://localhost:${PORT}/api/noticias`);
  console.log(`📍 API Externa:   http://localhost:${PORT}/api/externa/frase-apoyo`);
  console.log(`==================================================`);
});

export default app;
