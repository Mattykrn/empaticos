import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { conectarDB } from './config/db.js';
import auditoriaMiddleware from './middlewares/auditoriaMiddleware.js';

import historiaRoutes from './routes/historia.routes.js';
import noticiaRoutes from './routes/noticia.routes.js';
import externaRoutes from './routes/externa.routes.js';

// Variables de entorno
dotenv.config();

// Iniciar Express
const app = express();

// Conexión a MongoDB
conectarDB();

// Middlewares
app.use(cors()); // Habilito CORS para peticiones desde clientes como Vite/React
app.use(express.json()); // Habilito el parseo automático de cuerpos en formato JSON
app.use(auditoriaMiddleware); // Aplico mi middleware propio de trazabilidad y registro de logs

// Rutas API
app.use('/api/historias', historiaRoutes);
app.use('/api/noticias', noticiaRoutes);
app.use('/api/externa', externaRoutes);

// Bienvenida
app.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: 'Servidor Backend de Empáticos funcionando correctamente',
    version: '1.0.0',
    documentacion: '/api/historias, /api/noticias, /api/externa/frase-apoyo'
  });
});

// Error 404
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: `La ruta requerida ${req.originalUrl} no fue encontrada en este servidor`
  });
});

// Error 500
app.use((err, req, res, next) => {
  console.error(`[Error de Servidor] Unhandled exception: ${err.message}`);
  res.status(500).json({
    ok: false,
    mensaje: 'Error interno inesperado en el servidor',
    error: err.message
  });
});

// Puerto
const PORT = process.env.PORT || 5000;

// Levantar servidor
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
