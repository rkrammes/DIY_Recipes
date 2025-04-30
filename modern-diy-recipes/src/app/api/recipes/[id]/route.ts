import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type {  } from '@/types/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();  // Ensure body is parsed correctly
    const { title, description, ingredients } = body;  // Extract fields

    const { error } = await supabase.rpc('update_recipe_with_ingredients', {
      p_recipe_id: params.id,
      p_title: title,
      p_description: description,
      p_ingredients: ingredients  // Pass the ingredients array as JSONB
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Recipe updated successfully' }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request body';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}