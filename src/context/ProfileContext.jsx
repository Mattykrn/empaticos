import React, { createContext, useContext, useState, useCallback } from 'react';

const ProfileContext = createContext(null);

const PROFILE_KEY = 'empaticos-profile';
const VISITOR_KEY = 'empaticos-visitor';

export const AVATAR_EMOJIS = ['😊', '🌈', '💪', '🌻', '🦋', '🐝', '🌟', '🫶'];

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    // perfil inválido, ignorar
  }
  return { name: '', avatar: '' };
}

function loadVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch (err) {
    return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

/**
 * ProfileProvider gestiona la identidad simple del visitante:
 * un nombre, un avatar emoji y un ID anónimo persistente.
 */
export function ProfileProvider({ children }) {
  const [profile, setProfileState] = useState(loadProfile);
  const [visitorId] = useState(loadVisitorId);
  const [modalOpen, setModalOpen] = useState(false);

  const updateProfile = useCallback((next) => {
    const updated = { name: next.name || '', avatar: next.avatar || '' };
    setProfileState(updated);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    } catch (err) {
      // almacenamiento no disponible
    }
  }, []);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const displayName = profile.name || 'Anónimo';
  const isComplete = Boolean(profile.name);

  return (
    <ProfileContext.Provider
      value={{ profile, updateProfile, visitorId, displayName, isComplete, modalOpen, openModal, closeModal }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile debe usarse dentro de ProfileProvider');
  }
  return ctx;
}
