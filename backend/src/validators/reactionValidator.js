import { body } from 'express-validator';
import { validarCampos } from '../middlewares/validarCampos.js';

const TIPOS_VALIDOS = ['like', 'love', 'care', 'support', 'fuerza', 'abrazo', 'gracias'];

export const validarReaccion = [
  body('targetId')
    .notEmpty().withMessage('El campo targetId es obligatorio'),
  body('type')
    .optional()
    .isIn(TIPOS_VALIDOS)
    .withMessage('Tipo de reacción inválido'),
  body('tipo')
    .optional()
    .isIn(TIPOS_VALIDOS)
    .withMessage('Tipo de reacción inválido'),
  validarCampos
];
