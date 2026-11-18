import { body, param, validationResult } from 'express-validator';

/**
 * Middleware `validateFields` para capturar errores de express-validator.
 * Evalúa los resultados de validación y retorna un error 400 con el array de fallos.
 */
export const validateFields = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Errores de validación en los campos enviados',
      errores: errors.array().map(err => ({
        campo: err.path || err.param,
        mensaje: err.msg
      }))
    });
  }

  next();
};

/**
 * Reglas de validación para la creación de un elemento (POST /api/items)
 */
export const createItemValidator = [
  body('titulo')
    .notEmpty().withMessage('El título es obligatorio')
    .isString().withMessage('El título debe ser una cadena de texto')
    .trim()
    .isLength({ min: 5 }).withMessage('El título debe contener al menos 5 caracteres'),

  body('contenido')
    .notEmpty().withMessage('El contenido es obligatorio')
    .isString().withMessage('El contenido debe ser una cadena de texto')
    .trim()
    .isLength({ min: 10 }).withMessage('El contenido debe contener al menos 10 caracteres'),

  body('categoria')
    .notEmpty().withMessage('La categoría es obligatoria')
    .isString().withMessage('La categoría debe ser una cadena de texto')
    .trim(),

  validateFields
];

/**
 * Reglas de validación para la actualización de un elemento (PUT /api/items/:id)
 * Valida el parámetro ID como un MongoID correcto e inspecciona el cuerpo opcional.
 */
export const updateItemValidator = [
  param('id')
    .isMongoId().withMessage('El parámetro id debe ser un MongoID válido de 24 caracteres hex'),

  body('titulo')
    .optional()
    .isString().withMessage('El título debe ser una cadena de texto')
    .trim()
    .isLength({ min: 5 }).withMessage('El título debe contener al menos 5 caracteres'),

  body('contenido')
    .optional()
    .isString().withMessage('El contenido debe ser una cadena de texto')
    .trim()
    .isLength({ min: 10 }).withMessage('El contenido debe contener al menos 10 caracteres'),

  body('categoria')
    .optional()
    .isString().withMessage('La categoría debe ser texto')
    .trim(),

  validateFields
];

/**
 * Reglas de validación para parámetros ID en operaciones por identificador (GET/DELETE /api/items/:id)
 */
export const itemIdValidator = [
  param('id')
    .isMongoId().withMessage('El parámetro id debe ser un MongoID válido'),

  validateFields
];
