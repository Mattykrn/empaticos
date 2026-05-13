// firebase-config.js
// Usa el SDK compat (sin ES modules) para compatibilidad con Babel standalone
// Requiere firebase-app-compat.js y firebase-firestore-compat.js cargados antes en el HTML

const firebaseConfig = {
  apiKey: "AIzaSyA_OiKkVu-2_VWuUxEgGGIlDf8U4un24o4",
  authDomain: "empaticosbd.firebaseapp.com",
  projectId: "empaticosbd",
  storageBucket: "empaticosbd.firebasestorage.app",
  messagingSenderId: "723912898582",
  appId: "1:723912898582:web:84438d3f899e58070d9d37"
};

try {
  firebase.initializeApp(firebaseConfig);
  window.db = firebase.firestore();
} catch (e) {
  console.warn("⚠️ Firebase no se pudo inicializar:", e);
}
