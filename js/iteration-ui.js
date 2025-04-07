import { showNotification } from './ui-utils.js';
import { createEditableIngredientRow } from './recipe-details-ui.js';
import { commitIteration } from './api.js'; // Assuming API function exists

/**
 * Initialize iteration editing UI.
 */
export function initIterationUI() {
  const container = document.getElementById('iterationEditContainer');
  if (!container) return;

  container.addEventListener('click', async (event) => {
    if (event.target.matches('#addIterationIngredientBtn')) {
      const tableBody = document.querySelector('#iterationEditTable tbody');
      if (tableBody) {
        const newRow = createEditableIngredientRow({});
        const placeholder = tableBody.querySelector('td[colspan]');
        if (placeholder) placeholder.parentElement.remove();
        tableBody.appendChild(newRow);
      }
    } else if (event.target.matches('.remove-iteration-ingredient-btn')) {
      const row = event.target.closest('tr');
      if (row) row.remove();
    } else if (event.target.matches('#commitIterationBtn')) {
      await handleCommitIteration();
    }
  });
}

/**
 * Gather ingredient data from the iteration edit table.
 * @returns {Array<Object>}
 */
function getIterationIngredients() {
  const rows = document.querySelectorAll('#iterationEditTable tbody tr');
  const ingredients = [];

  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const [nameInput, qtyInput, unitInput, notesInput] = inputs;

    ingredients.push({
      name: nameInput?.value.trim() || '',
      quantity: qtyInput?.value.trim() || '',
      unit: unitInput?.value.trim() || '',
      notes: notesInput?.value.trim() || '',
    });
  });

  return ingredients;
}

/**
 * Handle committing the iteration changes.
 */
async function handleCommitIteration() {
  if (!window.currentRecipe) {
    showNotification('No recipe selected.', 'error');
    return;
  }

  const ingredients = getIterationIngredients();

  try {
    const result = await commitIteration(window.currentRecipe.id, ingredients);
    if (result.success) {
      showNotification('Iteration committed successfully.', 'success');
    } else {
      throw new Error(result.message || 'Unknown error');
    }
  } catch (err) {
    console.error('Error committing iteration:', err);
    showNotification(`Error: ${err.message}`, 'error');
  }
}