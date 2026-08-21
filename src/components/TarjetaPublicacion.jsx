import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ModalUnirme from './ModalUnirme';

// En este componente presento la tarjeta interactiva de cada historia o publicación con apoyo multimedia y reacciones
const TarjetaPublicacion = ({ publicacion, onReaccionActualizada }) => {
  const { usuario, estaAutenticado, token } = useAuth();
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reaccionesLocales, setReaccionesLocales] = useState(publicacion.reacciones || []);
  const [cargandoReaccion, setCargandoReaccion] = useState(false);

  // En esta función calculo el conteo total de cada tipo de reacción para mostrar en los badges
  const contarReacciones = (tipoReaccion) => {
    return reaccionesLocales.filter(r => r.tipo === tipoReaccion).length;
  };

  // Verifico si el usuario logueado ya ha reaccionado con un tipo específico
  const usuarioYaReacciono = (tipoReaccion) => {
    if (!usuario) return false;
    return reaccionesLocales.some(r => String(r.usuarioId) === String(usuario.id || usuario._id) && r.tipo === tipoReaccion);
  };

  // En este manejador procesamos la adición o cambio de reacción en MongoDB Atlas
  const handleReaccionar = async (tipoReaccion) => {
    // Si el usuario no está registrado, evito la acción y abro el modal "Unirme"
    if (!estaAutenticado) {
      setModalAbierto(true);
      return;
    }

    setCargandoReaccion(true);
    try {
      // Invocación a la API para registrar o alternar la reacción del usuario
      const response = await axios.post(
        `/api/publicaciones/${publicacion._id || publicacion.id}/reaccionar`,
        { tipo: tipoReaccion },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setReaccionesLocales(response.data.reacciones || []);
        if (onReaccionActualizada) {
          onReaccionActualizada(publicacion._id, response.data.reacciones);
        }
      }
    } catch (error) {
      console.error('Error al registrar reacción:', error);
    } finally {
      setCargandoReaccion(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all mb-6">
        {/* Cabecera del autor */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-lg">
              {publicacion.autorNombre?.charAt(0) || 'E'}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-base leading-tight">
                {publicacion.autorNombre || 'Miembro Empáticos'}
              </h4>
              <span className="text-xs uppercase font-semibold text-teal-600 dark:text-teal-400">
                Rol: {publicacion.rolAutor || 'paciente'}
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-400">
            {new Date(publicacion.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Contenido principal de la publicación */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {publicacion.titulo}
        </h3>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4 whitespace-pre-line">
          {publicacion.contenido}
        </p>

        {/* Reproductor de Video si tipoContenido === 'video' y existe mediaUrl */}
        {publicacion.tipoContenido === 'video' && publicacion.mediaUrl && (
          <div className="my-4 aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
            <iframe
              src={publicacion.mediaUrl.replace('watch?v=', 'embed/')}
              title={publicacion.titulo}
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        )}

        {/* Reproductor de Audio si tipoContenido === 'audio' y existe mediaUrl */}
        {publicacion.tipoContenido === 'audio' && publicacion.mediaUrl && (
          <div className="my-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-xs font-semibold text-slate-500 mb-2">🎧 Testimonio en Audio</div>
            <audio controls className="w-full">
              <source src={publicacion.mediaUrl} type="audio/mpeg" />
              Tu navegador no soporta reproducción de audio.
            </audio>
          </div>
        )}

        {/* Barra de Reacciones interactivas (Fuerza, Abrazo, Gracias) */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
          <button
            onClick={() => handleReaccionar('fuerza')}
            disabled={cargandoReaccion}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
              usuarioYaReacciono('fuerza')
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <span>💪</span>
            <span>Mucha Fuerza ({contarReacciones('fuerza')})</span>
          </button>

          <button
            onClick={() => handleReaccionar('abrazo')}
            disabled={cargandoReaccion}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
              usuarioYaReacciono('abrazo')
                ? 'bg-teal-600 text-white shadow-md shadow-teal-500/30'
                : 'bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20'
            }`}
          >
            <span>🤗</span>
            <span>Un Abrazo ({contarReacciones('abrazo')})</span>
          </button>

          <button
            onClick={() => handleReaccionar('gracias')}
            disabled={cargandoReaccion}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
              usuarioYaReacciono('gracias')
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20'
            }`}
          >
            <span>🧡</span>
            <span>Gracias por Compartir ({contarReacciones('gracias')})</span>
          </button>
        </div>
      </div>

      <ModalUnirme
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
      />
    </>
  );
};

export default TarjetaPublicacion;
