-- Create the recipe_ingredients junction table
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL,
  ingredient_id UUID NOT NULL,
  quantity TEXT,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraints if possible
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

-- Insert sample data
-- We'll use a query to get actual recipe and ingredient IDs from the database
-- and then insert the relationships

-- Get recipe IDs
DO $$
DECLARE
  beard_oil_id UUID;
  beard_balm_id UUID;
  mustache_wax_id UUID;
  foaming_hand_soap_id UUID;
  hand_cream_id UUID;
  hair_rinse_id UUID;
  
  jojoba_oil_id UUID;
  essential_oils_id UUID;
  beeswax_id UUID;
  shea_butter_id UUID;
  cocoa_butter_id UUID;
  mango_butter_id UUID;
  lanolin_id UUID;
  arrowroot_powder_id UUID;
  coconut_oil_id UUID;
  castile_soap_id UUID;
  water_id UUID;
  sweet_almond_oil_id UUID;
  almond_oil_id UUID;
  apple_cider_vinegar_id UUID;
BEGIN
  -- Select the first matching recipe for each type
  SELECT id INTO beard_oil_id FROM recipes WHERE title = 'Beard Oil' LIMIT 1;
  SELECT id INTO beard_balm_id FROM recipes WHERE title = 'Beard Balm' LIMIT 1;
  SELECT id INTO mustache_wax_id FROM recipes WHERE title = 'Mustache Wax' LIMIT 1;
  SELECT id INTO foaming_hand_soap_id FROM recipes WHERE title = 'Foaming Hand Soap' LIMIT 1;
  SELECT id INTO hand_cream_id FROM recipes WHERE title = 'Hand Cream' LIMIT 1;
  SELECT id INTO hair_rinse_id FROM recipes WHERE title = 'Hair Rinse' LIMIT 1;
  
  -- Select ingredients or insert if they don't exist
  -- Jojoba Oil
  SELECT id INTO jojoba_oil_id FROM ingredients WHERE name = 'Jojoba Oil' LIMIT 1;
  IF jojoba_oil_id IS NULL THEN
    INSERT INTO ingredients (name, description) VALUES ('Jojoba Oil', 'Lightweight moisturizing oil similar to skin''s natural sebum')
    RETURNING id INTO jojoba_oil_id;
  END IF;
  
  -- Essential Oils
  SELECT id INTO essential_oils_id FROM ingredients WHERE name = 'Essential Oils' LIMIT 1;
  IF essential_oils_id IS NULL THEN
    INSERT INTO ingredients (name, description) VALUES ('Essential Oils', 'Concentrated plant extracts for fragrance and benefits')
    RETURNING id INTO essential_oils_id;
  END IF;
  
  -- Beeswax
  SELECT id INTO beeswax_id FROM ingredients WHERE name = 'Beeswax' LIMIT 1;
  IF beeswax_id IS NULL THEN
    INSERT INTO ingredients (name, description) VALUES ('Beeswax', 'Natural wax that provides structure and hold')
    RETURNING id INTO beeswax_id;
  END IF;
  
  -- Shea Butter
  SELECT id INTO shea_butter_id FROM ingredients WHERE name = 'Unrefined Shea Butter' LIMIT 1;
  IF shea_butter_id IS NULL THEN
    INSERT INTO ingredients (name, description) VALUES ('Unrefined Shea Butter', 'Rich moisturizer with natural vitamins')
    RETURNING id INTO shea_butter_id;
  END IF;
  
  -- Cocoa Butter
  SELECT id INTO cocoa_butter_id FROM ingredients WHERE name = 'Cocoa Butter' LIMIT 1;
  IF cocoa_butter_id IS NULL THEN
    INSERT INTO ingredients (name, description) VALUES ('Cocoa Butter', 'Emollient that melts at body temperature')
    RETURNING id INTO cocoa_butter_id;
  END IF;
  
  -- Mango Butter
  SELECT id INTO mango_butter_id FROM ingredients WHERE name = 'Unrefined Mango Butter' LIMIT 1;
  IF mango_butter_id IS NULL THEN
    INSERT INTO ingredients (name, description) VALUES ('Unrefined Mango Butter', 'Soft butter with good moisturizing properties')
    RETURNING id INTO mango_butter_id;
  END IF;
  
  -- Lanolin
  SELECT id INTO lanolin_id FROM ingredients WHERE name = 'Lanolin' LIMIT 1;
  IF lanolin_id IS NULL THEN
    INSERT INTO ingredients (name, description) VALUES ('Lanolin', 'Natural wax from sheep''s wool that conditions skin')
    RETURNING id INTO lanolin_id;
  END IF;
  
  -- Arrowroot Powder
  SELECT id INTO arrowroot_powder_id FROM ingredients WHERE name = 'Arrowroot Powder' LIMIT 1;
  IF arrowroot_powder_id IS NULL THEN
    INSERT INTO ingredients (name, description) VALUES ('Arrowroot Powder', 'Natural starch that helps reduce greasiness')
    RETURNING id INTO arrowroot_powder_id;
  END IF;
  
  -- Coconut Oil
  SELECT id INTO coconut_oil_id FROM ingredients WHERE name = 'Coconut Oil' LIMIT 1;
  IF coconut_oil_id IS NULL THEN
    INSERT INTO ingredients (name, description) VALUES ('Coconut Oil', 'Moisturizing oil that adds shine')
    RETURNING id INTO coconut_oil_id;
  END IF;
  
  -- Castile Soap
  SELECT id INTO castile_soap_id FROM ingredients WHERE name = 'Liquid Castile Soap' LIMIT 1;
  IF castile_soap_id IS NULL THEN
    INSERT INTO ingredients (name, description) VALUES ('Liquid Castile Soap', 'Plant-based soap concentrate')
    RETURNING id INTO castile_soap_id;
  END IF;
  
  -- Water
  SELECT id INTO water_id FROM ingredients WHERE name = 'Distilled Water' OR name = 'Water' LIMIT 1;
  IF water_id IS NULL THEN
    INSERT INTO ingredients (name, description) VALUES ('Distilled Water', 'Purified water for diluting')
    RETURNING id INTO water_id;
  END IF;
  
  -- Sweet Almond Oil
  SELECT id INTO sweet_almond_oil_id FROM ingredients WHERE name = 'Sweet Almond Oil' LIMIT 1;
  IF sweet_almond_oil_id IS NULL THEN
    INSERT INTO ingredients (name, description) VALUES ('Sweet Almond Oil', 'Light, moisturizing carrier oil')
    RETURNING id INTO sweet_almond_oil_id;
  END IF;
  
  -- Almond Oil (fallback to Sweet Almond Oil if not found)
  SELECT id INTO almond_oil_id FROM ingredients WHERE name = 'Almond Oil' LIMIT 1;
  IF almond_oil_id IS NULL THEN
    almond_oil_id := sweet_almond_oil_id;
  END IF;
  
  -- Apple Cider Vinegar
  SELECT id INTO apple_cider_vinegar_id FROM ingredients WHERE name = 'Apple Cider Vinegar' LIMIT 1;
  IF apple_cider_vinegar_id IS NULL THEN
    INSERT INTO ingredients (name, description) VALUES ('Apple Cider Vinegar', 'Fermented apple juice that balances pH')
    RETURNING id INTO apple_cider_vinegar_id;
  END IF;
  
  -- Clear any existing recipe-ingredient relationships to avoid duplicates
  DELETE FROM recipe_ingredients WHERE TRUE;
  
  -- Insert relationships
  -- Beard Oil
  IF beard_oil_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES 
      (beard_oil_id, jojoba_oil_id, '40', '%'),
      (beard_oil_id, essential_oils_id, '1', '%');
    RAISE NOTICE 'Added ingredients for Beard Oil';
  ELSE
    RAISE NOTICE 'Beard Oil recipe not found';
  END IF;
  
  -- Beard Balm
  IF beard_balm_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES 
      (beard_balm_id, beeswax_id, '33', '%'),
      (beard_balm_id, shea_butter_id, '20', '%'),
      (beard_balm_id, cocoa_butter_id, '22', '%'),
      (beard_balm_id, mango_butter_id, '15', '%'),
      (beard_balm_id, lanolin_id, '10', '%'),
      (beard_balm_id, arrowroot_powder_id, '5', '%');
    RAISE NOTICE 'Added ingredients for Beard Balm';
  ELSE
    RAISE NOTICE 'Beard Balm recipe not found';
  END IF;
  
  -- Mustache Wax
  IF mustache_wax_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES 
      (mustache_wax_id, beeswax_id, '40', '%'),
      (mustache_wax_id, lanolin_id, '45', '%'),
      (mustache_wax_id, jojoba_oil_id, '15', '%');
    RAISE NOTICE 'Added ingredients for Mustache Wax';
  ELSE
    RAISE NOTICE 'Mustache Wax recipe not found';
  END IF;
  
  -- Foaming Hand Soap
  IF foaming_hand_soap_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES 
      (foaming_hand_soap_id, water_id, '1', 'cup'),
      (foaming_hand_soap_id, castile_soap_id, '2', 'tablespoons'),
      (foaming_hand_soap_id, sweet_almond_oil_id, '1', 'teaspoon'),
      (foaming_hand_soap_id, essential_oils_id, '15', 'drops');
    RAISE NOTICE 'Added ingredients for Foaming Hand Soap';
  ELSE
    RAISE NOTICE 'Foaming Hand Soap recipe not found';
  END IF;
  
  -- Hand Cream
  IF hand_cream_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES 
      (hand_cream_id, shea_butter_id, '40', '%'),
      (hand_cream_id, cocoa_butter_id, '25', '%'),
      (hand_cream_id, sweet_almond_oil_id, '20', '%'),
      (hand_cream_id, beeswax_id, '10', '%'),
      (hand_cream_id, lanolin_id, '5', '%');
    RAISE NOTICE 'Added ingredients for Hand Cream';
  ELSE
    RAISE NOTICE 'Hand Cream recipe not found';
  END IF;
  
  -- Hair Rinse
  IF hair_rinse_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES 
      (hair_rinse_id, water_id, '1', 'cup'),
      (hair_rinse_id, essential_oils_id, '2', 'bags'),
      (hair_rinse_id, water_id, '1/2', 'cup'),
      (hair_rinse_id, apple_cider_vinegar_id, '1/2', 'cup');
    RAISE NOTICE 'Added ingredients for Hair Rinse';
  ELSE
    RAISE NOTICE 'Hair Rinse recipe not found';
  END IF;
  
  -- Count and report the total number of recipe-ingredient relationships created
  DECLARE
    relationship_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO relationship_count FROM recipe_ingredients;
    RAISE NOTICE 'Successfully created % recipe-ingredient relationships', relationship_count;
  END;
END;
$$;

-- Create a helper function to get recipes with their ingredients
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