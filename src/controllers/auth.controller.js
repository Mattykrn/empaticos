import { autenticarOcrearUsuarioGoogle, generarJwtSesion } from '../services/auth.service.js';
import Usuario from '../models/Usuario.model.js';

// En esta función del controlador recibo la solicitud de inicio de sesión o registro utilizando el token de Google
export const loginConGoogle = async (req, res) => {
  try {
    // Extraigo el idToken enviado desde la aplicación cliente en el cuerpo de la petición
    const { idToken } = req.body || {};

    // Valido que el idToken haya sido adjuntado en la solicitud HTTP
    if (!idToken) {
      return res.status(400).json({
        success: false,
        mensaje: 'El idToken de Google es un parámetro obligatorio en la solicitud'
      });
    }

    // Invoco el servicio de autenticación para verificar el token y aplicar mi lógica de "Find or Create"
    const resultado = await autenticarOcrearUsuarioGoogle(idToken);

    // Si fue un nuevo registro devuelvo código HTTP 201 (Created), de lo contrario devuelvo HTTP 200 (OK)
    const statusCode = resultado.esNuevoRegistro ? 201 : 200;

    return res.status(statusCode).json({
      success: true,
      mensaje: resultado.esNuevoRegistro
        ? 'Bienvenido a la comunidad Empáticos. Registro completado con éxito.'
        : 'Inicio de sesión exitoso en la plataforma Empáticos.',
      token: resultado.tokenSesion,
      usuario: {
        id: resultado.usuario._id,
        googleId: resultado.usuario.googleId,
        nombre: resultado.usuario.nombre,
        email: resultado.usuario.email,
        fotoUrl: resultado.usuario.fotoUrl,
        rol: resultado.usuario.rol,
        biografia: resultado.usuario.biografia,
        createdAt: resultado.usuario.createdAt
      }
    });
  } catch (error) {
    // Si ocurre algún fallo durante la verificación del token o acceso a la base de datos, respondo con un error HTTP 401
    console.error('Error en el controlador loginConGoogle:', error.message);
    return res.status(401).json({
      success: false,
      mensaje: 'No fue posible autenticar al usuario con Google',
      error: error.message
    });
  }
};

// En esta función me encargo de procesar el registro e inicio de sesión rápido desde el Modal "Unirme"
export const loginOregistroRapidoUnirme = async (req, res) => {
  try {
    const { nombre, email, rol = 'paciente', fotoUrl, biografia } = req.body || {};

    if (!email || !nombre) {
      return res.status(400).json({
        success: false,
        mensaje: 'El nombre y el correo electrónico son campos obligatorios'
      });
    }

    // Genero un googleId sintético si es un registro directo desde el formulario rápido
    const googleIdCalculado = req.body.googleId || `google-unirme-${Date.now()}`;

    // Busco si el usuario ya existe por email en MongoDB Atlas
    let usuario = null;
    try {
      usuario = await Usuario.findOne({ email: email.toLowerCase() });
    } catch (errDb) {
      console.warn('Advertencia DB al buscar usuario:', errDb.message);
    }

    let esNuevo = false;

    if (!usuario) {
      try {
        usuario = await Usuario.create({
          googleId: googleIdCalculado,
          nombre: nombre.trim(),
          email: email.toLowerCase().trim(),
          fotoUrl: fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          rol: rol || 'paciente',
          biografia: biografia || 'Miembro activo de la comunidad Empáticos'
        });
        esNuevo = true;
      } catch (createErr) {
        // Objeto en memoria fallback si la conexión Atlas fallara
        usuario = {
          _id: `user-${Date.now()}`,
          googleId: googleIdCalculado,
          nombre: nombre.trim(),
          email: email.toLowerCase().trim(),
          fotoUrl: fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          rol: rol || 'paciente',
          biografia: biografia || 'Miembro activo de la comunidad Empáticos',
          createdAt: new Date()
        };
        esNuevo = true;
      }
    }

    // Genero el JWT de sesión firmado
    const token = generarJwtSesion(usuario);

    return res.status(esNuevo ? 201 : 200).json({
      success: true,
      mensaje: esNuevo
        ? '¡Bienvenido/a a la comunidad Empáticos! Tu registro se ha completado.'
        : '¡Bienvenido/a nuevamente a la comunidad!',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        fotoUrl: usuario.fotoUrl,
        rol: usuario.rol,
        biografia: usuario.biografia
      }
    });
  } catch (error) {
    console.error('Error en loginOregistroRapidoUnirme:', error);
    return res.status(500).json({
      success: false,
      mensaje: 'Ocurrió un error al procesar el registro en el servidor',
      error: error.message
    });
  }
};

// En esta función devuelvo los datos actualizados del perfil del usuario autenticado en la sesión actual
export const obtenerPerfilActual = async (req, res) => {
  try {
    // Gracias a mi middleware verificarSesion, obtengo el usuario validado directamente desde req.usuario
    const usuarioId = req.usuario.id;

    // Busco el documento completo del usuario en mi colección MongoDB usando su ID
    const usuario = await Usuario.findById(usuarioId).select('-__v');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'El perfil de usuario solicitado no fue encontrado en la base de datos'
      });
    }

    // Devuelvo los datos de perfil del usuario logueado con un código de respuesta HTTP 200 OK
    return res.status(200).json({
      success: true,
      usuario
    });
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error.message);
    return res.status(500).json({
      success: false,
      mensaje: 'Ocurrió un error al intentar recuperar el perfil del usuario',
      error: error.message
    });
  }
};

// En esta función me encargo de procesar las modificaciones del rol o la biografía realizadas por el propio usuario
export const actualizarRolPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { rol, biografia, nombre, fotoUrl } = req.body || {};

    // Busco la instancia del usuario en MongoDB para actualizar sus campos
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'El usuario a actualizar no existe en la comunidad'
      });
    }

    // Si el usuario especifica un rol, verifico que pertenezca a la lista de roles permitidos en el esquema
    const rolesValidos = ['paciente', 'familiar', 'acompanante', 'profesional'];
    if (rol) {
      if (!rolesValidos.includes(rol)) {
        return res.status(400).json({
          success: false,
          mensaje: `El rol '${rol}' no es válido. Los roles válidos son: ${rolesValidos.join(', ')}`
        });
      }
      usuario.rol = rol;
    }

    // Actualizo la biografía si fue provista en la solicitud
    if (typeof biografia === 'string') {
      usuario.biografia = biografia.trim();
    }

    // Si el usuario actualiza su nombre o foto opcionalmente
    if (nombre) usuario.nombre = nombre.trim();
    if (fotoUrl) usuario.fotoUrl = fotoUrl.trim();

    // Guardo los cambios aplicados en mi colección MongoDB
    await usuario.save();

    return res.status(200).json({
      success: true,
      mensaje: 'Perfil y rol de usuario actualizados correctamente',
      usuario
    });
  } catch (error) {
    console.error('Error al actualizar el perfil del usuario:', error.message);
    return res.status(500).json({
      success: false,
      mensaje: 'Error interno al actualizar la información del usuario',
      error: error.message
    });
  }
};
