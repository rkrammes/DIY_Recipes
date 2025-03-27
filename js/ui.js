// ui.js

import { supabaseClient } from './supabaseClient.js';
import { sendMagicLink, signOut } from './auth.js';

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
      editCheckbox.checked = false;
    }
  }
}

/**
 * Enables or disables fields that depend on edit mode.
 */
function setEditModeFields() {
  // "Add New Recipe" input
  const newRecipeInput = document.getElementById('newRecipeNameInput');
  if (newRecipeInput) {
    newRecipeInput.disabled = !isEditMode();
  }

  // "Add New Ingredient" input
  const newGlobalIngredientInput = document.getElementById('newGlobalIngredientInput');
  if (newGlobalIngredientInput) {
    newGlobalIngredientInput.disabled = !isEditMode();
  }

  // "Add Ingredient" button in All Ingredients view
  const btnAddGlobalIngredient = document.getElementById('btnAddGlobalIngredient');
  if (btnAddGlobalIngredient) {
    btnAddGlobalIngredient.disabled = !isEditMode();
  }
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
      isLoggedIn = false;
      updateAuthButton();
      if (magicLinkForm) {
        magicLinkForm.style.display = 'none';
      }
      console.log('User logged out.');
    }).catch((error) => {
      console.error('Error during sign out:', error);
    });
  }
}

/**
 * Sends a magic link, then sets isLoggedIn = true for demonstration.
 */
function setupMagicLink() {
  const btnSendMagicLink = document.getElementById('btnSendMagicLink');
  if (btnSendMagicLink) {
    btnSendMagicLink.addEventListener('click', async () => {
      const emailInput = document.getElementById('magicLinkEmail');
      if (emailInput && emailInput.value) {
        try {
          await sendMagicLink(emailInput.value);
          // Wait for the user to log in via the magic link.
          alert('A magic link has been sent to your email. Please check your inbox to log in.');
          // Do not set isLoggedIn to true here.
          updateAuthButton();
          setEditModeFields();
          const magicLinkForm = document.getElementById('magicLinkForm');
          if (magicLinkForm) {
            magicLinkForm.style.display = 'none';
          }
          console.log('User logged in via magic link (demo).');
        } catch (error) {
          console.error('Error sending magic link:', error);
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
 * => Attaches .recipe-item and click => showRecipeDetails(recipe)
 */
export function renderRecipes(recipes) {
  console.log('Rendering recipes:', recipes); // Log the recipes being rendered
  const container = document.getElementById('recipeList');
  console.log('Parent container styles:', getComputedStyle(container.parentElement)); // Log computed styles of the parent container
  console.log('Recipe list dimensions:', container.getBoundingClientRect()); // Log dimensions of the recipe list
  console.log('Parent container dimensions:', container.parentElement.getBoundingClientRect()); // Log dimensions of the parent container
  console.log('Computed styles for recipeList:', getComputedStyle(container)); // Log computed styles
  if (!container) {
    console.error('No container found with id "recipeList"');
    return;
  }
  container.innerHTML = '';

  console.log('Fetched recipes:', recipes); // Log the fetched recipes
  recipes.forEach(recipe => {
  console.log('Appending recipe:', recipe.name); // Log each recipe being appended
      const li = document.createElement('li');
      console.log('Created li for recipe:', recipe.name); // Log each li created
      li.classList.add('recipe-item');
      li.textContent = recipe.name || 'Unnamed Recipe';

      // Remove button creation and event listener

      // Clicking calls showRecipeDetails
      li.addEventListener('click', () => {
          showRecipeDetails(recipe);
      });

      // li.appendChild(removeBtn); // Removed: removeBtn is not defined here
      container.appendChild(li); // Append the li to the container
      console.log('Appended li to recipeList:', li); // Log the appended li element
  });
}

/**
 * Renders a list of ingredients into the <ul id="ingredientList"> element.
 * => uses .ingredient-item for standard gradient styling
 */
export function renderIngredients(ingredients) {
  const container = document.getElementById('ingredientList');
  if (!container) {
    console.error('No container found with id "ingredientList"');
    return;
  }
  container.innerHTML = '';
  console.log('Recipe list inner HTML after appending:', container.innerHTML); // Log the inner HTML after appending
  console.log('Current recipe list HTML:', container.innerHTML); // Log the current HTML of the recipe list

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

    if (isEditMode()) {
      const removeBtn = document.createElement('button');
      removeBtn.classList.add('remove-ingredient-btn');
      removeBtn.textContent = 'Remove';
      removeBtn.style.marginTop = '5px';
      removeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const confirmed = confirm(`Remove ingredient "${ingredient.name}"?`);
        if (confirmed) {
          try {
            const { error } = await supabaseClient
              .from('Ingredients')
              .delete()
              .eq('id', ingredient.id);
            if (error) {
              showNotification('Error removing ingredient.', 'error');
            } else {
              showNotification('Ingredient removed successfully.', 'success');
              await reloadData();
            }
          } catch (err) {
            showNotification('Error removing ingredient.', 'error');
          }
        }
      });
      div.appendChild(removeBtn);
    }

    container.appendChild(div);
  });
}

/**
 * The 3-column recipe details:
 * - Left: plain-text ingredients
 * - Center: Next Iteration + "Commit" pinned
 * - Right: editable placeholders
 */
export function showRecipeDetails(recipe) {
  const ingredientsView = document.getElementById('ingredientsView');
  if (ingredientsView) {
    ingredientsView.style.display = 'none';
  }

  const details = document.getElementById('recipeDetails');
  const removeBtn = document.createElement('button');
  removeBtn.classList.add('remove-recipe-btn');
  removeBtn.textContent = 'Remove';
  removeBtn.style.marginTop = '10px';
  removeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const confirmed = confirm(`Remove recipe "${recipe.name}"?`);
      if (confirmed) {
          try {
              const { error } = await supabaseClient
                  .from('All_Recipes')
                  .delete()
                  .eq('id', recipe.id);
              if (error) {
                  showNotification('Error removing recipe.', 'error');
              } else {
                  showNotification('Recipe removed successfully.', 'success');
                  await reloadData();
              }
          } catch (err) {
              showNotification('Error removing recipe.', 'error');
          }
      }
  });
  details.appendChild(removeBtn); // Append the Remove button to the recipe details
  if (!details) return;
  details.style.display = 'block';
  details.innerHTML = '';

  // Create a container with three columns
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.gap = '20px';

  // LEFT COLUMN: plain text
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
    // If no ingredients, just show the message without changing theme
    currentDiv.innerHTML += '<p>No ingredients available.</p>';
  }

  // CENTER COLUMN: Next Iteration
  const nextDiv = document.createElement('div');
  nextDiv.style.flex = '1';
  nextDiv.style.border = '1px solid #ccc';
  nextDiv.style.padding = '10px';

  const iterationHeader = document.createElement('div');
  iterationHeader.style.display = 'flex';
  iterationHeader.style.justifyContent = 'space-between';
  iterationHeader.style.alignItems = 'center';
  iterationHeader.style.marginBottom = '10px';

  const heading = document.createElement('h3');
  heading.textContent = 'Next Iteration';
  iterationHeader.appendChild(heading);

  const commitBtn = document.createElement('button');
  commitBtn.textContent = 'Commit';
  commitBtn.classList.add('btn');
  commitBtn.disabled = !isEditMode();
  commitBtn.addEventListener('click', async () => {
    doCommit();
  });
  iterationHeader.appendChild(commitBtn);

  nextDiv.appendChild(iterationHeader);

  const nextTextarea = document.createElement('textarea');
  nextTextarea.style.width = '100%';
  nextTextarea.style.height = '150px';
  nextTextarea.value = recipe.next_iteration || '';
  nextTextarea.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doCommit();
    }
  });
  nextDiv.appendChild(nextTextarea);

  const aiInput = document.createElement('input');
  aiInput.id = 'aiPrompt';
  aiInput.placeholder = 'Get AI Suggestion';
  aiInput.disabled = !isEditMode();
  aiInput.style.display = 'block';
  aiInput.style.marginTop = '10px';
  aiInput.style.width = '100%';
  aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doAISuggestion(aiInput.value, recipe);
    }
  });
  nextDiv.appendChild(aiInput);

  const suggestionDiv = document.createElement('div');
  suggestionDiv.id = 'aiSuggestionText';
  suggestionDiv.style.marginTop = '10px';
  nextDiv.appendChild(suggestionDiv);

  // RIGHT COLUMN: Editable placeholders
  const editableDiv = document.createElement('div');
  editableDiv.style.flex = '1';
  editableDiv.style.border = '1px solid #ccc';
  editableDiv.style.padding = '10px';

  const editHeading = document.createElement('h3');
  editHeading.textContent = 'Editable Table';
  editableDiv.appendChild(editHeading);

  if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
    const editTable = document.createElement('table');
    editTable.style.width = '100%';
    editTable.style.borderCollapse = 'collapse';

    // Header row
    const editHeaderRow = document.createElement('tr');
    ['Ingredient', 'Quantity', 'Unit', 'Notes'].forEach(txt => {
      const th = document.createElement('th');
      th.textContent = txt;
      th.style.padding = '8px';
      th.style.border = '1px solid #444';
      editHeaderRow.appendChild(th);
    });
    editTable.appendChild(editHeaderRow);

    recipe.ingredients.forEach(ing => {
      const row = document.createElement('tr');

      // Ingredient name cell
      const nameCell = document.createElement('td');
      nameCell.style.border = '1px solid #444';
      nameCell.style.padding = '8px';
      const nameInput = document.createElement('input');
      nameInput.disabled = !isEditMode();
      nameInput.placeholder = ing.name || 'Name?';
      nameInput.style.width = '100%';
      nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          doUpdateIngredient(ing, 'name', nameInput.value);
        }
      });
      nameCell.appendChild(nameInput);
      row.appendChild(nameCell);

      // Quantity cell
      const qtyCell = document.createElement('td');
      qtyCell.style.border = '1px solid #444';
      qtyCell.style.padding = '8px';
      const qtyInput = document.createElement('input');
      qtyInput.disabled = !isEditMode();
      qtyInput.placeholder = ing.quantity ? String(ing.quantity) : 'Qty?';
      qtyInput.style.width = '100%';
      qtyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          doUpdateIngredient(ing, 'quantity', qtyInput.value);
        }
      });
      qtyCell.appendChild(qtyInput);
      row.appendChild(qtyCell);

      // Unit cell
      const unitCell = document.createElement('td');
      unitCell.style.border = '1px solid #444';
      unitCell.style.padding = '8px';
      const unitInput = document.createElement('input');
      unitInput.disabled = !isEditMode();
      unitInput.placeholder = ing.unit || 'Unit?';
      unitInput.style.width = '100%';
      unitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          doUpdateIngredient(ing, 'unit', unitInput.value);
        }
      });
      unitCell.appendChild(unitInput);
      row.appendChild(unitCell);

      // Notes cell
      const notesCell = document.createElement('td');
      notesCell.style.border = '1px solid #444';
      notesCell.style.padding = '8px';
      const notesInput = document.createElement('input');
      notesInput.disabled = !isEditMode();
      notesInput.placeholder = ing.notes || 'Notes?';
      notesInput.style.width = '100%';
      notesInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          doUpdateIngredient(ing, 'notes', notesInput.value);
        }
      });
      notesCell.appendChild(notesInput);
      row.appendChild(notesCell);

      editTable.appendChild(row);
    });

    editableDiv.appendChild(editTable);
  } else {
    // If no ingredients, just show the message without changing theme
    const noIng = document.createElement('p');
    noIng.textContent = 'No ingredients to edit.';
    editableDiv.appendChild(noIng);
  }

  container.appendChild(currentDiv);
  container.appendChild(nextDiv);
  container.appendChild(editableDiv);

  details.innerHTML = '';
  details.appendChild(container);

  async function doCommit() {
    try {
      const { error } = await supabaseClient
        .from('All_Recipes')
        .update({ next_iteration: nextTextarea.value })
        .eq('id', recipe.id);
      if (error) {
        showNotification('Error committing next iteration.', 'error');
      } else {
        // On successful commit, just show notification and reload
        showNotification('Next iteration committed!', 'success');
        await reloadData();
      }
    } catch (err) {
      showNotification('Error committing next iteration.', 'error');
    }
  }

  async function doAISuggestion(promptValue, recipeObj) {
    try {
      const response = await fetch('/api/ai-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe: recipeObj,
          userPrompt: promptValue
        })
      });
      const data = await response.json();
      if (data.suggestion) {
        suggestionDiv.textContent = data.suggestion;
      } else {
        suggestionDiv.textContent = 'No suggestion returned.';
      }
    } catch (error) {
      suggestionDiv.textContent = 'Error getting suggestion.';
    }
  }

  async function doUpdateIngredient(ingObj, prop, newValue) {
    try {
      const { data, error } = await supabaseClient
        .from('Ingredients')
        .update({ [prop]: newValue })
        .eq('id', ingObj.id)
        .select();
      if (error) {
        showNotification(`Error updating ${prop} for ${ingObj.name}.`, 'error');
      } else {
        showNotification(`Updated ${prop} for ${ingObj.name}.`, 'success');
        console.log('Updated row:', data);
        await reloadData();
      }
    } catch (err) {
      showNotification(`Error updating ${prop}.`, 'error');
    }
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

    if (event === 'SIGNED_IN') {
      isLoggedIn = true;
      console.log('User signed in.');
      if (magicLinkForm) magicLinkForm.style.display = 'none'; // Hide form on login
    } else if (event === 'SIGNED_OUT') {
      isLoggedIn = false;
      console.log('User signed out.');
      // Optionally show login form on logout, or handle as needed
      // if (magicLinkForm) magicLinkForm.style.display = 'block';
    }
    // For INITIAL_SESSION, session might be null or contain the session
    if (event === 'INITIAL_SESSION') {
        isLoggedIn = !!session; // Set based on initial session presence
        console.log('Initial session processed. Logged in:', isLoggedIn);
    }

    // Update UI based on new login state
    updateAuthButton();
    setEditModeFields(); // Ensure edit fields reflect login status
  });


  // 2) Initial UI setup (Theme, Checkbox, Buttons etc.)
  // Note: Auth button and edit fields are now handled by onAuthStateChange listener

  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    // Set initial theme based on the user's system preference
    const initialTheme = themeSelect.value;
    if (initialTheme === 'system') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.className = 'dark';
      } else {
        document.body.className = 'light';
      }
    } else {
      document.body.className = initialTheme;
    }

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
        console.log('Current body class:', document.body.className);
        
        // Ensure sections are displayed correctly based on the theme
        const ingredientsView = document.getElementById('ingredientsView');
        const recipeDetails = document.getElementById('recipeDetails');
        if (ingredientsView) {
            ingredientsView.style.display = 'block'; // Show ingredients view
        }
        if (recipeDetails) {
            recipeDetails.style.display = 'block'; // Show recipe details
        }
    });
  }

  const editCheckbox = document.getElementById('editModeCheckbox');
  if (editCheckbox) {
    editCheckbox.checked = window.editMode || false;
    editCheckbox.disabled = !isLoggedIn;
    editCheckbox.addEventListener('change', () => {
      window.editMode = editCheckbox.checked;
      setEditModeFields();
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

  // "Add New Ingredient" input triggers creation on Enter
  const newGlobalIngredientInput = document.getElementById('newGlobalIngredientInput');
  if (newGlobalIngredientInput) {
    newGlobalIngredientInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isEditMode() && newGlobalIngredientInput.value.trim() !== '') {
          createNewGlobalIngredient(newGlobalIngredientInput.value.trim());
          newGlobalIngredientInput.value = '';
        }
      }
    });
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

  // "Add Ingredient" button prompts for name and creates
  const btnAddGlobalIngredient = document.getElementById('btnAddGlobalIngredient');
  if (btnAddGlobalIngredient) {
    // Initially disable if not in edit mode (will be updated by setEditModeFields)
    btnAddGlobalIngredient.disabled = !isEditMode();

    btnAddGlobalIngredient.addEventListener('click', () => {
      if (!isEditMode()) {
        alert('Please enable Edit Mode to add ingredients.');
        return;
      }
      const ingredientName = prompt('Enter the name for the new ingredient:');
      if (ingredientName && ingredientName.trim() !== '') {
        // Call the existing function to create the ingredient
        createNewGlobalIngredient(ingredientName.trim());
      } else if (ingredientName !== null) { // Avoid alert if user cancelled prompt
        alert('Ingredient name cannot be empty.');
      }
    });
  } else {
    console.error('initUI: btnAddGlobalIngredient not found');
  }
}

async function createNewRecipe(recipeName) {
  console.log('Creating new recipe:', recipeName);
  try {
    const { error } = await supabaseClient
      .from('All_Recipes')
      .insert({ name: recipeName, ingredients: [] });
    if (error) {
      showNotification('Error creating recipe.', 'error');
    } else {
      showNotification('New recipe created.', 'success');
      await reloadData();
    }
  } catch (err) {
    showNotification('Error creating recipe.', 'error');
  }
}

async function createNewGlobalIngredient(ingredientName) {
  console.log('Creating new global ingredient:', ingredientName);
  try {
    const { error } = await supabaseClient
      .from('Ingredients')
      .insert({ name: ingredientName, description: '' });
    if (error) {
      showNotification('Error creating ingredient.', 'error');
    } else {
      showNotification('New ingredient created.', 'success');
      await reloadData();
    }
  } catch (err) {
    showNotification('Error creating ingredient.', 'error');
  }
}

async function fetchData() {
console.log('Reloading data...'); // Log when reloading data starts
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
    }
  }
}

function showNotification(message, type) {
  alert(`${type.toUpperCase()}: ${message}`);
}

// Attach login/logout event on page load
updateAuthButton();

// Expose exported functions on window.module for backward compatibility
window.module = {
  showRecipeDetails,
  initUI,
  renderRecipes,
  renderIngredients,
  updateAuthButton,
  isEditMode
};