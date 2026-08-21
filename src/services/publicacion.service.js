import Publicacion from '../models/Publicacion.model.js';
import mongoose from 'mongoose';

// En este módulo de servicio concentro toda mi lógica de acceso a datos y comunicación con MongoDB.
// Administro el ciclo de vida de las publicaciones permitiendo que las nuevas ingresen en estado 'pending'
// para que el administrador las evalúe y apruebe ('approved') desde el panel /admin.

class PublicacionService {
  constructor() {
    // Arreglo inicial de publicaciones locales para pruebas
    this.publicacionesLocales = [
      {
        _id: 'local-1',
        titulo: 'Mi experiencia de superación y contención',
        contenido: 'Comparto mi testimonio para animar a otros pacientes y familiares en su proceso diario.',
        tipo: 'historia',
        rolAutor: 'paciente',
        categoria: 'general',
        autorNombre: 'María G.',
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        _id: 'local-2',
        titulo: 'Un momento gracioso en la sala de espera',
        contenido: 'Una anécdota divertida para ponerle una sonrisa al día entre compañeros.',
        tipo: 'anecdota',
        rolAutor: 'familiar',
        categoria: 'apoyo_emocional',
        autorNombre: 'Carlos R.',
        status: 'approved',
        createdAt: new Date(Date.now() - 7200000)
      }
    ];
  }

  // Verifica si la conexión con MongoDB Atlas se encuentra activa y lista
  estaConectadoBD() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  // Consulta publicaciones filtrando opcionalmente por tipo y estado de moderación (pending/approved/all)
  async obtenerTodas(tipo = null, statusFiltro = 'approved') {
    try {
      if (this.estaConectadoBD()) {
        const query = {};
        if (tipo && tipo !== 'all') query.tipo = tipo;
        if (statusFiltro && statusFiltro !== 'all') query.status = statusFiltro;

        return await Publicacion.find(query).sort({ createdAt: -1 });
      }

      // Filtrado en memoria si operamos en modo local/offline
      let resultado = [...this.publicacionesLocales];
      if (tipo && tipo !== 'all') {
        resultado = resultado.filter(p => p.tipo === tipo || p.type === tipo);
      }
      if (statusFiltro && statusFiltro !== 'all') {
        resultado = resultado.filter(p => p.status === statusFiltro);
      }
      return resultado;
    } catch (error) {
      console.warn(`Aviso de servicio: Usando publicaciones locales por falla de BD (${error.message})`);
      let resultado = [...this.publicacionesLocales];
      if (statusFiltro && statusFiltro !== 'all') {
        resultado = resultado.filter(p => p.status === statusFiltro);
      }
      return resultado;
    }
  }

  // Busca una publicación específica por su identificador
  async obtenerPorId(id) {
    try {
      if (this.estaConectadoBD() && mongoose.Types.ObjectId.isValid(id)) {
        const pub = await Publicacion.findById(id);
        if (pub) return pub;
      }
      return this.publicacionesLocales.find(p => p._id === id) || null;
    } catch (error) {
      return this.publicacionesLocales.find(p => p._id === id) || null;
    }
  }

  // Crea una nueva publicación asignándole el estado 'pending' por defecto para requerir evaluación admin
  async crear(datosPublicacion) {
    try {
      const datosConEstado = {
        ...datosPublicacion,
        status: datosPublicacion.status || 'pending'
      };

      if (this.estaConectadoBD()) {
        const nuevaPublicacion = new Publicacion(datosConEstado);
        return await nuevaPublicacion.save();
      }

      // Si operamos localmente sin Atlas, guardo la publicación como pendiente en la memoria local
      const publicacionLocal = {
        _id: `local-${Date.now()}`,
        titulo: datosPublicacion.titulo || datosPublicacion.title || 'Publicación en revisión',
        contenido: datosPublicacion.contenido || datosPublicacion.content || 'Contenido enviado para moderación.',
        tipo: datosPublicacion.tipo || datosPublicacion.type || 'historia',
        type: datosPublicacion.tipo || datosPublicacion.type || 'historia',
        rolAutor: datosPublicacion.rolAutor || 'paciente',
        categoria: datosPublicacion.categoria || 'general',
        autorNombre: datosPublicacion.autorNombre || datosPublicacion.authorName || 'Anónimo',
        authorName: datosPublicacion.autorNombre || datosPublicacion.authorName || 'Anónimo',
        status: datosPublicacion.status || 'pending',
        createdAt: new Date()
      };

      this.publicacionesLocales.unshift(publicacionLocal);
      return publicacionLocal;
    } catch (error) {
      const publicacionLocal = {
        _id: `local-${Date.now()}`,
        titulo: datosPublicacion.titulo || 'Publicación en revisión',
        contenido: datosPublicacion.contenido || 'Contenido en proceso de moderación.',
        tipo: datosPublicacion.tipo || 'historia',
        type: datosPublicacion.tipo || 'historia',
        rolAutor: datosPublicacion.rolAutor || 'paciente',
        categoria: datosPublicacion.categoria || 'general',
        autorNombre: datosPublicacion.autorNombre || 'Anónimo',
        status: 'pending',
        createdAt: new Date()
      };
      this.publicacionesLocales.unshift(publicacionLocal);
      return publicacionLocal;
    }
  }

  // En este método cambio el estado de aprobación de una publicación desde el panel de administración (/admin)
  async cambiarEstado(id, nuevoEstado) {
    try {
      if (this.estaConectadoBD() && mongoose.Types.ObjectId.isValid(id)) {
        return await Publicacion.findByIdAndUpdate(id, { status: nuevoEstado }, { new: true });
      }
      const item = this.publicacionesLocales.find(p => p._id === id);
      if (item) {
        item.status = nuevoEstado;
        return item;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Ejecuto la actualización parcial/total de un testimonio
  async actualizar(id, datosActualizados) {
    try {
      if (this.estaConectadoBD() && mongoose.Types.ObjectId.isValid(id)) {
        return await Publicacion.findByIdAndUpdate(id, datosActualizados, {
          new: true,
          runValidators: true
        });
      }

      const index = this.publicacionesLocales.findIndex(p => p._id === id);
      if (index !== -1) {
        this.publicacionesLocales[index] = {
          ...this.publicacionesLocales[index],
          ...datosActualizados
        };
        return this.publicacionesLocales[index];
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Remuevo una publicación por su ID
  async eliminar(id) {
    try {
      if (this.estaConectadoBD() && mongoose.Types.ObjectId.isValid(id)) {
        return await Publicacion.findByIdAndDelete(id);
      }

      const index = this.publicacionesLocales.findIndex(p => p._id === id);
      if (index !== -1) {
        const borrado = this.publicacionesLocales[index];
        this.publicacionesLocales.splice(index, 1);
        return borrado;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

// Exporto una instancia única de mi servicio para usarla a lo largo de toda la aplicación
export default new PublicacionService();





