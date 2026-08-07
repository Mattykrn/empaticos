'use strict';

// ─────────────────────────────────────────────────────────────
// Migración única: data/db.json → Firebase Firestore
//
// Uso:
//   FIREBASE_SERVICE_ACCOUNT="<base64 del JSON de la cuenta>" \
//     node server/migrate-firestore.js
//
// Requiere que Firestore esté configurado (igual que el server).
// Si Firestore ya tiene entradas, aborta (--force para re-ejecutar).
// ─────────────────────────────────────────────────────────────

const store = require('./store');

async function main() {
  const force = process.argv.includes('--force');

  if (!store.USE_FIRESTORE) {
    console.error('✖ Firestore no está configurado.');
    console.error('  Definí la variable FIREBASE_SERVICE_ACCOUNT (JSON de la cuenta de servicio en base64).');
    process.exit(1);
  }

  const firebase = require('./firebase');
  const fdb = firebase.getFirestoreService();
  const entriesCol = fdb.collection('entries');
  const existing = await entriesCol.limit(1).get();

  if (!existing.empty && !force) {
    console.error('✖ Firestore ya contiene entradas. La migración se ejecuta una sola vez.');
    console.error('  Si querés re-ejecutarla, usá: node server/migrate-firestore.js --force');
    process.exit(1);
  }

  const result = await store.migrateFromJson();
  console.log(`✔ Migración completada: ${result.migrated} entradas en Firestore.`);
}

main().catch((error) => {
  console.error('✖ Error durante la migración:', error.message);
  process.exit(1);
});
