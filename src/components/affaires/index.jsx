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
  Wand2, Calculator, BookOpen, Shield, Target, ChevronDown, RotateCcw,
  Timer, Play, Square, Banknote, CircleDot, ArrowRight,
  Archive, PauseCircle, MoreHorizontal
} from 'lucide-react';
import { Card, Badge, Button, Input, Select, Tabs, ProgressBar, EmptyState, ModalBase, useToast } from '../ui';
import { useAffaires, useAffaireDetail, useParties } from '../../hooks/useSupabase';
import { useAutoTimer } from '../../hooks';
import { ETAPES_TUNNEL, GARANTIES, STATUTS_REUNION } from '../../data';
import { getStoredAffaires, saveAffaires } from '../../lib/demoData';
import { formatDateFr, calculerDelaiRestant, calculerAvancementTunnel } from '../../utils/helpers';

// Nouveaux composants Phase 1
import { WorkflowTunnel } from './WorkflowTunnel';
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

  // État des filtres
  const [filters, setFilters] = useState({
    statut: 'all',
    urgent: 'all', // 'all', 'oui', 'non'
    tribunal: 'all',
    ville: 'all',
    echeance: 'all', // 'all', 'depassee', 'semaine', 'mois', 'trimestre'
    progression: 'all', // 'all', '0-25', '25-50', '50-75', '75-100'
    avecParties: 'all', // 'all', 'oui', 'non'
    avecReunions: 'all',
    avecDesordres: 'all'
  });

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

      {/* Barre de recherche et filtres */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          {/* Recherche */}
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

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition-colors ${
              showFilters || activeFiltersCount > 0
                ? 'border-[#c9a227] bg-[#faf8f3] text-[#c9a227]'
                : 'border-[#e5e5e5] text-[#525252] hover:bg-[#f5f5f5]'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="bg-[#c9a227] text-white text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Bouton reset */}
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-3 border border-[#e5e5e5] rounded-xl text-[#737373] hover:bg-[#f5f5f5] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </button>
          )}

          {/* Bouton nouvelle affaire */}
          <Button variant="primary" icon={Plus} onClick={() => setShowCreateModal(true)}>
            Nouvelle affaire
          </Button>
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[#e5e5e5]">
            <div className="grid grid-cols-3 gap-4">
              {/* Statut */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
                  Statut
                </label>
                <select
                  value={filters.statut}
                  onChange={(e) => updateFilter('statut', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#c9a227]"
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
                <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
                  Urgence
                </label>
                <select
                  value={filters.urgent}
                  onChange={(e) => updateFilter('urgent', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#c9a227]"
                >
                  <option value="all">Toutes</option>
                  <option value="oui">Urgentes uniquement</option>
                  <option value="non">Non urgentes</option>
                </select>
              </div>

              {/* Tribunal */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
                  Tribunal
                </label>
                <select
                  value={filters.tribunal}
                  onChange={(e) => updateFilter('tribunal', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#c9a227]"
                >
                  <option value="all">Tous les tribunaux</option>
                  {uniqueValues.tribunaux.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Ville */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
                  Ville
                </label>
                <select
                  value={filters.ville}
                  onChange={(e) => updateFilter('ville', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#c9a227]"
                >
                  <option value="all">Toutes les villes</option>
                  {uniqueValues.villes.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Échéance */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
                  Échéance
                </label>
                <select
                  value={filters.echeance}
                  onChange={(e) => updateFilter('echeance', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#c9a227]"
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
                <label className="text-xs font-medium uppercase tracking-wider text-[#737373] block mb-2">
                  Progression
                </label>
                <select
                  value={filters.progression}
                  onChange={(e) => updateFilter('progression', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#c9a227]"
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
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#c9a227]"
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
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#c9a227]"
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
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#c9a227]"
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
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1a1a] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">N° RG</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Tribunal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Ville</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Échéance</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Progress.</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Parties</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Réunions</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Désordres</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Provision</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {affairesFiltrees.map(affaire => {
                  const avancement = calculerAvancementTunnel(affaire);
                  const delaiRestant = affaire.date_echeance ? calculerDelaiRestant(affaire.date_echeance) : null;

                  return (
                    <tr
                      key={affaire.id}
                      className={`hover:bg-[#faf8f3] cursor-pointer transition-colors ${affaire.urgent ? 'bg-red-50' : ''}`}
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

            <div className="p-3 bg-[#faf8f3] rounded-xl">
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

        {/* Mission */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-wider text-[#a3a3a3] font-medium">Mission</h4>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
              Texte de la mission
            </label>
            <textarea
              value={data.mission}
              onChange={(e) => handleChange('mission', e.target.value)}
              placeholder="Nous désignons M./Mme ... en qualité d'expert avec pour mission de..."
              rows={4}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] resize-none"
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
    { id: 'dires', label: `Dires (${affaire.dires?.length || 0})`, icon: FileText },
    { id: 'documents', label: `Documents (${affaire.documents?.length || 0})`, icon: Folder },
    { id: 'rapports', label: 'Rapports', icon: BookOpen },
    { id: 'financier', label: 'Financier', icon: Euro },
    { id: 'timeline', label: 'Historique', icon: Clock },
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
          NOUVEAU WORKFLOW - PHASE 1
          ═══════════════════════════════════════════════════════════════════════ */}

      {/* Réponse au juge (si pas encore répondu) */}
      {affaire.date_ordonnance && !affaire.reponse_juge && (
        <ReponseJuge
          affaire={affaire}
          onUpdate={(data) => update(data)}
        />
      )}

      {/* Tunnel d'avancement (12 étapes) */}
      <WorkflowTunnel
        affaire={affaire}
        onEtapeClick={(etape) => {
          // Ouvrir le module correspondant ou naviguer vers l'onglet
          const reunions = affaire.reunions || [];
          const reunionR1 = reunions.find(r => r.numero === 1) || reunions[0];

          if (etape.id === 'convocation-r1') {
            // Ouvrir le module Convocation R1
            setSelectedReunion(reunionR1 || { numero: 1, type: 'contradictoire', statut: 'planifiee' });
            setActiveModule('convocation');
          } else if (etape.id === 'reunion-r1') {
            // Ouvrir le module Réunion R1
            setSelectedReunion(reunionR1 || { numero: 1, type: 'contradictoire', statut: 'planifiee' });
            setActiveModule('reunion');
          } else if (etape.id === 'compte-rendu-r1') {
            // Ouvrir le module Compte-rendu R1
            setSelectedReunion(reunionR1 || { numero: 1, type: 'contradictoire', statut: 'terminee' });
            setActiveModule('compte-rendu');
          } else if (etape.id === 'reunions-supplementaires') {
            // Pour les réunions supplémentaires, on peut naviguer vers l'onglet réunions
            setActiveTab('reunions');
          } else if (etape.id === 'saisie-dossier') {
            setActiveTab('general');
          } else if (etape.id === 'dires') {
            setActiveTab('dires');
          } else if (etape.id === 'provision') {
            setActiveTab('financier');
          }
        }}
      />

      {/* Panneaux Timer + Provision (version compacte) */}
      <div className="grid grid-cols-2 gap-4">
        {/* ⏱️ Chronomètre automatique */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${timer.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <div>
                <p className="text-xs text-[#a3a3a3]">Session</p>
                <p className="text-xl font-light text-[#1a1a1a] font-mono">{timer.sessionFormatted}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#a3a3a3]">Total: {timer.totalFormatted}</p>
              <p className="text-lg font-medium text-[#c9a227]">{timer.totalMontant.toFixed(2)} €</p>
            </div>
          </div>
        </Card>

        {/* 💰 Provision */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {affaire.provision_recue ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <p className="text-xs text-[#a3a3a3]">Provision</p>
                <p className="text-xl font-light text-[#1a1a1a]">
                  {affaire.provision_montant ? `${parseFloat(affaire.provision_montant).toLocaleString('fr-FR')} €` : '— €'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-sm font-medium ${affaire.provision_recue ? 'text-green-600' : 'text-amber-600'}`}>
                {affaire.provision_recue ? 'Reçue' : 'En attente'}
              </span>
              {affaire.provision_montant && timer.totalMontant > 0 && (
                <p className={`text-xs ${(affaire.provision_montant - timer.totalMontant) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Reste: {(affaire.provision_montant - timer.totalMontant).toFixed(2)} €
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Contenu des tabs */}
      <div className="min-h-[400px]">
        {activeTab === 'general' && <TabGeneral affaire={affaire} />}
        {activeTab === 'parties' && <TabParties affaire={affaire} onAddPartie={() => setShowAddPartie(true)} />}
        {activeTab === 'reunions' && (
          <GestionReunions
            affaire={affaire}
            onUpdate={(updates) => update(updates)}
          />
        )}
        {activeTab === 'desordres' && <TabDesordres affaire={affaire} onAddDesordre={() => setShowAddDesordre(true)} />}
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

            <div className="p-3 bg-[#faf8f3] rounded-xl">
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
        action={onAddReunion}
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
        action={onAddDesordre}
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

// ============================================================================
// TAB RAPPORTS - Note de synthèse et Rapport final
// ============================================================================

const TabRapports = ({ affaire, onUpdate }) => {
  const [activeRapport, setActiveRapport] = useState('note-synthese'); // 'note-synthese' | 'rapport-final'

  return (
    <div className="space-y-6">
      {/* Sélection du type de rapport */}
      <Card className="p-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveRapport('note-synthese')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              activeRapport === 'note-synthese'
                ? 'border-[#c9a227] bg-[#faf8f3]'
                : 'border-[#e5e5e5] hover:border-[#c9a227]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeRapport === 'note-synthese' ? 'bg-[#c9a227] text-white' : 'bg-gray-100 text-gray-500'
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
                ? 'border-[#c9a227] bg-[#faf8f3]'
                : 'border-[#e5e5e5] hover:border-[#c9a227]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeRapport === 'rapport-final' ? 'bg-[#c9a227] text-white' : 'bg-gray-100 text-gray-500'
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
