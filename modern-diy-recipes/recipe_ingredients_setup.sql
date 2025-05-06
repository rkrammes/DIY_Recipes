-- Recipe Ingredients Setup Script
-- Run this in the Supabase SQL Editor to create and populate the recipe_ingredients table

-- Create the recipe_ingredients table
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL,
  ingredient_id UUID NOT NULL,
  quantity TEXT,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraints if possible
DO $$
BEGIN
  ALTER TABLE public.recipe_ingredients 
    ADD CONSTRAINT fk_recipe 
    FOREIGN KEY (recipe_id) 
    REFERENCES public.recipes(id) 
    ON DELETE CASCADE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not add foreign key constraint for recipes: %', SQLERRM;
END;
$$;

DO $$
BEGIN
  ALTER TABLE public.recipe_ingredients 
    ADD CONSTRAINT fk_ingredient 
    FOREIGN KEY (ingredient_id) 
    REFERENCES public.ingredients(id) 
    ON DELETE RESTRICT;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not add foreign key constraint for ingredients: %', SQLERRM;
END;
$$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients ON public.recipe_ingredients(recipe_id, ingredient_id);

-- Variables to store the recipe and ingredient IDs
DO $$
DECLARE
  recipe_beard_oil_id UUID;
  recipe_beard_balm_id UUID;
  recipe_mustache_wax_id UUID;
  recipe_foaming_hand_soap_id UUID;
  recipe_hand_cream_id UUID;
  recipe_hair_rinse_id UUID;
  
  ingredient_jojoba_oil_id UUID;
  ingredient_essential_oils_id UUID;
  ingredient_beeswax_id UUID;
  ingredient_shea_butter_id UUID;
  ingredient_cocoa_butter_id UUID;
  ingredient_mango_butter_id UUID;
  ingredient_lanolin_id UUID;
  ingredient_arrowroot_powder_id UUID;
  ingredient_coconut_oil_id UUID;
  ingredient_castile_soap_id UUID;
  ingredient_water_id UUID;
  ingredient_sweet_almond_oil_id UUID;
  ingredient_almond_oil_id UUID;
  ingredient_apple_cider_vinegar_id UUID;
BEGIN
  -- First get existing recipe IDs - insert if they don't exist
  SELECT id INTO recipe_beard_oil_id FROM recipes WHERE title = 'Beard Oil' LIMIT 1;
  IF recipe_beard_oil_id IS NULL THEN
    INSERT INTO recipes (title, description) 
    VALUES ('Beard Oil', 'A nourishing beard oil to soften and condition facial hair')
    RETURNING id INTO recipe_beard_oil_id;
  END IF;
  
  SELECT id INTO recipe_beard_balm_id FROM recipes WHERE title = 'Beard Balm' LIMIT 1;
  IF recipe_beard_balm_id IS NULL THEN
    INSERT INTO recipes (title, description) 
    VALUES ('Beard Balm', 'A styling balm that helps shape and condition beards')
    RETURNING id INTO recipe_beard_balm_id;
  END IF;
  
  SELECT id INTO recipe_mustache_wax_id FROM recipes WHERE title = 'Mustache Wax' LIMIT 1;
  IF recipe_mustache_wax_id IS NULL THEN
    INSERT INTO recipes (title, description) 
    VALUES ('Mustache Wax', 'Extra-hold wax for styling mustaches')
    RETURNING id INTO recipe_mustache_wax_id;
  END IF;
  
  SELECT id INTO recipe_foaming_hand_soap_id FROM recipes WHERE title = 'Foaming Hand Soap' LIMIT 1;
  IF recipe_foaming_hand_soap_id IS NULL THEN
    INSERT INTO recipes (title, description) 
    VALUES ('Foaming Hand Soap', 'Gentle foaming soap for everyday handwashing')
    RETURNING id INTO recipe_foaming_hand_soap_id;
  END IF;
  
  SELECT id INTO recipe_hand_cream_id FROM recipes WHERE title = 'Hand Cream' LIMIT 1;
  IF recipe_hand_cream_id IS NULL THEN
    INSERT INTO recipes (title, description) 
    VALUES ('Hand Cream', 'Rich moisturizing cream for dry hands')
    RETURNING id INTO recipe_hand_cream_id;
  END IF;
  
  SELECT id INTO recipe_hair_rinse_id FROM recipes WHERE title = 'Hair Rinse' LIMIT 1;
  IF recipe_hair_rinse_id IS NULL THEN
    INSERT INTO recipes (title, description) 
    VALUES ('Hair Rinse', 'A clarifying rinse to remove buildup and add shine')
    RETURNING id INTO recipe_hair_rinse_id;
  END IF;
  
  -- Get existing ingredient IDs - insert if they don't exist
  SELECT id INTO ingredient_jojoba_oil_id FROM ingredients WHERE name = 'Jojoba Oil' LIMIT 1;
  IF ingredient_jojoba_oil_id IS NULL THEN
    INSERT INTO ingredients (name, description) 
    VALUES ('Jojoba Oil', 'Lightweight moisturizing oil similar to skin''s natural sebum')
    RETURNING id INTO ingredient_jojoba_oil_id;
  END IF;
  
  SELECT id INTO ingredient_essential_oils_id FROM ingredients WHERE name = 'Essential Oils' LIMIT 1;
  IF ingredient_essential_oils_id IS NULL THEN
    INSERT INTO ingredients (name, description) 
    VALUES ('Essential Oils', 'Concentrated plant extracts for fragrance and benefits')
    RETURNING id INTO ingredient_essential_oils_id;
  END IF;
  
  SELECT id INTO ingredient_beeswax_id FROM ingredients WHERE name = 'Beeswax' LIMIT 1;
  IF ingredient_beeswax_id IS NULL THEN
    INSERT INTO ingredients (name, description) 
    VALUES ('Beeswax', 'Natural wax that provides structure and hold')
    RETURNING id INTO ingredient_beeswax_id;
  END IF;
  
  SELECT id INTO ingredient_shea_butter_id FROM ingredients WHERE name = 'Unrefined Shea Butter' LIMIT 1;
  IF ingredient_shea_butter_id IS NULL THEN
    INSERT INTO ingredients (name, description) 
    VALUES ('Unrefined Shea Butter', 'Rich moisturizer with natural vitamins')
    RETURNING id INTO ingredient_shea_butter_id;
  END IF;
  
  SELECT id INTO ingredient_cocoa_butter_id FROM ingredients WHERE name = 'Cocoa Butter' LIMIT 1;
  IF ingredient_cocoa_butter_id IS NULL THEN
    INSERT INTO ingredients (name, description) 
    VALUES ('Cocoa Butter', 'Emollient that melts at body temperature')
    RETURNING id INTO ingredient_cocoa_butter_id;
  END IF;
  
  SELECT id INTO ingredient_mango_butter_id FROM ingredients WHERE name = 'Unrefined Mango Butter' LIMIT 1;
  IF ingredient_mango_butter_id IS NULL THEN
    INSERT INTO ingredients (name, description) 
    VALUES ('Unrefined Mango Butter', 'Soft butter with good moisturizing properties')
    RETURNING id INTO ingredient_mango_butter_id;
  END IF;
  
  SELECT id INTO ingredient_lanolin_id FROM ingredients WHERE name = 'Lanolin' LIMIT 1;
  IF ingredient_lanolin_id IS NULL THEN
    INSERT INTO ingredients (name, description) 
    VALUES ('Lanolin', 'Natural wax from sheep''s wool that conditions skin')
    RETURNING id INTO ingredient_lanolin_id;
  END IF;
  
  SELECT id INTO ingredient_arrowroot_powder_id FROM ingredients WHERE name = 'Arrowroot Powder' LIMIT 1;
  IF ingredient_arrowroot_powder_id IS NULL THEN
    INSERT INTO ingredients (name, description) 
    VALUES ('Arrowroot Powder', 'Natural starch that helps reduce greasiness')
    RETURNING id INTO ingredient_arrowroot_powder_id;
  END IF;
  
  SELECT id INTO ingredient_coconut_oil_id FROM ingredients WHERE name = 'Coconut Oil' LIMIT 1;
  IF ingredient_coconut_oil_id IS NULL THEN
    INSERT INTO ingredients (name, description) 
    VALUES ('Coconut Oil', 'Moisturizing oil that adds shine')
    RETURNING id INTO ingredient_coconut_oil_id;
  END IF;
  
  SELECT id INTO ingredient_castile_soap_id FROM ingredients WHERE name = 'Unscented Castile Soap' LIMIT 1;
  IF ingredient_castile_soap_id IS NULL THEN
    INSERT INTO ingredients (name, description) 
    VALUES ('Unscented Castile Soap', 'Plant-based soap concentrate')
    RETURNING id INTO ingredient_castile_soap_id;
  END IF;
  
  SELECT id INTO ingredient_water_id FROM ingredients WHERE name = 'Water' LIMIT 1;
  IF ingredient_water_id IS NULL THEN
    INSERT INTO ingredients (name, description) 
    VALUES ('Water', 'Purified water for diluting')
    RETURNING id INTO ingredient_water_id;
  END IF;
  
  SELECT id INTO ingredient_sweet_almond_oil_id FROM ingredients WHERE name = 'Sweet Almond Oil' LIMIT 1;
  IF ingredient_sweet_almond_oil_id IS NULL THEN
    INSERT INTO ingredients (name, description) 
    VALUES ('Sweet Almond Oil', 'Light, moisturizing carrier oil')
    RETURNING id INTO ingredient_sweet_almond_oil_id;
  END IF;
  
  SELECT id INTO ingredient_almond_oil_id FROM ingredients WHERE name = 'Almond Oil' LIMIT 1;
  IF ingredient_almond_oil_id IS NULL THEN
    INSERT INTO ingredients (name, description) 
    VALUES ('Almond Oil', 'Nourishing oil rich in vitamin E')
    RETURNING id INTO ingredient_almond_oil_id;
  END IF;
  
  SELECT id INTO ingredient_apple_cider_vinegar_id FROM ingredients WHERE name = 'Apple Cider Vinegar' LIMIT 1;
  IF ingredient_apple_cider_vinegar_id IS NULL THEN
    INSERT INTO ingredients (name, description) 
    VALUES ('Apple Cider Vinegar', 'Fermented apple juice that balances pH')
    RETURNING id INTO ingredient_apple_cider_vinegar_id;
  END IF;
  
  -- Insert recipe-ingredient relationships
  
  -- Clear existing data if needed
  DELETE FROM recipe_ingredients;
  
  -- Beard Oil ingredients
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
  VALUES 
    (recipe_beard_oil_id, ingredient_jojoba_oil_id, '40%', '12g'),
    (recipe_beard_oil_id, ingredient_essential_oils_id, '1%', '0.3g');
  
  -- Beard Balm ingredients
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
  VALUES 
    (recipe_beard_balm_id, ingredient_beeswax_id, '33%', '19.8g'),
    (recipe_beard_balm_id, ingredient_shea_butter_id, '20%', '12g'),
    (recipe_beard_balm_id, ingredient_cocoa_butter_id, '22%', '13.2g'),
    (recipe_beard_balm_id, ingredient_mango_butter_id, '15%', '9g'),
    (recipe_beard_balm_id, ingredient_lanolin_id, '10%', '6g'),
    (recipe_beard_balm_id, ingredient_arrowroot_powder_id, '5%', '3g');
  
  -- Mustache Wax ingredients
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
  VALUES 
    (recipe_mustache_wax_id, ingredient_beeswax_id, '60%', '30g'),
    (recipe_mustache_wax_id, ingredient_cocoa_butter_id, '25%', '12.5g'),
    (recipe_mustache_wax_id, ingredient_coconut_oil_id, '15%', '7.5g');
  
  -- Foaming Hand Soap ingredients
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
  VALUES 
    (recipe_foaming_hand_soap_id, ingredient_castile_soap_id, '25%', '60ml'),
    (recipe_foaming_hand_soap_id, ingredient_water_id, '70%', '168ml'),
    (recipe_foaming_hand_soap_id, ingredient_sweet_almond_oil_id, '4%', '9.6ml'),
    (recipe_foaming_hand_soap_id, ingredient_essential_oils_id, '1%', '2.4ml');
  
  -- Hand Cream ingredients
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
  VALUES 
    (recipe_hand_cream_id, ingredient_shea_butter_id, '30%', '60g'),
    (recipe_hand_cream_id, ingredient_cocoa_butter_id, '15%', '30g'),
    (recipe_hand_cream_id, ingredient_almond_oil_id, '40%', '80ml'),
    (recipe_hand_cream_id, ingredient_beeswax_id, '15%', '30g'),
    (recipe_hand_cream_id, ingredient_essential_oils_id, '', '20-30 drops');
  
  -- Hair Rinse ingredients
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
  VALUES 
    (recipe_hair_rinse_id, ingredient_apple_cider_vinegar_id, '15%', '30ml'),
    (recipe_hair_rinse_id, ingredient_water_id, '85%', '170ml'),
    (recipe_hair_rinse_id, ingredient_essential_oils_id, '', '5-10 drops');
  
  RAISE NOTICE 'Recipe ingredients populated successfully!';
END;
$$;

-- Create a SQL function to link recipes with their ingredients (helpful for direct queries)
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