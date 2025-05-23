import { showNotification } from './ui-utils.js';
import { reloadData } from './app-init.js'; // Assuming reloadData is exposed here
import { addGlobalIngredient } from './api.js';

/**
 * Render the list of global ingredients.
 * @param {Array<Object>} ingredients
 */
export function renderGlobalIngredients(ingredients) {
  const list = document.getElementById('globalIngredientList');
  if (!list) return;

  list.innerHTML = '';

  ingredients.forEach(ingredient => {
    const li = document.createElement('li');
    li.className = 'ingredient-item';
    li.dataset.id = ingredient.id;
    li.textContent = ingredient.name || 'Unnamed Ingredient';
    list.appendChild(li);
  });
}

/**
 * Initialize global ingredient UI event listeners.
 */
export function initGlobalIngredientUI() {
  const btnAddGlobalIngredient = document.getElementById('btnAddGlobalIngredient');
  if (btnAddGlobalIngredient) {
    btnAddGlobalIngredient.addEventListener('click', async () => {
      if (!window.isLoggedIn || !window.isEditMode()) {
        showNotification('Log in and enable Edit Mode to add global ingredients.', 'error');
        return;
      }

      const name = prompt('Enter new global ingredient name:');
      if (!name || name.trim() === '') return;

      const description = prompt('Enter ingredient description (optional):');

      try {
        const addedIngredient = await addGlobalIngredient(name.trim(), description ? description.trim() : null);
        if (addedIngredient) {
          showNotification(`Ingredient "${addedIngredient.name}" added globally.`, 'success');
          await reloadData();
        } else {
          throw new Error('Failed to add ingredient.');
        }
      } catch (err) {
        console.error('Error adding ingredient:', err);
        showNotification(`Error: ${err.message}`, 'error');
      }
    });
  }

  const globalIngredientList = document.getElementById('globalIngredientList');
  if (globalIngredientList) {
    globalIngredientList.addEventListener('click', (event) => {
      const targetLi = event.target.closest('.ingredient-item');
      if (targetLi) {
        console.log('Global ingredient clicked:', targetLi.dataset.id);
        // Future: show details, add to recipe, etc.
      }
    });
  }
}