import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Verificar si se proporcionaron credenciales reales de Firebase en las variables de entorno de Vite
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const esApiKeyValida = apiKey && apiKey !== 'undefined' && apiKey.length > 20 && !apiKey.includes('DemoKey');

let app = null;
let auth = null;
let googleProvider = null;
let db = null;

if (esApiKeyValida) {
  try {
    const firebaseConfig = {
      apiKey: apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
  } catch (error) {
    console.warn('[Firebase Config] Error al inicializar cliente de Firebase:', error.message);
    app = null;
    auth = null;
    googleProvider = null;
    db = null;
  }
}

export { app, auth, googleProvider, db };