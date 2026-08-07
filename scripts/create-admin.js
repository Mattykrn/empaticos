'use strict';

// ─────────────────────────────────────────────────────────────
// Crea el primer usuario admin en Firebase Auth y le asigna el
// custom claim { admin: true }.
//
// Uso:
//   node scripts/create-admin.js admin@empaticos.com MiPasswordSegura123
//
// Requiere credenciales de Firebase (FIREBASE_SERVICE_ACCOUNT o
// GOOGLE_APPLICATION_CREDENTIALS) y FIREBASE_AUTH_ENABLED=true.
// ─────────────────────────────────────────────────────────────

const { USE_FIREBASE, getAuthService } = require('../server/firebase');

async function createAdmin(email, password) {
  try {
    if (!USE_FIREBASE) {
      throw new Error('Firebase no está configurado. Definí FIREBASE_SERVICE_ACCOUNT o GOOGLE_APPLICATION_CREDENTIALS.');
    }

    const auth = getAuthService();
    console.log(`Creando usuario admin: ${email}`);

    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: true,
    });

    console.log(`✓ Usuario creado: ${userRecord.uid}`);

    await auth.setCustomUserClaims(userRecord.uid, { admin: true });

    console.log(`✓ Custom claim 'admin: true' asignado`);
    console.log('\nEl usuario ya puede iniciar sesión en el panel admin.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Uso: node scripts/create-admin.js <email> <password>');
  process.exit(1);
}

createAdmin(email, password);
