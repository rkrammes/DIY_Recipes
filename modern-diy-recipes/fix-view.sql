-- Improved view for recipe_ingredients that ensures all needed columns are present
-- Check the original table structure first
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'recipeingredients';

-- Drop existing view if it exists
DROP VIEW IF EXISTS recipe_ingredients;

-- Create a more robust view with all fields the application expects
CREATE OR REPLACE VIEW recipe_ingredients AS 
SELECT 
  recipe_id,
  ingredient_id,
  quantity,
  unit,
  
  -- Generate a stable "id" field from recipe_id and ingredient_id if it doesn't exist
  -- This ensures code looking for unique IDs will work
  COALESCE(id, CONCAT(recipe_id, '_', ingredient_id)::uuid) AS id,
  
  -- Add any columns that might be missing but expected by the code
  notes,
  
  -- Include standard timestamp fields with defaults
  COALESCE(created_at, NOW()) AS created_at
FROM recipeingredients;

-- Check if the view was created properly
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'recipe_ingredients';

-- Check data in the view
SELECT * FROM recipe_ingredients LIMIT 5;