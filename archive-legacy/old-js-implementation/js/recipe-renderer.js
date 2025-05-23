import AppStore from './app-store.js';

const RecipeRenderer = (function() {
  function renderRecipeList(recipes) {
    const recipeList = document.getElementById('recipeList');
    if (!recipeList) return;

    recipeList.innerHTML = '';

    recipes.forEach(recipe => {
      const item = document.createElement('li');
      item.textContent = recipe.title;
      item.dataset.id = recipe.id;
      recipeList.appendChild(item);
    });
  }

  function renderRecipeDetails(recipe) {
    const detailsContainer = document.getElementById('recipeDetails');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = '';

    if (!recipe) {
      detailsContainer.textContent = 'Select a recipe to view details.';
      return;
    }

    const title = document.createElement('h2');
    title.textContent = recipe.title;

    const description = document.createElement('p');
    description.textContent = recipe.description || '';

    detailsContainer.appendChild(title);
    detailsContainer.appendChild(description);
  }

  function initialize() {
    AppStore.subscribe(state => {
      renderRecipeList(state.recipes);

      const selectedRecipe = state.recipes.find(
        recipe => recipe.id === state.selectedRecipeId
      );

      renderRecipeDetails(selectedRecipe);
    });
  }

  return {
    initialize
  };
})();

export default RecipeRenderer;