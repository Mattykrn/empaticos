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
  validarActualizarPublicacion
} from '../validators/publicacionValidator.js';

// Inicializo el router de Express
const router = Router();





// ==========================================
// RUTAS DE CONSULTA (GET)
// ==========================================
// Trae todas las publicaciones
router.get('/', obtenerTodasLasPublicaciones);
router.get('/all', obtenerTodasLasPublicaciones);

// Trae una sola publicación por su ID de Mongo
router.get('/:id', validarIdPublicacion, obtenerPublicacionPorId);





// ==========================================
// RUTA DE CREACION (POST)
// ==========================================
// Guarda una nueva publicación previa validación de campos obligatorios
router.post('/', validarCrearPublicacion, crearPublicacion);





// ==========================================
// RUTA DE ACTUALIZACION (PUT)
// ==========================================
// Modifica los datos de una publicación existente según su ID
router.put('/:id', validarActualizarPublicacion, actualizarPublicacion);





// ==========================================
// RUTA DE ELIMINACION (DELETE)
// ==========================================
// Borra físicamente la publicación por su ID
router.delete('/:id', validarIdPublicacion, eliminarPublicacion);





// ==========================================
// RUTAS COMPLEMENTARIAS (REACCIONES Y COMENTARIOS)
// ==========================================
router.post('/:id/reacciones', validarIdPublicacion, toggleReaccion);
router.post('/:id/comentarios', validarIdPublicacion, agregarComentario);





// ==========================================
// EXPORTACION DEL ENRUTADOR
// ==========================================
export default router;
