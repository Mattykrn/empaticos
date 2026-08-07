import { useState, useEffect, useCallback } from 'react';
import { getEntries } from '../api';

/**
 * useEntries loads approved entries of a given type from the backend.
 */
export default function useEntries(type) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getEntries(type);
      setEntries(data.entries || []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las entradas.');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { entries, loading, error, reload };
}
