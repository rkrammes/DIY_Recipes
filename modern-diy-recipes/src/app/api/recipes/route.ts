import { NextRequest, NextResponse } from 'next/server';

// Sample recipes data for when Supabase is unavailable
const SAMPLE_RECIPES = [
  {
    id: '1',
    title: 'Natural Soap Base',
    description: 'A simple cold-process soap recipe using natural ingredients',
    created_at: new Date().toISOString(),
    user_id: 'sample-user',
    instructions: 'Mix lye with water carefully, blend with oils at proper temperature',
    notes: 'Always wear safety equipment when handling lye'
  },
  {
    id: '2', 
    title: 'Lavender Hand Cream',
    description: 'Moisturizing hand cream with lavender essential oil',
    created_at: new Date().toISOString(),
    user_id: 'sample-user',
    instructions: 'Melt shea butter and beeswax, add oils, whip until fluffy',
    notes: 'Store in a cool, dry place'
  },
  {
    id: '3',
    title: 'Mint Toothpaste',
    description: 'Fluoride-free natural toothpaste with peppermint',
    created_at: new Date().toISOString(),
    user_id: 'sample-user',
    instructions: 'Mix baking soda with coconut oil, add peppermint oil',
    notes: 'Use within 3 months'
  }
];

export async function GET(request: NextRequest) {
  console.log('API: /api/recipes called - returning sample data due to Supabase connection issues');
  
  // Return sample data with a note about the connection issue
  return NextResponse.json({
    data: SAMPLE_RECIPES,
    error: null,
    note: 'Currently showing sample data. Supabase connection is unavailable.'
  });
}

export async function POST(request: NextRequest) {
  // For now, just return an error for POST requests
  return NextResponse.json({
    error: 'Database connection unavailable',
    message: 'Cannot create new recipes while database is offline'
  }, { status: 503 });
}