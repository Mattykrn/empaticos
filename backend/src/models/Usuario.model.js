import mongoose from 'mongoose';

// Defino el esquema de mi usuario registrado para asociar sus publicaciones, reacciones y comentarios
const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de usuario es obligatorio'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      default: null // Si se registra con Google este campo puede ser nulo
    },
    googleId: {
      type: String,
      default: null
    },
    fotoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    },
    rol: {
      type: String,
      enum: ['paciente', 'familiar', 'acompanante', 'profesional'],
      default: 'paciente'
    }
  },
  {
    timestamps: true
  }
);

// Exporto mi modelo para utilizarlo en mis servicios de autenticación y relaciones
export default mongoose.model('Usuario', usuarioSchema);
