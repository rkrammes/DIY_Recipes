import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * GET /api/settings/theme
 * Returns the user's theme preference
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createServerComponentClient({ cookies });
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // For unauthenticated users, check if theme is in cookies
      const theme = cookies().get('theme')?.value || 'hackers';
      return NextResponse.json({ theme });
    }
    
    // For authenticated users, fetch from Supabase
    const { data, error } = await supabase
      .from('user_preferences')
      .select('theme')
      .eq('user_id', user.id)
      .single();
      
    if (error) {
      console.error('Error fetching theme:', error);
      // Fall back to cookie or default
      const theme = cookies().get('theme')?.value || 'hackers';
      return NextResponse.json({ theme });
    }
    
    return NextResponse.json({ theme: data.theme });
  } catch (err) {
    console.error('Error in theme API:', err);
    return NextResponse.json(
      { error: 'Failed to get theme' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/theme
 * Updates the user's theme preference
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { theme } = body;
    
    if (!theme) {
      return NextResponse.json(
        { error: 'Theme is required' },
        { status: 400 }
      );
    }
    
    // Store theme in cookie for non-authenticated users
    cookies().set('theme', theme);
    
    // Initialize Supabase client
    const supabase = createServerComponentClient({ cookies });
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // For unauthenticated users, we're done after setting the cookie
      return NextResponse.json({ success: true, theme });
    }
    
    // For authenticated users, update in Supabase
    // First check if a preferences record exists
    const { data: existingData } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (!existingData) {
      // Create a new preferences record
      const { error: insertError } = await supabase
        .from('user_preferences')
        .insert([{ user_id: user.id, theme }]);
        
      if (insertError) {
        console.error('Error creating preferences:', insertError);
        return NextResponse.json(
          { error: 'Failed to save theme' },
          { status: 500 }
        );
      }
    } else {
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({ theme })
        .eq('user_id', user.id);
        
      if (updateError) {
        console.error('Error updating theme:', updateError);
        return NextResponse.json(
          { error: 'Failed to update theme' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({ success: true, theme });
  } catch (err) {
    console.error('Error in theme API:', err);
    return NextResponse.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    );
  }
}