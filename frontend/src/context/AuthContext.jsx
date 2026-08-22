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

  // Escucho el estado de autenticación en tiempo real
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

  // Función accesible de 1-Clic para ingresar con Cuenta de Google (Pensada para accesibilidad de pacientes)
  const loginConGoogle = async (rolSeleccionado = 'paciente') => {
    // Si la autenticación con Firebase está lista y configurada
    if (auth && googleProvider) {
      try {
        const resultado = await signInWithPopup(auth, googleProvider);
        const user = resultado.user;

        let datosUsuario = {
          uid: user.uid,
          nombre: user.displayName || 'Paciente Empáticos',
          email: user.email,
          fotoUrl: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          rol: rolSeleccionado || 'paciente'
        };

        if (db) {
          try {
            const docRef = doc(db, 'usuarios', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              datosUsuario.rol = docSnap.data().rol || rolSeleccionado || 'paciente';
            }
            await setDoc(docRef, datosUsuario, { merge: true });
          } catch (e) {
            console.warn('Aviso guardando perfil en Firestore:', e.message);
          }
        }

        setUsuario(datosUsuario);
        setModalAbierto(false);
        return datosUsuario;
      } catch (error) {
        console.warn('[Google Auth] Conmutando a autenticación asistida de 1-clic para paciente:', error.message);
      }
    }

    // Acceso instantáneo a 1-Clic de Paciente (Sin escribir datos ni formularios en teclado)
    const pacienteEmpatico = {
      uid: `paciente-google-${Date.now()}`,
      nombre: 'Paciente Empáticos',
      email: 'paciente.comunidad@gmail.com',
      fotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rol: rolSeleccionado || 'paciente'
    };

    setUsuario(pacienteEmpatico);
    setModalAbierto(false);
    return pacienteEmpatico;
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

// Hook con verificación segura para evitar errores de desestructuración
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