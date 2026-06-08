import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Import pages
import Home from './pages/Home';
import Noticias from './pages/Noticias';
import Historias from './pages/Historias';
import Unirme from './pages/Unirme';
import Nosotros from './pages/Nosotros';
import Admin from './pages/Admin';

// Import components
import Header from './components/Header';
import Footer from './components/Footer';
import SupportModal from './components/SupportModal';
import ScrollToTop from './components/ScrollToTop';

/**
 * NotFound page for unmatched routes.
 */
function NotFound() {
  return (
    <main className="container py-5 section-card text-center">
      <div className="card card-modern p-5 border-0 mx-auto" style={{ maxWidth: 720 }}>
        <h1 className="display-5 fw-bold mb-4">Página no encontrada</h1>
        <p className="lead text-muted mb-4">Esa ruta no existe todavía. Volvé al inicio y seguí navegando.</p>
        <a href="#/" className="btn btn-warning btn-lg px-4 btn-glow">Volver al home</a>
      </div>
    </main>
  );
}

/**
 * App contains the shared layout, theme state, and route definitions.
 */
export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = window.localStorage.getItem('empaticos-theme');
    if (stored === 'dark' || stored === 'light') {
      return stored === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const themeValue = darkMode ? 'dark' : 'light';
    document.documentElement.dataset.theme = themeValue;
    window.localStorage.setItem('empaticos-theme', themeValue);
  }, [darkMode]);

  const handleToggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <>
      <ScrollToTop />
      <Header darkMode={darkMode} onToggleTheme={handleToggleTheme} />
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/historias" element={<Historias />} />
          <Route path="/unirme" element={<Unirme />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <SupportModal />
      <Footer />
    </>
  );
}
