// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargo variables de entorno desde backend/.env y/o el .env en la raíz del proyecto
export const cargarVariablesEntorno = () => {
  const rutasEnv = [
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../../.env'),
    path.resolve(process.cwd(), '.env')
  ];

  for (const ruta of rutasEnv) {
    if (fs.existsSync(ruta)) {
      dotenv.config({ path: ruta, override: false });
    }
  }
};

cargarVariablesEntorno();

let listenersRegistrados = false;
let ultimoErrorConexion = null;
let conexionEnCurso = null;

// ==========================================
// ESTADO ACTUAL DE LA BASE DE DATOS
// ==========================================
export const getEstadoDB = () => {
  const readyState = mongoose.connection.readyState;
  const estados = {
    0: 'desconectado',
    1: 'conectado',
    2: 'conectando',
    3: 'desconectando'
  };

  return {
    conectado: readyState === 1,
    modo: readyState === 1 ? 'mongodb_atlas' : 'local_persistente',
    estado: estados[readyState] || 'desconocido',
    readyState,
    host: readyState === 1 ? mongoose.connection.host : 'almacenamiento-local-json',
    ultimoError: readyState === 1 ? null : ultimoErrorConexion
  };
};

// ==========================================
// CONEXION A MONGO ATLAS CON MONGOOSE
// ==========================================
export const conectarDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (conexionEnCurso) {
    return conexionEnCurso;
  }

  conexionEnCurso = (async () => {
    try {
      cargarVariablesEntorno();

      const mongoUri = process.env.MONGO_URI?.trim();

      if (!mongoUri || mongoUri.includes('<usuario>') || mongoUri.includes('<password>')) {
        ultimoErrorConexion = 'MONGO_URI no configurada';
        console.warn('⚠️ [MongoDB Atlas] No se encontró una MONGO_URI válida en el archivo .env.');
        console.warn('ℹ️ El servidor funciona en modo local persistente (backend/src/data/publicaciones.json).');
        return false;
      }

      if (!listenersRegistrados) {
        listenersRegistrados = true;

        mongoose.connection.on('connected', () => {
          ultimoErrorConexion = null;
          console.log('✅ [MongoDB Atlas] Conexión establecida con éxito al clúster.');
        });

        mongoose.connection.on('error', (err) => {
          ultimoErrorConexion = err.message;
          console.warn(`⚠️ [MongoDB Atlas] Error en la conexión: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
          console.warn('ℹ️ [MongoDB Atlas] Desconectado de la base de datos.');
        });
      }

      const conexion = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000
      });

      ultimoErrorConexion = null;
      console.log(`🚀 [Base de Datos] Conectado a MongoDB Atlas en: ${conexion.connection.host}`);
      return true;
    } catch (error) {
      ultimoErrorConexion = error.message;
      console.warn(`⚠️ [Base de Datos] No se pudo conectar a Atlas (${error.message}).`);
      console.warn('ℹ️ El servidor Express sigue funcionando en modo local persistente.');
      return false;
    } finally {
      conexionEnCurso = null;
    }
  })();

  return conexionEnCurso;
};

export default conectarDB;
