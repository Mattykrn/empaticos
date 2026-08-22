// Modelo de Mongoose para la colección de Noticias e Informes
// En este archivo defino mi esquema de Mongoose para administrar noticias del sector de salud y contención emocional.

import mongoose from 'mongoose';

// En este bloque construyo el esquema principal de Noticias
const noticiaSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título de la noticia es un campo obligatorio'],
      trim: true,
      minlength: [5, 'El título de la noticia debe tener al menos 5 caracteres']
    },
    categoria: {
      type: String,
      required: [true, 'La categoría de la noticia es obligatoria'],
      trim: true
    },
    resumen: {
      type: String,
      required: [true, 'El resumen o bajada de la noticia es obligatorio'],
      trim: true,
      minlength: [10, 'El resumen debe tener al menos 10 caracteres']
    },
    imagen: {
      type: String,
      default: '',
      trim: true
    },
    autor: {
      type: String,
      required: [true, 'El nombre del autor o redactora es obligatorio'],
      trim: true
    }
  },
  {
    timestamps: true // Aquí habilito las marcas de tiempo automáticas createdAt y updatedAt
  }
);

// En esta línea exporto mi modelo Noticia para interactuar con la colección en MongoDB
const Noticia = mongoose.model('Noticia', noticiaSchema);
export default Noticia;
