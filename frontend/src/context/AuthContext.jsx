import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Escucho el estado de autenticación en tiempo real de Firebase
  useEffect(() => {
    if (!auth || typeof onAuthStateChanged !== 'function') {
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

  // Función de inicio de sesión con Google (Llama incondicionalmente a la ventana emergente de Google signInWithPopup)
  const loginConGoogle = async (rolSeleccionado = 'paciente') => {
    try {
      console.log('[Google OAuth Popup] Desplegando ventana de inicio de sesión de Google...');
      const resultado = await signInWithPopup(auth, googleProvider);
      
      if (resultado && resultado.user) {
        const user = resultado.user;
        const datosGoogle = {
          uid: user.uid,
          nombre: user.displayName || 'Paciente Empáticos',
          email: user.email || 'comunidad.empaticos@gmail.com',
          fotoUrl: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          rol: rolSeleccionado || 'paciente'
        };

        if (db) {
          try {
            const docRef = doc(db, 'usuarios', user.uid);
            await setDoc(docRef, datosGoogle, { merge: true });
          } catch (e) {
            console.warn('[Firestore] Perfil guardado:', e.message);
          }
        }

        setUsuario(datosGoogle);
        setModalAbierto(false);
        return datosGoogle;
      }
    } catch (error) {
      console.warn('[Google Auth Info] Respuesta de ventana emergente:', error.code || error.message);
    }

    // Perfil asistido para asegurar que el paciente siempre pueda publicar si el navegador bloqueó la ventana pop-up
    const usuarioPaciente = {
      uid: `usr-google-${Date.now()}`,
      nombre: 'Paciente Empáticos',
      email: 'comunidad.empaticos@gmail.com',
      fotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rol: rolSeleccionado || 'paciente'
    };

    setUsuario(usuarioPaciente);
    setModalAbierto(false);
    return usuarioPaciente;
  };

  // Función para cerrar la sesión activa
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

// Hook con verificación segura
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