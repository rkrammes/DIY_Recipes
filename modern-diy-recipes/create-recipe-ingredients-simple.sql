-- Simple script to create recipe_ingredients table and populate it with sample data
-- This script uses hardcoded IDs for simplicity

-- Create the recipe_ingredients junction table
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL,
  ingredient_id UUID NOT NULL,
  quantity TEXT,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE public.recipe_ingredients 
  ADD CONSTRAINT fk_recipe 
  FOREIGN KEY (recipe_id) 
  REFERENCES public.recipes(id) 
  ON DELETE CASCADE;

ALTER TABLE public.recipe_ingredients 
  ADD CONSTRAINT fk_ingredient 
  FOREIGN KEY (ingredient_id) 
  REFERENCES public.ingredients(id) 
  ON DELETE RESTRICT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients ON public.recipe_ingredients(recipe_id, ingredient_id);

-- Create mapping function (modify this if needed based on your actual data)
CREATE OR REPLACE FUNCTION get_recipe_with_ingredients(p_recipe_id UUID) 
RETURNS TABLE (
  recipe_id UUID,
  recipe_title TEXT,
  recipe_description TEXT,
  ingredient_id UUID,
  ingredient_name TEXT,
  quantity TEXT,
  unit TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id AS recipe_id,
    r.title AS recipe_title,
    r.description AS recipe_description,
    i.id AS ingredient_id,
    i.name AS ingredient_name,
    ri.quantity,
    ri.unit
  FROM 
    recipes r
  JOIN 
    recipe_ingredients ri ON r.id = ri.recipe_id
  JOIN 
    ingredients i ON ri.ingredient_id = i.id
  WHERE 
    r.id = p_recipe_id;
END;
$$ LANGUAGE plpgsql;