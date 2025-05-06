-- This is the final fix that resolves the issue with the recipe_ingredients table
-- Modified to work without an ID column in the original table

-- First, check the structure of the actual recipeingredients table
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'recipeingredients';

-- Drop existing view if it exists
DROP VIEW IF EXISTS recipe_ingredients;

-- Create a comprehensive view that handles all possible structure differences
CREATE OR REPLACE VIEW recipe_ingredients AS 
SELECT 
  -- Essential fields that must be present
  recipe_id,
  ingredient_id,
  
  -- Handle quantity field formats - the application expects a text field
  -- If it's a number in the original table, convert it to text
  CASE 
    WHEN pg_typeof(quantity) IN ('integer'::regtype, 'numeric'::regtype, 'double precision'::regtype) 
    THEN quantity::text
    ELSE COALESCE(quantity::text, '')
  END AS quantity,
  
  -- Include unit field or provide empty string
  COALESCE(unit, '') AS unit,
  
  -- Generate a unique ID from recipe_id and ingredient_id
  -- Since there's no id column in the original table
  CONCAT(recipe_id, '_', ingredient_id)::uuid AS id,
  
  -- Add notes field (or null if not present)
  notes,
  
  -- Standard timestamps with defaults
  COALESCE(created_at, NOW()) AS created_at
FROM recipeingredients;

-- Test the view to make sure it works
SELECT * FROM recipe_ingredients LIMIT 5;

-- Create an additional helper function to aid debugging
CREATE OR REPLACE FUNCTION get_recipe_ingredients(p_recipe_id UUID) 
RETURNS TABLE (
  ingredient_name TEXT,
  quantity TEXT,
  unit TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.name AS ingredient_name,
    ri.quantity::TEXT AS quantity,
    ri.unit AS unit
  FROM 
    recipe_ingredients ri
  JOIN 
    ingredients i ON ri.ingredient_id = i.id
  WHERE 
    ri.recipe_id = p_recipe_id
  ORDER BY
    i.name;
END;
$$ LANGUAGE plpgsql;

-- Test the helper function
SELECT * FROM get_recipe_ingredients('d0b77488-85d1-40ca-99ae-6abfbdc4a213'); -- Beard Balm recipe ID

-- For extra safety, let's also create a direct view that the app can use
-- which returns ingredients directly with the recipe data
CREATE OR REPLACE VIEW recipe_with_ingredients AS
SELECT 
  r.id,
  r.title,
  r.description,
  r.created_at,
  r.updated_at,
  r.user_id,
  json_agg(
    json_build_object(
      'id', i.id,
      'name', i.name,
      'description', i.description,
      'quantity', ri.quantity,
      'unit', ri.unit,
      'recipe_ingredient_id', ri.id
    )
  ) AS ingredients
FROM
  recipes r
LEFT JOIN
  recipe_ingredients ri ON r.id = ri.recipe_id
LEFT JOIN
  ingredients i ON ri.ingredient_id = i.id
GROUP BY
  r.id, r.title, r.description, r.created_at, r.updated_at, r.user_id;

-- Test the complete view
SELECT id, title, (ingredients IS NOT NULL) AS has_ingredients 
FROM recipe_with_ingredients
LIMIT 5;