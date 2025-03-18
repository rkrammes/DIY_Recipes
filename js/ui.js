// ui.js
import {
  addGlobalIngredient,
  removeGlobalIngredient,
  importCSVFile
} from './api.js';
import { toggleEditMode, sendMagicLink } from './auth.js';

window.editMode = false; // Global flag

function standardizeButton(btn) {
  btn.classList.add('btn');
  btn.style.width = '100%';
  btn.style.textAlign = 'left';
}

export function initUI() {
  // Theme dropdown
  const themeSelect = document.getElementById('themeSelect');
  themeSelect.addEventListener('change', () => {
    document.body.className = themeSelect.value + '-mode';
  });

  // Standardize left‑side buttons
  standardizeButton(document.getElementById('btnIngredients'));
  standardizeButton(document.getElementById('btnSendMagicLink'));

  document.getElementById('btnIngredients').addEventListener('click', showAllIngredientsView);
  document.getElementById('btnSendMagicLink').addEventListener('click', sendMagicLink);
  document.getElementById('btnEditMode').addEventListener('click', () => {
    toggleEditMode();
    window.editMode = !window.editMode;
    renderIngredients(window.allIngredients || []);
  });

  document.getElementById('csvFile').addEventListener('change', async e => {
    await importCSVFile(e.target.files[0]);
    showNotification('CSV imported', 'success');
  });
}

export function renderIngredients(ingredients) {
  window.allIngredients = ingredients;
  const container = document.getElementById('ingredientList');
  container.innerHTML = '';

  if (!ingredients.length) {
    container.innerHTML = '<li>No ingredients found.</li>';
    return;
  }

  ingredients.forEach(ing => {
    const li = document.createElement('li');
    li.style.marginBottom = '8px';

    const btn = document.createElement('button');
    btn.textContent = ing.name;
    standardizeButton(btn);

    const details = document.createElement('div');
    details.className = 'ingredient-details';
    details.style.display = 'none';
    details.style.padding = '8px';
    details.style.border = '1px solid rgba(255,255,255,0.2)';
    details.style.borderRadius = '4px';
    details.style.background = document.body.classList.contains('light-mode') ? '#f0f0f0' : 'rgba(255,255,255,0.07)';

    details.innerHTML = `
      <p><strong>ID:</strong> ${ing.id}</p>
      <p><strong>Name:</strong> ${ing.name}</p>
      <p><strong>Created:</strong> ${ing.created_at || '—'}</p>
      <p><strong>Description:</strong> ${ing.description || '—'}</p>
    `;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.classList.add('btn', 'remove-ingredient-btn');
    removeBtn.style.display = window.editMode ? 'block' : 'none';
    removeBtn.style.marginTop = '10px';
    removeBtn.addEventListener('click', async () => {
      await removeGlobalIngredient(ing.id);
      showNotification('Ingredient removed', 'success');
      renderIngredients(window.allIngredients.filter(i => i.id !== ing.id));
    });

    details.appendChild(removeBtn);

    btn.addEventListener('click', () => {
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
    });

    li.appendChild(btn);
    li.appendChild(details);
    container.appendChild(li);
  });
}

export function showAllIngredientsView() {
  document.getElementById('ingredientsView').style.display = 'block';
  document.getElementById('recipeDetails').style.display = 'none';
}

export function showNotification(message, type = 'info') {
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}
