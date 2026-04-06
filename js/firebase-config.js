// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Tu configuración web de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA_OiKkVu-2_VWuUxEgGGIlDf8U4un24o4",
  authDomain: "empaticosbd.firebaseapp.com",
  projectId: "empaticosbd",
  storageBucket: "empaticosbd.firebasestorage.app",
  messagingSenderId: "723912898582",
  appId: "1:723912898582:web:84438d3f899e58070d9d37"
};

// Inicializar Firebase
let app, db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("⚠️ Firebase no se pudo inicializar. Asegurate de haber puesto tus credenciales.", e);
}

export { db };
