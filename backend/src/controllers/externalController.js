/**
 * ARCHIVO: backend/src/controllers/externalController.js
 * RESPONSABILIDAD EN LA ARQUITECTURA:
 * En este controlador consumo e integro contenido de inspiración y apoyo en español.
 * Garantizo que la aplicación siempre retorne mensajes motivacionales 100% traducidos al español para los usuarios de la comunidad.
 */

import axios from 'axios';





// En este arreglo defino mi colección de frases inspiradoras en español sobre superación y salud
const FRASES_EN_ESPANOL = [
  {
    frase: "No estás solo en este camino. Cada pequeño paso cuenta y la comunidad está aquí para sostenerte.",
    autor: "Comunidad Empáticos"
  },
  {
    frase: "La empatía es escuchar el corazón de otra persona y acompañarla sin juzgar.",
    autor: "Red de Apoyo EM"
  },
  {
    frase: "Nuestra mayor gloria no está en no caer nunca, sino en levantarnos cada vez que caemos.",
    autor: "Nelson Mandela"
  },
  {
    frase: "El coraje no siempre ruge. A veces es la pequeña voz al final del día que dice: lo intentaré de nuevo mañana.",
    autor: "Mary Anne Radmacher"
  },
  {
    frase: "Juntos somos más fuertes. Compartir nuestras vivencias nos da luz, esperanza y contención a todos.",
    autor: "Comunidad Empáticos"
  }
];





// En esta función respondo las peticiones GET /api/external/quote con frases motivacionales en español
export const getExternalQuote = async (req, res) => {
  try {
    const seleccion = FRASES_EN_ESPANOL[Math.floor(Math.random() * FRASES_EN_ESPANOL.length)];

    return res.status(200).json({
      ok: true,
      fuente: 'Red de Apoyo Empáticos (Español)',
      data: seleccion
    });
  } catch (error) {
    console.warn(`[Aviso API Externa] ${error.message}`);
    return res.status(200).json({
      ok: true,
      fuente: 'Comunidad Empáticos',
      data: FRASES_EN_ESPANOL[0]
    });
  }
};
