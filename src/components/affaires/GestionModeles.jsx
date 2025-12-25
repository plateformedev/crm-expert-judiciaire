import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FileText, Plus, Edit2, Trash2, Copy, Save, X,
  Check, ChevronDown, ChevronRight, Eye, Download,
  Upload, Search, Tag, Star, StarOff, Clock,
  Info, AlertCircle, Settings, Folder, FolderPlus,
  MoreVertical, Archive, RefreshCw
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase, useToast } from '../ui';

// Catégories de modèles
const CATEGORIES_MODELES = [
  { id: 'consignation', label: 'Consignation', color: 'green' },
  { id: 'prorogation', label: 'Prorogation', color: 'orange' },
  { id: 'demande_pieces', label: 'Demande de pièces', color: 'blue' },
  { id: 'note_parties', label: 'Note aux parties', color: 'purple' },
  { id: 'convocation', label: 'Convocation', color: 'indigo' },
  { id: 'rapport', label: 'Rapport', color: 'red' },
  { id: 'divers', label: 'Divers', color: 'gray' }
];

// Variables disponibles
const VARIABLES_DISPONIBLES = [
  {
    category: 'Affaire',
    variables: [
      { code: '{{affaire.reference}}', label: 'Référence dossier', exemple: 'EXP-2024-001' },
      { code: '{{affaire.rg}}', label: 'Numéro RG', exemple: '24/00123' },
      { code: '{{affaire.juridiction}}', label: 'Juridiction', exemple: 'Tribunal Judiciaire de Paris' },
      { code: '{{affaire.date_ordonnance}}', label: 'Date ordonnance', exemple: '15/01/2024' },
      { code: '{{affaire.date_limite}}', label: 'Date limite', exemple: '15/07/2024' },
      { code: '{{affaire.objet}}', label: 'Objet du litige', exemple: 'Désordres construction' }
    ]
  },
  {
    category: 'Bien',
    variables: [
      { code: '{{bien.adresse}}', label: 'Adresse complète', exemple: '15 rue de la Paix' },
      { code: '{{bien.code_postal}}', label: 'Code postal', exemple: '75001' },
      { code: '{{bien.ville}}', label: 'Ville', exemple: 'Paris' },
      { code: '{{bien.type}}', label: 'Type de bien', exemple: 'Appartement' }
    ]
  },
  {
    category: 'Parties',
    variables: [
      { code: '{{demandeur.nom}}', label: 'Nom demandeur', exemple: 'M. DUPONT' },
      { code: '{{demandeur.adresse}}', label: 'Adresse demandeur', exemple: '10 rue des Fleurs, 75001 Paris' },
      { code: '{{defendeur.nom}}', label: 'Nom défendeur', exemple: 'SCI IMMOBILIA' },
      { code: '{{parties.liste}}', label: 'Liste des parties', exemple: 'M. DUPONT, SCI IMMOBILIA...' },
      { code: '{{parties.adverses}}', label: 'Parties adverses', exemple: 'SCI IMMOBILIA, SARL CONSTRUCT' }
    ]
  },
  {
    category: 'Expert',
    variables: [
      { code: '{{expert.nom}}', label: 'Nom de l\'expert', exemple: 'Jean MARTIN' },
      { code: '{{expert.titre}}', label: 'Titre complet', exemple: 'Expert judiciaire près la Cour d\'appel de Paris' },
      { code: '{{expert.specialite}}', label: 'Spécialité', exemple: 'Bâtiment et travaux publics' },
      { code: '{{expert.adresse}}', label: 'Adresse', exemple: '25 boulevard Haussmann, 75009 Paris' },
      { code: '{{expert.telephone}}', label: 'Téléphone', exemple: '01 23 45 67 89' },
      { code: '{{expert.email}}', label: 'Email', exemple: 'expert@cabinet.fr' }
    ]
  },
  {
    category: 'Dates',
    variables: [
      { code: '{{date.jour}}', label: 'Date du jour', exemple: '25/12/2024' },
      { code: '{{date.lettres}}', label: 'Date en lettres', exemple: 'le vingt-cinq décembre deux mille vingt-quatre' },
      { code: '{{reunion.date}}', label: 'Date prochaine réunion', exemple: '15/01/2025' },
      { code: '{{reunion.heure}}', label: 'Heure réunion', exemple: '14h00' }
    ]
  },
  {
    category: 'Finances',
    variables: [
      { code: '{{consignation.montant}}', label: 'Montant consignation', exemple: '3 000,00 €' },
      { code: '{{consignation.delai}}', label: 'Délai consignation', exemple: '30 jours' },
      { code: '{{honoraires.total}}', label: 'Total honoraires', exemple: '5 000,00 € HT' }
    ]
  }
];

// Modèles par défaut (préchargés)
const MODELES_PAR_DEFAUT = [
  {
    id: 'default_consignation',
    nom: 'Demande de consignation standard',
    categorie: 'consignation',
    favori: true,
    systeme: true,
    contenu: `Madame, Monsieur,

Par ordonnance en date du {{affaire.date_ordonnance}}, le {{affaire.juridiction}} m'a désigné en qualité d'expert judiciaire dans le litige vous opposant à {{parties.adverses}}.

Conformément aux dispositions de l'article 269 du Code de procédure civile, je vous informe que la provision à valoir sur mes honoraires et frais d'expertise a été fixée à la somme de {{consignation.montant}}.

Cette somme doit être consignée entre les mains du Régisseur du {{affaire.juridiction}} dans un délai de {{consignation.delai}} à compter de la présente.

Je vous précise que le défaut de consignation dans le délai imparti peut entraîner la caducité de ma désignation, conformément à l'article 271 du Code de procédure civile.

Je vous prie de bien vouloir m'adresser copie du justificatif de ce versement dès que celui-ci sera effectué.

Dans l'attente, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{{expert.nom}}
Expert {{expert.specialite}}`
  },
  {
    id: 'default_prorogation',
    nom: 'Demande de prorogation standard',
    categorie: 'prorogation',
    favori: false,
    systeme: true,
    contenu: `Madame, Monsieur le Juge,

Désigné en qualité d'expert dans l'affaire référencée {{affaire.reference}} (RG {{affaire.rg}}), je me permets de solliciter une prorogation du délai qui m'a été imparti pour le dépôt de mon rapport.

Le délai initial fixé au {{affaire.date_limite}} ne peut être respecté pour les raisons suivantes :
[Motifs à préciser]

En conséquence, j'ai l'honneur de solliciter une prorogation de [durée] mois.

Je reste bien entendu à votre disposition pour tout renseignement complémentaire.

Je vous prie d'agréer, Madame, Monsieur le Juge, l'expression de ma haute considération.

{{expert.nom}}
Expert {{expert.specialite}}`
  },
  {
    id: 'default_note',
    nom: 'Note aux parties standard',
    categorie: 'note_parties',
    favori: false,
    systeme: true,
    contenu: `NOTE AUX PARTIES

Affaire : {{affaire.reference}}
RG : {{affaire.rg}}

{{bien.ville}}, le {{date.jour}}

Madame, Monsieur,

[Contenu de la note]

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{{expert.nom}}
Expert {{expert.specialite}}`
  }
];

// Clé localStorage pour les modèles
const STORAGE_KEY = 'crm_modeles_courriers';

// Charger les modèles depuis localStorage
const loadModeles = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const userModeles = JSON.parse(stored);
      // Fusionner avec les modèles par défaut
      return [...MODELES_PAR_DEFAUT, ...userModeles];
    }
  } catch (e) {
    console.error('Erreur chargement modèles:', e);
  }
  return MODELES_PAR_DEFAUT;
};

// Sauvegarder les modèles dans localStorage
const saveModeles = (modeles) => {
  try {
    // Ne sauvegarder que les modèles utilisateur (pas les modèles système)
    const userModeles = modeles.filter(m => !m.systeme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userModeles));
  } catch (e) {
    console.error('Erreur sauvegarde modèles:', e);
  }
};

// Modal d'édition de modèle
const ModalEditModele = ({ modele, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nom: modele?.nom || '',
    categorie: modele?.categorie || 'divers',
    contenu: modele?.contenu || '',
    favori: modele?.favori || false
  });
  const [showVariables, setShowVariables] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState(['Affaire']);

  const handleInsertVariable = (code) => {
    setFormData(prev => ({
      ...prev,
      contenu: prev.contenu + code
    }));
  };

  const toggleCategory = (cat) => {
    setExpandedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nom.trim()) return;
    onSave({
      ...modele,
      ...formData,
      id: modele?.id || `custom_${Date.now()}`,
      systeme: false,
      dateModification: new Date().toISOString()
    });
  };

  return (
    <ModalBase
      isOpen={true}
      onClose={onClose}
      title={modele?.id ? 'Modifier le modèle' : 'Nouveau modèle'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du modèle *
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Demande de consignation personnalisée"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              value={formData.categorie}
              onChange={(e) => setFormData(prev => ({ ...prev, categorie: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES_MODELES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Éditeur de contenu */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu du modèle
            </label>
            <textarea
              value={formData.contenu}
              onChange={(e) => setFormData(prev => ({ ...prev, contenu: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={18}
              placeholder="Rédigez votre modèle ici... Utilisez les variables {{...}} pour les champs dynamiques"
            />
          </div>

          {/* Panneau des variables */}
          {showVariables && (
            <div className="w-72 border rounded-lg bg-gray-50 overflow-hidden flex flex-col">
              <div className="p-3 bg-white border-b flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Variables</span>
                <button
                  type="button"
                  onClick={() => setShowVariables(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {VARIABLES_DISPONIBLES.map(group => (
                  <div key={group.category} className="mb-2">
                    <button
                      type="button"
                      onClick={() => toggleCategory(group.category)}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded text-left"
                    >
                      <span className="text-sm font-medium text-gray-700">{group.category}</span>
                      {expandedCategories.includes(group.category)
                        ? <ChevronDown className="w-4 h-4 text-gray-400" />
                        : <ChevronRight className="w-4 h-4 text-gray-400" />
                      }
                    </button>
                    {expandedCategories.includes(group.category) && (
                      <div className="pl-2 space-y-1">
                        {group.variables.map(v => (
                          <button
                            key={v.code}
                            type="button"
                            onClick={() => handleInsertVariable(v.code)}
                            className="w-full text-left p-2 hover:bg-blue-50 rounded text-xs group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">{v.label}</span>
                              <Plus className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                            </div>
                            <code className="text-blue-600 text-[10px]">{v.code}</code>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!showVariables && (
          <button
            type="button"
            onClick={() => setShowVariables(true)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Info className="w-4 h-4" />
            Afficher les variables disponibles
          </button>
        )}

        {/* Option favori */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.favori}
            onChange={(e) => setFormData(prev => ({ ...prev, favori: e.target.checked }))}
            className="w-4 h-4 text-yellow-500 rounded"
          />
          <Star className={`w-4 h-4 ${formData.favori ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
          <span className="text-sm text-gray-700">Marquer comme favori</span>
        </label>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" icon={Save} type="submit">
            Enregistrer
          </Button>
        </div>
      </form>
    </ModalBase>
  );
};

// Carte de modèle
const ModeleCard = ({ modele, onEdit, onDuplicate, onDelete, onToggleFavori, onUse }) => {
  const [showMenu, setShowMenu] = useState(false);
  const categorie = CATEGORIES_MODELES.find(c => c.id === modele.categorie);

  const colorClasses = {
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="bg-white border rounded-xl p-4 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-blue-50">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 truncate">{modele.nom}</h4>
              {modele.favori && (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
              {modele.systeme && (
                <Badge variant="default">Système</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs ${colorClasses[categorie?.color || 'gray']}`}>
                {categorie?.label || 'Divers'}
              </span>
              {modele.dateModification && (
                <span className="text-xs text-gray-400">
                  Modifié le {new Date(modele.dateModification).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border py-1 z-20">
                <button
                  onClick={() => { onUse(modele); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Utiliser ce modèle
                </button>
                <button
                  onClick={() => { onEdit(modele); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  {modele.systeme ? 'Voir' : 'Modifier'}
                </button>
                <button
                  onClick={() => { onDuplicate(modele); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Dupliquer
                </button>
                <button
                  onClick={() => { onToggleFavori(modele); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  {modele.favori ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                  {modele.favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                </button>
                {!modele.systeme && (
                  <button
                    onClick={() => { onDelete(modele); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Aperçu du contenu */}
      <p className="mt-3 text-xs text-gray-500 line-clamp-2">
        {modele.contenu?.substring(0, 150)}...
      </p>

      {/* Actions rapides */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => onUse(modele)}
          className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          Utiliser
        </button>
        <button
          onClick={() => onEdit(modele)}
          className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Composant principal
export const GestionModeles = ({ onSelectModele, onClose }) => {
  const { toast } = useToast();
  const [modeles, setModeles] = useState(() => loadModeles());
  const [search, setSearch] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('all');
  const [filterFavori, setFilterFavori] = useState(false);
  const [editingModele, setEditingModele] = useState(null);
  const [showNew, setShowNew] = useState(false);

  // Sauvegarder les modèles quand ils changent
  useEffect(() => {
    saveModeles(modeles);
  }, [modeles]);

  // Filtrage des modèles
  const modelesFiltres = useMemo(() => {
    return modeles.filter(m => {
      if (search && !m.nom.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCategorie !== 'all' && m.categorie !== filterCategorie) return false;
      if (filterFavori && !m.favori) return false;
      return true;
    });
  }, [modeles, search, filterCategorie, filterFavori]);

  // Grouper par catégorie
  const modelesParCategorie = useMemo(() => {
    const grouped = {};
    modelesFiltres.forEach(m => {
      if (!grouped[m.categorie]) grouped[m.categorie] = [];
      grouped[m.categorie].push(m);
    });
    return grouped;
  }, [modelesFiltres]);

  const handleSaveModele = (modele) => {
    setModeles(prev => {
      const exists = prev.find(m => m.id === modele.id);
      if (exists) {
        return prev.map(m => m.id === modele.id ? modele : m);
      }
      return [...prev, modele];
    });
    setEditingModele(null);
    setShowNew(false);
    toast({
      title: "Modèle enregistré",
      description: "Le modèle a été sauvegardé avec succès."
    });
  };

  const handleDuplicate = (modele) => {
    const newModele = {
      ...modele,
      id: `custom_${Date.now()}`,
      nom: `${modele.nom} (copie)`,
      systeme: false,
      dateModification: new Date().toISOString()
    };
    setModeles(prev => [...prev, newModele]);
    toast({
      title: "Modèle dupliqué",
      description: "Une copie du modèle a été créée."
    });
  };

  const handleDelete = (modele) => {
    if (modele.systeme) return;
    setModeles(prev => prev.filter(m => m.id !== modele.id));
    toast({
      title: "Modèle supprimé",
      description: "Le modèle a été supprimé."
    });
  };

  const handleToggleFavori = (modele) => {
    setModeles(prev => prev.map(m =>
      m.id === modele.id ? { ...m, favori: !m.favori } : m
    ));
  };

  const handleUse = (modele) => {
    if (onSelectModele) {
      onSelectModele(modele);
    }
    toast({
      title: "Modèle sélectionné",
      description: `Le modèle "${modele.nom}" a été appliqué.`
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Folder className="w-6 h-6 text-blue-600" />
            Gestion des modèles
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {modeles.length} modèle(s) disponible(s)
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowNew(true)}
        >
          Nouveau modèle
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un modèle..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterCategorie}
          onChange={(e) => setFilterCategorie(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Toutes les catégories</option>
          {CATEGORIES_MODELES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>

        <button
          onClick={() => setFilterFavori(!filterFavori)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            filterFavori ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <Star className={`w-4 h-4 ${filterFavori ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          Favoris
        </button>
      </div>

      {/* Liste des modèles */}
      {modelesFiltres.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucun modèle trouvé</p>
          <Button
            variant="secondary"
            icon={Plus}
            onClick={() => setShowNew(true)}
            className="mt-4"
          >
            Créer un modèle
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Favoris en premier */}
          {modelesFiltres.some(m => m.favori) && !filterFavori && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Favoris
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modelesFiltres.filter(m => m.favori).map(modele => (
                  <ModeleCard
                    key={modele.id}
                    modele={modele}
                    onEdit={setEditingModele}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                    onToggleFavori={handleToggleFavori}
                    onUse={handleUse}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Autres modèles par catégorie */}
          {Object.entries(modelesParCategorie)
            .filter(([_, mods]) => !filterFavori || mods.some(m => !m.favori))
            .map(([categorie, mods]) => {
              const cat = CATEGORIES_MODELES.find(c => c.id === categorie);
              const modsToShow = filterFavori ? mods : mods.filter(m => !m.favori);
              if (modsToShow.length === 0) return null;

              return (
                <div key={categorie}>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {cat?.label || 'Divers'}
                    <span className="text-gray-400">({modsToShow.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modsToShow.map(modele => (
                      <ModeleCard
                        key={modele.id}
                        modele={modele}
                        onEdit={setEditingModele}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                        onToggleFavori={handleToggleFavori}
                        onUse={handleUse}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Modal d'édition */}
      {(editingModele || showNew) && (
        <ModalEditModele
          modele={editingModele}
          onSave={handleSaveModele}
          onClose={() => {
            setEditingModele(null);
            setShowNew(false);
          }}
        />
      )}
    </div>
  );
};

export default GestionModeles;
