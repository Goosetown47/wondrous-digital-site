-- Add live_url field to deployment_queue for easier URL retrieval
ALTER TABLE public.deployment_queue
ADD COLUMN IF NOT EXISTS live_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.deployment_queue.live_url IS 'The final live URL of the deployed site (e.g., https://dentist-1.wondrousdigital.com)';