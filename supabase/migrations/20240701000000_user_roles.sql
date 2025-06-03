-- First, create the user_role enum type
CREATE TYPE user_role AS ENUM (
  'standard_user',
  'premium_user', 
  'ultra_premium_user',
  'gym_trainer',
  'gym_influencer',
  'admin',
  'guest'
);

-- If profiles table already exists, modify it
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'profiles') THEN
    
    -- Update the role column to use the enum type
    -- First add a temporary column
    ALTER TABLE public.profiles 
      ADD COLUMN temp_role user_role DEFAULT 'standard_user'::user_role;
    
    -- Copy data with conversion (if any exists)
    UPDATE public.profiles 
    SET temp_role = CASE 
      WHEN role = 'admin' THEN 'admin'::user_role
      WHEN role = 'customer' THEN 'standard_user'::user_role
      ELSE 'standard_user'::user_role
    END;
    
    -- Drop old column and rename temp
    ALTER TABLE public.profiles DROP COLUMN role;
    ALTER TABLE public.profiles RENAME COLUMN temp_role TO role;
    
    -- Add additional profile attributes
    ALTER TABLE public.profiles 
      ADD COLUMN IF NOT EXISTS subscription_status TEXT,
      ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS trainer_specialty TEXT,
      ADD COLUMN IF NOT EXISTS trainer_experience INTEGER,
      ADD COLUMN IF NOT EXISTS influencer_followers INTEGER,
      ADD COLUMN IF NOT EXISTS influencer_platform TEXT,
      ADD COLUMN IF NOT EXISTS admin_level INTEGER,
      ADD COLUMN IF NOT EXISTS metadata JSONB;

  ELSE
    -- If profiles table doesn't exist, create it
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT,
      phone_number TEXT,
      address TEXT,
      role user_role DEFAULT 'standard_user'::user_role,
      subscription_status TEXT,
      subscription_expiry TIMESTAMP WITH TIME ZONE,
      trainer_specialty TEXT,
      trainer_experience INTEGER,
      influencer_followers INTEGER,
      influencer_platform TEXT,
      admin_level INTEGER,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create or replace policies
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
CREATE POLICY "Users can view their own profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
CREATE POLICY "Users can update their own profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Admin role policy for managing users
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

-- Create function to check user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS user_role AS $$
DECLARE
  user_role user_role;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(required_role user_role, user_id UUID DEFAULT auth.uid())
RETURNS boolean AS $$
DECLARE
  user_role user_role;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  
  -- Admin role has access to everything
  IF user_role = 'admin'::user_role THEN
    RETURN true;
  END IF;
  
  -- Premium user hierarchy
  IF required_role = 'standard_user'::user_role AND 
     (user_role = 'premium_user'::user_role OR user_role = 'ultra_premium_user'::user_role) THEN
    RETURN true;
  END IF;
  
  -- Ultra premium includes premium
  IF required_role = 'premium_user'::user_role AND user_role = 'ultra_premium_user'::user_role THEN
    RETURN true;
  END IF;
  
  -- Direct role match
  RETURN user_role = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to ensure new users get a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, created_at, updated_at)
  VALUES (new.id, 'standard_user'::user_role, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if the trigger already exists and create it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$; 