// ============================================================================
// CRM EXPERT JUDICIAIRE - STORE OFFLINE (IndexedDB)
// Stockage local persistant pour mode hors-ligne
// ============================================================================

const DB_NAME = 'crm-expert-offline';
const DB_VERSION = 1;

// ============================================================================
// STORES (TABLES)
// ============================================================================

const STORES = {
  affaires: { keyPath: 'id', indexes: ['reference', 'statut', 'updated_at'] },
  reunions: { keyPath: 'id', indexes: ['affaire_id', 'date_reunion', 'updated_at'] },
  photos: { keyPath: 'id', indexes: ['affaire_id', 'reunion_id', 'updated_at'] },
  notes: { keyPath: 'id', indexes: ['affaire_id', 'reunion_id', 'created_at'] },
  pathologies: { keyPath: 'id', indexes: ['affaire_id', 'updated_at'] },
  sync_queue: { keyPath: 'id', autoIncrement: true, indexes: ['type', 'status', 'created_at'] },
  cache_metadata: { keyPath: 'key' }
};

// ============================================================================
// INITIALISATION DB
// ============================================================================

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[OfflineStore] Erreur ouverture DB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('[OfflineStore] DB initialisée');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      Object.entries(STORES).forEach(([storeName, config]) => {
        if (!database.objectStoreNames.contains(storeName)) {
          const store = database.createObjectStore(storeName, {
            keyPath: config.keyPath,
            autoIncrement: config.autoIncrement || false
          });

          config.indexes?.forEach(indexName => {
            store.createIndex(indexName, indexName, { unique: false });
          });

          console.log(`[OfflineStore] Store créé: ${storeName}`);
        }
      });
    };
  });
};

// ============================================================================
// OPÉRATIONS CRUD GÉNÉRIQUES
// ============================================================================

const getStore = async (storeName, mode = 'readonly') => {
  const database = await initDB();
  const transaction = database.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};

// Récupérer un élément
export const get = async (storeName, id) => {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Récupérer tous les éléments
export const getAll = async (storeName) => {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Récupérer par index
export const getByIndex = async (storeName, indexName, value) => {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Ajouter ou mettre à jour
export const put = async (storeName, data) => {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.put({
      ...data,
      updated_at: new Date().toISOString(),
      _offline: true
    });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Ajouter plusieurs éléments
export const putMany = async (storeName, items) => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    items.forEach(item => {
      store.put({
        ...item,
        updated_at: new Date().toISOString(),
        _offline: true
      });
    });

    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
};

// Supprimer
export const remove = async (storeName, id) => {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// Vider un store
export const clear = async (storeName) => {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// Compter les éléments
export const count = async (storeName) => {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// ============================================================================
// FILE DE SYNCHRONISATION
// ============================================================================

export const addToSyncQueue = async (action) => {
  const store = await getStore('sync_queue', 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.add({
      ...action,
      status: 'pending',
      created_at: new Date().toISOString(),
      retries: 0
    });
    request.onsuccess = () => {
      console.log('[OfflineStore] Action ajoutée à la file de sync:', action.type);
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
};

export const getPendingSyncItems = async () => {
  return getByIndex('sync_queue', 'status', 'pending');
};

export const markSyncComplete = async (id) => {
  const item = await get('sync_queue', id);
  if (item) {
    return put('sync_queue', { ...item, status: 'completed', synced_at: new Date().toISOString() });
  }
};

export const markSyncFailed = async (id, error) => {
  const item = await get('sync_queue', id);
  if (item) {
    return put('sync_queue', {
      ...item,
      status: item.retries >= 3 ? 'failed' : 'pending',
      retries: item.retries + 1,
      last_error: error
    });
  }
};

// ============================================================================
// CACHE METADATA
// ============================================================================

export const setCacheMetadata = async (key, value) => {
  return put('cache_metadata', { key, value, updated_at: new Date().toISOString() });
};

export const getCacheMetadata = async (key) => {
  const data = await get('cache_metadata', key);
  return data?.value;
};

// ============================================================================
// HELPERS SPÉCIFIQUES MÉTIER
// ============================================================================

// Sauvegarder une affaire complète pour offline
export const cacheAffaireForOffline = async (affaire) => {
  await put('affaires', affaire);

  if (affaire.reunions) {
    await putMany('reunions', affaire.reunions);
  }

  if (affaire.pathologies) {
    await putMany('pathologies', affaire.pathologies);
  }

  console.log(`[OfflineStore] Affaire ${affaire.reference} mise en cache`);
};

// Récupérer une affaire avec ses données liées
export const getFullAffaire = async (affaireId) => {
  const affaire = await get('affaires', affaireId);
  if (!affaire) return null;

  const reunions = await getByIndex('reunions', 'affaire_id', affaireId);
  const pathologies = await getByIndex('pathologies', 'affaire_id', affaireId);
  const photos = await getByIndex('photos', 'affaire_id', affaireId);
  const notes = await getByIndex('notes', 'affaire_id', affaireId);

  return {
    ...affaire,
    reunions,
    pathologies,
    photos,
    notes
  };
};

// Sauvegarder une photo avec son blob
export const savePhotoOffline = async (photoData, blob) => {
  // Convertir le blob en base64 pour stockage
  const base64 = await blobToBase64(blob);

  await put('photos', {
    ...photoData,
    blob_data: base64,
    _pending_upload: true
  });

  // Ajouter à la file de sync
  await addToSyncQueue({
    type: 'UPLOAD_PHOTO',
    payload: { photoId: photoData.id }
  });
};

// Récupérer une photo (blob)
export const getPhotoBlob = async (photoId) => {
  const photo = await get('photos', photoId);
  if (photo?.blob_data) {
    return base64ToBlob(photo.blob_data, photo.mime_type);
  }
  return null;
};

// ============================================================================
// UTILITAIRES
// ============================================================================

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const base64ToBlob = (base64, mimeType) => {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
};

// ============================================================================
// STATISTIQUES
// ============================================================================

export const getOfflineStats = async () => {
  const stats = {
    affaires: await count('affaires'),
    reunions: await count('reunions'),
    photos: await count('photos'),
    notes: await count('notes'),
    pathologies: await count('pathologies'),
    pendingSync: (await getPendingSyncItems()).length
  };

  return stats;
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  initDB,
  get,
  getAll,
  getByIndex,
  put,
  putMany,
  remove,
  clear,
  count,
  addToSyncQueue,
  getPendingSyncItems,
  markSyncComplete,
  markSyncFailed,
  setCacheMetadata,
  getCacheMetadata,
  cacheAffaireForOffline,
  getFullAffaire,
  savePhotoOffline,
  getPhotoBlob,
  getOfflineStats
};
