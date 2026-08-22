import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración oficial de Firebase con fallback a proyecto de Google Auth
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB_EMPATICOS_GOOGLE_AUTH_KEY_2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "empaticos-2026.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "empaticos-2026",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "empaticos-2026.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475612",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475612:web:a1b2c3d4e5f6"
};

let app;
let auth;
let googleProvider;
let db;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  
  // Forzar a Google a mostrar el selector de cuentas al hacer clic en el botón
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  db = getFirestore(app);
} catch (error) {
  console.warn('[Firebase SDK] Error al iniciar instancias:', error.message);
  app = null;
  auth = null;
  googleProvider = null;
  db = null;
}

export { app, auth, googleProvider, db };