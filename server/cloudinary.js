'use strict';

// ─────────────────────────────────────────────────────────────
// Almacenamiento de imágenes (TAREA 2 — Paso 3)
//
// Sube imágenes a Cloudinary en producción y cae al filesystem
// local (uploads/) cuando no hay credenciales configuradas
// (desarrollo local y pruebas).
//
// Configuración:
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
// ─────────────────────────────────────────────────────────────

const USE_CLOUDINARY = (() => {
  const hasCreds = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
  if (process.env.USE_CLOUDINARY === 'true') return true;
  if (process.env.USE_CLOUDINARY === 'false') return false;
  return hasCreds;
})();

let _configured = false;

function getCloudinary() {
  const cloudinary = require('cloudinary').v2;
  if (!_configured) {
    const missing = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
      .filter((key) => !process.env[key]);
    if (missing.length) {
      throw new Error(`USE_CLOUDINARY está activo pero faltan: ${missing.join(', ')}`);
    }
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    _configured = true;
  }
  return cloudinary;
}

/**
 * Sube un buffer de imagen a Cloudinary.
 * @param {Buffer} buffer
 * @param {{ filename?: string, folder?: string }} [options]
 * @returns {Promise<{ url: string, publicId: string }>}
 */
async function uploadImage(buffer, options = {}) {
  const cloudinary = getCloudinary();
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'empaticos',
        resource_type: 'image',
        public_id: options.publicId,
        overwrite: false,
      },
      (error, upload) => (error ? reject(error) : resolve(upload))
    ).end(buffer);
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Elimina una imagen de Cloudinary por su public_id.
 */
async function deleteImage(publicId) {
  if (!publicId) return;
  const cloudinary = getCloudinary();
  await cloudinary.uploader.destroy(publicId);
}

module.exports = {
  USE_CLOUDINARY,
  uploadImage,
  deleteImage,
};
