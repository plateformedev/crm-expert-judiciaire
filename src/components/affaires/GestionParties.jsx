// ============================================================================
// CRM EXPERT JUDICIAIRE - GESTION DES PARTIES
// Module complet pour la gestion des parties dans une affaire
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Users, User, Building2, Briefcase, Shield, Plus, Edit, Trash2,
  Mail, Phone, MapPin, Search, ChevronDown, ChevronUp, Scale,
  UserPlus, Import, BookUser, Check, X, AlertCircle, FileText
} from 'lucide-react';
import { Card, Badge, Button, Input, Select, ModalBase, useToast } from '../ui';

// ============================================================================
// CONSTANTES
// ============================================================================

const QUALITES_PARTIE = [
  { value: 'demandeur', label: 'Demandeur', color: 'blue', description: 'Partie à l\'origine de la demande' },
  { value: 'defendeur', label: 'Défendeur', color: 'red', description: 'Partie mise en cause' },
  { value: 'intervenant', label: 'Intervenant volontaire', color: 'purple', description: 'Partie intervenue de son propre chef' },
  { value: 'appele_cause', label: 'Appelé en cause', color: 'orange', description: 'Partie attraite par une autre partie' },
  { value: 'assureur', label: 'Assureur', color: 'green', description: 'Compagnie d\'assurance' }
];

const TYPES_PERSONNE = [
  { value: 'physique', label: 'Personne physique', icon: User },
  { value: 'morale', label: 'Personne morale', icon: Building2 }
];

const ROLES_PARTIE = [
  'Maître d\'ouvrage',
  'Maître d\'œuvre',
  'Architecte',
  'Bureau d\'études',
  'Entreprise générale',
  'Entreprise tous corps d\'état',
  'Sous-traitant',
  'Contrôleur technique',
  'Coordonnateur SPS',
  'Syndic de copropriété',
  'Promoteur immobilier',
  'Vendeur',
  'Acquéreur',
  'Bailleur',
  'Locataire',
  'Assureur DO',
  'Assureur RC',
  'Assureur décennale',
  'Autre'
];

// ============================================================================
// COMPOSANT: Carte de partie
// ============================================================================

const PartieCard = ({ partie, onEdit, onDelete, onContact, expanded, onToggle }) => {
  const qualite = QUALITES_PARTIE.find(q => q.value === partie.qualite) || QUALITES_PARTIE[0];
  const isEntreprise = partie.type_personne === 'morale';

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      green: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      {/* En-tête */}
      <div
        className="p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Icône type */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getColorClasses(qualite.color)}`}>
              {isEntreprise ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>

            {/* Infos principales */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-[#1a1a1a]">
                  {isEntreprise
                    ? partie.raison_sociale
                    : `${partie.civilite || ''} ${partie.prenom || ''} ${partie.nom}`.trim()
                  }
                </p>
                <Badge className={`text-xs ${getColorClasses(qualite.color)}`}>
                  {qualite.label}
                </Badge>
              </div>

              {partie.role && (
                <p className="text-sm text-[#737373] mt-0.5">{partie.role}</p>
              )}

              {/* Représenté par */}
              {partie.represente_par && (
                <p className="text-sm text-[#a3a3a3] mt-1 flex items-center gap-1">
                  <Scale className="w-3 h-3" />
                  Représenté par {partie.represente_par}
                </p>
              )}

              {/* Avocat */}
              {partie.avocat?.nom && (
                <p className="text-sm text-[#2563EB] mt-1 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  Me {partie.avocat.nom} {partie.avocat.cabinet && `(${partie.avocat.cabinet})`}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className="p-2 text-[#a3a3a3] hover:text-[#2563EB] hover:bg-[#f5f5f5] rounded-lg"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Détails (expandable) */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-[#f0f0f0] space-y-4 animate-fadeInDown">
          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            {partie.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[#a3a3a3]" />
                <a href={`mailto:${partie.email}`} className="text-[#2563EB] hover:underline">
                  {partie.email}
                </a>
              </div>
            )}
            {partie.telephone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-[#a3a3a3]" />
                <a href={`tel:${partie.telephone}`} className="text-[#2563EB] hover:underline">
                  {partie.telephone}
                </a>
              </div>
            )}
          </div>

          {/* Adresse */}
          {partie.adresse && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-[#a3a3a3] mt-0.5" />
              <span className="text-[#737373]">
                {partie.adresse}
                {partie.code_postal && `, ${partie.code_postal}`}
                {partie.ville && ` ${partie.ville}`}
              </span>
            </div>
          )}

          {/* Infos entreprise */}
          {isEntreprise && partie.siret && (
            <div className="text-sm text-[#737373]">
              <span className="font-medium">SIRET:</span> {partie.siret}
              {partie.representant_legal && (
                <> · <span className="font-medium">Représentant légal:</span> {partie.representant_legal}</>
              )}
            </div>
          )}

          {/* Avocat complet */}
          {partie.avocat?.nom && (
            <div className="bg-[#f9fafb] rounded-xl p-3">
              <p className="text-xs uppercase tracking-wider text-[#a3a3a3] mb-2">Avocat</p>
              <p className="font-medium text-[#1a1a1a]">Me {partie.avocat.nom}</p>
              {partie.avocat.cabinet && <p className="text-sm text-[#737373]">{partie.avocat.cabinet}</p>}
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                {partie.avocat.email && (
                  <a href={`mailto:${partie.avocat.email}`} className="text-[#2563EB] hover:underline flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {partie.avocat.email}
                  </a>
                )}
                {partie.avocat.telephone && (
                  <a href={`tel:${partie.avocat.telephone}`} className="text-[#2563EB] hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {partie.avocat.telephone}
                  </a>
                )}
              </div>
              {partie.avocat.adresse && (
                <p className="text-xs text-[#a3a3a3] mt-1">{partie.avocat.adresse}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" size="sm" icon={Edit} onClick={() => onEdit(partie)}>
              Modifier
            </Button>
            <Button variant="secondary" size="sm" icon={Mail} onClick={() => onContact(partie, 'email')}>
              Email
            </Button>
            <Button variant="danger" size="sm" icon={Trash2} onClick={() => onDelete(partie)} className="ml-auto">
              Supprimer
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// COMPOSANT: Modal formulaire partie
// ============================================================================

const ModalPartieForm = ({ isOpen, onClose, partie, sapiteurs, onSave }) => {
  const isEdit = !!partie;
  const [loading, setLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [searchImport, setSearchImport] = useState('');

  const [formData, setFormData] = useState({
    qualite: partie?.qualite || 'demandeur',
    type_personne: partie?.type_personne || 'physique',
    // Personne physique
    civilite: partie?.civilite || '',
    nom: partie?.nom || '',
    prenom: partie?.prenom || '',
    // Personne morale
    raison_sociale: partie?.raison_sociale || '',
    siret: partie?.siret || '',
    representant_legal: partie?.representant_legal || '',
    // Commun
    role: partie?.role || '',
    represente_par: partie?.represente_par || '',
    email: partie?.email || '',
    telephone: partie?.telephone || '',
    adresse: partie?.adresse || '',
    code_postal: partie?.code_postal || '',
    ville: partie?.ville || '',
    // Avocat
    avocat: {
      nom: partie?.avocat?.nom || '',
      cabinet: partie?.avocat?.cabinet || '',
      email: partie?.avocat?.email || '',
      telephone: partie?.avocat?.telephone || '',
      adresse: partie?.avocat?.adresse || ''
    }
  });

  const handleChange = (field, value) => {
    if (field.startsWith('avocat.')) {
      const avocatField = field.replace('avocat.', '');
      setFormData(prev => ({
        ...prev,
        avocat: { ...prev.avocat, [avocatField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Import depuis carnet d'adresses
  const handleImport = (sapiteur) => {
    setFormData(prev => ({
      ...prev,
      type_personne: sapiteur.type === 'entreprise' ? 'morale' : 'physique',
      nom: sapiteur.nom || '',
      prenom: sapiteur.prenom || '',
      raison_sociale: sapiteur.entreprise || '',
      email: sapiteur.email || '',
      telephone: sapiteur.telephone || '',
      adresse: sapiteur.adresse || '',
      code_postal: sapiteur.code_postal || '',
      ville: sapiteur.ville || '',
      role: sapiteur.specialite || ''
    }));
    setShowImport(false);
  };

  const filteredSapiteurs = useMemo(() => {
    if (!sapiteurs || !searchImport) return sapiteurs || [];
    const search = searchImport.toLowerCase();
    return sapiteurs.filter(s =>
      s.nom?.toLowerCase().includes(search) ||
      s.entreprise?.toLowerCase().includes(search) ||
      s.specialite?.toLowerCase().includes(search)
    );
  }, [sapiteurs, searchImport]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        id: partie?.id || `partie-${Date.now()}`,
        ...formData,
        created_at: partie?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPersonneMorale = formData.type_personne === 'morale';

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Modifier la partie' : 'Ajouter une partie'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Import depuis carnet */}
        {!isEdit && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              icon={BookUser}
              onClick={() => setShowImport(!showImport)}
              className="flex-1"
            >
              {showImport ? 'Masquer carnet' : 'Importer depuis carnet d\'adresses'}
            </Button>
          </div>
        )}

        {/* Sélecteur import */}
        {showImport && (
          <div className="bg-[#f9fafb] rounded-xl p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
              <input
                type="text"
                value={searchImport}
                onChange={(e) => setSearchImport(e.target.value)}
                placeholder="Rechercher dans le carnet..."
                className="w-full pl-10 pr-4 py-2 border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredSapiteurs.length > 0 ? (
                filteredSapiteurs.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleImport(s)}
                    className="w-full p-3 text-left hover:bg-white rounded-lg transition-colors"
                  >
                    <p className="font-medium text-[#1a1a1a]">{s.entreprise || `${s.prenom} ${s.nom}`}</p>
                    <p className="text-sm text-[#737373]">{s.specialite}</p>
                  </button>
                ))
              ) : (
                <p className="text-center text-[#a3a3a3] py-4">Aucun contact trouvé</p>
              )}
            </div>
          </div>
        )}

        {/* Qualité et Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#737373] mb-2">
              Qualité procédurale *
            </label>
            <select
              value={formData.qualite}
              onChange={(e) => handleChange('qualite', e.target.value)}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              required
            >
              {QUALITES_PARTIE.map(q => (
                <option key={q.value} value={q.value}>{q.label} - {q.description}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#737373] mb-2">
              Type de personne *
            </label>
            <div className="flex gap-2">
              {TYPES_PERSONNE.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleChange('type_personne', t.value)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${
                      formData.type_personne === t.value
                        ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                        : 'border-[#e5e5e5] hover:border-[#2563EB]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Identité */}
        {isPersonneMorale ? (
          <div className="space-y-4">
            <Input
              label="Raison sociale *"
              value={formData.raison_sociale}
              onChange={(e) => handleChange('raison_sociale', e.target.value)}
              placeholder="Nom de la société"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="SIRET"
                value={formData.siret}
                onChange={(e) => handleChange('siret', e.target.value)}
                placeholder="123 456 789 00001"
              />
              <Input
                label="Représentant légal"
                value={formData.representant_legal}
                onChange={(e) => handleChange('representant_legal', e.target.value)}
                placeholder="M. Jean Dupont, Gérant"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            <Select
              label="Civilité"
              value={formData.civilite}
              onChange={(e) => handleChange('civilite', e.target.value)}
              options={[
                { value: '', label: '-' },
                { value: 'M.', label: 'M.' },
                { value: 'Mme', label: 'Mme' },
                { value: 'Mlle', label: 'Mlle' }
              ]}
            />
            <Input
              label="Nom *"
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              placeholder="Dupont"
              required
              className="col-span-2"
            />
            <Input
              label="Prénom"
              value={formData.prenom}
              onChange={(e) => handleChange('prenom', e.target.value)}
              placeholder="Jean"
            />
          </div>
        )}

        {/* Rôle */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#737373] mb-2">
              Rôle / Qualité technique
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
            >
              <option value="">Sélectionner un rôle...</option>
              {ROLES_PARTIE.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <Input
            label="Représenté par (mandataire)"
            value={formData.represente_par}
            onChange={(e) => handleChange('represente_par', e.target.value)}
            placeholder="Ex: Syndic FONCIA, Cabinet de gestion..."
          />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="contact@exemple.fr"
          />
          <Input
            label="Téléphone"
            type="tel"
            value={formData.telephone}
            onChange={(e) => handleChange('telephone', e.target.value)}
            placeholder="01 23 45 67 89"
          />
        </div>

        {/* Adresse */}
        <div className="space-y-4">
          <Input
            label="Adresse"
            value={formData.adresse}
            onChange={(e) => handleChange('adresse', e.target.value)}
            placeholder="123 rue de Paris"
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Code postal"
              value={formData.code_postal}
              onChange={(e) => handleChange('code_postal', e.target.value)}
              placeholder="75001"
            />
            <Input
              label="Ville"
              value={formData.ville}
              onChange={(e) => handleChange('ville', e.target.value)}
              placeholder="Paris"
              className="col-span-2"
            />
          </div>
        </div>

        {/* Section Avocat */}
        <div className="border-t border-[#e5e5e5] pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-[#2563EB]" />
            <h4 className="text-sm font-medium text-[#1a1a1a]">Avocat (optionnel)</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nom de l'avocat"
              value={formData.avocat.nom}
              onChange={(e) => handleChange('avocat.nom', e.target.value)}
              placeholder="Me Durand"
            />
            <Input
              label="Cabinet"
              value={formData.avocat.cabinet}
              onChange={(e) => handleChange('avocat.cabinet', e.target.value)}
              placeholder="Cabinet Durand & Associés"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Input
              label="Email avocat"
              type="email"
              value={formData.avocat.email}
              onChange={(e) => handleChange('avocat.email', e.target.value)}
              placeholder="avocat@cabinet.fr"
            />
            <Input
              label="Téléphone avocat"
              type="tel"
              value={formData.avocat.telephone}
              onChange={(e) => handleChange('avocat.telephone', e.target.value)}
              placeholder="01 23 45 67 89"
            />
          </div>

          <Input
            label="Adresse cabinet"
            value={formData.avocat.adresse}
            onChange={(e) => handleChange('avocat.adresse', e.target.value)}
            placeholder="10 avenue de l'Opéra, 75001 Paris"
            className="mt-4"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" type="button" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button variant="primary" type="submit" loading={loading} className="flex-1">
            {isEdit ? 'Enregistrer' : 'Ajouter la partie'}
          </Button>
        </div>
      </form>
    </ModalBase>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL: GestionParties
// ============================================================================

export const GestionParties = ({ affaire, onUpdate, sapiteurs = [] }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPartie, setEditingPartie] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQualite, setFilterQualite] = useState('tous');
  const toast = useToast();

  const parties = affaire.parties || [];

  // Parties filtrées
  const partiesFiltrees = useMemo(() => {
    return parties.filter(p => {
      // Recherche
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const nom = (p.raison_sociale || `${p.prenom} ${p.nom}`).toLowerCase();
        if (!nom.includes(search) &&
            !p.role?.toLowerCase().includes(search) &&
            !p.avocat?.nom?.toLowerCase().includes(search)) {
          return false;
        }
      }
      // Filtre qualité
      if (filterQualite !== 'tous' && p.qualite !== filterQualite) {
        return false;
      }
      return true;
    });
  }, [parties, searchQuery, filterQualite]);

  // Grouper par qualité
  const partiesParQualite = useMemo(() => {
    const grouped = {};
    QUALITES_PARTIE.forEach(q => {
      grouped[q.value] = partiesFiltrees.filter(p => p.qualite === q.value);
    });
    return grouped;
  }, [partiesFiltrees]);

  // Statistiques
  const stats = useMemo(() => ({
    total: parties.length,
    demandeurs: parties.filter(p => p.qualite === 'demandeur').length,
    defendeurs: parties.filter(p => p.qualite === 'defendeur' || p.qualite === 'appele_cause').length,
    avocats: parties.filter(p => p.avocat?.nom).length
  }), [parties]);

  // Sauvegarder une partie
  const handleSavePartie = async (partieData) => {
    const isEdit = parties.some(p => p.id === partieData.id);
    let updatedParties;

    if (isEdit) {
      updatedParties = parties.map(p => p.id === partieData.id ? partieData : p);
    } else {
      updatedParties = [...parties, partieData];
    }

    await onUpdate({ parties: updatedParties });
    toast.success(isEdit ? 'Partie modifiée' : 'Partie ajoutée');
    setShowAddModal(false);
    setEditingPartie(null);
  };

  // Supprimer une partie
  const handleDelete = async (partie) => {
    if (!window.confirm(`Supprimer ${partie.raison_sociale || `${partie.prenom} ${partie.nom}`} ?`)) return;

    const updatedParties = parties.filter(p => p.id !== partie.id);
    await onUpdate({ parties: updatedParties });
    toast.success('Partie supprimée');
  };

  // Contact
  const handleContact = (partie, type) => {
    if (type === 'email' && partie.email) {
      window.location.href = `mailto:${partie.email}`;
    } else if (type === 'phone' && partie.telephone) {
      window.location.href = `tel:${partie.telephone}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#1a1a1a]">Parties au dossier</h2>
          <p className="text-sm text-[#737373]">
            {stats.total} partie{stats.total > 1 ? 's' : ''} ·
            {stats.demandeurs} demandeur{stats.demandeurs > 1 ? 's' : ''} ·
            {stats.defendeurs} défendeur{stats.defendeurs > 1 ? 's' : ''} ·
            {stats.avocats} avec avocat
          </p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={() => setShowAddModal(true)}>
          Ajouter une partie
        </Button>
      </div>

      {/* Alerte si aucune partie */}
      {parties.length === 0 && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Aucune partie enregistrée</p>
              <p className="text-sm text-amber-700 mt-1">
                Ajoutez les parties (demandeurs, défendeurs) pour pouvoir générer les convocations
                et gérer le contradictoire.
              </p>
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                className="mt-3"
                onClick={() => setShowAddModal(true)}
              >
                Ajouter la première partie
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filtres */}
      {parties.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une partie..."
                className="w-full pl-10 pr-4 py-2 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <select
              value={filterQualite}
              onChange={(e) => setFilterQualite(e.target.value)}
              className="px-4 py-2 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#2563EB]"
            >
              <option value="tous">Toutes les qualités</option>
              {QUALITES_PARTIE.map(q => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {/* Liste par qualité */}
      {Object.entries(partiesParQualite).map(([qualite, liste]) => {
        if (liste.length === 0) return null;
        const qualiteInfo = QUALITES_PARTIE.find(q => q.value === qualite);

        return (
          <div key={qualite} className="space-y-3">
            <h3 className="text-sm font-medium text-[#737373] flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full bg-${qualiteInfo?.color || 'gray'}-500`}></span>
              {qualiteInfo?.label || qualite} ({liste.length})
            </h3>
            <div className="grid gap-3">
              {liste.map(partie => (
                <PartieCard
                  key={partie.id}
                  partie={partie}
                  expanded={expandedId === partie.id}
                  onToggle={() => setExpandedId(expandedId === partie.id ? null : partie.id)}
                  onEdit={() => setEditingPartie(partie)}
                  onDelete={() => handleDelete(partie)}
                  onContact={(p, type) => handleContact(p, type)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Résumé pour rapport */}
      {parties.length > 0 && (
        <Card className="p-4 bg-[#f9fafb]">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-[#2563EB]" />
            <h4 className="text-sm font-medium text-[#1a1a1a]">Résumé pour rapport</h4>
          </div>
          <div className="text-sm text-[#737373] space-y-1">
            {QUALITES_PARTIE.map(q => {
              const liste = parties.filter(p => p.qualite === q.value);
              if (liste.length === 0) return null;
              return (
                <p key={q.value}>
                  <span className="font-medium">{q.label}{liste.length > 1 ? 's' : ''}:</span>{' '}
                  {liste.map(p => p.raison_sociale || `${p.civilite || ''} ${p.prenom || ''} ${p.nom}`.trim()).join(', ')}
                </p>
              );
            })}
          </div>
        </Card>
      )}

      {/* Modal Ajout */}
      {showAddModal && (
        <ModalPartieForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          partie={null}
          sapiteurs={sapiteurs}
          onSave={handleSavePartie}
        />
      )}

      {/* Modal Édition */}
      {editingPartie && (
        <ModalPartieForm
          isOpen={!!editingPartie}
          onClose={() => setEditingPartie(null)}
          partie={editingPartie}
          sapiteurs={sapiteurs}
          onSave={handleSavePartie}
        />
      )}
    </div>
  );
};

export default GestionParties;
