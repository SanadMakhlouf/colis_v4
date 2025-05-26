-- Supprimer toutes les contraintes sur la colonne status
ALTER TABLE shipments
DROP CONSTRAINT IF EXISTS shipments_status_check;

-- Supprimer toute autre contrainte potentielle sur status
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT con.conname
              FROM pg_constraint con
              INNER JOIN pg_class rel ON rel.oid = con.conrelid
              INNER JOIN pg_attribute att ON att.attrelid = rel.oid
              WHERE rel.relname = 'shipments'
              AND att.attname = 'status'
              AND con.contype = 'c')
    LOOP
        EXECUTE 'ALTER TABLE shipments DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$; 