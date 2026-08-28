import mongoose from 'mongoose';

// Creo un sub-esquema para mis comentarios persistentes
const comentarioSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    autorNombre: {
      type: String,
      required: true
    },
    autorFoto: {
      type: String,
      default: ''
    },
    rolAutor: {
      type: String,
      default: 'paciente'
    },
    texto: {
      type: String,
      required: [true, 'El texto del comentario no puede estar vacío'],
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Creo un sub-esquema para registrar qué usuario reaccionó y con qué tipo de reacción
const reaccionSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    tipo: {
      type: String,
      enum: ['fuerza', 'abrazo', 'gracias', 'corazon'],
      required: true
    }
  },
  { _id: false }
);

// Defino mi esquema principal de historias / publicaciones
const publicacionSchema = new mongoose.Schema(
  {
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'Toda publicación debe pertenecer a un usuario registrado']
    },
    autorNombre: {
      type: String,
      required: true
    },
    autorFoto: {
      type: String,
      default: ''
    },
    rolAutor: {
      type: String,
      enum: ['paciente', 'familiar', 'acompanante', 'profesional'],
      required: true
    },
    titulo: {
      type: String,
      required: [true, 'El título de la historia es obligatorio'],
      trim: true
    },
    contenido: {
      type: String,
      required: [true, 'El contenido de la historia es obligatorio'],
      trim: true
    },
    tipoPublicacion: {
      type: String,
      enum: ['experiencia', 'mensaje_apoyo', 'debate'],
      default: 'experiencia'
    },
    tipoMultimedia: {
      type: String,
      enum: ['texto', 'video', 'audio'],
      default: 'texto'
    },
    mediaUrl: {
      type: String,
      default: ''
    },
    // Arrays de reacciones y comentarios
    reacciones: [reaccionSchema],
    comentarios: [comentarioSchema]
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Publicacion', publicacionSchema);
