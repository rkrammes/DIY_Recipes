# Fix Recipe Ingredients Display: Supabase Setup Instructions

The recipe ingredients are not displaying because the `recipe_ingredients` junction table is missing from the database. Here's how to fix it:

## Quick Steps

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to your project
3. Go to the SQL Editor tab
4. Copy the entire contents of the `recipe_ingredients_setup.sql` file
5. Paste it into the SQL Editor and click "Run"
6. Restart your application to see the changes

## What Does This Fix?

Our diagnosis found that your application has the following issues:

1. The `recipe_ingredients` junction table doesn't exist in the database
2. The application is trying to fetch recipe ingredients but getting 404 errors
3. The UI is showing recipes but not their ingredients

## Detailed Explanation

The SQL script does the following:

1. Creates the `recipe_ingredients` junction table if it doesn't exist
2. Adds appropriate foreign key constraints and indexes
3. Gets existing recipe and ingredient IDs (or creates them if needed)
4. Populates the junction table with the ingredient relationships from your CSV data
5. Creates a helper function to easily query recipes with their ingredients

After running this script, your recipes should display with their proper ingredients.

## Understanding the Database Structure

The solution uses a standard many-to-many relationship model:

```
┌─────────┐     ┌──────────────────────┐     ┌────────────┐
│ recipes │     │ recipe_ingredients   │     │ ingredients│
├─────────┤     ├──────────────────────┤     ├────────────┤
│ id      │─────┤ recipe_id            │     │ id         │
│ title   │     │ ingredient_id        │─────│ name       │
│ desc    │     │ quantity             │     │ desc       │
└─────────┘     │ unit                 │     └────────────┘
                └──────────────────────┘
```

This structure allows:
- A recipe to have many ingredients with specific quantities
- An ingredient to be used in many recipes
- Proper data normalization for better database management

## Common Issues

If you're still having problems after running the script, try:

1. **Browser Cache**: Clear your browser cache or do a hard refresh (Ctrl+F5)
2. **Application Restart**: Make sure you've fully restarted your Next.js application
3. **Database Permissions**: Ensure the Supabase anonymous role has read access to the new table

## Extending This Solution

If you want to add new recipes in the future, you can:

1. Add recipes directly to the tables through the Supabase Dashboard
2. Update your application to include a proper recipe creation form that handles the relationships
3. Use the `get_recipe_with_ingredients` function we created for direct SQL queries