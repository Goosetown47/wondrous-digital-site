-- Add www.wondrousdigital.com to project_domains
-- This complements the reserved_domain_permissions entry

-- First, let's find the project that uses wondrousdigital.com
DO $$
DECLARE
    v_project_id UUID;
    v_account_id UUID := '19519371-1db4-44a1-ac70-3d5c5cfc32ee';
BEGIN
    -- Find the project that already has wondrousdigital.com
    SELECT pd.project_id INTO v_project_id
    FROM project_domains pd
    JOIN projects p ON p.id = pd.project_id
    WHERE pd.domain = 'wondrousdigital.com'
    AND p.account_id = v_account_id
    LIMIT 1;
    
    -- If we found a project, add www.wondrousdigital.com
    IF v_project_id IS NOT NULL THEN
        INSERT INTO project_domains (
            project_id,
            domain,
            is_primary,
            verified,
            verified_at,
            ssl_state,
            include_www,
            created_at
        )
        VALUES (
            v_project_id,
            'www.wondrousdigital.com',
            false,  -- Not primary, wondrousdigital.com is primary
            true,   -- Mark as verified
            NOW(),  -- Verified now
            'ACTIVE', -- SSL is active (from screenshots)
            true,   -- Include www subdomain
            NOW()
        )
        ON CONFLICT (domain) DO UPDATE SET
            verified = true,
            verified_at = NOW(),
            ssl_state = 'ACTIVE';
            
        RAISE NOTICE 'Added www.wondrousdigital.com for project %', v_project_id;
    ELSE
        RAISE NOTICE 'No project found with wondrousdigital.com for account %', v_account_id;
    END IF;
END $$;