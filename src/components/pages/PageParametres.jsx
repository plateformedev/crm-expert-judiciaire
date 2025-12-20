// ============================================================================
// CRM EXPERT JUDICIAIRE - PAGE PARAMÈTRES
// Configuration complète du profil expert et de l'application
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Settings, User, Building, Euro, Bell, Shield, Palette,
  Save, Edit, Check, X, Camera, Mail, Phone, MapPin,
  Briefcase, Award, FileText, Clock, Calculator, Globe,
  Key, Lock, Eye, EyeOff, AlertTriangle, CheckCircle,
  HelpCircle, Download, Upload, Trash2, RefreshCw
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

  // Sauvegarder
  const handleSave = () => {
    localStorage.setItem('expert_profile', JSON.stringify(profile));
    localStorage.setItem('expert_tarifs', JSON.stringify(tarifs));
    localStorage.setItem('expert_preferences', JSON.stringify(preferences));
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
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
    { id: 'profil', label: 'Profil Expert', icon: User },
    { id: 'tarifs', label: 'Tarifs & Vacations', icon: Euro },
    { id: 'preferences', label: 'Préférences', icon: Settings },
    { id: 'securite', label: 'Sécurité', icon: Shield }
  ];

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
    </div>
  );
};

export default PageParametres;
