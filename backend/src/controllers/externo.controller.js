// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import axios from 'axios';





// ==========================================
// CONTROLADOR: CONSUMO DE API EXTERNA CON AXIOS
// ==========================================
// En este controlador le pego a una API pública para traer una frase motivacional,
// proceso la respuesta y la devuelvo limpia al cliente.
export const obtenerFraseExterna = async (req, res) => {
  try {
    // Petición HTTP GET a la API externa de frases usando axios
    const respuesta = await axios.get('https://dummyjson.com/quotes/random', {
      timeout: 4000,
      headers: {
        'Accept': 'application/json'
      }
    });

    const { quote, author } = respuesta.data;

    // Acomodo la respuesta con los campos que necesita mi aplicación
    const fraseProcesada = {
      texto: quote || 'Cada paso que das en tu proceso cuenta, nunca estás solo.',
      frase: quote || 'Cada paso que das en tu proceso cuenta, nunca estás solo.',
      quote: quote || 'Cada paso que das en tu proceso cuenta, nunca estás solo.',
      autor: author || 'Comunidad Empáticos',
      author: author || 'Comunidad Empáticos',
      categoria: 'Inspiración y Apoyo Emocional',
      origen: 'API REST Pública Externa (DummyJSON)',
      procesadoPor: 'Backend Empáticos',
      fecha: new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    return res.status(200).json({
      ok: true,
      success: true,
      mensaje: 'Frase inspiradora obtenida y procesada con éxito desde la API externa',
      data: fraseProcesada,
      frase: fraseProcesada
    });
  } catch (error) {
    console.warn(`⚠️ [API Externa] No se pudo consultar la API (${error.message}). Uso frase de respaldo.`);

    // Si la API externa se cae o no hay internet, entrego una frase local para que no falle
    const fraseRespaldo = {
      texto: 'No estás solo en este camino. La empatía nos une y cada pequeño avance cuenta.',
      frase: 'No estás solo en este camino. La empatía nos une y cada pequeño avance cuenta.',
      quote: 'No estás solo en este camino. La empatía nos une y cada pequeño avance cuenta.',
      autor: 'Comunidad Empáticos',
      author: 'Comunidad Empáticos',
      categoria: 'Contención Emocional Local',
      origen: 'Respaldo Interno Empáticos',
      procesadoPor: 'Backend Empáticos',
      fecha: new Date().toLocaleDateString('es-ES')
    };

    return res.status(200).json({
      ok: true,
      success: true,
      mensaje: 'Frase inspiradora de respaldo (modo local por contingencia)',
      data: fraseRespaldo,
      frase: fraseRespaldo
    });
  }
};





// ==========================================
// EXPORTACION DEL CONTROLADOR
// ==========================================
export default {
  obtenerFraseExterna
};
