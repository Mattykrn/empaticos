import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ModalUnirme from './ModalUnirme';

// En este componente gestiono la creación de nuevas publicaciones y mensajes de aliento en el muro comunitario
const FormularioPublicar = ({ onPublicacionCreada }) => {
  // Consumo el estado de autenticación y los datos del usuario logueado desde mi AuthContext
  const { usuario, estaAutenticado, token } = useAuth();

  // Estados para controlar el modal de registro rápido, la carga y las notificaciones
  const [modalAbierto, setModalAbierto] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [tipo, setTipo] = useState('historia');
  const [categoria, setCategoria] = useState('general');
  const [cargando, setCargando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState({ tipo: '', texto: '' });

  // Si el usuario no ha iniciado sesión, muestro una llamada a la acción amigable invitándolo a unirse
  if (!estaAutenticado) {
    return (
      <>
        <div className="p-8 my-6 text-center bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 dark:from-slate-800 dark:to-slate-800 rounded-3xl border border-teal-500/20 shadow-xl">
          <div className="text-4xl mb-3">🤝🧡</div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Únete a la comunidad Empáticos
          </h3>
          <p className="text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-6">
            Únete a la comunidad para compartir tu historia o dejar tu mensaje de aliento a otros miembros, pacientes y familiares.
          </p>
          <button
            onClick={() => setModalAbierto(true)}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-full shadow-lg shadow-teal-500/30 transition-all text-lg hover:scale-105"
          >
            Unirme ahora ✍️
          </button>
        </div>

        {/* Modal "Unirme" para que el usuario pueda registrarse e iniciar sesión inmediatamente */}
        <ModalUnirme
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
        />
      </>
    );
  }

  // En esta función envío el nuevo testimonio o mensaje utilizando la identidad de mi usuario logueado
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeEstado({ tipo: '', texto: '' });

    try {
      // Formateo el objeto con los datos de mi usuario autenticado
      const nuevaPublicacion = {
        titulo,
        contenido,
        tipo,
        categoria,
        autorNombre: usuario?.nombre || 'Miembro Empáticos',
        rolAutor: usuario?.rol || 'paciente',
        status: 'approved'
      };

      // Realizo la llamada POST inyectando el token JWT de sesión en los headers de la petición
      const response = await axios.post('/api/publicaciones', nuevaPublicacion, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success || response.status === 201 || response.status === 200) {
        setMensajeEstado({
          tipo: 'exito',
          texto: '¡Tu publicación ha sido compartida exitosamente en la comunidad!'
        });
        
        // Limpio el formulario
        setTitulo('');
        setContenido('');

        // Notifico al componente padre para refrescar el muro
        if (onPublicacionCreada) {
          onPublicacionCreada(response.data.data || response.data.publicacion);
        }
      }
    } catch (error) {
      console.error('Error al enviar la publicación:', error);
      setMensajeEstado({
        tipo: 'error',
        texto: error.response?.data?.motivo || error.response?.data?.mensaje || 'No fue posible enviar tu mensaje.'
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl mb-8">
      {/* Encabezado del Formulario con avatar e identidad del usuario activo */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <img
          src={usuario?.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
          alt={usuario?.nombre}
          className="w-12 h-12 rounded-full object-cover border-2 border-teal-500"
        />
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white leading-tight">
            Compartir como {usuario?.nombre}
          </h4>
          <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-md uppercase">
            Rol: {usuario?.rol}
          </span>
        </div>
      </div>

      {/* Alertas de confirmación o error */}
      {mensajeEstado.texto && (
        <div
          className={`p-4 mb-4 rounded-xl text-sm font-medium ${
            mensajeEstado.tipo === 'exito'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
          }`}
        >
          {mensajeEstado.texto}
        </div>
      )}

      {/* Formulario de creación de contenido */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
            Título de tu mensaje o experiencia
          </label>
          <input
            type="text"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej. Mi camino de recuperación y lo que aprendí..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Tipo de mensaje
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="historia">Historia / Testimonio</option>
              <option value="anecdotas">Anécdota / Experiencia</option>
              <option value="aliento">Mensaje de Aliento</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Categoría
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="general">General</option>
              <option value="superacion">Superación Personal</option>
              <option value="apoyo_emocional">Apoyo Emocional</option>
              <option value="tratamientos">Tratamientos y Avances</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
            Contenido o testimonio
          </label>
          <textarea
            rows="4"
            required
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Escribe tu mensaje con libertad y respeto hacia los demás miembros..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all text-base disabled:opacity-50"
        >
          {cargando ? 'Publicando...' : 'Publicar en el Muro Comunitario 🧡'}
        </button>
      </form>
    </div>
  );
};

export default FormularioPublicar;
