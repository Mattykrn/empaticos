import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getFavorites, addFavorite, removeFavorite } from '../api';
import { useProfile } from './ProfileContext';

const FavoritesContext = createContext(null);

/**
 * FavoritesProvider carga una sola vez los favoritos del visitante
 * y expone helpers para consultarlos y alternarlos.
 */
export function FavoritesProvider({ children }) {
  const { visitorId } = useProfile();
  const [entryIds, setEntryIds] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    try {
      const data = await getFavorites(visitorId);
      setEntryIds(data.entryIds || []);
    } catch (err) {
      setEntryIds([]);
    } finally {
      setLoaded(true);
    }
  }, [visitorId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const isFavorite = useCallback(
    (entryId) => entryIds.includes(String(entryId)),
    [entryIds]
  );

  const toggle = useCallback(
    async (entryId) => {
      const id = String(entryId);
      const isFav = entryIds.includes(id);

      // actualización optimista
      setEntryIds((prev) =>
        isFav ? prev.filter((x) => x !== id) : [...prev, id]
      );

      try {
        if (isFav) {
          const data = await removeFavorite(visitorId, id);
          setEntryIds(data.entryIds || []);
        } else {
          const data = await addFavorite(visitorId, id);
          setEntryIds(data.entryIds || []);
        }
      } catch (err) {
        reload();
      }
    },
    [entryIds, visitorId, reload]
  );

  return (
    <FavoritesContext.Provider value={{ entryIds, isFavorite, toggle, loaded, reload }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  }
  return ctx;
}
