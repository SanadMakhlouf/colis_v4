-- Supprimer d'abord l'ancienne contrainte
ALTER TABLE shipments
DROP CONSTRAINT IF EXISTS shipments_status_check;

-- Ajouter la nouvelle contrainte
ALTER TABLE shipments
ADD CONSTRAINT shipments_status_check 
CHECK (status = ANY (ARRAY[
    'recu'::text,           -- Reçu
    'assigne'::text,        -- Assigné au livreur
    'en_cours'::text,       -- En cours de livraison
    'livre'::text,          -- Livré
    'retour'::text,         -- Retour
    'recupere'::text        -- Récupéré par le destinataire
])); 