import mongoose from 'mongoose';

/**
 * Esquema de Mongoose para Publicaciones de la plataforma "Empáticos".
 * Representa publicaciones de apoyo emocional, contención, recursos y testimonios comunitarios.
 */
const publicationSchema = new mongoose.Schema(
  {
    // Campo 1: String con validaciones required, trim y minlength
    titulo: {
      type: String,
      required: [true, 'El título de la publicación es obligatorio'],
      trim: true,
      minlength: [5, 'El título debe contener al menos 5 caracteres']
    },

    // Campo 2: String con validación required y minlength
    contenido: {
      type: String,
      required: [true, 'El contenido de la publicación es obligatorio'],
      trim: true,
      minlength: [10, 'El contenido debe tener una extensión mínima de 10 caracteres']
    },

    // Campo 3: Enum (String) con validación de opciones permitidas y default
    categoria: {
      type: String,
      required: [true, 'La categoría es un campo obligatorio'],
      enum: {
        values: [
          'salud_mental',
          'apoyo_emocional',
          'testimonios',
          'voluntariado',
          'recursos_utiles'
        ],
        message: '{VALUE} no es una categoría válida'
      },
      default: 'apoyo_emocional'
    },

    // Campo 4: Number con validación min y default
    votosUtiles: {
      type: Number,
      default: 0,
      min: [0, 'El número de votos útiles no puede ser negativo']
    },

    // Campo 5: Boolean con valor por defecto
    esAnonimo: {
      type: Boolean,
      default: false
    },

    // Campo 6: Date para fechas de actividades o reuniones de apoyo
    fechaEvento: {
      type: Date,
      default: null
    },

    // Campo 7: Array de cadenas de texto para etiquetas descriptivas
    etiquetas: {
      type: [String],
      default: []
    },

    // Campo 8: Enum para el estado de moderación de la publicación
    estado: {
      type: String,
      enum: ['pendiente', 'aprobado', 'archivado'],
      default: 'aprobado'
    }
  },
  {
    // Opción para generar automáticamente marcas de tiempo (createdAt, updatedAt)
    timestamps: true
  }
);

// Compilación del modelo Mongoose listo para ser consumido por los controladores
const Publication = mongoose.model('Publication', publicationSchema);

export default Publication;
