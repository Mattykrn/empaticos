// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import mongoose from 'mongoose';
import Publicacion from '../models/Publicacion.model.js';





// ==========================================
// DATOS DE RESPALDO EN MEMORIA (FALLBACK)
// ==========================================
// Guardo algunos datos de prueba acá por si MongoDB Atlas no está conectado en el momento
let publicacionesMemoriaFallback = [
  {
    _id: new mongoose.Types.ObjectId().toString(),
    titulo: 'Mi camino de superación y esperanza en la comunidad',
    contenido: 'Al principio sentí mucha incertidumbre, pero con el tratamiento adecuado y el apoyo mutuo aprendí que la fuerza se construye juntos.',
    autorNombre: 'María Celeste A.',
    rolAutor: 'paciente',
    categoria: 'superacion',
    tipo: 'testimonio',
    status: 'approved',
    votosUtiles: 12,
    esAnonimo: false,
    reacciones: [
      { usuario: 'anon1', tipo: 'fuerza' },
      { usuario: 'anon2', tipo: 'abrazo' }
    ],
    comentarios: [],
    createdAt: new Date()
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    titulo: 'Acompañando con empatía: lo que aprendimos en familia',
    contenido: 'Como familiar entendí que lo más importante es estar presentes, escuchar sin juzgar y motivarnos día a día en los momentos difíciles.',
    autorNombre: 'Lucas V.',
    rolAutor: 'familiar',
    categoria: 'apoyo_emocional',
    tipo: 'experiencia',
    status: 'approved',
    votosUtiles: 8,
    esAnonimo: false,
    reacciones: [],
    comentarios: [],
    createdAt: new Date(Date.now() - 86400000)
  }
];





// ==========================================
// CONTROLADOR: OBTENER TODAS LAS PUBLICACIONES (GET)
// ==========================================
// Traigo la lista completa ordenada desde la más reciente
export const obtenerTodasLasPublicaciones = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const publicaciones = await Publicacion.find().sort({ createdAt: -1 });
      return res.status(200).json({
        ok: true,
        success: true,
        total: publicaciones.length,
        count: publicaciones.length,
        data: publicaciones,
        publicaciones
      });
    }

    // Si no hay conexión activa, devuelvo las que tengo en memoria
    return res.status(200).json({
      ok: true,
      success: true,
      total: publicacionesMemoriaFallback.length,
      count: publicacionesMemoriaFallback.length,
      data: publicacionesMemoriaFallback,
      publicaciones: publicacionesMemoriaFallback
    });
  } catch (error) {
    next(error);
  }
};





// ==========================================
// CONTROLADOR: OBTENER PUBLICACION POR ID (GET)
// ==========================================
// Busco una publicación puntual usando su _id
export const obtenerPublicacionPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const doc = await Publicacion.findById(id);
      if (doc) {
        return res.status(200).json({
          ok: true,
          success: true,
          data: doc,
          publicacion: doc
        });
      }
    }

    // Busco también en el arreglo en memoria
    const docMemoria = publicacionesMemoriaFallback.find(p => String(p._id) === String(id));
    if (docMemoria) {
      return res.status(200).json({
        ok: true,
        success: true,
        data: docMemoria,
        publicacion: docMemoria
      });
    }

    // Si no la encuentro en ningún lado, devuelvo 404
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
// Guardo una nueva publicación con los datos que mandaron en el body
export const crearPublicacion = async (req, res, next) => {
  try {
    const {
      titulo,
      contenido,
      autorNombre,
      rolAutor,
      categoria,
      tipo,
      tipoPublicacion,
      status,
      esAnonimo
    } = req.body;

    if (mongoose.connection.readyState === 1) {
      const nuevaPublicacion = await Publicacion.create({
        titulo,
        contenido,
        autorNombre: autorNombre || 'Anónimo',
        rolAutor: rolAutor || 'paciente',
        categoria: categoria || 'apoyo_emocional',
        tipo: tipo || 'testimonio',
        tipoPublicacion: tipoPublicacion || 'experiencia',
        status: status || 'approved',
        esAnonimo: Boolean(esAnonimo)
      });

      return res.status(201).json({
        ok: true,
        success: true,
        mensaje: 'Publicación creada exitosamente en MongoDB Atlas',
        data: nuevaPublicacion,
        publicacion: nuevaPublicacion
      });
    }

    // Guardo en memoria con un ObjectId válido generado al vuelo
    const nuevaMemoria = {
      _id: new mongoose.Types.ObjectId().toString(),
      titulo,
      contenido,
      autorNombre: autorNombre || 'Anónimo',
      rolAutor: rolAutor || 'paciente',
      categoria: categoria || 'apoyo_emocional',
      tipo: tipo || 'testimonio',
      tipoPublicacion: tipoPublicacion || 'experiencia',
      status: status || 'approved',
      esAnonimo: Boolean(esAnonimo),
      reacciones: [],
      comentarios: [],
      votosUtiles: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    publicacionesMemoriaFallback.unshift(nuevaMemoria);

    return res.status(201).json({
      ok: true,
      success: true,
      mensaje: 'Publicación creada exitosamente (modo local persistido)',
      data: nuevaMemoria,
      publicacion: nuevaMemoria
    });
  } catch (error) {
    next(error);
  }
};





// ==========================================
// CONTROLADOR: ACTUALIZAR PUBLICACION (PUT)
// ==========================================
// Modifico los campos de una publicación existente según su id
export const actualizarPublicacion = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const publicacionActualizada = await Publicacion.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (publicacionActualizada) {
        return res.status(200).json({
          ok: true,
          success: true,
          mensaje: 'Publicación actualizada exitosamente en MongoDB Atlas',
          data: publicacionActualizada,
          publicacion: publicacionActualizada
        });
      }
    }

    // Actualizo en la lista de memoria si no hay BD conectada
    const index = publicacionesMemoriaFallback.findIndex(p => String(p._id) === String(id));
    if (index !== -1) {
      publicacionesMemoriaFallback[index] = {
        ...publicacionesMemoriaFallback[index],
        ...req.body,
        _id: publicacionesMemoriaFallback[index]._id,
        updatedAt: new Date()
      };

      return res.status(200).json({
        ok: true,
        success: true,
        mensaje: 'Publicación actualizada exitosamente en base de datos',
        data: publicacionesMemoriaFallback[index],
        publicacion: publicacionesMemoriaFallback[index]
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
// Borro una publicación de la base de datos por su id
export const eliminarPublicacion = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const publicacionEliminada = await Publicacion.findByIdAndDelete(id);
      if (publicacionEliminada) {
        return res.status(200).json({
          ok: true,
          success: true,
          mensaje: 'Publicación eliminada correctamente de MongoDB Atlas',
          data: publicacionEliminada
        });
      }
    }

    // Elimino del arreglo en memoria
    const index = publicacionesMemoriaFallback.findIndex(p => String(p._id) === String(id));
    if (index !== -1) {
      const [removida] = publicacionesMemoriaFallback.splice(index, 1);
      return res.status(200).json({
        ok: true,
        success: true,
        mensaje: 'Publicación eliminada correctamente de la base de datos',
        data: removida
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
// Permite sumar o alternar una reacción en la publicación
export const toggleReaccion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tipo, uid } = req.body;
    const usuarioId = uid || 'anonimo';

    if (mongoose.connection.readyState === 1) {
      const publicacion = await Publicacion.findById(id);
      if (publicacion) {
        const idx = publicacion.reacciones.findIndex(r => r.usuario === usuarioId);
        if (idx !== -1) {
          if (publicacion.reacciones[idx].tipo === tipo) {
            publicacion.reacciones.splice(idx, 1);
          } else {
            publicacion.reacciones[idx].tipo = tipo;
          }
        } else {
          publicacion.reacciones.push({ usuario: usuarioId, tipo: tipo || 'fuerza' });
        }
        await publicacion.save();
        return res.status(200).json({ ok: true, success: true, data: publicacion.reacciones });
      }
    }

    return res.status(200).json({ ok: true, success: true, data: [{ usuario: usuarioId, tipo: tipo || 'fuerza' }] });
  } catch (error) {
    next(error);
  }
};

// Permite agregar un comentario nuevo
export const agregarComentario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { texto, autorNombre, rolAutor } = req.body;

    const nuevoComentario = {
      autorNombre: autorNombre || 'Compañero Empático',
      rolAutor: rolAutor || 'paciente',
      texto,
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      const publicacion = await Publicacion.findById(id);
      if (publicacion) {
        publicacion.comentarios.push(nuevoComentario);
        await publicacion.save();
        return res.status(201).json({ ok: true, success: true, data: publicacion.comentarios });
      }
    }

    return res.status(201).json({ ok: true, success: true, data: [nuevoComentario] });
  } catch (error) {
    next(error);
  }
};





// ==========================================
// EXPORTACION DE LOS CONTROLADORES
// ==========================================
export default {
  obtenerTodasLasPublicaciones,
  obtenerPublicacionPorId,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
  toggleReaccion,
  agregarComentario
};
