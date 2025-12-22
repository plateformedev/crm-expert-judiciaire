// ============================================================================
// CRM EXPERT JUDICIAIRE - SERVICE WORKER
// Cache intelligent, stratégies offline, sync en arrière-plan
// ============================================================================

const CACHE_NAME = 'crm-expert-v2';
const RUNTIME_CACHE = 'crm-expert-runtime';
const PHOTOS_CACHE = 'crm-expert-photos';

// Ressources à mettre en cache immédiatement
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

// Ressources statiques à mettre en cache
const STATIC_ASSETS = [
  '/assets/',
  '/icons/'
];

// Domaines à toujours chercher en réseau
const NETWORK_ONLY_DOMAINS = [
  'api.anthropic.com',
  'api.openai.com',
  'api.ar24.fr'
];

// ============================================================================
// INSTALLATION
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Mise en cache des ressources statiques');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// ============================================================================
// ACTIVATION
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log('[SW] Suppression ancien cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ============================================================================
// FETCH - STRATÉGIES DE CACHE
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Network only pour certains domaines
  if (NETWORK_ONLY_DOMAINS.some(domain => url.hostname.includes(domain))) {
    event.respondWith(fetch(request));
    return;
  }

  // Stratégie selon le type de ressource
  if (url.pathname.startsWith('/api/')) {
    // API: Network first, fallback cache
    event.respondWith(networkFirst(request));
  } else if (request.destination === 'image') {
    // Images: Cache first, fallback network
    event.respondWith(cacheFirst(request));
  } else if (url.pathname.match(/\.(js|css|woff2?)$/)) {
    // Assets statiques: Stale while revalidate
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // Pages HTML: Network first
    event.respondWith(networkFirst(request));
  }
});

// ============================================================================
// STRATÉGIES DE CACHE
// ============================================================================

// Network First: Essayer le réseau, sinon cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Mettre en cache si succès
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback sur le cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Page offline pour les documents HTML
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Cache First: Cache prioritaire, sinon réseau
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Retourner une image placeholder si image non trouvée
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#f5f5f5" width="200" height="200"/><text x="50%" y="50%" fill="#a3a3a3" text-anchor="middle" dy=".3em">Image</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    throw error;
  }
}

// Stale While Revalidate: Cache immédiat + mise à jour en arrière-plan
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Mise à jour en arrière-plan
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  // Retourner le cache immédiatement si disponible
  return cachedResponse || fetchPromise;
}

// ============================================================================
// SYNC EN ARRIÈRE-PLAN
// ============================================================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Sync en arrière-plan:', event.tag);
  
  if (event.tag === 'sync-pending-data') {
    event.waitUntil(syncPendingData());
  }
  
  if (event.tag === 'sync-photos') {
    event.waitUntil(syncPendingPhotos());
  }
});

// Synchroniser les données en attente
async function syncPendingData() {
  // Envoyer message aux clients pour déclencher la sync
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_REQUIRED',
      payload: { timestamp: Date.now() }
    });
  });
}

// Synchroniser les photos en attente
async function syncPendingPhotos() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_PHOTOS',
      payload: { timestamp: Date.now() }
    });
  });
}

// ============================================================================
// NOTIFICATIONS PUSH
// ============================================================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push reçu');
  
  let data = {
    title: 'CRM Expert',
    body: 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png'
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag || 'default',
      data: data.data || {},
      actions: data.actions || []
    })
  );
});

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clic notification');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then((windowClients) => {
        // Chercher une fenêtre existante
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Ouvrir une nouvelle fenêtre
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// ============================================================================
// MESSAGES
// ============================================================================

self.addEventListener('message', (event) => {
  console.log('[SW] Message reçu:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
  
  if (event.data.type === 'CACHE_URLS') {
    const urls = event.data.payload;
    caches.open(RUNTIME_CACHE).then((cache) => {
      cache.addAll(urls);
    });
  }

  // Cache une photo pour utilisation hors-ligne
  if (event.data.type === 'CACHE_PHOTO') {
    const { url, photoData } = event.data.payload;
    caches.open(PHOTOS_CACHE).then((cache) => {
      const response = new Response(photoData, {
        headers: { 'Content-Type': 'image/jpeg' }
      });
      cache.put(url, response);
    });
  }

  // Nettoyer le cache des photos
  if (event.data.type === 'CLEAR_PHOTOS_CACHE') {
    caches.delete(PHOTOS_CACHE);
  }
});

// ============================================================================
// INDEXEDDB SYNC HELPER
// ============================================================================

// Cette fonction est appelée lors d'un sync pour synchroniser les données IndexedDB
async function processIndexedDBSync() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'TRIGGER_INDEXEDDB_SYNC',
      payload: { timestamp: Date.now() }
    });
  });
}

// ============================================================================
// NOTIFICATION D'ÉTAT HORS-LIGNE
// ============================================================================

// Afficher une notification quand on passe hors-ligne
self.addEventListener('offline', () => {
  self.registration.showNotification('CRM Expert', {
    body: 'Vous êtes maintenant hors-ligne. Vos données seront synchronisées automatiquement.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'offline-notification'
  });
});

// Afficher une notification quand on revient en ligne
self.addEventListener('online', () => {
  self.registration.showNotification('CRM Expert', {
    body: 'Connexion rétablie. Synchronisation en cours...',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'online-notification'
  });

  // Déclencher la sync
  self.registration.sync.register('sync-pending-data');
});

console.log('[SW] Service Worker v2 chargé - Mode terrain activé');
