// ============================================================================
// CRM EXPERT JUDICIAIRE - PAGE PARAMÈTRES
// Configuration complète du profil expert et de l'application
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings, User, Building, Euro, Bell, Shield, Palette,
  Save, Edit, Check, X, Camera, Mail, Phone, MapPin,
  Briefcase, Award, FileText, Clock, Calculator, Globe,
  Key, Lock, Eye, EyeOff, AlertTriangle, CheckCircle,
  HelpCircle, Download, Upload, Trash2, RefreshCw,
  Layout, GripVertical, Plus, Type, AlignLeft, Columns,
  LayoutDashboard, List, FolderOpen, ChevronUp, ChevronDown,
  Copy, MoreHorizontal, Sparkles
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase, useToast } from '../ui';

// ============================================================================
// DONNÉES PAR DÉFAUT
// ============================================================================

const DEFAULT_EXPERT_PROFILE = {
  // Identité
  civilite: 'M.',
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  telephoneMobile: '',

  // Adresse cabinet
  adresseCabinet: '',
  codePostal: '',
  ville: '',

  // Informations professionnelles
  numeroExpert: '',
  coursAppel: '',
  specialites: [],
  dateInscription: '',
  siret: '',
  tvaIntracommunautaire: '',

  // Assurance
  assureurRC: '',
  numeroPolice: '',
  dateValidite: '',

  // Coordonnées bancaires
  iban: '',
  bic: '',
  titulaire: ''
};

const DEFAULT_TARIFS = {
  tauxExpertise: 90,
  tauxEtude: 80,
  tauxRedaction: 80,
  tauxDeplacement: 50,
  indemnitesKm: 0.60,
  tva: 20
};

const DEFAULT_PREFERENCES = {
  notificationsEmail: true,
  notificationsPush: true,
  rappelEcheance: 7,
  sauvegardeAuto: true,
  theme: 'clair',
  formatDate: 'DD/MM/YYYY',
  langueInterface: 'fr'
};

// Modèles de documents par défaut
const DEFAULT_MODELES = {
  enTete: {
    afficherLogo: true,
    format: 'classique', // 'classique', 'moderne', 'minimal'
    alignement: 'gauche' // 'gauche', 'centre', 'droite'
  },
  piedPage: {
    mentionsLegales: 'Expert judiciaire inscrit sur la liste de la Cour d\'appel',
    afficherCoordonnees: true,
    afficherSiret: true
  },
  paragraphesTypes: [
    { id: 'intro-convocation', titre: 'Introduction convocation', type: 'convocation', contenu: 'En ma qualité d\'expert judiciaire désigné par ordonnance, j\'ai l\'honneur de vous convoquer à :' },
    { id: 'intro-rapport', titre: 'Introduction rapport', type: 'rapport', contenu: 'En exécution de la mission qui nous a été confiée par ordonnance de référé, nous avons procédé aux opérations d\'expertise contradictoires.' },
    { id: 'conclusion-rapport', titre: 'Conclusion rapport', type: 'rapport', contenu: 'Au terme de nos investigations et après avoir recueilli les observations des parties, nous estimons être en mesure de répondre aux questions posées par le tribunal.' },
    { id: 'politesse-juge', titre: 'Formule - Juge', type: 'politesse', contenu: 'Je vous prie d\'agréer, Monsieur/Madame le Juge, l\'expression de ma haute considération.' },
    { id: 'politesse-avocat', titre: 'Formule - Avocat', type: 'politesse', contenu: 'Je vous prie d\'agréer, Maître, l\'expression de mes salutations distinguées.' },
    { id: 'politesse-partie', titre: 'Formule - Partie', type: 'politesse', contenu: 'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.' }
  ],
  clausesStandards: [
    { id: 'delai-dire', titre: 'Délai pour les dires', contenu: 'Conformément aux dispositions de l\'article 276 du Code de procédure civile, les parties disposent d\'un délai de 30 jours pour formuler leurs observations.' },
    { id: 'confidentialite', titre: 'Confidentialité', contenu: 'Le présent rapport est établi exclusivement pour les besoins de l\'expertise judiciaire et ne peut être communiqué à des tiers sans l\'autorisation du tribunal.' },
    { id: 'reserve-technique', titre: 'Réserve technique', contenu: 'Les conclusions du présent rapport sont établies sous réserve d\'investigations complémentaires qui pourraient s\'avérer nécessaires.' }
  ]
};

// Personnalisation interface par défaut
const DEFAULT_INTERFACE = {
  sidebar: {
    ordre: ['dashboard', 'affaires', 'alertes', 'calendrier', 'carnet', 'facturation', 'statistiques', 'parametres'],
    modulesVisibles: ['dashboard', 'affaires', 'alertes', 'calendrier', 'carnet', 'facturation', 'statistiques', 'parametres']
  },
  dashboard: {
    widgets: [
      { id: 'stats', visible: true, ordre: 1 },
      { id: 'alertes', visible: true, ordre: 2 },
      { id: 'calendrier', visible: true, ordre: 3 },
      { id: 'affaires-recentes', visible: true, ordre: 4 }
    ]
  },
  listeAffaires: {
    colonnes: ['reference', 'tribunal', 'parties', 'etape', 'echeance', 'statut'],
    colonnesDisponibles: ['reference', 'tribunal', 'parties', 'etape', 'echeance', 'statut', 'ville', 'provision', 'date_creation']
  },
  ficheAffaire: {
    onglets: ['general', 'parties', 'reunions', 'documents', 'workflow', 'finances', 'outils'],
    ongletsVisibles: ['general', 'parties', 'reunions', 'documents', 'workflow', 'finances', 'outils']
  },
  densite: 'normal' // 'compact', 'normal', 'aere'
};

const SPECIALITES_OPTIONS = [
  'Bâtiment',
  'Génie civil',
  'Construction',
  'Pathologies du bâtiment',
  'Infiltrations et étanchéité',
  'Structures',
  'VRD',
  'Électricité',
  'Plomberie',
  'Chauffage climatisation',
  'Acoustique',
  'Thermique',
  'Incendie',
  'Ascenseurs'
];

const COURS_APPEL_OPTIONS = [
  'CA Paris',
  'CA Versailles',
  'CA Lyon',
  'CA Marseille',
  'CA Bordeaux',
  'CA Toulouse',
  'CA Lille',
  'CA Rennes',
  'CA Nantes',
  'CA Montpellier',
  'CA Aix-en-Provence',
  'CA Douai',
  'CA Rouen',
  'CA Grenoble',
  'CA Nancy'
];

// ============================================================================
// COMPOSANT: Section de formulaire
// ============================================================================

const FormSection = ({ title, icon: Icon, children, description }) => (
  <Card className="p-6">
    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#e5e5e5]">
      <div className="w-10 h-10 bg-[#f5e6c8] rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#c9a227]" />
      </div>
      <div>
        <h3 className="font-medium text-[#1a1a1a]">{title}</h3>
        {description && <p className="text-xs text-[#737373]">{description}</p>}
      </div>
    </div>
    {children}
  </Card>
);

// ============================================================================
// COMPOSANT: Champ de formulaire
// ============================================================================

const FormField = ({ label, required, help, children }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-[#525252]">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {help && <p className="text-xs text-[#a3a3a3]">{help}</p>}
  </div>
);

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const PageParametres = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profil');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Password fields
  const [passwords, setPasswords] = useState({
    current: '',
    newPassword: '',
    confirm: ''
  });

  // États des données
  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem('expert_profile');
    return stored ? JSON.parse(stored) : DEFAULT_EXPERT_PROFILE;
  });

  const [tarifs, setTarifs] = useState(() => {
    const stored = localStorage.getItem('expert_tarifs');
    return stored ? JSON.parse(stored) : DEFAULT_TARIFS;
  });

  const [preferences, setPreferences] = useState(() => {
    const stored = localStorage.getItem('expert_preferences');
    return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
  });

  const [modeles, setModeles] = useState(() => {
    const stored = localStorage.getItem('expert_modeles');
    return stored ? JSON.parse(stored) : DEFAULT_MODELES;
  });

  const [interfaceConfig, setInterfaceConfig] = useState(() => {
    const stored = localStorage.getItem('expert_interface');
    return stored ? JSON.parse(stored) : DEFAULT_INTERFACE;
  });

  // Modal pour édition paragraphe/clause
  const [editingParagraphe, setEditingParagraphe] = useState(null);
  const [editingClause, setEditingClause] = useState(null);

  // Sauvegarder
  const handleSave = () => {
    localStorage.setItem('expert_profile', JSON.stringify(profile));
    localStorage.setItem('expert_tarifs', JSON.stringify(tarifs));
    localStorage.setItem('expert_preferences', JSON.stringify(preferences));
    localStorage.setItem('expert_modeles', JSON.stringify(modeles));
    localStorage.setItem('expert_interface', JSON.stringify(interfaceConfig));
    setSaved(true);
    setEditing(false);
    toast.success('Paramètres enregistrés', 'Vos modifications ont été sauvegardées');
    setTimeout(() => setSaved(false), 3000);
  };

  // Gestion des paragraphes types
  const handleAddParagraphe = () => {
    const newParagraphe = {
      id: `para-${Date.now()}`,
      titre: 'Nouveau paragraphe',
      type: 'rapport',
      contenu: ''
    };
    setModeles({
      ...modeles,
      paragraphesTypes: [...modeles.paragraphesTypes, newParagraphe]
    });
    setEditingParagraphe(newParagraphe);
  };

  const handleSaveParagraphe = () => {
    if (!editingParagraphe) return;
    const updated = modeles.paragraphesTypes.map(p =>
      p.id === editingParagraphe.id ? editingParagraphe : p
    );
    // Si c'est un nouveau paragraphe, il est déjà dans la liste
    if (!modeles.paragraphesTypes.find(p => p.id === editingParagraphe.id)) {
      updated.push(editingParagraphe);
    }
    setModeles({ ...modeles, paragraphesTypes: updated });
    setEditingParagraphe(null);
    toast.success('Paragraphe enregistré');
  };

  const handleDeleteParagraphe = (id) => {
    setModeles({
      ...modeles,
      paragraphesTypes: modeles.paragraphesTypes.filter(p => p.id !== id)
    });
    toast.success('Paragraphe supprimé');
  };

  // Gestion des clauses
  const handleAddClause = () => {
    const newClause = {
      id: `clause-${Date.now()}`,
      titre: 'Nouvelle clause',
      contenu: ''
    };
    setModeles({
      ...modeles,
      clausesStandards: [...modeles.clausesStandards, newClause]
    });
    setEditingClause(newClause);
  };

  const handleSaveClause = () => {
    if (!editingClause) return;
    const updated = modeles.clausesStandards.map(c =>
      c.id === editingClause.id ? editingClause : c
    );
    if (!modeles.clausesStandards.find(c => c.id === editingClause.id)) {
      updated.push(editingClause);
    }
    setModeles({ ...modeles, clausesStandards: updated });
    setEditingClause(null);
    toast.success('Clause enregistrée');
  };

  const handleDeleteClause = (id) => {
    setModeles({
      ...modeles,
      clausesStandards: modeles.clausesStandards.filter(c => c.id !== id)
    });
    toast.success('Clause supprimée');
  };

  // Copier dans le presse-papier
  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié !', 'Texte copié dans le presse-papier');
  };

  // Réorganiser les modules (move up/down)
  const moveModule = (index, direction) => {
    const ordre = [...interfaceConfig.sidebar.ordre];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= ordre.length) return;
    [ordre[index], ordre[newIndex]] = [ordre[newIndex], ordre[index]];
    setInterfaceConfig({
      ...interfaceConfig,
      sidebar: { ...interfaceConfig.sidebar, ordre }
    });
  };

  // Toggle visibilité module
  const toggleModuleVisibility = (moduleId) => {
    const visibles = [...interfaceConfig.sidebar.modulesVisibles];
    if (visibles.includes(moduleId)) {
      setInterfaceConfig({
        ...interfaceConfig,
        sidebar: {
          ...interfaceConfig.sidebar,
          modulesVisibles: visibles.filter(m => m !== moduleId)
        }
      });
    } else {
      setInterfaceConfig({
        ...interfaceConfig,
        sidebar: {
          ...interfaceConfig.sidebar,
          modulesVisibles: [...visibles, moduleId]
        }
      });
    }
  };

  // Exporter les données
  const handleExport = () => {
    const data = {
      profile,
      tarifs,
      preferences,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parametres-expert-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Export réussi', 'Vos paramètres ont été exportés');
  };

  // Modifier le mot de passe
  const handleChangePassword = () => {
    if (!passwords.current) {
      toast.error('Erreur', 'Veuillez saisir votre mot de passe actuel');
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error('Erreur', 'Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      toast.error('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    // Simuler le changement (en mode démo)
    toast.success('Mot de passe modifié', 'Votre mot de passe a été mis à jour avec succès');
    setShowPasswordModal(false);
    setPasswords({ current: '', newPassword: '', confirm: '' });
  };

  // Supprimer le compte
  const handleDeleteAccount = () => {
    // Effacer toutes les données localStorage
    const keysToKeep = []; // Ajouter des clés à conserver si nécessaire
    Object.keys(localStorage).forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    toast.success('Compte supprimé', 'Toutes vos données ont été effacées');
    setShowDeleteModal(false);
    // Rediriger vers l'accueil
    window.location.href = '/';
  };

  // Calculer la complétion du profil
  const profileCompletion = (() => {
    const requiredFields = ['nom', 'prenom', 'email', 'telephone', 'adresseCabinet', 'ville', 'numeroExpert'];
    const filled = requiredFields.filter(f => profile[f]?.trim()).length;
    return Math.round((filled / requiredFields.length) * 100);
  })();

  const tabs = [
    { id: 'profil', label: 'Profil', icon: User },
    { id: 'tarifs', label: 'Tarifs', icon: Euro },
    { id: 'modeles', label: 'Modèles', icon: FileText },
    { id: 'interface', label: 'Interface', icon: Layout },
    { id: 'preferences', label: 'Préférences', icon: Bell },
    { id: 'securite', label: 'Sécurité', icon: Shield }
  ];

  // Labels des modules pour l'affichage
  const moduleLabels = {
    dashboard: 'Tableau de bord',
    affaires: 'Affaires',
    alertes: 'Alertes',
    calendrier: 'Calendrier',
    carnet: 'Carnet d\'adresses',
    facturation: 'Facturation',
    statistiques: 'Statistiques',
    parametres: 'Paramètres'
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-[#1a1a1a]">Paramètres</h1>
          <p className="text-sm text-[#737373]">Configuration de votre profil et de l'application</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Enregistré
            </Badge>
          )}
          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Exporter
          </Button>
          <Button variant="primary" icon={Save} onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Alerte complétion profil */}
      {profileCompletion < 100 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                Profil incomplet ({profileCompletion}%)
              </p>
              <p className="text-xs text-amber-600">
                Complétez votre profil pour bénéficier de toutes les fonctionnalités
              </p>
            </div>
            <div className="w-32 h-2 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Navigation par onglets */}
      <div className="flex gap-2 border-b border-[#e5e5e5]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#c9a227] text-[#c9a227]'
                : 'border-transparent text-[#737373] hover:text-[#1a1a1a]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'profil' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Identité */}
          <FormSection title="Identité" icon={User} description="Vos informations personnelles">
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Civilité">
                <select
                  value={profile.civilite}
                  onChange={(e) => setProfile({...profile, civilite: e.target.value})}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#c9a227]"
                >
                  <option value="M.">M.</option>
                  <option value="Mme">Mme</option>
                </select>
              </FormField>
              <FormField label="Nom" required>
                <Input
                  value={profile.nom}
                  onChange={(e) => setProfile({...profile, nom: e.target.value})}
                  placeholder="DUPONT"
                />
              </FormField>
              <FormField label="Prénom" required>
                <Input
                  value={profile.prenom}
                  onChange={(e) => setProfile({...profile, prenom: e.target.value})}
                  placeholder="Jean"
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <FormField label="Email" required>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  placeholder="expert@cabinet.fr"
                  icon={Mail}
                />
              </FormField>
              <FormField label="Téléphone" required>
                <Input
                  value={profile.telephone}
                  onChange={(e) => setProfile({...profile, telephone: e.target.value})}
                  placeholder="01 23 45 67 89"
                  icon={Phone}
                />
              </FormField>
            </div>
            <div className="mt-4">
              <FormField label="Mobile">
                <Input
                  value={profile.telephoneMobile}
                  onChange={(e) => setProfile({...profile, telephoneMobile: e.target.value})}
                  placeholder="06 12 34 56 78"
                  icon={Phone}
                />
              </FormField>
            </div>
          </FormSection>

          {/* Adresse cabinet */}
          <FormSection title="Adresse du cabinet" icon={Building} description="Adresse professionnelle">
            <div className="space-y-4">
              <FormField label="Adresse" required>
                <Input
                  value={profile.adresseCabinet}
                  onChange={(e) => setProfile({...profile, adresseCabinet: e.target.value})}
                  placeholder="123 rue de l'Expertise"
                  icon={MapPin}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Code postal">
                  <Input
                    value={profile.codePostal}
                    onChange={(e) => setProfile({...profile, codePostal: e.target.value})}
                    placeholder="75001"
                  />
                </FormField>
                <FormField label="Ville" required>
                  <Input
                    value={profile.ville}
                    onChange={(e) => setProfile({...profile, ville: e.target.value})}
                    placeholder="Paris"
                  />
                </FormField>
              </div>
            </div>
          </FormSection>

          {/* Informations professionnelles */}
          <FormSection title="Informations professionnelles" icon={Briefcase} description="Votre inscription et compétences">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="N° Expert" required help="Votre numéro d'inscription">
                  <Input
                    value={profile.numeroExpert}
                    onChange={(e) => setProfile({...profile, numeroExpert: e.target.value})}
                    placeholder="EXP-2024-001"
                  />
                </FormField>
                <FormField label="Cour d'appel">
                  <select
                    value={profile.coursAppel}
                    onChange={(e) => setProfile({...profile, coursAppel: e.target.value})}
                    className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#c9a227]"
                  >
                    <option value="">Sélectionner...</option>
                    {COURS_APPEL_OPTIONS.map(ca => (
                      <option key={ca} value={ca}>{ca}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Spécialités">
                <div className="flex flex-wrap gap-2 p-3 border border-[#e5e5e5] rounded-lg bg-[#fafafa]">
                  {SPECIALITES_OPTIONS.map(spec => (
                    <button
                      key={spec}
                      onClick={() => {
                        const current = profile.specialites || [];
                        setProfile({
                          ...profile,
                          specialites: current.includes(spec)
                            ? current.filter(s => s !== spec)
                            : [...current, spec]
                        });
                      }}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        (profile.specialites || []).includes(spec)
                          ? 'bg-[#c9a227] text-white'
                          : 'bg-white border border-[#e5e5e5] text-[#737373] hover:border-[#c9a227]'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="SIRET">
                  <Input
                    value={profile.siret}
                    onChange={(e) => setProfile({...profile, siret: e.target.value})}
                    placeholder="123 456 789 00012"
                  />
                </FormField>
                <FormField label="TVA Intracommunautaire">
                  <Input
                    value={profile.tvaIntracommunautaire}
                    onChange={(e) => setProfile({...profile, tvaIntracommunautaire: e.target.value})}
                    placeholder="FR12345678901"
                  />
                </FormField>
              </div>
            </div>
          </FormSection>

          {/* Assurance RC Pro */}
          <FormSection title="Assurance RC Professionnelle" icon={Shield} description="Obligatoire pour exercer">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Assureur">
                  <Input
                    value={profile.assureurRC}
                    onChange={(e) => setProfile({...profile, assureurRC: e.target.value})}
                    placeholder="AXA, MAIF, etc."
                  />
                </FormField>
                <FormField label="N° de police">
                  <Input
                    value={profile.numeroPolice}
                    onChange={(e) => setProfile({...profile, numeroPolice: e.target.value})}
                    placeholder="POL-123456"
                  />
                </FormField>
              </div>
              <FormField label="Date de validité">
                <Input
                  type="date"
                  value={profile.dateValidite}
                  onChange={(e) => setProfile({...profile, dateValidite: e.target.value})}
                />
              </FormField>
            </div>
          </FormSection>

          {/* Coordonnées bancaires */}
          <FormSection title="Coordonnées bancaires" icon={Euro} description="Pour le versement de vos honoraires">
            <div className="space-y-4">
              <FormField label="IBAN">
                <Input
                  value={profile.iban}
                  onChange={(e) => setProfile({...profile, iban: e.target.value})}
                  placeholder="FR76 1234 5678 9012 3456 7890 123"
                />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="BIC">
                  <Input
                    value={profile.bic}
                    onChange={(e) => setProfile({...profile, bic: e.target.value})}
                    placeholder="BNPAFRPP"
                  />
                </FormField>
                <FormField label="Titulaire du compte">
                  <Input
                    value={profile.titulaire}
                    onChange={(e) => setProfile({...profile, titulaire: e.target.value})}
                    placeholder="M. Jean DUPONT"
                  />
                </FormField>
              </div>
            </div>
          </FormSection>
        </div>
      )}

      {activeTab === 'tarifs' && (
        <div className="grid grid-cols-2 gap-6">
          <FormSection title="Taux horaires" icon={Clock} description="Vos tarifs de vacation">
            <div className="space-y-4">
              <FormField label="Vacation d'expertise (réunion, visite)" help="€/heure">
                <Input
                  type="number"
                  value={tarifs.tauxExpertise}
                  onChange={(e) => setTarifs({...tarifs, tauxExpertise: parseFloat(e.target.value)})}
                  icon={Euro}
                />
              </FormField>
              <FormField label="Étude de dossier" help="€/heure">
                <Input
                  type="number"
                  value={tarifs.tauxEtude}
                  onChange={(e) => setTarifs({...tarifs, tauxEtude: parseFloat(e.target.value)})}
                  icon={Euro}
                />
              </FormField>
              <FormField label="Rédaction (CR, notes, rapport)" help="€/heure">
                <Input
                  type="number"
                  value={tarifs.tauxRedaction}
                  onChange={(e) => setTarifs({...tarifs, tauxRedaction: parseFloat(e.target.value)})}
                  icon={Euro}
                />
              </FormField>
              <FormField label="Temps de déplacement" help="€/heure">
                <Input
                  type="number"
                  value={tarifs.tauxDeplacement}
                  onChange={(e) => setTarifs({...tarifs, tauxDeplacement: parseFloat(e.target.value)})}
                  icon={Euro}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Frais & TVA" icon={Calculator} description="Indemnités et taxes">
            <div className="space-y-4">
              <FormField label="Indemnités kilométriques" help="€/km">
                <Input
                  type="number"
                  step="0.01"
                  value={tarifs.indemnitesKm}
                  onChange={(e) => setTarifs({...tarifs, indemnitesKm: parseFloat(e.target.value)})}
                  icon={Euro}
                />
              </FormField>
              <FormField label="Taux de TVA" help="%">
                <select
                  value={tarifs.tva}
                  onChange={(e) => setTarifs({...tarifs, tva: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#c9a227]"
                >
                  <option value="0">Non assujetti (0%)</option>
                  <option value="10">Taux réduit (10%)</option>
                  <option value="20">Taux normal (20%)</option>
                </select>
              </FormField>
            </div>

            {/* Récapitulatif */}
            <div className="mt-6 p-4 bg-[#faf8f3] rounded-xl">
              <h4 className="text-sm font-medium text-[#1a1a1a] mb-3">Récapitulatif de vos tarifs</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#737373]">Expertise</span>
                  <span className="font-medium">{tarifs.tauxExpertise} €/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Étude</span>
                  <span className="font-medium">{tarifs.tauxEtude} €/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Rédaction</span>
                  <span className="font-medium">{tarifs.tauxRedaction} €/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Déplacement</span>
                  <span className="font-medium">{tarifs.tauxDeplacement} €/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Km</span>
                  <span className="font-medium">{tarifs.indemnitesKm} €/km</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#e5e5e5]">
                  <span className="text-[#737373]">TVA applicable</span>
                  <span className="font-medium">{tarifs.tva}%</span>
                </div>
              </div>
            </div>
          </FormSection>
        </div>
      )}

      {/* ONGLET MODÈLES */}
      {activeTab === 'modeles' && (
        <div className="space-y-6">
          {/* En-tête et pied de page */}
          <div className="grid grid-cols-2 gap-6">
            <FormSection title="En-tête des documents" icon={AlignLeft} description="Personnalisez l'en-tête de vos courriers">
              <div className="space-y-4">
                <FormField label="Format d'en-tête">
                  <div className="flex gap-3">
                    {['classique', 'moderne', 'minimal'].map(format => (
                      <button
                        key={format}
                        onClick={() => setModeles({
                          ...modeles,
                          enTete: { ...modeles.enTete, format }
                        })}
                        className={`flex-1 p-3 rounded-xl border-2 transition-colors capitalize ${
                          modeles.enTete?.format === format
                            ? 'border-[#c9a227] bg-[#fdf8e8]'
                            : 'border-[#e0e0e0] hover:border-[#c9a227]'
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </FormField>

                <div className="flex items-center justify-between p-3 bg-[#f7f7f7] rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-[#1f1f1f]">Afficher le logo</p>
                    <p className="text-xs text-[#757575]">Logo dans l'en-tête</p>
                  </div>
                  <button
                    onClick={() => setModeles({
                      ...modeles,
                      enTete: { ...modeles.enTete, afficherLogo: !modeles.enTete?.afficherLogo }
                    })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      modeles.enTete?.afficherLogo ? 'bg-[#c9a227]' : 'bg-[#e0e0e0]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      modeles.enTete?.afficherLogo ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </FormSection>

            <FormSection title="Pied de page" icon={Type} description="Mentions en bas de page">
              <div className="space-y-4">
                <FormField label="Mentions légales">
                  <textarea
                    value={modeles.piedPage?.mentionsLegales || ''}
                    onChange={(e) => setModeles({
                      ...modeles,
                      piedPage: { ...modeles.piedPage, mentionsLegales: e.target.value }
                    })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#0381fe] text-sm"
                    placeholder="Expert judiciaire inscrit sur la liste..."
                  />
                </FormField>

                <div className="flex items-center justify-between p-3 bg-[#f7f7f7] rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-[#1f1f1f]">Afficher coordonnées</p>
                    <p className="text-xs text-[#757575]">Téléphone, email</p>
                  </div>
                  <button
                    onClick={() => setModeles({
                      ...modeles,
                      piedPage: { ...modeles.piedPage, afficherCoordonnees: !modeles.piedPage?.afficherCoordonnees }
                    })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      modeles.piedPage?.afficherCoordonnees ? 'bg-[#c9a227]' : 'bg-[#e0e0e0]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      modeles.piedPage?.afficherCoordonnees ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </FormSection>
          </div>

          {/* Paragraphes types */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#e0e0e0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#fdf8e8] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#c9a227]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#1f1f1f]">Paragraphes types</h3>
                  <p className="text-xs text-[#757575]">Textes réutilisables pour vos documents</p>
                </div>
              </div>
              <Button variant="primary" icon={Plus} onClick={handleAddParagraphe}>
                Ajouter
              </Button>
            </div>

            {/* Filtres par type */}
            <div className="flex gap-2 mb-4">
              {['tous', 'convocation', 'rapport', 'politesse'].map(type => (
                <Badge
                  key={type}
                  variant={type === 'tous' ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                >
                  {type}
                </Badge>
              ))}
            </div>

            <div className="space-y-3">
              {(modeles.paragraphesTypes || []).map((para, index) => (
                <div
                  key={para.id}
                  className="p-4 bg-[#f7f7f7] rounded-xl hover:bg-[#f0f0f0] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-[#1f1f1f]">{para.titre}</p>
                        <Badge variant="default" className="text-xs capitalize">{para.type}</Badge>
                      </div>
                      <p className="text-sm text-[#757575] line-clamp-2">{para.contenu}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button
                        onClick={() => handleCopyToClipboard(para.contenu)}
                        className="p-2 hover:bg-white rounded-lg text-[#757575] hover:text-[#0381fe]"
                        title="Copier"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingParagraphe(para)}
                        className="p-2 hover:bg-white rounded-lg text-[#757575] hover:text-[#c9a227]"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteParagraphe(para.id)}
                        className="p-2 hover:bg-white rounded-lg text-[#757575] hover:text-[#ff3b30]"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Clauses standards */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#e0e0e0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e5f3ff] rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#0381fe]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#1f1f1f]">Clauses standards</h3>
                  <p className="text-xs text-[#757575]">Clauses juridiques réutilisables</p>
                </div>
              </div>
              <Button variant="secondary" icon={Plus} onClick={handleAddClause}>
                Ajouter
              </Button>
            </div>

            <div className="space-y-3">
              {(modeles.clausesStandards || []).map((clause) => (
                <div
                  key={clause.id}
                  className="p-4 border border-[#e0e0e0] rounded-xl hover:border-[#c9a227] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-[#1f1f1f] mb-1">{clause.titre}</p>
                      <p className="text-sm text-[#757575] line-clamp-2">{clause.contenu}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button
                        onClick={() => handleCopyToClipboard(clause.contenu)}
                        className="p-2 hover:bg-[#f7f7f7] rounded-lg text-[#757575] hover:text-[#0381fe]"
                        title="Copier"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingClause(clause)}
                        className="p-2 hover:bg-[#f7f7f7] rounded-lg text-[#757575] hover:text-[#c9a227]"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClause(clause.id)}
                        className="p-2 hover:bg-[#f7f7f7] rounded-lg text-[#757575] hover:text-[#ff3b30]"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ONGLET INTERFACE */}
      {activeTab === 'interface' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Organisation sidebar */}
          <FormSection title="Navigation (Sidebar)" icon={List} description="Réorganisez les modules">
            <div className="space-y-2">
              {interfaceConfig.sidebar.ordre.map((moduleId, index) => (
                <div
                  key={moduleId}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                    interfaceConfig.sidebar.modulesVisibles.includes(moduleId)
                      ? 'bg-white border-[#e0e0e0]'
                      : 'bg-[#f7f7f7] border-[#f7f7f7] opacity-50'
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-[#ababab]" />

                  <div className="flex-1">
                    <p className="font-medium text-[#1f1f1f] text-sm">{moduleLabels[moduleId]}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveModule(index, -1)}
                      disabled={index === 0}
                      className="p-1.5 hover:bg-[#f7f7f7] rounded-lg text-[#757575] disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveModule(index, 1)}
                      disabled={index === interfaceConfig.sidebar.ordre.length - 1}
                      className="p-1.5 hover:bg-[#f7f7f7] rounded-lg text-[#757575] disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleModuleVisibility(moduleId)}
                      className={`p-1.5 rounded-lg ${
                        interfaceConfig.sidebar.modulesVisibles.includes(moduleId)
                          ? 'bg-[#e5f7ed] text-[#00a65a]'
                          : 'bg-[#f7f7f7] text-[#ababab]'
                      }`}
                    >
                      {interfaceConfig.sidebar.modulesVisibles.includes(moduleId) ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#757575] mt-4">
              Utilisez les flèches pour réorganiser et l'œil pour masquer/afficher
            </p>
          </FormSection>

          {/* Densité d'affichage */}
          <FormSection title="Apparence" icon={Palette} description="Personnalisez l'affichage">
            <div className="space-y-4">
              <FormField label="Densité d'affichage">
                <div className="flex gap-3">
                  {[
                    { id: 'compact', label: 'Compact', desc: 'Plus d\'infos visibles' },
                    { id: 'normal', label: 'Normal', desc: 'Équilibre optimal' },
                    { id: 'aere', label: 'Aéré', desc: 'Plus d\'espace' }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => setInterfaceConfig({ ...interfaceConfig, densite: option.id })}
                      className={`flex-1 p-4 rounded-xl border-2 transition-colors text-center ${
                        interfaceConfig.densite === option.id
                          ? 'border-[#c9a227] bg-[#fdf8e8]'
                          : 'border-[#e0e0e0] hover:border-[#c9a227]'
                      }`}
                    >
                      <p className="font-medium text-[#1f1f1f]">{option.label}</p>
                      <p className="text-xs text-[#757575] mt-1">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label="Colonnes liste des affaires">
                <div className="flex flex-wrap gap-2 p-3 border-2 border-[#e0e0e0] rounded-xl bg-[#f7f7f7]">
                  {interfaceConfig.listeAffaires.colonnesDisponibles.map(col => (
                    <button
                      key={col}
                      onClick={() => {
                        const colonnes = interfaceConfig.listeAffaires.colonnes.includes(col)
                          ? interfaceConfig.listeAffaires.colonnes.filter(c => c !== col)
                          : [...interfaceConfig.listeAffaires.colonnes, col];
                        setInterfaceConfig({
                          ...interfaceConfig,
                          listeAffaires: { ...interfaceConfig.listeAffaires, colonnes }
                        });
                      }}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors capitalize ${
                        interfaceConfig.listeAffaires.colonnes.includes(col)
                          ? 'bg-[#c9a227] text-white'
                          : 'bg-white border border-[#e0e0e0] text-[#757575] hover:border-[#c9a227]'
                      }`}
                    >
                      {col.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label="Onglets fiche affaire">
                <div className="flex flex-wrap gap-2 p-3 border-2 border-[#e0e0e0] rounded-xl bg-[#f7f7f7]">
                  {interfaceConfig.ficheAffaire.onglets.map(onglet => (
                    <button
                      key={onglet}
                      onClick={() => {
                        const ongletsVisibles = interfaceConfig.ficheAffaire.ongletsVisibles.includes(onglet)
                          ? interfaceConfig.ficheAffaire.ongletsVisibles.filter(o => o !== onglet)
                          : [...interfaceConfig.ficheAffaire.ongletsVisibles, onglet];
                        setInterfaceConfig({
                          ...interfaceConfig,
                          ficheAffaire: { ...interfaceConfig.ficheAffaire, ongletsVisibles }
                        });
                      }}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors capitalize ${
                        interfaceConfig.ficheAffaire.ongletsVisibles.includes(onglet)
                          ? 'bg-[#0381fe] text-white'
                          : 'bg-white border border-[#e0e0e0] text-[#757575] hover:border-[#0381fe]'
                      }`}
                    >
                      {onglet}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>
          </FormSection>

          {/* Dashboard widgets */}
          <FormSection title="Dashboard" icon={LayoutDashboard} description="Widgets visibles sur le tableau de bord">
            <div className="space-y-2">
              {interfaceConfig.dashboard.widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-3 bg-[#f7f7f7] rounded-xl"
                >
                  <p className="font-medium text-[#1f1f1f] text-sm capitalize">{widget.id.replace('-', ' ')}</p>
                  <button
                    onClick={() => {
                      const widgets = interfaceConfig.dashboard.widgets.map(w =>
                        w.id === widget.id ? { ...w, visible: !w.visible } : w
                      );
                      setInterfaceConfig({
                        ...interfaceConfig,
                        dashboard: { widgets }
                      });
                    }}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      widget.visible ? 'bg-[#c9a227]' : 'bg-[#e0e0e0]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      widget.visible ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </FormSection>

          {/* Actions rapides */}
          <Card className="p-6 bg-[#e5f3ff] border-[#0381fe]">
            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-[#0381fe] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#0381fe]">Réinitialiser l'interface</p>
                <p className="text-xs text-[#0381fe] opacity-80 mt-1">
                  Restaurer la configuration par défaut de tous les éléments d'interface.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setInterfaceConfig(DEFAULT_INTERFACE);
                    toast.success('Interface réinitialisée');
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="grid grid-cols-2 gap-6">
          <FormSection title="Notifications" icon={Bell} description="Gérez vos alertes">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#fafafa] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Notifications par email</p>
                  <p className="text-xs text-[#737373]">Recevoir les alertes par email</p>
                </div>
                <button
                  onClick={() => setPreferences({...preferences, notificationsEmail: !preferences.notificationsEmail})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.notificationsEmail ? 'bg-[#c9a227]' : 'bg-[#e5e5e5]'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    preferences.notificationsEmail ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#fafafa] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Notifications push</p>
                  <p className="text-xs text-[#737373]">Notifications navigateur</p>
                </div>
                <button
                  onClick={() => setPreferences({...preferences, notificationsPush: !preferences.notificationsPush})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.notificationsPush ? 'bg-[#c9a227]' : 'bg-[#e5e5e5]'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    preferences.notificationsPush ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <FormField label="Rappel avant échéance" help="Nombre de jours">
                <select
                  value={preferences.rappelEcheance}
                  onChange={(e) => setPreferences({...preferences, rappelEcheance: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#c9a227]"
                >
                  <option value="3">3 jours avant</option>
                  <option value="5">5 jours avant</option>
                  <option value="7">7 jours avant (recommandé)</option>
                  <option value="14">14 jours avant</option>
                </select>
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Affichage" icon={Palette} description="Personnalisez l'interface">
            <div className="space-y-4">
              <FormField label="Thème">
                <div className="flex gap-3">
                  {[
                    { id: 'clair', label: 'Clair', icon: '☀️' },
                    { id: 'sombre', label: 'Sombre', icon: '🌙' },
                    { id: 'auto', label: 'Automatique', icon: '🔄' }
                  ].map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setPreferences({...preferences, theme: theme.id})}
                      className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                        preferences.theme === theme.id
                          ? 'border-[#c9a227] bg-[#faf8f3]'
                          : 'border-[#e5e5e5] hover:border-[#c9a227]'
                      }`}
                    >
                      <div className="text-2xl mb-1">{theme.icon}</div>
                      <div className="text-sm font-medium">{theme.label}</div>
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label="Format de date">
                <select
                  value={preferences.formatDate}
                  onChange={(e) => setPreferences({...preferences, formatDate: e.target.value})}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#c9a227]"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                  <option value="DD-MM-YYYY">DD-MM-YYYY (31-12-2024)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                </select>
              </FormField>

              <div className="flex items-center justify-between p-3 bg-[#fafafa] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Sauvegarde automatique</p>
                  <p className="text-xs text-[#737373]">Sauvegarder automatiquement vos modifications</p>
                </div>
                <button
                  onClick={() => setPreferences({...preferences, sauvegardeAuto: !preferences.sauvegardeAuto})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.sauvegardeAuto ? 'bg-[#c9a227]' : 'bg-[#e5e5e5]'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    preferences.sauvegardeAuto ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </FormSection>
        </div>
      )}

      {activeTab === 'securite' && (
        <div className="grid grid-cols-2 gap-6">
          <FormSection title="Mot de passe" icon={Key} description="Sécurisez votre compte">
            <div className="space-y-4">
              <p className="text-sm text-[#737373]">
                Pour des raisons de sécurité, modifiez régulièrement votre mot de passe.
              </p>
              <Button variant="secondary" icon={Lock} onClick={() => setShowPasswordModal(true)}>
                Modifier le mot de passe
              </Button>
            </div>
          </FormSection>

          <FormSection title="Données" icon={FileText} description="Gestion de vos données">
            <div className="space-y-4">
              <div className="p-4 bg-[#fafafa] rounded-lg">
                <h4 className="text-sm font-medium text-[#1a1a1a] mb-2">Exporter mes données</h4>
                <p className="text-xs text-[#737373] mb-3">
                  Téléchargez une copie de toutes vos données (affaires, documents, paramètres)
                </p>
                <Button variant="secondary" icon={Download} onClick={handleExport}>
                  Exporter toutes les données
                </Button>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 mb-2">Zone de danger</h4>
                <p className="text-xs text-red-600 mb-3">
                  La suppression de votre compte est irréversible. Toutes vos données seront perdues.
                </p>
                <Button
                  variant="secondary"
                  className="text-red-600 border-red-300 hover:bg-red-100"
                  icon={Trash2}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Supprimer mon compte
                </Button>
              </div>
            </div>
          </FormSection>
        </div>
      )}

      {/* Aide contextuelle */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">Besoin d'aide ?</p>
            <p className="text-xs text-blue-600 mt-1">
              Vos paramètres sont automatiquement utilisés pour pré-remplir vos documents (convocations, rapports, états de frais).
              Assurez-vous que vos informations sont complètes et à jour.
            </p>
          </div>
        </div>
      </Card>

      {/* Modal modification mot de passe */}
      {showPasswordModal && (
        <ModalBase
          title="Modifier le mot de passe"
          onClose={() => {
            setShowPasswordModal(false);
            setPasswords({ current: '', newPassword: '', confirm: '' });
          }}
          size="sm"
        >
          <div className="space-y-4">
            <FormField label="Mot de passe actuel">
              <Input
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
            </FormField>
            <FormField label="Nouveau mot de passe" help="Minimum 8 caractères">
              <Input
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              />
            </FormField>
            <FormField label="Confirmer le nouveau mot de passe">
              <Input
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </FormField>
            <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswords({ current: '', newPassword: '', confirm: '' });
                }}
              >
                Annuler
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleChangePassword}>
                Modifier
              </Button>
            </div>
          </div>
        </ModalBase>
      )}

      {/* Modal suppression compte */}
      {showDeleteModal && (
        <ModalBase
          title="Supprimer mon compte"
          onClose={() => setShowDeleteModal(false)}
          size="sm"
        >
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Attention !</p>
                  <p className="text-sm text-red-600 mt-1">
                    Cette action est irréversible. Toutes vos données seront définitivement supprimées :
                  </p>
                  <ul className="text-sm text-red-600 mt-2 list-disc list-inside">
                    <li>Affaires et dossiers</li>
                    <li>Documents et photos</li>
                    <li>Paramètres et préférences</li>
                    <li>Historique complet</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </Button>
              <Button
                variant="secondary"
                className="flex-1 bg-red-600 text-white hover:bg-red-700 border-red-600"
                icon={Trash2}
                onClick={handleDeleteAccount}
              >
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </ModalBase>
      )}

      {/* Modal édition paragraphe */}
      {editingParagraphe && (
        <ModalBase
          title={editingParagraphe.id.startsWith('para-') && !modeles.paragraphesTypes.find(p => p.id === editingParagraphe.id && p.contenu) ? 'Nouveau paragraphe' : 'Modifier le paragraphe'}
          onClose={() => setEditingParagraphe(null)}
          size="lg"
        >
          <div className="space-y-4">
            <FormField label="Titre du paragraphe">
              <Input
                value={editingParagraphe.titre}
                onChange={(e) => setEditingParagraphe({ ...editingParagraphe, titre: e.target.value })}
                placeholder="Ex: Introduction rapport"
              />
            </FormField>

            <FormField label="Type">
              <select
                value={editingParagraphe.type}
                onChange={(e) => setEditingParagraphe({ ...editingParagraphe, type: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#0381fe]"
              >
                <option value="convocation">Convocation</option>
                <option value="rapport">Rapport</option>
                <option value="politesse">Formule de politesse</option>
                <option value="autre">Autre</option>
              </select>
            </FormField>

            <FormField label="Contenu">
              <textarea
                value={editingParagraphe.contenu}
                onChange={(e) => setEditingParagraphe({ ...editingParagraphe, contenu: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border-2 border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#0381fe] text-sm"
                placeholder="Saisissez le contenu du paragraphe..."
              />
            </FormField>

            <div className="flex gap-3 pt-4 border-t border-[#e0e0e0]">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setEditingParagraphe(null)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSaveParagraphe}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </ModalBase>
      )}

      {/* Modal édition clause */}
      {editingClause && (
        <ModalBase
          title={editingClause.id.startsWith('clause-') && !modeles.clausesStandards.find(c => c.id === editingClause.id && c.contenu) ? 'Nouvelle clause' : 'Modifier la clause'}
          onClose={() => setEditingClause(null)}
          size="lg"
        >
          <div className="space-y-4">
            <FormField label="Titre de la clause">
              <Input
                value={editingClause.titre}
                onChange={(e) => setEditingClause({ ...editingClause, titre: e.target.value })}
                placeholder="Ex: Clause de confidentialité"
              />
            </FormField>

            <FormField label="Contenu">
              <textarea
                value={editingClause.contenu}
                onChange={(e) => setEditingClause({ ...editingClause, contenu: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border-2 border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#0381fe] text-sm"
                placeholder="Saisissez le contenu de la clause..."
              />
            </FormField>

            <div className="flex gap-3 pt-4 border-t border-[#e0e0e0]">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setEditingClause(null)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSaveClause}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </ModalBase>
      )}
    </div>
  );
};

export default PageParametres;
