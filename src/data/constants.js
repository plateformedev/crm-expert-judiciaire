// ============================================================================
// CRM EXPERT JUDICIAIRE - CONSTANTES ET DONNÉES DE RÉFÉRENCE
// ============================================================================

// Design System
export const DS = {
  colors: {
    noir: '#1a1a1a',
    noirProfond: '#0d0d0d',
    blanc: '#ffffff',
    blancCasse: '#fafafa',
    or: '#c9a227',
    orClair: '#d4af37',
    orPale: '#f5e6c8',
    gris: {
      50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4',
      400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040',
      800: '#262626', 900: '#171717'
    }
  }
};

// Garanties construction
export const GARANTIES = {
  gpa: { code: 'GPA', nom: 'Garantie de Parfait Achèvement', dureeJours: 365, article: 'Art. 1792-6 CC' },
  biennale: { code: 'GB', nom: 'Garantie Biennale', dureeJours: 730, article: 'Art. 1792-3 CC' },
  decennale: { code: 'GD', nom: 'Garantie Décennale', dureeJours: 3652, article: 'Art. 1792 CC' },
  prescription: { code: 'PDC', nom: 'Prescription Droit Commun', dureeJours: 1826, article: 'Art. 2224 CC' }
};

// Étapes du tunnel - Workflow Expert Judiciaire Complet
export const ETAPES_TUNNEL = [
  {
    id: 'assignation',
    numero: 1,
    label: 'Assignation reçue',
    description: 'Réception de l\'ordonnance du juge',
    icon: 'FileInput',
    color: 'blue',
    delaiJours: null,
    obligatoire: true
  },
  {
    id: 'reponse-juge',
    numero: 2,
    label: 'Réponse au juge',
    description: 'Accepter, refuser ou se récuser',
    icon: 'Send',
    color: 'indigo',
    delaiJours: 15,
    obligatoire: true
  },
  {
    id: 'saisie-dossier',
    numero: 3,
    label: 'Saisie du dossier',
    description: 'Infos ordonnance, parties, mission',
    icon: 'ClipboardList',
    color: 'purple',
    delaiJours: null,
    obligatoire: true
  },
  {
    id: 'provision',
    numero: 4,
    label: 'Vérification provision',
    description: 'Consignation reçue ou relance',
    icon: 'Banknote',
    color: 'emerald',
    delaiJours: null,
    obligatoire: true
  },
  {
    id: 'convocation-r1',
    numero: 5,
    label: 'Convocation R1',
    description: 'Proposer date et envoyer aux parties',
    icon: 'CalendarPlus',
    color: 'orange',
    delaiJours: 8,
    obligatoire: true
  },
  {
    id: 'reunion-r1',
    numero: 6,
    label: 'Réunion R1',
    description: 'Notes, observations, photos',
    icon: 'Users',
    color: 'amber',
    delaiJours: null,
    obligatoire: true
  },
  {
    id: 'compte-rendu-r1',
    numero: 7,
    label: 'Compte-rendu R1',
    description: 'Rapport de réunion + observations',
    icon: 'FileText',
    color: 'yellow',
    delaiJours: 15,
    obligatoire: true
  },
  {
    id: 'dires',
    numero: 8,
    label: 'Dires des parties',
    description: 'Réception et traitement des dires',
    icon: 'MessageSquare',
    color: 'cyan',
    delaiJours: 30,
    obligatoire: false
  },
  {
    id: 'reunions-supplementaires',
    numero: 9,
    label: 'Réunions R2, R3...',
    description: 'Réunions complémentaires si nécessaire',
    icon: 'CalendarRange',
    color: 'teal',
    delaiJours: null,
    obligatoire: false
  },
  {
    id: 'note-synthese',
    numero: 10,
    label: 'Note de synthèse',
    description: 'Pré-rapport aux parties',
    icon: 'FileSearch',
    color: 'lime',
    delaiJours: null,
    obligatoire: true
  },
  {
    id: 'rapport-final',
    numero: 11,
    label: 'Rapport définitif',
    description: 'Rédaction et dépôt du rapport',
    icon: 'FileCheck',
    color: 'green',
    delaiJours: null,
    obligatoire: true
  },
  {
    id: 'taxation',
    numero: 12,
    label: 'Taxation honoraires',
    description: 'État de frais et demande de taxation',
    icon: 'Receipt',
    color: 'gold',
    delaiJours: null,
    obligatoire: true
  }
];

// Statuts de réponse au juge
export const STATUTS_REPONSE_JUGE = [
  { id: 'en-attente', label: 'En attente de réponse', color: 'gray' },
  { id: 'acceptee', label: 'Mission acceptée', color: 'green' },
  { id: 'refusee', label: 'Mission refusée', color: 'red' },
  { id: 'recusation', label: 'Récusation', color: 'orange' }
];

// Motifs de refus/récusation
export const MOTIFS_REFUS = [
  { id: 'conflit-interet', label: 'Conflit d\'intérêt' },
  { id: 'incompetence', label: 'Hors domaine de compétence' },
  { id: 'indisponibilite', label: 'Indisponibilité (charge de travail)' },
  { id: 'eloignement', label: 'Éloignement géographique' },
  { id: 'connaissance-partie', label: 'Connaissance personnelle d\'une partie' },
  { id: 'autre', label: 'Autre motif' }
];

// Types de réunion
export const TYPES_REUNION = [
  { id: 'expertise', label: 'Réunion d\'expertise contradictoire' },
  { id: 'visite', label: 'Visite des lieux' },
  { id: 'accedit', label: 'Accédit (visite technique)' },
  { id: 'conciliation', label: 'Tentative de conciliation' },
  { id: 'complement', label: 'Investigations complémentaires' }
];

// Statuts de réunion
export const STATUTS_REUNION = [
  { id: 'planifiee', label: 'Planifiée', color: 'blue' },
  { id: 'convocations-envoyees', label: 'Convocations envoyées', color: 'indigo' },
  { id: 'confirmee', label: 'Confirmée', color: 'purple' },
  { id: 'en-cours', label: 'En cours', color: 'orange' },
  { id: 'terminee', label: 'Terminée', color: 'green' },
  { id: 'reportee', label: 'Reportée', color: 'amber' },
  { id: 'annulee', label: 'Annulée', color: 'red' }
];

// Statuts des dires
export const STATUTS_DIRE = [
  { id: 'recu', label: 'Reçu', color: 'blue' },
  { id: 'en-analyse', label: 'En analyse', color: 'amber' },
  { id: 'repondu', label: 'Répondu', color: 'green' },
  { id: 'rejete', label: 'Rejeté (hors délai)', color: 'red' }
];

// Taux vacations
export const TAUX_VACATIONS = {
  expertise: { taux: 90, unite: 'heure', description: 'Vacation d\'expertise (réunion, visite)' },
  etude: { taux: 80, unite: 'heure', description: 'Étude de dossier, analyse documents' },
  redaction: { taux: 80, unite: 'heure', description: 'Rédaction (CR, notes, rapport)' },
  deplacement: { taux: 50, unite: 'heure', description: 'Temps de déplacement' },
  kilometrique: { taux: 0.60, unite: 'km', description: 'Indemnité kilométrique' }
};

// Délais légaux
export const DELAIS_LEGAUX = [
  { code: 'CONVOC', label: 'Délai convocation', jours: 8, article: 'Art. 160 CPC' },
  { code: 'DIRES', label: 'Délai réponse dires', jours: 21, article: 'Usage' },
  { code: 'OBS_SYNTHESE', label: 'Observations pré-rapport', jours: 30, article: 'Art. 276 CPC' },
  { code: 'PROROGATION', label: 'Demande prorogation', jours: 15, article: 'Usage' }
];
