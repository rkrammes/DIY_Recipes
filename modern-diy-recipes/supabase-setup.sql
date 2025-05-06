-- Supabase Recipe Database Setup Script

-- First check and create tables if they don't exist
DO $$
BEGIN
    -- Check if recipes table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recipes') THEN
        CREATE TABLE public.recipes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            user_id TEXT DEFAULT 'system'
        );

        -- Add index for performance
        CREATE INDEX idx_recipes_title ON public.recipes(title);

        RAISE NOTICE 'Created recipes table';
    END IF;

    -- Check if ingredients table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ingredients') THEN
        CREATE TABLE public.ingredients (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Add index for performance and to avoid duplicates
        CREATE UNIQUE INDEX idx_ingredients_name ON public.ingredients(name);

        RAISE NOTICE 'Created ingredients table';
    END IF;

    -- Check if recipe_ingredients junction table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recipe_ingredients') THEN
        CREATE TABLE public.recipe_ingredients (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
            ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
            quantity TEXT,
            unit TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Add composite index for performance and to avoid duplicates
        CREATE INDEX idx_recipe_ingredients ON public.recipe_ingredients(recipe_id, ingredient_id);

        RAISE NOTICE 'Created recipe_ingredients junction table';
    END IF;
END
$$;

-- Now insert sample recipe data if tables are empty
DO $$
DECLARE
    recipes_count INTEGER;
    recipe_id UUID;
    ingredient_id UUID;
BEGIN
    -- Check if recipes table is empty
    SELECT COUNT(*) INTO recipes_count FROM public.recipes;
    
    IF recipes_count = 0 THEN
        RAISE NOTICE 'Inserting sample recipes and ingredients';
        
        -- Insert recipes
        INSERT INTO public.recipes (id, title, description) VALUES
            (gen_random_uuid(), 'Beard Oil', 'A nourishing beard oil to soften and condition facial hair'),
            (gen_random_uuid(), 'Beard Balm', 'A styling balm that helps shape and condition beards'),
            (gen_random_uuid(), 'Mustache Wax', 'Extra-hold wax for styling mustaches'),
            (gen_random_uuid(), 'Foaming Hand Soap', 'Gentle foaming soap for everyday handwashing'),
            (gen_random_uuid(), 'Hand Cream', 'Rich moisturizing cream for dry hands'),
            (gen_random_uuid(), 'Hair Rinse', 'A clarifying rinse to remove buildup and add shine')
        RETURNING id, title;
        
        -- Insert ingredients
        INSERT INTO public.ingredients (id, name, description) VALUES
            (gen_random_uuid(), 'Jojoba Oil', 'Lightweight moisturizing oil similar to skin''s natural sebum'),
            (gen_random_uuid(), 'Essential Oils', 'Concentrated plant extracts for fragrance and benefits'),
            (gen_random_uuid(), 'Beeswax', 'Natural wax that provides structure and hold'),
            (gen_random_uuid(), 'Unrefined Shea Butter', 'Rich moisturizer with natural vitamins'),
            (gen_random_uuid(), 'Cocoa Butter', 'Emollient that melts at body temperature'),
            (gen_random_uuid(), 'Unrefined Mango Butter', 'Soft butter with good moisturizing properties'),
            (gen_random_uuid(), 'Lanolin', 'Natural wax from sheep''s wool that conditions skin'),
            (gen_random_uuid(), 'Arrowroot Powder', 'Natural starch that helps reduce greasiness'),
            (gen_random_uuid(), 'Coconut Oil', 'Moisturizing oil that adds shine'),
            (gen_random_uuid(), 'Unscented Castile Soap', 'Plant-based soap concentrate'),
            (gen_random_uuid(), 'Water', 'Purified water for diluting'),
            (gen_random_uuid(), 'Sweet Almond Oil', 'Light, moisturizing carrier oil'),
            (gen_random_uuid(), 'Almond Oil', 'Nourishing oil rich in vitamin E'),
            (gen_random_uuid(), 'Apple Cider Vinegar', 'Fermented apple juice that balances pH')
        ON CONFLICT (name) DO NOTHING;

        -- Now create the recipe-ingredient relationships
        
        -- Beard Oil ingredients
        SELECT id INTO recipe_id FROM public.recipes WHERE title = 'Beard Oil' LIMIT 1;
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Jojoba Oil' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '40%', '12g');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Essential Oils' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '1%', '0.3g');
        
        -- Beard Balm ingredients
        SELECT id INTO recipe_id FROM public.recipes WHERE title = 'Beard Balm' LIMIT 1;
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Beeswax' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '33%', '19.8g');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Unrefined Shea Butter' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '20%', '12g');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Cocoa Butter' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '22%', '13.2g');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Unrefined Mango Butter' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '15%', '9g');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Lanolin' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '10%', '6g');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Arrowroot Powder' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '5%', '3g');
        
        -- Mustache Wax ingredients
        SELECT id INTO recipe_id FROM public.recipes WHERE title = 'Mustache Wax' LIMIT 1;
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Beeswax' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '60%', '30g');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Cocoa Butter' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '25%', '12.5g');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Coconut Oil' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '15%', '7.5g');
        
        -- Foaming Hand Soap ingredients
        SELECT id INTO recipe_id FROM public.recipes WHERE title = 'Foaming Hand Soap' LIMIT 1;
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Unscented Castile Soap' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '25%', '60ml');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Water' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '70%', '168ml');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Sweet Almond Oil' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '4%', '9.6ml');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Essential Oils' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '1%', '2.4ml');
        
        -- Hand Cream ingredients
        SELECT id INTO recipe_id FROM public.recipes WHERE title = 'Hand Cream' LIMIT 1;
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Unrefined Shea Butter' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '30%', '60g');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Cocoa Butter' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '15%', '30g');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Almond Oil' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '40%', '80ml');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Beeswax' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '15%', '30g');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Essential Oils' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '', '20-30 drops');
        
        -- Hair Rinse ingredients
        SELECT id INTO recipe_id FROM public.recipes WHERE title = 'Hair Rinse' LIMIT 1;
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Apple Cider Vinegar' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '15%', '30ml');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Water' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '85%', '170ml');
        
        SELECT id INTO ingredient_id FROM public.ingredients WHERE name = 'Essential Oils' LIMIT 1;
        INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
        VALUES (recipe_id, ingredient_id, '', '5-10 drops');
        
        RAISE NOTICE 'Sample data insertion complete';
    ELSE
        RAISE NOTICE 'Recipes table already has data - skipping sample data insertion';
    END IF;
END
$$;