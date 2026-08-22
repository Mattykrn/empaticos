import axios from 'axios';

/**
 * Controlador de API Externa.
 * GET /api/external/quote
 * Consume una API pública mediante Axios para traer frases inspiradoras y retorna datos formateados.
 */
export const getExternalQuote = async (req, res) => {
  try {
    const response = await axios.get('https://zenquotes.io/api/random', { timeout: 3500 });
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      return res.status(200).json({
        ok: true,
        fuente: 'ZenQuotes API Pública',
        data: {
          frase: response.data[0].q,
          autor: response.data[0].a
        }
      });
    }

    throw new Error('Respuesta vacía o formato inesperado');
  } catch (error) {
    console.warn(`[Aviso API Externa] ${error.message}. Entregando mensaje inspirador de respaldo...`);
    return res.status(200).json({
      ok: true,
      fuente: 'Comunidad Empáticos (Respaldo)',
      data: {
        frase: 'No estás solo en este camino. Cada pequeño paso cuenta y la comunidad está aquí para sostenerte.',
        autor: 'Comunidad Empáticos'
      }
    });
  }
};
