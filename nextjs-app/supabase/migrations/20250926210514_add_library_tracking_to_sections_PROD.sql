-- PRODUCTION VERSION - Structure only, no content matching
-- This migration adds library_item_id and library_version fields to page sections
-- without trying to match existing content (PROD has different content than DEV)

-- Add a helper function to update section structures
CREATE OR REPLACE FUNCTION update_sections_with_library_tracking()
RETURNS void AS $$
DECLARE
    page_record RECORD;
    updated_sections JSONB;
    section JSONB;
    section_array JSONB[];
BEGIN
    -- Loop through all pages
    FOR page_record IN SELECT id, sections, published_sections FROM pages
    LOOP
        -- Process sections array if it exists
        IF page_record.sections IS NOT NULL AND jsonb_array_length(page_record.sections) > 0 THEN
            section_array := ARRAY[]::JSONB[];

            -- Process each section
            FOR section IN SELECT * FROM jsonb_array_elements(page_record.sections)
            LOOP
                -- Add library tracking fields if they don't exist
                IF NOT (section ? 'library_item_id') THEN
                    section := section || '{"library_item_id": null}'::JSONB;
                END IF;
                IF NOT (section ? 'library_version') THEN
                    section := section || '{"library_version": null}'::JSONB;
                END IF;

                section_array := array_append(section_array, section);
            END LOOP;

            -- Update the sections column
            UPDATE pages
            SET sections = array_to_json(section_array)::JSONB
            WHERE id = page_record.id;
        END IF;

        -- Process published_sections array if it exists
        IF page_record.published_sections IS NOT NULL AND jsonb_array_length(page_record.published_sections) > 0 THEN
            section_array := ARRAY[]::JSONB[];

            -- Process each section
            FOR section IN SELECT * FROM jsonb_array_elements(page_record.published_sections)
            LOOP
                -- Add library tracking fields if they don't exist
                IF NOT (section ? 'library_item_id') THEN
                    section := section || '{"library_item_id": null}'::JSONB;
                END IF;
                IF NOT (section ? 'library_version') THEN
                    section := section || '{"library_version": null}'::JSONB;
                END IF;

                section_array := array_append(section_array, section);
            END LOOP;

            -- Update the published_sections column
            UPDATE pages
            SET published_sections = array_to_json(section_array)::JSONB
            WHERE id = page_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to update existing sections
SELECT update_sections_with_library_tracking();

-- Drop the helper function as we no longer need it
DROP FUNCTION update_sections_with_library_tracking();

-- Add comments explaining the new fields
COMMENT ON COLUMN pages.sections IS 'Array of page sections. Each section now includes library_item_id and library_version for tracking library usage.';
COMMENT ON COLUMN pages.published_sections IS 'Array of published page sections. Each section includes library_item_id and library_version for tracking library usage.';