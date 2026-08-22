import express from 'express';
import { autenticarConGoogle, registroManual, obtenerMiPerfil } from '../controllers/auth.controller.js';
import { verificarAutenticacion } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas públicas de autenticación
router.post('/google', autenticarConGoogle);
router.post('/registro', registroManual);

// Ruta protegida para consultar los datos del usuario logueado
router.get('/perfil', verificarAutenticacion, obtenerMiPerfil);

export default router;
