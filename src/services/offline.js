// ============================================================================
// CRM EXPERT JUDICIAIRE - MODULE PWA / MODE HORS-LIGNE
// Service Worker, sync différée, cache intelligent
// ============================================================================

// ============================================================================
// CONFIGURATION PWA
// ============================================================================

export const PWA_CONFIG = {
  appName: 'CRM Expert Judiciaire',
  appShortName: 'CRM Expert',
  appDescription: 'Gestion des expertises judiciaires BTP',
  themeColor: '#1a1a1a',
  backgroundColor: '#ffffff',
  display: 'standalone',
  orientation: 'any',
  scope: '/',
  startUrl: '/',
  icons: [
    { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
    { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
    { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
    { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
    { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
    { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
  ]
};

// ============================================================================
// SERVICE DE GESTION OFFLINE
// ============================================================================

class OfflineService {
  constructor() {
    this.dbName = 'crm-expert-offline';
    this.dbVersion = 1;
    this.db = null;
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    
    // Écouter les changements de connexion
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  // Initialiser IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store pour les affaires en cache
        if (!db.objectStoreNames.contains('affaires')) {
          const affairesStore = db.createObjectStore('affaires', { keyPath: 'id' });
          affairesStore.createIndex('reference', 'reference', { unique: true });
          affairesStore.createIndex('updated_at', 'updated_at', { unique: false });
        }

        // Store pour les photos en attente de sync
        if (!db.objectStoreNames.contains('photos_pending')) {
          const photosStore = db.createObjectStore('photos_pending', { keyPath: 'id', autoIncrement: true });
          photosStore.createIndex('affaire_id', 'affaire_id', { unique: false });
          photosStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Store pour les actions en attente de sync
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Store pour les brouillons
        if (!db.objectStoreNames.contains('drafts')) {
          const draftsStore = db.createObjectStore('drafts', { keyPath: 'id' });
          draftsStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  // Vérifier si la DB est prête
  async ensureDB() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  // ============================================================================
  // GESTION DES AFFAIRES EN CACHE
  // ============================================================================

  // Mettre une affaire en cache
  async cacheAffaire(affaire) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['affaires'], 'readwrite');
      const store = transaction.objectStore('affaires');
      
      const request = store.put({
        ...affaire,
        _cached_at: new Date().toISOString()
      });

      request.onsuccess = () => resolve(affaire);
      request.onerror = () => reject(request.error);
    });
  }

  // Mettre plusieurs affaires en cache
  async cacheAffaires(affaires) {
    for (const affaire of affaires) {
      await this.cacheAffaire(affaire);
    }
  }

  // Récupérer une affaire du cache
  async getAffaireFromCache(id) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['affaires'], 'readonly');
      const store = transaction.objectStore('affaires');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Récupérer toutes les affaires du cache
  async getAllAffairesFromCache() {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['affaires'], 'readonly');
      const store = transaction.objectStore('affaires');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================================================
  // QUEUE DE SYNCHRONISATION
  // ============================================================================

  // Ajouter une action à la queue de sync
  async addToSyncQueue(action) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      
      const request = store.add({
        ...action,
        created_at: new Date().toISOString(),
        status: 'pending'
      });

      request.onsuccess = () => {
        // Tenter une sync si online
        if (this.isOnline) {
          this.processSyncQueue();
        }
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Récupérer les actions en attente
  async getPendingSyncActions() {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      const request = store.getAll();

      request.onsuccess = () => {
        const pending = (request.result || []).filter(a => a.status === 'pending');
        resolve(pending);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Traiter la queue de synchronisation
  async processSyncQueue() {
    if (!this.isOnline) return;

    const pending = await this.getPendingSyncActions();
    
    for (const action of pending) {
      try {
        await this.executeAction(action);
        await this.markActionComplete(action.id);
      } catch (error) {
        console.error('Erreur sync action:', error);
        await this.markActionFailed(action.id, error.message);
      }
    }
  }

  // Exécuter une action
  async executeAction(action) {
    switch (action.type) {
      case 'create_photo':
        // Upload photo vers Supabase
        break;
      case 'update_affaire':
        // Mettre à jour affaire
        break;
      case 'create_vacation':
        // Créer vacation
        break;
      case 'create_dire':
        // Créer dire
        break;
      default:
        console.warn('Type action inconnu:', action.type);
    }
  }

  // Marquer action comme complète
  async markActionComplete(id) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Marquer action comme échouée
  async markActionFailed(id, error) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const action = getRequest.result;
        action.status = 'failed';
        action.error = error;
        action.failed_at = new Date().toISOString();
        
        const putRequest = store.put(action);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  // ============================================================================
  // PHOTOS EN ATTENTE
  // ============================================================================

  // Sauvegarder une photo en local
  async savePhotoPending(photoData) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['photos_pending'], 'readwrite');
      const store = transaction.objectStore('photos_pending');
      
      const request = store.add({
        ...photoData,
        created_at: new Date().toISOString()
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Récupérer les photos en attente
  async getPhotosPending(affaireId = null) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['photos_pending'], 'readonly');
      const store = transaction.objectStore('photos_pending');
      
      let request;
      if (affaireId) {
        const index = store.index('affaire_id');
        request = index.getAll(affaireId);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================================================
  // BROUILLONS
  // ============================================================================

  // Sauvegarder un brouillon
  async saveDraft(id, type, data) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['drafts'], 'readwrite');
      const store = transaction.objectStore('drafts');
      
      const request = store.put({
        id,
        type,
        data,
        updated_at: new Date().toISOString()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Récupérer un brouillon
  async getDraft(id) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['drafts'], 'readonly');
      const store = transaction.objectStore('drafts');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result?.data);
      request.onerror = () => reject(request.error);
    });
  }

  // Supprimer un brouillon
  async deleteDraft(id) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['drafts'], 'readwrite');
      const store = transaction.objectStore('drafts');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================================================
  // ÉVÉNEMENTS CONNEXION
  // ============================================================================

  handleOnline() {
    this.isOnline = true;
    console.log('📶 Connexion rétablie - Synchronisation...');
    this.processSyncQueue();
    
    // Dispatcher événement personnalisé
    window.dispatchEvent(new CustomEvent('app-online'));
  }

  handleOffline() {
    this.isOnline = false;
    console.log('📵 Mode hors-ligne activé');
    
    // Dispatcher événement personnalisé
    window.dispatchEvent(new CustomEvent('app-offline'));
  }

  // Statut actuel
  getStatus() {
    return {
      isOnline: this.isOnline,
      dbReady: !!this.db
    };
  }
}

export const offlineService = new OfflineService();

// ============================================================================
// MANIFEST.JSON GENERATOR
// ============================================================================

export const generateManifest = () => {
  return {
    name: PWA_CONFIG.appName,
    short_name: PWA_CONFIG.appShortName,
    description: PWA_CONFIG.appDescription,
    theme_color: PWA_CONFIG.themeColor,
    background_color: PWA_CONFIG.backgroundColor,
    display: PWA_CONFIG.display,
    orientation: PWA_CONFIG.orientation,
    scope: PWA_CONFIG.scope,
    start_url: PWA_CONFIG.startUrl,
    icons: PWA_CONFIG.icons,
    categories: ['business', 'productivity'],
    shortcuts: [
      {
        name: 'Nouvelle affaire',
        short_name: 'Nouvelle',
        description: 'Créer une nouvelle affaire',
        url: '/affaires/nouvelle',
        icons: [{ src: '/icons/shortcut-new.png', sizes: '96x96' }]
      },
      {
        name: 'Mes alertes',
        short_name: 'Alertes',
        description: 'Voir les alertes',
        url: '/alertes',
        icons: [{ src: '/icons/shortcut-alerts.png', sizes: '96x96' }]
      }
    ]
  };
};

// ============================================================================
// SERVICE WORKER REGISTRATION
// ============================================================================

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Vérifier les mises à jour
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nouvelle version disponible
            window.dispatchEvent(new CustomEvent('sw-update-available'));
          }
        });
      });

      console.log('✅ Service Worker enregistré');
      return registration;
    } catch (error) {
      console.error('❌ Erreur Service Worker:', error);
    }
  }
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  offlineService,
  PWA_CONFIG,
  generateManifest,
  registerServiceWorker
};
