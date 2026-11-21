import mongoose from 'mongoose';
import Reaction from '../models/Reaction.js';
import Publicacion from '../models/Publicacion.model.js';
import { normalizarReacciones } from './publicacion.controller.js';
import {
  cargarPublicacionesLocales,
  guardarPublicacionesLocales,
  cargarReaccionesExtra,
  guardarReaccionesExtra
} from '../data/localStore.js';

const contarReacciones = (lista) =>
  lista.reduce((acc, r) => {
    const clave = r.tipo || r.type || 'fuerza';
    acc[clave] = (acc[clave] || 0) + 1;
    return acc;
  }, {});

// Ejecuto el registro o toggle de reacción enviado mediante POST /api/reactions
export const toggleReaccion = async (req, res) => {
  try {
    const { targetId, userId, uid, type, tipo } = req.body;

    const targetIdFinal = String(targetId || '').trim();
    const userIdFinal = String(userId || uid || req.ip || 'usr-anonimo');
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
      let listaFinal = reaccionesActualizadas.map((r) => ({
        uid: r.userId,
        userId: r.userId,
        usuario: r.userId,
        tipo: r.type,
        type: r.type
      }));

      // Sincronizo también dentro del documento Publicacion si existe, manteniendo reacciones previas (semilla)
      if (mongoose.Types.ObjectId.isValid(targetIdFinal)) {
        const pub = await Publicacion.findById(targetIdFinal);
        if (pub) {
          const base = normalizarReacciones(pub.reacciones).filter((r) => r.uid !== userIdFinal);
          const actualUsuario = listaFinal.find((r) => r.uid === userIdFinal);
          listaFinal = normalizarReacciones(actualUsuario ? [...base, actualUsuario] : base);
          pub.reacciones = listaFinal;
          await pub.save();
        }
      }

      return res.status(200).json({
        ok: true,
        mensaje: 'Reacción procesada y guardada en MongoDB Atlas',
        data: {
          targetId: targetIdFinal,
          total: listaFinal.length,
          conteo: contarReacciones(listaFinal),
          reacciones: listaFinal
        }
      });
    }

    // Modo local persistente: si corresponde a una publicación guardada, actualizo directamente en publicaciones.json
    const locales = cargarPublicacionesLocales();
    const pubIndex = locales.findIndex((p) => String(p._id) === targetIdFinal);

    if (pubIndex !== -1) {
      const listaLocal = normalizarReacciones(locales[pubIndex].reacciones);
      const idx = listaLocal.findIndex((r) => r.uid === userIdFinal);

      if (idx !== -1) {
        if (listaLocal[idx].tipo === tipoFinal) {
          listaLocal.splice(idx, 1);
        } else {
          listaLocal[idx] = { uid: userIdFinal, userId: userIdFinal, usuario: userIdFinal, tipo: tipoFinal, type: tipoFinal };
        }
      } else {
        listaLocal.push({ uid: userIdFinal, userId: userIdFinal, usuario: userIdFinal, tipo: tipoFinal, type: tipoFinal });
      }

      locales[pubIndex].reacciones = listaLocal;
      guardarPublicacionesLocales(locales);

      return res.status(200).json({
        ok: true,
        mensaje: 'Reacción registrada (modo local persistente)',
        data: {
          targetId: targetIdFinal,
          total: listaLocal.length,
          conteo: contarReacciones(listaLocal),
          reacciones: listaLocal
        }
      });
    }

    // Fallback para targetIds genéricos no asociados a publicaciones
    const mapaExtra = cargarReaccionesExtra();
    const listaExtra = normalizarReacciones(mapaExtra.get(targetIdFinal) || []);
    const idx = listaExtra.findIndex((r) => r.uid === userIdFinal);

    if (idx !== -1) {
      if (listaExtra[idx].tipo === tipoFinal) {
        listaExtra.splice(idx, 1);
      } else {
        listaExtra[idx] = { uid: userIdFinal, userId: userIdFinal, usuario: userIdFinal, tipo: tipoFinal, type: tipoFinal };
      }
    } else {
      listaExtra.push({ uid: userIdFinal, userId: userIdFinal, usuario: userIdFinal, tipo: tipoFinal, type: tipoFinal });
    }

    mapaExtra.set(targetIdFinal, listaExtra);
    guardarReaccionesExtra(mapaExtra);

    return res.status(200).json({
      ok: true,
      mensaje: 'Reacción registrada (modo local persistente)',
      data: {
        targetId: targetIdFinal,
        total: listaExtra.length,
        conteo: contarReacciones(listaExtra),
        reacciones: listaExtra
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

// Consulto el desglose de reacciones para un post o historia específico en GET /api/reactions/:targetId
export const obtenerReacciones = async (req, res) => {
  try {
    const { targetId } = req.params;

    if (mongoose.connection.readyState === 1) {
      const reacciones = await Reaction.find({ targetId });
      let lista = reacciones.map((r) => ({
        uid: r.userId,
        userId: r.userId,
        usuario: r.userId,
        tipo: r.type,
        type: r.type
      }));

      if (mongoose.Types.ObjectId.isValid(targetId)) {
        const pub = await Publicacion.findById(targetId);
        if (pub && Array.isArray(pub.reacciones)) {
          lista = normalizarReacciones([...pub.reacciones, ...lista]);
        }
      }

      return res.status(200).json({
        ok: true,
        data: {
          targetId,
          total: lista.length,
          conteo: contarReacciones(lista),
          reacciones: lista
        }
      });
    }

    const locales = cargarPublicacionesLocales();
    const pub = locales.find((p) => String(p._id) === String(targetId));
    const listaLocal = pub
      ? normalizarReacciones(pub.reacciones)
      : normalizarReacciones(cargarReaccionesExtra().get(targetId) || []);

    return res.status(200).json({
      ok: true,
      data: {
        targetId,
        total: listaLocal.length,
        conteo: contarReacciones(listaLocal),
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
