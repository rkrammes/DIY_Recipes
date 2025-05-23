import { safeSetText, showNotification } from './ui-utils.js';

/**
 * Render the ingredient table for a recipe.
 * @param {Array<Object>} ingredients
 */
export function renderRecipeIngredientsTable(ingredients) {
  const tableBody = document.querySelector('#recipeIngredientsTable tbody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  ingredients.forEach(ingredient => {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = ingredient.name || '';
    row.appendChild(nameCell);

    const qtyCell = document.createElement('td');
    qtyCell.textContent = ingredient.quantity || '';
    row.appendChild(qtyCell);

    const unitCell = document.createElement('td');
    unitCell.textContent = ingredient.unit || '';
    row.appendChild(unitCell);

    const notesCell = document.createElement('td');
    notesCell.textContent = ingredient.notes || '';
    row.appendChild(notesCell);

    tableBody.appendChild(row);
  });
}

/**
 * Create an editable row element for an ingredient.
 * @param {Object} ingredientData
 * @returns {HTMLTableRowElement}
 */
export function createEditableIngredientRow(ingredientData = {}) {
  const row = document.createElement('tr');

  const fields = ['name', 'quantity', 'unit', 'notes'];
  fields.forEach(field => {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = ingredientData[field] || '';
    input.placeholder = field;
    td.appendChild(input);
    row.appendChild(td);
  });

  const removeTd = document.createElement('td');
  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove';
  removeBtn.className = 'remove-iteration-ingredient-btn';
  removeTd.appendChild(removeBtn);
  row.appendChild(removeTd);

  return row;
}

/**
 * Update recipe statistics UI.
 * @param {Object} recipe
 */
export function updateRecipeStats(recipe) {
  safeSetText('recipeCalories', recipe.calories, 'N/A');
  safeSetText('recipeProtein', recipe.protein, 'N/A');
  safeSetText('recipeFat', recipe.fat, 'N/A');
  safeSetText('recipeCarbs', recipe.carbs, 'N/A');
}

/**
 * Show detailed info for a recipe by ID.
 * @param {string} recipeId
 */
export async function showRecipeDetails(recipeId) {
  try {
    // Fetch recipe details via API or cache
    const recipe = window.recipesCache.find(r => r.id === recipeId);
    if (!recipe) {
      showNotification('Recipe not found.', 'error');
      return;
    }
    window.currentRecipe = recipe;

    // Update UI elements
    safeSetText('recipeName', recipe.name, 'Untitled');
    safeSetText('recipeDescription', recipe.description, 'No description');
    safeSetText('recipeNotes', recipe.notes, '');

    updateRecipeStats(recipe);

    renderRecipeIngredientsTable(recipe.ingredients || []);

    const detailsView = document.getElementById('recipeDetailsView');
    if (detailsView) detailsView.style.display = 'block';
    const noRecipeView = document.getElementById('noRecipeSelectedView');
    if (noRecipeView) noRecipeView.style.display = 'none';

    const headerSection = document.getElementById('recipeHeaderSection');
    if (headerSection) headerSection.style.display = '';

  } catch (err) {
    console.error('Error loading recipe details:', err);
    showNotification(`Error loading recipe: ${err.message}`, 'error');
  }
}