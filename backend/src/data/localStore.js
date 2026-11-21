import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = __dirname;
const PUBLICACIONES_FILE = path.join(DATA_DIR, 'publicaciones.json');
const REACCIONES_FILE = path.join(DATA_DIR, 'reacciones.json');

export const PUBLICACIONES_INICIALES = [
  {
    _id: '66a000000000000000000001',
    titulo: 'Mi historia con la EM: El camino de nunca bajar los brazos',
    contenido: `Holaa, mis buenos deseos para quien esté leyendo este comentario ya sea paciente, familiar o simplemente alguien curioso :D

Soy el administrador y diseñador de la página. Convivo con esclerosis múltiple desde el año 2013 (tenía 15 años), hoy en día tengo 28...
La verdad que el diagnóstico temprano me ha ayudado mucho a contener los brotes y todo lo que esta enfermedad conlleva. Cambios de paradigmas tuvo toda mi vida desde el momento del diagnóstico, pero nunca bajé los brazos.

Mi sueño en aquella época (2013) era ser mecánico de automotores. Dado el diagnóstico temprano, me vi a la fuerza en la necesidad de alejarme de los motores, del TC Pista, TC 2000, F1, Superbike y demás. En ese momento en que manipulé un torno con una leve pérdida de equilibrio me llevé un susto. Doy las gracias a la escuela que nos capacitó bien para no tocar las máquinas en momentos en que no nos sentimos bien; eso me dio respeto y me vi obligado a cambiar de rumbos.

Me cambié a informática, me enamoré de lo que es la programación y me seguí capacitando bajo el sueño de ser desarrollador de software, que claramente no acaba simplemente con esto.

Todo fue cambiando. Por el 2013 internet era mucho más áspero y sin filtro, recuerdo desconocer lo que era la enfermedad y cometí el error de googlearlo y fue para peor jaja, muchos de los que ya llevan años sabrán a qué me refiero. Pero con contención profesional y buenas palabras de amigos, psicólogos y psiquiatras llegué a no bajar los brazos y no darme por vencido por más dolores que tenga en el cuerpo. ¡Disfruté mi adolescencia y coseché las mejores amistades que se pueden pedir!

Aprendí que amar a un amigo no es algo mal visto y que no solo se ama a quien duerme con vos, se ama y aprecia a quien estuvo siempre a tu lado. Todo es parte de crecer.

Dejo un mensaje que a mí me abrió la cabeza: "No podés pelear contra lo invencible, es mejor llevar a tu rival de la mano como si fuese una amistad", tirar contra ella solo nos perjudicará :)

Por eso siempre hay que hacer caso a los profesionales. Espero que les sirva este consejo y bueno, ¡que esta comunidad crezca, lleguemos a todos lados y que ningún otro paciente se sienta solo nunca más!`,
    autorNombre: 'Matías Torres (Administrador y Creador)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    autorFoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    autorUid: 'admin-matias',
    rolAutor: 'paciente',
    categoria: 'superacion',
    tipo: 'historia',
    tipoPublicacion: 'experiencia',
    videoUrl: '',
    imageUrl: '',
    status: 'approved',
    estado: 'aprobado',
    votosUtiles: 15,
    esAnonimo: false,
    etiquetas: ['superacion', 'comunidad', 'historia'],
    reacciones: [
      { uid: 'u1', userId: 'u1', usuario: 'u1', tipo: 'fuerza', type: 'fuerza' },
      { uid: 'u2', userId: 'u2', usuario: 'u2', tipo: 'abrazo', type: 'abrazo' },
      { uid: 'u3', userId: 'u3', usuario: 'u3', tipo: 'gracias', type: 'gracias' }
    ],
    comentarios: [
      {
        _id: '66b000000000000000000001',
        autorNombre: 'María Celeste A.',
        rolAutor: 'paciente',
        texto: '¡Gracias por crear este espacio Matías! Esa frase sobre llevar la EM de la mano me emocionó mucho.',
        createdAt: '2026-08-20T14:30:00.000Z'
      }
    ],
    createdAt: '2026-08-20T12:00:00.000Z',
    updatedAt: '2026-08-20T12:00:00.000Z'
  },
  {
    _id: '66a000000000000000000002',
    titulo: '😂 El misterio del control remoto y la heladera',
    contenido: '¡No todo es superación solemne, las anécdotas insólitas sobran! La famosa "niebla mental" de la EM no perdona jaja. El otro día estuve 40 minutos buscando el control remoto del televisor por toda la casa y adivinen dónde estaba: adentro de la heladera junto a la leche. Me reí solo 10 minutos seguidos. ¡A tomar la vida con buen humor!',
    autorNombre: 'Matías Torres (Admin)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    autorFoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    autorUid: 'admin-matias',
    rolAutor: 'paciente',
    categoria: 'humor',
    tipo: 'anecdota',
    tipoPublicacion: 'anecdota',
    videoUrl: '',
    imageUrl: '',
    status: 'approved',
    estado: 'aprobado',
    votosUtiles: 10,
    esAnonimo: false,
    etiquetas: ['humor', 'anecdota', 'niebla-mental'],
    reacciones: [
      { uid: 'u10', userId: 'u10', usuario: 'u10', tipo: 'fuerza', type: 'fuerza' },
      { uid: 'u11', userId: 'u11', usuario: 'u11', tipo: 'gracias', type: 'gracias' }
    ],
    comentarios: [],
    createdAt: '2026-08-19T16:00:00.000Z',
    updatedAt: '2026-08-19T16:00:00.000Z'
  },
  {
    _id: '66a000000000000000000003',
    titulo: 'Mi camino de superación tras 3 años del diagnóstico de EM',
    contenido: 'Al principio sentí mucha incertidumbre tras el diagnóstico de Esclerosis Múltiple, pero con el tratamiento adecuado y el apoyo de mi familia aprendí que la fortaleza se construye día a día.',
    autorNombre: 'María Celeste A.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    autorFoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    autorUid: 'seed-celeste',
    rolAutor: 'paciente',
    categoria: 'superacion',
    tipo: 'historia',
    tipoPublicacion: 'experiencia',
    videoUrl: 'https://www.youtube.com/watch?v=gbkrlXuzodU',
    imageUrl: 'https://www.youtube.com/watch?v=gbkrlXuzodU',
    status: 'approved',
    estado: 'aprobado',
    votosUtiles: 12,
    esAnonimo: false,
    etiquetas: ['superacion', 'video', 'apoyo'],
    reacciones: [
      { uid: 'u1', userId: 'u1', usuario: 'u1', tipo: 'fuerza', type: 'fuerza' },
      { uid: 'u2', userId: 'u2', usuario: 'u2', tipo: 'fuerza', type: 'fuerza' },
      { uid: 'u3', userId: 'u3', usuario: 'u3', tipo: 'abrazo', type: 'abrazo' }
    ],
    comentarios: [],
    createdAt: '2026-08-18T10:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z'
  }
];

let cachePublicaciones = null;
let cacheReacciones = null;

const asegurarDirectorio = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return true;
  } catch (error) {
    console.warn(`⚠️ [LocalStore] No se pudo crear el directorio de datos (${error.message}). Usando memoria.`);
    return false;
  }
};

export const cargarPublicacionesLocales = () => {
  if (cachePublicaciones) return cachePublicaciones;

  try {
    if (fs.existsSync(PUBLICACIONES_FILE)) {
      const contenido = fs.readFileSync(PUBLICACIONES_FILE, 'utf-8');
      const parsed = JSON.parse(contenido);
      if (Array.isArray(parsed)) {
        cachePublicaciones = parsed;
        return cachePublicaciones;
      }
    }
  } catch (error) {
    console.warn(`⚠️ [LocalStore] Error leyendo publicaciones.json (${error.message}). Reiniciando con datos base.`);
  }

  cachePublicaciones = structuredClone(PUBLICACIONES_INICIALES);
  guardarPublicacionesLocales(cachePublicaciones);
  return cachePublicaciones;
};

export const guardarPublicacionesLocales = (lista) => {
  cachePublicaciones = lista;
  if (!asegurarDirectorio()) return false;

  try {
    fs.writeFileSync(PUBLICACIONES_FILE, JSON.stringify(lista, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.warn(`⚠️ [LocalStore] No se pudo escribir publicaciones.json (${error.message}). Datos guardados en memoria.`);
    return false;
  }
};

export const cargarReaccionesExtra = () => {
  if (cacheReacciones) return cacheReacciones;

  try {
    if (fs.existsSync(REACCIONES_FILE)) {
      const data = fs.readFileSync(REACCIONES_FILE, 'utf-8');
      const json = JSON.parse(data);
      cacheReacciones = new Map(Object.entries(json));
      return cacheReacciones;
    }
  } catch (error) {
    console.warn(`⚠️ [LocalStore] Error leyendo reacciones.json (${error.message}).`);
  }

  cacheReacciones = new Map();
  return cacheReacciones;
};

export const guardarReaccionesExtra = (mapa) => {
  cacheReacciones = mapa;
  if (!asegurarDirectorio()) return false;

  try {
    const obj = Object.fromEntries(mapa);
    fs.writeFileSync(REACCIONES_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.warn(`⚠️ [LocalStore] No se pudo escribir reacciones.json (${error.message}).`);
    return false;
  }
};

