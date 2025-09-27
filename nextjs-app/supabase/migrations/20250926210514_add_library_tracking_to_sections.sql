-- Add library tracking to page sections
-- This migration adds library_item_id and library_version to track which library items are being used

-- First, let's update the pages table to ensure sections can store library references
-- The sections column is JSONB, so we need to update the structure of existing sections

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

-- Attempt to match existing sections to library items by component_name
-- This is a best-effort attempt to retroactively link sections to their source library items
DO $$
DECLARE
    page_record RECORD;
    section_record RECORD;
    library_item RECORD;
    updated_sections JSONB;
    section_index INT;
BEGIN
    -- Loop through all pages
    FOR page_record IN SELECT id, sections FROM pages WHERE sections IS NOT NULL
    LOOP
        updated_sections := page_record.sections;
        section_index := 0;

        -- Loop through each section in the page
        FOR section_record IN SELECT * FROM jsonb_array_elements(page_record.sections)
        LOOP
            -- Try to find a matching library item by component_name
            IF section_record.value->>'component_name' IS NOT NULL THEN
                SELECT * INTO library_item
                FROM library_items
                WHERE component_name = section_record.value->>'component_name'
                   OR name = section_record.value->>'component_name'
                   OR (metadata->>'code_name') = section_record.value->>'component_name'
                   OR (content->>'code_name') = section_record.value->>'component_name'
                ORDER BY created_at DESC
                LIMIT 1;

                -- If we found a matching library item, update the section
                IF library_item.id IS NOT NULL THEN
                    updated_sections := jsonb_set(
                        updated_sections,
                        ARRAY[section_index::TEXT, 'library_item_id'],
                        to_jsonb(library_item.id)
                    );
                    updated_sections := jsonb_set(
                        updated_sections,
                        ARRAY[section_index::TEXT, 'library_version'],
                        to_jsonb(COALESCE(library_item.version, 1))
                    );
                END IF;
            END IF;

            section_index := section_index + 1;
        END LOOP;

        -- Update the page with the matched library items
        IF updated_sections != page_record.sections THEN
            UPDATE pages SET sections = updated_sections WHERE id = page_record.id;
        END IF;
    END LOOP;

    -- Do the same for published_sections
    FOR page_record IN SELECT id, published_sections FROM pages WHERE published_sections IS NOT NULL
    LOOP
        updated_sections := page_record.published_sections;
        section_index := 0;

        FOR section_record IN SELECT * FROM jsonb_array_elements(page_record.published_sections)
        LOOP
            IF section_record.value->>'component_name' IS NOT NULL THEN
                SELECT * INTO library_item
                FROM library_items
                WHERE component_name = section_record.value->>'component_name'
                   OR name = section_record.value->>'component_name'
                   OR (metadata->>'code_name') = section_record.value->>'component_name'
                   OR (content->>'code_name') = section_record.value->>'component_name'
                ORDER BY created_at DESC
                LIMIT 1;

                IF library_item.id IS NOT NULL THEN
                    updated_sections := jsonb_set(
                        updated_sections,
                        ARRAY[section_index::TEXT, 'library_item_id'],
                        to_jsonb(library_item.id)
                    );
                    updated_sections := jsonb_set(
                        updated_sections,
                        ARRAY[section_index::TEXT, 'library_version'],
                        to_jsonb(COALESCE(library_item.version, 1))
                    );
                END IF;
            END IF;

            section_index := section_index + 1;
        END LOOP;

        IF updated_sections != page_record.published_sections THEN
            UPDATE pages SET published_sections = updated_sections WHERE id = page_record.id;
        END IF;
    END LOOP;
END;
$$;

-- Add a comment explaining the new fields
COMMENT ON COLUMN pages.sections IS 'Array of page sections. Each section now includes library_item_id and library_version for tracking library usage.';
COMMENT ON COLUMN pages.published_sections IS 'Array of published page sections. Each section includes library_item_id and library_version for tracking library usage.';