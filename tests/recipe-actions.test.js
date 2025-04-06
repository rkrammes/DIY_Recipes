jest.mock('../js/supabaseClient.js');

jest.mock('../js/supabaseClient.js');

jest.mock('../js/supabaseClient.js');

/**
 * @jest-environment jsdom
 */

import { CollapsiblePanel, createSliderControl, createToggleControl, createResultDisplay, initRecipeActions } from '../js/recipe-actions.js';
import '@testing-library/jest-dom';

describe('Recipe Actions Components', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="right-column-actions"></div>';
  });

  test('CollapsiblePanel renders correctly', () => {
    const container = document.getElementById('right-column-actions');
    const contentElement = document.createElement('div');
    contentElement.textContent = 'Test Content';

    // Render the panel
    const panel = CollapsiblePanel.render(container, 'Test Panel', contentElement);

    // Check panel structure
    expect(panel).toHaveClass('action-panel');
    expect(panel).toHaveClass('collapsible-container');
    expect(panel).toHaveAttribute('aria-expanded', 'false');

    // Check header
    const header = panel.querySelector('.collapsible-header');
    expect(header).toHaveAttribute('role', 'button');
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(header.textContent).toContain('Test Panel');

    // Check content
    const content = panel.querySelector('.collapsible-content');
    expect(content).toBeTruthy();
    expect(content.style.maxHeight).toBe('0');
    expect(content.style.opacity).toBe('0');
    expect(content.textContent).toBe('Test Content');

    // Test toggle functionality
    header.click();
    expect(panel).toHaveAttribute('aria-expanded', 'true');
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(content.style.opacity).toBe('1');

    // Toggle back
    header.click();
    expect(panel).toHaveAttribute('aria-expanded', 'false');
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(content.style.opacity).toBe('0');
  });

  test('createSliderControl renders correctly and handles changes', () => {
    const mockOnChange = jest.fn();
    const slider = createSliderControl({
      label: 'Test Slider',
      min: 1,
      max: 10,
      step: 1,
      value: 5,
      onChange: mockOnChange
    });

    expect(slider).toHaveClass('action-input');
    expect(slider).toHaveClass('slider-control');

    const label = slider.querySelector('label');
    expect(label.textContent).toBe('Test Slider');

    const input = slider.querySelector('input');
    expect(input.type).toBe('range');
    expect(input.min).toBe('1');
    expect(input.max).toBe('10');
    expect(input.step).toBe('1');
    expect(input.value).toBe('5');

    const valueDisplay = slider.querySelector('span');
    expect(valueDisplay.textContent).toBe('5');

    // Test change event
    input.value = '7';
    input.dispatchEvent(new Event('input'));
    expect(valueDisplay.textContent).toBe('7');
    expect(mockOnChange).toHaveBeenCalledWith('7');
  });

  test('createToggleControl renders correctly and handles changes', () => {
    const mockOnChange = jest.fn();
    const toggle = createToggleControl({
      label: 'Test Toggle',
      checked: true,
      onChange: mockOnChange
    });

    expect(toggle).toHaveClass('action-input');
    expect(toggle).toHaveClass('toggle-control');

    const label = toggle.querySelector('label');
    expect(label.textContent).toBe('Test Toggle');

    const input = toggle.querySelector('input');
    expect(input.type).toBe('checkbox');
    expect(input.checked).toBe(true);

    // Test change event
    input.checked = false;
    input.dispatchEvent(new Event('change'));
    expect(mockOnChange).toHaveBeenCalledWith(false);
  });

  test('createResultDisplay renders content correctly', () => {
    const content = '<p>Test Result</p>';
    const result = createResultDisplay(content);

    expect(result).toHaveClass('action-result');
    expect(result.innerHTML).toBe(content);
  });

  test('initRecipeActions initializes right column panels', () => {
    initRecipeActions();

    const rightColumn = document.getElementById('right-column-actions');
    
    // Check if panels were created
    const panels = rightColumn.querySelectorAll('.action-panel');
    expect(panels.length).toBeGreaterThan(0);

    // Check for specific panels
    const batchPanel = Array.from(panels).find(panel => 
      panel.querySelector('.collapsible-header').textContent.includes('Batch Records')
    );
    expect(batchPanel).toBeTruthy();
    
    const substitutionPanel = Array.from(panels).find(panel => 
      panel.querySelector('.collapsible-header').textContent.includes('Ingredient Substitutions')
    );
    expect(substitutionPanel).toBeTruthy();
    
    const costPanel = Array.from(panels).find(panel => 
      panel.querySelector('.collapsible-header').textContent.includes('Cost Calculation')
    );
    expect(costPanel).toBeTruthy();
    
    const adjustmentsPanel = Array.from(panels).find(panel => 
      panel.querySelector('.collapsible-header').textContent.includes('Adjustments')
    );
    expect(adjustmentsPanel).toBeTruthy();
    
    // Check for input controls
    const slider = rightColumn.querySelector('.slider-control');
    expect(slider).toBeTruthy();
    expect(slider.querySelector('label').textContent).toBe('Batch Size');
    
    const toggle = rightColumn.querySelector('.toggle-control');
    expect(toggle).toBeTruthy();
    expect(toggle.querySelector('label').textContent).toBe('Include Overhead Costs');
  });
});