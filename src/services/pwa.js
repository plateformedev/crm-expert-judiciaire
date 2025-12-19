// ============================================================================
// CRM EXPERT JUDICIAIRE - SERVICE WORKER & PWA
// Mode hors-ligne pour utilisation terrain
// ============================================================================

// ============================================================================
// SERVICE WORKER (sw.js) - À placer dans /public/sw.js
// ============================================================================

const SW_CODE = `
const CACHE_NAME = 'crm-expert-v1';
const OFFLINE_URL = '/offline.html';

// Ressources à mettre en cache immédiatement
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Ressources à mettre en cache à la demande
const CACHE_PATTERNS = [
  /\\.js$/,
  /\\.css$/,
  /\\.woff2?$/,
  /\\.png$/,
  /\\.jpg$/,
  /\\.svg$/
];

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch avec stratégie Network First pour les API, Cache First pour les assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls - Network first
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets - Cache first
  if (CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation requests - Network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Default - Network first
  event.respondWith(networkFirst(request));
});

// Stratégie Network First
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

// Stratégie Cache First
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Background Sync pour les actions en attente
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions());
  }
});

async function syncPendingActions() {
  // Récupérer les actions en attente depuis IndexedDB
  // et les synchroniser avec le serveur
  console.log('Synchronisation des actions en attente...');
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: data.url || '/'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'CRM Expert', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
`;

// ============================================================================
// MANIFEST.JSON - À placer dans /public/manifest.json
// ============================================================================

export const MANIFEST = {
  name: "CRM Expert Judiciaire",
  short_name: "CRM Expert",
  description: "Gestion des expertises judiciaires BTP",
  start_url: "/",
  display: "standalone",
  background_color: "#1a1a1a",
  theme_color: "#c9a227",
  orientation: "any",
  icons: [
    {
      src: "/icons/icon-72.png",
      sizes: "72x72",
      type: "image/png",
      purpose: "maskable any"
    },
    {
      src: "/icons/icon-96.png",
      sizes: "96x96",
      type: "image/png",
      purpose: "maskable any"
    },
    {
      src: "/icons/icon-128.png",
      sizes: "128x128",
      type: "image/png",
      purpose: "maskable any"
    },
    {
      src: "/icons/icon-144.png",
      sizes: "144x144",
      type: "image/png",
      purpose: "maskable any"
    },
    {
      src: "/icons/icon-152.png",
      sizes: "152x152",
      type: "image/png",
      purpose: "maskable any"
    },
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable any"
    },
    {
      src: "/icons/icon-384.png",
      sizes: "384x384",
      type: "image/png",
      purpose: "maskable any"
    },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable any"
    }
  ],
  shortcuts: [
    {
      name: "Nouvelle affaire",
      short_name: "Affaire",
      description: "Créer une nouvelle affaire",
      url: "/affaires/new",
      icons: [{ src: "/icons/shortcut-affaire.png", sizes: "96x96" }]
    },
    {
      name: "Mes alertes",
      short_name: "Alertes",
      description: "Voir les alertes en cours",
      url: "/alertes",
      icons: [{ src: "/icons/shortcut-alerte.png", sizes: "96x96" }]
    }
  ],
  categories: ["business", "productivity"],
  screenshots: [
    {
      src: "/screenshots/dashboard.png",
      sizes: "1280x720",
      type: "image/png",
      label: "Tableau de bord"
    },
    {
      src: "/screenshots/affaire.png",
      sizes: "1280x720",
      type: "image/png",
      label: "Fiche affaire"
    }
  ]
};

// ============================================================================
// HOOK PWA
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [swRegistration, setSwRegistration] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Détecter le statut en ligne/hors ligne
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enregistrer le Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          setSwRegistration(registration);
          
          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          });
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    }
  }, []);

  // Gérer l'installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Vérifier si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Installer l'app
  const install = useCallback(async () => {
    if (!installPrompt) return false;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    
    setInstallPrompt(null);
    return outcome === 'accepted';
  }, [installPrompt]);

  // Appliquer la mise à jour
  const applyUpdate = useCallback(() => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [swRegistration]);

  return {
    isOnline,
    isInstallable,
    isInstalled,
    updateAvailable,
    install,
    applyUpdate
  };
};

// ============================================================================
// HOOK STOCKAGE HORS-LIGNE (IndexedDB)
// ============================================================================

const DB_NAME = 'crm-expert-offline';
const DB_VERSION = 1;

export const useOfflineStorage = () => {
  const [db, setDb] = useState(null);

  // Ouvrir la base IndexedDB
  useEffect(() => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Erreur ouverture IndexedDB');
    };

    request.onsuccess = () => {
      setDb(request.result);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Store pour les affaires en cache
      if (!database.objectStoreNames.contains('affaires')) {
        database.createObjectStore('affaires', { keyPath: 'id' });
      }

      // Store pour les actions en attente de sync
      if (!database.objectStoreNames.contains('pending_actions')) {
        const store = database.createObjectStore('pending_actions', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp');
      }

      // Store pour les photos en attente d'upload
      if (!database.objectStoreNames.contains('pending_photos')) {
        database.createObjectStore('pending_photos', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
      }
    };
  }, []);

  // Sauvegarder une affaire en local
  const saveAffaire = useCallback(async (affaire) => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['affaires'], 'readwrite');
      const store = transaction.objectStore('affaires');
      const request = store.put(affaire);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Récupérer une affaire locale
  const getAffaire = useCallback(async (id) => {
    if (!db) return null;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['affaires'], 'readonly');
      const store = transaction.objectStore('affaires');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Récupérer toutes les affaires locales
  const getAllAffaires = useCallback(async () => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['affaires'], 'readonly');
      const store = transaction.objectStore('affaires');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Ajouter une action en attente
  const addPendingAction = useCallback(async (action) => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending_actions'], 'readwrite');
      const store = transaction.objectStore('pending_actions');
      const request = store.add({
        ...action,
        timestamp: Date.now()
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Récupérer les actions en attente
  const getPendingActions = useCallback(async () => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending_actions'], 'readonly');
      const store = transaction.objectStore('pending_actions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Supprimer une action après sync
  const removePendingAction = useCallback(async (id) => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending_actions'], 'readwrite');
      const store = transaction.objectStore('pending_actions');
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  return {
    saveAffaire,
    getAffaire,
    getAllAffaires,
    addPendingAction,
    getPendingActions,
    removePendingAction
  };
};

// ============================================================================
// COMPOSANT INDICATEUR DE STATUT
// ============================================================================

import { Wifi, WifiOff, Download, RefreshCw, CloudOff, Cloud } from 'lucide-react';

export const OfflineIndicator = () => {
  const { isOnline, updateAvailable, applyUpdate, isInstallable, install } = usePWA();
  const { getPendingActions } = useOfflineStorage();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const checkPending = async () => {
      const actions = await getPendingActions();
      setPendingCount(actions.length);
    };
    checkPending();
    const interval = setInterval(checkPending, 30000);
    return () => clearInterval(interval);
  }, [getPendingActions]);

  return (
    <div className="flex items-center gap-2">
      {/* Statut connexion */}
      {isOnline ? (
        <div className="flex items-center gap-1 text-green-600" title="En ligne">
          <Cloud className="w-4 h-4" />
        </div>
      ) : (
        <div className="flex items-center gap-1 text-amber-600" title="Hors ligne">
          <CloudOff className="w-4 h-4" />
          <span className="text-xs">Hors ligne</span>
        </div>
      )}

      {/* Actions en attente */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-1 text-amber-600" title={`${pendingCount} action(s) en attente de synchronisation`}>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-xs">{pendingCount}</span>
        </div>
      )}

      {/* Mise à jour disponible */}
      {updateAvailable && (
        <button
          onClick={applyUpdate}
          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs"
        >
          <Download className="w-3 h-3" />
          Mise à jour
        </button>
      )}

      {/* Installation possible */}
      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-1 px-2 py-1 bg-[#f5e6c8] text-[#c9a227] rounded-lg text-xs"
        >
          <Download className="w-3 h-3" />
          Installer
        </button>
      )}
    </div>
  );
};

// ============================================================================
// COMPOSANT BANNIÈRE HORS-LIGNE
// ============================================================================

export const OfflineBanner = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 text-center text-sm z-50">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>Mode hors ligne — Les modifications seront synchronisées à la reconnexion</span>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  usePWA,
  useOfflineStorage,
  OfflineIndicator,
  OfflineBanner,
  MANIFEST,
  SW_CODE
};
