// ============================================================================
// CRM EXPERT JUDICIAIRE - COMPOSANTS AFFAIRES
// ============================================================================

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder, Plus, Search, Filter, ChevronRight, Clock, MapPin,
  Scale, Users, Calendar, FileText, AlertCircle, Euro, Edit,
  Trash2, MoreVertical, CheckCircle, AlertTriangle, Eye,
  Building, Gavel, Phone, Mail, Save, X, Upload, Download,
  Wand2, Calculator, BookOpen, Shield, Target, ChevronDown, RotateCcw,
  Timer, Play, Square, Banknote, CircleDot, ArrowRight,
  Archive, PauseCircle, MoreHorizontal, Mic, StopCircle,
  FlaskConical, FileCheck, MessageSquare, Bell,
  ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { Card, Badge, Button, Input, Select, Tabs, ProgressBar, EmptyState, ModalBase, useToast } from '../ui';
import { useAffaires, useAffaireDetail, useParties } from '../../hooks/useSupabase';
import { useAutoTimer } from '../../hooks';
import { ETAPES_TUNNEL, GARANTIES, STATUTS_REUNION, JURISPRUDENCE, QUALIFICATION_DESORDRES, OPALEXE_CHECKLIST, BASE_DTU } from '../../data';
import { getStoredAffaires, saveAffaires } from '../../lib/demoData';
import { formatDateFr, calculerDelaiRestant, calculerAvancementTunnel, formatDureeHeures } from '../../utils/helpers';

// Nouveaux composants Phase 1
import { WorkflowTunnel } from './WorkflowTunnel';
import { DashboardAffaire } from './DashboardAffaire';
import { ReponseJuge } from './ReponseJuge';
import { GestionReunions } from './GestionReunions';
import { GestionDires } from './GestionDires';

// Nouveaux composants Phase 2
import { EditeurNoteSynthese } from './EditeurNoteSynthese';
import { EditeurRapportFinal } from './EditeurRapportFinal';
import { EtatFrais } from './EtatFrais';
import { GestionDocuments } from './GestionDocuments';
import { TimelineDossier } from './TimelineDossier';

// Modules workflow (Convocation, Réunion, Compte-rendu)
import { ModuleConvocation } from './ModuleConvocation';
import { ModuleReunion } from './ModuleReunion';
import { ModuleCompteRendu } from './ModuleCompteRendu';

// Nouveaux composants Refonte UX (Phase 1 Notice Développement)
import { AlertesDelais } from './AlertesDelais';
import { TableauContradictoire } from './TableauContradictoire';
import { CycleReunion } from './CycleReunion';
import { TimerWidget } from './TimerWidget';
import { GestionParties } from './GestionParties';
import { EditeurMission } from './EditeurMission';
import { GestionDesordres } from './GestionDesordres';
import { GenerateurCourriers } from './GenerateurCourriers';

// Phase 5 - Intégrations externes
import {
  AdresseAutocomplete,
  FormulaireAdresse,
  LienGoogleMaps,
  AR24Widget,
  OpalexeWidget,
  AssistantIAWidget,
  SuiviLaPosteWidget
} from '../integrations';

// ============================================================================
// LISTE DES AFFAIRES
// ============================================================================

export const ListeAffaires = ({ onSelectAffaire }) => {
  const navigate = useNavigate();
  const { affaires, loading, error, createAffaire, deleteAffaire, updateAffaire } = useAffaires();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionMenuId, setActionMenuId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'delete'|'archive'|'suspend', affaire: {} }

  // État du tri par colonnes
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // État des filtres (chargement depuis localStorage)
  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem('affaires_filters');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      statut: 'all',
      urgent: 'all',
      tribunal: 'all',
      ville: 'all',
      echeance: 'all',
      progression: 'all',
      avecParties: 'all',
      avecReunions: 'all',
      avecDesordres: 'all'
    };
  });

  // Sauvegarder les filtres dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem('affaires_filters', JSON.stringify(filters));
    } catch {}
  }, [filters]);

  // Extraire les valeurs uniques pour les dropdowns
  const uniqueValues = useMemo(() => ({
    tribunaux: [...new Set(affaires.map(a => a.tribunal).filter(Boolean))].sort(),
    villes: [...new Set(affaires.map(a => a.bien_ville).filter(Boolean))].sort()
  }), [affaires]);

  // Fonction de navigation vers une affaire
  const handleSelectAffaire = useCallback((affaire) => {
    if (onSelectAffaire) {
      onSelectAffaire(affaire);
    } else {
      navigate(`/affaires/${affaire.id}`);
    }
  }, [onSelectAffaire, navigate]);

  // Mettre à jour un filtre
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setFilters({
      statut: 'all',
      urgent: 'all',
      tribunal: 'all',
      ville: 'all',
      echeance: 'all',
      progression: 'all',
      avecParties: 'all',
      avecReunions: 'all',
      avecDesordres: 'all'
    });
    setSearch('');
  };

  // Compter les filtres actifs
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(v => v !== 'all').length + (search ? 1 : 0);
  }, [filters, search]);

  // Filtrage complet
  const affairesFiltrees = useMemo(() => {
    return affaires.filter(a => {
      // Recherche texte
      const matchSearch = search === '' ||
        a.reference?.toLowerCase().includes(search.toLowerCase()) ||
        a.rg?.toLowerCase().includes(search.toLowerCase()) ||
        a.tribunal?.toLowerCase().includes(search.toLowerCase()) ||
        a.bien_ville?.toLowerCase().includes(search.toLowerCase());

      // Statut
      const matchStatut = filters.statut === 'all' || a.statut === filters.statut;

      // Urgence
      const matchUrgent = filters.urgent === 'all' ||
        (filters.urgent === 'oui' && a.urgent) ||
        (filters.urgent === 'non' && !a.urgent);

      // Tribunal
      const matchTribunal = filters.tribunal === 'all' || a.tribunal === filters.tribunal;

      // Ville
      const matchVille = filters.ville === 'all' || a.bien_ville === filters.ville;

      // Échéance
      let matchEcheance = true;
      if (filters.echeance !== 'all' && a.date_echeance) {
        const delai = calculerDelaiRestant(a.date_echeance);
        switch (filters.echeance) {
          case 'depassee': matchEcheance = delai <= 0; break;
          case 'semaine': matchEcheance = delai > 0 && delai <= 7; break;
          case 'mois': matchEcheance = delai > 0 && delai <= 30; break;
          case 'trimestre': matchEcheance = delai > 0 && delai <= 90; break;
          default: matchEcheance = true;
        }
      } else if (filters.echeance !== 'all' && !a.date_echeance) {
        matchEcheance = false;
      }

      // Progression
      let matchProgression = true;
      if (filters.progression !== 'all') {
        const prog = calculerAvancementTunnel(a);
        switch (filters.progression) {
          case '0-25': matchProgression = prog >= 0 && prog < 25; break;
          case '25-50': matchProgression = prog >= 25 && prog < 50; break;
          case '50-75': matchProgression = prog >= 50 && prog < 75; break;
          case '75-100': matchProgression = prog >= 75; break;
          default: matchProgression = true;
        }
      }

      // Avec parties
      const matchParties = filters.avecParties === 'all' ||
        (filters.avecParties === 'oui' && (a.parties?.length || 0) > 0) ||
        (filters.avecParties === 'non' && (a.parties?.length || 0) === 0);

      // Avec réunions
      const matchReunions = filters.avecReunions === 'all' ||
        (filters.avecReunions === 'oui' && (a.reunions?.length || 0) > 0) ||
        (filters.avecReunions === 'non' && (a.reunions?.length || 0) === 0);

      // Avec désordres
      const matchDesordres = filters.avecDesordres === 'all' ||
        (filters.avecDesordres === 'oui' && (a.pathologies?.length || 0) > 0) ||
        (filters.avecDesordres === 'non' && (a.pathologies?.length || 0) === 0);

      return matchSearch && matchStatut && matchUrgent && matchTribunal &&
             matchVille && matchEcheance && matchProgression &&
             matchParties && matchReunions && matchDesordres;
    });
  }, [affaires, search, filters]);

  // Tri des affaires filtrées
  const affairesTriees = useMemo(() => {
    if (!sortConfig.key) return affairesFiltrees;

    return [...affairesFiltrees].sort((a, b) => {
      let aVal, bVal;

      switch (sortConfig.key) {
        case 'reference': aVal = a.reference || ''; bVal = b.reference || ''; break;
        case 'rg': aVal = a.rg || ''; bVal = b.rg || ''; break;
        case 'tribunal': aVal = a.tribunal || ''; bVal = b.tribunal || ''; break;
        case 'ville': aVal = a.bien_ville || ''; bVal = b.bien_ville || ''; break;
        case 'statut': aVal = a.statut || ''; bVal = b.statut || ''; break;
        case 'echeance': aVal = a.date_echeance || ''; bVal = b.date_echeance || ''; break;
        case 'progression': aVal = calculerAvancementTunnel(a); bVal = calculerAvancementTunnel(b); break;
        case 'parties': aVal = a.parties?.length || 0; bVal = b.parties?.length || 0; break;
        case 'reunions': aVal = a.reunions?.length || 0; bVal = b.reunions?.length || 0; break;
        case 'desordres': aVal = a.pathologies?.length || 0; bVal = b.pathologies?.length || 0; break;
        case 'provision': aVal = a.provision_montant || 0; bVal = b.provision_montant || 0; break;
        default: return 0;
      }

      if (typeof aVal === 'string') {
        const cmp = aVal.localeCompare(bVal, 'fr', { numeric: true });
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      }
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [affairesFiltrees, sortConfig]);

  // Fonction pour gérer le tri
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Icône de tri pour les en-têtes
  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="w-3 h-3 text-[#a3a3a3]" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="w-3 h-3 text-[#2563EB]" />
      : <ArrowDown className="w-3 h-3 text-[#2563EB]" />;
  };

  // Statistiques rapides
  const stats = useMemo(() => ({
    total: affaires.length,
    filtrees: affairesFiltrees.length,
    enCours: affaires.filter(a => a.statut === 'en-cours').length,
    urgentes: affaires.filter(a => a.urgent).length,
    aDeposer: affaires.filter(a => a.statut === 'pre-rapport').length
  }), [affaires, affairesFiltrees]);

  const handleCreate = async (data) => {
    const result = await createAffaire(data);
    if (result.success) {
      setShowCreateModal(false);
      handleSelectAffaire(result.affaire);
    }
    return result;
  };

  // Export CSV des affaires filtrées
  const handleExportCSV = useCallback(() => {
    const headers = ['Référence', 'N° RG', 'Tribunal', 'Ville', 'Statut', 'Échéance', 'Parties', 'Réunions', 'Désordres', 'Provision'];
    const rows = affairesTriees.map(a => [
      a.reference || '',
      a.rg || '',
      a.tribunal || '',
      a.bien_ville || '',
      a.statut || '',
      a.date_echeance || '',
      a.parties?.length || 0,
      a.reunions?.length || 0,
      a.pathologies?.length || 0,
      a.provision_montant || 0
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `affaires_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [affairesTriees]);

  // Gestionnaire d'actions (archiver, suspendre, supprimer)
  const handleAction = async (type, affaire) => {
    setActionMenuId(null);

    if (type === 'delete') {
      setConfirmAction({ type: 'delete', affaire });
    } else if (type === 'archive') {
      setConfirmAction({ type: 'archive', affaire });
    } else if (type === 'suspend') {
      setConfirmAction({ type: 'suspend', affaire });
    } else if (type === 'reactivate') {
      // Réactiver directement sans confirmation
      await updateAffaire(affaire.id, { statut: 'en-cours' });
    }
  };

  // Confirmer l'action
  const confirmActionHandler = async () => {
    if (!confirmAction) return;

    const { type, affaire } = confirmAction;

    if (type === 'delete') {
      await deleteAffaire(affaire.id);
    } else if (type === 'archive') {
      await updateAffaire(affaire.id, { statut: 'archive' });
    } else if (type === 'suspend') {
      await updateAffaire(affaire.id, { statut: 'suspendu' });
    }

    setConfirmAction(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats rapides - Style Samsung One UI */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5 border border-[#e0e0e0]">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#757575]">Total</p>
          <p className="text-[28px] font-bold text-[#1f1f1f] mt-1">{stats.total}</p>
        </Card>
        <Card className="p-5 border border-[#e0e0e0] bg-[#e5f3ff]">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#0066cc]">En cours</p>
          <p className="text-[28px] font-bold text-[#0381fe] mt-1">{stats.enCours}</p>
        </Card>
        <Card className="p-5 border border-[#e0e0e0] bg-[#ffebea]">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#cc2f26]">Urgentes</p>
          <p className="text-[28px] font-bold text-[#ff3b30] mt-1">{stats.urgentes}</p>
        </Card>
        <Card className="p-5 border border-[#e0e0e0] bg-[#fff5e5]">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#cc7700]">À déposer</p>
          <p className="text-[28px] font-bold text-[#ff9500] mt-1">{stats.aDeposer}</p>
        </Card>
      </div>

      {/* Barre de recherche et filtres - Style Samsung One UI */}
      <Card className="p-5 border border-[#e0e0e0]">
        <div className="flex gap-3 items-center">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#757575]" />
            <input
              type="text"
              placeholder="Rechercher par référence, RG, tribunal, ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[#f7f7f7] border-2 border-transparent rounded-xl text-[15px] text-[#1f1f1f] placeholder-[#757575] focus:outline-none focus:bg-white focus:border-[#0381fe] transition-all"
            />
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3.5 border-2 rounded-xl font-semibold transition-all ${
              showFilters || activeFiltersCount > 0
                ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                : 'border-[#e0e0e0] text-[#555555] hover:bg-[#f7f7f7] active:bg-[#f0f0f0]'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="bg-[#2563EB] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Bouton reset */}
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-5 py-3.5 border-2 border-[#e0e0e0] rounded-xl text-[#555555] font-medium hover:bg-[#f7f7f7] active:bg-[#f0f0f0] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </button>
          )}

          {/* Bouton export CSV */}
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>

          {/* Bouton nouvelle affaire */}
          <Button variant="primary" icon={Plus} onClick={() => setShowCreateModal(true)}>
            Nouvelle affaire
          </Button>
        </div>

        {/* Panneau de filtres - Style Samsung One UI */}
        {showFilters && (
          <div className="mt-5 pt-5 border-t-2 border-[#f0f0f0]">
            <div className="grid grid-cols-3 gap-4">
              {/* Statut */}
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wide text-[#757575] block mb-2">
                  Statut
                </label>
                <select
                  value={filters.statut}
                  onChange={(e) => updateFilter('statut', e.target.value)}
                  className="w-full px-4 py-3 bg-[#f7f7f7] border-2 border-transparent rounded-xl text-[14px] text-[#1f1f1f] focus:outline-none focus:bg-white focus:border-[#0381fe] cursor-pointer transition-all"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="en-cours">En cours</option>
                  <option value="pre-rapport">Pré-rapport</option>
                  <option value="termine">Terminé</option>
                  <option value="suspendu">Suspendu</option>
                  <option value="archive">Archivé</option>
                </select>
              </div>

              {/* Urgence */}
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wide text-[#757575] block mb-2">
                  Urgence
                </label>
                <select
                  value={filters.urgent}
                  onChange={(e) => updateFilter('urgent', e.target.value)}
                  className="w-full px-4 py-3 bg-[#f7f7f7] border-2 border-transparent rounded-xl text-[14px] text-[#1f1f1f] focus:outline-none focus:bg-white focus:border-[#0381fe] cursor-pointer transition-all"
                >
                  <option value="all">Toutes</option>
                  <option value="oui">Urgentes uniquement</option>
                  <option value="non">Non urgentes</option>
                </select>
              </div>

              {/* Tribunal */}
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wide text-[#757575] block mb-2">
                  Tribunal
                </label>
                <select
                  value={filters.tribunal}
                  onChange={(e) => updateFilter('tribunal', e.target.value)}
                  className="w-full px-4 py-3 bg-[#f7f7f7] border-2 border-transparent rounded-xl text-[14px] text-[#1f1f1f] focus:outline-none focus:bg-white focus:border-[#0381fe] cursor-pointer transition-all"
                >
                  <option value="all">Tous les tribunaux</option>
                  {uniqueValues.tribunaux.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Ville */}
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wide text-[#757575] block mb-2">
                  Ville
                </label>
                <select
                  value={filters.ville}
                  onChange={(e) => updateFilter('ville', e.target.value)}
                  className="w-full px-4 py-3 bg-[#f7f7f7] border-2 border-transparent rounded-xl text-[14px] text-[#1f1f1f] focus:outline-none focus:bg-white focus:border-[#0381fe] cursor-pointer transition-all"
                >
                  <option value="all">Toutes les villes</option>
                  {uniqueValues.villes.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Échéance */}
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wide text-[#757575] block mb-2">
                  Échéance
                </label>
                <select
                  value={filters.echeance}
                  onChange={(e) => updateFilter('echeance', e.target.value)}
                  className="w-full px-4 py-3 bg-[#f7f7f7] border-2 border-transparent rounded-xl text-[14px] text-[#1f1f1f] focus:outline-none focus:bg-white focus:border-[#0381fe] cursor-pointer transition-all"
                >
                  <option value="all">Toutes les échéances</option>
                  <option value="depassee">Dépassée</option>
                  <option value="semaine">Dans 7 jours</option>
                  <option value="mois">Dans 30 jours</option>
                  <option value="trimestre">Dans 90 jours</option>
                </select>
              </div>

              {/* Progression */}
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wide text-[#757575] block mb-2">
                  Progression
                </label>
                <select
                  value={filters.progression}
                  onChange={(e) => updateFilter('progression', e.target.value)}
                  className="w-full px-4 py-3 bg-[#f7f7f7] border-2 border-transparent rounded-xl text-[14px] text-[#1f1f1f] focus:outline-none focus:bg-white focus:border-[#0381fe] cursor-pointer transition-all"
                >
                  <option value="all">Toutes</option>
                  <option value="0-25">0% - 25%</option>
                  <option value="25-50">25% - 50%</option>
                  <option value="50-75">50% - 75%</option>
                  <option value="75-100">75% - 100%</option>
                </select>
              </div>

              {/* Avec parties */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
                  Parties
                </label>
                <select
                  value={filters.avecParties}
                  onChange={(e) => updateFilter('avecParties', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="all">Toutes</option>
                  <option value="oui">Avec parties</option>
                  <option value="non">Sans parties</option>
                </select>
              </div>

              {/* Avec réunions */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
                  Réunions
                </label>
                <select
                  value={filters.avecReunions}
                  onChange={(e) => updateFilter('avecReunions', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="all">Toutes</option>
                  <option value="oui">Avec réunions</option>
                  <option value="non">Sans réunions</option>
                </select>
              </div>

              {/* Avec désordres */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
                  Désordres
                </label>
                <select
                  value={filters.avecDesordres}
                  onChange={(e) => updateFilter('avecDesordres', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="all">Toutes</option>
                  <option value="oui">Avec désordres</option>
                  <option value="non">Sans désordres</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Résumé des résultats */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t border-[#e5e5e5] flex items-center justify-between">
            <p className="text-sm text-[#737373]">
              <span className="font-medium text-[#1a1a1a]">{stats.filtrees}</span> affaire{stats.filtrees > 1 ? 's' : ''} sur {stats.total}
            </p>
            <div className="flex gap-2 flex-wrap">
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5f5f5] rounded text-xs">
                  Recherche: "{search}"
                  <button onClick={() => setSearch('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.statut !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5f5f5] rounded text-xs">
                  Statut: {filters.statut}
                  <button onClick={() => updateFilter('statut', 'all')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.urgent !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5f5f5] rounded text-xs">
                  Urgence: {filters.urgent}
                  <button onClick={() => updateFilter('urgent', 'all')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.tribunal !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5f5f5] rounded text-xs">
                  Tribunal: {filters.tribunal}
                  <button onClick={() => updateFilter('tribunal', 'all')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.ville !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5f5f5] rounded text-xs">
                  Ville: {filters.ville}
                  <button onClick={() => updateFilter('ville', 'all')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.echeance !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5f5f5] rounded text-xs">
                  Échéance: {filters.echeance}
                  <button onClick={() => updateFilter('echeance', 'all')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.progression !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5f5f5] rounded text-xs">
                  Progression: {filters.progression}
                  <button onClick={() => updateFilter('progression', 'all')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Tableau des affaires */}
      {affairesFiltrees.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="Aucune affaire"
          description={search || filterStatut !== 'all' ? "Modifiez vos critères" : "Créez votre première affaire"}
          action={() => setShowCreateModal(true)}
          actionLabel="Créer une affaire"
        />
      ) : (
        <Card className="overflow-hidden border border-[#e0e0e0]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f7f7f7] border-b-2 border-[#e0e0e0]">
                <tr>
                  <th onClick={() => handleSort('reference')} className="px-4 py-4 text-left text-[13px] font-semibold text-[#1f1f1f] uppercase tracking-wide cursor-pointer hover:bg-[#ebebeb] select-none">
                    <span className="flex items-center gap-1">Référence <SortIcon column="reference" /></span>
                  </th>
                  <th onClick={() => handleSort('rg')} className="px-4 py-4 text-left text-[13px] font-semibold text-[#1f1f1f] uppercase tracking-wide cursor-pointer hover:bg-[#ebebeb] select-none">
                    <span className="flex items-center gap-1">N° RG <SortIcon column="rg" /></span>
                  </th>
                  <th onClick={() => handleSort('tribunal')} className="px-4 py-4 text-left text-[13px] font-semibold text-[#1f1f1f] uppercase tracking-wide cursor-pointer hover:bg-[#ebebeb] select-none">
                    <span className="flex items-center gap-1">Tribunal <SortIcon column="tribunal" /></span>
                  </th>
                  <th onClick={() => handleSort('ville')} className="px-4 py-4 text-left text-[13px] font-semibold text-[#1f1f1f] uppercase tracking-wide cursor-pointer hover:bg-[#ebebeb] select-none">
                    <span className="flex items-center gap-1">Ville <SortIcon column="ville" /></span>
                  </th>
                  <th onClick={() => handleSort('statut')} className="px-4 py-4 text-center text-[13px] font-semibold text-[#1f1f1f] uppercase tracking-wide cursor-pointer hover:bg-[#ebebeb] select-none">
                    <span className="flex items-center justify-center gap-1">Statut <SortIcon column="statut" /></span>
                  </th>
                  <th onClick={() => handleSort('echeance')} className="px-4 py-4 text-center text-[13px] font-semibold text-[#1f1f1f] uppercase tracking-wide cursor-pointer hover:bg-[#ebebeb] select-none">
                    <span className="flex items-center justify-center gap-1">Échéance <SortIcon column="echeance" /></span>
                  </th>
                  <th onClick={() => handleSort('progression')} className="px-4 py-4 text-center text-[13px] font-semibold text-[#1f1f1f] uppercase tracking-wide cursor-pointer hover:bg-[#ebebeb] select-none">
                    <span className="flex items-center justify-center gap-1">Progress. <SortIcon column="progression" /></span>
                  </th>
                  <th onClick={() => handleSort('parties')} className="px-4 py-4 text-center text-[13px] font-semibold text-[#1f1f1f] uppercase tracking-wide cursor-pointer hover:bg-[#ebebeb] select-none">
                    <span className="flex items-center justify-center gap-1">Parties <SortIcon column="parties" /></span>
                  </th>
                  <th onClick={() => handleSort('reunions')} className="px-4 py-4 text-center text-[13px] font-semibold text-[#1f1f1f] uppercase tracking-wide cursor-pointer hover:bg-[#ebebeb] select-none">
                    <span className="flex items-center justify-center gap-1">Réunions <SortIcon column="reunions" /></span>
                  </th>
                  <th onClick={() => handleSort('desordres')} className="px-4 py-4 text-center text-[13px] font-semibold text-[#1f1f1f] uppercase tracking-wide cursor-pointer hover:bg-[#ebebeb] select-none">
                    <span className="flex items-center justify-center gap-1">Désordres <SortIcon column="desordres" /></span>
                  </th>
                  <th onClick={() => handleSort('provision')} className="px-4 py-4 text-right text-[13px] font-semibold text-[#1f1f1f] uppercase tracking-wide cursor-pointer hover:bg-[#ebebeb] select-none">
                    <span className="flex items-center justify-end gap-1">Provision <SortIcon column="provision" /></span>
                  </th>
                  <th className="px-4 py-4 text-center text-[13px] font-semibold text-[#1f1f1f] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {affairesTriees.map(affaire => {
                  const avancement = calculerAvancementTunnel(affaire);
                  const delaiRestant = affaire.date_echeance ? calculerDelaiRestant(affaire.date_echeance) : null;

                  return (
                    <tr
                      key={affaire.id}
                      className={`hover:bg-[#f7f7f7] active:bg-[#f0f0f0] cursor-pointer transition-colors ${affaire.urgent ? 'bg-[#ffebea]' : 'bg-white'}`}
                      onClick={() => handleSelectAffaire(affaire)}
                    >
                      {/* Référence */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {affaire.urgent && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          <span className="font-medium text-[#1a1a1a]">{affaire.reference}</span>
                        </div>
                      </td>

                      {/* N° RG */}
                      <td className="px-4 py-3 text-sm text-[#525252]">
                        {affaire.rg || '-'}
                      </td>

                      {/* Tribunal */}
                      <td className="px-4 py-3 text-sm text-[#525252]">
                        {affaire.tribunal || '-'}
                      </td>

                      {/* Ville */}
                      <td className="px-4 py-3 text-sm text-[#525252]">
                        {affaire.bien_ville || '-'}
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3 text-center">
                        <Badge variant={
                          affaire.statut === 'en-cours' ? 'info' :
                          affaire.statut === 'pre-rapport' ? 'warning' :
                          affaire.statut === 'termine' ? 'success' :
                          affaire.statut === 'archive' ? 'default' :
                          affaire.statut === 'suspendu' ? 'warning' : 'default'
                        }>
                          {affaire.statut === 'en-cours' ? 'En cours' :
                           affaire.statut === 'pre-rapport' ? 'Pré-rapport' :
                           affaire.statut === 'termine' ? 'Terminé' :
                           affaire.statut === 'archive' ? 'Archivé' :
                           affaire.statut === 'suspendu' ? 'Suspendu' :
                           affaire.statut || 'Nouveau'}
                        </Badge>
                      </td>

                      {/* Échéance */}
                      <td className="px-4 py-3 text-center">
                        {delaiRestant !== null ? (
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            delaiRestant <= 7 ? 'bg-red-100 text-red-600' :
                            delaiRestant <= 30 ? 'bg-amber-100 text-amber-600' :
                            'bg-[#f5f5f5] text-[#737373]'
                          }`}>
                            {delaiRestant > 0 ? `J-${delaiRestant}` : 'Dépassée'}
                          </span>
                        ) : (
                          <span className="text-[#a3a3a3]">-</span>
                        )}
                      </td>

                      {/* Progression */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                avancement >= 80 ? 'bg-green-500' :
                                avancement >= 40 ? 'bg-amber-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${avancement}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#737373] w-8">{avancement}%</span>
                        </div>
                      </td>

                      {/* Parties */}
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm ${(affaire.parties?.length || 0) > 0 ? 'text-[#1a1a1a]' : 'text-[#a3a3a3]'}`}>
                          {affaire.parties?.length || 0}
                        </span>
                      </td>

                      {/* Réunions */}
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm ${(affaire.reunions?.length || 0) > 0 ? 'text-[#1a1a1a]' : 'text-[#a3a3a3]'}`}>
                          {affaire.reunions?.length || 0}
                        </span>
                      </td>

                      {/* Désordres */}
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm ${(affaire.pathologies?.length || 0) > 0 ? 'text-[#1a1a1a]' : 'text-[#a3a3a3]'}`}>
                          {affaire.pathologies?.length || 0}
                        </span>
                      </td>

                      {/* Provision */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-[#1a1a1a]">
                          {affaire.provision_montant
                            ? `${parseFloat(affaire.provision_montant).toLocaleString('fr-FR')} €`
                            : '-'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="p-2 hover:bg-[#e5e5e5] rounded-lg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAffaire(affaire);
                            }}
                            title="Voir le dossier"
                          >
                            <Eye className="w-4 h-4 text-[#737373]" />
                          </button>
                          <div className="relative">
                            <button
                              className="p-2 hover:bg-[#e5e5e5] rounded-lg transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuId(actionMenuId === affaire.id ? null : affaire.id);
                              }}
                              title="Plus d'actions"
                            >
                              <MoreHorizontal className="w-4 h-4 text-[#737373]" />
                            </button>

                            {/* Menu déroulant */}
                            {actionMenuId === affaire.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-[#e5e5e5] py-1 z-50">
                                {/* Archiver */}
                                {affaire.statut !== 'archive' && (
                                  <button
                                    className="w-full px-4 py-2 text-left text-sm text-[#525252] hover:bg-[#f5f5f5] flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAction('archive', affaire);
                                    }}
                                  >
                                    <Archive className="w-4 h-4 text-[#737373]" />
                                    Archiver
                                  </button>
                                )}

                                {/* Suspendre */}
                                {affaire.statut !== 'suspendu' && affaire.statut !== 'archive' && (
                                  <button
                                    className="w-full px-4 py-2 text-left text-sm text-[#525252] hover:bg-[#f5f5f5] flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAction('suspend', affaire);
                                    }}
                                  >
                                    <PauseCircle className="w-4 h-4 text-amber-500" />
                                    Suspendre
                                  </button>
                                )}

                                {/* Réactiver */}
                                {(affaire.statut === 'suspendu' || affaire.statut === 'archive') && (
                                  <button
                                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-[#f5f5f5] flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAction('reactivate', affaire);
                                    }}
                                  >
                                    <Play className="w-4 h-4" />
                                    Réactiver
                                  </button>
                                )}

                                {/* Supprimer */}
                                <button
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-[#e5e5e5] mt-1 pt-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction('delete', affaire);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Supprimer
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal création */}
      {showCreateModal && (
        <ModalNouvelleAffaire
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Modal confirmation action */}
      {confirmAction && (
        <ModalBase
          isOpen={true}
          onClose={() => setConfirmAction(null)}
          title={
            confirmAction.type === 'delete' ? 'Supprimer l\'affaire' :
            confirmAction.type === 'archive' ? 'Archiver l\'affaire' :
            'Suspendre l\'affaire'
          }
          size="sm"
        >
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${
              confirmAction.type === 'delete' ? 'bg-red-50' :
              confirmAction.type === 'archive' ? 'bg-gray-50' :
              'bg-amber-50'
            }`}>
              {confirmAction.type === 'delete' ? (
                <div className="flex items-start gap-3">
                  <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Attention, cette action est irréversible !</p>
                    <p className="text-sm text-red-600 mt-1">
                      Toutes les données liées à cette affaire seront définitivement supprimées :
                      parties, réunions, désordres, documents, vacations...
                    </p>
                  </div>
                </div>
              ) : confirmAction.type === 'archive' ? (
                <div className="flex items-start gap-3">
                  <Archive className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">Archiver cette affaire ?</p>
                    <p className="text-sm text-gray-600 mt-1">
                      L'affaire sera déplacée dans les archives. Vous pourrez la réactiver ultérieurement.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <PauseCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Suspendre cette affaire ?</p>
                    <p className="text-sm text-amber-600 mt-1">
                      L'affaire sera mise en pause. Vous pourrez la réactiver quand vous le souhaitez.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#EFF6FF] rounded-xl">
              <p className="text-xs text-[#737373] uppercase tracking-wider mb-1">Affaire concernée</p>
              <p className="font-medium text-[#1a1a1a]">{confirmAction.affaire.reference}</p>
              {confirmAction.affaire.tribunal && (
                <p className="text-sm text-[#737373]">{confirmAction.affaire.tribunal}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setConfirmAction(null)}
              >
                Annuler
              </Button>
              <Button
                variant={confirmAction.type === 'delete' ? 'danger' : confirmAction.type === 'archive' ? 'secondary' : 'warning'}
                className={`flex-1 ${
                  confirmAction.type === 'delete' ? 'bg-red-600 hover:bg-red-700 text-white' :
                  confirmAction.type === 'suspend' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''
                }`}
                onClick={confirmActionHandler}
              >
                {confirmAction.type === 'delete' ? 'Supprimer' :
                 confirmAction.type === 'archive' ? 'Archiver' : 'Suspendre'}
              </Button>
            </div>
          </div>
        </ModalBase>
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
      className="p-6 cursor-pointer hover:border-[#2563EB] transition-colors group"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4 flex-1">
          {/* Icône */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            affaire.urgent ? 'bg-red-100' : 'bg-[#DBEAFE]'
          }`}>
            <Scale className={`w-6 h-6 ${affaire.urgent ? 'text-red-600' : 'text-[#2563EB]'}`} />
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
          <ChevronRight className="w-5 h-5 text-[#a3a3a3] group-hover:text-[#2563EB] transition-colors" />
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// MODAL NOUVELLE AFFAIRE - VERSION SIMPLIFIÉE
// Création rapide : seules les infos essentielles sont demandées
// Le reste sera complété dans la fiche détaillée
// ============================================================================

const ModalNouvelleAffaire = ({ onClose, onCreate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('simple'); // 'simple' ou 'complet'
  const [data, setData] = useState({
    tribunal: '',
    rg: '',
    date_ordonnance: new Date().toISOString().split('T')[0],
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
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Message d'aide */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-700">
            <strong>Création rapide :</strong> Renseignez uniquement le tribunal et le numéro RG.
            Vous pourrez compléter les détails dans la fiche affaire.
          </p>
        </div>

        {/* Champs essentiels */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tribunal *"
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

          <Input
            label="Date de l'ordonnance"
            type="date"
            value={data.date_ordonnance}
            onChange={(e) => handleChange('date_ordonnance', e.target.value)}
          />

          {/* Toggle pour afficher plus d'options */}
          <button
            type="button"
            onClick={() => setMode(mode === 'simple' ? 'complet' : 'simple')}
            className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium flex items-center gap-1"
          >
            {mode === 'simple' ? '+ Ajouter plus de détails' : '− Masquer les détails'}
          </button>
        </div>

        {/* Champs optionnels (mode complet) */}
        {mode === 'complet' && (
          <>
            {/* Échéance et urgence */}
            <div className="space-y-4 pt-4 border-t border-[#e5e5e5]">
              <h4 className="text-xs uppercase tracking-wider text-[#a3a3a3] font-medium">Délais</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date échéance"
                  type="date"
                  value={data.date_echeance}
                  onChange={(e) => handleChange('date_echeance', e.target.value)}
                />
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={data.urgent}
                    onChange={(e) => handleChange('urgent', e.target.checked)}
                    className="w-5 h-5 rounded accent-[#2563EB]"
                  />
                  <label htmlFor="urgent" className="text-sm text-[#525252]">
                    Marquer comme urgent
                  </label>
                </div>
              </div>
            </div>

            {/* Bien */}
            <div className="space-y-4 pt-4 border-t border-[#e5e5e5]">
              <h4 className="text-xs uppercase tracking-wider text-[#a3a3a3] font-medium">Bien expertisé</h4>
              <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-4 pt-4 border-t border-[#e5e5e5]">
              <h4 className="text-xs uppercase tracking-wider text-[#a3a3a3] font-medium">Provision</h4>
              <Input
                label="Montant (€)"
                type="number"
                value={data.provision_montant}
                onChange={(e) => handleChange('provision_montant', e.target.value)}
                placeholder="3000"
              />
            </div>
          </>
        )}

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
// COMPOSANT: ChecklistItem pour l'avancement
// ============================================================================

const ChecklistItem = ({ done, label }) => (
  <div className="flex items-center gap-2">
    {done ? (
      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
    ) : (
      <div className="w-4 h-4 border-2 border-[#d4d4d4] rounded-full flex-shrink-0" />
    )}
    <span className={`text-sm ${done ? 'text-[#525252]' : 'text-[#a3a3a3]'}`}>{label}</span>
  </div>
);

// ============================================================================
// FICHE AFFAIRE DÉTAILLÉE
// ============================================================================

export const FicheAffaire = ({ affaireId, onBack }) => {
  const toast = useToast();
  const { affaire, loading, error, update } = useAffaireDetail(affaireId);
  const { deleteAffaire } = useAffaires();
  const [activeTab, setActiveTab] = useState('general');
  const [editing, setEditing] = useState(false);
  const [showAddPartie, setShowAddPartie] = useState(false);
  const [showAddReunion, setShowAddReunion] = useState(false);
  const [showAddDesordre, setShowAddDesordre] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'delete'|'archive'|'suspend' }

  // États pour les modules workflow
  const [activeModule, setActiveModule] = useState(null); // 'convocation' | 'reunion' | 'compte-rendu'
  const [selectedReunion, setSelectedReunion] = useState(null);

  // ⏱️ Chronomètre automatique - démarre à l'entrée, sauvegarde à la sortie
  const timer = useAutoTimer(affaireId, 90); // 90€/h par défaut

  // Gestionnaire pour générer un document
  const handleGenerateDocument = () => {
    toast.info('Fonctionnalité à venir', 'Le générateur de document sera bientôt disponible');
  };

  // Gestionnaire d'actions (archiver, suspendre, supprimer)
  const handleAction = (type) => {
    setShowActionMenu(false);
    if (type === 'reactivate') {
      update({ statut: 'en-cours' });
    } else {
      setConfirmAction({ type });
    }
  };

  // Confirmer l'action
  const confirmActionHandler = async () => {
    if (!confirmAction) return;

    const { type } = confirmAction;

    if (type === 'delete') {
      await deleteAffaire(affaireId);
      onBack(); // Retourner à la liste après suppression
    } else if (type === 'archive') {
      await update({ statut: 'archive' });
    } else if (type === 'suspend') {
      await update({ statut: 'suspendu' });
    }

    setConfirmAction(null);
  };

  // Calculer la prochaine action recommandée
  const getNextAction = () => {
    if (!affaire) return null;
    if (!affaire.parties?.length) return { label: 'Ajouter les parties au dossier', action: () => setShowAddPartie(true), tab: 'parties' };
    if (!affaire.reunions?.length) return { label: 'Planifier la première réunion', action: () => setShowAddReunion(true), tab: 'reunions' };
    if (!affaire.pathologies?.length) return { label: 'Constater les désordres', action: () => setShowAddDesordre(true), tab: 'desordres' };
    if (!affaire.documents?.some(d => d.type === 'note-synthese' || d.type === 'pre-rapport')) {
      return { label: 'Rédiger la note de synthèse', action: () => navigate(`/affaires/${affaireId}/rapport`), tab: 'outils' };
    }
    return null;
  };

  const nextAction = getNextAction();
  const navigate = useNavigate();

  // Gestionnaire pour télécharger un document
  const handleDownloadDocument = (doc) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else {
      toast.info('Mode démo', `Le téléchargement de "${doc.titre}" n'est pas disponible en mode démonstration`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ONGLETS MÉTIER - Refonte UX selon Notice de Développement
  // 5 onglets alignés sur le workflow réel de l'expert judiciaire
  // ═══════════════════════════════════════════════════════════════════════════
  const tabs = [
    {
      id: 'dossier',
      label: 'Dossier',
      icon: FileText,
      description: 'Ordonnance, mission, parties, bien',
      count: affaire.parties?.length || 0
    },
    {
      id: 'operations',
      label: 'Opérations',
      icon: Calendar,
      description: 'Cycle complet par réunion (R1, R2...)',
      count: affaire.reunions?.length || 0
    },
    {
      id: 'contradictoire',
      label: 'Contradictoire',
      icon: Scale,
      description: 'Suivi échanges, dires, preuves',
      count: affaire.dires?.length || 0
    },
    {
      id: 'rapports',
      label: 'Rapports',
      icon: BookOpen,
      description: 'Pré-rapport et rapport final',
      count: null
    },
    {
      id: 'courriers',
      label: 'Courriers',
      icon: Mail,
      description: 'Génération courriers types',
      count: affaire.courriers?.length || 0
    },
    {
      id: 'finances',
      label: 'Finances',
      icon: Euro,
      description: 'Provisions, vacations, état de frais',
      count: null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={onBack} className="text-sm text-[#737373] hover:text-[#2563EB] mb-2">
            ← Retour à la liste
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-light text-[#1a1a1a]">{affaire.reference}</h1>
            {affaire.urgent && <Badge variant="error">Urgent</Badge>}
            <Badge variant={
              affaire.statut === 'en-cours' ? 'info' :
              affaire.statut === 'pre-rapport' ? 'warning' :
              affaire.statut === 'termine' ? 'success' :
              affaire.statut === 'suspendu' ? 'warning' :
              affaire.statut === 'archive' ? 'default' : 'default'
            }>
              {affaire.statut === 'en-cours' ? 'En cours' :
               affaire.statut === 'pre-rapport' ? 'Pré-rapport' :
               affaire.statut === 'termine' ? 'Terminé' :
               affaire.statut === 'suspendu' ? 'Suspendu' :
               affaire.statut === 'archive' ? 'Archivé' :
               affaire.statut || 'Nouveau'}
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

          {/* Menu d'actions */}
          <div className="relative">
            <Button
              variant="secondary"
              icon={MoreHorizontal}
              onClick={() => setShowActionMenu(!showActionMenu)}
            />
            {showActionMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-[#e5e5e5] py-1 z-50">
                {/* Archiver */}
                {affaire.statut !== 'archive' && (
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-[#525252] hover:bg-[#f5f5f5] flex items-center gap-2"
                    onClick={() => handleAction('archive')}
                  >
                    <Archive className="w-4 h-4 text-[#737373]" />
                    Archiver
                  </button>
                )}

                {/* Suspendre */}
                {affaire.statut !== 'suspendu' && affaire.statut !== 'archive' && (
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-[#525252] hover:bg-[#f5f5f5] flex items-center gap-2"
                    onClick={() => handleAction('suspend')}
                  >
                    <PauseCircle className="w-4 h-4 text-amber-500" />
                    Suspendre
                  </button>
                )}

                {/* Réactiver */}
                {(affaire.statut === 'suspendu' || affaire.statut === 'archive') && (
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-[#f5f5f5] flex items-center gap-2"
                    onClick={() => handleAction('reactivate')}
                  >
                    <Play className="w-4 h-4" />
                    Réactiver
                  </button>
                )}

                {/* Supprimer */}
                <button
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-[#e5e5e5] mt-1 pt-2"
                  onClick={() => handleAction('delete')}
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          ALERTES DÉLAIS - Affichage des alertes critiques et urgentes
          ═══════════════════════════════════════════════════════════════════════ */}
      <AlertesDelais
        affaire={affaire}
        compact={true}
        onAction={(action, data) => {
          if (action === 'reponse-juge') {
            // Géré par ReponseJuge ci-dessous
          } else if (action === 'convocation' && data?.numero) {
            const reunion = affaire.reunions?.find(r => r.numero === data.numero);
            if (reunion) {
              setSelectedReunion(reunion);
              setActiveModule('convocation');
            }
          } else if (action === 'compte-rendu' && data?.numero) {
            const reunion = affaire.reunions?.find(r => r.numero === data.numero);
            if (reunion) {
              setSelectedReunion(reunion);
              setActiveModule('compte-rendu');
            }
          } else if (action === 'voir-toutes-alertes') {
            // TODO: Ouvrir modal avec toutes les alertes
          }
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          DASHBOARD INTELLIGENT - Refonte UX 10/10
          ═══════════════════════════════════════════════════════════════════════ */}

      {/* Dashboard contextuel avec prochaine action et KPIs */}
      <DashboardAffaire
        affaire={affaire}
        onNavigate={({ tab }) => tab && setActiveTab(tab)}
        onAction={(action) => {
          const reunions = affaire.reunions || [];
          const reunionR1 = reunions.find(r => r.numero === 1) || reunions[0];

          if (action === 'reponse-juge') {
            // Ouvrir le modal de réponse au juge (déjà géré par ReponseJuge)
          } else if (action === 'convocation') {
            setSelectedReunion(reunionR1 || { numero: 1, type: 'contradictoire', statut: 'planifiee' });
            setActiveModule('convocation');
          } else if (action === 'reunion') {
            setSelectedReunion(reunionR1 || { numero: 1, type: 'contradictoire', statut: 'planifiee' });
            setActiveModule('reunion');
          } else if (action === 'compte-rendu') {
            setSelectedReunion(reunionR1 || { numero: 1, type: 'contradictoire', statut: 'terminee' });
            setActiveModule('compte-rendu');
          }
        }}
      />

      {/* Réponse au juge (si pas encore répondu) - Modal contextuel */}
      {affaire.date_ordonnance && !affaire.reponse_juge && (
        <ReponseJuge
          affaire={affaire}
          onUpdate={(data) => update(data)}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          ONGLETS SIMPLIFIÉS - 5 onglets au lieu de 10
          ═══════════════════════════════════════════════════════════════════════ */}

      {/* Tabs avec compteurs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Contenu des tabs - STRUCTURE SIMPLIFIÉE */}
      <div className="min-h-[400px]">

        {/* ═══════════════════ ONGLET DOSSIER ═══════════════════ */}
        {activeTab === 'dossier' && (
          <div className="space-y-6">
            {/* Infos générales */}
            <TabGeneral affaire={affaire} onUpdate={(updates) => update(updates)} />

            {/* Parties (intégré) */}
            <div className="pt-6 border-t border-[#e5e5e5]">
              <GestionParties affaire={affaire} onUpdate={(updates) => update(updates)} />
            </div>
          </div>
        )}

        {/* ═══════════════════ ONGLET OPÉRATIONS ═══════════════════ */}
        {/* Cycle complet par réunion : Convocation → Réunion → Notes/Photos → CR → Désordres */}
        {activeTab === 'operations' && (
          <div className="space-y-6">
            {/* Alertes délais (mode compact) */}
            <AlertesDelais
              affaire={affaire}
              compact={true}
              onAction={(action, data) => {
                if (action === 'convocation' && data?.numero) {
                  const reunion = affaire.reunions?.find(r => r.numero === data.numero);
                  if (reunion) {
                    setSelectedReunion(reunion);
                    setActiveModule('convocation');
                  }
                } else if (action === 'compte-rendu' && data?.numero) {
                  const reunion = affaire.reunions?.find(r => r.numero === data.numero);
                  if (reunion) {
                    setSelectedReunion(reunion);
                    setActiveModule('compte-rendu');
                  }
                }
              }}
            />

            {/* Cycle des réunions */}
            <CycleReunion
              affaire={affaire}
              onConvoquer={(reunion) => {
                setSelectedReunion(reunion);
                setActiveModule('convocation');
              }}
              onDemarrerReunion={(reunion) => {
                setSelectedReunion(reunion);
                setActiveModule('reunion');
              }}
              onPrendreNotes={(reunion) => {
                setSelectedReunion(reunion);
                setActiveModule('reunion');
              }}
              onRedigerCR={(reunion) => {
                setSelectedReunion(reunion);
                setActiveModule('compte-rendu');
              }}
              onVoirDesordres={(desordre) => {
                // TODO: Ouvrir modal désordre
              }}
              onAjouterDesordre={(reunionNumero) => {
                setShowAddDesordre(true);
                // TODO: Pré-remplir le numéro de réunion
              }}
              onAjouterReunion={() => setShowAddReunion(true)}
            />
          </div>
        )}

        {/* ═══════════════════ ONGLET CONTRADICTOIRE ═══════════════════ */}
        {/* Suivi du contradictoire : qui a reçu quoi, dires, documents */}
        {activeTab === 'contradictoire' && (
          <div className="space-y-6">
            {/* Barre d'outils envois et suivi */}
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-[#1a1a1a]">Outils d'envoi</h4>
                  <p className="text-sm text-[#737373]">LRAR dématérialisées et suivi postal</p>
                </div>
                <div className="flex items-center gap-2">
                  <AR24Widget affaire={affaire} />
                  <SuiviLaPosteWidget affaire={affaire} />
                  <OpalexeWidget affaire={affaire} />
                </div>
              </div>
            </Card>

            {/* Tableau de suivi contradictoire */}
            <TableauContradictoire
              affaire={affaire}
              onRelance={(partieId, docType) => {
                // TODO: Envoyer relance
              }}
              onEnvoyer={(docType) => {
                // TODO: Envoyer document
              }}
            />

            {/* Dires des parties */}
            <div className="pt-6 border-t border-[#e5e5e5]">
              <GestionDires
                affaire={affaire}
                onUpdate={(updates) => update(updates)}
              />
            </div>

            {/* Documents échangés */}
            <div className="pt-6 border-t border-[#e5e5e5]">
              <h3 className="text-lg font-medium text-[#1a1a1a] mb-4">Documents échangés</h3>
              <GestionDocuments
                affaire={affaire}
                onUpdate={(updates) => update(updates)}
                onDownload={handleDownloadDocument}
              />
            </div>
          </div>
        )}

        {/* Compatibilité ancienne route "echanges" */}
        {activeTab === 'echanges' && (
          <div className="space-y-6">
            <TableauContradictoire affaire={affaire} />
            <GestionDires affaire={affaire} onUpdate={(updates) => update(updates)} />
            <GestionDocuments affaire={affaire} onUpdate={(updates) => update(updates)} onDownload={handleDownloadDocument} />
          </div>
        )}

        {/* ═══════════════════ ONGLET RAPPORTS ═══════════════════ */}
        {/* Production documentaire : Pré-rapport et Rapport final */}
        {activeTab === 'rapports' && (
          <div className="space-y-6">
            {/* Rapports */}
            <TabRapports
              affaire={affaire}
              onOpenNoteSynthese={() => setShowNoteSynthese(true)}
              onOpenRapportFinal={() => setShowRapportFinal(true)}
            />

            {/* Outils d'expertise */}
            <div className="pt-6 border-t border-[#e5e5e5]">
              <h3 className="text-lg font-medium text-[#1a1a1a] mb-4">Outils d'expertise</h3>
              <TabOutils affaire={affaire} navigate={navigate} />
            </div>
          </div>
        )}

        {/* Compatibilité ancienne route "production" */}
        {activeTab === 'production' && (
          <div className="space-y-6">
            <TabRapports
              affaire={affaire}
              onOpenNoteSynthese={() => setShowNoteSynthese(true)}
              onOpenRapportFinal={() => setShowRapportFinal(true)}
            />
            <TabOutils affaire={affaire} navigate={navigate} />
            <TimelineDossier affaire={affaire} />
          </div>
        )}

        {/* ═══════════════════ ONGLET FINANCES ═══════════════════ */}
        {activeTab === 'finances' && (
          <TabFinancier
            affaire={affaire}
            timer={timer}
            onUpdate={(updates) => update(updates)}
            onOpenEtatFrais={() => setShowEtatFrais(true)}
          />
        )}

        {/* ═══════════════════ ONGLET COURRIERS ═══════════════════ */}
        {/* Génération de courriers types : consignation, prorogation, demande pièces */}
        {activeTab === 'courriers' && (
          <GenerateurCourriers
            affaire={affaire}
            onUpdate={(updates) => update(updates)}
          />
        )}

        {/* ═══════════════════ ANCIENS ONGLETS (COMPATIBILITÉ) ═══════════════════ */}
        {activeTab === 'general' && <TabGeneral affaire={affaire} onUpdate={(updates) => update(updates)} />}
        {activeTab === 'parties' && <GestionParties affaire={affaire} onUpdate={(updates) => update(updates)} />}
        {activeTab === 'reunions' && (
          <GestionReunions
            affaire={affaire}
            onUpdate={(updates) => update(updates)}
          />
        )}
        {activeTab === 'desordres' && <GestionDesordres affaire={affaire} onUpdate={(updates) => update(updates)} />}
        {activeTab === 'dires' && (
          <GestionDires
            affaire={affaire}
            onUpdate={(updates) => update(updates)}
          />
        )}
        {activeTab === 'documents' && (
          <GestionDocuments
            affaire={affaire}
            onUpdate={(updates) => update(updates)}
          />
        )}
        {activeTab === 'rapports' && (
          <TabRapports
            affaire={affaire}
            onUpdate={(updates) => update(updates)}
          />
        )}
        {activeTab === 'financier' && (
          <EtatFrais
            affaire={affaire}
            onSave={(updates) => update(updates)}
          />
        )}
        {activeTab === 'timeline' && <TimelineDossier affaire={affaire} />}
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

      {/* Modal confirmation action */}
      {confirmAction && (
        <ModalBase
          isOpen={true}
          onClose={() => setConfirmAction(null)}
          title={
            confirmAction.type === 'delete' ? 'Supprimer l\'affaire' :
            confirmAction.type === 'archive' ? 'Archiver l\'affaire' :
            'Suspendre l\'affaire'
          }
          size="sm"
        >
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${
              confirmAction.type === 'delete' ? 'bg-red-50' :
              confirmAction.type === 'archive' ? 'bg-gray-50' :
              'bg-amber-50'
            }`}>
              {confirmAction.type === 'delete' ? (
                <div className="flex items-start gap-3">
                  <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Attention, cette action est irréversible !</p>
                    <p className="text-sm text-red-600 mt-1">
                      Toutes les données liées à cette affaire seront définitivement supprimées :
                      parties, réunions, désordres, documents, vacations...
                    </p>
                  </div>
                </div>
              ) : confirmAction.type === 'archive' ? (
                <div className="flex items-start gap-3">
                  <Archive className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">Archiver cette affaire ?</p>
                    <p className="text-sm text-gray-600 mt-1">
                      L'affaire sera déplacée dans les archives. Vous pourrez la réactiver ultérieurement.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <PauseCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Suspendre cette affaire ?</p>
                    <p className="text-sm text-amber-600 mt-1">
                      L'affaire sera mise en pause. Vous pourrez la réactiver quand vous le souhaitez.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#EFF6FF] rounded-xl">
              <p className="text-xs text-[#737373] uppercase tracking-wider mb-1">Affaire concernée</p>
              <p className="font-medium text-[#1a1a1a]">{affaire.reference}</p>
              {affaire.tribunal && (
                <p className="text-sm text-[#737373]">{affaire.tribunal}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setConfirmAction(null)}
              >
                Annuler
              </Button>
              <Button
                variant={confirmAction.type === 'delete' ? 'danger' : confirmAction.type === 'archive' ? 'secondary' : 'warning'}
                className={`flex-1 ${
                  confirmAction.type === 'delete' ? 'bg-red-600 hover:bg-red-700 text-white' :
                  confirmAction.type === 'suspend' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''
                }`}
                onClick={confirmActionHandler}
              >
                {confirmAction.type === 'delete' ? 'Supprimer' :
                 confirmAction.type === 'archive' ? 'Archiver' : 'Suspendre'}
              </Button>
            </div>
          </div>
        </ModalBase>
      )}

      {/* Module Convocation R1 */}
      {activeModule === 'convocation' && selectedReunion && (
        <ModuleConvocation
          affaire={affaire}
          reunion={selectedReunion}
          expert={{ nom: 'Expert', prenom: 'Judiciaire', email: 'expert@domaine.fr' }}
          onUpdate={(data) => {
            // Mettre à jour la réunion avec les données de convocation
            const reunions = [...(affaire.reunions || [])];
            const idx = reunions.findIndex(r => r.id === selectedReunion.id || r.numero === selectedReunion.numero);
            if (idx >= 0) {
              reunions[idx] = { ...reunions[idx], ...data };
            } else {
              reunions.push({ ...selectedReunion, ...data, id: Date.now() });
            }
            update({ reunions });
          }}
          onClose={() => {
            setActiveModule(null);
            setSelectedReunion(null);
          }}
        />
      )}

      {/* Module Réunion R1 */}
      {activeModule === 'reunion' && selectedReunion && (
        <ModuleReunion
          affaire={affaire}
          reunion={selectedReunion}
          expert={{ nom: 'Expert', prenom: 'Judiciaire', email: 'expert@domaine.fr' }}
          onUpdate={(data) => {
            // Mettre à jour la réunion avec les données du module
            const reunions = [...(affaire.reunions || [])];
            const idx = reunions.findIndex(r => r.id === selectedReunion.id || r.numero === selectedReunion.numero);
            if (idx >= 0) {
              reunions[idx] = { ...reunions[idx], ...data };
            } else {
              reunions.push({ ...selectedReunion, ...data, id: Date.now() });
            }
            update({ reunions });
          }}
          onClose={() => {
            setActiveModule(null);
            setSelectedReunion(null);
          }}
        />
      )}

      {/* Module Compte-rendu R1 */}
      {activeModule === 'compte-rendu' && selectedReunion && (
        <ModuleCompteRendu
          affaire={affaire}
          reunion={selectedReunion}
          expert={{ nom: 'Expert', prenom: 'Judiciaire', email: 'expert@domaine.fr' }}
          onUpdate={(data) => {
            // Mettre à jour la réunion avec les données du compte-rendu
            const reunions = [...(affaire.reunions || [])];
            const idx = reunions.findIndex(r => r.id === selectedReunion.id || r.numero === selectedReunion.numero);
            if (idx >= 0) {
              reunions[idx] = { ...reunions[idx], ...data };
            } else {
              reunions.push({ ...selectedReunion, ...data, id: Date.now() });
            }
            update({ reunions });
          }}
          onClose={() => {
            setActiveModule(null);
            setSelectedReunion(null);
          }}
        />
      )}

      {/* ⏱️ Widget Timer flottant */}
      <TimerWidget
        affaireId={affaireId}
        affaireRef={affaire?.reference}
        tauxHoraire={90}
      />
    </div>
  );
};

// ============================================================================
// TABS CONTENU
// ============================================================================

const TabGeneral = ({ affaire, onUpdate }) => (
  <div className="grid grid-cols-2 gap-6">
    <Card className="p-6">
      <h4 className="font-medium text-[#1a1a1a] mb-4 flex items-center gap-2">
        <Gavel className="w-5 h-5 text-[#2563EB]" />
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
        <Building className="w-5 h-5 text-[#2563EB]" />
        Bien expertisé
      </h4>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[#737373]">Type</span>
          <span className="font-medium">{affaire.bien_type || 'N/C'}</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-[#737373]">Adresse</span>
          <div className="text-right">
            <span className="font-medium">{affaire.bien_adresse || 'N/C'}</span>
            <div className="font-medium">{affaire.bien_code_postal} {affaire.bien_ville}</div>
            {(affaire.bien_adresse || affaire.bien_ville) && (
              <LienGoogleMaps
                adresse={`${affaire.bien_adresse || ''}, ${affaire.bien_code_postal || ''} ${affaire.bien_ville || ''}`}
                variant="button"
                size="sm"
                className="mt-2"
              >
                Voir sur Maps
              </LienGoogleMaps>
            )}
          </div>
        </div>
      </div>
    </Card>

    {/* Mission avec éditeur structuré */}
    <div className="col-span-2">
      <EditeurMission affaire={affaire} onUpdate={onUpdate} compact={true} />
    </div>
  </div>
);

// Note: L'ancien TabParties a été remplacé par GestionParties (importé depuis ./GestionParties.jsx)

const TabReunions = ({ affaire, onAddReunion, onUpdate }) => {
  const [editingReunion, setEditingReunion] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const toast = useToast();

  const reunions = affaire.reunions || [];

  // Ouvrir modal d'édition
  const handleEdit = (reunion) => {
    setEditingReunion(reunion);
    setEditFormData({ ...reunion });
    setShowEditModal(true);
  };

  // Sauvegarder modifications
  const handleSaveEdit = async () => {
    try {
      const updatedReunions = reunions.map(r =>
        r.id === editingReunion.id ? { ...r, ...editFormData } : r
      );
      await onUpdate({ reunions: updatedReunions });
      setShowEditModal(false);
      setEditingReunion(null);
      toast.success('Réunion modifiée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  // Supprimer une réunion
  const handleDelete = async (reunion) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la réunion n°${reunion.numero} ?`)) return;
    try {
      const updatedReunions = reunions.filter(r => r.id !== reunion.id);
      await onUpdate({ reunions: updatedReunions });
      toast.success('Réunion supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Annuler une réunion (marquer comme annulée sans supprimer)
  const handleCancel = async (reunion) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir annuler la réunion n°${reunion.numero} ?`)) return;
    try {
      const updatedReunions = reunions.map(r =>
        r.id === reunion.id ? { ...r, statut: 'annulee' } : r
      );
      await onUpdate({ reunions: updatedReunions });
      toast.success('Réunion annulée');
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  return (
    <div className="space-y-4">
      {reunions.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Aucune réunion"
          description="Planifiez la première réunion d'expertise"
          action={onAddReunion}
          actionLabel="Planifier"
        />
      ) : (
        reunions.map(reunion => (
          <Card key={reunion.id} className={`p-4 hover:border-[#2563EB] transition-colors ${reunion.statut === 'annulee' ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  reunion.statut === 'terminee' ? 'bg-green-100' :
                  reunion.statut === 'annulee' ? 'bg-red-100' :
                  'bg-[#DBEAFE]'
                }`}>
                  <span className={`font-medium ${
                    reunion.statut === 'terminee' ? 'text-green-600' :
                    reunion.statut === 'annulee' ? 'text-red-600' :
                    'text-[#2563EB]'
                  }`}>{reunion.numero}</span>
                </div>
                <div>
                  <p className="font-medium text-[#1a1a1a]">
                    Réunion n°{reunion.numero}
                  </p>
                  <p className="text-sm text-[#737373]">
                    {reunion.date_reunion ? formatDateFr(reunion.date_reunion) : 'Date à définir'}
                    {reunion.heure_reunion && ` à ${reunion.heure_reunion}`}
                  </p>
                  {reunion.lieu && (
                    <p className="text-xs text-[#a3a3a3]">{reunion.lieu}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={
                  reunion.statut === 'terminee' ? 'success' :
                  reunion.statut === 'annulee' ? 'error' :
                  reunion.statut === 'en_cours' ? 'warning' :
                  'info'
                }>
                  {reunion.statut === 'terminee' ? 'Terminée' :
                   reunion.statut === 'annulee' ? 'Annulée' :
                   reunion.statut === 'en_cours' ? 'En cours' :
                   'Planifiée'}
                </Badge>
                {reunion.statut !== 'annulee' && (
                  <>
                    <button
                      className="p-2 text-[#a3a3a3] hover:text-[#0381fe] hover:bg-blue-50 rounded-lg"
                      onClick={() => handleEdit(reunion)}
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {reunion.statut !== 'terminee' && (
                      <button
                        className="p-2 text-[#a3a3a3] hover:text-amber-500 hover:bg-amber-50 rounded-lg"
                        onClick={() => handleCancel(reunion)}
                        title="Annuler la réunion"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
                <button
                  className="p-2 text-[#a3a3a3] hover:text-red-500 hover:bg-red-50 rounded-lg"
                  onClick={() => handleDelete(reunion)}
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))
      )}
      <Button variant="secondary" icon={Plus} className="w-full" onClick={onAddReunion}>
        Planifier une réunion
      </Button>

      {/* Modal d'édition */}
      <ModalBase
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Modifier la réunion n°${editingReunion?.numero}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">Date</label>
              <input
                type="date"
                value={editFormData.date_reunion || ''}
                onChange={(e) => setEditFormData({ ...editFormData, date_reunion: e.target.value })}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">Heure</label>
              <input
                type="time"
                value={editFormData.heure_reunion || ''}
                onChange={(e) => setEditFormData({ ...editFormData, heure_reunion: e.target.value })}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">Lieu</label>
            <input
              type="text"
              value={editFormData.lieu || ''}
              onChange={(e) => setEditFormData({ ...editFormData, lieu: e.target.value })}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              placeholder="Adresse de la réunion"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">Statut</label>
            <select
              value={editFormData.statut || 'planifiee'}
              onChange={(e) => setEditFormData({ ...editFormData, statut: e.target.value })}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
            >
              <option value="planifiee">Planifiée</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">Notes</label>
            <textarea
              value={editFormData.notes || ''}
              onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] resize-none"
              rows={3}
              placeholder="Notes sur cette réunion..."
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
            <Button variant="secondary" onClick={() => setShowEditModal(false)} className="flex-1">
              Annuler
            </Button>
            <Button variant="primary" icon={Save} onClick={handleSaveEdit} className="flex-1">
              Enregistrer
            </Button>
          </div>
        </div>
      </ModalBase>
    </div>
  );
};

const TabDesordres = ({ affaire, onAddDesordre, onUpdate }) => {
  const [editingDesordre, setEditingDesordre] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const toast = useToast();

  const pathologies = affaire.pathologies || [];

  // Ouvrir modal d'édition
  const handleEdit = (desordre) => {
    setEditingDesordre(desordre);
    setEditFormData({ ...desordre });
    setShowEditModal(true);
  };

  // Sauvegarder modifications
  const handleSaveEdit = async () => {
    try {
      const updatedPathologies = pathologies.map(p =>
        p.id === editingDesordre.id ? { ...p, ...editFormData } : p
      );
      await onUpdate({ pathologies: updatedPathologies });
      setShowEditModal(false);
      setEditingDesordre(null);
      toast.success('Désordre modifié avec succès');
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  // Supprimer un désordre
  const handleDelete = async (desordre) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le désordre D${desordre.numero} ?`)) return;
    try {
      const updatedPathologies = pathologies.filter(p => p.id !== desordre.id);
      await onUpdate({ pathologies: updatedPathologies });
      toast.success('Désordre supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-4">
      {pathologies.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Aucun désordre"
          description="Ajoutez les désordres constatés"
          action={onAddDesordre}
          actionLabel="Ajouter"
        />
      ) : (
        pathologies.map(pathologie => (
          <Card key={pathologie.id} className="p-4 hover:border-[#2563EB] transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 bg-[#1a1a1a] text-white rounded">
                    D{pathologie.numero}
                  </span>
                  <span className="font-medium text-[#1a1a1a]">{pathologie.intitule}</span>
                </div>
                <p className="text-sm text-[#737373]">{pathologie.localisation}</p>
                {pathologie.description && (
                  <p className="text-xs text-[#a3a3a3] mt-1 line-clamp-2">{pathologie.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge variant={
                  pathologie.garantie === 'decennale' ? 'error' :
                  pathologie.garantie === 'biennale' ? 'warning' :
                  pathologie.garantie === 'gpa' ? 'info' : 'default'
                }>
                  {pathologie.garantie || 'À qualifier'}
                </Badge>
                <button
                  className="p-2 text-[#a3a3a3] hover:text-[#0381fe] hover:bg-blue-50 rounded-lg"
                  onClick={() => handleEdit(pathologie)}
                  title="Modifier"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-[#a3a3a3] hover:text-red-500 hover:bg-red-50 rounded-lg"
                  onClick={() => handleDelete(pathologie)}
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))
      )}
      <Button variant="secondary" icon={Plus} className="w-full" onClick={onAddDesordre}>
        Ajouter un désordre
      </Button>

      {/* Modal d'édition */}
      <ModalBase
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Modifier le désordre D${editingDesordre?.numero}`}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">Intitulé *</label>
            <input
              type="text"
              value={editFormData.intitule || ''}
              onChange={(e) => setEditFormData({ ...editFormData, intitule: e.target.value })}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              placeholder="Ex: Fissures en façade"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">Localisation</label>
            <input
              type="text"
              value={editFormData.localisation || ''}
              onChange={(e) => setEditFormData({ ...editFormData, localisation: e.target.value })}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              placeholder="Ex: Façade nord, niveau RDC"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">Garantie applicable</label>
            <select
              value={editFormData.garantie || ''}
              onChange={(e) => setEditFormData({ ...editFormData, garantie: e.target.value })}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
            >
              <option value="">À qualifier</option>
              <option value="gpa">GPA (Garantie de Parfait Achèvement)</option>
              <option value="biennale">Garantie Biennale</option>
              <option value="decennale">Garantie Décennale</option>
              <option value="contractuelle">Responsabilité Contractuelle</option>
              <option value="aucune">Aucune garantie applicable</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">Description</label>
            <textarea
              value={editFormData.description || ''}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] resize-none"
              rows={4}
              placeholder="Description détaillée du désordre..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">Gravité</label>
              <select
                value={editFormData.gravite || ''}
                onChange={(e) => setEditFormData({ ...editFormData, gravite: e.target.value })}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              >
                <option value="">Non définie</option>
                <option value="mineure">Mineure</option>
                <option value="moyenne">Moyenne</option>
                <option value="majeure">Majeure</option>
                <option value="critique">Critique</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">Estimation coût réparation (€)</label>
              <input
                type="number"
                value={editFormData.cout_estimation || ''}
                onChange={(e) => setEditFormData({ ...editFormData, cout_estimation: e.target.value })}
                className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
                placeholder="5000"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
            <Button variant="secondary" onClick={() => setShowEditModal(false)} className="flex-1">
              Annuler
            </Button>
            <Button variant="primary" icon={Save} onClick={handleSaveEdit} className="flex-1">
              Enregistrer
            </Button>
          </div>
        </div>
      </ModalBase>
    </div>
  );
};

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
              <FileText className="w-5 h-5 text-[#2563EB]" />
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

// ============================================================================
// TAB RAPPORTS - Note de synthèse et Rapport final
// ============================================================================

const TabRapports = ({ affaire, onUpdate }) => {
  const [activeRapport, setActiveRapport] = useState('note-synthese'); // 'note-synthese' | 'rapport-final'
  const [textToInsert, setTextToInsert] = useState(null);

  // Fonction pour insérer le texte généré par l'IA dans l'éditeur actif
  const handleInsertText = (text) => {
    setTextToInsert(text);
    // Le texte sera récupéré par l'éditeur actif
  };

  return (
    <div className="space-y-6">
      {/* Barre d'outils intégrations */}
      <Card className="p-4 bg-gradient-to-r from-[#EFF6FF] to-white">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-[#1a1a1a]">Outils de rédaction</h4>
            <p className="text-sm text-[#737373]">Assistance IA et échanges avec la juridiction</p>
          </div>
          <div className="flex items-center gap-2">
            <AssistantIAWidget affaire={affaire} onInsertText={handleInsertText} />
            <OpalexeWidget affaire={affaire} />
          </div>
        </div>
      </Card>

      {/* Sélection du type de rapport */}
      <Card className="p-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveRapport('note-synthese')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              activeRapport === 'note-synthese'
                ? 'border-[#2563EB] bg-[#EFF6FF]'
                : 'border-[#e5e5e5] hover:border-[#2563EB]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeRapport === 'note-synthese' ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#1a1a1a]">Note de synthèse</p>
                <p className="text-xs text-[#737373]">Pré-rapport pour observations</p>
              </div>
              {affaire.note_synthese_date && (
                <Badge variant="success" className="ml-auto">Créée</Badge>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveRapport('rapport-final')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              activeRapport === 'rapport-final'
                ? 'border-[#2563EB] bg-[#EFF6FF]'
                : 'border-[#e5e5e5] hover:border-[#2563EB]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeRapport === 'rapport-final' ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#1a1a1a]">Rapport final</p>
                <p className="text-xs text-[#737373]">Document définitif</p>
              </div>
              {affaire.rapport_final_verrouille ? (
                <Badge variant="success" className="ml-auto">Finalisé</Badge>
              ) : affaire.rapport_final_date ? (
                <Badge variant="warning" className="ml-auto">En cours</Badge>
              ) : null}
            </div>
          </button>
        </div>
      </Card>

      {/* Contenu de l'éditeur */}
      {activeRapport === 'note-synthese' ? (
        <EditeurNoteSynthese
          affaire={affaire}
          onSave={onUpdate}
        />
      ) : (
        <EditeurRapportFinal
          affaire={affaire}
          onSave={onUpdate}
        />
      )}
    </div>
  );
};

const TabFinancier = ({ affaire, onUpdate }) => {
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionData, setProvisionData] = useState({
    montant: affaire.provision_montant || '',
    date_reception: affaire.provision_date_reception || '',
    mode_paiement: affaire.provision_mode_paiement || 'virement'
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const totalVacations = (affaire.vacations || []).reduce((acc, v) => acc + (parseFloat(v.montant) || 0), 0);
  const totalFrais = (affaire.frais || []).reduce((acc, f) => acc + (parseFloat(f.montant) || 0), 0);
  const provision = parseFloat(affaire.provision_montant) || 0;

  // Valider la réception de la provision
  const handleValidateProvision = async () => {
    setLoading(true);
    try {
      await onUpdate({
        provision_recue: true,
        provision_date_reception: provisionData.date_reception || new Date().toISOString().split('T')[0],
        provision_montant: provisionData.montant,
        provision_mode_paiement: provisionData.mode_paiement
      });
      setShowProvisionModal(false);
      toast.success('Provision validée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  // Annuler la validation de la provision
  const handleCancelProvision = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler la validation de cette provision ?')) return;
    setLoading(true);
    try {
      await onUpdate({
        provision_recue: false,
        provision_date_reception: null
      });
      toast.success('Validation annulée');
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Carte Provision avec actions */}
        <Card className={`p-6 ${affaire.provision_recue ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
          <div className="flex items-start justify-between mb-4">
            <h4 className="font-medium text-[#1a1a1a]">Provision / Consignation</h4>
            {affaire.provision_recue ? (
              <Badge variant="success">Reçue ✓</Badge>
            ) : (
              <Badge variant="warning">En attente</Badge>
            )}
          </div>

          <p className="text-3xl font-light text-[#2563EB]">
            {provision.toLocaleString('fr-FR')} €
          </p>

          {affaire.provision_recue ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-green-700">
                Reçue le {formatDateFr(affaire.provision_date_reception)}
              </p>
              {affaire.provision_mode_paiement && (
                <p className="text-xs text-[#737373]">
                  Mode: {affaire.provision_mode_paiement === 'virement' ? 'Virement bancaire' :
                         affaire.provision_mode_paiement === 'cheque' ? 'Chèque' : 'Autre'}
                </p>
              )}
              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={handleCancelProvision}
                className="mt-2 text-amber-600 hover:text-amber-700"
              >
                Annuler la validation
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <Button
                variant="primary"
                icon={CheckCircle}
                onClick={() => setShowProvisionModal(true)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Valider la réception
              </Button>
            </div>
          )}
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

      {/* Modal de validation provision */}
      <ModalBase
        isOpen={showProvisionModal}
        onClose={() => setShowProvisionModal(false)}
        title="Valider la réception de la provision"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
              Montant reçu (€)
            </label>
            <input
              type="number"
              value={provisionData.montant}
              onChange={(e) => setProvisionData({ ...provisionData, montant: e.target.value })}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
              Date de réception
            </label>
            <input
              type="date"
              value={provisionData.date_reception}
              onChange={(e) => setProvisionData({ ...provisionData, date_reception: e.target.value })}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
              Mode de paiement
            </label>
            <select
              value={provisionData.mode_paiement}
              onChange={(e) => setProvisionData({ ...provisionData, mode_paiement: e.target.value })}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
            >
              <option value="virement">Virement bancaire</option>
              <option value="cheque">Chèque</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
            <Button variant="secondary" onClick={() => setShowProvisionModal(false)} className="flex-1">
              Annuler
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle}
              onClick={handleValidateProvision}
              loading={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Confirmer la réception
            </Button>
          </div>
        </div>
      </ModalBase>
    </div>
  );
};

// ============================================================================
// TAB OUTILS - Outils Excellence contextuels liés à l'affaire
// ============================================================================

const TabOutils = ({ affaire }) => {
  const [activeTool, setActiveTool] = useState(null);
  const [searchJuris, setSearchJuris] = useState('');
  const [opalexeChecks, setOpalexeChecks] = useState({});
  const [chronoRunning, setChronoRunning] = useState(false);
  const [chronoTime, setChronoTime] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();

  // Chronomètre
  React.useEffect(() => {
    let interval = null;
    if (chronoRunning) {
      interval = setInterval(() => {
        setChronoTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [chronoRunning]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

  // Jurisprudence filtrée
  const jurisprudenceFiltered = useMemo(() => {
    if (!searchJuris) return JURISPRUDENCE?.slice(0, 5) || [];
    return (JURISPRUDENCE || []).filter(j =>
      j.titre?.toLowerCase().includes(searchJuris.toLowerCase()) ||
      j.resume?.toLowerCase().includes(searchJuris.toLowerCase())
    ).slice(0, 10);
  }, [searchJuris]);

  // Catégories d'outils
  const categoriesOutils = [
    {
      titre: 'Analyse & Calculs',
      outils: [
        {
          id: 'garanties',
          label: 'Garanties',
          icon: Scale,
          description: 'GPA, Biennale, Décennale',
          disabled: !affaire.date_reception_ouvrage,
          color: '#0381fe'
        },
        {
          id: 'imputabilite',
          label: 'Imputabilité',
          icon: Target,
          description: `${affaire.pathologies?.length || 0} désordres`,
          disabled: !affaire.pathologies?.length,
          color: '#9333ea',
          action: () => navigate(`/affaires/${affaire.id}/imputabilite`)
        },
        {
          id: 'chiffrage',
          label: 'Chiffrage',
          icon: Calculator,
          description: 'Estimation travaux',
          disabled: !affaire.pathologies?.length,
          color: '#00a65a',
          action: () => navigate(`/affaires/${affaire.id}/chiffrage`)
        },
        {
          id: 'qualification',
          label: 'Qualification',
          icon: FlaskConical,
          description: 'Nature des désordres',
          disabled: false,
          color: '#f59e0b'
        }
      ]
    },
    {
      titre: 'Références',
      outils: [
        {
          id: 'dtu',
          label: 'Base DTU',
          icon: BookOpen,
          description: 'Normes techniques',
          disabled: false,
          color: '#06b6d4'
        },
        {
          id: 'jurisprudence',
          label: 'Jurisprudence',
          icon: Gavel,
          description: 'Décisions de référence',
          disabled: false,
          color: '#8b5cf6'
        }
      ]
    },
    {
      titre: 'Conformité',
      outils: [
        {
          id: 'conformite',
          label: 'Check-list CPC',
          icon: CheckCircle,
          description: 'Procédure civile',
          disabled: false,
          color: '#10b981'
        },
        {
          id: 'opalexe',
          label: 'OPALEXE',
          icon: Upload,
          description: 'Dépôt dématérialisé',
          disabled: false,
          color: '#0ea5e9'
        }
      ]
    },
    {
      titre: 'Production',
      outils: [
        {
          id: 'rapport',
          label: 'Rapport',
          icon: FileText,
          description: 'Générer le rapport',
          disabled: false,
          color: '#2563EB',
          action: () => navigate(`/affaires/${affaire.id}/rapport`)
        },
        {
          id: 'courriers',
          label: 'Courriers',
          icon: Mail,
          description: 'Générer des courriers',
          disabled: false,
          color: '#6366f1',
          action: () => navigate(`/affaires/${affaire.id}/courriers`)
        },
        {
          id: 'chronometre',
          label: 'Chronomètre',
          icon: Timer,
          description: 'Suivi du temps',
          disabled: false,
          color: '#ef4444'
        },
        {
          id: 'dictee',
          label: 'Dictée vocale',
          icon: Mic,
          description: 'Transcription',
          disabled: false,
          color: '#ec4899',
          action: () => navigate('/outils/dictee')
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Catégories d'outils */}
      {categoriesOutils.map((categorie) => (
        <div key={categorie.titre}>
          <h3 className="text-sm font-semibold text-[#757575] uppercase tracking-wider mb-3">{categorie.titre}</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {categorie.outils.map(outil => (
              <Card
                key={outil.id}
                onClick={() => outil.disabled ? null : (outil.action ? outil.action() : setActiveTool(activeTool === outil.id ? null : outil.id))}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  outil.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-md'
                } ${activeTool === outil.id ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-transparent hover:border-[#e0e0e0]'}`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${outil.color}15` }}
                  >
                    <outil.icon className="w-6 h-6" style={{ color: outil.color }} />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1f1f1f] text-sm">{outil.label}</h4>
                    <p className="text-xs text-[#757575] mt-0.5">{outil.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Panneau détail outil - Garanties */}
      {activeTool === 'garanties' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-[#1a1a1a] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#2563EB]" />
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
              <BookOpen className="w-5 h-5 text-[#2563EB]" />
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
              <div key={dtu.code} className={`p-3 rounded-lg border ${dtu.applicable ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#e5e5e5]'}`}>
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
              <CheckCircle className="w-5 h-5 text-[#2563EB]" />
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

      {/* Panneau Jurisprudence */}
      {activeTool === 'jurisprudence' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-[#1f1f1f] flex items-center gap-2">
              <Gavel className="w-5 h-5 text-[#2563EB]" />
              Jurisprudence de référence
            </h3>
            <button onClick={() => setActiveTool(null)} className="text-[#757575] hover:text-[#1f1f1f]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <Input
              placeholder="Rechercher une décision..."
              value={searchJuris}
              onChange={(e) => setSearchJuris(e.target.value)}
              icon={Search}
            />
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {jurisprudenceFiltered.length > 0 ? jurisprudenceFiltered.map((juris, i) => (
              <div key={i} className="p-4 bg-[#f7f7f7] rounded-xl hover:bg-[#f0f0f0] cursor-pointer transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-[#1f1f1f]">{juris.titre || juris.reference}</p>
                    <p className="text-xs text-[#0381fe] mt-1">{juris.juridiction} - {juris.date}</p>
                    <p className="text-sm text-[#757575] mt-2 line-clamp-2">{juris.resume || juris.principe}</p>
                  </div>
                  <Badge variant="default" className="ml-3">{juris.domaine}</Badge>
                </div>
              </div>
            )) : (
              <p className="text-center text-[#757575] py-8">Aucune jurisprudence trouvée</p>
            )}
          </div>
        </Card>
      )}

      {/* Panneau Qualification des désordres */}
      {activeTool === 'qualification' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-[#1f1f1f] flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#2563EB]" />
              Qualification des désordres
            </h3>
            <button onClick={() => setActiveTool(null)} className="text-[#757575] hover:text-[#1f1f1f]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {(QUALIFICATION_DESORDRES || [
              { type: 'Malfaçon', description: 'Défaut d\'exécution des règles de l\'art', garantie: 'Décennale si impropriété' },
              { type: 'Vice caché', description: 'Défaut non apparent lors de la réception', garantie: 'GPA ou Décennale' },
              { type: 'Non-conformité', description: 'Écart avec les documents contractuels', garantie: 'Droit commun' },
              { type: 'Désordre évolutif', description: 'Aggravation progressive dans le temps', garantie: 'Décennale' }
            ]).map((qual, i) => (
              <div key={i} className="p-4 border border-[#e0e0e0] rounded-xl hover:border-[#2563EB] transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-[#1f1f1f]">{qual.type}</p>
                    <p className="text-sm text-[#757575] mt-1">{qual.description}</p>
                  </div>
                  <Badge variant="warning">{qual.garantie}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Panneau OPALEXE */}
      {activeTool === 'opalexe' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-[#1f1f1f] flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#2563EB]" />
              Check-list OPALEXE
            </h3>
            <button onClick={() => setActiveTool(null)} className="text-[#757575] hover:text-[#1f1f1f]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-[#757575] mb-4">
            Vérifiez ces éléments avant le dépôt sur la plateforme OPALEXE.
          </p>

          <div className="space-y-2">
            {(OPALEXE_CHECKLIST || [
              { id: 'rapport', label: 'Rapport d\'expertise signé (PDF/A)' },
              { id: 'annexes', label: 'Annexes numérotées et référencées' },
              { id: 'photos', label: 'Planche photographique avec légendes' },
              { id: 'plans', label: 'Plans et schémas techniques' },
              { id: 'devis', label: 'Devis et chiffrages joints' },
              { id: 'pv', label: 'PV de réunions signés' },
              { id: 'dires', label: 'Dires des parties et réponses' },
              { id: 'sommaire', label: 'Sommaire des pièces' }
            ]).map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 p-3 bg-[#f7f7f7] rounded-xl cursor-pointer hover:bg-[#f0f0f0] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={opalexeChecks[item.id] || false}
                  onChange={(e) => setOpalexeChecks(prev => ({ ...prev, [item.id]: e.target.checked }))}
                  className="w-5 h-5 rounded border-[#d1d1d1] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span className={opalexeChecks[item.id] ? 'text-[#1f1f1f]' : 'text-[#757575]'}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#e0e0e0]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#757575]">Progression</span>
              <span className="font-medium text-[#1f1f1f]">
                {Object.values(opalexeChecks).filter(Boolean).length} / {(OPALEXE_CHECKLIST || [{ id: 'rapport' }, { id: 'annexes' }, { id: 'photos' }, { id: 'plans' }, { id: 'devis' }, { id: 'pv' }, { id: 'dires' }, { id: 'sommaire' }]).length}
              </span>
            </div>
            <ProgressBar
              value={(Object.values(opalexeChecks).filter(Boolean).length / 8) * 100}
              color="blue"
              className="mt-2"
            />
          </div>
        </Card>
      )}

      {/* Panneau Chronomètre */}
      {activeTool === 'chronometre' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-[#1f1f1f] flex items-center gap-2">
              <Timer className="w-5 h-5 text-[#2563EB]" />
              Chronomètre - {affaire.reference}
            </h3>
            <button onClick={() => setActiveTool(null)} className="text-[#757575] hover:text-[#1f1f1f]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center py-8">
            <div className="text-5xl font-mono font-bold text-[#1f1f1f] mb-8">
              {formatTime(chronoTime)}
            </div>

            <div className="flex items-center justify-center gap-4">
              {!chronoRunning ? (
                <Button
                  onClick={() => setChronoRunning(true)}
                  className="bg-[#00a65a] hover:bg-[#008f4c] text-white px-8"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Démarrer
                </Button>
              ) : (
                <Button
                  onClick={() => setChronoRunning(false)}
                  className="bg-[#ff9500] hover:bg-[#e68600] text-white px-8"
                >
                  <StopCircle className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => { setChronoTime(0); setChronoRunning(false); }}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Réinitialiser
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-[#e0e0e0]">
              <Button
                variant="outline"
                onClick={() => {
                  const heuresFormatees = formatDureeHeures(chronoTime / 3600);
                  toast.success(`${heuresFormatees} enregistrées`, 'Temps ajouté à l\'affaire');
                }}
                className="text-[#2563EB] border-[#2563EB]"
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer le temps ({formatDureeHeures(chronoTime / 3600)})
              </Button>
            </div>
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
      // Récupérer les affaires (depuis localStorage ou données démo)
      const affaires = getStoredAffaires();
      const affaireIndex = affaires.findIndex(a => a.id === affaireId);

      if (affaireIndex !== -1) {
        const newPartie = {
          id: `partie-${Date.now()}`,
          ...data,
          created_at: new Date().toISOString()
        };

        if (!affaires[affaireIndex].parties) {
          affaires[affaireIndex].parties = [];
        }
        affaires[affaireIndex].parties.push(newPartie);

        // Sauvegarder dans localStorage
        saveAffaires(affaires);
        onSuccess();
      } else {
        console.error('Affaire non trouvée:', affaireId);
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
                className="w-5 h-5 rounded border-[#d4d4d4] text-[#2563EB] focus:ring-[#2563EB]"
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

        {/* Adresse avec autocomplete Google/API Adresse */}
        <FormulaireAdresse
          value={{
            adresse: data.adresse,
            codePostal: data.code_postal,
            ville: data.ville
          }}
          onChange={(adresseData) => {
            handleChange('adresse', adresseData.adresse);
            handleChange('code_postal', adresseData.codePostal);
            handleChange('ville', adresseData.ville);
          }}
          showMapsLink={true}
        />

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

      // Récupérer les affaires (depuis localStorage ou données démo)
      const affaires = getStoredAffaires();
      const affaireIndex = affaires.findIndex(a => a.id === affaireId);

      if (affaireIndex !== -1) {
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

        if (!affaires[affaireIndex].reunions) {
          affaires[affaireIndex].reunions = [];
        }
        affaires[affaireIndex].reunions.push(newReunion);

        // Sauvegarder dans localStorage
        saveAffaires(affaires);
        onSuccess();
      } else {
        console.error('Affaire non trouvée:', affaireId);
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
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] resize-none"
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
      // Récupérer les affaires (depuis localStorage ou données démo)
      const affaires = getStoredAffaires();
      const affaireIndex = affaires.findIndex(a => a.id === affaireId);

      if (affaireIndex !== -1) {
        const newPathologie = {
          id: `patho-${Date.now()}`,
          ...data,
          created_at: new Date().toISOString()
        };

        if (!affaires[affaireIndex].pathologies) {
          affaires[affaireIndex].pathologies = [];
        }
        affaires[affaireIndex].pathologies.push(newPathologie);

        // Sauvegarder dans localStorage
        saveAffaires(affaires);
        onSuccess();
      } else {
        console.error('Affaire non trouvée:', affaireId);
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
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] resize-none"
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
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB] resize-none"
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
