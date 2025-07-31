/*
  # Create Personal Account on User Signup
  
  This migration adds a trigger that automatically creates a personal account
  for new users when they sign up, and adds them as the account owner.
  
  Changes:
  1. Creates function create_personal_account_on_signup()
  2. Creates trigger on auth.users to call the function
  3. Ensures every new user has their own account
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.create_personal_account_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  new_account_id UUID;
  account_name TEXT;
  account_slug TEXT;
BEGIN
  -- Generate account name from email
  account_name := COALESCE(
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1) || '''s Account'
  );
  
  -- Generate a unique slug from the email
  account_slug := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]+', '-', 'g'));
  
  -- Ensure slug is unique by appending a random suffix if needed
  WHILE EXISTS (SELECT 1 FROM public.accounts WHERE slug = account_slug) LOOP
    account_slug := account_slug || '-' || substr(md5(random()::text), 1, 4);
  END LOOP;
  
  -- Create the personal account
  INSERT INTO public.accounts (name, slug, plan, settings)
  VALUES (
    account_name,
    account_slug,
    'free',
    jsonb_build_object(
      'created_via', 'signup_trigger',
      'created_at', NOW(),
      'owner_email', NEW.email
    )
  )
  RETURNING id INTO new_account_id;
  
  -- Add the user as account owner
  INSERT INTO public.account_users (account_id, user_id, role)
  VALUES (new_account_id, NEW.id, 'account_owner');
  
  -- Log the account creation
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    actor_id,
    actor_type,
    ip_address,
    user_agent,
    metadata
  )
  VALUES (
    'accounts',
    new_account_id,
    'INSERT',
    NEW.id,
    'user',
    NEW.raw_user_meta_data->>'ip_address',
    NEW.raw_user_meta_data->>'user_agent',
    jsonb_build_object(
      'account_name', account_name,
      'account_slug', account_slug,
      'trigger', 'signup',
      'user_email', NEW.email
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'create_personal_account_on_signup error for user %: %', NEW.id, SQLERRM;
    
    -- Still log the error to audit_logs
    INSERT INTO public.audit_logs (
      table_name,
      record_id,
      action,
      actor_id,
      actor_type,
      metadata
    )
    VALUES (
      'accounts',
      NULL,
      'ERROR',
      NEW.id,
      'system',
      jsonb_build_object(
        'error', SQLERRM,
        'function', 'create_personal_account_on_signup',
        'user_email', NEW.email
      )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created_account ON auth.users;
CREATE TRIGGER on_auth_user_created_account
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_personal_account_on_signup();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_personal_account_on_signup() TO postgres, service_role;