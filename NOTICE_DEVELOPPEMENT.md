# 🏛️ CRM EXPERT JUDICIAIRE BTP - NOTICE DE DÉVELOPPEMENT

> **Vision** : Créer l'outil **game changer** pour les experts judiciaires BTP en France.
> Un CRM qui pense comme un expert, anticipe ses besoins, et lui fait gagner des heures sur chaque dossier.

---

## Table des matières

1. [Analyse du métier](#1-analyse-du-métier)
2. [Architecture fonctionnelle](#2-architecture-fonctionnelle)
3. [Fonctionnalités détaillées](#3-fonctionnalités-détaillées)
4. [Roadmap développement](#4-roadmap-développement)
5. [Stack technique](#5-stack-technique)
6. [Critères de succès](#6-critères-de-succès)

---

## 1. ANALYSE DU MÉTIER

### 1.1 Workflow d'une expertise judiciaire

```
PHASE 1: DÉSIGNATION (J+0 à J+8)
├─ Réception ordonnance du juge
├─ Délai 8 jours pour accepter (Art. 267 CPC)
└─ Réponse: Accepter / Refuser / Récusation

PHASE 2: PRÉPARATION (J+8 à J+30)
├─ Vérification consignation provision
├─ Saisie du dossier (parties, mission, pièces)
└─ Planification accédit (R1)

PHASE 3: OPÉRATIONS D'EXPERTISE (cycle répétitif)
│
├── RÉUNION R1 (Accédit)
│   ├─ Convocation LRAR/AR24 (délai 8j min - Art. 160 CPC)
│   ├─ Lecture mission contradictoire
│   ├─ Constatations sur site
│   ├─ Photos, notes, mesures, témoignages
│   ├─ Désordres constatés
│   └─ COMPTE-RENDU → "Note aux parties"
│
├── RÉUNION R2, R3... (même cycle)
│
└── Investigations complémentaires (sapiteur, labo...)

PHASE 4: ÉCHANGES CONTRADICTOIRES
├─ Réception dires des parties
├─ Délai fixé par l'expert (min 1 mois - Art. 276 CPC)
├─ Analyse et réponse aux dires
└─ Dire récapitulatif obligatoire

PHASE 5: PRÉ-RAPPORT
├─ Rédaction note de synthèse
├─ Envoi aux parties
└─ Délai 1 mois pour observations

PHASE 6: RAPPORT DÉFINITIF
├─ Intégration réponses aux observations
├─ Dépôt au greffe (OPALEXE ou papier)
└─ Notification aux parties

PHASE 7: CLÔTURE
├─ État de frais détaillé
├─ Demande de taxation
└─ Règlement honoraires
```

### 1.2 Délais légaux à respecter

| Délai | Article | Description | Alerte CRM |
|-------|---------|-------------|------------|
| 8 jours | Art. 267 CPC | Acceptation mission | J-3, J-1 |
| 8 jours | Art. 160 CPC | Convocation avant réunion | J-10, J-8 |
| 1 mois min | Art. 276 CPC | Délai observations pré-rapport | Auto |
| 15/07 - 15/09 | Usage | Période estivale protégée | Bloquant |

### 1.3 Obligations du contradictoire

- Toute pièce communiquée à l'expert doit être transmise à toutes les parties
- Aucune communication directe expert/partie sans les autres
- Chaque partie doit pouvoir formuler des observations
- Traçabilité complète des échanges (preuve en cas de contestation)

---

## 2. ARCHITECTURE FONCTIONNELLE

### 2.1 Les 5 onglets métier

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  📁 DOSSIER           Tout ce qu'on reçoit pour démarrer        │
│  ─────────────────────────────────────────────────────────────  │
│  • Ordonnance (scan, date, tribunal, RG)                        │
│  • Mission du juge (texte complet éditable)                     │
│  • Parties (rôles, avocats, assureurs, contacts)               │
│  • Pièces initiales (classées par partie émettrice)            │
│  • Bien expertisé (adresse, type, photos, plans)               │
│  • Réponse au juge (acceptation/refus/récusation)              │
│  • Garanties applicables (calcul auto GPA/biennale/décennale)  │
│                                                                  │
│  🔧 OPÉRATIONS        Le travail de terrain                     │
│  ─────────────────────────────────────────────────────────────  │
│  • Vue par réunion (R1, R2, R3...)                              │
│  • Cycle complet par réunion :                                  │
│    ├── Convocation (AR24 ou LRAR)                              │
│    ├── Réunion (présents, absents, représentés)                │
│    ├── Notes (clavier + dictée vocale + retranscription IA)   │
│    ├── Photos (géolocalisées, horodatées)                      │
│    ├── Désordres constatés (liés à cette réunion)              │
│    └── Compte-rendu (généré automatiquement)                   │
│  • Sapiteurs et investigations complémentaires                  │
│  • Mode terrain (tablette/mobile)                               │
│  • Mode hors-ligne avec synchronisation                         │
│  • Chronomètre automatique des vacations                        │
│                                                                  │
│  ⚖️ CONTRADICTOIRE    Échanges avec les parties                │
│  ─────────────────────────────────────────────────────────────  │
│  • Tableau de suivi visuel (qui a reçu quoi, quand)            │
│  • Dires reçus avec suivi des délais                           │
│  • Réponses de l'expert aux dires                              │
│  • Pièces complémentaires (demandées/reçues)                   │
│  • Relances automatiques                                        │
│  • Historique complet des échanges (preuve contradictoire)     │
│                                                                  │
│  📄 RAPPORTS          Production documentaire                   │
│  ─────────────────────────────────────────────────────────────  │
│  • Éditeur de texte riche intégré                              │
│  • Modèles personnalisables                                     │
│  • Pré-rapport / Note de synthèse                              │
│  • Observations des parties                                     │
│  • Rapport définitif                                            │
│  • Assistant IA rédaction                                       │
│  • Export PDF / Word                                            │
│  • Envoi OPALEXE ou impression papier                          │
│                                                                  │
│  💰 FINANCES          Gestion économique                        │
│  ─────────────────────────────────────────────────────────────  │
│  • Provisions et consignations                                  │
│  • Vacations (calculées automatiquement via chronomètre)       │
│  • Frais (déplacements km, AR24, LRAR, labo, reprographie)     │
│  • État de frais (format conforme taxation)                    │
│  • Historique des paiements                                     │
│  • Alertes relance provision                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. FONCTIONNALITÉS DÉTAILLÉES

### 3.1 Système d'alertes intelligentes

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔔 ALERTES AUTOMATIQUES                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ DÉLAIS LÉGAUX                                                   │
│ ├── Réponse au juge : J-3, J-1, J (8 jours)                    │
│ ├── Convocation réunion : J-10, J-8 (8 jours min)              │
│ ├── Délai dires : J-7, J-3, J                                  │
│ └── Période estivale : blocage 15/07-15/09                     │
│                                                                  │
│ ACTIONS REQUISES                                                │
│ ├── Provision non reçue après X jours                          │
│ ├── Pièces demandées non reçues                                │
│ ├── Compte-rendu non rédigé après réunion                      │
│ └── Dire non répondu                                           │
│                                                                  │
│ ÉCHÉANCES MISSION                                               │
│ ├── Délai imparti par le juge                                  │
│ └── Demande de prorogation suggérée                            │
│                                                                  │
│ CANAUX DE NOTIFICATION                                          │
│ ├── Dans l'application (badge, bannière)                       │
│ ├── Email (optionnel, configurable)                            │
│ └── Push mobile (si PWA installée)                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Cycle de réunion complet

```
┌─────────────────────────────────────────────────────────────────┐
│ 📅 RÉUNION R1 - Accédit                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ÉTAPES : [1.Convoc ✅] [2.Réunion 🔵] [3.CR ○] [4.Suivi ○]     │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ 1. CONVOCATION                                                  │
│ ─────────────────────────────────────────────────────────────── │
│ • Date/heure proposée                                           │
│ • Lieu (pré-rempli depuis fiche bien)                          │
│ • Ordre du jour                                                 │
│ • Liste des parties à convoquer                                │
│ • Mode d'envoi par partie :                                    │
│   ├── AR24 (email recommandé électronique)                     │
│   ├── LRAR (courrier recommandé papier)                        │
│   └── Remise en main propre                                    │
│ • Génération automatique du courrier de convocation            │
│ • Suivi des accusés de réception                               │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ 2. PENDANT LA RÉUNION (Mode terrain)                           │
│ ─────────────────────────────────────────────────────────────── │
│                                                                  │
│ PRÉSENCE                                                        │
│ ┌────────────────┬──────────┬─────────────┬──────────────────┐ │
│ │ Partie         │ Présent  │ Représenté  │ Absent           │ │
│ ├────────────────┼──────────┼─────────────┼──────────────────┤ │
│ │ M. DUPONT      │    ●     │             │                  │ │
│ │ SARL BATIBAT   │          │      ●      │ Me Martin        │ │
│ │ AXA Assurances │          │             │       ●          │ │
│ └────────────────┴──────────┴─────────────┴──────────────────┘ │
│                                                                  │
│ PRISE DE NOTES                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🎤 Dictée vocale    📝 Clavier    🤖 Retranscription IA    │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ [Enregistrement en cours... 00:02:34]          [⏹️ Stop]   │ │
│ │                                                              │ │
│ │ Texte retranscrit :                                         │ │
│ │ "J'observe une fissure traversante sur le mur pignon est,  │ │
│ │ orientation à 45 degrés, largeur environ 2 millimètres..."  │ │
│ │                                                              │ │
│ │ [Corriger] [Reformuler en langage technique] [Valider]      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ PHOTOS                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📷 12 photos prises                                         │ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │ │
│ │ │ 001 │ │ 002 │ │ 003 │ │ 004 │ │ 005 │ │ ... │            │ │
│ │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘            │ │
│ │ • Géolocalisation automatique                               │ │
│ │ • Horodatage automatique                                    │ │
│ │ • Légende et lien vers désordre                            │ │
│ │ [+ Prendre photo] [+ Importer]                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ DÉSORDRES CONSTATÉS                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ D1. Fissure traversante mur pignon       [📷 3] [DTU 20.1] │ │
│ │     └─ Localisation: Façade Est, RDC                       │ │
│ │     └─ Gravité: ●●●○○ Importante                           │ │
│ │                                                              │ │
│ │ D2. Infiltration toiture terrasse        [📷 5] [DTU 43.1] │ │
│ │     └─ Localisation: Toiture, angle NO                     │ │
│ │     └─ Gravité: ●●●●○ Grave                                │ │
│ │                                                              │ │
│ │ [+ Ajouter désordre]                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ CHRONOMÈTRE VACATION                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ⏱️ Temps réunion : 02:34:12                                 │ │
│ │ [⏸️ Pause] [⏹️ Terminer]                                    │ │
│ │ Note: Le temps sera ajouté automatiquement à l'état de frais│ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ 3. COMPTE-RENDU                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ • Génération automatique depuis :                              │
│   ├── Notes prises pendant la réunion                         │
│   ├── Liste des présents/absents                              │
│   ├── Désordres constatés                                      │
│   └── Photos avec légendes                                     │
│ • Éditeur de texte riche pour personnaliser                   │
│ • Reformulation IA en langage expert                          │
│ • Export PDF                                                    │
│ • Envoi aux parties (AR24/LRAR/OPALEXE)                       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ 4. SUIVI POST-RÉUNION                                          │
│ ─────────────────────────────────────────────────────────────── │
│ • Pièces demandées aux parties                                 │
│ • Investigations complémentaires (sapiteur, labo)             │
│ • Planification réunion suivante si nécessaire                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Éditeur de texte riche intégré (Tiptap)

```
┌─────────────────────────────────────────────────────────────────┐
│ ✍️ ÉDITEUR DE DOCUMENTS                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ BARRE D'OUTILS                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📄 │ B │ I │ U │ S │ │ ≡ │ ≡ │ ≡ │ │ 🔗 │ 📷 │ 📊 │ │ ↩️ ↪️ │ │
│ │────┼───┼───┼───┼───┼─┼───┼───┼───┼─┼────┼────┼────┼─┼───────│ │
│ │    │Gra│Ita│Sou│Bar│ │Gau│Cen│Dro│ │Lien│Img │Tab │ │Annuler│ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Police: [Arial        ▼] Taille: [12 ▼] Couleur: [■ ▼]     │ │
│ │                                                              │ │
│ │ Style:  [Normal       ▼]  │ Interligne: [1.5 ▼]            │ │
│ │         - Titre 1                                           │ │
│ │         - Titre 2                                           │ │
│ │         - Titre 3                                           │ │
│ │         - Citation                                          │ │
│ │         - Code                                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ FONCTIONNALITÉS                                                 │
│ ├── Gras, Italique, Souligné, Barré                           │
│ ├── Alignement : Gauche, Centre, Droite, Justifié             │
│ ├── Listes : Numérotées, À puces                              │
│ ├── Tableaux : Insertion, fusion cellules                     │
│ ├── Images : Insertion, redimensionnement                     │
│ ├── En-tête / Pied de page personnalisables                  │
│ ├── Numérotation des pages                                    │
│ ├── Table des matières automatique                            │
│ ├── Rechercher / Remplacer                                    │
│ ├── Correcteur orthographique                                 │
│ ├── Export : PDF, Word (.docx), ODT                          │
│ └── Impression directe                                         │
│                                                                  │
│ MODÈLES PERSONNALISABLES                                        │
│ ├── Convocation type                                           │
│ ├── Compte-rendu type                                          │
│ ├── Pré-rapport type                                           │
│ ├── Rapport final type                                         │
│ ├── Courrier relance                                           │
│ ├── Demande de provision                                       │
│ └── [+ Créer mon modèle]                                       │
│                                                                  │
│ VARIABLES DYNAMIQUES                                            │
│ ├── {{affaire.reference}}                                      │
│ ├── {{affaire.rg}}                                             │
│ ├── {{affaire.tribunal}}                                       │
│ ├── {{parties.demandeur.nom}}                                  │
│ ├── {{reunion.date}}                                           │
│ ├── {{expert.nom}}                                             │
│ └── ... (toutes les données du dossier)                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Gestion multi-expert (Sapiteur)

```
┌─────────────────────────────────────────────────────────────────┐
│ 👥 EXPERTS ET SAPITEURS                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ EXPERT PRINCIPAL                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 👤 Jean MARTIN                                              │ │
│ │ Expert judiciaire - Spécialité BTP                         │ │
│ │ Cour d'appel de Paris                                       │ │
│ │ ✉️ j.martin@expert.fr │ 📞 06 12 34 56 78                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ SAPITEURS (Art. 278 CPC)                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 👤 Pierre DURAND - Sapiteur                                 │ │
│ │ Spécialité: Géotechnique                                    │ │
│ │ Statut: Mission en cours                                    │ │
│ │ ├── Mission confiée le: 15/02/2025                         │ │
│ │ ├── Objet: Étude de sol fondations                         │ │
│ │ ├── Rapport attendu: 15/03/2025                            │ │
│ │ └── Honoraires prévus: 1 500 € HT                          │ │
│ │ [Voir rapport] [Relancer] [Clôturer]                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ [+ Ajouter un sapiteur]                                        │
│                                                                  │
│ PARTAGE DU DOSSIER                                              │
│ ├── Lecture seule : Le sapiteur voit les pièces               │
│ ├── Contribution : Le sapiteur peut ajouter son rapport       │
│ └── Notifications : Alerte quand le sapiteur dépose           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 Mode hors-ligne

```
┌─────────────────────────────────────────────────────────────────┐
│ 📴 MODE HORS-LIGNE                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ FONCTIONNEMENT                                                  │
│ ├── Détection automatique perte de connexion                  │
│ ├── Basculement transparent en mode local                     │
│ ├── Stockage IndexedDB dans le navigateur                     │
│ └── Synchronisation automatique au retour en ligne            │
│                                                                  │
│ DONNÉES DISPONIBLES HORS-LIGNE                                 │
│ ├── ✅ Fiche affaire complète                                 │
│ ├── ✅ Liste des parties                                      │
│ ├── ✅ Historique des réunions                                │
│ ├── ✅ Photos (téléchargées en cache)                         │
│ ├── ✅ Notes et désordres                                     │
│ ├── ✅ Modèles de documents                                   │
│ └── ✅ Base DTU/Jurisprudence (en cache)                      │
│                                                                  │
│ ACTIONS POSSIBLES HORS-LIGNE                                   │
│ ├── ✅ Prendre des notes                                      │
│ ├── ✅ Prendre des photos                                     │
│ ├── ✅ Enregistrer dictée vocale                              │
│ ├── ✅ Ajouter des désordres                                  │
│ ├── ✅ Marquer présences/absences                             │
│ ├── ✅ Consulter documents                                    │
│ └── ⏳ Envoi emails/AR24 (file d'attente)                     │
│                                                                  │
│ SYNCHRONISATION                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📶 Connexion rétablie                                       │ │
│ │                                                              │ │
│ │ Modifications en attente : 12                               │ │
│ │ ├── 5 photos à uploader                                    │ │
│ │ ├── 3 notes à synchroniser                                 │ │
│ │ ├── 2 désordres à créer                                    │ │
│ │ └── 2 emails en file d'attente                             │ │
│ │                                                              │ │
│ │ [Synchroniser maintenant] [Voir détails]                    │ │
│ │                                                              │ │
│ │ ████████████░░░░░░░░ 60%                                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ GESTION DES CONFLITS                                            │
│ ├── Détection automatique si même donnée modifiée             │
│ ├── Affichage comparatif des versions                         │
│ └── Choix utilisateur : garder local / distant / fusionner    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 Dictée vocale + Retranscription IA

```
┌─────────────────────────────────────────────────────────────────┐
│ 🎤 DICTÉE VOCALE & RETRANSCRIPTION IA                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ MODES DE SAISIE                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  📝 Clavier    🎤 Dictée    🎙️ Enregistrement long         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ DICTÉE VOCALE EN TEMPS RÉEL                                    │
│ ├── Reconnaissance vocale native navigateur (Web Speech API)  │
│ ├── Affichage texte en temps réel pendant la dictée           │
│ ├── Correction manuelle possible                               │
│ └── Fonctionne hors-ligne (stocke audio, transcrit plus tard) │
│                                                                  │
│ ENREGISTREMENT LONG                                             │
│ ├── Pour les réunions longues (1h+)                           │
│ ├── Stockage audio local                                       │
│ ├── Retranscription IA différée                               │
│ ├── Possibilité de réécouter et corriger                      │
│ └── Horodatage des passages                                    │
│                                                                  │
│ OPTIONS DE RETRANSCRIPTION                                      │
│ ├── 🆓 Gratuite : Web Speech API (navigateur)                 │
│ │   └── Moins précise, nécessite connexion                    │
│ └── 💎 Premium : OpenAI Whisper API                           │
│     └── Très précise, vocabulaire technique, payante          │
│                                                                  │
│ REFORMULATION IA                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ TEXTE BRUT (dicté)                                          │ │
│ │ "y'a une grosse fissure là sur le mur à droite en entrant  │ │
│ │ elle fait peut-être 2 mètres de long et je dirais 3 ou 4   │ │
│ │ millimètres de large ça ressemble à un tassement"          │ │
│ │                                                              │ │
│ │ [🤖 Reformuler en langage expert]                           │ │
│ │                                                              │ │
│ │ TEXTE REFORMULÉ                                             │ │
│ │ "Une fissure oblique a été constatée sur le mur de refend  │ │
│ │ situé à droite de l'entrée principale. Cette fissure       │ │
│ │ présente une longueur d'environ 2 mètres et une ouverture  │ │
│ │ de 3 à 4 millimètres. Son orientation à 45° est            │ │
│ │ caractéristique d'un tassement différentiel des fondations."│ │
│ │                                                              │ │
│ │ [Accepter] [Modifier] [Garder original]                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ VOCABULAIRE TECHNIQUE                                           │
│ ├── Dictionnaire BTP intégré (termes reconnus prioritaires)   │
│ ├── Apprentissage des termes fréquents de l'expert            │
│ └── Correction automatique des homophones techniques          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.7 Double mode : Numérique & Papier

```
┌─────────────────────────────────────────────────────────────────┐
│ 📤 MODES D'ENVOI DES DOCUMENTS                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ PAR PARTIE - CHOIX DU MODE                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Partie              │ Mode préféré    │ Email/Adresse       │ │
│ ├─────────────────────┼─────────────────┼─────────────────────┤ │
│ │ M. DUPONT           │ 📧 AR24         │ dupont@email.fr    │ │
│ │ Me MARTIN (avocat)  │ 📧 OPALEXE/RPVA │ RPVA: 123456       │ │
│ │ SARL BATIBAT        │ 📬 LRAR papier  │ 12 rue de...       │ │
│ │ AXA Assurances      │ 📧 AR24         │ sinistre@axa.fr    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ENVOI AR24 (Recommandé électronique)                           │
│ ├── Intégration API AR24                                       │
│ ├── Valeur juridique = LRAR (Art. L.100 CPCE)                 │
│ ├── Accusé de réception automatique                           │
│ ├── Preuve de dépôt horodatée                                 │
│ ├── Coût : ~3.49€ par envoi                                   │
│ └── Suivi en temps réel                                        │
│                                                                  │
│ ENVOI OPALEXE (Avocats/Juridiction)                            │
│ ├── Plateforme officielle dématérialisation                   │
│ ├── Connexion via certificat expert                           │
│ ├── Dépôt rapport au greffe                                   │
│ └── Communication avec avocats via RPVA                       │
│                                                                  │
│ ENVOI PAPIER (LRAR)                                            │
│ ├── Génération du document PDF                                │
│ ├── Génération bordereau d'envoi                              │
│ ├── Rappel : "Poster les courriers"                           │
│ ├── Saisie manuelle n° recommandé                             │
│ └── Suivi La Poste intégré                                    │
│                                                                  │
│ TABLEAU DE SUIVI ENVOIS                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Document          │ Destinataire │ Mode  │ Statut    │ Date │ │
│ ├───────────────────┼──────────────┼───────┼───────────┼──────┤ │
│ │ Convocation R1    │ M. DUPONT    │ AR24  │ ✅ Reçu   │12/02│ │
│ │ Convocation R1    │ SARL BATIBAT │ LRAR  │ ⏳ Transit │12/02│ │
│ │ Compte-rendu R1   │ Tous         │ Mixte │ 3/4 reçus │20/02│ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.8 Tableau de bord contradictoire

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚖️ SUIVI DU CONTRADICTOIRE                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ MATRICE DES ÉCHANGES                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Document              │Demandeur│Défendeur│Assureur│Avocat  │ │
│ ├───────────────────────┼─────────┼─────────┼────────┼────────┤ │
│ │ Ordonnance            │ ✅ reçu │ ✅ reçu │ ✅ reçu│ ✅ reçu│ │
│ │ Convocation R1        │ ✅ 05/02│ ✅ 05/02│ ✅ 05/02│ ✅ 05/02│ │
│ │ Pièces initiales      │ ✅ émis │ ✅ reçu │ ✅ reçu│ ✅ reçu│ │
│ │ Compte-rendu R1       │ ✅ 20/02│ ✅ 20/02│ ✅ 20/02│ ✅ 20/02│ │
│ │ Pièces complémentaires│ ⏳ demandé│ ✅ reçu│ ─      │ ─      │ │
│ │ Pré-rapport           │ ✅ 01/04│ ✅ 01/04│ ✅ 01/04│ ✅ 01/04│ │
│ │ Dire                  │ ✅ reçu │ ⏳ J-5  │ ✅ reçu│ ─      │ │
│ │ Rapport final         │ ○       │ ○       │ ○      │ ○      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Légende: ✅ OK  ⏳ En attente  ○ À venir  ─ Non concerné       │
│                                                                  │
│ ⚠️ ALERTES CONTRADICTOIRE                                      │
│ ├── Défendeur : Dire attendu dans 5 jours                     │
│ └── Demandeur : Pièces complémentaires demandées le 25/02     │
│                                                                  │
│ [📧 Envoyer relance] [📋 Exporter preuve contradictoire]       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.9 État de frais automatique

```
┌─────────────────────────────────────────────────────────────────┐
│ 💰 ÉTAT DE FRAIS - Affaire 2025-001                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ VACATIONS (calculées automatiquement via chronomètre)          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Date       │ Description                  │ Durée  │ Montant│ │
│ ├────────────┼──────────────────────────────┼────────┼────────┤ │
│ │ 15/01/2025 │ Étude dossier initial        │ 2h30   │ 200,00€│ │
│ │ 20/01/2025 │ Préparation R1               │ 1h00   │  80,00€│ │
│ │ 15/02/2025 │ Réunion R1 (chrono auto)     │ 3h45   │ 337,50€│ │
│ │ 18/02/2025 │ Rédaction CR R1              │ 2h00   │ 160,00€│ │
│ │ 10/03/2025 │ Analyse dire demandeur       │ 0h45   │  60,00€│ │
│ │ 12/03/2025 │ Analyse dire défendeur       │ 1h15   │ 100,00€│ │
│ │ 01/04/2025 │ Rédaction pré-rapport        │ 4h00   │ 320,00€│ │
│ │ 15/05/2025 │ Rédaction rapport final      │ 6h00   │ 480,00€│ │
│ ├────────────┼──────────────────────────────┼────────┼────────┤ │
│ │            │ TOTAL VACATIONS              │ 21h15  │1737,50€│ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ FRAIS                                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Déplacements          │ 120 km × 0,60€           │   72,00€│ │
│ │ AR24 (6 envois)       │ 6 × 3,49€                │   20,94€│ │
│ │ LRAR (2 envois)       │ 2 × 6,50€                │   13,00€│ │
│ │ Analyses labo         │ Facture jointe           │  350,00€│ │
│ │ Reprographie          │ Forfait                  │   45,00€│ │
│ ├───────────────────────┼──────────────────────────┼─────────┤ │
│ │                       │ TOTAL FRAIS              │  500,94€│ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ RÉCAPITULATIF                                                   │
│ ─────────────────────────────────────────────────────────────── │
│ Total vacations                                      1 737,50 € │
│ Total frais                                            500,94 € │
│ ─────────────────────────────────────────────────────────────── │
│ TOTAL HT                                             2 238,44 € │
│ TVA 20%                                                447,69 € │
│ ─────────────────────────────────────────────────────────────── │
│ TOTAL TTC                                            2 686,13 € │
│ Provision versée                                    -1 500,00 € │
│ ─────────────────────────────────────────────────────────────── │
│ SOLDE DÛ                                             1 186,13 € │
│                                                                  │
│ [📄 Exporter PDF format taxation] [📧 Envoyer au greffe]        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. ROADMAP DÉVELOPPEMENT

### Phase 1 : Fondations (Sprint 1-2)

| Priorité | Fonctionnalité | Effort | Statut |
|----------|----------------|--------|--------|
| 🔴 P1 | Restructuration 5 onglets métier | M | ⬜ À faire |
| 🔴 P1 | Cycle réunion complet (Convoc→Réunion→CR) | L | ⬜ À faire |
| 🔴 P1 | Désordres liés aux réunions | S | ⬜ À faire |
| 🔴 P1 | Alertes délais automatiques | M | ⬜ À faire |

### Phase 2 : Productivité (Sprint 3-4)

| Priorité | Fonctionnalité | Effort | Statut |
|----------|----------------|--------|--------|
| 🔴 P1 | Éditeur texte riche (Tiptap) | L | ⬜ À faire |
| 🔴 P1 | Modèles de documents personnalisables | M | ⬜ À faire |
| 🔴 P1 | Génération CR automatique | M | ⬜ À faire |
| 🟠 P2 | Tableau contradictoire | M | ⬜ À faire |

### Phase 3 : Terrain (Sprint 5-6)

| Priorité | Fonctionnalité | Effort | Statut |
|----------|----------------|--------|--------|
| 🟠 P2 | Mode hors-ligne (IndexedDB + SW) | XL | ⬜ À faire |
| 🟠 P2 | Dictée vocale (Web Speech API) | M | ⬜ À faire |
| 🟠 P2 | Retranscription IA (Whisper + gratuit) | L | ⬜ À faire |
| 🟠 P2 | Photos géolocalisées/horodatées | M | ⬜ À faire |

### Phase 4 : Multi-acteurs (Sprint 7-8)

| Priorité | Fonctionnalité | Effort | Statut |
|----------|----------------|--------|--------|
| 🟠 P2 | Gestion sapiteurs | M | ⬜ À faire |
| 🟠 P2 | État de frais automatique | M | ⬜ À faire |
| 🟡 P3 | Base DTU intégrée | L | ⬜ À faire |
| 🟡 P3 | Base jurisprudence | L | ⬜ À faire |

### Phase 5 : Intégrations (Sprint 9-10)

| Priorité | Fonctionnalité | Effort | Statut |
|----------|----------------|--------|--------|
| 🟡 P3 | Intégration AR24 API | L | ⬜ À faire |
| 🟡 P3 | Intégration OPALEXE | XL | ⬜ À faire |
| 🟡 P3 | Assistant IA rédaction (GPT) | L | ⬜ À faire |
| 🟢 P4 | Suivi La Poste | S | ⬜ À faire |

### Légende effort
- **S** : Small (1-2 jours)
- **M** : Medium (3-5 jours)
- **L** : Large (1-2 semaines)
- **XL** : Extra Large (2-4 semaines)

---

## 5. STACK TECHNIQUE

```
FRONTEND
├── React 18 + Vite
├── TailwindCSS (Design Samsung One UI)
├── Tiptap (Éditeur texte riche)
├── Web Speech API (Dictée vocale gratuite)
├── IndexedDB + Service Worker (Mode offline)
└── PWA (Installation mobile)

BACKEND / SERVICES
├── Supabase (BDD PostgreSQL + Auth + Storage)
├── OpenAI Whisper API (Retranscription premium)
├── Web Speech API (Retranscription gratuite)
├── OpenAI GPT API (Reformulation IA)
├── AR24 API (Recommandés électroniques)
└── OPALEXE (Intégration à étudier)

STOCKAGE
├── Supabase Storage (Documents, photos cloud)
├── IndexedDB (Cache offline local)
└── LocalStorage (Préférences utilisateur)
```

---

## 6. CRITÈRES DE SUCCÈS

### Pour l'expert judiciaire

- [ ] Gain de temps : -50% sur la rédaction des CR
- [ ] Zéro délai manqué grâce aux alertes
- [ ] Traçabilité contradictoire parfaite
- [ ] Utilisable sur le terrain (tablette/mobile)
- [ ] Fonctionne même sans réseau
- [ ] Deux modes : 100% numérique ou hybride papier

### Pour la qualité des expertises

- [ ] Rapports plus professionnels (mise en page)
- [ ] Références DTU/Jurisprudence accessibles
- [ ] Photos organisées et légendées
- [ ] Désordres bien documentés et liés aux réunions
- [ ] Reformulation IA pour langage technique

### Pour la gestion financière

- [ ] État de frais précis et complet
- [ ] Chronomètre automatique = aucun oubli
- [ ] Suivi des provisions
- [ ] Format conforme pour taxation
- [ ] Historique des affaires

---

## 7. RÉFÉRENCES

### Textes de loi
- Code de procédure civile : Articles 263 à 284-1 (Expertise)
- Article 145 CPC : Référé-expertise
- Article 160 CPC : Délai convocation (8 jours)
- Article 267 CPC : Acceptation mission (8 jours)
- Article 276 CPC : Délai observations pré-rapport (1 mois min)
- Article 278 CPC : Recours au sapiteur
- Article L.100 CPCE : Valeur juridique LRE (AR24)

### Plateformes officielles
- OPALEXE : https://opalexe.fr/ (Dématérialisation expertise)
- AR24 : https://www.ar24.fr/ (Recommandé électronique)
- RPVA : Réseau Privé Virtuel Avocats

### Sources documentation
- Village Justice : Procédure expertise judiciaire
- Légifrance : Code de procédure civile
- FFB : Documentation expertise BTP
- CNCEJ : Conseil National des Compagnies d'Experts de Justice

---

*Document créé le 21/12/2024*
*Version 1.0*
