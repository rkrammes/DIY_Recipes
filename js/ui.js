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
import { toggleAuth, sendMagicLink } from './auth.js';

// Global flag for edit mode; false means anonymous (read-only).
window.editMode = window.editMode || false;

// ----------------- Helper Functions -----------------

function updateTheme(theme) {
  document.body.classList.remove('light-mode', 'dark-mode');
  if (theme === 'light') {
    document.body.classList.add('light-mode');
  } else if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (theme === 'system') {
    document.body.classList.add(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light-mode' : 'dark-mode');
  }
}

function isEditMode() {
  return window.editMode === true;
}

function standardizeButton(btn) {
  btn.classList.add('btn');
  btn.style.width = '100%';
  btn.style.textAlign = 'left';
}

function updateEditingState() {
  const controls = [
    document.getElementById('newRecipeNameInput'),
    document.getElementById('newGlobalIngredientInput'),
    document.getElementById('newIngredientDropdown'),
    document.getElementById('aiPrompt'),
    document.getElementById('btnReroll'),
    document.getElementById('btnCommitSuggestion')
  ];
  controls.forEach(control => {
    if (control) {
      control.disabled = !isEditMode();
    }
  });
  updateRemoveButtons();
}

function updateRemoveButtons() {
  const removeBtns = document.querySelectorAll('.remove-ingredient-btn');
  removeBtns.forEach(btn => {
    btn.style.display = isEditMode() ? 'block' : 'none';
  });
}

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

export function showNotification(message, type = "info") {
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

function showEditDisabledNotification() {
  showNotification("You must be logged in to make changes.", "error");
}

function updateIngredientDetailsBackgrounds() {
  const detailsDivs = document.querySelectorAll('.ingredient-details');
  detailsDivs.forEach(div => {
    div.style.background = document.body.classList.contains('light-mode') ? '#f0f0f0' : 'rgba(255,255,255,0.07)';
  });
}

// ----------------- Main UI Functions -----------------

export function initUI() {
  document.addEventListener('DOMContentLoaded', async () => {
    const themeSelect = document.getElementById('themeSelect');
    themeSelect.addEventListener('change', (e) => {
      updateTheme(e.target.value);
      updateIngredientDetailsBackgrounds();
      updateEditingState();
    });
    updateTheme(themeSelect.value);

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
    const btnLogIn = document.getElementById('btnLogIn');
    if (btnLogIn) {
      standardizeButton(btnLogIn);
      btnLogIn.addEventListener('click', async () => {
        await toggleAuth();
      });
    }
    const editCheckbox = document.getElementById('editModeCheckbox');
    if (editCheckbox) {
      editCheckbox.checked = isEditMode();
      editCheckbox.addEventListener('change', async (e) => {
        window.editMode = e.target.checked;
        updateEditingState();
        await reloadData();
      });
    }
    
    const csvFile = document.getElementById('csvFile');
    if (csvFile) {
      csvFile.addEventListener('change', async (e) => {
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
    }

    const newRecipeInput = document.getElementById('newRecipeNameInput');
    if (newRecipeInput) {
      newRecipeInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
          if (!isEditMode()) {
            showEditDisabledNotification();
            return;
          }
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
    }
    
    const ingredientDropdown = document.getElementById('newIngredientDropdown');
    if (ingredientDropdown) {
      ingredientDropdown.addEventListener('change', async function () {
        if (!isEditMode()) {
          showEditDisabledNotification();
          this.value = '';
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
    }
    
    updateEditingState();
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
 * This function now shows a two-column layout: 
 * - Left: Current Recipe (read-only block)
 * - Right: Next Iteration editing area with AI suggestion functions.
 * @param {Object} recipe - The recipe object.
 */
export function showRecipeDetails(recipe) {
  // Hide global ingredients view.
  document.getElementById('ingredientsView').style.display = 'none';
  const details = document.getElementById('recipeDetails');
  details.style.display = 'block';
  
  // Clear existing content.
  details.innerHTML = '';

  // Create container with two columns.
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.gap = '20px';

  // Left column: Current Recipe (read-only)
  const currentDiv = document.createElement('div');
  currentDiv.style.flex = '1';
  currentDiv.style.border = '1px solid #ccc';
  currentDiv.style.padding = '10px';
  currentDiv.innerHTML = `<h3>Current Recipe</h3>`;
  // Display current recipe details in a preformatted block.
  const currentPre = document.createElement('pre');
  currentPre.textContent = JSON.stringify(recipe, null, 2);
  currentPre.style.backgroundColor = '#eee';
  currentPre.style.padding = '10px';
  currentPre.style.overflowX = 'auto';
  currentDiv.appendChild(currentPre);

  // Right column: Next Iteration (editable)
  const nextDiv = document.createElement('div');
  nextDiv.style.flex = '1';
  nextDiv.style.border = '1px solid #ccc';
  nextDiv.style.padding = '10px';
  nextDiv.innerHTML = `<h3>Next Iteration</h3>`;
  
  // Textarea for next iteration content.
  const nextTextarea = document.createElement('textarea');
  nextTextarea.style.width = '100%';
  nextTextarea.style.height = '150px';
  // Pre-fill with existing next_iteration if any.
  nextTextarea.value = recipe.next_iteration || "";
  nextDiv.appendChild(nextTextarea);

  // AI Suggestion container.
  const aiContainer = document.createElement('div');
  aiContainer.style.marginTop = '10px';
  const aiInput = document.createElement('input');
  aiInput.id = 'aiPrompt';
  aiInput.placeholder = 'Enter prompt for AI suggestion';
  aiInput.disabled = !isEditMode();
  aiContainer.appendChild(aiInput);
  const aiBtn = document.createElement('button');
  aiBtn.textContent = 'Get AI Suggestion';
  aiBtn.classList.add('btn');
  aiBtn.disabled = !isEditMode();
  aiBtn.addEventListener('click', async () => {
    // Call your AI suggestion API (example below).
    try {
      // Simulate an API call:
      const response = await fetch('/api/ai-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe: recipe,
          userPrompt: aiInput.value
        })
      });
      const data = await response.json();
      if (data.suggestion) {
        suggestionDiv.textContent = data.suggestion;
      } else {
        suggestionDiv.textContent = "No suggestion returned.";
      }
    } catch (error) {
      suggestionDiv.textContent = "Error getting suggestion.";
    }
  });
  aiContainer.appendChild(aiBtn);
  const suggestionDiv = document.createElement('div');
  suggestionDiv.id = 'aiSuggestionText';
  suggestionDiv.style.marginTop = '10px';
  aiContainer.appendChild(suggestionDiv);
  nextDiv.appendChild(aiContainer);

  // Commit Next Iteration button.
  const commitBtn = document.createElement('button');
  commitBtn.textContent = 'Commit Next Iteration';
  commitBtn.classList.add('btn');
  commitBtn.disabled = !isEditMode();
  commitBtn.addEventListener('click', async () => {
    // Here, you should call your API to update the recipe's next_iteration column.
    // For example, using supabaseClient.from('All_Recipes').update({next_iteration: nextTextarea.value}).eq('id', recipe.id)
    try {
      const { error } = await supabaseClient
        .from('All_Recipes')
        .update({ next_iteration: nextTextarea.value })
        .eq('id', recipe.id);
      if (error) {
        showNotification("Error committing next iteration.", "error");
      } else {
        showNotification("Next iteration committed!", "success");
        await reloadData();
      }
    } catch (error) {
      showNotification("Error committing next iteration.", "error");
    }
  });
  nextDiv.appendChild(commitBtn);

  // Append both columns to container and then to details.
  container.appendChild(currentDiv);
  container.appendChild(nextDiv);
  details.appendChild(container);
}

// Renders the list of global ingredients.
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
    btn.classList.add('editable');
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
    removeBtn.style.marginTop = '10px';
    removeBtn.addEventListener('click', async () => {
      if (!isEditMode()) {
        showEditDisabledNotification();
        return;
      }
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