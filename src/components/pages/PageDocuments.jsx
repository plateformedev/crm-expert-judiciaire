// ============================================================================
// CRM EXPERT JUDICIAIRE - PAGE DOCUMENTS
// Bibliothèque centralisée de tous les documents
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  FileText, Folder, FolderOpen, Search, Filter, Download, Upload,
  Eye, Edit, Trash2, Copy, Plus, Grid, List, Clock, User,
  File, FileImage, FileSpreadsheet, Image, Video,
  CheckCircle, AlertTriangle, Star, StarOff, MoreVertical,
  ChevronRight, ChevronDown, ArrowRight, Tag, Calendar
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase, useToast } from '../ui';
import { getStoredAffaires } from '../../lib/demoData';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// CONSTANTES
// ============================================================================

const CATEGORIES_DOCUMENTS = [
  { id: 'ordonnances', label: 'Ordonnances', icon: FileText, color: 'blue' },
  { id: 'convocations', label: 'Convocations', icon: FileText, color: 'indigo' },
  { id: 'comptes_rendus', label: 'Comptes-rendus', icon: FileText, color: 'purple' },
  { id: 'dires', label: 'Dires des parties', icon: FileText, color: 'amber' },
  { id: 'rapports', label: 'Rapports', icon: FileText, color: 'green' },
  { id: 'photos', label: 'Photos', icon: Image, color: 'pink' },
  { id: 'plans', label: 'Plans', icon: FileImage, color: 'cyan' },
  { id: 'devis', label: 'Devis', icon: FileSpreadsheet, color: 'orange' },
  { id: 'factures', label: 'Factures', icon: FileSpreadsheet, color: 'emerald' },
  { id: 'correspondance', label: 'Correspondance', icon: FileText, color: 'gray' }
];

const TYPE_ICONS = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  jpg: Image,
  jpeg: Image,
  png: Image,
  default: File
};

// ============================================================================
// COMPOSANT: Document Item
// ============================================================================

const DocumentItem = ({ doc, viewMode, onView, onDownload, onToggleFavorite }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const extension = doc.nom?.split('.').pop()?.toLowerCase() || 'default';
  const Icon = TYPE_ICONS[extension] || TYPE_ICONS.default;

  if (viewMode === 'grid') {
    return (
      <Card className="p-4 hover:border-[#c9a227] transition-colors cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            extension === 'pdf' ? 'bg-red-100' :
            ['jpg', 'jpeg', 'png'].includes(extension) ? 'bg-pink-100' :
            ['xls', 'xlsx'].includes(extension) ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            <Icon className={`w-6 h-6 ${
              extension === 'pdf' ? 'text-red-600' :
              ['jpg', 'jpeg', 'png'].includes(extension) ? 'text-pink-600' :
              ['xls', 'xlsx'].includes(extension) ? 'text-green-600' : 'text-blue-600'
            }`} />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(doc.id); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {doc.favori ? (
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            ) : (
              <StarOff className="w-5 h-5 text-[#a3a3a3] hover:text-amber-500" />
            )}
          </button>
        </div>

        <p className="font-medium text-sm text-[#1a1a1a] truncate" title={doc.nom}>
          {doc.nom}
        </p>
        <p className="text-xs text-[#737373] mt-1">{doc.affaire_reference}</p>
        <p className="text-xs text-[#a3a3a3]">{formatDateFr(doc.date_ajout)}</p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e5e5e5]">
          <Badge variant="default" className="text-xs">{doc.categorie}</Badge>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onView(doc); }}
              className="p-1 hover:bg-[#f5f5f5] rounded"
            >
              <Eye className="w-4 h-4 text-[#737373]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(doc); }}
              className="p-1 hover:bg-[#f5f5f5] rounded"
            >
              <Download className="w-4 h-4 text-[#737373]" />
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // Vue liste
  return (
    <div className="flex items-center gap-4 p-3 border border-[#e5e5e5] rounded-lg hover:border-[#c9a227] transition-colors group">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
        extension === 'pdf' ? 'bg-red-100' :
        ['jpg', 'jpeg', 'png'].includes(extension) ? 'bg-pink-100' :
        ['xls', 'xlsx'].includes(extension) ? 'bg-green-100' : 'bg-blue-100'
      }`}>
        <Icon className={`w-5 h-5 ${
          extension === 'pdf' ? 'text-red-600' :
          ['jpg', 'jpeg', 'png'].includes(extension) ? 'text-pink-600' :
          ['xls', 'xlsx'].includes(extension) ? 'text-green-600' : 'text-blue-600'
        }`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-[#1a1a1a] truncate">{doc.nom}</p>
        <p className="text-xs text-[#737373]">{doc.affaire_reference}</p>
      </div>

      <Badge variant="default" className="text-xs">{doc.categorie}</Badge>

      <p className="text-xs text-[#a3a3a3] w-24 text-right">{formatDateFr(doc.date_ajout)}</p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleFavorite(doc.id)}
          className="p-1 hover:bg-[#f5f5f5] rounded"
        >
          {doc.favori ? (
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          ) : (
            <StarOff className="w-4 h-4 text-[#a3a3a3]" />
          )}
        </button>
        <button onClick={() => onView(doc)} className="p-1 hover:bg-[#f5f5f5] rounded">
          <Eye className="w-4 h-4 text-[#737373]" />
        </button>
        <button onClick={() => onDownload(doc)} className="p-1 hover:bg-[#f5f5f5] rounded">
          <Download className="w-4 h-4 text-[#737373]" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const PageDocuments = () => {
  const toast = useToast();
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('tous');
  const [selectedAffaire, setSelectedAffaire] = useState('tous');
  const [showFavorisOnly, setShowFavorisOnly] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('document_favorites') || '[]');
    } catch {
      return [];
    }
  });
  const [selectedDocument, setSelectedDocument] = useState(null);

  const affaires = getStoredAffaires();

  // Générer les documents à partir des affaires
  const documents = useMemo(() => {
    const docs = [];

    affaires.forEach(affaire => {
      // Ordonnance
      docs.push({
        id: `ord-${affaire.id}`,
        nom: `Ordonnance_${affaire.rg.replace('/', '-')}.pdf`,
        categorie: 'ordonnances',
        affaire_id: affaire.id,
        affaire_reference: affaire.reference,
        date_ajout: affaire.date_ordonnance,
        taille: '245 Ko',
        favori: false
      });

      // Convocations
      (affaire.reunions || []).forEach((reunion, idx) => {
        if (reunion.date_convocation || reunion.convocations_envoyees?.length > 0) {
          docs.push({
            id: `conv-${affaire.id}-${idx}`,
            nom: `Convocation_R${reunion.numero}.pdf`,
            categorie: 'convocations',
            affaire_id: affaire.id,
            affaire_reference: affaire.reference,
            date_ajout: reunion.date_convocation || reunion.date_reunion,
            taille: '125 Ko',
            favori: false
          });
        }

        // Comptes-rendus
        if (reunion.compte_rendu || reunion.statut === 'terminee') {
          docs.push({
            id: `cr-${affaire.id}-${idx}`,
            nom: `Compte_rendu_R${reunion.numero}.pdf`,
            categorie: 'comptes_rendus',
            affaire_id: affaire.id,
            affaire_reference: affaire.reference,
            date_ajout: reunion.date_compte_rendu || reunion.date_reunion,
            taille: '320 Ko',
            favori: false
          });
        }

        // Photos
        (reunion.photos || []).forEach((photo, photoIdx) => {
          docs.push({
            id: `photo-${affaire.id}-${idx}-${photoIdx}`,
            nom: photo.nom || `Photo_R${reunion.numero}_${photoIdx + 1}.jpg`,
            categorie: 'photos',
            affaire_id: affaire.id,
            affaire_reference: affaire.reference,
            date_ajout: photo.date || reunion.date_reunion,
            taille: '2.3 Mo',
            favori: false
          });
        });
      });

      // Dires
      (affaire.dires || []).forEach((dire, idx) => {
        docs.push({
          id: `dire-${affaire.id}-${idx}`,
          nom: `Dire_${dire.partie}_${idx + 1}.pdf`,
          categorie: 'dires',
          affaire_id: affaire.id,
          affaire_reference: affaire.reference,
          date_ajout: dire.date_reception,
          taille: '180 Ko',
          favori: false
        });
      });

      // Rapport si déposé
      if (affaire.statut === 'rapport-depose' || affaire.statut === 'archive') {
        docs.push({
          id: `rapport-${affaire.id}`,
          nom: `Rapport_definitif_${affaire.reference}.pdf`,
          categorie: 'rapports',
          affaire_id: affaire.id,
          affaire_reference: affaire.reference,
          date_ajout: affaire.date_depot_rapport || new Date().toISOString(),
          taille: '4.5 Mo',
          favori: true
        });
      }
    });

    return docs.sort((a, b) => new Date(b.date_ajout) - new Date(a.date_ajout));
  }, [affaires]);

  // Filtrer les documents
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch = !search ||
        doc.nom.toLowerCase().includes(search.toLowerCase()) ||
        doc.affaire_reference.toLowerCase().includes(search.toLowerCase());

      const matchCategorie = selectedCategorie === 'tous' || doc.categorie === selectedCategorie;
      const matchAffaire = selectedAffaire === 'tous' || doc.affaire_id === selectedAffaire;
      const isFavorite = favorites.includes(doc.id);
      const matchFavori = !showFavorisOnly || isFavorite;

      return matchSearch && matchCategorie && matchAffaire && matchFavori;
    });
  }, [documents, search, selectedCategorie, selectedAffaire, showFavorisOnly, favorites]);

  // Stats par catégorie
  const statsCategories = useMemo(() => {
    const stats = {};
    documents.forEach(doc => {
      stats[doc.categorie] = (stats[doc.categorie] || 0) + 1;
    });
    return stats;
  }, [documents]);

  const toggleFavorite = (docId) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId];
      localStorage.setItem('document_favorites', JSON.stringify(newFavorites));

      const doc = documents.find(d => d.id === docId);
      if (newFavorites.includes(docId)) {
        toast.success('Ajouté aux favoris', `"${doc?.nom}" a été ajouté à vos favoris`);
      } else {
        toast.info('Retiré des favoris', `"${doc?.nom}" a été retiré de vos favoris`);
      }
      return newFavorites;
    });
  };

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
  };

  const handleDownloadDocument = (doc) => {
    toast.info('Mode démo', `Le téléchargement de "${doc.nom}" n'est pas disponible en mode démonstration`);
  };

  const handleExportAll = () => {
    toast.success('Export lancé', `${filteredDocs.length} documents en cours d'export...`);
  };

  const handleImport = () => {
    toast.info('Import', 'L\'import de documents sera bientôt disponible');
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-[#1a1a1a]">Documents</h1>
          <p className="text-sm text-[#737373]">
            Bibliothèque de tous vos documents ({documents.length} fichiers)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={Download} onClick={handleExportAll}>
            Tout exporter
          </Button>
          <Button variant="primary" icon={Upload} onClick={handleImport}>
            Importer
          </Button>
        </div>
      </div>

      {/* Statistiques par catégorie */}
      <div className="grid grid-cols-5 gap-3">
        {CATEGORIES_DOCUMENTS.slice(0, 5).map(cat => {
          const count = statsCategories[cat.id] || 0;
          return (
            <Card
              key={cat.id}
              onClick={() => setSelectedCategorie(selectedCategorie === cat.id ? 'tous' : cat.id)}
              className={`p-4 cursor-pointer transition-all ${
                selectedCategorie === cat.id
                  ? 'border-[#c9a227] bg-[#faf8f3]'
                  : 'hover:border-[#c9a227]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  cat.color === 'blue' ? 'bg-blue-100' :
                  cat.color === 'green' ? 'bg-green-100' :
                  cat.color === 'purple' ? 'bg-purple-100' :
                  cat.color === 'amber' ? 'bg-amber-100' :
                  cat.color === 'pink' ? 'bg-pink-100' : 'bg-gray-100'
                }`}>
                  <cat.icon className={`w-5 h-5 ${
                    cat.color === 'blue' ? 'text-blue-600' :
                    cat.color === 'green' ? 'text-green-600' :
                    cat.color === 'purple' ? 'text-purple-600' :
                    cat.color === 'amber' ? 'text-amber-600' :
                    cat.color === 'pink' ? 'text-pink-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <p className="text-lg font-medium text-[#1a1a1a]">{count}</p>
                  <p className="text-xs text-[#737373]">{cat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filtres */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Input
            placeholder="Rechercher un document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
            className="w-80"
          />

          <select
            value={selectedCategorie}
            onChange={(e) => setSelectedCategorie(e.target.value)}
            className="px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm"
          >
            <option value="tous">Toutes catégories</option>
            {CATEGORIES_DOCUMENTS.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>

          <select
            value={selectedAffaire}
            onChange={(e) => setSelectedAffaire(e.target.value)}
            className="px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm"
          >
            <option value="tous">Toutes les affaires</option>
            {affaires.map(a => (
              <option key={a.id} value={a.id}>{a.reference}</option>
            ))}
          </select>

          <button
            onClick={() => setShowFavorisOnly(!showFavorisOnly)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showFavorisOnly
                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                : 'bg-[#f5f5f5] text-[#737373] hover:bg-[#e5e5e5]'
            }`}
          >
            <Star className={`w-4 h-4 ${showFavorisOnly ? 'fill-amber-500' : ''}`} />
            Favoris
          </button>
        </div>

        <div className="flex items-center gap-2 border border-[#e5e5e5] rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#1a1a1a] text-white' : 'text-[#737373]'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#1a1a1a] text-white' : 'text-[#737373]'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Liste des documents */}
      {filteredDocs.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Folder className="w-16 h-16 text-[#e5e5e5] mx-auto mb-4" />
            <p className="text-lg font-medium text-[#737373]">Aucun document trouvé</p>
            <p className="text-sm text-[#a3a3a3] mt-1">
              {search
                ? 'Essayez avec d\'autres termes de recherche'
                : 'Les documents de vos affaires apparaîtront ici'}
            </p>
          </div>
        </Card>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-4 gap-4'
          : 'space-y-2'
        }>
          {filteredDocs.map(doc => (
            <DocumentItem
              key={doc.id}
              doc={{ ...doc, favori: favorites.includes(doc.id) }}
              viewMode={viewMode}
              onView={handleViewDocument}
              onDownload={handleDownloadDocument}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Aide */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Folder className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">Organisation des documents</p>
            <p className="text-xs text-blue-600 mt-1">
              Les documents sont automatiquement classés par affaire et par catégorie.
              Utilisez les favoris pour accéder rapidement aux documents importants.
              Tous les documents générés (convocations, rapports) sont sauvegardés ici.
            </p>
          </div>
        </div>
      </Card>

      {/* Modal détail document */}
      {selectedDocument && (
        <ModalBase
          title="Détail du document"
          onClose={() => setSelectedDocument(null)}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#faf8f3] rounded-xl">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-[#e5e5e5]">
                {TYPE_ICONS[selectedDocument.nom?.split('.').pop()] ?
                  React.createElement(TYPE_ICONS[selectedDocument.nom?.split('.').pop()], {
                    className: "w-8 h-8 text-[#737373]"
                  }) :
                  <FileText className="w-8 h-8 text-[#737373]" />
                }
              </div>
              <div>
                <h3 className="font-medium text-[#1a1a1a]">{selectedDocument.nom}</h3>
                <p className="text-sm text-[#737373]">{selectedDocument.taille}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-1">Affaire</p>
                <p className="text-[#1a1a1a]">{selectedDocument.affaire_reference}</p>
              </div>
              <div>
                <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-1">Catégorie</p>
                <p className="text-[#1a1a1a] capitalize">
                  {CATEGORIES_DOCUMENTS.find(c => c.id === selectedDocument.categorie)?.label || selectedDocument.categorie}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-1">Date d'ajout</p>
                <p className="text-[#1a1a1a]">{formatDateFr(selectedDocument.date_ajout)}</p>
              </div>
              <div>
                <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-1">Taille</p>
                <p className="text-[#1a1a1a]">{selectedDocument.taille}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
              <Button
                variant="secondary"
                icon={favorites.includes(selectedDocument.id) ? StarOff : Star}
                onClick={() => toggleFavorite(selectedDocument.id)}
                className="flex-1"
              >
                {favorites.includes(selectedDocument.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </Button>
              <Button
                variant="primary"
                icon={Download}
                onClick={() => handleDownloadDocument(selectedDocument)}
                className="flex-1"
              >
                Télécharger
              </Button>
            </div>
          </div>
        </ModalBase>
      )}
    </div>
  );
};

export default PageDocuments;
