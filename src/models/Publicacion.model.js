import mongoose from 'mongoose';

// En este esquema defino la estructura de publicaciones con soporte multimedia y reacciones persistentes por usuario
const publicacionSchema = new mongoose.Schema(
  {
    // Referencia al ID del usuario en MongoDB que creó la publicación
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'La publicación debe estar vinculada a un usuario autenticado']
    },
    // Desnormalización de nombre y rol del autor para acelerar lecturas sin necesidad de populate pesado
    autorNombre: {
      type: String,
      required: [true, 'El nombre del autor es obligatorio']
    },
    rolAutor: {
      type: String,
      enum: ['paciente', 'familiar', 'acompanante', 'profesional'],
      default: 'paciente'
    },
    // Título y contenido escrito de la historia o mensaje de aliento
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres']
    },
    contenido: {
      type: String,
      required: [true, 'El contenido es obligatorio'],
      trim: true,
      minlength: [5, 'El contenido debe incluir al menos 5 caracteres']
    },
    // Clasificación del tipo de formato multimedia enviado
    tipoContenido: {
      type: String,
      enum: ['texto', 'video', 'audio'],
      default: 'texto'
    },
    // Enlace o URL directa hacia el contenido audiovisual (YouTube, Vimeo, Cloudinary, audio MP3)
    mediaUrl: {
      type: String,
      default: '',
      trim: true
    },
    // Tipo o categoría de la publicación
    tipo: {
      type: String,
      enum: ['historia', 'anecdotas', 'aliento', 'testimonio'],
      default: 'historia'
    },
    categoria: {
      type: String,
      default: 'general'
    },
    // Array de reacciones persistentes enviadas por usuarios autenticados
    reacciones: [
      {
        usuarioId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Usuario',
          required: true
        },
        tipo: {
          type: String,
          enum: ['fuerza', 'abrazo', 'gracias'],
          required: true
        }
      }
    ],
    // Estado de moderación del contenido
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

const Publicacion = mongoose.model('Publicacion', publicacionSchema);

export default Publicacion;
