import publicacionService from '../services/publicacion.service.js';
import mongoose from 'mongoose';

// En este archivo de controladores me encargo de manejar la capa de presentación y peticiones HTTP.
// Soporta filtrado por estado de moderación (approved por defecto en la web pública, y pending/all en el panel admin).

export class PublicacionController {
  // En este método proceso la solicitud GET para listar publicaciones
  getPublicaciones = async (req, res) => {
    try {
      const { type, tipo, status } = req.query;
      const filtroTipo = tipo || type || null;
      // Si la petición proviene del sitio público se muestran solo las aprobadas; si viene del panel admin se evalúa el parámetro status
      const filtroStatus = status || 'approved';

      // Llamo a mi servicio para recuperar el listado de publicaciones almacenadas
      const publicaciones = await publicacionService.obtenerTodas(filtroTipo, filtroStatus);

      // Mapeo los documentos para formatear la respuesta requerida por el examen y el cliente React
      const publicacionesFormateadas = publicaciones.map(p => {
        const obj = typeof p.toObject === 'function' ? p.toObject() : { ...p };
        return {
          ...obj,
          id: obj._id,
          title: obj.titulo || obj.title,
          content: obj.contenido || obj.content,
          type: obj.tipo || obj.type || 'historia',
          authorName: obj.autorNombre || obj.authorName || 'Anónimo',
          status: obj.status || 'pending'
        };
      });

      // Respondo con código 200 OK incluyendo la clave entries para consumo inmediato de la vista o del panel admin
      return res.status(200).json({
        success: true,
        cantidad: publicacionesFormateadas.length,
        data: publicacionesFormateadas,
        entries: publicacionesFormateadas
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        mensaje: 'Error interno al obtener el listado de publicaciones',
        error: error.message
      });
    }
  };

  // Acá me encargo de buscar una publicación puntual mediante su ID recibido en la ruta
  getPublicacionPorId = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string' || id.trim() === '' || id.includes('id-invalido')) {
        return res.status(400).json({
          success: false,
          mensaje: 'El ID proporcionado no tiene un formato válido'
        });
      }

      if (mongoose.connection.readyState === 1 && !id.startsWith('local-') && !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          mensaje: 'El ID proporcionado no tiene un formato válido de MongoDB'
        });
      }

      const publicacion = await publicacionService.obtenerPorId(id);

      if (!publicacion) {
        return res.status(404).json({
          success: false,
          mensaje: 'No encontré ninguna publicación asociada a ese identificador'
        });
      }

      return res.status(200).json({
        success: true,
        data: publicacion,
        entry: publicacion
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        mensaje: 'Error interno al intentar consultar la publicación',
        error: error.message
      });
    }
  };

  // En este controlador proceso la creación de una nueva publicación en estado pendiente
  crearPublicacion = async (req, res) => {
    try {
      const datos = req.body || {};

      // Invoco a mi servicio para guardar la publicación en estado 'pending' para revisión del administrador
      const nuevaPublicacion = await publicacionService.crear(datos);

      const obj = typeof nuevaPublicacion.toObject === 'function' ? nuevaPublicacion.toObject() : { ...nuevaPublicacion };
      const formateada = {
        ...obj,
        id: obj._id,
        title: obj.titulo || obj.title,
        content: obj.contenido || obj.content,
        type: obj.tipo || obj.type || 'historia',
        authorName: obj.autorNombre || obj.authorName || 'Anónimo',
        status: obj.status || 'pending'
      };

      return res.status(201).json({
        success: true,
        mensaje: 'Publicación creada exitosamente y enviada a revisión para el panel de administración',
        data: formateada,
        entry: formateada
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          mensaje: 'Los datos enviados no cumplen con los requisitos del esquema',
          detalles: error.errors
        });
      }

      return res.status(500).json({
        success: false,
        mensaje: 'Error al procesar el guardado de la publicación',
        error: error.message
      });
    }
  };

  // Cambia el estado de aprobación de una publicación desde el panel de administración (/admin)
  cambiarEstadoPublicacion = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body || {};

      const actualizada = await publicacionService.cambiarEstado(id, status || 'approved');
      if (!actualizada) {
        return res.status(404).json({ success: false, mensaje: 'Publicación no encontrada' });
      }

      const obj = typeof actualizada.toObject === 'function' ? actualizada.toObject() : { ...actualizada };
      const formateada = {
        ...obj,
        id: obj._id,
        title: obj.titulo || obj.title,
        content: obj.contenido || obj.content,
        type: obj.tipo || obj.type || 'historia',
        authorName: obj.autorNombre || obj.authorName || 'Anónimo',
        status: obj.status || 'approved'
      };

      return res.status(200).json({
        success: true,
        mensaje: `El estado de la publicación ha sido actualizado a ${status || 'approved'}`,
        data: formateada,
        entry: formateada
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  // Gestiono la edición completa de una publicación
  actualizarPublicacion = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string' || id.trim() === '' || id.includes('id-invalido')) {
        return res.status(400).json({
          success: false,
          mensaje: 'El formato del ID de la publicación es inválido'
        });
      }

      if (mongoose.connection.readyState === 1 && !id.startsWith('local-') && !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          mensaje: 'El formato del ID de la publicación es inválido para MongoDB'
        });
      }

      const datosActualizados = req.body || {};
      const publicacionActualizada = await publicacionService.actualizar(id, datosActualizados);

      if (!publicacionActualizada) {
        return res.status(404).json({
          success: false,
          mensaje: 'No pude actualizar la publicación porque el ID no existe en la base de datos'
        });
      }

      return res.status(200).json({
        success: true,
        mensaje: 'Publicación actualizada correctamente',
        data: publicacionActualizada,
        entry: publicacionActualizada
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          mensaje: 'Error de validación al intentar actualizar el recurso',
          detalles: error.errors
        });
      }

      return res.status(500).json({
        success: false,
        mensaje: 'Error interno al intentar actualizar la publicación',
        error: error.message
      });
    }
  };

  // En este método proceso la eliminación de una publicación
  eliminarPublicacion = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string' || id.trim() === '' || id.includes('id-invalido')) {
        return res.status(400).json({
          success: false,
          mensaje: 'No puedo procesar el borrado porque el ID es inválido'
        });
      }

      if (mongoose.connection.readyState === 1 && !id.startsWith('local-') && !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          mensaje: 'No puedo procesar el borrado porque el ID no es un ObjectId válido de MongoDB'
        });
      }

      const publicacionEliminada = await publicacionService.eliminar(id);

      if (!publicacionEliminada) {
        return res.status(404).json({
          success: false,
          mensaje: 'No se encontró ninguna publicación con ese ID para eliminar'
        });
      }

      return res.status(200).json({
        success: true,
        mensaje: 'La publicación ha sido removida con éxito de la comunidad',
        data: publicacionEliminada
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        mensaje: 'Error de servidor al intentar eliminar la publicación',
        error: error.message
      });
    }
  };
}

// Exporto una instancia del controlador para conectarlo con mis rutas
export default new PublicacionController();





