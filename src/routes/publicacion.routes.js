import { Router } from 'express';
import publicacionController from '../controllers/publicacion.controller.js';
import { validarPublicacion } from '../middlewares/publicacionValidator.js';
import { moderarContenido } from '../middlewares/moderarContenido.js';

// En este módulo configuro mi enrutador Express modular para las operaciones del recurso Publicacion.
// Aplico mis middlewares de validación de sintaxis y moderación de contenido en las rutas correspondientes.

const router = Router();

// Endpoint GET /api/publicaciones/all: Obtengo todas las publicaciones (soporte panel admin)
router.get('/all', publicacionController.getPublicaciones);

// Endpoint GET /api/publicaciones: Obtengo el listado completo de publicaciones comunitarias
router.get('/', publicacionController.getPublicaciones);

// Endpoint GET /api/publicaciones/:id: Busco y devuelvo una publicación específica por su identificador
router.get('/:id', publicacionController.getPublicacionPorId);

// Endpoint POST /api/publicaciones: Creo una publicación ejecutando primero mis validaciones y moderación
router.post('/', validarPublicacion, moderarContenido, publicacionController.crearPublicacion);

// Endpoint PATCH /api/publicaciones/:id/status: Cambia el estado de aprobación desde el panel admin
router.patch('/:id/status', publicacionController.cambiarEstadoPublicacion);

// Endpoint PUT /api/publicaciones/:id: Actualizo una publicación existente validando los datos y moderando el texto
router.put('/:id', validarPublicacion, moderarContenido, publicacionController.actualizarPublicacion);

// Endpoint DELETE /api/publicaciones/:id: Elimino una publicación por su ID de MongoDB Atlas
router.delete('/:id', publicacionController.eliminarPublicacion);

// Exporto mi router para conectarlo en app.js
export default router;





