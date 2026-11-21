// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import mongoose from 'mongoose';

// ==========================================
// SUBESQUEMAS AUXILIARES (REACCIONES Y COMENTARIOS)
// ==========================================
const reaccionSubSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      default: 'anonimo'
    },
    userId: {
      type: String,
      default: 'anonimo'
    },
    usuario: {
      type: String,
      default: 'anonimo'
    },
    tipo: {
      type: String,
      enum: ['fuerza', 'abrazo', 'gracias', 'corazon', 'me_inspira', 'apoyo', 'like', 'love', 'care', 'support'],
      default: 'fuerza'
    },
    type: {
      type: String,
      enum: ['fuerza', 'abrazo', 'gracias', 'corazon', 'me_inspira', 'apoyo', 'like', 'love', 'care', 'support'],
      default: 'fuerza'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const comentarioSubSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      default: ''
    },
    autorNombre: {
      type: String,
      default: 'Compañero Empático',
      trim: true
    },
    autorFoto: {
      type: String,
      default: '',
      trim: true
    },
    rolAutor: {
      type: String,
      default: 'paciente'
    },
    texto: {
      type: String,
      required: [true, 'El comentario no puede estar vacío'],
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

// ==========================================
// ESQUEMA PROPIO DE MONGOOSE (PUBLICACION)
// ==========================================
const publicacionSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título de la publicación es obligatorio'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres']
    },

    contenido: {
      type: String,
      required: [true, 'El contenido de la publicación es obligatorio'],
      trim: true,
      minlength: [5, 'El contenido debe tener al menos 5 caracteres']
    },

    autorNombre: {
      type: String,
      trim: true,
      default: 'Anónimo'
    },

    autorUid: {
      type: String,
      trim: true,
      default: ''
    },

    avatar: {
      type: String,
      trim: true,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    },

    autorFoto: {
      type: String,
      trim: true,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    },

    rolAutor: {
      type: String,
      enum: {
        values: ['paciente', 'familiar', 'acompanante', 'profesional', 'voluntario'],
        message: '{VALUE} no es un rol válido'
      },
      default: 'paciente'
    },

    categoria: {
      type: String,
      trim: true,
      default: 'apoyo_emocional'
    },

    tipo: {
      type: String,
      trim: true,
      default: 'historia'
    },

    tipoPublicacion: {
      type: String,
      default: 'experiencia',
      trim: true
    },

    videoUrl: {
      type: String,
      trim: true,
      default: ''
    },

    imageUrl: {
      type: String,
      trim: true,
      default: ''
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'archivado'],
      default: 'approved'
    },

    estado: {
      type: String,
      enum: ['pendiente', 'aprobado', 'archivado'],
      default: 'aprobado'
    },

    votosUtiles: {
      type: Number,
      default: 0,
      min: [0, 'Los votos no pueden ser negativos']
    },

    esAnonimo: {
      type: Boolean,
      default: false
    },

    etiquetas: {
      type: [String],
      default: []
    },

    reacciones: [reaccionSubSchema],
    comentarios: [comentarioSubSchema]
  },
  {
    timestamps: true
  }
);

// ==========================================
// COMPILACION Y EXPORTACION DEL MODELO
// ==========================================
const Publicacion = mongoose.models.Publicacion || mongoose.model('Publicacion', publicacionSchema);
export default Publicacion;
