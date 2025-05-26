-- Modifier la contrainte existante
ALTER TABLE shipments
DROP CONSTRAINT shipments_status_check,
ADD CONSTRAINT shipments_status_check 
CHECK (status = ANY (ARRAY['processing'::text, 'in_transit'::text, 'delivered'::text, 'cancelled'::text, 'assigned'::text])); 