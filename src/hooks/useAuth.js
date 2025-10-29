import { useState, useEffect, useCallback } from 'react';

const LS_KEY = 'user';

function readUserFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);

    // Normalize favorites: some records use `favorite`, others `favorites`.
    const a = Array.isArray(obj.favorite) ? obj.favorite : null;
    const b = Array.isArray(obj.favorites) ? obj.favorites : null;
    if (a || b) {
      const merged = Array.from(new Set([...(a || []), ...(b || [])]));
      // Only persist back if changed
      const sameAsExisting = Array.isArray(obj.favorites) && obj.favorites.length === merged.length && obj.favorites.every((v, i) => v === merged[i]);
      if (!sameAsExisting) {
        obj.favorites = merged;
      }
      // remove old key to avoid duplication
      if (obj.favorite) delete obj.favorite;
      try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); } catch (e) { /* ignore */ }
    }

    return obj;
  } catch (e) {
    return null;
  }
}

export default function useAuth() {
  const [user, setUser] = useState(() => readUserFromStorage());

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LS_KEY) {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    // storage events fire for other windows; also listen to a custom event
    // so same-tab updates can notify other hook instances.
    const onUserUpdated = () => {
      setUser(readUserFromStorage());
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('userUpdated', onUserUpdated);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('userUpdated', onUserUpdated);
    };
  }, []);

  const login = useCallback((userObj, persist = true) => {
    setUser(userObj || null);
    if (persist) {
      try { localStorage.setItem(LS_KEY, JSON.stringify(userObj)); } catch (e) { /* ignore */ }
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem(LS_KEY); } catch (e) { /* ignore */ }
  }, []);

  const isLoggedIn = !!user;

  return { user, isLoggedIn, login, logout };
}
