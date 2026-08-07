'use strict';

// ─────────────────────────────────────────────────────────────
// Autenticación del admin (TAREA 3 — Paso 3)
//
// Modo producción: Firebase Auth (email/password) → genera custom
// token / verifica ID token de Firebase con el custom claim admin.
// Modo desarrollo: contraseña simple en ADMIN_PASSWORD + JWT local.
//
// Se activa con FIREBASE_AUTH_ENABLED=true + credenciales de
// Firebase (ver server/firebase.js).
// ─────────────────────────────────────────────────────────────

const firebase = require('./firebase');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const DEV_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'EMpaticos2025arg';

function isFirebaseAuthEnabled() {
  return process.env.FIREBASE_AUTH_ENABLED === 'true' && firebase.USE_FIREBASE;
}

/**
 * Verifica credenciales y retorna un token válido.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: {email: string, uid: string}}>}
 */
async function login(email, password) {
  if (!email || !password) {
    throw new Error('Email y contraseña son requeridos');
  }

  if (isFirebaseAuthEnabled()) {
    // === MODO PRODUCCIÓN: Firebase Auth ===
    // El login desde el navegador se hace con el SDK de cliente
    // (signInWithEmailAndPassword → ID token). Este endpoint genera
    // un custom token para casos backend (testing / migración).
    try {
      const authService = firebase.getAuthService();
      const userRecord = await authService.getUserByEmail(email);
      if (!userRecord.customClaims || !userRecord.customClaims.admin) {
        throw new Error('Usuario no autorizado como admin');
      }
      const token = await authService.createCustomToken(userRecord.uid);
      return { token, user: { email: userRecord.email, uid: userRecord.uid } };
    } catch (error) {
      throw new Error('Credenciales inválidas');
    }
  }

  // === MODO DESARROLLO: contraseña simple ===
  if (password !== DEV_ADMIN_PASSWORD) {
    throw new Error('Contraseña incorrecta');
  }

  const token = jwt.sign(
    { email: email || 'admin@local', mode: 'development' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  return {
    token,
    user: { email: email || 'admin@local', uid: 'dev-user' },
  };
}

/**
 * Verifica un token y retorna los datos del usuario.
 *
 * @param {string} token
 * @returns {Promise<{email: string, uid: string}>}
 */
async function verifyToken(token) {
  if (!token) {
    throw new Error('Token requerido');
  }

  if (isFirebaseAuthEnabled()) {
    // === MODO PRODUCCIÓN: ID token de Firebase ===
    try {
      const authService = firebase.getAuthService();
      const decoded = await authService.verifyIdToken(token);
      if (!decoded.admin) {
        throw new Error('Usuario no autorizado como admin');
      }
      return { email: decoded.email, uid: decoded.uid };
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  // === MODO DESARROLLO: JWT simple ===
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { email: decoded.email, uid: decoded.uid || 'dev-user' };
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}

module.exports = { isFirebaseAuthEnabled, login, verifyToken };
