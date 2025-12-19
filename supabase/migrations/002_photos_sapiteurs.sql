-- ============================================================================
-- CRM EXPERT JUDICIAIRE - MIGRATION 002
-- Tables manquantes: photos, interventions_sapiteurs
-- ============================================================================

-- ============================================================================
-- TABLE: photos
-- ============================================================================

CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  affaire_id UUID NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
  reunion_id UUID REFERENCES reunions(id) ON DELETE SET NULL,
  pathologie_id UUID REFERENCES pathologies(id) ON DELETE SET NULL,
  
  -- Fichier
  fichier_path TEXT NOT NULL,
  fichier_nom TEXT,
  fichier_taille INTEGER,
  fichier_mime_type TEXT,
  
  -- Métadonnées
  legende TEXT,
  description TEXT,
  numero INTEGER, -- Numéro de la photo dans l'affaire
  categorie TEXT CHECK (categorie IN (
    'exterieur', 'interieur', 'facade', 'toiture', 'fondation',
    'structure', 'equipement', 'desordre', 'detail', 'plan', 'autre'
  )),
  
  -- Annotations (JSON avec coordonnées et textes)
  annotations JSONB DEFAULT '[]',
  
  -- Géolocalisation
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  adresse TEXT,
  
  -- Données EXIF
  date_prise TIMESTAMPTZ,
  appareil TEXT,
  exif_data JSONB,
  
  -- Statut
  statut TEXT DEFAULT 'active' CHECK (statut IN ('active', 'archivee', 'supprimee')),
  inclure_rapport BOOLEAN DEFAULT TRUE,
  ordre_rapport INTEGER,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_photos_affaire ON photos(affaire_id);
CREATE INDEX IF NOT EXISTS idx_photos_reunion ON photos(reunion_id);
CREATE INDEX IF NOT EXISTS idx_photos_pathologie ON photos(pathologie_id);
CREATE INDEX IF NOT EXISTS idx_photos_expert ON photos(expert_id);
CREATE INDEX IF NOT EXISTS idx_photos_categorie ON photos(categorie);

-- RLS (Row Level Security)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les experts voient uniquement leurs photos"
  ON photos FOR ALL
  USING (expert_id = auth.uid());

-- Trigger mise à jour
CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: interventions_sapiteurs
-- ============================================================================

CREATE TABLE IF NOT EXISTS interventions_sapiteurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  affaire_id UUID NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
  sapiteur_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
  
  -- Détails intervention
  objet TEXT NOT NULL,
  description TEXT,
  questions TEXT[], -- Questions posées au sapiteur
  
  -- Dates
  date_demande DATE NOT NULL,
  date_acceptation DATE,
  date_intervention DATE,
  date_rapport DATE,
  date_facture DATE,
  
  -- Documents
  courrier_demande_path TEXT,
  rapport_path TEXT,
  facture_path TEXT,
  
  -- Financier
  devis_montant DECIMAL(10, 2),
  montant_facture DECIMAL(10, 2),
  montant_paye DECIMAL(10, 2),
  
  -- Statut
  statut TEXT DEFAULT 'demande' CHECK (statut IN (
    'demande',        -- Demande envoyée
    'acceptee',       -- Acceptée par le sapiteur
    'refusee',        -- Refusée
    'en-cours',       -- Intervention en cours
    'rapport-recu',   -- Rapport reçu
    'facturee',       -- Facturée
    'payee',          -- Payée
    'annulee'         -- Annulée
  )),
  
  -- Notes
  notes TEXT,
  conclusion TEXT, -- Conclusion principale du sapiteur
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_interventions_affaire ON interventions_sapiteurs(affaire_id);
CREATE INDEX IF NOT EXISTS idx_interventions_sapiteur ON interventions_sapiteurs(sapiteur_id);
CREATE INDEX IF NOT EXISTS idx_interventions_expert ON interventions_sapiteurs(expert_id);
CREATE INDEX IF NOT EXISTS idx_interventions_statut ON interventions_sapiteurs(statut);

-- RLS (Row Level Security)
ALTER TABLE interventions_sapiteurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les experts voient uniquement leurs interventions"
  ON interventions_sapiteurs FOR ALL
  USING (expert_id = auth.uid());

-- Trigger mise à jour
CREATE TRIGGER update_interventions_updated_at
  BEFORE UPDATE ON interventions_sapiteurs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VUE: Statistiques photos par affaire
-- ============================================================================

CREATE OR REPLACE VIEW vue_photos_stats AS
SELECT 
  affaire_id,
  COUNT(*) as total_photos,
  COUNT(*) FILTER (WHERE inclure_rapport = TRUE) as photos_rapport,
  COUNT(*) FILTER (WHERE annotations IS NOT NULL AND jsonb_array_length(annotations) > 0) as photos_annotees,
  COUNT(DISTINCT categorie) as nb_categories,
  MIN(date_prise) as premiere_photo,
  MAX(date_prise) as derniere_photo
FROM photos
WHERE statut = 'active'
GROUP BY affaire_id;

-- ============================================================================
-- VUE: Statistiques interventions par affaire
-- ============================================================================

CREATE OR REPLACE VIEW vue_interventions_stats AS
SELECT 
  affaire_id,
  COUNT(*) as total_interventions,
  COUNT(*) FILTER (WHERE statut = 'rapport-recu' OR statut = 'facturee' OR statut = 'payee') as interventions_terminees,
  COUNT(*) FILTER (WHERE statut = 'en-cours') as interventions_en_cours,
  SUM(montant_facture) as total_facture,
  SUM(montant_paye) as total_paye
FROM interventions_sapiteurs
WHERE statut != 'annulee'
GROUP BY affaire_id;

-- ============================================================================
-- FONCTION: Numérotation automatique des photos
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_numero_photo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero IS NULL THEN
    SELECT COALESCE(MAX(numero), 0) + 1 INTO NEW.numero
    FROM photos
    WHERE affaire_id = NEW.affaire_id AND statut = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_numero_photo
  BEFORE INSERT ON photos
  FOR EACH ROW EXECUTE FUNCTION auto_numero_photo();

-- ============================================================================
-- Buckets Storage pour les fichiers
-- ============================================================================

-- Création bucket photos (à exécuter dans le dashboard Supabase)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Politique storage photos
-- CREATE POLICY "Photos accessibles aux propriétaires" ON storage.objects
--   FOR ALL USING (
--     bucket_id = 'photos' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Création bucket documents sapiteurs
-- INSERT INTO storage.buckets (id, name, public) VALUES ('sapiteurs-docs', 'sapiteurs-docs', false);

-- Politique storage documents sapiteurs
-- CREATE POLICY "Documents sapiteurs accessibles aux propriétaires" ON storage.objects
--   FOR ALL USING (
--     bucket_id = 'sapiteurs-docs' AND 
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
