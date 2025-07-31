/*
  # Remove Automatic Account Creation
  
  This migration removes the automatic account creation on signup
  in favor of a manual onboarding flow where users create their
  account after providing additional information.
*/

-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_account ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.create_personal_account_on_signup();

-- Add a comment explaining the change
COMMENT ON TABLE public.accounts IS 'User accounts are now created manually during onboarding, not automatically on signup';