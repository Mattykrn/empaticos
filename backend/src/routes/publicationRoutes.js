import { Router } from 'express';
import {
  obtenerHistorias as obtenerPublicaciones,
  crearHistoria as crearPublicacion
} from '../controllers/storyController.js';
import {
  validateCreatePublication,
  validateUpdatePublication,
  validatePublicationId
} from '../validators/publicationValidator.js';

const router = Router();

// GET /api/publications -> Leer todas las publicaciones
router.get('/', obtenerPublicaciones);

// GET /api/publications/:id -> Leer una publicación con validación isMongoId()
router.get('/:id', validatePublicationId, (req, res) => {
  res.status(200).json({ ok: true, mensaje: `Consulta de publicación ${req.params.id}` });
});

// POST /api/publications -> Crear nueva publicación con validación estricta
router.post('/', validateCreatePublication, crearPublicacion);

// PUT /api/publications/:id -> Actualizar publicación con validación de body y param
router.put('/:id', validateUpdatePublication, (req, res) => {
  res.status(200).json({ ok: true, mensaje: `Publicación ${req.params.id} actualizada con éxito` });
});

// DELETE /api/publications/:id -> Eliminar publicación con validación isMongoId()
router.delete('/:id', validatePublicationId, (req, res) => {
  res.status(200).json({ ok: true, mensaje: `Publicación ${req.params.id} eliminada con éxito` });
});

export default router;
