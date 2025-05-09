import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * POST /api/settings/update
 * Updates the user's preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Initialize Supabase client
    const supabase = createServerComponentClient({ cookies });
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // For unauthenticated users, store in cookies
      if (body.theme) cookies().set('theme', body.theme);
      if (body.audio_enabled !== undefined) cookies().set('audioEnabled', String(body.audio_enabled));
      if (body.volume !== undefined) cookies().set('volume', String(body.volume));
      
      return NextResponse.json({ 
        success: true, 
        message: 'Preferences saved to cookies',
        authenticated: false 
      });
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
        .insert([{ 
          user_id: user.id, 
          ...body 
        }]);
        
      if (insertError) {
        console.error('Error creating preferences:', insertError);
        return NextResponse.json(
          { error: 'Failed to save preferences' },
          { status: 500 }
        );
      }
    } else {
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_preferences')
        .update(body)
        .eq('user_id', user.id);
        
      if (updateError) {
        console.error('Error updating preferences:', updateError);
        return NextResponse.json(
          { error: 'Failed to update preferences' },
          { status: 500 }
        );
      }
    }
    
    // Also update user metadata for some fields
    if (body.display_name || body.avatar || body.color) {
      const userMetadata = {
        ...user.user_metadata,
        name: body.display_name || user.user_metadata?.name,
        avatar: body.avatar || user.user_metadata?.avatar,
        color: body.color || user.user_metadata?.color
      };
      
      const { error: metadataError } = await supabase.auth.updateUser({
        data: userMetadata
      });
      
      if (metadataError) {
        console.warn('Error updating user metadata:', metadataError);
        // Continue anyway, as this is not critical
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Preferences saved to database',
      authenticated: true
    });
  } catch (err) {
    console.error('Error in preferences API:', err);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}