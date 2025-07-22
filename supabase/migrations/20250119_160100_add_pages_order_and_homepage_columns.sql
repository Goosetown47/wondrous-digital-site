-- Add is_homepage column to pages table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS is_homepage BOOLEAN DEFAULT false;

-- Add order_index column to pages table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Create index for performance on order_index
CREATE INDEX IF NOT EXISTS pages_order_index_idx ON pages(project_id, order_index);

-- Create index for finding homepages quickly
CREATE INDEX IF NOT EXISTS pages_is_homepage_idx ON pages(project_id, is_homepage) WHERE is_homepage = true;

-- Set the first page of each project as homepage if none exists
UPDATE pages
SET is_homepage = true
WHERE id IN (
  SELECT DISTINCT ON (project_id) id
  FROM pages
  WHERE NOT EXISTS (
    SELECT 1 FROM pages p2 
    WHERE p2.project_id = pages.project_id 
    AND p2.is_homepage = true
  )
  ORDER BY project_id, created_at ASC
);

-- Update order_index for all pages
-- Homepage gets 0, others get sequential numbers based on creation date
UPDATE pages 
SET order_index = subquery.row_num - 1
FROM (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY project_id 
           ORDER BY 
             CASE WHEN is_homepage THEN 0 ELSE 1 END,
             created_at ASC
         ) as row_num
  FROM pages
) AS subquery
WHERE pages.id = subquery.id;