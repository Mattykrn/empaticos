import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export const TarjetaPublicacion = ({ publicacion }) => {
  const { usuario, estaAutenticado, abrirModalRegistro } = useAuth();
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [mostrandoComentarios, setMostrandoComentarios] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const reacciones = publicacion.reacciones || [];
  const comentarios = publicacion.comentarios || [];

  // Verifico si el usuario actual reaccionó
  const miReaccion = usuario ? reacciones.find((r) => r.uid === usuario.uid) : null;

  const handleReaccion = async (tipo) => {
    if (!estaAutenticado) {
      abrirModalRegistro();
      return;
    }

    const docRef = doc(db, 'historias', publicacion.id);

    try {
      if (miReaccion) {
        // Quito la reacción previa
        await updateDoc(docRef, {
          reacciones: arrayRemove(miReaccion)
        });

        // Si eligió un tipo diferente, agrego la nueva
        if (miReaccion.tipo !== tipo) {
          await updateDoc(docRef, {
            reacciones: arrayUnion({ uid: usuario.uid, tipo })
          });
        }
      } else {
        // Agrego la reacción inicial
        await updateDoc(docRef, {
          reacciones: arrayUnion({ uid: usuario.uid, tipo })
        });
      }
    } catch (error) {
      console.error('Error al actualizar reacción en Firestore:', error);
    }
  };

  const handleComentar = async (e) => {
    e.preventDefault();
    if (!estaAutenticado) {
      abrirModalRegistro();
      return;
    }
    if (!nuevoComentario.trim()) return;

    setEnviando(true);
    const docRef = doc(db, 'historias', publicacion.id);

    try {
      const comentarioObj = {
        id: Date.now().toString(),
        uid: usuario.uid,
        autorNombre: usuario.nombre,
        autorFoto: usuario.fotoUrl,
        rolAutor: usuario.rol,
        texto: nuevoComentario.trim(),
        createdAt: new Date().toISOString()
      };

      await updateDoc(docRef, {
        comentarios: arrayUnion(comentarioObj)
      });

      setNuevoComentario('');
    } catch (error) {
      console.error('Error al guardar comentario en Firestore:', error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <article className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100">
      {/* Encabezado Autor */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={publicacion.autorFoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
            alt={publicacion.autorNombre}
            className="w-11 h-11 rounded-full object-cover border border-amber-200"
          />
          <div>
            <h4 className="font-bold text-gray-800 text-sm sm:text-base">{publicacion.autorNombre}</h4>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 capitalize">
              {publicacion.rolAutor}
            </span>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">{publicacion.titulo}</h3>
      <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 whitespace-pre-line">
        {publicacion.contenido}
      </p>

      {/* Botones de Reacción */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleReaccion('fuerza')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              miReaccion?.tipo === 'fuerza' ? 'bg-amber-500 text-white' : 'bg-gray-100 hover:bg-amber-100 text-gray-700'
            }`}
          >
            💪 Fuerza ({reacciones.filter((r) => r.tipo === 'fuerza').length})
          </button>
          <button
            onClick={() => handleReaccion('abrazo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              miReaccion?.tipo === 'abrazo' ? 'bg-rose-500 text-white' : 'bg-gray-100 hover:bg-rose-100 text-gray-700'
            }`}
          >
            🫂 Abrazo ({reacciones.filter((r) => r.tipo === 'abrazo').length})
          </button>
          <button
            onClick={() => handleReaccion('gracias')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              miReaccion?.tipo === 'gracias' ? 'bg-teal-500 text-white' : 'bg-gray-100 hover:bg-teal-100 text-gray-700'
            }`}
          >
            🙏 Gracias ({reacciones.filter((r) => r.tipo === 'gracias').length})
          </button>
        </div>

        <button
          onClick={() => setMostrandoComentarios(!mostrandoComentarios)}
          className="text-xs font-bold text-gray-500 hover:text-amber-600"
        >
          💬 {comentarios.length} comentarios
        </button>
      </div>

      {/* Comentarios */}
      {mostrandoComentarios && (
        <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {comentarios.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Sin comentarios aún.</p>
            ) : (
              comentarios.map((c) => (
                <div key={c.id} className="bg-gray-50 p-3 rounded-2xl text-xs sm:text-sm">
                  <span className="font-bold text-gray-800 block mb-0.5">{c.autorNombre}</span>
                  <p className="text-gray-600">{c.texto}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleComentar} className="flex gap-2">
            <input
              type="text"
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              placeholder={estaAutenticado ? 'Escribe un mensaje...' : 'Inicia sesión para comentar'}
              disabled={!estaAutenticado || enviando}
              className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={!estaAutenticado || enviando}
              className="bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm hover:bg-amber-600 disabled:opacity-50"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </article>
  );
};