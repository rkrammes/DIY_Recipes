-- Create a view called "recipe_ingredients" that points to the existing "recipeingredients" table
-- This lets your code continue to reference "recipe_ingredients" without any changes

CREATE OR REPLACE VIEW recipe_ingredients AS
SELECT * FROM recipeingredients;

-- Verify that the view works
SELECT COUNT(*) FROM recipe_ingredients;