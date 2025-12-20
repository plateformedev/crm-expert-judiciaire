// ============================================================================
// CRM EXPERT JUDICIAIRE - COMPOSANTS AFFAIRES
// ============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder, Plus, Search, Filter, ChevronRight, Clock, MapPin,
  Scale, Users, Calendar, FileText, AlertCircle, Euro, Edit,
  Trash2, MoreVertical, CheckCircle, AlertTriangle, Eye,
  Building, Gavel, Phone, Mail, Save, X, Upload, Download,
  Wand2, Calculator, BookOpen, Shield, Target
} from 'lucide-react';
import { Card, Badge, Button, Input, Select, Tabs, ProgressBar, EmptyState, ModalBase } from '../ui';
import { useAffaires, useAffaireDetail, useParties } from '../../hooks/useSupabase';
import { ETAPES_TUNNEL, GARANTIES } from '../../data';
import { formatDateFr, calculerDelaiRestant, calculerAvancementTunnel } from '../../utils/helpers';

// ============================================================================
// LISTE DES AFFAIRES
// ============================================================================

export const ListeAffaires = ({ onSelectAffaire }) => {
  const navigate = useNavigate();
  const { affaires, loading, error, createAffaire, deleteAffaire } = useAffaires();
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fonction de navigation vers une affaire
  const handleSelectAffaire = useCallback((affaire) => {
    if (onSelectAffaire) {
      onSelectAffaire(affaire);
    } else {
      navigate(`/affaires/${affaire.id}`);
    }
  }, [onSelectAffaire, navigate]);

  // Filtrage
  const affairesFiltrees = useMemo(() => {
    return affaires.filter(a => {
      const matchSearch = search === '' ||
        a.reference?.toLowerCase().includes(search.toLowerCase()) ||
        a.rg?.toLowerCase().includes(search.toLowerCase()) ||
        a.tribunal?.toLowerCase().includes(search.toLowerCase()) ||
        a.bien_ville?.toLowerCase().includes(search.toLowerCase());
      const matchStatut = filterStatut === 'all' || a.statut === filterStatut;
      const matchUrgent = !filterUrgent || a.urgent;
      return matchSearch && matchStatut && matchUrgent;
    });
  }, [affaires, search, filterStatut, filterUrgent]);

  // Statistiques rapides
  const stats = useMemo(() => ({
    total: affaires.length,
    enCours: affaires.filter(a => a.statut === 'en-cours').length,
    urgentes: affaires.filter(a => a.urgent).length,
    aDeposer: affaires.filter(a => a.statut === 'pre-rapport').length
  }), [affaires]);

  const handleCreate = async (data) => {
    const result = await createAffaire(data);
    if (result.success) {
      setShowCreateModal(false);
      handleSelectAffaire(result.affaire);
    }
    return result;
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
      {/* Stats rapides */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-[#a3a3a3]">Total</p>
          <p className="text-2xl font-light text-[#1a1a1a]">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-[#a3a3a3]">En cours</p>
          <p className="text-2xl font-light text-blue-600">{stats.enCours}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-[#a3a3a3]">Urgentes</p>
          <p className="text-2xl font-light text-red-600">{stats.urgentes}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-[#a3a3a3]">À déposer</p>
          <p className="text-2xl font-light text-amber-600">{stats.aDeposer}</p>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
          <input
            type="text"
            placeholder="Rechercher par référence, RG, tribunal, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
          />
        </div>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
        >
          <option value="all">Tous statuts</option>
          <option value="en-cours">En cours</option>
          <option value="pre-rapport">Pré-rapport</option>
          <option value="termine">Terminé</option>
          <option value="archive">Archivé</option>
        </select>
        <button
          onClick={() => setFilterUrgent(!filterUrgent)}
          className={`px-4 py-3 border rounded-xl transition-colors ${
            filterUrgent 
              ? 'border-red-500 bg-red-50 text-red-600' 
              : 'border-[#e5e5e5] text-[#525252] hover:bg-[#f5f5f5]'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </button>
        <Button variant="primary" icon={Plus} onClick={() => setShowCreateModal(true)}>
          Nouvelle affaire
        </Button>
      </div>

      {/* Liste */}
      {affairesFiltrees.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="Aucune affaire"
          description={search || filterStatut !== 'all' ? "Modifiez vos critères" : "Créez votre première affaire"}
          action={() => setShowCreateModal(true)}
          actionLabel="Créer une affaire"
        />
      ) : (
        <div className="grid gap-4">
          {affairesFiltrees.map(affaire => (
            <AffaireCard
              key={affaire.id}
              affaire={affaire}
              onClick={() => handleSelectAffaire(affaire)}
            />
          ))}
        </div>
      )}

      {/* Modal création */}
      {showCreateModal && (
        <ModalNouvelleAffaire
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
};

// ============================================================================
// CARTE AFFAIRE
// ============================================================================

const AffaireCard = ({ affaire, onClick }) => {
  const avancement = calculerAvancementTunnel(affaire);
  const delaiRestant = affaire.date_echeance ? calculerDelaiRestant(affaire.date_echeance) : null;
  
  const getStatutBadge = () => {
    switch (affaire.statut) {
      case 'en-cours': return { variant: 'info', label: 'En cours' };
      case 'pre-rapport': return { variant: 'warning', label: 'Pré-rapport' };
      case 'termine': return { variant: 'success', label: 'Terminé' };
      case 'archive': return { variant: 'default', label: 'Archivé' };
      default: return { variant: 'default', label: affaire.statut };
    }
  };

  const statutBadge = getStatutBadge();

  return (
    <Card 
      onClick={onClick}
      className="p-6 cursor-pointer hover:border-[#c9a227] transition-colors group"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4 flex-1">
          {/* Icône */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            affaire.urgent ? 'bg-red-100' : 'bg-[#f5e6c8]'
          }`}>
            <Scale className={`w-6 h-6 ${affaire.urgent ? 'text-red-600' : 'text-[#c9a227]'}`} />
          </div>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-[#1a1a1a] truncate">{affaire.reference}</h3>
              {affaire.rg && <span className="text-xs text-[#a3a3a3]">RG {affaire.rg}</span>}
              <Badge variant={statutBadge.variant}>{statutBadge.label}</Badge>
              {affaire.urgent && <Badge variant="error">Urgent</Badge>}
            </div>
            
            {/* Infos secondaires */}
            <div className="flex items-center gap-4 text-sm text-[#737373] mb-3">
              {affaire.tribunal && (
                <span className="flex items-center gap-1">
                  <Gavel className="w-4 h-4" />
                  {affaire.tribunal}
                </span>
              )}
              {affaire.bien_ville && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {affaire.bien_ville}
                </span>
              )}
              {affaire.created_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDateFr(affaire.created_at)}
                </span>
              )}
            </div>

            {/* Barre de progression */}
            <div className="flex items-center gap-3">
              <ProgressBar 
                value={avancement} 
                size="sm" 
                color={avancement >= 80 ? 'green' : avancement >= 40 ? 'amber' : 'blue'}
                className="flex-1"
              />
              <span className="text-xs text-[#a3a3a3] w-10">{avancement}%</span>
            </div>
          </div>
        </div>

        {/* Indicateurs droite */}
        <div className="flex flex-col items-end gap-2">
          {delaiRestant !== null && (
            <span className={`text-xs px-2 py-1 rounded ${
              delaiRestant <= 7 ? 'bg-red-100 text-red-600' :
              delaiRestant <= 30 ? 'bg-amber-100 text-amber-600' :
              'bg-[#f5f5f5] text-[#737373]'
            }`}>
              {delaiRestant > 0 ? `J-${delaiRestant}` : 'Échéance dépassée'}
            </span>
          )}
          <ChevronRight className="w-5 h-5 text-[#a3a3a3] group-hover:text-[#c9a227] transition-colors" />
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// MODAL NOUVELLE AFFAIRE
// ============================================================================

const ModalNouvelleAffaire = ({ onClose, onCreate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    tribunal: '',
    rg: '',
    date_ordonnance: '',
    date_echeance: '',
    bien_adresse: '',
    bien_code_postal: '',
    bien_ville: '',
    bien_type: 'Maison',
    mission: '',
    provision_montant: '',
    urgent: false
  });

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await onCreate(data);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <ModalBase 
      isOpen={true} 
      onClose={onClose} 
      title="Nouvelle affaire"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Juridiction */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-wider text-[#a3a3a3] font-medium">Juridiction</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tribunal"
              value={data.tribunal}
              onChange={(e) => handleChange('tribunal', e.target.value)}
              placeholder="TJ Paris"
              required
            />
            <Input
              label="N° RG"
              value={data.rg}
              onChange={(e) => handleChange('rg', e.target.value)}
              placeholder="24/12345"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date ordonnance"
              type="date"
              value={data.date_ordonnance}
              onChange={(e) => handleChange('date_ordonnance', e.target.value)}
            />
            <Input
              label="Date échéance"
              type="date"
              value={data.date_echeance}
              onChange={(e) => handleChange('date_echeance', e.target.value)}
            />
          </div>
        </div>

        {/* Bien */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-wider text-[#a3a3a3] font-medium">Bien expertisé</h4>
          <Input
            label="Adresse"
            value={data.bien_adresse}
            onChange={(e) => handleChange('bien_adresse', e.target.value)}
            placeholder="12 rue de la Paix"
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Code postal"
              value={data.bien_code_postal}
              onChange={(e) => handleChange('bien_code_postal', e.target.value)}
              placeholder="75001"
            />
            <Input
              label="Ville"
              value={data.bien_ville}
              onChange={(e) => handleChange('bien_ville', e.target.value)}
              placeholder="Paris"
            />
            <Select
              label="Type de bien"
              value={data.bien_type}
              onChange={(e) => handleChange('bien_type', e.target.value)}
              options={[
                { value: 'Maison', label: 'Maison individuelle' },
                { value: 'Appartement', label: 'Appartement' },
                { value: 'Immeuble', label: 'Immeuble collectif' },
                { value: 'Local commercial', label: 'Local commercial' },
                { value: 'Autre', label: 'Autre' }
              ]}
            />
          </div>
        </div>

        {/* Provision */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Provision (€)"
            type="number"
            value={data.provision_montant}
            onChange={(e) => handleChange('provision_montant', e.target.value)}
            placeholder="3000"
          />
          <div className="flex items-end">
            <label className="flex items-center gap-3 p-3 bg-[#fafafa] rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={data.urgent}
                onChange={(e) => handleChange('urgent', e.target.checked)}
                className="w-5 h-5 rounded border-[#d4d4d4] text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-[#525252]">Marquer comme urgent</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button variant="gold" type="submit" loading={loading} className="flex-1">
            Créer l'affaire
          </Button>
        </div>
      </form>
    </ModalBase>
  );
};

// ============================================================================
// FICHE AFFAIRE DÉTAILLÉE
// ============================================================================

export const FicheAffaire = ({ affaireId, onBack }) => {
  const { affaire, loading, error, update } = useAffaireDetail(affaireId);
  const [activeTab, setActiveTab] = useState('general');
  const [editing, setEditing] = useState(false);
  const [showAddPartie, setShowAddPartie] = useState(false);
  const [showAddReunion, setShowAddReunion] = useState(false);
  const [showAddDesordre, setShowAddDesordre] = useState(false);

  // Gestionnaire pour générer un document
  const handleGenerateDocument = () => {
    alert('Générateur de document - Fonctionnalité en cours de développement');
  };

  // Gestionnaire pour télécharger un document
  const handleDownloadDocument = (doc) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else {
      alert(`Téléchargement de "${doc.titre}" - URL non disponible en mode démo`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !affaire) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Erreur"
        description={error || "Affaire introuvable"}
        action={onBack}
        actionLabel="Retour"
      />
    );
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: FileText },
    { id: 'parties', label: `Parties (${affaire.parties?.length || 0})`, icon: Users },
    { id: 'reunions', label: `Réunions (${affaire.reunions?.length || 0})`, icon: Calendar },
    { id: 'desordres', label: `Désordres (${affaire.pathologies?.length || 0})`, icon: AlertTriangle },
    { id: 'documents', label: `Documents (${affaire.documents?.length || 0})`, icon: Folder },
    { id: 'financier', label: 'Financier', icon: Euro },
    { id: 'outils', label: 'Outils', icon: Wand2 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={onBack} className="text-sm text-[#737373] hover:text-[#c9a227] mb-2">
            ← Retour à la liste
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-light text-[#1a1a1a]">{affaire.reference}</h1>
            {affaire.urgent && <Badge variant="error">Urgent</Badge>}
            <Badge variant={affaire.statut === 'en-cours' ? 'info' : 'success'}>
              {affaire.statut}
            </Badge>
          </div>
          <p className="text-[#737373] mt-1">
            {affaire.tribunal} {affaire.rg && `• RG ${affaire.rg}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Edit} onClick={() => setEditing(true)}>
            Modifier
          </Button>
          <Button variant="primary" icon={FileText} onClick={handleGenerateDocument}>
            Générer document
          </Button>
        </div>
      </div>

      {/* Progression */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-[#1a1a1a]">Progression de l'expertise</h3>
          <span className="text-2xl font-light text-[#c9a227]">
            {calculerAvancementTunnel(affaire)}%
          </span>
        </div>
        <ProgressBar 
          value={calculerAvancementTunnel(affaire)} 
          color="gold"
          size="md"
        />
        <div className="flex justify-between mt-4 text-xs text-[#a3a3a3]">
          {ETAPES_TUNNEL.slice(0, 5).map((etape, i) => (
            <span key={i} className={affaire.etape_actuelle >= i ? 'text-[#c9a227]' : ''}>
              {etape.label}
            </span>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Contenu des tabs */}
      <div className="min-h-[400px]">
        {activeTab === 'general' && <TabGeneral affaire={affaire} />}
        {activeTab === 'parties' && <TabParties affaire={affaire} onAddPartie={() => setShowAddPartie(true)} />}
        {activeTab === 'reunions' && <TabReunions affaire={affaire} onAddReunion={() => setShowAddReunion(true)} />}
        {activeTab === 'desordres' && <TabDesordres affaire={affaire} onAddDesordre={() => setShowAddDesordre(true)} />}
        {activeTab === 'documents' && <TabDocuments affaire={affaire} onDownload={handleDownloadDocument} />}
        {activeTab === 'financier' && <TabFinancier affaire={affaire} />}
        {activeTab === 'outils' && <TabOutils affaire={affaire} />}
      </div>

      {/* Modal Ajout Partie */}
      {showAddPartie && (
        <ModalAjoutPartie
          affaireId={affaireId}
          onClose={() => setShowAddPartie(false)}
          onSuccess={() => {
            setShowAddPartie(false);
            // Rafraîchir les données
            window.location.reload();
          }}
        />
      )}

      {/* Modal Ajout Réunion */}
      {showAddReunion && (
        <ModalAjoutReunion
          affaireId={affaireId}
          reunionNumero={(affaire.reunions?.length || 0) + 1}
          adresseBien={`${affaire.bien_adresse || ''}, ${affaire.bien_code_postal || ''} ${affaire.bien_ville || ''}`}
          onClose={() => setShowAddReunion(false)}
          onSuccess={() => {
            setShowAddReunion(false);
            window.location.reload();
          }}
        />
      )}

      {/* Modal Ajout Désordre */}
      {showAddDesordre && (
        <ModalAjoutDesordre
          affaireId={affaireId}
          desordreNumero={(affaire.pathologies?.length || 0) + 1}
          onClose={() => setShowAddDesordre(false)}
          onSuccess={() => {
            setShowAddDesordre(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// TABS CONTENU
// ============================================================================

const TabGeneral = ({ affaire }) => (
  <div className="grid grid-cols-2 gap-6">
    <Card className="p-6">
      <h4 className="font-medium text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Gavel className="w-5 h-5 text-[#c9a227]" />
        Juridiction
      </h4>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[#737373]">Tribunal</span>
          <span className="font-medium">{affaire.tribunal || 'N/C'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#737373]">N° RG</span>
          <span className="font-medium">{affaire.rg || 'N/C'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#737373]">Date ordonnance</span>
          <span className="font-medium">{affaire.date_ordonnance ? formatDateFr(affaire.date_ordonnance) : 'N/C'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#737373]">Échéance</span>
          <span className={`font-medium ${affaire.date_echeance && calculerDelaiRestant(affaire.date_echeance) < 30 ? 'text-red-600' : ''}`}>
            {affaire.date_echeance ? formatDateFr(affaire.date_echeance) : 'N/C'}
          </span>
        </div>
      </div>
    </Card>

    <Card className="p-6">
      <h4 className="font-medium text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Building className="w-5 h-5 text-[#c9a227]" />
        Bien expertisé
      </h4>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[#737373]">Type</span>
          <span className="font-medium">{affaire.bien_type || 'N/C'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#737373]">Adresse</span>
          <span className="font-medium text-right">{affaire.bien_adresse || 'N/C'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#737373]">Ville</span>
          <span className="font-medium">{affaire.bien_code_postal} {affaire.bien_ville}</span>
        </div>
      </div>
    </Card>

    <Card className="p-6 col-span-2">
      <h4 className="font-medium text-[#1a1a1a] mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#c9a227]" />
        Mission
      </h4>
      <p className="text-sm text-[#525252] whitespace-pre-wrap">
        {affaire.mission || 'Mission non renseignée'}
      </p>
    </Card>
  </div>
);

const TabParties = ({ affaire, onAddPartie }) => {
  const parties = affaire.parties || [];

  const partiesByType = {
    demandeur: parties.filter(p => p.type === 'demandeur'),
    defenseur: parties.filter(p => p.type === 'defenseur'),
    intervenant: parties.filter(p => p.type === 'intervenant'),
    assureur: parties.filter(p => p.type === 'assureur')
  };

  return (
    <div className="space-y-6">
      {Object.entries(partiesByType).map(([type, list]) => (
        list.length > 0 && (
          <div key={type}>
            <h4 className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-3">
              {type === 'demandeur' ? 'Demandeurs' :
               type === 'defenseur' ? 'Défendeurs' :
               type === 'intervenant' ? 'Intervenants' : 'Assureurs'}
            </h4>
            <div className="grid gap-4">
              {list.map(partie => (
                <Card key={partie.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-[#1a1a1a]">
                        {partie.raison_sociale || `${partie.prenom || ''} ${partie.nom}`}
                      </p>
                      {partie.role && <p className="text-sm text-[#737373]">{partie.role}</p>}
                      {partie.avocat_nom && (
                        <p className="text-sm text-[#a3a3a3] mt-1">
                          Représenté par Me {partie.avocat_nom}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {partie.email && (
                        <button className="p-2 text-[#a3a3a3] hover:text-[#c9a227]">
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
                      {partie.telephone && (
                        <button className="p-2 text-[#a3a3a3] hover:text-[#c9a227]">
                          <Phone className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      ))}
      
      <Button variant="secondary" icon={Plus} className="w-full" onClick={onAddPartie}>
        Ajouter une partie
      </Button>
    </div>
  );
};

const TabReunions = ({ affaire, onAddReunion }) => (
  <div className="space-y-4">
    {(affaire.reunions || []).length === 0 ? (
      <EmptyState
        icon={Calendar}
        title="Aucune réunion"
        description="Planifiez la première réunion d'expertise"
        actionLabel="Planifier"
      />
    ) : (
      affaire.reunions.map(reunion => (
        <Card key={reunion.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#f5e6c8] rounded-xl flex items-center justify-center">
                <span className="font-medium text-[#c9a227]">{reunion.numero}</span>
              </div>
              <div>
                <p className="font-medium text-[#1a1a1a]">
                  Réunion n°{reunion.numero}
                </p>
                <p className="text-sm text-[#737373]">
                  {reunion.date_reunion ? formatDateFr(reunion.date_reunion) : 'Date à définir'}
                </p>
              </div>
            </div>
            <Badge variant={reunion.statut === 'terminee' ? 'success' : 'info'}>
              {reunion.statut || 'Planifiée'}
            </Badge>
          </div>
        </Card>
      ))
    )}
    <Button variant="secondary" icon={Plus} className="w-full" onClick={onAddReunion}>
      Planifier une réunion
    </Button>
  </div>
);

const TabDesordres = ({ affaire, onAddDesordre }) => (
  <div className="space-y-4">
    {(affaire.pathologies || []).length === 0 ? (
      <EmptyState
        icon={AlertTriangle}
        title="Aucun désordre"
        description="Ajoutez les désordres constatés"
        actionLabel="Ajouter"
      />
    ) : (
      affaire.pathologies.map(pathologie => (
        <Card key={pathologie.id} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 bg-[#1a1a1a] text-white rounded">
                  D{pathologie.numero}
                </span>
                <span className="font-medium text-[#1a1a1a]">{pathologie.intitule}</span>
              </div>
              <p className="text-sm text-[#737373]">{pathologie.localisation}</p>
            </div>
            <Badge variant={
              pathologie.garantie === 'decennale' ? 'error' :
              pathologie.garantie === 'biennale' ? 'warning' :
              pathologie.garantie === 'gpa' ? 'info' : 'default'
            }>
              {pathologie.garantie || 'À qualifier'}
            </Badge>
          </div>
        </Card>
      ))
    )}
    <Button variant="secondary" icon={Plus} className="w-full" onClick={onAddDesordre}>
      Ajouter un désordre
    </Button>
  </div>
);

const TabDocuments = ({ affaire, onDownload }) => (
  <div className="space-y-4">
    {(affaire.documents || []).length === 0 ? (
      <EmptyState
        icon={Folder}
        title="Aucun document"
        description="Les documents générés apparaîtront ici"
      />
    ) : (
      affaire.documents.map(doc => (
        <Card key={doc.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#c9a227]" />
              <div>
                <p className="font-medium text-[#1a1a1a]">{doc.titre}</p>
                <p className="text-xs text-[#a3a3a3]">
                  {doc.type} • {doc.created_at ? formatDateFr(doc.created_at) : ''}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" icon={Download} onClick={() => onDownload && onDownload(doc)}>
              Télécharger
            </Button>
          </div>
        </Card>
      ))
    )}
  </div>
);

const TabFinancier = ({ affaire }) => {
  const totalVacations = (affaire.vacations || []).reduce((acc, v) => acc + (parseFloat(v.montant) || 0), 0);
  const totalFrais = (affaire.frais || []).reduce((acc, f) => acc + (parseFloat(f.montant) || 0), 0);
  const provision = parseFloat(affaire.provision_montant) || 0;
  
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card className="p-6">
        <h4 className="font-medium text-[#1a1a1a] mb-4">Provision</h4>
        <p className="text-3xl font-light text-[#c9a227]">
          {provision.toLocaleString('fr-FR')} €
        </p>
        <p className="text-sm text-[#737373] mt-1">
          {affaire.provision_recue ? 'Reçue' : 'En attente'}
        </p>
      </Card>
      
      <Card className="p-6">
        <h4 className="font-medium text-[#1a1a1a] mb-4">Honoraires à ce jour</h4>
        <p className="text-3xl font-light text-[#1a1a1a]">
          {(totalVacations + totalFrais).toLocaleString('fr-FR')} €
        </p>
        <p className="text-sm text-[#737373] mt-1">
          Vacations: {totalVacations.toLocaleString('fr-FR')} € • Frais: {totalFrais.toLocaleString('fr-FR')} €
        </p>
      </Card>
    </div>
  );
};

// ============================================================================
// TAB OUTILS - Outils contextuels liés à l'affaire
// ============================================================================

const TabOutils = ({ affaire }) => {
  const [activeTool, setActiveTool] = useState(null);
  const navigate = useNavigate();

  // Calcul de garantie basé sur la date de réception
  const calculerGaranties = useCallback(() => {
    if (!affaire.date_reception_ouvrage) return null;
    const dateReception = new Date(affaire.date_reception_ouvrage);
    const now = new Date();
    const joursEcoules = Math.floor((now - dateReception) / (1000 * 60 * 60 * 24));

    return {
      gpa: {
        active: joursEcoules <= 365,
        restant: Math.max(0, 365 - joursEcoules),
        pourcentage: Math.min(100, (joursEcoules / 365) * 100)
      },
      biennale: {
        active: joursEcoules <= 730,
        restant: Math.max(0, 730 - joursEcoules),
        pourcentage: Math.min(100, (joursEcoules / 730) * 100)
      },
      decennale: {
        active: joursEcoules <= 3652,
        restant: Math.max(0, 3652 - joursEcoules),
        pourcentage: Math.min(100, (joursEcoules / 3652) * 100)
      }
    };
  }, [affaire.date_reception_ouvrage]);

  const garanties = calculerGaranties();

  const outils = [
    {
      id: 'garanties',
      label: 'Calculateur Garanties',
      icon: Scale,
      description: 'Calculer les garanties applicables selon la date de réception',
      disabled: !affaire.date_reception_ouvrage,
      color: 'bg-blue-500'
    },
    {
      id: 'imputabilite',
      label: 'Matrice Imputabilité',
      icon: Target,
      description: `Attribuer les responsabilités (${affaire.pathologies?.length || 0} désordres)`,
      disabled: !affaire.pathologies?.length,
      color: 'bg-purple-500',
      action: () => navigate(`/affaires/${affaire.id}/imputabilite`)
    },
    {
      id: 'chiffrage',
      label: 'Chiffrage Travaux',
      icon: Calculator,
      description: 'Estimer le coût des travaux de reprise',
      disabled: !affaire.pathologies?.length,
      color: 'bg-green-500',
      action: () => navigate(`/affaires/${affaire.id}/chiffrage`)
    },
    {
      id: 'rapport',
      label: 'Générateur Rapport',
      icon: FileText,
      description: 'Générer le rapport d\'expertise',
      disabled: false,
      color: 'bg-amber-500',
      action: () => navigate(`/affaires/${affaire.id}/rapport`)
    },
    {
      id: 'dtu',
      label: 'Références DTU',
      icon: BookOpen,
      description: 'Consulter les normes applicables',
      disabled: false,
      color: 'bg-cyan-500'
    },
    {
      id: 'conformite',
      label: 'Check-list CPC',
      icon: CheckCircle,
      description: 'Vérifier la conformité au Code de procédure',
      disabled: false,
      color: 'bg-emerald-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Grille d'outils */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {outils.map(outil => (
          <Card
            key={outil.id}
            onClick={() => outil.action ? outil.action() : setActiveTool(outil.id)}
            className={`p-5 cursor-pointer transition-all hover:shadow-lg hover:border-[#c9a227] ${
              outil.disabled ? 'opacity-50 cursor-not-allowed' : ''
            } ${activeTool === outil.id ? 'border-[#c9a227] bg-[#faf8f3]' : ''}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${outil.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                <outil.icon className={`w-6 h-6 ${outil.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-[#1a1a1a]">{outil.label}</h4>
                <p className="text-xs text-[#737373] mt-1">{outil.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Panneau détail outil - Garanties */}
      {activeTool === 'garanties' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-[#1a1a1a] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#c9a227]" />
              Calculateur de Garanties
            </h3>
            <button onClick={() => setActiveTool(null)} className="text-[#737373] hover:text-[#1a1a1a]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!affaire.date_reception_ouvrage ? (
            <div className="text-center py-8 text-[#737373]">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
              <p>Date de réception de l'ouvrage non renseignée</p>
              <p className="text-sm mt-1">Ajoutez cette date dans l'onglet Général pour calculer les garanties</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[#737373] mb-4">
                Réception de l'ouvrage : <strong>{formatDateFr(affaire.date_reception_ouvrage)}</strong>
              </p>

              {/* GPA */}
              <div className="p-4 bg-[#fafafa] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Garantie de Parfait Achèvement (1 an)</span>
                  <Badge variant={garanties?.gpa.active ? 'success' : 'default'}>
                    {garanties?.gpa.active ? `${garanties.gpa.restant} jours restants` : 'Expirée'}
                  </Badge>
                </div>
                <ProgressBar value={garanties?.gpa.pourcentage || 0} color={garanties?.gpa.active ? 'blue' : 'gray'} />
              </div>

              {/* Biennale */}
              <div className="p-4 bg-[#fafafa] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Garantie Biennale (2 ans)</span>
                  <Badge variant={garanties?.biennale.active ? 'warning' : 'default'}>
                    {garanties?.biennale.active ? `${garanties.biennale.restant} jours restants` : 'Expirée'}
                  </Badge>
                </div>
                <ProgressBar value={garanties?.biennale.pourcentage || 0} color={garanties?.biennale.active ? 'yellow' : 'gray'} />
              </div>

              {/* Décennale */}
              <div className="p-4 bg-[#fafafa] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Garantie Décennale (10 ans)</span>
                  <Badge variant={garanties?.decennale.active ? 'error' : 'default'}>
                    {garanties?.decennale.active ? `${garanties.decennale.restant} jours restants` : 'Expirée'}
                  </Badge>
                </div>
                <ProgressBar value={garanties?.decennale.pourcentage || 0} color={garanties?.decennale.active ? 'red' : 'gray'} />
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Panneau DTU */}
      {activeTool === 'dtu' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-[#1a1a1a] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#c9a227]" />
              Références DTU applicables
            </h3>
            <button onClick={() => setActiveTool(null)} className="text-[#737373] hover:text-[#1a1a1a]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { code: 'DTU 20.1', titre: 'Ouvrages en maçonnerie de petits éléments', applicable: affaire.bien_type === 'Maison' },
              { code: 'DTU 31.2', titre: 'Construction de maisons et bâtiments à ossature bois', applicable: false },
              { code: 'DTU 43.1', titre: 'Étanchéité des toitures-terrasses', applicable: true },
              { code: 'DTU 45.2', titre: 'Isolation thermique des circuits', applicable: true },
              { code: 'DTU 60.11', titre: 'Règles de calcul des installations de plomberie', applicable: true },
              { code: 'DTU 65.14', titre: 'Exécution de planchers chauffants', applicable: false }
            ].map(dtu => (
              <div key={dtu.code} className={`p-3 rounded-lg border ${dtu.applicable ? 'border-[#c9a227] bg-[#faf8f3]' : 'border-[#e5e5e5]'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[#1a1a1a]">{dtu.code}</span>
                    <p className="text-sm text-[#737373]">{dtu.titre}</p>
                  </div>
                  {dtu.applicable && (
                    <Badge variant="success">Pertinent</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Panneau Conformité CPC */}
      {activeTool === 'conformite' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-[#1a1a1a] flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#c9a227]" />
              Check-list Conformité CPC
            </h3>
            <button onClick={() => setActiveTool(null)} className="text-[#737373] hover:text-[#1a1a1a]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Parties convoquées dans les délais (8 jours)', check: affaire.parties?.length > 0 },
              { label: 'Première réunion tenue', check: affaire.reunions?.some(r => r.statut === 'terminee') },
              { label: 'Dires recueillis', check: affaire.dires?.length > 0 },
              { label: 'Note de synthèse envoyée', check: affaire.documents?.some(d => d.type === 'note-synthese') },
              { label: 'Délai réponse aux dires respecté (21 jours)', check: true },
              { label: 'Rapport déposé dans les délais', check: affaire.statut === 'termine' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#fafafa] rounded-lg">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  item.check ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {item.check ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <span className={item.check ? 'text-[#1a1a1a]' : 'text-[#737373]'}>{item.label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// ============================================================================
// MODAL AJOUT PARTIE
// ============================================================================

const ModalAjoutPartie = ({ affaireId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    type: 'demandeur',
    nom: '',
    prenom: '',
    raison_sociale: '',
    role: '',
    email: '',
    telephone: '',
    adresse: '',
    code_postal: '',
    ville: '',
    avocat_nom: '',
    avocat_email: ''
  });
  const [isEntreprise, setIsEntreprise] = useState(false);

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mode démo - sauvegarder dans localStorage
      const stored = localStorage.getItem('crm_demo_affaires');
      if (stored) {
        const affaires = JSON.parse(stored);
        const affaire = affaires.find(a => a.id === affaireId);
        if (affaire) {
          const newPartie = {
            id: `partie-${Date.now()}`,
            ...data,
            created_at: new Date().toISOString()
          };
          if (!affaire.parties) affaire.parties = [];
          affaire.parties.push(newPartie);
          localStorage.setItem('crm_demo_affaires', JSON.stringify(affaires));
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Erreur ajout partie:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase isOpen={true} onClose={onClose} title="Ajouter une partie" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type de partie */}
        <div className="flex gap-4">
          <Select
            label="Type de partie"
            value={data.type}
            onChange={(e) => handleChange('type', e.target.value)}
            options={[
              { value: 'demandeur', label: 'Demandeur' },
              { value: 'defenseur', label: 'Défendeur' },
              { value: 'intervenant', label: 'Intervenant' },
              { value: 'assureur', label: 'Assureur' }
            ]}
            className="flex-1"
          />
          <div className="flex items-end">
            <label className="flex items-center gap-3 p-3 bg-[#fafafa] rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={isEntreprise}
                onChange={(e) => setIsEntreprise(e.target.checked)}
                className="w-5 h-5 rounded border-[#d4d4d4] text-[#c9a227] focus:ring-[#c9a227]"
              />
              <span className="text-sm text-[#525252]">Personne morale</span>
            </label>
          </div>
        </div>

        {/* Identité */}
        {isEntreprise ? (
          <Input
            label="Raison sociale"
            value={data.raison_sociale}
            onChange={(e) => handleChange('raison_sociale', e.target.value)}
            placeholder="Nom de l'entreprise"
            required
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nom"
              value={data.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              placeholder="Nom"
              required
            />
            <Input
              label="Prénom"
              value={data.prenom}
              onChange={(e) => handleChange('prenom', e.target.value)}
              placeholder="Prénom"
            />
          </div>
        )}

        {/* Rôle */}
        <Input
          label="Rôle / Qualité"
          value={data.role}
          onChange={(e) => handleChange('role', e.target.value)}
          placeholder="Ex: Maître d'ouvrage, Entreprise générale, Assureur DO..."
        />

        {/* Contact */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="email@exemple.fr"
          />
          <Input
            label="Téléphone"
            type="tel"
            value={data.telephone}
            onChange={(e) => handleChange('telephone', e.target.value)}
            placeholder="01 23 45 67 89"
          />
        </div>

        {/* Adresse */}
        <Input
          label="Adresse"
          value={data.adresse}
          onChange={(e) => handleChange('adresse', e.target.value)}
          placeholder="Numéro et nom de rue"
        />
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Code postal"
            value={data.code_postal}
            onChange={(e) => handleChange('code_postal', e.target.value)}
            placeholder="75001"
          />
          <Input
            label="Ville"
            value={data.ville}
            onChange={(e) => handleChange('ville', e.target.value)}
            placeholder="Paris"
            className="col-span-2"
          />
        </div>

        {/* Avocat */}
        <div className="border-t border-[#e5e5e5] pt-4">
          <h4 className="text-xs uppercase tracking-wider text-[#a3a3a3] font-medium mb-4">Représentant (optionnel)</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nom de l'avocat"
              value={data.avocat_nom}
              onChange={(e) => handleChange('avocat_nom', e.target.value)}
              placeholder="Me Dupont"
            />
            <Input
              label="Email avocat"
              type="email"
              value={data.avocat_email}
              onChange={(e) => handleChange('avocat_email', e.target.value)}
              placeholder="avocat@cabinet.fr"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button variant="gold" type="submit" loading={loading} className="flex-1">
            Ajouter la partie
          </Button>
        </div>
      </form>
    </ModalBase>
  );
};

// ============================================================================
// MODAL AJOUT RÉUNION
// ============================================================================

const ModalAjoutReunion = ({ affaireId, reunionNumero, adresseBien, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    numero: reunionNumero,
    date_reunion: '',
    heure_reunion: '09:00',
    lieu: adresseBien || '',
    type: 'expertise',
    duree_prevue: 120,
    observations: ''
  });

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combiner date et heure
      const dateReunion = `${data.date_reunion}T${data.heure_reunion}:00`;

      // Mode démo - sauvegarder dans localStorage
      const stored = localStorage.getItem('crm_demo_affaires');
      if (stored) {
        const affaires = JSON.parse(stored);
        const affaire = affaires.find(a => a.id === affaireId);
        if (affaire) {
          const newReunion = {
            id: `reunion-${Date.now()}`,
            numero: data.numero,
            date_reunion: dateReunion,
            lieu: data.lieu,
            type: data.type,
            duree_prevue: data.duree_prevue,
            observations: data.observations,
            statut: 'planifiee',
            created_at: new Date().toISOString()
          };
          if (!affaire.reunions) affaire.reunions = [];
          affaire.reunions.push(newReunion);
          localStorage.setItem('crm_demo_affaires', JSON.stringify(affaires));
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Erreur ajout réunion:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase isOpen={true} onClose={onClose} title={`Planifier la réunion n°${reunionNumero}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date et heure */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date de réunion"
            type="date"
            value={data.date_reunion}
            onChange={(e) => handleChange('date_reunion', e.target.value)}
            required
          />
          <Input
            label="Heure"
            type="time"
            value={data.heure_reunion}
            onChange={(e) => handleChange('heure_reunion', e.target.value)}
            required
          />
        </div>

        {/* Type de réunion */}
        <Select
          label="Type de réunion"
          value={data.type}
          onChange={(e) => handleChange('type', e.target.value)}
          options={[
            { value: 'expertise', label: 'Réunion d\'expertise sur site' },
            { value: 'contradictoire', label: 'Réunion contradictoire' },
            { value: 'technique', label: 'Réunion technique' },
            { value: 'finale', label: 'Réunion finale' }
          ]}
        />

        {/* Lieu */}
        <Input
          label="Lieu"
          value={data.lieu}
          onChange={(e) => handleChange('lieu', e.target.value)}
          placeholder="Adresse de la réunion"
          required
        />

        {/* Durée prévue */}
        <Select
          label="Durée prévue"
          value={data.duree_prevue}
          onChange={(e) => handleChange('duree_prevue', parseInt(e.target.value))}
          options={[
            { value: 60, label: '1 heure' },
            { value: 90, label: '1h30' },
            { value: 120, label: '2 heures' },
            { value: 180, label: '3 heures' },
            { value: 240, label: '4 heures' },
            { value: 300, label: '5 heures' }
          ]}
        />

        {/* Observations */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
            Observations
          </label>
          <textarea
            value={data.observations}
            onChange={(e) => handleChange('observations', e.target.value)}
            placeholder="Notes particulières pour cette réunion..."
            rows={3}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button variant="gold" type="submit" loading={loading} className="flex-1">
            Planifier la réunion
          </Button>
        </div>
      </form>
    </ModalBase>
  );
};

// ============================================================================
// MODAL AJOUT DÉSORDRE/PATHOLOGIE
// ============================================================================

const ModalAjoutDesordre = ({ affaireId, desordreNumero, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    numero: desordreNumero,
    intitule: '',
    localisation: '',
    description: '',
    gravite: 'moyenne',
    garantie: '',
    cause_presumee: '',
    photos: []
  });

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mode démo - sauvegarder dans localStorage
      const stored = localStorage.getItem('crm_demo_affaires');
      if (stored) {
        const affaires = JSON.parse(stored);
        const affaire = affaires.find(a => a.id === affaireId);
        if (affaire) {
          const newPathologie = {
            id: `patho-${Date.now()}`,
            ...data,
            created_at: new Date().toISOString()
          };
          if (!affaire.pathologies) affaire.pathologies = [];
          affaire.pathologies.push(newPathologie);
          localStorage.setItem('crm_demo_affaires', JSON.stringify(affaires));
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Erreur ajout désordre:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBase isOpen={true} onClose={onClose} title={`Ajouter le désordre n°${desordreNumero}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Intitulé */}
        <Input
          label="Intitulé du désordre"
          value={data.intitule}
          onChange={(e) => handleChange('intitule', e.target.value)}
          placeholder="Ex: Fissures structurelles, Infiltrations, Défaut d'étanchéité..."
          required
        />

        {/* Localisation */}
        <Input
          label="Localisation"
          value={data.localisation}
          onChange={(e) => handleChange('localisation', e.target.value)}
          placeholder="Ex: Mur porteur salon, Terrasse RDC, Façade nord..."
          required
        />

        {/* Description */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
            Description détaillée
          </label>
          <textarea
            value={data.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Décrivez le désordre constaté, son étendue, ses manifestations..."
            rows={4}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] resize-none"
            required
          />
        </div>

        {/* Gravité et Garantie */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Gravité"
            value={data.gravite}
            onChange={(e) => handleChange('gravite', e.target.value)}
            options={[
              { value: 'mineure', label: 'Mineure (esthétique)' },
              { value: 'moyenne', label: 'Moyenne (fonctionnel)' },
              { value: 'majeure', label: 'Majeure (structurel)' },
              { value: 'critique', label: 'Critique (sécurité)' }
            ]}
          />
          <Select
            label="Qualification garantie"
            value={data.garantie}
            onChange={(e) => handleChange('garantie', e.target.value)}
            options={[
              { value: '', label: 'À déterminer' },
              { value: 'gpa', label: 'GPA (1 an)' },
              { value: 'biennale', label: 'Biennale (2 ans)' },
              { value: 'decennale', label: 'Décennale (10 ans)' },
              { value: 'hors_garantie', label: 'Hors garantie' },
              { value: 'responsabilite_civile', label: 'Responsabilité civile' }
            ]}
          />
        </div>

        {/* Cause présumée */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
            Cause présumée (optionnel)
          </label>
          <textarea
            value={data.cause_presumee}
            onChange={(e) => handleChange('cause_presumee', e.target.value)}
            placeholder="Hypothèses sur l'origine du désordre..."
            rows={2}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button variant="gold" type="submit" loading={loading} className="flex-1">
            Ajouter le désordre
          </Button>
        </div>
      </form>
    </ModalBase>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  ListeAffaires,
  FicheAffaire,
  AffaireCard,
  ModalNouvelleAffaire,
  ModalAjoutPartie,
  ModalAjoutReunion,
  ModalAjoutDesordre
};
