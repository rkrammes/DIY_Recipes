// Product Actions - Phase 2 Basic Implementation

// Recipe scaling: adjust batch size
export function scaleRecipe(originalIngredients, scaleFactor) {
  return originalIngredients.map(ing => ({
    ...ing,
    quantity: ing.quantity * scaleFactor
  }));
}

// Unit conversion: toggle metric/imperial
export function convertUnits(ingredients, toMetric = true) {
  // Placeholder: simple toggle without actual unit logic
  return ingredients.map(ing => {
    return {
      ...ing,
      unit: toMetric ? 'metric-unit' : 'imperial-unit'
    };
  });
}

// Print/export current recipe
export function printRecipe(recipeHtmlElementId) {
  const content = document.getElementById(recipeHtmlElementId).innerHTML;
  const printWindow = window.open('', '_blank');
  printWindow.document.write('<html><head><title>Print Recipe</title></head><body>' + content + '</body></html>');
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

// Generate shopping list from ingredients
export function generateShoppingList(ingredients) {
  return ingredients.map(ing => `- ${ing.quantity} ${ing.unit} ${ing.name}`).join('\n');
}