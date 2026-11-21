import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, esApiKeyValida } from '../config/firebase';

const CLAVE_SESION_LOCAL = 'empaticos-usuario-v1';
const AVATAR_DEFAULT = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

const leerSesionLocal = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CLAVE_SESION_LOCAL);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.uid ? parsed : null;
  } catch {
    return null;
  }
};

const guardarSesionLocal = (datos) => {
  if (typeof window === 'undefined') return;
  try {
    if (datos) {
      window.localStorage.setItem(CLAVE_SESION_LOCAL, JSON.stringify(datos));
    } else {
      window.localStorage.removeItem(CLAVE_SESION_LOCAL);
    }
  } catch {
    // Ignora cuotas de almacenamiento
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(leerSesionLocal);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorAuth, setErrorAuth] = useState('');

  useEffect(() => {
    if (!esApiKeyValida || !auth || typeof onAuthStateChanged !== 'function') {
      setCargando(false);
      return;
    }

    try {
      const desuscribir = onAuthStateChanged(auth, async (userFirebase) => {
        if (userFirebase) {
          const sesionPrevia = leerSesionLocal();
          const rolPreferido = sesionPrevia?.uid === userFirebase.uid ? sesionPrevia.rol : null;

          const baseUsuario = {
            uid: userFirebase.uid,
            nombre: userFirebase.displayName || 'Paciente Empáticos',
            email: userFirebase.email || '',
            fotoUrl: userFirebase.photoURL || AVATAR_DEFAULT,
            rol: rolPreferido || 'paciente',
            proveedor: 'google'
          };

          try {
            if (db) {
              const docRef = doc(db, 'usuarios', userFirebase.uid);
              const docSnap = await getDoc(docRef);

              if (docSnap.exists()) {
                const datosMerged = {
                  ...baseUsuario,
                  ...docSnap.data(),
                  uid: userFirebase.uid,
                  rol: rolPreferido || docSnap.data().rol || 'paciente'
                };
                setUsuario(datosMerged);
                guardarSesionLocal(datosMerged);
              } else {
                await setDoc(docRef, baseUsuario, { merge: true });
                setUsuario(baseUsuario);
                guardarSesionLocal(baseUsuario);
              }
            } else {
              setUsuario(baseUsuario);
              guardarSesionLocal(baseUsuario);
            }
          } catch (error) {
            console.warn('Uso de datos básicos de cuenta Google:', error.message);
            setUsuario(baseUsuario);
            guardarSesionLocal(baseUsuario);
          }
        } else {
          // Si hay una sesión local activa (sin Google), la mantengo intacta
          const local = leerSesionLocal();
          if (local && local.proveedor === 'local') {
            setUsuario(local);
          } else {
            setUsuario(null);
            guardarSesionLocal(null);
          }
        }
        setCargando(false);
      });

      return () => desuscribir();
    } catch (err) {
      console.warn('Fallback en oyente de autenticación:', err.message);
      setCargando(false);
    }
  }, []);

  // Acceso local inmediato con nombre y rol elegidos (persistido en localStorage)
  const loginLocal = (nombreIngresado = 'Miembro Empáticos', rolSeleccionado = 'paciente') => {
    setErrorAuth('');
    const sesionPrevia = leerSesionLocal();
    const uidReutilizable = sesionPrevia?.proveedor === 'local' && sesionPrevia.uid
      ? sesionPrevia.uid
      : `usr-local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const usuarioLocal = {
      uid: uidReutilizable,
      nombre: (nombreIngresado || '').trim() || 'Miembro Empáticos',
      email: '',
      fotoUrl: AVATAR_DEFAULT,
      rol: rolSeleccionado || 'paciente',
      proveedor: 'local'
    };

    setUsuario(usuarioLocal);
    guardarSesionLocal(usuarioLocal);
    setModalAbierto(false);
    return usuarioLocal;
  };

  // Acceso con Google vía Firebase Auth (con manejo claro de cancelación o errores de dominio)
  const loginConGoogle = async (rolSeleccionado = 'paciente') => {
    setErrorAuth('');

    if (esApiKeyValida && auth && googleProvider) {
      try {
        const resultado = await signInWithPopup(auth, googleProvider);
        if (resultado && resultado.user) {
          const user = resultado.user;
          const datosGoogle = {
            uid: user.uid,
            nombre: user.displayName || 'Paciente Empáticos',
            email: user.email || '',
            fotoUrl: user.photoURL || AVATAR_DEFAULT,
            rol: rolSeleccionado || 'paciente',
            proveedor: 'google'
          };

          guardarSesionLocal(datosGoogle);
          setUsuario(datosGoogle);

          if (db) {
            try {
              await setDoc(doc(db, 'usuarios', user.uid), datosGoogle, { merge: true });
            } catch (dbErr) {
              console.warn('No se pudo sincronizar perfil en Firestore:', dbErr.message);
            }
          }

          setModalAbierto(false);
          return datosGoogle;
        }
      } catch (error) {
        const codigo = error?.code || '';
        console.warn('[Firebase Auth Warn]', codigo || error.message);

        if (codigo === 'auth/popup-closed-by-user' || codigo === 'auth/cancelled-popup-request') {
          setErrorAuth('Se cerró la ventana de Google antes de completar el ingreso. Podés volver a intentarlo o ingresar con tu nombre.');
          return null;
        }

        if (codigo === 'auth/popup-blocked') {
          setErrorAuth('El navegador bloqueó la ventana emergente de Google. Habilitá los pop-ups o ingresá directamente con tu nombre.');
          return null;
        }

        // Si el dominio no está autorizado o hay error de red, permito ingreso local fluido
        setErrorAuth('');
        return loginLocal('Paciente Empáticos', rolSeleccionado);
      }
    }

    return loginLocal('Paciente Empáticos', rolSeleccionado);
  };

  const logout = async () => {
    setErrorAuth('');
    try {
      if (auth && auth.currentUser) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
    } finally {
      setUsuario(null);
      guardarSesionLocal(null);
    }
  };

  const abrirModalRegistro = () => {
    setErrorAuth('');
    setModalAbierto(true);
  };
  const cerrarModalRegistro = () => {
    setErrorAuth('');
    setModalAbierto(false);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        estaAutenticado: !!usuario,
        cargando,
        errorAuth,
        setErrorAuth,
        modalAbierto,
        setModalAbierto,
        loginConGoogle,
        loginLocal,
        logout,
        abrirModalRegistro,
        cerrarModalRegistro
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      usuario: null,
      estaAutenticado: false,
      cargando: false,
      errorAuth: '',
      setErrorAuth: () => {},
      modalAbierto: false,
      setModalAbierto: () => {},
      loginConGoogle: async () => null,
      loginLocal: () => null,
      logout: async () => {},
      abrirModalRegistro: () => {},
      cerrarModalRegistro: () => {}
    };
  }
  return context;
};
