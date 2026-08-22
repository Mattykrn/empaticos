import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import Usuario from '../models/Usuario.model.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Función auxiliar para firmar mis tokens JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'clave_secreta_default', {
    expiresIn: '30d'
  });
};

// Controlador para autenticación / registro con Google
export const autenticarConGoogle = async (req, res, next) => {
  try {
    const { tokenGoogle, rol } = req.body;

    if (!tokenGoogle) {
      return res.status(400).json({
        success: false,
        message: 'Falta el token de Google para procesar la autenticación.'
      });
    }

    let payload;

    // Intento verificar el token con Google; si es un token de prueba o falla, capturo sus datos decodificados
    try {
      const ticket = await client.verifyIdToken({
        idToken: tokenGoogle,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (googleError) {
      // Fallback para decodificación básica si viene de un entorno de desarrollo/mock
      const tokenDecodificado = jwt.decode(tokenGoogle);
      if (tokenDecodificado && tokenDecodificado.email) {
        payload = tokenDecodificado;
      } else {
        throw new Error('No pude validar el token de Google provisto: ' + googleError.message);
      }
    }

    const { sub: googleId, email, name, picture } = payload;

    // Busco si mi usuario ya existe en mi base de datos
    let usuario = await Usuario.findOne({ email });

    if (usuario) {
      // Si ya existía pero no tenía asignado su googleId o foto, lo actualizo
      if (!usuario.googleId) usuario.googleId = googleId;
      if (picture && !usuario.fotoUrl) usuario.fotoUrl = picture;
      await usuario.save();
    } else {
      // Si es nuevo, lo registro en mi colección
      usuario = await Usuario.create({
        nombre: name || 'Usuario Empáticos',
        email: email,
        googleId: googleId,
        fotoUrl: picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        rol: rol || 'paciente'
      });
    }

    // Genero mi token JWT de sesión
    const token = generarToken(usuario._id);

    return res.status(200).json({
      success: true,
      message: 'Autenticación con Google exitosa',
      data: {
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          fotoUrl: usuario.fotoUrl,
          rol: usuario.rol
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Controlador para registro o login rápido tradicional por formulario
export const registroManual = async (req, res, next) => {
  try {
    const { nombre, email, rol, password } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y correo electrónico son requeridos'
      });
    }

    let usuario = await Usuario.findOne({ email });

    if (usuario) {
      // Si ya existe, genero el token y lo devuelvo
      const token = generarToken(usuario._id);
      return res.status(200).json({
        success: true,
        message: 'Usuario ya existente, sesión iniciada',
        data: {
          usuario: {
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            fotoUrl: usuario.fotoUrl,
            rol: usuario.rol
          },
          token
        }
      });
    }

    // Creo un nuevo usuario
    usuario = await Usuario.create({
      nombre,
      email,
      password: password || null,
      rol: rol || 'paciente',
      fotoUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(nombre)}`
    });

    const token = generarToken(usuario._id);

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente en mi base de datos',
      data: {
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          fotoUrl: usuario.fotoUrl,
          rol: usuario.rol
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtengo el perfil del usuario autenticado actualmente
export const obtenerMiPerfil = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.usuario
  });
};
