import mongoose from 'mongoose';

// Esquema Mongoose especifico todos los campos necesarios para mis historias comunitarias
const storySchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: [true, 'El nombre del autor es obligatorio'],
      trim: true
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    },
    content: {
      type: String,
      required: [true, 'El contenido de la historia es obligatorio'],
      trim: true,
      minlength: [5, 'El contenido debe tener al menos 5 caracteres']
    },
    imageUrl: {
      type: String,
      default: ''
    },
    rolAutor: {
      type: String,
      enum: ['paciente', 'familiar', 'acompanante', 'profesional'],
      default: 'paciente'
    },
    titulo: {
      type: String,
      default: 'Historia de la comunidad'
    }
  },
  {
    timestamps: true
  }
);

// Acá compilo mi modelo Story para interactuar con la colección 'stories' de MongoDB Atlas
const Story = mongoose.model('Story', storySchema);

export default Story;
