import React from 'react';

/**
 * ThemeToggle es un botón de ícono que alterna entre modo claro y oscuro.
 */
export default function ThemeToggle({ darkMode, onToggle }) {
  const icon = darkMode ? '☀️' : '🌙';
  const label = darkMode ? 'Modo claro' : 'Modo oscuro';
  return (
    <button
      type="button"
      className="btn btn-outline-dark btn-sm rounded-circle btn-glow theme-toggle"
      onClick={onToggle}
      title={label}
      aria-label={label}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
