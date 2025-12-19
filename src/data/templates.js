// ============================================================================
// CRM EXPERT JUDICIAIRE - MODÈLES DOCUMENTS ET BIBLIOTHÈQUE PARAGRAPHES
// ============================================================================

// Modèles de documents
export const MODELES_DOCUMENTS = {
  convocation: {
    type: 'convocation',
    titre: 'Convocation à réunion d\'expertise',
    delaiMinimum: 8,
    envoi: 'LRAR',
    structure: [
      'En-tête expert (coordonnées, inscriptions)',
      'Références affaire (RG, juridiction)',
      'Objet : Convocation à réunion d\'expertise',
      'Destinataire (partie ou avocat)',
      'Date, heure, lieu de réunion',
      'Ordre du jour',
      'Documents à apporter',
      'Rappel contradictoire',
      'Signature expert'
    ]
  },
  demandePieces: {
    type: 'demande-pieces',
    titre: 'Demande de communication de pièces',
    delaiMinimum: 15,
    envoi: 'LRAR ou email avocat',
    structure: [
      'En-tête expert',
      'Références affaire',
      'Objet : Demande de pièces',
      'Liste des pièces demandées (numérotée)',
      'Délai de communication',
      'Rappel obligation de communication',
      'Signature expert'
    ]
  },
  compteRendu: {
    type: 'compte-rendu',
    titre: 'Compte-rendu de réunion d\'expertise',
    structure: [
      'En-tête et références',
      'Date et lieu de la réunion',
      'Liste des présents (avec qualité)',
      'Liste des absents/excusés',
      'Rappel de la mission',
      'Déroulement de la réunion',
      'Constatations effectuées',
      'Pièces remises/échangées',
      'Points soulevés par les parties',
      'Prochaines étapes',
      'Date prochaine réunion (si applicable)',
      'Signature expert'
    ]
  },
  feuillePresence: {
    type: 'feuille-presence',
    titre: 'Feuille de présence',
    structure: [
      'En-tête affaire',
      'Date et lieu',
      'Tableau : Nom | Qualité | Représentant | Signature',
      'Observations',
      'Heure début / Heure fin'
    ]
  },
  noteSynthese: {
    type: 'note-synthese',
    titre: 'Note de synthèse (Pré-rapport)',
    delaiObservations: 30,
    structure: [
      'Page de garde',
      'Rappel de la mission',
      'Parties en présence',
      'Chronologie des opérations',
      'Documents examinés',
      'Constatations',
      'Analyse technique',
      'Réponses aux questions de la mission',
      'Conclusions provisoires',
      'Mention : observations sous 30 jours'
    ]
  },
  rapportFinal: {
    type: 'rapport-final',
    titre: 'Rapport d\'expertise judiciaire',
    structure: [
      'Page de garde',
      'Sommaire',
      '1. Désignation et mission',
      '2. Parties et intervenants',
      '3. Chronologie des opérations',
      '4. Documents examinés',
      '5. Constatations',
      '6. Analyse technique',
      '7. Dires des parties et réponses',
      '8. Chiffrage des travaux',
      '9. Réponses à la mission',
      '10. Conclusions',
      'Annexes numérotées'
    ]
  },
  etatFrais: {
    type: 'etat-frais',
    titre: 'État de frais et honoraires',
    structure: [
      'En-tête expert',
      'Références affaire',
      'Récapitulatif vacations (date, durée, objet)',
      'Frais de déplacement',
      'Frais divers (courriers, copies...)',
      'Total HT',
      'TVA',
      'Total TTC',
      'Provision versée',
      'Solde à percevoir'
    ]
  }
};

// Bibliothèque de paragraphes types
export const BIBLIOTHEQUE_PARAGRAPHES = {
  descriptions: [
    {
      id: 'fissures-facade',
      titre: 'Fissures en façade',
      categorie: 'Désordres structurels',
      texte: `Lors de notre visite du [DATE], nous avons constaté la présence de fissures en façade [ORIENTATION]. Ces fissures, d'une ouverture de [X] mm, présentent un tracé [horizontal/vertical/oblique] et s'étendent sur une longueur de [X] ml. Elles traversent l'enduit et affectent [le support maçonné / sont superficielles].`
    },
    {
      id: 'infiltrations-toiture',
      titre: 'Infiltrations toiture',
      categorie: 'Étanchéité',
      texte: `Des traces d'infiltrations ont été relevées au niveau de [LOCALISATION]. Ces désordres se manifestent par [auréoles / coulures / moisissures / décollement de peinture]. L'origine probable est située au niveau de [la couverture / l'étanchéité terrasse / un point singulier].`
    },
    {
      id: 'humidite-remontees',
      titre: 'Remontées capillaires',
      categorie: 'Humidité',
      texte: `Les murs présentent des traces d'humidité sur une hauteur de [X] cm depuis le sol fini. Le taux d'humidité mesuré à l'hygromètre atteint [X]%. Ces désordres sont caractéristiques de remontées capillaires, favorisées par [l'absence de coupure de capillarité / un drainage déficient / un terrain argileux].`
    },
    {
      id: 'defaut-isolation',
      titre: 'Défaut d\'isolation thermique',
      categorie: 'Thermique',
      texte: `L'examen thermographique révèle des déperditions thermiques significatives au niveau de [LOCALISATION]. La résistance thermique mesurée/calculée de [X] m².K/W est inférieure aux exigences réglementaires de [RT2012/RE2020] qui imposent un minimum de [X] m².K/W.`
    },
    {
      id: 'malfacon-carrelage',
      titre: 'Malfaçon carrelage',
      categorie: 'Revêtements',
      texte: `Le carrelage présente les désordres suivants : [sonnant creux / fissuré / décollé / joints défectueux]. Le sondage au maillet révèle un taux de carreaux sonnant creux de [X]%, significativement supérieur au seuil de tolérance de 15% défini par le DTU 52.2.`
    },
    {
      id: 'defaut-menuiseries',
      titre: 'Défaut menuiseries',
      categorie: 'Menuiseries',
      texte: `Les menuiseries présentent les désordres suivants : [infiltrations d'air / infiltrations d'eau / défaut de fermeture / condensation]. Les performances AEV relevées ne correspondent pas aux exigences de la zone climatique définie par le DTU 36.5.`
    },
    {
      id: 'defaut-plomberie',
      titre: 'Défaut plomberie',
      categorie: 'Plomberie',
      texte: `L'installation de plomberie présente les anomalies suivantes : [fuite / pression insuffisante / évacuation défaillante / bruits hydrauliques]. Les diamètres et/ou pentes ne sont pas conformes aux prescriptions du DTU 60.1.`
    }
  ],
  conclusions: [
    {
      id: 'conclusion-decennale',
      titre: 'Conclusion garantie décennale',
      garantie: 'decennale',
      texte: `Au regard des constatations effectuées, les désordres affectant [OUVRAGE] compromettent [la solidité de l'ouvrage / rendent l'ouvrage impropre à sa destination]. Ces désordres relèvent de la garantie décennale au sens de l'article 1792 du Code Civil. La date de réception étant le [DATE], l'action est recevable jusqu'au [DATE+10ans].`
    },
    {
      id: 'conclusion-biennale',
      titre: 'Conclusion garantie biennale',
      garantie: 'biennale',
      texte: `Les désordres constatés affectent des éléments d'équipement dissociables au sens de l'article 1792-3 du Code Civil. La garantie de bon fonctionnement de deux ans trouve à s'appliquer. La date de réception étant le [DATE], l'action était recevable jusqu'au [DATE+2ans].`
    },
    {
      id: 'conclusion-gpa',
      titre: 'Conclusion garantie parfait achèvement',
      garantie: 'gpa',
      texte: `Les désordres signalés dans l'année suivant la réception relèvent de la garantie de parfait achèvement au sens de l'article 1792-6 du Code Civil. Le constructeur est tenu de réparer tous les désordres signalés par le maître d'ouvrage, soit par voie de réserves à la réception, soit par notification écrite.`
    },
    {
      id: 'conclusion-prescription',
      titre: 'Conclusion prescription acquise',
      garantie: 'prescription',
      texte: `L'action en garantie [décennale/biennale/de parfait achèvement] est prescrite. En effet, la réception de l'ouvrage ayant été prononcée le [DATE], le délai de [10 ans/2 ans/1 an] était expiré au [DATE] lors de l'assignation du [DATE ASSIGNATION].`
    }
  ],
  formules: [
    {
      id: 'rappel-mission',
      titre: 'Rappel de mission',
      texte: `Par ordonnance de référé en date du [DATE], Madame/Monsieur le Président du Tribunal Judiciaire de [VILLE] nous a désigné en qualité d'expert judiciaire avec la mission suivante : [MISSION]`
    },
    {
      id: 'respect-contradictoire',
      titre: 'Respect du contradictoire',
      texte: `Conformément aux dispositions de l'article 16 du Code de Procédure Civile, les opérations d'expertise se sont déroulées de manière contradictoire. Toutes les parties ont été régulièrement convoquées et ont pu faire valoir leurs observations.`
    },
    {
      id: 'reserve-competence',
      titre: 'Réserve de compétence',
      texte: `Le présent rapport est établi dans les limites de notre compétence technique. Les questions d'ordre juridique relèvent de l'appréciation souveraine du Tribunal.`
    },
    {
      id: 'serment',
      titre: 'Serment de l\'expert',
      texte: `Je soussigné, [NOM EXPERT], expert judiciaire inscrit sur la liste de la Cour d'Appel de [VILLE], certifie avoir accompli ma mission en conscience, avec objectivité et impartialité.`
    },
    {
      id: 'visa-pieces',
      titre: 'Visa des pièces',
      texte: `Les documents suivants ont été communiqués par les parties et examinés dans le cadre de la présente expertise : [LISTE PIÈCES]`
    }
  ],
  analyses: [
    {
      id: 'analyse-origine',
      titre: 'Analyse de l\'origine des désordres',
      texte: `L'origine des désordres constatés résulte de [défaut de conception / défaut d'exécution / défaut de matériaux / défaut d'entretien]. Cette analyse repose sur les constats suivants : [CONSTATS].`
    },
    {
      id: 'analyse-imputabilite',
      titre: 'Analyse de l\'imputabilité',
      texte: `Au regard des constatations et de l'analyse technique, les responsabilités s'établissent comme suit : [INTERVENANT 1] : [X]% pour [MOTIF], [INTERVENANT 2] : [X]% pour [MOTIF].`
    },
    {
      id: 'analyse-conformite-dtu',
      titre: 'Analyse de conformité DTU',
      texte: `L'ouvrage a été examiné au regard des prescriptions du DTU [NUMERO]. Les non-conformités suivantes ont été relevées : [NON-CONFORMITÉS]. Ces écarts constituent [un défaut d'exécution / une malfaçon] au sens des règles de l'art.`
    }
  ],
  chiffrage: [
    {
      id: 'intro-chiffrage',
      titre: 'Introduction chiffrage',
      texte: `Le chiffrage des travaux de reprise est établi sur la base des prix moyens constatés en [ANNÉE] dans la région [RÉGION], actualisés le cas échéant avec l'indice BT [CODE].`
    },
    {
      id: 'reserve-chiffrage',
      titre: 'Réserve sur le chiffrage',
      texte: `Ce chiffrage est donné à titre indicatif et ne constitue pas un devis. Les montants définitifs ne pourront être établis qu'après consultation d'entreprises qualifiées.`
    }
  ]
};

// Frais types
export const FRAIS_TYPE = [
  { code: 'LRAR', label: 'Lettre recommandée AR', montant: 6.50 },
  { code: 'COPIES', label: 'Copies et impressions', montant: 0.20, unite: 'page' },
  { code: 'PHOTOS', label: 'Développement photos', montant: 0.50, unite: 'photo' },
  { code: 'RELIURE', label: 'Reliure rapport', montant: 15.00 },
  { code: 'SAPITEUR', label: 'Honoraires sapiteur', montant: null },
  { code: 'LABO', label: 'Analyses laboratoire', montant: null },
  { code: 'HUISSIER', label: 'Constat huissier', montant: null },
  { code: 'DIVERS', label: 'Frais divers', montant: null }
];

// Catégories photos
export const CATEGORIES_PHOTOS = [
  { id: 'vue-generale', label: 'Vue générale', obligatoire: true },
  { id: 'facade', label: 'Façades', obligatoire: true },
  { id: 'desordre', label: 'Désordres', obligatoire: true },
  { id: 'detail', label: 'Détails', obligatoire: false },
  { id: 'mesure', label: 'Mesures', obligatoire: false },
  { id: 'contexte', label: 'Contexte/Environnement', obligatoire: false }
];
