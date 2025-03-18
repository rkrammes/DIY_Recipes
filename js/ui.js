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
 * Returns whether Edit Mode is currently ON.
 * Uses the global variable set in auth.js.
 * @returns {boolean} True if Edit Mode is ON.
 */
function isEditMode() {
  return window.editMode === true;
}

/**
 * Standardizes the styling of a button element.
 * @param {HTMLElement} button - The button element to standardize.
 */
function standardizeButton(button) {
  button.classList.add('btn');
  button.style.width = '100%';
  button.style.textAlign = 'left';
}

/**
 * Initializes UI event listeners and standardizes left-side buttons.
 */
export function initUI() {
  const themeSelect = document.getElementById('themeSelect');
  themeSelect.addEventListener('change', (e) => {
    updateTheme(e.target.value);
    updateIngredientDetailsBackgrounds();
  });
  updateTheme(themeSelect.value);

  // Standardize and attach event listener for the "All Ingredients" button.
  const btnIngredients = document.getElementById('btnIngredients');
  if (btnIngredients) {
    standardizeButton(btnIngredients);
    btnIngredients.addEventListener('click', () => {
      showAllIngredientsView();
    });
  } else {
    console.warn('btnIngredients not found');
  }

  // Attach event listener for the "Send Magic Link" button.
  const btnSendMagicLink = document.getElementById('btnSendMagicLink');
  if (btnSendMagicLink) {
    standardizeButton(btnSendMagicLink);
    btnSendMagicLink.addEventListener('click', sendMagicLink);
  } else {
    console.warn('btnSendMagicLink not found');
  }

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
 * Updates the background of all expanded ingredient details to match the current theme.
 */
function updateIngredientDetailsBackgrounds() {
  const detailsDivs = document.querySelectorAll('.ingredient-details');
  detailsDivs.forEach(div => {
    div.style.background = document.body.classList.contains('light-mode') ? '#f0f0f0' : 'rgba(255, 255, 255, 0.07)';
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
    li.style.listStyle = 'none';
    li.style.marginBottom = '10px';
    li.style.background = 'none';
    
    // Create a button for the recipe.
    const recipeButton = document.createElement('button');
    recipeButton.textContent = recipe.name || 'Unnamed Recipe';
    recipeButton.classList.add('btn');
    recipeButton.style.width = '100%';
    recipeButton.style.textAlign = 'left';
    recipeButton.addEventListener('click', () => {
      showRecipeDetails(recipe);
    });
    
    li.appendChild(recipeButton);
    recipeList.appendChild(li);
  });
}

/**
 * Displays the details of a recipe, including its ingredients.
 * @param {Object} recipe - The recipe object.
 */
export function showRecipeDetails(recipe) {
  document.getElementById('ingredientsView').style.display = 'none';
  const recipeDetails = document.getElementById('recipeDetails');
  recipeDetails.style.display = 'block';
  const recipeTitle = document.getElementById('recipeTitle');
  recipeTitle.textContent = recipe.name || 'Unnamed Recipe';
  const recipeContent = document.getElementById('recipeContent');
  recipeContent.innerHTML = '';
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    recipe.ingredients.forEach((ingredient, index) => {
      const tr = document.createElement('tr');
      
      const tdIngredient = document.createElement('td');
      tdIngredient.textContent = ingredient.name || '';
      tr.appendChild(tdIngredient);
      
      const tdQuantity = document.createElement('td');
      tdQuantity.textContent = ingredient.quantity || '';
      tr.appendChild(tdQuantity);
      
      const tdNextVersion = document.createElement('td');
      tdNextVersion.textContent = ingredient.nextVersion || '';
      tr.appendChild(tdNextVersion);
      
      const tdReasoning = document.createElement('td');
      tdReasoning.textContent = ingredient.reasoning || '';
      tr.appendChild(tdReasoning);
      
      const tdRemove = document.createElement('td');
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.classList.add('btn', 'remove-ingredient-btn');
      removeButton.addEventListener('click', async () => {
        try {
          await removeIngredientFromRecipe(recipe, index);
          showNotification("Ingredient removed", "success");
          showRecipeDetails(recipe);
        } catch (error) {
          showNotification("Error removing ingredient", "error");
        }
      });
      tdRemove.appendChild(removeButton);
      tr.appendChild(tdRemove);
      
      recipeContent.appendChild(tr);
    });
  } else {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.textContent = 'No ingredients added yet.';
    tr.appendChild(td);
    recipeContent.appendChild(tr);
  }
}

/**
 * Renders the list of global ingredients into the UI.
 * Each ingredient is rendered as a clickable button (set to 25% width)
 * that toggles an expanded details section. The details section displays
 * additional useful information and includes a Remove button (active only when Edit Mode is ON).
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
    li.style.listStyle = 'none';
    li.style.marginBottom = '10px';
    
    // Create a button for the ingredient set to 25% width.
    const ingredientButton = document.createElement('button');
    ingredientButton.textContent = ingredient.name || 'Unnamed Ingredient';
    ingredientButton.classList.add('btn');
    ingredientButton.style.width = '25%';
    ingredientButton.style.textAlign = 'left';
    
    // Create an expandable details div.
    const detailsDiv = document.createElement('div');
    detailsDiv.style.display = 'none';
    detailsDiv.classList.add('ingredient-details');
    detailsDiv.style.padding = '10px';
    detailsDiv.style.marginTop = '5px';
    detailsDiv.style.borderRadius = '4px';
    detailsDiv.style.border = '1px solid rgba(255, 255, 255, 0.15)';
    detailsDiv.style.background = document.body.classList.contains('light-mode') ? '#f0f0f0' : 'rgba(255, 255, 255, 0.07)';
    
    // Insert additional useful ingredient information.
    detailsDiv.innerHTML = `
      <p><strong>ID:</strong> ${ingredient.id || 'N/A'}</p>
      <p><strong>Name:</strong> ${ingredient.name || 'N/A'}</p>
      <p><strong>Created At:</strong> ${ingredient.created_at || 'N/A'}</p>
      <p><strong>Description:</strong> ${ingredient.description || 'No description available.'}</p>
    `;
    
    // Add a Remove button in expanded details if Edit Mode is ON.
    if (isEditMode()) {
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.classList.add('btn', 'remove-ingredient-btn');
      removeBtn.style.marginTop = '10px';
      removeBtn.addEventListener('click', async () => {
        try {
          await removeGlobalIngredient(ingredient.id);
          showNotification("Ingredient removed", "success");
        } catch (error) {
          showNotification("Error removing ingredient", "error");
        }
      });
      detailsDiv.appendChild(removeBtn);
    }
    
    // Toggle the details div when the ingredient button is clicked.
    ingredientButton.addEventListener('click', () => {
      detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
    });
    
    li.appendChild(ingredientButton);
    li.appendChild(detailsDiv);
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
