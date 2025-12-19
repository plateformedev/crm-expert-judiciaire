// ============================================================================
// CRM EXPERT JUDICIAIRE - MODULE GESTION SAPITEURS
// Experts spécialisés consultés dans le cadre de l'expertise
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Users, UserPlus, Search, Filter, Phone, Mail, FileText,
  Calendar, Euro, Check, Clock, AlertTriangle, ChevronRight,
  Building, Award, Star, Edit, Trash2, Send, Download,
  Plus, Eye, Link2, MessageSquare
} from 'lucide-react';
import { Card, Badge, Button, Input, Select, ModalBase, EmptyState } from '../ui';
import { formatDateFr, formatMontant } from '../../utils/helpers';
import { supabase } from '../../lib/supabase';

// ============================================================================
// CONSTANTES
// ============================================================================

const SPECIALITES_SAPITEURS = [
  { value: 'structure', label: 'Structure / Génie civil', icon: '🏗️' },
  { value: 'geotechnique', label: 'Géotechnique / Sols', icon: '⛏️' },
  { value: 'thermique', label: 'Thermique / Énergétique', icon: '🌡️' },
  { value: 'acoustique', label: 'Acoustique', icon: '🔊' },
  { value: 'electricite', label: 'Électricité', icon: '⚡' },
  { value: 'plomberie', label: 'Plomberie / Fluides', icon: '🚿' },
  { value: 'incendie', label: 'Sécurité incendie', icon: '🔥' },
  { value: 'amiante', label: 'Amiante / Polluants', icon: '☣️' },
  { value: 'chiffrage', label: 'Économiste / Métreur', icon: '📊' },
  { value: 'architecte', label: 'Architecte', icon: '📐' },
  { value: 'labo', label: 'Laboratoire d\'analyses', icon: '🔬' },
  { value: 'autre', label: 'Autre spécialité', icon: '👤' }
];

const STATUTS_INTERVENTION = {
  'demande': { label: 'Demandée', color: 'blue' },
  'acceptee': { label: 'Acceptée', color: 'green' },
  'en-cours': { label: 'En cours', color: 'amber' },
  'rapport-recu': { label: 'Rapport reçu', color: 'green' },
  'facturee': { label: 'Facturée', color: 'gray' },
  'refusee': { label: 'Refusée', color: 'red' }
};

// ============================================================================
// HOOK GESTION DES SAPITEURS
// ============================================================================

export const useSapiteurs = (expertId) => {
  const [sapiteurs, setSapiteurs] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger le carnet d'adresses sapiteurs
  const fetchSapiteurs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('expert_id', expertId)
        .eq('type', 'sapiteur')
        .order('nom');

      if (error) throw error;
      setSapiteurs(data || []);
    } catch (err) {
      console.error('Erreur fetch sapiteurs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un sapiteur au carnet
  const addSapiteur = async (sapiteurData) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          expert_id: expertId,
          type: 'sapiteur',
          ...sapiteurData
        })
        .select()
        .single();

      if (error) throw error;
      setSapiteurs(prev => [...prev, data]);
      return { success: true, sapiteur: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Créer une intervention sapiteur pour une affaire
  const createIntervention = async (affaireId, sapiteurId, missionData) => {
    try {
      // En production, table dédiée interventions_sapiteurs
      // Ici simulation avec la structure existante
      const intervention = {
        id: Date.now(),
        affaire_id: affaireId,
        sapiteur_id: sapiteurId,
        sapiteur: sapiteurs.find(s => s.id === sapiteurId),
        statut: 'demande',
        date_demande: new Date().toISOString().split('T')[0],
        ...missionData
      };
      
      setInterventions(prev => [...prev, intervention]);
      return { success: true, intervention };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  React.useEffect(() => {
    if (expertId) fetchSapiteurs();
  }, [expertId]);

  return {
    sapiteurs,
    interventions,
    loading,
    addSapiteur,
    createIntervention,
    refetch: fetchSapiteurs
  };
};

// ============================================================================
// COMPOSANT PRINCIPAL - CARNET SAPITEURS
// ============================================================================

export const CarnetSapiteurs = ({ expertId, onSelectSapiteur }) => {
  const { sapiteurs, loading, addSapiteur } = useSapiteurs(expertId);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSpecialite, setFilterSpecialite] = useState('all');

  const sapiteursFiltres = useMemo(() => {
    return sapiteurs.filter(s => {
      const matchSearch = search === '' ||
        s.nom?.toLowerCase().includes(search.toLowerCase()) ||
        s.raison_sociale?.toLowerCase().includes(search.toLowerCase()) ||
        s.specialites?.some(sp => sp.toLowerCase().includes(search.toLowerCase()));
      const matchSpecialite = filterSpecialite === 'all' ||
        s.specialites?.includes(filterSpecialite);
      return matchSearch && matchSpecialite;
    });
  }, [sapiteurs, search, filterSpecialite]);

  // Grouper par spécialité
  const parSpecialite = useMemo(() => {
    const grouped = {};
    sapiteursFiltres.forEach(s => {
      const spec = s.specialites?.[0] || 'autre';
      if (!grouped[spec]) grouped[spec] = [];
      grouped[spec].push(s);
    });
    return grouped;
  }, [sapiteursFiltres]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#1a1a1a]">Carnet de sapiteurs</h2>
          <p className="text-[#737373]">{sapiteurs.length} expert(s) référencé(s)</p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={() => setShowAddModal(true)}>
          Ajouter un sapiteur
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
          <input
            type="text"
            placeholder="Rechercher par nom ou spécialité..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
          />
        </div>
        <select
          value={filterSpecialite}
          onChange={(e) => setFilterSpecialite(e.target.value)}
          className="px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
        >
          <option value="all">Toutes spécialités</option>
          {SPECIALITES_SAPITEURS.map(spec => (
            <option key={spec.value} value={spec.value}>{spec.icon} {spec.label}</option>
          ))}
        </select>
      </div>

      {/* Liste */}
      {sapiteurs.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun sapiteur"
          description="Ajoutez vos contacts d'experts spécialisés"
          action={() => setShowAddModal(true)}
          actionLabel="Ajouter un sapiteur"
        />
      ) : Object.keys(parSpecialite).length === 0 ? (
        <EmptyState
          icon={Search}
          title="Aucun résultat"
          description="Modifiez vos critères de recherche"
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(parSpecialite).map(([spec, saps]) => {
            const specInfo = SPECIALITES_SAPITEURS.find(s => s.value === spec) || SPECIALITES_SAPITEURS[SPECIALITES_SAPITEURS.length - 1];
            return (
              <div key={spec}>
                <h3 className="font-medium text-[#1a1a1a] mb-3 flex items-center gap-2">
                  <span>{specInfo.icon}</span>
                  {specInfo.label}
                  <Badge variant="default">{saps.length}</Badge>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {saps.map(sapiteur => (
                    <SapiteurCard
                      key={sapiteur.id}
                      sapiteur={sapiteur}
                      onClick={() => onSelectSapiteur && onSelectSapiteur(sapiteur)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal ajout */}
      {showAddModal && (
        <ModalAddSapiteur
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={async (data) => {
            const result = await addSapiteur(data);
            if (result.success) setShowAddModal(false);
            return result;
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// CARTE SAPITEUR
// ============================================================================

const SapiteurCard = ({ sapiteur, onClick }) => {
  return (
    <Card
      className="p-4 cursor-pointer hover:border-[#c9a227] transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#f5e6c8] rounded-xl flex items-center justify-center flex-shrink-0">
          <Award className="w-6 h-6 text-[#c9a227]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-[#1a1a1a] truncate">
              {sapiteur.raison_sociale || `${sapiteur.nom} ${sapiteur.prenom || ''}`}
            </h4>
            {sapiteur.favori && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
          </div>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {(sapiteur.specialites || []).slice(0, 2).map((spec, i) => {
              const specInfo = SPECIALITES_SAPITEURS.find(s => s.value === spec);
              return (
                <Badge key={i} variant="default" size="sm">
                  {specInfo?.icon} {specInfo?.label || spec}
                </Badge>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-sm text-[#737373]">
            {sapiteur.telephone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {sapiteur.telephone}
              </span>
            )}
            {sapiteur.ville && (
              <span className="flex items-center gap-1">
                <Building className="w-3 h-3" />
                {sapiteur.ville}
              </span>
            )}
          </div>

          {sapiteur.taux_horaire && (
            <p className="text-sm text-[#c9a227] mt-2">
              {formatMontant(sapiteur.taux_horaire)}/h
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// MODAL AJOUT SAPITEUR
// ============================================================================

const ModalAddSapiteur = ({ isOpen, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    raison_sociale: '',
    specialites: [],
    telephone: '',
    email: '',
    adresse: '',
    code_postal: '',
    ville: '',
    taux_horaire: '',
    notes: '',
    favori: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  const toggleSpecialite = (spec) => {
    setFormData(prev => ({
      ...prev,
      specialites: prev.specialites.includes(spec)
        ? prev.specialites.filter(s => s !== spec)
        : [...prev.specialites, spec]
    }));
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Ajouter un sapiteur" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identité */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nom *"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <Input
            label="Prénom"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
          />
          <div className="col-span-2">
            <Input
              label="Raison sociale / Cabinet"
              value={formData.raison_sociale}
              onChange={(e) => setFormData({ ...formData, raison_sociale: e.target.value })}
            />
          </div>
        </div>

        {/* Spécialités */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
            Spécialité(s) *
          </label>
          <div className="flex flex-wrap gap-2">
            {SPECIALITES_SAPITEURS.map(spec => (
              <button
                key={spec.value}
                type="button"
                onClick={() => toggleSpecialite(spec.value)}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                  formData.specialites.includes(spec.value)
                    ? 'bg-[#c9a227] border-[#c9a227] text-white'
                    : 'border-[#e5e5e5] hover:border-[#c9a227]'
                }`}
              >
                {spec.icon} {spec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Téléphone"
            type="tel"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        {/* Adresse */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3">
            <Input
              label="Adresse"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
            />
          </div>
          <Input
            label="Code postal"
            value={formData.code_postal}
            onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
          />
          <div className="col-span-2">
            <Input
              label="Ville"
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
            />
          </div>
        </div>

        {/* Tarif */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Taux horaire (€/h)"
            type="number"
            value={formData.taux_horaire}
            onChange={(e) => setFormData({ ...formData, taux_horaire: e.target.value })}
            placeholder="150"
          />
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="favori"
              checked={formData.favori}
              onChange={(e) => setFormData({ ...formData, favori: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="favori" className="text-sm text-[#737373]">
              Marquer comme favori
            </label>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227] resize-none"
            placeholder="Commentaires, délais habituels, qualité des rapports..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Ajouter au carnet
          </Button>
        </div>
      </form>
    </ModalBase>
  );
};

// ============================================================================
// COMPOSANT INTERVENTION SAPITEUR (pour une affaire)
// ============================================================================

export const InterventionsSapiteurs = ({ affaireId, interventions = [] }) => {
  const [showNewModal, setShowNewModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-[#1a1a1a]">Interventions sapiteurs</h3>
        <Button variant="secondary" size="sm" icon={Plus} onClick={() => setShowNewModal(true)}>
          Demander intervention
        </Button>
      </div>

      {interventions.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucune intervention"
          description="Sollicitez un sapiteur si nécessaire"
        />
      ) : (
        <div className="space-y-3">
          {interventions.map(intervention => {
            const statutInfo = STATUTS_INTERVENTION[intervention.statut] || STATUTS_INTERVENTION.demande;
            return (
              <Card key={intervention.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={statutInfo.color === 'green' ? 'success' : statutInfo.color === 'red' ? 'error' : 'info'}>
                        {statutInfo.label}
                      </Badge>
                    </div>
                    <p className="font-medium text-[#1a1a1a]">
                      {intervention.sapiteur?.raison_sociale || intervention.sapiteur?.nom}
                    </p>
                    <p className="text-sm text-[#737373]">{intervention.objet}</p>
                    <p className="text-xs text-[#a3a3a3] mt-1">
                      Demandé le {formatDateFr(intervention.date_demande)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {intervention.rapport_path && (
                      <Button variant="ghost" size="sm" icon={FileText} onClick={() => window.open(intervention.rapport_path, '_blank')}>
                        Rapport
                      </Button>
                    )}
                    {intervention.montant && (
                      <span className="text-sm font-medium text-[#c9a227]">
                        {formatMontant(intervention.montant)}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  CarnetSapiteurs,
  InterventionsSapiteurs,
  useSapiteurs,
  SPECIALITES_SAPITEURS,
  STATUTS_INTERVENTION
};
