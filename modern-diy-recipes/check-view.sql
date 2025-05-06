-- Check if the recipe_ingredients view is working correctly
-- This query compares data in the view with data in the original table

-- Check view structure
SELECT EXISTS (
  SELECT FROM information_schema.views 
  WHERE table_schema = 'public' 
  AND table_name = 'recipe_ingredients'
) AS view_exists;

-- Test view by counting records
SELECT COUNT(*) AS view_count FROM recipe_ingredients;

-- Compare with original table
SELECT COUNT(*) AS original_count FROM recipeingredients;

-- Check some sample data from both
SELECT 'VIEW' AS source, recipe_id, ingredient_id, quantity, unit
FROM recipe_ingredients
LIMIT 3;

SELECT 'ORIGINAL' AS source, recipe_id, ingredient_id, quantity, unit
FROM recipeingredients
LIMIT 3;

-- Check if the view has all columns needed by the application
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'recipe_ingredients';