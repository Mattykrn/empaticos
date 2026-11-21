// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import { Router } from 'express';
import {
  obtenerTodasLasPublicaciones,
  obtenerPublicacionPorId,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
  toggleReaccion,
  agregarComentario
} from '../controllers/publicacion.controller.js';
import {
  validarIdPublicacion,
  validarCrearPublicacion,
  validarActualizarPublicacion,
  validarComentario
} from '../validators/publicacionValidator.js';

const router = Router();

// ==========================================
// RUTAS DE CONSULTA (GET)
// ==========================================
router.get('/', obtenerTodasLasPublicaciones);
router.get('/all', obtenerTodasLasPublicaciones);
router.get('/:id', validarIdPublicacion, obtenerPublicacionPorId);

// ==========================================
// RUTA DE CREACION (POST)
// ==========================================
router.post('/', validarCrearPublicacion, crearPublicacion);

// ==========================================
// RUTA DE ACTUALIZACION (PUT)
// ==========================================
router.put('/:id', validarActualizarPublicacion, actualizarPublicacion);

// ==========================================
// RUTA DE ELIMINACION (DELETE)
// ==========================================
router.delete('/:id', validarIdPublicacion, eliminarPublicacion);

// ==========================================
// RUTAS COMPLEMENTARIAS (REACCIONES Y COMENTARIOS)
// ==========================================
router.post('/:id/reacciones', validarIdPublicacion, toggleReaccion);
router.post('/:id/comentarios', validarComentario, agregarComentario);

export default router;
