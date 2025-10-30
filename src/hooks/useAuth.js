import { useState, useEffect, useCallback } from 'react';

const LS_KEY = 'user';

function readUserFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
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
