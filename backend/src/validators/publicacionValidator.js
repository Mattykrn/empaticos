// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import { body, param } from 'express-validator';
import { validarCampos } from '../middlewares/validarCampos.js';

// Normalizo alias del frontend (content -> contenido, author -> autorNombre) antes de validar
const normalizarAliasPublicacion = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    if (req.body.contenido === undefined && req.body.content !== undefined) {
      req.body.contenido = req.body.content;
    }
    if (req.body.autorNombre === undefined && req.body.author !== undefined) {
      req.body.autorNombre = req.body.author;
    }
    if (typeof req.body.videoUrl === 'string' && req.body.videoUrl.trim()) {
      const urlLimpia = req.body.videoUrl.trim();
      req.body.videoUrl = /^https?:\/\//i.test(urlLimpia) ? urlLimpia : `https://${urlLimpia}`;
    }
  }
  next();
};

// ==========================================
// VALIDACION DE ID DE MONGO EN PARAMETROS
// ==========================================
export const validarIdPublicacion = [
  param('id')
    .notEmpty().withMessage('El identificador ID en la ruta es obligatorio')
    .isMongoId().withMessage('El ID proporcionado no tiene una estructura válida de MongoDB ObjectId'),
  validarCampos
];

// ==========================================
// REGLAS DE VALIDACION PARA CREACION (POST)
// ==========================================
export const validarCrearPublicacion = [
  normalizarAliasPublicacion,
  body('titulo')
    .trim()
    .notEmpty().withMessage('El título de la publicación es obligatorio')
    .isLength({ min: 3 }).withMessage('El título debe contener al menos 3 caracteres'),
  body('contenido')
    .trim()
    .notEmpty().withMessage('El contenido de la publicación no puede estar vacío')
    .isLength({ min: 5 }).withMessage('El contenido debe tener una extensión mínima de 5 caracteres'),
  body('rolAutor')
    .optional()
    .isIn(['paciente', 'familiar', 'acompanante', 'profesional', 'voluntario'])
    .withMessage('El rol de autor proporcionado no es válido'),
  body('videoUrl')
    .optional({ values: 'falsy' })
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('El enlace de video debe ser una URL válida (http:// o https://)'),
  validarCampos
];

// ==========================================
// REGLAS DE VALIDACION PARA EDICION (PUT)
// ==========================================
export const validarActualizarPublicacion = [
  normalizarAliasPublicacion,
  param('id')
    .notEmpty().withMessage('El identificador ID de la publicación a actualizar es obligatorio')
    .isMongoId().withMessage('El ID especificado debe tener un formato válido de MongoDB ObjectId'),
  body('titulo')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('El título actualizado debe tener al menos 3 caracteres'),
  body('contenido')
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage('El contenido actualizado debe tener al menos 5 caracteres'),
  body('rolAutor')
    .optional()
    .isIn(['paciente', 'familiar', 'acompanante', 'profesional', 'voluntario'])
    .withMessage('El rol de autor proporcionado no es válido'),
  body('videoUrl')
    .optional({ values: 'falsy' })
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('El enlace de video debe ser una URL válida (http:// o https://)'),
  validarCampos
];

// ==========================================
// REGLAS DE VALIDACION PARA COMENTARIOS
// ==========================================
export const validarComentario = [
  param('id')
    .notEmpty().withMessage('El identificador ID de la publicación es obligatorio')
    .isMongoId().withMessage('El ID especificado debe tener un formato válido de MongoDB ObjectId'),
  body('texto')
    .trim()
    .notEmpty().withMessage('El comentario no puede estar vacío')
    .isLength({ min: 2, max: 1000 }).withMessage('El comentario debe tener entre 2 y 1000 caracteres'),
  validarCampos
];

export const validatePublicationId = validarIdPublicacion;
export const validateCreatePublication = validarCrearPublicacion;
export const validateUpdatePublication = validarActualizarPublicacion;

export default {
  validarIdPublicacion,
  validarCrearPublicacion,
  validarActualizarPublicacion,
  validarComentario
};
