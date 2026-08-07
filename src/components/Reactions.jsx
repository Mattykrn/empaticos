import React, { useState } from 'react';
import { REACTION_DEFS, reactToEntry } from '../api';

const STORAGE_KEY = 'empaticos-reactions';

function readUsedMap() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (err) {
    return {};
  }
}

function writeUsedMap(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    // almacenamiento no disponible, ignorar
  }
}

/**
 * Reactions renders the community reaction buttons (hearts, hugs, laughs).
 * Each visitor can react once per entry + reaction type.
 */
export default function Reactions({ entryId, reactions, onError }) {
  const [counts, setCounts] = useState(
    reactions || { hearts: 0, laughs: 0, hugs: 0 }
  );
  const [used, setUsed] = useState(() => {
    const map = readUsedMap();
    return map[entryId] || {};
  });
  const [sending, setSending] = useState(false);

  async function handleReact(key) {
    if (used[key] || sending) return;
    setSending(true);

    const previous = { ...counts };
    setCounts((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));

    try {
      const data = await reactToEntry(entryId, key);
      if (data.entry?.reactions) {
        setCounts(data.entry.reactions);
      }
      const map = readUsedMap();
      map[entryId] = { ...(map[entryId] || {}), [key]: true };
      writeUsedMap(map);
      setUsed(map[entryId]);
    } catch (error) {
      setCounts(previous);
      if (onError) onError(error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="reactions" aria-label="Reacciones de la comunidad">
      {REACTION_DEFS.map(({ key, emoji, label }) => (
        <button
          key={key}
          type="button"
          className={`reaction-btn ${used[key] ? 'used' : ''}`}
          onClick={() => handleReact(key)}
          title={label}
          aria-label={`${label}: ${counts[key] || 0}`}
          disabled={sending}
        >
          <span className="reaction-emoji" aria-hidden="true">{emoji}</span>
          <span className="reaction-count">{counts[key] || 0}</span>
        </button>
      ))}
    </div>
  );
}
