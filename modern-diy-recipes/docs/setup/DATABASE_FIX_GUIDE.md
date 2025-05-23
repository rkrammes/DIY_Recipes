# Fixing Recipe Database Tables

## Issue
The recipe application is not displaying ingredients correctly because the database structure is incomplete. The recipe and ingredient data exists, but the `recipe_ingredients` junction table that connects them is either missing or not properly populated.

## Solution
I've created a SQL script that will:
1. Create any missing tables
2. Insert sample recipe data (Beard Oil, Beard Balm, etc.)
3. Insert ingredient data if it doesn't already exist
4. Create the relationships between recipes and their ingredients

## Instructions

### Option 1: Using Supabase SQL Editor (Recommended)
1. Log in to your Supabase dashboard
2. Navigate to your project
3. Click on "SQL Editor" in the left sidebar
4. Create a new query or open an existing one
5. Copy and paste the entire contents of the `database.sql` file into the editor
6. Click "Run" to execute the script
7. Check the output for any errors

### Option 2: Using the Supabase CLI
1. Install the Supabase CLI if you haven't already
2. Log in to your Supabase account
3. Run the SQL script with:
   ```
   supabase db execute --project-ref YOUR_PROJECT_REF --file database.sql
   ```

### Option 3: Using PostgreSQL Client
If you have direct access to your PostgreSQL database:
1. Connect to your database using psql or another client
2. Execute the script:
   ```
   \i database.sql
   ```

## Verification
After running the script:
1. Start your application with `npm run dev`
2. Navigate to the recipes page
3. Click on any recipe to view its details
4. The ingredients should now display correctly

## Troubleshooting
If you still encounter issues:
1. Make sure the SQL script ran without errors
2. Check the developer console for any API errors
3. Verify that the recipe_ingredients table was created and contains data
4. Use the recipe-mcp-diagnostics page to verify database connectivity:
   ```
   http://localhost:3000/recipe-mcp-diagnostics
   ```

## Technical Details

### Table Structure
- **recipes**: Stores basic recipe information (title, description, instructions)
- **ingredients**: Stores ingredient information (name, description)
- **recipe_ingredients**: Junction table connecting recipes to ingredients with quantity and unit information

### Sample Data
The script provides 6 complete recipes with their ingredients:
- Beard Oil (2 ingredients)
- Beard Balm (6 ingredients)
- Mustache Wax (3 ingredients)
- Foaming Hand Soap (4 ingredients)
- Hand Cream (7 ingredients)
- Hair Rinse (6 ingredients)

The data was provided in the original CSV format and converted to SQL for direct database insertion.