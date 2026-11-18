import Reaction from '../models/Reaction.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REACCIONES_FILE = path.join(__dirname, '../data/reacciones.json');

// Helper para cargar reacciones desde archivo local o inicializar Map vacío
const cargarReaccionesLocales = () => {
  if (fs.existsSync(REACCIONES_FILE)) {
    try {
      const data = fs.readFileSync(REACCIONES_FILE, 'utf-8');
      const json = JSON.parse(data);
      return new Map(Object.entries(json));
    } catch (e) {
      return new Map();
    }
  }
  return new Map();
};

const guardarReaccionesLocales = (mapa) => {
  const obj = Object.fromEntries(mapa);
  fs.writeFileSync(REACCIONES_FILE, JSON.stringify(obj, null, 2), 'utf-8');
};

// Map almaceno las reacciones de contingencia si la base de datos se desconecta temporalmente
let reaccionesMemoriaLocal = cargarReaccionesLocales();

// Ejecuto el registro o toggle de reacción enviado mediante POST /api/reactions
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
    reaccionesMemoriaLocal = cargarReaccionesLocales(); // Asegurar tener los últimos datos
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
    guardarReaccionesLocales(reaccionesMemoriaLocal); // Guardar cambios

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

// Consulto el desglose de reacciones para un post o historia específico en GET /api/reactions/:targetId
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

    reaccionesMemoriaLocal = cargarReaccionesLocales(); // Asegurar tener los últimos datos
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
