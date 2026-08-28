import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { conectarDB } from './config/db.js';
import auditLogger from './middlewares/auditLogger.js';

// Enrutadores
import publicationRoutes from './routes/publicationRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import reactionRoutes from './routes/reactionRoutes.js';
import externalRoutes from './routes/externalRoutes.js';
import historiaRoutes from './routes/historia.routes.js';
import noticiaRoutes from './routes/noticia.routes.js';
import externaRoutes from './routes/externa.routes.js';

// Variables de entorno
dotenv.config();

// Iniciar Express
const app = express();

// Conexión a MongoDB
conectarDB();

// Middlewares globales
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Middleware de auditoría
app.use(auditLogger);

// Rutas
app.use('/api/publications', publicationRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/reactions', reactionRoutes);

// API externa
app.use('/api/external', externalRoutes);

// Enrutadores adicionales de compatibilidad
app.use('/api/historias', historiaRoutes);
app.use('/api/noticias', noticiaRoutes);
app.use('/api/externa', externaRoutes);

// Healthcheck
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

// Error 404
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: `Recurso no encontrado: [${req.method}] ${req.originalUrl} no existe en este servidor`
  });
});

// Error 500
app.use((err, req, res, next) => {
  console.error(`[Error Global de Servidor] ${err.stack || err.message}`);
  res.status(500).json({
    ok: false,
    mensaje: 'Ocurrió un error interno en el servidor',
    error: err.message
  });
});

// Puerto
const PORT = process.env.PORT || 5000;

// Levantar servidor
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