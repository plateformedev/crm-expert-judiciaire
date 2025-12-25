// ============================================================================
// CRM EXPERT JUDICIAIRE - INTÉGRATION OPALEXE
// Plateforme d'échange de documents entre experts judiciaires et juridictions
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Building2, Upload, Download, FileText, Clock, CheckCircle,
  AlertTriangle, RefreshCw, Loader2, ExternalLink, Eye,
  FolderOpen, Send, Inbox, Archive, Search, Filter
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase, EmptyState } from '../ui';
import { formatDateFr, formatTailleFichier } from '../../utils/helpers';

// ============================================================================
// CONFIGURATION OPALEXE
// ============================================================================

const OPALEXE_CONFIG = {
  baseUrl: import.meta.env.VITE_OPALEXE_URL || 'https://opalexe.justice.gouv.fr',
  apiUrl: import.meta.env.VITE_OPALEXE_API_URL || '',
  isConfigured: () => !!import.meta.env.VITE_OPALEXE_API_URL
};

// Types de documents OPALEXE
const TYPES_DOCUMENTS = {
  'rapport': { label: 'Rapport d\'expertise', icon: FileText, color: 'blue' },
  'dire': { label: 'Dire de partie', icon: FileText, color: 'amber' },
  'note': { label: 'Note technique', icon: FileText, color: 'gray' },
  'piece': { label: 'Pièce jointe', icon: FileText, color: 'green' },
  'convocation': { label: 'Convocation', icon: FileText, color: 'purple' },
  'ordonnance': { label: 'Ordonnance', icon: FileText, color: 'red' }
};

// Statuts de dossier
const STATUTS_DOSSIER = {
  'en_cours': { label: 'En cours', color: 'blue' },
  'attente_rapport': { label: 'Attente rapport', color: 'amber' },
  'rapport_depose': { label: 'Rapport déposé', color: 'green' },
  'cloture': { label: 'Clôturé', color: 'gray' }
};

// ============================================================================
// SERVICE OPALEXE
// ============================================================================

class OpalexeService {
  constructor() {
    this.token = import.meta.env.VITE_OPALEXE_TOKEN;
    this.userId = import.meta.env.VITE_OPALEXE_USER_ID;
  }

  isConfigured() {
    return OPALEXE_CONFIG.isConfigured();
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      'X-Opalexe-User': this.userId
    };
  }

  // Récupérer les dossiers
  async getDossiers(options = {}) {
    if (!this.isConfigured()) {
      return this.simulateDossiers();
    }

    try {
      const params = new URLSearchParams({
        page: options.page || 1,
        per_page: options.perPage || 20,
        ...(options.status && { status: options.status })
      });

      const response = await fetch(`${OPALEXE_CONFIG.apiUrl}/dossiers?${params}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) throw new Error('Erreur récupération dossiers');
      return await response.json();
    } catch (error) {
      console.error('Erreur OPALEXE:', error);
      throw error;
    }
  }

  // Récupérer les documents d'un dossier
  async getDocuments(dossierId) {
    if (!this.isConfigured()) {
      return this.simulateDocuments(dossierId);
    }

    try {
      const response = await fetch(`${OPALEXE_CONFIG.apiUrl}/dossiers/${dossierId}/documents`, {
        headers: this.getHeaders()
      });

      if (!response.ok) throw new Error('Erreur récupération documents');
      return await response.json();
    } catch (error) {
      console.error('Erreur OPALEXE:', error);
      throw error;
    }
  }

  // Déposer un document
  async deposerDocument(dossierId, document, type, metadata = {}) {
    if (!this.isConfigured()) {
      return this.simulateDepot(dossierId, document, type);
    }

    try {
      const formData = new FormData();
      formData.append('file', document);
      formData.append('type', type);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await fetch(`${OPALEXE_CONFIG.apiUrl}/dossiers/${dossierId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'X-Opalexe-User': this.userId
        },
        body: formData
      });

      if (!response.ok) throw new Error('Erreur dépôt document');
      return await response.json();
    } catch (error) {
      console.error('Erreur OPALEXE:', error);
      throw error;
    }
  }

  // Télécharger un document
  async telechargerDocument(documentId) {
    if (!this.isConfigured()) {
      return { simulated: true, message: 'Mode simulation' };
    }

    try {
      const response = await fetch(`${OPALEXE_CONFIG.apiUrl}/documents/${documentId}/download`, {
        headers: this.getHeaders()
      });

      if (!response.ok) throw new Error('Erreur téléchargement');

      const blob = await response.blob();
      return { blob, url: URL.createObjectURL(blob) };
    } catch (error) {
      console.error('Erreur OPALEXE:', error);
      throw error;
    }
  }

  // Simulations
  simulateDossiers() {
    return {
      data: [
        {
          id: 'opalexe-001',
          numero_rg: '23/00456',
          juridiction: 'TJ Paris',
          affaire: 'SCI Les Tilleuls c/ Entreprise DUBOIS',
          statut: 'en_cours',
          date_designation: '2024-01-15',
          date_limite_depot: '2024-06-15',
          documents_count: 12
        },
        {
          id: 'opalexe-002',
          numero_rg: '23/01234',
          juridiction: 'TJ Nanterre',
          affaire: 'MARTIN c/ SARL Construction Plus',
          statut: 'attente_rapport',
          date_designation: '2024-02-20',
          date_limite_depot: '2024-08-20',
          documents_count: 8
        },
        {
          id: 'opalexe-003',
          numero_rg: '22/05678',
          juridiction: 'CA Paris',
          affaire: 'Syndicat copropriétaires c/ Architecte LEROY',
          statut: 'rapport_depose',
          date_designation: '2023-06-10',
          date_limite_depot: '2024-03-10',
          documents_count: 25
        }
      ],
      pagination: { total: 3, page: 1 },
      simulated: true
    };
  }

  simulateDocuments(dossierId) {
    return {
      data: [
        {
          id: 'doc-001',
          nom: 'Ordonnance de désignation.pdf',
          type: 'ordonnance',
          taille: 156789,
          date_depot: '2024-01-15',
          emetteur: 'TJ Paris',
          lu: true
        },
        {
          id: 'doc-002',
          nom: 'Dire du demandeur.pdf',
          type: 'dire',
          taille: 2456789,
          date_depot: '2024-02-20',
          emetteur: 'Me DUPONT (Avocat)',
          lu: true
        },
        {
          id: 'doc-003',
          nom: 'Photos désordres.zip',
          type: 'piece',
          taille: 15678900,
          date_depot: '2024-03-01',
          emetteur: 'Expert',
          lu: false
        }
      ],
      simulated: true
    };
  }

  simulateDepot(dossierId, document, type) {
    return {
      success: true,
      documentId: `doc-${Date.now()}`,
      message: 'Document déposé avec succès (simulation)',
      simulated: true
    };
  }
}

export const opalexeService = new OpalexeService();

// ============================================================================
// COMPOSANT PRINCIPAL - PANNEAU OPALEXE
// ============================================================================

export const OpalexePanel = ({ affaire }) => {
  const [dossiers, setDossiers] = useState([]);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadDossiers();
  }, []);

  const loadDossiers = async () => {
    setLoading(true);
    try {
      const result = await opalexeService.getDossiers();
      setDossiers(result.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (dossierId) => {
    try {
      const result = await opalexeService.getDocuments(dossierId);
      setDocuments(result.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSelectDossier = (dossier) => {
    setSelectedDossier(dossier);
    loadDocuments(dossier.id);
  };

  const isConfigured = opalexeService.isConfigured();

  const dossiersFiltres = dossiers.filter(d =>
    search === '' ||
    d.numero_rg?.toLowerCase().includes(search.toLowerCase()) ||
    d.affaire?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                          ${isConfigured ? 'bg-blue-100' : 'bg-amber-100'}`}>
            <Building2 className={`w-6 h-6 ${isConfigured ? 'text-blue-600' : 'text-amber-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-[#1a1a1a]">OPALEXE</h3>
            <p className="text-sm text-[#737373]">
              Plateforme d'échange juridictions
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          icon={ExternalLink}
          onClick={() => window.open(OPALEXE_CONFIG.baseUrl, '_blank')}
        >
          Accéder à OPALEXE
        </Button>
      </div>

      {/* Alerte si non configuré */}
      {!isConfigured && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800">Mode simulation</h4>
              <p className="text-sm text-amber-700 mt-1">
                OPALEXE n'est pas configuré. L'API OPALEXE nécessite une authentification
                via les services du Ministère de la Justice.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Recherche */}
      <Input
        icon={Search}
        placeholder="Rechercher par n° RG ou affaire..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Contenu */}
      <div className="grid grid-cols-2 gap-6">
        {/* Liste des dossiers */}
        <div>
          <h4 className="font-medium text-[#1a1a1a] mb-3">Mes dossiers</h4>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
            </div>
          ) : dossiersFiltres.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Aucun dossier"
              description="Vos dossiers OPALEXE apparaîtront ici"
            />
          ) : (
            <div className="space-y-2">
              {dossiersFiltres.map(dossier => (
                <DossierCard
                  key={dossier.id}
                  dossier={dossier}
                  selected={selectedDossier?.id === dossier.id}
                  onClick={() => handleSelectDossier(dossier)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Documents du dossier */}
        <div>
          <h4 className="font-medium text-[#1a1a1a] mb-3">
            {selectedDossier ? `Documents - RG ${selectedDossier.numero_rg}` : 'Documents'}
          </h4>

          {!selectedDossier ? (
            <EmptyState
              icon={FileText}
              title="Sélectionnez un dossier"
              description="Les documents s'afficheront ici"
            />
          ) : (
            <DocumentsList
              documents={documents}
              dossierId={selectedDossier.id}
              onRefresh={() => loadDocuments(selectedDossier.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CARTE DOSSIER
// ============================================================================

const DossierCard = ({ dossier, selected, onClick }) => {
  const statutInfo = STATUTS_DOSSIER[dossier.statut] || { label: dossier.statut, color: 'gray' };
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
    gray: 'bg-gray-100 text-gray-700'
  };

  return (
    <Card
      className={`p-4 cursor-pointer transition-colors ${
        selected ? 'border-[#2563EB] bg-[#fafafa]' : 'hover:border-[#2563EB]'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="font-mono font-medium text-[#2563EB]">
          RG {dossier.numero_rg}
        </div>
        <Badge className={colorClasses[statutInfo.color]}>
          {statutInfo.label}
        </Badge>
      </div>

      <div className="text-sm text-[#1a1a1a] mb-2 line-clamp-2">
        {dossier.affaire}
      </div>

      <div className="flex items-center justify-between text-xs text-[#737373]">
        <span>{dossier.juridiction}</span>
        <span>{dossier.documents_count} documents</span>
      </div>
    </Card>
  );
};

// ============================================================================
// LISTE DOCUMENTS
// ============================================================================

const DocumentsList = ({ documents, dossierId, onRefresh }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file, type) => {
    setUploading(true);
    try {
      await opalexeService.deposerDocument(dossierId, file, type);
      onRefresh();
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setUploading(false);
    }
  };

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Aucun document"
        description="Ce dossier ne contient pas encore de documents"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          icon={Upload}
          onClick={() => document.getElementById('opalexe-upload').click()}
          loading={uploading}
        >
          Déposer document
        </Button>
        <input
          type="file"
          id="opalexe-upload"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) handleUpload(file, 'piece');
          }}
        />
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={onRefresh}>
          Actualiser
        </Button>
      </div>

      {/* Liste */}
      <div className="space-y-2">
        {documents.map(doc => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// CARTE DOCUMENT
// ============================================================================

const DocumentCard = ({ document }) => {
  const typeInfo = TYPES_DOCUMENTS[document.type] || {
    label: document.type,
    icon: FileText,
    color: 'gray'
  };
  const TypeIcon = typeInfo.icon;

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    gray: 'bg-gray-100 text-gray-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  };

  const handleDownload = async () => {
    try {
      const result = await opalexeService.telechargerDocument(document.id);
      if (result.url) {
        const a = document.createElement('a');
        a.href = result.url;
        a.download = document.nom;
        a.click();
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error);
    }
  };

  return (
    <Card className={`p-3 ${!document.lu ? 'bg-blue-50 border-blue-200' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                        ${colorClasses[typeInfo.color]}`}>
          <TypeIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-[#1a1a1a] truncate">
            {document.nom}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#737373]">
            <span>{typeInfo.label}</span>
            <span>•</span>
            <span>{formatTailleFichier(document.taille)}</span>
            <span>•</span>
            <span>{formatDateFr(document.date_depot)}</span>
          </div>
          <div className="text-xs text-[#a3a3a3]">{document.emetteur}</div>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors"
            title="Télécharger"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 text-[#737373]" />
          </button>
          <button
            className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors"
            title="Aperçu"
          >
            <Eye className="w-4 h-4 text-[#737373]" />
          </button>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// WIDGET COMPACT OPALEXE
// ============================================================================

export const OpalexeWidget = ({ affaire }) => {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        icon={Building2}
        onClick={() => setShowPanel(true)}
      >
        OPALEXE
      </Button>

      <ModalBase
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
        title="OPALEXE - Échanges juridictions"
        size="xl"
      >
        <OpalexePanel affaire={affaire} />
      </ModalBase>
    </>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default OpalexePanel;
