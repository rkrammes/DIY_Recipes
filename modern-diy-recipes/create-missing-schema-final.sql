-- SQL script to create missing tables and functions for Kraft AI application
-- Final version with corrected policy syntax

-- 1. Drop the existing exec_sql function first to avoid return type conflicts
DROP FUNCTION IF EXISTS public.exec_sql(text);

-- Now create the exec_sql function with the correct return type
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

-- 2. Create the missing iterations table (if it doesn't exist)
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

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public iterations are viewable by everyone" ON public.iterations;
DROP POLICY IF EXISTS "Authenticated users can insert iterations" ON public.iterations;
DROP POLICY IF EXISTS "Users can update their own iterations" ON public.iterations;
DROP POLICY IF EXISTS "Users can delete their own iterations" ON public.iterations;

-- Create policies with the correct syntax
CREATE POLICY "Public iterations are viewable by everyone" 
  ON public.iterations FOR SELECT 
  USING (true);
  
CREATE POLICY "Authenticated users can insert iterations"
  ON public.iterations FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Users can update their own iterations"
  ON public.iterations FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own iterations"
  ON public.iterations FOR DELETE 
  USING (auth.uid() = user_id);

-- 3. Create the missing users table (if it doesn't exist)
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant appropriate permissions
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Create policies with the correct syntax
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.users FOR SELECT 
  USING (true);
  
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);