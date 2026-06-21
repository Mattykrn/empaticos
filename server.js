const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const dataPath = path.join(__dirname, 'data', 'db.json');

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

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '.')));

// En producción, servir el frontend built desde /dist
const distPath = path.join(__dirname, 'dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distPath));
}

async function readDb() {
  const content = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(content);
}

async function writeDb(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Sanitiza un string eliminando caracteres peligrosos.
 * Previene inyección de código y XSS básico.
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

async function ensureDb() {
  try {
    await fs.access(dataPath);
  } catch (error) {
    const initial = { stories: [] };
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await writeDb(initial);
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Node.js funcionando' });
});

// Catch-all para SPA routing en producción
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.get('/api/stories', async (req, res) => {
  try {
    const db = await readDb();
    res.json({ stories: db.stories || [] });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo leer la base de datos.' });
  }
});

app.post('/api/stories', async (req, res) => {
  const { name, type, story, anonymous } = req.body;

  if (!type || !story) {
    return res.status(400).json({ error: 'El tipo de EM y la historia son obligatorios.' });
  }

  // Sanitizar inputs del usuario
  const sanitizedName = anonymous ? 'Anónimo' : sanitizeString(name || 'Amigo EMpaticos');
  const sanitizedType = sanitizeString(type);
  const sanitizedStory = sanitizeString(story);

  const newEntry = {
    id: Date.now(),
    name: sanitizedName,
    type: sanitizedType,
    story: sanitizedStory,
    anonymous: Boolean(anonymous),
    approved: false,
    createdAt: new Date().toISOString()
  };

  try {
    const db = await readDb();
    db.stories = db.stories || [];
    db.stories.unshift(newEntry);
    await writeDb(db);
    res.status(201).json({ story: newEntry });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo guardar la historia.' });
  }
});

// Endpoints de administración

// Obtener todas las historias (para el panel de admin)
app.get('/api/stories/all', async (req, res) => {
  try {
    const db = await readDb();
    res.json({ stories: db.stories || [] });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo leer la base de datos.' });
  }
});

// Aprobar una historia
app.patch('/api/stories/:id/approve', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const db = await readDb();
    const story = db.stories.find(s => s.id === id);

    if (!story) {
      return res.status(404).json({ error: 'Historia no encontrada.' });
    }

    story.approved = true;
    await writeDb(db);
    res.json({ story });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo aprobar la historia.' });
  }
});

// Eliminar una historia
app.delete('/api/stories/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const db = await readDb();
    const initialLength = db.stories.length;
    db.stories = db.stories.filter(s => s.id !== id);

    if (db.stories.length === initialLength) {
      return res.status(404).json({ error: 'Historia no encontrada.' });
    }

    await writeDb(db);
    res.json({ message: 'Historia eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar la historia.' });
  }
});

app.listen(PORT, async () => {
  await ensureDb();
  console.log(`Servidor Node.js arrancado en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});
