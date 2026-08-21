import { body, validationResult } from 'express-validator';

// En este middleware defino las reglas de validación y sanitización para las publicaciones.
// Normalizo dinámicamente los campos enviados por los formularios del frontend React (title -> titulo, content -> contenido)
// para asegurar que las solicitudes se procesen sin arrojar errores 400 inesperados.

export const validarPublicacion = [
  // Middleware previo de normalización y asignación de valores por defecto si vienen vacíos desde el cliente
  (req, res, next) => {
    if (req.body) {
      if (!req.body.titulo && req.body.title) req.body.titulo = req.body.title;
      if (!req.body.contenido && req.body.content) req.body.contenido = req.body.content;
      if (!req.body.autorNombre && req.body.authorName) req.body.autorNombre = req.body.authorName;
      if (req.body.isAnonymous) req.body.autorNombre = 'Anónimo';
      if (!req.body.tipo && req.body.type) req.body.tipo = req.body.type;
      
      // Asigno valores por defecto si no vienen especificados
      if (!req.body.titulo || req.body.titulo.trim() === '') req.body.titulo = 'Historia comunitaria de salud';
      if (!req.body.tipo) req.body.tipo = 'testimonio';
      if (!req.body.rolAutor) req.body.rolAutor = 'paciente';
      if (!req.body.categoria) req.body.categoria = 'general';
    }
    next();
  },

  // Valido que el título tenga al menos 3 caracteres
  body('titulo')
    .notEmpty()
    .withMessage('El título no puede estar totalmente vacío')
    .isString()
    .withMessage('El título debe ser un texto válido')
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('El título debe tener al menos 3 caracteres'),

  // Valido que el contenido tenga al menos 5 caracteres
  body('contenido')
    .notEmpty()
    .withMessage('El contenido o cuerpo del mensaje es obligatorio')
    .isString()
    .withMessage('El contenido debe ser texto')
    .trim()
    .isLength({ min: 5 })
    .withMessage('El contenido debe incluir al menos 5 caracteres explicativos'),

  // Permito cualquier categoría de tipo soportada por el cliente
  body('tipo')
    .optional()
    .isString()
    .trim(),

  // Rol del autor opcional con sanitización
  body('rolAutor')
    .optional()
    .isString()
    .trim(),

  // Categoria opcional
  body('categoria')
    .optional()
    .isString()
    .trim(),

  // Nombre del autor opcional
  body('autorNombre')
    .optional()
    .isString()
    .trim(),

  // En esta función evalúo los resultados obtenidos por mis reglas de validación
  (req, res, next) => {
    const errores = validationResult(req);

    // Si existen errores en el formulario, retorno respuesta 400 Bad Request explicativa
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        mensaje: 'Los datos enviados en el formulario no superan las validaciones mínimas',
        errores: errores.array().map(err => ({
          campo: err.path,
          mensaje: err.msg
        }))
      });
    }

    // Si las validaciones son exitosas, avanzo hacia el middleware de moderación o controlador
    next();
  }
];





