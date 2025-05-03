import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import type { Recipe } from '../../../types/models';

// Add error logging
const logError = (error: any) => {
  console.error('API Error:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code
  });
};

export async function GET() {
  try {
    console.log('Fetching recipes from Supabase...');
    const { data, error } = await supabase
      .from('recipes')
      .select('id, title')
      .order('created_at', { ascending: false });

    if (error) {
      logError(error);
      return NextResponse.json({
        error: error.message,
        details: error.details,
        hint: error.hint
      }, { status: 500 });
    }

    console.log('Successfully fetched recipes:', data?.length || 0);
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/recipes:', error);
    return NextResponse.json({
      error: 'Unexpected server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<Recipe>;

    const { data, error } = await supabase
      .from('recipes')
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}