// Definición de rutas HTTP para el recurso Noticias
// En este archivo asocio los verbos HTTP (GET, POST, PUT, DELETE) para noticias con mis controladores y validaciones.

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

// GET /api/noticias -> Obtener todas las noticias publicadas
router.get('/', obtenerNoticias);

// GET /api/noticias/:id -> Consultar una noticia por su identificador ID
router.get('/:id', obtenerNoticiaPorId);

// POST /api/noticias -> Publicar noticia aplicando reglas express-validator y middleware propio validarCampos
router.post('/', validarNoticia, validarCampos, crearNoticia);

// PUT /api/noticias/:id -> Modificar datos de una noticia existente por su ID
router.put('/:id', validarNoticia, validarCampos, actualizarNoticia);

// DELETE /api/noticias/:id -> Borrar noticia por ID de la base de datos
router.delete('/:id', eliminarNoticia);

// Exporto mi router configurado de noticias
export default router;
