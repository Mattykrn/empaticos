'use strict';

// ─────────────────────────────────────────────────────────────
// Capa de persistencia (TAREA 1 — Paso 3)
//
// Reemplaza readDb()/writeDb() de server.js por una capa que
// funciona con Firebase Firestore en producción y conserva un
// fallback a data/db.json cuando no hay credenciales de Firebase
// (desarrollo local y pruebas). La inicialización de Firebase
// vive en server/firebase.js.
//
// Colecciones:
//   - entries       : una entrada por documento (id = entry.id)
//   - entries/{id}/comments : subcolección de comentarios
//   - favorites     : un documento por visitorId → { entryIds: [] }
// ─────────────────────────────────────────────────────────────

const path = require('path');
const fs = require('fs');
const firebase = require('./firebase');

const dataPath = path.join(__dirname, '..', 'data', 'db.json');

const EMPTY_REACTIONS = () => ({ hearts: 0, laughs: 0, hugs: 0 });

// En producción usa Firestore; sin credenciales cae a data/db.json.
const USE_FIRESTORE = firebase.USE_FIREBASE;

let _firestore = null;

async function getFirestore() {
  if (_firestore) return _firestore;
  _firestore = firebase.getFirestoreService();
  return _firestore;
}

// ─────────────────────────────────────────────────────────────
// Normalización del schema
// ─────────────────────────────────────────────────────────────

function normalizeEntry(entry) {
  return {
    ...entry,
    comments: Array.isArray(entry.comments) ? entry.comments : [],
    mediaUrls: Array.isArray(entry.mediaUrls) ? entry.mediaUrls : [],
    reactions: entry.reactions || EMPTY_REACTIONS(),
  };
}

/**
 * Convierte una historia del schema legacy a una entrada nueva.
 */
function migrateStoryToEntry(story) {
  const EM_TYPES = ['SCA', 'EMRR', 'EMPP', 'EMSP', 'Otro'];
  const emType = EM_TYPES.includes(story.type) ? story.type : 'Otro';
  return {
    id: String(story.id),
    type: 'historia',
    title: `${story.name || 'Amigo EMpaticos'} — ${story.type || 'EM'}`,
    content: story.story || '',
    mediaType: 'none',
    mediaUrl: '',
    mediaUrls: [],
    emType,
    tags: [],
    authorName: story.anonymous ? 'Anónimo' : (story.name || 'Anónimo'),
    isAnonymous: Boolean(story.anonymous),
    status: story.approved ? 'approved' : 'pending',
    reactions: EMPTY_REACTIONS(),
    comments: [],
    createdAt: story.createdAt || new Date().toISOString(),
  };
}

function filterEntries(entries, filters = {}) {
  let result = entries;
  if (filters.status) result = result.filter((e) => e.status === filters.status);
  if (filters.type) result = result.filter((e) => e.type === filters.type);
  if (filters.visitorId) result = result.filter((e) => e.visitorId === filters.visitorId);
  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ─────────────────────────────────────────────────────────────
// Backend JSON local (fallback para dev y tests)
// ─────────────────────────────────────────────────────────────

function readJson() {
  let content;
  try {
    content = fs.readFileSync(dataPath, 'utf-8');
  } catch (error) {
    return { entries: [], favorites: {} };
  }
  const data = JSON.parse(content);

  if (!Array.isArray(data.entries) && Array.isArray(data.stories)) {
    data.entries = data.stories.map(migrateStoryToEntry);
    delete data.stories;
  }
  if (!Array.isArray(data.entries)) data.entries = [];
  for (const entry of data.entries) normalizeEntry(entry);
  if (!data.favorites || typeof data.favorites !== 'object') data.favorites = {};
  return data;
}

function writeJson(data) {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

// ─────────────────────────────────────────────────────────────
// Helpers Firestore
// ─────────────────────────────────────────────────────────────

async function readComments(fdb, entryId) {
  const snap = await fdb
    .collection('entries')
    .doc(entryId)
    .collection('comments')
    .orderBy('createdAt', 'asc')
    .get();
  const comments = [];
  snap.forEach((doc) => comments.push({ id: doc.id, ...doc.data() }));
  return comments;
}

// ─────────────────────────────────────────────────────────────
// API de persistencia (contrato del Paso 3)
// ─────────────────────────────────────────────────────────────

async function getAllEntries(filters = {}) {
  if (USE_FIRESTORE) {
    const fdb = await getFirestore();
    let query = fdb.collection('entries');
    if (filters.status) query = query.where('status', '==', filters.status);
    const snap = await query.get();
    const entries = [];
    for (const doc of snap.docs) {
      const entry = normalizeEntry({ id: doc.id, ...doc.data() });
      entry.comments = await readComments(fdb, doc.id);
      entries.push(entry);
    }
    return filterEntries(entries, filters);
  }

  const data = readJson();
  return filterEntries(data.entries, filters);
}

async function getEntryById(id) {
  if (USE_FIRESTORE) {
    const fdb = await getFirestore();
    const doc = await fdb.collection('entries').doc(String(id)).get();
    if (!doc.exists) return null;
    const entry = normalizeEntry({ id: doc.id, ...doc.data() });
    entry.comments = await readComments(fdb, doc.id);
    return entry;
  }

  const data = readJson();
  const entry = data.entries.find((e) => String(e.id) === String(id));
  return entry ? normalizeEntry(entry) : null;
}

async function createEntry(data) {
  if (USE_FIRESTORE) {
    const fdb = await getFirestore();
    const { id, ...entry } = data;
    await fdb.collection('entries').doc(String(id)).set(normalizeEntry(entry));
    return getEntryById(id);
  }

  const store = readJson();
  store.entries.unshift(data);
  writeJson(store);
  return data;
}

async function updateEntry(id, patch) {
  if (USE_FIRESTORE) {
    const fdb = await getFirestore();
    const ref = fdb.collection('entries').doc(String(id));
    const doc = await ref.get();
    if (!doc.exists) return null;
    await ref.update(patch);
    return getEntryById(id);
  }

  const store = readJson();
  const entry = store.entries.find((e) => String(e.id) === String(id));
  if (!entry) return null;
  Object.assign(entry, patch);
  writeJson(store);
  return entry;
}

async function deleteEntry(id) {
  if (USE_FIRESTORE) {
    const fdb = await getFirestore();
    const ref = fdb.collection('entries').doc(String(id));
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  }

  const store = readJson();
  const before = store.entries.length;
  store.entries = store.entries.filter((e) => String(e.id) !== String(id));
  if (store.entries.length === before) return false;
  writeJson(store);
  return true;
}

async function addComment(entryId, comment) {
  if (USE_FIRESTORE) {
    const fdb = await getFirestore();
    const ref = fdb.collection('entries').doc(String(entryId));
    const doc = await ref.get();
    if (!doc.exists) return null;
    await ref.collection('comments').doc(comment.id).set(comment);
    return getEntryById(entryId);
  }

  const store = readJson();
  const entry = store.entries.find((e) => String(e.id) === String(entryId));
  if (!entry) return null;
  entry.comments = entry.comments || [];
  entry.comments.push(comment);
  writeJson(store);
  return entry;
}

async function deleteComment(entryId, commentId) {
  if (USE_FIRESTORE) {
    const fdb = await getFirestore();
    const ref = fdb.collection('entries').doc(String(entryId));
    const doc = await ref.get();
    if (!doc.exists) return null;
    await ref.collection('comments').doc(String(commentId)).delete();
    return getEntryById(entryId);
  }

  const store = readJson();
  const entry = store.entries.find((e) => String(e.id) === String(entryId));
  if (!entry) return null;
  const before = (entry.comments || []).length;
  entry.comments = (entry.comments || []).filter((c) => String(c.id) !== String(commentId));
  if (entry.comments.length === before) return null;
  writeJson(store);
  return entry;
}

async function addReaction(entryId, reactionType) {
  const entry = await getEntryById(entryId);
  if (!entry) return null;
  const reactions = entry.reactions || EMPTY_REACTIONS();
  reactions[reactionType] = Number(reactions[reactionType] || 0) + 1;
  return updateEntry(entryId, { reactions });
}

async function getFavorites(visitorId) {
  if (USE_FIRESTORE) {
    const fdb = await getFirestore();
    const doc = await fdb.collection('favorites').doc(String(visitorId)).get();
    return doc.exists && Array.isArray(doc.data().entryIds) ? doc.data().entryIds : [];
  }

  const store = readJson();
  return Array.isArray(store.favorites[visitorId]) ? store.favorites[visitorId] : [];
}

async function getAllFavorites() {
  if (USE_FIRESTORE) {
    const fdb = await getFirestore();
    const snap = await fdb.collection('favorites').get();
    const all = {};
    snap.forEach((doc) => {
      all[doc.id] = Array.isArray(doc.data().entryIds) ? doc.data().entryIds : [];
    });
    return all;
  }

  const store = readJson();
  return store.favorites;
}

async function addFavorite(visitorId, entryId) {
  const ids = await getFavorites(visitorId);
  if (!ids.includes(entryId)) ids.push(entryId);
  if (USE_FIRESTORE) {
    const fdb = await getFirestore();
    await fdb.collection('favorites').doc(String(visitorId)).set({ entryIds: ids });
  } else {
    const store = readJson();
    store.favorites[visitorId] = ids;
    writeJson(store);
  }
  return ids;
}

async function removeFavorite(visitorId, entryId) {
  const ids = await getFavorites(visitorId);
  const next = ids.filter((id) => String(id) !== String(entryId));
  if (USE_FIRESTORE) {
    const fdb = await getFirestore();
    await fdb.collection('favorites').doc(String(visitorId)).set({ entryIds: next });
  } else {
    const store = readJson();
    store.favorites[visitorId] = next;
    writeJson(store);
  }
  return next;
}

async function getStats() {
  const all = await getAllEntries();
  const approved = all.filter((e) => e.status === 'approved');
  const totalReactions = approved.reduce(
    (acc, e) => acc + (e.reactions?.hearts || 0) + (e.reactions?.laughs || 0) + (e.reactions?.hugs || 0),
    0
  );
  const totalComments = approved.reduce((acc, e) => acc + (e.comments ? e.comments.length : 0), 0);
  const favorites = await getAllFavorites();
  const totalFavorites = Object.values(favorites).reduce(
    (acc, ids) => acc + (Array.isArray(ids) ? ids.length : 0),
    0
  );
  const byType = {};
  for (const type of ['historia', 'anecdota', 'video', 'diagnostico', 'galeria']) {
    byType[type] = approved.filter((e) => e.type === type).length;
  }
  return {
    total: approved.length,
    totalAll: all.length,
    pending: all.filter((e) => e.status === 'pending').length,
    totalReactions,
    totalComments,
    totalFavorites,
    byType,
  };
}

/**
 * Migración única: copia data/db.json a Firestore.
 * Comentarios van a la subcolección; favoritos a la colección favorites.
 */
async function migrateFromJson() {
  if (!USE_FIRESTORE) {
    throw new Error('Firestore no está configurado. Definí FIREBASE_SERVICE_ACCOUNT.');
  }
  const store = readJson();
  const fdb = await getFirestore();
  const entriesCol = fdb.collection('entries');

  const existing = await entriesCol.limit(1).get();
  if (!existing.empty) {
    throw new Error('Firestore ya contiene entradas. La migración se ejecuta una sola vez.');
  }

  const batch = fdb.batch();
  for (const entry of store.entries) {
    const { id, comments = [], ...rest } = entry;
    const ref = entriesCol.doc(String(id));
    batch.set(ref, normalizeEntry(rest));
    for (const comment of comments) {
      const { id: commentId, ...commentData } = comment;
      ref.collection('comments').doc(String(commentId)).set(commentData);
    }
  }
  for (const [visitorId, ids] of Object.entries(store.favorites || {})) {
    fdb.collection('favorites').doc(String(visitorId)).set({ entryIds: ids });
  }

  await batch.commit();
  return { migrated: store.entries.length };
}

function ensureData() {
  if (!USE_FIRESTORE) {
    try {
      fs.accessSync(dataPath);
    } catch (error) {
      writeJson({ entries: [], favorites: {} });
    }
  }
}

module.exports = {
  USE_FIRESTORE,
  ensureData,
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  addComment,
  deleteComment,
  addReaction,
  getFavorites,
  getAllFavorites,
  addFavorite,
  removeFavorite,
  getStats,
  migrateFromJson,
};
