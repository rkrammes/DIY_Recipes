/**
 * Recipe API Server
 * 
 * A simple Express server that serves API endpoints for recipes
 * with fallback data from supabaseConfig.js.
 */

const express = require('express');
const cors = require('cors');
const { FALLBACK_RECIPES } = require('./src/lib/supabaseConfig');

const app = express();
const PORT = process.env.RECIPE_API_PORT || 3005;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// API endpoint for all recipes
app.get('/api/recipes', (req, res) => {
  console.log('GET /api/recipes - No fallback recipes available');
  // Return an empty array instead of mock data
  res.json([]);
});

// API endpoint for a specific recipe
app.get('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  
  console.log(`GET /api/recipes/${id} - No fallback recipe available`);
  
  // Return a 404 error response - no mock data
  res.status(404).json({
    error: 'Recipe not found',
    message: 'The requested recipe does not exist in the database and no fallbacks are available.'
  });
});

// API endpoint for recipe ingredients
app.get('/api/recipes/:id/ingredients', (req, res) => {
  const { id } = req.params;
  
  console.log(`GET /api/recipes/${id}/ingredients - No fallback ingredients available`);
  
  // Return an empty array - no mock data
  res.json([]);
});

// API endpoint for recipe iterations
app.get('/api/recipes/:id/iterations', (req, res) => {
  console.log(`GET /api/recipes/${req.params.id}/iterations`);
  // For simplicity, we always return an empty array of iterations
  res.json([]);
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    service: 'recipe-api',
    timestamp: new Date().toISOString(),
    recipe_count: FALLBACK_RECIPES.length
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Recipe API server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET /api/recipes - List all recipes`);
  console.log(`  GET /api/recipes/:id - Get a specific recipe`);
  console.log(`  GET /api/recipes/:id/ingredients - Get ingredients for a recipe`);
  console.log(`  GET /api/recipes/:id/iterations - Get iterations for a recipe`);
  console.log(`  GET /api/status - Get server status`);
});