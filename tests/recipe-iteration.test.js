/**
 * @jest-environment jsdom
 */

import { createNewVersion, substituteIngredient, saveNotesAndResults, compareVersions } from '../js/recipe-iteration.js';
import '@testing-library/jest-dom';

describe('Recipe Iteration Functions', () => {
  // Sample recipe data for testing
  const sampleRecipe = {
    id: 'recipe-123',
    title: 'Test Recipe',
    ingredients: [
      { name: 'Ingredient 1', quantity: 100, unit: 'g' },
      { name: 'Ingredient 2', quantity: 50, unit: 'ml' }
    ],
    notes: 'Original notes',
    results: 'Original results'
  };

  beforeEach(() => {
    // Mock Date.now() to return a consistent timestamp
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-04-06T12:00:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('createNewVersion should create a new version with timestamp', () => {
    const newVersion = createNewVersion(sampleRecipe);
    
    // Check that the new version has the correct properties
    expect(newVersion.id).toBe(`${sampleRecipe.id}_v2025-04-06T12:00:00.000Z`);
    expect(newVersion.createdAt).toBe('2025-04-06T12:00:00.000Z');
    expect(newVersion.notes).toBe('');
    expect(newVersion.results).toBe('');
    
    // Check that existing properties are preserved
    expect(newVersion.title).toBe(sampleRecipe.title);
    expect(newVersion.ingredients).toEqual(sampleRecipe.ingredients);
  });

  test('substituteIngredient should replace an ingredient', () => {
    const newIngredient = { name: 'Substitute', quantity: 75, unit: 'g' };
    const updatedIngredients = substituteIngredient(sampleRecipe.ingredients, 'Ingredient 1', newIngredient);
    
    // Check that the ingredient was substituted
    expect(updatedIngredients).toHaveLength(2);
    expect(updatedIngredients[0].name).toBe('Substitute');
    expect(updatedIngredients[0].quantity).toBe(75);
    expect(updatedIngredients[0].unit).toBe('g');
    
    // Check that other ingredients are unchanged
    expect(updatedIngredients[1]).toEqual(sampleRecipe.ingredients[1]);
  });

  test('substituteIngredient should not modify if ingredient not found', () => {
    const newIngredient = { name: 'Substitute', quantity: 75, unit: 'g' };
    const updatedIngredients = substituteIngredient(sampleRecipe.ingredients, 'Non-existent', newIngredient);
    
    // Check that no changes were made
    expect(updatedIngredients).toEqual(sampleRecipe.ingredients);
  });

  test('saveNotesAndResults should update notes and results', () => {
    const newNotes = 'Updated notes';
    const newResults = 'Updated results';
    const updatedRecipe = saveNotesAndResults(sampleRecipe, newNotes, newResults);
    
    // Check that notes and results were updated
    expect(updatedRecipe.notes).toBe(newNotes);
    expect(updatedRecipe.results).toBe(newResults);
    
    // Check that other properties are preserved
    expect(updatedRecipe.id).toBe(sampleRecipe.id);
    expect(updatedRecipe.title).toBe(sampleRecipe.title);
    expect(updatedRecipe.ingredients).toEqual(sampleRecipe.ingredients);
  });

  test('compareVersions should detect changes between versions', () => {
    // Create a modified version
    const modifiedVersion = {
      ...sampleRecipe,
      ingredients: [
        { name: 'Modified Ingredient', quantity: 200, unit: 'g' },
        { name: 'Ingredient 2', quantity: 50, unit: 'ml' }
      ],
      notes: 'Modified notes',
      results: 'Original results' // Unchanged
    };
    
    const comparison = compareVersions(sampleRecipe, modifiedVersion);
    
    // Check that the comparison detected the changes
    expect(comparison.ingredientsChanged).toBe(true);
    expect(comparison.notesChanged).toBe(true);
    expect(comparison.resultsChanged).toBe(false);
  });

  test('compareVersions should handle identical versions', () => {
    const comparison = compareVersions(sampleRecipe, { ...sampleRecipe });
    
    // Check that no changes were detected
    expect(comparison.ingredientsChanged).toBe(false);
    expect(comparison.notesChanged).toBe(false);
    expect(comparison.resultsChanged).toBe(false);
  });

  test('compareVersions should detect different ingredient counts', () => {
    // Create a version with an extra ingredient
    const moreIngredientsVersion = {
      ...sampleRecipe,
      ingredients: [
        ...sampleRecipe.ingredients,
        { name: 'Extra Ingredient', quantity: 10, unit: 'g' }
      ]
    };
    
    const comparison = compareVersions(sampleRecipe, moreIngredientsVersion);
    
    // Check that the comparison detected the ingredient change
    expect(comparison.ingredientsChanged).toBe(true);
  });

  test('substituteIngredient should merge properties correctly', () => {
    // Test that properties are merged, not just replaced
    const partialIngredient = { name: 'Partial Substitute', color: 'red' };
    const updatedIngredients = substituteIngredient(sampleRecipe.ingredients, 'Ingredient 1', partialIngredient);
    
    // Check that properties were merged
    expect(updatedIngredients[0].name).toBe('Partial Substitute');
    expect(updatedIngredients[0].quantity).toBe(100); // Preserved from original
    expect(updatedIngredients[0].unit).toBe('g');     // Preserved from original
    expect(updatedIngredients[0].color).toBe('red');  // Added from substitute
  });
});