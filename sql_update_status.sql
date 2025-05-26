-- Modifier la contrainte pour inclure tous les statuts en français
ALTER TABLE shipments
DROP CONSTRAINT shipments_status_check,
ADD CONSTRAINT shipments_status_check 
CHECK (status = ANY (ARRAY[
    'recu'::text,           -- Reçu
    'assigne'::text,        -- Assigné au livreur
    'en_cours'::text,       -- En cours de livraison
    'livre'::text,          -- Livré
    'retour'::text,         -- Retour
    'recupere'::text        -- Récupéré par le destinataire
])); 