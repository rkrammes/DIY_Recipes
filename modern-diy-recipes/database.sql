-- SQL script to create and populate recipe tables
-- Export this and run directly in Supabase SQL Editor
--
-- IMPORTANT: This script creates the necessary tables for the application's database,
-- including tools and library tables to ensure all data comes from real database sources.
-- When the KraftTerminalModularLayout component loads, it will connect to the Supabase
-- database and display real data with proper error handling if the connection fails.

-- Make sure we have UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL,
  ingredient_id UUID NOT NULL,
  quantity TEXT,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tools table
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create library table
CREATE TABLE IF NOT EXISTS public.library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clean up existing test data
DELETE FROM public.recipe_ingredients;
DELETE FROM public.recipes WHERE title IN (
  'Beard Oil', 'Beard Balm', 'Mustache Wax', 
  'Foaming Hand Soap', 'Hand Cream', 'Hair Rinse'
);

-- Insert sample recipes
INSERT INTO public.recipes (id, title, description, instructions, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Beard Oil', 'A nourishing oil for beard care', 'Combine all ingredients in a glass bottle. Shake well before each use. Apply a few drops to palm, rub hands together, and massage through beard.', NOW(), NOW()),
  (uuid_generate_v4(), 'Beard Balm', 'A styling balm that conditions and shapes your beard', 'Melt beeswax, shea butter, cocoa butter, and mango butter in a double boiler. Remove from heat and stir in lanolin and arrowroot powder. Pour into containers and let cool.', NOW(), NOW()),
  (uuid_generate_v4(), 'Mustache Wax', 'A strong-hold wax for styling mustaches', 'Melt carnauba wax in a double boiler. Add lanolin and jojoba oil, stirring until combined. Pour into small containers and let cool completely before use.', NOW(), NOW()),
  (uuid_generate_v4(), 'Foaming Hand Soap', 'A gentle, natural foaming soap for everyday hand washing', 'Pour distilled water into a foaming soap dispenser. Add castile soap, sweet almond oil, and essential oils. Gently swirl to mix (do not shake vigorously).', NOW(), NOW()),
  (uuid_generate_v4(), 'Hand Cream', 'A rich, moisturizing cream for dry hands', 'Melt shea butter, cocoa butter, and beeswax in a double boiler. Remove from heat and add sweet almond oil and lanolin. Let cool slightly, then add essential oils. Pour into jars and cool completely.', NOW(), NOW()),
  (uuid_generate_v4(), 'Hair Rinse', 'A clarifying rinse to remove buildup and add shine', 'Brew green tea with hot water and let cool. Mix in aloe vera juice and apple cider vinegar. Add essential oils and shake well. Apply to hair after shampooing, let sit for 2-3 minutes, then rinse with cool water.', NOW(), NOW());

-- Insert ingredients (if not exists)
INSERT INTO public.ingredients (id, name, description, created_at)
VALUES
  (uuid_generate_v4(), 'Jojoba Oil', 'A nourishing carrier oil for skincare products', NOW()),
  (uuid_generate_v4(), 'Essential Oils', 'Fragrant oils for scent and therapeutic benefits', NOW()),
  (uuid_generate_v4(), 'Beeswax', 'Natural wax for thickening and setting products', NOW()),
  (uuid_generate_v4(), 'Unrefined Shea Butter', 'Moisturizing butter for skin care', NOW()),
  (uuid_generate_v4(), 'Cocoa Butter', 'Rich moisturizing butter with chocolate scent', NOW()),
  (uuid_generate_v4(), 'Unrefined Mango Butter', 'Exotic butter with excellent moisturizing properties', NOW()),
  (uuid_generate_v4(), 'Lanolin', 'Natural wool-derived emollient', NOW()),
  (uuid_generate_v4(), 'Arrowroot Powder', 'Natural thickener and anti-caking agent', NOW()),
  (uuid_generate_v4(), 'Carnauba Wax', 'Hard natural wax for firm hold', NOW()),
  (uuid_generate_v4(), 'Distilled Water', 'Purified water for product base', NOW()),
  (uuid_generate_v4(), 'Liquid Castile Soap', 'Plant-based soap concentrate', NOW()),
  (uuid_generate_v4(), 'Sweet Almond Oil', 'Light moisturizing carrier oil', NOW()),
  (uuid_generate_v4(), 'Cedarwood Atlas Oil', 'Woody essential oil with warm scent', NOW()),
  (uuid_generate_v4(), 'Bergaptene-Free Bergamot Oil', 'Citrus essential oil with sun-safe properties', NOW()),
  (uuid_generate_v4(), 'Water', 'Base for water-based products', NOW()),
  (uuid_generate_v4(), 'Green Tea', 'Antioxidant-rich tea for hair benefits', NOW()),
  (uuid_generate_v4(), 'Aloe Vera Juice', 'Soothing plant juice for skin and hair', NOW()),
  (uuid_generate_v4(), 'Apple Cider Vinegar', 'Balancing acidic ingredient', NOW()),
  (uuid_generate_v4(), 'Rosemary Essential Oil', 'Herbal essential oil for hair health', NOW()),
  (uuid_generate_v4(), 'Peppermint Essential Oil', 'Cooling, refreshing essential oil', NOW())
ON CONFLICT (name) DO NOTHING;

-- Now create the relationships between recipes and ingredients

-- For Beard Oil
WITH 
  recipe AS (SELECT id FROM public.recipes WHERE title = 'Beard Oil' LIMIT 1),
  jojoba AS (SELECT id FROM public.ingredients WHERE name = 'Jojoba Oil' LIMIT 1),
  essential AS (SELECT id FROM public.ingredients WHERE name = 'Essential Oils' LIMIT 1)
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 
  recipe.id, jojoba.id, '40', '%'
FROM recipe, jojoba
UNION ALL
SELECT 
  recipe.id, essential.id, '1', '%'
FROM recipe, essential;

-- For Beard Balm
WITH 
  recipe AS (SELECT id FROM public.recipes WHERE title = 'Beard Balm' LIMIT 1),
  beeswax AS (SELECT id FROM public.ingredients WHERE name = 'Beeswax' LIMIT 1),
  shea AS (SELECT id FROM public.ingredients WHERE name = 'Unrefined Shea Butter' LIMIT 1),
  cocoa AS (SELECT id FROM public.ingredients WHERE name = 'Cocoa Butter' LIMIT 1),
  mango AS (SELECT id FROM public.ingredients WHERE name = 'Unrefined Mango Butter' LIMIT 1),
  lanolin AS (SELECT id FROM public.ingredients WHERE name = 'Lanolin' LIMIT 1),
  arrowroot AS (SELECT id FROM public.ingredients WHERE name = 'Arrowroot Powder' LIMIT 1)
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 
  recipe.id, beeswax.id, '33', '%'
FROM recipe, beeswax
UNION ALL
SELECT 
  recipe.id, shea.id, '20', '%'
FROM recipe, shea
UNION ALL
SELECT 
  recipe.id, cocoa.id, '22', '%'
FROM recipe, cocoa
UNION ALL
SELECT 
  recipe.id, mango.id, '15', '%'
FROM recipe, mango
UNION ALL
SELECT 
  recipe.id, lanolin.id, '10', '%'
FROM recipe, lanolin
UNION ALL
SELECT 
  recipe.id, arrowroot.id, '5', '%'
FROM recipe, arrowroot;

-- For Mustache Wax
WITH 
  recipe AS (SELECT id FROM public.recipes WHERE title = 'Mustache Wax' LIMIT 1),
  carnauba AS (SELECT id FROM public.ingredients WHERE name = 'Carnauba Wax' LIMIT 1),
  lanolin AS (SELECT id FROM public.ingredients WHERE name = 'Lanolin' LIMIT 1),
  jojoba AS (SELECT id FROM public.ingredients WHERE name = 'Jojoba Oil' LIMIT 1)
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 
  recipe.id, carnauba.id, '40', '%'
FROM recipe, carnauba
UNION ALL
SELECT 
  recipe.id, lanolin.id, '45', '%'
FROM recipe, lanolin
UNION ALL
SELECT 
  recipe.id, jojoba.id, '15', '%'
FROM recipe, jojoba;

-- For Foaming Hand Soap
WITH 
  recipe AS (SELECT id FROM public.recipes WHERE title = 'Foaming Hand Soap' LIMIT 1),
  water AS (SELECT id FROM public.ingredients WHERE name = 'Distilled Water' LIMIT 1),
  soap AS (SELECT id FROM public.ingredients WHERE name = 'Liquid Castile Soap' LIMIT 1),
  almond AS (SELECT id FROM public.ingredients WHERE name = 'Sweet Almond Oil' LIMIT 1),
  essential AS (SELECT id FROM public.ingredients WHERE name = 'Essential Oils' LIMIT 1)
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 
  recipe.id, water.id, '1', 'cup'
FROM recipe, water
UNION ALL
SELECT 
  recipe.id, soap.id, '2', 'tablespoons'
FROM recipe, soap
UNION ALL
SELECT 
  recipe.id, almond.id, '1', 'teaspoon'
FROM recipe, almond
UNION ALL
SELECT 
  recipe.id, essential.id, '10-15', 'drops'
FROM recipe, essential;

-- For Hand Cream
WITH 
  recipe AS (SELECT id FROM public.recipes WHERE title = 'Hand Cream' LIMIT 1),
  shea AS (SELECT id FROM public.ingredients WHERE name = 'Unrefined Shea Butter' LIMIT 1),
  cocoa AS (SELECT id FROM public.ingredients WHERE name = 'Cocoa Butter' LIMIT 1),
  almond AS (SELECT id FROM public.ingredients WHERE name = 'Sweet Almond Oil' LIMIT 1),
  beeswax AS (SELECT id FROM public.ingredients WHERE name = 'Beeswax' LIMIT 1),
  lanolin AS (SELECT id FROM public.ingredients WHERE name = 'Lanolin' LIMIT 1),
  cedar AS (SELECT id FROM public.ingredients WHERE name = 'Cedarwood Atlas Oil' LIMIT 1),
  bergamot AS (SELECT id FROM public.ingredients WHERE name = 'Bergaptene-Free Bergamot Oil' LIMIT 1)
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 
  recipe.id, shea.id, '40', '%'
FROM recipe, shea
UNION ALL
SELECT 
  recipe.id, cocoa.id, '25', '%'
FROM recipe, cocoa
UNION ALL
SELECT 
  recipe.id, almond.id, '20', '%'
FROM recipe, almond
UNION ALL
SELECT 
  recipe.id, beeswax.id, '10', '%'
FROM recipe, beeswax
UNION ALL
SELECT 
  recipe.id, lanolin.id, '5', '%'
FROM recipe, lanolin
UNION ALL
SELECT 
  recipe.id, cedar.id, '1', '%'
FROM recipe, cedar
UNION ALL
SELECT 
  recipe.id, bergamot.id, '1', '%'
FROM recipe, bergamot;

-- For Hair Rinse
WITH 
  recipe AS (SELECT id FROM public.recipes WHERE title = 'Hair Rinse' LIMIT 1),
  water AS (SELECT id FROM public.ingredients WHERE name = 'Water' LIMIT 1),
  tea AS (SELECT id FROM public.ingredients WHERE name = 'Green Tea' LIMIT 1),
  aloe AS (SELECT id FROM public.ingredients WHERE name = 'Aloe Vera Juice' LIMIT 1),
  vinegar AS (SELECT id FROM public.ingredients WHERE name = 'Apple Cider Vinegar' LIMIT 1),
  rosemary AS (SELECT id FROM public.ingredients WHERE name = 'Rosemary Essential Oil' LIMIT 1),
  peppermint AS (SELECT id FROM public.ingredients WHERE name = 'Peppermint Essential Oil' LIMIT 1)
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 
  recipe.id, water.id, '1', 'cup'
FROM recipe, water
UNION ALL
SELECT 
  recipe.id, tea.id, '2', 'bags'
FROM recipe, tea
UNION ALL
SELECT 
  recipe.id, aloe.id, '1/2', 'cup'
FROM recipe, aloe
UNION ALL
SELECT 
  recipe.id, vinegar.id, '1/2', 'cup'
FROM recipe, vinegar
UNION ALL
SELECT 
  recipe.id, rosemary.id, '10', 'drops'
FROM recipe, rosemary
UNION ALL
SELECT 
  recipe.id, peppermint.id, '6', 'drops'
FROM recipe, peppermint;

-- Insert sample tools
INSERT INTO public.tools (id, title, description, type)
VALUES
  (uuid_generate_v4(), 'Unit Converter', 'Convert between different units of measurement for precise formulation.', 'calculator'),
  (uuid_generate_v4(), 'Formulation Timer', 'Keep track of processing times for multiple steps in your formulations.', 'timer'),
  (uuid_generate_v4(), 'Scaling Calculator', 'Scale formulation quantities up or down while maintaining proportions.', 'calculator'),
  (uuid_generate_v4(), 'Shelf Life Estimator', 'Calculate the expected shelf life of your formulations based on ingredients.', 'calculator'),
  (uuid_generate_v4(), 'pH Meter Simulator', 'Estimate the pH of your formulations based on ingredient inputs.', 'measurement'),
  (uuid_generate_v4(), 'Batch Cost Calculator', 'Calculate the cost per batch and per unit based on ingredient costs.', 'calculator');

-- Insert sample library items
INSERT INTO public.library (id, title, description, content, category)
VALUES
  (uuid_generate_v4(), 'Processing Techniques', 'Reference for common processing techniques used in formulation.', 'This comprehensive guide covers various processing techniques including cold process, hot process, and emulsification methods. Each section includes step-by-step instructions and troubleshooting tips.', 'techniques'),
  (uuid_generate_v4(), 'Ingredient Substitutions', 'Find alternatives for ingredients in your formulations.', 'When you need to substitute ingredients due to allergies, availability or preference, this guide provides equivalent options that maintain similar properties and efficacy in your formulations.', 'ingredients'),
  (uuid_generate_v4(), 'Measurement Guide', 'Standard measurement conversions for precise formulation.', 'Accurate measurements are critical for consistent formulations. This guide includes conversion tables for weight, volume, and concentration measurements commonly used in DIY formulations.', 'measurements'),
  (uuid_generate_v4(), 'Preservation Methods', 'Guide to natural and synthetic preservation options.', 'Learn about different preservation methods to extend the shelf life of your formulations, including natural preservatives, broad-spectrum preservatives, and antioxidants.', 'techniques'),
  (uuid_generate_v4(), 'Equipment Guide', 'Essential tools and equipment for DIY formulations.', 'This guide covers the basic and advanced equipment needed for creating various formulations, from simple tools to specialized devices for more complex preparations.', 'equipment');