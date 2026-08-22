import express from 'express';
import {
  obtenerTodasLasPublicaciones,
  obtenerPublicacionPorId,
  crearPublicacion,
  toggleReaccion,
  agregarComentario
} from '../controllers/publicacion.controller.js';
import { verificarAutenticacion } from '../middlewares/authMiddleware.js';
import { validarPublicacion, validarComentario } from '../middlewares/validaciones.js';

const router = express.Router();

// Rutas de lectura (públicas para toda la comunidad)
router.get('/', obtenerTodasLasPublicaciones);
router.get('/:id', obtenerPublicacionPorId);

// Rutas protegidas: Requieren estar registrado y logueado
router.post('/', verificarAutenticacion, validarPublicacion, crearPublicacion);
router.post('/:id/reacciones', verificarAutenticacion, toggleReaccion);
router.post('/:id/comentarios', verificarAutenticacion, validarComentario, agregarComentario);

export default router;
