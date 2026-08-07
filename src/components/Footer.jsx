import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Footer displayed on every page.
 */
export default function Footer() {
  return (
    <footer>
      <div className="container py-5">
        <p className="fs-5 mb-2">EMpaticos © 2026 – No estás solo ❤️</p>
        <div className="d-flex justify-content-center gap-3 flex-wrap mb-3">
          <NavLink to="/galeria" className="text-white fw-bold text-decoration-none">Galería</NavLink>
          <span className="text-white-50">·</span>
          <NavLink to="/perfil" className="text-white fw-bold text-decoration-none">Mi perfil</NavLink>
          <span className="text-white-50">·</span>
          <NavLink to="/admin" className="text-white fw-bold text-decoration-none">Admin</NavLink>
        </div>
        <p className="mb-0">Contactanos: matii.toorres.06@gmail.com</p>
      </div>
    </footer>
  );
}
