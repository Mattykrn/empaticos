import React from 'react';
import { useAuth } from '../context/AuthContext';

// Navbar
export const Navbar = () => {
  const { usuario, estaAutenticado, logout, abrirModalRegistro } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo de Empáticos */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="font-black text-xl sm:text-2xl tracking-tight text-amber-600">Empáticos</span>
        </div>

        {/* Zona de Usuario registrado o Botón Unirme */}
        <div className="flex items-center gap-3">
          {estaAutenticado && usuario ? (
            <div className="flex items-center gap-3 bg-amber-50/60 p-1.5 pr-3 rounded-full border border-amber-100">
              <img
                src={usuario.fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={usuario.nombre}
                className="w-8 h-8 rounded-full object-cover border border-amber-300"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-800 leading-none">{usuario.nombre}</p>
                <span className="text-[10px] text-amber-700 capitalize font-medium">{usuario.rol || 'paciente'}</span>
              </div>
              <button
                onClick={logout}
                title="Cerrar Sesión"
                className="ml-1 text-gray-400 hover:text-red-500 text-xs font-bold transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={abrirModalRegistro}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-full text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all transform hover:scale-105 active:scale-95"
            >
              Unirme
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;