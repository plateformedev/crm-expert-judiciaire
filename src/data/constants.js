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

// Étapes du tunnel
export const ETAPES_TUNNEL = [
  { id: 'assignation', label: 'Assignation', onglet: 'mission', color: 'blue' },
  { id: 'parties', label: 'Parties', onglet: 'assignation', color: 'purple' },
  { id: 'premiere-reunion', label: '1ère Réunion', onglet: 'reunions', color: 'orange' },
  { id: 'constatations', label: 'Constatations', onglet: 'pathologies', color: 'red' },
  { id: 'dires', label: 'Dires', onglet: 'dires', color: 'indigo' },
  { id: 'analyses', label: 'Analyses', onglet: 'excellence', color: 'teal' },
  { id: 'chiffrage', label: 'Chiffrage', onglet: 'chiffrage', color: 'green' },
  { id: 'pre-rapport', label: 'Pré-Rapport', onglet: 'synthese', color: 'amber' },
  { id: 'rapport-final', label: 'Rapport Final', onglet: 'rapport', color: 'emerald' }
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
