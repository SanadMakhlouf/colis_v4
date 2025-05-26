-- 1. Voir les statuts distincts actuels
SELECT DISTINCT status FROM shipments;

-- 2. Mettre à jour les anciennes valeurs vers les nouvelles
UPDATE shipments SET status = 'recu' WHERE status = 'processing';
UPDATE shipments SET status = 'assigne' WHERE status = 'assigned';
UPDATE shipments SET status = 'en_cours' WHERE status = 'in_transit';
UPDATE shipments SET status = 'livre' WHERE status = 'delivered';
UPDATE shipments SET status = 'retour' WHERE status = 'cancelled';

-- 3. Vérifier qu'il ne reste plus d'anciens statuts
SELECT DISTINCT status FROM shipments; 