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
  ('Scaling Calculator', 'Scale formulation quantities up or down while maintaining proportions.', 'calculator')
ON CONFLICT (title) DO NOTHING;

-- Insert sample library data
INSERT INTO public.library (title, description, content, category)
VALUES
  ('Processing Techniques', 'Reference for common processing techniques used in formulation.', 'This comprehensive guide covers various processing techniques.', 'techniques'),
  ('Ingredient Substitutions', 'Find alternatives for ingredients in your formulations.', 'When you need to substitute ingredients due to allergies.', 'ingredients'),
  ('Measurement Guide', 'Standard measurement conversions for precise formulation.', 'Accurate measurements are critical for consistent formulations.', 'measurements')
ON CONFLICT (title) DO NOTHING;