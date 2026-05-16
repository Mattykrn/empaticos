const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Habilitar CORS
app.use(cors());

// Parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Crear carpeta para guardar fotos
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Palabras prohibidas (básica lista para bloquear contenido explícito)
const palabrasProhibidas = [
  'pornografia', 'pornográfico', 'pornografico', 'xxx', 'sex', 'sexo', 'porno',
  'drogas', 'cocaina', 'heroina', 'marihuana', 'cripto', 'bitcoin', 'dinero facil',
  'estafa', 'fraude', 'ilegal', 'venta', 'droga', 'violencia', 'odio', 'racista'
];

// Función para validar contenido de texto
function validarTexto(texto) {
  const textoLower = texto.toLowerCase();
  
  // Verificar si contiene palabras prohibidas
  for (let palabra of palabrasProhibidas) {
    if (textoLower.includes(palabra)) {
      return {
        valido: false,
        motivo: `Contenido no permitido detectado: "${palabra}"`
      };
    }
  }
  
  // Validar que no sea SOLO spam/caracteres raros
  const palabrasValidas = texto.trim().split(/\s+/).length;
  if (palabrasValidas < 3) {
    return {
      valido: false,
      motivo: 'El testimonio debe tener al menos 3 palabras'
    };
  }
  
  return { valido: true };
}

// Función para validar imágenes
function validarImagen(file) {
  if (!file) {
    return { valido: true }; // La foto es opcional
  }
  
  // Validar tipos MIME permitidos
  const mimeTypesPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!mimeTypesPermitidos.includes(file.mimetype)) {
    return {
      valido: false,
      motivo: 'Solo se permiten imágenes (JPEG, PNG, WebP, GIF)'
    };
  }
  
  // Validar tamaño máximo (5MB)
  const tamanioMaximo = 5 * 1024 * 1024;
  if (file.size > tamanioMaximo) {
    return {
      valido: false,
      motivo: 'La imagen no debe superar 5MB'
    };
  }
  
  // Validar que el archivo sea una imagen real (verificar magic bytes)
  const buffer = file.buffer || fs.readFileSync(file.path);
  const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50;
  const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8;
  const isGIF = buffer[0] === 0x47 && buffer[1] === 0x49;
  const isWebP = buffer[8] === 0x57 && buffer[9] === 0x45;
  
  if (!isPNG && !isJPEG && !isGIF && !isWebP) {
    return {
      valido: false,
      motivo: 'El archivo no parece ser una imagen válida'
    };
  }
  
  return { valido: true };
}

// Configurar multer para subir fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB máximo
});

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Servir la carpeta uploads de forma estática
app.use('/uploads', express.static(uploadsDir));

// Ruta raíz para servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicializar base de datos SQLite
const db = new sqlite3.Database('./testimonios.db', (err) => {
  if (err) {
    console.error('Error al conectar a SQLite:', err);
  } else {
    console.log('Conectado a SQLite');
    
    // Crear tabla si no existe
    db.run(`
      CREATE TABLE IF NOT EXISTS testimonios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        testimonio TEXT NOT NULL,
        ubicacion TEXT NOT NULL,
        foto TEXT,
        aprobado INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error al crear tabla:', err);
      } else {
        // Verificar si la columna 'aprobado' existe
        db.all("PRAGMA table_info(testimonios)", (err, columns) => {
          if (!err && columns) {
            const tieneAprobado = columns.some(col => col.name === 'aprobado');
            
            // Si no existe la columna, agregarla
            if (!tieneAprobado) {
              db.run('ALTER TABLE testimonios ADD COLUMN aprobado INTEGER DEFAULT 1', (err) => {
                if (err) {
                  console.error('Error al agregar columna aprobado:', err);
                } else {
                  console.log('Columna aprobado agregada a la tabla');
                }
              });
            }
          }
        });
      }
    });
  }
});

// Ruta para guardar un testimonio con foto
app.post('/api/testimonios', upload.single('imagen'), (req, res) => {
  const { nombre, testimonio, ubicacion } = req.body;
  
  // Validar campos requeridos
  if (!nombre || !testimonio || !ubicacion) {
    if (req.file) fs.unlinkSync(req.file.path); // Eliminar foto si existe
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  // Validar contenido de texto
  const validacionTexto = validarTexto(testimonio);
  if (!validacionTexto.valido) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: validacionTexto.motivo });
  }
  
  // Validar imagen si se subió
  if (req.file) {
    const validacionImagen = validarImagen(req.file);
    if (!validacionImagen.valido) {
      fs.unlinkSync(req.file.path); // Eliminar archivo inválido
      return res.status(400).json({ error: validacionImagen.motivo });
    }
  }
  
  const foto = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(
    'INSERT INTO testimonios (nombre, testimonio, ubicacion, foto, aprobado) VALUES (?, ?, ?, ?, 1)',
    [nombre, testimonio, ubicacion, foto],
    function (err) {
      if (err) {
        console.error('Error al guardar testimonio:', err);
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(500).json({ error: 'Error al guardar testimonio' });
      }
      res.json({
        id: this.lastID,
        nombre,
        testimonio,
        ubicacion,
        foto,
        mensaje: 'Testimonio guardado exitosamente'
      });
    }
  );
});

// Ruta para obtener todos los testimonios aprobados
app.get('/api/testimonios', (req, res) => {
  db.all('SELECT * FROM testimonios WHERE aprobado = 1 ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      console.error('Error al obtener testimonios:', err);
      return res.status(500).json({ error: 'Error al obtener testimonios' });
    }
    res.json(rows);
  });
});

// Ruta para obtener un testimonio por ID
app.get('/api/testimonios/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM testimonios WHERE id = ? AND aprobado = 1', [id], (err, row) => {
    if (err) {
      console.error('Error al obtener testimonio:', err);
      return res.status(500).json({ error: 'Error al obtener testimonio' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Testimonio no encontrado' });
    }
    res.json(row);
  });
});

// Ruta para eliminar un testimonio
app.delete('/api/testimonios/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM testimonios WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Error al eliminar testimonio:', err);
      return res.status(500).json({ error: 'Error al eliminar testimonio' });
    }
    res.json({ mensaje: 'Testimonio eliminado' });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
