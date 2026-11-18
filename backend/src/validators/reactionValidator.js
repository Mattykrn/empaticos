import { body } from 'express-validator';
import { validarCampos } from './storyValidator.js';

// Validar reacción
export const validarReaccion = [
  body('targetId')
    .notEmpty().withMessage('El campo targetId es obligatorio'),
  body('type')
    .optional()
    .isIn(['like', 'love', 'care', 'support', 'fuerza', 'abrazo', 'gracias'])
    .withMessage('Tipo de reacción inválido'),
  validarCampos
];
