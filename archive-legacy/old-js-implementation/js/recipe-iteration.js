// Recipe Iteration Actions - Phase 2 Basic Implementation

// Create a new recipe version based on existing
export function createNewVersion(recipeData) {
  const timestamp = new Date().toISOString();
  return {
    ...recipeData,
    id: `${recipeData.id}_v${timestamp}`,
    createdAt: timestamp,
    notes: '',
    results: ''
  };
}

// Substitute an ingredient
export function substituteIngredient(ingredients, oldName, newIngredient) {
  return ingredients.map(ing =>
    ing.name === oldName ? { ...ing, ...newIngredient } : ing
  );
}

// Save notes and results for a recipe version
export function saveNotesAndResults(recipeVersion, notes, results) {
  return {
    ...recipeVersion,
    notes,
    results
  };
}

// Compare two recipe versions (basic diff)
export function compareVersions(versionA, versionB) {
  return {
    ingredientsChanged: versionA.ingredients.length !== versionB.ingredients.length ||
      versionA.ingredients.some((ing, idx) => JSON.stringify(ing) !== JSON.stringify(versionB.ingredients[idx])),
    notesChanged: versionA.notes !== versionB.notes,
    resultsChanged: versionA.results !== versionB.results
  };
}