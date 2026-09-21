// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import mongoose from 'mongoose';





// ==========================================
// SUBESQUEMAS AUXILIARES (REACCIONES Y COMENTARIOS)
// ==========================================
// Acá defino un subesquema chiquito para guardar las reacciones de los usuarios
const reaccionSubSchema = new mongoose.Schema(
  {
    usuario: {
      type: String,
      default: 'anonimo'
    },
    tipo: {
      type: String,
      enum: ['fuerza', 'abrazo', 'gracias', 'corazon', 'me_inspira', 'apoyo'],
      default: 'fuerza'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

// Y este subesquema es para los comentarios que la gente deja en cada publicación
const comentarioSubSchema = new mongoose.Schema(
  {
    autorNombre: {
      type: String,
      default: 'Compañero Empático',
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
// Este es el modelo principal de mi proyecto para publicaciones y testimonios comunitarios
const publicacionSchema = new mongoose.Schema(
  {
    // Título obligatorio de la publicación
    titulo: {
      type: String,
      required: [true, 'El título de la publicación es obligatorio'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres']
    },

    // Contenido o relato de la historia (obligatorio)
    contenido: {
      type: String,
      required: [true, 'El contenido de la publicación es obligatorio'],
      trim: true,
      minlength: [5, 'El contenido debe tener al menos 5 caracteres']
    },

    // Nombre del autor que publica
    autorNombre: {
      type: String,
      trim: true,
      default: 'Anónimo'
    },

    // Rol del autor dentro de la plataforma (con enum de opciones válidas)
    rolAutor: {
      type: String,
      enum: {
        values: ['paciente', 'familiar', 'acompanante', 'profesional', 'voluntario'],
        message: '{VALUE} no es un rol válido'
      },
      default: 'paciente'
    },

    // Categoría temática de la publicación
    categoria: {
      type: String,
      trim: true,
      default: 'apoyo_emocional'
    },

    // Tipo de relato
    tipo: {
      type: String,
      trim: true,
      default: 'testimonio'
    },

    tipoPublicacion: {
      type: String,
      default: 'experiencia',
      trim: true
    },

    // Estado para moderación
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

    // Conteo de votos útiles recibidos
    votosUtiles: {
      type: Number,
      default: 0,
      min: [0, 'Los votos no pueden ser negativos']
    },

    // Opción para publicar de forma anónima
    esAnonimo: {
      type: Boolean,
      default: false
    },

    // Etiquetas descriptivas
    etiquetas: {
      type: [String],
      default: []
    },

    // Arreglos con los subdocumentos definidos arriba
    reacciones: [reaccionSubSchema],
    comentarios: [comentarioSubSchema]
  },
  {
    // Activo timestamps para que mongoose agregue createdAt y updatedAt solo
    timestamps: true
  }
);





// ==========================================
// COMPILACION Y EXPORTACION DEL MODELO
// ==========================================
const Publicacion = mongoose.models.Publicacion || mongoose.model('Publicacion', publicacionSchema);
export default Publicacion;
