-- Ajout des colonnes pour les dimensions et le type de colis
ALTER TABLE shipments
ADD COLUMN IF NOT EXISTS parcel_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS length NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS width NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS height NUMERIC(10,2); 