// Definición de rutas HTTP para el recurso Noticias
// Archivo asocio los verbos HTTP (GET, POST, PUT, DELETE) para noticias con mis controladores y validaciones.

import { Router } from 'express';
import {
  obtenerNoticias,
  obtenerNoticiaPorId,
  crearNoticia,
  actualizarNoticia,
  eliminarNoticia
} from '../controllers/noticiaController.js';
import { validarNoticia } from '../validators/noticiaValidator.js';
import { validarCampos } from '../middlewares/validarCampos.js';

// Instancio mi enrutador de Express
const router = Router();

// GET /$1
router.get('/', obtenerNoticias);

// GET /$1/:id
router.get('/:id', obtenerNoticiaPorId);

// POST /$1
router.post('/', validarNoticia, validarCampos, crearNoticia);

// PUT /$1/:id
router.put('/:id', validarNoticia, validarCampos, actualizarNoticia);

// DELETE /$1/:id
router.delete('/:id', eliminarNoticia);

// Exporto mi router configurado de noticias
export default router;
