import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Credenciales Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA_OiKkVu-2_VWuUxEgGGIlDf8U4un24o4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "empaticosbd.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "empaticosbd",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "empaticosbd.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "723912898582",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:723912898582:web:02c9c78a9bbe778d0d9d37"
};

// Con esta función me aseguro de que exista una clave válida de Google Cloud antes de intentar abrir pop-ups
export const esApiKeyValida = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.startsWith('AIzaSy')
);

// Acá inicializo la app de Firebase o reutilizo la instancia existente en memoria
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configuro mi proveedor de Google para forzar siempre la selección explícita de cuentas
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const db = getFirestore(app);

export { app, auth, googleProvider, db };