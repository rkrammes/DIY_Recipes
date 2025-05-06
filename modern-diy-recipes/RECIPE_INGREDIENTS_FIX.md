# Recipe Ingredients Fix Guide

## Problem Identified

The application is not displaying ingredients for recipes because it's looking for a table called `recipe_ingredients` (with underscore), but your Supabase database actually has a table called `recipeingredients` (without underscore).

## Fix Solution

The simplest solution is to update your code to use the correct table name. I've created a script to do this automatically.

### Run the table name fix script

```
node fix-table-name.js
```

This script will:
- Search all JavaScript files in your project
- Replace references to "recipe_ingredients" with "recipeingredients"
- Only modify files that actually contain references to the table

This is much simpler than creating a new table, as you already have a working table with data!

## Verification

After running the fix script, run the diagnostic script to verify that the changes worked:

```
node check-recipe-ingredients.js
```

This will show you:
- The recipes in your database
- The ingredients in your database
- Information about the "recipeingredients" table
- A diagnosis of any remaining issues

## Alternative Solutions (Only If Needed)

If the table name fix doesn't work, there are two alternative approaches:

### Option 1: Create a database view

You can create a SQL view that makes "recipeingredients" accessible as "recipe_ingredients":

```sql
CREATE OR REPLACE VIEW recipe_ingredients AS
SELECT * FROM recipeingredients;
```

Run this in the Supabase SQL Editor to create a view with the name your code expects.

### Option 2: Create a new table with the expected name

If you prefer to match the table name to your code instead, you can:
1. Run `create-recipe-ingredients.sql` in the Supabase SQL Editor
2. Run `fix-recipe-ingredients.js` to populate the new table

## Files Included

1. `fix-table-name.js` - Script to update your code to use the correct table name
2. `check-recipe-ingredients.js` - Diagnostic script to verify the fix
3. `create-recipe-ingredients.sql` - SQL script to create a new table (only use if option 1 fails)
4. `fix-recipe-ingredients.js` - Script to populate a new table (only use if option 1 fails)

## Next Steps

Once this is fixed:
1. Restart your application with `npm run dev`
2. Navigate to the recipes page
3. Click on a recipe to view its details
4. Verify that ingredients are now displayed correctly

---

The good news is that your data is already in the database - you just need your code to look for it in the right place!