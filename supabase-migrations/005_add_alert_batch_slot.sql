-- Migration: Add Alert Batch Slot for Distributed Processing
-- This migration adds a batch slot column to distribute alert generation
-- across 24 hours instead of processing all properties at once.

-- Add alert_batch_slot to properties table
-- Values 0-23 represent the hour of day (UTC) when alerts should be generated
ALTER TABLE properties 
ADD COLUMN alert_batch_slot INTEGER DEFAULT 0 CHECK (alert_batch_slot >= 0 AND alert_batch_slot < 24);

-- Create index for efficient batch queries
CREATE INDEX idx_properties_batch_slot ON properties(alert_batch_slot);

-- Distribute existing properties across all 24 hours
-- Uses modulo of a hash of the property ID for even distribution
UPDATE properties 
SET alert_batch_slot = (
  -- Use first 8 characters of UUID, convert to integer, mod 24
  -- Use ABS to ensure positive result
  ABS(('x' || substring(id::text, 1, 8))::bit(32)::int) % 24
);

-- Add comment
COMMENT ON COLUMN properties.alert_batch_slot IS 'Hour of day (0-23 UTC) when alerts should be generated for this property. Distributes load across 24 hours.';
