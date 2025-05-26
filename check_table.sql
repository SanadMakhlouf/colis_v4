-- Vérifier d'abord si les colonnes existent
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'shipments';

-- Supprimer les anciennes colonnes si elles existent avec un nom différent
ALTER TABLE shipments 
DROP COLUMN IF EXISTS parcelType,
DROP COLUMN IF EXISTS parcel_type;

-- Ajouter les nouvelles colonnes avec les bons noms
ALTER TABLE shipments 
ADD COLUMN IF NOT EXISTS parcel_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS length NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS width NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS height NUMERIC(10,2);

-- Rafraîchir le cache du schéma
SELECT schema_cache_reload(); 