import React, { useState } from 'react';
import { useProfile, AVATAR_EMOJIS } from '../context/ProfileContext';

/**
 * ProfileModal lets the visitor set their display name and avatar emoji.
 * Se usa para comentar y publicar con una identidad simple.
 */
export default function ProfileModal() {
  const { profile, updateProfile, modalOpen, closeModal } = useProfile();
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);

  function handleSave(event) {
    event.preventDefault();
    updateProfile({ name: name.trim(), avatar });
    closeModal();
  }

  return (
    <>
      {modalOpen && <div className="modal-backdrop fade show" />}
      <div className={`modal fade ${modalOpen ? 'show d-block' : ''}`} tabIndex="-1" id="modalPerfil" aria-hidden={!modalOpen}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow-lg">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold fs-4 ms-2 mt-2">Tu perfil en EMpaticos 👋</h5>
              <button type="button" className="btn-close me-2 mt-2" onClick={closeModal} aria-label="Cerrar" />
            </div>
            <div className="modal-body p-4">
              <p className="text-muted mb-4">Elegí cómo querés aparecer en comentarios y publicaciones.</p>

              <label className="form-label">Tu nombre (o apodo)</label>
              <input
                type="text"
                className="form-control mb-4"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Maru, el tío Jorge, ..."
                maxLength="80"
              />

              <label className="form-label">Tu avatar</label>
              <div className="avatar-picker mb-4">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`avatar-option ${avatar === emoji ? 'active' : ''}`}
                    onClick={() => setAvatar(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary flex-fill fw-bold" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-warning flex-fill fw-bold btn-glow" onClick={handleSave}>
                  Guardar perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
