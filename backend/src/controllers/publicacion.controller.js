import Publicacion from '../models/Publicacion.model.js';
import mongoose from 'mongoose';

// Publicaciones iniciales de respaldo en memoria si la BD no está lista
const publicacionesMemoriaFallback = [
  {
    _id: 'pub-em-101',
    autorNombre: 'María Celeste A.',
    rolAutor: 'paciente',
    autorFoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    titulo: 'Mi camino de superación tras 3 años del diagnóstico de EM',
    contenido: 'Al principio sentí mucha incertidumbre tras el diagnóstico de Esclerosis Múltiple, pero con el tratamiento adecuado, kinesiología diaria y el apoyo de mi familia aprendí que la fortaleza se construye día a día. ¡A no bajar los brazos!',
    tipoPublicacion: 'experiencia',
    tipoMultimedia: 'texto',
    mediaUrl: '',
    reacciones: [
      { usuario: 'u1', tipo: 'fuerza' },
      { usuario: 'u2', tipo: 'abrazo' },
      { usuario: 'u3', tipo: 'gracias' }
    ],
    comentarios: [
      {
        autorNombre: 'Dr. Roberto M.',
        rolAutor: 'profesional',
        texto: 'Excelente testimonio María. Mantener la rutina física es clave en la remisión.',
        createdAt: new Date()
      }
    ],
    createdAt: new Date()
  },
  {
    _id: 'pub-em-102',
    autorNombre: 'Lucas V.',
    rolAutor: 'familiar',
    autorFoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    titulo: 'Acompañando a mi hermana en su proceso: lo que aprendimos juntos',
    contenido: 'Como familiar entendí que lo más importante es estar presentes, escuchar sin juzgar y motivarnos mutuamente en los momentos de fatiga. Esta comunidad nos llena de esperanza.',
    tipoPublicacion: 'mensaje_apoyo',
    tipoMultimedia: 'texto',
    mediaUrl: '',
    reacciones: [
      { usuario: 'u4', tipo: 'abrazo' },
      { usuario: 'u5', tipo: 'gracias' }
    ],
    comentarios: [],
    createdAt: new Date(Date.now() - 86400000)
  }
];

// Obtengo todas las publicaciones con sus comentarios y reacciones persistidas
export const obtenerTodasLasPublicaciones = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const publicaciones = await Publicacion.find()
        .sort({ createdAt: -1 })
        .populate('autor', 'nombre fotoUrl rol')
        .populate('comentarios.usuario', 'nombre fotoUrl rol');

      return res.status(200).json({
        success: true,
        count: publicaciones.length,
        data: publicaciones
      });
    }

    return res.status(200).json({
      success: true,
      count: publicacionesMemoriaFallback.length,
      data: publicacionesMemoriaFallback
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      count: publicacionesMemoriaFallback.length,
      data: publicacionesMemoriaFallback
    });
  }
};

// Obtengo una única publicación por su ID
export const obtenerPublicacionPorId = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const publicacion = await Publicacion.findById(req.params.id)
        .populate('autor', 'nombre fotoUrl rol')
        .populate('comentarios.usuario', 'nombre fotoUrl rol');

      if (publicacion) {
        return res.status(200).json({ success: true, data: publicacion });
      }
    }

    const pubFallback = publicacionesMemoriaFallback.find(p => p._id === req.params.id);
    if (pubFallback) {
      return res.status(200).json({ success: true, data: pubFallback });
    }

    return res.status(404).json({
      success: false,
      message: 'No encontré ninguna publicación con ese ID'
    });
  } catch (error) {
    next(error);
  }
};

// Creo una nueva publicación asociándola al usuario logueado
export const crearPublicacion = async (req, res, next) => {
  try {
    const { titulo, contenido, tipoPublicacion, tipoMultimedia, mediaUrl } = req.body;

    if (mongoose.connection.readyState === 1) {
      const nuevaPublicacion = await Publicacion.create({
        autor: req.usuario._id,
        autorNombre: req.usuario.nombre,
        autorFoto: req.usuario.fotoUrl,
        rolAutor: req.usuario.rol,
        titulo,
        contenido,
        tipoPublicacion: tipoPublicacion || 'experiencia',
        tipoMultimedia: tipoMultimedia || 'texto',
        mediaUrl: mediaUrl || '',
        reacciones: [],
        comentarios: []
      });

      return res.status(201).json({
        success: true,
        message: 'Mi historia ha sido publicada y guardada en la base de datos',
        data: nuevaPublicacion
      });
    }

    // Fallback si la BD no está conectada
    const pubMem = {
      _id: `pub-${Date.now()}`,
      autorNombre: req.usuario.nombre,
      autorFoto: req.usuario.fotoUrl,
      rolAutor: req.usuario.rol,
      titulo,
      contenido,
      tipoPublicacion: tipoPublicacion || 'experiencia',
      tipoMultimedia: tipoMultimedia || 'texto',
      mediaUrl: mediaUrl || '',
      reacciones: [],
      comentarios: [],
      createdAt: new Date()
    };
    publicacionesMemoriaFallback.unshift(pubMem);

    return res.status(201).json({
      success: true,
      message: 'Publicación creada (modo local)',
      data: pubMem
    });
  } catch (error) {
    next(error);
  }
};

// Proceso y persisto una reacción
export const toggleReaccion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body;
    const usuarioId = req.usuario._id || req.usuario.id;

    if (mongoose.connection.readyState === 1) {
      const publicacion = await Publicacion.findById(id);
      if (publicacion) {
        const idx = publicacion.reacciones.findIndex(r => r.usuario.toString() === usuarioId.toString());
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
        return res.status(200).json({ success: true, data: publicacion.reacciones });
      }
    }

    const pubLocal = publicacionesMemoriaFallback.find(p => p._id === id);
    if (pubLocal) {
      const idx = pubLocal.reacciones.findIndex(r => r.usuario.toString() === usuarioId.toString());
      if (idx !== -1) {
        if (pubLocal.reacciones[idx].tipo === tipo) {
          pubLocal.reacciones.splice(idx, 1);
        } else {
          pubLocal.reacciones[idx].tipo = tipo;
        }
      } else {
        pubLocal.reacciones.push({ usuario: usuarioId, tipo: tipo || 'fuerza' });
      }
      return res.status(200).json({ success: true, data: pubLocal.reacciones });
    }

    return res.status(404).json({ success: false, message: 'Publicación no encontrada' });
  } catch (error) {
    next(error);
  }
};

// Agrego un comentario
export const agregarComentario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;

    const nuevoComentario = {
      usuario: req.usuario._id || req.usuario.id,
      autorNombre: req.usuario.nombre,
      autorFoto: req.usuario.fotoUrl,
      rolAutor: req.usuario.rol,
      texto,
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      const publicacion = await Publicacion.findById(id);
      if (publicacion) {
        publicacion.comentarios.push(nuevoComentario);
        await publicacion.save();
        return res.status(201).json({ success: true, data: publicacion.comentarios });
      }
    }

    const pubLocal = publicacionesMemoriaFallback.find(p => p._id === id);
    if (pubLocal) {
      pubLocal.comentarios.push(nuevoComentario);
      return res.status(201).json({ success: true, data: pubLocal.comentarios });
    }

    return res.status(404).json({ success: false, message: 'Publicación no encontrada' });
  } catch (error) {
    next(error);
  }
};
