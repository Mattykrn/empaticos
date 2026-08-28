// Controlador para administrar las Noticias del portal
// Archivo implemento mi lógica de negocio (CRUD) para interactuar con la colección de Noticias en MongoDB.

import Noticia from '../models/Noticia.js';

/**
 * GET /api/noticias
 * En este controlador obtengo todas las noticias guardadas en el sistema.
 */
export const obtenerNoticias = async (req, res) => {
  try {
    // Realizo la búsqueda de noticias ordenándolas por fecha decreciente
    const noticias = await Noticia.find().sort({ createdAt: -1 });

    res.status(200).json({
      ok: true,
      total: noticias.length,
      data: noticias
    });
  } catch (error) {
    console.error(`[Error obtenerNoticias] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor al consultar las noticias',
      error: error.message
    });
  }
};

/**
 * GET /api/noticias/:id
 * En esta función busco una noticia específica según su ID.
 */
export const obtenerNoticiaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Utilizo el modelo Noticia para consultar por su identificador único
    const noticia = await Noticia.findById(id);

    if (!noticia) {
      return res.status(404).json({
        ok: false,
        mensaje: `No existe la noticia con el ID proporcionado: ${id}`
      });
    }

    res.status(200).json({
      ok: true,
      data: noticia
    });
  } catch (error) {
    console.error(`[Error obtenerNoticiaPorId] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al recuperar la noticia indicada',
      error: error.message
    });
  }
};

/**
 * POST /api/noticias
 * En este controlador creo y persisto una nueva noticia.
 */
export const crearNoticia = async (req, res) => {
  try {
    const { titulo, categoria, resumen, imagen, autor } = req.body;

    // Instanciar noticia
    const nuevaNoticia = new Noticia({
      titulo,
      categoria,
      resumen,
      imagen: imagen || '',
      autor
    });

    // Persisto la noticia en mi base de datos en MongoDB Atlas
    const noticiaGuardada = await nuevaNoticia.save();

    res.status(201).json({
      ok: true,
      mensaje: 'Noticia creada exitosamente',
      data: noticiaGuardada
    });
  } catch (error) {
    console.error(`[Error crearNoticia] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al intentar guardar la nueva noticia',
      error: error.message
    });
  }
};

/**
 * PUT /api/noticias/:id
 * En este controlador modifico los campos de una noticia existente por su ID.
 */
export const actualizarNoticia = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, categoria, resumen, imagen, autor } = req.body;

    // Paso efectúo la actualización en MongoDB Atlas
    const noticiaActualizada = await Noticia.findByIdAndUpdate(
      id,
      { titulo, categoria, resumen, imagen, autor },
      { new: true, runValidators: true }
    );

    if (!noticiaActualizada) {
      return res.status(404).json({
        ok: false,
        mensaje: `No se encontró la noticia con ID ${id} para ser actualizada`
      });
    }

    res.status(200).json({
      ok: true,
      mensaje: 'Noticia actualizada correctamente',
      data: noticiaActualizada
    });
  } catch (error) {
    console.error(`[Error actualizarNoticia] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Falla interna al actualizar la noticia',
      error: error.message
    });
  }
};

/**
 * DELETE /api/noticias/:id
 * En esta función elimino una noticia de la base de datos según su ID.
 */
export const eliminarNoticia = async (req, res) => {
  try {
    const { id } = req.params;

    // Elimino el documento especificado por el ID
    const noticiaEliminada = await Noticia.findByIdAndDelete(id);

    if (!noticiaEliminada) {
      return res.status(404).json({
        ok: false,
        mensaje: `No existe la noticia con ID ${id} para eliminar`
      });
    }

    res.status(200).json({
      ok: true,
      mensaje: 'Noticia borrada de la base de datos',
      data: noticiaEliminada
    });
  } catch (error) {
    console.error(`[Error eliminarNoticia] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno al intentar eliminar la noticia',
      error: error.message
    });
  }
};
