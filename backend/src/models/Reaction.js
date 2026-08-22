import mongoose from 'mongoose';

// En este modelo defino la estructura para persistir reacciones con un índice único { targetId: 1, userId: 1 }
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

// Creo un índice único compuesto para permitir el toggle inteligente de reacciones por usuario y publicación
reactionSchema.index({ targetId: 1, userId: 1 }, { unique: true });

const Reaction = mongoose.model('Reaction', reactionSchema);
export default Reaction;
