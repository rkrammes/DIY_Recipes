/********** SUPABASE CONFIG **********/
const SUPABASE_URL = 'https://bzudglfxxywugesncjnz.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dWRnbGZ4eHl3dWdlc25jam56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4Mjk5MDAsImV4cCI6MjA1NzQwNTkwMH0.yYBWuD_bzfyh72URflGqJbn-lIwrZ6oAznxVocgxOm8';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/********** OPENAI CONFIG (CHAT COMPLETIONS) **********/
const OPENAI_API_KEY =
  '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';
const OPENAI_MODEL = 'gpt-4';
const OPENAI_CHAT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

/********** GLOBAL STATE **********/
window.recipes = [];
window.allIngredients = [];
let currentRecipeIndex = null;
let currentAISuggestion = '';

let isLoggedIn = false;
// We'll treat "Edit Mode" as "logged in" vs. "logged out"
let editMode = false;

/********** INIT **********/
document.addEventListener('DOMContentLoaded', async () => {
  // Listen for auth changes
  supabaseClient.auth.onAuthStateChange((event, session) => {
    handleAuthChange(session);
  });

  // Check existing session
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  handleAuthChange(session);

  // Basic UI event listeners
  document.getElementById('btnIngredients').addEventListener('click', showAllIngredients);
  document.getElementById('csvFile').addEventListener('change', importCSV);

  // AI prompt enter
  const aiPromptInput = document.getElementById('aiPrompt');
  aiPromptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      showAISuggestion();
    }
  });

  // Add New Ingredient enter
  const newGlobalIngredientInput = document.getElementById('newGlobalIngredientInput');
  newGlobalIngredientInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addGlobalIngredient();
    }
  });

  // Add New Recipe enter
  const newRecipeNameInput = document.getElementById('newRecipeNameInput');
  newRecipeNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      createNewRecipe();
    }
  });

  // Ingredient dropdown changes
  const newIngredientDropdown = document.getElementById('newIngredientDropdown');
  newIngredientDropdown.addEventListener('change', () => {
    if (newIngredientDropdown.value) {
      addNewIngredient();
      newIngredientDropdown.value = '';
    }
  });

  // Reroll & commit suggestion
  document.getElementById('btnReroll').addEventListener('click', rerollAISuggestion);
  document.getElementById('btnCommitSuggestion').addEventListener('click', commitAISuggestion);

  // THEME SELECT
  const themeSelect = document.getElementById('themeSelect');
  themeSelect.addEventListener('change', handleThemeChange);
  initializeTheme();

  // Edit Mode Button => toggles log in/out
  document.getElementById('btnEditMode').addEventListener('click', toggleEditMode);

  // Send Magic Link button
  document.getElementById('btnSendMagicLink').addEventListener('click', sendMagicLink);

  // Load initial data
  loadRecipes();
  loadAllIngredients();
});

/********** AUTH HANDLERS **********/
function handleAuthChange(session) {
  isLoggedIn = !!(session && session.user);

  if (isLoggedIn) {
    console.log('User is logged in:', session.user.email);
    editMode = true;
    document.getElementById('btnEditMode').textContent = 'Edit Mode: ON';
    document.getElementById('magicLinkForm').style.display = 'none'; // hide the email form
  } else {
    console.log('No user logged in');
    editMode = false;
    document.getElementById('btnEditMode').textContent = 'Edit Mode: OFF';
  }

  // Refresh recipes + ingredients so the UI updates
  loadRecipes();
  loadAllIngredients();
}

/********** TOGGLE EDIT MODE **********/
function toggleEditMode() {
  if (!isLoggedIn) {
    // If user is logged out, show the magic link form
    const form = document.getElementById('magicLinkForm');
    form.style.display = (form.style.display === 'none' ? 'block' : 'none');
  } else {
    // If user is logged in => sign out
    supabaseClient.auth.signOut();
  }
}

/********** SEND MAGIC LINK **********/
async function sendMagicLink() {
  const emailInput = document.getElementById('magicLinkEmail');
  const email = emailInput.value.trim();
  if (!email) {
    alert('Please enter an email address.');
    return;
  }

  // Supabase magic link
  const { error } = await supabaseClient.auth.signInWithOtp({
    email: email,
    options: {
      // If you want a custom redirect, add it here:
      // redirectTo: 'https://www.symbolkraft.com?magic=1'
    }
  });
  if (error) {
    alert('Error sending magic link: ' + error.message);
    console.error(error);
  } else {
    alert('Check your email for the magic link!');
    // Optionally hide the form
    document.getElementById('magicLinkForm').style.display = 'none';
  }
}

/********** THEME HANDLING **********/
function initializeTheme() {
  const savedTheme = localStorage.getItem('userThemePref') || 'dark';
  applyTheme(savedTheme);
  document.getElementById('themeSelect').value = savedTheme;
}

function handleThemeChange() {
  const theme = document.getElementById('themeSelect').value;
  applyTheme(theme);
  localStorage.setItem('userThemePref', theme);
}

function applyTheme(theme) {
  const body = document.body;
  body.classList.remove('dark-mode', 'light-mode', 'system-mode');
  if (theme === 'dark') {
    body.classList.add('dark-mode');
  } else if (theme === 'light') {
    body.classList.add('light-mode');
  } else {
    // system
    body.classList.add('dark-mode');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (systemDark.matches) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
      body.classList.add('light-mode');
    }
  }
}

/********** CREATE A NEW RECIPE **********/
async function createNewRecipe() {
  if (!isLoggedIn) {
    alert('Please log in (Edit Mode ON) to create a new recipe.');
    return;
  }
  const newRecipeNameInput = document.getElementById('newRecipeNameInput');
  const recipeName = newRecipeNameInput.value.trim();
  if (!recipeName) {
    alert('Please enter a valid recipe name.');
    return;
  }
  const { data, error } = await supabaseClient
    .from('All_Recipes')
    .insert([{ name: recipeName, ingredients: [], suggestions: [] }])
    .select();
  if (error) {
    console.error('Error creating new recipe:', error);
    return;
  }
  if (data && data.length > 0) {
    window.recipes.push(data[0]);
  }
  newRecipeNameInput.value = '';
  loadRecipes();
}

/********** LOAD RECIPES (All_Recipes) **********/
async function loadRecipes() {
  const { data: recipes, error } = await supabaseClient
    .from('All_Recipes')
    .select('*');
  if (error) {
    console.error('Error loading recipes:', error);
    return;
  }

  window.recipes = recipes || [];

  // Show CSV import only if user is logged in and no recipes exist
  if (isLoggedIn && window.recipes.length === 0) {
    document.getElementById('importCSVContainer').style.display = 'block';
  } else {
    document.getElementById('importCSVContainer').style.display = 'none';
  }

  renderRecipeList(window.recipes);
}

function renderRecipeList(recipes) {
  const recipeList = document.getElementById('recipeList');
  recipeList.innerHTML = '';

  recipes.forEach((recipe, index) => {
    const li = document.createElement('li');
    li.textContent = recipe.name;
    li.addEventListener('click', () => showRecipeDetails(index));
    recipeList.appendChild(li);
  });

  if (recipes.length > 0) {
    document.getElementById('recipeDetails').style.display = 'block';
  } else {
    document.getElementById('recipeDetails').style.display = 'none';
  }
}

/********** LOAD ALL INGREDIENTS (Ingredients Table) **********/
async function loadAllIngredients() {
  const { data, error } = await supabaseClient
    .from('Ingredients')
    .select('*')
    .order('name', { ascending: true });
  if (error) {
    console.error('Error loading ingredients:', error);
    return;
  }
  window.allIngredients = data || [];
  populateIngredientDropdown();
}

/********** POPULATE RECIPE INGREDIENT DROPDOWN **********/
function populateIngredientDropdown() {
  const dropdown = document.getElementById('newIngredientDropdown');
  dropdown.innerHTML = '';
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = 'Add New Ingredient';
  dropdown.appendChild(defaultOpt);

  window.allIngredients.forEach((ing) => {
    const opt = document.createElement('option');
    opt.value = ing.id;
    opt.textContent = ing.name;
    dropdown.appendChild(opt);
  });
}

/********** SHOW RECIPE DETAILS **********/
function showRecipeDetails(index) {
  currentRecipeIndex = index;
  const recipe = window.recipes[index];

  document.getElementById('recipeDetails').style.display = 'block';
  document.getElementById('ingredientsView').style.display = 'none';
  document.getElementById('recipeTitle').textContent = recipe.name;

  // Hide AI suggestion box
  document.getElementById('aiSuggestionBox').style.display = 'none';
  document.getElementById('aiSuggestionText').innerText = '';
  currentAISuggestion = '';

  const recipeContent = document.getElementById('recipeContent');
  recipeContent.innerHTML = '';

  (recipe.ingredients || []).forEach((ingredient, i) => {
    const row = document.createElement('tr');

    // Only editable if user is logged in + editMode is ON
    const editableAttr = (isLoggedIn && editMode) ? 'contenteditable="true"' : '';

    row.innerHTML = `
      <td>${ingredient.name}</td>
      <td ${editableAttr}>${ingredient.quantity || ''}</td>
      <td ${editableAttr}>${ingredient.nextVersion || ''}</td>
      <td ${editableAttr}>${ingredient.reasoning || ''}</td>
      <td>
        <button class="remove-ingredient-btn"
                onclick="removeIngredient(${index}, ${i})">
          Remove
        </button>
      </td>
    `;
    recipeContent.appendChild(row);
  });
}

/********** ADD INGREDIENT TO CURRENT RECIPE **********/
async function addNewIngredient() {
  if (currentRecipeIndex == null) {
    alert('Please select a recipe first.');
    return;
  }
  if (!isLoggedIn) {
    alert('Please log in (Edit Mode ON) to modify recipes.');
    return;
  }
  const recipe = window.recipes[currentRecipeIndex];
  const dropdown = document.getElementById('newIngredientDropdown');
  const selectedIngId = dropdown.value;
  if (!selectedIngId) {
    alert('Please select an ingredient from the dropdown.');
    return;
  }
  const ingObj = window.allIngredients.find((ing) => ing.id === selectedIngId);
  if (!ingObj) {
    alert('Invalid ingredient selected.');
    return;
  }

  const newIngObj = {
    id: ingObj.id,
    name: ingObj.name,
    quantity: '',
    nextVersion: '',
    reasoning: '',
  };

  if (!recipe.ingredients) recipe.ingredients = [];
  recipe.ingredients.push(newIngObj);

  const { error } = await supabaseClient
    .from('All_Recipes')
    .update({ ingredients: recipe.ingredients })
    .eq('id', recipe.id);
  if (error) {
    console.error('Error adding ingredient:', error);
  } else {
    console.log('Ingredient added successfully.');
    showRecipeDetails(currentRecipeIndex);
  }
}

/********** ADD INGREDIENT to the Ingredients TABLE **********/
async function addGlobalIngredient() {
  if (!isLoggedIn) {
    alert('Please log in (Edit Mode ON) to add global ingredients.');
    return;
  }
  const newIngInput = document.getElementById('newGlobalIngredientInput');
  const newIngName = newIngInput.value.trim();
  if (!newIngName) {
    alert('Please enter a valid ingredient name.');
    return;
  }

  const { data, error } = await supabaseClient
    .from('Ingredients')
    .insert([{ name: newIngName }])
    .select();
  if (error) {
    console.error('Error adding new ingredient to DB:', error);
    return;
  }
  if (data && data.length > 0) {
    window.allIngredients.push(data[0]);
    window.allIngredients.sort((a, b) => a.name.localeCompare(b.name));
    populateIngredientDropdown();
    showAllIngredients();
    newIngInput.value = '';
  }
}

/********** REMOVE INGREDIENT from CURRENT RECIPE **********/
async function removeIngredient(recipeIndex, ingredientIndex) {
  if (!isLoggedIn) {
    alert('Please log in (Edit Mode ON) to remove ingredients.');
    return;
  }
  const recipe = window.recipes[recipeIndex];
  recipe.ingredients.splice(ingredientIndex, 1);

  const { error } = await supabaseClient
    .from('All_Recipes')
    .update({ ingredients: recipe.ingredients })
    .eq('id', recipe.id);
  if (error) {
    console.error('Error removing ingredient:', error);
  } else {
    console.log('Ingredient removed successfully.');
    showRecipeDetails(recipeIndex);
  }
}

/********** REMOVE INGREDIENT from the Ingredients TABLE **********/
async function removeGlobalIngredient(ingredientId) {
  if (!isLoggedIn) {
    alert('Please log in (Edit Mode ON) to remove global ingredients.');
    return;
  }
  const { error } = await supabaseClient
    .from('Ingredients')
    .delete()
    .eq('id', ingredientId);
  if (error) {
    console.error('Error removing global ingredient:', error);
    return;
  }
  window.allIngredients = window.allIngredients.filter((ing) => ing.id !== ingredientId);
  populateIngredientDropdown();
  showAllIngredients();
}

/********** SHOW ALL INGREDIENTS **********/
function showAllIngredients() {
  document.getElementById('ingredientsView').style.display = 'block';
  document.getElementById('recipeDetails').style.display = 'none';
  loadAllIngredients();

  const ingredientList = document.getElementById('ingredientList');
  ingredientList.innerHTML = '';

  (window.allIngredients || []).forEach((ing) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'btn ingredient-button';
    button.textContent = ing.name;

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'ingredient-details';
    detailsDiv.style.display = 'none';
    detailsDiv.innerHTML = `
      <p>Description: ${ing.description || 'No description'}</p>
      <button class="remove-ingredient-btn" onclick="removeGlobalIngredient(${ing.id})">
        Remove
      </button>
    `;

    button.onclick = () => {
      detailsDiv.style.display =
        detailsDiv.style.display === 'block' ? 'none' : 'block';
    };
    li.appendChild(button);
    li.appendChild(detailsDiv);
    ingredientList.appendChild(li);
  });
}

/********** AI SUGGESTION (Chat Completions) **********/
async function fetchAISuggestion(recipe, userPrompt) {
  const messages = [
    {
      role: 'system',
      content: 'You are a helpful AI that suggests recipe improvements.',
    },
    {
      role: 'user',
      content: `
        Here is a recipe in JSON: ${JSON.stringify(recipe, null, 2)}
        User request: ${userPrompt}
        Suggest improvements for this recipe. Return a short summary with suggested changes.
      `,
    },
  ];
  try {
    const response = await fetch(OPENAI_CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      console.error('OpenAI error:', data);
      return 'No suggestion could be generated.';
    }
  } catch (error) {
    console.error('Network or fetch error:', error);
    return 'No suggestion could be generated (network error).';
  }
}

async function showAISuggestion() {
  if (!isLoggedIn) {
    alert('Please log in (Edit Mode ON) to use AI suggestions.');
    return;
  }
  if (currentRecipeIndex == null) {
    alert('Please select a recipe first.');
    return;
  }
  const userPrompt = document.getElementById('aiPrompt').value.trim();
  if (!userPrompt) {
    alert('Please enter a prompt (e.g. "Get AI Suggestion")');
    return;
  }
  const recipe = window.recipes[currentRecipeIndex];
  const suggestion = await fetchAISuggestion(recipe, userPrompt);
  currentAISuggestion = suggestion;

  const aiBox = document.getElementById('aiSuggestionBox');
  aiBox.style.display = 'block';
  const aiText = document.getElementById('aiSuggestionText');
  aiText.innerText = suggestion;
}

async function rerollAISuggestion() {
  if (!isLoggedIn) return;
  if (currentRecipeIndex == null) return;
  await showAISuggestion();
}

async function commitAISuggestion() {
  if (!isLoggedIn) return;
  if (currentRecipeIndex == null) return;

  const recipe = window.recipes[currentRecipeIndex];
  const suggestionText = currentAISuggestion || '';
  if (!suggestionText) {
    alert('No suggestion to commit!');
    return;
  }
  if (!recipe.suggestions) recipe.suggestions = [];

  recipe.suggestions.push({
    versionIdea: suggestionText,
    timestamp: new Date().toISOString(),
  });

  const { error } = await supabaseClient
    .from('All_Recipes')
    .update({ suggestions: recipe.suggestions })
    .eq('id', recipe.id);

  if (error) {
    console.error('Error committing AI suggestion:', error);
  } else {
    console.log('AI suggestion committed successfully.');
    alert('Suggestion saved to the database!');
  }
}

/********** CSV IMPORT **********/
function parseCSVData(data) {
  const rows = data.data;
  if (rows.length < 2) return [];
  const header = rows[0].map((col) => col.trim());
  const nameIndex = header.indexOf('name');
  const ingredientsIndex = header.indexOf('ingredients');
  if (nameIndex === -1 || ingredientsIndex === -1) {
    alert('CSV must have at least "name" and "ingredients" columns.');
    return [];
  }

  const recipeArray = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    recipeArray.push({
      name: row[nameIndex],
      ingredients: JSON.parse(row[ingredientsIndex] || '[]'),
      suggestions: [],
    });
  }
  return recipeArray;
}

async function importCSV(event) {
  if (!isLoggedIn) {
    alert('Please log in (Edit Mode ON) to import CSV.');
    return;
  }
  const file = event.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    complete: async function (results) {
      const recipes = parseCSVData(results);
      if (recipes.length === 0) {
        alert('No valid recipe data found.');
        return;
      }
      for (let recipe of recipes) {
        const { error } = await supabaseClient
          .from('All_Recipes')
          .insert([
            {
              name: recipe.name,
              ingredients: recipe.ingredients,
              suggestions: recipe.suggestions,
            },
          ]);
        if (error) {
          console.error('Error importing recipe:', error);
        }
      }
      window.recipes = [];
      loadRecipes();
      document.getElementById('importCSVContainer').style.display = 'none';
    },
    error: function (err) {
      console.error('Error parsing CSV:', err);
    },
  });
}
