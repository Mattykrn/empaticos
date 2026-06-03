const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const dataPath = path.join(__dirname, 'data', 'db.json');

// CORS habilitado para cualquier origen.
// Esto permite que la app cargada desde file:// o desde otro servidor local
// pueda comunicarse con el backend en localhost:4000.
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

async function readDb() {
  const content = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(content);
}

async function writeDb(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
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

  const newEntry = {
    id: Date.now(),
    name: anonymous ? 'Anónimo' : name || 'Amigo EMpaticos',
    type,
    story,
    anonymous: Boolean(anonymous),
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

app.listen(PORT, async () => {
  await ensureDb();
  console.log(`Servidor Node.js arrancado en http://localhost:${PORT}`);
});
