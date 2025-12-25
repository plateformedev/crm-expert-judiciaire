// ============================================================================
// CRM EXPERT JUDICIAIRE - CAPTURE PHOTO TERRAIN
// Photos géolocalisées, horodatées, avec métadonnées complètes
// ============================================================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera, Image, MapPin, Clock, Tag, Upload, X,
  Check, AlertCircle, Loader2, Compass, Maximize2,
  RotateCw, Trash2, Edit, Info, Wifi, WifiOff,
  Map, Navigation, Calendar
} from 'lucide-react';
import { Card, Badge, Button, ModalBase } from '../ui';
import { formatDateFr } from '../../utils/helpers';
import offlineStore from '../../lib/offlineStore';

// ============================================================================
// HOOK GÉOLOCALISATION
// ============================================================================

export const useGeolocation = (options = {}) => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      return Promise.reject('Géolocalisation non supportée');
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: pos.timestamp
          };
          setPosition(location);
          setLoading(false);
          resolve(location);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
          reject(err);
        },
        {
          enableHighAccuracy: options.highAccuracy ?? true,
          timeout: options.timeout ?? 10000,
          maximumAge: options.maximumAge ?? 0
        }
      );
    });
  }, [options.highAccuracy, options.timeout, options.maximumAge]);

  // Récupérer la position au montage
  useEffect(() => {
    if (options.autoFetch !== false) {
      getPosition();
    }
  }, []);

  return {
    position,
    error,
    loading,
    getPosition,
    isSupported: !!navigator.geolocation
  };
};

// ============================================================================
// HOOK CAPTURE CAMERA
// ============================================================================

export const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // environment = arrière, user = avant
  const videoRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      return mediaStream;
    } catch (err) {
      console.error('Erreur caméra:', err);
      setError(err.message);
      return null;
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }, [stopCamera]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current) return null;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob,
          dataUrl: canvas.toDataURL('image/jpeg', 0.9),
          width: canvas.width,
          height: canvas.height
        });
      }, 'image/jpeg', 0.9);
    });
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    stream,
    error,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    takePhoto,
    isActive: !!stream
  };
};

// ============================================================================
// COMPOSANT CAPTURE PHOTO TERRAIN
// ============================================================================

export const PhotoCaptureTerrain = ({
  affaireId,
  affaireReference,
  reunionId,
  reunionNumero,
  pathologies = [],
  onPhotoCapture,
  onClose
}) => {
  const camera = useCamera();
  const geolocation = useGeolocation({ autoFetch: true });
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [metadata, setMetadata] = useState({
    categorie: 'vue-generale',
    legende: '',
    pathologie_id: '',
    numero: 1
  });
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const fileInputRef = useRef(null);

  // Catégories de photos terrain
  const CATEGORIES = [
    { value: 'vue-generale', label: 'Vue générale', icon: '🏠' },
    { value: 'facade', label: 'Façade', icon: '🧱' },
    { value: 'interieur', label: 'Intérieur', icon: '🚪' },
    { value: 'desordre', label: 'Désordre', icon: '⚠️' },
    { value: 'detail', label: 'Détail', icon: '🔍' },
    { value: 'mesure', label: 'Mesure', icon: '📏' },
    { value: 'environnement', label: 'Environnement', icon: '🌳' },
    { value: 'acces', label: 'Accès', icon: '🚗' }
  ];

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

  // Démarrer la caméra au montage
  useEffect(() => {
    camera.startCamera();
    return () => camera.stopCamera();
  }, []);

  // Capturer une photo
  const handleCapture = async () => {
    const photo = await camera.takePhoto();
    if (photo) {
      // Ajouter les métadonnées de géolocalisation et horodatage
      const photoData = {
        ...photo,
        timestamp: new Date().toISOString(),
        location: geolocation.position,
        affaireId,
        affaireReference,
        reunionId,
        reunionNumero
      };
      setCapturedPhoto(photoData);
    }
  };

  // Importer depuis la galerie
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });

    // Créer un objet image pour les dimensions
    const img = new window.Image();
    img.src = dataUrl;
    await new Promise((resolve) => { img.onload = resolve; });

    const photoData = {
      blob: file,
      dataUrl,
      width: img.width,
      height: img.height,
      timestamp: new Date().toISOString(),
      location: geolocation.position,
      affaireId,
      affaireReference,
      reunionId,
      reunionNumero,
      fromGallery: true
    };

    setCapturedPhoto(photoData);
  };

  // Sauvegarder la photo
  const handleSave = async () => {
    if (!capturedPhoto) return;

    setSaving(true);

    const photoRecord = {
      id: `photo_${Date.now()}`,
      affaire_id: affaireId,
      reunion_id: reunionId,
      categorie: metadata.categorie,
      legende: metadata.legende || `Photo n°${metadata.numero} - ${CATEGORIES.find(c => c.value === metadata.categorie)?.label}`,
      pathologie_id: metadata.pathologie_id || null,
      latitude: capturedPhoto.location?.latitude,
      longitude: capturedPhoto.location?.longitude,
      altitude: capturedPhoto.location?.altitude,
      accuracy: capturedPhoto.location?.accuracy,
      date_prise: capturedPhoto.timestamp,
      width: capturedPhoto.width,
      height: capturedPhoto.height,
      mime_type: 'image/jpeg',
      created_at: new Date().toISOString(),
      _offline: !isOnline
    };

    try {
      if (isOnline) {
        // Mode en ligne : upload direct
        onPhotoCapture?.(capturedPhoto, photoRecord);
      } else {
        // Mode hors-ligne : sauvegarder localement
        await offlineStore.savePhotoOffline(photoRecord, capturedPhoto.blob);
        console.log('[Terrain] Photo sauvegardée hors-ligne');
      }

      // Reset
      setCapturedPhoto(null);
      setMetadata(prev => ({
        ...prev,
        numero: prev.numero + 1,
        legende: '',
        pathologie_id: ''
      }));

      setSaving(false);
    } catch (err) {
      console.error('Erreur sauvegarde photo:', err);
      setSaving(false);
    }
  };

  // Annuler la photo capturée
  const handleCancel = () => {
    setCapturedPhoto(null);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 bg-white/20 rounded-full text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-white">
              <p className="font-medium">{affaireReference}</p>
              <p className="text-xs text-white/60">
                {reunionNumero ? `Réunion n°${reunionNumero}` : 'Photos terrain'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Statut connexion */}
            <div className={`px-2 py-1 rounded-full flex items-center gap-1 text-xs ${
              isOnline ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? 'En ligne' : 'Hors-ligne'}
            </div>

            {/* Géolocalisation */}
            <div className={`px-2 py-1 rounded-full flex items-center gap-1 text-xs ${
              geolocation.position
                ? 'bg-blue-500/20 text-blue-300'
                : geolocation.loading
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : 'bg-red-500/20 text-red-300'
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
      </div>

      {/* Zone principale - Caméra ou photo capturée */}
      {capturedPhoto ? (
        // Photo capturée - Prévisualisation
        <div className="flex-1 relative">
          <img
            src={capturedPhoto.dataUrl}
            alt="Photo capturée"
            className="w-full h-full object-contain"
          />

          {/* Overlay métadonnées */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
            <div className="space-y-3">
              {/* Horodatage et localisation */}
              <div className="flex flex-wrap gap-3 text-white/80 text-xs">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(capturedPhoto.timestamp).toLocaleString('fr-FR')}
                </span>
                {capturedPhoto.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {capturedPhoto.location.latitude.toFixed(6)}, {capturedPhoto.location.longitude.toFixed(6)}
                  </span>
                )}
              </div>

              {/* Catégorie */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setMetadata(prev => ({ ...prev, categorie: cat.value }))}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                      metadata.categorie === cat.value
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Légende */}
              <input
                type="text"
                value={metadata.legende}
                onChange={(e) => setMetadata(prev => ({ ...prev, legende: e.target.value }))}
                placeholder={`Photo n°${metadata.numero} - Description...`}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-[#2563EB]"
              />

              {/* Lier à un désordre */}
              {pathologies.length > 0 && (
                <select
                  value={metadata.pathologie_id}
                  onChange={(e) => setMetadata(prev => ({ ...prev, pathologie_id: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="" className="text-black">Lier à un désordre (optionnel)</option>
                  {pathologies.map(p => (
                    <option key={p.id} value={p.id} className="text-black">
                      D{p.numero} - {p.intitule}
                    </option>
                  ))}
                </select>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 bg-white/20 text-white rounded-xl flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-5 h-5" />
                  Reprendre
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-[#2563EB] text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  {isOnline ? 'Enregistrer' : 'Sauver hors-ligne'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Vue caméra
        <div className="flex-1 relative">
          <video
            ref={camera.videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Overlay guides */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Grille de tiers */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/10" />
              ))}
            </div>

            {/* Niveau */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 border-2 border-white/30 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/50 rounded-full" />
            </div>
          </div>

          {/* Erreur caméra */}
          {camera.error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90">
              <div className="text-center text-white p-6">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <p className="mb-4">{camera.error}</p>
                <Button onClick={camera.startCamera}>Réessayer</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Barre de capture (visible uniquement quand la caméra est active) */}
      {!capturedPhoto && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
          <div className="flex items-center justify-center gap-8">
            {/* Galerie */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center"
            >
              <Image className="w-6 h-6 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Bouton capture */}
            <button
              onClick={handleCapture}
              disabled={!camera.isActive}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
            >
              <div className="w-16 h-16 border-4 border-[#1a1a1a] rounded-full" />
            </button>

            {/* Switch caméra */}
            <button
              onClick={camera.switchCamera}
              className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center"
            >
              <RotateCw className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Catégorie rapide */}
          <div className="flex justify-center gap-2 mt-4">
            {CATEGORIES.slice(0, 4).map(cat => (
              <button
                key={cat.value}
                onClick={() => setMetadata(prev => ({ ...prev, categorie: cat.value }))}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  metadata.categorie === cat.value
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white/20 text-white/80'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// WIDGET PHOTO RAPIDE
// ============================================================================

export const PhotoQuickCapture = ({ onCapture, disabled = false }) => {
  const fileInputRef = useRef(null);
  const geolocation = useGeolocation({ autoFetch: false });

  const handleCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Obtenir la position GPS
    let location = null;
    try {
      location = await geolocation.getPosition();
    } catch (err) {
      console.warn('GPS non disponible');
    }

    onCapture?.({
      file,
      timestamp: new Date().toISOString(),
      location
    });

    // Reset input
    e.target.value = '';
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCapture}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="p-3 bg-[#2563EB] text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#b8922b] transition-colors"
      >
        <Camera className="w-5 h-5" />
        <span>Photo</span>
      </button>
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default PhotoCaptureTerrain;
