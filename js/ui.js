/* ui.js */

// Define isEditMode function if not already defined.
function isEditMode() {
  const editCheckbox = document.getElementById('editModeCheckbox');
  return editCheckbox ? editCheckbox.checked : false;
}

// Function to show recipe details.
export function showRecipeDetails(recipe) {
  // Hide global ingredients view.
  const ingredientsView = document.getElementById('ingredientsView');
  if (ingredientsView) ingredientsView.style.display = 'none';

  // Show recipe details view.
  const details = document.getElementById('recipeDetails');
  if (details) {
      details.style.display = 'block';
      details.innerHTML = ''; // Clear existing content

      // Create and append a title for the recipe.
      const title = document.createElement('h2');
      title.textContent = recipe.name || "Unnamed Recipe";
      details.appendChild(title);

      // Optionally, add more detailed content about the recipe here.
      if (isEditMode()) {
          const editButton = document.createElement('button');
          editButton.textContent = "Edit Recipe";
          details.appendChild(editButton);
      }
  }
}

// Function to initialize UI on page load.
export function initUI() {
  document.addEventListener('DOMContentLoaded', async () => {
      // Setup theme selector.
      const themeSelect = document.getElementById('themeSelect');
      if (themeSelect) {
          themeSelect.addEventListener('change', (e) => {
              // Implement theme change logic here.
          });
      }

      // Setup edit mode toggle.
      const editCheckbox = document.getElementById('editModeCheckbox');
      if (editCheckbox) {
          editCheckbox.checked = window.editMode || false;
          editCheckbox.addEventListener('change', async (e) => {
              window.editMode = e.target.checked;
              // Implement any additional editing state updates here.
          });
      }

      // Load initial data.
      // You may call your data-loading function here.
  });
}

// Revised function to render a list of recipes as list items in the existing <ul id="recipeList">.
export function renderRecipes(recipes) {
  const container = document.getElementById('recipeList');
  if (!container) {
      console.error("No container found with id 'recipeList'");
      return;
  }
  // Clear any existing content.
  container.innerHTML = '';
  // Create a list item for each recipe.
  recipes.forEach(recipe => {
      const li = document.createElement('li');
      li.classList.add('recipe-item');
      li.textContent = recipe.name || "Unnamed Recipe";
      li.addEventListener('click', () => {
          showRecipeDetails(recipe);
      });
      container.appendChild(li);
  });
}

// Revised function to render a list of ingredients as list items in the existing <ul id="ingredientList">.
export function renderIngredients(ingredients) {
  const container = document.getElementById('ingredientList');
  if (!container) {
      console.error("No container found with id 'ingredientList'");
      return;
  }
  // Clear any existing content.
  container.innerHTML = '';
  // Create a list item for each ingredient.
  ingredients.forEach(ingredient => {
      const li = document.createElement('li');
      li.classList.add('ingredient-item');
      li.textContent = ingredient.name || "Unnamed Ingredient";
      container.appendChild(li);
  });
}

// New function to update the authentication button text.
export function updateAuthButton(isLoggedIn) {
  const btnLogIn = document.getElementById('btnLogIn');
  if (btnLogIn) {
      btnLogIn.textContent = isLoggedIn ? "Log Out" : "Log In";
  }
}

// Dummy login and logout functions; replace with actual authentication logic as needed.
async function logInUser() {
  console.log("Logging in...");
  // Simulate login logic.
  return true;
}

async function logOutUser() {
  console.log("Logging out...");
  // Simulate logout logic.
  return true;
}

// Attach an event listener to toggle login/logout on the btnLogIn button.
const btnLogIn = document.getElementById('btnLogIn');
if (btnLogIn) {
  btnLogIn.addEventListener('click', async () => {
      window.isLoggedIn = window.isLoggedIn || false;
      if (window.isLoggedIn) {
          // User is logged in; perform logout.
          const success = await logOutUser();
          if (success) {
              window.isLoggedIn = false;
              updateAuthButton(false);
          }
      } else {
          // User is not logged in; perform login.
          const success = await logInUser();
          if (success) {
              window.isLoggedIn = true;
              updateAuthButton(true);
          }
      }
  });
}
updateAuthButton(window.isLoggedIn || false);

// Assign exported functions to window.module for backward compatibility.
window.module = {
  showRecipeDetails,
  initUI,
  renderRecipes,
  renderIngredients
};