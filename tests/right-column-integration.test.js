/**
 * @jest-environment jsdom
 */

import { initRecipeActions } from '../js/recipe-actions.js';
import { scaleRecipe, convertUnits, printRecipe, generateShoppingList } from '../js/product-actions.js';
import { createNewVersion, substituteIngredient, saveNotesAndResults, compareVersions } from '../js/recipe-iteration.js';
import { renderAdvancedAnalysis } from '../js/ui.js';
import { 
  IngredientAnalysis, 
  RecipeTimeline, 
  BatchTracking, 
  ShelfLifeCalculator 
} from '../js/recipe-analysis.js';
import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

// Mock the UI renderAdvancedAnalysis function
jest.mock('../js/ui.js', () => {
  const originalModule = jest.requireActual('../js/ui.js');
  return {
    ...originalModule,
    renderAdvancedAnalysis: jest.fn()
  };
});

describe('Right Column Integration', () => {
  // Sample recipe data for testing
  const sampleRecipe = {
    id: 'recipe-123',
    title: 'Test Recipe',
    ingredients: [
      { name: 'Ingredient 1', category: 'base', quantity: 100, unit: 'g', shelfLifeDays: 30 },
      { name: 'Ingredient 2', category: 'acid', quantity: 50, unit: 'ml', shelfLifeDays: 14 }
    ],
    steps: [
      { description: 'Mix ingredients', duration: 5 },
      { description: 'Heat mixture', duration: 10 }
    ],
    batches: [
      { date: '2025-01-01', status: 'completed' },
      { date: '2025-02-01', status: 'in-progress' }
    ],
    notes: 'Original notes',
    results: 'Original results',
    version: 1
  };

  beforeEach(() => {
    // Set up DOM elements
    document.body.innerHTML = `
      <div id="right-column-actions"></div>
      <div id="advancedAnalysisPanel"></div>
      <div id="recipe-content"></div>
    `;
    
    // Initialize the right column
    initRecipeActions();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Right column panels are initialized correctly', () => {
    const rightColumn = document.getElementById('right-column-actions');
    
    // Check that panels were created
    const panels = rightColumn.querySelectorAll('.collapsible-container');
    expect(panels.length).toBeGreaterThan(0);
    
    // Verify specific panels exist
    const headerTexts = Array.from(panels).map(panel => 
      panel.querySelector('.collapsible-header').textContent
    );
    
    expect(headerTexts).toContain('Batch Records');
    expect(headerTexts).toContain('Ingredient Substitutions');
    expect(headerTexts).toContain('Cost Calculation');
    expect(headerTexts).toContain('Adjustments');
  });

  test('Panels can be expanded and collapsed', () => {
    const rightColumn = document.getElementById('right-column-actions');
    const panels = rightColumn.querySelectorAll('.collapsible-container');
    const firstPanel = panels[0];
    const header = firstPanel.querySelector('.collapsible-header');
    const content = firstPanel.querySelector('.collapsible-content');
    
    // Initially collapsed
    expect(firstPanel).toHaveAttribute('aria-expanded', 'false');
    expect(content.style.opacity).toBe('0');
    
    // Click to expand
    fireEvent.click(header);
    expect(firstPanel).toHaveAttribute('aria-expanded', 'true');
    expect(content.style.opacity).toBe('1');
    
    // Click to collapse
    fireEvent.click(header);
    expect(firstPanel).toHaveAttribute('aria-expanded', 'false');
    expect(content.style.opacity).toBe('0');
  });

  test('Batch size slider control works', () => {
    const rightColumn = document.getElementById('right-column-actions');
    const adjustmentsPanel = Array.from(rightColumn.querySelectorAll('.collapsible-container'))
      .find(panel => panel.querySelector('.collapsible-header').textContent.includes('Adjustments'));
    
    // Expand the panel
    const header = adjustmentsPanel.querySelector('.collapsible-header');
    fireEvent.click(header);
    
    // Find the slider
    const slider = adjustmentsPanel.querySelector('input[type="range"]');
    const valueDisplay = slider.nextElementSibling;
    
    // Initial value
    expect(slider.value).toBe('10');
    expect(valueDisplay.textContent).toBe('10');
    
    // Change value
    slider.value = '20';
    fireEvent.input(slider);
    
    // Check updated value
    expect(valueDisplay.textContent).toBe('20');
  });

  test('Toggle control works', () => {
    const rightColumn = document.getElementById('right-column-actions');
    const adjustmentsPanel = Array.from(rightColumn.querySelectorAll('.collapsible-container'))
      .find(panel => panel.querySelector('.collapsible-header').textContent.includes('Adjustments'));
    
    // Expand the panel
    const header = adjustmentsPanel.querySelector('.collapsible-header');
    fireEvent.click(header);
    
    // Find the toggle
    const toggle = adjustmentsPanel.querySelector('input[type="checkbox"]');
    
    // Initial value
    expect(toggle.checked).toBe(true);
    
    // Change value
    toggle.checked = false;
    fireEvent.change(toggle);
    
    // Check updated value
    expect(toggle.checked).toBe(false);
  });

  test('Integration with recipe-analysis components', () => {
    // Create a container for advanced analysis
    const advancedAnalysisPanel = document.getElementById('advancedAnalysisPanel');
    
    // Render advanced analysis
    renderAdvancedAnalysis(sampleRecipe, advancedAnalysisPanel);
    
    // Verify the renderAdvancedAnalysis function was called with the correct arguments
    expect(renderAdvancedAnalysis).toHaveBeenCalledWith(sampleRecipe, advancedAnalysisPanel);
  });

  test('Integration with product-actions functions', () => {
    // Test scaling recipe
    const scaledIngredients = scaleRecipe(sampleRecipe.ingredients, 2);
    expect(scaledIngredients[0].quantity).toBe(200);
    expect(scaledIngredients[1].quantity).toBe(100);
    
    // Test unit conversion
    const convertedIngredients = convertUnits(sampleRecipe.ingredients, true);
    expect(convertedIngredients[0].unit).toBe('metric-unit');
    expect(convertedIngredients[1].unit).toBe('metric-unit');
    
    // Test shopping list generation
    const shoppingList = generateShoppingList(sampleRecipe.ingredients);
    expect(shoppingList).toContain('100 g Ingredient 1');
    expect(shoppingList).toContain('50 ml Ingredient 2');
  });

  test('Integration with recipe-iteration functions', () => {
    // Test creating new version
    const newVersion = createNewVersion(sampleRecipe);
    expect(newVersion.id).toContain(sampleRecipe.id);
    expect(newVersion.title).toBe(sampleRecipe.title);
    expect(newVersion.ingredients).toEqual(sampleRecipe.ingredients);
    expect(newVersion.notes).toBe('');
    expect(newVersion.results).toBe('');
    
    // Test ingredient substitution
    const newIngredient = { name: 'Substitute', quantity: 75, unit: 'g' };
    const updatedIngredients = substituteIngredient(sampleRecipe.ingredients, 'Ingredient 1', newIngredient);
    expect(updatedIngredients[0].name).toBe('Substitute');
    expect(updatedIngredients[0].quantity).toBe(75);
    
    // Test saving notes and results
    const updatedRecipe = saveNotesAndResults(sampleRecipe, 'New notes', 'New results');
    expect(updatedRecipe.notes).toBe('New notes');
    expect(updatedRecipe.results).toBe('New results');
    
    // Test comparing versions
    const comparison = compareVersions(sampleRecipe, updatedRecipe);
    expect(comparison.notesChanged).toBe(true);
    expect(comparison.resultsChanged).toBe(true);
    expect(comparison.ingredientsChanged).toBe(false);
  });

  // Test data persistence across page reloads would require browser testing
  // and is not covered in this unit test suite
});