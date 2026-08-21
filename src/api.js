export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ENTRY_TYPES = ['historia', 'anecdota', 'video', 'diagnostico', 'galeria'];

export const EM_TYPES = ['SCA', 'EMRR', 'EMPP', 'EMSP', 'Otro'];

export const TYPE_LABELS = {
  historia: 'Historia',
  anecdota: 'Anécdota',
  video: 'Video',
  diagnostico: 'Diagnóstico',
  galeria: 'Galería',
};

export const REACTION_DEFS = [
  { key: 'hearts', emoji: '❤️', label: 'Corazones' },
  { key: 'hugs', emoji: '🤗', label: 'Abrazos' },
  { key: 'laughs', emoji: '😂', label: 'Risas' },
];

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let data = {};
    try {
      data = await response.json();
    } catch (err) {
      // sin cuerpo JSON
    }
    // Sesión admin expirada/inválida: limpiar el token y notificar al panel.
    if (response.status === 401 && getAdminToken()) {
      setAdminToken(null);
      const error = new Error('Sesión expirada. Iniciá sesión de nuevo.');
      error.isUnauthorized = true;
      throw error;
    }
    throw new Error(data.mensaje || data.error || `Error HTTP ${response.status}`);
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────
// Funciones del Proyecto Integrador Empáticos (CRUD + API Externa)
// ─────────────────────────────────────────────────────────────

export function getPublicaciones() {
  return request('/publicaciones');
}

export function getPublicacionPorId(id) {
  return request(`/publicaciones/${id}`);
}

export function crearPublicacion(payload) {
  return request('/publicaciones', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function actualizarPublicacion(id, payload) {
  return request(`/publicaciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function eliminarPublicacion(id) {
  return request(`/publicaciones/${id}`, {
    method: 'DELETE',
  });
}

export function getFraseInspiradora() {
  return request('/frases/inspiracion');
}

export function getStats() {
  return request('/stats');
}

export function getEntries(type) {
  return request(`/publicaciones${buildQuery({ type })}`);
}

export function getMyEntries(visitorId) {
  return request(`/publicaciones${buildQuery({ visitorId })}`);
}

export function createEntry(payload) {
  return request('/publicaciones', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function reactToEntry(id, reaction) {
  return request(`/entries/${id}/react`, {
    method: 'POST',
    body: JSON.stringify({ reaction }),
  });
}

export function addComment(entryId, { authorName, avatar, text, visitorId }) {
  return request(`/entries/${entryId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ authorName, avatar, text, visitorId }),
  });
}

export function deleteComment(entryId, commentId, adminPassword) {
  return request(`/entries/${entryId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: adminHeaders(adminPassword),
  });
}

export function getFavorites(visitorId) {
  return request(`/favorites/${encodeURIComponent(visitorId)}`);
}

export function addFavorite(visitorId, entryId) {
  return request(`/favorites/${encodeURIComponent(visitorId)}/${encodeURIComponent(entryId)}`, {
    method: 'POST',
  });
}

export function removeFavorite(visitorId, entryId) {
  return request(`/favorites/${encodeURIComponent(visitorId)}/${encodeURIComponent(entryId)}`, {
    method: 'DELETE',
  });
}

export function uploadImage({ filename, mimeType, data }) {
  return request('/upload', {
    method: 'POST',
    body: JSON.stringify({ filename, mimeType, data }),
  });
}

export async function fileToUpload(file) {
  const base64 = await readFileAsBase64(file);
  return uploadImage({
    filename: file.name,
    mimeType: file.type,
    data: base64,
  });
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

const ADMIN_TOKEN_KEY = 'empaticos-admin-token';

export function getAdminToken() {
  return typeof window !== 'undefined' ? window.localStorage.getItem(ADMIN_TOKEN_KEY) || '' : '';
}

export function setAdminToken(token) {
  if (!token) {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

/**
 * Verifica la sesión admin guardada contra /auth/verify.
 * Devuelve null si no hay token guardado.
 */
export async function verifyAdminToken() {
  const token = getAdminToken();
  if (!token) return null;
  return request('/auth/verify', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Headers para rutas de administración: Bearer JWT (si hay sesión)
 * + contraseña legacy para modo desarrollo.
 */
export function adminHeaders(adminPassword = '') {
  const headers = {};
  const token = getAdminToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (adminPassword) headers['x-admin-password'] = adminPassword;
  return headers;
}

export function loginAdmin(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getAllEntries(adminPassword) {
  return request('/publicaciones/all?status=all', {
    headers: adminHeaders(adminPassword),
  });
}

export function setEntryStatus(id, status, adminPassword) {
  return request(`/publicaciones/${id}/status`, {
    method: 'PATCH',
    headers: adminHeaders(adminPassword),
    body: JSON.stringify({ status }),
  });
}

export function deleteEntry(id, adminPassword) {
  return request(`/publicaciones/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(adminPassword),
  });
}

export function formatDate(fecha) {
  if (!fecha) return 'Pronto';
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return 'Pronto';
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Resuelve URLs de archivos servidos por el backend (/uploads/...)
 * anteponiendo el origen correcto.
 */
export function resolveMediaUrl(url) {
  if (!url) return '';
  if (typeof url === 'string' && url.startsWith('/uploads/')) {
    return API_BASE.replace(/\/api$/, '') + url;
  }
  return url;
}

export function initialsOf(name) {
  return (name || 'EM')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}
