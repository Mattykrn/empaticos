import React from 'react';

/**
 * ThemeToggle is a button that allows users to toggle between light and dark modes.
 */
export default function ThemeToggle({ darkMode, onToggle }) {
  const icon = darkMode ? '☀️' : '🌙';
  const label = darkMode ? 'Modo claro' : 'Modo oscuro';
  return (
    <button
      type="button"
      className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary'} btn-sm rounded-pill btn-glow d-flex align-items-center gap-2`}
      onClick={onToggle}
      title="Cambiar modo claro/oscuro"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
