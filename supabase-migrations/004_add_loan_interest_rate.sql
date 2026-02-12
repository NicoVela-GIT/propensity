-- Add interest_rate column to loans table
-- This field stores the annual percentage rate (APR) for the loan
-- Used for refinance opportunity alert calculations

ALTER TABLE loans 
ADD COLUMN interest_rate NUMERIC(5,3);

COMMENT ON COLUMN loans.interest_rate IS 
'Annual percentage rate (APR) for the loan. E.g., 4.500 for 4.5%. Used for refinance opportunity alerts.';

-- Add index for refinance alert queries
CREATE INDEX idx_loans_interest_rate ON loans(interest_rate) WHERE interest_rate IS NOT NULL;
