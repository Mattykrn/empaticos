import { body, validationResult } from 'express-validator';

// Con este middleware evalúo los resultados de mis validaciones y corto con 400 si hay errores
export const validarResultado = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Hay errores en los datos enviados',
      errors: errores.array().map(err => ({ campo: err.path, mensaje: err.msg }))
    });
  }
  next();
};

// Reglas para validar la creación o edición de historias
export const validarPublicacion = [
  body('titulo')
    .trim()
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ min: 5 }).withMessage('El título debe tener al menos 5 caracteres'),
  body('contenido')
    .trim()
    .notEmpty().withMessage('El contenido no puede estar vacío')
    .isLength({ min: 10 }).withMessage('El contenido debe tener al menos 10 caracteres'),
  body('tipoPublicacion')
    .optional()
    .isIn(['experiencia', 'mensaje_apoyo', 'debate']).withMessage('Tipo de publicación inválido'),
  body('tipoMultimedia')
    .optional()
    .isIn(['texto', 'video', 'audio']).withMessage('Tipo de multimedia inválido'),
  validarResultado
];

// Reglas para validar comentarios
export const validarComentario = [
  body('texto')
    .trim()
    .notEmpty().withMessage('El texto del comentario es obligatorio')
    .isLength({ min: 2 }).withMessage('El comentario debe contener al menos 2 caracteres'),
  validarResultado
];
