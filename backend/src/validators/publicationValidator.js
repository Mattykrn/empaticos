import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validator.js';

/**
 * Validaciones con express-validator para publicaciones / historias.
 * Incluye validación de parámetros de URL (param) con isMongoId() y del cuerpo (body).
 */

// Validación de parámetro de URL ID Mongo
export const validatePublicationId = [
  param('id')
    .notEmpty().withMessage('El ID de publicación es obligatorio en los parámetros de la URL')
    .isMongoId().withMessage('El ID proporcionado no tiene un formato válido de MongoDB ObjectId'),
  validateRequest
];

// Validación de creación de publicación / historia
export const validateCreatePublication = [
  body('titulo')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('El título debe tener al menos 3 caracteres'),
  body('contenido')
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage('El contenido debe tener al menos 5 caracteres'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage('El campo content debe contener al menos 5 caracteres'),
  validateRequest
];

// Validación de actualización de publicación por ID
export const validateUpdatePublication = [
  param('id')
    .notEmpty().withMessage('El ID de la publicación es obligatorio')
    .isMongoId().withMessage('El ID especificado debe ser un ObjectId válido de MongoDB'),
  body('titulo')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('El título debe contener al menos 3 caracteres'),
  body('contenido')
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage('El contenido debe contener al menos 5 caracteres'),
  validateRequest
];
