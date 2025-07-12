/*
  # Add Wondrous Digital Marketing Website Project

  1. New Records
    - Add the Wondrous Digital marketing website as a project
    - Associate existing Wondrous Digital posts with this project
    - Create external links for the marketing website
    
  2. Purpose
    - Allow admins to manage the main Wondrous Digital marketing site
    - Provide proper organization of content between templates and actual business site
    - Complete the account/project structure
*/

-- First, get the Wondrous Digital customer ID
DO $$
DECLARE
    wondrous_id uuid;
    marketing_site_id uuid;
BEGIN
    -- Get Wondrous Digital customer ID
    SELECT id INTO wondrous_id FROM customers 
    WHERE business_name = 'Wondrous Digital' 
    LIMIT 1;
    
    -- Only proceed if we found the customer
    IF wondrous_id IS NOT NULL THEN
        -- Check if a project for this domain already exists
        SELECT id INTO marketing_site_id FROM projects 
        WHERE domain = 'wondrousdigital.com' 
        LIMIT 1;
        
        -- If marketing site doesn't exist yet, create it
        IF marketing_site_id IS NULL THEN
            INSERT INTO projects (
                customer_id, 
                project_name, 
                domain, 
                project_type, 
                niche, 
                is_active
            )
            VALUES (
                wondrous_id, 
                'Marketing Website', 
                'wondrousdigital.com', 
                'main_site', 
                'digital_agency', 
                true
            )
            RETURNING id INTO marketing_site_id;
        END IF;
        
        -- Move any existing posts that belong to Wondrous Digital to this project
        UPDATE posts
        SET project_id = marketing_site_id
        WHERE customer_id IS NULL
        AND project_id IS NULL;
        
        -- Add external links for this project if they don't exist
        INSERT INTO external_links (
            customer_id, 
            project_id, 
            gohighlevel_url, 
            searchatlas_url, 
            stripe_portal_url
        )
        SELECT
            wondrous_id,
            marketing_site_id,
            'https://agency.gohighlevel.com/v2/location/JQPgBYcbXOYB9nnqN7zV/',
            'https://app.searchatlas.com/dashboard',
            'https://dashboard.stripe.com/customers'
        WHERE NOT EXISTS (
            SELECT 1 FROM external_links 
            WHERE project_id = marketing_site_id
        );
    END IF;
END
$$;