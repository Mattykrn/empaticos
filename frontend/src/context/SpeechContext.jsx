import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const SpeechContext = createContext(null);

const normalizarTexto = (texto) => (typeof texto === 'string' ? texto.replace(/\s+/g, ' ').trim() : '');

export const SpeechProvider = ({ children }) => {
  const [hablando, setHablando] = useState(false);
  const [enPausa, setEnPausa] = useState(false);
  const [textoActual, setTextoActual] = useState('');

  const soportado = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const obtenerVoz = useCallback(() => {
    if (!soportado) return null;
    const voces = window.speechSynthesis.getVoices() || [];
    return voces.find((voz) => voz.lang.toLowerCase() === 'es-ar')
      || voces.find((voz) => voz.lang.toLowerCase() === 'es-es')
      || voces.find((voz) => voz.lang.toLowerCase().startsWith('es'))
      || null;
  }, [soportado]);

  useEffect(() => {
    if (!soportado) return undefined;
    const actualizarVoz = () => obtenerVoz();
    window.speechSynthesis.addEventListener?.('voiceschanged', actualizarVoz);
    actualizarVoz();
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', actualizarVoz);
      window.speechSynthesis.cancel();
    };
  }, [obtenerVoz, soportado]);

  const hablar = useCallback((texto, lang = 'es-AR') => {
    const contenido = normalizarTexto(texto);
    if (!soportado || !contenido || typeof SpeechSynthesisUtterance === 'undefined') return;

    window.speechSynthesis.cancel();
    const enunciado = new SpeechSynthesisUtterance(contenido);
    enunciado.lang = lang;

    const voz = obtenerVoz();
    if (voz) enunciado.voice = voz;

    enunciado.rate = 0.95;
    enunciado.pitch = 1;
    enunciado.volume = 1;
    enunciado.onstart = () => {
      setHablando(true);
      setEnPausa(false);
      setTextoActual(contenido);
    };
    enunciado.onend = () => {
      setHablando(false);
      setEnPausa(false);
    };
    enunciado.onerror = () => {
      setHablando(false);
      setEnPausa(false);
    };

    window.speechSynthesis.speak(enunciado);
  }, [obtenerVoz, soportado]);

  const pausar = useCallback(() => {
    if (!soportado || !hablando || enPausa) return;
    window.speechSynthesis.pause();
    setEnPausa(true);
  }, [enPausa, hablando, soportado]);

  const reanudar = useCallback(() => {
    if (!soportado || !hablando || !enPausa) return;
    window.speechSynthesis.resume();
    setEnPausa(false);
  }, [enPausa, hablando, soportado]);

  const detener = useCallback(() => {
    if (!soportado) return;
    window.speechSynthesis.cancel();
    setHablando(false);
    setEnPausa(false);
    setTextoActual('');
  }, [soportado]);

  const valor = useMemo(() => ({
    soportado,
    hablando,
    enPausa,
    textoActual,
    hablar,
    pausar,
    reanudar,
    detener
  }), [detener, enPausa, hablando, hablar, pausar, reanudar, soportado, textoActual]);

  return <SpeechContext.Provider value={valor}>{children}</SpeechContext.Provider>;
};

const valorPorDefecto = {
  soportado: false,
  hablando: false,
  enPausa: false,
  textoActual: '',
  hablar: () => {},
  pausar: () => {},
  reanudar: () => {},
  detener: () => {}
};

export const useSpeech = () => useContext(SpeechContext) || valorPorDefecto;
