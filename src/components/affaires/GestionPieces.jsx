import React, { useState, useMemo, useCallback } from 'react';
import {
  FileText, Folder, FolderPlus, Upload, Download, Eye,
  Search, Filter, Tag, MoreVertical, Edit2, Trash2,
  Check, X, ChevronDown, ChevronRight, File, Image,
  FileSpreadsheet, FileType, Clock, User, AlertCircle,
  Plus, Copy, Printer, Archive, List, Grid3X3,
  SortAsc, SortDesc, CheckSquare, Square
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase, useToast, DropZone } from '../ui';

// Catégories de pièces
const CATEGORIES_PIECES = [
  {
    id: 'ordonnance',
    label: 'Ordonnances et décisions',
    icon: FileText,
    color: 'purple',
    description: 'Ordonnances de désignation, jugements, décisions'
  },
  {
    id: 'technique',
    label: 'Documents techniques',
    icon: FileSpreadsheet,
    color: 'blue',
    description: 'Plans, devis, factures, contrats de travaux'
  },
  {
    id: 'photos',
    label: 'Photographies',
    icon: Image,
    color: 'green',
    description: 'Photos des désordres, du bien, des réunions'
  },
  {
    id: 'correspondance',
    label: 'Correspondances',
    icon: FileText,
    color: 'orange',
    description: 'Courriers, emails, mises en demeure'
  },
  {
    id: 'dires',
    label: 'Dires des parties',
    icon: FileText,
    color: 'red',
    description: 'Dires et observations des parties'
  },
  {
    id: 'rapports',
    label: 'Rapports',
    icon: FileType,
    color: 'indigo',
    description: 'Pré-rapport, rapport final, annexes'
  },
  {
    id: 'assurance',
    label: 'Assurances',
    icon: FileText,
    color: 'teal',
    description: 'Polices, attestations, déclarations sinistre'
  },
  {
    id: 'divers',
    label: 'Divers',
    icon: Folder,
    color: 'gray',
    description: 'Autres documents'
  }
];

// Types de fichiers avec icônes
const FILE_TYPES = {
  pdf: { icon: FileType, color: 'red', label: 'PDF' },
  doc: { icon: FileText, color: 'blue', label: 'Word' },
  docx: { icon: FileText, color: 'blue', label: 'Word' },
  xls: { icon: FileSpreadsheet, color: 'green', label: 'Excel' },
  xlsx: { icon: FileSpreadsheet, color: 'green', label: 'Excel' },
  jpg: { icon: Image, color: 'purple', label: 'Image' },
  jpeg: { icon: Image, color: 'purple', label: 'Image' },
  png: { icon: Image, color: 'purple', label: 'Image' },
  default: { icon: File, color: 'gray', label: 'Fichier' }
};

const getFileType = (filename) => {
  if (!filename) return FILE_TYPES.default;
  const ext = filename.split('.').pop()?.toLowerCase();
  return FILE_TYPES[ext] || FILE_TYPES.default;
};

const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Modal d'ajout/édition de pièce
const ModalPiece = ({ piece, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nom: piece?.nom || '',
    categorie: piece?.categorie || 'divers',
    description: piece?.description || '',
    partie_source: piece?.partie_source || '',
    date_reception: piece?.date_reception || new Date().toISOString().split('T')[0],
    numero_piece: piece?.numero_piece || '',
    confidentiel: piece?.confidentiel || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nom.trim()) return;
    onSave({
      ...piece,
      ...formData,
      id: piece?.id || Date.now(),
      date_modification: new Date().toISOString()
    });
  };

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title={piece?.id ? 'Modifier la pièce' : 'Ajouter une pièce'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du document *
          </label>
          <input
            type="text"
            value={formData.nom}
            onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Ordonnance de désignation"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              value={formData.categorie}
              onChange={(e) => setFormData(prev => ({ ...prev, categorie: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° de pièce
            </label>
            <input
              type="text"
              value={formData.numero_piece}
              onChange={(e) => setFormData(prev => ({ ...prev, numero_piece: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: P1, D-001"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source / Partie
            </label>
            <input
              type="text"
              value={formData.partie_source}
              onChange={(e) => setFormData(prev => ({ ...prev, partie_source: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Demandeur, Défendeur"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de réception
            </label>
            <input
              type="date"
              value={formData.date_reception}
              onChange={(e) => setFormData(prev => ({ ...prev, date_reception: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Description ou commentaire sur le document..."
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.confidentiel}
            onChange={(e) => setFormData(prev => ({ ...prev, confidentiel: e.target.checked }))}
            className="w-4 h-4 text-red-600 rounded"
          />
          <span className="text-sm text-gray-700">Document confidentiel</span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" type="submit">
            Enregistrer
          </Button>
        </div>
      </form>
    </ModalBase>
  );
};

// Composant carte de pièce
const PieceCard = ({ piece, selected, onSelect, onEdit, onDelete, onView }) => {
  const [showMenu, setShowMenu] = useState(false);
  const fileType = getFileType(piece.fichier || piece.nom);
  const FileIcon = fileType.icon;
  const categorie = CATEGORIES_PIECES.find(c => c.id === piece.categorie);

  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    teal: 'bg-teal-100 text-teal-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <div className={`bg-white border rounded-xl p-4 hover:shadow-md transition-all ${
      selected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(piece.id); }}
          className="mt-1"
        >
          {selected ? (
            <CheckSquare className="w-5 h-5 text-blue-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />
          )}
        </button>

        {/* Icône du fichier */}
        <div className={`p-2 rounded-lg ${colorClasses[fileType.color]}`}>
          <FileIcon className="w-5 h-5" />
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {piece.numero_piece && (
              <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                {piece.numero_piece}
              </span>
            )}
            <h4 className="font-medium text-gray-900 truncate">{piece.nom}</h4>
            {piece.confidentiel && (
              <Badge variant="error">Confidentiel</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className={`px-1.5 py-0.5 rounded ${colorClasses[categorie?.color || 'gray']}`}>
              {categorie?.label || 'Divers'}
            </span>
            {piece.partie_source && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {piece.partie_source}
              </span>
            )}
            {piece.date_reception && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(piece.date_reception).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
          {piece.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{piece.description}</p>
          )}
        </div>

        {/* Menu actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border py-1 z-20">
                <button
                  onClick={() => { onView(piece); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Voir
                </button>
                <button
                  onClick={() => { onEdit(piece); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Modifier
                </button>
                <button
                  onClick={() => { onDelete(piece); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t"
                >
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Générateur de bordereau
const genererBordereau = (pieces, affaire, titre = 'Bordereau des pièces') => {
  const dateGeneration = new Date().toLocaleDateString('fr-FR');

  let html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${titre}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { font-size: 18px; text-align: center; margin-bottom: 20px; }
    .info { margin-bottom: 20px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #333; padding: 8px; text-align: left; }
    th { background: #f0f0f0; }
    .numero { width: 60px; }
    .categorie { width: 120px; }
    .date { width: 80px; }
    .source { width: 100px; }
    .footer { margin-top: 30px; font-size: 10px; text-align: right; color: #666; }
  </style>
</head>
<body>
  <h1>${titre.toUpperCase()}</h1>
  <div class="info">
    <p><strong>Affaire :</strong> ${affaire?.reference || 'N/A'}</p>
    <p><strong>RG :</strong> ${affaire?.numero_rg || 'N/A'}</p>
    <p><strong>Nombre de pièces :</strong> ${pieces.length}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th class="numero">N°</th>
        <th>Désignation</th>
        <th class="categorie">Catégorie</th>
        <th class="source">Source</th>
        <th class="date">Date</th>
      </tr>
    </thead>
    <tbody>
      ${pieces.map((p, idx) => {
        const cat = CATEGORIES_PIECES.find(c => c.id === p.categorie);
        return `
          <tr>
            <td class="numero">${p.numero_piece || idx + 1}</td>
            <td>${p.nom}${p.description ? `<br/><small style="color:#666">${p.description}</small>` : ''}</td>
            <td class="categorie">${cat?.label || 'Divers'}</td>
            <td class="source">${p.partie_source || '-'}</td>
            <td class="date">${p.date_reception ? new Date(p.date_reception).toLocaleDateString('fr-FR') : '-'}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>
  <div class="footer">
    Bordereau généré le ${dateGeneration}
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.onload = () => {
      win.print();
    };
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

// Composant principal
export const GestionPieces = ({ affaire, onUpdate }) => {
  const { toast } = useToast();
  const [pieces, setPieces] = useState(affaire?.pieces || []);
  const [search, setSearch] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'nom' | 'numero'
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingPiece, setEditingPiece] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  // Filtrage et tri
  const piecesFiltrees = useMemo(() => {
    let result = pieces;

    // Recherche
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(p =>
        p.nom?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.numero_piece?.toLowerCase().includes(searchLower) ||
        p.partie_source?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre catégorie
    if (filterCategorie !== 'all') {
      result = result.filter(p => p.categorie === filterCategorie);
    }

    // Tri
    result = [...result].sort((a, b) => {
      let compare = 0;
      switch (sortBy) {
        case 'nom':
          compare = (a.nom || '').localeCompare(b.nom || '');
          break;
        case 'numero':
          compare = (a.numero_piece || '').localeCompare(b.numero_piece || '');
          break;
        case 'date':
        default:
          compare = new Date(b.date_reception || 0) - new Date(a.date_reception || 0);
          break;
      }
      return sortOrder === 'asc' ? compare : -compare;
    });

    return result;
  }, [pieces, search, filterCategorie, sortBy, sortOrder]);

  // Stats par catégorie
  const statsByCategorie = useMemo(() => {
    const stats = {};
    pieces.forEach(p => {
      stats[p.categorie] = (stats[p.categorie] || 0) + 1;
    });
    return stats;
  }, [pieces]);

  const handleSavePiece = useCallback((piece) => {
    setPieces(prev => {
      const exists = prev.find(p => p.id === piece.id);
      const newPieces = exists
        ? prev.map(p => p.id === piece.id ? piece : p)
        : [...prev, piece];

      // Sauvegarder dans l'affaire
      if (onUpdate) {
        onUpdate({ pieces: newPieces });
      }

      return newPieces;
    });
    setEditingPiece(null);
    toast({
      title: "Pièce enregistrée",
      description: "La pièce a été ajoutée au dossier."
    });
  }, [onUpdate, toast]);

  const handleDeletePiece = useCallback((piece) => {
    if (!confirm('Supprimer cette pièce ?')) return;

    setPieces(prev => {
      const newPieces = prev.filter(p => p.id !== piece.id);
      if (onUpdate) {
        onUpdate({ pieces: newPieces });
      }
      return newPieces;
    });
    toast({
      title: "Pièce supprimée"
    });
  }, [onUpdate, toast]);

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === piecesFiltrees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(piecesFiltrees.map(p => p.id));
    }
  };

  const handleGenerateBordereau = () => {
    const piecesToExport = selectedIds.length > 0
      ? pieces.filter(p => selectedIds.includes(p.id))
      : piecesFiltrees;

    if (piecesToExport.length === 0) {
      toast({
        title: "Aucune pièce",
        description: "Sélectionnez des pièces ou retirez les filtres"
      });
      return;
    }

    genererBordereau(piecesToExport, affaire);
    toast({
      title: "Bordereau généré",
      description: `${piecesToExport.length} pièce(s) dans le bordereau`
    });
  };

  const handleFilesUploaded = (files) => {
    files.forEach(file => {
      const newPiece = {
        id: Date.now() + Math.random(),
        nom: file.name,
        fichier: file.name,
        categorie: 'divers',
        date_reception: new Date().toISOString().split('T')[0],
        taille: file.size,
        date_modification: new Date().toISOString()
      };
      handleSavePiece(newPiece);
    });
    setShowUpload(false);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Folder className="w-6 h-6 text-blue-600" />
            Gestion des pièces
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {pieces.length} pièce(s) au dossier
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={Printer} onClick={handleGenerateBordereau}>
            Bordereau
          </Button>
          <Button variant="secondary" icon={Upload} onClick={() => setShowUpload(true)}>
            Importer
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setEditingPiece({})}>
            Ajouter
          </Button>
        </div>
      </div>

      {/* Stats par catégorie */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategorie('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filterCategorie === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tous ({pieces.length})
        </button>
        {CATEGORIES_PIECES.map(cat => {
          const count = statsByCategorie[cat.id] || 0;
          if (count === 0) return null;
          const CatIcon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategorie(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterCategorie === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CatIcon className="w-3.5 h-3.5" />
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Barre de recherche et tri */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="date">Trier par date</option>
          <option value="nom">Trier par nom</option>
          <option value="numero">Trier par numéro</option>
        </select>

        <button
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="p-2 border rounded-lg hover:bg-gray-50"
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="w-5 h-5 text-gray-600" />
          ) : (
            <SortDesc className="w-5 h-5 text-gray-600" />
          )}
        </button>

        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
          >
            <List className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
          >
            <Grid3X3 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Actions sur sélection */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {selectedIds.length === piecesFiltrees.length ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
          <span className="text-sm text-blue-700">
            {selectedIds.length} pièce(s) sélectionnée(s)
          </span>
          <div className="flex-1" />
          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={handleGenerateBordereau}
          >
            Bordereau sélection
          </Button>
        </div>
      )}

      {/* Liste des pièces */}
      {piecesFiltrees.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucune pièce trouvée</p>
          <Button
            variant="secondary"
            icon={Plus}
            onClick={() => setEditingPiece({})}
            className="mt-4"
          >
            Ajouter une pièce
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-3'
        }>
          {piecesFiltrees.map(piece => (
            <PieceCard
              key={piece.id}
              piece={piece}
              selected={selectedIds.includes(piece.id)}
              onSelect={handleToggleSelect}
              onEdit={setEditingPiece}
              onDelete={handleDeletePiece}
              onView={() => toast({ title: "Visualisation", description: "Fonctionnalité à venir" })}
            />
          ))}
        </div>
      )}

      {/* Modal édition */}
      {editingPiece && (
        <ModalPiece
          piece={editingPiece.id ? editingPiece : null}
          categories={CATEGORIES_PIECES}
          onSave={handleSavePiece}
          onClose={() => setEditingPiece(null)}
        />
      )}

      {/* Modal upload */}
      {showUpload && (
        <ModalBase
          isOpen={true}
          onClose={() => setShowUpload(false)}
          title="Importer des documents"
          size="md"
        >
          <div className="p-4">
            <DropZone
              onFilesSelected={handleFilesUploaded}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              maxSize={10 * 1024 * 1024}
              multiple={true}
            />
          </div>
        </ModalBase>
      )}
    </div>
  );
};

export default GestionPieces;
