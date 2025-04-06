/**
 * @jest-environment jsdom
 */

import {
  IngredientAnalysis,
  RecipeTimeline,
  BatchTracking,
  ShelfLifeCalculator,
  checkIngredientCompatibility,
  estimatePH,
  calculateShelfLife
} from '../js/recipe-analysis.js';
import '@testing-library/jest-dom';

describe('Recipe Analysis Utility Functions', () => {
  // Test data
  const compatibleIngredients = [
    { name: 'Water', category: 'water' },
    { name: 'Sugar', category: 'sweetener' }
  ];
  
  const incompatibleIngredients = [
    { name: 'Water', category: 'water' },
    { name: 'Olive Oil', category: 'oil' }
  ];
  
  const acidicIngredients = [
    { name: 'Lemon Juice', category: 'acid' },
    { name: 'Vinegar', category: 'acid' }
  ];
  
  const basicIngredients = [
    { name: 'Baking Soda', category: 'base' },
    { name: 'Ammonia', category: 'base' }
  ];
  
  const mixedIngredients = [
    { name: 'Lemon Juice', category: 'acid' },
    { name: 'Baking Soda', category: 'base' }
  ];
  
  const ingredientsWithShelfLife = [
    { name: 'Milk', shelfLifeDays: 7 },
    { name: 'Honey', shelfLifeDays: 365 * 2 },
    { name: 'Vanilla Extract', shelfLifeDays: 365 }
  ];

  test('checkIngredientCompatibility should identify compatible ingredients', () => {
    expect(checkIngredientCompatibility(compatibleIngredients)).toBe(true);
  });

  test('checkIngredientCompatibility should identify incompatible ingredients', () => {
    expect(checkIngredientCompatibility(incompatibleIngredients)).toBe(false);
  });

  test('checkIngredientCompatibility should identify acid-base incompatibility', () => {
    expect(checkIngredientCompatibility(mixedIngredients)).toBe(false);
  });

  test('estimatePH should calculate acidic pH', () => {
    const pH = estimatePH(acidicIngredients);
    expect(pH).toBeLessThan(7); // Acidic pH is below 7
  });

  test('estimatePH should calculate basic pH', () => {
    const pH = estimatePH(basicIngredients);
    expect(pH).toBeGreaterThan(7); // Basic pH is above 7
  });

  test('estimatePH should calculate neutral pH for non-acid/base', () => {
    const pH = estimatePH(compatibleIngredients);
    expect(pH).toBe(7); // Neutral pH is 7
  });

  test('estimatePH should handle mixed acid/base ingredients', () => {
    const pH = estimatePH(mixedIngredients);
    // With one acid and one base, they should roughly cancel out
    expect(pH).toBe(7);
  });

  test('calculateShelfLife should find minimum shelf life', () => {
    const shelfLife = calculateShelfLife(ingredientsWithShelfLife);
    expect(shelfLife).toBe(7); // Milk has the shortest shelf life
  });

  test('calculateShelfLife should handle empty ingredients', () => {
    const shelfLife = calculateShelfLife([]);
    expect(shelfLife).toBe(365); // Default is 365 days
  });

  test('calculateShelfLife should handle missing shelfLifeDays', () => {
    const ingredients = [
      { name: 'Salt' }, // No shelf life specified
      { name: 'Pepper' } // No shelf life specified
    ];
    const shelfLife = calculateShelfLife(ingredients);
    expect(shelfLife).toBe(365); // Default is 365 days
  });
});

describe('Recipe Analysis Components', () => {
  // Sample recipe for testing components
  const sampleRecipe = {
    title: 'Test Recipe',
    ingredients: [
      { name: 'Water', category: 'water' },
      { name: 'Lemon Juice', category: 'acid', shelfLifeDays: 14 }
    ],
    steps: [
      { description: 'Mix ingredients', duration: 5 },
      { description: 'Heat mixture', duration: 10 }
    ],
    batches: [
      { date: '2025-01-01', status: 'completed' },
      { date: '2025-02-01', status: 'in-progress' }
    ]
  };

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-container"></div>';
  });

  test('IngredientAnalysis component renders correctly', () => {
    const container = document.getElementById('test-container');
    const component = IngredientAnalysis.render(container, sampleRecipe);
    
    expect(component).toHaveClass('action-panel');
    expect(component).toHaveClass('ingredient-analysis');
    
    // Check title
    const title = component.querySelector('h3');
    expect(title.textContent).toBe('Ingredient Analysis');
    
    // Check compatibility info
    const compatText = component.querySelector('p:nth-of-type(1)');
    expect(compatText.textContent).toContain('Compatibility');
    
    // Check pH info
    const pHText = component.querySelector('p:nth-of-type(2)');
    expect(pHText.textContent).toContain('Estimated pH');
  });

  test('RecipeTimeline component renders correctly', () => {
    const container = document.getElementById('test-container');
    const component = RecipeTimeline.render(container, sampleRecipe);
    
    expect(component).toHaveClass('action-panel');
    expect(component).toHaveClass('recipe-timeline');
    
    // Check title
    const title = component.querySelector('h3');
    expect(title.textContent).toBe('Recipe Timeline');
    
    // Check timeline items
    const timelineItems = component.querySelectorAll('li');
    expect(timelineItems.length).toBe(2);
    expect(timelineItems[0].textContent).toContain('Mix ingredients');
    expect(timelineItems[0].textContent).toContain('5 mins');
    expect(timelineItems[1].textContent).toContain('Heat mixture');
    expect(timelineItems[1].textContent).toContain('10 mins');
  });

  test('BatchTracking component renders correctly', () => {
    const container = document.getElementById('test-container');
    const component = BatchTracking.render(container, sampleRecipe);
    
    expect(component).toHaveClass('action-panel');
    expect(component).toHaveClass('batch-tracking');
    
    // Check title
    const title = component.querySelector('h3');
    expect(title.textContent).toBe('Batch Tracking');
    
    // Check batch items
    const batchItems = component.querySelectorAll('li');
    expect(batchItems.length).toBe(2);
    expect(batchItems[0].textContent).toContain('Batch 1');
    expect(batchItems[0].textContent).toContain('2025-01-01');
    expect(batchItems[0].textContent).toContain('completed');
    expect(batchItems[1].textContent).toContain('Batch 2');
    expect(batchItems[1].textContent).toContain('2025-02-01');
    expect(batchItems[1].textContent).toContain('in-progress');
  });

  test('ShelfLifeCalculator component renders correctly', () => {
    const container = document.getElementById('test-container');
    const component = ShelfLifeCalculator.render(container, sampleRecipe);
    
    expect(component).toHaveClass('action-panel');
    expect(component).toHaveClass('shelf-life');
    
    // Check title
    const title = component.querySelector('h3');
    expect(title.textContent).toBe('Shelf-life Estimate');
    
    // Check shelf life info
    const shelfLifeText = component.querySelector('p');
    expect(shelfLifeText.textContent).toContain('Estimated shelf-life');
    expect(shelfLifeText.textContent).toContain('14 days'); // Should match the minimum shelf life
  });

  test('Components handle missing data gracefully', () => {
    const emptyRecipe = { 
      ingredients: [],
      steps: [],
      batches: []
    };
    
    const container = document.getElementById('test-container');
    
    // Test RecipeTimeline with empty steps
    const timeline = RecipeTimeline.render(container, emptyRecipe);
    const timelineItems = timeline.querySelectorAll('li');
    expect(timelineItems.length).toBe(0);
    
    // Test BatchTracking with empty batches
    const batchTracking = BatchTracking.render(container, emptyRecipe);
    const batchItems = batchTracking.querySelectorAll('li');
    expect(batchItems.length).toBe(0);
  });
});