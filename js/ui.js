// ui.js
import { 
  createNewRecipe, 
  addNewIngredientToRecipe, 
  removeIngredientFromRecipe, 
  addGlobalIngredient as apiAddGlobalIngredient, 
  importCSVFile 
} from './api.js';
import { toggleEditMode, sendMagicLink } from './auth.js';

/**
 * Updates the website theme based on the selected value.
 * @param {string} theme - The selected theme ('light', 'dark', or 'system').
 */
function updateTheme(theme) {
  // Remove any existing theme classes from the body.
  document.body.classList.remove('light-mode', 'dark-mode');
  
  if (theme === 'light') {
    document.body.classList.add('light-mode');
  } else if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (theme === 'system') {
    // For system theme, detect the system's preferred color scheme.
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.add('dark-mode');
    }
  }
}

/**
 * Initializes UI event listeners.
 */
export function initUI() {
  // Theme dropdown event listener for appearance changes.
  const themeSelect = document.getElementById('themeSelect');
  themeSelect.addEventListener('change', (e) => {
    updateTheme(e.target.value);
  });
  updateTheme(themeSelect.value);

  // Attach event listener for the "Send Magic Link" button.
  const btnSendMagicLink = document.getElementById('btnSendMagicLink');
  if (btnSendMagicLink) {
    btnSendMagicLink.addEventListener('click', sendMagicLink);
  } else {
    console.warn('btnSendMagicLink not found');
  }

  // Ingredients button to show the Ingredients View.
  document.getElementById('btnIngredients').addEventListener('click', () => {
    showAllIngredientsView();
  });

  // CSV import - handle file change.
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

  // Add New Ingredient (global) input - on Enter key.
  document.getElementById('newGlobalIngredientInput').addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const input = e.target;
      const ingredientName = input.value.trim();
      if (!ingredientName) {
        showNotification("Please enter a valid ingredient name.", "error");
        return;
      }
      try {
        await apiAddGlobalIngredient(ingredientName);
        showNotification("New ingredient added!", "success");
        input.value = '';
        // Optionally, re-fetch ingredients and update UI here.
      } catch (error) {
        showNotification("Error adding new ingredient.", "error");
      }
    }
  });

  // Add New Recipe input - on Enter key.
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
          // Optionally, re-fetch recipes and update UI here.
        }
      } catch (error) {
        showNotification("Error creating recipe.", "error");
      }
    }
  });

  // Ingredient dropdown - add ingredient to current recipe.
  document.getElementById('newIngredientDropdown').addEventListener('change', async function () {
    const dropdown = this;
    if (!dropdown.value) return;
    if (window.currentRecipeIndex == null) {
      showNotification("Please select a recipe first.", "error");
      dropdown.value = '';
      return;
    }
    // Assume global window.allIngredients contains the ingredients array.
    const selectedIngId = dropdown.value;
    const ingObj = window.allIngredients.find((ing) => ing.id === selectedIngId);
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

  // Reroll AI Suggestion button.
  document.getElementById('btnReroll').addEventListener('click', () => {
    if (window.rerollAISuggestion) {
      window.rerollAISuggestion();
    }
  });

  // Commit AI Suggestion button.
  document.getElementById('btnCommitSuggestion').addEventListener('click', () => {
    if (window.commitAISuggestion) {
      window.commitAISuggestion();
    }
  });

  // Edit Mode button to toggle log in/out.
  document.getElementById('btnEditMode').addEventListener('click', toggleEditMode);
}

/**
 * Displays the Ingredients view and hides the Recipe Details view.
 */
export function showAllIngredientsView() {
  document.getElementById('ingredientsView').style.display = 'block';
  document.getElementById('recipeDetails').style.display = 'none';
}

/**
 * Renders the list of recipes into the UI.
 * @param {Array} recipes - Array of recipe objects.
 */
export function renderRecipes(recipes) {
  const recipeList = document.getElementById('recipeList');
  recipeList.innerHTML = '';
  if (!recipes || recipes.length === 0) {
    recipeList.innerHTML = '<li>No recipes found.</li>';
    return;
  }
  recipes.forEach(recipe => {
    const li = document.createElement('li');
    li.textContent = recipe.name || 'Unnamed Recipe';
    // Add click event to view recipe details if needed.
    li.addEventListener('click', () => {
      window.currentRecipe = recipe;
      // Optionally, call a function to render recipe details.
    });
    recipeList.appendChild(li);
  });
}

/**
 * Renders the list of ingredients into the UI.
 * @param {Array} ingredients - Array of ingredient objects.
 */
export function renderIngredients(ingredients) {
  const ingredientList = document.getElementById('ingredientList');
  ingredientList.innerHTML = '';
  if (!ingredients || ingredients.length === 0) {
    ingredientList.innerHTML = '<li>No ingredients found.</li>';
    return;
  }
  ingredients.forEach(ingredient => {
    const li = document.createElement('li');
    li.textContent = ingredient.name || 'Unnamed Ingredient';
    ingredientList.appendChild(li);
  });
}

/**
 * Shows a temporary notification on the screen.
 * @param {string} message - The notification message.
 * @param {string} type - The type ('success', 'error', or 'info').
 */
export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerText = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
