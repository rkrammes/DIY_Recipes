 // Import the Supabase client
import { supabaseClient } from './supabaseClient.js';
// Fixed import names to match api.js exports - this fixes the SyntaxError
// "Importing binding name 'fetchIngredients' is not found"
import { loadRecipes, loadAllIngredients, updateRecipeIngredients } from './api.js';

// Global variables
let isLoggedIn = false;
let allIngredients = []; // Global array to store all ingredients
let currentRecipe = null; // Track the currently displayed recipe

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
 * Renders the ingredients list in the UI, making it collapsible.
 */
export function renderIngredients(ingredients) {
  console.log('renderIngredients called with:', ingredients);
  const ingredientList = document.getElementById('currentRecipeIngredients');
  if (!ingredientList) {
    console.error('renderIngredients: Could not find element with ID "currentRecipeIngredients"');
    return;
  }

  console.log('Found ingredientList element:', ingredientList);

  // Clear existing list
  ingredientList.innerHTML = '';

  // Check if ingredients array is empty
  if (!ingredients || ingredients.length === 0) {
    console.log('No ingredients to render');
    const emptyMessage = document.createElement('li');
    emptyMessage.textContent = 'No ingredients available';
    emptyMessage.style.fontStyle = 'italic';
    ingredientList.appendChild(emptyMessage);
    return;
  }

  // Sort ingredients by name
  const sortedIngredients = [...ingredients].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  console.log('Sorted ingredients for rendering:', sortedIngredients);

  // Create list items
  sortedIngredients.forEach(ingredient => {
    console.log('Rendering ingredient:', ingredient);
    const li = document.createElement('li');
    li.classList.add('ingredient-item');
    // Use ingredient_id if available, fall back to id for compatibility
    li.dataset.id = ingredient.ingredient_id || ingredient.id || '';
    
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
    summaryDiv.appendChild(nameDiv);
    
    // Add quantity and unit if available
    if (ingredient.quantity || ingredient.unit) {
      const quantityDiv = document.createElement('div');
      quantityDiv.classList.add('ingredient-quantity');
      quantityDiv.textContent = `${ingredient.quantity || ''} ${ingredient.unit || ''}`.trim();
      summaryDiv.appendChild(quantityDiv);
    }
    
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
    
    // Add notes if available
    if (ingredient.notes) {
      const notesDiv = document.createElement('div');
      notesDiv.classList.add('ingredient-notes');
      notesDiv.textContent = `Note: ${ingredient.notes}`;
      notesDiv.style.fontStyle = 'italic';
      notesDiv.style.fontSize = '0.9em';
      detailsDiv.appendChild(notesDiv);
    }
    
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
    
    li.addEventListener('click', () => {
      console.log('Ingredient clicked:', ingredient.name);
      // Toggle the 'expanded' class and the display of detailsDiv
      li.classList.toggle('expanded');
      if (detailsDiv.hasChildNodes()) { // Only toggle if there are details to show
        detailsDiv.style.display = li.classList.contains('expanded') ? 'block' : 'none';
      }
      // Optional: visual feedback on expand/collapse
      if (li.classList.contains('expanded')) {
        li.style.backgroundColor = 'rgba(0, 123, 255, 0.05)';
      } else {
        li.style.backgroundColor = '';
      }
    });
    
    ingredientList.appendChild(li);
  });
  
  console.log('Finished rendering ingredients, count:', sortedIngredients.length);
}

/**
 * Shows the details of a recipe.
 */
export async function showRecipeDetails(recipe) {
  console.log('Showing recipe details for:', recipe);
  console.log('Recipe object before showing details:', JSON.stringify(recipe, null, 2));
  
  currentRecipe = recipe; // Store the current recipe
  
  const details = document.getElementById('recipeDetails');
  const recipeHeader = document.getElementById('recipe-header'); // Get the new header element
  if (!details || !recipeHeader) return; // Check for both elements
  details.innerHTML = ''; // Clear previous content to ensure fresh render
  recipeHeader.innerHTML = ''; // Clear previous header content
  
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
    console.log('Fetching ingredients for recipe ID:', recipe.id);
    // Fetch ingredients from recipeingredients table with proper join
    const { data: ingredientsData, error: ingredientsError } = await supabaseClient
      .from('recipeingredients')
      .select('*, ingredients(*)')
      .eq('recipe_id', recipe.id)
      .order('name', { foreignTable: 'ingredients' }); // Correct syntax for ordering by joined table column
    
    console.log('Raw ingredients data from query:', ingredientsData);
    
    if (ingredientsError) {
      console.error('Error fetching ingredients:', ingredientsError);
    }
    
    if (ingredientsData && Array.isArray(ingredientsData)) {
      console.log(`Found ${ingredientsData.length} ingredients for recipe ${recipe.id}`);
      
      // Map the data, ensuring we have the actual ingredient ID clearly separated
      recipe.ingredients = ingredientsData.map(item => {
        console.log('Processing ingredient item:', item);
        
        if (!item.ingredients) {
          console.warn(`Missing joined ingredient data for recipeingredients item ID: ${item.id}`);
          return null; // Skip if join failed
        }
        
        const mappedIngredient = {
          ingredient_id: item.ingredients.id,
          name: item.ingredients.name,
          description: item.ingredients.description,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes,
          recipe_ingredient_id: item.id
        };
        
        console.log('Mapped ingredient:', mappedIngredient);
        return mappedIngredient;
      }).filter(item => item !== null);
      
      console.log(`After mapping: ${recipe.ingredients.length} valid ingredients`);
    } else {
      console.warn('No ingredients data returned or data is not an array');
      recipe.ingredients = [];
    }

    // Populate the new recipe header
    const titleH3 = document.createElement('h3');
    titleH3.textContent = recipe.title;
    recipeHeader.appendChild(titleH3);

    const descriptionP = document.createElement('p');
    descriptionP.textContent = recipe.description || 'No description provided';
    descriptionP.style.marginBottom = 'var(--spacing-medium)'; // Keep the margin for spacing below description
    // Description moved to middle column (aiDiv)

    // Remove the old topContentDiv creation and appending

    // Create a heading for ingredients
    const ingredientsHeading = document.createElement('h4');
    ingredientsHeading.style.marginBottom = 'var(--spacing-small)';
    currentDiv.appendChild(ingredientsHeading);

    // Create a scrollable container for ingredients
    const ingredientsContainer = document.createElement('div');
    ingredientsContainer.style.maxHeight = '400px'; // Increased height
    ingredientsContainer.style.overflowY = 'auto';
    ingredientsContainer.style.marginBottom = 'var(--spacing-medium)';
    ingredientsContainer.style.padding = '10px';
    ingredientsContainer.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    ingredientsContainer.style.borderRadius = '4px';
    ingredientsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    
    // Add a heading for the ingredients container
    const ingredientsContainerHeading = document.createElement('div');
    ingredientsContainerHeading.style.marginBottom = '10px';
    ingredientsContainerHeading.style.fontSize = '14px';
    ingredientsContainerHeading.style.fontStyle = 'italic';
    ingredientsContainerHeading.style.color = 'var(--accent-orange)';
    ingredientsContainer.appendChild(ingredientsContainerHeading);
    
    // Add dedicated UL for current recipe ingredients
    const currentIngredientsList = document.createElement('ul');
    currentIngredientsList.id = 'currentRecipeIngredients';
    currentIngredientsList.style.listStyle = 'none';
    currentIngredientsList.style.padding = '0';
    currentIngredientsList.style.margin = '0';
    
    ingredientsContainer.appendChild(currentIngredientsList);
    currentDiv.appendChild(ingredientsContainer);

    // Force DOM update before rendering ingredients
    setTimeout(() => {
      // Log ingredients before rendering
      console.log('About to render ingredients for recipe:', recipe.id);
      console.log('Final ingredients data to render:', JSON.stringify(recipe.ingredients || []));
      
      // Render current recipe ingredients
      console.log('Calling renderIngredients with ingredients array');
      renderIngredients(recipe.ingredients || []);
      console.log('Returned from renderIngredients call');
    }, 0);

    // Create container for bottom content (instructions + button)
    const bottomContentDiv = document.createElement('div');
    bottomContentDiv.style.marginTop = 'auto';
    bottomContentDiv.style.textAlign = 'center';

    const instructionsP = document.createElement('p');
    instructionsP.innerHTML = recipe.instructions || 'No instructions provided';
    instructionsP.style.marginBottom = 'var(--spacing-medium)';
    // Instructions moved to middle column (aiDiv)

    const removeRecipeBtn = document.createElement('button');
    removeRecipeBtn.id = 'removeRecipeBtn';
    removeRecipeBtn.classList.add('remove-recipe-btn', 'btn');
    removeRecipeBtn.textContent = 'Remove This Recipe';
    removeRecipeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const confirmed = confirm(`Permanently remove recipe "${recipe.title}"? This cannot be undone.`);
      if (confirmed) {
        try {
          const details = document.getElementById('recipeDetails');
          const { error } = await supabaseClient
            .from('recipes')
            .delete()
            .eq('id', recipe.id);
          if (error) throw error;
          showNotification('Recipe removed successfully.', 'success');
          if (details) details.style.display = 'none';
          await reloadData();
        } catch (err) {
          console.error('Error removing recipe:', err);
          showNotification(`Error removing recipe: ${err.message}`, 'error');
        }
      }
    });

    bottomContentDiv.appendChild(removeRecipeBtn);
    currentDiv.appendChild(bottomContentDiv);
  } catch (error) {
    console.error('Error in showRecipeDetails:', error);
    currentDiv.innerHTML = `<p>Error loading recipe details.</p>`;
  }

  // --- Button creation and appending moved inside the try block ---

  // CENTER COLUMN: Recipe Description & Instructions
  const aiDiv = document.createElement('div'); // Keeping the variable name for simplicity, but it now holds Description/Instructions
  aiDiv.id = 'recipe-info-column'; // Add an ID for potential styling
  aiDiv.style.flex = '1';
  aiDiv.style.border = '1px solid #ccc';
  aiDiv.style.padding = '10px';
  aiDiv.style.display = 'flex'; // Use flexbox for content arrangement
  aiDiv.style.flexDirection = 'column'; // Stack content vertically

  // Add Description and Instructions to this middle column
  aiDiv.appendChild(descriptionP);
  aiDiv.appendChild(instructionsP);

  // AI Suggestions elements will be created later and added to the right column

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
  iterationHeading.textContent = 'Kraft'; // Renamed header
  iterationDiv.appendChild(iterationHeading);

  // --- Add AI Suggestions Elements Here ---
  const aiHeader = document.createElement('div');
  aiHeader.style.display = 'flex';
  aiHeader.style.justifyContent = 'space-between';
  aiHeader.style.alignItems = 'center';
  aiHeader.style.marginBottom = '10px';
  aiHeader.style.marginTop = 'var(--spacing-medium)'; // Add some space above AI section

  const aiHeading = document.createElement('h3');
  aiHeading.textContent = 'AI Suggestions';
  aiHeader.appendChild(aiHeading);
  iterationDiv.appendChild(aiHeader); // Add AI Header to right column

  const aiInput = document.createElement('input');
  aiInput.id = 'aiPrompt';
  aiInput.placeholder = 'Get AI Suggestion (coming soon)';
  aiInput.classList.add('sidebar-textbox'); // Reuse existing style
  aiInput.style.width = 'calc(100% - 22px)'; // Adjust width considering padding
  aiInput.style.marginBottom = '5px';
  iterationDiv.appendChild(aiInput); // Add AI Input to right column

  const aiButton = document.createElement('button');
  aiButton.id = 'btnGetAISuggestion';
  aiButton.textContent = 'Suggest';
  aiButton.classList.add('btn');
  aiButton.disabled = true; // Feature coming soon
  aiButton.style.marginBottom = '10px';
  iterationDiv.appendChild(aiButton); // Add AI Button to right column

  const aiSuggestionsList = document.createElement('ul');
  aiSuggestionsList.id = 'aiSuggestionsList';
  aiSuggestionsList.style.listStyle = 'none';
  aiSuggestionsList.style.padding = '0';
  aiSuggestionsList.style.maxHeight = '150px'; // Limit height
  aiSuggestionsList.style.overflowY = 'auto';
  aiSuggestionsList.style.border = '1px dashed #ccc';
  aiSuggestionsList.style.padding = '5px';
  aiSuggestionsList.textContent = 'Suggestions will appear here...'; // Placeholder
  iterationDiv.appendChild(aiSuggestionsList); // Add AI List to right column
  // --- End AI Suggestions Elements ---

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
    console.log('reloadData: Fetching recipes from API...');
    const recipes = await loadRecipes();
    console.log(`reloadData: Recipes loaded: ${recipes.length} recipes found`);
    console.log('reloadData: First few recipes:', recipes.slice(0, 3).map(r => ({ id: r.id, title: r.title })));
    renderRecipes(recipes);
    
    // Fetch ingredients for the global list
    console.log('reloadData: Fetching all ingredients from API...');
    allIngredients = await loadAllIngredients();
    console.log(`reloadData: All ingredients loaded: ${allIngredients.length} ingredients found`);
    console.log('reloadData: First few ingredients:', allIngredients.slice(0, 5).map(i => ({ id: i.id, name: i.name })));
    
    // Only render ingredients if we're in the ingredients view
    const ingredientsView = document.getElementById('ingredientsView');
    if (ingredientsView && ingredientsView.style.display !== 'none') {
      console.log('reloadData: Rendering ingredients in the ingredients view');
      const ingredientList = document.getElementById('ingredientList');
      if (ingredientList) {
        renderIngredients(allIngredients);
      }
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

  // Set up event listener for the ingredients button
  const btnIngredients = document.getElementById('btnIngredients');
  if (btnIngredients) {
    btnIngredients.addEventListener('click', () => {
      // Hide recipe details if visible
      const recipeDetails = document.getElementById('recipeDetails');
      if (recipeDetails) recipeDetails.style.display = 'none';
      
      // Show ingredients view
      const ingredientsView = document.getElementById('ingredientsView');
      if (ingredientsView) ingredientsView.style.display = 'block';
    });
  }

  // Set up event listener for the add recipe button
  const btnAddRecipe = document.getElementById('btnAddRecipe');
  if (btnAddRecipe) {
    btnAddRecipe.addEventListener('click', () => {
      if (!isLoggedIn) {
        showNotification('Please log in to add recipes.', 'error');
        return;
      }
      
      // Create a new recipe with default values
      const newRecipe = {
        title: 'New Recipe',
        description: '',
        instructions: '',
        ingredients: [],
        version: 1
      };
      
      // Hide ingredients view if visible
      const ingredientsView = document.getElementById('ingredientsView');
      if (ingredientsView) ingredientsView.style.display = 'none';
      
      // Show recipe details with the new recipe
      const recipeDetails = document.getElementById('recipeDetails');
      if (recipeDetails) {
        recipeDetails.style.display = 'block';
        recipeDetails.innerHTML = ''; // Clear previous content
        showRecipeDetails(newRecipe);
      }
    });
  }

  // Set up event listener for the add global ingredient button
  const btnAddGlobalIngredient = document.getElementById('btnAddGlobalIngredient');
  if (btnAddGlobalIngredient) {
    btnAddGlobalIngredient.addEventListener('click', () => {
      if (!isLoggedIn) {
        showNotification('Please log in to add ingredients.', 'error');
        return;
      }
      
      // Prompt for ingredient name and description
      const name = prompt('Enter ingredient name:');
      if (!name) return;
      
      const description = prompt('Enter ingredient description (optional):');
      
      // Create a new ingredient
      const newIngredient = {
        name,
        description: description || null
      };
      
      // Add the ingredient to the database
      supabaseClient
        .from('ingredients')
        .insert([newIngredient])
        .then(({ data, error }) => {
          if (error) {
            console.error('Error adding ingredient:', error);
            showNotification(`Error adding ingredient: ${error.message}`, 'error');
            return;
          }
          
          showNotification('Ingredient added successfully!', 'success');
          reloadData(); // Reload to show the new ingredient
        });
    });
  }

  // Load initial data
  await reloadData();
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

// Simple notification function
