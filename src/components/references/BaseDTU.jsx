// ============================================================================
// CRM EXPERT JUDICIAIRE - BASE DTU (Documents Techniques Unifiés)
// Référentiel des normes de construction pour expertise BTP
// ============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import {
  Book, Search, Filter, Star, StarOff, ExternalLink, Copy,
  FileText, ChevronDown, ChevronUp, Bookmark, BookOpen,
  Building, Droplets, Flame, Wind, Zap, Shield, Layers,
  Home, CheckCircle, AlertTriangle, Info
} from 'lucide-react';
import { Card, Badge, Button, Input, ModalBase, EmptyState } from '../ui';

// ============================================================================
// BASE DE DONNÉES DTU
// ============================================================================

export const DTU_DATABASE = [
  // ===== GROS ŒUVRE =====
  {
    id: 'dtu-13.11',
    numero: 'DTU 13.11',
    titre: 'Fondations superficielles',
    categorie: 'gros-oeuvre',
    domaine: 'Fondations',
    description: 'Règles de conception et de mise en œuvre des fondations superficielles (semelles filantes, isolées, radiers).',
    mots_cles: ['fondations', 'semelles', 'radier', 'béton', 'ferraillage', 'sol', 'tassement'],
    articles_cles: [
      { ref: '3.1', titre: 'Reconnaissance des sols', contenu: 'Une étude géotechnique doit être réalisée avant tout projet de fondation.' },
      { ref: '4.2', titre: 'Profondeur hors gel', contenu: 'La profondeur minimale des fondations doit être hors gel (60 à 90 cm selon zone climatique).' },
      { ref: '5.3', titre: 'Ferraillage minimum', contenu: 'Section minimale des armatures selon les sollicitations et la classe d\'exposition.' }
    ],
    version: 'Septembre 2019',
    norme_europeenne: 'NF EN 1997-1 (Eurocode 7)'
  },
  {
    id: 'dtu-13.12',
    numero: 'DTU 13.12',
    titre: 'Fondations profondes',
    categorie: 'gros-oeuvre',
    domaine: 'Fondations',
    description: 'Règles pour les pieux, micropieux et barrettes.',
    mots_cles: ['pieux', 'micropieux', 'barrettes', 'fondations profondes', 'sol', 'portance'],
    articles_cles: [
      { ref: '2.1', titre: 'Choix du type de pieu', contenu: 'Le type de pieu dépend de la nature du sol, des charges et de l\'environnement.' }
    ],
    version: 'Octobre 2021',
    norme_europeenne: 'NF EN 1997-1'
  },
  {
    id: 'dtu-13.3',
    numero: 'DTU 13.3',
    titre: 'Dallages',
    categorie: 'gros-oeuvre',
    domaine: 'Fondations',
    description: 'Conception, calcul et exécution des dallages en béton.',
    mots_cles: ['dallage', 'béton', 'joints', 'retrait', 'fissures', 'sol', 'portance'],
    articles_cles: [
      { ref: '5.1', titre: 'Joints de retrait', contenu: 'Les joints doivent être espacés de 25 à 30 fois l\'épaisseur du dallage (max 6m).' },
      { ref: '6.2', titre: 'Épaisseur minimale', contenu: 'Épaisseur minimale de 12 cm pour un dallage courant, 15 cm si circulation lourde.' }
    ],
    version: 'Mars 2012',
    norme_europeenne: 'NF EN 1992-1-1'
  },
  {
    id: 'dtu-20.1',
    numero: 'DTU 20.1',
    titre: 'Ouvrages en maçonnerie de petits éléments',
    categorie: 'gros-oeuvre',
    domaine: 'Maçonnerie',
    description: 'Parois et murs en maçonnerie de petits éléments (briques, blocs béton, pierres).',
    mots_cles: ['maçonnerie', 'briques', 'parpaings', 'blocs', 'mur', 'chaînage', 'joints'],
    articles_cles: [
      { ref: '3.2', titre: 'Chaînages', contenu: 'Chaînages horizontaux obligatoires à chaque plancher et verticaux aux angles et baies.' },
      { ref: '4.1', titre: 'Épaisseur des joints', contenu: 'Joints horizontaux de 10 à 15 mm, joints verticaux de 10 à 20 mm.' },
      { ref: '5.4', titre: 'Hauteur maximale', contenu: 'Hauteur maximale journalière de montage : 1,50 m.' }
    ],
    version: 'Octobre 2008 + Amendement 2013',
    norme_europeenne: 'NF EN 1996-1-1 (Eurocode 6)'
  },
  {
    id: 'dtu-21',
    numero: 'DTU 21',
    titre: 'Exécution des ouvrages en béton',
    categorie: 'gros-oeuvre',
    domaine: 'Béton',
    description: 'Règles d\'exécution des ouvrages en béton armé et précontraint.',
    mots_cles: ['béton', 'armatures', 'coffrage', 'cure', 'enrobage', 'vibration'],
    articles_cles: [
      { ref: '4.5', titre: 'Enrobage des armatures', contenu: 'Enrobage minimum selon classe d\'exposition (20 à 55 mm).' },
      { ref: '5.3', titre: 'Cure du béton', contenu: 'Protection contre la dessiccation pendant au moins 3 jours.' },
      { ref: '6.1', titre: 'Décoffrage', contenu: 'Délai minimum de décoffrage selon température et type de ciment.' }
    ],
    version: 'Mars 2017',
    norme_europeenne: 'NF EN 13670'
  },
  {
    id: 'dtu-23.1',
    numero: 'DTU 23.1',
    titre: 'Murs en béton banché',
    categorie: 'gros-oeuvre',
    domaine: 'Béton',
    description: 'Murs en béton coulé en place (banché).',
    mots_cles: ['béton banché', 'mur', 'coffrage', 'voile', 'armatures'],
    articles_cles: [
      { ref: '3.2', titre: 'Épaisseur minimale', contenu: 'Épaisseur minimale de 15 cm pour mur porteur.' }
    ],
    version: 'Février 1990 + Amendements',
    norme_europeenne: 'NF EN 1992-1-1'
  },

  // ===== ÉTANCHÉITÉ =====
  {
    id: 'dtu-20.12',
    numero: 'DTU 20.12',
    titre: 'Conception du gros œuvre en maçonnerie des toitures destinées à recevoir un revêtement d\'étanchéité',
    categorie: 'etancheite',
    domaine: 'Toitures-terrasses',
    description: 'Conception des supports maçonnés pour toitures-terrasses.',
    mots_cles: ['toiture-terrasse', 'support', 'pente', 'étanchéité', 'relevés'],
    articles_cles: [
      { ref: '2.1', titre: 'Pente minimale', contenu: 'Pente minimale de 1% (1 cm/m) vers les évacuations d\'eau.' }
    ],
    version: 'Septembre 1993',
    norme_europeenne: ''
  },
  {
    id: 'dtu-43.1',
    numero: 'DTU 43.1',
    titre: 'Étanchéité des toitures-terrasses avec éléments porteurs en maçonnerie',
    categorie: 'etancheite',
    domaine: 'Toitures-terrasses',
    description: 'Travaux d\'étanchéité des toitures-terrasses sur support maçonné.',
    mots_cles: ['étanchéité', 'toiture-terrasse', 'membrane', 'relevés', 'évacuation', 'isolation'],
    articles_cles: [
      { ref: '5.2', titre: 'Hauteur des relevés', contenu: 'Hauteur minimale des relevés d\'étanchéité : 15 cm au-dessus de la protection.' },
      { ref: '6.1', titre: 'Évacuations', contenu: 'Une évacuation pour 200 m² de surface avec entrée d\'eau de sécurité (trop-plein).' }
    ],
    version: 'Novembre 2012',
    norme_europeenne: 'NF EN 13956'
  },
  {
    id: 'dtu-43.3',
    numero: 'DTU 43.3',
    titre: 'Mise en œuvre des toitures en tôles d\'acier nervurées avec revêtement d\'étanchéité',
    categorie: 'etancheite',
    domaine: 'Toitures métalliques',
    description: 'Étanchéité sur bacs acier.',
    mots_cles: ['bac acier', 'étanchéité', 'isolation', 'pare-vapeur'],
    articles_cles: [],
    version: 'Août 2017',
    norme_europeenne: ''
  },
  {
    id: 'dtu-14.1',
    numero: 'DTU 14.1',
    titre: 'Cuvelage',
    categorie: 'etancheite',
    domaine: 'Ouvrages enterrés',
    description: 'Travaux de cuvelage des locaux enterrés (sous-sols, parkings).',
    mots_cles: ['cuvelage', 'sous-sol', 'imperméabilisation', 'nappe phréatique', 'infiltration'],
    articles_cles: [
      { ref: '2.3', titre: 'Types de cuvelage', contenu: 'Type A (étanche), Type B (drainé), Type C (chemise drainante).' }
    ],
    version: 'Mai 2000',
    norme_europeenne: 'NF EN 1504'
  },

  // ===== COUVERTURE =====
  {
    id: 'dtu-40.11',
    numero: 'DTU 40.11',
    titre: 'Couverture en ardoises',
    categorie: 'couverture',
    domaine: 'Couvertures',
    description: 'Mise en œuvre des couvertures en ardoises naturelles.',
    mots_cles: ['ardoise', 'couverture', 'pente', 'recouvrement', 'crochet'],
    articles_cles: [
      { ref: '3.1', titre: 'Pente minimale', contenu: 'Pente minimale selon zone climatique et exposition (généralement 40%).' }
    ],
    version: 'Février 2018',
    norme_europeenne: 'NF EN 12326'
  },
  {
    id: 'dtu-40.21',
    numero: 'DTU 40.21',
    titre: 'Couverture en tuiles de terre cuite à emboîtement',
    categorie: 'couverture',
    domaine: 'Couvertures',
    description: 'Pose des tuiles à emboîtement (tuiles mécaniques).',
    mots_cles: ['tuiles', 'terre cuite', 'couverture', 'pente', 'ventilation', 'liteaux'],
    articles_cles: [
      { ref: '4.2', titre: 'Pente minimale', contenu: 'Pente minimale selon modèle de tuile et zone (généralement 22 à 35%).' },
      { ref: '5.1', titre: 'Ventilation', contenu: 'Section de ventilation : 1/3000e de la surface de couverture en partie basse et haute.' }
    ],
    version: 'Mai 2014',
    norme_europeenne: 'NF EN 1304'
  },
  {
    id: 'dtu-40.24',
    numero: 'DTU 40.24',
    titre: 'Couverture en tuiles en béton à glissement',
    categorie: 'couverture',
    domaine: 'Couvertures',
    description: 'Pose des tuiles béton.',
    mots_cles: ['tuiles béton', 'couverture', 'pente'],
    articles_cles: [],
    version: 'Mai 2014',
    norme_europeenne: 'NF EN 490'
  },
  {
    id: 'dtu-40.35',
    numero: 'DTU 40.35',
    titre: 'Couverture en plaques nervurées issues de tôles d\'acier revêtues',
    categorie: 'couverture',
    domaine: 'Couvertures métalliques',
    description: 'Bacs acier en couverture.',
    mots_cles: ['bac acier', 'couverture', 'pente', 'nervures', 'fixation'],
    articles_cles: [
      { ref: '3.2', titre: 'Pente minimale', contenu: 'Pente minimale de 5% (7% en zone très exposée).' }
    ],
    version: 'Décembre 2013',
    norme_europeenne: 'NF EN 14782'
  },
  {
    id: 'dtu-40.41',
    numero: 'DTU 40.41',
    titre: 'Couverture par éléments métalliques en feuilles et longues feuilles de zinc',
    categorie: 'couverture',
    domaine: 'Couvertures métalliques',
    description: 'Couverture zinc à joints debout.',
    mots_cles: ['zinc', 'couverture', 'joint debout', 'tasseaux', 'dilatation'],
    articles_cles: [
      { ref: '2.3', titre: 'Pente minimale', contenu: 'Pente minimale de 5% pour joint debout, 20% pour tasseaux.' }
    ],
    version: 'Juillet 2012',
    norme_europeenne: 'NF EN 988'
  },

  // ===== MENUISERIES =====
  {
    id: 'dtu-36.5',
    numero: 'DTU 36.5',
    titre: 'Mise en œuvre des fenêtres et portes extérieures',
    categorie: 'menuiseries',
    domaine: 'Menuiseries extérieures',
    description: 'Pose des menuiseries extérieures (fenêtres, portes, baies vitrées).',
    mots_cles: ['fenêtre', 'porte', 'menuiserie', 'calfeutrement', 'étanchéité', 'AEV'],
    articles_cles: [
      { ref: '4.1', titre: 'Jeu de pose', contenu: 'Jeu périphérique de 5 à 15 mm selon matériau et dimensions.' },
      { ref: '5.2', titre: 'Calfeutrement', contenu: 'Mastic ou mousse PU avec fond de joint. Étanchéité air et eau obligatoire.' },
      { ref: '6.1', titre: 'Classement AEV', contenu: 'Classement Air-Eau-Vent selon exposition du bâtiment.' }
    ],
    version: 'Décembre 2010',
    norme_europeenne: 'NF EN 14351-1'
  },
  {
    id: 'dtu-39',
    numero: 'DTU 39',
    titre: 'Travaux de vitrerie-miroiterie',
    categorie: 'menuiseries',
    domaine: 'Vitrerie',
    description: 'Mise en œuvre des vitrages.',
    mots_cles: ['vitrage', 'double vitrage', 'calage', 'mastic', 'sécurité'],
    articles_cles: [
      { ref: '3.4', titre: 'Calage', contenu: 'Calage obligatoire par cales d\'assise et cales périphériques.' },
      { ref: '4.2', titre: 'Jeu de dilatation', contenu: 'Jeu de 3 à 5 mm selon dimensions du vitrage.' }
    ],
    version: 'Octobre 2017',
    norme_europeenne: 'NF EN 12488'
  },
  {
    id: 'dtu-37.1',
    numero: 'DTU 37.1',
    titre: 'Menuiseries métalliques',
    categorie: 'menuiseries',
    domaine: 'Menuiseries métalliques',
    description: 'Pose des menuiseries en aluminium et acier.',
    mots_cles: ['aluminium', 'acier', 'menuiserie', 'rupture thermique'],
    articles_cles: [],
    version: 'Novembre 2018',
    norme_europeenne: 'NF EN 14351-1'
  },

  // ===== REVÊTEMENTS DE SOL =====
  {
    id: 'dtu-52.1',
    numero: 'DTU 52.1',
    titre: 'Revêtements de sol scellés',
    categorie: 'revetements',
    domaine: 'Sols',
    description: 'Pose scellée de carrelage et dallage.',
    mots_cles: ['carrelage', 'scellé', 'mortier', 'joints', 'pente', 'chape'],
    articles_cles: [
      { ref: '5.2', titre: 'Épaisseur mortier', contenu: 'Épaisseur du mortier de pose : 20 à 40 mm.' },
      { ref: '6.1', titre: 'Joints de fractionnement', contenu: 'Tous les 60 m² maximum ou 8 m linéaires.' },
      { ref: '6.3', titre: 'Pente locaux humides', contenu: 'Pente de 1 à 2% vers évacuation en locaux humides.' }
    ],
    version: 'Décembre 2010',
    norme_europeenne: ''
  },
  {
    id: 'dtu-52.2',
    numero: 'DTU 52.2',
    titre: 'Pose collée des revêtements céramiques et assimilés',
    categorie: 'revetements',
    domaine: 'Sols',
    description: 'Pose collée de carrelage.',
    mots_cles: ['carrelage', 'collage', 'mortier-colle', 'primaire', 'joints'],
    articles_cles: [
      { ref: '4.1', titre: 'Simple/double encollage', contenu: 'Double encollage obligatoire pour formats > 900 cm² ou supports chauffants.' },
      { ref: '5.2', titre: 'Temps ouvert', contenu: 'Respect du temps ouvert de la colle (10 à 30 min selon produit).' }
    ],
    version: 'Avril 2019',
    norme_europeenne: 'NF EN 12004'
  },
  {
    id: 'dtu-51.3',
    numero: 'DTU 51.3',
    titre: 'Planchers en bois ou en panneaux dérivés du bois',
    categorie: 'revetements',
    domaine: 'Sols',
    description: 'Planchers et parquets sur solives.',
    mots_cles: ['parquet', 'plancher', 'bois', 'solives', 'lambourdes'],
    articles_cles: [
      { ref: '3.1', titre: 'Humidité du bois', contenu: 'Humidité du bois à la pose : 7 à 11% (selon usage).' }
    ],
    version: 'Novembre 2004',
    norme_europeenne: ''
  },
  {
    id: 'dtu-53.2',
    numero: 'DTU 53.2',
    titre: 'Revêtements de sol PVC collés',
    categorie: 'revetements',
    domaine: 'Sols',
    description: 'Pose des revêtements PVC.',
    mots_cles: ['PVC', 'lino', 'revêtement souple', 'ragréage', 'colle'],
    articles_cles: [
      { ref: '3.2', titre: 'Humidité support', contenu: 'Taux d\'humidité du support < 4,5% (test bombe carbure).' }
    ],
    version: 'Juin 2019',
    norme_europeenne: 'NF EN 14041'
  },

  // ===== PLÂTRERIE =====
  {
    id: 'dtu-25.1',
    numero: 'DTU 25.1',
    titre: 'Enduits intérieurs en plâtre',
    categorie: 'platerie',
    domaine: 'Plâtrerie',
    description: 'Enduits plâtre sur maçonnerie et béton.',
    mots_cles: ['plâtre', 'enduit', 'gobetis', 'finition', 'épaisseur'],
    articles_cles: [
      { ref: '4.1', titre: 'Épaisseur', contenu: 'Épaisseur minimale : 10 mm, maximale : 20 mm en une passe.' }
    ],
    version: 'Août 2010',
    norme_europeenne: 'NF EN 13914-2'
  },
  {
    id: 'dtu-25.41',
    numero: 'DTU 25.41',
    titre: 'Ouvrages en plaques de plâtre',
    categorie: 'platerie',
    domaine: 'Plâtrerie',
    description: 'Cloisons, doublages et plafonds en plaques de plâtre.',
    mots_cles: ['plaque de plâtre', 'BA13', 'cloison', 'doublage', 'plafond', 'ossature'],
    articles_cles: [
      { ref: '5.1', titre: 'Entraxe ossature', contenu: 'Entraxe maximal des montants : 60 cm (cloison) ou 40 cm (plafond).' },
      { ref: '6.2', titre: 'Vis de fixation', contenu: 'Vis tous les 30 cm maximum, à 10 mm des bords.' },
      { ref: '7.1', titre: 'Joints', contenu: 'Traitement obligatoire des joints avec bande et enduit.' }
    ],
    version: 'Décembre 2012',
    norme_europeenne: 'NF EN 520'
  },
  {
    id: 'dtu-25.42',
    numero: 'DTU 25.42',
    titre: 'Ouvrages de doublage et habillage en complexes et sandwiches plaques de plâtre-isolants',
    categorie: 'platerie',
    domaine: 'Isolation',
    description: 'Doublages isolants collés.',
    mots_cles: ['doublage', 'isolation', 'PSE', 'laine minérale', 'collage', 'plots'],
    articles_cles: [
      { ref: '3.1', titre: 'Plots de colle', contenu: 'Plots de colle répartis régulièrement (au moins 10 par m²).' }
    ],
    version: 'Mai 2012',
    norme_europeenne: ''
  },

  // ===== PEINTURE =====
  {
    id: 'dtu-59.1',
    numero: 'DTU 59.1',
    titre: 'Peinturage',
    categorie: 'peinture',
    domaine: 'Peinture',
    description: 'Travaux de peinture sur tous supports.',
    mots_cles: ['peinture', 'impression', 'finition', 'support', 'préparation'],
    articles_cles: [
      { ref: '4.1', titre: 'Préparation support', contenu: 'Égrenage, dépoussiérage, impression obligatoires.' },
      { ref: '5.2', titre: 'Nombre de couches', contenu: 'Minimum 2 couches de finition après impression.' }
    ],
    version: 'Octobre 2013',
    norme_europeenne: ''
  },

  // ===== PLOMBERIE =====
  {
    id: 'dtu-60.1',
    numero: 'DTU 60.1',
    titre: 'Plomberie sanitaire pour bâtiments',
    categorie: 'plomberie',
    domaine: 'Plomberie',
    description: 'Installation de plomberie sanitaire.',
    mots_cles: ['plomberie', 'eau', 'évacuation', 'ventilation', 'siphon', 'pente'],
    articles_cles: [
      { ref: '3.1', titre: 'Pente évacuations', contenu: 'Pente minimale des évacuations : 1 cm/m (1%).' },
      { ref: '4.2', titre: 'Ventilation', contenu: 'Ventilation primaire obligatoire (sortie en toiture).' },
      { ref: '5.1', titre: 'Diamètres', contenu: 'Diamètres minimaux selon appareils (WC : Ø100, lavabo : Ø32-40).' }
    ],
    version: 'Décembre 2012',
    norme_europeenne: 'NF EN 12056'
  },
  {
    id: 'dtu-60.11',
    numero: 'DTU 60.11',
    titre: 'Règles de calcul des installations de plomberie sanitaire',
    categorie: 'plomberie',
    domaine: 'Plomberie',
    description: 'Dimensionnement des installations.',
    mots_cles: ['calcul', 'dimensionnement', 'débit', 'pression', 'diamètre'],
    articles_cles: [],
    version: 'Août 2013',
    norme_europeenne: ''
  },

  // ===== CHAUFFAGE / THERMIQUE =====
  {
    id: 'dtu-65.14',
    numero: 'DTU 65.14',
    titre: 'Exécution des planchers chauffants à eau chaude',
    categorie: 'chauffage',
    domaine: 'Chauffage',
    description: 'Installation de planchers chauffants hydrauliques.',
    mots_cles: ['plancher chauffant', 'eau chaude', 'tubes', 'chape', 'isolation'],
    articles_cles: [
      { ref: '4.1', titre: 'Isolation sous plancher', contenu: 'Résistance thermique minimale selon configuration (R ≥ 0,75 à 2 m².K/W).' },
      { ref: '5.2', titre: 'Température de surface', contenu: 'Température de surface maximale : 28°C (zones de vie), 33°C (salles de bains).' }
    ],
    version: 'Octobre 2006',
    norme_europeenne: 'NF EN 1264'
  },

  // ===== ÉLECTRICITÉ =====
  {
    id: 'nfc-15-100',
    numero: 'NF C 15-100',
    titre: 'Installations électriques à basse tension',
    categorie: 'electricite',
    domaine: 'Électricité',
    description: 'Règles de conception et de réalisation des installations électriques.',
    mots_cles: ['électricité', 'tableau', 'disjoncteur', 'prise', 'éclairage', 'terre'],
    articles_cles: [
      { ref: '10.1', titre: 'Protection différentielle', contenu: 'DDR 30mA obligatoire sur tous les circuits.' },
      { ref: '11.2', titre: 'Nombre de prises', contenu: 'Nombre minimum de prises par pièce selon surface.' },
      { ref: '7.1', titre: 'Volumes salle de bain', contenu: 'Définition des volumes 0, 1, 2 et hors volume.' }
    ],
    version: 'Décembre 2002 + Amendements 2015, 2017',
    norme_europeenne: 'NF EN 60364'
  }
];

// ============================================================================
// CATÉGORIES DTU
// ============================================================================

export const CATEGORIES_DTU = [
  { id: 'gros-oeuvre', label: 'Gros œuvre', icon: Building, color: 'bg-gray-500' },
  { id: 'etancheite', label: 'Étanchéité', icon: Droplets, color: 'bg-blue-500' },
  { id: 'couverture', label: 'Couverture', icon: Home, color: 'bg-amber-500' },
  { id: 'menuiseries', label: 'Menuiseries', icon: Layers, color: 'bg-green-500' },
  { id: 'revetements', label: 'Revêtements', icon: Layers, color: 'bg-purple-500' },
  { id: 'platerie', label: 'Plâtrerie', icon: Layers, color: 'bg-pink-500' },
  { id: 'peinture', label: 'Peinture', icon: Layers, color: 'bg-yellow-500' },
  { id: 'plomberie', label: 'Plomberie', icon: Droplets, color: 'bg-cyan-500' },
  { id: 'chauffage', label: 'Chauffage', icon: Flame, color: 'bg-red-500' },
  { id: 'electricite', label: 'Électricité', icon: Zap, color: 'bg-orange-500' }
];

// ============================================================================
// COMPOSANT PRINCIPAL - BASE DTU
// ============================================================================

export const BaseDTU = ({ onSelectDTU, onCiteArticle }) => {
  const [search, setSearch] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('all');
  const [favoris, setFavoris] = useState(() => {
    const saved = localStorage.getItem('dtu_favoris');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedDTU, setSelectedDTU] = useState(null);
  const [showOnlyFavoris, setShowOnlyFavoris] = useState(false);

  // Filtrer les DTU
  const dtuFiltres = useMemo(() => {
    return DTU_DATABASE.filter(dtu => {
      const matchSearch = search === '' ||
        dtu.numero.toLowerCase().includes(search.toLowerCase()) ||
        dtu.titre.toLowerCase().includes(search.toLowerCase()) ||
        dtu.description.toLowerCase().includes(search.toLowerCase()) ||
        dtu.mots_cles.some(mot => mot.toLowerCase().includes(search.toLowerCase()));

      const matchCategorie = filterCategorie === 'all' || dtu.categorie === filterCategorie;
      const matchFavoris = !showOnlyFavoris || favoris.includes(dtu.id);

      return matchSearch && matchCategorie && matchFavoris;
    });
  }, [search, filterCategorie, showOnlyFavoris, favoris]);

  // Grouper par catégorie
  const dtuParCategorie = useMemo(() => {
    const grouped = {};
    dtuFiltres.forEach(dtu => {
      if (!grouped[dtu.categorie]) grouped[dtu.categorie] = [];
      grouped[dtu.categorie].push(dtu);
    });
    return grouped;
  }, [dtuFiltres]);

  // Toggle favori
  const toggleFavori = useCallback((dtuId) => {
    setFavoris(prev => {
      const newFavoris = prev.includes(dtuId)
        ? prev.filter(id => id !== dtuId)
        : [...prev, dtuId];
      localStorage.setItem('dtu_favoris', JSON.stringify(newFavoris));
      return newFavoris;
    });
  }, []);

  // Copier une référence
  const copierReference = useCallback((dtu, article = null) => {
    let ref = `${dtu.numero} - ${dtu.titre}`;
    if (article) {
      ref += ` (Art. ${article.ref} : ${article.titre})`;
    }
    navigator.clipboard.writeText(ref);
  }, []);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light text-[#1a1a1a] flex items-center gap-2">
            <Book className="w-6 h-6 text-[#c9a227]" />
            Base DTU
          </h2>
          <p className="text-[#737373]">
            {DTU_DATABASE.length} documents techniques unifiés
          </p>
        </div>
        <Button
          variant={showOnlyFavoris ? 'primary' : 'secondary'}
          icon={showOnlyFavoris ? Star : StarOff}
          onClick={() => setShowOnlyFavoris(!showOnlyFavoris)}
        >
          Favoris ({favoris.length})
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
          <input
            type="text"
            placeholder="Rechercher par numéro, titre ou mot-clé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
          />
        </div>
        <select
          value={filterCategorie}
          onChange={(e) => setFilterCategorie(e.target.value)}
          className="px-4 py-3 border border-[#e5e5e5] rounded-xl focus:outline-none focus:border-[#c9a227]"
        >
          <option value="all">Toutes catégories</option>
          {CATEGORIES_DTU.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Résultats */}
      {dtuFiltres.length === 0 ? (
        <EmptyState
          icon={Book}
          title="Aucun DTU trouvé"
          description="Modifiez vos critères de recherche"
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(dtuParCategorie).map(([categorie, dtus]) => {
            const catInfo = CATEGORIES_DTU.find(c => c.id === categorie);
            const CatIcon = catInfo?.icon || Book;

            return (
              <div key={categorie}>
                <h3 className="font-medium text-[#1a1a1a] mb-3 flex items-center gap-2">
                  <span className={`w-6 h-6 ${catInfo?.color || 'bg-gray-500'} rounded flex items-center justify-center`}>
                    <CatIcon className="w-4 h-4 text-white" />
                  </span>
                  {catInfo?.label || categorie}
                  <Badge variant="default">{dtus.length}</Badge>
                </h3>

                <div className="space-y-2">
                  {dtus.map(dtu => (
                    <DTUCard
                      key={dtu.id}
                      dtu={dtu}
                      isFavori={favoris.includes(dtu.id)}
                      onToggleFavori={() => toggleFavori(dtu.id)}
                      onClick={() => setSelectedDTU(dtu)}
                      onCopy={() => copierReference(dtu)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal détail DTU */}
      {selectedDTU && (
        <ModalDTUDetail
          dtu={selectedDTU}
          isOpen={!!selectedDTU}
          onClose={() => setSelectedDTU(null)}
          onCiteArticle={onCiteArticle}
          onCopy={copierReference}
        />
      )}
    </div>
  );
};

// ============================================================================
// CARTE DTU
// ============================================================================

const DTUCard = ({ dtu, isFavori, onToggleFavori, onClick, onCopy }) => {
  return (
    <Card
      className="p-4 hover:border-[#c9a227] cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-medium text-[#c9a227]">
              {dtu.numero}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavori(); }}
              className="p-1 hover:bg-[#f5f5f5] rounded"
            >
              {isFavori ? (
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              ) : (
                <StarOff className="w-4 h-4 text-[#a3a3a3]" />
              )}
            </button>
          </div>
          <h4 className="font-medium text-[#1a1a1a] mb-1">{dtu.titre}</h4>
          <p className="text-sm text-[#737373] line-clamp-2">{dtu.description}</p>

          <div className="flex flex-wrap gap-1 mt-2">
            {dtu.mots_cles.slice(0, 4).map((mot, i) => (
              <Badge key={i} variant="default" className="text-xs">
                {mot}
              </Badge>
            ))}
            {dtu.mots_cles.length > 4 && (
              <Badge variant="default" className="text-xs">
                +{dtu.mots_cles.length - 4}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 ml-4">
          <Badge variant="info" className="text-xs">{dtu.version}</Badge>
          <button
            onClick={(e) => { e.stopPropagation(); onCopy(); }}
            className="p-2 hover:bg-[#f5f5f5] rounded-lg"
            title="Copier la référence"
          >
            <Copy className="w-4 h-4 text-[#737373]" />
          </button>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// MODAL DÉTAIL DTU
// ============================================================================

const ModalDTUDetail = ({ dtu, isOpen, onClose, onCiteArticle, onCopy }) => {
  const [showAllArticles, setShowAllArticles] = useState(false);

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={dtu.numero} size="lg">
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h3 className="text-lg font-medium text-[#1a1a1a]">{dtu.titre}</h3>
          <p className="text-[#737373] mt-1">{dtu.description}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="info">{dtu.version}</Badge>
            <Badge variant="default">{dtu.domaine}</Badge>
            {dtu.norme_europeenne && (
              <Badge variant="success">{dtu.norme_europeenne}</Badge>
            )}
          </div>
        </div>

        {/* Mots-clés */}
        <div>
          <h4 className="text-sm font-medium text-[#737373] uppercase mb-2">Mots-clés</h4>
          <div className="flex flex-wrap gap-2">
            {dtu.mots_cles.map((mot, i) => (
              <Badge key={i} variant="default">{mot}</Badge>
            ))}
          </div>
        </div>

        {/* Articles clés */}
        {dtu.articles_cles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-[#737373] uppercase">
                Articles clés
              </h4>
              {dtu.articles_cles.length > 3 && (
                <button
                  onClick={() => setShowAllArticles(!showAllArticles)}
                  className="text-sm text-[#c9a227] hover:underline"
                >
                  {showAllArticles ? 'Voir moins' : `Voir tous (${dtu.articles_cles.length})`}
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(showAllArticles ? dtu.articles_cles : dtu.articles_cles.slice(0, 3)).map((article, i) => (
                <div key={i} className="p-3 bg-[#fafafa] rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-sm font-medium text-[#c9a227]">
                        Art. {article.ref}
                      </span>
                      <span className="text-sm font-medium text-[#1a1a1a] ml-2">
                        {article.titre}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        onCopy(dtu, article);
                        onCiteArticle?.(`${dtu.numero} Art. ${article.ref} : ${article.contenu}`);
                      }}
                      className="p-1 hover:bg-[#e5e5e5] rounded"
                      title="Citer cet article"
                    >
                      <Copy className="w-4 h-4 text-[#737373]" />
                    </button>
                  </div>
                  <p className="text-sm text-[#525252] mt-1">{article.contenu}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
          <Button variant="secondary" icon={Copy} onClick={() => onCopy(dtu)} className="flex-1">
            Copier référence
          </Button>
          <Button variant="secondary" icon={ExternalLink} className="flex-1">
            Consulter en ligne
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

// ============================================================================
// WIDGET RECHERCHE DTU (compact)
// ============================================================================

export const DTUSearchWidget = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (query) => {
    setSearch(query);
    if (query.length >= 2) {
      const filtered = DTU_DATABASE.filter(dtu =>
        dtu.numero.toLowerCase().includes(query.toLowerCase()) ||
        dtu.titre.toLowerCase().includes(query.toLowerCase()) ||
        dtu.mots_cles.some(mot => mot.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5);
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Book className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher un DTU..."
          className="w-full pl-10 pr-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#c9a227]"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e5e5] rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map(dtu => (
            <button
              key={dtu.id}
              onClick={() => {
                onSelect?.(dtu);
                setSearch('');
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-[#fafafa] border-b border-[#f5f5f5] last:border-0"
            >
              <span className="font-mono text-sm text-[#c9a227]">{dtu.numero}</span>
              <p className="text-sm text-[#1a1a1a] truncate">{dtu.titre}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default BaseDTU;
