-- Create Sample Projects for Test Accounts
-- Run this after users and accounts are set up

-- ============================================================================
-- STEP 7: Create Sample Projects
-- ============================================================================

-- First, ensure we have the Test Company 1 account ID
-- (this should already exist from previous steps)
DO $$
DECLARE
  test_account_id UUID;
  owner_user_id UUID;
BEGIN
  -- Get Test Company 1 account ID
  SELECT id INTO test_account_id
  FROM accounts 
  WHERE slug = 'test-company-1'
  LIMIT 1;
  
  -- Get the owner user ID for this account
  SELECT user_id INTO owner_user_id
  FROM account_users
  WHERE account_id = test_account_id
    AND role = 'account_owner'
  LIMIT 1;
  
  -- Only proceed if we have both IDs
  IF test_account_id IS NOT NULL AND owner_user_id IS NOT NULL THEN
    -- Create Sample Website Project
    INSERT INTO projects (
      account_id, 
      name, 
      slug, 
      created_by, 
      settings, 
      status,
      created_at,
      updated_at
    )
    VALUES (
      test_account_id,
      'Sample Marketing Site',
      'sample-marketing-' || LEFT(MD5(RANDOM()::TEXT), 6),
      owner_user_id,
      '{
        "theme": "default",
        "seo": {
          "title": "Sample Marketing Site",
          "description": "A demo marketing website"
        }
      }'::jsonb,
      'active',
      NOW(),
      NOW()
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- Create E-commerce Demo Project
    INSERT INTO projects (
      account_id, 
      name, 
      slug, 
      created_by, 
      settings, 
      status,
      created_at,
      updated_at
    )
    VALUES (
      test_account_id,
      'E-commerce Demo',
      'ecommerce-demo-' || LEFT(MD5(RANDOM()::TEXT), 6),
      owner_user_id,
      '{
        "theme": "modern",
        "seo": {
          "title": "E-commerce Demo Store",
          "description": "A demo e-commerce website"
        }
      }'::jsonb,
      'active',
      NOW(),
      NOW()
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- Create Blog Template Project
    INSERT INTO projects (
      account_id, 
      name, 
      slug, 
      created_by, 
      settings, 
      status,
      created_at,
      updated_at
    )
    VALUES (
      test_account_id,
      'Blog Template',
      'blog-template-' || LEFT(MD5(RANDOM()::TEXT), 6),
      owner_user_id,
      '{
        "theme": "minimal",
        "seo": {
          "title": "Sample Blog",
          "description": "A demo blog website"
        }
      }'::jsonb,
      'draft',
      NOW(),
      NOW()
    ) ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;

-- Create projects for Test Company 2
DO $$
DECLARE
  test_account_id UUID;
  owner_user_id UUID;
BEGIN
  -- Get Test Company 2 account ID
  SELECT id INTO test_account_id
  FROM accounts 
  WHERE slug = 'test-company-2'
  LIMIT 1;
  
  -- For Test Company 2, we'll use the same owner for demo purposes
  owner_user_id := 'ec6595d2-f10b-441a-8de6-85f54dab0f6f';
  
  IF test_account_id IS NOT NULL THEN
    -- Create Portfolio Project
    INSERT INTO projects (
      account_id, 
      name, 
      slug, 
      created_by, 
      settings, 
      status,
      created_at,
      updated_at
    )
    VALUES (
      test_account_id,
      'Portfolio Showcase',
      'portfolio-' || LEFT(MD5(RANDOM()::TEXT), 6),
      owner_user_id,
      '{
        "theme": "creative",
        "seo": {
          "title": "Portfolio Showcase",
          "description": "Creative portfolio website"
        }
      }'::jsonb,
      'active',
      NOW(),
      NOW()
    ) ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;

-- Create projects for Demo Agency
DO $$
DECLARE
  demo_account_id UUID;
  admin_user_id UUID;
BEGIN
  -- Get Demo Agency account ID
  SELECT id INTO demo_account_id
  FROM accounts 
  WHERE slug = 'demo-agency'
  LIMIT 1;
  
  -- Use platform admin as creator for demo agency
  admin_user_id := '6f18a5c6-7159-4f74-8cb8-a5a2e4b6f5a1'; -- Tyler's ID
  
  IF demo_account_id IS NOT NULL THEN
    -- Create Agency Website Project
    INSERT INTO projects (
      account_id, 
      name, 
      slug, 
      created_by, 
      settings, 
      status,
      created_at,
      updated_at
    )
    VALUES (
      demo_account_id,
      'Agency Website',
      'agency-site-' || LEFT(MD5(RANDOM()::TEXT), 6),
      admin_user_id,
      '{
        "theme": "professional",
        "seo": {
          "title": "Demo Agency",
          "description": "Professional agency website"
        }
      }'::jsonb,
      'active',
      NOW(),
      NOW()
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- Create Client Project Template
    INSERT INTO projects (
      account_id, 
      name, 
      slug, 
      created_by, 
      settings, 
      status,
      created_at,
      updated_at
    )
    VALUES (
      demo_account_id,
      'Client Template',
      'client-template-' || LEFT(MD5(RANDOM()::TEXT), 6),
      admin_user_id,
      '{
        "theme": "default",
        "seo": {
          "title": "Client Website Template",
          "description": "Template for client projects"
        }
      }'::jsonb,
      'draft',
      NOW(),
      NOW()
    ) ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- Create Sample Pages for Projects
-- ============================================================================

-- Add homepage to each active project
INSERT INTO pages (project_id, title, slug, content, settings, status, created_by, created_at, updated_at)
SELECT 
  p.id,
  'Home',
  'home',
  '{
    "sections": [
      {
        "id": "hero-1",
        "type": "hero",
        "content": {
          "title": "Welcome to ' || p.name || '",
          "subtitle": "Built with Wondrous Digital Platform"
        }
      }
    ]
  }'::jsonb,
  '{
    "isHomePage": true,
    "seo": {
      "title": "Home - ' || p.name || '",
      "description": "Welcome to our website"
    }
  }'::jsonb,
  'published',
  p.created_by,
  NOW(),
  NOW()
FROM projects p
WHERE p.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM pages 
    WHERE project_id = p.id AND slug = 'home'
  );

-- Add about page to each active project
INSERT INTO pages (project_id, title, slug, content, settings, status, created_by, created_at, updated_at)
SELECT 
  p.id,
  'About',
  'about',
  '{
    "sections": [
      {
        "id": "content-1",
        "type": "content",
        "content": {
          "title": "About Us",
          "text": "Learn more about ' || p.name || '"
        }
      }
    ]
  }'::jsonb,
  '{"seo": {"title": "About - ' || p.name || '"}}'::jsonb,
  'published',
  p.created_by,
  NOW(),
  NOW()
FROM projects p
WHERE p.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM pages 
    WHERE project_id = p.id AND slug = 'about'
  );

-- ============================================================================
-- Verify Sample Data Creation
-- ============================================================================

-- Check projects by account
SELECT 
  a.name as account_name,
  COUNT(p.id) as project_count,
  array_agg(p.name ORDER BY p.created_at) as project_names
FROM accounts a
LEFT JOIN projects p ON p.account_id = a.id
WHERE a.slug IN ('test-company-1', 'test-company-2', 'demo-agency')
GROUP BY a.id, a.name
ORDER BY a.name;

-- Check pages by project
SELECT 
  p.name as project_name,
  COUNT(pg.id) as page_count,
  array_agg(pg.title ORDER BY pg.created_at) as page_titles
FROM projects p
LEFT JOIN pages pg ON pg.project_id = p.id
WHERE p.account_id IN (
  SELECT id FROM accounts 
  WHERE slug IN ('test-company-1', 'test-company-2', 'demo-agency')
)
GROUP BY p.id, p.name
ORDER BY p.name;