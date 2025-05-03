import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

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
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    console.log('Fetching recipe details for:', id);
    const include = new URL(request.url).searchParams.get('include')?.split(',') || [];

    let query = supabase
      .from('recipes')
      .select(`
        id,
        title,
        description,
        created_at,
        user_id
      `)
      .eq('id', id)
      .single();

    if (include.includes('iterations')) {
      query = supabase
        .from('recipes')
        .select(`
          id,
          title,
          description,
          created_at,
          user_id,
          iterations (
            id,
            version,
            notes,
            created_at
          )
        `)
        .eq('id', id)
        .single();
    }

    if (include.includes('ingredients')) {
      query = supabase
        .from('recipes')
        .select(`
          id,
          title,
          description,
          created_at,
          user_id,
          recipe_ingredients (
            id,
            quantity,
            unit,
            ingredients (
              id,
              name,
              description
            )
          )
        `)
        .eq('id', id)
        .single();
    }

    const { data, error } = await query;

    if (error) {
      logError(error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.log('Successfully fetched recipe details');
    return NextResponse.json(data, { status: 200 });
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
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
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
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
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