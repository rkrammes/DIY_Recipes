import { showRecipeDetails } from './recipe-details-ui.js';

/**
 * Render the list of recipes in the sidebar.
 * @param {Array<Object>} recipes - Array of recipe objects.
 */
export function renderRecipes(recipes) {
  const recipeList = document.getElementById('recipeList');
  if (!recipeList) return;

  recipeList.innerHTML = '';

  recipes.forEach(recipe => {
    const li = document.createElement('li');
    li.className = 'recipe-item';
    li.dataset.id = recipe.id;
    li.textContent = recipe.name || 'Untitled Recipe';
    recipeList.appendChild(li);
  });
}

/**
 * Initialize recipe list click handling.
 */
export function initRecipeListUI() {
  const recipeList = document.getElementById('recipeList');
  if (!recipeList) return;

  recipeList.addEventListener('click', async (event) => {
    const targetLi = event.target.closest('.recipe-item');
    if (targetLi && targetLi.dataset.id) {
      const recipeId = targetLi.dataset.id;

      // Update selected state
      recipeList.querySelectorAll('.recipe-item').forEach(li => li.classList.remove('selected'));
      targetLi.classList.add('selected');

      // Show recipe details
      await showRecipeDetails(recipeId);

      // Update right column actions
      const rightColumn = document.getElementById('right-column');
      if (rightColumn && window.ActionRenderer) {
        window.ActionRenderer.render(rightColumn, window.currentRecipe);
      }
    }
  });
}