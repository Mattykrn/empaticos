import axios from 'axios';

// Colección de frases inspiradoras en español sobre superación, salud y apoyo comunitario
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

/**
 * GET /api/external/quote
 * Entrega mensajes inspiradores 100% en español para la comunidad.
 */
export const getExternalQuote = async (req, res) => {
  try {
    // Selección aleatoria de la colección en español
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
