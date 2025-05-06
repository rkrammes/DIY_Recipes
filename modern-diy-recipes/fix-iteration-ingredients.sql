-- Fix the iteration_ingredients query to include ingredient_id explicitly
ALTER TABLE public.iteration_ingredients
ADD COLUMN IF NOT EXISTS ingredient_id UUID REFERENCES public.ingredients(id);