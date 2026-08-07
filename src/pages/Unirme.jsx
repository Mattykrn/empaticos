import React, { useState } from 'react';
import { createEntry, fileToUpload, EM_TYPES, API_BASE } from '../api';
import { useProfile } from '../context/ProfileContext';

const TYPE_OPTIONS = [
  { value: 'historia', label: 'Historia', emoji: '❤️', hint: 'Tu testimonio de vida' },
  { value: 'anecdota', label: 'Anécdota', emoji: '😂', hint: 'Un momento gracioso' },
  { value: 'video', label: 'Video', emoji: '🎬', hint: 'Un video de YouTube' },
  { value: 'galeria', label: 'Galería', emoji: '📷', hint: 'Compartí fotos' },
  { value: 'audio', label: 'Audio', emoji: '🎙️', hint: 'Un audio o podcast' },
];

const EMPTY_FORM = {
  type: 'historia',
  title: '',
  content: '',
  emType: '',
  mediaUrl: '',
  tags: '',
  authorName: '',
  isAnonymous: false,
};

/**
 * Unirme page: formulario para publicar historias, anécdotas, videos,
 * galerías y audios. Las entradas quedan en estado "pendiente" hasta la
 * moderación del admin.
 */
export default function Unirme() {
  const { profile, visitorId, isComplete, openModal } = useProfile();
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    authorName: profile.name || '',
  }));
  const [mediaUrls, setMediaUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function selectType(value) {
    setForm((prev) => ({ ...prev, type: value, mediaUrl: '' }));
  }

  async function handleFiles(files) {
    setUploading(true);
    setUploadError('');
    try {
      const list = [...files].slice(0, 8 - mediaUrls.length);
      const results = [];
      for (const file of list) {
        const data = await fileToUpload(file);
        results.push(data.url);
      }
      setMediaUrls((prev) => [...prev, ...results]);
    } catch (error) {
      setUploadError(error.message || 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  }

  function removeMediaUrl(url) {
    setMediaUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    setStatus({ type: '', text: 'Enviando...' });

    try {
      let mediaType = 'none';
      let mediaUrl = form.mediaUrl.trim();
      if (form.type === 'video') mediaType = 'youtube';
      else if (form.type === 'audio') mediaType = 'audio';
      else if (mediaUrl) mediaType = 'image';

      await createEntry({
        type: form.type,
        title: form.title,
        content: form.content,
        mediaType,
        mediaUrl,
        mediaUrls: form.type === 'galeria' ? mediaUrls : [],
        emType: form.emType || null,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        authorName: form.authorName,
        isAnonymous: form.isAnonymous,
        visitorId,
      });

      setForm({ ...EMPTY_FORM, authorName: profile.name || '' });
      setMediaUrls([]);
      setStatus({
        type: 'success',
        text: '¡Gracias por compartir! Tu publicación quedó en revisión y aparecerá pronto en la comunidad.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        text: error.message || 'No se pudo enviar. Asegurate de que el backend esté activo.',
      });
    } finally {
      setSending(false);
    }
  }

  const activeType = TYPE_OPTIONS.find((o) => o.value === form.type);

  return (
    <main className="container py-5 section-card">
      <div className="page-heading text-center mb-5">
        <h1 className="fw-bold display-5">Unirme a EMpaticos ❤️</h1>
        <p className="lead text-muted">Compartí tu historia, una anécdota, fotos, un video o un podcast.</p>
      </div>

      {!isComplete && (
        <div className="alert alert-warning text-center mx-auto" style={{ maxWidth: 560 }}>
          <span className="me-2">Te recomendamos configurar tu perfil para que tus publicaciones tengan tu nombre.</span>
          <button type="button" className="btn btn-warning btn-sm fw-bold" onClick={openModal}>
            Configurar perfil
          </button>
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card card-modern form-card shadow-sm p-4">
            <form onSubmit={handleSubmit}>
              <label className="form-label">¿Qué querés compartir?</label>
              <div className="segmented mb-4" role="group" aria-label="Tipo de contenido">
                {TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`segmented-btn ${form.type === option.value ? 'active' : ''}`}
                    onClick={() => selectType(option.value)}
                  >
                    <span className="d-block fs-3">{option.emoji}</span>
                    <span className="fw-bold">{option.label}</span>
                    <small className="d-block text-muted">{option.hint}</small>
                  </button>
                ))}
              </div>

              <div className="mb-3">
                <label htmlFor="title" className="form-label">Título (opcional)</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  placeholder="Ej: Mi primer año con EM"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="content" className="form-label">
                  {form.type === 'video' || form.type === 'audio' ? 'Descripción *' : 'Tu contenido *'}
                </label>
                <textarea
                  className="form-control"
                  id="content"
                  name="content"
                  rows="6"
                  required
                  placeholder={
                    form.type === 'anecdota'
                      ? 'Contanos esa situación graciosa que solo quienes vivimos esto podemos entender...'
                      : form.type === 'galeria'
                        ? 'Contanos qué muestran estas fotos y por qué son especiales...'
                        : 'Contanos tu experiencia con tus propias palabras...'
                  }
                  value={form.content}
                  onChange={handleChange}
                />
              </div>

              {form.type === 'video' && (
                <div className="mb-3">
                  <label htmlFor="mediaUrl" className="form-label">Link de YouTube *</label>
                  <input
                    type="url"
                    className="form-control"
                    id="mediaUrl"
                    name="mediaUrl"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={form.mediaUrl}
                    onChange={handleChange}
                  />
                </div>
              )}

              {form.type === 'audio' && (
                <div className="mb-3">
                  <label htmlFor="mediaUrl" className="form-label">Link del audio o podcast</label>
                  <input
                    type="url"
                    className="form-control"
                    id="mediaUrl"
                    name="mediaUrl"
                    placeholder="https://open.spotify.com/embed/episode/... o https://ejemplo.com/audio.mp3"
                    value={form.mediaUrl}
                    onChange={handleChange}
                  />
                  <small className="form-text">Podés pegar un embed de Spotify, Anchor o un archivo de audio directo (.mp3).</small>
                </div>
              )}

              {form.type === 'galeria' && (
                <div className="mb-3">
                  <label className="form-label">Fotos de tu galería</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    disabled={uploading}
                  />
                  {uploadError && <p className="text-danger small mt-2 mb-0">{uploadError}</p>}
                  {uploading && <p className="text-muted small mt-2 mb-0">Subiendo imágenes...</p>}
                  {mediaUrls.length > 0 && (
                    <div className="upload-preview mt-3">
                      {mediaUrls.map((url) => (
                        <div key={url} className="upload-preview-item">
                          <img src={`${API_BASE.replace(/\/api$/, '')}${url}`} alt="Vista previa" loading="lazy" />
                          <button type="button" className="upload-preview-remove" onClick={() => removeMediaUrl(url)} aria-label="Quitar imagen">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(form.type === 'historia' || form.type === 'anecdota') && (
                <div className="mb-3">
                  <label htmlFor="mediaUrl" className="form-label">URL de imagen (opcional)</label>
                  <input
                    type="url"
                    className="form-control"
                    id="mediaUrl"
                    name="mediaUrl"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={form.mediaUrl}
                    onChange={handleChange}
                  />
                </div>
              )}

              {form.type === 'historia' && (
                <div className="mb-3">
                  <label htmlFor="emType" className="form-label">Tipo de Esclerosis Múltiple (opcional)</label>
                  <select
                    className="form-select"
                    id="emType"
                    name="emType"
                    value={form.emType}
                    onChange={handleChange}
                  >
                    <option value="">No quiero especificar</option>
                    {EM_TYPES.map((em) => (
                      <option key={em} value={em}>{em}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="tags" className="form-label">Etiquetas (opcional, separadas por coma)</label>
                <input
                  type="text"
                  className="form-control"
                  id="tags"
                  name="tags"
                  placeholder="Ej: humor, familia, ejercicio"
                  value={form.tags}
                  onChange={handleChange}
                />
              </div>

              <div className="row g-3">
                <div className="col-md-8">
                  <label htmlFor="authorName" className="form-label">Tu nombre (opcional)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="authorName"
                    name="authorName"
                    placeholder="Ej: Matías"
                    value={form.authorName}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <div className="form-check mb-1">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="anonimo-checkbox"
                      name="isAnonymous"
                      checked={form.isAnonymous}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="anonimo-checkbox">Permanecer anónimo</label>
                  </div>
                </div>
              </div>

              <div className="text-center mt-4">
                <button type="submit" className="btn btn-warning btn-lg px-5 btn-glow" disabled={sending || uploading}>
                  {sending ? 'Enviando...' : `Publicar ${activeType.label.toLowerCase()}`}
                </button>
              </div>
            </form>

            {status.text && (
              <p className={`text-center mt-4 fw-bold ${status.type === 'error' ? 'text-danger' : 'text-success'}`}>
                {status.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
