import mongoose from 'mongoose';

// En este modelo defino la estructura Mongoose para almacenar historias comunitarias en MongoDB Atlas
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

const Story = mongoose.model('Story', storySchema);
export default Story;
