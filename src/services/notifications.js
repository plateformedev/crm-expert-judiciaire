// ============================================================================
// CRM EXPERT JUDICIAIRE - SERVICE NOTIFICATIONS PUSH
// Gestion des notifications en temps réel
// ============================================================================

// ============================================================================
// CONFIGURATION
// ============================================================================

const PUSH_CONFIG = {
  vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  serverUrl: import.meta.env.VITE_PUSH_SERVER_URL || '/api/push'
};

// ============================================================================
// SERVICE NOTIFICATIONS
// ============================================================================

export const notificationService = {
  // --------------------------------------------------------------------------
  // Vérifier si les notifications sont supportées
  // --------------------------------------------------------------------------
  isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  },

  // --------------------------------------------------------------------------
  // Vérifier la permission actuelle
  // --------------------------------------------------------------------------
  getPermission() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission; // 'granted' | 'denied' | 'default'
  },

  // --------------------------------------------------------------------------
  // Demander la permission
  // --------------------------------------------------------------------------
  async requestPermission() {
    if (!this.isSupported()) {
      return { success: false, error: 'Notifications non supportées' };
    }

    try {
      const permission = await Notification.requestPermission();
      return {
        success: permission === 'granted',
        permission
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------------------------
  // S'abonner aux notifications push
  // --------------------------------------------------------------------------
  async subscribe() {
    if (this.getPermission() !== 'granted') {
      const { success } = await this.requestPermission();
      if (!success) return { success: false, error: 'Permission refusée' };
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Vérifier s'il y a déjà un abonnement
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Créer un nouvel abonnement
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(PUSH_CONFIG.vapidPublicKey)
        });
      }

      // Envoyer l'abonnement au serveur
      await this.saveSubscription(subscription);

      return { success: true, subscription };
    } catch (error) {
      console.error('Erreur subscription push:', error);
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------------------------
  // Se désabonner
  // --------------------------------------------------------------------------
  async unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await this.deleteSubscription(subscription);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------------------------
  // Envoyer l'abonnement au serveur
  // --------------------------------------------------------------------------
  async saveSubscription(subscription) {
    const response = await fetch(`${PUSH_CONFIG.serverUrl}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });
    return response.json();
  },

  // --------------------------------------------------------------------------
  // Supprimer l'abonnement du serveur
  // --------------------------------------------------------------------------
  async deleteSubscription(subscription) {
    const response = await fetch(`${PUSH_CONFIG.serverUrl}/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });
    return response.json();
  },

  // --------------------------------------------------------------------------
  // Afficher une notification locale
  // --------------------------------------------------------------------------
  async showNotification(title, options = {}) {
    if (this.getPermission() !== 'granted') return;

    const defaultOptions = {
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      vibrate: [100, 50, 100],
      requireInteraction: false,
      silent: false,
      tag: `crm-expert-${Date.now()}`,
      renotify: false
    };

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, { ...defaultOptions, ...options });
      return { success: true };
    } catch (error) {
      // Fallback sur l'API Notification native
      new Notification(title, { ...defaultOptions, ...options });
      return { success: true };
    }
  },

  // --------------------------------------------------------------------------
  // Convertir la clé VAPID
  // --------------------------------------------------------------------------
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
};

// ============================================================================
// TYPES DE NOTIFICATIONS
// ============================================================================

export const NOTIFICATION_TYPES = {
  // Alertes urgentes
  ECHEANCE_PROCHE: {
    type: 'echeance_proche',
    title: '⚠️ Échéance proche',
    priority: 'high',
    sound: true
  },
  ECHEANCE_DEPASSEE: {
    type: 'echeance_depassee',
    title: '🚨 Échéance dépassée',
    priority: 'urgent',
    sound: true
  },
  
  // Réunions
  REUNION_DEMAIN: {
    type: 'reunion_demain',
    title: '📅 Réunion demain',
    priority: 'normal'
  },
  REUNION_RAPPEL: {
    type: 'reunion_rappel',
    title: '⏰ Rappel réunion',
    priority: 'high'
  },
  
  // Dires
  NOUVEAU_DIRE: {
    type: 'nouveau_dire',
    title: '📨 Nouveau dire reçu',
    priority: 'high'
  },
  DIRE_EN_RETARD: {
    type: 'dire_en_retard',
    title: '⚠️ Dire en retard',
    priority: 'high'
  },
  
  // Finances
  PROVISION_RECUE: {
    type: 'provision_recue',
    title: '💰 Provision reçue',
    priority: 'normal'
  },
  PROVISION_EN_ATTENTE: {
    type: 'provision_en_attente',
    title: '💳 Provision en attente',
    priority: 'normal'
  },
  
  // Système
  SYNC_COMPLETE: {
    type: 'sync_complete',
    title: '✅ Synchronisation terminée',
    priority: 'low',
    silent: true
  },
  ERREUR_SYSTEME: {
    type: 'erreur_systeme',
    title: '❌ Erreur système',
    priority: 'high'
  }
};

// ============================================================================
// GESTIONNAIRE DE NOTIFICATIONS IN-APP
// ============================================================================

class NotificationManager {
  constructor() {
    this.notifications = [];
    this.listeners = new Set();
    this.maxNotifications = 50;
  }

  // Ajouter une notification
  add(notification) {
    const newNotif = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    this.notifications.unshift(newNotif);
    
    // Limiter le nombre de notifications stockées
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    this.notifyListeners();
    
    // Afficher la notification push si autorisé
    if (notification.showPush !== false) {
      this.showPushNotification(newNotif);
    }

    return newNotif;
  }

  // Afficher notification push
  async showPushNotification(notification) {
    const type = NOTIFICATION_TYPES[notification.type] || {};
    
    await notificationService.showNotification(
      type.title || notification.title,
      {
        body: notification.body,
        icon: notification.icon || '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        tag: notification.id,
        data: {
          url: notification.url,
          affaireId: notification.affaireId
        },
        actions: notification.actions || [],
        silent: type.silent || false,
        requireInteraction: type.priority === 'urgent'
      }
    );
  }

  // Marquer comme lu
  markAsRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.notifyListeners();
    }
  }

  // Marquer tout comme lu
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
  }

  // Supprimer une notification
  remove(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  // Effacer tout
  clear() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Obtenir les notifications
  getAll() {
    return this.notifications;
  }

  // Obtenir les non lues
  getUnread() {
    return this.notifications.filter(n => !n.read);
  }

  // Compter les non lues
  getUnreadCount() {
    return this.getUnread().length;
  }

  // Abonnement aux changements
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notifier les listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.notifications));
  }
}

export const notificationManager = new NotificationManager();

// ============================================================================
// HOOK REACT NOTIFICATIONS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState(notificationManager.getAll());
  const [permission, setPermission] = useState(notificationService.getPermission());
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // S'abonner aux changements
    const unsubscribe = notificationManager.subscribe(setNotifications);

    // Vérifier l'état de l'abonnement push
    const checkSubscription = async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    };
    checkSubscription();

    return unsubscribe;
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await notificationService.requestPermission();
    setPermission(notificationService.getPermission());
    return result;
  }, []);

  const subscribe = useCallback(async () => {
    const result = await notificationService.subscribe();
    setIsSubscribed(result.success);
    return result;
  }, []);

  const unsubscribe = useCallback(async () => {
    const result = await notificationService.unsubscribe();
    if (result.success) setIsSubscribed(false);
    return result;
  }, []);

  const addNotification = useCallback((notification) => {
    return notificationManager.add(notification);
  }, []);

  const markAsRead = useCallback((id) => {
    notificationManager.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationManager.markAllAsRead();
  }, []);

  const removeNotification = useCallback((id) => {
    notificationManager.remove(id);
  }, []);

  return {
    notifications,
    unreadCount: notificationManager.getUnreadCount(),
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification
  };
};

// ============================================================================
// COMPOSANT CENTRE DE NOTIFICATIONS
// ============================================================================

import React from 'react';
import { Bell, Check, Trash2, X, Settings, BellOff, BellRing } from 'lucide-react';

export const NotificationCenter = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotifications();

  const [showSettings, setShowSettings] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:inset-auto lg:absolute lg:top-full lg:right-0 lg:w-96 lg:mt-2">
      {/* Overlay mobile */}
      <div className="lg:hidden fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-x-0 bottom-0 top-16 lg:relative lg:inset-auto bg-white lg:rounded-2xl lg:shadow-xl lg:border border-neutral-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gold-500" />
            <h3 className="font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-neutral-100 rounded-lg"
            >
              <Settings className="w-5 h-5 text-neutral-500" />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-2 hover:bg-neutral-100 rounded-lg"
                title="Tout marquer comme lu"
              >
                <Check className="w-5 h-5 text-neutral-500" />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings */}
        {showSettings && (
          <div className="p-4 bg-neutral-50 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Notifications push</p>
                <p className="text-xs text-neutral-500">
                  {permission === 'granted' ? 'Autorisées' : 'Non autorisées'}
                </p>
              </div>
              {permission === 'granted' ? (
                <button
                  onClick={isSubscribed ? unsubscribe : subscribe}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    isSubscribed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {isSubscribed ? (
                    <span className="flex items-center gap-1">
                      <BellRing className="w-4 h-4" /> Activées
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <BellOff className="w-4 h-4" /> Désactivées
                    </span>
                  )}
                </button>
              ) : (
                <button
                  onClick={requestPermission}
                  className="px-3 py-1.5 bg-gold-500 text-white rounded-lg text-sm"
                >
                  Autoriser
                </button>
              )}
            </div>
          </div>
        )}

        {/* Liste des notifications */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
              <Bell className="w-12 h-12 mb-3" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-neutral-50 transition-colors ${
                    !notif.read ? 'bg-gold-50/50' : ''
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notif.read ? 'bg-transparent' : 'bg-gold-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-900">{notif.title}</p>
                      <p className="text-sm text-neutral-600 line-clamp-2">{notif.body}</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {new Date(notif.timestamp).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notif.id);
                      }}
                      className="p-1 hover:bg-neutral-200 rounded"
                    >
                      <X className="w-4 h-4 text-neutral-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  notificationService,
  notificationManager,
  useNotifications,
  NotificationCenter,
  NOTIFICATION_TYPES
};
