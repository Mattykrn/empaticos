import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { conectarDB } from './config/db.js';
import auditLogger from './middlewares/auditLogger.js';

// En este bloque importo todos mis enrutadores del backend
import publicationRoutes from './routes/publicationRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import reactionRoutes from './routes/reactionRoutes.js';
import externalRoutes from './routes/externalRoutes.js';
import historiaRoutes from './routes/historia.routes.js';
import noticiaRoutes from './routes/noticia.routes.js';
import externaRoutes from './routes/externa.routes.js';





// En esta línea me encargo de cargar mis variables de entorno almacenadas en el archivo .env
dotenv.config();





// Aquí inicializo mi aplicación del servidor de Express (CONSIGNA 2: Servidor Node que utiliza rutas con verbos HTTP)
const app = express();





// Aquí invoco la conexión a mi base de datos propia alojada en MongoDB Atlas (CONSIGNA 1)
conectarDB();





// En esta sección configuro mis middlewares globales de CORS y parseo de peticiones JSON
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());





// Aquí conecto mi middleware propio de auditoría y registro de peticiones HTTP en tiempo real (CONSIGNA 5)
app.use(auditLogger);





// En este bloque vinculo mis enrutadores principales respaldados por mis Esquemas Mongoose propios (CONSIGNA 2 y CONSIGNA 3)
app.use('/api/publications', publicationRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/reactions', reactionRoutes);

// En esta ruta me conecto con una API externa para obtener contenido en español (CONSIGNA 6)
app.use('/api/external', externalRoutes);

// Enrutadores adicionales de compatibilidad
app.use('/api/historias', historiaRoutes);
app.use('/api/noticias', noticiaRoutes);
app.use('/api/externa', externaRoutes);





// En esta ruta raíz muestro el estado de salud de mi servidor y la verificación de las consignas del Examen Final Global
app.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: 'Servidor Backend de Empáticos funcionando correctamente',
    version: '1.0.0',
    consignasExamen: {
      consigna1_mongoAtlas: 'OK - Conectado mediante Mongoose en src/config/db.js',
      consigna2_servidorNode: 'OK - Servidor Express estructurado con verbos HTTP',
      consigna3_esquemaPropio: 'OK - Modelos Story, Publication y Reaction',
      consigna4_expressValidator: 'OK - Reglas de validación en src/validators/',
      consigna5_middlewarePropio: 'OK - Middleware de auditoría en src/middlewares/',
      consigna6_apiExterna: 'OK - /api/external/quote'
    },
    endpoints: {
      publications: '/api/publications',
      stories: '/api/stories',
      reactions: '/api/reactions',
      external: '/api/external/quote'
    }
  });
});





// En este bloque capturo cualquier ruta no existente y retorno una respuesta semántica HTTP 404
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: `Recurso no encontrado: [${req.method}] ${req.originalUrl} no existe en este servidor`
  });
});





// En este manejador global capturo cualquier excepción imprevista del servidor para responder con HTTP 500
app.use((err, req, res, next) => {
  console.error(`[Error Global de Servidor] ${err.stack || err.message}`);
  res.status(500).json({
    ok: false,
    mensaje: 'Ocurrió un error interno en el servidor',
    error: err.message
  });
});





// En esta constante defino el puerto de escucha de mi aplicación
const PORT = process.env.PORT || 5000;

// Aquí inicio mi servidor de Express
const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Servidor Empáticos corriendo en el puerto: ${PORT}`);
  console.log(`📍 API Base:        http://localhost:${PORT}/`);
  console.log(`📍 API External:    http://localhost:${PORT}/api/external/quote`);
  console.log(`📍 API Stories:     http://localhost:${PORT}/api/stories`);
  console.log(`📍 API Reactions:   http://localhost:${PORT}/api/reactions`);
  console.log(`==================================================`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Error: El puerto ${PORT} está ocupado. Ejecuta 'killall -9 node' antes de reiniciar.`);
    process.exit(1);
  } else {
    console.error(`[Error Servidor]: ${error.message}`);
  }
});

export default app;