// Controlador para gestionar el recurso de Historias y Testimonios
// Archivo desarrollo la lógica de negocio completa (CRUD) para interactuar con el modelo Historia en MongoDB.

import Historia from '../models/Historia.js';

/**
 * GET /api/historias
 * En esta función obtengo el listado de todas las historias registradas en mi base de datos.
 */
export const obtenerHistorias = async (req, res) => {
  try {
    // Recuperar documentos recientes
    const historias = await Historia.find().sort({ createdAt: -1 });
    
    // Respondo con el arreglo obtenido y código 200 OK
    res.status(200).json({
      ok: true,
      total: historias.length,
      data: historias
    });
  } catch (error) {
    // Capturo cualquier posible falla en la base de datos y retorno 500
    console.error(`[Error obtenerHistorias] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor al intentar recuperar las historias',
      error: error.message
    });
  }
};

/**
 * GET /api/historias/:id
 * En esta función busco y devuelvo una historia particular según su identificador único ID.
 */
export const obtenerHistoriaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Utilizo mi modelo Historia para consultar por el campo _id
    const historia = await Historia.findById(id);

    // Verifico si la historia fue hallada
    if (!historia) {
      return res.status(404).json({
        ok: false,
        mensaje: `No se encontró ninguna historia con el ID: ${id}`
      });
    }

    res.status(200).json({
      ok: true,
      data: historia
    });
  } catch (error) {
    console.error(`[Error obtenerHistoriaPorId] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno al consultar la historia especificada',
      error: error.message
    });
  }
};

/**
 * POST /api/historias
 * En este controlador gestiono la creación e inserción de una nueva historia enviada por el usuario.
 */
export const crearHistoria = async (req, res) => {
  try {
    // Extraigo las propiedades del cuerpo de la petición HTTP
    const { titulo, contenido, autorNombre, rolAutor, tipoPublicacion } = req.body;

    // Instanciar documento
    const nuevaHistoria = new Historia({
      titulo,
      contenido,
      autorNombre: autorNombre || 'Anónimo',
      rolAutor,
      tipoPublicacion: tipoPublicacion || 'testimonio'
    });

    // Persisto el objeto en mi base de datos MongoDB Atlas
    const historiaGuardada = await nuevaHistoria.save();

    // Devuelvo el resultado creado con código HTTP 201 Created
    res.status(201).json({
      ok: true,
      mensaje: 'Historia publicada correctamente',
      data: historiaGuardada
    });
  } catch (error) {
    console.error(`[Error crearHistoria] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Falla interna al guardar la historia en la base de datos',
      error: error.message
    });
  }
};

/**
 * PUT /api/historias/:id
 * En esta función actualizo los datos de una historia existente a partir de su ID.
 */
export const actualizarHistoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, autorNombre, rolAutor, tipoPublicacion } = req.body;

    // Actualizar y retornar
    const historiaActualizada = await Historia.findByIdAndUpdate(
      id,
      { titulo, contenido, autorNombre, rolAutor, tipoPublicacion },
      { new: true, runValidators: true }
    );

    // Controlo el caso en que el ID no corresponda a ninguna historia guardada
    if (!historiaActualizada) {
      return res.status(404).json({
        ok: false,
        mensaje: `No fue posible actualizar. No existe historia con ID: ${id}`
      });
    }

    res.status(200).json({
      ok: true,
      mensaje: 'Historia actualizada con éxito',
      data: historiaActualizada
    });
  } catch (error) {
    console.error(`[Error actualizarHistoria] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Ocurrió un error al intentar actualizar la historia',
      error: error.message
    });
  }
};

/**
 * DELETE /api/historias/:id
 * En este controlador elimino de forma permanente una historia de mi base de datos.
 */
export const eliminarHistoria = async (req, res) => {
  try {
    const { id } = req.params;

    // Paso ejecuto el borrado en MongoDB Atlas
    const historiaEliminada = await Historia.findByIdAndDelete(id);

    // Si la historia no existía previamente, notifico un error 404
    if (!historiaEliminada) {
      return res.status(404).json({
        ok: false,
        mensaje: `Imposible eliminar. La historia con ID ${id} no fue encontrada`
      });
    }

    res.status(200).json({
      ok: true,
      mensaje: 'La historia fue eliminada satisfactoriamente',
      data: historiaEliminada
    });
  } catch (error) {
    console.error(`[Error eliminarHistoria] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Falla al eliminar la historia seleccionada',
      error: error.message
    });
  }
};

/**
 * POST /api/historias/:id/reacciones
 * En esta función administro las reacciones afectivas (ej. me_inspira, abrazo) registradas en una historia.
 */
export const reaccionarHistoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid, tipo } = req.body;

    if (!uid || !tipo) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Se requieren de forma obligatoria los datos uid y tipo para registrar la reacción'
      });
    }

    // Buscar historia
    const historia = await Historia.findById(id);

    if (!historia) {
      return res.status(404).json({
        ok: false,
        mensaje: `No se halló la historia con ID: ${id}`
      });
    }

    // Controlo si el usuario ya reaccionó previamente para actualizar su reacción o agregar una nueva
    const reaccionExistenteIndice = historia.reacciones.findIndex(r => r.uid === uid);

    if (reaccionExistenteIndice >= 0) {
      historia.reacciones[reaccionExistenteIndice].tipo = tipo;
    } else {
      historia.reacciones.push({ uid, tipo });
    }

    await historia.save();

    res.status(200).json({
      ok: true,
      mensaje: 'Reacción guardada correctamente',
      data: historia
    });
  } catch (error) {
    console.error(`[Error reaccionarHistoria] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno al procesar la reacción de la historia',
      error: error.message
    });
  }
};
