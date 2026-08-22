import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Credenciales para desplegar la ventana oficial de Google Auth mediante Firebase SDK
const apiKeyEnv = import.meta.env.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: apiKeyEnv || "AIzaSyC0p8xVn19_EMPATICOS_OAUTH_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "empaticos-2026.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "empaticos-2026",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "empaticos-2026.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475612",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475612:web:a1b2c3d4e5f6"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Forzar a Google a desplegar la ventana emergente de selección de cuenta
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const db = getFirestore(app);

export { app, auth, googleProvider, db };