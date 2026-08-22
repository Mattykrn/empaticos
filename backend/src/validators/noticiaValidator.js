// Reglas de validación para el recurso Noticias utilizando express-validator
// En este archivo configuro mis comprobaciones de datos para la creación e interacción con noticias.

import { body } from 'express-validator';

// En este conjunto de reglas especifico los requisitos exigidos para dar de alta o editar noticias
export const validarNoticia = [
  // Aquí confirmo que el título exista y cumpla con la longitud adecuada
  body('titulo')
    .notEmpty().withMessage('El título de la noticia es obligatorio')
    .isString().withMessage('El título debe ser una cadena de caracteres')
    .trim()
    .isLength({ min: 5 }).withMessage('El título debe tener al menos 5 caracteres'),

  // En esta regla exijo la categoría temática de la noticia
  body('categoria')
    .notEmpty().withMessage('La categoría es un campo obligatorio')
    .isString().withMessage('La categoría debe ser texto')
    .trim(),

  // Aquí verifico la presencia y extensión del resumen informativa
  body('resumen')
    .notEmpty().withMessage('El resumen es obligatorio')
    .isString().withMessage('El resumen debe ser texto')
    .trim()
    .isLength({ min: 10 }).withMessage('El resumen debe contener al menos 10 caracteres'),

  // En este validador garantizo la obligatoriedad del nombre del autor de la noticia
  body('autor')
    .notEmpty().withMessage('El autor de la noticia es obligatorio')
    .isString().withMessage('El autor debe ser una cadena de texto')
    .trim(),

  // Aquí compruebo de forma opcional que el formato de imagen sea una URL adecuada en caso de ser provista
  body('imagen')
    .optional()
    .isString().withMessage('La imagen debe ser una URL o texto de ruta')
    .trim()
];
