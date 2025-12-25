// ============================================================================
// CRM EXPERT JUDICIAIRE - GESTION DES MODÈLES DE DOCUMENTS
// ============================================================================
// Permet de créer, modifier et utiliser des modèles de documents
// Types: Convocation, Compte-rendu, Pré-rapport, Rapport final, etc.

import React, { useState, useMemo } from 'react';
import {
  FileText, Plus, Edit, Trash2, Copy, Download, Upload,
  Send, Users, ClipboardList, FileCheck, Scale, Check,
  ChevronRight, Search, Star, StarOff, MoreVertical
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase, useToast } from '../ui';
import { EditeurTexteRiche } from './EditeurTexteRiche';

// ============================================================================
// MODÈLES PAR DÉFAUT
// ============================================================================

export const MODELES_DEFAUT = [
  {
    id: 'convocation-r1',
    nom: 'Convocation réunion d\'expertise',
    type: 'convocation',
    icon: Send,
    description: 'Courrier de convocation aux parties pour une réunion d\'expertise',
    favori: true,
    contenu: `<h1 style="text-align: center">CONVOCATION À RÉUNION D'EXPERTISE</h1>

<p style="text-align: right">{{date.jour}}</p>

<p><strong>Affaire :</strong> {{affaire.reference}}<br>
<strong>RG :</strong> {{affaire.rg}}<br>
<strong>Tribunal :</strong> {{affaire.tribunal}}</p>

<hr>

<p>Madame, Monsieur,</p>

<p>Dans le cadre de l'expertise judiciaire ordonnée par {{affaire.tribunal}}, j'ai l'honneur de vous convoquer à une réunion d'expertise qui se tiendra :</p>

<p style="text-align: center">
<strong>Le {{reunion.date}} à {{reunion.heure}}</strong><br>
<strong>{{reunion.lieu}}</strong>
</p>

<p><strong>Ordre du jour :</strong></p>
<ul>
<li>Lecture de la mission confiée par le Tribunal</li>
<li>Visite des lieux et constatations</li>
<li>Recueil des observations des parties</li>
<li>Définition des investigations complémentaires éventuelles</li>
</ul>

<p>Je vous prie de bien vouloir vous munir de tout document utile à l'expertise.</p>

<p>En cas d'empêchement, je vous remercie de m'en informer dans les meilleurs délais et de vous faire représenter.</p>

<p>Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.</p>

<p style="text-align: right">
{{expert.nom}}<br>
Expert judiciaire
</p>`
  },
  {
    id: 'compte-rendu',
    nom: 'Compte-rendu de réunion',
    type: 'compte-rendu',
    icon: ClipboardList,
    description: 'Note aux parties suite à une réunion d\'expertise',
    favori: true,
    contenu: `<h1 style="text-align: center">COMPTE-RENDU DE RÉUNION D'EXPERTISE</h1>

<p style="text-align: center"><strong>Réunion n°{{reunion.numero}} du {{reunion.date}}</strong></p>

<hr>

<h2>1. RAPPEL DE L'AFFAIRE</h2>

<p><strong>Référence :</strong> {{affaire.reference}}<br>
<strong>RG :</strong> {{affaire.rg}}<br>
<strong>Tribunal :</strong> {{affaire.tribunal}}</p>

<p><strong>Bien concerné :</strong><br>
{{bien.adresse}}<br>
{{bien.code_postal}} {{bien.ville}}</p>

<h2>2. PERSONNES PRÉSENTES</h2>

<p>{{reunion.presents}}</p>

<h2>3. PERSONNES ABSENTES OU EXCUSÉES</h2>

<p>{{reunion.absents}}</p>

<h2>4. DÉROULEMENT DE LA RÉUNION</h2>

<p><em>[Décrire le déroulement de la réunion]</em></p>

<h2>5. CONSTATATIONS</h2>

<p><em>[Lister les constatations effectuées]</em></p>

<h2>6. DÉSORDRES RELEVÉS</h2>

<p><em>[Lister les désordres constatés avec localisation et photos]</em></p>

<h2>7. OBSERVATIONS DES PARTIES</h2>

<p><em>[Synthèse des observations formulées par les parties]</em></p>

<h2>8. PIÈCES REMISES OU DEMANDÉES</h2>

<p><em>[Lister les documents]</em></p>

<h2>9. SUITE À DONNER</h2>

<p><em>[Prochaines étapes, éventuellement date de la prochaine réunion]</em></p>

<hr>

<p>Les parties sont invitées à formuler leurs observations éventuelles dans un délai de 21 jours à compter de la réception du présent compte-rendu.</p>

<p style="text-align: right">
Fait à {{expert.ville}}, le {{date.jour}}<br><br>
{{expert.nom}}<br>
Expert judiciaire
</p>`
  },
  {
    id: 'pre-rapport',
    nom: 'Note de synthèse (Pré-rapport)',
    type: 'pre-rapport',
    icon: FileText,
    description: 'Note de synthèse préalable au dépôt du rapport',
    favori: true,
    contenu: `<h1 style="text-align: center">NOTE DE SYNTHÈSE</h1>
<p style="text-align: center"><em>Article 276 du Code de Procédure Civile</em></p>

<hr>

<h2>AFFAIRE</h2>
<p><strong>Référence :</strong> {{affaire.reference}}<br>
<strong>RG :</strong> {{affaire.rg}}<br>
<strong>Tribunal :</strong> {{affaire.tribunal}}</p>

<h2>PARTIES</h2>
<p>{{parties.liste}}</p>

<h2>MISSION</h2>
<p>{{affaire.mission}}</p>

<h2>SYNTHÈSE DES OPÉRATIONS</h2>
<p><em>[Résumé des réunions et investigations menées]</em></p>

<h2>CONSTATATIONS PRINCIPALES</h2>
<p><em>[Synthèse des constatations]</em></p>

<h2>ANALYSE TECHNIQUE</h2>
<p><em>[Analyse des causes et responsabilités]</em></p>

<h2>CONCLUSIONS PROVISOIRES</h2>
<p><em>[Conclusions envisagées pour chaque point de la mission]</em></p>

<h2>ÉVALUATION DES PRÉJUDICES</h2>
<p><em>[Chiffrage des travaux de reprise]</em></p>

<hr>

<p><strong>IMPORTANT :</strong> Conformément à l'article 276 du Code de Procédure Civile, les parties sont invitées à formuler leurs observations sur la présente note de synthèse dans un délai d'un mois à compter de sa réception.</p>

<p>Passé ce délai, l'expert procédera au dépôt de son rapport définitif.</p>

<p style="text-align: right">
Fait à {{expert.ville}}, le {{date.jour}}<br><br>
{{expert.nom}}<br>
Expert judiciaire
</p>`
  },
  {
    id: 'demande-provision',
    nom: 'Demande de provision complémentaire',
    type: 'courrier',
    icon: Scale,
    description: 'Demande de consignation complémentaire au tribunal',
    favori: false,
    contenu: `<p style="text-align: right">{{date.jour}}</p>

<p>{{affaire.tribunal}}<br>
Service des expertises</p>

<p><strong>Objet :</strong> Demande de provision complémentaire<br>
<strong>Affaire :</strong> {{affaire.reference}} - RG {{affaire.rg}}</p>

<p>Madame, Monsieur le Président,</p>

<p>Dans le cadre de l'expertise que vous m'avez confiée par ordonnance du {{affaire.date_ordonnance}}, j'ai l'honneur de solliciter une provision complémentaire.</p>

<p><strong>Motifs :</strong></p>
<p><em>[Expliquer les raisons : complexité, réunions supplémentaires, sapiteur...]</em></p>

<p><strong>Montant sollicité :</strong> <em>[Montant]</em> € HT</p>

<p>Je reste à votre disposition pour tout renseignement complémentaire.</p>

<p>Je vous prie d'agréer, Madame, Monsieur le Président, l'expression de ma haute considération.</p>

<p style="text-align: right">
{{expert.nom}}<br>
Expert judiciaire
</p>`
  },
  {
    id: 'courrier-relance',
    nom: 'Relance pièces manquantes',
    type: 'courrier',
    icon: Send,
    description: 'Demande de pièces complémentaires à une partie',
    favori: false,
    contenu: `<p style="text-align: right">{{date.jour}}</p>

<p>Madame, Monsieur,</p>

<p><strong>Objet :</strong> Relance - Pièces en attente<br>
<strong>Affaire :</strong> {{affaire.reference}} - RG {{affaire.rg}}</p>

<p>Dans le cadre de l'expertise judiciaire en cours, je me permets de vous relancer concernant les pièces suivantes qui n'ont pas encore été transmises :</p>

<ul>
<li><em>[Liste des pièces demandées]</em></li>
</ul>

<p>Ces éléments sont nécessaires à la poursuite de mes opérations d'expertise.</p>

<p>Je vous remercie de me les faire parvenir dans les meilleurs délais, et en tout état de cause sous quinzaine.</p>

<p>Je vous rappelle que, conformément au principe du contradictoire, toute pièce transmise à l'expert doit l'être simultanément à l'ensemble des parties.</p>

<p>Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.</p>

<p style="text-align: right">
{{expert.nom}}<br>
Expert judiciaire
</p>`
  }
];

// ============================================================================
// TYPES DE MODÈLES
// ============================================================================

const TYPES_MODELES = [
  { id: 'convocation', label: 'Convocation', icon: Send, color: 'blue' },
  { id: 'compte-rendu', label: 'Compte-rendu', icon: ClipboardList, color: 'green' },
  { id: 'pre-rapport', label: 'Pré-rapport', icon: FileText, color: 'amber' },
  { id: 'rapport', label: 'Rapport final', icon: FileCheck, color: 'purple' },
  { id: 'courrier', label: 'Courrier', icon: Send, color: 'gray' }
];

// ============================================================================
// COMPOSANT CARTE MODÈLE
// ============================================================================

const ModeleCard = ({ modele, onEdit, onDuplicate, onDelete, onUse, onToggleFavori }) => {
  const [showMenu, setShowMenu] = useState(false);
  const typeInfo = TYPES_MODELES.find(t => t.id === modele.type) || TYPES_MODELES[4];
  const Icon = modele.icon || typeInfo.icon;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            typeInfo.color === 'blue' ? 'bg-blue-100 text-blue-600' :
            typeInfo.color === 'green' ? 'bg-green-100 text-green-600' :
            typeInfo.color === 'amber' ? 'bg-amber-100 text-amber-600' :
            typeInfo.color === 'purple' ? 'bg-purple-100 text-purple-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-[#1a1a1a]">{modele.nom}</h4>
              {modele.favori && (
                <Star className="w-4 h-4 text-[#2563EB] fill-[#2563EB]" />
              )}
            </div>
            <p className="text-sm text-[#737373] mt-0.5">{modele.description}</p>
            <Badge variant="default" size="sm" className="mt-2">
              {typeInfo.label}
            </Badge>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-[#f5f5f5] text-[#737373]"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-[#e5e5e5] py-1 z-50">
              <button
                onClick={() => { onUse(modele); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm text-[#1a1a1a] hover:bg-[#f5f5f5] flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Utiliser
              </button>
              <button
                onClick={() => { onEdit(modele); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm text-[#525252] hover:bg-[#f5f5f5] flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={() => { onDuplicate(modele); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm text-[#525252] hover:bg-[#f5f5f5] flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Dupliquer
              </button>
              <button
                onClick={() => { onToggleFavori(modele); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm text-[#525252] hover:bg-[#f5f5f5] flex items-center gap-2"
              >
                {modele.favori ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                {modele.favori ? 'Retirer favori' : 'Ajouter favori'}
              </button>
              {!modele.systeme && (
                <button
                  onClick={() => { onDelete(modele); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-[#e5e5e5] mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bouton d'action principal */}
      <Button
        variant="primary"
        size="sm"
        className="w-full mt-4"
        onClick={() => onUse(modele)}
      >
        Utiliser ce modèle
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </Card>
  );
};

// ============================================================================
// MODAL ÉDITION MODÈLE
// ============================================================================

const ModalEditModele = ({ isOpen, onClose, modele, onSave }) => {
  const [nom, setNom] = useState(modele?.nom || '');
  const [type, setType] = useState(modele?.type || 'courrier');
  const [description, setDescription] = useState(modele?.description || '');
  const [contenu, setContenu] = useState(modele?.contenu || '');

  const handleSave = () => {
    onSave({
      ...modele,
      id: modele?.id || `modele-${Date.now()}`,
      nom,
      type,
      description,
      contenu
    });
    onClose();
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={modele?.id ? 'Modifier le modèle' : 'Nouveau modèle'}
      size="xl"
    >
      <div className="space-y-4">
        {/* Métadonnées */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#525252] mb-1">
              Nom du modèle
            </label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Convocation R1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#525252] mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-[#1a1a1a] focus:outline-none focus:border-[#2563EB]"
            >
              {TYPES_MODELES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#525252] mb-1">
            Description
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Courte description du modèle"
          />
        </div>

        {/* Éditeur de contenu */}
        <div>
          <label className="block text-sm font-medium text-[#525252] mb-1">
            Contenu du modèle
          </label>
          <EditeurTexteRiche
            content={contenu}
            onChange={setContenu}
            placeholder="Rédigez votre modèle ici. Utilisez {{variable}} pour les champs dynamiques."
            minHeight={300}
            showVariables={true}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!nom || !contenu}>
          Enregistrer
        </Button>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const GestionModeles = ({ onSelectModele }) => {
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [modeles, setModeles] = useState(() => {
    // Charger depuis localStorage ou utiliser les modèles par défaut
    const saved = localStorage.getItem('crm_modeles_documents');
    return saved ? JSON.parse(saved) : MODELES_DEFAUT;
  });
  const [editingModele, setEditingModele] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Sauvegarder dans localStorage à chaque modification
  const saveModeles = (newModeles) => {
    setModeles(newModeles);
    localStorage.setItem('crm_modeles_documents', JSON.stringify(newModeles));
  };

  // Filtrage
  const modelesFiltres = useMemo(() => {
    return modeles.filter(m => {
      const matchSearch = search === '' ||
        m.nom.toLowerCase().includes(search.toLowerCase()) ||
        m.description?.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || m.type === filterType;
      return matchSearch && matchType;
    });
  }, [modeles, search, filterType]);

  // Favoris en premier
  const modelesTries = useMemo(() => {
    return [...modelesFiltres].sort((a, b) => {
      if (a.favori && !b.favori) return -1;
      if (!a.favori && b.favori) return 1;
      return 0;
    });
  }, [modelesFiltres]);

  const handleSaveModele = (modele) => {
    const existing = modeles.findIndex(m => m.id === modele.id);
    if (existing >= 0) {
      const updated = [...modeles];
      updated[existing] = modele;
      saveModeles(updated);
      addToast('Modèle mis à jour', 'success');
    } else {
      saveModeles([...modeles, modele]);
      addToast('Modèle créé', 'success');
    }
  };

  const handleDeleteModele = (modele) => {
    if (confirm(`Supprimer le modèle "${modele.nom}" ?`)) {
      saveModeles(modeles.filter(m => m.id !== modele.id));
      addToast('Modèle supprimé', 'info');
    }
  };

  const handleDuplicateModele = (modele) => {
    const copie = {
      ...modele,
      id: `modele-${Date.now()}`,
      nom: `${modele.nom} (copie)`,
      favori: false,
      systeme: false
    };
    saveModeles([...modeles, copie]);
    addToast('Modèle dupliqué', 'success');
  };

  const handleToggleFavori = (modele) => {
    const updated = modeles.map(m =>
      m.id === modele.id ? { ...m, favori: !m.favori } : m
    );
    saveModeles(updated);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1a1a1a]">Modèles de documents</h2>
          <p className="text-sm text-[#737373]">
            {modeles.length} modèle{modeles.length > 1 ? 's' : ''} disponible{modeles.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setEditingModele(null);
            setShowEditModal(true);
          }}
        >
          Nouveau modèle
        </Button>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un modèle..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f7f7f7] border-2 border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-[#2563EB]"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-[#1a1a1a] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="all">Tous les types</option>
            {TYPES_MODELES.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Grille des modèles */}
      {modelesTries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modelesTries.map(modele => (
            <ModeleCard
              key={modele.id}
              modele={modele}
              onUse={onSelectModele}
              onEdit={(m) => {
                setEditingModele(m);
                setShowEditModal(true);
              }}
              onDuplicate={handleDuplicateModele}
              onDelete={handleDeleteModele}
              onToggleFavori={handleToggleFavori}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-[#d4d4d4]" />
          <p className="font-medium text-[#737373]">Aucun modèle trouvé</p>
          <p className="text-sm text-[#a3a3a3] mt-1">
            {search || filterType !== 'all'
              ? 'Modifiez vos critères de recherche'
              : 'Créez votre premier modèle de document'}
          </p>
        </Card>
      )}

      {/* Modal édition */}
      {showEditModal && (
        <ModalEditModele
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingModele(null);
          }}
          modele={editingModele}
          onSave={handleSaveModele}
        />
      )}
    </div>
  );
};

export default GestionModeles;
