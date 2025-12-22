// ============================================================================
// CRM EXPERT JUDICIAIRE - MODE TERRAIN
// Interface unifiée pour visite sur site (photos, notes, dictée, hors-ligne)
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Camera, Mic, FileText, MapPin, Clock, Wifi, WifiOff,
  AlertTriangle, Check, X, ChevronDown, ChevronUp,
  Upload, Download, RefreshCw, Loader2, Eye, Plus,
  Home, Compass, Navigation, Map, Save, Send, Smartphone
} from 'lucide-react';
import { Card, Badge, Button, ModalBase, EmptyState } from '../ui';
import { formatDateFr, formatDuree } from '../../utils/helpers';
import { PhotoCaptureTerrain, PhotoQuickCapture, useGeolocation } from './PhotoCaptureTerrain';
import { DicteeTerrain, DicteeRealtimeWidget, useRealtimeTranscription } from '../dictee';
import offlineStore from '../../lib/offlineStore';

// ============================================================================
// HOOK SYNCHRONISATION OFFLINE
// ============================================================================

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState(null);

  // Écouter les changements de connexion
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

  // Compter les éléments en attente
  useEffect(() => {
    const updatePendingCount = async () => {
      const pending = await offlineStore.getPendingSyncItems();
      setPendingCount(pending.length);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => clearInterval(interval);
  }, []);

  // Synchroniser les données
  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);

    try {
      const pending = await offlineStore.getPendingSyncItems();
      console.log(`[Sync] ${pending.length} éléments à synchroniser`);

      for (const item of pending) {
        try {
          // TODO: Implémenter la logique de sync réelle avec Supabase
          console.log('[Sync] Synchronisation:', item.type, item.id);
          await offlineStore.markSyncComplete(item.id);
        } catch (err) {
          console.error('[Sync] Erreur:', err);
          await offlineStore.markSyncFailed(item.id, err.message);
        }
      }

      setLastSync(new Date());
      setPendingCount(0);
    } catch (err) {
      console.error('[Sync] Erreur globale:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  // Auto-sync quand on revient en ligne
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      sync();
    }
  }, [isOnline]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSync,
    sync
  };
};

// ============================================================================
// COMPOSANT PRINCIPAL - MODE TERRAIN
// ============================================================================

export const ModeTerrain = ({
  affaire,
  reunion = null,
  pathologies = [],
  onSave,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, photos, notes, dictee
  const [showCamera, setShowCamera] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);

  const offlineSync = useOfflineSync();
  const geolocation = useGeolocation({ autoFetch: true });

  // Tabs de navigation
  const tabs = [
    { id: 'overview', label: 'Résumé', icon: Home },
    { id: 'photos', label: 'Photos', icon: Camera, badge: photos.length },
    { id: 'notes', label: 'Notes', icon: FileText, badge: notes.length },
    { id: 'dictee', label: 'Dictée', icon: Mic }
  ];

  // Ajouter une photo
  const handlePhotoCapture = (photoData, metadata) => {
    const newPhoto = {
      id: `photo_${Date.now()}`,
      ...metadata,
      dataUrl: photoData.dataUrl,
      timestamp: photoData.timestamp,
      location: photoData.location
    };
    setPhotos(prev => [...prev, newPhoto]);
    console.log('[Terrain] Photo ajoutée:', newPhoto.id);
  };

  // Ajouter une note depuis la dictée
  const handleTranscription = (text, noteData) => {
    const newNote = {
      id: `note_${Date.now()}`,
      text,
      ...noteData
    };
    setNotes(prev => [...prev, newNote]);
  };

  // Sauvegarder la session terrain
  const handleSaveSession = async () => {
    const sessionData = {
      affaire_id: affaire.id,
      reunion_id: reunion?.id,
      date: new Date().toISOString(),
      photos,
      notes,
      location: geolocation.position
    };

    if (offlineSync.isOnline) {
      onSave?.(sessionData);
    } else {
      // Sauvegarder localement
      await offlineStore.put('notes', {
        id: `session_${Date.now()}`,
        ...sessionData
      });
      await offlineStore.addToSyncQueue({
        type: 'SAVE_SESSION',
        payload: sessionData
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e5e5] sticky top-0 z-40">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-2 -ml-2 hover:bg-[#f5f5f5] rounded-lg">
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-bold text-[#1a1a1a] flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#c9a227]" />
                  Mode Terrain
                </h1>
                <p className="text-sm text-[#737373]">
                  {affaire.reference}
                  {reunion && ` • Réunion n°${reunion.numero}`}
                </p>
              </div>
            </div>

            {/* Statuts */}
            <div className="flex items-center gap-2">
              {/* Connexion */}
              <div className={`px-2 py-1 rounded-full flex items-center gap-1 text-xs ${
                offlineSync.isOnline
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {offlineSync.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {offlineSync.isOnline ? 'En ligne' : 'Hors-ligne'}
              </div>

              {/* Sync pending */}
              {offlineSync.pendingCount > 0 && (
                <button
                  onClick={offlineSync.sync}
                  disabled={!offlineSync.isOnline || offlineSync.isSyncing}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1 text-xs"
                >
                  {offlineSync.isSyncing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  {offlineSync.pendingCount} à sync
                </button>
              )}

              {/* GPS */}
              <div className={`px-2 py-1 rounded-full flex items-center gap-1 text-xs ${
                geolocation.position
                  ? 'bg-blue-100 text-blue-700'
                  : geolocation.loading
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
              }`}>
                {geolocation.loading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <MapPin className="w-3 h-3" />
                )}
                {geolocation.position
                  ? `±${Math.round(geolocation.position.accuracy)}m`
                  : geolocation.loading
                    ? 'GPS...'
                    : 'GPS off'}
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex gap-1 -mx-4 px-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-xl whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#f5f5f5] text-[#1a1a1a] font-medium'
                    : 'text-[#737373] hover:bg-[#fafafa]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 bg-[#c9a227] text-white text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-4">
        {/* Tab Résumé */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Résumé de la visite */}
            <Card className="p-4">
              <h2 className="font-medium text-[#1a1a1a] mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-[#c9a227]" />
                Résumé de la visite
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#fafafa] rounded-xl text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-[#c9a227]" />
                  <p className="text-2xl font-bold text-[#1a1a1a]">{photos.length}</p>
                  <p className="text-sm text-[#737373]">Photos</p>
                </div>
                <div className="p-4 bg-[#fafafa] rounded-xl text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-[#c9a227]" />
                  <p className="text-2xl font-bold text-[#1a1a1a]">{notes.length}</p>
                  <p className="text-sm text-[#737373]">Notes</p>
                </div>
              </div>

              {/* Localisation */}
              {geolocation.position && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Position GPS active</p>
                    <p className="text-xs text-blue-600">
                      {geolocation.position.latitude.toFixed(6)}, {geolocation.position.longitude.toFixed(6)}
                      (±{Math.round(geolocation.position.accuracy)}m)
                    </p>
                  </div>
                </div>
              )}

              {/* Actions rapides */}
              <div className="flex gap-3 mt-4">
                <Button
                  variant="primary"
                  icon={Camera}
                  onClick={() => setShowCamera(true)}
                  className="flex-1"
                >
                  Prendre photo
                </Button>
                <Button
                  variant="secondary"
                  icon={Mic}
                  onClick={() => setActiveTab('dictee')}
                  className="flex-1"
                >
                  Dictée
                </Button>
              </div>
            </Card>

            {/* Désordres à photographier */}
            {pathologies.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium text-[#1a1a1a] flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Désordres à documenter
                  </h2>
                  <button onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="space-y-2">
                    {pathologies.map(pathologie => {
                      const photoCount = photos.filter(p => p.pathologie_id === pathologie.id).length;
                      return (
                        <div
                          key={pathologie.id}
                          className="flex items-center justify-between p-3 bg-[#fafafa] rounded-xl"
                        >
                          <div>
                            <p className="font-medium text-[#1a1a1a]">
                              D{pathologie.numero} - {pathologie.intitule}
                            </p>
                            <p className="text-xs text-[#737373]">
                              {photoCount} photo(s)
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Camera}
                            onClick={() => {
                              setShowCamera(true);
                            }}
                          >
                            Photo
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Tab Photos */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-medium text-[#1a1a1a]">Photos ({photos.length})</h2>
              <Button variant="primary" icon={Camera} onClick={() => setShowCamera(true)}>
                Nouvelle photo
              </Button>
            </div>

            {photos.length === 0 ? (
              <EmptyState
                icon={Camera}
                title="Aucune photo"
                description="Prenez des photos pour documenter votre visite"
                action={() => setShowCamera(true)}
                actionLabel="Prendre une photo"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {photos.map(photo => (
                  <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-[#f5f5f5]">
                    <img
                      src={photo.dataUrl}
                      alt={photo.legende}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-xs truncate">{photo.legende}</p>
                      <p className="text-white/60 text-xs">
                        {new Date(photo.timestamp).toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                    {photo.location && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-blue-500/80 rounded text-white text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        GPS
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <h2 className="font-medium text-[#1a1a1a]">Notes de visite ({notes.length})</h2>

            {notes.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Aucune note"
                description="Utilisez la dictée vocale pour prendre des notes"
                action={() => setActiveTab('dictee')}
                actionLabel="Dicter une note"
              />
            ) : (
              <div className="space-y-3">
                {notes.map((note, index) => (
                  <Card key={note.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-[#a3a3a3]">Note {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={note.mode === 'whisper' ? 'default' : 'success'} className="text-xs">
                          {note.mode === 'whisper' ? 'IA' : 'Temps réel'}
                        </Badge>
                        <span className="text-xs text-[#a3a3a3]">
                          {new Date(note.timestamp).toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-[#1a1a1a]">{note.text}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Dictée */}
        {activeTab === 'dictee' && (
          <DicteeTerrain
            affaireReference={affaire.reference}
            reunionNumero={reunion?.numero}
            context={`Bien: ${affaire.bien_adresse}, ${affaire.bien_ville}`}
            onTranscription={handleTranscription}
          />
        )}
      </div>

      {/* Footer avec bouton sauvegarder */}
      <div className="sticky bottom-0 bg-white border-t border-[#e5e5e5] p-4">
        <Button
          variant="primary"
          icon={Save}
          onClick={handleSaveSession}
          className="w-full"
          disabled={photos.length === 0 && notes.length === 0}
        >
          {offlineSync.isOnline ? 'Sauvegarder la visite' : 'Sauvegarder hors-ligne'}
        </Button>
      </div>

      {/* Modal Camera */}
      {showCamera && (
        <PhotoCaptureTerrain
          affaireId={affaire.id}
          affaireReference={affaire.reference}
          reunionId={reunion?.id}
          reunionNumero={reunion?.numero}
          pathologies={pathologies}
          onPhotoCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

// ============================================================================
// COMPOSANT INDICATEUR OFFLINE
// ============================================================================

export const OfflineIndicator = () => {
  const { isOnline, pendingCount, isSyncing, sync } = useOfflineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${
      isOnline ? 'bg-blue-500' : 'bg-amber-500'
    } text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2`}>
      {isOnline ? (
        isSyncing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Synchronisation...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span className="text-sm">{pendingCount} à synchroniser</span>
            <button
              onClick={sync}
              className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs"
            >
              Sync
            </button>
          </>
        )
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">Mode hors-ligne</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {pendingCount} en attente
            </span>
          )}
        </>
      )}
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default ModeTerrain;
