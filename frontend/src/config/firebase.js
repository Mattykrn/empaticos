import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Credenciales oficiales del proyecto Firebase empaticosBD (empaticos-web-v2)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA_OiKkVu-2_VWuUxEgGGIlDf8U4un24o4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "empaticosbd.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "empaticosbd",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "empaticosbd.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "723912898582",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:723912898582:web:02c9c78a9bbe778d0d9d37"
};

// Verificación de validez de las credenciales oficiales
export const esApiKeyValida = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.startsWith('AIzaSy')
);

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Forzar el despliegue del selector de cuentas de Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const db = getFirestore(app);

export { app, auth, googleProvider, db };