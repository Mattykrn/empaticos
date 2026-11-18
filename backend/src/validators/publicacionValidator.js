// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import { body, param } from 'express-validator';
import { validarCampos } from '../middlewares/validarCampos.js';





// ==========================================
// VALIDACION DE ID DE MONGO EN PARAMETROS
// ==========================================
// Me aseguro de que el id que viene por parámetro de la URL sea un MongoId válido
export const validarIdPublicacion = [
  param('id')
    .notEmpty().withMessage('El identificador ID en la ruta es obligatorio')
    .isMongoId().withMessage('El ID proporcionado no tiene una estructura válida de MongoDB ObjectId'),
  validarCampos
];





// ==========================================
// REGLAS DE VALIDACION PARA CREACION (POST)
// ==========================================
// Acá chequeo que el título y el contenido existan y tengan el largo necesario
export const validarCrearPublicacion = [
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
  validarCampos
];





// ==========================================
// REGLAS DE VALIDACION PARA EDICION (PUT)
// ==========================================
// Si van a actualizar, valido el id y si mandan título o contenido reviso su longitud
export const validarActualizarPublicacion = [
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
  validarCampos
];





// ==========================================
// EXPORTACION DE LOS VALIDADORES
// ==========================================
export const validatePublicationId = validarIdPublicacion;
export const validateCreatePublication = validarCrearPublicacion;
export const validateUpdatePublication = validarActualizarPublicacion;

export default {
  validarIdPublicacion,
  validarCrearPublicacion,
  validarActualizarPublicacion
};
