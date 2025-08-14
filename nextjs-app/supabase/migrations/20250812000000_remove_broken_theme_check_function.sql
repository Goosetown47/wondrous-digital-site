-- Remove broken check_theme_type function and associated triggers
-- This function was designed for a themes table that doesn't exist
-- and is causing errors when updating project themes

-- First, find and drop any triggers that use the check_theme_type function
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Find all triggers that might be using check_theme_type
    FOR trigger_record IN 
        SELECT 
            n.nspname AS schema_name,
            c.relname AS table_name,
            t.tgname AS trigger_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE p.proname = 'check_theme_type'
        AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE',
            trigger_record.trigger_name,
            trigger_record.schema_name,
            trigger_record.table_name
        );
        RAISE NOTICE 'Dropped trigger % on %.%', 
            trigger_record.trigger_name, 
            trigger_record.schema_name, 
            trigger_record.table_name;
    END LOOP;
END $$;

-- Now drop the function itself
DROP FUNCTION IF EXISTS public.check_theme_type() CASCADE;

-- Add comment explaining the removal
COMMENT ON TABLE projects IS 'Projects table. Note: check_theme_type trigger was removed as it referenced non-existent tables and fields.';