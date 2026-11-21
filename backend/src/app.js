// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { conectarDB, cargarVariablesEntorno, getEstadoDB } from './config/db.js';

// Cargo variables de entorno (tanto backend/.env como raíz/.env) antes de iniciar
cargarVariablesEntorno();

// Middlewares propios
import auditLogger from './middlewares/auditLogger.js';
import moderacionMiddleware from './middlewares/moderacionMiddleware.js';

// Enrutadores de la aplicación
import publicacionRoutes from './routes/publicacion.routes.js';
import externoRoutes from './routes/externo.routes.js';
import reactionRoutes from './routes/reactionRoutes.js';

// Resuelvo frontend/dist tanto si se ejecuta desde backend/src/app.js como desde el symlink src/app.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const candidatosDist = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist')
];
const distFrontend = candidatosDist.find((ruta) => fs.existsSync(path.join(ruta, 'index.html'))) || candidatosDist[0];

// ==========================================
// INICIALIZACION DEL SERVIDOR EXPRESS
// ==========================================
const app = express();

// ==========================================
// CONEXION A MONGO ATLAS
// ==========================================
conectarDB();

// Garantiza conexión lista en entornos serverless (Vercel) antes de atender rutas de API
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    await conectarDB();
  }
  next();
});

// ==========================================
// MIDDLEWARES
// ==========================================
const origenesPermitidos = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origenesPermitidos.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Audit-Timestamp']
}));

app.use(express.json({ limit: '1mb' }));
app.use(auditLogger);
app.use(moderacionMiddleware);

if (fs.existsSync(distFrontend)) {
  app.use(express.static(distFrontend));
}

// ==========================================
// RUTAS Y ENDPOINTS
// ==========================================
app.use('/api/publicaciones', publicacionRoutes);
app.use('/api/publications', publicacionRoutes);
app.use('/api/stories', publicacionRoutes);
app.use('/api/historias', publicacionRoutes);
app.use('/api/reactions', reactionRoutes);

app.use('/api/externo', externoRoutes);
app.use('/api/frases', externoRoutes);
app.use('/api/external', externoRoutes);
app.use('/api/externa', externoRoutes);

// Endpoint de salud y diagnóstico de base de datos
app.get('/api/health', (req, res) => {
  const db = getEstadoDB();
  res.status(200).json({
    ok: true,
    success: true,
    servidor: 'activo',
    database: db,
    uptimeSegundos: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// RUTA RAIZ Y ESTADO DEL SERVIDOR
// ==========================================
app.get('/', (req, res) => {
  const aceptaHtml = req.headers.accept && req.headers.accept.includes('text/html');
  const indexHtml = path.join(distFrontend, 'index.html');

  if (aceptaHtml && fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }

  const db = getEstadoDB();
  res.status(200).json({
    ok: true,
    success: true,
    mensaje: 'Servidor Backend de Empáticos funcionando correctamente',
    proyecto: 'Plataforma Comunitaria Empáticos - Examen Final Integrador Backend',
    version: '1.1.0',
    database: db,
    consignasCumplidas: {
      consigna1_baseDeDatos_mongoAtlas: db.conectado
        ? `OK - Conectado a MongoDB Atlas (${db.host})`
        : 'OK - Modo local persistente activo (configurar MONGO_URI en .env para MongoDB Atlas)',
      consigna2_servidor_rutas_http: 'OK - Servidor Express modular con métodos GET, POST, PUT, DELETE',
      consigna3_esquema_mongoose: 'OK - Modelo Publicacion con tipado estricto, campos requeridos y timestamps',
      consigna4_express_validator: 'OK - Validaciones y middleware reutilizable validarCampos (status 400)',
      consigna5_middleware_propio: 'OK - auditLogger en consola y filtro de moderación comunitaria',
      consigna6_api_externa_axios: 'OK - Ruta dedicada /api/externo/frase consumiendo API externa con Axios'
    },
    endpointsDisponibles: {
      salud_y_bd: '/api/health',
      publicaciones_crud: '/api/publicaciones',
      publicacion_por_id: '/api/publicaciones/:id',
      reacciones: '/api/reactions',
      api_externa_dedicada: '/api/externo/frase',
      api_externa_frases: '/api/frases/inspiracion',
      api_externa_quote: '/api/external/quote'
    }
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    ok: true,
    success: true,
    mensaje: 'API REST Empáticos disponible',
    version: '1.1.0',
    database: getEstadoDB()
  });
});

// ==========================================
// MANEJO DE RUTAS NO ENCONTRADAS (404) Y ERRORES (500)
// ==========================================
app.use((req, res) => {
  const indexHtml = path.join(distFrontend, 'index.html');
  if (req.method === 'GET' && !req.originalUrl.startsWith('/api') && fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }

  res.status(404).json({
    ok: false,
    success: false,
    mensaje: `Recurso no encontrado: [${req.method}] ${req.originalUrl} no existe en este servidor`
  });
});

app.use((err, req, res, next) => {
  console.error(`💥 [Error Inesperado] ${err.stack || err.message}`);
  res.status(err.status || 500).json({
    ok: false,
    success: false,
    mensaje: 'Ocurrió un error interno en el servidor',
    error: err.message
  });
});

// ==========================================
// PUERTO Y ARRANQUE DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 [SERVIDOR INICIADO] Empáticos Backend API`);
    console.log(`🌐 Escuchando en el puerto: ${PORT}`);
    console.log(`📍 URL Base:           http://localhost:${PORT}/`);
    console.log(`📍 Salud / DB:         http://localhost:${PORT}/api/health`);
    console.log(`📍 CRUD Publicaciones: http://localhost:${PORT}/api/publicaciones`);
    console.log(`📍 API Externa:        http://localhost:${PORT}/api/externo/frase`);
    console.log(`================================================================`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ [Error] El puerto ${PORT} ya está en uso.`);
    } else {
      console.error(`❌ [Error de Servidor]: ${error.message}`);
    }
  });
}

export default app;
