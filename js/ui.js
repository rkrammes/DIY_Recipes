// ui.js

import { supabaseClient } from './supabaseClient.js';
import { sendMagicLink, signOut } from './auth.js';
import { loadRecipes, loadAllIngredients } from './api.js'; // Assuming reloadData uses these

// Global login state
let isLoggedIn = false;

/**
 * Checks if edit mode is active.
 */
export function isEditMode() {
  const editCheckbox = document.getElementById('editModeCheckbox');
  return editCheckbox ? editCheckbox.checked : false;
}

/**
 * Updates the login/logout button text and enables/disables the edit mode checkbox.
 */
export function updateAuthButton() {
  const btnLogIn = document.getElementById('btnLogIn');
  const editCheckbox = document.getElementById('editModeCheckbox');
  if (btnLogIn) {
    btnLogIn.textContent = isLoggedIn ? 'Log Out' : 'Log In';
  }
  if (editCheckbox) {
    // Only enable edit mode if truly logged in
    editCheckbox.disabled = !isLoggedIn;
    if (!isLoggedIn) {
      editCheckbox.checked = false; // Ensure edit mode is off if logged out
      // Manually trigger setEditModeFields if checkbox state changed due to logout
      setEditModeFields();
    }
  }
}

/**
 * Enables or disables fields that depend on edit mode.
 * This function is called on initial load and whenever edit mode or auth state changes.
 */
function setEditModeFields() {
  const editModeActive = isEditMode();
  console.log('Setting edit mode fields. Active:', editModeActive);

  // --- Always Present Elements ---
  // "Add New Recipe" input
  const newRecipeInput = document.getElementById('newRecipeNameInput');
  if (newRecipeInput) {
    newRecipeInput.disabled = !editModeActive;
  }

  // "Add Ingredient" button (All Ingredients view)
  const btnAddGlobalIngredient = document.getElementById('btnAddGlobalIngredient');
  if (btnAddGlobalIngredient) {
    btnAddGlobalIngredient.disabled = !editModeActive;
  }

  // --- Dynamically Added Elements (within #recipeDetails) ---
  // Check if the recipe details section is currently displayed/populated
  const recipeDetailsSection = document.getElementById('recipeDetails');
  if (recipeDetailsSection && recipeDetailsSection.style.display !== 'none') {

    // "Remove Recipe" button
    const removeRecipeBtn = document.getElementById('removeRecipeBtn');
    if (removeRecipeBtn) {
      removeRecipeBtn.disabled = !editModeActive;
    }

    // "Commit Iteration" button
    const commitRecipeBtn = document.getElementById('commitRecipeBtn');
    if (commitRecipeBtn) {
      commitRecipeBtn.disabled = !editModeActive;
    }

    // AI Suggestion input
    const aiPromptInput = document.getElementById('aiPrompt');
    if (aiPromptInput) {
      aiPromptInput.disabled = !editModeActive;
    }

     // "+ Add Ingredient Row" button
    const addIterationIngredientBtn = document.getElementById('addIterationIngredientBtn');
    if (addIterationIngredientBtn) {
        addIterationIngredientBtn.disabled = !editModeActive;
    }

    // Editable table inputs and remove buttons (select all inputs/buttons within the iteration div)
    const iterationDiv = recipeDetailsSection.querySelector('.iteration-column'); // Assuming we add this class
    if (iterationDiv) {
        const editableInputs = iterationDiv.querySelectorAll('input');
        editableInputs.forEach(input => {
            input.disabled = !editModeActive;
        });
        const removeIterationBtns = iterationDiv.querySelectorAll('.remove-iteration-ingredient-btn');
        removeIterationBtns.forEach(btn => {
            btn.disabled = !editModeActive;
        });
    }
  }

  // --- Dynamically Added Elements (within #ingredientList) ---
  // "Remove Ingredient" buttons (global list)
  const removeIngredientBtns = document.querySelectorAll('#ingredientList .remove-ingredient-btn');
  removeIngredientBtns.forEach(btn => {
    // These buttons are only *added* if edit mode is active during render,
    // but this ensures they are correctly disabled if edit mode is turned *off* later.
    btn.disabled = !editModeActive;
  });
}


/**
 * Handles the login/logout button click.
 */
function handleLoginButtonClick() {
  const magicLinkForm = document.getElementById('magicLinkForm');
  if (!isLoggedIn) {
    // Show magic link form
    if (magicLinkForm) {
      magicLinkForm.style.display = 'block';
    }
  } else {
    // Log out
    signOut().then(() => {
      // State change and UI update is handled by onAuthStateChange listener
      console.log('Sign out initiated.');
    }).catch((error) => {
      console.error('Error during sign out:', error);
    });
  }
}

/**
 * Sends a magic link.
 */
function setupMagicLink() {
  const btnSendMagicLink = document.getElementById('btnSendMagicLink');
  if (btnSendMagicLink) {
    btnSendMagicLink.addEventListener('click', async () => {
      const emailInput = document.getElementById('magicLinkEmail');
      if (emailInput && emailInput.value) {
        try {
          await sendMagicLink(emailInput.value);
          alert('A magic link has been sent to your email. Please check your inbox to log in.');
          // UI update will happen via onAuthStateChange when user clicks link
          const magicLinkForm = document.getElementById('magicLinkForm');
          if (magicLinkForm) {
            magicLinkForm.style.display = 'none'; // Hide form after sending
          }
        } catch (error) {
          console.error('Error sending magic link:', error);
          alert(`Error sending magic link: ${error.message}`);
        }
      } else {
        alert('Please enter a valid email address.');
      }
    });
  }
}

/**
 * Helper: triggers an action if user presses Enter in an input/textarea.
 */
function onEnterKey(e, action) {
  if (e.key === 'Enter') {
    e.preventDefault();
    action();
  }
}

/**
 * Renders a list of recipes into the <ul id="recipeList"> element.
 */
export function renderRecipes(recipes) {
  console.log('Rendering recipes:', recipes);
  const container = document.getElementById('recipeList');
   if (!container) {
    console.error('No container found with id "recipeList"');
    return;
  }
  container.innerHTML = ''; // Clear existing list

  recipes.forEach(recipe => {
    const li = document.createElement('li');
    li.classList.add('recipe-item');
    li.textContent = recipe.name || 'Unnamed Recipe';
    li.addEventListener('click', () => {
        showRecipeDetails(recipe);
    });
    container.appendChild(li);
  });
}

/**
 * Renders a list of ingredients into the <ul id="ingredientList"> element.
 */
export function renderIngredients(ingredients) {
  const container = document.getElementById('ingredientList');
  if (!container) {
    console.error('No container found with id "ingredientList"');
    return;
  }
  container.innerHTML = ''; // Clear existing list

  ingredients.forEach(ingredient => {
    const div = document.createElement('div');
    div.classList.add('ingredient-container');
    div.style.marginBottom = '10px';

    const nameBtn = document.createElement('button');
    nameBtn.classList.add('ingredient-item');
    nameBtn.textContent = ingredient.name || 'Unnamed Ingredient';

    const descDiv = document.createElement('div');
    descDiv.classList.add('ingredient-description');
    descDiv.style.display = 'none';
    descDiv.textContent = ingredient.description || 'No description available.';

    nameBtn.addEventListener('click', () => {
      descDiv.style.display = (descDiv.style.display === 'none') ? 'block' : 'none';
    });

    div.appendChild(nameBtn);
    div.appendChild(descDiv);

    // Add remove button only if in edit mode
    if (isEditMode()) {
      const removeBtn = document.createElement('button');
      removeBtn.classList.add('remove-ingredient-btn', 'btn'); // Added .btn class
      removeBtn.textContent = 'Remove';
      removeBtn.style.marginTop = '5px';
      removeBtn.addEventListener('click', async (e) => {
        e.stopPropagation(); // Prevent description toggle
        const confirmed = confirm(`Remove global ingredient "${ingredient.name}"? This cannot be undone.`);
        if (confirmed) {
          try {
            const { error } = await supabaseClient
              .from('Ingredients')
              .delete()
              .eq('id', ingredient.id);
            if (error) throw error;
            showNotification('Ingredient removed successfully.', 'success');
            await reloadData(); // Reload data to reflect changes
          } catch (err) {
            console.error('Error removing ingredient:', err);
            showNotification(`Error removing ingredient: ${err.message}`, 'error');
          }
        }
      });
      div.appendChild(removeBtn);
    }

    container.appendChild(div);
  });
   // Ensure buttons are correctly enabled/disabled after render
  setEditModeFields();
}

/**
 * The 3-column recipe details view.
 * - Left: Current Ingredients (read-only)
 * - Center: AI Suggestions (placeholder)
 * - Right: New Iteration (editable table + actions)
 */
export function showRecipeDetails(recipe) {
  console.log('Showing recipe details for:', recipe); // Log the entire recipe object
  console.log('Recipe object before showing details:', JSON.stringify(recipe, null, 2)); // Log the recipe object
  const ingredientsView = document.getElementById('ingredientsView');
  if (ingredientsView) {
    ingredientsView.style.display = 'none'; // Hide the global ingredients list
  }

  const details = document.getElementById('recipeDetails');
  if (!details) {
      console.error('Recipe details container not found!');
      return;
  }
  details.innerHTML = ''; // Clear previous details
  details.style.display = 'block';

  // --- Main 3-Column Container ---
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.gap = '20px'; // Space between columns

  // --- LEFT COLUMN: Current Ingredients ---
  const currentDiv = document.createElement('div');
  currentDiv.style.flex = '1';
  currentDiv.style.border = '1px solid #ccc';
  currentDiv.style.padding = '10px';
  currentDiv.innerHTML = '<h3>Current Ingredients</h3>';
  if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
    recipe.ingredients.forEach(ing => {
      const line = document.createElement('div');
      line.style.marginBottom = '5px';
      let text = ing.name || 'Unnamed Ingredient';
      if (ing.quantity || ing.unit) {
        text += ` - ${ing.quantity || ''}${ing.unit || ''}`;
      }
      if (ing.notes) {
        text += ` (${ing.notes})`;
      }
      line.textContent = text;
      currentDiv.appendChild(line);
    });
  } else {
    currentDiv.innerHTML += '<p>No ingredients listed for this recipe.</p>';
  }
  // Add the "Remove Recipe" button at the bottom of the left column
  const removeRecipeBtn = document.createElement('button');
  removeRecipeBtn.id = 'removeRecipeBtn';
  removeRecipeBtn.classList.add('remove-recipe-btn', 'btn');
  removeRecipeBtn.textContent = 'Remove This Recipe';
  removeRecipeBtn.style.marginTop = 'var(--spacing-medium)';
  removeRecipeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const confirmed = confirm(`Permanently remove recipe "${recipe.name}"? This cannot be undone.`);
      if (confirmed) {
          try {
              const { error } = await supabaseClient
                  .from('recipes') // Corrected table name
                  .delete()
                  .eq('id', recipe.id);
              if (error) throw error;
              showNotification('Recipe removed successfully.', 'success');
              details.style.display = 'none'; // Hide details view
              await reloadData(); // Reload recipe list
          } catch (err) {
              console.error('Error removing recipe:', err);
              showNotification(`Error removing recipe: ${err.message}`, 'error');
          }
      }
  });
  currentDiv.appendChild(removeRecipeBtn);


  // --- CENTER COLUMN: AI Suggestions ---
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
      // TODO: Implement doAISuggestion(aiInput.value, recipe);
    }
  });
  aiDiv.appendChild(aiInput);

  const suggestionDiv = document.createElement('div');
  suggestionDiv.id = 'aiSuggestionText';
  suggestionDiv.style.marginTop = '10px';
  suggestionDiv.textContent = '(AI suggestions will appear here)';
  aiDiv.appendChild(suggestionDiv);


  // --- RIGHT COLUMN: New Iteration (Editable) ---
  const iterationDiv = document.createElement('div');
  iterationDiv.classList.add('iteration-column'); // Add class for easier selection in setEditModeFields
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

  const editTable = document.createElement('table'); // Define table outside the if block
  editTable.style.width = '100%';
  editTable.style.borderCollapse = 'collapse';
  editTable.id = 'iterationEditTable'; // Give table an ID

  // Header row (always add header, even if no ingredients yet)
  const editHeaderRow = document.createElement('tr');
  ['Ingredient', 'Quantity', 'Unit', 'Notes', 'Actions'].forEach(txt => {
    const th = document.createElement('th');
    th.textContent = txt;
    th.style.padding = '8px';
    th.style.border = '1px solid #444';
    editHeaderRow.appendChild(th);
  });
  editTable.appendChild(editHeaderRow); // Add header to table

  if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
    recipe.ingredients.forEach(ing => {
      const row = createEditableIngredientRow(ing); // Use helper function
      editTable.appendChild(row);
    });
  } else {
    // Optionally add a placeholder row or message if table is empty
    const placeholderRow = editTable.insertRow();
    const cell = placeholderRow.insertCell();
    cell.colSpan = 5; // Span across all columns
    cell.textContent = 'No ingredients yet. Add one below!';
    cell.style.textAlign = 'center';
    cell.style.padding = '10px';
    cell.style.fontStyle = 'italic';
  }
  tableContainer.appendChild(editTable); // Add table to its container
  iterationDiv.appendChild(tableContainer); // Add table container to iteration div

  // "+ Add Ingredient Row" Button
  const addIngredientBtn = document.createElement('button');
  addIngredientBtn.textContent = '+ Add Ingredient Row';
  addIngredientBtn.classList.add('btn');
  addIngredientBtn.id = 'addIterationIngredientBtn';
  addIngredientBtn.style.marginBottom = 'var(--spacing-small)';
  addIngredientBtn.addEventListener('click', () => {
      const newRow = createEditableIngredientRow({}); // Create row with empty data
      // Remove placeholder row if it exists
      const placeholder = editTable.querySelector('td[colspan="5"]');
      if (placeholder) placeholder.parentElement.remove();
      editTable.appendChild(newRow);
      setEditModeFields(); // Ensure new inputs are correctly enabled/disabled
  });
  iterationDiv.appendChild(addIngredientBtn);

  // "Commit Iteration" Button
  const commitBtn = document.createElement('button');
  commitBtn.id = 'commitRecipeBtn';
  commitBtn.textContent = 'Commit Iteration';
  commitBtn.classList.add('btn');
  commitBtn.addEventListener('click', async () => {
    await doCommitIteration(recipe, editTable); // Pass table element
  });
  iterationDiv.appendChild(commitBtn);


  // --- Append Columns to Main Container ---
  container.appendChild(currentDiv);
  container.appendChild(aiDiv);
  container.appendChild(iterationDiv);

  details.appendChild(container); // Add the 3-column container to the details section

  // Ensure all dynamically added elements have correct disabled state
  setEditModeFields();
}

/**
 * Helper function to create a row for the editable ingredients table.
 */
function createEditableIngredientRow(ingredientData) {
    console.log('Creating editable row for:', JSON.stringify(ingredientData, null, 2)); // Log incoming data
    const row = document.createElement('tr');
    // Use a unique temporary ID for new rows if ingredientData.id is missing
    row.dataset.ingredientId = ingredientData.id || `new_${Date.now()}`;

    const fields = ['name', 'quantity', 'unit', 'notes'];
    fields.forEach(field => {
        const cell = document.createElement('td');
        cell.style.border = '1px solid #444';
        cell.style.padding = '8px';
        const input = document.createElement('input');
        input.dataset.field = field;
        input.placeholder = field.charAt(0).toUpperCase() + field.slice(1) + '?'; // e.g., "Name?"
        if (field === 'quantity' || field === 'unit') {
            console.log(`Setting ${field} to:`, ingredientData[field]);
        }
        input.value = ingredientData[field] !== undefined ? ingredientData[field] : '';
        input.style.width = '100%';
        if (field === 'quantity') {
            input.type = 'number'; // Use number type for quantity
        }
        cell.appendChild(input);
        row.appendChild(cell);
    });

    // Actions cell
    const actionCell = document.createElement('td');
    actionCell.style.border = '1px solid #444';
    actionCell.style.padding = '8px';
    actionCell.style.textAlign = 'center';
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.classList.add('btn', 'remove-iteration-ingredient-btn');
    removeBtn.style.padding = '4px 8px';
    removeBtn.dataset.targetRowId = row.dataset.ingredientId; // Link button to row
    removeBtn.addEventListener('click', (e) => {
        e.target.closest('tr').remove(); // Remove the table row
        // Check if table is now empty and add placeholder if needed
        const table = e.target.closest('table');
        if (table && table.rows.length <= 1) { // Only header row left
             const placeholderRow = table.insertRow();
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
async function doCommitIteration(currentRecipe, iterationTable) {
  console.log("Commit button clicked. Recipe:", currentRecipe);

  const updatedIngredients = [];
  const rows = iterationTable.querySelectorAll('tr');

  // Start from 1 to skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const inputs = row.querySelectorAll('input[data-field]');
    const ingredient = {
        // Keep original ID if it exists, otherwise it's a new ingredient
        id: row.dataset.ingredientId.startsWith('new_') ? undefined : row.dataset.ingredientId,
    };
    let isEmptyRow = true;
    inputs.forEach(input => {
      const field = input.dataset.field;
      const value = input.value.trim();
      if (value) {
          ingredient[field] = value;
          isEmptyRow = false; // Mark row as not empty if any field has value
      }
    });

    // Only add non-empty rows to the update
    if (!isEmptyRow) {
        // Basic validation: Ensure name exists if it's not an empty row
        if (!ingredient.name) {
            alert(`Ingredient in row ${i} is missing a name.`);
            return; // Stop commit
        }
        updatedIngredients.push(ingredient);
    }
  }

  console.log("Updated ingredients data:", updatedIngredients);

  try {
    // Here you would typically:
    // 1. Compare updatedIngredients with currentRecipe.ingredients
    // 2. Identify added, updated, and removed ingredients.
    // 3. Make corresponding calls to Supabase (insert, update, delete).
    // For simplicity now, we'll just update the whole 'ingredients' JSONB column.
    // WARNING: This replaces the entire array. Need careful handling for relations if ingredients are separate table.
    // Assuming 'ingredients' is a JSONB column in 'All_Recipes' table.

    const { error } = await supabaseClient
      .from('All_Recipes')
      .update({ ingredients: updatedIngredients }) // Update the ingredients array
      .eq('id', currentRecipe.id);

    if (error) throw error;

    showNotification('Iteration committed successfully!', 'success');
    await reloadData(); // Reload data to show updated "Current Ingredients"
    // Potentially re-show details for the same recipe
    // showRecipeDetails({ ...currentRecipe, ingredients: updatedIngredients }); // Show updated data immediately

  } catch (err) {
    console.error('Error committing iteration:', err);
    showNotification(`Error committing iteration: ${err.message}`, 'error');
  }
}


/**
 * Handles AI suggestion request (Placeholder).
 */
async function doAISuggestion(promptValue, recipeObj) {
    alert('AI Suggestions feature coming soon!');
    // Placeholder for future API call
    // try {
    //   const response = await fetch('/api/ai-suggestion', { ... });
    //   const data = await response.json();
    //   document.getElementById('aiSuggestionText').textContent = data.suggestion || 'No suggestion.';
    // } catch (error) {
    //   document.getElementById('aiSuggestionText').textContent = 'Error getting suggestion.';
    // }
}

/**
 * Updates a single property of an ingredient (Not used in the new iteration flow).
 */
async function doUpdateIngredient(ingObj, prop, newValue) {
    // This function might be deprecated or repurposed if all updates happen on commit.
    console.warn('doUpdateIngredient called - consider removing if commit handles all updates.');
    try {
      const { data, error } = await supabaseClient
        .from('Ingredients') // Assumes separate Ingredients table - adjust if using JSONB
        .update({ [prop]: newValue })
        .eq('id', ingObj.id)
        .select();
      if (error) throw error;
      showNotification(`Updated ${prop} for ${ingObj.name}.`, 'success');
      await reloadData();
    } catch (err) {
      console.error(`Error updating ${prop}:`, err);
      showNotification(`Error updating ${prop}: ${err.message}`, 'error');
    }
}


/**
 * Initializes UI elements and event listeners.
 */
export async function initUI() {
  console.log('initUI: setup started');

  // 1) Set up real-time auth state listener
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    const magicLinkForm = document.getElementById('magicLinkForm');

    let loggedInStateChanged = false;
    const previousIsLoggedIn = isLoggedIn;

    if (event === 'SIGNED_IN') {
      isLoggedIn = true;
      console.log('User signed in.');
      if (magicLinkForm) magicLinkForm.style.display = 'none'; // Hide form on login
    } else if (event === 'SIGNED_OUT') {
      isLoggedIn = false;
      console.log('User signed out.');
    }
    // For INITIAL_SESSION, session might be null or contain the session
    if (event === 'INITIAL_SESSION') {
        isLoggedIn = !!session; // Set based on initial session presence
        console.log('Initial session processed. Logged in:', isLoggedIn);
    }

    loggedInStateChanged = previousIsLoggedIn !== isLoggedIn;

    // Update UI based on new login state
    updateAuthButton();
    setEditModeFields(); // Ensure edit fields reflect login status

    // Reload data only if login state actually changed, to avoid unnecessary reloads
    if (loggedInStateChanged) {
        reloadData();
    }
  });


  // 2) Initial UI setup (Theme, Checkbox, Buttons etc.)
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    // Set initial theme based on the user's system preference or saved preference
    // TODO: Consider saving/loading theme preference from localStorage
    const initialTheme = themeSelect.value; // Default to selected value
    if (initialTheme === 'system') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.className = 'dark';
      } else {
        document.body.className = 'light';
      }
    } else {
      document.body.className = initialTheme;
    }
    console.log('Initial theme set to:', document.body.className);

    themeSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        if (value === 'system') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.className = 'dark';
            } else {
                document.body.className = 'light';
            }
        } else {
            document.body.className = value;
        }
        console.log('Theme changed to:', document.body.className);
        // TODO: Save theme preference to localStorage
    });
  }

  const editCheckbox = document.getElementById('editModeCheckbox');
  if (editCheckbox) {
    // Initial state set by updateAuthButton via onAuthStateChange
    editCheckbox.addEventListener('change', () => {
      // window.editMode = editCheckbox.checked; // Avoid global state if possible
      setEditModeFields(); // Update fields when checkbox changes
      // Re-render currently viewed details/ingredients if needed to show/hide buttons
      const activeDetails = document.getElementById('recipeDetails');
      const activeIngredients = document.getElementById('ingredientsView');
      if (activeDetails && activeDetails.style.display !== 'none') {
          // Need the current recipe object to re-render details
          // This requires storing the currently viewed recipe or finding it again
          console.warn("Re-rendering recipe details on edit mode toggle is not fully implemented.");
      } else if (activeIngredients && activeIngredients.style.display !== 'none') {
          reloadData(); // Easiest way to re-render global ingredients list with/without remove buttons
      }
    });
  }

  const btnLogIn = document.getElementById('btnLogIn');
  if (btnLogIn) {
    btnLogIn.addEventListener('click', () => {
      handleLoginButtonClick();
    });
  } else {
    console.error('initUI: btnLogIn not found');
  }

  setupMagicLink();

  // "Add New Recipe" input triggers creation on Enter
  const newRecipeInput = document.getElementById('newRecipeNameInput');
  if (newRecipeInput) {
    newRecipeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isEditMode() && newRecipeInput.value.trim() !== '') {
          createNewRecipe(newRecipeInput.value.trim());
          newRecipeInput.value = '';
        }
      }
    });
  }

  // "Add Ingredient" button (global list) listener
  const btnAddGlobalIngredient = document.getElementById('btnAddGlobalIngredient');
  if (btnAddGlobalIngredient) {
    btnAddGlobalIngredient.addEventListener('click', () => {
      if (!isEditMode()) {
        alert('Please enable Edit Mode to add ingredients.');
        return;
      }
      const ingredientName = prompt('Enter the name for the new global ingredient:');
      if (ingredientName && ingredientName.trim() !== '') {
        createNewGlobalIngredient(ingredientName.trim());
      } else if (ingredientName !== null) {
        alert('Ingredient name cannot be empty.');
      }
    });
  } else {
    console.error('initUI: btnAddGlobalIngredient not found');
  }

  const btnIngredients = document.getElementById('btnIngredients');
  if (btnIngredients) {
    btnIngredients.addEventListener('click', () => {
      console.log('All Ingredients button clicked');
      const recipeDetails = document.getElementById('recipeDetails');
      if (recipeDetails) {
        recipeDetails.style.display = 'none'; // Hide recipe details
      }
      const ingredientsView = document.getElementById('ingredientsView');
      if (ingredientsView) {
        ingredientsView.style.display = 'block'; // Show ingredients view
      }
      // Optionally reload ingredients data if needed
      // reloadData();
    });
  } else {
    console.error('initUI: btnIngredients not found');
  }

  // Initial data load is triggered by INITIAL_SESSION event in onAuthStateChange
}

/**
 * Creates a new recipe.
 */
async function createNewRecipe(recipeName) {
  console.log('Creating new recipe:', recipeName);
  try {
    const { error } = await supabaseClient
      .from('All_Recipes')
      .insert({ name: recipeName, ingredients: [] }); // Initialize with empty ingredients
    if (error) throw error;
    showNotification('New recipe created.', 'success');
    await reloadData(); // Reload recipe list
  } catch (err) {
    console.error('Error creating recipe:', err);
    showNotification(`Error creating recipe: ${err.message}`, 'error');
  }
}

/**
 * Creates a new global ingredient.
 */
async function createNewGlobalIngredient(ingredientName) {
  console.log('Creating new global ingredient:', ingredientName);
  try {
    const { error } = await supabaseClient
      .from('Ingredients')
      .insert({ name: ingredientName, description: '' });
    if (error) throw error;
    showNotification('New ingredient created.', 'success');
    await reloadData(); // Reload ingredients list
  } catch (err) {
    console.error('Error creating ingredient:', err);
    showNotification(`Error creating ingredient: ${err.message}`, 'error');
  }
}

/**
 * Reloads both recipes and ingredients data and re-renders the lists.
 */
async function reloadData() {
  console.log('Reloading data...');
  try {
    const recipes = await loadRecipes();
    renderRecipes(recipes);
    const ingredients = await loadAllIngredients();
    renderIngredients(ingredients);
    console.log('Data reloaded successfully.');
  } catch (error) {
    console.error('Error reloading data:', error);
    showNotification(`Error loading data: ${error.message}`, 'error');
  }
}

/**
 * Shows a simple notification.
 */
function showNotification(message, type) {
  // Simple alert for now, could be replaced with a nicer UI element
  alert(`${type.toUpperCase()}: ${message}`);
}

// Expose necessary functions to global scope or handle module interactions appropriately
// Assuming main.js calls initUI()
window.DIYRecipeApp = {
    initUI,
    showRecipeDetails,
    renderRecipes,
    renderIngredients,
    updateAuthButton,
    isEditMode,
    reloadData // Expose reloadData if needed elsewhere
};
