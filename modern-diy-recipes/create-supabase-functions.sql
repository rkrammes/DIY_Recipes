-- Create RPC functions for SQL execution
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Alternative function name that might be used
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Create basic RLS policies for development
-- These will allow the anon key to access data for development purposes
-- In production, you should restrict access appropriately

-- For recipes table
ALTER TABLE IF EXISTS public.recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous access to recipes" ON public.recipes;
CREATE POLICY "Allow anonymous access to recipes" ON public.recipes FOR ALL USING (true);

-- For ingredients table
ALTER TABLE IF EXISTS public.ingredients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous access to ingredients" ON public.ingredients;
CREATE POLICY "Allow anonymous access to ingredients" ON public.ingredients FOR ALL USING (true);

-- For recipe_ingredients table
ALTER TABLE IF EXISTS public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous access to recipe_ingredients" ON public.recipe_ingredients;
CREATE POLICY "Allow anonymous access to recipe_ingredients" ON public.recipe_ingredients FOR ALL USING (true);

-- For tools table
ALTER TABLE IF EXISTS public.tools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous access to tools" ON public.tools;
CREATE POLICY "Allow anonymous access to tools" ON public.tools FOR ALL USING (true);

-- For library table
ALTER TABLE IF EXISTS public.library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous access to library" ON public.library;
CREATE POLICY "Allow anonymous access to library" ON public.library FOR ALL USING (true);
