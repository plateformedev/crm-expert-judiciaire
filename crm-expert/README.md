# CRM Expert Judiciaire BTP - V3 Architecture Modulaire

## Structure du projet (23 fichiers)

```
crm-expert/
├── src/
│   ├── components/
│   │   ├── ui/              # Composants UI réutilisables
│   │   │   └── index.jsx    # Card, Badge, Button, Input, Modal, etc.
│   │   ├── layout/          # Composants de mise en page
│   │   │   ├── Sidebar.jsx  # Navigation principale
│   │   │   └── Header.jsx   # En-tête avec recherche et profil
│   │   ├── auth/            # Authentification
│   │   │   └── AuthPage.jsx # Login, Register, Reset password
│   │   ├── excellence/      # Module Excellence (14 sous-modules)
│   │   │   └── index.jsx    # Garanties, Conformité, DTU, etc.
│   │   ├── outils/          # Module Outils (9 sous-modules)
│   │   │   └── index.jsx    # Chronomètre, Calculatrice, Dictée
│   │   ├── ia/              # Chatbot IA Expert
│   │   │   └── ChatbotIA.jsx
│   │   ├── affaires/        # Gestion des affaires (à développer)
│   │   └── modals/          # Modales (à développer)
│   ├── contexts/
│   │   └── AuthContext.jsx  # Context authentification React
│   ├── lib/
│   │   └── supabase.js      # Client Supabase + helpers
│   ├── data/
│   │   ├── constants.js     # Constantes globales, design system
│   │   ├── references.js    # DTU, jurisprudence, qualifications
│   │   ├── checklists.js    # Checklists conformité, OPALEXE
│   │   ├── templates.js     # Modèles documents, bibliothèque
│   │   └── index.js         # Export centralisé
│   ├── hooks/
│   │   ├── index.js         # Hooks généraux (timer, storage, etc.)
│   │   └── useSupabase.js   # Hooks données Supabase
│   ├── services/
│   │   └── api.js           # Services API (Claude, Whisper, AR24, etc.)
│   ├── utils/
│   │   └── helpers.js       # Fonctions utilitaires
│   └── App.jsx              # Application principale
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Schéma BDD complet
├── .env.example             # Template variables d'environnement
├── package.json
└── README.md
```

---

## INTÉGRATIONS API À CONNECTER

### 1. INTELLIGENCE ARTIFICIELLE

#### Claude API (Anthropic) - Chatbot Expert
```javascript
// src/services/api.js -> claudeService

Endpoint: https://api.anthropic.com/v1/messages
Modèle: claude-3-opus-20240229

Fonctionnalités:
- Chat contextuel avec RAG
- Qualification automatique désordres
- Génération de paragraphes types
- Recherche jurisprudence

Coût estimé: ~0.015€/1K tokens
```

#### Whisper API (OpenAI) - Transcription vocale
```javascript
// src/services/api.js -> whisperService

Endpoint: https://api.openai.com/v1/audio/transcriptions
Modèle: whisper-1

Fonctionnalités:
- Transcription temps réel
- Support français
- Post-traitement IA pour correction

Coût estimé: ~0.006€/minute
```

#### RAG / Embeddings
```javascript
Options:
- OpenAI Embeddings (text-embedding-3-small)
- Voyage AI (voyage-large-2)

Base vectorielle:
- Pinecone (cloud)
- Weaviate (self-hosted)
- ChromaDB (local)

Corpus à vectoriser:
- Code Civil Construction (156 articles)
- CPC Expertise (89 articles)
- DTU complets (87 documents)
- Jurisprudence Cass. Civ. (1250 arrêts)
```

---

### 2. COMMUNICATION & ENVOIS

#### AR24 - LRAR dématérialisé
```javascript
// src/services/api.js -> ar24Service

Endpoint: https://api.ar24.fr/v2
Documentation: https://docs.ar24.fr

Fonctionnalités:
- Envoi LRAR électronique
- Suivi temps réel
- Téléchargement AR

Coût: ~4-6€/envoi
```

#### SendGrid / Postmark - Emails transactionnels
```javascript
// src/services/api.js -> emailService

Fonctionnalités:
- Envoi convocations
- Envoi comptes-rendus
- Templates personnalisés
- Tracking ouvertures

Coût: 0-20€/mois
```

#### Yousign - Signature électronique
```javascript
Endpoint: https://api.yousign.app

Fonctionnalités:
- Signature feuilles présence
- Signature protocoles conciliation
- Valeur probante

Coût: 25-50€/mois
```

---

### 3. CALENDRIER & PLANNING

#### Google Calendar API
```javascript
// src/services/api.js -> calendarService

Scopes requis:
- https://www.googleapis.com/auth/calendar
- https://www.googleapis.com/auth/calendar.events

Fonctionnalités:
- Création événements (réunions expertise)
- Sync bidirectionnelle
- Rappels automatiques
```

#### Microsoft Graph API (Outlook)
```javascript
Endpoint: https://graph.microsoft.com/v1.0/me/calendar

Alternative à Google Calendar pour environnements Microsoft.
```

---

### 4. STOCKAGE & FICHIERS

#### Cloudflare R2 / AWS S3
```javascript
// src/services/api.js -> storageService

Fonctionnalités:
- Stockage photos chantier
- Stockage documents
- CDN pour accès rapide

Coût: ~0.015€/Go/mois
```

#### Génération PDF
```javascript
Options:
- Puppeteer (headless Chrome)
- WeasyPrint (HTML to PDF)
- PDFKit (low-level)
- jsPDF (client-side)

Recommandé: Puppeteer pour qualité + WeasyPrint pour PDF/A
```

---

### 5. DONNÉES MÉTIER

#### INSEE API - Indices BT
```javascript
// src/services/api.js -> inseeService

Endpoint: https://api.insee.fr/series/BDM/V1/data/SERIES_BDM
Documentation: https://api.insee.fr

Fonctionnalités:
- Récupération indices BT01 à BT66
- Actualisation automatique montants
- Historique des indices

Gratuit (inscription requise)
```

#### OPALEXE - Dépôt dématérialisé
```javascript
// src/services/api.js -> opalexeService

Endpoint: https://opalexe.justice.gouv.fr/api
Accès: Accréditation Ministère Justice requise

Fonctionnalités:
- Dépôt rapport d'expertise
- Validation format PDF/A
- Accusé de dépôt

Gratuit (accès expert inscrit)
```

#### Légifrance API - Jurisprudence
```javascript
Endpoint: https://api.legifrance.gouv.fr

Fonctionnalités:
- Recherche jurisprudence
- Accès textes consolidés
- Mise à jour corpus RAG

Gratuit
```

---

### 6. OCR & ANALYSE DOCUMENTS

#### Google Cloud Vision
```javascript
// src/services/api.js -> ocrService

Fonctionnalités:
- OCR documents scannés
- Extraction données structurées
- Détection type document

Coût: ~1.50€/1000 pages
```

#### Alternative: Tesseract.js
```javascript
Gratuit, client-side
Moins précis que Google Vision
Adapté pour volumes faibles
```

---

## CONFIGURATION ENVIRONNEMENT

```env
# .env.local

# Anthropic (Claude)
VITE_CLAUDE_API_KEY=sk-ant-...

# OpenAI (Whisper, Embeddings)
VITE_OPENAI_API_KEY=sk-...

# AR24
VITE_AR24_API_KEY=...
VITE_AR24_SECRET=...

# SendGrid
VITE_SENDGRID_API_KEY=SG...

# Google
VITE_GOOGLE_CLIENT_ID=...
VITE_GOOGLE_API_KEY=...

# Cloudflare R2
VITE_R2_ACCOUNT_ID=...
VITE_R2_ACCESS_KEY=...
VITE_R2_SECRET_KEY=...
VITE_R2_BUCKET=crm-expert

# INSEE
VITE_INSEE_API_KEY=...

# Pinecone (RAG)
VITE_PINECONE_API_KEY=...
VITE_PINECONE_INDEX=crm-expert-rag
```

---

## BUDGET MENSUEL ESTIMÉ

| Service | Usage estimé | Coût mensuel |
|---------|--------------|--------------|
| Hébergement (Vercel) | Pro | 20€ |
| Supabase (BDD) | Pro | 25€ |
| Cloudflare R2 | 50 Go | 10€ |
| Claude API | ~500K tokens | 75€ |
| Whisper API | ~500 min | 30€ |
| AR24 | 100 LRAR | 500€ |
| SendGrid | 1000 emails | 15€ |
| **TOTAL** | | **~675€/mois** |

---

## PROCHAINES ÉTAPES

### Phase 1 : Backend & Auth (2-3 semaines)
- [ ] Setup Supabase (PostgreSQL + Auth)
- [ ] Schéma base de données
- [ ] Authentification utilisateur
- [ ] CRUD affaires complet

### Phase 2 : Intégrations IA (2 semaines)
- [ ] Connexion Claude API
- [ ] RAG avec Pinecone
- [ ] Whisper pour dictée

### Phase 3 : Communications (1-2 semaines)
- [ ] Intégration AR24
- [ ] Templates emails SendGrid
- [ ] Génération PDF

### Phase 4 : Métier (2 semaines)
- [ ] API INSEE indices BT
- [ ] Connexion OPALEXE
- [ ] Sync calendrier

### Phase 5 : Mobile & PWA (2 semaines)
- [ ] PWA complète
- [ ] Mode offline
- [ ] Push notifications
