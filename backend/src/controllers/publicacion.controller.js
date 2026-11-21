// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import mongoose from 'mongoose';
import Publicacion from '../models/Publicacion.model.js';
import Reaction from '../models/Reaction.js';
import {
  PUBLICACIONES_INICIALES,
  cargarPublicacionesLocales,
  guardarPublicacionesLocales
} from '../data/localStore.js';

const AVATAR_DEFAULT = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

let semillaMongoIntentada = false;

// Normalizo reacciones para que siempre incluyan uid, userId, usuario, tipo y type
export const normalizarReacciones = (reacciones = []) => {
  if (!Array.isArray(reacciones)) return [];
  const mapaPorUsuario = new Map();

  for (const r of reacciones) {
    if (!r) continue;
    const uid = String(r.uid || r.userId || r.usuario || 'anonimo');
    const tipo = r.tipo || r.type || 'fuerza';
    mapaPorUsuario.set(uid, {
      uid,
      userId: uid,
      usuario: uid,
      tipo,
      type: tipo
    });
  }

  return Array.from(mapaPorUsuario.values());
};

// Normalizo el formato de salida de cada publicación para compatibilidad total con frontend y test-api.js
export const formatearPublicacion = (doc, reaccionesExternas = null) => {
  const obj = doc && typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  const autorNombre = obj.autorNombre || obj.author || 'Anónimo';
  const contenido = obj.contenido || obj.content || '';
  const avatar = obj.avatar || obj.autorFoto || AVATAR_DEFAULT;
  const videoUrl = obj.videoUrl || obj.imageUrl || '';

  const reaccionesCombinadas = normalizarReacciones([
    ...(Array.isArray(obj.reacciones) ? obj.reacciones : []),
    ...(Array.isArray(reaccionesExternas) ? reaccionesExternas : [])
  ]);

  const comentarios = Array.isArray(obj.comentarios)
    ? obj.comentarios.map((c) => ({
        _id: c._id ? String(c._id) : String(c.id || new mongoose.Types.ObjectId()),
        uid: c.uid || '',
        autorNombre: c.autorNombre || 'Compañero Empático',
        autorFoto: c.autorFoto || '',
        rolAutor: c.rolAutor || 'paciente',
        texto: c.texto || '',
        createdAt: c.createdAt || new Date().toISOString()
      }))
    : [];

  return {
    ...obj,
    _id: String(obj._id),
    titulo: obj.titulo || 'Publicación comunitaria',
    contenido,
    content: contenido,
    autorNombre,
    author: autorNombre,
    autorUid: obj.autorUid || '',
    avatar,
    autorFoto: avatar,
    rolAutor: obj.rolAutor || 'paciente',
    categoria: obj.categoria || 'apoyo_emocional',
    tipo: obj.tipo || 'historia',
    tipoPublicacion: obj.tipoPublicacion || 'experiencia',
    videoUrl,
    imageUrl: videoUrl,
    status: obj.status || 'approved',
    estado: obj.estado || 'aprobado',
    votosUtiles: Number(obj.votosUtiles || 0),
    esAnonimo: Boolean(obj.esAnonimo),
    reacciones: reaccionesCombinadas,
    comentarios
  };
};

// Si la base de datos MongoDB Atlas está completamente vacía en el primer arranque, siembro los 3 relatos fundacionales
const asegurarSemillaMongo = async () => {
  if (semillaMongoIntentada || mongoose.connection.readyState !== 1) return;
  semillaMongoIntentada = true;

  try {
    const cantidad = await Publicacion.countDocuments();
    if (cantidad === 0) {
      const docsSemilla = PUBLICACIONES_INICIALES.map(({ _id, ...resto }) => ({
        ...resto,
        _id: new mongoose.Types.ObjectId(_id)
      }));
      await Publicacion.insertMany(docsSemilla, { ordered: false });
      console.log('🌱 [MongoDB Atlas] Base inicializada con las publicaciones fundacionales de Empáticos.');
    }
  } catch (error) {
    console.warn(`⚠️ [MongoDB Atlas] No se pudo sembrar datos iniciales: ${error.message}`);
  }
};

// ==========================================
// CONTROLADOR: OBTENER TODAS LAS PUBLICACIONES (GET)
// ==========================================
export const obtenerTodasLasPublicaciones = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await asegurarSemillaMongo();
      const publicaciones = await Publicacion.find().sort({ createdAt: -1 });
      const ids = publicaciones.map((p) => String(p._id));

      // Sincronizo reacciones guardadas en la colección Reaction para que nunca se pierdan al recargar
      const reaccionesColeccion = ids.length > 0
        ? await Reaction.find({ targetId: { $in: ids } })
        : [];

      const mapaReacciones = new Map();
      for (const r of reaccionesColeccion) {
        const key = String(r.targetId);
        if (!mapaReacciones.has(key)) mapaReacciones.set(key, []);
        mapaReacciones.get(key).push({
          uid: r.userId,
          userId: r.userId,
          usuario: r.userId,
          tipo: r.type,
          type: r.type
        });
      }

      const resultado = publicaciones.map((p) =>
        formatearPublicacion(p, mapaReacciones.get(String(p._id)) || [])
      );

      return res.status(200).json({
        ok: true,
        success: true,
        modo: 'mongodb_atlas',
        total: resultado.length,
        count: resultado.length,
        data: resultado,
        publicaciones: resultado
      });
    }

    const locales = cargarPublicacionesLocales()
      .map((p) => formatearPublicacion(p))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      ok: true,
      success: true,
      modo: 'local_persistente',
      total: locales.length,
      count: locales.length,
      data: locales,
      publicaciones: locales
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CONTROLADOR: OBTENER PUBLICACION POR ID (GET)
// ==========================================
export const obtenerPublicacionPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const doc = await Publicacion.findById(id);
      if (doc) {
        const reaccionesExt = await Reaction.find({ targetId: String(doc._id) });
        const formateada = formatearPublicacion(
          doc,
          reaccionesExt.map((r) => ({ uid: r.userId, userId: r.userId, usuario: r.userId, tipo: r.type, type: r.type }))
        );
        return res.status(200).json({
          ok: true,
          success: true,
          data: formateada,
          publicacion: formateada
        });
      }
      return res.status(404).json({
        ok: false,
        success: false,
        mensaje: `No se encontró ninguna publicación con el ID: ${id}`
      });
    }

    const locales = cargarPublicacionesLocales();
    const docMemoria = locales.find((p) => String(p._id) === String(id));
    if (docMemoria) {
      const formateada = formatearPublicacion(docMemoria);
      return res.status(200).json({
        ok: true,
        success: true,
        data: formateada,
        publicacion: formateada
      });
    }

    return res.status(404).json({
      ok: false,
      success: false,
      mensaje: `No se encontró ninguna publicación con el ID: ${id}`
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CONTROLADOR: CREAR NUEVA PUBLICACION (POST)
// ==========================================
export const crearPublicacion = async (req, res, next) => {
  try {
    const {
      titulo,
      contenido,
      content,
      autorNombre,
      author,
      autorUid,
      avatar,
      autorFoto,
      rolAutor,
      categoria,
      tipo,
      tipoPublicacion,
      videoUrl,
      imageUrl,
      status,
      esAnonimo
    } = req.body;

    const contenidoFinal = (contenido || content || '').trim();
    const autorFinal = esAnonimo ? 'Anónimo' : ((autorNombre || author || 'Miembro Empáticos').trim());
    const avatarFinal = (avatar || autorFoto || AVATAR_DEFAULT).trim();
    const videoFinal = (videoUrl || imageUrl || '').trim();
    const tipoFinal = tipo || 'historia';

    const datosNueva = {
      titulo: titulo.trim(),
      contenido: contenidoFinal,
      autorNombre: autorFinal,
      autorUid: autorUid || '',
      avatar: avatarFinal,
      autorFoto: avatarFinal,
      rolAutor: rolAutor || 'paciente',
      categoria: categoria || (tipoFinal === 'anecdota' ? 'humor' : 'apoyo_emocional'),
      tipo: tipoFinal,
      tipoPublicacion: tipoPublicacion || (tipoFinal === 'anecdota' ? 'anecdota' : 'experiencia'),
      videoUrl: videoFinal,
      imageUrl: videoFinal,
      status: status || 'approved',
      esAnonimo: Boolean(esAnonimo)
    };

    if (mongoose.connection.readyState === 1) {
      const nuevaPublicacion = await Publicacion.create(datosNueva);
      const formateada = formatearPublicacion(nuevaPublicacion);

      return res.status(201).json({
        ok: true,
        success: true,
        mensaje: 'Publicación creada exitosamente en MongoDB Atlas',
        data: formateada,
        publicacion: formateada
      });
    }

    const ahora = new Date().toISOString();
    const nuevaLocal = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...datosNueva,
      estado: 'aprobado',
      reacciones: [],
      comentarios: [],
      votosUtiles: 0,
      createdAt: ahora,
      updatedAt: ahora
    };

    const locales = cargarPublicacionesLocales();
    locales.unshift(nuevaLocal);
    guardarPublicacionesLocales(locales);

    const formateada = formatearPublicacion(nuevaLocal);

    return res.status(201).json({
      ok: true,
      success: true,
      mensaje: 'Publicación creada exitosamente (guardada localmente)',
      data: formateada,
      publicacion: formateada
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CONTROLADOR: ACTUALIZAR PUBLICACION (PUT)
// ==========================================
export const actualizarPublicacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const camposActualizables = {};

    if (req.body.titulo !== undefined) camposActualizables.titulo = String(req.body.titulo).trim();
    if (req.body.contenido !== undefined || req.body.content !== undefined) {
      camposActualizables.contenido = String(req.body.contenido ?? req.body.content).trim();
    }
    if (req.body.autorNombre !== undefined || req.body.author !== undefined) {
      camposActualizables.autorNombre = String(req.body.autorNombre ?? req.body.author).trim();
    }
    if (req.body.avatar !== undefined || req.body.autorFoto !== undefined) {
      const foto = String(req.body.avatar ?? req.body.autorFoto).trim();
      camposActualizables.avatar = foto;
      camposActualizables.autorFoto = foto;
    }
    if (req.body.rolAutor !== undefined) camposActualizables.rolAutor = req.body.rolAutor;
    if (req.body.categoria !== undefined) camposActualizables.categoria = req.body.categoria;
    if (req.body.tipo !== undefined) camposActualizables.tipo = req.body.tipo;
    if (req.body.videoUrl !== undefined || req.body.imageUrl !== undefined) {
      const video = String(req.body.videoUrl ?? req.body.imageUrl ?? '').trim();
      camposActualizables.videoUrl = video;
      camposActualizables.imageUrl = video;
    }
    if (req.body.status !== undefined) camposActualizables.status = req.body.status;
    if (req.body.esAnonimo !== undefined) camposActualizables.esAnonimo = Boolean(req.body.esAnonimo);

    if (mongoose.connection.readyState === 1) {
      const publicacionActualizada = await Publicacion.findByIdAndUpdate(
        id,
        { $set: camposActualizables },
        { new: true, runValidators: true }
      );

      if (publicacionActualizada) {
        const reaccionesExt = await Reaction.find({ targetId: String(publicacionActualizada._id) });
        const formateada = formatearPublicacion(
          publicacionActualizada,
          reaccionesExt.map((r) => ({ uid: r.userId, userId: r.userId, usuario: r.userId, tipo: r.type, type: r.type }))
        );
        return res.status(200).json({
          ok: true,
          success: true,
          mensaje: 'Publicación actualizada exitosamente en MongoDB Atlas',
          data: formateada,
          publicacion: formateada
        });
      }

      return res.status(404).json({
        ok: false,
        success: false,
        mensaje: `No se pudo actualizar. Publicación con ID ${id} no encontrada`
      });
    }

    const locales = cargarPublicacionesLocales();
    const index = locales.findIndex((p) => String(p._id) === String(id));
    if (index !== -1) {
      locales[index] = {
        ...locales[index],
        ...camposActualizables,
        _id: locales[index]._id,
        updatedAt: new Date().toISOString()
      };
      guardarPublicacionesLocales(locales);

      const formateada = formatearPublicacion(locales[index]);
      return res.status(200).json({
        ok: true,
        success: true,
        mensaje: 'Publicación actualizada exitosamente en base de datos local',
        data: formateada,
        publicacion: formateada
      });
    }

    return res.status(404).json({
      ok: false,
      success: false,
      mensaje: `No se pudo actualizar. Publicación con ID ${id} no encontrada`
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CONTROLADOR: ELIMINAR PUBLICACION (DELETE)
// ==========================================
export const eliminarPublicacion = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const publicacionEliminada = await Publicacion.findByIdAndDelete(id);
      if (publicacionEliminada) {
        await Reaction.deleteMany({ targetId: String(id) });
        return res.status(200).json({
          ok: true,
          success: true,
          mensaje: 'Publicación eliminada correctamente de MongoDB Atlas',
          data: formatearPublicacion(publicacionEliminada)
        });
      }

      return res.status(404).json({
        ok: false,
        success: false,
        mensaje: `No se pudo eliminar. No existe publicación con ID ${id}`
      });
    }

    const locales = cargarPublicacionesLocales();
    const index = locales.findIndex((p) => String(p._id) === String(id));
    if (index !== -1) {
      const [removida] = locales.splice(index, 1);
      guardarPublicacionesLocales(locales);
      return res.status(200).json({
        ok: true,
        success: true,
        mensaje: 'Publicación eliminada correctamente de la base de datos local',
        data: formatearPublicacion(removida)
      });
    }

    return res.status(404).json({
      ok: false,
      success: false,
      mensaje: `No se pudo eliminar. No existe publicación con ID ${id}`
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CONTROLADORES COMPLEMENTARIOS (REACCIONES Y COMENTARIOS)
// ==========================================
export const toggleReaccion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tipoFinal = req.body.tipo || req.body.type || 'fuerza';
    const usuarioId = String(req.body.uid || req.body.userId || req.body.usuario || 'anonimo');

    if (mongoose.connection.readyState === 1) {
      const publicacion = await Publicacion.findById(id);
      if (!publicacion) {
        return res.status(404).json({ ok: false, success: false, mensaje: 'Publicación no encontrada' });
      }

      const lista = normalizarReacciones(publicacion.reacciones);
      const idx = lista.findIndex((r) => r.uid === usuarioId);
      if (idx !== -1) {
        if (lista[idx].tipo === tipoFinal) {
          lista.splice(idx, 1);
          await Reaction.deleteOne({ targetId: String(id), userId: usuarioId });
        } else {
          lista[idx] = { uid: usuarioId, userId: usuarioId, usuario: usuarioId, tipo: tipoFinal, type: tipoFinal };
          await Reaction.findOneAndUpdate(
            { targetId: String(id), userId: usuarioId },
            { type: tipoFinal },
            { upsert: true }
          );
        }
      } else {
        lista.push({ uid: usuarioId, userId: usuarioId, usuario: usuarioId, tipo: tipoFinal, type: tipoFinal });
        await Reaction.findOneAndUpdate(
          { targetId: String(id), userId: usuarioId },
          { type: tipoFinal },
          { upsert: true }
        );
      }

      publicacion.reacciones = lista;
      await publicacion.save();
      return res.status(200).json({ ok: true, success: true, data: lista });
    }

    const locales = cargarPublicacionesLocales();
    const index = locales.findIndex((p) => String(p._id) === String(id));
    if (index === -1) {
      return res.status(404).json({ ok: false, success: false, mensaje: 'Publicación no encontrada' });
    }

    const lista = normalizarReacciones(locales[index].reacciones);
    const idx = lista.findIndex((r) => r.uid === usuarioId);
    if (idx !== -1) {
      if (lista[idx].tipo === tipoFinal) {
        lista.splice(idx, 1);
      } else {
        lista[idx] = { uid: usuarioId, userId: usuarioId, usuario: usuarioId, tipo: tipoFinal, type: tipoFinal };
      }
    } else {
      lista.push({ uid: usuarioId, userId: usuarioId, usuario: usuarioId, tipo: tipoFinal, type: tipoFinal });
    }

    locales[index].reacciones = lista;
    guardarPublicacionesLocales(locales);
    return res.status(200).json({ ok: true, success: true, data: lista });
  } catch (error) {
    next(error);
  }
};

export const agregarComentario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { texto, autorNombre, autorFoto, rolAutor, uid } = req.body;

    const nuevoComentario = {
      _id: new mongoose.Types.ObjectId().toString(),
      uid: uid || '',
      autorNombre: (autorNombre || 'Compañero Empático').trim(),
      autorFoto: autorFoto || '',
      rolAutor: rolAutor || 'paciente',
      texto: String(texto).trim(),
      createdAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      const publicacion = await Publicacion.findById(id);
      if (!publicacion) {
        return res.status(404).json({ ok: false, success: false, mensaje: 'Publicación no encontrada' });
      }

      publicacion.comentarios.push(nuevoComentario);
      await publicacion.save();
      const formateada = formatearPublicacion(publicacion);
      return res.status(201).json({
        ok: true,
        success: true,
        mensaje: 'Comentario agregado con éxito',
        data: formateada.comentarios
      });
    }

    const locales = cargarPublicacionesLocales();
    const index = locales.findIndex((p) => String(p._id) === String(id));
    if (index === -1) {
      return res.status(404).json({ ok: false, success: false, mensaje: 'Publicación no encontrada' });
    }

    if (!Array.isArray(locales[index].comentarios)) {
      locales[index].comentarios = [];
    }
    locales[index].comentarios.push(nuevoComentario);
    guardarPublicacionesLocales(locales);

    return res.status(201).json({
      ok: true,
      success: true,
      mensaje: 'Comentario agregado con éxito (modo local persistente)',
      data: locales[index].comentarios
    });
  } catch (error) {
    next(error);
  }
};

export default {
  obtenerTodasLasPublicaciones,
  obtenerPublicacionPorId,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
  toggleReaccion,
  agregarComentario
};
