// ============================================================================
// CRM EXPERT JUDICIAIRE - DONNÉES DE DÉMONSTRATION
// ============================================================================

// Affaires de démonstration
export const DEMO_AFFAIRES = [
  {
    id: 'demo-1',
    reference: 'EXP-2024-0001',
    rg: '24/01234',
    tribunal: 'TJ Paris',
    chambre: '5ème chambre',
    statut: 'en-cours',
    urgent: true,
    bien_adresse: '15 rue de la Paix',
    bien_code_postal: '75002',
    bien_ville: 'Paris',
    bien_type: 'Appartement',
    mission: 'Rechercher les causes et origines des désordres affectant l\'appartement. Déterminer les responsabilités. Chiffrer les travaux de reprise.',
    date_ordonnance: '2024-01-15',
    date_echeance: '2024-06-15',
    provision_montant: 3500,
    provision_recue: true,
    created_at: '2024-01-15T10:00:00Z',
    parties: [
      { id: 'p1', type: 'demandeur', nom: 'DUPONT', prenom: 'Jean', role: 'Propriétaire' },
      { id: 'p2', type: 'defenseur', raison_sociale: 'CONSTRUCTIONS DURAND SARL', role: 'Entreprise générale' }
    ],
    reunions: [
      { id: 'r1', numero: 1, date_reunion: '2024-02-10', statut: 'terminee' },
      { id: 'r2', numero: 2, date_reunion: '2024-03-15', statut: 'planifiee' }
    ],
    pathologies: [
      { id: 'path1', numero: 1, intitule: 'Fissures structurelles', localisation: 'Mur porteur salon', garantie: 'decennale' },
      { id: 'path2', numero: 2, intitule: 'Infiltrations toiture', localisation: 'Chambre 2', garantie: 'decennale' }
    ],
    documents: [],
    dires: [],
    chiffrages: [],
    vacations: [
      { id: 'v1', type: 'expertise', duree_heures: 3, montant: 270, date_vacation: '2024-02-10' }
    ],
    frais: []
  },
  {
    id: 'demo-2',
    reference: 'EXP-2024-0002',
    rg: '24/02567',
    tribunal: 'TJ Versailles',
    chambre: '3ème chambre',
    statut: 'en-cours',
    urgent: false,
    bien_adresse: '8 avenue des Champs',
    bien_code_postal: '78000',
    bien_ville: 'Versailles',
    bien_type: 'Maison',
    mission: 'Expertise des malfaçons constatées suite à la construction d\'une maison individuelle.',
    date_ordonnance: '2024-02-20',
    date_echeance: '2024-08-20',
    provision_montant: 4500,
    provision_recue: true,
    created_at: '2024-02-20T14:30:00Z',
    parties: [
      { id: 'p3', type: 'demandeur', nom: 'MARTIN', prenom: 'Sophie', role: 'Maître d\'ouvrage' }
    ],
    reunions: [
      { id: 'r3', numero: 1, date_reunion: '2024-03-25', statut: 'terminee' }
    ],
    pathologies: [
      { id: 'path3', numero: 1, intitule: 'Défaut d\'étanchéité terrasse', localisation: 'Terrasse RDC', garantie: 'biennale' }
    ],
    documents: [],
    dires: [],
    chiffrages: [],
    vacations: [],
    frais: []
  },
  {
    id: 'demo-3',
    reference: 'EXP-2024-0003',
    rg: '23/08901',
    tribunal: 'TJ Lyon',
    chambre: '2ème chambre',
    statut: 'pre-rapport',
    urgent: false,
    bien_adresse: '22 rue Garibaldi',
    bien_code_postal: '69003',
    bien_ville: 'Lyon',
    bien_type: 'Immeuble',
    mission: 'Déterminer l\'origine des désordres affectant les parties communes de l\'immeuble.',
    date_ordonnance: '2023-09-10',
    date_echeance: '2024-03-10',
    provision_montant: 6000,
    provision_recue: true,
    created_at: '2023-09-10T09:00:00Z',
    parties: [
      { id: 'p4', type: 'demandeur', raison_sociale: 'Syndic FONCIA', role: 'Syndic de copropriété' },
      { id: 'p5', type: 'defenseur', raison_sociale: 'ABC RENOVATION', role: 'Entreprise de ravalement' },
      { id: 'p6', type: 'assureur', raison_sociale: 'AXA Assurances', role: 'Assureur DO' }
    ],
    reunions: [
      { id: 'r4', numero: 1, date_reunion: '2023-10-15', statut: 'terminee' },
      { id: 'r5', numero: 2, date_reunion: '2023-12-10', statut: 'terminee' },
      { id: 'r6', numero: 3, date_reunion: '2024-02-05', statut: 'terminee' }
    ],
    pathologies: [
      { id: 'path4', numero: 1, intitule: 'Décollements enduit façade', localisation: 'Façade Nord', garantie: 'decennale' },
      { id: 'path5', numero: 2, intitule: 'Fissures balcons', localisation: 'Balcons étages 2-4', garantie: 'decennale' },
      { id: 'path6', numero: 3, intitule: 'Infiltrations parking', localisation: 'Parking souterrain', garantie: 'decennale' }
    ],
    documents: [
      { id: 'd1', titre: 'Note de synthèse', type: 'note-synthese', created_at: '2024-02-20' }
    ],
    dires: [
      { id: 'dire1', partie_id: 'p5', contenu: 'Contestation des conclusions', date_reception: '2024-01-15' }
    ],
    chiffrages: [
      { id: 'c1', designation: 'Reprise façade', montant_ht: 45000 }
    ],
    vacations: [
      { id: 'v2', type: 'expertise', duree_heures: 4, montant: 360, date_vacation: '2023-10-15' },
      { id: 'v3', type: 'expertise', duree_heures: 3, montant: 270, date_vacation: '2023-12-10' },
      { id: 'v4', type: 'redaction', duree_heures: 8, montant: 640, date_vacation: '2024-02-15' }
    ],
    frais: [
      { id: 'f1', designation: 'Déplacements', montant: 150 }
    ]
  }
];

// Utilisateur de démonstration
export const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@expert-judiciaire.fr',
  user_metadata: {
    nom: 'Expert',
    prenom: 'Jean-Pierre',
    specialite: 'BTP - Construction'
  }
};

// Fonction pour obtenir les affaires du localStorage ou les démos
export const getStoredAffaires = () => {
  const stored = localStorage.getItem('crm_demo_affaires');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEMO_AFFAIRES;
    }
  }
  return DEMO_AFFAIRES;
};

// Fonction pour sauvegarder les affaires
export const saveAffaires = (affaires) => {
  localStorage.setItem('crm_demo_affaires', JSON.stringify(affaires));
};

// Vérifier si on est en mode démo (pas de Supabase configuré)
export const isDemoMode = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return !supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co';
};
