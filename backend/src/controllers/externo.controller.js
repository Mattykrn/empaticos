// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import axios from 'axios';

// Pool de frases cálidas en español pensadas para la comunidad de EM (rotación cuando la API externa no responde)
const FRASES_COMUNIDAD_ES = [
  {
    frase: 'No estás solo en este camino. La empatía nos une y cada pequeño avance cuenta.',
    autor: 'Comunidad Empáticos'
  },
  {
    frase: 'Descansar también es avanzar. Escuchar a tu cuerpo es un acto de valentía y cuidado.',
    autor: 'Red de Apoyo Empáticos'
  },
  {
    frase: 'No podés pelear contra lo invencible; es mejor llevar a tu rival de la mano y seguir construyendo tu vida.',
    autor: 'Matías Torres — Empáticos'
  },
  {
    frase: 'Un día difícil no borra todo lo que ya superaste. Respirá hondo y seguí a tu propio ritmo.',
    autor: 'Comunidad Empáticos'
  },
  {
    frase: 'Pedir ayuda no es debilidad: es abrir la puerta para que otros caminen con vos.',
    autor: 'Familias y Acompañantes EM'
  },
  {
    frase: 'La fortaleza no siempre ruge; a veces es la voz tranquila que dice: mañana lo intento de nuevo.',
    autor: 'Mary Anne Radmacher'
  },
  {
    frase: 'Compartir tu historia puede ser exactamente el abrazo que otra persona necesitaba leer hoy.',
    autor: 'Comunidad Empáticos'
  },
  {
    frase: 'El buen humor y una buena charla también son medicina para el alma.',
    autor: 'Anecdotario Empáticos'
  }
];

let ultimoIndiceRespaldo = -1;

const elegirFraseRespaldo = (excluirTexto = '') => {
  const disponibles = FRASES_COMUNIDAD_ES.filter((item) => item.frase !== excluirTexto);
  const lista = disponibles.length > 0 ? disponibles : FRASES_COMUNIDAD_ES;
  ultimoIndiceRespaldo = (ultimoIndiceRespaldo + 1) % lista.length;
  return lista[ultimoIndiceRespaldo];
};

// ==========================================
// CONTROLADOR: CONSUMO DE API EXTERNA CON AXIOS
// ==========================================
export const obtenerFraseExterna = async (req, res) => {
  const excluir = typeof req.query.excluir === 'string' ? req.query.excluir : '';

  try {
    const respuesta = await axios.get('https://dummyjson.com/quotes/random', {
      timeout: 3500,
      headers: {
        Accept: 'application/json'
      }
    });

    const { quote, author } = respuesta.data || {};
    if (!quote) throw new Error('Respuesta vacía desde DummyJSON');

    const fraseProcesada = {
      texto: quote,
      frase: quote,
      quote,
      autor: author || 'Comunidad Empáticos',
      author: author || 'Comunidad Empáticos',
      categoria: 'Inspiración y Apoyo Emocional',
      origen: 'API REST Pública Externa (DummyJSON)',
      procesadoPor: 'Backend Empáticos',
      fecha: new Date().toLocaleDateString('es-AR', {
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
    console.warn(`⚠️ [API Externa] No se pudo consultar la API (${error.message}). Uso frase rotativa local.`);

    const elegida = elegirFraseRespaldo(excluir);
    const fraseRespaldo = {
      texto: elegida.frase,
      frase: elegida.frase,
      quote: elegida.frase,
      autor: elegida.autor,
      author: elegida.autor,
      categoria: 'Contención Emocional Local',
      origen: 'Respaldo Interno Empáticos',
      procesadoPor: 'Backend Empáticos',
      fecha: new Date().toLocaleDateString('es-AR')
    };

    return res.status(200).json({
      ok: true,
      success: true,
      mensaje: 'Frase inspiradora de respaldo (modo local)',
      data: fraseRespaldo,
      frase: fraseRespaldo
    });
  }
};

export default {
  obtenerFraseExterna
};
