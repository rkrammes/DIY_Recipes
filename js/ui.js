/* ui.js */

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
          // For demonstration, assume user is logged in immediately:
          isLoggedIn = true;
          updateAuthButton();
          setEditModeFields(); // re-check after logging in
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
 * Show recipe details in THREE columns (unchanged).
 */
export function showRecipeDetails(recipe) {
  // ... your existing 3-column logic, doCommit, doAISuggestion, doUpdateIngredient ...
}

/**
 * Renders a list of recipes into the <ul id="recipeList"> element.
 * => Restores the .recipe-item class & click listener for each <li>.
 */
export function renderRecipes(recipes) {
  const container = document.getElementById('recipeList');
  if (!container) {
    console.error('No container found with id "recipeList"');
    return;
  }
  container.innerHTML = '';

  recipes.forEach(recipe => {
    // Make sure we add .recipe-item for gradient styling & attach the click event
    const li = document.createElement('li');
    li.classList.add('recipe-item');  // ensures gradient styling & pointer
    li.textContent = recipe.name || 'Unnamed Recipe';

    // Clicking calls showRecipeDetails
    li.addEventListener('click', () => {
      showRecipeDetails(recipe);
    });

    container.appendChild(li);
  });
}

/**
 * Renders a list of ingredients into the <ul id="ingredientList"> element.
 * => Now uses .ingredient-item for standard styling
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
 * Initializes UI elements and event listeners.
 */
export function initUI() {
  async function setup() {
    console.log('initUI: setup started');

    // 1) On page load, try checking for an existing session
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      if (session) {
        console.log('Session found on load, user is logged in.');
        isLoggedIn = true;
      } else {
        console.log('No existing session found, user not logged in.');
      }
    } catch (err) {
      console.error('Error checking session on load:', err);
    }

    // 2) Now that we might have updated isLoggedIn, update UI
    updateAuthButton();
    setEditModeFields();

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
  updateAuthButton,
  isEditMode
};