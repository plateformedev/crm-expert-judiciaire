// ============================================================================
// CRM EXPERT JUDICIAIRE - CONSTANTES ET DONNÉES DE RÉFÉRENCE
// ============================================================================

// Design System - Style Samsung One UI
export const DS = {
  colors: {
    // Fond principal - Samsung utilise blanc pur et gris très clair
    background: '#ffffff',
    backgroundAlt: '#f7f7f7',
    surface: '#ffffff',
    surfaceHover: '#f0f0f0',
    surfacePressed: '#e4e4e4',

    // Texte - Contraste élevé Samsung
    textPrimary: '#1f1f1f',      // Noir profond pour lisibilité maximale
    textSecondary: '#757575',    // Gris moyen
    textTertiary: '#ababab',     // Gris clair
    textDisabled: '#cccccc',

    // Accent principal - Or Expert Judiciaire
    primary: '#c9a227',
    primaryLight: '#f5e6b3',
    primaryDark: '#9a7b1c',
    primarySurface: '#fdf8e8',

    // Bleu Samsung pour actions secondaires
    samsungBlue: '#0381fe',
    samsungBlueLight: '#e5f3ff',

    // Couleurs sémantiques - Style Samsung (vives et contrastées)
    success: '#00a65a',          // Vert Samsung
    successLight: '#e5f7ed',
    warning: '#ff9500',          // Orange Samsung
    warningLight: '#fff5e5',
    error: '#ff3b30',            // Rouge Samsung
    errorLight: '#ffebea',
    info: '#0381fe',             // Bleu Samsung
    infoLight: '#e5f3ff',

    // Gris Samsung - Échelle simplifiée et contrastée
    gris: {
      50: '#f7f7f7',   // Fond alternatif
      100: '#f0f0f0',  // Hover
      200: '#e4e4e4',  // Pressed / Séparateurs
      300: '#d1d1d1',  // Bordures
      400: '#ababab',  // Texte tertiaire
      500: '#757575',  // Texte secondaire
      600: '#555555',  // Icônes
      700: '#333333',  // Texte fort
      800: '#1f1f1f',  // Texte principal
      900: '#000000'   // Noir pur
    },

    // Bordures Samsung
    border: '#e0e0e0',
    borderLight: '#f0f0f0',
    borderDark: '#d1d1d1',

    // Legacy (compatibilité)
    noir: '#1f1f1f',
    noirProfond: '#000000',
    blanc: '#ffffff',
    blancCasse: '#f7f7f7',
    or: '#c9a227',
    orClair: '#f5e6b3',
    orPale: '#fdf8e8'
  },

  // Ombres Samsung - Très subtiles, préférence pour les bordures
  shadows: {
    none: 'none',
    sm: '0 1px 3px rgba(0,0,0,0.08)',
    md: '0 2px 8px rgba(0,0,0,0.1)',
    lg: '0 4px 16px rgba(0,0,0,0.12)',
    xl: '0 8px 24px rgba(0,0,0,0.15)',
    card: '0 1px 4px rgba(0,0,0,0.08)'
  },

  // Border radius Samsung One UI - Arrondis modérés
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '26px',    // Pour les cartes principales
    full: '9999px'  // Pour les badges/avatars seulement
  },

  // Espacement Samsung - Généreux pour la lisibilité
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
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
