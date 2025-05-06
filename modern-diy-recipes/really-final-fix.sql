-- Really final fix for recipe_ingredients - minimal version

-- Check table structure first to see exactly what columns exist
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'recipeingredients';

-- Drop existing view if it exists
DROP VIEW IF EXISTS recipe_ingredients;

-- Create view with just the columns we know exist, plus the ID
CREATE VIEW recipe_ingredients AS
SELECT 
  recipe_id,
  ingredient_id,
  quantity,
  unit,
  notes,
  -- Generate a proper UUID for the ID
  gen_random_uuid() AS id
FROM recipeingredients;

-- Test the view to make sure we can access it
SELECT * FROM recipe_ingredients LIMIT 5;

-- Test the application query to make sure it works
SELECT 
  r.title AS recipe_name,
  ri.id AS junction_id,
  ri.quantity,
  ri.unit,
  i.name AS ingredient_name
FROM 
  recipes r
JOIN 
  recipe_ingredients ri ON r.id = ri.recipe_id
JOIN 
  ingredients i ON ri.ingredient_id = i.id
WHERE 
  r.id = 'd0b77488-85d1-40ca-99ae-6abfbdc4a213'
LIMIT 10;