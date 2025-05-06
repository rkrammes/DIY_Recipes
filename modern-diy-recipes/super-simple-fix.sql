-- Super simple fix that only does what's needed

-- Look at the actual structure of the table first
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'recipeingredients';

-- Create a straightforward view without any fancy handling
DROP VIEW IF EXISTS recipe_ingredients;

-- Simple view that just adds an ID field
CREATE VIEW recipe_ingredients AS
SELECT 
  recipe_id,
  ingredient_id,
  quantity,
  unit,
  notes,
  CONCAT(recipe_id, '_', ingredient_id)::uuid AS id
FROM recipeingredients;

-- Test it with a recipe
SELECT r.title, i.name, ri.quantity, ri.unit
FROM recipes r
JOIN recipe_ingredients ri ON r.id = ri.recipe_id
JOIN ingredients i ON ri.ingredient_id = i.id
WHERE r.id = 'd0b77488-85d1-40ca-99ae-6abfbdc4a213'
LIMIT 10;