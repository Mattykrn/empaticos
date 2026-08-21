import axios from 'axios';

// En este servicio me encargo de consumir la API pública externa de ZenQuotes mediante axios.
// Extraigo frases motivacionales e inspiradoras para inyectar mensajes de aliento en la comunidad "Empáticos".

class FrasesService {
  constructor() {
    // Acá defino un listado local de frases de contingencia con contenido amigable y empático
    // por si la API externa experimenta latencia o falta de disponibilidad.
    this.frasesFallback = [
      {
        texto: 'La empatía es la capacidad de conectarse con las emociones de los demás y recordar que no estamos solos.',
        autor: 'Comunidad Empáticos',
        origen: 'Respaldo Local'
      },
      {
        texto: 'Cada pequeño avance en tu proceso de salud es una gran victoria que merece ser celebrada.',
        autor: 'Espacio de Contención',
        origen: 'Respaldo Local'
      },
      {
        texto: 'El apoyo mutuo y la escucha sincera transforman las dificultades en esperanza compartida.',
        autor: 'Red de Apoyo Empáticos',
        origen: 'Respaldo Local'
      }
    ];
  }

  // En esta función ejecuto la consulta HTTP asíncrona a la API externa de ZenQuotes
  async obtenerFraseInspiradora() {
    try {
      // Consulto el endpoint público de ZenQuotes API con un tiempo límite de 4 segundos
      const respuesta = await axios.get('https://zenquotes.io/api/random', {
        timeout: 4000
      });

      // Verifico que la respuesta sea un arreglo con al menos un elemento que contenga la cita 'q' y el autor 'a'
      if (Array.isArray(respuesta.data) && respuesta.data.length > 0 && respuesta.data[0].q) {
        return {
          texto: respuesta.data[0].q,
          autor: respuesta.data[0].a || 'Autor Desconocido',
          origen: 'ZenQuotes API Externa'
        };
      }

      // Si la estructura no es la esperada, invoco mi método de respaldo local
      return this.obtenerFraseFallback();
    } catch (error) {
      // Capturo el error de red o timeout y recurro a mi frase de contingencia sin romper la aplicación
      console.warn(`Aviso: No se pudo consultar ZenQuotes API (${error.message}). Utilizando frase local de respaldo.`);
      return this.obtenerFraseFallback();
    }
  }

  // Método auxiliar para seleccionar una frase aleatoria del arreglo de contingencia
  obtenerFraseFallback() {
    const indiceAleatorio = Math.floor(Math.random() * this.frasesFallback.length);
    return this.frasesFallback[indiceAleatorio];
  }
}

// Exporto una instancia única de mi servicio para que sea utilizada por el controlador
export default new FrasesService();





