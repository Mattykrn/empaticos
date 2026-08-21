import React from 'react';
import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import FontSizeControl from './FontSizeControl';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Unirme ✍️', path: '/unirme' },
  { label: 'Historias', path: '/historias' },
  { label: 'Anécdotas', path: '/anecdotas' },
  { label: 'Noticias', path: '/noticias' },
  { label: 'Videos', path: '/videos' },
  { label: 'Galería', path: '/galeria' },
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Admin', path: '/admin' }
];

/**
 * Header renders the top navigation bar and the support/Instagram buttons.
 * It uses NavLink so the app can navigate without full page reloads.
 */
export default function Header({ darkMode, onToggleTheme }) {
  return (
    <header>
      <nav className="navbar navbar-expand-xl fixed-top navbar-compact">
        <div className="container-fluid">
          <NavLink to="/" className="navbar-brand d-flex align-items-center gap-2">
            <img
              src="/images/LogoEMpaticos2.png"
              alt="EMpaticos"
              className="navbar-logo"
              onError={(e) => {
                // Si la imagen falla, mostrar badge con emoji en vez de ícono roto
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextSibling.style.display = 'flex';
              }}
            />
            <span className="navbar-logo-fallback" style={{ display: 'none' }} aria-hidden="true">🧡</span>
            <span className="fw-bold navbar-brand-text">EMpaticos</span>
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Mostrar navegación"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center flex-nowrap">
              {navItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-link fw-bold ${isActive ? 'active' : ''}`}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li className="nav-item navbar-utils ms-xl-3 ps-xl-2 ps-0">
                <FontSizeControl />
                <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />
                <a
                  className="nav-link navbar-social mx-1 p-0"
                  href="https://instagram.com/em.paticos2026"
                  target="_blank"
                  rel="noreferrer"
                  title="Nuestro Instagram"
                  aria-label="Nuestro Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.036 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                  </svg>
                </a>
                <button className="btn btn-warning rounded-pill px-3 ms-1 fw-bold shadow-sm btn-glow" data-bs-toggle="modal" data-bs-target="#modalApoyo">
                  Apoyarnos 🤎
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
