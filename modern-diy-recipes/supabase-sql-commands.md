# Supabase SQL Commands

To create the missing tables in your Supabase database, follow these steps:

1. Log in to [Supabase](https://supabase.com) 
2. Navigate to your project: `bzudglfxxywugesncjnz`
3. Click on "SQL Editor" in the left sidebar
4. Create a new query
5. Paste the SQL commands below
6. Click "Run" to execute

## Step 1: Create SQL Functions (Required First)

First, run this to create the necessary SQL execution functions:

```sql
-- Create RPC functions for SQL execution
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Alternative function name that might be used
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;
```

## Step 2: Create Missing Tables

After creating the functions, run this to create the missing tables with sample data:

```sql
-- SQL script to create missing tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tools table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create library table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample tools data
INSERT INTO public.tools (title, description, type)
VALUES
  ('Unit Converter', 'Convert between different units of measurement for precise formulation.', 'calculator'),
  ('Formulation Timer', 'Keep track of processing times for multiple steps in your formulations.', 'timer'),
  ('Scaling Calculator', 'Scale formulation quantities up or down while maintaining proportions.', 'calculator'),
  ('Shelf Life Estimator', 'Calculate the expected shelf life of your formulations based on ingredients.', 'calculator'),
  ('pH Meter Simulator', 'Estimate the pH of your formulations based on ingredient inputs.', 'measurement'),
  ('Batch Cost Calculator', 'Calculate the cost per batch and per unit based on ingredient costs.', 'calculator')
ON CONFLICT (title) DO NOTHING;

-- Insert sample library data
INSERT INTO public.library (title, description, content, category)
VALUES
  ('Processing Techniques', 'Reference for common processing techniques used in formulation.', 'This comprehensive guide covers various processing techniques including cold process, hot process, and emulsification methods. Each section includes step-by-step instructions and troubleshooting tips.', 'techniques'),
  ('Ingredient Substitutions', 'Find alternatives for ingredients in your formulations.', 'When you need to substitute ingredients due to allergies, availability or preference, this guide provides equivalent options that maintain similar properties and efficacy in your formulations.', 'ingredients'),
  ('Measurement Guide', 'Standard measurement conversions for precise formulation.', 'Accurate measurements are critical for consistent formulations. This guide includes conversion tables for weight, volume, and concentration measurements commonly used in DIY formulations.', 'measurements'),
  ('Preservation Methods', 'Guide to natural and synthetic preservation options.', 'Learn about different preservation methods to extend the shelf life of your formulations, including natural preservatives, broad-spectrum preservatives, and antioxidants.', 'techniques'),
  ('Equipment Guide', 'Essential tools and equipment for DIY formulations.', 'This guide covers the basic and advanced equipment needed for creating various formulations, from simple tools to specialized devices for more complex preparations.', 'equipment')
ON CONFLICT (title) DO NOTHING;
```

## Step 3: Set Up RLS Policies

Finally, run this to set up Row Level Security policies to allow the anon key to access the new tables:

```sql
-- For tools table
ALTER TABLE IF EXISTS public.tools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous access to tools" ON public.tools;
CREATE POLICY "Allow anonymous access to tools" ON public.tools FOR ALL USING (true);

-- For library table
ALTER TABLE IF EXISTS public.library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous access to library" ON public.library;
CREATE POLICY "Allow anonymous access to library" ON public.library FOR ALL USING (true);
```

## Verification

After running these commands, verify the tables were created correctly:

```sql
-- Verify tools table
SELECT COUNT(*) FROM public.tools;

-- Verify library table
SELECT COUNT(*) FROM public.library;
```

## After Running the SQL

Once you've run these SQL commands:

1. Start the application with proper configuration:
   ```bash
   ./start-with-secure-config.sh
   ```

2. Navigate to the terminal interface:
   ```
   http://localhost:3000/terminal
   ```

3. The application should now display real data from all tables:
   - recipes
   - ingredients
   - recipe_ingredients
   - tools
   - library

## Troubleshooting

If you encounter any issues, run the connectivity test script to diagnose the problem:

```bash
node test-supabase-connectivity.js
```

This will show you:
- If your Supabase connection is working
- Which tables exist and which are missing
- How many records are in each table