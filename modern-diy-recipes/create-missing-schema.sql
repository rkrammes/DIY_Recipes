-- SQL script to create missing tables and functions for Kraft AI application
-- Run this in the Supabase SQL Editor to fix the missing tables and functions

-- 1. Create the exec_sql function that is missing
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS SETOF record
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE sql;
END;
$$;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.exec_sql TO anon, authenticated, service_role;

-- 2. Create the missing iterations table
CREATE TABLE IF NOT EXISTS public.iterations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID,
  version INTEGER DEFAULT 1,
  notes TEXT,
  data JSONB DEFAULT '{}'::jsonb
);

-- Add comment to the iterations table
COMMENT ON TABLE public.iterations IS 'Stores recipe iterations and revision history';

-- Grant appropriate permissions
ALTER TABLE public.iterations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public iterations are viewable by everyone" 
  ON public.iterations FOR SELECT USING (true);
  
CREATE POLICY "Authenticated users can insert iterations"
  ON public.iterations FOR INSERT TO authenticated USING (true);
  
CREATE POLICY "Users can update their own iterations"
  ON public.iterations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own iterations"
  ON public.iterations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. Create the missing users table 
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb,
  theme TEXT DEFAULT 'hackers',
  role TEXT DEFAULT 'user'
);

-- Add comment to the users table
COMMENT ON TABLE public.users IS 'Profiles and extended information for authenticated users';

-- Create a trigger to automatically create a user profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant appropriate permissions
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.users FOR SELECT USING (true);
  
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);