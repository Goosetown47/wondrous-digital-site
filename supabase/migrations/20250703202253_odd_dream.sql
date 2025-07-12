/*
  # Fix Post Published Dates

  1. Updates
    - Update existing posts to have current/past published dates so they show up on the blog
    
  2. Changes
    - Set "The 5-Minute Rule" post to December 15, 2024
    - Set "Night-Shift Website" post to December 10, 2024
*/

-- Update the published dates to be in the past so posts are visible
UPDATE posts 
SET published_at = '2024-12-15 10:00:00-05'::timestamptz
WHERE slug = 'the-5-minute-rule';

UPDATE posts 
SET published_at = '2024-12-10 14:30:00-05'::timestamptz  
WHERE slug = 'nightshift-website';