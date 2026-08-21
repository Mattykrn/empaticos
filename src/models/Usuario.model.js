import mongoose from 'mongoose';

// En este esquema defino la estructura de datos que utilizaré para almacenar a cada usuario de la comunidad Empáticos en MongoDB
const usuarioSchema = new mongoose.Schema(
  {
    // Identificador único otorgado por Google OAuth / Firebase Auth para vincular la cuenta
    googleId: {
      type: String,
      required: [true, 'El googleId es obligatorio para registrar un usuario'],
      unique: true,
      trim: true
    },
    // Nombre completo del usuario extraído directamente de su perfil de Google
    nombre: {
      type: String,
      required: [true, 'El nombre del usuario es obligatorio'],
      trim: true
    },
    // Correo electrónico principal asociado a la cuenta de Google
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true
    },
    // URL del avatar o foto de perfil del usuario provista por Google
    fotoUrl: {
      type: String,
      default: ''
    },
    // Rol del usuario dentro de la comunidad Empáticos para personalizar su experiencia
    rol: {
      type: String,
      enum: ['paciente', 'familiar', 'acompanante', 'profesional'],
      default: 'paciente'
    },
    // Breve descripción personal o biografía que el usuario comparte con la comunidad
    biografia: {
      type: String,
      default: '',
      trim: true
    },
    // Fecha y hora exactas en las que el usuario se registró por primera vez en la plataforma
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    // Desactivo el campo de versión __v para mantener limpia la respuesta JSON
    versionKey: false
  }
);

// Aquí compilo mi esquema y exporto el modelo Mongoose 'Usuario'
const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;
