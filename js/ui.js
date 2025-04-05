 // Import the Supabase client
import { supabaseClient } from './supabaseClient.js';
// Fixed import names to match api.js exports - this fixes the SyntaxError
// "Importing binding name 'fetchIngredients' is not found"
import { loadRecipes, loadAllIngredients, updateRecipeIngredients } from './api.js';

// Global variables
let isLoggedIn = false;
let allIngredients = []; // Global array to store all ingredients
let currentRecipe = null; // Track the currently displayed recipe

// Simple notification function - moved here to ensure it's defined before any calls
window.showNotification = function(message, type = 'info') {
  const notification = document.createElement('div');
  notification.innerText = message;

  // Basic styles
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.padding = '10px 15px';
  notification.style.borderRadius = '5px';
  notification.style.color = '#fff';
  notification.style.fontSize = '14px';
  notification.style.zIndex = 1000;
  notification.style.opacity = '0.95';

  // Color based on type
  if (type === 'success') {
    notification.style.backgroundColor = '#4CAF50';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#f44336';
  } else {
    notification.style.backgroundColor = '#2196F3';
  }

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Sets the edit mode fields based on login state.
 */
function setEditModeFields(active = null) {
  console.log('Setting edit mode fields. Active:', active);
  const editModeBtn = document.getElementById('btnEditModeToggle');
  const addRecipeBtn = document.getElementById('btnAddRecipe');
  const addGlobalIngredientBtn = document.getElementById('btnAddGlobalIngredient');

  // If active is null, use the current state from the button
  if (active === null && editModeBtn) {
    active = editModeBtn.dataset.active === 'true';
  }

  // Update button text
  if (editModeBtn) {
    editModeBtn.textContent = `Edit Mode: ${active ? 'ON' : 'OFF'}`;
    editModeBtn.dataset.active = active.toString();
  }

  // Show/hide add buttons based on edit mode and login state
  if (addRecipeBtn) {
    addRecipeBtn.style.display = (active && isLoggedIn) ? 'flex' : 'none';
  }
  if (addGlobalIngredientBtn) {
    addGlobalIngredientBtn.style.display = (active && isLoggedIn) ? 'inline-block' : 'none';
  }

  // Update any other edit-mode dependent elements
  const editElements = document.querySelectorAll('.edit-mode-element');
  editElements.forEach(el => {
    el.style.display = (active && isLoggedIn) ? 'block' : 'none';
  });
}

/**
 * Updates the authentication button based on login state.
 */
export function updateAuthButton() {
  const loginBtn = document.getElementById('btnLogIn');
  const magicLinkForm = document.getElementById('magicLinkForm');
  const editModeBtn = document.getElementById('btnEditModeToggle');

  if (loginBtn) {
    loginBtn.textContent = isLoggedIn ? 'Log Out' : 'Log In';
  }

  if (magicLinkForm) {
    magicLinkForm.style.display = (!isLoggedIn && loginBtn && loginBtn.dataset.showForm === 'true') ? 'block' : 'none';
  }

  if (editModeBtn) {
    editModeBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    // If logging out, ensure edit mode is turned off
    if (!isLoggedIn && editModeBtn.dataset.active === 'true') {
      editModeBtn.dataset.active = 'false';
      setEditModeFields(false);
    }
  }
}

/**
 * Returns the current edit mode state.
 */
export function isEditMode() {
  const editModeBtn = document.getElementById('btnEditModeToggle');
  return editModeBtn && editModeBtn.dataset.active === 'true' && isLoggedIn;
}

/**
 * Renders the recipe list in the UI.
 */
export function renderRecipes(recipes) {
  console.log('Rendering recipes:', recipes);
  const recipeList = document.getElementById('recipeList');
  if (!recipeList) return;

  // Clear existing list
  recipeList.innerHTML = '';

  // Sort recipes by title
  const sortedRecipes = [...recipes].sort((a, b) => {
    return a.title.localeCompare(b.title);
  });

  // Create list items
  sortedRecipes.forEach(recipe => {
    console.log('Rendering item: ID=' + recipe.id + ', Name=' + recipe.title);
    const li = document.createElement('li');
    li.classList.add('recipe-item');
    li.dataset.id = recipe.id;
    
    // Create a container for the recipe item content
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('recipe-item-content');
    
    // Add recipe title
    const titleSpan = document.createElement('span');
    titleSpan.textContent = recipe.title;
    titleSpan.classList.add('recipe-title');
    contentDiv.appendChild(titleSpan);
    
    // Add version badge if version > 1
    if (recipe.version && recipe.version > 1) {
      const versionBadge = document.createElement('span');
      versionBadge.textContent = `v${recipe.version}`;
      versionBadge.classList.add('version-badge');
      contentDiv.appendChild(versionBadge);
    }
    
    li.appendChild(contentDiv);
    
    // Add click event to show recipe details
    li.addEventListener('click', () => {
      // Hide ingredients view if visible
      const ingredientsView = document.getElementById('ingredientsView');
      if (ingredientsView) ingredientsView.style.display = 'none';
      
      // Show recipe details
      const recipeDetails = document.getElementById('recipeDetails');
      if (recipeDetails) {
        recipeDetails.style.display = 'block';
        recipeDetails.innerHTML = ''; // Clear previous content
        showRecipeDetails(recipe);
      }
    });
    
    recipeList.appendChild(li);
  });
}

/**
 * Renders the ingredients list in the UI, making it collapsible.
 */
export function renderIngredients(ingredients) {
  console.log('renderIngredients called with:', ingredients);
  const ingredientList = document.getElementById('currentRecipeIngredients');
  if (!ingredientList) {
    console.error('renderIngredients: Could not find element with ID "currentRecipeIngredients"');
    return;
  }

  console.log('Found ingredientList element:', ingredientList);

  // Clear existing list
  ingredientList.innerHTML = '';

  // Check if ingredients array is empty
  if (!ingredients || ingredients.length === 0) {
    console.log('No ingredients to render');
    const emptyMessage = document.createElement('li');
    emptyMessage.textContent = 'No ingredients available';
    emptyMessage.style.fontStyle = 'italic';
    ingredientList.appendChild(emptyMessage);
    return;
  }

  // Sort ingredients by name
  const sortedIngredients = [...ingredients].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  console.log('Sorted ingredients for rendering:', sortedIngredients);

  // Create list items
  sortedIngredients.forEach(ingredient => {
    console.log('Rendering ingredient:', ingredient);
    const li = document.createElement('li');
    li.classList.add('ingredient-item');
    // Use ingredient_id if available, fall back to id for compatibility
    li.dataset.id = ingredient.ingredient_id || ingredient.id || '';
    
    // --- Summary Section (Always Visible) ---
    const summaryDiv = document.createElement('div');
    summaryDiv.classList.add('ingredient-summary');
    summaryDiv.style.display = 'flex';
    summaryDiv.style.justifyContent = 'space-between';
    summaryDiv.style.alignItems = 'center';
    summaryDiv.style.width = '100%';
    
    // Add ingredient name
    const nameDiv = document.createElement('div');
    nameDiv.classList.add('ingredient-name');
    nameDiv.textContent = ingredient.name;
    nameDiv.style.fontWeight = 'bold';
    nameDiv.style.flex = '1';
    summaryDiv.appendChild(nameDiv);
    
    // Add quantity and unit if available
    if (ingredient.quantity || ingredient.unit) {
      const quantityDiv = document.createElement('div');
      quantityDiv.classList.add('ingredient-quantity');
      quantityDiv.textContent = `${ingredient.quantity || ''} ${ingredient.unit || ''}`.trim();
      quantityDiv.style.marginLeft = '12px';
      quantityDiv.style.padding = '3px 8px';
      quantityDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      quantityDiv.style.borderRadius = '4px';
      quantityDiv.style.fontWeight = 'bold';
      quantityDiv.style.color = 'var(--accent-orange)';
      summaryDiv.appendChild(quantityDiv);
    }
    
    li.appendChild(summaryDiv);
    
    // --- Details Section (Initially Hidden) ---
    const detailsDiv = document.createElement('div');
    detailsDiv.classList.add('ingredient-details');
    detailsDiv.style.display = 'none'; // Hide details by default
    detailsDiv.style.marginTop = '5px';
    detailsDiv.style.paddingLeft = '10px'; // Indent details slightly
    detailsDiv.style.borderLeft = '2px solid rgba(255, 255, 255, 0.2)'; // Visual indicator for details
    
    // Add ingredient description if available
    if (ingredient.description) {
      const descDiv = document.createElement('div');
      descDiv.classList.add('ingredient-description');
      descDiv.textContent = ingredient.description;
      descDiv.style.fontSize = '0.9em';
      descDiv.style.marginBottom = '3px';
      detailsDiv.appendChild(descDiv);
    }
    
    // Add notes if available
    if (ingredient.notes) {
      const notesDiv = document.createElement('div');
      notesDiv.classList.add('ingredient-notes');
      notesDiv.textContent = `Note: ${ingredient.notes}`;
      notesDiv.style.fontStyle = 'italic';
      notesDiv.style.fontSize = '0.9em';
      detailsDiv.appendChild(notesDiv);
    }
    
    // Only add detailsDiv if it has content
    if (detailsDiv.hasChildNodes()) {
      li.appendChild(detailsDiv);
    }
    
    // --- Click Handler for Collapsing/Expanding ---
    li.style.cursor = 'pointer';
    li.style.padding = '8px';
    li.style.marginBottom = '5px'; // Reduced margin for compactness
    li.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    li.style.borderRadius = '4px';
    li.style.transition = 'background-color 0.2s ease';
    
    li.addEventListener('click', () => {
      console.log('Ingredient clicked:', ingredient.name);
      // Toggle the 'expanded' class and the display of detailsDiv
      li.classList.toggle('expanded');
      if (detailsDiv.hasChildNodes()) { // Only toggle if there are details to show
        detailsDiv.style.display = li.classList.contains('expanded') ? 'block' : 'none';
      }
      // Optional: visual feedback on expand/collapse
      if (li.classList.contains('expanded')) {
        li.style.backgroundColor = 'rgba(0, 123, 255, 0.05)';
      } else {
        li.style.backgroundColor = '';
      }
    });
    
    ingredientList.appendChild(li);
  });
  
  console.log('Finished rendering ingredients, count:', sortedIngredients.length);
}

/**
 * Shows the details of a recipe.
 */
export async function showRecipeDetails(recipe) {
  // Update recipe stats in the quick stats section
  updateRecipeStats(recipe);
  console.log('Showing recipe details for:', recipe);
  console.log('Recipe object before showing details:', JSON.stringify(recipe, null, 2));

  currentRecipe = recipe; // Store the current recipe
  
  // Update the selected recipe title in the header
  const selectedRecipeTitle = document.getElementById('selectedRecipeTitle');
  if (selectedRecipeTitle) {
    selectedRecipeTitle.textContent = recipe.title || 'Select a Recipe';
  }

  const details = document.getElementById('recipeDetails'); // Left column container
  const recipeHeader = document.getElementById('recipe-header'); // Header above left column

  if (!details || !recipeHeader) {
    console.error('Missing essential layout elements (recipeDetails or recipe-header)');
    return;
  }

  // Dynamically create middle and right columns if missing
  let ingredientsColumn = document.getElementById('ingredients-column');
  if (!ingredientsColumn) {
    ingredientsColumn = document.createElement('section');
    ingredientsColumn.id = 'ingredients-column';
    details.parentNode.insertBefore(ingredientsColumn, details.nextSibling);
  }

  let currentRecipeColumn = document.getElementById('current-recipe-column');
  if (!currentRecipeColumn) {
    currentRecipeColumn = document.createElement('section');
    currentRecipeColumn.id = 'current-recipe-column';
    ingredientsColumn.parentNode.insertBefore(currentRecipeColumn, ingredientsColumn.nextSibling);
  }

  // Clear previous content
  details.innerHTML = '';
  recipeHeader.innerHTML = '';
  ingredientsColumn.innerHTML = '';
  currentRecipeColumn.innerHTML = '';

  try {
    console.log('Fetching ingredients for recipe ID:', recipe.id);
    const { data: ingredientsData, error: ingredientsError } = await supabaseClient
      .from('recipeingredients')
      .select('*, ingredients(*)')
      .eq('recipe_id', recipe.id)
      .order('name', { foreignTable: 'ingredients' });

    console.log('Raw ingredients data from query:', ingredientsData);

    if (ingredientsError) {
      console.error('Error fetching ingredients:', ingredientsError);
    }

    if (ingredientsData && Array.isArray(ingredientsData)) {
      console.log(`Found ${ingredientsData.length} ingredients for recipe ${recipe.id}`);
      recipe.ingredients = ingredientsData.map(item => {
        console.log('Processing ingredient item:', item);
        if (!item.ingredients) {
          console.warn(`Missing joined ingredient data for recipeingredients item ID: ${item.id}`);
          return null;
        }
        const mappedIngredient = {
          ingredient_id: item.ingredients.id,
          name: item.ingredients.name,
          description: item.ingredients.description,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes,
          recipe_ingredient_id: item.id
        };
        console.log('Mapped ingredient:', mappedIngredient);
        return mappedIngredient;
      }).filter(item => item !== null);
      console.log(`After mapping: ${recipe.ingredients.length} valid ingredients`);
    } else {
      console.warn('No ingredients data returned or data is not an array');
      recipe.ingredients = [];
    }

    // Recipe title in header
    const titleH3 = document.createElement('h3');
    titleH3.textContent = recipe.title;
    recipeHeader.appendChild(titleH3);

    // Remove button in header
    const removeRecipeBtn = document.createElement('button');
    removeRecipeBtn.id = 'removeRecipeBtn';
    removeRecipeBtn.classList.add('remove-recipe-btn', 'btn');
    removeRecipeBtn.textContent = 'Remove This Recipe';
    removeRecipeBtn.style.marginLeft = '1rem';
    removeRecipeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('Are you sure you want to remove this recipe?')) {
        try {
          const { error } = await supabaseClient
            .from('recipes')
            .delete()
            .eq('id', recipe.id);
          if (error) throw error;
          alert('Recipe removed successfully.');
          location.reload();
        } catch (err) {
          console.error('Error removing recipe:', err);
          alert('Failed to remove recipe.');
        }
      }
    });
    recipeHeader.appendChild(removeRecipeBtn);

    // --- Left column content (ingredients list) ---
    const toggleAllBtn = document.createElement('button');
    toggleAllBtn.className = 'btn';
    toggleAllBtn.textContent = 'Collapse All';
    toggleAllBtn.setAttribute('aria-pressed', 'false');
    toggleAllBtn.style.marginBottom = 'var(--spacing-medium)';
    toggleAllBtn.addEventListener('click', () => {
      const containers = ingredientsColumn.querySelectorAll('.collapsible-container');
      const shouldExpand = toggleAllBtn.textContent === 'Expand All';
      containers.forEach(container => {
        container.setAttribute('aria-expanded', String(shouldExpand));
        const header = container.querySelector('.collapsible-header');
        if (header) header.setAttribute('aria-expanded', String(shouldExpand));
        container.classList.toggle('expanded', shouldExpand);
      });
      toggleAllBtn.textContent = shouldExpand ? 'Collapse All' : 'Expand All';
      toggleAllBtn.setAttribute('aria-pressed', String(shouldExpand));
    });
    ingredientsColumn.prepend(toggleAllBtn);

    // Ingredients collapsible (default expanded)
    const ingredientsCollapsible = document.createElement('div');
    ingredientsCollapsible.className = 'collapsible-container';
    ingredientsCollapsible.setAttribute('aria-expanded', 'true');

    const ingredientsHeader = document.createElement('button');
    ingredientsHeader.type = 'button';
    ingredientsHeader.className = 'collapsible-header';
    ingredientsHeader.setAttribute('aria-controls', 'ingredients-content');
    ingredientsHeader.setAttribute('aria-expanded', 'true');
    ingredientsHeader.innerHTML = `
      <span>Ingredients</span>
      <span class="collapsible-icon">&#9654;</span>
    `;

    ingredientsHeader.addEventListener('click', () => {
      const expanded = ingredientsCollapsible.getAttribute('aria-expanded') === 'true';
      ingredientsCollapsible.setAttribute('aria-expanded', String(!expanded));
      ingredientsHeader.setAttribute('aria-expanded', String(!expanded));
      ingredientsCollapsible.classList.toggle('expanded', !expanded);
    });

    ingredientsHeader.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ingredientsHeader.click();
      }
    });

    const ingredientsContent = document.createElement('div');
    ingredientsContent.className = 'collapsible-content';
    ingredientsContent.id = 'ingredients-content';

    const ingredientsContainer = document.createElement('div');
    ingredientsContainer.style.maxHeight = '400px';
    ingredientsContainer.style.overflowY = 'auto';
    ingredientsContainer.style.marginBottom = 'var(--spacing-medium)';
    ingredientsContainer.style.padding = '10px';
    ingredientsContainer.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    ingredientsContainer.style.borderRadius = '4px';
    ingredientsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';

    const ingredientsContainerHeading = document.createElement('div');
    ingredientsContainerHeading.style.marginBottom = '10px';
    ingredientsContainerHeading.style.fontSize = '14px';
    ingredientsContainerHeading.style.fontStyle = 'italic';
    ingredientsContainerHeading.style.color = 'var(--accent-orange)';
    ingredientsContainer.appendChild(ingredientsContainerHeading);

    const currentIngredientsList = document.createElement('ul');
    currentIngredientsList.id = 'currentRecipeIngredients';
    currentIngredientsList.style.listStyle = 'none';
    currentIngredientsList.style.padding = '0';
    currentIngredientsList.style.margin = '0';

    ingredientsContainer.appendChild(currentIngredientsList);
    ingredientsContent.appendChild(ingredientsContainer);

    ingredientsCollapsible.appendChild(ingredientsHeader);
    ingredientsCollapsible.appendChild(ingredientsContent);
    ingredientsColumn.appendChild(ingredientsCollapsible);

    setTimeout(() => {
      console.log('About to render ingredients for recipe:', recipe.id);
      console.log('Final ingredients data to render:', JSON.stringify(recipe.ingredients || []));
      console.log('Calling renderIngredients with ingredients array');
      renderIngredients(recipe.ingredients || []);
      console.log('Returned from renderIngredients call');
    }, 0);

    // --- Middle column content (description + instructions) ---
    const middleContent = document.createElement('div');
    middleContent.style.display = 'flex';
    middleContent.style.flexDirection = 'column';
    middleContent.style.gap = '1rem';

    // Description section (non-collapsible)
    const descriptionSection = document.createElement('div');
    descriptionSection.className = 'description-section';
    descriptionSection.innerHTML = `
      <h4>Description</h4>
      <p>${recipe.description || 'No description provided'}</p>
      <p><strong>Prep Time:</strong> ${recipe.prep_time || 'N/A'}</p>
      <p><strong>Cook Time:</strong> ${recipe.cook_time || 'N/A'}</p>
      <p><strong>Servings:</strong> ${recipe.servings || 'N/A'}</p>
      <p><strong>Category:</strong> ${recipe.category || 'N/A'}</p>
    `;
    middleContent.appendChild(descriptionSection);

    // Instructions collapsible
    const instructionsCollapsible = document.createElement('div');
    instructionsCollapsible.className = 'collapsible-container';
    instructionsCollapsible.setAttribute('aria-expanded', 'false');

    const instructionsHeader = document.createElement('button');
    instructionsHeader.type = 'button';
    instructionsHeader.className = 'collapsible-header';
    instructionsHeader.setAttribute('aria-controls', 'instructions-content-middle');
    instructionsHeader.setAttribute('aria-expanded', 'false');
    instructionsHeader.innerHTML = `
      <span>Instructions</span>
      <span class="collapsible-icon">&#9654;</span>
    `;

    const instructionsContent = document.createElement('div');
    instructionsContent.className = 'collapsible-content';
    instructionsContent.id = 'instructions-content-middle';
    instructionsContent.innerHTML = recipe.instructions || 'No instructions provided';

    instructionsHeader.addEventListener('click', () => {
      const expanded = instructionsCollapsible.getAttribute('aria-expanded') === 'true';
      instructionsCollapsible.setAttribute('aria-expanded', String(!expanded));
      instructionsHeader.setAttribute('aria-expanded', String(!expanded));
      instructionsCollapsible.classList.toggle('expanded', !expanded);
    });

    instructionsHeader.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        instructionsHeader.click();
      }
    });

    instructionsCollapsible.appendChild(instructionsHeader);
    instructionsCollapsible.appendChild(instructionsContent);
    currentRecipeColumn.parentNode.insertBefore(middleContent, currentRecipeColumn);
    middleContent.appendChild(instructionsCollapsible);

    // Helper to create other collapsible sections
    function createCollapsibleSection(title, contentHtml, idSuffix, colorType = 'neutral') {
      const container = document.createElement('div');
      container.className = 'collapsible-container';
      container.setAttribute('aria-expanded', 'false');
      container.setAttribute('data-color', colorType); // Add color type attribute

      const header = document.createElement('button');
      header.type = 'button';
      header.className = 'collapsible-header';
      header.setAttribute('aria-controls', `${idSuffix}-content`);
      header.setAttribute('aria-expanded', 'false');
      header.innerHTML = `
        <span>${title}</span>
        <span class="collapsible-icon">&#9654;</span>
      `;

      const content = document.createElement('div');
      content.className = 'collapsible-content';
      content.id = `${idSuffix}-content`;
      content.innerHTML = contentHtml;

      header.addEventListener('click', () => {
        const expanded = container.getAttribute('aria-expanded') === 'true';
        container.setAttribute('aria-expanded', String(!expanded));
        header.setAttribute('aria-expanded', String(!expanded));
        container.classList.toggle('expanded', !expanded);
      });

      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });

      container.appendChild(header);
      container.appendChild(content);
      return container;
    }
    
    // Function to toggle all collapsible sections in a group
    // This function has been moved outside of showRecipeDetails to be accessible globally
if (recipe.notes) {
  const notesSection = createCollapsibleSection('Notes', recipe.notes, 'notes', 'blue');
  currentRecipeColumn.appendChild(notesSection);
}

if (recipe.nutrition) {
  const nutritionSection = createCollapsibleSection('Nutrition', recipe.nutrition, 'nutrition', 'blue');
  currentRecipeColumn.appendChild(nutritionSection);
}

if (recipe.media) {
  const mediaSection = createCollapsibleSection('Media', recipe.media, 'media', 'neutral');
  currentRecipeColumn.appendChild(mediaSection);
}

if (recipe.comments) {
  const commentsSection = createCollapsibleSection('Comments', recipe.comments, 'comments', 'neutral');
  currentRecipeColumn.appendChild(commentsSection);
}

// Version History
const versionHistorySection = createCollapsibleSection(
  'Version History',
  recipe.version > 1 ? `<p>Current version: v${recipe.version}</p>` : '<p>This is the first version of this recipe.</p>',
  'version-history',
  'orange'
);
currentRecipeColumn.appendChild(versionHistorySection);

// Iteration Management
const iterationSection = createCollapsibleSection(
  'Iteration Management',
  '<p>No iterations available.</p>',
  'iteration-management',
  'orange'
);
currentRecipeColumn.appendChild(iterationSection);

// AI Suggestions
const aiSuggestionsSection = createCollapsibleSection(
  'AI Suggestions',
  '<p>No AI suggestions available.</p>',
  'ai-suggestions',
  'neutral'
);
currentRecipeColumn.appendChild(aiSuggestionsSection);



    details.appendChild(bottomContentDiv);

    // --- Right column content ---
    const iterationHeading = document.createElement('h3');
    iterationHeading.textContent = 'Kraft';
    currentRecipeColumn.appendChild(iterationHeading);

    const aiHeader = document.createElement('div');
    aiHeader.style.display = 'flex';
    aiHeader.style.justifyContent = 'space-between';
    aiHeader.style.alignItems = 'center';
    aiHeader.style.marginBottom = '10px';
    aiHeader.style.marginTop = 'var(--spacing-medium)';

    const aiHeading = document.createElement('h3');
    aiHeading.textContent = 'AI Suggestions';
    aiHeader.appendChild(aiHeading);
    currentRecipeColumn.appendChild(aiHeader);

    const aiInput = document.createElement('input');
    aiInput.id = 'aiPrompt';
    aiInput.placeholder = 'Get AI Suggestion (coming soon)';
    aiInput.classList.add('sidebar-textbox');
    aiInput.style.width = 'calc(100% - 22px)';
    aiInput.style.marginBottom = '5px';
    currentRecipeColumn.appendChild(aiInput);

    const aiButton = document.createElement('button');
    aiButton.id = 'btnGetAISuggestion';
    aiButton.textContent = 'Suggest';
    aiButton.classList.add('btn');
    aiButton.disabled = true;
    aiButton.style.marginBottom = '10px';
    currentRecipeColumn.appendChild(aiButton);

    const aiSuggestionsList = document.createElement('ul');
    aiSuggestionsList.id = 'aiSuggestionsList';
    aiSuggestionsList.style.listStyle = 'none';
    aiSuggestionsList.style.padding = '0';
    aiSuggestionsList.style.maxHeight = '150px';
    aiSuggestionsList.style.overflowY = 'auto';
    aiSuggestionsList.style.border = '1px dashed #ccc';
    aiSuggestionsList.style.padding = '5px';
    aiSuggestionsList.textContent = 'Suggestions will appear here...';
    currentRecipeColumn.appendChild(aiSuggestionsList);

    const tableContainer = document.createElement('div');
    tableContainer.classList.add('tableContainer');
    tableContainer.style.flexGrow = '1';
    tableContainer.style.overflowY = 'auto';
    tableContainer.style.marginBottom = 'var(--spacing-medium)';

    const editTable = document.createElement('table');
    editTable.style.width = '100%';
    editTable.style.borderCollapse = 'collapse';
    editTable.id = 'iterationEditTable';

    const editHeaderRow = document.createElement('tr');
    ['Ingredient', 'Quantity', 'Unit', 'Notes', 'Actions'].forEach(txt => {
      const th = document.createElement('th');
      th.textContent = txt;
      th.style.padding = '8px';
      th.style.border = '1px solid #444';
      editHeaderRow.appendChild(th);
    });
    editTable.appendChild(editHeaderRow);

    if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach(ing => {
        const row = createEditableIngredientRow(ing);
        editTable.appendChild(row);
      });
    } else {
      const placeholderRow = editTable.insertRow();
      const cell = placeholderRow.insertCell();
      cell.colSpan = 5;
      cell.textContent = 'No ingredients yet. Add one below!';
      cell.style.textAlign = 'center';
      cell.style.padding = '10px';
      cell.style.fontStyle = 'italic';
    }
    tableContainer.appendChild(editTable);
    currentRecipeColumn.appendChild(tableContainer);

    const addIngredientBtn = document.createElement('button');
    addIngredientBtn.textContent = '+ Add Ingredient Row';
    addIngredientBtn.classList.add('btn');
    addIngredientBtn.id = 'addIterationIngredientBtn';
    addIngredientBtn.style.marginBottom = 'var(--spacing-small)';
    addIngredientBtn.addEventListener('click', () => {
      const newRow = createEditableIngredientRow({});
      const placeholder = editTable.querySelector('td[colspan="5"]');
      if (placeholder) placeholder.parentElement.remove();
      editTable.appendChild(newRow);
      setEditModeFields();
    });
    currentRecipeColumn.appendChild(addIngredientBtn);

    const commitBtn = document.createElement('button');
    commitBtn.id = 'commitRecipeBtn';
    commitBtn.textContent = 'Commit Iteration';
    commitBtn.classList.add('btn');
    commitBtn.addEventListener('click', async () => {
      await doCommitIteration(recipe, editTable);
    });
    currentRecipeColumn.appendChild(commitBtn);

    setEditModeFields();

  } catch (error) {
    console.error('Error in showRecipeDetails:', error);
    details.innerHTML = `<p>Error loading recipe details.</p>`;
  }
}

/**
 * Helper function to create a row for the editable ingredients table.
 */
export function createEditableIngredientRow(ingredientData) {
  console.log('--- Creating editable row ---');
  console.log('Received ingredientData:', JSON.stringify(ingredientData, null, 2));
  console.log('Available allIngredients:', JSON.stringify(allIngredients.map(i => ({id: i.id, name: i.name})), null, 2)); // Log available IDs/names
  const row = document.createElement('tr');
  // Use the *actual* ingredient ID for the dataset if available.
  // For new rows, it will be undefined initially.
  const actualIngredientId = ingredientData.ingredient_id !== undefined ? String(ingredientData.ingredient_id) : `new_${Date.now()}`;
  row.dataset.ingredientId = actualIngredientId;
  // Store the recipe_ingredient_id separately if needed for updates/deletes later
  if (ingredientData.recipe_ingredient_id) {
      row.dataset.recipeIngredientId = String(ingredientData.recipe_ingredient_id);
  }
  console.log(`Set row.dataset.ingredientId to: ${actualIngredientId}`);

  const fields = ['name', 'quantity', 'unit', 'notes'];
  fields.forEach(field => {
    const cell = document.createElement('td');
    cell.style.border = '1px solid #444';
    cell.style.padding = '8px';

    if (field === 'name') {
      const select = document.createElement('select');
      select.dataset.field = field;
      select.style.width = '100%';

      // Add a default placeholder option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select Ingredient...';
      defaultOption.disabled = true; // Make it non-selectable unless it's the only option
      select.appendChild(defaultOption);

      // Populate with global ingredients
      allIngredients.forEach(ing => {
        const option = document.createElement('option');
        option.value = ing.id; // Use ID as value
        option.textContent = ing.name;
        // Get the actual ingredient ID from the row data being processed
        const currentIngredientId = ingredientData.ingredient_id !== undefined ? String(ingredientData.ingredient_id) : null;
        // Get the ingredient ID for the current option in the dropdown
        const optionIngredientId = ing.id !== undefined ? String(ing.id) : null;

        // Log the comparison right before the check
        console.log(`  -> Comparing option ID: '${optionIngredientId}' (Type: ${typeof optionIngredientId}) with current data's ingredient_id: '${currentIngredientId}' (Type: ${typeof currentIngredientId})`);

        // First try to match by ID
        if (currentIngredientId !== null && optionIngredientId !== null && optionIngredientId === currentIngredientId) {
          option.setAttribute('selected', 'selected');
          defaultOption.disabled = false; // Allow re-selecting placeholder if needed
          console.log(`     MATCH FOUND BY ID! Selecting option: ID=${optionIngredientId}, Name=${ing.name}`);
        }
        // If ID doesn't match, try to match by name (case-insensitive and trimmed)
        else if (ingredientData.name && ing.name &&
                 ingredientData.name.trim().toLowerCase() === ing.name.trim().toLowerCase()) {
          option.setAttribute('selected', 'selected');
          defaultOption.disabled = false;
          console.log(`     MATCH FOUND BY NAME! Selecting option: ID=${optionIngredientId}, Name=${ing.name}`);
        }
        // If name doesn't match exactly, try partial matching
        else if (ingredientData.name && ing.name &&
                 (ingredientData.name.trim().toLowerCase().includes(ing.name.trim().toLowerCase()) ||
                  ing.name.trim().toLowerCase().includes(ingredientData.name.trim().toLowerCase()))) {
          option.setAttribute('selected', 'selected');
          defaultOption.disabled = false;
          console.log(`     MATCH FOUND BY PARTIAL NAME! Selecting option: ID=${optionIngredientId}, Name=${ing.name}`);
        }
        select.appendChild(option);
      });

      // If no ingredient was pre-selected, make the placeholder selected
      if (!select.querySelector('option[selected="selected"]')) {
        defaultOption.setAttribute('selected', 'selected');
      } else {
        // Make sure the dropdown shows the selected value
        const selectedOption = select.querySelector('option[selected="selected"]');
        if (selectedOption) {
          select.value = selectedOption.value;
          // Force a change event to ensure the UI updates
          const event = new Event('change', { bubbles: true });
          select.dispatchEvent(event);
        }
      }


      cell.appendChild(select);
    } else {
      // Handle other fields as before (quantity, unit, notes)
      const input = document.createElement('input');
      input.dataset.field = field;
      input.placeholder = field.charAt(0).toUpperCase() + field.slice(1) + '?';
      input.value = ingredientData[field] !== undefined ? ingredientData[field] : '';
      input.style.width = '100%';
      if (field === 'quantity') {
        input.type = 'number';
        input.min = '0'; // Optional: prevent negative quantities
        input.step = 'any'; // Optional: allow decimals
      }
      cell.appendChild(input);
    }
    row.appendChild(cell);
  });

  const actionCell = document.createElement('td');
  actionCell.style.border = '1px solid #444';
  actionCell.style.padding = '8px';
  actionCell.style.textAlign = 'center';
  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'X';
  removeBtn.classList.add('btn', 'remove-iteration-ingredient-btn');
  removeBtn.style.padding = '4px 8px';
  removeBtn.dataset.targetRowId = row.dataset.ingredientId; // Use the actualIngredientId stored earlier
  removeBtn.addEventListener('click', (e) => {
    e.target.closest('tr').remove();
    const table = e.target.closest('table');
    if (table && table.rows.length <= 1) { // Check if only header row remains
      const placeholderRow = table.insertRow(); // Add placeholder if table becomes empty
      const cell = placeholderRow.insertCell();
      cell.colSpan = 5;
      cell.textContent = 'No ingredients yet. Add one below!';
      cell.style.textAlign = 'center';
      cell.style.padding = '10px';
      cell.style.fontStyle = 'italic';
    }
  });
  actionCell.appendChild(removeBtn);
  row.appendChild(actionCell);

  return row;
}

/**
 * Commits the new iteration data from the editable table.
 */
export async function doCommitIteration(currentRecipe, iterationTable) {
  console.log("Commit button clicked. Recipe ID:", currentRecipe.id);
  console.log("Recipe data:", JSON.stringify(currentRecipe, null, 2));
  console.log("Iteration table found:", !!iterationTable);

  const updatedIngredients = [];
  const rows = iterationTable.querySelectorAll('tr');
  console.log(`Found ${rows.length} rows in iteration table (including header)`);
  let commitError = null; // Flag to store potential errors during row processing

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Check if this is the placeholder row added when table is empty
    if (row.querySelector('td[colspan="5"]')) {
        continue; // Skip placeholder row
    }

    const inputs = row.querySelectorAll('input[data-field], select[data-field]');
    const ingredient = {}; // Start with an empty object
    let isEmptyRow = true;
    let selectedIngredientId = null;
    let selectedIngredientName = null;

    inputs.forEach(input => {
      const field = input.dataset.field;
      const value = input.value.trim();

      if (input.tagName === 'SELECT' && field === 'name') {
        if (input.selectedIndex > 0) { // Ensure a valid ingredient is selected
          selectedIngredientId = input.value; // ID is the value of the selected option
          selectedIngredientName = input.options[input.selectedIndex].textContent;
          ingredient['id'] = selectedIngredientId; // Store the actual ingredient ID
          ingredient['name'] = selectedIngredientName; // Store the name
          isEmptyRow = false;
        }
      } else if (input.tagName === 'INPUT') {
        if (value) {
          ingredient[field] = value; // Store quantity, unit, notes
          isEmptyRow = false; // Any input makes the row non-empty
        } else {
           ingredient[field] = null; // Ensure field exists even if empty, might be needed for update
        }
      }
    });

    // Add the ingredient to the list only if an ingredient was actually selected
    if (!isEmptyRow && selectedIngredientId) {
        // We already added id and name from the select logic
        // Ensure quantity and unit have values (or default/null)
        if (ingredient.quantity === undefined) ingredient.quantity = null; // Or 0? Depends on DB schema
        if (ingredient.unit === undefined) ingredient.unit = null;
        if (ingredient.notes === undefined) ingredient.notes = null;

        console.log("Adding ingredient to commit list:", JSON.stringify(ingredient));
        updatedIngredients.push(ingredient);
    } else if (!isEmptyRow && !selectedIngredientId) {
        // Row has data but no ingredient selected from dropdown
        alert(`Ingredient in row ${i} is not selected.`);
        commitError = `Ingredient not selected in row ${i}`; // Store the error message
        break; // Stop processing rows immediately on error
    }
  }

  // If an error occurred during row processing, stop the commit
  if (commitError) {
      console.error("Commit aborted due to error:", commitError);
      return; // Stop the commit process
  }

  // Proceed with commit if no errors
  console.log("Final updated ingredients data to commit:", updatedIngredients);

  try {
      const newVersion = (currentRecipe.version || 0) + 1;
  
      // 1. Update the recipe version only
      const { error: recipeUpdateError } = await supabaseClient
        .from('recipes')
        .update({ version: newVersion })
        .eq('id', currentRecipe.id);
  
      if (recipeUpdateError) throw recipeUpdateError;
  
      // 2. Update the recipeingredients join table
      const success = await updateRecipeIngredients(currentRecipe.id, updatedIngredients);
      if (!success) throw new Error('Failed to update recipe ingredients');
  
      showNotification('Iteration committed successfully!', 'success');
      await reloadData();
  
    } catch (err) {
      console.error('Error committing iteration:', err);
      showNotification(`Error committing iteration: ${err.message}`, 'error');
    }
}

/**
 * Handles AI suggestion request (Placeholder).
 */
async function doAISuggestion(promptValue, recipeObj) {
  alert('AI Suggestions coming soon!');
}

/**
 * Updates a specific ingredient property (Placeholder).
 */
async function doUpdateIngredient(ingObj, prop, newValue) {
  console.warn('doUpdateIngredient not implemented');
}

/**
 * Reloads data from the server.
 */
export async function reloadData() {
  console.log('reloadData: Starting to reload application data...');
  try {
    // Fetch recipes
    console.log('reloadData: Fetching recipes from API...');
    const recipes = await loadRecipes();
    console.log(`reloadData: Recipes loaded: ${recipes.length} recipes found`);
    console.log('reloadData: First few recipes:', recipes.slice(0, 3).map(r => ({ id: r.id, title: r.title })));
    renderRecipes(recipes);
    
    // Fetch ingredients for the global list
    console.log('reloadData: Fetching all ingredients from API...');
    allIngredients = await loadAllIngredients();
    console.log(`reloadData: All ingredients loaded: ${allIngredients.length} ingredients found`);
    console.log('reloadData: First few ingredients:', allIngredients.slice(0, 5).map(i => ({ id: i.id, name: i.name })));
    
    // Only render ingredients if we're in the ingredients view
    const ingredientsView = document.getElementById('ingredientsView');
    if (ingredientsView && ingredientsView.style.display !== 'none') {
      console.log('reloadData: Rendering ingredients in the ingredients view');
      const ingredientList = document.getElementById('ingredientList');
      if (ingredientList) {
        renderIngredients(allIngredients);
      }
    }
l    
    console.log('Data reloaded successfully.');
    return true;
  } catch (error) {
    console.error('Error reloading data:', error);
    showNotification('Error loading data. Please try again.', 'error');
    return false;
  }
}

/**
 * Initializes the UI components, sets up event listeners, and loads initial data.
 */
// Setup collapsible sections for a recipe
/**
 * Sets up the collapsible sections for recipes.
 * Handles both column-level and individual collapsible elements.
 */
function setupRecipeCollapsibles() {
  // Setup middle column collapsibles
  setupCollapsibleGroup('middleColumnCollapsibles', 'toggleMiddleColumnBtn');
  
  // Setup right column collapsibles
  setupCollapsibleGroup('rightColumnCollapsibles', 'toggleRightColumnBtn');
  
  // Setup ingredients toggle
  const toggleIngredientsBtn = document.getElementById('toggleIngredientsBtn');
  if (toggleIngredientsBtn) {
    toggleIngredientsBtn.addEventListener('click', () => {
      const ingredientItems = document.querySelectorAll('#currentRecipeIngredients .ingredient-item');
      const shouldExpand = toggleIngredientsBtn.querySelector('.label').textContent === 'Expand All';
      
      ingredientItems.forEach(item => {
        const detailsDiv = item.querySelector('.ingredient-details');
        if (detailsDiv && detailsDiv.hasChildNodes()) {
          item.classList.toggle('expanded', shouldExpand);
          detailsDiv.style.display = shouldExpand ? 'block' : 'none';
          
          // Add visual feedback for expanded state
          if (shouldExpand) {
            item.style.backgroundColor = 'rgba(0, 123, 255, 0.05)';
            item.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          } else {
            item.style.backgroundColor = '';
            item.style.boxShadow = '';
          }
        }
      });
      
      // Update toggle button state
      toggleIngredientsBtn.querySelector('.label').textContent = shouldExpand ? 'Collapse All' : 'Expand All';
      toggleIngredientsBtn.setAttribute('aria-pressed', String(shouldExpand));
      toggleIngredientsBtn.querySelector('.icon').textContent = shouldExpand ? '⊖' : '⊕';
    });
  }
  
  // Setup individual collapsible headers
  setupIndividualCollapsibles();
}

/**
 * Sets up a collapsible group with a toggle button.
 * @param {string} groupId - The ID of the collapsible group container.
 * @param {string} buttonId - The ID of the toggle button.
 */
function setupCollapsibleGroup(groupId, buttonId) {
  const toggleBtn = document.getElementById(buttonId);
  if (!toggleBtn) return;
  
  toggleBtn.addEventListener('click', () => {
    const group = document.getElementById(groupId);
    if (!group) return;
    
    const containers = group.querySelectorAll('.collapsible-container');
    const shouldExpand = toggleBtn.querySelector('.label').textContent === 'Expand All';
    
    // Apply animation in sequence for a staggered effect
    containers.forEach((container, index) => {
      setTimeout(() => {
        container.setAttribute('aria-expanded', String(shouldExpand));
        const header = container.querySelector('.collapsible-header');
        if (header) header.setAttribute('aria-expanded', String(shouldExpand));
        container.classList.toggle('expanded', shouldExpand);
      }, index * 50); // 50ms delay between each container
    });
    
    // Update toggle button state
    toggleBtn.querySelector('.label').textContent = shouldExpand ? 'Collapse All' : 'Expand All';
    toggleBtn.setAttribute('aria-pressed', String(shouldExpand));
    toggleBtn.querySelector('.icon').textContent = shouldExpand ? '⊖' : '⊕';
  });
}

/**
 * Sets up individual collapsible sections with proper ARIA attributes and animations.
 */
function setupIndividualCollapsibles() {
  const collapsibles = document.querySelectorAll('.collapsible-container');
  
  collapsibles.forEach(container => {
    const header = container.querySelector('.collapsible-header');
    const content = container.querySelector('.collapsible-content');
    
    if (!header || !content) return;
    
    // Ensure proper ARIA attributes
    const contentId = content.id || `collapsible-content-${Math.random().toString(36).substr(2, 9)}`;
    content.id = contentId;
    header.setAttribute('aria-controls', contentId);
    
    // Set up click handler with improved animation
    header.addEventListener('click', () => {
      const isExpanded = container.getAttribute('aria-expanded') === 'true';
      const newExpandedState = !isExpanded;
      
      // Update ARIA states
      container.setAttribute('aria-expanded', String(newExpandedState));
      header.setAttribute('aria-expanded', String(newExpandedState));
      
      // Toggle expanded class for CSS transitions
      container.classList.toggle('expanded', newExpandedState);
      
      // Animate the icon rotation
      const icon = header.querySelector('.collapsible-icon');
      if (icon) {
        icon.style.transform = newExpandedState ? 'rotate(90deg)' : 'rotate(0deg)';
      }
    });
    
    // Add keyboard support
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });
}

// Update recipe stats in the quick stats section
function updateRecipeStats(recipe) {
  if (!recipe) return;
  
  // Update quick stats if available - using DIY-appropriate terminology
  document.getElementById('prepTime').textContent = recipe.prep_time || '--';
  document.getElementById('cookTime').textContent = recipe.cook_time ? recipe.cook_time : 'N/A';
  document.getElementById('servings').textContent = recipe.servings ? recipe.servings : 'N/A';
  document.getElementById('difficulty').textContent = recipe.difficulty || '--';
  
  // Update instructions summary
  const summaryEl = document.getElementById('instructionsSummary');
  if (summaryEl) {
    if (recipe.summary) {
      summaryEl.innerHTML = `<p>${recipe.summary}</p>`;
    } else {
      summaryEl.innerHTML = '<p>No summary available for this recipe.</p>';
    }
  }
  
  // Update detailed instructions
  const detailedEl = document.getElementById('detailedInstructions');
  if (detailedEl) {
    if (recipe.instructions) {
      let instructionsHtml = '<ol>';
      const steps = recipe.instructions.split('\n').filter(step => step.trim() !== '');
      steps.forEach(step => {
        instructionsHtml += `<li>${step}</li>`;
      });
      instructionsHtml += '</ol>';
      detailedEl.innerHTML = instructionsHtml;
    } else {
      detailedEl.innerHTML = '<p>No detailed instructions available.</p>';
    }
  }
  
  // Update notes
  const notesEl = document.getElementById('recipeNotes');
  if (notesEl) {
    if (recipe.notes) {
      notesEl.innerHTML = `<p>${recipe.notes}</p>`;
    } else {
      notesEl.innerHTML = '<p>No notes available for this recipe.</p>';
    }
  }
  
  // Update version history if available
  const versionHistoryEl = document.getElementById('versionHistory');
  if (versionHistoryEl) {
    if (recipe.version && recipe.version > 1) {
      versionHistoryEl.innerHTML = `<p>Current version: v${recipe.version}</p>`;
      // Here you would typically fetch and display version history
    } else {
      versionHistoryEl.innerHTML = '<p>This is the first version of this recipe.</p>';
    }
  }
}

// Handle new iteration creation
function setupIterationFunctionality() {
  const createNewIterationBtn = document.getElementById('createNewIterationBtn');
  const newIterationForm = document.getElementById('newIterationForm');
  const saveIterationBtn = document.getElementById('saveIterationBtn');
  const cancelIterationBtn = document.getElementById('cancelIterationBtn');
  const iterationNotes = document.getElementById('iterationNotes');
  
  if (createNewIterationBtn) {
    createNewIterationBtn.addEventListener('click', () => {
      if (!isLoggedIn) {
        showNotification('Please log in to create iterations.', 'error');
        return;
      }
      
      if (!currentRecipe) {
        showNotification('Please select a recipe first.', 'error');
        return;
      }
      
      // Show the new iteration form
      if (newIterationForm) {
        newIterationForm.style.display = 'block';
        // Pre-populate with current recipe info
        if (iterationNotes) {
          iterationNotes.value = `Based on "${currentRecipe.title}" (v${currentRecipe.version || 1})`;
        }
      }
    });
  }
  
  if (cancelIterationBtn) {
    cancelIterationBtn.addEventListener('click', () => {
      // Hide the form
      if (newIterationForm) {
        newIterationForm.style.display = 'none';
      }
    });
  }
  
  if (saveIterationBtn) {
    saveIterationBtn.addEventListener('click', async () => {
      if (!currentRecipe) {
        showNotification('No recipe selected.', 'error');
        return;
      }
      
      const notes = iterationNotes ? iterationNotes.value : '';
      
      try {
        // Create a new iteration based on the current recipe
        const newVersion = (currentRecipe.version || 0) + 1;
        
        // 1. Update the recipe version
        const { error: recipeUpdateError } = await supabaseClient
          .from('recipes')
          .update({
            version: newVersion,
            notes: notes // Store the iteration notes
          })
          .eq('id', currentRecipe.id);
        
        if (recipeUpdateError) throw recipeUpdateError;
        
        // 2. Create an iteration record
        const { error: iterationError } = await supabaseClient
          .from('iterations')
          .insert([{
            recipe_id: currentRecipe.id,
            version: newVersion,
            notes: notes,
            created_at: new Date().toISOString()
          }]);
        
        if (iterationError) throw iterationError;
        
        showNotification('Iteration created successfully!', 'success');
        
        // Hide the form
        if (newIterationForm) {
          newIterationForm.style.display = 'none';
        }
        
        // Reload data to show the new iteration
        await reloadData();
        
      } catch (err) {
        console.error('Error creating iteration:', err);
        showNotification(`Error creating iteration: ${err.message}`, 'error');
      }
    });
  }
}

export async function initUI() {
  console.log('Initializing UI...');
  console.log('Initializing UI...');
  console.log('initUI: setup started');

  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    const magicLinkForm = document.getElementById('magicLinkForm');

    let loggedInStateChanged = false;
    const previousIsLoggedIn = isLoggedIn;

    if (event === 'SIGNED_IN') {
      isLoggedIn = true;
      console.log('User signed in.');
      if (magicLinkForm) magicLinkForm.style.display = 'none';
    } else if (event === 'SIGNED_OUT') {
      isLoggedIn = false;
      console.log('User signed out.');
    }
    if (event === 'INITIAL_SESSION') {
      isLoggedIn = !!session;
      console.log('Initial session processed. Logged in:', isLoggedIn);
      // Explicitly update auth buttons after initial check, regardless of change
      updateAuthButton();
      setEditModeFields(); // Also ensure fields are set based on initial auth state
    }

    loggedInStateChanged = previousIsLoggedIn !== isLoggedIn;

    // Update UI only if the state actually changed *after* the initial check
    if (loggedInStateChanged && event !== 'INITIAL_SESSION') {
      console.log('Login state changed, updating UI elements...');
      updateAuthButton(); // Update the Log In/Log Out button
      setEditModeFields(); // Update edit mode dependent fields
      // Consider if reloadData() is needed here based on application logic
      // reloadData();
    }
  });

  // Set up event listeners for UI elements
  const btnLogIn = document.getElementById('btnLogIn');
  if (btnLogIn) {
    btnLogIn.addEventListener('click', async () => {
      if (isLoggedIn) {
        // Log out
        try {
          const { error } = await supabaseClient.auth.signOut();
          if (error) throw error;
          showNotification('Logged out successfully.', 'success');
        } catch (err) {
          console.error('Error signing out:', err);
          showNotification(`Error signing out: ${err.message}`, 'error');
        }
      } else {
        // Show/hide magic link form
        const magicLinkForm = document.getElementById('magicLinkForm');
        if (magicLinkForm) {
          btnLogIn.dataset.showForm = btnLogIn.dataset.showForm === 'true' ? 'false' : 'true';
          magicLinkForm.style.display = btnLogIn.dataset.showForm === 'true' ? 'block' : 'none';
        }
      }
    });
  }

  // Set up event listener for the magic link form
  const btnSendMagicLink = document.getElementById('btnSendMagicLink');
  const magicLinkEmail = document.getElementById('magicLinkEmail');
  if (btnSendMagicLink && magicLinkEmail) {
    btnSendMagicLink.addEventListener('click', async () => {
      const email = magicLinkEmail.value.trim();
      if (!email) {
        showNotification('Please enter your email address.', 'error');
        return;
      }
      
      try {
        const { error } = await supabaseClient.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.href,
          },
        });
        
        if (error) throw error;
        
        showNotification('Magic link sent! Check your email.', 'success');
        // Hide the form after sending
        const magicLinkForm = document.getElementById('magicLinkForm');
        if (magicLinkForm) magicLinkForm.style.display = 'none';
      } catch (err) {
        console.error('Error sending magic link:', err);
        showNotification(`Error sending magic link: ${err.message}`, 'error');
      }
    });
  }

  // Set up event listener for the theme toggle button
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      const currentTheme = btnThemeToggle.dataset.theme || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      // Update button text and dataset
      btnThemeToggle.textContent = `Theme: ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`;
      btnThemeToggle.dataset.theme = newTheme;
      
      // Apply theme to body
      document.body.className = newTheme;
      
      console.log(`Theme applied: ${newTheme} (Source: ${currentTheme})`);
    });
  }

  // Set up event listener for the edit mode toggle button
  const btnEditModeToggle = document.getElementById('btnEditModeToggle');
  if (btnEditModeToggle) {
    btnEditModeToggle.addEventListener('click', () => {
      if (!isLoggedIn) {
        showNotification('Please log in to use edit mode.', 'error');
        return;
      }
      
      const currentActive = btnEditModeToggle.dataset.active === 'true';
      const newActive = !currentActive;
      
      // Update button text and dataset
      btnEditModeToggle.textContent = `Edit Mode: ${newActive ? 'ON' : 'OFF'}`;
      btnEditModeToggle.dataset.active = newActive.toString();
      
      // Update edit mode dependent fields
      setEditModeFields(newActive);
    });
  }

  // Set up event listener for the ingredients button
  const btnIngredients = document.getElementById('btnIngredients');
  if (btnIngredients) {
    btnIngredients.addEventListener('click', () => {
      // Hide recipe details if visible
      const recipeDetails = document.getElementById('recipeDetails');
      if (recipeDetails) recipeDetails.style.display = 'none';
      
      // Show ingredients view
      const ingredientsView = document.getElementById('ingredientsView');
      if (ingredientsView) ingredientsView.style.display = 'block';
    });
  }

  // Set up event listener for the add recipe button
  const btnAddRecipe = document.getElementById('btnAddRecipe');
  if (btnAddRecipe) {
    btnAddRecipe.addEventListener('click', () => {
      if (!isLoggedIn) {
        showNotification('Please log in to add recipes.', 'error');
        return;
      }
      
      // Create a new recipe with default values for DIY household products
      const newRecipe = {
        title: 'New DIY Formula',
        description: 'A new household product formula',
        instructions: 'Add your preparation steps here',
        ingredients: [],
        version: 1
      };
      
      // Hide ingredients view if visible
      const ingredientsView = document.getElementById('ingredientsView');
      if (ingredientsView) ingredientsView.style.display = 'none';
      
      // Show recipe details with the new recipe
      const recipeDetails = document.getElementById('recipeDetails');
      if (recipeDetails) {
        recipeDetails.style.display = 'block';
        recipeDetails.innerHTML = ''; // Clear previous content
        showRecipeDetails(newRecipe);
      }
    });
  }

  // Set up event listener for the add global ingredient button
  const btnAddGlobalIngredient = document.getElementById('btnAddGlobalIngredient');
  if (btnAddGlobalIngredient) {
    btnAddGlobalIngredient.addEventListener('click', () => {
      if (!isLoggedIn) {
        showNotification('Please log in to add ingredients.', 'error');
        return;
      }
      
      // Prompt for ingredient name and description
      const name = prompt('Enter ingredient name:');
      if (!name) return;
      
      const description = prompt('Enter ingredient description (optional):');
      
      // Create a new ingredient
      const newIngredient = {
        name,
        description: description || null
      };
      
      // Add the ingredient to the database
      supabaseClient
        .from('ingredients')
        .insert([newIngredient])
        .then(({ data, error }) => {
          if (error) {
            console.error('Error adding ingredient:', error);
            showNotification(`Error adding ingredient: ${error.message}`, 'error');
            return;
          }
          
          showNotification('Ingredient added successfully!', 'success');
          reloadData(); // Reload to show the new ingredient
        });
    });
  }

  // Load initial data
  await reloadData();
  // Setup collapsible sections
  setupRecipeCollapsibles();
  // Setup iteration functionality
  setupIterationFunctionality();
}

/**
 * Test function to verify recipe ingredient updates
 * Can be called from browser console: testRecipeIngredientUpdate()
 */
window.testRecipeIngredientUpdate = async function(recipeId) {
  console.log('=== TEST: Recipe Ingredient Update ===');
  
  // If no recipeId provided, use the current recipe if available
  if (!recipeId && currentRecipe && currentRecipe.id) {
    recipeId = currentRecipe.id;
    console.log(`Using current recipe ID: ${recipeId}`);
  }
  
  if (!recipeId) {
    console.error('No recipe ID provided and no current recipe available');
    return false;
  }
  
  try {
    // 1. Fetch the recipe's current ingredients
    console.log(`TEST: Fetching current ingredients for recipe ${recipeId}`);
    const { data: currentIngredients, error: fetchError } = await supabaseClient
      .from('recipeingredients')
      .select('*, ingredients(*)')
      .eq('recipe_id', recipeId);
      
    if (fetchError) {
      console.error('TEST: Error fetching current ingredients:', fetchError);
      return false;
    }
    
    console.log(`TEST: Found ${currentIngredients.length} current ingredients`);
    console.log('TEST: Current ingredients:', currentIngredients);
    
    // 2. Create a test ingredient if we don't have any
    if (currentIngredients.length === 0 && allIngredients.length > 0) {
      console.log('TEST: No current ingredients found, will create a test ingredient');
      
      // Get a random ingredient from the global list
      const randomIngredient = allIngredients[Math.floor(Math.random() * allIngredients.length)];
      console.log(`TEST: Selected random ingredient: ${randomIngredient.name} (ID: ${randomIngredient.id})`);
      
      // Create a test ingredient entry
      const testIngredient = {
        id: randomIngredient.id,
        name: randomIngredient.name,
        quantity: '1',
        unit: 'test',
        notes: 'Test ingredient added by testRecipeIngredientUpdate'
      };
      
      // Call updateRecipeIngredients with this test ingredient
      console.log('TEST: Calling updateRecipeIngredients with test ingredient');
      const success = await updateRecipeIngredients(recipeId, [testIngredient]);
      
      if (success) {
        console.log('TEST: Successfully added test ingredient');
        console.log('TEST: Reloading data to verify changes');
        await reloadData();
        return true;
      } else {
        console.error('TEST: Failed to add test ingredient');
        return false;
      }
    } else {
      // 3. If we have ingredients, log them for verification
      console.log('TEST: Current ingredients found, no changes made');
      console.log('TEST: Test completed successfully');
      return true;
    }
  } catch (error) {
    console.error('TEST: Error in testRecipeIngredientUpdate:', error);
    return false;
  }
};

// Simple notification function
