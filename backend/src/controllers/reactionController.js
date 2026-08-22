import Reaction from '../models/Reaction.js';
import mongoose from 'mongoose';

// Memoria local de respaldo para reacciones cuando la BD no está conectada
const reaccionesMemoriaLocal = new Map();

// POST /api/reactions -> Registrar o alternar (toggle) de reacción en MongoDB Atlas
export const toggleReaccion = async (req, res) => {
  try {
    const { targetId, userId, uid, type, tipo } = req.body;

    const targetIdFinal = targetId;
    const userIdFinal = userId || uid || req.ip || 'usr-anonimo';
    const tipoFinal = type || tipo || 'fuerza';

    if (!targetIdFinal) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El parámetro targetId es obligatorio'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const reaccionExistente = await Reaction.findOne({
        targetId: targetIdFinal,
        userId: userIdFinal
      });

      if (reaccionExistente) {
        if (reaccionExistente.type === tipoFinal) {
          await Reaction.deleteOne({ _id: reaccionExistente._id });
        } else {
          reaccionExistente.type = tipoFinal;
          await reaccionExistente.save();
        }
      } else {
        await Reaction.create({
          targetId: targetIdFinal,
          userId: userIdFinal,
          type: tipoFinal
        });
      }

      const reaccionesActualizadas = await Reaction.find({ targetId: targetIdFinal });
      const conteo = reaccionesActualizadas.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {});

      return res.status(200).json({
        ok: true,
        mensaje: 'Reacción procesada y guardada en MongoDB Atlas',
        data: {
          targetId: targetIdFinal,
          total: reaccionesActualizadas.length,
          conteo,
          reacciones: reaccionesActualizadas.map(r => ({
            uid: r.userId,
            userId: r.userId,
            tipo: r.type,
            type: r.type
          }))
        }
      });
    }

    // Fallback local en memoria si MongoDB Atlas no está conectado
    let listaLocal = reaccionesMemoriaLocal.get(targetIdFinal) || [];
    const idx = listaLocal.findIndex(r => r.userId === userIdFinal);

    if (idx !== -1) {
      if (listaLocal[idx].type === tipoFinal) {
        listaLocal.splice(idx, 1);
      } else {
        listaLocal[idx].type = tipoFinal;
        listaLocal[idx].tipo = tipoFinal;
      }
    } else {
      listaLocal.push({ uid: userIdFinal, userId: userIdFinal, tipo: tipoFinal, type: tipoFinal });
    }
    reaccionesMemoriaLocal.set(targetIdFinal, listaLocal);

    const conteo = listaLocal.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({
      ok: true,
      mensaje: 'Reacción registrada (modo local)',
      data: {
        targetId: targetIdFinal,
        total: listaLocal.length,
        conteo,
        reacciones: listaLocal
      }
    });
  } catch (error) {
    console.error(`[Error toggleReaccion] ${error.message}`);
    return res.status(500).json({
      ok: false,
      mensaje: 'Falla al procesar la reacción',
      error: error.message
    });
  }
};

// GET /api/reactions/:targetId -> Obtener desglose y total de reacciones
export const obtenerReacciones = async (req, res) => {
  try {
    const { targetId } = req.params;

    if (mongoose.connection.readyState === 1) {
      const reacciones = await Reaction.find({ targetId });
      const conteo = reacciones.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {});

      return res.status(200).json({
        ok: true,
        data: {
          targetId,
          total: reacciones.length,
          conteo,
          reacciones: reacciones.map(r => ({
            uid: r.userId,
            userId: r.userId,
            tipo: r.type,
            type: r.type
          }))
        }
      });
    }

    const listaLocal = reaccionesMemoriaLocal.get(targetId) || [];
    const conteo = listaLocal.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({
      ok: true,
      data: {
        targetId,
        total: listaLocal.length,
        conteo,
        reacciones: listaLocal
      }
    });
  } catch (error) {
    return res.status(200).json({
      ok: true,
      data: {
        targetId: req.params.targetId,
        total: 0,
        conteo: {},
        reacciones: []
      }
    });
  }
};
