import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSpeech } from '../context/SpeechContext';

const CLAVE_PREFERENCIAS = 'empaticos-accesibilidad-v1';

const PREFERENCIAS_BASE = {
  tamanoTexto: 'normal',
  altoContraste: false,
  espaciadoLectura: false,
  sinAnimaciones: false
};

const TAMANOS_TEXTO = [
  { id: 'normal', etiqueta: 'Normal', escala: '100%' },
  { id: 'grande', etiqueta: 'Grande +15%', escala: '115%' },
  { id: 'extra', etiqueta: 'Extra +30%', escala: '130%' }
];

const leerPreferencias = () => {
  if (typeof window === 'undefined') return PREFERENCIAS_BASE;
  let guardadas = null;
  try {
    guardadas = window.localStorage.getItem(CLAVE_PREFERENCIAS);
  } catch {
    guardadas = null;
  }

  if (guardadas) {
    try {
      return { ...PREFERENCIAS_BASE, ...JSON.parse(guardadas) };
    } catch {
      return PREFERENCIAS_BASE;
    }
  }

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return { ...PREFERENCIAS_BASE, sinAnimaciones: true };
  }

  return PREFERENCIAS_BASE;
};

export default function AccessibilityToolbar() {
  const [abierto, setAbierto] = useState(false);
  const [preferencias, setPreferencias] = useState(leerPreferencias);
  const botonRef = useRef(null);
  const panelRef = useRef(null);
  const { soportado, hablando, enPausa, hablar, pausar, reanudar, detener } = useSpeech();

  useEffect(() => {
    const raiz = document.documentElement;
    const escala = TAMANOS_TEXTO.find((opcion) => opcion.id === preferencias.tamanoTexto)?.escala || '100%';
    raiz.style.fontSize = escala;
    raiz.dataset.textScale = preferencias.tamanoTexto;
    raiz.dataset.contraste = preferencias.altoContraste ? 'alto' : 'normal';
    raiz.dataset.espaciado = preferencias.espaciadoLectura ? 'amplio' : 'normal';
    raiz.dataset.movimiento = preferencias.sinAnimaciones ? 'reducido' : 'normal';

    try {
      window.localStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify(preferencias));
    } catch {
      return undefined;
    }
  }, [preferencias]);

  const cerrar = useCallback(() => {
    setAbierto(false);
    window.requestAnimationFrame(() => botonRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!abierto) return undefined;
    window.requestAnimationFrame(() => panelRef.current?.querySelector('button')?.focus());
    return undefined;
  }, [abierto]);

  const actualizar = useCallback((clave, valor) => {
    setPreferencias((actuales) => ({ ...actuales, [clave]: valor }));
  }, []);

  const manejarTeclado = (evento) => {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      cerrar();
      return;
    }

    if (evento.key !== 'Tab') return;

    const enfocables = panelRef.current?.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!enfocables?.length) return;

    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];

    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  };

  const leerPagina = () => {
    const principal = document.getElementById('main-content');
    const contenido = principal?.innerText?.trim();
    hablar(contenido ? `Contenido principal de Empáticos. ${contenido}` : 'No hay contenido disponible para leer.', 'es-AR');
  };

  const estadoVoz = useMemo(() => {
    if (!soportado) return 'La lectura por voz no está disponible en este navegador.';
    if (hablando && enPausa) return 'Lectura en pausa.';
    if (hablando) return 'Leyendo el contenido en voz alta.';
    return 'Sin lectura activa.';
  }, [enPausa, hablando, soportado]);

  const claseBoton = 'min-h-12 rounded-xl px-4 py-2 text-sm font-bold transition-colors';
  const claseActivo = 'bg-amber-400 text-slate-900';
  const claseInactivo = 'bg-white text-slate-700 border border-amber-200 hover:bg-amber-50';

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3">
      {abierto && (
        <div
          ref={panelRef}
          id="panel-accesibilidad"
          role="dialog"
          aria-modal="false"
          aria-labelledby="titulo-accesibilidad"
          onKeyDown={manejarTeclado}
          className="max-h-[70vh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl border border-amber-200 bg-[#fffdf9] p-5 text-slate-800 shadow-2xl"
        >
          <div className="mb-5 flex items-start justify-between gap-3 border-b border-amber-100 pb-4">
            <div>
              <h2 id="titulo-accesibilidad" className="text-lg font-black text-slate-900">Accesibilidad</h2>
              <p className="mt-1 text-xs text-slate-600">Adaptá Empáticos a tus necesidades.</p>
            </div>
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar panel de accesibilidad"
              className="flex min-h-12 min-w-12 items-center justify-center rounded-full border border-amber-200 px-3 text-lg font-bold text-slate-600 hover:bg-amber-50"
            >
              ✕
            </button>
          </div>

          <div role="group" aria-label="Tamaño de texto" className="space-y-2">
            <p className="text-sm font-bold text-slate-800">Tamaño de texto</p>
            <div className="grid grid-cols-3 gap-2">
              {TAMANOS_TEXTO.map((opcion) => (
                <button
                  key={opcion.id}
                  type="button"
                  aria-pressed={preferencias.tamanoTexto === opcion.id}
                  onClick={() => actualizar('tamanoTexto', opcion.id)}
                  className={`${claseBoton} px-2 text-xs ${preferencias.tamanoTexto === opcion.id ? claseActivo : claseInactivo}`}
                >
                  {opcion.etiqueta}
                </button>
              ))}
            </div>
          </div>

          <div role="group" aria-label="Preferencias visuales" className="mt-5 space-y-2">
            <p className="text-sm font-bold text-slate-800">Preferencias visuales</p>
            <button
              type="button"
              aria-pressed={preferencias.altoContraste}
              onClick={() => actualizar('altoContraste', !preferencias.altoContraste)}
              className={`${claseBoton} w-full text-left ${preferencias.altoContraste ? claseActivo : claseInactivo}`}
            >
              🔆 Alto contraste / cuidado ocular
            </button>
            <button
              type="button"
              aria-pressed={preferencias.espaciadoLectura}
              onClick={() => actualizar('espaciadoLectura', !preferencias.espaciadoLectura)}
              className={`${claseBoton} w-full text-left ${preferencias.espaciadoLectura ? claseActivo : claseInactivo}`}
            >
              ↕️ Espaciado de lectura ampliado
            </button>
            <button
              type="button"
              aria-pressed={preferencias.sinAnimaciones}
              onClick={() => actualizar('sinAnimaciones', !preferencias.sinAnimaciones)}
              className={`${claseBoton} w-full text-left ${preferencias.sinAnimaciones ? claseActivo : claseInactivo}`}
            >
              🧘 Sin animaciones
            </button>
          </div>

          <div role="group" aria-label="Lectura por voz" className="mt-5 space-y-2 border-t border-amber-100 pt-4">
            <p className="text-sm font-bold text-slate-800">Leer en voz alta</p>
            <p aria-live="polite" className="text-xs text-slate-600">{estadoVoz}</p>
            <button
              type="button"
              onClick={leerPagina}
              disabled={!soportado}
              className={`${claseBoton} w-full bg-slate-900 text-amber-50 hover:bg-slate-800 disabled:opacity-50`}
            >
              🔊 Leer contenido principal
            </button>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={pausar}
                disabled={!hablando || enPausa}
                className={`${claseBoton} px-2 text-xs ${claseInactivo} disabled:opacity-50`}
              >
                Pausar
              </button>
              <button
                type="button"
                onClick={reanudar}
                disabled={!hablando || !enPausa}
                className={`${claseBoton} px-2 text-xs ${claseInactivo} disabled:opacity-50`}
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={detener}
                disabled={!hablando}
                className={`${claseBoton} px-2 text-xs ${claseInactivo} disabled:opacity-50`}
              >
                Detener
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPreferencias(PREFERENCIAS_BASE)}
            className="mt-5 min-h-12 w-full rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Restablecer preferencias
          </button>
        </div>
      )}

      <button
        ref={botonRef}

        type="button"
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
        aria-expanded={abierto}
        aria-controls="panel-accesibilidad"
        aria-label={abierto ? 'Cerrar herramientas de accesibilidad' : 'Abrir herramientas de accesibilidad'}
        className="flex min-h-12 items-center gap-2 rounded-full border border-amber-300/70 bg-slate-900 px-5 py-3 text-sm font-black text-amber-50 shadow-xl hover:bg-slate-800"
      >
        <span aria-hidden="true">♿</span>
        <span>Accesibilidad</span>
      </button>
    </div>
  );
}
