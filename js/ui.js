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

    // Create header row
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

    // Create a row for each ingredient
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

// Export initUI to fix syntax error
export function initUI() {
  document.addEventListener('DOMContentLoaded', async () => {
    // Setup theme selector
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        updateTheme(e.target.value);
        updateIngredientDetailsBackgrounds();
        updateEditingState();
      });
      updateTheme(themeSelect.value);
    }

    // Setup edit mode toggle
    const editCheckbox = document.getElementById('editModeCheckbox');
    if (editCheckbox) {
      editCheckbox.checked = window.editMode || false;
      editCheckbox.addEventListener('change', async (e) => {
        window.editMode = e.target.checked;
        updateEditingState();
        await reloadData();
      });
    }

    // Load initial data
    await reloadData();
  });
}

// New function to render a list of recipes as summary cards.
export function renderRecipes(recipes) {
    // Look for the container where recipes should be displayed.
    const container = document.getElementById('recipesContainer');
    if (!container) {
        console.error("No container found with id 'recipesContainer'");
        return;
    }

    // Clear any existing content.
    container.innerHTML = '';

    // Create a card for each recipe.
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        recipeCard.style.border = '1px solid #ccc';
        recipeCard.style.padding = '10px';
        recipeCard.style.margin = '5px';

        // Display the recipe name (or a default text if not provided).
        recipeCard.textContent = recipe.name || "Unnamed Recipe";

        // When the card is clicked, show the recipe details.
        recipeCard.addEventListener('click', () => {
            showRecipeDetails(recipe);
        });

        // Append the card to the container.
        container.appendChild(recipeCard);
    });
}
// New function to render a list of ingredients as summary items.
export function renderIngredients(ingredients) {
    const container = document.getElementById('ingredientsContainer');
    if (!container) {
        console.error("No container found with id 'ingredientsContainer'");
        return;
    }

    // Clear any existing content.
    container.innerHTML = '';

    // Create an element for each ingredient.
    ingredients.forEach(ingredient => {
        const ingredientItem = document.createElement('div');
        ingredientItem.classList.add('ingredient-item');
        ingredientItem.style.border = '1px solid #ccc';
        ingredientItem.style.padding = '10px';
        ingredientItem.style.margin = '5px';
        ingredientItem.textContent = ingredient.name || "Unnamed Ingredient";
        container.appendChild(ingredientItem);
    });
}

// Assign exported functions to window.module for backward compatibility.
window.module = {
    showRecipeDetails,
    initUI,
    renderRecipes,
    renderIngredients
};