import React, { useState } from 'react';
import { addComment, deleteComment, formatDate, initialsOf } from '../api';
import { useProfile } from '../context/ProfileContext';

/**
 * Comments renders the comment thread of an entry and a form to add new ones.
 */
export default function Comments({ entryId, comments, onError, adminPassword }) {
  const { profile, visitorId, isComplete, openModal } = useProfile();
  const [items, setItems] = useState(comments || []);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    setError('');
    try {
      const data = await addComment(entryId, {
        authorName: profile.name || 'Anónimo',
        avatar: profile.avatar || null,
        visitorId,
        text: text.trim(),
      });
      setItems(data.entry.comments || []);
      setText('');
    } catch (err) {
      setError(err.message || 'No se pudo enviar el comentario.');
      if (onError) onError(err);
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(commentId) {
    try {
      const data = await deleteComment(entryId, commentId, adminPassword);
      setItems(data.entry.comments || []);
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el comentario.');
    }
  }

  return (
    <div className="comments">
      <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
        💬 Comentarios
        {items.length > 0 && <span className="comment-count">{items.length}</span>}
      </h6>

      {items.length === 0 ? (
        <p className="text-muted small mb-3">Todavía no hay comentarios. ¡Sé la primera persona en acompañar!</p>
      ) : (
        <div className="comment-list mb-3">
          {items.map((comment) => (
            <div key={comment.id} className="comment-item">
              <span className="comment-avatar" aria-hidden="true">
                {comment.avatar || initialsOf(comment.authorName)}
              </span>
              <div className="comment-body">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="fw-bold comment-author">{comment.authorName || 'Anónimo'}</span>
                  <small className="text-muted">{formatDate(comment.createdAt)}</small>
                  {adminPassword && (
                    <button
                      type="button"
                      className="comment-delete"
                      onClick={() => handleDelete(comment.id)}
                      aria-label="Eliminar comentario"
                      title="Eliminar comentario"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="mb-0 comment-text">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isComplete ? (
        <div className="comment-cta">
          <span>¿Querés comentar? </span>
          <button type="button" className="btn btn-warning btn-sm fw-bold" onClick={openModal}>
            Configurá tu perfil
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            className="form-control"
            rows="2"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Comentá como ${profile.name}...`}
            maxLength="2000"
          />
          {error && <p className="text-danger small mt-2 mb-0">{error}</p>}
          <div className="d-flex justify-content-end mt-2">
            <button type="submit" className="btn btn-warning btn-sm fw-bold px-3" disabled={sending || !text.trim()}>
              {sending ? 'Enviando...' : 'Comentar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
