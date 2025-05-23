/**
 * DIY Recipes - Advanced Analysis Module
 * Phase 3: Ingredient Analysis, Timeline, Batch Tracking, Shelf-life
 */

// Utility: Ingredient compatibility check (simple heuristic)
function checkIngredientCompatibility(ingredients) {
  const incompatiblePairs = [
    ['acid', 'base'],
    ['oil', 'water']
  ];

  const categories = ingredients.map(i => i.category);
  for (const [cat1, cat2] of incompatiblePairs) {
    if (categories.includes(cat1) && categories.includes(cat2)) {
      return false;
    }
  }
  return true;
}

// Utility: Estimate pH based on ingredient categories (very rough)
function estimatePH(ingredients) {
  let score = 7; // neutral
  ingredients.forEach(i => {
    if (i.category === 'acid') score -= 1;
    if (i.category === 'base') score += 1;
  });
  return Math.max(0, Math.min(14, score));
}

// Ingredient Analysis Component
const IngredientAnalysis = {
  render(container, recipe) {
    const div = document.createElement('div');
    div.className = 'action-panel ingredient-analysis';

    const title = document.createElement('h3');
    title.textContent = 'Ingredient Analysis';
    div.appendChild(title);

    const compatible = checkIngredientCompatibility(recipe.ingredients);
    const pH = estimatePH(recipe.ingredients);

    const compatP = document.createElement('p');
    compatP.textContent = 'Compatibility: ' + (compatible ? 'Compatible' : 'Incompatible');
    div.appendChild(compatP);

    const pHP = document.createElement('p');
    pHP.textContent = 'Estimated pH: ' + pH.toFixed(1);
    div.appendChild(pHP);

    container.appendChild(div);
    return div;
  },
  handleEvent(event, recipe) {},
  update(recipe) {}
};

// Recipe Timeline Visualization Component
const RecipeTimeline = {
  render(container, recipe) {
    const div = document.createElement('div');
    div.className = 'action-panel recipe-timeline';

    const title = document.createElement('h3');
    title.textContent = 'Recipe Timeline';
    div.appendChild(title);

    const timeline = document.createElement('ul');
    recipe.steps.forEach((step, idx) => {
      const li = document.createElement('li');
      li.textContent = `${idx + 1}. ${step.description} (${step.duration || 'N/A'} mins)`;
      timeline.appendChild(li);
    });
    div.appendChild(timeline);

    container.appendChild(div);
    return div;
  },
  handleEvent(event, recipe) {},
  update(recipe) {}
};

// Batch Tracking Component
const BatchTracking = {
  render(container, recipe) {
    const div = document.createElement('div');
    div.className = 'action-panel batch-tracking';

    const title = document.createElement('h3');
    title.textContent = 'Batch Tracking';
    div.appendChild(title);

    const batchList = document.createElement('ul');
    (recipe.batches || []).forEach((batch, idx) => {
      const li = document.createElement('li');
      li.textContent = `Batch ${idx + 1}: ${batch.date} - ${batch.status}`;
      batchList.appendChild(li);
    });
    div.appendChild(batchList);

    container.appendChild(div);
    return div;
  },
  handleEvent(event, recipe) {},
  update(recipe) {}
};

// Shelf-life Calculator Component
const ShelfLifeCalculator = {
  render(container, recipe) {
    const div = document.createElement('div');
    div.className = 'action-panel shelf-life';

    const title = document.createElement('h3');
    title.textContent = 'Shelf-life Estimate';
    div.appendChild(title);

    const shelfLife = calculateShelfLife(recipe.ingredients);
    const p = document.createElement('p');
    p.textContent = 'Estimated shelf-life: ' + shelfLife + ' days';
    div.appendChild(p);

    container.appendChild(div);
    return div;
  },
  handleEvent(event, recipe) {},
  update(recipe) {}
};

// Utility: Simple shelf-life estimation based on ingredient types
function calculateShelfLife(ingredients) {
  let minDays = 365;
  ingredients.forEach(i => {
    if (i.shelfLifeDays && i.shelfLifeDays < minDays) {
      minDays = i.shelfLifeDays;
    }
  });
  return minDays;
}

// Export components for integration
export {
  IngredientAnalysis,
  RecipeTimeline,
  BatchTracking,
  ShelfLifeCalculator,
  checkIngredientCompatibility,
  estimatePH,
  calculateShelfLife
};