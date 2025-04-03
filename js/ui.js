// ui.js

import { supabaseClient } from './supabaseClient.js';
import { sendMagicLink, signOut } from './auth.js';
import { loadRecipes, loadAllIngredients, createNewRecipe, addGlobalIngredient } from './api.js'; // Added createNewRecipe, addGlobalIngredient

// Global login state
let isLoggedIn = false;

/**
 * Checks if edit mode is active.
 */
export function isEditMode() {
  const editButton = document.getElementById('btnEditModeToggle');
  // Check the data-active attribute, converting the string 'true' to a boolean
  return editButton ? editButton.dataset.active === 'true' : false;
}

/**
 * Updates the login/logout button text and enables/disables the edit mode toggle button.
 */
export function updateAuthButton() {
  const btnLogIn = document.getElementById('btnLogIn');
  const btnEditModeToggle = document.getElementById('btnEditModeToggle');

  if (btnLogIn) {
    btnLogIn.textContent = isLoggedIn ? 'Log Out' : 'Log In';
  }

  if (btnEditModeToggle) {
    // Enable the button only if logged in
    btnEditModeToggle.disabled = !isLoggedIn;

    if (!isLoggedIn) {
      // If logged out, force edit mode off
      btnEditModeToggle.dataset.active = 'false';
      btnEditModeToggle.textContent = 'Edit Mode: OFF';
      // Manually trigger setEditModeFields to disable relevant fields
      setEditModeFields();
    } else {
       // If logged in, ensure text reflects current state (might already be correct)
       const isActive = btnEditModeToggle.dataset.active === 'true';
       btnEditModeToggle.textContent = `Edit Mode: ${isActive ? 'ON' : 'OFF'}`;
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
  // "Add New Recipe" button (NEW)
  const btnAddRecipe = document.getElementById('btnAddRecipe');
  if (btnAddRecipe) {
    btnAddRecipe.disabled = false;
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
    console.log(`Rendering item: ID=${recipe.id}, Name=${recipe.name || recipe.title}`);
    const li = document.createElement('li');
    li.classList.add('recipe-item');
    li.textContent = `${recipe.title || recipe.name || 'Unnamed Recipe'} v.${recipe.version}`;
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
      removeBtn.classList.add('remove-ingredient-btn', 'btn');
      removeBtn.textContent = 'Remove';
      removeBtn.style.marginTop = '5px';
      removeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const confirmed = confirm(`Remove global ingredient "${ingredient.name}"? This cannot be undone.`);
        if (confirmed) {
          try {
            const { error } = await supabaseClient
              .from('Ingredients')
              .delete()
              .eq('id', ingredient.id);
            if (error) throw error;
            showNotification('Ingredient removed successfully.', 'success');
            await reloadData();
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
  // setEditModeFields(); // Removed redundant call - already handled by toggle listener
}

/**
 * The 3-column recipe details view.
 * - Left: Current Ingredients (read-only)
 */
export async function showRecipeDetails(recipe) {
  console.log('Showing recipe details for:', recipe);
  console.log('Recipe object before showing details:', JSON.stringify(recipe, null, 2));

  const ingredientsView = document.getElementById('ingredientsView');
  if (ingredientsView) {
    ingredientsView.style.display = 'none';
  }

  const details = document.getElementById('recipeDetails');
  if (!details) {
    console.error('Recipe details container not found!');
    return;
  }
  details.innerHTML = '';
  details.style.display = 'block';

  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.gap = '20px';

  // LEFT COLUMN: Recipe Details
  const currentDiv = document.createElement('div');
  // Apply Flexbox styling for vertical distribution
  currentDiv.style.flex = '1';
  currentDiv.style.border = '1px solid #ccc';
  currentDiv.style.padding = '10px';
  currentDiv.style.display = 'flex';
  currentDiv.style.flexDirection = 'column';
  currentDiv.style.justifyContent = 'space-between'; // Pushes top and bottom content apart

  try {
    // Fetch ingredients from recipeingredients table with proper join
    const { data: ingredientsData, error: ingredientsError } = await supabaseClient
      .from('recipeingredients')
      .select('*, ingredients(*)')
      .eq('recipe_id', recipe.id)
      .order('name', { foreignTable: 'ingredients' }); // Correct syntax for ordering by joined table column
      if (ingredientsData && Array.isArray(ingredientsData)) {
        // Combine ingredient details with quantity/unit from the join table
        recipe.ingredients = ingredientsData.map(item => ({
          ...item.ingredients, // Spread ingredient details (id, name, description)
          quantity: item.quantity, // Add quantity from recipeingredients
          unit: item.unit,         // Add unit from recipeingredients
          notes: item.notes        // Add notes from recipeingredients (if exists)
        }));
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
function createEditableIngredientRow(ingredientData) {
  console.log('Creating editable row for:', JSON.stringify(ingredientData, null, 2));
  const row = document.createElement('tr');
  row.dataset.ingredientId = ingredientData.id || `new_${Date.now()}`;

  const fields = ['name', 'quantity', 'unit', 'notes'];
  fields.forEach(field => {
    const cell = document.createElement('td');
    cell.style.border = '1px solid #444';
    cell.style.padding = '8px';
    const input = document.createElement('input');
    input.dataset.field = field;
    input.placeholder = field.charAt(0).toUpperCase() + field.slice(1) + '?';
    if (field === 'quantity' || field === 'unit') {
      console.log(`Setting ${field} to:`, ingredientData[field]);
    }
    input.value = ingredientData[field] !== undefined ? ingredientData[field] : '';
    input.style.width = '100%';
    if (field === 'quantity') {
      input.type = 'number';
    }
    cell.appendChild(input);
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
  removeBtn.dataset.targetRowId = row.dataset.ingredientId;
  removeBtn.addEventListener('click', (e) => {
    e.target.closest('tr').remove();
    const table = e.target.closest('table');
    if (table && table.rows.length <= 1) {
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

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const inputs = row.querySelectorAll('input[data-field]');
    const ingredient = {
      id: row.dataset.ingredientId.startsWith('new_') ? undefined : row.dataset.ingredientId,
    };
    let isEmptyRow = true;
    inputs.forEach(input => {
      const field = input.dataset.field;
      const value = input.value.trim();
      if (value) {
        ingredient[field] = value;
        isEmptyRow = false;
      }
    });
    if (!isEmptyRow) {
      if (!ingredient.name) {
        alert(`Ingredient in row ${i} is missing a name.`);
        return;
      }
      updatedIngredients.push(ingredient);
    }
  }

  console.log("Updated ingredients data:", updatedIngredients);

  try {
    const newVersion = (currentRecipe.version || 0) + 1; // Ensure version exists, default to 0 if not
    const { error } = await supabaseClient
      .from('recipes')
      .update({ ingredients: updatedIngredients, version: newVersion })
      .eq('id', currentRecipe.id);

    if (error) throw error;

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
  alert('AI Suggestions feature coming soon!');
}

/**
 * Updates a single property of an ingredient (Not used in the new iteration flow).
 */
async function doUpdateIngredient(ingObj, prop, newValue) {
  console.warn('doUpdateIngredient called - consider removing if commit handles all updates.');
  try {
    const { data, error } = await supabaseClient
      .from('Ingredients')
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

  // --- Theme Toggle Button Logic ---
  // Theme Toggle
  // Theme Toggle
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  if (btnThemeToggle) {
    // Function to apply theme based on value ('dark', 'light', 'system')
    const applyTheme = (themeValue) => {
      let themeClass = themeValue;
      if (themeValue === 'system') {
        themeClass = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.body.className = themeClass; // Set body class
      console.log('Theme applied:', themeClass, '(Source:', themeValue, ')');
    };

    // Initial theme setup on load
    const initialTheme = btnThemeToggle.dataset.theme || 'dark'; // Default to dark if unset
    btnThemeToggle.dataset.theme = initialTheme; // Ensure data attribute is set
    btnThemeToggle.textContent = `Theme: ${initialTheme.charAt(0).toUpperCase() + initialTheme.slice(1)}`;
    applyTheme(initialTheme);

    // Event listener for clicks
    btnThemeToggle.addEventListener('click', () => {
      const currentTheme = btnThemeToggle.dataset.theme;
      let nextTheme;

      // Cycle through themes: dark -> light -> system -> dark
      if (currentTheme === 'dark') {
        nextTheme = 'light';
      } else if (currentTheme === 'light') {
        nextTheme = 'system';
      } else { // currentTheme === 'system'
        nextTheme = 'dark';
      }

      // Update button state and apply theme
      btnThemeToggle.dataset.theme = nextTheme;
      btnThemeToggle.textContent = `Theme: ${nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1)}`;
      applyTheme(nextTheme);
    });
  } else {
    console.error('initUI: btnThemeToggle not found');
  }

  const btnEditModeToggle = document.getElementById('btnEditModeToggle');
  if (btnEditModeToggle) {
    btnEditModeToggle.addEventListener('click', () => {
      // Toggle the active state
      const currentState = btnEditModeToggle.dataset.active === 'true';
      const newState = !currentState;
      btnEditModeToggle.dataset.active = newState.toString(); // Store as string 'true' or 'false'
      btnEditModeToggle.textContent = `Edit Mode: ${newState ? 'ON' : 'OFF'}`;

      // Update UI fields based on the new state
      setEditModeFields();

      // Reload data if necessary (e.g., to show/hide remove buttons)
      const activeDetails = document.getElementById('recipeDetails');
      const activeIngredients = document.getElementById('ingredientsView');
      if (activeDetails && activeDetails.style.display !== 'none') {
        // If recipe details are showing, might need a more specific update than reloadData()
        console.warn("Re-rendering recipe details on edit mode toggle might be needed.");
        // Potentially call showRecipeDetails again if elements need adding/removing
      } else if (activeIngredients && activeIngredients.style.display !== 'none') {
        // If ingredients list is showing, reload to add/remove buttons
        reloadData();
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

  // Remove old recipe input listener since the textbox is removed.
  // Instead, add a click listener for the new large plus button to create a recipe.
  const btnAddRecipe = document.getElementById('btnAddRecipe');
  if (btnAddRecipe) {
    btnAddRecipe.addEventListener('click', async () => {
      const recipeName = prompt('Enter the name for the new recipe:');
      if (recipeName && recipeName.trim()) {
        try {
          await createNewRecipe(recipeName.trim());
          showNotification(`Recipe "${recipeName.trim()}" created!`, 'success');
          await reloadData();
        } catch (error) {
          alert("Error creating recipe: " + error.message);
          console.error('Error creating recipe:', error);
        }
      } else if (recipeName !== null) {
        showNotification('Recipe name cannot be empty.', 'error');
      }
    });
  }

  const btnAddGlobalIngredient = document.getElementById('btnAddGlobalIngredient');
  if (btnAddGlobalIngredient) {
    btnAddGlobalIngredient.addEventListener('click', () => {
      if (!isEditMode()) {
        alert('Please enable Edit Mode to add ingredients.');
        return;
      }
      const ingredientName = prompt('Enter the name for the new global ingredient:');
      if (ingredientName && ingredientName.trim() !== '') {
        addGlobalIngredient(ingredientName.trim());
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
        recipeDetails.style.display = 'none';
      }
      const ingredientsView = document.getElementById('ingredientsView');
      if (ingredientsView) {
        ingredientsView.style.display = 'block';
      }
    });
  } else {
    console.error('initUI: btnIngredients not found');
  }

  reloadData();
}

/**
 * Creates a new recipe.
 */

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
    await reloadData();
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
    console.log('Recipes loaded in reloadData, about to render:', JSON.stringify(recipes)); // Added log
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
  const statusDiv = document.getElementById('statusMessages');
  if (!statusDiv) {
    console.error('Status message container not found!');
    // Fallback to alert if the div isn't there for some reason
    alert(`${type.toUpperCase()}: ${message}`);
    return;
  }

  // Set message and style based on type
  statusDiv.textContent = message;
  statusDiv.className = `status-messages ${type}`; // Add type as a class (e.g., 'success', 'error') for styling

  // Clear any existing timeout to prevent overlaps
  if (statusDiv.timeoutId) {
    clearTimeout(statusDiv.timeoutId);
  }

  // Make message visible
  statusDiv.style.opacity = 1;
  statusDiv.style.display = 'block'; // Ensure it's visible

  // Set timeout to fade out after 3 seconds
  statusDiv.timeoutId = setTimeout(() => {
    statusDiv.style.opacity = 0;
    // Optionally hide it completely after fade out
    // setTimeout(() => { statusDiv.style.display = 'none'; }, 500); // 500ms matches typical transition duration
    statusDiv.timeoutId = null; // Clear the stored timeout ID
  }, 3000); // 3000 milliseconds = 3 seconds
}

// Expose necessary functions to global scope
window.DIYRecipeApp = {
  initUI,
  showRecipeDetails,
  renderRecipes,
  renderIngredients,
  updateAuthButton,
  isEditMode,
  reloadData
};
