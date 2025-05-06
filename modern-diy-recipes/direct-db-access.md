# Direct Database Access Instructions

Since the automated script approach is having permission issues, here's how to directly create and populate the `recipe_ingredients` junction table:

## 1. Log in to Supabase Dashboard

Go to [https://app.supabase.com/](https://app.supabase.com/) and log in to your account.

## 2. Select the DIY Recipes Project

Find and select your DIY Recipes project from the dashboard.

## 3. Go to the SQL Editor

In the left sidebar, click on "SQL Editor".

## 4. Create and Populate the Junction Table

Copy and paste the SQL script below, then click the "Run" button:

```sql
-- Create the recipe_ingredients table
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL,
  ingredient_id UUID NOT NULL,
  quantity TEXT,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for improved performance
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients ON public.recipe_ingredients(recipe_id, ingredient_id);

-- Create foreign key constraints if possible
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

-- Clear existing data if needed to avoid duplicates
DELETE FROM recipe_ingredients;

-- Populate the table with recipe-ingredient relationships
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
  -- Get recipe IDs
  SELECT id INTO beard_oil_id FROM recipes WHERE title = 'Beard Oil' LIMIT 1;
  SELECT id INTO beard_balm_id FROM recipes WHERE title = 'Beard Balm' LIMIT 1;
  SELECT id INTO mustache_wax_id FROM recipes WHERE title = 'Mustache Wax' LIMIT 1;
  SELECT id INTO foaming_hand_soap_id FROM recipes WHERE title = 'Foaming Hand Soap' LIMIT 1;
  SELECT id INTO hand_cream_id FROM recipes WHERE title = 'Hand Cream' LIMIT 1;
  SELECT id INTO hair_rinse_id FROM recipes WHERE title = 'Hair Rinse' LIMIT 1;
  
  -- Get ingredient IDs
  SELECT id INTO jojoba_oil_id FROM ingredients WHERE name = 'Jojoba Oil' LIMIT 1;
  SELECT id INTO essential_oils_id FROM ingredients WHERE name = 'Essential Oils' LIMIT 1;
  SELECT id INTO beeswax_id FROM ingredients WHERE name = 'Beeswax' LIMIT 1;
  SELECT id INTO shea_butter_id FROM ingredients WHERE name = 'Unrefined Shea Butter' LIMIT 1;
  SELECT id INTO cocoa_butter_id FROM ingredients WHERE name = 'Cocoa Butter' LIMIT 1;
  SELECT id INTO mango_butter_id FROM ingredients WHERE name = 'Unrefined Mango Butter' LIMIT 1;
  SELECT id INTO lanolin_id FROM ingredients WHERE name = 'Lanolin' LIMIT 1;
  SELECT id INTO arrowroot_powder_id FROM ingredients WHERE name = 'Arrowroot Powder' LIMIT 1;
  SELECT id INTO coconut_oil_id FROM ingredients WHERE name = 'Coconut Oil' LIMIT 1;
  SELECT id INTO castile_soap_id FROM ingredients WHERE name = 'Unscented Castile Soap' LIMIT 1;
  SELECT id INTO water_id FROM ingredients WHERE name = 'Water' LIMIT 1;
  SELECT id INTO sweet_almond_oil_id FROM ingredients WHERE name = 'Sweet Almond Oil' LIMIT 1;
  SELECT id INTO almond_oil_id FROM ingredients WHERE name = 'Almond Oil' LIMIT 1;
  SELECT id INTO apple_cider_vinegar_id FROM ingredients WHERE name = 'Apple Cider Vinegar' LIMIT 1;
  
  -- Insert relationships
  
  -- Beard Oil ingredients
  IF beard_oil_id IS NOT NULL AND jojoba_oil_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (beard_oil_id, jojoba_oil_id, '40%', '12g');
  END IF;
  
  IF beard_oil_id IS NOT NULL AND essential_oils_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (beard_oil_id, essential_oils_id, '1%', '0.3g');
  END IF;
  
  -- Beard Balm ingredients
  IF beard_balm_id IS NOT NULL AND beeswax_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (beard_balm_id, beeswax_id, '33%', '19.8g');
  END IF;
  
  IF beard_balm_id IS NOT NULL AND shea_butter_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (beard_balm_id, shea_butter_id, '20%', '12g');
  END IF;
  
  IF beard_balm_id IS NOT NULL AND cocoa_butter_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (beard_balm_id, cocoa_butter_id, '22%', '13.2g');
  END IF;
  
  IF beard_balm_id IS NOT NULL AND mango_butter_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (beard_balm_id, mango_butter_id, '15%', '9g');
  END IF;
  
  IF beard_balm_id IS NOT NULL AND lanolin_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (beard_balm_id, lanolin_id, '10%', '6g');
  END IF;
  
  IF beard_balm_id IS NOT NULL AND arrowroot_powder_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (beard_balm_id, arrowroot_powder_id, '5%', '3g');
  END IF;
  
  -- Mustache Wax ingredients
  IF mustache_wax_id IS NOT NULL AND beeswax_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (mustache_wax_id, beeswax_id, '60%', '30g');
  END IF;
  
  IF mustache_wax_id IS NOT NULL AND cocoa_butter_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (mustache_wax_id, cocoa_butter_id, '25%', '12.5g');
  END IF;
  
  IF mustache_wax_id IS NOT NULL AND coconut_oil_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (mustache_wax_id, coconut_oil_id, '15%', '7.5g');
  END IF;
  
  -- Foaming Hand Soap ingredients
  IF foaming_hand_soap_id IS NOT NULL AND castile_soap_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (foaming_hand_soap_id, castile_soap_id, '25%', '60ml');
  END IF;
  
  IF foaming_hand_soap_id IS NOT NULL AND water_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (foaming_hand_soap_id, water_id, '70%', '168ml');
  END IF;
  
  IF foaming_hand_soap_id IS NOT NULL AND sweet_almond_oil_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (foaming_hand_soap_id, sweet_almond_oil_id, '4%', '9.6ml');
  END IF;
  
  IF foaming_hand_soap_id IS NOT NULL AND essential_oils_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (foaming_hand_soap_id, essential_oils_id, '1%', '2.4ml');
  END IF;
  
  -- Hand Cream ingredients
  IF hand_cream_id IS NOT NULL AND shea_butter_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (hand_cream_id, shea_butter_id, '30%', '60g');
  END IF;
  
  IF hand_cream_id IS NOT NULL AND cocoa_butter_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (hand_cream_id, cocoa_butter_id, '15%', '30g');
  END IF;
  
  IF hand_cream_id IS NOT NULL AND almond_oil_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (hand_cream_id, almond_oil_id, '40%', '80ml');
  END IF;
  
  IF hand_cream_id IS NOT NULL AND beeswax_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (hand_cream_id, beeswax_id, '15%', '30g');
  END IF;
  
  IF hand_cream_id IS NOT NULL AND essential_oils_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (hand_cream_id, essential_oils_id, '', '20-30 drops');
  END IF;
  
  -- Hair Rinse ingredients
  IF hair_rinse_id IS NOT NULL AND apple_cider_vinegar_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (hair_rinse_id, apple_cider_vinegar_id, '15%', '30ml');
  END IF;
  
  IF hair_rinse_id IS NOT NULL AND water_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (hair_rinse_id, water_id, '85%', '170ml');
  END IF;
  
  IF hair_rinse_id IS NOT NULL AND essential_oils_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    VALUES (hair_rinse_id, essential_oils_id, '', '5-10 drops');
  END IF;
  
END;
$$;

-- Verify it worked
SELECT COUNT(*) AS recipe_ingredient_count FROM recipe_ingredients;
```

## 5. Restart Your Application

After running the SQL script successfully, restart your application with:

```bash
npm run dev
```

Now your recipes should display with their ingredients properly!

## What This SQL Script Does

1. **Creates the junction table**: Sets up the `recipe_ingredients` table with the necessary columns
2. **Adds constraints**: Adds foreign key constraints to ensure data integrity
3. **Gets recipe and ingredient IDs**: Retrieves the existing IDs from your database
4. **Populates relationships**: Creates the connections between recipes and ingredients with quantities
5. **Verifies the operation**: Counts the records to confirm the data was inserted

## Troubleshooting

If you're still having issues after running the script:

1. **Check the logs**: Look for any error messages in the Supabase SQL Editor
2. **Verify table creation**: Make sure the `recipe_ingredients` table appears in your table list
3. **Check recipe and ingredient IDs**: Ensure your recipes and ingredients have the expected names
4. **Check browser console**: Look for any API errors in your browser's developer console
5. **Clear browser cache**: Try clearing your browser cache or hard refreshing the page

Happy cooking with your DIY recipes!