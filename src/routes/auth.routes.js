import { Router } from 'express';
import {
  loginConGoogle,
  loginOregistroRapidoUnirme,
  obtenerPerfilActual,
  actualizarRolPerfil
} from '../controllers/auth.controller.js';
import { verificarSesion } from '../middlewares/authMiddleware.js';

// Creo mi enrutador modular para gestionar todos los endpoints correspondientes al módulo de autenticación
const router = Router();

// Definición de la ruta POST para iniciar sesión o registrar un usuario con Google OAuth / Firebase Auth
// Endpoint público: POST /api/auth/google
router.post('/google', loginConGoogle);

// Definición de la ruta POST para el flujo rápido de registro/login del botón "Unirme"
// Endpoint público: POST /api/auth/unirme
router.post('/unirme', loginOregistroRapidoUnirme);

// Definición de la ruta GET protegida para obtener la información de perfil del usuario logueado en la sesión
// Endpoint privado: GET /api/auth/perfil
router.get('/perfil', verificarSesion, obtenerPerfilActual);

// Definición de la ruta PUT protegida para actualizar el rol o biografía del usuario logueado
// Endpoint privado: PUT /api/auth/perfil
router.put('/perfil', verificarSesion, actualizarRolPerfil);

// Exporto mi router configurado para ser vinculado en mi aplicación principal Express (app.js)
export default router;
