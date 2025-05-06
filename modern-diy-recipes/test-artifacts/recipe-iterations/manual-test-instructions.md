# Recipe Iteration System Manual Test Instructions

Since automated testing couldn't locate recipe elements, here are step-by-step instructions for manual testing.

## Prerequisites
- The DIY Recipes application must be running on http://localhost:3000
- The Supabase database should be properly configured with the recipe_iterations and iteration_ingredients tables
- At least one recipe should exist in the database

## Test Steps

### 1. Create a Recipe Version
1. Navigate to the application homepage (http://localhost:3000)
2. Select any recipe from the list (preferably one stored in the database, not mock data)
3. Scroll down to the "Recipe Versions" section
4. If using mock data, you'll see a warning that "Recipe versioning is not available"
5. If using real database data, click the "Create New Version" button
6. Verify a new version is created and displayed in the versions list
7. Screenshot: Take a screenshot of the versions list

### 2. Edit a Recipe Version
1. With a recipe version displayed, click the "Edit" button
2. Modify the notes field (add some test text)
3. Click "Save Changes"
4. Verify the changes are saved and displayed
5. Screenshot: Take a screenshot of the saved changes

### 3. Compare Recipe Versions
1. With at least two versions of a recipe available, click the "Compare" button
2. Verify the comparison results are displayed
3. Screenshot: Take a screenshot of the comparison view

## What to Look For
- The Recipe Versions section should properly display existing versions
- Creating a new version should increment the version number
- Editing and saving should persist changes
- The comparison feature should highlight differences between versions

## Expected Results
- Version creation works correctly
- Version editing and saving functions properly
- Version comparison shows differences accurately
- The UI handles errors gracefully when they occur

## Troubleshooting
If issues occur:
1. Check browser console for JavaScript errors
2. Verify Supabase connection is working
3. Confirm SQL tables are properly created
4. Check that the user is authenticated (if required)