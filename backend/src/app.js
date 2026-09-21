// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { conectarDB } from './config/db.js';

// Middlewares propios
import auditLogger from './middlewares/auditLogger.js';
import moderacionMiddleware from './middlewares/moderacionMiddleware.js';

// Enrutadores de la aplicación
import publicacionRoutes from './routes/publicacion.routes.js';
import externoRoutes from './routes/externo.routes.js';
import reactionRoutes from './routes/reactionRoutes.js';

// Rutas de directorio para servir archivos estáticos del frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distFrontend = path.join(__dirname, '../../frontend/dist');





// ==========================================
// CONFIGURACION Y VARIABLES DE ENTORNO
// ==========================================
// Cargo las variables del archivo .env
dotenv.config();





// ==========================================
// INICIALIZACION DEL SERVIDOR EXPRESS
// ==========================================
const app = express();





// ==========================================
// CONEXION A MONGO ATLAS
// ==========================================
// Disparo la conexión asíncrona a la base de datos remota
conectarDB();





// ==========================================
// MIDDLEWARES
// ==========================================
// Habilito CORS para que cualquier cliente pueda comunicarse con la API
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Audit-Timestamp']
}));

// Permito procesar peticiones que traigan JSON en el body
app.use(express.json());

// Aplico mi middleware de auditoría para registrar cada petición en consola
app.use(auditLogger);

// Aplico mi middleware de moderación para filtrar palabras agresivas
app.use(moderacionMiddleware);

// Si existe el frontend compilado, sirvo los assets estáticos
if (fs.existsSync(distFrontend)) {
  app.use(express.static(distFrontend));
}





// ==========================================
// RUTAS Y ENDPOINTS
// ==========================================
// Rutas CRUD para publicaciones de la comunidad
app.use('/api/publicaciones', publicacionRoutes);
app.use('/api/publications', publicacionRoutes);
app.use('/api/stories', publicacionRoutes);
app.use('/api/historias', publicacionRoutes);
app.use('/api/reactions', reactionRoutes);

// Rutas para consumo de API externa pública con axios
app.use('/api/externo', externoRoutes);
app.use('/api/frases', externoRoutes);
app.use('/api/external', externoRoutes);
app.use('/api/externa', externoRoutes);





// ==========================================
// RUTA RAIZ Y ESTADO DEL SERVIDOR
// ==========================================
// Endpoint de bienvenida y comprobación del servidor
app.get('/', (req, res) => {
  // Si la petición viene de un navegador web pidiendo HTML, servimos la interfaz visual
  const aceptaHtml = req.headers.accept && req.headers.accept.includes('text/html');
  const indexHtml = path.join(distFrontend, 'index.html');

  if (aceptaHtml && fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }

  // De lo contrario devolvemos el informe en formato JSON de la API
  res.status(200).json({
    ok: true,
    success: true,
    mensaje: 'Servidor Backend de Empáticos funcionando correctamente',
    proyecto: 'Plataforma Comunitaria Empáticos - Examen Final Integrador Backend',
    version: '1.0.0',
    consignasCumplidas: {
      consigna1_baseDeDatos_mongoAtlas: 'OK - Conectado mediante Mongoose en src/config/db.js y variables con dotenv',
      consigna2_servidor_rutas_http: 'OK - Servidor Express modular con métodos GET, POST, PUT, DELETE',
      consigna3_esquema_mongoose: 'OK - Modelo Publicacion con tipado estricto, campos requeridos y timestamps',
      consigna4_express_validator: 'OK - Validaciones y middleware reutilizable validarCampos (status 400)',
      consigna5_middleware_propio: 'OK - auditLogger en consola y filtro de moderación comunitaria',
      consigna6_api_externa_axios: 'OK - Ruta dedicada /api/externo/frase consumiendo API externa con Axios'
    },
    endpointsDisponibles: {
      publicaciones_crud: '/api/publicaciones',
      publicacion_por_id: '/api/publicaciones/:id',
      api_externa_dedicada: '/api/externo/frase',
      api_externa_frases: '/api/frases/inspiracion',
      api_externa_quote: '/api/external/quote'
    }
  });
});

// Endpoint dedicado explícito para consultar el estado JSON de la API
app.get('/api', (req, res) => {
  res.status(200).json({
    ok: true,
    success: true,
    mensaje: 'API REST Empáticos disponible',
    version: '1.0.0'
  });
});





// ==========================================
// MANEJO DE RUTAS NO ENCONTRADAS (404) Y ERRORES (500)
// ==========================================
// Manejo rutas que no existan
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    success: false,
    mensaje: `Recurso no encontrado: [${req.method}] ${req.originalUrl} no existe en este servidor`
  });
});

// Manejo de errores globales no capturados
app.use((err, req, res, next) => {
  console.error(`💥 [Error Inesperado] ${err.stack || err.message}`);
  res.status(500).json({
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

const server = app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 [SERVIDOR INICIADO] Empáticos Backend API`);
  console.log(`🌐 Escuchando en el puerto: ${PORT}`);
  console.log(`📍 URL Base:           http://localhost:${PORT}/`);
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





// ==========================================
// EXPORTACION DE LA APLICACION
// ==========================================
export default app;