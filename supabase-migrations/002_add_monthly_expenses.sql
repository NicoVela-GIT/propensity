-- Add monthly_expenses_override column to properties table
-- This allows users to enter a single monthly expenses amount
-- instead of requiring detailed expense tracking by category

ALTER TABLE properties 
ADD COLUMN monthly_expenses_override NUMERIC(10,2);

COMMENT ON COLUMN properties.monthly_expenses_override IS 
'User-provided total monthly expenses estimate. Used when detailed expense tracking is not needed.';
