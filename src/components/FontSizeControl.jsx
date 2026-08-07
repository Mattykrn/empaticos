import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'empaticos-font-scale';
const MIN = 0.85;
const MAX = 1.3;
const STEP = 0.1;

/**
 * FontSizeControl ajusta el tamaño de fuente de todo el sitio (accesibilidad).
 * Escala el font-size del elemento <html>; el resto del CSS usa unidades rem.
 */
export default function FontSizeControl() {
  const [scale, setScale] = useState(() => {
    const stored = parseFloat(window.localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(stored) ? Math.min(MAX, Math.max(MIN, stored)) : 1;
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${scale}rem`;
    window.localStorage.setItem(STORAGE_KEY, String(scale));
  }, [scale]);

  const change = (delta) => {
    setScale((prev) => Math.min(MAX, Math.max(MIN, Number((prev + delta).toFixed(2)))));
  };

  return (
    <div className="btn-group font-scale-control" role="group" aria-label="Tamaño de texto">
      <button
        type="button"
        className="btn btn-outline-dark btn-sm fw-bold font-scale-btn"
        onClick={() => change(-STEP)}
        aria-label="Reducir tamaño de texto"
        title="Reducir tamaño de texto"
      >
        A−
      </button>
      <button
        type="button"
        className="btn btn-outline-dark btn-sm fw-bold font-scale-btn"
        onClick={() => setScale(1)}
        aria-label="Restablecer tamaño de texto"
        title="Restablecer tamaño de texto"
      >
        A
      </button>
      <button
        type="button"
        className="btn btn-outline-dark btn-sm fw-bold font-scale-btn"
        onClick={() => change(STEP)}
        aria-label="Aumentar tamaño de texto"
        title="Aumentar tamaño de texto"
      >
        A+
      </button>
    </div>
  );
}
