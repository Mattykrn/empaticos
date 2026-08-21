import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// En este componente construyo el modal interactivo de bienvenida y registro "Unirme" para los miembros de la comunidad
const ModalUnirme = ({ isOpen, onClose }) => {
  // Consumo la función login de mi contexto de autenticación global
  const { login } = useAuth();

  // En estos estados almaceno los datos ingresados en el formulario y los indicadores de carga o error
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'paciente',
    biografia: ''
  });
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // Si el modal no está abierto, no renderizo ningún elemento en la interfaz
  if (!isOpen) return null;

  // Manejo la actualización de cada input en mi estado local
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // En este método me encargo de procesar la solicitud de registro o autenticación rápida desde mi formulario
  const handleSubmitRapido = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeError('');

    try {
      // Envío la información ingresada hacia el endpoint /api/auth/unirme del servidor Express
      const response = await axios.post('/api/auth/unirme', formData);

      if (response.data.success) {
        // Al recibir la confirmación y el token, registro la sesión en el contexto global
        login(response.data.usuario, response.data.token);
        onClose(); // Cierro el modal tras el registro exitoso
      } else {
        setMensajeError(response.data.mensaje || 'Error al procesar el registro');
      }
    } catch (error) {
      console.error('Error al conectarse con el servidor de autenticación:', error);
      setMensajeError(
        error.response?.data?.mensaje || 'No fue posible completar la autenticación. Intenta nuevamente.'
      );
    } finally {
      setCargando(false);
    }
  };

  // En esta función simulo o proceso el flujo de autenticación transparente con Google OAuth
  const handleGoogleAuth = async () => {
    setCargando(true);
    setMensajeError('');

    try {
      // En este flujo envío una solicitud de prueba con token de Google o autenticación rápida vinculada
      const googleTokenPrueba = 'google-oauth-token-empaticos-demo-2026';
      
      const response = await axios.post('/api/auth/unirme', {
        nombre: formData.nombre || 'Usuario Google Empáticos',
        email: formData.email || 'usuario.google@empaticos.org',
        rol: formData.rol || 'paciente',
        fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        idToken: googleTokenPrueba
      });

      if (response.data.success) {
        login(response.data.usuario, response.data.token);
        onClose();
      }
    } catch (error) {
      console.error('Error en el proceso de autenticación con Google:', error);
      setMensajeError('No fue posible autenticar con Google en este momento.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Cabecera del Modal con botón para cerrar */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-teal-500/10">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Únete a Empáticos</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Sé parte de nuestra comunidad de apoyo y contención</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Alerta de Error si la autenticación falla */}
          {mensajeError && (
            <div className="p-3 text-sm text-rose-700 bg-rose-100 rounded-lg border border-rose-200">
              {mensajeError}
            </div>
          )}

          {/* Opción A: Botón para autenticar con Google */}
          <button
            onClick={handleGoogleAuth}
            disabled={cargando}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
            <span className="relative px-3 text-xs uppercase bg-white dark:bg-slate-900 text-slate-400">O registro rápido</span>
          </div>

          {/* Opción B: Formulario directo de Registro */}
          <form onSubmit={handleSubmitRapido} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre Completo</label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. María González"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Rol en la comunidad</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="paciente">Paciente / Diagnosticado</option>
                <option value="familiar">Familiar / Allegado</option>
                <option value="acompanante">Acompañante Emocional</option>
                <option value="profesional">Profesional de la Salud</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
            >
              {cargando ? 'Registrando...' : 'Completar Registro'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalUnirme;
