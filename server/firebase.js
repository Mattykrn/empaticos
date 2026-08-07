'use strict';

// ─────────────────────────────────────────────────────────────
// Inicialización única de Firebase Admin (Paso 3)
//
// Punto central para firebase-admin. Lo usan server/store.js
// (Firestore) y server/auth.js (Auth). Con la versión modular de
// firebase-admin v14+ los servicios se obtienen con getFirestore()
// y getAuth(), no con admin.firestore()/admin.auth().
//
// Configuración (una de las dos):
//   - FIREBASE_SERVICE_ACCOUNT        : JSON de la cuenta de servicio en base64
//   - GOOGLE_APPLICATION_CREDENTIALS  : ruta al archivo JSON
// ─────────────────────────────────────────────────────────────

const fs = require('fs');

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const raw = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.project_id) throw new Error('Falta project_id en FIREBASE_SERVICE_ACCOUNT.');
      return parsed;
    } catch (error) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT no es un JSON válido en base64: ${error.message}`);
    }
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf-8'));
    } catch (error) {
      throw new Error(`No se pudo leer GOOGLE_APPLICATION_CREDENTIALS: ${error.message}`);
    }
  }
  return null;
}

const serviceAccount = loadServiceAccount();

function resolveUseFirebase() {
  if (process.env.USE_FIREBASE === 'true') return true;
  if (process.env.USE_FIREBASE === 'false') return false;
  return Boolean(serviceAccount);
}

const USE_FIREBASE = resolveUseFirebase();

let _app = null;

function getApp() {
  if (_app) return _app;
  const admin = require('firebase-admin');
  if (admin.getApps().length) {
    _app = admin.getApps()[0];
  } else {
    if (!serviceAccount) {
      throw new Error('USE_FIREBASE está activo pero falta FIREBASE_SERVICE_ACCOUNT o GOOGLE_APPLICATION_CREDENTIALS.');
    }
    _app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
  return _app;
}

function getFirestoreService() {
  return require('firebase-admin/firestore').getFirestore(getApp());
}

function getAuthService() {
  return require('firebase-admin/auth').getAuth(getApp());
}

module.exports = {
  USE_FIREBASE,
  getApp,
  getFirestoreService,
  getAuthService,
};
