/**
 * ARCHIVO: backend/src/models/Reaction.js
 * RESPONSABILIDAD EN LA ARQUITECTURA:
 * En este modelo Mongoose gestiono las reacciones comunitarias (fuerza, abrazo, gracias, apoyo).
 * Creo un índice compuesto único { targetId: 1, userId: 1 } para lograr un toggle inteligente que evita duplicados por usuario.
 */

import mongoose from 'mongoose';





// En este esquema Mongoose defino los campos para registrar cada reacción de la comunidad
const reactionSchema = new mongoose.Schema(
  {
    targetId: {
      type: String,
      required: [true, 'El targetId (ID del post o historia) es obligatorio'],
      index: true
    },
    userId: {
      type: String,
      required: [true, 'El userId o IP del usuario es obligatorio'],
      index: true
    },
    type: {
      type: String,
      required: [true, 'El tipo de reacción es obligatorio'],
      enum: ['like', 'love', 'care', 'support', 'fuerza', 'abrazo', 'gracias'],
      default: 'fuerza'
    }
  },
  {
    timestamps: true
  }
);





// Acá establezco mi índice compuesto único para permitir reaccionar o des-reaccionar sin duplicar entradas
reactionSchema.index({ targetId: 1, userId: 1 }, { unique: true });





// Compilo y exporto mi modelo Reaction para operar sobre MongoDB Atlas
const Reaction = mongoose.model('Reaction', reactionSchema);

export default Reaction;
