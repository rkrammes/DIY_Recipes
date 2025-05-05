#!/bin/bash

# Fix recipes script - runs the import script and launches diagnostic tools
echo "Starting recipe database fix process..."

# Step 1: Install uuid package if needed
if ! npm list | grep -q uuid; then
  echo "Installing uuid package..."
  npm install uuid
fi

# Step 2: Run the import script
echo "Running recipe import script..."
node import-recipes.js

# Step 3: Start the app and run diagnostic tools
echo "Now you can start the app with: npm run dev"
echo "Then visit: http://localhost:3000/recipe-mcp-diagnostics to check the imported recipes"
echo "Or run the recipe UI diagnostic with: node recipe-ui-diagnostics.js"

echo "Recipe fix process completed!"