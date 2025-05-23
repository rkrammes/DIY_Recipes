# Recipe Iterations System

This feature allows you to track different versions of your recipes, compare changes between versions, and keep a history of how your recipes evolve over time.

## Setup Instructions

Before you can use the recipe iterations system, you need to set up the required database tables in Supabase:

### Option 1: Using the Setup Script (Recommended)

1. Make sure your Supabase environment variables are set in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional but recommended
   ```

2. Run the setup script:
   ```bash
   node setup-iterations-database.js
   ```

3. The script will create the necessary tables and verify they were created successfully.

### Option 2: Manual SQL Execution

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of `create_recipe_iterations_table.sql`
4. Execute the SQL in the Supabase SQL Editor

## Using the Recipe Iterations System

Once the database tables are set up, you can use the recipe iterations system in the application:

### Creating a New Version

1. Open a recipe
2. Scroll down to the "Recipe Versions" section
3. Click "Create New Version"
4. A copy of the current recipe will be created as a new version
5. Edit the new version to make your changes

### Editing a Version

1. Select a version from the list
2. Click the "Edit" button
3. Make changes to the title, instructions, description, or notes
4. Click "Save Changes"

### Comparing Versions

1. Select a version
2. Click the "Compare with Previous" button
3. The system will show you what changed between versions, including:
   - Changes to basic fields (title, description, instructions, notes)
   - Changes to ingredients (added, removed, or modified)

### Working with Ingredients

The system automatically copies ingredients from the base recipe when creating the first version, and from the previous version when creating subsequent versions. Changes to ingredients in a version don't affect the original recipe.

## Database Schema

The iteration system uses two main tables:

1. `recipe_iterations` - Stores the version data (title, description, instructions, notes, etc.)
2. `iteration_ingredients` - Stores the ingredients associated with each version

## Troubleshooting

If you encounter errors:

1. Check that the database tables were created successfully
2. Verify you have the necessary permissions in Supabase
3. Check the browser console for specific error messages
4. Ensure your Supabase instance is properly configured and running

## Development Notes

- The system is designed to be resilient and will gracefully fail if the required tables don't exist
- Each version is a complete snapshot of the recipe at a point in time
- The comparison system can detect and display changes in both recipe data and ingredients