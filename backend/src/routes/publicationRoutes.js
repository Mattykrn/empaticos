import { Router } from 'express';
import {
  obtenerTodasLasPublicaciones,
  obtenerPublicacionPorId,
  crearPublicacion,
  toggleReaccion,
  agregarComentario
} from '../controllers/publicacion.controller.js';
import {
  validateCreatePublication,
  validateUpdatePublication,
  validatePublicationId
} from '../validators/publicationValidator.js';

const router = Router();

// GET /api/publications -> Leer todas las publicaciones desde MongoDB Atlas
router.get('/', obtenerTodasLasPublicaciones);

// GET /api/publications/:id -> Leer una publicación con validación isMongoId()
router.get('/:id', validatePublicationId, obtenerPublicacionPorId);

// POST /api/publications -> Crear nueva publicación con express-validator
router.post('/', validateCreatePublication, crearPublicacion);

// PUT /api/publications/:id -> Reaccionar o actualizar publicación con validación
router.put('/:id', validateUpdatePublication, toggleReaccion);

// POST /api/publications/:id/comments -> Comentar publicación
router.post('/:id/comments', validatePublicationId, agregarComentario);

// DELETE /api/publications/:id -> Eliminar publicación con validación isMongoId()
router.delete('/:id', validatePublicationId, (req, res) => {
  res.status(200).json({ ok: true, mensaje: `Publicación ${req.params.id} eliminada con éxito de MongoDB Atlas` });
});

export default router;
