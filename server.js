const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const store = require('./server/store');
const cloudinary = require('./server/cloudinary');
const auth = require('./server/auth');
const adminAuth = require('./server/middleware/adminAuth');

const app = express();
const PORT = process.env.PORT || 4000;
const uploadsPath = path.join(__dirname, 'uploads');
const inMemoryUploads = new Map();

// Configuración de CORS más segura.
// En desarrollo permitimos localhost.
// En producción, permitimos cualquier origen (para Vercel/Render) o el dominio específico.
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['*'] // En producción permitimos todos los orígenes (el frontend puede estar en Vercel, Render, etc.)
  : ['http://localhost:3000', 'http://localhost:4000', 'http://127.0.0.1:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  credentials: true,
}));

// Límite ampliado para permitir subida de imágenes en base64.
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, '.')));

app.get('/uploads/:filename', (req, res, next) => {
  const { filename } = req.params;
  if (inMemoryUploads.has(filename)) {
    const item = inMemoryUploads.get(filename);
    res.setHeader('Content-Type', item.mimeType);
    return res.send(item.buffer);
  }
  next();
});
app.use('/uploads', express.static(uploadsPath));

// En producción, servir el frontend built desde /dist
const distPath = path.join(__dirname, 'dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distPath));
}

// ─────────────────────────────────────────────────────────────
// Constantes del schema
// ─────────────────────────────────────────────────────────────

const ENTRY_TYPES = ['historia', 'anecdota', 'video', 'diagnostico', 'galeria'];
const EM_TYPES = ['SCA', 'EMRR', 'EMPP', 'EMSP', 'Otro'];
const MEDIA_TYPES = ['none', 'youtube', 'image', 'audio'];
const REACTIONS = ['hearts', 'laughs', 'hugs'];
const STATUSES = ['pending', 'approved'];
const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

// ─────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────

function generateId() {
  return crypto.randomUUID();
}

/**
 * Sanitiza un string eliminando caracteres peligrosos.
 * Previene inyección de código y XSS básico.
 */
function sanitizeString(str, maxLength = 20000) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, maxLength);
}

function sanitizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  const seen = new Set();
  const clean = [];
  for (const raw of tags) {
    const tag = sanitizeString(raw, 40).toLowerCase();
    if (tag && !seen.has(tag) && clean.length < 8) {
      seen.add(tag);
      clean.push(tag);
    }
  }
  return clean;
}

function sanitizeEmType(value) {
  const v = sanitizeString(value, 20);
  return EM_TYPES.includes(v) ? v : null;
}

/**
 * Valida el identificador anónimo de visitante (generado en el navegador).
 */
function sanitizeVisitorId(value) {
  const v = sanitizeString(value, 100);
  return /^[a-zA-Z0-9_-]{8,100}$/.test(v) ? v : null;
}

/**
 * Valida el avatar emoji (máximo un carácter gráfico).
 */
function sanitizeAvatar(value) {
  const v = sanitizeString(value, 8);
  return v.length > 0 ? v : null;
}

/**
 * Sanitiza una lista de URLs de imágenes (para galerías).
 * Solo se aceptan archivos del backend (/uploads/...) o de Cloudinary
 * (https://res.cloudinary.com/...).
 */
function sanitizeMediaUrls(urls) {
  if (!Array.isArray(urls)) return [];
  const seen = new Set();
  const clean = [];
  for (const raw of urls) {
    const url = sanitizeString(raw, 1000);
    const allowed = url.startsWith('/uploads/') || url.startsWith('https://res.cloudinary.com/');
    if (url && allowed && !seen.has(url) && clean.length < 30) {
      seen.add(url);
      clean.push(url);
    }
  }
  return clean;
}

/**
 * Extrae el ID de YouTube de cualquier formato conocido y
 * devuelve una URL segura de embed.
 */
function extractYoutubeId(url) {
  if (typeof url !== 'string') return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

function normalizeMediaUrl(mediaType, url) {
  const value = sanitizeString(url, 1000);
  if (mediaType === 'youtube' && value) {
    const id = extractYoutubeId(value);
    return id ? `https://www.youtube.com/embed/${id}` : value;
  }
  return value;
}

function emptyReactions() {
  return { hearts: 0, laughs: 0, hugs: 0 };
}

async function ensureDb() {
  store.ensureData();
  await fs.mkdir(uploadsPath, { recursive: true });
}

function sortByNewest(entries) {
  return [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function sortByNewest(entries) {
  return [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ─────────────────────────────────────────────────────────────
// Rutas públicas
// ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Node.js funcionando' });
});

// Login del admin. Devuelve { token, user }.
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const result = await auth.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message || 'Credenciales inválidas.' });
  }
});

// Verifica un token del admin. Header: Authorization: Bearer <token>.
app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' });
    }
    const token = authHeader.substring(7);
    const user = await auth.verifyToken(token);
    res.json({ valid: true, user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Estadísticas para la comunidad
app.get('/api/stats', async (req, res) => {
  try {
    res.json(await store.getStats());
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron calcular las estadísticas.' });
  }
});

// Obtener entradas aprobadas (público). Filtro opcional por ?type=
app.get('/api/entries', async (req, res) => {
  try {
    const filters = { status: 'approved' };
    if (req.query.type && ENTRY_TYPES.includes(req.query.type)) filters.type = req.query.type;
    const entries = await store.getAllEntries(filters);
    res.json({ entries });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo leer la base de datos.' });
  }
});

// Crear una entrada nueva (queda pendiente de moderación)
app.post('/api/entries', async (req, res) => {
  const body = req.body || {};
  const type = sanitizeString(body.type, 20) || 'historia';

  if (!ENTRY_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Tipo de entrada no válido.' });
  }

  const content = sanitizeString(body.content);
  if (!content) {
    return res.status(400).json({ error: 'El contenido es obligatorio.' });
  }

  const mediaType = MEDIA_TYPES.includes(body.mediaType) ? body.mediaType : 'none';
  const isAnonymous = Boolean(body.isAnonymous);
  const visitorId = sanitizeVisitorId(body.visitorId);

  const newEntry = {
    id: generateId(),
    type,
    title: sanitizeString(body.title, 200),
    content,
    mediaType,
    mediaUrl: normalizeMediaUrl(mediaType, body.mediaUrl),
    mediaUrls: type === 'galeria' ? sanitizeMediaUrls(body.mediaUrls) : [],
    emType: sanitizeEmType(body.emType),
    tags: sanitizeTags(body.tags),
    authorName: isAnonymous ? 'Anónimo' : (sanitizeString(body.authorName, 80) || 'Amigo EMpaticos'),
    isAnonymous,
    visitorId,
    status: 'pending',
    reactions: emptyReactions(),
    comments: [],
    createdAt: new Date().toISOString(),
  };

  try {
    await store.createEntry(newEntry);
    res.status(201).json({ entry: newEntry });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo guardar la entrada.' });
  }
});

// Entradas del propio visitante (incluye pendientes, para el perfil)
app.get('/api/entries/mine', async (req, res) => {
  const visitorId = sanitizeVisitorId(req.query.visitorId);
  if (!visitorId) {
    return res.status(400).json({ error: 'Identificador de visitante no válido.' });
  }
  try {
    const mine = await store.getAllEntries({ visitorId });
    res.json({ entries: mine });
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron leer tus entradas.' });
  }
});

// Reaccionar a una entrada (corazones, abrazos, risas)
app.post('/api/entries/:id/react', async (req, res) => {
  const { reaction } = req.body || {};

  if (!REACTIONS.includes(reaction)) {
    return res.status(400).json({ error: 'Reacción no válida.' });
  }

  try {
    const entry = await store.addReaction(req.params.id, reaction);
    if (!entry) {
      return res.status(404).json({ error: 'Entrada no encontrada.' });
    }
    res.json({ entry });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo registrar la reacción.' });
  }
});

// ─────────────────────────────────────────────────────────────
// Comentarios
// ─────────────────────────────────────────────────────────────

// Agregar un comentario a una entrada
app.post('/api/entries/:id/comments', async (req, res) => {
  const body = req.body || {};
  const text = sanitizeString(body.text, 2000);

  if (!text) {
    return res.status(400).json({ error: 'El comentario no puede estar vacío.' });
  }

  try {
    const entry = await store.getEntryById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entrada no encontrada.' });
    }
    if (entry.status !== 'approved') {
      return res.status(403).json({ error: 'No se pueden comentar entradas pendientes.' });
    }

    const comment = {
      id: generateId(),
      authorName: sanitizeString(body.authorName, 80) || 'Anónimo',
      avatar: sanitizeAvatar(body.avatar),
      visitorId: sanitizeVisitorId(body.visitorId),
      text,
      createdAt: new Date().toISOString(),
    };

    const updated = await store.addComment(req.params.id, comment);
    if (!updated) {
      return res.status(404).json({ error: 'Entrada no encontrada.' });
    }
    res.status(201).json({ entry: updated });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo guardar el comentario.' });
  }
});

// Eliminar un comentario (solo administración)
app.delete('/api/entries/:id/comments/:commentId', adminAuth, async (req, res) => {
  try {
    const entry = await store.getEntryById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entrada no encontrada.' });
    }

    const updated = await store.deleteComment(req.params.id, req.params.commentId);
    if (!updated) {
      return res.status(404).json({ error: 'Comentario no encontrado.' });
    }

    res.json({ entry: updated });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar el comentario.' });
  }
});

// ─────────────────────────────────────────────────────────────
// Favoritos (identificados por visitante anónimo)
// ─────────────────────────────────────────────────────────────

// Listar los IDs favoritos de un visitante
app.get('/api/favorites/:visitorId', async (req, res) => {
  const visitorId = sanitizeVisitorId(req.params.visitorId);
  if (!visitorId) {
    return res.status(400).json({ error: 'Identificador de visitante no válido.' });
  }

  try {
    const entryIds = await store.getFavorites(visitorId);
    res.json({ entryIds });
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron leer los favoritos.' });
  }
});

// Marcar una entrada como favorita
app.post('/api/favorites/:visitorId/:entryId', async (req, res) => {
  const visitorId = sanitizeVisitorId(req.params.visitorId);
  if (!visitorId) {
    return res.status(400).json({ error: 'Identificador de visitante no válido.' });
  }

  try {
    const entry = await store.getEntryById(req.params.entryId);
    if (!entry) {
      return res.status(404).json({ error: 'Entrada no encontrada.' });
    }

    const entryIds = await store.addFavorite(visitorId, entry.id);
    res.json({ entryIds });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo guardar el favorito.' });
  }
});

// Quitar una entrada de favoritos
app.delete('/api/favorites/:visitorId/:entryId', async (req, res) => {
  const visitorId = sanitizeVisitorId(req.params.visitorId);
  if (!visitorId) {
    return res.status(400).json({ error: 'Identificador de visitante no válido.' });
  }

  try {
    const entryIds = await store.removeFavorite(visitorId, req.params.entryId);
    res.json({ entryIds });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo quitar el favorito.' });
  }
});

// ─────────────────────────────────────────────────────────────
// Subida de imágenes (base64)
// ─────────────────────────────────────────────────────────────

app.post('/api/upload', async (req, res) => {
  const { filename, mimeType, data } = req.body || {};

  if (!IMAGE_MIME.has(mimeType)) {
    return res.status(400).json({ error: 'Solo se permiten imágenes JPG, PNG, WEBP o GIF.' });
  }
  if (typeof data !== 'string' || !/^[A-Za-z0-9+/=\s]+$/.test(data)) {
    return res.status(400).json({ error: 'Datos de imagen inválidos.' });
  }

  let buffer;
  try {
    buffer = Buffer.from(data, 'base64');
  } catch (error) {
    return res.status(400).json({ error: 'Datos de imagen inválidos.' });
  }

  if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
    return res.status(400).json({ error: 'La imagen debe pesar menos de 8 MB.' });
  }

  const safeName = sanitizeString(filename, 80) || 'imagen';

  try {
    // Cloudinary en producción; filesystem local como fallback.
    if (cloudinary.USE_CLOUDINARY) {
      const result = await cloudinary.uploadImage(buffer, { filename: safeName });
      res.status(201).json({
        url: result.url,
        publicId: result.publicId,
        filename: safeName,
      });
      return;
    }

    const ext = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
    const randomName = `${crypto.randomBytes(12).toString('hex')}.${ext}`;
    const targetPath = path.join(uploadsPath, randomName);
    try {
      await fs.writeFile(targetPath, buffer);
    } catch (writeError) {
      console.warn('Advertencia: No se pudo guardar la imagen en disco. Usando fallback en memoria.', writeError.message);
      inMemoryUploads.set(randomName, { buffer, mimeType });
    }
    res.status(201).json({ url: `/uploads/${randomName}`, filename: safeName });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo guardar la imagen.' });
  }
});

// ─────────────────────────────────────────────────────────────
// Rutas de administración (requieren x-admin-password)
// ─────────────────────────────────────────────────────────────

// Obtener todas las entradas (para moderar)
app.get('/api/entries/all', adminAuth, async (req, res) => {
  try {
    const entries = await store.getAllEntries();
    res.json({ entries: sortByNewest(entries) });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo leer la base de datos.' });
  }
});

// Aprobar / rechazar una entrada
app.patch('/api/entries/:id/status', adminAuth, async (req, res) => {
  const { status } = req.body || {};

  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Estado no válido. Usá "pending" o "approved".' });
  }

  try {
    const entry = await store.updateEntry(req.params.id, { status });
    if (!entry) {
      return res.status(404).json({ error: 'Entrada no encontrada.' });
    }
    res.json({ entry });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar la entrada.' });
  }
});

// Eliminar una entrada
app.delete('/api/entries/:id', adminAuth, async (req, res) => {
  try {
    const deleted = await store.deleteEntry(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Entrada no encontrada.' });
    }
    res.json({ message: 'Entrada eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar la entrada.' });
  }
});

// ─────────────────────────────────────────────────────────────
// Endpoints legacy (compatibilidad con /api/stories)
// ─────────────────────────────────────────────────────────────

app.get('/api/stories', async (req, res) => {
  try {
    const entries = await store.getAllEntries({ status: 'approved', type: 'historia' });
    const stories = entries.map((e) => ({
      id: e.id,
      name: e.authorName,
      type: e.emType || 'Otro',
      story: e.content,
      anonymous: e.isAnonymous,
      approved: e.status === 'approved',
      createdAt: e.createdAt,
    }));
    res.json({ stories });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo leer la base de datos.' });
  }
});

app.post('/api/stories', async (req, res) => {
  const { name, type, story, anonymous } = req.body;

  if (!type || !story) {
    return res.status(400).json({ error: 'El tipo de EM y la historia son obligatorios.' });
  }

  const newEntry = {
    id: generateId(),
    type: 'historia',
    title: sanitizeString(name, 80) || 'Amigo EMpaticos',
    content: sanitizeString(story),
    mediaType: 'none',
    mediaUrl: '',
    mediaUrls: [],
    emType: sanitizeEmType(type),
    tags: [],
    authorName: anonymous ? 'Anónimo' : (sanitizeString(name, 80) || 'Amigo EMpaticos'),
    isAnonymous: Boolean(anonymous),
    visitorId: null,
    status: 'pending',
    reactions: emptyReactions(),
    comments: [],
    createdAt: new Date().toISOString(),
  };

  try {
    await store.createEntry(newEntry);
    res.status(201).json({ story: { id: newEntry.id, ...newEntry } });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo guardar la historia.' });
  }
});

app.get('/api/stories/all', adminAuth, async (req, res) => {
  try {
    const entries = await store.getAllEntries({ type: 'historia' });
    const stories = entries.map((e) => ({
      id: e.id,
      name: e.authorName,
      type: e.emType || 'Otro',
      story: e.content,
      anonymous: e.isAnonymous,
      approved: e.status === 'approved',
      createdAt: e.createdAt,
    }));
    res.json({ stories });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo leer la base de datos.' });
  }
});

app.patch('/api/stories/:id/approve', adminAuth, async (req, res) => {
  try {
    const entry = await store.updateEntry(req.params.id, { status: 'approved' });
    if (!entry) {
      return res.status(404).json({ error: 'Historia no encontrada.' });
    }
    res.json({ story: { id: entry.id, ...entry } });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo aprobar la historia.' });
  }
});

app.delete('/api/stories/:id', adminAuth, async (req, res) => {
  try {
    const deleted = await store.deleteEntry(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Historia no encontrada.' });
    }
    res.json({ message: 'Historia eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar la historia.' });
  }
});

// Catch-all para SPA routing en producción (solo cuando corre como servidor standalone).
// En Vercel el frontend lo sirve el hosting estático y el catch-all no aplica.
if (require.main === module && process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (require.main === module) {
  app.listen(PORT, async () => {
    await ensureDb();
    console.log(`Servidor Node.js arrancado en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Base de datos: ${store.USE_FIRESTORE ? 'Firebase Firestore' : 'JSON local (data/db.json)'}`);
    console.log(`Imágenes: ${cloudinary.USE_CLOUDINARY ? 'Cloudinary' : 'Filesystem local (uploads/)'}`);
    console.log(`[Auth] Admin: ${auth.isFirebaseAuthEnabled() ? 'Firebase Auth 🔐' : 'Contraseña simple 🔑'}`);
  });
}

module.exports = app;
