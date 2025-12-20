// ============================================================================
// CRM EXPERT JUDICIAIRE - GESTION DES DOCUMENTS
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  FileText, Upload, Download, Trash2, Eye, Search, Filter,
  FolderOpen, File, FileCheck, FilePlus, Send, Inbox,
  Calendar, User, Tag, MoreVertical, Plus, X, Check,
  AlertTriangle, Clock, ExternalLink, Paperclip
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase } from '../ui';
import { formatDateFr } from '../../utils/helpers';

// ============================================================================
// CONSTANTES
// ============================================================================

const TYPES_DOCUMENTS = [
  { id: 'ordonnance', label: 'Ordonnance', categorie: 'juridique', icone: 'FileCheck' },
  { id: 'assignation', label: 'Assignation', categorie: 'juridique', icone: 'FileText' },
  { id: 'conclusions', label: 'Conclusions', categorie: 'juridique', icone: 'FileText' },
  { id: 'piece', label: 'Pièce communiquée', categorie: 'pieces', icone: 'File' },
  { id: 'dire', label: 'Dire de partie', categorie: 'pieces', icone: 'FileText' },
  { id: 'convocation', label: 'Convocation', categorie: 'expertise', icone: 'Send' },
  { id: 'compte-rendu', label: 'Compte-rendu', categorie: 'expertise', icone: 'FileText' },
  { id: 'note-synthese', label: 'Note de synthèse', categorie: 'expertise', icone: 'FileCheck' },
  { id: 'rapport', label: 'Rapport final', categorie: 'expertise', icone: 'FileCheck' },
  { id: 'facture', label: 'Facture', categorie: 'financier', icone: 'File' },
  { id: 'courrier', label: 'Courrier', categorie: 'correspondance', icone: 'Send' },
  { id: 'email', label: 'Email', categorie: 'correspondance', icone: 'Send' },
  { id: 'photo', label: 'Photo', categorie: 'technique', icone: 'File' },
  { id: 'plan', label: 'Plan', categorie: 'technique', icone: 'File' },
  { id: 'devis', label: 'Devis', categorie: 'technique', icone: 'File' },
  { id: 'autre', label: 'Autre', categorie: 'autre', icone: 'File' }
];

const CATEGORIES = [
  { id: 'juridique', label: 'Juridique', color: 'blue' },
  { id: 'pieces', label: 'Pièces', color: 'purple' },
  { id: 'expertise', label: 'Expertise', color: 'amber' },
  { id: 'financier', label: 'Financier', color: 'green' },
  { id: 'correspondance', label: 'Correspondance', color: 'gray' },
  { id: 'technique', label: 'Technique', color: 'indigo' },
  { id: 'autre', label: 'Autre', color: 'gray' }
];

const DIRECTIONS = [
  { id: 'recu', label: 'Reçu', icon: Inbox, color: 'blue' },
  { id: 'envoye', label: 'Envoyé', icon: Send, color: 'green' }
];

// ============================================================================
// COMPOSANT: Carte de document
// ============================================================================

const DocumentCard = ({ document, parties, onView, onDelete, onDownload }) => {
  const [showMenu, setShowMenu] = useState(false);

  const typeDoc = TYPES_DOCUMENTS.find(t => t.id === document.type);
  const categorie = CATEGORIES.find(c => c.id === typeDoc?.categorie);
  const direction = DIRECTIONS.find(d => d.id === document.direction);
  const DirectionIcon = direction?.icon || FileText;

  const getPartieNom = (partieId) => {
    if (!partieId) return null;
    const partie = parties?.find(p => p.id === partieId);
    if (!partie) return partieId;
    return partie.raison_sociale || `${partie.prenom || ''} ${partie.nom}`.trim();
  };

  return (
    <div className="p-4 border border-[#e5e5e5] rounded-xl hover:border-[#c9a227] hover:shadow-md transition-all group">
      <div className="flex items-start gap-3">
        {/* Icône type */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          document.direction === 'recu' ? 'bg-blue-100' : 'bg-green-100'
        }`}>
          <DirectionIcon className={`w-5 h-5 ${
            document.direction === 'recu' ? 'text-blue-600' : 'text-green-600'
          }`} />
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-[#1a1a1a] truncate">
                {document.nom || document.titre || 'Document sans nom'}
              </h4>
              <p className="text-xs text-[#737373]">
                {typeDoc?.label || document.type}
              </p>
            </div>

            {/* Menu actions */}
            <div className="relative">
              <button
                className="p-1 hover:bg-[#f5f5f5] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical className="w-4 h-4 text-[#737373]" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-6 bg-white border border-[#e5e5e5] rounded-lg shadow-lg py-1 z-10 min-w-32">
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] flex items-center gap-2"
                    onClick={() => { onView(document); setShowMenu(false); }}
                  >
                    <Eye className="w-4 h-4" /> Voir
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f5f5] flex items-center gap-2"
                    onClick={() => { onDownload(document); setShowMenu(false); }}
                  >
                    <Download className="w-4 h-4" /> Télécharger
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                    onClick={() => { onDelete(document); setShowMenu(false); }}
                  >
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Métadonnées */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {document.date && (
              <span className="text-xs text-[#a3a3a3] flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDateFr(document.date)}
              </span>
            )}
            {document.partie_id && (
              <span className="text-xs text-[#a3a3a3] flex items-center gap-1">
                <User className="w-3 h-3" />
                {getPartieNom(document.partie_id)}
              </span>
            )}
            {categorie && (
              <Badge variant={categorie.color} className="text-xs">
                {categorie.label}
              </Badge>
            )}
          </div>

          {/* Description */}
          {document.description && (
            <p className="text-xs text-[#737373] mt-2 line-clamp-2">
              {document.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT: Modal ajout document
// ============================================================================

const ModalAjoutDocument = ({ isOpen, onClose, onSave, parties }) => {
  const [formData, setFormData] = useState({
    nom: '',
    type: '',
    direction: 'recu',
    date: new Date().toISOString().split('T')[0],
    partie_id: '',
    description: '',
    reference: ''
  });

  const handleSubmit = () => {
    if (!formData.nom || !formData.type) return;

    onSave({
      ...formData,
      id: Date.now().toString(),
      date_creation: new Date().toISOString()
    });

    setFormData({
      nom: '',
      type: '',
      direction: 'recu',
      date: new Date().toISOString().split('T')[0],
      partie_id: '',
      description: '',
      reference: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter un document"
      size="md"
    >
      <div className="space-y-4">
        {/* Direction */}
        <div className="grid grid-cols-2 gap-3">
          {DIRECTIONS.map(dir => (
            <button
              key={dir.id}
              onClick={() => setFormData(prev => ({ ...prev, direction: dir.id }))}
              className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-colors ${
                formData.direction === dir.id
                  ? 'border-[#c9a227] bg-[#faf8f3]'
                  : 'border-[#e5e5e5] hover:border-[#c9a227]'
              }`}
            >
              <dir.icon className={`w-5 h-5 ${
                dir.id === 'recu' ? 'text-blue-500' : 'text-green-500'
              }`} />
              <span className="font-medium">{dir.label}</span>
            </button>
          ))}
        </div>

        {/* Nom du document */}
        <Input
          label="Nom du document"
          value={formData.nom}
          onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
          placeholder="Ex: Ordonnance de désignation"
          required
        />

        {/* Type */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
            Type de document *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
          >
            <option value="">Sélectionner un type</option>
            {CATEGORIES.map(cat => (
              <optgroup key={cat.id} label={cat.label}>
                {TYPES_DOCUMENTS.filter(t => t.categorie === cat.id).map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Date */}
        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
        />

        {/* Partie concernée */}
        {parties && parties.length > 0 && (
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
              {formData.direction === 'recu' ? 'Émetteur' : 'Destinataire'}
            </label>
            <select
              value={formData.partie_id}
              onChange={(e) => setFormData(prev => ({ ...prev, partie_id: e.target.value }))}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
            >
              <option value="">Non spécifié</option>
              <option value="tribunal">Tribunal</option>
              {parties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.raison_sociale || `${p.prenom || ''} ${p.nom}`.trim()} ({p.type})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Référence */}
        <Input
          label="Référence"
          value={formData.reference}
          onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
          placeholder="Ex: Pièce n°12"
        />

        {/* Description */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
            placeholder="Description ou remarques..."
          />
        </div>

        {/* Zone upload (simulé) */}
        <div className="border-2 border-dashed border-[#e5e5e5] rounded-xl p-6 text-center">
          <Upload className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2" />
          <p className="text-sm text-[#737373]">
            Glissez un fichier ici ou cliquez pour sélectionner
          </p>
          <p className="text-xs text-[#a3a3a3] mt-1">
            PDF, DOC, JPG, PNG (max 10 Mo)
          </p>
          <input type="file" className="hidden" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!formData.nom || !formData.type}
          >
            Ajouter
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// COMPOSANT: Gestion des documents
// ============================================================================

export const GestionDocuments = ({ affaire, onUpdate }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState('tous');
  const [filterCategorie, setFilterCategorie] = useState('tous');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedDocument, setSelectedDocument] = useState(null);

  const documents = affaire.documents || [];

  // Documents filtrés
  const documentsFiltres = useMemo(() => {
    return documents.filter(doc => {
      // Recherche
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const nomMatch = (doc.nom || '').toLowerCase().includes(search);
        const descMatch = (doc.description || '').toLowerCase().includes(search);
        if (!nomMatch && !descMatch) return false;
      }

      // Direction
      if (filterDirection !== 'tous' && doc.direction !== filterDirection) {
        return false;
      }

      // Catégorie
      if (filterCategorie !== 'tous') {
        const typeDoc = TYPES_DOCUMENTS.find(t => t.id === doc.type);
        if (typeDoc?.categorie !== filterCategorie) return false;
      }

      return true;
    });
  }, [documents, searchQuery, filterDirection, filterCategorie]);

  // Statistiques
  const stats = useMemo(() => {
    const recus = documents.filter(d => d.direction === 'recu').length;
    const envoyes = documents.filter(d => d.direction === 'envoye').length;
    return { total: documents.length, recus, envoyes };
  }, [documents]);

  // Ajouter un document
  const handleAddDocument = (newDoc) => {
    const updatedDocs = [...documents, newDoc];
    onUpdate({ documents: updatedDocs });
  };

  // Supprimer un document
  const handleDeleteDocument = (doc) => {
    if (confirm('Supprimer ce document ?')) {
      const updatedDocs = documents.filter(d => d.id !== doc.id);
      onUpdate({ documents: updatedDocs });
    }
  };

  // Voir un document
  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
  };

  // Télécharger un document (simulé)
  const handleDownloadDocument = (doc) => {
    alert(`Téléchargement de "${doc.nom}" (simulation)`);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#1a1a1a]">Documents</h2>
          <p className="text-sm text-[#737373]">
            Gestion des pièces et correspondances
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
          Ajouter un document
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#faf8f3] rounded-xl flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-[#c9a227]" />
            </div>
            <div>
              <p className="text-2xl font-light text-[#1a1a1a]">{stats.total}</p>
              <p className="text-xs text-[#737373]">Documents total</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Inbox className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-light text-[#1a1a1a]">{stats.recus}</p>
              <p className="text-xs text-[#737373]">Documents reçus</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-light text-[#1a1a1a]">{stats.envoyes}</p>
              <p className="text-xs text-[#737373]">Documents envoyés</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Recherche */}
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un document..."
              className="w-full pl-10 pr-4 py-2 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
            />
          </div>

          {/* Filtre direction */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#737373]">Direction :</span>
            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value)}
              className="px-3 py-2 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] text-sm"
            >
              <option value="tous">Tous</option>
              <option value="recu">Reçus</option>
              <option value="envoye">Envoyés</option>
            </select>
          </div>

          {/* Filtre catégorie */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#737373]">Catégorie :</span>
            <select
              value={filterCategorie}
              onChange={(e) => setFilterCategorie(e.target.value)}
              className="px-3 py-2 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] text-sm"
            >
              <option value="tous">Toutes</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Liste des documents */}
      {documentsFiltres.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen className="w-12 h-12 text-[#e5e5e5] mx-auto mb-4" />
          <p className="text-[#737373]">
            {documents.length === 0
              ? 'Aucun document enregistré'
              : 'Aucun document ne correspond aux filtres'
            }
          </p>
          {documents.length === 0 && (
            <Button
              variant="secondary"
              icon={Plus}
              className="mt-4"
              onClick={() => setShowAddModal(true)}
            >
              Ajouter le premier document
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentsFiltres.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              parties={affaire.parties}
              onView={handleViewDocument}
              onDelete={handleDeleteDocument}
              onDownload={handleDownloadDocument}
            />
          ))}
        </div>
      )}

      {/* Modal ajout */}
      <ModalAjoutDocument
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddDocument}
        parties={affaire.parties}
      />

      {/* Modal visualisation */}
      {selectedDocument && (
        <ModalBase
          isOpen={true}
          onClose={() => setSelectedDocument(null)}
          title={selectedDocument.nom || 'Document'}
          size="lg"
        >
          <div className="space-y-6">
            {/* Métadonnées */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#faf8f3] rounded-lg">
                <p className="text-xs text-[#737373] uppercase">Type</p>
                <p className="font-medium">
                  {TYPES_DOCUMENTS.find(t => t.id === selectedDocument.type)?.label || selectedDocument.type}
                </p>
              </div>
              <div className="p-3 bg-[#faf8f3] rounded-lg">
                <p className="text-xs text-[#737373] uppercase">Direction</p>
                <p className="font-medium">
                  {selectedDocument.direction === 'recu' ? 'Document reçu' : 'Document envoyé'}
                </p>
              </div>
              <div className="p-3 bg-[#faf8f3] rounded-lg">
                <p className="text-xs text-[#737373] uppercase">Date</p>
                <p className="font-medium">
                  {selectedDocument.date ? formatDateFr(selectedDocument.date) : 'Non datée'}
                </p>
              </div>
              {selectedDocument.reference && (
                <div className="p-3 bg-[#faf8f3] rounded-lg">
                  <p className="text-xs text-[#737373] uppercase">Référence</p>
                  <p className="font-medium">{selectedDocument.reference}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedDocument.description && (
              <div>
                <p className="text-xs text-[#737373] uppercase mb-2">Description</p>
                <p className="text-sm text-[#525252]">{selectedDocument.description}</p>
              </div>
            )}

            {/* Aperçu fichier (simulé) */}
            <div className="border-2 border-dashed border-[#e5e5e5] rounded-xl p-12 text-center">
              <FileText className="w-16 h-16 text-[#e5e5e5] mx-auto mb-4" />
              <p className="text-[#a3a3a3]">Aperçu du fichier non disponible</p>
              <p className="text-xs text-[#a3a3a3] mt-1">(Mode démo)</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
              <Button variant="secondary" icon={Download} onClick={() => handleDownloadDocument(selectedDocument)}>
                Télécharger
              </Button>
              <Button variant="secondary" icon={ExternalLink}>
                Ouvrir
              </Button>
              <div className="flex-1" />
              <Button variant="secondary" onClick={() => setSelectedDocument(null)}>
                Fermer
              </Button>
            </div>
          </div>
        </ModalBase>
      )}
    </div>
  );
};

export default GestionDocuments;
