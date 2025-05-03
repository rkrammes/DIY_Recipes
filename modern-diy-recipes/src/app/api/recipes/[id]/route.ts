import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

interface Ingredient {
  id: string;
  name: string;
  description: string | null;
}

interface RecipeIngredient {
  ingredient_id: string;
  quantity: number;
  unit: string;
  notes: string | null;
  ingredients: Ingredient;
}

interface Iteration {
  id: string;
  recipe_id: string;
  version: number;
  notes: string;
  created_at: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  difficulty: string | null;
  created_at: string;
  updated_at: string;
  version: number;
  user_id: string | null;
  ingredients?: Array<{
    id: string;
    quantity: number;
    unit: string;
    notes: string | null;
    name: string | null;
    description: string | null;
  }>;
  iterations?: Iteration[];
}

// Add error logging
const logError = (error: any) => {
  console.error('API Error:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code
  });
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log('Fetching recipe details for:', id);
    const include = new URL(request.url).searchParams.get('include')?.split(',') || [];

    // First get the recipe details
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select(`
        id,
        title,
        description,
        instructions,
        prep_time_minutes,
        cook_time_minutes,
        difficulty,
        created_at,
        updated_at,
        version,
        user_id
      `)
      .eq('id', id)
      .single();

    if (recipeError) {
      logError(recipeError);
      return NextResponse.json({ error: recipeError.message }, { status: 404 });
    }

    const recipeData = recipe as Recipe;

    // If ingredients are requested, get them with a join to the ingredients table
    if (include.includes('ingredients')) {
      const { data: ingredients, error: ingError } = await supabase
        .from('recipeingredients')
        .select(`
          ingredient_id,
          quantity,
          unit,
          notes,
          ingredients (
            id,
            name,
            description
          )
        `)
        .eq('recipe_id', id) as { data: RecipeIngredient[] | null, error: any };

      if (ingError) {
        logError(ingError);
      } else if (ingredients) {
        recipeData.ingredients = ingredients.map(ing => ({
          id: ing.ingredient_id,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes,
          name: ing.ingredients.name,
          description: ing.ingredients.description
        }));
      }
    }

    // If iterations are requested, get them
    if (include.includes('iterations')) {
      const { data: iterations, error: iterError } = await supabase
        .from('Iteration_Notes')
        .select('*')
        .eq('recipe_id', id) as { data: Iteration[] | null, error: any };

      if (iterError) {
        logError(iterError);
      } else if (iterations) {
        recipeData.iterations = iterations;
      }
    }

    return NextResponse.json(recipeData, { status: 200 });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/recipes/[id]:', error);
    return NextResponse.json(
      { error: 'Unexpected server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const updates = await request.json();

    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logError(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Unexpected error in PATCH /api/recipes/[id]:', error);
    return NextResponse.json(
      { error: 'Invalid request body', details: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { error } = await supabase.from('recipes').delete().eq('id', id);

    if (error) {
      logError(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Unexpected error in DELETE /api/recipes/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe', details: error.message },
      { status: 500 }
    );
  }
}