-- Fix missing unique constraint on reserved_domain_permissions table
-- This is why ON CONFLICT (account_id, domain) was failing

-- First, check for any duplicate data that would prevent adding the constraint
SELECT account_id, domain, COUNT(*) 
FROM reserved_domain_permissions 
GROUP BY account_id, domain 
HAVING COUNT(*) > 1;

-- If no duplicates, add the unique constraint
ALTER TABLE reserved_domain_permissions 
ADD CONSTRAINT reserved_domain_permissions_account_domain_unique 
UNIQUE (account_id, domain);

-- Verify the constraint was added
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'reserved_domain_permissions'
    AND tc.constraint_type = 'UNIQUE';

-- Now the migrations with ON CONFLICT (account_id, domain) will work!