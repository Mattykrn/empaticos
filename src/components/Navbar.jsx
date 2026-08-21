import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModalUnirme from './ModalUnirme';

// En este componente Navbar/Header integro la barra de navegación responsive y la lógica visual del botón "Unirme" y estado de sesión
const Navbar = () => {
  // Consumo los datos de autenticación global desde mi AuthContext
  const { usuario, estaAutenticado, logout } = useAuth();

  // Estado local para abrir o cerrar el ModalUnirme
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <>
      <nav className="navbar navbar-expand-xl fixed-top navbar-compact bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container-fluid px-4">
          {/* Marca / Logotipo principal de la plataforma Empáticos */}
          <NavLink to="/" className="navbar-brand d-flex align-items-center gap-2">
            <img
              src="/images/LogoEMpaticos2.png"
              alt="EMpaticos"
              className="navbar-logo"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
              }}
            />
            <span className="navbar-logo-fallback" style={{ display: 'none' }}>🧡</span>
            <span className="fw-bold navbar-brand-text text-teal-600 dark:text-teal-400">EMpaticos</span>
          </NavLink>

          {/* Menú de navegación principal */}
          <div className="d-flex align-items-center gap-3 ms-auto">
            <ul className="navbar-nav d-none d-lg-flex align-items-center gap-3">
              <li className="nav-item">
                <NavLink to="/" className={({ isActive }) => `nav-link fw-bold ${isActive ? 'active text-teal-600' : ''}`}>
                  Inicio
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/historias" className={({ isActive }) => `nav-link fw-bold ${isActive ? 'active text-teal-600' : ''}`}>
                  Historias
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/anecdotas" className={({ isActive }) => `nav-link fw-bold ${isActive ? 'active text-teal-600' : ''}`}>
                  Anécdotas
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/noticias" className={({ isActive }) => `nav-link fw-bold ${isActive ? 'active text-teal-600' : ''}`}>
                  Noticias
                </NavLink>
              </li>
            </ul>

            {/* Sección condicional: Muestro el botón "Unirme" si no hay sesión, o el perfil si está autenticado */}
            {!estaAutenticado ? (
              <button
                onClick={() => setModalAbierto(true)}
                className="btn btn-teal bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-pill px-4 py-2 shadow-sm transition-all flex items-center gap-2"
              >
                <span>Unirme</span>
                <span className="text-lg">✍️</span>
              </button>
            ) : (
              <div className="d-flex align-items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-pill px-3 py-1 border border-slate-200 dark:border-slate-700">
                {/* Avatar del usuario o imagen por defecto */}
                <img
                  src={usuario?.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={usuario?.nombre}
                  className="w-8 h-8 rounded-full object-cover border border-teal-500"
                />
                
                {/* Nombre y Badge de Rol del usuario logueado */}
                <div className="d-none d-sm-block text-start">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    {usuario?.nombre || 'Miembro Empáticos'}
                  </div>
                  <span className="inline-block text-[10px] uppercase font-semibold text-teal-700 dark:text-teal-300">
                    {usuario?.rol || 'paciente'}
                  </span>
                </div>

                {/* Botón de cierre de sesión */}
                <button
                  onClick={logout}
                  className="btn btn-link text-slate-500 hover:text-rose-600 p-1 text-sm font-semibold transition-colors"
                  title="Cerrar sesión"
                >
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ModalUnirme renderizado y controlado por el estado local */}
      <ModalUnirme
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
      />
    </>
  );
};

export default Navbar;
