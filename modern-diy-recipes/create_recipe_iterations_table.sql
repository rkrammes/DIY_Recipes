-- SQL script to create the recipe_iterations table
-- Run this in Supabase SQL Editor

-- Make sure we have UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create recipe_iterations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.recipe_iterations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  metrics JSONB,
  instructions TEXT,
  UNIQUE(recipe_id, version_number)
);

-- Create index for fast lookups by recipe_id
CREATE INDEX IF NOT EXISTS idx_recipe_iterations_recipe_id ON public.recipe_iterations(recipe_id);

-- Create or replace a function to automatically create the first iteration when a recipe is created
CREATE OR REPLACE FUNCTION create_initial_recipe_iteration() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.recipe_iterations (
    recipe_id, 
    version_number, 
    title, 
    description, 
    instructions
  ) VALUES (
    NEW.id, 
    1, 
    NEW.title, 
    NEW.description, 
    NEW.instructions
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create initial iteration
DROP TRIGGER IF EXISTS trigger_create_initial_recipe_iteration ON public.recipes;
CREATE TRIGGER trigger_create_initial_recipe_iteration
AFTER INSERT ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION create_initial_recipe_iteration();

-- Create table to store ingredient relationships for each iteration
CREATE TABLE IF NOT EXISTS public.iteration_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  iteration_id UUID NOT NULL REFERENCES public.recipe_iterations(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id),
  quantity TEXT,
  unit TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(iteration_id, ingredient_id)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_iteration_ingredients_iteration_id ON public.iteration_ingredients(iteration_id);

-- Create function to copy ingredients when creating a new iteration
CREATE OR REPLACE FUNCTION copy_ingredients_to_iteration(src_recipe_id UUID, dest_iteration_id UUID) 
RETURNS VOID AS $$
BEGIN
  -- Copy ingredients from recipe_ingredients to iteration_ingredients
  INSERT INTO public.iteration_ingredients (
    iteration_id,
    ingredient_id,
    quantity,
    unit,
    notes
  )
  SELECT 
    dest_iteration_id,
    ri.ingredient_id,
    ri.quantity,
    ri.unit,
    ri.notes
  FROM 
    public.recipe_ingredients ri
  WHERE 
    ri.recipe_id = src_recipe_id;
END;
$$ LANGUAGE plpgsql;

-- For existing recipes, create initial iterations
INSERT INTO public.recipe_iterations (
  recipe_id,
  version_number,
  title,
  description,
  instructions
)
SELECT 
  r.id,
  1,
  r.title,
  r.description,
  r.instructions
FROM 
  public.recipes r
WHERE 
  NOT EXISTS (
    SELECT 1 
    FROM public.recipe_iterations ri 
    WHERE ri.recipe_id = r.id
  );

-- For each initial iteration, copy ingredients
DO $$
DECLARE
  iteration_record RECORD;
BEGIN
  FOR iteration_record IN 
    SELECT ri.id as iteration_id, ri.recipe_id 
    FROM public.recipe_iterations ri
    WHERE ri.version_number = 1
  LOOP
    PERFORM copy_ingredients_to_iteration(iteration_record.recipe_id, iteration_record.iteration_id);
  END LOOP;
END;
$$;