// ============================================================================
// CRM EXPERT JUDICIAIRE - HOOKS PERSONNALISÉS
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// HOOK: useLocalStorage
// ============================================================================

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('useLocalStorage error:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('useLocalStorage error:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// ============================================================================
// HOOK: usePersistedStorage (avec window.storage pour Claude)
// ============================================================================

export const usePersistedStorage = (key, initialValue) => {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données au montage
  useEffect(() => {
    const loadData = async () => {
      try {
        if (window.storage) {
          const result = await window.storage.get(key);
          if (result && result.value) {
            setData(JSON.parse(result.value));
          }
        } else {
          const item = localStorage.getItem(key);
          if (item) {
            setData(JSON.parse(item));
          }
        }
      } catch (err) {
        console.error('Storage load error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [key]);

  // Sauvegarder les données
  const saveData = useCallback(async (newData) => {
    try {
      const dataToSave = newData instanceof Function ? newData(data) : newData;
      setData(dataToSave);
      
      if (window.storage) {
        await window.storage.set(key, JSON.stringify(dataToSave));
      } else {
        localStorage.setItem(key, JSON.stringify(dataToSave));
      }
    } catch (err) {
      console.error('Storage save error:', err);
      setError(err);
    }
  }, [key, data]);

  return { data, setData: saveData, loading, error };
};

// ============================================================================
// HOOK: useDebounce
// ============================================================================

export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ============================================================================
// HOOK: useTimer
// ============================================================================

export const useTimer = (initialSeconds = 0) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(0);
  }, []);
  const stop = useCallback(() => {
    const finalSeconds = seconds;
    reset();
    return finalSeconds;
  }, [seconds, reset]);

  return { seconds, isRunning, start, pause, reset, stop };
};

// ============================================================================
// HOOK: useNotifications
// ============================================================================

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotif = {
      id,
      date: new Date().toISOString(),
      lu: false,
      ...notification
    };
    setNotifications(prev => [newNotif, ...prev]);
    return id;
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, lu: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.lu).length;

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    unreadCount
  };
};

// ============================================================================
// HOOK: useAffaires
// ============================================================================

export const useAffaires = () => {
  const { data: affaires, setData: setAffaires, loading, error } = usePersistedStorage('crm-expert-affaires', []);

  const addAffaire = useCallback((affaire) => {
    const newAffaire = {
      id: Date.now(),
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString(),
      statut: 'en-cours',
      ...affaire
    };
    setAffaires(prev => [...prev, newAffaire]);
    return newAffaire;
  }, [setAffaires]);

  const updateAffaire = useCallback((id, updates) => {
    setAffaires(prev => prev.map(a => 
      a.id === id 
        ? { ...a, ...updates, dateModification: new Date().toISOString() }
        : a
    ));
  }, [setAffaires]);

  const deleteAffaire = useCallback((id) => {
    setAffaires(prev => prev.filter(a => a.id !== id));
  }, [setAffaires]);

  const getAffaire = useCallback((id) => {
    return affaires.find(a => a.id === id);
  }, [affaires]);

  return {
    affaires,
    loading,
    error,
    addAffaire,
    updateAffaire,
    deleteAffaire,
    getAffaire
  };
};

// ============================================================================
// HOOK: useContacts
// ============================================================================

export const useContacts = () => {
  const { data: contacts, setData: setContacts, loading, error } = usePersistedStorage('crm-expert-contacts', []);

  const addContact = useCallback((contact) => {
    const newContact = {
      id: Date.now(),
      dateCreation: new Date().toISOString(),
      ...contact
    };
    setContacts(prev => [...prev, newContact]);
    return newContact;
  }, [setContacts]);

  const updateContact = useCallback((id, updates) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setContacts]);

  const deleteContact = useCallback((id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, [setContacts]);

  return {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact
  };
};

// ============================================================================
// HOOK: useVacations
// ============================================================================

export const useVacations = (affaireId) => {
  const [vacations, setVacations] = useState([]);

  const addVacation = useCallback((vacation) => {
    const newVacation = {
      id: Date.now(),
      affaireId,
      date: new Date().toISOString(),
      ...vacation
    };
    setVacations(prev => [...prev, newVacation]);
    return newVacation;
  }, [affaireId]);

  const removeVacation = useCallback((id) => {
    setVacations(prev => prev.filter(v => v.id !== id));
  }, []);

  const totalHeures = vacations.reduce((acc, v) => acc + (v.duree || 0), 0);
  const totalMontant = vacations.reduce((acc, v) => {
    const taux = v.taux || 0;
    return acc + (v.duree * taux);
  }, 0);

  return {
    vacations,
    addVacation,
    removeVacation,
    totalHeures,
    totalMontant
  };
};

// ============================================================================
// HOOK: useKeyboardShortcuts
// ============================================================================

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = `${event.ctrlKey ? 'ctrl+' : ''}${event.shiftKey ? 'shift+' : ''}${event.key.toLowerCase()}`;
      const shortcut = shortcuts[key];
      if (shortcut) {
        event.preventDefault();
        shortcut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  useLocalStorage,
  usePersistedStorage,
  useDebounce,
  useTimer,
  useNotifications,
  useAffaires,
  useContacts,
  useVacations,
  useKeyboardShortcuts
};
