import Story from '../models/Story.js';
import Reaction from '../models/Reaction.js';
import mongoose from 'mongoose';

// Historias de respaldo en caso de que la BD Atlas no tenga documentos aún
const historiasBackup = [
  {
    _id: 'story-em-101',
    author: 'María Celeste A.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    content: 'Al principio sentí mucha incertidumbre tras el diagnóstico de Esclerosis Múltiple, pero con el tratamiento adecuado y el apoyo de mi familia aprendí que la fortaleza se construye día a día.',
    imageUrl: '',
    rolAutor: 'paciente',
    titulo: 'Mi camino de superación tras 3 años del diagnóstico de EM',
    createdAt: new Date().toISOString(),
    reacciones: [
      { uid: 'u1', userId: 'u1', tipo: 'fuerza', type: 'fuerza' },
      { uid: 'u2', userId: 'u2', tipo: 'abrazo', type: 'abrazo' }
    ]
  },
  {
    _id: 'story-em-102',
    author: 'Lucas V.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    content: 'Como familiar entendí que lo más importante es estar presentes, escuchar sin juzgar y motivarnos mutuamente en los momentos de fatiga.',
    imageUrl: '',
    rolAutor: 'familiar',
    titulo: 'Acompañando a mi hermana en su proceso',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    reacciones: [
      { uid: 'u3', userId: 'u3', tipo: 'gracias', type: 'gracias' }
    ]
  }
];

// GET /api/stories -> Recuperar historias desde MongoDB Atlas ordenadas por fecha
export const obtenerHistorias = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const historiasBD = await Story.find().sort({ createdAt: -1 });
      const listaOriginal = historiasBD.length > 0 ? historiasBD : historiasBackup;

      const historiasConReacciones = await Promise.all(
        listaOriginal.map(async (h) => {
          const idStr = (h._id || h.id).toString();
          const reacciones = await Reaction.find({ targetId: idStr });
          const obj = h.toObject ? h.toObject() : h;
          return {
            ...obj,
            reacciones: reacciones.map(r => ({ uid: r.userId, userId: r.userId, tipo: r.type, type: r.type }))
          };
        })
      );

      return res.status(200).json({
        ok: true,
        total: historiasConReacciones.length,
        data: historiasConReacciones
      });
    }

    return res.status(200).json({
      ok: true,
      total: historiasBackup.length,
      data: historiasBackup
    });
  } catch (error) {
    return res.status(200).json({
      ok: true,
      total: historiasBackup.length,
      data: historiasBackup
    });
  }
};

// POST /api/stories -> Guardar una historia en MongoDB Atlas
export const crearHistoria = async (req, res) => {
  try {
    const { author, avatar, content, contenido, imageUrl, rolAutor, titulo } = req.body;

    const contenidoFinal = content || contenido || 'Testimonio de la comunidad';
    const autorFinal = author || req.body.autorNombre || 'Miembro Empáticos';

    if (mongoose.connection.readyState === 1) {
      const nuevaHistoria = new Story({
        author: autorFinal,
        avatar: avatar || req.body.autorFoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        content: contenidoFinal,
        imageUrl: imageUrl || '',
        rolAutor: rolAutor || 'paciente',
        titulo: titulo || 'Historia de la comunidad'
      });

      const historiaGuardada = await nuevaHistoria.save();

      return res.status(201).json({
        ok: true,
        mensaje: 'Historia guardada exitosamente en MongoDB Atlas',
        data: {
          ...historiaGuardada.toObject(),
          reacciones: []
        }
      });
    }

    // Fallback local en memoria si MongoDB Atlas aún no está conectado
    const historiaMemoria = {
      _id: `story-${Date.now()}`,
      author: autorFinal,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      content: contenidoFinal,
      imageUrl: imageUrl || '',
      rolAutor: rolAutor || 'paciente',
      titulo: titulo || 'Historia de la comunidad',
      createdAt: new Date().toISOString(),
      reacciones: []
    };
    historiasBackup.unshift(historiaMemoria);

    return res.status(201).json({
      ok: true,
      mensaje: 'Historia publicada correctamente (modo local)',
      data: historiaMemoria
    });
  } catch (error) {
    console.error(`[Error crearHistoria] ${error.message}`);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno al guardar la historia en la base de datos',
      error: error.message
    });
  }
};
