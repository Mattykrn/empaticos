import React, { createContext, useState, useEffect, useContext } from 'react';

// Creo la instancia de mi contexto de autenticación global para compartir el estado de sesión en toda la app
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // En estos estados gestiono la información del usuario autenticado, su token de sesión y la carga inicial
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Al montar mi componente por primera vez, recupero la sesión previamente guardada en el localStorage del navegador
  useEffect(() => {
    const recuperarSesionPersistida = () => {
      try {
        const tokenGuardado = localStorage.getItem('empaticos_token');
        const usuarioGuardado = localStorage.getItem('empaticos_usuario');

        if (tokenGuardado && usuarioGuardado) {
          const usuarioParseado = JSON.parse(usuarioGuardado);
          setToken(tokenGuardado);
          setUsuario(usuarioParseado);
          setEstaAutenticado(true);
        }
      } catch (error) {
        console.error('Error al restaurar la sesión persistida desde localStorage:', error);
        // Si los datos están corruptos, limpio el almacenamiento para evitar estados inconsistentes
        localStorage.removeItem('empaticos_token');
        localStorage.removeItem('empaticos_usuario');
      } finally {
        setCargando(false);
      }
    };

    recuperarSesionPersistida();
  }, []);

  // En esta función me encargo de registrar el inicio de sesión exitoso y guardar las credenciales en localStorage
  const login = (datosUsuario, tokenSesion) => {
    setUsuario(datosUsuario);
    setToken(tokenSesion);
    setEstaAutenticado(true);

    // Persisto el token y los datos de perfil en el navegador
    localStorage.setItem('empaticos_token', tokenSesion);
    localStorage.setItem('empaticos_usuario', JSON.stringify(datosUsuario));
  };

  // En esta función me encargo de cerrar la sesión activa del usuario y limpiar el estado local y el almacenamiento
  const logout = () => {
    setUsuario(null);
    setToken(null);
    setEstaAutenticado(false);

    // Remuevo las claves guardadas en el almacenamiento persistente
    localStorage.removeItem('empaticos_token');
    localStorage.removeItem('empaticos_usuario');
  };

  // Retorno mi proveedor de contexto inyectando todos los estados y métodos requeridos por los componentes
  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        estaAutenticado,
        cargando,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir mi contexto de autenticación fácilmente desde cualquier componente React
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
