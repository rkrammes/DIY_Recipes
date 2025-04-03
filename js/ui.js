// Import the Supabase client
import { supabaseClient } from './supabaseClient.js';
import { fetchRecipes, fetchIngredients } from './api.js';

// Global variables
let isLoggedIn = false;
let allIngredients = []; // Global array to store all ingredients
let currentRecipe = null; // Track the currently displayed recipe

/**
 * Sets the edit mode fields based on login state.
 */
function setEditModeFields(active = null) {
  console.log('Setting edit mode fields. Active:', active);
  const editModeBtn = document.getElementById('btnEditModeToggle');
  const addRecipeBtn = document.getElementById('btnAddRecipe');
  const addGlobalIngredientBtn = document.getElementById('btnAddGlobalIngredient');

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

  // Update any other edit-mode dependent elements
  const editElements = document.querySelectorAll('.edit-mode-element');
  editElements.forEach(el => {
    el.style.display = (active && isLoggedIn) ? 'block' : 'none';
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
    
    // Add click event to show recipe details
    li.addEventListener('click', () => {
      // Hide ingredients view if visible
      const ingredientsView = document.getElementById('ingredientsView');
      if (ingredientsView) ingredientsView.style.display = 'none';
      
      // Show recipe details
      const recipeDetails = document.getElementById('recipeDetails');
      if (recipeDetails) {
        recipeDetails.style.display = 'block';
        recipeDetails.innerHTML = ''; // Clear previous content
        showRecipeDetails(recipe);
      }
    });
    
    recipeList.appendChild(li);
  });
}

/**
 * Renders the ingredients list in the UI.
 */
export function renderIngredients(ingredients) {
  const ingredientList = document.getElementById('ingredientList');
  if (!ingredientList) return;

  // Clear existing list
  ingredientList.innerHTML = '';

  // Sort ingredients by name
  const sortedIngredients = [...ingredients].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  // Create list items
  sortedIngredients.forEach(ingredient => {
    const li = document.createElement('li');
    li.classList.add('ingredient-item');
    li.dataset.id = ingredient.id;
    
    // Create a container for the ingredient content
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('ingredient-content');
    
    // Add ingredient name
    const nameDiv = document.createElement('div');
    nameDiv.classList.add('ingredient-name');
    nameDiv.textContent = ingredient.name;
    contentDiv.appendChild(nameDiv);
    
    // Add ingredient description if available
    if (ingredient.description) {
      const descDiv = document.createElement('div');
      descDiv.classList.add('ingredient-description');
      descDiv.textContent = ingredient.description;
      contentDiv.appendChild(descDiv);
    }
    
    li.appendChild(contentDiv);
    ingredientList.appendChild(li);
  });
}

/**
 * Shows the details of a recipe.
 */
export function showRecipeDetails(recipe) {
  console.log('Showing recipe details for:', recipe);
  console.log('Recipe object before showing details:', JSON.stringify(recipe, null, 2));
  
  currentRecipe = recipe; // Store the current recipe
  
  const details = document.getElementById('recipeDetails');
  if (!details) return;
  
  // Create a flex container for the three columns
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.gap = 'var(--spacing-medium)';
  container.style.height = '100%';
  
  // LEFT COLUMN: Current Recipe
  const currentDiv = document.createElement('div');
  currentDiv.style.flex = '1';
  currentDiv.style.border = '1px solid #ccc';
  currentDiv.style.padding = '10px';
  currentDiv.style.display = 'flex';
  currentDiv.style.flexDirection = 'column';
  
  try {
    // Fetch ingredients from recipeingredients table with proper join
    const { data: ingredientsData, error: ingredientsError } = await supabaseClient
      .from('recipeingredients')
      .select('*, ingredients(*)')
      .eq('recipe_id', recipe.id)
      .order('name', { foreignTable: 'ingredients' }); // Correct syntax for ordering by joined table column
      if (ingredientsData && Array.isArray(ingredientsData)) {
        // Map the data, ensuring we have the actual ingredient ID clearly separated
        recipe.ingredients = ingredientsData.map(item => {
            // item is from recipeingredients table, item.ingredients is the joined data
            if (!item.ingredients) {
                console.warn(`Missing joined ingredient data for recipeingredients item ID: ${item.id}`);
                return null; // Skip if join failed
            }
            return {
              ingredient_id: item.ingredients.id, // The *actual* ingredient ID
              name: item.ingredients.name,
              description: item.ingredients.description,
              quantity: item.quantity,
              unit: item.unit,
              notes: item.notes,
              recipe_ingredient_id: item.id // The ID of the link row in recipeingredients
            };
        }).filter(item => item !== null); // Filter out any nulls from failed joins
      }
      if (ingredientsError) {
        console.error('Error fetching ingredients:', ingredientsError);
      }
    
    // Display recipe details
    // Build the ingredients list HTML
    let ingredientsHtml = ''; // Removed h4 title
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      ingredientsHtml += '<ul>';
      recipe.ingredients.forEach(ing => {
        ingredientsHtml += `<li>${ing.name} (${ing.quantity} ${ing.unit || ''}) ${ing.notes ? '- ' + ing.notes : ''}</li>`; // Added notes display
      });
      ingredientsHtml += '</ul>';
    } else {
      ingredientsHtml += '<p>No ingredients provided</p>';
    }

    // Set the innerHTML with the new order and formatting
    // Add margin to the ingredients list if it exists
    if (recipe.ingredients && recipe.ingredients.length > 0) {
        ingredientsHtml = ingredientsHtml.replace('<ul>','<ul style="margin-bottom: var(--spacing-medium); padding-left: 20px;">'); // Add margin and padding
    }

    // Set the innerHTML with the new order and formatting, removing labels
    // Create container for top content
    const topContentDiv = document.createElement('div');
    topContentDiv.innerHTML = `<h3>${recipe.title}</h3>
                             <p style="margin-bottom: var(--spacing-medium);">${recipe.description || 'No description provided'}</p>
                             ${ingredientsHtml}`;
    currentDiv.appendChild(topContentDiv); // Add top content

    // Create container for bottom content (instructions + button)
    const bottomContentDiv = document.createElement('div');
    bottomContentDiv.style.marginTop = 'auto'; // Pushes this div down in flex container
    bottomContentDiv.style.textAlign = 'center'; // Center the button

    // Add instructions to bottom container
    const instructionsP = document.createElement('p');
    instructionsP.innerHTML = recipe.instructions || 'No instructions provided';
    instructionsP.style.marginBottom = 'var(--spacing-medium)'; // Space between instructions and button
    bottomContentDiv.appendChild(instructionsP);

    // Create and configure the remove button INSIDE the try block
    const removeRecipeBtn = document.createElement('button');
    removeRecipeBtn.id = 'removeRecipeBtn';
    removeRecipeBtn.classList.add('remove-recipe-btn', 'btn');
    removeRecipeBtn.textContent = 'Remove This Recipe';
    // removeRecipeBtn.style.marginTop = 'var(--spacing-medium)'; // Margin-top no longer needed
    removeRecipeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const confirmed = confirm(`Permanently remove recipe "${recipe.title}"? This cannot be undone.`);
      if (confirmed) {
        try {
          // Use the correct 'details' variable from the outer scope
          const details = document.getElementById('recipeDetails');
          const { error } = await supabaseClient
            .from('recipes')
            .delete()
            .eq('id', recipe.id);
          if (error) throw error;
          showNotification('Recipe removed successfully.', 'success');
          if (details) details.style.display = 'none'; // Hide details view
          await reloadData(); // Reload recipe list
        } catch (err) {
          console.error('Error removing recipe:', err);
          showNotification(`Error removing recipe: ${err.message}`, 'error');
        }
      }
    });

    // Append button to the bottom container
    bottomContentDiv.appendChild(removeRecipeBtn);

    // Append the bottom container to the main currentDiv
    currentDiv.appendChild(bottomContentDiv);
  } catch (error) {
    console.error('Error in showRecipeDetails:', error);
    currentDiv.innerHTML = `<p>Error loading recipe details.</p>`;
  }

  // --- Button creation and appending moved inside the try block ---

  // CENTER COLUMN: AI Suggestions
  const aiDiv = document.createElement('div');
  aiDiv.style.flex = '1';
  aiDiv.style.border = '1px solid #ccc';
  aiDiv.style.padding = '10px';

  const aiHeader = document.createElement('div');
  aiHeader.style.display = 'flex';
  aiHeader.style.justifyContent = 'space-between';
  aiHeader.style.alignItems = 'center';
  aiHeader.style.marginBottom = '10px';

  const aiHeading = document.createElement('h3');
  aiHeading.textContent = 'AI Suggestions';
  aiHeader.appendChild(aiHeading);
  aiDiv.appendChild(aiHeader);

  const aiInput = document.createElement('input');
  aiInput.id = 'aiPrompt';
  aiInput.placeholder = 'Get AI Suggestion (coming soon)';
  aiInput.style.display = 'block';
  aiInput.style.marginTop = '10px';
  aiInput.style.width = '100%';
  aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      alert('AI Suggestions coming soon!');
    }
  });
  aiDiv.appendChild(aiInput);

  const suggestionDiv = document.createElement('div');
  suggestionDiv.id = 'aiSuggestionText';
  suggestionDiv.style.marginTop = '10px';
  suggestionDiv.textContent = '(AI suggestions will appear here)';
  aiDiv.appendChild(suggestionDiv);

  // RIGHT COLUMN: New Iteration (Editable)
  const iterationDiv = document.createElement('div');
  iterationDiv.classList.add('iteration-column');
  iterationDiv.style.flex = '1';
  iterationDiv.style.border = '1px solid #ccc';
  iterationDiv.style.padding = '10px';
  iterationDiv.style.display = 'flex';
  iterationDiv.style.flexDirection = 'column';

  const iterationHeading = document.createElement('h3');
  iterationHeading.textContent = 'New Iteration';
  iterationDiv.appendChild(iterationHeading);

  const tableContainer = document.createElement('div');
  tableContainer.style.flexGrow = '1';
  tableContainer.style.overflowY = 'auto';
  tableContainer.style.marginBottom = 'var(--spacing-medium)';

  const editTable = document.createElement('table');
  editTable.style.width = '100%';
  editTable.style.borderCollapse = 'collapse';
  editTable.id = 'iterationEditTable';

  const editHeaderRow = document.createElement('tr');
  ['Ingredient', 'Quantity', 'Unit', 'Notes', 'Actions'].forEach(txt => {
    const th = document.createElement('th');
    th.textContent = txt;
    th.style.padding = '8px';
    th.style.border = '1px solid #444';
    editHeaderRow.appendChild(th);
  });
  editTable.appendChild(editHeaderRow);

  if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
    recipe.ingredients.forEach(ing => {
      const row = createEditableIngredientRow(ing);
      editTable.appendChild(row);
    });
  } else {
    const placeholderRow = editTable.insertRow();
    const cell = placeholderRow.insertCell();
    cell.colSpan = 5;
    cell.textContent = 'No ingredients yet. Add one below!';
    cell.style.textAlign = 'center';
    cell.style.padding = '10px';
    cell.style.fontStyle = 'italic';
  }
  tableContainer.appendChild(editTable);
  iterationDiv.appendChild(tableContainer);

  const addIngredientBtn = document.createElement('button');
  addIngredientBtn.textContent = '+ Add Ingredient Row';
  addIngredientBtn.classList.add('btn');
  addIngredientBtn.id = 'addIterationIngredientBtn';
  addIngredientBtn.style.marginBottom = 'var(--spacing-small)';
  addIngredientBtn.addEventListener('click', () => {
    const newRow = createEditableIngredientRow({});
    const placeholder = editTable.querySelector('td[colspan="5"]');
    if (placeholder) placeholder.parentElement.remove();
    editTable.appendChild(newRow);
    setEditModeFields();
  });
  iterationDiv.appendChild(addIngredientBtn);

  const commitBtn = document.createElement('button');
  commitBtn.id = 'commitRecipeBtn';
  commitBtn.textContent = 'Commit Iteration';
  commitBtn.classList.add('btn');
  commitBtn.addEventListener('click', async () => {
    await doCommitIteration(recipe, editTable);
  });
  iterationDiv.appendChild(commitBtn);

  container.appendChild(currentDiv);
  container.appendChild(aiDiv);
  container.appendChild(iterationDiv);

  details.appendChild(container);
  setEditModeFields();
}

/**
 * Helper function to create a row for the editable ingredients table.
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

        if (currentIngredientId !== null && optionIngredientId !== null && optionIngredientId === currentIngredientId) {
          option.selected = true;
          defaultOption.disabled = false; // Allow re-selecting placeholder if needed
          console.log(`     MATCH FOUND! Selecting option: ID=${optionIngredientId}, Name=${ing.name}`);
        }
        select.appendChild(option);
      });

       // If no ingredient was pre-selected, make the placeholder selected
      if (!select.querySelector('option[selected]')) {
        defaultOption.selected = true;
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
  console.log("Commit button clicked. Recipe:", currentRecipe);

  const updatedIngredients = [];
  const rows = iterationTable.querySelectorAll('tr');
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
    const newVersion = (currentRecipe.version || 0) + 1; // Ensure version exists, default to 0 if not
    // IMPORTANT: This assumes the 'recipes.ingredients' column is JSONB and
    // expects an array of objects like [{id: 'ing_uuid', name: '...', quantity: ..., unit: ..., notes: ...}]
    // The 'id' here MUST be the actual Ingredient ID.
    const { error } = await supabaseClient
      .from('recipes')
      .update({
          ingredients: updatedIngredients, // Send the structured list
          version: newVersion
       })
      .eq('id', currentRecipe.id);

    if (error) throw error;

    showNotification('Iteration committed successfully!', 'success');
    await reloadData(); // Reload to show the updated recipe list/details
    // Optionally, re-show the details for the *just updated* recipe
    // This requires fetching the updated recipe data again
    // const updatedRecipeData = await fetchRecipeById(currentRecipe.id); // Assuming such a function exists in api.js
    // if (updatedRecipeData) showRecipeDetails(updatedRecipeData);

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
  console.log('Reloading data...');
  try {
    // Fetch recipes
    const recipes = await fetchRecipes();
    console.log('Recipes loaded in reloadData, about to render:', JSON.stringify(recipes));
    renderRecipes(recipes);
    
    // Fetch ingredients for the global list
    allIngredients = await fetchIngredients();
    renderIngredients(allIngredients);
    
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
export async function initUI() {
  console.log('Initializing UI...');
  console.log('Initializing UI...');
  console.log('initUI: setup started');

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

    // Update UI only if the state actually changed *after* the initial check
    if (loggedInStateChanged && event !== 'INITIAL_SESSION') {
      console.log('Login state changed, updating UI elements...');
      updateAuthButton(); // Update the Log In/Log Out button
      setEditModeFields(); // Update edit mode dependent fields
      // Consider if reloadData() is needed here based on application logic
      // reloadData();
    }
  });

  // Set up event listeners for UI elements
  const btnLogIn = document.getElementById('btnLogIn');
  if (btnLogIn) {
    btnLogIn.addEventListener('click', async () => {
      if (isLoggedIn) {
        // Log out
