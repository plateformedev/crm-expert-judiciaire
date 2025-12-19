// ============================================================================
// CRM EXPERT JUDICIAIRE - DONNÉES DTU ET RÉFÉRENCES TECHNIQUES
// ============================================================================

// Base DTU
export const BASE_DTU = [
  { numero: '13.11', titre: 'Fondations superficielles', categorie: 'gros-oeuvre', points: ['Profondeur hors gel', 'Dimensionnement', 'Ferraillage'], norme: 'NF P 11-711' },
  { numero: '13.12', titre: 'Fondations profondes', categorie: 'gros-oeuvre', points: ['Pieux', 'Micropieux', 'Essais'], norme: 'NF P 11-212' },
  { numero: '20.1', titre: 'Ouvrages en maçonnerie de petits éléments', categorie: 'gros-oeuvre', points: ['Chaînages', 'Joints dilatation', 'Épaisseur minimale'], norme: 'NF P 10-202' },
  { numero: '21', titre: 'Exécution des travaux en béton', categorie: 'gros-oeuvre', points: ['Enrobage', 'Vibration', 'Cure'], norme: 'NF P 18-201' },
  { numero: '23.1', titre: 'Murs en béton banché', categorie: 'gros-oeuvre', points: ['Épaisseur', 'Armatures', 'Joints'], norme: 'NF P 18-210' },
  { numero: '43.1', titre: 'Étanchéité toitures-terrasses', categorie: 'etancheite', points: ['Pente minimale 1%', 'Relevés 15cm', 'Protection'], norme: 'NF P 84-204' },
  { numero: '43.3', titre: 'Toitures-terrasses jardins', categorie: 'etancheite', points: ['Drainage', 'Anti-racines', 'Charges'], norme: 'NF P 84-204' },
  { numero: '40.11', titre: 'Couverture en ardoises', categorie: 'couverture', points: ['Pente', 'Recouvrement', 'Fixation'], norme: 'NF P 32-201' },
  { numero: '40.21', titre: 'Couverture en tuiles terre cuite', categorie: 'couverture', points: ['Pente minimale', 'Ventilation', 'Faîtage'], norme: 'NF P 31-202' },
  { numero: '36.5', titre: 'Mise en œuvre fenêtres et portes', categorie: 'menuiseries', points: ['Calfeutrement', 'Fixation', 'AEV'], norme: 'NF P 23-201' },
  { numero: '60.1', titre: 'Plomberie sanitaire', categorie: 'plomberie', points: ['Diamètres', 'Pentes 1-3%', 'Ventilation primaire'], norme: 'NF P 40-201' },
  { numero: '52.1', titre: 'Revêtements de sol scellés', categorie: 'revetements', points: ['Support', 'Mortier pose', 'Joints'], norme: 'NF P 61-202' },
  { numero: '52.2', titre: 'Revêtements de sol collés', categorie: 'revetements', points: ['Planéité', 'Colle', 'Joints périphériques'], norme: 'NF P 62-202' },
  { numero: '26.1', titre: 'Travaux d\'enduits de mortiers', categorie: 'revetements', points: ['3 couches', 'Épaisseur 20-25mm', 'Délais séchage'], norme: 'NF P 15-201' }
];

// Indices BT
export const INDICES_BT = [
  { code: 'BT01', nom: 'Tous corps d\'état', valeur: 121.5 },
  { code: 'BT03', nom: 'Maçonnerie - Béton armé', valeur: 120.8 },
  { code: 'BT06', nom: 'Ossature métallique', valeur: 123.2 },
  { code: 'BT07', nom: 'Ossature bois', valeur: 119.4 },
  { code: 'BT26', nom: 'Couverture - Zinguerie', valeur: 119.7 },
  { code: 'BT34', nom: 'Menuiseries bois', valeur: 122.6 },
  { code: 'BT38', nom: 'Menuiseries métalliques', valeur: 124.9 },
  { code: 'BT40', nom: 'Vitrerie - Miroiterie', valeur: 118.3 },
  { code: 'BT42', nom: 'Plâtrerie', valeur: 117.8 },
  { code: 'BT45', nom: 'Carrelage - Revêtements', valeur: 120.1 },
  { code: 'BT46', nom: 'Peinture', valeur: 116.9 },
  { code: 'BT50', nom: 'Plomberie - Sanitaire', valeur: 120.4 },
  { code: 'BT52', nom: 'Chauffage - Ventilation', valeur: 121.7 },
  { code: 'BT54', nom: 'Électricité', valeur: 118.1 }
];

// Jurisprudence
export const JURISPRUDENCE = [
  { ref: 'Cass. Civ. 2e, 24/11/1999', theme: 'Contradictoire', resume: 'Le non-respect du principe du contradictoire entraîne la nullité du rapport d\'expertise.', article: 'Art. 16 CPC' },
  { ref: 'Cass. Civ. 2e, 13/09/2012', theme: 'Responsabilité Expert', resume: 'Un rapport critiquable et inexploitable engage la responsabilité civile de l\'expert.', article: 'Art. 232 CPC' },
  { ref: 'Cass. Civ. 3e, 18/12/2001', theme: 'Désordres Évolutifs', resume: 'Les vices révélés progressivement constituent un vice caché relevant de la garantie décennale.', article: 'Art. 1792 CC' },
  { ref: 'Cass. Civ. 3e, 11/03/2015', theme: 'Lien Causalité', resume: 'L\'expert doit établir un lien de causalité direct entre le désordre et l\'intervention incriminée.', article: null },
  { ref: 'Cass. Civ. 3e, 21/03/2024', theme: 'Équipements', resume: 'Les PAC et inserts constituent des éléments d\'équipement soumis à la garantie décennale.', article: 'Art. 1792-2 CC' }
];

// Qualification désordres
export const QUALIFICATION_DESORDRES = {
  categories: [
    { id: 'impropriete-destination', label: 'Impropriété à destination', garantie: 'decennale', article: 'Art. 1792 CC', criteres: ['Habitabilité compromise', 'Sécurité des personnes', 'Usage normal impossible'] },
    { id: 'solidite-ouvrage', label: 'Atteinte à la solidité', garantie: 'decennale', article: 'Art. 1792 CC', criteres: ['Structure porteuse affectée', 'Risque d\'effondrement', 'Déformation majeure'] },
    { id: 'solidite-equipement', label: 'Solidité équipement indissociable', garantie: 'decennale', article: 'Art. 1792-2 CC', criteres: ['Canalisations encastrées', 'Chauffage intégré', 'Menuiseries scellées'] },
    { id: 'equipement-dissociable', label: 'Équipement dissociable', garantie: 'biennale', article: 'Art. 1792-3 CC', criteres: ['Appareils sanitaires', 'Équipements électriques', 'Volets roulants'] },
    { id: 'parfait-achevement', label: 'Défaut de conformité / Malfaçon', garantie: 'gpa', article: 'Art. 1792-6 CC', criteres: ['Réserves à la réception', 'Défauts signalés sous 1 an'] },
    { id: 'esthetique', label: 'Désordre esthétique', garantie: 'contractuelle', article: 'Art. 1231-1 CC', criteres: ['Défaut d\'aspect', 'Non-conformité couleur', 'Finition insuffisante'] },
    { id: 'evolutif', label: 'Désordre évolutif', garantie: 'decennale', article: 'Art. 1792 CC', criteres: ['Potentiel évolutif démontré', 'Expertise technique', 'Risque avéré'] }
  ],
  questions: [
    { id: 'q1', question: 'Le désordre compromet-il l\'usage normal du bien ?', oui: 'impropriete-destination', non: 'q2' },
    { id: 'q2', question: 'Y a-t-il un risque pour la structure porteuse ?', oui: 'solidite-ouvrage', non: 'q3' },
    { id: 'q3', question: 'L\'élément peut-il être déposé sans endommager l\'ouvrage ?', oui: 'q4', non: 'solidite-equipement' },
    { id: 'q4', question: 'Le désordre affecte-t-il un équipement fonctionnel ?', oui: 'equipement-dissociable', non: 'q5' },
    { id: 'q5', question: 'Le désordre est-il apparu dans l\'année suivant réception ?', oui: 'parfait-achevement', non: 'q6' },
    { id: 'q6', question: 'Le désordre est-il susceptible d\'évoluer vers l\'impropriété ?', oui: 'evolutif', non: 'esthetique' }
  ]
};

// Types assurances
export const TYPES_ASSURANCES = [
  { code: 'DO', nom: 'Dommages-Ouvrage', obligatoire: true, article: 'Art. L242-1 C. Assur.', delaiDeclaration: '5 jours', delaiReponse: '60 jours' },
  { code: 'RCD', nom: 'Responsabilité Civile Décennale', obligatoire: true, article: 'Art. L241-1 C. Assur.', delaiDeclaration: '10 ans' },
  { code: 'RC Pro', nom: 'Responsabilité Civile Professionnelle', obligatoire: true, article: 'Art. L241-2 C. Assur.' },
  { code: 'PUC', nom: 'Police Unique de Chantier', obligatoire: false },
  { code: 'TRC', nom: 'Tous Risques Chantier', obligatoire: false }
];

// Critères imputabilité
export const CRITERES_IMPUTABILITE = [
  { id: 'conception', label: 'Défaut de conception', intervenants: ['Architecte', 'BET', 'Maître d\'œuvre'], poids: 'Élevé' },
  { id: 'execution', label: 'Défaut d\'exécution', intervenants: ['Entreprise', 'Sous-traitant'], poids: 'Élevé' },
  { id: 'materiaux', label: 'Défaut de matériaux', intervenants: ['Fournisseur', 'Fabricant', 'Entreprise'], poids: 'Moyen' },
  { id: 'surveillance', label: 'Défaut de surveillance', intervenants: ['Maître d\'œuvre', 'Architecte'], poids: 'Moyen' },
  { id: 'coordination', label: 'Défaut de coordination', intervenants: ['OPC', 'Maître d\'œuvre'], poids: 'Moyen' },
  { id: 'controle', label: 'Défaut de contrôle', intervenants: ['Bureau de contrôle'], poids: 'Faible à Moyen' },
  { id: 'entretien', label: 'Défaut d\'entretien', intervenants: ['Maître d\'ouvrage', 'Syndic'], poids: 'Variable' }
];

// Laboratoires agréés
export const LABORATOIRES_AGREES = [
  { nom: 'SOCOTEC', specialites: ['Béton', 'Sol', 'Amiante'], accreditation: 'COFRAC' },
  { nom: 'BUREAU VERITAS', specialites: ['Béton', 'Métaux', 'Polymères'], accreditation: 'COFRAC' },
  { nom: 'APAVE', specialites: ['Béton', 'Sol', 'Environnement'], accreditation: 'COFRAC' },
  { nom: 'CEREMA', specialites: ['Géotechnique', 'Chaussées', 'Ouvrages d\'art'], accreditation: 'COFRAC' },
  { nom: 'LNE', specialites: ['Matériaux', 'Mesures', 'Essais'], accreditation: 'COFRAC' }
];

// Types prélèvements
export const TYPES_PRELEVEMENTS = [
  { id: 'carotte-beton', label: 'Carotte béton', analyses: ['Résistance compression', 'Carbonatation', 'Chlorures'], norme: 'NF EN 12504-1' },
  { id: 'prelevement-sol', label: 'Prélèvement de sol', analyses: ['Granulométrie', 'Limites Atterberg', 'Teneur en eau'], norme: 'NF P 94-056' },
  { id: 'prelevement-eau', label: 'Prélèvement d\'eau', analyses: ['Potabilité', 'pH', 'Bactériologie'], norme: 'NF EN ISO 5667' },
  { id: 'prelevement-air', label: 'Prélèvement d\'air', analyses: ['COV', 'Amiante', 'Moisissures'], norme: 'NF ISO 16000' },
  { id: 'thermographie', label: 'Thermographie IR', analyses: ['Ponts thermiques', 'Défauts isolation', 'Infiltrations'], norme: 'NF EN 13187' }
];

// Calculs techniques
export const CALCULS_TECHNIQUES = {
  surfaces: [
    { id: 'rectangle', label: 'Rectangle', formule: 'L × l', resultat: 'm²' },
    { id: 'triangle', label: 'Triangle', formule: '(B × H) / 2', resultat: 'm²' },
    { id: 'cercle', label: 'Cercle', formule: 'π × R²', resultat: 'm²' },
    { id: 'trapeze', label: 'Trapèze', formule: '((B + b) × H) / 2', resultat: 'm²' }
  ],
  volumes: [
    { id: 'parallelepipede', label: 'Parallélépipède', formule: 'L × l × H', resultat: 'm³' },
    { id: 'cylindre', label: 'Cylindre', formule: 'π × R² × H', resultat: 'm³' }
  ],
  thermique: [
    { id: 'resistance', label: 'Résistance thermique', formule: 'e / λ', description: 'R = épaisseur / conductivité', resultat: 'm².K/W' },
    { id: 'coefficient-u', label: 'Coefficient U', formule: '1 / R', description: 'Transmission thermique', resultat: 'W/m².K' }
  ],
  pentes: [
    { id: 'pourcentage', label: 'Pente en %', formule: '(H / L) × 100' },
    { id: 'mm-m', label: 'Pente mm/m', formule: 'H(mm) / L(m)' }
  ]
};
