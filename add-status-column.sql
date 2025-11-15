-- Add status column to properties table
-- Run this SQL in your Supabase SQL Editor if you want to use the status field

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'));

-- Create an index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);

-- Update existing rows to have 'active' status
UPDATE properties SET status = 'active' WHERE status IS NULL;

