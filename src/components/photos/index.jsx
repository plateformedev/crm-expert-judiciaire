// ============================================================================
// CRM EXPERT JUDICIAIRE - MODULE PHOTOS TERRAIN
// Capture, annotation, géolocalisation, numérotation automatique
// ============================================================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera, Image, Upload, Trash2, Edit, Download, Eye,
  MapPin, Calendar, Tag, Grid, List, Search, Filter,
  ZoomIn, ZoomOut, RotateCw, Maximize2, X, Check,
  Type, Square, Circle, ArrowRight, Pen, Eraser,
  ChevronLeft, ChevronRight, Folder, Link2
} from 'lucide-react';
import { Card, Badge, Button, Input, Select, ModalBase, EmptyState } from '../ui';
import { formatDateFr } from '../../utils/helpers';
import { supabase, storage } from '../../lib/supabase';

// ============================================================================
// CONSTANTES
// ============================================================================

const CATEGORIES_PHOTOS = [
  { value: 'vue-generale', label: 'Vue générale', icon: '🏠' },
  { value: 'facade', label: 'Façade', icon: '🧱' },
  { value: 'interieur', label: 'Intérieur', icon: '🚪' },
  { value: 'desordre', label: 'Désordre', icon: '⚠️' },
  { value: 'detail', label: 'Détail', icon: '🔍' },
  { value: 'mesure', label: 'Mesure', icon: '📏' },
  { value: 'avant-travaux', label: 'Avant travaux', icon: '📸' },
  { value: 'apres-travaux', label: 'Après travaux', icon: '✅' }
];

const OUTILS_ANNOTATION = [
  { id: 'fleche', label: 'Flèche', icon: ArrowRight },
  { id: 'rectangle', label: 'Rectangle', icon: Square },
  { id: 'cercle', label: 'Cercle', icon: Circle },
  { id: 'texte', label: 'Texte', icon: Type },
  { id: 'dessin', label: 'Dessin libre', icon: Pen },
  { id: 'gomme', label: 'Gomme', icon: Eraser }
];

// ============================================================================
// HOOK GESTION DES PHOTOS
// ============================================================================

export const usePhotos = (affaireId) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Charger les photos
  const fetchPhotos = useCallback(async () => {
    if (!affaireId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('affaire_id', affaireId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      console.error('Erreur fetch photos:', err);
    } finally {
      setLoading(false);
    }
  }, [affaireId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Upload une photo
  const uploadPhoto = async (file, metadata = {}) => {
    setUploading(true);
    try {
      // Générer un nom unique
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const filename = `${affaireId}/${timestamp}.${ext}`;

      // Upload vers Storage
      const { data: uploadData, error: uploadError } = await storage.upload(
        'photos',
        filename,
        file,
        { contentType: file.type }
      );

      if (uploadError) throw uploadError;

      // Obtenir l'URL
      const url = storage.getPublicUrl('photos', filename);

      // Extraire les métadonnées EXIF si disponible
      const exifData = await extractExifData(file);

      // Calculer le numéro
      const numero = photos.length + 1;

      // Enregistrer en base
      const { data, error } = await supabase
        .from('photos')
        .insert({
          affaire_id: affaireId,
          filename: file.name,
          storage_path: filename,
          url,
          mime_type: file.type,
          size_bytes: file.size,
          categorie: metadata.categorie || 'vue-generale',
          legende: metadata.legende || `Photo n°${numero}`,
          date_prise: exifData?.datePrise || new Date().toISOString().split('T')[0],
          latitude: exifData?.latitude || metadata.latitude,
          longitude: exifData?.longitude || metadata.longitude,
          pathologie_id: metadata.pathologie_id,
          reunion_id: metadata.reunion_id,
          annotations: []
        })
        .select()
        .single();

      if (error) throw error;

      setPhotos(prev => [data, ...prev]);
      return { success: true, photo: data };
    } catch (err) {
      console.error('Erreur upload:', err);
      return { success: false, error: err.message };
    } finally {
      setUploading(false);
    }
  };

  // Upload multiple
  const uploadMultiple = async (files, metadata = {}) => {
    const results = [];
    for (const file of files) {
      const result = await uploadPhoto(file, metadata);
      results.push(result);
    }
    return results;
  };

  // Mettre à jour une photo
  const updatePhoto = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('photos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Supprimer une photo
  const deletePhoto = async (id) => {
    try {
      const photo = photos.find(p => p.id === id);
      
      // Supprimer du storage
      if (photo?.storage_path) {
        await storage.remove('photos', [photo.storage_path]);
      }

      // Supprimer de la base
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPhotos(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    photos,
    loading,
    uploading,
    uploadPhoto,
    uploadMultiple,
    updatePhoto,
    deletePhoto,
    refetch: fetchPhotos
  };
};

// Extraire données EXIF
const extractExifData = async (file) => {
  return new Promise((resolve) => {
    // Simplifié - en production utiliser exif-js ou similar
    resolve(null);
  });
};

// ============================================================================
// COMPOSANT PRINCIPAL - GALERIE PHOTOS
// ============================================================================

export const GaleriePhotos = ({ 
  affaireId, 
  pathologies = [],
  reunions = [],
  onPhotoSelect 
}) => {
  const { photos, loading, uploading, uploadPhoto, uploadMultiple, updatePhoto, deletePhoto } = usePhotos(affaireId);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnnotationModal, setShowAnnotationModal] = useState(null);
  
  const fileInputRef = useRef(null);

  // Photos filtrées
  const photosFiltrees = photos.filter(p => {
    const matchSearch = search === '' || 
      p.legende?.toLowerCase().includes(search.toLowerCase()) ||
      p.categorie?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.categorie === filter;
    return matchSearch && matchFilter;
  });

  // Grouper par catégorie
  const photosParCategorie = photosFiltrees.reduce((acc, photo) => {
    const cat = photo.categorie || 'autre';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(photo);
    return acc;
  }, {});

  // Handle file drop
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      await uploadMultiple(files);
    }
  }, [uploadMultiple]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barre d'outils */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
          <input
            type="text"
            placeholder="Rechercher une photo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
        >
          <option value="all">Toutes catégories</option>
          {CATEGORIES_PHOTOS.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
          ))}
        </select>

        <div className="flex border border-[#e5e5e5] rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-3 ${viewMode === 'grid' ? 'bg-[#1a1a1a] text-white' : 'hover:bg-[#f5f5f5]'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-3 ${viewMode === 'list' ? 'bg-[#1a1a1a] text-white' : 'hover:bg-[#f5f5f5]'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) uploadMultiple(files);
          }}
        />

        <Button 
          variant="primary" 
          icon={Camera}
          loading={uploading}
          onClick={() => setShowUploadModal(true)}
        >
          Ajouter photos
        </Button>
      </div>

      {/* Zone de drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-[#e5e5e5] rounded-xl p-8 text-center hover:border-[#c9a227] transition-colors"
      >
        <Upload className="w-12 h-12 text-[#a3a3a3] mx-auto mb-3" />
        <p className="text-[#737373]">
          Glissez vos photos ici ou{' '}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-[#c9a227] hover:underline"
          >
            parcourez
          </button>
        </p>
        <p className="text-xs text-[#a3a3a3] mt-1">JPG, PNG, HEIC (max 20 Mo)</p>
      </div>

      {/* Galerie */}
      {photos.length === 0 ? (
        <EmptyState
          icon={Image}
          title="Aucune photo"
          description="Ajoutez des photos pour documenter vos constatations"
          action={() => fileInputRef.current?.click()}
          actionLabel="Ajouter des photos"
        />
      ) : viewMode === 'grid' ? (
        <div className="space-y-8">
          {Object.entries(photosParCategorie).map(([categorie, photosCategorie]) => {
            const catInfo = CATEGORIES_PHOTOS.find(c => c.value === categorie) || { label: 'Autre', icon: '📷' };
            return (
              <div key={categorie}>
                <h3 className="font-medium text-[#1a1a1a] mb-4 flex items-center gap-2">
                  <span>{catInfo.icon}</span>
                  {catInfo.label}
                  <Badge variant="default">{photosCategorie.length}</Badge>
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {photosCategorie.map(photo => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      onClick={() => setSelectedPhoto(photo)}
                      onEdit={() => setShowAnnotationModal(photo)}
                      onDelete={() => deletePhoto(photo.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {photosFiltrees.map(photo => (
            <PhotoListItem
              key={photo.id}
              photo={photo}
              onClick={() => setSelectedPhoto(photo)}
              onEdit={() => setShowAnnotationModal(photo)}
              onDelete={() => deletePhoto(photo.id)}
            />
          ))}
        </div>
      )}

      {/* Modal upload */}
      {showUploadModal && (
        <ModalUploadPhoto
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={uploadPhoto}
          pathologies={pathologies}
          reunions={reunions}
        />
      )}

      {/* Modal visualisation */}
      {selectedPhoto && (
        <ModalVisualisationPhoto
          isOpen={!!selectedPhoto}
          photo={selectedPhoto}
          photos={photosFiltrees}
          onClose={() => setSelectedPhoto(null)}
          onEdit={() => {
            setShowAnnotationModal(selectedPhoto);
            setSelectedPhoto(null);
          }}
          onNavigate={(photo) => setSelectedPhoto(photo)}
        />
      )}

      {/* Modal annotation */}
      {showAnnotationModal && (
        <ModalAnnotationPhoto
          isOpen={!!showAnnotationModal}
          photo={showAnnotationModal}
          onClose={() => setShowAnnotationModal(null)}
          onSave={(annotations) => {
            updatePhoto(showAnnotationModal.id, { annotations });
            setShowAnnotationModal(null);
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// CARTE PHOTO (GRID)
// ============================================================================

const PhotoCard = ({ photo, onClick, onEdit, onDelete }) => {
  return (
    <div className="group relative aspect-square rounded-xl overflow-hidden bg-[#f5f5f5]">
      <img
        src={photo.url}
        alt={photo.legende}
        className="w-full h-full object-cover cursor-pointer"
        onClick={onClick}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="p-2 bg-white rounded-lg hover:bg-[#f5f5f5]"
        >
          <Eye className="w-5 h-5 text-[#1a1a1a]" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-2 bg-white rounded-lg hover:bg-[#f5f5f5]"
        >
          <Edit className="w-5 h-5 text-[#1a1a1a]" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 bg-white rounded-lg hover:bg-red-50"
        >
          <Trash2 className="w-5 h-5 text-red-600" />
        </button>
      </div>

      {/* Info bas */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-white text-xs truncate">{photo.legende}</p>
      </div>

      {/* Badge catégorie */}
      {photo.categorie && (
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-white/90 rounded text-xs">
            {CATEGORIES_PHOTOS.find(c => c.value === photo.categorie)?.icon}
          </span>
        </div>
      )}

      {/* Badge annotations */}
      {photo.annotations?.length > 0 && (
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 bg-[#c9a227] text-white rounded text-xs">
            {photo.annotations.length} annotation(s)
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// LIGNE PHOTO (LIST)
// ============================================================================

const PhotoListItem = ({ photo, onClick, onEdit, onDelete }) => {
  return (
    <Card className="p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-4">
        {/* Miniature */}
        <div 
          className="w-20 h-20 rounded-lg overflow-hidden bg-[#f5f5f5] flex-shrink-0 cursor-pointer"
          onClick={onClick}
        >
          <img
            src={photo.url}
            alt={photo.legende}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[#1a1a1a] truncate">{photo.legende}</p>
          <div className="flex items-center gap-4 text-sm text-[#737373] mt-1">
            <span className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {CATEGORIES_PHOTOS.find(c => c.value === photo.categorie)?.label || 'Non classée'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {photo.date_prise ? formatDateFr(photo.date_prise) : 'Date inconnue'}
            </span>
            {photo.latitude && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Géolocalisée
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-2 hover:bg-[#f5f5f5] rounded-lg">
            <Edit className="w-5 h-5 text-[#737373]" />
          </button>
          <button onClick={() => {}} className="p-2 hover:bg-[#f5f5f5] rounded-lg">
            <Download className="w-5 h-5 text-[#737373]" />
          </button>
          <button onClick={onDelete} className="p-2 hover:bg-red-50 rounded-lg">
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// MODAL UPLOAD PHOTO
// ============================================================================

const ModalUploadPhoto = ({ isOpen, onClose, onUpload, pathologies, reunions }) => {
  const [files, setFiles] = useState([]);
  const [metadata, setMetadata] = useState({
    categorie: 'vue-generale',
    legende: '',
    pathologie_id: '',
    reunion_id: ''
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (newFiles) => {
    const imageFiles = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...imageFiles]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    for (const file of files) {
      await onUpload(file, metadata);
    }
    setLoading(false);
    setFiles([]);
    onClose();
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Ajouter des photos" size="lg">
      <div className="space-y-6">
        {/* Zone de sélection */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#e5e5e5] rounded-xl p-8 text-center cursor-pointer hover:border-[#c9a227] transition-colors"
        >
          <Camera className="w-12 h-12 text-[#a3a3a3] mx-auto mb-3" />
          <p className="text-[#737373]">Cliquez pour sélectionner des photos</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Aperçu fichiers */}
        {files.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {files.map((file, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#f5f5f5]">
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Métadonnées */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Catégorie"
            value={metadata.categorie}
            onChange={(e) => setMetadata(prev => ({ ...prev, categorie: e.target.value }))}
            options={CATEGORIES_PHOTOS.map(c => ({ value: c.value, label: `${c.icon} ${c.label}` }))}
          />
          
          <Input
            label="Légende"
            value={metadata.legende}
            onChange={(e) => setMetadata(prev => ({ ...prev, legende: e.target.value }))}
            placeholder="Description de la photo"
          />

          {pathologies.length > 0 && (
            <Select
              label="Lier à un désordre"
              value={metadata.pathologie_id}
              onChange={(e) => setMetadata(prev => ({ ...prev, pathologie_id: e.target.value }))}
              options={[
                { value: '', label: 'Aucun' },
                ...pathologies.map(p => ({ value: p.id, label: `D${p.numero} - ${p.intitule}` }))
              ]}
            />
          )}

          {reunions.length > 0 && (
            <Select
              label="Lier à une réunion"
              value={metadata.reunion_id}
              onChange={(e) => setMetadata(prev => ({ ...prev, reunion_id: e.target.value }))}
              options={[
                { value: '', label: 'Aucune' },
                ...reunions.map(r => ({ value: r.id, label: `Réunion n°${r.numero}` }))
              ]}
            />
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            loading={loading}
            disabled={files.length === 0}
          >
            Ajouter {files.length} photo(s)
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// MODAL VISUALISATION PHOTO
// ============================================================================

const ModalVisualisationPhoto = ({ isOpen, photo, photos, onClose, onEdit, onNavigate }) => {
  const [zoom, setZoom] = useState(1);
  const currentIndex = photos.findIndex(p => p.id === photo.id);

  const handlePrev = () => {
    if (currentIndex > 0) onNavigate(photos[currentIndex - 1]);
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) onNavigate(photos[currentIndex + 1]);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black ${isOpen ? 'block' : 'hidden'}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="font-medium">{photo.legende}</p>
            <p className="text-sm text-white/60">
              Photo {currentIndex + 1} / {photos.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
              className="p-2 text-white hover:bg-white/10 rounded-lg"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-white text-sm">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(3, z + 0.25))}
              className="p-2 text-white hover:bg-white/10 rounded-lg"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button onClick={onEdit} className="p-2 text-white hover:bg-white/10 rounded-lg">
              <Edit className="w-5 h-5" />
            </button>
            <button className="p-2 text-white hover:bg-white/10 rounded-lg">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="absolute inset-0 flex items-center justify-center p-20">
        <img
          src={photo.url}
          alt={photo.legende}
          className="max-w-full max-h-full object-contain transition-transform"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>

      {/* Navigation */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}
      {currentIndex < photos.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Infos bas */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-4 text-white/60 text-sm">
          {photo.date_prise && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDateFr(photo.date_prise)}
            </span>
          )}
          {photo.latitude && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
            </span>
          )}
          {photo.categorie && (
            <span className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {CATEGORIES_PHOTOS.find(c => c.value === photo.categorie)?.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL ANNOTATION PHOTO (simplifié)
// ============================================================================

const ModalAnnotationPhoto = ({ isOpen, photo, onClose, onSave }) => {
  const [annotations, setAnnotations] = useState(photo.annotations || []);
  const [outil, setOutil] = useState('fleche');
  const canvasRef = useRef(null);

  // Simplifié - en production utiliser fabric.js ou konva
  const handleSave = () => {
    onSave(annotations);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Annoter la photo" size="xl">
      <div className="flex gap-4">
        {/* Outils */}
        <div className="w-16 space-y-2">
          {OUTILS_ANNOTATION.map(o => {
            const Icon = o.icon;
            return (
              <button
                key={o.id}
                onClick={() => setOutil(o.id)}
                className={`w-full p-3 rounded-xl transition-colors ${
                  outil === o.id 
                    ? 'bg-[#c9a227] text-white' 
                    : 'bg-[#f5f5f5] text-[#737373] hover:bg-[#e5e5e5]'
                }`}
                title={o.label}
              >
                <Icon className="w-5 h-5 mx-auto" />
              </button>
            );
          })}
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-[#f5f5f5] rounded-xl overflow-hidden relative">
          <img
            src={photo.url}
            alt={photo.legende}
            className="w-full h-auto"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#e5e5e5]">
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button variant="primary" onClick={handleSave}>Enregistrer</Button>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  GaleriePhotos,
  usePhotos,
  CATEGORIES_PHOTOS
};
