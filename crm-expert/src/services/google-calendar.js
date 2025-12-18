// ============================================================================
// CRM EXPERT JUDICIAIRE - SERVICE GOOGLE CALENDAR
// Synchronisation bidirectionnelle des réunions d'expertise
// ============================================================================

// ============================================================================
// CONFIGURATION
// ============================================================================

const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
};

// ============================================================================
// INITIALISATION GOOGLE API
// ============================================================================

let gapiLoaded = false;
let gisLoaded = false;
let tokenClient = null;

export const loadGoogleApi = () => {
  return new Promise((resolve, reject) => {
    // Charger GAPI
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = () => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: GOOGLE_CONFIG.apiKey,
          discoveryDocs: GOOGLE_CONFIG.discoveryDocs
        });
        gapiLoaded = true;
        checkAndResolve();
      });
    };
    gapiScript.onerror = reject;
    document.body.appendChild(gapiScript);

    // Charger GIS (Google Identity Services)
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.clientId,
        scope: GOOGLE_CONFIG.scopes,
        callback: '' // Défini dynamiquement
      });
      gisLoaded = true;
      checkAndResolve();
    };
    gisScript.onerror = reject;
    document.body.appendChild(gisScript);

    function checkAndResolve() {
      if (gapiLoaded && gisLoaded) {
        resolve();
      }
    }
  });
};

// ============================================================================
// AUTHENTIFICATION
// ============================================================================

export const googleAuthService = {
  accessToken: null,

  // Vérifier si connecté
  isSignedIn() {
    return !!this.accessToken && window.gapi?.client?.getToken() !== null;
  },

  // Se connecter
  async signIn() {
    return new Promise((resolve, reject) => {
      tokenClient.callback = (response) => {
        if (response.error) {
          reject(response);
          return;
        }
        this.accessToken = response.access_token;
        resolve(response);
      };

      if (window.gapi.client.getToken() === null) {
        // Première connexion - demande de consentement
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        // Rafraîchir le token
        tokenClient.requestAccessToken({ prompt: '' });
      }
    });
  },

  // Se déconnecter
  signOut() {
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken(null);
      this.accessToken = null;
    }
  }
};

// ============================================================================
// SERVICE GOOGLE CALENDAR
// ============================================================================

export const googleCalendarService = {
  // --------------------------------------------------------------------------
  // Lister les calendriers de l'utilisateur
  // --------------------------------------------------------------------------
  async listCalendars() {
    try {
      const response = await window.gapi.client.calendar.calendarList.list();
      return {
        success: true,
        calendars: response.result.items.map(cal => ({
          id: cal.id,
          summary: cal.summary,
          description: cal.description,
          primary: cal.primary || false,
          backgroundColor: cal.backgroundColor
        }))
      };
    } catch (error) {
      console.error('Erreur listCalendars:', error);
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------------------------
  // Créer un calendrier dédié aux expertises
  // --------------------------------------------------------------------------
  async createExpertiseCalendar() {
    try {
      const response = await window.gapi.client.calendar.calendars.insert({
        resource: {
          summary: 'Expertises Judiciaires',
          description: 'Calendrier des réunions d\'expertise judiciaire - CRM Expert',
          timeZone: 'Europe/Paris'
        }
      });

      // Définir une couleur (or/jaune)
      await window.gapi.client.calendar.calendarList.update({
        calendarId: response.result.id,
        resource: {
          colorId: '5' // Jaune/Or
        }
      });

      return {
        success: true,
        calendar: {
          id: response.result.id,
          summary: response.result.summary
        }
      };
    } catch (error) {
      console.error('Erreur createExpertiseCalendar:', error);
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------------------------
  // Créer un événement (réunion d'expertise)
  // --------------------------------------------------------------------------
  async createEvent(calendarId, reunion, affaire) {
    const {
      date_reunion,
      heure_debut,
      heure_fin,
      lieu,
      numero,
      type,
      notes
    } = reunion;

    // Construire les dates
    const startDate = new Date(date_reunion);
    const [startH, startM] = (heure_debut || '10:00').split(':');
    startDate.setHours(parseInt(startH), parseInt(startM), 0);

    const endDate = new Date(date_reunion);
    const [endH, endM] = (heure_fin || '12:00').split(':');
    endDate.setHours(parseInt(endH), parseInt(endM), 0);

    // Construire la description
    const description = `
📋 EXPERTISE JUDICIAIRE
━━━━━━━━━━━━━━━━━━━━━

📁 Affaire: ${affaire.reference}
⚖️ Tribunal: ${affaire.tribunal || 'Non précisé'}
🏠 Bien: ${affaire.bien_adresse || ''}, ${affaire.bien_code_postal || ''} ${affaire.bien_ville || ''}

📝 Type de réunion: ${type || 'Réunion d\'expertise'}
#️⃣ Numéro: ${numero}

${notes ? `📌 Notes:\n${notes}` : ''}

━━━━━━━━━━━━━━━━━━━━━
🔗 Ouvrir dans CRM Expert: ${window.location.origin}/affaires/${affaire.id}
    `.trim();

    // Participants (convertir les parties en attendees)
    const attendees = (affaire.parties || [])
      .filter(p => p.email)
      .map(p => ({
        email: p.email,
        displayName: p.raison_sociale || `${p.nom} ${p.prenom || ''}`,
        responseStatus: 'needsAction'
      }));

    try {
      const response = await window.gapi.client.calendar.events.insert({
        calendarId,
        sendUpdates: 'all', // Envoyer les invitations
        resource: {
          summary: `[EXP] ${affaire.reference} - Réunion n°${numero}`,
          description,
          location: lieu || affaire.bien_adresse,
          start: {
            dateTime: startDate.toISOString(),
            timeZone: 'Europe/Paris'
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: 'Europe/Paris'
          },
          attendees,
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 1 jour avant
              { method: 'popup', minutes: 60 },      // 1 heure avant
              { method: 'popup', minutes: 15 }       // 15 minutes avant
            ]
          },
          colorId: '5', // Jaune/Or
          // Métadonnées pour la synchronisation
          extendedProperties: {
            private: {
              crm_affaire_id: affaire.id,
              crm_reunion_id: reunion.id,
              crm_source: 'crm-expert'
            }
          }
        }
      });

      return {
        success: true,
        event: {
          id: response.result.id,
          htmlLink: response.result.htmlLink,
          summary: response.result.summary,
          start: response.result.start.dateTime
        }
      };
    } catch (error) {
      console.error('Erreur createEvent:', error);
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------------------------
  // Mettre à jour un événement
  // --------------------------------------------------------------------------
  async updateEvent(calendarId, eventId, reunion, affaire) {
    const {
      date_reunion,
      heure_debut,
      heure_fin,
      lieu,
      numero,
      type,
      notes,
      statut
    } = reunion;

    const startDate = new Date(date_reunion);
    const [startH, startM] = (heure_debut || '10:00').split(':');
    startDate.setHours(parseInt(startH), parseInt(startM), 0);

    const endDate = new Date(date_reunion);
    const [endH, endM] = (heure_fin || '12:00').split(':');
    endDate.setHours(parseInt(endH), parseInt(endM), 0);

    try {
      const response = await window.gapi.client.calendar.events.update({
        calendarId,
        eventId,
        sendUpdates: 'all',
        resource: {
          summary: `[EXP] ${affaire.reference} - Réunion n°${numero}${statut === 'annulee' ? ' [ANNULÉE]' : ''}`,
          location: lieu,
          start: {
            dateTime: startDate.toISOString(),
            timeZone: 'Europe/Paris'
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: 'Europe/Paris'
          },
          status: statut === 'annulee' ? 'cancelled' : 'confirmed'
        }
      });

      return {
        success: true,
        event: response.result
      };
    } catch (error) {
      console.error('Erreur updateEvent:', error);
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------------------------
  // Supprimer un événement
  // --------------------------------------------------------------------------
  async deleteEvent(calendarId, eventId) {
    try {
      await window.gapi.client.calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all'
      });
      return { success: true };
    } catch (error) {
      console.error('Erreur deleteEvent:', error);
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------------------------
  // Lister les événements d'une période
  // --------------------------------------------------------------------------
  async listEvents(calendarId, timeMin, timeMax) {
    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        privateExtendedProperty: 'crm_source=crm-expert'
      });

      return {
        success: true,
        events: response.result.items.map(event => ({
          id: event.id,
          summary: event.summary,
          description: event.description,
          location: event.location,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          htmlLink: event.htmlLink,
          status: event.status,
          crmAffaireId: event.extendedProperties?.private?.crm_affaire_id,
          crmReunionId: event.extendedProperties?.private?.crm_reunion_id
        }))
      };
    } catch (error) {
      console.error('Erreur listEvents:', error);
      return { success: false, error: error.message };
    }
  },

  // --------------------------------------------------------------------------
  // Synchroniser toutes les réunions d'une affaire
  // --------------------------------------------------------------------------
  async syncAffaireReunions(calendarId, affaire) {
    const results = [];

    for (const reunion of (affaire.reunions || [])) {
      if (reunion.google_event_id) {
        // Mise à jour
        const result = await this.updateEvent(calendarId, reunion.google_event_id, reunion, affaire);
        results.push({ reunionId: reunion.id, action: 'update', ...result });
      } else {
        // Création
        const result = await this.createEvent(calendarId, reunion, affaire);
        results.push({ reunionId: reunion.id, action: 'create', ...result });
      }
    }

    return {
      success: results.every(r => r.success),
      results
    };
  }
};

// ============================================================================
// HOOK REACT POUR GOOGLE CALENDAR
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export const useGoogleCalendar = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger l'API Google
  useEffect(() => {
    loadGoogleApi()
      .then(() => {
        setIsLoaded(true);
        setIsSignedIn(googleAuthService.isSignedIn());
      })
      .catch(err => {
        setError('Erreur chargement Google API');
        console.error(err);
      });
  }, []);

  // Connexion
  const signIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await googleAuthService.signIn();
      setIsSignedIn(true);
      
      // Charger les calendriers
      const result = await googleCalendarService.listCalendars();
      if (result.success) {
        setCalendars(result.calendars);
        // Sélectionner le calendrier principal par défaut
        const primary = result.calendars.find(c => c.primary);
        setSelectedCalendarId(primary?.id || result.calendars[0]?.id);
      }
    } catch (err) {
      setError(err.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, []);

  // Déconnexion
  const signOut = useCallback(() => {
    googleAuthService.signOut();
    setIsSignedIn(false);
    setCalendars([]);
    setSelectedCalendarId(null);
  }, []);

  // Créer un calendrier expertise
  const createExpertiseCalendar = useCallback(async () => {
    setLoading(true);
    const result = await googleCalendarService.createExpertiseCalendar();
    if (result.success) {
      setCalendars(prev => [...prev, result.calendar]);
      setSelectedCalendarId(result.calendar.id);
    }
    setLoading(false);
    return result;
  }, []);

  // Créer un événement
  const createEvent = useCallback(async (reunion, affaire) => {
    if (!selectedCalendarId) {
      return { success: false, error: 'Aucun calendrier sélectionné' };
    }
    setLoading(true);
    const result = await googleCalendarService.createEvent(selectedCalendarId, reunion, affaire);
    setLoading(false);
    return result;
  }, [selectedCalendarId]);

  // Synchroniser une affaire
  const syncAffaire = useCallback(async (affaire) => {
    if (!selectedCalendarId) {
      return { success: false, error: 'Aucun calendrier sélectionné' };
    }
    setLoading(true);
    const result = await googleCalendarService.syncAffaireReunions(selectedCalendarId, affaire);
    setLoading(false);
    return result;
  }, [selectedCalendarId]);

  return {
    isLoaded,
    isSignedIn,
    calendars,
    selectedCalendarId,
    setSelectedCalendarId,
    loading,
    error,
    signIn,
    signOut,
    createExpertiseCalendar,
    createEvent,
    syncAffaire
  };
};

// ============================================================================
// COMPOSANT REACT - BOUTON CONNEXION GOOGLE
// ============================================================================

import React from 'react';
import { Calendar, LogIn, LogOut, Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react';

export const GoogleCalendarConnect = ({ onConnect, onDisconnect }) => {
  const {
    isLoaded,
    isSignedIn,
    calendars,
    selectedCalendarId,
    setSelectedCalendarId,
    loading,
    error,
    signIn,
    signOut,
    createExpertiseCalendar
  } = useGoogleCalendar();

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 text-neutral-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        Chargement Google Calendar...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <button
        onClick={async () => {
          await signIn();
          onConnect && onConnect();
        }}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
        )}
        Connecter Google Calendar
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-600">
          <Check className="w-5 h-5" />
          <span>Connecté à Google Calendar</span>
        </div>
        <button
          onClick={() => {
            signOut();
            onDisconnect && onDisconnect();
          }}
          className="text-sm text-neutral-500 hover:text-red-600"
        >
          Déconnecter
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-2">
          Calendrier de synchronisation
        </label>
        <div className="flex gap-2">
          <select
            value={selectedCalendarId || ''}
            onChange={(e) => setSelectedCalendarId(e.target.value)}
            className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-gold-500"
          >
            {calendars.map(cal => (
              <option key={cal.id} value={cal.id}>
                {cal.summary} {cal.primary && '(principal)'}
              </option>
            ))}
          </select>
          <button
            onClick={createExpertiseCalendar}
            disabled={loading}
            className="px-3 py-2 bg-gold-100 text-gold-700 rounded-lg hover:bg-gold-200 transition-colors"
            title="Créer un calendrier dédié"
          >
            +
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// COMPOSANT REACT - BOUTON SYNC RÉUNION
// ============================================================================

export const SyncReunionButton = ({ reunion, affaire, onSync }) => {
  const { isSignedIn, createEvent, loading } = useGoogleCalendar();
  const [synced, setSynced] = useState(!!reunion.google_event_id);

  const handleSync = async () => {
    const result = await createEvent(reunion, affaire);
    if (result.success) {
      setSynced(true);
      onSync && onSync(result.event);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  if (synced) {
    return (
      <span className="flex items-center gap-1 text-sm text-green-600">
        <Check className="w-4 h-4" />
        Synchronisé
      </span>
    );
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="flex items-center gap-1 text-sm text-gold-600 hover:text-gold-700"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Calendar className="w-4 h-4" />
      )}
      Ajouter au calendrier
    </button>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  loadGoogleApi,
  googleAuthService,
  googleCalendarService,
  useGoogleCalendar,
  GoogleCalendarConnect,
  SyncReunionButton
};
