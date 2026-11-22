// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import crypto from 'crypto';
import axios from 'axios';
import mongoose from 'mongoose';
import Usuario from '../models/Usuario.model.js';





// ==========================================
// CONFIGURACION Y CACHE DE CERTIFICADOS FIREBASE
// ==========================================
const URL_CERTIFICADOS_FIREBASE =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let cacheCertificadosFirebase = {
  claves: null,
  expiraEn: 0
};





// ==========================================
// UTILIDADES DE DECODIFICACION Y VERIFICACION JWT
// ==========================================
const decodificarBase64UrlJson = (segmento) => {
  try {
    const texto = Buffer.from(segmento, 'base64url').toString('utf8');
    return JSON.parse(texto);
  } catch {
    return null;
  }
};

const obtenerCertificadosFirebase = async (forzarActualizacion = false) => {
  const ahora = Date.now();
  if (!forzarActualizacion && cacheCertificadosFirebase.claves && ahora < cacheCertificadosFirebase.expiraEn) {
    return cacheCertificadosFirebase.claves;
  }

  const respuesta = await axios.get(URL_CERTIFICADOS_FIREBASE, { timeout: 5000 });
  const cacheControl = respuesta.headers?.['cache-control'] || '';
  const matchMaxAge = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeSegundos = matchMaxAge ? Number(matchMaxAge[1]) : 3600;

  cacheCertificadosFirebase = {
    claves: respuesta.data || {},
    expiraEn: ahora + maxAgeSegundos * 1000
  };

  return cacheCertificadosFirebase.claves;
};

const verificarTokenFirebaseRS256 = async (partes, encabezado, cargaUtil) => {
  const [encabezadoB64, cargaB64, firmaB64] = partes;
  const kid = encabezado?.kid;

  if (!kid || typeof kid !== 'string') {
    throw new Error('El token no incluye un identificador de clave válido (kid).');
  }

  let certificados = await obtenerCertificadosFirebase(false);
  let certificado = certificados[kid];

  // Si Firebase rotó las claves públicas, refresco la caché una sola vez
  if (!certificado) {
    certificados = await obtenerCertificadosFirebase(true);
    certificado = certificados[kid];
  }

  if (!certificado) {
    throw new Error('No se encontró el certificado público para validar el token.');
  }

  const firmaValida = crypto.verify(
    'RSA-SHA256',
    Buffer.from(`${encabezadoB64}.${cargaB64}`),
    certificado,
    Buffer.from(firmaB64, 'base64url')
  );

  if (!firmaValida) {
    throw new Error('La firma criptográfica del token de Firebase es inválida.');
  }

  const proyectoFirebase = (process.env.FIREBASE_PROJECT_ID || 'empaticosbd').trim();
  const emisorEsperado = `https://securetoken.google.com/${proyectoFirebase}`;
  const ahoraSegundos = Math.floor(Date.now() / 1000);

  if (cargaUtil.aud !== proyectoFirebase) {
    throw new Error('La audiencia del token no corresponde al proyecto Empáticos.');
  }

  if (cargaUtil.iss !== emisorEsperado) {
    throw new Error('El emisor del token no corresponde a Firebase Authentication.');
  }

  if (!cargaUtil.sub || typeof cargaUtil.sub !== 'string') {
    throw new Error('El token no contiene un identificador de usuario válido.');
  }

  if (typeof cargaUtil.exp !== 'number' || cargaUtil.exp <= ahoraSegundos) {
    throw new Error('La sesión expiró. Por favor, iniciá sesión nuevamente.');
  }

  if (typeof cargaUtil.iat === 'number' && cargaUtil.iat > ahoraSegundos + 300) {
    throw new Error('La fecha de emisión del token no es válida.');
  }

  if (cargaUtil.email_verified !== true) {
    throw new Error('La cuenta debe tener su correo electrónico verificado.');
  }

  return {
    uid: cargaUtil.user_id || cargaUtil.sub,
    email: String(cargaUtil.email || '').toLowerCase().trim(),
    nombre: cargaUtil.name || 'Administrador Empáticos',
    proveedor: 'firebase'
  };
};

const verificarTokenLocalHS256 = async (partes, cargaUtil) => {
  const secretoJwt = process.env.JWT_SECRET?.trim();
  if (!secretoJwt) {
    throw new Error('La validación de tokens locales HS256 no está habilitada en el servidor.');
  }

  const [encabezadoB64, cargaB64, firmaB64] = partes;
  const firmaEsperada = crypto
    .createHmac('sha256', secretoJwt)
    .update(`${encabezadoB64}.${cargaB64}`)
    .digest();
  const firmaRecibida = Buffer.from(firmaB64, 'base64url');

  if (firmaEsperada.length !== firmaRecibida.length || !crypto.timingSafeEqual(firmaEsperada, firmaRecibida)) {
    throw new Error('La firma del token JWT es inválida.');
  }

  const ahoraSegundos = Math.floor(Date.now() / 1000);
  if (typeof cargaUtil.exp === 'number' && cargaUtil.exp <= ahoraSegundos) {
    throw new Error('El token JWT expiró. Por favor, iniciá sesión nuevamente.');
  }

  let email = String(cargaUtil.email || '').toLowerCase().trim();
  let nombre = cargaUtil.nombre || cargaUtil.name || 'Usuario Empáticos';
  const uid = String(cargaUtil.id || cargaUtil.sub || '');

  if (!email && uid && mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(uid)) {
    const usuarioBD = await Usuario.findById(uid).select('email nombre rol');
    if (usuarioBD) {
      email = String(usuarioBD.email || '').toLowerCase().trim();
      nombre = usuarioBD.nombre || nombre;
    }
  }

  return {
    uid,
    email,
    nombre,
    proveedor: 'jwt'
  };
};





// ==========================================
// MIDDLEWARE DE AUTORIZACION: SOLO ADMINISTRADOR
// ==========================================
export const soloAdmin = async (req, res, next) => {
  try {
    const emailAdmin = process.env.ADMIN_EMAIL?.toLowerCase().trim();

    if (!emailAdmin) {
      console.error('🛑 [Seguridad] ADMIN_EMAIL no está configurado en las variables de entorno.');
      return res.status(403).json({
        ok: false,
        success: false,
        mensaje: 'Acceso denegado. La cuenta administradora no está configurada en el servidor.'
      });
    }

    const encabezadoAuth = req.headers.authorization || '';
    if (!encabezadoAuth.startsWith('Bearer ')) {
      return res.status(403).json({
        ok: false,
        success: false,
        mensaje: 'Acceso denegado. Debes iniciar sesión con la cuenta administradora autorizada para eliminar publicaciones.'
      });
    }

    const token = encabezadoAuth.slice(7).trim();
    const partes = token.split('.');
    if (partes.length !== 3) {
      return res.status(403).json({
        ok: false,
        success: false,
        mensaje: 'Acceso denegado. El token de autenticación proporcionado no es válido.'
      });
    }

    const encabezado = decodificarBase64UrlJson(partes[0]);
    const cargaUtil = decodificarBase64UrlJson(partes[1]);

    if (!encabezado || !cargaUtil) {
      return res.status(403).json({
        ok: false,
        success: false,
        mensaje: 'Acceso denegado. No se pudo verificar el formato de la credencial enviada.'
      });
    }

    let usuarioVerificado = null;

    if (encabezado.alg === 'RS256') {
      usuarioVerificado = await verificarTokenFirebaseRS256(partes, encabezado, cargaUtil);
    } else if (encabezado.alg === 'HS256') {
      usuarioVerificado = await verificarTokenLocalHS256(partes, cargaUtil);
    } else {
      return res.status(403).json({
        ok: false,
        success: false,
        mensaje: 'Acceso denegado. Algoritmo de autenticación no soportado.'
      });
    }

    const emailUsuario = usuarioVerificado?.email?.toLowerCase().trim();
    if (!emailUsuario || emailUsuario !== emailAdmin) {
      console.warn(`🛡️ [SoloAdmin] Intento bloqueado de eliminación por: ${emailUsuario || 'usuario sin correo'}`);
      return res.status(403).json({
        ok: false,
        success: false,
        mensaje: 'Acceso denegado. Solo la cuenta administradora autorizada puede eliminar publicaciones.'
      });
    }

    req.usuario = usuarioVerificado;
    return next();
  } catch (error) {
    console.warn(`🛡️ [SoloAdmin] Validación fallida: ${error.message}`);
    return res.status(403).json({
      ok: false,
      success: false,
      mensaje: 'Acceso denegado. Tu sesión no es válida o no cuenta con permisos de administrador.'
    });
  }
};





// ==========================================
// EXPORTACION DEL MIDDLEWARE
// ==========================================
export default soloAdmin;

