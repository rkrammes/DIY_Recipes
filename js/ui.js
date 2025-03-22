/* ui.js */

import { supabaseClient } from './supabaseClient.js';
import { sendMagicLink, signOut } from './auth.js';

// Global login state
let isLoggedIn = false;

/**
 * Checks if edit mode is active.
 */
function isEditMode() {
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
    // Enable edit mode checkbox only when logged in
    editCheckbox.disabled = !isLoggedIn;
    if (!isLoggedIn) {
      editCheckbox.checked = false;
    }
  }
}

/**
 * Handles the login/logout button click.
 */
function handleLoginButtonClick() {
  const magicLinkForm = document.getElementById('magicLinkForm');
  if (!isLoggedIn) {
    if (magicLinkForm) {
      magicLinkForm.style.display = 'block';
    }
  } else {
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
 * Sets up the "Send Magic Link" button event.
 */
function setupMagicLink() {
  const btnSendMagicLink = document.getElementById('btnSendMagicLink');
  if (btnSendMagicLink) {
    btnSendMagicLink.addEventListener('click', async () => {
      const emailInput = document.getElementById('magicLinkEmail');
      if (emailInput && emailInput.value) {
        try {
          await sendMagicLink(emailInput.value);
          isLoggedIn = true;
          updateAuthButton();
          const magicLinkForm = document.getElementById('magicLinkForm');
          if (magicLinkForm) {
            magicLinkForm.style.display = 'none';
          }
          console.log('User logged in via magic link.');
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
 * Show recipe details in THREE columns:
 * 1) Left: plain-text list of current ingredients
 * 2) Center: Next Iteration (textarea + "Commit" button pinned top-right)
 * 3) Right: editable table with placeholders from current recipe
 */
export function showRecipeDetails(recipe) {
  // Hide the global ingredients view
  const ingredientsView = document.getElementById('ingredientsView');
  if (ingredientsView) {
    ingredientsView.style.display = 'none';
  }

  // Show recipe details section
  const details = document.getElementById('recipeDetails');
  if (!details) return;
  details.style.display = 'block';
  details.innerHTML = '';

  // Create container with THREE columns
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.gap = '20px';

  // =========================
  // 1) LEFT COLUMN: plain-text ingredients
  // =========================
  const currentDiv = document.createElement('div');
  currentDiv.style.flex = '1';
  currentDiv.style.border = '1px solid #ccc';
  currentDiv.style.padding = '10px';

  const currentHeading = document.createElement('h3');
  currentHeading.textContent = 'Current Ingredients';
  currentDiv.appendChild(currentHeading);

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
    const noIng = document.createElement('p');
    noIng.textContent = 'No ingredients available.';
    currentDiv.appendChild(noIng);
  }

  // =========================
  // 2) CENTER COLUMN: Next Iteration
  // =========================
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
  commitBtn.addEventListener('click', () => {
    doCommit();
  });
  iterationHeader.appendChild(commitBtn);

  nextDiv.appendChild(iterationHeader);

  // Next Iteration textarea
  const nextTextarea = document.createElement('textarea');
  nextTextarea.style.width = '100%';
  nextTextarea.style.height = '150px';
  nextTextarea.value = recipe.next_iteration || '';
  nextTextarea.addEventListener('keypress', (e) => {
    onEnterKey(e, () => doCommit());
  });
  nextDiv.appendChild(nextTextarea);

  // "Get AI Suggestion" input
  const aiInput = document.createElement('input');
  aiInput.id = 'aiPrompt';
  aiInput.placeholder = 'Get AI Suggestion';
  aiInput.disabled = !isEditMode();
  aiInput.style.display = 'block';
  aiInput.style.marginTop = '10px';
  aiInput.style.width = '100%';
  aiInput.addEventListener('keypress', (e) => {
    onEnterKey(e, () => doAISuggestion(aiInput.value, recipe));
  });
  nextDiv.appendChild(aiInput);

  const suggestionDiv = document.createElement('div');
  suggestionDiv.id = 'aiSuggestionText';
  suggestionDiv.style.marginTop = '10px';
  nextDiv.appendChild(suggestionDiv);

  // =========================
  // 3) RIGHT COLUMN: Editable table placeholders
  // =========================
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

    // For each ingredient, create a row with placeholders
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
        onEnterKey(e, () => doUpdateIngredient(ing, 'name', nameInput.value));
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
        onEnterKey(e, () => doUpdateIngredient(ing, 'quantity', qtyInput.value));
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
        onEnterKey(e, () => doUpdateIngredient(ing, 'unit', unitInput.value));
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
        onEnterKey(e, () => doUpdateIngredient(ing, 'notes', notesInput.value));
      });
      notesCell.appendChild(notesInput);
      row.appendChild(notesCell);

      editTable.appendChild(row);
    });

    editableDiv.appendChild(editTable);
  } else {
    const noIng = document.createElement('p');
    noIng.textContent = 'No ingredients to edit.';
    editableDiv.appendChild(noIng);
  }

  container.appendChild(currentDiv);
  container.appendChild(nextDiv);
  container.appendChild(editableDiv);

  details.innerHTML = '';
  details.appendChild(container);

  // Action to commit next iteration
  async function doCommit() {
    try {
      const { error } = await supabaseClient
        .from('All_Recipes')
        .update({ next_iteration: nextTextarea.value })
        .eq('id', recipe.id);
      if (error) {
        showNotification('Error committing next iteration.', 'error');
      } else {
        showNotification('Next iteration committed!', 'success');
        await reloadData();
      }
    } catch (err) {
      showNotification('Error committing next iteration.', 'error');
    }
  }

  // Action to fetch AI suggestion
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

  // Action to update an ingredient property
  async function doUpdateIngredient(ingObj, prop, newValue) {
    try {
      // For demonstration, we only update this single property in the DB
      const updatedIng = { ...ingObj, [prop]: newValue };
      // In real usage, you'd likely update the entire "ingredients" array for the recipe
      // or store each ingredient separately in DB. Example approach:
      const { data, error } = await supabaseClient
        .from('Ingredients')
        .update({ [prop]: newValue })
        .eq('id', ingObj.id)
        .select();
      if (error) {
        showNotification(`Error updating ingredient ${ingObj.name}.`, 'error');
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
 * Renders a list of recipes into the existing <ul id="recipeList"> element.
 */
export function renderRecipes(recipes) {
  const container = document.getElementById('recipeList');
  if (!container) {
    console.error('No container found with id "recipeList"');
    return;
  }
  container.innerHTML = '';
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
 * Renders a list of ingredients into the existing <ul id="ingredientList"> element.
 * Each ingredient is rendered as a button that toggles its description,
 * and, if in edit mode, shows a Remove button.
 */
export function renderIngredients(ingredients) {
  const container = document.getElementById('ingredientList');
  if (!container) {
    console.error('No container found with id "ingredientList"');
    return;
  }
  container.innerHTML = '';
  ingredients.forEach(ingredient => {
    const div = document.createElement('div');
    div.classList.add('ingredient-container');
    div.style.marginBottom = '10px';

    const nameBtn = document.createElement('button');
    nameBtn.classList.add('ingredient-button');
    nameBtn.textContent = ingredient.name || 'Unnamed Ingredient';
    nameBtn.style.width = '100%';
    nameBtn.style.textAlign = 'left';

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
 * Initializes UI elements and event listeners.
 */
export function initUI() {
  function setup() {
    console.log('initUI: setup started');

    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
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
      });
    }

    const editCheckbox = document.getElementById('editModeCheckbox');
    if (editCheckbox) {
      editCheckbox.checked = window.editMode || false;
      editCheckbox.disabled = !isLoggedIn;
      editCheckbox.addEventListener('change', () => {
        window.editMode = editCheckbox.checked;
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
}

/**
 * Creates a new recipe in the DB (example stub).
 */
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

/**
 * Creates a new global ingredient in the DB (example stub).
 */
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

/**
 * Reload data (stub).
 */
async function reloadData() {
  console.log('Data reloaded.');
}

/**
 * Show notification (stub).
 */
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
  updateAuthButton
};