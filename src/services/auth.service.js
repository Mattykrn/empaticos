import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.model.js';

// Inicializo el cliente oficial de Google OAuth2 recuperando el GOOGLE_CLIENT_ID configurado en mis variables de entorno
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// En esta función me encargo de verificar la validez del idToken enviado por el cliente desde el SDK de Google o Firebase
export const verificarGoogleToken = async (idToken) => {
  try {
    // Verifico el token directamente con los servidores de autenticación de Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    // Extraigo la información del payload devuelto por Google tras la verificación
    const payload = ticket.getPayload();

    return {
      googleId: payload.sub,
      email: payload.email,
      nombre: payload.name || payload.given_name || 'Usuario Empáticos',
      fotoUrl: payload.picture || ''
    };
  } catch (error) {
    // Si el token es inválido o expiró, capturo la excepción y la notifico
    console.error('Error al verificar el idToken con Google:', error.message);
    throw new Error('El token de Google proporcionado no es válido o ha expirado');
  }
};

// En este helper me encargo de firmar y emitir un JWT de sesión para el usuario autenticado
export const generarJwtSesion = (usuario) => {
  // Configuro la clave secreta recuperando JWT_SECRET o utilizando un valor seguro por defecto
  const secret = process.env.JWT_SECRET || 'super_secreto_empaticos_jwt_2026';

  // Incluyo en el token la información fundamental del usuario para identificarlo en peticiones protegidas
  const payload = {
    id: usuario._id,
    googleId: usuario.googleId,
    email: usuario.email,
    rol: usuario.rol
  };

  // Firmo el token estableciendo una validez de 7 días de sesión activa
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// Aquí implemento mi lógica principal de autenticación "Find or Create" con Google
export const autenticarOcrearUsuarioGoogle = async (idToken) => {
  // Primero verifico las credenciales del idToken de Google recibidas
  const datosGoogle = await verificarGoogleToken(idToken);

  // En este paso busco si mi usuario ya se encuentra registrado en la base de datos MongoDB usando su googleId o su email
  let usuario = await Usuario.findOne({
    $or: [{ googleId: datosGoogle.googleId }, { email: datosGoogle.email }]
  });

  let esNuevoRegistro = false;

  // Si el usuario no existe en mi colección, procedo a crear su perfil inicial en MongoDB
  if (!usuario) {
    usuario = await Usuario.create({
      googleId: datosGoogle.googleId,
      nombre: datosGoogle.nombre,
      email: datosGoogle.email,
      fotoUrl: datosGoogle.fotoUrl,
      rol: 'paciente', // Asigno el rol predeterminado 'paciente'
      biografia: 'Miembro de la comunidad Empáticos'
    });
    esNuevoRegistro = true;
  } else {
    // Si el usuario ya existía pero no tenía vinculado su googleId, actualizo su perfil para vincular la cuenta
    if (!usuario.googleId) {
      usuario.googleId = datosGoogle.googleId;
      if (datosGoogle.fotoUrl && !usuario.fotoUrl) {
        usuario.fotoUrl = datosGoogle.fotoUrl;
      }
      await usuario.save();
    }
  }

  // Genero el JWT de sesión para que el usuario pueda navegar de forma segura por las rutas protegidas
  const tokenSesion = generarJwtSesion(usuario);

  return {
    usuario,
    tokenSesion,
    esNuevoRegistro
  };
};
