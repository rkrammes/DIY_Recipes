/**
 * @jest-environment jsdom
 */

import { scaleRecipe, convertUnits, printRecipe, generateShoppingList } from '../js/product-actions.js';

describe('Product Actions', () => {
  const sampleIngredients = [
    { id: 1, name: 'Ingredient 1', quantity: 100, unit: 'g' },
    { id: 2, name: 'Ingredient 2', quantity: 50, unit: 'ml' },
    { id: 3, name: 'Ingredient 3', quantity: 2, unit: 'tbsp' }
  ];

  test('scaleRecipe should multiply quantities by scale factor', () => {
    // Test scaling up
    let scaledIngredients = scaleRecipe(sampleIngredients, 2);
    expect(scaledIngredients).toHaveLength(3);
    expect(scaledIngredients[0].quantity).toBe(200);
    expect(scaledIngredients[1].quantity).toBe(100);
    expect(scaledIngredients[2].quantity).toBe(4);
    
    // Test scaling down
    scaledIngredients = scaleRecipe(sampleIngredients, 0.5);
    expect(scaledIngredients).toHaveLength(3);
    expect(scaledIngredients[0].quantity).toBe(50);
    expect(scaledIngredients[1].quantity).toBe(25);
    expect(scaledIngredients[2].quantity).toBe(1);
    
    // Verify other properties remain unchanged
    expect(scaledIngredients[0].name).toBe('Ingredient 1');
    expect(scaledIngredients[0].unit).toBe('g');
    expect(scaledIngredients[0].id).toBe(1);
  });

  test('convertUnits should toggle between metric and imperial units', () => {
    // Note: This is testing the placeholder implementation
    // which doesn't do actual unit conversion yet
    
    // Test converting to metric
    let convertedIngredients = convertUnits(sampleIngredients, true);
    expect(convertedIngredients).toHaveLength(3);
    expect(convertedIngredients[0].unit).toBe('metric-unit');
    expect(convertedIngredients[1].unit).toBe('metric-unit');
    expect(convertedIngredients[2].unit).toBe('metric-unit');
    
    // Test converting to imperial
    convertedIngredients = convertUnits(sampleIngredients, false);
    expect(convertedIngredients).toHaveLength(3);
    expect(convertedIngredients[0].unit).toBe('imperial-unit');
    expect(convertedIngredients[1].unit).toBe('imperial-unit');
    expect(convertedIngredients[2].unit).toBe('imperial-unit');
    
    // Verify other properties remain unchanged
    expect(convertedIngredients[0].name).toBe('Ingredient 1');
    expect(convertedIngredients[0].quantity).toBe(100);
    expect(convertedIngredients[0].id).toBe(1);
  });

  test('printRecipe should open a print window', () => {
    // Mock window methods
    const originalOpen = window.open;
    const mockOpen = jest.fn();
    window.open = mockOpen;
    
    const mockWindow = {
      document: {
        write: jest.fn(),
        close: jest.fn()
      },
      focus: jest.fn(),
      print: jest.fn(),
      close: jest.fn()
    };
    mockOpen.mockReturnValue(mockWindow);
    
    // Create test recipe element
    document.body.innerHTML = '<div id="recipe-content"><h1>Test Recipe</h1></div>';
    
    // Call function
    printRecipe('recipe-content');
    
    // Verify window.open was called
    expect(mockOpen).toHaveBeenCalledWith('', '_blank');
    
    // Verify document methods were called
    expect(mockWindow.document.write).toHaveBeenCalled();
    expect(mockWindow.document.close).toHaveBeenCalled();
    
    // Verify print methods were called
    expect(mockWindow.focus).toHaveBeenCalled();
    expect(mockWindow.print).toHaveBeenCalled();
    expect(mockWindow.close).toHaveBeenCalled();
    
    // Restore original window.open
    window.open = originalOpen;
  });

  test('generateShoppingList should format ingredients as a list', () => {
    const shoppingList = generateShoppingList(sampleIngredients);
    
    // Check format
    expect(shoppingList).toBe(
      "- 100 g Ingredient 1\n" +
      "- 50 ml Ingredient 2\n" +
      "- 2 tbsp Ingredient 3"
    );
    
    // Test with empty ingredients
    expect(generateShoppingList([])).toBe('');
  });

  // Test for edge cases
  test('scaleRecipe handles edge cases', () => {
    // Empty array
    expect(scaleRecipe([], 2)).toEqual([]);
    
    // Zero scale factor
    const zeroScaled = scaleRecipe(sampleIngredients, 0);
    expect(zeroScaled[0].quantity).toBe(0);
    
    // Negative scale factor (implementation should handle this appropriately)
    const negativeScaled = scaleRecipe(sampleIngredients, -1);
    expect(negativeScaled[0].quantity).toBe(-100);
  });

  test('convertUnits handles edge cases', () => {
    // Empty array
    expect(convertUnits([], true)).toEqual([]);
    
    // Missing unit property
    const noUnitIngredients = [{ id: 1, name: 'No Unit', quantity: 1 }];
    const converted = convertUnits(noUnitIngredients, true);
    expect(converted[0].unit).toBe('metric-unit');
  });
});