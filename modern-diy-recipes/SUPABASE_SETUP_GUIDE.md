# Supabase Setup Guide for DIY Recipes

This guide will help you set up the correct database tables in Supabase to display recipes with their ingredients properly.

## Problem Diagnosis

The application shows recipes in the recipe list but doesn't display their ingredients because:

1. The `recipe_ingredients` junction table is missing in the Supabase database
2. The data flow for ingredients is failing with 404 errors since the junction table doesn't exist
3. The CSV-formatted ingredients need to be properly parsed and stored in the database

## Solution: Database Setup

The included `supabase-setup.sql` script will create all necessary tables and populate them with the recipe data from your CSV.

## Steps to Fix the Issue

### Method 1: Using the Supabase Dashboard

1. Log in to your Supabase dashboard
2. Go to the SQL Editor section
3. Copy the contents of `supabase-setup.sql`
4. Paste into the SQL editor and run the script
5. Restart your application

### Method 2: Using the Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to your project directory
cd /path/to/modern-diy-recipes

# Apply the SQL migration (replace YOUR_PROJECT_REF with your actual Supabase project reference)
supabase db execute -f supabase-setup.sql --project-ref YOUR_PROJECT_REF --db-url postgresql://postgres:postgres@localhost:5432/postgres
```

## Verifying the Fix

After running the SQL script:

1. Start your application with `npm run dev`
2. Check the recipe list - you should now see recipes
3. Click on a recipe - you should now see its ingredients displayed in the table
4. If you encounter any issues, check the browser console for errors

## Explanation of the Database Structure

The database uses three main tables with relationships:

1. **recipes** - Stores basic recipe information
   - id (UUID, primary key)
   - title (TEXT)
   - description (TEXT)
   - created_at (TIMESTAMP)
   - user_id (TEXT)

2. **ingredients** - Stores ingredient information
   - id (UUID, primary key)
   - name (TEXT, unique)
   - description (TEXT)
   - created_at (TIMESTAMP)

3. **recipe_ingredients** - Junction table linking recipes to ingredients with quantities
   - id (UUID, primary key)
   - recipe_id (UUID, foreign key to recipes.id)
   - ingredient_id (UUID, foreign key to ingredients.id)
   - quantity (TEXT)
   - unit (TEXT)
   - created_at (TIMESTAMP)

This structure properly normalizes the data and allows for efficient querying of recipes with their ingredients.

## Additional Notes

- The 404 errors for recipe_iterations and recipe_ai_suggestions can be ignored - these are optional advanced features
- The script automatically handles existing data to avoid duplicates
- All primary and foreign key constraints are properly set up for data integrity
- Indexes are created for better query performance