-- Populate core_components table with all shadcn/ui components
-- Run this in DEV Supabase Dashboard SQL Editor
-- This is the complete production data

-- Clear existing core components to avoid conflicts
TRUNCATE TABLE core_components CASCADE;

-- Insert all 25 core components from production