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
 * If not logged in, displays the magic link form.
 * If logged in, logs the user out.
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
          // Assume login is immediate for demonstration
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
 * Displays detailed information for a given recipe.
 * "Commit" button is now on the same row as "Next Iteration" heading, pinned right.
 * The AI prompt and "Get AI Suggestion" remain pinned bottom-right in the same column.
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

  // Create a container with two columns
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.gap = '20px';

  // LEFT COLUMN: Current Ingredients (table format)
  const currentDiv = document.createElement('div');
  currentDiv.style.flex = '1';
  currentDiv.style.border = '1px solid #ccc';
  currentDiv.style.padding = '10px';
  currentDiv.innerHTML = `<h3>Current Ingredients</h3>`;

  if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    // Header row
    const headerRow = document.createElement('tr');
    const headers = ['Ingredient', 'Quantity', 'Unit', 'Notes'];
    headers.forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      th.style.padding = '8px';
      th.style.border = '1px solid #444';
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Rows for each ingredient
    recipe.ingredients.forEach(ing => {
      const row = document.createElement('tr');
      [ing.name, ing.quantity, ing.unit, ing.notes].forEach(val => {
        const td = document.createElement('td');
        td.textContent = val || '';
        td.style.padding = '8px';
        td.style.border = '1px solid #444';
        row.appendChild(td);
      });
      table.appendChild(row);
    });
    currentDiv.appendChild(table);
  } else {
    currentDiv.innerHTML += '<p>No ingredients available.</p>';
  }

  // RIGHT COLUMN: Next Iteration
  const nextDiv = document.createElement('div');
  nextDiv.style.flex = '1';
  nextDiv.style.border = '1px solid #ccc';
  nextDiv.style.padding = '10px';

  // A row for "Next Iteration" heading on left, "Commit" button on right
  const iterationHeader = document.createElement('div');
  iterationHeader.style.display = 'flex';
  iterationHeader.style.justifyContent = 'space-between';
  iterationHeader.style.alignItems = 'center';
  iterationHeader.style.marginBottom = '10px';

  // Heading
  const heading = document.createElement('h3');
  heading.textContent = 'Next Iteration';
  iterationHeader.appendChild(heading);

  // "Commit" button pinned right
  const commitBtn = document.createElement('button');
  commitBtn.textContent = 'Commit';
  commitBtn.classList.add('btn');
  commitBtn.disabled = !isEditMode();
  commitBtn.addEventListener('click', async () => {
    try {
      const nextTextareaValue = nextTextarea.value;
      const { error } = await supabaseClient
        .from('All_Recipes')
        .update({ next_iteration: nextTextareaValue })
        .eq('id', recipe.id);
      if (error) {
        showNotification('Error committing next iteration.', 'error');
      } else {
        showNotification('Next iteration committed!', 'success');
        await reloadData();
      }
    } catch (error) {
      showNotification('Error committing next iteration.', 'error');
    }
  });
  iterationHeader.appendChild(commitBtn);

  nextDiv.appendChild(iterationHeader);

  // Textarea for next iteration content
  const nextTextarea = document.createElement('textarea');
  nextTextarea.style.width = '100%';
  nextTextarea.style.height = '150px';
  nextTextarea.value = recipe.next_iteration || '';
  nextDiv.appendChild(nextTextarea);

  // A pinned row for AI prompt & "Get AI Suggestion" button at bottom right
  const pinnedRow = document.createElement('div');
  pinnedRow.style.display = 'flex';
  pinnedRow.style.justifyContent = 'flex-end';
  pinnedRow.style.alignItems = 'center';
  pinnedRow.style.gap = '10px';
  pinnedRow.style.marginTop = '10px';

  // AI prompt input
  const aiInput = document.createElement('input');
  aiInput.id = 'aiPrompt';
  aiInput.placeholder = 'Enter prompt for AI suggestion';
  aiInput.disabled = !isEditMode();

  // AI Suggestion button
  const aiBtn = document.createElement('button');
  aiBtn.textContent = 'Get AI Suggestion';
  aiBtn.classList.add('btn');
  aiBtn.disabled = !isEditMode();
  aiBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/ai-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe: recipe,
          userPrompt: aiInput.value
        })
      });
      const data = await response.json();
      const suggestionDiv = document.getElementById('aiSuggestionText');
      if (data.suggestion) {
        suggestionDiv.textContent = data.suggestion;
      } else {
        suggestionDiv.textContent = 'No suggestion returned.';
      }
    } catch (error) {
      const suggestionDiv = document.getElementById('aiSuggestionText');
      suggestionDiv.textContent = 'Error getting suggestion.';
    }
  });

  pinnedRow.appendChild(aiInput);
  pinnedRow.appendChild(aiBtn);

  nextDiv.appendChild(pinnedRow);

  // Hidden AI suggestion text area
  const suggestionDiv = document.createElement('div');
  suggestionDiv.id = 'aiSuggestionText';
  suggestionDiv.style.marginTop = '10px';
  nextDiv.appendChild(suggestionDiv);

  container.appendChild(currentDiv);
  container.appendChild(nextDiv);

  details.innerHTML = '';
  details.appendChild(container);
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

// Stub functions for reloadData and showNotification.
async function reloadData() {
  console.log('Data reloaded.');
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
  updateAuthButton
};