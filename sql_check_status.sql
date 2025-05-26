-- Voir tous les statuts actuels et leur nombre
SELECT status, COUNT(*) as count 
FROM shipments 
GROUP BY status 
ORDER BY count DESC; 