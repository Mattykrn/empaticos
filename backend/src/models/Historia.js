// Modelo de Mongoose para la colección de Historias y Testimonios
// En este archivo defino mi esquema de Mongoose para representar historias de vida, experiencias y testimonios en Empáticos.

import mongoose from 'mongoose';

// Aquí defino la estructura de los objetos de reacciones comunitarias
const reaccionSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: [true, 'El identificador de usuario (uid) es obligatorio en la reacción']
    },
    tipo: {
      type: String,
      required: [true, 'El tipo de reacción es obligatorio (ej. me_inspira, abrazo, apoyo)'],
      trim: true
    }
  },
  { _id: false }
);

// En este bloque construyo el esquema principal de la Historia
const historiaSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título de la historia es un campo obligatorio'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres']
    },
    contenido: {
      type: String,
      required: [true, 'El contenido o relato es obligatorio'],
      trim: true,
      minlength: [10, 'El contenido debe explicitar al menos 10 caracteres']
    },
    autorNombre: {
      type: String,
      default: 'Anónimo',
      trim: true
    },
    rolAutor: {
      type: String,
      required: [true, 'El rol del autor es un campo obligatorio'],
      enum: {
        values: ['paciente', 'familiar', 'acompanante'],
        message: '{VALUE} no es un rol válido. Debe ser "paciente", "familiar" o "acompanante"'
      }
    },
    reacciones: {
      type: [reaccionSchema],
      default: []
    },
    tipoPublicacion: {
      type: String,
      default: 'testimonio',
      trim: true
    }
  },
  {
    timestamps: true // Aquí activo los campos automáticos createdAt y updatedAt
  }
);

// En esta línea exporto mi modelo compilado para utilizarlo en los controladores
const Historia = mongoose.model('Historia', historiaSchema);
export default Historia;
