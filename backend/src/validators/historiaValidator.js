// Reglas de validación para el recurso Historias utilizando express-validator
// En este archivo defino las reglas de saneamiento y comprobación de datos para las peticiones de Historias.

import { body } from 'express-validator';

// En este arreglo configuro mis validaciones para la creación y edición de historias
export const validarHistoria = [
  // Aquí compruebo que el título sea un texto obligatoria con longitud mínima
  body('titulo')
    .notEmpty().withMessage('El título es un campo obligatorio')
    .isString().withMessage('El título debe ser una cadena de texto')
    .trim()
    .isLength({ min: 3 }).withMessage('El título debe contener al menos 3 caracteres'),

  // En esta regla aseguro que el contenido no esté vacío y posea suficiente descripción
  body('contenido')
    .notEmpty().withMessage('El contenido de la historia es un campo obligatorio')
    .isString().withMessage('El contenido debe ser una cadena de texto')
    .trim()
    .isLength({ min: 10 }).withMessage('El contenido debe explicitar al menos 10 caracteres'),

  // Aquí aseguro que el rol del autor coincida exactamente con los valores permitidos del enum
  body('rolAutor')
    .notEmpty().withMessage('El rol del autor es obligatorio')
    .isIn(['paciente', 'familiar', 'acompanante'])
    .withMessage('El rol del autor debe ser uno de los siguientes: paciente, familiar, acompanante'),

  // En esta regla opcional valido la estructura del campo autorNombre si estuviera presente
  body('autorNombre')
    .optional()
    .isString().withMessage('El nombre del autor debe ser un texto')
    .trim()
];
