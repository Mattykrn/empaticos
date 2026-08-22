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

  // Escucho el estado de autenticación de Firebase en tiempo real con verificación segura
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
                  nombre: userFirebase.displayName || 'Usuario Empáticos',
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
                nombre: userFirebase.displayName || 'Usuario Empáticos',
                email: userFirebase.email,
                fotoUrl: userFirebase.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                rol: 'paciente'
              });
            }
          } catch (error) {
            console.warn('Uso de datos básicos de autenticación:', error.message);
            setUsuario({
              uid: userFirebase.uid,
              nombre: userFirebase.displayName || 'Usuario Empáticos',
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

  // Función para iniciar sesión o registrarse con la ventana emergente de Google
  const loginConGoogle = async (rolSeleccionado = 'paciente') => {
    try {
      if (auth && googleProvider) {
        const resultado = await signInWithPopup(auth, googleProvider);
        const user = resultado.user;

        let datosUsuario = {
          uid: user.uid,
          nombre: user.displayName || 'Usuario Empáticos',
          email: user.email,
          fotoUrl: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          rol: rolSeleccionado
        };

        if (db) {
          try {
            const docRef = doc(db, 'usuarios', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              datosUsuario.rol = docSnap.data().rol || rolSeleccionado;
            }
            await setDoc(docRef, datosUsuario, { merge: true });
          } catch (e) {
            console.warn('Aviso guardando en Firestore:', e.message);
          }
        }

        setUsuario(datosUsuario);
        setModalAbierto(false);
        return datosUsuario;
      }

      throw new Error('Instancia de Firebase Auth no disponible. Usando usuario demo.');
    } catch (error) {
      console.warn('Inicio de sesión usando perfil demo seguro:', error.message);
      const mockUser = {
        uid: `user-demo-${Date.now()}`,
        nombre: 'Usuario Empáticos',
        email: 'comunidad@empaticos.org',
        fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rol: rolSeleccionado
      };
      setUsuario(mockUser);
      setModalAbierto(false);
      return mockUser;
    }
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