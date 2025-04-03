/**
 * Commits the new iteration data from the editable table.
 */
async function doCommitIteration(currentRecipe, iterationTable) {
  console.log("Commit button clicked. Recipe:", currentRecipe);

  const updatedIngredients = [];
  const rows = iterationTable.querySelectorAll('tr');
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
    const newVersion = (currentRecipe.version || 0) + 1; // Ensure version exists, default to 0 if not
    // IMPORTANT: This assumes the 'recipes.ingredients' column is JSONB and
    // expects an array of objects like [{id: 'ing_uuid', name: '...', quantity: ..., unit: ..., notes: ...}]
    // The 'id' here MUST be the actual Ingredient ID.
    const { error } = await supabaseClient
      .from('recipes')
      .update({
          ingredients: updatedIngredients, // Send the structured list
          version: newVersion
       })
      .eq('id', currentRecipe.id);

    if (error) throw error;

    showNotification('Iteration committed successfully!', 'success');
    await reloadData(); // Reload to show the updated recipe list/details
    // Optionally, re-show the details for the *just updated* recipe
    // This requires fetching the updated recipe data again
    // const updatedRecipeData = await fetchRecipeById(currentRecipe.id); // Assuming such a function exists in api.js
    // if (updatedRecipeData) showRecipeDetails(updatedRecipeData);

  } catch (err) {
    console.error('Error committing iteration:', err);
    showNotification(`Error committing iteration: ${err.message}`, 'error');
  }
}
