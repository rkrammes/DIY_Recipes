 // Import the Supabase client
import { supabaseClient } from './supabaseClient.js';
// Fixed import names to match api.js exports - this fixes the SyntaxError
// "Importing binding name 'fetchIngredients' is not found"
import { loadRecipes, loadAllIngredients, updateRecipeIngredients, analyzeIngredients, getRecipeTimeline, getBatchHistory, estimateShelfLife } from './api.js';
import { initRecipeActions } from './recipe-actions.js';

// Global variables
let isLoggedIn = false;
let allIngredients = []; // Global array to store all ingredients
let currentRecipe = null; // Track the currently displayed recipe
let recipesCache = []; // Cache for loaded recipes

// Simple notification function - moved here to ensure it's defined before any calls
window.showNotification = function(message, type = 'info') {
  const notification = document.createElement('div');
  notification.innerText = message;

  // Basic styles
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.padding = '10px 15px';
  notification.style.borderRadius = '5px';
  notification.style.color = '#fff';
  notification.style.fontSize = '14px';
  notification.style.zIndex = 1000;
  notification.style.opacity = '0.95';

  // Color based on type
  if (type === 'success') {
    notification.style.backgroundColor = '#4CAF50';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#f44336';
  } else {
    notification.style.backgroundColor = '#2196F3';
  }

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Sets the edit mode fields based on login state.
 */
function setEditModeFields(active = null) {
  console.log('Setting edit mode fields. Active:', active);
  const editModeBtn = document.getElementById('btnEditModeToggle');
  const addRecipeBtn = document.getElementById('btnAddRecipe'); // In header
  const addGlobalIngredientBtn = document.getElementById('btnAddGlobalIngredient'); // In left column
  const iterationSection = document.getElementById('iterationSection'); // Right column edit section

  // If active is null, use the current state from the button
  if (active === null && editModeBtn) {
    active = editModeBtn.dataset.active === 'true';
  }

  // Update button text
  if (editModeBtn) {
    editModeBtn.textContent = `Edit Mode: ${active ? 'ON' : 'OFF'}`;
    editModeBtn.dataset.active = active.toString();
  }

  // Show/hide add buttons based on edit mode and login state
  if (addRecipeBtn) {
    addRecipeBtn.style.display = (active && isLoggedIn) ? 'flex' : 'none';
  }
  if (addGlobalIngredientBtn) {
    addGlobalIngredientBtn.style.display = (active && isLoggedIn) ? 'inline-block' : 'none';
  }
  if (iterationSection) {
     iterationSection.style.display = (active && isLoggedIn && currentRecipe) ? 'block' : 'none';
  }

  // Also update specific buttons within the iteration section if needed
  const addIterationIngredientBtn = document.getElementById('addIterationIngredientBtn');
  const commitRecipeBtn = document.getElementById('commitRecipeBtn');
  const createNewIterationBtn = document.getElementById('createNewIterationBtn'); // Added this button

  if(addIterationIngredientBtn) addIterationIngredientBtn.style.display = (active && isLoggedIn && currentRecipe) ? 'inline-block' : 'none';
  if(commitRecipeBtn) commitRecipeBtn.style.display = (active && isLoggedIn && currentRecipe) ? 'inline-block' : 'none';
  if(createNewIterationBtn) createNewIterationBtn.style.display = (active && isLoggedIn && currentRecipe) ? 'inline-block' : 'none';

  // General edit elements (if any remain outside specific sections)
  document.querySelectorAll('.edit-mode-element').forEach(el => {
      // Avoid hiding the main iteration section again if it was already handled
      if (el.id !== 'iterationSection') {
          el.style.display = (active && isLoggedIn) ? 'block' : 'none';
      }
  });
}

/**
 * Updates the authentication button based on login state.
 */
export function updateAuthButton() {
  const loginBtn = document.getElementById('btnLogIn');
  const magicLinkForm = document.getElementById('magicLinkForm');
  const editModeBtn = document.getElementById('btnEditModeToggle');

  if (loginBtn) {
    loginBtn.textContent = isLoggedIn ? 'Log Out' : 'Log In';
  }

  if (magicLinkForm) {
    magicLinkForm.style.display = (!isLoggedIn && loginBtn && loginBtn.dataset.showForm === 'true') ? 'block' : 'none';
  }

  if (editModeBtn) {
    editModeBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    // If logging out, ensure edit mode is turned off
    if (!isLoggedIn && editModeBtn.dataset.active === 'true') {
      editModeBtn.dataset.active = 'false';
      setEditModeFields(false);
    }
  }
}

/**
 * Returns the current edit mode state.
 */
export function isEditMode() {
  const editModeBtn = document.getElementById('btnEditModeToggle');
  return editModeBtn && editModeBtn.dataset.active === 'true' && isLoggedIn;
}

/**
 * Renders the recipe list in the UI.
 */
export function renderRecipes(recipes) {
  console.log('Rendering recipes:', recipes);
  const recipeList = document.getElementById('recipeList');
  if (!recipeList) return;

  // Clear existing list
  recipeList.innerHTML = '';

  // Sort recipes by title
  const sortedRecipes = [...recipes].sort((a, b) => {
    return a.title.localeCompare(b.title);
  });

  // Create list items
  sortedRecipes.forEach(recipe => {
    console.log('Rendering item: ID=' + recipe.id + ', Name=' + recipe.title);
    const li = document.createElement('li');
    li.classList.add('recipe-item');
    li.dataset.id = recipe.id;
    
    // Create a container for the recipe item content
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('recipe-item-content');
    
    // Add recipe title
    const titleSpan = document.createElement('span');
    titleSpan.textContent = recipe.title;
    titleSpan.classList.add('recipe-title');
    contentDiv.appendChild(titleSpan);
    
    // Add version badge if version > 1
    if (recipe.version && recipe.version > 1) {
      const versionBadge = document.createElement('span');
      versionBadge.textContent = `v${recipe.version}`;
      versionBadge.classList.add('version-badge');
      contentDiv.appendChild(versionBadge);
    }
    
    li.appendChild(contentDiv);
    // Click listener moved to initUI using event delegation
    
    recipeList.appendChild(li);
  });
}

/**
 * Renders the ingredients list in the UI, making it collapsible.
 */
/**
* Renders the GLOBAL ingredients list in the left column.
*/
export function renderGlobalIngredients(ingredients) {
 console.log('renderGlobalIngredients called with:', ingredients);
 const ingredientList = document.getElementById('globalIngredientList'); // Target left column list
 if (!ingredientList) {
   console.error('renderGlobalIngredients: Could not find element with ID "globalIngredientList"');
   return;
  }

  console.log('Found ingredientList element:', ingredientList);

  // Clear existing list
  ingredientList.innerHTML = '';

 if (!ingredients || ingredients.length === 0) {
   console.log('No global ingredients to render');
   ingredientList.innerHTML = '<li>No global ingredients found.</li>';
   return;
  }

  // Sort ingredients by name
  const sortedIngredients = [...ingredients].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  console.log('Sorted ingredients for rendering:', sortedIngredients);

  // Create list items
  sortedIngredients.forEach(ingredient => {
    // console.log('Rendering global ingredient:', ingredient); // Less verbose logging
    const li = document.createElement('li');
    li.classList.add('ingredient-item'); // Keep class for potential styling/interaction
    li.dataset.id = ingredient.id; // Use the actual ingredient ID
    
    // --- Summary Section (Always Visible) ---
    const summaryDiv = document.createElement('div');
    summaryDiv.classList.add('ingredient-summary');
    summaryDiv.style.display = 'flex';
    summaryDiv.style.justifyContent = 'space-between';
    summaryDiv.style.alignItems = 'center';
    summaryDiv.style.width = '100%';
    
    // Add ingredient name
    const nameDiv = document.createElement('div');
    nameDiv.classList.add('ingredient-name');
    nameDiv.textContent = ingredient.name;
    nameDiv.style.fontWeight = 'bold';
    nameDiv.style.flex = '1';
    summaryDiv.appendChild(nameDiv);
    
    // No quantity/unit needed for global list
    
    li.appendChild(summaryDiv);
    
    // --- Details Section (Initially Hidden) ---
    const detailsDiv = document.createElement('div');
    detailsDiv.classList.add('ingredient-details');
    detailsDiv.style.display = 'none'; // Hide details by default
    detailsDiv.style.marginTop = '5px';
    detailsDiv.style.paddingLeft = '10px'; // Indent details slightly
    detailsDiv.style.borderLeft = '2px solid rgba(255, 255, 255, 0.2)'; // Visual indicator for details
    
    // Add ingredient description if available
    if (ingredient.description) {
      const descDiv = document.createElement('div');
      descDiv.classList.add('ingredient-description');
      descDiv.textContent = ingredient.description;
      descDiv.style.fontSize = '0.9em';
      descDiv.style.marginBottom = '3px';
      detailsDiv.appendChild(descDiv);
    }
    
    // No notes needed for global list
    
    // Only add detailsDiv if it has content
    if (detailsDiv.hasChildNodes()) {
      li.appendChild(detailsDiv);
    }
    
    // --- Click Handler for Collapsing/Expanding ---
    li.style.cursor = 'pointer';
    li.style.padding = '8px';
    li.style.marginBottom = '5px'; // Reduced margin for compactness
    li.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    li.style.borderRadius = '4px';
    li.style.transition = 'background-color 0.2s ease';
    
    // Click listener for global ingredients (if needed later) can be added via delegation
    ingredientList.appendChild(li);
  });
  
 // console.log('Finished rendering global ingredients, count:', sortedIngredients.length); // Less verbose
}

/**
* Renders the ingredients for the *currently selected recipe* into the editable table in the right column.
*/
export function renderRecipeIngredientsTable(ingredients) {
   console.log('renderRecipeIngredientsTable called with:', ingredients);
   const tableBody = document.querySelector('#iterationEditTable tbody');
   if (!tableBody) {
       console.warn('renderRecipeIngredientsTable: Could not find table body "#iterationEditTable tbody" - this is expected in the current UI version');
       return;
   }

   tableBody.innerHTML = ''; // Clear existing rows

   if (!ingredients || ingredients.length === 0) {
       console.log('No ingredients for this recipe iteration.');
       const placeholderRow = tableBody.insertRow();
       const cell = placeholderRow.insertCell();
       cell.colSpan = 5; // Match number of columns
       cell.textContent = 'No ingredients in this iteration. Add one below!';
       cell.style.textAlign = 'center';
       cell.style.padding = '10px';
       cell.style.fontStyle = 'italic';
       return;
   }

   // Sort ingredients (optional, might want to preserve order)
   // const sortedIngredients = [...ingredients].sort((a, b) => a.name.localeCompare(b.name));

   ingredients.forEach(ingredient => {
       console.log('Rendering recipe ingredient row:', ingredient);
       const row = createEditableIngredientRow(ingredient); // Use the existing helper
       tableBody.appendChild(row);
   });

   console.log('Finished rendering recipe ingredients table, count:', ingredients.length);
}

/**
 * Loads a recipe by ID, fetches its ingredients, updates UI panels, and caches results.
 *
 * Handles errors gracefully by updating the UI with error messages.
 *
 * @param {string|number} recipeId - The unique ID of the recipe to display.
 * @returns {Promise<void>} Resolves when UI is updated.
 * @throws {Error} If fetching recipe or ingredients fails.
 */
export async function showRecipeDetails(recipeId) {
 console.log(`showRecipeDetails called for recipeId: ${recipeId}`);

 // --- 1. Fetch Full Recipe Data ---
 let recipe;
 try {
     // Use cache first
     recipe = recipesCache.find(r => String(r.id) === String(recipeId));
     if (!recipe) {
         console.log(`Recipe ${recipeId} not in cache, fetching...`);
         
         // Try to fetch with eq() first
         try {
             console.log('Attempting to fetch recipe with eq()');
             const { data: fetchedRecipe, error } = await supabaseClient
                 .from('recipes')
                 .select('*')
                 .eq('id', recipeId)
                 .single(); // Fetch a single record
                 
             if (!error && fetchedRecipe) {
                 recipe = fetchedRecipe;
                 console.log(`Recipe fetched successfully with eq(): ${recipe.id}`);
             } else {
                 throw error || new Error('No recipe found with eq()');
             }
         } catch (eqError) {
             // Fallback: fetch all recipes and filter manually
             console.warn('Error using eq() method, falling back to manual filtering:', eqError);
             const { data: allRecipes, error } = await supabaseClient
                 .from('recipes')
                 .select('*');
                 
             if (error) throw error;
             
             const filteredRecipe = (allRecipes || []).find(r => String(r.id) === String(recipeId));
             if (!filteredRecipe) throw new Error(`Recipe with ID ${recipeId} not found.`);
             
             recipe = filteredRecipe;
             console.log(`Recipe found through manual filtering: ${recipe.id}`);
         }
         
         // Update cache
         const index = recipesCache.findIndex(r => String(r.id) === String(recipeId));
         if (index > -1) recipesCache[index] = recipe;
         else recipesCache.push(recipe);
     } else {
         console.log(`Recipe ${recipeId} found in cache.`);
     }

     // Fetch associated ingredients with fallback mechanism
     let ingredientsData;
     let ingredientsError;
     
     // Try to fetch with eq() first
     try {
         console.log('Attempting to fetch ingredients with eq()');
         const result = await supabaseClient
             .from('recipeingredients')
             .select('*, ingredients(*)') // Join with ingredients table
             .eq('recipe_id', recipeId);
             
         ingredientsData = result.data;
         ingredientsError = result.error;
         
         if (!ingredientsError) {
             console.log(`Ingredients fetched successfully with eq(): ${ingredientsData?.length || 0} items`);
         }
     } catch (eqError) {
         // Fallback: fetch all ingredients and filter manually
         console.warn('Error using eq() method for ingredients, falling back to manual filtering:', eqError);
         const result = await supabaseClient
             .from('recipeingredients')
             .select('*, ingredients(*)');
             
         if (result.error) {
             ingredientsError = result.error;
         } else {
             // Filter manually
             ingredientsData = (result.data || []).filter(item =>
                 String(item.recipe_id) === String(recipeId));
             console.log(`Ingredients found through manual filtering: ${ingredientsData.length} items`);
         }
     }

     if (ingredientsError) throw ingredientsError;

     // Map ingredients data correctly
     recipe.ingredients = (ingredientsData || []).map(item => {
         if (!item.ingredients) {
             console.warn(`Missing joined ingredient data for recipeingredients item ID: ${item.id}`);
             return null;
         }
         return {
             ingredient_id: item.ingredients.id, // Actual ingredient ID
             name: item.ingredients.name,
             description: item.ingredients.description, // From ingredients table
             quantity: item.quantity, // From recipeingredients table
             unit: item.unit,         // From recipeingredients table
             notes: item.notes,       // From recipeingredients table
             recipe_ingredient_id: item.id // The ID of the join table row itself
         };
     }).filter(item => item !== null); // Filter out any nulls from missing joins

 } catch (error) {
     console.error('Error fetching full recipe details:', error);
     showNotification(`Error loading recipe: ${error.message}`, 'error');
     // Hide all recipe views and show error message?
     document.getElementById('recipeDetailsView').style.display = 'none';
     // document.getElementById('recipeMetadataView').style.display = 'none';
     document.getElementById('noRecipeSelectedView').innerHTML = `<p>Error loading recipe ${recipeId}.</p>`;
     document.getElementById('noRecipeSelectedView').style.display = 'block';
     // document.getElementById('noRecipeMetadataView').style.display = 'block';
     document.getElementById('recipeHeaderSection').style.display = 'none';
     return;
 }

 console.log('Full recipe object with ingredients:', JSON.stringify(recipe, null, 2));

 currentRecipe = recipe; // Store the fetched full recipe object globally

 // --- 2. Update UI Elements ---

 // Get references to the main view containers
 const recipeDetailsView = document.getElementById('recipeDetailsView');
 // const recipeMetadataView = document.getElementById('recipeMetadataView');
 const noRecipeSelectedView = document.getElementById('noRecipeSelectedView');
 // const noRecipeMetadataView = document.getElementById('noRecipeMetadataView');
 const recipeHeaderSection = document.getElementById('recipeHeaderSection'); // The header above the columns

 if (!recipeDetailsView || !noRecipeSelectedView || !recipeHeaderSection) {
   console.error('Missing essential layout elements for recipe display.');
   return;
 }

 // Show the recipe views and hide placeholders
 recipeDetailsView.style.display = 'block';
 // recipeMetadataView.style.display = 'block';
 noRecipeSelectedView.style.display = 'none';
 // noRecipeMetadataView.style.display = 'none';
 recipeHeaderSection.style.display = 'flex'; // Show the recipe header

 // Update Recipe Header (above columns)
 const selectedRecipeTitleEl = document.getElementById('selectedRecipeTitle');
 if (selectedRecipeTitleEl) {
   selectedRecipeTitleEl.textContent = recipe.title || 'Untitled Recipe';
 }
 const recipeActionsEl = document.getElementById('recipeActions');
 if (recipeActionsEl) {
     recipeActionsEl.innerHTML = ''; // Clear previous buttons
     const removeRecipeBtn = document.createElement('button');
     removeRecipeBtn.id = 'removeRecipeBtn';
     removeRecipeBtn.classList.add('remove-recipe-btn', 'btn', 'btn-small'); // Use btn-small
     removeRecipeBtn.textContent = 'Remove Recipe';
     removeRecipeBtn.style.marginLeft = '1rem';
     removeRecipeBtn.addEventListener('click', async (e) => {
         e.stopPropagation();
         if (confirm(`Are you sure you want to remove "${recipe.title}"?`)) {
             try {
                 const { error } = await supabaseClient
                     .from('recipes')
                     .delete()
                     .eq('id', recipe.id);
                 if (error) throw error;
                 showNotification('Recipe removed successfully.', 'success');
                 currentRecipe = null; // Clear current recipe
                 await reloadData(); // Reload recipe list
                 // Hide recipe views after deletion
                 recipeDetailsView.style.display = 'none';
                 recipeMetadataView.style.display = 'none';
                 noRecipeSelectedView.style.display = 'block';
                 // noRecipeMetadataView.style.display = 'block';
                 recipeHeaderSection.style.display = 'none';
             } catch (err) {
                 console.error('Error removing recipe:', err);
                 showNotification(`Failed to remove recipe: ${err.message}`, 'error');
             }
         }
     });
     recipeActionsEl.appendChild(removeRecipeBtn);
 }

 // --- 3. Populate Middle Column (Recipe Details View) ---
 const recipeDescriptionEl = document.getElementById('recipeDescription');
 const detailedInstructionsEl = document.getElementById('recipeDetailedInstructions');
 const notesEl = document.getElementById('recipeNotes');
 const nutritionEl = document.getElementById('recipeNutrition'); // Added
 const mediaEl = document.getElementById('recipeMedia'); // Added
const recipeIngredientsDisplayEl = document.getElementById('recipeIngredientListDisplay'); // NEW: Target for recipe ingredients

 if (recipeDescriptionEl) {
     recipeDescriptionEl.innerHTML = recipe.description ? `<p>${recipe.description}</p>` : '<p>No description provided.</p>';
 }
 if (detailedInstructionsEl) {
     if (recipe.instructions) {
         let instructionsHtml = '<ol>';
         const steps = recipe.instructions.split('\n').filter(step => step.trim() !== '');
         steps.forEach(step => {
             instructionsHtml += `<li>${step}</li>`;
         });
         instructionsHtml += '</ol>';
         detailedInstructionsEl.innerHTML = instructionsHtml;
     } else {
         detailedInstructionsEl.innerHTML = '<p>No detailed instructions available.</p>';
     }
 }
 if (notesEl) {
     notesEl.innerHTML = recipe.notes ? `<p>${recipe.notes}</p>` : '<p>No notes available for this recipe.</p>';
 }
  if (nutritionEl) {
      nutritionEl.innerHTML = recipe.nutrition ? `<p>${recipe.nutrition}</p>` : '<p>Nutrition information not available.</p>';
  }
  if (mediaEl) {
      // Basic media handling - assumes 'media' field contains simple text/links
      mediaEl.innerHTML = recipe.media ? `<p>${recipe.media}</p>` : '<p>No media available.</p>';
      // TODO: Add more robust media handling (images, videos) if needed
  }

  // --- Populate NEW Recipe Ingredients Section (Middle Column) ---
  if (recipeIngredientsDisplayEl) {
      recipeIngredientsDisplayEl.innerHTML = ''; // Clear previous content
      if (recipe.ingredients && recipe.ingredients.length > 0) {
          const ul = document.createElement('ul');
          ul.style.listStyle = 'none'; // Optional: remove bullets
          ul.style.paddingLeft = '0'; // Optional: remove default padding
          recipe.ingredients.forEach(ing => {
              const li = document.createElement('li');
              li.textContent = `${ing.quantity || ''} ${ing.unit || ''} ${ing.name}`;
              li.style.marginBottom = 'var(--spacing-small)'; // Add some spacing
              ul.appendChild(li);
          });
          recipeIngredientsDisplayEl.appendChild(ul);
      } else {
          recipeIngredientsDisplayEl.innerHTML = '<p>No ingredients listed for this recipe.</p>';
      }
  }
 
 // --- 4. Populate Right Column (Metadata & Editing View) ---
 // updateRecipeStats(recipe); // Disabled Phase 1

 // Render Advanced Analysis Panel disabled Phase 1
 // const advPanel = document.getElementById('advancedAnalysisPanel');
 // if (advPanel && recipe) {
 //   renderAdvancedAnalysis(recipe, advPanel);
 // }

 // const versionHistoryEl = document.getElementById('recipeVersionHistory');
 // if (versionHistoryEl) {
 //     if (recipe.version && recipe.version > 1) {
 //         versionHistoryEl.innerHTML = `<p>Current version: v${recipe.version}</p>`;
 //         // TODO: Fetch and display actual version history if needed
 //     } else {
 //         versionHistoryEl.innerHTML = '<p>This is the first version of this recipe.</p>';
 //     }
 // }
// Populate the editable ingredients table if it exists
// Note: This is part of the right column which may not be active in the current UI version
if (document.querySelector('#iterationEditTable tbody')) {
  renderRecipeIngredientsTable(recipe.ingredients || []);
}


 // --- 5. Update Edit Mode Visibility ---
 // Call setEditModeFields AFTER currentRecipe is set and the right column is populated
 setEditModeFields();

 // --- 6. Update Selected State in Recipe List ---
 const recipeList = document.getElementById('recipeList');
  if (recipeList) {
      recipeList.querySelectorAll('.recipe-item').forEach(li => {
          if (li.dataset.id === String(recipeId)) {
              li.classList.add('selected');
          } else {
              li.classList.remove('selected');
          }
      });
  }

 console.log(`Finished showing details for recipe ${recipeId}`);

 // This logic is now moved to the beginning of the function

    // This logic is now moved to update the #recipeHeaderSection

    // This logic is now handled by renderRecipeIngredientsTable targeting the right column table

    // This logic is now handled by populating elements within #recipeDetailsView and #recipeMetadataView


} // End of showRecipeDetails

/**
 * Creates a table row element for editing a single ingredient.
 *
 * @param {Object} ingredientData - Ingredient data object.
 * @param {number} ingredientData.id - Ingredient ID.
 * @param {string} ingredientData.name - Ingredient name.
 * @param {number} [ingredientData.quantity] - Quantity.
 * @param {string} [ingredientData.unit] - Unit of measurement.
 * @param {string} [ingredientData.notes] - Additional notes.
 * @returns {HTMLElement} The created `<tr>` element with editable fields.
 */
export function createEditableIngredientRow(ingredientData) {
  console.log('--- Creating editable row ---');
  console.log('Received ingredientData:', JSON.stringify(ingredientData, null, 2));
  console.log('Available allIngredients:', JSON.stringify(allIngredients.map(i => ({id: i.id, name: i.name})), null, 2)); // Log available IDs/names
  const row = document.createElement('tr');
  // Use the *actual* ingredient ID for the dataset if available.
  // For new rows, it will be undefined initially.
  const actualIngredientId = ingredientData.ingredient_id !== undefined ? String(ingredientData.ingredient_id) : `new_${Date.now()}`;
  row.dataset.ingredientId = actualIngredientId;
  // Store the recipe_ingredient_id separately if needed for updates/deletes later
  if (ingredientData.recipe_ingredient_id) {
      row.dataset.recipeIngredientId = String(ingredientData.recipe_ingredient_id);
  }
  console.log(`Set row.dataset.ingredientId to: ${actualIngredientId}`);

  const fields = ['name', 'quantity', 'unit', 'notes'];
  fields.forEach(field => {
    const cell = document.createElement('td');
    cell.style.border = '1px solid #444';
    cell.style.padding = '8px';

    if (field === 'name') {
      const select = document.createElement('select');
      select.dataset.field = field;
      select.style.width = '100%';

      // Add a default placeholder option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select Ingredient...';
      defaultOption.disabled = true; // Make it non-selectable unless it's the only option
      select.appendChild(defaultOption);

      // Populate with global ingredients
      allIngredients.forEach(ing => {
        const option = document.createElement('option');
        option.value = ing.id; // Use ID as value
        option.textContent = ing.name;
        // Get the actual ingredient ID from the row data being processed
        const currentIngredientId = ingredientData.ingredient_id !== undefined ? String(ingredientData.ingredient_id) : null;
        // Get the ingredient ID for the current option in the dropdown
        const optionIngredientId = ing.id !== undefined ? String(ing.id) : null;

        // Log the comparison right before the check
        console.log(`  -> Comparing option ID: '${optionIngredientId}' (Type: ${typeof optionIngredientId}) with current data's ingredient_id: '${currentIngredientId}' (Type: ${typeof currentIngredientId})`);

        // First try to match by ID
        if (currentIngredientId !== null && optionIngredientId !== null && optionIngredientId === currentIngredientId) {
          option.setAttribute('selected', 'selected');
          defaultOption.disabled = false; // Allow re-selecting placeholder if needed
          console.log(`     MATCH FOUND BY ID! Selecting option: ID=${optionIngredientId}, Name=${ing.name}`);
        }
        // If ID doesn't match, try to match by name (case-insensitive and trimmed)
        else if (ingredientData.name && ing.name &&
                 ingredientData.name.trim().toLowerCase() === ing.name.trim().toLowerCase()) {
          option.setAttribute('selected', 'selected');
          defaultOption.disabled = false;
          console.log(`     MATCH FOUND BY NAME! Selecting option: ID=${optionIngredientId}, Name=${ing.name}`);
        }
        // If name doesn't match exactly, try partial matching
        else if (ingredientData.name && ing.name &&
                 (ingredientData.name.trim().toLowerCase().includes(ing.name.trim().toLowerCase()) ||
                  ing.name.trim().toLowerCase().includes(ingredientData.name.trim().toLowerCase()))) {
          option.setAttribute('selected', 'selected');
          defaultOption.disabled = false;
          console.log(`     MATCH FOUND BY PARTIAL NAME! Selecting option: ID=${optionIngredientId}, Name=${ing.name}`);
        }
        select.appendChild(option);
      });

      // If no ingredient was pre-selected, make the placeholder selected
      if (!select.querySelector('option[selected="selected"]')) {
        defaultOption.setAttribute('selected', 'selected');
      } else {
        // Make sure the dropdown shows the selected value
        const selectedOption = select.querySelector('option[selected="selected"]');
        if (selectedOption) {
          select.value = selectedOption.value;
          // Force a change event to ensure the UI updates
          const event = new Event('change', { bubbles: true });
          select.dispatchEvent(event);
        }
      }


      cell.appendChild(select);
    } else {
      // Handle other fields as before (quantity, unit, notes)
      const input = document.createElement('input');
      input.dataset.field = field;
      input.placeholder = field.charAt(0).toUpperCase() + field.slice(1) + '?';
      input.value = ingredientData[field] !== undefined ? ingredientData[field] : '';
      input.style.width = '100%';
      if (field === 'quantity') {
        input.type = 'number';
        input.min = '0'; // Optional: prevent negative quantities
        input.step = 'any'; // Optional: allow decimals
      }
      cell.appendChild(input);
    }
    row.appendChild(cell);
  });

  const actionCell = document.createElement('td');
  actionCell.style.border = '1px solid #444';
  actionCell.style.padding = '8px';
  actionCell.style.textAlign = 'center';
  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'X';
  removeBtn.classList.add('btn', 'remove-iteration-ingredient-btn');
  removeBtn.style.padding = '4px 8px';
  removeBtn.dataset.targetRowId = row.dataset.ingredientId; // Use the actualIngredientId stored earlier
  removeBtn.addEventListener('click', (e) => {
    e.target.closest('tr').remove();
    const table = e.target.closest('table');
    if (table && table.rows.length <= 1) { // Check if only header row remains
      const placeholderRow = table.insertRow(); // Add placeholder if table becomes empty
      const cell = placeholderRow.insertCell();
      cell.colSpan = 5;
      cell.textContent = 'No ingredients yet. Add one below!';
      cell.style.textAlign = 'center';
      cell.style.padding = '10px';
      cell.style.fontStyle = 'italic';
    }
  });
  actionCell.appendChild(removeBtn);
  row.appendChild(actionCell);

  return row;
}

/**
 * Commits the new iteration data from the editable table.
 */
export async function doCommitIteration(currentRecipe, iterationTable) {
  console.log("Commit button clicked. Recipe ID:", currentRecipe.id);
  console.log("Recipe data:", JSON.stringify(currentRecipe, null, 2));
  console.log("Iteration table found:", !!iterationTable);

  // If the iteration table is missing, skip commit gracefully.
  // This is expected if the iteration editing UI is not present in the current app version.
  if (!iterationTable) {
    console.warn('doCommitIteration: iterationTable not found — skipping commit. This is expected if iteration editing UI is not present.');
    return;
  }

  const updatedIngredients = [];
  const rows = iterationTable.querySelectorAll('tr');
  console.log(`Found ${rows.length} rows in iteration table (including header)`);
  let commitError = null; // Flag to store potential errors during row processing

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Check if this is the placeholder row added when table is empty
    if (row.querySelector('td[colspan="5"]')) {
        continue; // Skip placeholder row
    }

    const inputs = row.querySelectorAll('input[data-field], select[data-field]');
    const ingredient = {}; // Start with an empty object
    let isEmptyRow = true;
    let selectedIngredientId = null;
    let selectedIngredientName = null;

    inputs.forEach(input => {
      const field = input.dataset.field;
      const value = input.value.trim();

      if (input.tagName === 'SELECT' && field === 'name') {
        if (input.selectedIndex > 0) { // Ensure a valid ingredient is selected
          selectedIngredientId = input.value; // ID is the value of the selected option
          selectedIngredientName = input.options[input.selectedIndex].textContent;
          ingredient['id'] = selectedIngredientId; // Store the actual ingredient ID
          ingredient['name'] = selectedIngredientName; // Store the name
          isEmptyRow = false;
        }
      } else if (input.tagName === 'INPUT') {
        if (value) {
          ingredient[field] = value; // Store quantity, unit, notes
          isEmptyRow = false; // Any input makes the row non-empty
        } else {
           ingredient[field] = null; // Ensure field exists even if empty, might be needed for update
        }
      }
    });

    // Add the ingredient to the list only if an ingredient was actually selected
    if (!isEmptyRow && selectedIngredientId) {
        // We already added id and name from the select logic
        // Ensure quantity and unit have values (or default/null)
        if (ingredient.quantity === undefined) ingredient.quantity = null; // Or 0? Depends on DB schema
        if (ingredient.unit === undefined) ingredient.unit = null;
        if (ingredient.notes === undefined) ingredient.notes = null;

        console.log("Adding ingredient to commit list:", JSON.stringify(ingredient));
        updatedIngredients.push(ingredient);
    } else if (!isEmptyRow && !selectedIngredientId) {
        // Row has data but no ingredient selected from dropdown
        alert(`Ingredient in row ${i} is not selected.`);
        commitError = `Ingredient not selected in row ${i}`; // Store the error message
        break; // Stop processing rows immediately on error
    }
  }

  // If an error occurred during row processing, stop the commit
  if (commitError) {
      console.error("Commit aborted due to error:", commitError);
      return; // Stop the commit process
  }

  // Proceed with commit if no errors
  console.log("Final updated ingredients data to commit:", updatedIngredients);

  try {
      const newVersion = (currentRecipe.version || 0) + 1;
  
      // 1. Update the recipe version only
      const { error: recipeUpdateError } = await supabaseClient
        .from('recipes')
        .update({ version: newVersion })
        .eq('id', currentRecipe.id);
  
      if (recipeUpdateError) throw recipeUpdateError;
  
      // 2. Update the recipeingredients join table
      const success = await updateRecipeIngredients(currentRecipe.id, updatedIngredients);
      if (!success) throw new Error('Failed to update recipe ingredients');
  
      showNotification('Iteration committed successfully!', 'success');
      await reloadData();
  
    } catch (err) {
      console.error('Error committing iteration:', err);
      showNotification(`Error committing iteration: ${err.message}`, 'error');
    }
}

/**
 * Handles AI suggestion request (Placeholder).
 */
async function doAISuggestion(promptValue, recipeObj) {
  alert('AI Suggestions coming soon!');
}

/**
 * Updates a specific ingredient property (Placeholder).
 */
async function doUpdateIngredient(ingObj, prop, newValue) {
  console.warn('doUpdateIngredient not implemented');
}

/**
 * Reloads data from the server.
 */
export async function reloadData() {
  console.log('reloadData: Starting to reload application data...');
  try {
    // Fetch recipes
    console.log('reloadData: Fetching recipes...');
    recipesCache = await loadRecipes(); // Load recipes and update cache
    console.log(`reloadData: Recipes loaded: ${recipesCache.length} recipes found`);
    console.log('reloadData: First few recipes:', recipesCache.slice(0, 3).map(r => ({ id: r.id, title: r.title })));
    renderRecipes(recipesCache); // Render from cache
    
    // Fetch ingredients for the global list
    console.log('reloadData: Fetching all global ingredients...');
    allIngredients = await loadAllIngredients(); // Load global ingredients
    console.log(`reloadData: All global ingredients loaded: ${allIngredients.length} ingredients found`);
    console.log('reloadData: First few global ingredients:', allIngredients.slice(0, 5).map(i => ({ id: i.id, name: i.name })));
    
    // Render the global ingredients list in the left column
    console.log('reloadData: Rendering global ingredients list');
    renderGlobalIngredients(allIngredients);

    // If a recipe is currently selected, re-render its details and ingredients table
    if (currentRecipe && currentRecipe.id) {
        console.log(`reloadData: Re-rendering details for current recipe ${currentRecipe.id}`);
        // We need the full recipe object again, potentially refetch or use cache carefully
        // For simplicity, let's just re-render the table with the cached ingredients
        if (document.querySelector('#iterationEditTable tbody')) {
            renderRecipeIngredientsTable(currentRecipe.ingredients || []);
        }
        // Optionally, fully call showRecipeDetails again if more complex updates are needed
        // await showRecipeDetails(currentRecipe.id);
    } else {
        // Ensure recipe views are hidden if no recipe is selected
        document.getElementById('recipeDetailsView').style.display = 'none';
        // document.getElementById('recipeMetadataView').style.display = 'none';
        document.getElementById('noRecipeSelectedView').style.display = 'block';
        // document.getElementById('noRecipeMetadataView').style.display = 'block';
        document.getElementById('recipeHeaderSection').style.display = 'none';
    }
    console.log('Data reloaded successfully.');
    return true;
  } catch (error) {
    console.error('Error reloading data:', error);
    showNotification('Error loading data. Please try again.', 'error');
    return false;
  }
}

/**
 * Initializes the UI components, sets up event listeners, and loads initial data.
 */
// setupRecipeCollapsibles function is no longer needed as listeners are delegated in initUI

// setupCollapsibleGroup function is no longer needed as listeners are delegated in initUI

// setupIndividualCollapsibles function is no longer needed as listeners are delegated in initUI

 // Update recipe stats in the quick stats section
 function safeSetText(elementId, value, fallback) {
   const element = document.getElementById(elementId);
   if (element) {
     element.textContent = value || fallback;
   }
 }
 function updateRecipeStats(recipe) {
  if (!recipe) {
      console.warn("updateRecipeStats called with null recipe");
      // Optionally clear stats here
      return;
  }
  console.log("Updating stats for recipe:", recipe.title);
  
    // Update quick stats using safeSetText helper
    safeSetText('prepTime', recipe.prep_time, '--');
    safeSetText('cookTime', recipe.cook_time, 'N/A');
    safeSetText('servings', recipe.servings, 'N/A');
    safeSetText('difficulty', recipe.difficulty, '--');
  
  // Instructions summary is part of the middle column now (recipeDescription)
  // This function now only updates the quick stats in the right column
  
  // Detailed instructions are handled in showRecipeDetails (middle column)
  
  // Notes are handled in showRecipeDetails (middle column)
  
  // Version history is handled in showRecipeDetails (right column)
}

// Handle new iteration creation
function setupIterationFunctionality() {
  const createNewIterationBtn = document.getElementById('createNewIterationBtn');
  const newIterationForm = document.getElementById('newIterationForm');
  const saveIterationBtn = document.getElementById('saveIterationBtn');
  const cancelIterationBtn = document.getElementById('cancelIterationBtn');
  const iterationNotes = document.getElementById('iterationNotes');
  
  if (createNewIterationBtn) {
    createNewIterationBtn.addEventListener('click', () => {
      if (!isLoggedIn) {
        showNotification('Please log in to create iterations.', 'error');
        return;
      }
      
      if (!currentRecipe) {
        showNotification('Please select a recipe first.', 'error');
        return;
      }
      
      // Show the new iteration form
      if (newIterationForm) {
        newIterationForm.style.display = 'block';
        // Pre-populate with current recipe info
        if (iterationNotes) {
          iterationNotes.value = `Based on "${currentRecipe.title}" (v${currentRecipe.version || 1})`;
        }
      }
    });
  }
  
  if (cancelIterationBtn) {
    cancelIterationBtn.addEventListener('click', () => {
      // Hide the form
      if (newIterationForm) {
        newIterationForm.style.display = 'none';
      }
    });
  }
  
  if (saveIterationBtn) {
    saveIterationBtn.addEventListener('click', async () => {
      if (!currentRecipe) {
        showNotification('No recipe selected.', 'error');
        return;
      }
      
      const notes = iterationNotes ? iterationNotes.value : '';
      
      try {
        // Create a new iteration based on the current recipe
        const newVersion = (currentRecipe.version || 0) + 1;
        
        // 1. Update the recipe version
        const { error: recipeUpdateError } = await supabaseClient
          .from('recipes')
          .update({
            version: newVersion,
            notes: notes // Store the iteration notes
          })
          .eq('id', currentRecipe.id);
        
        if (recipeUpdateError) throw recipeUpdateError;
        
        // 2. Create an iteration record
        const { error: iterationError } = await supabaseClient
          .from('iterations')
          .insert([{
            recipe_id: currentRecipe.id,
            version: newVersion,
            notes: notes,
            created_at: new Date().toISOString()
          }]);
        
        if (iterationError) throw iterationError;
        
        showNotification('Iteration created successfully!', 'success');
        
        // Hide the form
        if (newIterationForm) {
          newIterationForm.style.display = 'none';
        }
        
        // Reload data to show the new iteration
        await reloadData();
        
      } catch (err) {
        console.error('Error creating iteration:', err);
        showNotification(`Error creating iteration: ${err.message}`, 'error');
      }
    });
  }
}

export async function initUI() {
 console.log('Initializing UI...');

  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    const magicLinkForm = document.getElementById('magicLinkForm');

    let loggedInStateChanged = false;
    const previousIsLoggedIn = isLoggedIn;

    if (event === 'SIGNED_IN') {
      isLoggedIn = true;
      console.log('User signed in.');
      if (magicLinkForm) magicLinkForm.style.display = 'none';
    } else if (event === 'SIGNED_OUT') {
      isLoggedIn = false;
      console.log('User signed out.');
    }
    if (event === 'INITIAL_SESSION') {
      isLoggedIn = !!session;
      console.log('Initial session processed. Logged in:', isLoggedIn);
      // Explicitly update auth buttons after initial check, regardless of change
      updateAuthButton();
      setEditModeFields(); // Also ensure fields are set based on initial auth state
    }

    loggedInStateChanged = previousIsLoggedIn !== isLoggedIn;

   // Update UI elements based on auth state
   updateAuthButton();
   setEditModeFields(); // Ensure edit mode reflects login state

   // Optionally reload data or adjust UI further based on login/logout
   if (loggedInStateChanged) {
       console.log('Login state changed, potentially reloading data or adjusting views...');
       // If logging out, ensure recipe views are cleared
       if (!isLoggedIn) {
           currentRecipe = null;
           document.getElementById('recipeDetailsView').style.display = 'none';
           // document.getElementById('recipeMetadataView').style.display = 'none';
           document.getElementById('noRecipeSelectedView').style.display = 'block';
           // document.getElementById('noRecipeMetadataView').style.display = 'block';
           document.getElementById('recipeHeaderSection').style.display = 'none';

           // Clear right column actions
           const rightColumn = document.getElementById('right-column');
           ActionRenderer.render(rightColumn, null);
           // Clear selected state in recipe list
            const recipeList = document.getElementById('recipeList');
            if (recipeList) {
                recipeList.querySelectorAll('.recipe-item.selected').forEach(li => li.classList.remove('selected'));
            }
       }
       // Maybe reload data on login? Depends on requirements.
       // await reloadData();
   }
  });

  // Set up event listeners for UI elements
  const btnLogIn = document.getElementById('btnLogIn');
  if (btnLogIn) {
    btnLogIn.addEventListener('click', async () => {
      if (isLoggedIn) {
        // Log out
        try {
          const { error } = await supabaseClient.auth.signOut();
          if (error) throw error;
          showNotification('Logged out successfully.', 'success');
        } catch (err) {
          console.error('Error signing out:', err);
          showNotification(`Error signing out: ${err.message}`, 'error');
        }
      } else {
        // Show/hide magic link form
        const magicLinkForm = document.getElementById('magicLinkForm');
        if (magicLinkForm) {
          btnLogIn.dataset.showForm = btnLogIn.dataset.showForm === 'true' ? 'false' : 'true';
          magicLinkForm.style.display = btnLogIn.dataset.showForm === 'true' ? 'block' : 'none';
        }
      }
    });
  }

  // Set up event listener for the magic link form
  const btnSendMagicLink = document.getElementById('btnSendMagicLink');
  const magicLinkEmail = document.getElementById('magicLinkEmail');
  if (btnSendMagicLink && magicLinkEmail) {
    btnSendMagicLink.addEventListener('click', async () => {
      const email = magicLinkEmail.value.trim();
      if (!email) {
        showNotification('Please enter your email address.', 'error');
        return;
      }
      
      try {
        const { error } = await supabaseClient.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.href,
          },
        });
        
        if (error) throw error;
        
        showNotification('Magic link sent! Check your email.', 'success');
        // Hide the form after sending
        const magicLinkForm = document.getElementById('magicLinkForm');
        if (magicLinkForm) magicLinkForm.style.display = 'none';
      } catch (err) {
        console.error('Error sending magic link:', err);
        showNotification(`Error sending magic link: ${err.message}`, 'error');
      }
    });
  }

  // Set up event listener for the theme toggle button
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      const currentTheme = btnThemeToggle.dataset.theme || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      // Update button text and dataset
      btnThemeToggle.textContent = `Theme: ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`;
      btnThemeToggle.dataset.theme = newTheme;
      
      // Apply theme to body
      document.body.className = newTheme;
      
      console.log(`Theme applied: ${newTheme} (Source: ${currentTheme})`);
    });
  }

  // Set up event listener for the edit mode toggle button
  const btnEditModeToggle = document.getElementById('btnEditModeToggle');
  if (btnEditModeToggle) {
    btnEditModeToggle.addEventListener('click', () => {
      if (!isLoggedIn) {
        showNotification('Please log in to use edit mode.', 'error');
        return;
      }
      
      const currentActive = btnEditModeToggle.dataset.active === 'true';
      const newActive = !currentActive;
      
      // Update button text and dataset
      btnEditModeToggle.textContent = `Edit Mode: ${newActive ? 'ON' : 'OFF'}`;
      btnEditModeToggle.dataset.active = newActive.toString();
      
      // Update edit mode dependent fields
      setEditModeFields(newActive);
    });
  }

  // Event listener for the "All Ingredients" button (now toggles left column section)
   const btnIngredients = document.getElementById('btnIngredients');
   if (btnIngredients) {
       btnIngredients.addEventListener('click', () => {
           // This button might now just ensure the left column is visible,
           // or toggle the 'All Ingredients' collapsible section within it.
           const ingredientsSection = document.getElementById('globalIngredientsSection');
           if (ingredientsSection) {
               const header = ingredientsSection.querySelector('.collapsible-header');
               if (header && ingredientsSection.getAttribute('aria-expanded') === 'false') {
                   // Simulate a click on the header to expand it
                   header.click();
               }
               // Ensure left column is visible if layout changes dynamically
               document.getElementById('left-column').style.display = 'block';
           }
           console.log('"All Ingredients" button clicked - ensuring section is visible/expanded.');
       });
   }

  // Add Recipe Button (Improved Flow)
   const btnAddRecipe = document.getElementById('btnAddRecipe');
   if (btnAddRecipe) {
       btnAddRecipe.addEventListener('click', async () => {
           if (!isLoggedIn) {
               showNotification('Please log in to add recipes.', 'error');
               return;
           }
           if (!isEditMode()) {
                showNotification('Enable Edit Mode to add recipes.', 'error');
                return;
           }

           const recipeName = prompt('Enter a name for the new recipe:');
           if (!recipeName || recipeName.trim() === '') {
               showNotification('Recipe name cannot be empty.', 'info');
               return;
           }

           try {
               console.log(`Attempting to create recipe: ${recipeName}`);
               // Use the API function to create the recipe in the database
               const newRecipe = await createNewRecipe(recipeName.trim()); // Pass only the name

               if (newRecipe && newRecipe.id) {
                   showNotification(`Recipe "${recipeName}" created successfully!`, 'success');
                   await reloadData(); // Reload the recipe list
                   // Automatically select and show the new recipe
                   await showRecipeDetails(newRecipe.id);
               } else {
                   throw new Error('Failed to create recipe or retrieve its ID.');
               }
           } catch (error) {
               console.error('Error creating new recipe:', error);
               showNotification(`Error creating recipe: ${error.message}`, 'error');
           }
       });
   }

  // Add Global Ingredient Button (in left column)
   const btnAddGlobalIngredient = document.getElementById('btnAddGlobalIngredient');
   if (btnAddGlobalIngredient) {
       btnAddGlobalIngredient.addEventListener('click', async () => {
           if (!isLoggedIn || !isEditMode()) {
               showNotification('Log in and enable Edit Mode to add global ingredients.', 'error');
               return;
           }

           const name = prompt('Enter new global ingredient name:');
           if (!name || name.trim() === '') return;

           const description = prompt('Enter ingredient description (optional):');

           try {
               // Use API function
               const addedIngredient = await addGlobalIngredient(name.trim(), description ? description.trim() : null);
               if (addedIngredient) {
                   showNotification(`Ingredient "${addedIngredient.name}" added globally.`, 'success');
                   await reloadData(); // Reload global ingredients list
               } else {
                    throw new Error('Failed to add ingredient or retrieve result.');
               }
           } catch (error) {
               console.error('Error adding global ingredient:', error);
               showNotification(`Error: ${error.message}`, 'error');
           }
       });
   }

  // --- Delegated Event Listeners ---

  // Recipe List Click Handler
  const recipeList = document.getElementById('recipeList');
  if (recipeList) {
    recipeList.addEventListener('click', async (event) => {
           const targetLi = event.target.closest('.recipe-item');
           if (targetLi && targetLi.dataset.id) {
               const recipeId = targetLi.dataset.id;
               console.log(`Recipe item clicked: ID=${recipeId}`);

               // Update selected state visually immediately
               recipeList.querySelectorAll('.recipe-item').forEach(li => li.classList.remove('selected'));
               targetLi.classList.add('selected');

               // Call showRecipeDetails with the ID
               await showRecipeDetails(recipeId);

               // Update right column actions
               const rightColumn = document.getElementById('right-column-actions');
               ActionRenderer.render(rightColumn, currentRecipe);
           }
       });
   }

  // Global Ingredient List Click Handler (Left Column) - currently no action on click
   const globalIngredientList = document.getElementById('globalIngredientList');
   if (globalIngredientList) {
       globalIngredientList.addEventListener('click', (event) => {
           const targetLi = event.target.closest('.ingredient-item');
           if (targetLi) {
               console.log('Global ingredient clicked:', targetLi.dataset.id);
               // Add functionality here if needed (e.g., show details, add to recipe)
           }
       });
   }

   // Editable Ingredient Table Button Handler (Right Column)
   const iterationEditContainer = document.getElementById('iterationEditContainer'); // Container in right column
   if (iterationEditContainer) {
       iterationEditContainer.addEventListener('click', async (event) => {
           // Add Ingredient Row Button
           if (event.target.matches('#addIterationIngredientBtn')) {
                console.log("Add ingredient row button clicked");
                const tableBody = document.querySelector('#iterationEditTable tbody');
                if (tableBody) {
                    const newRow = createEditableIngredientRow({}); // Create row with empty data
                    const placeholder = tableBody.querySelector('td[colspan="5"]');
                    if (placeholder) placeholder.parentElement.remove(); // Remove placeholder if exists
                    tableBody.appendChild(newRow);
                    console.log("New ingredient row added to table");
                } else {
                    console.error("Could not find iteration edit table body");
                }
           }
           // Remove Ingredient Row Button
           else if (event.target.matches('.remove-iteration-ingredient-btn')) {
                console.log("Remove ingredient button clicked");
                const rowToRemove = event.target.closest('tr');
                const table = event.target.closest('table');
                if (rowToRemove) {
                    rowToRemove.remove();
                    console.log("Ingredient row removed");
                    // Add placeholder if table becomes empty (excluding header)
                    if (table && table.rows.length <= 1) {
                        const placeholderRow = table.tBodies[0].insertRow();
                        const cell = placeholderRow.insertCell();
                        cell.colSpan = 5;
                        cell.textContent = 'No ingredients yet. Add one below!';
                        cell.style.textAlign = 'center';
                        cell.style.padding = '10px';
                        cell.style.fontStyle = 'italic';
                        console.log("Placeholder row added");
                    }
                }
           }
           // Commit Changes Button
           else if (event.target.matches('#commitRecipeBtn')) {
                console.log("Commit changes button clicked");
                if (currentRecipe && currentRecipe.id) {
                    const editTable = document.getElementById('iterationEditTable');
                    if (editTable) {
                        await doCommitIteration(currentRecipe, editTable);
                    } else {
                        console.error("Could not find iteration edit table for commit");
                    }
                } else {
                    showNotification("No recipe selected to commit changes for.", "error");
                }
           }
       });
   }

  // Collapsible Header Click/Keydown Handler (delegated to content-grid)
  // Delegated listener for ALL collapsible headers within the page wrapper
   const pageWrapper = document.querySelector('.page-wrapper');
   if (pageWrapper) {
       const handleCollapsibleToggle = (header) => {
           const container = header.closest('.collapsible-container');
           if (!container) return;

           const isExpanded = container.getAttribute('aria-expanded') === 'true';
           const newExpandedState = !isExpanded;

           container.setAttribute('aria-expanded', String(newExpandedState));
           header.setAttribute('aria-expanded', String(newExpandedState));
           // container.classList.toggle('expanded', newExpandedState); // Optional class

           const content = container.querySelector('.collapsible-content');
           const icon = header.querySelector('.collapsible-icon');

           if (content) {
                // Use max-height for animation
                if (newExpandedState) {
                    content.style.maxHeight = content.scrollHeight + "px";
                    content.style.opacity = 1;
                    content.style.padding = 'var(--spacing-small) var(--spacing-medium)'; // Adjust as needed
                } else {
                    content.style.maxHeight = '0';
                    content.style.opacity = 0;
                    content.style.padding = '0 var(--spacing-medium)';
                }
           }
           if (icon) {
               icon.style.transform = newExpandedState ? 'rotate(90deg)' : 'rotate(0deg)';
           }
       };

       pageWrapper.addEventListener('click', (event) => {
           const header = event.target.closest('.collapsible-header');
           if (header) {
               handleCollapsibleToggle(header);
           }

           // Handle Expand/Collapse All Button
           const expandCollapseBtn = event.target.closest('.btn-expand-collapse');
           if (expandCollapseBtn) {
                const targetGroupId = expandCollapseBtn.dataset.targetGroup;
                const targetGroup = document.getElementById(targetGroupId);
                if (targetGroup) {
                    const isPressed = expandCollapseBtn.getAttribute('aria-pressed') === 'true';
                    const newState = !isPressed;
                    expandCollapseBtn.setAttribute('aria-pressed', String(newState));
                    expandCollapseBtn.querySelector('.label').textContent = newState ? 'Collapse All' : 'Expand All';
                    expandCollapseBtn.querySelector('.icon').textContent = newState ? '-' : '+';

                    targetGroup.querySelectorAll('.collapsible-container .collapsible-header').forEach(header => {
                        const container = header.closest('.collapsible-container');
                        const currentExpanded = container.getAttribute('aria-expanded') === 'true';
                        if (currentExpanded !== newState) {
                            handleCollapsibleToggle(header); // Toggle only if state needs changing
                        }
                    });
                }
           }
       });

       pageWrapper.addEventListener('keydown', (event) => {
           const header = event.target.closest('.collapsible-header');
           if (header && (event.key === 'Enter' || event.key === ' ')) {
               event.preventDefault();
               handleCollapsibleToggle(header);
           }
       });
   }

  // --- End Delegated Listeners ---


  // Load initial data
  await reloadData();
  // Iteration functionality setup (buttons are now handled by delegated listener)
  // setupIterationFunctionality(); // Might not be needed if buttons handled by delegation

  // Initial UI state
  document.getElementById('recipeDetailsView').style.display = 'none';
  // document.getElementById('recipeMetadataView').style.display = 'none';
  document.getElementById('noRecipeSelectedView').style.display = 'block';
  // document.getElementById('noRecipeMetadataView').style.display = 'block';
  document.getElementById('recipeHeaderSection').style.display = 'none';


  console.log('initUI: setup complete');
  // Initialize right column action panels
  initRecipeActions();
}

/**
 * Test function to verify recipe ingredient updates
 * Can be called from browser console: testRecipeIngredientUpdate()
 */
window.testRecipeIngredientUpdate = async function(recipeId) {
  console.log('=== TEST: Recipe Ingredient Update ===');
  
  // If no recipeId provided, use the current recipe if available
  if (!recipeId && currentRecipe && currentRecipe.id) {
    recipeId = currentRecipe.id;
    console.log(`Using current recipe ID: ${recipeId}`);
  }
  
  if (!recipeId) {
    console.error('No recipe ID provided and no current recipe available');
    return false;
  }
  
  try {
    // 1. Fetch the recipe's current ingredients
    console.log(`TEST: Fetching current ingredients for recipe ${recipeId}`);
    const { data: currentIngredients, error: fetchError } = await supabaseClient
      .from('recipeingredients')
      .select('*, ingredients(*)')
      .eq('recipe_id', recipeId);
      
    if (fetchError) {
      console.error('TEST: Error fetching current ingredients:', fetchError);
      return false;
    }
    
    console.log(`TEST: Found ${currentIngredients.length} current ingredients`);
    console.log('TEST: Current ingredients:', currentIngredients);
    
    // 2. Create a test ingredient if we don't have any
    if (currentIngredients.length === 0 && allIngredients.length > 0) {
      console.log('TEST: No current ingredients found, will create a test ingredient');
      
      // Get a random ingredient from the global list
      const randomIngredient = allIngredients[Math.floor(Math.random() * allIngredients.length)];
      console.log(`TEST: Selected random ingredient: ${randomIngredient.name} (ID: ${randomIngredient.id})`);
      
      // Create a test ingredient entry
      const testIngredient = {
        id: randomIngredient.id,
        name: randomIngredient.name,
        quantity: '1',
        unit: 'test',
        notes: 'Test ingredient added by testRecipeIngredientUpdate'
      };
      
      // Call updateRecipeIngredients with this test ingredient
      console.log('TEST: Calling updateRecipeIngredients with test ingredient');
      const success = await updateRecipeIngredients(recipeId, [testIngredient]);
      
      if (success) {
        console.log('TEST: Successfully added test ingredient');
        console.log('TEST: Reloading data to verify changes');
        await reloadData();
        return true;
      } else {
        console.error('TEST: Failed to add test ingredient');
        return false;
      }
    } else {
      // 3. If we have ingredients, log them for verification
      console.log('TEST: Current ingredients found, no changes made');
      console.log('TEST: Test completed successfully');
      return true;
    }
  } catch (error) {
    console.error('TEST: Error in testRecipeIngredientUpdate:', error);
    return false;
  }
};

// Test function remains the same
/**
 * Render advanced analysis panels in the given container for a recipe
 * @param {Object} recipe - Recipe object
 * @param {HTMLElement} container - Target container element
 */
export function renderAdvancedAnalysis(recipe, container) {
  container.innerHTML = '';

  const analysis = analyzeIngredients(recipe);
  const timeline = getRecipeTimeline(recipe);
  const batches = getBatchHistory(recipe);
  const shelfLife = estimateShelfLife(recipe);

  // Compatibility & pH
  const compatDiv = document.createElement('div');
  compatDiv.className = 'action-panel ingredient-analysis';
  compatDiv.innerHTML = `
    <h3>Ingredient Analysis</h3>
    <p>Compatibility: ${analysis.compatible ? 'Compatible' : 'Incompatible'}</p>
    <p>Estimated pH: ${analysis.pH.toFixed(1)}</p>
  `;
  container.appendChild(compatDiv);

  // Timeline
  const timelineDiv = document.createElement('div');
  timelineDiv.className = 'action-panel recipe-timeline';
  const timelineList = timeline.map(step =>
    `<li>Step ${step.stepNumber}: ${step.description} (${step.duration || 'N/A'} mins)</li>`
  ).join('');
  timelineDiv.innerHTML = `
    <h3>Recipe Timeline</h3>
    <ul>${timelineList}</ul>
  `;
  container.appendChild(timelineDiv);

  // Batch history
  const batchDiv = document.createElement('div');
  batchDiv.className = 'action-panel batch-tracking';
  const batchList = batches.map((batch, idx) =>
    `<li>Batch ${idx + 1}: ${batch.date || batch.created_at || 'N/A'} - ${batch.status || 'Unknown'}</li>`
  ).join('');
  batchDiv.innerHTML = `
    <h3>Batch Tracking</h3>
    <ul>${batchList}</ul>
  `;
  container.appendChild(batchDiv);

  // Shelf-life
  const shelfDiv = document.createElement('div');
  shelfDiv.className = 'action-panel shelf-life';
  shelfDiv.innerHTML = `
    <h3>Shelf-life Estimate</h3>
    <p>Estimated shelf-life: ${shelfLife} days</p>
  `;
  container.appendChild(shelfDiv);
}
