import mongoose from 'mongoose';

// En este archivo defino el esquema Mongoose de mi colección de publicaciones para la plataforma "Empáticos".
// Diseñé este esquema para almacenar las historias, vivencias y mensajes de contención en la comunidad,
// incorporando el campo status ('pending' por defecto) para permitir la evaluación y moderación desde el panel de administración.

const publicacionSchema = new mongoose.Schema(
  {
    // Acá establezco el título de la publicación con validación de obligatoriedad y límites de caracteres
    titulo: {
      type: String,
      required: [true, 'El título es un campo obligatorio para la publicación'],
      trim: true,
      minlength: [3, 'El título debe contener al menos 3 caracteres'],
      maxlength: [150, 'El título no puede superar los 150 caracteres']
    },

    // En este campo guardo el contenido o historia principal compartida por el usuario
    contenido: {
      type: String,
      required: [true, 'El contenido o cuerpo del mensaje no puede estar vacío'],
      trim: true,
      minlength: [5, 'El contenido debe ser expresivo y tener al menos 5 caracteres']
    },

    // Defino una enumeración obligatoria para clasificar la intención del mensaje en mi plataforma
    tipo: {
      type: String,
      required: [true, 'Debes especificar el tipo de publicación'],
      enum: {
        values: ['testimonio', 'anecdota', 'aliento', 'debate', 'historia', 'video', 'diagnostico', 'galeria', 'audio'],
        message: 'El tipo seleccionado no corresponde a una categoría válida'
      },
      default: 'testimonio'
    },

    // Acá registro cuál es la relación del usuario con la comunidad de salud para dar contexto a su vivencia
    rolAutor: {
      type: String,
      required: [true, 'El rol del autor es obligatorio'],
      enum: {
        values: ['paciente', 'familiar', 'profesional', 'compañero'],
        message: 'El rol debe ser: paciente, familiar, profesional o compañero'
      },
      default: 'paciente'
    },

    // Organizo la publicación por categoría temática con un valor por defecto si el usuario no especifica una
    categoria: {
      type: String,
      required: true,
      default: 'general',
      trim: true
    },

    // Registro el nombre o apodo que el usuario desea mostrar; si prefiere preservar su identidad asigno "Anónimo"
    autorNombre: {
      type: String,
      default: 'Anónimo',
      trim: true
    },

    // Estado de moderación: las publicaciones inician en 'pending' hasta ser aprobadas en el panel /admin
    status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending'
    },

    // Almaceno la fecha y hora exacta en que creé la publicación en mi base de datos
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    // Habilito timestamps automáticos por si en el futuro necesito consultar la última actualización
    timestamps: true
  }
);

// Acá creo y exporto mi modelo compilado a partir del esquema que definí
const Publicacion = mongoose.model('Publicacion', publicacionSchema);

export default Publicacion;





