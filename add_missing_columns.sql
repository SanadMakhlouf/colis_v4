-- Add missing columns to shipments table
ALTER TABLE shipments
ADD COLUMN parcel_type VARCHAR(50),
ADD COLUMN length DECIMAL(10,2),
ADD COLUMN width DECIMAL(10,2),
ADD COLUMN height DECIMAL(10,2);

-- Add comments to describe the columns
COMMENT ON COLUMN shipments.parcel_type IS 'Type of parcel (standard, fragile, express)';
COMMENT ON COLUMN shipments.length IS 'Length of the package in centimeters';
COMMENT ON COLUMN shipments.width IS 'Width of the package in centimeters';
COMMENT ON COLUMN shipments.height IS 'Height of the package in centimeters'; 