import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.model.js';

// Middleware verifico que la petición contenga un token JWT válido
export const verificarAutenticacion = async (req, res, next) => {
  try {
    let token;
    
    // Obtengo mi token desde el encabezado Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Si no me enviaron el token, bloqueo la petición con error 401
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No estás autenticado. Debes registrarte o iniciar sesión para realizar esta acción.'
      });
    }

    // Decodifico el token usando mi clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_default');

    // Busco el usuario en mi base de datos para inyectarlo en la petición
    const usuarioActual = await Usuario.findById(decoded.id).select('-password');
    if (!usuarioActual) {
      return res.status(401).json({
        success: false,
        message: 'El usuario correspondiente a este token ya no existe en mi base de datos.'
      });
    }

    // Adjunto el usuario a mi objeto de petición (req) para que mis controladores tengan acceso a él
    req.usuario = usuarioActual;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado. Por favor inicia sesión nuevamente.',
      error: error.message
    });
  }
};
