import axios from 'axios';

// Consumo una API externa pública para traer una frase inspiradora del día
export const obtenerFraseDelDia = async (req, res) => {
  try {
    // Intento pegarle a la API pública de ZenQuotes
    const respuesta = await axios.get('https://zenquotes.io/api/random', { timeout: 4000 });
    
    if (respuesta.data && respuesta.data.length > 0) {
      return res.status(200).json({
        success: true,
        data: {
          frase: respuesta.data[0].q,
          autor: respuesta.data[0].a
        }
      });
    }

    throw new Error('Estructura inesperada en la API externa');
  } catch (error) {
    // Si la API externa falla o tarda mucho, tengo un fallback positivo para que mi app nunca quede vacía
    return res.status(200).json({
      success: true,
      data: {
        frase: "No estás solo en este camino. Cada pequeño paso cuenta y la comunidad está aquí para sostenerte.",
        autor: "Comunidad Empáticos"
      }
    });
  }
};
