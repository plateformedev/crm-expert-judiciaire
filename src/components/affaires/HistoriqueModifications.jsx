import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  History, Clock, User, FileText, Users, Calendar,
  Euro, AlertCircle, Search, Filter, ChevronDown,
  ChevronRight, Download, Eye, RefreshCw, Settings,
  Plus, Edit2, Trash2, CheckCircle, XCircle, Info,
  ArrowRight, RotateCcw, MoreVertical, Archive,
  Mail, File, MapPin, Scale, BookOpen
} from 'lucide-react';
import { Card, Badge, Button, ModalBase, useToast } from '../ui';

// Types d'événements
const TYPES_EVENEMENTS = {
  creation: { label: 'Création', icon: Plus, color: 'green', description: 'Création d\'un élément' },
  modification: { label: 'Modification', icon: Edit2, color: 'blue', description: 'Modification de données' },
  suppression: { label: 'Suppression', icon: Trash2, color: 'red', description: 'Suppression d\'un élément' },
  ajout_partie: { label: 'Ajout partie', icon: Users, color: 'purple', description: 'Nouvelle partie ajoutée' },
  ajout_reunion: { label: 'Nouvelle réunion', icon: Calendar, color: 'indigo', description: 'Réunion planifiée' },
  ajout_desordre: { label: 'Nouveau désordre', icon: AlertCircle, color: 'orange', description: 'Désordre constaté' },
  ajout_document: { label: 'Document ajouté', icon: FileText, color: 'teal', description: 'Document uploadé' },
  ajout_dire: { label: 'Dire reçu', icon: Mail, color: 'amber', description: 'Nouveau dire des parties' },
  modification_statut: { label: 'Changement statut', icon: RefreshCw, color: 'gray', description: 'Statut modifié' },
  envoi_courrier: { label: 'Courrier envoyé', icon: Mail, color: 'cyan', description: 'Courrier généré et envoyé' },
  consignation: { label: 'Consignation', icon: Euro, color: 'emerald', description: 'Opération financière' },
  reunion_terminee: { label: 'Réunion terminée', icon: CheckCircle, color: 'green', description: 'Réunion effectuée' },
  rapport_genere: { label: 'Rapport généré', icon: BookOpen, color: 'violet', description: 'Document de rapport' },
  archivage: { label: 'Archivage', icon: Archive, color: 'slate', description: 'Dossier archivé' }
};

// Catégories pour filtrer
const CATEGORIES_FILTRE = [
  { id: 'all', label: 'Tout', icon: History },
  { id: 'dossier', label: 'Dossier', icon: FileText },
  { id: 'parties', label: 'Parties', icon: Users },
  { id: 'reunions', label: 'Réunions', icon: Calendar },
  { id: 'documents', label: 'Documents', icon: File },
  { id: 'finances', label: 'Finances', icon: Euro },
  { id: 'courriers', label: 'Courriers', icon: Mail }
];

// Clé localStorage
const STORAGE_KEY = 'crm_historique_modifications';

// Charger l'historique
const loadHistorique = (affaireId) => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${affaireId}`);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Erreur chargement historique:', e);
  }
  return [];
};

// Sauvegarder l'historique
const saveHistorique = (affaireId, historique) => {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${affaireId}`, JSON.stringify(historique));
  } catch (e) {
    console.error('Erreur sauvegarde historique:', e);
  }
};

// Hook pour gérer l'historique
export const useHistorique = (affaireId) => {
  const [historique, setHistorique] = useState(() => loadHistorique(affaireId));

  useEffect(() => {
    if (affaireId) {
      saveHistorique(affaireId, historique);
    }
  }, [affaireId, historique]);

  const ajouterEvenement = useCallback((evenement) => {
    const nouvelEvenement = {
      id: Date.now(),
      date: new Date().toISOString(),
      utilisateur: 'Expert',
      ...evenement
    };
    setHistorique(prev => [nouvelEvenement, ...prev.slice(0, 499)]); // Garder 500 max
    return nouvelEvenement;
  }, []);

  return { historique, ajouterEvenement };
};

// Composant d'affichage d'un événement
const EvenementCard = ({ evenement, onVoirDetails }) => {
  const [expanded, setExpanded] = useState(false);
  const typeConfig = TYPES_EVENEMENTS[evenement.type] || TYPES_EVENEMENTS.modification;
  const Icon = typeConfig.icon;

  const colorClasses = {
    green: 'bg-green-100 text-green-700 border-green-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    teal: 'bg-teal-100 text-teal-700 border-teal-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    violet: 'bg-violet-100 text-violet-700 border-violet-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour(s)`;
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className={`bg-white border rounded-xl overflow-hidden hover:shadow-md transition-all ${
      expanded ? 'ring-2 ring-blue-200' : ''
    }`}>
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          {/* Icône du type */}
          <div className={`p-2 rounded-lg ${colorClasses[typeConfig.color]}`}>
            <Icon className="w-4 h-4" />
          </div>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{typeConfig.label}</span>
              {evenement.important && (
                <Badge variant="warning">Important</Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">
              {evenement.description || typeConfig.description}
            </p>
          </div>

          {/* Métadonnées */}
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-500">{formatDate(evenement.date)}</p>
            <p className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-0.5">
              <User className="w-3 h-3" />
              {evenement.utilisateur}
            </p>
          </div>

          {/* Chevron */}
          <div className="ml-2">
            {expanded
              ? <ChevronDown className="w-4 h-4 text-gray-400" />
              : <ChevronRight className="w-4 h-4 text-gray-400" />
            }
          </div>
        </div>
      </div>

      {/* Détails expandés */}
      {expanded && evenement.details && (
        <div className="px-4 pb-4 pt-0 border-t bg-gray-50">
          <div className="pt-3 space-y-2">
            {/* Affichage des changements */}
            {evenement.details.changements && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase">Modifications</p>
                {evenement.details.changements.map((change, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-gray-500 min-w-[100px]">{change.champ}</span>
                    <span className="text-red-500 line-through">{change.avant || '(vide)'}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-green-600">{change.apres || '(vide)'}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Données associées */}
            {evenement.details.element && (
              <div className="mt-3 p-3 bg-white rounded-lg border">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Élément concerné</p>
                <p className="text-sm text-gray-700">{evenement.details.element}</p>
              </div>
            )}

            {/* Notes */}
            {evenement.details.notes && (
              <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs font-medium text-amber-700 uppercase mb-1">Note</p>
                <p className="text-sm text-amber-800">{evenement.details.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant Timeline verticale
const TimelineView = ({ evenements, onVoirDetails }) => {
  // Grouper par date
  const groupedByDate = useMemo(() => {
    const groups = {};
    evenements.forEach(e => {
      const dateKey = new Date(e.date).toLocaleDateString('fr-FR');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(e);
    });
    return groups;
  }, [evenements]);

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDate).map(([date, events]) => (
        <div key={date}>
          {/* Date header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              {date}
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Événements du jour */}
          <div className="space-y-3 relative">
            {/* Ligne verticale */}
            <div className="absolute left-[22px] top-4 bottom-4 w-0.5 bg-gray-200" />

            {events.map((evenement, idx) => {
              const typeConfig = TYPES_EVENEMENTS[evenement.type] || TYPES_EVENEMENTS.modification;
              const Icon = typeConfig.icon;
              const colorClasses = {
                green: 'bg-green-500',
                blue: 'bg-blue-500',
                red: 'bg-red-500',
                purple: 'bg-purple-500',
                indigo: 'bg-indigo-500',
                orange: 'bg-orange-500',
                teal: 'bg-teal-500',
                amber: 'bg-amber-500',
                gray: 'bg-gray-500',
                cyan: 'bg-cyan-500',
                emerald: 'bg-emerald-500',
                violet: 'bg-violet-500',
                slate: 'bg-slate-500'
              };

              return (
                <div key={evenement.id} className="flex items-start gap-4 relative">
                  {/* Point sur la timeline */}
                  <div className={`w-10 h-10 rounded-full ${colorClasses[typeConfig.color]} flex items-center justify-center relative z-10`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 bg-white rounded-lg border p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{typeConfig.label}</p>
                        <p className="text-sm text-gray-600">{evenement.description}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(evenement.date).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {evenement.details?.element && (
                      <p className="mt-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {evenement.details.element}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Statistiques rapides
const StatistiquesHistorique = ({ evenements }) => {
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return {
      total: evenements.length,
      today: evenements.filter(e => new Date(e.date) >= today).length,
      week: evenements.filter(e => new Date(e.date) >= weekAgo).length,
      month: evenements.filter(e => new Date(e.date) >= monthAgo).length,
      parType: Object.entries(TYPES_EVENEMENTS).reduce((acc, [type, config]) => {
        acc[type] = evenements.filter(e => e.type === type).length;
        return acc;
      }, {})
    };
  }, [evenements]);

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
        <p className="text-xs text-blue-700">Aujourd'hui</p>
      </div>
      <div className="bg-green-50 rounded-lg p-4 text-center">
        <p className="text-2xl font-bold text-green-600">{stats.week}</p>
        <p className="text-xs text-green-700">Cette semaine</p>
      </div>
      <div className="bg-purple-50 rounded-lg p-4 text-center">
        <p className="text-2xl font-bold text-purple-600">{stats.month}</p>
        <p className="text-xs text-purple-700">Ce mois</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-2xl font-bold text-gray-600">{stats.total}</p>
        <p className="text-xs text-gray-700">Total</p>
      </div>
    </div>
  );
};

// Composant principal
export const HistoriqueModifications = ({ affaire, onUpdate }) => {
  const { toast } = useToast();
  const [historique, setHistorique] = useState(() => loadHistorique(affaire?.id));
  const [search, setSearch] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('all');
  const [filterPeriode, setFilterPeriode] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'timeline'

  // Générer des événements de démo si vide
  useEffect(() => {
    if (affaire && historique.length === 0) {
      const demoEvents = generateDemoEvents(affaire);
      setHistorique(demoEvents);
      saveHistorique(affaire.id, demoEvents);
    }
  }, [affaire, historique.length]);

  // Sauvegarder quand historique change
  useEffect(() => {
    if (affaire?.id) {
      saveHistorique(affaire.id, historique);
    }
  }, [affaire?.id, historique]);

  // Filtrage
  const evenementsFiltres = useMemo(() => {
    return historique.filter(e => {
      // Recherche textuelle
      if (search) {
        const searchLower = search.toLowerCase();
        const matchDesc = e.description?.toLowerCase().includes(searchLower);
        const matchType = TYPES_EVENEMENTS[e.type]?.label.toLowerCase().includes(searchLower);
        if (!matchDesc && !matchType) return false;
      }

      // Filtre par catégorie
      if (filterCategorie !== 'all') {
        const categMap = {
          dossier: ['creation', 'modification', 'modification_statut', 'archivage'],
          parties: ['ajout_partie'],
          reunions: ['ajout_reunion', 'reunion_terminee'],
          documents: ['ajout_document', 'rapport_genere', 'ajout_dire'],
          finances: ['consignation'],
          courriers: ['envoi_courrier']
        };
        if (!categMap[filterCategorie]?.includes(e.type)) return false;
      }

      // Filtre par période
      if (filterPeriode !== 'all') {
        const eventDate = new Date(e.date);
        const now = new Date();
        if (filterPeriode === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (eventDate < today) return false;
        } else if (filterPeriode === 'week') {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (eventDate < weekAgo) return false;
        } else if (filterPeriode === 'month') {
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (eventDate < monthAgo) return false;
        }
      }

      return true;
    });
  }, [historique, search, filterCategorie, filterPeriode]);

  // Exporter l'historique
  const handleExport = () => {
    const data = evenementsFiltres.map(e => ({
      date: new Date(e.date).toLocaleString('fr-FR'),
      type: TYPES_EVENEMENTS[e.type]?.label || e.type,
      description: e.description,
      utilisateur: e.utilisateur
    }));

    const csv = [
      ['Date', 'Type', 'Description', 'Utilisateur'].join(';'),
      ...data.map(d => [d.date, d.type, d.description, d.utilisateur].join(';'))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historique_${affaire?.reference || 'affaire'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `${evenementsFiltres.length} événements exportés`
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            Historique des modifications
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {historique.length} événement(s) enregistré(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle vue */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}
            >
              Liste
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'timeline' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}
            >
              Timeline
            </button>
          </div>
          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <StatistiquesHistorique evenements={historique} />

      {/* Filtres */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Recherche */}
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

        {/* Filtre catégorie */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {CATEGORIES_FILTRE.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategorie(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                filterCategorie === cat.id
                  ? 'bg-white shadow text-gray-900 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Filtre période */}
        <select
          value={filterPeriode}
          onChange={(e) => setFilterPeriode(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Toutes les périodes</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
      </div>

      {/* Liste ou Timeline */}
      {evenementsFiltres.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucun événement trouvé</p>
          {(search || filterCategorie !== 'all' || filterPeriode !== 'all') && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setFilterCategorie('all');
                setFilterPeriode('all');
              }}
              className="mt-4"
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {evenementsFiltres.map(evenement => (
            <EvenementCard
              key={evenement.id}
              evenement={evenement}
              onVoirDetails={() => {}}
            />
          ))}
        </div>
      ) : (
        <TimelineView
          evenements={evenementsFiltres}
          onVoirDetails={() => {}}
        />
      )}
    </div>
  );
};

// Générer des événements de démonstration
function generateDemoEvents(affaire) {
  const now = new Date();
  const events = [];

  // Création du dossier
  events.push({
    id: 1,
    type: 'creation',
    date: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
    utilisateur: 'Expert',
    description: `Création du dossier ${affaire?.reference || 'N/A'}`,
    details: {
      element: `Affaire ${affaire?.reference} créée`
    }
  });

  // Ajout parties
  if (affaire?.parties?.length) {
    affaire.parties.forEach((partie, idx) => {
      events.push({
        id: 100 + idx,
        type: 'ajout_partie',
        date: new Date(now - (29 - idx) * 24 * 60 * 60 * 1000).toISOString(),
        utilisateur: 'Expert',
        description: `Ajout de ${partie.nom}`,
        details: {
          element: `Partie: ${partie.nom} (${partie.qualite || 'Non défini'})`
        }
      });
    });
  }

  // Réunions
  if (affaire?.reunions?.length) {
    affaire.reunions.forEach((reunion, idx) => {
      events.push({
        id: 200 + idx,
        type: 'ajout_reunion',
        date: new Date(now - (25 - idx * 5) * 24 * 60 * 60 * 1000).toISOString(),
        utilisateur: 'Expert',
        description: `Planification de la réunion R${reunion.numero || idx + 1}`,
        details: {
          element: `Réunion du ${reunion.date ? new Date(reunion.date).toLocaleDateString('fr-FR') : 'Date à définir'}`
        }
      });

      if (reunion.statut === 'terminee') {
        events.push({
          id: 250 + idx,
          type: 'reunion_terminee',
          date: new Date(now - (20 - idx * 5) * 24 * 60 * 60 * 1000).toISOString(),
          utilisateur: 'Expert',
          description: `Réunion R${reunion.numero || idx + 1} effectuée`,
          details: {
            element: `Durée: ${reunion.duree || '2'} heures`
          }
        });
      }
    });
  }

  // Désordres
  if (affaire?.desordres?.length || affaire?.pathologies?.length) {
    const desordres = affaire?.desordres || affaire?.pathologies || [];
    desordres.forEach((desordre, idx) => {
      events.push({
        id: 300 + idx,
        type: 'ajout_desordre',
        date: new Date(now - (15 - idx) * 24 * 60 * 60 * 1000).toISOString(),
        utilisateur: 'Expert',
        description: `Constatation: ${desordre.titre || desordre.description?.substring(0, 30) || 'Désordre'}`,
        details: {
          element: desordre.localisation || 'Localisation non précisée'
        }
      });
    });
  }

  // Quelques événements récents
  events.push({
    id: 400,
    type: 'modification',
    date: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    utilisateur: 'Expert',
    description: 'Mise à jour des informations du dossier',
    details: {
      changements: [
        { champ: 'Statut', avant: 'Nouveau', apres: 'En cours' }
      ]
    }
  });

  events.push({
    id: 401,
    type: 'envoi_courrier',
    date: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
    utilisateur: 'Expert',
    description: 'Envoi demande de consignation',
    details: {
      element: 'Courrier envoyé à toutes les parties'
    }
  });

  // Trier par date décroissante
  return events.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export default HistoriqueModifications;
