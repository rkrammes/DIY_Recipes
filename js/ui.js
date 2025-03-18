// ui.js
import { 
  createNewRecipe, 
  addNewIngredientToRecipe, 
  removeIngredientFromRecipe, 
  addGlobalIngredient as apiAddGlobalIngredient, 
  importCSVFile,
  removeGlobalIngredient
} from './api.js';
import { toggleEditMode, sendMagicLink } from './auth.js';

window.editMode = window.editMode || false; // Ensure global flag exists

/**
 * Updates the website theme based on the selected value.
 * @param {string} theme - The selected theme ('light', 'dark', or 'system').
 */
function updateTheme(theme) {
  document.body.classList.remove('light-mode', 'dark-mode');
  if (theme === 'light') {
    document.body.classList.add('light-mode');
  } else if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (theme === 'system') {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.add('dark-mode');
    }
  }
}

/**
 * Returns whether Edit Mode is active (i.e., the user is logged in).
 * Uses the global variable window.editMode.
 * @returns {boolean}
 */
function isEditMode() {
  return window.editMode === true;
}

/**
 * Standardizes the styling of a button element.
 * @param {HTMLElement} btn - The button element to standardize.
 */
function standardizeButton(btn) {
  btn.classList.add('btn');
  btn.style.width = '100%';
  btn.style.textAlign = 'left';
}

/**
 * Updates the display of all remove buttons in global ingredient details.
 */
function updateRemoveButtons() {
  const removeBtns = document.querySelectorAll('.remove-ingredient-btn');
  removeBtns.forEach(btn => {
    btn.style.display = isEditMode() ? 'block' : 'none';
  });
}

/**
 * Initializes UI event listeners and standardizes left-side buttons.
 * Recipes and ingredients are always rendered, regardless of edit mode.
 */
export function initUI() {
  // Theme selection
  const themeSelect = document.getElementById('themeSelect');
  themeSelect.addEventListener('change', (e) => {
    updateTheme(e.target.value);
    updateIngredientDetailsBackgrounds();
    updateRemoveButtons();
  });
  updateTheme(themeSelect.value);

  // Standardize left-side buttons and attach event listeners.
  const btnIngredients = document.getElementById('btnIngredients');
  if (btnIngredients) {
    standardizeButton(btnIngredients);
    btnIngredients.addEventListener('click', showAllIngredientsView);
  } else {
    console.warn('btnIngredients not found');
  }

  const btnSendMagicLink = document.getElementById('btnSendMagicLink');
  if (btnSendMagicLink) {
    standardizeButton(btnSendMagicLink);
    btnSendMagicLink.addEventListener('click', sendMagicLink);
  } else {
    console.warn('btnSendMagicLink not found');
  }

  const btnEditMode = document.getElementById('btnEditMode');
  if (btnEditMode) {
    standardizeButton(btnEditMode);
    btnEditMode.addEventListener('click', () => {
      toggleEditMode();
      // Toggle the global editMode flag; assume toggleEditMode updates the UI accordingly.
      window.editMode = !window.editMode;
      updateRemoveButtons();
    });
  } else {
    console.warn('btnEditMode not found');
  }

  // CSV import
  document.getElementById('csvFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      await importCSVFile(file);
      showNotification("CSV import successful!", "success");
    } catch (error) {
      showNotification("Error importing CSV.", "error");
    }
  });

  // New Global Ingredient input (on Enter)
  document.getElementById('newGlobalIngredientInput').addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const input = e.target;
      const name = input.value.trim();
      if (!name) {
        showNotification("Please enter a valid ingredient name.", "error");
        return;
      }
      try {
        await apiAddGlobalIngredient(name);
        showNotification("New ingredient added!", "success");
        input.value = '';
      } catch (error) {
        showNotification("Error adding new ingredient.", "error");
      }
    }
  });

  // New Recipe input (on Enter)
  document.getElementById('newRecipeNameInput').addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const input = e.target;
      const recipeName = input.value.trim();
      if (!recipeName) {
        showNotification("Please enter a valid recipe name.", "error");
        return;
      }
      try {
        const newRecipe = await createNewRecipe(recipeName);
        if (newRecipe) {
          showNotification("Recipe created successfully!", "success");
          input.value = '';
        }
      } catch (error) {
        showNotification("Error creating recipe.", "error");
      }
    }
  });

  // Ingredient dropdown for adding ingredient to a recipe
  document.getElementById('newIngredientDropdown').addEventListener('change', async function () {
    const dropdown = this;
    if (!dropdown.value) return;
    if (window.currentRecipeIndex == null) {
      showNotification("Please select a recipe first.", "error");
      dropdown.value = '';
      return;
    }
    const selectedId = dropdown.value;
    const ingObj = window.allIngredients.find(ing => ing.id === selectedId);
    if (!ingObj) {
      showNotification("Invalid ingredient selected.", "error");
      dropdown.value = '';
      return;
    }
    const newIngredient = {
      id: ingObj.id,
      name: ingObj.name,
      quantity: '',
      nextVersion: '',
      reasoning: '',
    };
    try {
      await addNewIngredientToRecipe(window.recipes[window.currentRecipeIndex], newIngredient);
      showNotification("Ingredient added to recipe!", "success");
    } catch (error) {
      showNotification("Error adding ingredient to recipe.", "error");
    }
    dropdown.value = '';
  });
}

/**
 * Updates the background of all expanded ingredient details to match the current theme.
 */
function updateIngredientDetailsBackgrounds() {
  const detailsDivs = document.querySelectorAll('.ingredient-details');
  detailsDivs.forEach(div => {
    div.style.background = document.body.classList.contains('light-mode') ? '#f0f0f0' : 'rgba(255,255,255,0.07)';
  });
}

/**
 * Displays the Ingredients view and hides the Recipe Details view.
 */
export function showAllIngredientsView() {
  document.getElementById('ingredientsView').style.display = 'block';
  document.getElementById('recipeDetails').style.display = 'none';
}

/**
 * Renders the list of recipes.
 * @param {Array} recipes - Array of recipe objects.
 */
export function renderRecipes(recipes) {
  window.recipes = recipes; // Store globally
  const list = document.getElementById('recipeList');
  list.innerHTML = '';
  if (!recipes.length) {
    list.innerHTML = '<li>No recipes found.</li>';
    return;
  }
  recipes.forEach(recipe => {
    const li = document.createElement('li');
    li.style.listStyle = 'none';
    li.style.marginBottom = '8px';

    const btn = document.createElement('button');
    btn.textContent = recipe.name || 'Unnamed Recipe';
    btn.classList.add('btn');
    btn.style.width = '100%';
    btn.style.textAlign = 'left';
    btn.addEventListener('click', () => {
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
      removeBtn.classList.add('btn', 'remove-ingredient-btn');
      removeBtn.addEventListener('click', async () => {
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
 * The details section displays extra info and a Remove button, whose visibility depends on Edit Mode.
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
    btn.classList.add('btn');
    btn.style.width = '25%';
    btn.style.textAlign = 'left';

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
    removeBtn.classList.add('btn', 'remove-ingredient-btn');
    removeBtn.style.marginTop = '10px';
    removeBtn.addEventListener('click', async () => {
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

/**
 * Displays a temporary notification.
 * @param {string} message - The notification message.
 * @param {string} type - The type ('success', 'error', or 'info').
 */
export function showNotification(message, type = 'info') {
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}
