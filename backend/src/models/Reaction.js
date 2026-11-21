import mongoose from 'mongoose';

// Esquema Mongoose para registrar cada reacción de la comunidad
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

// Índice compuesto único para permitir reaccionar o des-reaccionar sin duplicar entradas
reactionSchema.index({ targetId: 1, userId: 1 }, { unique: true });

const Reaction = mongoose.models.Reaction || mongoose.model('Reaction', reactionSchema);

export default Reaction;
