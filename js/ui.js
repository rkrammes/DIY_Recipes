// ui.js
import { 
  createNewRecipe, 
  addNewIngredientToRecipe, 
  removeIngredientFromRecipe, 
  addGlobalIngredient as apiAddGlobalIngredient, 
  importCSVFile,
  removeGlobalIngredient,
  loadRecipes,
  loadAllIngredients
} from './api.js';
import { toggleEditMode, sendMagicLink } from './auth.js';

// Global flag to indicate editing rights (false = anonymous/read‑only).
window.editMode = window.editMode || false;

// --- Global Event Delegation for Read-Only Mode ---
// This listener intercepts interactions with any element that has the "editable" class.
// If not in edit mode, it prevents the default action and shows a warning.
document.addEventListener('click', function(e) {
  if (!isEditMode() && e.target.closest('.editable')) {
    e.preventDefault();
    showNotification("You must be logged in to make changes.", "error");
  }
});
document.addEventListener('input', function(e) {
  if (!isEditMode() && e.target.closest('.editable')) {
    e.preventDefault();
    showNotification("You must be logged in to edit.", "error");
  }
});

// --- Helper Functions ---

/**
 * Checks if Edit Mode is active.
 * @returns {boolean} True if window.editMode is true.
 */
function isEditMode() {
  return window.editMode === true;
}

/**
 * Standardizes a button's styling.
 * @param {HTMLElement} btn - The button element.
 */
function standardizeButton(btn) {
  btn.classList.add('btn');
  btn.style.width = '100%';
  btn.style.textAlign = 'left';
}

/**
 * Updates the background of all expanded ingredient details based on the current theme.
 */
function updateIngredientDetailsBackgrounds() {
  const detailsDivs = document.querySelectorAll('.ingredient-details');
  detailsDivs.forEach(div => {
    div.style.background = document.body.classList.contains('light-mode') ? '#f0f0f0' : 'rgba(255,255,255,0.07)';
  });
}

/**
 * Displays a temporary notification.
 * @param {string} message - The message text.
 * @param {string} type - "success", "error", or "info".
 */
export function showNotification(message, type = "info") {
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

// --- Main UI Functions ---

/**
 * Initializes the UI event listeners and sets up initial states.
 */
export function initUI() {
  // Theme selection
  const themeSelect = document.getElementById('themeSelect');
  themeSelect.addEventListener('change', (e) => {
    updateTheme(e.target.value);
    updateIngredientDetailsBackgrounds();
  });
  updateTheme(themeSelect.value);

  // Standardize and attach event listeners for left-side buttons.
  const btnIngredients = document.getElementById('btnIngredients');
  if (btnIngredients) {
    standardizeButton(btnIngredients);
    btnIngredients.addEventListener('click', showAllIngredientsView);
  }
  const btnSendMagicLink = document.getElementById('btnSendMagicLink');
  if (btnSendMagicLink) {
    standardizeButton(btnSendMagicLink);
    btnSendMagicLink.addEventListener('click', sendMagicLink);
  }
  const btnEditMode = document.getElementById('btnEditMode');
  if (btnEditMode) {
    standardizeButton(btnEditMode);
    btnEditMode.addEventListener('click', async () => {
      // Toggle Edit Mode: update global flag and body class.
      toggleEditMode();
      window.editMode = !window.editMode;
      if (window.editMode) {
        document.body.classList.add('edit-mode');
      } else {
        document.body.classList.remove('edit-mode');
      }
      // Reload data so that editing controls become active.
      await reloadData();
    });
  }

  // CSV import
  document.getElementById('csvFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importCSVFile(file);
      showNotification("CSV imported successfully!", "success");
      await reloadData();
    } catch (error) {
      showNotification("Error importing CSV.", "error");
    }
  });

  // New Recipe input (on Enter)
  const newRecipeInput = document.getElementById('newRecipeNameInput');
  newRecipeInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      // Mark input as editable control.
      newRecipeInput.classList.add('editable');
      if (!isEditMode()) return; // Global listener will handle notification.
      const recipeName = newRecipeInput.value.trim();
      if (!recipeName) {
        showNotification("Please enter a valid recipe name.", "error");
        return;
      }
      try {
        const newRecipe = await createNewRecipe(recipeName);
        if (newRecipe) {
          window.recipes = window.recipes || [];
          window.recipes.push(newRecipe);
          renderRecipes(window.recipes);
          showNotification("Recipe created successfully!", "success");
          newRecipeInput.value = '';
        }
      } catch (error) {
        showNotification("Error creating recipe.", "error");
      }
    }
  });

  // New Ingredient dropdown (on change)
  const newIngredientDropdown = document.getElementById('newIngredientDropdown');
  newIngredientDropdown.addEventListener('change', async function () {
    this.classList.add('editable');
    if (!isEditMode()) {
      return;
    }
    if (!this.value) return;
    if (window.currentRecipeIndex == null) {
      showNotification("Please select a recipe first.", "error");
      this.value = '';
      return;
    }
    const selectedId = this.value;
    const ingObj = window.allIngredients.find(ing => ing.id === selectedId);
    if (!ingObj) {
      showNotification("Invalid ingredient selected.", "error");
      this.value = '';
      return;
    }
    const newIngredient = {
      id: ingObj.id,
      name: ingObj.name,
      quantity: '',
      nextVersion: '',
      reasoning: ''
    };
    try {
      await addNewIngredientToRecipe(window.recipes[window.currentRecipeIndex], newIngredient);
      showNotification("Ingredient added to recipe!", "success");
      showRecipeDetails(window.recipes[window.currentRecipeIndex]);
    } catch (error) {
      showNotification("Error adding ingredient to recipe.", "error");
    }
    this.value = '';
  });

  // Initial editing state update.
  updateEditingState();
}

/**
 * Reloads recipes and global ingredients from Supabase and re-renders the UI.
 */
async function reloadData() {
  try {
    const recipes = await loadRecipes();
    const ingredients = await loadAllIngredients();
    renderRecipes(recipes);
    renderIngredients(ingredients);
  } catch (error) {
    showNotification("Error reloading data.", "error");
  }
}

/**
 * Renders the list of recipes.
 * @param {Array} recipes - Array of recipe objects.
 */
export function renderRecipes(recipes) {
  window.recipes = recipes;
  const list = document.getElementById('recipeList');
  list.innerHTML = '';
  if (!recipes.length) {
    list.innerHTML = '<li>No recipes found.</li>';
    return;
  }
  recipes.forEach((recipe, idx) => {
    const li = document.createElement('li');
    li.style.listStyle = 'none';
    li.style.marginBottom = '8px';

    const btn = document.createElement('button');
    btn.textContent = recipe.name || 'Unnamed Recipe';
    standardizeButton(btn);
    btn.addEventListener('click', () => {
      window.currentRecipeIndex = idx;
      showRecipeDetails(recipe);
    });
    li.appendChild(btn);
    list.appendChild(li);
  });
}

/**
 * Displays the details of a recipe.
 * @param {Object} recipe - The recipe object.
 */
export function showRecipeDetails(recipe) {
  document.getElementById('ingredientsView').style.display = 'none';
  const details = document.getElementById('recipeDetails');
  details.style.display = 'block';
  document.getElementById('recipeTitle').textContent = recipe.name || 'Unnamed Recipe';
  const content = document.getElementById('recipeContent');
  content.innerHTML = '';
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    recipe.ingredients.forEach((ing, index) => {
      const tr = document.createElement('tr');
      ['name', 'quantity', 'nextVersion', 'reasoning'].forEach(key => {
        const td = document.createElement('td');
        td.textContent = ing[key] || '';
        tr.appendChild(td);
      });
      const tdRemove = document.createElement('td');
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.classList.add('editable'); // Mark as editable control.
      removeBtn.classList.add('btn', 'remove-ingredient-btn');
      removeBtn.addEventListener('click', async () => {
        if (!isEditMode()) return;
        try {
          await removeIngredientFromRecipe(recipe, index);
          showNotification("Ingredient removed", "success");
          showRecipeDetails(recipe);
        } catch (error) {
          showNotification("Error removing ingredient", "error");
        }
      });
      tdRemove.appendChild(removeBtn);
      tr.appendChild(tdRemove);
      content.appendChild(tr);
    });
  } else {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.textContent = 'No ingredients added yet.';
    tr.appendChild(td);
    content.appendChild(tr);
  }
}

/**
 * Renders the list of global ingredients.
 * Each ingredient is a clickable button (25% width) that toggles an expanded details section.
 * The details section displays extra info and includes a Remove button.
 * @param {Array} ingredients - Array of ingredient objects.
 */
export function renderIngredients(ingredients) {
  window.allIngredients = ingredients;
  const list = document.getElementById('ingredientList');
  list.innerHTML = '';
  if (!ingredients.length) {
    list.innerHTML = '<li>No ingredients found.</li>';
    return;
  }
  ingredients.forEach(ing => {
    const li = document.createElement('li');
    li.style.listStyle = 'none';
    li.style.marginBottom = '8px';

    const btn = document.createElement('button');
    btn.textContent = ing.name || 'Unnamed Ingredient';
    standardizeButton(btn);
    btn.style.width = '25%';
    btn.classList.add('editable'); // Mark as editable control.
    
    const details = document.createElement('div');
    details.className = 'ingredient-details';
    details.style.display = 'none';
    details.style.padding = '8px';
    details.style.marginTop = '5px';
    details.style.border = '1px solid rgba(255,255,255,0.2)';
    details.style.borderRadius = '4px';
    details.style.background = document.body.classList.contains('light-mode') ? '#f0f0f0' : 'rgba(255,255,255,0.07)';
    
    details.innerHTML = `
      <p><strong>ID:</strong> ${ing.id || 'N/A'}</p>
      <p><strong>Name:</strong> ${ing.name || 'N/A'}</p>
      <p><strong>Created At:</strong> ${ing.created_at || 'N/A'}</p>
      <p><strong>Description:</strong> ${ing.description || 'No description available.'}</p>
    `;
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.classList.add('editable');
    removeBtn.classList.add('btn', 'remove-ingredient-btn');
    removeBtn.addEventListener('click', async () => {
      if (!isEditMode()) return;
      try {
        await removeGlobalIngredient(ing.id);
        showNotification("Ingredient removed", "success");
        renderIngredients(window.allIngredients.filter(item => item.id !== ing.id));
      } catch (error) {
        showNotification("Error removing ingredient", "error");
      }
    });
    removeBtn.style.display = isEditMode() ? 'block' : 'none';
    details.appendChild(removeBtn);
    
    btn.addEventListener('click', () => {
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
    });
    
    li.appendChild(btn);
    li.appendChild(details);
    list.appendChild(li);
  });
  updateRemoveButtons();
}