import React, { useState } from 'react';
import { TYPE_LABELS, formatDate, initialsOf, resolveMediaUrl } from '../api';
import Reactions from './Reactions';
import FavoriteButton from './FavoriteButton';
import ShareButtons from './ShareButtons';
import Comments from './Comments';

const TYPE_BADGE = {
  historia: 'badge-type badge-historia',
  anecdota: 'badge-type badge-anecdota',
  video: 'badge-type badge-video',
  diagnostico: 'badge-type badge-diagnostico',
  galeria: 'badge-type badge-galeria',
};

const AVATAR_TONE = {
  historia: 'avatar-naranja',
  anecdota: 'avatar-risa',
  video: 'avatar-azul',
  diagnostico: 'avatar-verde',
  galeria: 'avatar-galeria',
};

/**
 * EntradaCard renders a single community entry including its media,
 * badges, tags, reactions, favorites, sharing and comments.
 */
export default function EntradaCard({ entry, showStatus, onError, children, hideComments, adminPassword }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const badges = entry.tags || [];
  const typeLabel = TYPE_LABELS[entry.type] || entry.type || 'Entrada';
  const typeClass = TYPE_BADGE[entry.type] || 'badge-type';
  const avatarClass = AVATAR_TONE[entry.type] || 'avatar-naranja';
  const commentCount = (entry.comments || []).length;

  function renderMedia() {
    if (entry.type === 'galeria' && entry.mediaUrls && entry.mediaUrls.length > 0) {
      const preview = entry.mediaUrls.slice(0, 3);
      const remaining = entry.mediaUrls.length - preview.length;
      return (
        <div className="entrada-gallery">
          {preview.map((url, i) => (
            <div key={url} className="entrada-gallery-item">
              <img src={resolveMediaUrl(url)} alt={`${entry.title || 'Galería'} ${i + 1}`} loading="lazy" />
              {i === preview.length - 1 && remaining > 0 && (
                <span className="entrada-gallery-more">+{remaining}</span>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (entry.mediaType === 'youtube' && entry.mediaUrl) {
      return (
        <div className="entrada-media ratio ratio-16x9">
          <iframe
            src={entry.mediaUrl}
            title={entry.title || 'Video de la comunidad'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (entry.mediaType === 'image' && entry.mediaUrl) {
      return (
        <div className="entrada-media">
          <img src={resolveMediaUrl(entry.mediaUrl)} alt={entry.title || 'Imagen de la comunidad'} loading="lazy" />
        </div>
      );
    }

    if (entry.mediaType === 'audio' && entry.mediaUrl) {
      const isEmbed = entry.mediaUrl.includes('/embed/') || entry.mediaUrl.includes('anchor.fm');
      return (
        <div className="entrada-media entrada-audio">
          {isEmbed ? (
            <iframe
              src={entry.mediaUrl}
              title={entry.title || 'Audio de la comunidad'}
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          ) : (
            <audio controls preload="none" src={resolveMediaUrl(entry.mediaUrl)} className="w-100" />
          )}
        </div>
      );
    }

    return null;
  }

  return (
    <article className="card card-modern entrada-card h-100 d-flex flex-column">
      {renderMedia()}

      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
          <span className={typeClass}>{typeLabel}</span>
          {entry.emType && <span className="badge bg-light border text-dark fw-bold">{entry.emType}</span>}
          {showStatus && (
            <span className={`badge ${entry.status === 'approved' ? 'bg-success' : 'bg-warning text-dark'} fw-bold`}>
              {entry.status === 'approved' ? 'Aprobada' : 'Pendiente'}
            </span>
          )}
        </div>

        <div className="d-flex align-items-center gap-3 mb-3">
          <span className={`avatar-circle ${avatarClass}`}>{initialsOf(entry.authorName)}</span>
          <div className="flex-grow-1">
            <h5 className="card-title fw-bold mb-0 entrada-author">{entry.authorName || 'Amigo EMpaticos'}</h5>
            <small className="text-muted fw-bold">🗓️ {formatDate(entry.createdAt)}</small>
          </div>
          <FavoriteButton entryId={entry.id} />
        </div>

        {entry.title && <h4 className="entrada-title fw-bold mb-2">{entry.title}</h4>}
        <p className="card-text entrada-content flex-grow-1 mb-4" style={{ whiteSpace: 'pre-wrap' }}>
          {entry.content}
        </p>

        {badges.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mb-3">
            {badges.map((tag) => (
              <span key={tag} className="tag-chip">#{tag}</span>
            ))}
          </div>
        )}

        {children}
      </div>

      <footer className="card-footer bg-transparent border-0 mt-auto px-4 pb-3 pt-0">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <Reactions entryId={entry.id} reactions={entry.reactions} onError={onError} />
          <button
            type="button"
            className="comments-toggle"
            onClick={() => setCommentsOpen((open) => !open)}
            aria-expanded={commentsOpen}
          >
            💬 Comentarios
            {commentCount > 0 && <span className="comment-count">{commentCount}</span>}
          </button>
        </div>

        <div className="entrada-footer-extra d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3 pt-3">
          <ShareButtons title={entry.title || typeLabel} />
        </div>

        {!hideComments && commentsOpen && (
          <div className="comments-wrap mt-3">
            <Comments entryId={entry.id} comments={entry.comments} onError={onError} adminPassword={adminPassword} />
          </div>
        )}
      </footer>
    </article>
  );
}
