import Publication from '../models/Publication.js';

/**
 * GET /api/items
 * Obtener todos los registros almacenados.
 */
export const getItems = async (req, res) => {
  try {
    const items = await Publication.find().sort({ createdAt: -1 });

    res.status(200).json({
      ok: true,
      total: items.length,
      data: items
    });
  } catch (error) {
    console.error(`[Error getItems] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor al recuperar los registros',
      error: error.message
    });
  }
};

/**
 * GET /api/items/:id
 * Obtener un registro específico por su ID.
 */
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Publication.findById(id);

    if (!item) {
      return res.status(404).json({
        ok: false,
        mensaje: `No se encontró ningún registro con el ID: ${id}`
      });
    }

    res.status(200).json({
      ok: true,
      data: item
    });
  } catch (error) {
    console.error(`[Error getItemById] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno al consultar el registro especificado',
      error: error.message
    });
  }
};

/**
 * POST /api/items
 * Crear un nuevo registro en la base de datos.
 */
export const createItem = async (req, res) => {
  try {
    const { titulo, contenido, categoria, votosUtiles, esAnonimo, fechaEvento, etiquetas } = req.body;

    const newItem = new Publication({
      titulo,
      contenido,
      categoria: categoria || 'apoyo_emocional',
      votosUtiles: votosUtiles || 0,
      esAnonimo: esAnonimo || false,
      fechaEvento: fechaEvento || null,
      etiquetas: etiquetas || []
    });

    const itemSaved = await newItem.save();

    res.status(201).json({
      ok: true,
      mensaje: 'Registro creado exitosamente',
      data: itemSaved
    });
  } catch (error) {
    console.error(`[Error createItem] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Falla interna al intentar guardar el nuevo registro',
      error: error.message
    });
  }
};

/**
 * PUT /api/items/:id
 * Actualizar un registro existente por su ID.
 */
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedItem = await Publication.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        ok: false,
        mensaje: `No se encontró el registro con ID ${id} para ser actualizado`
      });
    }

    res.status(200).json({
      ok: true,
      mensaje: 'Registro actualizado correctamente',
      data: updatedItem
    });
  } catch (error) {
    console.error(`[Error updateItem] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Ocurrió un error interno al actualizar el registro',
      error: error.message
    });
  }
};

/**
 * DELETE /api/items/:id
 * Eliminar un registro de la base de datos por su ID.
 */
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await Publication.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({
        ok: false,
        mensaje: `No existe ningún registro con el ID ${id} para eliminar`
      });
    }

    res.status(200).json({
      ok: true,
      mensaje: 'Registro eliminado satisfactoriamente',
      data: deletedItem
    });
  } catch (error) {
    console.error(`[Error deleteItem] ${error.message}`);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno al intentar eliminar el registro',
      error: error.message
    });
  }
};
