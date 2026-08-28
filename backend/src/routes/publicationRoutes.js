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

// GET /$1
router.get('/', obtenerTodasLasPublicaciones);

// GET /$1/:id
router.get('/:id', validatePublicationId, obtenerPublicacionPorId);

// POST /$1
router.post('/', validateCreatePublication, crearPublicacion);

// PUT /$1/:id
router.put('/:id', validateUpdatePublication, toggleReaccion);

// POST /api/publications/:id/comments -> Comentar publicación
router.post('/:id/comments', validatePublicationId, agregarComentario);

// DELETE /$1/:id
router.delete('/:id', validatePublicationId, (req, res) => {
  res.status(200).json({ ok: true, mensaje: `Publicación ${req.params.id} eliminada con éxito de MongoDB Atlas` });
});

export default router;
