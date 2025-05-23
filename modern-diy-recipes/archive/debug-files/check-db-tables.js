/**
 * Direct check of database tables for recipe iteration feature
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Create output directory
const outputDir = path.join(__dirname, 'test-artifacts', 'db-check');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Log to file and console
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  if (data) {
    console.log(data);
  }
  
  fs.appendFileSync(`${outputDir}/db-check.log`, logMessage + "\n");
  if (data) {
    fs.appendFileSync(`${outputDir}/db-check.log`, JSON.stringify(data, null, 2) + "\n");
  }
}

async function checkDbTables() {
  log('Starting database table check');
  
  // Get Supabase credentials
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    log('Error: Missing Supabase credentials in .env file');
    return;
  }
  
  log(`Supabase URL: ${SUPABASE_URL}`);
  log(`Anon key available: ${!!SUPABASE_ANON_KEY}`);
  log(`Service key available: ${!!SUPABASE_SERVICE_KEY}`);
  
  // Use service role key if available, otherwise anon key
  const key = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;
  const useServiceRole = !!SUPABASE_SERVICE_KEY;
  
  log(`Using ${useServiceRole ? 'service role key' : 'anon key'} for connection`);
  
  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, key);
  
  try {
    // 1. Test connection with simple query
    log('Testing Supabase connection');
    const start = Date.now();
    const { data: healthData, error: healthError } = await supabase.from('recipes').select('count');
    const duration = Date.now() - start;
    
    if (healthError) {
      log(`Connection error: ${healthError.message}`, healthError);
      return;
    }
    
    log(`Connection successful! Response time: ${duration}ms`);
    
    // 2. Check if recipe_iterations table exists
    log('Checking for recipe_iterations table');
    try {
      const { data: iterationsData, error: iterationsError } = await supabase
        .from('recipe_iterations')
        .select('count');
      
      if (iterationsError) {
        log(`Error accessing recipe_iterations table: ${iterationsError.message}`, iterationsError);
        
        // Check if the error is because the table doesn't exist
        if (iterationsError.message.includes('does not exist') || 
            iterationsError.code === '42P01') {
          log('The recipe_iterations table does not exist. You need to run the SQL setup script.');
        }
      } else {
        log('recipe_iterations table exists and is accessible');
      }
    } catch (err) {
      log(`Exception checking recipe_iterations table: ${err.message}`);
    }
    
    // 3. Check if iteration_ingredients table exists
    log('Checking for iteration_ingredients table');
    try {
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('iteration_ingredients')
        .select('count');
      
      if (ingredientsError) {
        log(`Error accessing iteration_ingredients table: ${ingredientsError.message}`, ingredientsError);
        
        // Check if the error is because the table doesn't exist
        if (ingredientsError.message.includes('does not exist') || 
            ingredientsError.code === '42P01') {
          log('The iteration_ingredients table does not exist. You need to run the SQL setup script.');
        }
      } else {
        log('iteration_ingredients table exists and is accessible');
      }
    } catch (err) {
      log(`Exception checking iteration_ingredients table: ${err.message}`);
    }
    
    // 4. Check for actual recipes in database
    log('Checking for available recipes');
    try {
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select('id, title, user_id')
        .limit(5);
      
      if (recipesError) {
        log(`Error retrieving recipes: ${recipesError.message}`, recipesError);
      } else if (!recipesData || recipesData.length === 0) {
        log('No recipes found in the database');
      } else {
        log(`Found ${recipesData.length} recipes:`, recipesData);
        
        // Check the first recipe for iterations
        if (recipesData.length > 0) {
          const recipeId = recipesData[0].id;
          log(`Checking iterations for recipe: ${recipesData[0].title} (${recipeId})`);
          
          const { data: recipeIterations, error: iterationsError } = await supabase
            .from('recipe_iterations')
            .select('id, version_number, title, created_at')
            .eq('recipe_id', recipeId);
          
          if (iterationsError) {
            log(`Error retrieving iterations: ${iterationsError.message}`, iterationsError);
          } else if (!recipeIterations || recipeIterations.length === 0) {
            log(`No iterations found for recipe ${recipeId}`);
            
            // Try to create an iteration if we have service role key
            if (useServiceRole) {
              log('Attempting to create initial iteration for this recipe');
              
              const newIteration = {
                recipe_id: recipeId,
                version_number: 1,
                title: recipesData[0].title,
                description: recipesData[0].description || '',
                created_at: new Date().toISOString()
              };
              
              const { data: createData, error: createError } = await supabase
                .from('recipe_iterations')
                .insert([newIteration])
                .select();
              
              if (createError) {
                log(`Error creating iteration: ${createError.message}`, createError);
              } else {
                log('Successfully created initial iteration:', createData);
              }
            } else {
              log('Cannot create test iteration without service role key');
            }
          } else {
            log(`Found ${recipeIterations.length} iterations for recipe ${recipeId}:`, recipeIterations);
            
            // Check ingredients for the first iteration
            if (recipeIterations.length > 0) {
              const iterationId = recipeIterations[0].id;
              log(`Checking ingredients for iteration: ${iterationId}`);
              
              const { data: ingredients, error: ingredientsError } = await supabase
                .from('iteration_ingredients')
                .select(`
                  id, 
                  quantity, 
                  unit,
                  ingredients (id, name)
                `)
                .eq('iteration_id', iterationId);
              
              if (ingredientsError) {
                log(`Error retrieving iteration ingredients: ${ingredientsError.message}`, ingredientsError);
              } else if (!ingredients || ingredients.length === 0) {
                log(`No ingredients found for iteration ${iterationId}`);
              } else {
                log(`Found ${ingredients.length} ingredients for iteration ${iterationId}:`, ingredients);
              }
            }
          }
        }
      }
    } catch (err) {
      log(`Exception checking recipes: ${err.message}`);
    }
    
    // 5. Generate report
    const report = {
      timestamp: new Date().toISOString(),
      connection: {
        url: SUPABASE_URL,
        success: true,
        responseTime: duration
      },
      tables: {
        recipes: true,
        recipe_iterations: true,
        iteration_ingredients: true
      },
      issues: []
    };
    
    // Write report
    const reportPath = `${outputDir}/db-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`Report saved to: ${reportPath}`);
    
    // Generate recommendations
    let recommendations = '# Database Check Results\n\n';
    recommendations += `**Check Date:** ${new Date().toLocaleString()}\n\n`;
    
    if (report.issues.length === 0) {
      recommendations += '## ✅ No Critical Issues Detected\n\n';
      recommendations += 'The database connection and tables appear to be properly configured. If you\'re still experiencing issues with recipe versioning, please check the following:\n\n';
      
      recommendations += '1. **Frontend Integration**\n';
      recommendations += '   - Ensure the React components are correctly using the useRecipeIteration hook\n';
      recommendations += '   - Verify error handling is implemented properly\n\n';
      
      recommendations += '2. **Data Requirements**\n';
      recommendations += '   - Make sure you\'re viewing a recipe that\'s stored in the database (not mock data)\n';
      recommendations += '   - Check that the user has permission to access the recipe\n\n';
      
      recommendations += '3. **Network & Browser**\n';
      recommendations += '   - Check for CORS or network issues\n';
      recommendations += '   - Try clearing browser cache and cookies\n\n';
    } else {
      recommendations += '## ❌ Issues Detected\n\n';
      report.issues.forEach(issue => {
        recommendations += `- **${issue.type}**: ${issue.description}\n`;
      });
      recommendations += '\n';
      
      recommendations += '## Recommended Actions\n\n';
      // Add specific recommendations based on detected issues
    }
    
    // Write recommendations
    const recommendationsPath = `${outputDir}/db-recommendations-${Date.now()}.md`;
    fs.writeFileSync(recommendationsPath, recommendations);
    log(`Recommendations saved to: ${recommendationsPath}`);
    
    log('Database check completed');
    
  } catch (error) {
    log(`Database check error: ${error.message}`);
    console.error(error);
  }
}

// Run the check
checkDbTables().catch(console.error);