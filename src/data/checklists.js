// ============================================================================
// CRM EXPERT JUDICIAIRE - CHECKLISTS CONFORMITÉ ET PROTECTION
// ============================================================================

// Checklist conformité CPC
export const CHECKLIST_CONFORMITE = {
  premiereReunion: {
    titre: 'Première Réunion',
    items: [
      { key: 'presentationExpert', label: 'Présentation expert + causes récusation', critique: true, article: 'Art. 234 CPC' },
      { key: 'tourTable', label: 'Tour de table des intervenants', critique: true },
      { key: 'feuillePresence', label: 'Feuille de présence signée', critique: true },
      { key: 'lectureMission', label: 'Lecture contradictoire de la mission', critique: true },
      { key: 'calendrier', label: 'Calendrier prévisionnel établi', critique: true, article: 'Art. 273 CPC' },
      { key: 'delaiDires', label: 'Délai pour dires communiqué', critique: false },
      { key: 'modalitesVisite', label: 'Modalités de visite définies', critique: false },
      { key: 'documentsReclames', label: 'Liste documents réclamés', critique: false },
      { key: 'pvRedige', label: 'PV de réunion rédigé', critique: true }
    ]
  },
  convocations: {
    titre: 'Convocations',
    items: [
      { key: 'delai8Jours', label: 'Délai minimum 8 jours respecté', critique: true, article: 'Art. 160 CPC' },
      { key: 'lrarParties', label: 'LRAR pour parties non représentées', critique: true },
      { key: 'courrierAvocats', label: 'Courrier simple pour avocats', critique: false },
      { key: 'ordreJour', label: 'Ordre du jour communiqué', critique: false },
      { key: 'lieuPrecis', label: 'Lieu et accès précisés', critique: false }
    ]
  },
  contradictoire: {
    titre: 'Contradictoire',
    items: [
      { key: 'piecesCommuniquees', label: 'Pièces communiquées à toutes parties', critique: true, article: 'Art. 16 CPC' },
      { key: 'diresTransmis', label: 'Dires transmis à toutes parties', critique: true, article: 'Art. 276 CPC' },
      { key: 'reponsesExpert', label: 'Réponses de l\'expert aux dires', critique: true },
      { key: 'delaiReponse', label: 'Délai de réponse aux dires respecté', critique: false },
      { key: 'tracabilite', label: 'Traçabilité des échanges assurée', critique: true }
    ]
  },
  preRapport: {
    titre: 'Pré-Rapport',
    items: [
      { key: 'noteEnvoyee', label: 'Note de synthèse envoyée', critique: true },
      { key: 'delaiObservations', label: 'Délai observations (1 mois min)', critique: true, article: 'Art. 276 CPC' },
      { key: 'accusesReception', label: 'Accusés de réception conservés', critique: true },
      { key: 'observationsIntegrees', label: 'Observations intégrées', critique: false }
    ]
  },
  rapportFinal: {
    titre: 'Rapport Final',
    items: [
      { key: 'reponsesDires', label: 'Réponses à tous les dires incluses', critique: true },
      { key: 'conclusionsMotivees', label: 'Conclusions techniquement motivées', critique: true },
      { key: 'annexesCompletes', label: 'Annexes complètes et numérotées', critique: false },
      { key: 'envoiLrar', label: 'Envoi LRAR aux parties', critique: true, article: 'Art. 282 CPC' },
      { key: 'depotGreffe', label: 'Dépôt au greffe dans délai', critique: true },
      { key: 'factureJointe', label: 'État de frais et honoraires joint', critique: false }
    ]
  }
};

// Checklist protection expert
export const CHECKLIST_PROTECTION = [
  { key: 'competenceMatiere', label: 'Compétence dans la matière vérifiée', critique: false, article: 'Art. 232 CPC' },
  { key: 'declarationRecusation', label: 'Déclaration causes de récusation', critique: true, article: 'Art. 234 CPC' },
  { key: 'assuranceRCPro', label: 'Assurance RC Professionnelle à jour', critique: true },
  { key: 'delaisRespectes', label: 'Délais de mission respectés', critique: true, article: 'Art. 273 CPC' },
  { key: 'contradictoireRespect', label: 'Contradictoire strictement respecté', critique: true, article: 'Art. 16 CPC' },
  { key: 'piecesCommuniquees', label: 'Toutes pièces communiquées à tous', critique: true },
  { key: 'visitesDocumentees', label: 'Visites documentées (photos, notes)', critique: true },
  { key: 'mesuresConservatoires', label: 'Mesures conservatoires signalées', critique: false },
  { key: 'conclusionsMotivees', label: 'Conclusions techniquement motivées', critique: true }
];

// Checklist assurances
export const CHECKLIST_ASSURANCES = [
  { key: 'attestationValide', label: 'Attestation en cours de validité', critique: true },
  { key: 'activiteCouverte', label: 'Activité de l\'intervenant couverte', critique: true },
  { key: 'montantSuffisant', label: 'Montant de garantie suffisant', critique: true },
  { key: 'dateEffet', label: 'Date d\'effet vérifiée', critique: true },
  { key: 'dateExpiration', label: 'Date d\'expiration vérifiée', critique: true },
  { key: 'franchiseIdentifiee', label: 'Franchise identifiée', critique: false },
  { key: 'exclusionsVerifiees', label: 'Exclusions analysées', critique: false },
  { key: 'declarationSinistre', label: 'Procédure déclaration sinistre connue', critique: false }
];

// Checklist pièces à demander
export const CHECKLIST_PIECES_TYPE = [
  { categorie: 'Contrats', pieces: ['Contrat de construction', 'CCMI', 'Marché de travaux', 'Contrat architecte', 'Contrat MOE'] },
  { categorie: 'Assurances', pieces: ['Attestation DO', 'Attestation RCD constructeur', 'RC Pro architecte', 'PV réception'] },
  { categorie: 'Technique', pieces: ['Permis de construire', 'Plans d\'exécution', 'Étude de sol', 'CCTP', 'Rapport bureau contrôle'] },
  { categorie: 'Financier', pieces: ['Devis travaux', 'Factures', 'Situations de travaux', 'DGD'] },
  { categorie: 'Correspondances', pieces: ['Mises en demeure', 'Courriers de réclamation', 'Échanges avec constructeur', 'PV de chantier'] },
  { categorie: 'Constats', pieces: ['Constats huissier', 'Rapports expertise amiable', 'Photos datées', 'Vidéos'] }
];

// OPALEXE
export const OPALEXE_DOCUMENTS = [
  { type: 'rapport', label: 'Rapport d\'expertise', format: 'PDF/A', obligatoire: true, tailleMax: '50 Mo' },
  { type: 'annexes', label: 'Annexes numérotées', format: 'PDF/A', obligatoire: true, tailleMax: '100 Mo' },
  { type: 'photos', label: 'Dossier photographique', format: 'JPEG/PDF', obligatoire: false, tailleMax: '200 Mo' },
  { type: 'plans', label: 'Plans et croquis', format: 'PDF/A', obligatoire: false, tailleMax: '50 Mo' },
  { type: 'devis', label: 'Devis et chiffrages', format: 'PDF/A', obligatoire: false, tailleMax: '20 Mo' },
  { type: 'correspondances', label: 'Correspondances', format: 'PDF/A', obligatoire: false, tailleMax: '50 Mo' }
];

export const OPALEXE_CHECKLIST = [
  { key: 'formatPDFA', label: 'Format PDF/A respecté', critique: true },
  { key: 'signatureElectronique', label: 'Signature électronique', critique: true },
  { key: 'horodatage', label: 'Horodatage certifié', critique: true },
  { key: 'nomFichiers', label: 'Nomenclature fichiers respectée', critique: true },
  { key: 'tailleRespectee', label: 'Taille fichiers conforme', critique: true },
  { key: 'annexesNumerotees', label: 'Annexes numérotées', critique: false },
  { key: 'accuseDepot', label: 'Accusé de dépôt obtenu', critique: true }
];

// Étapes conciliation
export const CONCILIATION_ETAPES = [
  { id: 'proposition', label: 'Proposition de conciliation', article: 'Art. 240 CPC' },
  { id: 'accord', label: 'Accord des parties', article: 'Art. 240 CPC' },
  { id: 'reunion', label: 'Réunion de conciliation', article: 'Art. 240 CPC' },
  { id: 'protocole', label: 'Rédaction protocole', article: 'Art. 240 CPC' },
  { id: 'signature', label: 'Signature des parties', article: 'Art. 2044 CC' },
  { id: 'homologation', label: 'Homologation judiciaire', article: 'Art. 1565 CPC' }
];

// Référé préventif
export const REFERE_PREVENTIF_ELEMENTS = [
  { categorie: 'Structure', elements: ['Fondations visibles', 'Murs porteurs', 'Planchers', 'Charpente', 'Toiture'] },
  { categorie: 'Façades', elements: ['Enduits', 'Fissures existantes', 'Joints', 'Modénatures', 'Balcons'] },
  { categorie: 'Intérieurs', elements: ['Revêtements sols', 'Revêtements muraux', 'Plafonds', 'Menuiseries', 'Équipements'] },
  { categorie: 'Réseaux', elements: ['Canalisations', 'Électricité', 'Chauffage', 'VMC', 'Assainissement'] },
  { categorie: 'Extérieurs', elements: ['Clôtures', 'Voiries', 'Espaces verts', 'Réseaux enterrés', 'Mitoyennetés'] }
];

// Paramètres suivi évolutif
export const EVOLUTIF_PARAMETRES = [
  { id: 'fissures', label: 'Fissures', unite: 'mm', seuils: { alerte: 0.3, critique: 1 }, methode: 'Fissuromètre/Jauge' },
  { id: 'humidite', label: 'Taux d\'humidité', unite: '%', seuils: { alerte: 60, critique: 80 }, methode: 'Hygromètre' },
  { id: 'deformation', label: 'Déformation', unite: 'mm', seuils: { alerte: 5, critique: 15 }, methode: 'Niveau optique' },
  { id: 'temperature', label: 'Température', unite: '°C', seuils: { alerte: 25, critique: 35 }, methode: 'Thermomètre IR' },
  { id: 'inclinaison', label: 'Inclinaison', unite: '°', seuils: { alerte: 0.5, critique: 1 }, methode: 'Inclinomètre' },
  { id: 'tassement', label: 'Tassement', unite: 'mm', seuils: { alerte: 10, critique: 25 }, methode: 'Nivellement' }
];
