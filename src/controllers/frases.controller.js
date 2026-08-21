import frasesService from '../services/frases.service.js';

// En este controlador administro la respuesta HTTP para mi ruta de consumo de frases motivacionales externas.

export class FrasesController {
  // Acá procesé la petición GET /api/frases/inspiracion invocando la lógica de mi servicio
  getFraseInspiradora = async (req, res) => {
    try {
      // Solicito a mi servicio la frase diaria traída de la API externa (o desde el fallback en su defecto)
      const fraseData = await frasesService.obtenerFraseInspiradora();

      // Devo un estado HTTP 200 OK junto con la frase procesada y formateada
      return res.status(200).json({
        success: true,
        mensaje: 'Frase inspiradora obtenida exitosamente para el muro comunitario',
        data: fraseData
      });
    } catch (error) {
      // Capturo cualquier fallo imprevisto y devuelvo un código HTTP 500
      return res.status(500).json({
        success: false,
        mensaje: 'Error interno al intentar obtener la frase de inspiración',
        error: error.message
      });
    }
  };
}

// Exporto una instancia lista de mi controlador
export default new FrasesController();





