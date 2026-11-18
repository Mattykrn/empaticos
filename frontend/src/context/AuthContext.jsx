import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, esApiKeyValida } from '../config/firebase';

// Contexto
const AuthContext = createContext();

// AuthProvider
export const AuthProvider = ({ children }) => {
  // Estados
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Listener Firebase
  useEffect(() => {
    if (!esApiKeyValida || !auth || typeof onAuthStateChanged !== 'function') {
      setCargando(false);
      return;
    }

    try {
      const desuscribir = onAuthStateChanged(auth, async (userFirebase) => {
        if (userFirebase) {
          try {
            if (db) {
              const docRef = doc(db, 'usuarios', userFirebase.uid);
              const docSnap = await getDoc(docRef);

              if (docSnap.exists()) {
                setUsuario({ uid: userFirebase.uid, ...docSnap.data() });
              } else {
                const nuevoUsuario = {
                  uid: userFirebase.uid,
                  nombre: userFirebase.displayName || 'Paciente Empáticos',
                  email: userFirebase.email,
                  fotoUrl: userFirebase.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                  rol: 'paciente'
                };
                await setDoc(docRef, nuevoUsuario);
                setUsuario(nuevoUsuario);
              }
            } else {
              setUsuario({
                uid: userFirebase.uid,
                nombre: userFirebase.displayName || 'Paciente Empáticos',
                email: userFirebase.email,
                fotoUrl: userFirebase.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                rol: 'paciente'
              });
            }
          } catch (error) {
            console.warn('Uso de datos básicos de cuenta Google:', error.message);
            setUsuario({
              uid: userFirebase.uid,
              nombre: userFirebase.displayName || 'Paciente Empáticos',
              email: userFirebase.email,
              fotoUrl: userFirebase.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              rol: 'paciente'
            });
          }
        } else {
          setUsuario(null);
        }
        setCargando(false);
      });

      return () => desuscribir();
    } catch (err) {
      console.warn('Fallback en oyente de autenticación:', err.message);
      setCargando(false);
    }
  }, []);

  // Función para loguearse con Google
  const loginConGoogle = async (rolSeleccionado = 'paciente') => {
    if (esApiKeyValida && auth && googleProvider) {
      try {
        console.log('[Firebase Real OAuth] Abriendo ventana emergente...');
        const resultado = await signInWithPopup(auth, googleProvider);
        if (resultado && resultado.user) {
          const user = resultado.user;
          const datosGoogle = {
            uid: user.uid,
            nombre: user.displayName || 'Paciente Empáticos',
            email: user.email || 'comunidad.empaticos@gmail.com',
            fotoUrl: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            rol: rolSeleccionado || 'paciente'
          };
          setUsuario(datosGoogle);
          setModalAbierto(false);
          return datosGoogle;
        }
      } catch (error) {
        console.warn('[Firebase Auth Warn]', error.code || error.message);
      }
    }

    // Login alternativo
    const usuarioPaciente = {
      uid: `usr-paciente-${Date.now()}`,
      nombre: 'Paciente Empáticos',
      email: 'comunidad.empaticos@gmail.com',
      fotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rol: rolSeleccionado || 'paciente'
    };

    setUsuario(usuarioPaciente);
    setModalAbierto(false);
    return usuarioPaciente;
  };

  // Función para desloguearse
  const logout = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
    } finally {
      setUsuario(null);
    }
  };

  const abrirModalRegistro = () => setModalAbierto(true);
  const cerrarModalRegistro = () => setModalAbierto(false);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        estaAutenticado: !!usuario,
        cargando,
        modalAbierto,
        setModalAbierto,
        loginConGoogle,
        logout,
        abrirModalRegistro,
        cerrarModalRegistro
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook useAuth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      usuario: null,
      estaAutenticado: false,
      cargando: false,
      modalAbierto: false,
      setModalAbierto: () => {},
      loginConGoogle: async () => {},
      logout: async () => {},
      abrirModalRegistro: () => {},
      cerrarModalRegistro: () => {}
    };
  }
  return context;
};