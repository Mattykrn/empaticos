/**
 * ARCHIVO: backend/src/controllers/storyController.js
 * RESPONSABILIDAD EN LA ARQUITECTURA:
 * En este controlador me encargo de manejar la lógica de negocio para crear y consultar historias y anécdotas en MongoDB Atlas.
 * También cruzo las historias con sus respectivas reacciones persistidas y mantengo una colección de respaldo en memoria.
 */

import Story from '../models/Story.js';
import Reaction from '../models/Reaction.js';
import mongoose from 'mongoose';





// En este arreglo mantengo mis historias de reserva y el testimonio inicial del creador
const historiasBackup = [
  {
    _id: 'story-admin-matias-2026',
    author: 'Matías Torres (Administrador y Creador)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    titulo: 'Mi historia con la EM: El camino de nunca bajar los brazos',
    content: `Holaa, mis buenos deseos para quien esté leyendo este comentario ya sea paciente, familiar o simplemente alguien curioso :D

Soy el administrador y diseñador de la página. Convivo con esclerosis múltiple desde el año 2013 (tenía 15 años), hoy en día tengo 28...
La verdad que el diagnóstico temprano me ha ayudado mucho a contener los brotes y todo lo que esta enfermedad conlleva. Cambios de paradigmas tuvo toda mi vida desde el momento del diagnóstico, pero nunca bajé los brazos.

Mi sueño en aquella época (2013) era ser mecánico de automotores. Dado el diagnóstico temprano, me vi a la fuerza en la necesidad de alejarme de los motores, del TC Pista, TC 2000, F1, Superbike y demás. En ese momento en que manipulé un torno con una leve pérdida de equilibrio me llevé un susto. Doy las gracias a la escuela que nos capacitó bien para no tocar las máquinas en momentos en que no nos sentimos bien; eso me dio respeto y me vi obligado a cambiar de rumbos.

Me cambié a informática, me enamoré de lo que es la programación y me seguí capacitando bajo el sueño de ser desarrollador de software, que claramente no acaba simplemente con esto.

Todo fue cambiando. Por el 2013 internet era mucho más áspero y sin filtro, recuerdo desconocer lo que era la enfermedad y cometí el error de googlearlo y fue para peor jaja, muchos de los que ya llevan años sabrán a qué me refiero. Pero con contención profesional y buenas palabras de amigos, psicólogos y psiquiatras llegué a no bajar los brazos y no darme por vencido por más dolores que tenga en el cuerpo. ¡Disfruté mi adolescencia y coseché las mejores amistades que se pueden pedir!

Aprendí que amar a un amigo no es algo mal visto y que no solo se ama a quien duerme con vos, se ama y aprecia a quien estuvo siempre a tu lado. Todo es parte de crecer.

Dejo un mensaje que a mí me abrió la cabeza: "No podés pelear contra lo invencible, es mejor llevar a tu rival de la mano como si fuese una amistad", tirar contra ella solo nos perjudicará :)

Por eso siempre hay que hacer caso a los profesionales. Espero que les sirva este consejo y bueno, ¡que esta comunidad crezca, lleguemos a todos lados y que ningún otro paciente se sienta solo nunca más!`,
    rolAutor: 'paciente',
    createdAt: new Date().toISOString(),
    reacciones: [
      { uid: 'u1', userId: 'u1', tipo: 'fuerza', type: 'fuerza' },
      { uid: 'u2', userId: 'u2', tipo: 'abrazo', type: 'abrazo' },
      { uid: 'u3', userId: 'u3', tipo: 'gracias', type: 'gracias' }
    ]
  },
  {
    _id: 'story-em-101',
    author: 'María Celeste A.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    content: 'Al principio sentí mucha incertidumbre tras el diagnóstico de Esclerosis Múltiple, pero con el tratamiento adecuado y el apoyo de mi familia aprendí que la fortaleza se construye día a día.',
    imageUrl: '',
    rolAutor: 'paciente',
    titulo: 'Mi camino de superación tras 3 años del diagnóstico de EM',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    reacciones: [
      { uid: 'u1', userId: 'u1', tipo: 'fuerza', type: 'fuerza' },
      { uid: 'u2', userId: 'u2', tipo: 'abrazo', type: 'abrazo' }
    ]
  }
];





// En esta función me encargo de listar todas las historias guardadas en MongoDB Atlas junto a sus reacciones
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





// En esta función persisto una nueva historia o anécdota enviada por un usuario en MongoDB Atlas
export const crearHistoria = async (req, res) => {
  try {
    const { author, avatar, content, contenido, imageUrl, videoUrl, rolAutor, titulo, tipo } = req.body;

    const contenidoFinal = content || contenido || 'Testimonio de la comunidad';
    const autorFinal = author || req.body.autorNombre || 'Miembro Empáticos';
    const videoFinal = videoUrl || imageUrl || '';

    if (mongoose.connection.readyState === 1) {
      const nuevaHistoria = new Story({
        author: autorFinal,
        avatar: avatar || req.body.autorFoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        content: contenidoFinal,
        imageUrl: videoFinal,
        rolAutor: rolAutor || 'paciente',
        titulo: titulo || 'Historia de la comunidad'
      });

      const historiaGuardada = await nuevaHistoria.save();

      return res.status(201).json({
        ok: true,
        mensaje: 'Historia guardada exitosamente en MongoDB Atlas',
        data: {
          ...historiaGuardada.toObject(),
          tipo: tipo || 'historia',
          videoUrl: videoFinal,
          reacciones: []
        }
      });
    }

    // Fallback en memoria si la base de datos no está conectada
    const historiaMemoria = {
      _id: `story-${Date.now()}`,
      author: autorFinal,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      content: contenidoFinal,
      imageUrl: videoFinal,
      videoUrl: videoFinal,
      rolAutor: rolAutor || 'paciente',
      titulo: titulo || 'Historia de la comunidad',
      tipo: tipo || 'historia',
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
