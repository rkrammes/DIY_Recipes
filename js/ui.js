/* ui.js */

// Define isEditMode function.
function isEditMode() {
  const editCheckbox = document.getElementById('editModeCheckbox');
  return editCheckbox ? editCheckbox.checked : false;
}

/**
 * Displays detailed information for a given recipe.
 * This function replicates your original two-column layout:
 * - Left: Current Ingredients displayed in a table.
 * - Right: Next Iteration area with an editable textarea, AI suggestion input/button, and a commit button.
 * @param {object} recipe - The recipe object.
 */
export function showRecipeDetails(recipe) {
  // Hide the global ingredients view.
  const ingredientsView = document.getElementById('ingredientsView');
  if (ingredientsView) ingredientsView.style.display = 'none';

  // Show recipe details section.
  const details = document.getElementById('recipeDetails');
  if (!details) return;
  details.style.display = 'block';
  details.innerHTML = '';

  // Create a container with two columns.
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.gap = '20px';

  // Left column: Current Ingredients (table format)
  const currentDiv = document.createElement('div');
  currentDiv.style.flex = '1';
  currentDiv.style.border = '1px solid #ccc';
  currentDiv.style.padding = '10px';
  currentDiv.innerHTML = `<h3>Current Ingredients</h3>`;
  if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    // Create header row.
    const headerRow = document.createElement('tr');
    const headers = ['Ingredient', 'Quantity', 'Unit', 'Notes'];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      th.style.border = '1px solid #ccc';
      th.style.padding = '8px';
      th.style.backgroundColor = '#f8f8f8';
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create a row for each ingredient.
    recipe.ingredients.forEach(ing => {
      const row = document.createElement('tr');
      const tdName = document.createElement('td');
      tdName.textContent = ing.name || '';
      tdName.style.border = '1px solid #ccc';
      tdName.style.padding = '8px';
      row.appendChild(tdName);

      const tdQuantity = document.createElement('td');
      tdQuantity.textContent = ing.quantity || '';
      tdQuantity.style.border = '1px solid #ccc';
      tdQuantity.style.padding = '8px';
      row.appendChild(tdQuantity);

      const tdUnit = document.createElement('td');
      tdUnit.textContent = ing.unit || '';
      tdUnit.style.border = '1px solid #ccc';
      tdUnit.style.padding = '8px';
      row.appendChild(tdUnit);

      const tdNotes = document.createElement('td');
      tdNotes.textContent = ing.notes || '';
      tdNotes.style.border = '1px solid #ccc';
      tdNotes.style.padding = '8px';
      row.appendChild(tdNotes);

      table.appendChild(row);
    });
    currentDiv.appendChild(table);
  } else {
    currentDiv.innerHTML += `<p>No ingredients available.</p>`;
  }

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

/**
 * Initializes UI elements and event listeners.
 */
export function initUI() {
  function setup() {
    console.log("initUI: setup started");

    // Setup theme selector.
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        document.body.className = e.target.value;
      });
    }

    // Setup edit mode toggle.
    const editCheckbox = document.getElementById('editModeCheckbox');
    if (editCheckbox) {
      editCheckbox.checked = window.editMode || false;
      editCheckbox.addEventListener('change', () => {
        window.editMode = editCheckbox.checked;
      });
    }
    
    // Setup "All Ingredients" button.
    const btnIngredients = document.getElementById('btnIngredients');
    if (btnIngredients) {
      console.log("initUI: btnIngredients found");
      btnIngredients.addEventListener('click', () => {
        console.log("All Ingredients button clicked");
        // Hide recipe details view.
        const recipeDetails = document.getElementById('recipeDetails');
        if (recipeDetails) {
          recipeDetails.style.display = 'none';
          console.log("Recipe details hidden");
        }
        // Show global ingredients view.
        const ingredientsView = document.getElementById('ingredientsView');
        if (ingredientsView) {
          ingredientsView.style.display = 'block';
          console.log("Ingredients view displayed");
        } else {
          console.error("No container found with id 'ingredientsView'");
        }
      });
    } else {
      console.error("initUI: btnIngredients not found");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
}

/**
 * Renders a list of recipes into the existing <ul id="recipeList"> element.
 * @param {Array} recipes - Array of recipe objects.
 */
export function renderRecipes(recipes) {
  const container = document.getElementById('recipeList');
  if (!container) {
    console.error("No container found with id 'recipeList'");
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
 * @param {Array} ingredients - Array of ingredient objects.
 */
export function renderIngredients(ingredients) {
  const container = document.getElementById('ingredientList');
  if (!container) {
    console.error("No container found with id 'ingredientList'");
    return;
  }
  container.innerHTML = '';
  ingredients.forEach(ingredient => {
    const li = document.createElement('li');
    li.classList.add('ingredient-item');
    li.textContent = ingredient.name || 'Unnamed Ingredient';
    container.appendChild(li);
  });
}

/**
 * Updates the login/logout button text.
 * @param {boolean} isLoggedIn - Authentication state.
 */
export function updateAuthButton(isLoggedIn) {
  const btnLogIn = document.getElementById('btnLogIn');
  if (btnLogIn) {
    btnLogIn.textContent = isLoggedIn ? 'Log Out' : 'Log In';
  }
}

// Dummy authentication functions (replace with your actual logic).
async function logInUser() {
  console.log('Logging in...');
  return true;
}

async function logOutUser() {
  console.log('Logging out...');
  return true;
}

// Stub functions for reloadData and showNotification.
// Replace these with your actual implementations.
async function reloadData() {
  console.log('Data reloaded.');
}

function showNotification(message, type) {
  alert(`${type.toUpperCase()}: ${message}`);
}

// Attach event listener to the login/logout button.
const btnLogIn = document.getElementById('btnLogIn');
if (btnLogIn) {
  btnLogIn.addEventListener('click', async () => {
    window.isLoggedIn = window.isLoggedIn || false;
    if (window.isLoggedIn) {
      const success = await logOutUser();
      if (success) {
        window.isLoggedIn = false;
        updateAuthButton(false);
      }
    } else {
      const success = await logInUser();
      if (success) {
        window.isLoggedIn = true;
        updateAuthButton(true);
      }
    }
  });
}
updateAuthButton(window.isLoggedIn || false);

// Expose exported functions on window.module for backward compatibility.
window.module = {
  showRecipeDetails,
  initUI,
  renderRecipes,
  renderIngredients
};