-- ============================================================================
-- CRM EXPERT JUDICIAIRE - SCHÉMA BASE DE DONNÉES
-- Migration initiale pour Supabase
-- ============================================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: experts (profil utilisateur expert)
-- ============================================================================

CREATE TABLE IF NOT EXISTS experts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT,
  telephone TEXT,
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  
  -- Informations professionnelles
  numero_inscription TEXT, -- Numéro inscription Cour d'Appel
  cour_appel TEXT,
  specialites TEXT[], -- ex: ['BTP', 'Construction', 'Bâtiment']
  date_inscription DATE,
  
  -- Coordonnées bancaires (pour facturation)
  iban TEXT,
  bic TEXT,
  
  -- Assurance RC Pro
  assurance_nom TEXT,
  assurance_numero_contrat TEXT,
  assurance_date_expiration DATE,
  
  -- Taux horaires par défaut
  taux_expertise DECIMAL(10,2) DEFAULT 90.00,
  taux_etude DECIMAL(10,2) DEFAULT 80.00,
  taux_redaction DECIMAL(10,2) DEFAULT 80.00,
  taux_deplacement DECIMAL(10,2) DEFAULT 50.00,
  taux_kilometrique DECIMAL(10,4) DEFAULT 0.60,
  
  -- Préférences
  preferences JSONB DEFAULT '{}',
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: affaires
-- ============================================================================

CREATE TABLE IF NOT EXISTS affaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  
  -- Identifiants
  reference TEXT NOT NULL, -- Référence interne (EXP-2024-0001)
  rg TEXT, -- Numéro de Rôle Général du tribunal
  
  -- Juridiction
  tribunal TEXT NOT NULL,
  chambre TEXT,
  juge_commissaire TEXT,
  greffier TEXT,
  
  -- Dates clés
  date_ordonnance DATE,
  date_designation DATE,
  date_echeance DATE,
  date_reception_ouvrage DATE,
  
  -- Mission
  mission TEXT, -- Texte complet de la mission
  questions_juge TEXT[], -- Questions posées par le juge
  
  -- Bien expertisé
  bien_adresse TEXT,
  bien_code_postal TEXT,
  bien_ville TEXT,
  bien_type TEXT, -- Maison, Appartement, Immeuble, Local commercial...
  bien_description TEXT,
  
  -- Provision
  provision_montant DECIMAL(10,2),
  provision_recue BOOLEAN DEFAULT FALSE,
  provision_date_reception DATE,
  
  -- Statut
  statut TEXT DEFAULT 'en-cours' CHECK (statut IN ('en-cours', 'pre-rapport', 'termine', 'archive')),
  urgent BOOLEAN DEFAULT FALSE,
  
  -- Scores de suivi
  score_conformite INTEGER DEFAULT 0,
  score_protection INTEGER DEFAULT 0,
  avancement INTEGER DEFAULT 0,
  
  -- Données complémentaires (JSON flexible)
  metadata JSONB DEFAULT '{}',
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte unicité référence par expert
  UNIQUE(expert_id, reference)
);

-- Index pour recherche rapide
CREATE INDEX idx_affaires_expert ON affaires(expert_id);
CREATE INDEX idx_affaires_statut ON affaires(statut);
CREATE INDEX idx_affaires_reference ON affaires(reference);
CREATE INDEX idx_affaires_rg ON affaires(rg);

-- ============================================================================
-- TABLE: parties (intervenants dans une affaire)
-- ============================================================================

CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affaire_id UUID NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
  
  -- Type de partie
  type TEXT NOT NULL CHECK (type IN ('demandeur', 'defenseur', 'intervenant', 'assureur', 'tiers')),
  role TEXT, -- Maître d'ouvrage, Entreprise, Architecte, etc.
  
  -- Identité
  nom TEXT NOT NULL,
  prenom TEXT,
  raison_sociale TEXT, -- Si personne morale
  forme_juridique TEXT, -- SARL, SAS, etc.
  siret TEXT,
  
  -- Coordonnées
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  telephone TEXT,
  email TEXT,
  
  -- Représentation juridique
  avocat_nom TEXT,
  avocat_cabinet TEXT,
  avocat_adresse TEXT,
  avocat_email TEXT,
  avocat_telephone TEXT,
  
  -- Assurance
  assurance_nom TEXT,
  assurance_numero_police TEXT,
  assurance_type TEXT, -- DO, RCD, RC Pro, etc.
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parties_affaire ON parties(affaire_id);
CREATE INDEX idx_parties_type ON parties(type);

-- ============================================================================
-- TABLE: reunions (réunions d'expertise)
-- ============================================================================

CREATE TABLE IF NOT EXISTS reunions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affaire_id UUID NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
  
  -- Identification
  numero INTEGER NOT NULL, -- Numéro de réunion (1, 2, 3...)
  type TEXT DEFAULT 'expertise' CHECK (type IN ('accedif', 'expertise', 'conciliation', 'technique')),
  
  -- Planification
  date_reunion TIMESTAMPTZ NOT NULL,
  duree_prevue INTEGER, -- En minutes
  duree_reelle INTEGER,
  
  -- Lieu
  lieu TEXT,
  adresse TEXT,
  
  -- Convocations
  date_convocation DATE,
  delai_convocation_respecte BOOLEAN,
  
  -- Compte-rendu
  ordre_jour TEXT,
  compte_rendu TEXT,
  observations TEXT,
  
  -- Présences (stocké en JSON pour flexibilité)
  presences JSONB DEFAULT '[]', -- [{partie_id, present, represente_par}]
  
  -- Statut
  statut TEXT DEFAULT 'planifiee' CHECK (statut IN ('planifiee', 'confirmee', 'terminee', 'annulee', 'reportee')),
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reunions_affaire ON reunions(affaire_id);
CREATE INDEX idx_reunions_date ON reunions(date_reunion);

-- ============================================================================
-- TABLE: pathologies (désordres constatés)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pathologies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affaire_id UUID NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
  
  -- Identification
  numero INTEGER NOT NULL, -- Numéro du désordre (D1, D2...)
  intitule TEXT NOT NULL, -- Titre court
  
  -- Localisation
  localisation TEXT NOT NULL, -- Où dans le bâtiment
  localisation_detail TEXT,
  
  -- Description
  description TEXT NOT NULL,
  date_apparition DATE,
  date_constatation DATE,
  
  -- Qualification juridique
  qualification TEXT, -- impropriete-destination, solidite-ouvrage, etc.
  garantie TEXT CHECK (garantie IN ('gpa', 'biennale', 'decennale', 'contractuelle', 'prescription')),
  
  -- Analyse
  origine TEXT, -- conception, execution, materiaux, entretien
  cause_probable TEXT,
  
  -- Gravité
  gravite TEXT DEFAULT 'moyenne' CHECK (gravite IN ('mineure', 'moyenne', 'majeure', 'critique')),
  evolutif BOOLEAN DEFAULT FALSE,
  urgent BOOLEAN DEFAULT FALSE,
  
  -- DTU applicable
  dtu_applicable TEXT,
  non_conformites TEXT[],
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pathologies_affaire ON pathologies(affaire_id);
CREATE INDEX idx_pathologies_garantie ON pathologies(garantie);

-- ============================================================================
-- TABLE: photos
-- ============================================================================

CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affaire_id UUID NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
  pathologie_id UUID REFERENCES pathologies(id) ON DELETE SET NULL,
  reunion_id UUID REFERENCES reunions(id) ON DELETE SET NULL,
  
  -- Fichier
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Chemin dans Supabase Storage
  url TEXT, -- URL publique ou signée
  mime_type TEXT,
  size_bytes INTEGER,
  
  -- Métadonnées photo
  categorie TEXT, -- vue-generale, facade, desordre, detail, mesure
  legende TEXT,
  date_prise DATE,
  
  -- Géolocalisation
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- Annotations (JSON pour flexibilité)
  annotations JSONB DEFAULT '[]',
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photos_affaire ON photos(affaire_id);
CREATE INDEX idx_photos_pathologie ON photos(pathologie_id);

-- ============================================================================
-- TABLE: dires (dires des parties)
-- ============================================================================

CREATE TABLE IF NOT EXISTS dires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affaire_id UUID NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
  partie_id UUID REFERENCES parties(id) ON DELETE SET NULL,
  
  -- Identification
  numero INTEGER NOT NULL, -- Numéro du dire
  
  -- Contenu
  date_reception DATE NOT NULL,
  objet TEXT,
  contenu TEXT NOT NULL,
  
  -- Pièces jointes
  pieces_jointes TEXT[], -- Références aux documents
  
  -- Réponse expert
  reponse_expert TEXT,
  date_reponse DATE,
  
  -- Statut
  statut TEXT DEFAULT 'recu' CHECK (statut IN ('recu', 'en-analyse', 'repondu', 'clos')),
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dires_affaire ON dires(affaire_id);

-- ============================================================================
-- TABLE: chiffrages (scénarios de chiffrage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS chiffrages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affaire_id UUID NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
  
  -- Identification
  titre TEXT NOT NULL, -- ex: "Scénario réparation complète"
  description TEXT,
  
  -- Type
  type TEXT DEFAULT 'reparation' CHECK (type IN ('reparation', 'remplacement', 'mixte')),
  
  -- Postes de chiffrage (JSON pour flexibilité)
  postes JSONB DEFAULT '[]', -- [{lot, designation, quantite, unite, pu_ht, total_ht}]
  
  -- Totaux
  total_ht DECIMAL(12,2) DEFAULT 0,
  tva_taux DECIMAL(5,2) DEFAULT 20.00,
  total_ttc DECIMAL(12,2) DEFAULT 0,
  
  -- Indice BT pour actualisation
  indice_bt_code TEXT,
  indice_bt_valeur DECIMAL(10,2),
  indice_bt_date DATE,
  
  -- Statut
  retenu BOOLEAN DEFAULT FALSE, -- Scénario retenu dans le rapport
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chiffrages_affaire ON chiffrages(affaire_id);

-- ============================================================================
-- TABLE: vacations (temps passé)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vacations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affaire_id UUID NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
  reunion_id UUID REFERENCES reunions(id) ON DELETE SET NULL,
  
  -- Type de vacation
  type TEXT NOT NULL CHECK (type IN ('expertise', 'etude', 'redaction', 'deplacement')),
  
  -- Durée
  date_vacation DATE NOT NULL,
  duree_heures DECIMAL(5,2) NOT NULL,
  
  -- Description
  description TEXT,
  
  -- Tarification
  taux_horaire DECIMAL(10,2) NOT NULL,
  montant DECIMAL(10,2) GENERATED ALWAYS AS (duree_heures * taux_horaire) STORED,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vacations_affaire ON vacations(affaire_id);

-- ============================================================================
-- TABLE: frais (frais divers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS frais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affaire_id UUID NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
  
  -- Type de frais
  type TEXT NOT NULL, -- LRAR, COPIES, PHOTOS, RELIURE, SAPITEUR, LABO, etc.
  
  -- Détails
  date_frais DATE NOT NULL,
  description TEXT,
  
  -- Montant
  quantite DECIMAL(10,2) DEFAULT 1,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  montant DECIMAL(10,2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED,
  
  -- Justificatif
  justificatif_path TEXT, -- Chemin dans Storage
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_frais_affaire ON frais(affaire_id);

-- ============================================================================
-- TABLE: documents (documents générés)
-- ============================================================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affaire_id UUID NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
  
  -- Type de document
  type TEXT NOT NULL, -- convocation, compte-rendu, demande-pieces, note-synthese, rapport-final, etat-frais
  
  -- Identification
  numero TEXT, -- Numéro du document (CONV-001, CR-002...)
  titre TEXT NOT NULL,
  
  -- Fichier
  storage_path TEXT,
  filename TEXT,
  mime_type TEXT DEFAULT 'application/pdf',
  size_bytes INTEGER,
  
  -- Version
  version INTEGER DEFAULT 1,
  
  -- Statut
  statut TEXT DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'final', 'envoye', 'depose')),
  
  -- Envoi
  date_envoi DATE,
  mode_envoi TEXT, -- email, lrar, opalexe
  ar_numero TEXT, -- Numéro AR si LRAR
  ar_date_reception DATE,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_affaire ON documents(affaire_id);
CREATE INDEX idx_documents_type ON documents(type);

-- ============================================================================
-- TABLE: evenements (historique/timeline)
-- ============================================================================

CREATE TABLE IF NOT EXISTS evenements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affaire_id UUID NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
  
  -- Type d'événement
  type TEXT NOT NULL, -- creation, modification, reunion, envoi, reception, depot, etc.
  
  -- Détails
  date_evenement TIMESTAMPTZ DEFAULT NOW(),
  titre TEXT NOT NULL,
  description TEXT,
  
  -- Référence vers autre entité
  entite_type TEXT, -- reunion, document, dire, etc.
  entite_id UUID,
  
  -- Utilisateur
  user_id UUID REFERENCES experts(id),
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evenements_affaire ON evenements(affaire_id);
CREATE INDEX idx_evenements_date ON evenements(date_evenement DESC);

-- ============================================================================
-- TABLE: alertes
-- ============================================================================

CREATE TABLE IF NOT EXISTS alertes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  affaire_id UUID REFERENCES affaires(id) ON DELETE CASCADE,
  
  -- Type d'alerte
  type TEXT NOT NULL, -- echeance, delai, garantie, provision, etc.
  priorite TEXT DEFAULT 'normale' CHECK (priorite IN ('basse', 'normale', 'haute', 'critique')),
  
  -- Contenu
  titre TEXT NOT NULL,
  message TEXT,
  
  -- Date déclenchement
  date_alerte DATE NOT NULL,
  date_echeance DATE,
  
  -- Statut
  lue BOOLEAN DEFAULT FALSE,
  traitee BOOLEAN DEFAULT FALSE,
  date_traitement TIMESTAMPTZ,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alertes_expert ON alertes(expert_id);
CREATE INDEX idx_alertes_date ON alertes(date_alerte);
CREATE INDEX idx_alertes_non_lues ON alertes(expert_id) WHERE lue = FALSE;

-- ============================================================================
-- TABLE: contacts (carnet d'adresses global)
-- ============================================================================

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  
  -- Type de contact
  type TEXT NOT NULL, -- avocat, entreprise, assureur, laboratoire, sapiteur, etc.
  
  -- Identité
  nom TEXT NOT NULL,
  prenom TEXT,
  raison_sociale TEXT,
  fonction TEXT,
  
  -- Coordonnées
  adresse TEXT,
  code_postal TEXT,
  ville TEXT,
  telephone TEXT,
  telephone_mobile TEXT,
  email TEXT,
  
  -- Informations complémentaires
  specialites TEXT[],
  notes TEXT,
  
  -- Favoris
  favori BOOLEAN DEFAULT FALSE,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_expert ON contacts(expert_id);
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_nom ON contacts(nom);

-- ============================================================================
-- FONCTIONS ET TRIGGERS
-- ============================================================================

-- Fonction mise à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers updated_at
CREATE TRIGGER tr_experts_updated_at BEFORE UPDATE ON experts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_affaires_updated_at BEFORE UPDATE ON affaires
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_parties_updated_at BEFORE UPDATE ON parties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_reunions_updated_at BEFORE UPDATE ON reunions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_pathologies_updated_at BEFORE UPDATE ON pathologies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_dires_updated_at BEFORE UPDATE ON dires
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_chiffrages_updated_at BEFORE UPDATE ON chiffrages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reunions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE dires ENABLE ROW LEVEL SECURITY;
ALTER TABLE chiffrages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacations ENABLE ROW LEVEL SECURITY;
ALTER TABLE frais ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Politiques pour experts (l'utilisateur ne peut voir que son profil)
CREATE POLICY experts_select ON experts FOR SELECT USING (auth.uid() = id);
CREATE POLICY experts_update ON experts FOR UPDATE USING (auth.uid() = id);

-- Politiques pour affaires (l'utilisateur ne peut voir que ses affaires)
CREATE POLICY affaires_all ON affaires FOR ALL USING (auth.uid() = expert_id);

-- Politiques pour les tables liées aux affaires
CREATE POLICY parties_all ON parties FOR ALL 
  USING (affaire_id IN (SELECT id FROM affaires WHERE expert_id = auth.uid()));

CREATE POLICY reunions_all ON reunions FOR ALL 
  USING (affaire_id IN (SELECT id FROM affaires WHERE expert_id = auth.uid()));

CREATE POLICY pathologies_all ON pathologies FOR ALL 
  USING (affaire_id IN (SELECT id FROM affaires WHERE expert_id = auth.uid()));

CREATE POLICY photos_all ON photos FOR ALL 
  USING (affaire_id IN (SELECT id FROM affaires WHERE expert_id = auth.uid()));

CREATE POLICY dires_all ON dires FOR ALL 
  USING (affaire_id IN (SELECT id FROM affaires WHERE expert_id = auth.uid()));

CREATE POLICY chiffrages_all ON chiffrages FOR ALL 
  USING (affaire_id IN (SELECT id FROM affaires WHERE expert_id = auth.uid()));

CREATE POLICY vacations_all ON vacations FOR ALL 
  USING (affaire_id IN (SELECT id FROM affaires WHERE expert_id = auth.uid()));

CREATE POLICY frais_all ON frais FOR ALL 
  USING (affaire_id IN (SELECT id FROM affaires WHERE expert_id = auth.uid()));

CREATE POLICY documents_all ON documents FOR ALL 
  USING (affaire_id IN (SELECT id FROM affaires WHERE expert_id = auth.uid()));

CREATE POLICY evenements_all ON evenements FOR ALL 
  USING (affaire_id IN (SELECT id FROM affaires WHERE expert_id = auth.uid()));

CREATE POLICY alertes_all ON alertes FOR ALL USING (auth.uid() = expert_id);

CREATE POLICY contacts_all ON contacts FOR ALL USING (auth.uid() = expert_id);

-- ============================================================================
-- BUCKETS STORAGE
-- ============================================================================

-- Créer les buckets (à exécuter via Dashboard Supabase ou API)
-- INSERT INTO storage.buckets (id, name, public) VALUES 
--   ('photos', 'photos', false),
--   ('documents', 'documents', false),
--   ('justificatifs', 'justificatifs', false);

-- ============================================================================
-- DONNÉES INITIALES (optionnel)
-- ============================================================================

-- Aucune donnée initiale - sera créée par l'utilisateur
